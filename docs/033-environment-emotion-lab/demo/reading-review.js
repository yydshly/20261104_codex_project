/** Runs only with ?qa=walk. Observes this app's own canvas/audio, never other browser content. */
export async function startReadingReview({canvas,world,audio}){
 const run='review-'+new Date().toISOString().replace(/[^0-9]/g,'').slice(0,17),started=performance.now(),samples=[],events=[],frames=[],errors=[],captureTasks=[];let recorder=null;
 const panel=document.createElement('aside');panel.style.cssText='position:absolute;z-index:8;right:18px;top:70px;max-width:330px;background:#1b3029ee;color:#efe9d5;padding:16px;border:1px solid #d7d9ba66;border-radius:8px;font:12px/1.8 sans-serif';document.querySelector('#room').append(panel);
 const label=document.createElement('p');label.textContent='正在准备实际往返验收…';panel.append(label);
 const button=document.createElement('button');button.textContent='开启声音并重新验收';button.style.cssText='margin-top:10px;padding:8px;background:#e1d4ae;border:0;border-radius:4px;color:#283d31;cursor:pointer';panel.append(button);
 const save=async(name,body)=>{const response=await fetch('/__reading_review__/artifact?run='+run+'&name='+name,{method:'POST',body});if(!response.ok)throw Error('无法保存验收记录：'+name);};
 const report=()=>({run,seconds:(performance.now()-started)/1000,stage:label.textContent,events,frames,errors,samples,audio:audio.getState(),gpuErrors:Number(canvas.dataset.shaderErrors)||0,fallbackRenderFrames:Number(canvas.dataset.reviewFallbackFrames)||0,world:world.getState(),visibility:document.visibilityState});
 const progress=()=>save('progress.json',JSON.stringify(report())).catch(()=>{});
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const until=async(predicate,timeout=70000)=>{const start=performance.now();while(!predicate()){if(performance.now()-start>timeout)throw Error('等待超时：'+label.textContent);await wait(100);}};
 const stage=async text=>{label.textContent=text;events.push({at:(performance.now()-started)/1000,text});await progress();};
 const capture=async name=>{const requested=(performance.now()-started)/1000,result=await Promise.race([world.captureFrame(),wait(15000).then(()=>{throw Error('画面采样超时，页面可能在后台');})]);if(!result?.blob?.size)throw Error('画面为空');const entry={name,requested,at:(result.at-started)/1000,position:result.pose.position,yaw:result.pose.yaw,pitch:result.pose.pitch};frames.push(entry);await save(name+'.png',result.blob);entry.savedAt=(performance.now()-started)/1000;};
 const queueCapture=name=>{const pending=capture(name);pending.catch(()=>{});captureTasks.push(pending);};
 const timer=setInterval(()=>{samples.push({t:(performance.now()-started)/1000,focused:document.hasFocus(),position:world.getState().position,zone:world.getState().zone,transitioning:world.getState().transitioning,guided:world.getState().guided,yaw:world.getState().yaw,pitch:world.getState().pitch,fps:Number(canvas.dataset.fps)||0,levels:audio.getLevels()});if(samples.length%10===0)progress();},200);
 window.addEventListener('error',e=>errors.push(String(e.message)));window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
 let busy=false;
 async function execute(withAudio=false){if(busy)return;busy=true;button.textContent='开启声音并继续验收';
  try{await until(()=>world.getState().ready,120000);await stage('请点右上按钮激活预览并开启声音，无需回复，保持页面可见。');await until(()=>audio.getState().ready,120000);if(!world.getState().seated||world.getState().transitioning){world.action('seat');await until(()=>world.getState().seated&&!world.getState().transitioning);}await stage('场景已载入，检查灯下实际画面');await capture('01-seated');
   if(!recorder)recorder=audio.captureOutput();await audio.narrate(0);await wait(1000);
   await stage('起身，沿小径穿过房门');world.action('pond');await until(()=>world.getState().zone==='porch');queueCapture('02-door-out');
   await until(()=>world.getState().position.x< -3.4);await stage('走过庭院，检查室内外连续关系');queueCapture('03-garden');
   await until(()=>!world.getState().guided&&!world.getState().transitioning);await wait(1300);if(world.getState().zone!=='pond')throw Error('未到达池边');await stage('到达池边，观察水面并呼唤鸭子');await capture('04-pond');world.action('call');await wait(4200);await capture('05-duck-response');
   await stage('从池边返回房间');world.action('seat');await until(()=>world.getState().zone==='porch');queueCapture('06-door-back');await until(()=>world.getState().seated&&!world.getState().transitioning);await stage('回到椅子，检查相机与书页是否自然恢复');await capture('07-returned');
   const captured=Boolean(recorder);if(captured){await audio.narrate(1);await until(()=>!audio.getState().narrating&&!audio.getState().narrationLoading,25000);await wait(1000);const clip=await recorder.finish();recorder=null;await save('sound.webm',clip);}
   await Promise.all(captureTasks);await stage(captured?'往返与本场景音频输出已保存，等待查看画面和听感判断。':'实际往返画面已保存；点按钮可再做含声音的往返。');await save('report.json',JSON.stringify({...report(),completed:true,audioCaptured:captured,subjectiveVisualVerified:false,subjectiveAudioVerified:false}));
  }catch(e){world.action('stop');errors.push(String(e.message));label.textContent='验收发现问题：'+e.message;try{if(recorder){await save('sound.webm',await recorder.finish());recorder=null;}await save('report.json',JSON.stringify({...report(),completed:false}));}catch{}}
  finally{busy=false;button.textContent='开启声音并重新验收';}
 }
 button.onclick=async()=>{try{await audio.setEnabled(true);if(busy){if(!recorder){recorder=audio.captureOutput();await audio.narrate(0);}return;}await execute(true);}catch(e){label.textContent='声音尚未开启：'+e.message;}};
 const pulseTimer=setInterval(()=>world.reviewPulse?.(),50);let revision;const reloadTimer=setInterval(async()=>{try{const response=await fetch('/__reading_review__/revision');if(!response.ok)return;const next=await response.text();if(revision&&revision!==next){location.reload();return;}revision=next;}catch{}},2200);
 await progress();const preflight=audio.setEnabled(true);preflight.catch(()=>{});const playable=await Promise.race([preflight.then(Boolean).catch(()=>false),wait(1400).then(()=>false)]);execute(playable);window.addEventListener('pagehide',()=>{clearInterval(timer);clearInterval(reloadTimer);clearInterval(pulseTimer);},{once:true});
}
