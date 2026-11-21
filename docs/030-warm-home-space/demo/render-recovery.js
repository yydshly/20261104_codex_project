export function renderSizing(width,height,deviceRatio=1){
  const ratio=Math.min(deviceRatio,1.5,Math.sqrt(1350000/Math.max(1,width*height)));
  return {ratio,samples:2};
}

export function createRecoveryWarmup(){
  let frames=90;
  return {
    start(){frames=0;},
    presented(){if(frames<90)frames++;},
    get active(){return frames<90;},
    get maxFps(){return frames<90?30:60;},
  };
}

// A restored GL context does not restore pixels previously rendered into
// environment maps or postprocessing targets. Wait for rebuilding AND a new
// presented frame before removing the recovery screen.
export function createContextRecovery(canvas,{suspend,rebuild,publish,fallback,setTimer=setTimeout,clearTimer=clearTimeout,timeout=8000}){
  let state='ready',epoch=0,timer,losses=0,restores=0;
  const report=()=>publish({state,losses,restores});
  const clear=()=>{if(timer!==undefined)clearTimer(timer);timer=undefined;};
  const fail=reason=>{if(state==='failed')return;clear();state='failed';report();fallback(reason);};
  const watch=()=>{clear();timer=setTimer(()=>fail('图形恢复超时'),timeout);};
  const lost=event=>{
    event.preventDefault();epoch++;losses++;state='lost';suspend();report();watch();
  };
  const restored=()=>{
    const current=epoch;state='restoring';report();watch();
    Promise.resolve().then(rebuild).then(()=>{
      if(current!==epoch||state!=='restoring')return;
      clear();restores++;state='warming';report();
    }).catch(error=>{if(current===epoch)fail(String(error));});
  };
  canvas.addEventListener('webglcontextlost',lost);
  canvas.addEventListener('webglcontextrestored',restored);
  report();
  return {
    canRender:()=>state==='ready'||state==='warming',
    presented(){if(state==='warming'){clear();state='ready';report();}},
    fail,
    dispose(){clear();epoch++;canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored);},
  };
}

export const recoveryStorageKey='warm-home:render-recovery:v1';
export function validRecoverySnapshot(record,now=Date.now()){
  if(!record||record.version!==1||!Number.isFinite(record.time)||now-record.time>60000||now<record.time)return null;
  const p=record.snapshot?.player;
  if(!p||!['x','y','z','yaw','pitch'].every(k=>Number.isFinite(p[k])))return null;
  if(p.x< -2.48||p.x>2.48||p.z< -4.43||p.z>8.52||p.y<.8||p.y>1.6||Math.abs(p.pitch)>1.25)return null;
  return record.snapshot;
}
