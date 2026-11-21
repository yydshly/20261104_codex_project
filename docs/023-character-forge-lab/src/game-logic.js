export const SETTINGS = Object.freeze({ walkSpeed: 2.25, runSpeed: 4.15, dodgeSpeed: 7.4, dodgeDuration: .4, dodgeCost: 28, attackCost: 8, regen: 24, radius: .32, reach: 2.05, arenaRadius: 10.5 });

export function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
export function angleDelta(a, b) { return Math.atan2(Math.sin(b - a), Math.cos(b - a)); }

export function moveWithCollisions(position, dx, dz, colliders, radius = SETTINGS.radius) {
  let x = position.x + dx, z = position.z + dz;
  for (let pass = 0; pass < 2; pass++) for (const obstacle of colliders) {
    if (obstacle.radius !== undefined) {
      const ox = x - obstacle.x, oz = z - obstacle.z, distance = Math.hypot(ox, oz), min = radius + obstacle.radius;
      if (distance < min) { const a = distance > .0001 ? ox / distance : 1, b = distance > .0001 ? oz / distance : 0; x = obstacle.x + a * min; z = obstacle.z + b * min; }
    } else {
      const nearX = clamp(x, obstacle.x - obstacle.halfX, obstacle.x + obstacle.halfX), nearZ = clamp(z, obstacle.z - obstacle.halfZ, obstacle.z + obstacle.halfZ);
      const ox = x - nearX, oz = z - nearZ, distance = Math.hypot(ox, oz);
      if (distance < radius && distance > 0) { x = nearX + ox / distance * radius; z = nearZ + oz / distance * radius; }
      else if (!distance && Math.abs(x - obstacle.x) <= obstacle.halfX && Math.abs(z - obstacle.z) <= obstacle.halfZ) {
        if (obstacle.halfX - Math.abs(x - obstacle.x) < obstacle.halfZ - Math.abs(z - obstacle.z)) x = obstacle.x + (x >= obstacle.x ? 1 : -1) * (obstacle.halfX + radius);
        else z = obstacle.z + (z >= obstacle.z ? 1 : -1) * (obstacle.halfZ + radius);
      }
    }
  }
  const d = Math.hypot(x, z);
  if (d > SETTINGS.arenaRadius) { x *= SETTINGS.arenaRadius / d; z *= SETTINGS.arenaRadius / d; }
  return { x, z };
}

export class TrialSession {
  constructor(targets, colliders = [], durations = {}) {
    this.specs = targets.map(t => ({ id: t.id, x: t.position.x, z: t.position.z, radius: t.radius || .55, maxHealth: t.maxHealth || 60 }));
    this.colliders = colliders;
    this.durations = { Attack1: 1.0667 / 1.45, Attack2: 1 / 1.45, Attack3: 1.0667 / 1.45, Hit: .6667, Death: .8, ...durations };
    this.events = [];
    this.reset('intro');
  }
  reset(status = 'playing') {
    this.status = status; this.time = 0; this.health = 100; this.stamina = 100;
    this.position = { x: 0, z: 3 }; this.facing = Math.PI;
    this.action = 'Idle'; this.actionTime = 0; this.actionDuration = Infinity;
    this.combo = 0; this.queued = false; this.lastAttack = -10; this.lastSpent = -10;
    this.hitApplied = false; this.dodgeDirection = { x: 0, z: -1 }; this.invincible = 0;
    this.hits = 0; this.damageTaken = 0; this.dodges = 0; this.blocked = 0;
    this.targets = this.specs.map((t, i) => ({ ...t, health: t.maxHealth, cooldown: 1.2 + i * .6, charge: 0, wave: 0 }));
    this.events.length = 0;
  }
  start() { this.reset('playing'); this.events.push({ type: 'start' }); }
  changeAction(name, duration = Infinity) { this.action = name; this.actionTime = 0; this.actionDuration = duration; }
  attack() {
    if (this.status !== 'playing') return false;
    if (this.action.startsWith('Attack')) { if (this.actionTime > .1) this.queued = true; return false; }
    if (['Dodge', 'Hit', 'Death'].includes(this.action) || this.stamina < SETTINGS.attackCost) return false;
    this.combo = this.time - this.lastAttack < 1.4 ? (this.combo + 1) % 3 : 0;
    this.beginAttack(); return true;
  }
  beginAttack() {
    const nearby = this.targets.filter(t => t.health > 0).map(t => ({ t, d: Math.hypot(t.x - this.position.x, t.z - this.position.z) })).sort((a, b) => a.d - b.d)[0];
    if (nearby && nearby.d < 3.4) this.facing = Math.atan2(nearby.t.x - this.position.x, nearby.t.z - this.position.z);
    this.stamina = Math.max(0, this.stamina - SETTINGS.attackCost); this.lastSpent = this.time;
    this.lastAttack = this.time; this.hitApplied = false; this.queued = false;
    this.changeAction('Attack' + (this.combo + 1), this.durations['Attack' + (this.combo + 1)]);
    this.events.push({ type: 'attack', combo: this.combo });
  }
  dodge(dx = 0, dz = 0) {
    if (this.status !== 'playing' || ['Dodge', 'Hit'].includes(this.action) || this.stamina < SETTINGS.dodgeCost) return false;
    if (this.action.startsWith('Attack') && this.actionTime < .22) return false;
    const len = Math.hypot(dx, dz);
    this.dodgeDirection = len > .01 ? { x: dx / len, z: dz / len } : { x: Math.sin(this.facing), z: Math.cos(this.facing) };
    this.facing = Math.atan2(this.dodgeDirection.x, this.dodgeDirection.z);
    this.stamina -= SETTINGS.dodgeCost; this.lastSpent = this.time; this.dodges++;
    this.changeAction('Dodge', SETTINGS.dodgeDuration); this.queued = false;
    this.events.push({ type: 'dodge' }); return true;
  }
  damage(amount, guarding = false) {
    if (this.status !== 'playing' || this.invincible > 0 || (this.action === 'Dodge' && this.actionTime < .38)) return;
    const blocked = guarding && this.stamina >= 14;
    if (blocked) { this.stamina -= 14; this.lastSpent = this.time; amount = Math.round(amount * .2); this.blocked++; this.events.push({ type: 'block' }); }
    this.health = Math.max(0, this.health - amount); this.damageTaken += amount; this.invincible = .6;
    this.events.push({ type: 'damage', amount });
    if (this.health <= 0) { this.status = 'lost'; this.changeAction('Death', this.durations.Death); this.events.push({ type: 'lost' }); }
    else if (!blocked) { this.changeAction('Hit', .33); this.queued = false; }
  }
  tick(dt, input = {}) {
    dt = clamp(dt, 0, .05);
    if (this.status !== 'playing') { this.actionTime += dt; return; }
    this.time += dt; this.actionTime += dt; this.invincible = Math.max(0, this.invincible - dt);
    const guarding = input.guard && !['Dodge', 'Hit'].includes(this.action) && !this.action.startsWith('Attack');
    if (this.time - this.lastSpent > .4) this.stamina = Math.min(100, this.stamina + SETTINGS.regen * dt);
    if (this.action.startsWith('Attack')) {
      if (!this.hitApplied && this.actionTime >= this.actionDuration * .43) {
        this.hitApplied = true;
        this.events.push({ type: 'swing', combo: this.combo });
        for (const target of this.targets) {
          const dx = target.x - this.position.x, dz = target.z - this.position.z;
          if (target.health <= 0 || Math.hypot(dx, dz) > SETTINGS.reach + target.radius * .35 || Math.abs(angleDelta(this.facing, Math.atan2(dx, dz))) > 1.05) continue;
          const amount = this.combo === 2 ? 30 : 18;
          target.health = Math.max(0, target.health - amount); this.hits++;
          this.events.push({ type: 'hit', id: target.id, amount, health: target.health, combo: this.combo, x: target.x, z: target.z });
          if (target.health === 0) this.events.push({ type: 'destroyed', id: target.id, x: target.x, z: target.z });
        }
      }
      if (this.actionTime >= this.actionDuration) {
        if (this.queued && this.stamina >= SETTINGS.attackCost) { this.combo = (this.combo + 1) % 3; this.beginAttack(); }
        else this.changeAction('Idle');
      }
    } else if (['Dodge', 'Hit'].includes(this.action) && this.actionTime >= this.actionDuration) this.changeAction('Idle');
    const locked = ['Dodge', 'Hit'].includes(this.action) || this.action.startsWith('Attack');
    let dx = 0, dz = 0;
    if (this.action === 'Dodge') { const easing = 1 - .35 * this.actionTime / SETTINGS.dodgeDuration; dx = this.dodgeDirection.x * SETTINGS.dodgeSpeed * easing * dt; dz = this.dodgeDirection.z * SETTINGS.dodgeSpeed * easing * dt; }
    else if (!locked && !guarding) {
      const len = Math.hypot(input.x || 0, input.z || 0);
      if (len > .01) {
        const running = input.sprint && this.stamina > 1;
        if (running) { this.stamina = Math.max(0, this.stamina - 13 * dt); this.lastSpent = this.time; }
        const speed = running ? SETTINGS.runSpeed : SETTINGS.walkSpeed;
        dx = input.x / len * speed * dt; dz = input.z / len * speed * dt;
        this.facing += angleDelta(this.facing, Math.atan2(input.x, input.z)) * Math.min(1, dt * 16);
        if (this.action !== (running ? 'Run' : 'Walk')) this.changeAction(running ? 'Run' : 'Walk');
      } else if (this.action !== 'Idle') this.changeAction('Idle');
    } else if (guarding && this.action !== 'Block') this.changeAction('Block');
    if (!guarding && this.action === 'Block') this.changeAction('Idle');
    const obstacles = [...this.colliders, ...this.targets.filter(t => t.health > 0).map(t => ({ x: t.x, z: t.z, radius: t.radius * .8 }))];
    this.position = moveWithCollisions(this.position, dx, dz, obstacles);
    for (const target of this.targets) {
      if (target.health <= 0) { target.charge = 0; continue; }
      const distance = Math.hypot(target.x - this.position.x, target.z - this.position.z);
      if (target.charge > 0) {
        target.charge = Math.max(0, target.charge - dt);
        if (!target.charge) {
          target.wave = .65; target.cooldown = 3.4;
          this.events.push({ type: 'pulse', id: target.id, x: target.x, z: target.z });
          if (distance < 2.65) this.damage(18, guarding);
        }
      } else {
        target.wave = Math.max(0, target.wave - dt);
        target.cooldown -= dt;
        if (target.cooldown <= 0 && distance < 5.4) { target.charge = .95; this.events.push({ type: 'warning', id: target.id }); }
      }
    }
    if (this.status === 'playing' && this.targets.every(t => t.health <= 0)) {
      this.status = 'won'; this.changeAction('Victory'); this.events.push({ type: 'won' });
    }
  }
  drainEvents() { return this.events.splice(0); }
}

export function autopilot(session, dt, memory) {
  const target = session.targets.filter(t => t.health > 0).map(t => ({ ...t, distance: Math.hypot(t.x - session.position.x, t.z - session.position.z) })).sort((a, b) => a.distance - b.distance)[0];
  if (!target) return {};
  const dx = target.x - session.position.x, dz = target.z - session.position.z, distance = target.distance;
  if (target.charge > 0 && target.charge < .22 && distance < 3 && session.stamina >= SETTINGS.dodgeCost) session.dodge(-dx, -dz);
  if (distance > 1.65) return { x: dx, z: dz, sprint: distance > 3.2 };
  memory.attackClock = (memory.attackClock || 0) - dt;
  if (memory.attackClock <= 0) { session.attack(); memory.attackClock = .2; }
  return { guard: target.charge > 0 && target.charge < .15 };
}
