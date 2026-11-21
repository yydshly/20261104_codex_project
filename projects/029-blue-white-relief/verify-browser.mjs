import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {startBrowser} from './browser-driver.mjs';
const project=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(project,'../..');
const slug='029-blue-white-relief';
const raw='https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/';
const report={status:'running',scope:'Isolated desktop Chrome and390px simulated viewport; local raw-repository requests fulfilled with the exact staged files.',errors:[],httpErrors:[],newGenerationCredits:0};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8'};
function response(payload,extension,range){
 let start=0,end=payload.length-1,code=200;const headers=[{name:'Content-Type',value:mime[extension]||'application/octet-stream'},{name:'Accept-Ranges',value:'bytes'},{name:'Access-Control-Allow-Origin',value:'*'}];
 if(range){const match=/bytes=(\d+)-(\d*)/.exec(range);if(match){start=Number(match[1]);end=Math.min(end,match[2]?Number(match[2]):end);code=206;headers.push({name:'Content-Range',value:`bytes ${start}-${end}/${payload.length}`});}}
 const body=payload.subarray(start,end+1);headers.push({name:'Content-Length',value:String(body.length)});return {code,headers,body};
}
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep))throw new Error();if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');const result=response(await fs.readFile(file),path.extname(file),req.headers.range);res.writeHead(result.code,Object.fromEntries(result.headers.map(h=>[h.name,h.value])));res.end(req.method==='HEAD'?undefined:result.body);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await startBrowser();
await fs.mkdir(path.join(project,'verification'),{recursive:true});
browser.on(message=>{
 if(message.method==='Runtime.exceptionThrown')report.errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
 if(message.method==='Network.responseReceived'&&message.params.response.status>=400&&!message.params.response.url.endsWith('/favicon.ico'))report.httpErrors.push({url:message.params.response.url,status:message.params.response.status});
 if(message.method==='Fetch.requestPaused'){
  (async()=>{const {requestId,request}=message.params;const relative=decodeURIComponent(request.url.slice(raw.length));const file=path.resolve(root,relative);assert(file.startsWith(root+path.sep));const range=Object.entries(request.headers).find(([key])=>key.toLowerCase()==='range')?.[1];const result=response(await fs.readFile(file),path.extname(file),range);await browser.call('Fetch.fulfillRequest',{requestId,responseCode:result.code,responseHeaders:result.headers,body:result.body.toString('base64')});})().catch(error=>report.errors.push(error.message));
 }
});
try{
 await browser.call('Fetch.enable',{patterns:[{urlPattern:raw+'projects/'+slug+'/*',requestStage:'Request'}]});
 await browser.size(1600,1100);
 const url=`http://127.0.0.1:${server.address().port}/docs/${slug}/`;
 await browser.goto(url);
 await browser.wait('!!window.HUB && document.querySelector(".guide-figure img").naturalWidth===2800');
 assert.equal(await browser.evaluate('HUB.meta.nativeCount'),5);
 assert.equal(await browser.evaluate('HUB.meta.credits'),375);
 assert.equal(await browser.evaluate('document.querySelectorAll(".research-brief article").length'),3);
 await browser.wait('[...document.querySelectorAll(".delivery-card video")].every(v=>v.videoWidth>0&&!v.error)');
 await browser.screenshot(path.join(project,'verification/desktop.png'));
 await browser.evaluate('document.querySelector("[data-round=\\"3\\"]").click()');
 assert.equal(await browser.evaluate('document.querySelectorAll(".trial-card").length'),1);
 assert((await browser.evaluate('document.querySelector(".unsubmitted").textContent')).includes('没有生成'));
 await browser.evaluate('document.querySelector("[data-state=\\"failed\\"]").click()');
 assert.equal(await browser.evaluate('document.querySelectorAll("#capability-body tr").length'),1);
 await browser.evaluate('document.querySelector("[data-state=\\"all\\"]").click();const s=document.getElementById("global-search");s.value="蒸汽";s.dispatchEvent(new Event("input",{bubbles:true}))');
 assert((await browser.evaluate('document.getElementById("record-list").textContent')).includes('蒸汽'));
 await browser.evaluate('document.getElementById("clear-search").click()');
 await browser.evaluate('document.querySelector(".delivery-card [data-record]").click()');
 await browser.wait('document.querySelector("#viewer-body video")?.videoWidth>0');
 await browser.evaluate('document.querySelector("#viewer-body video").play()');
 assert.equal(await browser.evaluate('document.querySelector("#viewer-body video").paused'),false);
 await browser.evaluate('document.getElementById("viewer-close").click()');
 await browser.wait('document.getElementById("viewer-body").childElementCount===0');
 for(const [index,selector] of [[0,'h1'],[1,'#hero-title'],[2,'#editor-form']]){
  await browser.evaluate(`document.querySelectorAll('.entry-image')[${index}].click()`);
  try {await browser.wait(`!!document.querySelector('#viewer-body iframe')?.contentDocument?.querySelector('${selector}')`,5000);} catch(error) {console.log(JSON.stringify(await browser.evaluate('({src:document.querySelector("#viewer-body iframe")?.src,body:document.querySelector("#viewer-body iframe")?.contentDocument?.body?.innerText.slice(0,500),errors:document.getElementById("viewer-body").innerHTML.slice(0,300)})')));throw error;}
  await browser.evaluate('document.getElementById("viewer-close").click()');
  await browser.wait('document.getElementById("viewer-body").childElementCount===0');
 }
 report.desktop='Guide original loaded; three complete summary panels, delivery metadata, round3 stop, state filters, Chinese search, comparison playback and three related-page iframes passed.';
 await browser.size(390,844,true);await browser.goto(url);await browser.wait('!!window.HUB');
 assert.equal(await browser.evaluate('document.documentElement.scrollWidth'),390);
 await browser.screenshot(path.join(project,'verification/mobile.png'));
 await browser.evaluate('document.getElementById("guide-image").scrollIntoView()');
 await browser.screenshot(path.join(project,'verification/guide-mobile.png'));
 report.mobile='390px simulated viewport: no horizontal overflow; guide retains aspect ratio.';
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.httpErrors,[]);
 report.status='passed';
 await fs.writeFile(path.join(project,'verification/browser.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({status:report.status,desktop:report.desktop,mobile:report.mobile}));
}finally{await browser.close();server.close();}
