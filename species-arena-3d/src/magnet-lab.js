import './magnet-lab.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createMagnetHero } from './magnet-hero.js';
import { createObservation } from './rescue-observe.js';

const byId = id => document.getElementById(id);
const stage = byId('magnet-lab-viewport');
const play = byId('magnet-lab-play');
const slider = byId('magnet-lab-progress');
const timeLabel = byId('magnet-lab-time');
const blenderStatus = byId('magnet-lab-blender-status');
const variant = byId('magnet-lab-variant');
const reset = byId('magnet-lab-reset');
const rear = byId('magnet-lab-rear');
const hold = byId('magnet-lab-hold');
const zoomOut = byId('magnet-lab-zoom-out');
const zoomIn = byId('magnet-lab-zoom-in');
const steps = [...document.querySelectorAll('[data-magnet-time]')];
const sceneLinks = [...document.querySelectorAll('[data-magnet-route]')];
const controls = [play, slider, reset, rear, zoomOut, zoomIn, variant, ...steps];
const duration = Number(slider.max);
const peakTime = Number(slider.defaultValue);
const fullOpenAt = Number(hold.dataset.magnetTime);
const recoveryAt = 3.55;
const poseSettings = { time: 0.8, color: '#89f8e1', duration, power: 0 };
const phases = steps.map(button => ({ time: Number(button.dataset.magnetTime), button, name: button.textContent }));
const variants = {
  'blender-wing': { name: '磁翼重设计', note: '背部换成分节磁翼，展开后形成更宽的轮廓。' },
  blender: { name: '原型精修', note: '保留分节磁环，重新制作护甲倒角、接缝和材质。' },
};

function setBlenderStatus(state, label) {
  blenderStatus.dataset.state = state;
  blenderStatus.textContent = label;
}

function showWebGlError() {
  byId('magnet-lab-error').hidden = false;
  blenderStatus.hidden = true;
  for (const control of controls) control.disabled = true;
}

function makeLab() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.55));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.id = 'magnet-lab-canvas';
  canvas.setAttribute('aria-label', '共享镜头的磁极双模型三维画面');
  stage.prepend(canvas);

  const room = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(room, 0.07).texture;
  room.dispose();
  generator.dispose();

  const panes = [...stage.querySelectorAll('[data-magnet-side]')].map(pane => {
    const side = pane.dataset.magnetSide;
    const entry = { area: pane.querySelector('.lab-model-area'), side, poseId: 'magnet', model: null };
    if (side === 'procedural') entry.model = createMagnetHero();
    entry.observation = createObservation(environment, () => entry.model);
    return entry;
  });
  const blenderPane = panes.find(pane => pane.side === 'blender');
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 55);
  const orbit = new OrbitControls(camera, canvas);
  orbit.enablePan = false;
  orbit.minDistance = 2.45;
  orbit.maxDistance = 11;
  orbit.minPolarAngle = 0.22;
  orbit.maxPolarAngle = Math.PI * 0.49;
  orbit.zoomSpeed = 0.73;
  const coarse = window.matchMedia('(pointer: coarse)');
  if (coarse.matches) {
    canvas.style.touchAction = 'pan-y';
    byId('magnet-lab-hint').textContent = '横向拖动旋转 · 按钮缩放';
  }

  const offset = new THREE.Vector3();
  let elapsed = peakTime;
  let playing = false;
  let holding = true;
  let startTime = 0;
  let frame = null;
  let previousPhase;
  let failed = false;
  let width = 0;
  let height = 0;
  let blenderLoad = 0;
  const modelRequests = new Map();

  function updateControls() {
    slider.value = elapsed.toFixed(2);
    slider.setAttribute('aria-valuetext', `${elapsed.toFixed(2)} 秒`);
    timeLabel.value = `${elapsed.toFixed(2)} / ${duration.toFixed(2)} 秒`;
    byId('magnet-lab-play-icon').textContent = playing ? 'Ⅱ' : holding || elapsed >= duration ? '↺' : '▶';
    byId('magnet-lab-play-label').textContent = playing ? '暂停'
      : elapsed >= duration ? '重新演示' : holding || !elapsed ? '从头演示' : '继续演示';

    const phase = phases.findLast(entry => elapsed >= entry.time) ?? phases[0];
    if (phase === previousPhase) return;
    previousPhase = phase;
    byId('magnet-lab-phase').textContent = phase.name;
    for (const entry of phases) entry.button.setAttribute('aria-pressed', String(entry === phase));
  }

  function requestRender() {
    if (frame === null && !failed) frame = requestAnimationFrame(render);
  }

  function render(now) {
    frame = null;
    if (failed || !width || !height) return;
    if (playing) {
      elapsed = THREE.MathUtils.clamp((now - startTime) / 1000, 0, duration);
      if (elapsed >= duration) playing = false;
      updateControls();
    }

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, width, height);
    renderer.clear();
    renderer.setScissorTest(true);
    const bounds = canvas.getBoundingClientRect();
    poseSettings.time = 0.8 + elapsed;
    poseSettings.power = THREE.MathUtils.smoothstep(elapsed, 0.4, fullOpenAt)
      * (1 - THREE.MathUtils.smoothstep(elapsed, recoveryAt, 4.95));
    for (const { area, observation, model, poseId } of panes) {
      const rect = area.getBoundingClientRect();
      const paneWidth = Math.round(rect.width);
      const paneHeight = Math.round(rect.height);
      if (!paneWidth || !paneHeight) continue;
      const x = Math.round(rect.left - bounds.left);
      const y = Math.round(bounds.bottom - rect.bottom);
      camera.aspect = paneWidth / paneHeight;
      const vertical = Math.tan(THREE.MathUtils.degToRad(17));
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(vertical * Math.max(1, 1 / camera.aspect)));
      camera.updateProjectionMatrix();
      if (model) observation.pose(poseId, elapsed, poseSettings);
      renderer.setViewport(x, y, paneWidth, paneHeight);
      renderer.setScissor(x, y, paneWidth, paneHeight);
      renderer.render(observation.scene, camera);
    }
    renderer.setScissorTest(false);
    if (playing) requestRender();
  }

  function measure() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    requestRender();
  }

  function seek(seconds, freezeAtPeak = false) {
    playing = false;
    holding = freezeAtPeak;
    elapsed = THREE.MathUtils.clamp(seconds, 0, duration);
    updateControls();
    requestRender();
  }

  function zoom(factor) {
    offset.copy(camera.position).sub(orbit.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, orbit.minDistance, orbit.maxDistance));
    camera.position.copy(orbit.target).add(offset);
    orbit.update();
    requestRender();
  }

  function setCamera(x, y, z) {
    orbit.target.set(0, 1.02, 0);
    camera.position.set(x, y, z);
    orbit.update();
    requestRender();
  }

  function resetCamera() {
    setCamera(-2.68, 2.42, 4.7);
  }

  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  orbit.addEventListener('change', requestRender);
  play.addEventListener('click', () => {
    if (playing) {
      seek(elapsed);
      return;
    }
    if (holding || elapsed >= duration) elapsed = 0;
    holding = false;
    playing = true;
    startTime = performance.now() - elapsed * 1000;
    updateControls();
    requestRender();
  });
  slider.addEventListener('input', () => seek(slider.valueAsNumber));
  for (const { time, button } of phases) {
    button.addEventListener('click', () => {
      if (button === hold) seek(peakTime, true);
      else seek(time);
    });
  }
  reset.addEventListener('click', resetCamera);
  rear.addEventListener('click', () => setCamera(0, 2.38, -5.42));
  zoomOut.addEventListener('click', () => zoom(1.14));
  zoomIn.addEventListener('click', () => zoom(0.88));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing) seek(elapsed);
  });
  canvas.addEventListener('webglcontextlost', () => {
    failed = true;
    playing = false;
    if (frame !== null) cancelAnimationFrame(frame);
    resize.disconnect();
    orbit.dispose();
    showWebGlError();
  });

  measure();
  resetCamera();
  updateControls();
  for (const control of controls) control.disabled = false;

  function requestBlenderModel(appearance) {
    if (!modelRequests.has(appearance)) {
      const request = import('./magnet-blender.js')
        .then(({ createBlenderMagnetHero }) => createBlenderMagnetHero(appearance))
        .catch(error => {
          modelRequests.delete(appearance);
          throw error;
        });
      modelRequests.set(appearance, request);
    }
    return modelRequests.get(appearance);
  }

  async function loadBlender(appearance) {
    const attempt = ++blenderLoad;
    const { name, note } = variants[appearance];
    variant.value = appearance;
    blenderStatus.dataset.variant = appearance;
    byId('magnet-lab-variant-note').textContent = note;
    byId('lab-routes-title').textContent = `带「${name}」进场`;
    for (const link of sceneLinks) link.href = `./${link.dataset.magnetRoute}?hero=magnet&model=${appearance}`;
    if (blenderPane.model) blenderPane.model.object.visible = false;
    blenderPane.model = null;
    setBlenderStatus('loading', `正在载入${name}…`);
    requestRender();

    try {
      const model = await requestBlenderModel(appearance);
      if (failed || attempt !== blenderLoad) return;
      model.object.visible = true;
      blenderPane.model = model;
      blenderPane.poseId = `magnet-${appearance}`;
      setBlenderStatus('ready', `${name}已载入`);
      requestRender();
    } catch (error) {
      if (failed || attempt !== blenderLoad) return;
      console.warn('Blender 磁极加载失败', error);
      setBlenderStatus('error', `${name}载入失败，可切换另一款外观`);
    }
  }

  variant.addEventListener('change', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('model', variant.value);
    window.history.replaceState(null, '', url);
    loadBlender(variant.value);
  });
  const initialAppearance = new URLSearchParams(window.location.search).get('model') === 'blender' ? 'blender' : 'blender-wing';
  loadBlender(initialAppearance);
}

try {
  makeLab();
} catch (error) {
  console.warn('磁极对照无法启动', error);
  showWebGlError();
}
