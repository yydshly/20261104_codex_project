import * as THREE from 'three';
import { onStairs, rootHeight, safeFootLanding, supportHeight } from './walk-surface.js';
import { STAIR_GAIT } from './scene-layout.js';
import { limitStairTravel, stairSwing } from './stair-motion.js';

const up=new THREE.Vector3(0,1,0),V=()=>new THREE.Vector3();
const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t);};
export function worldRotation(joint,rotation){
  joint.parent.getWorldQuaternion(joint.quaternion);
  joint.quaternion.invert().multiply(rotation);
  joint.updateWorldMatrix(false,true);
}
function aim(joint,end,target){
  const origin=joint.getWorldPosition(V()),a=end.getWorldPosition(V()).sub(origin).normalize(),b=target.clone().sub(origin).normalize();
  const delta=new THREE.Quaternion().setFromUnitVectors(a,b);
  worldRotation(joint,delta.multiply(joint.getWorldQuaternion(new THREE.Quaternion())));
}
export function solveTwoBone(leg,target,orientation){
  const a=leg.hip.getWorldPosition(V()),b=leg.knee.getWorldPosition(V()),c=leg.foot.getWorldPosition(V());
  const l1=a.distanceTo(b),l2=b.distanceTo(c),axis=target.clone().sub(a);
  const d=THREE.MathUtils.clamp(axis.length(),Math.abs(l1-l2)+.001,l1+l2-.0005);axis.normalize();
  let pole=leg.useForward?leg.forward.clone().addScaledVector(axis,-leg.forward.dot(axis)):b.clone().sub(a).addScaledVector(axis,-b.clone().sub(a).dot(axis));
  if(pole.lengthSq()<1e-6)pole=leg.forward.clone().addScaledVector(axis,-leg.forward.dot(axis));pole.normalize();
  const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
  const knee=a.clone().addScaledVector(axis,along).addScaledVector(pole,height);
  aim(leg.hip,leg.knee,knee);aim(leg.knee,leg.foot,a.clone().addScaledVector(axis,d));
  worldRotation(leg.foot,orientation);if(leg.toe)leg.toe.quaternion.copy(leg.toeRest);leg.foot.updateWorldMatrix(false,true);
}
const solve=solveTwoBone;

export function createFootPlacement({root,model,bone,meshes}){
  const review=new URLSearchParams(location.search).get('stairs')==='review';
  root.updateMatrixWorld(true);
  const legs=['L','R'].map((side,i)=>{
    const foot=bone(`${side} Foot`),toe=bone(`${side} Toe0`);
    if(!foot||!toe)throw new Error('Foot contact requires the authored foot/toe joints');
    const hip=bone(`${side} Thigh`),knee=bone(`${side} Calf`),position=foot.getWorldPosition(V());
    const orientation=foot.getWorldQuaternion(new THREE.Quaternion());
    const candidates=[];
    for(const mesh of meshes){
      if(!mesh.isSkinnedMesh)continue;
      const weights=mesh.geometry.attributes.skinWeight,indices=mesh.geometry.attributes.skinIndex;
      const joints=new Set([foot,toe,...toe.children].map(b=>mesh.skeleton.bones.indexOf(b)).filter(j=>j>=0));
      for(let index=0;index<weights.count;index++){
        let weight=0;for(let j=0;j<4;j++)if(joints.has(indices.getComponent(index,j)))weight+=weights.getComponent(index,j);
        if(weight<.75)continue;
        const point=mesh.getVertexPosition(index,V()).applyMatrix4(mesh.matrixWorld);
        if(point.y>.095)continue;
        candidates.push({mesh,index,point});
      }
    }
    if(!candidates.length)throw new Error(`No sole geometry found for ${side} foot`);
    // Retain the lowest point in each sole cell, including heel/toe/corners.
    const cells=new Map();
    for(const p of candidates){const k=`${Math.round(p.point.x/.025)},${Math.round(p.point.z/.025)}`;if(!cells.has(k)||p.point.y<cells.get(k).point.y)cells.set(k,p);}
    const probes=[...cells.values()],inverse=orientation.clone().invert();
    const offsets=probes.map(p=>p.point.clone().sub(position).applyQuaternion(inverse));
    const initialForward=toe.getWorldPosition(V()).sub(position);initialForward.y=0;initialForward.normalize();
    const pivot=offsets.reduce((best,p)=>p.clone().applyQuaternion(orientation).dot(initialForward)>best.clone().applyQuaternion(orientation).dot(initialForward)?p:best,offsets[0]).clone();
    return {side,index:i,lateral:Math.sign(position.x)*.11,hip,knee,foot,toe,toeRest:toe.quaternion.clone(),flat:orientation,probes,offsets,pivot,roll:0,forward:V(),target:position.clone(),planted:position.clone(),swing:false};
  });
  let previous=root.position.clone(),stairGait=null,bodyOffset=0,limited=false;
  function flatOrientation(leg){return root.quaternion.clone().multiply(leg.flat);}
  function orientation(leg){return new THREE.Quaternion().setFromAxisAngle(up.clone().cross(leg.forward).normalize(),leg.roll).multiply(flatOrientation(leg));}
  function grounded(leg,p,q=orientation(leg)){
    let y=-Infinity;
    for(const offset of leg.offsets){const d=offset.clone().applyQuaternion(q);y=Math.max(y,supportHeight(p.x+d.x,p.z+d.z)-d.y+.005);}
    p.y=y;return p;
  }
  function actualClearance(leg){
    let min=Infinity;
    for(const probe of leg.probes){const p=probe.mesh.getVertexPosition(probe.index,V()).applyMatrix4(probe.mesh.matrixWorld);min=Math.min(min,p.y-supportHeight(p.x,p.z));}
    return min;
  }
  function beginStep(direction){
    const moving=legs[stairGait.swing],right=new THREE.Vector3(1,0,0).applyQuaternion(root.quaternion);
    const target=root.position.clone().addScaledVector(direction,STAIR_GAIT.stepDistance+STAIR_GAIT.lead).addScaledVector(right,moving.lateral);
    const offsets=moving.offsets.map(p=>p.clone().applyQuaternion(flatOrientation(moving)));
    safeFootLanding(target,{minZ:Math.min(...offsets.map(p=>p.z)),maxZ:Math.max(...offsets.map(p=>p.z))});grounded(moving,target,flatOrientation(moving));
    stairGait.from=moving.target.clone();stairGait.fromRoll=moving.roll;stairGait.to=target;stairGait.ascending=target.y>grounded(moving,moving.planted.clone(),flatOrientation(moving)).y+.035;stairGait.distance=0;
  }
  return {
    constrainMotion(from){
      limited=false;
      if(!stairGait||stairGait.settle||!onStairs(root.position.x,root.position.z,.12))return false;
      root.updateMatrixWorld(true);
      const candidate=root.position.clone(),constraints=legs.filter(leg=>!leg.swing).map(leg=>{
        const hip=leg.hip.getWorldPosition(V()),knee=leg.knee.getWorldPosition(V()),foot=leg.foot.getWorldPosition(V());
        return {hip:hip.clone().sub(candidate),target:leg.target,length:hip.distanceTo(knee)+knee.distanceTo(foot)};
      });
      const fraction=limitStairTravel(from,candidate,constraints,(x,z)=>rootHeight(x,z)+.004);
      if(fraction<.999){root.position.lerpVectors(from,candidate,fraction);root.position.y=rootHeight(root.position.x,root.position.z)+.004;root.updateMatrixWorld(true);limited=true;}
      return limited;
    },
    update({dt,moving,heading,speed=0,direction:intendedDirection,seatFeet}){
      root.updateMatrixWorld(true);
      const delta=root.position.clone().sub(previous);delta.y=0;const travel=delta.length();previous.copy(root.position);
      const forward=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));
      for(const leg of legs)leg.forward.copy(forward);
      const stairs=onStairs(root.position.x,root.position.z);
      if(seatFeet){
        stairGait=null;bodyOffset=0;
        for(const leg of legs){leg.roll=0;leg.swing=false;leg.target.copy(grounded(leg,seatFeet[leg.index].clone()));leg.planted.copy(leg.target);}
      }else if(stairs&&moving&&(travel>1e-6||speed>1e-4)&&dt>0){
        // A held body still needs the requested travel direction, especially
        // when backing down in eye view without turning the character around.
        const direction=travel>1e-6?delta.clone().normalize():intendedDirection?.clone().normalize()||stairGait?.direction.clone()||forward.clone();
        if(!stairGait||stairGait.settle||direction.dot(stairGait.direction)<.4){
          for(const leg of legs){leg.roll=0;leg.planted.copy(grounded(leg,stairGait?.settle?leg.target.clone():leg.foot.getWorldPosition(V())));leg.target.copy(leg.planted);}
          stairGait={direction,swing:legs[0].planted.dot(direction)<legs[1].planted.dot(direction)?0:1,distance:0};beginStep(direction);
        }
        stairGait.distance+=Math.max(travel,speed*dt);
        const t=Math.min(1,stairGait.distance/STAIR_GAIT.stepDistance),swing=legs[stairGait.swing];
        const arc=stairSwing(t,stairGait.ascending),peak=Math.max(stairGait.from.y,stairGait.to.y)+.075;
        for(const leg of legs){
          leg.swing=leg===swing;
          if(leg.swing)continue;
          leg.roll=(stairGait.ascending?.55:.24)*ease((t-.5)/.5);
          const pivot=leg.pivot.clone().applyQuaternion(flatOrientation(leg)).sub(leg.pivot.clone().applyQuaternion(orientation(leg)));
          leg.target.copy(leg.planted).add(pivot);grounded(leg,leg.target);
        }
        swing.roll=THREE.MathUtils.lerp(stairGait.fromRoll,0,ease(t/.5));
        swing.target.lerpVectors(stairGait.from,stairGait.to,arc.horizontal);
        swing.target.y=t<arc.apex?THREE.MathUtils.lerp(stairGait.from.y,peak,arc.up):THREE.MathUtils.lerp(peak,stairGait.to.y,arc.down);
        // Check the complete sole footprint before letting a swing cross a riser.
        swing.target.y=Math.max(swing.target.y,grounded(swing,swing.target.clone()).y);
        if(t===1){swing.planted.copy(stairGait.to);swing.target.copy(stairGait.to);swing.roll=0;swing.swing=false;stairGait.swing=1-stairGait.swing;legs[stairGait.swing].swing=true;beginStep(direction);}
      }else{
        if(stairGait&&dt===0){
          // Preserve the exact stance/swing targets when the scene is paused.
        }else if(!moving&&stairGait){
          // Finish a stopped swing onto the surface underneath, rather than
          // freezing a foot in the air or resetting it through the stair.
          if(!stairGait.settle)stairGait.settle={time:0,from:legs.map(l=>l.target.clone()),roll:legs.map(l=>l.roll),to:legs.map(leg=>{const p=(leg.swing?leg.target:leg.planted).clone();safeFootLanding(p);return grounded(leg,p,flatOrientation(leg));})};
          stairGait.settle.time+=dt;const t=ease(stairGait.settle.time/.28);
          for(const leg of legs){leg.roll=stairGait.settle.roll[leg.index]*(1-t);const goal=stairGait.settle.to[leg.index];leg.target.lerpVectors(stairGait.settle.from[leg.index],goal,t);leg.target.y=Math.max(leg.target.y,grounded(leg,leg.target.clone()).y);leg.planted.copy(leg.target);leg.swing=t<1&&leg.target.y>goal.y+.003;}
        }else{
          if(!stairs)stairGait=null;
          for(const leg of legs){leg.roll=0;leg.target.copy(leg.foot.getWorldPosition(V()));leg.swing=false;}
        }
      }
      const active=!!seatFeet||stairs||!!stairGait;
      for(const leg of legs)leg.useForward=active;
      if(active&&!seatFeet){
        for(const leg of legs)if(!leg.swing)grounded(leg,leg.target);
        // Lower the pelvis enough for both legs to reach their targets. This
        // leaves a slight knee bend and avoids stretching the supporting leg.
        let required=0;
        for(const leg of legs){
          const hip=leg.hip.getWorldPosition(V()),knee=leg.knee.getWorldPosition(V()),foot=leg.foot.getWorldPosition(V());
          const length=hip.distanceTo(knee)+knee.distanceTo(foot),horizontal=Math.hypot(hip.x-leg.target.x,hip.z-leg.target.z);
          required=Math.min(required,leg.target.y+Math.sqrt(Math.max(.08,length*length*.975-horizontal*horizontal))-hip.y);
        }
        const lowered=Math.max(-.24,required);
        bodyOffset=Math.min(lowered,THREE.MathUtils.damp(bodyOffset,lowered,14,dt));
      }else bodyOffset=THREE.MathUtils.damp(bodyOffset,0,14,dt);
      model.position.y+=bodyOffset;root.updateMatrixWorld(true);
      for(const leg of legs){
        if(active){solve(leg,leg.target,orientation(leg));}
        // Geometry-based correction also covers the indoor sill and uneven
        // sand. It uses actual skinned sole vertices, not only ankle height.
        for(let pass=0;pass<2;pass++){
          const clearance=actualClearance(leg),planted=active&&!leg.swing;
          if(planted?Math.abs(clearance-.005)<.001:clearance>=.002)break;
          const target=leg.foot.getWorldPosition(V());target.y+=(planted?.005:.004)-clearance;
          solve(leg,target,active?orientation(leg):leg.foot.getWorldQuaternion(new THREE.Quaternion()));
        }
      }
    },
    sample(){return {stairs:!!stairGait||onStairs(root.position.x,root.position.z),bodyOffset:Number(bodyOffset.toFixed(4)),...(review?{limited,step:stairGait?{phase:Math.min(1,stairGait.distance/STAIR_GAIT.stepDistance),swing:stairGait.swing,direction:stairGait.direction.toArray()}:null}:{}),feet:legs.map(leg=>({side:leg.side,swing:leg.swing,ankle:leg.foot.getWorldPosition(V()).toArray().map(n=>Number(n.toFixed(4))),clearance:Number(actualClearance(leg).toFixed(4)),probes:leg.probes.length,...(review?{roll:leg.roll,target:leg.target.toArray(),planted:leg.planted.toArray(),hip:leg.hip.getWorldPosition(V()).toArray(),knee:leg.knee.getWorldPosition(V()).toArray(),toe:leg.toe.getWorldPosition(V()).toArray(),sole:leg.probes.map(p=>p.mesh.getVertexPosition(p.index,V()).applyMatrix4(p.mesh.matrixWorld).toArray())}:{})}))};}
  };
}
