import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { createEnvironment } from './game-environment.js';
import { WarlordSession, ATTACKS, SKILLS, autopilot } from './warlord-logic.js';
import { createWarlordFX } from './warlord-fx.js';
import { createHeroReflections } from './warlord-lighting.js';
import { createCombatBenchmark } from './warlord-benchmark.js';
import { loadGeometryLODs, attachGeometryLOD } from './warlord-lod.js';
import { createWarlordSecondary } from './warlord-secondary.js';
import { createBattleRecorder } from './warlord-recorder.js';
import { showcaseControls } from './warlord-demo.js';

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const canvas = $('#game-canvas'), shell = $('#game');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const keys = new Set(), touch = new Set(), botMemory = {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
let renderer, scene, camera, closeCamera, battleCamera, detailCamera, environment, session, hero, fx, metadata, reflections;
let ready = false, paused = false, automatic = false, showcase = true, portraitMode = false, aimingSkill = null, moveTarget = null;
let worldTime = 0, hitStop = 0, shake = 0, hurt = 0, resultDelay = 0, zoom = 4.1, closeCombat = false, playbackRate = 1;
let aimActive = false, aimPoint = new THREE.Vector3(0, 0, -3.3), dragging = false;
let lodLookup = new Map(), quality = 'balanced', recordingIntro = 0;
const enemies = new Map(), cameraPosition = new THREE.Vector3(), cameraLook = new THREE.Vector3(), projected = new THREE.Vector3();
const ray = new THREE.Raycaster(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2();
const impactColor = new THREE.Color('#ffb378'), noEmission = new THREE.Color(0);
const labels = { Idle: '持戟待阵', Walk: '重甲行进', Run: '持戟奔袭', Attack1: '一式 · 劈戟', Attack2: '二式 · 斜扫', Attack3: '三式 · 震退', Cleave: '破阵横扫', GuardCast: '铁壁护身', Leap: '坠星裂地', Dodge: '侧步闪避', Hit: '受击', Death: '败阵', Victory: '破阵归戟' };
const aliases = { Cleave: ['Cleave', 'Sweep'], GuardCast: ['GuardCast', 'Guard'], Leap: ['Leap', 'LeapSlam'], Dodge: ['Dodge', 'Run'], Victory: ['Victory', 'Idle'] };
const canonicalDurations = { Attack1: .72, Attack2: .82, Attack3: 1, Cleave: 1.08, GuardCast: .32, Leap: 1.28, Dodge: .4, Hit: .45, Death: 1.1, Victory: 1.5 };

class HeavySound {
  constructor() { this.context = null; this.enabled = true; this.output=null; }
  async start() { try { this.context ||= new (window.AudioContext || window.webkitAudioContext)(); if(!this.output){this.output=this.context.createGain();this.output.connect(this.context.destination);} await this.context.resume(); } catch {} }
  tone(f, end, length, gain = .06, type = 'sine') {
    if (!this.context || !this.enabled) return;
    const c = this.context, t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type;
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + length);
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + length); o.connect(g).connect(this.output); o.start(); o.stop(t + length + .01);
  }
  noise(length, gain, frequency) {
    if (!this.context || !this.enabled) return;
    const c = this.context, count = Math.ceil(c.sampleRate * length), b = c.createBuffer(1, count, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < count; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / count) ** 2;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; f.type = 'lowpass'; f.frequency.value = frequency; g.gain.value = gain; s.connect(f).connect(g).connect(this.output); s.start();
  }
  play(type, heavy = false) {
    if (type === 'swing') { this.noise(heavy ? .3 : .18, .12, 1500); this.tone(170, 45, .2, .035, 'triangle'); }
    if (type === 'hit') { this.noise(.12, .15, 2800); this.tone(95, 30, .2, heavy ? .13 : .08); this.tone(900, 450, .15, .025, 'triangle'); }
    if (type === 'slam') { this.noise(.55, .18, 900); this.tone(105, 23, .6, .16); this.tone(260, 55, .35, .04, 'triangle'); }
    if (type === 'shield') { this.tone(270, 640, .35, .035, 'triangle'); this.tone(680, 900, .45, .025); }
    if (type === 'shieldHit') { this.tone(540, 240, .3, .06, 'triangle'); this.noise(.1, .07, 4000); }
    if (type === 'damage') { this.tone(100, 30, .22, .07); this.noise(.14, .08, 600); }
    if (type === 'dodge') this.noise(.22, .07, 700);
    if (type === 'leap') this.tone(90, 330, .55, .035, 'triangle');
    if (type === 'won') [220, 330, 440, 660].forEach((f, i) => setTimeout(() => this.tone(f, f * .99, .8, .035, 'triangle'), i * 100));
  }
}
const sound = new HeavySound();
const benchmark = createCombatBenchmark({ reportElement: $('#benchmark-report'), statusElement: $('#benchmark-status'), button: $('#benchmark-button'), getRenderer: () => renderer });
const recording = createBattleRecorder(canvas,{link:$('#record-download'),button:$('#record-button')});

function buildActor(model, clips, isEnemy = false) {
  const node = new THREE.Group(); node.name = isEnemy ? 'GuardActor' : 'Chixiao'; node.rotation.order = 'YXZ'; node.add(model); scene.add(node);
  const materialState = [], clonedMaterials = new Map(); let sharedSkeleton=null;
  model.traverse(object => {
    if (!object.isMesh) return;
    if(object.isSkinnedMesh) {
      if(!sharedSkeleton) sharedSkeleton=object.skeleton;
      else if(object.skeleton.bones.length===sharedSkeleton.bones.length && object.skeleton.bones.every((bone,i)=>bone===sharedSkeleton.bones[i] && object.skeleton.boneInverses[i].elements.every((v,j)=>Math.abs(v-sharedSkeleton.boneInverses[i].elements[j])<1e-7))) object.skeleton=sharedSkeleton;
    }
    object.castShadow = true; object.receiveShadow = true; object.frustumCulled = false;
    const materials = (Array.isArray(object.material) ? object.material : [object.material]).map(original => {
      if (clonedMaterials.has(original)) return clonedMaterials.get(original);
      const material = original.clone();
      if (isEnemy) {
        if (/ClothRed|Red|Plume/i.test(material.name)) material.color.set('#3c4d5c');
        else if (/ArmorGold|Gold/i.test(material.name)) material.color.set('#65717b');
        else material.color.multiplyScalar(.72);
      }
      materialState.push({ material, color: material.color.clone(), emissive: material.emissive?.clone(), intensity: material.emissiveIntensity || 0 });
      clonedMaterials.set(original,material);
      return material;
    });
    object.material = Array.isArray(object.material) ? materials : materials[0];
    if (isEnemy && /Plume|Pennant|CrestRibbon/i.test(object.name)) object.visible = false;
  });
  const mixer = new THREE.AnimationMixer(model), actions = new Map(clips.map(clip => [clip.name, mixer.clipAction(clip)]));
  return { node, model, mixer, actions, current: null, name: '', materials: materialState, lastState: '', hitFlash: 0, lod: attachGeometryLOD(model,lodLookup), secondary:createWarlordSecondary(THREE,node), lastMotionPosition:null };
}
function clipFor(actor, name) {
  const candidates = aliases[name] || [name];
  return candidates.find(candidate => actor.actions.has(candidate)) || (actor.actions.has('Idle') ? 'Idle' : [...actor.actions.keys()][0]);
}
function animateActor(actor, name, dt, manualTime = null, durationOverride = null) {
  const speed=dt>0 && actor.lastMotionPosition ? Math.hypot(actor.node.position.x-actor.lastMotionPosition.x,actor.node.position.z-actor.lastMotionPosition.z)/dt : name==='Run'?4.6:name==='Walk'?3.1:0;
  actor.lastMotionPosition ||= new THREE.Vector3(); actor.lastMotionPosition.copy(actor.node.position);
  if (name==='Walk' || name==='Run') name=speed>2?'Run':'Walk';
  actor.secondary.prepare?.();
  const mapped = clipFor(actor, name), action = actor.actions.get(mapped);
  if (!action) return;
  if (actor.name !== name) {
    action.reset().setEffectiveWeight(1);
    const loop = ['Idle', 'Walk', 'Run'].includes(name);
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1); action.clampWhenFinished = !loop;
    const duration = durationOverride || canonicalDurations[name]; action.setEffectiveTimeScale(duration && !loop ? action.getClip().duration / duration : 1);
    if (actor.current && actor.current !== action) actor.current.fadeOut(name === 'Hit' ? .06 : .1);
    action.fadeIn(actor.current ? .09 : 0).play(); actor.current = action; actor.name = name;
  }
  if (['Walk','Run'].includes(name)) action.setEffectiveTimeScale(clamp(speed/(name==='Run'?3.28921:1.37822),.15,1.8));
  if (manualTime !== null) { actor.mixer.update(dt); action.time = Math.min(action.getClip().duration - .001, Math.max(0, manualTime * action.getClip().duration / .72)); actor.mixer.update(0); }
  else actor.mixer.update(dt);
}
function resetActor(actor) { actor.secondary.prepare?.(); actor.secondary.reset(); actor.lastMotionPosition=null; actor.mixer.stopAllAction(); actor.current = null; actor.name = ''; actor.hitFlash = 0; actor.node.visible = true; actor.node.rotation.set(0, 0, 0); actor.materials.forEach(m => { if(m.material.transparent){m.material.transparent=false;m.material.needsUpdate=true;} m.material.opacity = 1; m.material.depthWrite = true; }); }
function showMessage(text) { $('#game-message').textContent = text; }
function timeText(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${(seconds % 60).toFixed(1).padStart(4, '0')}`; }

function resetWorld(status = 'playing', auto = false) {
  session.reset(status); automatic = auto; paused = false; aimingSkill = null; moveTarget = null; aimActive = false;
  playbackRate = benchmark.active ? 1 : auto ? .75 : 1; $('#speed-button').textContent = `速度 ${playbackRate}×`;
  worldTime = 0; hitStop = shake = hurt = resultDelay = 0; Object.keys(botMemory).forEach(key => delete botMemory[key]); keys.clear(); touch.clear();
  fx.reset(); resetActor(hero); enemies.forEach(data => { resetActor(data.actor); data.element.hidden = status === 'intro'; data.displayHealth = 140; data.lastState = ''; });
  showcase = status === 'intro'; portraitMode = false; closeCombat = auto; camera = showcase ? closeCamera : closeCombat ? detailCamera : battleCamera;
  hero.node.position.set(0, 0, 3); hero.node.rotation.y = showcase ? 0 : Math.PI;
  animateActor(hero, 'Idle', 0);
  $('#intro').hidden = status !== 'intro'; $('#intro-side').hidden = status !== 'intro'; $('#hud').hidden = status === 'intro'; $('#overlay').hidden = true;
  $('#pause-button').disabled = status === 'intro'; $('#view-button').disabled = false; $('#view-button').textContent = showcase ? '脸部细节' : closeCombat ? '切换俯视' : '近景战斗';
  $('#mode-label').textContent = auto ? '技能连段演示 · 移动键可接管' : '自由演武 · 鼠标瞄准'; $('#combo-value').textContent = '01';
  showMessage('横扫命中获得强化，开盾顶住反击，指定落点跳劈击飞。'); updateCamera(.1, true); updateHUD();
  if (status === 'intro') requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
async function begin(auto = false) {
  if (!ready) return; if(recording.active)recording.stop(); await sound.start(); resetWorld('playing', auto); canvas.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
function result(kind) {
  if(kind!=='pause')recording.stop();
  const pause = kind === 'pause', won = kind === 'won'; $('#overlay').hidden = false;
  $('#result-eyebrow').textContent = pause ? 'HOLD THE LINE' : won ? 'FORMATION BROKEN' : 'RISE AGAIN'; $('#result-mark').textContent = pause ? 'Ⅱ' : '戟';
  $('#result-title').textContent = pause ? '暂歇归阵' : won ? '破阵' : '再战';
  $('#result-copy').textContent = pause ? '横扫开路，护盾承伤，跳劈入阵。' : won ? '三名戍卫已败，重戟归阵。' : '守卫蓄力时可以走出范围，也可以用护盾承伤、横扫打断。';
  $('#result-stats').hidden = pause;
  if (!pause) $('#result-stats').innerHTML = `<div><strong>${timeText(session.time)}</strong><span>战斗用时</span></div><div><strong>${session.hits}</strong><span>有效命中</span></div><div><strong>${Math.round(session.shieldAbsorbed)}</strong><span>护盾承伤</span></div><div><strong>${Math.ceil(session.health)}</strong><span>剩余生命</span></div>`;
  $('#resume-button').hidden = !pause; $('#restart-button').hidden = pause;
}
function togglePause() { if (!ready || session.status !== 'playing') return; if(benchmark.active)benchmark.abort('演武已暂停'); paused = !paused; keys.clear(); touch.clear(); aimingSkill = null; if (paused) result('pause'); else { $('#overlay').hidden = true; canvas.focus({ preventScroll: true }); } }
function takeControl() { if (automatic) { if(benchmark.active)benchmark.abort('已手动接管'); automatic = false; $('#mode-label').textContent = '自由演武 · 已接管'; showMessage('WASD 移动，鼠标瞄准，Q 横扫 / E 护盾 / R 跳劈。'); } }
function input() {
  let f = (keys.has('KeyW') || keys.has('ArrowUp') || touch.has('up') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') || touch.has('down') ? 1 : 0);
  let r = (keys.has('KeyD') || keys.has('ArrowRight') || touch.has('right') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') || touch.has('left') ? 1 : 0);
  const yaw = closeCombat ? .76 : .63;
  let x = -Math.sin(yaw) * f + Math.cos(yaw) * r, z = -Math.cos(yaw) * f - Math.sin(yaw) * r;
  if (f || r) moveTarget = null;
  if (!f && !r && moveTarget) { const dx = moveTarget.x - session.position.x, dz = moveTarget.z - session.position.z; if (Math.hypot(dx, dz) < .18) moveTarget = null; else { x = dx; z = dz; } }
  return { x, z, sprint: keys.has('ShiftLeft') || keys.has('ShiftRight'), guard: keys.has('KeyF'), ...(aimActive ? { aimX: aimPoint.x, aimZ: aimPoint.z } : {}) };
}
function skill(key) {
  if (!ready || paused || session.status !== 'playing') return;
  takeControl(); const point = aimActive ? { x: aimPoint.x, z: aimPoint.z } : null;
  if (!session.skill(key, point)) showMessage(session.cooldowns[key] > 0 ? `招式尚在调息：${session.cooldowns[key].toFixed(1)} 秒。` : '当前动作尚未收势，稍候衔接下一招。');
  aimingSkill = null;
}
function dodge() { if (!ready || paused) return; takeControl(); const movement = input(); session.dodge(movement.x, movement.z); }
function pointerAim(event) {
  if (!ready) return;
  const rect = canvas.getBoundingClientRect(); ndc.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); ray.setFromCamera(ndc, camera);
  const point = ray.ray.intersectPlane(ground, new THREE.Vector3());
  if (point) { aimPoint.copy(point); aimActive = true; }
}

function events() {
  for (const event of session.drainEvents()) {
    fx.event(event, session);
    if (event.type === 'attack') $('#combo-value').textContent = String(event.combo + 1).padStart(2, '0');
    if (event.type === 'swing') sound.play('swing', event.action === 'Cleave');
    if (event.type === 'hit') { const data = enemies.get(event.id); if (data) data.actor.hitFlash = .18; hitStop = Math.max(hitStop, event.critical ? .075 : .045); if (!reduced) shake = Math.max(shake, event.critical ? .13 : .07); sound.play('hit', event.critical); showMessage(event.action === 'Cleave' ? '横扫命中！戟势已强化，普攻伤害与命中回复提升。' : event.action === 'Leap' ? '重戟砸落，守卫击飞。战域内站稳再接横扫。' : '戟刃命中。衔接下一式，或用技能打断守卫的蓄力。'); }
    if (event.type === 'skillStart' && event.skill === 'E') { sound.play('shield'); showMessage(`铁壁护身：${event.shield} 护盾，可继续移动和攻击。`); }
    if (event.type === 'skillStart' && event.skill === 'R') sound.play('leap');
    if (event.type === 'slam') { sound.play('slam'); if (!reduced) shake = .24; hitStop = Math.max(hitStop, .09); }
    if (event.type === 'shieldHit') { sound.play('shieldHit'); showMessage(`护盾吸收 ${Math.round(event.amount)} 点伤害，守住阵位。`); }
    if (event.type === 'damage' && event.amount > 0) { sound.play('damage'); hurt = .5; if (!reduced) shake = .10; }
    if (event.type === 'dodge') sound.play('dodge');
    if (event.type === 'won') { resultDelay = 1.4; sound.play('won'); showMessage('三名戍卫已击败，重戟归阵。'); }
    if (event.type === 'lost') resultDelay = 1.1;
  }
}
function updateEnemy(data, enemy, dt) {
  const actor = data.actor;
  actor.node.position.set(enemy.x, enemy.airHeight || 0, enemy.z);
  actor.node.rotation.y += angleDelta(actor.node.rotation.y, enemy.facing) * Math.min(1, dt * 16);
  actor.node.rotation.z = enemy.state === 'Airborne' ? Math.sin(enemy.airTime / Math.max(.01, enemy.airDuration) * Math.PI) * .16 : 0;
  actor.node.rotation.x = enemy.state === 'Airborne' ? -Math.sin(enemy.airTime / Math.max(.01, enemy.airDuration) * Math.PI) * .35 : 0;
  let name = enemy.dead ? 'Death' : enemy.state === 'Run' ? 'Run' : ['Stagger', 'Airborne'].includes(enemy.state) ? 'Hit' : 'Idle';
  let poseTime = null;
  if (['Windup', 'Attack', 'Recover'].includes(enemy.state)) {
    name = 'Attack1'; poseTime = enemy.state === 'Windup' ? enemy.stateTime / enemy.attackWindup * .23 : enemy.state === 'Attack' ? .23 + enemy.stateTime / .16 * .08 : .31 + enemy.stateTime / .60 * .41;
  }
  animateActor(actor, name, dt, poseTime, name === 'Hit' ? Math.max(.25, enemy.staggerTime) : null);
  actor.secondary.update(dt,{action:['Airborne','Stagger','Dead'].includes(enemy.state)?'Airborne':actor.name,actionTime:['Walk','Run'].includes(actor.name)?actor.current.time:poseTime ?? enemy.stateTime,grounded:!['Airborne','Stagger','Dead'].includes(enemy.state)});
  actor.hitFlash = Math.max(0, actor.hitFlash - dt);
  const fade = enemy.dead ? clamp(1 - Math.max(0, session.time + (session.status !== 'playing' ? worldTime - data.endedWorld : 0) - enemy.diedAt - 1.6) / 1.2, 0, 1) : 1;
  actor.materials.forEach(m => {
    const material = m.material;
    if (material.emissive) { material.emissive.copy(m.emissive || noEmission).lerp(impactColor, actor.hitFlash / .18 * .4); material.emissiveIntensity = Math.max(m.intensity, actor.hitFlash / .18 * .22); }
    if (fade < 1) { if(!material.transparent){material.transparent=true;material.needsUpdate=true;} material.opacity = fade; material.depthWrite = fade > .7; }
  });
  actor.node.visible = fade > .01 && session.status !== 'intro';
  data.warning.visible = enemy.state === 'Windup' && !enemy.dead; data.warning.position.set(enemy.x, .045, enemy.z); data.warning.rotation.y = enemy.attackFacing + Math.PI;
  data.warning.material.opacity = .10 + enemy.attackPhase * .45;
  data.element.hidden = enemy.dead || session.status === 'intro';
  data.element.classList.toggle('charging', enemy.state === 'Windup');
  data.fill.style.width = `${enemy.health / enemy.maxHealth * 100}%`;
  projected.set(enemy.x, 2.7 + enemy.airHeight, enemy.z).project(camera);
  if (Math.abs(projected.x) > 1.15 || Math.abs(projected.y) > 1.2 || projected.z > 1) data.element.hidden = true;
  data.element.style.left = `${(projected.x * .5 + .5) * shell.clientWidth}px`; data.element.style.top = `${(-projected.y * .5 + .5) * shell.clientHeight}px`;
  if (session.status === 'playing') data.endedWorld = worldTime;
}
function updateHUD() {
  $('#health-fill').style.width = `${session.health / session.maxHealth * 100}%`; $('#shield-fill').style.width = `${session.shield / Math.max(1, session.shieldMax) * 100}%`; $('#stamina-fill').style.width = `${session.stamina / session.maxStamina * 100}%`;
  $('#health-value').textContent = String(Math.ceil(session.health)); $('#shield-value').textContent = String(Math.ceil(session.shield)); $('#animation-name').textContent = labels[hero?.name || session.action] || session.action;
  $('#mission-count').textContent = `${session.kills} / 3`; $('#mission-time').textContent = timeText(session.time); $$('[data-rune]').forEach((element, i) => element.classList.toggle('complete', session.enemies[i]?.dead));
  $('#buff-label').hidden = session.empoweredTime <= 0 || session.status !== 'playing'; $('#buff-time').textContent = `${session.empoweredTime.toFixed(1)}s`;
  $('#danger-hint').hidden = paused || session.status !== 'playing' || !session.enemies.some(enemy => enemy.state === 'Windup' && !enemy.dead && Math.hypot(enemy.x - session.position.x, enemy.z - session.position.z) < 2.6);
  for (const key of ['Q', 'E', 'R', 'Dodge']) {
    const button = $(`#skill-${key}`), cooldown = button.querySelector('.cooldown'), remaining = session.cooldowns[key] || 0;
    cooldown.hidden = remaining <= .02; cooldown.textContent = remaining > 1 ? String(Math.ceil(remaining)) : remaining.toFixed(1);
    button.classList.toggle('aiming', aimingSkill === key); button.classList.toggle('unavailable', remaining > 0);
  }
}
function updateCamera(dt, snap = false) {
  const aspect = shell.clientWidth / Math.max(1, shell.clientHeight), p = session.position;
  if (showcase) {
    const narrow = aspect < .9, orbit = reduced ? 0 : Math.sin(worldTime * .12) * .08;
    if (portraitMode) {
      cameraPosition.set(p.x + 1.25 * (narrow ? 1.6 : 1), 2.15, p.z + 2.05 * (narrow ? 1.6 : 1));
      cameraLook.set(p.x - (narrow ? 0 : .32), narrow ? 1.5 : 1.82, p.z + .10);
    } else {
      cameraPosition.set(p.x + (4.2 + orbit) * (narrow ? 1.55 : 1), 2.8 * (narrow ? 1.4 : 1), p.z + 5.9 * (narrow ? 1.55 : 1));
      cameraLook.set(p.x - (narrow ? 0 : .85), narrow ? .5 : 1.5, p.z + (narrow ? 0 : .7));
    }
  } else if (closeCombat) {
    const narrow = aspect < .9, leap = session.action === 'Leap';
    const yaw = .82 + (automatic && !reduced ? Math.sin(worldTime * .20) * .10 : 0);
    const distance = (leap ? 9.6 : 7.2) * (narrow ? 1.35 : 1);
    cameraPosition.set(p.x + Math.sin(yaw) * distance, (leap ? 6.5 : 4.6) * (narrow ? 1.15 : 1), p.z + Math.cos(yaw) * distance);
    cameraLook.set(p.x, leap ? .9 : .85, p.z - .75);
  } else {
    cameraPosition.set(p.x + 7.2, 12.6, p.z + 9.8); cameraLook.set(p.x, .7, p.z - .9);
    const targetZoom = session.action === 'Leap' ? 5.6 : zoom, current = battleCamera.top;
    const half = snap ? targetZoom : current + (targetZoom - current) * Math.min(1, dt * 5);
    battleCamera.left = -half * aspect; battleCamera.right = half * aspect; battleCamera.top = half; battleCamera.bottom = -half; battleCamera.updateProjectionMatrix();
  }
  if (snap) camera.position.copy(cameraPosition); else camera.position.lerp(cameraPosition, 1 - Math.exp(-dt * 9));
  if (dt > 0 && shake > 0 && !reduced) { camera.position.x += (Math.random() - .5) * shake; camera.position.z += (Math.random() - .5) * shake; shake = Math.max(0, shake - dt * .8); }
  camera.lookAt(cameraLook);
}

async function init() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = 1.08;
  scene = new THREE.Scene(); closeCamera = new THREE.PerspectiveCamera(35, 1, .1, 180); battleCamera = new THREE.OrthographicCamera(-8, 8, 4.1, -4.1, .1, 180); detailCamera = new THREE.PerspectiveCamera(43, 1, .1, 180); camera = closeCamera;
  environment = createEnvironment(THREE, scene, { theme: 'warlord' });
  environment.targets.forEach(target => { target.group.visible = false; });
  const staticColliders = environment.colliders.filter(collider => !environment.targets.some(target => Math.hypot(collider.x - target.position.x, collider.z - target.position.z) < .05));
  scene.traverse(object => {
    if (object.isHemisphereLight) { object.color.set('#d5dce8'); object.groundColor.set('#3b3037'); object.intensity = 2.2; }
    if (object.isDirectionalLight && object.name === 'Late afternoon key') { object.color.set('#ffe1c6'); object.intensity = 3.4; }
  });
  const heroFill = new THREE.DirectionalLight('#d7e5ff', 1.3); heroFill.position.set(9, 9, 15); scene.add(heroFill);
  reflections = createHeroReflections(THREE, renderer, scene);
  const loader = new GLTFLoader();
  const [gltf, info] = await Promise.all([
    loader.loadAsync(new URL('../assets/warlord/warlord.glb', import.meta.url).href),
    fetch(new URL('../assets/warlord/metadata.json', import.meta.url)).then(r => { if (!r.ok) throw new Error('英雄规格尚未就绪'); return r.json(); }),
  ]);
  metadata = info;
  if (metadata.lods?.length) lodLookup = await loadGeometryLODs(loader,gltf.scene,metadata.lods.map(lod=>new URL(`../assets/warlord/${lod.file}`,import.meta.url).href));
  for (const name of ['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Attack3', 'Hit', 'Death', 'Cleave', 'GuardCast', 'Leap']) if (!gltf.animations.some(clip => (aliases[name] || [name]).includes(clip.name))) throw new Error(`缺少角色核心动作 ${name}`);
  hero = buildActor(gltf.scene, gltf.animations); fx = createWarlordFX(THREE, scene, { floatLayer: $('#floaters') }); if (!fx.attachHero(hero.node)) throw new Error('角色缺少战戟挂点');
  session = new WarlordSession(undefined, staticColliders);
  for (const [i, enemy] of session.enemies.entries()) {
    const actor = buildActor(cloneSkeleton(gltf.scene), gltf.animations, true);
    const element = document.createElement('div'); element.className = 'target-label'; element.innerHTML = `<div class="label-name"><i>${['Ⅰ', 'Ⅱ', 'Ⅲ'][i]}</i> 戍卫</div><div class="target-bar"><span></span></div>`; $('#target-labels').append(element);
    const geometry = new THREE.CircleGeometry(enemy.attackRange, 36, Math.PI / 2 - .9, 1.8); geometry.rotateX(-Math.PI / 2);
    const warning = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xeab269, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false })); warning.visible = false; scene.add(warning);
    enemies.set(enemy.id, { actor, element, fill: element.querySelector('.target-bar>span'), warning, endedWorld: 0, lastState: '' });
  }
  $('#loading-state').textContent='正在预热战斗材质与光照…';
  await renderer.compileAsync(scene,battleCamera);
  const actorMaterials=[...hero.materials,...[...enemies.values()].flatMap(data=>data.actor.materials)].map(m=>m.material);
  actorMaterials.forEach(m=>{m.transparent=true;m.needsUpdate=true;}); await renderer.compileAsync(scene,battleCamera);
  actorMaterials.forEach(m=>{m.transparent=false;m.needsUpdate=true;});
  ready = true; resetWorld('intro'); $('#start-button').disabled = false; $('#start-button').innerHTML = '进入演武 <span>↗</span>'; $('#autoplay-button').disabled = false;
  $('#benchmark-button').disabled = false;
  $('#record-button').disabled = false;
  $('#loading-state').textContent = '英雄已就绪 · 鼠标瞄准，Q 横扫 / E 护盾 / R 定点跳劈';
  new ResizeObserver(() => { const w = shell.clientWidth, h = shell.clientHeight; renderer.setSize(w, h, false); for (const perspective of [closeCamera, detailCamera]) { perspective.aspect = w / h; perspective.updateProjectionMatrix(); } updateCamera(.1, true); }).observe(shell);
  let previous = performance.now(), uiClock = 0;
  function loop(now) {
    requestAnimationFrame(loop); const wallDeltaMs = now - previous, raw = Math.min(.05, wallDeltaMs / 1000); previous = now; if (document.hidden) { benchmark.frame(wallDeltaMs, false); return; }
    const dt = paused ? 0 : raw * playbackRate; worldTime += dt; const stopped = hitStop > 0; hitStop = Math.max(0, hitStop - raw);
    if (!paused && !stopped) {
      const controls = automatic ? (benchmark.active?autopilot:showcaseControls)(session, dt, botMemory) : input(); session.tick(dt, controls); events();
      hero.node.position.set(session.position.x, session.heroHeight, session.position.z); hero.node.rotation.y = session.status === 'intro' ? Math.sin(worldTime * .15) * .06 : hero.node.rotation.y + angleDelta(hero.node.rotation.y, session.facing) * Math.min(1, dt * 22);
      animateActor(hero, session.action, dt);
      hero.secondary.update(dt,{action:hero.name,actionTime:['Walk','Run'].includes(hero.name)?hero.current.time:session.actionTime,grounded:!(session.action==='Leap' && session.actionTime>=.18 && session.actionTime<.92)});
      for (const enemy of session.enemies) updateEnemy(enemies.get(enemy.id), enemy, dt);
    }
    environment.update(dt, worldTime); updateCamera(dt); fx.update(dt, session, { aimPoint: aimActive ? aimPoint : null, aimingSkill, camera, width: shell.clientWidth, height: shell.clientHeight, time: worldTime });
    hero.lod.set(quality==='smooth'?2:showcase?0:quality==='high'?0:1);
    for(const data of enemies.values()) data.actor.lod.set(quality==='smooth'?2:quality==='high'?1:1);
    hurt = Math.max(0, hurt - dt * 1.7); $('#hurt-flash').style.opacity = String(hurt);
    if (resultDelay > 0) { resultDelay -= dt; if (resultDelay <= 0) { if (benchmark.active) { benchmark.round(session.status); resetWorld('playing', true); } else result(session.status); } }
    uiClock += raw; if (uiClock > .04) { updateHUD(); uiClock = 0; }
    renderer.render(scene, camera);
    recording.frame(session,labels[hero.name]||hero.name,$('#floaters'));
    if(recording.active && recordingIntro>0){recordingIntro-=raw;if(recordingIntro<=0)resetWorld('playing',true);}
    benchmark.frame(wallDeltaMs, true);
  }
  requestAnimationFrame(loop);
}

$('#start-button').addEventListener('click', () => begin(false)); $('#autoplay-button').addEventListener('click', () => begin(true));
$('#benchmark-button').addEventListener('click', async () => {
  if (!ready || benchmark.active) return;
  recording.stop();
  await begin(true); sound.enabled = false; playbackRate = 1; $('#speed-button').textContent = '速度 1×';
  benchmark.start({ assetSha256: metadata.sha256, scenario: 'Repeated ordinary autopilot battles, skill FX, AI, deaths and resets; normal simulation speed; visible browser tab.' });
});
$('#record-button').addEventListener('click', async () => { if(!ready||recording.active)return; benchmark.abort('开始实战录像'); await sound.start();sound.enabled=true;resetWorld('intro');portraitMode=true;updateCamera(.1,true);recordingIntro=2.4;try{recording.start(sound.output);}catch(error){recordingIntro=0;showMessage(error.message);} });
$('#pause-button').addEventListener('click', togglePause); $('#resume-button').addEventListener('click', togglePause); $('#restart-button').addEventListener('click', () => begin(automatic)); $('#back-button').addEventListener('click', () => { if (ready) resetWorld('intro'); });
$('#view-button').addEventListener('click', () => {
  if (!ready) return;
  benchmark.abort('切换镜头');
  if (session.status === 'intro') {
    if (showcase && !portraitMode) { portraitMode = true; $('#view-button').textContent = '战斗视角'; }
    else if (showcase) { showcase = false; portraitMode = false; $('#view-button').textContent = '英雄近景'; }
    else { showcase = true; $('#view-button').textContent = '脸部细节'; }
    closeCombat = false; camera = showcase ? closeCamera : battleCamera;
  }
  else { closeCombat = !closeCombat; camera = closeCombat ? detailCamera : battleCamera; $('#view-button').textContent = closeCombat ? '切换俯视' : '近景战斗'; }
  updateCamera(.1, true);
});
$('#sound-button').addEventListener('click', () => { sound.enabled = !sound.enabled; $('#sound-button span').textContent = sound.enabled ? '开' : '关'; $('#sound-button').setAttribute('aria-label', sound.enabled ? '关闭游戏音效' : '开启游戏音效'); });
$('#speed-button').addEventListener('click', () => { benchmark.abort('切换速度'); playbackRate = playbackRate === 1 ? .65 : 1; $('#speed-button').textContent = `速度 ${playbackRate}×`; });
$('#quality-button').addEventListener('click', () => { benchmark.abort('切换画质'); quality = quality==='balanced'?'high':quality==='high'?'smooth':'balanced'; $('#quality-button').textContent = `画质 ${ {balanced:'均衡',high:'精细',smooth:'流畅'}[quality] }`; renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='smooth'?1:quality==='high'?2:1.5)); });
window.addEventListener('resize',()=>benchmark.abort('视口尺寸变更'));
$('#fullscreen-button').addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await shell.requestFullscreen(); } catch { showMessage('当前窗口不支持全屏，可直接继续演武。'); } });
for (const key of ['Q', 'E', 'R']) {
  const button = $(`#skill-${key}`);
  button.addEventListener('click', () => skill(key));
  if (key !== 'E') { button.addEventListener('pointerenter', () => { if (ready && !paused) aimingSkill = key; }); button.addEventListener('pointerleave', () => { if (!keys.has(`Key${key}`) && aimingSkill === key) aimingSkill = null; }); }
}
$('#skill-Dodge').addEventListener('click', dodge); $('#touch-attack').addEventListener('pointerdown', event => { event.preventDefault(); if (ready && !paused) { takeControl(); session.attack(aimActive ? aimPoint : null); } });
$$('[data-move]').forEach(button => { button.addEventListener('pointerdown', event => { event.preventDefault(); if (ready && session.status === 'playing') { takeControl(); touch.add(button.dataset.move); button.setPointerCapture(event.pointerId); } }); for (const type of ['pointerup', 'pointercancel']) button.addEventListener(type, () => touch.delete(button.dataset.move)); });
window.addEventListener('keydown', event => {
  if (!ready || /INPUT|TEXTAREA|SELECT|VIDEO|AUDIO/.test(event.target.tagName)) return;
  if (event.code === 'Escape') { if (aimingSkill) aimingSkill = null; else togglePause(); return; }
  if (event.code === 'KeyT' && session.status !== 'intro') { if (!event.repeat) begin(false); return; }
  if (session.status !== 'playing' || paused) return;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
  keys.add(event.code); if (event.repeat) return;
  if (/^Key[WASDJQERF]$/.test(event.code) || event.code === 'Space') takeControl();
  if (event.code === 'KeyJ') session.attack(aimActive ? aimPoint : null);
  if (event.code === 'KeyE') skill('E');
  if (['KeyQ', 'KeyR'].includes(event.code)) aimingSkill = event.code.slice(-1);
  if (event.code === 'Space') dodge();
});
window.addEventListener('keyup', event => { keys.delete(event.code); if (ready && ['KeyQ', 'KeyR'].includes(event.code) && aimingSkill === event.code.slice(-1)) skill(event.code.slice(-1)); });
window.addEventListener('blur', () => { keys.clear(); touch.clear(); aimingSkill = null; });
document.addEventListener('visibilitychange', () => { if (document.hidden && ready) { keys.clear(); touch.clear(); aimingSkill = null; if (session.status === 'playing' && !paused) togglePause(); } });
canvas.addEventListener('contextmenu', event => event.preventDefault()); canvas.addEventListener('pointermove', pointerAim);
canvas.addEventListener('pointerdown', event => { if (!ready || paused || session.status !== 'playing') return; canvas.focus({ preventScroll: true }); pointerAim(event); takeControl(); if (event.button === 2) { moveTarget = { x: aimPoint.x, z: aimPoint.z }; } else if (event.button === 0) { if (aimingSkill) skill(aimingSkill); else session.attack(aimActive ? aimPoint : null); } });
canvas.addEventListener('wheel', event => { if (!ready || showcase) return; event.preventDefault(); zoom = clamp(zoom + event.deltaY * .004, 3.3, 6.5); }, { passive: false });
init().catch(error => { console.error('Chixiao:', error); $('#load-error').hidden = false; $('#load-error-text').textContent = error.message || String(error); $('#loading-state').textContent = '英雄载入失败，请重新载入。'; });
