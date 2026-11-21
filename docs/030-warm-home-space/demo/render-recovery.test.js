import test from 'node:test';
import assert from 'node:assert/strict';
import {createContextRecovery,createRecoveryWarmup,renderSizing,validRecoverySnapshot} from './render-recovery.js';

function rig(rebuild=()=>{}){
  const canvas=new EventTarget(),events=[],fallbacks=[];let scheduled;
  const recovery=createContextRecovery(canvas,{suspend:()=>events.push('suspended'),rebuild,publish:s=>events.push(s.state),fallback:r=>fallbacks.push(r),setTimer:fn=>(scheduled=fn,1),clearTimer:()=>scheduled=undefined});
  return {canvas,events,fallbacks,recovery,timeout:()=>scheduled?.(),lose(){const e=new Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(e);assert.ok(e.defaultPrevented);},restore(){canvas.dispatchEvent(new Event('webglcontextrestored'));}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('context loss suspends rendering and waits for rebuilt resources and a real frame',async()=>{
  let finish;const r=rig(()=>new Promise(resolve=>finish=resolve));r.lose();assert.equal(r.recovery.canRender(),false);
  r.restore();await tick();assert.equal(r.recovery.canRender(),false);finish();await tick();assert.equal(r.events.at(-1),'warming');
  r.timeout();assert.deepEqual(r.fallbacks,[],'waiting for a visible frame must not time out a hidden tab');
  r.recovery.presented();assert.equal(r.events.at(-1),'ready');r.timeout();assert.deepEqual(r.fallbacks,[]);
});
test('a second loss cancels an in-flight restoration and can recover again',async()=>{
  let finish;const r=rig(()=>new Promise(resolve=>finish=resolve));r.lose();r.restore();await tick();r.lose();finish();await tick();
  assert.equal(r.recovery.canRender(),false);assert.equal(r.events.at(-1),'lost');
  r.restore();await tick();finish();await tick();r.recovery.presented();assert.equal(r.events.at(-1),'ready');
});
test('a missing context restore or a failed rebuild reaches fallback once',async()=>{
  const r=rig();r.lose();r.timeout();r.recovery.fail('again');assert.equal(r.fallbacks.length,1);
  const broken=rig(()=>{throw Error('allocation failed');});broken.lose();broken.restore();await tick();assert.equal(broken.fallbacks.length,1);assert.equal(broken.recovery.canRender(),false);
});
test('pixel budget bounds large screens without downgrading restored image quality',()=>{
  for(const [w,h,dpr]of [[846,919,1.5],[3840,2160,2],[390,844,3]]){
    const q=renderSizing(w,h,dpr);
    assert.ok(w*h*q.ratio*q.ratio<=1350001);assert.equal(q.samples,2);
  }
});
test('recovery reduces frame rate only while ninety actual frames warm up',()=>{
  const warmup=createRecoveryWarmup();assert.equal(warmup.maxFps,60);warmup.start();assert.equal(warmup.maxFps,30);
  for(let i=0;i<89;i++)warmup.presented();assert.equal(warmup.active,true);
  warmup.presented();assert.equal(warmup.maxFps,60);assert.equal(warmup.active,false);
  warmup.start();assert.equal(warmup.maxFps,30);
});
test('reload recovery only accepts a fresh finite camera snapshot',()=>{
  const snapshot={player:{x:.15,z:-4.08,y:1.48,yaw:.6,pitch:-.1},night:true};
  const record={version:1,time:1000,snapshot};assert.equal(validRecoverySnapshot(record,2000),snapshot);
  assert.equal(validRecoverySnapshot(record,62000),null);assert.equal(validRecoverySnapshot({...record,time:3000},2000),null);
  assert.equal(validRecoverySnapshot({...record,snapshot:{player:{...snapshot.player,z:99}}},2000),null);
});
