function mountCameraStudio(root) {
  const shots = {
    track: { name: '跟拍', purpose: '跟住主体', hint: '机位随巡检车移动，让车身稳定地留在取景范围内。' },
    zoom: { name: '快速推近', purpose: '强调细节', hint: '快速收窄视场，把注意力从整辆车集中到传感器。', renderHint: '短暂建立全景后，收窄视场并微微前移，让观众看清传感器。' },
    time: { name: '移动延时', purpose: '压缩行程', hint: '机位推进，同时加快场景时钟，让更长的巡检路程进入四秒。' },
    bullet: { name: '子弹时间', purpose: '停住瞬间', hint: '巡检车定格在同一位置，机位从一侧绕到另一侧。' },
    fly: { name: '飞越', purpose: '交代空间', hint: '高机位沿温室移动，先看清种植行和巡检路线的关系。' },
  };
  const formats = {
    landscape: { name: '横屏', width: 1280, height: 720 },
    portrait: { name: '竖屏', width: 720, height: 1280 },
  };
  const duration = 4;
  root.innerHTML = `<section class="camera-studio" aria-label="运镜工作台">
    <section class="camera-film" id="camera-film" data-film-format="landscape" aria-labelledby="camera-film-title" hidden>
      <div class="camera-film-copy">
        <div class="camera-label">成片 / VERDANT R04</div><h2 id="camera-film-title">温室巡检 · 宣传短片</h2>
        <p>从温室空间到巡检车细节，连续观看完整剪辑。</p>
        <fieldset class="camera-format camera-film-format" id="camera-film-formats" hidden>
          <legend>成片画幅 · 切换保留播放位置</legend>
          <button type="button" data-film-format="landscape" aria-controls="camera-film-preview" aria-pressed="true">横屏 16:9</button>
          <button type="button" data-film-format="portrait" aria-controls="camera-film-preview" aria-pressed="false">竖屏 9:16</button>
        </fieldset>
        <p id="camera-film-meta" role="status"></p>
        <div class="camera-film-actions"><a id="camera-film-download">下载成片 MP4 ↓</a><a href="camera-media/verdant-r04-release.zip" download>下载交付包 ZIP ↓</a><a href="../#explore-07" target="_top">校对字幕 ↗</a></div>
      </div>
      <div class="camera-film-screen"><video id="camera-film-preview" controls playsinline preload="metadata" aria-label="温室巡检宣传短片"><track kind="subtitles" srclang="zh-CN" label="中文画面说明" src="camera-media/film.zh.vtt"></video></div>
      <div class="camera-film-cut" id="camera-film-cut" hidden>
        <p class="camera-label" id="camera-film-chapters-label">成片时间线</p>
        <ol id="camera-film-chapters" aria-labelledby="camera-film-chapters-label"></ol>
      </div>
    </section>
    <div class="camera-console" data-format="landscape">
      <section class="camera-monitor" aria-label="镜头播放器">
        <header class="camera-monitor-bar"><span><i></i> 温室巡检 <small id="camera-monitor-source">路线预览</small></span><span id="camera-monitor-format">16:9 · 720p</span></header>
        <div class="camera-screen">
          <video id="camera-render-preview" playsinline preload="metadata" aria-label="所选镜头的渲染成片" hidden></video>
          <canvas id="camera-canvas" width="1280" height="720" role="img" aria-label="温室巡检车在当前镜头下的三维透视画面"></canvas>
        </div>
        <div class="camera-transport">
          <button id="camera-play" type="button" aria-controls="camera-render-preview camera-canvas">▶ 播放</button>
          <label class="camera-scrub"><span>镜头时间</span><input id="camera-time" type="range" min="0" max="4" step=".01" value="1.65"></label>
          <output id="camera-time-value" for="camera-time"></output>
        </div>
      </section>
      <aside class="camera-inspector" aria-label="镜头设置">
        <div class="camera-label">当前镜头</div><h2 id="camera-shot-name">跟拍</h2><p id="camera-hint"></p>
        <dl class="camera-readout" id="camera-route-readout"><div><dt>机位高度</dt><dd id="camera-view"></dd></div><div><dt>视场角</dt><dd id="camera-fov"></dd></div><div><dt>场景时间</dt><dd id="camera-subject"></dd></div></dl>
        <dl class="camera-readout" id="camera-render-readout" hidden><div><dt>画面尺寸</dt><dd id="camera-render-size">—</dd></div><div><dt>成片时长</dt><dd id="camera-render-duration">—</dd></div><div><dt>素材</dt><dd id="camera-render-format">—</dd></div></dl>
        <fieldset class="camera-format"><legend>输出画幅</legend>
          <button type="button" data-camera-format="landscape" aria-pressed="true">横屏 16:9</button>
          <button type="button" data-camera-format="portrait" aria-pressed="false">竖屏 9:16</button>
        </fieldset>
        <div class="camera-export-row">
          <button id="camera-export" type="button" class="camera-primary">录制路线预览</button>
          <button id="camera-storyboard" type="button">生成路线分镜</button>
        </div>
        <p class="camera-export-status" id="camera-export-status" role="status"></p>
        <div class="camera-downloads"><a id="camera-video-download" hidden></a><a id="camera-storyboard-download" hidden></a></div>
      </aside>
    </div>
    <div class="camera-library-head"><h2>镜头库</h2><p>切换镜头时保留播放位置，便于比较同一时刻。</p></div>
    <div class="camera-shot-list" aria-label="可选镜头">${Object.entries(shots).map(([key, shot], index) => `
      <button type="button" data-shot="${key}" aria-pressed="${key === 'track'}">
        <img width="208" height="117" alt="" loading="lazy" hidden>
        <canvas width="208" height="117" aria-hidden="true"></canvas>
        <span class="camera-shot-copy"><span class="camera-shot-index">0${index + 1}</span><strong>${shot.name}</strong><small>${shot.purpose}</small></span>
      </button>`).join('')}
    </div>
    <section class="camera-delivery" id="camera-delivery" aria-label="生成的交付文件" hidden>
      <figure id="camera-video-result" hidden><video id="camera-video-preview" controls playsinline preload="metadata" aria-label="已录制的路线预览视频"></video><figcaption id="camera-video-caption"></figcaption></figure>
      <figure id="camera-storyboard-result" hidden><img id="camera-storyboard-preview" alt="所选镜头的分镜图"><figcaption id="camera-storyboard-caption"></figcaption></figure>
    </section>
  </section>`;
  const find = selector => root.querySelector(selector);
  const canvas = find('#camera-canvas');
  const context = canvas.getContext('2d');
  const renderPreview = find('#camera-render-preview');
  const filmPreview = find('#camera-film-preview');
  const filmSection = find('#camera-film');
  const filmButtons = [...root.querySelectorAll('button[data-film-format]')];
  const consolePanel = find('.camera-console');
  const timeline = find('#camera-time');
  const play = find('#camera-play');
  const videoButton = find('#camera-export');
  const storyboardButton = find('#camera-storyboard');
  const status = find('#camera-export-status');
  const videoLink = find('#camera-video-download');
  const storyboardLink = find('#camera-storyboard-download');
  const video = find('#camera-video-preview');
  const storyboard = find('#camera-storyboard-preview');
  const delivery = find('#camera-delivery');
  const videoResult = find('#camera-video-result');
  const storyboardResult = find('#camera-storyboard-result');
  const shotButtons = [...root.querySelectorAll('[data-shot]')];
  const formatButtons = [...root.querySelectorAll('[data-camera-format]')];
  const mimeType = typeof MediaRecorder !== 'undefined' && typeof canvas.captureStream === 'function'
    ? ['video/mp4;codecs=avc1.42001f', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type))
    : undefined;
  videoButton.hidden = !mimeType;
  let shot = 'track';
  let format = 'landscape';
  let animation = 0;
  let exportVersion = 0;
  let activeRender;
  let renderReady = false;
  let userSelected = false;
  const assets = new Map();
  const unavailable = new Set();
  const filmAssets = new Map();
  let filmDuration;
  let filmFormat;
  let filmPending;
  let filmChapters = [];
  const mediaRoot = new URL('camera-media/', document.baseURI);

  const lerp = (start, end, progress) => start + (end - start) * progress;

  function mediaURL(path, type) {
    if (typeof path !== 'string' || !/^(?:[\w.-]+\/)*[\w.-]+$/.test(path)) return '';
    const extension = type === 'video' ? /\.(mp4|webm)$/i : /\.(png|jpe?g|webp|avif)$/i;
    if (!extension.test(path)) return '';
    const url = new URL(path, mediaRoot).href;
    return url.startsWith(mediaRoot.href) ? url : '';
  }

  function imageURL(value, view) {
    return mediaURL(typeof value === 'object' && value !== null ? value[view] : view === 'landscape' ? value : '', 'image');
  }

  function setLocalLink(link, url, label) {
    link.href = url;
    link.download = new URL(url).pathname.split('/').at(-1);
    link.textContent = label;
    link.hidden = false;
  }

  function updateFilmChapters(time) {
    const current = filmChapters.findLastIndex(chapter => chapter.time <= time + .00001);
    filmChapters.forEach(({ button }, index) => button.setAttribute('aria-current', String(index === current)));
  }

  function showFilm(view) {
    const asset = filmAssets.get(view);
    if (!asset || filmFormat === view) return;
    filmPending ??= { time: filmPreview.currentTime, playing: !filmPreview.paused };
    filmFormat = view;
    filmSection.dataset.filmFormat = view;
    filmButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filmFormat === view)));
    filmPreview.poster = asset.poster;
    filmPreview.src = asset.file;
    setLocalLink(find('#camera-film-download'), asset.file, `下载${formats[view].name}成片 MP4 ↓`);
    const facts = [formats[view].name];
    if (Number.isFinite(filmDuration)) facts.push(`${filmDuration.toFixed(1)} 秒`);
    if (Number.isFinite(asset.width) && Number.isFinite(asset.height)) facts.push(`${asset.width} × ${asset.height}`);
    find('#camera-film-meta').textContent = facts.join(' · ');
  }

  function mountFilmChapters(entries) {
    if (!Array.isArray(entries) || !Number.isFinite(filmDuration)) return;
    const list = find('#camera-film-chapters');
    for (const chapter of entries) {
      if (!chapter || !Object.hasOwn(shots, chapter.id) || typeof chapter.title !== 'string'
        || !Number.isFinite(chapter.time) || chapter.time <= (filmChapters.at(-1)?.time ?? -1)
        || chapter.time < 0 || chapter.time >= filmDuration) continue;
      const item = document.createElement('li');
      const button = document.createElement('button');
      const label = document.createElement('span');
      const title = document.createElement('strong');
      label.textContent = `${chapter.time.toFixed(2)} 秒`;
      title.textContent = chapter.title;
      button.type = 'button';
      button.setAttribute('aria-controls', 'camera-film-preview');
      button.append(label, title);
      button.addEventListener('click', () => {
        const time = Math.ceil(chapter.time * 1000) / 1000;
        if (filmPreview.readyState < 1) filmPending = { ...filmPending, time };
        else filmPreview.currentTime = time;
        updateFilmChapters(time);
      });
      item.append(button);
      list.append(item);
      filmChapters.push({ time: chapter.time, button });
    }
    if (filmChapters.length) {
      find('#camera-film-cut').hidden = false;
      updateFilmChapters(0);
    }
  }

  function cameraFor(time, type) {
    const progress = time / duration;
    const world = type === 'bullet' ? 2.2 : type === 'time' ? time * 1.45 : time;
    const x = -4.6 + world * 1.65;
    const z = 2.7 - world * .92;
    const subject = [x, .64, z];
    if (type === 'zoom') {
      const t = Math.min(1, Math.max(0, (time - .6) / .86));
      return { eye: [-1, 4.1, 9.1], target: subject, fov: lerp(64, 23, t * t * (3 - 2 * t)), world, subject };
    }
    if (type === 'time') return { eye: [lerp(-6.9, 1.4, progress), 2.5, lerp(8.9, 4.4, progress)], target: [x + 1.0, .65, z - 1.1], fov: 53, world, subject };
    if (type === 'bullet') {
      const angle = lerp(-1.03, 1.58, progress);
      return { eye: [x + Math.sin(angle) * 4.7, 2.45, z + Math.cos(angle) * 4.7], target: subject, fov: 39, world, subject };
    }
    if (type === 'fly') return { eye: [lerp(-8.2, 7.7, progress), 10.8, lerp(7.8, -1.4, progress)], target: [lerp(-3.3, 2.2, progress), 0, -.6], fov: 55, world, subject };
    return { eye: [x - 2.7, 2.43, z + 3.55], target: [x, .69, z], fov: 49, world, subject };
  }

  function paint(target, time, type) {
    greenhouseScene.paint(target, cameraFor(time, type), target.canvas.width, target.canvas.height);
  }

  function updateMonitor() {
    const time = Number(timeline.value);
    find('#camera-time-value').textContent = `${time.toFixed(2)} / ${Number(timeline.max).toFixed(2)} s`;
    if (activeRender) return;
    const camera = cameraFor(time, shot);
    greenhouseScene.paint(context, camera, canvas.width, canvas.height);
    find('#camera-view').textContent = `${camera.eye[1].toFixed(1)} m`;
    find('#camera-fov').textContent = `${camera.fov.toFixed(0)}°`;
    find('#camera-subject').textContent = `${camera.world.toFixed(2)} s`;
  }

  function updateSelection() {
    find('#camera-shot-name').textContent = shots[shot].name;
    shotButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.shot === shot)));
    formatButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cameraFormat === format)));
    consolePanel.dataset.format = format;
    find('#camera-monitor-format').textContent = format === 'landscape' ? '16:9 · 720p' : '9:16 · 720p';
    const { width, height } = formats[format];
    const asset = assets.get(shot)?.[format];
    activeRender = asset && !unavailable.has(asset.file) ? asset : undefined;
    find('#camera-hint').textContent = (activeRender && shots[shot].renderHint) || shots[shot].hint;
    renderReady = false;
    timeline.max = duration;
    renderPreview.hidden = !activeRender;
    canvas.hidden = Boolean(activeRender);
    find('#camera-monitor-source').textContent = activeRender ? 'Blender 成片' : '路线预览';
    find('#camera-route-readout').hidden = Boolean(activeRender);
    find('#camera-render-readout').hidden = !activeRender;
    videoButton.hidden = Boolean(activeRender) || !mimeType;
    storyboardButton.hidden = Boolean(activeRender);
    if (activeRender) {
      const label = activeRender.file.split('.').at(-1).toUpperCase();
      find('#camera-render-size').textContent = '—';
      find('#camera-render-duration').textContent = '—';
      find('#camera-render-format').textContent = label;
      renderPreview.poster = activeRender.poster;
      renderPreview.src = activeRender.file;
      setLocalLink(videoLink, activeRender.file, `下载镜头 ${label} ↓`);
      status.textContent = '播放器与下载使用同一个成片文件。';
      if (activeRender.storyboard) {
        storyboard.src = activeRender.storyboard;
        setLocalLink(storyboardLink, activeRender.storyboard, '下载成片分镜 ↓');
        find('#camera-storyboard-caption').textContent = `${shots[shot].name} · 选自当前成片`;
        storyboardResult.hidden = delivery.hidden = false;
      }
    } else {
      if (renderPreview.hasAttribute('src')) {
        renderPreview.removeAttribute('src');
        renderPreview.removeAttribute('poster');
        renderPreview.load();
      }
      canvas.width = width;
      canvas.height = height;
      status.textContent = asset
        ? '成片暂时无法播放，当前显示路线预览。'
        : '此镜头与画幅当前可使用路线预览。';
    }
    updateMonitor();
  }

  function pause() {
    cancelAnimationFrame(animation);
    animation = 0;
    if (!renderPreview.paused) renderPreview.pause();
    play.textContent = '▶ 播放';
  }

  function resetDelivery() {
    exportVersion++;
    video.removeAttribute('src');
    video.load();
    storyboard.removeAttribute('src');
    for (const link of [videoLink, storyboardLink]) {
      if (link.href.startsWith('blob:')) URL.revokeObjectURL(link.href);
      link.removeAttribute('href');
      link.hidden = true;
    }
    videoResult.hidden = storyboardResult.hidden = delivery.hidden = true;
  }

  function showFile(link, file, filename, label) {
    if (link.href.startsWith('blob:')) URL.revokeObjectURL(link.href);
    link.href = URL.createObjectURL(file);
    link.download = filename;
    link.textContent = label;
    link.hidden = false;
    delivery.hidden = false;
    return link.href;
  }

  async function loadMediaManifest() {
    let manifest;
    try {
      const response = await fetch(new URL('manifest.json', mediaRoot), { cache: 'no-cache' });
      if (!response.ok) return;
      manifest = await response.json();
      if (!manifest || typeof manifest !== 'object') return;
    } catch {
      return;
    }
    for (const entry of Array.isArray(manifest.shots) ? manifest.shots : []) {
      if (!entry || !Object.hasOwn(shots, entry.id)) continue;
      const variants = {};
      for (const view of Object.keys(formats)) {
        const file = mediaURL(entry[view], 'video');
        if (!file) continue;
        variants[view] = {
          file,
          poster: imageURL(entry.poster, view),
          storyboard: imageURL(entry.storyboard, view),
        };
      }
      if (Object.keys(variants).length) assets.set(entry.id, variants);
    }
    for (const button of shotButtons) {
      const thumb = button.querySelector('img');
      const poster = assets.get(button.dataset.shot)?.landscape?.poster;
      if (!poster) continue;
      const fallback = button.querySelector('canvas');
      thumb.addEventListener('error', () => { thumb.hidden = true; fallback.hidden = false; }, { once: true });
      thumb.src = poster;
      thumb.hidden = false;
      fallback.hidden = true;
    }
    const film = manifest.film;
    for (const [view, asset] of [['landscape', film], ['portrait', film?.portrait]]) {
      const file = mediaURL(asset?.file, 'video');
      if (file) filmAssets.set(view, { ...asset, file, poster: mediaURL(asset.poster, 'image') });
    }
    if (filmAssets.size) {
      filmDuration = film.duration;
      mountFilmChapters(film.chapters);
      showFilm(filmAssets.keys().next().value);
      find('#camera-film-formats').hidden = filmAssets.size < 2;
      filmSection.hidden = false;
    }
    if (!userSelected && !assets.get(shot)?.[format]) {
      const first = Object.keys(shots).find(type => assets.get(type)?.landscape);
      if (first) shot = first;
    }
    if (assets.get(shot)?.[format]) {
      pause();
      if (!userSelected) timeline.value = 0;
      resetDelivery();
      updateSelection();
    }
  }

  function createFrame(width, height) {
    const frame = document.createElement('canvas');
    frame.width = width;
    frame.height = height;
    return frame;
  }

  function record(frame, type) {
    const renderer = frame.getContext('2d');
    paint(renderer, 0, type);
    const stream = frame.captureStream(30);
    return new Promise((resolve, reject) => {
      let tick = 0;
      let started;
      let recorder;
      const chunks = [];
      const cleanup = () => {
        cancelAnimationFrame(tick);
        document.removeEventListener('visibilitychange', interrupt);
        for (const track of stream.getTracks()) track.stop();
      };
      const interrupt = () => {
        if (!document.hidden) return;
        cleanup();
        reject(new Error('Recording interrupted'));
      };
      function render(now) {
        started ??= now;
        const time = Math.min(duration, (now - started) / 1000);
        paint(renderer, time, type);
        tick = requestAnimationFrame(time < duration ? render : () => recorder.stop());
      }
      try {
        recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_500_000 });
        recorder.addEventListener('dataavailable', event => { if (event.data.size) chunks.push(event.data); });
        recorder.addEventListener('error', event => { cleanup(); reject(event.error); }, { once: true });
        recorder.addEventListener('stop', () => {
          cleanup();
          const file = new Blob(chunks, { type: recorder.mimeType || mimeType });
          if (file.size) resolve(file);
          else reject(new Error('Empty video'));
        }, { once: true });
        recorder.start();
        document.addEventListener('visibilitychange', interrupt);
        tick = requestAnimationFrame(render);
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  for (const button of shotButtons) {
    const type = button.dataset.shot;
    paint(button.querySelector('canvas').getContext('2d'), type === 'zoom' ? 1.5 : 1.65, type);
    button.addEventListener('click', () => {
      userSelected = true;
      if (type === shot) return;
      pause();
      shot = type;
      resetDelivery();
      updateSelection();
    });
  }

  for (const button of formatButtons) button.addEventListener('click', () => {
    userSelected = true;
    if (format === button.dataset.cameraFormat) return;
    pause();
    format = button.dataset.cameraFormat;
    resetDelivery();
    updateSelection();
  });

  renderPreview.addEventListener('loadedmetadata', () => {
    if (!activeRender || renderPreview.currentSrc !== activeRender.file) return;
    renderReady = true;
    const selectedTime = Number(timeline.value);
    const videoDuration = Number.isFinite(renderPreview.duration) ? renderPreview.duration : duration;
    timeline.max = videoDuration;
    renderPreview.currentTime = Math.min(selectedTime, videoDuration);
    timeline.value = renderPreview.currentTime;
    find('#camera-render-size').textContent = `${renderPreview.videoWidth}×${renderPreview.videoHeight}`;
    find('#camera-render-duration').textContent = `${videoDuration.toFixed(2)} s`;
    find('#camera-monitor-format').textContent = `${format === 'landscape' ? '16:9' : '9:16'} · ${Math.min(renderPreview.videoWidth, renderPreview.videoHeight)}p`;
    updateMonitor();
  });
  renderPreview.addEventListener('timeupdate', () => {
    if (!activeRender || !renderReady) return;
    timeline.value = renderPreview.currentTime;
    updateMonitor();
  });
  renderPreview.addEventListener('play', () => { if (activeRender) play.textContent = 'Ⅱ 暂停'; });
  for (const event of ['pause', 'ended']) renderPreview.addEventListener(event, () => {
    if (activeRender) play.textContent = '▶ 播放';
  });
  renderPreview.addEventListener('error', () => {
    if (!activeRender || renderPreview.src !== activeRender.file) return;
    unavailable.add(activeRender.file);
    pause();
    resetDelivery();
    updateSelection();
  });
  filmPreview.addEventListener('play', () => { pause(); video.pause(); });
  filmPreview.addEventListener('loadedmetadata', () => {
    if (filmPreview.currentSrc !== filmAssets.get(filmFormat)?.file || !filmPending) return;
    const { time, playing } = filmPending;
    filmPending = undefined;
    filmPreview.currentTime = Math.min(time, filmPreview.duration);
    updateFilmChapters(filmPreview.currentTime);
    if (playing) filmPreview.play().catch(() => {});
  });
  filmPreview.addEventListener('timeupdate', () => {
    if (!filmPending) updateFilmChapters(filmPreview.currentTime);
  });
  filmButtons.forEach(button => button.addEventListener('click', () => showFilm(button.dataset.filmFormat)));
  video.addEventListener('play', () => { pause(); filmPreview.pause(); });
  filmPreview.addEventListener('error', () => {
    find('#camera-film-meta').textContent = '短片暂时无法播放。';
  });
  timeline.addEventListener('input', () => {
    pause();
    if (activeRender && renderReady) renderPreview.currentTime = Number(timeline.value);
    updateMonitor();
  });
  play.addEventListener('click', () => {
    filmPreview.pause();
    video.pause();
    if (activeRender) {
      if (!renderPreview.paused) return pause();
      if (renderPreview.ended) renderPreview.currentTime = 0;
      const source = activeRender.file;
      renderPreview.play().catch(() => {
        if (activeRender?.file === source) status.textContent = '播放未启动，可重试或下载镜头文件。';
      });
      return;
    }
    if (animation) return pause();
    const offset = Number(timeline.value) === duration ? 0 : Number(timeline.value);
    const started = performance.now();
    const tick = now => {
      timeline.value = Math.min(duration, offset + (now - started) / 1000);
      updateMonitor();
      if (Number(timeline.value) < duration) animation = requestAnimationFrame(tick);
      else pause();
    };
    play.textContent = 'Ⅱ 暂停';
    animation = requestAnimationFrame(tick);
  });

  videoButton.addEventListener('click', async () => {
    if (activeRender) return;
    const version = exportVersion;
    const current = shot;
    const { width, height } = formats[format];
    const fileName = `greenhouse-${current}-${format}`;
    videoButton.disabled = storyboardButton.disabled = true;
    status.textContent = '正在录制 4 秒路线预览，请保持页面在前台。';
    try {
      const file = await record(createFrame(width, height), current);
      if (version !== exportVersion) return;
      const ext = file.type.startsWith('video/mp4') ? 'mp4' : 'webm';
      video.src = showFile(videoLink, file, `${fileName}-route-preview.${ext}`, `下载路线预览 ${ext.toUpperCase()} ↓`);
      videoResult.hidden = false;
      find('#camera-video-caption').textContent = `${shots[current].name} · ${formats[format].name} · 路线预览`;
      status.textContent = '路线预览已录制，可播放或下载。';
    } catch {
      if (version === exportVersion) status.textContent = '录制中断。请在当前页重试，或生成分镜。';
    } finally {
      videoButton.disabled = storyboardButton.disabled = false;
    }
  });

  storyboardButton.addEventListener('click', async () => {
    if (activeRender) return;
    const version = exportVersion;
    const current = shot;
    const { width, height } = formats[format];
    const frame = createFrame(width / 2, height / 2);
    const panel = frame.getContext('2d');
    const bar = 36;
    const sheet = createFrame(frame.width * 2, (frame.height + bar) * 2);
    const page = sheet.getContext('2d');
    videoButton.disabled = storyboardButton.disabled = true;
    try {
      for (let index = 0; index < 4; index++) {
        const time = index * duration / 3;
        const x = index % 2 * frame.width;
        const y = Math.floor(index / 2) * (frame.height + bar);
        paint(panel, time, current);
        page.fillStyle = '#172829';
        page.fillRect(x, y, frame.width, bar);
        page.fillStyle = '#eff8ee';
        page.font = '600 15px sans-serif';
        page.fillText(`${shots[current].name}  /  ${time.toFixed(2)} s`, x + 15, y + 23);
        page.drawImage(frame, x, y + bar);
      }
      const file = await new Promise(resolve => sheet.toBlob(resolve, 'image/png'));
      if (!file) throw new Error('Empty storyboard');
      if (version !== exportVersion) return;
      storyboard.src = showFile(storyboardLink, file, `greenhouse-${current}-${format}-route-storyboard.png`, '下载路线分镜 PNG ↓');
      find('#camera-storyboard-caption').textContent = '路线分镜按 0 秒、1.33 秒、2.67 秒、4 秒排列。';
      storyboardResult.hidden = false;
      status.textContent = '路线分镜已生成。';
    } catch {
      if (version === exportVersion) status.textContent = '分镜生成失败，请重试。';
    } finally {
      videoButton.disabled = storyboardButton.disabled = false;
    }
  });

  resetDelivery();
  updateSelection();
  void loadMediaManifest();
}
