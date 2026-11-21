import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const base=process.env.SEA_TEST_URL||'http://127.0.0.1:4197';
const personal=process.env.SEA_CHARACTER==='personal0597';
const detail=personal&&process.env.SEA_PERSONAL_DETAIL==='1';
const prefix=detail?'personal-detail':personal?'personal-guide':'rocket-guide';
const assetDirectory=personal?'personal-guide':'rocket-guide';
const output=new URL('../screenshots/',import.meta.url);
await mkdir(output,{recursive:true});
const manifest=JSON.parse(await readFile(new URL(`../glasshouse/assets/${assetDirectory}/${detail?'manifest-detail.json':'manifest.json'}`,import.meta.url),'utf8'));
const asset=await readFile(new URL(`../glasshouse/assets/${assetDirectory}/${manifest.file}`,import.meta.url));
const json=JSON.parse(asset.subarray(20,20+asset.readUInt32LE(12)).toString());
assert.equal(createHash('sha256').update(asset).digest('hex'),manifest.sha256);
assert.equal(json.skins[0].joints.length,80);
assert.deepEqual(json.animations.map(a=>a.name).sort(),['Idle','LookAround','Point','Walk','Wave']);
const report={checkedAt:new Date().toISOString(),asset:{bytes:asset.length,bones:80,clips:json.animations.map(a=>a.name)},pageErrors:[],checks:[],tour:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const check=(name,data)=>{report.checks.push({name,...data});console.log(name,JSON.stringify(data));};
async function snapshot(page,name){await page.screenshot({path:fileURLToPath(new URL(`${prefix}-${name}.png`,output))});}
async function status(page){return page.locator('#scene').evaluate(el=>({action:el.dataset.guideAction,phase:el.dataset.guidePhase,stop:el.dataset.guideStop,camera:el.dataset.guideCamera,position:JSON.parse(el.dataset.guidePosition||'null'),pose:JSON.parse(el.dataset.guidePose||'null')}));}
async function ready(page,query=''){
  page.on('pageerror',e=>report.pageErrors.push(String(e)));
  const url=new URL(`${base}/glasshouse/index.html${query}`);if(!url.searchParams.has('hero'))url.searchParams.set('hero',personal?'personal0597':'rocket10');
  if(detail&&!url.searchParams.has('legacy'))url.searchParams.set('detail','1');
  await page.goto(url.href);
  await page.waitForSelector('#scene[data-guide-ready="true"]',{timeout:45000});
  await page.waitForTimeout(500);
  if(page.viewportSize().width>=700&&await page.locator('#toggle-panel').getAttribute('aria-expanded')==='false')await page.locator('#toggle-panel').click();
}
try{
  const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});
  const page=await context.newPage();
  await ready(page,'?v=motion1');
  await page.locator('button[data-guide-action="Idle"]').click();
  await page.waitForTimeout(600);
  await snapshot(page,'desktop');
  assert.equal(await page.locator('button[data-guide-action="SitDown"]').isVisible(),false);
  assert.equal(await page.locator('.wardrobe').isVisible(),false);
  for(const name of ['Wave','LookAround','Point']){
    await page.locator(`button[data-guide-action="${name}"]`).click();
    const samples=[];
    for(let i=0;i<6;i++){await page.waitForTimeout(480);samples.push(await status(page));}
    const poses=samples.filter(s=>s.action===name&&s.pose).map(s=>s.pose);
    assert(poses.length>=2,`${name} has actual clip samples`);
    assert(new Set(poses.map(p=>p.time)).size>1,`${name} advances clip time`);
    const values=poses.map(p=>name==='LookAround'?p.headRotation:p.hand);
    const distance=Math.max(...values.map(v=>Math.hypot(...v.map((x,j)=>x-values[0][j]))));
    assert(distance>.01,`${name} changes the actual skeleton`);
    check(name,{motionDistance:distance,samples:poses.length});
    await snapshot(page,name.toLowerCase());
    await page.waitForSelector('#scene[data-guide-action="Idle"]',{timeout:15000});
  }
  // Stop mid-route, freeze actual root and mixer, then resume by navigation.
  await page.locator('[data-view="inside"]').click();
  await page.waitForFunction(()=>{const p=JSON.parse(document.querySelector('#scene').dataset.guidePosition||'null');return p&&Math.hypot(p[0]+1.25,p[2]-6.7)>.8;},undefined,{timeout:20000});
  await page.locator('#pause').click();
  await page.waitForTimeout(450);
  const paused=await status(page);
  await page.waitForTimeout(900);
  const frozen=await status(page);
  assert.deepEqual(frozen.position,paused.position);assert.equal(frozen.pose.time,paused.pose.time);
  check('pause freezes root and animation',{position:frozen.position,time:frozen.pose.time});
  await page.locator('button[data-guide-action="Idle"]').click();
  assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'false');
  await page.waitForTimeout(450);
  assert.match(await page.locator('#guide-destination').innerText(),/途中/);
  await page.locator('[data-view="shore"]').click();
  await page.waitForFunction(()=>document.querySelector('#scene').dataset.guidePhase!=='walking',{timeout:20000});
  // Complete the real three-stop tour, including stairs both ways.
  await page.locator('#guide-tour').click();
  let last='';const started=Date.now();
  while(Date.now()-started<180000){
    await page.waitForTimeout(500);const s=await status(page);
    const key=`${s.stop}:${s.phase}`;
    if(key!==last){last=key;console.log('tour',key,JSON.stringify(s.position));}
    if(s.phase==='gesture'&&!report.tour.some(r=>r.stop===s.stop)){
      report.tour.push(s);await snapshot(page,`tour-${s.stop}`);
    }
    if(report.tour.length===3&&s.stop==='shore'&&s.phase==='idle')break;
  }
  assert.deepEqual(report.tour.map(s=>s.stop),['inside','tide','shore']);
  assert.equal((await status(page)).phase,'idle');
  check('three-stop tour',{order:report.tour.map(s=>s.stop),elapsedSeconds:Math.round((Date.now()-started)/1000)});
  for(const mode of ['eye','free','follow']){
    await page.locator(`[data-guide-camera="${mode}"]`).click();
    await page.waitForTimeout(1000);assert.equal((await status(page)).camera,mode);
    await snapshot(page,`camera-${mode}`);
  }
  await page.locator('#guide-portrait').click();await page.waitForTimeout(1300);await snapshot(page,'portrait');
  assert.equal((await status(page)).camera,'portrait');
  await page.locator('.guide-delivery summary').click();
  const downloaded=page.waitForEvent('download');await page.locator('#guide-download').click();
  const download=await downloaded;const downloadBytes=await readFile(await download.path());
  assert.equal(createHash('sha256').update(downloadBytes).digest('hex'),manifest.sha256);
  check('download',{filename:download.suggestedFilename(),bytes:downloadBytes.length});
  assert.equal(await page.locator('.guide-delivery>a[href$=".zip"]').isVisible(),false);
  await context.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const phone=await mobile.newPage();await ready(phone);
  assert.equal(await phone.locator('#toggle-panel').getAttribute('aria-expanded'),'false');
  assert.equal(await phone.locator('#pause').getAttribute('aria-pressed'),'true');
  const before=await status(phone);await phone.waitForTimeout(750);const after=await status(phone);
  assert.equal(before.pose.time,after.pose.time);
  await snapshot(phone,'mobile');await phone.locator('#toggle-panel').click();
  await phone.locator('button[data-guide-action="Wave"]').click();
  assert.equal(await phone.locator('#pause').getAttribute('aria-pressed'),'false');
  await phone.waitForTimeout(700);assert((await status(phone)).pose.time>before.pose.time);
  assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth),390);
  await snapshot(phone,'mobile-controls');
  await phone.locator('[data-view="inside"]').click();await phone.waitForTimeout(900);
  assert.equal((await status(phone)).phase,'walking');
  check('mobile and reduced motion',{width:390,initialPaused:true,explicitActionResumes:true});
  await mobile.close();

  const regression=await browser.newContext({viewport:{width:1000,height:800},reducedMotion:'reduce'});
  const old=await regression.newPage();await ready(old,'?legacy=1');
  assert.equal(await old.locator('#scene').getAttribute('data-experience'),'legacy-guide');
  await old.goto(`${base}/glasshouse/index.html?study=1&hero=rocket10`);
  await old.waitForSelector('#scene[data-hero-ready="true"]',{timeout:45000});
  assert.equal(await old.locator('#scene').getAttribute('data-experience'),'static-study');
  check('historical entries',{legacy:true,staticComparison:true});
  assert.deepEqual(report.pageErrors,[]);
  report.result='passed; screenshots still require visual review';
}catch(error){report.result='failed';report.error=String(error.stack||error);throw error;}
finally{
  await writeFile(new URL(`${prefix}-browser-checks.json`,output),JSON.stringify(report,null,2));
  await browser.close();
}
