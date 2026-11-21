import assert from 'node:assert/strict';
import {createReadingAudio} from '../reading-audio.js';

// Exercise media lifecycle and cancellation without a sound device or paid API.
const real={document:globalThis.document,AudioContext:globalThis.AudioContext,fetch:globalThis.fetch};
class Param{value=0;setTargetAtTime(v){this.value=v;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}}
const sources=[],contexts=[];let pendingVoice;
class Node{gain=new Param();frequency=new Param();Q=new Param();connect(){}disconnect(){}}
class Source extends Node{started=false;stopped=false;start(){this.started=true;}stop(){this.stopped=true;this.onended?.();}}
class Context{state='suspended';currentTime=0;sampleRate=100;destination={};constructor(){contexts.push(this);}createGain(){return new Node();}createBiquadFilter(){return new Node();}createBufferSource(){const s=new Source();sources.push(s);return s;}createBuffer(c,n){return{getChannelData:()=>new Float32Array(n)};}async decodeAudioData(){return{};}async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';}}
const listeners=new Map();let calls=0;
globalThis.document={hidden:false,addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n)};
globalThis.AudioContext=Context;
globalThis.fetch=async url=>{calls++;if(pendingVoice&&url.includes('reading-2.mp3'))await pendingVoice.promise;return{ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};};
try{
 let state;const audio=createReadingAudio(s=>{state=s;});
 await Promise.all([audio.setEnabled(true),audio.setEnabled(true)]);
 assert.equal(sources.filter(s=>s.loop&&s.started).length,2,'Ambient layers start only once');assert.equal(calls,2);
 await audio.narrate(0);const first=sources.at(-1);assert.equal(state.narrationPage,0);assert.equal(state.narrating,true);
 pendingVoice={};pendingVoice.promise=new Promise(resolve=>{pendingVoice.resolve=resolve;});
 const switching=audio.narrate(1);await new Promise(resolve=>setImmediate(resolve));assert(first.stopped,'Old page stops before a new clip loads');
 await audio.setEnabled(false);pendingVoice.resolve();await switching;
 assert.equal(state.narrating,false);assert.equal(state.enabled,false);assert.equal(sources.filter(s=>s.started&&!s.loop).length,1,'Muted pending narration never starts');
 pendingVoice=null;await audio.narrate(2);const third=sources.at(-1);assert.equal(state.narrationPage,2);
 document.hidden=true;listeners.get('visibilitychange')();await new Promise(resolve=>setImmediate(resolve));assert.equal(contexts[0].state,'suspended');
 document.hidden=false;listeners.get('visibilitychange')();await new Promise(resolve=>setImmediate(resolve));assert.equal(contexts[0].state,'running');
 audio.stopNarration();assert(third.stopped);assert.equal(state.narrating,false);
 await audio.narrate(0);assert.equal(calls,5,'Decoded page and field buffers are reused');
 audio.dispose();assert.equal(contexts[0].state,'closed');assert.equal(listeners.size,0);assert(sources.filter(s=>s.loop).every(s=>s.stopped));
 console.log('Reading audio: shared field loops, page switch, pending cancellation, visibility pause, buffer reuse and disposal passed.');
}finally{for(const[k,v]of Object.entries(real)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
