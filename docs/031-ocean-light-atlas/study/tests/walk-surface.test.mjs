import test from 'node:test';
import assert from 'node:assert/strict';
import { STAIR_TREADS, supportHeight, rootHeight, moveOnSurface, safeFootLanding, connectToRoute, walkable } from '../glasshouse/walk-surface.js';

test('foot support follows the exposed tops of the overlapping rendered treads',()=>{
  assert.equal(STAIR_TREADS.length,4);
  for(const [z,y]of [[7.7,1.22],[8.399,1.22],[8.401,.99],[9.021,.76],[9.641,.53]])assert(Math.abs(supportHeight(-1.5,z)-y)<1e-8);
  assert(Math.abs(rootHeight(-1.5,8.399)-rootHeight(-1.5,8.401))<.002);
});
test('manual movement stops at glass and unprotected platform drops',()=>{
  const glass={x:-1.25,y:1.413,z:6.7};moveOnSurface(glass,0,-.3);assert(glass.z>=6.57&&glass.z<6.7);
  const edge={x:.5,y:1.413,z:6.9};moveOnSurface(edge,.6,0);assert.equal(edge.x,.5);
  const door={x:-3.15,y:1.413,z:6.55};moveOnSurface(door,0,-.2);assert(door.z<6.4);
});
test('a stair landing reserves enough room for the actual heel and toe extent',()=>{
  const p={x:-1.5,z:8.41};safeFootLanding(p,{minZ:-.23,maxZ:.11});
  assert(p.z-.23>8.4);assert(p.z+.11<9.02);
});
test('a manually moved character can return through the doorway to the tour route',()=>{
  const path=connectToRoute({x:-1.25,z:6.7},{x:-3.15,y:1.55,z:1.75});assert(path?.length>1);
  assert(path.every(p=>walkable(p.x,p.z)));
  const crossing=path.filter(p=>p.z>5.9&&p.z<6.5);assert(crossing.length);
  assert(crossing.every(p=>p.x< -2.9&&p.x> -4.9),'the connector uses the doorway');
});
