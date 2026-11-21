import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { readFile,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report={errors:[],walks:[],seats:[]};
const qa=!process.argv.includes('--normal');
const prefix=process.env.SEA_TEST_PREFIX||'hands-surf43';
const manifest=JSON.parse(await readFile('glasshouse/assets/personal-guide/manifest-hands43.json','utf8'));
const read=page=>page.locator('#scene').evaluate(e=>({time:performance.now(),position:JSON.parse(e.dataset.guidePosition),phase:e.dataset.guidePhase,mode:e.dataset.controlMode,action:e.dataset.guideAction,speed:Number(e.dataset.guideSpeed),inputAt:Number(e.dataset.guideInputAt),motionAt:Number(e.dataset.guideMotionAt),seat:JSON.parse(e.dataset.rockVisit),feet:JSON.parse(e.dataset.footContact),guard:JSON.parse(e.dataset.cameraGuard)}));
async function wait(page,test,label,timeout=60000){const deadline=Date.now()+timeout;while(Date.now()<deadline){const s=await read(page);if(test(s))return s;await page.waitForTimeout(60);}throw Error('Timed out '+label);}
async function eye(page){await page.locator('#toggle-panel').click();await page.locator('[data-guide-camera="eye"]').click();await page.locator('#toggle-panel').click();}
async function follow(page){await page.locator('#toggle-panel').click();await page.locator('[data-guide-camera="follow"]').click();await page.locator('#toggle-panel').click();}
async function sitStand(page,slot){
 const before=await read(page);assert.equal(before.seat.slot,slot);assert(before.seat.near);
 await page.keyboard.press('e');const immediate=await read(page);assert.match(immediate.phase,/^rock-(turn|align|lower)$/,'E immediately enters the seat performance, without walking to a remote point');
 assert(Math.hypot(before.position[0]-immediate.position[0],before.position[2]-immediate.position[2])<.10,'no position snap');
 const seated=await wait(page,s=>s.seat.stage==='watch'&&s.seat.elapsed>1.2,slot+' sit');
 assert.equal(seated.seat.slot,slot);assert.equal(seated.seat.autoReturn,false);
 assert(seated.feet.feet.every(f=>f.clearance>-.005&&f.clearance<.035));if(qa){assert(seated.seat.pose.contact.minimumSurfaceGap>-.005);assert(seated.seat.pose.backContact.minimumGap>-.005);}assert(seated.guard.clear);
 assert(seated.seat.pose.handAxes.every(a=>a.palm[1]<-.97),'relaxed palms face their support, rather than rolling sideways');
 await page.screenshot({path:`screenshots/${prefix}-${slot}.png`});
 await page.keyboard.press('e');const standing=await wait(page,s=>s.mode==='manual'&&s.seat.stage==='idle',slot+' stand');
 assert(Math.hypot(standing.position[0]-before.position[0],standing.position[2]-before.position[2])<.06,'stand returns to the position the user chose');
 report.seats.push({slot,before,immediate,seated,standing});console.log('sat and stood',slot);
}
async function walkNorth(page,target,touch=false){
 await eye(page);const before=await read(page);
 let key;
 if(touch){const r=await page.locator('[data-move="left"]').boundingBox();assert(r);await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();}
 else {key='a';await page.keyboard.down(key);}
 const first=await read(page);assert.equal(first.action,'Walk');assert.equal(first.phase,'manual-walking');
 const moving=await wait(page,s=>s.motionAt>=s.inputAt&&s.speed>0,'first movement',8000);
 await wait(page,s=>s.position[2]<target,'walk north',45000);
 if(touch)await page.mouse.up();else await page.keyboard.up(key);
 const stopped=await wait(page,s=>s.phase==='idle'&&s.speed===0,'release',8000);
 report.walks.push({touch,before,first,moving,stopped,responseMs:moving.motionAt-moving.inputAt});
 await follow(page);return stopped;
}
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(String(e)));
 await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?seaside=1${qa?'&qa=1':''}&v=hands-surf43`);await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 assert.equal(await page.locator('#scene').getAttribute('data-guide-asset-hash'),manifest.sha256);
 await page.locator('#sofa-approach').click();await page.getByRole('button',{name:'在沙发坐下 · E',exact:true}).waitFor({state:'visible',timeout:90000});
 await sitStand(page,'south');
 const middle=await walkNorth(page,3.05);assert.equal(middle.seat.slot,'middle');assert(middle.seat.near);
 await page.screenshot({path:`screenshots/${prefix}-near-middle.png`});
 await sitStand(page,'middle');
 await page.setViewportSize({width:390,height:844});
 const north=await walkNorth(page,1.54,true);assert.equal(north.seat.slot,'north');assert(north.seat.near);
 await sitStand(page,'north');
 // A fresh normal UI capture preserves a visible sit prompt in front of the
 // middle cushion, away from the former south-only activation area.
 await eye(page);await page.keyboard.down('d');await wait(page,s=>s.position[2]>2.68,'return to middle',45000);await page.keyboard.up('d');await wait(page,s=>s.phase==='idle','stop',8000);await follow(page);
 assert.equal((await read(page)).seat.slot,'middle');await page.screenshot({path:`screenshots/${prefix}-mobile-near.png`});
 assert.deepEqual(report.errors,[]);report.result='passed';console.log(JSON.stringify({result:report.result,latency:report.walks.map(w=>w.responseMs),slots:report.seats.map(s=>s.slot)}));await context.close();
}finally{await writeFile(`screenshots/${prefix}-${qa?'checks':'ui-checks'}.json`,JSON.stringify(report,null,2));await browser.close();}
