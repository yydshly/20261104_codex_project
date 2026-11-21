import {loadReadingMotions} from './reading-motion-fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/addons/loaders/GLTFLoader.js';
import {createReadingPlayer} from '../reading-player.js';
import {createReadingCamera,clipCameraBoom} from '../reading-camera.js';
import {cameraSolids,groundAt} from '../reading-space.js';
import {SPACE} from '../reading-space.js';

// Exercise the real authored skeleton and clips. Only image decoding is omitted;
// browser acceptance loads the intact textures and verifies actual GPU output.
const file=fs.readFileSync(new URL('../assets/reading/companion/companion.glb',import.meta.url)),length=file.readUInt32LE(12),json=JSON.parse(file.subarray(20,20+length));
for(const m of json.materials??[]){for(const k of Object.keys(m))if(k.endsWith('Texture'))delete m[k];for(const k of Object.keys(m.pbrMetallicRoughness??{}))if(k.endsWith('Texture'))delete m.pbrMetallicRoughness[k];}
delete json.images;delete json.textures;
const jb=Buffer.from(JSON.stringify(json)),padded=Math.ceil(jb.length/4)*4,bin=file.subarray(20+length),bytes=Buffer.alloc(20+padded+bin.length,0x20);
bytes.writeUInt32LE(0x46546c67,0);bytes.writeUInt32LE(2,4);bytes.writeUInt32LE(bytes.length,8);bytes.writeUInt32LE(padded,12);bytes.writeUInt32LE(0x4e4f534a,16);jb.copy(bytes,20);bin.copy(bytes,20+padded);
const scene=new THREE.Scene(),g=new Set(),m=new Set();
const player=createReadingPlayer({scene,loadMotions:loadReadingMotions,geometry:x=>(g.add(x),x),material:x=>(m.add(x),x),loadAsset:()=>new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')});
await player.ready;
assert(player.getState);


for(const place of ['room','terrace']){const state={position:{...(place==='room'?SPACE.seat:SPACE.terrace.seat)},zone:place==='room'?'room':'garden',seated:true,seatedPlace:place,posturePlace:place,sitAmount:1,yaw:place==='room'?SPACE.room.heading-Math.PI:SPACE.terrace.yaw,pitch:-.1};for(let i=0;i<120;i++)player.update(1/60,state,{mode:'third',headHidden:false});player.setBook(true);for(let i=0;i<63;i++)player.update(1/60,state,{mode:'third',headHidden:false});const p=player.getPerformance(),target=new THREE.Vector3(place==='room'?-.215:.153,-.015,0).applyQuaternion(p.bookQuaternion).add(p.bookPosition),hand=new THREE.Vector3(...player.getState().hands[place==='room'?0:1]);const tip=player.root.getObjectByName(THREE.PropertyBinding.sanitizeNodeName('Bip01 '+(place==='room'?'L':'R')+' Finger22')).getWorldPosition(new THREE.Vector3());assert(tip.distanceTo(target)<.035,'The near distal finger joint must reach the book edge before lifting');console.log(place+' primary finger/book-edge gap: '+(tip.distanceTo(target)*100).toFixed(2)+' cm');player.setBook(false);for(let i=0;i<300;i++)player.update(1/60,state,{mode:'third',headHidden:false});}
player.dispose();
