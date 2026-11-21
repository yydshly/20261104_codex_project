import { rescueHeroes, heroSceneUrl, readHeroSelection, setHeroSelection } from './hero-catalog.js';
import './rescue.css';
import { BREAK_TIME, CATCH_TIME, RESCUE_DURATION, SPEED_SLOW_START, createRescueStage } from './rescue-stage.js';
import { SPEED_DROPS } from './rescue-speed.js';
import { GIANT_GROW, GIANT_CATCH, GIANT_CARRY, GIANT_SETDOWN, GIANT_LAND } from './rescue-giant.js';
import { MIRROR_WINDOW_TIME, MIRROR_SAFE_TIMES } from './rescue-mirror.js';
import { WIND_GATHER, WIND_CATCH, WIND_STEER, WIND_LAND } from './rescue-wind.js';
import { SHIELD_DEPLOY, SHIELD_CATCH, SHIELD_LOWER, SHIELD_LAND } from './rescue-shield.js';
import { REWIND_ARM, REWIND_START, REWIND_REPAIR, REWIND_SAFE } from './rescue-rewind.js';
import { GROVE_GROW, GROVE_CATCH, GROVE_LOWER, GROVE_LAND } from './rescue-grove.js';
import { JOINT_EVAC_START, JOINT_EVAC_END, JOINT_LOWER_START, JOINT_LAND, jointDuration, jointFrame, jointTime } from './rescue-joint.js';

const phasesByHero = {
  gravity: [
      [CATCH_TIME, '悬停', '念力托住车厢', '车厢被拉住，仍在半空来回摇摆。'],
      [5.02, '下放', '车厢缓慢下降', '车身逐渐回正，落向下方的街道。'],
      [8.63, '完成', '缆车安全落地', '念力场消散，车厢停在高架下方。'],
  ],
  ice: [
      [CATCH_TIME, '接车', '冰轨接住缆车', '晶体在车厢前方继续生长。'],
      [5.36, '改道', '缆车沿冰轨滑行', '冰轨弯向街边，把下坠转成向前滑行。'],
      [8.04, '完成', '缆车滑至路面', '车厢停稳，弧形冰轨留在原地。'],
  ],
  portal: [
      [CATCH_TIME, '开门', '两道空间门开启', '一道门接住下坠轨迹，另一道门贴近街面。'],
      [4.15, '穿越', '车厢穿过空间门', '车头在出口出现，车尾从入口穿过。'],
      [7.8, '完成', '缆车驶离落点', '两道门关闭，车厢在街面停稳。'],
  ],
  web: [
      [2.68, '发射', '蛛丝射向车厢和楼体', '丝线从手腕射出，车厢两侧也固定到楼体。'],
      [CATCH_TIME, '拉住', '蛛丝绷紧，缆车回弹', '牵星压低身体，鞋底在街面向后滑。'],
      [5.26, '下放', '沿蛛丝下放车厢', '牵星放松手腕，缆车缓缓下降。'],
      [8.68, '完成', '车厢落稳，蛛丝松垂', '车厢回到街面，蛛丝逐渐卸力。'],
  ],
  speed: [
      [SPEED_SLOW_START, '极速视角', '坠落在眼前慢了下来', '缆车、火花和碎片按较慢的速度运动。'],
      [3.34, '疏散', '疾弧逐个转移乘客', '疾弧从侧窗抱出乘客，送到安全区。'],
      [SPEED_DROPS.at(-1), '完成', '乘客全部抵达安全区', '疾弧放下最后一人，街景逐渐恢复原速。'],
  ],
  giant: [
      [GIANT_GROW, '巨化', '砾擎在坠落点下方巨化', '岩甲展开，砾擎赶到缆车下方。'],
      [GIANT_CATCH, '接车', '砾擎双手接住车厢', '双膝缓冲下坠的重量，街面扬起尘土。'],
      [GIANT_CARRY, '转移', '砾擎把车厢搬离车道', '车厢由双手托住，随砾擎的步伐向街边移动。'],
      [GIANT_SETDOWN, '下放', '砾擎俯身下放车厢', '车厢缓缓落向街边。'],
      [GIANT_LAND, '完成', '整辆缆车在街边落稳', '乘客留在车厢内，砾擎松手退开。'],
  ],
  mirror: [
      [2.52, '分身', '映阵分出三道镜像', '三道分身从不同位置赶向车厢侧窗。'],
      [MIRROR_WINDOW_TIME, '疏散', '三道分身并行接人', '每道分身负责一扇窗，把一名乘客带离车厢。'],
      [4.10, '落车', '乘客已离开坠落的车厢', '空车落到街面，分身继续把乘客送入安全区。'],
      [MIRROR_SAFE_TIMES.at(-1), '完成', '三名乘客全部抵达安全区', '车厢留在街面，三道分身逐渐收回。'],
  ],
  wind: [
      [WIND_GATHER, '起风', '回岚汇聚横风', '风带沿街道弯曲，纸屑被卷向同一方向。'],
      [WIND_CATCH, '减速', '风场缓冲下坠', '下方气流托住车身，缆车逐渐减速。'],
      [WIND_STEER, '改道', '缆车沿风带滑翔改道', '车身侧倾转向，越过路缘向街边滑行。'],
      [WIND_LAND, '完成', '缆车在街边平稳落地', '风势减弱，车道恢复通行。'],
  ],
  shield: [
      [SHIELD_DEPLOY, '展开', '界棱在落点展开光盾', '六边形盾面铺在车厢下方。'],
      [SHIELD_CATCH, '接车', '光盾接住车厢并卸力', '冲击沿盾面向外扩散，车厢停在半空。'],
      [SHIELD_LOWER, '下放', '界棱用光盾缓缓下放', '承重盾面下降，街面两侧形成隔离屏障。'],
      [SHIELD_LAND, '完成', '车厢落地，光盾隔开街面', '车厢留在原落点，警戒屏障仍然亮着。'],
  ],
  rewind: [
      [REWIND_ARM, '锁定', '时缝锁定坠落轨迹', '时环在车厢旁展开，标出它刚刚经过的位置。'],
      [REWIND_START, '回溯', '缆车沿坠落轨迹倒升', '飞散的火花退回断点，两段缆索向彼此靠拢。'],
      [REWIND_REPAIR, '接索', '断开的缆索重新接合', '车厢回到事故前的位置，重新挂上缆索。'],
      [REWIND_SAFE, '完成', '车厢锁定在安全时刻', '复位后的车厢停在高架缆索上。'],
  ],
  grove: [
      [GROVE_GROW, '生长', '根珀催生街面的枝条', '枝条从路面升起，在车厢下方交错成藤架。'],
      [GROVE_CATCH, '接车', '藤架弯曲，接住车厢', '枝条向下让出一段距离，缓冲车厢的冲击。'],
      [GROVE_LOWER, '下放', '枝条逐节降低车厢', '藤架保持承重，车厢沿枝条回到街面。'],
      [GROVE_LAND, '完成', '车厢落稳，藤架留在现场', '枝条卸力后留在街面，围出车厢的落点。'],
  ],
};
const roster = rescueHeroes.map(hero => ({ ...hero, phases: phasesByHero[hero.id] }));

const jointCast = '牵星 × 疾弧';
const jointPhases = [
  [2.68, '锚定', '牵星发射蛛丝', '蛛丝在楼体和车厢之间拉出支点。'],
  [CATCH_TIME, '稳车', '牵星稳住缆车', '等车厢摆幅变小，疾弧才靠近侧窗。'],
  [JOINT_EVAC_START, '疏散', '疾弧逐一抱出乘客', '三道光迹掠过绷紧的蛛丝，通向街边安全区。'],
  [JOINT_EVAC_END, '确认', '三名乘客安全撤离', '疾弧确认车厢已经清空，牵星准备放下空车。'],
  [JOINT_LOWER_START, '下放', '牵星缓缓放下空车', '蛛丝仍托着车厢，车身向街面缓缓下降。'],
  [JOINT_LAND, '完成', '乘客平安，空车落稳', '三名乘客已经抵达安全区，蛛丝开始松垂。'],
];

const byId = id => document.getElementById(id);
const viewport = byId('rescue-viewport');
const rosterPanel = byId('rescue-roster');
const playButton = byId('play-rescue');
const progress = byId('rescue-progress');
const followButton = byId('camera-follow');
const fixedButton = byId('camera-locked');
const freeButton = byId('camera-free');
const rescueViewButton = byId('view-rescue');
const observeViewButton = byId('view-observe');
const jointViewButton = byId('view-joint');
const previewButton = byId('show-ability');
const resetCamera = byId('reset-camera');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cameraButtons = { follow: followButton, fixed: fixedButton, free: freeButton };
const cameraLabels = { follow: '镜头 01 / 跟拍', fixed: '镜头 02 / 固定机位', free: '镜头 03 / 自由视角' };
const perspectiveButtons = { street: byId('perspective-street'), speed: byId('perspective-speed') };
const soloPlayback = { elapsed: 0, cameraMode: 'follow' };
const jointPlayback = { elapsed: 0, cameraMode: 'follow', perspective: 'street' };

const requestedHero = readHeroSelection();
let selected = roster.find(({ id }) => id === requestedHero) ?? roster[0];
let navigationHero = requestedHero ?? selected.id;
let playing = false;
let view = 'rescue';
let frameId = 0;
let previewId = 0;
let previousFrame = 0;
let lastPhaseKey = '';
let stage;

try {
  stage = createRescueStage(viewport);
} catch (error) {
  console.error(error);
  const notice = document.createElement('div');
  notice.className = 'rescue-error';
  notice.textContent = '无法启动三维演出。请在支持 WebGL 2 的浏览器中打开。';
  viewport.replaceChildren(notice);
  for (const control of [playButton, progress, ...Object.values(cameraButtons), observeViewButton, jointViewButton]) control.disabled = true;
}

const cards = roster.map((hero, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'responder';
  card.disabled = !stage;
  card.style.setProperty('--responder-color', hero.color);
  card.innerHTML = `<span><small>${String(index + 1).padStart(2, '0')} / ${hero.className}</small><strong>${hero.name}</strong>
    <span class="responder-detail">${hero.description}</span></span>
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.45" aria-hidden="true">${hero.glyph}</svg>`;
  card.addEventListener('click', () => {
    setPlaying(false);
    cancelAnimationFrame(previewId);
    selected = hero;
    navigationHero = hero.id;
    setHeroSelection(hero.id);
    soloPlayback.elapsed = 0;
    if (view === 'joint') {
      setView('rescue');
    } else {
      updateSelection();
      draw();
      updatePlaybackButton();
    }
    byId('rescue-announcement').textContent = `已选择${hero.name}。`;
    if (view === 'rescue' && !reducedMotion.matches) setPlaying(true);
    if (window.matchMedia('(max-width: 810px)').matches) {
      viewport.parentElement.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
  });
  rosterPanel.append(card);
  return card;
});

function activePlayback() {
  return view === 'joint' ? jointPlayback : soloPlayback;
}

function duration() {
  return view === 'joint' ? jointDuration(jointPlayback.perspective) : RESCUE_DURATION;
}

function updateSelection() {
  cards.forEach((card, index) => card.setAttribute('aria-pressed', String(view !== 'joint' && roster[index] === selected)));
  viewport.parentElement.style.setProperty('--hero-color', view === 'joint' ? '#ffd48a' : selected.color);
  byId('rescue-hub-link').href = heroSceneUrl('index.html', navigationHero);
  byId('rescue-arena-link').href = heroSceneUrl('arena.html', navigationHero);
}

function updatePhase(eventTime, joint) {
  let code = '01 / 进场';
  let title = '缆车驶入港湾街';
  let detail = `救援人员 · ${joint ? jointCast : selected.name}`;
  if (eventTime >= BREAK_TIME) {
    code = '02 / 事故';
    title = '缆索断裂';
    detail = '车厢脱离缆索，正在下坠。';
  }
  for (const [start, phase, phaseTitle, phaseDetail] of joint ? jointPhases : selected.phases) {
    if (eventTime < start) break;
    code = `03 / ${phase}`;
    title = phaseTitle;
    detail = phaseDetail;
  }
  if (joint && eventTime >= JOINT_EVAC_START && eventTime < JOINT_EVAC_END && jointPlayback.perspective === 'speed') {
    detail = '蛛丝缓慢振动，碎玻璃在空中翻转，疾弧从侧窗抱出乘客。';
  }
  const key = `${joint ? jointPlayback.perspective : selected.id}:${code}`;
  if (key === lastPhaseKey) return;
  lastPhaseKey = key;
  byId('phase-code').textContent = code;
  byId('phase-title').textContent = title;
  byId('phase-detail').textContent = detail;
}

function draw() {
  if (view === 'observe') {
    stage?.showHero(selected.id);
    byId('phase-code').textContent = '角色档案 / RESPONDER';
    byId('phase-title').textContent = selected.name;
    byId('phase-detail').textContent = `${selected.className} · ${selected.description}`;
    return;
  }
  const { elapsed, cameraMode, perspective } = activePlayback();
  const joint = view === 'joint';
  const total = duration();
  const eventTime = joint ? jointFrame(elapsed, perspective).eventTime : elapsed;
  const status = stage?.draw(joint ? 'joint' : selected.id, elapsed, cameraMode, perspective);
  progress.value = String(elapsed);
  byId('rescue-time').value = `${elapsed.toFixed(1).padStart(4, '0')} / ${total.toFixed(1)}`;
  updatePhase(eventTime, joint);
  const showClock = joint ? eventTime >= JOINT_EVAC_START : selected.id === 'speed' && elapsed >= SPEED_SLOW_START;
  const showMirrorCount = !joint && selected.id === 'mirror' && elapsed >= MIRROR_WINDOW_TIME;
  const showRewindClock = !joint && selected.id === 'rewind' && elapsed >= REWIND_ARM;
  const showCount = showClock || showMirrorCount;
  byId('speed-status').hidden = !status || !(showCount || showRewindClock);
  byId('speed-clock').hidden = !(showClock || showRewindClock);
  byId('speed-count').hidden = !showCount;
  if (status && (showClock || showRewindClock)) {
    const clock = showRewindClock ? `现场时刻 ${status.worldTime.toFixed(2)} 秒` : `世界速度 ×${status.worldRate.toFixed(2)}`;
    if (byId('speed-clock').textContent !== clock) byId('speed-clock').textContent = clock;
  }
  if (status && showCount) {
    const passengerCount = showMirrorCount ? MIRROR_SAFE_TIMES.length : SPEED_DROPS.length;
    const count = `安全转移 ${status.rescued} / ${passengerCount}`;
    if (byId('speed-count').textContent !== count) byId('speed-count').textContent = count;
  }
}

function updatePlaybackButton() {
  const ended = activePlayback().elapsed >= duration();
  byId('play-label').textContent = playing ? '暂停' : ended ? '重播救援' : '播放救援';
  byId('play-symbol').textContent = playing ? 'Ⅱ' : ended ? '↻' : '▶';
}

function setPlaying(value) {
  if (playing === value) return;
  playing = value;
  if (playing) {
    previousFrame = performance.now();
    frameId = requestAnimationFrame(frame);
  } else {
    cancelAnimationFrame(frameId);
  }
  updatePlaybackButton();
}

function frame(now) {
  const delta = Math.min(0.1, (now - previousFrame) / 1000);
  previousFrame = now;
  const playback = activePlayback();
  const total = duration();
  playback.elapsed = Math.min(total, playback.elapsed + delta);
  draw();
  if (playback.elapsed >= total) {
    setPlaying(false);
    byId('rescue-announcement').textContent = `${view === 'joint' ? jointCast : selected.name}救援完成。`;
  } else {
    frameId = requestAnimationFrame(frame);
  }
}

function updateViewControls() {
  const observing = view === 'observe';
  const joint = view === 'joint';
  const { cameraMode } = activePlayback();
  const interactive = observing || cameraMode === 'free';
  rescueViewButton.setAttribute('aria-pressed', String(view === 'rescue'));
  observeViewButton.setAttribute('aria-pressed', String(observing));
  jointViewButton.setAttribute('aria-pressed', String(joint));
  for (const [mode, button] of Object.entries(cameraButtons)) button.setAttribute('aria-pressed', String(mode === cameraMode));
  byId('joint-context').hidden = !joint;
  if (joint) {
    const { perspective } = jointPlayback;
    for (const [name, button] of Object.entries(perspectiveButtons)) button.setAttribute('aria-pressed', String(name === perspective));
    byId('perspective-note').textContent = cameraMode === 'follow'
      ? perspective === 'street' ? '从街边观察救援全程。' : '跟随疾弧，看清每次折返。'
      : '时间轴随视角切换。';
  }
  progress.max = String(duration());
  byId('field-screen').dataset.interactive = String(interactive);
  byId('field-screen').setAttribute('aria-label', observing ? '三维角色观察区' : '三维救援现场');
  byId('camera-switch').hidden = observing;
  byId('camera-help').hidden = !interactive;
  byId('camera-help').textContent = !observing && matchMedia('(pointer: fine)').matches
    ? '拖动旋转 · 滚轮缩放 · 右键平移'
    : '拖动旋转 · 滚轮或双指缩放';
  byId('camera-caption').textContent = observing ? '角色观察 / INSPECT' : cameraLabels[cameraMode];
  byId('playback').hidden = observing;
  byId('observation-tools').hidden = !observing;
  byId('observation-note').textContent = '转动镜头，近距离查看造型和动作。';
  byId('roster-note').textContent = observing ? '选择要观察的角色' : joint ? '选择角色，查看单人救援' : '切换角色，从同一时刻重放';
  if (observing) byId('speed-status').hidden = true;
}

function setView(nextView) {
  if (view === nextView) return;
  setPlaying(false);
  cancelAnimationFrame(previewId);
  view = nextView;
  lastPhaseKey = '';
  updateSelection();
  updateViewControls();
  updatePlaybackButton();
  draw();
}

function setCamera(mode) {
  activePlayback().cameraMode = mode;
  updateViewControls();
  draw();
}

function setPerspective(perspective) {
  if (jointPlayback.perspective === perspective) return;
  const { eventTime } = jointFrame(jointPlayback.elapsed, jointPlayback.perspective);
  jointPlayback.perspective = perspective;
  jointPlayback.elapsed = jointTime(eventTime, perspective);
  updateViewControls();
  updatePlaybackButton();
  draw();
  if (playing) previousFrame = performance.now();
}

function previewAbility() {
  cancelAnimationFrame(previewId);
  const start = performance.now();
  function animate(now) {
    const time = (now - start) / 1000;
    if (time >= 2.2) {
      stage.showHero(selected.id);
      return;
    }
    stage.showHero(selected.id, time);
    previewId = requestAnimationFrame(animate);
  }
  previewId = requestAnimationFrame(animate);
}

playButton.addEventListener('click', () => {
  const playback = activePlayback();
  if (playback.elapsed >= duration()) {
    playback.elapsed = 0;
    draw();
  }
  setPlaying(!playing);
});
progress.addEventListener('input', () => {
  setPlaying(false);
  activePlayback().elapsed = Number(progress.value);
  draw();
  updatePlaybackButton();
});
for (const [mode, button] of Object.entries(cameraButtons)) button.addEventListener('click', () => setCamera(mode));
for (const [perspective, button] of Object.entries(perspectiveButtons)) button.addEventListener('click', () => setPerspective(perspective));
rescueViewButton.addEventListener('click', () => setView('rescue'));
observeViewButton.addEventListener('click', () => setView('observe'));
jointViewButton.addEventListener('click', () => setView('joint'));
previewButton.addEventListener('click', previewAbility);
resetCamera.addEventListener('click', () => {
  cancelAnimationFrame(previewId);
  stage.showHero(selected.id, 0, true);
});
updateSelection();
updateViewControls();
draw();
