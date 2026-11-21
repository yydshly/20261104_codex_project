import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from app_radar import store, research_store
from app_radar.research import analyze_research, build, collect_reviews, select_products
from app_radar.review_sources import normalize, fetch_reviews


ROOT=Path(__file__).resolve().parents[1]
RULES=json.loads((ROOT/'research_rules.json').read_text(encoding='utf-8'))


def product(app_id='1',country='us',platform='ios',gain=30):
    return {'app_id':app_id,'country':country,'platform':platform,'name':'Test product',
        'growing':True,'rating_delta_1d':3,'chart_moves':[{'chart':'top-free','rank':10,
        'previous_rank':10+gain,'rank_gain':gain,'status':'up'}], 'scenes':['文档处理'],
        'capabilities':[],'store_url':'https://apps.apple.com/us/app/id1','selection_reason':'test'}


def review(review_id='r1',score=1,body='It crashes when I open the PDF.',**kw):
    return {'platform':'ios','country':'us','app_id':'1','language':'en','review_id':review_id,
        'score':score,'title':'','body':body,'posted_at':'2026-11-21T12:00:00+00:00',
        'version':'1.0','source_url':'https://apps.apple.com/us/app/id1',
        'raw_path':'raw.json','observed_at':'2026-11-22T01:00:00+00:00',**kw}


def data(reviews):
    return {'run':{'date':'2026-11-22','growth_as_of':'2026-11-22','status':'ok',
        'started_at':'2026-11-22T01:00:00+00:00','selection':[product()], 'errors':[]},
        'reviews':reviews,'fetches':[{'app_id':'1','country':'us','status':'ok','error':None,
        'language':'en','page':1,'count':len(reviews),'invalid_count':0,'source_url':'https://apps.apple.com'}]}


class ResearchTests(unittest.TestCase):
    def test_real_review_shape_and_invalid_score_are_not_zero(self):
        row={'id':{'label':'r'},'im:rating':{'label':'2'},'content':{'label':'Broken'},
             'updated':{'label':'2026-11-21T08:00:00-07:00'}}
        result=normalize(row,'ios','1','us','en')
        self.assertEqual(result['score'],2)
        self.assertEqual(result['posted_at'],'2026-11-21T15:00:00+00:00')
        for score in (0,True,'unavailable',6):
            row['im:rating']['label']=score
            with self.assertRaises(ValueError):normalize(row,'ios','1','us','en')

    def test_source_empty_is_distinct_from_parser_failure(self):
        with patch('app_radar.review_sources.fetch_json',return_value={'feed':{}}):
            self.assertEqual(fetch_reviews(product(),'en')['reviews'],[])
        with patch('app_radar.review_sources.fetch_json',return_value={'other':{}}):
            with self.assertRaises(Exception):fetch_reviews(product(),'en')
        with patch('app_radar.review_sources.fetch_json',return_value={'feed':{'entry':[{'id':{'label':'bad'},'content':{'label':'missing score'}}]}}):
            with self.assertRaises(Exception):fetch_reviews(product(),'en')

    def test_selection_is_bounded_and_platform_specific(self):
        ps=[product(str(i),country) for i in range(1,9) for country in ('us','jp','gb','cn')]
        ps+=[product('play:'+str(i),country,'android') for i in range(1,9) for country in ('us','jp','gb')]
        before=copy.deepcopy(ps)
        selected=select_products(ps,{'max_per_platform':6,'watchlist':['1','play:1']})
        self.assertEqual(len(selected),12)
        self.assertEqual(len({(p['platform'],p['app_id']) for p in selected}),12)
        self.assertEqual(ps,before)
        self.assertTrue(all(p['growing'] for p in selected))

    def test_duplicate_pages_text_and_old_future_comments_do_not_inflate_pain(self):
        rows=[review(),review(),review('duplicate-text'),review('r2',body='PDF crashes every time.'),
              review('old',posted_at='2020-01-01T00:00:00+00:00'),
              review('future',posted_at='2026-11-23T00:00:00+00:00')]
        result=analyze_research(data(rows),{'lookback_days':90},RULES)
        p=result['products'][0]
        self.assertEqual(p['sample_count'],2)
        pain=next(t for t in p['pains'] if t['id']=='reliability')
        self.assertEqual(pain['count'],2)
        self.assertEqual(len(result['opportunities']),1)

    def test_positive_reviews_do_not_become_pain_and_low_star_not_validated_need(self):
        result=analyze_research(data([review('positive',5,'Easy to use PDF scanner.'),
                                     review('negative',1,'PDF crashes constantly.')]),{},RULES)
        p=result['products'][0]
        self.assertTrue(p['needs'])
        self.assertTrue(p['pains'])
        self.assertEqual(result['opportunities'],[])  # one complaint is only a case
        self.assertTrue(all('positive' not in t['review_ids'] for t in p['pains']))
        self.assertTrue(all('negative' not in t['review_ids'] for t in p['needs']))

    def test_local_negation_and_unmatched_low_reviews_remain_explicit(self):
        p=analyze_research(data([review(body='No ads. It never crashes. I dislike the colour.')]),{},RULES)['products'][0]
        self.assertFalse(p['pains'])
        self.assertEqual(p['unclassified_low_count'],1)

    def test_feature_requests_in_five_star_reviews_are_not_lost_or_counted_as_bad_reviews(self):
        rows=[review('a',5,'Great tool. I wish I could share multiple files at once.'),
              review('b',5,'Would be a good idea to allow multiple pictures per issue.')]
        result=analyze_research(data(rows),{},RULES);p=result['products'][0]
        self.assertEqual(p['low_star_count'],0)
        self.assertEqual(p['requests'][0]['count'],2)
        self.assertEqual(result['opportunities'][0]['feedback_type'],'功能请求（不限星级）')

    def test_store_rating_text_contradiction_does_not_invent_a_pain(self):
        p=analyze_research(data([review('a',1,'good')]),{},RULES)['products'][0]
        self.assertEqual(p['low_star_count'],1)
        self.assertEqual(p['pains'],[])

    def test_store_is_idempotent_retains_prior_day_and_no_destructive_migration(self):
        with tempfile.TemporaryDirectory() as directory:
            conn=store.connect(Path(directory)/'test.sqlite3');research_store.ensure_schema(conn)
            research_store.save(conn,'2026-11-21',[review()],'first.json','2026-11-21T12:00:00+00:00')
            research_store.save(conn,'2026-11-22',[review()],'second.json','2026-11-22T01:00:00+00:00')
            research_store.save(conn,'2026-11-22',[review(score=2,body='Edited review')],'third.json','2026-11-22T02:00:00+00:00')
            rows=conn.execute('SELECT observed_date,score,body FROM review_observations ORDER BY observed_date').fetchall()
            self.assertEqual(len(rows),2);self.assertEqual(rows[0]['score'],1);self.assertEqual(rows[1]['body'],'Edited review')
            self.assertEqual(conn.execute('PRAGMA integrity_check').fetchone()[0],'ok');conn.close()

    def test_partial_source_keeps_success_and_explicit_error(self):
        with tempfile.TemporaryDirectory() as directory:
            base=Path(directory);conn=store.connect(base/'radar.sqlite3')
            config={'reviews':{'enabled':True,'max_per_platform':1,'reviews_per_app':100},
                    'request_interval_seconds':0,'raw_directory':base/'raw'}
            payload={'source_url':'https://itunes.apple.com/us/rss/customerreviews/json',
                     'raw_data':{'feed':{}},'reviews':[review()], 'invalid_count':0}
            with patch('app_radar.review_sources.fetch_reviews',side_effect=[payload,RuntimeError('timeout')]):
                result=collect_reviews(conn,config,[product()],'2026-11-22')
            self.assertEqual(len(result['errors']),1)
            stored=research_store.load(conn,'2026-11-22')
            self.assertEqual(len(stored['reviews']),1)
            self.assertEqual(stored['run']['status'],'partial')
            conn.close()

    def test_chinese_and_japanese_pain_rules_produce_traceable_evidence(self):
        p=analyze_research(data([review('cn',body='软件经常闪退，文件打不开。'),
                                 review('jp',body='アプリが落ちる。不具合が多いです。')]),{},RULES)['products'][0]
        theme=next(t for t in p['pains'] if t['id']=='reliability')
        self.assertEqual(theme['count'],2)
        self.assertTrue(all(e['review_id'] and e['source_url'] for e in theme['evidence']))

    def test_brief_must_reference_this_product_and_this_sample(self):
        with tempfile.TemporaryDirectory() as directory:
            base=Path(directory);conn=store.connect(base/'radar.sqlite3')
            run_id=research_store.start(conn,'2026-11-22','2026-11-22',[product()],'2026-11-22T01:00:00+00:00')
            research_store.save(conn,'2026-11-22',[review()],'raw.json','2026-11-22T01:00:00+00:00')
            research_store.finish(conn,run_id,'2026-11-22T02:00:00+00:00','ok',[])
            brief={k:'test' for k in ('title','priority','finding','entry','mvp','validation','constraint')}
            brief.update(app_id='1',country='us',review_ids=['r1'])
            wrong={**brief,'review_ids':['not-in-this-sample']}
            (base/'research-briefs-2026-11-22.json').write_text(json.dumps({'briefs':[brief,wrong,{'title':'incomplete'}]}),encoding='utf-8')
            result=build(conn,{'directions_file':ROOT/'directions.json','reports_directory':base},'2026-11-22')
            self.assertEqual(len(result['briefs']),1)
            self.assertEqual(result['briefs'][0]['evidence'][0]['review_id'],'r1')
            self.assertTrue(result['errors']);conn.close()


if __name__=='__main__':unittest.main()
