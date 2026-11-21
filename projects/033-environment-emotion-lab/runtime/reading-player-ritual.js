import * as THREE from './vendor/three.module.js';
import {SPACE} from './reading-space.js';
import {TEA} from './reading-ritual-layout.js';
const V=()=>new THREE.Vector3(),up=new THREE.Vector3(0,1,0),ease=(t,a,b)=>THREE.MathUtils.smoothstep(t,a,b);
function handFrame(fingers,palm){const z=fingers.clone().normalize(),y=palm.clone().addScaledVector(z,-palm.dot(z)).normalize(),x=y.clone().cross(z).normalize();y.copy(z).cross(x);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));}

/** One performance clock drives both the acquired skeleton and physical props. */
export function createPlayerRitual({root,bone,arms,joints,solve,worldRotation}){
 let bookPlace='terrace',restPlace='terrace',bookRequested=false,phase='table',age=0,amount=0,phaseProgress=0;
 let time=0,sipAge=Infinity,pendingSip=false,nextBlink=3.8,blinkAge=Infinity,pose={};
 const durations={reaching:1.1,lifting:1.25,turning:1.55,lowering:1.30,releasing:.55};
 const enter=p=>{phase=p;age=0;};
 for(const [i,arm]of arms.entries()){const side=i===0?'L':'R',wrist=arm.end.getWorldPosition(V()),inverse=arm.end.getWorldQuaternion(new THREE.Quaternion()).invert(),long=bone(side+' Finger2').getWorldPosition(V()).sub(wrist).normalize(),across=bone(side+' Finger1').getWorldPosition(V()).sub(bone(side+' Finger4').getWorldPosition(V())).normalize(),palm=long.clone().cross(across).multiplyScalar(arm.side).normalize();arm.handInverse=handFrame(long.applyQuaternion(inverse),palm.applyQuaternion(inverse)).invert();arm.sideName=side;}
 const eyes=['LEye','REye'].map(name=>{const joint=bone(name);return joint?{joint,forward:new THREE.Vector3(0,0,1).applyQuaternion(joint.getWorldQuaternion(new THREE.Quaternion()).invert())}:null;}).filter(Boolean);
 function orient(arm,fingers,palm){return handFrame(fingers,palm).multiply(arm.handInverse);}
 function curl(arm,amount,fingers,palm){const axis=palm.clone().cross(fingers).normalize();for(let finger=1;finger<5;finger++)for(let part=0;part<3;part++){const joint=bone(arm.sideName+' Finger'+finger+(part?String(part):''));if(joint)worldRotation(joint,new THREE.Quaternion().setFromAxisAngle(axis,amount*[.45,.65,.48][part]).multiply(joint.getWorldQuaternion(new THREE.Quaternion())));}}
 return{setBook(value){if(sipAge<4.2||pendingSip)return false;bookRequested=Boolean(value);if(value&&phase==='table')bookPlace=restPlace;return true;},
  turnPage(){if(phase!=='reading')return false;enter('turning');return true;},
  sip(){if(sipAge<4.2||pendingSip)return false;bookRequested=false;pendingSip=true;return true;},
  update(dt,state){time+=dt;const atRest=Boolean(state.seated)&&!state.transitioning;if(atRest)restPlace=state.seatedPlace;
   if(!atRest){bookRequested=false;pendingSip=false;if(sipAge<4.2)sipAge=4.2;}
   if(phase==='table'&&bookRequested){bookPlace=restPlace;enter('reaching');}
   if(phase==='reading'&&!bookRequested)enter('lowering');
   age+=dt;phaseProgress=durations[phase]?Math.min(1,age/durations[phase]):0;
   if(phaseProgress===1){
    if(phase==='reaching')enter(bookRequested?'lifting':'releasing');
    else if(phase==='lifting'||phase==='turning')enter(bookRequested?'reading':'lowering');
    else if(phase==='lowering')enter('releasing');
    else if(phase==='releasing')enter('table');
    phaseProgress=0;
   }
   amount=phase==='lifting'?ease(phaseProgress,0,1):phase==='lowering'?1-ease(phaseProgress,0,1):['reading','turning'].includes(phase)?1:0;
   if(pendingSip&&phase==='table'){sipAge=0;pendingSip=false;}else sipAge+=dt;
   const heading=root.rotation.y,forward=V().set(Math.sin(heading),0,Math.cos(heading)),right=V().set(forward.z,0,-forward.x);
   const heldBook=root.position.clone().addScaledVector(forward,bookPlace==='room'?.10:.28);heldBook.y=root.position.y+.96;
   const home=bookPlace==='room'?SPACE.room.book:TEA.book;
   const bookPosition=V().set(home.x,home.y,home.z).lerp(heldBook,amount);
   if(['lifting','lowering'].includes(phase))bookPosition.y+=Math.sin(amount*Math.PI)*.085;
   if(['reading','turning'].includes(phase)){bookPosition.addScaledVector(forward,.0025*Math.sin(time*.53));bookPosition.y+=.002*Math.sin(time*.73);}
   const bookQuaternion=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,bookPlace==='room'?SPACE.room.bookYaw:.24,0)).slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,heading,0)).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-.35)),amount);
   const bookAmount=amount;
   const sip=sipAge<4.2,grip=sip?(sipAge<.8?ease(sipAge,0,.75):1-ease(sipAge,3.4,4.2)):0;
   const lift=sip?(sipAge<1.7?ease(sipAge,.85,1.7):1-ease(sipAge,2.6,3.4)):0;
   const reach=phase==='reaching'?ease(phaseProgress,.02,.90):phase==='releasing'?1-ease(phaseProgress,0,1):['lifting','reading','turning','lowering'].includes(phase)?1:0;
   const reachLean=phase==='reaching'?Math.sin(phaseProgress*Math.PI*.5):phase==='lifting'?1-ease(phaseProgress,0,1):phase==='lowering'?ease(phaseProgress,0,1):phase==='releasing'?1-ease(phaseProgress,0,1):0;
   const tableDirection=V().set(home.x-root.position.x,0,home.z-root.position.z).normalize();
   if(reachLean>0){const axis=tableDirection.clone().cross(up).negate().normalize();worldRotation(joints.spine,new THREE.Quaternion().setFromAxisAngle(axis,(bookPlace==='room'?.45:.30)*reachLean).multiply(joints.spine.getWorldQuaternion(new THREE.Quaternion())));}
   const headYaw=reach>.05&&bookAmount<.2?THREE.MathUtils.clamp(Math.atan2(Math.sin(Math.atan2(tableDirection.x,tableDirection.z)-heading),Math.cos(Math.atan2(tableDirection.x,tableDirection.z)-heading)),-.5,.5)*reachLean:bookAmount>.05?0:state.viewMode==='first'?THREE.MathUtils.clamp(Math.atan2(Math.sin(state.yaw+Math.PI-heading),Math.cos(state.yaw+Math.PI-heading)),-.55,.55):0;
   const nod=bookAmount*.38-lift*.065;
   worldRotation(joints.head,new THREE.Quaternion().setFromAxisAngle(up,headYaw).multiply(new THREE.Quaternion().setFromAxisAngle(right,nod)).multiply(joints.head.getWorldQuaternion(new THREE.Quaternion())));
   if((atRest||(state.postureDirection==='stand'&&state.postureProgress<.38))&&reach<.01){for(const arm of arms)worldRotation(arm.end,orient(arm,forward.clone().addScaledVector(up,-.12),up.clone().negate()));}
   if(reach>.001){for(const arm of arms){
    const primary=bookPlace==='room'?arm.side>0:arm.side<0;
    const width=bookPlace==='room'?.215:.153;
    // The near hand grips first; the second hand comes underneath while lifting.
    const gripSide=bookPlace==='room'?-1:1;
    const homeOffset=new THREE.Vector3(gripSide*width,-.015,0);
    const supportOffset=new THREE.Vector3(arm.side*width,-.022,-.070);
    const handoff=ease(amount,.18,.72);
    const offset=primary?homeOffset.clone().lerp(supportOffset,handoff):supportOffset.clone();
    let target=bookPosition.clone().add(offset.applyQuaternion(bookQuaternion));
    let influence=primary?reach:reach*ease(amount,.10,.62);
    let fingers=forward,palm=up;
    if(primary&&handoff<1){const edge=bookPosition.clone().add(homeOffset.clone().applyQuaternion(bookQuaternion));const reachFingers=edge.clone().sub(arm.hip.getWorldPosition(V())).normalize();const wrist=edge.clone().addScaledVector(reachFingers,-.145);const support=bookPosition.clone().add(supportOffset.clone().applyQuaternion(bookQuaternion));target=wrist.lerp(support,handoff);fingers=reachFingers.lerp(forward,handoff).normalize();}
    if(phase==='turning'&&arm.side<0){const t=phaseProgress,gesture=ease(t,0,.18)*(1-ease(t,.72,1)),arc=Math.sin(Math.PI*ease(t,.12,.86));const x=THREE.MathUtils.lerp(-width*.83,width*.55,ease(t,.22,.65));const turnOffset=supportOffset.clone().lerp(new THREE.Vector3(x,.018+arc*.095,-.025),gesture);target=bookPosition.clone().add(turnOffset.applyQuaternion(bookQuaternion));influence=1;fingers=forward.clone().addScaledVector(up,-.35*gesture).normalize();}
    solve(arm,arm.end.getWorldPosition(V()).lerp(target,influence),arm.end.getWorldQuaternion(new THREE.Quaternion()).slerp(orient(arm,fingers,palm),influence),root.position.clone().addScaledVector(right,arm.side*.28).addScaledVector(forward,.01).add(new THREE.Vector3(0,.70,0)).sub(arm.hip.getWorldPosition(V())).normalize());
    curl(arm,influence*(phase==='turning'&&arm.side<0?.45:.26),fingers,palm);
   }}
   const mouth=(bone('MBottomLip')||joints.head).getWorldPosition(V()).addScaledVector(forward,.04);mouth.y-=.058;
   let cupPosition=V().set(TEA.cup.x,TEA.cup.y,TEA.cup.z).lerp(mouth,lift),cupQuaternion=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,heading,0)).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-.27*lift));
   if(sip){const arm=arms[1],palm=right,target=cupPosition.clone().addScaledVector(palm,-.045).addScaledVector(forward,-.035);target.y-=.03;solve(arm,arm.end.getWorldPosition(V()).lerp(target,grip),arm.end.getWorldQuaternion(new THREE.Quaternion()).slerp(orient(arm,forward,palm),grip),root.position.clone().addScaledVector(right,-.30).addScaledVector(forward,.10).add(new THREE.Vector3(0,.85,0)).sub(arm.hip.getWorldPosition(V())).normalize());curl(arm,grip,forward,palm);
    if(sipAge>=.8&&sipAge<=3.4){cupPosition=arm.end.getWorldPosition(V()).addScaledVector(palm,.045).addScaledVector(forward,.035);cupPosition.y+=.03;}
   }
   const eyeTarget=reach>.05?bookPosition.clone().add(new THREE.Vector3(Math.sin(time*.38)*.045,.02,-.015+((time*.012)% .045)).applyQuaternion(bookQuaternion)):sip?cupPosition.clone().addScaledVector(up,.06):null;if(eyeTarget)for(const eye of eyes){const q=eye.joint.getWorldQuaternion(new THREE.Quaternion()),current=eye.forward.clone().applyQuaternion(q).normalize(),wanted=eyeTarget.clone().sub(eye.joint.getWorldPosition(V())).normalize(),angle=current.angleTo(wanted),delta=new THREE.Quaternion().setFromUnitVectors(current,wanted);if(angle>.38)delta.slerp(new THREE.Quaternion(),1-.38/angle);worldRotation(eye.joint,delta.multiply(q));}
   // Local eyelid bones preserve the original face; irregular timing avoids a fixed blink loop.
   blinkAge+=dt;if(time>nextBlink){blinkAge=0;nextBlink=time+3.1+Math.random()*4.2;}const blink=blinkAge<.24?Math.sin(blinkAge/.24*Math.PI):0;
   if(blink>0)for(const side of['L','R'])for(const[part,amount]of[['Top',-.006],['Bottom',.003]]){const lid=bone(side+'EyeBlink'+part);if(lid){const p=lid.getWorldPosition(V());p.y+=amount*blink;lid.position.copy(lid.parent.worldToLocal(p));}}
   if(atRest)for(const name of ['LMouthCorner','RMouthCorner','LInnerEyebrow','RInnerEyebrow']){const joint=bone(name);if(joint){const p=joint.getWorldPosition(V());p.y+=name.includes('Eyebrow')?.0012:.0008;joint.position.copy(joint.parent.worldToLocal(p));}}
   root.updateMatrixWorld(true);pose={time,restAmount:atRest&&restPlace==='terrace'?1:0,bookPlace,bookRequested,bookAmount,bookPhase:phase,phaseProgress,reachLean,bookBusy:phase!=='table',bookInHands:['lifting','reading','turning','lowering'].includes(phase),pageTurn:phase==='turning'?phaseProgress:null,bookPosition,bookQuaternion,cupPosition,cupQuaternion,sipAge,sipping:sip,blink,headPitch:nod};return pose;
  },getPose:()=>pose,
 };
}
