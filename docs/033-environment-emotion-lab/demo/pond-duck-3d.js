import * as THREE from './vendor/three.module.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a),0,1);return t*t*(3-2*t);};
const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
function constrainPond(point,dockAvoidance=true){
  let x=clamp(Number(point?.x)||0,-3.45,3.45),z=clamp(Number(point?.z)||0,-2.1,2.1);
  const d=Math.hypot(x/3.45,z/2.1);
  if(d>.93){x=x/d*.93;z=z/d*.93;}
  if(!dockAvoidance)return{x,z};
  // Minkowski clearance for the entire duck, including its turning head and bill.
  // Dock boards start at x=2.875 and finish at z=.7125; a center-only clamp clips them.
  const footprint=.92,cornerZ=Math.max(0,z-.713);
  let dockLimit=1.95+.85*smooth(1,1.65,z);
  if(cornerZ<footprint)dockLimit=Math.min(dockLimit,2.875-Math.sqrt(footprint*footprint-cornerZ*cornerZ));
  return{x:Math.min(x,dockLimit),z};
}

// A single continuous surface from rump through breast and neck to the forehead.
function sculptedBody(){
  const sections=[[-.71,.25,.008,.014],[-.55,.235,.13,.15],[-.37,.225,.245,.276],[-.10,.235,.279,.309],[.14,.267,.247,.267],[.29,.363,.185,.192],[.325,.475,.116,.127],[.345,.61,.105,.116],[.395,.735,.155,.154],[.49,.773,.167,.158],[.59,.749,.119,.127],[.65,.701,.049,.066],[.665,.69,.003,.009]];
  const centers=new THREE.CatmullRomCurve3(sections.map(s=>new THREE.Vector3(s[0],s[1],0)),false,'catmullrom',.28);
  const rings=104,sides=48,positions=[],uv=[],weights=[],indices=[];
  const radius=(t,k)=>{const q=t*(sections.length-1),i=Math.floor(q),f=q-i;const a=sections[Math.max(0,i-1)][k],b=sections[Math.min(i,sections.length-1)][k],c=sections[Math.min(i+1,sections.length-1)][k],d=sections[Math.min(i+2,sections.length-1)][k];return Math.max(.002,.5*((2*b)+(-a+c)*f+(2*a-5*b+4*c-d)*f*f+(-a+3*b-3*c+d)*f*f*f));};
  for(let i=0;i<=rings;i++){const t=i/rings,p=centers.getPoint(t),tangent=centers.getTangent(t),nx=-tangent.y,ny=tangent.x;const rn=radius(t,2),rz=radius(t,3),neck=smooth(.37,.61,t),head=smooth(.62,.77,t);for(let j=0;j<=sides;j++){const v=j/sides,a=v*Math.PI*2,c=Math.cos(a),s=Math.sin(a);positions.push(p.x+nx*rn*c,p.y+ny*rn*c,rz*s);uv.push(t*3.4,v*2.8);weights.push(neck,head);if(i<rings&&j<sides){const k=i*(sides+1)+j,n=k+sides+1;indices.push(k,k+1,n,k+1,n+1,n);}}}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('duckSkin',new THREE.Float32BufferAttribute(weights,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function billGeometry(lower=false){
  const rings=20,sides=28,p=[],uv=[],ix=[];
  for(let i=0;i<=rings;i++)for(let j=0;j<=sides;j++){const t=i/rings,a=j/sides*Math.PI*2;const width=(.064+.028*Math.sin(t*Math.PI*.78))*(1-smooth(.82,1,t)*.29),height=(lower?.012:.023)*(1-.55*smooth(.75,1,t));p.push(t*.235,Math.cos(a)*height-t*.012,Math.sin(a)*width);uv.push(t,j/sides);if(i<rings&&j<sides){const k=i*(sides+1)+j,n=k+sides+1;ix.push(k,k+1,n,k+1,n+1,n);}}
  const center=p.length/3;p.push(.235,-.012,0);uv.push(1,.5);for(let j=0;j<sides;j++)ix.push(center,rings*(sides+1)+j+1,rings*(sides+1)+j);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function featherPatch(length,width,curve=.012){
  const p=[],uv=[],ix=[],rows=12,columns=6;
  for(let i=0;i<=rows;i++)for(let j=0;j<=columns;j++){const t=i/rows,v=j/columns*2-1,profile=Math.pow(Math.sin(Math.PI*t),.62);p.push(-length*t,width*profile*v,curve*Math.sin(Math.PI*t)*(1-v*v)+.006*t*t);uv.push(t*2.1,(v+1)*.5);if(i<rows&&j<columns){const k=i*(columns+1)+j,n=k+columns+1;ix.push(k,k+1,n,k+1,n+1,n);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function combine(parts){const p=[],n=[],uv=[];for(const part of parts){const g=part.geometry.toNonIndexed();g.applyMatrix4(part.matrix);p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);g.dispose();}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;}
function plumageTexture(){
  const size=256,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const row=Math.floor(y/32),localY=(y%32)/32,localX=((x+row*17)%48)/48;const barb=Math.sin((localX-.5)*96+Math.abs(localY-.5)*48)*.024,quill=Math.exp(-Math.pow((localX-.5)*35,2))*.065,down=Math.sin(x*2.173+y*1.113)*.009+Math.sin(x*.723-y*2.19)*.008;const v=Math.round(clamp(.55+barb+quill+down,0,1)*255),k=(y*size+x)*4;data[k]=data[k+1]=data[k+2]=v;data[k+3]=255;}
  const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
}
const skinHelpers=/*glsl*/`
attribute vec2 duckSkin;
uniform vec4 duckPose;
vec3 duckRotZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
vec3 duckRotY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 duckDeform(vec3 p){vec3 h=vec3(.46,.73,0.);vec3 b=vec3(.30,.36,0.);p=h+duckRotY(duckRotZ(p-h,duckPose.z*duckSkin.y),duckPose.w*duckSkin.y);return b+duckRotY(duckRotZ(p-b,duckPose.x*duckSkin.x),duckPose.y*duckSkin.x);}
vec3 duckDeformNormal(vec3 n){n=duckRotY(duckRotZ(n,duckPose.z*duckSkin.y),duckPose.w*duckSkin.y);return duckRotY(duckRotZ(n,duckPose.x*duckSkin.x),duckPose.y*duckSkin.x);}
`;

/** Continuous feathered anatomy, articulated soft skin, independent swim behavior. */
export function createDuck3D({onEvent=()=>{},dockAvoidance=true}={}){
  const insidePond=point=>constrainPond(point,dockAvoidance);
  const object3D=new THREE.Group();object3D.name='Pekin duck — sculpted continuous anatomy';object3D.userData.duck=true;const bodyRig=new THREE.Group();object3D.add(bodyRig);
  const materials=new Set(),geometries=new Set(),textures=new Set();const mat=options=>{const m=new THREE.MeshPhysicalMaterial({roughness:.72,metalness:0,...options});materials.add(m);return m;};const geometry=g=>{geometries.add(g);return g;};
  const bump=plumageTexture();textures.add(bump);
  const white=mat({color:'#eeeadd',roughness:.87,bumpMap:bump,bumpScale:.009,sheen:.25,sheenRoughness:.84,sheenColor:'#f4e9d2'});
  const feather=mat({color:'#e9e5d9',roughness:.88,bumpMap:bump,bumpScale:.008,side:THREE.DoubleSide,sheen:.3,sheenRoughness:.85,sheenColor:'#fff1dd'});
  const orange=mat({color:'#c87d25',roughness:.44,clearcoat:.08,clearcoatRoughness:.4}),lowerOrange=mat({color:'#ad6320',roughness:.57}),dark=mat({color:'#20130d',roughness:.34}),black=mat({color:'#080807',roughness:.075,clearcoat:1,clearcoatRoughness:.06}),warm=mat({color:'#dbd4c4',roughness:.9,bumpMap:bump,bumpScale:.006});
  const sphere=geometry(new THREE.SphereGeometry(1,24,16));
  function mesh(parent,g,m,name,p=[0,0,0],s=[1,1,1]){const item=new THREE.Mesh(g,m);item.name=name;item.position.set(...p);item.scale.set(...s);item.castShadow=true;item.receiveShadow=true;parent.add(item);return item;}
  const body=mesh(bodyRig,geometry(sculptedBody()),white,'Continuous body, shoulder, neck and head');const pose={value:new THREE.Vector4()};
  function skinShader(shader){shader.uniforms.duckPose=pose;shader.vertexShader=skinHelpers+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed=duckDeform(transformed);');shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=duckDeformNormal(objectNormal);');}
  white.onBeforeCompile=skinShader;white.customProgramCacheKey=()=> 'pond-duck-soft-skin-v4';const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});depth.onBeforeCompile=skinShader;depth.customProgramCacheKey=()=> 'pond-duck-soft-depth-v4';materials.add(depth);body.customDepthMaterial=depth;body.frustumCulled=false;
  const wings=[],featherTemplate=featherPatch(.39,.038);geometries.add(featherTemplate);
  for(const side of [-1,1]){const wing=new THREE.Group();wing.position.set(-.03,.285,side*.265);bodyRig.add(wing);wings.push(wing);const parts=[];for(let row=0;row<3;row++)for(let i=0;i<7;i++){const x=.18-i*.033-row*.025,y=.125-row*.062-i*.007,z=side*(.008+Math.sin(i/6*Math.PI)*.012+row*.008);const matrix=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(side<0?Math.PI:0,side*.04,.15+row*.04+i*.013)),new THREE.Vector3(1-row*.12,.97-row*.06,1));parts.push({geometry:featherTemplate,matrix});}mesh(wing,geometry(combine(parts)),feather,'Overlapping flight feathers');}
  const tail=new THREE.Group();tail.position.set(-.43,.295,0);bodyRig.add(tail);const tailTemplate=featherPatch(.26,.033,.009);geometries.add(tailTemplate);const tailParts=[];for(let i=0;i<7;i++)tailParts.push({geometry:tailTemplate,matrix:new THREE.Matrix4().compose(new THREE.Vector3(-.015,0,(i-3)*.033),new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,-(i-3)*.045,-.16)),new THREE.Vector3(1-Math.abs(i-3)*.045,1,1))});mesh(tail,geometry(combine(tailParts)),feather,'Rounded tail feather fan');
  const neckRig=new THREE.Group();neckRig.position.set(.30,.36,0);bodyRig.add(neckRig);const headRig=new THREE.Group();headRig.position.set(.16,.37,0);neckRig.add(headRig);
  mesh(headRig,geometry(billGeometry()),orange,'Upper bill',[.14,-.041,0]);const jaw=new THREE.Group();jaw.position.set(.14,-.061,0);headRig.add(jaw);mesh(jaw,geometry(billGeometry(true)),lowerOrange,'Articulated lower bill');
  const eyes=[],lids=[];for(const side of [-1,1]){mesh(headRig,sphere,warm,'Soft eye rim',[.04,.055,side*.143],[.027,.026,.012]);eyes.push(mesh(headRig,sphere,black,'Glossy dark eye',[.045,.058,side*.152],[.019,.020,.010]));const lid=mesh(headRig,sphere,warm,'Blinking eyelid',[.045,.058,side*.158],[.021,.001,.010]);lid.visible=false;lids.push(lid);mesh(headRig,sphere,dark,'Bill nostril',[.226,-.017,side*.046],[.012,.0035,.005]);}
  const feet=[];const footShape=new THREE.Shape();footShape.moveTo(-.018,0);footShape.lineTo(.115,-.07);footShape.quadraticCurveTo(.165,-.04,.13,-.01);footShape.lineTo(.18,.015);footShape.quadraticCurveTo(.165,.045,.13,.04);footShape.lineTo(.11,.08);footShape.lineTo(-.018,.014);footShape.closePath();const footGeometry=geometry(new THREE.ExtrudeGeometry(footShape,{depth:.007,bevelEnabled:true,bevelSize:.004,bevelThickness:.003,bevelSegments:2,steps:1,curveSegments:4}));for(const side of [-1,1]){const foot=new THREE.Group();foot.position.set(-.06,-.075,side*.16);bodyRig.add(foot);const web=mesh(foot,footGeometry,lowerOrange,'Webbed paddling foot');web.rotation.x=-Math.PI/2;feet.push(foot);}

  const state={x:-1,z:.7,heading:0,speed:0,behavior:'rest',time:0,clock:0,entered:0,stopAt:3.2,target:{x:1.7,z:.4},motion:true,wind:.3};
  let seed=8217,disposed=false,action=null,wakeClock=0,stroke=0,turnRate=0,driftYaw=0,blinkAt=3.8,blinkStart=-10,lookAt=0,lookTarget=0,lookUntil=1.4,tailAt=6.7;
  let neckPitch=0,neckYaw=0,headPitch=0,headYaw=0,floatHeight=.08,floatPitch=0,floatRoll=0,surfaceSampler=null;
  const lastEvents=new Map();const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function emit(type,strength=.5,x=state.x,z=state.z){const gap=type==='quack'?1.8:type==='wake'?.22:.28;if(state.clock-(lastEvents.get(type)??-99)<gap)return;lastEvents.set(type,state.clock);onEvent({type,x,z,strength:clamp(strength,0,1),heading:state.heading,speed:state.speed});}
  function enter(behavior,duration=0){state.behavior=behavior;state.entered=state.time;state.stopAt=state.time+duration;}
  function roam(){state.target=insidePond({x:state.x+(random()>.5?1:-1)*(1.2+random()*2),z:-1.5+random()*3});enter('cruise');}
  function interact(kind='call',point=null){if(disposed)return;state.target=insidePond(point||(kind==='call'?{x:state.x<0?.7:-.65,z:1.55}:{x:state.x+.6,z:state.z+.15}));action={type:kind==='call'?'call':kind==='feed'?'feed':'water',at:state.time,sounded:kind!=='call',arrived:false};enter(kind==='call'?'respond':'approach');if(kind==='feed')emit('splash',.24,state.target.x,state.target.z);if(!state.motion){if(kind==='call')emit('quack',.55);action=null;enter('rest',3);}}
  function sample(x,z){if(surfaceSampler){const value=surfaceSampler(x,z);if(Number.isFinite(value))return value;}return .08+.004*Math.sin(x*2.3+state.time*1.3)+.003*Math.sin(z*3.7-state.time*1.7);}
  function update(delta,{motion=true,wind=.3}={}){
    if(disposed)return false;const dt=clamp(Number(delta)||0,0,.1);state.clock+=dt;state.wind=clamp(Number(wind)||0,0,1);state.motion=Boolean(motion);if(!state.motion){state.speed=0;action=null;if(state.behavior==='respond')enter('rest',2);return false;}state.time+=dt;const t=state.time;
    if(action?.type==='call'){const age=t-action.at;if(age>=.5&&!action.sounded){emit('quack',.7);action.sounded=true;}if(age>=1.3&&state.behavior==='respond')enter('approach');}
    if(state.behavior==='rest'&&t>=state.stopAt){const r=random();if(r>.89)enter('preen',3.6);else if(r>.70)enter('forage',3.1);else roam();}
    if((state.behavior==='forage'||state.behavior==='preen')&&t>=state.stopAt){action=null;enter('rest',2+random()*3.7);}
    const swimming=state.behavior==='cruise'||state.behavior==='approach';const dx=state.target.x-state.x,dz=state.target.z-state.z,distance=Math.hypot(dx,dz),desired=Math.atan2(dz,dx),turn=angleDelta(state.heading,desired);let targetSpeed=0,targetTurn=0;
    if(swimming){const pathBias=Math.sin(t*.37+state.entered)*.06*clamp(distance-.5,0,1);targetTurn=clamp((turn+pathBias)*1.7,-.9,.9);const thrust=.94+.06*Math.sin(stroke*2+.2);targetSpeed=(state.behavior==='approach'?.45:.28)*smooth(.04,.7,distance)*(.22+.78*Math.max(0,Math.cos(turn)))*thrust;if(distance<.10){if(action&&!action.arrived){emit('arrive',.35);action.arrived=true;}if(action?.type==='feed'){enter('forage',3.1);emit('splash',.22);}else{action=null;enter('rest',2.8+random()*4.8);}targetSpeed=0;targetTurn=0;}}
    turnRate=damp(turnRate,targetTurn,3.2,dt);state.heading+=turnRate*dt;state.speed=damp(state.speed,targetSpeed,targetSpeed>state.speed?1.5:2.2,dt);
    const oldX=state.x,oldZ=state.z,next=insidePond({x:state.x+Math.cos(state.heading)*state.speed*dt,z:state.z+Math.sin(state.heading)*state.speed*dt});state.x=next.x;state.z=next.z;if(Math.hypot(state.x-oldX,state.z-oldZ)<state.speed*dt*.05&&state.speed>.04){state.speed*=.85;if(distance>.2)state.target=insidePond({x:state.x-.65,z:state.z+.25});}
    stroke+=dt*(3.4+state.speed*5.4);wakeClock+=dt;if(state.speed>.05&&wakeClock>.34-.12*clamp(state.speed/.45,0,1)){wakeClock=0;emit('wake',.12+state.speed*.8,state.x-Math.cos(state.heading)*.52,state.z-Math.sin(state.heading)*.52);}
    const age=t-state.entered,callAge=action?.type==='call'?t-action.at:-1,respond=state.behavior==='respond'?Math.sin(clamp(age/1.3,0,1)*Math.PI):0,forage=state.behavior==='forage'?Math.sin(clamp(age/3.1,0,1)*Math.PI)**2:0,preen=state.behavior==='preen'?Math.sin(clamp(age/3.6,0,1)*Math.PI)**2:0;
    if(t>lookUntil){lookTarget=(random()-.5)*.22;lookUntil=t+1.7+random()*3.9;}lookAt=damp(lookAt,lookTarget,1.8,dt);const targetLook=swimming?clamp(turn,-.6,.6)*.24:lookAt;
    neckPitch=damp(neckPitch,respond*.11-forage*.88+preen*.09,6,dt);neckYaw=damp(neckYaw,targetLook+respond*.18+preen*.92,4,dt);headPitch=damp(headPitch,-forage*.37-preen*.55+respond*.045,6,dt);headYaw=damp(headYaw,preen*.62+lookAt*.32,4,dt);pose.value.set(neckPitch,neckYaw,headPitch,headYaw);neckRig.rotation.set(0,neckYaw,neckPitch,'XYZ');headRig.rotation.set(0,headYaw,headPitch,'XYZ');
    const mouth=callAge>.43&&callAge<.82?Math.sin((callAge-.43)/.39*Math.PI):0;jaw.rotation.z=-mouth*.24;
    if(t>=blinkAt){blinkStart=t;blinkAt=t+3.2+random()*5.3;}const blink=clamp(1-Math.abs(t-blinkStart-.085)/.085,0,1);eyes.forEach((eye,i)=>{eye.scale.y=.020*(1-blink*.92);lids[i].visible=blink>.08;lids[i].scale.y=.021*blink;});
    const effort=clamp(state.speed/.32,0,1);feet.forEach((foot,i)=>{const a=stroke+i*Math.PI,push=Math.sin(a);foot.position.x=-.06+push*.095*effort;foot.position.y=-.075-(.5+.5*Math.cos(a))*.055*effort;foot.rotation.z=Math.cos(a)*.48*effort;});
    const tailPulse=t>tailAt?Math.sin((t-tailAt)*19)*Math.exp(-(t-tailAt)*4):0;if(t>tailAt+1.4)tailAt=t+7+random()*12;tail.rotation.y=tailPulse*.07;wings.forEach((wing,i)=>{wing.rotation.x=(i?1:-1)*(preen*.065+Math.sin(stroke)*effort*.003);});
    const hx=Math.cos(state.heading),hz=Math.sin(state.heading),sx=-hz,sz=hx,surface=sample(state.x,state.z),front=sample(state.x+hx*.32,state.z+hz*.32),back=sample(state.x-hx*.32,state.z-hz*.32),right=sample(state.x+sx*.23,state.z+sz*.23),left=sample(state.x-sx*.23,state.z-sz*.23);
    floatHeight=damp(floatHeight,surface,5.5,dt);floatPitch=damp(floatPitch,clamp(Math.atan2(front-back,.64),-.07,.07),4,dt);floatRoll=damp(floatRoll,clamp(Math.atan2(left-right,.46),-.065,.065),4,dt);driftYaw=damp(driftYaw,-turnRate*effort*.035,4,dt);object3D.position.set(state.x,floatHeight,state.z);object3D.rotation.y=-state.heading;bodyRig.rotation.z=floatPitch+Math.sin(stroke)*effort*.0035;bodyRig.rotation.x=floatRoll+driftYaw;return true;
  }
  object3D.position.set(state.x,.08,state.z);
  function getState(){const actionTime=action?Math.max(0,state.time-action.at):null;let phase=state.behavior;if(!state.motion)phase='paused';else if(state.behavior==='respond')phase=actionTime<.43?'attention':actionTime<.82?'quack':'ready-to-swim';else if(state.behavior==='approach'||state.behavior==='cruise')phase=Math.abs(angleDelta(state.heading,Math.atan2(state.target.z-state.z,state.target.x-state.x)))>.35?'turning':'swimming';return{x:state.x,z:state.z,heading:state.heading,speed:state.speed,behavior:state.behavior,phase,clock:state.clock,animationTime:state.time,actionTime,target:{...state.target},motion:state.motion};}
  function dispose(){if(disposed)return;disposed=true;action=null;lastEvents.clear();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());object3D.removeFromParent();}
  return{object3D,update,interact,getState,setSurfaceSampler(fn){surfaceSampler=typeof fn==='function'?fn:null;},dispose};
}
