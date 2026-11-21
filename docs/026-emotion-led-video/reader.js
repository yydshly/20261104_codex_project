(() => {
  'use strict';

  const data = window.PROJECT_DATA || {};
  const stories = Array.isArray(data.stories) ? data.stories : [];
  const storyList = document.getElementById('story-list');
  const directory = document.getElementById('story-directory');
  const search = document.getElementById('story-search');
  const status = document.getElementById('filter-status');
  const emptyState = document.getElementById('empty-state');
  const themeButtons = [...document.querySelectorAll('[data-theme]')];
  const themes = {
    all: null,
    freedom: /自由|生活|旅行|享受|雪山|掌控身体|生活方式|松弛|独特|罕见|向往/,
    intimacy: /亲密|吸引|被选择|选择|等待|邀请|被爱|惦记|默契|关系|浪漫|伴侣|回应|接近|靠近/,
    tension: /紧张|掌控|危险|风险|兴奋|速度|能力|庞然|冒险|失控|安心|惊奇|自然|安全感|恐惧/
  };
  let selectedTheme = 'all';
  let imageTrigger = null;

  const labels = {
    name: '姓名', role: '身份', age: '年龄', appearance: '外形', costume: '服装', wardrobe: '服装',
    relationship: '关系', identity: '身份', description: '说明', look: '外形', action: '行动',
    summary: '概述', note: '备注', purpose: '用途', reason: '原因', detail: '细节', details: '细节'
  };

  function text(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join('；');
    if (typeof value === 'object') {
      return Object.entries(value).map(([key, val]) => `${labels[key] || key}：${text(val)}`).filter(Boolean).join('；');
    }
    return '';
  }

  function array(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined && content !== null) node.textContent = text(content);
    return node;
  }

  function safeUrl(value) {
    const url = text(value).trim();
    return /^https?:\/\//i.test(url) ? url : '';
  }

  function safeAsset(value) {
    const path = text(value).trim().replace(/\\/g, '/');
    if (!path || /^(?:[a-z]+:|\/\/|\/)/i.test(path) || path.split('/').includes('..')) return '';
    return path;
  }

  function storyId(story, index) {
    const slug = text(story.id).replace(/[^a-zA-Z0-9_-]/g, '');
    return slug.startsWith('story-') ? slug : `story-${slug || String(index + 1).padStart(2, '0')}`;
  }

  function list(items, className = 'detail-list') {
    const node = el('ul', className);
    array(items).forEach(item => node.append(el('li', '', item)));
    return node;
  }

  function block(heading, content, className = '') {
    const node = el('section', `detail-block ${className}`.trim());
    node.append(el('h4', '', heading));
    if (content instanceof Node) node.append(content);
    else node.append(el('p', '', content));
    return node;
  }

  function storyFigure(story, index) {
    const info = typeof story.image === 'object' && story.image ? story.image : {};
    const failedNetwork = info.generationStatus === 'failed_network';
    const source = safeAsset(info.path || `assets/story-${String(index + 1).padStart(2, '0')}-atmosphere-v1.png`);
    const figure = el('figure', 'story-figure');
    const button = el('button', 'image-button');
    button.type = 'button';
    if (!failedNetwork) button.dataset.image = source;
    button.dataset.imageLabel = `${text(story.title)} · AI 三联氛围概念图`;
    button.setAttribute('aria-label', failedNetwork ? `《${text(story.title)}》氛围图待补齐` : `放大查看《${text(story.title)}》的三联氛围概念图`);
    const image = el('img', 'story-image');
    if (!failedNetwork) image.src = source;
    image.alt = text(info.caption || `${text(story.title)}：场景、人物关系与关键转折的三联氛围概念图。`);
    image.loading = 'lazy';
    image.decoding = 'async';
    const fallback = el('span', 'asset-fallback');
    fallback.append(el('strong', '', failedNetwork ? '氛围图待补齐' : '氛围图暂未加载'), el('span', '', failedNetwork ? '内置生图服务返回网络错误，故事与提示词已保存。' : '故事内容仍可阅读。请确认 assets 目录中的图片与本页保存在一起。'));
    const mark = el('span', 'image-corner', '↗ 查看原图');
    if (failedNetwork) {
      button.classList.add('has-missing-image');
      button.disabled = true;
      button.append(fallback);
    } else button.append(image, fallback, mark);
    image.addEventListener('error', () => {
      image.classList.add('is-missing');
      button.classList.add('has-missing-image');
      button.disabled = true;
    }, {once: true});
    const caption = el('figcaption', 'image-caption');
    caption.append(el('span', 'image-kind', failedNetwork ? '待补图 · 尚未生成' : 'AI 氛围概念图 · 非原片帧'), el('p', '', failedNetwork ? `计划呈现：${text(info.caption || '场景、人物关系与关键转折。')}` : info.caption || '用于讨论场景、人物与情绪；不代表已生成连续视频。'));
    figure.append(button, caption);
    if (array(info.panelCaptions).length) {
      const panels = el('ol', 'panel-captions');
      array(info.panelCaptions).forEach((item, i) => {
        const li = el('li');
        li.append(el('span', '', String(i + 1).padStart(2, '0')), el('div', '', item));
        panels.append(li);
      });
      figure.append(panels);
    }
    return figure;
  }

  function characters(items) {
    const node = el('ul', 'character-list');
    array(items).forEach(item => {
      const li = el('li');
      if (!item || typeof item !== 'object') li.textContent = text(item);
      else {
        const name = item.name || item.role || item.identity;
        if (name) li.append(el('span', 'character-name', name));
        const rest = Object.fromEntries(Object.entries(item).filter(([key]) => !['name', ...(item.name ? [] : item.role ? ['role'] : ['identity'])].includes(key)));
        if (Object.keys(rest).length) {
          if (name) li.append(document.createTextNode(' · '));
          li.append(el('span', 'character-detail', rest));
        }
      }
      node.append(li);
    });
    return node;
  }

  function povDefinition(pov) {
    const dl = el('dl', 'pov-definition');
    const names = {identity: '拍摄者', reason: '为何在场', visible: '能够看见', blindSpot: '暂时看不见', movement: '如何移动'};
    for (const [key, name] of Object.entries(names)) {
      if (!pov?.[key]) continue;
      const row = el('div');
      row.append(el('dt', '', name), el('dd', '', pov[key]));
      dl.append(row);
    }
    return dl;
  }

  function timeline(items) {
    const timeline = el('ol', 'timeline');
    array(items).forEach(beat => {
      const row = el('li', 'timeline-item');
      if (!beat || typeof beat !== 'object') { row.append(el('p', '', beat)); timeline.append(row); return; }
      row.append(el('div', 'timeline-time', beat.range || beat.time || '—'));
      const action = el('div', 'timeline-action');
      action.append(el('p', '', beat.action || beat.description));
      if (beat.feeling) action.append(el('p', 'timeline-feeling', `感受：${text(beat.feeling)}`));
      row.append(action);
      const technical = el('div', 'timeline-tech');
      for (const [key, label] of [['camera', '机位'], ['sound', '声音']]) {
        if (!beat[key]) continue;
        const p = el('p');
        p.append(el('span', 'timeline-label', label), document.createTextNode(text(beat[key])));
        technical.append(p);
      }
      row.append(technical);
      timeline.append(row);
    });
    return timeline;
  }

  function storyDetails(story) {
    const details = el('details', 'story-details');
    details.append(el('summary', '', '展开故事、拍摄视角与验证要点'));
    const content = el('div', 'detail-content');
    const columns = el('div', 'detail-columns');
    const emotion = el('div');
    emotion.append(el('p', 'block-intro', story.emotionalArc));
    if (array(story.desire).length) emotion.append(list(story.desire));
    columns.append(block('希望观众体验什么', emotion));
    columns.append(block('视角怎样参与故事', povDefinition(story.pov)));
    if (array(story.characters).length) columns.append(block('人物与关系', characters(story.characters)));
    if (array(story.coreElements).length) columns.append(block('画面里的核心元素', list(story.coreElements)));
    content.append(columns);
    if (story.realAnchor) {
      const anchor = typeof story.realAnchor === 'object' ? story.realAnchor : {summary: story.realAnchor};
      const reality = el('section', 'reality-block detail-block');
      reality.append(el('h4', '', '与真实世界挂钩'), el('p', '', anchor.summary));
      const url = safeUrl(anchor.url);
      if (url) {
        const link = el('a', '', '查阅真实场景原型 ↗');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        reality.append(link);
      }
      if (anchor.caveat) reality.append(el('p', 'scope-note', anchor.caveat));
      content.append(reality);
    }
    if (array(story.timeline).length) {
      const heading = el('h4', 'timeline-heading', '故事怎样在约半分钟里发生');
      heading.style.marginTop = '28px';
      content.append(heading, timeline(story.timeline));
    }
    if (story.image?.reviewStatus || array(story.image?.reviewNotes).length) {
      const review = el('section', 'reality-block detail-block');
      review.append(el('h4', '', '这组氛围图的实际验看'));
      if (story.image.reviewStatus) review.append(el('p', 'scope-note', story.image.reviewStatus));
      if (array(story.image.reviewNotes).length) review.append(list(story.image.reviewNotes));
      content.append(review);
    }
    const validation = el('div', 'detail-columns validation-block');
    if (array(story.realismDetails).length) validation.append(block('让画面可信的具体细节', list(story.realismDetails)));
    if (array(story.continuityChecks).length) validation.append(block('连续性与空间核查', list(story.continuityChecks)));
    if (story.hardestShot) validation.append(block('最难的一镜', story.hardestShot));
    if (array(story.evaluationRisks).length) validation.append(block('看片时重点留意', list(story.evaluationRisks)));
    content.append(validation);
    if (story.firstTest) {
      const callout = el('div', 'test-callout');
      callout.append(el('p', 'label', '先做这一项试镜'), el('p', '', story.firstTest));
      content.append(callout);
    }
    content.append(el('p', 'production-note', story.productionStatus || '当前为故事与静态氛围探索；连续视频、声音和观众反馈尚待验证。'));
    details.append(content);
    return details;
  }

  function buildStory(story, index) {
    const article = el('article', 'story-card');
    article.id = storyId(story, index);
    const top = el('div', 'story-topline');
    const number = String(index + 1).padStart(2, '0');
    const heading = el('h3', 'story-title', story.title || `故事 ${number}`);
    heading.id = `${article.id}-heading`;
    article.setAttribute('aria-labelledby', heading.id);
    top.append(el('span', 'story-number', number), heading);
    article.append(top, el('p', 'story-tagline', story.tagline));
    const meta = el('div', 'story-meta');
    if (story.pov?.identity) meta.append(el('span', 'meta-tag pov-tag', story.pov.identity));
    array(story.desire).slice(0, 3).forEach(desire => meta.append(el('span', 'meta-tag', desire)));
    article.append(meta, storyFigure(story, index), storyDetails(story));
    storyList.append(article);
    const link = el('a', 'directory-link');
    link.href = `#${article.id}`;
    link.append(el('span', 'directory-number', number), el('span', 'directory-title', story.title), el('span', 'directory-arrow', '↓'));
    directory.append(link);
    return {
      element: article,
      link,
      searchText: text(story).toLocaleLowerCase('zh-CN'),
      themeText: text([story.desire, story.emotionalArc, story.tagline])
    };
  }

  const entries = stories.map(buildStory);

  function updateFilters() {
    const query = search.value.trim().toLocaleLowerCase('zh-CN');
    const words = query.split(/\s+/).filter(Boolean);
    let count = 0;
    for (const entry of entries) {
      const themeMatches = selectedTheme === 'all' || themes[selectedTheme].test(entry.themeText);
      const searchMatches = words.every(word => entry.searchText.includes(word));
      const visible = themeMatches && searchMatches;
      entry.element.hidden = !visible;
      entry.link.hidden = !visible;
      if (visible) count += 1;
    }
    status.textContent = stories.length ? `显示 ${count} / ${stories.length} 个故事 · 点击图像可查看完整三联图` : '故事数据尚未加载，请确认 data.js 与本页保存在同一目录。';
    emptyState.hidden = count > 0 || !stories.length;
  }

  themeButtons.forEach(button => button.addEventListener('click', () => {
    selectedTheme = button.dataset.theme;
    themeButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    updateFilters();
  }));
  search.addEventListener('input', updateFilters);
  document.getElementById('reset-filters').addEventListener('click', () => {
    search.value = '';
    themeButtons[0].click();
    search.focus();
  });
  if (!stories.length) {
    const message = el('div', 'empty-state');
    message.append(el('p', '', '本地故事数据暂未加载。请确认 data.js 与 index.html 放在一起，或直接阅读完整文档。'));
    const link = el('a', '', '打开六个故事文档 ↗');
    link.href = 'docs/02-six-stories.md';
    message.append(link);
    storyList.append(message);
  }
  updateFilters();

  const dialog = document.getElementById('image-dialog');
  const dialogImage = document.getElementById('dialog-image');
  const imageWrap = document.getElementById('dialog-image-wrap');
  const sizeButton = document.getElementById('toggle-image-size');
  const closeButton = document.getElementById('close-dialog');

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-image]');
    if (!button || button.disabled || !button.dataset.image) return;
    const source = safeAsset(button.dataset.image);
    if (!source) return;
    const label = button.dataset.imageLabel || '查看原图';
    if (typeof dialog.showModal !== 'function') {
      window.open(source, '_blank', 'noopener');
      return;
    }
    imageTrigger = button;
    document.getElementById('dialog-title').textContent = label;
    document.getElementById('dialog-original').href = source;
    dialogImage.src = source;
    dialogImage.alt = label;
    imageWrap.classList.remove('is-actual-size');
    sizeButton.setAttribute('aria-pressed', 'false');
    sizeButton.textContent = '按原尺寸查看';
    dialog.showModal();
    document.body.classList.add('dialog-open');
    closeButton.focus();
  });
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    dialogImage.removeAttribute('src');
    imageTrigger?.focus({preventScroll: true});
  });
  sizeButton.addEventListener('click', () => {
    const actual = imageWrap.classList.toggle('is-actual-size');
    sizeButton.setAttribute('aria-pressed', String(actual));
    sizeButton.textContent = actual ? '适应窗口' : '按原尺寸查看';
    imageWrap.scrollTo(0, 0);
  });

  // A direct story hash reveals a filtered story without requiring network requests.
  function revealHash() {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith('story-')) return;
    const target = document.getElementById(hash);
    if (!target) return;
    if (target.hidden) {
      search.value = '';
      themeButtons[0].click();
    }
  }
  window.addEventListener('hashchange', revealHash);
  revealHash();
})();
