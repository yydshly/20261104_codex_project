/* A local, editorial map of LLM-powered agents. Illustrations never execute tools. */
(() => {
  'use strict';
  const data=()=>window.AGENT_DATA, catalog=()=>window.JOURNEY_CATALOG;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=n=>window.feather?.icons[n]?.toSvg({'aria-hidden':'true',width:20,height:20}) || '';
  const base='#map/agent';
  function select(r) {
    return {node:data().nodes.find(n=>n.id===r.q.get('node')) || data().nodes[0],depth:data().depths.some(d=>d.id===r.q.get('depth'))?r.q.get('depth'):'intro'};
  }
  function link(r,changes={}) {
    const chosen=select(r),q=new URLSearchParams({node:changes.node || chosen.node.id,depth:changes.depth || chosen.depth});
    const back=window.JOURNEY.safeBack(r.q.get('back'),'');if(back)q.set('back',back);
    return base+'?'+q;
  }
  function anchor(item,back,body='',classes='') {
    const legacy=item.href.startsWith('#topic/');
    const href=legacy || item.direct?item.href:window.JOURNEY.withBack(item.href,back);
    return `<a class="${classes}" href="${esc(href)}" ${legacy?`data-entry="explore" data-return="${esc(back)}"`:''}>${body || esc(item.title)+' '+icon('arrow-right')}</a>`;
  }
  function entry(back) {
    return `<section class="llm-entry agent-entry"><p class="eyebrow">把模型放进能推进任务的系统</p><h3>AI 智能体 · Agent</h3><p>目标、循环、工具、状态、资料与控制。看清它需要什么，以及怎样连接大语言模型和信息组织。</p>${anchor({href:base,title:'展开 Agent 认知地图'},back,'','button secondary')}</section>`;
  }
  function relationship(r) {
    const nodeLink=node=>r.kind==='map'?link(r,{node}):window.JOURNEY.withBack(base+'?node='+node+'&depth=intro',r.hash);
    const items=[
      {href:'#map/llm?node=generation&depth=intro',title:'大语言模型',role:'提供处理与生成能力',text:'理解输入、提出步骤或工具调用；输出仍需检查。'},
      {href:nodeLink('loop'),direct:true,title:'Agent 系统',role:'围绕目标组织行动',text:'维护状态，安排下一步，把工具反馈带回流程。',hub:true},
      {href:'#domain/information?direction=retrieval',title:'信息组织',role:'让材料可找、可辨、可追溯',text:'描述、索引、检索与版本决定拿到什么资料。'},
      {href:nodeLink('tools'),direct:true,title:'工具与运行程序',role:'在权限内实际执行',text:'查询、计算或写入由程序执行，结果回到 Agent。'}
    ];
    return `<section class="agent-relations"><header class="section-heading"><div><p class="eyebrow">先把它放回整体</p><h2>Agent、模型与信息组织，各做什么？</h2></div></header><div class="agent-relationship">${items.map(x=>anchor(x,r.hash,`<small>${esc(x.role)}</small><strong>${esc(x.title)} ${icon('arrow-right')}</strong><p>${esc(x.text)}</p>`,x.hub?'agent-hub':'')).join('')}</div><p class="map-caption">这是职责关系，不是四个依次执行的步骤。Agent 可以多次调用模型和工具；资料组织质量影响它获得的依据。</p></section>`;
  }
  function render(r) {
    const {node,depth}=select(r),stage=node[depth],back=window.JOURNEY.safeBack(r.q.get('back'),'#domain/ai?direction=system');
    const nodes=group=>group.map((n,i)=>`<a class="llm-node" href="${esc(link(r,{node:n.id}))}" data-agent-node="${n.id}" ${n.id===node.id?'aria-current="true"':''}><small>${i+1}</small><strong>${esc(n.short)}</strong><p>${esc(n.question)}</p></a>`).join('');
    return `<div class="llm-map-page agent-map-page"><header class="journey-heading llm-heading"><p class="eyebrow">AI → 具体方向 → 知识结构</p><h1>AI 智能体 <small>Agent</small></h1><p>${esc(data().lead)}</p><a class="quiet" href="${esc(back)}">${icon('arrow-left')}返回进入这张地图的位置</a><button class="button secondary agent-map-shortcut" type="button" data-agent-map>直接看六个知识部分 ${icon('arrow-down')}</button></header>${relationship(r)}<div class="llm-map-layout"><section class="llm-structure agent-structure" tabindex="-1" aria-label="Agent 知识结构"><figure><figcaption>从目标出发：怎样决定并推进下一步？</figcaption><div class="llm-network llm-generation-chain">${nodes(data().nodes.slice(0,3))}</div><p class="llm-demo-note">目标约束下一步；工具的观察结果返回循环，决定继续、调整还是停止。</p><div class="llm-map-center">Agent<strong>行动需要哪些支撑，又怎样保持可控？</strong></div><div class="llm-network">${nodes(data().nodes.slice(3))}</div><p class="llm-demo-note">状态、资料与控制贯穿执行过程，不是最后才补上的三个步骤。</p></figure><p class="llm-boundary">${esc(data().scope)}</p><h2>随用随补的基础</h2><div class="llm-foundation-links">${data().foundations.map(f=>anchor({href:'#article/'+f.id,title:f.title},r.hash,`<strong>${esc(f.title)} ${icon('arrow-right')}</strong><p>${esc(f.why)}</p>`)).join('')}</div></section><section class="llm-detail" id="agent-detail" tabindex="-1" aria-label="${esc(node.short)}的深入路径"><p class="eyebrow">Agent / ${esc(node.short)}</p><h2>${esc(node.title)}</h2><button class="quiet cog-map-return" type="button" data-agent-map>返回结构图，换个部分 ${icon('arrow-up')}</button><p>${esc(node.question)}</p><div class="cog-inside">${node.contains.map(x=>`<span>${esc(x)}</span>`).join('')}</div><nav class="llm-depth-tabs" aria-label="选择理解深度">${data().depths.map((d,i)=>`<a href="${esc(link(r,{depth:d.id}))}" data-agent-depth="${d.id}" ${depth===d.id?'aria-current="page"':''}><small>0${i+1}</small>${esc(d.label)}</a>`).join('')}</nav><h3>${esc(stage.title)}</h3><p>${esc(stage.text)}</p><div class="llm-concepts">${stage.links.map((x,i)=>anchor(x,r.hash,`<small>${i+1} / 可独立阅读</small><strong>${esc(x.title)} ${icon('arrow-right')}</strong><span>${esc(x.reason)}</span>`)).join('')}</div><section class="llm-prerequisites"><h3>这部分会涉及的基础</h3><details><summary>${esc(data().foundations.find(f=>f.id===node.foundation).title)} · 在这里先认识</summary><p>${esc(catalog().articles[node.foundation].takeaway)}</p>${anchor({href:'#article/'+node.foundation,title:'打开完整基础讲解'},r.hash)}</details></section><section><h3>向外连接，补另一种视角</h3><div class="llm-next-fields">${anchor(node.neighbor,r.hash,`<strong>${esc(node.neighbor.title)} ${icon('arrow-right')}</strong><p>${esc(node.neighbor.reason)}</p>`)}</div></section><p class="llm-boundary"><strong>这条路目前展开到哪里</strong><br>${esc(node.frontier)}</p><nav class="article-pager">${depth!=='intro'?`<a class="quiet" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(d=>d.id===depth)-1].id}))}">${icon('arrow-left')}回到上一层</a>`:''}${depth!=='boundary'?`<a class="button secondary" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(d=>d.id===depth)+1].id}))}">继续看${depth==='intro'?'机制与基础':'应用与边界'} ${icon('arrow-right')}</a>`:''}</nav></section></div></div>`;
  }
  function mapContext(href,back='') {
    let cursor=back;
    for(let i=0;i<7 && typeof cursor==='string';i++) {
      const path=cursor.split('?')[0];
      if(path===base){const r=window.JOURNEY.route(cursor);if(r?.kind==='map')return {...select(r),hash:cursor};}
      if(path.startsWith('#map/') && path!==base)return null;
      const next=new URLSearchParams(cursor.split('?')[1] || '').get('back');if(!next || next===cursor)break;cursor=next;
    }
    const a=catalog().articles[href.split('?')[0].slice(9)];if(!a?.agentNode)return null;
    const node=data().nodes.find(n=>n.id===a.agentNode) || data().nodes[0],depth=a.foundation?'mechanism':'intro';
    return {node,depth,hash:base+'?node='+node.id+'&depth='+depth};
  }
  function wayfinding(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    return `<section class="cog-wayfinding" aria-label="这个知识点在地图中的位置"><nav><a href="#home">认知全景</a>${icon('chevron-right')}<a href="#domain/ai?direction=system">人工智能</a>${icon('chevron-right')}<a href="${esc(c.hash)}">Agent · ${esc(c.node.short)}</a><span>当前知识点</span></nav><p>这里对应“${esc(data().depths.find(d=>d.id===c.depth).label)}”。补完这一点后，可以返回原来的部分与深度。</p></section>`;
  }
  function readingNav(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    const stage=c.node[c.depth],index=stage.links.findIndex(x=>x.href===href.split('?')[0]),next=index>=0?stage.links[index+1]:null;
    const nextDepth=data().depths[Math.min(data().depths.findIndex(d=>d.id===c.depth)+1,2)].id;
    const onward=next || {href:link(window.JOURNEY.route(c.hash),{depth:nextDepth}),direct:true,title:c.depth==='boundary'?'回看这一部分的边界':'展开下一层：'+data().depths.find(d=>d.id===nextDepth).label,reason:'把这一点放回结构图，选择下一步要理解什么。'};
    const returnTo=window.JOURNEY.safeBack(back,c.hash),atMap=returnTo.split('?')[0].startsWith('#map/'),origin=href.startsWith('#topic/')?c.hash:href;
    const cards=[{href:returnTo,direct:true,title:atMap?'返回阅读起点':'返回刚才的位置',reason:atMap?'回到这次阅读所在的地图层级。':'保留此前的方向、深度和图解选择。'},{href:c.hash,direct:true,title:'回到 Agent 结构图',reason:'继续查看“'+c.node.short+'”的知识与基础。'},onward];
    return `<section class="cog-reading-nav"><p class="eyebrow">把这一点放回 Agent 地图</p><h2>接下来，可以往哪里走？</h2><div class="cog-next-grid">${cards.map(x=>anchor(x,origin,`<strong>${esc(x.title)} ${icon('arrow-right')}</strong><p>${esc(x.reason)}</p>`)).join('')}</div></section>`;
  }
  function loopState(input={}) {
    const turn=Number.isFinite(Number(input.turn))?Math.max(0,Math.min(3,Math.floor(Number(input.turn)))):0,outcome=input.outcome==='failure'?'failure':'success';
    const stages=[['ready','明确这次任务','目标：查出虚构“星桥资料馆”的现行周六闭馆时间，并指出依据。这里只允许查阅一次资料。'],['proposed','提出一次工具调用','模型可能提出查阅通知的请求；运行程序先检查工具、参数与权限。提出请求还不等于已经执行。'],['observed',outcome==='success'?'收到工具观察结果':'收到失败信息',outcome==='success'?'模拟检索返回一份现行通知：周六 16:00 闭馆，并附版本与出处。下一步仍需检查材料是否支持问题。':'模拟检索超时，没有拿到通知。失败信息可以更新状态，但不能当作开放时间的依据。'],[outcome==='success'?'completed':'stopped',outcome==='success'?'核对后交付':'额度耗尽，停止并交还',outcome==='success'?'示例核对了通知的对象与生效范围，交付“按该通知，周六 16:00 闭馆”并保留来源。完成与否依据任务条件。':'这次只允许一次外部调用，额度已经用完。应报告尚未查证、请求补充资料或交由人处理；不能编出时间或无限重试。']];
    const [status,title,text]=stages[turn],calls=turn>=2?1:0;
    return {turn,outcome,status,title,text,calls,remaining:1-calls,done:turn===3};
  }
  const control=(name,value,label,selected)=>`<button type="button" data-agent-param="${name}" data-value="${value}" aria-pressed="${selected}">${label}</button>`;
  function demo(r) {
    let title='',body='',note='';
    if(r.id==='agent-loop') {
      const s=loopState({outcome:r.q.get('outcome'),turn:r.q.get('turn')});
      title='走一遍：目标 → 行动 → 观察 → 再决定';
      body=`<div class="llm-demo-controls" role="group" aria-label="选择工具结果">${control('outcome','success','工具返回资料',s.outcome==='success')}${control('outcome','failure','工具调用失败',s.outcome==='failure')}</div><ol class="agent-cycle">${['明确目标','提出行动','接收观察','检查与决定'].map((x,i)=>`<li ${i===s.turn?'aria-current="step"':''} data-state="${i<s.turn?'done':i===s.turn?'current':'pending'}"><small>0${i+1}</small><strong>${x}</strong></li>`).join('')}</ol><p class="llm-demo-note">反馈回到下一步决策 ↶ 有足够权限与剩余额度才可继续；满足完成条件或触及边界就停止。</p><section class="agent-observation" aria-live="polite"><p class="agent-status" data-status="${s.status}">第 ${s.turn+1} 步 / 4 · 模拟调用 ${s.calls} / 1 次 · 剩余 ${s.remaining} 次</p><h3>${s.title}</h3><p>${s.text}</p></section><div class="agent-run-actions">${s.turn>0?`<button type="button" class="button secondary" data-agent-param="turn" data-value="${s.turn-1}">回看上一步</button>`:''}<button type="button" class="button primary" data-agent-param="turn" data-value="${s.done?0:s.turn+1}">${s.done?'重新演示':'继续看下一步'} ${icon('arrow-right')}</button></div>`;
      note='步骤、资料和结果全部预设；没有调用模型或工具。一次调用的预算是本例的教学约束。真实系统可能有多次循环、并行步骤或人工接手，任务也可能不适合 Agent。';
    } else if(r.id==='agent-tools') {
      const write=r.q.get('permission')==='write',approved=r.q.get('approved')==='yes',allowed=!write || approved;
      title='同样是工具调用，查阅与写入有什么不同？';
      body=`<div class="llm-demo-controls" role="group" aria-label="选择工具类型">${control('permission','read','查阅通知 · 只读',!write)}${control('permission','write','发布答复 · 写入',write)}</div><ol class="llm-flow"><li><strong>模型提议</strong><p>${write?'发布一条资料馆时间说明':'查询资料馆现行通知'}</p></li><li><strong>程序核对</strong><p>工具名、参数、权限与批准范围</p></li><li><strong>执行或拦住</strong><p>${allowed?'本例允许进入模拟执行':'本例缺少写入批准，应暂停'}</p></li></ol>${write?`<div class="llm-demo-controls" role="group" aria-label="模拟批准范围">${control('approved','no','尚未批准发布',!approved)}${control('approved','yes','模拟：已批准这次发布',approved)}</div>`:''}<section class="agent-observation" aria-live="polite"><h3>${allowed?'演示结果：在范围内继续':'演示结果：暂停，等待确认'}</h3><p>${write?(approved?'示例只批准发布这一条说明；不能扩展为修改其他资料。仍需检查是否写入成功，超时后也不能盲目重复发布。':'能生成发布请求，不代表已经获得发布权限。运行程序应挡住这一步，向人说明具体内容与影响。'):'本例预先允许查询公开通知。真实只读工具也可能读取敏感资料，因此仍要限制数据范围和访问权限。'}</p></section>`;
      note='这是权限分工的本地示意。按钮不会授予真实权限，不会查阅或发布任何内容。是否需要确认，应结合影响、已有授权与具体场景决定；仅靠提示词不能替代程序限制。';
    } else if(r.id==='agent-knowledge') {
      const material=['current','old','none'].includes(r.q.get('material'))?r.q.get('material'):'current';
      const samples={current:['现行通知 · 版本 B','自 2026-11-01 生效；周六 16:00 闭馆。','这份虚构材料的版本与对象符合示例问题，可据此回答，并保留出处与适用条件。'],old:['历史通知 · 版本 A','适用至 2026-10-31；周六 18:00 闭馆。','关键词很相近，但版本已经结束适用。Agent 应继续寻找现行依据，或明确说明尚未查证。'],none:['没有检索到适用通知','没有可引用的来源或生效信息。','没有找到材料不等于现实中没有答案。可以调整检索、请求资料或停止；不应把模型续写当作查证结果。']},m=samples[material];
      title='Agent 能否回答，也取决于它拿到了什么';
      body=`<p>虚构任务：依据 2026 年 11 月的现行通知，说明星桥资料馆周六几点闭馆。</p><div class="llm-demo-controls" role="group" aria-label="切换检索到的材料">${control('material','current','现行材料',material==='current')}${control('material','old','过期材料',material==='old')}${control('material','none','缺少材料',material==='none')}</div><ol class="llm-flow"><li><strong>组织资料</strong><p>描述对象、主题、来源与版本</p></li><li><strong>检索与筛选</strong><p>找到相关且适用的内容</p></li><li><strong>进入上下文</strong><p>作为模型处理任务的输入</p></li><li><strong>Agent 核查</strong><p>检查支持范围，决定回答或继续找</p></li></ol><section class="agent-observation" aria-live="polite"><p class="agent-status">模拟检索结果</p><h3>${m[0]}</h3><p>${m[1]}</p><p class="reading-takeaway">${m[2]}</p></section><div class="actions">${anchor({href:'#domain/information?direction=provenance',title:'展开信息组织：来源与版本'},r.hash,'','button secondary')}${anchor({href:'#map/llm?node=context&depth=boundary',title:'回看模型：材料怎样进入上下文'},r.hash,'','quiet')}</div>`;
      note='资料馆、通知与结果均为虚构；这里比较信息条件，不测量实际 Agent 能力。补充检索材料通常改变本次输入，不等于修改模型参数；找到来源后仍需核对主张。';
    }
    if(r.id==='agent-composition')return relationship(r);
    return body?`<section class="llm-demo agent-demo"><p class="eyebrow">可操作的机制图解 · 本地示意</p><h2>${title}</h2>${body}<p class="llm-boundary">${note}</p></section>`:'';
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-agent-map]')){const el=document.querySelector('.agent-structure');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant'});return;}
    const b=event.target.closest('button[data-agent-param]');if(!b)return;
    const r=window.JOURNEY.route(location.hash);if(r?.kind!=='article')return;
    const allowed={'agent-loop':{outcome:['success','failure'],turn:['0','1','2','3']},'agent-tools':{permission:['read','write'],approved:['yes','no']},'agent-knowledge':{material:['current','old','none']}};
    const options=allowed[r.id];if(!options || !Object.hasOwn(options,b.dataset.agentParam) || !options[b.dataset.agentParam].includes(b.dataset.value))return;
    r.q.set(b.dataset.agentParam,b.dataset.value);if(b.dataset.agentParam==='outcome')r.q.set('turn','0');
    r.hash='#article/'+r.id+'?'+r.q;history.replaceState(null,'',r.hash);window.JOURNEY.render(r);
    const selector=b.dataset.agentParam==='turn'?'.agent-run-actions .primary':`button[data-agent-param="${b.dataset.agentParam}"][data-value="${b.dataset.value}"]`;
    document.querySelector(selector)?.focus({preventScroll:true});
  });
  window.AGENT_MAP={select,link,entry,render,mapContext,wayfinding,readingNav,demo,loopState};
})();
