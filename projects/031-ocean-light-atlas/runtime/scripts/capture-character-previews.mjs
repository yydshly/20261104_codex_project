import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.OCEAN_PREVIEW_URL||'http://127.0.0.1:4198',report={errors:[],captures:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const context=await browser.newContext({viewport:{width:1000,height:1000},acceptDownloads:true,reducedMotion:'no-preference'}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 async function open(path){await page.goto(origin+path);await page.locator('#loading').waitFor({state:'hidden',timeout:60000});if(await page.locator('#toggle-panel').getAttribute('aria-expanded')==='false')await page.locator('#toggle-panel').click();}
 async function capture(id,button='#capture'){
  const event=page.waitForEvent('download');await page.locator(button).click();const download=await event;assert((await download.suggestedFilename()).endsWith('.png'));const file=`screenshots/character-preview-${id}.png`;await download.saveAs(file);
  report.captures.push({id,file,url:page.url(),state:await page.locator('#scene').evaluate(e=>({asset:e.dataset.guideAsset||null,hash:e.dataset.guideAssetHash||null,outfit:e.dataset.guideOutfit||null,staticCandidate:e.dataset.heroCandidate||null,camera:e.dataset.guideCamera||e.dataset.heroFraming}))});console.log('captured',id);
 }
 await open('/glasshouse/releases/4.3-20261115/index.html?portrait=half&pose=still&facePose=neutral');assert.equal(await page.locator('#scene').getAttribute('data-guide-asset-hash'),'bee62731b932e907f66eca8e58dc42daf8565f2501f77ab9e71cd20c3a0336f1');await capture('0597');
 await open('/glasshouse/index.html?hero=rocket10&portrait=half&pose=still');assert.equal(await page.locator('#scene').getAttribute('data-guide-outfit'),'rocket10');await capture('rocket10');
 await open('/glasshouse/index.html?legacy=1&portrait=half&pose=still');
 for(const outfit of ['hoodie','linen','knit']){await page.locator(`button[data-outfit="${outfit}"]`).click();await page.waitForFunction(id=>document.querySelector('#scene').dataset.guideOutfit===id,outfit,{timeout:30000});await capture('legacy-'+outfit);}
 await open('/glasshouse/index.html?study=1&hero=rocket17');await page.locator('#hero-closeup').click();assert.equal(await page.locator('#scene').getAttribute('data-hero-candidate'),'rocket17');await capture('rocket17','#hero-capture');
 assert.deepEqual(report.errors,[]);report.result='passed';await context.close();
}finally{await writeFile('screenshots/character-preview-captures.json',JSON.stringify(report,null,2));await browser.close();}
