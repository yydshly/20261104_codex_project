/* Shared public-science entry, domain overview, and explanatory reading route. */
(() => {
  'use strict';
  const D = window.AI_ATLAS_DATA;
  const data = () => window.JOURNEY_DATA;
  const catalog = () => window.JOURNEY_CATALOG;
  const domainOf = r => ['map','project'].includes(r.kind) ? 'ai' : r.kind==='roam' ? window.ROAM.resolve(r).step.domain : r.kind==='domain' ? r.id : r.id==='retrieval' ? 'ai' : catalog().articles[r.id]?.domain;
  const social = () => window.ATLAS_DATA;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => window.feather?.icons[name]?.toSvg({'aria-hidden':'true', width:22, height:22, 'stroke-width':1.6}) || '';
  const arrow = () => icon('arrow-right');
  const aiHref = '#domain/ai';
  const infoHref = '#domain/information';
  let mapObserver;
  let origin = 'programmer';
  try { const saved = localStorage.getItem('jianquan.origin.v1'); if (saved !== null) origin = saved === 'programmer' ? saved : ''; } catch (_) { /* The starting point remains usable in memory. */ }
  const safeBack = (value, fallback) => {
    if(typeof value!=='string' || !value.startsWith('#') || value.length>1800)return fallback;
    const parsed=route(value);
    if(parsed && parsed.kind!=='missing')return value;
    const [kind,id]=value.slice(1).split('?')[0].split('/');
    if((/^#topic\/[a-z-]+$/.test(value) && D.topics.some(t=>t.id===id)) || (/^#area\/[a-z-]+$/.test(value) && D.areas.some(a=>a.id===id)) || /^#guide\/[0-4]$/.test(value))return value;
    return fallback;
  };
  const withBack = (href, back) => {
    // Keep the immediate page and its interaction state even on a long reading
    // journey. Drop older ancestry before nested URL encoding exceeds the limit.
    if(back.length>1300){const split=back.indexOf('?');if(split>=0){const q=new URLSearchParams(back.slice(split+1));q.delete('back');back=back.slice(0,split)+(q.size?'?'+q.toString():'');}}
    return `${href}${href.includes('?') ? '&' : '?'}back=${encodeURIComponent(back)}`;
  };
  const articleLink = (id, title, back = infoHref, className = '') => `<a class="${className}" href="${esc(withBack('#article/'+id,back))}">${title}</a>`;
  function route(hash) {
    const raw = (hash || '#home').slice(1), split = raw.indexOf('?');
    const path = (split < 0 ? raw : raw.slice(0,split));
    const q = new URLSearchParams(split < 0 ? '' : raw.slice(split+1));
    const [kind,id,tab] = path.split('/');
    if (!['home','learn','domain','article','search','world','roam','map','project','study','project-overview','research'].includes(kind)) return null;
    const r = {view:'journey',kind,id,tab:tab || 'overview',q,hash:hash || '#home'};
    if (kind === 'domain' && (!Object.hasOwn(catalog().domains,id) || !['overview','how','history'].includes(r.tab))) r.kind = 'missing';
    if (kind === 'article' && id !== 'retrieval' && !Object.hasOwn(catalog().articles,id)) r.kind = 'missing';
    if (kind === 'map' && (!['llm','agent','rag','context'].includes(id) || tab)) r.kind='missing';
    if (kind === 'roam' && (id!=='ai-errors' || !window.ROAM?.hasStep(r.tab))) r.kind = 'missing';
    if (kind === 'project' && (id!=='knowledge-assistant' || tab==='' || !window.ASSISTANT_PROJECT?.hasStep(r.tab))) r.kind = 'missing';
    if (kind === 'learn' && (tab==='' || !window.EXPLORE?.has(id,r.tab))) r.kind = 'missing';
    if (kind === 'study') {
      r.id=id || 'overview';
      if(id==='' || tab!==undefined || !window.LEARNING?.has(r.id))r.kind='missing';
    }
    if (kind === 'world') {
      const system = social()?.systems.find(s=>s.id===id);
      if (!system || (tab && !system.topics.some(t=>t.id===tab))) r.kind = 'missing';
    }
    const parts=path.split('/');
    if(parts.length>3 || (['home','search','project-overview','research'].includes(kind) && parts.length>1) || (kind==='article' && parts.length>2))r.kind='missing';
    return r;
  }
  function sources(items) {
    return `<section class="article-sources"><h2>参考与继续阅读</h2><p>正文为通俗解释；示例用于说明机制。</p><ul>${(items || []).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ${icon('external-link')}</a></li>`).join('')}</ul></section>`;
  }
  function readingRoute(current) {
    if(['computing','education'].includes(current))return `<nav class="reading-route" aria-label="相邻领域"><span>相邻领域：</span>${Object.values(catalog().domains).map(d=>`<a href="#domain/${d.id}" ${d.id===current?'aria-current="page"':''}>${esc(d.title)}</a>`).join('')}<small>同一件事，可以从不同领域理解</small></nav>`;
    return `<nav class="reading-route" aria-label="这条阅读路线"><span>阅读路线：</span>${[['ai','AI 全景',aiHref],['retrieval','检索与材料','#article/retrieval'],['information','信息组织',infoHref]].map(([id,title,href],i)=>`${i ? arrow():''}<a href="${href}" ${id===current?'aria-current="step"':''}>${title}</a>`).join('')}<small>可继续深入，也可返回全景</small></nav>`;
  }
  function chrome(r) {
    document.body.classList.add('journey-mode');
    document.body.classList.toggle('journey-home',r.kind==='home');
    document.body.classList.toggle('overview-mode',['project-overview','research'].includes(r.kind));
    document.body.classList.toggle('explore-mode',r.kind==='learn');
    document.body.classList.toggle('assistant-project-mode',r.kind==='project');
    document.body.classList.toggle('cognition-domain',r.kind==='domain');
    document.body.classList.toggle('llm-mode',(r.kind==='map' && r.id==='llm') || Boolean(catalog().articles[r.id]?.llmNode));
    document.body.classList.toggle('context-mode',(r.kind==='map' && r.id==='context') || Boolean(catalog().articles[r.id]?.contextNode));
    document.body.classList.toggle('rag-mode',(r.kind==='map' && r.id==='rag') || Boolean(catalog().articles[r.id]?.ragNode));
    document.body.classList.toggle('agent-mode',(r.kind==='map' && r.id==='agent') || Boolean(catalog().articles[r.id]?.agentNode));
    document.getElementById('origin-label').textContent = origin ? '程序员' : '自由浏览';
    document.querySelector('[data-header-icon]').innerHTML = icon('search');
    document.querySelectorAll('[data-origin]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.origin===origin)));
    const active = r.kind==='research'?'project-overview':r.kind==='search' || r.kind==='project-overview' ? r.kind : r.kind==='learn' && r.id==='industries' ? 'directions' : r.kind==='home' ? 'explore' : '';
    document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if (r.view !== 'journey') return;
    const domainId=domainOf(r),d=catalog().domains[domainId];
    const domainTitle=d?.title || '人工智能',domainHref=d?'#domain/'+d.id:aiHref;
    const crumbs = [['探索首页','#home']];
    if (r.kind==='learn') {
      crumbs.push(...window.EXPLORE.trail(r));
    } else if(r.kind==='study') {
      if(r.id!=='overview')crumbs.push([window.LEARNING.label('overview'),'#study']);
      crumbs.push([window.LEARNING.label(r.id),null]);
    } else if (r.kind==='domain' || r.kind==='article') {
      crumbs.push(['知识与技术','#world/knowledge'],[domainTitle,domainHref]);
      if (r.kind==='article') {const context=window.COGNITION.mapContext(r.hash,r.q.get('back') || '');if(context)crumbs.push([context.title,context.hash]);}
      if (r.kind==='article') crumbs.push([r.id==='retrieval' ? '检索与材料' : catalog().articles[r.id].title,null]);
      if (r.kind==='domain' && r.tab!=='overview') crumbs.push([r.tab==='how'?'怎样运作':'怎样形成',null]);
    } else if (r.kind==='map') {
      crumbs.push(['人工智能',aiHref],[r.id==='context'?'提示词与上下文工程':r.id==='rag'?'RAG 检索增强生成':r.id==='agent'?'AI 智能体 Agent':'大语言模型',null]);
    } else if (r.kind==='roam') {
      crumbs.push(['AI 为什么会答错？',window.ROAM.link('overview',r)]);
      if(r.tab!=='overview')crumbs.push([window.ROAM.resolve(r).step.label,null]);
    } else if (r.kind==='project') {
      crumbs.push(['公司知识库助手',window.ASSISTANT_PROJECT.link('overview',r)]);
      if(r.tab!=='overview')crumbs.push([window.ASSISTANT_PROJECT.label(r.tab),null]);
    } else if (r.kind==='search') crumbs.push(['科普专题',null]);
    else if (r.kind==='project-overview') crumbs.push(['项目总览',null]);
    else if (r.kind==='research') crumbs.push(['项目总览','#project-overview'],['研究与共识',null]);
    else if (r.kind==='world') {const s=social().systems.find(s=>s.id===r.id);crumbs.push([worldTitle(s.id),`#world/${s.id}`]);if(r.tab!=='overview')crumbs.push([s.topics.find(t=>t.id===r.tab).title,null]);}
    document.getElementById('breadcrumb').innerHTML = crumbs.map(([title,href],i)=>`${i?icon('chevron-right'):''}${href && i!==crumbs.length-1?`<a href="${esc(href)}">${esc(title)}</a>`:`<span aria-current="page">${esc(title)}</span>`}`).join('');
    const rail = document.getElementById('context-rail');
    if(r.kind==='map') {
      const map=r.id==='context'?window.CONTEXT_MAP:r.id==='rag'?window.RAG_MAP:r.id==='agent'?window.AGENT_MAP:window.LLM,mapData=r.id==='context'?window.CONTEXT_DATA:r.id==='rag'?window.RAG_DATA:r.id==='agent'?window.AGENT_DATA:window.LLM_DATA,selected=map.select(r),mapTitle=r.id==='context'?'提示词与上下文工程':r.id==='rag'?'RAG 检索增强生成':r.id==='agent'?'AI 智能体 Agent':'大语言模型';
      rail.innerHTML=`<h2>${mapTitle}</h2><a class="quiet" href="#domain/ai?direction=${r.id==='llm'?'method':'system'}">${icon('arrow-left')}返回 AI 方向地图</a><nav class="local-tree" aria-label="${mapTitle}各部分">${mapData.nodes.map(n=>`<a href="${esc(map.link(r,{node:n.id}))}" ${n.id===selected.node.id?'aria-current="page"':''}>${esc(n.short)}</a>`).join('')}</nav>`;
    } else if(r.kind==='roam') {
      rail.innerHTML=window.ROAM.rail(r);
    } else if(r.kind==='project') {
      rail.innerHTML=window.ASSISTANT_PROJECT.rail(r);
    } else if(r.kind==='learn') {
      rail.innerHTML=window.EXPLORE.rail(r);
    } else if(r.kind==='study') {
      rail.innerHTML='<h2>学习与查证</h2><nav class="local-tree" aria-label="学习栏目"><a href="#study">从一个问题开始</a><a href="#study/records">我的学习记录</a><a href="#study/sources">内容来源与覆盖</a></nav>';
    } else if (r.kind==='world') {
      rail.innerHTML=`<h2>世界全景</h2><nav class="local-tree" aria-label="社会板块">${regions.map(([id,title,,ic])=>`<a href="#world/${id}" ${id===r.id?'aria-current="page"':''}>${icon(ic)}${esc(title)}</a>`).join('')}</nav><a class="quiet rail-bottom" href="#home">${icon('arrow-left')}返回世界全景</a>`;
    } else if (r.kind==='article' && r.id==='retrieval') {
      rail.innerHTML=`<h2>人工智能</h2><a class="quiet" href="${aiHref}">${icon('arrow-left')}返回 AI 全景</a><nav class="local-tree" aria-label="知识层级"><a href="#area/system">${icon('layers')}系统产品</a><a href="#topic/model-vs-system" data-entry="explore" data-return="${esc(r.hash)}">${icon('cpu')}知识助手</a><a href="#article/retrieval" aria-current="page">${icon('file-text')}检索与材料</a></nav><div class="rail-separator"></div><h3>连接到其他领域</h3><a class="quiet" href="${esc(infoFrom(r))}">${icon('layers')}信息组织 ${arrow()}</a>${r.q.has('back')?`<a class="quiet" href="${esc(safeBack(r.q.get('back'),aiHref))}">${icon('arrow-left')}返回刚才的页面</a>`:''}`;
    } else {
      rail.innerHTML = `<h2>知识与技术</h2><nav class="local-tree" aria-label="相关领域">${Object.values(catalog().domains).map(x=>`<a href="#domain/${x.id}" ${x.id===domainId?'aria-current="page"':''}>${icon(x.icon)}${esc(x.title)}</a>`).join('')}</nav>${r.kind==='article'?`<a class="quiet" href="${esc(safeBack(r.q.get('back'),domainHref))}">${icon('arrow-left')}返回刚才的页面</a>`:''}<a class="quiet rail-bottom" href="#home">${icon('arrow-left')}返回世界全景</a>`;
    }
  }
  const regions = [
    ['knowledge','知识与技术','知识怎样积累、传播和应用？','monitor',50,50],
    ['foundations','生存与资源','食物、水和能源从哪里来？','sun',17,28],
    ['economy','生产与交换','商品和服务怎样生产与流通？','briefcase',50,14],
    ['governance','治理与协作','公共事务怎样协调？','columns',83,28],
    ['care','人口与照护','人怎样成长并获得照护？','users',17,72],
    ['global','全球连接','人、物和信息怎样跨越边界？','globe',83,72],
    ['culture','文化与表达','人怎样创造和传播意义？','book-open',50,86]
  ];
  const worldTitle = id => regions.find(region=>region[0]===id)?.[1] || '';
  function miniImage(file,alt) {return `<img class="journey-illustration" src="./assets/${file}.png" alt="${esc(alt)}" width="900" height="320">`;}
  function home() {
    const explore=window.EXPLORE;
    const worldMap=`<section class="world-entry" aria-label="世界知识地图">
      <nav class="world-map" data-graph aria-label="选择社会板块"><canvas aria-hidden="true"></canvas>
        ${regions.map(([id,title,desc,ic,x,y])=>`<a class="world-node${id==='knowledge'?' world-cluster':''}"${id==='knowledge'?' data-graph-center':''} href="#world/${id}" style="left:${x}%;top:${y}%">${icon(ic)}<strong>${title}</strong><small>${desc}</small><span class="world-count">${explore.worldIndustryCount(id)} 个相关行业 ${arrow()}</span></a>`).join('')}
      </nav><p class="map-caption">从任一板块都可以开始。一个行业可以参与多种社会活动。</p></section>`;
    return `${explore.home(worldMap)}<details class="explore-legacy"><summary>展开原有专题</summary>${window.COGNITION.homeStart(origin)}${window.COGNITION.homeDomains()}${window.ASSISTANT_PROJECT.entry('#home')}${discoveryRoutes()}</details>`;
  }
  const areaIcons = {scope:'layers',capability:'grid',method:'bar-chart-2',resource:'database',system:'monitor',evaluation:'shield',industry:'briefcase',society:'users'};
  const areaSub = {scope:'AI 与机器学习',capability:'识别、预测、生成',method:'从数据中学习',resource:'语料与算力',system:'助手与工作流程',evaluation:'正确性与边界',industry:'生产与分工',society:'工作与公共生活'};
  const positions8 = [[50,14],[82,27],[87,52],[82,77],[50,81],[18,77],[13,52],[18,27]];
  const positions6 = [[20,27],[50,13],[80,27],[80,66],[50,82],[20,66]];
  const positions4 = [[23,21],[77,21],[77,71],[23,71]];
  function discoveryRoutes() {
    const entries=[
      ['cpu','AI 为什么会答错？','围绕同一个案例，读懂生成、来源与证据，再回到最初的问题。','#roam/ai-errors','四站跨域漫游 → 回到问题'],
      ['code','打开网页，背后发生了什么？','从程序员熟悉的工作出发，看软件系统怎样协作。','#article/comp-systems','软件与计算 → AI 系统'],
      ['book-open','看懂了，为什么还不会用？','从熟悉的学习体验出发，理解知识怎样迁移。','#article/education-learning','教育与传播 → 反馈 → 理解']
    ];
    return `<section class="discovery-routes"><div class="section-heading"><div><p class="eyebrow">还没有问题？从一个现象开始</p><h2>沿着一条线索，发现相邻的知识。</h2></div><a class="quiet" href="#search">浏览全部专题 ${arrow()}</a></div><div class="discovery-grid">${entries.map(([ic,title,text,href,trail])=>`<a href="${esc(withBack(href,'#home'))}">${icon(ic)}<h3>${title}</h3><p>${text}</p><span>${trail} ${arrow()}</span></a>`).join('')}</div></section>`;
  }
  function connections(items,back,heading='这件事，还连接着什么？') {
    if(!items?.length)return '';
    return `<section class="domain-connections"><h2>${heading}</h2><div class="connection-list">${items.map(x=>`<a href="${esc(withBack(x.href,back))}"><div><h3>${esc(x.title)}</h3><p>${esc(x.reason)}</p></div>${arrow()}</a>`).join('')}</div></section>`;
  }
  function domainMap(r) {
    const ai=r.id==='ai',d=catalog().domains[r.id];
    const nodes=ai ? D.areas.map(a=>({...a,icon:areaIcons[a.id],question:areaSub[a.id],href:'#area/'+a.id})) : d.nodes.map(n=>({...n,href:withBack('#article/'+n.article,r.hash)}));
    const positions=nodes.length===8?positions8:nodes.length===6?positions6:positions4;
    const selected=ai?'system':r.id==='information'?'retrieval':d.nodes.find(n=>n.article===d.guide.article)?.id;
    const branch=ai?`<a href="#topic/model-vs-system" data-entry="explore" data-return="#domain/ai" class="branch-link">${icon('cpu')}知识助手</a>${arrow()}<a href="#article/retrieval" class="branch-link">${icon('file-text')}检索与材料</a>`:r.id==='information'?`<a href="#article/retrieval" class="branch-link">${icon('cpu')}AI 找资料 ${icon('corner-right-up')}</a>`:`<a href="${esc(withBack('#article/'+d.guide.article,r.hash))}" class="branch-link">${icon(d.icon)}${esc(d.guide.button)} ${arrow()}</a>`;
    return `<div class="domain-map ${nodes.length===4?'four-branches':''}" data-graph><canvas aria-hidden="true"></canvas><div class="domain-center" data-graph-center>${icon(d.icon)}<strong>${esc(d.title)}</strong></div>${nodes.map((n,i)=>`<a class="domain-node ${n.id===selected?'is-selected':''}" href="${esc(n.href)}" style="left:${positions[i][0]}%;top:${positions[i][1]}%">${icon(n.icon)}<strong>${esc(n.title)}</strong><small>${esc(n.question)}</small></a>`).join('')}<div class="entry-branch"><span>${ai?'这次从这里进入':r.id==='information'?'从刚才的问题进入':'从一个具体的例子开始'}</span>${branch}</div></div>`;
  }
  function infoFrom(r) {return `${infoHref}?from=ai-retrieval&back=${encodeURIComponent(r.hash)}`;}
  function guideVisual(g) {
    if(g.image)return miniImage(g.image,g.alt)+`<div class="mini-flow">${g.steps.map(s=>`<span>${esc(s.title)}</span>`).join('')}</div>`;
    return `<ol class="guide-steps" aria-label="这个例子的过程">${g.steps.map((s,i)=>`<li><span>${icon(s.icon || 'circle')}</span><div><small>0${i+1}</small><strong>${esc(s.title)}</strong>${s.text?`<p>${esc(s.text)}</p>`:''}</div></li>`).join('')}</ol>`;
  }
  function domain(r) {
    const ai=r.id==='ai',d=catalog().domains[r.id],g=d.guide;
    const tabs=[['overview','方向与路径'],['how','怎样运作'],['history','怎样形成']];
    const tabSuffix=r.q.toString()?`?${r.q}`:'';
    const originNote=r.id==='information' && r.q.get('from')==='ai-retrieval' ? `<div class="origin-note"><span>你从 AI 的「检索与材料」来到这里</span><a href="${esc(safeBack(r.q.get('back'),'#article/retrieval'))}">返回刚才的解释</a></div>`:r.q.has('back')?`<div class="origin-note"><span>沿着刚才的线索来到这里</span><a href="${esc(safeBack(r.q.get('back'),'#home'))}">返回刚才的页面</a></div>`:'';
    const title=`${originNote}<section class="journey-heading"><h1>${esc(d.title)}${ai?' <small>AI</small>':''}</h1><p>${esc(d.lead)}</p></section><nav class="domain-tabs" aria-label="领域视角">${tabs.map(([id,label])=>`<a href="#domain/${r.id}${id==='overview'?'':'/'+id}${esc(tabSuffix)}" ${r.tab===id?'aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
    const guideHref=esc(withBack('#article/'+g.article,r.hash));
    if(r.tab!=='overview')return title+`<div class="domain-details">${(d[r.tab] || []).map((s,i)=>`<section class="article-section"><span class="eyebrow">${String(i+1).padStart(2,'0')}</span><h2>${esc(s.title)}</h2><p>${esc(s.text || s.body)}</p></section>`).join('')}</div><section class="cross-bridge"><div><h2>${esc(g.title)}</h2><p>${esc(g.text)}</p></div><a class="button primary" href="${guideHref}">${esc(g.button)} ${arrow()}</a></section>${sources(d.sources)}${readingRoute(r.id)}`;
    return title+window.COGNITION.domain(r);
  }
  const materials = {
    old:{label:'旧版流程',icon:'file-text',status:'选中了旧版',answer:'按旧版示例：提交给项目负责人。',result:'得到过时答案',explain:'如果现行版本没有被找到，模型即使读懂了资料，也可能给出不适用的回答。'},
    current:{label:'现行流程',icon:'file-text',status:'选中了现行版',answer:'按现行示例：先在服务台登记，再由负责人处理。',result:'获得适用的材料',explain:'材料与问题的时间、对象相符，回答才有合适的依据。资料找对以后，仍要检查模型有没有遗漏或误读。'},
    unrelated:{label:'无关纪要',icon:'file',status:'选中了无关材料',answer:'这份纪要没有说明适用流程，不能据此确定答案。',result:'依据不足，需要补找',explain:'内容与问题无关时，应说明缺少依据。相关词出现过，并不代表这份材料能回答问题。'}
  };
  function materialKey(r) {return Object.hasOwn(materials,r.q.get('material'))?r.q.get('material'):'old';}
  function retrievalFlow(r) {
    const selected=materialKey(r),m=materials[selected];
    return `<div class="retrieval-flow"><div class="flow-stage">${icon('message-circle')}<strong>现在适用哪份流程？</strong><small>提出问题</small></div><span class="flow-arrow">${arrow()}</span><div class="flow-stage"><div class="document-choices" role="group" aria-label="切换送给模型的资料">${Object.entries(materials).map(([key,value])=>`<button type="button" class="document-choice ${key==='old'?'is-old':''}" data-material="${key}" aria-pressed="${selected===key}">${icon(value.icon)}${value.label}${selected===key?icon('check-circle'):''}</button>`).join('')}</div><small>检索资料 · 点击切换</small></div><span class="flow-arrow">${arrow()}</span><div class="flow-stage">${icon('cpu')}<strong>模型组织回答</strong><small>${m.status}</small></div><span class="flow-arrow">${arrow()}</span><div class="flow-stage answer-stage" data-result="${selected}" aria-live="polite">${icon(selected==='current'?'check-circle':selected==='old'?'alert-triangle':'help-circle')}<strong>${m.answer}</strong><small>${m.result}</small></div></div><p class="demo-explanation" role="status">${m.explain}</p>`;
  }
  function retrieval(r) {
    return `<article><header class="knowledge-head"><p class="eyebrow">答案从哪里来</p><h1>AI 答错，有时是资料没找对。</h1><p class="lead">支持检索的知识助手，通常先找相关资料，再交给模型组织回答。资料遗漏、过期或不相关，都可能影响答案。</p><p class="qualifier">这是错误来源之一，模型理解与推理也可能出错。</p></header><section class="retrieval-demo" aria-labelledby="retrieval-title"><div class="section-heading"><h2 id="retrieval-title">一次回答，经过哪些环节？</h2><small>构造示例 · 非真实模型输出</small></div><div id="retrieval-live">${retrievalFlow(r)}</div></section><section class="mechanism-summary" aria-label="资料背后的三个问题">${[['tag','描述与分类','让资料容易被辨认'],['layers','来源与版本','确认资料是否适用'],['search','检索与筛选','找到与问题相关的材料']].map(([ic,title,text])=>`<div>${icon(ic)}<h3>${title}</h3><p>${text}</p></div>`).join('')}</section><section class="cross-bridge"><div><h2>从这里，走向「信息组织」</h2><p>在模型读取之前，资料已经经过描述、分类与检索。图书馆找书，也要解决这些问题。</p><div class="bridge-flow"><span>${icon('file-text')}资料</span>${arrow()}<span>${icon('archive')}目录与索引</span>${arrow()}<span>${icon('book-open')}找到所需</span></div></div><div><a class="button primary" data-cross-info href="${esc(infoFrom(r))}">看看信息如何组织 ${arrow()}</a>${articleLink('info-retrieval','继续深入：检索怎样筛选材料',r.hash,'quiet')}<a class="quiet" href="${esc(withBack('#map/rag',r.hash))}">展开 RAG 的完整知识结构 ${arrow()}</a></div></section><div class="article-body"><section class="article-section"><h2>模型收到的，只是资料的一部分</h2><p>一个知识库可能有很多文档，但每次提问通常只会选出部分材料交给模型。检索负责找候选材料，筛选负责缩小范围，模型再利用收到的上下文组织回答。如果关键文档没进入这一步，回答就可能缺少必要依据。这也解释了为什么“库里明明有”不等于“这次回答用到了”。</p></section><section class="article-section"><h2>相关、适用、可信，是不同的问题</h2><p>一份旧文档可能和问题非常相关，却已经不适用；一段文字也可能来自可靠机构，却讨论另一个对象。理解一次回答，既要看是否找到了相关材料，也要看版本、适用条件以及回答是否被原文支持。引用链接提供了回查入口，本身不保证答案正确。</p></section><section class="article-section"><h2>这张图省略了什么？</h2><p>这里把复杂系统简化成了一条线。实际产品可能反复搜索、多次调用工具，也可能只使用模型已有能力而不检索资料。图中的三种输出是为讲解准备的示例，不是对某个模型表现的预测。更好的检索能改善输入条件，不能消除所有理解和推理错误。</p></section><a class="quiet" href="#topic/source-validity" data-entry="explore" data-return="${esc(r.hash)}">继续读：有出处的答案就一定适用吗？ ${arrow()}</a>${sources([{title:'Lewis 等：Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',url:'https://arxiv.org/abs/2005.11401'},{title:'Stanford：Introduction to Information Retrieval',url:'https://nlp.stanford.edu/IR-book/'}])}</div></article>`;
  }
  function bookDemo(mode='title') {
    const byTitle=mode==='title';
    return `<div class="book-demo"><div class="demo-controls" role="group" aria-label="选择找书方式"><button type="button" data-book-mode="title" aria-pressed="${byTitle}">知道书名</button><button type="button" data-book-mode="subject" aria-pressed="${!byTitle}">只知道主题</button></div><div class="book-path" aria-live="polite"><div>${icon('message-circle')}<h3>${byTitle?'想找《城市与河流》':'想了解河流与城市的关系'}</h3><p>${byTitle?'有明确的书名，可以查对应记录。':'还没有具体书名，可以从主题词进入。'}</p></div><span>${arrow()}</span><div>${icon('archive')}<h3>${byTitle?'查书名，核对作者与版本':'查“河流”“城市”，比较相关记录'}</h3><p>${byTitle?'同名书、不同版本，需要进一步区分。':'同一主题可能连接不同作者和不同分类的书。'}</p></div><span>${arrow()}</span><div>${icon('book-open')}<h3>${byTitle?'根据馆藏位置找到这本书':'选一条记录，再按馆藏位置找书'}</h3><p>目录帮助定位；内容是否适合，还要打开阅读。</p></div></div><small>《城市与河流》是为此图解构造的示例书目。</small></div>`;
  }
  const contextModes={
    context:{label:'这次提供上下文',where:'本次请求的输入',action:'把“喜欢简短回答”连同问题一起交给模型',result:'这次回答可以据此调整',limit:'换一次请求，若系统没有再次传入这条信息，就不能仅凭上次输入保证它还知道。'},
    memory:{label:'产品保存一条记忆',where:'产品的外部存储',action:'产品保存偏好，之后按规则检索并加入请求',result:'下一次也可能带入这条偏好',limit:'是否保存、何时使用、如何删除取决于产品实现；存下来不代表每次都会被调用。'},
    training:{label:'另行用于训练',where:'训练过程中的参数更新',action:'经过数据处理和优化，改变模型的参数',result:'影响模型学习到的模式',limit:'不是通常一次聊天就立即训练；也不是逐条可准确提取的个人记忆。输入是否被用于后续训练，要看具体服务政策。'}
  };
  function contextDemo(r) {
    const key=Object.hasOwn(contextModes,r.q.get('mode'))?r.q.get('mode'):'context',m=contextModes[key];
    return `<section class="retrieval-demo context-demo"><div class="section-heading"><h2>同一句话，可以走向三个不同地方</h2><small>机制示意 · 不调用真实模型</small></div><p class="demo-sentence">你告诉助手：“我喜欢简短的回答。”</p><div class="demo-controls" role="group" aria-label="切换信息去向">${Object.entries(contextModes).map(([id,x])=>`<button type="button" data-context-mode="${id}" aria-pressed="${id===key}">${esc(x.label)}</button>`).join('')}</div><div class="context-result" aria-live="polite"><div>${icon(key==='training'?'settings':key==='memory'?'archive':'message-square')}<span>信息放在哪里</span><h3>${esc(m.where)}</h3></div><span class="context-arrow">${arrow()}</span><div><span>中间发生什么</span><h3>${esc(m.action)}</h3></div><span class="context-arrow">${arrow()}</span><div><span>可能带来什么</span><h3>${esc(m.result)}</h3></div></div><p class="demo-explanation">${esc(m.limit)}</p></section>`;
  }
  function scienceArticle(r) {
    const a=catalog().articles[r.id],d=catalog().domains[a.domain],domainHref='#domain/'+d.id;
    const visual=r.id==='info-finding'?`<section class="retrieval-demo"><h2>同一份目录，两种进入方式</h2><div id="book-demo-live">${bookDemo(r.q.get('book')==='subject'?'subject':'title')}</div></section>`:r.id==='ai-context'?contextDemo(r):a.visual?`<figure class="reading-visual"><figcaption>${a.visual.kind==='compare'?'并排看清区别':'把过程展开来看'}</figcaption><ol class="explain-nodes ${a.visual.kind}">${a.visual.steps.map((s,i)=>`<li><span class="diagram-number">${String(i+1).padStart(2,'0')}</span><strong>${esc(s.title)}</strong><p>${esc(s.text)}</p></li>`).join('')}</ol></figure>`:'';
    const crossLinks=a.crossLinks || d.connections;
    const related=(a.related || []).filter(id=>Object.hasOwn(catalog().articles,id));
    return `<article><header class="knowledge-head"><p class="eyebrow">${esc(a.eyebrow.startsWith(d.title)?a.eyebrow:d.title+' · '+a.eyebrow)}</p><h1>${esc(a.title)}</h1><p class="lead">${esc(a.lead)}</p>${a.scope?`<p class="qualifier">${esc(a.scope)}</p>`:''}</header>${window.CONTEXT_MAP?.demo(r) || window.RAG_MAP?.demo(r) || window.AGENT_MAP?.demo(r) || window.LLM?.demo(r) || ''}${visual}<div class="article-body">${a.sections.map(s=>`<section class="article-section"><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></section>`).join('')}<section class="reading-example"><p class="eyebrow">用一个例子理解</p><h2>${esc(a.example.title)}</h2><p>${esc(a.example.text)}</p></section><section class="reading-takeaway"><h2>带走这个理解</h2><p>${esc(a.takeaway)}</p></section>${related.length?`<section class="reading-more"><h2>沿着关联继续看</h2><div class="chapter-list">${related.map(id=>articleLink(id,`${esc(catalog().articles[id].title)} ${arrow()}`,r.hash)).join('')}</div></section>`:''}${connections(crossLinks,r.hash,'换一个领域，看懂另一面')}${sources(a.sources)}<nav class="article-pager"><a class="button secondary" href="${esc(safeBack(r.q.get('back'),domainHref))}">${icon('arrow-left')}返回刚才的页面</a><a class="quiet" href="${domainHref}">回到${esc(d.title)}全景 ${arrow()}</a></nav></div></article>`;
  }
  function world(r) {
    const s=social().systems.find(s=>s.id===r.id),t=r.tab==='overview'?null:s.topics.find(t=>t.id===r.tab);
    if (!t) return `<header class="journey-heading world-heading">
      <p class="eyebrow">社会板块 · ${esc(s.kicker)}</p><h1>${esc(worldTitle(s.id))}</h1>
      <p>${esc(s.summary)}</p><a class="quiet" href="${esc(safeBack(r.q.get('back'),'#home'))}">${icon('arrow-left')} ${r.q.has('back')?'返回刚才的页面':'返回世界全景'}</a>
      </header>${window.EXPLORE.worldIndustryView(r)}
      <section class="article-body"><h2>${esc(s.question)}</h2><div class="topic-list">${s.topics.map(t=>
        `<a class="topic-row" href="${esc(withBack(`#world/${s.id}/${t.id}`,r.hash))}"><div><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p></div>${arrow()}</a>`).join('')}</div>
      <h2>它还连接着什么？</h2><div class="chapter-list">${s.relations.map(rel=>
        `<a href="${esc(withBack(`#world/${rel.target}`,r.hash))}">${esc(worldTitle(rel.target))} · ${esc(rel.label)} ${arrow()}</a>`).join('')}</div></section>
      ${s.id==='knowledge'?connections(Object.values(catalog().domains).map(d=>({href:'#domain/'+d.id,title:d.title,reason:d.lead})),r.hash,'从一个领域，逐步看见它的关联'):''}`;
    return `<article><header class="knowledge-head"><p class="eyebrow">${esc(s.title)}</p><h1>${esc(t.title)}</h1><p class="lead">${esc(t.summary)}</p></header><div class="article-body"><p>${esc(t.why)}</p>${t.mechanism.map(x=>`<section class="article-section"><h2>${esc(x.title)}</h2><p>${esc(x.description)}</p></section>`).join('')}${t.example?`<section class="reading-example"><h2>${esc(t.example.title)}</h2><p>${esc(t.example.text || t.example.description)}</p><ol>${(t.example.steps || []).map(step=>`<li>${esc(step)}</li>`).join('')}</ol></section>`:''}${sources((t.sourceIds || []).map(id=>social().sources.find(s=>s.id===id)).filter(Boolean))}<nav class="article-pager"><a class="button secondary" href="${esc(safeBack(r.q.get('back'),'#world/'+s.id))}">${icon('arrow-left')}${r.q.has('back')?'返回刚才的页面':'返回'+esc(s.title)}</a><a class="quiet" href="#world/${s.id}">回到领域总览 ${arrow()}</a></nav></div></article>`;
  }
  function search(r) {
    const query=(r.q.get('q') || '').trim().slice(0,100),filter=r.q.get('domain') || '';
    const filters=[['','全部'],['industries','行业'],['skills','技能'],['thinking','思维'],['foundations','基础概念'],['study','学习路线'],...Object.values(catalog().domains).map(d=>[d.id,d.title]),['world','社会专题']];
    const domain=filters.some(([id])=>id===filter)?filter:'';
    const items=catalog().find(query,domain);
    return `<section class="journey-heading"><p class="eyebrow">带着兴趣阅读</p><h1>找一条你想理解的线索</h1><p>从一个问题进入，也能回到它所在的全景。</p></section><form id="journey-search" class="search-form"><label class="sr-only" for="journey-query">查找科普内容</label><input id="journey-query" name="query" type="search" maxlength="100" value="${esc(query)}" placeholder="例如：物流、流程、分段定位"><input type="hidden" name="domain" value="${esc(domain)}"><button class="button primary">搜索 ${icon('search')}</button></form><nav class="search-filters" aria-label="筛选科普内容">${filters.map(([id,title])=>`<a href="#search?${esc(new URLSearchParams({...query?{q:query}:{},...id?{domain:id}:{}}).toString())}" ${domain===id?'aria-current="page"':''}>${esc(title)}</a>`).join('')}</nav><p role="status" class="muted">${query?'“'+esc(query)+'” · ':''}${items.length} 个相关入口${query?' · 按站内标题与正文匹配':''}</p>${items.length?`<div class="topic-list">${items.map(x=>`<a class="topic-row" href="${esc(x.href.startsWith('#topic/')?x.href:withBack(x.href,r.hash))}" ${x.href.startsWith('#topic/')?`data-entry="explore" data-return="${esc(r.hash)}"`:''}><div><span class="eyebrow">${esc(x.tag)} · ${esc(x.type)}</span><h2>${esc(x.title)}</h2><p>${esc((x.description || x.text).slice(0,150))}</p></div>${arrow()}</a>`).join('')}</div>`:`<div class="empty-state"><h2>暂时没有直接匹配的内容</h2><p>可以缩短为“物流”“流程”“证据”等关键词，或换一类继续浏览。</p><a class="button secondary" href="#search">浏览全部专题</a><a class="quiet" href="#home">返回世界全景</a></div>`}`;
  }
  function drawGraphs() {
    document.querySelectorAll('[data-graph]').forEach(graph=>{
      const canvas=graph.querySelector('canvas'),center=graph.querySelector('[data-graph-center]');
      if(!canvas || !center || getComputedStyle(canvas).display==='none')return;
      const rect=graph.getBoundingClientRect(),dpr=devicePixelRatio || 1;
      canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);
      const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);
      const point=n=>{const b=n.getBoundingClientRect();return{x:b.left-rect.left+b.width/2,y:b.top-rect.top+b.height/2};};
      const c=point(center);ctx.strokeStyle='#c7d3bc';ctx.lineWidth=2;
      graph.querySelectorAll('.world-node,.domain-node').forEach(n=>{if(n===center)return;const p=point(n);ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.quadraticCurveTo(c.x,p.y,p.x,p.y);ctx.stroke();});
    });
  }
  const projectMapLinks = {
    llm: {step:'verification',title:'看回答怎样被核验',text:'对照一次生成结果、引用原文和当前适用的规则。'},
    agent: {step:'task',title:'看任务怎样划出行动范围',text:'从员工查规定的需求，分清查询资料与办理预约各需哪些能力。'},
    rag: {step:'retrieval',title:'看检索怎样找到适用规定',text:'比较按字词匹配和按适用范围筛选，观察候选材料的变化。'},
    context: {step:'context',title:'看规则怎样进入本轮输入',text:'对比完整条款与截取片段，观察保留哪些条件会影响核验。'}
  };
  function knowledgeMap(r) {
    const map = r.id==='context'?window.CONTEXT_MAP:r.id==='rag'?window.RAG_MAP:r.id==='agent'?window.AGENT_MAP:window.LLM;
    const target = projectMapLinks[r.id];
    const back = safeBack(r.q.get('back'),'');
    const fromProject = back && route(back).kind === 'project';
    const href = fromProject ? back : withBack('#project/knowledge-assistant/'+target.step,r.hash);
    const title = fromProject ? '回到刚才的项目站点' : target.title;
    return map.render(r)+`<section class="cross-bridge"><div><p class="eyebrow">放进一个实际任务</p><h2>公司知识库助手</h2><p>${target.text}</p></div><a class="button secondary" href="${esc(href)}">${title} ${arrow()}</a></section>`;
  }
  function render(r) {
    mapObserver?.disconnect();
    chrome(r);
    const main=document.getElementById('main-content');main.className='journey-'+r.kind;
    const templates={home,learn:r=>window.EXPLORE.render(r),study:r=>window.LEARNING.render(r),research:()=>window.RESEARCH.render(),domain,map:knowledgeMap,article:r=>r.id==='retrieval'?retrieval(r):scienceArticle(r),world,search,roam:r=>window.ROAM.render(r),project:r=>window.ASSISTANT_PROJECT.render(r),'project-overview':()=>document.getElementById('project-overview-template').innerHTML,missing:()=>'<h1>这个入口暂时不存在</h1><a class="button primary" href="#home">返回探索首页</a>'};
    main.innerHTML=(r.kind==='article'?window.COGNITION.wayfinding(r.hash,r.q.get('back') || ''):'')+templates[r.kind](r)+(r.kind==='article'?window.COGNITION.readingNav(r.hash,r.q.get('back') || ''):'');
    document.title=`${main.querySelector('h1')?.textContent || '世界全景'} · 见全`;
    mapObserver=new ResizeObserver(drawGraphs);main.querySelectorAll('[data-graph]').forEach(g=>mapObserver.observe(g));drawGraphs();
  }
  function decorateLegacy(r,returnHash='') {
    mapObserver?.disconnect();chrome(r);
    const llmContext=r.view==='topic'?window.COGNITION.mapContext(location.hash,returnHash):null;
    const crumb=document.getElementById('breadcrumb');
    const first=crumb.querySelector('a');if(first){first.href='#home';first.textContent='世界全景';}
    document.querySelectorAll('#context-rail a[href="#home"], #breadcrumb a[href="#home"], #main-content a[href="#home"]').forEach(a=>{if(/AI|全景，继续/.test(a.textContent))a.href=aiHref;});
    if(r.view==='topic') {
      const main=document.getElementById('main-content');
      main.insertAdjacentHTML('afterbegin',window.COGNITION.wayfinding(location.hash,returnHash));
      main.insertAdjacentHTML('beforeend',window.COGNITION.readingNav(location.hash,returnHash));
      if(llmContext)main.querySelectorAll('.reading-more a[data-entry]').forEach(a=>{a.dataset.return=llmContext.hash;});
    }
    if(r.view==='area') {
      const link=window.COGNITION.directionHref('ai',r.area.id);
      document.getElementById('main-content').insertAdjacentHTML('afterbegin',`<section class="cog-wayfinding"><p>这个方向还有逐步深入的路径、相关基础与跨域入口。</p><a class="quiet" href="${esc(link)}">在方向地图中展开「${esc(r.area.title)}」 ${arrow()}</a></section>`);
    }
    const companions={
      'training-inference':['ai-context'], 'prompt-context':['context-composition','context-task','ai-context'],
      'model-vs-system':['ai-agent','comp-systems'], 'tool-actions':['ai-agent'],
      'autonomy-boundaries':['ai-agent'], 'accuracy-context':['ai-generation','comp-testing'],
      'source-validity':['ai-generation','info-provenance']
    };
    const ids=r.view==='topic'?companions[r.topic?.id]:null;
    if(ids)document.getElementById('main-content').insertAdjacentHTML('beforeend',connections(ids.map(id=>({href:'#article/'+id,title:catalog().articles[id].title,reason:catalog().articles[id].takeaway})),llmContext?.hash || location.hash,'用图解继续理解'));

  }
  document.addEventListener('submit',event=>{
    if(!['global-search','journey-search'].includes(event.target.id))return;
    event.preventDefault();const value=String(new FormData(event.target).get('query') || '').trim().slice(0,100);
    const query=new URLSearchParams();if(value)query.set('q',value);const filter=new FormData(event.target).get('domain');if(filter)query.set('domain',filter);const hash='#search'+(query.size?'?'+query.toString():'');
    if(location.hash===hash)render(route(hash));else location.hash=hash;
  });
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-origin')) {
      origin=b.dataset.origin==='programmer'?'programmer':'';
      try{localStorage.setItem('jianquan.origin.v1',origin);}catch(_){}
      document.querySelector('.origin-control').open=false;
      document.getElementById('origin-label').textContent=origin?'程序员':'自由浏览';
      const r=route(location.hash);if(r)render(r);
    }
    if(b.dataset.material && Object.hasOwn(materials,b.dataset.material)) {
      const r=route(location.hash);r.q.set('material',b.dataset.material);r.hash='#article/retrieval?'+r.q.toString();history.replaceState(null,'',r.hash);
      document.getElementById('retrieval-live').innerHTML=retrievalFlow(r);
      document.querySelectorAll('[data-cross-info],#context-rail a[href^="#domain/information"]').forEach(a=>a.href=infoFrom(r));
      const deeper=document.querySelector('.cross-bridge a[href^="#article/info-retrieval"]');if(deeper)deeper.href=withBack('#article/info-retrieval',r.hash);
      const navigation=document.querySelector('.cog-reading-nav');if(navigation)navigation.outerHTML=window.COGNITION.readingNav(r.hash,r.q.get('back') || '');
      document.querySelector(`[data-material="${b.dataset.material}"]`).focus({preventScroll:true});
    }
    if(b.dataset.bookMode || b.dataset.contextMode) {
      const r=route(location.hash);if(!r || r.kind!=='article')return;
      const isBook=Boolean(b.dataset.bookMode),value=isBook?b.dataset.bookMode:b.dataset.contextMode;
      r.q.set(isBook?'book':'mode',value);r.hash='#article/'+r.id+'?'+r.q.toString();history.replaceState(null,'',r.hash);render(r);
      document.querySelector(`[${isBook?'data-book-mode':'data-context-mode'}="${value}"]`)?.focus({preventScroll:true});
    }
  });
  window.JOURNEY={route,render,decorateLegacy,safeBack,withBack,worldTitle};
})();
