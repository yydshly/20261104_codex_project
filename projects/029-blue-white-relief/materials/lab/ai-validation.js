(() => {
 'use strict';
 const data=window.AI_VALIDATION;if(!data)return;
 const $=s=>document.querySelector(s),asset=p=>window.INLINE_ASSETS?.[p]||p;
 const videos=['#ai-reference-video','#ai-v1-video','#ai-result-video'].map($);
 let selected='landscape',reviewRound=2,playing=false,playRequest=0,syncFrame=0;
 const currentReview=()=>reviewRound===1?data.clips[selected].previousRound:data.clips[selected];
 $('#ai-generation-status').textContent=data.generationStatus;
 function pauseAll(){playRequest++;videos.forEach(v=>v.pause());playing=false;cancelAnimationFrame(syncFrame);}
 function seekAll(time){videos.forEach(v=>{if(Number.isFinite(v.duration))v.currentTime=Math.min(time,v.duration);});}
 function ready(video){return new Promise((resolve,reject)=>{if(video.readyState>=2){resolve();return;}const done=()=>{clearTimeout(timer);video.removeEventListener('canplay',done);video.removeEventListener('error',fail);resolve();};const fail=()=>{clearTimeout(timer);video.removeEventListener('canplay',done);video.removeEventListener('error',fail);reject(new Error('Media unavailable'));};const timer=setTimeout(fail,15000);video.addEventListener('canplay',done);video.addEventListener('error',fail);});}
 function updateTime(){const max=+$('#ai-seek').max,t=Math.min(videos[2].currentTime||0,max);$('#ai-seek').value=t;$('#ai-current-time').textContent=`${t.toFixed(2)} / ${max.toFixed(2)} 秒`;}
 function syncPlayback(){if(!playing)return;const max=+$('#ai-seek').max,t=Math.min(videos[2].currentTime||0,max);if(t>=max){pauseAll();seekAll(max);updateTime();$('#ai-play-status').textContent='5秒对比已结束，三个播放器停在同一时间点。';return;}for(const v of videos.slice(0,2))if(Number.isFinite(v.duration)&&Math.abs(v.currentTime-t)>.10)v.currentTime=Math.min(t,v.duration);updateTime();syncFrame=requestAnimationFrame(syncPlayback);}
 function setMedia(v,src,poster){v.pause();v.muted=true;v.src=asset(src);v.poster=asset(poster);v.load();}
 function spec(c){return `${c.width} × ${c.height} · ${c.duration.toFixed(2)} 秒 · ${c.audioLabel}`;}
 function renderReview(){
  const c=currentReview();if(!c)return;
  $('#ai-review-label').textContent=`第${reviewRound===1?'一':'二'}轮观察结论`;
  $('#ai-verdict-title').textContent=c.verdict;$('#ai-verdict-summary').textContent=c.summary;$('#ai-criteria').replaceChildren();
  for(const item of c.criteria){const row=document.createElement('div');row.className='ai-criterion';const name=document.createElement('strong');name.textContent=item.name;const status=document.createElement('span');status.className=`ai-check ${item.status}`;status.textContent=item.label;const detail=document.createElement('p');detail.textContent=item.observation;row.append(name,status,detail);$('#ai-criteria').append(row);}
  $('#ai-contact-image').src=asset(c.contactSheet);$('#ai-download-video').href=asset(c.video);$('#ai-download-video').download=`${selected}-ai-v${reviewRound}.mp4`;
  $('#ai-download-report').href=asset(c.report);$('#ai-download-report').download=`${selected}-v${reviewRound}-validation.json`;$('#ai-submitted-prompt').textContent=c.prompt;
  $('#ai-download-silent').hidden=!c.silentDelivery;$('#ai-silent-note').hidden=!c.silentDelivery;
  if(c.silentDelivery){$('#ai-download-silent').href=asset(c.silentDelivery);$('#ai-download-silent').download=`${selected}-v2-silent.mp4`;}
  const crops=$('#ai-round-crops');crops.replaceChildren();crops.hidden=!c.comparisonSheets?.length;
  for(const sheet of c.comparisonSheets||[]){const b=document.createElement('button');b.textContent=sheet.label+' ↗';b.addEventListener('click',()=>{const im=new Image();im.src=asset(sheet.image);im.alt=sheet.label;$('#dialog-caption').textContent=c.title+' · '+sheet.label;$('#dialog-body').replaceChildren(im);$('#image-dialog').showModal();document.body.classList.add('dialog-open');});crops.append(b);}
  $('#ai-record-details').textContent=`${data.date} · 第${reviewRound===1?'一':'二'}轮 · 实际消耗 ${c.credits} 积分 · 准确输入、指令、返回参数与原片已归档。`;
 }
 function select(id){
  pauseAll();selected=id;
  document.querySelectorAll('[data-ai-study]').forEach(b=>{const on=b.dataset.aiStudy===id;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});
  $('#ai-result-panel').setAttribute('aria-labelledby',`ai-tab-${id}`);
  const c=data.clips[id],available=c?.status==='completed'&&c.previousRound?.status==='completed';$('#ai-comparison').hidden=!available;$('#ai-pending').hidden=available;
  if(!available){$('#ai-pending').textContent=c?.pendingMessage||'第二轮仍在生成或验片；结果完成后会显示两轮原片对比。';return;}
  setMedia(videos[0],data.referenceVideo,data.referencePoster);setMedia(videos[1],c.previousRound.video,c.poster);setMedia(videos[2],c.video,c.poster);
  $('#ai-previous-title').textContent=`${c.previousRound.model} / 首帧图生视频`;$('#ai-previous-spec').textContent=spec(c.previousRound);
  $('#ai-model-title').textContent=`${c.model} / 首帧图生视频`;$('#ai-video-spec').textContent=spec(c);
  $('#ai-round-progress').textContent=c.roundProgress||'';renderReview();
  $('#ai-seek').max=Math.min(5,c.duration,c.previousRound.duration);$('#ai-seek').value=0;updateTime();$('#ai-play-status').textContent='原作、第一轮与第二轮默认静音，对齐观察0–5秒；各播放器可单独查看完整原片。';
 }
 const tabs=[...document.querySelectorAll('[data-ai-study]')];tabs.forEach((b,i)=>{b.addEventListener('click',()=>select(b.dataset.aiStudy));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(n!==undefined){e.preventDefault();select(tabs[n].dataset.aiStudy);tabs[n].focus();}});});
 $('#ai-review-round').addEventListener('change',()=>{reviewRound=+$('#ai-review-round').value;renderReview();});
 $('#ai-play-all').addEventListener('click',async()=>{pauseAll();const request=playRequest;$('#ai-play-status').textContent='正在准备三个播放器…';try{await Promise.all(videos.map(ready));if(request!==playRequest)return;const rate=+$('#ai-playback-rate').value;videos.forEach(v=>{v.currentTime=0;v.muted=true;v.playbackRate=rate;});await Promise.all(videos.map(v=>v.play()));if(request!==playRequest){videos.forEach(v=>v.pause());return;}seekAll(0);playing=true;$('#ai-play-status').textContent='三段同步播放中 · 以第二轮视频为时间基准';syncPlayback();}catch{pauseAll();$('#ai-play-status').textContent='部分播放器尚未就绪，可点击各自播放按钮。';}});
 $('#ai-pause-all').addEventListener('click',()=>{const t=Math.min(videos[2].currentTime||0,+$('#ai-seek').max);pauseAll();seekAll(t);updateTime();$('#ai-play-status').textContent='全部已暂停并对齐，可拖动时间条逐段检查。';});
 $('#ai-playback-rate').addEventListener('change',()=>videos.forEach(v=>{v.playbackRate=+$('#ai-playback-rate').value;}));
 $('#ai-seek').addEventListener('input',()=>{pauseAll();const t=+$('#ai-seek').value;seekAll(t);$('#ai-current-time').textContent=`${t.toFixed(2)} / ${(+$('#ai-seek').max).toFixed(2)} 秒`;$('#ai-play-status').textContent='已对齐到指定时间；所有视频保持暂停。';});
 videos[2].addEventListener('timeupdate',()=>{if(!playing)updateTime();});videos[2].addEventListener('ended',()=>{if(playing){pauseAll();seekAll(+$('#ai-seek').max);}updateTime();});
 function evidence(key,label){const c=currentReview();if(!c?.[key])return;$('#dialog-caption').textContent=`${c.title} · 第${reviewRound===1?'一':'二'}轮 · ${label}`;const image=new Image();image.src=asset(c[key]);image.alt=label;$('#dialog-body').replaceChildren(image);$('#image-dialog').showModal();document.body.classList.add('dialog-open');}
 $('#ai-contact-button').addEventListener('click',()=>evidence('contactSheet','五个时间点对照'));
 for(const [id,key,label] of [['ai-input-frame','firstFrame','实际输入首帧'],['ai-filmstrip','filmstrip','25帧时间序列'],['ai-anchors','anchorSheet','起止结构局部对照']])$('#'+id).addEventListener('click',()=>evidence(key,label));
 $('#ai-copy-prompt').addEventListener('click',async()=>{const text=currentReview()?.prompt||'',ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();let ok=false;try{ok=document.execCommand('copy');}catch{}ta.remove();if(!ok){try{await navigator.clipboard.writeText(text);ok=true;}catch{}}$('#ai-play-status').textContent=ok?'所选轮次实际提交的视频指令已复制。':'请展开并选择上方指令文本复制。';});
 select('landscape');
})();
