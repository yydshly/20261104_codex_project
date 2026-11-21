import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { documents, evaluationCases } from './data.mjs';
import { classifyIntent, selectModel } from './adapters.mjs';

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const routeLabels = { fast: '快速处理', deep: '深入处理', clarify: '补齐信息', confirmation: '等待确认', human: '人工接管', denied: '权限拦截', unknown: '证据不足', completed: '申请已创建', cancelled: '已取消' };

export function createSession() {
  return {
    id: randomUUID(), customerId: 'DEMO-01', owner: 'bot', createdAt: Date.now(),
    messages: [], trace: [], verifiedOrderId: null, pendingAction: null, pendingIntent: null, ticket: null,
    actions: new Map(), logisticsTickets: new Map(), orders: new Map([
      ['SF-1024', { id: 'SF-1024', customerId: 'DEMO-01', product: 'Flow 桌面扩展坞', amount: 129, status: '已签收', signedDays: 3, logistics: '11 月 9 日已签收，签收人：本人', refundId: null }],
      ['SF-2048', { id: 'SF-2048', customerId: 'DEMO-01', product: 'Flow 收纳包', amount: 79, status: '运输中', signedDays: null, logistics: '已到达上海转运中心，演示预计次日送达', refundId: null, overdueHours: 0, scanIdleHours: 6, trackingVersion: 1, logisticsTicketId: null }],
      ['SF-3096', { id: 'SF-3096', customerId: 'DEMO-01', product: 'Flow 桌面扩展坞', amount: 129, status: '运输中', signedDays: null, logistics: '演示物流快照：超过承诺送达时间 36 小时，最近 48 小时无新扫描；尚不能据此判断遗失或实际送达日期', refundId: null, overdueHours: 36, scanIdleHours: 48, trackingVersion: 1, logisticsTicketId: null }],
      ['SF-9999', { id: 'SF-9999', customerId: 'OTHER', product: '非当前身份订单', amount: 99, status: '已签收', signedDays: 2, refundId: null }]
    ])
  };
}

export function publicSession(s) {
  return { id: s.id, owner: s.owner, messages: s.messages, trace: s.trace, pendingAction: s.pendingAction, ticket: s.ticket, verifiedOrderId: s.verifiedOrderId, logisticsTickets: [...s.logisticsTickets.values()] };
}

export function getOrder(session, orderId) {
  const order = session.orders.get(orderId);
  // 不区分不存在与他人订单，以免泄露订单存在性。
  if (!order || order.customerId !== session.customerId) return null;
  return order;
}

export function getTracking(session, orderId) {
  const order = getOrder(session, orderId);
  if (!order) return null;
  return { orderId: order.id, status: order.status, overdueHours: order.overdueHours ?? 0, scanIdleHours: order.scanIdleHours ?? 0, version: order.trackingVersion ?? 1, simulated: true };
}

const canCreateLogisticsInquiry = tracking => tracking?.status === '运输中' && tracking.overdueHours > 24 && tracking.scanIdleHours >= 48;
const sameTracking = (a, b) => a && b && ['orderId', 'status', 'overdueHours', 'scanIdleHours', 'version'].every(key => a[key] === b[key]);

function logisticsFacts(tracking) {
  return [`运输状态：${tracking.status}`, `超过演示承诺送达时间 ${tracking.overdueHours} 小时`, `最近 ${tracking.scanIdleHours} 小时无新扫描`];
}

function searchKnowledge(text, requestedId) {
  return documents.filter(d => requestedId ? d.id === requestedId : d.keywords.some(k => text.includes(k))).slice(0, 2);
}

function handoff(session, reason) {
  session.owner = 'human';
  session.pendingAction = null;
  session.pendingIntent = null;
  session.ticket = {
    id: `HF-${randomUUID().slice(0, 8).toUpperCase()}`, reason,
    summary: session.messages.filter(m => m.role === 'user').slice(-4).map(m => m.content).join('；').slice(0, 1000),
    facts: session.verifiedOrderId ? [`已核实订单归属：${session.verifiedOrderId}`] : ['尚未核实具体订单'],
    actions: session.trace.filter(t => t.tool).slice(-8).map(t => `${t.label}：${t.summary}`),
    next: '由人工核实诉求并决定后续处理。演示不会通知真实客服。',
    notes: []
  };
  if (session.verifiedOrderId) {
    const tracking = getTracking(session, session.verifiedOrderId);
    const order = getOrder(session, session.verifiedOrderId);
    if (tracking && order?.overdueHours !== undefined) session.ticket.facts.push(...logisticsFacts(tracking));
    if (order?.logisticsTicketId) session.ticket.facts.push(`已有演示物流催查工单：${order.logisticsTicketId}`);
  }
  return session.ticket;
}

export async function runTurn(session, { message, mode = 'dual', action, actionId }, emit = () => {}, { delay = 0 } = {}) {
  const start = performance.now();
  const traces = [];
  const trace = async (node, label, summary, extra = {}) => {
    const entry = { id: randomUUID(), node, label, summary, elapsedMs: Math.round(performance.now() - start), ...extra };
    traces.push(entry);
    session.trace.push(entry);
    session.trace = session.trace.slice(-160);
    emit({ type: 'trace', entry });
    if (delay) await pause(delay);
  };
  let content = '', route = 'fast', sources = [], model = null, confirmation = null, logisticsTicket = null;

  if (action) {
    if (!['confirm', 'cancel'].includes(action)) throw new Error('不支持的操作');
    const processed = session.actions.get(actionId);
    if (processed) {
      await trace('policy', '幂等命中', '重复提交返回同一个处理结果，没有再次创建申请。');
      const result = { ...processed, trace: traces, duplicate: true, owner: session.owner, ticket: session.ticket };
      emit({ type: 'complete', result });
      return result;
    }
    const pending = session.pendingAction;
    if (!pending || pending.id !== actionId || session.owner !== 'bot') {
      await trace('policy', '确认已失效', '会话没有匹配的待确认操作，未执行写入。');
      route = 'denied'; content = '这项确认已失效，或不属于当前会话。没有执行业务写入。';
    } else if (action === 'cancel') {
      session.pendingAction = null; route = 'cancelled'; content = pending.kind === 'logistics' ? '已取消本次物流催查，没有创建工单，订单没有发生变化。' : '已取消本次退款申请，订单没有发生变化。';
      await trace('policy', '用户取消', `取消 ${pending.orderId} 的待确认操作。`);
    } else if (pending.kind === 'logistics') {
      const order = getOrder(session, pending.orderId);
      const tracking = getTracking(session, pending.orderId);
      await trace('policy', '再次校验物流催查资格', '核对会话归属、运输状态与确认时的物流快照。');
      if (!order || !canCreateLogisticsInquiry(tracking) || !sameTracking(tracking, pending.tracking) || order.logisticsTicketId) {
        session.pendingAction = null; route = 'denied';
        content = '订单归属、物流状态或催查资格已变化，请重新核查后确认。没有创建新的物流催查工单。';
      } else {
        logisticsTicket = { id: `LC-${randomUUID().slice(0, 8).toUpperCase()}`, orderId: order.id, status: '已创建，待人工核查', type: 'logistics', facts: logisticsFacts(tracking), createdAt: new Date().toISOString(), simulated: true, note: '仅本地内存演示，未通知真实承运商；不承诺具体送达日或赔偿。' };
        session.logisticsTickets.set(logisticsTicket.id, logisticsTicket);
        order.logisticsTicketId = logisticsTicket.id;
        session.pendingAction = null; route = 'completed';
        await trace('policy', '创建物流催查工单', `${logisticsTicket.id} · ${order.id} · 已保存核查事实`, { tool: 'create_logistics_inquiry' });
        content = `已为订单 ${order.id} 创建演示物流催查工单 ${logisticsTicket.id}。\n\n当前状态：已创建，待人工核查。你可以继续问“查询催查进度”。\n\n这只表示本地申请已记录，不代表承运商已经受理或物流已加速；没有承诺具体送达日或赔偿，也没有通知真实物流人员。`;
      }
    } else {
      const order = getOrder(session, pending.orderId);
      await trace('policy', '再次校验', '核对会话归属、订单资格与确认金额。');
      if (!order || order.amount !== pending.amount || order.status !== '已签收' || order.signedDays > 7 || order.refundId) {
        session.pendingAction = null; route = 'denied'; content = '订单状态或退款资格已变化，请重新发起查询。没有执行退款申请。';
      } else {
        order.refundId = `RA-${randomUUID().slice(0, 8).toUpperCase()}`;
        session.pendingAction = null; route = 'completed';
        await trace('policy', '创建退款申请', `${order.refundId} · ${order.id} · ¥${order.amount.toFixed(2)}`, { tool: 'create_refund_request' });
        content = `已为订单 ${order.id} 创建演示退款申请 ${order.refundId}，申请金额 ¥${order.amount.toFixed(2)}。\n\n当前状态：待审核。这表示申请已创建，不代表退款到账；本演示不会执行真实支付。`;
      }
    }
  } else {
    session.messages.push({ id: randomUUID(), role: 'user', content: message });
    await trace('session', '读取会话', `演示身份 DEMO-01 · ${session.owner === 'human' ? '人工持有' : '机器人持有'} · ${mode === 'single' ? '单模型' : '双模型'}配置`);
    if (session.owner === 'human') {
      session.ticket.notes.push(message);
      route = 'human';
      await trace('human', '追加至交接工单', '机器人保持暂停；本消息作为交接补充记录，未调用模型。');
      content = `补充信息已记入演示工单 ${session.ticket.id}。当前由人工持有会话，机器人不会继续自动办理。此演示没有真实客服在线。`;
    } else {
      let intent = classifyIntent(message);
      if (session.pendingIntent === 'delay' && /^(?:订单)?\s*SF[- ]?\d{4}\s*[。！!]?$/i.test(message)) intent = 'delay';
      else if (intent !== 'delay') session.pendingIntent = null;
      await trace('router', '选择业务流程', { human: '用户明确要求人工', refund: '退款业务流程', technical: '复杂排障流程', order: '订单事实查询', delay: '配送延迟核查，直接进入深入路径', logistics_status: '查询既有物流催查工单', knowledge: '知识问答流程' }[intent]);
      const explicitOrder = message.match(/SF[- ]?(\d{4})/i);
      const explicitOrderId = explicitOrder ? `SF-${explicitOrder[1]}` : null;
      if (session.pendingAction && explicitOrderId && explicitOrderId !== session.pendingAction.orderId && ['order', 'refund', 'delay', 'logistics_status'].includes(intent)) {
        // 先使旧确认失效，再核查新目标；新订单即使无权访问，也不能保留上一笔写入授权。
        const previousOrderId = session.pendingAction.orderId;
        session.pendingAction = null;
        await trace('policy', '切换目标订单，旧确认失效', `本次明确指定 ${explicitOrderId}，已使 ${previousOrderId} 的未确认操作失效；未执行业务写入。`);
      }
      if (intent === 'human') {
        route = 'human';
        const ticket = handoff(session, '用户明确要求人工');
        await trace('human', '创建交接工单', `${ticket.id} · 已附带问题摘要与已核实事实`, { tool: 'create_handoff' });
        content = `已创建演示交接工单 ${ticket.id}，并附上问题摘要与已有处理记录。\n\n机器人自动回复已暂停；你可以继续补充信息。此处只演示交接机制，不会通知真实客服。`;
      } else if (intent === 'logistics_status') {
        const requestedTicketId = message.match(/LC-[A-Z0-9]{8}/i)?.[0].toUpperCase();
        const matched = message.match(/SF[- ]?(\d{4})/i);
        const orderId = matched ? `SF-${matched[1]}` : session.verifiedOrderId;
        const found = requestedTicketId ? session.logisticsTickets.get(requestedTicketId) : [...session.logisticsTickets.values()].find(t => t.orderId === orderId);
        if (found && getOrder(session, found.orderId)) {
          logisticsTicket = found; model = selectModel(mode, 'fast');
          await trace('knowledge', '查询物流催查进度', `${found.id} · ${found.status}`, { tool: 'get_logistics_inquiry' });
          await trace('fast', '整理工单事实', `${model.label} · 使用内存工单当前状态，不推测已受理。`);
          content = `演示物流催查工单 ${found.id}\n订单：${found.orderId}\n当前状态：${found.status}\n\n这是本地内存中的已记录状态，没有来自真实承运商的新反馈。当前无法据此承诺实际送达日或赔偿。`;
        } else {
          route = 'clarify'; model = selectModel(mode, 'fast');
          await trace('fast', '未找到可访问的催查记录', '不返回其他会话或其他身份的工单。');
          content = '当前会话没有找到可访问的这份催查工单。请先核对订单号，或对演示订单 SF-3096 发起延迟核查。';
        }
      } else if (intent === 'order' || intent === 'refund' || intent === 'delay') {
        const matched = message.match(/SF[- ]?(\d{4})/i);
        const orderId = matched ? `SF-${matched[1]}` : session.verifiedOrderId;
        if (!orderId) {
          route = 'clarify'; model = selectModel(mode, 'fast');
          await trace('fast', '补齐必要信息', '缺少订单号，先追问，不调用订单写入工具。');
          if (intent === 'delay') session.pendingIntent = 'delay';
          content = `请提供要${intent === 'refund' ? '申请退款' : intent === 'delay' ? '核查配送延迟' : '查询'}的订单号。${intent === 'delay' ? '可以使用演示订单 SF-3096。' : '可以使用演示订单 SF-1024 或 SF-2048。'}`;
        } else {
          const order = getOrder(session, orderId);
          await trace('knowledge', '查询订单与归属', order ? `${order.id} · ${order.status} · 已通过演示身份归属校验` : '未找到可访问的订单；不返回订单详情。', { tool: 'get_order' });
          if (!order) {
            route = 'denied';
            await trace('policy', '权限边界拦截', '订单不存在或不属于当前演示身份，统一拒绝访问。');
            content = '没有找到当前身份可访问的这笔订单。请核对订单号；你可以测试 SF-1024 或 SF-2048。';
          } else {
            session.verifiedOrderId = order.id;
            session.pendingIntent = null;
            if (intent === 'order') {
              model = selectModel(mode, 'fast');
              await trace('fast', '整理查询事实', `${model.label} · 使用接口返回的订单事实`);
              content = `订单 ${order.id}：${order.product}\n\n当前状态：${order.status}\n物流记录：${order.logistics}\n实付金额：¥${order.amount.toFixed(2)}${order.refundId ? `\n已有退款申请：${order.refundId}` : ''}\n\n以上是当前会话的演示数据。`;
            } else if (intent === 'delay') {
              route = 'deep'; model = selectModel(mode, 'deep');
              const tracking = getTracking(session, order.id);
              sources = searchKnowledge(message, 'delivery_exception');
              await trace('knowledge', '查询演示物流快照', logisticsFacts(tracking).join('；'), { tool: 'get_tracking' });
              await trace('knowledge', '检索配送异常政策', '配送延迟与物流催查规则 · v1.0', { tool: 'search_knowledge' });
              await trace('deep', '综合核查配送异常', `${model.label} · 比对订单、物流快照和演示政策；不推断遗失或具体到达日。`);
              if (order.logisticsTicketId) {
                logisticsTicket = session.logisticsTickets.get(order.logisticsTicketId);
                await trace('policy', '拦截重复催查', `${order.logisticsTicketId} 已存在，不重复创建。`);
                content = `订单 ${order.id} 已有演示物流催查工单 ${order.logisticsTicketId}，当前状态为${logisticsTicket.status}，无需重复发起。你可以继续问“查询催查进度”。\n\n没有真实承运商反馈时，不承诺具体送达日或赔偿。`;
              } else if (!canCreateLogisticsInquiry(tracking)) {
                await trace('policy', '未满足催查条件', '演示政策要求运输中、超承诺送达超过 24 小时且连续 48 小时无新扫描。');
                content = `已核对演示订单 ${order.id}：\n${logisticsFacts(tracking).join('\n')}。\n\n当前未同时满足演示政策的催查条件，因此没有创建工单。可以继续查询物流，或明确提出“转人工”进一步核实；不据此承诺具体送达日或赔偿。`;
              } else {
                route = 'confirmation';
                const existing = session.pendingAction;
                session.pendingAction = existing?.kind === 'logistics' && existing.orderId === order.id && sameTracking(existing.tracking, tracking) ? existing : { id: randomUUID(), kind: 'logistics', orderId: order.id, amount: order.amount, product: order.product, title: '确认创建物流催查工单', submitLabel: '确认发起催查', tracking, details: [{ label: '订单', value: order.id }, { label: '商品', value: order.product }, { label: '延迟快照', value: `超承诺送达 ${tracking.overdueHours} 小时；${tracking.scanIdleHours} 小时无新扫描` }], notice: '确认后只创建演示催查工单，不代表物流已加速，不承诺到达日或赔偿。' };
                confirmation = session.pendingAction;
                await trace('policy', '等待用户确认催查', '已满足演示资格；确认前不创建物流工单。');
                content = `已核对订单 ${order.id} 的演示快照：\n${logisticsFacts(tracking).join('\n')}。\n\n这符合“超承诺送达超过 24 小时、连续至少 48 小时无新扫描”的演示催查条件。可以为你创建物流催查工单，请确认后再办理。\n\n现有信息尚不能确定包裹遗失或实际送达日；催查也不代表赔偿或物流已加速。`;
              }
            } else {
              sources = searchKnowledge(message, 'refund');
              await trace('policy', '校验退款资格', order.refundId ? '存在退款申请，拦截重复办理。' : order.status === '已签收' && order.signedDays <= 7 ? '已签收 7 天内，进入用户确认。' : '不符合自动办理条件，需要人工核实。');
              if (order.refundId) {
                content = `订单 ${order.id} 已有演示退款申请 ${order.refundId}，无需重复提交。`;
              } else if (order.status !== '已签收' || order.signedDays > 7) {
                route = 'human';
                const ticket = handoff(session, '订单不符合自动退款申请条件');
                await trace('human', '转人工核实', `${ticket.id} · 已携带订单事实`, { tool: 'create_handoff' });
                content = `订单 ${order.id} 当前为${order.status}，不满足演示中的自动办理条件。已创建演示工单 ${ticket.id}，由人工进一步核实。机器人已暂停自动办理。`;
              } else {
                route = 'confirmation';
                const existing = session.pendingAction;
                session.pendingAction = existing?.kind !== 'logistics' && existing?.orderId === order.id ? existing : { id: randomUUID(), kind: 'refund', orderId: order.id, amount: order.amount, product: order.product };
                confirmation = session.pendingAction;
                content = `订单 ${order.id} 已签收 ${order.signedDays} 天，可继续创建演示退款申请。\n\n请确认订单与金额，并确认商品完好。确认后会创建待审核申请；不会实际退款。`;
              }
            }
          }
        }
      } else if (intent === 'technical') {
        route = 'deep'; model = selectModel(mode, route);
        sources = searchKnowledge(message, 'sync');
        await trace('knowledge', '检索排障文档', '桌面端同步故障排查 · v1.4', { tool: 'search_knowledge' });
        await trace('knowledge', '检查演示服务状态', '演示同步服务：正常。不能据此排除设备侧故障。', { tool: 'get_service_status' });
        await trace('deep', '整理分步排查方案', `${model.label} · 结合用户描述、文档与服务状态；尚不能确认根因。`);
        content = '当前演示服务状态正常，但这不能证明桌面端没有问题。根据同步排障文档，建议先这样核对：\n\n1. 确认手机和桌面端登录的是同一账号。\n2. 记录桌面端版本、报错原文和最近一次失败时间。\n3. 检查桌面端网络与同步队列，观察是否只有特定内容失败。\n4. 保留本地内容与编辑缓存，排查期间避免清缓存或重新初始化。\n\n请先补充客户端版本和报错原文；仅凭目前信息还不能确认故障原因。';
      } else {
        sources = searchKnowledge(message);
        await trace('knowledge', '检索已发布知识', sources.length ? sources.map(s => `${s.title} · ${s.version}`).join('；') : '未命中可支持答案的演示文档。', { tool: 'search_knowledge' });
        model = selectModel(mode, 'fast');
        if (sources.length) {
          await trace('fast', '依据文档回答', `${model.label} · 回答保留来源`);
          content = sources.map(s => s.content).join('\n\n');
        } else {
          route = 'unknown';
          await trace('policy', '证据不足', '没有依据时不编造政策，也不把换模型当作补充事实。');
          content = '当前演示知识库没有足够资料回答这个问题。你可以补充具体产品或业务信息，或明确提出“转人工”。也可以用下方演示场景测试配送、订单和同步排障。';
        }
      }
    }
  }

  if (content && session.owner === 'bot' && !['denied', 'unknown', 'cancelled', 'completed', 'confirmation'].includes(route)) {
    await trace('policy', '回复前核对', '核对事实来源与业务边界，没有执行未经确认的写操作。');
  }
  const result = { id: randomUUID(), role: 'assistant', systemReceipt: session.owner === 'human', content, route, routeLabel: route === 'completed' && logisticsTicket ? '催查已创建' : routeLabels[route], sources: sources.map(({ id, title, version }) => ({ id, title, version })), model, confirmation, logisticsTicket, owner: session.owner, ticket: session.ticket, trace: traces, elapsedMs: Math.round(performance.now() - start), simulated: true };
  session.messages.push(result);
  if (action && actionId && route !== 'denied') session.actions.set(actionId, result);
  // 流式文本只用于呈现；最终结果以 complete 事件为准。
  const chunks = content.match(/[\s\S]{1,14}/g) ?? [];
  for (const chunk of chunks) {
    emit({ type: 'token', text: chunk });
    if (delay) await pause(12);
  }
  emit({ type: 'complete', result });
  return result;
}

export async function runEvaluation(mode = 'dual') {
  const results = [];
  for (const test of evaluationCases) {
    const result = await runTurn(createSession(), { message: test.message, mode });
    const passed = result.route === test.expected && (!test.source || result.sources.some(s => s.id === test.source)) && (!test.tool || result.trace.some(t => t.tool === test.tool));
    results.push({ ...test, actual: result.route, actualLabel: result.routeLabel, passed, elapsedMs: result.elapsedMs, model: result.model?.label ?? '规则流程' });
  }
  return { results, passed: results.filter(r => r.passed).length, total: results.length, mode, simulated: true, createdAt: new Date().toISOString() };
}
