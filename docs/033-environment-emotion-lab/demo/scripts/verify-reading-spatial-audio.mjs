import assert from 'node:assert/strict';
import {createReadingAudio} from '../reading-audio.js';
import {SPACE,acousticAt} from '../reading-space.js';

const original={document:globalThis.document,AudioContext:globalThis.AudioContext,fetch:globalThis.fetch};
class Param{value=0;setTargetAtTime(v){this.value=v;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}}
class Node{gain=new Param();frequency=new Param();Q=new Param();outputs=[];connect(n){this.outputs.push(n);}disconnect(){this.outputs=[];}}
class SpatialNode extends Node{positionX=new Param();positionY=new Param();positionZ=new Param();forwardX=new Param();forwardY=new Param();forwardZ=new Param();upX=new Param();upY=new Param();upZ=new Param();}
const contexts=[],sources=[],filters=[],panners=[],listeners=new Map(),requests=[];
class Source extends Node{start(){this.started=true;}stop(){this.stopped=true;this.onended?.();}}
class Context{state='suspended';currentTime=0;sampleRate=100;destination={};listener=new SpatialNode();constructor(){contexts.push(this);}createGain(){return new Node();}createBiquadFilter(){const n=new Node();filters.push(n);return n;}createPanner(){const p=new SpatialNode();panners.push(p);return p;}createDynamicsCompressor(){const n=new Node();for(const k of ['threshold','knee','ratio','attack','release'])n[k]=new Param();return n;}createBufferSource(){const s=new Source();sources.push(s);return s;}createBuffer(c,n){return{getChannelData:()=>new Float32Array(n)};}async decodeAudioData(){return{};}async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';}}
globalThis.document={hidden:false,addEventListener:(e,f)=>listeners.set(e,f),removeEventListener:e=>listeners.delete(e)};globalThis.AudioContext=Context;
let holdVoice=null;
globalThis.fetch=async url=>{requests.push(url);if(holdVoice&&url.includes('reading-2.mp3'))await holdVoice.promise;return{ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};};
try{
 let state;const audio=createReadingAudio(s=>state=s,{connected:true});assert.equal(contexts.length,0);assert.equal(requests.length,0,'Opt-in applies to every audio layer');
 await Promise.all([audio.setEnabled(true),audio.setEnabled(true)]);assert.equal(contexts.length,1);assert.equal(sources.filter(s=>s.loop).length,4);assert.equal(requests.length,5);assert(state.ready);
 const inside=acousticAt({...SPACE.stand,y:1.65,yaw:.4,pitch:-.2},false);audio.setPosition(inside);const indoorCutoff=filters[0].frequency.value,indoorWaterCutoff=filters[1].frequency.value;
 const outside=acousticAt({...SPACE.pondStop,y:1.77,yaw:1,pitch:0},true);audio.setPosition(outside);assert(filters[0].frequency.value>indoorCutoff*3);assert(filters[1].frequency.value>indoorWaterCutoff*3);
 assert.equal(contexts[0].listener.positionX.value,SPACE.pondStop.x);assert.equal(contexts[0].listener.positionZ.value,SPACE.pondStop.z);assert(Math.abs(contexts[0].listener.forwardX.value+Math.sin(1))<1e-12);
 assert.equal(panners[0].positionX.value,SPACE.pond.x);assert.equal(panners[0].positionZ.value,SPACE.pond.z);
 await audio.narrate(0);const voice=sources.at(-1),voicePan=panners.at(-1);assert.equal(voicePan.positionX.value,SPACE.book.x);assert.equal(voicePan.positionZ.value,SPACE.book.z);assert(state.narrating);
 audio.setPosition(inside);audio.setPosition(outside);audio.setPosition({...outside,book:{x:-5.7,y:1.05,z:7.0},bookHeld:true,bookOutside:true});assert.equal(voicePan.positionX.value,-5.7);assert.equal(voicePan.positionY.value,1.05);assert.equal(voicePan.positionZ.value,7.0);assert(audio.getState().bookHeld);assert(!voice.stopped,'Walking preserves the anchored narration');
 assert(audio.play('duck',{x:-12,y:.3,z:1}));await new Promise(r=>setImmediate(r));const quack=sources.at(-1),quackPan=panners.at(-1);assert(quack.started);assert.equal(quackPan.positionX.value,-12);assert.equal(audio.play('duck'),false,'Duck voice has a cooldown');
 holdVoice={};holdVoice.promise=new Promise(resolve=>holdVoice.resolve=resolve);const pending=audio.narrate(1);await new Promise(r=>setImmediate(r));assert(voice.stopped);await audio.setEnabled(false);holdVoice.resolve();await pending;assert(!state.narrating);assert(!state.enabled);
 const playing=sources.filter(s=>s.started&&!s.loop).length;assert.equal(playing,2,'Muted pending narration cannot start');assert.equal(audio.play('duck'),false);
 await audio.setEnabled(true);document.hidden=true;listeners.get('visibilitychange')();await new Promise(r=>setImmediate(r));assert.equal(contexts[0].state,'suspended');assert.equal(audio.play('page'),false);
 document.hidden=false;listeners.get('visibilitychange')();await new Promise(r=>setImmediate(r));assert.equal(contexts[0].state,'running');
 audio.dispose();assert.equal(contexts[0].state,'closed');assert(sources.filter(s=>s.loop).every(s=>s.stopped));assert.equal(listeners.size,0);
 console.log('Spatial audio: single opt-in context, four real-recording beds, listener orientation, doorway filtering, anchored MiniMax, duck position/cooldown, muted loading cancellation and visibility cleanup passed.');
}finally{for(const[k,v]of Object.entries(original)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
