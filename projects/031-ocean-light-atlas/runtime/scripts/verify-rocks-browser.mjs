import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={checkedAt:new Date().toISOString(),errors:[],checks:[],positions:[]};
const page=await browser.newPage({viewport:{width:1280,height:900}});
page.on('pageerror',e=>report.errors.push(String(e)));
const state=()=>page.locator('#scene').evaluate(e=>({p:JSON.parse(e.dataset.guidePosition||'null'),phase:e.dataset.guidePhase,speed:Number(e.dataset.guideSpeed),yaw:Number(e.dataset.guideViewYaw),clearance:Number(e.dataset.rockClearance),camera:JSON.parse(e.dataset.cameraGuard||'null')}));
const record=(name,data)=>{report.checks.push({name,...data});console.log(name,JSON.stringify(data));};
async function look(yaw){
 for(let i=0;i<5;i++){
  const s=await state(),difference=Math.atan2(Math.sin(yaw-s.yaw),Math.cos(yaw-s.yaw));if(Math.abs(difference)<.02)return;
  const dx=Math.max(-480,Math.min(480,-difference/.004)),start=dx>0?210:760;
  await page.mouse.move(start,320);await page.mouse.down();await page.mouse.move(start+dx,320,{steps:10});await page.mouse.up();await page.waitForTimeout(300);
 }
 assert(Math.abs(Math.atan2(Math.sin(yaw-(await state()).yaw),Math.cos(yaw-(await state()).yaw)))<.06);
}
try{
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?v=collision31');await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.waitForFunction(()=>!!document.querySelector('#scene').dataset.guidePosition);
 await page.locator('#toggle-panel').click();
 await page.locator('button[data-guide-action="Idle"]').click();await page.locator('button[data-control-mode="manual"]').click();await page.locator('button[data-guide-camera="eye"]').click();await page.waitForTimeout(300);await look(0);
 await page.keyboard.down('KeyW');await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.guidePosition)[2]>11.32,{timeout:30000});await page.keyboard.up('KeyW');await page.waitForTimeout(450);
 record('walk down stairs to the rock approach',{position:(await state()).p});await look(-Math.PI/2);
 await page.keyboard.down('KeyW');let unchanged=0,lastX=Infinity;
 for(let i=0;i<110;i++){
  await page.waitForTimeout(200);const s=await state();report.positions.push(s);assert(s.clearance>=-.002);
  if(s.p[0]<-6.8&&Math.abs(s.p[0]-lastX)<.004)unchanged++;else unchanged=0;lastX=s.p[0];
  if(unchanged>=4)break;
 }
 await page.keyboard.up('KeyW');await page.waitForTimeout(500);const blocked=await state();assert(blocked.p[0]>-8.7&&blocked.p[0]<-7);assert(blocked.clearance>=0&&blocked.clearance<.10);
 record('rock blocks the actual controlled character',{position:blocked.p,clearance:blocked.clearance});
 await page.locator('button[data-guide-camera="follow"]').click();await page.waitForTimeout(900);await page.screenshot({path:'screenshots/rocks31-character-blocked.png'});
 for(const dx of [-340,290]){
  await page.mouse.move(520,340);await page.mouse.down();await page.mouse.move(520+dx,380,{steps:18});await page.mouse.up();await page.waitForTimeout(600);
  const s=await state();assert.equal(s.camera.clear,true);report.positions.push(s);
 }
 await page.screenshot({path:'screenshots/rocks31-camera-clear.png'});record('camera avoids rocks while orbiting',{camera:(await state()).camera});
 await page.locator('button[data-view="shore"]').click();await page.waitForSelector('#scene[data-guide-stop="shore"][data-guide-phase="gesture"]',{timeout:60000});
 await page.locator('button[data-control-mode="manual"]').click();
 await page.mouse.move(650,350);await page.mouse.down();await page.mouse.move(170,390,{steps:24});await page.mouse.up();await page.waitForTimeout(800);
 assert.equal((await state()).camera.clear,true);await page.screenshot({path:'screenshots/rocks31-glass-camera-clear.png'});record('camera avoids pavilion wall',{camera:(await state()).camera});
 assert.deepEqual(report.errors,[]);report.result='passed; screenshots require visual inspection';
}catch(e){report.result='failed';report.error=String(e.stack||e);throw e;}
finally{await writeFile('screenshots/rocks31-checks.json',JSON.stringify(report,null,2));await browser.close();}
