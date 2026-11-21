import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const base=existsSync(new URL('../../app-growth-radar/package.json',import.meta.url))?new URL('../../app-growth-radar/package.json',import.meta.url):new URL('./collector/package.json',import.meta.url);
const {JSDOM,VirtualConsole}=createRequire(base)('jsdom');
const site=new URL('../../docs/035-app-opportunity-radar/',import.meta.url);
const errors=[],checks=[];const log=new VirtualConsole();log.on('jsdomError',e=>errors.push(String(e)));
const dom=new JSDOM(readFileSync(new URL('index.html',site),'utf8'),{runScripts:'outside-only',url:'https://yydshly.github.io/20261104_codex_project/035-app-opportunity-radar/',virtualConsole:log});
dom.window.eval(readFileSync(new URL('research.js',site),'utf8'));const d=dom.window.document;
const payload=JSON.parse(d.getElementById('research-data').textContent);
assert.equal(d.querySelectorAll('#case-tabs button').length,4);checks.push('four original-evidence cases');
for(const [index,button] of [...d.querySelectorAll('#case-tabs button')].entries()){
 button.click();assert.equal(button.getAttribute('aria-selected'),'true');assert.ok(d.getElementById('case-panel').textContent.includes(payload.briefs[index].title));
 assert.ok([...d.querySelectorAll('#case-panel .evidence-links a')].every(a=>['apps.apple.com','play.google.com','itunes.apple.com'].includes(new URL(a.href).hostname)));
 checks.push('case switch and citations '+payload.briefs[index].name);
}
d.getElementById('case-tab-3').dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
assert.equal(d.getElementById('case-tab-0').getAttribute('aria-selected'),'true');checks.push('keyboard wrap and selected state');
assert.equal(d.querySelector('[data-stat="reviews"]').textContent,'728');assert.equal(d.querySelector('[data-stat="raw"]').textContent,'881');checks.push('real snapshot statistics');
assert.ok(d.getElementById('bar-low').style.width.startsWith('44.'));checks.push('sample composition proportions');
const reportLog=new VirtualConsole();reportLog.on('jsdomError',e=>errors.push(String(e)));
const report=new JSDOM(readFileSync(new URL('report/index.html',site),'utf8'),{runScripts:'dangerously',url:'https://yydshly.github.io/20261104_codex_project/035-app-opportunity-radar/report/index.html#research',virtualConsole:reportLog});
assert.equal(report.window.document.getElementById('research').hidden,false);assert.equal(report.window.document.querySelectorAll('#research-products article').length,12);checks.push('sanitized report deep link and all research products');
const select=report.window.document.getElementById('research-app');select.value='play:com.veamstudios.siteauditpro';select.dispatchEvent(new report.window.Event('change'));
assert.equal(report.window.document.querySelectorAll('#research-products article').length,1);checks.push('published report product filter');
assert.deepEqual(errors,[]);checks.push('no JavaScript runtime errors');
writeFileSync(new URL('verification/dom.json',import.meta.url),JSON.stringify({passed:true,mode:'DOM and events; visual checks recorded separately',checks,errors},null,2)+'\n');
console.log(JSON.stringify({passed:true,checks:checks.length,errors}));dom.window.close();report.window.close();
