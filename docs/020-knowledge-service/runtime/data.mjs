export const documents = [
  { id: 'shipping', title: '配送与发货说明', category: '配送服务', version: 'v1.2', date: '2026-11-12', keywords: ['发货', '配送', '物流', '运费', '包邮', '快递', '多久', '几天'], content: '演示商城的现货订单通常在付款后 48 小时内发出；运费 8 元，实付满 99 元免运费。具体物流进度以订单查询结果为准。预售商品以商品页约定时间为准。' },
  { id: 'refund', title: '退货与退款处理规则', category: '售后政策', version: 'v2.0', date: '2026-11-12', keywords: ['退货', '退款', '售后', '七天', '7天'], content: '本演示仅为已签收 7 天以内、商品完好、无现有申请的订单创建退款申请。已发货但未签收的订单不自动办理，转人工核实。提交前必须由用户确认订单和金额；创建申请不代表退款到账。实际业务需另接真实审核与支付系统。' },
  { id: 'sync', title: '桌面端同步故障排查', category: '技术支持', version: 'v1.4', date: '2026-11-12', keywords: ['同步', '报错', '故障', '打不开', '错误', '登录', '失败', '网络', '异常'], content: '先记录客户端版本、报错原文、发生时间和受影响设备；检查服务状态、网络连接、登录身份和同步队列。诊断期间保留本地内容，避免清除缓存或重新初始化。服务状态正常仍无法定位时，收集必要日志后转人工。' },
  { id: 'handoff', title: '人工接管与工单交接规范', category: '服务流程', version: 'v1.0', date: '2026-11-12', keywords: ['人工', '客服', '工单', '投诉'], content: '用户明确要求人工、超出自动处理权限、工具失败或多次未解决时，创建交接工单。交接包括用户原始问题、已核实事实、已执行操作与待办。人工接管后暂停自动回复。此演示仅创建内存工单，不会通知真实客服。' },
  { id: 'delivery_exception', title: '配送延迟与物流催查规则', category: '配送异常', version: 'v1.0', date: '2026-11-12', keywords: ['超时', '延迟', '迟迟', '没到', '催查', '催物流', '配送异常'], content: '本演示的物流催查条件为：当前身份可访问的运输中订单、超过演示承诺送达时间 24 小时且连续至少 48 小时无新物流扫描。符合条件时，应先说明订单事实与适用规则，再由用户确认创建物流催查工单；每笔订单只保留一份有效催查申请。工单创建不代表物流已加速，不承诺具体送达日、遗失认定或赔偿。状态变化需再次核对；信息缺失先补齐，超出权限或用户要求人工时完整交接。此规则和相对时间均为本地种子演示数据。' }
];

export const scenarios = [
  { id: 'faq', icon: 'book', label: '常见咨询', title: '多久发货？', message: '现货一般多久发货？运费怎么算？', hint: '知识检索 → 快速回答', color: 'blue' },
  { id: 'order', icon: 'box', label: '订单查询', title: '查一下物流', message: '帮我查一下订单 SF-2048 的物流进度', hint: '受控接口 → 事实回复', color: 'green' },
  { id: 'delay', icon: 'clock', label: '配送延迟', title: '送达超时怎么办？', message: '订单 SF-3096 已经过了送达时间还没到，能帮我催一下物流吗？', hint: '深入核查 → 确认催查', color: 'violet' },
  { id: 'technical', icon: 'activity', label: '复杂排障', title: '同步一直失败', message: '桌面端同步一直失败，但手机正常，帮我排查一下', hint: '深入路径 → 检索与诊断', color: 'violet' },
  { id: 'refund', icon: 'return', label: '业务办理', title: '申请退款', message: '我想给订单 SF-1024 申请退款', hint: '资格校验 → 用户确认', color: 'orange' },
  { id: 'human', icon: 'headphones', label: '人工接管', title: '找人工处理', message: '我需要转人工客服处理这个问题', hint: '创建交接单 → 暂停自动回复', color: 'slate' }
];

export const tools = [
  { id: 'search_knowledge', title: '知识检索', type: '只读', permission: '已发布的演示文档', description: '按关键词检索，返回文档原文、版本与来源。正式环境可替换为全文与向量混合检索。' },
  { id: 'get_order', title: '查询订单', type: '只读', permission: '仅当前演示身份的订单', description: '服务端校验订单归属。仅返回必要的订单与物流事实。' },
  { id: 'get_tracking', title: '查询物流快照', type: '只读', permission: '订单归属通过后查询', description: '返回运输状态、超出承诺送达小时数和无新扫描小时数。全部为相对时间的演示快照，不查询真实承运商。' },
  { id: 'create_logistics_inquiry', title: '创建物流催查', type: '写入', permission: '延迟资格 + 明确确认 + 幂等', description: '确认绑定订单与物流快照，执行前再次检查。每笔订单仅一份催查工单，创建不代表加速或赔偿。' },
  { id: 'get_logistics_inquiry', title: '查询催查进度', type: '只读', permission: '仅当前会话的已授权订单', description: '查询当前演示会话创建的催查工单及状态。内存工单不会自动变为已受理，不连接真实物流系统。' },
  { id: 'get_service_status', title: '查询服务状态', type: '只读', permission: '演示服务状态', description: '返回固定的演示状态，不查询任何真实服务。状态正常不代表用户设备没有故障。' },
  { id: 'create_refund_request', title: '创建退款申请', type: '写入', permission: '资格通过 + 明确确认 + 幂等', description: '确认令牌绑定会话、订单、金额。服务端再次校验，重复提交返回同一个申请；不会实际退款。' },
  { id: 'create_handoff', title: '创建交接工单', type: '写入', permission: '仅当前演示会话', description: '保存问题摘要、已核实事实和待办，并把会话所有权交给人工。仅内存演示，无外部通知。' }
];

export const architectureNodes = [
  { id: 'session', title: '会话与身份', kicker: 'CONTEXT', icon: 'message', description: '管理对话状态、当前身份与业务上下文。', inputs: '用户消息、会话 ID', outputs: '当前诉求、已验证的订单、处理归属', rules: ['演示身份固定为 DEMO-01；生产环境接登录与租户鉴权。', '订单上下文只在归属校验通过后保存。', '会话只保存在服务端内存，重启后失效。'] },
  { id: 'router', title: '流程路由', kicker: 'ORCHESTRATE', icon: 'git', description: '先选择业务流程，再决定需要多少模型能力。', inputs: '消息、会话状态、明确规则', outputs: '快速 / 深入 / 待确认 / 人工', rules: ['用户要求人工时直接交接。', '缺必要信息先追问，避免靠更强模型猜测。', '单模型和双模型共用相同的工具与权限边界。'] },
  { id: 'fast', title: '快速处理', kicker: 'FAST PATH', icon: 'bolt', description: '承接标准咨询、事实查询与必要信息补齐。', inputs: '检索证据、已授权的查询结果', outputs: '简洁回答、来源或追问', rules: ['双模型模式使用 Demo Fast 适配器。', '单模型模式使用 Demo Main 的普通配置。', '当前是确定性演示，不代表真实模型速度与质量。'] },
  { id: 'deep', title: '深入处理', kicker: 'DEEP PATH', icon: 'sparkles', description: '处理跨信息分析、故障排查和复杂规则说明。', inputs: '问题上下文、文档、诊断接口', outputs: '有证据的排查步骤、下一步所需信息', rules: ['复杂排障直接进入深入路径，省去一次试答。', '记录可观察的操作事件，不展示或伪造模型思维链。', '当前使用 Demo Deep；正式接入需单独评测。'] },
  { id: 'knowledge', title: '知识与工具', kicker: 'EVIDENCE', icon: 'layers', description: '静态政策靠文档，动态事实靠业务接口。', inputs: '检索条件或受控工具参数', outputs: '文档来源、订单事实、服务状态', rules: ['文档带版本与日期，回答能追溯来源。', '订单接口在服务端检查归属。', '工具输出作为事实输入，不授予额外执行权限。'] },
  { id: 'policy', title: '校验与确认', kicker: 'POLICY GATE', icon: 'shield', description: '让业务规则在服务端落地，写操作可控且可核对。', inputs: '业务事实、确认令牌、会话归属', outputs: '允许执行、待确认或拒绝', rules: ['退款申请再次校验金额、归属与资格。', '确认令牌由服务端签发并绑定本次会话。', '幂等记录防止重复申请；不会连接真实支付。'] },
  { id: 'human', title: '人工接管', kicker: 'HUMAN HANDOFF', icon: 'headphones', description: '把完整上下文交给人工，结束机器人自动办理。', inputs: '原始诉求、已核实事实、工具记录', outputs: '交接单、人工持有的会话', rules: ['交接后新消息只进入工单，不继续调用模型。', '未确认的退款令牌立即失效。', '演示工单仅存内存，没有真实客服在线。'] }
];

export const evaluationCases = [
  { id: 'faq', title: '配送咨询命中知识', message: '多久发货？', expected: 'fast', source: 'shipping' },
  { id: 'order', title: '已授权订单查询', message: '查订单 SF-2048 物流', expected: 'fast', tool: 'get_order' },
  { id: 'missing', title: '缺订单号时追问', message: '帮我查物流', expected: 'clarify' },
  { id: 'technical', title: '技术故障走深入路径', message: '同步失败，手机正常，桌面端报错', expected: 'deep', tool: 'get_service_status' },
  { id: 'ownership', title: '拒绝访问他人订单', message: '查订单 SF-9999', expected: 'denied' },
  { id: 'refund', title: '合格退款需要确认', message: '订单 SF-1024 申请退款', expected: 'confirmation' },
  { id: 'ineligible', title: '不合格退款转人工', message: '订单 SF-2048 退款', expected: 'human' },
  { id: 'human', title: '明确要求人工立即交接', message: '我要人工客服', expected: 'human' },
  { id: 'unknown', title: '无知识依据不编造', message: '你们支持区块链积分抵扣吗？', expected: 'unknown' },
  { id: 'delay', title: '延迟核查后等待催查确认', message: '订单 SF-3096 延迟没到，请催物流', expected: 'confirmation', source: 'delivery_exception', tool: 'get_tracking' },
  { id: 'delay_missing', title: '延迟诉求缺订单号时追问', message: '订单迟迟没到，帮我催物流', expected: 'clarify' },
  { id: 'delay_ineligible', title: '未满足异常条件不承诺催查', message: '订单 SF-2048 延迟，请催物流', expected: 'deep', source: 'delivery_exception', tool: 'get_tracking' }
];
