(async function(){
 'use strict';
 const $=id=>document.getElementById(id),ref=$('reference-video'),picture=$('preview-image'),video=$('preview-video');
 let data,current=null,showingGif=false;
 function link(label,href){const a=document.createElement('a');a.textContent=label;a.href=href;a.target='_blank';a.rel='noopener';return a;}
 function pair(dl,title,copy){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=title;dd.textContent=copy;dl.append(dt,dd);}
 function selectPreview(id){
  const item=data.previews.find(p=>p.id===id);if(!item)return;
  video.pause();video.removeAttribute('src');video.load();current=item;showingGif=false;
  picture.hidden=false;video.hidden=true;picture.src=item.poster;picture.alt=item.title+'的实际画稿预览';
  $('preview-title').textContent=item.title;$('preview-description').textContent=item.description;$('preview-scope').textContent=item.scope;
  $('preview-full').href=item.href;$('preview-full').textContent=item.action+' ↗';
  $('preview-play').textContent=item.type==='gif'?'播放 GIF 画面':'播放实际录制';
  $('preview-message').textContent='这里便于看画面差异，完整交互和旁白请进入案例。';
  document.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preview===id)));
 }
 $('preview-play').addEventListener('click',async()=>{
  if(!current)return;
  if(current.type==='gif'){
   showingGif=!showingGif;picture.src=showingGif?current.media+'?preview='+Date.now():current.poster;
   $('preview-play').textContent=showingGif?'回到封面':'播放 GIF 画面';
   $('preview-message').textContent=showingGif?'无声 GIF 画面预览；原有旁白、字幕与交互在完整案例里。':'已回到封面，可重新播放画面预览。';
  }else{
   ref.pause();picture.hidden=true;video.hidden=false;
   if(!video.getAttribute('src'))video.src=current.media;
   try{await video.play();$('preview-message').textContent='本地演示页的实际操作录制，可使用视频控件暂停或拖动。';}
   catch{$('preview-message').textContent='请点击视频上的播放按钮，或直接打开案例。';}
  }
 });
 document.querySelectorAll('[data-reference-time]').forEach(b=>b.addEventListener('click',async()=>{
  video.pause();ref.currentTime=Number(b.dataset.referenceTime);try{await ref.play();}catch{}
 }));
 ref.addEventListener('play',()=>video.pause());video.addEventListener('play',()=>ref.pause());
 document.addEventListener('visibilitychange',()=>{if(document.hidden){ref.pause();video.pause();}});
 try{
  const response=await fetch('summary/content.json');if(!response.ok)throw new Error('Missing summary content');data=await response.json();
  for(const [i,e] of data.experiments.entries()){
   const article=document.createElement('article');article.className='experiment';article.dataset.group=e.group;
   const image=new Image();image.src=e.image;image.alt=e.title+'：实际产物画面';image.loading='lazy';
   const body=document.createElement('div');body.className='experiment-body';
   const top=document.createElement('div');top.className='experiment-top';const label=document.createElement('span'),status=document.createElement('span');label.textContent=String(i+1).padStart(2,'0')+' / '+e.label;status.textContent=e.status;top.append(label,status);
   const h=document.createElement('h3');h.textContent=e.title;const q=document.createElement('p');q.className='experiment-question';q.textContent=e.question;
   const dl=document.createElement('dl');pair(dl,'尝试与留下的产物',e.result);pair(dl,'经验与局限',e.lesson);
   const links=document.createElement('div');links.className='experiment-links';links.append(link('看实际演示 ↗',e.href));if(e.extra)links.append(link(e.extra.label+' ↗',e.extra.href));links.append(link('查看记录',e.doc));
   body.append(top,h,q,dl,links);article.append(image,body);$('experiment-grid').append(article);
  }
  for(const [i,d] of data.directions.entries()){
   const article=document.createElement('article');article.className='direction';const image=new Image();image.src=d.image;image.alt=d.title+'的方向样片';image.loading='lazy';
   const body=document.createElement('div'),number=document.createElement('p');number.className='tiny';number.textContent=String(i+1).padStart(2,'0')+' / '+d.product;
   const h=document.createElement('h3');h.textContent=d.title;const task=document.createElement('p');task.className='task';task.textContent=d.task;
   const dl=document.createElement('dl');pair(dl,'已有的探索',d.available);pair(dl,'继续验证什么',d.next);
   body.append(number,h,task,dl,link('打开这个方向的样片 ↗','directions.html?case='+d.id));article.append(image,body);$('direction-grid').append(article);
  }
  document.querySelectorAll('[data-preview]').forEach(b=>b.addEventListener('click',()=>selectPreview(b.dataset.preview)));
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
   let count=0;document.querySelectorAll('.experiment').forEach(card=>{card.hidden=b.dataset.filter!=='all'&&card.dataset.group!==b.dataset.filter;if(!card.hidden)count++;});
   document.querySelectorAll('[data-filter]').forEach(k=>k.setAttribute('aria-pressed',String(k===b)));
   $('filter-status').textContent='当前显示'+count+'个探索主题';
  }));
  selectPreview('poem');
 }catch{$('page-error').hidden=false;}
 const sections=[...document.querySelectorAll('section[id]')],navLinks=[...document.querySelectorAll('.navigation a')];
 function mark(){let active='research-map';for(const s of sections)if(s.getBoundingClientRect().top<180)active=s.id;navLinks.forEach(a=>a.classList.toggle('is-active',a.hash==='#'+active));}
 addEventListener('scroll',mark,{passive:true});mark();
})();
