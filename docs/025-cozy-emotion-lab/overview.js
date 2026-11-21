(() => {
  'use strict';
  const legacy = new Set(['product', 'cases', 'lab', 'create', 'library', 'research', 'gallery', 'moments']);
  if (legacy.has(location.hash.slice(1))) {
    location.replace('workbench.html' + location.hash);
    return;
  }
  const $ = id => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let content;
  let collection;
  let imageItems = [];
  let activeImage = null;
  let imageRequest = 0;
  let frame = 0;
  let playing = false;
  let elapsed = 0;
  let startedAt = 0;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function safeUrl(value) {
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  async function json(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(url + ': HTTP ' + response.status);
    return response.json();
  }

  function renderSummary() {
    const status = content.status;
    $('overview-status').textContent = status.headline;
    $('current-direction').textContent = status.currentDirection;
    $('color-policy').textContent = status.colorPolicy;
    $('review-status').textContent = '生成图：' + status.counts.pending + '张待评定、' + status.counts.notSelected + '张未选、' + status.counts.withdrawn + '张停用历史。' + status.reviewPolicy;
    $('overview-updated').textContent = content.updatedAt;
    $('overview-updated').dateTime = content.updatedAt;
    const metrics = [[status.counts.pinned, '明确参照'], [status.counts.generated, '生成试作'], [status.counts.external, '外部摄影'], [status.counts.selectedGenerated, '明确获选的生成图']];
    $('overview-metrics').replaceChildren(...metrics.map(([number, label]) => {
      const metric = element('span');
      metric.append(element('strong', '', number), document.createTextNode(label));
      return metric;
    }));
    $('findings-grid').replaceChildren(...content.findings.map(finding => {
      const article = element('article');
      article.append(element('h3', '', finding.title), element('p', '', finding.evidence), element('small', '', finding.meaning));
      return article;
    }));
    const byId = new Map(collection.items.map(item => [item.id, item]));
    $('feedback-list').replaceChildren(...content.feedbackTimeline.map(stage => {
      const details = element('details', 'feedback-entry');
      const summary = element('summary');
      summary.append(element('h3', '', stage.stage), element('span', 'feedback-quote', stage.feedback));
      const body = element('div', 'feedback-body');
      const thumbs = element('div', 'feedback-thumbs');
      stage.ids.forEach(id => {
        const item = byId.get(id);
        if (!item) return;
        const button = element('button');
        button.type = 'button';
        button.dataset.collectionOpen = id;
        button.setAttribute('aria-label', '回看：' + item.title);
        const img = element('img');
        img.src = safeUrl(item.src);
        img.alt = item.title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        button.append(img, element('span', '', item.title));
        thumbs.append(button);
      });
      body.append(thumbs, element('p', '', stage.lesson), element('small', '', stage.certainty));
      details.append(summary, body);
      return details;
    }));
    $('value-grid').replaceChildren(...content.values.map(value => {
      const article = element('article');
      article.append(element('h3', '', value.title), element('p', '', value.description), element('p', 'value-deliverable', value.deliverable), element('small', '', value.verification));
      return article;
    }));
    $('rules-list').replaceChildren(...content.rules.map(rule => element('li', '', rule)));
    $('boundaries-list').replaceChildren(...content.boundaries.map(rule => element('li', '', rule)));
    $('resource-grid').replaceChildren(...content.resources.map(resource => {
      const link = element('a');
      link.href = safeUrl(resource.url);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(element('span', 'resource-title', resource.title), element('small', '', resource.kind));
      return link;
    }));
    $('download-summary').disabled = false;
  }

  function filterString() {
    const brightness = Number($('effect-brightness').value) / 100;
    const contrast = Number($('effect-contrast').value) / 100;
    const saturation = Number($('effect-saturation').value) / 100;
    const warmth = Number($('effect-warmth').value) / 100 * 0.24;
    return 'brightness(' + brightness + ') contrast(' + contrast + ') saturate(' + saturation + ') sepia(' + warmth + ')';
  }
  function updateFilters() {
    $('effect-adjusted').style.filter = filterString();
    ['brightness', 'contrast', 'saturation', 'warmth'].forEach(name => {
      $('effect-' + name + '-value').textContent = $('effect-' + name).value;
    });
  }
  function updateSplit() {
    const split = Number($('effect-split').value);
    $('effect-treatment').style.clipPath = 'inset(0 0 0 ' + split + '%)';
    $('effect-divider').style.left = split + '%';
    $('effect-split-value').textContent = split + '%';
  }
  function updateMotion() {
    const progress = Math.max(0, Math.min(1, elapsed / 8000));
    const eased = progress * progress * (3 - 2 * progress);
    const transform = 'scale(' + (1 + eased * 0.055) + ') translateX(' + (-eased * 0.6) + '%)';
    document.querySelectorAll('.effect-motion-image').forEach(img => { img.style.transform = transform; });
    $('effect-time').value = elapsed / 1000;
    $('effect-time-value').textContent = (elapsed / 1000).toFixed(1) + ' / 8.0秒';
  }
  function stopMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    playing = false;
    $('effect-play').textContent = elapsed >= 8000 ? '重播8秒预演' : elapsed > 0 ? '继续预演' : '播放8秒预演';
  }
  function tick(now) {
    elapsed = Math.min(8000, now - startedAt);
    updateMotion();
    if (elapsed >= 8000) { stopMotion(); return; }
    frame = requestAnimationFrame(tick);
  }
  function playMotion() {
    if (playing) { stopMotion(); return; }
    if (reducedMotion || !activeImage) return;
    if (elapsed >= 8000) elapsed = 0;
    startedAt = performance.now() - elapsed;
    playing = true;
    $('effect-play').textContent = '暂停预演';
    frame = requestAnimationFrame(tick);
  }
  async function setEffectImage(id) {
    const item = imageItems.find(entry => entry.id === id);
    if (!item) return;
    const request = ++imageRequest;
    stopMotion();
    elapsed = 0;
    updateMotion();
    stopMotion();
    activeImage = null;
    $('effect-download').disabled = true;
    $('effect-play').disabled = true;
    $('effect-message').textContent = '正在载入图像…';
    const original = $('effect-original');
    const adjusted = $('effect-adjusted');
    original.src = safeUrl(item.src);
    adjusted.src = safeUrl(item.src);
    original.alt = item.title + ' · 原图';
    adjusted.alt = item.title + ' · 调整预览';
    $('effect-item-status').textContent = item.title + ' · ' + item.statusLabel;
    try {
      await Promise.all([original.decode(), adjusted.decode()]);
      if (request !== imageRequest) return;
      activeImage = item;
      $('effect-download').disabled = false;
      $('effect-play').disabled = reducedMotion;
      $('effect-message').textContent = reducedMotion ? '系统已减少动态效果；可拖动时间轴逐帧查看。原件不会被修改。' : '当前仅作浏览器预览；下载的是全幅调整图，不包含分割线或镜头裁切。';
    } catch {
      if (request === imageRequest) $('effect-message').textContent = '图像暂未载入，请选择另一张或刷新后重试。';
    }
  }
  function setupEffects() {
    imageItems = collection.items.filter(item => item.category === 'generated' && item.status !== 'withdrawn').sort((a, b) => b.order - a.order);
    const select = $('effect-image');
    select.replaceChildren(...imageItems.map(item => {
      const option = element('option', '', item.title + ' · ' + item.statusLabel);
      option.value = item.id;
      return option;
    }));
    select.disabled = false;
    if (imageItems[0]) setEffectImage(imageItems[0].id);
    updateFilters();
    updateSplit();
    updateMotion();
  }
  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = element('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function downloadAdjusted() {
    if (!activeImage) return;
    const original = $('effect-original');
    if (!original.complete || !original.naturalWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = original.naturalWidth;
    canvas.height = original.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) { $('effect-message').textContent = '浏览器暂不支持图像导出。'; return; }
    context.filter = filterString();
    context.drawImage(original, 0, 0);
    const filename = activeImage.id + '-adjusted.png';
    canvas.toBlob(blob => {
      if (!blob) { $('effect-message').textContent = '图像暂未导出，请重试。'; return; }
      download(blob, filename);
      $('effect-message').textContent = '已导出 ' + canvas.width + ' × ' + canvas.height + ' PNG，原件未改动。';
    }, 'image/png');
  }
  function exportSummary() {
    if (!content || !collection) return;
    const payload = {
      title: '留一会儿 · 图像研究与效果汇总',
      updatedAt: content.updatedAt,
      content,
      images: collection.items,
      currentEffect: {
        imageId: activeImage?.id || null,
        filter: filterString(),
        splitPercent: Number($('effect-split').value),
        motionSeconds: Number((elapsed / 1000).toFixed(2)),
        scope: 'Browser image treatment and static camera-motion preview; no new image or AI video generated.'
      }
    };
    download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }), 'image-study-overview-' + content.updatedAt + '.json');
  }

  ['brightness', 'contrast', 'saturation', 'warmth'].forEach(name => $('effect-' + name).addEventListener('input', updateFilters));
  $('effect-split').addEventListener('input', updateSplit);
  $('effect-image').addEventListener('change', event => setEffectImage(event.target.value));
  $('effect-play').addEventListener('click', playMotion);
  $('effect-time').addEventListener('input', event => { stopMotion(); elapsed = Number(event.target.value) * 1000; updateMotion(); stopMotion(); });
  $('effect-reset').addEventListener('click', () => {
    stopMotion();
    elapsed = 0;
    $('effect-brightness').value = '100';
    $('effect-contrast').value = '100';
    $('effect-saturation').value = '100';
    $('effect-warmth').value = '0';
    $('effect-split').value = '50';
    updateFilters(); updateSplit(); updateMotion(); stopMotion();
    $('effect-message').textContent = '已还原为原图参数；原件未改动。';
  });
  $('effect-hide-labels').addEventListener('click', event => {
    const hidden = !$('effect-labels').hidden;
    $('effect-labels').hidden = hidden;
    event.currentTarget.textContent = hidden ? '显示画面标注' : '隐藏画面标注';
    event.currentTarget.setAttribute('aria-pressed', String(hidden));
  });
  $('effect-download').addEventListener('click', downloadAdjusted);
  $('download-summary').addEventListener('click', exportSummary);
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stopMotion(); });

  Promise.all([json('overview-content.json'), json('collection-data.json')]).then(([overviewData, imageData]) => {
    content = overviewData;
    collection = imageData;
    renderSummary();
    setupEffects();
  }).catch(error => {
    $('overview-error').hidden = false;
    console.error('Overview:', error);
  });
})();
