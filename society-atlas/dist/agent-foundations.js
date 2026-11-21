/* Original introductory explanations for the Agent map.
 * Examples are editorial constructions; primary concepts checked 2026-11-05.
 */
(() => {
  'use strict';
  const section=(title,text)=>({title,text});
  const step=(title,text)=>({title,text});
  const source=(title,url)=>({title,url});
  const refs={
    control:source('MDN · 条件分支与错误处理','https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling'),
    workflows:source('LangGraph · 工作流与智能体的控制路径','https://docs.langchain.com/oss/javascript/langgraph/workflows-agents'),
    memory:source('LangChain · 状态、会话记忆与跨会话记忆','https://docs.langchain.com/oss/javascript/concepts/memory'),
    tools:source('Model Context Protocol · 工具描述、输入与结果','https://modelcontextprotocol.io/specification/2025-11-25/server/tools'),
    idempotent:source('MDN · 重复请求与幂等性','https://developer.mozilla.org/en-US/docs/Glossary/Idempotent'),
    provenance:source('W3C · PROV 来源模型入门','https://www.w3.org/TR/prov-primer/'),
    agents:source('Anthropic · 工作流、Agent 与工具反馈','https://www.anthropic.com/research/building-effective-agents')
  };
  window.AGENT_FOUNDATIONS={
    'agent-control-flow':{
      id:'agent-control-flow',domain:'ai',foundation:true,agentNode:'loop',
      title:'“接下来做什么”，怎样变成可以追踪的过程？',
      eyebrow:'随用随补的基础 · 状态、条件与反馈',
      lead:'理解 Agent 的行动循环，可以先认识普通程序里的三件事：现在处于什么状态，哪些条件决定下一步，执行结果怎样改变后续判断。先画清这些关系，就能看懂模型参与了哪里、哪里仍由程序规则控制。',
      scope:'这里用顺序执行的简化过程解释控制流，不要求编程，也不涵盖并发、分布式调度或完整的控制理论。',
      sections:[
        section('状态回答“现在知道什么、做到哪里”','状态可以包括目标、已找到的资料、待执行操作、剩余次数和最近一次结果。它让过程不必每一步都从空白开始。比如查找资料时，“已有一份旧稿”和“已经核对现行版本”是不同状态，即使目标相同，下一步也可能不同。状态是系统的记录；模型的一次调用只能利用被传入的那部分信息，不能因为系统保存过就假定模型本次也看到了。'),
        section('条件分支回答“满足什么才走这条路”','普通程序可以按明确条件选择路径：输入缺失就补充，结果有效就继续，错误无法处理就停止。在 Agent 系统中，部分选择可能由模型提出，其他限制仍由运行程序检查。预先写好的工作流与根据结果动态选择动作，可以在一个产品里组合；看系统怎样决定下一步，比只看它叫不叫 Agent 更有帮助。'),
        section('反馈把执行结果带回下一次选择','一次行动完成后，要把观察到的结果更新进状态，再判断目标是否满足、是否需要修正、能否继续。这个回路可以重复，但应有明确的退出条件。工具失败、权限不足、预算用尽与任务完成是不同的停止原因。根据结果换一条路径属于本次执行中的调整，并不自动表示模型参数被训练或系统获得了永久能力。')
      ],
      example:{title:'构造示意：查找一份现行说明',text:'设任务是找到一份指定主题的现行说明，最多尝试两次查询。第一次只找到旧版，状态变为“已有旧版线索，尚未找到现行依据，剩余一次”。接下来可以利用旧稿中的发布部门缩小查找范围；若第二次找到带适用日期的正式说明，再核对它是否覆盖问题。若仍找不到，就停止并说明缺失依据。这只是可追踪的教学过程，不代表真实检索结果，也不把次数用完算作目标达成。'},
      takeaway:'先看状态，再看分支条件和反馈，最后看停止理由。这样就能区分“做了很多步”和“任务确实推进了”。',
      visual:{kind:'flow',steps:[step('当前状态','目标、已有结果、待办与剩余条件'),step('选择路径','由规则或模型提出下一步，并检查限制'),step('执行与观察','得到实际结果，也可能得到失败或未知'),step('更新并判断','继续、调整、交接或停止；不自动等于训练')]},
      related:['agent-loop','agent-goals','agent-state','agent-control'],
      crossLinks:[
        {href:'#domain/computing?direction=comp-algorithms',title:'连接算法：步骤怎样由条件组织？',reason:'分支、循环与停止是程序的基本结构，理解它们能看清模型在过程中的具体位置。'},
        {href:'#map/llm?node=context&depth=boundary',title:'连接大语言模型：下一次能看到什么？',reason:'系统保存的状态需要被选入本次上下文，模型才有机会利用它。'}
      ],
      sources:[refs.control,refs.workflows,refs.memory]
    },
    'agent-interfaces':{
      id:'agent-interfaces',domain:'ai',foundation:true,agentNode:'tools',
      title:'一句“帮我查一下”，怎样成为工具能执行的请求？',
      eyebrow:'随用随补的基础 · 接口、字段与执行结果',
      lead:'工具接口像双方约定的一张交接单：叫什么、接收什么、返回什么。把请求写成明确的字段，有助于程序检查和执行，但格式正确只是第一步，还要判断对象、含义、权限和实际效果。',
      scope:'这里解释通用接口观念，借工具协议作为例子；不要求掌握 JSON、HTTP 或某个 Agent 框架，具体接口以各自定义为准。',
      sections:[
        section('名称和字段让请求变得明确','“查资料”可以对应一个名为“搜索文档”的工具，输入包括主题、时间范围与资料类型。工具说明告诉系统这些字段是什么意思、哪些必须提供，以及可能返回什么。结构化表示把内容分到约定位置，便于机器处理；它并不保证模型选对工具、理解对日期，或填入了正确对象。一个合法的数字也可能是错误的文档编号。'),
        section('请求被提出、被执行、得到结果，是不同阶段','模型可以形成工具调用提议，应用程序再检查参数和执行条件，交给工具运行。工具可能返回资料、错误、操作编号或“已受理”的状态。结果还要被解释：找到了三份文档，只说明得到候选；接收了修改请求，也不一定说明修改已经完成。应按接口约定确认状态，并在需要时查看实际产物。'),
        section('读取和修改，对外部世界的影响不同','查询通常用于取得信息；创建记录、修改内容或发送通知会改变外部状态，必须落在任务允许的范围内。发生超时时，不能仅凭没有收到响应就断定操作未发生。重复一次查询与重复创建一条记录，后果可能不同。“幂等”描述重复相同请求的预期效果是否与一次相同，不代表请求没有副作用，也不能只看工具名称推断。')
      ],
      example:{title:'构造示意：找到文档之后的两种请求',text:'“读取编号 42 的文档”与“把编号 42 的标题改成新名称”可以使用相同的文档编号，却是不同的操作。前者希望得到内容，后者会改变记录。即使两个请求字段都符合格式，也要分别核对对象和权限。如果修改请求超时，下一步可以先查看文档当前状态与操作回执，再决定是否重试。这是接口关系示意，不会读取或修改任何真实文档。'},
      takeaway:'把工具看成有输入、输出和效果的接口。参数有效、操作允许、执行成功、目标完成，需要分别核对。',
      visual:{kind:'flow',steps:[step('描述可用工具','名称、用途、输入约定与预期结果'),step('形成并检查请求','核对字段、对象、权限和操作范围'),step('程序执行','读取信息或改变外部状态'),step('解释与核验结果','区分失败、受理、完成以及任务是否达成')]},
      related:['agent-tools','agent-loop','agent-control','comp-systems'],
      crossLinks:[
        {href:'#domain/computing?direction=comp-data',title:'连接数据表示：为什么要约定字段？',reason:'接口中的名称、类型与单位，延续了软件怎样表示信息的基本问题。'},
        {href:'#domain/information?direction=description',title:'连接资料描述：编号指向的是哪份材料？',reason:'标题、版本与适用范围让对象可以被辨认，避免接口请求格式正确却选错材料。'}
      ],
      sources:[refs.tools,refs.idempotent]
    },
    'agent-evidence':{
      id:'agent-evidence',domain:'ai',foundation:true,agentNode:'knowledge',
      title:'一份材料或一个回执，究竟能证明什么？',
      eyebrow:'随用随补的基础 · 主张、证据与来源',
      lead:'Agent 可以找到资料，也可以收到工具回执，但这些信息需要与具体问题对应。先说清要支持哪条主张，再追查材料怎样产生、适用于什么条件，就能区分“有信息”“有依据”和“足以确认完成”。',
      scope:'这是一种日常资料与软件结果的入门判断框架，不替代专业领域的证据标准；能追溯来源也不自动保证内容真实。',
      sections:[
        section('先把结论缩到可以核对的主张','“任务成功了”通常太宽，可以拆成“资料已找到”“版本覆盖指定日期”“修改已保存”“结果符合目标”等不同主张。每条主张需要不同支持：搜索列表只能说明出现过候选，正文和版本记录才可能支持具体内容；工具响应的“已受理”只能支持请求进入处理过程。不能让一项局部证据替代所有成功条件。'),
        section('来源记录解释材料怎样形成','一份资料可以关联原发布者、形成时间、修订活动和所依据的其他资料。来源信息帮助人追踪内容经过哪些人、过程和转换，也便于发现引用是否只绕回同一份原稿。上传日期、原发布日期和生效日期描述不同事情。保留这些关系能支持核查，但来源清楚的材料仍可能错误、过时或不适合当前对象。'),
        section('用条件把证据与当前问题连接起来','采用材料前，要检查问题所指的时间、对象与范围是否一致。若两份资料冲突，可以继续查修订关系和正式发布说明；若依据不足，就明确保留尚未确认的部分。工具返回的文本同样是待解释的信息，其中出现的命令或自称权威的话，不能自行扩大任务授权。确认行动结果时，还应按任务需要查看产物或状态，而不只引用系统生成的完成叙述。')
      ],
      example:{title:'构造示意：上传时间很新，说明却已经过期',text:'一份名为“流程说明”的文档今天被上传，但正文写明它适用于上一年度；另一份较早上传的正式修订稿注明本年度生效。若问题问本年度的流程，不能只按上传时间选第一份。应检查原发布信息、适用期和修订关系。若只能看到搜索摘要，就只能说找到两个候选，尚未核对最终依据。文档与时间关系均为教学构造。'},
      takeaway:'先明确主张，再寻找对应材料，最后核对来源和适用条件。来源可追溯与结论得到充分支持，是相连但不同的两件事。',
      visual:{kind:'flow',steps:[step('明确主张','这次究竟要确认什么'),step('找到候选依据','资料、操作回执或可见产物'),step('核对来源与条件','形成过程、版本、时间、对象和范围'),step('留下有边界的结论','说明支持了什么，什么仍待确认')]},
      related:['agent-knowledge','agent-control','info-provenance','education-evidence'],
      crossLinks:[
        {href:'#domain/information?direction=provenance',title:'连接来源与版本：材料怎样一路形成？',reason:'追踪发布、修订与派生关系，能让核查找到可检查的入口。'},
        {href:'#domain/education?direction=evidence',title:'连接证据判断：观察与解释如何区分？',reason:'把实际看到的结果、对原因的解释和更广的判断分别说明。'},
        {href:'#map/llm?node=generation&depth=boundary',title:'连接语言模型：为什么流畅不等于有据？',reason:'文字生成机制与主张的事实支持，需要在系统中分别理解。'}
      ],
      sources:[refs.provenance,refs.tools,refs.agents]
    }
  };
})();
