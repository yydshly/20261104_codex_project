import * as THREE from './vendor/three.module.js';

/** Retain native shoulder/spine motion; scene IK owns only contact constraints. */
export function createReadingMotionLayers(mixer,clips){
 const layers={};
 for(const name of ['SeatedRelaxed','SeatedLook','ReadBody','PickBody','PutBody','PageBody']){
  const source=clips.find(c=>c.name===name);if(!source)continue;
  const clip=source.clone();clip.name=name+' additive';
  clip.tracks=clip.tracks.filter(t=>t.name.endsWith('.quaternion')&&/Spine|Clavicle|Neck|Head|UpperArm|Forearm/.test(t.name));
  THREE.AnimationUtils.makeClipAdditive(clip,0,source,30);
  layers[name]=mixer.clipAction(clip).setEffectiveWeight(0).play();if(['SeatedRelaxed','ReadBody'].includes(name))layers[name].setLoop(THREE.LoopPingPong,Infinity);
 }
 return{update(dt,pose,seated){
  const reach=pose.bookPhase==='reaching'?Math.sin(Math.PI*(pose.phaseProgress||0)):0;
  const returning=['lowering','releasing'].includes(pose.bookPhase)?Math.sin(Math.PI*(pose.phaseProgress||0)):0;
  const goals={SeatedRelaxed:seated*(1-(pose.bookAmount||0))*.10,SeatedLook:0,
   ReadBody:seated*(pose.bookAmount||0)*.20,PickBody:reach*.42,PutBody:returning*.32,
   PageBody:pose.bookPhase==='turning'?.22:0};
  for(const[name,a]of Object.entries(layers)){
   const goal=goals[name]||0;a.setEffectiveWeight(THREE.MathUtils.damp(a.getEffectiveWeight(),goal,8,dt));
   if((name==='PickBody'&&pose.bookPhase==='reaching')||(name==='PutBody'&&['lowering','releasing'].includes(pose.bookPhase))||(name==='PageBody'&&pose.bookPhase==='turning'))a.time=THREE.MathUtils.clamp(pose.phaseProgress||0,0,.999)*a.getClip().duration;
  }
 },dispose(){for(const a of Object.values(layers))a.stop();}};
}
