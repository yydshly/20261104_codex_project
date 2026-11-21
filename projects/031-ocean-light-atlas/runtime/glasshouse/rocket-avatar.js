import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createFootPlacement } from './foot-placement.js';
import { supportHeight } from './walk-surface.js';
import { createSeatedPose } from './seated-pose.js';

const LOOPING=new Set(['Idle','Walk']);
export async function createRocketAvatar({onChange=()=>{},assetBase='./assets/rocket-guide/',manifestFile='manifest.json',characterId='rocket10',description='成品角色 · 红色运动夹克',downloadName='seaside-rocketbox-guide.glb'}={}){
  const base=new URL(assetBase,import.meta.url);
  const manifestResponse=await fetch(new URL(manifestFile,base));
  if(!manifestResponse.ok)throw new Error(`Character manifest ${manifestResponse.status}`);
  const manifest=await manifestResponse.json();
  const response=await fetch(new URL(manifest.file,base));
  if(!response.ok)throw new Error(`Character asset ${response.status}`);
  const bytes=await response.arrayBuffer();
  const gltf=await new GLTFLoader().parseAsync(bytes,base.href);
  const root=new THREE.Group();root.name=manifest.character;
  const model=gltf.scene;root.add(model);
  model.traverse(o=>{
    if(!o.isMesh)return;
    if(new URLSearchParams(location.search).get('materials')==='ids'){
      const colours={'Original head albedo':'#ff2020','Connected orbital skin':'#20ff20','Warm sclera':'#2020ff','Brown iris':'#ffff20','Pupils':'#20ffff','Fine bronze spectacles':'#ff20ff'};
      const identify=m=>new THREE.MeshBasicMaterial({color:colours[m.name]||'#777777',side:THREE.DoubleSide});
      o.material=Array.isArray(o.material)?o.material.map(identify):identify(o.material);
    }
    o.castShadow=true;o.receiveShadow=true;
    if(o.isSkinnedMesh)o.frustumCulled=false;
    for(const material of Array.isArray(o.material)?o.material:[o.material]){
      if(new URLSearchParams(location.search).get('skin')==='clay'&&['Original head albedo','Connected orbital skin'].includes(material.name)){
        material.map=null;material.normalMap=null;material.vertexColors=false;material.color.set('#c99b83');material.needsUpdate=true;
      }
      for(const key of ['map','normalMap'])if(material[key])material[key].anisotropy=4;
      if(characterId==='personal0597'&&material.name==='Material.001'){
        // The generated asset's doubled specular colour turns skin and cloth
        // glossy under the sunset. Keep its maps, use dielectric response.
        material.metalness=.06;
        if(material.specularColor)material.specularColor.setRGB(1,1,1);
        if('specularIntensity' in material)material.specularIntensity=.72;
        material.normalScale?.set(.65,.65);
      }
    }
  });
  const mixer=new THREE.AnimationMixer(model),actions=new Map();
  for(const clip of gltf.animations){
    const name=clip.name.split('|').pop();
    actions.set(name,mixer.clipAction(clip));
  }
  for(const name of ['Idle','Walk','Wave','Point','LookAround'])if(!actions.has(name))throw new Error(`Missing finished character animation: ${name}`);
  let actionName='',finished;
  const bone=name=>model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(`Bip01 ${name}`));
  const head=bone('Head'),leftEye=bone('LEye'),rightEye=bone('REye');
  if(!head)throw new Error('Finished character head joint missing');
  mixer.addEventListener('finished',event=>{if(event.action===actions.get(actionName))finished?.(actionName);});
  function play(name,{fade=.28}={}){
    const next=actions.get(name);if(!next)throw new Error(`Unsupported finished character action ${name}`);
    const previous=actions.get(actionName);
    if(previous===next&&next.isRunning())return;
    actionName=name;
    next.reset();next.enabled=true;next.clampWhenFinished=!LOOPING.has(name);
    next.setLoop(LOOPING.has(name)?THREE.LoopRepeat:THREE.LoopOnce,LOOPING.has(name)?Infinity:1);
    next.setEffectiveWeight(1);next.setEffectiveTimeScale(1);next.play();
    if(previous&&previous!==next){previous.fadeOut(fade);next.fadeIn(fade);}
    onChange({outfit:characterId,action:name,description,loading:false});
  }
  play('Idle',{fade:0});mixer.update(0);root.updateMatrixWorld(true);
  const skinned=[];model.traverse(o=>{if(o.isSkinnedMesh)skinned.push(o);});
  const feet=createFootPlacement({root,model,bone,meshes:skinned});
  const seated=characterId==='personal0597'?createSeatedPose({root,bone,meshes:skinned,handFrames:manifest.hands?.records}):null;
  // AnimationMixer skips unchanged tracks at dt=0. Restore after a seat overlay
  // so pelvis offsets cannot accumulate. Normal walking keeps the established
  // stair contact solver's evaluation order and planted-leg continuity.
  const animatedPose=[];model.traverse(joint=>{if(joint.isBone)animatedPose.push({joint,position:joint.position.clone(),quaternion:joint.quaternion.clone(),scale:joint.scale.clone()});});
  let seatModified=false;
  const samplePoint=name=>{const joint=bone(name);return joint?joint.getWorldPosition(new THREE.Vector3()).toArray().map(v=>Number(v.toFixed(4))):null;};
  return {
    root,manifest,play,supportedActions:new Set(actions.keys()),
    get action(){return actionName;},get outfit(){return characterId;},
    update(dt){
      model.position.y=0;
      if(seatModified)for(const p of animatedPose){p.joint.position.copy(p.position);p.joint.quaternion.copy(p.quaternion);p.joint.scale.copy(p.scale);}
      mixer.update(dt);
      for(const p of animatedPose){p.position.copy(p.joint.position);p.quaternion.copy(p.joint.quaternion);p.scale.copy(p.joint.scale);}
    },
    placeFeet(options){const seatFeet=seated?.apply(options.seatPose);seatModified=!!options.seatPose;feet.update({...options,seatFeet});},
    get supportsSeating(){return !!seated;},
    get seatedSample(){return seated?.sample;},
    constrainStep(from){return feet.constrainMotion(from);},
    footContactSample(){return feet.sample();},
    contactFeet(){
      const contacts=feet.sample().feet;
      return ['L','R'].map((side,i)=>{
        const ankle=bone(`${side} Foot`).getWorldPosition(new THREE.Vector3()),toe=bone(`${side} Toe0`).getWorldPosition(new THREE.Vector3());
        const axis=new THREE.Vector2(toe.x-ankle.x,toe.z-ankle.z).normalize(),center=ankle.clone().lerp(toe,.42);
        center.y=supportHeight(center.x,center.z)+contacts[i].clearance;
        return {center,axis};
      });
    },
    onFinished(callback){finished=callback;},
    setWalkSpeed(speed,backward=false,strideLength=null){if(actionName==='Walk'){const action=actions.get('Walk');action.setEffectiveTimeScale((backward?-1:1)*(strideLength?speed*action.getClip().duration/strideLength:speed/manifest.walkSpeed));}},
    async setOutfit(id){if(id!==characterId)throw new Error('This version uses one finished character');},
    getEyePosition(target=new THREE.Vector3()){
      root.updateMatrixWorld(true);
      if(leftEye&&rightEye){leftEye.getWorldPosition(target);target.add(rightEye.getWorldPosition(new THREE.Vector3())).multiplyScalar(.5);}
      else {head.getWorldPosition(target);target.y+=.09;}
      return target.addScaledVector(new THREE.Vector3(0,0,1).applyQuaternion(root.quaternion),.14);
    },
    motionSample(){return {time:Number(actions.get(actionName).time.toFixed(3)),hand:samplePoint('R Hand'),headRotation:head.quaternion.toArray().map(v=>Number(v.toFixed(5))),leftFoot:samplePoint('L Foot'),rightFoot:samplePoint('R Foot')};},
    download(){
      const url=URL.createObjectURL(new Blob([bytes],{type:'model/gltf-binary'})),link=document.createElement('a');
      link.href=url;link.download=downloadName;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
      return {bytes:bytes.byteLength,animations:[...actions.keys()],outfit:characterId};
    },
    meshes(){const result=[];model.traverse(o=>{if(o.isMesh)result.push(o);});return result;},
  };
}
