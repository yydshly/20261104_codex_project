import test from 'node:test';
import assert from 'node:assert/strict';
import { ROCKS,rockClearance,CHARACTER_RADIUS } from '../glasshouse/scene-layout.js';
import { moveOnSurface,rootHeight,walkable,connectToRoute,segmentWalkable } from '../glasshouse/walk-surface.js';
import { createLocomotion } from '../glasshouse/locomotion.js';

test('visible rock layout excludes the full character footprint, including swept movement',()=>{
 assert(ROCKS.length>=15);
 for(const r of ROCKS)assert(rockClearance(r.x,r.z)<0);
 const hero=ROCKS[0],p={x:hero.x+2.3,y:rootHeight(hero.x+2.3,hero.z),z:hero.z};
 assert(walkable(p.x,p.z));
 moveOnSurface(p,-4.6,0);
 assert(rockClearance(p.x,p.z)>=0);assert(p.x>hero.x);
 assert(Math.hypot(p.x-hero.x,p.z-hero.z)>CHARACTER_RADIUS);
});
test('navigation from the rock-side beach returns around stones and through the safe stairs',()=>{
 let start;for(let z=12;z<15&&!start;z+=.25)for(let x=-10;x<-8;x+=.25)if(walkable(x,z)){start={x,z};break;}
 assert(start);const path=connectToRoute(start,{x:-1.5,y:rootHeight(-1.5,10.8),z:10.8});
 assert(path?.length);assert(path.every(p=>rockClearance(p.x,p.z)>=0&&walkable(p.x,p.z)));
 let previous=start;for(const p of path){assert(segmentWalkable(previous,p),'connector must stay clear between grid nodes');previous=p;}
});
test('locomotion accelerates, stops without persistent drift and remains frozen when paused',()=>{
 const motion=createLocomotion(),first=motion.step(1,0,.82,.016);assert(first.speed>0&&first.speed<.2);
 for(let i=0;i<20;i++)motion.step(1,0,.82,.05);assert(Math.abs(motion.speed-.82)<1e-8);
 const frozen=motion.step(0,0,.82,0);assert.equal(frozen.speed,.82);
 for(let i=0;i<6;i++)motion.step(0,0,.82,.05);assert.equal(motion.speed,0);
 const a=motion.step(1,0,.82,.1),b=motion.step(-1,0,.82,.05);assert(b.x<a.x&&b.x>-.82);
 motion.reset();assert.equal(motion.speed,0);
});

test('manual walking reaches cruising speed promptly and releases without a long coast',()=>{
 const motion=createLocomotion();let time=0;
 while(motion.speed<.82*.9&&time<1){motion.step(1,0,.82,.01);time+=.01;}
 assert(time<=.13,'90 percent speed within 130ms');assert(time>=.05,'preserve a short physical acceleration');
 time=0;while(motion.speed>0&&time<1){motion.step(0,0,.82,.01);time+=.01;}
 assert(time<=.1,'release within 100ms');
});
