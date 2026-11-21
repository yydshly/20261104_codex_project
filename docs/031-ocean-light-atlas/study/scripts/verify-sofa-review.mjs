import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report={errors:[]};
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto('http://127.0.0.1:4197/glasshouse/seaside-review.html');
 await page.getByRole('heading',{name:'让手放稳，让浪声跟着浪走 · 当前4.3'}).waitFor();
 const video=page.locator('#hands-current video').first();
 await video.click();
 await video.evaluate(async e=>{await e.play();});await page.waitForTimeout(900);
 report.video=await video.evaluate(e=>({time:e.currentTime,duration:e.duration,width:e.videoWidth,height:e.videoHeight,error:e.error?.message||null}));
 assert(report.video.time>.3);assert(report.video.duration>15&&report.video.duration<100);assert.equal(report.video.width,1280);assert.equal(report.video.error,null);
 await video.evaluate(e=>{e.currentTime=e.duration-2;});await page.waitForTimeout(550);
 report.seek=await video.evaluate(e=>({time:e.currentTime,duration:e.duration,error:e.error?.message||null}));assert(report.seek.time>report.seek.duration-2.1);assert.equal(report.seek.error,null);await video.evaluate(e=>e.pause());
 for(const img of await page.locator('img').all())assert(await img.evaluate(e=>e.complete&&e.naturalWidth>0));
 const surf=page.locator('#hands-current video').last();await surf.evaluate(async e=>{await e.play();});await page.waitForTimeout(850);report.surf=await surf.evaluate(e=>({time:e.currentTime,duration:e.duration,width:e.videoWidth,error:e.error?.message||null}));assert(report.surf.time>.3);assert.equal(report.surf.width,1280);assert.equal(report.surf.error,null);await surf.evaluate(e=>e.pause());
 await page.screenshot({path:'screenshots/hands-surf43-review.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 await page.screenshot({path:'screenshots/hands-surf43-review-mobile.png',fullPage:true});
 await page.locator('.live a').first().click();await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 assert(await page.locator('#sofa-approach').isVisible());
 for(const id of ['sofa-approach','room-approach','rock-approach','sea-sound'])assert(await page.locator('#'+id).evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===e;}));
 report.entry=page.url();assert.deepEqual(report.errors,[]);report.result='passed';console.log(JSON.stringify(report));await context.close();
}finally{await writeFile('screenshots/hands-surf43-review-checks.json',JSON.stringify(report,null,2));await browser.close();}
