import json
import socket
import time

import httpx
import pytest
from fastapi.testclient import TestClient

from casebook.app import create_app
from casebook.db import Database
from casebook.discovery import discover
from casebook.discovery_store import DiscoveryStore
from casebook.localize import ChineseTranslator
from casebook.network import CollectionError, PublicClient, RateLimitError
from casebook.public_products import BETALIST_FEED, PRODUCT_HUNT_FEED, atom_entries, betalist_products, hacker_news_products, product_hunt_products, website_candidate


ATOM = '''<feed xmlns="http://www.w3.org/2005/Atom"><entry>
<title>Demo Cloud – Team workspace</title><published>2026-11-20T08:00:00Z</published>
<link rel="alternate" href="https://betalist.com/startups/demo-cloud?utm_source=feed"/>
<content type="html">&lt;p&gt;A paid workspace for productive teams.&lt;/p&gt;</content>
</entry></feed>'''

PH_ATOM = '''<feed xmlns="http://www.w3.org/2005/Atom">
<entry><id>tag:www.producthunt.com,2005:Post/1001</id><title>Demo One</title>
<published>2026-11-20T08:00:00Z</published><link rel="alternate" href="https://www.producthunt.com/products/demo-one"/>
<content type="html">&lt;p&gt;A workspace for productive teams.&lt;/p&gt;&lt;p&gt;&lt;a href="https://www.producthunt.com/products/demo-one"&gt;Discussion&lt;/a&gt; | &lt;a href="https://www.producthunt.com/r/p/1001"&gt;Link&lt;/a&gt;&lt;/p&gt;</content></entry>
<entry><id>tag:www.producthunt.com,2005:Post/1002</id><title>Demo Two</title>
<published>2026-11-21T08:00:00Z</published><link rel="alternate" href="https://www.producthunt.com/products/demo-two"/>
<content type="html">&lt;p&gt;A second tool for business teams.&lt;/p&gt;</content></entry></feed>'''


class HuntSources:
    requested=[]
    def page(self,url):
        self.requested.append(url)
        assert url==PRODUCT_HUNT_FEED, 'RSS discovery must not retry protected product pages or shortlinks'
        return url,PH_ATOM
    def close(self):
        pass


class FreeSources:
    def __init__(self, limited_github=False):
        self.limited_github = limited_github

    def page(self, url):
        if url == BETALIST_FEED:
            return url, ATOM
        if 'hn.algolia.com/' in url:
            return url, json.dumps({'hits':[{'title':'Show HN: Demo Cloud – Team workspace',
                'url':'https://demo.example/', 'objectID':'1234', 'created_at':'2026-11-19T08:00:00Z', 'points':8}]})
        if '/startups/demo-cloud/visit' in url:
            return 'https://demo.example/?ref=betalist', '<main>Product landing page</main>'
        if url.endswith('/pricing'):
            return url, '<title>Pricing</title><main>Pricing plans for teams. Free trial available for all users. Professional plan $20 per month. Team plan $50 per month. Choose a plan to work together.</main>'
        if url.endswith('/blog'):
            return url, '<title>Blog</title><main>Guides for productive teams. Learn how to organize your work, automate repetitive tasks and keep your project on track with our workspace.</main>'
        return url, '<title>Demo Cloud</title><meta name="description" content="A paid workspace for productive teams."><main>Demo Cloud helps teams plan and organize their work in one shared workspace. Create projects, manage tasks and improve collaboration.<a href="/pricing">Pricing</a><a href="/blog">Blog</a></main>'

    def github(self, path):
        if self.limited_github:
            raise RateLimitError('2099-01-01T00:00:00+00:00')
        raise AssertionError('A website-only product must not require a GitHub request')

    def close(self):
        pass


@pytest.fixture
def dns(monkeypatch):
    original = socket.getaddrinfo
    monkeypatch.setattr('casebook.network.socket.getaddrinfo', lambda host,*a,**kw:
        [(socket.AF_INET,socket.SOCK_STREAM,6,'',('93.184.216.34',443))] if host=='demo.example' else original(host,*a,**kw))


def test_public_feeds_resolve_real_website_and_exclude_repository_links():
    client = FreeSources()
    beta = list(betalist_products(client, 1))[0]
    hn = list(hacker_news_products(client, 1))[0]
    assert beta['name'] == 'Demo Cloud' and beta['repository'] == ''
    assert beta['website'] == 'https://demo.example/'
    assert beta['source_url'] == 'https://betalist.com/startups/demo-cloud'
    assert hn['source_url'] == 'https://news.ycombinator.com/item?id=1234'
    assert hn['published_at'] != beta['published_at']
    for url in ['https://github.com/demo/cloud','https://example.github.io/demo','https://demo.example/blog/story','https://u:p@demo.example/','https://demo.example:8000/','https://personal.example/riemann']:
        assert website_candidate('Demo',url,'Tool','hacker_news','https://news.ycombinator.com/item?id=1') is None
    with pytest.raises(CollectionError):
        list(atom_entries('<html>blocked</html>'))
    with pytest.raises(CollectionError):
        list(atom_entries('<!DOCTYPE feed [<!ENTITY x "bad">]><feed/>'))


def test_product_hunt_public_feed_preserves_tagline_date_and_separate_product_identity():
    HuntSources.requested=[]
    items=list(product_hunt_products(HuntSources(),1))
    assert len(items)==2 and items[0]['identity']!=items[1]['identity']
    assert items[0]['description']=='A workspace for productive teams.'
    assert items[0]['published_at']=='2026-11-20T08:00:00Z'
    assert items[0]['metadata']['feed_entry_id'].endswith('/1001')
    assert items[0]['metadata']['website_status']=='unconfirmed'
    assert HuntSources.requested==[PRODUCT_HUNT_FEED]
    class Invalid(HuntSources):
        def page(self,url):
            return url,PH_ATOM.replace('https://www.producthunt.com/products/demo-one','https://evil.example/products/demo-one')
    assert list(product_hunt_products(Invalid(),1))[0] is None


def test_product_hunt_rss_briefs_and_later_website_enrichment_preserve_original_version(tmp_path,monkeypatch,dns):
    monkeypatch.setattr('casebook.discovery.PublicClient',HuntSources)
    monkeypatch.setattr('casebook.collect.PublicClient',FreeSources)
    monkeypatch.setattr('casebook.worker.resolve_product_website',lambda *a,**kw:{'status':'unresolved','message':'测试公开线索不足','attempts':[],'evidence':[]})
    monkeypatch.setattr(ChineseTranslator,'available',lambda self:True)
    monkeypatch.setattr(ChineseTranslator,'translate',lambda self,text:'中文译文：团队在线协作工具。')
    monkeypatch.delenv('CASEBOOK_OLLAMA_MODEL',raising=False)
    app=create_app(tmp_path/'hunt.sqlite3',start_worker=False)
    with TestClient(app) as client:
        client.put('/api/discovery/settings',json={'enabled':False,'batch_size':2,'enabled_sources':['product_hunt']})
        client.post('/api/discovery/runs')
        app.state.worker.start()
        try:
            for _ in range(100):
                items=client.get('/api/projects').json()['items']
                if len(items)==2:break
                time.sleep(.02)
            assert len(items)==2 and all(x['coverage']=='listing_only' for x in items)
            assert len({x['identity'] for x in items})==2
            assert all(x['description_zh'] for x in items)
            project_id=items[0]['id']
            brief=client.get('/api/projects/'+project_id).json()['report']
            assert len(brief['sources'])==1 and brief['sources'][0]['kind']=='listing'
            assert brief['coverage']=='listing_only' and '尚未取得' in brief['summary']
            assert any('已确认的产品官网' in gap for gap in brief['gaps'])
            assert brief['sources'][0]['metadata']['transport']=='public_atom'
            assert client.post('/api/projects/'+project_id+'/website',json={'url':'http://127.0.0.1/'}).status_code==422
            assert client.post('/api/projects/'+project_id+'/website',json={'url':'https://demo.example/'}).status_code==202
            for _ in range(100):
                full=client.get('/api/projects/'+project_id).json()['report']
                if full['version']==2:break
                time.sleep(.02)
            assert full['version']==2 and full['coverage']=='website'
            assert any(s['kind']=='website' for s in full['sources'])
            assert any(s['kind']=='pricing' for s in full['sources'])
            assert any(s['kind']=='listing' for s in full['sources'])
            assert client.get('/api/projects/'+project_id+'?version=1').json()['report']==brief
            assert client.get('/api/projects/'+project_id+'/report.json?version=1').json()==brief
            # One URL cannot silently merge a second product or overwrite the first report.
            other=next(x['id'] for x in items if x['id']!=project_id)
            assert client.post('/api/projects/'+other+'/website',json={'url':'https://demo.example/'}).status_code==409
        finally:app.state.worker.stop()


def test_missing_external_website_is_not_collected_as_directory():
    class Blocked(FreeSources):
        def page(self, url):
            if '/visit' in url:
                raise CollectionError('来源返回 HTTP 403')
            return super().page(url)
    result = list(betalist_products(Blocked(),1))
    assert result[0]['discovery_error']
    assert 'website' not in result[0]


def test_directory_rate_limit_stops_hydration_instead_of_retrying_each_entry():
    class Limited(FreeSources):
        calls=0
        def page(self,url):
            if '/visit' in url:
                self.calls+=1
                raise RateLimitError('2099-01-01T00:00:00+00:00')
            return super().page(url)
    client=Limited()
    with pytest.raises(RateLimitError):
        list(betalist_products(client,1))
    assert client.calls==1


def test_cross_source_dedupe_preserves_both_origins_without_empty_repo_collision(tmp_path,dns):
    db=Database(tmp_path/'origins.sqlite3')
    store=DiscoveryStore(db)
    beta=list(betalist_products(FreeSources(),1))[0]
    hn=list(hacker_news_products(FreeSources(),1))[0]
    assert store.remember(beta)==store.remember(hn)
    second=website_candidate('Other','https://second.example/','Another paid tool','betalist','https://betalist.com/startups/other')
    store.remember(second)
    assert len(store.pending(['betalist','hacker_news']))==2
    store.configure(False,1,24,['betalist','hacker_news'])
    store.enqueue()
    run=store.claim()
    assert store.queue_candidate(beta,'demo.example',beta['website'],run)=='queued'
    task=db.list_tasks()[0]
    assert len(store.origins_for_project(task['project_id']))==2
    # Another existing project with an empty GitHub field does not match every website.
    assert db.project(task['project_id'])['github']==''


def test_github_cooldown_does_not_block_free_commercial_sources(tmp_path,dns):
    store=DiscoveryStore(Database(tmp_path/'isolated.sqlite3'))
    store.configure(False,2,24,['github','betalist','hacker_news'])
    store.enqueue()
    discover(store,store.claim(),FreeSources(limited_github=True))
    snapshot=store.snapshot()
    assert snapshot['runs'][0]['status']=='completed'
    assert snapshot['runs'][0]['queued']==1
    assert {s['source_kind']:s['status'] for s in snapshot['runs'][0]['source_stats']}=={'github':'cooldown','betalist':'ok','hacker_news':'ok'}
    assert store.enqueue()[1]  # other selected sources remain available
    # Restricting the next run to the cooled source produces a clear retry response.
    active=store.claim()
    store.finish(active,{'scanned':0,'accepted':0,'queued':0,'duplicates':0},[])
    store.configure(False,2,24,['github'])
    with pytest.raises(CollectionError,match='冷却'):
        store.enqueue()


def test_website_only_discovery_to_chinese_report_with_public_launch_evidence(tmp_path,monkeypatch,dns):
    monkeypatch.setattr('casebook.discovery.PublicClient',FreeSources)
    monkeypatch.setattr('casebook.collect.PublicClient',FreeSources)
    monkeypatch.setattr(ChineseTranslator,'available',lambda self:True)
    monkeypatch.setattr(ChineseTranslator,'translate',lambda self,text:'中文译文：团队在线协作工具。')
    monkeypatch.delenv('CASEBOOK_OLLAMA_MODEL',raising=False)
    app=create_app(tmp_path/'commercial.sqlite3',start_worker=False)
    with TestClient(app) as client:
        assert client.put('/api/discovery/settings',json={'enabled':False,'batch_size':2,'enabled_sources':[]}).status_code==422
        assert client.put('/api/discovery/settings',json={'enabled':False,'batch_size':2,'enabled_sources':['unknown']}).status_code==422
        client.put('/api/discovery/settings',json={'enabled':False,'batch_size':2,'enabled_sources':['betalist','hacker_news']})
        client.post('/api/discovery/runs')
        app.state.worker.start()
        try:
            for _ in range(100):
                items=client.get('/api/projects').json()['items']
                if items:break
                time.sleep(.02)
            assert len(items)==1 and items[0]['github']=='' and items[0]['listing_count']==2
            assert items[0]['description_zh']=='中文译文：团队在线协作工具。'
            report=client.get('/api/projects/'+items[0]['id']).json()['report']
            assert len(report['sections'])==8
            assert not any(s['kind']=='repository' for s in report['sources'])
            listings=[s for s in report['sources'] if s['kind']=='listing']
            assert len(listings)==2 and {s['metadata']['source_kind'] for s in listings}=={'betalist','hacker_news'}
            actions=[a for a in report['actions'] if a['channel']=='产品发布']
            assert {a['date'] for a in actions}=={'2026-11-19','2026-11-20'}
            assert all('不能直接视为产品首次上线日期' in a['description'] for a in actions)
            assert client.get('/api/projects?channel=产品发布').json()['items']
            assert client.get('/api/projects/'+items[0]['id']+'/report.json').json()==report
            # False positives can be excluded and restored without deleting their reports.
            app.state.database.set_project_hidden(items[0]['id'],'个人演示页，暂不纳入商业产品库')
            assert client.get('/api/projects').json()['items']==[]
            assert client.get('/api/projects/'+items[0]['id']).json()['report']==report
            app.state.database.set_project_hidden(items[0]['id'],'')
            assert len(client.get('/api/projects').json()['items'])==1
        finally:app.state.worker.stop()


def test_redirect_checks_destination_robots_before_fetching_content(monkeypatch):
    monkeypatch.setattr('casebook.network.public_url',lambda url:url)
    seen=[]
    def handle(request):
        seen.append(str(request.url))
        if request.url.host=='directory.example' and request.url.path=='/robots.txt':
            return httpx.Response(200,text='User-agent: *\nAllow: /')
        if request.url.host=='directory.example':
            return httpx.Response(302,headers={'location':'https://product.example/private'})
        if request.url.path=='/robots.txt':
            return httpx.Response(200,text='User-agent: *\nDisallow: /private')
        raise AssertionError('Disallowed target page must never be requested')
    client=PublicClient()
    client.client.close()
    client.client=httpx.Client(transport=httpx.MockTransport(handle))
    try:
        with pytest.raises(CollectionError,match='robots.txt'):
            client.page('https://directory.example/visit')
        assert 'https://product.example/private' not in seen
    finally:client.close()


def test_legacy_candidate_migration_preserves_project_task_and_settings(tmp_path):
    db=Database(tmp_path/'legacy.sqlite3')
    task,_=db.enqueue('demo.example','https://demo.example/','Demo','软件工具','demo/product')
    with db.connect() as connection:
        connection.execute('''CREATE TABLE discovery_candidates (
            repository TEXT PRIMARY KEY,identity TEXT NOT NULL,name TEXT NOT NULL,website TEXT NOT NULL,
            description TEXT NOT NULL,category TEXT NOT NULL,source_url TEXT NOT NULL,status TEXT NOT NULL,
            reason TEXT NOT NULL,project_id TEXT,task_id TEXT,first_seen TEXT NOT NULL,last_seen TEXT NOT NULL)''')
        connection.execute('INSERT INTO discovery_candidates VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
            ('demo/product','demo.example','Demo','https://demo.example/','Original description','软件工具',
             'https://github.com/search?q=demo','queued','Original reason',task['project_id'],task['id'],'2026-11-20','2026-11-20'))
        connection.execute('''CREATE TABLE discovery_settings (id INTEGER PRIMARY KEY,enabled INTEGER,
            batch_size INTEGER,interval_hours INTEGER,next_run_at TEXT,cooldown_until TEXT)''')
        connection.execute("INSERT INTO discovery_settings VALUES(1,1,3,72,'2099-01-01T00:00:00+00:00',NULL)")
    store=DiscoveryStore(db)
    item=store.snapshot()['candidates'][0]
    assert item['candidate_key']=='github:demo/product' and item['repository']=='demo/product'
    assert item['project_id']==task['project_id'] and item['task_id']==task['id']
    assert item['description']=='Original description' and item['reason']=='Original reason'
    assert store.settings()['enabled'] and store.settings()['interval_hours']==72
    assert store.settings()['enabled_sources']==['github']
    assert len(DiscoveryStore(Database(db.path)).snapshot()['candidates'])==1
    with db.connect() as connection:
        assert connection.execute('SELECT count(*) FROM discovery_candidates_v1').fetchone()[0]==1
