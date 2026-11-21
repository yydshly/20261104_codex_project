import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1280,height:1000}}),report={errors:[],videos:[]};
page.on('pageerror',e=>report.errors.push(String(e)));
try{
 await page.goto('http://127.0.0.1:4197/glasshouse/stairs-review.html');
 for(const video of await page.locator('video').all()){
  await video.evaluate(async e=>{if(e.readyState<1)await new Promise((resolve,reject)=>{e.addEventListener('loadedmetadata',resolve,{once:true});e.addEventListener('error',reject,{once:true});});await e.play();});
  await page.waitForTimeout(500);const state=await video.evaluate(e=>({src:e.currentSrc,duration:e.duration,time:e.currentTime,width:e.videoWidth,height:e.videoHeight,error:e.error?.message}));
  assert(state.duration>6&&state.duration<15);assert(state.time>.2);assert.equal(state.width,1280);assert(!state.error);report.videos.push(state);await video.evaluate(e=>e.pause());
 }
 await page.screenshot({path:'screenshots/stairs37-review-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await page.screenshot({path:'screenshots/stairs37-review-mobile.png',fullPage:true});
 await page.locator('.live a').first().click();await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 assert.match(page.url(),/detail=facial&stairs=review/);assert.equal(await page.locator('#scene').getAttribute('data-guide-asset'),'personal-guide-facial.glb');assert.equal(await page.locator('#face-controls').isVisible(),false);
 report.entry=page.url();assert.deepEqual(report.errors,[]);report.result='passed';console.log(JSON.stringify(report));
}finally{await writeFile('screenshots/stairs37-review-checks.json',JSON.stringify(report,null,2));await browser.close();}
