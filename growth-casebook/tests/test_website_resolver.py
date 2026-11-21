import json
import socket
import time
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from casebook.app import create_app
from casebook.db import Database
from casebook.discovery_store import DiscoveryStore
from casebook.localize import ChineseTranslator
from casebook.network import CollectionError
from casebook.public_products import PRODUCT_HUNT_FEED
from casebook.website_resolver import resolve_product_website, website_address
from casebook.collect import source
from casebook.models import Collection
from casebook.report import build_report
from test_public_products import PH_ATOM, HuntSources, FreeSources


@pytest.fixture(autouse=True)
def public_dns(monkeypatch):
    original = socket.getaddrinfo
    monkeypatch.setattr('casebook.network.socket.getaddrinfo',lambda host,*a,**kw:
        [(socket.AF_INET,socket.SOCK_STREAM,6,'',('93.184.216.34',443))] if host.endswith('.example') else original(host,*a,**kw))


def record(name='Hollr',slug='hollr-3',description='Push-to-talk for your family, on iPhone and Apple Watch'):
    return {'name':name,'website':'https://www.producthunt.com/products/'+slug}, {
        'source_url':'https://www.producthunt.com/products/'+slug,'description':description,'metadata':{}}


def directory(name,slug,description,url=None):
    app={'@type':'SoftwareApplication','name':name,'description':description,'url':url or 'https://www.producthunt.com/r/blocked'}
    return '<main><a href="https://www.producthunt.com/products/'+slug+'">PH</a><script type="application/ld+json">'+json.dumps(app)+'</script><p><a href="https://advertiser.example/">Sponsor</a></p></main>'


class AppleLookup:
    def __init__(self,backlink=True):
        self.calls=[]
        self.backlink=backlink

    def page(self,url):
        self.calls.append(url)
        if 'hunted.space' in url:
            return url,directory('Hollr','hollr-3','A family walkie-talkie for iPhone and Apple Watch.')
        if 'maker.example' in url:
            return url,'<title>Hollr: Family Walkie-Talkie</title><main>Hollr sends push-to-talk messages to your family on iPhone and Apple Watch. Hold one button to talk to everyone.</main>'+('<a href="https://apps.apple.com/us/app/family/id1234">Download</a>' if self.backlink else '')
        if 'advertiser.example' in url:
            return url,'<title>Advertising</title><main>Advertising service for business teams.</main>'
        raise CollectionError('来源返回 HTTP 403')

    def fetch(self,url,**kw):
        self.calls.append(url)
        if 'itunes.apple.com' in url:
            return url,json.dumps({'results':[
                {'trackId':55,'trackName':'Hollr: Local Events','sellerUrl':'https://wrong.example/','description':'Find local businesses, music, markets and family events.'},
                {'trackId':1234,'trackName':'Hollr: Family Walkie-Talkie','sellerUrl':'https://maker.example/hollr','description':'Push-to-talk family messages on iPhone and Apple Watch.'}]})
        return url,'{"hits":[]}'

    def close(self):
        pass


def test_apple_developer_link_requires_matching_function_and_return_link_and_keeps_path():
    client=AppleLookup()
    result=resolve_product_website(*record(),client=client)
    assert result['status']=='confirmed'
    assert result['website']=='https://maker.example/hollr'
    assert result['identity']=='maker.example/hollr'
    assert result['method']=='apple_developer_website'
    assert not any('wrong.example' in url for url in client.calls)
    assert any('id1234' in item['url'] for item in result['evidence'])
    assert result['evidence'][-1]['matched_terms']


def test_search_hit_and_name_alone_do_not_confirm_website():
    client=AppleLookup(backlink=False)
    result=resolve_product_website(*record(),client=client)
    assert result['status']=='unresolved' and result['website'] is None
    assert any('缺少官网回链' in item['message'] for item in result['attempts'])
    assert not any('wrong.example' in url for url in client.calls)


def test_two_different_websites_with_matching_evidence_remain_unresolved():
    class Conflicting(AppleLookup):
        def fetch(self,url,**kw):
            if 'itunes.apple.com' in url:
                return url,json.dumps({'results':[{'trackId':app_id,'trackName':'Hollr: Family Walkie-Talkie',
                    'sellerUrl':'https://'+host+'/hollr','description':'Push-to-talk family messages on iPhone and Apple Watch.'}
                    for app_id,host in [(1234,'maker.example'),(5678,'other.example')]]})
            return super().fetch(url,**kw)
        def page(self,url):
            if 'other.example' in url:
                return url,'<title>Hollr: Family Walkie-Talkie</title><main>Push-to-talk for family on iPhone and Apple Watch.</main><a href="https://apps.apple.com/us/app/id5678">App</a>'
            return super().page(url)
    result=resolve_product_website(*record(),client=Conflicting())
    assert result['status']=='unresolved' and result['website'] is None
    assert '多个' in result['message']


def test_wrong_directory_identity_and_ad_links_cannot_resolve_product():
    class Wrong(AppleLookup):
        def page(self,url):
            if 'hunted.space' in url:
                return url,directory('Other Product','other-product','Different tool','https://wrong.example/')
            return super().page(url)
        def fetch(self,url,**kw):
            self.calls.append(url)
            return url,'{"results":[],"hits":[]}'
    client=Wrong()
    result=resolve_product_website(*record(),client=client)
    assert result['status']=='unresolved'
    assert not any('wrong.example' in url or 'advertiser.example' in url for url in client.calls)


def test_private_or_directory_addresses_cannot_be_adopted():
    for url in ['http://127.0.0.1/','https://www.producthunt.com/products/demo','https://apps.apple.com/us/app/id123','https://user:password@maker.example/','https://maker.example:8000/']:
        with pytest.raises(CollectionError):website_address(url)
    assert website_address('https://maker.example/hollr?ref=ph#start')==('maker.example/hollr','https://maker.example/hollr')


def test_resolution_and_project_identity_commit_only_with_current_task_and_no_duplicate(tmp_path):
    db=Database(tmp_path/'conflict.sqlite3')
    DiscoveryStore(db)
    task,_=db.enqueue('producthunt:products/demo','https://www.producthunt.com/products/demo','Demo','软件工具','')
    job=db.claim()
    db.enqueue('maker.example','https://maker.example/','Other','软件工具','')
    collection=Collection(name='Demo',description='Workspace for teams',website='https://maker.example/',
        sources=[source('website','Demo','https://maker.example/','Workspace for teams')],warnings=[],discovered_accounts=[],
        website_resolution={'status':'confirmed','identity':'maker.example','website':'https://maker.example/'})
    report=build_report(task['project_id'],collection)
    assert db.publish(task['id'],job['attempt']+1,collection,report) is False
    with pytest.raises(ValueError,match='未合并产品'):
        db.publish(task['id'],job['attempt'],collection,report)
    assert db.project(task['project_id'])['identity']=='producthunt:products/demo'
    assert db.website_resolution(task['project_id'])=={}
    assert db.versions(task['project_id'])==[]


def test_homepage_pricing_is_reported_without_inventing_an_independent_pricing_page():
    collection=Collection(name='Hollr',description='Family walkie-talkie',website='https://maker.example/hollr',
        sources=[source('website','Hollr','https://maker.example/hollr','Free plan $0. Family plan $2.99 a month or $19.99 a year.')],warnings=[],discovered_accounts=[])
    report=build_report('demo',collection)
    business=next(s for s in report.sections if s.id=='business')
    assert any('$2.99' in f.text for f in business.facts)
    assert all(f.source_ids==[collection.sources[0].id] for f in business.facts)
    assert '本轮未取得独立定价页' in business.intro
    assert '可解析的定价页' not in report.gaps


def test_automatic_discovery_respects_schedule_with_timezone_offsets(tmp_path):
    db=Database(tmp_path/'schedule.sqlite3')
    store=DiscoveryStore(db)
    store.configure(True,1,24,['product_hunt'])
    local_zone=timezone(timedelta(hours=8))
    for offset,expected in [(1,False),(-1,True)]:
        due=(datetime.now(local_zone)+timedelta(hours=offset)).isoformat(timespec='seconds')
        with db.connect() as connection:connection.execute('UPDATE discovery_settings SET next_run_at=?',(due,))
        assert store.enqueue('scheduled',due_only=True)[1] is expected


class DirectoryLookup(FreeSources):
    def page(self,url):
        if url==PRODUCT_HUNT_FEED:return url,PH_ATOM
        if 'hunted.space' in url:
            slug=url.rsplit('/',1)[-1]
            if slug=='demo-one':return url,directory('Demo One','demo-one','A workspace for productive teams.','https://demo.example/')
            raise CollectionError('来源返回 HTTP 404')
        if 'advertiser.example' in url:raise CollectionError('Not this product')
        final,html=super().page(url)
        return final,html.replace('Demo Cloud','Demo One')+'<a href="https://www.producthunt.com/products/demo-one">Our launch</a>'
    def fetch(self,url,**kw):return url,'{"hits":[],"results":[]}'


def wait_for(client,predicate):
    for _ in range(250):
        items=client.get('/api/projects').json()['items']
        if predicate(items):return items
        time.sleep(.02)
    pytest.fail('Background reports did not finish')


def test_existing_briefs_automatically_enrich_on_idle_without_manual_url_and_preserve_versions(tmp_path,monkeypatch):
    monkeypatch.setattr('casebook.discovery.PublicClient',HuntSources)
    monkeypatch.setattr('casebook.website_resolver.PublicClient',DirectoryLookup)
    monkeypatch.setattr('casebook.collect.PublicClient',DirectoryLookup)
    monkeypatch.setattr(ChineseTranslator,'available',lambda self:True)
    monkeypatch.setattr(ChineseTranslator,'translate',lambda self,text:'中文译文：团队在线协作工具。')
    monkeypatch.delenv('CASEBOOK_OLLAMA_MODEL',raising=False)
    real_resolver=resolve_product_website
    monkeypatch.setattr('casebook.worker.resolve_product_website',lambda *a,**kw:{'status':'unresolved','attempts':[],'evidence':[]})
    app=create_app(tmp_path/'auto.sqlite3',start_worker=False)
    with TestClient(app) as client:
        client.put('/api/discovery/settings',json={'enabled':False,'batch_size':2,'enabled_sources':['product_hunt']})
        client.post('/api/discovery/runs')
        app.state.worker.start()
        try:
            items=wait_for(client,lambda items:len(items)==2)
            first=next(item for item in items if item['name']=='Demo One')
            original=client.get('/api/projects/'+first['id']).json()['report']
            assert original['coverage']=='listing_only'
            # Simulate pre-existing briefs becoming due after the new resolver is installed.
            with app.state.database.connect() as con:con.execute("UPDATE website_resolutions SET next_retry_at='2020-01-01'")
            monkeypatch.setattr('casebook.worker.resolve_product_website',real_resolver)
            client.put('/api/discovery/settings',json={'enabled':True,'batch_size':2,'enabled_sources':['product_hunt']})
            items=wait_for(client,lambda items:any(item['name']=='Demo One' and item['version']==2 for item in items))
            full=client.get('/api/projects/'+first['id']).json()['report']
            assert full['coverage']=='website' and len(full['sections'])==8
            assert full['website_resolution']['status']=='confirmed'
            assert full['website_resolution']['method']=='public_directory'
            assert {'website','pricing','content','listing'}<={source['kind'] for source in full['sources']}
            assert client.get('/api/projects/'+first['id']+'?version=1').json()['report']==original
            assert client.get('/api/projects/'+first['id']+'/report.json').json()==full
            for _ in range(100):
                if not any(t['status'] in {'running','queued'} for t in client.get('/api/tasks').json()['items']):break
                time.sleep(.02)
            assert len(client.get('/api/tasks').json()['items'])==4
            assert app.state.worker.discovery.enqueue_website_backfill()==0
            # A new store instance also honors persisted retry reservations.
            assert DiscoveryStore(Database(app.state.database.path)).enqueue_website_backfill()==0
            candidates=client.get('/api/discovery').json()['candidates']
            resolved=next(item for item in candidates if item['name']=='Demo One')
            assert resolved['identity']=='demo.example' and resolved['website_resolution']['status']=='confirmed'
        finally:app.state.worker.stop()
