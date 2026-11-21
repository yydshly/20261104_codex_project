/** Deterministic combat rules for the original heavy-halberd warlord.
 * Coordinates are meters on the world X/Z plane. aimX/aimZ are a world point.
 * No renderer, DOM, asset, or frame-rate dependency is required.
 */
export const WARLORD_SETTINGS = Object.freeze({
  maxHealth: 240, maxStamina: 100, walkSpeed: 3.1, runSpeed: 4.6,
  radius: .4, arenaRadius: 10.5, staminaRegen: 25,
  dodgeCost: 20, dodgeDuration: .4, dodgeDistance: 2.35,
  shieldAmount: 90, shieldDuration: 4,
});
export const ATTACKS = Object.freeze([
  { name: 'Attack1', duration: .72, hit: .23, activeEnd: .31, damage: 22, reach: 2.75, halfAngle: .58, step: .22, stepStart: .12, stepEnd: .30, stagger: .18, knockback: .10, cancel: .40 },
  { name: 'Attack2', duration: .82, hit: .30, activeEnd: .39, damage: 26, reach: 2.9, halfAngle: .82, step: .32, stepStart: .14, stepEnd: .33, stagger: .22, knockback: .14, cancel: .47 },
  { name: 'Attack3', duration: 1, hit: .40, activeEnd: .50, damage: 38, reach: 3, halfAngle: 1.05, step: .42, stepStart: .22, stepEnd: .42, stagger: .45, knockback: .8, cancel: .62 },
]);
export const SKILLS = Object.freeze({
  Q: { name: 'Cleave', duration: 1.08, hit: .42, activeEnd: .55, damage: 58, reach: 3.35, halfAngle: 1.35, step: .25, stepStart: .21, stepEnd: .44, stagger: .65, knockback: .6, cooldown: 4.8, stamina: 12, cancel: .78 },
  E: { name: 'GuardCast', duration: .32, cooldown: 6, shield: 90, shieldDuration: 4, stamina: 0 },
  R: { name: 'Leap', duration: 1.28, takeoff: .18, land: .92, height: 2.9, range: 5.5, radius: 3.2, damage: 76, airDuration: .76, stagger: .9, knockback: .65, cooldown: 9, stamina: 20 },
});
export const ENEMY_STATES = Object.freeze({ idle: 'Idle', chase: 'Run', windup: 'Windup', attack: 'Attack', recover: 'Recover', stagger: 'Stagger', airborne: 'Airborne', dead: 'Dead' });

const clamp = (v, low, high) => Math.max(low, Math.min(high, v));
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
const finitePoint = point => point && Number.isFinite(point.x) && Number.isFinite(point.z);
const defaultEnemies = [
  { id: 'guard-1', x: 0, z: -3.3, maxHealth: 140, speed: 1.55 },
  { id: 'guard-2', x: -3.5, z: -4.4, maxHealth: 140, speed: 1.65 },
  { id: 'guard-3', x: 3.5, z: -4.4, maxHealth: 140, speed: 1.45 },
];

export function resolveWarlordMovement(position, dx, dz, colliders = [], radius = .4, arenaRadius = 10.5) {
  let x = position.x + dx, z = position.z + dz;
  for (let pass = 0; pass < 2; pass++) for (const obstacle of colliders) {
    if (obstacle.radius !== undefined) {
      const vx = x - obstacle.x, vz = z - obstacle.z, length = Math.hypot(vx, vz), limit = radius + obstacle.radius;
      if (length < limit) { const nx = length > 1e-8 ? vx / length : 1, nz = length > 1e-8 ? vz / length : 0; x = obstacle.x + nx * limit; z = obstacle.z + nz * limit; }
    } else if (Number.isFinite(obstacle.halfX) && Number.isFinite(obstacle.halfZ)) {
      const px = clamp(x, obstacle.x - obstacle.halfX, obstacle.x + obstacle.halfX), pz = clamp(z, obstacle.z - obstacle.halfZ, obstacle.z + obstacle.halfZ);
      const vx = x - px, vz = z - pz, length = Math.hypot(vx, vz);
      if (length > 0 && length < radius) { x = px + vx / length * radius; z = pz + vz / length * radius; }
      else if (!length && Math.abs(x - obstacle.x) <= obstacle.halfX && Math.abs(z - obstacle.z) <= obstacle.halfZ) {
        if (obstacle.halfX - Math.abs(x - obstacle.x) < obstacle.halfZ - Math.abs(z - obstacle.z)) x = obstacle.x + (x >= obstacle.x ? 1 : -1) * (obstacle.halfX + radius);
        else z = obstacle.z + (z >= obstacle.z ? 1 : -1) * (obstacle.halfZ + radius);
      }
    }
  }
  const length = Math.hypot(x, z);
  if (length > arenaRadius) { x *= arenaRadius / length; z *= arenaRadius / length; }
  return { x, z };
}

export class WarlordSession {
  constructor(enemySpecs = defaultEnemies, colliders = [], options = {}) {
    if (!Array.isArray(enemySpecs)) { options = enemySpecs || {}; enemySpecs = options.enemies || defaultEnemies; colliders = options.colliders || []; }
    this.settings = { ...WARLORD_SETTINGS, ...options };
    this.specs = enemySpecs.map((enemy, i) => ({
      id: enemy.id || `guard-${i + 1}`, x: enemy.position?.x ?? enemy.x ?? 0, z: enemy.position?.z ?? enemy.z ?? -3,
      maxHealth: enemy.maxHealth || 140, radius: enemy.radius || .43, speed: enemy.speed || 1.55,
      damage: enemy.damage || 14, attackWindup: enemy.attackWindup || .58, attackRange: enemy.attackRange || 1.65,
    }));
    this.colliders = colliders;
    this.events = [];
    this.reset('intro');
  }

  reset(status = 'playing') {
    this.status = status; this.time = 0; this.maxHealth = this.settings.maxHealth; this.health = this.maxHealth;
    this.maxStamina = this.settings.maxStamina; this.stamina = this.maxStamina;
    this.position = { x: 0, z: 3 }; this.facing = Math.PI; this.heroHeight = 0;
    this.action = 'Idle'; this.actionTime = 0; this.actionDuration = Infinity; this.actionSpec = null;
    this.combo = 0; this.queued = false; this.hitApplied = false; this.hitTargets = new Set(); this.lastAttack = -10; this.lastSpent = -10;
    this.shield = 0; this.shieldTime = 0; this.shieldMax = this.settings.shieldAmount; this.empoweredTime = 0; this.zone = null;
    this.cooldowns = { Q: 0, E: 0, R: 0, Dodge: 0 };
    this.invincible = 0; this.dodgeDirection = { x: 0, z: -1 }; this.leap = null; this.aim = null;
    this.hits = 0; this.kills = 0; this.damageTaken = 0; this.shieldAbsorbed = 0; this.dodges = 0; this.blocked = 0; this.skillUses = { Q: 0, E: 0, R: 0 };
    this.enemies = this.specs.map((spec, i) => ({
      ...spec, position: { x: spec.x, z: spec.z }, health: spec.maxHealth, facing: 0,
      state: 'Idle', action: 'Idle', stateTime: 0, actionTime: 0, attackPhase: 0,
      cooldown: .45 + i * .24, staggerTime: 0, airTime: 0, airDuration: 0, airHeight: 0, slowTime: 0, slowFactor: .6,
      knockback: null, attackFacing: 0, hitApplied: false, dead: false, diedAt: null, lastHitTime: -10,
    }));
    this.events.length = 0;
  }

  start() { this.reset('playing'); this.events.push({ type: 'start' }); }
  setAim(x, z) { if (Number.isFinite(x) && Number.isFinite(z)) this.aim = { x, z }; }
  clearAim() { this.aim = null; }
  changeAction(name, duration = Infinity, spec = null) {
    this.action = name; this.actionTime = 0; this.actionDuration = duration; this.actionSpec = spec;
    this.hitApplied = false; this.hitTargets = new Set();
    this.events.push({ type: 'actionStart', action: name, duration });
  }
  aimFacing(point = this.aim) {
    if (finitePoint(point) && Math.hypot(point.x - this.position.x, point.z - this.position.z) > .03) this.facing = Math.atan2(point.x - this.position.x, point.z - this.position.z);
  }
  canCommit(cancel = true) {
    if (this.status !== 'playing') return false;
    if (['Idle', 'Walk', 'Run', 'GuardCast'].includes(this.action)) return true;
    return cancel && this.actionSpec?.cancel !== undefined && this.actionTime >= this.actionSpec.cancel;
  }
  attack(point) {
    if (finitePoint(point)) this.setAim(point.x, point.z);
    if (this.status !== 'playing') return false;
    if (this.action.startsWith('Attack')) { if (this.actionTime >= .14 && this.actionTime < this.actionDuration - .025) this.queued = true; return false; }
    if (!this.canCommit() || this.stamina < 3) return false;
    this.combo = this.time - this.lastAttack < 1.4 ? (this.combo + 1) % 3 : 0;
    this.beginAttack(); return true;
  }
  beginAttack() {
    const spec = ATTACKS[this.combo];
    this.aimFacing(); this.stamina = Math.max(0, this.stamina - 3); this.lastSpent = this.time; this.lastAttack = this.time;
    this.hitApplied = false; this.queued = false; this.changeAction(spec.name, spec.duration, spec);
    this.events.push({ type: 'attack', combo: this.combo, action: spec.name, hitTime: spec.hit, duration: spec.duration, reach: spec.reach, halfAngle: spec.halfAngle });
  }
  skill(key, point) {
    key = String(key).toUpperCase(); const spec = SKILLS[key];
    if (!spec || this.status !== 'playing' || this.cooldowns[key] > 0 || this.stamina < spec.stamina) return false;
    if (key !== 'E' && !this.canCommit()) return false;
    if (key === 'E' && this.action === 'Death') return false;
    if (finitePoint(point)) this.setAim(point.x, point.z);
    this.stamina -= spec.stamina; this.lastSpent = this.time; this.cooldowns[key] = spec.cooldown; this.skillUses[key]++;
    if (key === 'E') {
      const nearby = this.enemies.filter(enemy => !enemy.dead && Math.hypot(enemy.x - this.position.x, enemy.z - this.position.z) <= 3.5);
      this.shield = this.settings.shieldAmount + Math.min(2, Math.max(0, nearby.length - 1)) * 20; this.shieldMax = this.shield; this.shieldTime = this.settings.shieldDuration;
      for (const enemy of nearby) { enemy.slowTime = Math.max(enemy.slowTime, 1.4); this.events.push({ type: 'enemySlow', id: enemy.id, duration: 1.4, factor: .6 }); }
      if (['Idle', 'Walk', 'Run', 'GuardCast'].includes(this.action)) this.changeAction('GuardCast', spec.duration, spec);
      this.events.push({ type: 'skillStart', skill: key, action: spec.name, shield: this.shield, duration: this.shieldTime, cooldown: spec.cooldown, affectedEnemies: nearby.length });
      return true;
    }
    this.aimFacing(); this.hitApplied = false; this.queued = false;
    if (key === 'R') {
      const destination = finitePoint(point) ? point : this.aim || { x: this.position.x + Math.sin(this.facing) * 4, z: this.position.z + Math.cos(this.facing) * 4 };
      const dx = destination.x - this.position.x, dz = destination.z - this.position.z, length = Math.hypot(dx, dz), ratio = length > spec.range ? spec.range / length : 1;
      const target = resolveWarlordMovement(this.position, dx * ratio, dz * ratio, this.colliders, this.settings.radius, this.settings.arenaRadius);
      this.leap = { from: { ...this.position }, target, landed: false };
      this.changeAction(spec.name, spec.duration, spec);
      this.events.push({ type: 'skillStart', skill: key, action: spec.name, x: target.x, z: target.z, target: { ...target }, radius: spec.radius, landTime: spec.land, cooldown: spec.cooldown });
    } else {
      this.changeAction(spec.name, spec.duration, spec);
      this.events.push({ type: 'skillStart', skill: key, action: spec.name, hitTime: spec.hit, reach: spec.reach, halfAngle: spec.halfAngle, cooldown: spec.cooldown });
    }
    return true;
  }
  dodge(dx = 0, dz = 0) {
    if (this.status !== 'playing' || this.cooldowns.Dodge > 0 || this.stamina < this.settings.dodgeCost) return false;
    if (['Leap', 'Dodge', 'Hit', 'Death'].includes(this.action)) return false;
    if (this.actionSpec?.hit !== undefined && this.actionTime < this.actionSpec.hit + .08) return false;
    const length = Math.hypot(dx, dz);
    this.dodgeDirection = length > .01 ? { x: dx / length, z: dz / length } : { x: Math.sin(this.facing), z: Math.cos(this.facing) };
    this.stamina -= this.settings.dodgeCost; this.lastSpent = this.time; this.cooldowns.Dodge = .65; this.dodges++; this.queued = false;
    this.changeAction('Dodge', this.settings.dodgeDuration);
    this.events.push({ type: 'dodge', direction: { ...this.dodgeDirection }, duration: this.settings.dodgeDuration }); return true;
  }
  damage(amount, guarding = false, sourceId = null) {
    if (this.status !== 'playing' || this.invincible > 0 || (this.action === 'Dodge' && this.actionTime >= .04 && this.actionTime < .30) || (this.action === 'Leap' && this.heroHeight > .4)) return 0;
    let remaining = Math.max(0, amount), absorbed = 0;
    if (this.zone && Math.hypot(this.position.x - this.zone.x, this.position.z - this.zone.z) <= this.zone.radius) remaining *= .75;
    if (guarding && this.stamina >= 7) { this.stamina -= 7; this.lastSpent = this.time; remaining *= .65; this.blocked++; this.events.push({ type: 'block', sourceId }); }
    if (this.shield > 0 && this.shieldTime > 0) { absorbed = Math.min(remaining, this.shield); this.shield -= absorbed; remaining -= absorbed; this.shieldAbsorbed += absorbed; this.events.push({ type: 'shieldHit', amount: absorbed, remaining: this.shield, sourceId }); }
    remaining = Math.round(remaining); this.health = Math.max(0, this.health - remaining); this.damageTaken += remaining; this.invincible = .22;
    this.events.push({ type: 'damage', amount: remaining, absorbed, sourceId, health: this.health });
    if (this.health <= 0) { this.status = 'lost'; this.heroHeight = 0; this.changeAction('Death', .9); this.events.push({ type: 'lost' }); }
    else if (remaining > 0 && !this.action.startsWith('Attack') && !['Cleave', 'Leap'].includes(this.action)) { this.changeAction('Hit', .24); this.queued = false; }
    return remaining;
  }
  setEnemyState(enemy, state) { enemy.state = state; enemy.action = state; enemy.stateTime = 0; enemy.actionTime = 0; enemy.attackPhase = 0; }
  strike(enemy, amount, spec, origin = this.position) {
    if (enemy.dead || enemy.health <= 0) return;
    if (this.action.startsWith('Attack') && this.empoweredTime > 0) {
      amount = Math.round(amount * 1.2);
      const healed = Math.min(3, this.maxHealth - this.health); this.health += healed;
      if (healed > 0) this.events.push({ type: 'heal', amount: healed, health: this.health });
    }
    enemy.health = Math.max(0, enemy.health - amount); enemy.lastHitTime = this.time; this.hits++;
    const dx = enemy.x - origin.x, dz = enemy.z - origin.z, length = Math.hypot(dx, dz);
    const direction = length > .01 ? { x: dx / length, z: dz / length } : { x: Math.sin(this.facing), z: Math.cos(this.facing) };
    this.events.push({ type: 'hit', id: enemy.id, enemyId: enemy.id, amount, health: enemy.health, x: enemy.x, z: enemy.z, action: this.action, combo: this.combo, critical: this.action === 'Cleave' || this.action === 'Leap' || this.combo === 2 });
    if (spec.knockback > 0) { enemy.knockback = { direction, remaining: spec.knockback, speed: spec.knockback / .22 }; this.events.push({ type: 'knockback', id: enemy.id, enemyId: enemy.id, direction, distance: spec.knockback, duration: .22 }); }
    if (spec.airDuration > 0) { enemy.airDuration = spec.airDuration; enemy.airTime = spec.airDuration; enemy.airHeight = 0; this.setEnemyState(enemy, 'Airborne'); this.events.push({ type: 'airborne', id: enemy.id, duration: spec.airDuration, height: 1.6 }); }
    else { enemy.staggerTime = Math.max(enemy.staggerTime, spec.stagger || .18); this.setEnemyState(enemy, 'Stagger'); }
    if (enemy.health <= 0) { enemy.dead = true; enemy.diedAt = this.time; this.kills++; this.setEnemyState(enemy, 'Dead'); this.events.push({ type: 'destroyed', id: enemy.id, enemyId: enemy.id, x: enemy.x, z: enemy.z }); }
  }
  sweep(spec, emitSwing = true) {
    if (emitSwing) this.events.push({ type: 'swing', action: this.action, combo: this.combo, x: this.position.x, z: this.position.z, facing: this.facing, reach: spec.reach, halfAngle: spec.halfAngle });
    let hits = 0;
    for (const enemy of this.enemies) {
      const dx = enemy.x - this.position.x, dz = enemy.z - this.position.z, distance = Math.hypot(dx, dz);
      if (!enemy.dead && !this.hitTargets.has(enemy.id) && distance <= spec.reach + enemy.radius * .25 && Math.abs(angleDelta(this.facing, Math.atan2(dx, dz))) <= spec.halfAngle) { this.hitTargets.add(enemy.id); this.strike(enemy, spec.damage, spec); hits++; }
    }
    if (this.action === 'Cleave' && hits > 0) { this.empoweredTime = 6; this.events.push({ type: 'empowered', duration: 6, damageMultiplier: 1.2, healPerHit: 3 }); }
  }

  tick(dt, input = {}) {
    dt = clamp(Number.isFinite(dt) ? dt : 0, 0, .05);
    if (this.status !== 'playing') {
      this.actionTime += dt;
      // Keep the final guard's fall and death pose moving after the victory frame.
      // tickEnemy already prevents pursuit and attacks outside a playing session.
      if (this.status === 'won' || this.status === 'lost') for (const enemy of this.enemies) this.tickEnemy(enemy, dt, false);
      return;
    }
    this.time += dt;
    for (const key of Object.keys(this.cooldowns)) this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    this.empoweredTime = Math.max(0, this.empoweredTime - dt);
    if (this.zone) { this.zone.remaining = Math.max(0, this.zone.remaining - dt); this.zone.time = this.zone.remaining; if (!this.zone.remaining) { this.zone = null; this.events.push({ type: 'zoneEnd' }); } }
    if (this.shieldTime > 0) { this.shieldTime = Math.max(0, this.shieldTime - dt); if (!this.shieldTime) { this.shield = 0; this.events.push({ type: 'shieldExpired' }); } }
    if (this.time - this.lastSpent > .35) this.stamina = Math.min(this.maxStamina, this.stamina + this.settings.staminaRegen * dt);
    if (Number.isFinite(input.aimX) && Number.isFinite(input.aimZ)) this.setAim(input.aimX, input.aimZ);
    const oldTime = this.actionTime; this.actionTime += dt;
    let dx = 0, dz = 0;
    const airborne = this.action === 'Leap';
    if (airborne) {
      const spec = SKILLS.R, progress = clamp((this.actionTime - spec.takeoff) / (spec.land - spec.takeoff), 0, 1), t = smooth(progress);
      this.heroHeight = 4 * spec.height * progress * (1 - progress);
      this.position = { x: this.leap.from.x + (this.leap.target.x - this.leap.from.x) * t, z: this.leap.from.z + (this.leap.target.z - this.leap.from.z) * t };
      if (!this.leap.landed && this.actionTime >= spec.land) {
        this.leap.landed = true; this.heroHeight = 0; this.position = { ...this.leap.target };
        this.events.push({ type: 'slam', x: this.position.x, z: this.position.z, radius: spec.radius, damage: spec.damage });
        this.zone = { x: this.position.x, z: this.position.z, radius: spec.radius, duration: 4, remaining: 4, time: 4, damageReduction: .25, slowFactor: .7 };
        this.events.push({ type: 'zoneStart', ...this.zone });
        for (const enemy of this.enemies) if (!enemy.dead && Math.hypot(enemy.x - this.position.x, enemy.z - this.position.z) <= spec.radius + enemy.radius * .25) this.strike(enemy, spec.damage, spec);
      }
    } else if (this.action === 'Dodge') {
      const before = clamp(oldTime / this.settings.dodgeDuration, 0, 1), after = clamp(this.actionTime / this.settings.dodgeDuration, 0, 1);
      const distance = this.settings.dodgeDistance * (smooth(after) - smooth(before)); dx = this.dodgeDirection.x * distance; dz = this.dodgeDirection.z * distance;
    } else if (this.actionSpec?.hit !== undefined) {
      const spec = this.actionSpec;
      const before = clamp((oldTime - spec.stepStart) / (spec.stepEnd - spec.stepStart), 0, 1), after = clamp((this.actionTime - spec.stepStart) / (spec.stepEnd - spec.stepStart), 0, 1);
      const distance = spec.step * (smooth(after) - smooth(before)); dx = Math.sin(this.facing) * distance; dz = Math.cos(this.facing) * distance;
    } else if (!['Hit', 'Death'].includes(this.action)) {
      const length = Math.hypot(input.x || 0, input.z || 0);
      if (length > .01) {
        const running = input.sprint && this.stamina > 1 && !input.guard && this.action !== 'GuardCast';
        const speed = (running ? this.settings.runSpeed : this.settings.walkSpeed) * (input.guard ? .65 : 1);
        dx = input.x / length * speed * dt; dz = input.z / length * speed * dt;
        if (running) { this.stamina = Math.max(0, this.stamina - 10 * dt); this.lastSpent = this.time; }
        if (this.aim) this.aimFacing(); else this.facing += angleDelta(this.facing, Math.atan2(input.x, input.z)) * Math.min(1, dt * 18);
        if (this.action !== 'GuardCast' && this.action !== (running ? 'Run' : 'Walk')) this.changeAction(running ? 'Run' : 'Walk');
      } else if (this.action !== 'GuardCast' && this.action !== 'Idle') this.changeAction('Idle');
      if (!length && this.aim) this.aimFacing();
    }
    if (!airborne) {
      const bodies = this.enemies.filter(enemy => !enemy.dead).map(enemy => ({ x: enemy.x, z: enemy.z, radius: enemy.radius }));
      this.position = resolveWarlordMovement(this.position, dx, dz, [...this.colliders, ...bodies], this.settings.radius, this.settings.arenaRadius);
    }
    if (this.actionSpec?.hit !== undefined && this.actionTime >= this.actionSpec.hit && oldTime < this.actionSpec.activeEnd) {
      const first = !this.hitApplied; this.hitApplied = true; this.sweep(this.actionSpec, first);
    }
    if (this.action.startsWith('Attack') && this.queued && this.actionTime >= this.actionDuration - .06 && this.stamina >= 3) { this.combo = (this.combo + 1) % 3; this.beginAttack(); }
    else if (this.actionTime >= this.actionDuration) { this.heroHeight = 0; this.changeAction('Idle'); }
    for (const enemy of this.enemies) this.tickEnemy(enemy, dt, Boolean(input.guard));
    if (this.status === 'playing' && this.enemies.length > 0 && this.enemies.every(enemy => enemy.dead)) { this.status = 'won'; this.heroHeight = 0; this.changeAction('Victory'); this.events.push({ type: 'won', time: this.time, kills: this.kills }); }
  }

  tickEnemy(enemy, dt, guarding) {
    enemy.stateTime += dt; enemy.actionTime += dt; enemy.cooldown = Math.max(0, enemy.cooldown - dt);
    enemy.slowTime = Math.max(0, enemy.slowTime - dt);
    if (enemy.knockback?.remaining > 0) {
      const distance = Math.min(enemy.knockback.remaining, enemy.knockback.speed * dt);
      const next = resolveWarlordMovement(enemy, enemy.knockback.direction.x * distance, enemy.knockback.direction.z * distance, this.colliders, enemy.radius, this.settings.arenaRadius);
      enemy.x = next.x; enemy.z = next.z; enemy.knockback.remaining -= distance;
      if (enemy.knockback.remaining <= .00001) enemy.knockback = null;
    }
    if (enemy.airTime > 0) {
      enemy.airTime = Math.max(0, enemy.airTime - dt); const t = 1 - enemy.airTime / enemy.airDuration; enemy.airHeight = Math.sin(t * Math.PI) * 1.6;
      if (!enemy.airTime) { enemy.airHeight = 0; if (!enemy.dead) { enemy.staggerTime = Math.max(enemy.staggerTime, .30); this.setEnemyState(enemy, 'Stagger'); this.events.push({ type: 'enemyLand', id: enemy.id }); } }
    }
    if (enemy.dead) { enemy.position.x = enemy.x; enemy.position.z = enemy.z; return; }
    if (enemy.airTime > 0) { enemy.position.x = enemy.x; enemy.position.z = enemy.z; return; }
    if (enemy.staggerTime > 0) {
      enemy.staggerTime = Math.max(0, enemy.staggerTime - dt);
      if (!enemy.staggerTime) { this.setEnemyState(enemy, 'Idle'); enemy.cooldown = Math.max(enemy.cooldown, .12); }
      enemy.position.x = enemy.x; enemy.position.z = enemy.z; return;
    }
    if (this.status !== 'playing') return;
    const dx = this.position.x - enemy.x, dz = this.position.z - enemy.z, distance = Math.hypot(dx, dz);
    if (enemy.state === 'Windup') {
      enemy.attackPhase = clamp(enemy.stateTime / enemy.attackWindup, 0, 1);
      if (enemy.stateTime >= enemy.attackWindup) {
        const angle = Math.atan2(dx, dz), hit = distance < enemy.attackRange + this.settings.radius && Math.abs(angleDelta(enemy.attackFacing, angle)) < .9;
        this.setEnemyState(enemy, 'Attack'); enemy.hitApplied = true;
        this.events.push({ type: 'enemyAttack', id: enemy.id, x: enemy.x, z: enemy.z, facing: enemy.attackFacing, range: enemy.attackRange, hit });
        if (hit) this.damage(enemy.damage, guarding, enemy.id);
      }
    } else if (enemy.state === 'Attack') {
      if (enemy.stateTime >= .16) this.setEnemyState(enemy, 'Recover');
    } else if (enemy.state === 'Recover') {
      if (enemy.stateTime >= .60) { this.setEnemyState(enemy, 'Idle'); enemy.cooldown = .35; }
    } else if (distance <= enemy.attackRange && enemy.cooldown <= 0) {
      this.setEnemyState(enemy, 'Windup'); enemy.attackFacing = Math.atan2(dx, dz); enemy.facing = enemy.attackFacing;
      this.events.push({ type: 'enemyWindup', id: enemy.id, x: enemy.x, z: enemy.z, facing: enemy.facing, duration: enemy.attackWindup, range: enemy.attackRange });
    } else if (distance > enemy.attackRange * .9 && distance < 16) {
      if (enemy.state !== 'Run') this.setEnemyState(enemy, 'Run');
      let vx = dx / Math.max(distance, .001), vz = dz / Math.max(distance, .001);
      for (const other of this.enemies) if (other !== enemy && !other.dead) { const ox = enemy.x - other.x, oz = enemy.z - other.z, separation = Math.hypot(ox, oz); if (separation < 1.25 && separation > .001) { vx += ox / separation * (1.25 - separation) * 1.3; vz += oz / separation * (1.25 - separation) * 1.3; } }
      const zoneSlow = this.zone && Math.hypot(enemy.x - this.zone.x, enemy.z - this.zone.z) <= this.zone.radius ? .7 : 1;
      const speed = enemy.speed * Math.min(enemy.slowTime > 0 ? enemy.slowFactor : 1, zoneSlow);
      const length = Math.hypot(vx, vz), next = resolveWarlordMovement(enemy, vx / Math.max(length, .001) * speed * dt, vz / Math.max(length, .001) * speed * dt, this.colliders, enemy.radius, this.settings.arenaRadius);
      enemy.x = next.x; enemy.z = next.z; enemy.facing += angleDelta(enemy.facing, Math.atan2(dx, dz)) * Math.min(1, dt * 10);
    } else if (enemy.state !== 'Idle') this.setEnemyState(enemy, 'Idle');
    enemy.position.x = enemy.x; enemy.position.z = enemy.z;
  }
  drainEvents() { return this.events.splice(0); }
}

export function autopilot(session, dt, memory = {}) {
  if (session.status !== 'playing') return {};
  const target = session.enemies.filter(enemy => !enemy.dead).map(enemy => ({ enemy, distance: Math.hypot(enemy.x - session.position.x, enemy.z - session.position.z) })).sort((a, b) => a.distance - b.distance)[0];
  if (!target) return {};
  const enemy = target.enemy, point = { x: enemy.x, z: enemy.z }, dx = enemy.x - session.position.x, dz = enemy.z - session.position.z;
  const nearby = session.enemies.filter(e => !e.dead && Math.hypot(e.x - session.position.x, e.z - session.position.z) < 4);
  session.setAim(point.x, point.z);
  if (session.cooldowns.E <= 0 && (nearby.length >= 2 || session.health < session.maxHealth * .8 || target.distance < 2.7)) session.skill('E');
  if (session.cooldowns.R <= 0 && target.distance < 5.2 && session.canCommit()) {
    const cluster = session.enemies.filter(e => !e.dead && Math.hypot(e.x - enemy.x, e.z - enemy.z) < 3);
    const destination = { x: cluster.reduce((a, e) => a + e.x, 0) / cluster.length, z: cluster.reduce((a, e) => a + e.z, 0) / cluster.length };
    if (session.skill('R', destination)) return { aimX: point.x, aimZ: point.z };
  }
  if (target.distance < 3.3 && session.cooldowns.Q <= 0 && session.canCommit()) session.skill('Q', point);
  if (enemy.state === 'Windup' && enemy.attackPhase > .82 && target.distance < 2.1 && session.shield <= 0) session.dodge(-dx, -dz);
  memory.attackClock = (memory.attackClock || 0) - dt;
  if (target.distance <= 2.55 && memory.attackClock <= 0) { session.attack(point); memory.attackClock = .17; }
  return { x: target.distance > 2.45 ? dx : 0, z: target.distance > 2.45 ? dz : 0, sprint: target.distance > 4.5, guard: enemy.state === 'Windup' && enemy.attackPhase > .8, aimX: point.x, aimZ: point.z };
}
