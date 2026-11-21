import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import * as THREE from '../vendor/three.module.js';
import {createReadingGarden} from '../reading-garden.js';
import {createWindowDrops,gardenWeatherAt,MAX_GLASS_DROPS} from '../reading-garden-motion.js';

// Real asset parsing and a five-minute CPU simulation. Texture decode is stubbed;
// this test does not claim GPU shader compilation or subjective visual/audio QA.
const root=fileURLToPath(new URL('../',import.meta.url));
const original={fetch:globalThis.fetch,Request:globalThis.Request,self:globalThis.self,createImageBitmap:globalThis.createImageBitmap,ProgressEvent:globalThis.ProgressEvent};
let bitmapClosed=0;
globalThis.self=globalThis;
globalThis.createImageBitmap=async()=>({width:1,height:1,close(){bitmapClosed++;}});
globalThis.ProgressEvent=class{constructor(type,props){this.type=type;Object.assign(this,props);}};
globalThis.Request=class extends original.Request{constructor(url,init){super(typeof url==='string'?new URL(url,'http://reading.test/'):url,init);}};
globalThis.fetch=async input=>{
 const url=typeof input==='string'?input:input.url;
 if(url.startsWith('blob:'))return original.fetch(input);
 const parsed=new URL(url);assert.equal(parsed.hostname,'reading.test');
 const target=path.resolve(root,'.'+decodeURIComponent(parsed.pathname));assert(target.startsWith(root));
 const bytes=await readFile(target);return new Response(bytes,{headers:{'Content-Length':String(bytes.length)}});
};
try{
 const scene=new THREE.Scene(),externalGeometry=new Set(),externalMaterials=new Set();
 const garden=createReadingGarden({scene,geometry:g=>(externalGeometry.add(g),g),material:m=>(externalMaterials.add(m),m),texture:()=>new THREE.Texture()});
 await garden.ready;scene.updateMatrixWorld(true);
 assert.equal(garden.stats.trees,6);assert.equal(garden.stats.treeVariants,2);assert.equal(garden.stats.shrubs,36);
 const batches=[];let vertices=0,triangles=0;const sourceForms=new Set();
 scene.traverse(o=>{
  if(!o.isInstancedMesh)return;batches.push(o);assert(o.castShadow&&o.receiveShadow);assert(o.customDepthMaterial);
  assert([...o.instanceMatrix.array].every(Number.isFinite));
  const positions=o.geometry.attributes.position;assert([...positions.array].every(Number.isFinite));vertices+=positions.count;
  triangles+=(o.geometry.index?o.geometry.index.count:positions.count)/3*o.count;
  if(o.name.startsWith('Broad'))sourceForms.add('A');if(o.name.startsWith('Forked'))sourceForms.add('B');
  const color={vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader,uniforms:{}};
  const depth={vertexShader:THREE.ShaderLib.depth.vertexShader,fragmentShader:THREE.ShaderLib.depth.fragmentShader,uniforms:{}};
  o.material.onBeforeCompile(color);o.customDepthMaterial.onBeforeCompile(depth);
  for(const uniform of ['uGardenTime','uGardenGust','uGardenDirection'])assert.equal(color.uniforms[uniform],depth.uniforms[uniform],'Shadow and visible wind must share the same uniform');
  assert.equal(o.customDepthMaterial.alphaTest,o.material.alphaTest);
  assert.equal(o.customDepthMaterial.map,o.material.map);
 });
 assert.equal(sourceForms.size,2);assert.equal(batches.length,10);
 const light=garden.group.children.find(o=>o.isDirectionalLight);assert(light.castShadow);assert.equal(light.shadow.camera.layers.mask,2);
 const drops=createWindowDrops();const wind=[];
 for(let i=0;i<=18000;i++){
  const t=i/60;drops.step(t,1);const weather=garden.update(t);wind.push(weather.wind);
  assert(weather.wind>=.24&&weather.wind<=.81);assert(weather.cloud>=.955&&weather.cloud<=1);
  assert([light.intensity,weather.rain,weather.wind].every(Number.isFinite));
  if(i%600===0){const s=drops.snapshot();assert(s.drops.length<=MAX_GLASS_DROPS);for(const d of s.drops)assert(Object.values(d).every(Number.isFinite));}
 }
 const motion=drops.snapshot();assert(motion.merges>10);assert(motion.departed>30);assert(motion.mergedAreaError<1e-15);
 const frozen=drops.snapshot();for(let i=0;i<30;i++)drops.step(300,1);assert.deepEqual(drops.snapshot(),frozen,'A paused scene must freeze drops');
 const spawnedBeforeDry=drops.snapshot().spawned;for(let i=18001;i<=36000;i++)drops.step(i/60,0);assert.equal(drops.snapshot().spawned,spawnedBeforeDry);
 const difference=lag=>Math.sqrt(wind.slice(lag).reduce((sum,v,i)=>sum+(v-wind[i])**2,0)/(wind.length-lag));
 for(const seconds of [5,10,15,30,60])assert(difference(seconds*60)>.012,'Wind should not reset on a short loop');
 garden.resize(390,844,1.75);
 const camera=new THREE.PerspectiveCamera(),previousTarget={},renderer={toneMapping:THREE.ACESFilmicToneMapping,shadowMap:{autoUpdate:false},current:previousTarget,getRenderTarget(){return this.current;},setRenderTarget(t){this.current=t;},clear(){},render(){throw new Error('synthetic render failure');}};
 const mask=camera.layers.mask;assert.throws(()=>garden.render(renderer,camera),/synthetic/);assert.equal(camera.layers.mask,mask);assert.equal(renderer.current,previousTarget);assert.equal(renderer.toneMapping,THREE.ACESFilmicToneMapping);assert.equal(renderer.shadowMap.autoUpdate,false);
 garden.dispose();assert.equal(scene.children.length,0);externalGeometry.forEach(g=>g.dispose());externalMaterials.forEach(m=>m.dispose());assert(bitmapClosed>0);
 const report={test:'v6 CPU integration; real GLB parsing; image decode stubs',treeModels:2,trees:6,shrubs:36,windShadowBatches:batches.length,uniqueVertices:vertices,expandedTriangles:triangles,simulatedSeconds:300,dropMerges:motion.merges,dropDepartures:motion.departed,dropMaxAreaError:motion.mergedAreaError,windRange:[Math.min(...wind),Math.max(...wind)],pauseAndDry:true,renderStateRecovery:true,dispose:true,gpuVerified:false,subjectiveExperienceVerified:false};
 await writeFile(new URL('../docs/reading-v6-validation.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{for(const[k,v]of Object.entries(original)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
