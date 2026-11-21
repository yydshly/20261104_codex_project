/* Editorial content registry shared by the atlas, reading pages and local search. */
(() => {
  'use strict';
  const base = window.JOURNEY_DATA;
  const ai = window.AI_ATLAS_DATA;
  const domains = {
    computing: window.JOURNEY_COMPUTING.domain,
    ai: {
      id: 'ai', title: '人工智能', icon: 'cpu',
      lead: '让机器完成识别、预测、生成与规划，并进入真实的工作与生活。',
      ...base.aiContext,
      guide: {kicker:'从一个熟悉的现象开始', title:'AI 助手怎样找到回答所需的资料？', text:'先看一次回答的材料从哪里来，再理解它为什么可能出错。', article:'retrieval', button:'先看：答案从哪里来', image:'retrieval-overview', alt:'问题、资料检索、模型和回答之间的连接', steps:[{title:'问题'},{title:'检索'},{title:'模型'},{title:'回答'}]},
      highlights:['ai-context','ai-generation','ai-agent'],
      connections:[
        {href:'#domain/information',title:'信息组织',reason:'模型需要的资料，怎样被描述、找到和核对？'},
        {href:'#domain/computing',title:'软件与计算',reason:'一次模型调用，怎样变成能执行任务的软件系统？'},
        {href:'#domain/education',title:'教育与传播',reason:'答案容易获得之后，人怎样形成自己的理解？'}
      ]
    },
    information: {
      ...base.domains.information, icon:'layers',
      guide:{kicker:'从一个熟悉的例子开始',title:'找一本书，也是在组织信息。',text:'图书馆找书与 AI 找资料，都需要让信息可被描述、定位和辨别。',article:'info-finding',button:'从找一本书开始',image:'library-overview',alt:'书的描述进入目录，读者查目录定位到书架上的书',steps:[{title:'描述一本书'},{title:'查目录'},{title:'找到它'}]},
      connections:[
        {href:'#map/rag?node=ingestion&depth=intro',title:'走向 RAG：材料怎样成为回答依据？',reason:'沿资料准备、检索、上下文与核验，理解信息组织在生成式问答中的作用。'},
        {href:'#map/agent?node=knowledge&depth=intro',title:'走向 Agent：资料怎样支持行动？',reason:'从可检索的资料进入行动循环，理解来源、版本和反馈怎样约束下一步。'},
        {href:'#article/retrieval',title:'回到 AI：资料怎样进入回答？',reason:'把描述、索引和检索放回知识助手，区分材料与模型的作用。'},
        {href:'#article/comp-data',title:'软件怎样表示信息？',reason:'目录中的作者、书名和版本，也需要约定数据的表示方式。'},
        {href:'#article/education-evidence',title:'拿到信息之后，怎样判断？',reason:'找到一个来源只是开始，还要区分观察、解释与判断。'}
      ]
    },
    education: window.JOURNEY_EDUCATION.domain
  };
  const articles = {
    ...Object.fromEntries(Object.entries(base.articles).map(([id,a])=>[id,{...a,domain:'information'}])),
    ...window.JOURNEY_AI_EXPANSION.articles,
    ...window.LLM_ARTICLES,
    ...window.LLM_FOUNDATIONS,
    ...window.AGENT_ARTICLES,
    ...window.AGENT_FOUNDATIONS,
    ...window.RAG_ARTICLES,
    ...window.RAG_FOUNDATIONS,
    ...window.CONTEXT_ARTICLES,
    ...window.CONTEXT_FOUNDATIONS,
    ...window.JOURNEY_COMPUTING.articles,
    ...window.JOURNEY_EDUCATION.articles
  };
  articles['ai-agent'].crossLinks.unshift({href:'#map/agent?node=goals&depth=intro',title:'展开 Agent 的完整认知地图',reason:'把一次工具行动放回目标、循环、状态、资料与控制之间，继续选择深入路径。'});
  for(const id of ['info-retrieval','agent-knowledge','llm-posttraining'])articles[id].crossLinks=[...(articles[id].crossLinks || domains[articles[id].domain].connections).filter(x=>!x.href.startsWith('#map/rag'))];
  for(const id of ['info-retrieval','agent-knowledge','llm-posttraining'])articles[id].crossLinks.unshift({href:'#map/rag',title:'展开 RAG：检索怎样增强生成？',reason:'把资料准备、寻找候选、筛选、上下文、生成与核验放回同一张认知地图。'});
  for(const id of ['rag-context','agent-state','llm-attention','ai-context']){const article=articles[id];article.crossLinks=[{href:'#map/context',title:'展开提示词与上下文工程',reason:'继续看目标、指令、示例、资料与状态怎样成为本次输入，以及怎样验证它们的作用。'},...(article.crossLinks || domains[article.domain].connections)];}
  const aliases = {
    'ai-context':'AI 会记住我吗 聊天记忆 上下文 记忆 训练 窗口',
    'ai-generation':'AI 为什么答错 幻觉 胡编 编造 事实 流畅 可靠性',
    'ai-agent':'智能体 agent 工具 自动执行 行动 助手 权限',
    'comp-data':'二进制 数据 编码 表示 文本 图片',
    'comp-algorithms':'算法 步骤 排序 搜索 计算',
    'comp-systems':'网页 请求 网络 浏览器 HTTP 软件 系统 接口',
    'comp-testing':'测试 软件 验证 可靠性 边界 bug',
    'education-learning':'学习 看懂 理解 会用 知识 迁移',
    'education-feedback':'反馈 纠正 学习 练习',
    'education-media':'传播 媒介 信息 媒体 注意力',
    'education-evidence':'证据 判断 观察 解释 信息 可信'
  };
  function searchItems() {
    return [
      ...(window.EXPLORE?.searchItems() || []),
      {title:'研究与共识 · 见全的产品目标与研究汇总',description:'产品理解、三种认知状态、两种入口、已有内容、资料来源、多模型互补与下一步。',text:'研究 共识 项目总结 信息汇总 产品目标 认知启蒙 全面 准确 来源 多模型审核 检查 互补 演变 书籍 历史 后续',href:'#research',tag:'见全',domain:'research',type:'研究汇总'},
      ...(window.LEARNING?.searchItems() || []),
      {title:'公司知识库助手 · 项目路线',text:'公司知识库助手 查询公司现行规定 访客预约 任务 资料版本 RAG 上下文 回答核验 旧规定',description:'用一次查询现行规定的案例，追踪任务、资料版本、检索、上下文和回答核验。',href:'#project/knowledge-assistant',tag:'人工智能 / 实际任务',domain:'ai',type:'项目路线'},
      {title:'评估与可靠性 · 公司知识库助手',text:'评估与可靠性 评估可信 测试用例 错误定位 修改前后 回归测试 人工复核 公司知识库助手 访客预约',description:'用访客预约案例设计测试，定位错误，对照修改前后的回答，再判断何时需要人工复核。',href:'#project/knowledge-assistant/evaluation',tag:'人工智能 / 评估可信',domain:'ai',type:'项目练习'},
      {title:'上线运行与监控 · 公司知识库助手',text:'上线运行与监控 延迟 成本 尾延迟 p50 p95 资料更新 旧答案 索引 缓存 追踪 告警 排查 公司知识库助手 访客预约',description:'用访客预约案例比较运行配置。模拟规则更新，沿资料、索引、缓存、上下文和回答排查旧答案。',href:'#project/knowledge-assistant/operations',tag:'人工智能 / 系统产品',domain:'ai',type:'项目练习'},
      {title:'提示词与上下文工程 · 认知地图',text:'提示词 提示工程 上下文工程 prompt context engineering 任务 指令 示例 few-shot 材料 组装 记忆 状态 验证',description:'六个知识部分、三层深入路径，连接任务表达、输入组织和跨轮更新。',href:'#map/context',tag:'人工智能 / 提示词与上下文',domain:'ai',type:'知识子图'},
      ...(window.CONTEXT_DATA?.nodes || []).map(n=>({title:n.title+' · 提示词与上下文工程',text:[n.question,...n.contains,'prompt context engineering'].join(' '),description:n.intro.text,href:'#map/context?node='+n.id,tag:'人工智能 / 提示词与上下文',domain:'ai',type:'子方向'})),
      {title:'RAG 检索增强生成 · 认知地图',text:'RAG 检索增强生成 资料准备 切分 索引 关键词 向量 混合检索 重排 上下文 引用 核验 大语言模型 Agent 信息组织',description:'六个知识部分、三层深入路径，连接资料、检索与依据生成。',href:'#map/rag',tag:'人工智能 / RAG',domain:'ai',type:'知识子图'},
      ...(window.RAG_DATA?.nodes || []).map(n=>({title:n.title+' · RAG 检索增强生成',text:[n.question,...n.contains].join(' '),description:n.intro.text,href:'#map/rag?node='+n.id,tag:'人工智能 / RAG',domain:'ai',type:'子方向'})),
      {title:'AI 智能体 Agent · 认知地图',text:'智能体 Agent 目标 任务 行动循环 工具 状态 记忆 权限 信息组织 大语言模型',description:'六个知识部分、三层深入路径，连接模型能力、信息组织与工具执行。',href:'#map/agent',tag:'人工智能 / Agent',domain:'ai',type:'知识子图'},
      ...(window.AGENT_DATA?.nodes || []).map(n=>({title:n.title+' · Agent 智能体',text:[n.question,...n.contains].join(' '),description:n.intro.text,href:'#map/agent?node='+n.id,tag:'人工智能 / Agent',domain:'ai',type:'子方向'})),
      {title:'大语言模型 LLM · 认知地图',text:'大模型 语言模型 token 向量 注意力 Transformer 训练 概率 生成 微调 认知地图',description:'六个部分、三层深入方式与三项基础，理解知识之间怎样相连。',href:'#map/llm',tag:'人工智能 / 大语言模型',domain:'ai',type:'知识子图'},
      ...(window.LLM_DATA?.nodes || []).map(n=>({title:n.title+' · 大语言模型',text:[n.question,...n.contains].join(' '),description:n.intro.text,href:'#map/llm?node='+n.id,tag:'人工智能 / 大语言模型',domain:'ai',type:'子方向'})),
      {title:'AI 为什么会答错？ · 跨域漫游',text:'AI 为什么答错 幻觉 生成机制 信息来源 证据判断 跨领域 路线',description:'围绕同一个案例，走过生成、资料与判断，再回到最初的问题。',href:'#roam/ai-errors',tag:'人工智能 → 信息组织 → 教育与传播',domain:'ai',type:'四站漫游'},
      ...Object.values(domains).map(d=>({title:d.title+' · 领域全景',text:[d.lead,...(d.nodes || []).map(n=>n.title)].join(' '),href:'#domain/'+d.id,tag:d.title,domain:d.id,type:'领域全景'})),
      ...Object.values(domains).flatMap(d=>(window.COGNITION?.branches(d.id) || []).map(b=>({title:b.title+' · 方向与路径',text:[b.question,b.outcome,...b.contains].join(' '),description:b.outcome,href:window.COGNITION.directionHref(d.id,b.id),tag:d.title,domain:d.id,type:'认知方向'}))),
      {title:'AI 答错，有时是资料没找对',text:'AI 知识助手 检索 材料 文档 版本 RAG',description:'看看资料怎样进入回答，以及材料过期或不相关时会发生什么。',href:'#article/retrieval',tag:'人工智能',domain:'ai',type:'交互图解'},
      ...Object.values(articles).map(a=>({title:a.title,text:[a.contextNode?'提示词 提示工程 上下文工程 prompt context engineering':a.ragNode?'RAG 检索增强生成':a.agentNode?'Agent 智能体':a.llmNode?'LLM 大语言模型':'',a.eyebrow,a.lead,a.takeaway,aliases[a.id],...a.sections.map(s=>s.title+' '+s.text)].join(' '),description:a.takeaway,href:'#article/'+a.id,tag:domains[a.domain].title,domain:a.domain,type:'图文讲解'})),
      ...ai.topics.map(t=>({title:t.title,text:[t.lead,t.concept,...(t.tags || []),window.AI_READING?.[t.id]?.lead].join(' '),description:window.AI_READING?.[t.id]?.takeaway || t.lead,href:'#topic/'+t.id,tag:'人工智能',domain:'ai',type:'科普专题'})),
      ...window.ATLAS_DATA.systems.flatMap(s=>s.topics.map(t=>({title:t.title,text:s.title+' '+t.summary+' '+t.why,href:'#world/'+s.id+'/'+t.id,tag:s.title,domain:'world',type:'社会专题'})))
    ];
  }
  const normalize = value => String(value || '').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
  const synonyms = value => value.replace(/人工智能/gi,'ai').replace(/记住/g,'记忆').replace(/大语言模型|大模型/g,'模型').replace(/怎么回事|为什么|如何|怎样|怎么|是什么|到底|能不能|是否|我想了解|我想知道|的|了|吗|呢|会|我/g,' ');
  function find(query='',domain='') {
    const raw=normalize(query), simple=synonyms(String(query).toLowerCase());
    const terms=simple.split(/[^a-z0-9\u3400-\u9fff]+/).filter(Boolean);
    const all=searchItems().filter(x=>!domain || x.domain===domain);
    if(!raw)return all;
    return all.map((x,index)=>{
      const title=normalize(x.title),body=normalize(x.text),bag=normalize(synonyms(x.title+' '+x.text+' '+x.tag));
      const exact=title.includes(raw)?100:body.includes(raw)?60:0;
      const matches=terms.filter(t=>bag.includes(t));
      const matched=terms.length>0 && matches.length===terms.length;
      return {item:x,index,score:exact || (matched ? 20+matches.reduce((n,t)=>n+(normalize(synonyms(x.title)).includes(t)?t.length*2:1),0):0)};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score || a.index-b.index).map(x=>x.item);
  }
  window.JOURNEY_CATALOG={domains,articles,find,searchItems};
})();
