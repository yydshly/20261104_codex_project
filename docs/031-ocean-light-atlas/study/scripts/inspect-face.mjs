import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1280,height:1000}}),report={errors:[],screens:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
try{
 const shots=process.env.SEA_FACE_POSE?[[process.env.SEA_FACE_POSE,'face']]:[['neutral','face'],['closed','face'],['aa','face'],['o','face'],['neutral','side'],['neutral','half']];
 for(const [pose,view] of shots){
  await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?detail=facial&portrait=${view}&pose=still&facePose=${pose}&v=face36`);await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});await page.waitForTimeout(700);await page.keyboard.press('h');
  const state=await page.locator('#scene').evaluate(e=>({file:e.dataset.guideAsset,hash:e.dataset.guideAssetHash,face:JSON.parse(e.dataset.facialState)}));assert.equal(state.file,'personal-guide-facial.glb');report.screens.push({pose,view,...state});await page.screenshot({path:`screenshots/face36-${view}-${pose}.png`});console.log(view,pose);
 }
 assert.deepEqual(report.errors,[]);
}finally{await writeFile('screenshots/face36-poses.json',JSON.stringify(report,null,2));await browser.close();}
