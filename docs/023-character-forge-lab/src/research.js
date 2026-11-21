import {briefDefaults, promptCategories, history, prompts, sources, materializePrompt} from './research-content.js';
const $=selector=>document.querySelector(selector);
const element=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
let category='all';
const form=$('#brief-form');
const getBrief=()=>Object.fromEntries(Object.keys(briefDefaults).map(key=>[key,form.elements.namedItem(key).value.trim()||briefDefaults[key]]));

for(const [index,entry] of history.entries()){
 const item=element('article','history-entry');item.append(element('h4','',`${String(index+1).padStart(2,'0')} / ${entry.title}`),element('p','',entry.text),element('small','',`这一步的理解：${entry.lesson}`));$('#history-list').append(item);
}
for(const [key,label] of Object.entries(promptCategories)){
 const button=element('button','',label);button.type='button';button.dataset.category=key;button.setAttribute('aria-pressed',String(key===category));$('#prompt-categories').append(button);
}
for(const [index,entry] of sources.entries()){
 const item=element('article','source-entry'),number=element('span','',String(index+1).padStart(2,'0')),body=element('div'),link=element('a','',`${entry.title} ↗`);
 link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';body.append(link,element('p','',entry.scope));item.append(number,body);$('#sources-list').append(item);
}

function renderPrompts(){
 const oldOpen=new Set([...$('#prompt-list').querySelectorAll('details[open]')].map(e=>e.dataset.prompt));
 const brief=getBrief(),search=$('#prompt-search').value.trim().toLocaleLowerCase(),fragment=document.createDocumentFragment();let shown=0;
 for(const prompt of prompts){
  const text=materializePrompt(prompt.text,brief);
  if(category!=='all'&&prompt.category!==category)continue;
  if(search&&!`${prompt.title} ${prompt.tool} ${prompt.output} ${prompt.check} ${text}`.toLocaleLowerCase().includes(search))continue;
  shown++;
  const card=element('details','prompt-card');card.dataset.prompt=prompt.id;card.id=`prompt-${prompt.id}`;card.open=oldOpen.has(prompt.id)||(!$('#prompt-list').childElementCount&&shown===1);
  const summary=element('summary','',prompt.title);summary.append(element('span','',`${prompt.tool} · 新整理模板，尚未执行`));
  const body=element('div','prompt-detail'),contract=element('div','prompt-contract');
  for(const [label,value] of [['交付物',prompt.output],['验收重点',prompt.check]]){const p=element('p');p.append(element('b','',label),document.createTextNode(value));contract.append(p);}
  const toolbar=element('div','prompt-toolbar'),copy=element('button','copy-prompt','复制完整提示词');copy.type='button';copy.dataset.copyPrompt=prompt.id;copy.id=`copy-prompt-${prompt.id}`;
  toolbar.append(element('span','',`适用角色：${brief.name} / ${brief.weapon}`),copy);
  const pre=element('pre','prompt-text',text);pre.id=`prompt-text-${prompt.id}`;pre.tabIndex=0;pre.setAttribute('aria-label',`${prompt.title}完整文本`);
  body.append(contract,toolbar,pre);card.append(summary,body);fragment.append(card);
 }
 if(!shown)fragment.append(element('p','empty-prompts','没有匹配的模板。可以换一个词，或切回“全部模板”。'));
 $('#prompt-list').replaceChildren(fragment);$('#prompt-count').textContent=`显示 ${shown} / ${prompts.length} 个模板 · 角色变量已应用`;
}
form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',renderPrompts);$('#prompt-search').addEventListener('input',renderPrompts);
$('#prompt-categories').addEventListener('click',event=>{const button=event.target.closest('button[data-category]');if(!button)return;category=button.dataset.category;for(const sibling of $('#prompt-categories').children)sibling.setAttribute('aria-pressed',String(sibling===button));renderPrompts();});
$('#reset-brief').addEventListener('click',()=>{for(const [key,value] of Object.entries(briefDefaults))form.elements.namedItem(key).value=value;renderPrompts();$('#copy-status').textContent='已恢复赤霄默认设定。';});

async function copyText(text,button){
 try{await navigator.clipboard.writeText(text);const before=button.textContent;button.textContent='已复制';$('#copy-status').textContent='已复制完整文本，可粘贴到对应制作工具。模板本身不会提交生成任务。';setTimeout(()=>{if(button.isConnected)button.textContent=before;},1800);}
 catch{$('#copy-status').textContent='浏览器未允许自动复制，请选取提示词文本后按 Ctrl/Cmd+C。';}
}
$('#prompt-list').addEventListener('click',event=>{const button=event.target.closest('[data-copy-prompt]');if(!button)return;const prompt=prompts.find(p=>p.id===button.dataset.copyPrompt);if(prompt)copyText(materializePrompt(prompt.text,getBrief()),button);});
document.querySelectorAll('.copy-code').forEach(button=>button.addEventListener('click',()=>copyText(document.getElementById(button.dataset.copy).textContent,button)));
$('#download-current-prompts').addEventListener('click',()=>{
 const brief=getBrief(),text=`角色工坊 · 当前角色制作模板\n整理日期：2026-11-21\n性质：新整理模板，尚未执行；不是原作者提示词或服务调用日志\n角色：${brief.name}\n武器：${brief.weapon}\n配色：${brief.palette}\n镜头：${brief.camera}\n\n`+prompts.map(p=>`${p.title}\n用途：${p.tool}\n交付：${p.output}\n验收：${p.check}\n\n${materializePrompt(p.text,brief)}`).join('\n\n'+'—'.repeat(36)+'\n\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=element('a');link.href=url;link.download='character-production-prompts.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('#copy-status').textContent='已发起当前角色全部模板下载；如浏览器阻止下载，可复制单条或使用默认TXT链接。';
});

const toc=[...document.querySelectorAll('.contents nav a')];
if('IntersectionObserver'in window){const positions=new Map();const observer=new IntersectionObserver(entries=>{for(const entry of entries)positions.set(entry.target.id,{visible:entry.isIntersecting,top:entry.boundingClientRect.top});const active=[...positions].filter(([,p])=>p.visible).sort((a,b)=>Math.abs(a[1].top-110)-Math.abs(b[1].top-110))[0];if(active)for(const link of toc){if(link.hash===`#${active[0]}`)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}},{rootMargin:'-90px 0px -55% 0px',threshold:0});document.querySelectorAll('.chapter').forEach(section=>observer.observe(section));}
let printState=[],printFilter=null;
window.addEventListener('beforeprint',()=>{
 printState=[...document.querySelectorAll('details')].map(el=>({el,id:el.id,open:el.open}));
 printFilter={category,search:$('#prompt-search').value};category='all';$('#prompt-search').value='';renderPrompts();
 for(const el of document.querySelectorAll('details'))el.open=true;
});
window.addEventListener('afterprint',()=>{
 if(printFilter){category=printFilter.category;$('#prompt-search').value=printFilter.search;renderPrompts();}
 for(const {el,id,open}of printState){const target=id?document.getElementById(id):el;if(target?.isConnected)target.open=open;}
 printState=[];printFilter=null;
});
$('#print-notes').addEventListener('click',()=>window.print());
const videos=[...document.querySelectorAll('video')];videos.forEach(video=>video.addEventListener('play',()=>videos.forEach(other=>{if(other!==video)other.pause();})));
$('#original-reference').addEventListener('error',()=>{$('#original-status').textContent='远程原片当前不可播放。请使用下方原帖或原始视频链接；本地赤霄实录不受影响。';});
renderPrompts();
