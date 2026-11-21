import test from 'node:test';
import assert from 'node:assert/strict';
import {createCubeRefresh} from './reflection-refresh.js';
test('reflection refresh renders one face per frame and publishes only a complete cube',()=>{
  const faces=[],completed=[];
  const r=createCubeRefresh({renderFace:(target,face)=>faces.push([target,face]),complete:n=>completed.push(n),invalidate(){}});
  r.request();for(let i=0;i<5;i++)r.update();assert.equal(completed.length,0);
  r.update();assert.deepEqual(faces,Array.from({length:6},(_,i)=>[1,i]));assert.deepEqual(completed,[1]);
  r.request();for(let i=0;i<6;i++)r.update();assert.deepEqual(completed,[1,0]);
});
test('rapid day/night requests coalesce and context restoration invalidates old cube pixels',()=>{
  const completed=[];let invalidated=0;
  const r=createCubeRefresh({renderFace(){},complete:n=>completed.push(n),invalidate:()=>invalidated++});
  for(let i=0;i<20;i++){r.request();r.update();}assert.equal(completed.length,0);
  for(let i=0;i<5;i++)r.update();assert.equal(completed.length,1);
  r.reset();assert.equal(invalidated,1);assert.equal(r.status().pending,true);
  for(let i=0;i<6;i++)r.update();assert.equal(completed.length,2);
});
