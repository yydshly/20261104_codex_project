import './style.css';
import { createRoom, MAX_SHIFT, REST_DISTANCE } from './room.js';
import { bindWeather } from './day-weather.js';

const viewport = document.querySelector('#viewport');
const stage = document.querySelector('.stage');
const video = document.querySelector('#camera-feed');
const cameraButton = document.querySelector('#camera');
const cameraLabel = document.querySelector('#camera-label');
const modeLabel = document.querySelector('#mode-label');
const stageHint = document.querySelector('#stage-hint');
const sceneButtons = [...document.querySelectorAll('button[data-scene]')];
const sceneEyebrow = document.querySelector('#scene-eyebrow');
const sceneTitle = document.querySelector('#scene-title');
const sceneIntro = document.querySelector('#scene-intro');
const brandName = document.querySelector('#brand-name');
const viewControls = document.querySelector('#view-controls');
const deskSettings = document.querySelector('#desk-settings');
const deskHome = document.querySelector('#desk-home');
const deskLighting = document.querySelector('#desk-lighting');
const stationReplay = document.querySelector('#station-replay');
const workshopInstall = document.querySelector('#workshop-install');
const workshopReset = document.querySelector('#workshop-reset');
const workshopFlip = document.querySelector('#workshop-flip');
let clockRepaired = false;
let workshopFront = false;
const weatherControls = document.querySelector('#weather-controls');
const modelControls = document.querySelector('#model-controls');
const modelOpen = document.querySelector('#model-open');
const modelFile = document.querySelector('#model-file');
const modelReset = document.querySelector('#model-reset');
const modelStatus = document.querySelector('#model-status');
const modelAngle = document.querySelector('#model-angle');
const modelAngleValue = document.querySelector('#model-angle-value');
const modelCredit = document.querySelector('#model-credit');
const status = document.querySelector('#status');
const statusDot = document.querySelector('#status-dot');
const recenter = document.querySelector('#recenter');
const sensitivity = document.querySelector('#sensitivity');
const gainValue = document.querySelector('#gain-value');
const offset = document.querySelector('#offset');
const meterDot = document.querySelector('#meter-dot');
const fullscreen = document.querySelector('#fullscreen');

const neutral = { x: 0, y: 0, z: REST_DISTANCE };
const eye = { ...neutral };
const target = { ...neutral };
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

let room;
let stream;
let detector;
let readFace;
let mode = 'preview';
let scene = 'desk';
let startId = 0;
let origin = null;
let latestFace = null;
let samples = [];
let lastSeen = 0;
let lastVideoTime = -1;
let lastDetection = -Infinity;
let lastFrame = performance.now();

function setStatus(message, state = 'idle') {
  if (status.textContent !== message) status.textContent = message;
  statusDot.dataset.state = state;
}

function setMode(next) {
  mode = next;
  cameraButton.disabled = mode === 'starting';
  cameraButton.setAttribute('aria-pressed', String(mode === 'camera'));
  cameraLabel.textContent = {
    preview: '开启摄像头', starting: '正在开启…', camera: '关闭摄像头',
  }[mode];
  modeLabel.textContent = mode === 'camera' ? '摄像头模式' : '鼠标预览';
  updateStageHint();
}

function isDeskScene(name) {
  return name === 'desk' || name === 'station' || name === 'workshop';
}

function updateStageHint() {
  if (scene === 'workshop') {
    if (workshopFront) {
      stageHint.textContent = clockRepaired ? '钟面上的指针重新走起来了。' : '钟停住了，绕到背面看看机芯。';
    } else {
      stageHint.textContent = clockRepaired
        ? '机芯已经运转，绕到正面看看指针。'
        : '抓住下方的铜齿轮，沿槽向上推回轴心。';
    }
    return;
  }
  if (scene === 'station') {
    stageHint.textContent = mode === 'camera'
      ? '侧身看月台，旅客碰面后会走向出口。'
      : '先看远处的车灯，再看旅客下车、碰面和离开。';
    return;
  }
  if (scene === 'desk') {
    stageHint.textContent = mode === 'camera'
      ? '移动头部看视差，拖动画面或用方向键环顾桌面。'
      : '移动鼠标看视差，拖动画面或用方向键环顾桌面。';
    return;
  }
  const action = mode === 'camera' ? '慢慢左右挪动头部' : '左右移动鼠标';
  const subject = {
    reference: '留意贴在黑边上的蝴蝶结和房间两侧',
    visitor: '留意搭在窗沿上的手和递出来的木牌',
    rain: '看看玻璃上的雨和桌灯下的墨水屏',
    window: '看看桌面、墨水屏和窗景之间的距离',
    daily: '从两边看进木叶村的走廊',
    studio: '看看人物和窗框之间的空间',
    'moon-post': '观察月兔的耳朵、窗框和后方的邮局',
    prototype: '观察窗框前的机器人',
  }[scene];
  stageHint.textContent = `${action}，${subject}。`;
}

function stopCamera(message, state) {
  startId += 1;
  stream?.getTracks().forEach(track => track.stop());
  stream = undefined;
  video.srcObject = null;
  latestFace = null;
  origin = null;
  samples = [];
  recenter.disabled = true;
  Object.assign(target, neutral);
  setMode('preview');
  setStatus(message, state);
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus('浏览器无法访问摄像头，请用 Chrome 或 Edge 打开本地地址。', 'error');
    return;
  }

  const attempt = ++startId;
  setMode('starting');
  setStatus('等待摄像头授权…', 'pending');
  let nextStream;
  try {
    nextStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 }, facingMode: 'user' },
      audio: false,
    });
  } catch (error) {
    if (attempt !== startId) return;
    const message = {
      NotAllowedError: '摄像头权限未开启，请在浏览器地址栏或 Windows 隐私设置中允许访问。',
      NotFoundError: '未找到摄像头。连接摄像头后可以重试。',
      NotReadableError: '无法读取摄像头。检查设备是否被其他应用占用。',
    }[error.name] ?? '摄像头无法启动，请检查连接后重试。';
    stopCamera(message, 'error');
    return;
  }

  if (attempt !== startId) {
    nextStream.getTracks().forEach(track => track.stop());
    return;
  }

  stream = nextStream;
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    if (attempt === startId) stopCamera('摄像头已断开。可以继续用鼠标预览。', 'error');
  }, { once: true });
  video.srcObject = stream;
  setStatus('正在加载本地追踪模型…', 'pending');

  try {
    await video.play();
    if (!detector) {
      const tracker = await import('./tracker.js');
      const instance = await tracker.createDetector();
      if (attempt !== startId) {
        instance.close();
        return;
      }
      detector = instance;
      readFace = tracker.readFace;
    }
  } catch (error) {
    if (attempt !== startId) return;
    console.error(error);
    stopCamera('追踪模型未能启动。你可以重试或继续用鼠标预览。', 'error');
    return;
  }

  if (attempt !== startId) return;
  lastSeen = performance.now();
  lastVideoTime = -1;
  lastDetection = -Infinity;
  Object.assign(target, neutral);
  setMode('camera');
  setStatus('请正对屏幕，正在寻找人脸…', 'pending');
}

function updateTracking(time) {
  if (video.readyState >= 2 && time - lastDetection >= 40 && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    lastDetection = time;
    const face = readFace(detector, video, time);
    if (face) {
      lastSeen = time;
      latestFace = face;
      if (!origin) {
        samples.push(face);
        if (samples.length < 5) {
          setStatus('正在校准，请保持正对屏幕…', 'pending');
          return;
        }
        origin = {
          x: samples.reduce((sum, point) => sum + point.x, 0) / samples.length,
          y: samples.reduce((sum, point) => sum + point.y, 0) / samples.length,
          size: samples.reduce((sum, point) => sum + point.size, 0) / samples.length,
        };
        samples = [];
      }

      recenter.disabled = false;
      setStatus('正在追踪 · 左右移动试试', 'live');
      const gain = Number(sensitivity.value);
      const distance = REST_DISTANCE * clamp(origin.size / face.size, 0.72, 1.38);
      // A front-facing camera sees the viewer's right on the image's left.
      const horizontal = (origin.x - 0.5) * REST_DISTANCE - (face.x - 0.5) * distance;
      const vertical = (origin.y - 0.5) * REST_DISTANCE - (face.y - 0.5) * distance;
      target.x = clamp(horizontal * gain * 1.18, -MAX_SHIFT, MAX_SHIFT);
      target.y = clamp(vertical * gain * video.videoHeight / video.videoWidth, -0.24, 0.24);
      target.z = distance;
      return;
    }
  }

  if (time - lastSeen > 650) {
    latestFace = null;
    samples = [];
    recenter.disabled = true;
    Object.assign(target, neutral);
    setStatus(origin ? '暂未看到人脸，请回到摄像头前。' : '请正对屏幕，正在寻找人脸…', 'pending');
  }
}

function animate(time) {
  if (mode === 'camera') {
    try {
      updateTracking(time);
    } catch (error) {
      console.error(error);
      stopCamera('追踪中断，可以重试或继续用鼠标预览。', 'error');
    }
  }

  const alpha = 1 - Math.exp(-Math.min(time - lastFrame, 100) / 76);
  lastFrame = time;
  eye.x += (target.x - eye.x) * alpha;
  eye.y += (target.y - eye.y) * alpha;
  eye.z += (target.z - eye.z) * alpha;
  const percent = Math.round(eye.x / MAX_SHIFT * 100);
  const label = `${percent > 0 ? '+' : ''}${percent}%`;
  if (offset.value !== label) {
    offset.value = label;
    meterDot.style.left = `${(percent + 100) / 2}%`;
  }
  room.draw(eye, time);
  requestAnimationFrame(animate);
}

function bindModelControls() {
  let sampleReady = false;
  let importing = false;
  let hasCustomModel = false;

  function report(text, error = false) {
    modelStatus.textContent = text;
    modelStatus.dataset.error = String(error);
  }

  function setAngle(angle) {
    modelAngle.value = angle;
    modelAngleValue.value = `${angle}°`;
    room.setModelAngle(angle);
  }

  modelAngle.addEventListener('input', () => setAngle(Number(modelAngle.value)));
  for (const preset of document.querySelectorAll('[data-angle]')) {
    preset.addEventListener('click', () => setAngle(Number(preset.dataset.angle)));
  }

  modelOpen.addEventListener('click', () => modelFile.click());
  modelFile.addEventListener('change', async () => {
    const file = modelFile.files[0];
    modelFile.value = '';
    if (!file || importing) return;

    importing = true;
    modelOpen.disabled = modelReset.disabled = true;
    report('正在载入模型…');
    try {
      await room.importModel(file);
      hasCustomModel = true;
      modelReset.hidden = !sampleReady;
      modelCredit.hidden = true;
      setAngle(0);
      report(file.name);
    } catch (error) {
      report(error.message, true);
    } finally {
      importing = false;
      modelOpen.disabled = modelReset.disabled = false;
    }
  });

  modelReset.addEventListener('click', () => {
    room.resetModel();
    hasCustomModel = false;
    modelReset.hidden = true;
    modelCredit.hidden = false;
    setAngle(0);
    report('示例模型 · 宇航员');
  });

  room.loadSample().then(() => {
    sampleReady = true;
    modelReset.hidden = !hasCustomModel;
    if (!importing && !hasCustomModel && modelStatus.dataset.error !== 'true') report('示例模型 · 宇航员');
  }).catch(() => {
    if (!importing && !hasCustomModel) report('示例未能载入。你可以导入自己的 GLB。', true);
  });
}

function bindControls() {
  setMode('preview');
  bindWeather(data => room.setWeather(data));
  let modelControlsBound = false;
  let settingsOpen = false;
  let drag = null;
  let yaw = 0;
  let pitch = 0;

  function lookAround(nextYaw, nextPitch) {
    yaw = clamp(nextYaw, -30, 30);
    pitch = clamp(nextPitch, -28, 32);
    room.setDeskLook(yaw * Math.PI / 180, pitch * Math.PI / 180);
    deskHome.disabled = yaw === 0 && pitch === 0;
  }

  function returnToView() {
    lookAround(0, 0);
    if (mode === 'preview') Object.assign(target, neutral);
  }

  deskHome.addEventListener('click', returnToView);
  stationReplay.addEventListener('click', () => room.replayStation());
  workshopInstall.addEventListener('click', () => room.repairClock());
  workshopReset.addEventListener('click', () => room.resetWorkshop());
  workshopFlip.addEventListener('click', () => {
    workshopFront = room.flipWorkshop();
    workshopFlip.textContent = workshopFront ? '查看机芯' : '查看钟面';
    workshopInstall.hidden = workshopFront;
    returnToView();
    updateStageHint();
  });
  deskLighting.addEventListener('change', () => room.setDeskLighting(deskLighting.value));
  deskSettings.addEventListener('click', () => {
    settingsOpen = !settingsOpen;
    viewControls.hidden = !settingsOpen;
    deskSettings.setAttribute('aria-expanded', String(settingsOpen));
    if (settingsOpen && document.fullscreenElement !== stage) {
      viewControls.scrollIntoView({ block: 'nearest' });
    }
  });
  const sceneCopy = {
    desk: ['A ROOM WITHIN', '桌上平板', '桌上摆着一台平板，屏幕里还有一间房。'],
    station: ['WUGANG STATION', '双屏小车站', '雾港的列车正从远处驶来。'],
    workshop: ['CLOCK ATELIER', '微缩修复工坊', '一座停摆的机械钟等你修好。'],
    reference: ['THE CLOCK KEEPER', '举钟来客', '亮房间里，有人举着一块翻页钟。'],
    visitor: ['THE VISITOR', '桌沿来客', '有人扶着窗沿，把今天的时间递到你面前。'],
    rain: ['RAIN AT THE WINDOW', '雨夜留灯', '一盏暖灯和一台安静工作的墨水屏。'],
    window: ['WINDOW DESK', '窗边桌面', '窗边的墨水屏显示时间、月历和室外天气。'],
    daily: ['KONOHA MORNING DESK', '木叶晨间桌', '佐助翻月历，鸣人报时间，出门前再看一眼天气。'],
    studio: ['FIGURE STUDIO', '人物展台', '把 3D 人物摆上展台，从正面、侧面和背面看造型细节。'],
    'moon-post': ['LUNAR POST', '月面邮局', '观察月兔如何跨过窗框，以及邮局里不同距离的物件。'],
    prototype: ['RELAY OBSERVATORY', '观测舱原型', '从两侧看进观测舱，留意探出窗框的巡检机器人。'],
  };
  for (const button of sceneButtons) {
    button.addEventListener('click', () => {
      scene = button.dataset.scene;
      room.setScene(scene);
      const viewOnly = isDeskScene(scene) || scene === 'reference';
      const immersive = viewOnly || ['visitor', 'rain', 'window'].includes(scene);
      document.body.dataset.scene = scene;
      document.body.classList.toggle('immersive-desk', immersive);
      deskHome.hidden = !isDeskScene(scene);
      deskHome.textContent = scene === 'workshop' ? '回到工台' : '回到平板';
      deskHome.title = deskHome.textContent + '（Home）';
      deskLighting.hidden = scene !== 'desk';
      stationReplay.hidden = scene !== 'station';
      workshopFlip.hidden = workshopReset.hidden = scene !== 'workshop';
      workshopInstall.hidden = scene !== 'workshop' || workshopFront;
      viewport.tabIndex = isDeskScene(scene) ? 0 : -1;
      if (isDeskScene(scene)) returnToView();
      deskSettings.hidden = !immersive;
      deskSettings.textContent = viewOnly ? '视角设置' : '天气与视角';
      viewControls.hidden = immersive && !settingsOpen;
      weatherControls.hidden = viewOnly || (!immersive && scene !== 'daily');
      modelControls.hidden = scene !== 'studio';
      if (scene === 'studio' && !modelControlsBound) {
        bindModelControls();
        modelControlsBound = true;
      }
      [sceneEyebrow.textContent, sceneTitle.textContent, sceneIntro.textContent] = sceneCopy[scene];
      brandName.textContent = immersive ? sceneCopy[scene][1] : '视差窗口';
      for (const option of sceneButtons) option.setAttribute('aria-pressed', String(option === button));
      updateStageHint();
    });
  }
  cameraButton.addEventListener('click', () => {
    if (mode === 'camera') stopCamera('摄像头已关闭。');
    else if (mode === 'preview') void startCamera();
  });
  recenter.addEventListener('click', () => {
    if (!latestFace) return;
    origin = latestFace;
    Object.assign(target, neutral);
  });
  sensitivity.addEventListener('input', () => { gainValue.value = sensitivity.value + '×'; });
  function viewportPoint(event) {
    const rect = viewport.getBoundingClientRect();
    return [(event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2];
  }
  viewport.addEventListener('pointerdown', event => {
    if (!isDeskScene(scene) || event.button !== 0 || drag) return;
    viewport.focus({ preventScroll: true });
    viewport.setPointerCapture(event.pointerId);
    const gear = scene === 'workshop' && room.grabRepair(...viewportPoint(event));
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch, gear };
    viewport.classList.add('looking-around');
  });
  viewport.addEventListener('pointermove', event => {
    if (drag?.id === event.pointerId) {
      if (drag.gear) {
        room.dragRepair(...viewportPoint(event));
        return;
      }
      lookAround(drag.yaw + (event.clientX - drag.x) / viewport.clientWidth * 104,
        drag.pitch + (event.clientY - drag.y) / viewport.clientHeight * 88);
      return;
    }
    if (mode !== 'preview') return;
    const rect = viewport.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    target.x = clamp((x - 0.5) * 2, -1, 1) * MAX_SHIFT;
    target.y = clamp((0.5 - y) * 2, -1, 1) * 0.24;
  });
  viewport.addEventListener('pointerleave', () => {
    if (mode === 'preview' && !drag) Object.assign(target, neutral);
  });
  viewport.addEventListener('pointerup', event => {
    if (drag?.id === event.pointerId && drag.gear) room.releaseRepair(false);
  });
  viewport.addEventListener('lostpointercapture', event => {
    if (drag?.id !== event.pointerId) return;
    if (drag.gear) room.releaseRepair(true);
    drag = null;
    viewport.classList.remove('looking-around');
    if (mode === 'preview') Object.assign(target, neutral);
  });
  viewport.addEventListener('keydown', event => {
    if (!isDeskScene(scene)) return;
    const step = {
      ArrowLeft: [7, 0], ArrowRight: [-7, 0],
      ArrowUp: [0, 6], ArrowDown: [0, -6],
    }[event.key];
    if (step) {
      event.preventDefault();
      lookAround(yaw + step[0], pitch + step[1]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      returnToView();
    }
  });
  fullscreen.disabled = !document.fullscreenEnabled;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === stage) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch (error) {
      console.warn(error);
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement === stage ? '退出全屏' : '全屏显示';
    fullscreen.setAttribute('aria-label', label);
    fullscreen.title = label;
  });
  window.addEventListener('pagehide', () => {
    if (mode !== 'preview') stopCamera('摄像头已关闭。');
  });
}

try {
  room = createRoom(viewport, repaired => {
    clockRepaired = repaired;
    workshopInstall.disabled = repaired;
    if (scene === 'workshop') updateStageHint();
  });
  bindControls();
  const requestedScene = new URLSearchParams(location.search).get('scene')
    ?? (import.meta.env.VITE_PUBLIC_BUILD === 'true' ? 'workshop' : null);
  sceneButtons.find(button => button.dataset.scene === requestedScene)?.click();
  requestAnimationFrame(animate);
} catch (error) {
  console.error(error);
  document.querySelector('#render-error').hidden = false;
  cameraButton.disabled = true;
  fullscreen.disabled = true;
  setStatus('3D 画面无法启动。', 'error');
}
