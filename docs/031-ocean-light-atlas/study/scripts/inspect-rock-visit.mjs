import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1400,height:1000}}),report={errors:[],frames:[]};
page.on('pageerror',e=>report.errors.push(String(e)));
try{
 await page.goto(`http://127.0.0.1:4197/glasshouse/index.html?detail=facial&seaside=${process.env.SEA_CONTACT?'contact':'1'}&qa=1&v=seaside38`);await page.waitForSelector('#scene[data-facial-ready="true"]',{timeout:60000});await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 await page.locator('#rock-start').click();let last='';
 for(let i=0;i<380;i++){
  await page.waitForTimeout(180);
  const s=await page.locator('#scene').evaluate(e=>({time:performance.now(),position:JSON.parse(e.dataset.guidePosition||'null'),phase:e.dataset.guidePhase,rock:JSON.parse(e.dataset.rockVisit||'null'),contact:JSON.parse(e.dataset.footContact||'null'),audio:JSON.parse(e.dataset.seaAudio||'null')}));report.frames.push(s);
  if(s.rock.stage!==last){last=s.rock.stage;console.log(last,JSON.stringify(s.position));await page.screenshot({path:`screenshots/seaside38-${last}.png`});}
  if(s.rock.stage==='watch'&&s.rock.elapsed>2&&!report.seated){report.seated=s;await page.screenshot({path:'screenshots/seaside38-seated.png'});}
  if(last==='idle'&&i>10)break;
 }
 console.log(JSON.stringify({errors:report.errors,seated:report.seated,stage:last}));
}finally{await writeFile('screenshots/seaside38-inspect.json',JSON.stringify(report,null,2));await browser.close();}
