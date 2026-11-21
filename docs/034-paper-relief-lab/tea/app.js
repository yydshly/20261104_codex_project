(() => {
  'use strict';
  const $=id=>document.getElementById(id),reduce=matchMedia('(prefers-reduced-motion: reduce)'),model=new TeaWorld.Model();
  const descriptions=[
    ['雨刚停。炉里留着一点火，第一壶茶还不必着急。','点一下左下角的干柴，给这壶水添一点火。'],
    ['取一块檐下的干柴，送进炉膛。','柴进了炉，火还要慢慢接上来。'],
    ['火稳了，炉口透出一点暖色。','不必再添，留一点时间给这壶水。'],
    ['壶里渐渐热起来，细汽沿着壶嘴往上走。','等这一缕热汽慢慢长起来。'],
    ['水开了。雨后的第一杯茶，就从这里开始。','可以在炉边留一会儿，也可以重新煮一壶。']
  ];
  let renderer,last=0,lastDraw=-100,stage=-1,textKey='',reducedMotion=reduce.matches;
  function update(){const s=model.snapshot();
    if(stage!==s.stage){stage=s.stage;document.querySelectorAll('[data-stage]').forEach(node=>{const i=Number(node.dataset.stage);node.classList.toggle('passed',i<stage);if(i===stage)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');});}
    const copy=stage===3&&s.steam<.025?['火候稳稳地接上来，这壶水正在慢慢变热。','再等片刻，热汽会从壶嘴升起。']:descriptions[stage];
    if(textKey!==copy[0]){textKey=copy[0];$('narration').textContent=copy[0];$('hint').textContent=copy[1];$('announcement').textContent=copy.join(' ');$('tea-canvas').setAttribute('aria-label','雨后茶棚，铁壶坐在陶炉上。'+copy[0]+(s.fed?'':'左下角放着可以点击的干柴。'));}
    $('feed').disabled=s.fed;const label=s.fed?(s.boiling?'水开了':stage===1?'柴火入炉…':'等水慢慢开'):'＋ 添一块柴';if($('feed').textContent!==label)$('feed').textContent=label;
    const pause=reducedMotion?'静态观看':model.paused?'继续':'暂停';if($('pause').textContent!==pause)$('pause').textContent=pause;$('pause').disabled=reducedMotion;$('pause').setAttribute('aria-pressed',String(model.paused||reducedMotion));
  }
  function add(){if(!renderer||!model.add())return;if(reducedMotion)model.finish();last=0;renderer.render(model.snapshot());update();}
  $('feed').addEventListener('click',add);
  $('pause').addEventListener('click',()=>{model.paused=!model.paused;last=0;update();});
  $('reset').addEventListener('click',()=>{if(!renderer)return;model.reset();last=0;stage=-1;renderer.render(model.snapshot());update();});
  function point(event){const r=$('tea-canvas').getBoundingClientRect();return[(event.clientX-r.left)/r.width*1000,(event.clientY-r.top)/r.height*630];}
  function woodHit(event){const q=point(event);return !model.snapshot().fed&&q[0]>277&&q[0]<398&&q[1]>433&&q[1]<502;}
  $('tea-canvas').addEventListener('pointermove',event=>{$('tea-canvas').style.cursor=woodHit(event)?'pointer':'default';});
  $('tea-canvas').addEventListener('click',event=>{if(woodHit(event))add();});
  function tick(now){if(renderer&&!model.paused&&!document.hidden&&!reducedMotion){if(last)model.advance((now-last)/1000);last=now;if(now-lastDraw>=1000/24){renderer.render(model.snapshot());update();lastDraw=now;}}else last=0;requestAnimationFrame(tick);}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){model.paused=true;last=0;update();}});
  reduce.addEventListener('change',event=>{reducedMotion=event.matches;if(reducedMotion){model.finish();renderer?.render(model.snapshot());}last=0;update();});
  window.teaStage={getState:()=>({...model.snapshot(),paused:model.paused,reducedMotion,renderMs:renderer?.renderMs}),getFrame:()=>renderer?.snapshot()};
  requestAnimationFrame(()=>{try{renderer=new TeaWorld.TeaScene($('tea-canvas'));$('loading').hidden=true;update();requestAnimationFrame(tick);}catch(error){$('loading').hidden=true;$('scene-error').hidden=false;$('scene-error').textContent='画面暂时未能展开：'+error.message;}});
})();
