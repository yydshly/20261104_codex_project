import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserDemoTransport } from '../public/browser-demo.js';
import * as engine from '../src/engine.mjs';
import { documents, scenarios, tools, architectureNodes, evaluationCases } from '../src/data.mjs';
const make = () => createBrowserDemoTransport({ ...engine, catalog: { documents, scenarios, tools, nodes: architectureNodes, cases: evaluationCases } }, { delay: 0 });
const post = (request, path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const events = async response => (await response.text()).trim().split('\n').map(line => JSON.parse(line));

test('public demo runs the real shared inquiry rules, streams results and keeps writes idempotent', async () => {
  const request = make();
  const session = await (await post(request, '/api/sessions', {})).json();
  const traces = await events(await post(request, '/api/chat', { sessionId: session.id, message: '订单 SF-3096 延迟没到' }));
  assert.ok(traces.some(event => event.type === 'trace' && event.entry.tool === 'get_tracking'));
  const preview = traces.find(event => event.type === 'complete').result;
  assert.ok(preview.confirmation?.id);
  const confirmation = { sessionId: session.id, action: 'confirm', actionId: preview.confirmation.id };
  const first = (await events(await post(request, '/api/chat', confirmation))).find(event => event.type === 'complete').result;
  const second = (await events(await post(request, '/api/chat', confirmation))).find(event => event.type === 'complete').result;
  assert.equal(first.logisticsTicket.id, second.logisticsTicket.id);
  const current = await (await request(`/api/sessions/${session.id}`)).json();
  assert.equal(current.logisticsTickets.length, 1);
  assert.match(current.logisticsTickets[0].note, /未通知真实承运商/);
});

test('public demo state is page-scoped, validates requests and does not masquerade as a remote API', async () => {
  const first = make(); const otherPage = make();
  const session = await (await post(first, '/api/sessions', {})).json();
  assert.equal((await otherPage(`/api/sessions/${session.id}`)).status, 404);
  assert.equal((await post(first, '/api/chat', { sessionId: session.id, message: '' })).status, 400);
  assert.equal((await first('/api/chat', { method: 'POST', body: '{' })).status, 400);
  assert.equal((await post(first, '/api/chat', { sessionId: session.id, action: 'delete', actionId: 'x' })).status, 400);
  assert.equal((await first('/api/unknown')).status, 404);
  assert.equal((await (await first('/api/catalog')).json()).documents.length, documents.length);
});

test('public demo rejects a concurrent turn and completes all workflow regressions', async () => {
  const request = make();
  const session = await (await post(request, '/api/sessions', {})).json();
  const pending = await post(request, '/api/chat', { sessionId: session.id, message: '订单 SF-3096 延迟没到' });
  assert.equal((await post(request, '/api/chat', { sessionId: session.id, message: '查询物流' })).status, 409);
  await pending.text();
  const result = await (await post(request, '/api/evaluate', { mode: 'dual' })).json();
  assert.equal(result.passed, result.total);
  assert.equal(result.total, evaluationCases.length);
});
