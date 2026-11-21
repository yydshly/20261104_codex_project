import test from 'node:test';
import assert from 'node:assert/strict';
import {GROUND_Y,FLOOR_HEIGHT,BUILDINGS,TREES,footprint,bayType,floorProfile} from './courtyard-layout.js';

test('host apartment floor aligns with the fourth storey and opposite buildings have courtyard clearance',()=>{
  assert.ok(Math.abs(GROUND_Y+3*FLOOR_HEIGHT)<1e-6);
  for(const b of BUILDINGS.filter(b=>b.yaw===0))assert.ok(-4.72-footprint(b).maxZ>24,'facades need actual space beyond the balcony');
});
test('tree crowns do not intersect the neighbouring building envelopes',()=>{
  for(const tree of TREES)for(const building of BUILDINGS){
    const b=footprint(building),dx=Math.max(b.minX-tree.x,0,tree.x-b.maxX),dz=Math.max(b.minZ-tree.z,0,tree.z-b.maxZ);
    assert.ok(Math.hypot(dx,dz)>tree.crown/2+.4,'tree crown clips '+building.name);
  }
});
test('nearest tree crowns leave clear space beyond the balcony rail',()=>{
  for(const t of TREES){assert.ok(t.z+t.crown/2< -6);assert.ok(t.height>6&&t.height<12);}
});

test('terrace floors remain inside their original footprint and retain structural bay alignment',()=>{
  for(const b of BUILDINGS)for(let f=0;f<b.floors;f++){
    const p=floorProfile(b,f),normal=floorProfile(b,0);
    assert.ok(p.w>0&&p.d>1.2&&p.columns>=2);
    assert.ok(Math.abs(p.x)+p.w/2<=b.w/2+1e-6);
    assert.ok(Math.abs(p.z)+p.d/2<=b.d/2+1e-6);
    assert.ok(Math.abs(p.w/p.columns-normal.w/normal.columns)<1e-6);
    if(p.terrace){assert.ok(f===b.floors-1);assert.ok(p.z+p.d/2<b.d/2-.9);}
  }
});
test('residential facades have varied vertical window stacks and a staggered skyline',()=>{
  for(let style=0;style<4;style++)assert.ok(new Set(Array.from({length:4},(_,col)=>bayType(style,col))).size>=3);
  assert.ok(new Set(BUILDINGS.map(b=>b.floors)).size>=4);
  assert.ok(BUILDINGS.some(b=>b.terrace==='center')&&BUILDINGS.some(b=>b.terrace==='edge'));
});
