import * as THREE from 'three';
import { solveTwoBone, worldRotation } from './foot-placement.js';
import { ROCK_SEAT } from './rock-seat.js';
import { createSeatCoat } from './seat-coat.js';

const V=()=>new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
function handFrame(fingers,palm){
 const z=fingers.clone().normalize(),y=palm.clone().addScaledVector(z,-palm.dot(z)).normalize(),x=y.clone().cross(z).normalize();y.copy(z).cross(x).normalize();
 return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
}
// Authored, scene-fitted skeletal performance on our own mesh. Base clips,
// facial morphs, identity and GLB bytes are unchanged. Feet are solved last.
export function createSeatedPose({root,bone,meshes,handFrames=[]}){
 const qa=new URLSearchParams(location.search).has('qa'),probes=[],backProbes=[];
 if(qa)for(const mesh of meshes){
  const cells=new Set();
  for(let i=0;i<mesh.geometry.attributes.position.count;i++){
   const p=mesh.getVertexPosition(i,V()).applyMatrix4(mesh.matrixWorld);
   const hip=p.y>=.70&&p.y<=.98&&Math.abs(p.x)<=.23&&p.z<=.10&&p.z>=-.23;
   const back=p.y>=1.10&&p.y<=1.36&&Math.abs(p.x)<.18&&p.z<-.07;
   if(!hip&&!back)continue;
   const key=[p.x,p.y,p.z].map(n=>Math.round(n/.035)).join(',');if(cells.has(key))continue;cells.add(key);(hip?probes:backProbes).push({mesh,index:i});
  }
 }
 const pelvis=bone('Pelvis'),spine=bone('Spine'),head=bone('Head');
 const coat=createSeatCoat({meshes,bone});
 const arms=['L','R'].map((s,i)=>({hip:bone(`${s} UpperArm`),knee:bone(`${s} Forearm`),foot:bone(`${s} Hand`),finger:bone(`${s} Finger1`),side:i===0?1:-1,useForward:true,forward:V()}));
 for(const arm of arms){
  const side=arm.side>0?'L':'R',wrist=arm.foot.getWorldPosition(V()),long=bone(`${side} Finger2`).getWorldPosition(V()).sub(wrist).normalize();
  const across=bone(`${side} Finger1`).getWorldPosition(V()).sub(bone(`${side} Finger4`).getWorldPosition(V())).normalize(),palm=long.clone().cross(across).multiplyScalar(arm.side).normalize();
  const inverse=arm.foot.getWorldQuaternion(new THREE.Quaternion()).invert();
  const frame=handFrames.find(f=>f.side===side);
  arm.localFingers=frame?V().fromArray(frame.localFingers):long.applyQuaternion(inverse);arm.localPalm=frame?V().fromArray(frame.localPalm):palm.applyQuaternion(inverse);arm.frameInverse=handFrame(arm.localFingers,arm.localPalm).invert();
 }
 let feet=null,sample=null,activeSeat=ROCK_SEAT;
 return {
  apply(pose){
   coat.set(pose?.amount||0);
   if(!pose){feet=null;sample=null;return null;}
   const seat=pose.seat||ROCK_SEAT;activeSeat=seat;
   root.updateMatrixWorld(true);
   const forward=V().set(Math.sin(seat.yaw),0,Math.cos(seat.yaw)),right=V().set(forward.z,0,-forward.x);
   feet??={from:['L','R'].map(side=>bone(`${side} Foot`).getWorldPosition(V())),to:[1,-1].map((side,i)=>root.position.clone().addScaledVector(right,side*(seat.footSpread??.115)).addScaledVector(forward,seat.footForward?.[i]??-.01)),settled:false};
   if(pose.amount>=.18)feet.settled=true;
   const original=pelvis.getWorldPosition(V()),goal=original.clone().addScaledVector(forward,-seat.pelvisBack*pose.back);
   goal.y=THREE.MathUtils.lerp(original.y,seat.top+(seat.pelvisClearance??.12),pose.amount);
   pelvis.position.copy(pelvis.parent.worldToLocal(goal));root.updateMatrixWorld(true);
   const breath=.006*Math.sin(pose.time*1.6)*pose.amount;
   worldRotation(spine,new THREE.Quaternion().setFromAxisAngle(right,pose.lean+breath).multiply(spine.getWorldQuaternion(new THREE.Quaternion())));
   worldRotation(head,new THREE.Quaternion().setFromAxisAngle(right,-pose.lean*.65).multiply(head.getWorldQuaternion(new THREE.Quaternion())));
   const support=pose.handSupport??pose.amount,hipHeight=pelvis.getWorldPosition(V()).y;
   for(const arm of arms){
    const fit=seat.hands?.[arm.side>0?0:1]||{},armTop='armTop' in fit?fit.armTop:seat.armTop;
    const hand=arm.foot.getWorldPosition(V()),q=arm.foot.getWorldQuaternion(new THREE.Quaternion());
    const target=root.position.clone().addScaledVector(forward,-seat.pelvisBack*pose.back+(fit.forward??seat.handForward??.24)).addScaledVector(right,arm.side*(fit.spread??seat.handSpread??.14));
    target.y=armTop?armTop+.025:hipHeight+(fit.heightOffset??.02);
    hand.lerp(target,support);
    arm.forward.copy(right).multiplyScalar(arm.side).addScaledVector(forward,-.28).addScaledVector(up,-.12).normalize();
    if(armTop){
     // Lower the elbow toward the rear of the arm pad; an outward-only pole
     // flares the shoulders and leaves the forearm hovering above the chair.
     const elbow=root.position.clone().addScaledVector(forward,-seat.pelvisBack*pose.back+.015).addScaledVector(right,arm.side*(fit.elbowSpread??.37));
     elbow.y=armTop+.04;
     const relaxedPole=elbow.sub(arm.hip.getWorldPosition(V())).normalize();arm.forward.lerp(relaxedPole,support).normalize();
    }
    // Align both anatomical axes. A fixed 90-degree roll around the scene's
    // forward vector made one hand hook sideways and the other float over it.
    const dip=armTop?.025:.13,relaxed=forward.clone().addScaledVector(right,arm.side*.06).addScaledVector(up,-dip).normalize();
    const palm=up.clone().negate().addScaledVector(forward,-dip).normalize();
    const flat=handFrame(relaxed,palm).multiply(arm.frameInverse);q.slerp(flat,support);
    solveTwoBone(arm,hand,q);
   }
   sample={seat:seat.id,amount:pose.amount,lean:pose.lean,pelvis:pelvis.getWorldPosition(V()).toArray(),hands:arms.map(a=>a.foot.getWorldPosition(V()).toArray()),handAxes:arms.map(a=>{const q=a.foot.getWorldQuaternion(new THREE.Quaternion());return {palm:a.localPalm.clone().applyQuaternion(q).toArray(),fingers:a.localFingers.clone().applyQuaternion(q).toArray()};}),elbows:arms.map(a=>a.knee.getWorldPosition(V()).toArray()),shoulders:arms.map(a=>a.hip.getWorldPosition(V()).toArray()),seatTop:seat.top,coatCorrectiveVertices:coat.vertices};
   const contact=feet.settled?1:THREE.MathUtils.smoothstep(pose.amount,0,.18);
   return feet.from.map((p,i)=>p.clone().lerp(feet.to[i],contact));
  },
  get sample(){
   if(!sample)return null;
   const knees=['L','R'].map(s=>bone(`${s} Calf`).getWorldPosition(V()).toArray());
   let contact=null;
   if(qa&&sample.amount>.95){
    const points=probes.map(p=>p.mesh.getVertexPosition(p.index,V()).applyMatrix4(p.mesh.matrixWorld)).filter(p=>{
     const dx=p.x-activeSeat.x,dz=p.z-activeSeat.z;
     return Math.abs(dx*Math.cos(activeSeat.yaw)-dz*Math.sin(activeSeat.yaw))<.25&&Math.abs(dx*Math.sin(activeSeat.yaw)+dz*Math.cos(activeSeat.yaw))<.20;
    });
    contact={probes:points.length,minimumSurfaceGap:points.length?Math.min(...points.map(p=>p.y-activeSeat.top)):null};
   }
   let backContact=null;
   if(qa&&sample.amount>.95&&activeSeat.back){
    const b=activeSeat.back,points=backProbes.map(p=>p.mesh.getVertexPosition(p.index,V()).applyMatrix4(p.mesh.matrixWorld)).filter(p=>Math.abs(p.y-b.y)<b.height/2-.06);
    const gap=p=>b.x!==undefined?p.x-(b.x-Math.tan(b.tilt)*(p.y-b.y)+b.depth/(2*Math.cos(b.tilt))):b.z+Math.tan(b.tilt)*(p.y-b.y)-b.depth/(2*Math.cos(b.tilt))-p.z;
    backContact={probes:points.length,minimumGap:points.length?Math.min(...points.map(gap)):null};
   }
   return {...sample,knees,contact,backContact};
  }
 };
}
