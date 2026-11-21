(() => {
 'use strict';
 const $=id=>document.getElementById(id),M=StoryMotion,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let renderer,story,time=0,playing=false,rangeEnd=20,last=0,lastDraw=0,chapter=-1,raf=0;
 const fmt=t=>'0:'+String(Math.floor(t)).padStart(2,'0');
 function update(){
  const index=Math.min(3,M.chapters.findIndex(c=>time<c.end)<0?3:M.chapters.findIndex(c=>time<c.end)),c=M.chapters[index];
  if(chapter!==index){chapter=index;const b=story.beats[index];$('chapter-label').textContent=String(index+1).padStart(2,'0')+' / '+c.name;$('chapter-title').textContent=b.title;$('chapter-copy').textContent=b.narration;$('chapter-dialogue').textContent=b.dialogue;$('chapter-dialogue').hidden=!b.dialogue;$('stage-tag').textContent=c.name+' · '+String(index+1).padStart(2,'0');document.querySelectorAll('[data-chapter]').forEach(b=>{if(Number(b.dataset.chapter)===index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});$('story-canvas').setAttribute('aria-label',b.alt);}
  $('timeline').value=time;$('time-display').textContent=fmt(time)+' / 0:20';$('play').textContent=reduce.matches?'动态已关闭':playing?'暂停 Ⅱ':time>=20?'从头播放 ↺':'播放故事 ▷';$('play').disabled=reduce.matches;$('canvas-play').hidden=reduce.matches;$('canvas-play').textContent=playing?'暂停 Ⅱ':time===0?'开始讲述 ▷':time>=20?'再看一遍 ↺':'继续讲述 ▷';$('canvas-play').setAttribute('aria-label',playing?'暂停故事':'播放故事');$('next').disabled=time>=20;$('ending').hidden=time<19.8;$('reading-hint').textContent=reduce.matches?'已遵循减少动态效果设置。选择一幕可直接查看结果。':playing?'正在讲述。可以暂停，或拖动进度停在任意一刻。':time>=20?'故事停在这里。可以重看此幕，或从头再看一遍。':['点击岸边的红叶，或选择“发现”，看他拾起。','点击桥面，或选择“相认”，等她走近。','点击藤篮，或选择“递篮”，看两人把秋天放在一起。','拖动进度查看递篮的细节，或重看此幕。'][index];
 }
 function seek(value){time=Math.max(0,Math.min(20,Number(value)));playing=false;renderer.renderAt(time);update();}
 function play(start,end=20){if(reduce.matches){seek(end===20?20:end-.001);return;}if(start!==undefined)time=start;rangeEnd=end;playing=true;last=0;update();}
 function tick(now){if(playing&&!document.hidden){if(last)time=Math.min(rangeEnd,time+(now-last)/1000);last=now;if(now-lastDraw>=1000/24||time>=rangeEnd){renderer.renderAt(time);lastDraw=now;update();}if(time>=rangeEnd){playing=false;last=0;if(rangeEnd<20){time=rangeEnd-.001;renderer.renderAt(time);}update();}}else last=0;raf=requestAnimationFrame(tick);}
 $('play').addEventListener('click',()=>{if(playing){playing=false;last=0;update();}else play(time>=20?0:time);});$('canvas-play').addEventListener('click',()=>$('play').click());
 $('timeline').addEventListener('input',e=>seek(e.target.value));
 function scenePoint(event){const r=$('story-canvas').getBoundingClientRect(),scale=Math.min(r.width/1000,r.height/630);return[(event.clientX-r.left-(r.width-1000*scale)/2)/scale,(event.clientY-r.top-(r.height-630*scale)/2)/scale];}
 function hotspot(event){const q=scenePoint(event),target=chapter===0?[780,440,40]:chapter===1?[560,285,120]:chapter===2?[819,421,55]:null;return target&&Math.hypot(q[0]-target[0],q[1]-target[1])<target[2];}
 $('story-canvas').addEventListener('pointermove',e=>{$('story-canvas').style.cursor=!playing&&hotspot(e)?'pointer':'default';});
 $('story-canvas').addEventListener('click',e=>{if(playing||!hotspot(e))return;const c=M.chapters[Math.min(3,chapter+1)];play(c.start,c.end);});

 $('replay').addEventListener('click',()=>{const c=M.chapters[Math.max(0,chapter)];play(c.start,c.end);});
 $('next').addEventListener('click',()=>{const c=M.chapters[Math.min(3,Math.max(0,chapter)+1)];play(c.start,c.end);});
 document.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{const c=M.chapters[Number(b.dataset.chapter)];play(c.start,c.end);}));
 reduce.addEventListener('change',()=>{playing=false;last=0;update();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){playing=false;last=0;if(renderer)update();}});
 window.addEventListener('pagehide',()=>{playing=false;cancelAnimationFrame(raf);});
 window.motionStage={getState:()=>({time,playing,chapter,rangeEnd,reducedMotion:reduce.matches,pose:renderer?.lastPose,stats:renderer?.renderStats}),getFrame:()=>renderer?.canvas.toDataURL('image/png')};
 (async()=>{try{const r=await fetch('stories/autumn.json');if(!r.ok)throw new Error('无法读取故事');story=await r.json();if(story.beats.length!==4)throw new Error('当前舞台需要四幕溪桥故事');$('story-title').textContent=story.title;$('intro').textContent=story.subtitle;$('ending').textContent=story.ending;renderer=new M.MotionScene($('story-canvas'));$('stage-loading').hidden=true;if(reduce.matches)$('reading-hint').textContent='已遵循减少动态效果设置。选择一幕可直接查看结果，静态阅读入口始终可用。';renderer.renderAt(0);update();raf=requestAnimationFrame(tick);}catch(e){$('stage-loading').hidden=true;$('stage-error').hidden=false;$('stage-error').textContent=e.message+'，可以使用上方静态阅读入口。';}})();
})();
