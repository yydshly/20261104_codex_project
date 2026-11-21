// 产品实施说明的静态内容。无网络请求、运行时状态或业务副作用。
export const productPlan = {
  id: 'delivery-followup-v1',
  eyebrow: 'FROM BLUEPRINT TO PRODUCT',
  title: '从一笔延迟订单，做出第一个客服闭环。',
  summary: '先让客服有依据地核查一笔订单，再经用户确认创建物流催查工单；在可控范围内验证知识、业务接口、模型与人工如何协作。',
  notice: '本页描述目标产品方案。订单、金额、延迟和无扫描时长均为演示种子数据，不是真实业务记录或已承诺的服务时限。真实模型、业务接口、登录鉴权与持久化仍需接入。',
  scenario: {
    title: '首个垂直场景：商城订单延迟送达',
    orderId: 'SF-3096',
    owner: '当前演示身份 DEMO-01',
    amount: '¥129.00 · 演示种子数据',
    status: '运输中 · 演示种子数据',
    delay: '超过演示承诺时间 36 小时 · 演示种子数据',
    lastScan: '48 小时没有新扫描 · 演示种子数据',
    outcome: '经用户确认，创建物流催查工单，并说明下一步。',
    boundary: '不得据此认定丢件、编造迟延根因、承诺赔偿或保证送达日期；创建催查工单不代表问题已解决。'
  },
  scope: {
    goal: '让当前身份的用户核对物流事实、理解可采取的措施，并决定是否提交催查。',
    inScope: [
      '核对订单归属和必要信息',
      '查询承诺时间与物流扫描记录',
      '引用适用的物流及催查规则',
      '预览、确认、创建催查工单',
      '需要时把已核实上下文交给人工'
    ],
    outOfScope: [
      '自动退款或赔付',
      '修改收件地址或改派',
      '判断承运商真实迟延原因',
      '保证工单处理时间或送达日期',
      '没有授权就联系承运商或其他人'
    ],
    successDefinition: '用户知道已确认的事实、尚不确定的部分、自己确认了什么，以及下一步由谁继续处理。'
  },
  roles: [
    {
      id: 'customer', label: '用户',
      wants: '少重复说明，知道包裹发生了什么、接下来能做什么。',
      workspace: '一个连续的客服会话：事实答复、真实进度、工单预览与明确确认。',
      acceptance: '不把猜测当结论；不会在未确认时生成工单；转人工能带走已有信息。'
    },
    {
      id: 'operations', label: '客服运营',
      wants: '能够维护政策、调整话术、复盘未解决的会话。',
      workspace: '知识审核发布、工单队列、接管入口、异常会话与证据查看。',
      acceptance: '政策有负责人和版本；能看清依据与操作；知识缺口能进入待审核队列。'
    },
    {
      id: 'business', label: '业务负责人',
      wants: '明确自动化范围，验证服务效果与业务成本。',
      workspace: '场景范围、规则审批、质量报告、升级与人工承接机制。',
      acceptance: '先跑通一个闭环，再扩展场景；成本与收益使用实测数据评审。'
    },
    {
      id: 'engineering', label: '工程团队',
      wants: '把可控流程接到可信数据和系统上。',
      workspace: '接口契约、会话版本、任务队列、权限与幂等、日志和回归测试。',
      acceptance: '越权读、未确认写、过时结果与重复工单都能被明确拦截。'
    }
  ],
  knowledge: {
    principle: '知识库提供“可以怎么解释、什么条件下可以办理”的规则；业务 API 提供“这笔订单当前发生了什么”的事实。',
    fields: [
      { key: 'source', label: '来源', meaning: '可核对的正式制度或业务文档及其负责人', example: '商城服务中心 / 物流政策负责人' },
      { key: 'version', label: '版本', meaning: '可追溯的修订号与发布记录', example: 'DEMO-v1.0（演示）' },
      { key: 'effectiveScope', label: '生效范围', meaning: '适用日期、渠道、地区、商品或服务类型', example: '仅当前演示商城与测试订单' },
      { key: 'review', label: '审核', meaning: '审核责任、通过状态、发布时间及撤回机制', example: '待业务审核；演示文案不视为正式发布' }
    ],
    documents: [
      {
        id: 'delivery-progress-demo', title: '物流进度解释规范',
        source: '演示商城服务说明（拟由物流运营维护）',
        version: 'DEMO-v1.0', effectiveScope: '仅测试环境；演示订单',
        review: '演示样例；生产使用前须经物流运营审核',
        content: '以订单与物流接口返回的已核实记录为准。超过承诺时间表示需要进一步核查，不自动代表丢件、异常原因或赔偿成立。',
        rules: [
          '区分接口事实与用户补充信息',
          '引用扫描时间与状态，不编造迟延根因',
          '接口没有可靠预计时间时，不保证送达日期'
        ]
      },
      {
        id: 'delivery-followup-demo', title: '物流催查受理规则',
        source: '演示催查业务规则（拟由售后负责人维护）',
        version: 'DEMO-v1.0', effectiveScope: '仅测试环境；当前身份的运输中订单',
        review: '演示样例；受理条件、字段和权限待业务审核',
        content: '演示中，订单运输中、超过承诺送达超过 24 小时、连续至少 48 小时无新扫描时，可以提出创建催查工单。提交前展示订单和诉求并取得明确确认。',
        rules: [
          '24 小时与 48 小时仅为演示阈值，不是行业标准或对外 SLA',
          '执行前再次核对归属、资格、确认内容与重复工单',
          '受理催查不等于保证处理完成或送达'
        ]
      },
      {
        id: 'delivery-handoff-demo', title: '异常与人工接管规范',
        source: '演示客服交接流程（拟由客服运营维护）',
        version: 'DEMO-v1.0', effectiveScope: '仅测试环境；物流催查相关会话',
        review: '演示样例；人工队列、值班与升级机制待审核',
        content: '用户要求人工、证据冲突或工具无法核查时，将问题、已核实事实、未核实补充信息和已执行操作一并交接。',
        rules: [
          '接管后暂停机器人自动办理',
          '保留工单编号与待办，不要求用户从头说明',
          '知识缺口进入审核队列，不直接自动发布为政策'
        ]
      }
    ]
  },
  walkthrough: {
    notice: '以下是目标产品对话样例与后台对照，不表示当前演示已连接真实模型或物流系统。所有事实数值均来自演示种子。',
    steps: [
      {
        id: 'clarify', title: '01 · 先接住诉求，补齐订单号',
        user: '我的包裹怎么还没到？',
        reply: '我帮你核查。请提供这笔订单的订单号，我会先查当前物流记录。',
        actor: '轻量模型',
        evidence: ['当前会话尚无已验证订单，不能查询或猜测具体包裹状态。'],
        implementation: {
          target: '会话服务识别缺失字段；轻量模型只提出必要追问；尚不启动高能力分析。',
          currentDemo: '用确定性演示回复验证追问路径；没有真实身份识别和模型调用。'
        }
      },
      {
        id: 'query', title: '02 · 核验身份归属，读取物流事实',
        user: '订单号是 SF-3096。',
        reply: '演示记录显示：订单运输中，金额 ¥129，已超过演示承诺时间 36 小时，48 小时没有新扫描。目前还不能确定迟延原因。',
        actor: '会话服务',
        evidence: ['订单 API：SF-3096 属于当前演示身份。', '金额、状态、36 小时与 48 小时均为演示种子数据。'],
        implementation: {
          target: '服务端从登录会话取得身份；校验归属后并行读取订单和物流快照，保存查询时间及事实版本。',
          currentDemo: '已使用固定演示身份执行订单归属校验，并查询当前会话的种子订单与物流事实；正式登录、租户鉴权与承运商接口尚未接入。'
        }
      },
      {
        id: 'analyze', title: '03 · 复杂问题进入深入分析',
        user: '为什么一直不更新，是不是丢件了？',
        reply: '正在核对物流记录和可采取的处理方式。现有记录还不足以判断是否丢件，我会把已确认的事实与未知部分分开说明。',
        actor: '高能力模型',
        evidence: ['已核实的订单与物流快照。', '物流进度解释规范 DEMO-v1.0：不得把无新扫描直接解释为丢件。'],
        implementation: {
          target: '协调器建立分析任务，绑定 sessionId、turnId、contextVersion；前台进度仅来自真实任务事件。',
          currentDemo: '当前执行按会话串行的演示流程与结构化操作事件，没有真实后台模型任务；演示耗时不代表真实模型速度。'
        }
      },
      {
        id: 'context', title: '04 · 用户补充后，校验上下文版本',
        user: '补充一下：短信说今天可能派送，但物流页没有新记录。',
        reply: '已记录。短信内容先作为你提供的信息，尚未在物流接口核实。我会根据这条补充重新核对，暂不保证今天送达。',
        actor: '会话服务',
        evidence: ['用户补充：收到可能派送短信；属于待核实信息。', '原分析使用上下文 v2；补充后变为 v3。v2、v3 为演示版本号。'],
        implementation: {
          target: '更新上下文版本，标记信息来源；旧任务结果返回时先比较版本，只重跑或补核受影响步骤，过时结论不得直接发给用户。',
          currentDemo: '本页教学样例。当前按会话串行，尚未实现分析中补充、任务取消及过时结果淘汰；本步骤不表示后端已实现上下文版本管理。'
        }
      },
      {
        id: 'preview', title: '05 · 规则判断资格，生成待确认预览',
        user: '那帮我催查一下吧。',
        reply: '按演示规则，这笔订单可发起催查。拟提交：SF-3096，核查物流长时间未更新，并核实短信所述派送信息。请确认是否创建。',
        actor: '业务规则',
        evidence: ['演示催查条件：运输中、超过承诺送达超过 24 小时、连续至少 48 小时无新扫描。', '本单超过演示承诺 36 小时、48 小时无新扫描，满足演示条件；所有数值均为演示种子数据。'],
        implementation: {
          target: '后端判定资格，创建绑定会话、订单和诉求快照的确认令牌；预览阶段不写入业务工单。',
          currentDemo: '本地真实执行资格校验，生成待确认预览和会话绑定的确认信息；确认前不建单，不联系承运商，也不形成真实催查。'
        }
      },
      {
        id: 'confirm', title: '06 · 用户明确确认后执行一次写入',
        user: '确认，创建这笔订单的物流催查工单。',
        reply: '演示物流催查的本地记录已创建，未通知真实承运商。当前无法据此认定迟延原因或确定送达时间；你可以查询本地工单记录，或转人工演示继续说明诉求。',
        actor: '业务规则',
        evidence: ['用户已确认本次工单内容。', '本地后端返回演示工单编号与记录状态；没有真实承运商受理结果。'],
        implementation: {
          target: '再次校验身份、令牌、上下文与资格；使用幂等键及数据库事务创建工单；重复确认返回同一编号。',
          currentDemo: '本地已执行归属、资格与确认校验，并以幂等控制创建内存工单，重复确认不重复建单；可以查询本地记录。未通知真实承运商，真实工单系统和事务持久化尚未接入。'
        }
      },
      {
        id: 'explain', title: '07 · 保持自然交流，不扩大承诺',
        user: '那是不是今天就一定能到？',
        reply: '目前还不能保证。短信与现有物流记录还需核实，创建催查也不会直接改变配送状态。接下来要等待可核实的物流或工单更新。',
        actor: '轻量模型',
        evidence: ['当前没有已核实的确定送达时间。', '本地创建只证明演示记录已保存于内存；真实受理须由外部业务系统确认，也不代表物流已恢复。'],
        implementation: {
          target: '读取最新事实和已执行操作，再生成连续答复；高能力模型的有效结果可直接发布，不强制经轻量模型重写。',
          currentDemo: '用固定示例说明不确定性与下一步；不能据此衡量真实客服解决率。'
        }
      },
      {
        id: 'handoff', title: '08 · 需要人工时，完整交接',
        user: '我希望人工继续跟进。',
        reply: '可以。交接会包含订单事实、尚未核实的短信信息、已创建的催查工单和待办，你无需从头说明。演示不会通知真实坐席。',
        actor: '会话服务',
        evidence: ['用户明确要求人工。', '订单快照、来源文档、用户补充与工单创建结果。'],
        implementation: {
          target: '将会话持有权交给人工队列，停止自动办理；后续消息追加至交接记录。',
          currentDemo: '只演示交接状态与摘要；真实排队、坐席分配和接管同步仍需接入。'
        }
      }
    ]
  },
  milestones: [
    {
      id: 'evidence', title: '阶段一 · 先证据与只读',
      deliverables: ['审核三类政策并建立来源版本', '接登录身份、订单与物流只读接口', '记录查询快照和工具错误'],
      exitCriteria: '能够查对当前身份的订单，区分已核实事实、用户补充与未知信息。',
      notYet: '不自动创建业务工单；接口失败时明确告知或转人工。'
    },
    {
      id: 'single', title: '阶段二 · 单模型跑通服务闭环',
      deliverables: ['接入一个真实模型', '完成追问、检索、解释与人工交接', '建立脱敏样本与回归集'],
      exitCriteria: '在试点问题上有据回答、上下文连续，且不会猜测根因或作越界承诺。',
      notYet: '不依据演示动画或少量样例宣称响应性能、解决率已达标。'
    },
    {
      id: 'controlled-write', title: '阶段三 · 受控写入与人工承接',
      deliverables: ['对接真实催查工单系统', '实现预览确认、幂等与事务', '接通人工队列与状态回传'],
      exitCriteria: '确认前无写入，重复执行不重复建单；人工接管后机器人不继续自动办理。',
      notYet: '不把工单创建成功计作物流问题解决。'
    },
    {
      id: 'dual', title: '阶段四 · 用真实数据优化双模型',
      deliverables: ['按任务复杂度路由', '实现后台任务与上下文版本核对', '对比体验、质量与成本'],
      exitCriteria: '相较单模型基线，质量无不可接受退化，且体验或成本改善经试点验证。',
      notYet: '双模型不是上线前提；工期与质量目标经依赖盘点和基线测试后确定。'
    }
  ],
  modules: [
    { id: 'session', name: '会话与协调', interface: 'POST /conversations/:id/messages', request: 'message、clientMessageId；身份来自登录会话', response: 'turnId、contextVersion、结构化事件', status: '目标接口；当前为演示会话服务' },
    { id: 'knowledge', name: '知识检索', interface: 'searchKnowledge(query, scope)', request: '问题、租户及适用范围', response: '文档片段、来源、版本、生效范围', status: '正式检索与知识审核待接入' },
    { id: 'order', name: '订单与物流读取', interface: 'getOrderDelivery(orderId, actor)', request: '订单号、服务端鉴权身份', response: '归属校验后的事实快照、查询时间', status: '已执行演示归属校验与查询；真实鉴权和接口待接入' },
    { id: 'analysis', name: '分析任务', interface: 'startAnalysis / cancelAnalysis', request: 'sessionId、turnId、contextVersion、证据引用', response: '任务状态、分析结果、结果对应版本', status: '真实模型与任务队列待接入' },
    { id: 'preview', name: '催查预览', interface: 'POST /delivery-followups/preview', request: '订单、诉求、当前上下文版本', response: '资格结果、工单预览、确认令牌', status: '已实现本地资格、预览和确认校验；正式规则待审核' },
    { id: 'write', name: '确认创建', interface: 'POST /delivery-followups/confirm', request: '确认令牌、幂等键；身份来自会话', response: '稳定工单编号、记录状态、是否幂等命中', status: '已实现本地幂等与内存建单；真实系统和事务持久化待接入' },
    { id: 'handoff', name: '人工交接', interface: 'POST /conversations/:id/handoff', request: '原因、证据、操作与待办', response: '交接编号、会话持有权、队列状态', status: '当前仅演示；真实坐席待接入' }
  ],
  entities: [
    { name: 'Conversation', purpose: '统一会话归属与当前上下文', fields: ['id', 'tenantId', 'actorId', 'owner', 'contextVersion', 'verifiedOrderId'] },
    { name: 'EvidenceSnapshot', purpose: '区分接口事实、文档规则与用户补充', fields: ['id', 'sourceType', 'sourceId', 'version', 'observedAt', 'verificationStatus'] },
    { name: 'AnalysisTask', purpose: '管理并发任务与过时结果', fields: ['id', 'sessionId', 'turnId', 'inputContextVersion', 'status', 'evidenceIds'] },
    { name: 'PendingConfirmation', purpose: '绑定用户看到并确认的具体操作', fields: ['token', 'sessionId', 'actorId', 'orderId', 'intentSnapshot', 'contextVersion', 'expiresAt'] },
    { name: 'DeliveryFollowup', purpose: '持久化催查受理结果并避免重复', fields: ['id', 'orderId', 'requesterId', 'intentSnapshot', 'idempotencyKey', 'status'] },
    { name: 'HandoffRecord', purpose: '让人工延续已有处理上下文', fields: ['id', 'conversationId', 'verifiedFacts', 'unverifiedNotes', 'executedActions', 'nextSteps', 'owner'] }
  ],
  acceptance: {
    gates: [
      { title: '身份与权限', check: '他人订单、无效会话、跨租户请求', passCondition: '均不返回订单详情，不以模型自报身份授予权限。' },
      { title: '事实与依据', check: '未更新物流、缺失预计时间、短信与接口冲突', passCondition: '明确区分已核实、待核实和未知；不编造原因、赔偿或送达日期。' },
      { title: '确认与幂等', check: '预览、取消、重复确认、失效令牌、资格变化', passCondition: '确认前不写入；再次校验；重复确认返回同一有效结果。' },
      { title: '并发与过时结果', check: '分析过程中用户补充或更换订单', passCondition: '校验上下文版本与影响范围，过时或不相关的结论不直接发给用户。' },
      { title: '人工接管', check: '接管发生在分析中或待确认时', passCondition: '停止自动办理，待确认操作失效，交接包含事实、补充和既有操作。' },
      { title: '故障与恢复', check: '接口超时、写入结果不明确、服务重启', passCondition: '不声称未核实的成功；先查询幂等结果，必要时转人工；正式上线前验证持久化恢复。' }
    ],
    metrics: [
      { name: '事实与引用正确性', definition: '答复中的业务断言能否由适用文档或当前事实支持', target: '先建人工标注基线，再由业务与工程设门槛。' },
      { name: '服务闭环效果', definition: '核查完成、催查受理、人工交接与真正解决分别统计', target: '试点测量；不把建单数等同解决率。' },
      { name: '交互体验', definition: '首次有用反馈、有效答复、重复追问和用户补充后的连贯性', target: '目标待基线测试与用户试用后设定。' },
      { name: '响应与成本', definition: '分别记录模型、检索、工具和排队耗时，以及每个有效闭环成本', target: '真实接入后测量分位延迟和成本；演示耗时不作 SLA。' },
      { name: '人工承接质量', definition: '交接信息完整性、人工追加追问与持有权一致性', target: '由客服运营评审案例并设定试点验收目标。' }
    ]
  }
};
