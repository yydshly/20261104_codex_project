import { EFFECTS } from './effects.js';
import { createRenderer } from './water-renderer.js';
import { REAL_SEA_SOURCES, REAL_SEA_LICENSE_NOTE } from './reality-video-sources.js';
import { REALITY_COMPARISONS, REALITY_PRINCIPLES, DEMO_DIRECTION } from './reality-comparisons.js';

const node = (tag, value, className) => {
  const element = document.createElement(tag);
  if (value !== undefined) element.textContent = value;
  if (className) element.className = className;
  return element;
};
const readable = value => Array.isArray(value) ? value.join('；') : value == null ? '' : String(value);
const listText = value => typeof value === 'string' ? value : value?.text || value?.detail || value?.description || value?.title || '';
const safeUrl = value => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
};
const externalLink = (label, value) => {
  const href = safeUrl(value);
  if (!href) return node('span', '来源地址待补充');
  const anchor = node('a', label);
  anchor.href = href; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer';
  return anchor;
};

/** A source can support a phenomenon without authenticating the original social image. */
export function mountRealityStudies({ onSelectEffect } = {}) {
  const section = document.getElementById('reality-studies');
  if (!section) return null;
  section.classList.add('reality-study');
  const comparisons = new Map(REALITY_COMPARISONS.map(item => [item.effectId, item]));
  const sources = new Map(REAL_SEA_SOURCES.map(item => [item.id, item]));
  const initialId = new URLSearchParams(location.search).get('reality');
  let effect = EFFECTS.find(item => item.id === initialId) || EFFECTS[0];
  let sourceId = '', video = null, frame = 0, previousStamp = 0, lastDraw = 0;
  let time = 18.7, inView = false, destroyed = false;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lensEffects = false;
  const renderers = [];
  const directoryButtons = new Map();

  section.innerHTML = `
    <div class="section-head reality-heading">
      <div><p class="eyebrow">REFERENCE NOTES / FOR THE DEMO</p><h2 id="reality-title">实拍与条件记录，为演示提供依据。<span class="count">20</span></h2>
      <p class="reality-intro"></p></div>
      <a class="outline" href="#reality-source-directory">查看视频出处 ↓</a>
    </div>
    <div class="reality-evidence-note"><strong>出处可追溯，不等于未经处理。</strong><span>实拍视频用于核对现象与连续变化；原帖图片的拍摄过程与后期程度仍未核实。程序制作稿均待画面对照验收。</span></div>
    <div class="reality-summary" aria-live="polite"></div>
    <details class="reality-effect-directory"><summary>20 项逐项对照目录 <span>展开选择；也可使用下方选择框</span></summary><div class="reality-directory" aria-label="选择二十项效果的实拍对照"></div></details>
    <article class="reality-panel" aria-labelledby="reality-effect-title">
      <header class="reality-panel-heading"><div><p class="eyebrow reality-index"></p><h3 id="reality-effect-title"></h3></div><label class="reality-select-label">选择效果<select class="reality-select" aria-label="选择实拍对照效果"></select></label></header>
      <div class="reality-video-layout">
        <div class="reality-video-column"><div class="reality-subheading"><h4>关联实拍 / 镜头参照</h4><span>验证局部规律，并非同地点、同光线复拍</span></div><div class="reality-source-tabs" aria-label="选择关联实拍视频"></div><div class="reality-video-host"></div><p class="reality-video-status" role="status"></p><div class="reality-video-links"></div></div>
        <div class="reality-source-copy"><p class="mini-label">来源与拍摄条件</p><h4 class="reality-source-title"></h4><dl class="reality-source-facts"></dl><p class="reality-source-observation"></p><p class="reality-source-limit"></p></div>
      </div>
      <div class="reality-classifications"></div>
      <div class="reality-principle-links" aria-label="现象判定的说明来源"></div>
      <div class="reality-observation"><div><p class="mini-label">对照时具体看什么</p><p class="reality-observe"></p></div><div><p class="mini-label">怎样用到这项效果</p><p class="reality-transfer"></p></div></div>
      <div class="reality-subheading reality-visual-heading"><h4>原帖参考与两份制作稿</h4><button class="outline reality-pause" type="button"></button></div>
      <div class="reality-comparison-visuals">
        <figure class="reality-original"><div class="reality-image-wrap"><img class="reality-original-image" alt="原帖视觉参考" loading="lazy"></div><figcaption>原帖视觉参考<br><small>处理未核实 · 完整比例</small><a class="reality-original-link" target="_blank" rel="noopener noreferrer">原帖 ↗</a></figcaption></figure>
        <figure class="reality-draft"><div class="reality-canvas-wrap"><canvas class="reality-before" aria-label="调整前的程序化海面制作稿"></canvas><span>调整前</span></div><figcaption>原有艺术化制作稿<small>程序图像 · 用于比较变化</small></figcaption></figure>
        <figure class="reality-draft"><div class="reality-canvas-wrap"><canvas class="reality-after" aria-label="依据实拍观察调整后的程序化海面制作稿"></canvas><span>依据实拍调整</span></div><figcaption>本轮校准制作稿<small>程序近似 · 待视觉验收</small></figcaption></figure>
      </div>
      <div class="reality-render-options"><label><input type="checkbox" class="reality-lens"> 在校准稿中加入镜头光斑 / 星芒</label><span class="reality-compatibility"></span></div>
      <p class="reality-revision-status"></p>
      <div class="reality-production-notes"><div><h4>本轮已实施的调整</h4><ul class="reality-implemented"></ul></div><div><h4>仍缺少的能力与证据</h4><ul class="reality-remaining"></ul></div></div>
      <details class="reality-targets"><summary>完整改进目标与验收标准 <span>目标清单不等于已经完成</span></summary><div class="reality-production-notes"><div><h4>完整改进目标</h4><ul class="reality-changes"></ul></div><div><h4>仍需逐项对照的标准</h4><ul class="reality-acceptance"></ul></div></div></details>
      <p class="reality-comparison-limit"></p>
      <div class="reality-actions"><button type="button" class="primary reality-use-effect">进入本项制作区 ↗</button><span>三类判断可同时成立；相似外观不能证明原帖的拍摄与处理方式。</span></div>
    </article>
    <details id="reality-source-directory" class="reality-source-directory"><summary>视频来源目录 <span></span></summary><div class="reality-source-list"></div></details>`;
  section.setAttribute('aria-labelledby', 'reality-title');
  const $ = selector => section.querySelector(selector);
  $('.reality-intro').textContent = DEMO_DIRECTION.evidenceRole;

  function fillList(selector, values, empty) {
    const items = Array.isArray(values) ? values : values ? [values] : [];
    $(selector).replaceChildren(...(items.length ? items.map(item => node('li', listText(item))) : [node('li', empty)]));
  }
  function stopMedia() {
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); video = null; }
    $('.reality-video-host').replaceChildren();
  }
  function sourceFact(label, value) {
    const row = node('div'); row.append(node('dt', label), node('dd', readable(value) || '未提供'));
    return row;
  }
  function setVideoStatus(message, isError = false) {
    $('.reality-video-status').textContent = message;
    $('.reality-video-status').classList.toggle('is-error', isError);
  }
  function renderSource() {
    stopMedia();
    const source = sources.get(sourceId);
    $('.reality-video-links').replaceChildren();
    for (const button of $('.reality-source-tabs').children) button.setAttribute('aria-pressed', String(button.dataset.source === sourceId));
    if (!source) {
      $('.reality-video-host').append(node('p', '本项尚无可核查的直接视频对应，不能用图片或模拟画面代替实拍证据。', 'reality-media-empty'));
      $('.reality-source-title').textContent = '直接证据待补充';
      $('.reality-source-facts').replaceChildren();
      $('.reality-source-observation').textContent = '';
      $('.reality-source-limit').textContent = '保留观察与制作目标，不把缺少证据的分类写成已验证结论。';
      setVideoStatus('当前没有可播放的来源'); return;
    }
    $('.reality-source-title').textContent = source.title;
    $('.reality-source-facts').replaceChildren(
      sourceFact('发布机构 / 作者', [source.publisher, source.creator].filter(Boolean).join(' / ')),
      sourceFact('地点', source.location), sourceFact('拍摄时间', source.capturedAt),
      sourceFact('出处依据', source.provenance), sourceFact('剪辑与画面处理', source.processing),
      sourceFact('当前观察记录', source.review ? [
        source.review.method === 'representative-frames' ? '已核对代表帧，连续运动仍需播放对照' :
        source.review.method === 'opening-playback' ? '已确认开头可播放，尚未完整观看' :
        source.review.method === 'poster-only' ? '仅核对官方预览图，连续播放未验证' :
        source.review.method === 'source-description' ? '已核对机构说明，尚未完成连续播放核对' : '',
        readable(source.review.notes),
      ].filter(Boolean).join('；') : '观察记录待补充'),
      sourceFact('使用条件', source.license), sourceFact('查核日期', source.checkedAt)
    );
    $('.reality-source-observation').textContent = readable(source.observation);
    $('.reality-source-limit').textContent = readable(source.limitations);
    $('.reality-video-links').append(externalLink('打开发布方来源页 ↗', source.sourceUrl));
    if(source.licenseUrl) $('.reality-video-links').append(externalLink('使用许可 ↗', source.licenseUrl));
    const mediaUrl = safeUrl(source.localFile || source.mediaUrl);
    if (!mediaUrl) {
      $('.reality-video-host').append(node('p', '暂无已核实的直接播放地址，请从发布方页面查看视频。', 'reality-media-empty'));
      setVideoStatus('本页暂不可播 · 来源页仍可查阅', true); return;
    }
    if (source.mediaType === 'embed') {
      const holder = node('div', undefined, 'reality-embed-prompt');
      holder.append(node('p', '视频由发布方的外部播放器提供，点击后才加载。'));
      const button = node('button', '加载发布方播放器', 'outline'); button.type = 'button';
      button.addEventListener('click', () => {
        const iframe = document.createElement('iframe'); iframe.src = mediaUrl; iframe.title = source.title;
        iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.addEventListener('load', () => { if (sourceId === source.id) setVideoStatus('外部播放器已加载；若无法观看，请打开来源页。'); });
        holder.replaceWith(iframe);
      });
      holder.append(button); $('.reality-video-host').append(holder);
      setVideoStatus('尚未加载外部播放器');
    } else {
      video = document.createElement('video');
      video.controls = true; video.preload = 'none'; video.playsInline = true;
      video.setAttribute('aria-label', source.title);
      const poster = safeUrl(source.poster); if (poster) video.poster = poster;
      video.src = mediaUrl;
      video.append(node('p', '当前浏览器不支持此视频，请打开发布方来源页。'));
      const activeVideo = video;
      const status = (message, error = false) => { if (video === activeVideo) setVideoStatus(message, error); };
      video.addEventListener('playing', () => status('正在播放实拍视频 · 保持原视频比例与颜色'));
      video.addEventListener('pause', () => status('实拍视频已暂停，可比较当前浪缘与反光位置'));
      video.addEventListener('loadedmetadata', () => status('视频已就绪 · 使用播放器控件播放'));
      video.addEventListener('error', () => status('外部视频暂时无法加载，请打开发布方来源页查看。', true));
      $('.reality-video-host').append(video);
      $('.reality-video-links').append(externalLink('直接视频文件 ↗', mediaUrl));
      setVideoStatus(source.localFile ? '本地已收录 · 点击播放器播放约 15 秒机构选段' : '尚未播放 · 外部地址受当前网络影响');
    }
  }
  function draw() {
    for (const item of renderers) {
      item.renderer.draw(effect, effect.controls, time, 0, {
        realismProfile: item.profile,
        lensEffects: item.profile === 'reference' || lensEffects,
      });
    }
  }
  function resize() {
    for (const item of renderers) {
      const box = item.renderer.canvas.parentElement.getBoundingClientRect();
      item.renderer.resize(Math.max(1, box.width), Math.max(1, box.height), Math.min(devicePixelRatio || 1, 1.25));
    }
    draw();
  }
  function scheduleFrame() {
    if (!frame && !paused && inView && !document.hidden && !destroyed) frame = requestAnimationFrame(animate);
  }
  function animate(stamp) {
    frame = 0;
    const delta = previousStamp ? Math.min((stamp - previousStamp) / 1000, .1) : 0;
    previousStamp = stamp;
    if (!paused && inView && !document.hidden) {
      time += delta * effect.controls.speed / 100 * 1.8;
      if (stamp - lastDraw > 65) { draw(); lastDraw = stamp; }
      scheduleFrame();
    }
  }
  function updatePause() {
    const button = $('.reality-pause'); button.textContent = paused ? '▷ 播放两份制作稿' : 'Ⅱ 暂停两份制作稿';
    button.setAttribute('aria-pressed', String(paused));
    if (paused && frame) { cancelAnimationFrame(frame); frame = 0; }
    previousStamp = 0; scheduleFrame();
  }
  function selectEffect(id, updateUrl = true) {
    const next = EFFECTS.find(item => item.id === id); if (!next) return;
    effect = next;
    const comparison = comparisons.get(effect.id);
    const ids = (comparison?.sourceIds || []).filter(id => sources.has(id));
    sourceId = ids.includes(sourceId) ? sourceId : ids[0] || '';
    section.dataset.effect = effect.id;
    $('.reality-index').textContent = `实拍对照 ${effect.number} / 20`;
    $('#reality-effect-title').textContent = effect.name;
    $('.reality-select').value = effect.id;
    for (const [id, button] of directoryButtons) button.setAttribute('aria-pressed', String(id === effect.id));
    $('.reality-classifications').replaceChildren(...[
      ['natural', '自然现象'], ['camera', '镜头成像'], ['artistic', '艺术化与处理']
    ].map(([key, label]) => {
      const data = comparison?.[key]; const card = node('div', undefined, `reality-classification ${key}`);
      card.append(node('span', label), node('strong', data?.status || '依据待补充'), node('p', data?.explanation || '尚未建立可核查的说明。'));
      return card;
    }));
    const principles = (comparison?.principleIds || []).map(id => REALITY_PRINCIPLES.find(item => item.id === id)).filter(Boolean);
    $('.reality-principle-links').replaceChildren(node('span', '判定依据：'), ...principles.map(item => externalLink(`${item.title} ↗`, item.url)));
    $('.reality-source-tabs').replaceChildren(...ids.map(id => {
      const source = sources.get(id), button = node('button', source.title); button.type = 'button'; button.dataset.source = id;
      button.addEventListener('click', () => { sourceId = id; renderSource(); }); return button;
    }));
    $('.reality-observe').textContent = readable(comparison?.observe) || '直接视频依据待补充。';
    $('.reality-transfer').textContent = readable(comparison?.transfer) || '暂不据此声称写实复现。';
    $('.reality-original-image').src = effect.reference;
    $('.reality-original-image').alt = `原帖 ${effect.number}「${effect.name}」视觉参考，处理未核实`;
    $('.reality-original-link').href = effect.source;
    fillList('.reality-changes', comparison?.changes, '尚未实施对应调整。');
    fillList('.reality-acceptance', comparison?.acceptance, '待建立与视频对应的画面标准。');
    fillList('.reality-implemented', comparison?.implemented, '尚未记录对应的实际代码调整。');
    fillList('.reality-remaining', comparison?.remaining, '待实拍与网页画面共同验收。');
    $('.reality-revision-status').textContent = comparison?.revisionStatus || '改进状态待记录 · 尚未验收';
    $('.reality-comparison-limit').textContent = readable(comparison?.limits) || '这是视觉近似，尚未证明对真实海况的物理还原。';
    $('.reality-use-effect').textContent = `进入 ${effect.number}「${effect.name}」制作区 ↗`;
    if (updateUrl) { const url = new URL(location.href); url.searchParams.set('reality', effect.id); history.replaceState(null, '', url); }
    renderSource(); draw();
  }
  const coveredCount = EFFECTS.filter(effect => comparisons.get(effect.id)?.sourceIds?.some(id => sources.has(id))).length;
  $('.reality-summary').textContent = `${REAL_SEA_SOURCES.length} 份可追溯视频资料 · ${coveredCount} / 20 项已关联参考 · 对应现象 ≠ 原帖真实性认证`;
  for (const effect of EFFECTS) {
    const button = node('button'); button.type = 'button'; button.dataset.effect = effect.id;
    button.append(node('span', effect.number), node('strong', effect.name));
    button.addEventListener('click', () => { selectEffect(effect.id); $('.reality-effect-directory').open = false; $('.reality-select').focus({ preventScroll: true }); });
    directoryButtons.set(effect.id, button); $('.reality-directory').append(button);
    const option = node('option', `${effect.number} ${effect.name}`); option.value = effect.id; $('.reality-select').append(option);
  }
  for (const source of REAL_SEA_SOURCES) {
    const row = node('article');
    row.append(node('h4', source.title), node('p', `${readable(source.publisher)} · ${readable(source.location) || '地点未提供'}`),
      node('p', readable(source.provenance)), node('p', `处理说明：${readable(source.processing) || '未提供'}`),
      externalLink('发布方来源页 ↗', source.sourceUrl));
    $('.reality-source-list').append(row);
  }
  $('.reality-source-directory summary span').textContent = `${REAL_SEA_SOURCES.length} 份资料 · 保留归属、条件与局限`;
  const credit = node('p', REAL_SEA_LICENSE_NOTE, 'reality-license-credit');
  credit.append(document.createTextNode(' 视频署名：Dr. Roy Winkelman / FCIT · University of South Florida。 '),externalLink('ClipVideo ETC ↗','https://etc.usf.edu/clipvideo/'));
  $('.reality-source-directory').append(credit);
  $('.reality-select').addEventListener('change', event => selectEffect(event.target.value));
  $('.reality-pause').addEventListener('click', () => { paused = !paused; updatePause(); });
  $('.reality-lens').addEventListener('change', event => { lensEffects = event.target.checked; draw(); });
  $('.reality-use-effect').addEventListener('click', () => onSelectEffect?.(effect.id));
  for (const [selector, profile] of [['.reality-before', 'reference'], ['.reality-after', 'calibrated']]) {
    const result = createRenderer($(selector), { maxPixels: 180000 });
    const item = { ...result, profile }; renderers.push(item);
    result.renderer.canvas.addEventListener('renderer-lost', () => {
      const canvas = item.renderer.canvas, replacement = canvas.cloneNode(false); canvas.replaceWith(replacement);
      Object.assign(item, createRenderer(replacement, { maxPixels: 180000 })); resize();
      $('.reality-compatibility').textContent = '制作画面已恢复；兼容模式仅作示意。';
    }, { once: true });
  }
  $('.reality-compatibility').textContent = renderers.some(item => item.compatibility) ? '当前为兼容示意，不能据此判断写实质量。' : '同一组参数与时间 · 镜头效果可单独比较';
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe($('.reality-comparison-visuals'));
  const intersectionObserver = new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting);
    if (!inView && frame) { cancelAnimationFrame(frame); frame = 0; previousStamp = 0; }
    scheduleFrame();
  }, { rootMargin: '120px' }); intersectionObserver.observe($('.reality-comparison-visuals'));
  const visibilityChange = () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; previousStamp = 0; } else scheduleFrame(); };
  document.addEventListener('visibilitychange', visibilityChange);
  selectEffect(effect.id, false); updatePause(); resize(); section.dataset.ready = 'true';
  return {
    selectEffect,
    destroy() {
      destroyed = true; if (frame) cancelAnimationFrame(frame); stopMedia();
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', visibilityChange);
    },
  };
}
