const $=id=>document.getElementById(id);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fileHref=p=>p.startsWith('../')?p:p.endsWith('.js')?'./releases/4.3-20261115/source/'+p:p.startsWith('assets/')?'./releases/4.3-20261115/'+p:'./'+p;
const files=paths=>`<div class="files">${paths.map(p=>`<a href="${escape(fileHref(p))}">${escape(p)}</a>`).join('')}</div>`;
async function json(path){const r=await fetch(new URL(path,import.meta.url));if(!r.ok)throw Error(`读取失败：${r.status} ${path}`);return r.json();}
try{
 const data=await json('./capabilities43.json');$('scope-note').textContent=data.scope;
 $('capabilities').innerHTML=data.capabilities.map(c=>`<article class="capability" data-status="${escape(c.status)}"><div class="cap-heading"><h3>${escape(c.name)}</h3><span class="tag ${escape(c.status)}">${c.status==='copy'?'模块可沿用':'需要适配'}</span></div><div class="cap-detail"><div><strong>已经实现</strong><p>${escape(c.done)}</p></div><div><strong>可以复用</strong><p>${escape(c.reuse)}</p></div><div><strong>接入时调整</strong><p>${escape(c.change)}</p></div><div class="boundary"><strong>限制</strong><p>${escape(c.limit)}</p></div>${files(c.files)}</div></article>`).join('');
 const steps=(id,items)=>$(id).innerHTML=items.map(s=>`<li><h3>${escape(s.title)}</h3><p>${escape(s.text)}</p>${files(s.files)}</li>`).join('');
 steps('character-steps',data.characterSteps);steps('scene-steps',data.sceneSteps);
 $('limit-list').innerHTML=data.limits.map(x=>`<li>${escape(x)}</li>`).join('');
 $('sources').innerHTML=data.sources.map(x=>`<article><strong>${escape(x.name)}</strong><p>${escape(x.text)}</p><a href="${escape(x.href)}">来源与说明 ↗</a></article>`).join('');
 const filter=value=>{let count=0;document.querySelectorAll('.capability').forEach(card=>{card.hidden=value!=='all'&&card.dataset.status!==value;if(!card.hidden)count++;});document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===value)));$('filter-count').textContent=`显示 ${count} / ${data.capabilities.length} 项`;};
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter)));filter('all');
 $('download-guide').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='glasshouse43-integration.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
}catch(error){$('data-error').hidden=false;$('data-error').textContent=`能力说明暂未载入，请通过本地HTTP服务打开。${error.message}`;}
try{
 const release=await json('./releases/4.3-20261115/release.json');
 const bundle=release.files.find(f=>f.path==='scene.bundle.js');
 $('baseline-info').innerHTML=`<div><dt>版本</dt><dd>${escape(release.id)}</dd></div><div><dt>独立保留文件</dt><dd>${release.files.length} 项 · ${(release.totalBytes/1048576).toFixed(1)} MiB</dd></div><div><dt>运行代码校验值</dt><dd class="hash" title="${escape(bundle.sha256)}">${escape(bundle.sha256.slice(0,16))}…</dd></div><div><dt>当前人物</dt><dd>0597 · 手部修整版<br><span class="small">5身体动作 / 21面部形态</span></dd></div>`;
}catch(error){$('baseline-error').hidden=false;$('baseline-error').textContent=`固定版清单尚未载入：${error.message}`;}
try{
 const plan=await json('./day-cycle-plan.json');
 $('day-plan-summary').textContent=plan.summary;$('day-plan-scope').textContent=plan.scope;$('day-storyboard-note').textContent=plan.storyboardNote;
 $('day-storyboard').innerHTML=plan.storyboard.map((s,i)=>`<article><div class="day-tone ${escape(s.tone)}" aria-hidden="true"></div><div class="day-story-copy"><span>目标分镜 ${String(i+1).padStart(2,'0')}</span><h3>${escape(s.phase)}</h3><p>${escape(s.target)}</p><small>${escape(s.focus)}</small></div></article>`).join('');
 $('day-drivers').innerHTML=plan.drivers.map(d=>`<article><h3>${escape(d.name)}</h3><dl><dt>依据</dt><dd>${escape(d.input)}</dd><dt>驱动画面与行为</dt><dd>${escape(d.output)}</dd><dt>制作要求</dt><dd>${escape(d.rule)}</dd></dl></article>`).join('');
 $('day-constraints').innerHTML=plan.constraints.map(c=>`<li>${escape(c)}</li>`).join('');
 $('day-stages').innerHTML=plan.stages.map(s=>`<li><h3>${escape(s.title)}</h3><p>${escape(s.text)}</p><p class="day-accept"><strong>看什么：</strong>${escape(s.accept)}</p></li>`).join('');
 $('day-reuse').textContent=plan.reuseValue;
 $('day-references').innerHTML=plan.references.map(r=>`<article><strong><a href="${escape(r.url)}" target="_blank" rel="noopener noreferrer">${escape(r.title)} ↗</a></strong><p>${escape(r.note)}</p></article>`).join('');
}catch(error){$('day-plan-error').hidden=false;$('day-plan-error').textContent=`扩展方案暂未载入：${error.message}`;}
