import { implementationGuide } from './implementation-guide.js';
import { operationsGuide } from './operations-guide.js';
import { capabilityMap } from './capability-map.js';

export const guideTabs = [
  ['overview', '全流程'], ['capabilities', '能力对照'], ['knowledge', '建库流程'],
  ['routing', '模型路由'], ['conversation', '交流状态'], ['tickets', '工单闭环'],
  ['operations', '运营协作'], ['deployment', '系统数据'], ['rollout', '试点验收']
];
const statusLabels = { implemented: '已实现', demo: '演示', planned: '待开发' };
const glyphs = { overview: 'layers', capabilities: 'grid', knowledge: 'book', routing: 'git', conversation: 'message', tickets: 'box', operations: 'headphones', deployment: 'code', rollout: 'chart' };

export function renderGuideView(state, helpers) {
  const { icon, escape: e, pageHeader } = helpers;
  const tab = guideTabs.some(([id]) => id === state.guideTab) ? state.guideTab : 'overview';
  const context = { icon, e, state, helpers };
  const renderers = { overview: overview, capabilities: capabilities, knowledge: knowledge, routing: routing, conversation: conversation, tickets: tickets, operations: operations, deployment: deployment, rollout: rollout };
  return `<div class="g-page">${pageHeader('THE COMPLETE IMPLEMENTATION GUIDE', '从知识建设，到客服业务闭环。', '把每一段拆成负责人、输入、执行动作、产物和验收条件，再对照当前程序看清下一步。', '<button class="primary-button" data-guide-tab="capabilities">查看能力对照</button>')}
    <div class="g-current-stage"><span>${icon('shield')} 当前阶段：本地流程演示</span><p>本页补充实施说明。标记“已实现”仅代表相应机制在当前本地程序运行；真实模型、真实业务接入及生产上线另行验收。</p></div>
    <nav class="g-topic-nav" aria-label="实施主题">${guideTabs.map(([id, label]) => `<button data-guide-tab="${id}" aria-current="${id === tab ? 'page' : 'false'}">${icon(glyphs[id])}${label}</button>`).join('')}</nav>
    <label class="g-mobile-nav">选择实施主题<span class="g-select-shell"><select id="guide-section" aria-label="选择实施主题">${guideTabs.map(([id, label]) => `<option value="${id}" ${tab === id ? 'selected' : ''}>${label}</option>`).join('')}</select>${icon('chevron')}</span></label>
    <section class="g-content" aria-label="${e(guideTabs.find(([id]) => id === tab)[1])}">${renderers[tab](context)}</section>
  </div>`;
}

function heading(title, description, e) { return `<div class="g-heading"><h2>${e(title)}</h2>${description ? `<p>${e(description)}</p>` : ''}</div>`; }
function panel(title, body, cls = '') { return `<section class="panel g-panel ${cls}"><h3>${title}</h3>${body}</section>`; }
function text(value, e) { return `<p>${e(value ?? '')}</p>`; }
function list(items, e) { return `<ul class="g-list">${(items || []).map(item => `<li>${e(item)}</li>`).join('')}</ul>`; }
function table(labels, rows, cls = '') { return `<div class="g-table-wrap ${cls}" tabindex="0" role="region" aria-label="${labels.join('、')}对照表"><table class="g-table"><thead><tr>${labels.map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${rows.map(cells => `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
function fields(object, names, e) { return `<dl class="g-field-list">${names.filter(([key]) => object[key] != null).map(([key, label]) => `<dt>${label}</dt><dd>${Array.isArray(object[key]) ? list(object[key], e) : e(object[key])}</dd>`).join('')}</dl>`; }
function boundary(data, e) { return `<div class="g-boundary-grid"><div><span>当前程序</span>${text(data.current, e)}</div><div><span>目标实现</span>${text(data.target, e)}</div></div>`; }
function statusBadge(status) { return `<span class="g-status g-status-${status}">${statusLabels[status]}</span>`; }

function overview({ icon, e }) {
  const milestones = [
    ['knowledge', '建设可信知识', '原始资料经过审核与检索评测，才成为客服可引用的知识。'],
    ['routing', '选择处理能力', '按必要信息、证据与任务类型选择路径，并限制调用与升级。'],
    ['conversation', '保持连续交流', '统一会话状态、任务版本、必要追问、确认与回复顺序。'],
    ['tickets', '完成业务跟进', '从确认建单继续走到接单、处理反馈、解决、关闭与重开。'],
    ['operations', '让团队接得住', '明确知识运营、质检、坐席和业务负责人的日常动作。'],
    ['deployment', '接入可信系统', '把身份、数据、检索、任务和外部业务接口串成可恢复的服务。'],
    ['rollout', '用真实样本验收', '先建单模型基线，再对比双模型质量、体验和完整成本。']
  ];
  return `${heading('先看全链路，再决定从哪一段开工。', '下面是目标产品的实施顺序；每个主题均给出当前边界与可检查的交付产物。', e)}
    <div class="g-reading-flow">${milestones.map(([id, title, body]) => `<button data-guide-tab="${id}" class="panel g-reading-card"><span>${icon(glyphs[id])}</span><h3>${title}</h3><p>${body}</p><small>查看实施步骤</small></button>`).join('')}</div>
    <div class="g-feedback-loop">${icon('refresh')}<p><strong>把服务中的知识缺口送回审核队列。</strong>经负责人核对、测试和发布后更新知识；原始聊天和用户补充不会直接成为正式政策。</p></div>
    ${heading('先用能力对照，确认这次看到的是什么。', '三个状态针对具体能力标记，数量不等于产品完成率。', e)}
    ${definitionCards(e)}
    ${panel('建议阅读顺序', `<ol class="g-reading-list">${capabilityMap.readingPath.map(item => `<li><a href="${e(item.href)}"><strong>${e(item.title)}</strong><span>${e(item.description)}</span></a></li>`).join('')}</ol>`)}
    <div class="g-action-row"><button class="primary-button" data-guide-tab="capabilities">查看全部能力与下一步</button><button class="secondary-button" data-view="product">回到订单延迟场景</button></div>`;
}

function definitionCards(e) {
  return `<div class="g-definition-grid">${capabilityMap.statusDefinitions.map(item => `<div class="panel g-definition-card">${statusBadge(item.id)}<h3>${e(item.meaning)}</h3><p>${e(item.boundary)}</p><strong>${capabilityMap.matrix.filter(row => row.status === item.id).length}<span> 项具体能力</span></strong></div>`).join('')}</div>`;
}

function capabilities({ state, e, helpers }) {
  return `${heading('已实现、演示、待开发：逐项看边界。', '每行都说明当前能做什么、正式产品需要什么，以及交付责任与验收。已实现不代表已上线。', e)}
    ${definitionCards(e)}
    <div class="g-filters"><label>能力类别<span class="g-select-shell"><select id="guide-category" aria-label="筛选能力类别"><option value="all">全部类别</option>${capabilityMap.categories.map(category => `<option value="${e(category.id)}" ${state.guideCategory === category.id ? 'selected' : ''}>${e(category.label)}</option>`).join('')}</select>${helpers.icon('chevron')}</span></label><label>能力状态<span class="g-select-shell"><select id="guide-status" aria-label="筛选能力状态"><option value="all">全部状态</option>${capabilityMap.statusDefinitions.map(status => `<option value="${status.id}" ${state.guideStatus === status.id ? 'selected' : ''}>${e(status.label)}</option>`).join('')}</select>${helpers.icon('chevron')}</span></label><label class="g-search-label">搜索能力<input id="guide-search" type="search" aria-label="搜索能力" value="${e(state.guideQuery || '')}" placeholder="例如：知识、确认、并发"></label><button class="secondary-button" data-reset-guide-filters>重置筛选</button></div>
    <div id="guide-capability-results" aria-live="polite">${renderCapabilityResults(state, helpers)}</div>
    ${heading('8 步目标对话，对照当前可运行方式。', '“运行场景”启动的是受控演示流程；以下列出每一步与自然语言样例的对应关系。', e)}
    <div class="g-coverage-list">${capabilityMap.scenarioCoverage.map(step => `<details class="panel g-coverage"><summary><span>步骤 ${e(step.step)}</span><strong>${e(step.title)}</strong><span>查看运行边界</span></summary><div>${fields(step, [['targetDialogue', '目标对话'], ['runMethod', '当前运行方式'], ['currentLimit', '当前限制']], e)}</div></details>`).join('')}</div>
    <div class="g-action-row"><button class="primary-button" data-scenario="delay" ${state.busy ? 'disabled' : ''}>运行已接入的催查演示</button><button class="secondary-button" data-guide-tab="conversation">阅读连续交流的实现条件</button></div>`;
}

export function renderCapabilityResults(state, { escape: e }) {
  const query = (state.guideQuery || '').trim().toLocaleLowerCase();
  const rows = capabilityMap.matrix.filter(row => (state.guideStatus === 'all' || !state.guideStatus || row.status === state.guideStatus) && (state.guideCategory === 'all' || !state.guideCategory || row.category === state.guideCategory) && (!query || [row.title, row.current, row.target, row.nextStep, row.owner].join(' ').toLocaleLowerCase().includes(query)));
  if (!rows.length) return '<div class="g-no-results"><h3>没有匹配的能力</h3><p>换一个关键词，或重置类别与状态筛选。</p></div>';
  return `<p class="g-result-count">显示 ${rows.length} / ${capabilityMap.matrix.length} 项能力。展开最后一列，查看负责人、依据与验收。</p>${table(['能力', '状态', '当前程序与边界', '正式产品目标', '下一步与验收'], rows.map(row => [`<strong>${e(row.title)}</strong><span class="g-category-label">${e(capabilityMap.categories.find(c => c.id === row.category)?.label || row.category)}</span>`, statusBadge(row.status), e(row.current), e(row.target), `<details class="g-row-details"><summary>查看实施条件</summary>${fields(row, [['owner', '负责人'], ['nextStep', '下一步'], ['acceptance', '验收条件']], e)}<div class="g-code-evidence"><span>核对依据</span>${row.evidence.map(item => `<code>${e(item)}</code>`).join('')}</div></details>`]), 'g-matrix-wrap')}`;
}

function knowledge({ e }) {
  const data = implementationGuide.knowledge;
  return `${heading(data.title, data.summary, e)}${boundary(data, e)}
    <div class="g-process-list">${data.steps.map(step => `<article class="panel g-process-card"><div class="g-process-heading"><h3>${e(step.title)}</h3><span>${e(step.owner)}</span></div>${fields(step, [['input', '输入'], ['action', '执行动作'], ['output', '产物'], ['gate', '进入下一步的条件']], e)}</article>`).join('')}</div>
    ${heading('运行知识与拟建规范的映射', '当前运行库使用 src/data.mjs 的静态文档；产品页中的政策规范需要分别维护来源、审核状态与发布关系。', e)}
    ${table(['运行文档', '拟建规范与关系', '当前边界', '目标发布方式'], data.documentMap.map(row => [`<code>${e(row.runtimeId)}</code><strong>${e(row.runtimeTitle)}</strong>`, `<strong>${e(row.plannedPolicy)}</strong>${text(row.relationship, e)}`, e(row.current), e(row.target)]))}`;
}

function routing({ e }) {
  const data = implementationGuide.routing;
  return `${heading(data.title, data.summary, e)}${boundary(data, e)}
    ${table(['判定条件', '模型或责任方', '执行与退出', '预算边界'], data.decisions.map(row => [e(row.condition), e(row.modelOrOwner), `<strong>${e(row.action)}</strong>${text(row.exit, e)}`, e(row.budget)]))}
    ${heading('把模型选择写进可配置契约', '实际型号与预算在真实样本测试后填写；这些配置项尚未接入当前演示。', e)}
    ${table(['配置项', '要求', '当前程序', '目标约束'], data.modelConfig.map(row => [`<code>${e(row.field)}</code>`, e(row.requirement), e(row.current), e(row.target)]))}
    ${heading('模型交付结果，业务服务决定能否执行', '高能力模型的有效结果可以直接进入统一回复出口；权限与确认不由模型自行授予。', e)}
    ${table(['结果字段', '含义', '校验规则'], data.resultContract.map(row => [`<code>${e(row.field)}</code>`, e(row.meaning), e(row.rule)]))}
    <div class="g-rule-grid">${data.gates.map(rule => panel(e(rule.title), text(rule.rule, e))).join('')}</div>`;
}

function conversation({ e }) {
  const data = implementationGuide.conversation;
  return `${heading(data.title, data.summary, e)}${boundary(data, e)}
    ${heading('会话处于什么状态，用户可以做什么', '', e)}
    ${table(['状态', '用户输入', '目标行为', '当前演示'], data.states.map(row => [`<strong>${e(row.label)}</strong><code>${e(row.id)}</code>`, e(row.input), e(row.target), e(row.current)]))}
    ${heading('状态只在事件和条件满足时转移', '', e)}
    ${table(['起点', '事件', '条件', '终点与处理'], data.transitions.map(row => [`<code>${e(row.from)}</code>`, `<code>${e(row.event)}</code>`, e(row.guard), `<strong>${e(row.to)}</strong>${text(row.action, e)}`]))}
    ${heading('事件契约与实际传输方式', '', e)}
    ${table(['事件', '必要字段', '用途', '当前程序'], data.events.map(row => [`<code>${e(row.name)}</code>`, e(row.payload), e(row.purpose), e(row.current)]))}
    <div class="g-rule-grid">${data.transport.map(item => panel(e(item.type), fields(item, [['target', '目标选择'], ['current', '当前实现']], e))).join('')}</div>
    <div class="g-rule-grid">${data.rules.map(rule => panel(e(rule.title), fields(rule, [['target', '目标规则'], ['current', '当前边界']], e))).join('')}</div>
    ${heading('同一场景：分析中收到短信补充', '以下时序为目标设计；不表示当前聊天已经支持并发补充。', e)}
    ${table(['触发与版本', '用户可见', '后台处理', '当前边界'], data.timeline.map(row => [`<strong>${e(row.trigger)}</strong><code>${e(row.version)}</code>`, e(row.visible), e(row.backend), e(row.current)]))}
    ${panel(e(data.confirmation.title), fields(data.confirmation, [['target', '目标规则'], ['current', '当前运行方式']], e))}`;
}

function tickets({ e }) {
  const data = operationsGuide.tickets;
  return `${heading(data.title, data.summary, e)}<div class="g-notice">${e(data.notice)}</div>
    ${table(['工单状态', '负责人与触发', '动作与产物', '退出条件与当前边界'], data.states.map(row => [`<strong>${e(row.label)}</strong><code>${e(row.id)}</code>`, `<strong>${e(row.owner)}</strong>${text(row.trigger, e)}`, `<strong>${e(row.action)}</strong>${text(row.artifact, e)}`, `<strong>${e(row.exit)}</strong>${text(row.current, e)}`]))}
    ${heading('交接内容必须有结构，不只截取最近几条消息', '', e)}
    ${table(['字段', '内容', '校验要求'], data.handoffFields.map(row => [`<code>${e(row.key)}</code>`, e(row.label), e(row.requirement)]))}
    <div class="g-rule-grid">${data.rules.map(rule => panel(e(rule.title), fields(rule, [['owner', '负责人'], ['action', '动作'], ['artifact', '产物'], ['acceptance', '验收']], e))).join('')}</div>
    ${heading(data.followupExample.label, data.followupExample.notice, e)}
    ${panel('演示关联信息', fields(data.followupExample, [['orderId', '关联演示订单'], ['ticketId', '虚构工单编号']], e))}
    ${table(['目标状态', '负责人', '后续动作与依据', '用户可见反馈'], data.followupExample.events.map(event => [e(event.state), e(event.owner), `<strong>${e(event.action)}</strong>${text(event.evidence, e)}`, e(event.userMessage)]))}`;
}

function operations({ e }) {
  const data = operationsGuide.operations;
  return `${heading(data.title, data.summary, e)}<div class="g-notice">${e(data.notice)}</div>
    ${data.workspaces.map(workspace => `<section class="panel g-workspace"><div class="g-process-heading"><h3>${e(workspace.role)}</h3><span>目标工作台</span></div><p class="g-permission">${e(workspace.permission)}</p>${table(['触发', '日常动作', '交付产物', '完成检查'], workspace.tasks.map(task => [e(task.trigger), e(task.action), e(task.artifact), e(task.acceptance)]))}</section>`).join('')}
    ${heading('无人值守与队列规则', '', e)}${ruleItems(data.unattendedRules, e)}
    ${heading('把错误答案和知识缺口送回建设链路', '', e)}${ruleItems(data.knowledgeFeedbackSteps, e)}`;
}

function deployment({ e }) {
  const data = operationsGuide.deployment;
  return `${heading(data.title, data.summary, e)}<div class="g-notice">${e(data.notice)}</div>
    ${table(['目标组件', '职责', '输入、输出与存储要求'], data.components.map(component => componentCells(component, e)))}
    ${heading('一次请求的数据流与责任边界', '', e)}${ruleItems(data.dataFlow, e)}
    <div class="g-rule-grid">${panel('模型可以获得的数据', list(data.modelDataPolicy.allow, e))}${panel('不直接进入模型的数据', list(data.modelDataPolicy.exclude, e))}</div>
    ${heading('数据处理与留存规则', '', e)}${ruleItems(data.modelDataPolicy.controls, e)}
    ${heading('故障时先确认结果，再决定重试', '', e)}${ruleItems(data.recoveryRules, e)}`;
}

function componentCells(component, e) {
  return [e(component.name || component.title || component.id), e(component.role || component.purpose || component.responsibility || component.action || ''), fields(component, [['owner', '负责人'], ['data', '涉及数据'], ['input', '输入'], ['inputs', '输入'], ['output', '输出'], ['outputs', '输出'], ['persistence', '存储要求'], ['current', '当前'], ['target', '目标'], ['acceptance', '验收']], e)];
}

function ruleItems(items, e) {
  return `<div class="g-rule-grid">${(items || []).map(item => typeof item === 'string' ? panel('待确认事项', text(item, e)) : panel(e(item.title || item.label || item.name || item.stage || (item.from && item.to ? `${item.from} 到 ${item.to}` : item.owner || item.trigger || item.id || '执行规则')), fields(item, [['owner', '负责人'], ['trigger', '触发'], ['from', '来源'], ['to', '去向'], ['action', '执行动作'], ['requirement', '要求'], ['rule', '规则'], ['data', '涉及数据'], ['boundary', '责任与数据边界'], ['unit', '计量单位'], ['calculation', '计算方法'], ['evidence', '核对依据'], ['artifact', '产物'], ['output', '产物'], ['acceptance', '验收'], ['current', '当前边界']], e))).join('')}</div>`;
}

function rollout({ e }) {
  const data = operationsGuide.rollout;
  return `${heading(data.title, data.summary, e)}<div class="g-notice">${e(data.notice)}</div>
    ${heading('先建立可复核的样本与单模型基线', '', e)}${ruleItems(data.samplePlan, e)}
    ${heading('每个指标明确分子、分母和统计边界', '', e)}
    ${table(['指标', '分子或测量值', '分母或统计范围', '判定规则'], data.metrics.map(metric => [e(metric.name), e(metric.numerator), e(metric.denominator), e(metric.rule)]))}
    ${heading('成本按完整服务闭环计算', '', e)}
    <div class="g-formula">${e(data.costModel.formula)}</div>${panel('成本统计范围', text(data.costModel.scope, e))}${ruleItems(data.costModel.items, e)}
    ${heading('试点、准入、放量与回退', '', e)}
    ${data.phases.map(phase => panel(e(phase.label), fields(phase, [['owner', '负责人'], ['entry', '进入条件'], ['actions', '执行动作'], ['evidence', '决策依据'], ['decision', '通过与下一步'], ['rollback', '回退条件与动作']], e))).join('')}
    ${heading('上线前仍需业务方确认的参数', '以下为待决策项，不是已经测得的指标或对外承诺。', e)}${ruleItems(data.pendingDecisions, e)}`;
}
