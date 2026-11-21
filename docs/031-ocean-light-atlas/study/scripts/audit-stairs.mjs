import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const version=process.env.SEA_STAIRS_VERSION||'final';
const record=version==='final';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1280,height:1000}}),report={version,errors:[],frames:[],screens:[]};
page.on('pageerror',e=>report.errors.push(String(e)));
async function state(){return page.locator('#scene').evaluate(e=>({time:performance.now(),position:JSON.parse(e.dataset.guidePosition),phase:e.dataset.guidePhase,stop:e.dataset.guideStop,contact:JSON.parse(e.dataset.footContact),pose:JSON.parse(e.dataset.guidePose)}));}
async function startRecording(direction){
 await page.evaluate(direction=>{
  const stream=document.querySelector('#scene').captureStream(24),chunks=[];
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8',videoBitsPerSecond:2600000});
  window.stairRecordingSaved=false;window.stairRecorder=recorder;
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onstop=async()=>{const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));await window.saveStairRecording(direction,btoa(value));window.stairRecordingSaved=true;stream.getTracks().forEach(t=>t.stop());};
  recorder.start(500);
 },direction);
}
async function stopRecording(){await page.evaluate(()=>window.stairRecorder.stop());await page.waitForFunction(()=>window.stairRecordingSaved,{timeout:15000});}
try{
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?detail=facial&stairs=review&v=stairs37');await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 if(record)await page.exposeFunction('saveStairRecording',async(direction,value)=>writeFile(`screenshots/stairs37-${direction}.webm`,Buffer.from(value,'base64')));
 await page.evaluate(()=>{window.stairFrames=[];let last='';const save=()=>{const e=document.querySelector('#scene'),contact=e.dataset.footContact;if(contact&&contact!==last){last=contact;const p=JSON.parse(e.dataset.guidePosition);if(p[2]>7.2&&p[2]<10.9)window.stairFrames.push({time:performance.now(),position:p,phase:e.dataset.guidePhase,contact:JSON.parse(contact)});}requestAnimationFrame(save);};requestAnimationFrame(save);});
 await page.locator('[data-shot="tide"]').click();
 const captured=new Set();let down=false,up=false,recording=null;const recorded=new Set();
 for(let i=0;i<450;i++){
  await page.waitForTimeout(120);const s=await state();
  if(record&&s.phase==='walking'&&s.position[0]<-1.3&&s.position[0]>-1.7){
   const direction=down?'up':'down',z=s.position[2];
   if(!recorded.has(direction)&&!recording&&(down?z<10.55&&z>9.8:z>7.35&&z<8)){await startRecording(direction);recording=direction;recorded.add(direction);}
   if(recording&&(down?z<7.3:z>10.55)){await stopRecording();recording=null;}
  }
  if(s.phase==='walking'&&s.contact.stairs&&s.position[0]<.1&&s.position[0]>-3.1&&s.position[2]>7.7&&s.position[2]<10.3){const zone=Math.round(s.position[2]*2)/2,key=`${down?'up':'down'}-${zone}`;if(!captured.has(key)&&[8,8.5,9,9.5,10].includes(zone)){captured.add(key);await page.screenshot({path:`screenshots/stairs37-${version}-${key}.png`});report.screens.push(key);}}
  if(!down&&s.stop==='tide'&&s.phase!=='walking'){down=true;await page.locator('[data-shot="shore"]').click();console.log('descending completed');}
  else if(down&&s.stop==='shore'&&s.phase!=='walking'){up=true;break;}
 }
 if(recording)await stopRecording();
 assert(down&&up,'both stair directions complete');report.frames=await page.evaluate(()=>window.stairFrames);assert.deepEqual(report.errors,[]);
 const stairs=report.frames.filter(s=>s.contact.stairs&&s.phase==='walking'&&s.position[0]<-1.3&&s.position[0]>-1.7&&s.position[2]>7.4&&s.position[2]<10.5);
 report.metrics={frames:stairs.length,minimumClearance:Math.min(...stairs.flatMap(s=>s.contact.feet.map(f=>f.clearance))),maximumTargetError:Math.max(...stairs.flatMap(s=>s.contact.feet.map(f=>Math.hypot(...f.ankle.map((n,i)=>n-f.target[i]))))),maximumStanceClearance:Math.max(...stairs.flatMap(s=>s.contact.feet.filter(f=>!f.swing).map(f=>f.clearance)))};
 assert(stairs.length>100,'sample the actual ascent and descent');
 if(version!=='before'){assert(report.metrics.minimumClearance>-.008);assert(report.metrics.maximumTargetError<.015,'the planned landing must be reachable, not just corrected onto another tread');assert(report.metrics.maximumStanceClearance<.035);}
 if(record)assert.equal(recorded.size,2);
 console.log(JSON.stringify({frames:report.frames.length,metrics:report.metrics,screens:report.screens,errors:report.errors}));
}finally{if(!report.frames.length)report.frames=await page.evaluate(()=>window.stairFrames||[]).catch(()=>[]);await writeFile(`screenshots/stairs37-${version}.json`,JSON.stringify(report));await browser.close();}
