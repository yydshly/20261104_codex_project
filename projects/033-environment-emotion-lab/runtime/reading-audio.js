import {SPACE} from './reading-space.js';

/** Opt-in field recordings and local MiniMax readings, in one positional audio context. */
export function createReadingAudio(onState=()=>{},{connected=false}={}){
 let analyser,levelData,ctx,master,output,ambience,rainGain,windGain,windowFilter,pondGain,pondFilter,waterGain,natureGain,waterPanner,narrationBus,narrationSource=null,narrationPanner=null;
 let enabled=false,disposed=false,volume=.3,rain=true,narrating=false,narrationPage=-1,narrationLoading=false;
 let ambientReady=false,ambientPromise=null,requestId=0,enableEpoch=0,lastQuack=-Infinity;const buffers=new Map(),loops=new Set(),voices=new Set();
 let spatial={listener:{x:SPACE.seat.x,y:SPACE.seat.y,z:SPACE.seat.z,yaw:-Math.PI/2,pitch:0},outside:0,openness:0,pondDistance:12,doorOpen:false,zone:'room'};
 const state=()=>({enabled,ready:ctx?.state==='running'&&ambientReady,rain,volume,narrating,narrationPage,narrationLoading,provider:'MiniMax',ambience:'CC0-field-recordings',spatial:connected,zone:spatial.zone,bookHeld:Boolean(spatial.bookHeld),bookAnchor:spatial.book||SPACE.book});
 function emit(){onState(state());}
 function target(param,value,seconds=.25){if(ctx&&param)param.setTargetAtTime(value,ctx.currentTime,seconds);}
 function locate(node,p){if(node.positionX){target(node.positionX,p.x,.08);target(node.positionY,p.y??.2,.08);target(node.positionZ,p.z,.08);}else node.setPosition(p.x,p.y??.2,p.z);}
 function panner(point,reference=2){const p=ctx.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=reference;p.maxDistance=45;p.rolloffFactor=.9;p.coneInnerAngle=360;p.coneOuterAngle=360;locate(p,point);return p;}
 function level(){if(!ctx)return;const openness=spatial.openness??0;
  const listener=spatial.listener,book=spatial.book||SPACE.book,voiceDistance=Math.hypot(listener.x-book.x,listener.y-book.y,listener.z-book.z);if(narrationPanner)locate(narrationPanner,book);
  const voicePresence=connected?(spatial.bookOutside?1:1-(spatial.outside??0)*.9)/(1+Math.max(0,voiceDistance-1.5)*.4):1;
  target(master.gain,enabled&&!document.hidden?volume*.9:0,.2);target(ambience.gain,1-(narrating?.70*voicePresence:0),.3);
  target(rainGain.gain,rain?(connected?.36+openness*.34:.90):0,.8);target(windGain.gain,connected?(rain?.07:.10)+openness*.16:(rain?.17:.24),1.2);
  target(windowFilter.frequency,connected?2100+openness*14500:(rain?3100:3700),.65);
  if(connected){target(pondGain.gain,.16+openness*.84,.45);target(pondFilter.frequency,1700+openness*14500,.55);target(waterGain.gain,.52,.5);target(natureGain.gain,.16/(1+spatial.pondDistance*.09),.65);target(narrationBus.gain,spatial.bookOutside?1:1-(spatial.outside??0)*.76,.45);}
 }
 function init(){if(ctx)return;const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)throw new Error('浏览器不支持声音');ctx=new AC();master=ctx.createGain();master.gain.value=0;
  if(connected){const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-12;compressor.knee.value=15;compressor.ratio.value=3;compressor.attack.value=.01;compressor.release.value=.25;master.connect(compressor);compressor.connect(ctx.destination);output=compressor;}else{master.connect(ctx.destination);output=master;}
  ambience=ctx.createGain();ambience.connect(master);windowFilter=ctx.createBiquadFilter();windowFilter.type='lowpass';windowFilter.frequency.value=3100;windowFilter.Q.value=.3;windowFilter.connect(ambience);
  rainGain=ctx.createGain();rainGain.gain.value=0;rainGain.connect(windowFilter);windGain=ctx.createGain();windGain.gain.value=0;windGain.connect(windowFilter);
  if(connected){pondGain=ctx.createGain();pondGain.gain.value=0;pondGain.connect(ambience);pondFilter=ctx.createBiquadFilter();pondFilter.type='lowpass';pondFilter.Q.value=.3;pondFilter.connect(pondGain);waterGain=ctx.createGain();waterPanner=panner({x:SPACE.pond.x,y:.12,z:SPACE.pond.z},3);waterGain.connect(waterPanner);waterPanner.connect(pondFilter);natureGain=ctx.createGain();natureGain.connect(pondFilter);narrationBus=ctx.createGain();narrationBus.connect(master);setPosition(spatial);}
 }
 function load(file){const url=file.startsWith('pond:')?'./assets/audio/'+file.slice(5):'./assets/reading/audio/'+file;
  if(!buffers.has(file)){const promise=fetch(url).then(r=>{if(!r.ok)throw new Error('声音文件未能载入');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).catch(e=>{buffers.delete(file);throw e;});buffers.set(file,promise);}return buffers.get(file);}
 function loop(buffer,gain){const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(gain);source.start();loops.add(source);}
 async function setEnabled(value){if(disposed)return false;const epoch=++enableEpoch;if(!value){enabled=false;stopNarration();level();emit();return false;}init();await ctx.resume();if(disposed||epoch!==enableEpoch)return enabled;enabled=true;level();emit();
  if(!ambientPromise){const files=['rain-leaves.ogg','woodland-wind.ogg',...(connected?['pond:water-stream-loop.wav','pond:pond-night-loop.wav','pond:duck-quack.wav']:[])];ambientPromise=Promise.all(files.map(load)).then(([a,b,water,nature])=>{if(disposed)return;loop(a,rainGain);loop(b,windGain);if(connected){loop(water,waterGain);loop(nature,natureGain);}ambientReady=true;}).catch(e=>{ambientPromise=null;throw e;});}
  try{await ambientPromise;}catch(e){if(epoch===enableEpoch){enabled=false;level();emit();}throw e;}if(disposed||epoch!==enableEpoch)return enabled;level();emit();return enabled;
 }
 function stopNarration(){requestId++;narrationPanner=null;if(narrationSource){const s=narrationSource;narrationSource=null;try{s.stop();}catch{}}narrating=false;narrationLoading=false;narrationPage=-1;level();emit();}
 async function narrate(page){if(!Number.isInteger(page)||page<0||page>2)throw new Error('书页不存在');stopNarration();const token=requestId;narrationLoading=true;narrationPage=page;emit();
  try{await setEnabled(true);if(disposed||!enabled||token!==requestId)return false;const buffer=await load('reading-'+(page+1)+'.mp3');if(disposed||!enabled||token!==requestId)return false;
   const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.value=1.35;source.connect(gain);const position=connected?panner(spatial.book||SPACE.book,1.5):null;narrationPanner=position;if(position){gain.connect(position);position.connect(narrationBus);}else gain.connect(master);
   narrationSource=source;narrationLoading=false;narrating=true;level();emit();source.onended=()=>{source.disconnect();gain.disconnect();position?.disconnect();if(narrationSource===source){narrationSource=null;narrationPanner=null;narrating=false;narrationPage=-1;level();emit();}};source.start();return true;
  }catch(e){if(token===requestId){narrationLoading=false;narrating=false;narrationPage=-1;emit();}throw e;}
 }
 function noise(seconds){const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*seconds),ctx.sampleRate),a=b.getChannelData(0);let v=0;for(let i=0;i<a.length;i++){v=(v+.035*(Math.random()*2-1))/1.035;a[i]=v*3;}return b;}
 function play(kind,point){if(!ctx||!enabled||disposed||document.hidden)return false;
  if(kind==='duck'){if(!connected||ctx.currentTime-lastQuack<1.6)return false;const decoded=buffers.get('pond:duck-quack.wav');if(!decoded||!ambientReady)return false;
   // Buffers are cached as promises; use the same cancellation gate after their microtask.
   const epoch=enableEpoch;lastQuack=ctx.currentTime;decoded.then(buffer=>{if(disposed||!enabled||epoch!==enableEpoch||document.hidden)return;const source=ctx.createBufferSource(),gain=ctx.createGain(),position=panner(point||{x:SPACE.pond.x,y:.25,z:SPACE.pond.z},2.2);source.buffer=buffer;gain.gain.value=.9;source.connect(gain);gain.connect(position);position.connect(pondFilter);voices.add(source);source.onended=()=>{source.disconnect();gain.disconnect();position.disconnect();voices.delete(source);};source.start();});return true;
  }
  const source=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();source.buffer=noise(kind==='page'?.65:.12);filter.type='bandpass';filter.frequency.value=kind==='page'?1800:700;filter.Q.value=.6;const t=ctx.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(kind==='page'?.12:.08,t+.025);gain.gain.exponentialRampToValueAtTime(.001,t+(kind==='page'?.55:.1));source.connect(filter);filter.connect(gain);gain.connect(master);voices.add(source);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();voices.delete(source);};source.start();return true;
 }
 function setPosition(value){if(disposed)return;spatial={...spatial,...value};if(!ctx||!connected)return;const p=spatial.listener,l=ctx.listener,cp=Math.cos(p.pitch||0),sp=Math.sin(p.pitch||0),sy=Math.sin(p.yaw||0),cy=Math.cos(p.yaw||0);locate(l,p);
  const forward=[-sy*cp,sp,-cy*cp],up=[sy*sp,cp,cy*sp];if(l.forwardX){for(const [param,v]of [[l.forwardX,forward[0]],[l.forwardY,forward[1]],[l.forwardZ,forward[2]],[l.upX,up[0]],[l.upY,up[1]],[l.upZ,up[2]]])target(param,v,.08);}else l.setOrientation(...forward,...up);level();
 }
 function visibility(){if(!ctx||disposed)return;level();const action=document.hidden?ctx.suspend():enabled?ctx.resume():Promise.resolve();action.then(emit).catch(()=>{});}
 document.addEventListener('visibilitychange',visibility);
 function getLevels(){if(!ctx||disposed)return null;if(!analyser){analyser=ctx.createAnalyser();analyser.fftSize=2048;output.connect(analyser);levelData=new Float32Array(analyser.fftSize);}analyser.getFloatTimeDomainData(levelData);let energy=0,peak=0;for(const sample of levelData){energy+=sample*sample;peak=Math.max(peak,Math.abs(sample));}return{rmsDbfs:Math.max(-120,10*Math.log10(Math.max(1e-12,energy/levelData.length))),peakDbfs:Math.max(-120,20*Math.log10(Math.max(1e-6,peak))),ducking:ambience.gain.value,openness:spatial.openness,zone:spatial.zone};}
 function captureOutput(){if(!ctx||!enabled||ctx.state!=='running'||!globalThis.MediaRecorder)throw Error('请先在场景内开启声音');const destination=ctx.createMediaStreamDestination();output.connect(destination);const chunks=[],recorder=new MediaRecorder(destination.stream,{mimeType:'audio/webm;codecs=opus'});const finished=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=e=>reject(e.error||Error('声音记录失败'));recorder.onstop=()=>{output.disconnect(destination);destination.stream.getTracks().forEach(t=>t.stop());resolve(new Blob(chunks,{type:recorder.mimeType}));};});recorder.start(500);return{finish(){if(recorder.state!=='inactive')recorder.stop();return finished;}};}
 return{setEnabled,narrate,stopNarration,play,getLevels,setPosition,captureOutput,setOptions(options){if(options.volume!==undefined)volume=Math.max(0,Math.min(.7,options.volume));if(options.rain!==undefined)rain=options.rain;level();emit();},getState:state,
  dispose(){disposed=true;enableEpoch++;requestId++;document.removeEventListener('visibilitychange',visibility);narrationSource?.stop();loops.forEach(s=>s.stop());voices.forEach(s=>s.stop());ctx?.close();buffers.clear();}};
}
