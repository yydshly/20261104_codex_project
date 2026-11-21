(() => {
  'use strict';
  const dataset = window.HUMAN_CASES;
  if (!dataset) return;
  const $ = s => document.querySelector(s);
  const escape = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let selected = 'pet';
  let showJudgments = true;
  const checks = new Map(dataset.cases.map(c => [c.id, new Set()]));
  const current = () => dataset.cases.find(c => c.id === selected);
  function imageCard(kind, title, source, image, alt, note) {
    return `<article class="case-picture ${kind}"><div class="case-picture-top"><span>${kind === 'reference' ? '01 / 参考依据' : kind === 'before' ? '02 / 通用样品' : '03 / 定向返修'}</span><small>${escape(source)}</small></div><button type="button" class="case-picture-button" data-case-image="${kind}" aria-label="放大查看${escape(title)}"><img src="${image}" alt="${escape(alt)}" width="480" height="480"><span class="case-zoom-mark" aria-hidden="true">↗</span></button><div class="case-picture-caption"><h4>${escape(title)}</h4><p>${escape(note)}</p></div></article>`;
  }
  function renderTabs() {
    $('#case-tabs').innerHTML = dataset.cases.map(c => `<button type="button" role="tab" id="case-tab-${c.id}" aria-controls="case-panel" aria-selected="${selected === c.id}" tabindex="${selected === c.id ? '0' : '-1'}" data-case-select="${c.id}"><span>${c.number}</span>${escape(c.label)}</button>`).join('');
  }
  function renderCase() {
    const c = current();
    $('#case-panel').setAttribute('aria-labelledby', `case-tab-${c.id}`);
    $('#case-panel').innerHTML = `<div class="case-heading"><div><span class="micro-label">DESIGN STUDY ${c.number} / SIMULATED BRIEF</span><h3>${escape(c.title)}</h3></div><button type="button" id="case-toggle-judgments" class="sample-control" aria-expanded="${showJudgments}" aria-controls="case-judgments">${showJudgments ? '先隐藏判断，看图自评' : '展开设计判断'}</button></div>
      <div class="case-brief"><div class="case-carrier-line"><span>本例载体：<strong>聊天表情 · 静态 PNG 样品</strong></span><a href="#carriers" data-open-carrier="sticker">查看载体与用途 ↗</a></div><span>${escape(c.briefLabel)}</span><blockquote>“${escape(c.brief)}”</blockquote><p><b>发送时刻</b>${escape(c.scenario)}</p></div>
      <div class="case-pictures">${imageCard('reference', '辨识特征从哪里来', 'AI 模拟参考照片', c.reference, c.referenceAlt, c.referenceNote)}${imageCard('before', c.beforeTitle, '现有文件 · 未使用本轮参考', c.before, `通用样品：${c.beforeTitle}`, c.beforeNote)}${imageCard('after', c.afterTitle, '本轮新生成 · 静态 PNG', c.after, `按参考与需求新生成：${c.afterTitle}`, c.afterNote)}</div>
      <div class="case-comparison-rule"><b>本次核对目标</b><p>对照同一需求，观察外形特征、情绪分寸与发送语境的贴合程度。两版各有用途，使用者的选择是下一步依据。</p></div>
      <section id="case-judgments" class="case-judgments" ${showJudgments ? '' : 'hidden'}><div class="case-judgment-heading"><h4>需要人来确认的设计选择</h4><span>示例方案，尚未由真实客户确认</span></div><div class="case-judgment-grid">${c.judgments.map((j, i) => `<article><span class="judgment-no">0${i + 1}</span><p class="judgment-source">${escape(j.from)}</p><h5>设计判断</h5><p>${escape(j.decision)}</p><div><b>在成品中核对</b>${escape(j.visible)}</div></article>`).join('')}</div><p class="case-human-contribution"><strong>这一步体现什么人的价值？</strong>${escape(c.contribution)}</p></section>
      <section class="case-review"><div><h4>把判断交回本人或客户</h4><p>${escape(c.confirmation)}</p><small>以下是当前页面的自检记录，不是客户满意度或通过分数。</small></div><div class="case-checks">${c.questions.map((q, i) => `<label><input type="checkbox" data-case-check="${i}" ${checks.get(c.id).has(i) ? 'checked' : ''}><span>${escape(q)}</span></label>`).join('')}<p id="case-check-status" role="status" aria-live="polite">已核对 ${checks.get(c.id).size} / ${c.questions.length} 个问题</p></div></section>
      <div class="case-actions"><a class="button primary" href="${c.after}" download="${c.label}-${c.afterTitle}.png">下载定向样品 PNG ↓</a><button type="button" class="button secondary" data-effect-pack="${c.pack}">查看原套装与动图 ↗</button><button type="button" id="case-export-brief" class="text-button">下载设计简报 ↓</button><a class="case-record-link" href="assets/case-sources/generation-record.json" target="_blank" rel="noopener">查看制作依据 ↗</a></div>`;
  }
  function selectCase(id, jump = false) {
    if (!dataset.cases.some(c => c.id === id)) return;
    selected = id;
    renderTabs(); renderCase();
    if (jump) {
      document.querySelectorAll('dialog[open]').forEach(d => d.close());
      $('#human-value').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      $('#case-panel').focus({ preventScroll: true });
    }
  }
  $('#case-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-case-select]');
    if (!button) return;
    selectCase(button.dataset.caseSelect); $(`#case-tab-${selected}`).focus();
  });
  $('#case-tabs').addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const i = dataset.cases.findIndex(c => c.id === selected), n = dataset.cases.length;
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? n - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + n) % n;
    selectCase(dataset.cases[next].id); $(`#case-tab-${selected}`).focus();
  });
  $('#case-panel').addEventListener('change', event => {
    if (!event.target.matches('[data-case-check]')) return;
    const n = Number(event.target.dataset.caseCheck), selectedChecks = checks.get(selected);
    if (event.target.checked) selectedChecks.add(n); else selectedChecks.delete(n);
    $('#case-check-status').textContent = `已核对 ${selectedChecks.size} / ${current().questions.length} 个问题`;
  });
  $('#case-panel').addEventListener('click', event => {
    const imageButton = event.target.closest('[data-case-image]');
    if (imageButton) {
      const c = current(), kind = imageButton.dataset.caseImage;
      const item = kind === 'reference' ? [c.reference, c.referenceAlt, c.referenceNote] : kind === 'before' ? [c.before, `通用样品：${c.beforeTitle}`, c.beforeNote] : [c.after, `本轮定向样品：${c.afterTitle}`, c.afterNote];
      $('#case-zoom-image').src = item[0]; $('#case-zoom-image').alt = item[1];
      $('#case-image-title').textContent = item[1]; $('#case-image-caption').textContent = item[2];
      $('#case-image-dialog').showModal(); return;
    }
    if (event.target.closest('#case-toggle-judgments')) {
      showJudgments = !showJudgments;
      $('#case-judgments').hidden = !showJudgments;
      const button = $('#case-toggle-judgments');
      button.setAttribute('aria-expanded', String(showJudgments));
      button.textContent = showJudgments ? '先隐藏判断，看图自评' : '展开设计判断';
    }
    if (event.target.closest('#case-export-brief')) exportBrief();
  });
  function exportBrief() {
    const c = current();
    const text = [
      `# 设计对照简报：${c.label}`, '', '日期：2026-11-12', '', dataset.evidence, '',
      '## 模拟需求', '', c.brief, '', '## 发送语境', '', c.scenario, '',
      '## 参考依据', '', c.referenceNote, '', ...c.observations.map(x => `- ${x}`), '',
      '## 设计取舍', '', ...c.judgments.map((j, i) => `${i + 1}. 发现：${j.from}\n   判断：${j.decision}\n   核对：${j.visible}`), '',
      '## 成品对应', '', `- 原通用样品：${c.beforeTitle}（${c.before}）`, `- 本轮定向样品：${c.afterTitle}（${c.after}）`, '',
      '## 人的贡献', '', c.contribution, '', '## 待本人确认的问题', '',
      ...c.questions.map((q, i) => `- [${checks.get(c.id).has(i) ? 'x' : ' '}] ${q}`), '',
      '这些勾选只表示页面使用者已核对，不是客户反馈或满意度分数。', '', c.confirmation, ''
    ].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `设计对照-${c.id}.md`; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-case-id]');
    if (button) selectCase(button.dataset.caseId, true);
  });
  renderTabs(); renderCase();
  window.HumanCaseStudio = { open: selectCase };
})();
