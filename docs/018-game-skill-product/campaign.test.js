import test from 'node:test';
import assert from 'node:assert/strict';
import { BEACON, CHAPTERS, TUNING } from './content.js';
import { createState, checkpoint, restoreCheckpoint, chooseUpgrade, stats, step } from './campaign.js';

const playing = (chapter = 0, upgrades = []) => { const state = createState(chapter, { upgrades }); state.phase = 'playing'; return state; };
function advance(state, seconds, input = {}) {
  for (let frame = 0; frame < Math.round(seconds / TUNING.step); frame++) step(state, input, TUNING.step);
}
test('fresh runs own independent enemies, rewards and totals', () => {
  const first = playing();
  first.enemies[0].hp = 0; first.pickups.push({ id: 0 }); first.score = 300; first.player.hp = 0;
  const next = createState();
  assert.equal(next.player.hp, 6); assert.equal(next.score, 0); assert.equal(next.enemies[0].hp, 3); assert.equal(next.pickups.length, 0);
});
test('pause freezes clock, enemies and action cooldowns', () => {
  const state = playing(); state.phase = 'paused';
  const before = structuredClone(state);
  advance(state, 2, { x: 1, attack: true });
  assert.deepEqual(state, before);
});
test('simultaneous dash and swing resolves to dash', () => {
  const state = playing();
  step(state, { dash: true, attack: true }, TUNING.step);
  assert.equal(state.totals.dashes, 1); assert.equal(state.player.attack, 0);
});
test('attack only hits the facing sector and cannot hit every frame', () => {
  const state = playing(); state.player.x = 0; state.player.z = 1;
  state.enemies[0].x = 0; state.enemies[0].z = 2;
  state.enemies[1].x = 0; state.enemies[1].z = -0.5;
  step(state, { attack: true }, TUNING.step);
  assert.equal(state.enemies[0].hp, 2); assert.equal(state.enemies[1].hp, 3);
  step(state, { attack: true }, TUNING.step);
  assert.equal(state.enemies[0].hp, 2);
});
test('enemy startup and recovery contact are safe', () => {
  const state = playing(); const enemy = state.enemies[0];
  enemy.x = state.player.x; enemy.z = state.player.z; enemy.mode = 'windup'; enemy.timer = 0.7;
  step(state, {}, TUNING.step); assert.equal(state.player.hp, 6);
  enemy.mode = 'recover'; enemy.timer = 0.7;
  step(state, {}, TUNING.step); assert.equal(state.player.hp, 6);
});
test('active contact obeys invulnerability and triggers loss', () => {
  const state = playing(); const enemy = state.enemies[0];
  enemy.x = state.player.x; enemy.z = state.player.z; enemy.mode = 'charge'; enemy.timer = 0.5;
  state.player.hp = 1;
  step(state, {}, TUNING.step);
  assert.equal(state.phase, 'lost'); assert.equal(state.failure, 'health');
});
test('dash avoids incoming active contact', () => {
  const state = playing(); const enemy = state.enemies[0];
  enemy.x = state.player.x; enemy.z = state.player.z; enemy.mode = 'charge'; enemy.timer = 0.5;
  step(state, { dash: true }, TUNING.step); assert.equal(state.player.hp, 6);
});
test('pickup stable ID is collected exactly once', () => {
  const state = playing(); state.pickups.push({ id: 8, x: state.player.x, z: state.player.z, collected: false });
  advance(state, 0.5);
  assert.equal(state.cores, 1); assert.equal(state.score, 50);
});
test('completion requires all cores and proximity to beacon', () => {
  const state = playing(); state.cores = 3;
  step(state, { interact: true }, TUNING.step); assert.equal(state.phase, 'playing');
  state.player.x = BEACON.x; state.player.z = BEACON.z + 1.5;
  step(state, { interact: true }, TUNING.step); assert.equal(state.phase, 'upgrade');
  const score = state.score;
  step(state, { interact: true }, TUNING.step); assert.equal(state.score, score);
});
test('upgrade advances once and changes the next chapter stats', () => {
  const state = playing(); state.phase = 'upgrade';
  state.history.push({ name: '暮港', elapsed: 20, damage: 0 });
  const next = chooseUpgrade(state, 'edge');
  assert.equal(next.chapter, 1); assert.equal(stats(next.upgrades).damage, 2);
  assert.equal(chooseUpgrade(state, 'heart'), null);
});
test('checkpoints survive JSON round trip without replaying rewards', () => {
  const state = playing(1, ['wind']); state.score = 600; state.history.push({ name: '暮港', elapsed: 20, damage: 1 });
  const saved = checkpoint(state);
  const restored = restoreCheckpoint(JSON.parse(JSON.stringify(saved)));
  assert.equal(restored.chapter, 1); assert.equal(restored.score, 600); assert.equal(restored.cores, 0);
  assert.equal(restored.enemies.length, 4); assert.equal(stats(restored.upgrades).dashCooldown, 0.7875000000000001);
});
test('malformed and unsupported saves are rejected safely', () => {
  const saved = checkpoint(createState());
  for (const invalid of [null, {}, { ...saved, version: 20 }, { ...saved, chapter: 5 }, { ...saved, score: -1 }, { ...saved, chapter: 1, upgrades: ['edge'], history: [null] }, { ...saved, chapter: 1, upgrades: ['__proto__'], history: [{name:'暮港',elapsed:1,damage:0}] }]) assert.equal(restoreCheckpoint(invalid), null);
});
test('cannon fires a visible projectile from its locked direction', () => {
  const state = playing(1, ['edge']); const enemy = state.enemies[0];
  enemy.mode = 'windup'; enemy.timer = 0; enemy.angle = 0;
  step(state, {}, TUNING.step);
  assert.equal(state.projectiles.length, 1); assert.ok(state.projectiles[0].vz > 0);
});
test('boss half-health changes phase and later emits radial fire', () => {
  const state = playing(2, ['edge','heart']); const boss = state.enemies[0]; boss.hp = 15;
  step(state, {}, TUNING.step); assert.equal(boss.phase, 2);
  boss.mode = 'windup'; boss.move = 2; boss.timer = 0;
  step(state, {}, TUNING.step); assert.equal(state.projectiles.length, 12);
});
test('boss armor rejects attacks during danger and opens during recovery', () => {
  const state = playing(2, ['edge','heart']);
  const boss = state.enemies[0];
  state.player.x = boss.x; state.player.z = boss.z + 2;
  boss.mode = 'windup'; boss.timer = 1;
  step(state, { attack: true }, TUNING.step);
  assert.equal(boss.hp, 30); assert.ok(state.events.some(event => event.type === 'guard'));
  state.player.cooldown = 0; boss.mode = 'recover'; boss.timer = 1;
  step(state, { attack: true }, TUNING.step);
  assert.equal(boss.hp, 28);
});
test('timeout cannot award chapter completion on the same step', () => {
  const state = playing(); state.time = 0; state.cores = 3; state.player.x = 0; state.player.z = -3.2;
  step(state, { interact: true }, TUNING.step); assert.equal(state.phase, 'lost'); assert.equal(state.failure, 'time');
});
test('same supported input sequence yields the same complete state', () => {
  const run = () => { const state = playing(); advance(state, 1, { x: 1, attack: true }); advance(state, 1, { y: -1, dash: true }); return state; };
  assert.deepEqual(run(), run());
});
test('all authored chapters have their own encounter and valid objectives', () => {
  assert.deepEqual(CHAPTERS.map(level => level.enemies.length), [3, 4, 1]);
  for (const level of CHAPTERS) assert.equal(level.cores, level.enemies.length);
});

test('pulse interrupts an armored boss and cannot repeat without charge', () => {
  const state = playing(2, ['edge','heart']); const boss = state.enemies[0];
  state.player.x = boss.x; state.player.z = boss.z + 2;
  boss.mode = 'charge'; boss.timer = 0.5; boss.vx = 4;
  step(state, { pulse: true, attack: true }, TUNING.step);
  assert.equal(boss.hp, 28); assert.equal(boss.mode, 'recover'); assert.ok(boss.stagger > 1.3);
  assert.equal(state.player.energy, 0); assert.equal(state.player.hp, 8);
  const position = { x: boss.x, z: boss.z };
  advance(state, 0.5, { pulse: true });
  assert.equal(state.totals.pulses, 1); assert.equal(boss.x, position.x); assert.equal(boss.z, position.z);
});

test('pulse affects enemies and live projectiles only inside its radius', () => {
  const state = playing(); state.player.x = 0; state.player.z = 0;
  state.enemies[0].x = 1; state.enemies[0].z = 0;
  state.enemies[1].x = 6; state.enemies[1].z = 0;
  state.projectiles = [{id:0,x:2,z:0,vx:0,vz:0,life:1},{id:1,x:6,z:0,vx:0,vz:0,life:1},{id:2,x:1,z:0,vx:0,vz:0,life:0}];
  step(state, { pulse: true }, TUNING.step);
  assert.equal(state.enemies[0].hp, 1); assert.equal(state.enemies[1].hp, 3);
  assert.deepEqual(state.projectiles.map(item=>item.id), [1]);
  assert.equal(state.totals.clearedProjectiles, 1);
  assert.equal(state.events.find(event=>event.type==='pulse').cleared, 1);
});

test('normal successful hits recharge energy while blocked attacks do not', () => {
  const state = playing(2, ['edge','heart']); const boss = state.enemies[0];
  state.player.energy = 0; state.player.x = boss.x; state.player.z = boss.z + 2;
  boss.mode = 'windup'; boss.timer = 1;
  step(state, { attack: true }, TUNING.step); assert.equal(state.player.energy, 0);
  boss.mode = 'recover'; boss.timer = 1; state.player.cooldown = 0;
  step(state, { attack: true }, TUNING.step); assert.equal(state.player.energy, 22);
  state.player.energy = 95; state.player.cooldown = 0;
  step(state, { attack: true }, TUNING.step); assert.equal(state.player.energy, 100);
});

test('old checkpoints migrate pulse stats and reject invalid new counters', () => {
  const saved = checkpoint(createState()); delete saved.totals.pulses; delete saved.totals.clearedProjectiles;
  const restored = restoreCheckpoint(saved);
  assert.equal(restored.totals.pulses, 0); assert.equal(restored.player.energy, 100);
  assert.equal(restoreCheckpoint({...saved,totals:{...saved.totals,pulses:-1}}), null);
  assert.equal(restoreCheckpoint({...saved,totals:{...saved.totals,clearedProjectiles:'2'}}), null);
});
