import test from 'node:test';
import assert from 'node:assert/strict';
import { createFarmRun,farmRunAction,tickFarm,farmBlocked,createSpireRun,spireRunAction,cardInfo,createFactoryRun,factoryRunAction,tickFactory,createDungeonRun,dungeonRunAction,dungeonSkillAllowed,createBrothersRun,brothersRunAction,reachableHexes,attackPreview,battleUnits } from '../play-engine.js';

function walk(s,a){s=farmRunAction(s,a);for(let i=0;i<1200&&(s.pending||s.path.length);i++)s=tickFarm(s,.05);assert.equal(s.pending,null);return s;}
function tool(s,kind,x=8,y=10){s=farmRunAction(s,{type:'tool',tool:kind});return walk(s,{type:'walk',x,y});}
function factoryFor(s,seconds){for(let i=0;i<seconds*10;i++)tickFactory(s,.1);return s;}
function openSpire(){return spireRunAction(createSpireRun(),{type:'node',node:'battle'});}
function openDungeon(){return dungeonRunAction(createDungeonRun(),{type:'enter'});}
function openBattle(){return brothersRunAction(createBrothersRun(),{type:'start',contract:'escort'});}

test('farm tools operate on adjacent world tiles and consume the appropriate resources',()=>{
  const original=createFarmRun();let s=tool(original,'hoe');assert.equal(s.energy,268);assert.equal(original.energy,270);
  s=tool(s,'seed');assert.equal(s.seeds,14);assert.equal(s.energy,268);
  s=tool(s,'water');assert.equal(s.water,39);assert.equal(s.energy,266);assert.ok(s.soil['8,10'].watered);
  const distant=farmRunAction(s,{type:'use',x:30,y:20});assert.equal(distant.water,s.water);assert.equal(distant.energy,s.energy);
});
test('farm collision blocks houses and water while pathfinding reaches stations',()=>{
  let s=createFarmRun();assert.ok(farmBlocked(s,6,5));assert.ok(farmBlocked(s,28,5));
  s.player={...s.player,x:6.5,y:7.03};for(let i=0;i<30;i++)s=tickFarm(s,.05,{up:true});assert.ok(s.player.y>=7);
  s=walk(s,{type:'station',station:'shop'});assert.equal(s.gold,480);assert.equal(s.seeds,16);
});
test('four watered nights mature a crop; harvest and shipping pay on the next day',()=>{
  let s=createFarmRun();s=tool(s,'hoe');s=tool(s,'seed');
  for(let day=0;day<4;day++){s=tool(s,'water');s=walk(s,{type:'station',station:'home'});}
  assert.equal(s.soil['8,10'].growth,4);assert.equal(s.day,5);
  s=tool(s,'harvest');assert.equal(s.parsnips,1);assert.equal(s.gold,500);
  s=walk(s,{type:'station',station:'shipping'});assert.equal(s.shipping,1);assert.equal(s.gold,500);
  s=walk(s,{type:'station',station:'home'});assert.equal(s.gold,535);assert.equal(s.shipping,0);
});
test('sprinklers water four orthogonal neighbors, not diagonal neighbors',()=>{
  let s=createFarmRun();s.placed=[{x:10,y:10}];s.soil={'9,10':{crop:'parsnip',growth:0,watered:false},'9,9':{crop:'parsnip',growth:0,watered:false}};
  s=walk(s,{type:'station',station:'home'});assert.ok(s.soil['9,10'].watered);assert.equal(s.soil['9,9'].watered,false);
});
test('unwatered crops pause growth and immature crops cannot be harvested',()=>{
  let s=tool(tool(createFarmRun(),'hoe'),'seed');s=tool(s,'harvest');assert.equal(s.parsnips,0);s=walk(s,{type:'station',station:'home'});assert.equal(s.soil['8,10'].growth,0);
});
test('card prototype uses the referenced starting deck and exact basic card effects',()=>{
  const s=createSpireRun();assert.equal(s.deck.filter(k=>k==='strike').length,5);assert.equal(s.deck.filter(k=>k==='defend').length,4);assert.equal(s.deck.filter(k=>k==='bash').length,1);
  assert.equal(cardInfo('defend').block,5);assert.equal(cardInfo('strike+').damage,9);
});
test('attack cards require a living target, spend energy and apply vulnerability after damage',()=>{
  let s=openSpire();s.hand=['bash','strike'];const invalid=spireRunAction(s,{type:'card',index:0,target:'missing'});assert.equal(invalid.energy,3);
  s=spireRunAction(s,{type:'card',index:0,target:'slime-a'});assert.equal(s.enemies[0].hp,14);assert.equal(s.enemies[0].vulnerable,2);assert.equal(s.energy,1);
  s=spireRunAction(s,{type:'card',index:0,target:'slime-a'});assert.equal(s.enemies[0].hp,5);assert.equal(s.energy,0);
});
test('enemy actions resolve one at a time; hand and energy refresh only afterward',()=>{
  let s=openSpire();s.hand=['defend'];s=spireRunAction(s,{type:'card',index:0});s=spireRunAction(s,{type:'end'});assert.equal(s.hp,80);assert.equal(s.phase,'enemy');
  s=spireRunAction(s,{type:'enemyStep'});assert.equal(s.hp,80);assert.equal(s.phase,'enemy');s=spireRunAction(s,{type:'enemyStep'});assert.equal(s.hp,75);assert.equal(s.energy,3);assert.equal(s.block,0);assert.equal(s.hand.length,5);
});
test('battle reward enlarges the actual deck; camp rest and forging are mutually exclusive',()=>{
  let s=openSpire();s.enemies.forEach(e=>e.hp=1);s.hand=['cleave'];s.hp=40;s=spireRunAction(s,{type:'card',index:0});assert.equal(s.phase,'reward');assert.equal(s.hp,46);
  const reward=s.rewards[0];s=spireRunAction(s,{type:'reward',card:reward});assert.equal(s.deck.length,11);
  s=spireRunAction(s,{type:'node',node:'camp'});const rested=spireRunAction(s,{type:'rest'});assert.equal(rested.hp,70);assert.equal(rested.phase,'map');
  const upgraded=spireRunAction(s,{type:'upgrade',index:0});assert.equal(upgraded.deck[0],'strike+');assert.equal(upgraded.hp,46);
});
test('disconnected belts cannot teleport ore to downstream machines',()=>{
  const s=factoryFor(createFactoryRun(),30);assert.equal(s.gearsMade,0);assert.equal(s.delivered,0);assert.ok(s.oreMined>0);assert.ok(Object.keys(s.items).length>0);
});
test('repairing one real grid connection enables the complete ore-to-gear-to-chest chain',()=>{
  const s=factoryFor(factoryRunAction(createFactoryRun(),{type:'place',x:5,y:5}),60);assert.ok(s.gearsMade>=10);assert.ok(s.delivered>=10);assert.equal(s.entities['19,5'].inventory.gear,s.delivered);
});
test('factory material conservation holds through processing and dismantling',()=>{
  let s=factoryFor(factoryRunAction(createFactoryRun(),{type:'place',x:5,y:5}),40);
  const total=state=>Object.values(state.entities).reduce((n,e)=>n+e.inventory.ore+e.inventory.plate+e.inventory.gear*2,0)+Object.values(state.items).reduce((n,i)=>n+(i.kind==='gear'?2:1),0)+state.bag.ore+state.bag.plate+state.bag.gear*2;
  assert.equal(total(s),s.oreMined);s=factoryRunAction(s,{type:'place',x:8,y:5,erase:true});assert.equal(total(s),s.oreMined);assert.ok(!s.entities['8,5']);
});
test('power and inserter direction independently stop production',()=>{
  const noPower=factoryRunAction(createFactoryRun(),{type:'place',x:5,y:5});noPower.entities['9,2'].fuel=0;factoryFor(noPower,20);assert.equal(noPower.oreMined,0);assert.equal(noPower.entities['2,5'].status,'缺电');
  const wrongWay=factoryRunAction(createFactoryRun(),{type:'place',x:5,y:5});wrongWay.entities['13,5'].dir=2;factoryFor(wrongWay,40);assert.equal(wrongWay.gearsMade,0);assert.ok(wrongWay.entities['8,5'].inventory.plate>0);
});
test('dungeon skill eligibility checks caster rank, target rank, side and current actor',()=>{
  const s=openDungeon();s.active='plague';assert.ok(dungeonSkillAllowed(s,'plague','foe-cultist'));assert.equal(dungeonSkillAllowed(s,'plague','foe-guard'),false);s.party.find(p=>p.id==='plague').rank=0;assert.equal(dungeonSkillAllowed(s,'plague','foe-cultist'),false);
  s.active='healer';assert.ok(dungeonSkillAllowed(s,'heal','crusader'));assert.equal(dungeonSkillAllowed(s,'heal','foe-guard'),false);
});
test('clearing a corpse opens front ranks instead of leaving an unreachable enemy',()=>{
  let s=openDungeon();s.seed=1;s.active='crusader';s.enemies[0].dead=true;s.enemies[0].hp=0;s.enemies[0].corpse=true;s.enemies[0].corpseHp=1;
  s=dungeonRunAction(s,{type:'skill',skill:'smite',target:'foe-guard'});assert.equal(s.enemies[0].corpse,false);assert.equal(s.enemies[1].rank,0);assert.equal(s.enemies[2].rank,1);
});
test('healing takes a hero out of Deaths Door while stress thresholds change behavior',()=>{
  let s=openDungeon();s.active='healer';s.party[0].hp=0;s.party[0].door=true;
  s=dungeonRunAction(s,{type:'skill',skill:'heal',target:'crusader'});assert.ok(s.party[0].hp>0);assert.equal(s.party[0].door,false);
  s.active='foe-cultist';s.party[0].stress=99;s=dungeonRunAction(s,{type:'enemyStep'});assert.ok(s.party[0].affliction||s.party[0].virtue);
});
test('dungeon rank movement consumes a turn, swaps positions, and preserves the input state',()=>{
  const s=openDungeon();s.active='crusader';const next=dungeonRunAction(s,{type:'move',direction:1});assert.equal(s.party[0].rank,0);assert.equal(next.party[0].rank,1);assert.equal(next.party[1].rank,0);assert.notEqual(next.active,'crusader');
});
test('tactical initiative begins with the fastest player, without consuming other queue entries',()=>{
  const s=openBattle();assert.equal(s.active,'m2');assert.equal(s.queue.length,6);assert.equal(s.round,1);assert.ok(battleUnits(s).every(p=>p.ap===9));
});
test('hex movement excludes occupied and blocked cells, and spends AP plus fatigue',()=>{
  let s=openBattle();const actor=s.roster.find(p=>p.id===s.active),reachable=reachableHexes(s,actor);assert.ok(!reachable.some(p=>p.q===4&&p.r===4));assert.ok(!reachable.some(p=>p.q===2&&p.r===4));
  const goal=reachable.find(p=>p.q===1&&p.r===5);assert.ok(goal);s=brothersRunAction(s,{type:'move',q:1,r:5});const moved=s.roster.find(p=>p.id===actor.id);assert.equal(moved.ap,7);assert.equal(moved.fatigue,4);assert.equal(moved.r,5);
});
test('hit resolution consumes AP, rolls accuracy, and applies damage to both armour and health',()=>{
  let s=openBattle();s.active='m1';s.seed=1;const actor=s.roster[0],enemy=s.enemies[0];enemy.q=3;enemy.r=3;
  const preview=attackPreview(s,actor,enemy);assert.ok(preview.valid);const oldHp=enemy.hp,oldArmour=enemy.armour;
  s=brothersRunAction(s,{type:'attack',target:enemy.id});const target=s.enemies[0];assert.ok(target.hp<oldHp);assert.ok(target.armour<oldArmour);assert.equal(s.roster[0].ap,5);assert.equal(s.roster[0].fatigue,12);assert.ok(oldHp-target.hp+oldArmour-target.armour>=24);
});
test('shield wall changes hit chance and costs AP/fatigue; leaving engagement triggers an attack',()=>{
  let s=openBattle();const actor=s.roster.find(p=>p.id===s.active);s.enemies[0].q=1;s.enemies[0].r=3;
  const before=attackPreview(s,s.enemies[0],actor).chance;s=brothersRunAction(s,{type:'shield'});const shielded=s.roster.find(p=>p.id===actor.id);assert.equal(shielded.ap,5);assert.equal(shielded.fatigue,20);assert.ok(attackPreview(s,s.enemies[0],shielded).chance<before);
  s.seed=1;s=brothersRunAction(s,{type:'move',q:1,r:5});const moved=s.roster.find(p=>p.id===actor.id);assert.ok(moved.armour<actor.armour||moved.hp<actor.hp);
});
test('contracts only settle after combat; dead members stay dead when hiring and re-entering',()=>{
  let s=openBattle();assert.equal(s.coins,150);assert.equal(s.contracts,0);s.active='m1';s.seed=1;s.enemies.forEach(e=>{e.dead=true;e.hp=0;});Object.assign(s.enemies[0],{dead:false,hp:1,armour:0,q:3,r:3});
  s=brothersRunAction(s,{type:'attack',target:s.enemies[0].id});assert.equal(s.phase,'victory');assert.equal(s.contracts,1);assert.notEqual(s.coins,150);
  s=brothersRunAction(s,{type:'claim'});s.roster[1].dead=true;s.roster[1].hp=0;s.coins=200;s=brothersRunAction(s,{type:'hire'});assert.equal(s.roster.filter(p=>!p.dead).length,4);assert.equal(s.roster[1].hp,0);
  s=brothersRunAction(s,{type:'start',contract:'escort'});assert.equal(s.phase,'battle');assert.equal(s.roster[1].hp,0);
});
