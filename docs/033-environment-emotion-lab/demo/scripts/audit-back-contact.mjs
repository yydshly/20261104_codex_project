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

let worst=0,count=0,checked=0;const ray=new THREE.Raycaster(),direction=f.clone().negate();player.root.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;const ix=mesh.geometry.attributes.skinIndex,w=mesh.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++){let weight=0;for(let k=0;k<4;k++)if(/Spine|Pelvis/.test(mesh.skeleton.bones[ix.getComponent(i,k)]?.name))weight+=w.getComponent(i,k);if(weight<.65)continue;const p=mesh.getVertexPosition(i,new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);if(p.y<.8||p.y>1.55)continue;ray.set(p.clone().addScaledVector(f,1.4),direction);const hits=ray.intersectObject(outer,true),front=hits.find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).dot(f)>.25);if(!front)continue;checked++;const near=p.clone().sub(front.point).dot(f);if(near>=0)continue;const back=hits.find(h=>h.object===front.object&&h.distance>front.distance+.01&&h.face.normal.clone().transformDirection(h.object.matrixWorld).dot(f)<-.25);if(back&&p.clone().sub(back.point).dot(f)>0){count++;worst=Math.max(worst,Math.min(-near,p.clone().sub(back.point).dot(f)));}}});console.log({checked,inside:count,worst});

assert(worst<.002,'The seated torso must stay outside the actual acquired backrest');fs.writeFileSync(new URL('../docs/seat-contact-review/back-report.json',import.meta.url),JSON.stringify({checked,inside:count,worst},null,2));
