/* A local, editorial map of prompt and context engineering. All examples are editorial. */
(() => {
  'use strict';
  const data=()=>window.CONTEXT_DATA, catalog=()=>window.JOURNEY_CATALOG;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=n=>window.feather?.icons[n]?.toSvg({'aria-hidden':'true',width:20,height:20}) || '';
  const base='#map/context';
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
    return `<section class="llm-entry context-entry"><p class="eyebrow">组织模型当次能看到的信息</p><h3>提示词与上下文工程</h3><p>任务、指令、示例、材料、状态与验证。先把要求说清楚，再看每次输入怎样被准备和更新。</p>${anchor({href:base,title:'展开提示词与上下文认知地图'},back,'','button secondary')}</section>`;
  }
  function relationship(r) {
    const hub=r.kind==='map'?link(r,{node:'selection'}):window.JOURNEY.withBack(base+'?node=selection&depth=intro',r.hash);
    const items=[
      {href:'#map/llm?node=context&depth=intro',title:'大语言模型',role:'处理当次输入，生成输出',text:'上下文是本次可参考的信息；窗口大小与使用能力是不同限制。'},
      {href:hub,direct:true,title:'提示词与上下文工程',role:'表达任务，准备并维护输入',text:'把要求、示例、资料与状态放到合适位置，并随任务进展更新。',hub:true},
      {href:'#map/agent?node=state&depth=intro',title:'AI 智能体 Agent',role:'组织行动与多轮反馈',text:'每轮需要带入目标、进展、工具结果；保存下来的状态还需按需读取。'},
      {href:'#map/rag?node=context&depth=intro',title:'RAG · 检索增强生成',role:'寻找并引入外部依据',text:'检索提供候选材料，上下文组装决定本次选入什么、保留哪些条件。'}
    ];
    return `<section class="context-relations"><header class="section-heading"><div><p class="eyebrow">先把它放回整体</p><h2>提示词、上下文与模型、Agent、RAG 怎样相连？</h2></div></header><div class="context-relationship">${items.map(x=>anchor(x,r.hash,`<small>${esc(x.role)}</small><strong>${esc(x.title)} ${icon('arrow-right')}</strong><p>${esc(x.text)}</p>`,x.hub?'context-hub':'')).join('')}</div><p class="map-caption">连线表示职责关系。提示词与上下文工程有重叠，并没有唯一的术语边界；这里把任务表达与整次输入的组织分开理解。单次问答也需要准备上下文，不一定要有 Agent 或 RAG。</p></section>`;
  }
  function pipeline(r) {
    const steps=[['说明这次要做什么','写明目标、材料边界与检查条件','task'],['组织当次可见输入','选择指令、示例、资料与必要的历史','selection'],['读取输出与反馈','核对任务结果；工具提议仍需程序执行','evaluation'],['更新下一轮信息','保留进展、来源与未解决事项，按需再读取','state']];
    return `<section class="context-process"><p class="eyebrow">一次输入，也处在更长的过程里</p><h2>说明任务 → 准备输入 → 检查结果 → 更新状态</h2><ol class="context-cycle">${steps.map(([title,text,node])=>`<li>${anchor({href:r.kind==='map'?link(r,{node}):window.JOURNEY.withBack(base+'?node='+node+'&depth=intro',r.hash),direct:true},r.hash,`<strong>${title} ${icon('arrow-right')}</strong><p>${text}</p>`)}</li>`).join('')}</ol><p class="map-caption">下一轮可能回到其中任何一步。是否有效，需要在具体任务上检验；调整输入通常不更新模型参数，数据是否被另行用于训练是另一件事。</p></section>`;
  }
  function render(r) {
    const {node,depth}=select(r),stage=node[depth],back=window.JOURNEY.safeBack(r.q.get('back'),'#domain/ai?direction=system');
    const nodes=(group,offset=0)=>group.map((n,i)=>`<a class="llm-node" href="${esc(link(r,{node:n.id}))}" data-context-node="${n.id}" ${n.id===node.id?'aria-current="true"':''}><small>${i+1+offset}</small><strong>${esc(n.short)}</strong><p>${esc(n.question)}</p></a>`).join('');
    return `<div class="llm-map-page context-map-page"><header class="journey-heading llm-heading"><p class="eyebrow">AI → 具体方向 → 知识结构</p><h1>提示词与<br class="context-title-break">上下文工程</h1><p>${esc(data().lead)}</p><a class="quiet" href="${esc(back)}">${icon('arrow-left')}返回进入这张地图的位置</a><button class="button secondary context-map-shortcut" type="button" data-context-map>直接看六个知识部分 ${icon('arrow-down')}</button></header>${relationship(r)}<div class="llm-map-layout"><section class="llm-structure context-structure" tabindex="-1" aria-label="提示词与上下文知识结构"><figure><figcaption>先把任务表达清楚：要做什么，怎样才算完成？</figcaption><div class="llm-network">${nodes(data().nodes.slice(0,3))}</div><p class="llm-demo-note">目标、指令与示例相互补充；具体格式要服务于任务，而不是套用固定咒语。</p><div class="llm-map-center">本次可见输入<strong>信息怎样进入、保留与更新？</strong></div><div class="llm-network">${nodes(data().nodes.slice(3),3)}</div><p class="llm-demo-note">材料、状态与验证让任务持续推进；这六部分是一种阅读框架，不是每次必做的六个步骤。</p></figure><p class="llm-boundary">${esc(data().scope)}</p><h2>随用随补的基础</h2><div class="llm-foundation-links">${data().foundations.map(f=>anchor({href:'#article/'+f.id,title:f.title},r.hash,`<strong>${esc(f.title)} ${icon('arrow-right')}</strong><p>${esc(f.why)}</p>`)).join('')}</div></section><section class="llm-detail" id="context-detail" tabindex="-1" aria-label="${esc(node.short)}的深入路径"><p class="eyebrow">提示词与上下文 / ${esc(node.short)}</p><h2>${esc(node.title)}</h2><button class="quiet cog-map-return" type="button" data-context-map>返回结构图，换个部分 ${icon('arrow-up')}</button><p>${esc(node.question)}</p><div class="cog-inside">${node.contains.map(x=>`<span>${esc(x)}</span>`).join('')}</div><nav class="llm-depth-tabs" aria-label="选择理解深度">${data().depths.map((d,i)=>`<a href="${esc(link(r,{depth:d.id}))}" data-context-depth="${d.id}" ${depth===d.id?'aria-current="page"':''}><small>0${i+1}</small>${esc(d.label)}</a>`).join('')}</nav><h3>${esc(stage.title)}</h3><p>${esc(stage.text)}</p><div class="llm-concepts">${stage.links.map((x,i)=>anchor(x,r.hash,`<small>${i+1} / 可独立阅读</small><strong>${esc(x.title)} ${icon('arrow-right')}</strong><span>${esc(x.reason)}</span>`)).join('')}</div><section class="llm-prerequisites"><h3>这部分会涉及的基础</h3><details><summary>${esc(data().foundations.find(f=>f.id===node.foundation).title)} · 在这里先认识</summary><p>${esc(catalog().articles[node.foundation].takeaway)}</p>${anchor({href:'#article/'+node.foundation,title:'打开完整基础讲解'},r.hash)}</details></section><section><h3>向外连接，补另一种视角</h3><div class="llm-next-fields">${anchor(node.neighbor,r.hash,`<strong>${esc(node.neighbor.title)} ${icon('arrow-right')}</strong><p>${esc(node.neighbor.reason)}</p>`)}</div></section><p class="llm-boundary"><strong>这条路目前展开到哪里</strong><br>${esc(node.frontier)}</p><nav class="article-pager">${depth!=='intro'?`<a class="quiet" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(d=>d.id===depth)-1].id}))}">${icon('arrow-left')}回到上一层</a>`:''}${depth!=='boundary'?`<a class="button secondary" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(d=>d.id===depth)+1].id}))}">继续看${depth==='intro'?'机制与基础':'应用与边界'} ${icon('arrow-right')}</a>`:''}</nav></section></div>${pipeline(r)}</div>`;
  }
  function mapContext(href,back='') {
    let cursor=back;
    for(let i=0;i<7 && typeof cursor==='string';i++) {
      const path=cursor.split('?')[0];
      if(path===base){const r=window.JOURNEY.route(cursor);if(r?.kind==='map')return {...select(r),hash:cursor};}
      if(path.startsWith('#map/') && path!==base)return null;
      const next=new URLSearchParams(cursor.split('?')[1] || '').get('back');if(!next || next===cursor)break;cursor=next;
    }
    const a=catalog().articles[href.split('?')[0].slice(9)];if(!a?.contextNode)return null;
    const node=data().nodes.find(n=>n.id===a.contextNode) || data().nodes[0],depth=a.foundation?'mechanism':'intro';
    return {node,depth,hash:base+'?node='+node.id+'&depth='+depth};
  }
  function wayfinding(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    return `<section class="cog-wayfinding" aria-label="这个知识点在地图中的位置"><nav><a href="#home">认知全景</a>${icon('chevron-right')}<a href="#domain/ai?direction=system">人工智能</a>${icon('chevron-right')}<a href="${esc(c.hash)}">提示词与上下文 · ${esc(c.node.short)}</a><span>当前知识点</span></nav><p>这里对应“${esc(data().depths.find(d=>d.id===c.depth).label)}”。补完这一点后，可以返回原来的部分与深度。</p></section>`;
  }
  function readingNav(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    const stage=c.node[c.depth],index=stage.links.findIndex(x=>x.href===href.split('?')[0]),next=index>=0?stage.links[index+1]:null;
    const nextDepth=data().depths[Math.min(data().depths.findIndex(d=>d.id===c.depth)+1,2)].id;
    const onward=next || {href:link(window.JOURNEY.route(c.hash),{depth:nextDepth}),direct:true,title:c.depth==='boundary'?'回看这一部分的边界':'展开下一层：'+data().depths.find(d=>d.id===nextDepth).label,reason:'把这一点放回结构图，选择下一步要理解什么。'};
    const returnTo=window.JOURNEY.safeBack(back,c.hash),atMap=returnTo.split('?')[0].startsWith('#map/'),origin=href.startsWith('#topic/')?c.hash:href;
    const cards=[{href:returnTo,direct:true,title:atMap?'返回阅读起点':'返回刚才的位置',reason:atMap?'回到这次阅读所在的地图层级。':'保留此前的方向、深度和图解选择。'},{href:c.hash,direct:true,title:'回到提示词与上下文结构图',reason:'继续查看“'+c.node.short+'”的知识与基础。'},onward];
    return `<section class="cog-reading-nav"><p class="eyebrow">把这一点放回提示词与上下文地图</p><h2>接下来，可以往哪里走？</h2><div class="cog-next-grid">${cards.map(x=>anchor(x,origin,`<strong>${esc(x.title)} ${icon('arrow-right')}</strong><p>${esc(x.reason)}</p>`)).join('')}</div></section>`;
  }
  const pieces=[
    {id:'instruction',title:'任务说明',text:'依据现行规则回答；给出原文依据，未说明的内容保留未知。',units:2},
    {id:'question',title:'当前问题',text:'星桥资料馆的珍本可以带走吗？',units:1},
    {id:'history',title:'无关的上轮讨论',text:'此前讨论了去资料馆的交通路线，本题不需要这些细节。',units:3},
    {id:'duplicate',title:'重复的材料',text:'又一份“普通资料可外借”的摘录，没有珍本条款和完整版本信息。',units:2},
    {id:'evidence',title:'现行规则 B · 普通资料',text:'普通资料可外借。来源：借阅规则 B，现行。',units:2},
    {id:'exception',title:'现行规则 B · 珍本限制',text:'珍本仅限馆内阅览。与普通资料条款来自同一现行规则。',units:2},
    {id:'summary',title:'丢失条件的摘要 · 错误示例',text:'资料可外借。——删掉了“普通”与珍本限制，不能代替原文。',units:1}
  ];
  function contextState(input={}) {
    const strategy=['all','focused','compressed'].includes(input.strategy)?input.strategy:'all',windowSize=input.window==='long'?'long':'short';
    const capacity=windowSize==='long'?14:10,outputReserve=2,inputBudget=capacity-outputReserve;
    const ids=strategy==='all'?['instruction','question','history','duplicate','evidence','exception']:strategy==='focused'?['instruction','question','evidence','exception']:['instruction','question','summary'];
    const selected=[],excluded=[];let used=0,requested=0;
    for(const id of ids){const item={...pieces.find(x=>x.id===id)};requested+=item.units;if(used+item.units<=inputBudget){selected.push(item);used+=item.units;}else excluded.push(item);}
    return {strategy,window:windowSize,capacity,outputReserve,inputBudget,requested,used,remaining:inputBudget-used,selected,excluded,hasEvidence:selected.some(x=>x.id==='evidence'),hasException:selected.some(x=>x.id==='exception')};
  }
  const control=(name,value,label,selected)=>`<button type="button" data-context-param="${name}" data-value="${value}" aria-pressed="${selected}">${label}</button>`;
  function demo(r) {
    if(r.id==='context-composition')return relationship(r)+pipeline(r);
    let title='',body='',note='';
    if(r.id==='context-task') {
      const explicit=r.q.get('brief')==='explicit';
      title='把一句笼统的请求，变成可以检查的任务';
      body=`<p>两种请求都附上同一份虚构规则 B：<strong>普通资料可外借。珍本仅限馆内阅览。</strong></p><div class="llm-demo-controls" role="group" aria-label="选择任务说明">${control('brief','vague','笼统请求',!explicit)}${control('brief','explicit','明确目标与边界',explicit)}</div><div class="context-compare" aria-live="polite"><article><small>交给模型的任务说明</small><p>${explicit?'只依据下面的现行规则，回答珍本能否外借；给出结论、原文依据、适用范围；资料没说明的内容标记未知。':'帮我看看这份资料。'}</p></article><article><small>现在可以检查什么？</small><ul>${(explicit?['目标：回答珍本能否外借','依据：只使用给出的现行规则','输出：结论、原文依据、适用范围','边界：没有说明的内容保留未知']:['目标不明：总结、改写，还是回答借阅问题？','范围不明：是否可以加入资料之外的信息？','完成标准不明：拿什么检查它做到了？']).map(x=>`<li>${x}</li>`).join('')}</ul></article></div><section class="context-result"><h3>${explicit?'任务更可检查，还要看实际输出':'先补清目的，才知道下一步要检查什么'}</h3><p>${explicit?'任务约定变得明确，不代表模型一定遵守。仍要核对它是否保留“珍本仅限馆内”的条件，是否添加了未经说明的预约规则。':'同一句“看看”可能对应不同工作。补充目标不是越长越好，而是让目的、材料和成功条件能够对上。'}</p></section><div class="actions">${anchor({href:'#article/context-task-contract',title:'补基础：输入、输出与约束'},r.hash,'','button secondary')}${anchor({href:'#article/context-instructions',title:'接下来：组织指令与材料'},r.hash,'','quiet')}</div>`;
      note='这是任务说明的本地对照，不生成模型回答，也不测量准确率。明确要求通常有助于表达意图，实际效果仍取决于任务、模型和验证；写下要求并不等于程序保证。';
    } else if(r.id==='context-selection') {
      const s=contextState(Object.fromEntries(r.q));
      title='同样的容量，哪些信息真正进入了本次输入？';
      const group=(name,label,options)=>`<fieldset><legend>${label}</legend><div class="llm-demo-controls">${options.map(([value,text])=>control(name,value,text,s[name]===value)).join('')}</div></fieldset>`;
      body=`<p>虚构问题：星桥资料馆的珍本可以带走吗？下面用“格”表示占用，<strong>格数是教学设定，不是真实 token 数。</strong></p>${group('strategy','① 选择组织方式',[['all','按原顺序全放'],['focused','选本题所需'],['compressed','漏掉条件的摘要']])}${group('window','② 改变示意容量',[['short','较小容量 · 10 格'],['long','较大容量 · 14 格']])}<div class="context-budget-summary" aria-live="polite"><strong>输入已用 ${s.used} / ${s.inputBudget} 格</strong><span>总容量 ${s.capacity} − 输出预留 ${s.outputReserve} = 输入可用 ${s.inputBudget}</span><span>选定材料 ${s.requested} 格 · 输入剩余 ${s.remaining} 格</span><div class="context-budget-track" role="img" aria-label="示意容量 ${s.capacity} 格：输入使用 ${s.used} 格，输入空余 ${s.remaining} 格，输出预留 ${s.outputReserve} 格" style="--context-slots:${s.capacity}">${Array.from({length:s.capacity},(_,i)=>`<span aria-hidden="true" data-kind="${i>=s.inputBudget?'reserved':i<s.used?'used':'free'}"></span>`).join('')}</div><small>绿色：已装入的输入 · 空白：输入余量 · 金色：输出预留</small></div><p class="llm-demo-note">本例按上面选定的顺序逐项装入，剩余不足就暂不装这一项。真实服务可能拒绝超长请求、要求应用处理，或按产品规则裁剪；这里不模拟任何平台的自动截断方式。</p><ol class="context-items" aria-live="polite">${[...s.selected,...s.excluded].map(x=>`<li data-included="${s.selected.some(y=>y.id===x.id)}"><small>${x.units} 格</small><strong>${x.title}</strong><p>${x.text}</p><span class="context-status">${s.selected.some(y=>y.id===x.id)?'本次输入可见':'未装入 · 容量不足'}</span></li>`).join('')}</ol><section class="context-result"><h3>${s.hasEvidence&&s.hasException?'必要的规则和限制都在输入里':s.strategy==='compressed'?'放得下，也可能已经丢了意思':'容量被占用，关键规则没有进入'}</h3><p>${s.hasEvidence&&s.hasException?(s.strategy==='all'?'扩大容量后可以装入全部材料，但仍带着重复与无关内容。能装下不等于模型一定能正确使用，回答仍需核验。':'只保留本题需要的说明、问题与两条规则，7 格就保留了关键条件。这里检查的是输入覆盖，不是对模型效果的实测。'):s.strategy==='compressed'?'摘要只有 1 格，却把“普通资料”扩大成了“资料”，也删掉珍本限制。压缩后的文本不能据此支持珍本可以外借，需回查原文。':'原顺序优先放入了交通讨论与重复摘录，未保留完整来源和珍本限制。可以调整选择或按需补找，而不是期待模型猜出缺失条款。'}</p></section><div class="actions">${anchor({href:'#article/context-budget',title:'补基础：token 与上下文预算'},r.hash,'','button secondary')}${anchor({href:'#map/rag?node=context&depth=mechanism',title:'去 RAG 看材料怎样被选出'},r.hash,'','quiet')}</div>`;
      note='这是人工设定的容量与材料示意，没有调用分词器或模型。真实上下文按 token 等模型输入单位计算，不同模型对输入、输出和推理用量的约束不同；不要把本例的格数、输出预留或顺序直接用作工程配置。';
    } else if(r.id==='context-state') {
      const memory=['none','note','stale'].includes(r.q.get('memory'))?r.q.get('memory'):'none';
      const samples={none:['没有带入上轮记录','新一轮只收到：“那珍本呢？”','需要补回任务背景与依据','单凭这一句话，不知道它是在问借阅、开放时间还是其他事情。应带入必要的任务上下文，或澄清问题，而不是凭空恢复整个对话。'],note:['带入经过整理的任务记录','对象：星桥资料馆借阅。现行依据：规则 B。普通资料可外借，珍本仅限馆内阅览。未查：是否另需预约。','有了可继续处理的上下文','记录保留目标、版本、两条规则与未知项，帮助把“那珍本呢”放回借阅问题。仍要检查来源是否更新，不能把“未查预约”当作“不需要预约”。'],stale:['带入过期的任务记录','旧记录依据规则 A：“珍本可外借”。规则 A 已失效。','保存过的内容，也可能已不适用','存储能保留信息，也会保留旧结论。发现依据过期后，需要回查现行规则、更新记录，再把适用信息交给下一轮。']},s=samples[memory];
      title='隔了一轮，再问“那珍本呢？”';
      body=`<p>系统保存的资料、历史对话和本次传入的消息，是三个可以不同的集合。这里比较下一轮实际带入什么。</p><div class="llm-demo-controls" role="group" aria-label="选择带入的任务记录">${control('memory','none','没有带入记录',memory==='none')}${control('memory','note','带入必要记录',memory==='note')}${control('memory','stale','带入过期记录',memory==='stale')}</div><div class="context-compare" aria-live="polite"><article><small>${s[0]}</small><p>${s[1]}</p></article><article><small>当前用户问题</small><p>那珍本呢？</p><p>需要先确认：这个追问省略了哪些前提，原来的依据仍然适用吗？</p></article></div><section class="context-result"><h3>${s[2]}</h3><p>${s[3]}</p></section><ol class="context-cycle">${[['整理记录','保留目标、来源、进展与未知'],['外部保存','存放在应用管理的数据中'],['按需读取','核对版本与相关性'],['进入本轮输入','模型这次才可以参考']].map(([title,text])=>`<li><strong>${title}</strong><p>${text}</p></li>`).join('')}</ol><div class="actions">${anchor({href:'#map/agent?node=state&depth=mechanism',title:'去 Agent 看状态怎样维护'},r.hash,'','button secondary')}${anchor({href:'#map/llm?node=context&depth=boundary',title:'回看 LLM：上下文、记忆与参数'},r.hash,'','quiet')}</div>`;
      note='记录、规则与情境均为虚构的本地预设。按钮只切换图解，不保存真实记忆，也不调用模型。保存与再次传入由应用负责，具体产品可能自动带入部分历史；这不等于模型参数已经改变。';
    }
    return body?`<section class="llm-demo context-demo"><p class="eyebrow">可操作的机制图解 · 本地示意</p><h2>${title}</h2>${body}<p class="llm-boundary">${note}</p></section>`:'';
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-context-map]')){const el=document.querySelector('.context-structure');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant'});return;}
    const b=event.target.closest('button[data-context-param]');if(!b)return;
    const r=window.JOURNEY.route(location.hash);if(r?.kind!=='article')return;
    const allowed={'context-task':{brief:['vague','explicit']},'context-selection':{strategy:['all','focused','compressed'],window:['short','long']},'context-state':{memory:['none','note','stale']}};
    const options=allowed[r.id];if(!options || !Object.hasOwn(options,b.dataset.contextParam) || !options[b.dataset.contextParam].includes(b.dataset.value))return;
    r.q.set(b.dataset.contextParam,b.dataset.value);r.hash='#article/'+r.id+'?'+r.q;history.replaceState(null,'',r.hash);window.JOURNEY.render(r);
    document.querySelector(`button[data-context-param="${b.dataset.contextParam}"][data-value="${b.dataset.value}"]`)?.focus({preventScroll:true});
  });
  window.CONTEXT_MAP={select,link,entry,render,mapContext,wayfinding,readingNav,demo,contextState};
})();
