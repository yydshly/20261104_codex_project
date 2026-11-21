import { supportHeight } from './walk-surface.js';

// Local CC0 recordings, at their original rate/pitch. Only the small footfall
// transients are synthesized. Attribution and processing: assets/ambience/.
export function createSeasideAudio({canvas,button,volume,notice}){
 let context,master,analyser,destination,loading,disposed=false,enabled=true,ready=false,failed=false,sync=null;
 let gainValue=Number(volume.value)/100,lastTime=0,stepCount=0,lastStep=-10,previous=[],layers=[];
 const hits=[],buffers={};let mix={surf:0,wind:0},paused=false,levels=0;
 function publish(){
  button.textContent=failed?'声音未载入 · 重试':loading&&!ready?'声音准备中…':!context?'开启海边声音':enabled?'海边声音 · 开':'海边声音 · 关';
  button.setAttribute('aria-pressed',String(!!context&&enabled&&!failed));
  canvas.dataset.seaAudio=JSON.stringify({ready,enabled:!!context&&enabled,context:context?.state||'locked',failed,paused,volume:gainValue,steps:stepCount,lastStep:hits.at(-1)||null,mix,sync,rms:Number(levels.toFixed(6))});
 }
 function footBuffer(material,variant){
  const key=`${material}-${variant}`;if(buffers[key])return buffers[key];
  const duration=material==='wood'?.18:.25,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);let seed=713+variant*321;
  let low=0;
  for(let i=0;i<data.length;i++){
   const t=i/context.sampleRate;seed=(1664525*seed+1013904223)>>>0;const n=seed/2147483648-1;low=low*.82+n*.18;
   const envelope=(1-Math.exp(-t*700))*Math.exp(-t*(material==='wood'?30:19));
   data[i]=material==='wood'?(Math.sin(t*(110+variant*7)*Math.PI*2)*.36+low*.62)*envelope:(low*.6+n*.12)*envelope;
  }
  buffers[key]=buffer;return buffer;
 }
 async function activate(){
  if(disposed)return;
  if(!context){
   context=new AudioContext();master=context.createGain();master.gain.value=0;analyser=context.createAnalyser();analyser.fftSize=512;destination=context.createMediaStreamDestination();
   master.connect(analyser);analyser.connect(context.destination);analyser.connect(destination);
  }
  await context.resume();
  if(!ready&&!loading){
   failed=false;loading=true;publish();
   try{
    // Decode all recordings before creating sources so retries cannot double a layer.
    const decoded=await Promise.all(['ocean-surf.ogg','wind.ogg','surf-texture43.ogg'].map(async file=>{
     const response=await fetch(new URL(`./assets/ambience/${file}`,import.meta.url));if(!response.ok)throw new Error(`Ambient audio ${response.status}`);
     return context.decodeAudioData(await response.arrayBuffer());
    }));
    if(disposed)return;
    layers=['bed','wind','breaking','wash'].map((kind,i)=>{
     const buffer=decoded[i<2?i:2];
     const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain(),pan=context.createStereoPanner();
     const spatial=i>1?context.createPanner():pan;
     if(i>1){spatial.panningModel='HRTF';spatial.distanceModel='inverse';spatial.refDistance=6;spatial.rolloffFactor=.45;}
     source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=kind==='bed'?1500:kind==='wash'?2800:10000;gain.gain.value=0;
     source.connect(filter);filter.connect(gain);gain.connect(spatial);spatial.connect(master);source.start(0,i===0?8:i===3?4:2);
     return {source,filter,gain,pan:spatial,kind};
    });ready=true;
   }catch(error){failed=true;notice('环境声音未载入，可以点击声音按钮重试');console.warn(error.message);}
   finally{loading=false;publish();}
  }
  publish();
 }
 button.addEventListener('click',()=>{if(context&&ready)enabled=!enabled;activate();});
 volume.addEventListener('input',()=>{gainValue=Number(volume.value)/100;activate();});
 function step(foot,side,camera){
  if(!context||!ready||!enabled||paused)return;
  const now=context.currentTime;if(now-lastStep<.22)return;lastStep=now;
  const material=supportHeight(foot.ankle[0],foot.ankle[2])>1?'wood':'sand';
  const source=context.createBufferSource(),gain=context.createGain(),pan=context.createPanner();
  source.buffer=footBuffer(material,stepCount%5);source.playbackRate.value=.96+(stepCount%4)*.025;gain.gain.value=material==='wood'?.30:.50;
  pan.panningModel='HRTF';pan.distanceModel='inverse';pan.refDistance=2;pan.rolloffFactor=.45;
  pan.positionX.value=foot.ankle[0];pan.positionY.value=foot.ankle[1];pan.positionZ.value=foot.ankle[2];
  source.connect(gain);gain.connect(pan);pan.connect(master);source.start();source.onended=()=>{source.disconnect();gain.disconnect();pan.disconnect();};
  stepCount++;hits.push({side,material,time:Number(lastTime.toFixed(3))});if(hits.length>120)hits.shift();
 }
 function update(dt,{camera,avatar,phase,time,scenePaused=false,speaking=false,wave=.36,surf=null,surfVisible=true}){
  paused=scenePaused||document.hidden;lastTime=time;
  if(context&&ready){
   const now=context.currentTime,p=camera.position,inside=p.x<-.4&&p.x>-9.6&&p.z<6.2&&p.z>-.2;
   const duck=speaking?.38:1,bed=(inside?.018:.035)*duck,wind=(inside?.018:.065+.06*wave)*(speaking?.45:1);
   const breaking=surf&&surfVisible?(inside?.14:.62)*surf.breaking*surf.energy*duck:0,wash=surf&&surfVisible?(inside?.10:.36)*surf.wash*surf.energy*duck:0;
   const gains={bed,wind,breaking,wash};
   mix={surf:Number((bed+breaking+wash).toFixed(3)),wind:Number(wind.toFixed(3)),bed,breaking,wash};
   sync=surf?{time,visualPhase:surf.phase,crest:surf.crest,foam:surf.foam,retreat:surf.retreat,breaking:surf.breaking,wash:surf.wash,source:surf.source,surfVisible,method:'Shared visible nearshore phase; steady real surf texture, not a free-running wave-event loop'}:null;
   master.gain.setTargetAtTime(enabled&&!paused?gainValue:0,now,.10);
   for(const layer of layers){
    const {kind}=layer;layer.gain.gain.setTargetAtTime(gains[kind],now,kind==='breaking'||kind==='wash'?.045:.4);
    const frequency=kind==='bed'?(inside?1000:1800):kind==='wind'?(inside?1100:2600):kind==='breaking'?(inside?2300:10000):(inside?1200:3000);
    layer.filter.frequency.setTargetAtTime(frequency,now,.18);
    if(surf&&['breaking','wash'].includes(kind))for(const [axis,value] of Object.entries(surf.source))layer.pan['position'+axis.toUpperCase()].setTargetAtTime(value,now,.10);
   }
   const listener=context.listener,forward=camera.getWorldDirection(camera.position.clone());
   for(const [param,value] of [['positionX',p.x],['positionY',p.y],['positionZ',p.z],['forwardX',forward.x],['forwardY',forward.y],['forwardZ',forward.z],['upX',0],['upY',1],['upZ',0]])listener[param]?.setTargetAtTime(value,now,.04);
   const walking=['walking','manual-walking','rock-align','rock-exit'].includes(phase),feet=avatar.footContactSample().feet;
   for(let i=0;i<feet.length;i++){
    const foot=feet[i],last=previous[i];
    if(walking&&!paused&&last&&foot.clearance<.019&&(last.clearance>=.019||last.swing&&!foot.swing))step(foot,foot.side,camera);
   }
   previous=feet.map(f=>({clearance:f.clearance,swing:f.swing}));
   const samples=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(samples);levels=Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length);
  }
  publish();
 }
 const hide=()=>{if(context&&document.hidden)master.gain.setTargetAtTime(0,context.currentTime,.04);};document.addEventListener('visibilitychange',hide);
 addEventListener('pagehide',()=>{disposed=true;for(const layer of layers)layer.source.stop();context?.close();document.removeEventListener('visibilitychange',hide);},{once:true});
 publish();return {activate,update,get recordingStream(){return destination?.stream;},get hits(){return [...hits];}};
}
