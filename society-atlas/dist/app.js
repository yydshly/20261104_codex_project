(() => {
  'use strict';
  const data = window.ATLAS_DATA;
  const main = document.getElementById('main-content');
  if (!data || !Array.isArray(data.systems) || !data.systems.length) {
    main.innerHTML = '<div class="empty-state"><h1>地图内容暂时没有加载成功</h1><p>请刷新页面；如果仍未恢复，请确认 data.js 与页面一起部署。</p></div>';
    return;
  }
  const systems = data.systems;
  const sourceMap = new Map(data.sources.map(source => [source.id, source]));
  const positions = [[15,20],[50,12],[85,20],[15,57],[85,57],[33,86],[67,86]];
  const colors = ['#658365','#b38a53','#647e9b','#8c7fa5','#b17b74','#9a8b55','#588f8c'];
  const allTopics = systems.flatMap(system => system.topics.map(topic => ({system,topic})));
  const storageKey = 'society-atlas.v1';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const getSystem = id => systems.find(system => system.id === id);
  const getTopic = (system, id) => system && (system.topics.find(topic => topic.id === id) || system.topics[0]);
  const topicKey = (system,topic) => `${system.id}/${topic.id}`;
  const topicHref = (system,topic) => `#system/${system.id}/${topic.id}`;
  const topicByKey = key => allTopics.find(({system,topic}) => topicKey(system,topic) === key);
  const systemColor = system => colors[systems.indexOf(system) % colors.length];
  const indexLabel = index => String(index + 1).padStart(2,'0');
  let storageAvailable = true;
  let toastTimer;
  let state = {ai:false,visited:[],notes:{},guide:null};
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      state.ai = false;
      state.visited = [];
      state.notes = {};
      if (!saved || typeof saved !== 'object') return;
      state.ai = saved.ai === true;
      state.visited = Array.isArray(saved.visited) ? [...new Set(saved.visited.filter(key => typeof key === 'string' && topicByKey(key)))].slice(-100) : [];
      if (saved.notes && typeof saved.notes === 'object') {
        Object.entries(saved.notes).filter(([key,value]) => topicByKey(key) && typeof value === 'string').forEach(([key,value]) => state.notes[key] = value.slice(0,1000));
      }
    } catch (_) { storageAvailable = false; }
  }
  function storeState() {
    try { localStorage.setItem(storageKey,JSON.stringify({ai:state.ai,visited:state.visited,notes:state.notes})); return true; }
    catch (_) { storageAvailable = false; return false; }
  }
  function toast(message) {
    const element = document.getElementById('atlas-toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; },3200);
  }
  function route() {
    let parts;
    try { parts = decodeURIComponent(location.hash.slice(1)).split('/'); }
    catch (_) { return {view:'missing'}; }
    if (!parts[0] || parts[0] === 'overview') return {view:'overview'};
    if (parts[0] === 'history') return {view:'history'};
    if (parts[0] === 'explorations') return {view:'explorations'};
    if (parts[0] === 'system') {
      const system = getSystem(parts[1]);
      if (system && (!parts[2] || system.topics.some(topic => topic.id === parts[2]))) return {view:'system',system,topic:getTopic(system,parts[2])};
    }
    return {view:'missing'};
  }
  function sourceLinks(ids = []) {
    const sources = [...new Set(ids)].map(id => sourceMap.get(id)).filter(Boolean);
    if (!sources.length) return '';
    return `<details class="source-details"><summary>来源与延伸阅读 <span>${sources.length}</span></summary><ol class="source-list">${sources.map(source => `<li><a class="source-link" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} <span aria-hidden="true">↗</span></a><span class="source-org">${esc(source.org)} · 核对于 ${esc(source.checked || '2026-11-04')}</span></li>`).join('')}</ol><p class="editorial-note">正文为帮助理解而作的概括；生活案例为示意。具体制度与结果会随地区、时期和条件而不同。</p></details>`;
  }
  function heading(eyebrow,title,description,action = '') {
    return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1 class="page-title">${title}</h1><p class="page-description">${description}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ''}</div>`;
  }
  function pathCard(path,index) {
    return `<button class="path-card" type="button" data-action="start-guide" data-path="${esc(path.id)}"><span class="path-order">探索路径 ${indexLabel(index)}</span><span class="path-title">${esc(path.title)}</span><span class="path-description">${esc(path.description)}</span><span class="path-action">${path.steps.length} 个连接 · 开始走一遍 <span aria-hidden="true">↗</span></span></button>`;
  }
  function mapMarkup() {
    const uniquePairs = new Map();
    systems.forEach((system,index) => (system.relations || []).forEach(relation => {
      const targetIndex = systems.findIndex(item => item.id === relation.target);
      if (targetIndex < 0 || targetIndex === index) return;
      const key = [index,targetIndex].sort((a,b)=>a-b).join('-');
      if (!uniquePairs.has(key)) uniquePairs.set(key,{from:index,to:targetIndex,label:relation.label});
    }));
    const lines = [...uniquePairs.values()].map(({from,to,label}) => {
      const start = positions[from], end = positions[to];
      return `<line x1="${start[0]}" y1="${start[1]}" x2="${end[0]}" y2="${end[1]}" data-from="${systems[from].id}" data-to="${systems[to].id}"><title>${esc(systems[from].title)} ↔ ${esc(systems[to].title)}：${esc(label)}</title></line>`;
    }).join('');
    return `<div class="map-panel"><div class="map-topline"><span class="aside-label">社会运行全景</span><span class="map-hint">点击一个系统，向下展开 <span aria-hidden="true">↘</span></span></div><div class="network-map" aria-label="七个相互关联的社会系统"><svg class="network-lines" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="系统之间的关联，线条不表示单向因果">${lines}</svg><div class="map-center" aria-hidden="true"><span>共同生活</span><small>相互依赖的系统</small></div>${systems.map((system,index) => `<a class="map-node" href="#system/${system.id}" data-system="${system.id}" style="left:${positions[index][0]}%;top:${positions[index][1]}%;--system-color:${colors[index]}"><span class="map-node-number">${indexLabel(index)} <span class="system-dot"></span></span><span class="map-node-title">${esc(system.title)}</span><span class="map-node-summary">${esc(system.kicker)}</span>${state.ai ? '<span class="map-node-meta">✳ 任务与组织的变化</span>' : ''}</a>`).join('')}</div><div class="map-legend"><span class="legend-dot"></span> 连线表示关联；分类是一种观察框架，并非唯一答案。</div></div>`;
  }
  function overviewAside(system) {
    if (system) {
      return `<div class="aside-label">${esc(system.kicker)}</div><h2 class="aside-title">${esc(system.title)}</h2><p class="aside-copy">${esc(system.summary)}</p><div class="flow-list">${(system.relations || []).map(relation => `<a class="flow-item" href="#system/${esc(relation.target)}"><span class="flow-label">${esc(relation.label)}</span><span class="flow-value">↔ ${esc(getSystem(relation.target)?.title || relation.target)}</span></a>`).join('')}</div><a class="button button-primary" href="#system/${system.id}">展开这个系统 <span aria-hidden="true">→</span></a><p class="editorial-note">${esc(system.question)}</p>`;
    }
    if (state.ai) {
      return '<div class="aside-label">AI 变化视角</div><h2 class="aside-title">把技术放回社会中理解。</h2><p class="aside-copy">进入任一主题，观察 AI 可能改变哪些任务、协调方式与资源分配。</p><div class="flow-list"><div class="flow-item"><span class="flow-label">任务</span><span class="flow-value">谁做什么，怎样完成</span></div><div class="flow-item"><span class="flow-label">组织</span><span class="flow-value">人们怎样协作与负责</span></div><div class="flow-item"><span class="flow-label">分配</span><span class="flow-value">谁获益，谁承担成本</span></div></div><p class="editorial-note">技术上的可能性，不等于已经发生的社会结果。每个主题都保留限制与追问。</p>';
    }
    return '<div class="aside-label">读懂这张地图</div><h2 class="aside-title">七个入口，<br>同一张生活的网。</h2><p class="aside-copy">一份工作、一套住房、一日三餐，都同时连接着多个社会系统。</p><div class="flow-list"><div class="flow-item"><span class="flow-label">先看整体</span><span class="flow-value">社会要解决什么问题</span></div><div class="flow-item"><span class="flow-label">再看结构</span><span class="flow-value">谁参与，如何相互依赖</span></div><div class="flow-item"><span class="flow-label">深入机制</span><span class="flow-value">为什么会这样运转</span></div><div class="flow-item"><span class="flow-label">回到生活</span><span class="flow-value">这与我有什么关系</span></div></div><p class="editorial-note">移动到一个入口，先看看它与其他系统的联系。</p>';
  }
  function renderOverview() {
    const firstPath = data.paths[0];
    return `${heading('从整体开始 / THE BIG PICTURE','社会是如何一起运转的？','沿着七个相互依赖的系统，走进机制，再回到自己的生活。',firstPath ? `<button class="button button-primary" type="button" data-action="start-guide" data-path="${esc(firstPath.id)}">带我走一遍 <span aria-hidden="true">→</span></button>` : '')}<div class="overview-layout">${mapMarkup()}<aside class="overview-aside" id="overview-aside" aria-label="地图阅读提示">${overviewAside()}</aside></div><div class="section-heading"><div><p class="eyebrow">把全景连到身边</p><h2>从一个生活问题，走过多个系统</h2></div><span class="read-status">选择一条路径，逐层理解</span></div><div class="path-grid">${data.paths.map(pathCard).join('')}</div>`;
  }
  function guideMarkup(current) {
    if (!state.guide) return '';
    const path = data.paths.find(item => item.id === state.guide.id);
    if (!path) return '';
    const found = path.steps.findIndex(step => step.system === current.system.id && step.topic === current.topic.id);
    if (found < 0) return '';
    const index = found;
    const next = path.steps[index + 1];
    return `<section class="guide-bar" aria-label="探索路径"><div class="guide-topline"><span class="aside-label">正在走过一条路径 · ${index+1}/${path.steps.length}</span><button class="button-quiet" type="button" data-action="exit-guide">退出导览</button></div><h2 class="guide-title">${esc(path.title)}</h2><div class="guide-steps">${path.steps.map((step,stepIndex) => { const system=getSystem(step.system),topic=getTopic(system,step.topic); return `<button type="button" class="guide-step${stepIndex===index?' active':''}" data-action="guide-step" data-index="${stepIndex}" aria-pressed="${stepIndex===index}">${stepIndex+1}. ${esc(topic.title)}</button>`; }).join('')}</div><div class="guide-actions">${next ? `<button class="button button-primary" type="button" data-action="guide-step" data-index="${index+1}">下一个连接：${esc(getTopic(getSystem(next.system),next.topic).title)} <span aria-hidden="true">→</span></button>` : '<button class="button button-primary" type="button" data-action="finish-guide">走完这条路径，回到全景 <span aria-hidden="true">↗</span></button>'}</div></section>`;
  }
  function aiMarkup(topic) {
    if (!state.ai || !topic.ai) return '';
    const ai = topic.ai;
    return `<section class="ai-panel"><div class="ai-label">✳ AI 变化视角 · 条件分析</div><h2>哪些环节可能发生变化？</h2><p>${esc(ai.observation)}</p><p class="ai-note">${esc(ai.caution)}</p>${ai.questions?.length ? `<ul class="question-list">${ai.questions.map(question=>`<li>${esc(question)}</li>`).join('')}</ul>` : ''}${sourceLinks(ai.sourceIds)}</section>`;
  }
  function renderSystem(current) {
    const {system,topic} = current;
    const key = topicKey(system,topic);
    const sourceIds = [...(topic.sourceIds || [])];
    return `${guideMarkup(current)}<div class="system-header" style="--system-color:${systemColor(system)}"><p class="system-kicker"><span class="system-dot"></span> ${indexLabel(systems.indexOf(system))} / ${esc(system.kicker)}</p><h1 class="page-title">${esc(system.title)}</h1><p class="page-description">${esc(system.summary)}</p></div><nav class="topic-tabs" aria-label="${esc(system.title)}中的机制">${system.topics.map(item=>`<a class="topic-tab${item.id===topic.id?' active':''}" href="${topicHref(system,item)}"${item.id===topic.id?' aria-current="page"':''}>${esc(item.title)}</a>`).join('')}</nav><div class="article-layout"><article class="article-body"><section class="article-section"><p class="eyebrow">一个需要理解的机制</p><h2>${esc(topic.title)}</h2><p class="page-description">${esc(topic.summary)}</p><p>${esc(topic.why)}</p><h3>谁参与其中</h3><div class="actor-list">${topic.actors.map(actor=>`<span class="actor-chip">${esc(actor)}</span>`).join('')}</div></section><section class="article-section"><p class="eyebrow">从结构走到过程</p><h2>它是怎样运转的？</h2><div class="mechanism-list">${topic.mechanism.map((step,index)=>`<div class="mechanism-item"><span class="mechanism-number">${indexLabel(index)}</span><div class="mechanism-body"><h3>${esc(step.title)}</h3><p>${esc(step.description)}</p></div></div>`).join('')}</div></section><section class="article-section"><p class="eyebrow">把机制放回生活</p><div class="example-panel"><span class="aside-label">生活示意 · ${esc(topic.example.title)}</span><p>${esc(topic.example.description)}</p>${topic.example.steps?.length ? `<ol class="example-steps">${topic.example.steps.map(step=>`<li class="example-step">${esc(step)}</li>`).join('')}</ol>` : ''}</div></section>${aiMarkup(topic)}<section class="reflection-panel"><label class="reflection-label" for="reflection-note">这改变了你的哪个理解？</label><p class="aside-copy">可以留下自己的解释，也可以记录一个还没想清楚的问题。</p><textarea class="reflection-input" id="reflection-note" maxlength="1000" placeholder="我原来以为……现在看到它还连着……我还想知道……">${esc(state.notes[key] || '')}</textarea><div class="reflection-actions"><button class="button button-primary" type="button" data-action="save-reflection" data-key="${esc(key)}">${state.notes[key]?'更新我的理解':'留下我的理解'}</button><span class="save-status" id="save-status">${storageAvailable ? '仅保存在当前浏览器；不会被当作已掌握。' : '当前浏览器不能持久保存，记录暂存于本次页面。'}</span></div></section>${sourceLinks(sourceIds)}</article><aside class="article-aside"><div class="aside-label">别丢掉整体</div><h2 class="aside-title">它还连接着……</h2><div class="connection-list">${topic.connections.map(connection=>{ const targetSystem=getSystem(connection.system),targetTopic=getTopic(targetSystem,connection.topic); return targetSystem && targetTopic ? `<a class="connection-card" href="${topicHref(targetSystem,targetTopic)}"><span class="connection-system">${esc(targetSystem.title)}</span><span class="connection-title">${esc(targetTopic.title)} <span aria-hidden="true">↗</span></span><span class="aside-copy">${esc(connection.label)}</span></a>` : ''; }).join('')}</div><p class="editorial-note">同一件事可以从不同系统解释。关联并不等于唯一原因。</p><a class="button button-quiet" href="#overview">← 回到社会全景</a>${!state.ai ? '<button class="button button-quiet" type="button" data-action="enable-ai">✳ 加上 AI 变化视角</button>' : ''}</aside></div>`;
  }
  function renderHistory() {
    return `${heading('理解变化 / HISTORICAL LENSES','社会的组织方式，如何发生变化？','这里呈现几种观察社会的视角。它们并非所有地区必经的阶梯，也常在同一社会中共存。')}<div class="history-timeline">${data.history.map((era,index)=>`<section class="history-card"><div class="history-period"><span class="section-number">${indexLabel(index)}</span><span>${esc(era.period)}</span></div><div><h2>${esc(era.title)}</h2><p class="page-description">${esc(era.summary)}</p><div class="history-details"><div class="history-fact"><h3>怎样组织生活</h3><p>${esc(era.organization)}</p></div><div class="history-fact"><h3>知识怎样流动</h3><p>${esc(era.knowledge)}</p></div><div class="history-fact"><h3>需要继续追问</h3><p>${esc(era.tension)}</p></div></div>${sourceLinks(era.sourceIds)}</div></section>`).join('')}</div><section class="editorial-note">历史视角帮助理解结构变化，不为不同社会排列高低。制度、文化、资源与技术共同影响具体路径。</section><div class="heading-actions"><a class="button button-primary" href="#overview">带着历史视角，回看社会全景 <span aria-hidden="true">→</span></a></div>`;
  }
  function renderExplorations() {
    const notes = Object.entries(state.notes).filter(([,note])=>note.trim());
    const visited = state.visited.map(key=>topicByKey(key)).filter(Boolean).reverse();
    return `${heading('让理解留下痕迹 / YOUR EXPLORATION','你走过的连接。','这里记录你打开过的主题，以及你主动留下的理解。浏览记录不代表已经掌握。')}<div class="section-heading"><h2>我留下的理解</h2><span class="read-status">保存在当前浏览器</span></div>${notes.length ? `<div class="bookmark-grid">${notes.map(([key,note])=>{ const found=topicByKey(key); return `<article class="bookmark-card"><p class="eyebrow">${esc(found.system.title)}</p><h3><a href="${topicHref(found.system,found.topic)}">${esc(found.topic.title)} <span aria-hidden="true">↗</span></a></h3><p class="bookmark-note">${esc(note)}</p><button class="button-quiet" type="button" data-action="remove-note" data-key="${esc(key)}">移除这条笔记</button></article>`; }).join('')}</div>` : '<div class="empty-state"><h3>还没有留下自己的理解</h3><p>从一个系统深入，在主题末尾写下你的解释或疑问。</p><a class="button button-primary" href="#overview">去社会全景看看 <span aria-hidden="true">→</span></a></div>'}<div class="section-heading"><h2>最近打开过的主题</h2><span class="read-status">只记录探索足迹</span></div><div class="connection-list">${visited.length ? visited.map(({system,topic})=>`<a class="connection-card" href="${topicHref(system,topic)}"><span class="connection-system">${esc(system.title)}</span><span class="connection-title">${esc(topic.title)} <span aria-hidden="true">↗</span></span></a>`).join('') : '<p class="aside-copy">从社会全景打开一个主题，这里就会留下足迹。</p>'}</div>${!storageAvailable ? '<p class="editorial-note">浏览器存储当前不可用；这些记录只在本次页面停留期间有效。</p>' : ''}`;
  }
  function renderChrome(current) {
    document.body.dataset.ai = String(state.ai);
    const aiButton=document.getElementById('ai-toggle');
    aiButton.setAttribute('aria-pressed',String(state.ai));
    document.getElementById('system-nav').innerHTML = systems.map((system,index)=>`<a class="system-link${current.system?.id===system.id?' active':''}" href="#system/${system.id}" style="--system-color:${colors[index]}"${current.system?.id===system.id?' aria-current="page"':''}><span class="system-index">${indexLabel(index)}</span><span class="system-dot"></span><span>${esc(system.title)}</span></a>`).join('');
    document.querySelectorAll('.view-tab').forEach(tab=>{
      const active=current.view==='system' ? tab.hash==='#overview' : tab.hash===`#${current.view}`;
      tab.classList.toggle('active',active);
      if (active) tab.setAttribute('aria-current','page'); else tab.removeAttribute('aria-current');
    });
    document.getElementById('breadcrumbs').innerHTML = current.view==='system' ? `<a href="#overview">社会全景</a><span aria-hidden="true">/</span><a href="#system/${current.system.id}">${esc(current.system.title)}</a><span aria-hidden="true">/</span><span>${esc(current.topic.title)}</span>` : `<span>${({overview:'社会全景',history:'历史视角',explorations:'我的探索'})[current.view] || '页面未找到'}</span>`;
  }
  function render() {
    const current=route();
    if (current.view==='system') {
      const key=topicKey(current.system,current.topic);
      state.visited=state.visited.filter(item=>item!==key).concat(key).slice(-100);
      storeState();
      document.title=`${current.topic.title} · ${current.system.title} · 见全`;
    } else document.title='见全 · 从整体理解社会';
    renderChrome(current);
    main.innerHTML = current.view==='overview' ? renderOverview() : current.view==='system' ? renderSystem(current) : current.view==='history' ? renderHistory() : current.view==='explorations' ? renderExplorations() : `${heading('当前位置暂时不存在','这条路径还没有展开。','可以回到社会全景，重新选择一个系统。')}<a class="button button-primary" href="#overview">返回全景</a>`;
  }
  function goToStep(index) {
    const path=data.paths.find(item=>item.id===state.guide?.id);
    if (!path || !path.steps[index]) return;
    state.guide.index=index;
    const step=path.steps[index];
    const hash=`#system/${step.system}/${step.topic}`;
    if (location.hash===hash) render(); else location.hash=hash;
  }
  function toggleAI(enable) {
    const note=main.querySelector('#reflection-note');
    const draft=note?.value;
    state.ai=enable; storeState(); render();
    const newNote=main.querySelector('#reflection-note');
    if (newNote && draft !== undefined) newNote.value=draft;
    toast(enable ? '已加入 AI 变化视角；条件与限制会一起呈现。' : '已回到基础结构视角。');
  }
  document.getElementById('ai-toggle').addEventListener('click',()=>toggleAI(!state.ai));
  document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start'});});
  main.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');
    if (!button) return;
    const action=button.dataset.action;
    if (action==='start-guide') { state.guide={id:button.dataset.path,index:0}; goToStep(0); }
    if (action==='guide-step') goToStep(Number(button.dataset.index));
    if (action==='exit-guide') { state.guide=null; render(); }
    if (action==='finish-guide') { state.guide=null; location.hash='#overview'; toast('走完了一条连接。可以换一个入口，继续观察。'); }
    if (action==='enable-ai') toggleAI(true);
    if (action==='save-reflection') {
      const note=document.getElementById('reflection-note').value.trim();
      if (!note) { toast('先写下一点自己的理解或疑问。'); document.getElementById('reflection-note').focus(); return; }
      state.notes[button.dataset.key]=note.slice(0,1000);
      const saved=storeState();
      button.textContent='更新我的理解';
      document.getElementById('save-status').textContent=saved ? '已保存到当前浏览器。' : '浏览器未允许持久保存，已暂存于本次页面。';
      toast(saved ? '已留下你的理解。' : '已在本次页面暂存；关闭页面后可能无法保留。');
    }
    if (action==='remove-note') {
      const key=button.dataset.key,previous=state.notes[key];
      delete state.notes[key]; storeState(); render();
      const notification=document.getElementById('atlas-toast');
      toast('已移除这条笔记。');
      const undo=document.createElement('button'); undo.className='button-quiet'; undo.type='button'; undo.textContent='撤销';
      undo.addEventListener('click',()=>{state.notes[key]=previous;storeState();render();toast('已恢复笔记。');},{once:true});
      notification.append(' ',undo);
    }
  });
  function mapFocus(event) {
    const node=event.target.closest('.map-node');
    const aside=document.getElementById('overview-aside');
    if (!node || !aside) return;
    aside.innerHTML=overviewAside(getSystem(node.dataset.system));
    main.querySelectorAll('.network-lines line').forEach(line=>line.classList.toggle('is-highlighted',line.dataset.from===node.dataset.system || line.dataset.to===node.dataset.system));
  }
  main.addEventListener('pointerover',mapFocus);
  main.addEventListener('focusin',mapFocus);
  const search=document.getElementById('atlas-search');
  const results=document.getElementById('search-results');
  function closeSearch() { results.hidden=true;search.setAttribute('aria-expanded','false'); }
  function searchTopics(query) {
    const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return allTopics.filter(({system,topic})=>terms.every(term=>`${system.title} ${topic.title} ${topic.summary} ${topic.actors.join(' ')} ${topic.example.title} ${topic.example.description}`.toLowerCase().includes(term))).slice(0,7);
  }
  search.addEventListener('input',()=>{
    const query=search.value.trim();
    if (!query) { closeSearch();return; }
    const found=searchTopics(query);
    results.innerHTML=found.length ? found.map(({system,topic})=>`<a class="search-result" href="${topicHref(system,topic)}"><span class="search-result-meta">${esc(system.title)}</span><span>${esc(topic.title)} <span aria-hidden="true">↗</span></span></a>`).join('') : '<div class="search-result"><span>这版地图还没有匹配内容</span><span class="search-result-meta">试试“劳动”“教育”“家庭”等词。</span></div>';
    results.hidden=false;search.setAttribute('aria-expanded','true');
  });
  search.addEventListener('keydown',event=>{
    if (event.key==='Escape') closeSearch();
    if (event.key==='Enter') { const first=results.querySelector('a');if(first){event.preventDefault();location.hash=first.hash;closeSearch();search.blur();} }
  });
  document.addEventListener('click',event=>{if(!event.target.closest('.search-wrap'))closeSearch();});
  results.addEventListener('click',()=>{closeSearch();search.value='';});
  window.addEventListener('hashchange',()=>{closeSearch();render();window.scrollTo({top:0,behavior:'instant'});});
  window.addEventListener('storage',event=>{if(event.key===storageKey){loadState();render();}});
  loadState();
  render();
})();
