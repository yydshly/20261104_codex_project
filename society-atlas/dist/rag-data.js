/* Editorial map of common document RAG; stages are a learning structure,
 * not a mandatory implementation sequence or an exhaustive taxonomy. */
(() => {
  'use strict';
  const read=(title,href,reason)=>({title,href,reason});
  const stage=(title,text,links)=>({title,text,links});
  window.RAG_DATA={
    title:'RAG · 检索增强生成',
    lead:'沿着一份资料走到一个回答：先知道要学哪些部分，再按需补基础，理解检索、生成和证据之间怎样衔接。',
    scope:'这里聚焦常见的文档问答型 RAG，按资料到回答的分工组织知识，不穷尽图像、数据库、知识图谱或其他检索增强系统。六个方向可以分别深入，实际系统也可以合并、跳过或重复某些步骤。Agent 可以按结果动态组织查询，但不是 RAG 的必需组件。',
    depths:[{id:'intro',label:'先认识'},{id:'mechanism',label:'拆机制与基础'},{id:'boundary',label:'看应用与边界'}],
    nodes:[
      {id:'ingestion',title:'资料怎样变成可以查找的材料',short:'资料准备',question:'在用户提问之前，需要把资料整理成什么样？',contains:['解析与清理','分块与上下文','描述与索引','来源与版本'],foundation:'rag-chunks',
        intro:stage('先看 RAG 把哪几件事接在一起','从原始资料出发，区分资料准备、寻找材料与模型生成；资料被放进上下文，本身不等于模型已经接受了训练。',[read('RAG、语言模型、Agent 与信息组织怎样分工','#article/rag-composition','先找到 RAG 在 AI 地图中的位置，再选择要展开的部分。'),read('一份文档怎样进入可检索的资料库','#article/rag-ingestion','沿着解析、分块、描述和建索引，观察材料怎样被准备。')]),
        mechanism:stage('再看一段话需要带着哪些上下文','分块让材料便于定位和组合，标题、适用条件、原文位置等信息则帮助片段保留意义。',[read('片段与上下文','#article/rag-chunks','用一句话被截断的例子，理解分块边界为什么会改变可用的依据。'),read('资料描述为什么不能只剩正文','#article/info-description','把对象、主题、日期和版本变成可辨认的线索。')]),
        boundary:stage('处理成功，不代表资料已经可靠','扫描识别可以出错，表格可能丢掉表头，旧稿也可能进入新索引；需要检查转换后的材料还能否追溯和解释。',[read('准备资料时会丢掉什么','#article/rag-ingestion','回到分块示意，比较局部文字与原文条件是否仍能对应。'),read('来源、修订与适用日期','#article/info-provenance','区分上传时间、发布日期和生效日期，找到检查版本的入口。')]),
        neighbor:read('信息组织 · 描述','#domain/information?direction=description','RAG 使用的片段仍是一份需要辨认的资料；描述和来源让它可被筛选、引用与更新。'),frontier:'已展开解析、分块、元数据与索引的基本关系；复杂版面、表格解析、多模态资料与增量处理实现尚未展开。'},
      {id:'retrieval',title:'问题怎样找到一批候选材料',short:'寻找候选',question:'不知道答案在哪一页，系统凭什么开始找？',contains:['问题与查询','关键词匹配','语义检索','混合检索'],foundation:'rag-similarity',
        intro:stage('先把“找候选”和“得到答案”分开','检索根据问题和查找方法，从资料库中挑出值得继续检查的内容；候选可能相关，也可能漏掉关键依据。',[read('关键词、语义与混合检索怎样找材料','#article/rag-retrieval','先认识三种查找思路，知道它们分别利用什么线索。')]),
        mechanism:stage('再看匹配依据和查找通道','先理解查询、索引和相关性；使用向量检索时，再补向量表示与相似度，不必先学完整的机器学习数学。',[read('相似度与相关性有什么区别','#article/rag-similarity','分清文字重合、语义接近与对当前问题有用。'),read('索引怎样从线索定位资料','#article/info-indexing','把提前准备的查找结构，与提问时的检索过程连起来。')]),
        boundary:stage('没找到，可能有几种不同原因','库里没有、查询表达不同、索引未更新和候选数量太少，都可能造成遗漏；相似度高也不表示来源可信或版本适用。',[read('怎样衡量找得准不准、漏得多不多','#article/rag-metrics','用查准率与查全率分别观察误取和遗漏。'),read('检索为什么需要理解当前需求','#article/info-retrieval','把日期、对象和使用目的放回查询，避免只匹配主题。')]),
        neighbor:read('信息组织 · 索引与检索','#domain/information?direction=indexing','检索增强建立在资料可查找的基础上；倒排索引、向量索引等是不同通道，不是知识本身。'),frontier:'已解释关键词、语义、混合检索与候选集合；查询改写、近似最近邻、跨语言检索和多跳查找尚未展开。'},
      {id:'ranking',title:'候选材料怎样被筛选和重新排序',short:'筛选与重排',question:'找到了好几份，哪些值得交给模型？',contains:['条件过滤','相关性排序','重排与选取','冲突与覆盖'],foundation:'rag-similarity',
        intro:stage('先检查适不适用，再比较有多有用','候选中可能混有旧版、不同对象或重复片段；过滤检查明确条件，重排则进一步比较对当前问题的帮助。',[read('过滤、排序与重排分别做什么','#article/rag-ranking','切换查找与筛选条件，观察候选顺序和可用范围怎样改变。')]),
        mechanism:stage('理解两个不同的问题：是否符合条件，是否优先采用','日期和访问范围可以形成筛选条件；在允许使用的候选中，还可以按问题与内容的关系重新排序。权限限制应由系统贯穿检索与输出，不能只靠模型判断。',[read('相似分数能说明到哪一步','#article/rag-similarity','了解不同检索方法的分数不必可直接比较，也不是事实概率。'),read('候选集合与排序怎样被检查','#article/rag-metrics','先看找回哪些，再看前面的材料能否覆盖需要。')]),
        boundary:stage('重排无法凭空补回没有找到的证据','如果关键材料没有进入候选集合，仅改变顺序不能恢复它；多份材料相互冲突时，也需要回看版本和来源。',[read('筛选与重排的能力边界','#article/rag-ranking','区分删去不适用材料、提升有用材料，与重新发起查找。'),read('版本关系怎样帮助处理冲突','#article/info-provenance','不把“排名第一”当作对来源和适用性的最终裁决。')]),
        neighbor:read('Agent · 资料与检索','#map/agent?node=knowledge&depth=mechanism','Agent 可以根据候选不足继续查找；筛选和依据判断仍需要各自明确的条件。'),frontier:'已展开条件过滤、候选重排与覆盖问题；交叉编码器、排序学习、融合算法和大规模排序评测尚未展开。'},
      {id:'context',title:'材料怎样进入模型本次能看到的上下文',short:'上下文组装',question:'找到了很多内容，应该把哪些交给模型？',contains:['输入预算','选取与去重','顺序与出处','条件与材料边界'],foundation:'rag-chunks',
        intro:stage('先看模型本次实际收到了什么','知识库里保存的材料，不会自动全部进入这次回答。应用需要选择片段，连同问题、说明和必要的来源一起组成输入。',[read('检索结果怎样被组装进上下文','#article/rag-context','看候选材料与最终输入的差别，认识一次回答能利用哪些信息。')]),
        mechanism:stage('在有限输入中保留真正影响答案的关系','片段太短可能丢掉条件，太长可能挤掉其他证据；去重、排序与补回标题，可以改变模型看见的材料组合。',[read('展开提示词与上下文工程','#map/context?node=selection&depth=mechanism','把检索片段放回完整输入，还要考虑任务、示例、历史与预算。'),read('片段与上下文','#article/rag-chunks','理解一个句子为何需要前后的对象、限定和标题。'),read('模型怎样关联已有上下文','#article/llm-attention','进一步看材料进入输入之后，语言模型怎样处理其中的关系。')]),
        boundary:stage('能放进去，并不保证被正确利用','长窗口仍有使用能力的限制；摘要可能漏掉例外；资料里的指令也不能自行成为应用的授权或任务要求。',[read('上下文组装可能造成哪些误解','#article/rag-context','沿着原文到输入的过程检查限定条件、出处和材料边界。'),read('上下文、保存与训练有什么差别','#article/ai-context','把本次可见材料、外部存储和模型参数分清。')]),
        neighbor:read('大语言模型 · 关联上下文','#map/llm?node=context&depth=mechanism','RAG 决定交给模型什么，语言模型负责处理本次输入；输入范围和利用能力共同影响回答。'),frontier:'已展开输入预算、选取、去重与条件保留；上下文压缩、结构化证据组装和长上下文位置效应尚未展开。'},
      {id:'generation',title:'模型怎样依据材料组织回答',short:'依据生成',question:'有了资料，为什么还需要检查回答里的每个结论？',contains:['条件生成','主张与引用','依据充分性','缺失与冲突'],foundation:'rag-metrics',
        intro:stage('先追踪一条主张能否回到具体材料','模型把问题和材料作为生成条件；它仍可能补出材料没有说的话，或把只适用于某种情形的内容扩大解释。',[read('材料怎样支持一个有边界的回答','#article/rag-generation','比较完整材料、丢失限定的片段与没有依据时，哪些结论还能成立。')]),
        mechanism:stage('分别理解生成过程与依据关系','语言模型逐步形成文字；引用则应把具体主张连到可检查的出处，两者需要一起观察。',[read('语言模型怎样逐步生成','#article/llm-generation','知道 RAG 改变了生成时的输入条件，没有把生成变成事实查询。'),read('为什么要分层检查 RAG','#article/rag-metrics','分别检查资料是否找对、材料是否支持回答以及事实是否适用。')]),
        boundary:stage('引用存在，不代表引用支持了结论','出处可能真实却没有说这句话，也可能是已过期的说明。材料不足时，要留下缺口；材料冲突时，要说明差异或继续核对。',[read('回答、主张和出处怎样相互检查','#article/rag-generation','检查是否遗漏日期、对象、例外，或添加了没有支持的推断。'),read('证据究竟能证明什么','#article/agent-evidence','把“找到资料”“有来源”和“结论得到支持”分开。')]),
        neighbor:read('大语言模型 · 逐步生成','#map/llm?node=generation&depth=boundary','检索提供额外材料，回答仍由模型生成；文字流畅与主张可靠属于不同判断。'),frontier:'已展开条件生成、主张与引用、证据不足的表达；细粒度引用、结构化生成和自动事实核验实现尚未展开。'},
      {id:'evaluation',title:'怎样找到问题发生的环节并持续更新',short:'核验与更新',question:'回答错了，应该先改资料、检索，还是生成？',contains:['查准与查全','依据与事实','分层定位','更新与回归检查'],foundation:'rag-metrics',
        intro:stage('先把一次失败沿着链条拆开','没找到、选错版本、截断条件和生成越过证据，是不同问题。先找到丢失或误用信息的位置，才能选择要改的部分。',[read('RAG 怎样分层检查和维护','#article/rag-evaluation','从资料到回答逐层定位，再看资料更新为什么需要同步检查。')]),
        mechanism:stage('用不同问题检查不同层次','检索层关心候选和遗漏，生成层关心主张支持与回答质量；还要按任务检查时间、成本、权限与实际使用条件。',[read('查准率、查全率与分层评估','#article/rag-metrics','用可以手算的例子理解两个比例，再把检索指标和回答核验接起来。'),read('软件怎样用样例和边界检验行为','#article/comp-testing','为资料缺失、版本冲突和条件变化准备可比较的检查。')]),
        boundary:stage('一个高分不能替代所有使用条件','评价依赖问题集合、相关性标注和采用的检查方法；换资料、索引或模型后，旧结果不一定仍成立。自动评审也要与人工核对相互校准。',[read('从局部改动回到整条链条检查','#article/rag-evaluation','确认更新是否进入索引，旧片段是否仍被引用，典型问题是否出现退步。'),read('观察、解释和可推广结论','#article/education-evidence','避免把少量成功案例直接推广成系统总是可靠。')]),
        neighbor:read('Agent · 行动循环','#map/agent?node=loop&depth=mechanism','当一次查找不足，Agent 可以根据反馈决定改写查询或继续查找；循环次数增加并不自动意味着依据更充分。'),frontier:'已展开检索与生成分层评价、故障定位和更新检查；排名指标、评测集构建、线上监控和领域专用标准尚未展开。'}
    ],
    foundations:[
      {id:'rag-chunks',title:'片段与上下文',why:'先知道一句话为什么需要带着标题、对象和限定条件，再理解分块与上下文组装。'},
      {id:'rag-similarity',title:'相关性与相似度',why:'分清“文字相近”“主题相关”与“足以支持当前回答”，再选择检索和重排方法。'},
      {id:'rag-metrics',title:'查准、查全与分层评估',why:'用两个可手算的比例认识误取和遗漏，再把检索表现与回答是否有据分开检查。'}
    ]
  };
})();
