// 实施规格说明，不执行入库、模型调用、并发协调或真实业务操作。
export const implementationGuide = {
  id: 'flowdesk-implementation-guide-v1',
  title: '把架构说明，细化成团队可以执行的契约。',
  summary: '围绕订单延迟场景，展开知识生产、任务分流和自然交流。下面的目标规格与当前本地演示逐项分开。',
  notice: '本模块补齐产品实施说明，不表示相应功能已经完成。当前使用固定身份、5 份种子知识与确定性演示适配器，按会话串行处理；没有真实模型、自动建库流水线或完整异步会话协调。',
  knowledge: {
    id: 'knowledge', title: '知识库建设流水线',
    summary: '先确定政策责任与适用范围，再把资料变成可检索、可引用、可撤回的知识；线上订单状态始终由业务 API 提供。',
    current: 'src/data.mjs 直接保存 5 份演示文档；engine.mjs 按关键词匹配或指定文档 ID 读取，最多返回 2 份。网页“已发布”是种子展示状态，不是已运行正式审核系统。',
    target: '资料、政策、片段和索引分别管理；保留来源与版本关联。只有通过业务审核且满足访问范围的发布版本，才能用于对客回答。',
    steps: [
      {
        id: 'intake', title: '01 · 资料导入', owner: '业务政策负责人 + 知识运营',
        input: '已授权的产品说明、物流政策、处理规范；每份资料明确来源、负责人、生效时间与适用渠道。',
        action: '建立资料清单，登记原始文件、内容校验值、版本、可见范围与更新责任；区分正式政策、历史案例和演示种子。',
        output: 'SourceDocument 草稿及原文引用；生产政策清单与种子测试集分开。',
        gate: '来源可核对、授权与负责人明确；缺少适用范围或审核责任的资料只进草稿区。'
      },
      {
        id: 'parse', title: '02 · 解析与清洗', owner: '知识工程 + 知识运营',
        input: '资料草稿、表格与附件，以及格式、语言和解析要求。',
        action: '按格式抽取正文和表格；需要时使用 OCR；清除重复页眉和无关内容，保留条件、例外和单位；文档中的指令文本不能获得系统权限。',
        output: '可追溯到原文位置的规范正文、解析错误清单与人工待核对项。',
        gate: '关键政策条件与原文一致；解析失败或含糊表格须人工复核，不能默默丢失例外条件。'
      },
      {
        id: 'index', title: '03 · 切分与索引', owner: '检索工程',
        input: '经核对的正文及来源、版本、生效范围、权限元数据。',
        action: '按完整规则语义切分，保留标题和前后约束；建立全文索引，按评测需求选择向量索引；片段与原文一一关联。',
        output: 'KnowledgeChunk、可重建的索引版本、片段与来源映射。',
        gate: '条件和例外不可切断后误用；租户、渠道及生效范围过滤必须可验证；索引能追溯并重建。'
      },
      {
        id: 'publish', title: '04 · 审核与发布', owner: '业务政策负责人审核，知识运营发布',
        input: '正文、片段、差异对比、基础检索自测与拟发布范围。',
        action: '审核政策含义与话术边界；先发布到试点范围，记录审批人、发布时间、替代版本及回退入口。',
        output: '可引用的 PublishedPolicy 版本与发布记录；线上检索仅开放适用的有效版本。',
        gate: '审核通过并完成基础自测；未通过的内容不得对客；试点推广仍须通过下一步检索评测。'
      },
      {
        id: 'evaluate', title: '05 · 检索与回答评测', owner: '客服运营标注 + 评测工程',
        input: '脱敏真实问题、标准依据、应追问或转人工的负例，以及现有版本基线。',
        action: '检查是否找对资料、范围是否适用、引用是否支持断言；覆盖同义问法、缺信息、政策冲突与无答案问题。',
        output: '可复跑评测集、错误分类、问题负责人和发布评审报告。',
        gate: '业务确认试点门槛后方可扩大范围；没有依据的答案不得靠模型自报置信度通过；不把现有流程回归当作检索质量评测。'
      },
      {
        id: 'maintain', title: '06 · 更新、撤回与反馈', owner: '政策负责人 + 知识运营 + 检索工程',
        input: '政策变更、过期资料、错误答案和人工接管暴露的知识缺口。',
        action: '变更进入草稿和复审；撤回时同步停止片段检索并使相关缓存失效；检查正在处理的任务是否仍可引用旧证据。',
        output: '新版本、撤回记录、索引更新及受影响任务处理记录。',
        gate: '撤回后不能继续作为有效政策回答；历史记录保留原引用便于复核；对话反馈只生成待审建议，不自动成为正式政策。'
      }
    ],
    documentMap: [
      {
        runtimeId: 'shipping', runtimeTitle: '配送与发货说明',
        plannedPolicy: '物流进度解释规范（拟建 delivery-progress-demo）',
        relationship: '提供一般发货与运费背景，不足以判断配送迟延原因或催查资格。',
        current: '已运行的种子文档，v1.2；不是正式商城对外政策。',
        target: '由物流运营审核正常与异常进度的解释边界，独立记录承诺时间的来源。'
      },
      {
        runtimeId: 'delivery_exception', runtimeTitle: '配送延迟与物流催查规则',
        plannedPolicy: '拆为物流进度解释规范、催查受理规则（拟建 delivery-followup-demo）',
        relationship: '当前一个种子文档合并了解释、催查条件及交接原则；拟建政策 ID 尚非运行时文档 ID。',
        current: '演示资格：运输中、超演示承诺超过 24 小时、连续至少 48 小时无新扫描；均为演示阈值。',
        target: '业务审核资格、必填字段与例外情况；规则服务与知识说明引用同一批准版本。'
      },
      {
        runtimeId: 'handoff', runtimeTitle: '人工接管与工单交接规范',
        plannedPolicy: '异常与人工接管规范（拟建 delivery-handoff-demo）',
        relationship: '已有交接原则，拟建政策需补队列、值班、处理责任与异常升级。',
        current: '种子说明配合本地人工持有状态和摘要；没有真实坐席。',
        target: '客服运营确认交接资料、归属切换条件与无人承接时的处理方式。'
      },
      {
        runtimeId: 'refund', runtimeTitle: '退货与退款处理规则',
        plannedPolicy: '退款政策知识集，独立于本轮物流催查政策',
        relationship: '保留为相邻场景，不能因为包裹延迟就自动套用退款资格或承诺赔偿。',
        current: '已运行的种子文档，v2.0；退款也只是独立会话内演示。',
        target: '按退款业务单独审核来源、适用范围和受控执行规则。'
      },
      {
        runtimeId: 'sync', runtimeTitle: '桌面端同步故障排查',
        plannedPolicy: '技术支持知识集，不属于商城物流政策',
        relationship: '用于演示深入排障与保留本地内容，不作为物流回答依据。',
        current: '已运行的种子文档，v1.4；没有读取真实设备或私人资料。',
        target: '按业务域与权限分区，避免不同产品的知识被混用。'
      }
    ]
  },
  routing: {
    id: 'routing', title: '路由决策与模型契约',
    summary: '先判定能否取得证据、是否有权限、需要哪种处理流程，再选择模型能力；双模型通过质量和成本对比后决定是否保留。',
    current: 'adapters.mjs 用关键词规则识别意图并选择 Demo Main / Fast / Deep 标签；engine.mjs 以确定性流程生成演示回复，未调用模型供应商或执行真实能力升级。',
    target: '用版本化决策表和结构化结果控制路由；模型结果只提出答复或操作建议，授权与执行仍由后端控制。预算配置须在试点前填写并验证，不在此虚构数值。',
    decisions: [
      {
        id: 'simple', condition: '已知简单问题；检索证据适用且足以覆盖答案，实时字段需要时已核查。',
        modelOrOwner: '轻量交互配置，或单主模型的普通配置',
        action: '基于证据简洁回答并保留来源；订单状态使用 API 事实，不使用模型记忆。',
        exit: '证据、范围与输出检查通过后统一回复；发现缺信息或复杂分析需要则进入对应分支。',
        budget: '受本轮总调用、输出和费用上限约束；不为同一答案默认同时调用两种模型。'
      },
      {
        id: 'missing', condition: '缺订单号、授权身份或影响办理的必填字段。',
        modelOrOwner: '会话服务判断缺项；轻量模型组织必要追问',
        action: '只追问对当前结论或操作有影响的信息；用户已提供的字段不重复询问。',
        exit: '字段齐备后重新查事实；无法取得必要信息则说明限制或按用户意愿交接。',
        budget: '不以升级高能力模型替代缺失数据；追问次数及转人工条件由业务评审后配置。'
      },
      {
        id: 'complex', condition: '明显涉及多条件分析或复杂排障，且必要证据已经具备或可依法授权查询。',
        modelOrOwner: '直接使用高能力分析配置；会话协调器管理任务',
        action: '跳过无价值的轻量试答；分析必须引用证据，并区分已知、未知和建议下一步。',
        exit: '输出通过版本、证据和业务检查后可直接发布；无需强制由轻量模型重写。',
        budget: '受分析超时、模型及工具调用总量、输出和费用预算限制；耗尽后说明状态并降级或交接。'
      },
      {
        id: 'failed-check', condition: '轻量结果未通过结构化或任务质量检查；证据足够，问题需要更强分析能力。',
        modelOrOwner: '协调器判定可升级；高能力分析配置',
        action: '携带失败原因、已有证据和当前上下文升级；检查失败若源于缺字段或无证据，转对应流程。',
        exit: '升级结果再次核对；仍不满足条件则明确不能确定或转人工，避免循环试答。',
        budget: '可升级次数、格式修复次数必须配置并纳入整轮预算；不能由模型无限追加调用。'
      },
      {
        id: 'no-evidence', condition: '未命中资料、资料范围不适用、来源冲突，或 API 没有足够事实。',
        modelOrOwner: '检索与业务规则服务；必要时知识运营或人工',
        action: '核查检索范围与可查询的数据；可补齐则询问，否则说明不确定性并交接或登记知识缺口。',
        exit: '取得可用证据才恢复回答；无法取得时给出明确下一步，不生成无依据结论。',
        budget: '受检索、工具与追问预算约束；高能力模型不能把不存在的业务事实补成已知。'
      },
      {
        id: 'tool-failure', condition: '工具超时、无权限、返回格式错误，或写入结果不明确。',
        modelOrOwner: '工具网关 + 业务规则；必要时人工',
        action: '按错误类型处理；只读操作可有限重试；写入状态不明时先用幂等键查询，不能直接重复建单。',
        exit: '核实结果后继续；达到重试或等待边界则如实告知并交接，不声称工具已成功。',
        budget: '单工具超时、重试次数和整轮期限必须配置；权限拒绝不通过更换模型绕过。'
      },
      {
        id: 'human', condition: '用户明确要求人工，或规则判断必须人工处置。',
        modelOrOwner: '会话服务 + 人工队列',
        action: '记录诉求、证据、待核实事项与已执行操作；交出持有权并使未提交的确认失效。',
        exit: '交接结果或等待状态清楚可见；人工持有期间不继续自动办理。',
        budget: '不额外调用高能力模型阻挡人工诉求；无真实坐席时不得声称已有人受理。'
      }
    ],
    modelConfig: [
      { field: 'modelKey', requirement: '业务可引用的稳定配置键', current: 'demo-main / demo-fast / demo-deep，仅演示标识', target: '待选；配置版本化并可回退' },
      { field: 'provider', requirement: '供应商或统一网关标识', current: '无真实供应商', target: '待评估并填写' },
      { field: 'modelId', requirement: '实际模型 ID 与可追溯版本', current: '无真实模型 ID', target: '待选；不得把演示名称当作型号' },
      { field: 'profile', requirement: '普通交互或深入分析配置及能力要求', current: '普通配置 / 深入配置为演示标签', target: '待选；确认结构化输出、工具调用与语言能力' },
      { field: 'timeoutMs', requirement: '模型调用超时及超时后的处理', current: '无真实模型超时配置', target: '待实测后填写，受整轮期限约束' },
      { field: 'maxInputTokens / maxOutputTokens', requirement: '输入裁剪、证据保留与输出边界', current: '未统计真实 token', target: '待评估填写；不得裁掉关键限制条件' },
      { field: 'maxModelCalls / maxToolCalls', requirement: '每轮模型与工具调用总量上限', current: '确定性分支，不是生产预算控制', target: '待评审填写，含升级与修复调用' },
      { field: 'maxCostPerTurn / currency', requirement: '整轮费用上限与计费口径', current: '无模型计费', target: '待成本基线后填写，含失败与重试费用' },
      { field: 'maxRetries / fallbackModelKey', requirement: '可重试错误、次数和允许的降级配置', current: '没有真实模型重试或供应商切换', target: '待配置；降级结果仍须满足质量与权限边界' },
      { field: 'credentialRef / allowedDataScope', requirement: '服务端凭据引用和允许出站的数据范围', current: '无外部模型凭据或数据出站', target: '待接入；前端与文档只存引用，不保存密钥正文' }
    ],
    resultContract: [
      { field: 'schemaVersion', meaning: '结果结构版本', rule: '服务端验证已支持的结构，不直接执行自由文本里的操作。' },
      { field: 'sessionId / turnId / taskId', meaning: '会话、本轮和任务关联', rule: '由服务端产生并核对，模型不能自选他人会话。' },
      { field: 'inputContextVersion', meaning: '分析使用的上下文版本', rule: '发布前检查版本和依赖；过时结果先重核，不能直接发出。' },
      { field: 'route / reasonCode', meaning: '处理分支与可审计原因', rule: '使用受控枚举和简短操作原因，不索取或展示模型思维链。' },
      { field: 'answer / uncertainties', meaning: '建议答复与未知部分', rule: '断言须被证据支持，不确定性明确表达。' },
      { field: 'evidenceRefs', meaning: '文档片段和事实快照引用', rule: '服务端检查引用存在、可见、有效且能支持答案。' },
      { field: 'missingFields / requiresHuman', meaning: '必要追问及人工原因', rule: '只追问影响处理的信息；人工要求优先遵守。' },
      { field: 'proposedAction / toolRequests', meaning: '拟办理事项与受控工具请求', rule: '仅是建议；工具授权、参数、资格、确认与幂等由后端判定。' },
      { field: 'usage / timings / outcome', meaning: '真实费用、操作耗时与处理结果', rule: '从供应商及服务端记录汇总，区分答复完成、建单与业务解决。' }
    ],
    gates: [
      { title: '高能力模型也受约束', rule: '相同登录身份、工具白名单与确认机制适用于全部配置，不因升级获得额外权限。' },
      { title: '证据检查独立于模型自信', rule: '模型置信度仅能作为辅助信号；决定能否回答的是证据适用性和任务校验。' },
      { title: '先填写预算再试点', rule: '缺失的超时、调用、费用和重试配置应阻止生产配置启用，演示动画不用于定预算。' }
    ]
  },
  conversation: {
    id: 'conversation', title: '自然交流状态机与前后台事件',
    summary: '用户只面对一个客服声音。协调器决定何时追问、发布结果或办理；模型任务可以分工，但不能各自向用户抢答。',
    current: '当前使用前端 busy、服务端会话锁、owner 与 pendingAction 组合管理流程；没有以下完整状态机。处理中输入框禁用，同会话新请求返回 409。',
    target: '把会话持有权、用户轮次、后台任务和业务动作状态分别记录；允许用户在分析等待中补充，由协调器确定影响范围与结果发布顺序。',
    states: [
      { id: 'ready', label: '可以交流', input: '允许提问或补充', target: '机器人持有且无未完成的阻塞操作，接收新一轮请求。', current: '当前 busy=false 时可输入；非独立持久化状态。' },
      { id: 'retrieving', label: '核查资料与业务事实', input: '目标允许补充，由协调器排队处理', target: '进度来自真实检索或工具事件，不能提前声称已核实。', current: '当前请求串行执行，输入禁用；trace 会驱动进度文案。' },
      { id: 'analyzing', label: '深入分析中', input: '目标允许补充与提出取消请求', target: '接受补充后更新受影响上下文；后台任务绑定版本。', current: '没有真实异步模型任务；分析中补充和取消尚未实现。' },
      { id: 'waiting-input', label: '等待必要信息', input: '允许回答追问或改变诉求', target: '记录缺失字段，收到后核查当前事实，避免重复追问。', current: '已演示缺订单号追问，以及后续订单号补齐。' },
      { id: 'awaiting-confirmation', label: '等待用户确认', input: '允许确认、取消或继续询问', target: '预览与令牌绑定具体动作；修改订单或诉求会使受影响确认失效。', current: '已实现确认/取消按钮及绑定 actionId 的请求；自由文本确认不能替代按钮授权。' },
      { id: 'executing-write', label: '办理与核对结果', input: '目标可接收消息，但写操作必须串行', target: '取消不代表已撤销已提交写入；状态不明先查幂等结果。', current: '当前写入仅在内存，处理期间同会话锁定。' },
      { id: 'human-owned', label: '人工持有', input: '允许补充到交接记录', target: '停止机器人自动办理，人工明确归还后才恢复。', current: '已演示持有权切换与补充记录，系统回执不等于真实坐席在线。' },
      { id: 'recoverable-error', label: '需要恢复或交接', input: '目标允许补信息、查询操作结果或请求人工', target: '保存失败操作与结果是否明确，不把重试变成重复执行。', current: '有错误提示及会话重读，没有持久化恢复状态。' },
      { id: 'turn-completed', label: '本轮处理完成', input: '允许后续追问', target: '答复、建单和问题真正解决分别记账，不把 complete 等同服务解决。', current: 'complete 事件结束本次流；物流工单只在本地创建。' }
    ],
    transitions: [
      { from: 'ready', event: 'message.accepted', guard: '缺影响处理的必填信息', to: 'waiting-input', action: '登记缺项并统一发出必要追问。' },
      { from: 'ready / waiting-input', event: 'message.accepted', guard: '身份和必要字段可核查', to: 'retrieving', action: '查询可访问的资料与当前事实，建立证据快照。' },
      { from: 'retrieving', event: 'evidence.ready', guard: '任务复杂且有足够输入', to: 'analyzing', action: '创建绑定上下文版本的分析任务。' },
      { from: 'analyzing', event: 'context.updated', guard: '新消息改变任务输入或答复条件', to: 'analyzing / waiting-input', action: '标记受影响任务；重核或取消，未受影响的事实可复用。' },
      { from: 'retrieving / analyzing', event: 'result.ready', guard: '版本、证据与业务校验通过，无写入', to: 'turn-completed', action: '协调器发布一个统一答案。' },
      { from: 'retrieving / analyzing', event: 'action.proposed', guard: '符合规则且需要用户确认', to: 'awaiting-confirmation', action: '生成本次操作预览与绑定令牌，不提前执行。' },
      { from: 'awaiting-confirmation', event: 'action.confirmed', guard: '用户明确确认，令牌、归属及实时资格仍有效', to: 'executing-write', action: '用幂等控制执行并核对结果。' },
      { from: 'awaiting-confirmation', event: 'action.cancelled', guard: '尚未提交写入', to: 'ready', action: '使令牌失效，明确说明未执行。' },
      { from: 'executing-write', event: 'action.completed / action.unknown', guard: '分别判断已核实成功或结果不明确', to: 'turn-completed / recoverable-error', action: '如实回执；结果不明先查状态，不能盲目重复。' },
      { from: '任意机器人状态', event: 'handoff.requested', guard: '用户要求人工或规则要求交接', to: 'human-owned', action: '停止自动办理，交接证据、操作和待办；作废未提交确认。' }
    ],
    events: [
      { name: 'message.accepted', payload: 'eventId、sessionId、turnId、contextVersion、acceptedAt', purpose: '区分服务端已接受与浏览器仅发出请求。', current: '无同名事件；前端先显示收到，服务端以 trace 进入流程。' },
      { name: 'task.started / task.progress', payload: 'eventId、taskId、contextVersion、stage、observedAt', purpose: '只报告实际发生的阶段，不把预计结果当作已确认事实。', current: '现有 trace 是操作事件，前端映射为进度文案；没有独立后台任务通道。' },
      { name: 'clarification.requested', payload: 'turnId、missingFields、question', purpose: '只保留影响办理的必要追问，并与最终答案共用回复队列。', current: '以最终演示答复提出追问，没有独立追问事件。' },
      { name: 'context.updated', payload: 'newVersion、sourceMessageId、affectedTaskIds、unverifiedNotes', purpose: '记录新信息来源和受影响范围，不把用户报告直接升级为接口事实。', current: '尚未实现上下文版本管理和依赖分析。' },
      { name: 'task.cancelled / result.discarded', payload: 'taskId、inputVersion、currentVersion、reasonCode', purpose: '区分发出取消请求、供应商确认取消与仅拦截过时结果。', current: '尚未实现；断开浏览器流也不代表服务端业务已取消。' },
      { name: 'action.proposed / action.completed', payload: 'actionId、contextVersion、preview 或 verifiedOutcome', purpose: '区分待确认、已提交和核实结果；写入成功必须来自后端。', current: '确认预览与本地结果放在 complete.result 中，不是独立同名事件。' },
      { name: 'handoff.completed / turn.completed', payload: 'owner、handoffId 或 turnId、outcome、eventId', purpose: '明确当前由谁处理，并结束本轮而非自动宣称业务已解决。', current: '当前 complete 带 owner、ticket 与 result；没有可重放事件日志。' }
    ],
    rules: [
      { title: '版本由会话服务维护', target: '接收影响事实、诉求或操作的新信息时递增 contextVersion；任务记录输入版本与证据依赖，不能由模型任意修改。', current: '只有物流快照 version 的确认比对，不能等同完整会话 contextVersion。' },
      { title: '旧结果须先核对再发布', target: '版本不一致时检查影响范围；可复用未变事实，受影响结论重核或重算。只有当前有效结果能进入回复队列。', current: '按会话串行，尚未实现并发任务结果淘汰。' },
      { title: '取消与写入分别处理', target: '分析任务协作式取消；取消失败仍可拒绝发布旧结果。已提交业务操作先查状态，不能承诺已撤销。', current: '已实现的是取消待确认动作；没有任务取消接口或真实外部操作撤销。' },
      { title: '一个声音，必要时才追问', target: '进度、追问、最终答复由同一协调器发布；高能力结果满足条件可直接输出，不强制轻量改写。', current: '同一界面展示单路演示回复，未运行两个真实模型并发。' }
    ],
    transport: [
      { type: '当前：POST + NDJSON', target: '可以继续保留 fetch 流，按换行解析 JSON；若要恢复与去重，应增加事件 ID、确认点和服务端事件存储。', current: '/api/chat 返回 application/x-ndjson，事件为 trace、token、complete、error；前端逐行读取，结束后重读会话。没有自动重放、恢复游标或任务取消。' },
      { type: '可选目标：SSE', target: 'text/event-stream 使用 event/data/id 帧；浏览器 EventSource 通常通过 GET 订阅，提交消息可用独立 POST。重连与 Last-Event-ID 仍需服务端保留事件并处理去重。', current: '当前没有 SSE endpoint；更换传输格式本身不会带来并发协调、持久化、撤销或恰好一次执行。' }
    ],
    timeline: [
      { id: 'sms-start', trigger: '用户：为什么 SF-3096 一直没更新，是不是丢件？', version: '目标示例 v2', visible: '正在核对记录与可采取的措施；目前不能判断丢件。', backend: '核查归属与物流事实，任务 A 绑定 v2 和证据引用；所有时长是演示种子。', current: '可操作本地延迟核查场景，但此并发时序为教学方案。' },
      { id: 'sms-note', trigger: '用户在分析中补充：短信说今天可能派送。', version: '目标示例 v3', visible: '已记录补充；短信内容仍待核实，暂不保证今天送达。', backend: '接收消息并标注为用户报告，更新上下文；只标记受影响的答复条件，不篡改物流 API 事实。', current: '当前 busy 时禁止同会话输入，不能在运行中操作此步骤。' },
      { id: 'sms-check', trigger: '任务 A 按 v2 返回“尚无派送信息”的旧结论。', version: '输入 v2 ≠ 当前 v3', visible: '先不向用户发送过时结论；进度只反映实际核对。', backend: '协调器核对依赖；复用未变事实，对短信和派送说法补核；必要时取消或重建受影响任务。', current: '当前没有任务依赖、取消或过时结果淘汰实现。' },
      { id: 'sms-reconcile', trigger: '补核后接口仍无新扫描，短信尚未被证实。', version: '当前有效 v3', visible: '物流记录尚未更新，短信所述派送仍待核实；可按适用规则申请催查。', backend: '统一事实和未知部分后发布一个答复；高能力模型不能凭短信承诺送达。', current: '实时核查仍为种子快照；不会查询真实短信或承运商。' },
      { id: 'sms-confirm', trigger: '用户查看预览并明确确认催查。', version: '绑定有效上下文与当前物流快照', visible: '正式接入后按真实创建结果回执；当前只能说本地记录已创建。', backend: '规则复核归属、资格、确认和幂等；新事实影响资格时要求重新确认。', current: '已实现物流快照绑定、确认和幂等内存建单；未通知真实承运商，无完整会话版本绑定。' }
    ],
    confirmation: {
      title: '确认按钮与自然语言确认的边界',
      target: '按钮提交稳定 actionId；自然语言确认也必须明确对应当前有效预览。若“好”或“可以”可能指别的诉求，应澄清；修改订单或办理内容后重建预览，不能让模型自行把闲聊授权为写入。',
      current: '当前只有确认/取消按钮发送 action 与 actionId，后端复核待确认事项。输入“确认”不等同受支持的动作确认，不会获得绕过按钮的业务写入权限。'
    }
  }
};
