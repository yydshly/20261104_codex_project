import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report={errors:[],frames:[],stages:[],audio:[]};
const url='http://127.0.0.1:4197/glasshouse/index.html?detail=facial&seaside=1&qa=1&v=seaside39';
async function ready(page){
 page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto(url);await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 assert.equal(await page.locator('#scene').getAttribute('data-guide-asset'),'personal-guide-facial.glb');
}
const state=page=>page.locator('#scene').evaluate(e=>({time:performance.now(),position:JSON.parse(e.dataset.guidePosition),phase:e.dataset.guidePhase,rock:JSON.parse(e.dataset.rockVisit),contact:JSON.parse(e.dataset.footContact),audio:JSON.parse(e.dataset.seaAudio),camera:JSON.parse(e.dataset.cameraGuard)}));
try{
 const context=await browser.newContext({viewport:{width:1280,height:1000}}),page=await context.newPage();await ready(page);
 assert.equal((await state(page)).audio.context,'locked');await page.locator('#sea-sound').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.seaAudio).ready,{timeout:30000});
 await page.exposeFunction('saveSeasideVideo',value=>writeFile('screenshots/seaside39-auto-journey.webm',Buffer.from(value,'base64')));
 await page.evaluate(()=>{
  const stream=new MediaStream([...document.querySelector('#scene').captureStream(24).getVideoTracks(),...window.__seaAudio.recordingStream.getAudioTracks()]),recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:2600000}),chunks=[];
  window.seasideRecorder=recorder;window.seasideSaved=false;recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onstop=async()=>{const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));await window.saveSeasideVideo(btoa(value));window.seasideSaved=true;stream.getVideoTracks().forEach(t=>t.stop());};recorder.start(500);
 });
 await page.locator('#rock-start').click();await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.rockVisit).stage==='walking-out');let last='',hero=false,contact=false,returned=false;
 for(let i=0;i<450;i++){
  await page.waitForTimeout(140);const s=await state(page);report.frames.push(s);
  if(s.rock.stage!==last){last=s.rock.stage;report.stages.push(last);console.log('stage',last);await page.screenshot({path:`screenshots/seaside39-auto-stage-${last}.png`});}
  if(last==='lower'&&s.rock.elapsed>2.4&&!contact){contact=true;report.contact=s;await page.screenshot({path:'screenshots/seaside39-auto-contact.png'});}
  if(last==='watch'&&s.rock.elapsed>3&&!hero){hero=true;report.hero=s;await page.screenshot({path:'screenshots/seaside39-auto-hero.png'});}
  if(last==='idle'&&i>20){returned=true;break;}
 }
 assert(returned&&hero&&contact);assert.deepEqual(report.stages,['walking-out','turn','align','lower','watch','rise','exit','walking-back','idle']);
 const end=await state(page);assert(Math.hypot(end.position[0]+1.25,end.position[2]-6.7)<.06);assert.equal(end.rock.pose,null);
 await page.evaluate(()=>window.seasideRecorder.stop());await page.waitForFunction(()=>window.seasideSaved,{timeout:15000});
 report.hits=await page.evaluate(()=>window.__seaAudio.hits);assert(report.hits.length>12);assert(report.hits.some(h=>h.material==='wood'));assert(report.hits.some(h=>h.material==='sand'));
 const seated=report.frames.filter(s=>s.rock.stage==='watch');assert(seated.every(s=>s.contact.feet.every(f=>f.clearance>-.008&&f.clearance<.035)));assert(seated.every(s=>s.rock.pose.amount===1));
 assert(seated.every(s=>s.rock.pose.contact.probes>100&&s.rock.pose.contact.minimumSurfaceGap>-.005),'coat and seat-facing skin stay above the fitted surface');
 assert(Math.max(...seated.map(s=>s.rock.pose.pelvis[1]))-Math.min(...seated.map(s=>s.rock.pose.pelvis[1]))<.003);
 assert(Math.max(...report.frames.map(s=>s.audio.rms))>.001);
 await page.locator('#sea-sound').click();await page.waitForTimeout(1000);const muted=await state(page);assert.equal(muted.audio.enabled,false);assert(muted.audio.rms<.00003);report.audio.push({check:'muted',...muted.audio});
 await page.locator('#sea-volume').fill('35');await page.waitForTimeout(350);assert.equal((await state(page)).audio.enabled,false,'changing volume must preserve explicit mute');
 await page.locator('#sea-sound').click();await page.waitForTimeout(700);report.audio.push({check:'resumed',...(await state(page)).audio});assert((await state(page)).audio.rms>.0001);
 await context.close();
 // A real phone viewport: pause in the fitted pose, then interrupt by choosing
 // another destination. The body must stand and leave the seat before walking.
 if(!process.env.SEA_CAPTURE_ONLY){
 const phoneContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}),phone=await phoneContext.newPage();await ready(phone);await phone.locator('#rock-start').tap();
 await phone.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.rockVisit).stage==='watch',{timeout:60000});await phone.waitForTimeout(1400);
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth),390);await phone.screenshot({path:'screenshots/seaside39-auto-mobile.png'});
 await phone.locator('#toggle-panel').tap();await phone.locator('#pause').tap();await phone.locator('#toggle-panel').tap();await phone.waitForTimeout(600);const paused=await state(phone);await phone.waitForTimeout(650);const frozen=await state(phone);
 assert.equal(frozen.rock.elapsed,paused.rock.elapsed);assert.deepEqual(frozen.rock.pose.pelvis,paused.rock.pose.pelvis);assert(frozen.audio.rms<.00003);assert.equal(frozen.audio.steps,paused.audio.steps);
 report.phonePause={paused,frozen};await phone.locator('[data-shot="shore"]').tap();
 const exitStages=[];for(let i=0;i<250;i++){await phone.waitForTimeout(150);const s=await state(phone);if(exitStages.at(-1)!==s.rock.stage)exitStages.push(s.rock.stage);if(s.phase==='walking'&&s.rock.pose===null)break;}
 assert(exitStages.includes('rise')&&exitStages.includes('exit'));report.phoneExit=exitStages;
 await phone.waitForSelector('#scene[data-guide-stop="shore"][data-guide-phase="gesture"]',{timeout:35000});assert.equal((await state(phone)).rock.pose,null);
 await phoneContext.close();
 }
 assert.deepEqual(report.errors,[]);report.result='passed; final visual judgment remains with user';console.log(JSON.stringify({result:report.result,frames:report.frames.length,stages:report.stages,hits:report.hits.length,phoneExit:report.phoneExit,errors:report.errors}));
}catch(error){report.result='failed';report.error=String(error.stack||error);throw error;}
finally{await writeFile(`screenshots/seaside39-auto-${process.env.SEA_CAPTURE_ONLY?'capture':'checks'}.json`,JSON.stringify(report,null,2));await browser.close();}
