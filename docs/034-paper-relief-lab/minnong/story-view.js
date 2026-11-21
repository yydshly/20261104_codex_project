(async function(){
 'use strict';
 const $=id=>document.getElementById(id),audio=$('narration'),poster=$('poster'),canvas=$('motion-canvas'),ctx=canvas.getContext('2d',{alpha:false});
 let data,timeline,index=-1,scope='story',started=false,chapterEnded=false,busy=false,error='',captionIndex=-2,captionNodes=[],captions=true,motion=!matchMedia('(prefers-reduced-motion: reduce)').matches,dragging=false,operation=0;
 const media=Array.from({length:4},()=>({player:null,promise:null,error:''}));
 const text=(id,value)=>{const el=$(id);if(el.textContent!==value)el.textContent=value;};
 const fmt=t=>Math.floor(Math.max(0,t)/60)+':'+String(Math.floor(Math.max(0,t)%60)).padStart(2,'0');
 const duration=()=>Number.isFinite(audio.duration)?audio.duration:timeline.duration;
 function showChapter(i){
  if(i===index)return;index=i;const s=data.scenes[i];poster.src=s.image;poster.alt=s.alt;canvas.setAttribute('aria-label',s.line+'的故事画面');
  text('scene-number',s.number+' / 四');text('verse',s.line);text('scene-title',s.title);text('scene-story',s.story);text('scene-detail',s.detail);text('scene-count',String(i+1).padStart(2,'0')+' / 04');
  $('previous').disabled=i===0;$('next').disabled=i===3;
  [...$('scene-tabs').children].forEach((b,n)=>{b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1;});
  $('scene-panel').setAttribute('aria-labelledby','story-tab-'+i);document.title=s.line+' · 一粒米的来处';
  $('gif-download').href=s.gif;$('gif-download').download=s.id+'.gif';
  const u=new URL(location.href);u.searchParams.set('verse',i+1);u.searchParams.delete('play');history.replaceState(null,'',u);
  $('scene-panel').classList.remove('scene-enter');void $('scene-panel').offsetWidth;$('scene-panel').classList.add('scene-enter');
  ensure(i);if(started&&i<3)ensure(i+1);
 }
 async function ensure(i,retry=false){
  const state=media[i];if(state.player)return state.player;if(state.promise)return state.promise;if(state.error&&!retry)return null;state.error='';
  state.promise=StoryGif.load(data.scenes[i].gif).then(player=>{state.player=player;return player;}).catch(()=>{state.error='这一幕的动作暂未载入，讲述与画稿仍可观看。';return null;}).finally(()=>{state.promise=null;});
  return state.promise;
 }
 function updateCaptions(t){
  const n=StoryClock.cueAt(timeline.cues,t);
  if(n!==captionIndex){captionIndex=n;captionNodes=[];$('caption-text').replaceChildren();
   if(n>=0)for(const w of timeline.cues[n].words){const span=document.createElement('span');span.textContent=w.text;$('caption-text').append(span);captionNodes.push(span);}
   else if(!started)$('caption-text').textContent='一首诗，一段父子之间的小故事。';
  }
  if(n>=0)timeline.cues[n].words.forEach((w,i)=>{const kind=t>=w.end?'spoken':t>=w.start?'current':'';if(captionNodes[i].className!==kind)captionNodes[i].className=kind;});
  $('caption-band').classList.toggle('captions-off',!captions);
 }
 function render(){
  if(!timeline||!data)return;
  const t=audio.currentTime;
  if(scope==='chapter'&&!audio.paused&&t>=timeline.chapters[index].end-.025){audio.pause();audio.currentTime=timeline.chapters[index].end-.03;chapterEnded=true;}
  const now=audio.currentTime,i=StoryClock.chapterAt(timeline.chapters,now);showChapter(i);
  const player=media[i].player,show=motion&&!!player;poster.hidden=show;canvas.hidden=!show;
  if(show){const at=StoryClock.gifTime(timeline.chapters[i],now,player.duration);if(player.index!==player.seek(at)||canvas.dataset.scene!==String(i)||canvas.dataset.frame!==String(player.index)){player.draw(ctx,at);canvas.dataset.scene=i;canvas.dataset.frame=player.index;}}
  updateCaptions(now);
  if(!dragging)$('story-progress').value=now;$('story-progress').max=duration();$('story-progress').style.setProperty('--progress',Math.min(100,now/duration()*100)+'%');
  $('story-progress').setAttribute('aria-valuetext','第'+(i+1)+'幕，'+fmt(now)+'，共'+fmt(duration()));
  text('elapsed',fmt(now));text('duration',fmt(duration()));
  const playing=!audio.paused&&!audio.ended;
  document.body.classList.toggle('is-listening',playing&&!busy);
  text('listen-story',busy?'正在准备声音…':playing?'暂停讲述':audio.ended?'再听完整故事':chapterEnded?'重听这一幕':started?'继续讲述':'开始听故事');
  $('listen-story').setAttribute('aria-label',playing?'暂停语音、字幕和画面':'播放语音，同步字幕和画面');$('listen-story').setAttribute('aria-pressed',String(playing));
  text('play-scene',scope==='chapter'&&playing?'暂停这一幕':'听这一幕');
  text('show-still',motion?'只看静画':'打开画面动作');$('show-still').setAttribute('aria-pressed',String(!motion));
  text('toggle-captions',captions?'字幕 开':'字幕 关');$('toggle-captions').setAttribute('aria-pressed',String(captions));
  text('mute-narration',audio.muted?'声音 关':'声音 开');$('mute-narration').setAttribute('aria-pressed',String(!audio.muted));
  text('listening-status',busy?'声音正在缓冲':playing?(scope==='chapter'?'正在听这一幕':'正在听完整故事'):audio.ended?'故事讲完了，再看看这粒米。':chapterEnded?'这一幕讲完了':started?'停一停，故事在这里等你。':'戴上耳机，听一粒米的来处。');
  text('motion-status',motion?'声音领着画面，一幕一幕慢慢看。':'静画模式 · 语音与字幕继续同步');
  const message=error||media[i].error;$('media-error').hidden=!message;$('media-error').textContent=message;
 }
 function pause(){operation++;audio.pause();busy=false;render();}
 function seek(t){chapterEnded=false;audio.currentTime=Math.max(0,Math.min(duration(),t));showChapter(StoryClock.chapterAt(timeline.chapters,audio.currentTime));render();}
 function select(i){if(i<0||i>3)return;pause();scope='chapter';seek(timeline.chapters[i].start);}
 async function play(){
  if(!timeline)return;
  if(audio.ended){scope='story';seek(0);}
  else if(chapterEnded){seek(timeline.chapters[index].start);}
  const request=++operation;started=true;chapterEnded=false;error='';busy=true;
  if(media[index].error)ensure(index,true);if(index<3)ensure(index+1);
  try{await audio.play();if(request!==operation)return;busy=false;}catch{if(request!==operation)return;busy=false;error='声音暂时没有播放出来，请点“继续讲述”再试一次。';}
  render();
 }
 function playChapter(restart=false){if(!restart&&scope==='chapter'&&!audio.paused){pause();return;}const i=index;audio.pause();scope='chapter';seek(timeline.chapters[i].start);play();}
 function tick(){render();requestAnimationFrame(tick);}
 try{
  const responses=await Promise.all([fetch('stories/minnong-story/story.json'),fetch('stories/minnong-story/narration.json')]);if(responses.some(r=>!r.ok))throw new Error('Story unavailable');
  [data,timeline]=await Promise.all(responses.map(r=>r.json()));
  data.scenes.forEach((s,i)=>{
   const b=document.createElement('button');b.type='button';b.role='tab';b.id='story-tab-'+i;b.setAttribute('aria-controls','scene-panel');const img=new Image();img.src=s.image;img.alt='';const label=document.createElement('span'),n=document.createElement('small');n.textContent=s.number;label.append(n,document.createTextNode(s.line));b.append(img,label);b.addEventListener('click',()=>select(i));$('scene-tabs').append(b);
   const article=document.createElement('article');article.className='story-card';const open=document.createElement('button');open.type='button';open.setAttribute('aria-label','查看'+s.line);const art=new Image();art.src=s.image;art.alt=s.alt;art.loading='lazy';open.append(art);open.addEventListener('click',()=>{select(i);document.querySelector('.story-stage').scrollIntoView({behavior:'smooth',block:'start'});});const reading=document.createElement('div');reading.className='card-reading';const h=document.createElement('h3'),p=document.createElement('p');h.textContent=s.line;p.textContent=s.story;reading.append(h,p);article.append(open,reading);$('story-cards').append(article);
  });
  audio.src=timeline.audio;audio.volume=.95;
  const metadata=new Promise((resolve,reject)=>{if(audio.readyState>=1)return resolve();audio.addEventListener('loadedmetadata',resolve,{once:true});audio.addEventListener('error',()=>reject(new Error('Audio unavailable')),{once:true});});
  const requested=Number(new URL(location.href).searchParams.get('verse'));showChapter(requested>=1&&requested<=4?requested-1:0);
  await Promise.race([metadata,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Audio metadata timeout')),15000))]);
  if(index>0)audio.currentTime=timeline.chapters[index].start;
  if(Math.abs(duration()-timeline.duration)<1)timeline.chapters[3].end=duration();
  for(const id of ['listen-story','play-scene','replay-scene','play-all','story-progress'])$(id).disabled=false;
  $('total-length').textContent='约 '+Math.round(duration())+' 秒';$('audio-download').href=timeline.audio;
  $('listen-story').addEventListener('click',()=>audio.paused?play():pause());
  $('play-scene').addEventListener('click',()=>playChapter());$('replay-scene').addEventListener('click',()=>playChapter(true));
  $('play-all').addEventListener('click',()=>{audio.pause();scope='story';seek(0);play();});
  $('previous').addEventListener('click',()=>select(index-1));$('next').addEventListener('click',()=>select(index+1));
  $('show-still').addEventListener('click',()=>{motion=!motion;canvas.dataset.frame='';render();});
  $('mute-narration').addEventListener('click',()=>{audio.muted=!audio.muted;render();});$('toggle-captions').addEventListener('click',()=>{captions=!captions;render();});
  $('story-progress').addEventListener('input',e=>{seek(Number(e.target.value));});
  $('story-progress').addEventListener('pointerdown',()=>{dragging=true;});document.addEventListener('pointerup',()=>{dragging=false;});
  const toggle=()=>audio.paused?play():pause();canvas.addEventListener('click',toggle);poster.addEventListener('click',toggle);canvas.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}});
  $('scene-tabs').addEventListener('keydown',e=>{const i=e.key==='ArrowRight'?(index+1)%4:e.key==='ArrowLeft'?(index+3)%4:e.key==='Home'?0:e.key==='End'?3:null;if(i!==null){e.preventDefault();select(i);$('story-tab-'+i).focus();}});
  for(const event of ['playing','canplay','pause','ended','seeked','volumechange'])audio.addEventListener(event,()=>{if(event==='playing'||event==='canplay')busy=false;render();});
  audio.addEventListener('waiting',()=>{if(!audio.paused)busy=true;render();});audio.addEventListener('error',()=>{busy=false;error='声音暂时未能载入，请刷新后再试。';render();});
  if('mediaSession'in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:'一粒米的来处',artist:'纸上生境 · 悯农'});navigator.mediaSession.setActionHandler('play',play);navigator.mediaSession.setActionHandler('pause',pause);}
  window.poemStory={getState:()=>({index,id:data.scenes[index].id,line:data.scenes[index].line,mode:'narrated',scope,paused:audio.paused,currentTime:audio.currentTime,audioDuration:duration(),ended:audio.ended,chapterEnded,captionIndex,caption:captionIndex<0?'':timeline.cues[captionIndex].text,motionTime:media[index].player?StoryClock.gifTime(timeline.chapters[index],audio.currentTime,media[index].player.duration):0,gif:media[index].player?.info(),sceneCount:4,readyGifs:data.scenes.filter(s=>s.gif).length,clock:'audio.currentTime',voice:timeline.voice,error,muted:audio.muted,captions,motion}),getData:()=>structuredClone(data),getTimeline:()=>structuredClone(timeline),getFrame:()=>canvas.toDataURL('image/png')};
  render();requestAnimationFrame(tick);
 }catch{error='有声故事暂时未能载入，请刷新后再试。';$('load-error').hidden=false;$('load-error').textContent=error;$('listening-status').textContent=error;}
})();
