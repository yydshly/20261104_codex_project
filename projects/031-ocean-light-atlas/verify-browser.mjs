import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const { chromium }=await import(process.env.OCEAN_PLAYWRIGHT_PATH||new URL('../../ocean-light-atlas/.qa-runtime/node_modules/playwright/index.mjs',import.meta.url).href);

const project=path.dirname(fileURLToPath(import.meta.url));
const online=process.argv.includes('--online');
const base=online?'https://yydshly.github.io/20261104_codex_project/031-ocean-light-atlas/':(process.env.OCEAN_PUBLICATION_PREVIEW||'http://127.0.0.1:4210/031-ocean-light-atlas/');
const raw='https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/';
const report={mode:online?'online':'local-with-repository-assets-mapped-to-their-exact-local-bytes',base,errors:[],checks:[],models:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
await mkdir(path.join(project,'verification'),{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1360,height:1000},acceptDownloads:true});
 if(!online)await context.route(raw+'**',async route=>{
  const relative=decodeURIComponent(route.request().url().slice(raw.length).split('?')[0]);
  const file=path.resolve(project,'runtime',relative);assert(file.startsWith(path.join(project,'runtime')+path.sep));
  const type=file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':file.endsWith('.mp4')?'video/mp4':'application/octet-stream';
  await route.fulfill({body:await readFile(file),contentType:type,headers:{'Access-Control-Allow-Origin':'*'}});
 });
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(String(e)));
 page.on('response',r=>{if(r.status()>=400&&(r.url().startsWith(base)||r.url().startsWith(raw)))report.errors.push(`${r.status()} ${r.url()}`);});
 const save=async name=>page.screenshot({path:path.join(project,'verification',`${online?'online-':''}${name}.png`)});
 const summary=async()=>{await page.goto(base);await page.waitForSelector('body[data-summary-ready="true"]');};
 const ready=async staticModel=>{await page.locator('#loading').waitFor({state:'hidden',timeout:90000});await page.waitForSelector(staticModel?'#scene[data-hero-ready="true"]':'#scene[data-guide-ready="true"]',{timeout:90000});};
 await summary();
 assert.match(await page.locator('#recap-research-direction').textContent(),/海为主体/);
 assert.match(await page.locator('#recap-research-value').textContent(),/付费转化/);
 assert.equal(await page.locator('#recap-reuse article').count(),4);
 assert.equal(await page.locator('[data-character-entry]').count(),4);
 assert.equal(await page.locator('#recap-future article').count(),4);
 assert.match(await page.locator('#recap-decision').textContent(),/产品方向待定/);
 await page.locator('.recap-image img').evaluate(img=>img.decode());
 const guideUrl=await page.locator('.recap-image img').getAttribute('src');
 const bytes=await (await context.request.get(new URL(guideUrl,page.url()).href)).body();
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'1f02314494627a7d3f39267e107f196b29ce041971791c191fcb478657ffd13e');
 await save('desktop');
 const links=[...new Set(await page.locator('a[href]').evaluateAll(nodes=>nodes.map(a=>a.href)))];let checked=0;
 for(const href of links){if(!href.startsWith(new URL(base).origin)||href.includes('#')&&new URL(href).pathname===new URL(page.url()).pathname)continue;const res=await context.request.head(href);assert.equal(res.status(),200,href);checked++;}
 report.checks.push(`complete research direction, result, reuse and limits; unchanged original guide; ${checked} local links resolve`);
 for(const card of await page.locator('[data-character-card]').all()){await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(img=>img.decode());}
 await page.locator('[data-character-variant="knit"]').click();await page.locator('[data-character-card="legacy-outfits"] img').evaluate(img=>img.decode());
 await page.locator('[data-character-preview="legacy-outfits"]').click();await page.locator('#character-preview-dialog').waitFor({state:'visible'});assert.match(await page.locator('#character-preview-image').getAttribute('src'),/legacy-knit/);await page.keyboard.press('Escape');
 await page.locator('#characters').scrollIntoViewIfNeeded();await save('characters');
 const video=page.locator('video').first();await video.scrollIntoViewIfNeeded();await video.evaluate(async e=>{e.muted=true;await e.play();});await page.waitForTimeout(500);assert(await video.evaluate(e=>e.currentTime>0&&e.videoWidth===1280));await video.evaluate(e=>e.pause());
 report.checks.push('actual four portraits, outfit preview and enlarged image work; real historical sea recording plays');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await save('mobile');await page.locator('#research').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await save('research-mobile');
 report.checks.push('390px guide, research brief and reuse cards fit without horizontal overflow');
 await page.setViewportSize({width:1280,height:900});
 for(const id of ['personal0597','rocket10','legacy-outfits','static-comparisons']){
  await summary();await page.locator(`[data-character-entry="${id}"]`).click();await ready(id==='static-comparisons');
  const state=await page.locator('#scene').evaluate(e=>({outfit:e.dataset.guideOutfit,asset:e.dataset.guideAsset,hash:e.dataset.guideAssetHash,static:e.dataset.heroStatic,candidate:e.dataset.heroCandidate}));
  if(id==='personal0597')assert.equal(state.hash,'bee62731b932e907f66eca8e58dc42daf8565f2501f77ab9e71cd20c3a0336f1');
  if(id==='rocket10')assert.equal(state.hash,'03a215c373c12f4c9cc7e3e417cb2cc42cd3415b77b85588cdf13cc2a5d935e6');
  if(id==='legacy-outfits'){
   if(await page.locator('#toggle-panel').getAttribute('aria-expanded')==='false')await page.locator('#toggle-panel').click();
   for(const outfit of ['hoodie','linen','knit']){await page.locator(`[data-outfit="${outfit}"]`).click();await page.waitForFunction(id=>document.querySelector('#scene').dataset.guideOutfit===id,outfit,{timeout:60000});}
  }
  if(id==='static-comparisons'){assert.equal(state.candidate,'rocket17');assert.equal(state.static,'true');}
  report.models.push({id,...state});await save(id);console.log('loaded',id);
 }
 report.checks.push('all four published runtime links load their actual assets; legacy three outfit buttons work; frozen 0597 asset hash matches');
 assert.deepEqual(report.errors,[]);report.result='passed';console.log(JSON.stringify(report,null,2));await context.close();
}finally{
 await writeFile(path.join(project,'verification',online?'online-browser.json':'browser.json'),JSON.stringify(report,null,2));await browser.close();
}
