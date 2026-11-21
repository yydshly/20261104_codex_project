/* A continuous, local reading journey. URL state records choices, never mastery. */
(() => {
  'use strict';
  const data=window.ROAM_DATA;
  const esc=value=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=name=>window.feather?.icons[name]?.toSvg({'aria-hidden':'true',width:22,height:22,'stroke-width':1.6}) || '';
  const icons={generation:'cpu',sources:'file-text',evidence:'search',return:'corner-up-left'};
  const hasStep=id=>id==='overview' || data.steps.some(s=>s.id===id);
  const params=r=>r?.q || (r instanceof URLSearchParams?r:new URLSearchParams());
  function resolve(r) {
    const q=params(r),index=data.steps.findIndex(s=>s.id===r?.tab);
    return {
      index, step:index<0?{id:'overview',label:'路线起点',domain:'ai'}:data.steps[index],
      material:data.materials.find(m=>m.id===q.get('material')) || data.materials[0],
      evidence:data.evidence.find(e=>e.id===q.get('evidence')) || data.evidence[0],
      answerView:q.get('answer')==='cited'?'cited':'plain'
    };
  }
  function link(step='overview',r,overrides={}) {
    const q=params(r),next=new URLSearchParams();
    const allowed={material:data.materials.map(m=>m.id),evidence:data.evidence.map(e=>e.id),answer:['plain','cited']};
    for(const [key,values] of Object.entries(allowed)){
      const value=Object.hasOwn(overrides,key)?overrides[key]:q.get(key);
      if(values.includes(value))next.set(key,value);
    }
    const back=window.JOURNEY?.safeBack(q.get('back'),'');if(back)next.set('back',back);
    return '#roam/ai-errors/'+(hasStep(step)?step:'overview')+(next.size?'?'+next.toString():'');
  }
  const external=(href,r)=>window.JOURNEY.withBack(href,r.hash);
  function stops(r) {
    const {step}=resolve(r);
    return `<nav class="roam-stops" aria-label="跨域漫游四站">${data.steps.map((s,i)=>`<a href="${esc(link(s.id,r))}" ${step.id===s.id?'aria-current="step"':''}><span class="stop-number">0${i+1}</span><div><strong>${esc(s.label)}</strong><small>${i===3?'带回最初的问题':esc(window.JOURNEY_CATALOG.domains[s.domain].title)}</small></div></a>`).join('')}</nav>`;
  }
  function rail(r) {
    const {step}=resolve(r),d=window.JOURNEY_CATALOG.domains[step.domain];
    return `<h2>这次围绕的问题</h2><a class="quiet" href="${esc(link('overview',r))}">AI 为什么会答错？</a><nav class="local-tree" aria-label="漫游站点">${data.steps.map((s,i)=>`<a href="${esc(link(s.id,r))}" ${step.id===s.id?'aria-current="page"':''}>${icon(icons[s.id])}<span>0${i+1} ${esc(s.label)}</span></a>`).join('')}</nav><div class="rail-separator"></div><a class="quiet" href="${esc(external('#domain/'+d.id,r))}">${icon(d.icon)}看看${esc(d.title)}全景</a><a class="quiet rail-bottom" href="#home">${icon('arrow-left')}返回世界全景</a>`;
  }
  function caseBlock(compact=false) {
    return `<section class="roam-case ${compact?'is-compact':''}" aria-label="贯穿路线的示例"><header><p class="eyebrow">${esc(data.case.label)}</p><small>非真实模型输出</small></header><blockquote class="question">“${esc(data.case.question)}”</blockquote><p class="case-condition">${esc(data.case.when)}</p><div class="case-answer">${icon('message-circle')}<div><span>待核查的助手回答</span><strong>${esc(data.case.answer)}</strong></div></div>${compact?'':`<p class="case-note">${esc(data.case.note)}</p>`}</section>`;
  }
  function heading(r,title,lead) {
    const {step,index}=resolve(r),d=window.JOURNEY_CATALOG.domains[step.domain];
    return `<header class="roam-heading"><p class="eyebrow">跨域漫游 · ${index<0?'从一个真实困惑出发':`第 ${index+1} / 4 站 · ${esc(step.label)}`}</p><h1>${esc(title)}</h1><p class="lead">${esc(lead)}</p></header>${stops(r)}${index<0?'':`<div class="roam-location"><p>${index===0?'从 AI 的生成过程进入':index===1?'从“怎样生成”走到“材料怎样组织”':index===2?'从“资料的来历”走到“结论的依据”':'把三个领域的解释放回同一个问题'}</p><a href="${esc(external('#domain/'+d.id,r))}">${icon(d.icon)}你在${esc(d.title)}领域 ${icon('arrow-up-right')}</a></div>`}`;
  }
  function overview(r) {
    return `${heading(r,data.title,data.lead)}<div class="roam-overview-grid">${caseBlock()}<section class="roam-overview-map"><p class="eyebrow">一个问题 · 三种视角</p><h2>我们会沿着答案，走向哪里？</h2><div class="roam-map-track">${data.steps.slice(0,3).map((s,i)=>`<a class="roam-map-node" href="${esc(link(s.id,r))}">${icon(icons[s.id])}<div><small>0${i+1} · ${esc(window.JOURNEY_CATALOG.domains[s.domain].title)}</small><strong>${esc(s.label)}</strong><p>${['一句顺畅的话，等于查过事实吗？','出处是真的，就一定适用于现在吗？','发现不一致，就能确定原因吗？'][i]}</p></div>${icon('arrow-right')}</a>`).join('')}</div><p class="roam-map-return">${icon('corner-up-left')}最后回到这句回答，说明依据与还没弄清的部分。</p></section></div><section class="roam-bridge"><div><h2>先看：一句回答是怎样生成的</h2><p>可以顺着四站阅读，也能随时回看、展开文章或走进领域全景。</p></div><a class="button primary" href="${esc(link('generation',r))}">开始跨域漫游 ${icon('arrow-right')}</a></section><nav class="roam-actions"><a class="quiet" href="${esc(window.JOURNEY.safeBack(r.q.get('back'),'#home'))}">${icon('arrow-left')}返回进入这条路线的页面</a><a class="quiet" href="${esc(external('#domain/ai',r))}">先看 AI 全景 ${icon('arrow-up-right')}</a></nav>`;
  }
  function generation(r) {
    const {answerView}=resolve(r),cited=answerView==='cited';
    return `<section class="roam-diagram"><h2>加上一句“根据公告”，回答就更可靠吗？</h2><p class="small">切换两种写法。这里只改变表达，尚未核对任何原始通知。</p><div class="roam-controls" role="group" aria-label="比较回答表达"><button type="button" data-roam-answer="plain" aria-pressed="${!cited}">只给出时间</button><button type="button" data-roam-answer="cited" aria-pressed="${cited}">带一句来源说明</button></div><ol class="roam-flow"><li>${icon('message-circle')}<strong>同一个问题</strong><p>问的是示例中的普通周日。</p></li><li>${icon('cpu')}<strong>模型组织文字</strong><p>依据输入和已学到的模式生成回答。</p></li><li aria-live="polite">${icon('file-text')}<strong>${cited?'“根据图书馆公告，周日 18:00 闭馆。”':'“周日 18:00 闭馆。”'}</strong><p>${cited?'“根据公告”仍是一条需要核对的说法。':'语句完整，但还没有展示依据。'}</p></li></ol><p class="roam-feedback" role="status">${cited?'来源说明提供了回查线索。只有继续打开原文，才能确认有没有这份公告，以及它是否支持这句话。':'我们已经得到一句具体主张；仅凭流畅程度，还无法判断 18:00 是否适用于所问的周日。'}</p></section>`;
  }
  function sourceChoices(r) {
    const {material}=resolve(r);
    return `<div class="roam-source-grid" role="group" aria-label="比较三份示例资料">${data.materials.map(m=>`<button type="button" class="source-choice" data-roam-material="${m.id}" aria-pressed="${m.id===material.id}">${icon(m.id==='snippet'?'align-left':'file-text')}<strong>${m.id==='old'?'旧版通知':m.id==='current'?'现行通知':'转述摘录'}</strong><span class="metadata">${esc(m.date)}</span><p>${m.id==='old'?'同一家馆，旧一年的安排':m.id==='current'?'新版本，区分平日与周日':'提到了 18:00，省略了什么？'}</p></button>`).join('')}</div>`;
  }
  function materialDetail(r) {
    const {material:m}=resolve(r);
    return `<article class="source-detail" aria-live="polite"><h3>${esc(m.label)} <small>教学虚构</small></h3><dl><div><dt>发布者</dt><dd>${esc(m.issuer)}</dd></div><div><dt>日期</dt><dd>${esc(m.date)}</dd></div><div><dt>适用范围</dt><dd>${esc(m.scope)}</dd></div></dl><blockquote>${esc(m.excerpt)}</blockquote><div class="source-conclusion"><strong>${m.id==='current'?'本例的周日依据是 16:00':m.id==='old'?'有出处，但版本已经过期':'有相关数字，但没有回答周日'}</strong><p>${esc(m.conclusion)}</p><p>${esc(m.limit)}</p></div></article>`;
  }
  function sourcesDiagram(r) {
    return `<section class="roam-diagram"><h2>同一个 18:00，可能来自三种材料</h2><p class="small">逐份打开，比较发布者、版本与适用范围。选择会随你带到下一站。</p>${sourceChoices(r)}${materialDetail(r)}</section>`;
  }
  function evidenceDiagram(r) {
    const {material,evidence}=resolve(r);
    return `<section class="roam-diagram"><h2>分开看：记录、原因解释与有条件的结论</h2><p class="small">下面同时对照原回答与现行完整通知。点击一种说法，看它的依据与边界。</p><div class="roam-evidence-layout"><div class="evidence-choices" role="group" aria-label="切换证据层次">${data.evidence.map(e=>`<button type="button" data-roam-evidence="${e.id}" aria-pressed="${e.id===evidence.id}"><span class="evidence-kind">${esc(e.label)}</span><strong>${esc(e.claim)}</strong></button>`).join('')}</div><div class="evidence-detail" aria-live="polite">${icon(evidence.id==='observation'?'eye':evidence.id==='explanation'?'help-circle':'git-branch')}<h3>${esc(evidence.label)}：这句话能说到哪一步</h3><blockquote>${esc(evidence.claim)}</blockquote><p>${esc(evidence.explanation)}</p><p class="roam-feedback">${evidence.id==='observation'?'已确认的是两份记录不一致。':evidence.id==='explanation'?'“可能”需要保留：本例没有模型的真实输入和处理记录。':'采用一个有依据的结论，同时写明它适用的条件。'}</p></div></div><div class="roam-carried"><strong>从上一站带来的材料：${esc(material.label)}</strong><p>${esc(material.conclusion)}</p><a class="quiet" href="${esc(link('sources',r,{material:'current'}))}">回看现行完整通知 ${icon('arrow-up-right')}</a></div></section>`;
  }
  const storageKey='jianquan.roam.ai-errors.v1';
  let draft={explanation:'',question:''},saved=false,storageAvailable=true;
  try {
    const input=JSON.parse(localStorage.getItem(storageKey) || 'null');
    if(input && typeof input==='object'){
      draft={explanation:typeof input.explanation==='string'?input.explanation.slice(0,3000):'',question:typeof input.question==='string'?input.question.slice(0,1500):''};
      saved=Boolean(draft.explanation || draft.question);
    }
  } catch(_){storageAvailable=false;}
  function noteForm() {
    return `<details class="roam-note"><summary>${icon('edit-3')}${esc(data.reflection.label)}</summary><p>可以写下你的解释和仍然不确定的部分。只有你主动保存的文字会留在这个浏览器里；浏览路线不会被认定为已掌握。</p><form id="roam-note-form"><label for="roam-explanation">现在，我会怎样解释这次回答？</label><textarea id="roam-explanation" name="explanation" rows="4" maxlength="3000" placeholder="例如：先分清生成的主张，再核对资料的版本和适用范围……">${esc(draft.explanation)}</textarea><label for="roam-question">我还想继续弄清什么？</label><textarea id="roam-question" name="question" rows="2" maxlength="1500" placeholder="例如：怎样知道模型实际读到了哪些材料？">${esc(draft.question)}</textarea><div class="roam-note-actions"><button class="button secondary" type="submit">保存这次理解</button><p role="status" id="roam-note-status">${!storageAvailable?'当前无法恢复本地记录，仍可在这里写下想法。':saved?'已恢复上次主动保存的文字。':draft.explanation || draft.question?'有未保存的修改。':'记录保存在本浏览器，不会上传。'}</p></div></form></details>`;
  }
  function recap(r) {
    const {material}=resolve(r);
    return `<section class="roam-recap"><div class="roam-answer-panel"><p class="eyebrow">回到同一个问题</p><h2>${esc(data.answer.title)}</h2><p>${esc(data.answer.text)}</p><p class="boundary">${esc(data.answer.boundary)}</p><a class="quiet" href="${esc(link('sources',r,{material:'current'}))}">这段回答依据哪份通知？ ${icon('arrow-up-right')}</a></div><div class="roam-result-grid">${data.steps.slice(0,3).map((s,i)=>`<section>${icon(icons[s.id])}<h3>${esc(s.label)}</h3><p>${['生成文字与核实事实，需要分开看。','有出处之后，还要检查版本和适用范围。','发现不一致，不等于已经确定错误原因。'][i]}</p><a class="quiet" href="${esc(link(s.id,r))}">回看这一站 ${icon('arrow-left')}</a></section>`).join('')}</div><p class="roam-feedback">你最后查看的材料是“${esc(material.label)}”。${esc(material.supports.reason)}这里的有条件回答以现行完整通知为依据。</p><section class="roam-section"><h2>最初的问题，现在可以问得更具体</h2><p>从“AI 为什么会答错”，走到“这句话的哪个主张没有被适用资料支持；还需要什么记录才能解释原因”。一个没想到的问题，变成了下一次可以继续寻找的线索。</p></section>${noteForm()}</section>`;
  }
  function onward(r) {
    const {step,index}=resolve(r),next=data.steps[index+1];
    return `<section class="roam-bridge"><div><h2>${esc(step.bridge.title)}</h2><p>${esc(step.bridge.text)}</p></div>${next?`<a class="button primary" href="${esc(link(next.id,r))}">${index===2?'回到最初的问题':'下一站：'+esc(next.label)} ${icon('arrow-right')}</a>`:`<a class="button primary" href="#home">回到世界全景 ${icon('arrow-right')}</a>`}</section><nav class="roam-actions"><a class="quiet" href="${esc(link(index>0?data.steps[index-1].id:'overview',r))}">${icon('arrow-left')}${index>0?'上一站：'+esc(data.steps[index-1].label):'返回路线起点'}</a><a class="quiet" href="${esc(link('overview',r))}">${icon('map')}查看整条路线</a></nav>`;
  }
  function details(r) {
    const {step}=resolve(r),d=window.JOURNEY_CATALOG.domains[step.domain];
    return `<details class="roam-deeper"><summary>${icon('book-open')}还想多看一层？</summary><a class="quiet" href="${esc(external(step.deepDive.href,r))}">${esc(step.deepDive.title)} ${icon('arrow-up-right')}</a><a class="quiet" href="${esc(external('#domain/'+d.id,r))}">打开${esc(d.title)}全景 ${icon('arrow-up-right')}</a><p>展开阅读后，可用“返回刚才的页面”回到本站，保留图解选择。</p></details><details class="roam-sources"><summary>本段科普的参考来源</summary><p>参考资料支持机制讲解；图书馆、通知和输出均为教学虚构。</p><ul>${step.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ${icon('external-link')}</a></li>`).join('')}</ul></details>`;
  }
  function render(r) {
    const {step,index}=resolve(r);
    if(index<0)return `<div class="roam-page">${overview(r)}</div>`;
    const diagrams={generation,sources:sourcesDiagram,evidence:evidenceDiagram,return:recap};
    return `<article class="roam-page roam-article">${heading(r,step.title,step.lead)}${caseBlock(true)}${diagrams[step.id](r)}${step.sections.map(s=>`<section class="roam-section"><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p></section>`).join('')}<p class="roam-takeaway">${icon('compass')}<span>${esc(step.takeaway)}</span></p>${onward(r)}${details(r)}</article>`;
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    const attr=['material','evidence','answer'].find(key=>b.hasAttribute('data-roam-'+key));if(!attr)return;
    const r=window.JOURNEY.route(location.hash);if(r?.kind!=='roam')return;
    const value=b.getAttribute('data-roam-'+attr),hash=link(resolve(r).step.id,r,{[attr]:value});
    history.replaceState(null,'',hash);window.JOURNEY.render(window.JOURNEY.route(hash));
    document.querySelector(`[data-roam-${attr}="${value}"]`)?.focus({preventScroll:true});
  });
  document.addEventListener('input',event=>{
    if(!event.target.matches('#roam-note-form textarea'))return;
    draft[event.target.name]=event.target.value;saved=false;
    const status=document.getElementById('roam-note-status');if(status)status.textContent='有未保存的修改。';
  });
  document.addEventListener('submit',event=>{
    if(event.target.id!=='roam-note-form')return;
    event.preventDefault();
    const form=new FormData(event.target);
    draft={explanation:String(form.get('explanation') || '').slice(0,3000),question:String(form.get('question') || '').slice(0,1500)};
    const status=document.getElementById('roam-note-status');
    if(!draft.explanation.trim() && !draft.question.trim()){status.textContent='写下一句理解或疑问后，再保存。';return;}
    try {localStorage.setItem(storageKey,JSON.stringify({...draft,updatedAt:new Date().toISOString()}));saved=true;storageAvailable=true;status.textContent='已保存在本浏览器。记录不代表掌握认证。';}
    catch(_){storageAvailable=false;status.textContent='未能写入本地存储。文字还在页面中，可以复制保留。';}
  });
  window.ROAM={hasStep,resolve,link,rail,render};
})();
