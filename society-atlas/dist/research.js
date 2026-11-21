/* A record of the product decisions, material already studied and open work. */
(() => {
  'use strict';

  const sections = [
    ['purpose','我们要解决什么'],
    ['journey','从哪里进入，怎样理解'],
    ['decisions','讨论怎样演变'],
    ['coverage','目前积累了什么'],
    ['ai','AI 与跨领域研究'],
    ['evidence','资料与可信程度'],
    ['review','多模型检查与互补'],
    ['next','还差什么，怎样继续']
  ];

  const evidence = [
    {title:'国家统计局 · 国民经济行业分类（GB/T 4754—2017）',url:'https://www.stats.gov.cn/xxgk/tjbz/gjtjbz/201710/t20171017_1758922.html',use:'用于核对 A–T 行业门类的名称和范围。七个社会板块与每个行业的三个学习方向属于本站编排。'},
    {title:'RFC 9110 · HTTP Semantics',url:'https://www.rfc-editor.org/rfc/rfc9110.html#section-15',use:'用于核对 200、401 等响应状态的含义。页面故障、账号和接口返回是虚构练习条件。'},
    {title:'NIST 工程统计手册 · Proportions Control Charts',url:'https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc332.htm',use:'用于样本不合格比例的定义。站内抽检数字和优先复查任务用于教学。'},
    {title:'IES / WWC · Organizing Instruction and Study to Improve Student Learning',url:'https://ies.ed.gov/ncee/wwc/PracticeGuide/1',use:'讨论图文结合、练习、解释性问题和检查学习情况。分数题和自检规则由本站设计。'},
    {title:'Google · 机器学习速成课',url:'https://developers.google.com/machine-learning/crash-course/llm',use:'AI、模型、训练与推理等基础的参考。站内学习地图是对内容关系的组织。'},
    {title:'Vaswani 等 · Attention Is All You Need',url:'https://arxiv.org/abs/1706.03762',use:'Transformer 与注意力机制的原始论文。入门图解做了简化，学习时要结合正文范围。'},
    {title:'Lewis 等 · Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',url:'https://arxiv.org/abs/2005.11401',use:'RAG 机制的原始论文之一。公司知识库助手的资料、规定与输出属于构造案例。'},
    {title:'Anthropic · Building effective agents',url:'https://www.anthropic.com/research/building-effective-agents',use:'讨论工作流、Agent 和系统组织方式。作为 Agent 章节参考，具体产品实现仍需分别验证。'},
    {title:'Stanford · Introduction to Information Retrieval',url:'https://nlp.stanford.edu/IR-book/',use:'检索、索引和检索评估的系统参考。连接图书馆找书与 AI 找资料的讲解。'},
    {title:'W3C · SKOS Primer / PROV Primer',url:'https://www.w3.org/TR/skos-primer/',use:'知识概念的组织关系可参考 SKOS，资料形成过程与来源可参考文章中另列的 PROV 文档。'},
    {title:'Zheng 等 · Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena',url:'https://arxiv.org/abs/2306.05685',use:'讨论模型评审中的顺序、冗长等偏差，为审核试点提供问题清单。'},
    {title:'Panickssery 等 · LLM Evaluators Recognize and Favor Their Own Generations',url:'https://arxiv.org/abs/2404.13076',use:'在所研究的摘要评估任务中观察模型自我偏好。本站多模型审核的互补效果仍待实测。'}
  ];

  const aiTopics = [
    {title:'大语言模型',href:'#map/llm',question:'文本怎样变成下一步生成？',text:'分词、向量、上下文关联、训练与推理、概率生成、能力边界和所需基础。'},
    {title:'AI 智能体 Agent',href:'#map/agent',question:'模型怎样进入行动循环？',text:'目标、工具、状态、资料、停止条件与结果确认，连接模型和信息组织。'},
    {title:'RAG 检索增强生成',href:'#map/rag',question:'资料怎样成为本次回答的依据？',text:'资料准备、分块、索引、检索与筛选、上下文组装、引用与核验。'},
    {title:'提示词与上下文工程',href:'#map/context',question:'一次任务需要哪些输入？',text:'任务说明、示例、材料、输入预算、记忆和跨轮状态，以及怎样检查效果。'}
  ];

  const milestones = [
    ['从个人困惑提出问题','以程序员持续学习 AI 的经历为起点，希望看见一个方向的结构和自己没接触过的部分。'],
    ['用科普形式组织理解','建立统一首页、领域总览、知识讲解三类页面。图解、例子和跨领域连接成为正文的一部分。'],
    ['把 AI 放回更大的社会','明确面向大众、跨行业的技能与思维普及。全景图进入社会板块，再向行业和工作方向展开。'],
    ['把“知道名字”推进到“知道怎么深入”','每个方向说明负责什么、需要哪些基础、怎样逐层深入，配任务和自检标准。'],
    ['把理解放进新情境检验','选软件、制造、教育三条路线，串起初次判断、补基础、换例与解释记录。'],
    ['把来源和审核纳入产品','区分原始资料、教学归纳和虚构练习，提出不同模型独立审核事实与覆盖的试点。']
  ];

  const openWork = [
    ['方向知识地图','先给软件测试、制造质检、教育反馈建立可点击节点。标出已有讲解、可练习内容、先备知识和待核出处。','三个方向能够定位当前练习，并指出下一步要补的节点。'],
    ['多模型审核试点','在三条路线的测试副本中放入已知事实错误、引用错位和内容缺口，独立审稿后与参考问题清单对照。','能记录命中、共同遗漏、误报和修订后是否仍有问题。'],
    ['按缺口补资料与场景','沿明确的方向补子行业、岗位差异、例外和出处，把只有学习建议的节点展开为讲解与练习。','关键说法有对应原文和适用范围，案例能解释这个节点。'],
    ['小范围使用反馈','观察初次使用者是否能找到感兴趣方向，完成一次换例判断，再在之后回看自己的依据。','记录卡住的位置、仍存在的误解和下一次练习需要的支持。']
  ];

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);

  function link(href, text, className='') {
    return `<a class="${className}" href="${esc(window.JOURNEY.withBack(href,'#research'))}">${esc(text)}</a>`;
  }

  function section(id, content) {
    const index=sections.findIndex(([key])=>key===id);
    return `<section class="research-section" aria-labelledby="research-${id}"><header>
      <span class="research-number">${String(index+1).padStart(2,'0')}</span><h2 id="research-${id}" tabindex="-1">${sections[index][1]}</h2>
      </header>${content}</section>`;
  }

  function stats() {
    return {
      industries:window.INDUSTRY_DATA.sectors.length,
      directions:Object.values(window.INDUSTRY_DIRECTIONS).flat().length,
      concepts:Object.keys(window.INDUSTRY_FOUNDATIONS).length,
      routes:Object.keys(window.LEARNING_PATHS).length
    };
  }

  function coverage() {
    const count=stats();
    return `<div class="research-table-wrap"><table class="research-table"><thead><tr>
      <th scope="col">层级</th><th scope="col">现有内容</th><th scope="col">覆盖到哪里</th></tr></thead><tbody>
      <tr><th scope="row">社会与行业</th><td>${count.industries} 个行业门类及代表案例</td><td>从宏观找到行业入口，查看典型工作与深入建议。</td></tr>
      <tr><th scope="row">工作方向</th><td>${count.directions} 个代表性工作方向</td><td>每个方向有基础提示、深入建议、小任务和自检。</td></tr>
      <tr><th scope="row">通用概念</th><td>${count.concepts} 个跨行业概念</td><td>先判断、看反馈、读三步图解，再换行业理解。</td></tr>
      <tr><th scope="row">学习路线</th><td>${count.routes} 条完整样板</td><td>初次判断、参考成果、换例练习与当前浏览器的解释记录。</td></tr>
      <tr><th scope="row">AI 与相邻领域</th><td>AI、信息组织、软件与计算、教育与传播</td><td>可阅读机制与历史，沿方向、基础和关联继续走。</td></tr>
      <tr><th scope="row">项目路线</th><td>公司知识库助手</td><td>任务、版本、RAG、上下文、核验、评估与运行监控。</td></tr>
      </tbody></table></div>
      <details class="research-details"><summary>查看全部行业及代表性工作方向</summary><div class="research-industry-list">${window.INDUSTRY_DATA.sectors.map(sector=>{
        const directions=window.INDUSTRY_DIRECTIONS[sector.id];
        return `<div><h3>${link('#learn/industries/'+sector.id,sector.title)}</h3><p>${esc(sector.summary)}</p><nav aria-label="${esc(sector.title)}的工作方向">${directions.map(direction=>
          link('#learn/industries/'+sector.id+'?direction='+direction.id,direction.title)).join('')}</nav></div>`;
      }).join('')}</div></details>
      <details class="research-details"><summary>查看全部通用基础概念</summary><div class="research-concept-links">${Object.entries(window.INDUSTRY_FOUNDATIONS).map(([id,item])=>
        link('#learn/foundations/'+id,item.title)).join('')}</div></details>
      <div class="research-grid">${Object.entries(window.LEARNING_PATHS).map(([id,path])=>
        `<article class="research-card"><span class="research-status">可体验</span><h3>${link('#study/'+id,path.title)}</h3>
        <p>${esc(path.lead)}</p><p class="research-note">${esc(path.scope)}</p></article>`).join('')}</div>`;
  }

  function sourceIndex() {
    const groups=[
      ['AI 与模型基础',window.AI_ATLAS_DATA.sources],
      ['领域与机制讲解',Object.values(window.JOURNEY_CATALOG.articles).flatMap(article=>article.sources || [])],
      ['社会科普',window.ATLAS_DATA.sources],
      ['行业案例',Object.values(window.INDUSTRY_PATHS).filter(path=>path.source).map(path=>({title:path.source[0],url:path.source[1]}))],
      ['三条样板路线',Object.values(window.LEARNING_PATHS).flatMap(path=>path.sources)]
    ];
    const seen=new Set();
    return groups.map(([name,refs])=>{
      const unique=refs.filter(ref=>ref?.url && !seen.has(ref.url) && seen.add(ref.url));
      if(!unique.length)return '';
      return `<details class="research-details"><summary>${name} · ${unique.length} 条站内引用</summary><ul class="research-source-index">${unique.map(ref=>
        `<li><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.title)}</a>${ref.checked?`<span> 原记录核对日期 ${esc(ref.checked)}</span>`:''}</li>`).join('')}</ul></details>`;
    }).join('');
  }

  function render() {
    return `<article class="research-page">
      <header class="research-hero"><p class="eyebrow">见全 · 研究与共识</p><h1>见全的产品共识与研究积累</h1>
        <p>研究如何帮助大众从社会全景认识陌生行业，发现认知盲区，找到所需基础与深入方向。这里汇总产品目标、设计思考、已有内容、资料依据和待验证方案。</p><p class="research-note">整理于 2026 年 11 月 21 日，覆盖本次讨论与当前公开试用版本。</p>
        <div class="research-actions">${link('#project-overview','查看项目总览图','button secondary')}${link('#home','回世界全景','button secondary')}${link('#study/sources','查看来源与覆盖','button secondary')}</div>
      </header>
      <nav class="research-jumps" aria-label="研究与共识目录">${sections.map(([id,title])=>
        `<button type="button" data-research-jump="${id}">${title}</button>`).join('')}</nav>
      ${section('purpose',`<div class="research-highlight"><h3>让人知道一个方向包含什么，自己缺哪一块，接下来往哪走</h3>
        <p>起点是个人面对 AI 和陌生行业时的困惑。产品面向大众，用科普解释、图解和可探索的知识关系帮助人拓展认知，并逐步形成能使用的方法。</p></div>
        <div class="research-grid"><article class="research-card"><h3>覆盖范围</h3><p>目标跨行业，连接技能与思维方式。从社会整体向具体工作与知识点逐层展开。</p></article>
        <article class="research-card"><h3>学习结果</h3><p>从发现陌生概念，走到能提出问题，再到在给定条件下使用证据说明判断。</p></article>
        <article class="research-card"><h3>内容形式</h3><p>用全景图说明位置，用过程图说明机制，用案例说明条件，用换例检验理解。</p></article></div>
        <p class="research-note">“AI 让知识和技能失效”是提出问题时的担心。具体技能怎样变化，需要按任务、行业和时间核对。</p>`)}
      ${section('journey',`<ol class="research-chain"><li><h3>不知道自己不知道</h3><p>先看到陌生分支，或在一个直觉判断里发现遗漏的条件。</p></li>
        <li><h3>知道自己不知道</h3><p>能说出缺的是概念、先备知识、信息来源还是判断证据。</p></li>
        <li><h3>知道自己知道</h3><p>换个例子仍能解释理由，并说清在哪些条件下需要重新检查。</p></li></ol>
        <div class="research-grid research-two"><article class="research-card"><h3>有想法时</h3><p>描述一个问题 → 搜索现象或概念 → 找到领域与工作方向 → 补基础 → 做案例 → 回答最初的问题。</p>
        <p>${link('#search','搜索感兴趣的问题')}</p></article><article class="research-card"><h3>没有想法时</h3><p>世界全景 → 社会板块 → 行业 → 工作方向 → 知识与技能。也可以先试身边问题，再沿反馈发现需要补的概念。</p>
        <p>${link('#home','从全景进入')} · ${link('#study','从一个问题进入')}</p></article></div>
        <p class="research-flow">先判断 → 对照证据 → 看图解与参考成果 → 换场景再试 → 留下自己的解释 → 以后再复查</p>
        <p>同一领域提供“方向与路径”“怎样运作”“怎样形成”三个观察角度。讨论中也提出参考科普书与历史来帮助组织内容，具体书目与逐章对照尚待整理。</p>
        <p class="research-note">目前记录的是具体题目的选择和自己的解释。理解能否保持、能否迁移到真实工作，还需要后续任务和使用反馈。</p>`)}
      ${section('decisions',`<ol class="research-history">${milestones.map(([title,text])=>`<li><h3>${title}</h3><p>${text}</p></li>`).join('')}</ol>
        <p class="research-note">这是按讨论内容整理的演变顺序。条目记录产品判断，其中的效果需要通过实际使用检验。</p>`)}
      ${section('coverage',coverage())}
      ${section('ai',`<p>我们用“程序员 → AI → 信息组织”检验入口和跨领域引导，又用“AI 为什么会答错”串起生成机制、信息来源和证据判断。</p>
        <div class="research-grid research-two">${aiTopics.map(topic=>`<article class="research-card"><span class="research-status">已有地图与讲解</span>
          <h3>${link(topic.href,topic.title)}</h3><p><strong>${topic.question}</strong></p><p>${topic.text}</p></article>`).join('')}</div>
        <div class="research-highlight"><h3>这些部分怎样配合</h3><p>任务与上下文明确本轮要做什么、能使用什么。RAG 帮助找入材料，大语言模型利用本轮输入生成内容。Agent 可以把模型、工具、状态与反馈组织成反复行动的流程。</p>
          <p>信息组织连接描述、分类、关联、索引、检索、来源和版本。它既出现在图书馆找书，也出现在 AI 准备资料的过程中。</p></div>
        <div class="research-actions">${link('#roam/ai-errors','体验 AI 答错的跨域漫游','button secondary')}${link('#domain/information','展开信息组织','button secondary')}</div>
        <h3>公司知识库助手如何作为项目补充</h3><p>用查询现行规定的构造案例，把任务、资料版本、检索、上下文和回答核验串在一起。评估再检查测试用例、错误定位、修改前后结果与人工复核。运行练习接着比较延迟和成本，排查资料更新后的旧答案。</p>
        <div class="research-actions">${link('#project/knowledge-assistant','进入项目路线','button secondary')}${link('#project/knowledge-assistant/evaluation','评估与可靠性','button secondary')}${link('#project/knowledge-assistant/operations','运行与监控','button secondary')}</div>
        <p class="research-note">项目路线与知识地图相互跳转。案例中的规定、数据和回答为讲解编写，模型效果需要在实际任务中验证。</p>`)}
      ${section('evidence',`<div class="research-grid"><article class="research-card"><h3>原始资料</h3><p>分类标准、论文、专业教材和官方文档。核对它具体支持哪句话，以及版本和适用范围。</p></article>
        <article class="research-card"><h3>教学归纳</h3><p>板块划分、代表性工作方向、深入顺序和跨域关系由本站组织。需要和领域材料、实践反馈持续对照。</p></article>
        <article class="research-card"><h3>构造示例</h3><p>为解释过程设计的题目、数据与参考成果。用明确条件检验判断，保留结论边界。</p></article></div>
        <h3>讨论中重点参考的资料</h3><ul class="research-reading">${evidence.map(item=>`<li><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.title)}</a><p>${esc(item.use)}</p></li>`).join('')}</ul>
        <h3>怎样检查准确与全面</h3><ol class="research-checklist"><li>逐条写明关键说法、原文位置、版本和适用条件。引用数量之外，还要查证据是否真正对应。</li>
        <li>先确定覆盖层级。行业门类、子行业、岗位、任务、概念和练习分别建立清单，记录哪些只有入口、哪些已经能讲能练。</li>
        <li>为每条路线准备反例与换例，查遗漏条件和失效情况，再收集初次使用者的理解与卡点。</li>
        <li>修订后回查关键说法与练习答案，把分歧和待补证据留在清单里。</li></ol>
        <p class="research-note">以下索引汇总当前内容文件里的引用，按网址去重。引用登记与逐条审核是不同阶段，未逐项给出核验日期的记录仍需回查原文。</p>${sourceIndex()}`)}
      ${section('review',`<span class="research-status research-pending">已讨论方案 · 待试点</span><p>不同模型分别检查事实和覆盖，在同一份草稿上独立给出问题。复核时用原文和事先确定的学习目标判断。</p>
        <div class="research-grid research-two"><article class="research-card"><h3>事实审稿模型</h3><p>关键说法有无出处，原文支持到哪一步，是否跳过条件，引用与章节是否对应。</p></article>
        <article class="research-card"><h3>覆盖审稿模型</h3><p>需要哪些前置知识，学习链路缺哪一步，有哪些常见例外，读者能否在新场景使用。</p></article></div>
        <p class="research-flow">固定草稿与目标 → 独立审稿 → 记录问题与依据 → 对照原文和覆盖清单 → 修订 → 再检查</p>
        <p>每条意见保留内容位置、问题类型、原文依据和建议改法。一致意见也要回查证据，冲突意见标为待复核，并让领域人员参与抽查。</p>
        <h3>第一轮怎样验证互补</h3><p>选软件、制造、教育三条样板的测试副本，加入已知事实错误、引用错位和内容缺口。对照参考问题清单，记录每个模型的命中、误报和共同遗漏。根据实际结果调整模型分工。</p>
        <p class="research-note">已有研究提示模型评审存在顺序、冗长和自我偏好等问题。模型和提示词在本站内容上的表现仍待测试，相关论文列在上方资料中。</p>`)}
      ${section('next',`<p>当前可用于个人探索和小范围体验。下一步围绕三条样板，把已做内容的定位、证据与覆盖补得更清楚。</p>
        <ol class="research-history">${openWork.map(([title,work,check])=>`<li><h3>${title}</h3><p>${work}</p><p class="research-note">完成时检查 · ${check}</p></li>`).join('')}</ol>
        <p>使用反馈与审核结果确认后，再按相同标准扩到其他工作方向。原始资料、教学编排、练习和审核记录随节点一起维护。</p>
        <div class="research-actions">${link('#study','体验三条样板','button primary')}${link('#learn/industries','继续探索行业','button secondary')}${link('#project-overview','回看总览图','button secondary')}</div>`)}
    </article>`;
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('button[data-research-jump]');
    if(!button)return;
    document.getElementById('research-'+button.dataset.researchJump)?.focus();
  });

  window.RESEARCH={render};
})();
