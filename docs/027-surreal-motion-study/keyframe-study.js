'use strict';

(() => {
  const root = document.getElementById('keyframe-study-root');
  const validStudy = (study) => study && Array.isArray(study.frames) && study.frames.length;
  const configuredGroups = Array.isArray(window.KEYFRAME_GROUPS) ? window.KEYFRAME_GROUPS.filter((group) => validStudy(group.study)) : [];
  const groups = configuredGroups.length ? configuredGroups : validStudy(window.KEYFRAME_STUDY) ? [{ id: 'keyframes', label: '原创关键帧', study: window.KEYFRAME_STUDY }] : [];
  if (!root || !groups.length) return;

  const escape = (value) => String(Array.isArray(value) ? value.join('；') : value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let groupIndex = 0;
  let frames = [];
  let meta = {};
  let tabs = [];
  let selected = 0;
  const frameSelections = groups.map(() => 0);
  const field = (label, value) => value ? `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>` : '';
  const comparisonRows = [
    ['主体比例', 'subjectScale'],
    ['观看位置', 'viewpoint'],
    ['路线组织', 'route'],
    ['光色关系', 'color'],
    ['构图变化', 'composition']
  ];

  function renderGroup() {
    const group = groups[groupIndex];
    frames = group.study.frames;
    meta = group.study.meta || {};
    const labels = frames.map((frame, index) => frame.label || String.fromCharCode(65 + index));
    root.innerHTML = `
    ${groups.length > 1 ? `<div class="kf-group-switch" role="tablist" aria-label="选择关键帧研究组">${groups.map((item, index) => `<button class="kf-group-tab" type="button" role="tab" id="kf-group-tab-${index}" aria-selected="${index === groupIndex}" aria-controls="kf-group-panel" tabindex="${index === groupIndex ? 0 : -1}" data-kf-group="${index}">${escape(item.label)}</button>`).join('')}</div>` : ''}
    <div id="kf-group-panel" ${groups.length > 1 ? `role="tabpanel" aria-labelledby="kf-group-tab-${groupIndex}"` : ''}>
    <div class="chapter-header kf-header">
      <p class="eyebrow">${escape(meta.eyebrow || 'ORIGINAL KEYFRAMES / VISUAL STUDIES')}</p>
      <h1 id="keyframes-title">${escape(meta.title || '原创静态关键帧对比。')}</h1>
      <p class="lead">${escape(meta.theme || `本组 ${frames.length} 张原创静态关键帧，比较氛围、尺度与前进方向。`)}</p>
      <p class="kf-scope">${escape(meta.scope || '当前只比较静态关键帧；运动与产品演示等待看完后决定。')}</p>
      <p class="kf-motion-link"><a href="#motion" class="text-link">结合原片，看动作、镜头与节奏怎样配合情绪 ↗</a></p>
    </div>
    <div class="kf-gallery" role="tablist" aria-label="选择原创关键帧">
      ${frames.map((frame, index) => `<button class="kf-choice" type="button" id="kf-tab-${index}" role="tab" aria-selected="${index === 0}" aria-controls="kf-detail-panel" tabindex="${index === 0 ? 0 : -1}" data-kf-index="${index}"><span class="kf-choice-image"><img src="${escape(frame.image)}" alt="${escape(frame.alt || frame.title)}" ${index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="kf-letter" aria-hidden="true">${escape(frame.label || String.fromCharCode(65 + index))}</span></span><span class="kf-choice-title">${escape(frame.title)}</span><span class="kf-choice-caption">${escape(frame.tagline)}</span></button>`).join('')}
    </div>
    <div class="kf-gallery-meta"><p>${escape(meta.common || '结合每张图的氛围、构图与技术说明比较。')}</p><span>点击选图 · 方向键或 ${escape(labels.join(' / '))} 切换</span></div>
    <div class="kf-presentation-actions"><button type="button" class="button secondary" data-presentation-jump>看当前场景的展示设计 ↓</button><span>主体 · 相机 · 环境 · 开场—展开—落点</span></div>
    <div id="kf-detail-panel" class="kf-detail-panel" role="tabpanel" aria-labelledby="kf-tab-0">
      <div class="kf-large-stage"><button class="image-button" id="kf-zoom" type="button" aria-label="放大当前原创关键帧"><img id="kf-large-image" alt=""></button><span class="kf-large-label" id="kf-large-label"></span><span class="kf-zoom-hint" aria-hidden="true">点击查看原图 ↗</span></div>
      <div class="kf-action-plan" id="kf-action-plan" hidden></div>
      <div class="kf-detail-copy" aria-live="polite"><div class="kf-detail-heading"><span class="evidence-label">当前候选 · 原创生成图</span><h2 id="kf-detail-title"></h2><p id="kf-detail-tagline"></p></div><dl id="kf-explanation" class="kf-explanation"></dl><div class="kf-inspect"><span class="evidence-label">看图时重点判断</span><p id="kf-inspect-text"></p></div></div>
    </div>
    <div class="section-heading kf-comparison-heading"><div><p class="eyebrow">SIDE BY SIDE</p><h2>${escape(meta.comparisonTitle || '把本组候选放在同一张表里')}</h2></div><p>比较的是候选画面的设计与实际可见关系。</p></div>
    <div class="kf-table-scroll"><table class="kf-comparison-table"><caption class="sr-only">本组 ${frames.length} 张原创关键帧的主体、观看位置、路线、光色与构图对比</caption><thead><tr><th scope="col">观察项</th>${frames.map((frame) => `<th scope="col"><span>${escape(frame.label)}</span>${escape(frame.title)}</th>`).join('')}</tr></thead><tbody>${comparisonRows.map(([label, key]) => `<tr><th scope="row">${label}</th>${frames.map((frame) => `<td>${escape(frame.comparison?.[key] || (key === 'composition' ? frame.composition : key === 'color' ? meta.common : '未单独记录，请结合上方原图比较。'))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <p class="evidence-note kf-method-note"><strong>制作记录：</strong>本组 ${frames.length} 张图使用内置 image_gen 生成，作为原创静态关键帧，以 SDR 图片展示。技术说明记录视觉设计手法；涉及镜头与运动的部分是后续设想。此页尚未实现实时 3D、视频运动或真实 HDR 交付。</p>
    <details class="analysis-details kf-prompt-details"><summary>查看本组 ${frames.length} 张图的完整生成提示词</summary><div class="kf-prompts">${frames.map((frame) => `<section><h3>${escape(frame.label)} · ${escape(frame.title)}</h3><pre>${escape(frame.prompt || '提示词记录待补充。')}</pre></section>`).join('')}</div></details>
    </div>
  `;
    tabs = [...root.querySelectorAll('[data-kf-index]')];
    setKeyframe(Math.min(frameSelections[groupIndex], frames.length - 1));
  }
  function setKeyframe(index, focus = false) {
    const parsed = Number(index);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= frames.length) return;
    selected = parsed;
    frameSelections[groupIndex] = selected;
    const frame = frames[selected];
    root.querySelector('#kf-large-image').src = frame.image;
    root.querySelector('#kf-large-image').alt = frame.alt || frame.title;
    const zoom = root.querySelector('#kf-zoom');
    zoom.dataset.image = frame.image;
    zoom.dataset.imageTitle = `原创关键帧 ${frame.label} · ${frame.title}`;
    root.querySelector('#kf-large-label').textContent = `${frame.label} / 原创静态关键帧`;
    root.querySelector('#kf-detail-title').textContent = `${frame.label} · ${frame.title}`;
    root.querySelector('#kf-detail-tagline').textContent = frame.tagline || '';
    root.querySelector('#kf-explanation').innerHTML = [
      field('氛围', frame.mood),
      field('构图', frame.composition),
      field('技术设计', frame.technique),
      field('借鉴了什么', frame.borrowed),
      field('原创变化', frame.original),
      field('取舍', frame.tradeoff)
    ].join('');
    root.querySelector('#kf-inspect-text').textContent = Array.isArray(frame.inspect) ? frame.inspect.join('；') : frame.inspect || '先看主体、空间和路线是否清楚，再判断希望保留的氛围。';
    const plan = window.KEYFRAME_ACTION_PLANS?.[frame.id];
    const planPanel = root.querySelector('#kf-action-plan');
    planPanel.hidden = !plan;
    planPanel.innerHTML = plan ? `<span class="evidence-label">动作与情绪设想 · 待验证</span><div class="kf-action-grid"><p><strong>主体动作</strong>${escape(plan.action)}</p><p><strong>观看关系</strong>${escape(plan.camera)}</p><p><strong>时间节律</strong>${escape(plan.rhythm)}</p><p><strong>情绪目标</strong>${escape(plan.emotion)}</p></div><p class="kf-action-limit">静态图只能承载氛围和构图，以上动作与情绪尚未制作或验证。<a href="#motion">查看原片研究与更多组合 ↗</a></p>` : '';
    window.renderPresentationDesign?.(frame.id, planPanel, frame);
    root.querySelector('#kf-detail-panel').setAttribute('aria-labelledby', `kf-tab-${selected}`);
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (focus) tabs[selected].focus({ preventScroll: true });
  }

  function setGroup(index, focus = false) {
    const parsed = Number(index);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= groups.length) return;
    groupIndex = parsed;
    renderGroup();
    if (focus) root.querySelector(`[data-kf-group="${groupIndex}"]`)?.focus({ preventScroll: true });
  }

  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-presentation-jump]')) {
      root.querySelector('#kf-action-plan')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    const groupButton = event.target.closest('[data-kf-group]');
    if (groupButton) {
      setGroup(Number(groupButton.dataset.kfGroup), true);
      return;
    }
    const button = event.target.closest('[data-kf-index]');
    if (button) setKeyframe(Number(button.dataset.kfIndex));
  });
  root.addEventListener('keydown', (event) => {
    if (event.target.closest('[data-kf-group]')) {
      let nextGroup = groupIndex;
      if (event.key === 'ArrowRight') nextGroup = (groupIndex + 1) % groups.length;
      else if (event.key === 'ArrowLeft') nextGroup = (groupIndex + groups.length - 1) % groups.length;
      else if (event.key === 'Home') nextGroup = 0;
      else if (event.key === 'End') nextGroup = groups.length - 1;
      else return;
      event.preventDefault();
      setGroup(nextGroup, true);
      return;
    }
    if (!event.target.closest('[data-kf-index]')) return;
    let next = selected;
    if (event.key === 'ArrowRight') next = (selected + 1) % frames.length;
    else if (event.key === 'ArrowLeft') next = (selected + frames.length - 1) % frames.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = frames.length - 1;
    else return;
    event.preventDefault();
    setKeyframe(next, true);
  });
  document.addEventListener('keydown', (event) => {
    const view = root.closest('[data-view]');
    if (view?.hidden || event.ctrlKey || event.metaKey || event.altKey || document.querySelector('dialog[open]') || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const index = frames.findIndex((frame) => String(frame.label || '').toLowerCase() === event.key.toLowerCase());
    if (index >= 0 && index < frames.length) {
      event.preventDefault();
      setKeyframe(index, true);
    }
  });

  window.setKeyframe = setKeyframe;
  window.setKeyframeGroup = setGroup;
  renderGroup();
})();
