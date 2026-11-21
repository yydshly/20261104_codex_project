/* Design review only: existing static plates with scope annotations. No GIF playback is claimed. */
(async function(){
  'use strict';
  const $=id=>document.getElementById(id);
  try{
    const response=await fetch('minnong/gif-motion-plan.json');
    if(!response.ok)throw new Error('Design configuration unavailable');
    const plan=await response.json(),tabs=$('scene-tabs');
    let active=0;
    const time=ms=>(ms/1000).toFixed(2).replace(/0$/,'');
    for(const [i,scene] of plan.scenes.entries()){
      const button=document.createElement('button');
      button.type='button';button.id='design-tab-'+i;button.role='tab';button.setAttribute('aria-controls','design-panel');
      const number=document.createElement('small');number.textContent=scene.number;
      const label=document.createElement('strong');label.textContent=scene.line;
      button.append(number,label);button.addEventListener('click',()=>select(i));tabs.append(button);
    }
    function select(index,focus=false){
      active=index;const scene=plan.scenes[index];
      [...tabs.children].forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});
      $('design-panel').setAttribute('aria-labelledby','design-tab-'+index);
      $('scene-kicker').textContent='SCENE '+scene.number+' / '+(index===3?'五段连续动作':'一次完整动作');
      $('scene-title').textContent=scene.line;
      $('scene-duration').textContent=(scene.durationMs/1000).toFixed(1)+' 秒'+(index===3?' × 5 段':' · 单次播放');
      $('scene-image').src=scene.image;$('scene-image').alt=scene.line+'的现有静态画稿，虚线标示计划重绘区域';
      for(const key of ['name','intent','redraw','contact','result','fixed'])$('scene-'+key).textContent=scene[key];
      const [x,y,w,h]=scene.crop;
      $('annotations').innerHTML='<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#983f36"/></marker></defs>'+
        `<rect class="crop" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><path class="motion-path" d="${scene.path}" marker-end="url(#arrow)"/>`+
        scene.anchors.map(([ax,ay])=>`<circle class="anchor" cx="${ax}" cy="${ay}" r="11"/><circle class="anchor-core" cx="${ax}" cy="${ay}" r="3"/>`).join('');
      $('beats').replaceChildren(...scene.beats.map(beat=>{
        const item=document.createElement('li'),range=document.createElement('span'),title=document.createElement('h4'),detail=document.createElement('p');
        range.className='beat-time';range.textContent=time(beat.startMs)+' — '+time(beat.endMs)+' s';
        title.textContent=beat.title;detail.textContent=beat.detail;item.append(range,title,detail);return item;
      }));
      $('grain-states').hidden=index!==3;
      if(focus)tabs.children[index].focus();
      const url=new URL(location.href);url.searchParams.set('scene',scene.id);history.replaceState(null,'',url);
    }
    tabs.addEventListener('keydown',event=>{
      const index=event.key==='ArrowRight'?(active+1)%4:event.key==='ArrowLeft'?(active+3)%4:event.key==='Home'?0:event.key==='End'?3:null;
      if(index!==null){event.preventDefault();select(index,true);}
    });
    $('show-annotations').addEventListener('change',event=>{$('annotations').style.visibility=event.target.checked?'visible':'hidden';});
    const requested=plan.scenes.findIndex(scene=>scene.id===new URL(location.href).searchParams.get('scene'));
    select(requested<0?0:requested);
  }catch(error){$('load-error').hidden=false;}
})();
