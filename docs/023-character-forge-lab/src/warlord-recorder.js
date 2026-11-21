/** Records the real WebGL battle and its current HUD values, without screen capture. */
export function createBattleRecorder(canvas, { link, button }) {
  const output=document.createElement('canvas'); output.width=1280; output.height=720;
  const ctx=output.getContext('2d'); let recorder=null, chunks=[], stream=null, audioDestination=null, source=null, url=null, saving=false;
  const status=document.createElement('span');status.id='record-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.style.cssText='display:inline-block;margin-left:12px;font-size:12px;color:#dfc399';status.textContent='录像准备就绪';button.insertAdjacentElement('afterend',status);
  function start(audioNode) {
    if(saving || recorder?.state==='recording')throw new Error('上一段录像仍在处理，请稍候');
    if(!window.MediaRecorder || !output.captureStream) throw new Error('当前浏览器不支持实战录像');
    chunks=[]; stream=output.captureStream(30);
    source=audioNode;
    if(source) {audioDestination=source.context.createMediaStreamDestination();source.connect(audioDestination);audioDestination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));}
    const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
    recorder=new MediaRecorder(stream,{...(mime?{mimeType:mime}:{}),videoBitsPerSecond:6500000});
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    recorder.onstop=async()=>{
      saving=true;button.disabled=true;button.textContent='正在保存录像…';status.textContent='正在保存真实录像到本地工程…';
      const blob=new Blob(chunks,{type:recorder.mimeType || 'video/webm'});chunks=[];
      stream.getTracks().forEach(t=>t.stop());if(source&&audioDestination){try{source.disconnect(audioDestination);}catch{}}
      if(url){URL.revokeObjectURL(url);url=null;}
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
      try{
        const response=await fetch('/__capture/chixiao-v5-combat.webm',{method:'POST',mode:'same-origin',credentials:'same-origin',headers:{'Content-Type':'video/webm'},body:blob,cache:'no-store',signal:controller.signal});
        if(!response.ok)throw new Error(`本地保存返回 ${response.status}`);
        const saved=await response.json(),target=new URL(saved.url,location.href);
        if(!saved.ok || target.origin!==location.origin || target.pathname!=='/docs/chixiao-v5-combat.webm')throw new Error('本地保存响应无效');
        link.href=target.href;link.download='chixiao-v5-combat.webm';link.textContent='下载实战录像';link.hidden=false;
        button.textContent='录像已保存 · 再录一次';status.textContent=`录像已保存（${(blob.size/1024/1024).toFixed(1)} MB）`;
      }catch(error){
        url=URL.createObjectURL(blob);link.href=url;link.download='chixiao-v5-combat.webm';link.textContent='下载实战录像';link.hidden=false;
        button.textContent='仅浏览器下载可用 · 再录一次';status.textContent='本地保存未成功，仅浏览器下载可用';console.warn('Capture local save unavailable:',error.message);
      }finally{clearTimeout(timer);saving=false;button.disabled=false;}
    };
    link.hidden=true;button.disabled=true;button.textContent='正在录制真实战斗…';status.textContent='正在录制实际战斗和音效…';recorder.start(250);
  }
  function frame(session, label, floatLayer) {
    if(recorder?.state!=='recording')return;
    const w=1280,h=720,gameH=Math.min(654,w*canvas.height/canvas.width),top=38+(654-gameH)/2;
    ctx.fillStyle='#15171c';ctx.fillRect(0,0,w,h);ctx.drawImage(canvas,0,top,w,gameH);
    ctx.fillStyle='#e6c48a';ctx.font='bold 20px Microsoft YaHei, sans-serif';ctx.fillText('赤霄 · 重戟演武 / 实机连段',28,27);
    ctx.font='14px Microsoft YaHei, sans-serif';ctx.fillStyle='#eee1ce';ctx.fillText(`生命 ${Math.ceil(session.health)}   护盾 ${Math.ceil(session.shield)}   ${label}   击败 ${session.kills}/3`,28,65);
    ctx.fillStyle='#351e25';ctx.fillRect(28,78,260,8);ctx.fillStyle='#c0525b';ctx.fillRect(28,78,260*session.health/session.maxHealth,8);
    ctx.font='16px Microsoft YaHei, sans-serif';ctx.fillStyle='#dfc399';ctx.fillText('Q 破阵横扫       E 铁壁护身       R 坠星裂地',28,701);
    const rect=canvas.getBoundingClientRect();
    for(const element of floatLayer.children) { if(element.style.display==='none')continue;ctx.globalAlpha=Number(element.style.opacity||1);ctx.fillStyle='#f5d299';ctx.font='bold 30px Georgia, serif';ctx.fillText(element.textContent,Number.parseFloat(element.style.left)/rect.width*w,top+Number.parseFloat(element.style.top)/rect.height*gameH); }
    ctx.globalAlpha=1;
  }
  return { start, frame, stop(){if(recorder?.state==='recording')recorder.stop();}, get active(){return recorder?.state==='recording';} };
}
