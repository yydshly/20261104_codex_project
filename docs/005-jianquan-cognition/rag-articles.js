/* Original public-science explanations of document retrieval-augmented generation.
 * The library, documents, rankings and answers in examples are teaching constructs.
 */
(() => {
  'use strict';
  const section=(title,text)=>({title,text});
  const step=(title,text)=>({title,text});
  const link=(href,title,reason)=>({href,title,reason});
  const refs={
    paper:{title:'Lewis 等 · Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks（原始论文）',url:'https://arxiv.org/abs/2005.11401'},
    overview:{title:'Microsoft Learn · RAG：外部检索与语言模型的组合',url:'https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview'},
    retrieval:{title:'LangChain 官方文档 · 检索、两步 RAG 与 Agentic RAG',url:'https://docs.langchain.com/oss/javascript/deepagents/retrieval'},
    chunks:{title:'Microsoft Learn · 文档分块：长度、结构与上下文',url:'https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-chunk-documents'},
    hybrid:{title:'Microsoft Learn · 关键词与向量的混合检索',url:'https://learn.microsoft.com/en-us/azure/search/hybrid-search-overview'},
    ranking:{title:'Microsoft Learn · 语义重排：对初步结果再次排序',url:'https://learn.microsoft.com/en-us/azure/search/semantic-search-overview'},
    context:{title:'Anthropic · Effective context engineering：选择本次输入的信息',url:'https://www.anthropic.com/research/effective-context-engineering-for-ai-agents'},
    middle:{title:'Liu 等 · Lost in the Middle：长上下文使用的实验研究',url:'https://arxiv.org/abs/2307.03172'},
    provenance:{title:'W3C · PROV Model Primer：记录资料来源与形成过程',url:'https://www.w3.org/TR/prov-primer/'},
    injection:{title:'Microsoft Learn · 文档中嵌入的指令与提示注入',url:'https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/content-filter-prompt-shields'},
    ragas:{title:'Es 等 · Ragas：分别评价检索与生成（原始论文）',url:'https://arxiv.org/abs/2309.15217'},
    faithfulness:{title:'Ragas 官方文档 · Faithfulness：回答是否得到上下文支持',url:'https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/'},
    recall:{title:'Ragas 官方文档 · Context Recall：有没有漏掉所需信息',url:'https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_recall/'},
    precision:{title:'Ragas 官方文档 · Context Precision：相关材料是否排在前面',url:'https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/context_precision/'}
  };
  window.RAG_ARTICLES={
    'rag-composition':{
      id:'rag-composition',domain:'ai',ragNode:'ingestion',title:'RAG 到底把哪些东西接在了一起？',eyebrow:'RAG · 先看整体分工',
      lead:'RAG 的全称是 Retrieval-Augmented Generation，中文常译为“检索增强生成”。它先从外部资料中寻找与问题有关的内容，再把选中的内容交给生成模型使用。理解它的入口，是把“资料在哪里、怎样找到、模型怎样用、结果怎样核对”连成一张图。',
      scope:'本页以常见的文本资料问答为主线。RAG 有多种实现，图中的准备、检索、上下文与生成是理解分工的简化视角，并非所有系统必须采用的固定模块清单。',
      sections:[
        section('准备资料与回答问题，是两条相接的流程','准备阶段把原始资料转成可搜索的内容，并保留标题、来源、版本和访问范围；资料变化时，这部分也要更新。问答阶段接收具体问题，寻找候选材料、挑选证据，再组织输入并生成回答。准备得好，不代表每个问题都找得到；检索找到了，也不代表模型一定正确使用。沿这条链观察，才能定位缺口。'),
        section('检索增强，通常改变本次输入','把查到的文档放入一次模型输入，通常不会因此更新语言模型参数。训练或微调则会改变模型参数，两者可以结合：原始 RAG 研究就涉及检索器与生成器的训练。向量数据库只是某些检索实现的部件；关键词搜索、现有数据库或其他查询方式，也可以为生成提供材料。不能用某个工具的名字代替整个方法。'),
        section('LLM、RAG 与 Agent 处在不同层次','LLM 负责一次输入后的生成；RAG 把外部信息接入这个过程；Agent 则可在任务循环中决定何时查、查什么，以及是否继续补查。固定的“检索后回答”也能构成 RAG，不需要先搭建 Agent。信息组织又在上游回答资料叫什么、适用于谁、来自哪里、是否过时，使查到的片段能够被辨认和核对。')
      ],
      example:{title:'构造示意：给星桥资料馆加一个问答入口',text:'读者问“珍本能带走吗”。系统从馆藏规则中检索相关条款，将现行规则及来源交给模型，再检查回答有没有保留“珍本仅限馆内阅览”的条件。模型并没有因为看见这份规则就永久学会它；下一次能否答对，仍取决于当次输入与系统流程。'},
      takeaway:'先认清资料准备、检索、上下文、生成与核对的分工，再决定在哪一层继续深入。',
      visual:{kind:'flow',steps:[step('准备阶段','整理资料、来源、版本与检索入口'),step('问题到来','检索并筛选本题需要的材料'),step('组织与生成','把证据放入本次输入，形成回答'),step('检查与修正','核对依据；不足时补查、限答或停止')]},
      related:['rag-ingestion','rag-retrieval','rag-generation','rag-evaluation'],
      crossLinks:[link('#map/llm?node=generation&depth=intro','回到大语言模型：一次生成怎样发生？','检索到的材料进入模型上下文，生成机制仍需要单独理解。'),link('#map/agent?node=knowledge&depth=intro','连接 Agent：谁决定什么时候查询？','Agent 可以调用检索并根据结果继续行动，RAG 本身不要求这种循环。'),link('#domain/information?direction=description','连接信息组织：资料怎样被描述？','标题、版本和来源让片段获得可查找、可辨认的身份。')],
      sources:[refs.paper,refs.overview,refs.retrieval]
    },
    'rag-ingestion':{
      id:'rag-ingestion',domain:'ai',ragNode:'ingestion',title:'整份文档，怎样变成不会断章取义的检索材料？',eyebrow:'RAG · 资料准备与分块',
      lead:'文档要先被读出来，才谈得上检索。解析处理文字、标题和表格；分块选择一次检索的内容单位；元数据保留身份与适用范围；索引则提供快速查找的入口。这里最容易忽略的，是切出来的句子还能不能表达原来的意思。',
      scope:'本页讨论文本与常见文档的准备过程。短文档不一定需要切块，按语义分块也没有普遍最优的尺寸；实验中的材料与切分结果由编辑预设。',
      sections:[
        section('分块先考虑意义的边界，再考虑长度','固定长度切分容易实现，却可能把规则和例外、表头和数据、结论和条件拆开。按标题、段落或句子边界切分，有机会保留这些联系，但仍要检查实际文本。较小片段便于精准命中，较大片段保存更多背景；适当重叠可以连接边界，也会增加重复。选择要根据问题类型和材料结构验证，不能只记住一个长度。'),
        section('片段还需要带着自己的身份','同一句话出现在旧版公告、现行规则或草稿里，含义可能完全不同。片段应能追溯到原文位置，并携带必要的标题、来源、版本、适用对象等元数据。元数据不是对真实性的保证，但能帮助过滤与核查。例如“可外借”若丢了“普通资料”这个类别，单靠句子流畅无法发现它已不适用于珍本。'),
        section('索引让内容可查，也需要跟上内容变化','关键词索引为词语建立查找线索；向量索引使用数值表示支持相似性搜索。它们提供不同入口，并不把资料自动变成正确答案。文档更新、撤回或权限变化后，相应片段及索引也要更新；否则新问题仍可能命中旧规则。保留来源与版本关系，才能追问某个回答究竟依据了哪一份材料。')
      ],
      example:{title:'构造示意：被切掉的限制条件',text:'星桥资料馆的完整规则是“普通资料可外借；珍本仅限馆内阅览”。若只取到“可外借”，一个短片段就失去了适用对象。比较机械切分与保留语义关系的切分时，要看条件、例外和来源是否仍然跟着结论，而不只是比较每块字数。'},
      takeaway:'分块不是单纯切短；它需要在可检索的粒度内，保住条件、关系和出处。',
      visual:{kind:'flow',steps:[step('解析原文','读出段落、标题、表格与结构'),step('选择片段','兼顾长度与完整的语义关系'),step('补全身份','来源、位置、版本、类别与权限'),step('建立索引','提供检索入口，并随资料变化更新')]},
      related:['rag-chunks','rag-retrieval','rag-context','info-description'],
      crossLinks:[link('#domain/information?direction=description','深入信息描述：资料需要哪些字段？','分块后的文本需要保留足够的身份信息，才能回到原文和适用范围。'),link('#article/info-indexing','连接索引：怎样从词语找到材料？','理解索引与原始资料的区别，有助于看懂为什么更新资料也要更新入口。'),link('#map/llm?node=representation&depth=intro','补上 LLM 基础：为什么输入有长度限制？','模型按 token 处理输入，文档的字数与实际输入长度不是同一个量。')],
      sources:[refs.chunks,refs.provenance,refs.hybrid]
    },
    'rag-retrieval':{
      id:'rag-retrieval',domain:'ai',ragNode:'retrieval',title:'同一个问题，为什么会找到不同的材料？',eyebrow:'RAG · 查询与候选召回',
      lead:'检索先回答“哪些材料值得进一步看”。关键词检索从字词匹配出发，向量检索利用数值表示寻找相近内容，混合检索汇合不同线索。它们寻找候选的依据不同，所以同一个问题可能得到不同的结果。',
      scope:'本页聚焦常见的关键词、向量与混合检索。向量相近不代表事实正确，混合检索也不保证每次更好；图解展示方法差异，不是搜索引擎性能排名。',
      sections:[
        section('关键词与语义，相互补充也各有盲点','准确的资料编号、专有名词或错误代码，往往需要字词匹配。用户换一种说法提问时，向量表示可能找到字面不同但主题相近的内容，例如把“带走”与“外借”联系起来。相似性只是某种表示空间中的关系；它可能把同主题的旧公告排在前面，也可能错过一句极关键的否定。理解“像什么”与“能证明什么”是两个问题。'),
        section('混合检索，要说明怎样汇合结果','不同检索方法使用不同的评分含义，不能把原始分数不加说明地当作同一种尺度。混合检索可以先分别取得候选，再按排名融合等方法组合。这样既利用准确词语，也利用表达上的相近关系。采用哪种融合方式、取多少候选，都需要根据实际问题验证；引入更多方法会增加步骤，并不会消除资料缺失或来源过时。'),
        section('找不到时，要检查查询，也要检查资料范围','没有候选可能是措辞不合适，也可能是相关内容未收录、被权限排除或根本不存在。系统可以补充同义表达、拆开复杂问题，或说明缺少哪类材料；不能把空结果直接当成“现实中没有”。查询改写还要保留原问题的对象与限制，避免为了得到结果，把“珍本”悄悄改成了“普通资料”。')
      ],
      example:{title:'构造示意：从“能带走吗”找到“外借规则”',text:'问“珍本能带走吗”，纯字面搜索可能命中包含“珍本”的旧说明，语义搜索可能找到讲外借的规则。两者的结果还需继续检查类别、版本和完整条款。本地演示中的排序是编辑设置的说明材料，不代表真实检索模型的得分或效果。'},
      takeaway:'检索提供可能相关的候选；理解不同入口的依据，才能知道漏了什么、下一步该查哪里。',
      visual:{kind:'flow',steps:[step('理解问题','保留对象、关系与限制条件'),step('选择入口','关键词、向量或其他数据查询'),step('汇合候选','按明确方法组合不同检索线索'),step('暴露缺口','标出空结果、遗漏与需要进一步核对的项')]},
      related:['rag-similarity','rag-ranking','rag-ingestion','llm-vectors'],
      crossLinks:[link('#domain/information?direction=retrieval','连接信息检索：问题怎样变成查找线索？','检索词、相关性和召回范围，是比 RAG 更早也更一般的信息问题。'),link('#map/agent?node=knowledge&depth=mechanism','连接 Agent：什么时候需要改写或补查？','固定流程可以检索一次，Agent 也可以根据结果调整下一次查询。')],
      sources:[refs.hybrid,refs.retrieval]
    },
    'rag-ranking':{
      id:'rag-ranking',domain:'ai',ragNode:'ranking',title:'找到一批材料之后，为什么还要筛选和重排？',eyebrow:'RAG · 过滤、融合与重排',
      lead:'第一轮候选里，可能混着旧版本、错误对象和相近主题。过滤根据明确条件决定哪些材料可进入范围；重排则进一步比较问题与候选，把更值得使用的材料向前放。二者解决的不是同一件事。',
      scope:'本页用简化的“检索→条件过滤→重排”讲清职责。真实系统可在检索前或过程中应用过滤；实验排序由编辑预设，没有执行向量计算或真实重排模型。',
      sections:[
        section('过滤看适用范围，重排看候选与问题的关系','问现行借阅规则时，版本字段能帮助排除已失效条款；访问权限则限定哪些资料允许被取用。这些条件不能只靠文本相似度猜。重排通常在已有候选中再次比较问题与内容，判断哪些更有帮助。一个片段即使非常相关，也可能不属于当前有效范围；过滤错误又可能把真正需要的材料排除。'),
        section('重排只能重新审视已经找回的候选','第一轮没召回的关键条款，不会因为把其余结果换个顺序就自动出现。若正确材料根本不在候选里，要回到检索、分块或资料准备阶段。若候选里已有正确材料却排得很后，才更适合检查排序。区分这两种问题，可以避免一看到答案错误就只更换生成模型，或只增加检索条数。'),
        section('相关、有效、可信和足够，是不同判断','排序靠前通常只表示在某种规则下更相关，不表示它已通过事实核查。现行版本也可能写得不完整；多条重复转载也不等于多个独立证据。选材料时还要看它能否支持问题中的关键判断，是否遗漏例外，是否与其他材料冲突。最终放入上下文的内容，需要保留这些差异，而不是把第一名当作结论。')
      ],
      example:{title:'构造示意：旧通知、现行条款与相近主题',text:'问“现在珍本可以带走吗”，候选包括已失效的“珍本可外借”、现行珍本阅览规则，以及讲“珍本展览纪念册”的现行说明。现行过滤能去掉旧通知，却不能排除对象不相符的纪念册说明；重排再比较问题与候选。演示只取首条材料以放大这种差别，不表示实际系统应只取一条。'},
      takeaway:'先问关键材料有没有进候选，再问是否适用、怎样排序；相关性不能代替证据判断。',
      visual:{kind:'flow',steps:[step('召回候选','先看关键内容是否被找回'),step('核对条件','版本、对象与允许访问的范围'),step('再次比较','把更相关的候选排到前面'),step('挑选证据','保留互补信息、条件与待解冲突')]},
      related:['rag-retrieval','rag-context','rag-metrics','info-provenance'],
      crossLinks:[link('#domain/information?direction=provenance','连接来源与版本：为什么旧材料仍会被搜到？','来源记录和版本关系帮助确定资料适用的时间及范围。'),link('#article/education-evidence','连接证据判断：什么能支持这个结论？','检索排序是寻找线索的帮助，支持某项结论还要检查具体内容。')],
      sources:[refs.ranking,refs.hybrid,refs.provenance]
    },
    'rag-context':{
      id:'rag-context',domain:'ai',ragNode:'context',title:'找到的材料，怎样放进模型这一次能看到的输入？',eyebrow:'RAG · 上下文组织',
      lead:'资料库中的内容、检索找回的内容、模型本次真正看到的内容，是三个不同范围。上下文组织负责最后一次选择：在有限输入中保留有用材料、必要条件与来源，让模型有机会根据这些信息回答。',
      scope:'本页讨论生成前的材料组织，不把长上下文等同于完整理解。资料选择、去重与摘要都可能丢失信息，需要用具体问题检查效果。',
      sections:[
        section('能放进去，不等于能够正确利用','模型输入要容纳任务说明、问题、历史信息和检索材料，输出也有相应长度约束。材料越多并不必然越好：重复和无关内容会挤占空间。关于长上下文的研究在特定模型与任务中观察到位置影响，这提醒我们检查材料安排；不能把某次实验结果当作所有模型永远相同的规律。'),
        section('去重与压缩，不能顺手删掉条件','同一公告的多个转载可以归并，但不同版本或互相矛盾的条款不能不加说明地合并。摘要要保留对象、时间、否定、例外和出处；必要时保留原文供回查。对于“珍本能否外借”，看似简洁的“资料可外借”恰好删掉了最重要的边界。节省输入长度的目标，应与能否回答本题一起衡量。'),
        section('检索材料是待判断的数据，不是新的命令','网页、邮件和文档可能包含要求模型改变任务的文字。即使这些文字被检索命中，也不应因此获得系统指令的地位。应用需要区分任务规则与外部内容，限制工具权限，并检查异常行为；仅给文本加上一个标签不能保证防护成功。这也是 RAG 与 Agent 连接时要格外理解的边界。')
      ],
      example:{title:'构造示意：让限制条件与结论一起进入输入',text:'给模型的证据包保留“普通资料可外借”和“珍本仅限馆内阅览”，并注明两句来自同一份现行规则。如果只留下第一句，后面的生成再流畅，也缺少回答珍本问题的关键依据。若原文中另有“忽略任务”的文字，它只是文档内容，不应改变本次任务。'},
      takeaway:'上下文组织决定模型当次能用什么；精简要保留意义，外部材料要保留身份与指令边界。',
      visual:{kind:'flow',steps:[step('明确输入预算','任务、问题、历史与材料共同占用空间'),step('筛选与去重','保留互补内容，识别重复和冲突'),step('保全关系','结论、条件、例外与来源一起组织'),step('隔离外部内容','区分证据材料与系统任务指令')]},
      related:['rag-chunks','rag-ranking','rag-generation','ai-context'],
      crossLinks:[link('#map/llm?node=context&depth=intro','回到 LLM：什么是本次上下文？','资料存在外部系统中，不表示它已经进入模型输入。'),link('#map/agent?node=state&depth=mechanism','连接 Agent 状态：多轮之后还保留什么？','连续检索会积累结果，系统需要选择哪些内容进入下一轮。'),link('#article/info-relations','连接信息关系：为什么不能只留下孤立句子？','条件、引用、版本与例外关系，决定一句话可以怎样被使用。')],
      sources:[refs.context,refs.middle,refs.injection]
    },
    'rag-generation':{
      id:'rag-generation',domain:'ai',ragNode:'generation',title:'回答带了引用，为什么仍然可能说错？',eyebrow:'RAG · 基于证据生成',
      lead:'检索给模型提供材料，生成把材料组织成对问题的回答。两者之间还有一道关键检查：每一项结论是否真的得到材料支持？附上一条来源链接只能提供回查入口，不能自动证明这句话正确。',
      scope:'本页讨论以给定材料为依据的问答。实验的证据与回答均为编辑预设，用于比较完整条件、条件丢失和证据不足三种情形，不调用真实模型。',
      sections:[
        section('先看回答声称了什么，再看证据能支持什么','回答可能包含多个主张：谁可以借、哪些资料可以借、有什么例外。需要逐项找对应依据，而不是发现一处相同关键词就认为整段已证实。模型也可能加入来自参数中已有模式的内容。若任务要求只据提供材料回答，就要把没有依据的扩展删除或明确标作未核实，不能让推测混入规则说明。'),
        section('引用方便核对，核对仍然要读具体内容','引用可能指向正确文档，却对应错误段落；也可能支持一半结论，遗漏适用范围或例外。即使回答忠实于材料，材料本身仍可能过期或有误。理解这两层区别很重要：一层是“是否照着证据说”，另一层是“证据是否值得相信、是否适用于当前问题”。RAG 可以改善依据的可追溯性，却不能跳过判断。'),
        section('证据不足时，有限回答也是有信息的结果','资料只支持部分结论时，可以回答已支持的部分，并指出还缺什么。材料冲突时，应说明版本或条件差异，必要时补查；没有相关证据时，可以拒绝给出确定结论。没有检索到外借条款，不代表已经证明“禁止外借”。把缺口说清，会为下一步查找提供方向，也比编出一条完整规则更有帮助。')
      ],
      example:{title:'构造示意：同一问题的三种证据处境',text:'问“星桥资料馆的珍本能带走吗”：完整规则支持“仅限馆内阅览”；孤立的“可外借”缺少适用对象，不能据此断定珍本可借；没有找到适用材料则不足以判断借阅规则。切换材料时，要一起观察回答范围、引用内容和仍然未知的部分。'},
      takeaway:'能找到出处、得到材料支持、符合现实情况，是需要分别核对的三件事。',
      visual:{kind:'flow',steps:[step('读取问题与证据','确认材料对象、版本及条件'),step('组织有据回答','让每项主张对应具体支持'),step('检查引用关系','原文是否支持，范围有没有扩大'),step('处理未知部分','限定回答、补充查询或明确无法判断')]},
      related:['rag-context','rag-evaluation','agent-evidence','info-provenance'],
      crossLinks:[link('#map/llm?node=generation&depth=boundary','回到 LLM：流畅生成为什么不等于事实保证？','RAG 增加可用依据，但生成仍可能误用、遗漏或补出材料之外的内容。'),link('#article/education-evidence','连接证据判断：怎样从材料走到结论？','区分支持、推测与证据不足，能迁移到 AI 之外的信息阅读。'),link('#map/agent?node=knowledge&depth=boundary','连接 Agent：何时补查，何时停止？','证据缺口可以触发下一轮检索，也可以成为交还问题的理由。')],
      sources:[refs.faithfulness,refs.provenance,refs.overview]
    },
    'rag-evaluation':{
      id:'rag-evaluation',domain:'ai',ragNode:'evaluation',title:'RAG 答错了，怎样知道该改哪一层？',eyebrow:'RAG · 评估与修正',
      lead:'一次错误回答，可能来自没收录、没找到、排错、截掉条件，或模型没有忠实使用证据。评估的作用，是把这些不同原因分开，让下一步改进有方向；只看最终回答像不像正确答案，容易把问题归到错误的地方。',
      scope:'本页介绍常见的分层检查思路。指标定义、参考答案和判定方式需要明确；自动评审也可能出错，本网页不据此认定读者已经掌握知识。',
      sections:[
        section('检索层先看该找的有没有找到','召回检查所需材料是否遗漏，精确度检查返回结果中有多少相关内容，排序指标还会考虑它们出现的位置。计算这些指标需要说明什么算相关、参考范围是什么，以及评估前多少条结果。取回更多材料可能减少遗漏，同时带来噪声和更长输入；一个总分不足以告诉你这种取舍是否适合实际问题。'),
        section('答案层再看是否有依据、答到点上且正确','材料已经足够时，仍要检查回答有没有保留条件、是否直接回应问题、引用是否对应，以及有没有编造。忠实于上下文与事实正确不能互换：模型可能忠实复述一份过期规则，也可能偶然答对却没有使用应有证据。把这些维度分开，才能判断问题主要在资料、检索、上下文，还是生成环节。'),
        section('用不同问题找边界，再针对原因修改','测试集应覆盖直接问法、同义表达、精确编号、旧新版本冲突、无答案和条件例外等情形。记录问题、候选、实际输入和回答，才有办法回溯错误。自动评价可协助筛查，但需要校准与抽查；改分块、检索或提示后，应比较同一批问题，并补入新发现的失败例子，观察修复是否带来新的损失。')
      ],
      example:{title:'构造示意：同样答错，两种不同的修复方向',text:'案例甲没有找回珍本规则，应先检查收录、切分、查询和候选范围。案例乙已把完整规则交给模型，却回答“珍本可以外借”，应检查上下文与生成是否正确处理限制。若二者都只被记为“回答错误”，就很难知道该往哪个方向深入。'},
      takeaway:'把“找到了没有”和“用对了没有”分开检查，再沿资料到答案的链条修正。',
      visual:{kind:'flow',steps:[step('准备问题与依据','包括典型问题、例外、冲突及无答案'),step('检查检索','是否遗漏、是否混入噪声、排序怎样'),step('检查回答','依据、范围、正确性与引用分别核对'),step('定位后再修改','修具体环节，并回测已知失败情形')]},
      related:['rag-metrics','rag-retrieval','rag-generation','comp-testing'],
      crossLinks:[link('#article/comp-testing','连接软件测试：怎样保留可复现的失败例子？','记录输入、中间结果和预期依据，能把模糊的答错变成可定位的问题。'),link('#map/llm?node=evaluation&depth=boundary','连接 LLM 评估：一个分数说明了多少？','评价取决于任务范围与样本，不能从有限问题推断所有场景的能力。'),link('#domain/information?direction=provenance','回到资料来源：为什么还要检查原文？','答案层的忠实性不能替代资料本身的真实性与适用性判断。')],
      sources:[refs.ragas,refs.recall,refs.precision,refs.faithfulness]
    }
  };
})();
