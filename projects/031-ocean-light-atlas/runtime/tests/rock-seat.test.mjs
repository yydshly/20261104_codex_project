import test from 'node:test';
import assert from 'node:assert/strict';
import { ROCK_SEAT } from '../glasshouse/rock-seat.js';
import { rockClearance } from '../glasshouse/scene-layout.js';
import { segmentWalkable, walkable } from '../glasshouse/walk-surface.js';
import { groundHeight } from '../glasshouse/coast.js';

test('the fitted rock preserves the old shore route and has a safe separate approach',()=>{
 const old=[{x:-1.5,z:10.8},{x:1.1,z:10.8},{x:1.5,z:9.7},{x:3.5,z:7.7}];
 for(let i=1;i<old.length;i++)assert(segmentWalkable(old[i-1],old[i]),'the seat must not obstruct the existing tide tour');
 const approach=[old[1],{x:2,z:10.5},ROCK_SEAT.approach];
 for(let i=1;i<approach.length;i++)assert(segmentWalkable(approach[i-1],approach[i]));
 assert(walkable(ROCK_SEAT.approach.x,ROCK_SEAT.approach.z));assert(rockClearance(ROCK_SEAT.x,ROCK_SEAT.z)<0,'normal walking still avoids the seat rock');
 assert(groundHeight(ROCK_SEAT.stand.x,ROCK_SEAT.stand.z)>.1,'both feet sit on exposed sand');
 assert(ROCK_SEAT.top-groundHeight(ROCK_SEAT.stand.x,ROCK_SEAT.stand.z)<.55,'seat stays within the fitted lower-leg reach');
});
