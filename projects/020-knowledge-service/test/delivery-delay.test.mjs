import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, runTurn, publicSession, getTracking } from '../src/engine.mjs';

const startDelay = session => runTurn(session, { message: '订单 SF-3096 已经过了送达时间还没到，请帮我催一下物流', mode: 'dual' });

test('delay diagnosis combines owned order, tracking and policy before requesting confirmation', async () => {
  const s = createSession();
  const result = await startDelay(s);
  assert.equal(result.route, 'confirmation');
  assert.equal(result.model.id, 'demo-deep');
  assert.equal(result.confirmation.kind, 'logistics');
  assert.equal(result.confirmation.orderId, 'SF-3096');
  assert.ok(result.confirmation.details.some(d => d.value.includes('36 小时')));
  assert.deepEqual(result.sources.map(d => d.id), ['delivery_exception']);
  assert.ok(result.trace.some(t => t.tool === 'get_order'));
  assert.ok(result.trace.some(t => t.tool === 'get_tracking'));
  assert.ok(result.trace.some(t => t.tool === 'search_knowledge'));
  assert.equal(result.trace.some(t => t.tool === 'create_logistics_inquiry'), false);
  assert.equal(s.logisticsTickets.size, 0);
  assert.equal(s.orders.get('SF-3096').logisticsTicketId, null);
  assert.match(result.content, /尚不能确定包裹遗失或实际送达日/);
});

test('confirmation creates one logistics inquiry, leaves bot ownership and supports truthful status queries', async () => {
  const s = createSession(); const proposal = await startDelay(s);
  const result = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(result.route, 'completed'); assert.equal(result.routeLabel, '催查已创建');
  assert.equal(result.owner, 'bot'); assert.equal(result.ticket, null);
  assert.ok(result.logisticsTicket.id.startsWith('LC-'));
  assert.equal(s.logisticsTickets.size, 1);
  const repeat = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(repeat.duplicate, true); assert.equal(repeat.logisticsTicket.id, result.logisticsTicket.id);
  assert.equal(repeat.trace.some(t => t.tool === 'create_logistics_inquiry'), false);
  const query = await runTurn(s, { message: '查询催查进度' });
  assert.equal(query.route, 'fast'); assert.equal(query.model.id, 'demo-fast');
  assert.equal(query.logisticsTicket.id, result.logisticsTicket.id);
  assert.match(query.content, /已创建，待人工核查/);
  assert.match(query.content, /没有来自真实承运商的新反馈/);
  assert.equal(publicSession(s).logisticsTickets.length, 1);
  const secondRequest = await startDelay(s);
  assert.equal(secondRequest.confirmation, null); assert.equal(s.logisticsTickets.size, 1);
  assert.equal(secondRequest.logisticsTicket.id, result.logisticsTicket.id);
});

test('a delay query without order asks for it, and the next order-only message resumes the same intent', async () => {
  const s = createSession();
  const first = await runTurn(s, { message: '订单迟迟没到，帮我催物流' });
  assert.equal(first.route, 'clarify'); assert.equal(first.model.id, 'demo-fast');
  assert.equal(first.trace.some(t => t.tool === 'get_tracking'), false);
  const second = await runTurn(s, { message: 'SF-3096' });
  assert.equal(second.route, 'confirmation'); assert.equal(second.model.id, 'demo-deep');
  assert.equal(s.pendingIntent, null);
});

test('delay workflow reuses an already verified order without asking again', async () => {
  const s = createSession(); await runTurn(s, { message: '查订单 SF-3096 的物流' });
  const result = await runTurn(s, { message: '迟迟没到，可以帮我催一下物流吗？' });
  assert.equal(result.route, 'confirmation'); assert.equal(result.confirmation.orderId, 'SF-3096');
});

test('eligibility and ownership are enforced before a delay operation', async () => {
  const s = createSession();
  const ordinary = await runTurn(s, { message: '订单 SF-2048 延迟，请催物流' });
  assert.equal(ordinary.route, 'deep'); assert.equal(ordinary.confirmation, null);
  assert.equal(s.logisticsTickets.size, 0);
  assert.match(ordinary.content, /未同时满足/);
  const denied = await runTurn(s, { message: '订单 SF-9999 延迟，请催物流' });
  assert.equal(denied.route, 'denied'); assert.equal(getTracking(s, 'SF-9999'), null);
  assert.equal(denied.trace.some(t => t.tool === 'get_tracking'), false);
  assert.equal(s.pendingAction, null);
});

test('logistics confirmation is session-bound and status queries do not leak another session tickets', async () => {
  const a = createSession(); const b = createSession(); const proposal = await startDelay(a);
  const denied = await runTurn(b, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(denied.route, 'denied'); assert.equal(b.logisticsTickets.size, 0);
  const completed = await runTurn(a, { action: 'confirm', actionId: proposal.confirmation.id });
  const query = await runTurn(b, { message: `查询催查工单 ${completed.logisticsTicket.id}` });
  assert.equal(query.logisticsTicket, null); assert.equal(query.route, 'clarify');
  assert.equal(query.content.includes('已创建，待人工核查'), false);
  assert.equal(b.orders.get('SF-3096').logisticsTicketId, null);
});

test('changing a logistics snapshot invalidates even a still-eligible prior confirmation', async () => {
  const s = createSession(); const proposal = await startDelay(s);
  s.orders.get('SF-3096').scanIdleHours = 49;
  s.orders.get('SF-3096').trackingVersion = 2;
  const result = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(result.route, 'denied'); assert.equal(s.logisticsTickets.size, 0);
  assert.equal(s.pendingAction, null);
});

test('signed shipment, changed ownership and cancelled operation cannot create inquiries', async () => {
  for (const mutate of [order => { order.status = '已签收'; }, order => { order.customerId = 'OTHER'; }]) {
    const s = createSession(); const proposal = await startDelay(s); mutate(s.orders.get('SF-3096'));
    const result = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
    assert.equal(result.route, 'denied'); assert.equal(s.logisticsTickets.size, 0);
  }
  const s = createSession(); const proposal = await startDelay(s);
  const cancelled = await runTurn(s, { action: 'cancel', actionId: proposal.confirmation.id });
  assert.equal(cancelled.route, 'cancelled'); assert.match(cancelled.content, /没有创建工单/);
  const again = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(again.route, 'cancelled'); assert.equal(s.logisticsTickets.size, 0);
});

test('human handoff cancels pending logistics writes and carries verified delay facts', async () => {
  const s = createSession(); const proposal = await startDelay(s);
  const handoff = await runTurn(s, { message: '转人工处理' });
  assert.equal(handoff.owner, 'human'); assert.equal(s.pendingAction, null);
  assert.ok(handoff.ticket.facts.some(f => f.includes('36 小时')));
  assert.ok(handoff.ticket.actions.some(a => a.includes('查询演示物流快照')));
  const result = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(result.route, 'denied'); assert.equal(s.logisticsTickets.size, 0);
});

test('explicitly switching to another order invalidates pending inquiry, including inaccessible targets', async () => {
  for (const orderId of ['SF-2048', 'SF-9999']) {
    const s = createSession(); const proposal = await startDelay(s);
    const switched = await runTurn(s, { message: `改查订单 ${orderId} 的物流` });
    assert.equal(switched.route, orderId === 'SF-9999' ? 'denied' : 'fast');
    assert.equal(s.pendingAction, null);
    assert.equal(publicSession(s).pendingAction, null);
    assert.ok(switched.trace.some(t => t.label === '切换目标订单，旧确认失效'));
    const oldConfirmation = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
    assert.equal(oldConfirmation.route, 'denied');
    assert.equal(s.logisticsTickets.size, 0);
    assert.equal(s.orders.get('SF-3096').logisticsTicketId, null);
  }
});

test('querying the same order preserves its pending logistics confirmation', async () => {
  const s = createSession(); const proposal = await startDelay(s);
  const queried = await runTurn(s, { message: '再查订单 SF-3096 的物流' });
  assert.equal(queried.route, 'fast');
  assert.equal(s.pendingAction.id, proposal.confirmation.id);
  assert.equal(queried.trace.some(t => t.label === '切换目标订单，旧确认失效'), false);
  const completed = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(completed.route, 'completed'); assert.equal(s.logisticsTickets.size, 1);
});

test('refund confirmations follow the same target-switch rule while same-order queries stay compatible', async () => {
  const switchedSession = createSession();
  const refund = await runTurn(switchedSession, { message: '退款 SF-1024' });
  await runTurn(switchedSession, { message: '改查订单 SF-2048 的物流' });
  assert.equal(switchedSession.pendingAction, null);
  const denied = await runTurn(switchedSession, { action: 'confirm', actionId: refund.confirmation.id });
  assert.equal(denied.route, 'denied'); assert.equal(switchedSession.orders.get('SF-1024').refundId, null);

  const sameSession = createSession();
  const sameRefund = await runTurn(sameSession, { message: '退款 SF-1024' });
  await runTurn(sameSession, { message: '查一下订单 SF-1024' });
  assert.equal(sameSession.pendingAction.id, sameRefund.confirmation.id);
  const completed = await runTurn(sameSession, { action: 'confirm', actionId: sameRefund.confirmation.id });
  assert.equal(completed.route, 'completed'); assert.ok(sameSession.orders.get('SF-1024').refundId);
});
