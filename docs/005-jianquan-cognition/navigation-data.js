/* Editorial signposts: directions, depth, supporting ideas and neighboring fields.
 * These routes describe the available explanations, not a complete AI curriculum.
 */
(() => {
  'use strict';
  window.COGNITION_DATA = {
    ai: {
      scope: {
        outcome: '分清 AI、模型与产品讨论的是哪一层，再选择自己想深入的方向。',
        contains: ['AI 与机器学习的范围', '模型与完整系统', '建议与行动的边界'],
        steps: [
          { level: '建立直观认识', title: '先辨认几个常见概念', href: '#topic/ai-landscape', reason: '知道同属 AI 的应用，也可能处理不同问题、产生不同结果。' },
          { level: '看清组成关系', title: '把模型放回完整系统', href: '#topic/model-vs-system', reason: '继续区分模型能力、资料获取、界面和权限各自负责什么。' },
          { level: '理解能力边界', title: '从回答走到实际行动', href: '#topic/autonomy-boundaries', reason: '看清提供信息与执行操作之间，还有工具、授权和结果确认。' }
        ],
        foundations: [
          { title: '系统与部件', explanation: '一个软件通常由多个部分协作。某个部件给出正确结果，还需要其他部分把信息交到正确位置。', href: '#article/comp-systems', reason: '用一次网页请求，理解“模型只是系统的一部分”。' }
        ],
        neighbors: [
          { title: '往内：原理方法', href: '#domain/ai?direction=method', reason: '概念分清以后，可以继续追问能力怎样从数据和计算中产生。' },
          { title: '往外：软件与计算', href: '#domain/computing?direction=comp-systems', reason: '理解软件的连接与分工，能看清 AI 产品背后的组成。' }
        ],
        frontier: '这里建立概念关系；符号推理、搜索、机器人等分支的详细地图尚未展开。'
      },
      capability: {
        outcome: '把笼统的“AI 能做什么”拆成输入、任务、输出与成功条件。',
        contains: ['能力与任务匹配', '多模态输入的边界', '工具执行与结果确认'],
        steps: [
          { level: '从具体任务认识', title: '先把一个目标拆开', href: '#topic/task-fit', reason: '从会议纪要等例子，区分需要生成、提取、核对的不同环节。' },
          { level: '看清输入条件', title: '能接收图片，不等于看清全部', href: '#topic/multimodal-limits', reason: '理解输入缺失、模糊或遮挡，会怎样限制可得到的信息。' },
          { level: '理解应用边界', title: '怎样确认它真的完成了', href: '#topic/tool-actions', reason: '把语言中的“完成”与可以查看的执行结果对应起来。' }
        ],
        foundations: [
          { title: '输入、过程与输出', explanation: '描述一项任务时，先说提供什么、希望得到什么，以及怎样检查结果。输入缺失和过程出错，需要分别判断。', href: '#article/comp-algorithms', reason: '用查找步骤，理解目标如何变成可以处理的任务。' }
        ],
        neighbors: [
          { title: '往内：评估可信', href: '#domain/ai?direction=evaluation', reason: '能力介绍回答能尝试什么，评估进一步回答在什么条件下做得怎样。' },
          { title: '往外：软件验证', href: '#domain/computing?direction=comp-testing', reason: '一次实际操作涉及多个环节，需要把成功条件写成可检查的行为。' }
        ],
        frontier: '这里提供任务分析的起点；各类视觉、语音、规划任务的技术方法和实测比较尚未展开。'
      },
      method: {
        outcome: '区分训练、使用与保存信息，理解为什么见过的例子不能保证新情境中的表现。',
        contains: ['训练与推理', '上下文、产品记忆与参数', '泛化与过拟合', '提示词的作用范围'],
        steps: [
          { level: '建立直观认识', title: '分清学习模型与使用模型', href: '#topic/training-inference', reason: '先知道一次聊天提供信息，与训练时改变模型是不同过程。' },
          { level: '展开工作机制', title: '沿着一句话，看信息去了哪里', href: '#article/ai-context', reason: '用图解比较当前上下文、产品保存的记忆和另行训练。' },
          { level: '继续理解边界', title: '为什么换个问题就可能失败', href: '#topic/generalization', reason: '从旧包装与新包装的例子，认识熟悉样例和新情境之间的差别。' }
        ],
        foundations: [
          { title: '数据表示', explanation: '文字、图片等信息需要以计算机可以处理的形式进入系统。保留哪些信息、怎样表示，会影响后续能处理什么。', href: '#article/comp-data', reason: '先理解信息怎样进入计算机，再进一步理解模型处理的输入。' },
          { title: '生成与核查', explanation: '生成是在给定输入下形成输出；核查则把其中的主张与材料、条件对照。回答读起来顺畅，还需要另看它的依据。', href: '#article/ai-generation', reason: '把生成过程与事实支持区分开，继续理解模型输出的边界。' }
        ],
        neighbors: [
          { title: '往内：数据资源', href: '#domain/ai?direction=resource', reason: '理解学习过程后，可以追问样例从哪里来、覆盖了哪些情形。' },
          { title: '往外：人的学习与迁移', href: '#domain/education?direction=learning', reason: '比较“见过”与“能解释新例子”，同时留意人的理解与机器训练并不相同。' }
        ],
        frontier: '大语言模型子图已补上概率、向量、优化与注意力的入门解释；完整数学推导、其他模型路线与专业实践仍需继续展开。'
      },
      resource: {
        outcome: '看见模型背后的数据、访问条件与运行资源，理解它们如何限制实际能力。',
        contains: ['数据质量与覆盖', '访问权限与用途', '计算与运行约束'],
        steps: [
          { level: '先看材料', title: '更多数据，补上了什么', href: '#topic/data-quality', reason: '认识数量、质量与情形覆盖之间的区别。' },
          { level: '追问信息边界', title: '能读到，不等于任何时候都能用', href: '#topic/privacy-permission', reason: '将资料是否存在、谁能读取、用于什么问题分别考虑。' },
          { level: '放回运行条件', title: '功能怎样持续运转', href: '#topic/compute-constraints', reason: '理解实时与批量等使用方式，会提出不同的计算和维护要求。' }
        ],
        foundations: [
          { title: '资料的身份说明', explanation: '标题之外，来源、版本、时间与适用对象也帮助辨认一份资料。资料相似，不代表可以在同一条件下使用。', href: '#article/info-description', reason: '从一份资料的描述，理解数据为什么需要背景信息。' }
        ],
        neighbors: [
          { title: '往内：产业经济', href: '#domain/ai?direction=industry', reason: '运行需要资源，进一步会遇到成本、供给与采用条件。' },
          { title: '往外：来源与版本', href: '#domain/information?direction=provenance', reason: '沿着材料的形成与修订过程，理解哪些信息适用于当前问题。' }
        ],
        frontier: '这里介绍资源的观察维度；芯片架构、能源、数据采集工程与具体产品的服务政策尚未展开。'
      },
      system: {
        outcome: '画出资料、模型、工具与人的接力关系，知道一个 AI 产品还涉及哪些环节。',
        contains: ['检索与材料', '模型接入工作流', '工具行动', '复核与人的接手'],
        steps: [
          { level: '从实际任务进入', title: '公司知识库助手', href: '#project/knowledge-assistant', reason: '跟着员工查现行规定，从任务、版本和检索走到模型输入与回答核验。' },
          { level: '先看一次回答', title: '资料怎样进入模型', href: '#article/retrieval', reason: '沿着问题、检索、材料与回答，认识系统内的分工。' },
          { level: '深入资料与生成', title: 'RAG 包含哪些知识', href: '#map/rag?node=ingestion&depth=intro', reason: '拆开资料准备、候选检索、上下文与核验，按需要补基础。' },
          { level: '理解输入组织', title: '提示词与上下文怎样组织', href: '#map/context?node=task&depth=intro', reason: '把任务表达、材料选择和跨轮状态连起来，再看怎样验证。' },
          { level: '展开行动过程', title: '模型怎样借助工具做事', href: '#article/ai-agent', reason: '进一步区分计划、请求、执行与结果检查。' },
          { level: '展开具体方向', title: 'Agent 包含哪些知识', href: '#map/agent?node=goals&depth=intro', reason: '继续展开目标、循环、工具、状态、资料与控制，按需要补基础。' },
          { level: '理解协作边界', title: '什么时候、怎样交给人', href: '#topic/human-handoff', reason: '了解系统遇到冲突或不确定时，需要向人交接哪些信息。' },
          { level: '练习上线后的排查', title: '上线运行与监控', href: '#project/knowledge-assistant/operations', reason: '在访客预约案例中对照延迟与成本，观察规定更新后旧答案从哪个环节留下来。' }
        ],
        foundations: [
          { title: '环节与交接', explanation: '一次操作可以经过界面、服务、存储等环节。画出谁接收什么、交出什么，有助于找到缺失的信息与失败位置。', href: '#article/comp-systems', reason: '先看熟悉的网页系统，再把模型与工具放进同一张关系图。' }
        ],
        neighbors: [
          { title: '往内：评估可信', href: '#domain/ai?direction=evaluation', reason: '组成完整流程之后，还要看哪些证据支持它完成了目标。' },
          { title: '往外：信息检索', href: '#domain/information?direction=retrieval', reason: '系统需要的材料，依赖描述、索引、筛选与排序共同找到。' },
          { title: '往外：软件系统', href: '#domain/computing?direction=comp-systems', reason: '工具与服务怎样协作，是理解 AI 应用的另一块基础。' }
        ],
        frontier: 'RAG 和 Agent 子图提供机制基础，知识库助手案例提供运行与监控练习。工程实践还涉及具体接口、部署和系统架构。'
      },
      evaluation: {
        outcome: '知道一个分数或一次演示说明了什么，并能指出它没有覆盖哪些条件。',
        contains: ['评价与使用情境', '不同错误与指标', '变化后的持续检验'],
        steps: [
          { level: '沿项目练习评估', title: '评估与可靠性', href: '#project/knowledge-assistant/evaluation', reason: '用知识库助手的访客预约案例设计用例，定位错误，对照修正前后的结果并判断何时交给人复核。' },
          { level: '先明确评什么', title: '让评价对应自己的任务', href: '#topic/accuracy-context', reason: '把摘要是否好读、是否保留关键决定等不同标准分开。' },
          { level: '看懂指标含义', title: '同一个分数，可能掩盖哪些错误', href: '#topic/false-positives', reason: '用一个明确的假设算例，比较总体表现与少数情形。' },
          { level: '理解适用范围', title: '条件变了，还能沿用结论吗', href: '#topic/robustness', reason: '把测试结果与资料、输入和使用环境的变化联系起来。' }
        ],
        foundations: [
          { title: '观察、解释与判断', explanation: '观察记录发生了什么，解释提出可能原因，判断决定据此怎样做。三者需要不同支持，不能只凭一个结果跳到全部结论。', href: '#article/education-evidence', reason: '先把证据和推断分开，再理解评价结果能支持到哪一步。' }
        ],
        neighbors: [
          { title: '往内：原理方法', href: '#domain/ai?direction=method', reason: '新情境表现不佳时，可以回到泛化与输入条件理解可能的边界。' },
          { title: '往外：软件测试', href: '#domain/computing?direction=comp-testing', reason: '把预期行为与实际结果逐项对照，认识测试覆盖和遗漏。' },
          { title: '往外：证据判断', href: '#domain/education?direction=evidence', reason: '继续区分一次观测、原因解释与更广泛的结论。' }
        ],
        frontier: '这里提供指标、证据和项目评估的入门练习。更大范围的评估与统计推断需要继续展开。'
      },
      industry: {
        outcome: '沿价值链看见参与者、成本与采用条件，理解技术怎样进入组织。',
        contains: ['产业与价值链', '总成本与收益', '从可行到采用'],
        steps: [
          { level: '先看参与者', title: '谁共同支撑一个 AI 产品', href: '#topic/value-chain', reason: '把模型服务、资料维护、系统管理和使用者放在同一条链上。' },
          { level: '展开成本构成', title: '从一次调用看到整个方案', href: '#topic/total-cost', reason: '将运行、复核和维护等环节一起纳入比较。' },
          { level: '理解采用条件', title: '能做出来，怎样进入实际组织', href: '#topic/adoption-conditions', reason: '继续了解资料、流程和责任分工为什么会影响采用。' }
        ],
        foundations: [
          { title: '完整流程', explanation: '一个局部环节的收益，需要放进前后流程一起看。节省的时间与增加的复核，可能发生在不同人或不同环节上。', href: '#topic/workflow-efficiency', reason: '先用可调整的假设算例，理解局部变化如何影响整体。' }
        ],
        neighbors: [
          { title: '往内：人与社会', href: '#domain/ai?direction=society', reason: '组织采用技术以后，还会影响工作分配和不同参与者的负担。' },
          { title: '往外：信息组织', href: '#domain/information?direction=description', reason: '统一资料的描述与版本，是理解组织采用条件的一条具体线索。' }
        ],
        frontier: '这里提供观察产业的框架；具体公司、市场规模、竞争格局与行业案例尚未展开。'
      },
      society: {
        outcome: '把技术能力放回任务、职业与协作，分别观察不同人的变化。',
        contains: ['局部提速与整体效率', '任务与职业', '收益与负担的分布'],
        steps: [
          { level: '从熟悉的工作开始', title: '一个环节变快，整体会怎样', href: '#topic/workflow-efficiency', reason: '用假设的项目耗时，看到局部变化和整体变化的关系。' },
          { level: '扩大观察单位', title: '从任务看到完整职业', href: '#topic/task-job', reason: '理解同一职业内不同任务、沟通与责任可能受到不同影响。' },
          { level: '继续看人与分工', title: '谁获得便利，谁增加负担', href: '#topic/shared-impact', reason: '将平均变化拆到具体参与者，发现原来没有注意到的影响。' }
        ],
        foundations: [
          { title: '比较的范围', explanation: '讨论“更快”或“更好”时，需要说清比较哪个任务、哪段流程、哪些人，以及哪些条件保持不变。', href: '#article/education-evidence', reason: '分清观察和结论的范围，才能讨论技术带来的变化。' }
        ],
        neighbors: [
          { title: '往内：产业经济', href: '#domain/ai?direction=industry', reason: '工作变化与组织怎样采用技术、计算成本和安排流程相连。' },
          { title: '往外：教育与传播', href: '#domain/education?direction=learning', reason: '工作内容变化以后，也会提出新的学习与理解需求。' }
        ],
        frontier: '这里建立任务、协作与分配的观察入口；劳动制度、公共治理和不同地区的实证研究尚未展开。'
      }
    },
    domains: {
      information: {
        outcome: '看见资料从被描述、归类、关联，到被查找和核对的完整关系。',
        frontier: '目前展开描述、分类、关联、索引、检索、来源与版本六个入口；专业编目标准、检索算法和档案管理实践仍需继续补充。'
      },
      computing: {
        outcome: '从信息怎样表示、步骤怎样执行，走到软件系统如何连接与验证。',
        frontier: '目前展开数据表示、算法、系统连接和验证四个入口；编程语言、操作系统、网络与计算机体系结构的深入地图尚未展开。'
      },
      education: {
        outcome: '认识理解怎样形成与修正，以及信息的呈现和证据怎样影响判断。',
        frontier: '目前展开学习迁移、反馈、媒介和证据四个入口；学习科学、教育制度和传播研究的详细方法尚未展开。'
      }
    }
  };
})();
