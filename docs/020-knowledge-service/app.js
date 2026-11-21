import { renderProductView } from './product-view.js';
import { renderAssistantMessage } from './message-parts.js';
import { renderGuideView, renderCapabilityResults, guideTabs } from './guide-view.js';
import { renderResearchView } from './research-view.js';

const browserDemo = document.documentElement.dataset.runtime === 'browser-demo';
const request = browserDemo ? await (async () => {
  const [{ createBrowserDemoTransport }, engine, data] = await Promise.all([
    import('./browser-demo.js'), import('./runtime/engine.mjs'), import('./runtime/data.mjs')
  ]);
  return createBrowserDemoTransport({ ...engine, catalog: { documents: data.documents, scenarios: data.scenarios, tools: data.tools, nodes: data.architectureNodes, cases: data.evaluationCases } });
})() : (url, options) => fetch(url, options);

const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  message: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5A8.5 8.5 0 0 1 10.5 3h2a8.5 8.5 0 0 1 8.5 8.5Z"/><path d="M7 10h9M7 14h5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  chart: '<path d="M4 3v18h17M9 16v-5M14 16V7M19 16v-8"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4M18 4h4"/>',
  git: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="19" r="2"/><path d="M6 7v10M18 8c0 5-12 3-12 8"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  headphones: '<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12H3v7h4v-7H4ZM20 12h1v7h-4v-7h3ZM19 19c0 3-4 3-7 3"/>',
  book: '<path d="M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1ZM12 5v15"/>',
  box: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9M7 5.8l10 5.4"/>',
  activity: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  return: '<path d="M8 3 3 8l5 5M3 8h11a7 7 0 0 1 0 14h-3"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  refresh: '<path d="M20 8a9 9 0 1 0 1 7M20 3v6h-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  code: '<path d="m8 5-7 7 7 7M16 5l7 7-7 7M14 3l-4 18"/>',
  send: '<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  play: '<path d="m8 4 13 8-13 8V4Z"/>',
  link: '<path d="m9 15 6-6M7 17l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M17 7l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(1 0) scale(.92)"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const views = { research: ['研究摘要', 'book'], overview: ['架构总览', 'grid'], product: ['产品落地', 'box'], guide: ['实施全景', 'layers'], playground: ['对话试验台', 'message'], resources: ['知识与工具', 'book'], evaluation: ['流程评测', 'chart'] };
const routeColors = { fast: 'blue', deep: 'violet', clarify: 'blue', confirmation: 'orange', human: 'slate', denied: 'orange', unknown: 'slate', completed: 'green', cancelled: 'slate' };
const state = { catalog: null, session: null, mode: localStorage.getItem('flowdesk-mode') === 'single' ? 'single' : 'dual', view: 'overview', node: 'router', busy: false, trace: [], draft: '', partial: '', progress: '', currentNode: null, lastResult: null, resourceTab: 'knowledge', query: '', evaluation: null, evaluating: false, diagram: 'mechanism', productTab: 'scenario', caseStep: 0, guideTab: 'overview', guideStatus: 'all', guideCategory: 'all', guideQuery: '' };
const $ = selector => document.querySelector(selector);

async function api(url, options = {}) {
  const response = await request(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '本地服务暂时不可用');
  return data;
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
}
function switchView(route) {
  const [view, section] = String(route || '').replace(/^#/, '').split('/');
  state.view = views[view] ? view : 'research';
  if (state.view === 'guide' && section) state.guideTab = guideTabs.some(([id]) => id === section) ? section : 'overview';
  const hash = state.view === 'guide' ? `#guide/${state.guideTab}` : `#${state.view}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
  render();
}
function modeControl() {
  return `<div class="mode-control" role="group" aria-label="模型策略"><button data-mode="single" aria-pressed="${state.mode === 'single'}" ${state.busy ? 'disabled' : ''}>单模型</button><button data-mode="dual" aria-pressed="${state.mode === 'dual'}" ${state.busy ? 'disabled' : ''}>${icon('git')}双模型路由</button></div>`;
}
function pageHeader(eyebrow, title, subtitle, right = '') {
  return `<section class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><div class="heading-actions">${right}</div></section>`;
}
function statusPill(route, label) { return `<span class="pill ${routeColors[route] || 'slate'}"><span class="pill-dot"></span>${escape(label)}</span>`; }
function render() {
  if (!state.catalog) return;
  $('#navigation').innerHTML = Object.entries(views).map(([key, [label, glyph]]) => `<button data-view="${key}" aria-label="${label}" title="${label}" class="nav-item ${state.view === key ? 'active' : ''}" ${state.view === key ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span>${key === 'playground' ? '<span class="nav-badge">LIVE</span>' : ''}</button>`).join('');
  $('#breadcrumb-title').textContent = views[state.view][0];
  $('#main').innerHTML = ({ research: () => renderResearchView({ ...state, browserDemo }, { icon, escape, pageHeader }), overview: overview, product: () => renderProductView(state, { icon, escape, pageHeader }), guide: () => renderGuideView(state, { icon, escape, pageHeader }), playground: playground, resources: resources, evaluation: evaluation })[state.view]();
  if (state.view === 'playground') scrollChat();
}

function overview() {
  return `${pageHeader('THE SUPPORT BLUEPRINT', '每次对话，都有清晰的下一步。', '把知识、工具、模型与人工串成一条可观察的客服工作流。', modeControl())}
    <div class="overview-metrics"><div class="metric"><span class="metric-icon blue">${icon('git')}</span><div><span class="metric-label">当前模型策略</span><strong>${state.mode === 'dual' ? '快慢分流' : '统一主模型'}<small>${state.mode === 'dual' ? 'Demo Fast + Demo Deep' : 'Demo Main · 两种处理配置'}</small></strong></div><span class="metric-tag">可切换</span></div><div class="metric"><span class="metric-icon green">${icon('layers')}</span><div><span class="metric-label">业务能力底座</span><strong>${state.catalog.documents.length} <span class="metric-unit">份文档</span><span class="metric-split">/</span>${state.catalog.tools.length} <span class="metric-unit">个工具</span><small>文档有出处，接口有边界</small></strong></div></div><div class="metric"><span class="metric-icon violet">${icon('shield')}</span><div><span class="metric-label">执行边界</span><strong>规则校验 + 用户确认<small>人工接管后暂停自动办理</small></strong></div></div></div>
    <div class="implementation-strip"><p><strong>从原理进入实施。</strong>按知识建设、模型协作、客服闭环和上线验收逐项展开，也可对照当前可运行范围。</p><button class="secondary-button" data-guide-tab="capabilities">查看能力对照</button><button class="primary-button" data-guide-tab="overview">阅读实施全景</button></div>
    ${blueprintPanel()}
    <section class="panel architecture-panel"><div class="panel-heading"><div><span class="section-icon">${icon('git')}</span><h2>客服工作流</h2><span class="quiet-badge">交互式架构</span></div><span class="muted small">点击节点，查看职责与边界</span></div><div class="architecture-content"><div class="graph-area">${graph()}<div class="graph-legend"><span><i class="legend-line blue"></i>快速处理</span><span><i class="legend-line violet"></i>深入处理</span><span><i class="legend-line dashed"></i>知识与业务证据</span><span><i class="legend-line slate"></i>人工接管</span></div></div><aside class="inspector" aria-label="节点说明">${inspector()}</aside></div></section>
    <section class="scenarios-section"><div class="section-title"><div><p class="eyebrow">TRY A REAL FLOW</p><h2>从一个问题开始，观察整条路径。</h2></div><button class="text-button" data-view="playground">打开试验台 ${icon('arrow')}</button></div><div class="scenario-grid">${state.catalog.scenarios.map(s => `<button class="scenario-card" data-scenario="${s.id}" ${state.busy ? 'disabled' : ''}><span class="scenario-icon ${s.color}">${icon(s.icon)}</span><span class="scenario-label">${s.label}</span><strong>${s.title}</strong><span class="scenario-hint">${s.hint}</span><span class="scenario-arrow">${icon('arrow')}</span></button>`).join('')}</div></section>
    <div class="architecture-note">${icon('code')}<p><strong>先验证流程，再评估模型。</strong>当前为本地确定性演示；两种模式共用业务规则，切换模式只改变模型适配器选择。</p><button data-open-notes class="text-button">设计说明 ${icon('chevron')}</button></div>`;
}
function blueprintPanel() {
  const mechanism = state.diagram === 'mechanism';
  const file = mechanism ? 'mechanism' : 'value';
  return `<section class="panel blueprint-panel"><div class="blueprint-panel-heading"><div><span class="eyebrow">FROM KNOWLEDGE TO SERVICE</span><h2>把模型分工和交流体感放在同一张图里。</h2><p>从原理看全局，再用一笔延迟订单展开产品如何落地。</p></div><button class="primary-button" data-view="product">看产品落地 ${icon('arrow')}</button></div><div class="blueprint-toolbar"><div class="tabs" role="group" aria-label="架构图片"><button data-diagram="mechanism" aria-pressed="${mechanism}">双模型协作机制</button><button data-diagram="value" aria-pressed="${!mechanism}">知识库与团队价值</button></div><button class="text-button" data-open-blueprint="${file}">${icon('search')} 放大查看</button></div><button class="blueprint-preview" data-open-blueprint="${file}" aria-label="放大${mechanism ? '双模型协作机制图' : '知识库与团队价值图'}"><img src="./assets/knowledge-service-${file}.png" alt="${mechanism ? '两种模型共享证据、按任务分流、通过统一回复协调器输出，以及用户实际交流时间线' : '知识库与业务事实底座、客服业务架构、用户体验和团队价值'}" ${mechanism ? 'width="1585" height="992"' : 'width="1672" height="941"'}></button><div class="blueprint-caption"><span>目标架构说明图 · 当前程序使用演示适配器</span><button class="text-button" data-scenario="delay" ${state.busy ? 'disabled' : ''}>用订单延迟场景跑一遍 ${icon('arrow')}</button></div></section>`;
}
function openBlueprint(kind = 'mechanism') {
  const file = kind === 'value' ? 'value' : 'mechanism';
  const title = file === 'value' ? '知识库与团队价值' : '双模型协作与连续交流机制';
  $('#blueprint-dialog-title').textContent = title;
  $('#blueprint-dialog-image').src = `./assets/knowledge-service-${file}.png`;
  $('#blueprint-dialog-image').alt = title;
  $('#blueprint-original').href = `./assets/knowledge-service-${file}.png`;
  $('#blueprint-dialog').showModal();
}
function graph() {
  const nodes = state.catalog.nodes;
  return `<p class="graph-mobile-hint">← 左右滑动查看完整架构 · 点击节点查看说明 →</p><div class="graph-scroll"><div class="workflow-graph" data-route="${escape(state.lastResult?.route || '')}"><div class="graph-label top">标准咨询 / 事实查询</div><div class="graph-label bottom">复杂问题 / 多步排查</div><svg class="graph-edges" viewBox="0 0 900 435" fill="none" aria-hidden="true"><defs><marker id="arrow-neutral" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="m1 1 6 3-6 3"/></marker></defs><path class="edge" d="M185 213H234"/><path class="edge fast-edge" d="M391 213H409Q423 213 423 160V103Q423 91 441 91"/><path class="edge deep-edge" d="M391 213H409Q423 213 423 265V335Q423 347 441 347"/><path class="edge evidence-edge" d="M391 213H441"/><path class="edge fast-edge" d="M598 91H623Q648 91 648 138V192Q648 213 675 213"/><path class="edge deep-edge" d="M598 347H623Q648 347 648 294V234Q648 213 675 213"/><path class="edge evidence-edge" d="M520 174V132M520 252V307"/><path class="edge human-edge" d="M753 252V324"/></svg>${nodes.map(n => `<button class="workflow-node node-${n.id} ${state.node === n.id ? 'selected' : ''} ${state.currentNode === n.id ? 'running' : ''}" data-node="${n.id}" aria-pressed="${state.node === n.id}"><span class="node-icon">${icon(n.icon)}</span><span><small>${n.kicker}</small><strong>${n.title}</strong></span>${state.currentNode === n.id ? '<span class="node-pulse"></span>' : ''}</button>`).join('')}<span class="graph-endpoint">用户消息</span><span class="graph-caption">${state.mode === 'single' ? '同一主模型 · 两种处理配置' : '按任务分流 · 共用执行边界'}</span></div></div>`;
}
function inspector() {
  const node = state.catalog.nodes.find(n => n.id === state.node);
  return `<span class="inspector-kicker">节点说明 <span>${String(state.catalog.nodes.indexOf(node) + 1).padStart(2, '0')} / 07</span></span><div class="inspector-title"><span class="node-icon">${icon(node.icon)}</span><h3>${node.title}</h3></div><p class="inspector-description">${node.description}</p><div class="io-row"><span>输入</span><p>${node.inputs}</p></div><div class="io-row"><span>输出</span><p>${node.outputs}</p></div><div class="rule-title">设计约束</div><ul class="rule-list">${node.rules.map(r => `<li>${icon('check')}<span>${r}</span></li>`).join('')}</ul><button class="inspector-cta" data-view="playground">在对话中观察 ${icon('arrow')}</button>`;
}

function playground() {
  const owner = state.session?.owner === 'human';
  return `${pageHeader('CONVERSATION PLAYGROUND', '把架构，放进一次真实的流程。', '发送消息，观察路由、证据与执行边界。模型回复为演示适配器生成。', modeControl())}
    <div class="playground-layout"><aside class="panel scenario-picker"><div class="mini-heading">演示场景<span>${String(state.catalog.scenarios.length).padStart(2, '0')}</span></div>${state.catalog.scenarios.map(s => `<button data-scenario="${s.id}" class="scenario-option" ${state.busy ? 'disabled' : ''}><span class="scenario-icon ${s.color}">${icon(s.icon)}</span><span><strong>${s.label}</strong><small>${s.title}</small></span>${icon('chevron')}</button>`).join('')}<div class="picker-note">${icon('refresh')}<p>每个预设开启独立会话。<br>直接输入可继续当前对话。</p></div><div class="demo-orders"><span class="tiny-label">可用演示订单</span><p><code>SF-1024</code> 已签收 · 可申请退款</p><p><code>SF-2048</code> 运输中 · 可查询物流</p><p><code>SF-3096</code> 超时未到 · 可发起催查</p><p><code>SF-9999</code> 用于测试权限拦截</p></div></aside>
    <section class="panel conversation"><div class="conversation-heading"><div><span class="bot-logo">${icon('sparkles')}</span><span><strong>Flow 客服助手</strong><small><span class="status-dot ${owner ? 'orange-dot' : ''}"></span>${owner ? '人工持有 · 机器人已暂停' : '演示适配器 · 随时可以开始'}</small></span></div><button class="icon-button" data-reset ${state.busy ? 'disabled' : ''} title="新建会话" aria-label="新建会话">${icon('refresh')}</button></div><div class="chat-messages" id="chat-messages" role="log" aria-label="对话记录">${messages()}${state.busy ? draftMessage() : ''}</div>${owner ? `<div class="handoff-banner">${icon('headphones')}<span>人工接管中 · 新消息只追加至演示工单，不调用模型。</span></div>` : ''}<form id="chat-form" class="composer"><label class="sr-only" for="message-input">输入客服问题</label><textarea id="message-input" name="message" rows="2" maxlength="2000" placeholder="问一个问题，或试试“查订单 SF-2048”" ${state.busy ? 'disabled' : ''}>${escape(state.draft)}</textarea><div class="composer-bottom"><span>Enter 发送 · Shift + Enter 换行</span><button class="send-button" type="submit" ${state.busy ? 'disabled' : ''} aria-label="发送消息">${state.busy ? '<span class="spinner"></span>' : icon('send')}</button></div></form><div class="chat-disclaimer">纯演示数据 · 不连接真实模型与订单 · 会话重启失效</div></section>
    <aside class="panel execution-panel"><div class="mini-heading">执行追踪<span class="trace-indicator ${state.busy ? 'live' : ''}">${state.busy ? '执行中' : '可观察'}</span></div><p class="trace-description">这里只记录操作与结果，不展示模型思维链。</p><div id="trace-content">${traceContent()}</div></aside></div>`;
}
function messages() {
  const list = state.session?.messages || [];
  if (!list.length) return `<div class="chat-welcome"><span class="welcome-mark">${icon('message')}</span><span class="eyebrow">HELLO, LET’S SOLVE IT.</span><h2>一次对话，<br>看懂客服如何工作。</h2><p>从左侧选择场景，或输入你的问题。<br>右侧会同步展示每一步执行结果。</p><div class="welcome-chips"><span>${icon('book')}有依据</span><span>${icon('shield')}有边界</span><span>${icon('headphones')}可接管</span></div></div>`;
  return list.map(m => m.role === 'user' ? `<article class="chat-message user"><div class="message-avatar">你</div><div class="message-body"><div class="message-name">你</div><div class="message-text">${escape(m.content)}</div></div></article>` : assistantMessage(m)).join('');
}
function assistantMessage(m) { return renderAssistantMessage(m, state, { icon, escape, statusPill }); }
function draftMessage() {
  return `<article class="chat-message assistant draft-message"><div class="message-avatar">${icon('sparkles')}</div><div class="message-body"><div class="message-name">Flow 助手 <span class="thinking-label">${state.partial ? '正在回复' : '正在处理'}</span></div><div class="message-text" id="stream-text">${state.partial ? escape(state.partial) : state.progress ? escape(state.progress) : '<span class="typing-dots"><i></i><i></i><i></i></span>'}</div></div></article>`;
}
function humanFacingProgress(entry) {
  if (entry.tool === 'get_order') return '演示订单查询已返回，正在核对结果与访问范围。';
  if (entry.tool === 'get_tracking') return '已取得演示物流快照，接下来核对适用的处理规则。';
  if (entry.tool === 'search_knowledge') return '已检索演示资料，正在核对事实与可采取的下一步。';
  if (entry.node === 'deep') return '正在综合核对演示事实与规则；结论准备好后会统一说明。';
  if (entry.node === 'human') return '正在整理演示交接记录与下一步。';
  if (entry.node === 'policy') return '正在核对本次操作的条件与确认状态。';
  return '已收到，正在按当前演示流程处理。';
}
function traceContent() {
  if (!state.trace.length) return `<div class="trace-empty">${icon('git')}<strong>等待一次请求</strong><p>路由选择、知识检索与工具结果<br>将在这里依次出现。</p></div><div class="trace-key"><span class="tiny-label">模型策略</span><strong>${state.mode === 'dual' ? 'Demo Fast / Demo Deep' : 'Demo Main'}</strong><p>演示适配器，不计真实模型耗时与费用。</p></div>`;
  return `<div class="trace-timeline">${state.trace.map((t, i) => `<div class="trace-entry ${state.busy && i === state.trace.length - 1 ? 'current' : ''}"><span class="trace-point">${icon('check')}</span><div class="trace-entry-heading"><strong>${escape(t.label)}</strong><small>${t.elapsedMs} ms</small></div><p>${escape(t.summary)}</p>${t.tool ? `<code>${escape(t.tool)}</code>` : ''}</div>`).join('')}</div>${!state.busy && state.lastResult ? `<div class="trace-result"><span class="tiny-label">处理结果</span>${statusPill(state.lastResult.route, state.lastResult.routeLabel)}<p>${state.lastResult.model ? `${escape(state.lastResult.model.label)} · ${escape(state.lastResult.model.effort)}` : '规则流程 · 未调用模型适配器'}<br>含演示动画的流程耗时 ${state.lastResult.elapsedMs} ms</p></div>` : ''}${state.session?.ticket ? ticketCard() : ''}`;
}
function ticketCard() {
  const ticket = state.session.ticket;
  return `<div class="ticket-card"><div>${icon('headphones')}<strong>交接摘要</strong></div><code>${escape(ticket.id)}</code><p><b>原因</b>${escape(ticket.reason)}</p><p><b>诉求</b>${escape(ticket.summary)}</p><p><b>已核实</b>${ticket.facts.map(escape).join('；')}</p><p><b>已执行</b>${ticket.actions.length ? ticket.actions.map(escape).join('；') : '无业务写入'}</p><p><b>下一步</b>${escape(ticket.next)}</p>${ticket.notes.length ? `<p><b>补充消息</b>${ticket.notes.map(escape).join('；')}</p>` : ''}</div>`;
}

function resources() {
  const docs = state.catalog.documents.filter(d => `${d.title}${d.category}${d.content}`.includes(state.query));
  return `${pageHeader('KNOWLEDGE & TOOLS', '让每个回答有据可查。', '区分文档依据、业务事实与执行权限，为客服建立可靠的能力底座。', '<span class="outline-badge">本地演示目录</span>')}
    <div class="resource-toolbar"><div class="tabs" role="group" aria-label="资源类别"><button data-resource-tab="knowledge" aria-pressed="${state.resourceTab === 'knowledge'}">知识文档 <span>${state.catalog.documents.length}</span></button><button data-resource-tab="tools" aria-pressed="${state.resourceTab === 'tools'}">业务工具 <span>${state.catalog.tools.length}</span></button><button data-resource-tab="policy" aria-pressed="${state.resourceTab === 'policy'}">执行策略</button></div>${state.resourceTab === 'knowledge' ? `<label class="search-input">${icon('search')}<input id="knowledge-search" aria-label="搜索知识文档" placeholder="搜索文档或内容…" value="${escape(state.query)}"></label>` : ''}</div>
    ${state.resourceTab === 'knowledge' ? `<div class="knowledge-layout"><section class="knowledge-list" id="knowledge-list">${documentCards(docs)}</section><aside class="panel evidence-guide"><span class="guide-icon">${icon('book')}</span><span class="eyebrow">SOURCE OF TRUTH</span><h2>给事实，一个明确的出处。</h2><p>政策与使用说明来自已发布文档；订单和服务状态来自工具。模型负责理解与表达，不能自行创造业务事实。</p><div class="guide-step"><span>01</span><p><strong>检索</strong>按问题找到适用资料</p></div><div class="guide-step"><span>02</span><p><strong>核对</strong>检查版本与适用范围</p></div><div class="guide-step"><span>03</span><p><strong>引用</strong>把来源带入最终回答</p></div><div class="notice">本演示使用关键词检索。生产环境可接全文与向量混合检索，并增加租户隔离、更新与撤回机制。</div></aside></div>` : state.resourceTab === 'tools' ? `<div class="panel tool-table-wrap"><table class="data-table tool-table"><thead><tr><th>工具</th><th>类型</th><th>执行边界</th><th>职责</th></tr></thead><tbody>${state.catalog.tools.map(t => `<tr><td><strong>${t.title}</strong><code>${t.id}</code></td><td><span class="pill ${t.type === '写入' ? 'orange' : 'green'}">${t.type}</span></td><td>${t.permission}</td><td>${t.description}</td></tr>`).join('')}</tbody></table></div><div class="architecture-note">${icon('lock')}<p>正式接入时，用服务端登录身份替换 DEMO-01。工具授权、参数校验与幂等控制始终留在服务端。</p></div>` : policyCards()}`;
}
function documentCards(docs) {
  if (!docs.length) return '<div class="panel no-results">未找到匹配文档。试试“退款”或“同步”。</div>';
  return docs.map(d => `<article class="panel document-card" id="doc-${d.id}"><div class="document-top"><span class="document-category">${icon('book')}${d.category}</span><span class="published"><span class="status-dot"></span>已发布 · 演示</span></div><h2>${d.title}</h2><p>${escape(d.content)}</p><div class="document-meta"><code>${d.id}</code><span>${d.version}</span><span>生效 ${d.date}</span><button class="text-button" data-test-document="${d.id}">测试这份知识 ${icon('arrow')}</button></div></article>`).join('');
}
function policyCards() {
  const items = [
    ['shield', '01', '身份归属在服务端检查', '订单不存在与无权访问使用一致提示，避免泄露订单存在性。模型输出不能更改当前身份。'],
    ['check', '02', '写操作先确认，再复核', '用户确认令牌绑定订单、金额和会话。执行前重新检查资格，重复确认返回同一个申请。'],
    ['headphones', '03', '人工与机器人持有权互斥', '接管后使待确认操作失效，并停止自动办理。后续消息只进入交接工单。'],
    ['book', '04', '缺少证据就补齐或交接', '没有资料不编造政策，缺订单号先追问。换一个模型无法补上不存在的业务事实。']
  ];
  return `<div class="policy-grid">${items.map(([glyph, number, title, body]) => `<article class="panel policy-card"><div><span class="policy-icon">${icon(glyph)}</span><span>${number}</span></div><h2>${title}</h2><p>${body}</p></article>`).join('')}</div><div class="notice wide-notice">这是可运行的流程骨架。生产环境仍需补齐真实登录与租户权限、持久化、外部工具超时与重试、隐私规则、监控及模型质量评测。</div>`;
}

function evaluation() {
  const result = state.evaluation;
  return `${pageHeader('WORKFLOW EVALUATION', '先验证边界，再优化智能。', '用固定案例检查路由、来源与工具调用；此处不评测真实模型回答质量。', `<button class="primary-button" data-evaluate ${state.evaluating ? 'disabled' : ''}>${state.evaluating ? '<span class="spinner"></span>' : icon('play')}${state.evaluating ? '正在运行' : '运行流程回归'}</button>`)}
    <div class="evaluation-top"><div class="panel eval-summary"><span class="tiny-label">流程通过</span><strong>${result ? `${result.passed}<span> / ${result.total}</span>` : '—<span> / ' + state.catalog.cases.length + '</span>'}</strong><p>${result ? '已执行的确定性流程检查' : '等待运行，暂无测试结果'}</p></div><div class="panel eval-summary"><span class="tiny-label">测试策略</span><strong class="strategy-value">${result ? result.mode === 'single' ? '单模型' : '双模型路由' : state.mode === 'single' ? '单模型' : '双模型路由'}</strong><p>每个案例都使用独立演示会话</p></div><div class="panel eval-explainer">${icon('chart')}<div><h3>正确路由，只是第一步。</h3><p>接入真实模型后，再评测解决率、错误承诺率、转人工率、P95 响应时间与单次解决成本。</p></div></div></div>
    <div class="evaluation-toolbar"><h2>回归案例 <span class="quiet-badge">${state.catalog.cases.length} cases</span></h2>${modeControl()}</div><div class="panel evaluation-table-wrap"><table class="data-table evaluation-table"><thead><tr><th>检查项</th><th>输入</th><th>预期路径</th><th>实际结果</th><th>状态</th></tr></thead><tbody>${state.catalog.cases.map((c, i) => { const row = result?.results.find(r => r.id === c.id); return `<tr><td><span class="case-number">${String(i + 1).padStart(2, '0')}</span><strong>${c.title}</strong></td><td>${escape(c.message)}</td><td>${routeLabel(c.expected)}</td><td>${row ? row.actualLabel : '<span class="muted">—</span>'}</td><td>${row ? `<span class="test-status ${row.passed ? 'passed' : 'failed'}">${icon(row.passed ? 'check' : 'activity')}${row.passed ? '通过' : '失败'}</span>` : '<span class="muted">待运行</span>'}</td></tr>`; }).join('')}</tbody></table></div><div class="architecture-note">${icon('code')}<p>浏览器回归覆盖路径选择。另有 Node 自动化测试验证确认令牌、重复执行、跨会话隔离与人工接管，可在项目目录运行 <code>npm test</code>。</p></div>`;
}
function routeLabel(route) { return ({ fast: '快速处理', deep: '深入处理', clarify: '补齐信息', denied: '权限拦截', confirmation: '等待确认', human: '人工接管', unknown: '证据不足' })[route] || route; }
function scrollChat() { const el = $('#chat-messages'); if (el) el.scrollTop = el.scrollHeight; }

async function newSession() {
  state.session = await api('/api/sessions', { method: 'POST' });
  sessionStorage.setItem('flowdesk-session', state.session.id);
  state.trace = []; state.lastResult = null; state.partial = ''; state.progress = ''; state.currentNode = null; state.draft = '';
}
async function runScenario(id) {
  if (state.busy) return;
  const scenario = state.catalog.scenarios.find(s => s.id === id);
  if (!scenario) return;
  state.busy = true; switchView('playground');
  try { await newSession(); state.busy = false; await send(scenario.message); }
  catch (error) { state.busy = false; toast(error.message); render(); }
}
async function send(message, action, actionId) {
  if (state.busy || (!action && !message?.trim())) return;
  state.busy = true; state.partial = ''; state.progress = '已收到，正在按当前演示流程处理。'; state.trace = []; state.draft = ''; state.lastResult = null;
  if (!action) state.session.messages.push({ role: 'user', content: message.trim() });
  render();
  let complete = false;
  try {
    const response = await request('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: state.session.id, message, action, actionId, mode: state.mode }) });
    if (!response.ok) throw new Error((await response.json()).error || '请求失败');
    const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
    const event = data => {
      if (data.type === 'error') throw new Error(data.error);
      if (data.type === 'trace') {
        state.trace.push(data.entry); state.currentNode = data.entry.node;
        state.progress = humanFacingProgress(data.entry);
        const traceEl = $('#trace-content'); if (traceEl) traceEl.innerHTML = traceContent();
        const streamEl = $('#stream-text'); if (streamEl && !state.partial) streamEl.textContent = state.progress;
        document.querySelectorAll('.workflow-node').forEach(node => node.classList.toggle('running', node.dataset.node === data.entry.node));
      }
      if (data.type === 'token') {
        state.partial += data.text;
        const el = $('#stream-text'); if (el) el.textContent = state.partial;
        scrollChat();
      }
      if (data.type === 'complete') {
        complete = true; state.lastResult = data.result; state.session.messages.push(data.result);
        state.session.owner = data.result.owner; state.session.ticket = data.result.ticket;
        state.session.pendingAction = data.result.confirmation || null;
        // 查询等普通消息不清除现有待确认项；以服务端会话为最终事实。
      }
    };
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split('\n'); buffer = lines.pop();
      for (const line of lines) if (line.trim()) event(JSON.parse(line));
      if (done) break;
    }
    if (buffer.trim()) event(JSON.parse(buffer));
    if (!complete) throw new Error('连接中断，请重新查询会话状态。');
  } catch (error) { toast(error.message); }
  finally {
    try { state.session = await api(`/api/sessions/${state.session.id}`); } catch (error) { toast(error.message); }
    state.busy = false; state.currentNode = null; state.partial = ''; state.progress = ''; render();
  }
}

document.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button || button.disabled) return;
  if (button.hasAttribute('data-open-notes')) $('#notes-dialog').showModal();
  if (button.hasAttribute('data-close-notes')) $('#notes-dialog').close();
  if (button.hasAttribute('data-open-blueprint')) openBlueprint(button.dataset.openBlueprint);
  if (button.hasAttribute('data-close-blueprint')) $('#blueprint-dialog').close();
  if (button.dataset.diagram) { state.diagram = button.dataset.diagram === 'value' ? 'value' : 'mechanism'; render(); }
  if (button.dataset.productTab) { state.productTab = button.dataset.productTab; render(); }
  if (button.hasAttribute('data-case-step')) { state.caseStep = Math.max(0, Number(button.dataset.caseStep) || 0); render(); }
  if (button.dataset.guideTab) switchView(`guide/${button.dataset.guideTab}`);
  if (button.hasAttribute('data-reset-guide-filters')) { state.guideStatus = 'all'; state.guideCategory = 'all'; state.guideQuery = ''; render(); }
  if (button.dataset.view) switchView(button.dataset.view);
  if (button.dataset.node) { state.node = button.dataset.node; render(); }
  if (button.dataset.mode && !state.busy) { state.mode = button.dataset.mode; localStorage.setItem('flowdesk-mode', state.mode); render(); }
  if (button.dataset.scenario) await runScenario(button.dataset.scenario);
  if (button.hasAttribute('data-reset') && !state.busy) { try { await newSession(); render(); toast('已开启独立演示会话'); } catch (error) { toast(error.message); } }
  if (button.dataset.action) await send(undefined, button.dataset.action, button.dataset.actionId);
  if (button.dataset.queryLogistics) await send(`查询订单 ${button.dataset.queryLogistics} 的催查进度`);
  if (button.dataset.resourceTab) { state.resourceTab = button.dataset.resourceTab; state.query = ''; render(); }
  if (button.dataset.source) { state.resourceTab = 'knowledge'; state.query = ''; switchView('resources'); document.getElementById(`doc-${button.dataset.source}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  if (button.dataset.testDocument) await runScenario(({ shipping: 'faq', refund: 'refund', sync: 'technical', handoff: 'human', delivery_exception: 'delay' })[button.dataset.testDocument]);
  if (button.hasAttribute('data-evaluate')) {
    state.evaluating = true; render();
    try { state.evaluation = await api('/api/evaluate', { method: 'POST', body: JSON.stringify({ mode: state.mode }) }); toast(`流程回归完成：${state.evaluation.passed}/${state.evaluation.total} 通过`); }
    catch (error) { toast(error.message); }
    finally { state.evaluating = false; render(); }
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'message-input') state.draft = event.target.value;
  if (event.target.id === 'guide-search') {
    state.guideQuery = event.target.value;
    const result = $('#guide-capability-results');
    if (result) result.innerHTML = renderCapabilityResults(state, { escape });
  }
  if (event.target.id === 'knowledge-search') {
    state.query = event.target.value;
    $('#knowledge-list').innerHTML = documentCards(state.catalog.documents.filter(d => `${d.title}${d.category}${d.content}`.includes(state.query)));
  }
});
document.addEventListener('change', event => {
  if (event.target.id === 'guide-section') switchView(`guide/${event.target.value}`);
  if (event.target.id === 'guide-status' || event.target.id === 'guide-category') {
    if (event.target.id === 'guide-status') state.guideStatus = event.target.value;
    else state.guideCategory = event.target.value;
    const result = $('#guide-capability-results');
    if (result) result.innerHTML = renderCapabilityResults(state, { escape });
  }
});
document.addEventListener('submit', event => { if (event.target.id === 'chat-form') { event.preventDefault(); send(state.draft); } });
document.addEventListener('keydown', event => { if (event.target.id === 'message-input' && event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); send(state.draft); } });
window.addEventListener('hashchange', () => switchView(location.hash.slice(1)));
$('#notes-dialog').addEventListener('click', event => { if (event.target === $('#notes-dialog')) { const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); } });
$('#blueprint-dialog').addEventListener('click', event => { if (event.target === $('#blueprint-dialog')) { const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); } });

async function initialize() {
  try {
    state.catalog = await api('/api/catalog');
    const id = sessionStorage.getItem('flowdesk-session');
    if (id) { try { state.session = await api(`/api/sessions/${id}`); } catch { await newSession(); } }
    else await newSession();
    const latest = [...state.session.messages].reverse().find(m => m.role === 'assistant');
    if (latest) { state.lastResult = latest; state.trace = latest.trace || []; }
    switchView(location.hash.slice(1));
  } catch (error) {
    $('#main').innerHTML = `<div class="loading-state"><h1>暂时无法连接本地服务</h1><p>${escape(error.message)}</p><p>请在项目目录运行 npm start，然后刷新页面。</p></div>`;
  }
}
initialize();
