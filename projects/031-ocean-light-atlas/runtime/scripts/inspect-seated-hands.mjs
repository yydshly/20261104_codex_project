import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report={errors:[],shots:[]};
try{
 const context=await browser.newContext({viewport:{width:1200,height:900}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));
 for(const view of ['lap','support']){
  await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?detail=hands43&seaside=1&qa=1&handView=${view}&v=hands43`);await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
  await page.locator('#sofa-approach').click();await page.getByRole('button',{name:'在沙发坐下 · E',exact:true}).waitFor({state:'visible',timeout:90000});await page.keyboard.press('e');
  await page.waitForFunction(()=>{const s=JSON.parse(document.querySelector('#scene').dataset.rockVisit);return s.stage==='watch'&&s.elapsed>4;},null,{timeout:30000});
  await page.keyboard.press('h');await page.screenshot({path:`screenshots/hands43-${view}.png`});
  const state=await page.locator('#scene').evaluate(e=>({pose:JSON.parse(e.dataset.rockVisit),feet:JSON.parse(e.dataset.footContact),guard:JSON.parse(e.dataset.cameraGuard)}));report.shots.push({view,...state});console.log(view,JSON.stringify(state.pose.pose.handAxes));
 }
 await context.close();
}finally{await writeFile('screenshots/hands43-inspection.json',JSON.stringify(report,null,2));await browser.close();}
