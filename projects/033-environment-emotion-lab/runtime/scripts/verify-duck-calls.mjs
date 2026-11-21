import assert from 'node:assert/strict';
import {createDuckCallSchedule} from '../pond-duck-calls.js';

let i=0;const values=[0,.25,.85,.1,.7],schedule=createDuckCallSchedule({random:()=>values[i++%values.length]});
for(let n=0;n<1000;n++)assert.equal(schedule.update(.05,{allowed:true}),false,'Disabled means no spontaneous call');
schedule.setEnabled(true);const times=[];
for(let n=0;n<2000;n++)if(schedule.update(.05,{allowed:true}))times.push((n+1)*.05);
assert(times.length>=3);assert(times[0]>=6&&times[0]<6.1);
const gaps=times.slice(1).map((t,n)=>t-times[n]);assert(gaps.every(t=>t>=18&&t<=42.1));assert(new Set(gaps.map(v=>Math.round(v))).size>1,'Gaps must vary, not repeat one fixed interval');
schedule.noteManualCall();assert(schedule.getState().secondsUntilCall>=18,'Manual calling postpones an automatic answer');
schedule.update(.05,{allowed:false});const paused=schedule.getState().secondsUntilCall;
for(let n=0;n<3000;n++)assert.equal(schedule.update(.05,{allowed:false}),false);assert.equal(schedule.getState().secondsUntilCall,paused,'Muted/reading/hidden scenes do not accumulate calls');
assert.equal(schedule.update(3600,{allowed:true}),false,'A long frame gap cannot produce catch-up calls');
for(let n=0;n<300;n++)assert.equal(schedule.update(.05,{allowed:true,busy:true}),false);assert(schedule.getState().secondsUntilCall>=4);
schedule.setEnabled(false);for(let n=0;n<1500;n++)assert.equal(schedule.update(.05,{allowed:true}),false);assert.equal(schedule.getState().secondsUntilCall,null);
schedule.setEnabled(true);assert(schedule.getState().secondsUntilCall>=6&&schedule.getState().secondsUntilCall<=12);
console.log('Random calls: opt-in switch, varied sparse gaps, manual cooldown, narration/mute pause, no catch-up bursts and disable/re-enable passed.');
