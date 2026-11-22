import {JSDOM,VirtualConsole} from 'jsdom';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../reports/latest.html',import.meta.url),'utf8');
const data=JSON.parse(readFileSync(new URL('../reports/latest.json',import.meta.url),'utf8'));
const errors=[],checks=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(String(e)));
const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://127.0.0.1:5227/',virtualConsole:vc});const d=dom.window.document;
function set(id,value){const n=d.getElementById(id);n.value=value;n.dispatchEvent(new dom.window.Event('change',{bubbles:true}));}
function check(name,value){assert.ok(value,name);checks.push(name);}
function cohort(platform,country,kind,limit){return data.trends.series.filter(p=>p.platform===platform&&p.country===country&&p.observations.some(r=>r.date===data.as_of&&r[kind+'_rank']!==null)).sort((a,b)=>a.observations.find(r=>r.date===data.as_of)[kind+'_rank']-b.observations.find(r=>r.date===data.as_of)[kind+'_rank']).slice(0,limit);}
check('overview is the default landing view',!d.getElementById('trends').hidden&&!d.getElementById('trend-overview').hidden&&d.getElementById('trend-detail').hidden);
check('default scope is explicit',d.getElementById('overview-pool').value==='period'&&d.getElementById('overview-country').value==='cn'&&d.getElementById('overview-limit').value==='all'&&d.getElementById('overview-window').value==='7');
set('overview-pool','today');set('overview-limit','20');
const first=cohort('ios','cn','free',20),trs=[...d.querySelectorAll('#overview-rows tr')];
check('cohort consists of exact current top 20',trs.length===first.length&&trs.every((r,i)=>r.dataset.appId===first[i].app_id));
const days=[...d.querySelectorAll('#overview-head .overview-date')].map(n=>n.textContent);
check('columns are the 7 daily dates',days.length===7&&days.at(-1)===data.as_of.slice(5));
check('every rank cell matches its own product and date',trs.every((r,i)=>[...r.querySelectorAll('td[data-date]')].every(td=>{const source=first[i].observations.find(v=>v.date===td.dataset.date);return td.dataset.value===(source.free_rank===null?'':String(source.free_rank));})));
set('overview-limit','10');check('top 10 is actually bounded',d.querySelectorAll('#overview-rows tr').length===10);
set('overview-limit','100');check('top 100 includes all returned rows',d.querySelectorAll('#overview-rows tr').length===cohort('ios','cn','free',100).length);
set('overview-platform','android');check('unsupported Android CN market is replaced explicitly',d.getElementById('overview-country').value==='us');
set('overview-country','jp');set('overview-chart','paid');
check('short chart does not invent missing products',d.querySelectorAll('#overview-rows tr').length===6&&d.getElementById('overview-scope').textContent.includes('短榜'));
set('overview-window','30');set('overview-view','matrix');set('overview-metric','daily');const selected=cohort('android','jp','paid',100),dailyRows=[...d.querySelectorAll('#overview-rows tr')];
check('rating cells use consecutive-day delta for the same cohort',dailyRows.every((r,i)=>[...r.querySelectorAll('td[data-date]')].every(td=>{const source=selected[i].observations.find(v=>v.date===td.dataset.date);return td.dataset.value===(source.rating_delta_1d===null?'':String(source.rating_delta_1d));})));
check('missing data legend follows selected metric',d.getElementById('overview-legend').textContent.includes('前日缺失')&&d.getElementById('overview-table-title').textContent.includes('每日新增评分'));
set('overview-metric','total');check('cumulative metric uses its own units',d.getElementById('overview-table-title').textContent.includes('累计评分（条）'));
const target=d.querySelector('#overview-rows tr').dataset.appId;d.querySelector('.overview-open').click();check('product button opens that exact product detail',d.getElementById('trend-overview').hidden&&!d.getElementById('trend-detail').hidden&&JSON.parse(d.getElementById('trend-app').value)[2]===target);
d.getElementById('overview-back').click();check('back returns to the same cohort and filters',!d.getElementById('trend-overview').hidden&&d.getElementById('trend-detail').hidden&&d.getElementById('overview-country').value==='jp'&&d.querySelectorAll('#overview-rows tr').length===6);
const changed=structuredClone(data);changed.collection.chart_status=changed.collection.chart_status.map(s=>s.country==='cn'&&s.chart==='top-free'?{...s,status:'error'}:s);const blockedHtml=html.replace(/(<script id="report-data" type="application\/json">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(changed).replaceAll('<','\\u003c')+b);const blocked=new JSDOM(blockedHtml,{runScripts:'dangerously',url:'http://127.0.0.1:5227/',virtualConsole:vc});const bd=blocked.window.document;bd.getElementById('overview-pool').value='today';bd.getElementById('overview-pool').dispatchEvent(new blocked.window.Event('change',{bubbles:true}));check('failed current chart cannot reuse stale ranks',blocked.window.document.querySelectorAll('#overview-rows tr').length===0&&blocked.window.document.getElementById('overview-empty').textContent.includes('不用旧榜单'));blocked.window.close();
check('no runtime errors',errors.length===0);
writeFileSync(new URL('../reports/overview-dom-verification.json',import.meta.url),JSON.stringify({passed:true,checks,errors,as_of:data.as_of,mode:'jsdom; not visual QA'},null,2));console.log(JSON.stringify({passed:true,checks:checks.length,errors}));dom.window.close();
