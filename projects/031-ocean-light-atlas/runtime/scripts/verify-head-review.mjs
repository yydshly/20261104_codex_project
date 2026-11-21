import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const base='http://127.0.0.1:4197/glasshouse/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:1000},acceptDownloads:true}),report={errors:[],requests:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
page.on('response',r=>{if(/manifest-head\.json|personal-guide-head\.glb/.test(r.url()))report.requests.push({url:r.url(),status:r.status()});});
const sample=()=>page.locator('#scene').evaluate(e=>({file:e.dataset.guideAsset,hash:e.dataset.guideAssetHash,pose:JSON.parse(e.dataset.guidePose),position:JSON.parse(e.dataset.guidePosition),camera:JSON.parse(e.dataset.guideCameraPosition)}));
async function ready(){await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(900);}
try{
 await page.goto(`${base}head-review.html`);await page.waitForFunction(()=>document.images.length===4&&[...document.images].every(i=>i.complete&&i.naturalWidth>0));assert.equal(await page.locator('.live a').count(),3);
 await page.screenshot({path:'screenshots/head35-review-desktop.png'});
 await page.locator('.live a').first().click();await ready();const a=await sample();await page.waitForTimeout(1500);const b=await sample();assert.deepEqual(a,b);assert.equal(b.pose.time,0);report.frozen=b;
 assert.equal(await page.locator('.chapter').innerText(),'HEAD STUDY — 3.5');
 await page.locator('#toggle-panel').click();await page.locator('.guide-delivery summary').click();assert.match(await page.locator('.guide-delivery>p').innerText(),/尚未接入说话/);
 const promised=page.waitForEvent('download');await page.locator('#guide-download').click();const download=await promised;
 const bytes=await readFile(await download.path()),manifest=JSON.parse(await readFile('glasshouse/assets/personal-guide/manifest-head.json','utf8'));
 const hash=createHash('sha256').update(bytes).digest('hex');assert.equal(hash,manifest.sha256);assert.equal(bytes.length,manifest.bytes);report.download={bytes:bytes.length,sha256:hash};
 await page.setViewportSize({width:390,height:844});await page.goto(`${base}head-review.html`);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await page.screenshot({path:'screenshots/head35-review-mobile.png'});
 await page.locator('.live a').nth(2).click();await ready();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await page.keyboard.press('h');await page.screenshot({path:'screenshots/head35-mobile-half.png'});report.mobile=await sample();
 // The retained original Microsoft character is a separate working comparison.
 await page.setViewportSize({width:1280,height:1000});await page.goto(`${base}index.html?hero=rocket10&portrait=face&pose=still&v=head35`);await ready();assert.equal((await sample()).file,'rocket-guide.glb');report.microsoftComparison=true;
 assert.deepEqual(report.errors,[]);assert(report.requests.length>=4&&report.requests.every(r=>r.status===200));report.review={images:4,mobileWidth:390,liveEntryLoaded:true};console.log(JSON.stringify(report));
}finally{await writeFile('screenshots/head35-review-checks.json',JSON.stringify(report,null,2));await browser.close();}
