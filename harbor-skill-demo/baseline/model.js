export const TUNING = Object.freeze({
  speed: 4.7, acceleration: 24, braking: 33, attackRange: 2.05,
  attackCooldown: 0.36, dashSpeed: 15, dashDuration: 0.16,
  dashCooldown: 1.05, hitPause: 0.055, invulnerability: 1.1, duration: 90,
});
export const BEACON = { x: 0, z: -4.7 };
export const OBSTACLES = [{ x: -6.1, z: -3.8, r: 1.2 }, { x: 6.1, z: -3.8, r: 1.2 }, { ...BEACON, r: 0.75 }];
export const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const approach = (value, target, amount) => value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);

export function createState() {
  return {
    phase: 'ready', time: TUNING.duration, elapsed: 0, shards: 0, score: 0,
    player: { x: 0, z: 3.5, vx: 0, vz: 0, angle: Math.PI, hp: 4, attack: 0, cooldown: 0, dash: 0, dashCooldown: 0, invulnerable: 0 },
    enemies: [[-4.2, 0.5], [4.2, -0.6], [0.8, -2.6]].map(([x, z], id) => ({ id, x, z, homeX: x, homeZ: z, hp: 3, mode: 'idle', timer: 0.5 + id * 0.3, angle: 0, vx: 0, vz: 0, flash: 0, knock: 0 })),
    pickups: [], events: [],
  };
}

export function clearMotion(state) {
  state.player.vx = 0;
  state.player.vz = 0;
  state.player.dash = 0;
}

function contain(entity, radius) {
  for (const obstacle of OBSTACLES) {
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

function hitEnemy(state, enemy) {
  const player = state.player;
  enemy.hp -= 1;
  enemy.flash = 0.15;
  enemy.knock = 0.16;
  const length = Math.max(distance(player, enemy), 0.01);
  enemy.vx = (enemy.x - player.x) / length * 6;
  enemy.vz = (enemy.z - player.z) / length * 6;
  enemy.mode = 'recover';
  enemy.timer = 0.85;
  state.events.push({ type: enemy.hp === 0 ? 'defeat' : 'hit', x: enemy.x, z: enemy.z });
  if (enemy.hp === 0) {
    state.score += 100;
    state.pickups.push({ id: enemy.id, x: enemy.x, z: enemy.z, collected: false });
  }
}

export function step(state, input, dt) {
  state.events.length = 0;
  if (state.phase !== 'playing') return;
  const player = state.player;
  state.time = Math.max(0, state.time - dt);
  state.elapsed += dt;
  player.cooldown = Math.max(0, player.cooldown - dt);
  player.attack = Math.max(0, player.attack - dt);
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  const length = Math.hypot(input.x || 0, input.y || 0);
  const scale = Math.max(1, length);
  const x = ((input.x || 0) * 0.81 + (input.y || 0) * 0.586) / scale;
  const z = ((input.y || 0) * 0.81 - (input.x || 0) * 0.586) / scale;

  // Dash has explicit priority when dash and attack arrive in the same frame.
  if (input.dash && player.dashCooldown === 0) {
    if (length > 0.1) player.angle = Math.atan2(x, z);
    player.dash = TUNING.dashDuration;
    player.dashCooldown = TUNING.dashCooldown;
    player.invulnerable = Math.max(player.invulnerable, TUNING.dashDuration + 0.1);
    state.events.push({ type: 'dash', x: player.x, z: player.z });
  } else if (input.attack && player.cooldown === 0 && player.dash <= 0) {
    const targets = state.enemies.filter(enemy => enemy.hp > 0 && distance(player, enemy) < TUNING.attackRange);
    targets.sort((a, b) => distance(player, a) - distance(player, b));
    if (targets.length) player.angle = Math.atan2(targets[0].x - player.x, targets[0].z - player.z);
    player.attack = 0.23;
    player.cooldown = TUNING.attackCooldown;
    state.events.push({ type: 'swing', x: player.x, z: player.z });
    for (const enemy of targets) hitEnemy(state, enemy);
  }

  if (player.dash > 0) {
    player.dash = Math.max(0, player.dash - dt);
    player.vx = Math.sin(player.angle) * TUNING.dashSpeed;
    player.vz = Math.cos(player.angle) * TUNING.dashSpeed;
  } else {
    const acceleration = length ? TUNING.acceleration : TUNING.braking;
    player.vx = approach(player.vx, x * TUNING.speed, acceleration * dt);
    player.vz = approach(player.vz, z * TUNING.speed, acceleration * dt);
    if (length > 0.1 && player.attack === 0) player.angle = Math.atan2(x, z);
  }
  player.x += player.vx * dt;
  player.z += player.vz * dt;
  contain(player, 0.35);

  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    enemy.flash = Math.max(0, enemy.flash - dt);
    enemy.timer -= dt;
    if (enemy.knock > 0) {
      enemy.knock -= dt;
      enemy.x += enemy.vx * dt;
      enemy.z += enemy.vz * dt;
    } else if (enemy.mode === 'charge') {
      enemy.x += enemy.vx * dt;
      enemy.z += enemy.vz * dt;
      if (enemy.timer <= 0) { enemy.mode = 'recover'; enemy.timer = 1.0; }
    } else if (enemy.mode === 'windup') {
      if (enemy.timer <= 0) {
        enemy.mode = 'charge'; enemy.timer = 0.55;
        enemy.vx = Math.sin(enemy.angle) * 6.7;
        enemy.vz = Math.cos(enemy.angle) * 6.7;
      }
    } else if (enemy.mode === 'recover') {
      if (enemy.timer <= 0) { enemy.mode = 'idle'; enemy.timer = 0.6; }
    } else {
      const range = distance(player, enemy);
      enemy.angle = Math.atan2(player.x - enemy.x, player.z - enemy.z);
      if (range < 6 && range > 1.25) {
        enemy.x += Math.sin(enemy.angle) * 1.0 * dt;
        enemy.z += Math.cos(enemy.angle) * 1.0 * dt;
      }
      if (range < 4.6 && enemy.timer <= 0) {
        enemy.mode = 'windup'; enemy.timer = 0.72;
        state.events.push({ type: 'warning', x: enemy.x, z: enemy.z });
      }
    }
    contain(enemy, 0.45);
    if (distance(player, enemy) < 0.9 && player.invulnerable === 0 && player.dash === 0) {
      player.hp = Math.max(0, player.hp - 1);
      player.invulnerable = TUNING.invulnerability;
      state.events.push({ type: 'damage', x: player.x, z: player.z });
    }
  }
  for (const pickup of state.pickups) {
    if (!pickup.collected && distance(player, pickup) < 1.0) {
      pickup.collected = true;
      state.shards += 1;
      state.score += 50;
      state.events.push({ type: 'pickup', x: pickup.x, z: pickup.z });
    }
  }
  if (player.hp === 0 || state.time === 0) {
    state.phase = 'lost';
    state.events.push({ type: 'lost', reason: player.hp === 0 ? 'health' : 'time' });
  } else if (input.interact && state.shards === 3 && distance(player, BEACON) < 2.25) {
    state.phase = 'won';
    state.score += Math.ceil(state.time) * 10;
    state.events.push({ type: 'won', x: BEACON.x, z: BEACON.z });
  }
}
