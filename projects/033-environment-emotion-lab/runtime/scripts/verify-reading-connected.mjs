import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import * as THREE from '../vendor/three.module.js';
import {createReadingGarden} from '../reading-garden.js';
import {ReadingLayerPass} from '../reading-layer-pass.js';
import {SPACE} from '../reading-space.js';

// Actual GLB parsing and simulation; image decode and renderer are stubs, not GPU proof.
const root=fileURLToPath(new URL('../',import.meta.url));
const original={fetch:globalThis.fetch,Request:globalThis.Request,self:globalThis.self,createImageBitmap:globalThis.createImageBitmap,ProgressEvent:globalThis.ProgressEvent};
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1,height:1,close(){}});globalThis.ProgressEvent=class{constructor(type,props){this.type=type;Object.assign(this,props);}};
globalThis.Request=class extends original.Request{constructor(url,init){super(typeof url==='string'?new URL(url,'http://connected.test/'):url,init);}};
let loaded=0;
globalThis.fetch=async input=>{const url=typeof input==='string'?input:input.url;if(url.startsWith('blob:'))return original.fetch(input);let pathname;
 if(url.startsWith('file:'))pathname=fileURLToPath(url);else{const u=new URL(url);assert.equal(u.hostname,'connected.test');pathname=path.resolve(root,'.'+decodeURIComponent(u.pathname));}assert(pathname.startsWith(root));const bytes=await readFile(pathname);loaded++;return new Response(bytes,{headers:{'Content-Length':String(bytes.length)}});};
try{
 const scene=new THREE.Scene(),geometries=new Set(),materials=new Set(),textures=new Set(),events=[];
 const garden=createReadingGarden({scene,connected:true,onPondEvent:e=>events.push(e),geometry:g=>(geometries.add(g),g),material:m=>(materials.add(m),m),texture:()=>{const t=new THREE.Texture();textures.add(t);return t;}});
 await garden.ready;scene.updateMatrixWorld(true);assert(garden.stats.loaded);assert.equal(garden.stats.trees,12);assert.equal(garden.pond.duck.getState().assetStatus,'ready');
 const {water,duck}=garden.pond;assert.deepEqual(water.mesh.material.uniforms.pondOrigin.value.toArray(),[SPACE.pond.x,SPACE.pond.z]);assert.equal(water.mesh.position.x,SPACE.pond.x);assert(water.mesh.material.vertexShader.includes('surfaceWorld.xz-pondOrigin'));assert(water.mesh.material.fragmentShader.includes('(worldPosition.xz-pondOrigin)'));assert.equal(water.mesh.userData.reflectionLayers,3);
 const mainHeight=water.mesh.position.y;assert(Math.abs(mainHeight-.08)<1e-9);const duckBefore=duck.getState();const duckWorld=duck.object3D.getWorldPosition(new THREE.Vector3());assert(Math.abs(duckWorld.x-(duckBefore.x+SPACE.pond.x))<1e-6);
 garden.pond.call(SPACE.pondStop);for(let i=0;i<1200;i++)garden.update(i/60,{dt:1/60});
 assert.equal(events.filter(e=>e.type==='quack').length,1,'One call produces one recorded-quack event');assert(events.some(e=>e.type==='wake'));assert(events.every(e=>[e.x,e.z].every(Number.isFinite)));
 const swimmer=water.mesh.material.uniforms.pondSwimmer.value,pose=duck.getState();assert(Math.abs(swimmer.x-pose.x)<1e-8);assert(Math.abs(swimmer.y-pose.z)<1e-8);
 scene.updateMatrixWorld(true);const shore=scene.getObjectsByProperty('isMesh',true).find(o=>o.geometry.getAttribute('color')&&o.geometry.attributes.position.count===644);assert(shore);const normals=shore.geometry.attributes.normal;assert(normals.getY(300)>.7,'Shore faces upward');
 const frozen=duck.getState().animationTime;water.ripple(0,0);for(let i=0;i<360;i++)garden.update(20,{dt:1/60,motion:false});assert.equal(duck.getState().animationTime,frozen);assert(water.mesh.material.uniforms.pondRipples.value.every(r=>r.w===0),'Reduced motion freezes background movement while click effects can finish');
 const camera=new THREE.PerspectiveCamera();camera.position.set(1,1.65,1);const target={},renderCalls=[],renderer={autoClear:true,autoClearColor:true,autoClearDepth:true,autoClearStencil:true,setRenderTarget(){},clear(){},render(s,c){renderCalls.push({mask:c.layers.mask,background:s.background});}};
 scene.background=new THREE.Color('#222222');const sky=scene.background,outside=new ReadingLayerPass(scene,camera,1),room=new ReadingLayerPass(scene,camera,0,{clear:false});outside.render(renderer,null,target);room.render(renderer,null,target);assert.equal(renderCalls[0].mask,2);assert.equal(renderCalls[1].mask,1);assert.equal(renderCalls[1].background,null);assert.equal(scene.background,sky);assert.equal(camera.layers.mask,1);assert.equal(renderer.autoClear,true);
 const previous={},capture={toneMapping:THREE.ACESFilmicToneMapping,shadowMap:{autoUpdate:false},current:previous,getRenderTarget(){return this.current;},setRenderTarget(t){this.current=t;},clear(){},render(){throw Error('capture error');}};
 assert.throws(()=>garden.render(capture,camera),/capture error/);assert.equal(capture.current,previous);assert.equal(camera.layers.mask,1);assert.equal(capture.toneMapping,THREE.ACESFilmicToneMapping);
 garden.dispose();assert.equal(scene.children.length,0);geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
 const report={version:'reading-v7-connected',checks:{realGLBParsing:true,filesLoaded:loaded,sameWorldDuckAndWater:true,offsetWaveCoordinates:true,oneCallOneQuack:true,floatingAndWakeState:true,motionPreference:true,indoorOutdoorSharedDepthPasses:true,renderStateRecovery:true,resourceDisposal:true},gpuVerified:false,subjectiveAudioVerified:false,browserControl:'CPU integration only; actual in-app canvas/audio review artifacts are stored separately in docs/reading-v7-live-review/.'};
 await writeFile(new URL('../docs/reading-v7-validation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{for(const[k,v]of Object.entries(original)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
