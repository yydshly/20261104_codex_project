import test from 'node:test';
import assert from 'node:assert/strict';
import { WarlordSession, ATTACKS, SKILLS, WARLORD_SETTINGS, resolveWarlordMovement, autopilot } from '../src/warlord-logic.js';

const quiet = (id = 'guard-1', x = 0, z = 0, extra = {}) => ({ id, x, z, maxHealth: 500, speed: 1e-8, attackRange: .01, attackWindup: 99, ...extra });
function setup(enemies = [quiet()], options = {}) { const s = new WarlordSession(enemies, [], options); s.start(); s.position = { x: 0, z: 2.5 }; s.facing = Math.PI; s.drainEvents(); return s; }
function advance(s, seconds, input = {}, dt = .01) { for (let t = 0; t < seconds - 1e-9; t += dt) s.tick(Math.min(dt, seconds - t), input); }
const near = (a, b, epsilon = 1e-5) => assert(Math.abs(a - b) < epsilon, `${a} ≠ ${b}`);

test('reset creates independent enemies and clears all hero combat state', () => {
  const s = setup(); s.skill('E'); s.empoweredTime = 2; s.zone = { remaining: 2 }; s.health = 10; s.reset();
  assert.equal(s.status, 'playing'); assert.equal(s.health, 240); assert.equal(s.shield, 0); assert.equal(s.empoweredTime, 0); assert.equal(s.zone, null);
  assert.deepEqual(s.cooldowns, { Q: 0, E: 0, R: 0, Dodge: 0 }); assert.equal(s.heroHeight, 0); assert.equal(s.enemies[0].health, 500);
  s.enemies[0].position.x = 99; s.reset(); assert.equal(s.enemies[0].position.x, 0);
});

test('walking can face a world aim point independently of movement', () => {
  const s = setup([quiet('distant', 0, -30)]);
  advance(s, .2, { x: 1, z: 0, aimX: 0, aimZ: -10 });
  assert(s.position.x > .6); assert(s.facing < -3 || s.facing > 3); assert.equal(s.action, 'Walk');
});

test('an enemy behind the hero never causes an unconditional attack snap', () => {
  const s = setup([quiet('behind', 0, 4.5)]); assert(s.attack()); advance(s, .8);
  near(Math.abs(s.facing), Math.PI); assert.equal(s.enemies[0].health, 500); assert.equal(s.hits, 0);
});

test('one attack waits for its hit window, hits once, and cannot auto-chain', () => {
  const s = setup(); s.attack(); advance(s, ATTACKS[0].hit - .01);
  assert.equal(s.enemies[0].health, 500); assert(s.position.z < 2.5, 'weight shifts into the attack before contact');
  advance(s, .025); assert.equal(s.enemies[0].health, 478);
  advance(s, 2); assert.equal(s.enemies[0].health, 478); assert.equal(s.hits, 1); assert.equal(s.action, 'Idle');
});

test('three deliberately buffered attacks have distinct windows and third-strike knockback', () => {
  const s = setup(); s.attack(); let buffer = .16;
  for (let t = 0; t < 2.6; t += .01) { if (t >= buffer && t < 1.6) { s.attack(); buffer += .17; } s.tick(.01); }
  const hits = s.drainEvents().filter(e => e.type === 'hit');
  assert.deepEqual(hits.slice(0, 3).map(e => e.amount), [22, 26, 38]);
  assert.deepEqual(hits.slice(0, 3).map(e => e.action), ['Attack1', 'Attack2', 'Attack3']);
  assert(s.enemies[0].z < -.9, 'enemy body moves under the finisher');
});

test('a narrow normal attack misses a side target that broad Q can strike', () => {
  const s = setup([quiet('side', 2, 1.25)]); s.attack(); advance(s, .8);
  assert.equal(s.enemies[0].health, 500);
  assert(s.skill('Q', { x: 0, z: -10 })); advance(s, .5);
  assert.equal(s.enemies[0].health, 442); assert(s.enemies[0].staggerTime > 0);
});

test('Q has one damage window, hits multiple enemies and sets real six-second empowerment', () => {
  const s = setup([quiet('left', -.8, 0), quiet('right', .8, 0), quiet('behind', 0, 5)]);
  assert(s.skill('Q', { x: 0, z: 0 })); advance(s, .40); assert.equal(s.hits, 0);
  advance(s, .05); assert.equal(s.hits, 2); assert(s.empoweredTime > 5.9);
  advance(s, .8); assert.equal(s.hits, 2); assert.equal(s.enemies[2].health, 500);
  assert(s.drainEvents().some(e => e.type === 'empowered'));
});

test('a missed Q does not empower; cooldown rejects recast and later becomes available', () => {
  const s = setup([quiet('far', 0, -30)]); s.skill('Q'); assert.equal(s.skill('Q'), false); advance(s, 1.2);
  assert.equal(s.empoweredTime, 0); assert(s.cooldowns.Q > 3); advance(s, 3.7); assert.equal(s.cooldowns.Q, 0); assert(s.skill('Q'));
});

test('Q empowerment increases subsequent normal attack damage and heals actual missing health', () => {
  const s = setup(); s.health = 100; s.skill('Q', { x: 0, z: 0 }); advance(s, 1.1);
  const before = s.enemies[0].health; s.attack({ x: s.enemies[0].x, z: s.enemies[0].z }); advance(s, .4);
  assert.equal(before - s.enemies[0].health, Math.round(22 * 1.2)); assert.equal(s.health, 103);
});

test('Q active interval can catch a later entering guard once, but not after recovery begins', () => {
  const s = setup([quiet('late', 8, 0)]); s.skill('Q', { x: 0, z: 0 }); advance(s, .44); assert.equal(s.hits, 0);
  s.enemies[0].x = 0; s.enemies[0].z = 0; advance(s, .1); assert.equal(s.hits, 1); assert.equal(s.enemies[0].health, 442); advance(s, .4); assert.equal(s.hits, 1);
  const after = setup([quiet('too-late', 8, 0)]); after.skill('Q', { x: 0, z: 0 }); advance(after, .6); after.enemies[0].x = 0; after.enemies[0].z = 0; advance(after, .2); assert.equal(after.hits, 0);
});

test('Q empowerment expires rather than permanently changing normal attack damage', () => {
  const s = setup(); s.skill('Q', { x: 0, z: 0 }); advance(s, 6.6); assert.equal(s.empoweredTime, 0);
  const before = s.enemies[0].health; s.attack({ x: 0, z: s.enemies[0].z }); advance(s, .4); assert.equal(before - s.enemies[0].health, 22);
});

test('E scales from 90 to 130 shield by nearby enemies and applies a real slow', () => {
  for (const [count, amount] of [[0, 90], [1, 90], [2, 110], [3, 130]]) {
    const enemies = count ? Array.from({ length: count }, (_, i) => quiet(`g${i}`, -1 + i, 0)) : [quiet('far', 0, -30)];
    const s = setup(enemies); assert(s.skill('E')); assert.equal(s.shield, amount); assert.equal(s.cooldowns.E, 6);
    if (count) assert(s.enemies.every(e => e.slowTime === 1.4));
  }
});

test('E remains active while moving and absorbs damage without losing health or causing Hit', () => {
  const s = setup([quiet('far', 0, -30)]); s.skill('E'); advance(s, .15, { x: 1, z: 0 });
  assert(s.position.x > .4); const health = s.health; assert.equal(s.damage(40), 0); assert.equal(s.health, health); assert.equal(s.shield, 50); assert.notEqual(s.action, 'Hit');
  advance(s, 4.1); assert.equal(s.shield, 0); assert.equal(s.shieldTime, 0);
});

test('E slow reduces a real chasing guard displacement, not only a status field', () => {
  const plain = new WarlordSession([{ id: 'g', x: 0, z: .3, speed: 1.5 }]); plain.start();
  const slowed = new WarlordSession([{ id: 'g', x: 0, z: .3, speed: 1.5 }]); slowed.start(); slowed.skill('E');
  advance(plain, .4); advance(slowed, .4); assert(slowed.enemies[0].z < plain.enemies[0].z - .2);
});

test('E can protect during an attack without resetting the committed attack timeline', () => {
  const s = setup(); s.attack(); advance(s, .1); const time = s.actionTime;
  assert(s.skill('E')); assert.equal(s.action, 'Attack1'); near(s.actionTime, time); assert(s.shield > 0);
});

test('R clamps its chosen landing point, rises through a parabola and lands once', () => {
  const s = setup([quiet('far', 0, -30)]); const start = { ...s.position }; assert(s.skill('R', { x: 0, z: -100 }));
  near(Math.hypot(s.leap.target.x - start.x, s.leap.target.z - start.z), 5.5);
  advance(s, .17); near(s.heroHeight, 0); advance(s, .38); assert(s.heroHeight > 2.8); advance(s, .4); near(s.heroHeight, 0);
  advance(s, .6); assert.equal(s.drainEvents().filter(e => e.type === 'slam').length, 1); assert.equal(s.action, 'Idle');
});

test('R only damages on landing and launches enemies into a timed airborne state', () => {
  const s = setup([quiet('landing', 0, -1)]); s.skill('R', { x: 0, z: -1 }); advance(s, .9);
  assert.equal(s.enemies[0].health, 500); advance(s, .05); assert.equal(s.enemies[0].health, 424);
  assert.equal(s.enemies[0].state, 'Airborne'); assert(s.enemies[0].airTime > .6); advance(s, .25); assert(s.enemies[0].airHeight > 1);
  advance(s, .8); assert.equal(s.enemies[0].airHeight, 0); assert.equal(s.hits, 1);
});

test('R zone lasts four seconds, reduces hero damage and actually slows a pursuer', () => {
  const s = setup([quiet('landing', 0, -1)]); s.skill('R', { x: 0, z: -1 }); advance(s, 1.3);
  assert(s.zone && s.zone.remaining > 3.5); assert.equal(s.damage(20), 15); advance(s, 4.1); assert.equal(s.zone, null);
  const plain = new WarlordSession([{ id: 'g', x: 0, z: -1, speed: 1.5 }]); plain.start(); plain.position = { x: 0, z: 3 };
  const slowed = new WarlordSession([{ id: 'g', x: 0, z: -1, speed: 1.5 }]); slowed.start(); slowed.position = { x: 0, z: 3 }; slowed.zone = { x: 0, z: -1, radius: 8, remaining: 4, time: 4 };
  advance(plain, .5); advance(slowed, .5); assert(slowed.enemies[0].z < plain.enemies[0].z - .15);
});

test('dodge consumes once, normalizes direction, and uses an explicit invulnerability window', () => {
  const s = setup([quiet('far', 0, -30)]); const start = { ...s.position }; assert(s.dodge(3, 4)); assert.equal(s.stamina, 80); assert.equal(s.dodge(1, 0), false);
  advance(s, .1); const health = s.health; assert.equal(s.damage(20), 0); assert.equal(s.health, health);
  advance(s, .31); near(Math.hypot(s.position.x - start.x, s.position.z - start.z), WARLORD_SETTINGS.dodgeDistance);
  assert.equal(s.damage(20), 20);
});

test('a committed attack cannot be evaded before contact but can cancel in recovery', () => {
  const s = setup([quiet('far', 0, -30)]); s.attack(); advance(s, .1); assert.equal(s.dodge(1, 0), false); advance(s, .25); assert(s.dodge(1, 0));
});

test('guards pursue, visibly wind up, attack once, then recover before another attack', () => {
  const s = new WarlordSession([{ id: 'pursuer', x: 0, z: -.5, maxHealth: 500 }]); s.start(); const original = s.enemies[0].z;
  advance(s, .5); assert(s.enemies[0].z > original + .5); assert.equal(s.enemies[0].state, 'Run');
  let sawWindup = false, attackAt = null;
  for (let t = 0; t < 4; t += .01) { s.tick(.01); const events = s.drainEvents(); if (events.some(e => e.type === 'enemyWindup')) sawWindup = true; if (events.some(e => e.type === 'enemyAttack')) { attackAt = s.time; break; } }
  assert(sawWindup); assert(attackAt); assert.equal(s.health, 226); advance(s, .5); assert.equal(s.health, 226); assert.equal(s.enemies[0].state, 'Recover');
});

test('Q interrupts an enemy windup with real stagger and knockback', () => {
  const s = setup([quiet('guard', 0, .5, { attackWindup: .58 })]); const e = s.enemies[0]; s.setEnemyState(e, 'Windup'); e.attackFacing = 0;
  s.skill('Q', { x: 0, z: .5 }); advance(s, .5); assert.equal(e.state, 'Stagger'); assert(e.z < .5); assert.equal(s.health, 240);
  assert.equal(s.drainEvents().filter(event => event.type === 'enemyAttack').length, 0);
});

test('dead enemies stop AI and stop contributing body collision', () => {
  const s = setup([quiet('victim', 0, 0), quiet('far', 0, -30)]); const e = s.enemies[0]; s.strike(e, 999, { stagger: .2, knockback: 0 });
  assert(e.dead); assert.equal(e.state, 'Dead'); s.position = { x: 0, z: 1 }; advance(s, .6, { x: 0, z: -1 });
  assert(s.position.z < -.8); assert.equal(s.drainEvents().filter(event => event.type === 'enemyAttack').length, 0);
});

test('death locks inputs and reset restores HP, enemies, cooldowns, buffs, and world position', () => {
  const s = setup(); s.damage(999); assert.equal(s.status, 'lost'); assert.equal(s.action, 'Death'); assert.equal(s.attack(), false); assert.equal(s.skill('E'), false);
  const position = { ...s.position }; advance(s, 1, { x: 1, z: 0 }); assert.deepEqual(s.position, position);
  s.reset(); assert.equal(s.health, s.maxHealth); assert.deepEqual(s.position, { x: 0, z: 3 }); assert(s.enemies.every(e => !e.dead && e.health === e.maxHealth));
});

test('victory is only emitted once after every guard actually dies', () => {
  const s = setup([quiet('fragile', 0, 0, { maxHealth: 1 })]); s.skill('Q', { x: 0, z: 0 }); advance(s, .5);
  assert.equal(s.status, 'won'); assert.equal(s.action, 'Victory'); assert.equal(s.kills, 1); assert.equal(s.drainEvents().filter(e => e.type === 'won').length, 1);
  advance(s, 1); assert.equal(s.drainEvents().filter(e => e.type === 'won').length, 0);
});

test('the final guard finishes falling after victory without resuming combat or the timer', () => {
  const s = setup([quiet('fragile', 0, 0, { maxHealth: 1 })]); s.skill('R', { x: 0, z: 0 }); advance(s, 1);
  const enemy = s.enemies[0], wonAt = s.time; assert.equal(s.status, 'won'); assert(enemy.airHeight > 0); assert.equal(enemy.state, 'Dead');
  advance(s, 1); assert.equal(enemy.airHeight, 0); assert(enemy.stateTime > 1); assert.equal(s.time, wonAt);
  assert.equal(s.drainEvents().filter(e => e.type === 'enemyAttack').length, 0);
});

test('collision remains finite at box edges and arena bounds', () => {
  const edge = resolveWarlordMovement({ x: 1, z: 0 }, 0, 0, [{ x: 0, z: 0, halfX: 1, halfZ: 1 }]); assert(edge.x >= 1.4 || Math.abs(edge.z) >= 1.4);
  const bound = resolveWarlordMovement({ x: 10, z: 0 }, 99, 99, []); near(Math.hypot(bound.x, bound.z), 10.5);
});

for (const dt of [1 / 120, 1 / 60, 1 / 30, .05]) test(`complete real-rule autopilot defeats all dynamic guards at dt=${dt.toFixed(5)}`, () => {
  const s = new WarlordSession(); s.start(); const memory = {}; let eventHits = 0;
  for (let i = 0; i < 150 / dt && s.status === 'playing'; i++) { s.tick(dt, autopilot(s, dt, memory)); eventHits += s.drainEvents().filter(e => e.type === 'hit').length; }
  assert.equal(s.status, 'won'); assert.equal(s.kills, 3); assert(s.enemies.every(e => e.dead && e.health === 0)); assert(eventHits > 3); assert(s.time > 3 && s.time < 30); assert(s.health > 0);
  assert(s.skillUses.Q > 0 && s.skillUses.E > 0 && s.skillUses.R > 0);
});
