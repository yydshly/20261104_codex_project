const images = new Map();
function loadImage(name) {
  if (!images.has(name)) images.set(name, new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`场景图片未能加载：${name}`));
    image.src = `https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/art/${name}.png`;
  }));
  return images.get(name);
}
const names = { pond: '林间池塘', focus: '雨窗书桌', memory: '生活花园', explore: '山顶观星站', together: '双人小屋', learn: '微型生态瓶' };

export function createScene(canvas, { onInteraction = () => {}, onAudioState = () => {} } = {}) {
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { mode: 'pond', phase: 'dusk', motion: !reduce.matches, details: true, volume: .28, sound: false };
  const local = { fireflies: true, night: 0, time: 0, effectTime: 0, duckX: .43, duckTarget: .43, duckDirection: 1, emphasis: 0 };
  let plate, nightPlate, duck, raf = 0, last = 0, disposed = false, request = 0, audioRequest = 0, visible = true, audio = null, soundTimer = 0;
  let view = { width: 1, height: 1, scale: 1, x: 0, y: 0 };
  let ripples = [];
  const rand = n => (Math.sin(n * 117.3 + 42) * 43758.5453) % 1;
  const moving = () => state.motion && !reduce.matches;

  function ellipse(x, y, rx, ry, fill) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  }
  function paint(image, alpha = 1) {
    if (!image || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(image, 0, 0, 1536, 1024);
    if (state.mode === 'pond' && moving()) {
      ctx.save(); ctx.beginPath();
      ctx.moveTo(320, 565); ctx.bezierCurveTo(520, 530, 800, 554, 1030, 590);
      ctx.bezierCurveTo(1210, 617, 1300, 663, 1302, 760);
      ctx.bezierCurveTo(1160, 804, 1050, 871, 830, 912);
      ctx.bezierCurveTo(610, 912, 430, 865, 351, 800);
      ctx.bezierCurveTo(300, 716, 245, 640, 320, 565); ctx.clip();
      for (let y = 541; y < 916; y += 3) {
        const wave = Math.sin(y * .085 + local.time * .8) * 1.3 + Math.sin(y * .026 - local.time * .45) * 1.8;
        ctx.drawImage(image, 230, y, 1100, 3, 230 + wave, y, 1100, 3);
      }
      ctx.restore();
    }
    ctx.restore();
  }
  function drawDuck() {
    if (!duck) return;
    const x = local.duckX * 1536, y = 715 + Math.sin(local.time * .6) * (moving() ? 1.4 : 0);
    const w = 133, h = w * duck.height / duck.width;
    ctx.save(); ctx.translate(x, y); ctx.scale(local.duckDirection, 1);
    ctx.save(); ctx.globalAlpha = .18; ctx.translate(0, h * .25); ctx.scale(1, -.48); ctx.filter = 'blur(2px)'; ctx.drawImage(duck, -w / 2, -h / 2, w, h); ctx.restore();
    if (local.night > .01) ctx.filter = `brightness(${1 - local.night * .30}) saturate(.85)`;
    ctx.drawImage(duck, -w / 2, -h / 2, w, h); ctx.restore();
    if (state.details) {
      ctx.save(); ctx.strokeStyle = `rgba(200,223,217,${.14 + .07 * Math.sin(local.time)})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(x - 6, y + h * .23, 58, 11, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }
  function drawAtmosphere() {
    if (!state.details) return;
    const t = local.time;
    if ((state.mode === 'pond' || state.mode === 'memory') && local.fireflies) {
      const count = state.mode === 'pond' ? 22 : 12;
      for (let i = 0; i < count; i++) {
        const x = 180 + Math.abs(rand(i)) * 1150 + Math.sin(t * .18 + i) * (moving() ? 18 : 0);
        const y = 400 + Math.abs(rand(i + 70)) * 360 + Math.cos(t * .25 + i) * (moving() ? 12 : 0);
        const a = (.18 + local.night * .5) * (.4 + .6 * Math.max(0, Math.sin(t * .7 + i * 2)));
        ctx.save(); ctx.globalAlpha = a; ctx.shadowBlur = 12; ctx.shadowColor = '#f7e5a2'; ellipse(x, y, 1.7, 1.7, '#ffe9a5'); ctx.restore();
      }
    }
    if (state.mode === 'focus' && moving()) {
      ctx.save(); ctx.beginPath(); ctx.rect(40, 10, 830, 630); ctx.clip();
      for (let i = 0; i < 34; i++) {
        const x = Math.abs(rand(i + 90)) * 820, y = (Math.abs(rand(i + 80)) * 900 + t * (14 + i % 5)) % 900 - 100;
        ctx.strokeStyle = 'rgba(213,235,237,.15)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 18); ctx.stroke();
      } ctx.restore();
    }
    if (local.emphasis > .01) {
      const centers = { focus: [.83, .43], memory: [.52, .76], explore: [.5, .22], together: [.58, .5], learn: [.5, .52] };
      const center = centers[state.mode];
      if (center) { const g = ctx.createRadialGradient(center[0] * 1536, center[1] * 1024, 0, center[0] * 1536, center[1] * 1024, 230); g.addColorStop(0, `rgba(250,221,157,${local.emphasis * .13})`); g.addColorStop(1, 'rgba(250,221,157,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1536, 1024); }
    }
  }
  function render() {
    if (disposed) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#10251f'; ctx.fillRect(0, 0, view.width, view.height);
    ctx.translate(view.x, view.y); ctx.scale(view.scale, view.scale);
    if (!plate) return;
    paint(plate);
    if (state.mode === 'pond') { paint(nightPlate, local.night); drawDuck(); }
    drawAtmosphere();
    ripples.forEach(r => {
      const age = local.effectTime - r.time;
      const spread = moving() ? age : .8;
      const a = Math.max(0, 1 - age / 3.6);
      if (!a) return;
      ctx.strokeStyle = `rgba(218,233,223,${a * .45})`; ctx.lineWidth = 1.3;
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(r.x, r.y, 15 + spread * 42 + k * 17, 4 + spread * 10 + k * 4, 0, 0, Math.PI * 2); ctx.stroke(); }
    });
  }
  function frame(now) {
    raf = 0;
    if (disposed || document.hidden || !visible) { last = 0; return; }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
    if (moving()) local.time += dt;
    local.effectTime += dt;
    const target = state.phase === 'night' ? 1 : 0;
    local.night += (target - local.night) * Math.min(1, dt * 2.2);
    local.duckX += (local.duckTarget - local.duckX) * Math.min(1, dt * .7);
    local.emphasis *= Math.exp(-dt * .6);
    ripples = ripples.filter(r => local.effectTime - r.time < 4);
    render();
    if (moving() || ripples.length || Math.abs(target - local.night) > .001 || Math.abs(local.duckTarget - local.duckX) > .0001 || local.emphasis > .005) raf = requestAnimationFrame(frame);
  }
  function wake() { render(); if (!raf && !document.hidden && visible && !disposed) { last = 0; raf = requestAnimationFrame(frame); } }
  function resize() {
    const box = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, box.width), height = Math.max(1, box.height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    const scale = Math.max(width / 1536, height / 1024);
    view = { width, height, scale, x: (width - 1536 * scale) / 2, y: (height - 1024 * scale) / 2 }; wake();
  }
  async function setMode(mode) {
    if (!names[mode]) mode = 'pond';
    const token = ++request; state.mode = mode; canvas.dataset.loading = 'true';
    canvas.setAttribute('aria-label', `${names[mode]}。完整场景画面，可点击或按回车产生回应。`);
    try {
      const next = await loadImage(mode === 'pond' ? 'pond-dusk' : mode);
      if (disposed || token !== request) return;
      plate = next; nightPlate = null; ripples = []; canvas.dataset.loading = 'false'; canvas.dataset.ready = mode;
      if (mode === 'pond') {
        [nightPlate, duck] = await Promise.all([loadImage('pond-night'), loadImage('duck')]);
        if (disposed || token !== request) return;
      }
      wake();
    } catch (error) { canvas.dataset.loading = 'false'; canvas.dataset.error = error.message; onInteraction({ title: '图片加载失败', detail: error.message }); }
  }
  function trigger(action = 'primary', point = null) {
    let title, detail;
    if (state.mode === 'pond') {
      if (action === 'lamp') {
        local.fireflies = !local.fireflies;
        title = local.fireflies ? '萤火亮起来了' : '让夜色安静下来'; detail = '几处微光在林岸之间，给环境留一点生命感。';
      } else {
        local.duckTarget = point ? Math.max(.32, Math.min(.70, point.x / 1536)) : (local.duckX < .52 ? .58 : .42);
        local.duckDirection = local.duckTarget >= local.duckX ? 1 : -1;
        if (!moving()) local.duckX = local.duckTarget;
        ripples.push({ x: point?.x || local.duckX * 1536, y: point?.y || 740, time: local.effectTime });
        ripples = ripples.slice(-8);
        title = '水面有了回应'; detail = '鸭子慢慢游来，涟漪向周围展开。';
      }
    } else {
      local.emphasis = 1;
      const messages = { focus: ['把注意力带回书桌', '窗外下着雨，书页和灯光为这一刻留下位置。'], memory: ['停在这条花园小径', '让熟悉的地方，容纳每天一点点生活。'], explore: ['向远处看一会儿', '山与星空拉开距离，留给好奇心一个入口。'], together: ['两盏灯，共处一室', '各自做自己的事，也能拥有同一个安静空间。'], learn: ['观察一个微小世界', '透过玻璃，看见叶片、凝露、土壤与水的层次。'] };
      [title, detail] = messages[state.mode];
    }
    onInteraction({ title, detail }); wake();
  }
  function click(event) {
    const box = canvas.getBoundingClientRect();
    const p = { x: (event.clientX - box.left - view.x) / view.scale, y: (event.clientY - box.top - view.y) / view.scale };
    const inWater = p.x > 440 && p.x < 1100 && p.y > 610 && p.y < 820;
    trigger(state.mode === 'pond' && p.x > 1100 && p.y < 550 ? 'lamp' : 'primary', inWater ? p : null);
  }
  function key(event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); trigger(); } }

  function mixAudio() {
    if (!audio) return;
    const night = state.phase === 'night';
    const targets = [state.volume * (night ? .42 : .65), state.volume * (night ? .74 : .22)];
    audio.forEach((a, i) => { a.volume += (targets[i] - a.volume) * .12; });
  }
  async function setSound(enabled) {
    const token = ++audioRequest;
    if (!enabled) { state.sound = false; clearInterval(soundTimer); audio?.forEach(a => a.pause()); onAudioState({ enabled: false }); return; }
    try {
      if (!audio) audio = ['https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/audio/water-stream-loop.wav', 'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/audio/pond-night-loop.wav'].map(src => { const a = new Audio(src); a.loop = true; a.preload = 'auto'; a.volume = 0; return a; });
      await Promise.all(audio.map(a => a.play()));
      if (disposed || token !== audioRequest) { audio.forEach(a => a.pause()); return; }
      state.sound = true; clearInterval(soundTimer); mixAudio(); soundTimer = setInterval(mixAudio, 80); onAudioState({ enabled: true });
    } catch (error) { state.sound = false; clearInterval(soundTimer); audio?.forEach(a => a.pause()); onAudioState({ enabled: false, error: error.message }); throw error; }
  }
  function setOptions(options) { Object.assign(state, options); state.volume = Math.max(0, Math.min(1, state.volume)); if (reduce.matches) local.night = state.phase === 'night' ? 1 : 0; mixAudio(); wake(); }
  function visibility() {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; audio?.forEach(a => a.pause()); }
    else { wake(); if (state.sound) setSound(true).catch(() => {}); }
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); else { cancelAnimationFrame(raf); raf = 0; } }); intersection.observe(canvas);
  canvas.addEventListener('click', click); canvas.addEventListener('keydown', key); document.addEventListener('visibilitychange', visibility);
  reduce.addEventListener('change', wake);
  setMode('pond'); resize();
  return { setMode, setOptions, setSound, trigger, getState: () => ({ ...state, fireflies: local.fireflies }), dispose() { disposed = true; request++; audioRequest++; cancelAnimationFrame(raf); clearInterval(soundTimer); audio?.forEach(a => { a.pause(); a.removeAttribute('src'); a.load(); }); observer.disconnect(); intersection.disconnect(); canvas.removeEventListener('click', click); canvas.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', visibility); reduce.removeEventListener('change', wake); } };
}
