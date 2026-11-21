import test from 'node:test';
import assert from 'node:assert/strict';
import {createDungeonRun,dungeonRunAction,dungeonSkillAllowed} from '../play-engine.js';

test('routes cannot skip the chapter or spend unavailable supplies',()=>{
  const initial=createDungeonRun();assert.equal(dungeonRunAction(initial,{type:'route',node:'sanctum'}),initial);
  const fork={...initial,stage:1,torches:0};assert.equal(dungeonRunAction(fork,{type:'route',node:'shrine'}),fork);
  const cache=dungeonRunAction(fork,{type:'route',node:'cache'});assert.equal(cache.food,9);assert.equal(cache.loot,100);assert.ok(cache.party.every(p=>p.stress===10));assert.equal(cache.phase,'event');assert.equal(fork.loot,0);
  assert.equal(dungeonRunAction(cache,{type:'route',node:'cache'}),cache);
});
test('shrine and food decisions trade finite supplies for persistent recovery',()=>{
  let s=createDungeonRun();s.stage=1;s.party[0].hp=10;s.party[0].stress=40;
  s=dungeonRunAction(s,{type:'route',node:'shrine'});assert.equal(s.torches,3);assert.equal(s.party[0].hp,18);assert.equal(s.party[0].stress,28);
  s=dungeonRunAction(s,{type:'continue'});s.stage=3;s.food=2;
  assert.equal(dungeonRunAction(s,{type:'route',node:'hearth'}),s);
  s=dungeonRunAction(s,{type:'route',node:'watch'});assert.equal(s.food,2);assert.equal(s.resolveBonus,2);
});
test('victory opens a reward decision which cannot be claimed twice',()=>{
  let s=dungeonRunAction(createDungeonRun(),{type:'enter'});s.active='crusader';s.seed=1;s.enemies.forEach(e=>{e.dead=true;e.hp=0;});Object.assign(s.enemies[0],{dead:false,hp:1});
  s=dungeonRunAction(s,{type:'skill',skill:'smite',target:'foe-guard'});assert.equal(s.phase,'reward');assert.equal(s.loot,85);
  const rewarded=dungeonRunAction(s,{type:'reward',card:'relic'});assert.ok(rewarded.relic);assert.equal(rewarded.phase,'explore');assert.equal(dungeonRunAction(rewarded,{type:'reward',card:'gold'}),rewarded);
});
test('boss revival compacts legal ranks and defeating the boss ends the encounter',()=>{
  let s=createDungeonRun();s.stage=4;s=dungeonRunAction(s,{type:'route',node:'sanctum'});s.round=3;s.active='foe-bell';Object.assign(s.enemies[0],{dead:true,corpse:false,hp:0,rank:-1});
  s=dungeonRunAction(s,{type:'enemyStep'});assert.equal(s.enemies[0].hp,10);assert.equal(s.enemies[0].dead,false);
  assert.equal(new Set(s.enemies.filter(e=>!e.dead||e.corpse).map(e=>e.rank)).size,3);assert.ok(s.enemies.every(e=>e.rank>=0&&e.rank<=3));
  s.active='rogue';s.seed=1;s.enemies.find(e=>e.id==='foe-bell').hp=1;
  assert.ok(dungeonSkillAllowed(s,'pistol','foe-bell'));
  s=dungeonRunAction(s,{type:'skill',skill:'pistol',target:'foe-bell'});assert.equal(s.phase,'reward');assert.ok(s.bossDefeated);assert.ok(s.enemies.some(e=>!e.dead));
  s=dungeonRunAction(s,{type:'reward',card:'recovery'});assert.equal(s.phase,'complete');
});
test('a hero with no usable ranged skill can pass instead of locking the battle',()=>{
  let s=dungeonRunAction(createDungeonRun(),{type:'enter'});s.active='healer';s.party.find(p=>p.id==='healer').rank=0;s.party.find(p=>p.id==='healer').stress=20;
  const next=dungeonRunAction(s,{type:'pass'});assert.notEqual(next.active,'healer');assert.equal(next.party.find(p=>p.id==='healer').stress,17);
});
