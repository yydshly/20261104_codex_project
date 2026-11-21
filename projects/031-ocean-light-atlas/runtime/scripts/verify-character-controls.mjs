import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { mkdir,writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const base=process.env.SEA_TEST_URL||'http://127.0.0.1:4197';
const personal=process.env.SEA_CHARACTER==='personal0597';
const detail=personal&&process.env.SEA_PERSONAL_DETAIL==='1';
const variant=personal&&['facial','hands43'].includes(process.env.SEA_PERSONAL_VARIANT)?process.env.SEA_PERSONAL_VARIANT:null;
const character=personal?'personal0597':'rocket10';
const prefix=process.env.SEA_TEST_PREFIX||(variant?'personal-facial-character':detail?'personal-detail-character':personal?'personal-character':'character');
const out=new URL('../screenshots/',import.meta.url);await mkdir(out,{recursive:true});
const report={checkedAt:new Date().toISOString(),errors:[],checks:[],stairs:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const record=(name,data)=>{report.checks.push({name,...data});console.log(name,JSON.stringify(data));};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const capture=(page,name)=>page.screenshot({path:fileURLToPath(new URL(`${prefix}-${name}.png`,out))});
async function state(page){return page.locator('#scene').evaluate(e=>({mode:e.dataset.controlMode,phase:e.dataset.guidePhase,stop:e.dataset.guideStop,camera:e.dataset.guideCamera,cameraPosition:JSON.parse(e.dataset.guideCameraPosition||'null'),position:JSON.parse(e.dataset.guidePosition||'null'),pose:JSON.parse(e.dataset.guidePose||'null'),contact:JSON.parse(e.dataset.footContact||'null')}));}
async function ready(page){page.on('pageerror',e=>report.errors.push(String(e)));await page.goto(`${base}/glasshouse/index.html?hero=${character}${variant?`&detail=${variant}`:detail?"&detail=1":""}&v=stairs37`);await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:45000});if(variant)await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:45000});await page.waitForFunction(()=>!!document.querySelector('#scene').dataset.footContact);if(page.viewportSize().width>=700&&await page.locator('#toggle-panel').getAttribute('aria-expanded')==='false')await page.locator('#toggle-panel').click();}
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();await ready(page);
 assert.match(await page.locator('.manual-controls a').getAttribute('href'),personal?/personal-guide/:/microsoft\/Microsoft-Rocketbox/);
 await page.locator('button[data-guide-action="Idle"]').click();await page.waitForTimeout(500);
 const initial=await state(page);await page.keyboard.down('KeyW');
 await page.waitForFunction(start=>{const p=JSON.parse(document.querySelector('#scene').dataset.guidePosition);return Math.hypot(p[0]-start[0],p[2]-start[2])>.35;},initial.position,{timeout:10000});
 await page.keyboard.up('KeyW');await page.waitForTimeout(350);
 const manual=await state(page);assert.equal(manual.mode,'manual');assert(Math.hypot(manual.position[0]-initial.position[0],manual.position[2]-initial.position[2])>.25);
 assert(manual.position[2]>6.47,'the capsule cannot cross the closed glass section');
 await capture(page,'manual-desktop');record('keyboard and glass collision',{from:initial.position,to:manual.position});
 await page.keyboard.down('ArrowDown');await page.waitForTimeout(450);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(350);
 const blurred=await state(page);await page.waitForTimeout(650);assert.deepEqual((await state(page)).position,blurred.position);await page.keyboard.up('ArrowDown');record('focus loss clears held movement',{});
 await page.locator('#wave').focus();const beforeInput=await state(page);await page.keyboard.press('ArrowRight');await page.waitForTimeout(350);assert.deepEqual((await state(page)).position,beforeInput.position);
 // Restore the authored tour and observe actual deformed sole vertices.
 await page.locator('button[data-view="tide"]').click();
 let down=false;const downPhotos=new Set();
 for(let i=0;i<300;i++){
  await sleep(180);const s=await state(page);
  if(s.contact?.stairs&&s.phase==='walking'){
   report.stairs.push({direction:'down',...s});const k=Math.round(s.position[2]);
   if(!downPhotos.has(k)){downPhotos.add(k);await capture(page,`stairs-down-${k}`);}
  }
  if(s.stop==='tide'&&s.phase!=='walking'){down=true;break;}
 }
 assert(down,'reach the shore after the manual-to-tour connector');
 await page.locator('button[data-view="shore"]').click();let atStairs=false;
 for(let i=0;i<300;i++){
  await sleep(180);const s=await state(page);
  if(s.contact?.stairs&&s.phase==='walking')report.stairs.push({direction:'up',...s});
  if(s.position[0]<-1.4&&s.position[2]<9.4&&s.position[2]>8.8){atStairs=true;await capture(page,'stairs-up');break;}
 }
 assert(atStairs);
 await page.locator('button[data-control-mode="manual"]').click();await page.waitForTimeout(750);
 const stopped=await state(page);assert(stopped.contact.feet.every(f=>f.clearance>=-.008));
 await page.locator('button[data-guide-camera="eye"]').click();
 await page.keyboard.down('KeyW');const manualUp=[];
 for(let i=0;i<60;i++){await sleep(200);const s=await state(page);manualUp.push(s);if(s.contact?.stairs)report.stairs.push({direction:'manual-up',...s});if(s.position[2]<7.4)break;}
 await page.keyboard.up('KeyW');await page.waitForTimeout(400);
 const top=await state(page);assert(top.position[2]<7.5,`manual ascent should reach deck: ${top.position}`);
 await page.keyboard.down('KeyS');
 for(let i=0;i<17;i++){await sleep(200);const s=await state(page);if(s.contact?.stairs)report.stairs.push({direction:'manual-down',...s});}
 await page.keyboard.up('KeyS');await page.waitForTimeout(1000);
 await page.locator('button[data-guide-camera="follow"]').click();
  await page.waitForTimeout(700);
 const stopOnStair=await state(page);assert(stopOnStair.contact.feet.every(f=>f.clearance>=-.008&&f.clearance<.035));
  assert(Math.hypot(...stopOnStair.cameraPosition.map((n,i)=>n-stopOnStair.position[i]))>3,'returning from eye view restores the third-person camera distance');
 await capture(page,'stairs-manual-stop');
 await page.locator('#pause').click();await page.waitForTimeout(400);const paused=await state(page);await page.waitForTimeout(600);const frozen=await state(page);
 assert.deepEqual(frozen.position,paused.position);assert.equal(frozen.pose.time,paused.pose.time);
 for(let i=0;i<2;i++)assert(Math.hypot(...frozen.contact.feet[i].ankle.map((n,j)=>n-paused.contact.feet[i].ankle[j]))<.003,'paused IK retains the foot targets');
 await page.locator('button[data-view="shore"]').click();await page.waitForSelector('#scene[data-guide-stop="shore"][data-guide-phase="gesture"]',{timeout:25000});
 const minimum=Math.min(...report.stairs.flatMap(s=>s.contact.feet.map(f=>f.clearance)));
 assert(minimum>-.008,`deformed sole penetration ${minimum}`);
 const stanceMax=Math.max(...report.stairs.flatMap(s=>s.contact.feet.filter(f=>!f.swing).map(f=>f.clearance)));
 assert(stanceMax<.035,`support foot floating ${stanceMax}`);
 assert(report.stairs.filter(s=>s.direction==='manual-up').length>5);record('up/down/stop/pause stairs',{samples:report.stairs.length,minimumClearance:minimum,maximumStanceClearance:stanceMax,manualTop:top.position});
 await page.locator('button[data-control-mode="manual"]').click();await page.locator('#guide-tour').click();
 await page.waitForSelector('#scene[data-guide-stop="inside"][data-guide-phase="gesture"]',{timeout:25000});
 await page.waitForSelector('#scene[data-guide-stop="inside"][data-guide-phase="walking"]',{timeout:20000});
 record('start complete tour after manual control',{secondLegStarted:true});
 await context.close();

 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const phone=await mobile.newPage();await ready(phone);assert.equal(await phone.locator('#pause').getAttribute('aria-pressed'),'true');
 await phone.locator('#toggle-panel').click();await phone.locator('button[data-control-mode="manual"]').click();
 assert.equal(await phone.locator('#toggle-panel').getAttribute('aria-expanded'),'false');assert.equal(await phone.locator('.movement-pad').isVisible(),true);
 await phone.waitForTimeout(700);const old=await state(phone),bounds=await phone.locator('button[data-move="left"]').boundingBox();
 for(const direction of ['forward','left','right','back']){
  const button=phone.locator(`button[data-move="${direction}"]`),box=await button.boundingBox();
  assert(await phone.evaluate(({x,y,direction})=>document.elementFromPoint(x,y)?.closest('button')?.dataset.move===direction,{x:box.x+box.width/2,y:box.y+box.height/2,direction}),`the ${direction} touch button is unobstructed`);
 }
 const cdp=await mobile.newCDPSession(phone),x=bounds.x+bounds.width/2,y=bounds.y+bounds.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});
 await phone.waitForFunction(start=>{const p=JSON.parse(document.querySelector('#scene').dataset.guidePosition);return Math.hypot(p[0]-start[0],p[2]-start[2])>.3;},old.position,{timeout:10000});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await phone.waitForTimeout(400);
 const moved=await state(phone);assert(Math.hypot(moved.position[0]-old.position[0],moved.position[2]-old.position[2])>.2);
 await phone.waitForTimeout(600);assert.deepEqual((await state(phone)).position,moved.position);
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth),390);await capture(phone,'manual-mobile');
 record('mobile held touch and release',{from:old.position,to:moved.position,width:390});await mobile.close();
 assert.deepEqual(report.errors,[]);report.result='passed; visual review recorded separately';
}catch(error){report.result='failed';report.error=String(error.stack||error);throw error;}
finally{await writeFile(new URL(`${prefix}-controls-checks.json`,out),JSON.stringify(report,null,2));await browser.close();}
