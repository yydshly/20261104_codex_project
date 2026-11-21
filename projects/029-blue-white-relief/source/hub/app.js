(() => {
  'use strict';
  const H = window.HUB;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const records = new Map(H.resources.map(record => [record.id, record]));
  const keys = new Map(H.resources.map(record => [record.key, record]));
  const categories = { source: '原作与来源', stills: '静帧样本', procedural: '程序微动（非AI）', native: 'AI原片与对照', delivery: '本地修正与交付', instructions: '实际指令', draft: '未执行/历史草案', web: '网页、模板与配置', verification: '验收与测量记录', capability: '能力档案', maintenance: '维护与复核文件' };
  const sizes = bytes => bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  const viewButton = (id, text = '查看依据') => `<button type="button" class="text-link" data-record="${escape(id)}">${escape(text)} ↗</button>`;
  const originalLink = (id, text = '独立打开') => `<a class="text-link" href="${escape(records.get(id).href)}" target="_blank" rel="noopener noreferrer">${escape(text)} ↗</a>`;

  $('updated').textContent = '整理于 ' + H.meta.updated;
  $('current-conclusion').textContent = H.curation.conclusion;
  $('still-count').textContent = H.meta.stillCount;
  $('native-count').textContent = H.meta.nativeCount;
  $('delivery-count').textContent = H.meta.deliveryCount;
  $('credit-total').textContent = H.meta.credits;
  $('source-poster').src = H.source.poster;
  $('source-link').href = H.meta.sourcePost;
  $('source-play').dataset.record = H.source.videoRef;
  $('palette-open').dataset.record = H.source.paletteRef;
  $('delivery-grid').innerHTML = H.deliveries.map(item => `<article class="delivery-card"><div class="card-heading"><h3>${escape(item.subject)} · 当前交付版</h3><span class="pill checked">本地处理 · 0生成积分</span></div><video controls muted playsinline preload="metadata" src="${escape(item.video)}" poster="${escape(item.poster)}" aria-label="${escape(item.subject)}第二轮曝光匹配无音轨交付版"></video><div class="media-meta"><span>${escape(item.size)} · 24fps · ${item.duration.toFixed(2)}秒 · 无音轨</span><span>选定区域亮度波动约 ${item.variation.toFixed(2)}%</span></div><p>${escape(item.summary)}</p><div class="button-row">${viewButton(item.comparisonRef, '看原片/校正并排')}${viewButton(item.reportRef, '校正依据')}<a class="text-link" href="${escape(item.video)}" download>下载交付版 ↓</a></div></article>`).join('');
  $('entry-grid').innerHTML = H.entries.map(item => `<article class="entry-card"><button type="button" class="entry-image" data-record="${item.ref}" aria-label="在本页打开${escape(item.title)}"><img src="${escape(item.image)}" alt="${escape(item.title)}预览" loading="lazy"></button><span>${escape(item.label)}</span><h4>${escape(item.title)}</h4><p>${escape(item.subtitle)}</p><div class="button-row">${viewButton(item.ref, '本页查看')}${originalLink(item.ref)}</div></article>`).join('');
  $('still-grid').innerHTML = H.stills.map(item => `<article class="still-card"><button type="button" data-record="${item.ref}" aria-label="放大${escape(item.title)}静帧"><img src="${escape(item.image)}" alt="${escape(item.title)}文字生成静帧" loading="lazy"></button><div><h4>${escape(item.title)}静帧</h4><p>一个实际样本；具体图像模型版本与种子未知。</p>${viewButton(item.motionRef, '看程序微动（非AI）')}</div></article>`).join('');

  const roundText = {
    1: '<strong>第一轮：山水、茶器各一段。</strong> 局部运动可见，但山水船位与雾区外溢，茶器后段蒸汽减弱；开场变暗。客户端虽然接受关闭声音，实际请求被脚本固定为sound=1。',
    2: '<strong>第二轮：沿用输入图，定向约束船位、雾区与持续供汽。</strong> 本次样本有所改善，曝光与原片音轨仍未通过。参数与随机性同时存在，两轮差异不能独立证明提示词的因果效果。',
    3: '<strong>第三轮：只执行茶器探针，实际75积分。</strong> 同一PNG改作单图参考，sound使用JSON布尔false。片内亮度波动减小，整体参考明度及无音轨门槛仍未通过。按已确认的条件，本轮没有提交山水。'
  };
  function showRound(number) {
    document.querySelectorAll('[data-round]').forEach(button => {
      const active = Number(button.dataset.round) === number;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    $('round-panel').setAttribute('aria-labelledby', `round-tab-${number}`);
    $('round-explainer').innerHTML = roundText[number];
    $('trial-grid').innerHTML = H.trials.filter(item => item.round === number).map(item => `<article class="trial-card"><div class="trial-top"><h3>${escape(item.subject)} · 第${number}轮</h3><span class="pill sample">AI原片 · ${item.cost}积分</span></div><div class="pill failed">原生曝光 / 无音轨未通过</div><p class="verdict">${escape(item.verdict)}</p><p>${escape(item.summary)}</p><div class="trial-parameters"><b>${escape(item.mode)}</b> · 实际sound=${escape(item.sound)}<br>${escape(item.size)} · ${item.duration.toFixed(2)}秒 · Seedance 2.0<br>任务 ${escape(item.task)}</div><div class="button-row">${viewButton(item.videoRef, '播放AI原片')}${viewButton(item.promptRef, '准确指令')}${viewButton(item.reportRef, '完整验片记录')}</div></article>`).join('') + (number === 3 ? '<article class="unsubmitted"><span class="pill unknown">未提交 · 无新增片段</span><h3>第三轮山水没有生成。</h3><p>茶器探针未通过全部原片门槛，按确认条件停止追加。山水指令草案保留在资料索引中，不能算已经执行或已经验证。</p></article>' : '');
  }
  const roundButtons = [...document.querySelectorAll('[data-round]')];
  roundButtons.forEach((button, index) => {
    button.addEventListener('click', () => showRound(Number(button.dataset.round)));
    button.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? roundButtons[(index + 1) % 3] : event.key === 'ArrowLeft' ? roundButtons[(index + 2) % 3] : null;
      if (next) { event.preventDefault(); next.click(); next.focus(); }
    });
  });
  showRound(2);

  let query = '';
  let capabilityState = 'all';
  let category = 'all';
  let pageIndex = 0;
  const pageSize = 12;
  const fold = value => String(value).toLowerCase().replace(/[一二三]/g, char => ({ 一: '1', 二: '2', 三: '3' })[char]);
  function renderCapabilities() {
    const found = H.curation.capabilities.filter(item => (capabilityState === 'all' || item.state === capabilityState) && fold([item.title, item.label, item.evidence, item.limit].join(' ')).includes(fold(query)));
    $('capability-body').innerHTML = found.length ? found.map(item => `<tr><th scope="row">${escape(item.title)}<br><span class="pill ${item.state}">${escape(item.label)}</span></th><td data-label="现有证据">${escape(item.evidence)}</td><td data-label="有效范围与限制">${escape(item.limit)}</td><td data-label="依据"><div class="evidence-links">${item.refs.map((id, index) => viewButton(id, `证据 ${index + 1}`)).join('')}</div></td></tr>`).join('') : '<tr><td colspan="4" class="empty-row">没有匹配的能力项，可清除搜索或切换状态。</td></tr>';
    $('capability-count').textContent = `显示 ${found.length} / ${H.curation.capabilities.length} 项。顶部搜索也会筛选下方资料索引；没有把“已有样本”提升为稳定生产能力。`;
  }
  $('capability-filters').addEventListener('click', event => {
    const button = event.target.closest('[data-state]');
    if (!button) return;
    capabilityState = button.dataset.state;
    document.querySelectorAll('[data-state]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    renderCapabilities();
  });
  $('excluded-grid').innerHTML = H.curation.excluded.map(item => `<article class="excluded-item"><span class="pill ${item.state}">${item.state === 'failed' ? '未通过' : '未验证'}</span><h4>${escape(item.title)}</h4><p>${escape(item.detail)}</p></article>`).join('');
  $('scenario-list').innerHTML = H.curation.scenarios.map((item, index) => `<article class="scenario"><h3><span>0${index + 1}</span>${escape(item.title)}</h3><div><p>${escape(item.supported)}</p><small>功能依据：${escape(item.basis)}</small></div><p class="boundary">${escape(item.boundary)}</p></article>`).join('');
  $('value-grid').innerHTML = H.curation.value.map((item, index) => `<article class="value-card"><span>VALUE / 0${index + 1}</span><h4>${escape(item.title)}</h4><p>${escape(item.fact)}</p><small>${escape(item.limit)}</small></article>`).join('');

  Object.entries(categories).forEach(([value, label]) => {
    const count = H.resources.filter(record => record.category === value).length;
    if (!count) return;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = `${label} (${count})`;
    $('category-select').append(option);
  });
  function renderResources() {
    const filtered = H.resources.filter(item => (category === 'all' || item.category === category) && fold([item.title, item.key, item.status, categories[item.category]].join(' ')).includes(fold(query)));
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    pageIndex = Math.max(0, Math.min(pageIndex, pages - 1));
    const selected = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    $('record-list').innerHTML = selected.length ? selected.map(item => `<article class="record-row"><div class="record-name"><strong>${escape(item.title)}</strong><small>${escape(categories[item.category])} / ${escape(item.status)}<br>${escape(item.key)}</small></div><div class="record-meta">${escape(item.extension.toUpperCase())}<br>${sizes(item.bytes)}</div><div class="record-actions"><button type="button" data-record="${item.id}" aria-label="查看${escape(item.title)}">查看</button><a href="${escape(item.href)}" target="_blank" rel="noopener noreferrer" aria-label="打开${escape(item.title)}原件">原件 ↗</a></div></article>`).join('') : '<div class="empty-row">没有匹配资料，可修改关键词或选择其他类别。</div>';
    $('record-count').textContent = `${filtered.length} 条匹配 / 共 ${H.resources.length} 条相关资料`;
    $('page-indicator').textContent = `第 ${pageIndex + 1} / ${pages} 页`;
    $('previous-page').disabled = pageIndex === 0;
    $('next-page').disabled = pageIndex >= pages - 1;
  }
  $('category-select').addEventListener('change', event => { category = event.target.value; pageIndex = 0; renderResources(); });
  $('previous-page').addEventListener('click', () => { pageIndex--; renderResources(); });
  $('next-page').addEventListener('click', () => { pageIndex++; renderResources(); });
  function updateSearch() {
    query = $('global-search').value.trim();
    $('clear-search').hidden = !query;
    pageIndex = 0;
    renderCapabilities();
    renderResources();
  }
  $('global-search').addEventListener('input', updateSearch);
  $('clear-search').addEventListener('click', () => { $('global-search').value = ''; updateSearch(); $('global-search').focus(); });
  renderCapabilities();
  renderResources();

  const viewer = $('viewer');
  const viewerBody = $('viewer-body');
  let returnFocus;
  function posterFor(record) {
    if (record.category === 'source') return H.source.poster;
    const still = H.stills.find(item => record.key.includes(item.title === '山水' ? 'landscape' : item.title === '茶器' ? 'teapot' : 'lotus'));
    return still?.image || '';
  }
  function openRecord(record) {
    if (!record) return;
    returnFocus = document.activeElement;
    document.querySelectorAll('video').forEach(video => video.pause());
    viewerBody.replaceChildren();
    viewer.classList.toggle('wide', record.kind === 'page');
    $('viewer-category').textContent = `${categories[record.category]} / ${record.status}`;
    $('viewer-title').textContent = record.title;
    $('viewer-subtitle').textContent = `${record.key} · ${sizes(record.bytes)}`;
    $('viewer-original').href = record.href;
    $('viewer-note').textContent = record.kind === 'page' ? '需要持续编辑时，可独立打开页面并保存配置。' : record.kind === 'text' ? `原文快照 · SHA-256 ${record.sha256.slice(0, 16)}…` : '使用已有文件播放或查看，没有重新生成。';
    if (record.kind === 'page') {
      const frame = document.createElement('iframe');
      frame.src = record.href;
      frame.title = record.title;
      frame.allow = 'autoplay; fullscreen';
      viewerBody.append(frame);
    } else if (record.kind === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.muted = true;
      video.playsInline = true;
      video.src = record.href;
      video.poster = posterFor(record);
      video.setAttribute('aria-label', record.title);
      viewerBody.append(video);
      video.play().catch(() => {});
    } else if (record.kind === 'image') {
      const image = document.createElement('img');
      image.src = record.href;
      image.alt = record.title;
      viewerBody.append(image);
    } else {
      const pre = document.createElement('pre');
      pre.tabIndex = 0;
      pre.setAttribute('aria-label', '原文记录');
      let content = record.content || '该文件未内嵌正文，请独立打开原文件查看。';
      if (record.extension === 'json') { try { content = JSON.stringify(JSON.parse(content), null, 2); } catch {} }
      pre.textContent = content;
      viewerBody.append(pre);
    }
    viewer.showModal();
    document.body.classList.add('modal-open');
    $('viewer-close').focus();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-record],[data-key]');
    if (!button) return;
    openRecord(button.dataset.record ? records.get(button.dataset.record) : keys.get(button.dataset.key));
  });
  $('viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const box = viewer.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    viewerBody.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
    viewerBody.querySelectorAll('iframe').forEach(frame => { frame.src = 'about:blank'; });
    viewerBody.replaceChildren();
    document.body.classList.remove('modal-open');
    returnFocus?.focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause()); });
  $('jump-section').addEventListener('change', event => { $(event.target.value).scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.sidebar nav a').forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
        $('jump-section').value = entry.target.id;
      });
    }, { rootMargin: '-10% 0px -65% 0px' });
    document.querySelectorAll('main>section').forEach(section => observer.observe(section));
  }
})();
