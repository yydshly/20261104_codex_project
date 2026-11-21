(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const grid = $('image-grid');
  const dialog = $('image-viewer');
  const categoryNames = { pinned: '原帖图像', generated: '本项目 AI 生成', external: '外部摄影' };
  const statusNames = { reference: '核心参照', pending: '待评定', 'not-selected': '用户未选', withdrawn: '停用历史' };
  const groupOrder = { pinned: 0, generated: 1, external: 2 };
  const selected = new Set();
  let items = [];
  let byId = new Map();
  let visible = [];
  let category = 'all';
  let viewer = null;
  let pure = false;
  let expanded = false;
  let layoutFrame = 0;
  let announcementTimer = 0;
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleLayout) : null;

  function node(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  }

  function href(value) {
    if (!value || typeof value !== 'string') return null;
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }

  function scheduleLayout() {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
      const style = getComputedStyle(grid);
      const unit = parseFloat(style.gridAutoRows);
      const gap = parseFloat(style.rowGap) || 0;
      grid.querySelectorAll('.image-tile').forEach(tile => {
        if (style.display !== 'grid' || !Number.isFinite(unit)) {
          tile.style.gridRowEnd = '';
          return;
        }
        const height = tile.firstElementChild.getBoundingClientRect().height;
        tile.style.gridRowEnd = 'span ' + Math.max(1, Math.ceil((height + gap) / (unit + gap)));
      });
    });
  }

  function announce(message) {
    clearTimeout(announcementTimer);
    $('collection-announcement').textContent = message;
    $('collection-announcement').classList.add('is-visible');
    announcementTimer = setTimeout(() => $('collection-announcement').classList.remove('is-visible'), 3200);
  }

  function makeImage(item, enlarged = false) {
    const img = node('img');
    img.src = href(item.src) || '';
    img.alt = item.alt || item.title;
    img.decoding = 'async';
    img.loading = enlarged ? 'eager' : 'lazy';
    img.referrerPolicy = 'no-referrer';
    if (item.width && item.height) {
      img.width = item.width;
      img.height = item.height;
    }
    img.addEventListener('load', () => {
      if (!item.width && img.naturalWidth) {
        item.width = img.naturalWidth;
        item.height = img.naturalHeight;
      }
      scheduleLayout();
    });
    img.addEventListener('error', () => {
      img.hidden = true;
      const message = node('p', 'image-load-error', item.category === 'external' ? '原站图片暂未加载，可在详情中打开作品来源。' : '图片暂未加载，请打开原图查看。');
      img.parentElement.append(message);
      img.parentElement.classList.add('has-image-error');
      scheduleLayout();
    }, { once: true });
    return img;
  }

  function makeTile(item) {
    const tile = node('article', 'image-tile status-' + item.status);
    tile.dataset.itemId = item.id;
    tile.classList.toggle('is-selected', selected.has(item.id));
    const content = node('div', 'tile-content');
    const open = node('button', 'image-open');
    open.type = 'button';
    open.dataset.open = item.id;
    open.setAttribute('aria-label', '放大查看：' + item.title);
    open.append(makeImage(item));
    const meta = node('div', 'tile-meta');
    const top = node('div', 'tile-topline');
    top.append(node('span', 'source-chip', categoryNames[item.category]), node('span', 'status-chip', item.statusLabel || statusNames[item.status]));
    const title = node('h2', 'tile-title', item.title);
    const creator = node('p', 'tile-creator', item.creator || categoryNames[item.category]);
    const bottom = node('div', 'tile-bottom');
    const compare = node('button', 'compare-toggle', selected.has(item.id) ? '已选对照 ✓' : '加入对照 +');
    compare.type = 'button';
    compare.dataset.compare = item.id;
    compare.setAttribute('aria-label', '对照选择：' + item.title);
    compare.setAttribute('aria-pressed', String(selected.has(item.id)));
    bottom.append(node('span', 'phase', item.phase || ''), compare);
    meta.append(top, title, creator, bottom);
    content.append(open, meta);
    tile.append(content);
    return tile;
  }

  function render() {
    const search = $('image-search').value.trim().toLocaleLowerCase();
    const status = $('status-filter').value;
    const oldest = $('image-sort').value === 'oldest';
    visible = items.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (status !== 'all' && item.status !== status) return false;
      const words = [item.title, item.creator, item.phase, item.feedback, item.alt].filter(Boolean).join(' ').toLocaleLowerCase();
      return !search || words.includes(search);
    }).sort((a, b) => {
      const group = groupOrder[a.category] - groupOrder[b.category];
      if (category === 'all' && group) return group;
      const direction = a.category === 'generated' && !oldest ? -1 : 1;
      return direction * ((a.order || 0) - (b.order || 0)) || a.id.localeCompare(b.id);
    });
    observer?.disconnect();
    const previewLimit = Number(grid.dataset.previewLimit) || 0;
    const displayed = previewLimit && !expanded ? visible.slice(0, previewLimit) : visible;
    grid.replaceChildren(...displayed.map(makeTile));
    grid.querySelectorAll('.tile-content').forEach(element => observer?.observe(element));
    $('empty-state').hidden = visible.length !== 0;
    $('result-summary').textContent = displayed.length < visible.length ? '先展示 ' + displayed.length + ' / ' + visible.length + ' 幅 · 可展开全部 · 保持原比例' : visible.length + ' / ' + items.length + ' 幅 · 保持原比例 · 点击放大查看';
    const showAll = $('show-all-images');
    if (showAll) {
      showAll.hidden = displayed.length >= visible.length;
      showAll.textContent = '展开全部 ' + visible.length + ' 幅图像';
    }
    document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    scheduleLayout();
  }

  function syncSelection() {
    grid.querySelectorAll('.image-tile').forEach(tile => {
      const active = selected.has(tile.dataset.itemId);
      tile.classList.toggle('is-selected', active);
      const button = tile.querySelector('[data-compare]');
      button.textContent = active ? '已选对照 ✓' : '加入对照 +';
      button.setAttribute('aria-pressed', String(active));
    });
    $('compare-dock').hidden = selected.size === 0;
    $('compare-count').textContent = selected.size + ' / 3';
    $('open-compare').disabled = selected.size < 2;
    const slots = [...selected].map(id => {
      const item = byId.get(id);
      const slot = node('div', 'compare-slot');
      const img = node('img');
      img.src = href(item.src);
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
      const remove = node('button', '', '×');
      remove.type = 'button';
      remove.dataset.remove = id;
      remove.setAttribute('aria-label', '移除对照：' + item.title);
      slot.append(img, node('span', '', item.title), remove);
      return slot;
    });
    $('compare-slots').replaceChildren(...slots);
    document.body.classList.toggle('has-selection', selected.size > 0);
    scheduleLayout();
  }

  function toggleSelection(id) {
    if (!byId.has(id)) return;
    if (selected.has(id)) selected.delete(id);
    else if (selected.size < 3) selected.add(id);
    else { announce('最多对照三张。请先移除一张。'); return; }
    syncSelection();
  }

  function addLink(container, text, value, download = false) {
    const url = href(value);
    if (!url) return;
    const link = node('a', 'viewer-link', text);
    link.href = url;
    if (download) link.download = value.split('/').pop();
    else { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    container.append(link);
  }

  function renderViewer() {
    const viewItems = viewer.mode === 'compare' ? [...selected].map(id => byId.get(id)) : [byId.get(viewer.id)];
    dialog.classList.toggle('is-compare', viewer.mode === 'compare');
    dialog.classList.toggle('is-quiet', viewer.quiet);
    $('viewer-quiet').textContent = viewer.quiet ? '显示信息' : '只看画面';
    $('viewer-quiet').setAttribute('aria-pressed', String(viewer.quiet));
    $('viewer-prev').hidden = viewer.mode === 'compare';
    $('viewer-next').hidden = viewer.mode === 'compare';
    $('viewer-prev').disabled = viewer.ids.length < 2;
    $('viewer-next').disabled = viewer.ids.length < 2;
    $('viewer-heading').textContent = viewer.mode === 'compare' ? '并排对照' : viewItems[0].title;
    $('viewer-counter').textContent = viewer.mode === 'compare' ? viewItems.length + ' 幅 / 原比例观看' : (viewer.ids.indexOf(viewer.id) + 1) + ' / ' + viewer.ids.length;
    const panels = viewItems.map(item => {
      const figure = node('figure', 'viewer-panel');
      figure.append(makeImage(item, true));
      const caption = node('figcaption', '', item.title + ' · ' + (item.creator || categoryNames[item.category]));
      if (item.sourceUrl) addLink(caption, '作品来源 ↗', item.sourceUrl);
      figure.append(caption);
      return figure;
    });
    $('viewer-panels').replaceChildren(...panels);
    $('viewer-panels').style.setProperty('--panels', viewItems.length);
    const details = $('viewer-details');
    details.replaceChildren();
    if (viewer.mode === 'single') {
      const item = viewItems[0];
      details.append(node('p', 'source-chip', categoryNames[item.category]), node('h3', 'viewer-detail-title', item.title), node('p', 'viewer-creator', item.creator || categoryNames[item.category]), node('p', 'status-chip status-' + item.status, item.statusLabel || statusNames[item.status]));
      if (item.width && item.height) details.append(node('p', 'viewer-resolution', item.width + ' × ' + item.height));
      details.append(node('h4', '', '本轮记录'), node('p', 'viewer-feedback', item.feedback || '尚无逐图评价。“继续生成”不视为认可。'));
      if (item.phase) details.append(node('p', 'viewer-phase', item.phase));
      const links = node('div', 'viewer-links');
      addLink(links, '查看原图 ↗', item.src);
      if (item.downloadable && item.category === 'generated') addLink(links, '下载生成图 ↓', item.src, true);
      addLink(links, '实际生成提示词 ↗', item.promptUrl);
      addLink(links, '生成记录 ↗', item.recordUrl);
      addLink(links, item.category === 'pinned' ? '查看原帖 ↗' : '摄影作品来源 ↗', item.sourceUrl);
      details.append(links);
      if (item.category === 'external') details.append(node('p', 'viewer-source-note', '原站在线图片，权利属于作者。本轮反馈为未选用，保留作研究对照。'));
      if (item.status === 'withdrawn') details.append(node('p', 'viewer-source-note', '此图为停用历史，保留用于追溯，不作为原创方案推荐。'));
    }
  }

  function openViewer(id, trigger, mode = 'single') {
    if (mode === 'single' && !byId.has(id)) return;
    if (mode === 'compare' && selected.size < 2) return;
    const ids = mode === 'compare' ? [...selected] : visible.some(item => item.id === id) ? visible.map(item => item.id) : [id];
    viewer = { id, mode, quiet: pure, trigger, ids };
    renderViewer();
    document.body.classList.add('viewer-open');
    dialog.showModal();
    $('viewer-close').focus({ preventScroll: true });
  }

  function navigate(direction) {
    if (!viewer || viewer.mode !== 'single' || viewer.ids.length < 2) return;
    const index = viewer.ids.indexOf(viewer.id);
    viewer.id = viewer.ids[(index + direction + viewer.ids.length) % viewer.ids.length];
    renderViewer();
  }

  grid.addEventListener('click', event => {
    const open = event.target.closest('[data-open]');
    const compare = event.target.closest('[data-compare]');
    if (open) openViewer(open.dataset.open, open);
    else if (compare) toggleSelection(compare.dataset.compare);
  });
  document.addEventListener('click', event => {
    const open = event.target.closest('[data-collection-open]');
    if (open) openViewer(open.dataset.collectionOpen, open);
  });
  $('show-all-images')?.addEventListener('click', () => { expanded = true; render(); });
  document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { category = button.dataset.category; render(); }));
  $('image-search').addEventListener('input', render);
  $('status-filter').addEventListener('change', render);
  $('image-sort').addEventListener('change', render);
  $('reset-filters').addEventListener('click', () => { category = 'all'; $('image-search').value = ''; $('status-filter').value = 'all'; render(); });
  $('view-mode').addEventListener('click', () => {
    pure = !pure;
    document.body.classList.toggle('pure-view', pure);
    $('view-mode').textContent = pure ? '显示信息' : '只看画面';
    $('view-mode').setAttribute('aria-pressed', String(pure));
    scheduleLayout();
  });
  $('compare-slots').addEventListener('click', event => { const remove = event.target.closest('[data-remove]'); if (remove) toggleSelection(remove.dataset.remove); });
  $('clear-compare').addEventListener('click', () => { selected.clear(); syncSelection(); });
  $('open-compare').addEventListener('click', event => openViewer(null, event.currentTarget, 'compare'));
  $('viewer-close').addEventListener('click', () => dialog.close());
  $('viewer-prev').addEventListener('click', () => navigate(-1));
  $('viewer-next').addEventListener('click', () => navigate(1));
  $('viewer-quiet').addEventListener('click', () => { if (viewer) { viewer.quiet = !viewer.quiet; renderViewer(); } });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    const trigger = viewer?.trigger;
    viewer = null;
    $('viewer-panels').replaceChildren();
    trigger?.focus({ preventScroll: true });
  });
  window.addEventListener('resize', scheduleLayout);

  async function load() {
    $('load-error').hidden = true;
    try {
      const response = await fetch('collection-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data.items)) throw new Error('Invalid image collection');
      items = data.items.filter(item => item.id && item.title && href(item.src) && categoryNames[item.category]);
      byId = new Map(items.map(item => [item.id, item]));
      document.querySelectorAll('[data-count]').forEach(element => { element.textContent = element.dataset.count === 'all' ? items.length : items.filter(item => item.category === element.dataset.count).length; });
      $('collection-counts').replaceChildren(...[['pinned', '原帖双图'], ['generated', '生成试作'], ['external', '外部摄影']].map(([key, name]) => {
        const badge = node('span');
        badge.append(node('strong', '', items.filter(item => item.category === key).length), document.createTextNode(' ' + name));
        return badge;
      }));
      const initial = new URLSearchParams(location.search).get('category');
      if (categoryNames[initial]) category = initial;
      render();
    } catch (error) {
      $('result-summary').textContent = '图集数据载入失败，请重试。';
      $('load-error').hidden = false;
      console.error('Image collection:', error);
    }
  }
  $('retry-load').addEventListener('click', load);
  load();
})();
