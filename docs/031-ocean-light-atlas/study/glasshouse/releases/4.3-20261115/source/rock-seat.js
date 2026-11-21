import { groundHeight } from './coast.js';

const x=2.6,z=11.8,yaw=2.26,forward={x:Math.sin(yaw),z:Math.cos(yaw)};
const point=distance=>({x:x+forward.x*distance,z:z+forward.z*distance});
// One deliberately fitted seat. The walking capsule still avoids this rock;
// only the short, authored backing-in movement enters its sitting clearance.
export const ROCK_SEAT=Object.freeze({id:'seaside-seat',x,z,yaw,forward,
 width:.74,depth:.36,top:groundHeight(x,z)+.37,ground:groundHeight(x,z),
 approach:point(1.12),stand:point(.57),pelvisBack:.42,
 durations:{turn:1.45,align:1.45,lower:3.15,watch:9,rise:2.9,exit:1.45}
});

export const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const smoother=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10);};
export function seatNearby(position,seat=ROCK_SEAT){
 const front=(position.x-seat.x)*seat.forward.x+(position.z-seat.z)*seat.forward.z;
 if(position.y!==undefined&&Math.abs(position.y-seat.ground)>=.25)return false;
 const zone=seat.interaction;
 if(zone){
  const lateral=(position.x-seat.x)*seat.forward.z-(position.z-seat.z)*seat.forward.x;
  return front>=zone.frontMin&&front<=zone.frontMax&&Math.abs(lateral)<=zone.lateral&&position.z>=zone.minZ&&position.z<=zone.maxZ;
 }
 return front>.62&&Math.hypot(position.x-seat.approach.x,position.z-seat.approach.z)<.72;
}
export function seatMotion(stage,t,startPose=null,seat=ROCK_SEAT){
 t=Math.max(0,Math.min(1,t));
 let amount=0,back=0,lean=0,handSupport=0;
 if(stage==='lower'){
  amount=smoother((t-.18)/.78);back=smoother((t-.12)/.82);
  lean=.28*smooth(t/.28)*(1-smooth((t-.45)/.5))+(seat.relaxedLean??.035)*smooth((t-.6)/.4);
  handSupport=smooth((t-.10)/.55);
 }else if(stage==='watch'){amount=back=handSupport=1;lean=seat.relaxedLean??.035;}
 else if(stage==='rise'){
  amount=1-smoother((t-.20)/.76);back=1-smoother((t-.25)/.71);
  lean=(seat.relaxedLean??.035)*(1-smooth(t/.4))+.30*smooth(t/.23)*(1-smooth((t-.38)/.52));
  handSupport=1-smooth((t-.38)/.45);
  if(startPose){amount*=startPose.amount;back*=startPose.back;handSupport*=startPose.handSupport??startPose.amount;lean=startPose.lean+(lean-startPose.lean)*smooth(t/.2);}
 }
 return {amount,back,lean,handSupport};
}
