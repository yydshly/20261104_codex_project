import './style.css';
import { createArena } from './arena.js';
import { heroCatalog, heroSceneUrl, readHeroSelection, setHeroSelection } from './hero-catalog.js';
import { createCatalogHero, usesPowerPose } from './hero-models.js';

const poweredCombatProfiles = {
  gravity: {
    english: 'GRAVITY ANCHOR', ability: '引力震荡', abilityText: '双手抬起，在中距离释放引力冲击。',
    health: 108, power: 24, speed: 2.08, reach: 2.69, cooldown: 1.34, duration: 0.9, guard: 0.18, kind: 'pulse',
  },
  ice: {
    english: 'FROST', ability: '寒霜推击', abilityText: '压低重心，朝前推出一道冷光。',
    health: 98, power: 21, speed: 2.22, reach: 2.54, cooldown: 1.12, duration: 0.74, guard: 0.16, kind: 'pulse',
  },
  portal: {
    english: 'FOLDGATE', ability: '裂隙冲击', abilityText: '双臂错开蓄力，在中距离打出冲击。',
    health: 95, power: 22, speed: 2.43, reach: 2.83, cooldown: 1.24, duration: 0.8, guard: 0.19, kind: 'pulse',
  },
  web: {
    english: 'STARTHREAD', ability: '绷索反击', abilityText: '后倾稳住双脚，向前打出牵引冲击。',
    health: 98, power: 18, speed: 2.71, reach: 2.32, cooldown: 0.93, duration: 0.71, guard: 0.16, kind: 'pulse',
  },
  speed: {
    english: 'SPEED ARC', ability: '疾弧突袭', abilityText: '压肩加速，以高速步伐切入近身。',
    health: 91, power: 16, speed: 3.78, reach: 1.61, cooldown: 0.64, duration: 0.55, guard: 0.17, kind: 'slash',
  },
  giant: {
    english: 'COLOSSUS', ability: '磐岩推击', abilityText: '双臂前探，把重心压向对手。',
    health: 130, power: 30, speed: 1.82, reach: 1.91, cooldown: 1.55, duration: 0.96, guard: 0.23, kind: 'slash',
  },
  mirror: {
    english: 'MIRROR ARRAY', ability: '镜弧合击', abilityText: '两道分身从侧面切入，与本体交错打出三段攻击。',
    health: 96, power: 19, speed: 2.56, reach: 2.15, cooldown: 0.94, duration: 1.16,
    contact: 0.57, hitTimes: [0.42, 0.57, 0.74], guard: 0.16, kind: 'slash',
  },
  wind: {
    english: 'WINDWAKE', ability: '回旋风压', abilityText: '展开双翼，在中距离打出风压。',
    health: 94, power: 19, speed: 2.60, reach: 2.93, cooldown: 1.05, duration: 0.77, guard: 0.14, kind: 'pulse',
  },
  shield: {
    english: 'AEGIS', ability: '光盾撞击', abilityText: '点亮盾面并前推，近身格挡能力强。',
    health: 120, power: 21, speed: 2.09, reach: 1.81, cooldown: 1.25, duration: 0.82, guard: 0.34, kind: 'slash',
  },
  rewind: {
    english: 'TIMESTITCH', ability: '时环震波', abilityText: '背后刻盘加速旋转，打出一圈震波。',
    health: 96, power: 23, speed: 2.14, reach: 2.74, cooldown: 1.39, duration: 0.88, guard: 0.2, kind: 'pulse',
  },
  grove: {
    english: 'GROVEHEART', ability: '根系震荡', abilityText: '低身抬手，把能量送向对手脚下。',
    health: 111, power: 24, speed: 2.0, reach: 2.5, cooldown: 1.31, duration: 0.87, guard: 0.21, kind: 'pulse',
  },
  magnet: {
    english: 'MAGNET', ability: '双极磁环', abilityText: '张开背后的磁环，向对手推送一束电磁冲击。',
    health: 104, power: 22, speed: 2.18, reach: 2.85, cooldown: 1.23, duration: 0.83, guard: 0.19, kind: 'pulse',
  },
};

const roster = [
  ...heroCatalog.filter(hero => hero.group === 'species'),
  ...heroCatalog.filter(hero => hero.group === 'powered').map(hero => ({ ...hero, contact: 0.55, ...poweredCombatProfiles[hero.id] })),
];

const byId = id => document.getElementById(id);
const viewport = byId('viewport');
const rosterPanel = byId('roster');
const stats = byId('stats');
const startButton = byId('action-button');
const inspectButton = byId('inspect-toggle');
const rivalSelect = byId('rival-select');
const healthPanel = byId('battle-hud');
const selectionNote = byId('selection-note');
const brandLink = byId('brand-link');
const libraryLink = byId('library-link');
const rescueLink = byId('rescue-link');
const magnetModel = new URLSearchParams(window.location.search).get('model');
const useBlenderMagnet = magnetModel === 'blender' || magnetModel === 'blender-wing';
const magnetModelLabel = magnetModel === 'blender-wing' ? '磁翼型' : 'Blender 外观';
const magnetAppearance = byId('arena-magnet-appearance');

if (useBlenderMagnet) {
  magnetAppearance.hidden = false;
  magnetAppearance.textContent = `磁极已选用 ${magnetModelLabel}。`;
  const orbitLink = byId('arena-magnet-orbit-link');
  orbitLink.href = `${heroSceneUrl('orbit.html', 'magnet')}&model=${magnetModel}`;
  orbitLink.hidden = false;
  const labLink = byId('arena-magnet-lab-link');
  labLink.href = `./magnet-lab.html?model=${magnetModel}`;
  labLink.hidden = false;
}

const initialHero = readHeroSelection();
let selected = roster.find(specimen => specimen.id === initialHero) ?? roster[0];
let rival = selected === roster[1] ? roster[0] : roster[1];
let round = 1;
let duel = null;
let preview = null;
let previewCast;
let arena;
const visibleCasts = [];

try {
  arena = createArena(viewport);
} catch (error) {
  console.error(error);
  const notice = document.createElement('p');
  notice.className = 'render-notice';
  notice.textContent = '这个浏览器无法启动 WebGL 2。请用支持硬件加速的浏览器打开竞技场。';
  viewport.append(notice);
}

const models = new Map();
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
}

function getModel(specimen) {
  if (!arena) return null;
  if (!models.has(specimen)) {
    const model = createCatalogHero(specimen.id);
    if (usesPowerPose(specimen.id)) {
      const updatePose = model.update;
      model.update = ({ time, gait, attack, impact }) => {
        const power = Math.sin(attack * Math.PI);
        model.object.rotation.x = -0.18 * impact;
        updatePose({
          time, progress: attack,
          power: specimen.id === 'shield' ? Math.max(power, impact * 0.6) : power,
          running: specimen.id === 'speed' ? Math.max(gait, power) : gait * (1 - power),
          carrying: false,
        });
      };
    }
    models.set(specimen, model);
    if (useBlenderMagnet && specimen.id === 'magnet') loadMagnetAppearance(model);
  }
  return models.get(specimen);
}

function setText(id, text) {
  byId(id).textContent = text;
}

const cards = new Map(roster.map((specimen, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'roster-card';
  card.style.setProperty('--character-accent', specimen.accent);
  const stroke = specimen.glyphFill === 'none' ? 'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"' : '';
  card.innerHTML = `
    <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
    <span class="card-name">${specimen.name}</span>
    <span class="card-type">${specimen.type}</span>
    <svg class="card-glyph" viewBox="${specimen.glyphViewBox}" fill="${specimen.glyphFill}" ${stroke} aria-hidden="true">${specimen.glyph}</svg>`;
  card.addEventListener('click', event => {
    setHeroSelection(specimen.id);
    if (specimen === selected && !duel) return;
    if (specimen === rival) rival = selected;
    selected = specimen;
    inspect();
    if (event.detail > 0) moveStageIntoView();
  });
  rosterPanel.append(card);
  return [specimen, card];
}));

function showDossier() {
  for (const [specimen, card] of cards) card.setAttribute('aria-pressed', String(specimen === selected));
  const number = String(roster.indexOf(selected) + 1).padStart(2, '0');
  stats.style.setProperty('--character-accent', selected.accent);
  const metrics = [
    ['生命', selected.health, 130],
    ['攻击', selected.power, 30],
    ['移动', selected.speed.toFixed(1), 4],
  ];
  stats.innerHTML = `
    <p class="dossier-index">FILE ${number} / ${selected.english}</p>
    <h2 class="dossier-title">${selected.name}</h2>
    <p class="dossier-type">${selected.type}</p>
    <p class="dossier-description">${selected.description}</p>
    <div class="dossier-metrics">
      ${metrics.map(([label, value, max]) => `
        <div class="dossier-metric"><span class="metric-label">${label}</span><span class="metric-value">${value}</span>
        <div class="metric-track"><div class="metric-fill" style="width:${Number(value) / max * 100}%"></div></div></div>`).join('')}
    </div>
    <div class="dossier-ability">
      <div><strong>${selected.ability}</strong><small>${selected.abilityText}</small></div>
      <button id="preview-ability" type="button" ${arena ? '' : 'disabled'}>演示招式</button>
    </div>`;
  byId('preview-ability').addEventListener('click', () => {
    if (duel) return;
    preview = 0;
    setText('stage-subtitle', selected.ability);
    moveStageIntoView();
  });
  rivalSelect.replaceChildren(...roster.filter(specimen => specimen !== selected).map(specimen => new Option(specimen.name, specimen.id)));
  rivalSelect.value = rival.id;
}

function inspect() {
  duel = null;
  preview = null;
  const model = getModel(selected);
  if (model) {
    model.object.position.set(0, 0, 0);
    model.object.rotation.set(0, 0, 0);
    model.object.scale.setScalar(1);
    arena.setSubjects([model], selected.accent);
    arena.setShot('inspect', selected.height);
    previewCast = createCastView(selected, model.object.position, model.object.position.clone().set(0, 0, 1.75));
  }
  showDossier();
  brandLink.href = libraryLink.href = heroSceneUrl('index.html', selected.id);
  rescueLink.href = heroSceneUrl('rescue.html', selected.rescue ? selected.id : null);
  setText('mode-label', '形态观察 / INSPECT');
  setText('stage-title', selected.name);
  setText('stage-subtitle', selected.english);
  setText('camera-note', '拖动旋转 · 滚轮或双指缩放');
  inspectButton.hidden = true;
  healthPanel.hidden = true;
  rivalSelect.disabled = !arena;
  startButton.disabled = !arena;
  startButton.textContent = '开始自动对决';
  selectionNote.textContent = arena ? '选择对手，开场后即可观战。' : '三维渲染暂不可用';
}

function createFighter(specimen, side) {
  const model = getModel(specimen);
  model.object.position.set(side * 2.55, 0, side * 0.23);
  model.object.rotation.set(0, side * -Math.PI / 2, 0);
  model.object.scale.setScalar(1);
  return {
    specimen, model, side, health: specimen.health, gait: 0, impact: 0,
    nextAttack: 0.68 + Math.random() * 0.32, strike: null, recharging: false,
    hitTimes: specimen.hitTimes ?? [specimen.contact],
  };
}

function createCastView(specimen, source, target) {
  return { id: specimen.id, source, target, heading: 0, accent: specimen.accent, progress: 0, contact: specimen.contact, result: null };
}

function startDuel() {
  if (!arena || (duel && !duel.finished)) return;
  preview = null;
  const fighters = [createFighter(selected, -1), createFighter(rival, 1)];
  duel = { fighters, elapsed: 0, finished: false, winner: null };
  arena.setSubjects(fighters.map(fighter => fighter.model), '#c9ff82');
  arena.setShot('duel');
  setText('round-label', String(round++).padStart(2, '0'));
  setText('mode-label', '自动对决 / DUEL');
  setText('stage-title', `${selected.name} × ${rival.name}`);
  setText('stage-subtitle', '双方入场');
  inspectButton.hidden = false;
  healthPanel.hidden = false;
  startButton.disabled = true;
  startButton.textContent = '交锋进行中';
  rivalSelect.disabled = true;
  byId('preview-ability').disabled = true;
  selectionNote.textContent = '对决进行中，可拖动视角观战。';
  healthPanel.innerHTML = fighters.map(({ specimen }, index) => `
    <div class="fighter" style="--character-accent:${specimen.accent}">
      <div class="fighter-name">${specimen.name} <span class="fighter-hp" data-hp="${index}"></span></div>
      <div class="fighter-health-track" role="progressbar" aria-label="${specimen.name}的生命值" aria-valuemin="0" aria-valuemax="${specimen.health}"><div class="fighter-health-fill"></div></div>
      <div class="fighter-cast"><span class="fighter-ability">${specimen.ability}</span><span class="fighter-cast-status" data-cast="${index}"></span></div>
    </div>`).join('<span class="battle-vs">VS</span>');
  const meters = healthPanel.querySelectorAll('.fighter-health-track');
  fighters.forEach((fighter, index) => {
    fighter.meter = meters[index];
    fighter.healthText = healthPanel.querySelector(`[data-hp="${index}"]`);
    fighter.castStatus = healthPanel.querySelector(`[data-cast="${index}"]`);
    fighter.cast = createCastView(fighter.specimen, fighter.model.object.position, fighters[1 - index].model.object.position);
    updateHealth(fighter);
    updateCastStatus(fighter);
  });
  moveStageIntoView();
}

function moveStageIntoView() {
  if (!window.matchMedia('(max-width: 810px)').matches) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  viewport.parentElement.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth' });
}

function updateHealth(fighter) {
  fighter.meter.setAttribute('aria-valuenow', String(fighter.health));
  fighter.meter.firstElementChild.style.width = `${fighter.health / fighter.specimen.health * 100}%`;
  fighter.healthText.textContent = `${fighter.health}/${fighter.specimen.health}`;
}

const castLabels = { ready: '准备出招', charging: '蓄力', casting: '施放', cooldown: '冷却', ended: '已结束' };

function updateCastStatus(fighter) {
  let phase = 'ready';
  if (duel.finished) phase = 'ended';
  else if (fighter.strike) phase = fighter.strike.hitIndex === 0 ? 'charging' : 'casting';
  else if (fighter.recharging && duel.elapsed < fighter.nextAttack) phase = 'cooldown';
  if (fighter.castStatus.dataset.phase === phase) return;
  fighter.castStatus.dataset.phase = phase;
  fighter.castStatus.textContent = castLabels[phase];
}

function resolveHit(fighter, opponent, distance) {
  const { specimen, model, strike, hitTimes } = fighter;
  const hitIndex = strike.hitIndex++;
  if (distance > specimen.reach + 0.4) {
    strike.result ??= 'miss';
    setText('stage-subtitle', `${opponent.specimen.name}躲开了${specimen.ability}`);
    return;
  }

  if (strike.damage === undefined) {
    strike.guarded = Math.random() < opponent.specimen.guard;
    const variance = 0.82 + Math.random() * 0.36;
    strike.damage = Math.max(hitTimes.length, Math.round(specimen.power * variance * (strike.guarded ? 0.45 : 1)));
  }
  const share = strike.damage / hitTimes.length;
  const damage = Math.round(share * (hitIndex + 1)) - Math.round(share * hitIndex);
  strike.result = strike.guarded ? 'guard' : 'hit';
  opponent.health = Math.max(0, opponent.health - damage);
  opponent.impact = strike.guarded ? 0.45 : 1;
  updateHealth(opponent);
  arena.strike(model.object.position, opponent.model.object.position, specimen.accent, strike.guarded, specimen.kind);
  setText('stage-subtitle', `${specimen.ability} · ${strike.guarded ? '部分格挡 · ' : ''}−${damage} HP`);
}

function face(object, heading, dt) {
  const delta = heading - object.rotation.y;
  object.rotation.y += Math.atan2(Math.sin(delta), Math.cos(delta)) * (1 - Math.exp(-dt * 15));
}

function stepFighter(fighter, opponent, dt) {
  const { specimen, model } = fighter;
  const source = model.object.position;
  const target = opponent.model.object.position;
  const dx = target.x - source.x;
  const dz = target.z - source.z;
  const distance = Math.max(0.01, Math.hypot(dx, dz));
  const directionX = dx / distance;
  const directionZ = dz / distance;
  face(model.object, Math.atan2(dx, dz), dt);

  const desired = specimen.reach - 0.12;
  const retreat = specimen.kind === 'pulse' && distance < desired - 0.36 && Math.hypot(source.x, source.z) < 3.2;
  const advance = distance > desired + 0.04;
  let pace = 0;
  if (!fighter.strike && (advance || retreat)) {
    pace = retreat ? -0.58 : 1;
    const step = Math.min(Math.abs(distance - desired), specimen.speed * Math.abs(pace) * dt);
    source.x += directionX * step * Math.sign(pace);
    source.z += directionZ * step * Math.sign(pace);
  }
  fighter.gait += (Math.abs(pace) - fighter.gait) * (1 - Math.exp(-dt * 9));

  if (!fighter.strike && duel.elapsed >= fighter.nextAttack && distance <= specimen.reach) {
    fighter.strike = { progress: 0, hitIndex: 0, result: null };
    fighter.recharging = false;
    setText('stage-subtitle', `${specimen.name}蓄力 · ${specimen.ability}`);
  }
  if (!fighter.strike) return;

  const strike = fighter.strike;
  strike.progress += dt / specimen.duration;
  while (strike.hitIndex < fighter.hitTimes.length && opponent.health > 0 && strike.progress >= fighter.hitTimes[strike.hitIndex]) {
    resolveHit(fighter, opponent, distance);
  }
  if (strike.progress >= 1) {
    fighter.strike = null;
    fighter.recharging = true;
    fighter.nextAttack = duel.elapsed + specimen.cooldown * (0.78 + Math.random() * 0.38);
  }
}

function finishDuel() {
  const [left, right] = duel.fighters;
  const advantage = left.health / left.specimen.health - right.health / right.specimen.health;
  duel.finished = true;
  duel.winner = advantage === 0 ? null : advantage > 0 ? left : right;
  const result = duel.winner ? `${duel.winner.specimen.name}获胜` : '双方打平';
  setText('mode-label', '对决结束 / RESULT');
  setText('stage-title', result);
  setText('stage-subtitle', `${left.health} / ${left.specimen.health} HP  ×  ${right.health} / ${right.specimen.health} HP`);
  selectionNote.textContent = `${result}。可以更换对手再战。`;
  startButton.disabled = false;
  startButton.textContent = '再战一轮';
  rivalSelect.disabled = false;
}

function updateDuel(time, dt) {
  const [left, right] = duel.fighters;
  if (!duel.finished) {
    duel.elapsed += dt;
    // Alternate which side acts first to avoid always resolving simultaneous strikes in favor of the left side.
    const [first, second] = Math.floor(duel.elapsed * 11) % 2 ? [right, left] : [left, right];
    stepFighter(first, second, dt);
    if (second.health > 0) stepFighter(second, first, dt);
    if (left.health === 0 || right.health === 0 || duel.elapsed >= 24) finishDuel();
  }

  for (const fighter of duel.fighters) {
    const object = fighter.model.object;
    if (duel.finished) {
      fighter.gait *= Math.exp(-dt * 9);
      if (fighter === duel.winner) face(object, 0.15, dt * 0.21);
      if (fighter.health === 0) {
        object.rotation.z += (fighter.side * 0.78 - object.rotation.z) * (1 - Math.exp(-dt * 4));
        object.position.y += (-0.22 - object.position.y) * (1 - Math.exp(-dt * 4));
      }
    }
    fighter.model.update({
      time,
      gait: fighter.gait,
      attack: fighter.strike ? Math.min(1, fighter.strike.progress) : 0,
      impact: fighter.impact,
    });
    updateCastStatus(fighter);
    if (fighter.strike) {
      fighter.cast.heading = object.rotation.y;
      fighter.cast.progress = Math.min(1, fighter.strike.progress);
      fighter.cast.result = fighter.strike.result;
      visibleCasts.push(fighter.cast);
    }
    if (duel.finished && fighter.strike) {
      fighter.strike.progress += dt / fighter.specimen.duration;
      if (fighter.strike.progress >= 1) fighter.strike = null;
    }
    fighter.impact *= Math.exp(-dt * 7);
  }
}

startButton.addEventListener('click', startDuel);
inspectButton.addEventListener('click', () => {
  inspect();
  cards.get(selected).focus({ preventScroll: true });
});
rivalSelect.addEventListener('change', () => {
  rival = roster.find(specimen => specimen.id === rivalSelect.value);
});

setText('roster-count', `${roster.length} SPECIMENS`);
inspect();
if (arena) {
  let previousTime = performance.now();
  function frame(now) {
    const dt = Math.min(0.08, (now - previousTime) / 1000);
    const time = now / 1000;
    previousTime = now;
    visibleCasts.length = 0;
    if (duel) {
      updateDuel(time, dt);
    } else {
      if (preview !== null) {
        preview += dt / (selected.duration * 1.45);
        if (preview >= 1) {
          preview = null;
          setText('stage-subtitle', selected.english);
        }
      }
      getModel(selected).update({ time, gait: 0, attack: preview ?? 0, impact: 0 });
      if (preview !== null) {
        previewCast.progress = preview;
        visibleCasts.push(previewCast);
      }
    }
    arena.showCasts(visibleCasts, time);
    arena.render(time, dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
