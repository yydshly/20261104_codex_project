import { BEACON, CHAPTERS, TUNING, UPGRADES } from './content.js';
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const approach = (value, target, amount) => value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
export function stats(upgrades = []) {
  return {
    speed: TUNING.speed * 1.08 ** upgrades.filter(id => id === 'wind').length,
    damage: TUNING.damage + upgrades.filter(id => id === 'edge').length,
    maxHealth: TUNING.maxHealth + upgrades.filter(id => id === 'heart').length * 2,
    dashCooldown: TUNING.dashCooldown * 0.75 ** upgrades.filter(id => id === 'wind').length,
  };
}
export function createState(chapter = 0, campaign = {}) {
  const upgrades = [...(campaign.upgrades || [])];
  const level = CHAPTERS[chapter];
  return {
    phase: 'ready', chapter, time: level.duration, elapsed: 0, cores: 0,
    score: campaign.score || 0, upgrades, history: [...(campaign.history || [])],
    totals: { hits: 0, damage: 0, dashes: 0, elapsed: 0, ...(campaign.totals || {}) },
    player: { x: 0, z: 3.7, vx: 0, vz: 0, angle: Math.PI, hp: stats(upgrades).maxHealth, attack: 0, cooldown: 0, dash: 0, dashCooldown: 0, invulnerable: 0 },
    enemies: level.enemies.map((enemy, id) => ({ ...enemy, id, maxHp: enemy.hp, mode: 'idle', timer: 1.1 + id * 0.4, angle: 0, vx: 0, vz: 0, flash: 0, knock: 0, phase: 1, move: 0, chains: 0 })),
    pickups: [], projectiles: [], nextProjectile: 0, events: [], failure: null,
  };
}
export function clearMotion(state) {
  state.player.vx = 0;
  state.player.vz = 0;
  state.player.dash = 0;
}
export function checkpoint(state) {
  return { version: 1, chapter: state.chapter, upgrades: [...state.upgrades], score: state.score, totals: { ...state.totals }, history: [...state.history] };
}
export function restoreCheckpoint(value) {
  if (!value || value.version !== 1 || !Number.isInteger(value.chapter) || value.chapter < 0 || value.chapter >= CHAPTERS.length) return null;
  if (!Array.isArray(value.upgrades) || value.upgrades.length !== value.chapter || value.upgrades.some(id => !Object.hasOwn(UPGRADES, id))) return null;
  if (!Number.isFinite(value.score) || value.score < 0 || !Array.isArray(value.history) || value.history.length !== value.chapter) return null;
  if (value.history.some(entry => !entry || typeof entry !== 'object' || typeof entry.name !== 'string' || !Number.isFinite(entry.elapsed) || !Number.isFinite(entry.damage))) return null;
  const totals = value.totals;
  if (!totals || ['hits', 'damage', 'dashes', 'elapsed'].some(key => !Number.isFinite(totals[key]) || totals[key] < 0)) return null;
  return createState(value.chapter, { ...value, history: value.history.map(entry => ({ name: String(entry.name).slice(0, 30), elapsed: Number(entry.elapsed) || 0, damage: Number(entry.damage) || 0 })) });
}
export function chooseUpgrade(state, id) {
  if (state.phase !== 'upgrade' || !Object.hasOwn(UPGRADES, id) || state.chapter >= 2) return null;
  const next = createState(state.chapter + 1, { ...state, upgrades: [...state.upgrades, id] });
  // Claim before returning so repeated dispatch cannot duplicate a reward.
  state.phase = 'departed';
  return next;
}
function contain(state, entity, radius) {
  for (const obstacle of [...CHAPTERS[state.chapter].obstacles, { ...BEACON, r: 0.75 }]) {
    const dx = entity.x - obstacle.x;
    const dz = entity.z - obstacle.z;
    const length = Math.hypot(dx, dz);
    const minimum = obstacle.r + radius;
    if (length < minimum) {
      entity.x = obstacle.x + (length ? dx / length : 1) * minimum;
      entity.z = obstacle.z + (length ? dz / length : 0) * minimum;
    }
  }
  const normalized = Math.hypot(entity.x / (8.5 - radius), entity.z / (6.4 - radius));
  if (normalized > 1) { entity.x /= normalized; entity.z /= normalized; }
}
function hurtPlayer(state) {
  const player = state.player;
  if (player.invulnerable > 0 || player.hp <= 0) return;
  player.hp = Math.max(0, player.hp - 1);
  player.invulnerable = TUNING.invulnerability;
  state.totals.damage++;
  state.events.push({ type: 'damage', x: player.x, z: player.z });
}
function hitEnemy(state, enemy, damage) {
  const player = state.player;
  if (enemy.type === 'boss' && ['windup', 'charge'].includes(enemy.mode)) {
    state.events.push({ type: 'guard', x: enemy.x, z: enemy.z });
    return;
  }
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.flash = 0.15;
  state.totals.hits++;
  if (enemy.type !== 'boss') {
    enemy.knock = 0.14;
    const length = Math.max(distance(player, enemy), 0.01);
    enemy.vx = (enemy.x - player.x) / length * 5;
    enemy.vz = (enemy.z - player.z) / length * 5;
    enemy.mode = 'recover';
    enemy.timer = 0.65;
  }
  state.events.push({ type: enemy.hp === 0 ? 'defeat' : 'hit', x: enemy.x, z: enemy.z, damage });
  if (enemy.hp === 0) {
    state.score += enemy.type === 'boss' ? 1000 : 100;
    state.pickups.push({ id: enemy.id, x: enemy.x, z: enemy.z, collected: false });
  }
}
function fire(state, enemy, radial = false) {
  const count = radial ? (enemy.phase === 2 ? 12 : 8) : 1;
  for (let i = 0; i < count; i++) {
    const angle = radial ? i * Math.PI * 2 / count + enemy.move * 0.15 : enemy.angle;
    state.projectiles.push({ id: state.nextProjectile++, x: enemy.x, z: enemy.z, vx: Math.sin(angle) * 4.1, vz: Math.cos(angle) * 4.1, life: 3.4 });
  }
  state.events.push({ type: 'fire', x: enemy.x, z: enemy.z });
}
function updateEnemy(state, enemy, dt) {
  const player = state.player;
  const boss = enemy.type === 'boss';
  const range = distance(player, enemy);
  enemy.flash = Math.max(0, enemy.flash - dt);
  enemy.timer -= dt;
  if (boss && enemy.hp <= enemy.maxHp / 2 && enemy.phase === 1) {
    enemy.phase = 2; enemy.mode = 'recover'; enemy.timer = 1;
    state.events.push({ type: 'boss-phase', x: enemy.x, z: enemy.z });
  }
  if (enemy.knock > 0) {
    enemy.knock -= dt; enemy.x += enemy.vx * dt; enemy.z += enemy.vz * dt;
  } else if (enemy.mode === 'charge') {
    enemy.x += enemy.vx * dt; enemy.z += enemy.vz * dt;
    if (enemy.timer <= 0) {
      if (boss && enemy.chains > 0) {
        enemy.chains--; enemy.mode = 'windup'; enemy.timer = 0.65;
        enemy.angle = Math.atan2(player.x - enemy.x, player.z - enemy.z);
      } else { enemy.mode = 'recover'; enemy.timer = boss ? 1.3 : 1; }
    }
  } else if (enemy.mode === 'windup' && enemy.timer <= 0) {
    if (enemy.type === 'cannon' || (boss && enemy.move % 2 === 0)) {
      fire(state, enemy, boss); enemy.mode = 'recover'; enemy.timer = boss ? 1.4 : 1.7;
    } else {
      enemy.mode = 'charge'; enemy.timer = boss ? 0.48 : 0.5;
      enemy.vx = Math.sin(enemy.angle) * (boss ? 8.6 : 6.5);
      enemy.vz = Math.cos(enemy.angle) * (boss ? 8.6 : 6.5);
    }
  } else if (enemy.mode === 'recover') {
    if (enemy.timer <= 0) { enemy.mode = 'idle'; enemy.timer = boss ? 0.5 : 0.8; }
  } else if (enemy.mode === 'idle') {
    enemy.angle = Math.atan2(player.x - enemy.x, player.z - enemy.z);
    if (enemy.type === 'crab' && range < 7 && range > 1.6) {
      enemy.x += Math.sin(enemy.angle) * dt; enemy.z += Math.cos(enemy.angle) * dt;
    }
    if (range < (enemy.type === 'crab' ? 4.6 : 20) && enemy.timer <= 0) {
      enemy.mode = 'windup';
      enemy.timer = boss ? 0.95 : enemy.type === 'cannon' ? 1 : 0.75;
      enemy.move++;
      enemy.chains = boss && enemy.phase === 2 && enemy.move % 2 === 1 ? 1 : 0;
      state.events.push({ type: 'warning', x: enemy.x, z: enemy.z });
    }
  }
  contain(state, enemy, boss ? 0.95 : 0.45);
  // Damage is confined to the active attack window. Startup and recovery
  // remain safe so anticipation and interruptions have a consistent payoff.
  if (enemy.mode === 'charge' && distance(player, enemy) < (boss ? 1.4 : 0.85)) hurtPlayer(state);
}
export function step(state, input, dt) {
  state.events.length = 0;
  if (state.phase !== 'playing') return;
  const player = state.player;
  const attributes = stats(state.upgrades);
  const level = CHAPTERS[state.chapter];
  state.time = Math.max(0, state.time - dt);
  state.elapsed += dt; state.totals.elapsed += dt;
  for (const key of ['cooldown', 'attack', 'dashCooldown', 'invulnerable']) player[key] = Math.max(0, player[key] - dt);
  const length = Math.hypot(input.x || 0, input.y || 0);
  const scale = Math.max(1, length);
  const x = ((input.x || 0) * 0.81 + (input.y || 0) * 0.586) / scale;
  const z = ((input.y || 0) * 0.81 - (input.x || 0) * 0.586) / scale;
  if (input.dash && player.dashCooldown === 0) {
    if (length > 0.1) player.angle = Math.atan2(x, z);
    player.dash = TUNING.dashDuration; player.dashCooldown = attributes.dashCooldown;
    player.invulnerable = Math.max(player.invulnerable, TUNING.dashDuration + 0.1);
    state.totals.dashes++; state.events.push({ type: 'dash', x: player.x, z: player.z });
  } else if (input.attack && player.cooldown === 0 && player.dash <= 0) {
    const targets = state.enemies.filter(enemy => enemy.hp > 0 && distance(player, enemy) < TUNING.attackRange + (enemy.type === 'boss' ? 0.65 : 0));
    targets.sort((a, b) => distance(player, a) - distance(player, b));
    if (targets.length) player.angle = Math.atan2(targets[0].x - player.x, targets[0].z - player.z);
    player.attack = TUNING.attackDuration; player.cooldown = TUNING.attackCooldown;
    state.events.push({ type: 'swing', x: player.x, z: player.z });
    for (const enemy of targets) {
      const direction = Math.atan2(enemy.x - player.x, enemy.z - player.z);
      const delta = Math.atan2(Math.sin(direction - player.angle), Math.cos(direction - player.angle));
      if (Math.abs(delta) <= TUNING.attackArc / 2) hitEnemy(state, enemy, attributes.damage);
    }
  }
  if (player.dash > 0) {
    player.dash = Math.max(0, player.dash - dt);
    player.vx = Math.sin(player.angle) * TUNING.dashSpeed; player.vz = Math.cos(player.angle) * TUNING.dashSpeed;
  } else {
    const acceleration = length ? TUNING.acceleration : TUNING.braking;
    player.vx = approach(player.vx, x * attributes.speed, acceleration * dt);
    player.vz = approach(player.vz, z * attributes.speed, acceleration * dt);
    if (length > 0.1 && player.attack === 0) player.angle = Math.atan2(x, z);
  }
  player.x += player.vx * dt; player.z += player.vz * dt;
  contain(state, player, 0.35);
  for (const enemy of state.enemies) if (enemy.hp > 0) updateEnemy(state, enemy, dt);
  for (const projectile of state.projectiles) {
    projectile.life -= dt; projectile.x += projectile.vx * dt; projectile.z += projectile.vz * dt;
    if (projectile.life > 0 && distance(player, projectile) < 0.5) { hurtPlayer(state); projectile.life = 0; }
    if (level.obstacles.some(obstacle => distance(obstacle, projectile) < obstacle.r)) projectile.life = 0;
  }
  state.projectiles = state.projectiles.filter(projectile => projectile.life > 0);
  for (const pickup of state.pickups) if (!pickup.collected && distance(player, pickup) < 1.05) {
    pickup.collected = true; state.cores++; state.score += 50;
    state.events.push({ type: 'pickup', x: pickup.x, z: pickup.z });
  }
  if (player.hp === 0 || state.time === 0) {
    state.phase = 'lost'; state.failure = player.hp === 0 ? 'health' : 'time';
    state.events.push({ type: 'lost', reason: state.failure });
  } else if (input.interact && state.cores === level.cores && distance(player, BEACON) < 2.25) {
    state.score += Math.ceil(state.time) * 5;
    const previousDamage = state.history.reduce((sum, entry) => sum + entry.damage, 0);
    state.history.push({ name: level.name, elapsed: state.elapsed, damage: state.totals.damage - previousDamage });
    state.phase = state.chapter === 2 ? 'won' : 'upgrade';
    state.events.push({ type: state.phase === 'won' ? 'won' : 'chapter-clear', x: BEACON.x, z: BEACON.z });
  }
}
