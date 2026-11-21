const $=id=>document.getElementById(id),escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceHref=file=>'./releases/4.3-20261115/source/'+file;
try{
 const response=await fetch(new URL('./scene-extension-plans.json',import.meta.url));if(!response.ok)throw Error(`HTTP ${response.status}`);const data=await response.json();
 let filter='all',selected=data.plans.find(p=>p.id===location.hash.slice(1))?.id||data.plans[0].id;
 const archive=$('secondary-ideas'),requested=location.hash.slice(1);if(requested==='explore'||data.plans.some(p=>p.id===requested))archive.open=true;
 const groups=Object.fromEntries(data.groups.map(g=>[g.id,g.label])),number=id=>String(data.plans.findIndex(p=>p.id===id)+1).padStart(2,'0');
 const visible=()=>data.plans.filter(p=>filter==='all'||p.group===filter);
 function detail(){
  const p=data.plans.find(p=>p.id===selected);
  $('idea-detail').dataset.selectedIdea=p.id;
  $('idea-detail').innerHTML=`<div class="idea-detail-head"><p class="eyebrow">${number(p.id)} / ${escape(groups[p.group])}</p><div><span class="tag adapt">构想 · 尚未实现</span><span class="idea-effort">${escape(p.effort)}</span></div><h2 id="idea-title">${escape(p.title)}</h2><p class="idea-hook">${escape(p.hook)}</p></div>
   <section class="target-frame"><span class="detail-label">目标主画面 · 制作描述</span><p>${escape(p.target)}</p><dl><div><dt>镜头</dt><dd>${escape(p.camera)}</dd></div><div><dt>人物</dt><dd>${escape(p.person)}</dd></div><div><dt>声音</dt><dd>${escape(p.sound)}</dd></div></dl></section>
   <div class="experience-beats" aria-label="体验过程">${p.beats.map((b,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><p>${escape(b)}</p></div>`).join('')}</div>
   <div class="first-version"><strong>首版先做到这里</strong><p>${escape(p.firstVersion)}</p></div>
   <section class="plan-method"><h3>让目标画面成立的制作顺序</h3><ol>${p.method.map(s=>`<li><h4>${escape(s.title)}</h4><p>${escape(s.text)}</p></li>`).join('')}</ol></section>
   <div class="reuse-new"><section><h3>沿用现有积累</h3>${p.reuse.map(r=>`<div class="reuse-item"><strong>${escape(r.name)}</strong><div class="files">${r.files.map(f=>`<a href="${escape(sourceHref(f))}">${escape(f)}</a>`).join('')}</div></div>`).join('')}</section><section><h3>需要新增或重新适配</h3><ul>${p.newWork.map(w=>`<li>${escape(w)}</li>`).join('')}</ul></section></div>
   <section class="plan-acceptance"><h3>最终画面怎么看是否成立</h3><ul>${p.acceptance.map(a=>`<li>${escape(a)}</li>`).join('')}</ul></section>
   <section class="plan-limits"><h3>本方案的边界</h3><ul>${p.limits.map(l=>`<li>${escape(l)}</li>`).join('')}</ul></section>
   <div class="plan-value"><strong>完成后能增加的积累</strong><p>${escape(p.value)}</p></div><div class="plan-footer"><button id="download-idea" type="button">下载这一项方案 ↓</button><a href="./scene-extension-plans.json" download>全部10项方案 ↓</a><a href="./implementation.html#extensions">已有全天环境构想 ↗</a></div>`;
  $('download-idea').addEventListener('click',()=>{const value={recordedOn:data.recordedOn,status:'idea-not-implemented',priority:data.priority,directionCorrection:data.directionCorrection,basis:data.basis,scope:data.scope,plan:p},url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`scene-plan-${p.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 }
 function render(){
  const plans=visible();if(!plans.some(p=>p.id===selected))selected=plans[0].id;
  $('idea-count').textContent=`显示 ${plans.length} / ${data.plans.length} 项新增方案`;
  $('idea-filters').innerHTML=[{id:'all',label:'全部10项'},...data.groups].map(g=>`<button type="button" data-idea-group="${escape(g.id)}" aria-pressed="${g.id===filter}">${escape(g.label)}</button>`).join('');
  $('idea-list').innerHTML=plans.map(p=>`<button type="button" data-idea-id="${escape(p.id)}" aria-pressed="${p.id===selected}" aria-controls="idea-detail"><span class="idea-number">${number(p.id)}</span><span><strong>${escape(p.title)}</strong><small>${escape(p.effort)} · ${escape(groups[p.group])}</small></span><span class="idea-arrow" aria-hidden="true">↗</span></button>`).join('');
  $('idea-select').innerHTML=plans.map(p=>`<option value="${escape(p.id)}" ${p.id===selected?'selected':''}>${number(p.id)} ${escape(p.title)}</option>`).join('');
  document.querySelectorAll('[data-idea-group]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.ideaGroup;render();document.querySelector(`[data-idea-group="${filter}"]`).focus({preventScroll:true});}));
  document.querySelectorAll('[data-idea-id]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.ideaId)));
  detail();if(archive.open)history.replaceState(null,'','#'+selected);
 }
 function choose(id,{jump=false}={}){const keepListFocus=document.activeElement?.hasAttribute('data-idea-id');selected=id;const p=data.plans.find(p=>p.id===id);if(filter!=='all'&&filter!==p.group)filter='all';render();if(keepListFocus)document.querySelector(`[data-idea-id="${selected}"]`).focus({preventScroll:true});if(jump){$('explore').scrollIntoView({behavior:'auto',block:'start'});$('idea-detail').focus({preventScroll:true});}}
 $('idea-select').addEventListener('change',e=>choose(e.target.value));
 $('idea-suggestions').innerHTML=data.suggestions.map(s=>{const p=data.plans.find(p=>p.id===s.id);return `<button type="button" data-suggestion="${escape(s.id)}"><span>${escape(s.purpose)}</span><strong>${escape(p.title)} ↗</strong><p>${escape(s.reason)}</p></button>`;}).join('');
 document.querySelectorAll('[data-suggestion]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.suggestion,{jump:true})));
 addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(data.plans.some(p=>p.id===id)){archive.open=true;choose(id);}else if(id==='explore')archive.open=true;});
 render();
}catch(error){$('ideas-error').hidden=false;$('ideas-error').textContent=`扩展方案暂未载入，请通过本地HTTP服务打开。${error.message}`;}
