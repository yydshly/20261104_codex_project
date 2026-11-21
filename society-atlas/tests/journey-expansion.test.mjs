import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox={window:{},document:{addEventListener(){}},localStorage:{getItem(){return null;}},URLSearchParams};
for(const name of ['data','ai-data','ai-reading','journey-data','ai-expansion','computing-data','education-data','llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog','roam-data','roam','navigation-data','navigation','llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','industry-paths','industry-directions','industry-foundations','explore','journey'])vm.runInNewContext(fs.readFileSync(new URL(`../dist/${name}.js`,import.meta.url),'utf8'),sandbox);
const {domains,articles,find,searchItems}=sandbox.window.JOURNEY_CATALOG;
const {route,safeBack,withBack}=sandbox.window.JOURNEY;

test('新增领域、文章、关联与跨域入口都落到存在的内容，保留原有24篇AI专题',()=>{
  assert.equal(Object.keys(domains).length,4);
  assert.equal(Object.keys(articles).length,56);
  assert.equal(sandbox.window.AI_ATLAS_DATA.topics.length,24);
  for(const d of Object.values(domains)){
    for(const tab of ['', '/how','/history'])assert.equal(route(`#domain/${d.id}${tab}`).kind,'domain');
    assert.equal(route('#article/'+d.guide.article).kind,'article');
    for(const n of d.nodes || [])assert.equal(articles[n.article]?.domain,d.id);
    for(const c of d.connections)assert.notEqual(route(c.href)?.kind,'missing',c.href);
  }
  for(const a of Object.values(articles)){
    assert.ok(domains[a.domain],a.id);
    for(const id of a.related)assert.ok(articles[id],`${a.id} → ${id}`);
    for(const c of a.crossLinks || []){
      assert.ok(c.reason.length>10,c.href);
      assert.equal(route(c.href)?.view,'journey',c.href);
      assert.notEqual(route(c.href)?.kind,'missing',c.href);
    }
  }
});

test('从无问题浏览到带问题搜索，均包含新领域；问题、别名、筛选与空结果可用',()=>{
  assert.ok(find().some(x=>x.href==='#roam/ai-errors'));
  assert.ok(find('公司知识库助手','ai').some(x=>x.href==='#project/knowledge-assistant'));
  for(const query of ['评估与可靠性','人工复核']){
    assert.ok(find(query,'ai').some(x=>x.href==='#project/knowledge-assistant/evaluation'),query);
  }
  for(const query of ['上线运行与监控','旧答案','尾延迟']){
    assert.ok(find(query,'ai').some(x=>x.href==='#project/knowledge-assistant/operations'),query);
  }
  assert.equal(find().length,258);
  assert.equal(Array.from(sandbox.window.INDUSTRY_DATA.sectors,sector=>sector.code).sort().join(''),'ABCDEFGHIJKLMNOPQRST');
  for(const [domain,count] of [['industries',81],['skills',4],['thinking',4],['foundations',15]]){
    const results=find('',domain);
    assert.equal(results.length,count,domain);
    for(const item of results)assert.equal(route(item.href).kind,'learn',item.href);
  }
  assert.ok(find('物流','industries').some(x=>x.href==='#learn/industries/logistics'));
  assert.ok(find('分段定位','thinking').some(x=>x.href==='#learn/thinking/trace'));
  for(const [q,id] of [['AI 为什么答错','ai-generation'],['AI会记住我吗','ai-context'],['网页','comp-systems'],['看懂','education-learning'],['证据','education-evidence']]){
    assert.ok(find(q).some(x=>x.href==='#article/'+id),q);
  }
  assert.ok(find('算法','computing').length>0);
  assert.ok(find('大模型').some(x=>x.domain==='ai'));
  assert.ok(find('算法','computing').every(x=>x.domain==='computing'));
  assert.equal(find('没有此词zyx987').length,0);
  for(const a of Object.values(articles))assert.ok(searchItems().some(x=>x.href==='#article/'+a.id));
});

test('新图解状态和搜索筛选经过跨域往返后保持，旧专题也可作为返回起点',()=>{
  const search='#search?q=AI&domain=ai';
  const context='#article/ai-context?mode=memory&back='+encodeURIComponent(search);
  const computing='#domain/computing?back='+encodeURIComponent(context);
  assert.equal(safeBack(route(computing).q.get('back'),'#home'),context);
  assert.equal(route(context).q.get('mode'),'memory');
  assert.equal(safeBack(route(context).q.get('back'),'#home'),search);
  assert.equal(route(search).q.get('domain'),'ai');
  assert.equal(safeBack('#topic/prompt-context','#home'),'#topic/prompt-context');
  assert.equal(safeBack('#topic/nonexistent','#home'),'#home');
});

test('持续跨领域阅读时，嵌套返回地址不会让即时来源和图解状态丢失',()=>{
  let current='#search?q='+encodeURIComponent('我想知道人工智能为什么会记住信息');
  for(let i=0;i<50;i++){
    const previous=current;
    current=withBack(i%2?'#domain/education':'#article/ai-context?mode=memory',previous);
    const back=safeBack(route(current).q.get('back'),'#home');
    assert.notEqual(back,'#home');
    assert.equal(route(back).id,route(previous).id);
    assert.equal(route(back).q.get('mode'),route(previous).q.get('mode'));
  }
});
