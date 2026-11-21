import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGuideView, renderCapabilityResults, guideTabs } from '../public/guide-view.js';
import { implementationGuide } from '../public/implementation-guide.js';
import { operationsGuide } from '../public/operations-guide.js';
import { capabilityMap } from '../public/capability-map.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const helpers = { escape, icon: () => '<svg aria-hidden="true"></svg>', pageHeader: (eyebrow, title, description, actions) => `<header><h1>${title}</h1><p>${description}</p>${actions}</header>` };
const state = { guideTab: 'overview', guideStatus: 'all', guideCategory: 'all', guideQuery: '', busy: false };
const render = guideTab => renderGuideView({ ...state, guideTab }, helpers);

test('all guide topics render and internal topic links resolve to supported sections', () => {
  assert.equal(guideTabs.length, 9);
  const topics = new Set(guideTabs.map(([id]) => id));
  for (const [id] of guideTabs) {
    const html = render(id);
    assert.ok(html.includes('当前阶段：本地流程演示'));
    assert.equal(/undefined|\[object Object\]/.test(html), false, id);
    for (const match of html.matchAll(/data-guide-tab="([^"]+)"/g)) assert.ok(topics.has(match[1]), match[1]);
  }
  for (const item of [...capabilityMap.readingPath, ...capabilityMap.entrypoints]) {
    if (item.href.startsWith('#guide/')) assert.ok(topics.has(item.href.slice('#guide/'.length)), item.href);
  }
});

test('knowledge lifecycle gates, route budgets and dialogue version limits are visible, not only stored', () => {
  const knowledge = render('knowledge');
  for (const step of implementationGuide.knowledge.steps) {
    for (const field of ['owner', 'input', 'action', 'output', 'gate']) assert.ok(knowledge.includes(escape(step[field])), `${step.id}.${field}`);
  }
  const routing = render('routing');
  for (const row of implementationGuide.routing.decisions) assert.ok(routing.includes(escape(row.budget)));
  const conversation = render('conversation');
  for (const row of implementationGuide.conversation.rules) assert.ok(conversation.includes(escape(row.current)));
  for (const row of implementationGuide.conversation.transport) assert.ok(conversation.includes(escape(row.current)));
});

test('deployment boundaries, real cost calculations and fictional follow-up disclaimers survive rendering', () => {
  const deployment = render('deployment');
  for (const row of operationsGuide.deployment.dataFlow) assert.ok(deployment.includes(escape(row.boundary)));
  for (const row of operationsGuide.deployment.components) {
    for (const field of ['inputs', 'outputs', 'persistence']) assert.ok(deployment.includes(escape(row[field])), `${row.id}.${field}`);
  }
  const rollout = render('rollout');
  assert.ok(rollout.includes(escape(operationsGuide.rollout.costModel.scope)));
  for (const row of operationsGuide.rollout.costModel.items) {
    for (const field of ['unit', 'calculation', 'evidence']) assert.ok(rollout.includes(escape(row[field])), `${row.name}.${field}`);
  }
  assert.ok(render('tickets').includes(escape(operationsGuide.tickets.followupExample.notice)));
  const coverage = render('capabilities');
  for (const row of capabilityMap.scenarioCoverage) assert.ok(coverage.includes(escape(row.currentLimit)));
});

test('capability filters intersect category, status and search without leaking hidden rows', () => {
  const category = capabilityMap.matrix.find(row => row.status === 'planned').category;
  const expected = capabilityMap.matrix.filter(row => row.category === category && row.status === 'planned');
  const html = renderCapabilityResults({ ...state, guideCategory: category, guideStatus: 'planned' }, helpers);
  for (const row of capabilityMap.matrix) assert.equal(html.includes(`<strong>${escape(row.title)}</strong>`), expected.includes(row), row.id);
  const uniqueQuery = capabilityMap.matrix[0].title;
  const searched = renderCapabilityResults({ ...state, guideQuery: uniqueQuery }, helpers);
  assert.ok(searched.includes(`<strong>${escape(uniqueQuery)}</strong>`));
  assert.ok(renderCapabilityResults({ ...state, guideQuery: 'no-match-<script>xyz' }, helpers).includes('没有匹配的能力'));
  const all = renderGuideView({ ...state, guideTab: 'capabilities', guideQuery: '<script>alert(1)</script>' }, helpers);
  assert.equal(all.includes('<script>alert(1)</script>'), false);
});
