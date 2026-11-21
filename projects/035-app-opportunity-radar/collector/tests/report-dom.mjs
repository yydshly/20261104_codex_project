import {JSDOM,VirtualConsole} from 'jsdom';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=JSON.parse(readFileSync(new URL('../reports/latest.json',import.meta.url),'utf8'));
const errors=[],checks=[];
const consoleLog=new VirtualConsole();consoleLog.on('jsdomError',e=>errors.push(String(e)));
const dom=new JSDOM(readFileSync(new URL('../reports/latest.html',import.meta.url),'utf8'),{runScripts:'dangerously',url:'http://127.0.0.1:5227/',virtualConsole:consoleLog});
const d=dom.window.document;
function set(id,value){const e=d.getElementById(id);e.value=value;e.dispatchEvent(new dom.window.Event(id==='search'?'input':'change',{bubbles:true}));}
function check(label,count){const text=d.getElementById('result-count').textContent;assert.ok(text.startsWith(count+' 个市场样本'),label+': '+text);checks.push({label,count});}
check('双平台全部',source.products.length);
set('platform','ios');check('iOS',source.products.filter(p=>p.platform==='ios').length);
set('platform','android');check('安卓',source.products.filter(p=>p.platform==='android').length);
for(const country of ['us','jp','gb','cn']){set('country',country);check('安卓 '+country,source.products.filter(p=>p.platform==='android'&&p.country===country).length);}
set('country','');set('search','ChatGPT');check('安卓 ChatGPT',source.products.filter(p=>p.platform==='android'&&p.name.toLowerCase().includes('chatgpt')).length);
assert.ok([...d.querySelectorAll('#product-rows a')].every(a=>new URL(a.href).hostname==='play.google.com'));
set('search','');set('signal','growth');check('安卓增长筛选',source.products.filter(p=>p.platform==='android'&&p.growing).length);
set('signal','');set('platform','');check('恢复全部',source.products.length);
d.getElementById('next').click();assert.match(d.getElementById('result-count').textContent,/第 2/);
set('platform','ios');assert.match(d.getElementById('result-count').textContent,/第 1/);
set('direction-platform','android');assert.ok(d.querySelectorAll('#direction-rows tr').length>0);
assert.ok([...d.querySelectorAll('#direction-rows tr')].every(tr=>tr.firstChild.textContent==='Android'));
set('direction-country','jp');assert.ok([...d.querySelectorAll('#direction-rows tr')].every(tr=>tr.children[1].textContent==='日本'));
assert.equal(d.querySelectorAll('#source-rows tr').length,14);
assert.deepEqual(errors,[]);
writeFileSync(new URL('../reports/android-dom-verification.json',import.meta.url),JSON.stringify({mode:'jsdom; browser verification interrupted',checks,errors,sourceRows:14,directionFiltersPassed:true,paginationPassed:true},null,2));
console.log(JSON.stringify({passed:true,checks:checks.length,errors,sourceRows:14}));
dom.window.close();
