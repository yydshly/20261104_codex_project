import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?detail=facial&v=stairs37');await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden'});
 await page.locator('#toggle-panel').click();await page.locator('[data-control-mode="manual"]').click();await page.waitForTimeout(700);
 const state=()=>page.locator('#scene').evaluate(e=>({...e.dataset,pause:document.querySelector('#pause').getAttribute('aria-pressed')}));
 console.log('initial',JSON.stringify(await state()));
 const box=await page.locator('[data-move="left"]').boundingBox(),x=box.x+box.width/2,y=box.y+box.height/2,cdp=await context.newCDPSession(page);
 console.log('target',box,await page.evaluate(({x,y})=>document.elementFromPoint(x,y).outerHTML,{x,y}));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:0}]});await page.waitForTimeout(1500);console.log('held',JSON.stringify(await state()));
 await page.screenshot({path:'screenshots/stairs37-mobile-touch.png'});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}finally{await browser.close();}
