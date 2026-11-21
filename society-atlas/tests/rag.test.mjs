import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const files=['data','ai-data','ai-reading','ai-core','journey-data','ai-expansion','computing-data','education-data','llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog','navigation-data','navigation','roam-data','roam','llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','explore','journey'];
function loadSite() {
  const handlers={},writes=[],focuses=[],replacements=[];
  const sandbox={window:{},URLSearchParams,Number,Math,
    location:{hash:'#map/rag'},
    document:{addEventListener(type,fn){(handlers[type] ||= []).push(fn);},querySelector(selector){return {focus(options){focuses.push({selector,options});},scrollIntoView(){}};}},
    localStorage:{getItem(){return null;},setItem(key,value){writes.push({key,value});}},
    history:{replaceState(state,title,hash){sandbox.location.hash=hash;replacements.push(hash);}}
  };
  for(const file of files)vm.runInNewContext(fs.readFileSync(new URL(`../dist/${file}.js`,import.meta.url),'utf8'),sandbox);
  return {...sandbox.window,handlers,writes,focuses,replacements,sandbox};
}
const site=loadSite(),{RAG_MAP:rag,RAG_DATA:data,JOURNEY:journey,JOURNEY_CATALOG:catalog}=site;
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
    const map={llm:site.LLM_DATA,agent:site.AGENT_DATA,rag:data,context:site.CONTEXT_DATA}[r.id];
    assert.ok(map,href);
    if(r.q.has('node'))assert.ok(map.nodes.some(n=>n.id===r.q.get('node')),href);
    if(r.q.has('depth'))assert.ok(map.depths.some(d=>d.id===r.q.get('depth')),href);
  }
}

test('RAG 独立地图可直接访问，未知节点与非法返回地址安全回退',()=>{
  for(const hash of ['#map/rag','#map/rag?node=retrieval&depth=mechanism']){
    assert.equal(journey.route(hash).kind,'map');
    assert.equal(journey.safeBack(hash,'#home'),hash);
  }
  for(const hash of ['#map/rags','#map/rag/overview','#map/rag/a/b']){
    assert.equal(journey.route(hash)?.kind,'missing');
    assert.equal(journey.safeBack(hash,'#home'),'#home');
  }
  for(const value of ['','unknown','constructor','__proto__','toString']){
    const r=journey.route('#map/rag?'+new URLSearchParams({node:value,depth:value}));
    assert.equal(rag.select(r).node.id,'ingestion');
    assert.equal(rag.select(r).depth,'intro');
  }
  const unsafe=journey.route('#map/rag?back=https%3A%2F%2Fexample.com');
  assert.equal(journey.route(rag.link(unsafe)).q.has('back'),false);
  const entry=anchors(rag.entry('#domain/ai?direction=system')).find(a=>a.href.startsWith('#map/rag'));
  assert.ok(entry);assert.equal(journey.route(entry.href).q.get('back'),'#domain/ai?direction=system');
});

test('RAG 六个知识部分可逐层深入，十八组内容都有基础与有效去向',()=>{
  assert.deepEqual(Array.from(data.nodes,n=>n.id),['ingestion','retrieval','ranking','context','generation','evaluation']);
  assert.deepEqual(Array.from(data.depths,d=>d.id),['intro','mechanism','boundary']);
  assert.equal(data.foundations.length,3);assert.ok(data.scope && data.lead);
  const back='#domain/ai?direction=system';
  for(const node of data.nodes){
    assert.ok(node.contains.length>=3 && node.frontier && node.neighbor.reason,node.id);
    assert.ok(catalog.articles[node.foundation]?.foundation,node.foundation);
    validTarget(node.neighbor.href);
    for(const depth of data.depths){
      const stage=node[depth.id],hash='#map/rag?'+new URLSearchParams({node:node.id,depth:depth.id,back});
      assert.ok(stage.title && stage.text && stage.links.length,node.id+' / '+depth.id);
      for(const x of stage.links){validTarget(x.href);assert.ok(x.reason,x.href);}
      const selected=rag.select(journey.route(hash));
      assert.equal(selected.node.id,node.id);assert.equal(selected.depth,depth.id);
      const html=rag.render(journey.route(hash));
      assert.match(html,/随用随补的基础/);assert.match(html,/这部分会涉及的基础/);assert.match(html,/向外连接/);
      for(const a of anchors(html)){
        validTarget(a.href);
        if(a.href.startsWith('#topic/'))assert.equal(a.back,hash);
      }
    }
  }
});

test('RAG 总览把资料准备和问答拆开，并能跨到 LLM、Agent、信息组织',()=>{
  const html=rag.render(journey.route('#map/rag'));
  assert.match(html,/rag-relationship/);assert.match(html,/rag-index-flow/);assert.match(html,/rag-query-flow/);
  for(const target of ['#map/llm','#map/agent','#domain/information']){
    assert.ok(anchors(html).some(a=>a.href.startsWith(target)),target);
  }
  const withOrigin=rag.render(journey.route('#map/rag?node=ranking&depth=boundary&back=%23home'));
  assert.ok(anchors(withOrigin).some(a=>a.href==='#home'));
});

test('十篇 RAG 内容具备图解、实例、范围、来源及可返回的知识位置',()=>{
  const ids=[...Object.keys(site.RAG_ARTICLES),...Object.keys(site.RAG_FOUNDATIONS)];
  assert.equal(ids.length,10);
  for(const id of ids){
    const a=catalog.articles[id];
    assert.ok(a && a.domain==='ai' && a.ragNode,id);
    assert.ok(a.title && a.lead && a.takeaway && a.sections.length>=3,id);
    assert.ok(a.visual.steps.length>=3 && a.example.title && a.example.text,id);
    assert.ok(a.scope && a.sources.length>=1,id);
    for(const source of a.sources){assert.ok(source.title,id);assert.equal(new URL(source.url).protocol,'https:');}
    for(const related of a.related)assert.ok(catalog.articles[related],id+' → '+related);
    for(const crossLink of a.crossLinks){validTarget(crossLink.href);assert.ok(crossLink.reason,crossLink.href);}
    const context=rag.mapContext('#article/'+id);
    assert.equal(context.node.id,a.ragNode,id);
    assert.equal(context.depth,a.foundation?'mechanism':'intro',id);
    for(const link of anchors(rag.wayfinding('#article/'+id)+rag.readingNav('#article/'+id)))validTarget(link.href);
  }
});

test('RAG 阅读跨到信息组织后保留起点、层级和搜索来处，刷新后可恢复',()=>{
  const search='#search?'+new URLSearchParams({q:'RAG',domain:'ai'});
  const origin='#map/rag?'+new URLSearchParams({node:'ingestion',depth:'mechanism',back:search});
  const switched=rag.link(journey.route(origin),{node:'context',depth:'boundary'});
  assert.equal(journey.route(switched).q.get('back'),search);
  const first=journey.withBack('#article/rag-ingestion',origin);
  const second=journey.withBack('#article/info-provenance',first);
  const immediate=journey.route(second).q.get('back');
  const map=rag.mapContext(second,immediate);
  assert.equal(map.hash,origin);assert.equal(map.node.id,'ingestion');assert.equal(map.depth,'mechanism');
  const navigation=anchors(rag.readingNav(second,immediate));
  assert.ok(navigation.some(a=>a.href===first && /返回/.test(a.body)));
  assert.ok(navigation.some(a=>a.href===origin));
  assert.equal(loadSite().RAG_MAP.mapContext(second,immediate).hash,origin);
  assert.equal(rag.mapContext('#article/comp-data'),null);
});

test('RAG、LLM、Agent 相互跳转时，最近进入的地图决定继续阅读的位置',()=>{
  const maps=[
    {api:rag,href:'#map/rag?node=generation&depth=boundary',article:'#article/rag-generation'},
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
      assert.equal(from.api.mapContext(article,back),null,from.href+' → '+to.href);
      // Explicit origin also wins when the article belongs to the previous map.
      assert.equal(from.api.mapContext(from.article,targetMap),null);
      assert.equal(to.api.mapContext(from.article,targetMap).hash,targetMap);
    }
  }
});

test('检索示意把过期和偏题分开，筛选与重排仅作用于已有候选',()=>{
  const ids=items=>Array.from(items,item=>item.id);
  assert.deepEqual(ids(rag.retrievalState().candidates),['old','handbook','current']);
  assert.deepEqual(ids(rag.retrievalState({method:'semantic'}).candidates),['handbook','current','old']);
  assert.deepEqual(ids(rag.retrievalState({method:'hybrid'}).candidates),['current','old','handbook']);
  // A current-version filter cannot establish that the remaining document answers the question.
  const currentOnly=rag.retrievalState({method:'keyword',filter:'current'});
  assert.deepEqual(ids(currentOnly.excluded),['old']);
  assert.equal(currentOnly.selected[0].id,'handbook');
  const reranked=rag.retrievalState({method:'keyword',filter:'current',rerank:'on'});
  assert.equal(reranked.selected[0].id,'current');
  for(const method of ['keyword','semantic','hybrid']){
    for(const filter of ['off','current']){
      for(const rerank of ['off','on']){
        const state=rag.retrievalState({method,filter,rerank});
        assert.equal(state.method,method);assert.equal(state.filter,filter);assert.equal(state.rerank,rerank);
        const all=[...state.candidates,...state.excluded];
        assert.equal(all.length,3);assert.equal(new Set(ids(all)).size,3);
        for(const candidate of all)assert.ok(candidate.id && candidate.title && candidate.text && typeof candidate.current==='boolean');
        assert.equal(state.selected.length,1);assert.equal(state.selected[0].id,state.candidates[0].id);
        if(filter==='current')assert.ok(state.candidates.every(candidate=>candidate.current));
        else assert.equal(state.excluded.length,0);
        if(rerank==='on')assert.equal(state.selected[0].id,'current');
        assert.ok(state.selected.every(candidate=>state.candidates.some(found=>found.id===candidate.id)));
      }
    }
  }
  for(const invalid of ['unknown','constructor','__proto__','<img src=x onerror=alert(1)>']){
    const safe=rag.retrievalState({method:invalid,filter:invalid,rerank:invalid});
    assert.equal(safe.method,'keyword');assert.equal(safe.filter,'off');assert.equal(safe.rerank,'off');
  }
});

test('RAG 交互图解可从 URL 恢复且标明示意，缺失证据不会表现为完整依据',()=>{
  const examples=[
    '#article/rag-composition',
    '#article/rag-ingestion?chunking=fixed',
    '#article/rag-ingestion?chunking=semantic',
    '#article/rag-ranking?method=keyword&filter=current&rerank=off',
    '#article/rag-ranking?method=hybrid&filter=current&rerank=on',
    '#article/rag-generation?evidence=full',
    '#article/rag-generation?evidence=partial',
    '#article/rag-generation?evidence=none'
  ];
  for(const hash of examples){
    const html=rag.demo(journey.route(hash));
    assert.ok(html.length>100,hash);
    if(hash!=='#article/rag-composition')assert.match(html,/示意|预设/);
    assert.equal(loadSite().RAG_MAP.demo(journey.route(hash)),html,hash);
  }
  const selectedControls=html=>Array.from(html.matchAll(/<button\b([^>]*)>/g),m=>m[1])
    .filter(attributes=>attributes.includes('aria-pressed="true"'))
    .map(attributes=>[attributes.match(/data-rag-param="([^"]+)"/)?.[1],attributes.match(/data-value="([^"]+)"/)?.[1]]);
  for(const [id,param,defaultValue] of [['rag-ingestion','chunking','semantic'],['rag-ranking','method','keyword'],['rag-generation','evidence','full']]){
    assert.deepEqual(selectedControls(rag.demo(journey.route('#article/'+id))),selectedControls(rag.demo(journey.route('#article/'+id+'?'+param+'='+defaultValue))));
    const attack='#article/'+id+'?'+param+'='+encodeURIComponent('<img src=x onerror=alert(1)>');
    const safeDemo=rag.demo(journey.route(attack));
    assert.doesNotMatch(safeDemo,/<img\b|\sonerror\s*=/i);
    assert.deepEqual(selectedControls(safeDemo),selectedControls(rag.demo(journey.route('#article/'+id))));
  }
  assert.notEqual(rag.demo(journey.route(examples[1])),rag.demo(journey.route(examples[2])));
  const full=rag.demo(journey.route('#article/rag-generation?evidence=full'));
  const partial=rag.demo(journey.route('#article/rag-generation?evidence=partial'));
  const none=rag.demo(journey.route('#article/rag-generation?evidence=none'));
  assert.notEqual(full,partial);assert.notEqual(partial,none);
  assert.match(partial,/缺|不足|不能|未/);assert.match(none,/缺|没有|未找到|不足|无可用/);
  assert.equal(rag.demo(journey.route('#article/llm-generation')),'');
});

test('切换 RAG 筛选保留其他图解选择和地图来处，不写入学习或掌握记录',()=>{
  const isolated=loadSite(),rendered=[];
  isolated.JOURNEY.render=r=>rendered.push(r);
  const origin='#map/rag?node=ranking&depth=mechanism';
  isolated.sandbox.location.hash=journey.withBack('#article/rag-ranking?method=keyword&filter=off&rerank=on',origin);
  const button={dataset:{ragParam:'filter',value:'current'}};
  const event={target:{closest(selector){return selector==='button[data-rag-param]'?button:null;}}};
  for(const handler of isolated.handlers.click)handler(event);
  assert.equal(rendered.length,1);
  assert.equal(rendered[0].q.get('filter'),'current');assert.equal(rendered[0].q.get('method'),'keyword');assert.equal(rendered[0].q.get('rerank'),'on');
  assert.equal(rendered[0].q.get('back'),origin);assert.equal(isolated.replacements.length,1);
  assert.ok(isolated.focuses.some(f=>f.selector.includes('filter') && f.selector.includes('current')));
  assert.deepEqual(isolated.writes,[]);
  const replacements=isolated.replacements.length;
  for(const [param,value] of [['filter','constructor'],['chunking','fixed']]){
    button.dataset={ragParam:param,value};
    for(const handler of isolated.handlers.click)handler(event);
  }
  assert.equal(isolated.replacements.length,replacements,'未知取值或其他文章的参数不应改写当前图解');
});

test('RAG 搜索可找到地图、六个方向和十篇讲解',()=>{
  const all=catalog.searchItems();
  const ragResults=catalog.find('RAG','ai');
  for(const query of ['RAG','检索增强生成'])assert.ok(catalog.find(query,'ai').some(x=>x.href==='#map/rag'),query);
  for(const node of data.nodes){
    assert.ok(all.some(x=>x.href.startsWith('#map/rag?') && journey.route(x.href).q.get('node')===node.id),node.id);
  }
  for(const id of [...Object.keys(site.RAG_ARTICLES),...Object.keys(site.RAG_FOUNDATIONS)]){
    assert.ok(all.some(x=>x.href==='#article/'+id),id);
    assert.ok(ragResults.some(x=>x.href==='#article/'+id),'RAG 搜索应包含 '+id);
  }
});
