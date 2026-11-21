import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true}),page=await context.newPage();
 // Final recording after the visible floor/rug and the sole support were aligned.
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?seaside=1&qa=1&v=sofa41-final');await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 await page.locator('#sofa-approach').click();await page.getByRole('button',{name:'在沙发坐下 · E',exact:true}).waitFor({state:'visible',timeout:90000});
 await page.locator('#qa-record').click();await page.keyboard.press('e');
 await page.waitForFunction(()=>{const s=JSON.parse(document.querySelector('#scene').dataset.rockVisit);return s.stage==='watch'&&s.elapsed>3;},null,{timeout:45000});
 const finalPose=await page.locator('#scene').evaluate(e=>({seat:JSON.parse(e.dataset.rockVisit),feet:JSON.parse(e.dataset.footContact),asset:e.dataset.guideAssetHash,guard:JSON.parse(e.dataset.cameraGuard)}));
 assert(finalPose.feet.feet.every(f=>f.clearance>0));assert(finalPose.seat.pose.contact.minimumSurfaceGap>0);assert(finalPose.seat.pose.backContact.minimumGap>0);
 await writeFile('screenshots/sofa41-final-pose.json',JSON.stringify(finalPose,null,2));
 await page.keyboard.press('e');await page.getByRole('button',{name:'在沙发坐下 · E',exact:true}).waitFor({state:'visible',timeout:30000});
 const clip=page.waitForEvent('download');await page.locator('#qa-record').click();await (await clip).saveAs('screenshots/sofa41-final-interaction.webm');
 const data=page.waitForEvent('download');await page.locator('#qa-save').click();await (await data).saveAs('screenshots/sofa41-final-native-checks.json');console.log('Final actual canvas and audio recording saved');
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?seaside=1&v=sofa41');await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 assert.equal(await page.locator('#qa-record').count(),0);
 await page.locator('#sofa-approach').click();await page.getByRole('button',{name:'在沙发坐下 · E',exact:true}).waitFor({state:'visible',timeout:90000});
 await page.keyboard.press('e');await page.waitForFunction(()=>{const s=JSON.parse(document.querySelector('#scene').dataset.rockVisit);return s.stage==='watch'&&s.elapsed>2;},null,{timeout:30000});
 await page.screenshot({path:'screenshots/sofa41-room.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1800);await page.screenshot({path:'screenshots/sofa41-mobile.png'});
 const accessible=await page.locator('#rock-stand').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===e;});assert(accessible);
 console.log('Normal UI desktop and 390 screenshots saved');await context.close();
}finally{await browser.close();}
