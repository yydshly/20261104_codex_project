import * as THREE from '../vendor/three.module.js';
import { BEACON, TUNING, createState, clearMotion, distance, step } from './model.js';

const $ = id => document.getElementById(id);
const canvas = $('world');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (error) {
  $('fatal').hidden = false;
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#367481');
scene.fog = new THREE.Fog('#367481', 45, 100);
scene.add(new THREE.HemisphereLight('#d9f4ec', '#41606a', 2.5));
const sun = new THREE.DirectionalLight('#ffe1aa', 3.1);
sun.position.set(-9, 17, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 0.5, far: 60 });
sun.shadow.bias = -0.001;
sun.shadow.normalBias = 0.04;
scene.add(sun);
const camera = new THREE.OrthographicCamera(-15, 15, 9, -9, 0.1, 120);
const cameraTarget = new THREE.Vector3(-3, 0, 0);
const cameraOffset = new THREE.Vector3(14, 22, 19.35);
const materials = new Map();
function material(color, extra = {}) {
  const key = color + JSON.stringify(extra);
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra }));
  return materials.get(key);
}
const geo = {
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(1, 10, 7),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 12),
  cone: new THREE.ConeGeometry(1, 1, 7),
  crystal: new THREE.OctahedronGeometry(0.33),
  particle: new THREE.BoxGeometry(0.11, 0.11, 0.11),
};
function mesh(geometry, color, position, scale = [1, 1, 1], parent = scene, extra = {}) {
  const object = new THREE.Mesh(geometry, material(color, extra));
  object.position.set(...position);
  object.scale.set(...scale);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
const box = (color, position, scale, parent = scene, extra = {}) => mesh(geo.box, color, position, scale, parent, extra);
function cylinder(color, position, radius, height, parent = scene, extra = {}) {
  return mesh(geo.cylinder, color, position, [radius, height, radius], parent, extra);
}
function ring(color, radius, width, position, parent = scene, opacity = 1) {
  const geometry = new THREE.RingGeometry(radius - width, radius, 64);
  const object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: false }));
  object.rotation.x = -Math.PI / 2;
  object.position.set(...position);
  parent.add(object);
  return object;
}

// The island is an authored low-poly diorama. Its decorative props share the
// same silhouette and palette as the collidable structures in the simulation.
const sea = mesh(new THREE.PlaneGeometry(180, 180), '#2c7683', [0, -1.35, 0], [1, 1, 1], scene, { metalness: 0.22, roughness: 0.4 });
sea.rotation.x = -Math.PI / 2;
sea.receiveShadow = true;
mesh(new THREE.CylinderGeometry(9.7, 8.6, 1.55, 12), '#35565a', [0, -0.78, 0], [1, 1, 0.78]);
mesh(new THREE.CylinderGeometry(9.6, 9.7, 0.22, 12), '#e0c89c', [0, -0.11, 0], [1, 1, 0.78]);
mesh(new THREE.CylinderGeometry(8.9, 9.0, 0.1, 12), '#bac1a0', [0, 0.015, 0], [1, 1, 0.78]);
const waterRings = [];
for (let i = 0; i < 4; i++) {
  const object = ring('#9ad2cd', 10 + i * 0.65, 0.035, [0, -1.3, 0], scene, 0.18 - i * 0.025);
  object.scale.y = 0.78;
  waterRings.push(object);
}
// A deterministic pattern avoids decorative changes when restarting a run.
for (let x = -6; x <= 6; x++) {
  for (let z = -4; z <= 4; z++) {
    if (Math.hypot(x / 7, z / 5) > 1) continue;
    const shade = ['#c6c8ac', '#c0c3a8', '#b9bda3', '#d1cfb3'][(x * x + z * z + 13) % 4];
    box(shade, [x * 1.1, 0.075, z * 1.1], [1.06, 0.05, 1.06]);
  }
}
ring('#8c9e86', 2.65, 0.028, [0, 0.11, 0]);
ring('#8c9e86', 2.38, 0.02, [0, 0.11, 0]);
for (let i = 0; i < 8; i++) {
  const angle = i * Math.PI / 4;
  const stone = box('#809c8b', [Math.sin(angle) * 2.51, 0.12, Math.cos(angle) * 2.51], [0.08, 0.025, 0.18]);
  stone.rotation.y = angle;
}
box('#9ea98f', [0, 0.09, -3.6], [1.6, 0.08, 3.4]);

function house(x, z, rotation) {
  const group = new THREE.Group();
  group.position.set(x, 0.1, z);
  group.rotation.y = rotation;
  scene.add(group);
  box('#e5d7b4', [0, 0.85, 0], [1.75, 1.65, 1.6], group);
  box('#af7054', [0, 0.15, 0], [1.88, 0.3, 1.7], group);
  const roof = mesh(new THREE.ConeGeometry(1.55, 1.2, 4), '#bc7859', [0, 2.15, 0], [1, 1, 0.95], group);
  roof.rotation.y = Math.PI / 4;
  box('#365865', [0, 0.65, 0.82], [0.5, 1.1, 0.06], group);
  box('#6b9696', [-0.57, 1.08, 0.83], [0.35, 0.5, 0.07], group);
  box('#d2b883', [-0.57, 1.08, 0.88], [0.04, 0.5, 0.04], group);
  box('#e6d6ae', [0.5, 2.25, -0.3], [0.28, 0.8, 0.28], group);
  box('#436b65', [0, 0.25, 1.0], [1.9, 0.12, 0.5], group);
}
house(-6.1, -3.8, 0.28);
house(6.1, -3.8, -0.3);

const lighthouse = new THREE.Group();
lighthouse.position.set(BEACON.x, 0.1, BEACON.z);
scene.add(lighthouse);
cylinder('#a2ac95', [0, 0.14, 0], 1.15, 0.28, lighthouse);
mesh(new THREE.CylinderGeometry(0.48, 0.78, 3.7, 12), '#f3e5c5', [0, 2, 0], [1, 1, 1], lighthouse);
cylinder('#c58462', [0, 1.1, 0], 0.7, 0.4, lighthouse);
cylinder('#c58462', [0, 3.18, 0], 0.55, 0.36, lighthouse);
box('#2e535a', [0, 0.65, 0.75], [0.45, 1.0, 0.05], lighthouse);
for (const height of [1.9, 2.8]) box('#4c7b7c', [0, height, 0.64 - height * 0.04], [0.22, 0.45, 0.04], lighthouse);
cylinder('#576e66', [0, 3.94, 0], 0.91, 0.15, lighthouse);
for (let i = 0; i < 8; i++) {
  const angle = i * Math.PI / 4;
  cylinder('#8e7c56', [Math.sin(angle) * 0.77, 4.2, Math.cos(angle) * 0.77], 0.025, 0.45, lighthouse);
}
ring('#bea06b', 0.8, 0.025, [0, 4.4, 0], lighthouse);
cylinder('#335762', [0, 4.55, 0], 0.58, 0.95, lighthouse, { roughness: 0.28, metalness: 0.3 });
for (let i = 0; i < 6; i++) {
  const angle = i * Math.PI / 3;
  cylinder('#c7a26c', [Math.sin(angle) * 0.59, 4.55, Math.cos(angle) * 0.59], 0.025, 0.96, lighthouse);
}
mesh(new THREE.ConeGeometry(0.92, 0.65, 12), '#c4825d', [0, 5.25, 0], [1, 1, 1], lighthouse);
cylinder('#e5bf7f', [0, 5.69, 0], 0.035, 0.35, lighthouse);
const beaconGlow = mesh(geo.sphere, '#ffd48a', [0, 4.55, 0], [0.41, 0.41, 0.41], lighthouse, { emissive: '#ffab35', emissiveIntensity: 0.2 });
const beaconLight = new THREE.PointLight('#ffbc65', 0, 22, 1.5);
beaconLight.position.set(0, 4.5, 0);
lighthouse.add(beaconLight);
const beaconRing = ring('#ffd994', 1.55, 0.07, [0, 0.14, 0], lighthouse, 0.8);
beaconRing.visible = false;
const beams = new THREE.Group();
beams.position.y = 4.55;
lighthouse.add(beams);
for (const sign of [-1, 1]) {
  const beam = new THREE.Mesh(new THREE.ConeGeometry(1.1, 13, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe1a1', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  beam.rotation.z = sign * Math.PI / 2;
  beam.position.x = sign * 6.5;
  beams.add(beam);
}
beams.visible = false;

function tree(x, z, size = 1) {
  cylinder('#7c7a58', [x, size * 0.6, z], 0.1 * size, 1.2 * size);
  for (let i = 0; i < 3; i++) mesh(geo.cone, ['#466f59', '#548367', '#709578'][i], [x, (0.95 + i * 0.4) * size, z], [(0.7 - i * 0.14) * size, 1.2 * size, (0.7 - i * 0.14) * size]);
}
for (const [x, z, size] of [[-7, -1.9, 1.2], [-7.8, -0.6, 0.8], [7.5, -2, 1.15], [7.9, -0.4, 0.75], [-3.4, -5.8, 0.8], [3.6, -5.6, 0.9]]) tree(x, z, size);
for (let i = 0; i < 24; i++) {
  const angle = i * 2.399;
  const radius = 8.8 + Math.sin(i * 11) * 0.35;
  mesh(new THREE.DodecahedronGeometry(1, 0), i % 2 ? '#65877a' : '#789788', [Math.cos(angle) * radius, -0.03, Math.sin(angle) * radius * 0.77], [0.25 + i % 3 * 0.12, 0.17 + i % 4 * 0.1, 0.32]);
}
// Weathered jetty and a little sailboat give a spatial reference for speed.
for (let i = 0; i < 11; i++) box('#8f805f', [0, -0.25, 6.3 + i * 0.32], [1.8, 0.15, 0.27]);
for (const x of [-0.72, 0.72]) for (const z of [6.5, 8.9]) cylinder('#736d52', [x, -0.35, z], 0.09, 1.4);
const boat = new THREE.Group();
boat.position.set(3, -0.75, 9.5);
boat.rotation.y = -0.4;
scene.add(boat);
mesh(new THREE.CylinderGeometry(0.8, 0.45, 0.35, 5), '#bf8160', [0, 0, 0], [0.6, 1, 1.5], boat);
cylinder('#e0c595', [0, 1, 0], 0.035, 2.2, boat);
const sail = new THREE.Shape(); sail.moveTo(0, 0); sail.lineTo(0, 1.6); sail.lineTo(0.9, 0); sail.closePath();
mesh(new THREE.ShapeGeometry(sail), '#efdbb6', [0.03, 0.3, 0], [1, 1, 1], boat, { side: THREE.DoubleSide });
const gulls = [];
for (let i = 0; i < 5; i++) {
  const gull = new THREE.Group();
  const left = box('#ecdfc3', [-0.14, 0, 0], [0.28, 0.025, 0.06], gull);
  const right = box('#ecdfc3', [0.14, 0, 0], [0.28, 0.025, 0.06], gull);
  left.rotation.z = 0.2; right.rotation.z = -0.2;
  scene.add(gull); gulls.push(gull);
}

const playerMesh = new THREE.Group();
scene.add(playerMesh);
const playerBody = new THREE.Group(); playerMesh.add(playerBody);
const torso = mesh(new THREE.CapsuleGeometry(0.25, 0.34, 4, 8), '#3c7885', [0, 0.67, 0], [1, 1, 1], playerBody);
mesh(geo.sphere, '#efc393', [0, 1.17, 0.035], [0.24, 0.25, 0.24], playerBody);
cylinder('#e6ce9f', [0, 1.39, 0], 0.34, 0.09, playerBody);
mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.17, 10), '#e5c78b', [0, 1.47, 0], [1, 1, 1], playerBody);
box('#d37751', [0, 0.96, 0], [0.53, 0.13, 0.48], playerBody);
const scarf = box('#c77554', [-0.07, 0.83, -0.35], [0.2, 0.1, 0.55], playerBody);
const legs = [-1, 1].map(sign => box('#294854', [sign * 0.14, 0.25, 0], [0.17, 0.4, 0.2], playerBody));
for (const sign of [-1, 1]) box('#e3b884', [sign * 0.31, 0.71, 0.04], [0.13, 0.35, 0.14], playerBody);
const sword = new THREE.Group();
sword.position.set(-0.34, 0.78, 0.15);
box('#f5dc9e', [0, 0, 0.4], [0.12, 0.08, 0.85], sword, { metalness: 0.4 });
box('#ad8250', [0, 0, 0.01], [0.34, 0.12, 0.09], sword);
playerBody.add(sword);
ring('#d7e4b9', 0.49, 0.035, [0, 0.13, 0], playerMesh, 0.75);
const slash = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.85, 40, 1, -Math.PI * 0.3, Math.PI * 1.6), new THREE.MeshBasicMaterial({ color: '#fff0b5', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
slash.rotation.x = -Math.PI / 2;
slash.position.y = 0.45;
playerMesh.add(slash);

function crab() {
  const group = new THREE.Group();
  const body = mesh(geo.sphere, '#bf755b', [0, 0.52, 0], [0.56, 0.31, 0.43], group);
  box('#e5b87d', [0, 0.76, -0.06], [0.34, 0.07, 0.28], group);
  const movingParts = [];
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const leg = box('#795f53', [sign * 0.55, 0.24, (i - 1) * 0.26], [0.52, 0.09, 0.1], group);
      leg.rotation.z = -sign * 0.45;
      movingParts.push(leg);
    }
    cylinder('#685b4f', [sign * 0.21, 0.83, 0.21], 0.035, 0.25, group);
    mesh(geo.sphere, '#ffe3a0', [sign * 0.21, 0.96, 0.21], [0.065, 0.065, 0.065], group, { emissive: '#e6ad3c', emissiveIntensity: 0.5 });
    mesh(geo.sphere, '#ca8c62', [sign * 0.67, 0.55, 0.45], [0.25, 0.17, 0.3], group);
  }
  const warning = ring('#f28a65', 1.05, 0.055, [0, 0.14, 0], group, 0.7);
  warning.visible = false;
  const health = new THREE.Group(); health.position.y = 1.25; group.add(health);
  const ticks = [-1, 0, 1].map(i => box('#e9ce95', [i * 0.17, 0, 0], [0.13, 0.05, 0.08], health));
  scene.add(group);
  return { group, body, movingParts, warning, ticks };
}
const crabs = [crab(), crab(), crab()];
const pickupMeshes = crabs.map(() => {
  const group = new THREE.Group();
  mesh(geo.crystal, '#ffe3a1', [0, 0.75, 0], [0.7, 1.3, 0.7], group, { emissive: '#efb544', emissiveIntensity: 0.7, metalness: 0.3 });
  ring('#ffdf97', 0.52, 0.04, [0, 0.13, 0], group, 0.7);
  group.visible = false; scene.add(group); return group;
});
const effectPool = Array.from({ length: 110 }, () => {
  const object = new THREE.Mesh(geo.particle, new THREE.MeshBasicMaterial({ color: '#ffd68b', transparent: true }));
  object.visible = false; scene.add(object);
  return { object, life: 0, duration: 1, vx: 0, vy: 0, vz: 0 };
});
let effectCursor = 0;
function particles(x, z, color, count = 14, force = 1) {
  if (reducedMotion) count = Math.min(5, count);
  for (let i = 0; i < count; i++) {
    const effect = effectPool[effectCursor++ % effectPool.length];
    const angle = i * 2.399 + visualTime;
    effect.life = effect.duration = 0.3 + i % 5 * 0.09;
    effect.vx = Math.cos(angle) * (1.6 + i % 3) * force;
    effect.vz = Math.sin(angle) * (1.6 + i % 3) * force;
    effect.vy = (2 + i % 4) * force;
    effect.object.material.color.set(color);
    effect.object.position.set(x, 0.65, z);
    effect.object.scale.setScalar(0.6 + i % 4 * 0.35);
    effect.object.visible = true;
  }
}

let state = createState();
let fullFeel = true;
let muted = true;
let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { reducedMotion = event.matches; });
const keys = new Set();
const pending = { attack: false, dash: false, interact: false };
const touch = { x: 0, y: 0, attack: false };
let audioContext;
let voices = 0;
let shake = 0;
let hitPause = 0;
let visualTime = 0;
let noticeTimer = 0;
let lastHud = '';
let previousFrame = performance.now();
let accumulator = 0;
let fpsSum = 0;
let fpsFrames = 0;
let fps = 60;

function unlockAudio() {
  if (!audioContext && !muted) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
}
function tone(frequency, duration = 0.12, type = 'sine', volume = 0.065, endFrequency = frequency * 0.5) {
  if (muted || !audioContext || audioContext.state !== 'running' || voices >= 12) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain); gain.connect(audioContext.destination);
  voices++;
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voices--; };
  oscillator.start(now); oscillator.stop(now + duration);
}
function notice(text) {
  $('notice').textContent = text;
  $('notice').classList.add('visible');
  noticeTimer = 2.5;
}
function clearInput() {
  keys.clear(); touch.x = 0; touch.y = 0; touch.attack = false;
  for (const action of Object.keys(pending)) pending[action] = false;
  $('stick').style.transform = '';
  $('attack').classList.remove('pressed');
  $('dash').classList.remove('pressed');
  accumulator = 0;
}
function reset() {
  clearInput();
  state = createState();
  state.phase = 'playing';
  hitPause = 0; shake = 0; noticeTimer = 0; lastHud = '';
  $('notice').classList.remove('visible');
  for (const effect of effectPool) { effect.life = 0; effect.object.visible = false; }
  for (const pickup of pickupMeshes) pickup.visible = false;
  refreshUI();
  notice('靠近机械蟹，用 J 挥击 · 红圈出现时冲刺避开');
  canvas.focus({ preventScroll: true });
}
function pause() {
  if (!['playing', 'paused'].includes(state.phase)) return;
  state.phase = state.phase === 'playing' ? 'paused' : 'playing';
  clearInput(); clearMotion(state); refreshUI();
}
function refreshUI() {
  const signature = [state.phase, state.player.hp, state.shards, Math.ceil(state.time), state.score].join('|');
  if (signature === lastHud) return;
  lastHud = signature;
  document.body.dataset.state = state.phase;
  $('clock').textContent = Math.ceil(state.time);
  $('hearts').innerHTML = Array.from({ length: 4 }, (_, i) => `<span class="${i < state.player.hp ? '' : 'heart-empty'}">♥</span>`).join(' ');
  $('hearts').setAttribute('aria-label', `生命值 ${state.player.hp} / 4`);
  [...$('shards').children].forEach((element, i) => element.classList.toggle('on', i < state.shards));
  $('objective-text').textContent = state.shards === 3 ? '灯芯已齐，回灯塔按 E 点灯' : `击退机械蟹，收集灯芯 ${state.shards} / 3`;
  $('pause').disabled = !['playing', 'paused'].includes(state.phase);
  $('pause').setAttribute('aria-label', state.phase === 'paused' ? '继续游戏' : '暂停游戏');
  $('pause').innerHTML = state.phase === 'paused' ? '▷<span>继续</span>' : 'Ⅱ<span>暂停</span>';
  $('overlay').hidden = state.phase === 'playing';
  $('overlay').dataset.state = state.phase;
  $('mission').hidden = state.phase !== 'ready';
  $('secondary').hidden = state.phase !== 'paused';
  const menus = {
    ready: ['一座小岛，等待一束光', '海港<span>守灯人</span>', '潮水到来前，夺回三枚灯芯。<br>回到灯塔，把海港重新点亮。', '开始守灯', '靠近机械蟹后按 J，挥击会自动朝向附近目标。'],
    paused: ['海风还在，你可以歇一会', '航程暂停', '潮汐与机械蟹都在等待。<br>准备好了，就继续这段航程。', '继续守灯', 'P / Esc 可继续游戏。'],
    lost: ['下一次，会比这次更从容', '再试一次', state.player.hp === 0 ? '守灯人耗尽了体力。<br>观察红色预警圈，用冲刺避开冲撞。' : '潮汐已经到达海港。<br>先夺回灯芯，再到灯塔旁按 E。', '重新出发', `已收集 ${state.shards} / 3 枚灯芯 · 本局 ${state.score} 分`],
    won: ['今晚，每一艘船都有了归途', '海港亮了', '三枚灯芯已归位。<br>你为海上的人，留下了一束光。', '再守一程', `用时 ${(90 - state.time).toFixed(1)} 秒 · ${state.score} 分 · 剩余生命 ${state.player.hp} / 4`],
  };
  if (menus[state.phase]) {
    const [eyebrow, title, copy, primary, hint] = menus[state.phase];
    $('menu-eyebrow').textContent = eyebrow; $('menu-title').innerHTML = title;
    $('menu-copy').innerHTML = copy; $('primary').textContent = primary; $('menu-hint').textContent = hint;
  }
}
function feedback(event) {
  if (event.type === 'swing') {
    tone(280, 0.09, 'triangle', 0.045, 80);
  }
  if (event.type === 'hit' || event.type === 'defeat') {
    if (fullFeel) {
      hitPause = TUNING.hitPause;
      shake = Math.max(shake, event.type === 'defeat' ? 0.16 : 0.085);
      particles(event.x, event.z, event.type === 'defeat' ? '#ffe1a0' : '#fff5cf', event.type === 'defeat' ? 25 : 13);
      tone(event.type === 'defeat' ? 130 : 190, 0.13, 'square', 0.035, 45);
    }
    if (event.type === 'defeat') notice('机械蟹已停机 · 靠近金色灯芯拾取');
  }
  if (event.type === 'dash') {
    if (fullFeel) { particles(event.x, event.z, '#bce8d3', 10, 0.45); tone(140, 0.15, 'triangle', 0.06, 480); }
  }
  if (event.type === 'damage') {
    if (fullFeel) { shake = 0.25; particles(event.x, event.z, '#f29c7b', 18); }
    tone(90, 0.22, 'sawtooth', 0.04, 45);
    notice('受到了冲撞 · 红圈蓄力后，按空格冲刺躲开');
  }
  if (event.type === 'pickup') {
    if (fullFeel) { particles(event.x, event.z, '#ffe3a0', 18, 0.8); tone(660, 0.2, 'sine', 0.09, 1080); }
    notice(state.shards === 3 ? '三枚灯芯已集齐 · 回到灯塔旁按 E' : `灯芯 ${state.shards} / 3 · 海港又近了一步`);
  }
  if (event.type === 'warning') tone(340, 0.14, 'sine', 0.025, 440);
  if (event.type === 'won') {
    particles(0, -4.7, '#ffe1a0', 70, 1.5);
    tone(523, 0.8, 'sine', 0.06, 1046);
    tone(659, 0.9, 'sine', 0.05, 1318);
    tone(784, 1, 'sine', 0.04, 1568);
    clearInput();
  }
  if (event.type === 'lost') { tone(180, 0.6, 'triangle', 0.08, 45); clearInput(); }
}

function setFeel(value) {
  fullFeel = value;
  $('basic').setAttribute('aria-pressed', String(!value)); $('full').setAttribute('aria-pressed', String(value));
  $('feel-caption').textContent = value ? '命中停顿 · 闪白 · 粒子 · 镜头 · 音效' : '保留动作与判定，收起命中特效';
  if (!value) { shake = 0; hitPause = 0; for (const effect of effectPool) effect.life = 0; }
}
$('basic').onclick = () => setFeel(false);
$('full').onclick = () => setFeel(true);
$('about').onclick = () => {
  $('about-panel').hidden = !$('about-panel').hidden;
  $('about').setAttribute('aria-expanded', String(!$('about-panel').hidden));
};
$('audio').onclick = () => {
  muted = !muted; unlockAudio();
  $('audio').setAttribute('aria-pressed', String(!muted));
  $('audio').setAttribute('aria-label', muted ? '开启声音' : '关闭声音');
  $('audio').innerHTML = muted ? '♪<span>声音关</span>' : '♫<span>声音开</span>';
  if (!muted) tone(620, 0.1, 'sine', 0.05, 900);
};
$('primary').onclick = () => { unlockAudio(); if (state.phase === 'paused') pause(); else reset(); };
$('secondary').onclick = reset;
$('restart').onclick = () => { unlockAudio(); reset(); };
$('pause').onclick = pause;
$('ignite').onclick = () => { unlockAudio(); pending.interact = true; };
window.addEventListener('keydown', event => {
  if (event.target instanceof HTMLElement && event.target.closest('button,a') && ['Space', 'Enter'].includes(event.code)) return;
  const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyJ', 'Space', 'KeyE', 'KeyP', 'Escape', 'KeyR'];
  if (!gameKeys.includes(event.code)) return;
  event.preventDefault();
  unlockAudio();
  keys.add(event.code);
  if (event.repeat) return;
  if (event.code === 'KeyP' || event.code === 'Escape') pause();
  if (event.code === 'KeyR') reset();
  if (state.phase !== 'playing') return;
  if (event.code === 'KeyJ') pending.attack = true;
  if (event.code === 'Space') pending.dash = true;
  if (event.code === 'KeyE') pending.interact = true;
});
window.addEventListener('keyup', event => keys.delete(event.code));
canvas.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button === 0 && state.phase === 'playing') { unlockAudio(); pending.attack = true; canvas.focus(); }
});
window.addEventListener('blur', () => { if (state.phase === 'playing') pause(); else clearInput(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state.phase === 'playing') pause(); });

let joystickPointer = null;
function joystickMove(event) {
  if (event.pointerId !== joystickPointer) return;
  const rect = $('joystick').getBoundingClientRect();
  const dx = event.clientX - rect.left - rect.width / 2;
  const dy = event.clientY - rect.top - rect.height / 2;
  const length = Math.hypot(dx, dy);
  const scale = Math.max(34, length);
  touch.x = dx / scale; touch.y = dy / scale;
  $('stick').style.transform = `translate(${touch.x * 30}px,${touch.y * 30}px)`;
}
$('joystick').addEventListener('pointerdown', event => {
  if (joystickPointer !== null || state.phase !== 'playing') return;
  unlockAudio(); joystickPointer = event.pointerId;
  $('joystick').setPointerCapture(event.pointerId); joystickMove(event);
});
$('joystick').addEventListener('pointermove', joystickMove);
function joystickRelease(event) {
  if (event.pointerId !== joystickPointer) return;
  joystickPointer = null; touch.x = 0; touch.y = 0; $('stick').style.transform = '';
}
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('joystick').addEventListener(type, joystickRelease);
for (const action of ['attack', 'dash']) {
  const button = $(action);
  button.addEventListener('pointerdown', event => {
    event.preventDefault(); unlockAudio();
    if (state.phase !== 'playing') return;
    button.setPointerCapture(event.pointerId); button.classList.add('pressed');
    pending[action] = true;
    if (action === 'attack') touch.attack = true;
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => {
    button.classList.remove('pressed'); if (action === 'attack') touch.attack = false;
  });
}

function getInput() {
  return {
    x: Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + touch.x,
    y: Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')) + touch.y,
    attack: pending.attack || keys.has('KeyJ') || touch.attack,
    dash: pending.dash,
    interact: pending.interact,
  };
}
function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  const aspect = width / height;
  const halfHeight = aspect < 1 ? 10.1 / aspect : 8.7;
  camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
  camera.top = halfHeight; camera.bottom = -halfHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();
refreshUI();

function render(dt) {
  const player = state.player;
  playerMesh.position.set(player.x, 0, player.z);
  playerMesh.rotation.y = player.angle;
  const speed = Math.hypot(player.vx, player.vz);
  const walk = state.phase === 'playing' && speed > 0.2 ? Math.sin(state.elapsed * 16) : 0;
  playerBody.position.y = Math.abs(walk) * (fullFeel ? 0.065 : 0.03);
  playerBody.rotation.z = fullFeel && player.dash > 0 ? -0.2 : 0;
  legs[0].rotation.x = walk * 0.5; legs[1].rotation.x = -walk * 0.5;
  scarf.rotation.x = fullFeel ? Math.sin(visualTime * 7) * 0.16 + speed * 0.05 : 0;
  playerMesh.visible = !(player.invulnerable > 0.25 && Math.floor(state.elapsed * 14) % 2 === 0);
  sword.rotation.y = player.attack > 0 ? -1.4 + (1 - player.attack / 0.23) * 3.7 : 0;
  slash.material.opacity = player.attack > 0 ? Math.min(0.8, player.attack * 4) : 0;
  slash.scale.setScalar(fullFeel ? 1 : 0.72);
  slash.rotation.z = player.attack * 5;
  for (let i = 0; i < crabs.length; i++) {
    const enemy = state.enemies[i];
    const crab = crabs[i];
    crab.group.visible = enemy.hp > 0;
    crab.group.position.set(enemy.x, fullFeel && enemy.mode === 'windup' ? Math.sin(state.elapsed * 70) * 0.022 : 0, enemy.z);
    crab.group.rotation.y = enemy.angle;
    crab.body.material = material(fullFeel && enemy.flash > 0 ? '#fff4d5' : '#bf755b');
    crab.warning.visible = enemy.mode === 'windup' || enemy.mode === 'charge';
    crab.warning.scale.setScalar(enemy.mode === 'windup' ? 1 + (0.72 - enemy.timer) * 0.3 : 0.9);
    crab.warning.material.opacity = enemy.mode === 'windup' ? 0.55 + Math.sin(state.elapsed * 16) * 0.2 : 0.85;
    crab.ticks.forEach((tick, index) => { tick.visible = index < enemy.hp; });
    crab.movingParts.forEach((leg, index) => { leg.rotation.y = Math.sin(state.elapsed * 13 + index) * (enemy.mode === 'recover' ? 0.04 : 0.16); });
    const pickup = state.pickups.find(item => item.id === i && !item.collected);
    pickupMeshes[i].visible = Boolean(pickup);
    if (pickup) {
      pickupMeshes[i].position.set(pickup.x, reducedMotion ? 0 : Math.sin(visualTime * 3) * 0.14, pickup.z);
      pickupMeshes[i].rotation.y = visualTime * 0.9;
    }
  }
  for (const effect of effectPool) {
    effect.life = Math.max(0, effect.life - dt);
    effect.object.visible = effect.life > 0;
    if (effect.life === 0) continue;
    effect.vy -= 7 * dt;
    effect.object.position.x += effect.vx * dt;
    effect.object.position.y += effect.vy * dt;
    effect.object.position.z += effect.vz * dt;
    effect.object.material.opacity = effect.life / effect.duration;
    effect.object.rotation.x += dt * 5; effect.object.rotation.z += dt * 3;
  }
  const won = state.phase === 'won';
  const energized = state.shards === 3;
  beams.visible = won;
  beams.rotation.y = visualTime * 0.24;
  beaconLight.intensity = won ? 35 : energized ? 6 : 0;
  beaconGlow.material.emissiveIntensity = won ? 5 : energized ? 2 : 0.2;
  beaconRing.visible = energized;
  beaconRing.scale.setScalar(reducedMotion ? 1 : 1 + Math.sin(visualTime * 3) * 0.06);
  boat.position.y = -0.8 + (reducedMotion ? 0 : Math.sin(visualTime) * 0.06);
  boat.rotation.z = reducedMotion ? 0 : Math.sin(visualTime * 0.8) * 0.035;
  gulls.forEach((gull, i) => {
    const angle = visualTime * 0.09 + i * 1.2;
    gull.position.set(Math.cos(angle) * 13, 5.5 + Math.sin(angle * 2 + i) * 0.4, Math.sin(angle) * 10);
    gull.rotation.y = -angle;
    gull.visible = !reducedMotion;
  });
  waterRings.forEach((object, index) => { object.material.opacity = 0.09 + Math.sin(visualTime * 1.2 - index) * 0.035; });
  const mobile = innerWidth / innerHeight < 1;
  const desiredTarget = new THREE.Vector3(state.phase === 'ready' && !mobile ? -3.1 : player.x * 0.09, 0, player.z * 0.05);
  cameraTarget.lerp(desiredTarget, 1 - Math.exp(-dt * 3));
  camera.position.copy(cameraTarget).add(cameraOffset);
  if (!reducedMotion && fullFeel && shake > 0.001) {
    camera.position.x += Math.sin(visualTime * 153) * shake;
    camera.position.z += Math.cos(visualTime * 127) * shake;
  }
  camera.lookAt(cameraTarget);
  shake *= Math.exp(-dt * 15);
  $('interact').hidden = !(state.phase === 'playing' && energized && distance(player, BEACON) < 2.25);
  $('dash').style.opacity = player.dashCooldown > 0 ? '0.55' : '1';
  renderer.render(scene, camera);
}

function frame(now) {
  const rawDt = (now - previousFrame) / 1000;
  const dt = Math.min(0.05, rawDt);
  previousFrame = now;
  if (state.phase !== 'paused') visualTime += dt;
  fpsSum += Math.min(0.2, rawDt); fpsFrames++;
  if (fpsSum >= 1) { fps = Math.round(fpsFrames / fpsSum); fpsSum = 0; fpsFrames = 0; }
  if (noticeTimer > 0 && state.phase === 'playing') {
    noticeTimer -= dt;
    if (noticeTimer <= 0) $('notice').classList.remove('visible');
  }
  if (state.phase === 'playing') {
    const wasHitPause = hitPause > 0;
    hitPause = Math.max(0, hitPause - dt);
    if (!wasHitPause) {
      accumulator += dt;
      while (accumulator >= 1 / 120 && state.phase === 'playing') {
        step(state, getInput(), 1 / 120);
        pending.attack = false; pending.dash = false; pending.interact = false;
        for (const event of state.events) feedback(event);
        accumulator -= 1 / 120;
        if (hitPause > 0) { accumulator = 0; break; }
      }
    }
  }
  refreshUI();
  render(state.phase === 'paused' ? 0 : dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Explicit opt-in fixtures are for reproducible QA. Ordinary play exposes no
// mutation API and uses exactly the same simulation and victory conditions.
if (new URLSearchParams(location.search).has('qa')) {
  window.__qa = {
    snapshot: () => structuredClone({ ...state, fps, fullFeel, muted, renderer: renderer.info.render }),
    start: reset,
    fixture(name) {
      reset();
      if (name === 'low-health') { state.player.hp = 1; state.player.x = state.enemies[0].x; state.player.z = state.enemies[0].z; }
      if (name === 'timeout') state.time = 0.02;
      if (name === 'beacon') { state.shards = 3; state.enemies.forEach(enemy => { enemy.hp = 0; }); state.player.x = 0; state.player.z = -3.2; }
      if (name === 'combat') { state.enemies.slice(1).forEach(enemy => { enemy.hp = 0; }); state.player.x = -4.2; state.player.z = 2; state.enemies[0].timer = 10; }
      lastHud = ''; refreshUI();
    },
  };
}
