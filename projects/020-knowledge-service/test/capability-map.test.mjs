import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { capabilityMap } from '../public/capability-map.js';
import { productPlan } from '../public/product-plan.js';
import { createSession, runTurn } from '../src/engine.mjs';

const rows = new Map(capabilityMap.matrix.map(row => [row.id, row]));
const statuses = new Set(capabilityMap.statusDefinitions.map(item => item.id));
const categories = new Set(capabilityMap.categories.map(item => item.id));

test('capability matrix is navigable and carries accountable, actionable boundaries', () => {
  assert.equal(rows.size, capabilityMap.matrix.length, 'capability IDs must be unique');
  assert.ok(rows.size >= 22 && rows.size <= 30);
  assert.deepEqual([...statuses].sort(), ['demo', 'implemented', 'planned']);
  for (const status of capabilityMap.statusDefinitions) {
    assert.ok(status.label && status.meaning && status.boundary, `missing scope for ${status.id}`);
    assert.ok(capabilityMap.matrix.some(row => row.status === status.id), `unused status ${status.id}`);
  }
  for (const row of rows.values()) {
    assert.ok(categories.has(row.category), `unknown category ${row.category}`);
    assert.ok(statuses.has(row.status), `unknown status ${row.status}`);
    for (const field of ['title', 'current', 'target', 'nextStep', 'acceptance', 'owner']) {
      assert.equal(typeof row[field], 'string', `${row.id}.${field}`);
      assert.ok(row[field].trim().length > 0, `${row.id}.${field} must be usable`);
    }
    assert.ok(row.evidence.length > 0, `${row.id} must cite the code or target plan`);
  }
  for (const category of categories) assert.ok([...rows.values()].some(row => row.category === category));
});

test('evidence anchors point to readable workspace files and actual source symbols', async () => {
  const sources = new Map();
  for (const reference of new Set(capabilityMap.matrix.flatMap(row => row.evidence))) {
    const separator = reference.indexOf(':');
    assert.ok(separator > 0, `missing source anchor: ${reference}`);
    const file = reference.slice(0, separator); const anchor = reference.slice(separator + 1);
    assert.ok(!file.startsWith('/') && !file.includes('..'), `unexpected external path ${file}`);
    if (!sources.has(file)) sources.set(file, await readFile(new URL(`../${file}`, import.meta.url), 'utf8'));
    assert.ok(sources.get(file).includes(anchor), `source anchor not found: ${reference}`);
  }
});

test('production-only capabilities are not promoted by working local mechanics', () => {
  for (const id of ['identity_auth', 'real_llm', 'semantic_scope', 'durable_state', 'async_context', 'production_handoff', 'model_quality']) {
    assert.equal(rows.get(id).status, 'planned', `${id} requires actual production work`);
  }
  assert.equal(rows.get('seed_facts').status, 'demo');
  assert.equal(rows.get('model_profiles').status, 'demo');
  for (const id of ['confirmation_tokens', 'snapshot_guard', 'idempotent_actions', 'memory_ticket']) {
    assert.equal(rows.get(id).status, 'implemented', `${id} has a real local mechanism`);
  }
});

test('all eight target steps have complete runnable mappings and valid capability references', () => {
  assert.equal(capabilityMap.scenarioCoverage.length, productPlan.walkthrough.steps.length);
  assert.equal(new Set(capabilityMap.scenarioCoverage.map(step => step.stepId)).size, 8);
  assert.deepEqual(capabilityMap.scenarioCoverage.map(step => step.stepId), productPlan.walkthrough.steps.map(step => step.id));
  assert.deepEqual(capabilityMap.scenarioCoverage.map(step => step.step), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const step of capabilityMap.scenarioCoverage) {
    for (const field of ['title', 'targetDialogue', 'runMethod', 'currentLimit']) assert.ok(step[field]?.trim());
    assert.ok(step.capabilityIds.length > 0);
    for (const id of step.capabilityIds) assert.ok(rows.has(id), `step ${step.stepId} references unknown ${id}`);
  }
  assert.ok(capabilityMap.entrypoints.every(entry => entry.href.startsWith('#') && entry.label && entry.purpose));
});

test('current free follow-ups remain limited while explicit delay and status routes run', async () => {
  const session = createSession();
  const first = await runTurn(session, { message: productPlan.walkthrough.steps[0].user });
  assert.equal(first.route, 'clarify');
  const query = await runTurn(session, { message: productPlan.walkthrough.steps[1].user });
  assert.equal(query.route, 'fast');
  const analysisQuestion = await runTurn(session, { message: productPlan.walkthrough.steps[2].user });
  assert.equal(analysisQuestion.route, 'unknown');
  const delay = await runTurn(session, { message: '订单 SF-3096 延迟，请核查物流' });
  assert.equal(delay.model.id, 'demo-deep');
  assert.equal(delay.route, 'confirmation');
  const etaQuestion = await runTurn(session, { message: productPlan.walkthrough.steps[6].user });
  assert.equal(etaQuestion.route, 'unknown');
  assert.equal(session.logisticsTickets.size, 0);
});

test('a textual confirmation does not authorize the actual local write', async () => {
  const session = createSession();
  const proposal = await runTurn(session, { message: '订单 SF-3096 延迟，请催物流' });
  await runTurn(session, { message: productPlan.walkthrough.steps[5].user });
  assert.equal(session.logisticsTickets.size, 0);
  assert.equal(session.pendingAction.id, proposal.confirmation.id);
  const confirmed = await runTurn(session, { action: 'confirm', actionId: proposal.confirmation.id });
  assert.equal(confirmed.route, 'completed');
  assert.equal(session.logisticsTickets.size, 1);
});

test('user SMS remains raw context rather than verified or persisted tool facts', async () => {
  const session = createSession();
  await runTurn(session, { message: '查订单 SF-3096' });
  const note = productPlan.walkthrough.steps[3].user;
  await runTurn(session, { message: note });
  assert.ok(session.messages.some(message => message.role === 'user' && message.content === note));
  assert.equal(Object.hasOwn(session, 'contextVersion'), false);
  assert.equal(Object.hasOwn(session, 'evidenceSnapshots'), false);
  const proposal = await runTurn(session, { message: '那帮我催查一下吧' });
  assert.ok(proposal.confirmation);
  assert.equal(proposal.confirmation.details.some(detail => detail.value.includes('短信')), false);
  assert.equal(Object.hasOwn(proposal.confirmation, 'intentSnapshot'), false);
});
