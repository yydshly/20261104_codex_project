/* Cognitive navigation: locate a subject, choose depth, and follow explained connections. */
(() => {
  'use strict';
  const catalog = () => window.JOURNEY_CATALOG;
  const data = () => window.COGNITION_DATA;
  const ai = () => window.AI_ATLAS_DATA;
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => window.feather?.icons[name]?.toSvg({'aria-hidden':'true',width:20,height:20,'stroke-width':1.6}) || '';
  const arrow = () => icon('arrow-right');
  const directionHref = (domain,id) => '#domain/'+domain+'?direction='+encodeURIComponent(id);
  const titleOf = href => {
    const [kind,id]=href.slice(1).split('?')[0].split('/');
    return kind==='topic'?ai().topics.find(t=>t.id===id)?.title:kind==='article'?(id==='retrieval'?'资料怎样进入 AI 回答':catalog().articles[id]?.title):kind==='domain'?catalog().domains[id]?.title:kind==='roam'?'AI 为什么会答错？':null;
  };
  function anchor(item,back,classes='',body='') {
    const href=item.href,legacy=href.startsWith('#topic/');
    const target=legacy || item.direct?href:window.JOURNEY.withBack(href,back);
    return `<a class="${classes}" href="${esc(target)}" ${legacy?`data-entry="explore" data-return="${esc(back)}"`:''}>${body || esc(item.title || titleOf(href))+' '+arrow()}</a>`;
  }
  function branches(id) {
    const d=catalog().domains[id];
    if(!d)return [];
    if(id==='ai')return ai().areas.map(a=>({...a,...data().ai[a.id],contains:data().ai[a.id]?.contains || a.topics.map(t=>ai().topics.find(x=>x.id===t).shortTitle)}));
    return d.nodes.map(n=>{
      const a=catalog().articles[n.article];
      const related=(a.related || []).filter(x=>catalog().articles[x] && x!==n.article).slice(0,1);
      const links=a.crossLinks || d.connections;
      return {...n,outcome:a.takeaway,contains:(a.visual?.steps || []).map(x=>x.title).slice(0,4),
        steps:[{level:'先建立直观认识',title:a.title,href:'#article/'+a.id,reason:a.lead},...related.map(id=>({level:'再展开相邻机制',title:catalog().articles[id].title,href:'#article/'+id,reason:catalog().articles[id].takeaway}))],
        foundations:[{title:'先辨认：'+n.title,explanation:a.sections[0].text,href:'#article/'+a.id,reason:'在例子与图解中继续理解这个基础。'}],
        neighbors:links.slice(0,2),frontier:data().domains[id]?.frontier || '这里展开入门解释；专业方法和完整实践还需要继续阅读。'};
    });
  }
  function select(r) {
    const list=branches(r.id);
    return list.find(x=>x.id===r.q.get('direction')) || list[0];
  }
  function homeStart(origin) {
    const options=origin?[
      ['computing','从熟悉的工作定位','软件与计算','看清数据、算法、系统与验证'],
      ['ai','向相邻方向扩展','人工智能','展开八个方向，再选择深入路径'],
      ['information','发现另一种观察角度','信息组织','从“能存储”走向“怎样找到与辨别”']
    ]:[
      ['ai','想认识一项技术','人工智能','先看主要版图，再找到感兴趣的分支'],
      ['information','想整理纷繁的信息','信息组织','认识描述、分类、检索与来源'],
      ['education','想理解自己的学习','教育与传播','连接学习、反馈、表达与证据']
    ];
    return `<aside class="cog-start"><p class="aside-kicker">${origin?'我的起点 · 程序员':'我的起点 · 自由浏览'}</p><h2>从这里，打开哪些方向？</h2><p>先认识每个领域在讲什么，再决定往哪里深入。</p><div class="cog-origin-path">${options.map(([id,kicker,title,text])=>`<a href="#domain/${id}"><small>${esc(kicker)}</small><strong>${esc(title)} ${arrow()}</strong><span>${esc(text)}</span></a>`).join('')}</div><a class="button primary" href="#domain/ai">展开 AI 方向地图 ${arrow()}</a><a class="quiet" href="#search">已经有方向？查找领域或概念 ${icon('search')}</a></aside>`;
  }
  function homeDomains() {
    return `<section class="cog-home-domains"><div class="section-heading"><div><p class="eyebrow">当前可以深入的领域</p><h2>选一个方向，看见它包含什么。</h2></div></div><div class="cog-domain-cards">${Object.values(catalog().domains).map(d=>`<a href="#domain/${d.id}">${icon(d.icon)}<h3>${esc(d.title)}</h3><p>${esc(d.id==='ai'?'从原理、能力到系统、产业与社会，定位你还没有接触的部分。':data().domains[d.id]?.outcome || d.lead)}</p><small>${branches(d.id).length} 个方向 · 内部结构 / 深入路径 / 关联基础 ${arrow()}</small></a>`).join('')}</div><p class="cog-coverage">地图是一种帮助定位的阅读框架。上方社会全景提供更大的观察范围；这四个领域已经展开方向与讲解，专业细节仍会持续补充。</p></section>`;
  }
  function domain(r) {
    const d=catalog().domains[r.id],list=branches(r.id),selected=select(r);
    const dirLink=id=>{const q=new URLSearchParams(r.q);q.set('direction',id);return '#domain/'+r.id+'?'+q.toString();};
    return `${r.id==='ai'?`<div class="cog-submaps">${window.LLM?.entry(r.hash) || ''}${window.AGENT_MAP?.entry(r.hash) || ''}${window.RAG_MAP?.entry(r.hash) || ''}${window.CONTEXT_MAP?.entry(r.hash) || ''}</div>`:''}<div class="cog-workspace"><section class="cog-map" tabindex="-1" aria-label="${esc(d.title)}方向地图"><header><p class="eyebrow">01 / 看见主要方向</p><h2>这个领域包含什么？</h2><p>点击一个方向，展开它的内部结构与深入路径。</p></header><nav class="cog-branches" aria-label="选择认知方向">${list.map((b,i)=>`<a class="cog-branch" data-cog-direction="${esc(b.id)}" href="${esc(dirLink(b.id))}" ${b.id===selected.id?'aria-current="true"':''}><span class="cog-branch-number">${String(i+1).padStart(2,'0')}</span><strong>${esc(b.title)}</strong><small>${esc(b.question || b.summary)}</small><span class="cog-branch-concepts">${esc(b.contains.slice(0,3).join(' · '))}</span></a>`).join('')}</nav><p class="cog-coverage">这些方向彼此交叉，可以从任意一个开始。选择表示当前浏览位置。</p><a class="quiet" href="#home">${icon('arrow-left')}回到世界全景，换一个领域</a></section><section class="cog-panel" id="cog-direction" tabindex="-1" aria-label="${esc(selected.title)}的深入路径"><header><p class="eyebrow">02 / 展开所选方向 · ${esc(d.title)}</p><h2>${esc(selected.title)}</h2><button type="button" class="quiet cog-map-return" data-cog-show-map>${icon('arrow-up')}回到方向地图，换个方向</button><p>${esc(selected.outcome || selected.summary)}</p></header><div class="cog-inside" aria-label="这个方向涉及的内容">${selected.contains.map(x=>`<span>${esc(x)}</span>`).join('')}</div><section class="cog-depth"><h3>可以怎样深入？</h3><p>按需要选择深度，每篇都可以独立阅读。</p><ol>${selected.steps.map((s,i)=>`<li><span class="cog-step-number">${String(i+1).padStart(2,'0')}</span><div><small>${esc(s.level)}</small>${anchor(s,r.hash)}<p>${esc(s.reason)}</p></div></li>`).join('')}</ol></section><section class="cog-foundations"><h3>会涉及哪些基础？</h3><p>遇到陌生概念时，可以在这里展开，再回到原来的方向。</p>${selected.foundations.map(f=>`<details><summary>${esc(f.title)} ${icon('chevron-down')}</summary><p>${esc(f.explanation)}</p>${anchor(f,r.hash,'quiet',esc(f.reason || '展开基础讲解')+' '+arrow())}</details>`).join('')}</section><section><h3>它还通向哪些方向？</h3><div class="cog-neighbors">${selected.neighbors.map(n=>anchor(n,r.hash,'',`<strong>${esc(n.title)}</strong><p>${esc(n.reason)}</p><span>沿这个关联继续 ${arrow()}</span>`)).join('')}</div></section><div class="cog-frontier"><strong>当前展开到哪里</strong><p>${esc(selected.frontier)}</p></div></section></div>${r.id==='ai'?`<section class="cog-secondary-entry"><div><p class="eyebrow">也可以从具体问题进入</p><h2>AI 为什么会答错？</h2><p>这个案例连接生成机制、信息来源与证据判断。看完后，回到方向地图继续展开。</p></div>${anchor({href:'#roam/ai-errors',title:'沿案例理解这些关联'},r.hash,'button secondary')}</section>`:''}`;
  }
  function resolveNode(href,returnHash='') {
    const path=href.split('?')[0],topicId=path.startsWith('#topic/')?path.slice(7):null;
    const t=ai().topics.find(x=>x.id===topicId);
    let domainId=t?'ai':path==='#article/retrieval'?'ai':catalog().articles[path.slice(9)]?.domain;
    if(!domainId)return null;
    const list=branches(domainId);
    let chosen;
    // Retain the direction used to enter, if this reading belongs to its path.
    if(returnHash.startsWith('#domain/'+domainId)) {
      const query=new URLSearchParams(returnHash.split('?')[1] || '');
      chosen=list.find(b=>b.id===query.get('direction') && b.steps.some(s=>s.href===path));
    }
    const supplemental={...Object.fromEntries(Object.values(catalog().articles).filter(a=>a.contextNode).map(a=>[a.id,a.contextNode==='evaluation'?'evaluation':'system'])), ...Object.fromEntries(Object.values(catalog().articles).filter(a=>a.ragNode).map(a=>[a.id,a.ragNode==='evaluation'?'evaluation':'system'])), ...Object.fromEntries(Object.values(catalog().articles).filter(a=>a.agentNode).map(a=>[a.id,a.agentNode==='evaluation'?'evaluation':'system'])),...Object.fromEntries(Object.values(catalog().articles).filter(a=>a.llmNode).map(a=>[a.id,['adaptation'].includes(a.llmNode)?'system':a.llmNode==='evaluation'?'evaluation':'method'])),'ai-context':'method','ai-generation':'method','ai-agent':'system',retrieval:'system','info-finding':'retrieval'};
    if(!chosen)chosen=list.find(b=>b.id===(t?.area || supplemental[path.slice(9)])) || list.find(b=>b.article===path.slice(9)) || list.find(b=>b.steps.some(s=>s.href===path)) || list[0];
    return {domainId,branch:chosen,index:chosen.steps.findIndex(s=>s.href===path),href:path};
  }
  function mapContext(href,back='') {
    for(const [map,title] of [[window.CONTEXT_MAP,'提示词与上下文工程'],[window.RAG_MAP,'RAG 检索增强生成'],[window.AGENT_MAP,'AI 智能体 Agent'],[window.LLM,'大语言模型']]) {
      const context=map?.mapContext(href,back);if(context)return {...context,map,title};
    }
    return null;
  }
  function wayfinding(href,returnHash='') {
    const context=mapContext(href,returnHash);if(context)return context.map.wayfinding(href,returnHash);
    const node=resolveNode(href,returnHash);if(!node)return '';
    const d=catalog().domains[node.domainId];
    return `<section class="cog-wayfinding" aria-label="这个知识点在地图中的位置"><nav><a href="#home">认知全景</a>${icon('chevron-right')}<a href="#domain/${d.id}">${esc(d.title)}</a>${icon('chevron-right')}<a href="${esc(directionHref(d.id,node.branch.id))}">${esc(node.branch.title)}</a><span>当前知识点</span></nav><p>这一页帮助你理解：${esc(node.index>=0?node.branch.steps[node.index].reason:node.branch.outcome)}</p></section>`;
  }
  function readingNav(href,returnHash='') {
    const context=mapContext(href,returnHash);if(context)return context.map.readingNav(href,returnHash);
    const node=resolveNode(href,returnHash);if(!node)return '';
    const b=node.branch,canonical=directionHref(node.domainId,b.id);
    const back=window.JOURNEY.safeBack(returnHash,canonical);
    const next=b.steps[node.index+1],neighbor=b.neighbors[0];
    const cards=[{href:back,direct:true,title:'返回刚才的位置',reason:'保留进入这篇讲解时的方向或线索。',label:'回到来处'},
      {href:canonical,title:'展开「'+b.title+'」的完整路径',reason:'看见这个方向的内部结构、所需基础与相邻领域。',label:'重新定位'},
      next?{...next,label:node.index<0?'从这个方向的起点认识':next.level || '继续展开'}:{...neighbor,label:'向相邻方向展开'}];
    return `<section class="cog-reading-nav"><p class="eyebrow">把这一点放回更大的图里</p><h2>接下来，可以往哪里走？</h2><div class="cog-next-grid">${cards.map(c=>anchor(c,href,'',`<small>${esc(c.label)}</small><strong>${esc(c.title)} ${arrow()}</strong><p>${esc(c.reason)}</p>`)).join('')}</div><p class="cog-coverage">读完这一页，可以继续深入，也可以停在这里，回到地图选择其他方向。</p></section>`;
  }
  document.addEventListener('click',event=>{
    if(!event.target.closest('[data-cog-show-map]'))return;
    const map=document.querySelector('.cog-map');
    map?.focus({preventScroll:true});map?.scrollIntoView({block:'start',behavior:'instant'});
  });
  window.COGNITION={branches,select,domain,homeStart,homeDomains,wayfinding,readingNav,directionHref,resolveNode,mapContext};
})();
