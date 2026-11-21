import tempfile
import unittest
from pathlib import Path
from app_radar.google_play import normalize
from app_radar.analysis import analyze
from app_radar import store
from app_radar.report import _safe_url


class AndroidTests(unittest.TestCase):
    def test_missing_ratings_stay_unknown_and_zero_is_real(self):
        self.assertIsNone(normalize({'appId':'com.example.app','title':'App'},'us')['rating_count'])
        self.assertEqual(normalize({'appId':'com.example.app','title':'App','ratings':0},'us')['rating_count'],0)
        self.assertIsNone(normalize({'appId':'com.example.app','title':'App','ratings':True},'us')['rating_count'])

    def test_public_google_link_allowed_but_lookalike_rejected(self):
        self.assertTrue(_safe_url('https://play.google.com/store/apps/details?id=com.example.app'))
        self.assertEqual(_safe_url('https://play.google.com.evil.test/'),'')

    def test_package_namespace_and_store_country(self):
        app=normalize({'appId':'com.example.app','title':'App','ratings':20},'jp')
        self.assertEqual(app['app_id'],'play:com.example.app')
        self.assertIn('gl=jp',app['store_url'])
        with self.assertRaises(ValueError): normalize({'appId':'../bad','title':'Bad'},'us')

    def test_platforms_do_not_share_rank_baseline_or_direction_denominator(self):
        snapshots=[{'date':d,'country':'us','app_id':app,'name':'Same name','direction':'工具','rating_count':n}
          for app in ['123','play:com.example.app'] for d,n in [('2026-11-14',100),('2026-11-15',110)]]
        charts=[{'date':d,'country':'us','app_id':app,'chart':chart,'rank':rank}
          for app,chart in [('123','top-free'),('play:com.example.app','android-top-free')]
          for d,rank in [('2026-11-14',20),('2026-11-15',10)]]
        status=[{'date':d,'country':'us','chart':chart,'status':'ok','count':100}
          for d in ['2026-11-14','2026-11-15'] for chart in ['top-free','android-top-free']]
        r=analyze({'as_of':'2026-11-15','snapshots':snapshots,'charts':charts,'chart_status':status})
        self.assertEqual({p['platform'] for p in r['products']},{'ios','android'})
        self.assertEqual(len(r['directions']),2)
        self.assertTrue(all(d['sample_count']==1 for d in r['directions']))
        self.assertTrue(all(p['chart_moves'][0]['rank_gain']==10 for p in r['products']))

    def test_android_first_day_does_not_use_ios_history(self):
        r=analyze({'as_of':'2026-11-15','snapshots':[
            {'date':'2026-11-14','country':'us','app_id':'1','name':'Same','rating_count':100},
            {'date':'2026-11-15','country':'us','app_id':'play:com.example.app','name':'Same','rating_count':150}]})
        self.assertIsNone(r['products'][0]['rating_delta_1d'])
        self.assertFalse(r['products'][0]['growing'])

    def test_tracking_lists_are_platform_specific(self):
        with tempfile.TemporaryDirectory() as tmp:
            conn=store.connect(Path(tmp)/'db.sqlite3')
            with conn:
                for app in ['123','play:com.example.app']:
                    conn.execute('INSERT INTO tracked VALUES(?,?,?,?)',('us',app,'2026-11-15','{"app_id":"'+app+'"}'))
            ios,_=store.tracked_apps(conn,'us','2026-11-15',30,1000,platform='ios')
            android,_=store.tracked_apps(conn,'us','2026-11-15',30,1000,platform='android')
            self.assertEqual([a['app_id'] for a in ios],['123'])
            self.assertEqual([a['app_id'] for a in android],['play:com.example.app'])
            conn.close()
