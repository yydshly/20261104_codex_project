import test from 'node:test';
import assert from 'node:assert/strict';
import { SETTINGS, TrialSession, autopilot, angleDelta, moveWithCollisions } from '../src/game-logic.js';

const epsilon = 1e-7;
const near = (actual, expected, message) => assert(Math.abs(actual - expected) < epsilon, `${message || 'Expected values near'}: ${actual} vs ${expected}`);
const crystal = (id = 'near', x = 0, z = 1.4, maxHealth = 100) => ({ id, position: { x, z }, radius: .67, maxHealth });

function session(targets = [crystal()], colliders = [], safe = true) {
  const game = new TrialSession(targets, colliders);
  game.start();
  game.drainEvents();
  if (safe) game.targets.forEach(target => target.cooldown = Infinity);
  return game;
}

function advance(game, seconds, input = {}, dt = .01) {
  let remaining = seconds;
  while (remaining > 1e-9) {
    const step = Math.min(remaining, dt);
    game.tick(step, input);
    remaining -= step;
  }
}

function distanceToBox(position, box) {
  const x = Math.max(box.x - box.halfX, Math.min(box.x + box.halfX, position.x));
  const z = Math.max(box.z - box.halfZ, Math.min(box.z + box.halfZ, position.z));
  return Math.hypot(position.x - x, position.z - z);
}

test('movement has identical cardinal and diagonal speed, and sprint trades stamina for distance', () => {
  const cardinal = session([crystal('far', 0, -9)]), diagonal = session([crystal('far', 0, -9)]), running = session([crystal('far', 0, -9)]);
  advance(cardinal, 1, { x: 1, z: 0 });
  advance(diagonal, 1, { x: 1, z: -1 });
  advance(running, 1, { x: 1, z: 0, sprint: true });
  near(Math.hypot(cardinal.position.x, cardinal.position.z - 3), SETTINGS.walkSpeed);
  near(Math.hypot(diagonal.position.x, diagonal.position.z - 3), SETTINGS.walkSpeed);
  near(running.position.x, SETTINGS.runSpeed);
  assert.equal(cardinal.action, 'Walk');
  assert.equal(running.action, 'Run');
  assert(running.stamina < cardinal.stamina);
});

test('circular collision resolves overlap and remains finite at an obstacle center', () => {
  const obstacle = { x: 1, z: 1, radius: .6 };
  for (const initial of [{ x: 1, z: 1 }, { x: 1.05, z: 1.05 }, { x: .5, z: 1 }]) {
    const moved = moveWithCollisions(initial, 0, 0, [obstacle]);
    assert(Number.isFinite(moved.x) && Number.isFinite(moved.z));
    assert(Math.hypot(moved.x - 1, moved.z - 1) >= obstacle.radius + SETTINGS.radius - epsilon);
  }
});

test('box collision handles interior, exact edge, exact corner and tiny exterior overlap', () => {
  const box = { x: 0, z: 0, halfX: 1, halfZ: 1 };
  for (const initial of [{ x: 0, z: 0 }, { x: 1, z: 0 }, { x: 1, z: 1 }, { x: 1.000001, z: .2 }, { x: .8, z: .9 }]) {
    const moved = moveWithCollisions(initial, 0, 0, [box]);
    assert(distanceToBox(moved, box) >= SETTINGS.radius - epsilon, `Player still overlaps box from ${JSON.stringify(initial)}`);
  }
});

test('movement slides along a wall without penetrating and respects the arena boundary', () => {
  const box = { x: 1, z: 0, halfX: .2, halfZ: 3 };
  let position = { x: 0, z: -1 };
  for (let i = 0; i < 40; i++) position = moveWithCollisions(position, .1, .04, [box]);
  assert(position.x <= box.x - box.halfX - SETTINGS.radius + epsilon);
  assert(position.z > 0, 'Tangential motion should not be blocked');
  const edge = moveWithCollisions({ x: 9, z: 0 }, 20, 20, []);
  near(Math.hypot(edge.x, edge.z), SETTINGS.arenaRadius);
});

test('a single attack input hits once at its active time and never auto-chains', () => {
  const game = session([crystal('durable', 0, 1.4, 500)]);
  assert.equal(game.attack(), true);
  near(game.stamina, 100 - SETTINGS.attackCost);
  advance(game, game.actionDuration * .4);
  assert.equal(game.targets[0].health, 500, 'Windup must not deal damage');
  advance(game, .05);
  assert.equal(game.targets[0].health, 482);
  advance(game, 2);
  assert.equal(game.targets[0].health, 482, 'Recovery and idle must not reapply the hit');
  assert.equal(game.action, 'Idle');
  const events = game.drainEvents();
  assert.equal(events.filter(event => event.type === 'attack').length, 1);
  assert.equal(events.filter(event => event.type === 'swing').length, 1);
  assert.equal(events.filter(event => event.type === 'hit').length, 1);
});

test('attack cone excludes targets behind the player and targets beyond weapon reach', () => {
  const game = session([crystal('front', 0, 1.5), crystal('behind', 0, 4.8), crystal('too-far', 0, -1)]);
  game.attack();
  advance(game, .4);
  assert.deepEqual(game.targets.map(target => target.health), [82, 100, 100]);
  assert.deepEqual(game.drainEvents().filter(event => event.type === 'hit').map(event => event.id), ['front']);
});

test('only deliberately queued inputs advance the three-hit combo, with a stronger third strike', () => {
  const game = session([crystal('durable', 0, 1.4, 500)]);
  game.attack();
  advance(game, .13);
  assert.equal(game.attack(), false);
  assert.equal(game.queued, true);
  const firstDuration = game.actionDuration;
  advance(game, firstDuration - game.actionTime + .001);
  assert.equal(game.action, 'Attack2');
  advance(game, .13);
  game.attack();
  advance(game, game.actionDuration - game.actionTime + .001);
  assert.equal(game.action, 'Attack3');
  advance(game, game.actionDuration + .01);
  assert.equal(game.action, 'Idle');
  const events = game.drainEvents();
  assert.deepEqual(events.filter(event => event.type === 'attack').map(event => event.combo), [0, 1, 2]);
  assert.deepEqual(events.filter(event => event.type === 'hit').map(event => event.amount), [18, 18, 30]);
  assert.equal(game.targets[0].health, 434);
});

test('attacks and dodges reject insufficient stamina without spending or changing actions', () => {
  const game = session();
  game.stamina = SETTINGS.attackCost - .01;
  assert.equal(game.attack(), false);
  assert.equal(game.action, 'Idle');
  near(game.stamina, SETTINGS.attackCost - .01);
  game.stamina = SETTINGS.dodgeCost - .01;
  assert.equal(game.dodge(1, 0), false);
  assert.equal(game.dodges, 0);
  near(game.stamina, SETTINGS.dodgeCost - .01);
});

test('dodge consumes stamina once, normalizes direction and is invulnerable only during its window', () => {
  const game = session([crystal('far', 0, -9)]);
  assert.equal(game.dodge(5, 0), true);
  near(game.stamina, 100 - SETTINGS.dodgeCost);
  near(game.dodgeDirection.x, 1);
  assert.equal(game.dodge(0, -1), false);
  advance(game, .37);
  game.damage(18);
  assert.equal(game.health, 100);
  assert(game.position.x > 2 && game.position.x < 3, 'Dodge should translate the player');
  advance(game, .02);
  game.damage(18);
  assert.equal(game.health, 82, 'Late dodge recovery is vulnerable');
  assert.equal(game.action, 'Hit');
  assert.equal(game.dodges, 1);
});

test('successful guard reduces damage and spends stamina; exhausted guard breaks into hit reaction', () => {
  const guarded = session();
  guarded.changeAction('Block');
  guarded.damage(18, true);
  assert.equal(guarded.health, 96);
  assert.equal(guarded.stamina, 86);
  assert.equal(guarded.blocked, 1);
  assert.equal(guarded.action, 'Block');
  assert.equal(guarded.drainEvents().filter(event => event.type === 'block').length, 1);
  const exhausted = session();
  exhausted.stamina = 13;
  exhausted.changeAction('Block');
  exhausted.damage(18, true);
  assert.equal(exhausted.health, 82);
  assert.equal(exhausted.blocked, 0);
  assert.equal(exhausted.action, 'Hit');
  assert.equal(exhausted.stamina, 13);
});

test('hit invulnerability prevents duplicate damage, then expires', () => {
  const game = session();
  game.damage(18);
  game.damage(18);
  assert.equal(game.health, 82);
  advance(game, .59);
  game.damage(18);
  assert.equal(game.health, 82);
  advance(game, .02);
  game.damage(18);
  assert.equal(game.health, 64);
  assert.equal(game.damageTaken, 36);
});

test('enemy pulse telegraphs before damage and inactive/destroyed targets never pulse', () => {
  const game = session([crystal()], [], false);
  game.targets[0].cooldown = .05;
  advance(game, .06);
  assert.equal(game.health, 100);
  assert(game.targets[0].charge > .8);
  assert.equal(game.drainEvents().filter(event => event.type === 'warning').length, 1);
  advance(game, .95);
  assert.equal(game.health, 82);
  assert.equal(game.drainEvents().filter(event => event.type === 'pulse').length, 1);
  game.targets[0].health = 0;
  advance(game, 4);
  assert.equal(game.health, 82);
  assert.equal(game.status, 'won');
});

test('failure freezes player input and reset clears all combat state and restores targets', () => {
  const game = session();
  game.attack();
  advance(game, .15);
  game.attack();
  game.damage(200);
  assert.equal(game.status, 'lost');
  assert.equal(game.action, 'Death');
  const position = { ...game.position };
  assert.equal(game.attack(), false);
  assert.equal(game.dodge(1, 0), false);
  advance(game, 1, { x: 1, z: 1, sprint: true });
  assert.deepEqual(game.position, position);
  assert.equal(game.drainEvents().filter(event => event.type === 'lost').length, 1);
  game.reset();
  assert.equal(game.status, 'playing');
  assert.equal(game.health, 100); assert.equal(game.stamina, 100);
  assert.equal(game.hits, 0); assert.equal(game.damageTaken, 0); assert.equal(game.dodges, 0); assert.equal(game.blocked, 0);
  assert.equal(game.action, 'Idle'); assert.equal(game.queued, false); assert.equal(game.combo, 0);
  assert.deepEqual(game.position, { x: 0, z: 3 });
  assert(game.targets.every(target => target.health === target.maxHealth));
  assert.deepEqual(game.drainEvents(), []);
});

test('victory is emitted once, after every target is destroyed', () => {
  const game = session([crystal('one-hit', 0, 1.4, 18)]);
  game.attack();
  advance(game, .5);
  assert.equal(game.status, 'won');
  assert.equal(game.action, 'Victory');
  advance(game, 1);
  const events = game.drainEvents();
  assert.equal(events.filter(event => event.type === 'destroyed').length, 1);
  assert.equal(events.filter(event => event.type === 'won').length, 1);
});

test('stamina regeneration starts after the spending delay and never exceeds capacity', () => {
  const game = session([crystal('far', 0, -9)]);
  game.dodge(1, 0);
  const spent = game.stamina;
  advance(game, .39);
  near(game.stamina, spent);
  advance(game, .1);
  assert(game.stamina > spent);
  advance(game, 10);
  assert.equal(game.stamina, 100);
});

const arenaTargets = [crystal('crystal-1', 0, -3), crystal('crystal-2', -4.2, -2.2), crystal('crystal-3', 4.2, -2.2)];
// Retained crystal pedestals remain physical even after the crystal is destroyed.
// This uses the same obstacle contract and arena coordinates as the shipped scene.
const arenaObstacles = [
  ...arenaTargets.map(target => ({ x: target.position.x, z: target.position.z, radius: .58 })),
  { x: -8.7, z: -5.7, radius: .78 }, { x: 8.7, z: -5.7, radius: .78 },
  { x: -10.3, z: .3, radius: .78 }, { x: 10.3, z: .3, radius: .78 },
  { x: -8.7, z: 6.1, radius: .78 }, { x: 8.7, z: 6.1, radius: .78 },
  { x: -5.5, z: -9.5, radius: .78 }, { x: 5.5, z: -9.5, radius: .78 },
  { x: -2.77, z: -10.45, halfX: .58, halfZ: .62 }, { x: 2.77, z: -10.45, halfX: .58, halfZ: .62 },
  { x: -6.5, z: -6, radius: .63 }, { x: 6.5, z: -6, radius: .63 },
  { x: -7.4, z: 7, radius: .63 }, { x: 7.4, z: 7, radius: .63 },
];

for (const dt of [1 / 120, 1 / 60, 1 / 30, .05]) {
  test(`automatic demonstration clears all three 100 HP targets at dt=${dt.toFixed(5)}`, () => {
    const game = session(arenaTargets, arenaObstacles, false), memory = {};
    const counts = new Map();
    for (let elapsed = 0; elapsed < 60 && game.status === 'playing'; elapsed += dt) {
      const input = autopilot(game, dt, memory);
      game.tick(dt, input);
      assert(game.stamina >= 0 && game.stamina <= 100);
      assert(game.health >= 0 && game.health <= 100);
      assert(Math.hypot(game.position.x, game.position.z) <= SETTINGS.arenaRadius + epsilon);
      for (const event of game.drainEvents()) counts.set(event.type, (counts.get(event.type) || 0) + 1);
    }
    assert.equal(game.status, 'won', `Autopilot failed at ${JSON.stringify(game.position)}, target HP=${game.targets.map(target => target.health)}`);
    assert(game.time < 35, 'Automatic presentation should finish without stalling');
    assert(game.health > 0);
    assert(game.targets.every(target => target.health === 0));
    assert.equal(counts.get('destroyed'), 3);
    assert.equal(counts.get('won'), 1);
    assert(game.hits >= 15, 'Each 100 HP target needs a meaningful sequence of strikes');
    assert(game.dodges > 0, 'Automatic presentation must demonstrate defense as well as attack');
  });
}

test('angle interpolation crosses ±π by the short direction', () => {
  near(angleDelta(Math.PI - .05, -Math.PI + .05), .1);
  near(angleDelta(-Math.PI + .05, Math.PI - .05), -.1);
});
