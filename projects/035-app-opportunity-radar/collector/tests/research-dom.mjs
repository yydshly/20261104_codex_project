import {JSDOM,VirtualConsole} from 'jsdom';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=JSON.parse(readFileSync(new URL('../reports/latest.json',import.meta.url),'utf8'));
const research=source.research;
assert.ok(research?.products?.length,'real research data is required');
const errors=[],checks=[];
const log=new VirtualConsole();log.on('jsdomError',e=>errors.push(String(e)));
const dom=new JSDOM(readFileSync(new URL('../reports/latest.html',import.meta.url),'utf8'),{runScripts:'dangerously',url:'http://127.0.0.1:5227/#research',virtualConsole:log});
const d=dom.window.document;
function set(id,value){const el=d.getElementById(id);el.value=value;el.dispatchEvent(new dom.window.Event(el.type==='search'?'input':'change',{bubbles:true}));}
function check(label,predicate){assert.ok(predicate,label);checks.push(label);}
check('research deep link',!d.getElementById('research').hidden);
check('all researched products',d.querySelectorAll('#research-products article').length===research.products.length);
set('research-platform','android');
check('platform filter',d.querySelectorAll('#research-products article').length===research.products.filter(p=>p.platform==='android').length);
set('research-country','jp');
check('platform and market intersection',d.querySelectorAll('#research-products article').length===research.products.filter(p=>p.platform==='android'&&p.country==='jp').length);
set('research-platform','');set('research-country','');
const product=research.products.find(p=>p.sample_count>0);assert.ok(product);
set('research-app',product.app_id);
check('product filter',d.querySelectorAll('#research-products article').length===1);
set('review-score','low');
check('low star evidence count',d.getElementById('review-count').textContent.startsWith(product.low_star_count+' 条证据'));
check('low star evidence rows', [...d.querySelectorAll('#review-rows tr')].every(r=>/^[12]星/.test(r.cells[1].textContent)));
set('review-score','positive');
check('positive comparison sample',d.getElementById('review-count').textContent.startsWith(product.positive_count+' 条证据'));
set('review-score','');
const all=product.evidence.length;
if(all>30){d.getElementById('review-next').click();check('evidence pagination',d.getElementById('review-count').textContent.includes('第 2'));}
set('research-app','');set('research-query','没有这种痛点xyz');
check('empty result',d.querySelectorAll('#research-products article').length===0&&!d.getElementById('empty-reviews').hidden);
set('research-query','');
check('source links restricted to stores',[...d.querySelectorAll('#review-rows a')].every(a=>['apps.apple.com','itunes.apple.com','play.google.com'].includes(new URL(a.href).hostname)));
check('sampling limitations visible',d.getElementById('research-summary').textContent.includes('不能据此推算总体差评率'));
check('request status evidence',d.querySelectorAll('#review-sources tr').length===research.fetches.length);
const details=d.querySelector('#research-products details');if(details){details.open=true;check('evidence expandable',!!details.querySelector('.evidence'));}
check('no runtime errors',errors.length===0);
writeFileSync(new URL('../reports/research-dom-verification.json',import.meta.url),JSON.stringify({passed:true,mode:'jsdom DOM/events; not visual browser verification',checks,errors,as_of:source.as_of,collected_on:research.collected_on},null,2));
console.log(JSON.stringify({passed:true,checks:checks.length,errors}));dom.window.close();
