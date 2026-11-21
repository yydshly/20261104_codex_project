(() => {
  'use strict';
  const { directions, categories, sources, routes } = window.ATLAS;
  const $ = selector => document.querySelector(selector);
  const byId = id => directions.find(d => d.id === id);
  const categoryOf = d => categories.find(c => c.id === d.category);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = name => `<svg aria-hidden="true"><use href="#${escape(name)}"/></svg>`;
  const modelNames = { commission: '按项目定制', retainer: '按期服务', asset: '数字资产', tool: '工具产品' };
  const levelNames = ['', '较易起步', '需要打磨', '交付较复杂'];
  const repeatNames = ['', '多为单次', '可做加购', '适合持续服务'];
  const strengthNames = { visual: '视觉与修图', operations: '内容与沟通', code: '编程与工具' };
  const goalNames = { first: '验证第一笔收入', recurring: '发展复购客户', ip: '积累内容与资产', tool: '探索技术产品' };
  const STORE = 'visual-business-atlas:v1';
  let storageEnabled = true;
  function readStore() {
    try { const value = JSON.parse(localStorage.getItem(STORE) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
    catch { storageEnabled = false; return {}; }
  }
  const saved = readStore();
  const compared = new Set((Array.isArray(saved.compared) ? saved.compared : []).filter(id => byId(id)).slice(0, 3));
  const planChecks = saved.planChecks && typeof saved.planChecks === 'object' && !Array.isArray(saved.planChecks) ? saved.planChecks : {};
  let planId = byId(saved.planId) ? saved.planId : 'pet';
  let category = 'all';
  let expanded = false;
  let toastTimer;
  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify({ compared: [...compared], planId, planChecks })); }
    catch { storageEnabled = false; }
  }
  function toast(message) {
    const el = $('#toast');
    clearTimeout(toastTimer);
    el.textContent = message;
    el.classList.add('visible');
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
  }
  function detailButton(id, label = '查看方向', className = 'details-button') {
    const title = byId(id).title;
    const accessibleLabel = label === title ? `查看：${title}` : `${label}：${title}`;
    return `<button type="button" class="${className}" data-detail="${id}" aria-label="${escape(accessibleLabel)}">${escape(label)} ${svg('arrow')}</button>`;
  }
  function compareButton(d) {
    const selected = compared.has(d.id);
    return `<button type="button" class="compare-button" data-compare="${d.id}" aria-pressed="${selected}" aria-label="${selected ? '移出对比' : '加入对比'}：${escape(d.title)}">${selected ? '✓ 已加入对比' : '＋ 加入对比'}</button>`;
  }
  function renderCategories() {
    const all = [{ id: 'all', name: '全部方向' }, ...categories];
    const pool = $('#has-samples').checked ? directions.filter(d => window.STICKERLAB?.packs.some(p => p.directionIds.includes(d.id))) : directions;
    $('#categories').innerHTML = all.map(c => `<button type="button" class="filter-tab" data-category="${c.id}" aria-pressed="${c.id === category}">${c.name}<span>${c.id === 'all' ? pool.length : pool.filter(d => d.category === c.id).length}</span></button>`).join('');
  }
  function filteredDirections() {
    const query = $('#search').value.trim().toLocaleLowerCase();
    const audience = $('#audience').value;
    const result = directions.filter(d => (!$('#has-samples').checked || window.STICKERLAB?.packs.some(p => p.directionIds.includes(d.id)))
      && (category === 'all' || d.category === category)
      && (audience === 'all' || d.audience === audience)
      && (!query || [d.title, d.tagline, d.customer, d.value, d.offer, d.channel, window.CARRIER_ATLAS?.directionProducts[d.id]?.label || '', ...d.expansion, categoryOf(d).name].join(' ').toLocaleLowerCase().includes(query)));
    const order = $('#sort').value;
    return result.sort((a, b) => (order === 'easy' ? a.level - b.level : order === 'repeat' ? b.repeat - a.repeat : 0) || a.priority - b.priority);
  }
  function card(d) {
    const c = categoryOf(d);
    const product = window.CARRIER_ATLAS?.directionProducts[d.id];
    const productLine = product ? `<p class="carrier-product-line"><small>具体载体</small>${escape(product.label)}${product.carrier ? `<br><button type="button" data-open-carrier="${product.carrier}">在载体地图里查看 ↗</button>` : ''}</p>` : '';
    const sample = window.STICKERLAB?.packs.find(p => p.directionIds.includes(d.id));
    const samplePreview = sample ? `<div class="card-sample"><img src="assets/stickers/${sample.id}/${sample.stickers[0].id}.png" alt="${escape(sample.stickers[0].label)}表情成品" loading="lazy" width="48" height="48"><div><button type="button" data-effect-pack="${sample.id}">看对应表情成品 ↗</button><small>${escape(sample.label)} · 4 张动图可下载</small></div></div>` : '<span class="card-no-sample">对应作品待制作 · 当前为方向分析</span>';
    return `<article class="direction-card${compared.has(d.id) ? ' selected' : ''}" data-id="${d.id}" data-color="${c.color}">
      <div class="card-top"><span class="category-label">${svg(c.icon)}${c.name}</span><span class="card-number">NO. ${d.no}</span></div>
      <div class="card-body"><h3>${escape(d.title)}</h3><p class="card-tagline">${escape(d.tagline)}</p>${productLine}
      <p class="card-delivery"><span>最小交付包</span>${escape(d.offer)}</p>
      <div class="card-metrics"><span class="metric-pill" aria-label="交付难度：${levelNames[d.level]}"><span class="level-dots" aria-hidden="true">${[1, 2, 3].map(n => `<i class="${n <= d.level ? 'filled' : ''}"></i>`).join('')}</span>${levelNames[d.level]}</span><span class="metric-pill">${modelNames[d.model]}</span><span class="metric-pill">${repeatNames[d.repeat]}</span></div>${samplePreview}</div>
      <div class="card-footer">${detailButton(d.id, '价值与扩展')}${compareButton(d)}</div></article>`;
  }
  function renderGrid() {
    const matches = filteredDirections();
    const visible = expanded ? matches : matches.slice(0, 6);
    $('#direction-grid').innerHTML = visible.map(card).join('');
    $('#direction-grid').classList.toggle('sample-results', $('#has-samples').checked);
    $('#result-count').innerHTML = `找到 <strong>${matches.length}</strong> 个方向${matches.length > visible.length ? ` · 当前展示 ${visible.length} 个` : ''}`;
    $('#empty-state').hidden = matches.length > 0;
    $('#show-more').hidden = matches.length <= 6;
    $('#show-more').innerHTML = expanded ? '收起为前 6 个方向 <span>↑</span>' : `展开全部 ${matches.length} 个方向 <span>↓</span>`;
  }
  function updateFilter() { expanded = false; renderGrid(); }
  $('#categories').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    category = button.dataset.category;
    // Update pressed states in place so keyboard focus stays on the selected filter.
    $('#categories').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    updateFilter();
  });
  $('#search').addEventListener('input', updateFilter);
  $('#audience').addEventListener('change', updateFilter);
  $('#sort').addEventListener('change', updateFilter);
  $('#has-samples').addEventListener('change', () => { renderCategories(); updateFilter(); });
  $('#reset-filters').addEventListener('click', () => {
    category = 'all'; $('#search').value = ''; $('#audience').value = 'all'; $('#sort').value = 'recommended'; $('#has-samples').checked = false;
    renderCategories(); updateFilter(); $('#search').focus();
  });
  $('#show-more').addEventListener('click', () => {
    expanded = !expanded;
    renderGrid();
    if (!expanded) $('#atlas').scrollIntoView({ behavior: motionBehavior() });
  });
  function motionBehavior() { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; }

  function renderCompareDock() {
    $('#compare-dock').hidden = compared.size === 0;
    $('#compare-count').textContent = `${compared.size} / 3`;
    $('#open-compare').disabled = compared.size < 2;
    $('#open-compare').title = compared.size < 2 ? '再选一个方向即可对比' : '打开方向对比';
    $('#compare-items').innerHTML = [...compared].map(id => `<span class="compare-chip"><span>${escape(byId(id).title)}</span><button type="button" data-compare="${id}" aria-label="移出对比：${escape(byId(id).title)}">×</button></span>`).join('');
    document.querySelectorAll('.compare-button').forEach(b => {
      const selected = compared.has(b.dataset.compare);
      b.setAttribute('aria-pressed', String(selected));
      b.setAttribute('aria-label', `${selected ? '移出对比' : '加入对比'}：${byId(b.dataset.compare).title}`);
      b.textContent = selected ? '✓ 已加入对比' : '＋ 加入对比';
    });
    document.querySelectorAll('.direction-card').forEach(el => el.classList.toggle('selected', compared.has(el.dataset.id)));
  }
  function toggleCompare(id) {
    if (!byId(id)) return;
    if (compared.has(id)) compared.delete(id);
    else if (compared.size < 3) compared.add(id);
    else { toast('最多对比 3 个方向，请先移除一个。'); return; }
    persist(); renderCompareDock();
  }
  $('#clear-compare').addEventListener('click', () => { compared.clear(); persist(); renderCompareDock(); toast('已清空对比方向。'); });
  $('#open-compare').addEventListener('click', () => {
    if (compared.size < 2) return;
    const selected = [...compared].map(byId);
    const rows = [
      ['客户', d => d.customer], ['具体载体', d => window.CARRIER_ATLAS?.directionProducts[d.id]?.label || '待明确'], ['付费价值', d => d.value], ['最小交付包', d => d.offer],
      ['交付难度', d => levelNames[d.level]], ['复购方式', d => repeatNames[d.repeat]],
      ['适合的能力', d => d.strengths.map(x => strengthNames[x]).join('、')],
      ['第一个客户', d => d.channel], ['扩展空间', d => d.expansion.join('；')],
      ['应验证的信号', d => d.signal], ['交付边界', d => d.boundary]
    ];
    $('#compare-table').innerHTML = `<table><caption class="sr-only">所选方向的价值、交付与扩展对比</caption><thead><tr><th scope="col">比较维度</th>${selected.map(d => `<th scope="col">${detailButton(d.id, d.title)}</th>`).join('')}</tr></thead><tbody>${rows.map(([name, value]) => `<tr><th scope="row">${name}</th>${selected.map(d => `<td>${escape(value(d))}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    $('#compare-dialog').showModal();
  });

  function list(items, ordered = false) { const tag = ordered ? 'ol' : 'ul'; return `<${tag}>${items.map(x => `<li>${escape(x)}</li>`).join('')}</${tag}>`; }
  function openDetail(id) {
    const d = byId(id); if (!d) return;
    const c = categoryOf(d);
    const product = window.CARRIER_ATLAS?.directionProducts[id];
    const productLine = product ? `<p class="detail-product-carrier"><b>具体载体</b><span>${escape(product.label)}</span>${product.carrier ? `<button type="button" data-open-carrier="${product.carrier}">查看载体与场景 ↗</button>` : ''}</p>` : '';
    const sample = window.STICKERLAB?.packs.find(p => p.directionIds.includes(id));
    const sampleExt = window.StickerLab?.isPlaying() === false ? 'png' : 'gif';
    const sampleSection = sample ? `<section class="detail-real-sample"><img src="assets/stickers/${sample.id}/${sample.stickers[0].id}.${sampleExt}" data-gif="assets/stickers/${sample.id}/${sample.stickers[0].id}.gif" data-png="assets/stickers/${sample.id}/${sample.stickers[0].id}.png" alt="${escape(sample.stickers[0].label)}动图成品" width="95" height="95"><div><h3>已有可查看的表情交付样品</h3><p>${escape(sample.label)}：包含四张 GIF、透明 PNG 和对话语境。样品用于展示表达效果，尚未验证客户成交。</p><button type="button" class="button primary" data-effect-pack="${sample.id}">打开对应效果 ↗</button></div></section>` : '<p class="detail-no-sample">这个方向尚未制作独立作品，当前内容为价值与交付分析。</p>';
    $('#compare-dialog').close();
    $('#detail-content').innerHTML = `<div class="detail-header"><p class="detail-category">NO. ${d.no} / ${c.name}</p><h2 id="detail-title">${escape(d.title)}</h2><p class="detail-tagline">${escape(d.tagline)}</p><div class="detail-facts"><span>${escape(d.customer)}</span><span>${modelNames[d.model]}</span><span>${levelNames[d.level]}</span></div></div>
      ${productLine}${sampleSection}<div class="detail-value"><h3>客户为什么付费</h3><p>${escape(d.value)}</p></div>
      <div class="detail-columns"><section class="detail-section"><h3>最小可售交付</h3><p class="detail-offer">${escape(d.offer)}</p>${list(d.deliverables)}</section><section class="detail-section"><h3>交付做到什么程度</h3>${list(d.acceptance)}</section></div>
      <section class="detail-section"><h3>从哪里找到第一位客户</h3><p>${escape(d.channel)}</p></section>
      <section class="detail-section"><h3>可扩展方向</h3><div class="detail-expansion">${d.expansion.map((x, i) => `<div><b>0${i + 1}</b>${escape(x)}</div>`).join('')}</div></section>
      <section class="detail-section"><h3>最小验证实验</h3>${list(d.experiment, true)}</section>
      <div class="plan-signal"><p><strong>值得继续的信号</strong>${escape(d.signal)}</p><p><strong>不成立时怎么调整</strong>${escape(d.pivot)}</p></div>
      <p class="detail-boundary"><b>交付边界</b> · ${escape(d.boundary)}</p>
      <p class="detail-sources">相关参考（支持商品或交付形式，不证明销量）<br>${d.sources.map(id => { const s = sources.find(x => x.id === id); return `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${escape(s.title)} ↗</a>`; }).join('')}</p>
      <div class="detail-actions"><button type="button" class="button primary" data-plan="${id}">把它设为本次实验 ${svg('arrow')}</button>${compareButton(d)}</div>`;
    const dialog = $('#detail-dialog');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-detail],[data-compare],[data-plan]');
    if (!target) return;
    if (target.dataset.detail) openDetail(target.dataset.detail);
    else if (target.dataset.compare) toggleCompare(target.dataset.compare);
    else if (target.dataset.plan) {
      planId = target.dataset.plan;
      $('#detail-dialog').close();
      $('#plan-direction').value = planId;
      persist(); renderPlan();
      $('#experiment').scrollIntoView({ behavior: motionBehavior() });
      $('#plan-direction').focus({ preventScroll: true });
      toast(`本次实验：${byId(planId).title}`);
    }
  });

  let routeId = 'shop';
  function renderRouteTabs() {
    $('#route-tabs').innerHTML = routes.map(route => `<button type="button" role="tab" id="route-tab-${route.id}" data-route="${route.id}" aria-controls="route-content" aria-selected="${route.id === routeId}" tabindex="${route.id === routeId ? '0' : '-1'}">${route.label}</button>`).join('');
  }
  function renderRoute() {
    const route = routes.find(x => x.id === routeId);
    $('#route-content').setAttribute('aria-labelledby', `route-tab-${route.id}`);
    $('#route-content').innerHTML = `<div class="route-head"><h3>${route.heading}</h3><p>${route.description}</p></div><div class="route-stages">${route.stages.map(([n, title, text, id]) => `<article class="route-stage"><span>${n}</span><h4>${title}</h4><p>${text}</p>${detailButton(id, '看这个方向')}</article>`).join('')}</div>`;
  }
  function setRoute(id, focus = false) {
    routeId = id;
    $('#route-tabs').querySelectorAll('button').forEach(b => { b.setAttribute('aria-selected', String(b.dataset.route === id)); b.tabIndex = b.dataset.route === id ? 0 : -1; });
    renderRoute();
    if (focus) $(`#route-tab-${id}`).focus();
  }
  $('#route-tabs').addEventListener('click', event => { const b = event.target.closest('[data-route]'); if (b) setRoute(b.dataset.route); });
  $('#route-tabs').addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = routes.findIndex(r => r.id === routeId);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? routes.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + routes.length) % routes.length;
    setRoute(routes[next].id, true);
  });

  function renderRecommendations() {
    const form = new FormData($('#starter-form'));
    const goal = form.get('goal'), strength = form.get('strength'), access = form.get('access');
    const suggestions = directions.map(d => {
      let score = 0; const reasons = [];
      if (d.goals.includes(goal)) { score += 6; reasons.push(`适合${goalNames[goal]}`); }
      if (d.strengths.includes(strength)) { score += 5; reasons.push(`能用上你的${strengthNames[strength]}能力`); }
      if (d.audience === access) { score += 5; reasons.push('与你更容易接触的客户相符'); }
      if (goal === 'first') score += 3 - d.level;
      if (goal === 'recurring') score += d.repeat;
      if (access === 'none' && d.level === 1) score += 1;
      return { d, score, reasons };
    }).sort((a, b) => b.score - a.score || a.d.priority - b.d.priority).slice(0, 3);
    $('#recommendations').innerHTML = `<div class="rec-intro"><strong>可以先研究这 3 个</strong><span>根据当前选择更新</span></div>${suggestions.map(({ d, reasons }, i) => `<article class="rec-card"><span class="rec-index">${i + 1}</span><div><h3>${escape(d.title)}</h3><p>${escape(reasons.slice(0, 2).join('；'))}。</p></div>${detailButton(d.id, '查看')}</article>`).join('')}<p class="rec-tip">${access === 'none' ? '你暂时没有客户入口：优先安排 3 次目标用户访谈，再做大套样品。' : '已有接触渠道是起点。用一份有明确范围的样品，询问实际付费意愿。'}</p>`;
  }
  $('#starter-form').addEventListener('change', renderRecommendations);
  $('#starter-form').addEventListener('submit', event => event.preventDefault());

  function stepsFor(d) {
    return [
      ['DAY 1', '定义客户与交付范围', `目标客户：${d.customer}。写清交付件数、使用范围、修改次数，以及是否包含平台投稿或实物生产。`],
      ['DAY 2—3', '做一个完整小样', d.experiment[0]],
      ['DAY 4', '带着样品找真实使用者', d.experiment[1]],
      ['DAY 5—6', '验证一次实际付费', d.experiment[2]],
      ['DAY 7', '算工时，决定继续或调整', '记录制作、沟通、改稿、获客与现金成本。用右侧计算器复盘，并依据下方信号决定下一步。']
    ];
  }
  function checkedFor(id) {
    const raw = planChecks[id];
    return Array.isArray(raw) ? raw.filter(n => Number.isInteger(n) && n >= 0 && n < 5) : [];
  }
  function renderPlan() {
    const d = byId(planId);
    const checks = new Set(checkedFor(planId));
    $('#plan-steps').innerHTML = stepsFor(d).map(([day, title, text], i) => `<label class="plan-step"><input type="checkbox" data-step="${i}" ${checks.has(i) ? 'checked' : ''}><div><span class="day">${day}</span><strong>${title}</strong><p>${escape(text)}</p></div></label>`).join('');
    $('#plan-signal').innerHTML = `<p><strong>继续的信号</strong>${escape(d.signal)}</p><p><strong>如果不成立</strong>${escape(d.pivot)}</p>`;
    updatePlanProgress();
  }
  function updatePlanProgress() {
    const n = new Set(checkedFor(planId)).size;
    $('#plan-progress-text').textContent = `已完成 ${n} / 5`;
    $('#plan-progress').style.width = `${n * 20}%`;
    $('.progress-caption span:last-child').textContent = storageEnabled ? '只保存在当前浏览器' : '本次会话有效，建议下载清单';
  }
  $('#plan-direction').innerHTML = directions.map(d => `<option value="${d.id}">${d.no} · ${escape(d.title)}</option>`).join('');
  $('#plan-direction').value = planId;
  $('#plan-direction').addEventListener('change', event => { planId = event.target.value; persist(); renderPlan(); });
  $('#plan-steps').addEventListener('change', event => {
    if (!event.target.matches('input[data-step]')) return;
    planChecks[planId] = [...$('#plan-steps').querySelectorAll('input:checked')].map(input => Number(input.dataset.step));
    persist(); updatePlanProgress();
  });
  $('#export-plan').addEventListener('click', () => {
    const d = byId(planId), checked = new Set(checkedFor(planId));
    const lines = [`# 七天验证清单：${d.title}`, '', `整理日期：${window.ATLAS.updated}`, '', '本清单是产品试验建议，不是市场需求或收益承诺。', '', '## 客户与价值', '', `目标客户：${d.customer}`, '', d.value, '', '## 交付范围', '', d.offer, '', '## 验证任务', '', ...stepsFor(d).map(([day, title, text], i) => `- [${checked.has(i) ? 'x' : ' '}] ${day} · ${title}\n  ${text}`), '', '## 继续的信号', '', d.signal, '', '## 不成立时的调整', '', d.pivot, '', '## 可扩展方向', '', ...d.expansion.map(s => `- ${s}`), '', '## 交付边界', '', d.boundary, '', '## 成本复盘', '', `- 实付金额：${$('#price').value} 元`, `- 现金成本：${$('#cash').value} 元`, `- 平台及支付费率：${$('#fee').value}%`, `- 制作时间：${$('#production').value} 分钟`, `- 沟通与修改：${$('#revision').value} 分钟`, `- 分摊获客：${$('#acquisition').value} 分钟`, `- 目标劳动报酬：${$('#target').value} 元/小时`, '- 以上为计算器当前输入，需替换为该项目真实记录；未计税费、设备折旧和固定经营开支。', '', '## 参考资料', '', ...d.sources.map(id => { const s = sources.find(x => x.id === id); return `- [${s.title}](${s.url})`; }), ''];
    const blob = new Blob(['\uFEFF', lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = `七天验证-${d.title}.md`; document.body.appendChild(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('已发起清单下载，包含当前勾选与成本输入。');
  });

  const money = n => Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  function calculate() {
    const inputs = [...$('#calculator').querySelectorAll('input')];
    if (inputs.some(input => input.value === '' || !input.validity.valid || !Number.isFinite(input.valueAsNumber))) {
      $('#calc-result').innerHTML = '<p class="calc-error">请填写完整的有效数字。金额和时间不能为负数，费率需在 0—99.9% 之间。</p>';
      return;
    }
    const v = Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber]));
    const hours = (v.production + v.revision + v.acquisition) / 60;
    const balance = v.price * (1 - v.fee / 100) - v.cash;
    const hourly = hours > 0 ? balance / hours : null;
    const priceFloor = (v.cash + v.target * hours) / (1 - v.fee / 100);
    let interpretation;
    if (balance < 0) interpretation = '这组输入下，实付款尚未覆盖现金支出。先检查报价、现金成本与交付范围。';
    else if (!hours) interpretation = '请填写至少 1 分钟的实际工作时间，才能计算每小时结余。';
    else if (hourly < v.target) interpretation = `低于你设定的 ${money(v.target)} 元/小时。可以缩小交付范围、限制改稿或调整报价，再用真实订单复核。`;
    else interpretation = '达到当前设定的劳动报酬目标。还应考虑未计入的经营开支、退款和淡季获客。';
    $('#calc-result').innerHTML = `<div class="result-primary"><span>每小时现金结余</span><strong>${hourly === null ? '—' : money(hourly)}<small>元 / 小时</small></strong></div><div class="result-secondary"><p>本单劳动报酬前结余<strong>${money(balance)} 元</strong></p><p>达到目标的参考实付价<strong>${money(priceFloor)} 元</strong></p></div><p class="calc-interpretation">${interpretation}</p>`;
  }
  $('#calculator').addEventListener('input', calculate);
  $('#calculator').addEventListener('submit', event => event.preventDefault());

  function renderSources() {
    $('#source-list').innerHTML = sources.map(s => `<details><summary><span>${escape(s.title)}<small>${s.type}</small></span></summary><p>${escape(s.note)}</p><a href="${s.url}" target="_blank" rel="noopener noreferrer">打开原始资料 ↗</a></details>`).join('');
  }
  renderCategories(); renderGrid(); renderCompareDock(); renderRouteTabs(); renderRoute(); renderRecommendations(); renderPlan(); calculate(); renderSources();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.site-header nav a').forEach(a => a.classList.toggle('active', a.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-12% 0px -65% 0px', threshold: 0 });
    ['carriers', 'human-value', 'showcase', 'atlas', 'routes', 'start', 'experiment'].forEach(id => observer.observe(document.getElementById(id)));
  }
})();
