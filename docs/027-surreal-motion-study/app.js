'use strict';

(() => {
  const data = window.STUDY_DATA;
  if (!data) {
    document.getElementById('overview-title').textContent = '研究资料尚未载入';
    return;
  }
  const $ = (id) => document.getElementById(id);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const number = (value) => Number(value).toLocaleString('zh-CN');
  const titles = { overview: '研究汇总', coast: '弯曲海岸', color: '曝光与 HDR', sources: '原片参考库', value: '制作参考', keyframes: '原创关键帧', motion: '动作与情绪', atlas: '表现能力', comparison: '新参考对照', directions: '画面方向' };

  $('conclusion-strip').innerHTML = data.conclusions.map((item, index) => `<article><span class="conclusion-index">0${index + 1}</span><p>${escape(typeof item === 'string' ? item : item.description || item.text || item.title)}</p></article>`).join('');
  $('case-grid').innerHTML = data.cases.map((item) => `<article class="case-card"><button class="image-button case-image" data-image="${escape(item.frame)}" data-image-title="${escape(item.title)}"><img src="${escape(item.frame)}" alt="${escape(item.category)}原片抽帧" loading="lazy"></button><div class="case-body"><span class="case-category">${escape(item.category)}</span><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p><div class="case-footer"><a class="text-link" href="${item.id === 'grassland-special' ? '#coast' : '#sources'}">${item.id === 'grassland-special' ? '深入空间拆解' : '查看原片与分析'} ↗</a><span class="muted">约 ${Number(item.duration).toFixed(1)} 秒</span></div></div></article>`).join('');

  ['overview', 'coast', 'color'].forEach((key) => { $('detail-' + key).innerHTML = data.details[key]; });
  $('davinci-grid').innerHTML = data.daVinciSteps.map((item, index) => `<article class="davinci-step"><span class="step-number">0${index + 1}</span><h3>${escape(item.title)}</h3><p>${escape(item.example)}</p></article>`).join('');
  const production = window.PRODUCT_STUDY;
  $('production-path').innerHTML = production.path.map((item, index) => `<article><span>0${index + 1} · ${escape(item.status)}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></article>`).join('');
  $('production-references').innerHTML = production.references.map((item) => `<article class="case-card"><button class="image-button case-image" data-image="${escape(item.image)}" data-image-title="原作参考 · ${escape(item.title)}"><img src="${escape(item.image)}" alt="${escape(item.alt)}" loading="lazy"></button><div class="case-body"><span class="case-category">原作参考 · ${escape(item.source)}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p><div class="case-footer"><a class="text-link" href="${escape(item.link)}">查看分析依据 ↗</a></div></div></article>`).join('');
  $('capability-grid').innerHTML = production.capabilities.map((item, index) => `<article class="capability-card"><div class="card-meta"><span class="capability-tag">0${index + 1} / ${escape(item.tag)}</span><span class="capability-status">${escape(item.status)}</span></div><h3>${escape(item.title)}</h3><p class="capability-goal">${escape(item.goal)}</p><dl><dt>制作工作</dt><dd>${escape(item.work)}</dd><dt>沉淀产物</dt><dd>${escape(item.output)}</dd></dl><p class="capability-check">验收：${escape(item.check)}</p><div class="capability-links"><a class="text-link" href="${escape(item.link)}">${escape(item.linkLabel)} ↗</a></div></article>`).join('');
  $('product-directions').innerHTML = production.directions.map((item, index) => `<article><span class="demo-status-inline">0${index + 1} · ${escape(item.status)}</span><h3>${escape(item.title)}</h3><p>${escape(item.experience)}</p><p>${escape(item.requirement)}</p></article>`).join('');
  $('source-grid').innerHTML = data.cases.map((item) => `<article class="source-card"><button class="image-button" data-video="${escape(item.id)}" aria-label="播放 ${escape(item.title)} 分析副本"><img src="${escape(item.frame)}" alt="${escape(item.title)}原片封面" loading="lazy"></button><div class="source-card-body"><span class="source-meta">已核对原片 / 1080p · 60fps</span><h3>${escape(item.title)}</h3><p>${escape(item.value)}</p><div class="source-actions"><button class="button secondary" type="button" data-video="${escape(item.id)}">播放分析副本</button><a class="text-link" href="${escape(item.postUrl)}" target="_blank" rel="noopener noreferrer">原帖 ↗</a></div><details><summary>观察与判断边界</summary><ul>${item.observations.map((text) => `<li>${escape(text)}</li>`).join('')}</ul><p class="muted">${escape(Array.isArray(item.limits) ? item.limits.join('；') : item.limits)}</p></details></div></article>`).join('');
  $('author-statements').innerHTML = data.authorStatements.map((item) => `<article class="observation-block"><span class="evidence-label">已核对作者原始回复</span><h3>${escape(item.title)}</h3><p>${escape(item.summary)}</p><p class="muted">${escape(item.limits)}</p><a class="text-link" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">查看作者回复 ↗</a></article>`).join('');
  $('history-rows').innerHTML = data.history.map((item) => `<tr><td>${escape(item.date)}</td><td>${item.postUrl ? `<a href="${escape(item.postUrl)}" target="_blank" rel="noopener noreferrer">${escape(item.title)} ↗</a>` : escape(item.title)}</td><td>${number(item.views)}</td><td>${number(item.likes)}</td><td>${number(item.saves)}</td><td>${escape(item.duration)}</td><td><span class="${item.verified ? 'verified-tag' : 'muted'}">${item.verified ? '已核对原片' : '用户整理'}</span></td></tr>`).join('');

  const coastRange = $('coast-frame-range');
  coastRange.max = data.coastFrames.length - 1;
  $('coast-thumbnails').innerHTML = data.coastFrames.map((frame, index) => `<button type="button" class="frame-thumb" data-frame="${index}" aria-pressed="false" aria-label="查看 ${Number(frame.time).toFixed(2)} 秒：${escape(frame.label)}"><img src="${escape(frame.image)}" alt="" loading="lazy"><span>${Number(frame.time).toFixed(2)}s</span></button>`).join('');
  function setFrame(index) {
    const frame = data.coastFrames[index];
    coastRange.value = String(index);
    $('coast-frame-image').src = frame.image;
    $('coast-frame-image').alt = `grassland special ${frame.label}抽帧`;
    $('coast-zoom').dataset.image = frame.image;
    $('coast-zoom').dataset.imageTitle = `grassland special · ${frame.label}`;
    $('coast-time-badge').textContent = Number(frame.time).toFixed(2) + 's';
    $('coast-time-output').textContent = Number(frame.time).toFixed(2) + ' 秒';
    $('coast-observation-title').textContent = frame.label;
    $('coast-observation').textContent = frame.observation;
    $('coast-contribution').textContent = frame.contribution;
    $('coast-limit').textContent = frame.limit;
    document.querySelectorAll('[data-frame]').forEach((button) => {
      const active = Number(button.dataset.frame) === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  coastRange.addEventListener('input', () => setFrame(Number(coastRange.value)));
  setFrame(0);

  const variants = {
    baseline: { image: 'assets/color-study/baseline-sdr.png', label: '基准 SDR', eyebrow: '同帧基准 / 已经过原作者调色', title: '先看已有的光色关系', text: '蓝海、绿草、暖色建筑和亮云在这个基准里已经存在。它由已调色的 HLG 原片映射为 SDR，作为这组对照的统一起点。', limit: '这不是作者的未调色素材，不能由此反推他增加了多少曝光或饱和度。' },
    exposure: { image: 'assets/color-study/exposure-plus-one-ev.png', label: '曝光 +1 EV', eyebrow: '教学实验 / 整体明亮感', title: '把整体抬亮，会发生什么？', text: '草坡、人物和云层一起变亮。云层高光更容易碰到输出上限，亮部之间的区分可能减少。', limit: '在统一 SDR 基准的线性 RGB 上施加 ×2 增益；是约 +1 EV 的教学示意，不是作者参数，也不是相机 RAW 的曝光复原。' },
    saturation: { image: 'assets/color-study/saturation-1p4.png', label: '饱和度 ×1.4', eyebrow: '教学实验 / 色彩强度', title: '蓝海、绿草、暖色更鲜明', text: '增加颜色偏离中性色的程度，让冷暖分区更强。原片本来就高度饱和，额外推强也会展示色域裁切的副作用。', limit: '×1.4 是数学示意，不是 DaVinci 算法或作者设置。裁切后亮度和色相也可能变化。' },
    hdr: { eyebrow: '显示机制 / 高光亮度余量', title: '高光可以更亮，中暗部仍可保持层次', text: '云边和窗灯可拥有额外亮度余量，人物与草坡不必一起整体抬亮。实际观感取决于素材、映射、播放器、系统与屏幕。', limit: '这里是同一 SDR 图的区域标注和概念说明，不能展示真实 HDR 峰值；HDR 也不会恢复已经丢失的细节。' }
  };
  let currentColor = 'exposure';
  function setWipe(value) {
    $('color-wipe-range').value = String(value);
    $('wipe-variant').style.clipPath = `inset(0 0 0 ${value}%)`;
    $('wipe-divider').style.left = value + '%';
  }
  function setColor(key, focus = false) {
    currentColor = key;
    const variant = variants[key];
    const hdr = key === 'hdr';
    $('wipe-stage').hidden = hdr;
    $('hdr-stage').hidden = !hdr;
    $('wipe-controls').hidden = hdr || key === 'baseline';
    $('wipe-divider').hidden = key === 'baseline';
    $('color-panel').setAttribute('aria-labelledby', 'tab-' + key);
    if (!hdr) {
      $('wipe-variant').src = variant.image;
      $('wipe-variant').alt = variant.label + '教学对照';
      $('wipe-right-label').textContent = variant.label;
      setWipe(key === 'baseline' ? 100 : 50);
    }
    $('color-note-label').textContent = variant.eyebrow;
    $('color-note-title').textContent = variant.title;
    $('color-note-text').textContent = variant.text;
    $('color-note-limit').textContent = variant.limit;
    document.querySelectorAll('[data-color]').forEach((button) => {
      const active = button.dataset.color === key;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
  }
  $('color-wipe-range').addEventListener('input', (event) => setWipe(event.target.value));
  document.querySelector('.tabs').addEventListener('keydown', (event) => {
    const keys = Object.keys(variants);
    let index = keys.indexOf(currentColor);
    if (event.key === 'ArrowRight') index = (index + 1) % keys.length;
    else if (event.key === 'ArrowLeft') index = (index + keys.length - 1) % keys.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = keys.length - 1;
    else return;
    event.preventDefault();
    setColor(keys[index], true);
  });
  $('wipe-stage').addEventListener('pointerdown', (event) => {
    if (currentColor === 'baseline') return;
    const stage = $('wipe-stage');
    const update = (pointer) => {
      const bounds = stage.getBoundingClientRect();
      setWipe(Math.max(0, Math.min(100, (pointer.clientX - bounds.left) / bounds.width * 100)));
    };
    update(event);
    stage.setPointerCapture(event.pointerId);
    const move = (pointer) => update(pointer);
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerup', () => stage.removeEventListener('pointermove', move), { once: true });
    stage.addEventListener('pointercancel', () => stage.removeEventListener('pointermove', move), { once: true });
  });
  setColor('exposure');

  function showImage(src, title) {
    $('dialog-image').src = src;
    $('dialog-image').alt = title;
    $('image-dialog-title').textContent = title;
    $('image-dialog').querySelector('.dialog-caption').textContent = String(src).includes('research-map-') ? '研究总图 · 既有图像与中文排版整理 · SDR信息图，HDR仅作机制说明。可保存高清原图查看。' : (String(src).includes('/style-worlds/') || String(src).includes('/style-expansion/')) ? '原创静态风格图 · 内置 image_gen 生成 · 仅作画面与风格探索。' : String(src).includes('/dance-video/') ? (String(src).includes('poster') ? '舞步生成视频中的实际画面；用户已确认该成片通过。' : '视频首帧候选 · 内置 image_gen 生成的静态图；实际视频进度与结果见本页成片区域。') : String(src).includes('/original-keyframes/') ? '原创静态关键帧 · 内置 image_gen 生成 · SDR 图片；运动与产品演示等待评阅后决定。' : '原片抽帧或标注图；SDR 分析预览。';
    $('image-dialog').showModal();
  }
  function showVideo(id) {
    const item = data.cases.find((candidate) => candidate.id === id);
    if (!item) return;
    $('video-dialog-title').textContent = item.title + ' / 原片分析副本';
    $('dialog-video').src = item.video;
    $('dialog-video').poster = item.frame;
    $('video-dialog-caption').textContent = '保留原片信令；HDR 观感取决于当前播放与显示环境。';
    $('video-dialog').showModal();
  }
  $('video-dialog').addEventListener('close', () => $('dialog-video').pause());
  document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); }));
  document.addEventListener('click', (event) => {
    const frame = event.target.closest('[data-frame]');
    if (frame) setFrame(Number(frame.dataset.frame));
    const color = event.target.closest('[data-color]');
    if (color) setColor(color.dataset.color);
    const image = event.target.closest('[data-image]');
    if (image) showImage(image.dataset.image, image.dataset.imageTitle || '研究图像');
    const video = event.target.closest('[data-video]');
    if (video) showVideo(video.dataset.video);
    const close = event.target.closest('[data-close]');
    if (close) $(close.dataset.close).close();
    const articleImage = event.target.closest('.article-content img');
    if (articleImage) showImage(articleImage.src, articleImage.alt || '研究图解');
  });

  function renderRoute() {
    const requested = window.location.hash.slice(1);
    const route = Object.hasOwn(titles, requested) ? requested : 'overview';
    document.querySelectorAll('[data-view]').forEach((view) => { view.hidden = view.dataset.view !== route; });
    document.querySelectorAll('[data-route]').forEach((link) => {
      const active = link.dataset.route === route;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    $('breadcrumb').textContent = titles[route];
    document.title = titles[route] + ' · 奇幻影像研究';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
})();
