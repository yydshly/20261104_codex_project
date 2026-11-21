/* A local, editorial map of retrieval-augmented generation. All examples are editorial. */
(() => {
  'use strict';
  const data=()=>window.RAG_DATA, catalog=()=>window.JOURNEY_CATALOG;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=n=>window.feather?.icons[n]?.toSvg({'aria-hidden':'true',width:20,height:20}) || '';
  const base='#map/rag';
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
    return `<section class="llm-entry rag-entry"><p class="eyebrow">让外部资料成为回答的依据</p><h3>RAG · 检索增强生成</h3><p>资料准备、检索、筛选、上下文、生成与核验。从一份资料走到有依据的回答。</p>${anchor({href:base,title:'展开 RAG 认知地图'},back,'','button secondary')}</section>`;
  }
  function relationship(r) {
    const hub=r.kind==='map'?link(r,{node:'context'}):window.JOURNEY.withBack(base+'?node=context&depth=intro',r.hash);
    const items=[
      {href:'#map/llm?node=context&depth=intro',title:'大语言模型',role:'读取上下文，组织回答',text:'资料进入模型输入；生成能力决定它怎样使用这些内容。'},
      {href:hub,direct:true,title:'RAG · 检索增强生成',role:'把外部材料连接到生成',text:'找出资料、选择片段、提供上下文，再核对回答与依据。',hub:true},
      {href:'#map/agent?node=knowledge&depth=intro',title:'AI 智能体 Agent',role:'按任务需要调用检索',text:'可以决定何时查、查什么、是否再查；普通 RAG 不必包含 Agent。'},
      {href:'#domain/information?direction=retrieval',title:'信息组织',role:'让材料可找、可辨、可追溯',text:'描述、分类、索引、来源与版本，影响可找到什么依据。'}
    ];
    return `<section class="rag-relations"><header class="section-heading"><div><p class="eyebrow">先把它放回整体</p><h2>RAG、模型、Agent 与信息组织，各做什么？</h2></div></header><div class="rag-relationship">${items.map(x=>anchor(x,r.hash,`<small>${esc(x.role)}</small><strong>${esc(x.title)} ${icon('arrow-right')}</strong><p>${esc(x.text)}</p>`,x.hub?'rag-hub':'')).join('')}</div><p class="map-caption">连线表示职责关系，不是四个执行步骤。RAG 是检索与生成的组合方式，不是一种新模型；向量数据库只是可选实现，Agent 也不是必要前提。</p></section>`;
  }
  function pipeline(r) {
    const groups=[['rag-index-flow','① 资料新增或更新时：先准备可检索的材料',[
      ['收集与授权','确定资料范围与可访问对象','ingestion'],['保留来源','记录标题、版本与适用时间','ingestion'],['切分与描述','保留语义、片段关系与元数据','ingestion'],['建立索引','让关键词或向量检索可定位资料','retrieval']
    ]],['rag-query-flow','② 收到问题时：再寻找依据并形成回答',[
      ['检索候选','按问题寻找可能相关的片段','retrieval'],['筛选与重排','检查条件，再挑更适用的材料','ranking'],['组装上下文','保留出处、条件与必要的前后文','context'],['依据生成','用材料组织回答与引用','generation'],['核验与反馈','检查支持程度，发现需要更新之处','evaluation']
    ]]];
    return `<section class="rag-pipeline"><p class="eyebrow">两条流程，连接同一份资料</p><h2>先准备，再问答；发现问题后再更新。</h2>${groups.map(([cls,title,steps])=>`<h3>${title}</h3><ol class="${cls}">${steps.map(([title,text,node])=>`<li>${anchor({href:r.kind==='map'?link(r,{node}):window.JOURNEY.withBack(base+'?node='+node+'&depth=intro',r.hash),direct:true},r.hash,`<strong>${title} ${icon('arrow-right')}</strong><p>${text}</p>`)}</li>`).join('')}</ol>`).join('')}<p>这是常见的两阶段阅读框架：资料准备不必在每次提问时重做；查询也可能重写问题、并行检索或多轮补找。核验结果可以反馈到资料、检索与回答各环节。</p></section>`;
  }
  function render(r) {
    const {node,depth}=select(r),stage=node[depth],back=window.JOURNEY.safeBack(r.q.get('back'),'#domain/ai?direction=system');
    const nodes=(group,offset=0)=>group.map((n,i)=>`<a class="llm-node" href="${esc(link(r,{node:n.id}))}" data-rag-node="${n.id}" ${n.id===node.id?'aria-current="true"':''}><small>${i+1+offset}</small><strong>${esc(n.short)}</strong><p>${esc(n.question)}</p></a>`).join('');
    return `<div class="llm-map-page rag-map-page"><header class="journey-heading llm-heading"><p class="eyebrow">AI → 具体方向 → 知识结构</p><h1>检索增强生成 <small>RAG</small></h1><p>${esc(data().lead)}</p><a class="quiet" href="${esc(back)}">${icon('arrow-left')}返回进入这张地图的位置</a><button class="button secondary rag-map-shortcut" type="button" data-rag-map>直接看六个知识部分 ${icon('arrow-down')}</button></header>${relationship(r)}<div class="llm-map-layout"><section class="llm-structure rag-structure" tabindex="-1" aria-label="RAG 知识结构"><figure><figcaption>从资料出发：怎样找到适用的依据？</figcaption><div class="llm-network llm-generation-chain">${nodes(data().nodes.slice(0,3))}</div><p class="llm-demo-note">前三个知识部分连接资料准备与查询：不是每次提问都重新处理全部资料。</p><div class="llm-map-center">RAG<strong>从候选材料走向可核对的回答</strong></div><div class="llm-network llm-generation-chain">${nodes(data().nodes.slice(3),3)}</div><p class="llm-demo-note">核验结果可以反馈到前面的任何环节；这六部分是一种理解框架。</p></figure><p class="llm-boundary">${esc(data().scope)}</p><h2>随用随补的基础</h2><div class="llm-foundation-links">${data().foundations.map(f=>anchor({href:'#article/'+f.id,title:f.title},r.hash,`<strong>${esc(f.title)} ${icon('arrow-right')}</strong><p>${esc(f.why)}</p>`)).join('')}</div></section><section class="llm-detail" id="rag-detail" tabindex="-1" aria-label="${esc(node.short)}的深入路径"><p class="eyebrow">RAG / ${esc(node.short)}</p><h2>${esc(node.title)}</h2><button class="quiet cog-map-return" type="button" data-rag-map>返回结构图，换个部分 ${icon('arrow-up')}</button><p>${esc(node.question)}</p><div class="cog-inside">${node.contains.map(x=>`<span>${esc(x)}</span>`).join('')}</div><nav class="llm-depth-tabs" aria-label="选择理解深度">${data().depths.map((d,i)=>`<a href="${esc(link(r,{depth:d.id}))}" data-rag-depth="${d.id}" ${depth===d.id?'aria-current="page"':''}><small>0${i+1}</small>${esc(d.label)}</a>`).join('')}</nav><h3>${esc(stage.title)}</h3><p>${esc(stage.text)}</p><div class="llm-concepts">${stage.links.map((x,i)=>anchor(x,r.hash,`<small>${i+1} / 可独立阅读</small><strong>${esc(x.title)} ${icon('arrow-right')}</strong><span>${esc(x.reason)}</span>`)).join('')}</div><section class="llm-prerequisites"><h3>这部分会涉及的基础</h3><details><summary>${esc(data().foundations.find(f=>f.id===node.foundation).title)} · 在这里先认识</summary><p>${esc(catalog().articles[node.foundation].takeaway)}</p>${anchor({href:'#article/'+node.foundation,title:'打开完整基础讲解'},r.hash)}</details></section><section><h3>向外连接，补另一种视角</h3><div class="llm-next-fields">${anchor(node.neighbor,r.hash,`<strong>${esc(node.neighbor.title)} ${icon('arrow-right')}</strong><p>${esc(node.neighbor.reason)}</p>`)}</div></section><p class="llm-boundary"><strong>这条路目前展开到哪里</strong><br>${esc(node.frontier)}</p><nav class="article-pager">${depth!=='intro'?`<a class="quiet" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(d=>d.id===depth)-1].id}))}">${icon('arrow-left')}回到上一层</a>`:''}${depth!=='boundary'?`<a class="button secondary" href="${esc(link(r,{depth:data().depths[data().depths.findIndex(d=>d.id===depth)+1].id}))}">继续看${depth==='intro'?'机制与基础':'应用与边界'} ${icon('arrow-right')}</a>`:''}</nav></section></div>${pipeline(r)}</div>`;
  }
  function mapContext(href,back='') {
    let cursor=back;
    for(let i=0;i<7 && typeof cursor==='string';i++) {
      const path=cursor.split('?')[0];
      if(path===base){const r=window.JOURNEY.route(cursor);if(r?.kind==='map')return {...select(r),hash:cursor};}
      if(path.startsWith('#map/') && path!==base)return null;
      const next=new URLSearchParams(cursor.split('?')[1] || '').get('back');if(!next || next===cursor)break;cursor=next;
    }
    const a=catalog().articles[href.split('?')[0].slice(9)];if(!a?.ragNode)return null;
    const node=data().nodes.find(n=>n.id===a.ragNode) || data().nodes[0],depth=a.foundation?'mechanism':'intro';
    return {node,depth,hash:base+'?node='+node.id+'&depth='+depth};
  }
  function wayfinding(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    return `<section class="cog-wayfinding" aria-label="这个知识点在地图中的位置"><nav><a href="#home">认知全景</a>${icon('chevron-right')}<a href="#domain/ai?direction=system">人工智能</a>${icon('chevron-right')}<a href="${esc(c.hash)}">RAG · ${esc(c.node.short)}</a><span>当前知识点</span></nav><p>这里对应“${esc(data().depths.find(d=>d.id===c.depth).label)}”。补完这一点后，可以返回原来的部分与深度。</p></section>`;
  }
  function readingNav(href,back) {
    const c=mapContext(href,back);if(!c)return '';
    const stage=c.node[c.depth],index=stage.links.findIndex(x=>x.href===href.split('?')[0]),next=index>=0?stage.links[index+1]:null;
    const nextDepth=data().depths[Math.min(data().depths.findIndex(d=>d.id===c.depth)+1,2)].id;
    const onward=next || {href:link(window.JOURNEY.route(c.hash),{depth:nextDepth}),direct:true,title:c.depth==='boundary'?'回看这一部分的边界':'展开下一层：'+data().depths.find(d=>d.id===nextDepth).label,reason:'把这一点放回结构图，选择下一步要理解什么。'};
    const returnTo=window.JOURNEY.safeBack(back,c.hash),atMap=returnTo.split('?')[0].startsWith('#map/'),origin=href.startsWith('#topic/')?c.hash:href;
    const cards=[{href:returnTo,direct:true,title:atMap?'返回阅读起点':'返回刚才的位置',reason:atMap?'回到这次阅读所在的地图层级。':'保留此前的方向、深度和图解选择。'},{href:c.hash,direct:true,title:'回到 RAG 结构图',reason:'继续查看“'+c.node.short+'”的知识与基础。'},onward];
    return `<section class="cog-reading-nav"><p class="eyebrow">把这一点放回 RAG 地图</p><h2>接下来，可以往哪里走？</h2><div class="cog-next-grid">${cards.map(x=>anchor(x,origin,`<strong>${esc(x.title)} ${icon('arrow-right')}</strong><p>${esc(x.reason)}</p>`)).join('')}</div></section>`;
  }
  const corpus=[
    {id:'current',title:'借阅规则 B · 现行',text:'普通资料可外借。珍本仅限馆内阅览。',current:true},
    {id:'old',title:'珍本外借说明 A · 已失效',text:'珍本可外借。',current:false},
    {id:'handbook',title:'珍本展览纪念册借阅说明 · 现行',text:'珍本展览纪念册可外借。',current:true}
  ];
  function retrievalState(input={}) {
    const method=['keyword','semantic','hybrid'].includes(input.method)?input.method:'keyword',filter=input.filter==='current'?'current':'off',rerank=input.rerank==='on'?'on':'off';
    const orders={keyword:['old','handbook','current'],semantic:['handbook','current','old'],hybrid:['current','old','handbook']};
    const ordered=orders[method].map(id=>({...corpus.find(x=>x.id===id)}));
    const candidates=ordered.filter(x=>filter==='off' || x.current),excluded=ordered.filter(x=>filter==='current' && !x.current);
    if(rerank==='on')candidates.sort((a,b)=>['current','handbook','old'].indexOf(a.id)-['current','handbook','old'].indexOf(b.id));
    return {method,filter,rerank,candidates,excluded,selected:candidates.slice(0,1)};
  }
  const control=(name,value,label,selected)=>`<button type="button" data-rag-param="${name}" data-value="${value}" aria-pressed="${selected}">${label}</button>`;
  function demo(r) {
    if(r.id==='rag-composition')return relationship(r)+pipeline(r);
    let title='',body='',note='';
    const question='<p>同一个虚构问题：<strong>现在星桥资料馆的珍本可以带走吗？</strong></p>';
    if(r.id==='rag-ingestion') {
      const chunking=r.q.get('chunking')==='fixed'?'fixed':'semantic',semantic=chunking==='semantic';
      const fragments=semantic?['普通资料可外借。','珍本仅限馆内阅览。']:['普通资料可外借。珍本仅限','馆内阅览。'];
      title='同一份规则，怎样切成可检索的片段？';
      body=`${question}<section class="rag-evidence"><h3>原文 · 借阅规则 B</h3><p>普通资料可外借。珍本仅限馆内阅览。</p></section><div class="llm-demo-controls" role="group" aria-label="选择切分方式">${control('chunking','fixed','机械截断示意',!semantic)}${control('chunking','semantic','按完整句切分',semantic)}</div><div class="rag-chunk-grid">${fragments.map((x,i)=>`<article class="rag-chunk"><small>片段 ${i+1}${i===1?' · 试着单独读这一片':''}</small><p>${i===1?'<mark>':''}${x}${i===1?'</mark>':''}</p><small>来源：借阅规则 B · 现行 · 段落 1 / 片段 ${i+1}</small></article>`).join('')}</div><p class="reading-takeaway" aria-live="polite">${semantic?'第二片保留了“珍本”与“仅限馆内阅览”的关系。独立检索到它时，更容易确认规则适用的对象。':'第二片只剩“馆内阅览”，丢掉了对象与限制关系。需要补回相邻片段或原文，才能知道规则说的是谁。'}</p><div class="actions">${anchor({href:'#article/rag-chunks',title:'补基础：片段与上下文'},r.hash,'','button secondary')}${anchor({href:'#article/rag-retrieval',title:'继续看：怎样找到候选'},r.hash,'','quiet')}</div>`;
      note='这是人工构造的切分示意，没有运行分词器或语义切分模型。按句切分不总是更好：表格、标题和跨段条件也可能必须一起保留。片段大小、重叠与回查原文，需要结合资料和任务选择。';
    } else if(r.id==='rag-ranking') {
      const s=retrievalState(Object.fromEntries(r.q)),picked=s.selected[0];
      title='相关、现行、回答这个问题：是三个判断';
      const group=(name,label,options)=>`<fieldset><legend>${label}</legend><div class="llm-demo-controls">${options.map(([value,text])=>control(name,value,text,s[name]===value)).join('')}</div></fieldset>`;
      body=`${question}<p class="llm-demo-note">下面的顺序由编辑预设，只用于说明环节分工；不是关键词、语义或混合检索的效果比较。真实排序随数据、问题和实现变化。</p>${group('method','① 看一组候选顺序',[['keyword','关键词示意'],['semantic','语义示意'],['hybrid','混合示意']])}${group('filter','② 是否按版本筛选',[['off','不筛版本'],['current','只保留现行']])}${group('rerank','③ 是否再次比较问题与内容',[['off','沿用候选顺序'],['on','按适用性重排示意']])}<ol class="rag-candidate-list" aria-live="polite">${[...s.candidates,...s.excluded].map(x=>{const excluded=s.excluded.some(y=>y.id===x.id),selected=picked.id===x.id;return `<li class="rag-candidate" data-included="${selected}"><small>${excluded?'已被版本条件排除':'候选第 '+(s.candidates.findIndex(y=>y.id===x.id)+1)+' 位'}</small><strong>${x.title}</strong><p>${x.text}</p><span class="rag-status" data-status="${excluded?'excluded':selected?'selected':'pending'}">${excluded?'不进入排序':selected?'本例取第 1 条作为上下文':'在候选中，暂未选入'}</span><p>${x.id==='old'?'主题吻合，但版本已失效。':x.id==='handbook'?'版本现行，但对象是展览纪念册，不是珍本。':'对象与版本符合问题，还要检查回答是否忠于原文。'}</p></li>`;}).join('')}</ol><section class="rag-evidence"><h3>这次送给模型的片段</h3><blockquote><p>${picked.text}</p></blockquote><p>${picked.id==='current'?'拿到了适用的规则。下一步仍要保留限制条件、出处，并核对回答。':picked.id==='old'?'旧规则被选入了上下文。生成再流畅，也不能把过期依据变成现行规则。':'筛掉旧版本仍可能留下偏题资料。纪念册能外借，不能推出珍本也能外借。'}</p></section><div class="actions">${anchor({href:'#article/rag-context',title:'接下来：组装上下文'},r.hash,'','button secondary')}${anchor({href:'#article/rag-similarity',title:'补基础：相关性与相似度'},r.hash,'','quiet')}</div>`;
      note='三份资料、顺序与重排判断均为预设；没有实际搜索、嵌入计算或模型打分。本例只取第 1 条是为了看清上下文预算的作用，不是推荐固定取一条。重排只能比较已有候选，遗漏的材料需要调整检索来补找。';
    } else if(r.id==='rag-generation') {
      const evidence=['full','partial','none'].includes(r.q.get('evidence'))?r.q.get('evidence'):'full';
      const samples={full:['完整规则','普通资料可外借。珍本仅限馆内阅览。','按规则 B，珍本仅限馆内阅览，不能外借。[1]','这条具体主张受到原文支持','本例中对象、版本与限制相符。仍应回查来源，确认资料的真实性和适用范围。','supported'],partial:['脱离语境的片段','可外借','珍本可以外借。[1]','有引用，仍然不支持这条主张','这是一个故意写错的答案。“可外借”没有说明对象，不能推出珍本可以外借。应补回原文，而不是把引用标记当作证明。','unsupported'],none:['没有适用片段','没有找到可作为依据的资料。','尚未找到适用依据，不能据此判断。','依据不足，应补找或说明限制','没有检索到不等于现实中没有答案。可以调整问题或检索范围，找到材料后再判断。','missing']},s=samples[evidence];
      title='把答案里的每个主张，放回原文核对';
      body=`${question}<div class="llm-demo-controls" role="group" aria-label="选择证据条件">${control('evidence','full','完整依据',evidence==='full')}${control('evidence','partial','不完整片段',evidence==='partial')}${control('evidence','none','没有依据',evidence==='none')}</div><div class="rag-chunk-grid" aria-live="polite"><article class="rag-chunk"><small>交给模型的内容 · ${s[0]}</small><p>${s[1]}</p>${evidence!=='none'?'<small>[1] 虚构资料：借阅规则 B · 现行</small>':''}</article><article class="rag-chunk"><small>预设示例回答 · ${evidence==='partial'?'刻意错误示例':'用于对照'}</small><p>${s[2]}</p></article></div><section class="rag-evidence"><span class="rag-status" data-status="${s[5]}">${s[3]}</span><p>${s[4]}</p></section><div class="actions">${anchor({href:'#article/rag-evaluation',title:'继续看：怎样逐层核验'},r.hash,'','button secondary')}${anchor({href:'#article/info-provenance',title:'向外连接：来源与版本'},r.hash,'','quiet')}</div>`;
      note='原文与回答全部是本地预设，没有调用大语言模型。这里比较“资料是否支持这句话”；引用只是回查入口，引用存在、材料真实、论证充分是不同的检查。';
    }
    return body?`<section class="llm-demo rag-demo"><p class="eyebrow">可操作的机制图解 · 本地示意</p><h2>${title}</h2>${body}<p class="llm-boundary">${note}</p></section>`:'';
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-rag-map]')){const el=document.querySelector('.rag-structure');el?.focus({preventScroll:true});el?.scrollIntoView({block:'start',behavior:'instant'});return;}
    const b=event.target.closest('button[data-rag-param]');if(!b)return;
    const r=window.JOURNEY.route(location.hash);if(r?.kind!=='article')return;
    const allowed={'rag-ingestion':{chunking:['fixed','semantic']},'rag-ranking':{method:['keyword','semantic','hybrid'],filter:['off','current'],rerank:['off','on']},'rag-generation':{evidence:['full','partial','none']}};
    const options=allowed[r.id];if(!options || !Object.hasOwn(options,b.dataset.ragParam) || !options[b.dataset.ragParam].includes(b.dataset.value))return;
    r.q.set(b.dataset.ragParam,b.dataset.value);r.hash='#article/'+r.id+'?'+r.q;history.replaceState(null,'',r.hash);window.JOURNEY.render(r);
    document.querySelector(`button[data-rag-param="${b.dataset.ragParam}"][data-value="${b.dataset.value}"]`)?.focus({preventScroll:true});
  });
  window.RAG_MAP={select,link,entry,render,mapContext,wayfinding,readingNav,demo,retrievalState};
})();
