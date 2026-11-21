import { BEACON, CHAPTERS, TUNING, UPGRADES } from './content.js';
import { createState, chooseUpgrade, checkpoint, restoreCheckpoint, clearMotion, distance, stats, step } from './campaign.js';
import * as world from './scene.js';
import { connectAudio, playAssetSound, soundMetrics, beginCapture, endCapture } from './audio-bank.js';

const $ = id => document.getElementById(id);
const canvas = $('world');
const query = new URLSearchParams(location.search);
const preview = query.has('preview');
const SAVE_KEY = 'tidelight.campaign.v1';
const SETTINGS_KEY = 'tidelight.settings.v1';
const RECORD_KEY = 'tidelight.record.v1';
const defaults = { sound: true, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, quality: 'auto', feel: 'full' };
function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
let saveAvailable = true;
function writeStorage(key, value) {
  if (preview) return;
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { saveAvailable = false; notice('浏览器无法保存 · 本次仍可继续航程'); }
}
const storedSettings = readStorage(SETTINGS_KEY);
const settings = { ...defaults };
if (storedSettings && typeof storedSettings === 'object') {
  for (const key of ['sound', 'reduced']) if (typeof storedSettings[key] === 'boolean') settings[key] = storedSettings[key];
  if (['auto', 'standard', 'low'].includes(storedSettings.quality)) settings.quality = storedSettings.quality;
  if (['full', 'basic'].includes(storedSettings.feel)) settings.feel = storedSettings.feel;
}
let saved = restoreCheckpoint(readStorage(SAVE_KEY));
let state = createState();
let entry = checkpoint(state);
let accumulator = 0;
let hitPause = 0;
let noticeRemaining = 0;
let previousTime = performance.now();
let lastClock = -1;
let lastPhase = '';
let joystickPointer = null;
let audio;
let audioOutput;
let voices = 0;
let nextMusic = 0;
let fps = 60;
let sampleDuration = 0;
let sampleFrames = 0;
const keys = new Set();
const pending = { attack: false, dash: false, interact: false, pulse: false };
const touch = { x: 0, y: 0, attack: false };
let gamepadPrevious = [];
let gamepadMenuClock = 0;
let actionInputTime = 0;
const renderSubmissionSamples = [];

function unlockAudio() {
  if (!settings.sound) return;
  try {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      audioOutput = connectAudio(audio);
    }
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { settings.sound = false; applySettings(); }
}
function tone(frequency, duration = 0.12, type = 'sine', volume = 0.055, end = frequency * 0.6) {
  if (!settings.sound || !audio || audio.state !== 'running' || voices >= 14) return;
  const oscillator = audio.createOscillator(), gain = audio.createGain(), now = audio.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain); gain.connect(audioOutput); voices++;
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voices--; };
  oscillator.start(now); oscillator.stop(now + duration);
}
function notice(text) {
  $('notice').textContent = text;
  $('notice').classList.add('visible');
  noticeRemaining = 3.2;
}
function clearInput() {
  keys.clear();
  touch.x = 0; touch.y = 0; touch.attack = false;
  joystickPointer = null;
  for (const action of Object.keys(pending)) pending[action] = false;
  for (const id of ['joystick', 'attack', 'dash']) {
    const element = $(id);
    element.classList.remove('pressed');
  }
  $('stick').style.transform = '';
  accumulator = 0;
}
function enterChapter(next, showBriefing = true) {
  clearInput(); world.clearEffects(); hitPause = 0;
  state = next;
  entry = checkpoint(state);
  state.phase = showBriefing ? 'briefing' : 'playing';
  saved = restoreCheckpoint(entry);
  writeStorage(SAVE_KEY, entry);
  refresh();
  if (!showBriefing) { canvas.focus(); notice(CHAPTERS[state.chapter].lesson); }
}
function startPlay() {
  state.phase = 'playing'; clearInput(); refresh(); canvas.focus();
  notice(CHAPTERS[state.chapter].lesson);
}
function retry() { enterChapter(restoreCheckpoint(entry) || createState(), true); }
function togglePause() {
  if (!['playing', 'paused'].includes(state.phase) || $('settings').open) return;
  state.phase = state.phase === 'playing' ? 'paused' : 'playing';
  clearInput(); clearMotion(state); refresh();
  if (state.phase === 'playing') canvas.focus();
}
function applySettings() {
  world.setEffects(settings.feel === 'full', settings.reduced);
  world.setQuality(settings.quality);
  $('audio').setAttribute('aria-pressed', String(settings.sound));
  $('audio').setAttribute('aria-label', settings.sound ? '关闭声音' : '开启声音');
  $('audio').innerHTML = settings.sound ? '♫<span>声音开</span>' : '♪<span>声音关</span>';
  $('sound-setting').checked = settings.sound;
  $('motion-setting').checked = settings.reduced;
  $('quality-setting').value = settings.quality;
  $('feel-setting').value = settings.feel;
}
function openSettings() {
  if (state.phase === 'playing') togglePause();
  clearInput();
  $('settings').showModal();
  $('sound-setting').focus();
}
function closeSettings() {
  settings.sound = $('sound-setting').checked;
  settings.reduced = $('motion-setting').checked;
  settings.quality = $('quality-setting').value;
  settings.feel = $('feel-setting').value;
  applySettings(); unlockAudio(); writeStorage(SETTINGS_KEY, settings);
  $('settings').close();
  if (state.phase === 'playing') canvas.focus(); else $('primary').focus();
}
function updateHud() {
  const level = CHAPTERS[state.chapter];
  const attributes = stats(state.upgrades);
  $('chapter-label').textContent = `${level.name} · 第${['一', '二', '三'][state.chapter]}章${preview ? ' · 场景预览' : ''}`;
  $('hearts').innerHTML = Array.from({ length: attributes.maxHealth }, (_, i) => `<span class="${i < state.player.hp ? '' : 'heart-empty'}">♥</span>`).join(' ');
  $('hearts').setAttribute('aria-label', `生命值 ${state.player.hp} / ${attributes.maxHealth}`);
  $('score').textContent = state.score;
  $('shards').innerHTML = Array.from({ length: level.cores }, (_, i) => `<i class="${i < state.cores ? 'on' : ''}"></i>`).join('');
  $('objective-text').textContent = state.cores === level.cores ? '灯芯已齐 · 回到信标旁按 E' : `夺回灯芯 ${state.cores} / ${level.cores}`;
  $('gear-list').textContent = state.upgrades.length ? state.upgrades.map(id => UPGRADES[id].name).join(' · ') : '修复信标后，可选择航程装备';
  const boss = state.enemies.find(enemy => enemy.type === 'boss');
  $('boss-hud').hidden = !boss || boss.hp <= 0 || ['ready', 'briefing'].includes(state.phase);
  if (boss) {
    $('boss-health').style.width = `${boss.hp / boss.maxHp * 100}%`;
    $('boss-phase').textContent = boss.phase === 2 ? '狂潮 · 第二阶段' : '守潮 · 第一阶段';
    $('boss-hint').textContent = boss.phase === 2 ? '连续突进两次，结束后反击' : '观察蓄力，避开突进与弹幕';
  }
}
function refresh() {
  updateHud();
  document.body.dataset.state = state.phase;
  const phase = state.phase;
  $('overlay').hidden = phase === 'playing';
  $('overlay').dataset.state = phase;
  $('pause').disabled = !['playing', 'paused'].includes(phase);
  $('pause').setAttribute('aria-label', phase === 'paused' ? '继续游戏' : '暂停游戏');
  $('pause').innerHTML = phase === 'paused' ? '▷<span>继续</span>' : 'Ⅱ<span>暂停</span>';
  $('mission').hidden = phase !== 'ready';
  $('route').hidden = !['ready', 'briefing', 'upgrade'].includes(phase);
  [...$('route').querySelectorAll('span')].forEach((element, i) => { element.className = i < state.chapter ? 'done' : i === state.chapter ? 'current' : ''; });
  $('continue').hidden = phase !== 'ready' || !saved;
  $('continue').textContent = saved ? `继续 · ${CHAPTERS[saved.chapter].name}` : '继续航程';
  $('secondary').hidden = phase !== 'paused';
  $('secondary').textContent = '重试本关';
  $('primary').hidden = phase === 'upgrade';
  $('upgrade-options').hidden = phase !== 'upgrade';
  $('results').hidden = phase !== 'won';
  const level = CHAPTERS[state.chapter];
  const menus = {
    ready: ['三座信标，一段归途', '海港<span>守灯人</span>', '穿过暮港与雾礁，挑战风暴中的守潮巨蟹。<br>用你带回的灯芯，点亮回家的路。', '开启新航程', 'J 挥击，空格冲刺，Q 释放潮汐共鸣。命中可补充共鸣能量。'],
    briefing: [`第${['一', '二', '三'][state.chapter]}章 · ${level.subtitle}`, level.name, level.story, '踏上这段旅程', level.lesson],
    paused: ['海风还在，你可以歇一会', '航程暂停', `${level.name}的潮汐与敌人都在等待。<br>航程装备与本关进度已保留。`, '继续守灯', 'P / Esc 继续。重试会回到本关起点。'],
    lost: ['潮汐会再退去，灯也会再亮', '再试一次', state.failure === 'health' ? '守灯人耗尽了体力。<br>留意预警，在敌人收招时反击。' : '潮汐已经到达信标。<br>灯芯集齐后，记得回到灯塔按 E。', '从本关重试', `保留已获得的装备 · 返回${level.name}检查点`],
    upgrade: [`${level.name}的信标已亮起`, '带一份光前行', '体力已恢复，选一件装备带往下一章。<br>你的选择将改变接下来的战斗。', '', `下一站 · ${CHAPTERS[Math.min(2, state.chapter + 1)].name}`],
    won: ['今晚，每一艘船都有了归途', '海港亮了', '暮港、雾礁与风暴灯塔依次亮起。<br>你为海上的人，留住了回家的路。', '再守一程', `三章航程完成 · ${saveAvailable ? '检查点与最佳纪录已保存在此浏览器' : '本次浏览器未能保存纪录'}`],
  };
  const menu = menus[phase];
  if (menu) {
    const [eyebrow, title, copy, primary, hint] = menu;
    $('menu-eyebrow').textContent = eyebrow; $('menu-title').innerHTML = title;
    $('menu-copy').innerHTML = copy; $('primary').textContent = primary; $('menu-hint').textContent = hint;
  }
  if (phase === 'upgrade') {
    $('upgrade-options').innerHTML = Object.values(UPGRADES).map(item => `<button class="upgrade-choice" data-upgrade="${item.id}"><span class="glyph">${item.glyph}</span><b>${item.name}</b><span>${item.description}</span><small>${item.detail}</small></button>`).join('');
  }
  if (phase === 'won') {
    $('results').innerHTML = `<div><b>${state.score}</b><span>航程得分</span></div><div><b>${Math.round(state.totals.elapsed)} 秒</b><span>累计行动时间</span></div><div><b>${state.totals.damage}</b><span>受伤次数</span></div>`;
  }
  if (lastPhase !== phase && phase !== 'playing') {
    [...$('overlay').querySelectorAll('button:not([hidden])')].find(element => element.getClientRects().length)?.focus({ preventScroll: true });
  }
  lastPhase = phase;
}
function handleEvent(event) {
  world.emit(event);
  const full = settings.feel === 'full';
  const audible = full || ['damage','guard','warning','pulse','pickup','chapter-clear','won'].includes(event.type);
  playAssetSound(event.type, event.x, settings.sound && audible);
  if (event.type === 'hit' || event.type === 'defeat') {
    if (full) hitPause = TUNING.hitPause;
    if (event.type === 'defeat') notice('机械装置已停机 · 靠近金色灯芯拾取');
  }
  if (event.type === 'damage') notice('受到了攻击 · 观察预警，冲刺避开');
  if (event.type === 'pickup') notice(state.cores === CHAPTERS[state.chapter].cores ? '灯芯已齐 · 回到信标旁按 E' : `灯芯 ${state.cores} / ${CHAPTERS[state.chapter].cores}`);
  if (event.type === 'pulse') notice(`潮汐共鸣 · 命中 ${event.targets} 个目标，驱散 ${event.cleared} 枚弹丸`);
  if (event.type === 'guard') notice('甲壳挡住了挥击 · 用 Q 破甲，或等收招后反击');
  if (event.type === 'boss-phase') notice('守潮巨蟹进入狂潮 · Q 可破甲，冲刺避开连击');
  if (['won', 'chapter-clear'].includes(event.type)) {
    clearInput();
    if (event.type === 'won') {
      const record = readStorage(RECORD_KEY);
      if (!record || !Number.isFinite(record.score) || state.score > record.score) writeStorage(RECORD_KEY, { score: state.score, elapsed: state.totals.elapsed });
    }
  }
  if (event.type === 'lost') { tone(180, 0.6, 'triangle', 0.06, 45); clearInput(); }
}
function primaryAction() {
  unlockAudio();
  if (state.phase === 'ready' || state.phase === 'won') enterChapter(createState());
  else if (state.phase === 'briefing') startPlay();
  else if (state.phase === 'paused') togglePause();
  else if (state.phase === 'lost') retry();
}
$('primary').onclick = primaryAction;
$('continue').onclick = () => { unlockAudio(); if (saved) enterChapter(restoreCheckpoint(checkpoint(saved))); };
$('secondary').onclick = retry;
$('restart').onclick = () => { unlockAudio(); if (state.phase === 'ready') enterChapter(createState()); else retry(); };
$('pause').onclick = togglePause;
$('ignite').onclick = () => { unlockAudio(); pending.interact = true; canvas.focus(); };
$('pulse-button').onclick = () => { if (state.phase === 'playing') { unlockAudio(); pending.pulse = true; canvas.focus(); } };
$('upgrade-options').onclick = event => {
  const button = event.target.closest('[data-upgrade]');
  if (!button) return;
  const next = chooseUpgrade(state, button.dataset.upgrade);
  if (next) { tone(640, 0.2, 'sine', 0.06, 960); enterChapter(next); }
};
$('audio').onclick = () => { settings.sound = !settings.sound; applySettings(); unlockAudio(); writeStorage(SETTINGS_KEY, settings); if (state.phase === 'playing') canvas.focus(); };
$('settings-open').onclick = openSettings;
$('menu-settings').onclick = openSettings;
$('settings-close').onclick = closeSettings;
$('settings').addEventListener('cancel', event => { event.preventDefault(); closeSettings(); });

window.addEventListener('keydown', event => {
  if ($('settings').open) return;
  if (event.code === 'Tab' && state.phase !== 'playing') {
    const controls = [...$('overlay').querySelectorAll('button:not([hidden]),a[href]')].filter(element => element.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    return;
  }
  if (state.phase !== 'playing' && event.target.closest?.('button,a') && ['Space', 'Enter'].includes(event.code)) return;
  if (!['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyJ','KeyQ','Space','KeyE','KeyP','Escape','KeyR'].includes(event.code)) return;
  event.preventDefault(); unlockAudio();
  if (event.repeat && !['KeyW','KeyA','KeyS','KeyD','KeyJ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.code)) return;
  keys.add(event.code);
  if (!event.repeat && ['KeyP','Escape'].includes(event.code)) togglePause();
  if (!event.repeat && event.code === 'KeyR' && state.phase === 'playing') retry();
  if (state.phase !== 'playing') return;
  if (event.code === 'KeyJ') pending.attack = true;
  if (!event.repeat && event.code === 'KeyQ') pending.pulse = true;
  if (!event.repeat && event.code === 'Space') pending.dash = true;
  if (event.code === 'KeyE') pending.interact = true;
});
window.addEventListener('keyup', event => keys.delete(event.code));
if (query.has('qa')) window.addEventListener('keydown', event => {
  if (event.code === 'KeyJ' && !event.repeat && state.phase === 'playing' && state.player.cooldown === 0) actionInputTime = performance.now();
});
canvas.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' && event.button === 0 && state.phase === 'playing') { unlockAudio(); pending.attack = true; canvas.focus(); }
});
window.addEventListener('blur', () => { if (state.phase === 'playing' && !$('settings').open) togglePause(); clearInput(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state.phase === 'playing') togglePause(); clearInput(); });
canvas.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  if (state.phase === 'playing') togglePause();
  notice('画面连接已暂停，正在等待浏览器恢复');
});
canvas.addEventListener('webglcontextrestored', () => { world.restore(); if (state.phase !== 'ready') notice('画面已恢复，准备好后继续航程'); else $('notice').classList.remove('visible'); });
function joystickMove(event) {
  if (event.pointerId !== joystickPointer) return;
  const rect = $('joystick').getBoundingClientRect();
  const dx = event.clientX - rect.left - rect.width / 2, dy = event.clientY - rect.top - rect.height / 2;
  const scale = Math.max(34, Math.hypot(dx, dy));
  touch.x = dx / scale; touch.y = dy / scale;
  $('stick').style.transform = `translate(${touch.x * 30}px,${touch.y * 30}px)`;
}
$('joystick').addEventListener('pointerdown', event => {
  if (joystickPointer !== null || state.phase !== 'playing') return;
  unlockAudio(); joystickPointer = event.pointerId;
  $('joystick').setPointerCapture(event.pointerId); joystickMove(event);
});
$('joystick').addEventListener('pointermove', joystickMove);
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('joystick').addEventListener(type, event => {
  if (event.pointerId === joystickPointer) { joystickPointer = null; touch.x = 0; touch.y = 0; $('stick').style.transform = ''; }
});
for (const action of ['attack', 'dash']) {
  const button = $(action);
  button.addEventListener('pointerdown', event => {
    event.preventDefault(); unlockAudio();
    if (state.phase !== 'playing') return;
    button.setPointerCapture(event.pointerId); button.classList.add('pressed'); pending[action] = true;
    if (action === 'attack') touch.attack = true;
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, () => { button.classList.remove('pressed'); if (action === 'attack') touch.attack = false; });
}
function gamepadInput() {
  const pad = navigator.getGamepads?.()[0];
  if (!pad) { gamepadPrevious = []; return { x: 0, y: 0 }; }
  const buttons = pad.buttons.map(button => button.pressed);
  const pressed = index => buttons[index] && !gamepadPrevious[index];
  if ($('settings').open || state.phase !== 'playing') {
    const scope = $('settings').open ? $('settings') : $('overlay');
    const controls = [...scope.querySelectorAll('button,input,select,a')].filter(element => element.getClientRects().length);
    if (performance.now() > gamepadMenuClock && (pad.axes[1] > 0.6 || pad.axes[1] < -0.6 || pressed(12) || pressed(13))) {
      const direction = pad.axes[1] < -0.6 || pressed(12) ? -1 : 1;
      const index = controls.indexOf(document.activeElement);
      controls[(index + direction + controls.length) % controls.length]?.focus();
      gamepadMenuClock = performance.now() + 230;
    }
    if (pressed(0)) document.activeElement?.click();
    if (pressed(1) && $('settings').open) closeSettings();
  } else {
    if (pressed(9)) togglePause();
    if (buttons[0]) pending.attack = true;
    if (pressed(1)) pending.dash = true;
    if (pressed(2)) pending.interact = true;
    if (pressed(3)) pending.pulse = true;
  }
  gamepadPrevious = buttons;
  return { x: Math.abs(pad.axes[0]) > 0.18 ? pad.axes[0] : 0, y: Math.abs(pad.axes[1]) > 0.18 ? pad.axes[1] : 0 };
}
function input(pad) {
  return { x: Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft')) + touch.x + pad.x,
    y: Number(keys.has('KeyS') || keys.has('ArrowDown')) - Number(keys.has('KeyW') || keys.has('ArrowUp')) + touch.y + pad.y,
    attack: pending.attack || keys.has('KeyJ') || touch.attack, dash: pending.dash, interact: pending.interact, pulse: pending.pulse };
}
function frame(now) {
  const rawDt = Math.max(0, (now - previousTime) / 1000);
  const dt = Math.min(0.15, rawDt);
  previousTime = now;
  sampleDuration += rawDt; sampleFrames++;
  if (sampleDuration > 1) { fps = Math.round(sampleFrames / sampleDuration); sampleDuration = 0; sampleFrames = 0; world.adaptQuality(fps); }
  const pad = gamepadInput();
  if (state.phase === 'playing') {
    if (noticeRemaining > 0) { noticeRemaining -= dt; if (noticeRemaining <= 0) $('notice').classList.remove('visible'); }
    const frozen = hitPause > 0;
    hitPause = Math.max(0, hitPause - dt);
    if (!frozen) {
      accumulator += dt;
      while (accumulator >= TUNING.step && state.phase === 'playing') {
        step(state, input(pad), TUNING.step);
        pending.attack = false; pending.dash = false; pending.interact = false; pending.pulse = false;
        accumulator -= TUNING.step;
        for (const event of state.events) handleEvent(event);
        if (state.events.length) updateHud();
        if (hitPause > 0) { accumulator = 0; break; }
      }
    }
    if (audio && settings.sound && audio.currentTime > nextMusic) {
      const root = [196, 174.61, 220][state.chapter];
      tone(root, 3.2, 'sine', 0.012, root);
      tone(root * 1.5, 3, 'sine', 0.009, root * 1.5);
      nextMusic = audio.currentTime + 5;
    }
  }
  if (lastPhase !== state.phase) refresh();
  const clock = Math.ceil(state.time);
  if (clock !== lastClock) { $('clock').textContent = clock; lastClock = clock; }
  const ready = state.cores === CHAPTERS[state.chapter].cores && distance(state.player, BEACON) < 2.25;
  $('interact').hidden = state.phase !== 'playing' || !ready;
  const remaining = state.player.dashCooldown;
  $('dash-fill').style.width = `${Math.max(0, 1 - remaining / stats(state.upgrades).dashCooldown) * 100}%`;
  $('dash-ready').textContent = remaining > 0 ? `${remaining.toFixed(1)}s` : '就绪';
  $('dash').style.opacity = remaining > 0 ? '0.55' : '1';
  $('pulse-fill').style.width = `${state.player.energy}%`;
  $('pulse-energy').textContent = state.player.energy >= 100 ? '已就绪' : `${state.player.energy}%`;
  $('pulse-button').disabled = state.phase !== 'playing' || state.player.energy < 100;
  $('pulse-button').classList.toggle('charged', state.player.energy >= 100);
  world.render(state, state.phase === 'paused' ? 0 : dt);
  if (actionInputTime && state.player.attack > 0) {
    renderSubmissionSamples.push(performance.now() - actionInputTime);
    actionInputTime = 0;
  }
  requestAnimationFrame(frame);
}
if (preview) {
  const chapter = Math.min(2, Math.max(0, Number(query.get('chapter')) || 0));
  state = createState(chapter, { upgrades: Array.from({ length: chapter }, () => 'edge') });
  entry = checkpoint(state); state.phase = 'briefing';
}
applySettings(); refresh(); requestAnimationFrame(frame);
if (query.has('qa')) {
  window.__qa = {
    snapshot: () => structuredClone({ ...state, fps, ...world.metrics(), settings, saveAvailable, touch, renderSubmissionSamples, audioState: audio?.state || 'locked', voices, soundBank: soundMetrics() }),
    beginAudioCapture() { unlockAudio(); beginCapture(); },
    endAudioCapture: endCapture,
    fixture(name, chapter = 0) {
      enterChapter(createState(chapter, { upgrades: Array.from({ length: chapter }, () => 'edge') }), false);
      if (name === 'low-health') { state.player.hp = 1; state.enemies[0].x = state.player.x; state.enemies[0].z = state.player.z; state.enemies[0].mode = 'charge'; state.enemies[0].timer = 0.5; state.enemies[0].vx = 0; state.enemies[0].vz = 0; }
      if (name === 'timeout') state.time = 0.02;
      if (name === 'beacon') { state.cores = CHAPTERS[chapter].cores; state.enemies.forEach(enemy => { enemy.hp = 0; }); state.player.x = 0; state.player.z = -3.2; }
      if (name === 'combat') { state.enemies.slice(1).forEach(enemy => { enemy.hp = 0; }); state.player.x = state.enemies[0].x; state.player.z = state.enemies[0].z + 0.5; state.enemies[0].timer = 10; }
      if (name === 'boss-phase') state.enemies[0].hp = 15;
      if (name === 'idle') state.enemies.forEach(enemy => { enemy.timer = 999; });
      updateHud();
    },
  };
}
