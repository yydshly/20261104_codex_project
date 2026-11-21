import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const LOOPING=new Set(['Idle','Walk','SitIdle']);
export const OUTFITS=[{id:'hoodie',name:'深蓝卫衣'},{id:'linen',name:'海边亚麻衫'},{id:'knit',name:'暮色针织衫'}];

export async function createGuideAvatar({assetBase=new URL('./assets/guide/',import.meta.url),onChange=()=>{}}={}){
  const root=new THREE.Group();root.name='SeasideGuide';
  const manifest=await (await fetch(new URL('manifest.json',assetBase))).json();
  const loader=new GLTFLoader(),cache=new Map();
  let current,actionName='Idle',requestId=0,finishedCallback;
  async function load(id){
    if(cache.has(id))return cache.get(id);
    const task=(async()=>{
      const bytes=await (await fetch(new URL(`guide-${id}.glb`,assetBase))).arrayBuffer();
      const gltf=await loader.parseAsync(bytes,assetBase.href);
      const model=gltf.scene;model.name=`GuideOutfit_${id}`;model.visible=false;
      model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.isSkinnedMesh)o.frustumCulled=false;}});
      const mixer=new THREE.AnimationMixer(model),actions=new Map();
      for(const clip of gltf.animations){const name=clip.name.split('|').pop();actions.set(name,mixer.clipAction(clip));}
      const data={id,bytes,model,mixer,actions,head:model.getObjectByName('Head')};
      mixer.addEventListener('finished',e=>{if(current===data&&e.action===data.actions.get(actionName))finishedCallback?.(actionName);});
      root.add(model);return data;
    })();cache.set(id,task);return task;
  }
  function play(name,{fade=.3,phase=0}={}){
    if(!current)return;
    const next=current.actions.get(name);if(!next)throw new Error(`Missing guide animation ${name}`);
    const previous=current.actions.get(actionName);actionName=name;
    if(previous===next&&next.isRunning())return;
    next.reset();next.enabled=true;next.clampWhenFinished=!LOOPING.has(name);
    next.setLoop(LOOPING.has(name)?THREE.LoopRepeat:THREE.LoopOnce,LOOPING.has(name)?Infinity:1);
    next.time=next.getClip().duration*phase;next.setEffectiveTimeScale(1);next.setEffectiveWeight(1);next.play();
    if(previous&&previous!==next){previous.fadeOut(fade);next.fadeIn(fade);}
    onChange({outfit:current.id,action:actionName});
  }
  async function setOutfit(id){
    const ticket=++requestId;
    onChange({loading:true,outfit:id,action:actionName});
    const data=await load(id);if(ticket!==requestId)return;
    const phase=current?current.actions.get(actionName).time/current.actions.get(actionName).getClip().duration:0;
    if(current)current.model.visible=false;
    current=data;current.model.visible=true;
    for(const a of current.actions.values())a.stop();
    play(actionName,{fade:0,phase:Math.min(.99,phase)});current.mixer.update(0);root.updateMatrixWorld(true);
    onChange({loading:false,outfit:id,action:actionName});
  }
  await setOutfit('hoodie');
  return {
    root,manifest,play,setOutfit,
    update(dt){current?.mixer.update(dt);},
    get action(){return actionName;},get outfit(){return current?.id;},
    onFinished(callback){finishedCallback=callback;},
    setWalkSpeed(speed){if(current&&actionName==='Walk')current.actions.get('Walk').setEffectiveTimeScale(speed/.82);},
    getEyePosition(target=new THREE.Vector3()){
      root.updateMatrixWorld(true);current.head.getWorldPosition(target);
      target.y+=.095;target.addScaledVector(new THREE.Vector3(0,0,1).applyQuaternion(root.quaternion),.14);return target;
    },
    download(){
      const blob=new Blob([current.bytes],{type:'model/gltf-binary'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=`seaside-guide-${current.id}.glb`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
      return {bytes:current.bytes.byteLength,outfit:current.id,animations:[...current.actions.keys()]};
    },
    meshes(){const meshes=[];current.model.traverse(o=>{if(o.isMesh)meshes.push(o);});return meshes;}
  };
}
