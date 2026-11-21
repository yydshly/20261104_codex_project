import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// A separate ephemeral test context: never attaches to the user's browser,
// profile, tabs or accounts. All actor transitions use visible buttons/keys.
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const inspect=process.argv.includes('--inspect'),report={errors:[],frames:[],events:[]};
const sceneState=page=>page.locator('#scene').evaluate(e=>({time:performance.now(),position:JSON.parse(e.dataset.guidePosition),mode:e.dataset.controlMode,phase:e.dataset.guidePhase,seat:JSON.parse(e.dataset.rockVisit),feet:JSON.parse(e.dataset.footContact),guard:JSON.parse(e.dataset.cameraGuard),audio:JSON.parse(e.dataset.seaAudio)}));
async function ready(page,contact=false){
 page.on('pageerror',e=>report.errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?detail=facial&seaside=${contact?'contact':'1'}&qa=1&v=sofa41`);
 await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 assert.equal(await page.locator('#scene').getAttribute('data-guide-asset-hash'),'69927e9fb807a1e63d9d901166c2167d740d2efd8997cdf08295b2c095969f94');
}
async function until(page,match,label,timeout=45000){
 const deadline=Date.now()+timeout;let previous='';
 while(Date.now()<deadline){
  const s=await sceneState(page);report.frames.push(s);
  if(previous!==s.seat.stage){console.log(label,s.seat.stage);previous=s.seat.stage;}
  if(match(s))return s;
  await page.waitForTimeout(140);
 }
 throw new Error(`Timed out: ${label}`);
}
async function approach(page){
 await page.locator('#sofa-approach').click();
 const near=await until(page,s=>s.mode==='manual'&&s.seat.near&&s.seat.seat==='room-sofa','approach');
 assert.equal(near.seat.pose,null);report.events.push({check:'sofa-approach',...near});
}
async function sit(page){
 await page.keyboard.press('e');
 return until(page,s=>s.seat.stage==='watch'&&s.seat.elapsed>1.5,'sit');
}
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true}),page=await context.newPage();
 await ready(page);
 const far=await sceneState(page);await page.keyboard.press('e');await page.waitForTimeout(100);
 assert.equal((await sceneState(page)).seat.stage,'idle');assert.deepEqual((await sceneState(page)).position,far.position);
 if(!inspect)await page.locator('#qa-record').click();
 await approach(page);report.hero=await sit(page);console.log('SOFA POSE',JSON.stringify(report.hero));
 await page.screenshot({path:'screenshots/sofa41-room.png'});
 if(inspect){
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1600);await page.screenshot({path:'screenshots/sofa41-mobile.png'});
 }else{
  const watch=await until(page,s=>s.seat.stage==='watch'&&s.seat.elapsed>10.5,'indefinite sit');
  assert.equal(watch.seat.autoReturn,false);assert.equal(watch.seat.pose.amount,1);
  await page.locator('#toggle-panel').click();await page.locator('#pause').click();await page.locator('#toggle-panel').click();
  const paused=await sceneState(page);await page.waitForTimeout(900);const frozen=await sceneState(page);
  assert.deepEqual(paused.seat,frozen.seat);assert.deepEqual(paused.feet,frozen.feet);assert.equal(frozen.audio.paused,true);report.pause={paused,frozen};
  await page.keyboard.press('e');
  const standing=await until(page,s=>s.mode==='manual'&&s.seat.stage==='idle','stand');report.events.push({check:'user-stand',...standing});
  assert(Math.hypot(standing.position[0]+6.8,standing.position[2]-4.3)<.05);assert.equal(standing.seat.pose,null);assert.equal(standing.audio.paused,false);
  const video=page.waitForEvent('download');await page.locator('#qa-record').click();await (await video).saveAs('screenshots/sofa41-interaction.webm');
  const checks=page.waitForEvent('download');await page.locator('#qa-save').click();await (await checks).saveAs('screenshots/sofa41-native-checks.json');
  // Actual narrow-screen controls, including an interrupted lowering movement.
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'在沙发坐下 · E',exact:true}).click();
  await until(page,s=>s.seat.stage==='lower'&&s.seat.pose?.amount>.25&&s.seat.pose.amount<.7,'partial sit');
  const partial=await sceneState(page);await page.keyboard.press('e');const interrupted=await until(page,s=>s.seat.stage==='rise','partial stand');
  assert.equal(interrupted.seat.stage,'rise');assert(Math.abs(partial.seat.pose.amount-interrupted.seat.pose.amount)<.10);report.interruption={partial,interrupted};
  await until(page,s=>s.mode==='manual'&&s.seat.stage==='idle','partial recovery');
  report.mobile=await sit(page);await page.waitForTimeout(1000);await page.screenshot({path:'screenshots/sofa41-mobile.png'});
  const hit=await page.locator('#rock-stand').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===e;});assert(hit,'phone stand button must be unobstructed');
  await page.locator('#rock-stand').click();await until(page,s=>s.mode==='manual'&&s.seat.stage==='idle','phone stand');
  await page.setViewportSize({width:1280,height:900});
  await page.locator('#room-approach').click();await until(page,s=>s.mode==='manual'&&s.seat.seat==='room-armchair'&&s.seat.near,'armchair route',120000);
  await page.keyboard.press('e');const armchair=await until(page,s=>s.seat.stage==='watch'&&s.seat.elapsed>1,'armchair regression');assert.equal(armchair.seat.pose.seat,'room-armchair');report.armchair=armchair;
 }
 await context.close();
 const sideContext=await browser.newContext({viewport:{width:1280,height:900}}),side=await sideContext.newPage();await ready(side,true);await approach(side);report.side=await sit(side);await side.screenshot({path:'screenshots/sofa41-contact.png'});await sideContext.close();
 const seated=report.frames.filter(s=>s.seat.pose?.amount>.95&&s.seat.seat==='room-sofa');
 assert(seated.length>5);assert(seated.every(s=>s.feet.feet.every(f=>f.clearance>-.005&&f.clearance<.035)));
 assert(seated.every(s=>s.seat.pose.contact?.probes>100&&s.seat.pose.contact.minimumSurfaceGap>-.005));
 assert.deepEqual(report.errors,[]);
 report.summary={samples:report.frames.length,seatedSamples:seated.length,minimumSoleGap:Math.min(...seated.flatMap(s=>s.feet.feet.map(f=>f.clearance))),minimumSeatGap:Math.min(...seated.map(s=>s.seat.pose.contact.minimumSurfaceGap)),minimumBackGap:Math.min(...seated.map(s=>s.seat.pose.backContact.minimumGap)),cameraUnclear:report.frames.filter(s=>!s.guard.clear).length};
 report.result='passed';console.log(JSON.stringify(report.summary));
}finally{
 await writeFile(`screenshots/sofa41-${inspect?'inspection':'checks'}.json`,JSON.stringify(report,null,2));await browser.close();
}
