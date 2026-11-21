import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),report={errors:[],frames:[],checks:[]};
const read=page=>page.locator('#scene').evaluate(e=>({surf:JSON.parse(e.dataset.surfCycle),audio:JSON.parse(e.dataset.seaAudio),seat:JSON.parse(e.dataset.rockVisit),feet:JSON.parse(e.dataset.footContact)}));
async function panel(page){if(await page.locator('#toggle-panel').getAttribute('aria-expanded')==='false')await page.locator('#toggle-panel').click();}
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 await page.goto('http://127.0.0.1:4197/glasshouse/index.html?detail=hands43&seaside=1&qa=1&v=hands-surf43');await page.locator('#loading').waitFor({state:'hidden',timeout:60000});
 await page.locator('#rock-approach').click();await page.waitForFunction(()=>{const b=document.querySelector('#rock-sit');return !b.hidden&&!b.disabled;},null,{timeout:90000});await page.keyboard.press('e');
 await page.waitForFunction(()=>{const s=JSON.parse(document.querySelector('#scene').dataset.rockVisit);return s.stage==='watch'&&s.elapsed>3;},null,{timeout:30000});
 await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.seaAudio).ready,null,{timeout:30000});await page.screenshot({path:'screenshots/hands-surf43-rock.png'});
 await page.locator('#qa-record').click();
 const start=(await read(page)).surf.time;
 while(true){const s=await read(page);report.frames.push(s);if(s.surf.time-start>16)break;await page.waitForTimeout(70);}
 const downloadPromise=page.waitForEvent('download');await page.locator('#qa-record').click();const download=await downloadPromise;await download.saveAs('screenshots/hands-surf43-shore.webm');
 assert(report.frames.length>60);assert(report.frames.every(s=>s.audio.sync.surfVisible));
 assert(report.frames.every(s=>Math.abs(s.audio.sync.visualPhase-s.surf.phase)<1e-9),'rendered surf and audio share one phase');
 assert(Math.max(...report.frames.map(s=>s.audio.mix.breaking))>.4);assert(Math.min(...report.frames.map(s=>s.audio.mix.breaking))<.03);
 assert(Math.max(...report.frames.map(s=>s.audio.rms))>.001,'actual WebAudio stream has sound');
 report.checks.push('16 scene seconds / multiple surf cycles / audible output / matching rendered phase');
 await panel(page);await page.locator('#pause').click();await page.waitForTimeout(1400);const paused=await read(page);await page.waitForTimeout(650);const frozen=await read(page);assert.equal(paused.surf.phase,frozen.surf.phase);assert(frozen.audio.rms<.00003);report.pause={paused,frozen};
 await page.locator('#pause').click();await page.waitForTimeout(900);assert((await read(page)).surf.time>frozen.surf.time);report.checks.push('pause freezes the wave phase and silences the output; resume advances both');
 await page.locator('#foam').uncheck();await page.waitForTimeout(500);const noSurf=await read(page);assert.equal(noSurf.audio.mix.breaking,0);assert.equal(noSurf.audio.mix.wash,0);report.noSurf=noSurf.audio;await page.locator('#foam').check();report.checks.push('hiding nearshore surf removes its breaking/wash sound');
 await page.locator('#sea-sound').click();await page.waitForTimeout(1500);const muted=await read(page);assert.equal(muted.audio.enabled,false);assert(muted.audio.rms<.00003);await page.locator('#sea-volume').fill('35');await page.waitForTimeout(200);assert.equal((await read(page)).audio.enabled,false);await page.locator('#sea-sound').click();await page.waitForTimeout(1000);assert((await read(page)).audio.rms>.0001);report.checks.push('mute, volume while muted, unmute');
 await page.locator('#toggle-panel').click();await page.keyboard.press('e');await page.waitForFunction(()=>JSON.parse(document.querySelector('#scene').dataset.rockVisit).stage==='idle',null,{timeout:30000});report.standing=await read(page);assert(report.standing.feet.feet.every(f=>f.clearance>-.005));
 assert.deepEqual(report.errors,[]);report.result='passed';console.log(JSON.stringify({result:report.result,samples:report.frames.length,checks:report.checks}));await context.close();
}finally{await writeFile('screenshots/hands-surf43-audio-checks.json',JSON.stringify(report,null,2));await browser.close();}
