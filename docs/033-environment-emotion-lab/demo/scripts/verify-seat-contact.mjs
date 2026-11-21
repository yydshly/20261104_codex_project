import {createSeatContact} from '../reading-seat-contact.js';
import {createReadingWalk} from '../reading-walk.js';
import {loadReadingMotions} from './reading-motion-fixture.mjs';
globalThis.ProgressEvent??=class{constructor(type,init){this.type=type;Object.assign(this,init);}};
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

const state={position:{...SPACE.seat},zone:'room',seated:true,seatedPlace:'room',posturePlace:'room',sitAmount:1,yaw:.8,pitch:-.1};for(let i=0;i<120;i++)player.update(1/60,state,{mode:'third',headHidden:false});
const heading=SPACE.room.heading,f=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading)),r=new THREE.Vector3(f.z,0,-f.x),origin=new THREE.Vector3(-.85,.05,-.35);
const data=JSON.parse(fs.readFileSync(new URL('../assets/reading/mid_century_lounge_chair/mid_century_lounge_chair_2k.gltf',import.meta.url)));for(const b of data.buffers)b.uri='data:application/octet-stream;base64,'+fs.readFileSync(new URL('../assets/reading/mid_century_lounge_chair/'+b.uri,import.meta.url)).toString('base64');delete data.images;delete data.textures;for(const m of data.materials??[]){for(const k of Object.keys(m))if(k.endsWith('Texture'))delete m[k];for(const k of Object.keys(m.pbrMetallicRoughness??{}))if(k.endsWith('Texture'))delete m.pbrMetallicRoughness[k];}
const chair=(await new GLTFLoader().parseAsync(JSON.stringify(data),'')).scene;chair.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(chair,true),center=box.getCenter(new THREE.Vector3()),scale=1.28/box.getSize(new THREE.Vector3()).x;chair.position.set(-center.x,-box.min.y,-center.z);const inner=new THREE.Group();inner.add(chair);inner.scale.setScalar(scale);const outer=new THREE.Group();outer.add(inner);outer.position.copy(origin);outer.rotation.y=heading;outer.updateMatrixWorld(true);
function probes(root,skinned=false){const points=[];root.traverse(mesh=>{if(!mesh.isMesh)return;const idx=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight;for(let i=0;i<mesh.geometry.attributes.position.count;i++){if(skinned){let w=0;for(let k=0;k<4;k++)if(/Spine/.test(mesh.skeleton.bones[idx.getComponent(i,k)]?.name))w+=weights.getComponent(i,k);if(w<.4)continue;}const p=(skinned?mesh.getVertexPosition(i,new THREE.Vector3()):new THREE.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i)).applyMatrix4(mesh.matrixWorld),v=p.clone().sub(origin);if(Math.abs(v.dot(r))<.2)points.push({y:p.y,forward:v.dot(f),lateral:v.dot(r)});}});return points;}


outer.traverse(o=>{if(o.isMesh)for(const m of [o.material].flat())m.side=THREE.DoubleSide;});
const skins=[];player.root.traverse(m=>{if(m.isSkinnedMesh)skins.push(m);});const samples=[];for(const mesh of skins){const ix=mesh.geometry.attributes.skinIndex,w=mesh.geometry.attributes.skinWeight,cells=new Set();for(let i=0;i<w.count;i++){let a=0;for(let k=0;k<4;k++)if(/Pelvis|Thigh/.test(mesh.skeleton.bones[ix.getComponent(i,k)]?.name))a+=w.getComponent(i,k);if(a<.65)continue;const p=mesh.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld),v=p.clone().sub(origin),z=v.dot(f),x=v.dot(r);const key=[x,z,p.y].map(x=>Math.round(x/.025)).join(',');if(cells.has(key))continue;cells.add(key);samples.push({mesh,i});}}

const debugProfile=createSeatContact(player.root);function audit(label){const ray=new THREE.Raycaster();ray.ray.direction.set(0,-1,0);let deepest=null,worst=0,penetrating=0,contacts=0,checked=0;for(const s of samples){const p=s.mesh.getVertexPosition(s.i,new THREE.Vector3()).applyMatrix4(s.mesh.matrixWorld);if(p.y>.9||p.y<.35)continue;ray.ray.origin.set(p.x,1,p.z);const hits=ray.intersectObject(outer,true);const hit=hits.find(h=>{const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);return h.point.y>.44&&h.point.y<.78&&n.y>.25;});if(!hit)continue;const bottom=hits.find(h=>h.object===hit.object&&h.point.y<hit.point.y-.01&&h.face.normal.clone().transformDirection(h.object.matrixWorld).y<-.25);if(bottom&&p.y<bottom.point.y-.002)continue;checked++;const gap=p.y-hit.point.y;if(gap<0){penetrating++;if(-gap>worst){worst=-gap;deepest={point:p.toArray(),top:hit.point.y,bottom:bottom?.point.y,profile:debugProfile.heightAt(p.x,p.z)};}}if(Math.abs(gap)<.015)contacts++;}return{label,worst,deepest,penetrating,contacts,checked,correction:player.getState().seatContact};}
const results=[];function steps(label,n){for(let i=0;i<n;i++){player.update(1/60,state,{mode:'third',headHidden:false});if(i%12===0)results.push(audit(label));}}
steps('seated idle',480);player.setBook(true);steps('reach lift',180);steps('read',240);player.turnPage();steps('page turn',110);player.setBook(false);steps('put book',150);
// Drive the actual stand/sit controller through the collision solver as well.
const originalWindow=globalThis.window,originalDocument=globalThis.document;globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.document={addEventListener(){},removeEventListener(){}};const canvas={addEventListener(){},removeEventListener(){}};const navCamera=new THREE.PerspectiveCamera(),walk=createReadingWalk(navCamera,canvas);walk.setReady(true);
for(const label of ['stand','sit']){walk.action('seat');for(let i=0;i<210;i++){Object.assign(state,walk.update(1/60));player.update(1/60,state,{mode:'third',headHidden:false});if(i%12===0)results.push(audit(label));}}
walk.dispose();globalThis.window=originalWindow;globalThis.document=originalDocument;
const worst=results.reduce((a,b)=>a.worst>b.worst?a:b);console.log(JSON.stringify({worst,frames:results.length,byAction:Object.fromEntries([...new Set(results.map(r=>r.label))].map(label=>[label,Math.max(...results.filter(r=>r.label===label).map(r=>r.worst))]))},null,2));fs.mkdirSync(new URL('../docs/seat-contact-review/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../docs/seat-contact-review/mesh-report.json',import.meta.url),JSON.stringify({results,worst,passed:worst.worst<.002},null,2));assert(worst.worst<.002,'Actual skinned hips/thighs must not visibly penetrate the acquired cushion throughout the chain');
