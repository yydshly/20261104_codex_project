import {CONFIG,getFrameState} from './timeline-state.js';
const $=s=>document.querySelector(s);let frame=0;let playing=false;let animation;let start=0;
const palettes={green:['#2f6e56','#d87969','#e3bd57'],pop:['#315bbd','#d63397','#e8d944']};
function render(){
 const s=getFrameState(frame);frame=s.frame;const colors=palettes[$('#palette').value]||palettes.green;
 $('#frame').value=frame;$('#frame-number').value=frame;
 $('#readout').textContent='F'+String(frame).padStart(3,'0')+' / 299 · '+s.seconds.toFixed(2)+'s · '+s.chapter;
 $('#stage-frame').textContent='F'+String(frame).padStart(3,'0');
 $('#stage-state').textContent=s.chapter+' · 示例第'+s.beat+'拍';
 $('#headline').textContent=$('#title-input').value||'小柚 · 灵感开场';$('#line').textContent=s.line;
 $('#words').setAttribute('transform','translate('+Math.round(-36*(1-s.enter))+' 0)');
 $('#words').setAttribute('opacity',String(.35+.65*s.enter));
 $('#rings').setAttribute('transform','translate(1000 260) scale('+(.9+.1*s.pulse).toFixed(4)+')');
 $('#rings > circle').setAttribute('stroke',colors[1]);
 for(let i=0;i<3;i++){
  const el=$('#card'+i);el.setAttribute('display',i<s.copies?'inline':'none');
  const x=s.copies===1?138:90+i*280;const y=s.copies===1?160:155+(i%2)*20;
  el.setAttribute('transform','translate('+Math.round(x+40*(1-s.enter))+' '+y+') rotate('+((i-1)*3*s.pulse).toFixed(4)+' 130 115)');
  el.querySelector('rect').setAttribute('fill',colors[i]);
 }
 [...$('#beats').children].forEach((el,i)=>{el.setAttribute('fill',(s.beat-1)%4===i?colors[1]:'#b9c7b4');el.setAttribute('r',(s.beat-1)%4===i?String(8+4*s.pulse):'8');});
 $('.stage').dataset.frame=String(frame);$('.stage').dataset.chapter=s.chapter;$('.stage').dataset.copies=String(s.copies);
}
function pause(){playing=false;cancelAnimationFrame(animation);$('#play').textContent='播放结构预演';}
function seek(value){pause();frame=Number(value);render();}
function tick(now){if(!playing)return;frame=Math.floor((now-start)*CONFIG.fps/1000);if(frame>=CONFIG.durationFrames-1){frame=299;pause();render();return;}render();animation=requestAnimationFrame(tick);}
$('#play').addEventListener('click',()=>{if(playing){pause();return;}if(frame===299)frame=0;playing=true;$('#play').textContent='暂停预演';start=performance.now()-frame*1000/CONFIG.fps;animation=requestAnimationFrame(tick);});
$('#frame').addEventListener('input',e=>seek(e.target.value));$('#frame-number').addEventListener('input',e=>seek(e.target.value));
document.querySelectorAll('[data-frame]').forEach(b=>b.addEventListener('click',()=>seek(b.dataset.frame)));
$('#title-input').addEventListener('input',render);$('#palette').addEventListener('change',render);render();

