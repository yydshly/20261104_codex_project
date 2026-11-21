import { createScene } from './scene.js';
import { createTimeline } from './timeline.js';
import { renderToolGuide } from './tool-guide.js';

const renderMode = new URLSearchParams(location.search).has('render');
document.body.classList.toggle('render-mode', renderMode);

const byId = (id) => document.getElementById(id);
if (!renderMode) renderToolGuide(byId('tool-groups'));

const timecode = (seconds) => {
  const whole = Math.floor(seconds);
  return String(Math.floor(whole / 60)).padStart(2, '0') + ':' + String(whole % 60).padStart(2, '0');
};

async function boot() {
  const response = await fetch(new URL('../tour.json', import.meta.url));
  if (!response.ok) throw new Error('无法读取楼层配置。');
  const tour = await response.json();
  const timeline = createTimeline(tour);
  const canvas = byId('scene');
  const stage = canvas.closest('.stage');
  const scrubber = byId('scrubber');
  const play = byId('play');
  const floorLink = byId('floor-link');
  const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
  const canOpenAtlas = !localHosts.has(new URL(tour.atlasOrigin).hostname) || localHosts.has(location.hostname);
  byId('floor-local-note').hidden = canOpenAtlas;
  const root = document.documentElement;

  document.title = tour.title;
  const tourTitle = byId('tour-title');
  if (tourTitle) tourTitle.textContent = tour.title;
  const question = byId('tour-question');
  if (question) question.textContent = tour.question;
  const intro = byId('tour-intro');
  if (intro) intro.textContent = tour.intro;
  scrubber.max = timeline.duration;
  scrubber.step = '0.01';

  const floorButtons = tour.floors.map((floor, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'floor-button';
    button.style.setProperty('--floor-color', floor.color);
    const row = [
      ['floor-number', String(index + 1).padStart(2, '0')],
      ['floor-name', floor.title],
      ['floor-caption', floor.sign],
    ];
    for (const [className, content] of row) {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = content;
      button.append(span);
    }
    button.addEventListener('click', () => jump(index));
    byId('floor-list').append(button);
    return button;
  });

  let scene;
  try {
    scene = createScene(canvas, tour.floors);
  } catch (error) {
    root.dataset.sceneError = error.message;
    const message = byId('error');
    message.hidden = false;
    message.textContent = '3D 预览需要浏览器支持 WebGL。你仍然可以浏览各层能力和打开原页面。';
    if (renderMode) throw error;
  }

  let current = 0;
  let state = timeline.at(0);
  let activeFloor = -1;
  let activePhase;
  let playing = false;
  let requestId = 0;
  let startedAt = 0;
  let startedFrom = 0;

  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (width > 0 && height > 0) {
      scene?.resize(Math.round(width), Math.round(height));
      scene?.draw(state);
    }
  }

  function draw(seconds) {
    state = timeline.at(seconds);
    current = state.time;
    scene?.draw(state);
    const { floorIndex, phase } = state;
    if (floorIndex !== activeFloor || phase !== activePhase) {
      const floor = tour.floors[floorIndex];
      const finale = phase === 'finale';
      const floorLabel = String(floorIndex + 1).padStart(2, '0');
      stage.style.setProperty('--station-color', floor.color);
      stage.dataset.phase = phase;
      byId('hud-floor').textContent = finale ? '全程' : floorLabel + ' / ' + String(tour.floors.length).padStart(2, '0');
      const kicker = byId('hud-kicker');
      if (kicker) kicker.textContent = finale ? 'TOUR COMPLETE' : floor.sign;
      byId('hud-title').textContent = finale ? tour.finale.title : floorIndex === 0 ? tour.question : floor.title;
      byId('hud-copy').textContent = finale ? tour.finale.description : floor.description;
      byId('hud-state').textContent = finale ? '全景' : phase === 'travel' ? '上行中' : '已停靠';
      byId('floor-title').textContent = floor.title;
      byId('floor-description').textContent = floor.description;
      byId('floor-action').textContent = floor.action;
      if (canOpenAtlas) floorLink.href = new URL(floor.route, tour.atlasOrigin);
      floorLink.hidden = !canOpenAtlas;
      floorButtons.forEach((button, index) => {
        const selected = index === floorIndex;
        button.classList.toggle('is-active', selected);
        if (selected) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      byId('previous').disabled = floorIndex === 0;
      byId('next').disabled = floorIndex === tour.floors.length - 1;
      activeFloor = floorIndex;
      activePhase = phase;
    }
    byId('hud-progress').style.width = (state.progress * 100) + '%';
    scrubber.value = current;
    byId('clock').textContent = timecode(current) + ' / ' + timecode(timeline.duration);
  }

  function stop() {
    cancelAnimationFrame(requestId);
    playing = false;
    play.setAttribute('aria-label', '播放导览');
    play.dataset.playing = 'false';
  }

  function tick(now) {
    draw(startedFrom + (now - startedAt) / 1000);
    if (current >= timeline.duration) stop();
    else requestId = requestAnimationFrame(tick);
  }

  function togglePlayback() {
    if (playing) {
      stop();
      return;
    }
    if (current >= timeline.duration) draw(0);
    startedFrom = current;
    startedAt = performance.now();
    playing = true;
    play.setAttribute('aria-label', '暂停导览');
    play.dataset.playing = 'true';
    requestId = requestAnimationFrame(tick);
  }

  function jump(index) {
    stop();
    draw(timeline.stops[index].start);
  }

  play.addEventListener('click', togglePlayback);
  scrubber.addEventListener('input', () => {
    stop();
    draw(Number(scrubber.value));
  });
  byId('previous').addEventListener('click', () => jump(Math.max(0, state.floorIndex - 1)));
  byId('next').addEventListener('click', () => jump(Math.min(tour.floors.length - 1, state.floorIndex + 1)));
  new ResizeObserver(resize).observe(stage);
  await document.fonts.ready;
  resize();
  draw(0);

  if (renderMode && scene) {
    window.renderFrame = (frame) => draw(frame / timeline.fps);
  } else if (!renderMode) {
    const movie = new URL('../media/cognition-elevator.mp4', import.meta.url);
    fetch(movie, { method: 'HEAD' }).then((result) => {
      if (result.ok) {
        const download = byId('download');
        download.href = movie;
        download.hidden = false;
      }
    }).catch(() => {});
  }
}

boot().catch((error) => {
  document.documentElement.dataset.sceneError = error.message;
  const message = byId('error');
  message.hidden = false;
  message.textContent = '加载失败。' + error.message;
  console.error(error);
});
