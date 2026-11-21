/* Shared entry points for industry overviews, practical skills and thinking. */
(() => {
  'use strict';
  const modes = {
    industries:{name:'看行业',title:'行业全景',icon:'globe',lead:'看一个行业怎样运转、有哪些分工，再找到值得了解的工作和能力。',action:'打开行业全景'},
    skills:{name:'学技能',title:'技能目录',icon:'tool',lead:'从一个可以练习的动作入手，看它如何用在不同工作里。',action:'浏览实用技能'},
    thinking:{name:'练思维',title:'思维方法',icon:'compass',lead:'借实际情境练习拆解问题、核对证据、比较结果。',action:'选择一个情境'},
    foundations:{name:'补基础',title:'基础概念',icon:'book-open',lead:'先做一个小判断，再看清概念和它在不同行业里的用法。'}
  };
  const skills = {
    'map-flow':{
      title:'画出工作流程',lead:'把输入、交接和结果放在一张图里，找出每一步该留下什么记录。',
      steps:[['确定起点和结果','写明从哪里开始，到什么状态才算完成。'],['标出交接','每一步写清接手的人、收到的东西和交出的结果。'],['给结果留证据','挑一个能查到的记录，确认这一步确实结束。']],
      exercise:'试着用三步画出一笔订单从接收到交付的过程，并标出哪里可以确认交接成功。',
      example:'接单时记录订单号 → 仓库交给承运方并取得签收 → 到货后留收货确认。只有出库登记时，还需要查承运方是否已接手。',
      method:'trace',sectors:['logistics','manufacturing','software']
    },
    'verify-evidence':{
      title:'核对信息与依据',lead:'先说清要验证的结论，再找能支持它的记录，核对来源和适用条件。',
      steps:[['写出主张','把“应该没问题”改成可以核对的一句话。'],['查原始记录','找到时间、版本、适用对象和能回查的来源。'],['限定结论','材料只支持一部分时，把仍待核实的条件单独写出。']],
      exercise:'一张仓库出库截图能否证明包裹已经在路上？还需要哪一条记录？',
      example:'截图支持“仓库完成了出库登记”。可以继续核对承运方签收和后续运输记录，确认是否已经实际交接。',
      method:'compare',sectors:['logistics','manufacturing','software']
    },
    'explain-work':{
      title:'把工作说明白',lead:'向别人说明做了什么、依据是什么、还有什么需要确认，让对方能接着做。',
      steps:[['交代目标','先告诉接手人当前要解决什么。'],['列出已知情况','用可回查的事实说明做到哪一步。'],['说明下一步','写清谁需要确认什么，以及确认后怎样继续。']],
      exercise:'给接手的同事写一句交接说明。包裹已出库，承运签收还查不到。',
      example:'订单已于上午出库，尚未找到承运方签收。请先核对交接单和扫描记录，再更新预计发运时间。',
      method:'feedback',sectors:['logistics','manufacturing','software']
    }
  };
  const methods = {
    trace:{title:'分段定位',lead:'把一条流程拆开，找出第一处记录与预期不一致的地方。',skill:'map-flow'},
    compare:{
      title:'用同样条件比较',lead:'比较两个做法时，先让问题、材料和检查标准保持一致。',
      scenario:'两班使用了不同的检查流程。甲班发现了 6 件问题品，乙班发现了 3 件。',
      prompts:[['先核对分母','两班各检查了多少件？'],['再核对条件','产品、问题定义和抽查方式是否一致？'],['设计下一次比较','用同样的样品和判断标准，再观察两个流程各发现了什么。']],
      example:'如果甲班检查 600 件，乙班检查 100 件，单看 6 和 3 就不能判断哪班问题更多。还要核对样品与检查标准，才能解释差异。',
      skill:'verify-evidence'
    },
    feedback:{
      title:'用反馈修正做法',lead:'做完一次，拿结果和预期对照，挑出一个可以改变的动作再试。',
      scenario:'交接后，同事仍来问「这个订单现在由谁处理？」',
      prompts:[['记录实际结果','接手人没能从说明中找到负责方。'],['改一件事','在交接记录里加上当前负责方和下一次确认时间。'],['换一个例子复查','看另一笔订单的接手人能否独立说出下一步。']],
      example:'用对方能不能继续工作来检验交接说明，再记录仍然缺失的信息。',
      skill:'explain-work'
    }
  };
  const examples = {
    logistics:{
      title:'物流 · 包裹没有后续记录',sector:'logistics',
      question:'客户问包裹为什么迟迟没动。沿着记录看，哪一步最先需要核对？',
      stages:[
        ['接收订单','订单号和收件资料齐全。'],
        ['仓库出库','仓库有打包记录和出库时间。'],
        ['承运交接','按约应有签收记录，目前没有查到。'],
        ['运输与派送','暂时没有后续运输记录。']
      ],answer:2,detail:'最先查承运交接。先核对交接单和扫描记录，区分货物还没交出去与记录漏了。'
    },
    manufacturing:{
      title:'制造 · 包装在什么环节出现破损',sector:'manufacturing',
      question:'一批产品到装箱时发现包装破损。看记录，哪里最早出现了可见异常？',
      stages:[
        ['包装材料入库','该批抽检记录中，样品外观完整。'],
        ['包装线入口','这件样品进入设备前，边角已经破损。'],
        ['包装线出口','同一件样品出线后，仍能看到边角破损。'],
        ['装箱检查','装箱人员再次发现该处破损。']
      ],answer:1,detail:'先查包装线入口前的交接与搬运记录。入库抽检覆盖部分样品，还需要核对这件样品入库时的状态。'
    },
    software:{
      title:'软件 · 网页有外壳，内容出不来',sector:'software',
      question:'用户打开页面能看见标题，列表一直加载失败。哪一步最先显示异常？',
      stages:[
        ['打开地址','浏览器访问了预期的站点。'],
        ['加载页面','页面结构和样式已返回。'],
        ['读取列表','列表请求收到服务暂不可用的响应。'],
        ['显示列表','页面没有可显示的数据。']
      ],answer:2,detail:'先查读取列表的请求及服务记录。页面空白是后面的表现，现有记录还不足以确定服务为何不可用。'
    }
  };

  const industryData = () => window.INDUSTRY_DATA;
  const sectors = () => industryData().sectors;
  const sectorById = id => sectors().find(sector=>sector.id===id);
  const industryPath = id => window.INDUSTRY_PATHS?.[id];
  const industryDirections = id => window.INDUSTRY_DIRECTIONS?.[id] || [];
  const foundations = () => window.INDUSTRY_FOUNDATIONS || {};
  const learningItems = mode => mode==='skills'?skills:mode==='thinking'?methods:foundations();
  const isIndustry = route => route?.kind==='learn' && route.id==='industries' && route.tab!=='overview';
  const currentDirection = route => isIndustry(route)?industryDirections(route.tab).find(item=>item.id===route.q.get('direction')):null;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[char]);
  const icon = name => window.feather?.icons[name]?.toSvg({'aria-hidden':'true',width:20,height:20}) || '';
  const path = (mode,item='overview') => '#learn/'+mode+(item==='overview'?'':'/'+item);

  function has(mode,item='overview') {
    if(!Object.hasOwn(modes,mode))return false;
    if(item==='overview')return true;
    if(mode==='industries')return Boolean(sectorById(item));
    return Object.hasOwn(learningItems(mode),item);
  }

  function title(mode,item='overview') {
    if(!has(mode,item))return '';
    if(item==='overview')return modes[mode].title;
    return mode==='industries'?sectorById(item).title:learningItems(mode)[item].title;
  }

  function withBack(href,from) {
    return window.JOURNEY.withBack(href,from);
  }

  function follow(mode,item,route) {
    return withBack(path(mode,item),route.hash);
  }

  function previous(route) {
    const back=window.JOURNEY.safeBack(route.q.get('back'),'');
    return back?window.JOURNEY.route(back):null;
  }

  function directionHref(industryId, directionId, parameters) {
    const q=new URLSearchParams(parameters);
    if(directionId)q.set('direction',directionId);
    else q.delete('direction');
    return path('industries',industryId)+(q.size?'?'+q:'');
  }

  function trail(route) {
    const from=previous(route);
    const industry=isIndustry(route)?route:isIndustry(from)?from:null;
    if(industry) {
      const world=previous(industry);
      const direction=currentDirection(industry);
      const base=world?.kind==='world' && world.tab==='overview'?
        [window.JOURNEY.worldTitle(world.id),world.hash]:[modes.industries.title,path('industries')];
      const items=[base,[title('industries',industry.tab),direction?directionHref(industry.tab,null,industry.q):industry.hash]];
      if(direction)items.push([direction.title,industry.hash]);
      if(route!==industry)items.push([title(route.id,route.tab),null]);
      return items;
    }
    const items=[[modes[route.id].title,path(route.id)]];
    if(route.tab!=='overview')items.push([title(route.id,route.tab),null]);
    return items;
  }

  function card(href,heading,body,tag='') {
    return `<a class="explore-card" href="${esc(href)}">${tag?`<small class="explore-tag">${esc(tag)}</small>`:''}
      <h3>${esc(heading)} ${icon('arrow-right')}</h3><p>${esc(body)}</p></a>`;
  }

  function section(heading,content,lead='') {
    return `<section class="explore-block"><h2>${esc(heading)}</h2>${lead?`<p>${esc(lead)}</p>`:''}${content}</section>`;
  }

  function home(worldMap = '') {
    return `<div class="explore-page explore-home">
      <header class="explore-map-intro"><p class="eyebrow">见全 · 跨领域科普</p>
        <h1 id="world-map-title">世界全景</h1>
        <p>社会怎样运转？先点一个板块，看看有哪些行业和分工，再沿着一个工作方向了解需要的技能和思维方式。</p>
        <ol class="explore-map-steps" aria-label="浏览层级"><li>社会板块</li><li>${icon('chevron-right')}行业</li><li>${icon('chevron-right')}工作方向</li><li>${icon('chevron-right')}技能与思维方式</li></ol>
        <a class="quiet" href="#research">研究与共识 · 了解项目目标、已有研究与下一步 ${icon('arrow-right')}</a>
      </header>
      ${worldMap}
      <section class="study-entry" aria-label="从一个问题开始"><div><p class="eyebrow">还没想好看什么</p><h2>先试一个判断</h2><p>从空列表、产线抽检或学生作答入手，看看自己漏看了哪条线索。</p></div>
        <a class="button primary" href="#study">选一个问题</a><a class="quiet" href="#study/records">我的学习记录</a></section>
      <section class="explore-block explore-shortcuts"><h2>直接找一个行业、技能或方法</h2>
      <nav class="explore-entries" aria-label="探索快捷入口">${Object.entries(modes).filter(([,item])=>item.action).map(([mode,item],index)=>
        `<a class="explore-entry" href="${esc(withBack(path(mode),'#home'))}">
          <small>0${index+1} ${icon(item.icon)}</small><h3>${item.name}</h3><p>${item.lead}</p>
          <span>${item.action} ${icon('arrow-right')}</span></a>`).join('')}</nav>
      <a class="quiet" href="${esc(withBack(path('foundations'),'#home'))}">${icon('book-open')} 浏览跨行业基础概念 ${icon('arrow-right')}</a></section>
      <section class="explore-block"><p class="eyebrow">从一个具体问题开始</p><h2>包裹没动，可以先查哪里？</h2>
        <p>从物流的交接记录找起，再换到制造和软件，用同样的方法判断第一处异常。</p>
        <a class="button primary" href="${esc(withBack(path('thinking','trace')+'?case=logistics','#home'))}">试一次分段定位 ${icon('arrow-right')}</a>
      </section>
      <nav class="explore-trail" aria-label="已有专题快捷入口">
        <a href="#domain/ai">${icon('cpu')} AI 方向地图</a>
        <a href="${esc(withBack('#project/knowledge-assistant','#home'))}">${icon('book-open')} 公司知识库助手</a>
      </nav>
    </div>`;
  }

  function modeNav(route) {
    return `<nav class="explore-trail" aria-label="探索入口">${Object.entries(modes).map(([mode,item])=>
      `<a href="${esc(path(mode))}"${mode===route.id?' aria-current="true"':''}>${icon(item.icon)} ${item.name}</a>`).join('')}</nav>`;
  }

  function rail(route) {
    return `<h2>知识探索</h2><nav class="local-tree" aria-label="知识探索方向">${Object.entries(modes).map(([mode,item])=>
      `<a href="${esc(path(mode))}"${mode===route.id?' aria-current="page"':''}>${icon(item.icon)} ${item.name}</a>`).join('')}</nav>
      <a class="quiet rail-bottom" href="#home">返回探索首页</a>`;
  }

  function industryIndex(route) {
    const {groups,source}=industryData();
    const requested=route.q.get('group');
    const active=groups.find(group=>group.id===requested)?.id || '';
    const back=window.JOURNEY.safeBack(route.q.get('back'),'');
    const filterHref=id=>{
      const q=new URLSearchParams();
      if(id)q.set('group',id);
      if(back)q.set('back',back);
      return path('industries')+(q.size?'?'+q:'');
    };
    const filters=[{id:'',title:'全部'},...groups];
    return `<div class="explore-index">
      <nav class="explore-filter" aria-label="按行业板块查看">${filters.map(group=>
        `<a href="${esc(filterHref(group.id))}"${group.id===active?' aria-current="true"':''}>${esc(group.title)}</a>`).join('')}</nav>
      ${groups.filter(group=>!active||group.id===active).map(group=>
        `<section class="explore-group"><h2>${icon(group.icon)} ${esc(group.title)}</h2><p>${esc(group.lead)}</p>
          <div class="explore-grid">${sectors().filter(sector=>sector.group===group.id).map(sector=>
            card(follow('industries',sector.id,route),sector.title,sector.summary,industryTag(sector,'行业概览'))).join('')}</div>
        </section>`).join('')}
      <p class="explore-note">覆盖 ${sectors().length} 个行业门类，按便于浏览的方式分组。<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ${icon('external-link')}</a></p>
    </div>`;
  }

  const worldIndustryCount = id => industryData().worldIndustries[id].length;
  const industryTag = (sector,fallback) => industryPath(sector.id)?'行业路线 · 含动手体验':sector.demo?'行业 · 含情境练习':fallback;

  function worldIndustryView(route) {
    const entries=industryData().worldIndustries[route.id];
    const cards=entries.map(([id,question])=>{
      const sector=sectorById(id);
      return card(follow('industries',id,route),sector.title,question,industryTag(sector,'行业'));
    }).join('');
    return `<div class="explore-page explore-world-industries">${section('从这些行业继续看',
      `<div class="explore-grid">${cards}</div>`,`这 ${entries.length} 个行业各提供一个理解本板块的角度。选一个行业，看看它怎样分工，以及做这些工作用到哪些技能和思维方式。`)}
      <p class="explore-note">同一个行业可以出现在多个板块。<a href="${esc(follow('industries','overview',route))}">浏览全部 ${sectors().length} 个行业门类 ${icon('arrow-right')}</a></p></div>`;
  }

  function practiceResult(lab,option) {
    const records=lab.metric?option.rows.map(([label,count,total,note])=>{
      const percent=Math.round(1000*count/total)/10;
      return `<li><div class="industry-measure"><strong>${esc(label)}</strong><span>${count} / ${total} · ${percent}%</span></div>
        <div class="industry-meter" aria-hidden="true"><span style="width:${percent}%"></span></div><p>${esc(note)}</p></li>`;
    }):option.rows.map(([label,value,note])=>`<li><div class="industry-measure"><strong>${esc(label)}</strong><span>${esc(value)}</span></div><p>${esc(note)}</p></li>`);
    return `<figure class="industry-chart${lab.metric?'':' industry-records'}"><figcaption>${esc(lab.metric || '这次看到的记录')}</figcaption><ul>${records.join('')}</ul></figure>
    <div class="explore-result"><h4>这份记录能说明什么？</h4><p>${esc(option.finding)}</p>
    <p><strong>接下来可以做</strong> ${esc(option.next)}</p></div>`;
  }

  function directionsView(route) {
    const list=industryDirections(route.tab);
    if(!list.length)return '';
    return section('这个行业有哪些工作方向',`<div class="explore-grid industry-direction-grid">${list.map(item=>
      card(directionHref(route.tab,item.id,route.q),item.title,item.work,'查看学习路线')).join('')}</div>`,
      '从一项具体分工进入。每个方向都给出基础、深入顺序和一个可以自己完成的小任务。');
  }

  function directionView(direction,route) {
    const sector=sectorById(route.tab);
    const overview=directionHref(route.tab,null,route.q);
    const lesson=skills[direction.skill];
    const concepts=window.DIRECTION_FOUNDATIONS?.[sector.id]?.[direction.id] || [];
    const from=previous(route);
    const fromConcept=from?.kind==='learn' && from.id==='foundations' && from.tab!=='overview';
    return `<article class="explore-page">${modeNav(route)}
      <header class="explore-hero"><p class="eyebrow">${esc(sector.title)} · 工作方向</p>
        <h1>${esc(direction.title)}</h1><p>${esc(direction.work)}</p>
        <div class="explore-hero-actions"><a class="quiet" href="${esc(overview)}">${icon('arrow-left')} 返回「${esc(sector.title)}」</a>
        ${fromConcept?`<a class="quiet" href="${esc(from.hash)}">${icon('arrow-left')} 返回「${esc(title('foundations',from.tab))}」</a>`:''}</div>
      </header>
      <nav class="explore-filter" aria-label="切换本行业的工作方向">${industryDirections(route.tab).map(item=>
        `<a href="${esc(directionHref(route.tab,item.id,route.q))}"${item===direction?' aria-current="page"':''}>${esc(item.title)}</a>`).join('')}</nav>
      ${window.LEARNING?.entry(sector.id,route.hash,direction.id) || ''}
      ${section('学习路线',`<ol class="explore-steps"><li><strong>先补这些基础</strong><p>${esc(direction.basics)}</p>
        ${concepts.length?`<div class="explore-grid">${concepts.map(id=>
          card(follow('foundations',id,route),foundations()[id].title,foundations()[id].lead,'判断与图解')).join('')}</div>`:''}</li>
        <li><strong>接着这样深入</strong><p>${esc(direction.next)}</p></li></ol>`)}
      <section class="explore-block explore-lab"><p class="eyebrow">动手任务</p><h2>做出一个小成果</h2><p>${esc(direction.task)}</p>
        <div class="explore-result"><h3>用这个标准自检</h3><p>${esc(direction.check)}</p></div></section>
      ${section('接着看步骤和例子',`<div class="explore-grid">${card(follow('skills',direction.skill,route),lesson.title,lesson.lead,'通用技能练习')}
        ${card(overview,'回行业路线做案例',industryPath(sector.id)?.lab.title || sector.summary,'行业案例')}</div>`)}</article>`;
  }

  function industryPathView(guide,route) {
    const {scope,flow,levels,lab,source}=guide;
    const selected=lab.options.find(option=>option.id===route.q.get('practice')) || lab.options[0];
    const flowItems=flow.map(([heading,detail],index)=>
      `<li><small>0${index+1}</small><strong>${esc(heading)}</strong><p>${esc(detail)}</p></li>`).join('');
    const levelItems=levels.map(({stage,title,skill,thinking,check})=>`<li><small>${esc(stage)}</small><div>
      <h3>${esc(title)}</h3><dl><dt>练什么</dt><dd>${esc(skill)}</dd><dt>怎样想</dt><dd>${esc(thinking)}</dd>
      <dt>怎么知道学会了</dt><dd>${esc(check)}</dd></dl></div></li>`).join('');
    return section('这个行业主要做什么',`<ol class="explore-process industry-flow">${flowItems}</ol>`,scope)+
      (window.LEARNING?.entry(route.tab,route.hash) || '')+directionsView(route)+
      section('从哪里学起，怎么深入',`<ol class="industry-levels">${levelItems}</ol>`,'按顺序练习。每一步都可以用一个小结果检查自己能不能做到。')+
      `<section class="explore-block explore-lab industry-practice" aria-labelledby="industry-practice-title">
        <p class="eyebrow">动手体验 · 虚构教学案例</p><h2 id="industry-practice-title" tabindex="-1">${esc(lab.title)}</h2>
        <p>${esc(lab.scenario)}</p><p>${esc(lab.prompt)}</p>
        <div class="explore-choices" role="group" aria-label="选择观察方式">${lab.options.map(option=>
          `<button type="button" data-industry-practice="${esc(option.id)}" aria-pressed="${option===selected}">${esc(option.label)}</button>`).join('')}</div>
        <div data-industry-result aria-live="polite" aria-atomic="true">${practiceResult(lab,selected)}</div>
      </section><p class="explore-note industry-reference">学习顺序与练习由本站编写。<a href="${esc(withBack('#study/sources',route.hash))}">查看来源和覆盖</a>${source?` · <a href="${esc(source[1])}" target="_blank" rel="noopener noreferrer">${esc(source[0])} ${icon('external-link')}</a>`:''}</p>`;
  }

  function industryView(sector,route) {
    const guide=industryPath(sector.id);
    const work=section('里面的人在做什么',`<div class="explore-grid">${sector.work.map(task=>
      `<article class="explore-card"><h3>${esc(task.title)}</h3><p>${esc(task.text)}</p></article>`).join('')}</div>`);
    const skillCards=sector.skills.map(id=>card(follow('skills',id,route),skills[id].title,skills[id].lead,'步骤与练习'));
    const thinkingCards=sector.thinking.map(id=>{
      const demo=id==='trace' && sector.demo;
      const href=path('thinking',id)+(demo?'?case='+demo:'');
      return card(withBack(href,route.hash),methods[id].title,methods[id].lead,demo?'本行业情境练习':'思维示例');
    });
    const shared=work+section('可以学哪些技能',`<div class="explore-grid">${skillCards.join('')}</div>`,'从实际工作中挑一个动作，看看怎么做，再试一次。')+
      section('可以怎样思考',`<div class="explore-grid">${thinkingCards.join('')}</div>`,'遇到结果不对、信息不足或做法难以比较时，看看从哪里入手。');
    return (guide?industryPathView(guide,route)+`<details class="explore-answer"><summary>跨行业的通用技能与思维方法</summary>${shared}</details>`:shared)+
      (sector.related.length?section('沿着关联深入',`<div class="explore-grid">${sector.related.map(item=>
        card(withBack(item.href,route.hash),item.title,item.reason)).join('')}</div>`):'');
  }

  function indexFor(mode,route) {
    const items=learningItems(mode);
    return `<section class="explore-block"><div class="explore-grid">${Object.entries(items).map(([id,item])=>
      card(follow(mode,id,route),item.title,item.lead,id==='trace'?'三个行业情境':mode==='skills'?'步骤与小练习':mode==='foundations'?'判断与图解':'思维示例')).join('')}</div></section>`;
  }

  function stepList(steps) {
    return `<ol class="explore-steps">${steps.map(([heading,detail])=>
      `<li><strong>${esc(heading)}</strong><p>${esc(detail)}</p></li>`).join('')}</ol>`;
  }

  const unsureChoice=['我还不确定','从下方图解找出判断需要的条件，再回来试一次。'];

  function foundationFeedback(item,choice) {
    const selected=choice==='unsure'?unsureChoice:/^[01]$/.test(choice || '')?item.choices[Number(choice)]:null;
    return selected?`<div class="explore-result"><h3>看看这个判断依据什么</h3><p>${esc(selected[1])}</p></div>`:'';
  }

  function foundationUses(item,route) {
    const from=previous(route);
    return item.uses.filter(([sectorId])=>!isIndustry(from) || sectorId!==from.tab).map(([sectorId,directionId,reason])=>{
      const direction=industryDirections(sectorId).find(entry=>entry.id===directionId);
      return card(withBack(directionHref(sectorId,directionId),route.hash),direction.title,reason,sectorById(sectorId).title);
    }).join('');
  }

  function foundationView(item,route) {
    const selected=route.q.get('try');
    const options=[...item.choices,unsureChoice];
    return `<section class="explore-block explore-lab foundation-practice" aria-labelledby="foundation-question">
      <p class="eyebrow">先试一个判断 · 虚构情境</p><h2 id="foundation-question">你会怎么判断？</h2><p>${esc(item.scenario)}</p>
      <div class="explore-choices foundation-choices" role="group" aria-label="选择你的判断">${options.map(([label],index)=>{
        const value=index===item.choices.length?'unsure':String(index);
        return `<button type="button" data-foundation-choice="${value}" aria-pressed="${value===selected}">${esc(label)}</button>`;
      }).join('')}</div><div data-foundation-feedback aria-live="polite" aria-atomic="true">${foundationFeedback(item,selected)}</div></section>`+
      section('把判断拆成三步',`<ol class="explore-process industry-flow">${item.steps.map(([label,text],index)=>
        `<li><small>0${index+1}</small><strong>${esc(label)}</strong><p>${esc(text)}</p></li>`).join('')}</ol>`,item.takeaway)+
      section('换个行业看同一个概念',`<div class="explore-grid" data-foundation-uses>${foundationUses(item,route)}</div>`);
  }

  function skillView(item,route) {
    return section('怎样开始练',stepList(item.steps))+
      section('试着做一次',`<p>${esc(item.exercise)}</p>
        <details class="explore-answer"><summary>对照一个做法</summary><p>${esc(item.example)}</p></details>`)+
      section('换一个行业看同一项技能',`<div class="explore-grid explore-related">${item.sectors.map(sectorById).filter(Boolean).map(sector=>
        card(follow('industries',sector.id,route),sector.title,sector.summary,'行业')).join('')}
        ${card(follow('thinking',item.method,route),methods[item.method].title,methods[item.method].lead,'思维')}</div>`);
  }

  function traceLink(route,id,pick) {
    const q=new URLSearchParams({case:id});
    if(Number.isInteger(pick))q.set('pick',String(pick));
    const back=window.JOURNEY.safeBack(route.q.get('back'),'');
    if(back)q.set('back',back);
    return path('thinking','trace')+'?'+q;
  }

  function traceView(route) {
    const requested=route.q.get('case');
    const id=Object.hasOwn(examples,requested)?requested:'logistics';
    const example=examples[id];
    const value=route.q.get('pick');
    const pick=value!==null && /^[0-3]$/.test(value)?Number(value):-1;
    const correct=pick===example.answer;
    const feedback=pick<0?'':`<div class="explore-result" data-state="${correct?'correct':'wrong'}" aria-live="polite">
      <h3>${correct?'你找到了最先需要核对的一步':'再回看这一步之前的记录'}</h3><p>${esc(example.detail)}</p></div>`;
    return `<section class="explore-block explore-lab">
      <nav class="explore-filter" aria-label="切换行业情境">${Object.entries(examples).map(([key,sample])=>
        `<a href="${esc(traceLink(route,key))}"${key===id?' aria-current="true"':''}>${esc(sample.title.split(' · ')[0])}</a>`).join('')}</nav>
      <h2>${esc(example.title)}</h2><p>${esc(example.question)}</p>
      <div class="explore-process"><ol>${example.stages.map(([heading,detail],index)=>
        `<li${pick===index?` data-state="${correct?'correct':'wrong'}"`:''}><small>0${index+1}</small><strong>${esc(heading)}</strong><p>${esc(detail)}</p></li>`).join('')}</ol></div>
      <div class="explore-choices" role="group" aria-label="选择先核对的环节">${example.stages.map(([heading],index)=>
        `<button type="button" data-explore-pick="${index}" aria-pressed="${pick===index}">${esc(heading)}</button>`).join('')}</div>
      ${feedback}<p class="explore-note">三个情境均为教学示例。第一次观察到差异的位置，是继续查证的起点。</p>
    </section>${section('把这条思路放回工作',`<div class="explore-grid explore-related">
      ${card(follow('industries',example.sector,route),title('industries',example.sector),'看看这个行业如何分工，以及还有哪些相关技能。','行业')}
      ${card(follow('skills','map-flow',route),skills['map-flow'].title,skills['map-flow'].lead,'技能')}
    </div>`)}`;
  }

  function methodView(id,route) {
    if(id==='trace')return traceView(route);
    const method=methods[id];
    return section('从一个工作情境开始',`<p>${esc(method.scenario)}</p>${stepList(method.prompts)}
      <details class="explore-answer"><summary>查看参考思路</summary><p>${esc(method.example)}</p></details>`)+
      section('把思路变成能练的动作',`<div class="explore-grid explore-related">${card(follow('skills',method.skill,route),skills[method.skill].title,skills[method.skill].lead,'技能')}</div>`);
  }

  function render(route) {
    const direction=currentDirection(route);
    if(direction)return directionView(direction,route);
    const {id,tab}=route;
    const mode=modes[id];
    const index=tab==='overview';
    const back=window.JOURNEY.safeBack(route.q.get('back'),index?'#home':path(id));
    const from=previous(route);
    const fromWorld=from?.kind==='world' && from.tab==='overview';
    const fromIndustry=isIndustry(from);
    const fromDirection=currentDirection(from);
    const sector=fromIndustry?sectorById(from.tab):null;
    const originQuestion=fromWorld && id==='industries' && !index ? industryData().worldIndustries[from.id]?.find(([key])=>key===tab)?.[1] : '';
    const lead=index?mode.lead:id==='industries'?sectorById(tab).summary:learningItems(id)[tab].lead;
    const guide=id==='industries' && !index?industryPath(tab):null;
    const kicker=index?'见全 · '+mode.name:id==='industries'?(guide?'行业学习路线':'行业概览')+' · '+sectorById(tab).official:mode.title;
    const body=index?(id==='industries'?industryIndex(route):indexFor(id,route)):
      id==='industries'?industryView(sectorById(tab),route):id==='skills'?skillView(skills[tab],route):id==='foundations'?foundationView(foundations()[tab],route):methodView(tab,route);
    const context=id==='foundations'?'':fromDirection && !index && id!=='industries' ?
      section(`放回「${fromDirection.title}」练`,`<p>${esc(fromDirection.task)}</p><p><strong>自检</strong> ${esc(fromDirection.check)}</p>`) :
      sector && !index && id!=='industries' && !(id==='thinking' && tab==='trace' && sector.demo) ?
      section(`放回「${sector.title}」看`, `<ul class="explore-work-context">${sector.work.map(task=>
        `<li><strong>${esc(task.title)}</strong><p>${esc(task.text)}</p></li>`).join('')}</ul>`, '任选一项工作，带着这个情境看下面的方法和例子。') : '';
    const backLabel=back==='#home'?'返回世界全景':fromWorld?`返回「${window.JOURNEY.worldTitle(from.id)}」`:fromIndustry?`返回「${fromDirection?.title || sector.title}」`:'返回刚才的位置';
    return `<article class="explore-page">${modeNav(route)}
      <header class="explore-hero"><p class="eyebrow">${esc(kicker)}</p>
        <h1>${esc(title(id,tab))}</h1><p>${esc(lead)}</p>
        ${originQuestion?`<p class="explore-origin">${esc(originQuestion)}</p>`:''}
        <div class="explore-hero-actions"><a class="quiet" href="${esc(back)}">${icon('arrow-left')} ${esc(backLabel)}</a>
        ${guide?`<button type="button" class="button secondary" data-industry-jump>直接体验 ${icon('arrow-down')}</button>`:''}</div></header>
      ${context}${body}</article>`;
  }

  function searchItems() {
    const item=(mode,id,heading,lead,text='',type='',href=path(mode,id))=>({
      title:heading,description:lead,text,href,tag:modes[mode].name,domain:mode,type
    });
    return [
      ...Object.entries(modes).map(([mode,entry])=>item(mode,'overview',entry.title,entry.lead,entry.name,'探索入口')),
      ...sectors().map(sector=>{
        const guide=industryPath(sector.id);
        const terms=guide?[guide.lab.title,...guide.levels.map(level=>level.title)]:[];
        return item('industries',sector.id,sector.title,sector.summary,
          [sector.official,...sector.work.map(task=>task.title+' '+task.text),...terms].join(' '),guide?'行业学习路线':'行业概览');
      }),
      ...Object.entries(skills).map(([id,skill])=>item('skills',id,skill.title,skill.lead,skill.exercise,'技能练习')),
      ...Object.entries(methods).map(([id,method])=>item('thinking',id,method.title,method.lead,
        id==='trace'?'流程 排查 包裹延误 软件故障 质量问题':method.scenario,'思维方法')),
      ...sectors().flatMap(sector=>industryDirections(sector.id).map(direction=>item('industries',sector.id,direction.title,
        `${sector.title} · ${direction.work}`,[sector.title,direction.work,direction.basics,direction.next,direction.task].join(' '),
        '工作方向',directionHref(sector.id,direction.id)))),
      ...Object.entries(foundations()).map(([id,concept])=>item('foundations',id,concept.title,concept.lead,
        [concept.scenario,concept.takeaway,...concept.steps.flat()].join(' '),'基础概念'))
    ];
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('button[data-foundation-choice]');
    if(!button || button.getAttribute('aria-pressed')==='true')return;
    const route=window.JOURNEY.route(location.hash);
    if(route?.kind!=='learn' || route.id!=='foundations' || route.tab==='overview')return;
    const item=foundations()[route.tab];
    const choice=button.dataset.foundationChoice;
    const panel=button.closest('.foundation-practice');
    panel.querySelectorAll('button[data-foundation-choice]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
    panel.querySelector('[data-foundation-feedback]').innerHTML=foundationFeedback(item,choice);
    route.q.set('try',choice);
    route.hash=path('foundations',route.tab)+'?'+route.q;
    history.replaceState(history.state,'',route.hash);
    document.querySelector('[data-foundation-uses]').innerHTML=foundationUses(item,route);
  });

  document.addEventListener('click',event=>{
    if(event.target.closest('button[data-industry-jump]')) {
      document.getElementById('industry-practice-title')?.focus();
      return;
    }
    const button=event.target.closest('button[data-industry-practice]');
    if(!button)return;
    const route=window.JOURNEY.route(location.hash);
    if(route?.kind!=='learn' || route.id!=='industries')return;
    const lab=industryPath(route.tab)?.lab;
    const option=lab?.options.find(item=>item.id===button.dataset.industryPractice);
    if(!option || button.getAttribute('aria-pressed')==='true')return;
    const panel=button.closest('.industry-practice');
    panel.querySelectorAll('button[data-industry-practice]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    panel.querySelector('[data-industry-result]').innerHTML=practiceResult(lab,option);
    route.q.set('practice',option.id);
    history.replaceState(history.state,'',path('industries',route.tab)+'?'+route.q);
    document.querySelectorAll('.industry-direction-grid a').forEach(link=>{
      const target=window.JOURNEY.route(link.getAttribute('href'));
      link.href=directionHref(route.tab,target.q.get('direction'),route.q);
    });
  });

  document.addEventListener('click',event=>{
    const button=event.target.closest('button[data-explore-pick]');
    if(!button)return;
    const route=window.JOURNEY.route(location.hash);
    if(route?.kind!=='learn' || route.id!=='thinking' || route.tab!=='trace')return;
    const pick=Number(button.dataset.explorePick);
    if(!Number.isInteger(pick) || pick<0 || pick>3)return;
    const requested=route.q.get('case');
    const id=Object.hasOwn(examples,requested)?requested:'logistics';
    const hash=traceLink(route,id,pick);
    history.replaceState(null,'',hash);
    window.JOURNEY.render(window.JOURNEY.route(hash));
    document.querySelector(`button[data-explore-pick="${pick}"]`)?.focus({preventScroll:true});
  });

  window.EXPLORE = {home,has,render,title,rail,searchItems,trail,worldIndustryCount,worldIndustryView};
})();
