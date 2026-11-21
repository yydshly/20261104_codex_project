/* Nested LLM atlas and bounded local illustrations; no model calls or learning scores. */
(() => {
  'use strict';
  const data=()=>window.LLM_DATA;
  const catalog=()=>window.JOURNEY_CATALOG;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=n=>window.feather?.icons[n]?.toSvg({'aria-hidden':'true',width:20,height:20}) || '';
  const base='#map/llm';
  function select(r) {
    return {node:data().nodes.find(n=>n.id===r.q.get('node')) || data().nodes[0],depth:data().depths.some(d=>d.id===r.q.get('depth'))?r.q.get('depth'):'intro'};
  }
  function link(r,changes={}) {
    const selected=select(r),q=new URLSearchParams({node:changes.node || selected.node.id,depth:changes.depth || selected.depth});
    const back=window.JOURNEY.safeBack(r.q.get('back'),'');if(back)q.set('back',back);
    return base+'?'+q.toString();
  }
  function anchor(item,back,body='',classes='') {
    const legacy=item.href.startsWith('#topic/');
    const href=legacy || item.direct?item.href:window.JOURNEY.withBack(item.href,back);
    return `<a class="${classes}" href="${esc(href)}" ${legacy?`data-entry="explore" data-return="${esc(back)}"`:''}>${body || esc(item.title)+' '+icon('arrow-right')}</a>`;
  }
  function entry(back) {
    return `<section class="llm-entry"><p class="eyebrow">再向下展开一个具体方向</p><h3>大语言模型 · LLM</h3><p>文字表示、上下文、生成、训练、适配与评估。先看结构，再按需要补概率、向量与优化。</p>${anchor({href:base,title:'展开大语言模型认知地图'},back,'','button secondary')}</section>`;
  }
  function render(r) {
    const {node,depth}=select(r),stage=node[depth];
    const back=window.JOURNEY.safeBack(r.q.get('back'),'#domain/ai?direction=method');
    const nodeCards=group=>group.map((n,i)=>`<a class="llm-node" href="${esc(link(r,{node:n.id}))}" data-llm-node="${n.id}" ${n.id===node.id?'aria-current="true"':''}><small>${i+1}</small><strong>${esc(n.short)}</strong><p>${esc(n.question)}</p></a>`).join('');
    return `<div class="llm-map-page"><header class="journey-heading llm-heading"><p class="eyebrow">AI → 具体方向 → 知识结构</p><h1>大语言模型 <small>LLM</small></h1><p>${esc(data().lead)}</p><a class="quiet" href="${esc(back)}">${icon('arrow-left')}返回进入这张地图的位置</a></header><div class="llm-map-layout"><section class="llm-structure" tabindex="-1" aria-label="大语言模型知识结构"><figure><figcaption>先看整体：一次生成涉及什么？</figcaption><div class="llm-network llm-generation-chain">${nodeCards(data().nodes.slice(0,3))}</div><p class="llm-demo-note">文字先被表示，再结合可见上下文，产生下一片段的分布；新片段加入后继续生成。</p><div class="llm-map-center">大语言模型<strong>能力从哪里来，又怎样被使用与检验？</strong></div><div class="llm-network">${nodeCards(data().nodes.slice(3))}</div><p class="llm-demo-note">下方三个方面与生成过程相连；它们不是每次回答都要执行的三个步骤。</p></figure><p class="llm-boundary">${esc(data().scope)}</p><h2>随用随补的基础</h2><div class="llm-foundation-links">${data().foundations.map(f=>anchor({href:'#article/'+f.id,title:f.title},r.hash,`<strong>${esc(f.title)} ${icon('arrow-right')}</strong><p>${esc(f.why)}</p>`)).join('')}</div></section><section class="llm-detail" id="llm-detail" tabindex="-1" aria-label="${esc(node.short)}的深入路径"><p class="eyebrow">大语言模型 / ${esc(node.short)}</p><h2>${esc(node.title)}</h2><button class="quiet cog-map-return" type="button" data-llm-map>返回结构图，换个部分 ${icon('arrow-up')}</button><p>${esc(node.question)}</p><div class="cog-inside">${node.contains.map(x=>`<span>${esc(x)}</span>`).join('')}</div><nav class="llm-depth-tabs" aria-label="选择理解深度">${data().depths.map((d,i)=>`<a href="${esc(link(r,{depth:d.id}))}" data-llm-depth="${d.id}" ${depth===d.id?'aria-current="page"':''}><small>0${i+1}</small>${esc(d.label)}</a>`).join('')}</nav><h3>${esc(stage.title)}</h3><p>${esc(stage.text)}</p><div class="llm-concepts">${stage.links.map((x,i)=>anchor(x,r.hash,`<small>${i+1} / 可独立阅读</small><strong>${esc(x.title)} ${icon('arrow-right')}</strong><span>${esc(x.reason)}</span>`)).join('')}</div><section class="llm-prerequisites"><h3>这部分会涉及的基础</h3><details><summary>${esc(data().foundations.find(f=>f.id===node.foundation).title)} · 在这里先认识</summary><p>${esc(catalog().articles[node.foundation].takeaway)}</p>${anchor({href:'#article/'+node.foundation,title:'打开完整基础讲解'},r.hash)}</details></section><section><h3>向外连接，补另一种视角</h3><div class="llm-next-fields">${anchor(node.neighbor,r.hash,`<strong>${esc(node.neighbor.title)} ${icon('arrow-right')}</strong><p>${esc(node.neighbor.reason)}</p>`)}</div></section><p class="llm-boundary"><strong>这条路目前展开到哪里</strong><br>${esc(node.frontier)}</p><nav class="article-pager">${depth!=='intro'?`<a class="quiet" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(x=>x.id===depth)-1].id}))}">${icon('arrow-left')}回到上一层</a>`:''}${depth!=='boundary'?`<a class="button secondary" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(x=>x.id===depth)+1].id}))}">继续看${depth==='intro'?'机制与基础':'应用与边界'} ${icon('arrow-right')}</a>`:''}</nav></section></div></div>`;
  }
  function mapContext(href,back='') {
    let cursor=back;
    for(let i=0;i<7 && typeof cursor==='string';i++) {
      if(cursor.split('?')[0].startsWith('#map/') && cursor.split('?')[0]!==base)return null;
      if(cursor.split('?')[0]===base){const r=window.JOURNEY.route(cursor);if(r?.kind==='map')return {...select(r),hash:cursor};}
      const next=new URLSearchParams(cursor.split('?')[1] || '').get('back');if(!next || next===cursor)break;cursor=next;
    }
    const a=catalog().articles[href.split('?')[0].slice(9)];
    if(!a?.llmNode)return null;
    const node=data().nodes.find(n=>n.id===a.llmNode) || data().nodes[0];
    return {node,depth:a.foundation?'mechanism':'intro',hash:base+'?node='+node.id+'&depth='+(a.foundation?'mechanism':'intro')};
  }
  function wayfinding(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    return `<section class="cog-wayfinding" aria-label="这个知识点在地图中的位置"><nav><a href="#home">认知全景</a>${icon('chevron-right')}<a href="#domain/ai?direction=method">人工智能</a>${icon('chevron-right')}<a href="${esc(c.hash)}">大语言模型 · ${esc(c.node.short)}</a><span>当前知识点</span></nav><p>这里对应“${esc(data().depths.find(d=>d.id===c.depth).label)}”。补完这一点后，可以返回原来的部分与深度。</p></section>`;
  }
  function readingNav(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    const stage=c.node[c.depth],index=stage.links.findIndex(x=>x.href===href.split('?')[0]);
    const next=index>=0?stage.links[index+1]:null;
    const nextDepth=data().depths[Math.min(data().depths.findIndex(d=>d.id===c.depth)+1,2)].id;
    const onward=next || {href:link(window.JOURNEY.route(c.hash),{depth:nextDepth}),direct:true,title:c.depth==='boundary'?'回看这一部分的边界':'展开下一层：'+data().depths.find(d=>d.id===nextDepth).label,reason:'把当前知识点接回结构图，决定下一步要理解什么。'};
    const returnTo=window.JOURNEY.safeBack(back,c.hash),startsAtMap=returnTo.split('?')[0]===base;
    // Legacy topic URLs have no query context. Keep the map as their reading
    // origin so onward links cannot replace it with an untraceable bare topic.
    const readingOrigin=href.startsWith('#topic/')?c.hash:href;
    const cards=[{href:returnTo,direct:true,title:startsAtMap?'返回阅读起点':'返回刚才的位置',reason:startsAtMap?'回到这次阅读所在的地图层级。':'保留此前的方向、深度和图解选择。'}, {href:c.hash,direct:true,title:'回到大语言模型结构图',reason:'继续查看“'+c.node.short+'”的知识与基础。'},onward];
    return `<section class="cog-reading-nav"><p class="eyebrow">把这一点放回大语言模型地图</p><h2>接下来，可以往哪里走？</h2><div class="cog-next-grid">${cards.map(x=>anchor(x,readingOrigin,`<strong>${esc(x.title)} ${icon('arrow-right')}</strong><p>${esc(x.reason)}</p>`)).join('')}</div></section>`;
  }
  function distribution(temperature=1) {
    const t=Number.isFinite(temperature)&&temperature>0?temperature:1;
    const weights=[.6,.3,.1].map(p=>Math.exp((Math.log(p)-Math.log(.6))/t));const total=weights.reduce((a,b)=>a+b,0);
    return weights.map(v=>v/total);
  }
  function demo(r) {
    let body='',title='',note='';
    if(r.id==='llm-tokens') {
      const en=r.q.get('sample')==='en',pieces=en?['Learn','ing',' AI']:['我','喜欢','苹果'];
      title='一段文字，怎样成为输入？';
      body=`<div class="llm-demo-controls" role="group" aria-label="切换分词示意"><button type="button" data-llm-param="sample" data-value="zh" aria-pressed="${!en}">中文示例</button><button type="button" data-llm-param="sample" data-value="en" aria-pressed="${en}">英文示例</button></div><p>输入：<strong>${en?'Learning AI':'我喜欢苹果'}</strong></p><div class="llm-token-pieces">${pieces.map((p,i)=>`<span><small>片段 ${i+1}</small><b>${esc(p).replace(/^ /,'␠')}</b><small>示意编号 ${(en?[61,62,63]:[5,9,17])[i]}</small></span>`).join('')}</div><ol class="llm-flow"><li><strong>片段 → 编号</strong><p>通过分词器与词表对应</p></li><li><strong>编号 → 初始向量</strong><p>从学到的嵌入参数中取表示</p></li><li><strong>结合位置信息</strong><p>让后续计算区分排列关系</p></li></ol>`;
      note='分词边界、编号和三个片段均为教学构造，不调用真实分词器；不同分词器会得到不同结果。␠ 表示空格。向量不是 token 的流水编号。';
    } else if(r.id==='llm-attention') {
      const company=r.q.get('sample')==='company';
      const labels=company?['公司','发布','新款','苹果']:['水果','摊上','摆着','苹果'];
      const weights=company?[.50,.15,.25,.10]:[.60,.10,.20,.10];
      title='同一个“苹果”，前面的线索变了';
      body=`<div class="llm-demo-controls" role="group" aria-label="切换上下文示意"><button type="button" data-llm-param="sample" data-value="fruit" aria-pressed="${!company}">水果情境</button><button type="button" data-llm-param="sample" data-value="company" aria-pressed="${company}">公司情境</button></div><p>示意片段：${labels.map(x=>esc(x)).join(' / ')} / ……</p><div class="llm-attention-grid" aria-label="当前位置关联前文的示意权重">${labels.map((x,i)=>`<div class="llm-prob-row"><span>${esc(x)}</span><span class="bar" style="--value:${weights[i]*100}%"></span><strong>${Math.round(weights[i]*100)}%</strong></div>`).join('')}</div><p class="llm-demo-note">观察“苹果”这个位置：只允许关联当前及前面的片段；右侧尚未生成的内容不可见。多层计算可以改变这个位置的表示。</p>`;
      note='全部权重为人工设定的单头示意，合计100%；不是实际模型测量，也不是模型判断词义的置信度。真实注意力以 token 为单位，涉及多个头、多个层及其他计算；仅看权重不能解释整个输出。';
    } else if(r.id==='llm-generation') {
      const high=r.q.get('temperature')==='high',step=r.q.get('step')==='1',t=high?1.5:.5;
      const labels=step?['。','，','后']:['水','茶','咖啡'],values=distribution(t);
      title='看清候选分布，再接上一个片段';
      body=`<p>当前上下文：<strong>${step?'我喝了一杯水':'我喝了一杯'}</strong></p><div class="llm-demo-controls" role="group" aria-label="改变候选分布"><button type="button" data-llm-param="temperature" data-value="low" aria-pressed="${!high}">较低温度 · 0.5</button><button type="button" data-llm-param="temperature" data-value="high" aria-pressed="${high}">较高温度 · 1.5</button></div><div class="llm-probabilities">${labels.map((label,i)=>`<div class="llm-prob-row"><span>${label}</span><span class="bar" style="--value:${values[i]*100}%"></span><strong>${(values[i]*100).toFixed(1)}%</strong></div>`).join('')}</div><p>三个候选的基础分布设为 60%、30%、10%，按 p 的 1/T 次方重新归一化。温度改变分布的集中程度。</p><button class="button secondary" type="button" data-llm-param="step" data-value="${step?'0':'1'}">${step?'重看第一步':'演示下一步：接上“水”'} ${icon('arrow-right')}</button><p class="llm-demo-note">${step?'“水”已成为新的上下文，现在需要计算下一个片段的分布。第二步的数值也由编辑预设。':'这里固定接上“水”来演示上下文增长。真正采样可能选到别的候选，也可能采用其他解码方式。'}</p>`;
      note='这是仅含三个候选的玩具模型；候选片段不代表真实分词器的单个 token，数字不来自真实模型，显示值经过四舍五入。较低温度并不保证事实正确，较高温度也不等于一定产生有用的创造。';
    }
    return body?`<section class="llm-demo"><p class="eyebrow">可操作的机制图解 · 本地示意</p><h2>${title}</h2>${body}<p class="llm-boundary">${note}</p></section>`:'';
  }
  document.addEventListener('click',event=>{
    const mapButton=event.target.closest('[data-llm-map]');
    if(mapButton){const el=document.querySelector('.llm-structure');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant'});return;}
    const b=event.target.closest('button[data-llm-param]');if(!b)return;
    const r=window.JOURNEY.route(location.hash);if(r?.kind!=='article' || !['llm-tokens','llm-attention','llm-generation'].includes(r.id))return;
    const allowed={sample:['zh','en','fruit','company'],temperature:['low','high'],step:['0','1']};
    if(!Object.hasOwn(allowed,b.dataset.llmParam) || !allowed[b.dataset.llmParam].includes(b.dataset.value))return;
    r.q.set(b.dataset.llmParam,b.dataset.value);r.hash='#article/'+r.id+'?'+r.q.toString();history.replaceState(null,'',r.hash);
    window.JOURNEY.render(r);const selector=b.dataset.llmParam==='step'?'button[data-llm-param="step"]':`[data-llm-param="${b.dataset.llmParam}"][data-value="${b.dataset.value}"]`;document.querySelector(selector)?.focus({preventScroll:true});
  });
  window.LLM={select,link,entry,render,mapContext,wayfinding,readingNav,demo,distribution};
})();
