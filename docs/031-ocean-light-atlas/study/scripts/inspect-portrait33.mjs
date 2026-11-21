import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),errors=[],requests=[];
const page=await browser.newPage({viewport:{width:1280,height:1000}});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(/personal-guide.*(glb|json)/.test(r.url()))requests.push({url:r.url(),status:r.status()});});
try{
 for(const shot of ['hands','half','face','side']){
  await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?hero=personal0597&detail=1&portrait=${shot}&v=portrait33`);await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.waitForSelector('#scene[data-guide-action="Idle"]',{timeout:20000});await page.locator('[data-shot="portrait"]').click();await page.waitForTimeout(2600);await page.keyboard.press('h');await page.screenshot({path:`screenshots/portrait33-${shot}.png`});console.log(shot);
  if(shot==='half'){
   await page.keyboard.press('h');await page.locator('#toggle-panel').click();await page.locator('[data-guide-action="Wave"]').click();await page.locator('#toggle-panel').click();await page.waitForTimeout(1000);await page.keyboard.press('h');await page.screenshot({path:'screenshots/portrait33-wave.png'});
  }
 }
 console.log(JSON.stringify({errors,requests}));
}finally{await writeFile('screenshots/portrait33-initial-checks.json',JSON.stringify({errors,requests},null,2));await browser.close();}
