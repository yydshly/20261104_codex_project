import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { readFile,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1440,height:900}}),report={errors:[],contactSamples:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const state=()=>page.locator('#scene').evaluate(e=>({position:JSON.parse(e.dataset.guidePosition),phase:e.dataset.guidePhase,camera:e.dataset.guideCamera,contact:JSON.parse(e.dataset.contactLight),guard:JSON.parse(e.dataset.cameraGuard)}));
try{
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?hero=personal0597&v=light32');await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.waitForSelector('#scene[data-guide-action="Idle"]',{timeout:20000});await page.waitForTimeout(2500);
 await page.locator('#toggle-panel').click();await page.locator('#pause').click();
 const pending=page.waitForEvent('download');await page.locator('#capture').click();const download=await pending;await download.saveAs('deliverables/glasshouse-personal-32.png');
 const png=await readFile('deliverables/glasshouse-personal-32.png');assert.equal(png.readUInt32BE(16),1920);assert.equal(png.readUInt32BE(20),1200);report.export={width:1920,height:1200,bytes:png.length};await page.locator('#toggle-panel').click();
 await page.locator('[data-shot="tide"]').click();
 const began=Date.now();
 while(Date.now()-began<30000){await page.waitForTimeout(180);const s=await state();if(s.position[2]>7.4)report.contactSamples.push(s);if(s.position[2]>8.55)break;}
 assert(report.contactSamples.length>5);assert(report.contactSamples.some(s=>s.contact.some(f=>f.weight<.98)),'raised feet attenuate the contact layer');
 await page.locator('[data-shot="portrait"]').click();await page.waitForTimeout(1000);const stopped=await state();assert.equal(stopped.camera,'portrait');assert.equal(stopped.phase,'idle');await page.waitForTimeout(1500);assert.deepEqual((await state()).position,stopped.position);assert.equal((await state()).guard.clear,true);
 await page.screenshot({path:'screenshots/scene32-midroute-portrait.png'});report.portraitStopsWalking=stopped;
 assert.deepEqual(report.errors,[]);console.log(JSON.stringify({export:report.export,contactSamples:report.contactSamples.length,portraitStopsWalking:stopped},null,2));
}finally{await writeFile('screenshots/scene32-export-checks.json',JSON.stringify(report,null,2));await browser.close();}
