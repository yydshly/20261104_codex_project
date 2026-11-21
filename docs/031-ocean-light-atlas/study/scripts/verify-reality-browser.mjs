import { chromium } from '../.qa-runtime/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { REAL_SEA_SOURCES } from '../reality-video-sources.js';
import { EFFECTS } from '../effects.js';
import { REALITY_COMPARISONS } from '../reality-comparisons.js';

const base = process.env.SEA_TEST_URL || 'http://127.0.0.1:4197';
await mkdir(new URL('../screenshots/', import.meta.url), { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const report = { checkedAt: new Date().toISOString(), pageErrors: [], videos: [], effects: [], viewport: [], visualStatus: 'screenshots require visual review' };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(String(error)));
  await page.goto(`${base}/?reality=amber-swell#reality-studies`);
  await page.waitForSelector('#reality-studies[data-ready="true"]');
  assert.equal(await page.locator('.reality-select option').count(), 20);
  assert.equal(await page.locator('.reality-source-list article').count(), REAL_SEA_SOURCES.length);
  assert(!/兼容/.test(await page.locator('.reality-compatibility').innerText()), 'WebGL compilation must succeed');
  await page.locator('.reality-panel').screenshot({ path: new URL('../screenshots/reality-desktop.png', import.meta.url).pathname.slice(1) });

  // Decode and play each actual local file, then seek through its byte ranges.
  for (const source of REAL_SEA_SOURCES.filter(source => source.localFile)) {
    const associated=REALITY_COMPARISONS.find(study=>study.sourceIds.includes(source.id));
    assert(associated,source.id);
    await page.locator('.reality-select').selectOption(associated.effectId);
    await page.locator(`.reality-source-tabs button[data-source="${source.id}"]`).click();
    const result = await page.evaluate(async source => {
      const video = document.querySelector('.reality-video-host video');
      if(!video.src.endsWith(source.localFile)) throw new Error('Source tab points to the wrong file');
      video.pause(); video.muted = true;
      const metadata = new Promise((resolve,reject) => {
        video.addEventListener('loadedmetadata', resolve, {once:true});
        video.addEventListener('error', () => reject(new Error(`video error ${video.error?.code}`)), {once:true});
      });
      video.load(); await metadata; await video.play();
      await new Promise(resolve => setTimeout(resolve, 450));
      const playingTime = video.currentTime;
      video.pause();
      const seeking = new Promise(resolve => video.addEventListener('seeked',resolve,{once:true}));
      video.currentTime = Math.min(10,video.duration-1); await seeking;
      return {id:source.id,duration:video.duration,width:video.videoWidth,height:video.videoHeight,playingTime,seekTime:video.currentTime};
    }, source);
    assert(result.playingTime > .05, `${source.id} advances during playback`);
    assert.equal(result.width,640); assert(result.seekTime > 9);
    report.videos.push(result);
    const response = await page.request.get(`${base}/${source.localFile}`, { headers:{Range:'bytes=0-1023'} });
    assert.equal(response.status(),206); assert.equal(response.headers()['content-type'],'video/mp4');
    assert.equal((await response.body()).length,1024);
  }

  // Every original effect must have a valid selection, source, classification and GPU output.
  for (const effect of EFFECTS) {
    await page.locator('.reality-select').selectOption(effect.id);
    assert.equal(await page.locator('#reality-studies').getAttribute('data-effect'),effect.id);
    assert.equal(await page.locator('.reality-classification').count(),3);
    const pixels = await page.locator('.reality-after').evaluate(canvas => {
      const gl=canvas.getContext('webgl'), bytes=new Uint8Array(256*4);
      gl.readPixels(0,0,Math.min(canvas.width,256),1,gl.RGBA,gl.UNSIGNED_BYTE,bytes);
      const colors=new Set();for(let i=0;i<256;i++) colors.add(`${bytes[i*4]},${bytes[i*4+1]},${bytes[i*4+2]}`);
      return {error:gl.getError(),colors:colors.size,width:canvas.width,height:canvas.height};
    });
    assert.equal(pixels.error,0); assert(pixels.colors>3, `${effect.id}: nonempty GPU image`);
    report.effects.push({id:effect.id,...pixels});
  }
  for(const id of ['amber-swell','foam-edge','round-bokeh','slate-ripple','emerald-flow']) {
    await page.locator('.reality-select').selectOption(id);
    await page.locator('.reality-comparison-visuals').screenshot({path:new URL(`../screenshots/reality-comparison-${id}.png`,import.meta.url).pathname.slice(1)});
  }
  await page.locator('.reality-select').selectOption('amber-swell');
  await page.locator('.reality-use-effect').click();
  assert.equal(await page.locator('#effect-select').inputValue(),'amber-swell');
  assert.equal(await page.locator('#realism-profile').inputValue(),'calibrated');
  await page.locator('#realism-profile').selectOption('reference');
  assert(await page.locator('#lens-effects').isDisabled());
  await page.locator('#realism-profile').selectOption('calibrated');
  await page.locator('#lens-effects').check();
  await page.waitForTimeout(160);
  await page.reload();
  assert.equal(await page.locator('#realism-profile').inputValue(),'calibrated');
  assert(await page.locator('#lens-effects').isChecked());

  await page.setViewportSize({width:390,height:844});
  await page.goto(`${base}/?reality=foam-edge#reality-studies`);
  await page.waitForSelector('#reality-studies[data-ready="true"]');
  const mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
  assert(mobile.scrollWidth<=mobile.width+1,JSON.stringify(mobile)); report.viewport.push(mobile);
  await page.locator('#reality-studies').screenshot({path:new URL('../screenshots/reality-mobile.png',import.meta.url).pathname.slice(1)});
  // Confirm failure is visible and still supplies a source-page fallback.
  await page.evaluate(()=>{const v=document.querySelector('.reality-video-host video'); v.src='assets/reality/does-not-exist.mp4'; v.load();});
  await page.waitForFunction(()=>document.querySelector('.reality-video-status').classList.contains('is-error'));
  assert(await page.locator('.reality-video-links a').first().getAttribute('href'));
  assert.deepEqual(report.pageErrors,[]);
  await context.close();
  report.functionalStatus='passed';
} finally {
  await writeFile(new URL('../screenshots/reality-browser-checks.json',import.meta.url),JSON.stringify(report,null,2));
  await browser.close();
}
console.log(JSON.stringify({status:report.functionalStatus,videos:report.videos.length,effects:report.effects.length,pageErrors:report.pageErrors}));
