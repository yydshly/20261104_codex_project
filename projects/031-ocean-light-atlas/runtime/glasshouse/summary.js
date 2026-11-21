const assetUrl=href=>new URL(href,import.meta.url).href;
const $=id=>document.getElementById(id),escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{
 const r=await fetch(new URL('./summary.json',import.meta.url));if(!r.ok)throw Error(`HTTP ${r.status}`);const data=await r.json();
 const brief=data.researchBrief;
 $('recap-research-summary').textContent=brief.summary;$('recap-research-direction').textContent=brief.direction;$('recap-research-result').textContent=brief.implementation;$('recap-research-value').textContent=brief.value;
 $('recap-reuse').innerHTML=brief.reuse.map(x=>`<article><span class="tag">${escape(x.title)}</span><h4>${escape(x.what)}</h4><p><strong>怎么用：</strong>${escape(x.how)}</p><p class="recap-boundary">${escape(x.boundary)}</p></article>`).join('');
 $('recap-understanding').innerHTML=data.understanding.map((x,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><div><h3>${escape(x.title)}</h3><p>${escape(x.text)}</p></div></article>`).join('');
 $('recap-views').innerHTML=data.viewpoints.map(v=>`<article><h3>${escape(v.title)}</h3><p>${escape(v.target)}</p></article>`).join('');
 $('recap-implemented').innerHTML=data.implemented.map(x=>`<article><div><h3>${escape(x.title)}</h3><span class="tag">${escape(x.state)}</span></div><p>${escape(x.result)}</p><p class="recap-boundary">${escape(x.boundary)}</p></article>`).join('');
 $('recap-evidence').innerHTML=data.evidenceLayers.map(x=>`<article><h3>${escape(x.title)}</h3><p>${escape(x.text)}</p><a href="${escape(assetUrl(x.href))}">回到对应资料 ↗</a></article>`).join('');
 $('recap-value-established').textContent=data.value.established;
 const characters=data.characterVersions;$('recap-character-explanation').textContent=characters.explanation;
 const previews=new Map(characters.entries.map(x=>[x.id,x.previews?.[0]||x.preview]));
 const visual=x=>{const p=previews.get(x.id);return p?`<figure class="recap-character-visual"><button type="button" data-character-preview="${escape(x.id)}" aria-label="放大${escape(x.title)}的实际网页截图"><img src="${escape(assetUrl(p.src))}" alt="${escape(p.alt)}" width="1920" height="1920" loading="lazy"><span class="preview-zoom" aria-hidden="true">放大 ↗</span></button><figcaption><span>实际网页截图</span><span data-preview-caption>${escape(p.caption)}</span></figcaption></figure>`:'';};
 $('recap-character-entries').innerHTML=characters.entries.map(x=>`<article data-character-card="${escape(x.id)}">${visual(x)}<div class="recap-character-copy"><span class="tag">${escape(x.kind)}</span><h3>${escape(x.title)}</h3>${x.previews?`<div class="recap-character-variants" role="group" aria-label="早期向导的已拍截图对照">${x.previews.map((p,i)=>`<button type="button" data-character-variant="${escape(p.id)}" data-character-owner="${escape(x.id)}" aria-pressed="${i===0}">${escape(p.label)}</button>`).join('')}</div><p class="preview-help">切换上方已有换装截图；下方入口可实际操作旧版换装。</p>`:''}<p>${escape(x.description)}</p><p class="recap-boundary">${escape(x.limits)}</p><a href="${escape(assetUrl(x.href))}" data-character-entry="${escape(x.id)}">${escape(x.label)}</a></div></article>`).join('');
 document.querySelectorAll('[data-character-variant]').forEach(button=>button.addEventListener('click',()=>{
  const entry=characters.entries.find(x=>x.id===button.dataset.characterOwner),p=entry.previews.find(x=>x.id===button.dataset.characterVariant),card=button.closest('[data-character-card]'),img=card.querySelector('.recap-character-visual img');previews.set(entry.id,p);img.src=assetUrl(p.src);img.alt=p.alt;card.querySelector('[data-preview-caption]').textContent=p.caption;
  card.querySelectorAll('[data-character-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 }));
 const previewDialog=$('character-preview-dialog');
 document.querySelectorAll('[data-character-preview]').forEach(button=>button.addEventListener('click',()=>{
  const entry=characters.entries.find(x=>x.id===button.dataset.characterPreview),p=previews.get(entry.id);$('character-preview-title').textContent=entry.title;$('character-preview-image').src=assetUrl(p.src);$('character-preview-image').alt=p.alt;$('character-preview-caption').textContent=p.caption;previewDialog.showModal();
 }));
 $('character-preview-close').addEventListener('click',()=>previewDialog.close());
 $('recap-character-boundary').textContent=characters.fixedBoundary;
 $('recap-character-captures').href=assetUrl(characters.previewCaptureRecord);
 $('recap-future').innerHTML=data.future.map(x=>`<article><span class="tag adapt">${escape(x.status)}</span><h3>${escape(x.title)}</h3><p><strong>当前：</strong>${escape(x.present)}</p><p><strong>拟议：</strong>${escape(x.idea)}</p></article>`).join('');
 $('recap-value-unvalidated').textContent=data.value.unvalidated;$('recap-value-question').textContent=data.value.ifRevisited;$('recap-decision').textContent=data.value.decision;
 const f=data.fixedVersion;$('recap-release').textContent=`版本 ${f.id} · ${f.files}个文件 · ${(f.bytes/1048576).toFixed(1)} MiB。${f.verifiedOn}校验与保存清单一致。`;
 $('recap-test-note').textContent=data.historicalChecks;
 document.body.dataset.summaryReady='true';
}catch(error){$('recap-error').hidden=false;$('recap-error').textContent=`汇总内容暂未载入，请通过本地HTTP服务打开。${error.message}`;}
