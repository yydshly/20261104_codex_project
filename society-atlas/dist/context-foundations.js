/* Foundations for understanding prompting and context engineering.
 * Editorial explanations use primary sources checked 2026-11-05. */
(() => {
  'use strict';
  const section=(title,text)=>({title,text});
  const step=(title,text)=>({title,text});
  const source=(title,url)=>({title,url});
  const refs={
    prompting:source('Anthropic · 提示工程的前提与适用范围','https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview'),
    evaluation:source('Anthropic · 定义成功标准并构建评估','https://platform.claude.com/docs/en/test-and-evaluate/develop-tests'),
    context:source('Anthropic · Effective context engineering for AI agents','https://www.anthropic.com/research/effective-context-engineering-for-ai-agents'),
    window:source('Claude 文档 · 上下文窗口与输入输出计量','https://platform.claude.com/docs/en/build-with-claude/context-windows'),
    middle:source('Liu 等 · Lost in the Middle：长上下文利用的实验研究','https://arxiv.org/abs/2307.03172')
  };
  window.CONTEXT_FOUNDATIONS={
    'context-task-contract':{
      id:'context-task-contract',domain:'ai',foundation:true,contextNode:'task',
      title:'怎样把“帮我做一下”变成可以核对的任务？',
      eyebrow:'提示词与上下文工程 · 随用基础 · 输入、输出与约束',
      lead:'在写更长的提示之前，可以先画出四个格子：提供什么、希望得到什么、有哪些限制、拿什么判断完成。这个约定帮助人说明任务，也帮助检查结果；它不会凭空补出资料或让模型获得新权限。',
      scope:'这里把“任务约定”作为通俗的分析方法，不是模型服务的统一协议。它适合认识一次文本任务的基本组成；复杂协作还需要需求分析、权限与工程实现。',
      sections:[
        section('输入、输出和目标不是同一件事','目标说明为什么要做，例如帮助读者判断珍本能否外借；输入是这次提供的问题与规则；输出则是希望收到的答复。三者混在一起时，人也可能不知道该补哪份资料或怎样检查。先把它们写开，可以发现“要求回答现行规则，却只提供旧版通知”这样的缺口。任务清楚不等于条件充分，资料不足时可以明确需要补什么。'),
        section('约束说明边界，标准说明怎样检查','约束可以是只依据给定资料、保留出处、控制长度或遇到冲突时说明差异。检查标准应对应任务：借阅答复要分清普通资料与珍本，并保留“仅限馆内阅览”的限制。若只要求回答简短，模型即使写成一句话，也可能遗漏关键条件。可以分别检查内容、依据与格式；这些要求不是一次得分就能替代的。'),
        section('把未确定的内容保留下来','任务说明不能把尚未查证的假设写成事实。例如“请解释为什么珍本可以外借”已经把答案放进问题，但提供的规则可能恰好相反。更合适的任务约定会允许核对前提、指出冲突和报告缺口。需要采取外部行动时，还应另行明确行动范围；在提示中写“可以发布”，不等于程序已经获得发布权限或实际执行成功。')
      ],
      example:{title:'构造示意：把同一个借阅问题拆成四格',text:'星桥资料馆规则写着：“普通资料可外借。珍本仅限馆内阅览。”目标是回答读者“珍本能带走吗”；输入是问题和这份规则；输出是一段带依据的说明；检查条件是分清资料类别、保留馆内限制、不编造例外。如果只给“帮我写一段借阅说明”，这些选择仍然没有明确。这里比较任务说明是否完整，不预设真实模型会输出什么。'},
      takeaway:'先把目标、材料、输出和检查条件分开。提示写清的是任务要求，事实依据、能力与行动权限仍需各自确认。',
      visual:{kind:'flow',steps:[step('说明目标','帮助谁解决什么问题'),step('确认输入','这次有哪些材料，哪些仍然缺失'),step('约定输出与限制','要回答什么、保留什么、不得扩大什么'),step('核对完成条件','内容、依据与形式分别检查')]},
      related:['context-task','context-instructions','context-examples','context-tests'],
      crossLinks:[
        {href:'#map/context?node=task&depth=mechanism',title:'回到地图：怎样组织一个任务？',reason:'从这四个格子继续选择指令、例子或材料组织的深入路径。'},
        {href:'#map/agent?node=goals&depth=mechanism',title:'连接 Agent：目标怎样走向行动？',reason:'输入输出约定可以说明本次调用，连续任务还需要目标拆解、状态与完成检查。'},
        {href:'#domain/computing?direction=comp-testing',title:'连接软件验证：怎样写可检查的预期？',reason:'把“应该好用”变成具体条件，是检查模型结果与软件行为的共同起点。'}
      ],
      sources:[refs.prompting,refs.evaluation]
    },
    'context-budget':{
      id:'context-budget',domain:'ai',foundation:true,contextNode:'selection',
      title:'一次能放多少信息，为什么还需要选择？',
      eyebrow:'提示词与上下文工程 · 随用基础 · token、窗口与预算',
      lead:'语言模型处理的输入有长度限制，而“长度”通常按 token 等模型处理单位计量，不是直接按汉字或英文单词数计算。理解这个窗口之后，还要追问：有限空间里，哪些内容真正影响本题？',
      scope:'这里只解释常见文本语言模型的计量与取舍。具体窗口、输入输出限制、工具或推理内容如何计数，依模型与接口而定；图解使用的格子是教学单位，不是真实 token 统计。',
      sections:[
        section('token 是处理单位，字数只是表面长度','文字会经过分词，变成模型使用的片段与编号。同一个汉字、英文单词或符号，不必固定对应一个 token；不同分词器也可能切得不同。因此不能把“这段有多少字”直接当成精确预算。想知道实际请求的长度，需要使用对应模型支持的计数方式，并把消息结构、工具说明等实际送入的内容一起考虑。这里只需要先认识单位差异，不必先掌握分词算法。'),
        section('窗口限制的是一次可处理范围，不是整个资料库','任务指令、当前问题、已选示例、部分历史、检索材料与工具结果，都可能组成模型这次看到的输入。常见接口还需要为生成的输出留出空间，并可能另有限制；具体计量应以所用接口为准。资料保存在外部库里并不占据这次输入，直到系统把它取出并传入。反过来，聊天界面里曾经出现过的内容，也可能被产品省略或概括，不能仅凭界面记录推断本次模型看到了全部。'),
        section('能装下和能用好，是两次检查','即使容量允许全部放入，重复材料、过期说明和不相关历史仍可能干扰使用。长上下文研究在特定任务与模型中观察到材料位置会影响结果，这支持继续检查组织方式，而不是推出所有模型都遵循同一规则。筛选和压缩有助于控制输入，但要保住对象、条件、否定、例外与出处。窗口变大不免除选择，摘要变短也不能说明关键信息仍然完整。')
      ],
      example:{title:'构造示意：空间留给了重复背景，还是限制条件？',text:'为了回答星桥资料馆珍本能否带走，本次需要问题、现行规则和“珍本仅限馆内阅览”的条件。若把同一通知的多份转载与无关聊天历史放在前面，有限输入可能没有留下完整规则的位置。另一种组装去掉重复内容，却保留普通资料与珍本的区别以及出处。图解用人为格子放大这种差别；不能用格子推算真实模型的 token、费用或正确率。'},
      takeaway:'先确认实际送入什么、怎样计量，再决定保留哪些信息。窗口只是容量边界，材料是否充分、适用并被正确使用还要继续检查。',
      visual:{kind:'flow',steps:[step('列出输入来源','指令、问题、示例、历史、资料与工具结果'),step('按实际单位计量','token 不等于固定字数；接口计量规则不同'),step('分配输入输出空间','留出生成空间，再选择和去除重复'),step('检查意义是否保留','对象、条件、例外和出处仍能相互对应')]},
      related:['context-selection','context-state','llm-tokens','rag-context'],
      crossLinks:[
        {href:'#map/context?node=selection&depth=mechanism',title:'回到地图：材料怎样被选入本次输入？',reason:'计量帮助确定空间，下一步要按任务选择并保留必要的关系。'},
        {href:'#map/llm?node=representation&depth=intro',title:'连接语言模型：文字怎样变成 token？',reason:'如果想了解计量单位从哪里来，可以继续看分词、编号与表示。'},
        {href:'#map/rag?node=context&depth=mechanism',title:'连接 RAG：检索材料怎样进入窗口？',reason:'候选片段需要筛选、补充条件与来源，才成为模型本次可以使用的上下文。'}
      ],
      sources:[refs.window,refs.context,refs.middle]
    },
    'context-tests':{
      id:'context-tests',domain:'ai',foundation:true,contextNode:'evaluation',
      title:'怎样判断改写提示或调整材料后，结果真的更合用？',
      eyebrow:'提示词与上下文工程 · 随用基础 · 对照与验证',
      lead:'一份回答读起来更好，只说明你观察到了这一次结果。要判断某个改动是否有帮助，需要固定比较条件、说明检查标准，并观察它在不同例子中带来了什么变化。',
      scope:'这里提供日常理解评估的入门框架，不把少量示例当作统计证明。真正比较模型或系统，还需要合适的样本、重复次数、评价方法与不确定性分析。',
      sections:[
        section('先写检查标准，再看输出是否满足','如果任务是解释借阅规则，可以检查是否区分资料类别、是否保留馆内限制、引用是否对应原文。若同时要求固定字段，还要单独检查能否解析。标准应在比较前写清，避免看到某个输出后才改变“好”的定义。比较内容与格式时，可以允许不同表达，只要它们同样支持任务；只检查某个词是否出现，可能漏掉否定关系或适用范围。'),
        section('把改动和其他条件分开观察','比较两个提示版本时，尽量保持问题、资料、模型和可控制的生成设置一致，记录改了什么。模型输出可能存在变化，必要时重复观察。若同时更换模型、更新知识库又改写指令，很难知道结果变化主要来自哪一处。可以按错误位置决定下一次改动：材料缺失先补材料，条件在摘要中消失就检查压缩，要求不清才进一步改写任务。'),
        section('用新例子和反例检查能否推广','在一批例子上反复调好之后，还需要没参与调试的样例。普通资料、珍本、材料缺失、旧版冲突等情形可以暴露不同缺口；只测一类顺利问题，不能说明边界也可靠。自动评审方便扩大检查范围，但评分模型也可能误判，应抽样核对理由。保留问题集、材料与提示版本，发生更新时重新检查；通过测试表示在这些条件下取得了这些结果，不是永久正确的证明。')
      ],
      example:{title:'构造示意：用三个问题检查同一份规则',text:'星桥资料馆现行规则是“普通资料可外借。珍本仅限馆内阅览”。可以分别问普通资料能否带走、珍本能否带走，以及没有提供现行规则时该怎样回答。前两问检查对象区分，第三问检查是否说明依据不足。再换一个未用于调试的表达，例如“珍本借回家看可以吗”，观察原要求是否仍被正确理解。这些是待运行的测试设计，不是已经测得的模型成绩。'},
      takeaway:'固定任务与条件，比较具体差别，再用新情形检查。评估帮助发现可以改进的部分，也帮助说明还没有验证的范围。',
      visual:{kind:'flow',steps:[step('写明成功标准','内容、依据、格式和任务边界分别约定'),step('准备可比较的样例','普通、例外、缺失与冲突都要有代表'),step('记录改动与结果','固定其他条件，必要时重复观察并核对评分'),step('用新样例继续检查','保留未参与调试的情形，更新后回归验证')]},
      related:['context-evaluation','context-task','rag-metrics','comp-testing'],
      crossLinks:[
        {href:'#map/context?node=evaluation&depth=mechanism',title:'回到地图：沿错误位置选择改进方向',reason:'把比较结果接回任务、材料、状态和生成的不同环节。'},
        {href:'#map/rag?node=evaluation&depth=mechanism',title:'连接 RAG：错误发生在检索还是生成？',reason:'输入材料与回答分别检查，才能避免把所有失败归于提示写法。'},
        {href:'#map/llm?node=evaluation&depth=boundary',title:'连接语言模型：分数覆盖了哪些条件？',reason:'评估依赖任务与样本，模型或使用环境改变以后需要继续核查。'}
      ],
      sources:[refs.evaluation,refs.prompting]
    }
  };
})();
