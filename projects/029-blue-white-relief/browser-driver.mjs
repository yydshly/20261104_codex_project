import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
export async function startBrowser(){
 const profile=await fs.mkdtemp(path.join(os.tmpdir(),'blue-white-publication-'));
 const child=spawn(process.env.CHROME_BINARY||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-extensions','--disable-sync','--remote-debugging-port=0','--user-data-dir='+profile],{windowsHide:true,stdio:'ignore'});
 let details;
 for(let i=0;i<100;i++){try{details=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).trim().split('\n');break;}catch{await delay(100);}}
 if(!details)throw new Error('Isolated Chrome did not start');
 const socket=new WebSocket('ws://127.0.0.1:'+details[0]+details[1]);
 await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let serial=0;const pending=new Map(),handlers=[];
 socket.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const item=pending.get(message.id);if(item){pending.delete(message.id);message.error?item.reject(new Error(JSON.stringify(message.error))):item.resolve(message.result);}}else for(const handler of handlers)handler(message);};
 const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
 const call=(method,params={})=>send(method,params,sessionId);
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
 return {call,on:handler=>handlers.push(handler),async evaluate(expression){const result=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;},async wait(expression,timeout=20000){const start=Date.now();while(Date.now()-start<timeout){try{const result=await this.evaluate(expression);if(result)return result;}catch{}await delay(100);}throw new Error('Timed out: '+expression.slice(0,160));},async goto(url){await call('Page.navigate',{url});await this.wait('document.readyState==="complete"');},async size(width,height,mobile=false){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});},async screenshot(destination){const result=await call('Page.captureScreenshot',{format:'png',fromSurface:true});await fs.writeFile(destination,Buffer.from(result.data,'base64'));},async close(){try{await send('Browser.close');}catch{}socket.close();if(child.exitCode===null)child.kill();}};
}
