import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/addons/loaders/GLTFLoader.js';
import {createReadingCompanion} from '../reading-companion.js';
import {SPACE} from '../reading-space.js';

// Exercise the real authored skeleton and clips. Only image decoding is omitted;
// browser acceptance loads the intact textures and verifies actual GPU output.
const file=fs.readFileSync(new URL('../assets/reading/companion/companion.glb',import.meta.url)),length=file.readUInt32LE(12),json=JSON.parse(file.subarray(20,20+length));
for(const m of json.materials??[]){for(const k of Object.keys(m))if(k.endsWith('Texture'))delete m[k];for(const k of Object.keys(m.pbrMetallicRoughness??{}))if(k.endsWith('Texture'))delete m.pbrMetallicRoughness[k];}
delete json.images;delete json.textures;
const jb=Buffer.from(JSON.stringify(json)),padded=Math.ceil(jb.length/4)*4,bin=file.subarray(20+length),bytes=Buffer.alloc(20+padded+bin.length,0x20);
bytes.writeUInt32LE(0x46546c67,0);bytes.writeUInt32LE(2,4);bytes.writeUInt32LE(bytes.length,8);bytes.writeUInt32LE(padded,12);bytes.writeUInt32LE(0x4e4f534a,16);jb.copy(bytes,20);bin.copy(bytes,20+padded);
const scene=new THREE.Scene(),g=new Set(),m=new Set(),interactive=[];
const companion=createReadingCompanion({scene,interactive,geometry:x=>(g.add(x),x),material:x=>(m.add(x),x),loadAsset:()=>new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')});
await companion.ready;assert(companion.getState().ready);assert.equal(companion.getState().action,'Idle');const at=companion.root.position.clone();
for(let i=0;i<60;i++)companion.update(1/60,{x:0,z:0});assert.equal(companion.getState().responses,0);
const visitor={x:SPACE.terrace.approach.x,z:SPACE.terrace.approach.z};companion.update(1/60,visitor);assert.equal(companion.getState().action,'Wave');assert.equal(companion.getState().responses,1);assert(!companion.greet(),'Repeated clicks cannot restart an ongoing greeting');
for(let i=0;i<240;i++)companion.update(1/60,visitor);assert.equal(companion.getState().action,'Idle');assert(companion.greet());for(let i=0;i<240;i++)companion.update(1/60,visitor);assert(companion.look());for(let i=0;i<360;i++)companion.update(1/60,visitor);assert.equal(companion.getState().action,'Idle');
assert(companion.root.position.distanceTo(at)<1e-8,'Greetings never slide the model around the courtyard');scene.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(companion.root,true);assert(b.max.y-b.min.y>1.6&&b.max.y-b.min.y<1.9);assert(Math.abs(b.min.y-.13)<.03,'Both authored shoes remain grounded during idle');assert(interactive.includes(companion.root));
companion.dispose();assert(!scene.children.includes(companion.root));g.forEach(x=>x.dispose());m.forEach(x=>x.dispose());console.log('Companion: real skinned GLB, proximity greeting, manual greeting cooldown, look-and-idle return, stable position, human scale, grounded shoes and disposal passed.');
