import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {} };
for (const name of ['ai-data', 'ai-guide', 'ai-reading']) {
  vm.runInNewContext(fs.readFileSync(new URL(`../dist/${name}.js`, import.meta.url), 'utf8'), sandbox);
}
const data = sandbox.window.AI_ATLAS_DATA;
const articles = sandbox.window.AI_READING;
const guide = sandbox.window.AI_GUIDE;

test('每个知识入口都有可独立阅读的正文和图解', () => {
  assert.equal(Object.keys(articles).length, data.topics.length);
  for (const topic of data.topics) {
    const article = articles[topic.id];
    assert.ok(article, topic.id);
    assert.ok(article.lead.length >= 60, `${topic.id}: 开头应直接讲解`);
    assert.equal(article.sections.length, 3, topic.id);
    assert.ok(article.sections.every(s => s.title && s.body.length >= 70), topic.id);
    assert.ok(article.visual.steps.length >= 3, topic.id);
    assert.ok(article.visual.steps.every(s => s.title && s.text), topic.id);
  }
});

test('科普导览的深入阅读和参考资料没有断链', () => {
  const ids = new Set(data.topics.map(t => t.id));
  const sources = new Set(data.sources.map(s => s.id));
  assert.equal(guide.length, 5);
  for (const chapter of guide) {
    assert.ok(sources.has(chapter.source), chapter.source);
    for (const id of [chapter.topic, ...chapter.related]) assert.ok(ids.has(id), id);
  }
});
