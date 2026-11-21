import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('../dist/journey-data.js', import.meta.url), 'utf8'), sandbox);
const { domains, articles } = sandbox.window.JOURNEY_DATA;

test('信息组织地图与继续阅读的目标都能解析为正文', () => {
  for (const node of domains.information.nodes) {
    assert.ok(articles[node.article], `地图入口断链：${node.article}`);
  }
  for (const [id, article] of Object.entries(articles)) {
    assert.equal(article.id, id);
    for (const next of article.related) {
      assert.ok(articles[next], `${id} 的继续阅读断链：${next}`);
      assert.notEqual(next, id, `${id} 不应把继续阅读连回自己`);
    }
  }
});

test('从找书入口可以沿阅读连接到达全部信息组织讲解', () => {
  const visited = new Set();
  const queue = ['info-finding'];
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    queue.push(...articles[id].related);
  }
  assert.deepEqual([...visited].sort(), Object.keys(articles).sort());
});

test('讲解具有直接解释、图解数据和可追溯的外部来源', () => {
  for (const [id, article] of Object.entries(articles)) {
    assert.ok(article.title && article.lead && article.takeaway, id);
    assert.ok(article.sections.every(s => s.title && s.text), id);
    assert.ok(article.visual.steps.every(s => s.title && s.text), id);
    assert.ok(article.sources.length, `${id} 缺少概念出处`);
    for (const reference of article.sources) {
      const url = new URL(reference.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(reference.title, `${id} 缺少来源说明`);
    }
  }
});
