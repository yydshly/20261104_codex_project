import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const files=['data','ai-data','ai-reading','ai-core','journey-data','ai-expansion','computing-data','education-data','llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog','navigation-data','navigation','roam-data','roam','llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','explore','journey'];
function loadSite() {
  const handlers={},writes=[],focuses=[],replacements=[];
  const sandbox={window:{},URLSearchParams,Number,Math,
    location:{hash:'#map/llm'},
    document:{addEventListener(type,fn){(handlers[type] ||= []).push(fn);},querySelector(selector){return {focus(options){focuses.push({selector,options});},scrollIntoView(){}};}},
    localStorage:{getItem(){return null;},setItem(key,value){writes.push({key,value});}},
    history:{replaceState(state,title,hash){sandbox.location.hash=hash;replacements.push(hash);}}
  };
  for(const file of files)vm.runInNewContext(fs.readFileSync(new URL(`../dist/${file}.js`,import.meta.url),'utf8'),sandbox);
  return {...sandbox.window,handlers,writes,focuses,replacements,sandbox};
}
const site=loadSite(),{LLM:llm,LLM_DATA:data,JOURNEY:journey,JOURNEY_CATALOG:catalog}=site;
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
    const map={agent:site.AGENT_DATA,llm:data,rag:site.RAG_DATA,context:site.CONTEXT_DATA}[r.id];
    if(r.q.has('node'))assert.ok(map.nodes.some(n=>n.id===r.q.get('node')),href);
    if(r.q.has('depth'))assert.ok(map.depths.some(d=>d.id===r.q.get('depth')),href);
  }
}

test('大语言模型有独立地图入口，非法路径不被当作可返回的地图',()=>{
  for(const hash of ['#map/llm','#map/llm?node=training&depth=mechanism']){
    assert.equal(journey.route(hash).kind,'map');
    assert.equal(journey.safeBack(hash,'#home'),hash);
  }
  for(const hash of ['#map','#map/unknown','#map/constructor','#map/llm/overview','#map/llm/a/b']){
    assert.equal(journey.route(hash)?.kind,'missing',hash);
    assert.equal(journey.safeBack(hash,'#home'),'#home',hash);
  }
  for(const value of ['', 'unknown', '__proto__', 'constructor', 'toString']){
    const r=journey.route('#map/llm?'+new URLSearchParams({node:value,depth:value}));
    assert.equal(llm.select(r).node.id,'representation');
    assert.equal(llm.select(r).depth,'intro');
  }
});

test('六个知识部分的三层路径均可阅读，基础和跨域链接落到真实内容',()=>{
  assert.equal(data.nodes.length,6);assert.equal(data.depths.length,3);assert.equal(data.foundations.length,3);
  assert.match(data.scope,/自回归.*Transformer/);
  const back='#domain/ai?direction=method';
  for(const node of data.nodes){
    assert.ok(node.contains.length>=3 && node.frontier && node.neighbor.reason,node.id);
    assert.ok(catalog.articles[node.foundation]?.foundation,node.foundation);
    validTarget(node.neighbor.href);
    for(const depth of data.depths){
      const stage=node[depth.id];
      assert.ok(stage.title && stage.text && stage.links.length,node.id+' / '+depth.id);
      const hash='#map/llm?'+new URLSearchParams({node:node.id,depth:depth.id,back});
      const html=llm.render(journey.route(hash));
      assert.match(html,/随用随补的基础/);
      assert.match(html,/这部分会涉及的基础/);
      assert.match(html,/向外连接/);
      for(const x of stage.links){validTarget(x.href);assert.ok(x.reason,x.href);}
      for(const a of anchors(html)){
        validTarget(a.href);
        if(a.href.startsWith('#topic/'))assert.equal(a.back,hash);
      }
      assert.equal((html.match(/aria-current="true"/g)||[]).length,1);
      assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
    }
  }
});

test('八篇新讲解具有正文、图解、适用边界和可追溯来源，直接访问也能回到地图',()=>{
  const ids=[...Object.keys(site.LLM_ARTICLES),...Object.keys(site.LLM_FOUNDATIONS)];
  assert.equal(ids.length,8);
  for(const id of ids){
    const a=catalog.articles[id];
    assert.ok(a && a.domain==='ai',id);
    assert.ok(a.title && a.lead && a.takeaway && a.sections.length>=3,id);
    assert.ok(a.visual.steps.length>=3 && a.example.title && a.example.text,id);
    assert.ok(a.sources.length>=1,id);
    for(const s of a.sources){assert.ok(s.title,id);assert.equal(new URL(s.url).protocol,'https:',id);}
    for(const related of a.related)assert.ok(catalog.articles[related],id+' → '+related);
    for(const c of a.crossLinks){validTarget(c.href);assert.ok(c.reason,c.href);}
    const c=llm.mapContext('#article/'+id);
    assert.ok(c && data.nodes.some(n=>n.id===c.node.id),id);
    assert.equal(c.depth,a.foundation?'mechanism':'intro',id);
    for(const link of anchors(llm.wayfinding('#article/'+id)+llm.readingNav('#article/'+id)))validTarget(link.href);
  }
});

test('地图选择、深度和搜索来处经跨域阅读与刷新后保持，不把返回参数重复套在回程上',()=>{
  const search='#search?'+new URLSearchParams({q:'大语言模型',domain:'ai'});
  const origin='#map/llm?'+new URLSearchParams({node:'generation',depth:'mechanism',back:search});
  const switched=llm.link(journey.route(origin),{node:'context',depth:'boundary'});
  assert.equal(journey.route(switched).q.get('back'),search);
  assert.equal(llm.select(journey.route(switched)).node.id,'context');
  const first=journey.withBack('#article/llm-probability',origin);
  const second=journey.withBack('#article/education-evidence',first);
  const map=llm.mapContext(second,journey.route(second).q.get('back'));
  assert.equal(map.hash,origin);assert.equal(map.node.id,'generation');assert.equal(map.depth,'mechanism');
  const backLink=anchors(llm.readingNav(second,journey.route(second).q.get('back'))).find(x=>x.body.includes('返回刚才的位置'));
  assert.equal(backLink.href,first);
  const mapLink=anchors(llm.readingNav(second,journey.route(second).q.get('back'))).find(x=>x.body.includes('回到大语言模型结构图'));
  assert.equal(mapLink.href,origin);
  const fresh=loadSite();
  assert.equal(fresh.LLM.select(fresh.JOURNEY.route(origin)).depth,'mechanism');
  assert.equal(llm.mapContext('#article/comp-data'),null);
  const sanitized=journey.route(llm.link(journey.route('#map/llm?back=https%3A%2F%2Fexample.com')));
  assert.equal(sanitized.q.has('back'),false);
});

test('温度图解使用归一化分布，较低温度更集中，非法输入采用默认值',()=>{
  const low=Array.from(llm.distribution(.5)), high=Array.from(llm.distribution(1.5));
  for(const values of [low,high,Array.from(llm.distribution(1))]){
    assert.ok(values.every(x=>Number.isFinite(x) && x>=0 && x<=1));
    assert.ok(Math.abs(values.reduce((a,b)=>a+b,0)-1)<1e-12);
  }
  assert.ok(low[0]>high[0]);assert.ok(low[2]<high[2]);
  assert.ok(Math.abs(low[0]-.36/.46)<1e-12);
  for(const invalid of [0,-1,NaN,Infinity,'high'])assert.deepEqual(Array.from(llm.distribution(invalid)),Array.from(llm.distribution(1)));
});

test('经旧专题继续阅读时保留原地图层级，不退到文章默认位置或产生返回自环',()=>{
  const origin='#map/llm?node=evaluation&depth=mechanism';
  const nav=anchors(llm.readingNav('#topic/false-positives',origin));
  const onward=nav.find(a=>a.body.includes('概率与事实判断'));
  assert.equal(journey.route(onward.href).q.get('back'),origin);
  assert.equal(llm.mapContext(onward.href,journey.route(onward.href).q.get('back')).node.id,'evaluation');
  assert.equal(anchors(llm.readingNav(onward.href,origin)).find(a=>a.body.includes('返回阅读起点')).href,origin);
  const training='#map/llm?node=training&depth=boundary';
  const oldNext=anchors(llm.readingNav('#topic/generalization',training)).find(a=>a.href==='#topic/data-quality');
  assert.equal(oldNext.back,training);
  assert.equal(llm.mapContext(oldNext.href,oldNext.back).hash,training);
  assert.equal(anchors(llm.readingNav(oldNext.href,oldNext.back)).find(a=>a.body.includes('返回阅读起点')).href,training);
});

test('三个互动图解提供明确示意范围，刷新恢复选择且未知参数不会进入HTML',()=>{
  const examples=[
    ['#article/llm-tokens?sample=en',/Learning AI/,/不调用真实分词器/],
    ['#article/llm-attention?sample=company',/公司/,/人工设定.*不是实际模型测量/],
    ['#article/llm-generation?temperature=high&step=1',/我喝了一杯水/,/玩具模型/]
  ];
  for(const [hash,content,boundary] of examples){
    const html=llm.demo(journey.route(hash));
    assert.match(html,content);assert.match(html,boundary);
    assert.equal(loadSite().LLM.demo(journey.route(hash)),html);
  }
  const malicious='#article/llm-tokens?sample='+encodeURIComponent('<img src=x onerror=alert(1)>');
  const html=llm.demo(journey.route(malicious));
  assert.match(html,/中文示例/);assert.doesNotMatch(html,/<img|onerror/);
  assert.equal(llm.demo(journey.route('#article/ai-context')),'');
});

test('操作图解更新URL并重绘而不写掌握记录，保留进入地图的node与depth',()=>{
  const isolated=loadSite(),rendered=[];
  isolated.JOURNEY.render=r=>rendered.push(r);
  const origin='#map/llm?node=generation&depth=intro';
  isolated.sandbox.location.hash=journey.withBack('#article/llm-generation',origin);
  const button={dataset:{llmParam:'temperature',value:'high'}};
  const event={target:{closest(selector){return selector==='button[data-llm-param]'?button:null;}}};
  for(const handler of isolated.handlers.click)handler(event);
  assert.equal(rendered.length,1);
  assert.equal(rendered[0].q.get('temperature'),'high');
  assert.equal(rendered[0].q.get('back'),origin);
  assert.equal(isolated.replacements.length,1);
  assert.ok(isolated.focuses.some(f=>f.selector.includes('temperature') && f.selector.includes('high')));
  assert.deepEqual(isolated.writes,[]);
});

test('搜索既能进入整张LLM地图，也能定位六个部分与八篇讲解',()=>{
  const all=catalog.searchItems();
  assert.ok(all.some(x=>x.href==='#map/llm'));
  assert.ok(catalog.find('大语言模型','ai').some(x=>x.href==='#map/llm'));
  for(const node of data.nodes){
    assert.ok(all.some(x=>x.href.startsWith('#map/llm?') && journey.route(x.href).q.get('node')===node.id),node.id);
  }
  for(const id of [...Object.keys(site.LLM_ARTICLES),...Object.keys(site.LLM_FOUNDATIONS)])assert.ok(all.some(x=>x.href==='#article/'+id),id);
});
