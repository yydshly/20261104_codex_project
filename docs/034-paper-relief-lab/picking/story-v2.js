(async function () {
  'use strict';
  const $ = id => document.getElementById(id), audio = $('voice'), canvas = $('motion');
  const ctx = canvas.getContext('2d', {alpha:false});
  const chapters = [...document.querySelectorAll('[data-phase]')], modeButtons = [...document.querySelectorAll('[data-mode]')];
  const params = new URL(location.href).searchParams, embedded = params.get('embed') === '1';
  document.body.classList.toggle('embedded', embedded);
  const names = ['发现嫩芽','伸手拈住','摘下嫩芽','放进背篓'];
  const nextActions = ['','伸手拈住','轻轻摘下','放进背篓'];
  const waiting = ['','新芽就在这里，伸手轻轻拈住。','指尖已经拈稳，再轻轻摘下。','叶子已经握稳，送回背篓。'];
  const phrases = ['清早的茶田里，一枚嫩芽等着被看见。','手指慢慢靠近，轻轻拈住。','嫩芽离开枝头，稳稳留在手中。','送到篓口，再松开手。'];
  let media, motion, gif, ready=false, mode=params.get('mode')==='guided'?'guided':'watch';
  let started=false, blocked=null, manualPause=false, review=null, reviewStopped=false;
  let busy=false, wantsPlayback=false, playEpoch=0, loadEpoch=0, gate=0;
  let lastFrame=-1, lastPhase=-1, captionKey='', captionNodes=[], ticking=false;
  const text=(id,value)=>{if($(id).textContent!==value)$(id).textContent=value;};
  const duration=()=>Number.isFinite(audio.duration)?audio.duration:media.duration;
  const atEnd=()=>audio.ended||audio.currentTime>=duration()-.025;
  const phaseAt=t=>Math.max(0,Math.min(3,media.phaseTimes.findLastIndex(v=>t+.0001>=v)));
  const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');

  function stopPlayback(){++playEpoch;wantsPlayback=false;busy=false;audio.pause();}
  function reset(){
    stopPlayback();if(ready)audio.currentTime=0;
    started=false;blocked=null;manualPause=false;review=null;reviewStopped=false;gate=0;render();
  }
  function chooseMode(value){
    if(value===mode)return;mode=value;reset();
    const url=new URL(location.href);
    if(mode==='guided')url.searchParams.set('mode','guided');else url.searchParams.delete('mode');
    history.replaceState(null,'',url);
  }
  function pause(){if(!ready)return;if(!audio.paused||busy)manualPause=true;stopPlayback();render();}
  async function run(){
    if(!ready||busy)return;
    if(atEnd())reset();
    if(reviewStopped){
      const next=review+1;review=null;reviewStopped=false;
      if(next<4)audio.currentTime=media.phaseTimes[next]+.005;
    }
    if(blocked!==null){audio.currentTime=media.phaseTimes[blocked]+.005;blocked=null;}
    const operation=++playEpoch;
    busy=true;wantsPlayback=true;started=true;manualPause=false;gate=phaseAt(audio.currentTime);render();
    try{
      await audio.play();
      if(operation!==playEpoch){if(!wantsPlayback)audio.pause();return;}
      $('error').hidden=true;
    }catch{
      if(operation!==playEpoch)return;
      wantsPlayback=false;$('error').hidden=false;text('error','声音暂未开始，请再点一次播放。');
    }finally{if(operation===playEpoch){busy=false;render();}}
  }
  function action(){audio.paused?run():pause();}
  function replayPhase(p){
    if(!ready)return;stopPlayback();audio.currentTime=media.phaseTimes[p]+.005;
    started=true;blocked=null;manualPause=false;review=p;reviewStopped=false;run();
  }
  function enforceStop(){
    if(!ready||audio.paused||audio.ended)return;
    const end=review!==null?media.phaseTimes[review+1]:mode==='guided'?media.phaseTimes[gate+1]:undefined;
    if(end===undefined||audio.currentTime<end-.055)return;
    stopPlayback();audio.currentTime=end-.04;manualPause=false;
    if(review!==null)reviewStopped=true;else blocked=gate+1;
  }
  function updateCaption(t,done){
    const i=media.cues.findLastIndex(c=>c.start<=t),cue=i>=0&&t<=media.cues[i].end+.22?media.cues[i]:null;
    const fallback=done?'一枚嫩芽，已经收好了。':blocked!==null?waiting[blocked]
      :reviewStopped?names[review]+'，这一段可以再看一遍。'
      :!started?mode==='watch'?'从一枚新芽，走近一盏茶的来处。':'找到枝头的嫩芽，点它开始。'
      :phrases[phaseAt(t)];
    const show=cue&&!done&&blocked===null&&!reviewStopped,key=show?'cue:'+i:'text:'+fallback;
    if(key!==captionKey){
      captionKey=key;captionNodes=[];$('caption').replaceChildren();
      if(show)for(const word of cue.words){const span=document.createElement('span');span.textContent=word.text;$('caption').append(span);captionNodes.push(span);}
      else $('caption').textContent=fallback;
    }
    if(show)cue.words.forEach((w,n)=>{captionNodes[n].className=t>=w.end?'spoken':t>=w.start?'current':'';});
  }
  function render(){
    modeButtons.forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.mode===mode));b.disabled=!ready;});
    if(!ready)return;
    const t=audio.currentTime,done=atEnd(),p=phaseAt(t),moving=!audio.paused&&!done;
    const gifTime=done?gif.duration-1:Math.min(gif.duration-1,t*1000),frame=gif.seek(gifTime);
    if(frame!==lastFrame){gif.draw(ctx,gifTime);lastFrame=frame;}
    $('still').hidden=true;canvas.hidden=false;updateCaption(t,done);
    const leaf=motion.frameStates[frame];
    text('leaf-state',leaf==='basket'?'已收好 1 枚新芽':leaf==='hand'?'新芽已在手中':'嫩芽还在枝头');
    text('action',moving?review!==null?'暂停这一段':mode==='watch'?'暂停故事':'暂停动作'
      :done?mode==='watch'?'再听一次':'再采一次'
      :reviewStopped?'继续后面的故事':blocked!==null?nextActions[blocked]
      :!started?mode==='watch'?'开始听故事':'开始采叶':mode==='watch'?'继续听看':'继续采叶');
    $('action').setAttribute('aria-pressed',String(moving));
    text('mode-note',review!==null?'片段回看 · '+names[review]:mode==='watch'?'听看故事 · 约 14 秒':'亲手采叶 · 随你的节奏');
    $('scene-action').hidden=mode!=='guided'||moving||manualPause||review!==null||done;
    const point=blocked===3?motion.hotspots.basket:motion.hotspots.bud;
    $('scene-action').style.left=point[0]+'%';$('scene-action').style.top=point[1]+'%';
    text('scene-hint',!started?'点嫩芽开始':blocked!==null?nextActions[blocked]:'继续采叶');
    $('ending').hidden=!done;
    text('prompt',done?'这一枚新芽已收进背篓。再听一次，或看看它接下来的工序。'
      :reviewStopped?'这一段已经停住。点同一时刻可重看，或继续后面的故事。'
      :review!==null?'正在听看“'+names[review]+'”，这一段结束后会停住。'
      :moving?mode==='watch'?'跟着这一枚新芽看下去，随时可以暂停。':'动作正在发生，下一步会等你来继续。'
      :blocked!==null?['','新芽找到了，伸手轻轻拈住。','指尖拈稳了，轻轻摘下这枚新芽。','新芽握稳了，点背篓把它收好。'][blocked]
      :manualPause?'声音和画面都停在这里，继续时从这一刻接上。'
      :mode==='watch'?'先听看一个完整的小故事；也可以选择“亲手采叶”。':'点画里的嫩芽开始，拈住、摘下、收叶都由你继续。');
    text('chapter-hint',review!==null?'点同一时刻可从头重听这一段。':'点选四个时刻，可以单独听看这一段。');
    $('seek').max=duration();$('seek').value=t;$('seek').setAttribute('aria-valuetext',names[p]+'，'+fmt(done?Math.ceil(duration()):t));
    text('time',fmt(done?Math.ceil(duration()):t)+' / '+fmt(Math.ceil(duration())));
    text('mute',audio.muted?'声音 关':'声音 开');$('mute').setAttribute('aria-pressed',String(!audio.muted));
    if(lastPhase!==p){lastPhase=p;chapters.forEach((b,i)=>{if(i===p)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});}
  }
  function audioMetadata(){
    return new Promise((resolve,reject)=>{
      const cleanup=()=>{clearTimeout(timer);audio.removeEventListener('loadedmetadata',loaded);audio.removeEventListener('error',failed);};
      const loaded=()=>{cleanup();resolve();},failed=()=>{cleanup();reject(new Error('Voice unavailable'));};
      const timer=setTimeout(failed,20000);
      audio.addEventListener('loadedmetadata',loaded);audio.addEventListener('error',failed);audio.load();
    });
  }
  async function load(){
    const operation=++loadEpoch;stopPlayback();ready=false;
    $('error').hidden=true;$('retry').hidden=true;text('load-status','正在展开画面与旁白…');$('load-status').hidden=false;text('action','准备故事…');
    [$('action'),$('restart'),$('scene-action'),$('seek'),$('mute'),...chapters,...modeButtons].forEach(b=>b.disabled=true);
    try{
      const [mr,ar]=await Promise.all([fetch('picking/motion.json'),fetch('assets/directions/picking/media.json')]);
      if(!mr.ok||!ar.ok)throw new Error('Timeline unavailable');
      [motion,media]=await Promise.all([mr.json(),ar.json()]);
      $('still').src=motion.poster;$('still').hidden=false;canvas.hidden=true;audio.src=media.audio;
      const [loaded]=await Promise.all([StoryGif.load(motion.gif),audioMetadata()]);
      if(operation!==loadEpoch)return;
      if(motion.frameStates.length!==loaded.frames.length)throw new Error('Motion state mismatch');
      gif=loaded;canvas.width=gif.width;canvas.height=gif.height;lastFrame=-1;lastPhase=-1;ready=true;
      [$('action'),$('restart'),$('scene-action'),$('seek'),$('mute'),...chapters,...modeButtons].forEach(b=>b.disabled=false);
      $('load-status').hidden=true;reset();if(!ticking){ticking=true;requestAnimationFrame(tick);}
    }catch{
      if(operation!==loadEpoch)return;
      $('error').hidden=false;$('retry').hidden=false;$('retry').disabled=false;
      text('error','故事暂未完整载入。画稿仍可查看，请点“重新载入”再试一次。');$('load-status').hidden=true;text('action','等待载入');
    }
  }
  function tick(){enforceStop();render();requestAnimationFrame(tick);}
  $('action').addEventListener('click',action);$('scene-action').addEventListener('click',action);
  $('restart').addEventListener('click',reset);$('retry').addEventListener('click',load);
  modeButtons.forEach(b=>b.addEventListener('click',()=>chooseMode(b.dataset.mode)));
  chapters.forEach(b=>b.addEventListener('click',()=>replayPhase(Number(b.dataset.phase))));
  $('mute').addEventListener('click',()=>{audio.muted=!audio.muted;render();});
  $('seek').addEventListener('input',e=>{
    stopPlayback();audio.currentTime=Number(e.target.value);started=true;blocked=null;review=null;reviewStopped=false;manualPause=true;render();
  });
  for(const event of ['pause','ended','seeked','volumechange'])audio.addEventListener(event,render);
  audio.addEventListener('playing',()=>{if(!wantsPlayback)audio.pause();render();});
  audio.addEventListener('timeupdate',()=>{enforceStop();render();});
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='picking:pause')pause();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  document.addEventListener('keydown',e=>{if(e.key===' '&&!['INPUT','BUTTON','A','TEXTAREA','SELECT'].includes(e.target.tagName)){e.preventDefault();action();}});
  if(embedded){
    let lastHeight=0;new ResizeObserver(()=>{
      const h=Math.ceil(document.querySelector('main').getBoundingClientRect().height)+8;
      if(h!==lastHeight){lastHeight=h;parent.postMessage({type:'picking:resize',height:h},location.origin);}
    }).observe(document.querySelector('main'));
  }
  load();
})();
