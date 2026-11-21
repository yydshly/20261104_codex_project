import test from 'node:test';
import assert from 'node:assert/strict';
import { createAppServer } from '../server.mjs';
import { evaluationCases } from '../src/data.mjs';

test('HTTP flow streams trace and final events; APIs reject malformed and cross-site writes', async () => {
  process.env.NODE_ENV = 'test';
  const server = createAppServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base); assert.equal(page.status, 200); assert.match(await page.text(), /Flowdesk/);
    for (const asset of ['/product.css', '/blueprint.css', '/product-view.js', '/product-plan.js', '/message-parts.js', '/guide.css', '/guide-view.js', '/implementation-guide.js', '/operations-guide.js', '/capability-map.js', '/research.css', '/research-view.js', '/browser-demo.js']) {
      const response = await fetch(`${base}${asset}`);
      assert.equal(response.status, 200, asset);
    }
    for (const name of ['mechanism', 'value']) {
      const response = await fetch(`${base}/assets/knowledge-service-${name}.png`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'image/png');
      const data = Buffer.from(await response.arrayBuffer());
      assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    }
    const session = await (await fetch(`${base}/api/sessions`, { method: 'POST' })).json();
    const response = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: session.id, message: '订单 SF-2048 物流', mode: 'dual' }) });
    assert.match(response.headers.get('content-type'), /ndjson/);
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
    assert.ok(events.some(e => e.type === 'trace' && e.entry.tool === 'get_order'));
    assert.ok(events.some(e => e.type === 'token'));
    assert.equal(events.at(-1).result.route, 'fast');
    const saved = await (await fetch(`${base}/api/sessions/${session.id}`)).json();
    assert.equal(saved.messages.length, 2); assert.equal(saved.verifiedOrderId, 'SF-2048');
    const missing = await fetch(`${base}/api/chat`, { method: 'POST', body: JSON.stringify({ sessionId: session.id, message: '' }) });
    assert.equal(missing.status, 400);
    const cross = await fetch(`${base}/api/sessions`, { method: 'POST', headers: { Origin: 'https://untrusted.example' } });
    assert.equal(cross.status, 403);
    const unknown = await fetch(`${base}/api/sessions/unknown`); assert.equal(unknown.status, 404);
    const results = await (await fetch(`${base}/api/evaluate`, { method: 'POST', body: '{"mode":"single"}' })).json();
    assert.equal(results.passed, evaluationCases.length);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
