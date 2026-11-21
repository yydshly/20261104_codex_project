import './orbit.css';
import './orbit-presentation.js';
import { heroCatalog, heroSceneUrl, orbitHeroIds, readHeroSelection, setHeroSelection } from './hero-catalog.js';
import { makeOrbitBookmark, readOrbitBookmark } from './orbit-bookmark.js';
import { createOrbitStage } from './orbit-stage.js';

const duration = 13;
const chapters = [
  { start: 0, code: 'APPROACH', label: '卫星逼近', title: '失控卫星逼近', detail: '姿态控制失灵，卫星在翻滚中滑向空间站。' },
  { start: 3, code: 'DEPLOY', label: '展开能力' },
  { start: 6, code: 'DIVERT', label: '执行拦截' },
  { start: 10, code: 'CLEAR', label: '脱离险区', title: '卫星飞离空间站', detail: '卫星已进入安全轨道，空间站恢复正常运行。' },
];
const relayPhases = {
  1: { code: 'REWIND', label: '回拨争取时间', title: '时缝让卫星倒退', detail: '时缝展开刻度场，让失控卫星沿来路倒退，为折径争取开门时间。' },
  2: { code: 'HANDOFF', label: '折径接力改道', title: '折径接力打开通道', detail: '折径把卫星引向入口，卫星穿过传送门后从高处飞出。' },
  3: { code: 'CLEAR', label: '接力完成', title: '接力完成，卫星安全飞离', detail: '卫星从高处飞入安全轨道，空间站解除警报。' },
};
const methods = {
  magnet: {
    detail: '以磁力捕获卫星，稳住翻滚，再推离碰撞轨道。',
    phases: [
      { title: '磁极展开磁场', detail: '背后的磁环分节展开，磁力弧线追上正在翻滚的卫星。' },
      { title: '磁力稳住卫星', detail: '磁场压住翻滚，随着磁极改变施力方向，卫星转向开阔轨道。' },
    ],
  },
  web: {
    detail: '把蛛丝锚在空间站外侧，拉住卫星并将它甩向开阔轨道。',
    phases: [
      { title: '牵星射出蛛丝', detail: '蛛丝先固定在空间站外侧，再抓住掠过的卫星。' },
      { title: '绷紧的蛛丝拉偏卫星', detail: '蛛丝拉住卫星并缓冲惯性，牵星借张力将它甩离空间站。' },
    ],
  },
  grove: {
    detail: '在空间站外侧催生藤架，缓冲卫星的冲撞，再把它送往开阔轨道。',
    phases: [
      { title: '根珀催生藤架', detail: '藤蔓从站台向外生长，在卫星的来路上织成托架。' },
      { title: '藤架接住卫星', detail: '藤架弯曲卸力，托着卫星向外缓缓下探，随后将它释放到安全轨道。' },
    ],
  },
  portal: {
    detail: '在卫星来路和空间站上方各开一道传送门，让卫星从高处飞过。',
    phases: [
      { title: '折径开启传送门', detail: '一道门在卫星前方成形，另一道门张开在空间站上方。' },
      { title: '卫星从高处的出口飞出', detail: '卫星穿过入口，立刻在更高的出口出现，沿开阔轨道飞离空间站。' },
    ],
  },
  rewind: {
    detail: '让失控卫星沿来路倒退。姿态恢复后，再让它沿安全轨道飞离。',
    phases: [
      { title: '时缝展开刻度场', detail: '时钟刻度在卫星旁展开，记录它飞过的轨迹。' },
      { title: '卫星沿原轨迹倒退', detail: '翻滚的卫星倒转，散落碎片也沿来路回归。卫星姿态逐渐稳定。' },
      { title: '回溯结束，卫星安全飞离', detail: '卫星恢复稳定姿态，沿新的安全轨道飞离空间站。' },
    ],
  },
};

const byId = id => document.getElementById(id);
const roster = byId('orbit-roster');
const viewport = byId('orbit-viewport');
const screen = byId('orbit-screen');
const playButton = byId('orbit-play');
const slider = byId('orbit-progress');
const resetButton = byId('orbit-reset-camera');
const cameraButtons = [...document.querySelectorAll('.camera-controls [data-camera]')];
const layout = byId('orbit-layout');
const viewer = byId('orbit-viewer');
const playback = byId('orbit-playback');
const shareTools = byId('orbit-share-tools');
const shareButton = byId('orbit-copy-link');
const shareStatus = byId('orbit-share-status');
const shareField = byId('orbit-share-url');
const primaryPane = byId('orbit-primary-pane');
const primaryPaneName = byId('orbit-primary-pane-name');
const primaryPhase = byId('orbit-primary-phase');
const comparePane = byId('orbit-compare-pane');
const compareViewport = byId('orbit-compare-viewport');
const compareButton = byId('orbit-compare-toggle');
const compareSelect = byId('orbit-compare-hero');
const compareStatus = byId('orbit-compare-status');
const relayButton = byId('orbit-relay-toggle');
const relayContext = byId('orbit-relay-context');
const heroes = orbitHeroIds.map(id => heroCatalog.find(hero => hero.id === id));
const relayCast = ['rewind', 'portal'].map(id => heroes.find(entry => entry.id === id));
const bookmark = readOrbitBookmark(window.location.search, orbitHeroIds, duration);
const requestedHero = bookmark.heroId ?? readHeroSelection();
const magnetModel = bookmark.model;
const magnetModelLabel = magnetModel === 'blender-wing' ? '磁翼型' : 'Blender 外观';
const magnetAppearance = byId('orbit-magnet-appearance');
const stageOptions = { onMagnetRig: magnetModel ? loadMagnetAppearance : undefined };

if (magnetModel) {
  magnetAppearance.hidden = false;
  magnetAppearance.textContent = `磁极已选用 ${magnetModelLabel}。`;
  const labLink = byId('orbit-magnet-lab-link');
  labLink.href = `./magnet-lab.html?model=${magnetModel}`;
  labLink.hidden = false;
}

byId('orbit-summary').textContent = `失控卫星逼近空间站。对比 ${heroes.length} 种单人方案，或观看两位英雄接力。`;
byId('orbit-hero-count').textContent = String(heroes.length).padStart(2, '0');

let hero = heroes.find(entry => entry.id === requestedHero) ?? heroes[0];
let navigationHero = requestedHero ?? hero.id;
let compareHero = heroes.find(entry => entry.id === bookmark.compareId && entry !== hero)
  ?? heroes.find(entry => entry !== hero);
let comparing = false;
let compareStage;
let relay = false;
let cameraMode = 'follow';
let stage;
let elapsed = bookmark.time;
let playing = false;
let frameId;
let lastFrame;
let previousPhase = '';

async function loadMagnetAppearance(rig) {
  magnetAppearance.dataset.state = 'loading';
  magnetAppearance.textContent = `正在加载磁极的 ${magnetModelLabel}…`;
  try {
    const { applyBlenderMagnetAppearance } = await import('./magnet-blender.js');
    await applyBlenderMagnetAppearance(rig, magnetModel);
  } catch (error) {
    console.warn('Magnet Blender appearance is unavailable', error);
    magnetAppearance.dataset.state = 'fallback';
    magnetAppearance.textContent = `${magnetModelLabel}未能加载，磁极使用程序化外观。`;
    return;
  }
  magnetAppearance.dataset.state = 'ready';
  magnetAppearance.textContent = `磁极的 ${magnetModelLabel}已加载。`;
  draw();
}

function heroGlyph(entry) {
  return `<svg viewBox="${entry.glyphViewBox}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${entry.glyph}</svg>`;
}

const heroButtons = heroes.map(entry => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.hero = entry.id;
  button.style.setProperty('--choice-color', entry.accent);
  button.innerHTML = `${heroGlyph(entry)}<span></span>`;
  button.querySelector('span').textContent = entry.name;
  button.addEventListener('click', () => {
    if (entry === compareHero) compareHero = hero;
    hero = entry;
    navigationHero = entry.id;
    setHeroSelection(entry.id);
    if (relay) setRelay(false);
    else updateHero();
    syncModeUrl();
    draw();
  });
  roster.append(button);
  return button;
});

const chapterList = byId('orbit-chapters');
const chapterButtons = chapters.map(({ start, label }, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chapter';
  button.dataset.time = start;
  button.disabled = true;
  button.innerHTML = `<span class="chapter-number">${index + 1}</span><span class="chapter-label">${label}</span><span class="chapter-time">00:${String(start).padStart(2, '0')}</span>`;
  button.addEventListener('click', () => seek(start));
  chapterList.append(button);
  return button;
});
const renderControls = [
  playButton, slider, resetButton, compareButton, relayButton, shareButton,
  byId('orbit-presentation-toggle'), ...cameraButtons, ...chapterButtons,
];

function updateHero() {
  document.documentElement.style.setProperty('--active-hero', relay ? relayCast[0].accent : hero.accent);
  roster.setAttribute('aria-label', relay ? '选择英雄并切回单人拦截' : '出场英雄');
  for (const button of heroButtons) button.setAttribute('aria-pressed', String(!relay && button.dataset.hero === hero.id));
  byId('orbit-hero-glyph').innerHTML = relay ? relayCast.map(heroGlyph).join('') : heroGlyph(hero);
  byId('orbit-hero-name').textContent = relay ? relayCast.map(entry => entry.name).join(' × ') : hero.name;
  byId('orbit-hero-detail').textContent = relay
    ? '时缝回拨卫星，给折径争取时间。折径打开传送门，从高处将卫星送离空间站。'
    : methods[hero.id].detail;
  byId('orbit-hub-link').href = byId('orbit-brand-link').href = heroSceneUrl('index.html', navigationHero);
  const arenaUrl = heroSceneUrl('arena.html', hero.id);
  byId('orbit-arena-link').href = magnetModel ? `${arenaUrl}&model=${magnetModel}` : arenaUrl;
  byId('orbit-rescue-link').href = heroSceneUrl('rescue.html', hero.id);
  primaryPaneName.textContent = `A · ${hero.name}`;
  const choices = heroes.filter(entry => entry !== hero);
  compareSelect.replaceChildren(...choices.map(entry => new Option(entry.name, entry.id)));
  updateCompareHero();
}

function updateCompareHero() {
  compareSelect.value = compareHero.id;
  byId('orbit-compare-pane-name').textContent = `B · ${compareHero.name}`;
  comparePane.style.setProperty('--active-hero', compareHero.accent);
}

function syncModeUrl() {
  const url = new URL(window.location.href);
  if (comparing) url.searchParams.set('compare', compareHero.id);
  else url.searchParams.delete('compare');
  if (relay) url.searchParams.set('mission', 'relay');
  else url.searchParams.delete('mission');
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
}

function setComparison(open) {
  comparing = open;
  layout.dataset.comparing = String(open);
  compareButton.setAttribute('aria-pressed', String(open));
  byId('orbit-compare-tools').hidden = !open;
  comparePane.hidden = !open;
  primaryPaneName.hidden = !open;
  if (open) {
    viewer.insertBefore(playback, byId('orbit-panes'));
    primaryPane.append(primaryPhase);
  } else {
    viewer.insertBefore(playback, shareTools);
    byId('orbit-brief').prepend(primaryPhase);
  }
  updateCamera();
}

function setRelay(open) {
  if (relay === open) return;
  if (open && comparing) setComparison(false);
  relay = open;
  layout.dataset.relay = String(open);
  relayButton.setAttribute('aria-pressed', String(open));
  relayContext.hidden = !open;
  chapterButtons.forEach((button, index) => {
    const phase = relay ? relayPhases[index] ?? chapters[index] : chapters[index];
    button.querySelector('.chapter-label').textContent = phase.label;
  });
  updateHero();
}

function showComparisonError() {
  compareStage = undefined;
  setComparison(false);
  syncModeUrl();
  compareButton.disabled = true;
  compareStatus.textContent = '当前设备无法开启第二个三维画面，可继续观看当前回放。';
  compareStatus.hidden = false;
}

function openComparison() {
  setComparison(true);
  try {
    compareStage ??= createOrbitStage(compareViewport, { ...stageOptions, maxPixelRatio: 1 });
    setRelay(false);
    syncModeUrl();
  } catch (error) {
    console.warn('Orbit comparison is unavailable', error);
    showComparisonError();
  }
}

function updateCamera() {
  screen.dataset.camera = cameraMode;
  byId('orbit-camera-hint').hidden = cameraMode !== 'free' || !stage;
  byId('orbit-compare-screen').dataset.camera = cameraMode;
  byId('orbit-compare-camera-hint').hidden = cameraMode !== 'free' || !comparing;
  for (const button of cameraButtons) button.setAttribute('aria-pressed', String(button.dataset.camera === cameraMode));
}

function updatePlayback() {
  const finished = elapsed >= duration;
  byId('orbit-play-label').textContent = playing ? '暂停' : finished ? '重新播放' : '播放回放';
  byId('orbit-play-icon').textContent = playing ? 'Ⅱ' : finished ? '↺' : '▶';
}

function updatePhase() {
  const index = chapters.findLastIndex(chapter => elapsed >= chapter.start);
  const key = `${relay ? 'relay' : hero.id}:${index}:${comparing ? compareHero.id : ''}`;
  if (key === previousPhase) return;
  previousPhase = key;
  const chapter = chapters[index];
  const updateCaption = (prefix, phase) => {
    byId(`${prefix}-code`).textContent = `0${index + 1} / ${phase.code ?? chapter.code}`;
    byId(`${prefix}-title`).textContent = phase.title;
    byId(`${prefix}-detail`).textContent = phase.detail;
  };
  const primary = relay ? relayPhases[index] : methods[hero.id].phases[index - 1];
  updateCaption('orbit-phase', primary ?? chapter);
  if (comparing) updateCaption('orbit-compare-phase', methods[compareHero.id].phases[index - 1] ?? chapter);
  chapterButtons.forEach((button, i) => {
    if (i === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
}

function showRenderError() {
  setPlaying(false);
  if (comparing) setComparison(false);
  stage = undefined;
  byId('orbit-error').hidden = false;
  byId('orbit-camera-hint').hidden = true;
  screen.querySelector('.stage-label').hidden = true;
  for (const control of renderControls) control.disabled = true;
}

function draw() {
  slider.value = elapsed;
  byId('orbit-time').value = `${elapsed.toFixed(2).padStart(5, '0')} / ${duration.toFixed(2)}`;
  updatePhase();
  try {
    stage?.draw({ heroId: hero.id, time: elapsed, cameraMode, mission: relay ? 'relay' : undefined });
  } catch (error) {
    console.warn('Orbit replay could not render', error);
    showRenderError();
  }
  if (comparing) {
    try {
      compareStage?.draw({ heroId: compareHero.id, time: elapsed, cameraMode });
    } catch (error) {
      console.warn('Orbit comparison could not render', error);
      showComparisonError();
    }
  }
}

function tick(now) {
  if (!playing) return;
  if (lastFrame === undefined) lastFrame = now;
  elapsed = Math.min(duration, elapsed + (now - lastFrame) / 1000);
  lastFrame = now;
  draw();
  if (elapsed >= duration) setPlaying(false);
  if (playing) frameId = requestAnimationFrame(tick);
}

function setPlaying(next) {
  playing = next;
  if (frameId !== undefined) cancelAnimationFrame(frameId);
  frameId = undefined;
  lastFrame = undefined;
  updatePlayback();
  if (playing) frameId = requestAnimationFrame(tick);
}

function seek(time) {
  elapsed = time;
  setPlaying(false);
  draw();
}

playButton.addEventListener('click', () => {
  if (playing) {
    setPlaying(false);
    return;
  }
  if (elapsed >= duration) elapsed = 0;
  setPlaying(true);
});
slider.addEventListener('input', () => seek(slider.valueAsNumber));
cameraButtons.forEach(button => button.addEventListener('click', () => {
  cameraMode = button.dataset.camera;
  updateCamera();
  draw();
}));
resetButton.addEventListener('click', () => {
  stage?.resetCamera();
  if (comparing) compareStage?.resetCamera();
  draw();
});
compareButton.addEventListener('click', () => {
  if (comparing) {
    setComparison(false);
    syncModeUrl();
  } else {
    openComparison();
  }
  draw();
});
compareSelect.addEventListener('change', () => {
  compareHero = heroes.find(entry => entry.id === compareSelect.value);
  updateCompareHero();
  syncModeUrl();
  draw();
});
relayButton.addEventListener('click', () => {
  setRelay(!relay);
  syncModeUrl();
  draw();
});
shareButton.addEventListener('click', async () => {
  const time = elapsed;
  const url = makeOrbitBookmark({
    heroId: relay ? navigationHero : hero.id,
    compareId: comparing ? compareHero.id : null,
    time,
    mission: relay ? 'relay' : null,
    model: magnetModel,
  });
  const copiedMessage = `已复制 ${time.toFixed(2)} 秒的回放链接。`;
  try {
    await navigator.clipboard.writeText(url);
    shareField.hidden = true;
    shareStatus.textContent = copiedMessage;
  } catch {
    shareField.value = url;
    shareField.hidden = false;
    shareStatus.textContent = '请手动复制下方选中的链接。';
    shareField.focus();
    shareField.select();
  }
});
viewport.addEventListener('webglcontextlost', showRenderError, { capture: true });
compareViewport.addEventListener('webglcontextlost', showComparisonError, { capture: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) setPlaying(false);
});

updateHero();
try {
  stage = createOrbitStage(viewport, stageOptions);
  for (const control of renderControls) control.disabled = false;
} catch (error) {
  console.warn('Orbit replay is unavailable', error);
  showRenderError();
}
if (stage && bookmark.mission === 'relay') {
  setRelay(true);
  syncModeUrl();
} else if (stage && bookmark.compareId && bookmark.compareId !== hero.id) {
  openComparison();
}
updateCamera();
updatePlayback();
draw();
