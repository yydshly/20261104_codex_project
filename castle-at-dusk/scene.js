import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCastle } from './castle.js';
import { createEnvironment } from './environment.js';
import { createAtmosphere, moonDirection, sunDirection } from './atmosphere.js';
import { createWalkMode } from './walk.js';
import { createBoatMode } from './boat.js';

const views = {
  wide: { eye: [30, 14.5, 39.5], focus: [0, 4.0, 0], offset: .125 },
  gate: { eye: [11.8, 8.5, 24.5], focus: [0, 3.3, 6.7], offset: .135 },
  tower: { eye: [17.3, 20.6, 11.8], focus: [2.65, 11.7, -3.35], offset: .13 },
  lake: { eye: [-49, 28, -45], focus: [0, 1.6, 0], offset: .105 },
};

const walkStages = {
  farDock: ['01', '渔屋码头', '沿木栈桥走到小船旁，即可登船前往城堡。'],
  rowing: ['02', '湖面划行', '顺着航标划行，接近码头后可靠岸下船。'],
  shore: ['03', '城堡栈台', '前方是上山的石阶。登船返航请走到栈台靠水的一端。'],
  stairs: ['04', '山崖石阶', '沿灯火走向城门。'],
  bridge: ['05', '木吊桥', '过桥后，穿过升起的铁闸。'],
  gate: ['06', '城门门廊', '穿过门廊即可抵达庭院。'],
  courtyard: ['07', '城堡内庭', '沿中央石道，走向主楼敞开的拱门。'],
  hall: ['08', '主楼大厅', '走到王座前，右转穿过侧面的拱门。'],
  towerEntry: ['09', '塔楼入口', '穿过拱门，踏上旋转石阶。'],
  spiral: ['10', '螺旋楼梯', '按住前进沿石阶上行，后退可原路下楼。'],
  rooftop: ['11', '塔顶观景台', '沿垛口环顾城堡和湖面，沿楼梯原路返回。'],
  fisherHut: ['12', '湖岸渔屋', '沿木屋旁的石径前行，去看旧瞭望塔。'],
  shoreTrail: ['13', '松林岸径', '沿着湖岸石径，穿过木桥前往遗迹。'],
  shoreBridge: ['14', '林间木桥', '走过木桥，继续沿石径前行。'],
  watchtower: ['15', '旧瞭望塔遗迹', '穿过残存的石拱，再转身回望湖心城堡。'],
};

const lightPalettes = {
  dusk: { key: '#ffcd9d', ground: '#94858f', sky: '#e2d8f0', fog: '#a18795', rim: '#ffb97d' },
  night: { key: '#9fb9ff', ground: '#6a5577', sky: '#a2b5f0', fog: '#34476b', rim: '#a2c1ff' },
};
for (const palette of Object.values(lightPalettes)) {
  for (const key of Object.keys(palette)) palette[key] = new THREE.Color(palette[key]);
}

function createLighting(scene) {
  const fill = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.35);
  const key = new THREE.DirectionalLight(0xffffff, 2.22);
  key.position.set(-25, 29, 28);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -25, right: 25, top: 24, bottom: -24, near: 1, far: 86 });
  key.shadow.normalBias = .022;
  key.shadow.bias = -.00025;
  key.shadow.radius = 2;

  const rim = new THREE.DirectionalLight(0xffffff, 1.16);
  const bounce = new THREE.DirectionalLight('#98b8e5', .26);
  bounce.position.set(19, 5, 5);
  const lanterns = [-1.46, 1.46].map((x) => {
    const lantern = new THREE.PointLight('#ffac57', 4.8, 7.0, 2);
    lantern.position.set(x, 2.55, 8.05);
    return lantern;
  });
  scene.add(fill, key, rim, bounce, ...lanterns);

  const { dusk, night } = lightPalettes;
  return (amount, time) => {
    fill.color.copy(dusk.sky).lerp(night.sky, amount);
    fill.groundColor.copy(dusk.ground).lerp(night.ground, amount);
    fill.intensity = THREE.MathUtils.lerp(1.35, .79, amount);
    key.color.copy(dusk.key).lerp(night.key, amount);
    key.intensity = THREE.MathUtils.lerp(2.22, .66, amount);
    rim.color.copy(dusk.rim).lerp(night.rim, amount);
    rim.position.copy(sunDirection).lerp(moonDirection, amount).multiplyScalar(42);
    rim.intensity = THREE.MathUtils.lerp(1.16, 1.01, amount);
    scene.fog.color.copy(dusk.fog).lerp(night.fog, amount);
    lanterns.forEach((lantern, index) => {
      lantern.intensity = 5.1 + 2.9 * amount + Math.sin(time * 7.3 + index * 2) * .28;
    });
  };
}

function createBirds(scene) {
  const silhouette = new THREE.MeshBasicMaterial({ color: '#392c42', side: THREE.DoubleSide, fog: false });
  const wing = new THREE.BufferGeometry();
  wing.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, .08, .30, .027, -.1, .72, .075, -.23, .27, 0, -.19,
  ], 3));
  wing.setIndex([0, 1, 3, 1, 2, 3]);
  const birds = Array.from({ length: 5 }, (_, index) => {
    const bird = new THREE.Group();
    const right = new THREE.Mesh(wing, silhouette);
    const left = new THREE.Mesh(wing, silhouette);
    left.scale.x = -1;
    bird.add(left, right);
    bird.scale.setScalar(.52 + index % 3 * .085);
    scene.add(bird);
    return { bird, left, right, offset: index * .43 };
  });
  return (time) => {
    for (const { bird, left, right, offset } of birds) {
      const angle = -.90 + time * .075 + offset * .15;
      bird.position.set(-2 + Math.sin(angle) * (21 + offset), 12.1 + offset * 2.0 + Math.sin(angle * 2) * .8, -7 + Math.cos(angle) * (10 + offset));
      bird.rotation.y = Math.atan2(Math.cos(angle) * 21, -Math.sin(angle) * 10);
      bird.rotation.z = Math.cos(angle) * .17;
      const flap = Math.sin(time * 6.2 + offset * 2.1) * .62;
      right.rotation.z = flap;
      left.rotation.z = -flap;
    }
  };
}

function startExperience() {
  const experience = document.getElementById('experience');
  const holder = document.getElementById('scene');
  const status = document.getElementById('status');
  const statusText = status.querySelector('span');
  const viewButtons = [...document.querySelectorAll('[data-view]')];
  const lightButton = document.getElementById('light');
  const orbitButton = document.getElementById('orbit');
  const fullscreenButton = document.getElementById('fullscreen');
  const walkButton = document.getElementById('walk-toggle');
  const walkReset = document.getElementById('walk-reset');
  const walkLocation = document.getElementById('walk-location');
  const walkChapter = document.getElementById('walk-chapter');
  const walkStage = document.getElementById('walk-stage');
  const walkDirection = document.getElementById('walk-direction');
  const boatAction = document.getElementById('boat-action');
  const boatActionText = boatAction.querySelector('span');
  const boatCourse = document.getElementById('boat-course');
  const boatBearing = document.getElementById('boat-bearing');
  const boatDestination = document.getElementById('boat-destination');
  const boatDistance = document.getElementById('boat-distance');
  const moveHelp = document.getElementById('move-help');
  const touchMoveHelp = document.getElementById('touch-move-help');
  const padButtons = [...document.querySelectorAll('[data-walk-key]')];
  const walkOverlay = [walkReset, walkLocation, ...document.querySelectorAll('#walk-pad, #walk-reticle, #walk-help')];
  const overviewOverlay = [...document.querySelectorAll('.intro, .camera, .hints'), orbitButton];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const orbitLabel = '三维城堡。使用方向键旋转，使用加号或减号缩放。';
  const walkLabel = '第一人称漫游。用 WASD 或方向键移动，用 Q、E 或拖动转头。走到靠水的栈台尽头后按 F 登船，按 Escape 退出漫游。';
  const boatLabel = '第一人称划船。W、S 划桨，A、D 转向，Q、E 或拖动转头，按 F 靠岸下船。';

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', orbitLabel);
  holder.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#a18795', .0068);
  const camera = new THREE.PerspectiveCamera(44, 1, .18, 590);
  const walkCamera = new THREE.PerspectiveCamera(62, 1, .065, 590);
  const controls = new OrbitControls(camera, canvas);
  const walk = createWalkMode({ camera: walkCamera, canvas });
  controls.enablePan = false;
  controls.enableDamping = !motion.matches;
  controls.dampingFactor = .085;
  controls.rotateSpeed = .57;
  controls.zoomSpeed = .78;
  controls.minDistance = 9.5;
  controls.maxDistance = 150;
  controls.minPolarAngle = .21;
  controls.maxPolarAngle = 1.53;
  controls.autoRotateSpeed = .58;

  const castle = createCastle();
  const environment = createEnvironment();
  const atmosphere = createAtmosphere();
  const boat = createBoatMode({ camera: walkCamera, canvas, environment });
  scene.add(castle, environment, atmosphere.group, boat.group);
  const updateLighting = createLighting(scene);
  const updateBirds = createBirds(scene);

  let width = 1;
  let height = 1;
  let view = 'wide';
  let offset = views.wide.offset;
  let transition;
  let mobile = false;
  let night = 0;
  let wantsNight = false;
  let wantsOrbit = false;
  let worldTime = 0;
  let lastFrame = performance.now();
  let contextLost = false;
  let walking = false;
  let sailing = false;
  let noticeTimer;
  const releasePads = [];

  function showNotice(message) {
    clearTimeout(noticeTimer);
    statusText.textContent = message;
    status.hidden = false;
    noticeTimer = setTimeout(() => { status.hidden = true; }, 3500);
  }

  function viewPose(name) {
    const preset = views[name];
    const target = new THREE.Vector3(...preset.focus);
    const fit = Math.max(1, (name === 'wide' ? .93 : .75) / camera.aspect);
    const eye = new THREE.Vector3(...preset.eye).sub(target).multiplyScalar(fit).add(target);
    return { eye, target, offset: mobile ? 0 : preset.offset };
  }

  function frameCamera() {
    const verticalOffset = mobile ? (height > 560 ? -.065 : -.045) : .019;
    camera.setViewOffset(width, height, -offset * width, verticalOffset * height, width, height);
  }

  function goToView(name, instant = false) {
    view = name;
    for (const button of viewButtons) button.setAttribute('aria-pressed', String(button.dataset.view === name));
    const pose = viewPose(name);
    transition = undefined;
    if (instant || motion.matches) {
      camera.position.copy(pose.eye);
      controls.target.copy(pose.target);
      offset = pose.offset;
      frameCamera();
      controls.update(0);
    } else {
      transition = {
        start: performance.now(),
        eye: camera.position.clone(),
        target: controls.target.clone(),
        offset,
        pose,
      };
    }
  }

  function resize() {
    const oldWidth = width;
    const oldMobile = mobile;
    width = Math.max(holder.clientWidth, 1);
    height = Math.max(holder.clientHeight, 1);
    mobile = width < 780;
    camera.aspect = width / height;
    walkCamera.aspect = camera.aspect;
    walkCamera.fov = camera.aspect < .65 ? 74 : 62;
    walkCamera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.45 : 1.65));
    renderer.setSize(width, height, false);
    if (oldWidth === 1 || oldMobile !== mobile) goToView(view, true);
    else frameCamera();
  }

  function toggleNight() {
    wantsNight = !wantsNight;
    experience.dataset.light = wantsNight ? 'night' : 'dusk';
    lightButton.setAttribute('aria-pressed', String(wantsNight));
    lightButton.querySelector('span').textContent = wantsNight ? '暮色' : '月夜';
    lightButton.querySelector('use').setAttribute('href', wantsNight ? '#icon-sun' : '#icon-moon');
    document.getElementById('time-label').textContent = wantsNight ? '月夜' : '暮色';
    document.getElementById('time-clock').textContent = wantsNight ? '22:14' : '18:42';
    document.getElementById('subtitle').textContent = wantsNight ? '月光落在塔尖，城门前的灯仍亮着。' : '余晖越过塔尖，群山倒映在湖中。';
  }

  function toggleOrbit() {
    wantsOrbit = !wantsOrbit;
    orbitButton.setAttribute('aria-pressed', String(wantsOrbit));
    orbitButton.querySelector('span').textContent = wantsOrbit ? '暂停' : '环绕';
  }

  function boatActionAvailable() {
    if (!walking) return false;
    if (sailing) return Boolean(boat.nearDock);
    const dock = walk.boardingDock;
    return Boolean(dock && boat.canBoard(dock));
  }

  function updateWalkStage() {
    const stage = sailing ? 'rowing' : walk.stage;
    const canUseBoat = boatActionAvailable();
    const [index, label, direction] = walkStages[stage];
    if (walkLocation.dataset.stage !== stage) {
      walkLocation.dataset.stage = stage;
      walkChapter.textContent = `${index} / ${sailing ? '划船' : '漫游'}`;
      walkStage.textContent = label;
    }
    const hint = canUseBoat && stage === 'farDock'
      ? '点击「登船」或按 F，划向湖心的城堡。'
      : direction;
    if (walkDirection.textContent !== hint) walkDirection.textContent = hint;
    boatAction.hidden = !canUseBoat;
    if (sailing) {
      const { target, distance, bearing } = boat.guidance;
      const label = target === 'shore' ? '渔屋码头' : '城堡栈台';
      const meters = `${Math.round(distance)} m`;
      if (boatDestination.textContent !== label) boatDestination.textContent = label;
      if (boatDistance.textContent !== meters) boatDistance.textContent = meters;
      boatBearing.style.setProperty('--bearing', `${bearing}rad`);
    }
  }

  function setSailing(active) {
    sailing = active;
    experience.dataset.mode = sailing ? 'boat' : walking ? 'walk' : 'overview';
    boatCourse.hidden = !sailing;
    boatActionText.textContent = sailing ? '靠岸下船' : '登船';
    canvas.setAttribute('aria-label', sailing ? boatLabel : walking ? walkLabel : orbitLabel);
    moveHelp.textContent = sailing ? '前后划桨，左右转向' : '移动';
    touchMoveHelp.textContent = sailing ? '前后划桨 · 左右转向' : '按住箭头移动';
    const padLabels = sailing ? ['向前划', '向左转', '向后划', '向右转'] : ['向前', '向左', '向后', '向右'];
    padButtons.forEach((button, index) => button.setAttribute('aria-label', padLabels[index]));
  }

  function clearWalkInput() {
    walk.clearInput();
    boat.clearInput();
    for (const release of releasePads) release();
  }

  function resetWalk() {
    clearWalkInput();
    boat.park('shore');
    walk.enter();
    setSailing(false);
    updateWalkStage();
    canvas.focus({ preventScroll: true });
  }

  function useBoat() {
    if (!boatActionAvailable()) return;
    clearWalkInput();
    if (sailing) {
      const dock = boat.exit();
      if (!dock) return;
      walk.enter(dock);
      setSailing(false);
    } else {
      if (!boat.enter(walk.boardingDock)) return;
      walk.exit();
      setSailing(true);
    }
    updateWalkStage();
    canvas.focus({ preventScroll: true });
  }

  function setWalking(active) {
    if (active === walking) return;
    if (active && transition) goToView(view, true);
    walking = active;
    controls.enabled = !active;
    walkButton.setAttribute('aria-pressed', String(active));
    const buttonLabel = active ? '退出第一人称漫游' : '进入第一人称漫游';
    walkButton.setAttribute('aria-label', buttonLabel);
    walkButton.title = buttonLabel;
    walkButton.querySelector('span').textContent = active ? '退出漫游' : '漫游';
    for (const element of overviewOverlay) element.hidden = active;
    for (const element of walkOverlay) element.hidden = !active;
    castle.userData.setGateOpen(active);
    if (active) {
      resetWalk();
    } else {
      clearWalkInput();
      walk.exit();
      boat.park('shore');
      setSailing(false);
      boatAction.hidden = true;
      walkButton.focus({ preventScroll: true });
    }
  }

  function draw(now) {
    const delta = Math.min((now - lastFrame) / 1000, .05);
    lastFrame = now;
    if (contextLost) return;
    if (!motion.matches) worldTime += delta;
    night = motion.matches ? Number(wantsNight) : THREE.MathUtils.damp(night, Number(wantsNight), 3.5, delta);
    if (transition) {
      const linear = Math.min((now - transition.start) / 1150, 1);
      const blend = linear * linear * (3 - 2 * linear);
      camera.position.lerpVectors(transition.eye, transition.pose.eye, blend);
      controls.target.lerpVectors(transition.target, transition.pose.target, blend);
      offset = THREE.MathUtils.lerp(transition.offset, transition.pose.offset, blend);
      frameCamera();
      if (linear === 1) transition = undefined;
    }
    if (walking) {
      if (!sailing) walk.update(delta);
    } else {
      controls.autoRotate = wantsOrbit && !transition;
      controls.update(delta);
    }
    boat.update(worldTime, delta);
    if (walking) updateWalkStage();
    updateLighting(night, worldTime);
    atmosphere.update(worldTime, night);
    if (castle.userData.update(worldTime, motion.matches ? 1 : delta)) {
      renderer.shadowMap.needsUpdate = true;
      atmosphere.refreshReflection();
    }
    updateBirds(worldTime);
    renderer.render(scene, walking ? walkCamera : camera);
  }

  for (const button of viewButtons) button.addEventListener('click', () => goToView(button.dataset.view));
  lightButton.addEventListener('click', toggleNight);
  orbitButton.addEventListener('click', toggleOrbit);
  walkButton.addEventListener('click', () => setWalking(!walking));
  walkReset.addEventListener('click', resetWalk);
  boatAction.addEventListener('click', useBoat);
  for (const button of padButtons) {
    let pointerId;
    const release = () => {
      const captured = pointerId;
      if (captured === undefined) return;
      pointerId = undefined;
      if (button.hasPointerCapture(captured)) button.releasePointerCapture(captured);
      (sailing ? boat : walk).setMove(button.dataset.walkKey, false);
      delete button.dataset.held;
    };
    releasePads.push(release);
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || pointerId !== undefined) return;
      event.preventDefault();
      pointerId = event.pointerId;
      button.setPointerCapture(pointerId);
      button.dataset.held = '';
      (sailing ? boat : walk).setMove(button.dataset.walkKey, true);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, (event) => { if (event.pointerId === pointerId) release(); });
    }
  }
  window.addEventListener('blur', clearWalkInput);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearWalkInput(); });
  document.addEventListener('keydown', (event) => {
    if (walking && event.key === 'Escape') {
      event.preventDefault();
      setWalking(false);
    } else if (!event.repeat && event.code === 'KeyF' && !event.altKey && !event.ctrlKey && !event.metaKey && boatActionAvailable()) {
      event.preventDefault();
      useBoat();
    }
  });
  fullscreenButton.hidden = !document.fullscreenEnabled;
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await experience.requestFullscreen();
    } catch {
      showNotice('当前浏览器无法进入全屏');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const label = document.fullscreenElement ? '退出全屏' : '全屏';
    fullscreenButton.title = label;
    fullscreenButton.setAttribute('aria-label', label);
  });

  controls.addEventListener('start', () => { transition = undefined; });
  canvas.addEventListener('keydown', (event) => {
    if (walking) return;
    const step = .18;
    const actions = {
      ArrowLeft: () => controls.rotateLeft(step),
      ArrowRight: () => controls.rotateLeft(-step),
      ArrowUp: () => controls.rotateUp(step * .66),
      ArrowDown: () => controls.rotateUp(-step * .66),
      '+': () => camera.position.sub(controls.target).multiplyScalar(.88).add(controls.target),
      '=': () => camera.position.sub(controls.target).multiplyScalar(.88).add(controls.target),
      '-': () => camera.position.sub(controls.target).multiplyScalar(1.14).add(controls.target),
      '1': () => goToView('wide'),
      '2': () => goToView('gate'),
      '3': () => goToView('tower'),
      '4': () => goToView('lake'),
    };
    if (!Object.hasOwn(actions, event.key)) return;
    event.preventDefault();
    transition = undefined;
    actions[event.key]();
  });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    clearWalkInput();
    clearTimeout(noticeTimer);
    statusText.textContent = '正在恢复三维画面';
    status.hidden = false;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    renderer.shadowMap.needsUpdate = true;
    atmosphere.refreshReflection();
    status.hidden = true;
  });
  motion.addEventListener('change', () => { controls.enableDamping = !motion.matches; });
  window.addEventListener('resize', resize);

  resize();
  draw(performance.now());
  status.hidden = true;
  experience.dataset.ready = 'true';
  renderer.setAnimationLoop(draw);
}

try {
  startExperience();
} catch (error) {
  console.error(error);
  document.getElementById('status').querySelector('span').textContent = '三维场景未能加载。请使用支持 WebGL 2 的浏览器打开。';
  for (const button of document.querySelectorAll('button')) button.disabled = true;
}
