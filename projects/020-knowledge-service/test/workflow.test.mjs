import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, runTurn, runEvaluation, getOrder } from '../src/engine.mjs';

test('single and dual strategies preserve all expected workflow boundaries', async () => {
  for (const mode of ['single', 'dual']) {
    const result = await runEvaluation(mode);
    assert.equal(result.passed, result.total, JSON.stringify(result.results.filter(r => !r.passed)));
  }
});
test('model selection changes by strategy while evidence stays the same', async () => {
  const single = await runTurn(createSession(), { message: '同步报错了', mode: 'single' });
  const dual = await runTurn(createSession(), { message: '同步报错了', mode: 'dual' });
  assert.equal(single.model.id, 'demo-main'); assert.equal(dual.model.id, 'demo-deep');
  assert.deepEqual(single.sources, dual.sources); assert.equal(single.route, dual.route);
});
test('query enforces ownership and retains only verified order context', async () => {
  const s = createSession();
  const denied = await runTurn(s, { message: '查询订单 SF-9999' });
  assert.equal(denied.route, 'denied'); assert.equal(s.verifiedOrderId, null);
  assert.equal(denied.content.includes('非当前身份订单'), false);
  assert.equal(getOrder(s, 'SF-9999'), null);
  await runTurn(s, { message: '查询订单 SF-2048' });
  const followUp = await runTurn(s, { message: '这笔订单的物流呢？' });
  assert.equal(s.verifiedOrderId, 'SF-2048'); assert.match(followUp.content, /运输中/);
});
test('refund requires a valid session-bound token and is idempotent', async () => {
  const s = createSession();
  const proposal = await runTurn(s, { message: '退款 SF-1024' });
  assert.equal(proposal.route, 'confirmation'); assert.equal(s.orders.get('SF-1024').refundId, null);
  const other = createSession();
  const denied = await runTurn(other, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(denied.route, 'denied');
  const first = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(first.route, 'completed'); const refundId = s.orders.get('SF-1024').refundId;
  const again = await runTurn(s, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(again.duplicate, true); assert.equal(again.id, first.id);
  assert.equal(s.orders.get('SF-1024').refundId, refundId);
  assert.equal(again.trace.some(t => t.tool === 'create_refund_request'), false);
});
test('refund eligibility is checked again after confirmation', async () => {
  const s = createSession(); const result = await runTurn(s, { message: '退款 SF-1024' });
  s.orders.get('SF-1024').amount = 999;
  const response = await runTurn(s, { action: 'confirm', actionId: result.confirmation.id });
  assert.equal(response.route, 'denied'); assert.equal(s.orders.get('SF-1024').refundId, null);
});
test('cancellation leaves the order unchanged and invalidates confirmation', async () => {
  const s = createSession(); const result = await runTurn(s, { message: '退款 SF-1024' });
  const cancelled = await runTurn(s, { action: 'cancel', actionId: result.confirmation.id });
  assert.equal(cancelled.route, 'cancelled'); assert.equal(s.pendingAction, null);
  const repeated = await runTurn(s, { action: 'confirm', actionId: result.confirmation.id });
  assert.equal(repeated.route, 'cancelled'); assert.equal(s.orders.get('SF-1024').refundId, null);
});
test('handoff invalidates pending writes and subsequent messages only append to ticket', async () => {
  const s = createSession(); const pending = await runTurn(s, { message: '退款 SF-1024' });
  const result = await runTurn(s, { message: '请转人工' });
  assert.equal(s.owner, 'human'); assert.ok(result.ticket.summary.includes('退款 SF-1024'));
  assert.ok(result.ticket.actions.some(a => a.includes('查询订单')));
  const denied = await runTurn(s, { action: 'confirm', actionId: pending.confirmation.id });
  assert.equal(denied.route, 'denied');
  const followUp = await runTurn(s, { message: '再查询订单 SF-2048' });
  assert.equal(followUp.model, null); assert.equal(followUp.trace.some(t => t.tool), false);
  assert.ok(s.ticket.notes.includes('再查询订单 SF-2048')); assert.equal(s.orders.get('SF-1024').refundId, null);
});
test('each session has an isolated demo order store', async () => {
  const a = createSession(); const b = createSession();
  const pending = await runTurn(a, { message: '退款 SF-1024' });
  await runTurn(a, { action: 'confirm', actionId: pending.confirmation.id });
  assert.ok(a.orders.get('SF-1024').refundId); assert.equal(b.orders.get('SF-1024').refundId, null);
});
