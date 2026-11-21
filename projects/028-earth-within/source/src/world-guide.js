import { narration } from './world-narration.js';

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      resolve();
    }, ms);
    function cancel() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener('abort', cancel, { once: true });
  });
}

function createNarrator(audio) {
  const availability = fetch('/api/voice', { signal: AbortSignal.timeout(4000) })
    .then((response) => response.ok ? response.json() : null)
    .then((status) => status?.available === true ? 'ready' : status?.available === false ? 'unconfigured' : 'unavailable')
    .catch(() => 'unavailable');
  let audioContext;

  function unlock() {
    if (audio) {
      audio.unlock();
      audioContext = audio.context;
      return;
    }
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      audioContext ??= new Audio();
      audioContext.resume().catch(() => {});
    } catch {
      audioContext = undefined;
    }
  }

  async function playMiniMax(id, signal, setSource) {
    if (audioContext?.state !== 'running') return false;
    signal.throwIfAborted();
    const response = await fetch('/api/voice', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }), signal,
    });
    if (response.status === 503) return 'unconfigured';
    if (!response.ok) return false;
    const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
    signal.throwIfAborted();
    if (audioContext.state !== 'running') return false;
    await new Promise((resolve, reject) => {
      const player = audioContext.createBufferSource();
      player.buffer = buffer;
      player.connect(audioContext.destination);
      let settled = false;
      function finish() {
        if (settled) return;
        settled = true;
        audio?.setNarrating(false);
        player.disconnect();
      }
      function cancel() {
        player.onended = null;
        player.stop();
        finish();
        reject(signal.reason);
      }
      player.onended = () => {
        signal.removeEventListener('abort', cancel);
        finish();
        resolve();
      };
      signal.addEventListener('abort', cancel, { once: true });
      try {
        audio?.setNarrating(true);
        player.start();
      } catch (error) {
        signal.removeEventListener('abort', cancel);
        finish();
        reject(error);
        return;
      }
      const cached = ['disk', 'memory'].includes(response.headers.get('X-Voice-Cache'));
      setSource(cached ? 'MiniMax 语音 · 已缓存' : 'MiniMax 语音');
    });
    return true;
  }

  return {
    unlock,
    async play(id, signal, muted, setSource) {
      if (muted) {
        setSource('MiniMax 已静音 · 字幕导览');
      } else {
        let status = await availability;
        signal.throwIfAborted();
        try {
          if (status === 'ready') {
            setSource('正在加载 MiniMax 旁白');
            const played = await playMiniMax(id, signal, setSource);
            if (played === true) return;
            status = played === 'unconfigured' ? 'unconfigured' : 'unavailable';
          }
        } catch {
          signal.throwIfAborted();
          status = 'unavailable';
        }
        setSource(status === 'unconfigured' ? '未配置 MiniMax 语音 · 字幕导览' : 'MiniMax 暂不可用 · 字幕导览');
      }
      await wait(Math.max(6600, narration[id].length * 175), signal);
    },
  };
}

export function createGuide({ stops, navigate, onActive, audio }) {
  const narrator = createNarrator(audio);
  const panel = document.getElementById('guide-panel');
  const title = document.getElementById('guide-title');
  const step = document.getElementById('guide-step');
  const caption = document.getElementById('guide-caption');
  const source = document.getElementById('guide-source');
  const back = document.getElementById('guide-back');
  const pause = document.getElementById('guide-pause');
  const next = document.getElementById('guide-next');
  const mute = document.getElementById('guide-mute');
  const takeover = document.getElementById('guide-takeover');
  let active = false;
  let paused = false;
  let muted = false;
  let current = 0;
  let session;
  let control = 'auto';

  function updateControls() {
    const automatic = control === 'auto';
    back.disabled = !automatic || current === 0;
    pause.disabled = !automatic;
    next.disabled = !automatic;
    takeover.disabled = control === 'returning';
    takeover.textContent = automatic ? '接管小岚' : control === 'manual' ? '继续导览' : '正在返回';
    takeover.setAttribute('aria-pressed', String(!automatic));
  }

  function stop() {
    if (!active) return;
    session?.abort();
    active = false;
    paused = false;
    control = 'auto';
    panel.hidden = true;
    onActive(false);
  }

  async function visit(index) {
    session?.abort();
    const controller = new AbortController();
    session = controller;
    const { signal } = controller;
    const changed = current !== index;
    current = index;
    const { id, name } = stops[index];
    title.textContent = name;
    step.textContent = `${String(index + 1).padStart(2, '0')} / ${stops.length}`;
    next.textContent = index === stops.length - 1 ? '结束' : '下一站';
    updateControls();
    source.textContent = paused ? '已暂停' : '沿途行进';
    pause.textContent = paused ? '继续' : '暂停';
    if (paused) {
      if (changed) caption.textContent = '继续导览后，小岚会沿路线走到这个观察点。';
      return;
    }
    try {
      await navigate(id, signal, (text) => { caption.textContent = text; });
      signal.throwIfAborted();
      caption.textContent = narration[id];
      source.textContent = '正在准备 MiniMax 旁白';
      await wait(330, signal);
      await narrator.play(id, signal, muted, (label) => { source.textContent = label; });
      await wait(550, signal);
    } catch (error) {
      if (signal.aborted) return;
      console.warn('Guide narration failed', error);
      stop();
      return;
    }
    if (index + 1 < stops.length) visit(index + 1);
    else stop();
  }

  function start(id) {
    if (active) return;
    narrator.unlock();
    active = true;
    paused = false;
    panel.hidden = false;
    const index = Math.max(0, stops.findIndex((stop) => stop.id === id));
    onActive(true, id);
    visit(index);
  }

  back.addEventListener('click', () => { if (active && control === 'auto' && current > 0) visit(current - 1); });
  next.addEventListener('click', () => {
    if (!active || control !== 'auto') return;
    if (current < stops.length - 1) visit(current + 1);
    else stop();
  });
  pause.addEventListener('click', () => {
    if (!active || control !== 'auto') return;
    paused = !paused;
    if (!paused) narrator.unlock();
    visit(current);
  });
  mute.addEventListener('click', () => {
    muted = !muted;
    mute.textContent = muted ? '开启旁白' : '旁白静音';
    mute.setAttribute('aria-pressed', String(muted));
    if (!muted) narrator.unlock();
    if (active && control === 'auto' && !paused) visit(current);
  });

  return {
    start, stop,
    setControl(mode) {
      if (!active || mode === control) return;
      control = mode;
      session?.abort();
      updateControls();
      if (mode === 'auto') {
        paused = false;
        narrator.unlock();
        visit(current);
      } else if (mode === 'manual') {
        source.textContent = '手动探索';
        caption.textContent = '你正在控制小岚。点「继续导览」后，会沿你走过的路返回接管点。';
      } else {
        source.textContent = '沿原路返回';
        caption.textContent = '小岚正在返回接管时的位置，回到路线后继续导览。';
      }
    },
    goTo(id) {
      const index = stops.findIndex((stop) => stop.id === id);
      if (active && control === 'auto' && index >= 0) visit(index);
    },
    get active() { return active; },
  };
}
