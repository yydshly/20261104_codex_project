import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={checkedAt:new Date().toISOString(),errors:[],consoleErrors:[],frames:[]};
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
async function capture(name){
 await page.waitForTimeout(2600);
 report.frames.push({name,...await page.locator('#scene').evaluate(e=>({position:JSON.parse(e.dataset.guidePosition),camera:JSON.parse(e.dataset.guideCameraPosition),guard:JSON.parse(e.dataset.cameraGuard),contact:JSON.parse(e.dataset.contactLight)}))});
 await page.screenshot({path:`screenshots/scene32-${name}.png`});
 console.log(name,JSON.stringify(report.frames.at(-1)));
 assert.equal(report.frames.at(-1).guard.clear,true);
}
try{
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?hero=personal0597&v=framing32');
 await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await page.waitForSelector('#scene[data-guide-action="Idle"]',{timeout:20000});
 assert.equal(await page.locator('#toggle-panel').getAttribute('aria-expanded'),'false');
 await capture('terrace');
 await page.locator('[data-shot="portrait"]').click();await capture('portrait');
 await page.locator('[data-shot="tide"]').click();
 await page.waitForSelector('#scene[data-guide-stop="tide"][data-guide-phase="idle"]',{timeout:90000});await capture('tide');
 await page.locator('#toggle-panel').click();await page.locator('[data-mood="rose"]').click();await page.locator('#toggle-panel').click();await capture('tide-rose');
 await page.locator('#toggle-panel').click();await page.locator('[data-mood="blue"]').click();await page.locator('#toggle-panel').click();await capture('tide-blue');
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();phone.on('pageerror',e=>report.errors.push(String(e)));phone.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text());});
 await phone.goto('http://127.0.0.1:4197/glasshouse/index.html?v=framing32');await phone.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await phone.waitForSelector('#scene[data-guide-action="Idle"]',{timeout:20000});await phone.waitForTimeout(3000);
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth),390);
 await phone.screenshot({path:'screenshots/scene32-mobile-terrace.png'});
 await phone.locator('[data-shot="portrait"]').tap();await phone.waitForTimeout(2500);await phone.screenshot({path:'screenshots/scene32-mobile-portrait.png'});
 await phone.locator('#toggle-panel').tap();await phone.screenshot({path:'screenshots/scene32-mobile-panel.png'});
 report.mobile={width:390,panel:await phone.locator('#panel').boundingBox(),shots:await phone.locator('.scene-shots').boundingBox()};await mobile.close();
 // Two separately loaded, reduced-motion pages retain the exact same pose,
 // water time and camera, so the contact-light comparison isolates this layer.
 const frozen=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 for(const mode of ['on','off']){
  const still=await frozen.newPage();still.on('pageerror',e=>report.errors.push(String(e)));
  await still.goto(`http://127.0.0.1:4197/glasshouse/index.html?contact=${mode}&v=framing32`);await still.waitForSelector('#scene[data-guide-ready="true"]',{timeout:60000});await still.waitForTimeout(4000);
  await still.screenshot({path:`screenshots/scene32-contact-${mode}.png`});
  report.frames.push({name:`contact-${mode}`,...await still.locator('#scene').evaluate(e=>({position:JSON.parse(e.dataset.guidePosition),pose:JSON.parse(e.dataset.guidePose),contact:JSON.parse(e.dataset.contactLight)}))});await still.close();
 }
 await frozen.close();
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.consoleErrors,[]);
}finally{await writeFile('screenshots/scene32-checks.json',JSON.stringify(report,null,2));await browser.close();}
