import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const files=['data','ai-data','ai-reading','ai-core','journey-data','ai-expansion','computing-data','education-data','llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog','navigation-data','navigation','roam-data','roam','llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','explore','journey'];
function loadSite() {
  const handlers={},writes=[],focuses=[],replacements=[];
  const sandbox={window:{},URLSearchParams,Number,Math,
    location:{hash:'#map/context'},
    document:{addEventListener(type,fn){(handlers[type] ||= []).push(fn);},querySelector(selector){return {focus(options){focuses.push({selector,options});},scrollIntoView(){}};}},
    localStorage:{getItem(){return null;},setItem(key,value){writes.push({key,value});}},
    history:{replaceState(state,title,hash){sandbox.location.hash=hash;replacements.push(hash);}}
  };
  for(const file of files)vm.runInNewContext(fs.readFileSync(new URL(`../dist/${file}.js`,import.meta.url),'utf8'),sandbox);
  return {...sandbox.window,handlers,writes,focuses,replacements,sandbox};
}
const site=loadSite(),{CONTEXT_MAP:contextMap,CONTEXT_DATA:data,JOURNEY:journey,JOURNEY_CATALOG:catalog}=site;
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const anchors=html=>Array.from(html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g),m=>({
  href:decode(m[1].match(/\bhref="([^"]+)"/)?.[1] || ''),
  back:decode(m[1].match(/\bdata-return="([^"]+)"/)?.[1] || ''),
  body:m[2]
}));
function validTarget(href) {
  if(href.startsWith('#topic/')){
    assert.match(href,/^#topic\/[a-z-]+$/);
    assert.ok(site.AI_ATLAS_DATA.topics.some(t=>href==='#topic/'+t.id),href);
    return;
  }
  const r=journey.route(href);
  assert.ok(r,href);assert.notEqual(r.kind,'missing',href);
  if(r.kind==='map'){
    const map={llm:site.LLM_DATA,agent:site.AGENT_DATA,rag:site.RAG_DATA,context:data}[r.id];
    assert.ok(map,href);
    if(r.q.has('node'))assert.ok(map.nodes.some(n=>n.id===r.q.get('node')),href);
    if(r.q.has('depth'))assert.ok(map.depths.some(d=>d.id===r.q.get('depth')),href);
  }
}

test('提示词与上下文工程独立地图可直接访问，未知节点与非法返回地址安全回退',()=>{
  for(const hash of ['#map/context','#map/context?node=selection&depth=mechanism']){
    assert.equal(journey.route(hash).kind,'map');
    assert.equal(journey.safeBack(hash,'#home'),hash);
  }
  for(const hash of ['#map/contexts','#map/context/overview','#map/context/a/b']){
    assert.equal(journey.route(hash)?.kind,'missing');
    assert.equal(journey.safeBack(hash,'#home'),'#home');
  }
  for(const value of ['','unknown','constructor','__proto__','toString']){
    const r=journey.route('#map/context?'+new URLSearchParams({node:value,depth:value}));
    assert.equal(contextMap.select(r).node.id,'task');
    assert.equal(contextMap.select(r).depth,'intro');
  }
  const unsafe=journey.route('#map/context?back=https%3A%2F%2Fexample.com');
  assert.equal(journey.route(contextMap.link(unsafe)).q.has('back'),false);
  const entry=anchors(contextMap.entry('#domain/ai?direction=system')).find(a=>a.href.startsWith('#map/context'));
  assert.ok(entry);assert.equal(journey.route(entry.href).q.get('back'),'#domain/ai?direction=system');
});

test('提示词与上下文工程六个知识部分可逐层深入，十八组内容都有基础与有效去向',()=>{
  assert.deepEqual(Array.from(data.nodes,n=>n.id),['task','instructions','examples','selection','state','evaluation']);
  assert.deepEqual(Array.from(data.depths,d=>d.id),['intro','mechanism','boundary']);
  assert.equal(data.foundations.length,3);assert.ok(data.scope && data.lead);
  const back='#domain/ai?direction=system';
  for(const node of data.nodes){
    assert.ok(node.contains.length>=3 && node.frontier && node.neighbor.reason,node.id);
    assert.ok(catalog.articles[node.foundation]?.foundation,node.foundation);
    validTarget(node.neighbor.href);
    for(const depth of data.depths){
      const stage=node[depth.id],hash='#map/context?'+new URLSearchParams({node:node.id,depth:depth.id,back});
      assert.ok(stage.title && stage.text && stage.links.length,node.id+' / '+depth.id);
      for(const x of stage.links){validTarget(x.href);assert.ok(x.reason,x.href);}
      const selected=contextMap.select(journey.route(hash));
      assert.equal(selected.node.id,node.id);assert.equal(selected.depth,depth.id);
      const html=contextMap.render(journey.route(hash));
      assert.match(html,/随用随补的基础/);assert.match(html,/这部分会涉及的基础/);assert.match(html,/向外连接/);
      for(const a of anchors(html)){
        validTarget(a.href);
        if(a.href.startsWith('#topic/'))assert.equal(a.back,hash);
      }
    }
  }
});

test('提示词与上下文总览提供关系与过程图，并能跨到 LLM、Agent、RAG',()=>{
  const html=contextMap.render(journey.route('#map/context'));
  assert.match(html,/context-relationship/);assert.match(html,/context-cycle/);
  for(const target of ['#map/llm','#map/agent','#map/rag']){
    assert.ok(anchors(html).some(a=>a.href.startsWith(target)),target);
  }
  const withOrigin=contextMap.render(journey.route('#map/context?node=selection&depth=boundary&back=%23home'));
  assert.ok(anchors(withOrigin).some(a=>a.href==='#home'));
});

test('十篇提示词与上下文工程内容具备图解、实例、范围、来源及可返回的知识位置',()=>{
  const ids=[...Object.keys(site.CONTEXT_ARTICLES),...Object.keys(site.CONTEXT_FOUNDATIONS)];
  assert.equal(ids.length,10);
  for(const id of ids){
    const a=catalog.articles[id];
    assert.ok(a && a.domain==='ai' && a.contextNode,id);
    assert.ok(a.title && a.lead && a.takeaway && a.sections.length>=3,id);
    assert.ok(a.visual.steps.length>=3 && a.example.title && a.example.text,id);
    assert.ok(a.scope && a.sources.length>=1,id);
    for(const source of a.sources){assert.ok(source.title,id);assert.equal(new URL(source.url).protocol,'https:');}
    for(const related of a.related)assert.ok(catalog.articles[related],id+' → '+related);
    for(const crossLink of a.crossLinks){validTarget(crossLink.href);assert.ok(crossLink.reason,crossLink.href);}
    const context=contextMap.mapContext('#article/'+id);
    assert.equal(context.node.id,a.contextNode,id);
    assert.equal(context.depth,a.foundation?'mechanism':'intro',id);
    for(const link of anchors(contextMap.wayfinding('#article/'+id)+contextMap.readingNav('#article/'+id)))validTarget(link.href);
  }
});

test('提示词与上下文工程阅读跨到信息组织后保留起点、层级和搜索来处，刷新后可恢复',()=>{
  const search='#search?'+new URLSearchParams({q:'上下文工程',domain:'ai'});
  const origin='#map/context?'+new URLSearchParams({node:'task',depth:'mechanism',back:search});
  const switched=contextMap.link(journey.route(origin),{node:'selection',depth:'boundary'});
  assert.equal(journey.route(switched).q.get('back'),search);
  const first=journey.withBack('#article/context-task',origin);
  const second=journey.withBack('#article/info-provenance',first);
  const immediate=journey.route(second).q.get('back');
  const map=contextMap.mapContext(second,immediate);
  assert.equal(map.hash,origin);assert.equal(map.node.id,'task');assert.equal(map.depth,'mechanism');
  const navigation=anchors(contextMap.readingNav(second,immediate));
  assert.ok(navigation.some(a=>a.href===first && /返回/.test(a.body)));
  assert.ok(navigation.some(a=>a.href===origin));
  assert.equal(loadSite().CONTEXT_MAP.mapContext(second,immediate).hash,origin);
  assert.equal(contextMap.mapContext('#article/comp-data'),null);
});

test('提示词与上下文工程、LLM、Agent、RAG 相互跳转时，最近进入的地图决定继续阅读的位置',()=>{
  const maps=[
    {api:contextMap,href:'#map/context?node=selection&depth=boundary',article:'#article/context-selection'},
    {api:site.RAG_MAP,href:'#map/rag?node=context&depth=mechanism',article:'#article/rag-context'},
    {api:site.LLM,href:'#map/llm?node=generation&depth=mechanism',article:'#article/llm-generation'},
    {api:site.AGENT_MAP,href:'#map/agent?node=knowledge&depth=intro',article:'#article/agent-knowledge'}
  ];
  for(const from of maps){
    for(const to of maps){
      if(from===to)continue;
      const targetMap=journey.withBack(to.href,from.href);
      const article=journey.withBack(to.article,targetMap);
      const back=journey.route(article).q.get('back');
      assert.equal(to.api.mapContext(article,back).hash,targetMap,from.href+' → '+to.href);
      assert.equal(site.COGNITION.mapContext(article,back).map,to.api,'统一阅读导航应使用最近地图');
      assert.equal(from.api.mapContext(article,back),null,from.href+' → '+to.href);
      // Explicit origin also wins when the article belongs to the previous map.
      assert.equal(from.api.mapContext(from.article,targetMap),null);
      assert.equal(to.api.mapContext(from.article,targetMap).hash,targetMap);
      assert.equal(site.COGNITION.mapContext(from.article,targetMap).map,to.api,'显式地图来处优先于文章自身归属');
    }
  }
});

test('上下文预算示意区分放得下、保留依据与丢失限制条件',()=>{
  const ids=items=>Array.from(items,item=>item.id);
  const small=contextMap.contextState({strategy:'all',window:'short'});
  assert.equal(small.used,8);assert.equal(small.inputBudget,8);assert.equal(small.remaining,0);
  assert.deepEqual(ids(small.excluded),['evidence','exception']);
  assert.equal(small.hasEvidence,false);assert.equal(small.hasException,false);
  const larger=contextMap.contextState({strategy:'all',window:'long'});
  assert.equal(larger.used,12);assert.equal(larger.excluded.length,0);
  assert.equal(larger.hasEvidence,true);assert.equal(larger.hasException,true);
  const focused=contextMap.contextState({strategy:'focused',window:'short'});
  assert.equal(focused.used,7);assert.ok(focused.hasEvidence && focused.hasException);
  const compressed=contextMap.contextState({strategy:'compressed',window:'short'});
  assert.equal(compressed.used,4);
  assert.equal(compressed.hasEvidence,false);assert.equal(compressed.hasException,false);
  // A shorter input need not preserve the meaning required by the task.
  assert.ok(compressed.remaining>focused.remaining);
  for(const strategy of ['all','focused','compressed']){
    for(const window of ['short','long']){
      const state=contextMap.contextState({strategy,window});
      assert.equal(state.strategy,strategy);assert.equal(state.window,window);
      assert.equal(state.capacity,state.inputBudget+state.outputReserve);
      assert.equal(state.used,state.selected.reduce((sum,item)=>sum+item.units,0));
      assert.equal(state.requested,[...state.selected,...state.excluded].reduce((sum,item)=>sum+item.units,0));
      assert.equal(state.remaining,state.inputBudget-state.used);
      assert.ok(state.used<=state.inputBudget && state.remaining>=0);
      assert.ok(state.outputReserve>0);
      const all=[...state.selected,...state.excluded];
      assert.equal(new Set(ids(all)).size,all.length);
      for(const item of all)assert.ok(item.title && item.text && Number.isInteger(item.units) && item.units>0);
      assert.equal(state.hasEvidence,ids(state.selected).includes('evidence'));
      assert.equal(state.hasException,ids(state.selected).includes('exception'));
    }
  }
  for(const invalid of ['unknown','constructor','__proto__','<img src=x onerror=alert(1)>']){
    const state=contextMap.contextState({strategy:invalid,window:invalid});
    assert.equal(state.strategy,'all');assert.equal(state.window,'short');
    assert.deepEqual(ids(state.selected),ids(small.selected));
  }
});

const selectedControls=html=>Array.from(html.matchAll(/<button\b([^>]*)>/g),m=>m[1])
  .filter(attributes=>attributes.includes('aria-pressed="true"'))
  .map(attributes=>[attributes.match(/data-context-param="([^"]+)"/)?.[1],attributes.match(/data-value="([^"]+)"/)?.[1]]);

test('三个上下文图解可恢复选择，明确示意范围，不把容量或保存等同理解',()=>{
  const examples=[
    '#article/context-composition',
    '#article/context-task?brief=vague',
    '#article/context-task?brief=explicit',
    '#article/context-selection?strategy=all&window=short',
    '#article/context-selection?strategy=focused&window=short',
    '#article/context-selection?strategy=compressed&window=long',
    '#article/context-state?memory=none',
    '#article/context-state?memory=note',
    '#article/context-state?memory=stale'
  ];
  for(const hash of examples){
    const html=contextMap.demo(journey.route(hash));
    assert.ok(html,hash);
    if(hash!=='#article/context-composition')assert.match(html,/示意|预设/);
    assert.equal(loadSite().CONTEXT_MAP.demo(journey.route(hash)),html,hash);
    for(const link of anchors(html))validTarget(link.href);
  }
  for(const [id,param,defaultValue] of [['context-task','brief','vague'],['context-selection','strategy','all'],['context-state','memory','none']]){
    const normal=contextMap.demo(journey.route('#article/'+id));
    const explicitDefault=contextMap.demo(journey.route('#article/'+id+'?'+param+'='+defaultValue));
    assert.deepEqual(selectedControls(normal),selectedControls(explicitDefault));
    const attack='#article/'+id+'?'+param+'='+encodeURIComponent('<img src=x onerror=alert(1)>');
    const sanitized=contextMap.demo(journey.route(attack));
    assert.doesNotMatch(sanitized,/<img\b|\sonerror\s*=/i);
    assert.deepEqual(selectedControls(sanitized),selectedControls(normal));
  }
  assert.notEqual(contextMap.demo(journey.route(examples[1])),contextMap.demo(journey.route(examples[2])));
  assert.notEqual(contextMap.demo(journey.route(examples[3])),contextMap.demo(journey.route(examples[4])));
  const noMemory=contextMap.demo(journey.route('#article/context-state?memory=none'));
  const currentNote=contextMap.demo(journey.route('#article/context-state?memory=note'));
  const staleNote=contextMap.demo(journey.route('#article/context-state?memory=stale'));
  assert.notEqual(noMemory,currentNote);assert.notEqual(currentNote,staleNote);
  assert.match(noMemory,/缺|没有|未|不足|不知/);
  assert.match(staleNote,/旧|过期|失效|重新|冲突/);
  assert.equal(contextMap.demo(journey.route('#article/rag-context')),'');
});

test('切换上下文图解保留地图来处及另一项选择，不写入学习记录',()=>{
  const isolated=loadSite(),rendered=[];
  isolated.JOURNEY.render=r=>rendered.push(r);
  const origin='#map/context?node=selection&depth=mechanism';
  isolated.sandbox.location.hash=journey.withBack('#article/context-selection?strategy=focused&window=short',origin);
  const button={dataset:{contextParam:'window',value:'long'}};
  const event={target:{closest(selector){return selector==='button[data-context-param]'?button:null;}}};
  for(const handler of isolated.handlers.click)handler(event);
  assert.equal(rendered.length,1);
  assert.equal(rendered[0].q.get('window'),'long');assert.equal(rendered[0].q.get('strategy'),'focused');
  assert.equal(rendered[0].q.get('back'),origin);assert.equal(isolated.replacements.length,1);
  assert.ok(isolated.focuses.some(f=>f.selector.includes('window') && f.selector.includes('long')));
  assert.deepEqual(isolated.writes,[]);
  const replacements=isolated.replacements.length;
  for(const [param,value] of [['window','constructor'],['memory','note']]){
    button.dataset={contextParam:param,value};
    for(const handler of isolated.handlers.click)handler(event);
  }
  assert.equal(isolated.replacements.length,replacements,'无效取值或属于另一篇的参数不应改变当前图解');
});

test('提示词和上下文工程搜索均能找到整图、六个方向与十篇讲解',()=>{
  const all=catalog.searchItems();
  const results=catalog.find('上下文工程','ai');
  for(const query of ['提示词','上下文工程'])assert.ok(catalog.find(query,'ai').some(x=>x.href==='#map/context'),query);
  for(const node of data.nodes){
    assert.ok(all.some(x=>x.href.startsWith('#map/context?') && journey.route(x.href).q.get('node')===node.id),node.id);
  }
  for(const id of [...Object.keys(site.CONTEXT_ARTICLES),...Object.keys(site.CONTEXT_FOUNDATIONS)]){
    assert.ok(all.some(x=>x.href==='#article/'+id),id);
    assert.ok(results.some(x=>x.href==='#article/'+id),'上下文工程搜索应包含 '+id);
  }
});
