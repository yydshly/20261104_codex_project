import * as THREE from 'three';
import {GROUND_Y,FLOOR_HEIGHT,BUILDINGS,TREES} from './courtyard-layout.js';
import {createStuccoFinish,createWindowSystem} from './outdoor-materials.js';
import {installCanopy} from './canopy-vegetation.js';
import {plantingLayout} from './garden-layout.js';
import {buildGardenDetails} from './garden-details.js';
import {buildResidentialBuildings} from './residential-buildings.js';
import {installBalconyLife} from './balcony-life.js';

export function buildCourtyardScene(loader,manager,renderer){
  const world=new THREE.Scene();world.name='modelled-residential-courtyard';
  const breezeTime={value:0},reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');let shadowElapsed=0,reportedTime=-1;
  world.fog=new THREE.Fog('#d3dfe2',78,145);world.environmentIntensity=.45;
  const hemi=new THREE.HemisphereLight('#dcebf2','#8e866d',.85);world.add(hemi);
  const sun=new THREE.DirectionalLight('#fff2d9',2.6);sun.position.set(-24,34,-13);sun.target.position.set(0,-5,-23);world.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-38,right:38,top:35,bottom:-35,near:1,far:110});sun.shadow.normalBias=.025;sun.shadow.bias=-.00012;sun.shadow.radius=1.8;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;
  const twilight=new THREE.HemisphereLight('#8397b9','#574c3c',0);world.add(twilight);
  const skyUniforms={zenith:{value:new THREE.Color('#92b9d1')},horizon:{value:new THREE.Color('#e4e6e0')},cloud:{value:new THREE.Color('#ffffff')},sunDirection:{value:sun.position.clone().normalize()},breezeTime};
  const skyMaterial=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:skyUniforms,vertexShader:`varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
    varying vec3 direction;uniform vec3 zenith,horizon,cloud,sunDirection;uniform float breezeTime;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}
    void main(){vec3 d=normalize(direction);float h=max(d.y,0.);vec3 c=mix(horizon,zenith,pow(h,.48));vec2 p=d.xz/(h+.3)*2.3+vec2(breezeTime*.004,breezeTime*.0015);float n=noise(p)*.55+noise(p*2.1)*.27+noise(p*4.3)*.12;float clouds=smoothstep(.46,.70,n)*smoothstep(0.,.15,h)*.48;c=mix(c,cloud,clouds);c+=cloud*pow(max(dot(d,sunDirection),0.),80.)*.12;gl_FragColor=vec4(c,1.);}`});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(146,40,24),skyMaterial);sky.name='procedural-sky';
  sky.onBeforeRender=(_renderer,_scene,camera)=>{camera.getWorldPosition(sky.position);sky.updateMatrixWorld();};world.add(sky);

  const tile=(asset,suffix,color,repeat)=>{const t=loader.load(`assets/v9/${asset}/${asset}_${suffix}_1k.jpg`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=renderer.capabilities.getMaxAnisotropy();if(color)t.colorSpace=THREE.SRGBColorSpace;return t;};
  const lawnMaterial=new THREE.MeshStandardMaterial({color:'#9ac38a',map:tile('aerial_grass_rock','diff',true,[20,20]),normalMap:tile('aerial_grass_rock','nor_gl',false,[20,20]),normalScale:new THREE.Vector2(.28,.28),roughness:1});
  const pavingMaterial=new THREE.MeshStandardMaterial({color:'#e4dfd3',map:tile('pavement_03','diff',true,[1,1]),normalMap:tile('pavement_03','nor_gl',false,[1,1]),normalScale:new THREE.Vector2(.20,.20),roughness:.94});
  const lawn=new THREE.Mesh(new THREE.PlaneGeometry(240,240),lawnMaterial);lawn.rotation.x=-Math.PI/2;lawn.position.set(0,GROUND_Y,-35);lawn.receiveShadow=true;lawn.name='courtyard-ground';world.add(lawn);
  const mats={};
  const stuccoFinish=createStuccoFinish(),daylight={value:1},eveningMode={value:0};
  const windows=createWindowSystem(world,renderer,eveningMode,sun.position.clone().sub(sun.target.position).normalize());
  let captureReady=false;
  const material=(key,color,extra={})=>mats[key]??(mats[key]=new THREE.MeshStandardMaterial({color,roughness:.88,...extra}));
  material('stone','#b6b1a4');material('frame','#4a504c',{metalness:.5,roughness:.34});material('rail','#626963',{metalness:.45,roughness:.43});material('slab','#c9c7bb');material('sill','#e2dfd2');material('wood','#927452');material('soil','#615b43');
  stuccoFinish(mats.slab,{bump:.0009,weather:.045});stuccoFinish(mats.sill,{bump:.0005,weather:.025});
  const batches=new Map(),unit=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
  function block(key,w,h,d,x,y,z,transform){
    dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix();
    const matrix=dummy.matrix.clone();if(transform)matrix.premultiply(transform);
    if(!batches.has(key))batches.set(key,[]);batches.get(key).push(matrix);
  }
  const architecture=buildResidentialBuildings({world,buildings:BUILDINGS,block,material,stuccoFinish,windows,registerMaterial:(key,mat)=>mats[key]=mat});

  const terraceMaterial=pavingMaterial.clone();
  terraceMaterial.map=tile('pavement_03','diff',true,[10,1.3]);
  terraceMaterial.normalMap=tile('pavement_03','nor_gl',false,[10,1.3]);
  const terrace=new THREE.Mesh(new THREE.PlaneGeometry(31,3.5),terraceMaterial);terrace.rotation.x=-Math.PI/2;terrace.position.set(0,GROUND_Y+.015,-6.5);terrace.receiveShadow=true;world.add(terrace);
  function path(points,width=1.8){
    const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,GROUND_Y+.025,z))),positions=[],uv=[],indices=[];
    const length=curve.getLength();
    for(let i=0;i<=120;i++){const t=i/120,p=curve.getPoint(t),tangent=curve.getTangent(t),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();for(const s of [-1,1]){const v=p.clone().addScaledVector(side,width*.5*s);positions.push(v.x,v.y,v.z);uv.push((s+1)*width*.25,t*length*.5);}if(i<120){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,pavingMaterial);m.receiveShadow=true;m.name='garden-path';world.add(m);
  }
  path([[0,-8],[1.5,-13],[.5,-19],[1,-24],[-1.2,-29],[-1,-32.3]]);
  path([[-20,-22],[-12,-21],[0,-22],[11,-23],[20,-24]]);
  path([[1,-24],[5,-31],[12,-36.6]]);
  // Benches are human scale: 1.8m long, seat 0.45m above the garden.
  for(const [x,z]of [[-2.5,-17],[4.3,-26],[-13.5,-23.5]]){
    for(const dx of [-.65,.65])block('rail',.07,.43,.44,x+dx,GROUND_Y+.215,z);
    for(let i=0;i<4;i++)block('wood',1.8,.045,.11,x,GROUND_Y+.45,z-.19+i*.125);
    block('wood',1.8,.28,.045,x,GROUND_Y+.77,z-.26);
  }
  for(const [key,transforms]of batches){const instances=new THREE.InstancedMesh(unit,mats[key],transforms.length);transforms.forEach((m,i)=>instances.setMatrixAt(i,m));instances.castShadow=!key.startsWith('window');instances.receiveShadow=true;instances.name='courtyard-'+key;world.add(instances);}

  const state={type:'modelled-3d',groundY:GROUND_Y,floorHeight:FLOOR_HEIGHT,balconyHeight:8.85,frontBuildingGap:27.78,buildings:BUILDINGS.length,treesExpected:TREES.length,treesLoaded:0,buildingParallax:true,architecture:architecture.stats};
  const diagnostics=()=>{document.querySelector('#scene').dataset.exterior=JSON.stringify(state);};diagnostics();
  const planting=plantingLayout(),garden=buildGardenDetails(world,planting,breezeTime,daylight);
  const ready=Promise.all([installCanopy(world,manager,daylight,breezeTime,TREES,planting.shrubs),installBalconyLife(world,manager,daylight,breezeTime,architecture)]).then(([canopy,life])=>{
    state.treesLoaded=canopy.trees;state.canopy=canopy;state.garden=garden.counts;state.balconyLife=life;
    sun.shadow.needsUpdate=true;windows.capture();captureReady=true;
    state.materials='world-stucco+varied-recessed-glass+full-canopy';diagnostics();
  });
  return {scene:world,ready,update(dt,paused=false){
    windows.update();
    if(!paused&&!reducedMotion.matches){
      breezeTime.value+=dt;shadowElapsed+=dt;
      if(shadowElapsed>.12&&daylight.value>.1){sun.shadow.needsUpdate=true;shadowElapsed=0;}
    }
    const current=Math.floor(breezeTime.value);
    if(current!==reportedTime){reportedTime=current;state.reflection=windows.status;diagnostics();document.querySelector('#scene').dataset.motion=JSON.stringify({enabled:!reducedMotion.matches,time:+breezeTime.value.toFixed(2),breeze:'gentle',shadows:'matching-wind'});}
  },restore(){windows.restore();sun.shadow.needsUpdate=true;reportedTime=-1;},setEvening(evening){
    sun.intensity=evening?.12:2.6;hemi.intensity=evening?.25:.85;twilight.intensity=evening?.35:0;
    skyUniforms.zenith.value.set(evening?'#34465c':'#92b9d1');skyUniforms.horizon.value.set(evening?'#b89b8c':'#e4e6e0');skyUniforms.cloud.value.set(evening?'#8a8291':'#ffffff');
    world.fog.color.set(evening?'#707b8a':'#d3dfe2');world.environmentIntensity=evening?.22:.45;
    daylight.value=evening?.08:1;eveningMode.value=evening?1:0;
    garden.setEvening(evening);architecture.setEvening(evening);
    sun.shadow.needsUpdate=true;if(captureReady)windows.capture();
  }};
}
