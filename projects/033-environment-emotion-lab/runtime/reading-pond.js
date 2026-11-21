import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {createPondWater} from './pond-water-3d.js';
import {createDuck3D} from './pond-duck-v5.js';
import {SPACE} from './reading-space.js';

/** Existing v5 water and mallard inhabit the actual garden, visible through the room window. */
export function createReadingPond({group,texture,onEvent=()=>{}}){
 let disposed=false,elapsed=0;const owned={g:new Set(),m:new Set(),t:new Set()},batches=[];
 const pond=SPACE.pond,water=createPondWater({origin:[pond.x,pond.z]});water.mesh.layers.set(1);water.mesh.userData.reflectionLayers=3;group.add(water.mesh);
 const duckRoot=new THREE.Group();duckRoot.position.set(pond.x,0,pond.z);group.add(duckRoot);
 function event(e){if(disposed)return;if(e.type==='wake')water.wake(e.x,e.z,e.heading,e.speed);if(e.type==='splash')water.ripple(e.x,e.z,e.strength);onEvent({...e,x:e.x+pond.x,z:e.z+pond.z});}
 const duck=createDuck3D({onEvent:event});duckRoot.add(duck.object3D);duck.setSurfaceSampler(water.sampleHeight);
 function ownG(g){owned.g.add(g);return g;}function ownM(m){owned.m.add(m);return m;}
 function mesh(g,m,p,r){const o=new THREE.Mesh(ownG(g),m);o.position.fromArray(p);if(r)o.rotation.fromArray(r);o.layers.set(1);o.castShadow=o.receiveShadow=true;group.add(o);return o;}
 const maps={map:texture('./assets/materials/mud_forest-color.jpg',[1,1],true),normalMap:texture('./assets/materials/mud_forest-normal.jpg',[1,1]),roughnessMap:texture('./assets/materials/mud_forest-roughness.jpg',[1,1])};
 const soil=ownM(new THREE.MeshStandardMaterial({color:'#c2bda7',...maps,roughness:.94,normalScale:new THREE.Vector2(.4,.4),fog:false}));
 // A continuous yard with two real openings: the pond basin and the house footprint.
 const land=new THREE.Shape();land.moveTo(-45,-40);land.lineTo(36,-40);land.lineTo(36,40);land.lineTo(-45,40);land.closePath();
 const basin=new THREE.Path();basin.absellipse(pond.x,-pond.z,pond.rx*1.10,pond.rz*1.10,0,Math.PI*2,true);land.holes.push(basin);
 const house=new THREE.Path();house.moveTo(-3.13,-3.43);house.lineTo(-3.13,2.91);house.lineTo(3.48,2.91);house.lineTo(3.48,-3.43);house.closePath();land.holes.push(house);
 const landGeo=new THREE.ShapeGeometry(land,128);const uv=landGeo.attributes.uv,pos=landGeo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/3,-pos.getY(i)/3);
 mesh(landGeo,soil,[0,.12,0],[-Math.PI/2,0,0]).name='Continuous courtyard ground with pond and room cut-outs';
 const positions=[],uvs=[],colors=[],indices=[],rings=[.956,1.015,1.10,1.25],segments=160;
 for(let j=0;j<rings.length;j++)for(let i=0;i<=segments;i++){const angle=i/segments*Math.PI*2,wiggle=j===0?.012*Math.sin(angle*5+.3):0,r=rings[j]+wiggle,x=pond.x+Math.cos(angle)*pond.rx*r,z=pond.z+Math.sin(angle)*pond.rz*r;positions.push(x,[.062,.102,.13,.12][j],z);uvs.push(x/3,z/3);const c=[.55,.72,.95,1][j];colors.push(c,c,c);}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const shore=new THREE.BufferGeometry();shore.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));shore.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));shore.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));shore.setIndex(indices);shore.computeVertexNormals();mesh(shore,ownM(soil.clone()),[0,0,0]).material.vertexColors=true;
 const gravel=ownM(new THREE.MeshStandardMaterial({color:'#8f9384',roughness:.95,...maps,normalScale:new THREE.Vector2(.18,.18),fog:false}));
 const pathPoints=[[-1.8,3.4],[-1.8,4.7],[-4.4,5.4],[-6.6,4.9],[-8.3,3.7]],pathPositions=[],pathUV=[],pathIndices=[];
 pathPoints.forEach(([x,z],i)=>{const before=pathPoints[Math.max(0,i-1)],after=pathPoints[Math.min(pathPoints.length-1,i+1)],dx=after[0]-before[0],dz=after[1]-before[1],len=Math.hypot(dx,dz),nx=-dz/len*.52,nz=dx/len*.52;pathPositions.push(x+nx,.128,z+nz,x-nx,.128,z-nz);pathUV.push(0,i,1,i);if(i){const a=(i-1)*2;pathIndices.push(a,a+2,a+1,a+1,a+2,a+3);}});
 const pathGeo=new THREE.BufferGeometry();pathGeo.setAttribute('position',new THREE.Float32BufferAttribute(pathPositions,3));pathGeo.setAttribute('uv',new THREE.Float32BufferAttribute(pathUV,2));pathGeo.setIndex(pathIndices);pathGeo.computeVertexNormals();mesh(pathGeo,gravel,[0,0,0]).name='Walkable garden path from the reading room to the pond';
 // A low, hand-built timber seat beside the bank gives the route a quiet destination.
 const timber=ownM(new THREE.MeshStandardMaterial({color:'#8b7556',roughness:.93,map:texture('./assets/materials/wood_planks_grey-color.jpg',[2,1],true),normalMap:texture('./assets/materials/wood_planks_grey-normal.jpg',[2,1]),roughnessMap:texture('./assets/materials/wood_planks_grey-roughness.jpg',[2,1]),normalScale:new THREE.Vector2(.20,.20),fog:false}));
 for(const z of [5.72,5.95])mesh(new THREE.BoxGeometry(1.5,.055,.19),timber,[-9,.54,z]);
 for(const x of [-9.5,-8.5])mesh(new THREE.BoxGeometry(.11,.42,.42),timber,[x,.33,5.85]);
 const loader=new GLTFLoader();
 function release(gltf){const materials=new Set(),textures=new Set();gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();[o.material].flat().forEach(m=>materials.add(m));}});materials.forEach(m=>{for(const t of Object.values(m))if(t?.isTexture)textures.add(t);m.dispose();});textures.forEach(t=>{t.dispose();t.image?.close?.();});}
 const rocks=loader.loadAsync('./assets/models/environment-v5/runtime/rock_moss_set_01.glb').then(gltf=>{
  if(disposed){release(gltf);return;}gltf.scene.updateMatrixWorld(true);const parts=[];gltf.scene.traverse(o=>{if(o.isMesh)parts.push(o);});
  parts.forEach((part,index)=>{const g=ownG(part.geometry.clone().applyMatrix4(part.matrixWorld)),bounds=new THREE.Box3().setFromBufferAttribute(g.attributes.position),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());g.translate(-center.x,-bounds.min.y,-center.z);part.geometry.dispose();const mat=ownM(part.material);for(const t of Object.values(mat))if(t?.isTexture)owned.t.add(t);mat.roughness=.94;mat.fog=false;
   const placements=Array.from({length:5},(_,i)=>{const a=(i*1.33+index*.7);return{x:pond.x+Math.cos(a)*5.7,z:pond.z+Math.sin(a)*3.95,h:.18+(i%3)*.12,rotation:a*2.1};});const batch=new THREE.InstancedMesh(g,mat,placements.length),dummy=new THREE.Object3D();batch.layers.set(1);placements.forEach((p,i)=>{dummy.position.set(p.x,.11,p.z);dummy.scale.setScalar(p.h/Math.max(size.y,.01));dummy.rotation.y=p.rotation;dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);});batch.castShadow=batch.receiveShadow=true;group.add(batch);batches.push(batch);
  });
 });
 const ready=Promise.all([duck.ready,rocks]).then(()=>{duck.object3D.traverse(o=>o.layers.set(1));});
 return{ready,water,duck,
  update(t,{wind=.4,dt=.016,motion=true,randomCallsAllowed=false}={}){elapsed+=Math.max(0,Math.min(dt,.1));water.update(elapsed,{wind,motion});duck.update(dt,{wind,motion,randomCallsAllowed});water.setSwimmer(duck.getState());},
  call(listener){const dx=(listener?.x??-8)-pond.x,dz=(listener?.z??4)-pond.z,r=Math.hypot(dx/3.45,dz/2.1),s=Math.min(1,.86/Math.max(r,.01));duck.interact('call',{x:dx*s,z:dz*s});},
  hit(point){const x=point.x-pond.x,z=point.z-pond.z;if(water.ripple(x,z,.38))duck.interact('water',{x,z});},
  getDuckPosition(){const s=duck.getState();return{x:s.x+pond.x,y:.28,z:s.z+pond.z};},
  resizeQuality:water.resizeQuality,
  dispose(){if(disposed)return;disposed=true;water.dispose();duck.dispose();batches.forEach(b=>b.dispose());owned.g.forEach(g=>g.dispose());owned.m.forEach(m=>m.dispose());owned.t.forEach(t=>{t.dispose();t.image?.close?.();});}
 };
}
