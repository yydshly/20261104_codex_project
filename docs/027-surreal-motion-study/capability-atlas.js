'use strict';

(() => {
  const root = document.getElementById('capability-atlas-root');
  const atlas = window.CAPABILITY_ATLAS;
  if (!root) return;
  if (!atlas || !Array.isArray(atlas.dimensions) || !atlas.dimensions.length) {
    root.innerHTML = '<p role="status">表现能力资料尚未载入。</p>';
    return;
  }

  const text = (value) => Array.isArray(value) ? value.map(text).join('；') : value && typeof value === 'object' ? Object.values(value).map(text).join('；') : String(value ?? '');
  const escape = (value) => text(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const states = [
    { id: 'all', label: '全部状态' },
    { id: 'observed', label: '原片观察' },
    { id: 'static', label: '静态已探索' },
    { id: 'proposed', label: '扩展待验证' }
  ];
  const stateKey = (value) => {
    const status = text(value).toLowerCase();
    if (status === 'observed' || /原片|已观察/.test(status)) return 'observed';
    if (status === 'static' || /静态/.test(status)) return 'static';
    return 'proposed';
  };
  const stateLabel = (value) => states.find((state) => state.id === value)?.label || states[3].label;
  const dimensions = atlas.dimensions.map((dimension) => ({
    ...dimension,
    entries: (Array.isArray(dimension.entries) ? dimension.entries : []).map((entry) => ({ ...entry, state: stateKey(entry.status) }))
  }));
  const allEntries = dimensions.flatMap((dimension) => dimension.entries);
  const meta = atlas.meta || {};
  let selected = 0;
  let filter = 'all';
  const matches = (entry) => filter === 'all' || entry.state === filter;
  const badge = (state) => `<span class="ca-state ca-state-${state}">${escape(stateLabel(state))}</span>`;
  const field = (label, value) => value ? `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>` : '';
  const safeHref = (value) => {
    const href = text(value).trim();
    if (!href || /^(?:javascript|data|vbscript):/i.test(href) || (/^[a-z][a-z\d+.-]*:/i.test(href) && !/^https?:/i.test(href))) return '';
    return href;
  };
  const links = (items) => (Array.isArray(items) ? items : []).map((item) => {
    const href = safeHref(item.href);
    return href ? `<a class="text-link" href="${escape(href)}"${/^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(item.label || '查看依据')} ↗</a>` : '';
  }).join('');

  root.innerHTML = `
    <div class="chapter-header ca-header">
      <p class="eyebrow">VISUAL / ACTION / CAMERA / EXPRESSION</p>
      <h1 id="atlas-title">${escape(meta.title || '把表现手法，整理成可扩展的能力谱系。')}</h1>
      <p class="lead">${escape(meta.lead || '从原片中总结已有表现，再扩展画面、动作、相机、光色与节律的组合。')}</p>
      ${meta.scope ? `<p class="ca-scope">${escape(meta.scope)}</p>` : ''}
    </div>
    <div class="ca-summary" aria-label="能力条目状态概览">
      <p><strong>${allEntries.length}</strong><span>项表现手法 / ${dimensions.length} 个维度</span></p>
      ${states.slice(1).map((state) => `<p><strong>${allEntries.filter((entry) => entry.state === state.id).length}</strong><span>${state.label}</span></p>`).join('')}
    </div>
    <p class="ca-reading-note">状态记录依据范围；“原片观察”表示画面中可见，“静态已探索”表示已有候选图，“扩展待验证”表示创作设想。</p>
    <div class="ca-dimension-tabs" id="ca-dimension-tabs" role="tablist" aria-label="选择表现能力维度">
      ${dimensions.map((dimension, index) => `<button class="ca-dimension-tab" type="button" role="tab" id="ca-dimension-tab-${index}" data-ca-dimension="${index}" aria-selected="${index === 0}" aria-controls="ca-dimension-panel" tabindex="${index === 0 ? 0 : -1}"><span class="ca-dimension-number">${String(index + 1).padStart(2, '0')}</span><span class="ca-dimension-name">${escape(dimension.title)}</span><span class="ca-dimension-count" data-ca-dimension-count="${index}">${dimension.entries.length} 项</span></button>`).join('')}
    </div>
    <div class="ca-filter-row"><span class="ca-filter-label">按依据查看</span><div class="ca-status-filters" id="ca-status-filters" role="group" aria-label="筛选能力依据状态">${states.map((state) => `<button type="button" data-ca-status="${state.id}" aria-pressed="${state.id === 'all'}">${state.label}</button>`).join('')}</div></div>
    <section class="ca-dimension-panel" id="ca-dimension-panel" role="tabpanel" aria-labelledby="ca-dimension-tab-0">
      <div class="ca-panel-heading"><div><h2 id="ca-dimension-title"></h2><p id="ca-dimension-intro"></p></div><p class="ca-results-count" id="ca-results-count" role="status"></p></div>
      <div class="ca-entry-list" id="ca-entry-list"></div>
      <div class="ca-empty" id="ca-empty" hidden><p id="ca-empty-message"></p><button type="button" class="button secondary" data-ca-clear>查看本维度全部状态</button></div>
    </section>
    <div class="section-heading ca-combination-heading"><div><p class="eyebrow">COMBINE THE DIMENSIONS</p><h2>跨维度组合，形成不同的呈现方向</h2></div><p>把画面、动作与相机放在同一组关系里研究。</p></div>
    <div class="ca-combinations" id="ca-combinations">${(Array.isArray(atlas.combinations) ? atlas.combinations : []).map((combination) => `<article><div class="ca-combination-top"><h3>${escape(combination.title)}</h3>${badge(stateKey(combination.status))}</div><p class="ca-combination-items">${escape(combination.items)}</p>${combination.feeling ? `<p class="ca-combination-feeling"><span>预期感受</span>${escape(combination.feeling)}</p>` : ''}</article>`).join('')}</div>
    ${(Array.isArray(atlas.limits) ? atlas.limits : []).length ? `<div class="ca-limits"><h2>怎样读这份能力谱系</h2><ul>${atlas.limits.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div>` : ''}
  `;

  const $ = (id) => root.querySelector('#' + id);
  const tabs = [...root.querySelectorAll('[data-ca-dimension]')];
  function renderEntries() {
    const dimension = dimensions[selected];
    const visible = dimension.entries.filter(matches);
    $('ca-dimension-title').textContent = dimension.title || '';
    $('ca-dimension-intro').textContent = text(dimension.intro);
    $('ca-results-count').textContent = `${stateLabel(filter)} · 显示 ${visible.length} / ${dimension.entries.length} 项`;
    $('ca-entry-list').innerHTML = visible.map((entry) => `<article class="ca-entry"><div class="ca-entry-heading"><div class="ca-entry-meta"><span>${escape(entry.id || '')}</span>${badge(entry.state)}</div><h3>${escape(entry.title)}</h3><p class="ca-effect">${escape(entry.effect)}</p></div><div class="ca-entry-detail"><dl>${field('可改变的变量', entry.controls)}${field('当前依据', entry.evidence)}${field('可扩展方向', entry.extension)}</dl>${links(entry.links) ? `<div class="ca-entry-links">${links(entry.links)}</div>` : ''}</div></article>`).join('');
    $('ca-empty').hidden = visible.length > 0;
    $('ca-empty-message').textContent = filter === 'all' ? '这个维度暂未录入条目。' : `这个维度下暂无“${stateLabel(filter)}”条目。可以切换依据状态或查看其他维度。`;
    root.querySelector('[data-ca-clear]').hidden = filter === 'all';
    $('ca-dimension-panel').setAttribute('aria-labelledby', `ca-dimension-tab-${selected}`);
    tabs.forEach((tab, index) => {
      const active = index === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const count = dimensions[index].entries.filter(matches).length;
      root.querySelector(`[data-ca-dimension-count="${index}"]`).textContent = filter === 'all' ? `${count} 项` : `${count} / ${dimensions[index].entries.length} 项`;
    });
    root.querySelectorAll('[data-ca-status]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.caStatus === filter)));
  }
  function setDimension(index, focus = false) {
    if (!Number.isInteger(index) || index < 0 || index >= dimensions.length) return;
    selected = index;
    renderEntries();
    if (focus) tabs[selected].focus({ preventScroll: true });
  }
  root.addEventListener('click', (event) => {
    const dimension = event.target.closest('[data-ca-dimension]');
    if (dimension) { setDimension(Number(dimension.dataset.caDimension)); return; }
    const state = event.target.closest('[data-ca-status]');
    if (state && states.some((item) => item.id === state.dataset.caStatus)) { filter = state.dataset.caStatus; renderEntries(); return; }
    if (event.target.closest('[data-ca-clear]')) { filter = 'all'; renderEntries(); }
  });
  $('ca-dimension-tabs').addEventListener('keydown', (event) => {
    if (!event.target.closest('[data-ca-dimension]')) return;
    let next = selected;
    if (event.key === 'ArrowRight') next = (selected + 1) % dimensions.length;
    else if (event.key === 'ArrowLeft') next = (selected + dimensions.length - 1) % dimensions.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = dimensions.length - 1;
    else return;
    event.preventDefault();
    setDimension(next, true);
  });
  renderEntries();
})();
