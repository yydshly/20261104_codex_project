/* Local study routes and a shared record for industry learning. */
(() => {
  'use strict';
  const paths = window.LEARNING_PATHS;
  const key = 'jianquan.industry-study.v1';
  const pending = new Map();
  const titles = {overview:'从一个问题开始',records:'我的学习记录',sources:'内容从哪里来'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const href = id => id==='overview'?'#study':'#study/'+id;
  const link = (id,from) => esc(window.JOURNEY.withBack(href(id),from));
  const label = id => Object.hasOwn(paths,id)?paths[id].title:titles[id];
  const conceptTitle = id => window.INDUSTRY_FOUNDATIONS[id].title;
  const has = id => Object.hasOwn(titles,id) || Object.hasOwn(paths,id);

  function storage() {
    try {
      const value=JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value==='object' && !Array.isArray(value)?value:{};
    } catch (_) { return {}; }
  }

  function choice(question,value) {
    if(value==='unsure')return {label:'我还不确定',feedback:'先看下方的判断步骤，找一条能支持结论的记录。',concept:question.concept};
    return Number.isInteger(value)?question.choices[value]:undefined;
  }

  function record(id) {
    const raw=pending.get(id) || storage()[id];
    const path=paths[id];
    const first=choice(path.first,raw?.first)?raw.first:null;
    return {
      first, transfer:first!==null && choice(path.transfer,raw?.transfer)?raw.transfer:null,
      note:first!==null && typeof raw?.note==='string'?raw.note.slice(0,1200):'',
      updated:typeof raw?.updated==='number'?raw.updated:0
    };
  }

  function save(id,patch) {
    const next={...record(id),...patch,updated:Date.now()};
    try {
      const stored=storage();
      stored[id]=next;
      localStorage.setItem(key,JSON.stringify(stored));
      pending.delete(id);
      return true;
    } catch (_) {
      pending.set(id,next);
      return false;
    }
  }

  function box(title,body,tag='') {
    return `<div class="explore-card">${tag?`<small class="explore-tag">${esc(tag)}</small>`:''}<h3>${esc(title)}</h3>${body}</div>`;
  }

  function directionsLink(path) {
    const q=new URLSearchParams({direction:path.direction,back:'#world/'+path.board});
    return '#learn/industries/'+path.sector+'?'+q;
  }

  function entry(sector,origin,direction) {
    const found=Object.entries(paths).find(([,path])=>path.sector===sector && (!direction || path.direction===direction));
    if(!found)return '';
    const [id,path]=found;
    return `<aside class="study-entry"><div><p class="eyebrow">先试一个判断</p><h2>${esc(path.question)}</h2><p>${esc(path.lead)}</p></div>
      <a class="button primary" href="${link(id,origin)}">开始这条学习路线</a></aside>`;
  }

  function nav(route) {
    return `<nav class="explore-trail" aria-label="学习导航">${Object.entries(titles).map(([id,title])=>
      `<a href="${route.id===id?href(id):link(id,route.hash)}"${route.id===id?' aria-current="page"':''}>${esc(title)}</a>`).join('')}</nav>`;
  }

  function conceptLink(id,route) {
    return `<a class="quiet" href="${esc(window.JOURNEY.withBack('#learn/foundations/'+id,route.hash))}">查看「${esc(conceptTitle(id))}」</a>`;
  }

  function questionView(question,stage,value,route) {
    const answer=choice(question,value);
    const heading=stage==='first'?'先做一个判断':'换一个场景再试';
    const controls=stage==='first' && answer?'':`<form data-study-form="${stage}" class="explore-choices foundation-choices" aria-label="${heading}">
      ${[...question.choices,choice(question,'unsure')].map((item,index)=>{
        const code=index===question.choices.length?'unsure':index;
        return `<button type="submit" name="choice" value="${code}" aria-pressed="${value===code}">${esc(item.label)}</button>`;
      }).join('')}</form>`;
    const feedback=answer?`<div class="explore-result"><h3 tabindex="-1" data-study-feedback="${stage}">对照证据看这个判断</h3>
      <p><strong>${esc(answer.label)}</strong></p><p>${esc(answer.feedback)}</p>
      ${stage==='transfer' && value===question.correct?'':conceptLink(answer.concept || question.concept,route)}</div>`:'';
    return `<section class="explore-block explore-lab"><p class="eyebrow">${stage==='first'?'01 · 发现可能漏掉的条件':'03 · 用新证据判断'}</p>
      <h2>${heading}</h2><p>${esc(question.prompt)}</p>${controls}${feedback}</section>`;
  }

  function sourceList(path) {
    return `<ul class="study-source-list">${path.sources.map(source=>`<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>
      <p>${esc(source.supports)}</p></li>`).join('')}</ul>`;
  }

  function pathBody(id,route) {
    const path=paths[id];
    const item=record(id);
    const model=item.first===null?'':`<section class="explore-block"><p class="eyebrow">02 · 看判断过程</p><h2>沿这三步查证</h2>
      <ol class="explore-process industry-flow">${path.map.map(([title,detail],index)=>
        `<li><small>0${index+1}</small><strong>${esc(title)}</strong><p>${esc(detail)}</p></li>`).join('')}</ol>
      <h3>参考成果</h3><dl class="study-sample">${path.sample.map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>
      <p>${esc(path.explanation)}</p></section>${questionView(path.transfer,'transfer',item.transfer,route)}
      ${item.transfer===null?'':`<section class="explore-block"><h2>留下自己的解释</h2>
        <form data-study-form="note" class="study-note"><label class="field" for="study-note">${esc(path.proof)}
        <textarea id="study-note" name="note" maxlength="1200" rows="4" required>${esc(item.note)}</textarea></label>
        <p>答案按本题的证据核对。你的解释按原文保留，可以回看和修订。</p>
        <button class="button primary" type="submit">保存我的解释</button></form></section>`}`;
    return `${questionView(path.first,'first',item.first,route)}${model}
      <section class="explore-block study-sources"><h2>资料与覆盖范围</h2><p>${esc(path.scope)}</p>
        <p>判断题、参考成果和数据是本站编写的教学示例。下列资料支持注明的知识点。</p>${sourceList(path)}
        <a class="quiet" href="${link('sources',route.hash)}">查看全站内容的来源和覆盖</a></section>`;
  }

  function status(path,item) {
    if(item.transfer===path.transfer.correct)return '已完成换例判断';
    if(item.transfer!==null)return '换例后有待复查';
    return item.first===path.first.correct?'可以尝试换例':'有基础概念可补';
  }

  function recordsView(route) {
    const entries=Object.entries(paths).map(([id,path])=>({id,path,item:record(id)}))
      .filter(({item})=>item.first!==null).sort((a,b)=>b.item.updated-a.item.updated);
    if(!entries.length)return `<section class="explore-block"><h2>从一次判断开始</h2><p>在学习路线里做一个判断，结果会出现在这里。</p>
      <a class="button primary" href="${link('overview',route.hash)}">找一条学习路线</a></section>`;
    return `<div class="explore-grid study-records">${entries.map(({id,path,item})=>{
      const phase=item.transfer===null?path.first:path.transfer;
      const selected=choice(phase,item.transfer ?? item.first);
      const next=selected.concept || phase.concept;
      const first=choice(path.first,item.first);
      return box(path.title,`<dl class="study-record"><dt>第一次判断</dt><dd>${esc(first.label)}</dd>
        <dt>当时需要核对什么</dt><dd>${esc(first.feedback)}</dd>
        <dt>接下来可以补</dt><dd>${conceptLink(next,route)}</dd>
        <dt>现在能用什么证据解释</dt><dd>${item.note?esc(item.note):'可在完成换例判断后写下自己的解释。'}</dd></dl>
        <a class="quiet" href="${link(id,route.hash)}">继续「${esc(path.title)}」</a>`,status(path,item));
    }).join('')}</div>`;
  }

  function sourcesView(route) {
    const {source,sectors}=window.INDUSTRY_DATA;
    const directions=Object.values(window.INDUSTRY_DIRECTIONS).flat().length;
    const concepts=Object.keys(window.INDUSTRY_FOUNDATIONS).length;
    const referenced=Object.values(window.INDUSTRY_PATHS).filter(path=>path.source).length;
    return `<section class="explore-block"><h2>依据、归纳和练习</h2><div class="explore-grid">
      ${box('行业分类有原始出处',`<p>行业目录采用国家统计局发布的《国民经济行业分类》门类 A–T。此出处用于核对门类名称与范围。</p><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`,'原始资料')}
      ${box('学习结构由本站整理','<p>七个社会板块、工作方向、学习顺序与跨行业概念是 AI 辅助编写的教学组织。每个方向都从一个具体切口进入。</p>','教学归纳')}
      ${box('练习用构造情境','<p>练习数据、公司案例和示范答案是为解释判断过程编写的。每条新学习路线注明原文支持的说法。</p>','虚构教学示例')}
      </div></section>
      <section class="explore-block"><h2>目前覆盖到哪一层</h2><p>以下是行业学习内容的覆盖。AI 等专题可在对应文章中查看参考资料。</p>
        <dl class="study-record"><dt>行业门类</dt><dd>${sectors.length} 个门类都有入口和一项代表案例。行业页中有 ${referenced} 个附参考链接。</dd>
        <dt>工作与基础</dt><dd>${directions} 个代表性方向连接 ${concepts} 个通用概念。子行业、岗位差异和专业知识需要继续按方向展开。</dd>
        <dt>逐条对照出处的练习</dt><dd>${Object.keys(paths).length} 条路线标明了具体出处、练习范围与后续学习边界。</dd></dl></section>
      <section class="explore-block"><h2>怎样核对一条内容</h2><ol class="explore-steps">
        <li>先看引用支持的是分类、规则、方法，还是某个具体结论。</li>
        <li>打开原文核对章节、版本和适用条件。证据不足的部分按教学归纳或待核对处理。</li>
        <li>判断覆盖时先定层级。门类齐全说明可以从宏观找到入口，具体岗位与专业能力还要逐项对照和补齐。</li>
        </ol><a class="quiet" href="#research">阅读研究与共识，查看审核方案与现有资料索引</a></section><section class="explore-block"><h2>查看这三条路线的依据</h2>
        ${Object.entries(paths).map(([id,path])=>`<section class="study-sources"><h3><a href="${link(id,route.hash)}">${esc(path.title)}</a></h3>
          <p>${esc(path.scope)}</p>${sourceList(path)}</section>`).join('')}</section>`;
  }

  function render(route) {
    const id=route.id || 'overview';
    const path=paths[id];
    const back=window.JOURNEY.safeBack(route.q.get('back'),'#home');
    const description=path?path.lead:id==='records'?'三个方向共用一份学习记录。判断和解释保存在当前浏览器。':
      id==='sources'?'查看分类依据、教学归纳和目前能核对到的范围。':'选一个身边的问题，先试一次判断，再沿着它补知识。';
    const body=path?pathBody(id,route):id==='records'?recordsView(route):id==='sources'?sourcesView(route):
      `<section class="explore-block"><h2>选一个问题</h2><div class="explore-grid">${Object.entries(paths).map(([key,item])=>
        box(item.question,`<p>${esc(item.lead)}</p><a class="quiet" href="${link(key,route.hash)}">进入「${esc(item.title)}」</a>`)).join('')}</div></section>`;
    return `<article class="explore-page">${nav({...route,id})}<header class="explore-hero"><p class="eyebrow">见全 · ${path?esc(path.title):'学习与查证'}</p>
      <h1>${esc(path?.question || titles[id])}</h1><p>${esc(description)}</p>
      <div class="explore-hero-actions"><a class="quiet" href="${esc(back)}">${back==='#home'?'返回世界全景':'返回刚才的位置'}</a>
      ${path?`<a class="quiet" href="${esc(directionsLink(path))}">回工作方向</a>`:''}</div></header>
      ${path?'<p class="study-local">本路线使用虚构情境。选下判断后会记录在当前浏览器。</p><p id="study-status" class="study-status" role="status"></p>':''}
      <div id="study-content">${body}</div></article>`;
  }

  function searchItems() {
    return Object.entries(paths).map(([id,path])=>({title:path.question,description:path.lead,
      text:[path.title,path.search,path.first.prompt].join(' '),href:href(id),tag:'从一个问题开始',domain:'study',type:'学习路线'}));
  }

  document.addEventListener('submit',event=>{
    const form=event.target;
    const stage=form.dataset.studyForm;
    if(!stage)return;
    event.preventDefault();
    const route=window.JOURNEY.route(location.hash);
    const id=route?.kind==='study' && route.id;
    if(!Object.hasOwn(paths,id))return;
    const path=paths[id];
    const item=record(id);
    let patch;
    if(stage==='note') {
      const note=String(new FormData(form).get('note') || '').trim().slice(0,1200);
      if(item.transfer===null)return;
      if(!note) {
        document.getElementById('study-status').textContent='请先写下你的解释。';
        return;
      }
      patch={note};
    } else {
      if(stage==='first'?item.first!==null:stage!=='transfer' || item.first===null)return;
      const submitted=event.submitter?.value;
      const selected=submitted==='unsure'?'unsure':/^\d+$/.test(submitted || '')?Number(submitted):null;
      if(!choice(path[stage],selected))return;
      patch={[stage]:selected};
    }
    const saved=save(id,patch);
    const status=document.getElementById('study-status');
    status.textContent=saved?(stage==='note'?'解释已保存':'判断已记入学习记录'):'当前浏览器无法持久保存。本次访问仍可继续。';
    if(stage==='note')return;
    const content=document.getElementById('study-content');
    const draft=content.querySelector('#study-note')?.value;
    content.innerHTML=pathBody(id,route);
    if(draft!==undefined)content.querySelector('#study-note').value=draft;
    content.querySelector(`[data-study-feedback="${stage}"]`)?.focus();
  });

  window.LEARNING={has,label,entry,render,searchItems};
})();
