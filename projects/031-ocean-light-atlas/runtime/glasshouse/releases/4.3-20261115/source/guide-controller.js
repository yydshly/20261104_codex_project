import * as THREE from 'three';
import { createGuideAvatar } from './guide-avatar.js';
import { groundHeight } from './coast.js';
import { connectToRoute, moveOnSurface, onStairs, rootHeight } from './walk-surface.js';
import { createMovementInput } from './movement-input.js';
import { createLocomotion } from './locomotion.js';
import { rockClearance, STAIR_GAIT } from './scene-layout.js';
import { guideFrame, PORTRAIT_FRAME, PORTRAIT_DETAILS } from './scene-shots.js';
import { ROCK_SEAT, seatMotion, smooth } from './rock-seat.js';
import { ROOM_SEAT, SOFA_SEAT, nearbySeat, nearestSofaSeat } from './seats.js';
import { orbitOffset } from './camera-motion.js';

const $=id=>document.getElementById(id);
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
const ground=(x,z)=>v(x,groundHeight(x,z)+.016,z);
const nodes={
  deck:v(-1.25,1.413,6.7),entry:v(-3.15,1.413,6.7),threshold:v(-3.15,1.55,6.15),hall:v(-3.15,1.55,5.4),corridor:v(-3.15,1.55,3.45),inside:v(-3.15,1.55,1.75),chair:v(-2.12,1.55,3.45),sofaPass:v(-6.75,1.55,5.50),sofaMiddle:v(-6.80,1.55,2.90),sofaNorth:v(-6.80,1.55,1.40),sofaApproach:v(SOFA_SEAT.approach.x,1.55,SOFA_SEAT.approach.z),
  stairTop:v(-1.5,1.413,7.2),step1:v(-1.5,1.22,7.9),step2:v(-1.5,.99,8.52),step3:v(-1.5,.76,9.14),step4:v(-1.5,.53,9.76),landing:ground(-1.5,10.8),beachApproach:ground(1.1,10.8),beach:ground(1.5,9.7),tide:ground(3.5,7.7),rockPass:ground(2.0,10.5),rockApproach:ground(ROCK_SEAT.approach.x,ROCK_SEAT.approach.z)
};
const links=[['deck','entry'],['entry','threshold'],['threshold','hall'],['hall','corridor'],['hall','sofaPass'],['sofaPass','sofaApproach'],['sofaApproach','sofaMiddle'],['sofaMiddle','sofaNorth'],['inside','sofaNorth'],['corridor','inside'],['corridor','chair'],['deck','stairTop'],['stairTop','step1'],['step1','step2'],['step2','step3'],['step3','step4'],['step4','landing'],['landing','beachApproach'],['beachApproach','beach'],['beach','tide'],['beachApproach','rockPass'],['rockPass','rockApproach']];
const stops={
  shore:{node:'deck',name:'露台 · 夕阳碎金',caption:'先在露台停一下。留意金色反光怎样被波峰打碎。',camera:v(...guideFrame('shore').position),target:v(...guideFrame('shore').target),fov:guideFrame('shore').fov,effectYaw:2.55},
  inside:{node:'inside',name:'屋内 · 天花水光',caption:'抬头看看天花，水光会随着海面缓慢移动。',camera:v(-6.5,3.0,4.55),target:v(-1.9,3.0,1.40),fov:67,effectYaw:-2.95},
  tide:{node:'tide',name:'岸边 · 透光薄浪',caption:'在湿沙边停下，观察浪唇前倾和碎沫退去的变化。',camera:v(...guideFrame('tide').position),target:v(...guideFrame('tide').target),fov:guideFrame('tide').fov,effectYaw:2.55},
  sofaSeat:{node:'sofaApproach',name:'屋内 · 沙发',caption:'坐在沙发上，让海风和水光陪你歇一会儿。',camera:v(-6.1,2.85,5.45),target:v(-7.95,2.25,4.3),fov:52,effectYaw:SOFA_SEAT.yaw},
  roomSeat:{node:'chair',name:'屋内 · 扶手椅',caption:'坐进扶手椅，让海光慢慢经过房间。',camera:v(-.95,2.8,2.4),target:v(-2.12,2.25,4.45),fov:50,effectYaw:ROOM_SEAT.yaw},
  rock:{node:'rockApproach',name:'海边 · 坐在岩石上',caption:'在这里坐一会儿，听海浪慢慢靠近。',camera:v(-.5,2.25,12.8),target:v(5,1,5.4),fov:48,effectYaw:ROCK_SEAT.yaw}
};
function shortest(from,to){
  const distances=Object.fromEntries(Object.keys(nodes).map(k=>[k,Infinity])),previous={},open=new Set(Object.keys(nodes));distances[from]=0;
  while(open.size){const a=[...open].sort((x,y)=>distances[x]-distances[y])[0];open.delete(a);if(a===to)break;
    for(const edge of links){if(!edge.includes(a))continue;const b=edge[0]===a?edge[1]:edge[0],d=distances[a]+nodes[a].distanceTo(nodes[b]);if(d<distances[b]){distances[b]=d;previous[b]=a;}}
  }
  const path=[to];while(path[0]!==from){if(!previous[path[0]])throw new Error('No safe guide route');path.unshift(previous[path[0]]);}return path;
}
function nearest(position){return Object.keys(nodes).sort((a,b)=>nodes[a].distanceToSquared(position)-nodes[b].distanceToSquared(position))[0];}

export async function createGuideExperience({scene,camera,controls,canvas,doors,onStop=()=>{},notice=()=>{},avatarFactory=createGuideAvatar,onInteraction=()=>{}}){
  const portraitDetail=PORTRAIT_DETAILS[new URLSearchParams(location.search).get('portrait')];
  const portraitStill=new URLSearchParams(location.search).get('pose')==='still';
  const stairReview=new URLSearchParams(location.search).get('stairs')==='review';
  const cinematicMode=new URLSearchParams(location.search).has('seaside');
  document.body.classList.toggle('stair-review-mode',stairReview);
  const avatar=await avatarFactory({onChange:info=>{
    if(info.outfit){document.querySelectorAll('[data-outfit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.outfit===info.outfit)));}
    if(info.action)$('guide-motion').textContent={Idle:'放松站立',Walk:'正在行走',Wave:'挥手招呼',Point:'向景色示意',LookAround:'转头看海',SitDown:'正在坐下',SitIdle:'坐着看海',StandUp:'正在起身'}[info.action]||info.action;
    $('guide-outfit-status').textContent=info.description || (info.loading?'正在换装…':'同一骨骼 · 可动换装');
  }});
  scene.add(avatar.root);avatar.root.position.copy(nodes.deck);
  if(avatar.manifest){canvas.dataset.guideAsset=avatar.manifest.file;canvas.dataset.guideAssetHash=avatar.manifest.sha256;}
  let cameraMode='follow',phase='idle',currentStop='shore',destination='shore',path=[],segmentStart,segmentFrom,segmentProgress=0;
  let desiredYaw=.71,tour=[],dwell=0,doorAmount=0,lookYaw=0,lookPitch=0,drag;
  let afterStand,published='',telemetryTime=0,controlMode='guide',manualEyeHeading=0,autoSpeed=0;
  let rockVisit=null,seatPose=null,rockTime=0;
  const rockLocked=()=>rockVisit&&['turn','align','lower','watch','rise','exit'].includes(rockVisit.stage);
  function enterRock(stage){
    rockVisit.stage=stage;rockVisit.elapsed=0;phase=`rock-${stage}`;
    rockVisit.duration=rockVisit.seat.durations[stage];
    if(stage==='turn'){
      rockVisit.alignFrom=avatar.root.position.clone();
      if(rockVisit.nearby){const angle=Math.abs(Math.atan2(Math.sin(rockVisit.seat.yaw-avatar.root.rotation.y),Math.cos(rockVisit.seat.yaw-avatar.root.rotation.y)));rockVisit.duration=.18+angle*.18;}
    }
    if(rockVisit.nearby&&['align','exit'].includes(stage))rockVisit.duration=THREE.MathUtils.clamp(avatar.root.position.distanceTo(stage==='align'?v(rockVisit.seat.stand.x,avatar.root.position.y,rockVisit.seat.stand.z):rockVisit.entryFrom)/.55,.28,1.6);
    avatar.play(['align','exit'].includes(stage)?'Walk':'Idle');
    if(stage==='exit')rockVisit.exitFrom=avatar.root.position.clone();
    publish();
  }
  function leaveRock(next){
    if(!rockLocked())return false;
    rockVisit.next=next;
    if(rockVisit.stage!=='rise'&&rockVisit.stage!=='exit')rockVisit.startPose=seatPose?{...seatPose}:null;
    rockVisit.startAmount=seatPose?.amount||0;
    if(rockVisit.stage!=='rise'&&rockVisit.stage!=='exit')enterRock(seatPose?'rise':'exit');
    return true;
  }
  function startRockVisit({autoReturn=true,approachOnly=false,seat=ROCK_SEAT,nearby=false}={}){
    if(!avatar.supportsSeating||rockVisit)return;
    onInteraction();if(controlMode==='manual')setControlMode('guide');
    rockVisit={stage:'walking-out',elapsed:0,startAmount:1,autoReturn,approachOnly,seat,nearby,entryFrom:avatar.root.position.clone()};seatPose=null;document.body.classList.add('rock-visit');
    setCameraMode('follow');if(nearby){currentStop=seat.stop||'rock';destination=currentStop;enterRock('turn');}else navigate(seat.stop||'rock',{automatic:true});publish();
  }
  function userSit(){
    if(rockVisit||!avatar.supportsSeating)return;
    const seat=nearbySeat(avatar.root.position);
    if(!seat){notice('先走近沙发、扶手椅或岩石正面，再按 E 坐下');return;}
    startRockVisit({autoReturn:false,seat,nearby:true});
  }
  function userStand(){
    onInteraction();leaveRock(()=>setControlMode('manual',{keepCamera:true}));
  }
  const locomotion=createLocomotion();
  const manualAvailable=typeof avatar.placeFeet==='function';
  const input=manualAvailable?createMovementInput({onIntent:()=>{
    if(controlMode!=='manual')setControlMode('manual',{keepCamera:true});
    if(cameraMode==='portrait'||cameraMode==='free')setCameraMode('follow');onInteraction();
    if(controlMode==='manual'){
      canvas.dataset.guideInputAt=String(performance.now());
      if(phase!=='manual-walking'){phase='manual-walking';avatar.play('Walk',{fade:.10});publish();}
    }
  }}):null;
  avatar.root.rotation.y=desiredYaw;
  const desiredPosition=v(),desiredTarget=v(),eye=v(),direction=v(),manualFollowOffset=v(3,1.1,3.5);
  function publish(){
    const near=nearbySeat(avatar.root.position);
    const key=[phase,currentStop,destination,cameraMode,avatar.action,avatar.outfit,controlMode,rockVisit?.stage,rockVisit?.seat.id,near?.id,near?.slot].join('|');if(key===published)return;published=key;
    const betweenStops=avatar.root.position.distanceTo(nodes[stops[currentStop].node])>.6;
    $('guide-destination').textContent=phase==='walking'?`正在前往 ${stops[destination]?.name||'座椅'}`:phase==='sitting'?'坐在屋内看海':betweenStops?'途中 · 已停下':stops[currentStop].name;
    $('guide-caption-text').textContent=phase==='walking'?'跟上向导。你也可以拖动视角，改为自由环视。':phase==='sitting'?'在这里坐一会儿，看海光慢慢进入房间。':betweenStops?'选择一个地点，可以继续带路。':stops[currentStop].caption;
    canvas.dataset.guideAction=avatar.action;canvas.dataset.guideOutfit=avatar.outfit;canvas.dataset.guidePhase=phase;
    canvas.dataset.guideStop=currentStop;canvas.dataset.guideCamera=cameraMode;
    canvas.dataset.controlMode=controlMode;
    if($('rock-start')){
      if(rockLocked())$('guide-motion').textContent=({turn:'准备坐下',align:'调整脚步',lower:'慢慢坐下',watch:'坐着休息',rise:'正在起身',exit:'离开座椅'})[rockVisit.stage];
      $('rock-start').disabled=!!rockVisit;$('rock-return').hidden=!rockVisit;
      $('rock-approach').hidden=!!rockVisit||near===ROCK_SEAT;$('room-approach').hidden=!!rockVisit||near===ROOM_SEAT;$('sofa-approach').hidden=!!rockVisit||near?.kind==='sofa';$('rock-manual').hidden=!!rockVisit||controlMode==='manual';
      $('rock-sit').hidden=!!rockVisit||(!near&&controlMode!=='manual');$('rock-sit').disabled=!near;
      $('rock-sit').textContent=near?.indoor?`在${near.name}坐下 · E`:'坐下 · E';
      $('rock-stand').hidden=!rockVisit||!['lower','watch'].includes(rockVisit.stage);
      $('rock-caption').textContent=rockVisit?({ 'walking-out':rockVisit.seat.indoor?`走到室内${rockVisit.seat.name}旁`:'沿露台走到海边',turn:rockVisit.seat.indoor?'转身，准备坐下':'转向海面',align:'调整脚步，靠近坐面',lower:'慢慢坐下',watch:rockVisit.autoReturn?'坐一会儿，听海 · E 可起身':'坐多久，由你决定 · 按 E 起身',rise:'重心前移，起身',exit:'离开坐面','walking-back':'走回露台' }[rockVisit.stage]||''):near?`${near.indoor?near.name:'岩石'}就在身旁 · 点「坐下」或按 E`:controlMode==='manual'?'走近沙发、扶手椅或岩石正面 · E 坐下':'选择沙发、扶手椅或海边岩石，自己决定坐多久。';
    }
    const shot=cameraMode==='portrait'?'portrait':['shore','tide'].includes(destination)?destination:'';
    document.querySelectorAll('[data-shot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shot===shot)));
    if(controlMode==='manual'){
      $('guide-destination').textContent=phase==='manual-walking'?'自己走动 · 正在行走':'自己走动 · 已停下';
      $('guide-caption-text').textContent='WASD / 方向键移动 · 拖动环视 · 选择地点可恢复带路';
    }
  }
  function setControlMode(mode,{keepCamera=false}={}){
    if(!manualAvailable)return;
    onInteraction();
    if(leaveRock(()=>setControlMode(mode,{keepCamera:true})))return;
    if(rockVisit){rockVisit=null;seatPose=null;document.body.classList.remove('rock-visit');}
    controlMode=mode;input.clear();locomotion.reset();autoSpeed=0;tour=[];path=[];phase='idle';avatar.play('Idle');
    document.body.classList.toggle('manual-mode',mode==='manual');
    document.querySelectorAll('button[data-control-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.controlMode===mode)));
    if(mode==='manual'){
      if(keepCamera)manualFollowOffset.copy(camera.position).sub(controls.target);
      onInteraction();setCameraMode('follow');
      if(!keepCamera){const offset=camera.position.clone().sub(avatar.root.position);offset.y=0;offset.normalize().multiplyScalar(4.2);offset.y=2.2;
      camera.position.copy(avatar.root.position).add(offset);controls.target.copy(avatar.root.position).add(v(0,1.1,0));controls.update();}
      manualFollowOffset.copy(camera.position).sub(controls.target);
      if(innerWidth<700){$('panel').classList.add('collapsed');$('toggle-panel').setAttribute('aria-expanded','false');document.body.classList.remove('panel-open');}
      notice('现在由你控制人物：WASD / 方向键移动，拖动调整视角');
    }
    publish();
  }
  function setCameraMode(mode){
    const previousMode=cameraMode;
    if(mode==='portrait'&&(phase==='walking'||phase==='manual-walking')){
      rockVisit=null;document.body.classList.remove('rock-visit');
      tour=[];path=[];input?.clear();locomotion.reset();autoSpeed=0;phase='idle';avatar.play('Idle');
    }
    if(controlMode==='manual'&&previousMode==='follow'&&mode!=='follow')manualFollowOffset.copy(camera.position).sub(controls.target);
    cameraMode=mode;controls.enabled=mode!=='eye';lookYaw=lookPitch=0;
    if(controlMode==='manual'&&mode==='follow'&&previousMode!=='follow'){
      controls.target.copy(avatar.root.position).add(v(0,1.1,0));camera.position.copy(controls.target).add(manualFollowOffset);controls.update();
    }
    if(mode==='eye')manualEyeHeading=desiredYaw;
    document.querySelectorAll('[data-guide-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guideCamera===mode)));
    if(mode==='eye'&&controlMode!=='manual')desiredYaw=stops[currentStop].effectYaw;
    if(mode==='portrait')desiredYaw=Math.atan2(PORTRAIT_FRAME.offset[0],PORTRAIT_FRAME.offset[2]);
    $('guide-camera-note').textContent=mode==='eye'?'拖动改变视线 · WASD可控制行走':mode==='free'?'自由拖动与缩放 · 点击跟随返回向导':mode==='portrait'?'近看人物与衣服 · 拖动可自由检查':controlMode==='manual'?'WASD / 方向键移动 · 拖动环视':'移动时跟随人物 · 停下时看向景色';publish();
  }
  function arrive(){
    autoSpeed=0;
    if(['rock','roomSeat','sofaSeat'].includes(destination)&&rockVisit){
      currentStop=destination;desiredYaw=rockVisit.seat.yaw;
      if(rockVisit.approachOnly){rockVisit=null;document.body.classList.remove('rock-visit');setControlMode('manual',{keepCamera:true});publish();return;}
      enterRock('turn');return;
    }
    if(destination==='shore'&&rockVisit?.stage==='walking-back'){
      rockVisit=null;document.body.classList.remove('rock-visit');seatPose=null;
      currentStop='shore';phase='idle';avatar.play('Idle');desiredYaw=stops.shore.effectYaw;notice('回到露台了。还可以再去海边坐一会儿。');onStop('shore');publish();return;
    }
    if(destination==='chair'){
      currentStop='inside';phase='sitting';desiredYaw=Math.PI;avatar.play('SitDown');
    }else{
      currentStop=destination;phase='gesture';desiredYaw=stops[currentStop].effectYaw;avatar.play('Point');
    }
    dwell=0;onStop(currentStop);publish();
  }
  function startPath(stop){
    destination=stop;const target=stop==='chair'?'chair':stop==='sofaSeat'&&rockVisit?rockVisit.seat.node:stops[stop].node,from=nearest(avatar.root.position);
    path=shortest(from,target).map(id=>({id,point:nodes[id]}));
    if(avatar.root.position.distanceTo(path[0].point)<.04)path.shift();
    else if(manualAvailable&&avatar.root.position.distanceTo(nodes[from])>.4){
      const connector=connectToRoute(avatar.root.position,nodes[from]);
      if(!connector){notice('这里暂时找不到通路，请先走回露台或通道');path=[];return;}
      path=[...connector.map(p=>({id:'connector',point:v(p.x,p.y,p.z)})),...path.slice(1)];
    }
    if(!path.length){arrive();return;}
    segmentFrom=avatar.root.position.clone();segmentStart=nearest(segmentFrom);segmentProgress=0;
    phase='walking';avatar.play('Walk');dwell=0;publish();
  }
  function navigate(stop,{automatic=false}={}){
    if(!automatic)onInteraction();
    if(leaveRock(()=>navigate(stop,{automatic})))return;
    if(!automatic&&rockVisit){rockVisit=null;seatPose=null;document.body.classList.remove('rock-visit');}
    if(controlMode==='manual')setControlMode('guide');
    if(!automatic){tour=[];onInteraction();if(cameraMode==='free')setCameraMode('follow');}
    if(!stops[stop]&&stop!=='chair')return;
    if(phase==='sitting'||avatar.action==='SitIdle'||avatar.action==='SitDown'){
      phase='standing';afterStand=()=>startPath(stop);avatar.play('StandUp');publish();return;
    }
    startPath(stop);
  }
  function doAction(name,{interactive=true}={}){
    if(avatar.supportedActions&&!avatar.supportedActions.has(name))return;
    if(interactive)onInteraction();
    if(leaveRock(()=>doAction(name,{interactive})))return;
    if(rockVisit){rockVisit=null;seatPose=null;document.body.classList.remove('rock-visit');}
    if(interactive)onInteraction();
    tour=[];path=[];input?.clear();locomotion.reset();autoSpeed=0;
    if(name==='SitDown'){navigate('chair');return;}
    if(name==='StandUp'){
      if(phase==='sitting'){phase='standing';afterStand=null;avatar.play('StandUp');publish();}
      return;
    }
    if(phase==='sitting'){phase='standing';afterStand=()=>doAction(name);avatar.play('StandUp');publish();return;}
    phase=name==='Idle'?'idle':'gesture';
    const delta=camera.position.clone().sub(avatar.root.position);
    desiredYaw=controlMode==='manual'&&cameraMode==='eye'?manualEyeHeading+lookYaw:['Point','LookAround'].includes(name)?stops[currentStop].effectYaw:Math.atan2(delta.x,delta.z);
    avatar.play(name);publish();
  }
  avatar.onFinished(name=>{
    if(name==='SitDown'){avatar.play('SitIdle');phase='sitting';}
    else if(name==='StandUp'){avatar.play('Idle');phase='idle';const next=afterStand;afterStand=null;next?.();}
    else if(['Wave','Point','LookAround'].includes(name)){
      avatar.play('Idle');phase='idle';dwell=0;
      if(cameraMode!=='eye'&&cameraMode!=='portrait'){const d=stops[currentStop].camera.clone().sub(avatar.root.position);desiredYaw=Math.atan2(d.x,d.z);}
    }
    publish();
  });
  document.querySelectorAll('[data-outfit]').forEach(b=>b.addEventListener('click',()=>avatar.setOutfit(b.dataset.outfit).then(publish).catch(e=>{console.error(e);notice('换装暂未完成，请重试');})));
  document.querySelectorAll('button[data-guide-action]').forEach(b=>b.addEventListener('click',()=>doAction(b.dataset.guideAction)));
  document.querySelectorAll('button[data-control-mode]').forEach(b=>b.addEventListener('click',()=>setControlMode(b.dataset.controlMode)));
  document.querySelectorAll('[data-guide-camera]').forEach(b=>b.addEventListener('click',()=>setCameraMode(b.dataset.guideCamera)));
  $('guide-portrait').addEventListener('click',()=>setCameraMode('portrait'));
  document.querySelectorAll('[data-shot]').forEach(button=>button.addEventListener('click',()=>{
    if(button.dataset.shot==='portrait'){setCameraMode('portrait');return;}
    setCameraMode('follow');navigate(button.dataset.shot);
  }));
  $('guide-tour').addEventListener('click',()=>{onInteraction();if(controlMode==='manual')setControlMode('guide');tour=['inside','tide','shore'];setCameraMode('follow');navigate(tour.shift(),{automatic:true});notice('向导将带你看屋内水光、近岸薄浪与露台夕阳');});
  if($('rock-visit')){
    $('rock-visit').hidden=!avatar.supportsSeating;
    $('rock-start').addEventListener('click',()=>startRockVisit());
    $('rock-approach').addEventListener('click',()=>startRockVisit({autoReturn:false,approachOnly:true}));
    $('sofa-approach').addEventListener('click',()=>startRockVisit({autoReturn:false,approachOnly:true,seat:nearestSofaSeat(avatar.root.position)}));
    $('room-approach').addEventListener('click',()=>startRockVisit({autoReturn:false,approachOnly:true,seat:ROOM_SEAT}));
    $('rock-manual').addEventListener('click',()=>setControlMode('manual'));
    $('rock-sit').addEventListener('click',userSit);$('rock-stand').addEventListener('click',userStand);
    $('rock-return').addEventListener('click',()=>{onInteraction();if(!leaveRock(()=>navigate('shore')))navigate('shore');});
    addEventListener('keydown',event=>{
      if(event.code!=='KeyE'||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.isComposing||event.target.closest?.('input,textarea,select,[contenteditable="true"],dialog[open]'))return;
      if(!avatar.supportsSeating)return;
      if(rockVisit&&!['lower','watch'].includes(rockVisit.stage))return;
      event.preventDefault();if(rockVisit)userStand();else userSit();
    });
  }
  $('guide-download').addEventListener('click',()=>{const result=avatar.download();$('guide-download-status').textContent=`已导出 ${result.animations.length} 段动作 · ${(result.bytes/1048576).toFixed(1)} MB`;$('guide-download').dataset.animations=String(result.animations.length);notice('已导出当前服装的骨骼动画 GLB');});
  $('guide-reference').addEventListener('click',()=>$('guide-reference-dialog').showModal());
  $('guide-reference-close').addEventListener('click',()=>$('guide-reference-dialog').close());
  controls.addEventListener('start',()=>{if(controlMode!=='manual'&&cameraMode!=='free'&&cameraMode!=='eye')setCameraMode('free');});
  canvas.addEventListener('pointerdown',e=>{if(cameraMode==='eye'){drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}});
  canvas.addEventListener('pointermove',e=>{if(!drag||cameraMode!=='eye')return;lookYaw-=(e.clientX-drag.x)*.004;lookPitch=THREE.MathUtils.clamp(lookPitch-(e.clientY-drag.y)*.004,-1.1,.9);drag={x:e.clientX,y:e.clientY};});
  canvas.addEventListener('pointerup',()=>drag=null);
  canvas.addEventListener('pointercancel',()=>drag=null);
  document.querySelectorAll('[data-guide-action]').forEach(button=>{if(avatar.supportedActions)button.hidden=!avatar.supportedActions.has(button.dataset.guideAction);});
  document.body.classList.add('with-guide');canvas.dataset.guideReady='true';setCameraMode('follow');doAction(portraitStill?'Idle':'Wave',{interactive:false});
  if(portraitDetail||new URLSearchParams(location.search).get('portrait')==='half')setCameraMode('portrait');
  if(portraitStill)avatar.root.rotation.y=desiredYaw;

  return {root:avatar.root,avatar,navigate,setCameraMode,startRockVisit,get cameraMode(){return cameraMode;},get watchingSea(){return !!seatPose;},
    update(dt,paused=false){
      const step=paused?0:dt;
      avatar.update(step);
      const previousPosition=avatar.root.position.clone();
      let intendedSpeed=0,intendedDirection;
      if(controlMode==='manual'&&!paused){
        const wish=input.read(),movement=v();
        if(wish.x||wish.z){
          const forward=cameraMode==='eye'?v(Math.sin(manualEyeHeading+lookYaw),0,Math.cos(manualEyeHeading+lookYaw)):camera.getWorldDirection(v());forward.y=0;forward.normalize();
          movement.addScaledVector(forward,wish.z).addScaledVector(v(-forward.z,0,forward.x),wish.x).normalize();
          desiredYaw=cameraMode==='eye'?manualEyeHeading+lookYaw:Math.atan2(movement.x,movement.z);
        }
        const stairs=onStairs(avatar.root.position.x,avatar.root.position.z,.15),velocity=locomotion.step(movement.x,movement.z,stairs?.46:.82,step);
        if(step)moveOnSurface(avatar.root.position,velocity.x*step,velocity.z*step);
        const surfaceMove=avatar.root.position.clone().sub(previousPosition);intendedSpeed=step?Math.hypot(surfaceMove.x,surfaceMove.z)/step:0;
        intendedDirection=surfaceMove.clone().setY(0);
        const stairHeld=avatar.constrainStep?.(previousPosition)||false;
        const moved=Math.hypot(avatar.root.position.x-previousPosition.x,avatar.root.position.z-previousPosition.z)>.0001;
        if(moved&&canvas.dataset.guideMotionInput!==canvas.dataset.guideInputAt){canvas.dataset.guideMotionInput=canvas.dataset.guideInputAt;canvas.dataset.guideMotionAt=String(performance.now());}
        if(moved||stairHeld){if(phase!=='manual-walking'){phase='manual-walking';avatar.play('Walk',{fade:.10});}avatar.setWalkSpeed(intendedSpeed,cameraMode==='eye'&&wish.z<0,stairs?STAIR_GAIT.stepDistance*2:null);}
        else if(phase==='manual-walking'){phase='idle';avatar.play('Idle',{fade:.12});}
        if(step)locomotion.blocked(surfaceMove.x,surfaceMove.z,step);
      }
      if(phase==='walking'&&path.length&&step){
        const {id,point:target}=path[0],length=segmentFrom.distanceTo(target);
        const stairs=id.startsWith('step')||segmentStart?.startsWith('step')||onStairs(avatar.root.position.x,avatar.root.position.z);
        let remaining=avatar.root.position.distanceTo(target);for(let i=1;i<path.length;i++)remaining+=path[i-1].point.distanceTo(path[i].point);
        const heading=target.clone().sub(segmentFrom),facing=v(0,0,1).applyQuaternion(avatar.root.quaternion);
        const targetYaw=Math.atan2(heading.x,heading.z),alignment=Math.max(0,Math.cos(targetYaw-Math.atan2(facing.x,facing.z)));
        const targetSpeed=Math.min(stairs?.46:.82,Math.sqrt(2*2.6*remaining))*(.4+.6*alignment);
        autoSpeed=THREE.MathUtils.clamp(targetSpeed,Math.max(0,autoSpeed-3.8*step),autoSpeed+2.6*step);
        avatar.setWalkSpeed(autoSpeed,false,stairs?STAIR_GAIT.stepDistance*2:null);segmentProgress=Math.min(1,segmentProgress+step*autoSpeed/Math.max(.001,length));
        avatar.root.position.lerpVectors(segmentFrom,target,segmentProgress);
        if(['landing','beachApproach','beach','tide'].includes(id)&&['landing','beachApproach','beach','tide'].includes(segmentStart))avatar.root.position.y=groundHeight(avatar.root.position.x,avatar.root.position.z)+.016;
        const d=target.clone().sub(segmentFrom);desiredYaw=Math.atan2(d.x,d.z);
        if(manualAvailable&&onStairs(avatar.root.position.x,avatar.root.position.z))avatar.root.position.y=rootHeight(avatar.root.position.x,avatar.root.position.z)+.004;
        intendedSpeed=step?Math.hypot(avatar.root.position.x-previousPosition.x,avatar.root.position.z-previousPosition.z)/step:0;
        intendedDirection=heading.clone().setY(0);
        if(avatar.constrainStep?.(previousPosition)){
          const dx=target.x-segmentFrom.x,dz=target.z-segmentFrom.z;
          segmentProgress=THREE.MathUtils.clamp(((avatar.root.position.x-segmentFrom.x)*dx+(avatar.root.position.z-segmentFrom.z)*dz)/Math.max(.000001,dx*dx+dz*dz),0,1);
        }
        if(segmentProgress===1){segmentStart=path.shift().id;segmentFrom=target.clone();segmentProgress=0;if(!path.length)arrive();}
      }
      if(phase==='idle'&&tour.length&&!paused){dwell+=step;if(dwell>1.4)navigate(tour.shift(),{automatic:true});}
      rockTime+=step;
      if(rockLocked()){
        const stage=rockVisit.stage,seat=rockVisit.seat,approach=nodes[seat.node||'rockApproach'];rockVisit.elapsed+=step;desiredYaw=seat.yaw;
        const t=Math.min(1,rockVisit.elapsed/rockVisit.duration);
        if(stage==='align'||stage==='exit'){
          const from=stage==='align'?rockVisit.alignFrom:rockVisit.exitFrom;
          const to=stage==='align'?v(seat.stand.x,seat.ground,seat.stand.z):rockVisit.nearby?rockVisit.entryFrom:approach;
          avatar.root.position.lerpVectors(from,to,smooth(t));avatar.root.position.y=seat.indoor?rootHeight(avatar.root.position.x,avatar.root.position.z)+.004:groundHeight(avatar.root.position.x,avatar.root.position.z)+.004;
          intendedSpeed=step?Math.hypot(avatar.root.position.x-previousPosition.x,avatar.root.position.z-previousPosition.z)/step:0;
          avatar.setWalkSpeed(intendedSpeed,stage==='align');
          if(t===1){
            if(stage==='align')enterRock('lower');
            else{
              const next=rockVisit.next;seatPose=null;rockVisit.stage='walking-back';phase='idle';avatar.play('Idle');
              if(next){rockVisit=null;document.body.classList.remove('rock-visit');next();}
              else if(!rockVisit.autoReturn){rockVisit=null;document.body.classList.remove('rock-visit');setControlMode('manual',{keepCamera:true});}
              else navigate('shore',{automatic:true});
            }
          }
        }else if(stage==='turn'){
          if(t===1)enterRock('align');
        }else{
          seatPose={...seatMotion(stage,t,stage==='rise'?rockVisit.startPose:null,seat),time:rockTime,seat};
          if(t===1){
            if(stage==='lower'){rockVisit.startAmount=1;enterRock('watch');}
            else if(stage==='watch'&&rockVisit.autoReturn){rockVisit.startPose={...seatPose};enterRock('rise');}
            else if(stage==='rise'){seatPose=null;enterRock('exit');}
          }
        }
      }
      const q=new THREE.Quaternion().setFromAxisAngle(v(0,1,0),desiredYaw);avatar.root.quaternion.slerp(q,1-Math.exp(-step*7));avatar.root.updateMatrixWorld(true);
      avatar.placeFeet?.({dt:step,moving:phase==='walking'||phase==='manual-walking'||phase==='rock-align'||phase==='rock-exit',heading:desiredYaw,speed:intendedSpeed,direction:intendedDirection,seatPose});
      canvas.dataset.rockVisit=JSON.stringify({stage:rockVisit?.stage||'idle',slot:rockVisit?.seat.slot||nearbySeat(avatar.root.position)?.slot||null,seat:rockVisit?.seat.id||nearbySeat(avatar.root.position)?.id||null,elapsed:Number((rockVisit?.elapsed||0).toFixed(3)),autoReturn:rockVisit?.autoReturn??false,near:!!nearbySeat(avatar.root.position),pose:avatar.seatedSample||null});
      canvas.dataset.guideSpeed=String(Number((controlMode==='manual'?locomotion.speed:autoSpeed).toFixed(3)));
      canvas.dataset.guideViewYaw=String(Number(Math.atan2(camera.getWorldDirection(v()).x,camera.getWorldDirection(v()).z).toFixed(4)));
      canvas.dataset.rockClearance=String(Number(rockClearance(avatar.root.position.x,avatar.root.position.z,undefined,rootHeight(avatar.root.position.x,avatar.root.position.z)).toFixed(4)));
      telemetryTime+=dt;
      if(telemetryTime>.2||stairReview){telemetryTime=0;canvas.dataset.guidePosition=JSON.stringify(avatar.root.position.toArray().map(v=>Number(v.toFixed(3))));canvas.dataset.guideCameraPosition=JSON.stringify(camera.position.toArray().map(v=>Number(v.toFixed(3))));if(avatar.motionSample)canvas.dataset.guidePose=JSON.stringify(avatar.motionSample());if(avatar.footContactSample)canvas.dataset.footContact=JSON.stringify(avatar.footContactSample());}
      const nearDoor=avatar.root.position.z>5.35&&avatar.root.position.z<7.2&&avatar.root.position.x<-2.5;
      doorAmount=THREE.MathUtils.damp(doorAmount,nearDoor?1:0,5,dt);
      doors[0].position.x=THREE.MathUtils.lerp(-6.13,-8.35,doorAmount);doors[1].position.x=THREE.MathUtils.lerp(-3.85,-1.63,doorAmount);
      for(const door of doors)door.position.z=6.18+doorAmount*.055;
      if(cameraMode==='free')controls.update();
      if(cameraMode!=='free'){
        const p=avatar.root.position,forward=v(0,0,1).applyQuaternion(avatar.root.quaternion),right=v(1,0,0).applyQuaternion(avatar.root.quaternion);
        let fov=stops[currentStop].fov;
        if(cameraMode==='eye'){
          avatar.getEyePosition(eye);camera.position.copy(eye);
          const yaw=(controlMode==='manual'?manualEyeHeading:desiredYaw)+lookYaw;
          direction.set(Math.sin(yaw)*Math.cos(lookPitch),Math.sin(lookPitch),Math.cos(yaw)*Math.cos(lookPitch));
          camera.lookAt(eye.clone().add(direction));camera.fov=72;camera.updateProjectionMatrix();
        }else{
          if(controlMode==='manual'&&cameraMode==='follow'){
            const movement=p.clone().sub(previousPosition);camera.position.add(movement);controls.target.add(movement);controls.target.lerp(p.clone().add(v(0,1.1,0)),1-Math.exp(-dt*5));camera.fov=THREE.MathUtils.damp(camera.fov,57,4,dt);camera.updateProjectionMatrix();controls.update();publish();return;
          }else if(cameraMode==='portrait'){
            const frame=portraitDetail||PORTRAIT_FRAME;
            desiredPosition.copy(p).add(v(...frame.offset));desiredTarget.copy(p).add(v(...frame.target));fov=frame.fov;
            if(innerWidth<700&&!portraitDetail){desiredTarget.copy(p).add(v(0,1.24,0));fov=40;}
          }else if(rockLocked()&&rockVisit.seat.kind==='sofa'){
            const contactView=new URLSearchParams(location.search).get('seaside')==='contact';
            desiredPosition.set(...(contactView?[-6.6,2.85,2.4]:[-5.9,2.95,5.6]));desiredTarget.set(SOFA_SEAT.x,2.25,SOFA_SEAT.z);fov=52;
            if(innerWidth<700){desiredPosition.set(...(contactView?[-5.9,3.0,2.4]:[-5.45,3.08,5.95]));fov=58;}
            const seat=rockVisit.seat;
            if(seat.slot!=='south'){
              desiredTarget.z=seat.z;
              desiredPosition.set(...(contactView?[-5.9,3.0,Math.max(.65,seat.z-1.9)]:[-6.3,2.95,seat.z+1.1]));fov=56;
              if(innerWidth<700){desiredPosition.set(...(contactView?[-5.9,3.0,Math.max(.65,seat.z-1.9)]:[-6.15,3.10,seat.z+2.30]));desiredTarget.x=seat.x+.13;fov=60;}
            }
          }else if(rockLocked()&&rockVisit.seat===ROOM_SEAT){
            desiredPosition.set(-1.0,2.8,2.35);desiredTarget.set(ROOM_SEAT.x,2.25,ROOM_SEAT.z);fov=50;
            const contactView=new URLSearchParams(location.search).get('seaside')==='contact';
            if(contactView){desiredPosition.set(-3.65,2.8,3.0);fov=52;}
            // A portrait viewport needs room for both armrests and both shoes,
            // above the persistent sitting controls.
            if(innerWidth<700){desiredPosition.set(...(contactView?[-3.65,2.95,2.2]:[-.95,2.95,1.55]));fov=contactView?60:56;}
          }else if(rockLocked()){
            const sitting=seatPose?.amount||0;
            desiredPosition.set(ROCK_SEAT.x-2.75,ROCK_SEAT.ground+1.95-sitting*.25,ROCK_SEAT.z+2.9);
            desiredTarget.set(ROCK_SEAT.x+1.2,ROCK_SEAT.ground+1.10-sitting*.22,ROCK_SEAT.z-.5);fov=46;
            if(rockVisit.stage!=='watch'||new URLSearchParams(location.search).get('seaside')==='contact'){
              desiredPosition.set(ROCK_SEAT.x-2.7,ROCK_SEAT.ground+1.65,ROCK_SEAT.z-1.3);
              desiredTarget.set(ROCK_SEAT.x+.12,ROCK_SEAT.ground+.85,ROCK_SEAT.z-.12);fov=42;
            }
            if(innerWidth<700){desiredPosition.set(ROCK_SEAT.x-2.3,ROCK_SEAT.ground+1.7,ROCK_SEAT.z+3.5);desiredTarget.set(ROCK_SEAT.x+.15,ROCK_SEAT.ground+.95,ROCK_SEAT.z-.15);fov=54;}
          }else if(phase==='walking'&&rockVisit?.seat.kind==='sofa'&&p.z<7.2){
            desiredPosition.set(-6.0,3.1,5.5);desiredTarget.copy(p).add(v(0,1.0,0));fov=60;
          }else if(phase==='walking'&&rockVisit?.seat===ROOM_SEAT){
            desiredPosition.copy(p).add(v(-.55,1.45,2.5));desiredTarget.copy(p).add(v(0,1.0,0));fov=58;
          }else if(phase==='walking'&&(rockVisit||(cinematicMode&&p.z>7.2))){
            const atStairs=onStairs(p.x,p.z,.5)||p.z<10.5;
            desiredPosition.copy(p).add(atStairs?v(3.8,2.0,3.1):v(-3.0,1.9,3.4));
            desiredTarget.copy(p).add(v(0,1.0,0));fov=52;
          }else if(manualAvailable&&phase==='walking'&&onStairs(p.x,p.z,.3)){
            // Stay outside the pavilion while showing both shoes and risers.
            desiredPosition.copy(p).add(v(3.8,2.15,2.1));desiredTarget.copy(p).add(v(0,1.0,0));fov=57;
            if(stairReview){desiredPosition.copy(p).add(v(2.8,1.5,2.0));desiredTarget.copy(p).add(v(0,.75,0));fov=48;}
          }else if(phase==='walking'||(phase!=='sitting'&&p.distanceTo(nodes[stops[currentStop].node])>.6)){
            desiredPosition.copy(p).addScaledVector(forward,-3.4).addScaledVector(right,1.45).add(v(0,2.15,0));desiredTarget.copy(p).addScaledVector(forward,.5).add(v(0,1.15,0));fov=57;
          }else{
            desiredPosition.copy(stops[currentStop].camera);desiredTarget.copy(stops[currentStop].target);
            if(phase==='sitting'){desiredPosition.set(-5.7,2.9,6.0);desiredTarget.set(-2.3,2.55,2.7);fov=61;}
            if(innerWidth<700){const frame=guideFrame(currentStop,true);if(frame){desiredPosition.set(...frame.position);desiredTarget.set(...frame.target);fov=frame.fov;}else{const center=p.clone().add(v(0,.9,0));desiredPosition.copy(center).add(stops[currentStop].camera.clone().sub(center).multiplyScalar(.85));desiredTarget.copy(center);fov=54;}}
          }
          const handView=new URLSearchParams(location.search).get('handView');
          if(handView&&rockVisit?.stage==='watch'&&avatar.seatedSample){
            const seat=rockVisit.seat,hands=avatar.seatedSample.hands,which=handView==='support'?(seat.hands?.[0]?.armTop?0:1):0;
            desiredTarget.fromArray(hands[which]);desiredTarget.add(v(0,.015,0));
            desiredPosition.copy(desiredTarget).add(v(Math.sin(seat.yaw)*.45, .30,Math.cos(seat.yaw)*.45)).add(v(Math.cos(seat.yaw)*.14,0,-Math.sin(seat.yaw)*.14));fov=43;
          }
          const stillFrame=portraitStill&&phase!=='walking'&&phase!=='manual-walking',blend=stillFrame?1:1-Math.exp(-dt*(rockLocked()?1.35:3.2));
          if((rockVisit||cinematicMode)&&!stillFrame){
            const offset=orbitOffset(camera.position.clone().sub(controls.target),desiredPosition.clone().sub(desiredTarget),dt);
            controls.target.lerp(desiredTarget,1-Math.exp(-dt*1.8));camera.position.copy(controls.target).add(v(offset.x,offset.y,offset.z));
          }else{camera.position.lerp(desiredPosition,blend);controls.target.lerp(desiredTarget,blend);}
          camera.fov=stillFrame?fov:THREE.MathUtils.damp(camera.fov,fov,2.0,dt);camera.updateProjectionMatrix();controls.update();
        }
      }
      publish();
    }
  };
}
