/* Foundations used by the RAG map. Editorial explanations and examples are
 * original; source concepts checked against primary documentation 2026-11-05. */
(() => {
  'use strict';
  const section=(title,text)=>({title,text});
  const step=(title,text)=>({title,text});
  const source=(title,url)=>({title,url});
  const refs={
    chunks:source('Microsoft · 文档分块与上下文保留','https://learn.microsoft.com/en-us/azure/search/vector-search-how-to-chunk-documents'),
    hybrid:source('Elastic · 关键词与向量的混合检索','https://www.elastic.co/docs/solutions/search/hybrid-search'),
    similarity:source('Google · 嵌入向量的相似度衡量','https://developers.google.com/machine-learning/clustering/dnn-clustering/supervised-similarity'),
    metrics:source('Google · 查准率与查全率的定义','https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall'),
    ragas:source('Ragas 原论文 · 检索与生成的多维评估','https://arxiv.org/abs/2309.15217'),
    faithfulness:source('Ragas · 回答是否得到上下文支持','https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/')
  };
  window.RAG_FOUNDATIONS={
    'rag-chunks':{
      id:'rag-chunks',domain:'ai',foundation:true,ragNode:'ingestion',
      title:'把一份资料拆成片段，怎样不拆散它的意思？',
      eyebrow:'随用随补的基础 · 片段、限定条件与上下文',
      lead:'RAG 常把长文档拆成便于定位和组合的片段。但一个句子是否有用，取决于它属于哪份资料、说的是谁、在什么条件下成立。先看清这些关系，就能理解为什么分块不只是把文字切短。',
      scope:'这里解释常见文本资料的分块与上下文关系，不规定通用的最佳长度。短资料可以整体使用；表格、代码和图像还需要各自的结构处理。',
      sections:[
        section('片段的意义，经常依赖片段以外的信息','“开放到 18 点”可能回答了一个时间问题，也可能遗漏“仅限周日”的条件。标题、表头、前一段的对象、后一段的例外，都可能决定一句话怎样理解。拆分资料时，要检查片段能否保留这些关系，或是否能通过原文位置补回它们。把一行表格转成文字却丢掉列名，也会留下看似完整、含义不清的数字。'),
        section('块的大小和边界，解决的是取舍问题','片段较小，容易准确定位局部内容，却可能把条件切断；片段较大，保留的上下文更多，也可能混入无关内容并占用输入空间。可以按段落、标题或句子组织，也可以保留部分重叠，使相邻片段共享一点内容。重叠会增加重复，结构切分也不能保证永远完整。需要结合资料形式和常见问题检查，不存在对所有资料都最好的固定长度。'),
        section('保留回到原文的路，再按问题组装上下文','一个可用的片段，可以同时带着文档标识、标题、位置、版本和适用范围。这些描述帮助系统筛选，也让读者检查引用。检索时找到一小段，交给模型前可以补回标题、相邻段落或完整表头；这属于上下文组装。片段来自哪份原文、后来被怎样压缩或拼接，需要保持可追踪，不能把组合后的内容误当作原文的一整段。')
      ],
      example:{title:'构造示意：同一句“18 点”，回答了不同问题',text:'假设一份“青禾阅览室 · 本月开放说明”写道：“周六开放到 16 点。周日开放到 18 点。节假日另行通知。”问题是“本月周六几点关闭？”只取“开放到 18 点”会丢失周日这个条件；把标题、完整句子和原文位置保留后，才有条件检查适用范围。这里的场所与规则均为教学构造，不是真实开放信息。'},
      takeaway:'一个片段要能被找到，也要能被正确解释。先保留对象、条件和出处，再考虑怎样让它足够短、足够集中。',
      visual:{kind:'flow',steps:[step('查看原文结构','标题、段落、表头与例外共同表达意思'),step('决定分块边界','按需要定位的内容切分，检查条件是否被截断'),step('附上定位与描述','文档、位置、版本和适用范围随片段保留'),step('按问题补足上下文','选择片段并补回必要的标题、邻段和出处')]},
      related:['rag-ingestion','rag-context','info-description','info-provenance'],
      crossLinks:[
        {href:'#map/rag?node=context&depth=mechanism',title:'回到 RAG：片段怎样组成模型输入？',reason:'分块决定准备什么单位，上下文组装决定本次实际采用什么材料。'},
        {href:'#map/llm?node=context&depth=intro',title:'连接语言模型：本次能看到什么？',reason:'保存在资料库里的内容，需要被选入输入后才成为这次调用的上下文。'},
        {href:'#domain/information?direction=description',title:'连接信息组织：怎样描述一个片段？',reason:'标题、位置和适用范围让片段可以辨认，也让它与原文重新连接。'}
      ],
      sources:[refs.chunks]
    },
    'rag-similarity':{
      id:'rag-similarity',domain:'ai',foundation:true,ragNode:'retrieval',
      title:'两段话很像，为什么还不一定能回答问题？',
      eyebrow:'随用随补的基础 · 相似度、相关性与适用性',
      lead:'“怎么注销账户”和“如何关闭账号”用词不同，却可能表达接近的需求；两份标题一样的说明，也可能适用于不同版本。检索需要借助可计算的线索，使用资料时还要判断它能否回答这一次的问题。',
      scope:'先理解关键词、语义表示与相关性，不要求计算向量或学习梯度。向量是可选的检索手段；需要深入数学时，可以继续进入已有的向量基础。',
      sections:[
        section('不同检索方法，观察的是不同线索','关键词检索利用词项匹配、频率等线索，常适合精确名称、编号和专业术语。语义检索可以把问题与资料表示成向量，再用约定的方法比较，帮助发现用词不同但含义接近的内容。向量是固定顺序的一组数，比较结果依赖表示模型与度量方法。混合检索把多条查找通道的结果结合起来，但组合方法仍需要按任务检查，不能假定越复杂就一定越好。'),
        section('相关性要回到问题，而不是只看材料彼此像不像','两篇讨论同一产品的文章可以很相似，但用户问“现在怎样注销”，就还需要操作步骤、适用版本和当前日期。相似度提供一种候选线索；相关性描述材料对这个需求是否有帮助。同一份旧版说明，对于查现行操作可能不适用，对于研究历史变化却可能正合适。相关性标注也应说明问题和判断标准，而不是给文档贴永久的好坏标签。'),
        section('排序分数和事实依据，要分别解释','分数较高表示某个方法更偏好这条候选，不自动等于“内容有某个百分比的概率是真的”。关键词分数、向量相似度和重排分数可能使用不同尺度，不能随手相加或直接比较。得到候选后，可以按对象和版本过滤，再检查正文是否支持具体结论。排序能帮助把注意力集中到可能有用的材料，却不能替代来源与适用范围的核对。')
      ],
      example:{title:'构造示意：同一个需求，有三类候选',text:'假设问题是“工具 X 的新版本怎样关闭账号？”候选甲写“X v1 账号关闭说明”，文字匹配很强但版本较旧；候选乙写“X v2 用户资料删除流程”，表达不同，需要核对是否实际涵盖账号关闭；候选丙讲“关闭浏览器窗口”，虽然有相同动词，却不对应需求。这里不预设真实排名或分数：先用线索找到候选，再读正文、核对对象和版本，才能决定采用哪一份。'},
      takeaway:'把相似度当作寻找候选的线索，把相关性放回具体需求，把结论是否有据交给正文、来源和条件一起判断。',
      visual:{kind:'flow',steps:[step('说清当前需求','主题之外，补上对象、版本与使用目的'),step('使用查找线索','关键词、语义表示或它们的组合'),step('得到并筛选候选','检查对象、日期与允许使用的范围'),step('核对能否支持回答','正文说了什么，哪些结论仍然没有依据')]},
      related:['rag-retrieval','rag-ranking','llm-vectors','info-retrieval'],
      crossLinks:[
        {href:'#article/llm-vectors',title:'可选深入：向量与相似度怎样计算？',reason:'如果想理解语义检索中的数字表示，可以继续看向量基础；这不是认识 RAG 的入场门槛。'},
        {href:'#domain/information?direction=retrieval',title:'连接信息组织：问题怎样变成查找条件？',reason:'资料对谁有用、用于什么目的，是设计查询和判断相关性的共同起点。'},
        {href:'#map/agent?node=knowledge&depth=boundary',title:'连接 Agent：找到了以后怎样决定采用？',reason:'Agent 可以把检索纳入任务过程，但相似度本身仍不能决定是否把材料当作行动依据。'}
      ],
      sources:[refs.hybrid,refs.similarity]
    },
    'rag-metrics':{
      id:'rag-metrics',domain:'ai',foundation:true,ragNode:'evaluation',
      title:'找得准、找得全、回答有据，为什么要分别检查？',
      eyebrow:'随用随补的基础 · 查准率、查全率与分层评估',
      lead:'一个回答不合用，可能因为材料根本没找到，也可能因为找到以后被误读。用两个简单比例认识检索的误取与遗漏，再把材料、回答和现实条件分开核对，就能知道下一步应该改哪一层。',
      scope:'这里用人工标注的小型资料集合解释普通集合查准率和查全率，不是特定评测工具中所有同名指标的实现。真实系统还需要排序、成本、时延及任务专用检查。',
      sections:[
        section('查准率看取回的里面，查全率看所有相关的里面','先针对一个问题，约定资料单位和“相关”的标准。查准率 Precision ＝取回且相关的数量 ÷ 全部取回数量；查全率 Recall ＝取回且相关的数量 ÷ 全部相关数量。前者问取回的材料有多少相关，后者问应找的材料找回了多少。它们只在约定的集合、问题和取回范围内有意义；没有完整相关性标注时，不能假装已经知道全部遗漏。'),
        section('相关性标签是任务判断，不是事实真伪标签','若任务是研究旧版本，历史材料可以相关；若任务是回答现行规则，同样材料可能不适用。即使被标注为相关，也不自动表示内容真实、当前有效或足以支持回答。改变候选数量会改变两个比例，文档级和片段级的统计也可能不同；只看这两个集合比例还没有检查有用材料是否排在前面。比较系统前，应保持问题集、粒度和评价规则可比。'),
        section('从检索到回答，再到现实条件，逐层查原因','先查需要的证据有没有进入候选与上下文，再查回答中的主张是否被这些内容支持，最后核对来源和事实是否适用于当前问题。回答忠实复述一份旧稿，仍可能答错现行规则；检索指标很高，也不能保证模型没有加出额外结论。可以用代表性样例、人工作出的判断与自动评审共同检查；自动评分本身也会出错，需要核对其依据。资料、切分、索引或模型改变后，应重新观察整条链条。')
      ],
      example:{title:'构造算例：共有 4 份相关资料，取回 3 份',text:'设这个小集合已被逐份人工检查，对指定问题相关的是 A、B、C、D。系统取回 A、B、X，其中 X 按本题标准不相关。查准率为 2/3，约 66.7%；查全率为 2/4，也就是 50%。还有 C、D 没被取回。这里的标签只表示对本题的相关性，不代表 A、B 的每句话都真实或当前有效；这两个比例也没有检查最后的回答。所有编号和数量均为教学构造。'},
      takeaway:'先问有没有找到需要的材料，再问回答有没有得到材料支持，最后问来源与事实是否适用。不同层次的高分，不能相互代替。',
      visual:{kind:'flow',steps:[step('固定问题与标注','本题共有 4 份相关资料：A、B、C、D'),step('查看取回集合','取回 A、B、X：3 份中有 2 份相关'),step('分别计算比例','查准率 2/3；查全率 2/4'),step('继续检查回答','主张能否回到依据，来源和条件是否适用')]},
      related:['rag-evaluation','rag-retrieval','rag-generation','comp-testing'],
      crossLinks:[
        {href:'#map/rag?node=evaluation&depth=mechanism',title:'回到 RAG：怎样定位和维护整条链条？',reason:'比例帮助发现检索现象，分层检查进一步定位资料、组装或生成的问题。'},
        {href:'#domain/information?direction=provenance',title:'连接来源与版本：相关材料现在还适用吗？',reason:'评价相关性之后，仍需检查资料怎样形成、如何修订以及覆盖什么条件。'},
        {href:'#map/agent?node=loop&depth=boundary',title:'连接 Agent：什么反馈值得继续查找？',reason:'发现遗漏可以触发下一次查询；继续之前还要判断缺口、查找方向和停止条件。'}
      ],
      sources:[refs.metrics,refs.ragas,refs.faithfulness]
    }
  };
})();
