(() => {
  'use strict';
  const D = window.AI_ATLAS_DATA, C = window.AI_CORE, G = window.AI_GUIDE || [];
  const reading = id => window.AI_READING?.[id];
  let searchQuery = '';
  const main = document.getElementById('main-content');
  if (!D || !C) { main.innerHTML = '<div class="empty-state"><h1>内容未能加载</h1><p>请刷新页面，或重新启动本地服务。</p></div>'; return; }
  const topics = new Map(D.topics.map(t => [t.id, t]));
  const areas = new Map(D.areas.map(a => [a.id, a]));
  const sources = new Map(D.sources.map(s => [s.id, s]));
  const key = 'ai-atlas.v1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => window.feather?.icons[name]?.toSvg({'aria-hidden':'true',width:20,height:20,'stroke-width':1.65}) || '';
  const arrow = () => icon('arrow-right');
  const now = () => new Date().toISOString();
  const dateText = date => date && Number.isFinite(Date.parse(date)) ? new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium',timeStyle:'short'}).format(new Date(date)) : '尚未保存';
  let state = C.normalizeState(null, [...topics.keys()]);
  let storageOK = true, toastTimer, observer;
  try { state = C.normalizeState(JSON.parse(localStorage.getItem(key) || 'null'), [...topics.keys()]); } catch (_) { storageOK = false; }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(state)); storageOK = true; }
    catch (_) { storageOK = false; }
    storageNotice();
    return storageOK;
  }
  function storageNotice() {
    const el = document.getElementById('storage-notice');
    el.hidden = storageOK;
    el.textContent = '当前浏览器暂时不能保存记录。本次页面内仍可使用；请在理解记录页导出一份副本，避免刷新后丢失。';
  }
  function toast(text) {
    const el = document.getElementById('toast'); clearTimeout(toastTimer);
    el.textContent = text; el.hidden = false;
    toastTimer = setTimeout(() => { el.hidden = true; }, 3800);
  }
  function navigate(hash) { if (location.hash === hash) render(); else location.hash = hash; }
  function route() {
    const journey = window.JOURNEY?.route(location.hash);
    if (journey) return journey;
    let path;
    try { path = decodeURIComponent(location.hash.slice(1) || 'home').split('/'); } catch (_) { return {view:'missing'}; }
    const [view, id] = path;
    if (['home','questions','records','search'].includes(view)) return {view};
    if (view === 'guide' && G.length) return {view, id:Math.max(0,Math.min(G.length-1,Math.floor(Number(id)||0)))};
    if (view === 'goal') return {view, id};
    if (view === 'area' && areas.has(id)) return {view, area:areas.get(id)};
    if (['topic','challenge','record'].includes(view) && topics.has(id)) return {view, topic:topics.get(id)};
    // Preserve direct links from the earlier social prototype.
    if (['system','overview','history','explorations'].includes(view)) return {view:'legacy'};
    return {view:'missing'};
  }
  function status(id) {
    const s = C.getTopicStatus(state,id);
    const labels = {unexplored:'尚未探索',question:'已记下问题',evidence:'已有依据',review:'需要复核'};
    const names = {unexplored:'circle',question:'help-circle',evidence:'file-text',review:'refresh-cw'};
    return `<span class="status" data-state="${s}">${icon(names[s])}${labels[s]}</span>`;
  }
  const heading = (eyebrow,title,description='') => `<div class="page-heading"><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${description ? `<p>${esc(description)}</p>` : ''}</div>`;
  function backHref() { return state.entry?.returnHash?.startsWith('#') ? state.entry.returnHash : '#home'; }
  function topicLink(id,label,origin='',mode='explore',className='') {
    return `<a class="${className}" href="#topic/${esc(id)}" ${origin ? `data-entry="${mode}" data-return="${esc(origin)}"` : ''}>${label}</a>`;
  }
  function renderRail(r) {
    const rail = document.getElementById('context-rail');
    const a = r.area || (r.topic && areas.get(r.topic.area));
    if (a) {
      rail.innerHTML = `<h2>你在这里</h2><nav class="local-tree" aria-label="知识层级"><a href="#home">AI 全景</a><a href="#area/${a.id}" ${!r.topic ? 'aria-current="page"' : ''}>${esc(a.title)}</a>${r.topic ? `<a href="#topic/${r.topic.id}" aria-current="page">${esc(r.topic.shortTitle || r.topic.title)}</a>` : ''}</nav><div class="rail-separator"></div><h3>相邻区域</h3><div class="related-links">${a.related.map(id => `<a href="#area/${id}">${icon('link')}${esc(areas.get(id)?.title)}${icon('chevron-right')}</a>`).join('')}</div><p class="muted">同一个问题，可以连接不同领域。</p><a class="button secondary rail-bottom" href="${esc(r.topic ? backHref() : '#home')}">${icon('arrow-left')}${r.topic ? '返回刚才的路径' : '回到 AI 全景'}</a>`;
    } else {
      const labels = [['生产','economy'],['工作','economy/division-of-labor'],['生活','care'],['信息','knowledge'],['制度','governance'],['资源','foundations']];
      rail.innerHTML = `<h2>社会全景</h2><p>从社会整体看，AI 正在与多个领域相互作用。</p><nav class="society-links" aria-label="AI 与社会"><a href="#home" class="rail-ai" aria-current="page">AI</a>${labels.map(([label,id]) => `<a href="./society.html#system/${id}">${icon('circle')}${label}</a>`).join('')}</nav><div class="rail-separator"></div><h3>AI 与社会的连接</h3><p>把能力、资源、组织和人的处境放在一起理解。</p><a href="./society.html#overview" class="quiet">展开社会全景 ${arrow()}</a>`;
    }
  }
  function renderCrumbs(r) {
    const a = r.area || (r.topic && areas.get(r.topic.area));
    const items = ['<a href="./society.html#overview">社会全景</a>','<a href="#home">AI</a>'];
    if (a) items.push(`<a href="#area/${a.id}">${esc(a.title)}</a>`);
    if (r.topic) items.push(`<a href="#topic/${r.topic.id}">${esc(r.topic.shortTitle || r.topic.title)}</a>`);
    const last = {goal:'我的想法',questions:'我的问题',records:'理解记录',challenge:'情境判断',record:'理解记录',search:'查找专题',guide:'从头读懂 AI'}[r.view];
    if (last) items.push(`<span aria-current="page">${last}</span>`);
    document.getElementById('breadcrumb').innerHTML = items.join('<span aria-hidden="true">/</span>');
    document.querySelectorAll('[data-nav]').forEach(el => {
      const current = r.view === 'guide' ? 'guide' : r.view === 'search' ? 'search' : 'explore';
      if (el.dataset.nav === current) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current');
    });
  }
  function goalForm() {
    return `<form class="goal-form" id="goal-form"><label class="sr-only" for="goal-input">你想理解或解决什么？</label><div class="goal-input-wrap">${icon('search')}<input id="goal-input" name="goal" maxlength="300" placeholder="我想用 AI 提高开发效率" value="${esc(state.drafts.goal || '')}" required data-draft="goal"></div><button class="button primary" type="submit">沿着想法探索</button><a class="button secondary" href="#area/society" data-explore>随便看看</a></form>`;
  }
  function readingVisual(v) {
    return `<figure class="reading-visual"><ol class="explain-nodes ${v.kind==='compare'?'compare':'flow'}">${v.steps.map((x,i)=>`<li><span class="diagram-number">${String(i+1).padStart(2,'0')}</span><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></li>`).join('')}</ol></figure>`;
  }
  function home() {
    const positions = {scope:[19,22],capability:[50,12],method:[14,51],resource:[22,80],system:[80,23],evaluation:[86,52],industry:[52,88],society:[76,80]};
    return `<section class="science-intro">${heading('图解人工智能 / AI EXPLAINED','人工智能，究竟在改变什么？','从你每天遇见的推荐、翻译和对话，走进技术背后的原理、产业与社会。')}<p class="opening-answer">人工智能是一组让机器完成识别、预测、生成与规划等任务的方法。要读懂它，可以从三个层面往下看：<strong>能力怎样产生，产品怎样运作，它又怎样进入人的生活。</strong></p><div class="actions"><a class="button primary" href="#guide/0">从头读懂 AI ${arrow()}</a><button class="button secondary" data-action="scroll" data-target="ai-map">先看知识全景 ${icon('arrow-down')}</button></div><div class="overview-chain">${[['原理','数据与训练','从例子中学习规律，形成能够处理新输入的模型。','training-inference'],['产品','能力与应用','模型与资料、工具和人配合，才成为可用的服务。','model-vs-system'],['社会','行业与生活','任务的变化影响分工、成本和责任，也产生新的问题。','task-job']].map((x,i)=>topicLink(x[3],`<span class="eyebrow">${String(i+1).padStart(2,'0')} · ${x[0]}</span><h2>${x[1]}</h2><p>${x[2]}</p><span class="quiet">展开理解 ${arrow()}</span>`,'#home','explore','overview-part')).join('')}</div></section><section class="reader-entry"><div><p class="eyebrow">带着兴趣来</p><h2>已经有想了解的内容？</h2></div><form id="reader-search" class="search-form"><label class="sr-only" for="reader-query">搜索想了解的 AI 主题</label><input id="reader-query" name="query" type="search" placeholder="例如：大模型、工作、数据、准确率" maxlength="100" required><button class="button primary" type="submit">找专题 ${icon('search')}</button></form></section><section id="ai-map" class="science-map"><div class="section-heading"><div><p class="eyebrow">从整体到细节</p><h2>一张地图，八个观察入口</h2></div><p class="muted">点击区域，展开解释与例子</p></div><div class="panorama-wrap"><div class="panorama" aria-label="AI 八个相互关联的区域"><canvas class="map-connectors" aria-hidden="true"></canvas><div class="ai-center">AI<small>知识全景</small></div>${D.areas.map(a=>`<a class="area-node ${a.id==='society'?'featured':''}" href="#area/${a.id}" data-area="${a.id}" style="left:${positions[a.id][0]}%;top:${positions[a.id][1]}%"><strong>${esc(a.title)}</strong><small>${esc(a.question)}</small></a>`).join('')}</div><aside class="panorama-side"><div class="phenomenon"><p class="eyebrow">从生活看原理</p><h2>AI 写代码快了，项目为什么还没快？</h2><p>一个环节的速度，只是整个工作流程的一部分。</p>${topicLink('workflow-efficiency',`读解释，看看图 ${arrow()}`,'#home','explore','quiet')}</div></aside></div><p class="map-caption">连线表示领域之间有关联；这是一种阅读框架，可以从任一处开始。</p></section><section class="science-featured"><div class="section-heading"><h2>先读懂几个容易混淆的地方</h2><a class="quiet" href="#search">浏览全部专题 ${arrow()}</a></div><div class="topic-list">${['ai-landscape','training-inference','false-positives','task-job'].map(id=>topicRow(topics.get(id),'#home')).join('')}</div></section>`;
  }
  function guidePage(index) {
    const g=G[index],source=sources.get(g.source);
    return `<nav class="guide-chapters" aria-label="AI 科普导览章节">${G.map((x,i)=>`<a href="#guide/${i}" ${i===index?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${esc(x.label)}</a>`).join('')}</nav><article class="guide-article">${heading(`从头读懂 AI · ${index+1} / ${G.length}`,g.title)}<p class="article-lead">${esc(g.intro)}</p><section class="article-section"><h2>${esc(g.visualTitle)}</h2>${readingVisual(g)}</section><section class="reading-example"><p class="eyebrow">用一个例子理解</p><h2>${esc(g.exampleTitle)}</h2><p>${esc(g.example)}</p></section><p class="reading-takeaway">${esc(g.conclusion)}</p><div class="reading-more"><h2>如果想再深入一点</h2><div class="related-links">${[g.topic,...g.related].map(id=>topicLink(id,`${esc(topics.get(id).shortTitle)} ${arrow()}`,`#guide/${index}`,'explore')).join('')}</div></div><p class="reading-source">本节参考：<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.org)} · ${esc(source.title)} ${icon('external-link')}</a></p></article><nav class="guide-pager" aria-label="继续阅读">${index>0?`<a class="button secondary" href="#guide/${index-1}">${icon('arrow-left')}上一节：${esc(G[index-1].label)}</a>`:`<a class="button secondary" href="#home">${icon('arrow-left')}返回首页</a>`}${index<G.length-1?`<a class="button primary" href="#guide/${index+1}">下一节：${esc(G[index+1].label)} ${arrow()}</a>`:`<a class="button primary" href="#home">回到全景，继续展开 ${arrow()}</a>`}</nav>`;
  }
  function topicRow(t,origin='',mode='explore') {
    return topicLink(t.id,`<div class="topic-body"><h3>${esc(t.title)}</h3><p>${esc(reading(t.id)?.takeaway || t.lead)}</p></div><span class="read-label">阅读 ${icon('chevron-right')}</span>`,origin,mode,'topic-row');
  }
  function areaPage(a) {
    const list = a.topics.map(id => topics.get(id));
    return `${heading('AI 科普 · 主题分区',a.question,a.summary)}<div class="area-intro"><p class="eyebrow">${esc(a.title)} · 从这三个角度展开</p><div class="branch-topics">${list.map((t,i)=>topicLink(t.id,`<span>${String(i+1).padStart(2,'0')} · ${esc(t.shortTitle)}</span>${arrow()}`,`#area/${a.id}`,'explore','branch-topic')).join('')}</div></div><div class="topic-list">${list.map(t=>topicRow(t,`#area/${a.id}`)).join('')}</div><section class="context-links">${a.related.map(id=>`<a href="#area/${id}">${icon('link')}继续了解${esc(areas.get(id).title)} ${arrow()}</a>`).join('')}</section><a class="button secondary" href="#home">${icon('arrow-left')}回到 AI 全景</a>`;
  }
  function goalPage(id) {
    const goal = D.goals.find(g => g.id === id);
    if (!goal) return `${heading('把想法变成可以探索的问题','从哪条线索开始？',state.goal?.text ? `你的想法：${state.goal.text}` : '先选择一个方向，也可以回到全景自由浏览。')}<p class="notice">这版提供人工整理的探索路线。选择最接近的方向，原来的想法会一起保留。</p><div class="topic-list">${D.goals.map(g => `<button type="button" class="topic-row" data-action="select-goal" data-id="${g.id}"><div class="topic-body"><h3>${esc(g.title)}</h3><p>${g.steps.map(s => esc(s.title)).join(' · ')}</p></div>${arrow()}</button>`).join('')}</div><a class="button secondary" href="#home">回到全景</a>`;
    return `${heading('沿目标拆解',state.goal?.text || goal.title,'先找到影响结果的环节，再逐个理解。')}<div class="actions"><button class="button secondary" data-action="change-goal">${icon('edit-3')}调整想法</button><a class="quiet" href="#home">查看完整地图 ${arrow()}</a></div><div class="workflow goal-route">${goal.steps.map((s,i) => topicLink(s.topic,`${icon(['file-text','code','search','package'][i%4])}<strong>${esc(s.title)}</strong><small>${i+1} / ${goal.steps.length}</small>`,`#goal/${id}`,'goal','step')).join('')}</div><div class="hint-panel">${icon('help-circle')}可能没想到：${esc(topics.get(goal.steps[Math.min(1,goal.steps.length-1)].topic)?.why || '局部表现之外，还有整个流程的约束。')}</div><div class="section-heading"><h2>沿着这些问题理解</h2><span class="muted">可调整顺序，不要求全部完成</span></div><div class="topic-list">${goal.steps.map(s => topicRow(topics.get(s.topic),`#goal/${id}`,'goal')).join('')}</div><div class="context-links">${goal.areas.map(a => `<a href="#area/${a}">${icon('link')}${esc(areas.get(a)?.title)}</a>`).join('')}</div>`;
  }
  function workflow() {
    return `<div class="workflow">${[['file-text','理解需求'],['code','编码'],['search','复核'],['package','交付']].map(([i,t],n) => `<div class="step ${n===1?'active':''}">${icon(i)}<strong>${t}</strong></div>`).join('')}</div>`;
  }
  function sourceLinks(t) {
    return `<details class="sources"><summary>依据与延伸阅读 · ${t.sources.length} 个来源</summary><p class="muted">概念为编辑归纳；页面中的数字和情境另有“假设算例”标记。</p><ol class="source-list">${t.sources.map(id => { const s = sources.get(id); return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ${icon('external-link')}</a><small>${esc(s.org)} · 核对日期 ${esc(s.checked)}</small></li>`; }).join('')}</ol></details>`;
  }
  function efficiencyExperiment(t) {
    const config = state.experiments[t.id] || {share:10,review:0};
    return `${workflow()}<section class="experiment" aria-label="整体效率实验"><div class="section-heading"><h2>同一工作流程的耗时对照</h2><div class="chart-legend"><span class="coding-key">编码</span><span class="other-key">其他工作</span><span class="review-key">新增复核</span></div></div><div class="chart-wrap"><canvas id="efficiency-chart" class="efficiency-chart" role="img" aria-label="原来与使用 AI 后的总耗时对照"></canvas></div><p id="efficiency-result" class="metric-line" aria-live="polite"></p><label class="range-field" for="coding-share"><span>编码占原来总耗时的比例 <output id="coding-share-value">${config.share}%</output></span><input id="coding-share" type="range" min="5" max="95" step="5" value="${config.share}" data-experiment="share" data-topic="${t.id}"><small>5%<span>95%</span></small></label><details class="conditions"><summary>改变条件：增加复核时间</summary><label class="range-field" for="review-time"><span>额外新增复核 <output id="review-time-value">${config.review} 分钟</output></span><input id="review-time" type="range" min="0" max="60" step="5" value="${config.review}" data-experiment="review" data-topic="${t.id}"><small>0 分钟<span>60 分钟</span></small></label><p>新增复核在原有其他工作之外单独计算；质量变化仍未纳入。</p></details><p class="muted">假设算例：原来共100分钟；编码耗时减少80%；原有其他工作与质量不变。</p><p id="efficiency-detail" class="muted"></p></section>`;
  }
  function validityExperiment() {
    return `<section class="experiment"><h2>有出处，还要检查适用时间</h2><p class="muted">虚构资料：团队发布流程，不代表实际制度。</p><div class="document-pair"><article><span class="eyebrow">版本 A</span><h3>由维护者复核</h3><p>生效：2026-01-01</p><p>截止：2026-11-30</p></article><article><span class="eyebrow">版本 B</span><h3>由维护者和负责人复核</h3><p>发布：2026-10-20</p><p>生效：2026-12-01</p></article></div><label class="field">这次询问针对哪一天？<input type="date" id="validity-date" value="2026-11-04" min="2026-01-01" max="2027-12-31"></label><p id="validity-result" class="metric-line" aria-live="polite">2026-11-04 适用版本 A；版本 B 已发布，尚未生效。</p><p>问历史情况时，应按问题所指日期检查适用版本。</p></section>`;
  }
  function topicPage(t) {
    const r=reading(t.id),question=state.drafts[`question:${t.id}`] ?? state.questions[t.id]?.text ?? '';
    const sections=r?.sections || t.mechanism.map(x=>({title:x.title,body:x.text}));
    const visual=r?.visual || {kind:'flow',steps:t.mechanism};
    const interactive=t.id==='workflow-efficiency'?efficiencyExperiment(t):t.id==='source-validity'?validityExperiment():'';
    return `<div class="science-article-layout"><article class="science-article">${heading(`${areas.get(t.area).title} · 图文科普`,t.title)}<p class="article-lead">${esc(r?.lead || t.concept)}</p><section id="explanation-diagram" class="article-section"><h2>先看这张关系图</h2>${readingVisual(visual)}</section><section class="reading-example"><p class="eyebrow">用熟悉的事情理解</p><p>${esc(r?.analogy || t.example.text)}</p></section>${sections.map((x,i)=>`<section id="reading-section-${i}" class="article-section"><span class="section-number">${String(i+1).padStart(2,'0')}</span><h2>${esc(x.title)}</h2><p>${esc(x.body)}</p></section>`).join('')}${interactive?`<section id="reading-interactive" class="article-section"><p class="eyebrow">动一动，看看关系怎样变化</p>${interactive}</section>`:''}<div class="reading-takeaway"><h2>这篇文章想说明的关系</h2><p>${esc(r?.takeaway || t.concept)}</p></div><div class="boundary-note"><h3>适用范围与局限</h3><p>${esc(t.boundary)}</p></div>${sourceLinks(t)}<section class="reading-more"><h2>顺着这条线，继续读</h2><div class="topic-list">${t.relations.map(x=>topicRow(topics.get(x.id),`#topic/${t.id}`)).join('')}</div></section><details class="optional-notes"><summary>${icon('bookmark')}阅读后，可以留个问题或试一试</summary><p>这里是可选的阅读笔记，不影响继续浏览其他内容。</p><form id="question-form" data-topic="${t.id}"><label class="field" for="question-text">我还想了解<textarea id="question-text" name="question" rows="3" maxlength="1000" data-draft="question:${t.id}">${esc(question)}</textarea></label><button class="button secondary" type="submit">保存问题</button><p class="form-error" id="question-error" role="alert" hidden></p></form><div class="actions"><a class="quiet" href="#challenge/${t.id}">用一个小情境想一想 ${arrow()}</a>${state.records[t.id]?`<a class="quiet" href="#record/${t.id}">查看已有理解记录</a>`:''}</div></details></article><aside class="reading-toc"><p class="eyebrow">这篇讲什么</p><button data-action="scroll" data-target="explanation-diagram">关系图解</button>${sections.map((x,i)=>`<button data-action="scroll" data-target="reading-section-${i}">${esc(x.title)}</button>`).join('')}${interactive?'<button data-action="scroll" data-target="reading-interactive">互动图解</button>':''}<div class="rail-separator"></div><a href="#area/${t.area}">${icon('arrow-left')}返回${esc(areas.get(t.area).title)}</a><a href="#guide/0">从头读懂 AI ${arrow()}</a></aside></div>`;
  }
  function challengePage(t) {
    const numeric = t.id === 'workflow-efficiency';
    const answer = state.drafts[`answer:${t.id}`] || '';
    const explanation = state.drafts[`explanation:${t.id}`] || '';
    const choice = state.drafts[`choice:${t.id}`] || '';
    return `${heading('把理解放到新情境中','条件变了，你还能判断吗？',numeric ? '这次，复核在原有工作之外额外增加了20分钟。' : t.scenario.prompt)}<div class="state-steps"><span>发现问题</span>${icon('chevron-right')}<strong>换情境判断</strong>${icon('chevron-right')}<span>留下依据</span></div><div class="split-layout"><section>${numeric ? `<p class="notice">假设算例：原来100分钟，编码占90分钟；AI 将编码耗时减少80%；原有其他工作不变，另新增20分钟复核。</p><div class="task-equation"><h2>原来</h2><div><span>编码<strong>90 分钟</strong></span><b>+</b><span>其他<strong>10 分钟</strong></span><b>=</b><span><strong>100 分钟</strong></span></div></div><div class="task-equation"><h2>应用 AI 后</h2><div><span>编码<strong>原来的20%</strong></span><b>+</b><span>原有其他<strong>保持不变</strong></span><b>+</b><span class="new-review">新增复核<strong>20 分钟</strong></span></div><p class="muted">任务示意，不按耗时比例绘制。</p></div>` : `<div class="example-block"><span class="eyebrow">构造情境</span><h2>${esc(t.scenario.prompt)}</h2></div>`}<form class="challenge-form" id="challenge-form" data-topic="${t.id}">${numeric ? `<label class="field" for="challenge-answer">现在整个流程需要多久？<span class="input-unit"><input type="number" id="challenge-answer" name="answer" min="0" max="1000" step="0.1" inputmode="decimal" value="${esc(answer)}" data-draft="answer:${t.id}" required>分钟</span></label>` : `<fieldset class="choice-list"><legend>你会怎样判断？</legend>${t.scenario.choices.map(c => `<label><input type="radio" name="choice" value="${esc(c.id)}" ${choice===c.id?'checked':''} required data-draft="choice:${t.id}"><span>${esc(c.text)}</span></label>`).join('')}</fieldset>`}<label class="field" for="challenge-explanation">用自己的话说说依据和条件<textarea id="challenge-explanation" name="explanation" rows="4" minlength="12" maxlength="2000" data-draft="explanation:${t.id}" placeholder="我这样判断，是因为……如果……结论可能改变。" required>${esc(explanation)}</textarea></label><p class="muted">至少12个非空白字符。这里核对情境答案，解释作为你的原文保留，不自动认证你已掌握。</p><p class="form-error" id="challenge-error" role="alert" hidden></p><div class="actions"><button class="button primary" type="submit">保存判断与依据 ${arrow()}</button><button class="button secondary" type="button" data-action="uncertain" data-id="${t.id}">我还不确定</button></div></form></section><aside class="hint-panel"><h2>可以先保留疑问</h2><p>理解不需要一次完成。把哪里不确定写下来，下次从这里继续。</p><a class="button secondary" href="#topic/${t.id}">${icon('arrow-left')}返回知识点与实验</a><h3>这次判断能说明什么？</h3><p>${esc(t.scenario.boundary || t.boundary)}</p><p class="muted">保存后只更新“${esc(t.shortTitle)}”这个问题的记录。</p></aside></div>`;
  }
  function recordPage(t) {
    const r = state.records[t.id];
    if (!r) return `${heading('理解记录','还没有这条问题的依据记录','先浏览知识点、换个情境判断，再保存自己的解释。')}<a class="button primary" href="#topic/${t.id}">从这个知识点开始 ${arrow()}</a>`;
    return `${heading('理解记录','我现在能解释什么',t.shortTitle || t.title)}<section class="evidence-record"><div class="section-heading"><h2>${esc(t.shortTitle)}</h2>${status(t.id)}</div><div class="record-row"><h3>我的判断</h3><p>${esc(r.judgment)}</p></div><div class="record-row"><h3>判断依据</h3><div><p>${esc(r.evidence)}</p><p class="muted">本次解释：${esc(r.explanation)}</p></div></div><div class="record-row"><h3>适用边界</h3><p>${esc(r.boundary)}</p></div><div class="record-row"><h3>仍待验证</h3><p>${esc(r.openQuestion)}</p></div><div class="record-row"><h3>记录时间</h3><p>${esc(dateText(r.updatedAt))}<small>情境答案已核对；解释保留原文。${r.reviewNeeded ? '这条记录被标记为需要复核。' : ''}</small></p></div></section><div class="mini-map"><a href="#home">AI</a>${arrow()}<a href="#area/${t.area}">${esc(areas.get(t.area).title)}</a>${arrow()}<a href="#topic/${t.id}">${esc(t.shortTitle)} ${icon('file-text')}</a></div><p class="muted">只有这个具体问题新增了依据，其他问题不会自动改变状态。</p><details class="record-editor"><summary>${icon('edit-3')}修订我的理解与边界</summary><form id="record-edit-form" data-topic="${t.id}"><label class="field">我的判断<textarea name="judgment" rows="2" maxlength="2000" required data-draft="edit-judgment:${t.id}">${esc(state.drafts[`edit-judgment:${t.id}`] ?? r.judgment)}</textarea></label><label class="field">适用边界<textarea name="boundary" rows="2" maxlength="2000" required data-draft="edit-boundary:${t.id}">${esc(state.drafts[`edit-boundary:${t.id}`] ?? r.boundary)}</textarea></label><label class="field">仍待验证<textarea name="openQuestion" rows="2" maxlength="2000" required data-draft="edit-openQuestion:${t.id}">${esc(state.drafts[`edit-openQuestion:${t.id}`] ?? r.openQuestion)}</textarea></label><p id="record-edit-error" class="form-error" role="alert" hidden></p><button class="button primary" type="submit">保存修订</button></form></details><div class="record-actions actions"><button class="button secondary" data-action="review" data-id="${t.id}">${icon('refresh-cw')}${r.reviewNeeded?'取消待复核标记':'标记需要复核'}</button><a class="button secondary" href="#challenge/${t.id}">重新判断</a><button class="button secondary" data-action="export">${icon('download')}导出记录</button></div><div class="context-links">${t.relations.slice(0,2).map(x => topicLink(x.id,`${arrow()}接下来：${esc(x.label)}`)).join('')}</div><div class="actions">${state.goal ? `<a class="button secondary" href="#goal/${esc(state.goal.route || '')}">回到我的目标</a>`:''}<a class="button primary" href="#home">回到全景继续探索 ${arrow()}</a></div>`;
  }
  function collection(view) {
    const isRecords = view === 'records';
    const entries = Object.entries(isRecords ? state.records : state.questions).filter(([id])=>topics.has(id)).sort((a,b)=>String(b[1].updatedAt).localeCompare(String(a[1].updatedAt)));
    return `${heading(isRecords?'让理解有依据':'把盲区变成可以追问的问题',isRecords?'理解记录':'我的问题',isRecords?'每条记录都保留判断、依据和适用边界。':'保存疑问，也是一种认知进展。')}<div class="collection-tools"><span>${entries.length} 条${isRecords?'理解记录':'问题'}</span><button class="button secondary" data-action="export">${icon('download')}导出本地记录</button></div>${entries.length ? `<div class="record-list">${entries.map(([id,item])=>`<article class="record-summary"><div class="section-heading"><a href="#${isRecords?'record':'topic'}/${id}"><h2>${esc(topics.get(id).title)}</h2></a>${status(id)}</div><p>${esc(isRecords?item.judgment:item.text)}</p><small class="muted">${esc(dateText(item.updatedAt))}</small><div class="actions"><a class="quiet" href="#${isRecords?'record':'topic'}/${id}">${isRecords?'查看依据与边界':'带着问题继续探索'} ${arrow()}</a>${!isRecords?`<a class="quiet" href="#challenge/${id}">换情境判断</a>`:''}</div></article>`).join('')}</div>` : `<div class="empty-state">${icon(isRecords?'file-text':'bookmark')}<h2>${isRecords?'把一次解释，留成可以回看的依据':'还没有保存的问题'}</h2><p>${isRecords?'浏览不会自动生成记录。进入一个知识点，尝试情境判断并说明依据。':'在知识点旁写下新发现的疑问，保存后就能从这里接着探索。'}</p><a class="button primary" href="#home">从 AI 全景开始 ${arrow()}</a></div>`}<p class="muted">记录保存在当前浏览器、当前站点。可主动导出 JSON 副本；不会上传到服务器。</p>`;
  }
  function searchResults(q='') {
    const words=q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches=D.topics.filter(t=>{
      const r=reading(t.id);
      const text=[t.title,t.lead,t.concept,areas.get(t.area).title,r?.lead,r?.analogy,...(r?.sections||[]).flatMap(s=>[s.title,s.body]),...(t.tags||[])].join(' ').toLocaleLowerCase();
      return words.every(w=>text.includes(w));
    });
    return `<p class="muted" role="status">${q?`“${esc(q)}” · `:''}${matches.length} 篇相关科普</p>${matches.length?`<div class="topic-list">${matches.map(t=>topicRow(t,'#search')).join('')}</div>`:'<div class="empty-state"><h2>暂时没有直接匹配的专题</h2><p>可以试试“原理”“数据”“工作”等关键词，或从全景里找一个领域继续阅读。</p><a href="#home" class="button secondary">浏览 AI 全景</a></div>'}`;
  }
  function searchPage() {
    return `${heading('带着兴趣阅读','找一篇你想了解的科普','可以搜索概念，也可以直接浏览下面的全部专题。')}<form id="search-form" class="search-form"><label class="sr-only" for="topic-search">搜索 AI 主题</label><input id="topic-search" name="query" type="search" maxlength="100" placeholder="例如：大模型、数据、工作、成本" value="${esc(searchQuery)}" autocomplete="off"><button class="button primary" type="submit">搜索</button></form><div id="search-results" class="search-results">${searchResults(searchQuery)}</div>`;
  }
  function render() {
    observer?.disconnect();
    const r = route();
    if (r.view === 'journey') { window.JOURNEY.render(r); storageNotice(); return; }
    if (r.view === 'legacy') { location.replace('./society.html'+location.hash); return; }
    renderRail(r); renderCrumbs(r); storageNotice();
    main.className = `science-${r.view}`;
    const pages = {home,guide:()=>guidePage(r.id),questions:()=>collection('questions'),records:()=>collection('records'),search:searchPage,goal:()=>goalPage(r.id),area:()=>areaPage(r.area),topic:()=>topicPage(r.topic),challenge:()=>challengePage(r.topic),record:()=>recordPage(r.topic),missing:()=>`${heading('这个入口暂时不存在','回到地图，重新找到方向')}<a class="button primary" href="#home">返回 AI 全景</a>`};
    main.innerHTML = (pages[r.view] || pages.missing)();
    window.JOURNEY?.decorateLegacy(r,backHref());
    document.title = `${r.topic?.shortTitle || r.area?.title || ({questions:'我的问题',records:'理解记录',goal:'沿着想法探索',guide:G[r.id]?.title,search:'科普专题'}[r.view]) || 'AI 科普全景'} · 见全`;
    observer = new ResizeObserver(() => { drawMap(); updateEfficiency(); });
    const map = main.querySelector('.panorama'), chart = main.querySelector('#efficiency-chart');
    if (map) observer.observe(map);
    if (chart) observer.observe(chart.parentElement);
    drawMap(); updateEfficiency();
  }
  function canvasContext(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width*dpr); canvas.height = Math.round(rect.height*dpr);
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,rect.width,rect.height);
    return {ctx,width:rect.width,height:rect.height};
  }
  function drawMap() {
    const canvas = main.querySelector('.map-connectors');
    if (!canvas) return;
    const c = canvasContext(canvas); if (!c) return;
    const parent = canvas.getBoundingClientRect();
    const center = main.querySelector('.ai-center').getBoundingClientRect();
    const point = rect => ({x:rect.left-parent.left+rect.width/2,y:rect.top-parent.top+rect.height/2});
    const p = point(center), nodes = new Map();
    main.querySelectorAll('.area-node').forEach(n=>nodes.set(n.dataset.area,point(n.getBoundingClientRect())));
    const ctx = c.ctx; ctx.strokeStyle='#b6c4ad';ctx.lineWidth=1.4;
    for (const q of nodes.values()) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.quadraticCurveTo((p.x+q.x)/2,p.y,q.x,q.y);ctx.stroke(); }
    ctx.strokeStyle='#315643';ctx.lineWidth=1.7;
    for(const [from,to] of [['capability','system'],['system','evaluation'],['evaluation','society']]) {
      const a=nodes.get(from),b=nodes.get(to);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,a.y,b.x,b.y);ctx.stroke();
    }
  }
  function updateEfficiency() {
    const canvas = main.querySelector('#efficiency-chart'); if (!canvas) return;
    const share=Number(main.querySelector('#coding-share').value),review=Number(main.querySelector('#review-time').value);
    const values=C.calculateEfficiency(share,review);
    main.querySelector('#coding-share-value').textContent=`${share}%`;
    main.querySelector('#review-time-value').textContent=`${review} 分钟`;
    const fmt=n=>Number(n.toFixed(1));
    main.querySelector('#efficiency-result').textContent = values.saved>=0 ? `编码耗时减少80%，整体耗时减少${fmt(values.percent)}%` : `编码变快了，但整个流程增加了${fmt(-values.saved)}分钟`;
    main.querySelector('#efficiency-detail').textContent=`AI 辅助后：编码${fmt(values.codingAfter)} + 原有其他${fmt(values.other)} + 新增复核${fmt(values.review)} = ${fmt(values.total)}分钟。`;
    canvas.setAttribute('aria-label',`原来100分钟，AI辅助后${fmt(values.total)}分钟，其中编码${fmt(values.codingAfter)}分钟，原有其他工作${fmt(values.other)}分钟，新增复核${fmt(review)}分钟。`);
    const c=canvasContext(canvas);if(!c)return;
    const {ctx,width,height}=c,left=76,right=72,top=20,bottom=height-44,plot=Math.max(50,width-left-right),domain=Math.ceil(Math.max(100,values.total)/20)*20;
    const x=n=>left+n/domain*plot;
    ctx.font='12px "Microsoft YaHei", sans-serif';ctx.fillStyle='#66745f';ctx.textAlign='center';
    const tickStep=width<480 ? domain/2 : domain/5;
    for(let n=0;n<=domain+.01;n+=tickStep) {const pos=x(n);ctx.strokeStyle='#e3e3d8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pos,top);ctx.lineTo(pos,bottom);ctx.stroke();ctx.fillText(String(fmt(n)),pos,bottom+19);}
    ctx.fillText('耗时（分钟）',left+plot/2,height-3);
    const rows=[{label:'原来',y:top+22,parts:[share,100-share,0],total:100},{label:'AI 辅助后',y:top+84,parts:[values.codingAfter,values.other,review],total:values.total}];
    const colors=['#46734d','#dcded4','#d7b16a'];
    for(const row of rows){ctx.textAlign='right';ctx.fillStyle='#263d33';ctx.fillText(row.label,left-12,row.y+20);let acc=0;row.parts.forEach((v,i)=>{ctx.fillStyle=colors[i];ctx.fillRect(x(acc),row.y,v/domain*plot,32);if(v/domain*plot>42){ctx.fillStyle=i===0?'#ffffff':'#263d33';ctx.textAlign='center';ctx.fillText(String(fmt(v)),x(acc+v/2),row.y+21);}acc+=v;});ctx.fillStyle='#263d33';ctx.textAlign='left';ctx.fillText(`${fmt(row.total)} 分钟`,x(row.total)+8,row.y+21);}
  }
  function saveQuestion(id,text) {
    state.questions[id]={text:text.trim().slice(0,1000),updatedAt:now()};
    state.drafts[`question:${id}`]=text.trim().slice(0,1000);return persist();
  }
  function showError(id,message) {const el=main.querySelector('#'+id);el.textContent=message;el.hidden=false;el.scrollIntoView({block:'nearest'});}
  function setGoal(id, keepText = true) {
    const g=D.goals.find(x=>x.id===id);if(!g)return;
    state.goal={text:keepText && state.goal?.text || g.title,route:id};
    state.entry={mode:'goal',returnHash:`#goal/${id}`};persist();navigate(`#goal/${id}`);
  }
  document.addEventListener('click',event=>{
    const entry=event.target.closest('a[data-entry]');
    if(entry){state.entry={mode:entry.dataset.entry,returnHash:entry.dataset.return};persist();}
    const explore=event.target.closest('[data-explore]');if(explore){state.entry={mode:'explore',returnHash:'#area/society'};persist();}
    const b=event.target.closest('button[data-action]');if(!b)return;
    const id=b.dataset.id;
    if(b.dataset.action==='scroll'){document.getElementById(b.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    if(b.dataset.action==='select-goal')setGoal(id,route().view==='goal');
    if(b.dataset.action==='change-goal'){state.drafts.goal=state.goal?.text||'';persist();navigate('#home');setTimeout(()=>document.getElementById('goal-input')?.focus(),0);}
    if(b.dataset.action==='uncertain'){
      const t=topics.get(id);
      if(state.records[id]){state.records[id].reviewNeeded=true;state.records[id].updatedAt=now();}
      saveQuestion(id,state.drafts[`question:${id}`]?.trim() || state.questions[id]?.text || `我还不确定：${t.scenario.prompt}`);toast(storageOK?'已保留疑问，可以稍后继续。':'疑问暂存在本次页面，请导出副本。');navigate('#questions');
    }
    if(b.dataset.action==='review' && state.records[id]) {state.records[id].reviewNeeded=!state.records[id].reviewNeeded;state.records[id].updatedAt=now();persist();render();toast('已更新复核标记，原有依据仍然保留。');}
    if(b.dataset.action==='export'){
      const blob=new Blob([JSON.stringify({app:'见全 AI 认知地图',exportedAt:now(),...state},null,2)],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`见全-AI记录-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出本地记录副本。');
    }
  });
  main.addEventListener('input',event=>{
    const el=event.target;
    if(el.dataset.draft && (el.type!=='radio' || el.checked)) {state.drafts[el.dataset.draft]=el.value;persist();}
    if(el.dataset.experiment){const id=el.dataset.topic;state.experiments[id] ||= {share:10,review:0};state.experiments[id][el.dataset.experiment]=Number(el.value);persist();updateEfficiency();}
    if(el.id==='validity-date'){
      const val=el.value;
      main.querySelector('#validity-result').textContent=!val?'请选择问题针对的日期。':val<'2026-01-01'?'示例材料没有覆盖该日期，需要补充历史版本。':val<'2026-12-01'?`${val} 适用版本 A；${val>='2026-10-20'?'版本 B 已发布，尚未生效。':'版本 B 当时尚未发布。'}`:`${val} 适用版本 B；版本 A 已结束适用。`;
    }
  });
  main.addEventListener('submit',event=>{
    const form=event.target;if(!(form instanceof HTMLFormElement))return;event.preventDefault();
    const fd=new FormData(form),id=form.dataset.topic,t=topics.get(id);
    if(form.id==='reader-search'){searchQuery=String(fd.get('query')||'').trim().slice(0,100);navigate('#search');}
    if(form.id==='goal-form'){
      const text=String(fd.get('goal')||'').trim().slice(0,300);if(!text)return;
      const picked=C.pickGoal(text,D.goals);state.goal={text,route:picked||''};persist();if(picked)setGoal(picked);else navigate('#goal');
    }
    if(form.id==='question-form'){
      const text=String(fd.get('question')||'').trim();if(!text){showError('question-error','先写下一句你想继续追问的问题。');return;}
      saveQuestion(id,text);render();toast(storageOK?'问题已保存，在“我的问题”里可以继续。':'已暂存到本次页面，请导出副本。');
    }
    if(form.id==='challenge-form'){
      const explanation=String(fd.get('explanation')||'').trim();
      let correct=false,answer=null,judgment='',evidence='';
      if(id==='workflow-efficiency'){
        const result=C.evaluateChallenge({answer:fd.get('answer'),explanation});
        if(!result.valid || !result.correct){showError('challenge-error',result.message);return;}
        correct=true;answer=Number(fd.get('answer'));judgment='总耗时48分钟。局部提速还需要计入整个流程与新增成本。';evidence='假设算例：编码90×20%=18分钟，加原有其他10分钟，再加新增复核20分钟，合计48分钟。';
      } else {
        if(explanation.replace(/\s/g,'').length<12){showError('challenge-error','请再说具体一点：判断依据是什么，什么条件下可能不成立？');return;}
        const selected=t.scenario.choices.find(x=>x.id===fd.get('choice'));
        correct=selected?.id===t.scenario.correct;
        if(!correct){showError('challenge-error',`再看看这个条件：${t.scenario.explanation} 你也可以选择“我还不确定”。`);return;}
        judgment=selected.text;evidence=`构造情境：${t.scenario.prompt} 判断依据：${t.scenario.explanation}`;
      }
      if(correct){const stamp=now();state.records[id]={id,topic:id,title:t.title,judgment,evidence,boundary:id==='workflow-efficiency'?'本例只比较耗时，不等同于真实项目收益。':t.scenario.boundary || t.boundary,openQuestion:id==='workflow-efficiency'?'质量、返工与真实流程数据仍待验证。':t.boundary,answer,explanation,checkedAt:stamp,updatedAt:stamp,reviewNeeded:false,sourceType:'constructed-scenario'};persist();navigate(`#record/${id}`);toast(storageOK?'判断与依据已保存；这是一条有边界的理解记录。':'记录暂存在本次页面，请导出副本。');}
    }
    if(form.id==='record-edit-form' && state.records[id]){
      const edits=Object.fromEntries(['judgment','boundary','openQuestion'].map(name=>[name,String(fd.get(name)||'').trim().slice(0,2000)]));
      if(Object.values(edits).some(value=>!value)){showError('record-edit-error','请填写判断、适用边界和仍待验证的内容，空白内容不会覆盖已有记录。');return;}
      Object.assign(state.records[id],edits);
      for(const name of Object.keys(edits))delete state.drafts[`edit-${name}:${id}`];
      state.records[id].updatedAt=now();persist();render();toast(storageOK?'修订已保存，原始情境依据仍保留。':'修订暂存在本次页面，请导出副本。');
    }
    if(form.id==='search-form'){
      searchQuery=String(fd.get('query')||'').trim().slice(0,100);
      main.querySelector('#search-results').innerHTML=searchResults(searchQuery);
    }
  });
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start'});});
  window.addEventListener('hashchange',event=>{
    render();
    const oldHash=event.oldURL?.split('#')[1] || '', newHash=location.hash.slice(1);
    const directionChanged=oldHash.split('?')[0]===newHash.split('?')[0] && newHash.startsWith('domain/') && new URLSearchParams(oldHash.split('?')[1] || '').get('direction')!==new URLSearchParams(newHash.split('?')[1] || '').get('direction');
    const mapChanged=oldHash.split('?')[0]===newHash.split('?')[0] && (newHash.startsWith('map/llm') || newHash.startsWith('map/agent') || newHash.startsWith('map/rag') || newHash.startsWith('map/context'));
    const panel=mapChanged?document.getElementById(newHash.startsWith('map/context')?'context-detail':newHash.startsWith('map/rag')?'rag-detail':newHash.startsWith('map/agent')?'agent-detail':'llm-detail'):directionChanged?document.getElementById('cog-direction'):null;
    if(panel){panel.focus({preventScroll:true});if(window.matchMedia('(max-width: 1000px)').matches || panel.getBoundingClientRect().top>window.innerHeight*.75 || panel.getBoundingClientRect().bottom<0)panel.scrollIntoView({block:'start',behavior:'instant'});}
    else {main.focus({preventScroll:true});window.scrollTo({top:0,left:0,behavior:'instant'});}
  });
  window.addEventListener('storage',event=>{if(event.key===key){try{state=C.normalizeState(JSON.parse(event.newValue||'null'),[...topics.keys()]);render();}catch(_){toast('另一窗口的记录暂时无法读取。');}}});
  render();
})();
