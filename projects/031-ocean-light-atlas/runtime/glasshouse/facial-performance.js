import * as THREE from 'three';

const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

// Audio time is the only speech clock. Render speed cannot advance the mouth
// past the sound, and paused/stopped audio cannot keep producing speech poses.
export function speechPose(data,time){
  const weights={};
  const rms=data.envelope[Math.min(data.envelope.length-1,Math.max(0,Math.floor(time/data.envelopeStep)))]||0;
  if(time<0||time>=data.duration||rms<.004)return {weights,rms};
  const amplitude=smooth((rms-.004)/.024);
  for(const cue of data.visemeCues){
    const edge=.025;
    if(time<cue.time-edge||time>cue.end+edge)continue;
    const strength=Math.min(smooth((time-cue.time+edge)/(edge*2)),smooth((cue.end-time+edge)/(edge*2)))*amplitude;
    weights[cue.shape]=(weights[cue.shape]||0)+strength;
  }
  const sum=Object.values(weights).reduce((a,b)=>a+b,0);
  if(sum>1)for(const key of Object.keys(weights))weights[key]/=sum;
  return {weights,rms};
}

export async function createFacialPerformance({avatar,canvas,camera,notice=()=>{}}){
  if(!avatar.manifest.facial)return null;
  const panel=document.getElementById('face-controls'),play=document.getElementById('face-play'),pause=document.getElementById('face-pause'),stop=document.getElementById('face-stop'),status=document.getElementById('face-status'),caption=document.getElementById('face-subtitle'),clock=document.getElementById('face-clock'),progress=document.getElementById('face-progress');
  const base=new URL('./assets/personal-guide/',import.meta.url),source=new URL(avatar.manifest.facial.speech,base);
  const response=await fetch(source);if(!response.ok)throw new Error(`Speech timing ${response.status}`);
  const data=await response.json(),audio=new Audio(new URL(data.audio,source).href);audio.preload='auto';
  audio.id='face-audio';audio.hidden=true;panel.append(audio);
  const names=avatar.manifest.facial.shapes,meshes=avatar.meshes().filter(m=>m.morphTargetDictionary),current=Object.fromEntries(names.map(n=>[n,0]));
  if(!meshes.length)throw new Error('Own character facial shapes missing');
  const fixed=new URLSearchParams(location.search).get('facePose');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let elapsed=0,nextBlink=1.4,blinkStart=-10,blinkCount=0,scenePaused=false,gaze=true,autoBlink=!reduce,disposed=false,pendingResume=false,generation=0;
  const listeners=[];
  function on(target,event,handler){target.addEventListener(event,handler);listeners.push(()=>target.removeEventListener(event,handler));}
  function isPlaying(){return !audio.paused&&!audio.ended;}
  async function start(restart=false){
    const version=++generation;
    if(restart||audio.ended)audio.currentTime=0;
    try{await audio.play();if(version!==generation){audio.pause();return;}status.textContent='正在讲解 · 声音与嘴型同步播放';pause.disabled=false;stop.disabled=false;}
    catch(error){if(version!==generation)return;status.textContent='声音暂未开始，请再点一次播放';notice('声音没有开始播放，请重试');}
  }
  function halt(){generation++;audio.pause();audio.currentTime=0;pendingResume=false;status.textContent='已停止 · 可以重新播放';}
  on(play,'click',()=>start(true));
  on(pause,'click',()=>{if(isPlaying()){generation++;audio.pause();status.textContent='已暂停 · 嘴部回到放松状态';}else if(audio.currentTime>0)start();});
  on(stop,'click',halt);
  on(document.getElementById('face-blink'),'click',()=>{blinkStart=elapsed;blinkCount++;nextBlink=elapsed+4.3;});
  on(document.getElementById('face-gaze'),'click',e=>{gaze=!gaze;e.currentTarget.setAttribute('aria-pressed',String(gaze));});
  const blinkToggle=document.getElementById('face-auto-blink');blinkToggle.checked=autoBlink;on(blinkToggle,'change',()=>{autoBlink=blinkToggle.checked;});
  on(audio,'ended',()=>{status.textContent='讲解结束 · 可以再听一遍';});
  on(audio,'error',()=>{status.textContent='讲解音频未能载入，请刷新重试';});
  on(document,'visibilitychange',()=>{if(document.hidden&&isPlaying()){generation++;audio.pause();status.textContent='讲解已暂停';}});
  caption.textContent=data.text;status.textContent='使用我们自己的头部 · 点播放听海边介绍';panel.hidden=false;document.body.classList.add('facial-mode');
  canvas.dataset.facialReady='true';canvas.dataset.facialIdentity=avatar.manifest.facial.identity;
  audio.load();
  const probes={};
  for(const [name,shape,material] of [['mouth','viseme_aa','Own lip surface'],['lid','eyeBlinkLeft','Connected orbital skin'],['iris','eyeLookLeft','Brown iris']]){
    let best=null;
    for(const mesh of meshes){
      if(mesh.material.name!==material)continue;
      const index=mesh.morphTargetDictionary[shape],target=mesh.geometry.morphAttributes.position?.[index];if(!target)continue;
      const position=mesh.geometry.attributes.position;
      for(let i=0;i<target.count;i++){
        const dx=target.getX(i)-(mesh.geometry.morphTargetsRelative?0:position.getX(i)),dy=target.getY(i)-(mesh.geometry.morphTargetsRelative?0:position.getY(i)),dz=target.getZ(i)-(mesh.geometry.morphTargetsRelative?0:position.getZ(i)),length=dx*dx+dy*dy+dz*dz;
        if(!best||length>best.length)best={mesh,index:i,length};
      }
    }
    if(best)probes[name]=best;
  }
  function publish(rms){
    const vertices={};avatar.root.updateMatrixWorld(true);
    for(const [name,p] of Object.entries(probes)){const v=p.mesh.getVertexPosition(p.index,new THREE.Vector3()).applyMatrix4(p.mesh.matrixWorld);vertices[name]=v.toArray().map(x=>Number(x.toFixed(6)));}
    canvas.dataset.facialState=JSON.stringify({time:Number(audio.currentTime.toFixed(4)),duration:data.duration,playing:isPlaying(),paused:audio.paused,ended:audio.ended,blinkCount,automaticBlink:autoBlink,gaze,rms:Number(rms.toFixed(4)),weights:Object.fromEntries(Object.entries(current).filter(([,v])=>v>.0001).map(([k,v])=>[k,Number(v.toFixed(4))])),vertices,clock:'audio.currentTime',timingMethod:data.timingMethod});
  }
  function update(dt){
    if(disposed)return;
    if(!scenePaused)elapsed+=dt;
    const target=Object.fromEntries(names.map(n=>[n,0]));let rms=0;
    if(isPlaying()){const pose=speechPose(data,audio.currentTime);Object.assign(target,pose.weights);rms=pose.rms;}
    if(autoBlink&&!fixed&&!scenePaused&&elapsed>=nextBlink){blinkStart=elapsed;blinkCount++;nextBlink=elapsed+4.2+.7*Math.sin(blinkCount*2.3);}
    const at=elapsed-blinkStart;
    if(at>=0&&at<.32){const blink=at<.085?smooth(at/.085):at<.145?1:1-smooth((at-.145)/.175);target.eyeBlinkLeft=blink;target.eyeBlinkRight=blink;}
    if(gaze&&!environmentFocus&&!fixed&&!scenePaused){
      const local=camera.position.clone().sub(avatar.root.position).applyQuaternion(avatar.root.quaternion.clone().invert());
      const horizontal=clamp(Math.atan2(local.x,local.z)/.085,-.7,.7),vertical=clamp(Math.atan2(local.y-1.62,Math.hypot(local.x,local.z))/.065,-.45,.45);
      target[horizontal>0?'eyeLookLeft':'eyeLookRight']=Math.abs(horizontal);target[vertical>0?'eyeLookUp':'eyeLookDown']=Math.abs(vertical);
    }
    if(fixed){for(const name of names)target[name]=0;if(fixed==='closed')target.eyeBlinkLeft=target.eyeBlinkRight=1;else if(fixed==='aa')target.viseme_aa=1;else if(fixed==='o')target.viseme_O=1;else if(fixed==='pp')target.viseme_PP=1;else if(fixed==='left')target.eyeLookLeft=.8;}
    const alpha=fixed?1:1-Math.exp(-dt*28);
    for(const name of names)current[name]+=((target[name]||0)-current[name])*alpha;
    for(const mesh of meshes)for(const name of names){const i=mesh.morphTargetDictionary[name];if(i!==undefined)mesh.morphTargetInfluences[i]=current[name];}
    clock.textContent=`${audio.currentTime.toFixed(1)} / ${data.duration.toFixed(1)} 秒`;progress.max=data.duration;progress.value=audio.currentTime;
    pause.textContent=isPlaying()?'暂停':'继续';pause.disabled=audio.currentTime===0&&!isPlaying();stop.disabled=audio.currentTime===0&&!isPlaying();
    publish(rms);
  }
  function dispose(){disposed=true;generation++;audio.pause();for(const remove of listeners)remove();audio.removeAttribute('src');audio.load();}
  on(window,'pagehide',dispose);
  let environmentFocus=false;
  return {update,dispose,setEnvironmentFocus(value){environmentFocus=value;},setScenePaused(value){scenePaused=value;if(value){pendingResume=isPlaying();if(pendingResume)audio.pause();}else if(pendingResume){pendingResume=false;start();}}};
}
