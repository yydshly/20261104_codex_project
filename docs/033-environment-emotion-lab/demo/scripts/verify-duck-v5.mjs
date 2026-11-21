import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import { GLTFLoader } from '../vendor/addons/loaders/GLTFLoader.js';
import { createDuck3D } from '../pond-duck-v5.js';
import {splitDuckBill,DUCK_QUACK_SECONDS} from '../pond-duck-mouth.js';

// Load the actual acquired geometry through GLTFLoader. Node has no browser image
// decoder; omit only its texture references here. The browser QA loads the intact GLB.
const file = fs.readFileSync(new URL('../assets/models/duck-v5/mallard-preview.glb', import.meta.url));
const jsonLength = file.readUInt32LE(12);
const json = JSON.parse(file.subarray(20, 20 + jsonLength).toString());
for (const material of json.materials ?? []) delete material.pbrMetallicRoughness?.baseColorTexture;
delete json.images;
delete json.textures;
const jsonBytes = Buffer.from(JSON.stringify(json));
const paddedLength = Math.ceil(jsonBytes.length / 4) * 4;
const binary = file.subarray(20 + jsonLength);
const headless = Buffer.alloc(20 + paddedLength + binary.length, 0x20);
headless.writeUInt32LE(0x46546c67, 0);
headless.writeUInt32LE(2, 4);
headless.writeUInt32LE(headless.length, 8);
headless.writeUInt32LE(paddedLength, 12);
headless.writeUInt32LE(0x4e4f534a, 16);
jsonBytes.copy(headless, 20);
binary.copy(headless, 20 + paddedLength);
const arrayBuffer = headless.buffer.slice(headless.byteOffset, headless.byteOffset + headless.byteLength);
const loadAsset = () => new GLTFLoader().parseAsync(arrayBuffer, '');
const wav=fs.readFileSync(new URL('../assets/audio/duck-quack.wav',import.meta.url));let rate,blockAlign,dataBytes;
for(let offset=12;offset+8<=wav.length;){const name=wav.toString('ascii',offset,offset+4),size=wav.readUInt32LE(offset+4);if(name==='fmt '){rate=wav.readUInt32LE(offset+12);blockAlign=wav.readUInt16LE(offset+20);}if(name==='data')dataBytes=size;offset+=8+size+(size%2);}
assert(Math.abs(dataBytes/blockAlign/rate-DUCK_QUACK_SECONDS)<1e-8,'Mouth timeline matches the actual local quack duration');
const sample=new THREE.PlaneGeometry(.13,.08,8,8);sample.translate(.315,.275,-.03);const divided=splitDuckBill(sample);
function area(g){const p=g.attributes.position,index=g.index,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();let total=0;for(let i=0;i<(index?.count??p.count);i+=3){a.fromBufferAttribute(p,index?index.getX(i):i);b.fromBufferAttribute(p,index?index.getX(i+1):i+1);c.fromBufferAttribute(p,index?index.getX(i+2):i+2);total+=b.sub(a).cross(c.sub(a)).length()*.5;}return total;}
assert(Math.abs(area(divided.body)+area(divided.jaw)-area(sample))<1e-8,'Clipping must conserve the authored surface');
for(const g of [divided.body,divided.jaw])for(let i=0;i<g.attributes.position.count;i++){const p=g.attributes.position,uv=g.attributes.uv;assert(Math.abs(uv.getX(i)-(p.getX(i)-.25)/.13)<1e-6);assert(Math.abs(uv.getY(i)-(p.getY(i)-.235)/.08)<1e-6);}
sample.dispose();divided.body.dispose();divided.jaw.dispose();
const events = [];
const duck = createDuck3D({ loadAsset, onEvent: event => events.push(event) });
let meshes = [];
duck.object3D.traverse(o => { if (o.isMesh) meshes.push(o); });
assert.equal(meshes.length, 0, 'The procedural placeholder must never be rendered.');
await duck.ready;
duck.object3D.traverse(o => { if (o.isMesh) meshes.push(o); });
assert.equal(meshes.length,4,'Authored upper/lower bill and two small mouth linings');
assert.equal(duck.object3D.userData.sourceTriangles,8439,'Retain original authored model provenance');
const geometry=meshes[0].geometry,jaw=meshes[1].geometry,bounds=new THREE.Box3();
for(const mesh of meshes){bounds.union(mesh.geometry.boundingBox);for(const attribute of Object.values(mesh.geometry.attributes))assert(Array.from(attribute.array).every(Number.isFinite));}
assert(Math.abs(bounds.max.x-bounds.min.x-.75)<1e-5);assert(Math.abs(bounds.max.z-bounds.min.z-.30)<1e-5);assert(bounds.min.y<-.10);
assert(jaw.boundingBox.min.x>=.29999&&jaw.boundingBox.min.y>.23499,'Only the anatomical lower bill may move; no breast vertices');
assert(Array.from(jaw.attributes.pondDuckWeights.array).filter((_,i)=>i%2===1).every(w=>w===1));
assert(Array.from(geometry.attributes.pondDuckWeights.array).filter((_,i)=>i%2===1).every(w=>w===0));
let maximumGape=0,lateGape=0;
let samples = 0;
duck.setSurfaceSampler(function(x, z) { assert.equal(arguments.length, 2); samples++; return .08; });
duck.interact('call', { x: 2.7, z: .1 });
for(let i=0;i<120;i++){duck.update(1/60);const state=duck.getState();maximumGape=Math.max(maximumGape,state.billOpenRadians);if(state.vocalAgeSeconds>.5&&state.vocalAgeSeconds<.58)lateGape=Math.max(lateGape,state.billOpenRadians);}
assert(maximumGape>.28,'Calling must make a visible physical opening');assert(lateGape>.05,'The bill remains active through the recorded call tail');assert.equal(duck.getState().billOpenRadians,0,'The bill closes after the call');
assert.equal(events.filter(e => e.type === 'quack').length, 1);
let maximumX = -Infinity;
for (let frame = 0; frame < 18000; frame++) {
  if (frame % 2400 === 0) duck.interact('water', { x: 2.7, z: .1 });
  duck.update(1 / 60);
  const state = duck.getState();
  maximumX = Math.max(maximumX, state.x);
  assert(Math.hypot(state.x / 3.45, state.z / 2.1) <= .94);
  assert(Number.isFinite(state.heading) && Number.isFinite(state.speed));
}
assert(maximumX > 2.1, 'The removed dock must not leave an invisible obstacle.');
assert(samples > 1000);
const before = duck.getState();
for (let i = 0; i < 120; i++) duck.update(1 / 60, { motion: false });
assert.equal(duck.getState().x, before.x);
assert.equal(duck.getState().z, before.z);
assert.equal(duck.getState().phase, 'paused');
assert.equal(duck.getState().assetStatus, 'ready');
assert.equal(duck.getState().length, .75);
assert.equal(duck.getState().width, .30);
const pausedCalls=events.filter(e=>e.type==='quack').length;duck.interact('call');let pausedGape=0;for(let i=0;i<90;i++){duck.update(1/60,{motion:false});pausedGape=Math.max(pausedGape,duck.getState().billOpenRadians);}assert.equal(events.filter(e=>e.type==='quack').length,pausedCalls+1);assert(pausedGape>.28,'An intentional call still moves the bill when ambient motion is paused');assert.equal(duck.getState().billOpenRadians,0);

duck.dispose();
duck.dispose();
assert.equal(duck.update(1 / 60), false);
const automaticEvents=[];const automatic=createDuck3D({loadAsset,randomCallSource:()=>0,onEvent:event=>automaticEvents.push(event)});await automatic.ready;automatic.setRandomCalls(true);const initialAutomatic=automatic.getState();let automaticGape=0;
for(let i=0;i<960;i++){automatic.update(1/60,{motion:false,randomCallsAllowed:true});automaticGape=Math.max(automaticGape,automatic.getState().billOpenRadians);}
assert.equal(automaticEvents.filter(e=>e.type==='quack'&&e.autonomous).length,1);assert(automaticGape>.28,'An autonomous call uses the actual articulated mouth');assert.equal(automatic.getState().x,initialAutomatic.x);assert.equal(automatic.getState().z,initialAutomatic.z,'Random calls do not invent an approach target');
automatic.setRandomCalls(false);for(let i=0;i<3600;i++)automatic.update(1/60,{motion:false,randomCallsAllowed:true});assert.equal(automaticEvents.filter(e=>e.type==='quack').length,1);automatic.dispose();
const early = createDuck3D({ loadAsset });
early.dispose();
await early.ready;
let earlyMeshes = 0;
early.object3D.traverse(o => { if (o.isMesh) earlyMeshes++; });
assert.equal(earlyMeshes, 0, 'An asset finishing after disposal must not enter the scene.');
console.log('Duck v5 passed: acquired geometry with UV-preserving articulated lower bill, audible-call tail and paused-call animation, no placeholder, .75m/.30m dimensions, underwater feet, single quack, 300-second bounds, no obsolete dock, surface sampling, pause and disposal race.');
