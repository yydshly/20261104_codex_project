import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {SPACE} from './reading-space.js';

/** Finished, author-rigged Rocketbox avatar and mocap; no private likeness. */
export function createReadingCompanion({scene,geometry,material,interactive,onChange=()=>{},loadAsset}={}){
 const root=new THREE.Group();root.name='Courtyard companion';root.position.set(-6.5,.13,5.65);root.rotation.y=-1.3;root.userData.action='greet';scene.add(root);interactive.push(root);
 let disposed=false,mixer,model,actions={},current='',clock=0,nextLook=14,lookUntil=0,greeted=false,near=false,responses=0;const textures=new Set();
 function play(name){if(!actions[name])return false;const old=actions[current],next=actions[name];if(old===next&&next.isRunning())return false;current=name;next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1);next.clampWhenFinished=name!=='Idle';next.setLoop(name==='Idle'?THREE.LoopRepeat:THREE.LoopOnce,name==='Idle'?Infinity:1);next.play();if(old){old.fadeOut(.38);next.fadeIn(.38);}onChange({action:current,responses,near});return true;}
 function release(gltf){gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of [o.material].flat()){for(const t of Object.values(m))if(t?.isTexture)textures.add(t);m.dispose();}}});textures.forEach(t=>t.dispose());}
 const ready=(loadAsset?loadAsset():new GLTFLoader().loadAsync('./assets/reading/companion/companion.glb')).then(gltf=>{if(disposed){release(gltf);return;}model=gltf.scene;root.add(model);model.traverse(o=>{o.layers.set(1);if(o.isMesh){o.castShadow=o.receiveShadow=true;o.frustumCulled=false;geometry(o.geometry);for(const m of [o.material].flat()){material(m);m.fog=false;m.roughness=Math.max(m.roughness,.72);m.metalness=0;for(const t of Object.values(m))if(t?.isTexture){t.anisotropy=4;textures.add(t);}}}});mixer=new THREE.AnimationMixer(model);for(const clip of gltf.animations)actions[clip.name.split('|').pop()]=mixer.clipAction(clip);for(const name of ['Idle','Wave','LookAround'])if(!actions[name])throw Error('Companion motion missing: '+name);mixer.addEventListener('finished',event=>{if(event.action===actions[current])play('Idle');});play('Idle');mixer.update(0);root.updateMatrixWorld(true);});
 return{root,ready,greet(){if(!mixer||current==='Wave')return false;lookUntil=0;responses++;nextLook=clock+16;return play('Wave');},look(){if(!mixer||current==='LookAround')return false;lookUntil=clock+20;responses++;nextLook=clock+20;return play('LookAround');},
  update(dt,listener,{motion=true}={}){if(!mixer||disposed)return;clock+=dt;const distance=Math.hypot(listener.x-root.position.x,listener.z-root.position.z);near=distance<3.7;
   if(near&&!greeted){greeted=true;responses++;play('Wave');}if(distance>7)greeted=false;
   const target=lookUntil>clock?Math.atan2(SPACE.pond.x-root.position.x,SPACE.pond.z-root.position.z):near?Math.atan2(listener.x-root.position.x,listener.z-root.position.z):-1.3;
   const turn=Math.atan2(Math.sin(target-root.rotation.y),Math.cos(target-root.rotation.y));root.rotation.y+=THREE.MathUtils.clamp(turn*(1-Math.exp(-dt*1.9)),-dt*.42,dt*.42);
   if(motion&&current==='Idle'&&clock>nextLook){play('LookAround');nextLook=clock+18+Math.random()*20;}mixer.update(motion||current!=='Idle'?dt:0);
  },getState:()=>({ready:Boolean(mixer),action:current,responses,near}),dispose(){disposed=true;mixer?.stopAllAction();if(model)mixer?.uncacheRoot(model);textures.forEach(t=>t.dispose());scene.remove(root);}};
}
