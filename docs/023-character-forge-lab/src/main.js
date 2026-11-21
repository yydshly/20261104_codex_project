import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const node = (icon, title, sub, center = false) => `<div class="diagram-node${center ? ' center' : ''}"><span class="diagram-icon" aria-hidden="true">${icon}</span><b>${title}</b><small>${sub}</small></div>`;
const arrow = '<span class="diagram-arrow" aria-hidden="true">→</span>';
const steps = [
  { kicker: 'ASSET DECOMPOSITION', title: '先分开，才方便继续改。', description: '身体决定体型，盔甲决定轮廓，武器决定握持。把三者作为独立资产保留，换武器时就不必连身体一起重新生成。', output: '交付物：角色规格 + 分件清单 + 统一的比例与姿态', diagram: node('♙', '身体', 'A / T-pose') + node('◇', '盔甲', '独立部件') + node('╱', '武器', '明确握持点'), label: '角色分成身体、盔甲和武器三个独立资产' },
  { kicker: 'GENERATE & ASSEMBLE', title: '生成工具给出模型，Blender 把它装起来。', description: 'Codex 可以通过 Tripo CLI 生成并下载模型，再通过 Blender MCP 执行导入、缩放、材质与位置调整。MCP 是工具接口，具体操作由 Blender Python 完成。', output: '交付物：比例一致、材质齐全、部件位置正确的角色', diagram: node('↗', 'Tripo', '模型与贴图') + arrow + node('⌘', 'Codex', '组织与调用', true) + arrow + node('◈', 'Blender', '装配与调整'), label: 'Tripo 生成模型，由 Codex 调用 Blender 完成装配' },
  { kicker: 'SKELETON & SKINNING', title: '骨骼的变化，通过权重传给网格。', description: '骨架记录关节层级，蒙皮权重规定每个顶点受哪些骨骼影响。转动手臂后，需要查看肩、肘和手腕，确认网格是否跟随并正确变形。Rigify 可以帮助生成控制骨架。', output: '交付物：骨架 + 顶点权重 + 关节变形检查结果', diagram: node('♙', '角色网格', '顶点与表面') + arrow + '<div class="diagram-chain" aria-hidden="true"><span class="diagram-bone"></span><span class="diagram-bone"></span></div>' + arrow + node('↺', '姿势', '骨骼驱动'), label: '网格顶点由权重关联骨骼，骨骼变换驱动角色姿势' },
  { kicker: 'REFERENCE → FEEDBACK', title: '用参考找节奏，用逐帧检查找问题。', description: '参考视频帮助确定蓄力、击出和收势。Codex 在 Blender 中设置关键帧，再看多角度或连续帧，修正脚滑、穿模、握持和循环接缝。视频本身不会自动变成骨骼动作。', output: '交付物：独立动画片段 + 带时间点的修改记录', diagram: node('▷', '参考', '动作与节奏') + arrow + node('⌘', 'Codex', '观察与修改', true) + arrow + '<div class="diagram-stack"><span>关键帧</span><span>动作预览 ↺</span></div>', label: '参考视频指导关键帧，预览的反馈回到 Codex 修改动作' },
  { kicker: 'VALIDATE & EXPORT', title: '能播放，还要能导入、能复用。', description: '烘焙并导出动画，在目标引擎检查骨骼映射、比例、材质和动作循环。保留源文件与任务记录，之后才有依据评估返工量和成本。', output: '交付物：.blend 源文件 + GLB / FBX + 引擎内验收', diagram: node('◈', 'Blender', '源资产') + arrow + '<div class="diagram-stack"><span>.glb / .fbx</span><span>动画片段</span></div>' + arrow + node('✓', '引擎验证', '实际运行'), label: '从 Blender 导出模型和动画，再在引擎中验证实际运行' },
];

function showStep(index, focus = false) {
  const data = steps[index];
  $$('.step-list button').forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; });
  $('#panel-kicker').textContent = data.kicker;
  $('#panel-index').textContent = `0${index + 1} / 05`;
  $('#panel-title').textContent = data.title;
  $('#panel-description').textContent = data.description;
  $('#panel-output').textContent = data.output;
  $('#mechanism-diagram').innerHTML = data.diagram;
  $('#mechanism-diagram').setAttribute('aria-label', data.label);
  $('#mechanism-panel').setAttribute('aria-labelledby', `step-${index}`);
  if (focus) $(`#step-${index}`).focus();
}
$$('[data-step]').forEach(button => {
  button.addEventListener('click', () => showStep(Number(button.dataset.step)));
  button.addEventListener('keydown', event => {
    const current = Number(button.dataset.step);
    const changes = { ArrowDown: (current + 1) % 5, ArrowRight: (current + 1) % 5, ArrowUp: (current + 4) % 5, ArrowLeft: (current + 4) % 5, Home: 0, End: 4 };
    if (event.key in changes) { event.preventDefault(); showStep(changes[event.key], true); }
  });
});
showStep(0);

const extensions = [
  '固定体型、面数、贴图和骨架规格，先制作三个不同装备的 NPC。检查是否能共用同一套动作，再决定是否批量生成。',
  '为同一个挥剑动作加入视频动作捕捉和重定向，与当前关键帧样例对比。重点检查手脚定位、遮挡和最终需要修正的帧。',
  '先给当前行走循环加入脚掌锁定，再测试斜坡和台阶。用脚底与地面的相对位移判断改善，避免只看动作是否流畅。',
  '将 FBX 导入 Unity 测试场景，验证 Humanoid Avatar、材质、三个动画片段、Root Motion 设置，以及目标设备上的运行性能。',
];
function showExtension(index) {
  $$('[data-extension]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.extension) === index)));
  $('#extension-description').textContent = extensions[index];
}
$$('[data-extension]').forEach(button => button.addEventListener('click', () => showExtension(Number(button.dataset.extension))));
showExtension(0);

const video = $('#original-video');
const playOriginal = $('#play-original');
function videoFailed() { playOriginal.hidden = true; $('#video-error').hidden = false; }
video.addEventListener('error', videoFailed);
const failedSources = new Set();
video.querySelectorAll('source').forEach(source => source.addEventListener('error', () => {
  failedSources.add(source);
  if (failedSources.size === video.querySelectorAll('source').length) videoFailed();
}));
if (!video.canPlayType('video/mp4; codecs="avc1.42E01E"')) {
  $('#video-error-reason').textContent = '当前内置浏览器不支持这段 MP4 / H.264 视频的解码。请用系统浏览器打开原片，或在 X 原帖观看。下方 3D 演示不受影响。';
  videoFailed();
}
video.addEventListener('playing', () => { playOriginal.hidden = true; $('#video-error').hidden = true; });
playOriginal.addEventListener('click', async () => {
  playOriginal.querySelector('b').textContent = '正在载入原片…';
  const loadingTimeout = setTimeout(() => { if (video.readyState < 2) videoFailed(); }, 15000);
  try { await video.play(); playOriginal.hidden = true; }
  catch { videoFailed(); }
  finally { clearTimeout(loadingTimeout); }
});

const state = { playing: !matchMedia('(prefers-reduced-motion: reduce)').matches, clip: 'Idle', speed: 1, skeleton: false, exploded: false, armor: true, color: 'jade', ready: false };
let renderer, scene, camera, controls, model, mixer, skeleton, explodedRoot, currentAction;
let visible = false;
const clips = new Map();
const meshes = [];
const paletteMaterials = [];
const cameraTarget = new THREE.Vector3();
let movingCamera = false;
const viewport = $('#viewport');

function setPlaying(value) {
  state.playing = value;
  $('#play-toggle').textContent = value ? 'Ⅱ' : '▶';
  $('#play-toggle').setAttribute('aria-label', value ? '暂停动画' : '播放动画');
  $('#play-toggle').title = value ? '暂停动画' : '播放动画';
}
setPlaying(state.playing);

function chooseClip(name) {
  if (!state.ready || !clips.has(name)) return;
  if (state.exploded) setExploded(false);
  mixer.stopAllAction();
  state.clip = name;
  currentAction = mixer.clipAction(clips.get(name));
  currentAction.reset().setLoop(THREE.LoopRepeat).play();
  mixer.update(0);
  setView('threequarter');
  $$('[data-clip]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.clip === name)));
  setPlaying(true);
  updateTime();
}

function updateTime() {
  if (!currentAction) return;
  const duration = currentAction.getClip().duration;
  const time = Math.min(currentAction.time, duration);
  $('#time-label').textContent = `${time.toFixed(2)} / ${duration.toFixed(2)}s`;
  $('#timeline').value = Math.round(time / duration * 1000);
  $('#frame-label').textContent = `FRAME ${String(Math.round(time * 30)).padStart(3, '0')}`;
}

function setSkeleton(value) {
  if (!state.ready) return;
  if (value && state.exploded) setExploded(false);
  state.skeleton = value;
  $('#show-skeleton').checked = value;
  skeleton.visible = value;
  for (const object of meshes) {
    object.material.transparent = value;
    object.material.opacity = value ? .26 : 1;
    object.material.depthWrite = !value;
    object.material.needsUpdate = true;
  }
}

function setExploded(value) {
  if (!state.ready) return;
  if (value && state.skeleton) setSkeleton(false);
  state.exploded = value;
  $('#show-exploded').checked = value;
  model.visible = !value;
  explodedRoot.visible = value;
  skeleton.visible = state.skeleton && !value;
  $('#play-toggle').disabled = value;
  $('#timeline').disabled = value;
  $('#view-mode').textContent = value ? '分件视图 · 左：盔甲 / 中：身体 / 右：武器' : '装配视图 · 拖动旋转 / 滚轮缩放';
  $('#viewport-label').textContent = value ? 'BODY / ARMOR / WEAPONS' : 'JADE SENTINEL';
  setView('threequarter');
}

function setArmor(value) {
  state.armor = value;
  $('#show-armor').checked = value;
  for (const object of meshes) if (object.userData.partCategory === 'armor') object.visible = value;
  explodedRoot?.traverse(object => { if (object.isMesh && object.userData.partCategory === 'armor') object.visible = value; });
}

function setView(view) {
  if (!camera) return;
  const spread = state.exploded;
  const positions = spread ? { front: [0, 2, 7.4], threequarter: [3.5, 2.5, 7.3], side: [6, 2, 3.5] } : { front: [0, 1.65, 5.3], threequarter: [3.3, 2.2, 4.8], side: [5.5, 1.8, 0] };
  cameraTarget.fromArray(positions[view]);
  if (spread && camera.aspect < 1.2) cameraTarget.multiplyScalar(1.2 / camera.aspect);
  if (!spread && state.clip === 'Slash') cameraTarget.multiplyScalar(1.16);
  controls.target.set(0, !spread && state.clip === 'Slash' ? 1.48 : 1.25, 0);
  controls.maxDistance = spread ? 16 : 10;
  movingCamera = true;
  $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
}

function createExplodedModel() {
  explodedRoot = new THREE.Group();
  explodedRoot.name = 'SeparatedAssets';
  const offsets = { body: 0, armor: -1.5, weapon: 1.5 };
  model.updateMatrixWorld(true);
  for (const original of meshes) {
    if (original.isSkinnedMesh) original.skeleton.update();
    const geometry = original.geometry.clone();
    const positions = geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
      v.fromBufferAttribute(original.geometry.attributes.position, i);
      if (original.isSkinnedMesh) original.applyBoneTransform(i, v);
      original.localToWorld(v);
      positions.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.deleteAttribute('skinIndex'); geometry.deleteAttribute('skinWeight');
    geometry.computeVertexNormals();
    const object = new THREE.Mesh(geometry, original.material);
    object.position.x = offsets[original.userData.partCategory] || 0;
    object.userData = { ...original.userData };
    object.castShadow = true; object.receiveShadow = true;
    explodedRoot.add(object);
  }
  explodedRoot.visible = false;
  scene.add(explodedRoot);
}

async function initViewer() {
  renderer = new THREE.WebGLRenderer({ canvas: $('#character-canvas'), antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(34, 1, .05, 50);
  camera.position.set(3.3, 2.2, 4.8);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.25, 0);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.1;
  controls.maxDistance = 10;
  controls.minPolarAngle = .35;
  controls.maxPolarAngle = Math.PI / 2 - .025;
  controls.addEventListener('start', () => { movingCamera = false; $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', 'false')); });

  scene.add(new THREE.HemisphereLight(0xe1edcf, 0x293422, 2.4));
  const key = new THREE.DirectionalLight(0xffe7cb, 4.5);
  key.position.set(-3, 6, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 5; key.shadow.camera.bottom = -4;
  key.shadow.normalBias = .025; key.shadow.bias = -.0001; key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb6f3ce, 3); rim.position.set(3, 3, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xd9e6ff, 1.5); fill.position.set(4, 2, 2); scene.add(fill);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 96), new THREE.MeshStandardMaterial({ color: 0x263e2d, roughness: .97, metalness: .05 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.12; floor.receiveShadow = true; scene.add(floor);
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.47, .11, 96), new THREE.MeshStandardMaterial({ color: 0x384f36, metalness: .45, roughness: .55 }));
  platform.position.y = -.065; platform.receiveShadow = true; scene.add(platform);
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.36, 1.375, 96), new THREE.MeshBasicMaterial({ color: 0x8eaa6f, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = -.007; scene.add(ring);
  for (const r of [1.9, 2.6, 3.3, 4]) {
    const points = Array.from({ length: 97 }, (_, i) => new THREE.Vector3(Math.cos(i / 96 * Math.PI * 2) * r, -.11, Math.sin(i / 96 * Math.PI * 2) * r));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x728361, transparent: true, opacity: .17 })); scene.add(line);
  }

  const gltf = await new GLTFLoader().loadAsync(new URL('../assets/forge-knight.glb', import.meta.url).href);
  model = gltf.scene;
  scene.add(model);
  model.traverse(object => {
    if (!object.isMesh) return;
    object.castShadow = true; object.receiveShadow = true;
    object.material = object.material.clone();
    meshes.push(object);
    if (/jade enamel/i.test(object.material.name)) paletteMaterials.push(object.material);
  });
  for (const clip of gltf.animations) clips.set(clip.name, clip);
  for (const name of ['Idle', 'Walk', 'Slash']) if (!clips.has(name)) throw new Error(`Missing animation: ${name}`);
  mixer = new THREE.AnimationMixer(model);
  skeleton = new THREE.SkeletonHelper(model);
  skeleton.material.depthTest = false; skeleton.material.transparent = true; skeleton.material.opacity = .95;
  skeleton.material.color.set(0xc5ffc5); skeleton.renderOrder = 10; skeleton.visible = false; scene.add(skeleton);
  createExplodedModel();
  state.ready = true;
  const reduced = !state.playing;
  chooseClip('Idle');
  if (reduced) setPlaying(false);
  $('#render-status').textContent = 'BLENDER ASSET / READY';
  const report = await fetch(new URL('../assets/character-report.json', import.meta.url)).then(r => r.json());
  $('#bone-count').textContent = report.bones;
  $('#triangle-count').textContent = report.triangles.toLocaleString();

  new ResizeObserver(() => {
    const width = viewport.clientWidth, height = viewport.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix();
    if (state.exploded) setView('threequarter');
    renderer.render(scene, camera);
  }).observe(viewport);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '150px' }).observe(viewport);
  let previous = performance.now(), labelTime = 0;
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - previous) / 1000, .05); previous = now;
    if (!visible || document.hidden) return;
    if (state.playing && !state.exploded) mixer.update(dt * state.speed);
    if (movingCamera) { camera.position.lerp(cameraTarget, 1 - Math.exp(-dt * 7)); if (camera.position.distanceTo(cameraTarget) < .005) movingCamera = false; }
    controls.update();
    renderer.render(scene, camera);
    labelTime += dt;
    if (labelTime > .05) { updateTime(); labelTime = 0; }
  }
  requestAnimationFrame(animate);
}

$$('[data-clip]').forEach(button => button.addEventListener('click', () => chooseClip(button.dataset.clip)));
$('#play-toggle').addEventListener('click', () => { if (state.ready) setPlaying(!state.playing); });
$('#timeline').addEventListener('input', event => {
  if (!currentAction) return;
  setPlaying(false);
  currentAction.time = Number(event.target.value) / 1000 * currentAction.getClip().duration;
  mixer.update(0); updateTime();
});
$('#show-skeleton').addEventListener('change', event => setSkeleton(event.target.checked));
$('#show-exploded').addEventListener('change', event => setExploded(event.target.checked));
$('#show-armor').addEventListener('change', event => setArmor(event.target.checked));
$('#speed').addEventListener('change', event => { state.speed = Number(event.target.value); });
$$('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
$$('[data-color]').forEach(button => button.addEventListener('click', () => {
  const colors = { jade: '#2b876e', clay: '#af5c3d', indigo: '#5c629a' };
  state.color = button.dataset.color;
  paletteMaterials.forEach(material => material.color.set(colors[state.color]));
  $$('[data-color]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
}));

const tourMessages = [
  '第 1 步：左边是盔甲，中间是内层身体，右边是武器。分件保留，让换装和资产复用成为可能。',
  '第 2 步：20 根骨骼组成关节层级，网格顶点通过权重跟随骨骼。本样例使用显式权重，尚未验证生成模型的自动蒙皮。',
  '第 3 步：以 0.5 倍速观察原地行走，拖动进度条逐帧检查。脚掌锁定仍是下一轮需要完善的部分。',
  '第 4 步：查看挥剑的蓄力、击出和收势。下方可下载 GLB、FBX 与 Blender 源文件；Unity 导入验收是后续步骤。',
];
$$('[data-tour]').forEach(button => button.addEventListener('click', () => {
  if (!state.ready) { $('#tour-message').textContent = '角色正在载入，请稍后再开始讲解。'; return; }
  const index = Number(button.dataset.tour);
  setExploded(false); setSkeleton(false); setArmor(true);
  chooseClip(['Idle', 'Idle', 'Walk', 'Slash'][index]);
  state.speed = index === 2 ? .5 : 1;
  $('#speed').value = String(state.speed);
  if (index === 0) setExploded(true);
  if (index === 1) setSkeleton(true);
  if (index === 2) setView('side');
  $$('[data-tour]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  $('#tour-message').textContent = tourMessages[index];
  $('#demo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}));

initViewer().catch(error => {
  console.error('Character viewer:', error);
  $('#render-status').textContent = '3D LOAD ERROR';
  $('#viewer-error').hidden = false;
  $('#tour-message').textContent = '3D 查看器未能启动，模型和源文件仍可下载。';
});
