import sqlite3
import unittest
from app_radar.trends import build, seven_day_ratings


class TrendTests(unittest.TestCase):
    def setUp(self):
        self.conn = sqlite3.connect(':memory:')
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript('''
          CREATE TABLE snapshots(date,country,app_id,detail_status,rating_count);
          CREATE TABLE chart_status(date,country,chart,status,count);
          CREATE TABLE charts(date,country,app_id,chart,rank);
        ''')

    def tearDown(self):
        self.conn.close()

    def test_calendar_gaps_rating_corrections_and_market_isolation(self):
        self.conn.executemany('INSERT INTO snapshots VALUES(?,?,?,?,?)', [
            ('2026-11-19','us','1','ok',100),
            ('2026-11-21','us','1','ok',140),
            ('2026-11-22','us','1','ok',130),
            ('2026-11-23','us','1','ok',135),
            ('2026-11-22','gb','1','ok',999),
            ('2026-11-24','us','1','ok',500)])
        ps=[{'platform':'ios','country':c,'app_id':'1'} for c in ('us','gb')]
        result=build(self.conn,'2026-11-23',ps)
        us,gb=[s['observations'] for s in result['series']]
        self.assertEqual([r['rating_count'] for r in us],[100,None,140,130,135])
        self.assertEqual([r['rating_delta_1d'] for r in us],[None,None,None,None,5])
        self.assertEqual([r['rating_delta_status'] for r in us],
                         ['previous_missing','current_missing','previous_missing','count_decreased','ok'])
        self.assertEqual(gb[-2]['rating_count'],999)
        self.assertEqual(result['end'],'2026-11-23')

    def test_short_chart_absence_and_failed_chart_with_stale_rank_are_distinct(self):
        self.conn.executemany('INSERT INTO chart_status VALUES(?,?,?,?,?)', [
            ('2026-11-21','us','top-free','ok',100),
            ('2026-11-21','us','top-paid','ok',6),
            ('2026-11-22','us','top-free','error',100)])
        self.conn.execute('INSERT INTO charts VALUES(?,?,?,?,?)',('2026-11-22','us','1','top-free',2))
        rows=build(self.conn,'2026-11-22',[{'platform':'ios','country':'us','app_id':'1'}])['series'][0]['observations']
        self.assertEqual(rows[0]['free_status'],'off_chart')
        self.assertEqual(rows[0]['paid_status'],'not_returned')
        self.assertEqual(rows[1]['free_status'],'missing')
        self.assertIsNone(rows[1]['free_rank'])

    def test_android_namespace_and_window_bounds(self):
        for app,chart in [('1','top-free'),('play:1','android-top-free')]:
            self.conn.execute('INSERT INTO chart_status VALUES(?,?,?,?,?)',('2026-10-01','jp',chart,'ok',100))
            self.conn.execute('INSERT INTO chart_status VALUES(?,?,?,?,?)',('2026-11-22','jp',chart,'ok',100))
            self.conn.execute('INSERT INTO charts VALUES(?,?,?,?,?)',('2026-11-22','jp',app,chart,3 if app=='1' else 8))
        ps=[{'platform':p,'country':'jp','app_id':a} for p,a in [('ios','1'),('android','play:1')]]
        result=build(self.conn,'2026-11-22',ps,window_days=7)
        self.assertLessEqual(len(result['dates']),7)
        self.assertEqual([s['observations'][-1]['free_rank'] for s in result['series']],[3,8])

    def test_period_pool_includes_departed_products_without_current_snapshot(self):
        self.conn.execute('ALTER TABLE snapshots ADD COLUMN name')
        self.conn.execute('INSERT INTO snapshots VALUES(?,?,?,?,?,?)',('2026-11-20','us','retired','ok',10,'Historical App'))
        self.conn.executemany('INSERT INTO chart_status VALUES(?,?,?,?,?)',[
            ('2026-11-20','us','top-free','ok',100),
            ('2026-11-21','us','top-free','error',0),
            ('2026-11-22','us','top-free','ok',100)])
        self.conn.execute('INSERT INTO charts VALUES(?,?,?,?,?)',('2026-11-20','us','retired','top-free',2))
        self.conn.execute('INSERT INTO charts VALUES(?,?,?,?,?)',('2026-11-21','us','stale-only','top-free',1))
        result=build(self.conn,'2026-11-22',[])
        self.assertEqual([p['app_id'] for p in result['series']],['retired'])
        old=result['series'][0]
        self.assertEqual(old['name'],'Historical App')
        self.assertFalse(old['in_current_report'])
        self.assertEqual(old['observations'][-1]['free_status'],'off_chart')
        self.assertEqual(old['observations'][-2]['free_status'],'missing')

    def test_seven_day_sum_reports_partial_coverage_without_filling_gaps(self):
        result=seven_day_ratings([
            {'date':'2026-11-16','rating_delta_1d':10,'rating_delta_status':'ok'},
            {'date':'2026-11-18','rating_delta_1d':0,'rating_delta_status':'ok'},
            {'date':'2026-11-19','rating_delta_1d':None,'rating_delta_status':'count_decreased'},
            {'date':'2026-11-22','rating_delta_1d':5,'rating_delta_status':'ok'}],'2026-11-22')
        self.assertEqual(result['sum'],15)
        self.assertEqual(result['valid_days'],3)
        self.assertEqual(result['expected_days'],7)
        self.assertFalse(result['complete'])
        self.assertEqual(result['excluded_days'],{'no_observation':3,'count_decreased':1})
        self.assertEqual((result['start'],result['end']),('2026-11-16','2026-11-22'))

    def test_empty_week_is_missing_but_full_zero_week_is_zero(self):
        empty=seven_day_ratings([],'2026-11-22')
        self.assertIsNone(empty['sum']);self.assertEqual(empty['valid_days'],0)
        zero=seven_day_ratings([{'date':f'2026-11-{d}','rating_delta_1d':0} for d in range(16,23)],'2026-11-22')
        self.assertEqual(zero['sum'],0);self.assertTrue(zero['complete'])
