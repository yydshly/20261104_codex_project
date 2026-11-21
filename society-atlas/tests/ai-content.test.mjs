import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../dist/ai-data.js', import.meta.url), 'utf8'), context);
const data = context.window.AI_ATLAS_DATA;
const areas = new Map(data.areas.map(item => [item.id, item]));
const topics = new Map(data.topics.map(item => [item.id, item]));
const sources = new Map(data.sources.map(item => [item.id, item]));

test('AI panorama has eight real areas and 24 complete topic destinations', () => {
  assert.equal(areas.size, 8);
  assert.equal(topics.size, 24);
  assert.equal(data.areas.length, areas.size);
  assert.equal(data.topics.length, topics.size);
  const owned = [];
  for (const area of areas.values()) {
    assert(area.title && area.question && area.summary);
    assert.equal(area.topics.length, 3);
    for (const id of area.topics) {
      assert(topics.has(id), `Missing topic ${id}`);
      assert.equal(topics.get(id).area, area.id);
      owned.push(id);
    }
    for (const id of area.related) assert(areas.has(id) && id !== area.id);
  }
  assert.equal(new Set(owned).size, topics.size);
  for (const item of topics.values()) {
    assert(['scenario', 'efficiency', 'validity'].includes(item.type));
    for (const key of ['title', 'shortTitle', 'lead', 'concept', 'why', 'boundary']) assert(item[key]?.trim(), `${item.id}: ${key}`);
    assert(item.mechanism.length >= 3);
    for (const step of item.mechanism) assert(step.title && step.text);
    assert(item.example.title && item.example.text);
    assert(item.tags.length >= 3);
    assert(item.sources.length > 0);
    for (const id of item.sources) assert(sources.has(id), `${item.id}: unknown source ${id}`);
  }
});

test('every topic has a complete transfer scenario with one unambiguous keyed answer', () => {
  for (const item of topics.values()) {
    const scene = item.scenario;
    assert(scene.prompt && scene.explanation && scene.boundary, item.id);
    assert(scene.choices.length >= 2, item.id);
    const ids = scene.choices.map(option => option.id);
    assert.equal(new Set(ids).size, ids.length, item.id);
    assert.equal(ids.filter(id => id === scene.correct).length, 1, item.id);
    for (const option of scene.choices) assert(option.text?.trim(), item.id);
  }
  const efficiency = topics.get('workflow-efficiency');
  assert.equal(efficiency.type, 'efficiency');
  assert.equal(efficiency.scenario.choices.find(item => item.id === efficiency.scenario.correct).text, '48分钟');
  assert.equal(90 * (1 - 0.8) + 10 + 20, 48);
  assert.equal(topics.get('source-validity').type, 'validity');
});

test('cross-domain connections and all three goal routes resolve', () => {
  for (const item of topics.values()) {
    assert(item.relations.length >= 2, item.id);
    assert(item.relations.some(relation => topics.get(relation.id)?.area !== item.area), `${item.id}: missing cross-domain relation`);
    for (const relation of item.relations) {
      assert(topics.has(relation.id), `${item.id}: missing relation ${relation.id}`);
      assert(relation.label && relation.id !== item.id);
    }
  }
  assert.deepEqual(Array.from(data.goals, item => item.id).sort(), ['assistant', 'coding', 'understand']);
  for (const goal of data.goals) {
    assert(goal.title && goal.keywords.length && goal.steps.length >= 3);
    for (const step of goal.steps) assert(step.title && topics.has(step.topic));
    for (const id of goal.areas) assert(areas.has(id));
  }
  assert.equal(data.goals.find(item => item.id === 'coding').steps[0].topic, 'workflow-efficiency');
  assert.equal(data.goals.find(item => item.id === 'assistant').steps[0].topic, 'source-validity');
});

test('source metadata is explicit, uses verified primary-source domains, and has no future check dates', () => {
  const domains = new Set(['developers.google.com', 'oecd.ai', 'airc.nist.gov', 'www.ilo.org']);
  assert.equal(sources.size, data.sources.length);
  for (const source of sources.values()) {
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert(domains.has(url.hostname));
    assert(source.title && source.org);
    assert.match(source.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert(source.checked <= '2026-11-04');
  }
});
