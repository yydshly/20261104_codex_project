import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const files=['data','ai-data','ai-reading','ai-core','journey-data','ai-expansion','computing-data','education-data','llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog','navigation-data','navigation','roam-data','roam','llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','explore','journey'];
function loadSite() {
  const writes=[],sandbox={
    window:{},URLSearchParams,
    document:{addEventListener(){}},
    localStorage:{getItem(){return null;},setItem(key,value){writes.push({key,value});}}
  };
  for(const file of files)vm.runInNewContext(fs.readFileSync(new URL(`../dist/${file}.js`,import.meta.url),'utf8'),sandbox);
  return {...sandbox.window,writes};
}
const site=loadSite(),{COGNITION:nav,JOURNEY:journey,JOURNEY_CATALOG:catalog,AI_ATLAS_DATA:ai}=site;
const decode=value=>value.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const anchors=html=>Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g),m=>({
  attributes:m[1],href:decode(m[1].match(/\bhref="([^"]+)"/)?.[1] || ''),
  back:decode(m[1].match(/\bdata-return="([^"]+)"/)?.[1] || ''),body:m[2]
}));
function validTarget(href) {
  assert.ok(href.startsWith('#'),href);
  if(href.startsWith('#topic/')){
    assert.match(href,/^#topic\/[a-z-]+$/,href);
    assert.ok(ai.topics.some(t=>href==='#topic/'+t.id),href);
    return;
  }
  const route=journey.route(href);
  assert.ok(route,href);
  assert.notEqual(route.kind,'missing',href);
  if(route.kind==='domain' && route.q.has('direction')){
    assert.ok(nav.branches(route.id).some(b=>b.id===route.q.get('direction')),href);
  }
}

test('四个领域有可进入的方向，每个方向都有深入路径、随用基础、关联理由与覆盖边界',()=>{
  for(const [domainId,count] of [['ai',8],['information',6],['computing',4],['education',4]]){
    const list=nav.branches(domainId);
    assert.equal(list.length,count,domainId);
    for(const b of list){
      assert.ok(b.outcome && b.contains.length && b.frontier,b.id);
      assert.ok(b.steps.length>=2,b.id);
      assert.ok(b.foundations.length>=1,b.id);
      assert.ok(b.neighbors.length>=2,b.id);
      for(const step of b.steps){assert.ok(step.level && step.reason,step.href);validTarget(step.href);}
      for(const f of b.foundations){assert.ok(f.explanation && f.reason,f.href);validTarget(f.href);}
      for(const n of b.neighbors){assert.ok(n.reason,n.href);validTarget(n.href);}
    }
  }
});

test('所选方向由URL恢复，未知或继承属性名称回到默认方向',()=>{
  for(const domainId of Object.keys(catalog.domains)){
    const list=nav.branches(domainId);
    for(const b of list){
      const hash=nav.directionHref(domainId,b.id),r=journey.route(hash);
      assert.equal(nav.select(r).id,b.id,hash);
      const fresh=loadSite();
      assert.equal(fresh.COGNITION.select(fresh.JOURNEY.route(hash)).id,b.id,hash);
    }
    for(const id of ['', 'unknown', 'constructor', '__proto__', 'toString']){
      assert.equal(nav.select(journey.route(`#domain/${domainId}?direction=${id}`)).id,list[0].id,id);
    }
  }
});

test('所有既有AI专题与科普文章都有领域归属、定位入口与实际的后续道路',()=>{
  const pages=[...ai.topics.map(t=>'#topic/'+t.id),...Object.keys(catalog.articles).map(id=>'#article/'+id),'#article/retrieval'];
  for(const href of pages){
    const node=nav.resolveNode(href);
    assert.ok(node,href);
    assert.ok(catalog.domains[node.domainId],href);
    assert.ok(nav.branches(node.domainId).some(b=>b.id===node.branch.id),href);
    const position=nav.wayfinding(href),next=nav.readingNav(href);
    assert.ok(position.includes('当前知识点'),href);
    assert.ok(next.includes('接下来，可以往哪里走'),href);
    for(const a of anchors(position+next))validTarget(a.href);
  }
  assert.equal(nav.resolveNode('#article/no-such-article'),null);
});

test('选中方向进入新旧文章再返回，保留方向、搜索来源以及文章图解状态',()=>{
  const search='#search?q=AI&domain=ai';
  const from='#domain/ai?direction=method&back='+encodeURIComponent(search);
  const rendered=nav.domain(journey.route(from)),links=anchors(rendered);
  const legacy=links.find(a=>a.href==='#topic/training-inference');
  assert.ok(legacy);
  assert.match(legacy.attributes,/data-entry="explore"/);
  assert.equal(legacy.back,from);
  const normalized=site.AI_CORE.normalizeState({entry:{mode:'explore',returnHash:legacy.back}},ai.topics.map(t=>t.id));
  assert.equal(normalized.entry.returnHash,from);
  const article=links.find(a=>a.href.startsWith('#article/ai-context?'));
  assert.ok(article);
  const articleRoute=journey.route(article.href);
  assert.equal(journey.safeBack(articleRoute.q.get('back'),'#home'),from);
  articleRoute.q.set('mode','memory');
  const reading='#article/ai-context?'+articleRoute.q.toString();
  const returnCard=anchors(nav.readingNav(reading,from)).find(a=>a.body.includes('返回刚才的位置'));
  assert.equal(returnCard.href,from);
  assert.equal(nav.select(journey.route(returnCard.href)).id,'method');
  assert.equal(journey.route(returnCard.href).q.get('back'),search);
  const sideTrip=journey.withBack('#domain/computing?direction=comp-data',reading);
  const restored=journey.safeBack(journey.route(sideTrip).q.get('back'),'#home');
  assert.equal(restored,reading);
  assert.equal(journey.route(restored).q.get('mode'),'memory');
  assert.equal(journey.route(restored).q.get('back'),from);
});

test('所有方向页面的链接可用，切换方向不丢失跨域来处，基础能就地展开',()=>{
  const entry='#roam/ai-errors/sources?material=current&evidence=judgment';
  for(const domainId of Object.keys(catalog.domains)){
    for(const b of nav.branches(domainId)){
      const hash=nav.directionHref(domainId,b.id)+'&back='+encodeURIComponent(entry);
      const html=nav.domain(journey.route(hash));
      assert.ok(html.includes('<details>'),b.id);
      assert.ok(html.includes('当前展开到哪里'),b.id);
      const links=anchors(html);
      for(const a of links){
        validTarget(a.href);
        if(a.attributes.includes('data-cog-direction'))assert.equal(journey.route(a.href).q.get('back'),entry);
        if(a.href.startsWith('#topic/'))assert.equal(a.back,hash);
      }
      assert.equal((html.match(/aria-current="true"/g) || []).length,1,b.id);
    }
  }
});

test('首页与阅读导航不写掌握状态，原有漫游、专题和导览继续可用',()=>{
  const isolated=loadSite(),n=isolated.COGNITION;
  const html=n.homeStart('programmer')+n.homeStart('')+n.homeDomains();
  for(const a of anchors(html))validTarget(a.href);
  for(const t of ai.topics){n.wayfinding('#topic/'+t.id);n.readingNav('#topic/'+t.id);}
  for(const d of Object.keys(catalog.domains))n.domain(isolated.JOURNEY.route('#domain/'+d));
  assert.deepEqual(isolated.writes,[]);
  assert.equal(isolated.JOURNEY.route('#roam/ai-errors').kind,'roam');
  for(const hash of ['#topic/source-validity','#area/system','#guide/0','#records','#questions'])assert.equal(isolated.JOURNEY.route(hash),null,hash);
});

test('带着方向搜索能直达所选地图，并从地图返回原查询与领域筛选',()=>{
  const directions=catalog.searchItems().filter(item=>item.type==='认知方向');
  assert.equal(directions.length,22);
  for(const domainId of Object.keys(catalog.domains)){
    for(const b of nav.branches(domainId)){
      const target=nav.directionHref(domainId,b.id);
      const result=catalog.find(b.title,domainId).find(item=>item.href===target);
      assert.ok(result,`${domainId}: ${b.title}`);
      assert.equal(result.type,'认知方向');
      const search='#search?'+new URLSearchParams({q:b.title,domain:domainId}).toString();
      const entered=journey.route(journey.withBack(result.href,search));
      assert.equal(nav.select(entered).id,b.id);
      assert.equal(journey.safeBack(entered.q.get('back'),'#home'),search);
      const restored=journey.route(entered.q.get('back'));
      assert.equal(restored.q.get('q'),b.title);
      assert.equal(restored.q.get('domain'),domainId);
    }
  }
});
