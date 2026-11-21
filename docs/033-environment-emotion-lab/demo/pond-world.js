import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { createEnvironment3D } from './pond-environment-v5.js';
import { createDuck3D } from './pond-duck-v5.js';
import { createPondWater } from './pond-water-3d.js';
import { createPondAudio } from './pond-audio.js';
import { createPondLighting } from './pond-lighting.js';

/** Real-time scene. Geometry, water, behaviour and audio share the same simulation clock. */
export function createPondWorld(canvas, {onInteraction = () => {}, onAudioState = () => {}} = {}) {
  canvas.dataset.ready='loading';
  canvas.parentElement.dataset.loading='true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = {mode:'pond',phase:'dusk',motion:!reduced.matches,details:true,volume:.28,wind:.3,fireflies:true,immersive:false,randomDuckCalls:true};
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b9c6ad');
  scene.fog = new THREE.FogExp2('#7c8b85', .023);
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 130);
  const home = new THREE.Vector3(-1.7,2.25,6.3), target = new THREE.Vector3(.25,.28,-1.35);
  let portraitFraming=false;
  camera.position.copy(home);
  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(target);
  controls.enableDamping = true; controls.dampingFactor = .065;
  controls.enablePan = false; controls.enableZoom = false;
  controls.minDistance = 3.5; controls.maxDistance = 11;
  controls.minPolarAngle = 1.0; controls.maxPolarAngle = Math.PI * .46;
  controls.minAzimuthAngle = -.55; controls.maxAzimuthAngle = 1.15;
  controls.rotateSpeed = .45; controls.zoomSpeed = .65;
  controls.update();

  const hemisphere = new THREE.HemisphereLight('#cad7da','#2d3d25',1.25); scene.add(hemisphere);
  const sun = new THREE.DirectionalLight('#ffdc9c',4.2);
  sun.position.set(-7,10,4); sun.castShadow=true;
  const lightDirection=sun.position.clone().normalize();
  sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:1,far:55});
  sun.shadow.bias=-.0003; sun.shadow.normalBias=.035; sun.shadow.radius=3;
  scene.add(sun);
  const rim = new THREE.DirectionalLight('#becfef',1.0); rim.position.set(7,6,-8); scene.add(rim);
  const environment = createEnvironment3D(); scene.add(environment.group);
  const lighting=createPondLighting(renderer,scene,camera,canvas);
  const water = createPondWater(); scene.add(water.mesh);
  const audio = createPondAudio({onState:onAudioState});
  let clock=0, realClock=0, night=0, wind=.3, simulationWind=.3, last=0, raf=0, disposed=false, visible=true, lastStats=0, assetsReady=false;
  let measuredFrames=0, measuredTime=0;
  const sounds = {quack:'duck',splash:'splash'};
  let quacks=0;
  const projected = new THREE.Vector3();
  function duckEvent(event) {
    canvas.dataset.lastEvent=event.type;
    const p = projected.set(event.x || 0,.2,event.z || 0).project(camera);
    if (sounds[event.type]) canvas.dataset.lastSoundPlayed=String(audio.trigger(sounds[event.type], {x:(p.x+1)/2,strength:event.strength || .6}));
    if(event.type==='quack') canvas.dataset.quacks=String(++quacks);
    if(state.details&&event.type==='wake'){
      const d=duck.getState();
      if(water.wake)water.wake(d.x,d.z,d.heading,d.speed);else water.ripple(event.x,event.z,event.strength || .3);
    }else if(state.details&&event.type==='splash')water.ripple(event.x,event.z,event.strength || .3);
    if (event.type==='arrive') onInteraction({title:'它游过来了',detail:'轻轻停在这里，等下一次回应。'});
  }
  const duck = createDuck3D({onEvent:duckEvent});duck.setRandomCalls(state.randomDuckCalls); scene.add(duck.object3D);
  if(duck.setSurfaceSampler&&water.sampleHeight)duck.setSurfaceSampler(water.sampleHeight);
  Promise.all([environment.ready,duck.ready,lighting.ready]).then(()=>{
    if(disposed)return;
    assetsReady=true;canvas.dataset.ready='pond-3d';canvas.dataset.modelVersion='authored-v5';delete canvas.parentElement.dataset.loading;wake();
  }).catch(error=>{
    if(disposed)return;
    canvas.dataset.ready='asset-error';canvas.parentElement.dataset.loading='error';
    console.error('Pond asset loading failed',error);
    onInteraction({title:'场景素材未能载入',detail:'刷新页面后重试。'});
  });

  // Small autonomous light points inhabit the actual world and participate in camera parallax.
  const pointCount=24, positions=new Float32Array(pointCount*3), seeds=[];
  for(let i=0;i<pointCount;i++) {
    const angle=i*2.39996;
    seeds.push({x:Math.cos(angle)*(4+(i%5)*.44),z:Math.sin(angle)*(2.8+(i%4)*.38),y:.45+(i%8)*.15,phase:i*1.71});
  }
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const pointsMaterial = new THREE.ShaderMaterial({
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
    uniforms:{uTime:{value:0},uNight:{value:0}},
    vertexShader:`uniform float uTime; uniform float uNight; varying float glow;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;
      glow=.35+.65*pow(.5+.5*sin(uTime*1.3+position.x*4.+position.z),3.);
      gl_PointSize=clamp((20.+35.*uNight)/-p.z,1.8,6.);}`,
    fragmentShader:`varying float glow;uniform float uNight;void main(){float r=length(gl_PointCoord-.5)*2.;
      float a=pow(max(0.,1.-r),1.8)*glow*smoothstep(.35,.9,uNight);gl_FragColor=vec4(1.,.86,.37,a);}`,
  });
  const fireflies = new THREE.Points(pointsGeometry,pointsMaterial); scene.add(fireflies);

  const duskSky=new THREE.Color('#b2c2ab'), nightSky=new THREE.Color('#0d1e32');
  const duskFog=new THREE.Color('#7c8b85'), nightFog=new THREE.Color('#142837');
  const duskSun=new THREE.Color('#fff0d8'), nightSun=new THREE.Color('#a5c7f2');
  const duskHemi=new THREE.Color('#e9f1d7'), nightHemi=new THREE.Color('#799ac2');
  let gustUntil=0;
  function update(dt) {
    realClock+=dt;
    const moving=assetsReady&&state.motion&&!reduced.matches;
    if(moving) clock+=dt;
    const targetNight=state.phase==='night'?1:0;
    night = reduced.matches?targetNight:THREE.MathUtils.damp(night,targetNight,1.4,dt);
    const gust=realClock<gustUntil?Math.sin(Math.PI*(1-(gustUntil-realClock)/5))*.55:0;
    wind=THREE.MathUtils.damp(wind,Math.min(1,state.wind+Math.max(0,gust)),2,dt);
    scene.background.copy(duskSky).lerp(nightSky,night); scene.fog.color.copy(duskFog).lerp(nightFog,night);
    sun.color.copy(duskSun).lerp(nightSun,night); sun.intensity=THREE.MathUtils.lerp(3.1,.65,night);
    hemisphere.color.copy(duskHemi).lerp(nightHemi,night); hemisphere.intensity=THREE.MathUtils.lerp(1.25,.32,night);
    rim.intensity=THREE.MathUtils.lerp(.45,.55,night);
    lighting.update(night,lightDirection);
    // Freeze the deformation strength with its clock, so pausing cannot snap
    // plants upright or change the height of the water under the duck.
    if(moving)simulationWind=THREE.MathUtils.damp(simulationWind,wind,3,dt);
    environment.update(clock,{wind:simulationWind,night});
    water.update(realClock,{wind:simulationWind,night,motion:moving});
    water.mesh.material.uniforms.sunDirection.value.copy(lightDirection);
    water.mesh.material.uniforms.sunColor.value.copy(sun.color).multiplyScalar(sun.intensity*.35);
    const sound=audio.getState();duck.update(dt,{motion:moving,wind:simulationWind,randomCallsAllowed:assetsReady&&sound.enabled&&sound.ready&&!sound.paused&&state.volume>0});
    if(water.setSwimmer)water.setSwimmer(duck.getState());
    fireflies.visible=state.fireflies&&state.details;
    pointsMaterial.uniforms.uTime.value=clock;pointsMaterial.uniforms.uNight.value=night;
    seeds.forEach((s,i)=>{positions[i*3]=s.x+Math.sin(clock*.35+s.phase)*.28;positions[i*3+1]=s.y+Math.sin(clock*.5+s.phase)*.17;positions[i*3+2]=s.z+Math.cos(clock*.29+s.phase)*.25;});
    pointsGeometry.attributes.position.needsUpdate=true;
    if(realClock-lastStats>.5){
      audio.setOptions({phase:state.phase,wind,volume:state.volume});lastStats=realClock;
      canvas.dataset.behavior=duck.getState().behavior;
      canvas.dataset.duckPhase=duck.getState().phase;
      canvas.dataset.duckPosition=`${duck.getState().x.toFixed(3)},${duck.getState().z.toFixed(3)}`;
      canvas.dataset.wind=wind.toFixed(3);
      canvas.dataset.audioReady=String(audio.getState().ready);
      canvas.dataset.renderCalls=String(renderer.info.render.calls);
      canvas.dataset.renderTriangles=String(renderer.info.render.triangles);
      canvas.dataset.fps=measuredTime>0?(measuredFrames/measuredTime).toFixed(1):'0';
      measuredFrames=0;measuredTime=0;
      canvas.dataset.simulationTime=clock.toFixed(2);
    }
    controls.update();
  }
  function frame(now) {
    raf=0;if(disposed||document.hidden||!visible){last=0;return;}
    const elapsed=last?(now-last)/1000:1/60;
    const dt=Math.min(elapsed,.05);last=now;
    measuredFrames++;measuredTime+=elapsed;
    update(dt);lighting.render(dt);
    raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf&&!disposed&&!document.hidden&&visible){last=0;raf=requestAnimationFrame(frame);}}
  function resize(){
    const box=canvas.getBoundingClientRect();renderer.setSize(Math.max(1,box.width),Math.max(1,box.height),false);
    camera.aspect=box.width/Math.max(1,box.height);
    const portrait=camera.aspect<.75;
    if(portrait!==portraitFraming){
      portraitFraming=portrait;
      home.set(...(portrait?[0,1.6,7]:[-1.7,2.25,6.3]));
      target.set(...(portrait?[0,.1,0]:[.25,.28,-1.35]));
      camera.position.copy(home);controls.target.copy(target);controls.update();
    }
    camera.fov=Math.min(82,THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(43/2))*Math.max(1,1.35/camera.aspect))));
    camera.updateProjectionMatrix();wake();
    lighting.resize(Math.max(1,box.width),Math.max(1,box.height));
  }

  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let down=null;
  function pointerDown(event){down={x:event.clientX,y:event.clientY};}
  function pointerUp(event){
    if(!down||Math.hypot(event.clientX-down.x,event.clientY-down.y)>7){down=null;return;}down=null;
    const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const animal=raycaster.intersectObject(duck.object3D,true);
    if(animal.length){trigger('duck');return;}
    const hit=raycaster.intersectObject(water.mesh,false)[0];
    if(hit){trigger('water',{x:hit.point.x,z:hit.point.z});}
  }
  function key(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();trigger('duck');}if(event.key.toLowerCase()==='r')trigger('reset');}
  function trigger(action='duck',point=null) {
    if(!assetsReady)return;
    canvas.dataset.interaction=action;
    if(action==='lamp'){
      state.fireflies=!state.fireflies;
      onInteraction({title:state.fireflies?'萤火已开启':'萤火隐入林间',detail:'入夜后，微光会在池塘周围各自起落。'});
    }else if(action==='wind'){
      gustUntil=realClock+5;audio.trigger('wind',{strength:.7});
      onInteraction({title:'一阵风经过',detail:'叶片、水面与风声一起变化，随后慢慢平静。'});
    }else if(action==='reset'){
      camera.position.copy(home);controls.target.copy(target);controls.update();
      onInteraction({title:'回到池塘边',detail:'拖动画面可环顾，进入场景后可缩放。'});
    }else{
      const duckState=duck.getState();
      const destination=point||{x:duckState.x*.4,z:2.1};
      if(action==='water'){
        water.ripple(destination.x,destination.z,.85);
        const p=projected.set(destination.x,.1,destination.z).project(camera);
        audio.trigger('splash',{x:(p.x+1)/2,strength:.6});
      }
      duck.interact(action==='water'?'water':action==='feed'?'feed':'call',destination);
      onInteraction({title:action==='water'?'水面荡开了':'鸭子听到了你',detail:action==='water'?'波纹从落点展开，它转身游向那里。':'先转头回应，再慢慢游近。'});
    }
    wake();
  }
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;audio.pause().catch(()=>{});}else{wake();audio.resume().catch(()=>{});}}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)wake();else{cancelAnimationFrame(raf);raf=0;}});intersection.observe(canvas);
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('keydown',key);
  document.addEventListener('visibilitychange',visibility);
  canvas.setAttribute('aria-label','实时三维池塘。拖动环顾，点鸭子得到回应，点水面让它游近。按回车呼唤，R 恢复视角。');
  resize();
  return {
    trigger,
    setSound:enabled=>audio.setEnabled(enabled),
    setOptions(options){Object.assign(state,options);if(options.randomDuckCalls!==undefined)duck.setRandomCalls(state.randomDuckCalls);controls.enableZoom=state.immersive;audio.setOptions({phase:state.phase,wind:state.wind,volume:state.volume});wake();},
    getState:()=>({...state,sound:audio.getState().enabled,duck:duck.getState(),engine:'three-webgl',time:clock}),
    dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();controls.dispose();audio.dispose();duck.dispose();environment.dispose();water.dispose();lighting.dispose();sun.shadow.dispose();pointsGeometry.dispose();pointsMaterial.dispose();renderer.dispose();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);},
  };
}
