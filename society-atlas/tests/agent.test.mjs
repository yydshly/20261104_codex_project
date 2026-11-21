import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const files=['data','ai-data','ai-reading','ai-core','journey-data','ai-expansion','computing-data','education-data','llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog','navigation-data','navigation','roam-data','roam','llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','explore','journey'];
function loadSite() {
  const handlers={},writes=[],focuses=[],replacements=[];
  const sandbox={window:{},URLSearchParams,Number,Math,
    location:{hash:'#map/agent'},
    document:{addEventListener(type,fn){(handlers[type] ||= []).push(fn);},querySelector(selector){return {focus(options){focuses.push({selector,options});},scrollIntoView(){}};}},
    localStorage:{getItem(){return null;},setItem(key,value){writes.push({key,value});}},
    history:{replaceState(state,title,hash){sandbox.location.hash=hash;replacements.push(hash);}}
  };
  for(const file of files)vm.runInNewContext(fs.readFileSync(new URL(`../dist/${file}.js`,import.meta.url),'utf8'),sandbox);
  return {...sandbox.window,handlers,writes,focuses,replacements,sandbox};
}
const site=loadSite(),{AGENT_MAP:agent,AGENT_DATA:data,JOURNEY:journey,JOURNEY_CATALOG:catalog}=site;
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
    const map={agent:data,llm:site.LLM_DATA,rag:site.RAG_DATA,context:site.CONTEXT_DATA}[r.id];
    if(r.q.has('node'))assert.ok(map.nodes.some(n=>n.id===r.q.get('node')),href);
    if(r.q.has('depth'))assert.ok(map.depths.some(d=>d.id===r.q.get('depth')),href);
  }
}

test('Agent 独立地图能从入口访问，非法路径与未知层级得到安全回退',()=>{
  for(const hash of ['#map/agent','#map/agent?node=loop&depth=mechanism']){
    assert.equal(journey.route(hash).kind,'map');
    assert.equal(journey.safeBack(hash,'#home'),hash);
  }
  for(const hash of ['#map/agents','#map/agent/overview','#map/agent/a/b']){
    assert.equal(journey.route(hash)?.kind,'missing');
    assert.equal(journey.safeBack(hash,'#home'),'#home');
  }
  for(const value of ['','unknown','constructor','__proto__','toString']){
    const r=journey.route('#map/agent?'+new URLSearchParams({node:value,depth:value}));
    assert.equal(agent.select(r).node.id,'goals');
    assert.equal(agent.select(r).depth,'intro');
  }
  assert.equal(journey.route(agent.link(journey.route('#map/agent?back=https%3A%2F%2Fexample.com'))).q.has('back'),false);
});

test('Agent 六个部分的十八种深入组合具有真实内容、所需基础与跨域路径',()=>{
  assert.deepEqual(Array.from(data.nodes,n=>n.id),['goals','loop','tools','state','knowledge','evaluation']);
  assert.equal(data.depths.length,3);assert.equal(data.foundations.length,3);
  assert.ok(data.scope && data.lead);
  const back='#domain/ai?direction=system';
  for(const node of data.nodes){
    assert.ok(node.contains.length>=3 && node.frontier && node.neighbor.reason,node.id);
    assert.ok(catalog.articles[node.foundation]?.foundation,node.foundation);
    validTarget(node.neighbor.href);
    for(const depth of data.depths){
      const stage=node[depth.id],hash='#map/agent?'+new URLSearchParams({node:node.id,depth:depth.id,back});
      assert.ok(stage.title && stage.text && stage.links.length,node.id+' / '+depth.id);
      for(const x of stage.links){validTarget(x.href);assert.ok(x.reason,x.href);}
      const selected=agent.select(journey.route(hash));
      assert.equal(selected.node.id,node.id);assert.equal(selected.depth,depth.id);
      const html=agent.render(journey.route(hash));
      assert.match(html,/随用随补的基础/);
      assert.match(html,/这部分会涉及的基础/);
      assert.match(html,/向外连接/);
      for(const a of anchors(html)){
        validTarget(a.href);
        if(a.href.startsWith('#topic/'))assert.equal(a.back,hash);
      }
    }
  }
  const html=agent.render(journey.route('#map/agent'));
  assert.match(html,/agent-relationship/);
  assert.ok(anchors(html).some(x=>x.href.startsWith('#map/llm')));
  assert.ok(anchors(html).some(x=>x.href.startsWith('#domain/information')));
});

test('十篇 Agent 文章有图解、独立讲解、边界和来源，所有继续阅读落到现有内容',()=>{
  const ids=[...Object.keys(site.AGENT_ARTICLES),...Object.keys(site.AGENT_FOUNDATIONS)];
  assert.equal(ids.length,10);
  for(const id of ids){
    const a=catalog.articles[id];
    assert.ok(a && a.domain==='ai' && a.agentNode,id);
    assert.ok(a.title && a.lead && a.takeaway && a.sections.length>=3,id);
    assert.ok(a.visual.steps.length>=3 && a.example.title && a.example.text,id);
    assert.ok(a.scope && a.sources.length>=1,id);
    for(const s of a.sources){assert.ok(s.title,id);assert.equal(new URL(s.url).protocol,'https:');}
    for(const related of a.related)assert.ok(catalog.articles[related],id+' → '+related);
    for(const c of a.crossLinks){validTarget(c.href);assert.ok(c.reason,c.href);}
    const context=agent.mapContext('#article/'+id);
    assert.equal(context.node.id,a.agentNode,id);
    assert.equal(context.depth,a.foundation?'mechanism':'intro',id);
    for(const link of anchors(agent.wayfinding('#article/'+id)+agent.readingNav('#article/'+id)))validTarget(link.href);
  }
});

test('跨到 LLM 和信息组织后返回 Agent 时保留部分、深度和搜索来处',()=>{
  const search='#search?'+new URLSearchParams({q:'Agent',domain:'ai'});
  const origin='#map/agent?'+new URLSearchParams({node:'knowledge',depth:'mechanism',back:search});
  const switched=agent.link(journey.route(origin),{node:'loop',depth:'boundary'});
  assert.equal(journey.route(switched).q.get('back'),search);
  const first=journey.withBack('#article/agent-knowledge',origin);
  const second=journey.withBack('#article/info-provenance',first);
  const map=agent.mapContext(second,journey.route(second).q.get('back'));
  assert.equal(map.hash,origin);assert.equal(map.node.id,'knowledge');assert.equal(map.depth,'mechanism');
  const backLink=anchors(agent.readingNav(second,journey.route(second).q.get('back'))).find(x=>x.body.includes('返回刚才的位置'));
  assert.equal(backLink.href,first);
  assert.ok(anchors(agent.readingNav(second,journey.route(second).q.get('back'))).some(x=>x.href===origin));
  assert.equal(loadSite().AGENT_MAP.mapContext(second,journey.route(second).q.get('back')).hash,origin);
  assert.equal(agent.mapContext('#article/comp-data'),null);
  // The closest explicit map owns the reading context, even for another field's article.
  const llmMap=journey.withBack('#map/llm?node=generation&depth=intro',origin);
  const llmArticle=journey.withBack('#article/llm-generation',llmMap);
  assert.equal(agent.mapContext(llmArticle,journey.route(llmArticle).q.get('back')),null);
  assert.equal(site.LLM.mapContext(llmArticle,journey.route(llmArticle).q.get('back')).hash,llmMap);
  const agentMap=journey.withBack('#map/agent?node=loop&depth=mechanism','#map/llm?node=adaptation&depth=boundary');
  assert.equal(site.LLM.mapContext('#article/llm-generation',agentMap),null);
  assert.equal(agent.mapContext('#article/llm-generation',agentMap).hash,agentMap);
});

test('Agent 循环区分提议、观察与完成，失败在预算边界停止',()=>{
  for(const outcome of ['success','failure']){
    const expected=['ready','proposed','observed',outcome==='success'?'completed':'stopped'];
    for(let turn=0;turn<=3;turn++){
      const state=agent.loopState({outcome,turn});
      assert.equal(state.status,expected[turn]);assert.equal(state.turn,turn);assert.equal(state.outcome,outcome);
      assert.equal(state.calls,turn>=2?1:0);assert.equal(state.remaining,1-state.calls);assert.equal(state.done,turn===3);
      assert.ok(state.title && state.text);
    }
  }
  assert.equal(agent.loopState({outcome:'unknown',turn:NaN}).status,'ready');
  assert.equal(agent.loopState({turn:-2}).turn,0);
  assert.equal(agent.loopState({turn:50}).turn,3);
  assert.equal(agent.loopState({turn:1.9}).turn,1);
});

test('三种 Agent 图解可恢复参数并限定为本地示意，不把资料缺失或权限不足写成已执行',()=>{
  const examples=[
    '#article/agent-loop?outcome=failure&turn=3',
    '#article/agent-tools?permission=write&approved=no',
    '#article/agent-tools?permission=write&approved=yes',
    '#article/agent-knowledge?material=old',
    '#article/agent-knowledge?material=none'
  ];
  for(const hash of examples){
    const html=agent.demo(journey.route(hash));
    assert.ok(html.length>100,hash);
    assert.match(html,/示意|虚构|构造/);
    assert.equal(loadSite().AGENT_MAP.demo(journey.route(hash)),html);
  }
  const blocked=agent.demo(journey.route('#article/agent-tools?permission=write&approved=no'));
  const approved=agent.demo(journey.route('#article/agent-tools?permission=write&approved=yes'));
  assert.notEqual(blocked,approved);
  assert.match(blocked,/等待|未批准|未授权|未执行|暂不|不能执行|拦截|阻止/);
  assert.match(agent.demo(journey.route('#article/agent-knowledge?material=none')),/缺|没有|未找到|不足|无可用/);
  const malicious='#article/agent-loop?outcome='+encodeURIComponent('<img src=x onerror=alert(1)>');
  assert.doesNotMatch(agent.demo(journey.route(malicious)),/<img|onerror/);
  assert.equal(agent.demo(journey.route('#article/llm-generation')),'');
});

test('切换 Agent 演示结果重置循环并保留地图上下文，不写入学习或掌握记录',()=>{
  const isolated=loadSite(),rendered=[];
  isolated.JOURNEY.render=r=>rendered.push(r);
  const origin='#map/agent?node=loop&depth=mechanism';
  isolated.sandbox.location.hash=journey.withBack('#article/agent-loop?outcome=success&turn=3',origin);
  const button={dataset:{agentParam:'outcome',value:'failure'}};
  const event={target:{closest(selector){return selector==='button[data-agent-param]'?button:null;}}};
  for(const handler of isolated.handlers.click)handler(event);
  assert.equal(rendered.length,1);
  assert.equal(rendered[0].q.get('outcome'),'failure');
  assert.equal(rendered[0].q.get('turn'),'0');
  assert.equal(rendered[0].q.get('back'),origin);
  assert.equal(isolated.replacements.length,1);
  assert.ok(isolated.focuses.some(f=>f.selector.includes('outcome') && f.selector.includes('failure')));
  assert.deepEqual(isolated.writes,[]);
});

test('搜索既能找到 Agent 整图，也能直达六个知识部分和十篇讲解',()=>{
  const all=catalog.searchItems();
  assert.ok(all.some(x=>x.href==='#map/agent'));
  for(const query of ['Agent','智能体'])assert.ok(catalog.find(query,'ai').some(x=>x.href==='#map/agent'),query);
  for(const node of data.nodes)assert.ok(all.some(x=>x.href.startsWith('#map/agent?') && journey.route(x.href).q.get('node')===node.id),node.id);
  for(const id of [...Object.keys(site.AGENT_ARTICLES),...Object.keys(site.AGENT_FOUNDATIONS)])assert.ok(all.some(x=>x.href==='#article/'+id),id);
});
