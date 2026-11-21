/* Editorial map of prompting and context engineering: a learning framework,
 * not a universal recipe or a promise of model performance. */
(() => {
  'use strict';
  const read=(title,href,reason)=>({title,href,reason});
  const stage=(title,text,links)=>({title,text,links});
  window.CONTEXT_DATA={
    title:'提示词与上下文工程',
    lead:'从“希望它做什么”走到“这一次应该让它看到什么”：看清任务、指令、例子、材料与状态如何一起影响输出，再按需要深入。',
    scope:'这张图聚焦语言模型应用中的输入组织。“提示词工程”和“上下文工程”的边界并非统一标准；这里把前者作为表达任务与要求的入口，把后者作为选择、组装和更新模型可见信息的更大框架。输入组织通常不改变模型参数，也不能保证事实、推理或行动正确。',
    depths:[{id:'intro',label:'先认识'},{id:'mechanism',label:'拆机制与基础'},{id:'boundary',label:'看应用与边界'}],
    nodes:[
      {id:'task',title:'把想法变成可说明、可检查的任务',short:'任务与目标',question:'希望得到什么，怎样判断它有没有做到？',contains:['目的与对象','输入与输出','约束与缺口','完成条件'],foundation:'context-task-contract',
        intro:stage('先看提示词在整个系统里负责什么','从希望完成的事情出发，再区分任务表达、输入材料和模型能力；不必先记提示词术语。',[read('提示词与上下文怎样连接整个系统','#article/context-composition','先看与语言模型、Agent、RAG 的职责关系，找到自己需要补的部分。'),read('从一句愿望走到明确的任务','#article/context-task','比较任务对象、可用资料、输出要求和判断标准有没有说清。')]),
        mechanism:stage('给任务一个可核对的约定','明确输入提供什么、输出需要回答什么、限制在哪；如果信息不足，还需要定义应如何说明缺口。',[read('输入、输出与约束','#article/context-task-contract','用借阅问题拆开目标与证据，理解为什么写清要求还不等于补齐事实。'),read('Agent 怎样定义任务与完成条件','#article/agent-goals','把语言中的要求进一步连接到连续任务与结果检查。')]),
        boundary:stage('写清目标，不会自动补齐缺失的事实','资料缺失、目标冲突或能力不适合，都可能让任务无法按要求完成；需要分别寻找问题来源。',[read('任务说明能解决什么、解决不了什么','#article/context-task','不把更详细的措辞当作事实依据或能力保证。'),read('模型的生成与事实依据','#article/ai-generation','知道表达顺畅与结论可靠还需要不同的检查。')]),
        neighbor:read('Agent · 目标与任务','#map/agent?node=goals&depth=intro','一次输入的要求可以成为 Agent 任务的一部分；行动范围和实际完成还需要系统继续管理。'),frontier:'已展开目的、对象、输入输出和完成条件；复杂需求分析、多目标取舍与行业任务规范尚未展开。'},
      {id:'instructions',title:'怎样把要求、背景和材料分清楚',short:'指令与结构',question:'哪些是要执行的要求，哪些只是待阅读的内容？',contains:['任务指令','角色与背景','层次与分隔','冲突与信任边界'],foundation:'context-task-contract',
        intro:stage('先给不同内容明确的身份','任务要求、背景资料和示例承担不同作用。分开呈现，有助于让人和系统检查到底交给模型了什么。',[read('指令与资料为什么要分开','#article/context-instructions','认识角色说明、层次和分隔的用途，也看见它们的边界。')]),
        mechanism:stage('结构帮助表达，权限仍由系统落实','模型服务可提供不同角色或消息层级，具体语义依实现而定。材料中的句子不能因被检索到就自动变成操作授权。',[read('输入约定怎样划分责任','#article/context-task-contract','把任务目标、材料内容和执行权限分开描述。'),read('工具请求与程序执行的区别','#article/agent-tools','继续区分模型提议、参数检查、权限判断与实际执行。')]),
        boundary:stage('标签和措辞不是可靠的安全隔离','文档可能夹带冲突指令；仅添加分隔符或强调语句，不能保证模型永远忽略它们。还需要限制访问与动作范围。',[read('指令冲突与不可信材料','#article/context-instructions','看清结构化表达能帮助什么，以及为什么仍需要系统控制。'),read('RAG 的材料边界','#article/rag-context','检索来的文字应作为待判断的资料，不能自行改变当前任务。')]),
        neighbor:read('大语言模型 · 适配与系统','#map/llm?node=adaptation&depth=boundary','提示与输入组织影响一次使用的条件，模型训练、工具执行和外部限制属于其他层次。'),frontier:'已解释指令、背景、资料与角色结构；不同服务的消息协议、提示注入评测与权限隔离实现仍需专门学习。'},
      {id:'examples',title:'怎样用示例和输出约定说明想要的结果',short:'示例与输出',question:'给一个例子，是在说明形式，还是提供事实依据？',contains:['示例与模式','格式与字段','代表性与偏差','格式检查与事实检查'],foundation:'context-task-contract',
        intro:stage('先让预期结果变得可见','例子可以说明分类口径、语气或输出格式；输出字段则帮助约定必须交付哪些内容。两者都不是新问题的事实答案。',[read('例子与输出格式分别说明什么','#article/context-examples','把表达方式、任务规则和证据来源分开看。')]),
        mechanism:stage('检查例子覆盖了哪些情形','只展示成功样例，可能没说明缺失材料或规则冲突该怎样处理；示例选择需要与任务范围对应。',[read('用对照样例检查要求','#article/context-tests','补上一般情形、例外和信息不足的检查，避免只对照一个理想样例。'),read('结构化输入输出的基础','#article/agent-interfaces','区分字段格式、程序能否读取和字段内容是否正确。')]),
        boundary:stage('长得像例子，不代表判断正确','模型可能照搬示例的事实、遗漏新条件；即使输出能被解析，也不表示其结论有据或操作已完成。',[read('格式与事实需要分别核对','#article/context-examples','知道示例能够示范什么，不能替代什么。'),read('主张与证据怎样对应','#article/agent-evidence','让每条结论回到本题材料，而不是用格式合规替代依据。')]),
        neighbor:read('大语言模型 · 逐步生成','#map/llm?node=generation&depth=intro','示例与格式说明成为生成的输入条件，不是在当前请求中重新训练模型参数。'),frontier:'已展开示例、字段、代表性与验证区别；约束解码、结构化输出接口、复杂模式设计和自动示例选择尚未展开。'},
      {id:'selection',title:'哪些信息值得放进这一次的输入',short:'材料与组装',question:'有很多材料时，怎样保留真正影响回答的内容？',contains:['窗口与预算','相关性与去重','条件与来源','顺序与压缩'],foundation:'context-budget',
        intro:stage('先看一次请求实际带了什么','指令、问题、示例、检索材料、工具结果和历史消息，都可能占用本次输入。保存在系统里不等于已经被模型看到。',[read('材料怎样组成一次上下文','#article/context-selection','用可操作的预算示意，观察冗余内容、必要条件和压缩之间的取舍。')]),
        mechanism:stage('理解有限空间中的选择与保留','先知道 token 与窗口，再检查哪些内容重复、哪些条件不能删；必要时回到原文补足解释。',[read('token、窗口与输入预算','#article/context-budget','把字数、模型处理单位与输入输出空间分清，理解图解中的简化计量。'),read('RAG 怎样选择和组装材料','#article/rag-context','从外部资料查找走到当次输入，查看来源和限定条件如何随材料进入。')]),
        boundary:stage('装得更多，不保证使用得更好','更长的窗口可能容纳更多内容，仍需检查相关材料是否被正确利用；摘要也可能删除对象、日期、否定或例外。',[read('压缩与组装会丢掉什么','#article/context-selection','对照完整规则与简化片段，找出信息缺口。'),read('分块为什么需要上下文','#article/rag-chunks','把输入组织接回原始资料结构，理解为什么短片段可能失去意义。')]),
        neighbor:read('RAG · 上下文组装','#map/rag?node=context&depth=mechanism','RAG 提供候选材料，上下文组织决定当次采用哪些内容；来源、条件与输入空间需要一起考虑。'),frontier:'已展开预算、筛选、去重与条件保留；精确计数接口、上下文压缩算法、多模态计量与大规模检索策略尚未展开。'},
      {id:'state',title:'多轮任务中，哪些内容需要保留、更新或重新找回',short:'状态与记忆',question:'上一轮知道的事情，下一轮一定还能看见吗？',contains:['会话历史','当前任务状态','外部保存','检索与摘要更新'],foundation:'context-budget',
        intro:stage('先区分本轮可见与系统保存','历史消息可以被带入、截去或概括；外部存储中的内容需要被读取并加入输入，才会成为这次调用可用的信息。',[read('跨轮之后，上下文怎样继续','#article/context-state','比较丢失、保留与失真的状态说明，理解记忆为什么需要管理。')]),
        mechanism:stage('保留任务所需的状态，而不是只保存一段话','任务对象、已确定事实、出处、未完成事项和限制，都可能影响下一步；压缩后应能回到具体来源核对。',[read('本轮空间怎样分配','#article/context-budget','理解旧消息与新资料如何共同占用输入预算。'),read('Agent 怎样管理状态与记忆','#article/agent-state','把跨轮上下文接到外围系统的保存、选择和恢复。')]),
        boundary:stage('保存和摘要都可能保留错误','过期条件、模型自己猜出的结论或遗漏的限制，可能被写进摘要后继续传播；需要保留来源与更新规则。',[read('跨轮记录怎样避免丢掉条件','#article/context-state','检查对象、限制和出处是否仍在，而不是只看摘要是否简短。'),read('上下文、记忆与训练分别是什么','#article/ai-context','区分本次输入、产品外部保存与模型参数改变。')]),
        neighbor:read('Agent · 状态与记忆','#map/agent?node=state&depth=mechanism','Agent 的下一步依赖任务状态；上下文工程负责让当次模型调用得到合适的状态片段。'),frontier:'已区分历史、状态、外部保存与重新传入；长期记忆设计、版本合并、检索策略和任务恢复实现尚未展开。'},
      {id:'evaluation',title:'怎样知道一次改写或组装真的更合用',short:'验证与边界',question:'感觉更好了，能在哪些条件下重新检查？',contains:['成功标准','对照样例','错误定位','回归与适用范围'],foundation:'context-tests',
        intro:stage('先把好坏变成可以观察的差别','检查目标是否回答、条件是否保留、依据是否充分，以及格式能否使用。不要只凭一次流畅回答判断一个方法。',[read('提示与上下文怎样被检验','#article/context-evaluation','把任务标准、样例和错误类型连起来，知道该改哪一层。')]),
        mechanism:stage('在相同条件下比较，并保留没见过的例子','使用同一组任务、材料和检查标准比较改动；反复调试过的例子之外，还需要新的例子观察是否泛化。',[read('对照与验证','#article/context-tests','补上样例、评价规则、重复观察和结果范围的基础。'),read('RAG 为什么需要分层评估','#article/rag-metrics','当资料或生成出错时，不把所有问题都归到提示措辞。')]),
        boundary:stage('通过测试，不等于获得永久保证','问题、资料、模型与系统行为都会变化；自动评审也可能有偏差。验证结果要带着范围，更新后继续检查。',[read('改动之后为什么仍需回看','#article/context-evaluation','把提示版本、输入变化和真实任务条件对应起来。'),read('软件验证与边界样例','#article/comp-testing','用熟悉的软件测试视角理解回归检查与未覆盖的情形。')]),
        neighbor:read('大语言模型 · 评估与边界','#map/llm?node=evaluation&depth=mechanism','输入组织的效果依赖模型与任务，指标和证据只能说明其被检查到的条件。'),frontier:'已展开任务标准、对照样例、分层定位和回归检查；统计评测、自动优化、多轮轨迹评估与专业领域标准尚未展开。'}
    ],
    foundations:[
      {id:'context-task-contract',title:'输入、输出与约束',why:'先把希望、提供的材料、交付形式和完成条件分开，再理解怎样组织指令与示例。'},
      {id:'context-budget',title:'token、窗口与输入预算',why:'理解本次可以带入多少信息，以及旧消息、材料和输出空间为什么需要取舍。'},
      {id:'context-tests',title:'对照与验证',why:'把“感觉更好了”变成可检查的差别，并知道结果只覆盖哪些任务与条件。'}
    ]
  };
})();
