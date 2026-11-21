import './style.css';
import './research.css';
import { initGuide } from './guide.js';

const viewport = document.getElementById('engine-viewport');
const stage = document.getElementById('engine-stage');
const note = document.getElementById('view-note');
const angleInput = document.getElementById('engine-angle');
const readout = document.getElementById('angle-readout');
const description = document.getElementById('stage-description');
const valveReadouts = document.getElementById('valve-readouts');
const intakeState = document.getElementById('intake-state');
const exhaustState = document.getElementById('exhaust-state');
const play = document.getElementById('hero-play');
const stagePlay = document.getElementById('stage-play');
const reset = document.getElementById('view-reset');
const strokes = [...document.querySelectorAll('[data-stroke]')];
const views = [...document.querySelectorAll('[data-view]')];
const controls = [play, stagePlay, reset, angleInput, ...strokes, ...views];
const descriptions = [
  '进气门打开，活塞下行，将新鲜气体引入气缸。',
  '进、排气门关闭，活塞上行，把混合气压向缸顶。',
  '压缩结束时点火，气体膨胀推动活塞下行，经连杆带动曲轴。',
  '排气门打开，活塞上行，将废气推出气缸。',
];

let engine;
let angle = 90;
let stroke = 0;
let playing = false;
let request = 0;
let lastTime = 0;
let inView = true;
let stopGuide = () => {};

controls.forEach(control => { control.disabled = true; });

function setDescription(text) {
  if (description.textContent !== text) description.textContent = text;
}

function setValveState(element, open) {
  if (element.dataset.open === String(open)) return;
  element.dataset.open = String(open);
  element.textContent = open ? '开' : '关';
}

function update(value, pose) {
  angle = value;
  const integer = Math.floor(angle);
  angleInput.value = integer;
  readout.value = String(integer).padStart(3, '0') + '°';
  const next = Math.floor((angle % 720) / 180);
  if (next !== stroke) {
    stroke = next;
    strokes.forEach((button, index) => button.setAttribute('aria-pressed', String(index === stroke)));
  }
  if (!pose) setDescription(descriptions[stroke]);
  valveReadouts.hidden = pose?.working === false;
  const valvesMoving = (angle % 180) > .5 && (angle % 180) < 179.5;
  setValveState(intakeState, valvesMoving && stroke === 0);
  setValveState(exhaustState, valvesMoving && stroke === 3);
  engine.setAngle(angle, pose);
}

function tick(now) {
  request = 0;
  if (!playing || !inView || document.hidden) return;
  const elapsed = lastTime ? Math.min(80, now - lastTime) : 0;
  lastTime = now;
  update((angle + elapsed * .09) % 720);
  request = requestAnimationFrame(tick);
}

function reconcileAnimation() {
  cancelAnimationFrame(request);
  request = 0;
  lastTime = 0;
  if (playing && inView && !document.hidden) request = requestAnimationFrame(tick);
}

function setPlaying(value) {
  if (playing === value) return;
  playing = value;
  play.innerHTML = playing
    ? '暂停四冲程 <span aria-hidden="true">Ⅱ</span>'
    : '播放四冲程 <span aria-hidden="true">▷</span>';
  stagePlay.textContent = playing ? 'Ⅱ' : '▷';
  const action = playing ? '暂停四冲程' : '播放四冲程';
  stagePlay.setAttribute('aria-label', action);
  stagePlay.title = action;
  description.setAttribute('aria-live', playing ? 'off' : 'polite');
  reconcileAnimation();
}

function fallback() {
  setPlaying(false);
  stage.dataset.ready = 'false';
  viewport.replaceChildren();
  const link = document.createElement('a');
  link.className = 'stage-fallback';
  link.href = './engine-2d.html';
  link.textContent = '打开二维四冲程示意 ↗';
  viewport.append(link);
  controls.forEach(control => { control.disabled = true; });
  note.textContent = '当前设备的 3D 视图不可用';
}

async function start() {
  try {
    const { createEngine } = await import('./engine.js');
    engine = createEngine(viewport, {
      head: stage.querySelector('.part-head'),
      piston: stage.querySelector('.part-piston'),
      rod: stage.querySelector('.part-rod'),
      crank: stage.querySelector('.part-crank'),
    });
  } catch (error) {
    console.warn('3D engine view unavailable', error);
    fallback();
    return;
  }
  viewport.querySelector('canvas').addEventListener('webglcontextlost', fallback, { once: true });
  engine.setSection(true);
  update(angle);
  stage.dataset.ready = 'true';
  note.textContent = '拖动旋转 · 滚轮缩放';
  controls.forEach(control => { control.disabled = false; });

  function togglePlayback() {
    stopGuide();
    if (!playing && angle === 720) update(0);
    setPlaying(!playing);
  }
  play.addEventListener('click', () => {
    togglePlayback();
    const rect = stage.getBoundingClientRect();
    if (playing && (rect.top < 0 || rect.bottom > innerHeight)) {
      stage.scrollIntoView({ block: 'center' });
    }
  });
  stagePlay.addEventListener('click', togglePlayback);
  reset.addEventListener('click', engine.resetView);
  angleInput.addEventListener('input', () => {
    stopGuide();
    setPlaying(false);
    update(Number(angleInput.value));
  });
  for (const button of strokes) {
    button.addEventListener('click', () => {
      stopGuide();
      setPlaying(false);
      const next = Number(button.dataset.stroke);
      update(next * 180 + (next === 2 ? 10 : 90));
    });
  }
  for (const button of views) {
    button.addEventListener('click', () => {
      stopGuide();
      const section = button.dataset.view === 'section';
      engine.setSection(section);
      engine.resetView();
      update(angle);
      views.forEach(view => view.setAttribute('aria-pressed', String(view === button)));
    });
  }
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    reconcileAnimation();
  }).observe(stage);
  document.addEventListener('visibilitychange', reconcileAnimation);

  try {
    stopGuide = await initGuide({
      stage,
      begin() {
        setPlaying(false);
        document.querySelectorAll('video').forEach(video => video.pause());
        engine.setSection(true);
        engine.resetView();
        views.forEach(view => view.setAttribute('aria-pressed', String(view.dataset.view === 'section')));
      },
      show(index, progress) {
        if (index <= 1) {
          update(0, { assemblyAt: index === 1 ? progress : null, working: false });
          setDescription(index === 0 ? '整体剖面 · 看清活塞、连杆和曲轴的位置。'
            : progress < .31 ? '装配 · 曲轴与飞轮入座。'
            : progress < .50 ? '装配 · 活塞销穿过活塞与连杆小端。'
            : progress < .74 ? '装配 · 活塞与连杆从气缸上方入位。'
            : '装配 · 接合偏心销，合上缸盖。');
        } else {
          update(index < 6 ? (index - 2 + progress) * 180 : progress * 720);
        }
      },
    });
  } catch (error) {
    console.warn(error);
  }
}

start();
document.addEventListener('play', event => {
  if (event.target instanceof HTMLVideoElement) stopGuide();
}, true);
