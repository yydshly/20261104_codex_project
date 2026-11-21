(() => {
  'use strict';
  const cases = window.STUDY_CASES || [];
  const jobs = window.STUDY_JOBS || {};
  const decisions = window.STUDY_DECISIONS || {};
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const prose = (value) => Array.isArray(value) ? `<ul>${value.map(item => `<li>${esc(typeof item === 'object' ? item.text || item.detail || JSON.stringify(item) : item)}</li>`).join('')}</ul>` : `<p>${esc(value || '本轮未核实。')}</p>`;
  const fmt = (value) => value === null || value === undefined ? '未知' : typeof value === 'object' ? JSON.stringify(value) : esc(value);
  const statusLabels = {reference:'模式参考',pending:'保留待验证',withdrawn:'推荐已撤回','not-recommended':'暂不推荐'};
  const kindLabels = {official:'官方说明',user:'用户讨论',payment:'支付同步',catalog:'案例目录',founder:'创始人自述',audit:'本轮核查'};
  const status = (kind) => `<span class="status ${esc(kind)}">${statusLabels[kind] || '待核实'}</span>`;
  const safeUrl = (value) => {
    const text = String(value || '');
    return /^(https?:\/\/|\.\.?\/|evidence\/)/i.test(text) ? text : '#sources';
  };
  const anchor = (url, label, classes = '') => `<a href="${esc(safeUrl(url))}" class="${esc(classes)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const sourceLinks = (sources) => `<div class="source-links">${(sources || []).map(source => anchor(source.url, `${source.kind ? `[${kindLabels[source.kind] || source.kind}] ` : ''}${source.label || source.title || '原始来源'}`)).join('')}</div>`;
  let selectedCase = cases[0]?.id;
  let caseStatus = 'all';
  let currentView = '';
  let jobTab = 'companies';

  function filteredCases() {
    const query = $('#case-search').value.trim().toLocaleLowerCase();
    return cases.filter(item => (caseStatus === 'all' || item.status === caseStatus) && (!query || JSON.stringify(item).toLocaleLowerCase().includes(query)));
  }

  function renderCases() {
    const matches = filteredCases();
    if (!matches.some(item => item.id === selectedCase)) selectedCase = matches[0]?.id;
    $('#case-count').textContent = `${matches.length} 个案例 · 共 ${cases.length} 个`;
    $('#case-list').innerHTML = matches.length ? matches.map(item => `<button class="case-button ${item.id === selectedCase ? 'selected' : ''}" type="button" data-case="${esc(item.id)}" aria-pressed="${item.id === selectedCase}"><span class="case-name">${esc(item.name)}</span><span class="case-type">${esc(item.type)}</span>${status(item.status)}</button>`).join('') : '<div class="empty-state">没有匹配的案例。试试其他词，或切换到全部案例。</div>';
    const item = matches.find(candidate => candidate.id === selectedCase);
    if (!item) { $('#case-detail').innerHTML = '<div class="empty-state">筛选后没有可展示的案例。</div>'; return; }
    const fields = [['用户需求：证据说了什么', 'demand'],['为什么付钱：已有收费与待验证理由','payment'],['怎么获客：入口与效果分开看','acquisition'],['一个人做：维护与经营成本','solo'],['现有 AI 能替代多少','aiGap'],['证据缺口与边界','limits']];
    $('#case-detail').innerHTML = `<header class="detail-header"><div><h2>${esc(item.name)}</h2><p class="detail-type">${esc(item.type)}</p></div>${status(item.status)}</header><p class="plain-explanation">${esc(item.plain)}</p><div class="scenario">${esc(item.example)}</div><div class="verdict"><strong>我们目前的判断</strong>${esc(item.verdict)}</div>${fields.map(([label, field]) => `<section class="detail-section"><h3>${label}</h3>${prose(item[field])}</section>`).join('')}<section class="detail-section"><h3>回到原始来源</h3>${sourceLinks(item.sources)}</section>`;
  }

  function renderJobSummary() {
    const summary = jobs.summary || {};
    const scope = jobs.scope || {};
    const windowLabel = jobs.window?.label || '2026-11-14 14:34 至 2026-11-21 14:34（上海时间）';
    $('#jobs-intro').textContent = `${windowLabel}。核对 15 家企业、招聘社区与补充职位板；目标人群为居住中国大陆的开发者。以下记录保留当时的数量与限制。`;
    $('#jobs-summary').innerHTML = (summary.cards || []).slice(0, 4).map(card => `<div class="metric"><strong>${fmt(card.value)}</strong><span>${esc(card.label)}<br>${esc(card.detail)}</span></div>`).join('');
    $('#jobs-caveat').innerHTML = `<strong>9 项是地域文字符合的候选，不是 9 项已确认能在中国签约的岗位。</strong><br>${esc(summary.explanation)}<details><summary>展开核查口径与限制</summary>${prose(scope.limitations)}</details>`;
    $('#jobs-lessons').innerHTML = (jobs.lessons || []).map(lesson => `<article class="reading-card"><h3>${esc(lesson.title || '研究发现')}</h3>${prose(lesson.text || lesson)}</article>`).join('');
    renderJobTab();
  }

  function renderJobTab() {
    const content = $('#jobs-content');
    document.querySelectorAll('[data-job-tab]').forEach(button => { const active = button.dataset.jobTab === jobTab; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    if (jobTab === 'companies') {
      content.innerHTML = `<p class="table-caption">当前与近周发布数包含全部职能、地区版本及重发。未知值保留为未知。横向滑动可查看完整表格。</p><div class="table-wrap"><table><thead><tr><th scope="col">企业</th><th scope="col">当前公开条目</th><th scope="col">近周标记发布</th><th scope="col">地域技术候选</th><th scope="col">获取方式</th><th scope="col">获取难度</th><th scope="col">判定依据</th></tr></thead><tbody>${(jobs.companies || []).map(company => `<tr><td>${anchor(company.sourceUrl,company.name)}</td><td class="numeric">${fmt(company.current)}</td><td class="numeric">${fmt(company.recent)}</td><td class="numeric">${fmt(company.eligible)}</td><td>${esc(company.method)}</td><td>${esc(company.difficulty)}</td><td><details><summary>查看</summary>${prose(company.notes)}<p class="muted">日期口径：${esc(company.dateBasis)}</p></details></td></tr>`).join('')}</tbody></table></div>`;
    } else if (jobTab === 'communities') {
      content.innerHTML = `<p class="table-caption">社区的帖子、广告条目、岗位不是同一计数单位。电鸭和补充职位板未证明完整七天历史，不能直接相加为全市场新增。</p><div class="table-wrap"><table><thead><tr><th scope="col">社区／职位板</th><th scope="col">当前样本</th><th scope="col">近周条目</th><th scope="col">地域候选</th><th scope="col">获取与核实</th><th scope="col">覆盖与限制</th></tr></thead><tbody>${(jobs.communities || []).map(community => `<tr><td>${anchor(community.sourceUrl,community.name)}</td><td class="numeric">${fmt(community.current)}</td><td class="numeric">${fmt(community.recent)}</td><td class="numeric">${fmt(community.eligible)}</td><td>${esc(community.difficulty)}<br><span class="muted">${esc(community.method)}</span></td><td><details><summary>查看口径</summary><p>${esc(community.coverage)}</p>${prose(community.notes)}<p class="muted">${esc(community.countUnit || '')}</p></details></td></tr>`).join('')}</tbody></table></div>`;
    } else if (jobTab === 'opportunities') {
      const renderOpportunity = (item) => `<article class="opportunity-card"><div class="company">${esc(item.company || item.source)} · ${esc(item.group || '当时公开条目')}</div><h3>${esc(item.title)}</h3><p><strong>地域依据：</strong>${esc(item.locationEvidence)}</p><p><strong>附加条件：</strong>${esc(item.conditions)}</p><p><strong>时间口径：</strong>${esc(item.date)} · ${esc(item.dateBasis)}</p><p class="muted">${esc(item.status || '中国签约未确认')}${item.formNote ? `；${esc(item.formNote)}` : ''}</p>${anchor(item.url,'打开当时的岗位入口','text-link')}</article>`;
      content.innerHTML = `<p class="table-caption">这些链接为 2026 年 11 月 21 日的核对记录，不保证此刻仍在招聘。薪资雇佣、按任务计酬与专项外包分别辨认。</p><div class="opportunity-list">${(jobs.opportunities?.core || []).map(renderOpportunity).join('')}</div><h3 class="small-heading">专项外包：单列，不计入核心 9 项</h3><div class="opportunity-list">${(jobs.opportunities?.special || []).map(renderOpportunity).join('')}</div>`;
    } else {
      content.innerHTML = `<div class="callout"><strong>${esc(jobs.duplicates?.warning || '没有可靠的全样本精确去重总量。')}</strong><br>没有查到相同条目，不等于已经证明彼此独立；匿名合集尤其需要人工核实。</div><div class="reading-grid">${(jobs.duplicates?.items || []).map(item => `<article class="reading-card"><h3>${esc(item.source)} · ${esc(item.kind)}</h3><p>${item.count === null ? '数量未定。' : `${fmt(item.count)} ${esc(item.unit)}。`}${esc(item.detail)}</p></article>`).join('')}<article class="reading-card"><h3>取数之后，仍有持续工作</h3><p>ATS 公开数据与 RSS 只是入口。地域限制、申请表国家、失效岗位、重发日期与同岗多地区版本，都需要继续复核。</p></article></div>`;
    }
  }

  function renderDecisions() {
    $('#decision-timeline').innerHTML = (decisions.timeline || []).map(item => `<article class="timeline-item"><div class="timeline-stage">${esc(item.stage)}</div><h2>${esc(item.title)}</h2><div class="revision-grid"><div class="revision-box"><span class="revision-label">当时的考虑</span>${prose(item.before)}</div><div class="revision-box"><span class="revision-label">现在的判断</span>${prose(item.after)}</div></div><div class="timeline-evidence"><strong>后来核对到：</strong>${esc(item.evidence)}</div><p class="timeline-lesson">${esc(item.lesson)}</p>${sourceLinks(item.sources)}</article>`).join('');
    $('#principles').innerHTML = (decisions.principles || []).map(item => `<article class="principle"><h3>${esc(item.title)}</h3>${prose(item.text)}</article>`).join('');
    $('#ai-checks').innerHTML = (decisions.aiChecks || []).map(item => `<article class="reading-card"><h3>${esc(item.title)}</h3>${prose(item.text)}</article>`).join('');
    $('#experiments').innerHTML = (decisions.experiments || []).map(item => `<article class="experiment-card"><h3>${esc(item.title)}</h3><dl><dt>验证对象</dt><dd>${esc(item.target)}</dd><dt>怎么做</dt><dd>${esc(item.procedure)}</dd><dt>继续的条件</dt><dd>${esc(item.pass)}</dd><dt>停止的条件</dt><dd>${esc(item.stop)}</dd></dl></article>`).join('');
    $('#glossary').innerHTML = (decisions.glossary || []).map(item => `<dt>${esc(item.term)}</dt><dd>${esc(item.meaning)}</dd>`).join('');
  }

  function inferKind(url) {
    if (!/^https?:/i.test(url)) return 'audit';
    if (url.includes('trustmrr.com')) return 'payment';
    if (url.includes('reddit.com') || url.includes('forums.sketchup.com')) return 'user';
    if (url.includes('msfdcszhd.com')) return 'catalog';
    if (url.includes('go-to-agency.com') || url.includes('x.com') || url.includes('dev.to') || url.includes('blog.tally.so')) return 'founder';
    return 'official';
  }

  const sourceMap = new Map();
  function addSource(source, project) {
    if (!source?.url) return;
    const key = source.url.replace(/\/$/, '');
    if (sourceMap.has(key)) { sourceMap.get(key).projects.add(project); return; }
    sourceMap.set(key, { label:source.label || source.title || '来源', url:source.url, kind:kindLabels[source.kind] ? source.kind : inferKind(source.url), note:source.note || '', projects:new Set([project]) });
  }
  cases.forEach(item => (item.sources || []).forEach(source => addSource(source,item.name)));
  (decisions.timeline || []).forEach(item => (item.sources || []).forEach(source => addSource(source,`判断记录 · ${item.stage}`)));
  (jobs.sources || []).forEach(source => addSource(source,'岗位供给核对'));
  const allSources = [...sourceMap.values()];

  function renderSources() {
    const query = $('#source-search').value.trim().toLocaleLowerCase();
    const kind = $('#source-kind').value;
    const matches = allSources.filter(source => (kind === 'all' || source.kind === kind) && (!query || [source.label,source.url,...source.projects].join(' ').toLocaleLowerCase().includes(query)));
    $('#source-count').textContent = `找到 ${matches.length} 条来源 · 去重后共 ${allSources.length} 条`;
    $('#source-list').innerHTML = matches.length ? matches.map(source => `<article class="source-row"><span class="evidence-tag ${esc(source.kind)}">${kindLabels[source.kind]}</span><div><h3>${anchor(source.url,source.label)}</h3><span class="source-projects">${esc([...source.projects].join(' · '))}</span><p>${esc(source.url)}</p>${source.note ? `<p>${esc(source.note)}</p>` : ''}</div></article>`).join('') : '<div class="empty-state">没有匹配的来源。可以清空关键词或切换来源类型。</div>';
  }

  function route() {
    const parts = location.hash.slice(1).split('/');
    const view = ['overview','value','map','cases','jobs','collaboration','decisions','method','sources'].includes(parts[0]) ? parts[0] : 'overview';
    const changedView = view !== currentView;
    document.querySelectorAll('.view').forEach(section => { section.hidden = section.id !== `view-${view}`; });
    document.querySelectorAll('[data-view]').forEach(link => { if (link.dataset.view === view) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    if (view === 'cases') {
      if (parts[1] && cases.some(item => item.id === parts[1])) {
        selectedCase = parts[1];
        caseStatus = 'all';
        $('#case-search').value = '';
        updateCaseFilters();
      }
      renderCases();
    }
    currentView = view;
    document.title = `${$('#view-' + view + ' h1')?.textContent || '理解总览'} · 小工具研究簿`;
    if (changedView) window.scrollTo({top:0,behavior:'instant'});
  }

  function updateCaseFilters() {
    document.querySelectorAll('[data-status]').forEach(button => { const active = button.dataset.status === caseStatus; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
  }
  $('#case-filters').addEventListener('click', (event) => { const button = event.target.closest('[data-status]'); if (!button) return; caseStatus = button.dataset.status; updateCaseFilters(); renderCases(); });
  $('#case-search').addEventListener('input',renderCases);
  $('#case-list').addEventListener('click', (event) => { const button = event.target.closest('[data-case]'); if (!button) return; selectedCase = button.dataset.case; renderCases(); history.replaceState(null,'',`#cases/${selectedCase}`); document.querySelector(`[data-case="${selectedCase}"]`)?.focus({preventScroll:true}); });
  document.querySelectorAll('[data-job-tab]').forEach(button => button.addEventListener('click', () => { jobTab = button.dataset.jobTab; renderJobTab(); }));
  $('#source-search').addEventListener('input',renderSources);
  $('#source-kind').addEventListener('change',renderSources);
  $('#print-study').addEventListener('click',() => window.print());
  let toastTimer;
  $('#export-study').addEventListener('click', () => {
    const payload = { title:'个人小工具的能力、商业价值与 AI 协作研究', snapshot:'2026-11-21', currentConclusion:'当前没有值得立项的业务方向；岗位聚合暂缓、SVG 首选撤回，个人 AI 沟通辅助暂不产品化。案例与方法用于学习、复查和减少错误投入；新付费需求与实际收益未验证。', cases, jobs, decisions, sources:allSources.map(source => ({...source,projects:[...source.projects]})) };
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'solo-business-study-20261121.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),30000);
    $('#notice').textContent = '已生成完整研究 JSON'; $('#notice').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#notice').hidden = true; },3200);
  });
  renderCases(); renderJobSummary(); renderDecisions(); renderSources();
  window.addEventListener('hashchange',route);
  route();
})();
