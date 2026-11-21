import * as THREE from './vendor/three.module.js';
import { BEACON, CHAPTERS } from './content.js';
import { distance } from './campaign.js';
import { installHarborAssets } from './harbor-assets.js';
let harborAssets = null;
let fullFeel = true;
let reducedMotion = false;
let visualTime = 0;
let shake = 0;

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
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#367481');
scene.fog = new THREE.Fog('#367481', 45, 100);
scene.add(new THREE.HemisphereLight('#d9f4ec', '#41606a', 2.5));
const sun = new THREE.DirectionalLight('#ffe1aa', 3.1);
sun.position.set(-9, 17, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.autoUpdate = false;
sun.shadow.needsUpdate = true;
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
  if (!materials.has(key)) {
    const { roughness, metalness, ...options } = extra;
    materials.set(key, new THREE.MeshLambertMaterial({ color, flatShading: true, ...options }));
  }
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

const chapterProps = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
chapterProps.forEach(group => scene.add(group));
function house(x, z, rotation) {
  const group = new THREE.Group();
  group.position.set(x, 0.1, z);
  group.rotation.y = rotation;
  chapterProps[0].add(group);
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
  cylinder('#7c7a58', [x, size * 0.6, z], 0.1 * size, 1.2 * size, chapterProps[0]);
  for (let i = 0; i < 3; i++) mesh(geo.cone, ['#466f59', '#548367', '#709578'][i], [x, (0.95 + i * 0.4) * size, z], [(0.7 - i * 0.14) * size, 1.2 * size, (0.7 - i * 0.14) * size], chapterProps[0]);
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
  const barrel = cylinder('#577782', [0, 0.78, 0.58], 0.17, 0.8, group);
  barrel.rotation.x = Math.PI / 2;
  const aim = box('#f5aa73', [0, 0.17, 3], [0.045, 0.02, 6], group, { transparent: true, opacity: 0.75 });
  return { group, body, movingParts, warning, ticks, barrel, aim };
}
const crabs = [crab(), crab(), crab(), crab()];
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

// Static props are instanced per chapter so changing a chapter keeps visual
// obstacles in agreement with its collision data without extra shadow passes.
for (let chapter = 1; chapter < 3; chapter++) {
  const parent = chapterProps[chapter];
  for (const obstacle of CHAPTERS[chapter].obstacles) {
    cylinder('#687f85', [obstacle.x, 0.2, obstacle.z], obstacle.r + 0.15, 0.4, parent);
    cylinder(chapter === 1 ? '#c0c3b1' : '#7b8f8b', [obstacle.x, 1.1, obstacle.z], obstacle.r, 2.2, parent);
    cylinder('#c6bb92', [obstacle.x, 2.2, obstacle.z], obstacle.r + 0.1, 0.15, parent);
  }
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      box(chapter === 1 ? '#aeb7aa' : '#546f77', [sign * (6.5 + i * 0.2), 0.3 + i % 2 * 0.12, 3 - i * 1.3], [0.8, 0.6 + i % 2 * 0.24, 0.7], parent);
    }
  }
}
function batchStatic(parent, excluded = []) {
  scene.updateMatrixWorld(true);
  const groups = new Map();
  const inverse = new THREE.Matrix4().copy(parent.matrixWorld).invert();
  function visit(node) {
    if (excluded.includes(node)) return;
    if (node.isMesh && !node.isInstancedMesh) {
      const key = node.geometry.uuid + node.material.uuid;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(node);
    }
    for (const child of node.children) visit(child);
  }
  visit(parent);
  for (const objects of groups.values()) {
    if (objects.length < 2) continue;
    const instance = new THREE.InstancedMesh(objects[0].geometry, objects[0].material, objects.length);
    instance.castShadow = objects[0].castShadow;
    instance.receiveShadow = objects[0].receiveShadow;
    objects.forEach((object, index) => {
      instance.setMatrixAt(index, new THREE.Matrix4().multiplyMatrices(inverse, object.matrixWorld));
      object.removeFromParent();
    });
    parent.add(instance);
  }
}
chapterProps.forEach(group => batchStatic(group));
const dynamicRoots = [playerMesh, lighthouse, ...crabs.map(crab => crab.group), ...pickupMeshes, ...effectPool.map(effect => effect.object), boat, ...gulls, beaconGlow, beaconRing, beams, ...waterRings, ...chapterProps];
batchStatic(scene, dynamicRoots);
for (const root of [playerMesh, ...crabs.map(crab => crab.group), boat, ...gulls]) {
  root.traverse(object => { if (object.isMesh) object.castShadow = false; });
}
const contactShadows = [playerMesh, ...crabs.map(crab => crab.group)].map(parent => {
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.48, 16), new THREE.MeshBasicMaterial({ color: '#274e50', transparent: true, opacity: 0.22, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.14;
  parent.add(shadow);
  return shadow;
});
const projectileMesh = new THREE.InstancedMesh(geo.sphere, material('#ffcf8d', { emissive: '#ff864c', emissiveIntensity: 1.3 }), 64);
projectileMesh.count = 0;
projectileMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
projectileMesh.frustumCulled = false;
scene.add(projectileMesh);
const projectileMatrix = new THREE.Matrix4();
const desiredTarget = new THREE.Vector3();
const pixelRatio = Math.min(devicePixelRatio, 1.5);
let selectedChapter = -1;
let selectedQuality = '';
let slowSamples = 0;

export function setQuality(quality) {
  if (selectedQuality === quality) return;
  selectedQuality = quality;
  slowSamples = 0;
  renderer.setPixelRatio(quality === 'low' ? 0.65 : pixelRatio);
  resize();
}
export function adaptQuality(fps) {
  if (selectedQuality !== 'auto' || renderer.getPixelRatio() <= 0.6) return;
  slowSamples = fps < 28 ? slowSamples + 1 : 0;
  if (slowSamples >= 2) { renderer.setPixelRatio(0.6); resize(); }
}
export function setEffects(enabled, reduced) { fullFeel = enabled; reducedMotion = reduced; }
export function clearEffects() {
  shake = 0;
  harborAssets?.clear();
  effectPool.forEach(effect => { effect.life = 0; effect.object.visible = false; });
}
export function emit(event) {
  harborAssets?.emit(event, reducedMotion, fullFeel);
  if (!fullFeel && !['won', 'chapter-clear'].includes(event.type)) return;
  const colors = { damage: '#f59a7b', dash: '#bce8d3', pickup: '#ffe3a0', hit: '#fff4d3', guard: '#a6d6e8', defeat: '#ffce8c', won: '#ffdf97', 'chapter-clear': '#ffdf97' };
  if (!colors[event.type]) return;
  const count = event.type === 'won' ? 65 : event.type === 'defeat' ? 25 : 12;
  particles(event.x, event.z, colors[event.type], count, event.type === 'dash' ? 0.45 : 1);
  shake = Math.max(shake, event.type === 'damage' ? 0.2 : event.type === 'hit' ? 0.07 : 0.1);
}
export function resize() {
  const width = canvas.clientWidth, height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  const aspect = width / height;
  const halfHeight = aspect < 1 ? 13 : 9;
  camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
  camera.top = halfHeight; camera.bottom = -halfHeight;
  camera.updateProjectionMatrix();
}
export function metrics() {
  return { drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, pixelRatio: renderer.getPixelRatio(), assets: harborAssets?.metrics() || null };
}
export function restore() { sun.shadow.needsUpdate = true; harborAssets?.restore(); resize(); }
export function render(state, dt) {
  const player = state.player;
  if (state.phase !== 'paused') visualTime += dt;
  if (state.chapter !== selectedChapter) {
    selectedChapter = state.chapter;
    const chapter = CHAPTERS[state.chapter];
    chapterProps.forEach((group, index) => { group.visible = index === state.chapter; });
    sea.material.color.set(chapter.sea);
    scene.background.set(chapter.sky); scene.fog.color.set(chapter.sky);
    sun.shadow.needsUpdate = true;
    clearEffects();
  }
  playerMesh.position.set(player.x, 0, player.z);
  playerMesh.rotation.y = player.angle;
  const speed = Math.hypot(player.vx, player.vz);
  const walk = state.phase === 'playing' && speed > 0.2 ? Math.sin(state.elapsed * 16) : 0;
  playerBody.position.y = Math.abs(walk) * (fullFeel ? 0.065 : 0.03);
  playerBody.rotation.z = fullFeel && player.dash > 0 ? -0.2 : 0;
  legs[0].rotation.x = walk * 0.5; legs[1].rotation.x = -walk * 0.5;
  scarf.rotation.x = fullFeel && !reducedMotion ? Math.sin(visualTime * 7) * 0.16 + speed * 0.05 : 0;
  playerMesh.visible = reducedMotion || !(player.invulnerable > 0.25 && Math.floor(state.elapsed * 14) % 2 === 0);
  sword.rotation.y = player.attack > 0 ? -1.4 + (1 - player.attack / 0.23) * 3.7 : 0;
  slash.material.opacity = player.attack > 0 ? Math.min(0.8, player.attack * 4) : 0;
  slash.scale.setScalar(fullFeel ? 1 : 0.72);
  slash.rotation.z = player.attack * 5;
  for (let i = 0; i < crabs.length; i++) {
    const enemy = state.enemies[i];
    const crab = crabs[i];
    crab.group.visible = Boolean(enemy && enemy.hp > 0);
    pickupMeshes[i].visible = false;
    if (!enemy) continue;
    const boss = enemy.type === 'boss';
    crab.group.scale.setScalar(boss ? 2 : 1);
    crab.group.position.set(enemy.x, fullFeel && !reducedMotion && enemy.mode === 'windup' ? Math.sin(state.elapsed * 70) * 0.022 : 0, enemy.z);
    crab.group.rotation.y = enemy.angle;
    crab.body.material = material(fullFeel && enemy.flash > 0 ? '#fff4d5' : boss ? '#6e8790' : enemy.type === 'cannon' ? '#658d94' : '#bf755b');
    crab.barrel.visible = !harborAssets && enemy.type === 'cannon';
    crab.aim.visible = enemy.mode === 'windup' && (enemy.type === 'cannon' || (boss && enemy.move % 2 === 1));
    crab.warning.visible = enemy.mode === 'windup' || enemy.mode === 'charge';
    crab.warning.scale.setScalar(enemy.mode === 'windup' ? 1 + Math.max(0, 1 - enemy.timer) * 0.2 : 0.9);
    crab.warning.material.opacity = enemy.mode === 'windup' ? 0.7 : 0.95;
    crab.ticks.forEach((tick, index) => { tick.visible = !boss && index < Math.ceil(enemy.hp / enemy.maxHp * 3); });
    crab.movingParts.forEach((leg, index) => { leg.rotation.y = Math.sin(state.elapsed * 13 + index) * (enemy.mode === 'recover' ? 0.04 : 0.16); });
    const pickup = state.pickups.find(item => item.id === i && !item.collected);
    pickupMeshes[i].visible = Boolean(pickup);
    if (pickup) {
      pickupMeshes[i].position.set(pickup.x, reducedMotion ? 0 : Math.sin(visualTime * 3) * 0.14, pickup.z);
      pickupMeshes[i].rotation.y = visualTime * 0.9;
    }
  }
  projectileMesh.count = Math.min(64, state.projectiles.length);
  for (let i = 0; i < projectileMesh.count; i++) {
    const projectile = state.projectiles[i];
    projectileMatrix.makeScale(0.18, 0.18, 0.18);
    projectileMatrix.setPosition(projectile.x, 0.5, projectile.z);
    projectileMesh.setMatrixAt(i, projectileMatrix);
  }
  projectileMesh.instanceMatrix.needsUpdate = true;
  for (const effect of effectPool) {
    effect.life = Math.max(0, effect.life - dt);
    effect.object.visible = effect.life > 0;
    if (effect.life === 0) continue;
    effect.vy -= 7 * dt;
    effect.object.position.x += effect.vx * dt;
    effect.object.position.y += effect.vy * dt;
    effect.object.position.z += effect.vz * dt;
    effect.object.material.opacity = effect.life / effect.duration;
    effect.object.rotation.x += dt * 5;
  }
  const energized = state.cores === CHAPTERS[state.chapter].cores;
  const cleared = ['upgrade', 'won'].includes(state.phase);
  beams.visible = cleared; beams.rotation.y = visualTime * 0.24;
  beaconLight.intensity = cleared ? 20 : energized ? 5 : 0;
  beaconGlow.material.emissiveIntensity = cleared ? 5 : energized ? 2 : 0.2;
  beaconRing.visible = energized;
  beaconRing.scale.setScalar(reducedMotion ? 1 : 1 + Math.sin(visualTime * 3) * 0.06);
  boat.position.y = -0.8 + (reducedMotion ? 0 : Math.sin(visualTime) * 0.06);
  gulls.forEach((gull, i) => {
    const angle = visualTime * 0.09 + i * 1.2;
    gull.position.set(Math.cos(angle) * 13, 5.5 + Math.sin(angle * 2 + i) * 0.4, Math.sin(angle) * 10);
    gull.rotation.y = -angle; gull.visible = !reducedMotion && state.chapter < 2;
  });
  const mobile = innerWidth / innerHeight < 1;
  desiredTarget.set(state.phase === 'ready' && !mobile ? -3.1 : player.x * (mobile ? 0.6 : 0.08), 0, player.z * (mobile ? 0.55 : 0.04));
  cameraTarget.lerp(desiredTarget, 1 - Math.exp(-dt * 3));
  camera.position.copy(cameraTarget).add(cameraOffset);
  if (!reducedMotion && fullFeel && shake > 0.001) {
    camera.position.x += Math.sin(visualTime * 153) * shake;
    camera.position.z += Math.cos(visualTime * 127) * shake;
  }
  camera.lookAt(cameraTarget);
  shake *= Math.exp(-dt * 15);
  harborAssets?.update(state, dt, visualTime, camera, reducedMotion);
  renderer.render(scene, camera);
}
window.addEventListener('resize', resize);
resize();
try {
  harborAssets = await installHarborAssets({ scene, renderer, crabs, lighthouse, beaconGlow, beaconLight, beaconRing, beams, sea, boat });
  sun.shadow.needsUpdate = true;
} catch (error) {
  console.error('Harbor asset loading failed', error);
  $('notice').textContent = '新资源加载失败，当前显示基础场景。请刷新重试。';
  $('notice').classList.add('visible');
}

