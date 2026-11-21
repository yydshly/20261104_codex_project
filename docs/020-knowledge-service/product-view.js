import { productPlan } from './product-plan.js';

const tabs = [
  ['scenario', '场景与目标'],
  ['journey', '对话与后台'],
  ['knowledge', '知识与接口'],
  ['delivery', '交付与验收']
];

export function renderProductView(viewState, helpers) {
  const { icon, escape: e, pageHeader } = helpers;
  const activeTab = tabs.some(([id]) => id === viewState.productTab) ? viewState.productTab : 'scenario';
  const steps = productPlan.walkthrough.steps;
  const stepIndex = Math.max(0, Math.min(steps.length - 1, Number(viewState.caseStep) || 0));
  const header = pageHeader(
    productPlan.eyebrow,
    e(productPlan.title),
    e(productPlan.summary),
    `<button class="primary-button" data-scenario="delay">${icon('play')}运行这个场景</button>`
  );
  const navigation = `<div class="p-tabs" role="group" aria-label="产品落地内容">${tabs.map(([id, title], index) => `<button data-product-tab="${id}" aria-pressed="${id === activeTab}"><span>${String(index + 1).padStart(2, '0')}</span>${title}</button>`).join('')}</div>`;
  const notice = `<div class="p-context-note">${icon('shield')}<p>${e(productPlan.notice)}</p></div>`;
  const content = {
    scenario: () => scenarioView(productPlan, { icon, e }),
    journey: () => journeyView(productPlan, stepIndex, { icon, e }),
    knowledge: () => knowledgeView(productPlan, { icon, e }),
    delivery: () => deliveryView(productPlan, { icon, e })
  }[activeTab]();
  return `<div class="p-page">${header}<div class="p-implementation-link"><p>完整实施说明已展开到知识建设、模型路由、工单跟进与上线验收。</p><button class="secondary-button" data-guide-tab="capabilities">核对当前能力</button><button class="primary-button" data-guide-tab="overview">阅读实施全景</button></div>${navigation}${notice}${content}</div>`;
}

function scenarioView(plan, { icon, e }) {
  const s = plan.scenario;
  const scope = plan.scope;
  return `<section class="p-case-hero panel">
    <div class="p-case-intro"><span class="p-label">FIRST SERVICE LOOP</span><h2>包裹迟迟未到，<br>客服如何帮用户往前走？</h2><p>核对一笔订单，解释已知与未知，在用户确认后创建一张可追踪的物流催查工单。</p><div class="p-case-flow"><span>核对事实</span>${icon('arrow')}<span>确认诉求</span>${icon('arrow')}<span>记录催查</span></div><button class="text-button" data-product-tab="journey">展开每一步对话与后台 ${icon('arrow')}</button></div>
    <div class="p-order-card"><div class="p-order-heading"><span>${icon('box')}演示订单</span><span class="p-seed-label">SEED DATA</span></div><strong>${e(s.orderId)}</strong><p class="p-order-owner">${e(s.owner)}</p><dl><dt>订单状态</dt><dd>${e(s.status)}</dd><dt>实付金额</dt><dd>${e(s.amount)}</dd><dt>送达延迟</dt><dd>${e(s.delay)}</dd><dt>最新扫描</dt><dd>${e(s.lastScan)}</dd></dl><div class="p-order-warning">${icon('clock')}<span>时间均为演示相对时间，不是实际承运记录。</span></div></div>
  </section>
  <div class="p-section-heading"><div><span class="p-label">DEFINE THE OUTCOME</span><h2>先定义什么算完成，再选择模型。</h2></div><span class="p-target-tag">首个垂直闭环</span></div>
  <section class="p-scope-grid"><article class="panel p-content-card"><div class="p-card-title">${icon('check')}<h3>本次要完成</h3></div><p class="p-card-intro">${e(scope.goal)}</p><ul class="p-check-list">${scope.inScope.map(item => `<li>${icon('check')}<span>${e(item)}</span></li>`).join('')}</ul></article><article class="panel p-content-card"><div class="p-card-title">${icon('shield')}<h3>业务边界</h3></div><p class="p-card-intro">${e(s.boundary)}</p><ul class="p-boundary-list">${scope.outOfScope.map(item => `<li>${e(item)}</li>`).join('')}</ul></article></section>
  <div class="p-success-definition">${icon('message')}<div><span>服务完成的判断</span><p>${e(scope.successDefinition)}</p></div></div>
  <div class="p-section-heading"><div><span class="p-label">ONE PRODUCT, FOUR PERSPECTIVES</span><h2>我们要交付的不只是一扇聊天窗口。</h2></div></div>
  <section class="p-role-grid">${plan.roles.map((role, index) => `<article class="panel p-role-card"><div class="p-role-heading"><span class="p-role-icon p-tone-${index}">${icon(['message', 'book', 'chart', 'code'][index])}</span><h3>${e(role.label)}</h3></div><p>${e(role.wants)}</p><dl><dt>产品工作区</dt><dd>${e(role.workspace)}</dd><dt>验收关注点</dt><dd>${e(role.acceptance)}</dd></dl></article>`).join('')}</section>
  <section class="panel p-mechanism-link"><div><span class="p-label">BACK TO THE MECHANISM</span><h2>这条服务，怎样用到两个模型？</h2><p>轻量模型处理信息补齐与有据答复，高能力模型按需分析。会话服务统一结果、规则与交流顺序。</p><button class="text-button" data-open-blueprint="mechanism">查看完整机制图 ${icon('arrow')}</button></div><button class="p-mechanism-preview" data-open-blueprint="mechanism" aria-label="放大双模型协作机制图"><img src="./assets/knowledge-service-mechanism.png" alt="两个模型分工、统一回复协调器与用户交流时间线" width="1585" height="992" loading="lazy"></button></section>`;
}

function journeyView(plan, stepIndex, { icon, e }) {
  const steps = plan.walkthrough.steps;
  const step = steps[stepIndex];
  const actorTone = step.actor.includes('高能力') ? 'deep' : step.actor.includes('轻量') ? 'fast' : step.actor.includes('规则') ? 'policy' : 'service';
  return `<div class="p-journey-intro"><div><span class="p-label">USER EXPERIENCE × BACKEND WORK</span><h2>用户的一句话，后台各自做什么？</h2><p>${e(plan.walkthrough.notice)}</p></div><span class="p-target-tag">目标产品对话样例</span></div>
    <section class="p-journey-layout"><nav class="panel p-step-nav" aria-label="场景步骤">${steps.map((item, i) => `<button data-case-step="${i}" class="p-step-button ${i === stepIndex ? 'active' : ''}" ${i === stepIndex ? 'aria-current="step"' : ''}><span>${String(i + 1).padStart(2, '0')}</span><strong>${e(item.title.replace(/^\d+\s*·\s*/, ''))}</strong>${icon('chevron')}</button>`).join('')}<div class="p-step-note">${icon('clock')}<p>逐步阅读目标流程；本地演示仅支持其中部分话术和操作。</p></div><button class="text-button" data-guide-tab="capabilities">逐步核对可运行范围</button></nav>
    <div class="p-step-main"><div class="p-current-step"><span class="p-label">STEP ${String(stepIndex + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}</span><span class="p-actor p-actor-${actorTone}">${icon(actorTone === 'deep' ? 'sparkles' : actorTone === 'fast' ? 'bolt' : actorTone === 'policy' ? 'shield' : 'git')}${e(step.actor)}</span></div><h2 class="p-step-title">${e(step.title.replace(/^\d+\s*·\s*/, ''))}</h2>
      <div class="p-step-columns"><article class="panel p-dialogue-card"><div class="p-card-title">${icon('message')}<h3>用户实际看到的交流</h3></div><div class="p-sample-message p-sample-user"><span>用户</span><p>${e(step.user)}</p></div><div class="p-sample-message p-sample-assistant"><span>同一个客服</span><p>${e(step.reply)}</p></div><div class="p-dialogue-footer">对话内容为场景样例，不是实时业务答复。</div></article><article class="panel p-backend-card"><div class="p-card-title">${icon('layers')}<h3>后台依据与职责</h3></div><span class="p-small-label">本步可使用的证据</span><ul class="p-evidence-list">${step.evidence.map(item => `<li>${icon('book')}<span>${e(item)}</span></li>`).join('')}</ul><div class="p-implementation"><span class="p-small-label">目标实现</span><p>${e(step.implementation.target)}</p></div><div class="p-implementation p-current-demo"><span class="p-small-label">当前演示的范围</span><p>${e(step.implementation.currentDemo)}</p></div></article></div>
      <div class="p-step-controls"><button class="secondary-button" data-case-step="${Math.max(0, stepIndex - 1)}" ${stepIndex === 0 ? 'disabled' : ''}>上一步</button><span>资料已齐时可跳过追问；复杂分析按需启动。</span><button class="primary-button" data-case-step="${Math.min(steps.length - 1, stepIndex + 1)}" ${stepIndex === steps.length - 1 ? 'disabled' : ''}>下一步 ${icon('arrow')}</button></div>
    </div></section>
    <div class="p-journey-bottom"><div>${icon('shield')}<p><strong>回复统一，权限也统一。</strong>模型可以帮助理解与分析，订单归属、用户确认、幂等及人工持有权由服务端规则控制。</p></div><button class="text-button" data-product-tab="knowledge">查看需要准备的知识与接口 ${icon('arrow')}</button></div>`;
}

function knowledgeView(plan, { icon, e }) {
  return `<div class="p-knowledge-principle">${icon('layers')}<div><span class="p-label">TWO SOURCES OF TRUTH</span><h2>政策怎么说，与订单发生了什么，要分开核对。</h2><p>${e(plan.knowledge.principle)}</p></div></div>
    <div class="p-section-heading"><div><span class="p-label">KNOWLEDGE PREPARATION</span><h2>建库先准备这些字段。</h2></div><span class="p-target-tag">正式发布需业务审核</span></div><section class="p-field-grid">${plan.knowledge.fields.map(field => `<article class="panel p-field-card"><span class="p-small-label">${e(field.key)}</span><h3>${e(field.label)}</h3><p>${e(field.meaning)}</p><div>${e(field.example)}</div></article>`).join('')}</section>
    <section class="p-policy-list">${plan.knowledge.documents.map((doc, index) => `<details class="panel p-policy-document" ${index === 0 ? 'open' : ''}><summary><span class="p-document-icon">${icon('book')}</span><span><strong>${e(doc.title)}</strong><small>${e(doc.version)} · ${e(doc.effectiveScope)}</small></span>${icon('chevron')}</summary><div class="p-policy-document-body"><p>${e(doc.content)}</p><ul class="p-check-list">${doc.rules.map(rule => `<li>${icon('check')}<span>${e(rule)}</span></li>`).join('')}</ul><dl><dt>来源与负责人</dt><dd>${e(doc.source)}</dd><dt>审核状态</dt><dd>${e(doc.review)}</dd></dl></div></details>`).join('')}</section>
    <div class="p-section-heading"><div><span class="p-label">SERVICE CONTRACTS</span><h2>用接口把业务能力接进来。</h2></div></div><div class="panel p-table-wrap"><table class="p-data-table"><thead><tr><th>模块</th><th>建议接口</th><th>输入与输出</th><th>落地状态</th></tr></thead><tbody>${plan.modules.map(module => `<tr><td><strong>${e(module.name)}</strong></td><td><code>${e(module.interface)}</code></td><td><span class="p-table-direction">输入</span>${e(module.request)}<br><span class="p-table-direction">输出</span>${e(module.response)}</td><td>${e(module.status)}</td></tr>`).join('')}</tbody></table></div>
    <div class="p-section-heading"><div><span class="p-label">DURABLE STATE</span><h2>把什么存下来，才能恢复和核对？</h2></div></div><section class="p-entity-grid">${plan.entities.map(entity => `<article class="panel p-entity-card"><code>${e(entity.name)}</code><p>${e(entity.purpose)}</p><div>${entity.fields.map(field => `<span>${e(field)}</span>`).join('')}</div></article>`).join('')}</section>`;
}

function deliveryView(plan, { icon, e }) {
  return `<div class="p-delivery-intro"><span class="p-label">BUILD IN VERTICAL SLICES</span><h2>先交付可信闭环，再用实测数据优化双模型。</h2><p>每一阶段都交付可使用的能力，并设置退出条件。依赖、工期和指标需要业务盘点与试点验证后确定。</p></div><section class="p-milestone-grid">${plan.milestones.map((stage, index) => `<article class="panel p-milestone-card"><div class="p-milestone-heading"><span>${String(index + 1).padStart(2, '0')}</span><h3>${e(stage.title.replace(/^阶段[一二三四]\s*·\s*/, ''))}</h3></div><ul class="p-check-list">${stage.deliverables.map(item => `<li>${icon('check')}<span>${e(item)}</span></li>`).join('')}</ul><div class="p-exit-criteria"><span>阶段退出条件</span><p>${e(stage.exitCriteria)}</p></div><p class="p-stage-boundary">${e(stage.notYet)}</p></article>`).join('')}</section>
    <div class="p-section-heading"><div><span class="p-label">RELEASE GATES</span><h2>用失败场景验证边界。</h2></div><span class="p-target-tag">正式上线验收项</span></div><section class="p-gate-grid">${plan.acceptance.gates.map(gate => `<article class="panel p-gate-card"><div class="p-card-title">${icon('shield')}<h3>${e(gate.title)}</h3></div><p><span>测试情境</span>${e(gate.check)}</p><div><span>通过条件</span>${e(gate.passCondition)}</div></article>`).join('')}</section>
    <div class="p-section-heading"><div><span class="p-label">MEASURE REAL SERVICE OUTCOMES</span><h2>指标服务于真实效果，不只看回复速度。</h2></div></div><div class="panel p-table-wrap"><table class="p-data-table p-metric-table"><thead><tr><th>指标</th><th>具体测什么</th><th>目标如何确定</th></tr></thead><tbody>${plan.acceptance.metrics.map(metric => `<tr><td><strong>${e(metric.name)}</strong></td><td>${e(metric.definition)}</td><td>${e(metric.target)}</td></tr>`).join('')}</tbody></table></div><div class="p-finish-callout"><div>${icon('play')}<span><strong>先运行一个完整场景。</strong><small>查看知识来源、订单归属检查与确认后的本地工单结果。</small></span></div><button class="primary-button" data-scenario="delay">运行物流催查场景 ${icon('arrow')}</button></div>`;
}
