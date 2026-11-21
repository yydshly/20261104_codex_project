import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1280,height:1000}}),report={errors:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
try{
 await page.goto('http://127.0.0.1:4197/glasshouse/facial-review.html?v=face36');await page.waitForFunction(()=>document.images.length===4&&[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await page.locator('.live a').count(),3);await page.screenshot({path:'screenshots/face36-review-desktop.png'});
 await page.locator('video').evaluate(async v=>{v.muted=true;await v.play();});await page.waitForFunction(()=>document.querySelector('video').currentTime>.3);
 report.video=await page.locator('video').evaluate(v=>({time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.code||null}));assert(report.video.duration>11&&report.video.duration<13);assert.equal(report.video.error,null);await page.locator('video').evaluate(v=>v.pause());
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await page.screenshot({path:'screenshots/face36-review-mobile.png'});
 await page.locator('.live a').first().click();await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});assert.equal(await page.locator('#scene').getAttribute('data-guide-asset'),'personal-guide-facial.glb');
 await page.locator('#face-play').click();await page.waitForFunction(()=>!document.querySelector('#face-stop').disabled);await page.locator('#face-stop').click();await page.waitForTimeout(500);
 report.stopped=await page.locator('#scene').evaluate(e=>JSON.parse(e.dataset.facialState));assert.equal(report.stopped.time,0);assert.equal(report.stopped.playing,false);assert.match(await page.locator('#face-status').innerText(),/已停止/);
 assert.deepEqual(report.errors,[]);report.mobileWidth=390;console.log(JSON.stringify(report));
}finally{await writeFile('screenshots/face36-review-checks.json',JSON.stringify(report,null,2));await browser.close();}
