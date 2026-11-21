import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../dist/data.js', import.meta.url),'utf8'),context);
const data = context.window.ATLAS_DATA;
const systems = new Map(data.systems.map(system=>[system.id,system]));
const sources = new Map(data.sources.map(source=>[source.id,source]));
const topics = new Map(data.systems.flatMap(system=>system.topics.map(topic=>[topic.id,{topic,system}])));
const sourceIdsAreValid = ids => {
  assert(Array.isArray(ids));
  for (const id of ids) assert(sources.has(id),`Unknown source: ${id}`);
};

test('the whole map has seven distinct systems and fourteen complete topics',()=>{
  assert.equal(systems.size,7);
  assert.equal(topics.size,14);
  for (const system of data.systems) {
    assert.equal(system.topics.length,2);
    assert(system.title && system.summary && system.question);
    for (const topic of system.topics) {
      assert(topic.title && topic.summary && topic.why);
      assert(topic.actors.length>=2);
      assert(topic.mechanism.length>=2);
      for (const step of topic.mechanism) assert(step.title && step.description);
      assert(topic.example.title && topic.example.description && topic.example.steps.length>=2);
      assert(topic.ai.observation && topic.ai.caution && topic.ai.questions.length);
      sourceIdsAreValid(topic.sourceIds);
      sourceIdsAreValid(topic.ai.sourceIds);
    }
  }
});

test('all map relations, cross-domain links and guided paths resolve to real content',()=>{
  for (const system of data.systems) {
    for (const relation of system.relations) assert(systems.has(relation.target) && relation.label);
    for (const topic of system.topics) {
      assert(topic.connections.length>=1);
      for (const connection of topic.connections) {
        assert(systems.has(connection.system));
        assert(topics.has(connection.topic));
        assert.equal(topics.get(connection.topic).system.id,connection.system);
        assert.notEqual(connection.system,system.id);
      }
    }
  }
  assert.equal(data.paths.length,3);
  for (const path of data.paths) {
    assert(path.id && path.title && path.description && path.steps.length>=3);
    const systemsInPath = new Set();
    for (const step of path.steps) {
      assert(systems.has(step.system));
      assert(topics.has(step.topic));
      assert.equal(topics.get(step.topic).system.id,step.system);
      systemsInPath.add(step.system);
    }
    assert(systemsInPath.size>=2,`${path.id} must connect systems`);
  }
});

test('historical lenses and references have usable provenance',()=>{
  assert(data.history.length>=3);
  for (const lens of data.history) {
    assert(lens.id && lens.title && lens.summary && lens.organization && lens.knowledge && lens.tension);
    sourceIdsAreValid(lens.sourceIds);
  }
  assert.equal(sources.size,data.sources.length);
  for (const source of data.sources) {
    assert.equal(new URL(source.url).protocol,'https:');
    assert(source.title && source.org && source.checked);
  }
});

test('all deployable entry assets are local and exist',()=>{
  const html=readFileSync(new URL('../dist/society.html',import.meta.url),'utf8');
  for (const filename of ['app.js','data.js','styles.css','favicon.svg']) {
    assert(html.includes(`./${filename}`));
    assert(readFileSync(new URL(`../dist/${filename}`,import.meta.url)).length>0);
  }
  assert(!/<script[^>]+src="https?:/i.test(html));
  assert(html.includes('lang="zh-CN"'));
});

test('the AI entry ships its runtime and keeps the earlier society map reachable',()=>{
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  for (const filename of ['ai.js','ai-core.js','ai-data.js','ai-guide.js','ai-reading.js','ai.css','ai-reading.css','vendor/feather.min.js','favicon.svg']) {
    assert(html.includes(`./${filename}`));
    assert(readFileSync(new URL(`../dist/${filename}`,import.meta.url)).length>0);
  }
  assert(html.includes('./society.html#overview'));
  assert(!/<script[^>]+src="https?:/i.test(html));
  assert(html.includes('lang="zh-CN"'));
});
