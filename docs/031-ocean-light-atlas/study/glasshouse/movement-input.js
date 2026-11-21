const bindings={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
export function createMovementInput({onIntent}){
  const keys=new Set(),touches=new Map();
  const clear=()=>{keys.clear();touches.clear();document.querySelectorAll('[data-move]').forEach(b=>b.classList.remove('held'));};
  addEventListener('keydown',event=>{
    const direction=bindings[event.code];if(!direction||event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
    if(event.target.closest?.('input,textarea,select,[contenteditable="true"],dialog[open]'))return;
    event.preventDefault();if(!keys.has(event.code)){onIntent();keys.add(event.code);}
  });
  addEventListener('keyup',event=>keys.delete(event.code));
  addEventListener('blur',clear);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  document.querySelectorAll('button[data-move]').forEach(button=>{
    button.addEventListener('pointerdown',event=>{event.preventDefault();onIntent();button.setPointerCapture(event.pointerId);touches.set(event.pointerId,button.dataset.move);button.classList.add('held');});
    const release=event=>{touches.delete(event.pointerId);button.classList.remove('held');};
    button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  });
  return {clear,read(){const active=new Set([...keys].map(k=>bindings[k]).concat([...touches.values()]));return {x:Number(active.has('right'))-Number(active.has('left')),z:Number(active.has('forward'))-Number(active.has('back'))};}};
}
