/* Pure calculations and defensive local-state parsing for the AI atlas. */
(() => {
  'use strict';

  const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor']);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const own = (object, key) => isObject(object) && Object.prototype.hasOwnProperty.call(object, key);
  const safeKey = value => typeof value === 'string' && value.length > 0 && value.length <= 120 && !forbiddenKeys.has(value) && /^[a-zA-Z0-9_./:-]+$/.test(value);
  const text = (value, max = 2000) => typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, max)
    : '';
  const round = value => Math.round((value + Number.EPSILON) * 1000000) / 1000000;

  function finiteNumber(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string' || !/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value.trim())) return null;
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  function bounded(value, fallback, minimum, maximum) {
    const number = finiteNumber(value);
    return Math.min(maximum, Math.max(minimum, number === null ? fallback : number));
  }

  function calculateEfficiency(share, review = 0, reduction = 80) {
    const codingBefore = bounded(share, 10, 5, 95);
    const other = round(100 - codingBefore);
    const extraReview = bounded(review, 0, 0, 60);
    const decrease = bounded(reduction, 80, 0, 100);
    const codingAfter = round(codingBefore * (1 - decrease / 100));
    const total = round(codingAfter + other + extraReview);
    const saved = round(100 - total);
    return { original: 100, codingBefore, other, codingAfter, review: extraReview, total, saved, percent: saved };
  }

  function evaluateChallenge(input) {
    const answer = finiteNumber(input?.answer);
    const explanation = text(input?.explanation).trim();
    if (answer === null) return { valid: false, correct: false, message: '请填写一个有效的分钟数，再说明你的判断依据。' };
    if (Array.from(explanation.replace(/\s/g, '')).length < 12) {
      return { valid: false, correct: false, message: '请用至少 12 个非空白字符说明计算过程和判断依据。' };
    }
    const correct = Math.abs(answer - 48) <= 0.050000001;
    return {
      valid: true,
      correct,
      message: correct
        ? '数值与本例一致。解释已记录，但系统未判断解释是否正确；请对照依据自行复核。'
        : '这个数值与本例不一致。请检查原有工作和新增复核是否都计入；解释内容需自行复核。'
    };
  }

  function date(value) {
    if (typeof value !== 'string' || value.length > 40 || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return '';
    const time = Date.parse(value);
    return Number.isFinite(time) ? new Date(time).toISOString() : '';
  }

  function normalizeState(raw, topicIds) {
    const input = isObject(raw) ? raw : {};
    const known = new Set((Array.isArray(topicIds) ? topicIds : []).filter(safeKey));
    const state = { version: 1, questions: {}, records: {}, drafts: {}, goal: null, entry: null, experiments: {} };

    if (isObject(input.questions)) {
      for (const [key, question] of Object.entries(input.questions)) {
        if (!known.has(key) || !isObject(question)) continue;
        const value = text(question.text, 1000).trim();
        if (value) state.questions[key] = { text: value, updatedAt: date(question.updatedAt) };
      }
    }

    if (isObject(input.records)) {
      for (const [key, record] of Object.entries(input.records)) {
        if (!known.has(key) || !isObject(record) || (record.topic && record.topic !== key)) continue;
        const judgment = text(record.judgment).trim();
        const evidence = text(record.evidence).trim();
        const boundary = text(record.boundary).trim();
        // A record must carry its own reasoning and limits; views or sliders are never evidence.
        if (!judgment || !evidence || !boundary) continue;
        state.records[key] = {
          id: safeKey(record.id) ? record.id : key,
          topic: key,
          title: text(record.title, 200),
          judgment,
          evidence,
          boundary,
          openQuestion: text(record.openQuestion),
          answer: finiteNumber(record.answer),
          explanation: text(record.explanation),
          checkedAt: date(record.checkedAt),
          updatedAt: date(record.updatedAt),
          reviewNeeded: record.reviewNeeded === true,
          sourceType: text(record.sourceType, 80)
        };
      }
    }

    if (isObject(input.drafts)) {
      for (const [key, value] of Object.entries(input.drafts).slice(0, 200)) {
        if (safeKey(key) && typeof value === 'string') state.drafts[key] = text(value, 5000);
      }
    }

    if (isObject(input.goal)) {
      const goalText = text(input.goal.text, 500).trim();
      if (goalText) state.goal = { text: goalText, route: safeKey(input.goal.route) ? input.goal.route : '' };
    }

    if (isObject(input.entry) && ['goal', 'explore'].includes(input.entry.mode)) {
      const hash = input.entry.returnHash;
      state.entry = {
        mode: input.entry.mode,
        returnHash: typeof hash === 'string' && /^#[a-zA-Z0-9/_?=&.%~:+-]{0,1799}$/.test(hash) ? hash : '#home'
      };
    }

    if (isObject(input.experiments)) {
      for (const [key, value] of Object.entries(input.experiments)) {
        if (!known.has(key) || !isObject(value)) continue;
        const result = calculateEfficiency(value.share, value.review);
        state.experiments[key] = { share: result.codingBefore, review: result.review };
      }
    }
    return state;
  }

  function getTopicStatus(state, id) {
    if (!safeKey(id)) return 'unexplored';
    if (own(state?.records, id)) return state.records[id]?.reviewNeeded === true ? 'review' : 'evidence';
    if (own(state?.questions, id)) return 'question';
    return 'unexplored';
  }

  function pickGoal(input, goals) {
    if (typeof input !== 'string' || !Array.isArray(goals)) return null;
    const query = input.trim().normalize('NFKC').toLowerCase();
    if (!query) return null;
    const candidates = goals.filter(goal => isObject(goal) && safeKey(goal.id)).map(goal => {
      let score = 0;
      const keywords = new Set((Array.isArray(goal.keywords) ? goal.keywords : [])
        .filter(keyword => typeof keyword === 'string' && keyword.trim())
        .map(keyword => keyword.trim().normalize('NFKC').toLowerCase()));
      for (const keyword of keywords) {
        let matches;
        if (/^[a-z0-9 ]+$/.test(keyword)) {
          const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          matches = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`).test(query);
        } else matches = query.includes(keyword);
        if (matches) score += keyword.length;
      }
      return { id: goal.id, score };
    }).filter(candidate => candidate.score > 0).sort((a, b) => b.score - a.score);
    if (!candidates.length || (candidates[1] && candidates[0].score === candidates[1].score)) return null;
    return candidates[0].id;
  }

  window.AI_CORE = Object.freeze({ calculateEfficiency, evaluateChallenge, normalizeState, getTopicStatus, pickGoal });
})();
