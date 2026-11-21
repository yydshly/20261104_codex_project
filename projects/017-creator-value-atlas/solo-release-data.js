window.INDIE_SOLO_RELEASE = {
  date: "2026-11-21",
  version: 1,
  assumption: "面向已有可展示原型的单人 PC / Steam 小体量买断项目，安排 12 周发行准备与上线后 30 天复盘。它不是剩余开发工期承诺；任一关键检查未完成，就调整发布窗口。",
  conclusion: "先把作品讲清、让类型玩家玩懂，再用同一组物料做少量定向联系。把现金留给真实阻碍，给修复与玩家沟通留时间；完整发行团队的渠道矩阵只取其中能独立承担的环节。",
  defaults: { project: "我的小体量独立游戏", cashBudget: 500, weeklyHours: 5 },
  comparisons: [
    { caseId: "lovechoice", team: "制作人主导推广；原文不是单人全流程的证明", method: "明确特色，自己制作宣传片，联络媒体；移植后重查名称和付费入口。", cash: "2018 自述未向媒体付推广费；全套宣发费用未披露。", time: "作者称宣传片学习与制作约两天；其他联络与移植工时未完整披露。", reuse: "优先复用：一组实机物料＋少量匹配联系。先跑通一个平台，再评估移植。", pitfall: "零媒体付款仍有劳动成本；PC 成功不能证明移动端同样适配。", works: ["ya-promo", "ya-platforms"] },
    { caseId: "dyson", team: "研发团队＋专业发行协作", method: "类型玩家测试、社群维护、展会、配音与文案协助、海外联系。", cash: "所读访谈未披露宣发总预算及单渠道回报。", time: "存在多人分工，工作量与工时未公开；不能按单人的一天换算。", reuse: "拆小后复用：找类型玩家、列节点、持续沟通；每次只经营一个主渠道。", pitfall: "不照搬全渠道、社群与展会并行；整体成绩不能归给某个动作。", works: ["yq-dyson", "yq-nine"] },
    { caseId: "chuan-opera", team: "制作人与发行合作；该项目开发人数未披露", method: "线下试玩、结识发行伙伴、新品节与发售首周复盘。", cash: "作者称一次展位与背板免费；交通、住宿、人工及完整发行成本未披露。", time: "展会准备和现场占用时间；作者回看 Demo 细节与参展时机不匹配。", reuse: "有条件再选活动：先把核心体验打磨完整，预先定义要收集的反馈。", pitfall: "免费展位不是零参展成本；首周有曝光仍未必覆盖投入。", works: ["chuan-launch", "chuan-team"] },
    { caseId: "night-upstream", team: "团队作品；宣发与上线修复集中到作者身上", method: "内容传播、发售前宣传；上线后大量修复与宣传争夺精力。", cash: "约 1.47 万元是作者按当时条件估算的团队结算额，不能充当推广预算或利润。", time: "作者自述首周修复 101 个问题。询问主播报价没有成交，后来转做自己的内容。", reuse: "优先复用：上线前准备公告与常见问题，安排修复时段和最低沟通频率。", pitfall: "不因高额询价就推断必须买大主播；也别让一个人同时承担每日内容与抢修。", works: ["night-cash", "night-years"] },
    { caseId: "blue-island", team: "明确的单人作品", method: "开发日志与试玩；无付费宣发，首周结果低于作者预期。", cash: "前七个月直接支出约 1,579 美元；这是开发阶段账本，不是宣发预算，排除了生活费与机会成本。", time: "首周总结自述开发约一年半、累计 2,700 多小时；时间也要进入取舍。", reuse: "优先复用：现金、工时、生活资金分账，活动前写目标，发售后保留失利记录。", pitfall: "不能据此证明买量会改善销量；低工具费不代表低总成本，首周也不是终局。", works: ["blue-cost", "blue-launch"] }
  ],
  methods: [
    { name: "一组实机物料反复使用", priority: "先做", action: "写一句玩法描述，截一组真实画面，剪一段能看懂核心动作的短片；先发一个主渠道，下一次只换一个表达点。", cash: "已有工具与合法素材、自制时可不新增现金；外包按实际询价。", time: "主要是整理、剪辑与修改；给任务设截止时间。", evidence: ["ya-promo"], observe: "读者能否复述玩法？看到的是游戏还是概念包装？" },
    { name: "少量类型玩家试玩", priority: "先做", action: "先约 3–5 位没听过解释的目标玩家，观察启动、核心操作、卡点和结束；改最影响理解的一处，再换一批人。", cash: "自招愿意参与的玩家可不付推广费；招募与观察需要时间。", time: "试玩组织和记录；修复代码另排。", evidence: ["yq-dyson", "chuan-launch"], observe: "玩家实际做了什么？同一问题是否反复出现？" },
    { name: "少量匹配的创作者与媒体", priority: "接着做", action: "先列 10 个近期覆盖相近题材的账号，分两批各 5 个联系，说明匹配原因；有新版本或信息时再礼貌跟进一次。", cash: "私信或邮件联系本身可不付费；不承诺对方免费制作内容。", time: "逐个看内容、核对联系入口、准备针对性材料。", evidence: ["ya-promo", "yq-dyson"], observe: "记录发送、回复、是否产生内容以及可追踪访问；不按粉丝量直接排序。" },
    { name: "开发日志与玩家沟通", priority: "保持小规模", action: "一周优先交出一份有变化的实机内容，复用前面物料；固定回复时段，不要求每天发帖或同时维护多个群。", cash: "自制可不新增现金；持续占用制作时间。", time: "超出本周时间上限，就减少频率或暂停新渠道。", evidence: ["night-years", "night-cash"], observe: "是否有目标玩家提出具体问题？内容是否挤占原型和修复？" },
    { name: "Demo 活动与展会", priority: "满足条件再选", action: "先核对日期、资格、可玩版本与反馈能力；线下另外核算交通住宿和占用工时。日期不合适就改用常规试玩。", cash: "报名、场地、差旅分开；免费展位不能默认其他费用也免费。", time: "准备、参展、修复和后续回复都计入。", evidence: ["chuan-launch", "steam-nextfest"], observe: "活动带来哪些试玩行为和可解释反馈？与前后同等长度的窗口比较。" },
    { name: "付费推广或外包物料", priority: "可选实验", action: "明确卡在物料、触达还是体验之后，再对一个问题做封顶实验；先写预算、交付物和要观察的结果。", cash: "使用可承受损失的小额上限；本组案例不支持当前报价或稳定回报。", time: "沟通、修改、验收和复盘也要排时间。", evidence: ["night-years", "blue-launch", "steam-utm"], observe: "未解决核心体验、无法核对交付或跟踪失效时，停止追加支出。" }
  ],
  pitfalls: [
    { title: "把自制等同于零成本", text: "把剪片、联络、试玩、维护的工时记下来。开发费用、宣发费用与生活资金分别列，未知费用不填 0。", refs: ["ya-promo", "blue-cost"] },
    { title: "为了活动日期交出半成品", text: "先确认陌生玩家能玩到核心体验，再决定活动。新品节有一次参展等资格条件，选择窗口时回到现行官方文档。", refs: ["chuan-launch", "steam-nextfest"] },
    { title: "把销售、愿望单与净利润混算", text: "保留同一观察窗口与来源；愿望单存量、总销量和愿望单购买来源分开。团队到款再扣实际成本，才讨论盈余。", refs: ["night-cash", "chuan-launch", "blue-launch"] },
    { title: "单人同时经营所有渠道", text: "保留一个主渠道、一组复用物料、一个反馈入口。上线修复优先，提前写好公告和问题回复，超负荷时暂停新推广实验。", refs: ["yq-dyson", "night-cash"] },
    { title: "照抄旧名单或相信索要 Key 的身份", text: "联系前看账号近期内容与公开联系入口；只给匹配对象需要的访问方式，记录领取对象和版本，Key 类型与申请条件以官方为准。", refs: ["ya-promo", "steam-keys"] },
    { title: "用奖励换评测或把赠送当购买", text: "媒体评测副本与奖励换用户评测分别处理；不拿游戏、钱或其他奖励换评测，不操纵评分。直接按 Steam 官方规则执行。", refs: ["steam-reviews"] }
  ],
  budget: {
    note: "输入的是新增推广现金上限，人民币记账。默认 500 元只是可修改的规划示例；比例用于留出额度，不是市场报价、实际下单或收益预测。尚未询价的费用保持未知。",
    allocations: [
      { name: "核心表达与必要校对", share: 0.4, use: "只有真实阻碍已确认时，才给封面、短文本或关键物料询价；报价不合适就缩小范围或自己改。" },
      { name: "一个可记录的小实验", share: 0.2, use: "有可玩版本和明确观察问题时才使用。0 元方案先做自招试玩和免费联系。" },
      { name: "预备金", share: 0.4, use: "留给临时修正和意外情况，可以一直不花；不为了用完预算增加渠道。" }
    ],
    separate: [
      { name: "平台上架费", detail: "Steam Direct 每款新应用 100 美元或等值，可能有当地税费。达到官方规定的调整后总收入条件后才返还，不能先当作已回收；与人民币推广上限分列。", refs: ["steam-appfee"] },
      { name: "开发与素材", detail: "软件订阅、授权素材、必要硬件、开发外包与维护逐项记账；本计划不把它们藏进推广费。", refs: ["blue-cost"] },
      { name: "自己的时间与生活资金", detail: "每周推广占用的时间、生活可支撑期限与其他收入分别记录；宣传期间仍要留开发和修复时段。", refs: ["night-years", "blue-cost"] }
    ]
  },
  weeksBeforeLaunch: 12,
  phases: [
    { id: "solo-scope", window: "第 1–2 周", title: "确定受众、范围与预算", hours: 6, after: false, output: "一页定位、现金与工时账本、平台准备记录。", gate: "能说清核心体验与暂不做的功能；基本预算和发布前置条件已列出。否则继续缩范围。", refs: ["ya-promo", "blue-cost", "steam-onboarding"], tasks: [
      { id: "solo-position", text: "写一句话玩法、目标玩家与 3 个可比较作品，记录为什么选它们。" },
      { id: "solo-budget", text: "分别列开发、推广、生活与工时；设置推广现金上限和每周时间上限。" },
      { id: "solo-platform", text: "决定使用 Steam 后，按官方准备账号资料、应用费用与等待期，记录后台实际状态。" }
    ] },
    { id: "solo-page", window: "第 3–4 周", title: "做物料，准备公开商店落点", hours: 9, after: false, output: "实机短片、截图、一句话描述、商店审核与公开日期记录。", gate: "读者能够复述玩法；页面承诺与当前版本一致。平台未就绪时顺延，联系前应有可访问落点。", refs: ["ya-promo", "ya-platforms", "steam-review", "steam-release"], tasks: [
      { id: "solo-assets", text: "制作一段约 30–60 秒实机短片和一组截图；尺寸与内容要求逐项对照当前商店后台。" },
      { id: "solo-page-review", text: "核对名称、描述、语言、支持功能和价格，提交商店页审核并为修改预留时间。" },
      { id: "solo-links", text: "页面公开后记录日期，设置一个主发布渠道、一个反馈入口和可区分来源的链接。" }
    ] },
    { id: "solo-demo", window: "第 5–6 周", title: "让陌生玩家走完核心体验", hours: 6, after: false, output: "试玩观察、问题优先级与修改前后记录。", gate: "能启动、操作、体验核心规则并结束；阻断问题未解决就先修复，不扩大触达。", refs: ["yq-dyson", "chuan-launch"], tasks: [
      { id: "solo-testers", text: "约首批 3–5 位匹配类型的陌生玩家，在少解释的情况下观察试玩。" },
      { id: "solo-fix-loop", text: "记录卡点和退出位置，修最影响理解的一处，再请新玩家检查。" },
      { id: "solo-demo-pack", text: "准备版本号、操作说明、已知问题和反馈入口；核对下载后在别的机器上的表现。" }
    ] },
    { id: "solo-channel", window: "第 7–8 周", title: "分两批联系，复用同一组物料", hours: 8, after: false, output: "10 个候选的匹配理由、发送记录与渠道观察表。", gate: "能解释联系对象为什么适合，并有可访问资料和试玩方式；无回应时先查匹配与物料，不自动买更大流量。", refs: ["ya-promo", "yq-dyson", "steam-utm", "steam-keys"], tasks: [
      { id: "solo-targets", text: "找 10 位近期覆盖相似题材的作者或媒体，核对公开联系入口，分两批各 5 位。" },
      { id: "solo-contact", text: "按下面模板逐个改写联系内容；记录发送日期、回复、版本与访问方式，不要求正面内容。" },
      { id: "solo-channel-review", text: "每批后核对反馈和可追踪结果；有实质新信息时再跟进一次，保持一个主内容渠道。" }
    ] },
    { id: "solo-event", window: "第 9–10 周", title: "选择活动，或做一次常规试玩更新", hours: 5, after: false, output: "一个活动决定，以及同等长度的前、中、后观察窗口。", gate: "活动日期、资格、Demo 和响应能力均满足才参加；不满足就顺延或做常规试玩，不硬赶新品节。", refs: ["chuan-launch", "steam-nextfest", "steam-utm"], tasks: [
      { id: "solo-event-fit", text: "核对活动本届日期、资格、注册和审核要求；线下另外列交通、住宿和工时。" },
      { id: "solo-event-content", text: "准备可复用的演示与问题回复；没有适合活动时，安排一次带版本更新的常规试玩。" },
      { id: "solo-event-record", text: "按同等长度区间记录版本、内容、花费、试玩反馈和愿望单变化，标记同时发生的其他事件。" }
    ] },
    { id: "solo-ready", window: "第 11 周及更早的审核窗口", title: "冻结承诺，完成发布前检查", hours: 5, after: false, output: "近终版候选、平台状态、价格与首发物料。", gate: "版本和商店已获批准，等待期满足，关键体验无阻断；否则改日期。不要把预计审核完成当作已通过。", refs: ["steam-review", "steam-onboarding", "steam-release", "steam-pricing"], tasks: [
      { id: "solo-build-review", text: "按预定日期倒排版本送审，留修改缓冲；商店页至少提前 7 个工作日送审，具体进度看后台。" },
      { id: "solo-release-check", text: "在干净安装与所承诺系统上测试启动、存档、退出和核心流程；确认素材与版本一致。" },
      { id: "solo-price-support", text: "核对价格与可选折扣，写好发布公告、常见问题与反馈入口，给自己预留修复时间。" }
    ] },
    { id: "solo-launch", window: "第 12 周 · 条件满足后的发布窗口", title: "发布当天少做新事，先保证能玩", hours: 4, after: false, output: "可购买与启动的版本、公告和第一轮问题记录。", gate: "玩家能找到、购买、启动并玩到核心内容。出现严重阻断时暂停新增推广，优先修复与告知。", refs: ["night-cash", "steam-release", "steam-reviews"], tasks: [
      { id: "solo-publish", text: "最终核对后台条件和候选版本，在自己能响应问题的时间执行发布；审核通过不会自动发行。" },
      { id: "solo-announce", text: "发布已准备的实机内容与公告，把正式链接更新到原有入口和先前沟通过的对象。" },
      { id: "solo-monitor", text: "固定时段查看启动、存档与购买问题，记录版本并发布修复说明；不奖励换评测。" }
    ] },
    { id: "solo-post", window: "上线后第 1、7、30 天", title: "对账与复盘，再决定下一笔投入", hours: 6, after: true, output: "三个时间点的观察记录与一个下一轮假设。", gate: "知道数据遗漏和成本范围，才讨论追加投入；暂时无法解释的变化保持未知。", refs: ["night-cash", "chuan-launch", "blue-launch", "steam-utm"], tasks: [
      { id: "solo-post-record", text: "在第 1、7、30 天分别保存销量、退款、购买来源、愿望单与玩家问题，注明数据尚未结算的部分。" },
      { id: "solo-post-ledger", text: "按实际报表把销售、退款、费用、团队到款、直接支出和自己的工时分开，不混用币种与区间。" },
      { id: "solo-post-next", text: "只选一个可检验的下一步：改物料、改体验、换匹配对象或维持版本；预算到上限先停止新增支出。" }
    ] }
  ],
  weeklyRoutine: [
    { name: "实机内容", share: 0.3, action: "围绕一个变化复用短片、截图与文字；主渠道先行。" },
    { name: "玩家反馈", share: 0.3, action: "组织少量试玩、观察问题；修复代码时间另列。" },
    { name: "定向联系", share: 0.2, action: "研究与联系少量匹配对象，维护访问记录。" },
    { name: "数据记录", share: 0.1, action: "写清版本、事件、费用和不同指标的时间范围。" },
    { name: "沟通缓冲", share: 0.1, action: "固定时段答复问题；上线阶段优先把内容时间转给维护。" }
  ],
  records: [
    { title: "每次传播留一行", columns: ["日期／版本", "渠道与内容链接", "匹配人群与动作", "现金／工时", "可追踪访问／愿望单／购买来源", "试玩反馈／同期其他事件"] },
    { title: "账本至少分四类", columns: ["开发直接支出", "推广现金支出", "生活资金与其他收入", "各项工时及机会成本"] }
  ],
  contactTemplate: "主题：【游戏名】｜一款关于【核心玩法】的【类型】小作品\n\n你好，我看到你近期的【具体内容】涉及【相近题材】，所以想请你看看我的作品。\n玩家会【一句真实操作与目标】。这里是实机短片：【链接】；作品页：【链接】。\n已有【版本号／约试玩时长】的可玩版本，适用【系统与语言】。如果符合你的选题，我可以提供合适的试玩访问方式与资料。\n不要求正面评价；有无报道都欢迎反馈。若不适合你的安排，无须回复。\n\n【署名与可回复联系方式】",
  rules: [
    { title: "上架费用与返还条件", detail: "每款新应用 100 美元或等值，可能有当地税费；费用不可退款，达到至少 1,000 美元调整后总收入后才在后续支付中返还。", refs: ["steam-appfee"] },
    { title: "新开发者的等待时间", detail: "本轮 Steam Direct 官网对首几款作品写明：应用费支付与发行之间至少 21 天；账号资料核验也可能占用时间。以项目后台和现行页面为准。", refs: ["steam-onboarding"] },
    { title: "公开商店与发布审核", detail: "即将推出页面至少公开两周；商店与版本都要完成相应审核。商店页送审建议至少预留 7 个工作日，修改与版本审核另留缓冲。", refs: ["steam-release", "steam-review"] },
    { title: "新品节不是每次都能重试", detail: "按当前文档，每款游戏只能参加一版新品节，需满足未发行、商店公开及公开可玩 Demo 等要求。核对本届日期再做安排。", refs: ["steam-nextfest"] }
  ],
  documents: [
    { id: "steam-appfee", title: "Steamworks · Steam Direct 费用", url: "https://partner.steamgames.com/doc/gettingstarted/appfee?l=schinese", supports: "每应用 100 美元或等值、当地税费及达到调整后总收入条件后的费用返还；与推广预算分列。" },
    { id: "steam-onboarding", title: "Steam Direct · 登记与等待时间", url: "https://partner.steamgames.com/steamdirect", supports: "本轮页面写明首几款作品付费至发行至少 21 天，以及账号资料与商店公开等准备；后台状态与现行页面优先。" },
    { id: "steam-release", title: "Steamworks · 发行流程", url: "https://partner.steamgames.com/doc/store/releasing?l=schinese", supports: "商店和版本审核、即将推出页面至少公开两周，以及审核完成后由开发者执行发行。" },
    { id: "steam-review", title: "Steamworks · Review Process（更新后英文版）", url: "https://partner.steamgames.com/doc/store/review_process?language=english", supports: "中文页面提示英文已更新。本轮核对英文版的商店送审提前量、干净安装测试及商店与版本一致性。" },
    { id: "steam-keys", title: "Steamworks · Steam 序列号", url: "https://partner.steamgames.com/doc/features/keys?l=schinese", supports: "核对测试与媒体访问的 Key 类型、申请和发放要求；不把索要 Key 当作身份已验证。" },
    { id: "steam-reviews", title: "Steamworks · User Reviews", url: "https://partner.steamgames.com/doc/store/reviews?l=english", supports: "用户评测与开发者使用规则，包括操纵、奖励换评测及媒体副本的区别。" }
  ]
};
