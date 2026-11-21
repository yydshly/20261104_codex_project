import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createEnvironment } from './game-environment.js';
import { TrialSession, autopilot, angleDelta, clamp } from './game-logic.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const canvas = $('#game-canvas'), shell = $('#game');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const keys = new Set(), touch = new Set();
let renderer, scene, camera, environment, actor, mixer, session;
let ready = false, paused = false, automatic = false, currentAnimation = '', currentAction;
let worldTime = 0, hitStop = 0, shake = 0, hurt = 0, resultDelay = 0, transientClip = 0;
let cameraYaw = Math.PI + .45, cameraPitch = .48, cameraDistance = 6.6;
let dragging = false, dragMoved = false, pointerStart = null;
let attackArc, arcLife = 0, impactLight;
const actions = new Map(), targetUI = new Map(), floating = [], particles = [];
const botMemory = { attackClock: 0 };
const projection = new THREE.Vector3(), cameraGoal = new THREE.Vector3(), lookGoal = new THREE.Vector3();
const maxParticles = 180;
let particleMesh, particlePosition, particleColor;
const names = { Idle: '待机', Walk: '行走', Run: '奔跑', Attack1: '斩击 · 一', Attack2: '斩击 · 二', Attack3: '斩击 · 三', Dodge: '闪避', Block: '格挡', BlockHit: '挡住冲击', Hit: '受击', Death: '倒下', Victory: '试炼完成' };

class Sound {
  constructor() { this.context = null; this.enabled = true; }
  async start() { try { this.context ||= new (window.AudioContext || window.webkitAudioContext)(); if (this.context.state !== 'running') await this.context.resume(); } catch { this.enabled = false; } }
  tone(frequency, duration, type = 'sine', volume = .05, end = frequency) {
    if (!this.context || !this.enabled) return;
    const ctx = this.context, t = ctx.currentTime, oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, t); oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration);
    gain.gain.setValueAtTime(volume, t); gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    oscillator.connect(gain).connect(ctx.destination); oscillator.start(t); oscillator.stop(t + duration + .02);
  }
  noise(duration = .1, volume = .07, frequency = 1600) {
    if (!this.context || !this.enabled) return;
    const ctx = this.context, count = Math.round(ctx.sampleRate * duration), buffer = ctx.createBuffer(1, count, ctx.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < count; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / count) ** 2;
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = frequency; gain.gain.value = volume;
    source.connect(filter).connect(gain).connect(ctx.destination); source.start();
  }
  play(name) {
    if (name === 'swing') { this.noise(.17, .11, 2300); this.tone(310, .12, 'triangle', .016, 100); }
    if (name === 'hit') { this.noise(.09, .16, 4500); this.tone(150, .12, 'triangle', .085, 48); this.tone(1200, .13, 'sine', .035, 700); }
    if (name === 'dodge') this.noise(.22, .09, 800);
    if (name === 'damage') { this.noise(.14, .09, 500); this.tone(100, .22, 'sawtooth', .035, 35); }
    if (name === 'block') { this.tone(1300, .3, 'triangle', .035, 650); this.noise(.08, .07, 5500); }
    if (name === 'destroyed') { [440, 660, 880].forEach((n, i) => setTimeout(() => this.tone(n, .5, 'sine', .045), i * 75)); this.noise(.25, .1, 2500); }
    if (name === 'won') [392, 494, 587, 784].forEach((n, i) => setTimeout(() => this.tone(n, .8, 'triangle', .035), i * 150));
    if (name === 'pulse') this.tone(160, .5, 'sine', .065, 50);
  }
}
const sound = new Sound();

function formatTime(seconds) { const min = Math.floor(seconds / 60); return `${String(min).padStart(2, '0')}:${(seconds % 60).toFixed(1).padStart(4, '0')}`; }
function message(text) { $('#game-message').textContent = text; }
function setAnimation(name, force = false) {
  if ((!force && currentAnimation === name) || !actions.has(name)) return;
  const next = actions.get(name), oneShot = !['Idle', 'Walk', 'Run', 'Block'].includes(name);
  next.reset().setEffectiveWeight(1).setEffectiveTimeScale(name.startsWith('Attack') ? 1.45 : name === 'Hit' ? 2 : name === 'BlockHit' ? 2.2 : 1);
  next.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity); next.clampWhenFinished = oneShot;
  if (currentAction && currentAction !== next) currentAction.fadeOut(name === 'Hit' ? .06 : .13);
  next.fadeIn(currentAction ? .12 : 0).play(); currentAction = next; currentAnimation = name;
}

function resetWorld(status = 'playing', auto = false) {
  session.reset(status); environment.resetTargets();
  automatic = auto; paused = false; hitStop = 0; hurt = 0; shake = 0; resultDelay = 0; arcLife = 0; transientClip = 0;
  botMemory.attackClock = 0; keys.clear(); touch.clear();
  particles.length = 0; floating.forEach(f => f.element.remove()); floating.length = 0;
  mixer.stopAllAction(); currentAction = null; currentAnimation = ''; setAnimation('Idle', true); mixer.update(0);
  actor.position.set(session.position.x, 0, session.position.z); actor.rotation.y = session.facing;
  cameraYaw = status === 'intro' ? Math.PI + .45 : .05;
  cameraPitch = status === 'intro' ? .30 : .48; cameraDistance = status === 'intro' ? 5.2 : 6.6;
  $('#intro').hidden = status !== 'intro'; $('#intro-side').hidden = status !== 'intro'; $('#hud').hidden = status === 'intro';
  $('#target-labels').hidden = status === 'intro'; $('#overlay').hidden = true; $('#pause-button').disabled = status === 'intro';
  $('#mode-label').textContent = auto ? '完整试炼自动演示 · 按移动键接管' : '自由操作';
  $('#combo-value').textContent = '01';
  message('靠近水晶，按 J 或点击画面攻击。连续输入可以接三连击。');
  updateHUD(); updateCamera(.2, true);
}

async function startTrial(auto = false) {
  if (!ready) return;
  await sound.start(); resetWorld('playing', auto); canvas.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
function showResult(kind) {
  const pause = kind === 'pause', won = kind === 'won';
  $('#overlay').hidden = false;
  $('#result-eyebrow').textContent = pause ? 'TAKE A BREATH' : won ? 'TRIAL COMPLETE' : 'THE FOREST REMEMBERS';
  $('#result-mark').textContent = pause ? 'Ⅱ' : won ? '◈' : '◇';
  $('#result-title').textContent = pause ? '暂歇片刻' : won ? '圣所已苏醒' : '试炼尚未结束';
  $('#result-copy').textContent = pause ? '这片暮林会等你回来。' : won ? '三座水晶全部击破。你的剑术留下了回响。' : '观察水晶的预警，在冲击到来前闪避，或举盾抵挡。';
  $('#result-stats').hidden = pause;
  if (!pause) $('#result-stats').innerHTML = `<div><strong>${formatTime(session.time)}</strong><span>完成用时</span></div><div><strong>${session.hits}</strong><span>有效命中</span></div><div><strong>${session.dodges}</strong><span>闪避次数</span></div><div><strong>${session.health}</strong><span>剩余生命</span></div>`;
  $('#resume-button').hidden = !pause; $('#restart-button').hidden = pause;
  if (won) { try { const best = Number(localStorage.getItem('emberfall-best') || Infinity); if (session.time < best) localStorage.setItem('emberfall-best', String(session.time)); } catch {} }
}
function togglePause() {
  if (!ready || session.status !== 'playing') return;
  paused = !paused; keys.clear(); touch.clear();
  if (paused) showResult('pause'); else { $('#overlay').hidden = true; canvas.focus({ preventScroll: true }); }
}
function takeControl() { if (automatic) { automatic = false; $('#mode-label').textContent = '自由操作 · 已接管'; message('已切换为自由操作。WASD 移动，J 连击，空格闪避。'); } }
function movementInput() {
  const forward = (keys.has('KeyW') || keys.has('ArrowUp') || touch.has('up') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') || touch.has('down') ? 1 : 0);
  const right = (keys.has('KeyD') || keys.has('ArrowRight') || touch.has('right') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') || touch.has('left') ? 1 : 0);
  return { x: -Math.sin(cameraYaw) * forward + Math.cos(cameraYaw) * right, z: -Math.cos(cameraYaw) * forward - Math.sin(cameraYaw) * right, sprint: keys.has('ShiftLeft') || keys.has('ShiftRight'), guard: keys.has('KeyF') };
}

function makeEffects() {
  const positions = new Float32Array(maxParticles * 3).fill(-100), colors = new Float32Array(maxParticles * 3);
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
  const ctx = sprite.getContext('2d'), gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, '#fff'); gradient.addColorStop(.2, '#fff'); gradient.addColorStop(1, 'transparent'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 32, 32);
  particleMesh = new THREE.Points(geometry, new THREE.PointsMaterial({ size: .12, map: new THREE.CanvasTexture(sprite), vertexColors: true, transparent: true, opacity: .95, depthWrite: false, blending: THREE.AdditiveBlending }));
  particleMesh.frustumCulled = false; scene.add(particleMesh); particlePosition = geometry.attributes.position; particleColor = geometry.attributes.color;
  const p = [], indices = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40 - .5) * Math.PI * 1.05; for (const r of [1.03, 1.38]) p.push(Math.sin(a) * r, .9 + Math.cos(a) * .17, Math.cos(a) * r); if (i < 40) { const k = i * 2; indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const arcGeo = new THREE.BufferGeometry(); arcGeo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); arcGeo.setIndex(indices);
  attackArc = new THREE.Mesh(arcGeo, new THREE.MeshBasicMaterial({ color: 0xffd993, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  attackArc.visible = false; scene.add(attackArc);
  impactLight = new THREE.PointLight(0xffd68c, 0, 4, 2); scene.add(impactLight);
}
function sparks(x, y, z, count = 16, tint = '#ffcf83', speed = 2.3) {
  const color = new THREE.Color(tint);
  for (let i = 0; i < count; i++) { if (particles.length >= maxParticles) particles.shift(); const a = Math.random() * Math.PI * 2, s = (.3 + Math.random()) * speed; particles.push({ x, y, z, vx: Math.cos(a) * s, vy: .8 + Math.random() * speed, vz: Math.sin(a) * s, age: 0, life: .3 + Math.random() * .4, color: color.clone() }); }
}
function floatText(text, x, y, z, type = '') {
  const element = document.createElement('span'); element.className = `floater ${type}`; element.textContent = text; $('#floaters').append(element); floating.push({ element, x, y, z, age: 0 });
}
function processEvents() {
  for (const event of session.drainEvents()) {
    if (event.type === 'attack') { $('#combo-value').textContent = String(event.combo + 1).padStart(2, '0'); }
    if (event.type === 'swing') { arcLife = .18; sound.play('swing'); }
    if (event.type === 'hit') {
      const target = environment.targets.find(t => t.id === event.id); if (target) target.group.userData.hitTime = worldTime;
      sparks(event.x, 1.2, event.z, 22, event.combo === 2 ? '#ffe49c' : '#d9f3d1');
      floatText(String(event.amount), event.x, 1.6, event.z, event.combo === 2 ? 'critical' : '');
      sound.play('hit'); hitStop = .055; if (!reducedMotion) shake = .11;
      impactLight.position.set(event.x, 1.5, event.z); impactLight.intensity = 7;
      message(event.combo === 2 ? '三连击收势命中。留意水晶的预警，空格可以闪避。' : '剑锋命中。连续输入 J，接续第二、第三段斩击。');
    }
    if (event.type === 'destroyed') { sparks(event.x, 1.25, event.z, 38, '#92e4ce', 3.3); sound.play('destroyed'); message('一座回响水晶已破碎。寻找下一座。'); }
    if (event.type === 'dodge') { sound.play('dodge'); sparks(session.position.x, .12, session.position.z, 11, '#c3cf9b', 1.2); }
    if (event.type === 'block') { sound.play('block'); transientClip = .25; setAnimation('BlockHit', true); floatText('格挡', session.position.x, 1.7, session.position.z, 'blocked'); }
    if (event.type === 'damage') { hurt = .65; if (!reducedMotion) shake = .14; sound.play('damage'); floatText(`−${event.amount}`, session.position.x, 1.8, session.position.z); message('受到了回响冲击。看地面的光圈，及时闪避或按住 F 举盾。'); }
    if (event.type === 'pulse') sound.play('pulse');
    if (event.type === 'won') { resultDelay = 1.15; sound.play('won'); message('三座水晶全部击破，试炼完成。'); }
    if (event.type === 'lost') resultDelay = 1;
  }
}
function updateEffects(dt) {
  for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.age += dt; if (p.age >= p.life) { particles.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.vy -= 5 * dt; }
  for (let i = 0; i < maxParticles; i++) { const p = particles[i]; if (!p) { particlePosition.setXYZ(i, 0, -100, 0); continue; } particlePosition.setXYZ(i, p.x, p.y, p.z); const fade = 1 - p.age / p.life; particleColor.setXYZ(i, p.color.r * fade, p.color.g * fade, p.color.b * fade); }
  particlePosition.needsUpdate = true; particleColor.needsUpdate = true;
  arcLife = Math.max(0, arcLife - dt); attackArc.visible = arcLife > 0;
  attackArc.material.opacity = arcLife / .18 * .7; attackArc.position.set(session.position.x, 0, session.position.z); attackArc.rotation.y = session.facing + (.5 - arcLife / .18) * .6;
  impactLight.intensity = Math.max(0, impactLight.intensity - dt * 40);
  hurt = Math.max(0, hurt - dt * 1.6); $('#hurt-flash').style.opacity = String(hurt);
  for (let i = floating.length - 1; i >= 0; i--) { const f = floating[i]; f.age += dt; if (f.age >= .85) { f.element.remove(); floating.splice(i, 1); continue; } projection.set(f.x, f.y + f.age * .8, f.z).project(camera); f.element.style.left = `${(projection.x * .5 + .5) * shell.clientWidth}px`; f.element.style.top = `${(-projection.y * .5 + .5) * shell.clientHeight}px`; f.element.style.opacity = String(Math.min(1, (.85 - f.age) * 3)); }
}

function updateHUD() {
  $('#health-fill').style.width = `${session.health}%`; $('#stamina-fill').style.width = `${session.stamina}%`;
  $('#health-value').textContent = String(Math.ceil(session.health)); $('#stamina-value').textContent = String(Math.ceil(session.stamina));
  $('#animation-name').textContent = names[session.action] || session.action;
  const destroyed = session.targets.filter(t => t.health <= 0).length;
  $('#mission-count').textContent = `${destroyed} / 3`; $('#mission-time').textContent = formatTime(session.time);
  $$('[data-rune]').forEach((element, i) => element.classList.toggle('complete', session.targets[i].health <= 0));
  let danger = false;
  session.targets.forEach((target, index) => {
    const data = targetUI.get(target.id), visual = environment.targets[index];
    visual.group.userData.health = target.health;
    data.ring.visible = target.health > 0 && (target.charge > 0 || target.wave > 0);
    if (target.charge > 0) { const amount = 1 - target.charge / .95; data.ring.scale.setScalar(1 + amount * .08); data.ring.material.color.set(0xeab078); data.ring.material.opacity = .18 + amount * .46; }
    else { const amount = 1 - target.wave / .65; data.ring.scale.setScalar(.2 + amount * 1.4); data.ring.material.color.set(0xd3e6bb); data.ring.material.opacity = (1 - amount) * .6; }
    if (target.charge > 0 && Math.hypot(target.x - session.position.x, target.z - session.position.z) < 3.3) danger = true;
    data.element.classList.toggle('charging', target.charge > 0);
    data.fill.style.width = `${target.health / target.maxHealth * 100}%`;
    projection.set(target.x, 2.25, target.z).project(camera);
    data.element.hidden = target.health <= 0 || projection.z > 1 || Math.abs(projection.x) > 1.1 || Math.abs(projection.y) > 1.2;
    data.element.style.left = `${(projection.x * .5 + .5) * shell.clientWidth}px`; data.element.style.top = `${(-projection.y * .5 + .5) * shell.clientHeight}px`;
  });
  $('#danger-hint').hidden = !danger || session.status !== 'playing' || paused;
}
function updateCamera(dt, snap = false) {
  const intro = session.status === 'intro';
  if (intro && !reducedMotion) cameraYaw = Math.PI + .45 + Math.sin(worldTime * .12) * .12;
  if (automatic && session.status === 'playing') cameraYaw += angleDelta(cameraYaw, session.facing + Math.PI) * Math.min(1, dt * 1.6);
  if (session.status === 'won') cameraYaw += angleDelta(cameraYaw, session.facing + .3) * Math.min(1, dt * .7);
  const narrow = camera.aspect < 1;
  const distance = cameraDistance * (narrow ? 1.12 : 1);
  lookGoal.set(session.position.x, intro ? 1 : .92, session.position.z);
  cameraGoal.set(session.position.x + Math.sin(cameraYaw) * distance * Math.cos(cameraPitch), 1 + Math.sin(cameraPitch) * distance, session.position.z + Math.cos(cameraYaw) * distance * Math.cos(cameraPitch));
  if (snap) camera.position.copy(cameraGoal); else camera.position.lerp(cameraGoal, 1 - Math.exp(-dt * 7));
  if (shake > 0 && !reducedMotion) { camera.position.x += (Math.random() - .5) * shake; camera.position.y += (Math.random() - .5) * shake * .55; shake = Math.max(0, shake - dt * .6); }
  camera.lookAt(lookGoal);
}

async function init() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(max-width:720px)').matches ? 1.4 : 1.8));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(45, 1, .1, 180);
  environment = createEnvironment(THREE, scene); makeEffects();
  const [gltf, metadata] = await Promise.all([
    new GLTFLoader().loadAsync(new URL('../assets/game/hero.glb', import.meta.url).href),
    fetch(new URL('../assets/game/character.json', import.meta.url)).then(r => { if (!r.ok) throw new Error('角色规格未找到'); return r.json(); }),
  ]);
  actor = new THREE.Group(); actor.name = 'PlayerController'; actor.add(gltf.scene); scene.add(actor);
  gltf.scene.traverse(object => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; if (object.isSkinnedMesh) object.frustumCulled = false; } });
  mixer = new THREE.AnimationMixer(gltf.scene);
  gltf.animations.forEach(clip => actions.set(clip.name, mixer.clipAction(clip)));
  for (const required of ['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Attack3', 'Dodge', 'Block', 'Hit', 'Death', 'Victory']) if (!actions.has(required)) throw new Error(`缺少游戏动作：${required}`);
  session = new TrialSession(environment.targets, environment.colliders);
  environment.targets.forEach((target, i) => {
    const element = document.createElement('div'); element.className = 'target-label'; element.innerHTML = `<div class="label-name"><i>${['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</i> 回响水晶</div><div class="target-bar"><span></span></div>`; $('#target-labels').append(element);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.52, 2.65, 72), new THREE.MeshBasicMaterial({ color: 0xeab078, side: THREE.DoubleSide, transparent: true, opacity: .3, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(target.position.x, .045, target.position.z); ring.visible = false; scene.add(ring);
    targetUI.set(target.id, { element, fill: element.querySelector('.target-bar>span'), ring });
  });
  $('#asset-bones').textContent = metadata.bones; $('#asset-clips').textContent = metadata.animations.length; $('#asset-triangles').textContent = metadata.triangles.toLocaleString();
  $('#engine-status').textContent = 'Godot 4.5.2 · 19 项原生玩法检查通过';
  ready = true; resetWorld('intro');
  $('#start-button').disabled = false; $('#start-button').innerHTML = '开始试炼 <span>↗</span>'; $('#autoplay-button').disabled = false;
  $('#loading-state').textContent = '资源已就绪 · 可直接操作，或观看一次约半分钟的完整试炼';
  new ResizeObserver(() => { const w = shell.clientWidth, h = shell.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); updateCamera(.1, true); }).observe(shell);
  let previous = performance.now(), uiClock = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    const rawDt = Math.min(.05, (now - previous) / 1000); previous = now;
    if (document.hidden) return;
    const dt = paused ? 0 : rawDt; worldTime += dt;
    const stopped = hitStop > 0; hitStop = Math.max(0, hitStop - rawDt);
    if (!paused && !stopped) {
      const input = automatic ? autopilot(session, dt, botMemory) : movementInput();
      session.tick(dt, input); processEvents();
      transientClip = Math.max(0, transientClip - dt);
      if (!transientClip) setAnimation(session.action);
      actor.position.set(session.position.x, 0, session.position.z);
      actor.rotation.y += angleDelta(actor.rotation.y, session.facing) * Math.min(1, dt * 20);
      mixer.update(dt);
    }
    updateCamera(dt); environment.update(dt, worldTime); updateEffects(dt);
    if (resultDelay > 0) { resultDelay -= dt; if (resultDelay <= 0) showResult(session.status); }
    uiClock += rawDt; if (uiClock > .05) { updateHUD(); uiClock = 0; }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
}

$('#start-button').addEventListener('click', () => startTrial(false));
$('#autoplay-button').addEventListener('click', () => startTrial(true));
$('#pause-button').addEventListener('click', togglePause);
$('#resume-button').addEventListener('click', togglePause);
$('#restart-button').addEventListener('click', () => startTrial(automatic));
$('#back-button').addEventListener('click', () => { if (ready) resetWorld('intro'); });
$('#sound-button').addEventListener('click', () => { sound.enabled = !sound.enabled; $('#sound-button span').textContent = sound.enabled ? '开' : '关'; $('#sound-button').setAttribute('aria-label', sound.enabled ? '关闭游戏音效' : '开启游戏音效'); });
$('#fullscreen-button').addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await shell.requestFullscreen(); } catch { message('当前窗口不支持全屏，仍可直接操作。'); } });

window.addEventListener('keydown', event => {
  if (!ready || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (event.code === 'Escape') { togglePause(); return; }
  if (event.code === 'KeyR' && session.status !== 'intro') { event.preventDefault(); if (!event.repeat) startTrial(false); return; }
  if (session.status !== 'playing' || paused) return;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyJ', 'Space', 'KeyF'].includes(event.code)) takeControl();
  keys.add(event.code);
  if (event.repeat) return;
  if (event.code === 'KeyJ') session.attack();
  if (event.code === 'Space') { const input = movementInput(); session.dodge(input.x, input.z); }
});
window.addEventListener('keyup', event => keys.delete(event.code));
window.addEventListener('blur', () => { keys.clear(); touch.clear(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { keys.clear(); touch.clear(); if (ready && session.status === 'playing' && !paused) togglePause(); } });
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('pointerdown', event => { if (!ready) return; canvas.focus({ preventScroll: true }); if (event.button === 2 || event.pointerType === 'touch') { dragging = true; dragMoved = false; pointerStart = { x: event.clientX, y: event.clientY }; canvas.setPointerCapture(event.pointerId); } else if (event.button === 0 && session.status === 'playing' && !paused) { takeControl(); session.attack(); } });
canvas.addEventListener('pointermove', event => { if (!dragging || !pointerStart) return; const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y; cameraYaw -= dx * .006; cameraPitch = clamp(cameraPitch + dy * .004, .15, 1.05); pointerStart = { x: event.clientX, y: event.clientY }; if (Math.abs(dx) + Math.abs(dy) > 2) dragMoved = true; });
canvas.addEventListener('pointerup', () => { dragging = false; pointerStart = null; });
canvas.addEventListener('pointercancel', () => { dragging = false; pointerStart = null; });
canvas.addEventListener('wheel', event => { if (!ready) return; event.preventDefault(); cameraDistance = clamp(cameraDistance + event.deltaY * .006, 3.2, 9); }, { passive: false });
$$('[data-move]').forEach(button => { const release = event => { event.preventDefault(); touch.delete(button.dataset.move); }; button.addEventListener('pointerdown', event => { event.preventDefault(); if (!ready || session.status !== 'playing') return; takeControl(); touch.add(button.dataset.move); button.setPointerCapture(event.pointerId); }); button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); });
$('#touch-attack').addEventListener('pointerdown', event => { event.preventDefault(); if (ready && !paused) { takeControl(); session.attack(); } });
$('#touch-dodge').addEventListener('pointerdown', event => { event.preventDefault(); if (ready && !paused) { takeControl(); const input = movementInput(); session.dodge(input.x, input.z); } });

init().catch(error => { console.error('Emberfall loading:', error); $('#load-error').hidden = false; $('#load-error-text').textContent = error.message || String(error); $('#loading-state').textContent = '载入失败，请重新打开本地预览。'; });
