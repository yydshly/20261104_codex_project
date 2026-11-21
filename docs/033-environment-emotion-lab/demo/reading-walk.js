import * as THREE from './vendor/three.module.js';
import {SPACE,moveThroughSpace,planWalk,groundAt,locationAt,acousticAt} from './reading-space.js';

/** Drag-to-look first person. Keyboard and touch share the same collision solver. */
export function createReadingWalk(camera,canvas,{onChange=()=>{},onInteract=()=>{},blocked=()=>false,beforeStand=()=>true,onStandBlocked=()=>{},reduced=false}={}){
 let ready=false,disposed=false,seated=true,seatedPlace='room',doorOpen=false,route=[],destination='',posture=null,drag=null,dragged=false,autoRest=false;
 const seatYaw=SPACE.room.heading-Math.PI,seatPitch=SPACE.room.pitch;
 let sitAmount=1,posturePlace='room';let yaw=seatYaw,pitch=seatPitch,walkSpeed=0,autoSit=false,gaze=null,guidedSpeed=0;const keys=new Set(),touch={x:0,z:0},look=new THREE.Vector3();
 camera.rotation.order='YXZ';camera.position.set(SPACE.seat.x,SPACE.seat.y,SPACE.seat.z);orient();
 function orient(){camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld();}
 const state=()=>({seated,sitAmount,posturePlace,seatedPlace:seated?seatedPlace:null,doorOpen,transitioning:Boolean(posture),postureProgress:posture?Math.min(1,posture.age/posture.duration):null,postureDirection:posture?(posture.toSeated?'sit':'stand'):null,walking:walkSpeed>.03,guided:route.length>0,destination,zone:locationAt(camera.position.x,camera.position.z),position:{x:camera.position.x,y:camera.position.y,z:camera.position.z},yaw,pitch});
 function emit(){onChange(state());}
 function cancelRoute(){route=[];destination='';autoSit=false;autoRest=false;gaze=null;guidedSpeed=0;}
 function stand(){if(!seated||posture)return false;if(!beforeStand()){onStandBlocked();return false;}const at=seatedPlace==='terrace'?SPACE.terrace.approach:SPACE.stand;posturePlace=seatedPlace;seated=false;cancelRoute();gaze=null;posture={from:camera.position.clone(),to:new THREE.Vector3(at.x,1.65+groundAt(at.x,at.z),at.z),toSeated:false,age:0,duration:reduced?.01:3.2};emit();}
 function sit(){if(seated||posture)return;if(Math.hypot(camera.position.x-SPACE.stand.x,camera.position.z-SPACE.stand.z)>.85){go('room');autoSit=true;return;}cancelRoute();seated=true;seatedPlace=posturePlace='room';gaze=null;posture={from:camera.position.clone(),to:new THREE.Vector3(SPACE.seat.x,SPACE.seat.y,SPACE.seat.z),toSeated:true,fromYaw:yaw,fromPitch:pitch,toYaw:seatYaw,toPitch:seatPitch,age:0,duration:reduced?.01:3.2};emit();}
 function rest(){if(posture)return false;if(seated){stand();return true;}if(Math.hypot(camera.position.x-SPACE.terrace.approach.x,camera.position.z-SPACE.terrace.approach.z)>.5){const result=go('terrace');autoRest=result;return result;}cancelRoute();seated=true;seatedPlace=posturePlace='terrace';const p=SPACE.terrace.seat;posture={from:camera.position.clone(),to:new THREE.Vector3(p.x,p.y,p.z),toSeated:true,fromYaw:yaw,fromPitch:pitch,toYaw:SPACE.terrace.yaw,toPitch:SPACE.terrace.pitch,age:0,duration:reduced?.01:3.35};emit();return true;}
 function go(where){if(!ready)return false;if(seated){if(stand()===false)return false;}doorOpen=true;destination=where;const start=posture?posture.to:camera.position;
  const zone=locationAt(start.x,start.z);let goals;
  if(where==='terrace')goals=zone==='room'?[...SPACE.path.slice(0,2),SPACE.terrace.approach]:[SPACE.terrace.approach];else if(where==='room'&&zone==='room')goals=[SPACE.stand];else{
   let nearest=0;if(zone!=='room')SPACE.path.forEach((p,i)=>{if(Math.hypot(p.x-start.x,p.z-start.z)<Math.hypot(SPACE.path[nearest].x-start.x,SPACE.path[nearest].z-start.z))nearest=i;});
   goals=where==='pond'?SPACE.path.slice(nearest):[...SPACE.path.slice(0,nearest+1).reverse(),SPACE.stand];
  }
  route=[];let cursor=start;for(const goal of goals){const leg=planWalk(cursor,goal,{doorOpen:true});if(!leg.length){cancelRoute();emit();return false;}route.push(...leg);cursor=goal;}emit();return route.length>0;}
 function toggleDoor(){if(Math.hypot(camera.position.x-SPACE.door.x,camera.position.z-SPACE.door.z)>2.5)return false;if(doorOpen&&Math.abs(camera.position.z-SPACE.door.z)<.55&&Math.abs(camera.position.x-SPACE.door.x)<1.1)return false;doorOpen=!doorOpen;cancelRoute();emit();return true;}
 function action(kind){if(!ready||posture)return false;if(kind==='seat'){seated?stand():sit();return true;}if(kind==='rest'){if(seated&&seatedPlace==='room'){const result=go('terrace');autoRest=result;return result;}return rest();}if(kind==='pond'||kind==='room'||kind==='terrace')return go(kind);if(kind==='door')return toggleDoor();if(kind==='stop'){cancelRoute();emit();return true;}return false;}
 function keydown(e){if(disposed||!ready||blocked()||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){e.preventDefault();keys.add(k);if(seated)stand();const wasGuided=route.length>0;cancelRoute();if(wasGuided)emit();}if(k==='e'&&!e.repeat){e.preventDefault();onInteract();}if(k==='escape'){keys.clear();cancelRoute();emit();}}
 function keyup(e){keys.delete(e.key.toLowerCase());}
 function down(e){if(!ready||blocked())return;canvas.focus({preventScroll:true});drag={id:e.pointerId,x:e.clientX,y:e.clientY};dragged=false;canvas.setPointerCapture(e.pointerId);}
 function move(e){if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>1)dragged=true;drag.x=e.clientX;drag.y=e.clientY;gaze=null;if(posture&&posture.fromYaw!==undefined)delete posture.fromYaw;yaw-=dx*.0033;pitch=THREE.MathUtils.clamp(pitch-dy*.0027,-1.08,1.06);orient();}
 function up(e){if(!drag||drag.id!==e.pointerId)return;drag=null;try{canvas.releasePointerCapture(e.pointerId);}catch{}}
 function clear(){keys.clear();touch.x=touch.z=0;drag=null;walkSpeed=0;}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',clear);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
 return{action,getState:state,gazeTo(nextYaw,nextPitch){gaze={yaw:nextYaw,pitch:THREE.MathUtils.clamp(nextPitch,-1.08,1.06)};},setLook(nextYaw,nextPitch){yaw=nextYaw;pitch=THREE.MathUtils.clamp(nextPitch,-1.08,1.06);gaze=null;orient();},setReady(value){ready=value;emit();},isDrag:()=>dragged,
  setTouch(x,z){touch.x=x;touch.z=z;if(x||z){if(seated)stand();const wasGuided=route.length>0;cancelRoute();if(wasGuided)emit();}},
  getAcoustics:()=>acousticAt({...camera.position,yaw,pitch},doorOpen),
  update(dt){if(!ready||disposed||blocked()){walkSpeed=0;return state();}
   if(posture){posture.age+=dt;const t=Math.min(1,posture.age/posture.duration),s=t*t*(3-2*t);const previous=camera.position.clone(),horizontal=posture.toSeated?THREE.MathUtils.smoothstep(t,0,.52):THREE.MathUtils.smoothstep(t,.08,.75),vertical=posture.toSeated?THREE.MathUtils.smoothstep(t,.40,.90):THREE.MathUtils.smoothstep(t,.18,.76);camera.position.lerpVectors(posture.from,posture.to,horizontal);camera.position.y=THREE.MathUtils.lerp(posture.from.y,posture.to.y,vertical);sitAmount=posture.toSeated?vertical:1-vertical;walkSpeed=Math.hypot(camera.position.x-previous.x,camera.position.z-previous.z)/Math.max(dt,.001);if(posture.fromYaw!==undefined){const delta=Math.atan2(Math.sin(posture.toYaw-posture.fromYaw),Math.cos(posture.toYaw-posture.fromYaw));yaw=posture.fromYaw+delta*s;pitch=THREE.MathUtils.lerp(posture.fromPitch,posture.toPitch,s);}if(t===1){posture=null;emit();}orient();return state();}
   if(gaze&&!drag){const delta=Math.atan2(Math.sin(gaze.yaw-yaw),Math.cos(gaze.yaw-yaw));yaw+=THREE.MathUtils.clamp(delta*(1-Math.exp(-dt*2.8)),-dt*.9,dt*.9);pitch=THREE.MathUtils.damp(pitch,gaze.pitch,2.8,dt);if(Math.abs(delta)<.005&&Math.abs(pitch-gaze.pitch)<.005)gaze=null;}
   let dx=0,dz=0;const beforeX=camera.position.x,beforeZ=camera.position.z;
   if(!seated){const forward=Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'))-touch.z,side=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'))+touch.x;
    if(forward||side){const length=Math.max(1,Math.hypot(forward,side)),speed=(keys.has('shift')?1.9:1.35)*dt;dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*side)/length*speed;dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*side)/length*speed;}
    else if(route.length){
     const target=route[0],x=target.x-camera.position.x,z=target.z-camera.position.z,d=Math.hypot(x,z);let alignment=1;
     if(!drag){const next=route[1],blend=next?THREE.MathUtils.clamp((1.35-d)*.52,0,.65):0,lookX=x+(next?next.x-target.x:0)*blend,lookZ=z+(next?next.z-target.z:0)*blend,desired=Math.atan2(-lookX,-lookZ),delta=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=THREE.MathUtils.clamp(delta*(1-Math.exp(-dt*2.4)),-dt*1.1,dt*1.1);pitch=THREE.MathUtils.damp(pitch,-.06,2,dt);alignment=.25+.75*Math.max(0,Math.cos(delta));}
     guidedSpeed=THREE.MathUtils.damp(guidedSpeed,1.35*alignment,4,dt);const distance=Math.min(d,guidedSpeed*dt);dx=x/Math.max(d,.0001)*distance;dz=z/Math.max(d,.0001)*distance;
     if(d<.08){route.shift();if(!route.length){guidedSpeed=0;if(destination==='pond'){look.set(SPACE.pond.x,.2,SPACE.pond.z);gaze={yaw:Math.atan2(camera.position.x-look.x,camera.position.z-look.z),pitch:-.17};}if(destination==='terrace')gaze={yaw:SPACE.terrace.yaw,pitch:-.12};destination='';const shouldSit=autoSit,shouldRest=autoRest;autoSit=autoRest=false;if(shouldSit)sit();if(shouldRest)rest();emit();}}
    }
    if(!posture){const next=moveThroughSpace(camera.position,dx,dz,{doorOpen});camera.position.x=next.x;camera.position.z=next.z;camera.position.y=THREE.MathUtils.damp(camera.position.y,1.65+groundAt(next.x,next.z),8,dt);}
   }
   walkSpeed=Math.hypot(camera.position.x-beforeX,camera.position.z-beforeZ)/Math.max(dt,.001);orient();return state();
  },
  dispose(){disposed=true;clear();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',clear);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);}
 };
}
