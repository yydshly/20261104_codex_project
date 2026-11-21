import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:1000},acceptDownloads:true}),report={errors:[],samples:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const url='http://127.0.0.1:4197/glasshouse/index.html?detail=facial&portrait=face&pose=still&v=face36';
const read=()=>page.locator('#scene').evaluate(e=>JSON.parse(e.dataset.facialState));
const mouthWeight=s=>Object.entries(s.weights).filter(([k])=>k.startsWith('viseme')).reduce((a,[,v])=>a+v,0);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
async function ready(){await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(300);}
try{
 await page.goto(url);await ready();assert.equal(await page.locator('#face-controls').isVisible(),true);
 const identity=await page.locator('#scene').getAttribute('data-facial-identity');assert.match(identity,/Own 0597/);assert.match(identity,/no Microsoft/);report.identity=identity;
 await page.locator('#face-auto-blink').uncheck();await page.waitForFunction(()=>!(JSON.parse(document.querySelector('#scene').dataset.facialState).weights.eyeBlinkLeft>.001));
 const idle=await read();await page.locator('#face-blink').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.facialState).weights.eyeBlinkLeft>.3,{timeout:10000,polling:'raf'});const blink=await read();report.blink={...blink,baseline:idle.vertices.lid,displacement:distance(idle.vertices.lid,blink.vertices.lid)};assert(report.blink.displacement>.0005);await page.waitForTimeout(700);await page.locator('#face-auto-blink').check();
 await page.locator('#face-gaze').click();await page.waitForFunction(()=>!JSON.parse(document.querySelector('#scene').dataset.facialState).gaze);await page.locator('#face-gaze').click();
 await page.locator('#face-play').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.facialState).time>.7,{timeout:10000});
 for(let i=0;i<10;i++){await page.waitForTimeout(120);report.samples.push(await read());}
 assert(report.samples.some(s=>mouthWeight(s)>.2));assert(report.samples.some(s=>distance(s.vertices.mouth,idle.vertices.mouth)>.001));
 await page.locator('#face-pause').click();await page.waitForTimeout(500);const paused=await read();await page.waitForTimeout(600);const frozen=await read();assert.equal(paused.time,frozen.time);assert.equal(frozen.paused,true);assert(mouthWeight(frozen)<.015);report.paused=frozen;
 await page.locator('#face-pause').click();await page.waitForFunction(t=>JSON.parse(document.querySelector('#scene').dataset.facialState).time>t+.3,frozen.time,{timeout:10000});report.resumed=await read();
 await page.locator('#face-stop').click();await page.waitForTimeout(500);const stopped=await read();assert.equal(stopped.time,0);assert.equal(stopped.playing,false);assert(mouthWeight(stopped)<.015);report.stopped=stopped;
 // Record the actual canvas and the same playing audio element, not an offline render.
 await page.exposeFunction('saveFaceRecording',async base64=>{await writeFile('screenshots/face36-speaking.webm',Buffer.from(base64,'base64'));});
 report.recording=await page.evaluate(async()=>{
  const audio=document.querySelector('#face-audio'),canvas=document.querySelector('#scene'),context=new AudioContext(),source=context.createMediaElementSource(audio),destination=context.createMediaStreamDestination();source.connect(destination);source.connect(context.destination);await context.resume();
  const stream=new MediaStream([...canvas.captureStream(24).getVideoTracks(),...destination.stream.getAudioTracks()]);const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:1600000}),chunks=[];
  window.faceRecorder=recorder;window.faceRecordingSaved=false;
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onstop=async()=>{const bytes=new Uint8Array(await new Blob(chunks,{type:recorder.mimeType}).arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));await window.saveFaceRecording(btoa(value));window.faceRecordingSaved=true;stream.getTracks().forEach(t=>t.stop());};recorder.start(500);
  return {videoTracks:stream.getVideoTracks().length,audioTracks:stream.getAudioTracks().length,method:'Actual webpage canvas and the same HTML audio element'};
 });
 await page.locator('#face-play').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.facialState).time>1,{timeout:10000});await page.screenshot({path:'screenshots/face36-speaking.png'});
 while(!(await read()).ended){await page.waitForTimeout(180);report.samples.push(await read());if(report.samples.length>110)throw new Error('Sample speech did not finish');}
 await page.waitForTimeout(500);report.ended=await read();assert(mouthWeight(report.ended)<.015);
 await page.evaluate(()=>window.faceRecorder.stop());await page.waitForFunction(()=>window.faceRecordingSaved,{timeout:15000});
 const allShapes=new Set(report.samples.flatMap(s=>Object.entries(s.weights).filter(([k,v])=>k.startsWith('viseme')&&v>.1).map(([k])=>k)));assert(allShapes.size>=4);report.spokenShapes=[...allShapes];
 // Download the model actually displayed, including its facial shapes.
 await page.locator('#toggle-panel').click();await page.locator('.guide-delivery summary').click();const promised=page.waitForEvent('download');await page.locator('#guide-download').click();const download=await promised,bytes=await readFile(await download.path()),manifest=JSON.parse(await readFile('glasshouse/assets/personal-guide/manifest-facial.json','utf8'));assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);report.download={bytes:bytes.length,sha256:manifest.sha256};
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url.replace('portrait=face','portrait=half'));await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);assert.equal((await read()).automaticBlink,false);await page.screenshot({path:'screenshots/face36-mobile.png'});await page.locator('#face-play').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.facialState).time>.4,{timeout:10000});report.mobile=await read();await page.locator('#face-stop').click();
 assert.deepEqual(report.errors,[]);console.log(JSON.stringify({identity:report.identity,spokenShapes:report.spokenShapes,recording:report.recording,download:report.download,errors:report.errors,mobileTime:report.mobile.time}));
}finally{await writeFile('screenshots/face36-checks.json',JSON.stringify(report,null,2));await browser.close();}
