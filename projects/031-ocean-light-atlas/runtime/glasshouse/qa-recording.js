// Opt-in local review controls (?qa=1); absent from the normal experience.
export function createQARecording({canvas,audio}){
 const panel=document.createElement('div');panel.className='qa-recording interface';
 panel.style.cssText='position:absolute;right:24px;top:82px;z-index:12;display:flex;gap:6px;font-size:11px';
 const record=document.createElement('button'),save=document.createElement('button');record.id='qa-record';save.id='qa-save';record.textContent='录制实际画面';save.textContent='保存检查记录';
 for(const button of [record,save])button.style.cssText='border:1px solid #d9c8a8;border-radius:4px;background:#233b45;color:#f6e9cf;padding:8px 12px';
 panel.append(record,save);document.querySelector('#experience').append(panel);
 let recorder,frames=[],last=0;canvas.dataset.qaCapture='idle';
 const download=(blob,name)=>{const link=document.createElement('a'),url=URL.createObjectURL(blob);link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
 const sample=now=>{
  if(recorder?.state==='recording'&&now-last>80){last=now;frames.push({time:now,position:JSON.parse(canvas.dataset.guidePosition||'null'),phase:canvas.dataset.guidePhase,rock:JSON.parse(canvas.dataset.rockVisit||'null'),feet:JSON.parse(canvas.dataset.footContact||'null'),audio:JSON.parse(canvas.dataset.seaAudio||'null'),camera:JSON.parse(canvas.dataset.guideCameraPosition||'null'),guard:JSON.parse(canvas.dataset.cameraGuard||'null')});}
  requestAnimationFrame(sample);
 };requestAnimationFrame(sample);
 record.addEventListener('click',async()=>{
  if(recorder?.state==='recording'){record.disabled=true;recorder.stop();return;}
  await audio.activate();frames=[];const chunks=[],stream=new MediaStream([...canvas.captureStream(24).getVideoTracks(),...(audio.recordingStream?.getAudioTracks()||[])]);
  recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:2600000});
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onstop=()=>{download(new Blob(chunks,{type:recorder.mimeType}),'hands-surf43-interaction.webm');stream.getVideoTracks().forEach(t=>t.stop());canvas.dataset.qaCapture='saved';record.disabled=false;record.textContent='录制实际画面';};
  recorder.start(500);canvas.dataset.qaCapture='recording';record.textContent='停止并保存录屏';
 });
 save.addEventListener('click',()=>download(new Blob([JSON.stringify({version:'4.3',asset:canvas.dataset.guideAsset,frames},null,2)],{type:'application/json'}),'hands-surf43-checks.json'));
}
