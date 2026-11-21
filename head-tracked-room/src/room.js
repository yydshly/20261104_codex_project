import * as THREE from 'three';
import { createMoonPost } from './moon-post.js';
import { createCharacterStage } from './character-stage.js';
import { createMorningDesk } from './morning-desk.js';
import { createWindowDesk } from './window-desk.js';
import { createThresholdVisitor } from './threshold-visitor.js';
import { createReferenceClock } from './reference-clock.js';
import { createOuterDesk } from './outer-desk.js';
import { createTwinStation } from './twin-station.js';
import { createRepairWorkshop } from './repair-workshop.js';
import { setScreenProjection } from './screen-projection.js';

export const REST_DISTANCE = 1.2;
export const MAX_SHIFT = 0.64;

export function createRoom(viewport, onRepairStatus) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  viewport.append(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 8);
  let halfHeight = 0.31;
  let needsRender = true;
  const lastEye = new THREE.Vector3();
  function showAvatarStatus(id, errorMessage = '人物载入失败，请刷新页面重试。') {
    const status = viewport.querySelector(id);
    return state => {
      status.hidden = state === 'ready';
      if (state === 'error') status.textContent = errorMessage;
      redraw();
    };
  }
  const reference = createReferenceClock(showAvatarStatus('#reference-avatar-status',
    import.meta.env.VITE_PUBLIC_BUILD === 'true' ? '人物模型载入失败，请刷新页面重试。' : '本地人物模型载入失败，请按 README 配置。'));
  const desk = createOuterDesk(reference, REST_DISTANCE, redraw);
  const scenes = new Map([['desk', desk], ['reference', reference]]);
  const buildScene = { rain: () => createWindowDesk(REST_DISTANCE, true),
    window: () => createWindowDesk(REST_DISTANCE), daily: createMorningDesk,
    visitor: () => createThresholdVisitor(showAvatarStatus('#visitor-avatar-status')),
    studio: () => createCharacterStage(renderer),
    prototype: createPrototype, 'moon-post': createMoonPost };
  let active = desk;
  let station;
  let workshop;
  let weather;

  new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    halfHeight = height / (2 * width);
    renderer.setSize(width, height, false);
    needsRender = true;
  }).observe(viewport);

  function redraw() {
    renderer.shadowMap.needsUpdate = true;
    needsRender = true;
  }

  return {
    repairClock() { workshop?.install(); },
    resetWorkshop() { workshop?.reset(); },
    grabRepair(x, y) { return workshop?.grab(x, y); },
    dragRepair(x, y) { workshop?.drag(x, y); },
    releaseRepair(cancelled) { workshop?.release(cancelled); },
    flipWorkshop() {
      needsRender = true;
      return workshop?.flip();
    },
    replayStation() {
      station?.replay();
      needsRender = true;
    },
    setDeskLighting(mode) {
      desk.setLighting(mode);
    },
    setDeskLook(yaw, pitch) {
      if (active === workshop) workshop.setLook(yaw, pitch);
      else desk.setLook(yaw, pitch);
      needsRender = true;
    },
    setScene(name) {
      if (name === 'station') station ??= createTwinStation();
      if (name === 'workshop' && !workshop) {
        workshop = createRepairWorkshop(onRepairStatus, redraw);
        scenes.set(name, workshop);
      }
      const content = name === 'station' ? station : null;
      const changed = desk.setDisplayScene(content);
      if (content) {
        if (changed && name === 'station') station.replay();
        active = desk;
        redraw();
        return;
      }
      if (!scenes.has(name)) {
        const next = buildScene[name]();
        if (weather) next.setWeather?.(weather);
        scenes.set(name, next);
      }
      const next = scenes.get(name);
      if (active === next && !changed) return;
      active = next;
      redraw();
    },
    async loadSample() {
      await scenes.get('studio').loadSample();
      redraw();
    },
    async importModel(file) {
      await scenes.get('studio').importFile(file);
      redraw();
    },
    resetModel() {
      scenes.get('studio').resetSample();
      redraw();
    },
    setModelAngle(degrees) {
      scenes.get('studio').setAngle(degrees);
      redraw();
    },
    setWeather(data) {
      weather = data;
      for (const scene of scenes.values()) scene.setWeather?.(data);
    },
    draw(eye, time) {
      if (active.update(new Date(), time)) needsRender = true;
      const gain = active.viewGain;
      const view = gain ? {
        x: eye.x * gain[0], y: eye.y * gain[1],
        z: REST_DISTANCE + (eye.z - REST_DISTANCE) * gain[2],
      } : eye;
      if (!needsRender && Math.hypot(view.x - lastEye.x, view.y - lastEye.y, view.z - lastEye.z) < 0.0003) return;
      needsRender = false;
      lastEye.set(view.x, view.y, view.z);

      if (active.render) {
        active.render(renderer, view, .5 / halfHeight);
        return;
      }

      // Project the fixed screen edges onto the near plane from the viewer's eye.
      if (active.shadowsChanged) renderer.shadowMap.needsUpdate = true;
      camera.position.set(view.x, view.y, view.z);
      setScreenProjection(camera, view.x, view.y, view.z, .5, halfHeight);
      renderer.render(active.scene, camera);
    },
  };
}

function createPrototype() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#13282b');

  const material = (color, roughness = 0.78, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const mint = material('#8cdbbd');
  const teal = material('#376965');
  const dark = material('#183238');
  const seam = material('#31514e');
  const brass = material('#bd8250', 0.42, 0.34);
  const pale = material('#e9d7b4');
  const wood = material('#965f3e');
  const glow = new THREE.MeshBasicMaterial({ color: '#ffd997' });

  function mesh(geometry, surface, x, y, z) {
    const object = new THREE.Mesh(geometry, surface);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    scene.add(object);
    return object;
  }

  function box(w, h, d, x, y, z, surface) {
    return mesh(new THREE.BoxGeometry(w, h, d), surface, x, y, z);
  }

  function cylinder(top, bottom, height, x, y, z, surface) {
    return mesh(new THREE.CylinderGeometry(top, bottom, height, 32), surface, x, y, z);
  }

  function ball(radius, x, y, z, surface) {
    return mesh(new THREE.SphereGeometry(radius, 28, 18), surface, x, y, z);
  }

  function flatGraphic(width, height, x, y, z, texture) {
    const panel = mesh(new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), x, y, z);
    panel.castShadow = false;
    return panel;
  }

  scene.add(new THREE.HemisphereLight('#c0e5f8', '#493020', 2.2));
  const key = new THREE.DirectionalLight('#ffdfa6', 2.2);
  key.position.set(-0.35, 0.67, 0.05);
  key.target.position.set(0, -0.24, -0.65);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.78, right: 0.78, top: 0.78, bottom: -0.78, near: 0.1, far: 2.7 });
  key.shadow.normalBias = 0.004;
  scene.add(key, key.target);

  const lampLight = new THREE.PointLight('#ffb86e', 0.075, 1.4);
  lampLight.position.set(-0.35, 0.14, -0.93);
  scene.add(lampLight);

  // The bezel lies on the fixed screen plane. Its opening leaves pixels
  // around the room for geometry that reaches in front of the bezel.
  const openingX = 0.441;
  const openingY = 0.232;
  const bezel = new THREE.Shape()
    .moveTo(-0.6, -0.6).lineTo(0.6, -0.6).lineTo(0.6, 0.6).lineTo(-0.6, 0.6).closePath();
  bezel.holes.push(new THREE.Path()
    .moveTo(-openingX, -openingY).lineTo(-openingX, openingY)
    .lineTo(openingX, openingY).lineTo(openingX, -openingY).closePath());
  const bezelSurface = new THREE.MeshBasicMaterial({ color: '#263236', toneMapped: false });
  mesh(new THREE.ShapeGeometry(bezel), bezelSurface, 0, 0, 0).castShadow = false;

  const rimSurface = new THREE.MeshBasicMaterial({ color: '#77938a', toneMapped: false });
  for (const side of [-1, 1]) {
    mesh(new THREE.PlaneGeometry(2 * openingX + 0.005, 0.0025),
      rimSurface, 0, side * (openingY + 0.00125), 0.001).castShadow = false;
    mesh(new THREE.PlaneGeometry(0.0025, 2 * openingY),
      rimSurface, side * (openingX + 0.00125), 0, 0.001).castShadow = false;
  }

  // The room sits behind the bezel.
  box(1.06, 0.66, 0.035, 0, 0, -1.31, teal);
  for (const side of [-1, 1]) {
    box(0.033, 0.66, 1.34, side * 0.514, 0, -0.672, teal);
    box(0.018, 0.66, 1.32, side * 0.497, -0.015, -0.67, dark);
    box(0.009, 0.009, 1.3, side * 0.485, 0.229, -0.657, brass);
    for (const depth of [-0.17, -0.48, -0.8, -1.12]) {
      box(0.023, 0.62, 0.025, side * 0.48, -0.008, depth, teal);
    }
  }
  box(1.05, 0.03, 1.33, 0, 0.325, -0.667, dark);
  box(1.05, 0.035, 1.33, 0, -0.326, -0.667, seam);
  for (let i = 0; i < 12; i += 1) {
    const plank = material(i % 3 === 0 ? '#936144' : i % 3 === 1 ? '#a87752' : '#83553e');
    box(0.081, 0.007, 1.321, (i - 5.5) * 0.083, -0.305, -0.664, plank);
  }
  box(1, 0.024, 0.025, 0, -0.285, -1.284, dark);
  box(0.7, 0.007, 0.025, 0, 0.305, -0.71, glow);
  box(0.7, 0.007, 0.025, 0, 0.305, -1.03, glow);

  // Porthole and layered planet.
  const portX = 0.19;
  const portY = 0.058;
  const portZ = -1.27;
  const sky = new THREE.MeshBasicMaterial({ color: '#0f2034' });
  const star = new THREE.MeshBasicMaterial({ color: '#e2e3c9' });
  mesh(new THREE.CircleGeometry(0.202, 64), sky, portX, portY, portZ).castShadow = false;
  mesh(new THREE.TorusGeometry(0.204, 0.016, 16, 64), brass, portX, portY, portZ + 0.012);
  mesh(new THREE.TorusGeometry(0.185, 0.005, 12, 56), dark, portX, portY, portZ + 0.01);
  for (let i = 0; i < 26; i += 1) {
    const angle = i * 2.399963;
    const r = Math.sqrt((i + 1) / 27) * 0.174;
    mesh(new THREE.CircleGeometry(i % 5 === 0 ? 0.0027 : 0.0013, 8), star,
      portX + Math.cos(angle) * r, portY + Math.sin(angle) * r, portZ + 0.002).castShadow = false;
  }
  const planet = ball(0.071, portX + 0.014, portY + 0.009, portZ + 0.027, material('#dd9568'));
  planet.castShadow = false;
  const rings = mesh(new THREE.RingGeometry(0.086, 0.122, 64),
    new THREE.MeshBasicMaterial({ color: '#b98e70', side: THREE.DoubleSide }), ...planet.position);
  rings.rotation.set(1.06, 0.2, -0.34);
  rings.castShadow = false;

  const sign = makeTexture(420, 192);
  sign.ctx.fillStyle = '#244743';
  sign.ctx.fillRect(0, 0, 420, 192);
  sign.ctx.strokeStyle = '#82aaa1';
  sign.ctx.lineWidth = 3;
  sign.ctx.strokeRect(11, 11, 398, 170);
  sign.ctx.fillStyle = '#e9dbb3';
  sign.ctx.font = 'bold 68px Consolas, monospace';
  sign.ctx.fillText('RELAY', 36, 91);
  sign.ctx.fillStyle = '#9dbfb0';
  sign.ctx.font = '25px Consolas, monospace';
  sign.ctx.fillText('OBSERVATORY / 01', 38, 143);
  box(0.304, 0.144, 0.018, -0.25, 0.142, -1.279, brass);
  flatGraphic(0.29, 0.132, -0.25, 0.142, -1.268, sign.texture);

  // Back shelf and pendant lamp.
  box(0.27, 0.018, 0.12, -0.245, -0.108, -1.231, wood);
  for (let i = 0; i < 6; i += 1) {
    const height = 0.065 + (i % 3) * 0.016;
    box(0.022, height, 0.05, -0.33 + i * 0.026, -0.098 + height / 2, -1.227, [pale, brass, mint][i % 3]);
  }
  cylinder(0.004, 0.004, 0.135, -0.35, 0.254, -0.93, brass);
  cylinder(0.021, 0.077, 0.058, -0.35, 0.164, -0.93, brass);
  cylinder(0.068, 0.068, 0.004, -0.35, 0.134, -0.93, glow);

  // Table and working clock.
  const tableX = -0.085;
  const tableZ = -0.59;
  box(0.48, 0.032, 0.27, tableX, -0.162, tableZ, wood);
  for (const x of [tableX - 0.205, tableX + 0.205]) {
    for (const z of [tableZ - 0.095, tableZ + 0.095]) {
      box(0.027, 0.13, 0.027, x, -0.24, z, dark);
    }
  }
  const clockX = -0.078;
  box(0.302, 0.132, 0.075, clockX, -0.077, -0.558, brass);
  box(0.286, 0.115, 0.078, clockX, -0.075, -0.553, dark);
  const clock = makeTexture(640, 240);
  flatGraphic(0.277, 0.104, clockX, -0.075, -0.513, clock.texture);
  box(0.25, 0.012, 0.085, clockX, -0.142, -0.553, dark);

  // A ceiling-mounted inspection robot reaches through the window.
  const robotX = -0.228;
  const robotY = 0.177;
  const robotZ = 0.113;
  const mount = new THREE.Vector3(-0.366, 0.3, -0.36);
  const hinge = new THREE.Vector3(-0.326, 0.147, -0.105);
  const headJoint = new THREE.Vector3(robotX - 0.033, robotY, robotZ - 0.049);
  const antennaBase = new THREE.Vector3(robotX - 0.034, robotY + 0.046, robotZ);
  const antennaTip = new THREE.Vector3(robotX - 0.056, robotY + 0.077, robotZ);

  function strut(from, to, radius, surface) {
    const center = from.clone().lerp(to, 0.5);
    const direction = to.clone().sub(from);
    const link = cylinder(radius, radius, direction.length(), ...center, surface);
    link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  }

  box(0.106, 0.022, 0.112, mount.x, mount.y, mount.z, brass);
  strut(mount, hinge, 0.016, brass);
  ball(0.029, ...hinge, dark);
  strut(hinge, headJoint, 0.021, brass);
  ball(0.032, ...headJoint, dark);
  ball(0.073, robotX, robotY, robotZ, pale).scale.set(1.12, 0.94, 0.82);
  mesh(new THREE.TorusGeometry(0.052, 0.008, 14, 44), brass, robotX, robotY - 0.006, robotZ + 0.044);
  ball(0.048, robotX, robotY - 0.006, robotZ + 0.046, dark).scale.z = 0.42;
  mesh(new THREE.TorusGeometry(0.022, 0.0045, 12, 36),
    new THREE.MeshBasicMaterial({ color: '#a5f4d5' }), robotX, robotY - 0.006, robotZ + 0.067);
  ball(0.008, robotX - 0.006, robotY - 0.001, robotZ + 0.071, mint);
  strut(antennaBase, antennaTip, 0.005, brass);
  ball(0.011, ...antennaTip, glow);

  const frontFill = new THREE.DirectionalLight('#b5ebed', 0.85);
  frontFill.position.set(0.25, 0.4, 0.8);
  scene.add(frontFill);

  const potX = 0.31;
  const potZ = -0.29;
  cylinder(0.066, 0.046, 0.079, potX, -0.263, potZ, material('#c17b59'));
  cylinder(0.059, 0.059, 0.003, potX, -0.221, potZ, dark);
  for (let i = 0; i < 9; i += 1) {
    const angle = i * 2.4;
    const reach = 0.028 + (i % 4) * 0.012;
    const height = 0.055 + (i % 5) * 0.023;
    const tip = new THREE.Vector3(potX + Math.cos(angle) * reach, -0.216 + height, potZ + Math.sin(angle) * reach);
    const stemBase = new THREE.Vector3(potX, -0.22, potZ);
    const stem = cylinder(0.0025, 0.0035, tip.distanceTo(stemBase), ...stemBase.clone().lerp(tip, 0.5), mint);
    stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.clone().sub(stemBase).normalize());
    const leaf = ball(0.025, ...tip, i % 2 ? mint : material('#437958'));
    leaf.scale.set(0.7, 1.55, 0.29);
    leaf.rotation.set(Math.sin(angle) * 0.6, -angle, -Math.cos(angle) * 0.7);
  }

  let lastTime = '';

  return {
    scene,
    update(now) {
      const time = [now.getHours(), now.getMinutes()].map(value => String(value).padStart(2, '0')).join(':');
      if (lastTime === time) return false;
      drawClock(clock.ctx, time);
      clock.texture.needsUpdate = true;
      lastTime = time;
      return true;
    },
  };
}

function makeTexture(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { ctx: canvas.getContext('2d'), texture };
}

function drawClock(ctx, time) {
  ctx.fillStyle = '#1b2426';
  ctx.fillRect(0, 0, 640, 240);
  ctx.font = 'bold 148px Consolas, monospace';
  ctx.textAlign = 'center';
  const digitPositions = [17, 164, 345, 492];
  for (const [index, digit] of [...time.replace(':', '')].entries()) {
    const x = digitPositions[index];
    ctx.fillStyle = '#303a3a';
    ctx.fillRect(x, 14, 129, 173);
    ctx.fillStyle = '#fff1cc';
    ctx.fillText(digit, x + 64.5, 151);
    ctx.fillStyle = '#1b2426';
    ctx.fillRect(x, 95, 129, 2);
  }
  ctx.fillStyle = '#e4b27e';
  ctx.fillRect(313, 70, 13, 13);
  ctx.fillRect(313, 112, 13, 13);
  ctx.fillStyle = '#a8c9bc';
  ctx.font = '22px Consolas, monospace';
  ctx.fillText('L O C A L   T I M E', 320, 221);
}
