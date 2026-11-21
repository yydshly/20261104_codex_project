(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 class DirectionDetails{
  constructor(data,{seek,pause}){
   this.data=data;this.seek=seek;this.pause=pause;this.id='';this.phase=-1;
   $('inspect-open').addEventListener('click',()=>this.open());
   $('detail-crop').addEventListener('click',()=>this.open());
   $('inspect-close').addEventListener('click',()=>$('art-inspector').close());
   $('inspect-prev').addEventListener('click',()=>this.seek(Math.max(0,this.phase-1)));
   $('inspect-next').addEventListener('click',()=>this.seek(Math.min(3,this.phase+1)));
   $('inspect-scale').addEventListener('input',()=>this.scale(Number($('inspect-scale').value)));
   $('art-inspector').addEventListener('keydown',e=>{if(e.target===$('inspect-scale'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.seek(Math.max(0,Math.min(3,this.phase+(e.key==='ArrowLeft'?-1:1))));}});
  }
  select(id){this.id=id;this.phase=-1;const item=this.data[id];$('detail-intro').textContent=item.intro;$('detail-takeaway').textContent=item.takeaway;}
  update(phase){if(this.phase===phase)return;this.phase=phase;this.conditionKey='';const s=this.data[this.id].stages[phase];this.stage=s;
   $('detail-count').textContent=String(phase+1).padStart(2,'0')+' / 04';$('detail-title').textContent=s.title;$('detail-story').textContent=s.story;$('detail-look').textContent=s.look;$('detail-connection').textContent=s.connection;
   const [x,y,scale]=s.focus,im=$('detail-image');im.src=s.image;im.alt=s.title+'：局部画稿';im.style.width=scale*100+'%';im.style.height=scale*100+'%';im.style.left=(50-x*scale)+'%';im.style.top=(50-y*scale)+'%';$('detail-crop').setAttribute('aria-label','放大查看：'+s.title);
   const focused=document.activeElement;$('inspect-title').textContent=s.title;$('inspect-story').textContent=s.story;$('inspect-image').src=s.image;$('inspect-image').alt=s.title+'的完整画稿';$('inspect-prev').disabled=phase===0;$('inspect-next').disabled=phase===3;
   if(focused===$('inspect-next')&&phase===3)$('inspect-prev').focus();else if(focused===$('inspect-prev')&&phase===0)$('inspect-next').focus();
   $('inspect-scale').value='100';this.scale(100);$('inspect-viewport').scrollTo(0,0);
  }
  setCondition(value){if(this.id!=='software')return;const key=this.phase+':'+value;if(this.conditionKey===key)return;this.conditionKey=key;let story=this.stage.story;if(value==='weekday'&&this.phase>=2)story=this.phase===2?'当前选择的是周一至周五，通知对应十八点。改回普通周日，判断也会随之改变。':'当前条件为周一至周五，这份虚构通知支持十八点。结论需要和条件、来源一起保留。';$('detail-story').textContent=story;$('inspect-story').textContent=story;}
  open(){if(!this.stage)return;this.pause();$('art-inspector').showModal();}
  scale(value){$('inspect-image').style.width=value+'%';$('inspect-scale-value').textContent=value+'%';}
 }
 window.DirectionDetails=DirectionDetails;
})();
