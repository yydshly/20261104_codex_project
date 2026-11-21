import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin=process.env.OCEAN_PREVIEW_URL||'http://127.0.0.1:4198';
const report={checkedOn:'2026-11-21',errors:[],checks:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const context=await browser.newContext({viewport:{width:1360,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(origin+'/glasshouse/summary.html#characters');
 await page.waitForSelector('body[data-summary-ready="true"]');
 const cards=page.locator('[data-character-card]');
 assert.equal(await cards.count(),4);
 assert.equal(await page.locator('[data-character-entry]').count(),4);
 for(const card of await cards.all()){
  await card.scrollIntoViewIfNeeded();
  await card.locator('img').evaluate(img=>img.decode());
  assert.deepEqual(await card.locator('img').evaluate(img=>[img.naturalWidth,img.naturalHeight]),[1920,1920]);
  assert.equal((await context.request.head(await card.locator('a[data-character-entry]').getAttribute('href').then(h=>new URL(h,page.url()).href))).status(),200);
 }
 const sources=await cards.locator('img').evaluateAll(imgs=>imgs.map(img=>img.src));
 assert.equal(new Set(sources).size,4);
 const positions=await cards.evaluateAll(nodes=>nodes.map(e=>e.getBoundingClientRect().top));
 assert(positions.every(y=>Math.abs(y-positions[0])<1),'four desktop portraits appear side by side');
 report.checks.push('four distinct actual portraits decode at 1920×1920, display side by side on desktop, and retain working demo links');

 const legacy=page.locator('[data-character-card="legacy-outfits"]');
 const variants=legacy.locator('[data-character-variant]');
 assert.equal(await variants.count(),3);
 for(const outfit of ['hoodie','linen','knit']){
  const button=legacy.locator(`[data-character-variant="${outfit}"]`);
  await button.click();await legacy.locator('img').evaluate(img=>img.decode());
  assert.match(await legacy.locator('img').getAttribute('src'),new RegExp(`legacy-${outfit}\\.png$`));
  assert.equal(await button.getAttribute('aria-pressed'),'true');
  assert.equal(await legacy.locator('button[aria-pressed="true"]').count(),1);
 }
 await page.evaluate(()=>{const e=document.getElementById('characters');scrollTo({top:e.offsetTop-85,behavior:'instant'});});
 await page.screenshot({path:'screenshots/character-gallery20261121-desktop.png'});
 await legacy.screenshot({path:'screenshots/character-gallery20261121-knit.png'});
 report.checks.push('all three outfit screenshot switches show distinct sources and a single selected button');

 const dialog=page.locator('#character-preview-dialog');
 for(const [i,card] of (await cards.all()).entries()){
  const trigger=card.locator('[data-character-preview]');
  await trigger.click();await dialog.waitFor({state:'visible'});
  await page.locator('#character-preview-image').evaluate(img=>img.decode());
  assert.equal(await page.locator('#character-preview-image').getAttribute('src'),await card.locator('img').getAttribute('src'));
  assert.equal(await page.locator('#character-preview-caption').textContent(),await card.locator('[data-preview-caption]').textContent());
  if(i===0)await page.screenshot({path:'screenshots/character-gallery20261121-enlarged.png'});
  if(i%2)await page.keyboard.press('Escape');else await page.locator('#character-preview-close').click();
  await dialog.waitFor({state:'hidden'});
  assert(await trigger.evaluate(e=>document.activeElement===e),'focus returns to selected portrait');
 }
 report.checks.push('all four images enlarge correctly, including the selected knit variant; close button and Escape restore focus');

 await page.setViewportSize({width:390,height:844});
 for(const card of await cards.all()){
  await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(img=>img.decode());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 }
 await legacy.locator('[data-character-variant="linen"]').click();await legacy.locator('img').evaluate(img=>img.decode());
 await legacy.screenshot({path:'screenshots/character-gallery20261121-linen-mobile.png'});
 await page.evaluate(()=>{const e=document.getElementById('characters');scrollTo({top:e.offsetTop-70,behavior:'instant'});});
 await page.screenshot({path:'screenshots/character-gallery20261121-mobile.png'});
 await cards.first().locator('[data-character-preview]').click();await dialog.waitFor({state:'visible'});
 await page.locator('#character-preview-image').evaluate(img=>img.decode());
 const box=await dialog.boundingBox();assert(box.x>=0&&box.x+box.width<=390&&box.y>=0&&box.y+box.height<=844);
 await page.screenshot({path:'screenshots/character-gallery20261121-enlarged-mobile.png'});
 await page.locator('#character-preview-close').click();
 report.checks.push('390px cards and outfit buttons work without horizontal overflow; enlarged portrait stays within the viewport');

 const captures=JSON.parse(await readFile('screenshots/character-preview-captures.json','utf8'));
 assert.equal(captures.captures.length,6);assert.deepEqual(captures.errors,[]);
 for(const capture of captures.captures){
  const png=await readFile(capture.file);assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.equal(png.readUInt32BE(16),1920);assert.equal(png.readUInt32BE(20),1920);
 }
 assert.equal((await context.request.get(new URL(await page.locator('#recap-character-captures').getAttribute('href'),page.url()).href)).status(),200);
 report.checks.push('all six native webpage exports and their original-entry capture record are available');
 assert.deepEqual(report.errors,[]);report.result='passed';console.log(JSON.stringify(report,null,2));
 await context.close();
}finally{
 await writeFile('screenshots/character-gallery20261121-checks.json',JSON.stringify(report,null,2));
 await browser.close();
}
