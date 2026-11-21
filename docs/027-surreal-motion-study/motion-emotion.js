'use strict';

(() => {
  const root = document.getElementById('motion-emotion-root');
  const study = window.MOTION_STUDY;
  if (!root) return;
  if (!study || !Array.isArray(study.cases) || !study.cases.length) {
    root.innerHTML = '<p role="status">动作与情绪研究资料尚未载入。</p>';
    return;
  }

  const escape = (value) => String(Array.isArray(value) ? value.join('；') : value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const field = (label, value) => value ? `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>` : '';
  const meta = study.meta || {};
  const cases = study.cases;
  const rates = [1, 0.5, 0.25];
  let selected = 0;
  let metadataReady = false;
  let seekAvailability = 'loading';
  let pendingSeek = null;

  root.innerHTML = `
    <div class="chapter-header">
      <p class="eyebrow">ATMOSPHERE / ACTION / CAMERA / RHYTHM</p>
      <h1 id="motion-title">${escape(meta.title || '把氛围、动作与镜头放在一起看。')}</h1>
      <p class="lead">${escape(meta.lead || '回到原片观察主体、环境与观看关系怎样随时间配合。')}</p>
      <p class="me-scope">${escape(meta.scope || '本页是原片分析与创作组合提案；没有制作新的运动样片或产品演示。')}</p>
    </div>
    <div class="me-case-tabs" role="tablist" aria-label="选择动作与情绪分析原片">
      ${cases.map((item, index) => `<button class="me-case-tab" type="button" role="tab" id="me-tab-${index}" aria-controls="me-case-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-me-case="${index}">${escape(item.title)}</button>`).join('')}
    </div>
    <div id="me-case-panel" role="tabpanel" aria-labelledby="me-tab-0">
      <div class="me-study-layout">
        <div>
          <div class="me-player-wrap"><video id="me-video" controls playsinline muted preload="metadata" aria-label="当前原片分析回放"></video></div>
          <div class="me-player-controls">
            <div class="me-rate-controls" role="group" aria-label="分析回放速度">${rates.map((rate) => `<button type="button" data-me-rate="${rate}" aria-pressed="${rate === 1}">${rate}×</button>`).join('')}</div>
            <output class="me-time-output" id="me-time-output" aria-label="原片播放时间">0.00 / — 秒</output>
          </div>
          <p class="me-playback-note">速度按钮只改变本次分析回放。0.5× / 0.25× 不是原作踏频、实测车速或已经制作的慢动作成片；判断原作节奏请回到 1×。</p>
          <div class="me-segment-controls" id="me-segment-controls" role="group" aria-label="定位原片观察时刻"></div>
          <div class="me-step-controls" role="group" aria-label="小步查看姿态"><button type="button" data-me-step="-0.1" disabled>后退 0.10 秒</button><button type="button" data-me-step="0.1" disabled>前进 0.10 秒</button></div>
          <p class="me-playback-note">小步定位会暂停视频，时间由浏览器媒体寻址决定；不是逐帧工具，也不是踏频测量。</p>
          <p class="me-time-status" id="me-time-status" role="status">正在载入原片时间信息…</p>
          <p class="me-segment-note" id="me-segment-note"></p>
          <a class="text-link me-source-link" id="me-source-link" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a>
          <details class="analysis-details me-contact-sheet" id="me-contact-sheet" hidden><summary>查看动作密集抽帧</summary><button type="button" class="image-button" id="me-contact-zoom"><img id="me-contact-image" alt="" loading="lazy"></button><p class="me-playback-note" id="me-contact-note"></p></details>
        </div>
        <div class="me-analysis-copy" aria-live="polite">
          <span class="evidence-label">原片观察 / 表观关系</span>
          <h2 id="me-case-title"></h2>
          <dl class="me-observation-list" id="me-observation-list"></dl>
          <div class="me-interpretation"><span class="evidence-label">视觉解释 · 情绪假设</span><p id="me-emotion"></p></div>
          <div class="me-limit"><span class="evidence-label">尚未确认</span><p id="me-evidence-limit"></p></div>
          <div class="me-watch-for"><span class="evidence-label">回放时重点看</span><p id="me-watch-for"></p></div>
        </div>
      </div>
    </div>
    <div class="section-heading"><div><p class="eyebrow">FIVE DIFFERENT VARIABLES</p><h2>“频率”和“快慢”要分开记录</h2></div><p>不同变量可能共同塑造感受，不能互相代替。</p></div>
    <div class="me-variables-grid">${(study.variables || []).map((item) => `<article><h3>${escape(item.title)}</h3><p>${escape(item.definition)}</p><p class="me-variable-limit">${escape(item.limit)}</p></article>`).join('')}</div>
    <div class="section-heading"><div><p class="eyebrow">MORE SCENES / EMOTIONAL RECIPES</p><h2>还有这些组合，可以继续探索</h2></div><p>以下六个场景的静态图已补齐，动作、镜头与节奏仍是创作设想。可到“原创关键帧”查看 G–L。</p></div>
    <div class="me-recipes-grid">${(study.recipes || []).map((item, index) => `<article class="me-recipe"><span class="me-recipe-index">${String(index + 1).padStart(2, '0')} / ${escape(item.id || 'CONCEPT')}</span><h3>${escape(item.title)}</h3><span class="me-recipe-status">创作组合 · 未验证</span><dl>${field('场景', item.scene)}${field('氛围', item.mood)}${field('动作', item.action)}${field('镜头', item.camera)}${field('节奏', item.rhythm)}${field('目标情绪', item.emotion)}</dl><p class="me-variable-limit">${escape(item.limit)}</p></article>`).join('')}</div>
    ${study.sourceNote ? `<p class="evidence-note">${escape(study.sourceNote)}</p>` : ''}
    <div class="me-conclusion"><span class="eyebrow">WHAT WE KEEP</span><p>${escape(study.conclusion || '把环境氛围、动作、观看关系与节奏记录在同一份制作简报中，再用自己的样片验证。')}</p></div>
  `;

  const $ = (id) => root.querySelector('#' + id);
  const video = $('me-video');
  const tabs = [...root.querySelectorAll('[data-me-case]')];
  video.defaultMuted = true;
  video.muted = true;

  function updateTime() {
    const duration = Number.isFinite(video.duration) ? video.duration.toFixed(2) : '—';
    $('me-time-output').textContent = `${Number.isFinite(video.currentTime) ? video.currentTime.toFixed(2) : '0.00'} / ${duration} 秒`;
  }
  function updateRates() {
    root.querySelectorAll('[data-me-rate]').forEach((button) => button.setAttribute('aria-pressed', String(Math.abs(Number(button.dataset.meRate) - video.playbackRate) < 0.001)));
  }
  function getSeekRanges() {
    if (!metadataReady) return [];
    const ranges = [];
    for (let index = 0; index < video.seekable.length; index += 1) {
      const start = Math.max(0, video.seekable.start(index));
      const end = Math.min(video.duration, video.seekable.end(index));
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) ranges.push({ start, end });
    }
    return ranges;
  }
  function updateSeekControls() {
    const canSeek = getSeekRanges().length > 0 && !video.seeking;
    root.querySelectorAll('[data-me-seek], [data-me-step]').forEach((button) => { button.disabled = !canSeek; });
  }
  function refreshSeekAvailability() {
    metadataReady = video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0 && !video.error;
    const next = !metadataReady ? 'loading' : getSeekRanges().length ? 'ready' : 'waiting';
    updateSeekControls();
    updateTime();
    if (next === seekAvailability) return;
    seekAvailability = next;
    if (pendingSeek) return;
    $('me-time-status').textContent = next === 'ready'
      ? '已取得有效可定位区间；可原速回放、慢放或暂停定位。默认静音，可在播放器中开启声音。'
      : next === 'waiting'
        ? '时间信息已载入，但尚无有效可定位区间；可用原生播放器原速观看或慢放，定位按钮等待资源就绪。'
        : '正在载入原片时间信息…';
  }
  function clearSegmentSelection() {
    root.querySelectorAll('[data-me-seek]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
  }
  function seekTo(time, segmentIndex = null) {
    if (!Number.isFinite(time)) return;
    refreshSeekAvailability();
    const ranges = getSeekRanges();
    if (!ranges.length || video.seeking) return;
    video.pause();
    const candidates = ranges.map((range) => Math.max(range.start, Math.min(time, Math.max(range.start, range.end - 0.001))));
    const target = candidates.reduce((nearest, candidate) => Math.abs(candidate - time) < Math.abs(nearest - time) ? candidate : nearest);
    pendingSeek = { requested: time, target, segmentIndex };
    clearSegmentSelection();
    const segment = segmentIndex === null ? null : cases[selected].segments?.[segmentIndex];
    $('me-segment-note').textContent = segment?.text || segment?.label || cases[selected].watchFor || '';
    try {
      if (Math.abs(video.currentTime - target) < 0.001) {
        finishSeek();
        return;
      }
      video.currentTime = target;
      $('me-time-status').textContent = `正在请求 ${time.toFixed(2)} 秒，范围内目标 ${target.toFixed(2)} 秒；等待浏览器返回实际定位结果。`;
      updateSeekControls();
      updateTime();
    } catch {
      pendingSeek = null;
      updateSeekControls();
      $('me-time-status').textContent = '此时刻暂不能定位，请等待原片载入后重试。';
    }
  }
  function finishSeek() {
    updateTime();
    const request = pendingSeek;
    pendingSeek = null;
    updateSeekControls();
    if (!request) {
      $('me-time-status').textContent = `浏览器实际播放位置：${video.currentTime.toFixed(2)} 秒。`;
      return;
    }
    video.pause();
    const actual = video.currentTime;
    const reached = Number.isFinite(actual) && Math.abs(actual - request.target) <= 0.06;
    const rangeNote = Math.abs(request.requested - request.target) > 0.001 ? `，可定位范围内目标 ${request.target.toFixed(2)} 秒` : '';
    $('me-time-status').textContent = reached
      ? `视频已暂停：请求 ${request.requested.toFixed(2)} 秒${rangeNote}，浏览器实际位置 ${actual.toFixed(2)} 秒；不是逐帧定位。`
      : `未到达请求位置：请求 ${request.requested.toFixed(2)} 秒${rangeNote}，浏览器实际返回 ${Number.isFinite(actual) ? actual.toFixed(2) : '未知'} 秒。请等待资源就绪后重试或使用原生播放器。`;
    clearSegmentSelection();
    if (reached && request.segmentIndex !== null) {
      const button = root.querySelector(`[data-me-segment="${request.segmentIndex}"]`);
      if (button) button.setAttribute('aria-pressed', 'true');
    }
  }
  function setCase(index, focus = false) {
    const parsed = Number(index);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed >= cases.length) return;
    selected = parsed;
    const item = cases[selected];
    video.pause();
    metadataReady = false;
    seekAvailability = 'loading';
    pendingSeek = null;
    video.poster = item.poster || '';
    video.src = item.video;
    video.playbackRate = 1;
    video.load();
    video.setAttribute('aria-label', `${item.title} 原片分析回放`);
    $('me-case-title').textContent = item.title;
    $('me-observation-list').innerHTML = field('环境氛围', item.atmosphere) + field('主体动作', item.action) + field('观看关系', item.camera) + field('节奏观察', item.tempo);
    $('me-emotion').textContent = item.emotion || '';
    $('me-evidence-limit').textContent = item.evidenceLimit || '';
    $('me-watch-for').textContent = item.watchFor || '';
    $('me-segment-note').textContent = item.watchFor || '';
    $('me-source-link').href = item.sourceUrl || '#sources';
    $('me-segment-controls').innerHTML = (item.segments || []).map((segment, segmentIndex) => `<button type="button" data-me-seek="${Number(segment.time)}" data-me-segment="${segmentIndex}" aria-pressed="false" disabled>${escape(segment.label || `${Number(segment.time).toFixed(2)} 秒`)}</button>`).join('');
    $('me-time-status').textContent = '正在载入原片时间信息…';
    const contact = $('me-contact-sheet');
    contact.hidden = !item.contactSheet;
    contact.open = false;
    if (item.contactSheet) {
      $('me-contact-image').src = item.contactSheet;
      $('me-contact-image').alt = `${item.title} 动作密集抽帧，供观察姿态与空间关系`;
      $('me-contact-zoom').dataset.image = item.contactSheet;
      $('me-contact-zoom').dataset.imageTitle = `${item.title} · 动作密集抽帧`;
      $('me-contact-note').textContent = item.contactSheetNote || '12 处等间隔抽帧 · 间隔 0.20 秒 · 完整画幅 SDR 预览。用于观察姿态与空间关系，不是逐帧播放或踏频测量。';
    } else {
      $('me-contact-image').removeAttribute('src');
      $('me-contact-zoom').removeAttribute('data-image');
      $('me-contact-zoom').removeAttribute('data-image-title');
    }
    $('me-case-panel').setAttribute('aria-labelledby', `me-tab-${selected}`);
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    updateRates();
    updateSeekControls();
    updateTime();
    if (focus) tabs[selected].focus({ preventScroll: true });
  }

  ['loadedmetadata', 'loadeddata', 'progress', 'canplay', 'canplaythrough', 'durationchange'].forEach((event) => video.addEventListener(event, refreshSeekAvailability));
  video.addEventListener('emptied', () => { metadataReady = false; seekAvailability = 'loading'; pendingSeek = null; updateSeekControls(); updateTime(); });
  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('seeking', updateSeekControls);
  video.addEventListener('seeked', finishSeek);
  video.addEventListener('ratechange', updateRates);
  video.addEventListener('error', () => { metadataReady = false; pendingSeek = null; updateSeekControls(); $('me-time-status').textContent = '本地原片暂未能加载，可通过原帖链接查看。'; });
  root.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-me-case]');
    if (tab) { setCase(Number(tab.dataset.meCase)); return; }
    const rateButton = event.target.closest('[data-me-rate]');
    if (rateButton) {
      const rate = Number(rateButton.dataset.meRate);
      if (rates.includes(rate)) {
        video.playbackRate = rate;
        updateRates();
        $('me-time-status').textContent = `分析回放速度：${rate}×。原作节奏请以 1× 观看判断。`;
      }
      return;
    }
    const segment = event.target.closest('[data-me-seek]');
    if (segment) { seekTo(Number(segment.dataset.meSeek), Number(segment.dataset.meSegment)); return; }
    const step = event.target.closest('[data-me-step]');
    if (step) seekTo(video.currentTime + Number(step.dataset.meStep));
  });
  root.querySelector('.me-case-tabs').addEventListener('keydown', (event) => {
    let next = selected;
    if (event.key === 'ArrowRight') next = (selected + 1) % cases.length;
    else if (event.key === 'ArrowLeft') next = (selected + cases.length - 1) % cases.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cases.length - 1;
    else return;
    event.preventDefault();
    setCase(next, true);
  });
  window.addEventListener('hashchange', () => {
    if (window.location.hash !== '#motion' || root.closest('[data-view]')?.hidden) video.pause();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
  setCase(0);
})();
