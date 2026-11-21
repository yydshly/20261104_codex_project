import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {MAX_GLASS_DROPS,instanceBreezeAt,gardenWeatherAt,gardenWindShader,gardenWindDisplacement,createWindowDrops,weatherNoise} from './reading-garden-motion.js';
import {createReadingPond} from './reading-pond.js';
import {SPACE} from './reading-space.js';

/** A real, separately lit garden rendered through the window at the same camera pose.
 * The window pass permits local drop refraction without blurring the entire room.
 */
export function createReadingGarden({scene,geometry,material,texture,connected=false,onPondEvent=()=>{}}){
 const group=new THREE.Group();group.name='Living garden beyond the reading window';scene.add(group);
 const owned={g:new Set(),m:new Set(),t:new Set()},instances=[];
 const time={value:0},rain={value:1},wet={value:1},dusk={value:0},gust={value:.5},direction={value:new THREE.Vector2(.8,.34)};let disposed=false,lastShadowTime=-1;
 const atmosphere={rain:1,cloud:1,wind:.5};
 const dropSimulation=createWindowDrops(),dropBodies=Array.from({length:MAX_GLASS_DROPS},()=>new THREE.Vector4(-2,-2,0,0)),dropTrails=Array.from({length:MAX_GLASS_DROPS},()=>new THREE.Vector4());dropSimulation.write(dropBodies,dropTrails);
 const stats={trees:0,treeVariants:2,shrubs:0,shadows:'wind-matched-soft-shadows',loaded:false,mode:'real-3d-window-refraction'};
 function ownG(g){owned.g.add(g);return g;}function ownM(m){owned.m.add(m);return m;}
 function mesh(g,m,p=[0,0,0],r=[0,0,0]){const o=new THREE.Mesh(ownG(g),ownM(m));o.position.set(...p);o.rotation.set(...r);o.layers.set(1);group.add(o);return o;}
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true,samples:4});target.texture.colorSpace=THREE.LinearSRGBColorSpace;target.texture.name='Real-time garden window view';
 const sky=ownM(new THREE.ShaderMaterial({depthWrite:false,fog:false,side:THREE.DoubleSide,uniforms:{uTime:time,uRain:rain,uDusk:dusk},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec2 vUv;uniform float uTime,uRain,uDusk;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 void main(){float h=smoothstep(.1,.8,vUv.y);vec3 low=mix(vec3(.54,.57,.53),vec3(.39,.46,.47),uRain);vec3 high=mix(vec3(.31,.43,.48),vec3(.26,.34,.38),uRain);
 float clouds=noise(vUv*vec2(6.,9.)+vec2(uTime*.0013,0.))*.65+noise(vUv*vec2(13.,17.)+vec2(uTime*.002,0.))*.35;
 vec3 col=mix(low,high,h)+vec3(clouds-.5)*.045;gl_FragColor=vec4(col*(1.-uDusk*.28),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));if(connected){sky.side=THREE.BackSide;mesh(new THREE.SphereGeometry(68,40,24),sky,[-10,0,-4]);}else mesh(new THREE.PlaneGeometry(140,85),sky,[-34,24,-13],[0,Math.PI/2,0]);
 const hemi=new THREE.HemisphereLight('#d7e0df','#465042',1.5);hemi.layers.set(1);group.add(hemi);
 const daylight=new THREE.DirectionalLight('#dce2d9',.85);daylight.position.set(-9,18,6);daylight.layers.set(1);daylight.target.position.set(-14,1.8,-8);group.add(daylight,daylight.target);daylight.castShadow=true;daylight.shadow.mapSize.set(2048,2048);Object.assign(daylight.shadow.camera,{left:-20,right:20,top:18,bottom:-18,near:.5,far:60});daylight.shadow.camera.layers.set(1);daylight.shadow.radius=3;daylight.shadow.blurSamples=6;daylight.shadow.normalBias=.018;daylight.shadow.bias=-.00006;daylight.shadow.autoUpdate=false;daylight.shadow.needsUpdate=true;if(connected)daylight.shadow.camera.layers.enable(0);
 const groundMaps={map:texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/materials/mud_forest-color.jpg',[12,14],true),normalMap:texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/materials/mud_forest-normal.jpg',[12,14]),roughnessMap:texture('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/materials/mud_forest-roughness.jpg',[12,14])};
 const earth=new THREE.MeshStandardMaterial({color:'#c9bea6',...groundMaps,roughness:.9,normalScale:new THREE.Vector2(.45,.45),fog:false});
 // Atmosphere starts outside the room and beyond the near garden, not at the camera.
 function addWorldPosition(shader){
  shader.vertexShader='varying vec3 vGardenWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
   vec4 gardenWorld=vec4(transformed,1.);
   #ifdef USE_INSTANCING
   gardenWorld=instanceMatrix*gardenWorld;
   #endif
   vGardenWorld=(modelMatrix*gardenWorld).xyz;`);
  shader.fragmentShader='varying vec3 vGardenWorld;\n'+shader.fragmentShader;
 }
 earth.onBeforeCompile=shader=>{addWorldPosition(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
  float gardenDepth=max(0.,-vGardenWorld.x-3.04);
  float haze=1.-exp(-max(0.,gardenDepth-12.)*.010);
  outgoingLight=mix(outgoingLight,vec3(.15,.19,.17),haze);
  #include <opaque_fragment>`);};earth.customProgramCacheKey=()=> 'reading-garden-earth-clear-v5';
 const terrain=new THREE.PlaneGeometry(48,64,64,72),tp=terrain.attributes.position;
 for(let i=0;i<tp.count;i++){const x=tp.getX(i)-27,z=-tp.getY(i)-10;tp.setZ(i,THREE.MathUtils.smoothstep(-x,8,40)*1.7+Math.sin(x*.43+z*.21)*.13+Math.cos(z*.57-x*.11)*.08);}terrain.computeVertexNormals();
 if(!connected)mesh(terrain,earth,[-27,-.12,-10],[-Math.PI/2,0,0]).receiveShadow=true;else{terrain.dispose();earth.dispose();}
 const pathMat=new THREE.MeshStandardMaterial({color:'#7d8278',roughness:.73,metalness:0,fog:false,...groundMaps,normalScale:new THREE.Vector2(.18,.18)});
 if(!connected)mesh(new THREE.PlaneGeometry(1.1,33),pathMat,[-4.3,-.014,-7],[-Math.PI/2,0,-.10]).receiveShadow=true;else pathMat.dispose();
 const pond=connected?createReadingPond({group,texture,onEvent:onPondEvent}):null;

 function windShader(shader,foliage,shrub=false){
  shader.uniforms.uGardenTime=time;shader.uniforms.uGardenGust=gust;shader.uniforms.uGardenDirection=direction;
  shader.vertexShader=gardenWindShader({foliage,shrub})+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+gardenWindDisplacement({foliage,shrub}));
 }
 function prepare(m,foliage,shrub=false){
  ownM(m);m.fog=false;m.roughness=foliage?.96:.94;m.envMapIntensity=.65;
  for(const t of Object.values(m))if(t?.isTexture){owned.t.add(t);t.anisotropy=4;}
  if(foliage){m.side=THREE.DoubleSide;m.alphaTest=.42;m.alphaToCoverage=true;m.transparent=false;m.normalScale?.set(.50,.50);}
  m.onBeforeCompile=shader=>{
   windShader(shader,foliage,shrub);addWorldPosition(shader);shader.uniforms.uGardenRain=rain;shader.uniforms.uGardenDusk=dusk;
   shader.fragmentShader='uniform float uGardenRain,uGardenDusk;\n'+shader.fragmentShader;
   if(foliage)shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
    float skylightBack=clamp(dot(-normal,normalize(mat3(viewMatrix)*vec3(0.,1.,0.)))*.5+.5,0.,1.);
    reflectedLight.indirectDiffuse+=diffuseColor.rgb*skylightBack*.075*(1.-uGardenDusk*.3);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float gardenDepth=max(0.,-vGardenWorld.x-3.04);
    float distanceHaze=1.-exp(-max(0.,gardenDepth-12.)*mix(.005,.010,uGardenRain));
    outgoingLight=mix(outgoingLight,mix(vec3(.18,.23,.19),vec3(.17,.22,.21),uGardenRain)*(1.-uGardenDusk*.28),distanceHaze);
    #include <opaque_fragment>`);
  };m.customProgramCacheKey=()=> 'reading-garden-light-v6-'+String(foliage)+'-'+String(shrub);
  const depth=ownM(new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:m.map,alphaMap:m.alphaMap,alphaTest:m.alphaTest,side:m.side}));depth.onBeforeCompile=shader=>windShader(shader,foliage,shrub);depth.customProgramCacheKey=()=> 'reading-garden-depth-v6-'+String(foliage)+'-'+String(shrub);m.userData.gardenDepth=depth;return m;
 }
 function batch(g,m,placements,name){g.setAttribute('aGardenSway',new THREE.InstancedBufferAttribute(new Float32Array(placements.length*2),2).setUsage(THREE.DynamicDrawUsage));
 const object=new THREE.InstancedMesh(ownG(g),m,placements.length),dummy=new THREE.Object3D();object.userData.placements=placements;object.name=name;object.layers.set(1);
  placements.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.scale.set(p.scale*(p.width||1),p.scale,p.scale*(p.depth||1));dummy.rotation.set(p.tilt||0,p.rotation,p.roll||0);dummy.updateMatrix();object.setMatrixAt(i,dummy.matrix);object.setColorAt(i,new THREE.Color().setRGB(p.tone||1,p.tone||1,p.tone||1));});
  object.instanceMatrix.needsUpdate=true;object.instanceColor.needsUpdate=true;object.castShadow=true;object.receiveShadow=true;object.customDepthMaterial=m.userData.gardenDepth;object.computeBoundingSphere();group.add(object);instances.push(object);return object;
 }
 function release(gltf){const mats=new Set(),textures=new Set();gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of [o.material].flat())mats.add(m);}});mats.forEach(m=>{for(const t of Object.values(m))if(t?.isTexture)textures.add(t);m.dispose();});textures.forEach(t=>{t.dispose();t.image?.close?.();});}
 const loader=new GLTFLoader();
 async function loadTree(file,layout,label){
  const gltf=await loader.loadAsync(file);
  if(disposed){release(gltf);return;}gltf.scene.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(gltf.scene,true),center=bounds.getCenter(new THREE.Vector3()),height=bounds.max.y-bounds.min.y;
  const placements=layout.map(([x,z,h,rotation],i)=>({x,z,y:-h*.055,scale:h/height,rotation,width:[1.06,.91,1.12][i],depth:[.94,1.07,.96][i],tilt:[.012,-.018,.008][i],roll:[-.012,.009,.016][i],tone:[.99,.95,1.02][i]}));
  gltf.scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);g.translate(-center.x,-bounds.min.y,-center.z);o.geometry.dispose();const leaf=/leaves/.test(o.material.name);batch(g,prepare(o.material,leaf),placements,label+(leaf?' — complete leaves':' — trunk and branches'));});
  stats.trees+=placements.length;
 }
 const treeReady=Promise.all([
  loadTree('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/garden/island-tree-complete.glb',connected?[[...SPACE.trees[0],6.4,.35],[...SPACE.trees[1],8.1,1.9],[...SPACE.trees[2],9.6,-.5],[-25,0,11,2.3],[-20,17,10,-1.1],[0,23,13,.7]]:[[-9.2,1.8,6.4,.35],[-16.5,-13.1,8.1,1.9],[-25.,-20.,9.6,-.5]],'Broad branching tree A'),
  loadTree('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading/garden/island-tree-02-complete.glb',connected?[[...SPACE.trees[3],6.7,1.2],[...SPACE.trees[4],8.9,-.8],[...SPACE.trees[5],10.8,2.6],[-30,10,12,.9],[14,4,13,-1.7],[-14,-18,12,2.7]]:[[-11.8,-7.5,6.7,1.2],[-17.5,-3.8,8.9,-.8],[-25.4,-12.5,10.8,2.6]],'Forked branching tree B')
 ]);
 const shrubsReady=loader.loadAsync('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/models/environment-v5/runtime/shrub_03.glb').then(gltf=>{
  if(disposed){release(gltf);return;}gltf.scene.updateMatrixWorld(true);let n=0;const prepared=new Set();
  gltf.scene.traverse(o=>{if(!o.isMesh)return;const bounds=new THREE.Box3().setFromObject(o,true),center=bounds.getCenter(new THREE.Vector3()),height=bounds.max.y-bounds.min.y;
   const g=o.geometry.clone().applyMatrix4(o.matrixWorld);g.translate(-center.x,-bounds.min.y,-center.z);o.geometry.dispose();
   const placements=[];for(let i=0;i<6;i++){const h=.9+((i*3+n)%5)*.16;placements.push({x:-5.7-i*1.8-weatherNoise(i*3.1,n+8)*1.2,z:-9+n*3.1+(weatherNoise(i*2.3,n+41)-.5)*2.5,y:-.06,scale:h/height,rotation:i*2.3+n});}
   for(let i=0;i<3;i++)placements.push({x:-22-i*.8,z:-18+n*4.8+i*1.2,y:.50,scale:(1.7+(i%2)*.4)/height,rotation:i*1.6+n});
   if(connected)placements.forEach((p,i)=>{const a=.7+i*.62+n*.19;p.x=SPACE.pond.x+Math.cos(a)*7.4;p.z=SPACE.pond.z-Math.abs(Math.sin(a))*6.0-1.1;p.y=.10;});
   const m=o.material;if(!prepared.has(m)){prepare(m,true,true);prepared.add(m);}batch(g,m,placements,'Layered broadleaf garden shrubs');stats.shrubs+=placements.length;n++;
  });
 });

 // Rain is a spatial volume. Per-drop speed/length differ; no lines cross the room.
 const positions=[],seeds=[],ends=[];let randomSeed=4817;
 function random(){randomSeed=(Math.imul(randomSeed,1664525)+1013904223)>>>0;return randomSeed/4294967296;}
 for(let i=0;i<1600;i++){let x=-3.35-random()*26;const y=random()*13,z=-27+random()*39,seed=random();if(connected&&z>3.9)x=-22+random()*26;for(let end=0;end<2;end++){positions.push(x,y,z);seeds.push(seed);ends.push(end);}}
 const rainGeo=ownG(new THREE.BufferGeometry());rainGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));rainGeo.setAttribute('aSeed',new THREE.Float32BufferAttribute(seeds,1));rainGeo.setAttribute('aEnd',new THREE.Float32BufferAttribute(ends,1));
 const rainMat=ownM(new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:false,uniforms:{uTime:time,uRain:rain,uGust:gust,uDirection:direction},vertexShader:`uniform float uTime,uGust;uniform vec2 uDirection;attribute float aSeed,aEnd;varying float vAlpha;
 float rainHash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
 void main(){vec3 p=position;float speed=2.6+aSeed*2.4;float travel=position.y+uTime*speed,cycle=floor(travel/13.);p.y=13.-mod(travel,13.);float len=.06+aSeed*.11;p.y-=aEnd*len;
 p.x=p.x+(rainHash(aSeed*91.+cycle*3.7)-.5)*.55+uDirection.x*(13.-p.y)*uGust*.013;p.z+=(rainHash(aSeed*73.+cycle*7.1)-.5)*1.6+uDirection.y*(13.-p.y)*uGust*.013;
 if(p.z<3.6&&p.x> -3.22)p.x=-3.22;
 vec4 mv=modelViewMatrix*vec4(p,1.);vAlpha=mix(.025,.11,aSeed)*exp(-max(0.,length(mv.xyz)-5.)*.042);float sheltered=step(-7.98,p.x)*step(p.x,-3.55)*step(5.17,p.z)*step(p.z,8.55)*step(p.y,2.9);vAlpha*=1.-sheltered;gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uRain;varying float vAlpha;void main(){gl_FragColor=vec4(.72,.80,.81,vAlpha*uRain);}`}));
 const airRain=new THREE.LineSegments(rainGeo,rainMat);airRain.layers.set(1);airRain.frustumCulled=false;airRain.renderOrder=2;group.add(airRain);

 const glassMaterial=material(new THREE.ShaderMaterial({side:connected?THREE.FrontSide:THREE.DoubleSide,uniforms:{uGarden:{value:target.texture},uGardenTexel:{value:new THREE.Vector2(1,1)},uDrops:{value:dropBodies},uTrails:{value:dropTrails},uTime:time,uRain:rain,uWet:wet,uLamp:{value:.55}},
  vertexShader:'varying vec2 vUv;varying vec4 vClip;void main(){vUv=uv;vClip=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=vClip;}',
  fragmentShader:`varying vec2 vUv;varying vec4 vClip;uniform sampler2D uGarden;uniform vec2 uGardenTexel;uniform float uWet,uLamp;
  uniform vec4 uDrops[${MAX_GLASS_DROPS}];uniform vec4 uTrails[${MAX_GLASS_DROPS}];
  void main(){vec2 screen=vClip.xy/vClip.w*.5+.5;vec2 dropNormal=vec2(0.);float trailLight=0.;
   for(int i=0;i<${MAX_GLASS_DROPS};i++){
    vec4 drop=uDrops[i],flow=uTrails[i];if(drop.z<=0.)continue;
    vec2 delta=vUv-drop.xy;
    if(abs(delta.x)>drop.z*1.1||delta.y< -drop.w*1.1||delta.y>max(drop.w,flow.x))continue;
    vec2 local=delta/drop.zw;float radius=length(local);
    if(radius<1.){float mask=1.-smoothstep(.76,1.,radius);dropNormal+=local*sqrt(max(0.,1.-radius*radius))*mask;}
    if(flow.x>.001&&delta.y>0.){float along=clamp(delta.y/flow.x,0.,1.);float thin=(1.-smoothstep(drop.z*.10,drop.z*.36,abs(delta.x)))*(1.-along);dropNormal.x+=sign(delta.x)*thin*.09;trailLight+=thin*.002*flow.w;}
   }
   vec2 bend=dropNormal*uGardenTexel*2.2*uWet;
   vec3 outside=texture2D(uGarden,clamp(screen+bend,vec2(.001),vec2(.999))).rgb;
   vec3 col=outside*vec3(.995,1.,.997);
   float rim=max(0.,dropNormal.y-dropNormal.x*.4)*.012*uWet;
   col+=vec3(.72,.80,.82)*(rim+trailLight*uWet);
   col+=vec3(.95,.74,.43)*pow(max(0.,-dropNormal.y*.7+dropNormal.x*.5),3.)*.018*uLamp*uWet;
   gl_FragColor=vec4(col,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`}));
 const pane=new THREE.Mesh(geometry(new THREE.PlaneGeometry(2.55,2.5)),glassMaterial);pane.name='Clear rain glass — live garden refraction';pane.position.set(-3.04,2.02,-.575);pane.rotation.y=Math.PI/2;scene.add(pane);
 const ready=Promise.all([treeReady,shrubsReady,pond?.ready]).then(()=>{stats.loaded=true;return stats;});
 return{group,ready,stats,pond,getMotionState:()=>dropSimulation.snapshot(),
  resize(width,height,pixelRatio){const w=Math.max(1,Math.min(2048,Math.round(width*pixelRatio))),h=Math.max(1,Math.min(2048,Math.round(height*pixelRatio)));target.setSize(w,h);glassMaterial.uniforms.uGardenTexel.value.set(1/w,1/h);},
  update(t,{raining=true,night=0,lamp=.55,dt=.016,motion=true,randomCallsAllowed=false}={}){time.value=t;rain.value=THREE.MathUtils.damp(rain.value,raining?1:0,1.4,dt);wet.value=THREE.MathUtils.damp(wet.value,raining?1:0,.12,dt);dusk.value=night;
   const weather=gardenWeatherAt(t);for(const object of instances){const attr=object.geometry.attributes.aGardenSway;object.userData.placements.forEach((p,i)=>{const bend=instanceBreezeAt(t,p.x,p.z);attr.setXY(i,bend[0],bend[1]);});attr.needsUpdate=true;}gust.value=weather.wind;direction.value.set(weather.directionX,weather.directionZ);dropSimulation.step(t,rain.value);dropSimulation.write(dropBodies,dropTrails);glassMaterial.uniforms.uLamp.value=lamp;
   atmosphere.rain=rain.value;atmosphere.cloud=weather.cloud;atmosphere.wind=weather.wind;hemi.intensity=(1.55-rain.value*.15)*(1-night*.25)*weather.cloud;daylight.intensity=(1.4-rain.value*.45)*(1-night*.4)*weather.cloud;
   pond?.update(t,{wind:weather.wind,dt,motion,randomCallsAllowed});if(lastShadowTime<0||t-lastShadowTime>=.12){daylight.shadow.needsUpdate=true;lastShadowTime=t;}return atmosphere;
  },
  render(renderer,camera){if(disposed||connected&&camera.position.x< -3.0)return;const previous=renderer.getRenderTarget(),mask=camera.layers.mask,tone=renderer.toneMapping,shadow=renderer.shadowMap.autoUpdate;
   try{camera.layers.set(1);renderer.toneMapping=THREE.NoToneMapping;renderer.shadowMap.autoUpdate=true;renderer.setRenderTarget(target);renderer.clear();renderer.render(scene,camera);}
   finally{renderer.setRenderTarget(previous);camera.layers.mask=mask;renderer.toneMapping=tone;renderer.shadowMap.autoUpdate=shadow;}
  },
  dispose(){disposed=true;pond?.dispose();target.dispose();daylight.shadow.dispose();instances.forEach(o=>o.dispose());owned.g.forEach(g=>g.dispose());owned.m.forEach(m=>m.dispose());owned.t.forEach(t=>{t.dispose();t.image?.close?.();});scene.remove(group,pane);}
 };
}
