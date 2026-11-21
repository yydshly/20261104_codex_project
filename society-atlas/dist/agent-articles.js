/* Original public-science explanations of common LLM-based agent systems.
 * Examples and diagrams are constructed teaching material, not live executions.
 */
(() => {
  'use strict';
  const section=(title,text)=>({title,text});
  const step=(title,text)=>({title,text});
  const link=(href,title,reason)=>({href,title,reason});
  const refs={
    patterns:{title:'Anthropic · Building effective agents：工作流与动态行动',url:'https://www.anthropic.com/research/building-effective-agents'},
    workflows:{title:'LangGraph 官方文档 · Workflows and agents',url:'https://docs.langchain.com/oss/javascript/langgraph/workflows-agents'},
    tools:{title:'MCP 工具规范 · 工具描述、输入、结果与错误',url:'https://modelcontextprotocol.io/specification/2025-06-18/server/tools'},
    architecture:{title:'MCP 官方文档 · 应用、连接与外部能力的分工',url:'https://modelcontextprotocol.io/docs/learn/architecture'},
    memory:{title:'LangChain 官方文档 · 会话内状态与跨会话记忆',url:'https://docs.langchain.com/oss/javascript/concepts/memory'},
    context:{title:'Anthropic · Effective context engineering for AI agents',url:'https://www.anthropic.com/research/effective-context-engineering-for-ai-agents'},
    retrieval:{title:'LangChain 官方文档 · 检索、RAG 与 Agentic RAG',url:'https://docs.langchain.com/oss/javascript/deepagents/retrieval'},
    provenance:{title:'W3C · PROV：资料的来源、形成过程与版本',url:'https://www.w3.org/TR/prov-overview/'},
    interrupts:{title:'LangGraph 官方文档 · 暂停、外部输入与恢复',url:'https://docs.langchain.com/oss/javascript/langgraph/interrupts'},
    evaluation:{title:'Anthropic · Demystifying evals for AI agents',url:'https://www.anthropic.com/research/demystifying-evals-for-ai-agents'}
  };
  window.AGENT_ARTICLES={
    'agent-goals':{
      id:'agent-goals',domain:'ai',agentNode:'goals',title:'一句“帮我完成”，怎样变成可以判断的任务？',eyebrow:'AI 智能体 · 目标与任务',
      lead:'理解 Agent，可以先从任务开始：要改变什么、需要交出什么、怎样知道做到了？目标提供方向，条件限定可走的路，完成依据则决定什么时候可以停下。这三件事越清楚，越容易看懂后面的计划、工具与检查为何存在。',
      scope:'本页讨论常见的语言模型驱动任务系统。任务拆分可以由人、规则或模型共同完成，并不意味着所有任务都需要 Agent。',
      sections:[
        section('愿望需要落到可观察的结果','“帮我了解一个领域”可以对应很多不同结果：一张结构图、一组入门资料，或一份带来源的比较。若不知道需要哪一种，系统可能很忙，却没有交出需要的东西。把对象、范围和交付形式说清，再说明怎样核对，可以使宽泛愿望变成具体任务。例如“找三份入门材料并说明各自适合什么问题”，比只说“查一下”更容易判断结果是否够用。'),
        section('拆分任务，是发现依赖而不只是列清单','有些步骤要等待前面的信息：先知道资料针对谁，才能判断是否适合；先得到当前状态，才能决定是否需要修改。计划把这些依赖暂时排列起来。新结果可能暴露缺口，于是需要补查或调整顺序。计划可以修订，已经确认的目标和限制却不能因为某一步方便执行就被悄悄换掉。'),
        section('把完成条件与停止条件分别写出来','完成条件说明什么结果算达到目的；停止条件说明即使尚未完成，什么时候也应结束、交回问题或请求缺失信息。例如资料不足时保留“未核实”，尝试次数用完时报告已有发现，而不是无限重复搜索。判断终点需要任务证据，不能只靠模型输出一句“已完成”。')
      ],
      example:{title:'构造示意：为一位新同事整理入门资料',text:'目标是找到三份适合初学者的材料，分别解释基础概念、常见用途与局限，并记录出处。只找到标题还不够；找到五份重复转载也不等于覆盖三个方面。若关键材料无法访问，可以交出已核实的部分和缺口，让下一步有明确方向。'},
      takeaway:'先问交付什么、受哪些条件限制、凭什么算完成，再看系统怎样规划与行动。',
      visual:{kind:'flow',steps:[step('提出愿望','明确想理解或改变什么'),step('界定任务','对象、范围、交付形式与限制'),step('拆出依赖','哪些信息要先得到，哪些步骤可调整'),step('约定终点','完成依据，以及未完成时怎样停止')]},
      related:['agent-composition','agent-loop','agent-control','agent-control-flow'],
      crossLinks:[link('#article/comp-algorithms','连接算法：目标怎样变成步骤？','任务拆分需要认识顺序、条件和依赖，算法提供了更一般的计算视角。'),link('#article/education-evidence','连接证据判断：怎样知道已经做到？','完成声明是一种主张，需要对应到实际可检查的结果。')],
      sources:[refs.evaluation,refs.workflows]
    },
    'agent-loop':{
      id:'agent-loop',domain:'ai',agentNode:'loop',title:'Agent 为什么会行动一轮，再决定下一轮？',eyebrow:'AI 智能体 · 行动循环',
      lead:'任务开始时，系统往往还不知道所有中间结果。它先根据当前信息选择下一步，交给工具执行，再读取结果，决定继续、换路还是停止。把这条反馈回路画出来，就能分清连续行动与单次生成，也能找到错误是在哪一环进入的。',
      scope:'这是常见语言模型型 Agent 的控制循环示意。真实系统可以并行、分层或使用多个模型；图中的分支与工具结果由编辑预设，未调用真实 Agent。',
      sections:[
        section('下一步来自当前任务与可见状态','模型接收目标、已有材料、上一步结果和可用工具说明，可能生成回答，也可能提出一次工具调用。程序负责辨认输出类型并按规则处理。“先计划后行动”并不一定意味着先写出一份完整长计划；系统也可以在有限范围内逐步选择。重要的是每次选择都能接上当前需要，而不是只让文本变得更长。'),
        section('工具结果把外部变化带回循环','一次查询可能找到资料，也可能返回空结果或访问失败。程序把这些实际结果带回下一轮，系统才有条件改写查询、补充条件或结束。这里的“观察”指接收到的返回信息，不表示系统已经看见外部世界的全部事实。读错返回值、忽略错误状态或使用过期结果，都可能使后续步骤建立在错误前提上。'),
        section('反馈要能够改变路径，也要能够让循环结束','如果每次失败后都重复完全相同的请求，循环只是消耗资源。可以设置重试上限、时间或调用预算，并在信息不足、权限不够或目标完成时走向不同出口。固定工作流的主要路径通常事先规定；这里所说的 Agent 则允许模型在约束内影响后续行动。二者可以组合使用，不是能力高低的两端。')
      ],
      example:{title:'构造示意：搜索失败以后有三条路',text:'资料助手查询一个标题，工具返回“没有匹配结果”。若还有查询预算，它可以改用作者和主题；若关键条件缺失，可以把问题交还给使用者；若已达到停止条件，就保留失败信息并结束。本页切换分支只展示控制关系，不代表真实模型作出了这些决定。'},
      takeaway:'Agent 的循环把选择、执行和返回结果连起来；能继续行动，也需要知道何时换路和停止。',
      visual:{kind:'flow',steps:[step('读取任务与状态','目标、已有结果、限制和可用工具'),step('选择下一步','生成回答或提出工具调用'),step('执行并返回','外部程序给出结果或错误'),step('更新与判断','继续循环、改道、交还或停止')]},
      related:['agent-goals','agent-tools','agent-state','agent-control-flow'],
      crossLinks:[link('#map/llm?node=generation&depth=intro','回到大语言模型：一次输出怎样生成？','模型生成一次回答或调用提议，循环则由外围程序把多次输出和执行连接起来。'),link('#article/education-feedback','连接反馈与修正：结果怎样改变下一步？','接收到反馈之后还要辨认差异，并把它用于后续选择。')],
      sources:[refs.workflows,refs.patterns]
    },
    'agent-tools':{
      id:'agent-tools',domain:'ai',agentNode:'tools',title:'模型说“调用工具”，是谁真正完成了动作？',eyebrow:'AI 智能体 · 工具与接口',
      lead:'语言模型可以提出查找、计算或修改的请求，但实际读取数据库、运行程序或写入系统的是外部软件。工具接口把请求和执行连接起来；它规定可调用什么、要提供哪些参数、怎样返回结果，以及哪里需要检查权限。',
      scope:'本页讲工具调用的一般分工，不依赖某个框架。MCP 是连接方式之一，并非 Agent 的必要条件；示意操作不会查询、写入或发送真实数据。',
      sections:[
        section('工具描述让动作有明确的入口','一个工具通常需要名称、用途、输入结构和结果说明。例如“查找资料”需要查询条件，“写入资料卡”需要目标位置和具体内容。模型看到描述后可以选择工具并填写参数，程序再检查格式和允许范围。参数结构正确，只说明请求满足某些形式要求；内容是否合理、目标是否选对，还需要任务与权限层面的判断。'),
        section('调用提议、实际执行、确认结果是三个阶段','模型生成一段像调用的内容，并不会自动让外部动作发生。运行程序决定是否执行，工具返回结果或错误，系统再核对发生了什么。发送请求成功也未必等于任务成功：例如写入接口返回受理信息之后，仍可能需要查询实际记录。把这几个阶段分开，就不会把“准备修改”误读为“已经改好”。'),
        section('读取与写入的后果不同','查阅一份资料和修改它，需要不同的控制。只读请求也要遵守数据访问范围；写入、发送或删除还会改变外部状态，可能需要更具体的授权、确认与结果检查。重试尤其要看动作性质：再次查询通常与再次提交订单不同。是否允许自动执行，应由明确的系统规则决定，不能只由模型对工具的文字描述决定。')
      ],
      example:{title:'构造示意：查询资料卡，与覆盖资料卡',text:'查询工具接收资料编号，返回标题、来源和版本；写入工具还需要新内容、目标编号与相应权限。图解可以比较两种动作经过哪些检查，但不会真正改动任何资料。即使模型填出了完整参数，也只是进入执行前的一道环节。'},
      takeaway:'工具调用把模型的提议交给程序执行；接口、权限与结果核验共同决定实际发生什么。',
      visual:{kind:'flow',steps:[step('工具说明','名称、用途、参数与返回约定'),step('调用提议','模型选择工具并填写参数'),step('程序检查与执行','校验范围、权限和操作条件'),step('返回与核验','区分错误、受理与实际完成')]},
      related:['agent-interfaces','agent-loop','agent-control','ai-agent'],
      crossLinks:[link('#article/comp-systems','连接软件系统：一次请求怎样被接力？','接口两端各有职责，模型只是整个请求链条中的一个环节。'),link('#map/llm?node=adaptation&depth=boundary','连接大语言模型：能力怎样进入应用？','能生成调用参数，与外部系统允许执行，是不同层次的能力。')],
      sources:[refs.tools,refs.architecture,refs.interrupts]
    },
    'agent-state':{
      id:'agent-state',domain:'ai',agentNode:'state',title:'连续做几步时，Agent 怎样知道已经做到哪里？',eyebrow:'AI 智能体 · 状态、上下文与记忆',
      lead:'一次任务会留下目标、查询结果、已做动作和未解决问题。这些信息构成任务状态；其中一部分会被选入下一次模型输入，另一些可能保存在外部存储。分清状态、上下文和长期记忆，就能理解任务怎样接续，也能避免把保存信息误认为模型重新训练。',
      scope:'本页描述常见应用层机制，具体产品保存哪些信息、保存多久各不相同。长期记忆不是所有 Agent 的必备部件；本网页不会自动建立你的 Agent 记忆。',
      sections:[
        section('状态记录当前处境，不只有聊天文字','状态可以包括任务目标、已核实的资料编号、工具返回值、剩余预算和等待条件。它回答的是“现在处于什么情况”。如果只保留最终回答，系统就可能忘记哪些尝试已经失败、哪些动作已经执行。状态需要由实际事件更新；模型自行声称“已保存”不能替代真实的保存结果。'),
        section('上下文是这一次模型能看到的输入','外部保存了许多记录，不表示模型在每次调用时都看到了全部。应用需要选择当前相关的内容，组织成输入；过长或无关的信息可能增加成本，也可能干扰使用。摘要可以缩短内容，却可能遗漏关键条件。因此重要的来源、原始结果和状态标记，常常需要能够回查，而不能只剩一段越来越模糊的总结。'),
        section('跨会话记忆需要另一个保存与取用过程','如果希望下一次任务还能取用偏好或经验，通常要把信息存到会话之外，并在合适时机重新取回。哪些值得保存、是否过时、能否修正，都属于系统设计。这样保存信息并不等于更新语言模型参数。恢复一个任务还要核对外部状态：旧记录写着“尚未提交”，也可能因为上次返回中断而与实际情况不同。')
      ],
      example:{title:'构造示意：任务中断后的两张清单',text:'任务清单记着“已找到两份资料，第三份待核实”；工具记录显示“第二份已加入草稿”。恢复后可以先检查草稿，再继续缺失部分。若只把任务从头执行一遍，就可能重复写入。这里演示的是状态与结果的关系，不是一次真实恢复操作。'},
      takeaway:'状态描述做到哪里，上下文是本次送给模型的材料，长期记忆是跨会话保存与取用的机制；三者都不同于训练参数。',
      visual:{kind:'compare',steps:[step('任务状态','目标、进度、结果与剩余限制'),step('本次上下文','从状态与资料中选入模型的内容'),step('外部记忆','按设计跨会话保存并再次取用'),step('模型参数','训练形成的计算方式，不因保存记录自动更新')]},
      related:['ai-context','agent-loop','agent-knowledge','agent-control'],
      crossLinks:[link('#map/llm?node=context&depth=boundary','回到大语言模型：输入与参数有什么不同？','模型能使用哪些内容，要看本次上下文与已有参数，不能只看系统存了多少资料。'),link('#article/info-description','连接信息描述：怎样标清一条记录？','记录对象、出处和状态，才能在恢复任务时辨认它究竟描述什么。')],
      sources:[refs.memory,refs.context,refs.interrupts]
    },
    'agent-knowledge':{
      id:'agent-knowledge',domain:'ai',agentNode:'knowledge',title:'Agent 找到一份资料以后，为什么还没得到答案？',eyebrow:'AI 智能体 · 资料、检索与信息组织',
      lead:'资料助手能否给出有用结果，不只取决于模型会不会写。资料要能被描述、定位、筛选与追溯，检索才能把当前问题接到适用材料上；Agent 再决定何时查、查什么、是否需要补查。找到相似内容只是这条链的一步。',
      scope:'本页讨论取用外部资料的 Agent。检索可以使用关键词、结构化查询或向量等方法，向量数据库不是必选；示例资料与版本均为教学构造。',
      sections:[
        section('信息组织让资料具有可辨认的身份','同一个标题可能有多个版本，不同网页也可能转载同一份材料。记录作者、出处、日期、适用对象和资料之间的关系，可以让系统辨认它们是否重复、是否过时。索引提供从线索到位置的查找通道。Agent 可以使用这些组织成果，但不会因为接上一个搜索框就自动获得完整、可靠的知识库。'),
        section('检索给出候选，使用前还要检查条件','系统把问题转成查询，取得候选资料，再选择内容放入模型上下文。相关性回答“像不像在谈这个问题”，来源和适用条件则回答“能支持这次判断吗”。例如关于旧版流程的准确说明，可能不适合回答当前流程；来自同一转述源的多份材料，也未必构成多条独立依据。'),
        section('Agent 可以调整检索，但材料仍需对应主张','固定的检索增强流程可以先检索一次再生成；Agent 型检索则可能依据中间结果，决定是否再次查询或换一个来源。增加查询次数不保证得到正确答案，还要检查引用是否真的支持回答中的具体说法。外部网页和工具结果提供材料，不应仅因为其中写了命令句就成为系统的新任务。')
      ],
      example:{title:'构造示意：两份同名的内部说明',text:'旧版资料写“每周五提交”，新版本写“每周四提交”，两者标题相同。若问题针对当前流程，应先确认生效范围与版本关系；若问历史情况，旧版反而可能适用。图解切换资料只展示这些判断条件，不连接真实组织或制度。'},
      takeaway:'Agent 决定怎样查，信息组织帮助辨认与找到材料，模型据此生成表达；证据是否支持结论仍需逐项判断。',
      visual:{kind:'flow',steps:[step('描述与组织','对象、主题、出处、版本和关系'),step('形成查询','把当前需要转成可检索的条件'),step('检索与筛选','取得候选，检查相关性与适用范围'),step('使用与追溯','引用材料，核对具体主张并保留缺口')]},
      related:['info-retrieval','info-provenance','agent-evidence','agent-state'],
      crossLinks:[link('#domain/information?direction=provenance','展开信息组织：来源与版本','当答案依赖外部材料，需要继续理解资料怎样形成和更新。'),link('#map/llm?node=context&depth=intro','回到大语言模型：材料怎样进入一次输入？','检索得到的内容可以被加入上下文；这与重新训练模型是两种过程。')],
      sources:[refs.retrieval,refs.provenance,refs.context]
    },
    'agent-control':{
      id:'agent-control',domain:'ai',agentNode:'evaluation',title:'会连续行动之后，怎样知道该停、能做、做对了？',eyebrow:'AI 智能体 · 控制与评估',
      lead:'Agent 的评价对象是一段行动过程及其结果。除了回答是否通顺，还要看有没有完成任务、是否遵守范围、花了多少资源，以及外部系统实际发生了什么。权限、停止条件和评估，为这段过程提供可以检查的边界。',
      scope:'本页给出通用认识框架，不是某个行业的合规方案。不同任务的权限、代价与成功标准不同；出现确认环节也不意味着所有风险已经被消除。',
      sections:[
        section('权限限制能做什么，不能只写在愿望里','“完成目标”不等于可以使用任意资料或执行任意动作。应用可以限制可用工具、可访问对象与允许的操作，并把特定动作停在确认点。人要判断的应是具体请求和影响，而不只是一个含糊的“继续吗”。这些控制需要由系统实际实施；模型生成一句遵守规则的承诺，不能替代权限检查。'),
        section('停止并不只有成功这一种原因','任务完成、工具不可用、信息不足、达到调用或时间上限，都可能使流程结束。结束时应区分已经确认的结果、未完成的部分和停止原因。这样才能决定是否换资料、补充条件或交由其他方式处理。让系统无止境重试，既不能证明它更自主，也不能证明任务会最终成功。'),
        section('结果、过程与成本要分开观察','一次评估可以检查最终交付物或外部状态，也可以检查途中是否调用了不适当的工具、漏掉关键条件或重复操作。结果文字声称成功，与实际记录已经存在并不是同一件事。由于输入、环境和模型输出可能变化，需要在代表性任务和多次尝试中观察表现；某个演示成功，不能自动代表所有情境都可靠。')
      ],
      example:{title:'构造示意：报告写好了，任务真的完成了吗？',text:'资料助手生成了一份流畅报告，但三条引用中有一条指向旧版材料，另一个链接无法打开。可以分别记录格式完成、事实依据缺口与检索耗时，再决定补查还是交付带缺口说明的版本。用一个“成功”标签掩盖这些差异，会让下一次改进失去方向。'},
      takeaway:'控制规定可行动的范围和终点，评估检查实际结果及过程；完成声明需要可以对照的证据。',
      visual:{kind:'compare',steps:[step('行动之前','范围、权限、参数与必要确认'),step('行动之中','工具结果、错误、重复与剩余预算'),step('行动结束','完成、暂停或停止的明确原因'),step('结果评估','任务结果、遵守条件、时间与成本')]},
      related:['agent-tools','agent-goals','agent-evidence','comp-testing'],
      crossLinks:[link('#article/comp-testing','连接软件验证：怎么把要求变成检查？','需要把想要的行为写成可观察条件，再用不同情境核对。'),link('#article/education-evidence','连接证据判断：记录支持了什么？','工具日志与最终状态是判断材料，还需要分清观察和解释。')],
      sources:[refs.evaluation,refs.interrupts,refs.tools]
    },
    'agent-composition':{
      id:'agent-composition',domain:'ai',agentNode:'goals',title:'Agent、大语言模型、信息组织，分别负责哪一层？',eyebrow:'AI 智能体 · 放回更大的知识地图',
      lead:'大语言模型是一种处理与生成信息的模型能力；Agent 是围绕任务，把模型、工具、状态和控制连接起来的一类系统；信息组织让外部材料可被辨认、查找和追溯。它们可以协作，却不处在同一个分类层级。',
      scope:'这里聚焦常见 LLM 型 Agent。“Agent”在不同资料中有不同边界，更广的智能体研究也包含不依赖大语言模型的系统。这是一张阅读关系图，不是唯一架构。',
      sections:[
        section('模型提供能力，系统组织一次又一次使用','模型可以解释输入、形成文本或提出调用参数。若只调用一次并返回答案，还看不到完整的行动循环。Agent 系统在外围接收任务、组织输入、连接工具、记录状态，再根据结果继续或停止。相同模型被放入不同系统，能接触的资料、采取的行动与完成任务的表现都可能不同。'),
        section('信息组织与工具补上模型之外的世界','资料的描述、分类、索引和来源帮助系统找到适合当前问题的材料。工具则提供查询、计算或改变外部状态的接口。检索也可以被包装成工具：Agent 选择何时调用，检索系统返回候选，模型使用筛选后的内容生成表达。信息组织因此既能服务人的浏览，也能服务 Agent 的取用，不只是某个模型内部的一层。'),
        section('看控制方式，比只看名称更有帮助','有的产品把预先规定的自动流程也称作 Agent，有的强调模型根据中间结果动态选路。可以追问：谁决定下一步、结果怎样反馈、在哪里停止？固定流程与动态选择可以组合，一个 Agent 也不必包含多个角色或长期记忆。先看任务需要，再理解增加某个部件解决了什么问题。')
      ],
      example:{title:'构造示意：同一份资料摘要的三种做法',text:'第一种把给定资料交给模型摘要；第二种先按固定流程检索再摘要；第三种让任务系统先查资料、发现版本冲突后补查，再决定是否提交摘要。三者都可能使用同一个模型，但信息来源与控制过程不同，不能仅凭最后那段文字判断架构。'},
      takeaway:'沿三条线继续看：模型怎样生成，任务系统怎样行动，外部信息怎样被组织与核查。',
      visual:{kind:'compare',steps:[step('大语言模型','处理当前输入，生成回答或调用提议'),step('Agent 系统','围绕任务协调模型、工具、状态与控制'),step('信息组织','描述、定位、关联并追溯外部材料'),step('工具与环境','真正查询、计算或执行，并返回结果')]},
      related:['agent-loop','agent-knowledge','agent-tools','llm-generation'],
      crossLinks:[link('#map/llm','展开大语言模型认知地图','继续理解模型内部的表示、上下文、生成、训练与适配。'),link('#domain/information','展开信息组织认知地图','继续理解资料怎样被描述、分类、关联、索引和检索。'),link('#article/comp-systems','连接软件与计算：系统怎样协作？','把模型和工具放进更一般的请求、接口与状态关系中理解。')],
      sources:[refs.patterns,refs.architecture,refs.retrieval]
    }
  };
})();
