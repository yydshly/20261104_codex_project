(async function(){
 'use strict';
 const $=id=>document.getElementById(id),poster=$('poster'),canvas=$('motion-canvas'),ctx=canvas.getContext('2d',{alpha:false}),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let data,index=0,all=false,token=0,last=0;
 const states=Array.from({length:4},()=>({time:0,mode:'still',paused:true,ended:false,loading:false,error:'',player:null,promise:null}));
 const current=()=>states[index];
 function update(){
  const s=data.scenes[index],state=current();$('scene-number').textContent=s.number+' / 四';$('verse').textContent=s.line;$('scene-title').textContent=s.title;$('scene-story').textContent=s.story;$('scene-detail').textContent=s.detail;$('scene-count').textContent=String(index+1).padStart(2,'0')+' / 04';
  poster.src=s.image;poster.alt=s.alt;poster.hidden=state.mode==='gif';canvas.hidden=state.mode!=='gif';canvas.setAttribute('aria-label',s.line+'的完整动作GIF');$('previous').disabled=index===0;$('next').disabled=index===3;
  $('play-scene').disabled=!s.gif||state.loading;$('play-scene').textContent=!s.gif?'GIF待生成':state.loading?'正在载入GIF…':state.mode==='gif'&&!state.paused?'暂停这一幕':state.ended?'重看这一幕':state.mode==='gif'?'继续播放':'播放这一幕';
  $('show-still').hidden=state.mode!=='gif';$('replay-scene').hidden=state.mode!=='gif';$('motion-status').textContent=s.gif?'GIF 动作 · 点按播放，演完停住':'四幅画稿已完成 · GIF动作制作中';const save=$('gif-download');save.hidden=!s.gif;if(s.gif){save.href=s.gif;save.download=s.id+'.gif';}
  $('play-all').disabled=!data.scenes.every(s=>s.gif);$('play-all').textContent=all?'正在连看四幕…':'连看四幕';
  const film=$('film-link');film.hidden=!data.film;if(data.film){film.href=data.film;film.download='一粒米的来处.gif';film.textContent='保存完整故事 GIF ↓';}
  [...$('scene-tabs').children].forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});$('scene-panel').setAttribute('aria-labelledby','story-tab-'+index);
  $('media-error').hidden=!state.error;$('media-error').textContent=state.error;document.title=s.line+' · 一粒米的来处';
 }
 function draw(){const state=current();if(state.player&&state.mode==='gif')state.player.draw(ctx,state.time);}
 function pause(){current().paused=true;last=0;draw();update();}
 function select(i,{continueAll=false,restart=false}={}){if(!Number.isInteger(i)||i<0||i>3)return;token++;current().paused=true;if(!continueAll)all=false;index=i;last=0;if(restart){current().time=0;current().ended=false;}draw();const u=new URL(location.href);u.searchParams.set('verse',i+1);history.replaceState(null,'',u);update();}
 async function ensure(i){const state=states[i];if(state.player)return state.player;if(state.promise)return state.promise;state.loading=true;state.error='';update();state.promise=StoryGif.load(data.scenes[i].gif).then(player=>{state.player=player;return player}).finally(()=>{state.loading=false;state.promise=null;if(i===index)update();});return state.promise;}
 async function play(){
  const target=index,state=current();if(!data.scenes[target].gif)return;const operation=++token;
  try{const player=await ensure(target);if(operation!==token||target!==index)return;if(state.ended||state.time>=player.duration)state.time=0;state.ended=false;state.mode='gif';state.paused=false;state.error='';last=0;draw();update();}
  catch(error){if(operation!==token)return;all=false;state.paused=true;state.mode='still';state.error='GIF 暂时未能载入，画稿已保留。可以再试一次。';update();}
 }
 function tick(now){
  const state=current();if(state.player&&state.mode==='gif'&&!state.paused&&!document.hidden){if(last)state.time=Math.min(state.player.duration,state.time+Math.max(0,Math.min(200,now-last)));last=now;draw();if(state.time>=state.player.duration){state.paused=true;state.ended=true;last=0;if(all&&index<3){select(index+1,{continueAll:true,restart:true});play();}else{all=false;update();}}}else last=0;requestAnimationFrame(tick);
 }
 try{
  const response=await fetch('stories/minnong-story/story.json');if(!response.ok)throw new Error('Story unavailable');data=await response.json();
  data.scenes.forEach((s,i)=>{
   const b=document.createElement('button');b.type='button';b.role='tab';b.id='story-tab-'+i;b.setAttribute('aria-controls','scene-panel');const img=new Image();img.src=s.image;img.alt='';const label=document.createElement('span'),n=document.createElement('small');n.textContent=s.number;label.append(n,document.createTextNode(s.line));b.append(img,label);b.addEventListener('click',()=>select(i));$('scene-tabs').append(b);
   const article=document.createElement('article');article.className='story-card';const open=document.createElement('button');open.type='button';open.setAttribute('aria-label','查看'+s.line);const art=new Image();art.src=s.image;art.alt=s.alt;art.loading='lazy';open.append(art);open.addEventListener('click',()=>{select(i);document.querySelector('.story-stage').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});});const reading=document.createElement('div');reading.className='card-reading';const h=document.createElement('h3'),p=document.createElement('p');h.textContent=s.line;p.textContent=s.story;reading.append(h,p);article.append(open,reading);$('story-cards').append(article);
  });
  const requested=Number(new URL(location.href).searchParams.get('verse'));select(requested>=1&&requested<=4?requested-1:0);
  $('previous').addEventListener('click',()=>select(index-1));$('next').addEventListener('click',()=>select(index+1));
  $('show-still').addEventListener('click',()=>{all=false;pause();current().mode='still';update();});
  $('replay-scene').addEventListener('click',()=>{all=false;token++;current().time=0;current().ended=false;current().paused=true;last=0;draw();update();});
  const toggle=()=>{if(current().mode==='gif'&&!current().paused)pause();else play();};$('play-scene').addEventListener('click',toggle);canvas.addEventListener('click',toggle);poster.addEventListener('click',()=>{if(data.scenes[index].gif)play();});canvas.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}});
  $('play-all').addEventListener('click',()=>{if(!data.scenes.every(s=>s.gif))return;for(const state of states){state.time=0;state.ended=false;state.paused=true;}select(0);all=true;play();});
  $('scene-tabs').addEventListener('keydown',e=>{const i=e.key==='ArrowRight'?(index+1)%4:e.key==='ArrowLeft'?(index+3)%4:e.key==='Home'?0:e.key==='End'?3:null;if(i!==null){e.preventDefault();select(i);$('story-tab-'+i).focus();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.poemStory={getState:()=>({index,id:data.scenes[index].id,line:data.scenes[index].line,mode:current().mode,all,paused:current().paused,currentTime:current().time/1000,ended:current().ended,sceneCount:data.scenes.length,readyGifs:data.scenes.filter(s=>s.gif).length,gif:current().player?.info(),sceneStates:states.map(s=>({time:s.time,paused:s.paused,ended:s.ended,mode:s.mode}))}),getData:()=>structuredClone(data),getFrame:()=>canvas.toDataURL('image/png')};
  requestAnimationFrame(tick);if(new URL(location.href).searchParams.get('play')==='1'&&!reduced.matches&&data.scenes[index].gif)play();
 }catch(error){$('load-error').hidden=false;}
})();
