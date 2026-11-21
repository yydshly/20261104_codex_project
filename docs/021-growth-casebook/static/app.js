const main = document.querySelector('#main');
const dialog = document.querySelector('#project-dialog');
const form = document.querySelector('#project-form');
const websiteDialog = document.querySelector('#website-dialog');
const websiteForm = document.querySelector('#website-form');
const publicSnapshot = document.querySelector('meta[name="casebook-mode"]')?.content === 'public-snapshot';
const publicationBase = new URL('.', location.href);
let publicationCatalog;
let websiteProjectId = '';
const samples = {
  postiz: { url: 'https://postiz.com', name: 'Postiz', github: 'https://github.com/gitroomhq/postiz-app', category: '内容与营销' },
  plausible: { url: 'https://plausible.io', name: 'Plausible', github: 'https://github.com/plausible/analytics', category: '数据分析' },
  umami: { url: 'https://umami.is', name: 'Umami', github: 'https://github.com/umami-software/umami', category: '数据分析' },
};
const state = { tasks: [], projects: [], query: '', channel: '', followTask: null, routeToken: 0 };
let toastTimer;
let searchTimer;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '#';
  } catch {
    return '#';
  }
}

function dateLabel(value, includeTime = false) {
  if (!value) return '日期未披露';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
}

function number(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

async function api(path, options = {}) {
  if (publicSnapshot) {
    if (options.method && options.method !== 'GET') throw new Error('公开快照仅供阅读，采集与更新请在本地研究台执行。');
    return publicationApi(path);
  }
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const payload = await response.json();
  if (!response.ok) {
    let message = payload.detail || '请求未完成，请稍后重试';
    if (Array.isArray(message)) message = message.map(item => item.msg).join('；');
    throw new Error(message);
  }
  return payload;
}

async function readPublishedFile(path) {
  const response = await fetch(new URL(path, publicationBase));
  if (!response.ok) throw new Error('这份公开快照暂时无法读取，请刷新后重试。');
  return response.json();
}

function publishedCatalog() {
  publicationCatalog ||= readPublishedFile('snapshot/catalog.json').catch(error => {
    publicationCatalog = null;
    throw error;
  });
  return publicationCatalog;
}

async function publicationApi(path) {
  const catalog = await publishedCatalog();
  const url = new URL(path, location.origin);
  if (url.pathname === '/api/projects') {
    const query = (url.searchParams.get('q') || '').trim().toLocaleLowerCase();
    const channel = url.searchParams.get('channel') || '';
    return {items:catalog.projects.filter(project => (!query || JSON.stringify([project.name,project.website,project.description,project.description_zh,project.category,project.channels]).toLocaleLowerCase().includes(query)) && (!channel || project.channels.includes(channel)))};
  }
  if (url.pathname === '/api/stats') return catalog.stats;
  if (url.pathname === '/api/tasks') return {items:catalog.tasks};
  if (url.pathname === '/api/discovery') return catalog.discovery;
  const match = url.pathname.match(/^\/api\/projects\/([a-f0-9]{32})$/);
  if (match) {
    const project = catalog.projects.find(item => item.id === match[1]);
    if (!project) throw new Error('该项目未包含在本次公开快照中。');
    const versions = catalog.versions[project.id];
    const version = url.searchParams.has('version') ? Number(url.searchParams.get('version')) : project.version;
    if (!versions.some(item => item.version === version)) throw new Error('该报告版本未包含在公开快照中。');
    const report = await readPublishedFile(`snapshot/reports/${project.id}/v${version}.json`);
    return {project,report,versions};
  }
  throw new Error('公开快照不提供这个接口。');
}

function assetPath(path) {
  return publicSnapshot ? new URL(path, publicationBase).href : '/' + path;
}

function reportExportPath(projectId, version) {
  return publicSnapshot ? new URL(`snapshot/reports/${projectId}/v${version}.json`, publicationBase).href : `/api/projects/${projectId}/report.json?version=${version}`;
}

function applyPublicationView() {
  if (!publicSnapshot) return;
  document.querySelectorAll('[data-new-project],[data-refresh],[data-website-project],[data-open-sample]').forEach(element => element.remove());
}

function toast(message) {
  const element = document.querySelector('#toast');
  clearTimeout(toastTimer);
  element.textContent = message;
  element.hidden = false;
  toastTimer = setTimeout(() => { element.hidden = true; }, 4500);
}

function stat(label, value, note, symbol = '') {
  return `<div class="stat"><div class="stat-label">${escapeHtml(label)}<span aria-hidden="true">${symbol}</span></div><div class="stat-value">${escapeHtml(value)}</div><div class="stat-note">${escapeHtml(note)}</div></div>`;
}

function intro(eyebrow, title, description, decoration = false) {
  return `<div class="page-intro"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${description}</p></div>${decoration ? '<div class="intro-decoration" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}</div>`;
}

async function overview(token) {
  const [result, discovery] = await Promise.all([api('/api/projects'), api('/api/discovery')]);
  if (token !== state.routeToken) return;
  const projects = result.items;
  const coverage = kind => projects.filter(project => project.coverage === kind).length;
  const sourceCount = projects.reduce((sum, project) => sum + project.source_count, 0);
  const actionCount = projects.reduce((sum, project) => sum + project.action_count, 0);
  const hunt = projects.filter(project => project.website_resolution?.status);
  const confirmed = hunt.filter(project => project.website_resolution.status === 'confirmed' && project.coverage === 'website');
  const settings = discovery.settings;
  const observedAt = publicSnapshot ? (await publishedCatalog()).published_at : new Date().toISOString();
  main.innerHTML = `<div class="overview-page">
    ${intro('公开证据 · 免费数据第一版', '产品研究库 · 项目总结', '研究公开产品信息如何成为可回查、可比较的案例，为我们的选题、竞品学习和小实验提供依据。')}
    <div class="overview-actions"><a class="button primary" href="#/library">进入案例库 <span aria-hidden="true">↗</span></a><a class="button" href="#/tasks">查看采集任务</a><a class="button" href="#/discovery">查看自动发现</a><a class="overview-document" href="${assetPath('static/project-review.md')}" download>下载项目回顾文档 ↓</a></div>
    <div class="overview-grid overview-brief"><article class="overview-card"><h3>研究内容</h3><p>从 GitHub、BetaList、Show HN 和 Product Hunt 发现产品，核对官网并采集免费资料，以固定章节组织定位、定价、公开入口和动作。</p></article><article class="overview-card"><h3>核心价值</h3><p>减少重复搜索与整理，让不同产品可以按相同结构比较，并保留原文引用、匹配依据、时间、数据缺口和历史版本。</p></article><article class="overview-card"><h3>对我们的意义</h3><p>把零散收藏积累成研究资产，为选题、学习其他产品的做法、提出小实验和判断下一步投入提供依据；实际省时和商业效果仍需验证。</p></article></div>
    <div class="stats">${stat('已研究产品', number(projects.length), '案例库当前可见产品')}${stat('取得官网资料', number(coverage('website')), '表示取得正文，资料仍可能有缺口')}${stat('公开来源记录', number(sourceCount), '按各产品最新报告汇总')}${stat('公开入口与动作', number(actionCount), '已观察记录，获客效果待验证')}</div>
    <p class="overview-data-note">另有 ${coverage('repository')} 个以仓库资料为主、${coverage('listing_only')} 个保留发布简报。${discovery.counts.published || 0} 个通过自动发现入库，候选池 ${discovery.counts.candidate || 0} 个。${publicSnapshot ? '公开快照采集于' : '本页读取于'} ${dateLabel(observedAt, true)}。</p>
    <section class="overview-section overview-map" aria-labelledby="research-map-title"><div class="section-title-row"><h2 id="research-map-title">一图看懂我们的研究</h2><a href="${assetPath('static/research-map/research-overview.png')}" download>下载高清 PNG ↓</a></div><p class="overview-data-note">汇总研究目标、入口、处理流程、报告、验证结果、价值、限制与扩展方向。图中数字为 2026 年 11 月 21 日快照，扩展设想已单独标注。</p><figure><a class="overview-map-preview" href="${assetPath('static/research-map/research-overview.svg')}" target="_blank" rel="noopener noreferrer" aria-label="打开完整研究全景图，可放大阅读"><img src="${assetPath('static/research-map/research-overview.png')}" alt="产品研究全景图，包含七个分区：研究内容、使用与数据入口、资料处理流程、报告输出、验证结果、价值与限制、可扩展方向。" width="2400" height="6120" loading="lazy"><span>打开完整全景图 · 放大阅读 ↗</span></a><figcaption>此处展示图的上部预览。打开后可查看完整七个分区；<a href="${assetPath('static/research-map/research-overview.svg')}" download>下载可编辑 SVG</a>。</figcaption></figure></section>
    <section class="overview-section"><div class="section-title-row"><h2>我们研究了哪些内容</h2><span class="eyebrow">从拆解到实现</span></div><div class="overview-grid">
      <article class="overview-card"><span class="overview-step">01</span><h3>理解产品研究的结构</h3><p>拆解将收入、公开获客动作与时间线组织成报告的思路，确定用固定章节、来源引用和版本记录积累案例。</p></article>
      <article class="overview-card"><span class="overview-step">02</span><h3>验证免费数据的边界</h3><p>验证官网、仓库、产品目录和社区可以提供哪些证据，区分已采集事实、官网匹配线索与仍需补充的数据。</p></article>
      <article class="overview-card"><span class="overview-step">03</span><h3>跑通自动研究流程</h3><p>从手动输入产品，推进到多来源发现、官网核对、免费资料采集、中文报告生成和网页展示。</p></article>
    </div></section>
    <section class="overview-section"><div class="section-title-row"><h2>数据入口是什么</h2><a href="#/method">查看数据与方法</a></div><div class="overview-table-wrap" role="region" aria-label="数据入口对照表" tabindex="0"><table class="overview-table"><caption>四类自动发现来源，加上手动指定产品</caption><thead><tr><th scope="col">入口</th><th scope="col">发现的产品</th><th scope="col">取得的公开资料</th></tr></thead><tbody>
      <tr><th scope="row">GitHub</th><td>开源软件、自托管工具</td><td>官网、简介、README、Stars 与最近发布记录</td></tr>
      <tr><th scope="row">BetaList</th><td>新上线的商业产品</td><td>产品介绍、公开官网跳转与目录收录日期</td></tr>
      <tr><th scope="row">Show HN</th><td>社区展示的新产品</td><td>产品链接、公开介绍和帖子日期</td></tr>
      <tr><th scope="row">Product Hunt RSS</th><td>新发布产品，包括非开源产品</td><td>名称、简介、发布日期；后台继续查找官网</td></tr>
      <tr><th scope="row">手动提交</th><td>自己指定的产品</td><td>输入官网或公开仓库后启动研究</td></tr>
    </tbody></table></div><p class="overview-data-note">官网匹配还使用 Hunted.Space、Apple 官方应用搜索和社区链接。候选需核对名称、功能与产品回链；未确认或发生冲突时保留简报。</p></section>
    <section class="overview-section"><h2>已经实现的效果</h2><ol class="overview-flow" aria-label="自动研究流程">${['发现产品','核对官网','免费采集','中文整理','报告入库'].map(step => `<li>${step}</li>`).join('')}</ol><div class="overview-grid two">
      <article class="overview-card"><h3>报告可以回查与更新</h3><p>八个固定章节覆盖产品概览、定价、获客入口、公开动作、社媒线索、时间线、竞品线索和数据缺口。支持中文阅读、搜索、来源回查、历史版本和 JSON 导出。</p><a href="#/library">浏览实际报告 ↗</a></article>
      <article class="overview-card"><h3>官网查找与补采已自动化</h3><p>${hunt.length ? `当前有 ${hunt.length} 个 Product Hunt 产品带官网查找记录，其中 ${confirmed.length} 个已自动核对并取得官网资料。` : 'Product Hunt 产品入队后自动查找官网，确认后继续采集。'}未确认的产品保留简报，启用自动发现后每 24 小时重试。</p><p>${publicSnapshot ? `本机验证时设置为每 ${settings.interval_hours} 小时一批、每批 ${settings.batch_size} 个产品。公开网页不执行后台采集。` : settings.enabled ? `当前定时发现已开启，每 ${settings.interval_hours} 小时运行、每批处理 ${settings.batch_size} 个产品。本地服务需要保持运行。` : '当前定时发现未开启，可在自动发现中设置。'}</p><a href="#/tasks">查看采集任务 ↗</a></article>
    </div></section>
    <section class="overview-section"><h2>这项研究的价值</h2><div class="overview-grid">
      <article class="overview-card"><h3>减少重复查找与整理</h3><p>把分散在官网、目录和仓库里的信息放进同一套报告结构，帮助更快理解产品定位、定价和公开做法。</p></article>
      <article class="overview-card"><h3>积累可比较的案例</h3><p>通过相同章节和来源引用比较产品，寻找内容、试用、文档、社区和开发者生态中值得继续研究的做法。</p></article>
      <article class="overview-card"><h3>留下可复用的研究资产</h3><p>保存资料、匹配依据和历史版本，后续研究可以在已有证据上推进，并为进一步分析和方案生成提供基础。</p></article>
    </div></section>
    <section class="overview-section overview-limits"><h2>当前限制与继续开发的边界</h2><ul><li>收入、已验证 MRR、真实访问量、搜索排名和渠道转化尚未取得。</li><li>公开入口与动作只说明观察到了什么，不能直接证明带来客户或收入。</li><li>Product Hunt 网页跳转仍可能返回 403；公开线索不足时，无法保证找到官网。</li><li>动态网页、robots.txt、接口限额、证书和页面体积会影响采集完整性。</li><li>中文整理使用规则提取和本地翻译，术语与含义仍需结合原文核对。</li><li>竞品章节当前提供研究线索；收入归因图、MCP、个性化实验与多用户部署属于后续范围。</li></ul><p>目前适合了解产品做什么、公开做过哪些事，以及有哪些做法值得研究；具体获客成效仍需额外数据验证。</p></section>
    <aside class="overview-archive"><div><strong>保留这次研究，便于以后接着做</strong><p>回顾文档记录 2026 年 11 月 21 日的验证快照、关键实现位置和后续开发前的核对事项。${publicSnapshot ? '上方数字对应本次公开快照，重新构建发布后更新。' : '上方数字每次进入页面时重新读取。'}</p></div><a class="button small" href="${assetPath('static/project-review.md')}" download>下载回顾文档</a></aside>
  </div>`;
}

function projectCard(project) {
  const stars = project.metrics.find(metric => metric.name === 'GitHub Stars');
  return `<a class="project-card" href="#/project/${encodeURIComponent(project.id)}">
    <div class="project-top"><span class="project-avatar" aria-hidden="true">${escapeHtml(project.name.slice(0, 1).toUpperCase())}</span><div><h2>${escapeHtml(project.name)}</h2><span class="domain">${escapeHtml(project.coverage === 'listing_only' ? 'Product Hunt 公开订阅' : new URL(project.website).hostname)}</span></div><span class="project-type">${escapeHtml(project.category)}</span></div>
    ${project.coverage === 'listing_only' ? '<span class="tag neutral">发布简报 · 官网待确认</span>' : project.website_resolution?.status === 'confirmed' ? '<span class="tag neutral">官网已自动核对</span>' : ''}<p class="project-description">${escapeHtml(project.description_zh || (/[\u3400-\u9fff]/.test(project.description) ? project.description : project.summary))}</p>
    <div class="tags">${project.channels.filter(channel => !['产品更新', '项目历史'].includes(channel)).map(channel => `<span class="tag">${escapeHtml(channel)}</span>`).join('') || '<span class="tag neutral">公开资料研究</span>'}</div>
    <div class="card-metrics"><div><strong>${project.source_count}</strong><span>公开来源</span></div><div><strong>${project.action_count}</strong><span>入口与动作</span></div><div><strong>${stars ? number(stars.value) : (project.listing_count || 0)}</strong><span>${stars ? 'GitHub 收藏数' : '公开展示记录'}</span></div></div>
    <div class="card-footer"><span>${dateLabel(project.generated_at)} · v${project.version}</span><span class="read-label">阅读报告</span></div>
  </a>`;
}

function renderProjects(items) {
  const container = document.querySelector('#projects-container');
  if (!container) return;
  document.querySelector('#result-count').textContent = `${items.length} 份报告`;
  if (items.length) {
    container.className = 'project-grid';
    container.innerHTML = items.map(projectCard).join('');
  } else {
    container.className = '';
    container.innerHTML = `<div class="empty-state"><div class="empty-symbol" aria-hidden="true">▤</div><h2>${state.query || state.channel ? '没有找到匹配的案例' : '从一个真实产品开始'}</h2><p>${state.query || state.channel ? '可以换个产品名、网址或获客方法继续查找。' : '输入官网或公开仓库，收集产品资料，整理获客入口，并把每条发现关联到它的来源。'}</p><button class="button primary" data-new-project>新建研究</button>${!state.query && !state.channel ? '<button class="button" data-open-sample="postiz">用 Postiz 开始</button>' : ''}</div>`;
  }
}

async function library(token) {
  const [stats, result] = await Promise.all([api('/api/stats'), api(`/api/projects?q=${encodeURIComponent(state.query)}&channel=${encodeURIComponent(state.channel)}`)]);
  if (token !== state.routeToken) return;
  state.projects = result.items;
  main.innerHTML = intro('公开证据 · 实用研究', '研究产品如何获客', '从公开资料中整理具体做法，留下可回查的证据。', true) +
    `<div class="stats">${stat('已研究产品', number(stats.projects), '基于真实公开资料', '▦')}${stat('公开来源', number(stats.sources), '已采集的来源快照', '▤')}${stat('入口与动作', number(stats.actions), '每条都关联来源', '◎')}${stat('研究方向', number(stats.channels), '公开资料中的渠道类型', '◇')}</div>
    <div class="library-controls"><div class="search-wrap"><span aria-hidden="true">⌕</span><input id="project-search" type="search" placeholder="搜索产品、网址或获客方法" aria-label="搜索案例" value="${escapeHtml(state.query)}"></div><select id="channel-filter" aria-label="按获客方法筛选"><option value="">全部方法</option>${['内容营销', '开发者生态', '使用教育', '产品试用', '产品发布'].map(channel => `<option${state.channel === channel ? ' selected' : ''}>${channel}</option>`).join('')}</select><span id="result-count" class="result-count"></span></div><div id="projects-container"></div>`;
  renderProjects(result.items);
  document.querySelector('#project-search').addEventListener('input', event => {
    state.query = event.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(updateSearch, 220);
  });
  document.querySelector('#channel-filter').addEventListener('change', event => {
    state.channel = event.target.value;
    updateSearch();
  });
}

async function updateSearch() {
  const query = state.query;
  const channel = state.channel;
  try {
    const result = await api(`/api/projects?q=${encodeURIComponent(query)}&channel=${encodeURIComponent(channel)}`);
    if (query === state.query && channel === state.channel && routeName() === 'library') renderProjects(result.items);
  } catch (error) {
    toast(error.message);
  }
}

const statusLabels = { queued: '等待采集', running: '正在处理', completed: '已完成', failed: '失败' };

function taskCard(task) {
  return `<article class="task-card"><div class="task-heading"><h2>${escapeHtml(task.project_name)}</h2><span class="status ${task.status}">${statusLabels[task.status]}</span></div><div class="task-subline"><span>${escapeHtml(task.stage)}</span><time>${dateLabel(task.created_at, true)}</time></div><progress max="100" value="${task.progress}" aria-label="${escapeHtml(task.project_name)} 的采集进度">${task.progress}%</progress>
    ${task.error ? `<p class="error-text">${escapeHtml(task.error)}</p>` : ''}
    ${task.warnings.length ? `<details class="warning-list"><summary>${task.warnings.length} 条采集提示</summary><ul>${task.warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}</ul></details>` : ''}
    <div class="task-actions">${task.status === 'completed' ? `<a class="button light small" href="#/project/${task.project_id}">查看报告</a>` : task.status === 'failed' ? `<button class="button small" data-refresh="${task.project_id}">重新采集</button>` : '<span>任务在后台运行，可以继续浏览案例。</span>'}</div></article>`;
}

function renderTasks() {
  const container = document.querySelector('#tasks-container');
  if (!container) return;
  container.innerHTML = state.tasks.length ? state.tasks.map(taskCard).join('') : '<div class="empty-state"><h2>还没有采集任务</h2><p>添加一个公开产品，开始第一份研究。</p><button class="button primary" data-new-project>新建研究</button></div>';
}

async function tasks(token) {
  const result = await api('/api/tasks');
  if (token !== state.routeToken) return;
  state.tasks = result.items;
  main.innerHTML = intro('研究队列', '采集任务', publicSnapshot ? '查看本次公开快照中的采集记录；新增采集和更新在本地研究台执行。' : '查看资料采集进度、发布结果与需要补充的来源。') + '<div id="tasks-container" class="task-list" aria-live="polite"></div>';
  renderTasks();
}

function candidateIsBrief(candidate) {
  return candidate.source_kind === 'product_hunt' && candidate.identity.startsWith('producthunt:');
}

function websiteResolutionCard(project, report) {
  const resolution = report.website_resolution || {};
  const isBrief = report.coverage === 'listing_only';
  if (!isBrief && resolution.status !== 'confirmed') return '';
  const confirmed = resolution.status === 'confirmed';
  if (isBrief && !['producthunt.com','www.producthunt.com'].includes(new URL(project.website).hostname)) {
    return `<div class="brief-notice"><strong>历史发布简报 · 官网已在新版补齐</strong><p>本页保留当时的公开订阅资料。最新版本已关联官网，可查看后续采集结果。</p><a class="button small" href="#/project/${project.id}">查看最新报告</a></div>`;
  }
  const methods = {product_hunt_redirect:'Product Hunt 发布链接',apple_developer_website:'Apple 开发者官网',public_directory:'公开目录与官网回链',public_community:'公开社区与官网回链'};
  return `<div class="brief-notice"><strong>${confirmed ? '官网已自动核对并采集' : '官网自动查找 · 暂未确认'}</strong><p>${escapeHtml(confirmed ? `通过${methods[resolution.method] || '公开线索'}核对了产品名称、功能与关联链接。本报告已采集可访问的官网资料。` : resolution.message || '后台会自动查找并核对官网，确认后继续采集定价、内容与文档，生成新版本。')}</p>${resolution.checked_at ? `<p class="quiet-note">上次核对：${dateLabel(resolution.checked_at, true)}${!confirmed ? ' · 未确认的产品将在 24 小时后自动重试（需启用自动发现）' : ''}</p>` : ''}${resolution.evidence?.length || resolution.attempts?.length ? `<details class="website-resolution-details"><summary>查看官网匹配依据与查找记录</summary>${(resolution.evidence || []).map(item => `<div><a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a><p>${escapeHtml(item.detail)}</p></div>`).join('')}${(resolution.attempts || []).map(item => `<p><strong>${escapeHtml(item.provider)}</strong>：${escapeHtml(item.message)}</p>`).join('')}</details>` : ''}${isBrief ? `<div class="discovery-links"><button class="button primary small" data-refresh="${project.id}">重新自动查找</button><button class="button small" data-website-project="${project.id}" data-website-name="${escapeHtml(project.name)}">手动补充官网</button></div>` : ''}</div>`;
}

function renderDiscovery(result) {
  const container = document.querySelector('#discovery-results');
  if (!container) return;
  const labels = { candidate: '候选池', queued: '等待采集', duplicate: '已在库中', rejected: '暂缓采集', completed: '报告已发布', running: '正在采集', failed: '采集失败' };
  const latest = result.runs[0];
  container.innerHTML = `<div class="stats">${stat('已发现候选', Object.entries(result.counts).filter(([key]) => key !== 'published').reduce((total, [,count]) => total + count, 0), '通过产品初筛的公开项目')}${stat('已自动发布', result.counts.published || 0, '完成后直接进入案例库')}${stat('候选池', result.counts.candidate || 0, '后续批次继续处理')}${stat('最近加入队列', latest?.queued || 0, latest ? dateLabel(latest.created_at, true) : '尚未运行')}</div>
    <div class="discovery-grid source-status-grid">${(result.sources || []).map(source => `<article class="discovery-run"><strong>${escapeHtml(source.label)}</strong><p>${!source.enabled ? '未启用' : ({ok:'最近读取成功',partial:'部分记录可用',failed:'最近读取失败',cooldown:'免费配额冷却中'})[source.status] || '等待本轮发现'}${source.cooldown_until && new Date(source.cooldown_until) > new Date() ? ` · ${dateLabel(source.cooldown_until, true)} 后重试` : ''}</p>${source.error && source.enabled ? `<p>${escapeHtml(source.error)}</p>` : ''}</article>`).join('')}</div>
    <section class="discovery-history"><div class="section-title-row"><h2>发现记录</h2><a href="#/tasks">查看采集任务</a></div>${result.runs.length ? result.runs.slice(0, 5).map(run => `<article class="discovery-run"><div><strong>${escapeHtml(run.stage)}</strong><span class="tag neutral">${run.trigger === 'scheduled' ? '定时发现' : '手动触发'}</span></div><p>${dateLabel(run.created_at, true)} · 扫描 ${run.scanned} 条 · 初筛 ${run.accepted} 个 · 跳过重复 ${run.duplicates} 个 · 加入采集 ${run.queued} 个</p>${run.warnings.length ? `<ul class="error-text">${run.warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>` : ''}</article>`).join('') : '<p class="quiet-note">点击“立即发现”，开始扫描公开产品。无需填写产品名单。</p>'}</section>
    <section class="discovery-products"><div class="section-title-row"><h2>发现的产品</h2><a href="#/library">浏览全部报告</a></div><div class="discovery-grid">${result.candidates.slice(0, 24).map(candidate => `<article class="discovery-product"><div class="task-heading"><h3>${escapeHtml(candidate.name)}</h3><span class="tag neutral">${candidate.hidden_reason ? '已排除' : (labels[candidate.task_status || candidate.status] || '待处理')}</span></div><p>${escapeHtml(candidate.description_zh || `${candidate.category}方向的公开产品，${candidate.has_report ? '已生成研究报告。' : '等待免费资料采集与中文整理。'}`)}</p><p class="domain">${escapeHtml(candidate.repository || (candidateIsBrief(candidate) ? 'Product Hunt 公开订阅' : new URL(candidate.website).hostname))}${candidateIsBrief(candidate) ? ' · 官网待确认' : !candidate.repository ? ' · 开源状态未确认' : ''}</p><div class="discovery-links">${candidate.has_report ? `<a class="button light small" href="#/project/${candidate.project_id}">阅读中文报告</a>` : ''}<a href="${escapeHtml(safeUrl(candidate.website))}" target="_blank" rel="noopener noreferrer">${candidateIsBrief(candidate) ? 'Product Hunt 记录' : '产品网站'}</a>${(candidate.origins || [{source_kind:candidate.source_kind,source_url:candidate.source_url}]).map(origin => `<a href="${escapeHtml(safeUrl(origin.source_url))}" target="_blank" rel="noopener noreferrer">${({github:'GitHub',betalist:'BetaList',hacker_news:'Show HN',product_hunt:'Product Hunt'})[origin.source_kind] || '发现来源'}</a>`).join('')}</div>${candidate.task_error ? `<p class="error-text">${escapeHtml(candidate.task_error)}</p>` : candidate.status === 'rejected' ? `<p class="quiet-note">${escapeHtml(candidate.reason)}</p>` : ''}</article>`).join('')}</div></section>`;
  const next = document.querySelector('#discovery-next');
  if (next) next.textContent = result.settings.enabled ? `下次计划：${dateLabel(result.settings.next_run_at, true)}，服务运行时执行。` : '定时发现已关闭，仍可手动运行。';
  const runButton = document.querySelector('#discover-now');
  if (runButton) {
    runButton.disabled = result.runs.some(run => ['queued', 'running'].includes(run.status));
    runButton.textContent = runButton.disabled ? '正在发现…' : '立即发现';
  }
}

async function discovery(token) {
  const result = await api('/api/discovery');
  if (token !== state.routeToken) return;
  if (publicSnapshot) {
    main.innerHTML = intro('公开来源 · 实现与验证', '自动发现产品', '这里保留本轮发现记录和产品来源。公开网页提供阅读快照，后台采集在本地研究台运行。') + `<div class="discovery-flow"><span>发现产品</span><span>去重与初筛</span><span>免费采集</span><span>中文报告入库</span></div><p class="discovery-notice">本机验证时设置为每 ${result.settings.interval_hours} 小时一批、每批 ${result.settings.batch_size} 个产品。下方展示已生成报告的产品和来源记录，未发布候选不在本页展开。</p><div id="discovery-results" aria-live="polite"></div>`;
    renderDiscovery(result);
    return;
  }
  main.innerHTML = intro('持续补充研究素材', '自动发现产品', '发现公开产品，采集免费资料，生成带来源的中文报告并自动加入案例库。') +
    `<div class="discovery-flow"><span>发现产品</span><span>去重与初筛</span><span>免费采集</span><span>中文报告入库</span></div>
    <section class="discovery-settings"><div><h2>发现设置</h2><p>从 Product Hunt 公开订阅、BetaList 产品目录、Show HN 和 GitHub 中发现候选，按产品记录或已确认官网去重。不要求产品开源，也不把未发现仓库视为已确认闭源。</p><p>Product Hunt 产品会自动查找官网，通过公开目录、Apple 官方应用搜索或社区链接寻找候选，再核对名称、功能和官网回链。确认后自动采集官网、定价、内容与文档；未确认时保留简报，24 小时后重试。无需登录或 Token。来源失败或限额只影响该来源。</p></div>
    <form id="discovery-form"><label class="discovery-toggle"><input type="checkbox" id="discovery-enabled"${result.settings.enabled ? ' checked' : ''}>开启定时发现</label><fieldset class="discovery-source-picks"><legend>发现来源（至少选择一个）</legend>${(result.sources || []).map(source => `<label><input type="checkbox" name="discovery-source" value="${escapeHtml(source.id)}"${result.settings.enabled_sources.includes(source.id) ? ' checked' : ''}>${escapeHtml(source.label)}</label>`).join('')}</fieldset><div class="discovery-fields"><label>每批采集<select id="discovery-batch">${Array.from({length:10}, (_, index) => index + 1).map(value => `<option value="${value}"${value === result.settings.batch_size ? ' selected' : ''}>${value} 个产品</option>`).join('')}</select></label><label>发现间隔<select id="discovery-interval">${[...new Set([6,24,72,168,result.settings.interval_hours])].sort((a,b) => a-b).map(value => `<option value="${value}"${value === result.settings.interval_hours ? ' selected' : ''}>每 ${value} 小时</option>`).join('')}</select></label></div><div class="discovery-buttons"><button class="button" type="submit">保存设置</button><button class="button primary" type="button" id="discover-now">立即发现</button></div><p id="discovery-next" class="quiet-note"></p></form></section>
    <p class="discovery-notice">关闭浏览器页面后，已启动的本地服务可以继续工作。停止服务会暂停自动发现，重新启动后补跑一次到期任务。${result.translation_ready ? '本地英译中模型已就绪。' : '本机尚未安装英译中模型，报告框架为中文，英文摘录将保留原文。'}</p><div id="discovery-results" aria-live="polite"></div>`;
  renderDiscovery(result);
  document.querySelector('#discovery-form').addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.submitter;
    button.disabled = true;
    try {
      const enabledSources = [...document.querySelectorAll('[name="discovery-source"]:checked')].map(input => input.value);
      if (!enabledSources.length) throw new Error('请至少选择一个发现来源');
      await api('/api/discovery/settings', { method: 'PUT', body: JSON.stringify({enabled: document.querySelector('#discovery-enabled').checked, batch_size: Number(document.querySelector('#discovery-batch').value), interval_hours: Number(document.querySelector('#discovery-interval').value), enabled_sources:enabledSources}) });
      renderDiscovery(await api('/api/discovery'));
      toast('发现设置已保存');
    } catch (error) { toast(error.message); }
    finally { button.disabled = false; }
  });
  document.querySelector('#discover-now').addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const run = await api('/api/discovery/runs', { method: 'POST' });
      renderDiscovery(await api('/api/discovery'));
      toast(run.created ? '已开始发现产品，报告完成后自动入库' : '已有发现任务，正在继续处理');
    } catch (error) { toast(error.message); button.disabled = false; }
  });
}

function citations(ids, sourceMap) {
  return `<span class="citations">${ids.map(id => sourceMap[id] ? `<a class="citation" href="#source-${id}" data-source-link="${id}" aria-label="查看来源 ${sourceMap[id].index}">${sourceMap[id].index}</a>` : '').join('')}</span>`;
}

function localizedText(text, report) {
  return report.translations?.[text] || text;
}

function localizedPassage(text, report) {
  const translated = localizedText(text, report);
  if (translated !== text) return translated;
  const chinese = /[\u3400-\u9fff]/.test(text);
  const excerpt = /^(README 内容摘录：|定价页中的原始片段：|内容页可见文本摘录：)/.test(text);
  if ((!chinese || excerpt) && (text.match(/[A-Za-z]{2,}/g) || []).length >= 5) return '这段英文资料尚未取得通过检查的中文译文，可展开原文查看。';
  return text;
}

function originalText(text, report, passage = false) {
  return (passage ? localizedPassage(text, report) : localizedText(text, report)) !== text
    ? `<details class="original-text"><summary>查看原文</summary><p lang="en">${escapeHtml(text)}</p></details>` : '';
}

function actionCard(action, sourceMap, report) {
  return `<article class="action-card"><div class="action-top"><span class="tag">${escapeHtml(action.channel)}</span><span class="tag neutral">${action.evidence_type}</span><span class="action-date">${dateLabel(action.date)}</span></div><h3>${escapeHtml(localizedText(action.title, report))}${citations(action.source_ids, sourceMap)}</h3>${originalText(action.title, report)}<p>${escapeHtml(localizedPassage(action.description, report))}</p>${originalText(action.description, report, true)}<p class="action-result">${escapeHtml(action.result)}</p></article>`;
}

function sourceList(report) {
  const kindLabels = { website: '官网', pricing: '定价页', content: '内容页', docs: '文档', repository: 'GitHub', readme: 'README', release: '发布记录', listing: '目录与社区记录' };
  return `<div class="sources-list">${report.sources.map((source, index) => `<details class="source-item" id="source-${source.id}"><summary><span class="source-number">${index + 1}</span><span>${escapeHtml(localizedText(source.title, report))}</span></summary><div class="source-meta">${kindLabels[source.kind]} · 采集于 ${dateLabel(source.collected_at, true)}${source.published_at ? ` · 发布于 ${dateLabel(source.published_at)}` : ''}</div>${localizedText(source.title, report) !== source.title ? `<p class="source-original-title">原始标题：${escapeHtml(source.title)}</p>` : ''}<a href="${escapeHtml(safeUrl(source.url))}" target="_blank" rel="noopener noreferrer">打开原始来源</a>${source.metadata?.feed_url ? `<a href="${escapeHtml(safeUrl(source.metadata.feed_url))}" target="_blank" rel="noopener noreferrer">打开公开订阅</a>` : ''}<h4>${publicSnapshot ? '公开摘录（完整内容见原始来源）' : '来源原文'}</h4><div class="source-text">${escapeHtml(source.text)}</div></details>`).join('')}</div>`;
}

function reportSection(section, report, sourceMap) {
  const actionMap = Object.fromEntries(report.actions.map(action => [action.id, action]));
  let extra = '';
  let actions = section.action_ids.map(id => actionCard(actionMap[id], sourceMap, report)).join('');
  if (section.id === 'acquisition') {
    const grouped = new Map();
    for (const id of section.action_ids) {
      const action = actionMap[id];
      if (!grouped.has(action.channel)) grouped.set(action.channel, []);
      grouped.get(action.channel).push(action);
    }
    actions = `<div class="channel-map">${Array.from(grouped, ([channel, items]) => `<div class="channel-row"><strong>${escapeHtml(channel)}</strong><span>${items.length} 条可回查记录</span>${citations([...new Set(items.flatMap(item => item.source_ids))], sourceMap)}</div>`).join('')}</div>`;
  }
  if (section.id === 'social') {
    extra = `<div class="accounts">${report.discovered_accounts.map(account => `<a class="account-link" href="${escapeHtml(safeUrl(account.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(account.label || account.platform)}</a>`).join('')}</div>`;
  }
  if (section.id === 'timeline') {
    const dated = report.actions.filter(action => action.date).sort((left, right) => right.date.localeCompare(left.date));
    extra = dated.length ? `<div class="timeline">${dated.map(action => `<article class="timeline-item"><time>${dateLabel(action.date)}</time><h3>${escapeHtml(localizedText(action.title, report))}${citations(action.source_ids, sourceMap)}</h3><p>${escapeHtml(action.result)}</p></article>`).join('')}</div>` : '<p class="quiet-note">本轮资料中还没有可确认发生日期的事件。</p>';
  }
  if (section.id === 'competitors') {
    extra = '<a class="button ghost" href="#/library">回到案例库比较其他产品</a>';
  }
  if (section.id === 'appendix') {
    extra = `<div class="gap-grid">${report.gaps.map(gap => `<div class="gap-item"><span>${escapeHtml(gap)}</span><span>待补充</span></div>`).join('')}</div>${report.warnings.length ? `<details class="warning-list"><summary>本轮采集提示</summary><ul>${report.warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}</ul></details>` : ''}<h3 class="section-heading">原始来源</h3>${sourceList(report)}`;
  }
  return `<section class="report-section" id="section-${section.id}"><h2>${section.title}</h2><p class="section-intro">${escapeHtml(section.intro)}</p>${section.facts.map(fact => `<div class="fact"><p>${escapeHtml(localizedPassage(fact.text, report))}${citations(fact.source_ids, sourceMap)}</p>${originalText(fact.text, report, true)}</div>`).join('')}${actions}${extra}</section>`;
}

async function detail(projectId, version, token) {
  const data = await api(`/api/projects/${encodeURIComponent(projectId)}${version ? `?version=${encodeURIComponent(version)}` : ''}`);
  if (token !== state.routeToken) return;
  const { project, report, versions } = data;
  const isBrief = report.coverage === 'listing_only';
  const entryUrl = isBrief ? (report.sources.find(source => source.kind === 'listing' && source.metadata?.source_kind === 'product_hunt')?.url || project.website) : project.website;
  const sourceMap = Object.fromEntries(report.sources.map((source, index) => [source.id, { source, index: index + 1 }]));
  const stars = report.metrics.find(metric => metric.name === 'GitHub Stars');
  document.querySelector('#page-label').textContent = project.name;
  document.title = `${project.name} · Growth Casebook`;
  main.innerHTML = `<div class="breadcrumb"><a href="#/library">案例库</a><span>/</span><span>${escapeHtml(project.name)}</span></div>
    ${project.hidden_reason ? `<p class="discovery-notice">该记录已从案例库排除：${escapeHtml(project.hidden_reason)}。来源与历史报告仍可回查。</p>` : ''}<div class="report-title-row"><div><h1>${escapeHtml(project.name)}</h1><a class="domain" href="${escapeHtml(safeUrl(entryUrl))}" target="_blank" rel="noopener noreferrer">${escapeHtml(isBrief ? 'Product Hunt 收录记录 · 官网待确认' : new URL(project.website).hostname + ' · ' + project.category)}</a></div><div class="report-toolbar"><select id="report-version" aria-label="选择报告版本">${versions.map(item => `<option value="${item.version}"${item.version === report.version ? ' selected' : ''}>报告 v${item.version}</option>`).join('')}</select><a class="button small" href="${reportExportPath(projectId,report.version)}" download>导出 JSON</a><button class="button primary small" data-refresh="${projectId}">更新研究</button></div></div>
    ${websiteResolutionCard(project, report)}
    <div class="report-hero"><span class="eyebrow">${isBrief ? '公开发布简报' : '公开资料研究'}</span><p>${escapeHtml(localizedText(report.summary, report))}${citations(report.summary_source_ids || [], sourceMap)}</p>${originalText(report.summary, report)}<div class="report-hero-meta"><span>${isBrief ? '公开订阅简报' : report.mode === 'local_model' ? '本地模型摘要' : '证据整理报告'}</span><span>${dateLabel(report.generated_at, true)}</span><span>${report.sources.length} 份公开资料</span></div></div>
    <p class="translation-note">报告默认使用中文。英文摘录会尝试本地翻译，未通过检查时保留原文入口。部分术语可能存在偏差，可展开“查看原文”或附录来源核对。</p>
    <div class="stats report-metrics">${stat('公开来源', report.sources.length, '保留本次采集快照')}${stat('入口与动作', report.actions.length, '可逐条回查证据')}${stars ? stat('GitHub 收藏数', number(stars.value), `采集于 ${dateLabel(stars.observed_at)}`) : stat('公开展示记录', report.sources.filter(source => source.kind === 'listing').length, '产品目录或社区中的记录')}${stat('收入数据', '待补充', '需要公开披露或授权')}</div>
    <div class="report-layout"><nav class="chapter-nav" aria-label="报告章节"><span>报告目录</span>${report.sections.map(section => `<a href="#section-${section.id}" data-section-link="${section.id}">${section.title}</a>`).join('')}</nav><div class="report-body">${report.sections.map(section => reportSection(section, report, sourceMap)).join('')}</div></div>`;
  document.querySelector('#report-version').addEventListener('change', event => {
    location.hash = `/project/${projectId}?version=${event.target.value}`;
  });
}

function method() {
  main.innerHTML = intro('数据与方法', '数据来源与报告方法', '了解报告从哪里来，当前能回答哪些问题。') + `<div class="method-grid">
    <section class="method-card"><h2>本轮采集什么</h2><p>官网正文、定价页、内容入口和文档，以及可取得的公开仓库资料。通过 BetaList 或 Show HN 发现的产品还保留目录或社区记录；没有仓库的产品也能生成报告。官网有仓库链接时会尝试识别，也可手动补充仓库。</p><p>每个网站最多采集四个页面，遵循 robots.txt。GitHub 使用官方公开 API，受其免费请求配额限制。</p></section>
    <section class="method-card"><h2>报告如何生成</h2><p>无密钥时使用可回查的规则提取，把公开资料整理成八个章节。可选接入本地 Ollama 模型润色摘要，结构化事实和指标仍保留原始来源。</p><p>安装英译中模型后，英文简介与报告摘录由本地模型翻译并缓存。正文默认展示中文，可展开查看原文；附录保留完整来源快照。</p></section>
    <section class="method-card"><h2>怎样解读动作</h2><p>公开入口表示采集时存在的页面或功能路径。公开动作表示来源明确记录的事件。日期未披露的入口保留在动作列表，有日期的事件进入时间线。</p><p>GitHub Stars 与 Forks 是当前公开互动快照，转化与收入需要其他数据补充。</p></section>
    <section class="method-card"><h2>缺少哪些数据</h2><p>当前缺少支付收入、真实访问量、渠道转化、搜索排名和完整社媒讨论。官网引用的社媒链接只作为后续研究入口，账号归属需要核对。</p><p>每份报告可在附录查看数据缺口、采集失败原因和本轮原始资料。</p></section>
    <section class="method-card"><h2>更新与版本</h2><p>每次更新会建立后台任务。任务完成后发布新版本，历史版本保留原先的来源与内容。部分来源失败会提示原因，全部来源失败时任务标为失败。</p></section>
    <section class="method-card"><h2>数据保存在本机</h2><p>项目、任务、来源快照和报告保存在子项目的 <code>data/casebook.sqlite3</code>。网页、API 和后台 Worker 共用这份数据库。</p><p>提交相同产品时会复用项目；已有运行中的任务会返回该任务。</p></section>
  </div>`;
}

function routeName() {
  return location.hash.replace(/^#\//, '').split(/[/?]/)[0] || 'overview';
}

async function route() {
  const token = ++state.routeToken;
  const path = location.hash.replace(/^#\//, '') || 'overview';
  const [pathname, search] = path.split('?');
  const [name, projectId] = pathname.split('/');
  document.title = publicSnapshot ? 'Growth Casebook · 产品研究库（公开快照）' : 'Growth Casebook · 获客研究台';
  document.querySelectorAll('[data-nav]').forEach(element => {
    const active = element.dataset.nav === (name === 'project' ? 'library' : name);
    element.classList.toggle('active', active);
    if (active) element.setAttribute('aria-current', 'page');
    else element.removeAttribute('aria-current');
  });
  document.querySelector('#page-label').textContent = ({ overview: '项目总结', library: '案例库', tasks: '采集任务', discovery: '自动发现', method: '数据与方法', project: '研究报告' })[name] || '项目总结';
  main.innerHTML = '<div class="loading-state">正在读取资料…</div>';
  window.scrollTo(0, 0);
  try {
    if (name === 'project' && projectId) await detail(projectId, new URLSearchParams(search).get('version'), token);
    else if (name === 'tasks') await tasks(token);
    else if (name === 'discovery') await discovery(token);
    else if (name === 'method') method();
    else if (name === 'library') await library(token);
    else await overview(token);
    applyPublicationView();
  } catch (error) {
    if (token !== state.routeToken) return;
    main.innerHTML = `<div class="empty-state"><h2>资料暂时无法读取</h2><p>${escapeHtml(error.message)}</p><a class="button" href="#/library">回到案例库</a></div>`;
  }
}

async function pollTasks() {
  try {
    const result = await api('/api/tasks');
    const changed = JSON.stringify(result.items) !== JSON.stringify(state.tasks);
    state.tasks = result.items;
    const active = state.tasks.filter(task => ['queued', 'running'].includes(task.status));
    const badge = document.querySelector('#active-count');
    badge.hidden = !active.length;
    badge.textContent = active.length;
    const banner = document.querySelector('#running-banner');
    banner.hidden = !active.length;
    banner.innerHTML = `<a href="#/tasks">${active.length} 个研究正在后台处理</a>，可以继续浏览已有案例。`;
    if (changed && routeName() === 'tasks') renderTasks();
    if (changed && routeName() === 'library') {
      await updateSearch();
      const stats = await api('/api/stats');
      if (routeName() === 'library') document.querySelector('.stats').innerHTML = stat('已研究产品', number(stats.projects), '基于真实公开资料', '▦') + stat('公开来源', number(stats.sources), '已采集的来源快照', '▤') + stat('入口与动作', number(stats.actions), '每条都关联来源', '◎') + stat('研究方向', number(stats.channels), '公开资料中的渠道类型', '◇');
    }
    if (routeName() === 'discovery') renderDiscovery(await api('/api/discovery'));
    if (state.followTask) {
      const followed = state.tasks.find(task => task.id === state.followTask);
      if (followed?.status === 'completed') {
        state.followTask = null;
        if (routeName() === 'tasks') location.hash = `/project/${followed.project_id}`;
        toast(`${followed.project_name} 的报告已生成`);
      } else if (followed?.status === 'failed') {
        state.followTask = null;
      }
    }
  } catch {
    // The current page keeps its data while a transient polling request fails.
  } finally {
    setTimeout(pollTasks, state.tasks.some(task => ['queued', 'running'].includes(task.status)) ? 1800 : 6000);
  }
}

function openProjectDialog(sampleName) {
  form.reset();
  document.querySelector('#form-error').hidden = true;
  if (sampleName) fillSample(sampleName);
  if (!dialog.open) dialog.showModal();
  document.querySelector('#project-url').focus();
}

function fillSample(name) {
  for (const [key, value] of Object.entries(samples[name])) form.elements.namedItem(key).value = value;
}

document.addEventListener('click', async event => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  }
  const newButton = event.target.closest('[data-new-project]');
  if (newButton) openProjectDialog();
  const websiteButton = event.target.closest('[data-website-project]');
  if (websiteButton) {
    websiteProjectId = websiteButton.dataset.websiteProject;
    websiteForm.reset();
    document.querySelector('#website-product-name').textContent = websiteButton.dataset.websiteName;
    document.querySelector('#website-error').hidden = true;
    websiteDialog.showModal();
    document.querySelector('#website-url').focus();
  }
  const sampleButton = event.target.closest('[data-open-sample]');
  if (sampleButton) openProjectDialog(sampleButton.dataset.openSample);
  const fillButton = event.target.closest('[data-sample]');
  if (fillButton) fillSample(fillButton.dataset.sample);
  const anchor = event.target.closest('[data-section-link], [data-source-link]');
  if (anchor) {
    event.preventDefault();
    const id = anchor.dataset.sourceLink ? `source-${anchor.dataset.sourceLink}` : `section-${anchor.dataset.sectionLink}`;
    const target = document.getElementById(id);
    if (target instanceof HTMLDetailsElement) target.open = true;
    target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  const refreshButton = event.target.closest('[data-refresh]');
  if (refreshButton) {
    refreshButton.disabled = true;
    try {
      const result = await api(`/api/projects/${refreshButton.dataset.refresh}/refresh`, { method: 'POST' });
      state.followTask = result.task.id;
      if (routeName() === 'tasks') await route();
      else location.hash = '/tasks';
      toast(result.created ? '已添加更新任务' : '正在处理已有任务');
    } catch (error) {
      toast(error.message);
    } finally {
      refreshButton.disabled = false;
    }
  }
});

document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#close-website-dialog').addEventListener('click', () => websiteDialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = document.querySelector('#submit-project');
  const errorElement = document.querySelector('#form-error');
  errorElement.hidden = true;
  button.disabled = true;
  button.textContent = '正在提交…';
  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const result = await api('/api/projects', { method: 'POST', body: JSON.stringify(payload) });
    state.followTask = result.task.id;
    dialog.close();
    if (routeName() === 'tasks') await route();
    else location.hash = '/tasks';
    toast(result.created ? '研究已开始，完成后会打开报告' : '该产品已有任务，正在继续处理');
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = '开始研究';
  }
});

websiteForm.addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  const errorElement = document.querySelector('#website-error');
  button.disabled = true;
  errorElement.hidden = true;
  try {
    const result = await api(`/api/projects/${encodeURIComponent(websiteProjectId)}/website`, {method:'POST',body:JSON.stringify({url:document.querySelector('#website-url').value})});
    state.followTask = result.task.id;
    websiteDialog.close();
    location.hash = '/tasks';
    toast('官网已补充，正在采集资料并生成新版本');
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.hidden = false;
  } finally { button.disabled = false; }
});

window.addEventListener('hashchange', route);
route();
if (!publicSnapshot) pollTasks();
