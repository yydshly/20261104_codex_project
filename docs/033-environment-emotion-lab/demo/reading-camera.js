import * as THREE from './vendor/three.module.js';
import {cameraSolids,SPACE} from './reading-space.js';

/** Eye pose is owned by the player controller. This camera never moves that pose. */
export function clipCameraBoom(target,desired,solids,padding=.16){
 const delta=desired.clone().sub(target),length=delta.length();if(length<1e-6)return desired.clone();
 const ray=new THREE.Ray(target,delta.multiplyScalar(1/length)),point=new THREE.Vector3();let distance=length;
 for(const a of solids){const b=new THREE.Box3(new THREE.Vector3(a[0],a[1],a[2]),new THREE.Vector3(a[3],a[4],a[5])).expandByScalar(padding);
  // Furniture around a seated torso must not force the camera through its target.
  if(b.containsPoint(target))continue;
  if(ray.intersectBox(b,point))distance=Math.min(distance,Math.max(.08,target.distanceTo(point)-.025));
 }
 return target.clone().addScaledVector(ray.direction,distance);
}
export function createReadingCamera(camera,eye,{reduced=false,onChange=()=>{}}={}){
 let mode='first',blend=0,initialized=false,boom=2.45,drinkRetreat=0;const target=new THREE.Vector3(),desired=new THREE.Vector3();
 function setMode(value){if(!['first','third'].includes(value)||value===mode)return false;mode=value;onChange(mode);return true;}
 return{setMode,toggle:()=>setMode(mode==='first'?'third':'first'),getState:()=>({mode,blend,boom}),
  update(dt,state){const goal=mode==='third'?1:0;blend=reduced?goal:THREE.MathUtils.damp(blend,goal,9,dt);if(Math.abs(blend-goal)<.001)blend=goal;
   // The seated rig leans behind its navigation anchor. Keep first-person eyes
   // at the authored head, otherwise a cup at the mouth ends up behind the lens.
   const seatedAmount=state.seated||state.transitioning?(state.sitAmount??(state.seated?1:0)):0,terrace=(state.posturePlace||state.seatedPlace)==='terrace',bodyYaw=terrace?SPACE.terrace.yaw+Math.PI:SPACE.room.heading;
   drinkRetreat=THREE.MathUtils.damp(drinkRetreat,state.sipping?.07:0,7,dt);
   const firstEye=state.avatarEye?.clone()||eye.position.clone().addScaledVector(new THREE.Vector3(Math.sin(bodyYaw),0,Math.cos(bodyYaw)),-(terrace?.02:.36)*seatedAmount);if(!state.avatarEye&&!terrace)firstEye.y-=.03*seatedAmount;firstEye.addScaledVector(new THREE.Vector3(Math.sin(bodyYaw),0,Math.cos(bodyYaw)),-drinkRetreat);firstEye.y+=(state.avatarEye?.015:0)+drinkRetreat*.4;
   const bodyTargetY=eye.position.y-(state.seated?.24:.32),yaw=state.yaw,shoulder=state.seated?.12:.24;target.set(eye.position.x+Math.cos(yaw)*shoulder,bodyTargetY,eye.position.z-Math.sin(yaw)*shoulder);
   const pitch=THREE.MathUtils.clamp(state.pitch,-.30,.55);
   const distance=state.zone==='room'?2.1:2.65;
   desired.set(Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(-pitch)*distance+.36,Math.cos(yaw)*Math.cos(pitch)*distance).add(target);
   const clear=clipCameraBoom(target,desired,cameraSolids(state.doorOpen));const allowed=target.distanceTo(clear);
   // Contract immediately at walls; ease the extension after leaving a doorway.
   boom=!initialized?allowed:allowed<boom?allowed:THREE.MathUtils.damp(boom,allowed,4,dt);initialized=true;
   clear.sub(target).normalize().multiplyScalar(boom).add(target);
   camera.position.copy(firstEye).lerp(clear,blend);
   // Test the blended segment too: switching perspective cannot travel through walls.
   camera.position.copy(clipCameraBoom(firstEye,camera.position,cameraSolids(state.doorOpen),.12));
   const thirdRotation=new THREE.Quaternion();const rotationMatrix=new THREE.Matrix4().lookAt(clear,target,new THREE.Vector3(0,1,0));thirdRotation.setFromRotationMatrix(rotationMatrix);
   camera.quaternion.copy(eye.quaternion).slerp(thirdRotation,blend);camera.updateMatrixWorld(true);
   return{mode,blend,boom,headHidden:camera.position.distanceTo(firstEye)<.55};
  }
 };
}
