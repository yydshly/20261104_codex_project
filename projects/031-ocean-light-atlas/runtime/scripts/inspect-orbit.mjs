import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1280,height:1000}}),report={errors:[],screens:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
try{
 for(const shot of process.env.SEA_ORBIT_SHOT?[process.env.SEA_ORBIT_SHOT]:['face','side','half']){
  await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?hero=personal0597&detail=orbit&portrait=${shot}&pose=still&v=orbit34${process.env.SEA_ORBIT_SHADOW==='off'?'&shadow=off':''}${process.env.SEA_ORBIT_CLAY==='1'?'&skin=clay':''}${process.env.SEA_ORBIT_IDS==='1'?'&materials=ids':''}`);
  await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(1200);await page.keyboard.press('h');
  await page.screenshot({path:`screenshots/orbit34-${process.env.SEA_ORBIT_IDS==='1'?'ids-':''}${process.env.SEA_ORBIT_CLAY==='1'?'clay-':''}${process.env.SEA_ORBIT_SHADOW==='off'?'unshadowed-':''}${shot}.png`});
  report.screens.push({shot,...await page.locator('#scene').evaluate(e=>({file:e.dataset.guideAsset,hash:e.dataset.guideAssetHash,pose:JSON.parse(e.dataset.guidePose),camera:JSON.parse(e.dataset.cameraGuard)}))});console.log(shot);
 }
 assert.deepEqual(report.errors,[]);console.log(JSON.stringify(report));
}finally{await writeFile('screenshots/orbit34-checks.json',JSON.stringify(report,null,2));await browser.close();}
