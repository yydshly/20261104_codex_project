/* Editorial map of common LLM-powered agents; not a universal agent taxonomy. */
(() => {
  'use strict';
  const read=(title,href,reason)=>({title,href,reason});
  const stage=(title,text,links)=>({title,text,links});
  window.AGENT_DATA={
    title:'AI 智能体',
    lead:'从一个目标出发，看模型怎样与工具、状态和资料协作，再理解行动如何被约束与检验。',
    scope:'这里聚焦常见的大语言模型驱动的 Agent 系统。“智能体”的用法并不统一；这张图按任务中的分工组织知识，不代表所有智能体都需要同一套组件。',
    depths:[{id:'intro',label:'先认识'},{id:'mechanism',label:'拆机制与基础'},{id:'boundary',label:'看应用与边界'}],
    nodes:[
      {id:'goals',title:'目标怎样变成可推进的任务',short:'目标与任务',question:'要做成什么，怎样才算完成？',contains:['目标与约束','任务拆分','计划与调整','完成条件'],foundation:'agent-control-flow',
        intro:stage('先看 Agent 在整个系统中的位置','从一个目标出发，分清模型提供的能力、系统组织的过程，以及工具和资料各自的作用。',[read('Agent、语言模型与资料怎样分工','#article/agent-composition','先有整体关系，再决定从哪个部分往下看。'),read('把目标变成可检查的任务','#article/agent-goals','区分希望得到的结果、可采取的行动和完成条件。')]),
        mechanism:stage('再看任务怎样进入分支与循环','先认识状态、条件和反馈，再理解计划为何需要随着结果改变。',[read('控制流与反馈','#article/agent-control-flow','看清“接下来做什么”由哪些条件决定。'),read('目标、子任务和完成条件','#article/agent-goals','把抽象目标与可观察的结果对应起来。')]),
        boundary:stage('判断这个任务需要多大自主性','步骤清楚时，可以预先编排；需要随结果调整时，才进一步讨论模型参与决策的范围。',[read('任务适配与输入条件','#topic/task-fit','把生成、提取、核对等不同工作分开理解。'),read('约束、停止与结果检验','#article/agent-control','认识目标之外仍需要明确的授权和停止条件。')]),
        neighbor:read('大语言模型 · 逐步生成','#map/llm?node=generation&depth=intro','模型怎样形成回答或行动提议，是 Agent 调用模型时依赖的一层能力。'),frontier:'已展开目标、分工和任务条件；复杂规划、长期任务分解、调度与多智能体协作尚未展开。'},
      {id:'loop',title:'行动怎样形成一次反馈循环',short:'行动循环',question:'执行之后，为什么还要看结果？',contains:['选择下一步','行动请求','观察结果','继续或停止'],foundation:'agent-control-flow',
        intro:stage('先沿着一次行动走一圈','模型提出下一步，运行程序执行允许的操作，系统读取结果，再决定继续、调整或停止。',[read('计划、行动与观察怎样接起来','#article/agent-loop','切换成功、失败和预算用尽的示意，观察后续路径怎样改变。')]),
        mechanism:stage('拆开“下一步”背后的状态和条件','认识过程保存了什么，以及不同结果怎样进入不同分支。',[read('状态、分支与反馈','#article/agent-control-flow','用可手工追踪的过程理解循环，不把每次重试都当作学习。'),read('工具怎样接收请求并返回结果','#article/agent-tools','区分模型提议与程序执行，找到观察结果的来源。')]),
        boundary:stage('循环可以推进，也可能原地重复','没有有效反馈或停止条件，多走几步可能只增加耗时与错误；失败后还要判断能否安全重试。',[read('什么时候继续，什么时候停止','#article/agent-control','把步数、预算、权限和完成条件放进同一个过程。'),read('怎样检查系统真的做到了','#article/comp-testing','把预期行为与可见结果对应起来。')]),
        neighbor:read('软件与计算 · 算法与步骤','#domain/computing?direction=comp-algorithms','分支、循环和停止条件同样是理解普通程序的基础；模型只是参与其中的一种决策来源。'),frontier:'已展开单个任务的简化反馈循环；并行调度、异常恢复、分布式执行和长任务检查点仍需专门深入。'},
      {id:'tools',title:'模型怎样借助接口采取行动',short:'工具接口',question:'说要做，与真的做了差在哪里？',contains:['工具描述','参数与返回值','执行与副作用','权限与确认'],foundation:'agent-interfaces',
        intro:stage('先把工具调用看成一份明确请求','工具规定能做什么、需要哪些输入、会交回什么。语言中的行动提议，要经过程序的检查和执行。',[read('工具调用怎样走到实际结果','#article/agent-tools','比较查询资料和修改资料，观察权限边界在哪里。')]),
        mechanism:stage('再理解接口怎样让两边说清楚','从字段、类型和返回状态开始，不必先掌握某个框架或协议。',[read('接口与结构化数据','#article/agent-interfaces','理解格式检查、业务含义、执行状态为什么是不同问题。'),read('软件服务怎样接力','#article/comp-systems','把工具放回服务、存储和网络的协作过程。')]),
        boundary:stage('格式正确与调用成功，都不等于任务完成','请求可能作用于错误对象，响应也可能只是受理；重复执行还可能产生重复结果。',[read('权限、停止与人工接手','#article/agent-control','看清系统允许执行到哪里，何时需要把决定交给人。'),read('操作之后，怎样确认真的完成','#topic/tool-actions','区分生成的说明、工具回执和可以核对的外部结果。')]),
        neighbor:read('软件与计算 · 系统与接口','#domain/computing?direction=comp-systems','Agent 的工具仍由普通软件执行，理解请求与响应有助于找到失败发生在哪一层。'),frontier:'已解释工具描述、参数、结果与副作用；具体协议、身份认证、事务、隔离环境和接口实现尚未展开。'},
      {id:'state',title:'任务中有哪些信息需要保留',short:'状态与记忆',question:'已经做过什么，下一步能看到什么？',contains:['任务状态','上下文选择','外部记忆','更新与恢复'],foundation:'agent-control-flow',
        intro:stage('先分清“保存着”和“本次看得到”','系统可以保存目标、已完成步骤、工具结果和待处理问题；每次模型调用看到的是其中被选入上下文的内容。',[read('展开提示词与上下文工程','#map/context?node=state&depth=intro','理解每一轮实际带入什么，保存的内容怎样被选回输入。'),read('状态、上下文与记忆各存什么','#article/agent-state','把任务进展、当前输入和跨会话保存放在不同位置。')]),
        mechanism:stage('追踪信息怎样更新和进入下一步','先看一次行动改变了哪些状态，再看系统把什么内容交给下一次模型调用。',[read('状态与条件分支','#article/agent-control-flow','理解同一目标在不同进展下为何需要不同下一步。'),read('上下文、产品记忆与训练','#article/ai-context','明确保存对话不等于修改模型参数，也不等于每次都能完整使用。')]),
        boundary:stage('记得更多，也需要知道是否仍然适用','旧偏好、过时结论或不完整摘要可以影响后续动作；保存与提取需要考虑范围、来源和修订。',[read('状态与记忆的适用边界','#article/agent-state','继续追问摘要丢了什么、旧状态是否需要重新核对。'),read('来源与版本','#article/info-provenance','把“曾经保存过”与“现在仍适用”分开。')]),
        neighbor:read('大语言模型 · 关联上下文','#map/llm?node=context&depth=boundary','Agent 保存的信息只有进入当前调用，才成为这次模型可利用的上下文；窗口与使用能力仍有限。'),frontier:'已分清状态、上下文和外部记忆；持久化策略、记忆检索、冲突处理与长期维护尚未展开。'},
      {id:'knowledge',title:'资料怎样成为行动的依据',short:'资料与检索',question:'找到了什么，凭什么采用它？',contains:['描述与索引','检索与筛选','来源与版本','主张与证据'],foundation:'agent-evidence',
        intro:stage('先看材料怎样进入一次决策','Agent 可以发起检索，但资料仍要能被描述、定位和辨别；拿到材料后还要判断它是否回答当前问题。',[read('Agent 怎样找到并使用资料','#article/agent-knowledge','切换旧版、现行版和来源不足的示意材料，观察能支持的结论怎样变化。')]),
        mechanism:stage('把查找过程和依据判断拆开','先了解如何找到候选，再检查候选内容支持了什么。',[read('展开 RAG 的知识结构','#map/rag?node=retrieval&depth=intro','把 Agent 的检索工具继续拆成资料、候选、上下文与回答依据。'),read('主张、证据与来源','#article/agent-evidence','把具体结论与出处、适用日期和范围对应起来。'),read('检索为什么需要描述和筛选','#article/info-retrieval','理解关键词或向量相似只提供候选，不能代替适用性判断。')]),
        boundary:stage('相关内容未必可信，可信内容也未必适用','资料可能过期、互相冲突或只是讨论稿。检索结果是待判断的材料，不能自行改变任务授权。',[read('来源与版本怎样被保存','#article/info-provenance','追查资料怎样形成和修订，避免把上传时间当作生效时间。'),read('观察、解释与判断','#article/education-evidence','把材料直接支持的事实与后续推断分开。')]),
        neighbor:read('信息组织 · 检索与来源','#domain/information?direction=retrieval','信息组织让资料可被发现和辨别，Agent 再把查找和使用纳入任务过程；两者承担不同工作。'),frontier:'已串起材料描述、检索、版本与证据；检索评测、复杂知识库、知识图谱和专业证据规范尚未展开。'},
      {id:'evaluation',title:'自主行动怎样被约束和检验',short:'控制与评估',question:'可以做到哪里，又怎样确认做对了？',contains:['授权范围','停止与预算','执行证据','人工接手'],foundation:'agent-evidence',
        intro:stage('先给过程和结果分别设边界','有了目标，仍需说明哪些操作被允许、何时停止，以及拿什么结果判断是否完成。',[read('Agent 的控制与评估','#article/agent-control','把行动权限、过程限制和任务检查放在同一张图里。')]),
        mechanism:stage('用可观察的证据检查目标','完成叙述、工具回执和任务结果各能说明不同事情；评价要结合输入、过程和实际产物。',[read('证据能支持到哪一步','#article/agent-evidence','认识“请求已受理”和“目标已完成”之间需要补什么依据。'),read('测试与任务条件','#article/comp-testing','用明确的预期、样例和边界情况检查系统。')]),
        boundary:stage('遇到冲突或未知时，留下可接手的状态','停止不是只有成功一种原因。任务受阻、授权不足或预算用尽时，系统需要说明已完成什么、哪里仍不确定。',[read('怎样把过程交给人','#topic/human-handoff','理解交接要包含进展、依据、未解决问题与下一步选择。'),read('自主行动的范围','#topic/autonomy-boundaries','区分建议、准备和实际执行，理解权限不是由模型的自信决定。')]),
        neighbor:read('教育与传播 · 证据判断','#domain/education?direction=evidence','判断一个 Agent 是否可靠，也需要分清观察到的结果、原因解释和能推广的结论。'),frontier:'已提供权限、停止和评价入口；威胁建模、系统化评测、审计与各行业规范仍需继续展开。'}
    ],
    foundations:[
      {id:'agent-control-flow',title:'控制流与反馈',why:'用于理解状态、条件分支、循环和停止，追踪任务怎样逐步推进。'},
      {id:'agent-interfaces',title:'接口与结构化数据',why:'用于区分工具请求、输入约定、执行结果和对外部状态的改变。'},
      {id:'agent-evidence',title:'证据与来源',why:'用于判断材料支持了什么，以及行动结果是否满足目标和适用条件。'}
    ]
  };
})();
