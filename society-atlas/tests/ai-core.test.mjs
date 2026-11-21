import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(readFileSync(new URL('../dist/ai-core.js', import.meta.url), 'utf8'), context);
const core = context.window.AI_CORE;
const plain = value => JSON.parse(JSON.stringify(value));
const topic = 'workflow-efficiency';

test('restoring an old AI topic preserves long encoded searches and spaces', () => {
  const query = new URLSearchParams({q:'我想了解人工智能，我想知道记忆是什么，是否会记住我呢 AI',domain:'ai'});
  const hash = '#search?' + query;
  assert.ok(hash.length > 180);
  assert.ok(hash.includes('+'));
  const restored = core.normalizeState({entry:{mode:'explore',returnHash:hash}},[topic]);
  assert.equal(restored.entry.returnHash,hash);
  assert.equal(core.normalizeState({entry:{mode:'explore',returnHash:'#search?q='+ 'x'.repeat(2000)}},[topic]).entry.returnHash,'#home');
});

test('the same local speedup has different overall gains; new work can reverse a gain', () => {
  assert.equal(core.calculateEfficiency(10).total, 92);
  assert.equal(core.calculateEfficiency(90).total, 28);
  assert.equal(core.calculateEfficiency(90, 20).total, 48);
  // The migration exercise uses original coding 90, other 10 and NEW review 20: 18 + 10 + 20 = 48.
  assert.equal(core.calculateEfficiency(10, 20).total, 112);
  assert.equal(core.calculateEfficiency(10, 20).saved, -12);
  assert.equal(core.calculateEfficiency(90, 20).codingAfter, 18);
});

test('invalid and out-of-range simulator input stays finite without silently becoming zero', () => {
  assert.equal(core.calculateEfficiency(NaN, Infinity).total, 92);
  assert.equal(core.calculateEfficiency('', '', '').total, 92);
  assert.equal(core.calculateEfficiency(-500, -10, 400).codingBefore, 5);
  assert.equal(core.calculateEfficiency(900, 900, -500).review, 60);
  assert.equal(core.calculateEfficiency(25, 0, 0).total, 100);
  assert.equal(core.calculateEfficiency(25, 0, 100).total, 75);
});

test('challenge requires a numeric answer and a written explanation, without certifying its meaning', () => {
  assert.equal(core.evaluateChallenge({ answer: '', explanation: '我已经输入足够长的一段解释文字。' }).valid, false);
  assert.equal(core.evaluateChallenge({ answer: 48, explanation: '18+10+20' }).valid, false);
  assert.equal(core.evaluateChallenge({ answer: 48, explanation: '                        ' }).valid, false);
  const response = core.evaluateChallenge({ answer: '48', explanation: '这是一段足够长但完全没有数学含义的说明文字。' });
  assert.equal(response.valid, true);
  assert.equal(response.correct, true);
  assert.match(response.message, /未判断解释是否正确/);
  assert.equal(core.evaluateChallenge({ answer: 38, explanation: '我把全部环节都加起来后得到三十八分钟。' }).correct, false);
  assert.equal(core.evaluateChallenge({ answer: 'abc', explanation: '我已经输入足够长的一段解释文字。' }).valid, false);
});

test('browsing, simulator changes and arbitrary mastery flags never create a record', () => {
  const state = core.normalizeState({ visited: [topic], mastered: [topic], experiments: { [topic]: { share: 90, review: 20 } } }, [topic]);
  assert.equal(core.getTopicStatus(state, topic), 'unexplored');
  assert.equal(Object.keys(state.records).length, 0);
  assert.equal(core.getTopicStatus({ records: {}, questions: { [topic]: { text: '我有一个问题' } } }, topic), 'question');
});

test('corrupt, unknown, prototype and ungrounded records are discarded without losing legitimate questions', () => {
  const raw = JSON.parse('{"questions":{"workflow-efficiency":{"text":"这个结论在什么条件下成立？","updatedAt":"2026-11-04T12:00:00Z"},"__proto__":{"polluted":true}},"records":{"workflow-efficiency":{"topic":"other","judgment":"假装有结论","evidence":"假的","boundary":"有限"},"unknown":{"judgment":"x","evidence":"x","boundary":"x"}},"drafts":{"__proto__":"danger","constructor":"danger","question:workflow-efficiency":"<img src=x onerror=alert(1)>"},"entry":{"mode":"goal","returnHash":"javascript:alert(1)"}}');
  const state = core.normalizeState(raw, [topic, '__proto__']);
  assert.equal(Object.keys(state.questions).length, 1);
  assert.equal(Object.keys(state.records).length, 0);
  assert.equal(Object.keys(state.drafts).length, 1);
  assert.equal(state.entry.returnHash, '#home');
  assert.equal({}.polluted, undefined);
  assert.equal(core.getTopicStatus(state, '__proto__'), 'unexplored');
  assert.deepEqual(plain(core.normalizeState(null, [topic]).records), {});
});

test('explicit bounded evidence and review status survive restoration with only supported fields', () => {
  const state = core.normalizeState({ records: { [topic]: {
    id: 'record-123', topic, title: '整体效率', judgment: '应比较整个流程', evidence: '一次构造情境的计算', boundary: '未验证真实项目',
    explanation: '我把原有工作和新增复核分别计算。', answer: 48, checkedAt: '2026-11-04T12:00:00Z', updatedAt: '2026-11-04T12:00:00Z',
    reviewNeeded: true, sourceType: 'hypothetical', unknownFlag: true
  } } }, [topic]);
  assert.equal(core.getTopicStatus(state, topic), 'review');
  assert.equal(state.records[topic].answer, 48);
  assert.equal(state.records[topic].unknownFlag, undefined);
  assert.equal(state.records[topic].checkedAt, '2026-11-04T12:00:00.000Z');
  state.records[topic].reviewNeeded = false;
  assert.equal(core.getTopicStatus(state, topic), 'evidence');
});

test('goal matching respects unrelated inputs, ambiguous ties, and Latin word boundaries', () => {
  const goals = [
    { id: 'coding', keywords: ['编码', '开发效率', 'code'] },
    { id: 'assistant', keywords: ['知识助手', '公司文档'] },
    { id: 'understand', keywords: ['理解AI', 'ai'] }
  ];
  assert.equal(core.pickGoal('我想用 AI 提高开发效率', goals), 'coding');
  assert.equal(core.pickGoal('做一个公司文档知识助手', goals), 'assistant');
  assert.equal(core.pickGoal('邮件 email 怎么管理', goals), null);
  assert.equal(core.pickGoal('做披萨', goals), null);
  assert.equal(core.pickGoal('', goals), null);
  assert.equal(core.pickGoal('共同问题', [{ id: 'a', keywords: ['共同'] }, { id: 'b', keywords: ['共同'] }]), null);
});
