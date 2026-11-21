import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report={errors:[],screens:[]};
const page=await browser.newPage({viewport:{width:1280,height:1000}});
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
try{
 for(const revision of process.argv.includes('--page-only')?[]:['before','1'])for(const shot of revision==='before'?['face','hands']:['hands','face','side','half']){
  await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?hero=personal0597&detail=${revision}&portrait=${shot}&v=portrait33`);await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.waitForSelector('#scene[data-guide-action="Idle"]',{timeout:20000});await page.locator('[data-shot="portrait"]').click();await page.waitForTimeout(2300);await page.keyboard.press('h');
  assert.equal(await page.locator('.scene-shots').isVisible(),false);
  const prefix=revision==='before'?'portrait33-before':'portrait33';await page.screenshot({path:`screenshots/${prefix}-${shot}.png`});
  report.screens.push({revision,shot,...await page.locator('#scene').evaluate(e=>({file:e.dataset.guideAsset,sha256:e.dataset.guideAssetHash}))});
  if(shot==='half'){
   await page.keyboard.press('h');await page.locator('#toggle-panel').click();await page.locator('[data-guide-action="Wave"]').click();await page.locator('#toggle-panel').click();await page.waitForTimeout(1000);await page.keyboard.press('h');await page.screenshot({path:'screenshots/portrait33-wave.png'});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4197/glasshouse/portrait-review.html');await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));assert.equal(await page.locator('img').count(),6);await page.screenshot({path:'screenshots/portrait33-review-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'screenshots/portrait33-review-mobile.png'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 assert.deepEqual(report.errors,[]);report.review={images:6,mobileWidth:390};console.log(JSON.stringify(report));
}finally{await writeFile(`screenshots/portrait33-review${process.argv.includes('--page-only')?'-page':''}-checks.json`,JSON.stringify(report,null,2));await browser.close();}
