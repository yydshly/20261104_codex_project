import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const base='http://127.0.0.1:4197/glasshouse/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:1000},acceptDownloads:true});
const report={errors:[],requests:[]};
page.on('pageerror',e=>report.errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
page.on('response',r=>{if(/manifest-(orbit|v30)\.json|personal-guide(-orbit)?\.glb/.test(r.url()))report.requests.push({url:r.url(),status:r.status()});});
const sample=()=>page.locator('#scene').evaluate(e=>({file:e.dataset.guideAsset,hash:e.dataset.guideAssetHash,pose:JSON.parse(e.dataset.guidePose),position:JSON.parse(e.dataset.guidePosition),camera:JSON.parse(e.dataset.guideCameraPosition)}));
async function ready(){await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(700);}
try{
 await page.goto(`${base}index.html?hero=personal0597&detail=before&portrait=face&pose=still&v=orbit34`);await ready();await page.keyboard.press('h');
 report.before=await sample();assert.equal(report.before.file,'personal-guide.glb');
 await page.screenshot({path:'screenshots/orbit34-before-face.png'});
 await page.goto(`${base}index.html?hero=personal0597&detail=orbit&portrait=face&pose=still&v=orbit34`);await ready();
 const a=await sample();await page.waitForTimeout(1500);const b=await sample();assert.deepEqual(a,b);assert.equal(b.pose.time,0);report.frozen=b;
 await page.locator('#toggle-panel').click();await page.locator('.guide-delivery summary').click();
 const downloaded=page.waitForEvent('download');await page.locator('#guide-download').click();const download=await downloaded;
 const bytes=await readFile(await download.path());const manifest=JSON.parse(await readFile('glasshouse/assets/personal-guide/manifest-orbit.json','utf8'));
 const hash=createHash('sha256').update(bytes).digest('hex');assert.equal(hash,manifest.sha256);assert.equal(bytes.length,manifest.bytes);
 report.download={filename:download.suggestedFilename(),bytes:bytes.length,sha256:hash};
 await page.setViewportSize({width:390,height:844});await page.goto(`${base}index.html?hero=personal0597&detail=orbit&portrait=half&pose=still&v=orbit34`);await ready();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await page.keyboard.press('h');await page.screenshot({path:'screenshots/orbit34-mobile-half.png'});report.mobile=await sample();
 await page.setViewportSize({width:1440,height:1000});await page.goto(`${base}orbit-review.html`);
 await page.waitForFunction(()=>document.images.length===4&&[...document.images].every(i=>i.complete&&i.naturalWidth>0));
 assert.equal(await page.locator('.live a').count(),3);await page.screenshot({path:'screenshots/orbit34-review-desktop.png'});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await page.screenshot({path:'screenshots/orbit34-review-mobile.png'});
 // Follow the actual review-page link, so an asset-only check cannot hide a broken entry.
 await page.locator('.live a').first().click();await ready();assert.equal((await sample()).file,manifest.file);
 assert.deepEqual(report.errors,[]);assert(report.requests.every(r=>r.status===200));report.review={images:4,mobileWidth:390,liveEntryLoaded:true};console.log(JSON.stringify(report));
}finally{await writeFile('screenshots/orbit34-review-checks.json',JSON.stringify(report,null,2));await browser.close();}
