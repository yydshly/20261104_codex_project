// Research snapshot: 2026-11-21. No case below is a recommendation to start building.
// Product examples are illustrations, not verified customer accounts.
// Payment evidence belongs to the whole existing product, not a proposed narrow feature.
// Source kinds identify provenance, not independent verification of every claim on a page.
window.STUDY_CASES = [
  {
    id: 'postiz',
    name: 'Postiz',
    type: '社交媒体发布与排期',
    plain: '把多个社交账号接到一个工作台，提前安排帖子什么时候发，也能让 AI 调用它完成发布。',
    example: '场景示意：经营三个社交账号的人一次准备一周内容，再按各平台时间发布；这不是本研究核实的具体客户。',
    status: 'reference',
    verdict: '参考它如何接住已有工作流；不建议一个人从头复制完整社媒管理平台。',
    demand: '官网能看到多账号排期、团队审核和自动化集成等明确任务。产品存在不等于这些任务在你能接触的人群中都有付费需求。',
    payment: '核查时托管套餐为每月 29 / 39 / 49 / 99 美元，按可连接账号数等区分；开源版可自行部署。付费托管可省部署与运行维护，这是套餐价值解释，不是已核实的购买动机。整站收入不能证明任意一个小功能值得单独收费。',
    acquisition: '创始人自述通过 r/selfhosted、DEV 教程、自托管目录、YouTube 及 n8n 等集成接触用户；公开仓库与文档确实存在。作者有此前开源与 SEO 经验，不能把这些入口直接当作已核实的成交贡献或零基础可复制路径。',
    solo: '平台覆盖多个外部服务，账号授权、审核、接口变化和发布失败都需要维护；创始人既有开源经验也不是新手可直接复制的条件。',
    aiGap: 'AI 已能写帖并调用发布工具。潜在价值在授权连接、排期执行、失败处理与审核记录，需要以真实任务检验，不能只卖一层生成界面。',
    limits: '未核实你的获客渠道、平台接入成本和首批付费用户；不据整站规模推导你的机会。',
    sources: [
      { label: '官网：当前功能与集成', url: 'https://postiz.com/', kind: 'official' },
      { label: '官方开源仓库', url: 'https://github.com/gitroomhq/postiz-app', kind: 'official' },
      { label: '官网：核查时的托管套餐', url: 'https://postiz.com/pricing', kind: 'official' },
      { label: '创始人自述：开源项目的获客与经历', url: 'https://dev.to/nevodavid/you-can-get-your-financial-freedom-with-open-source-in-2025-41i8', kind: 'founder' },
      { label: '闷声发大财案例：含估算与推论', url: 'https://msfdcszhd.com/s/postiz.com/', kind: 'catalog' }
    ]
  },
  {
    id: 'tally',
    name: 'Tally',
    type: '在线表单',
    plain: '像写文档一样做报名表、调查表或资料收集表，再发一个链接让别人填写。',
    example: '场景示意：活动组织者用一个表收报名、附件和付款信息；此例用于解释产品，不代表本研究访谈过该客户。',
    status: 'reference',
    verdict: '参考作者所述的免费表单传播与付费升级机制，不复制通用表单全套。',
    demand: '报名、反馈和信息收集是可辨认的任务。官网展示了条件逻辑、文件上传与支付，但没有替你验证某个细分表单场景的购买意愿。',
    payment: '免费版在公平使用范围内不限表单和提交；核查时 Pro 为每月 29 美元，或每年 290 美元。付费套餐提供去品牌、自定义域名、协作和更深入的管理能力。这说明升级范围，不能推定每位客户的购买原因。',
    acquisition: '共享表单可形成品牌曝光。创始人回顾称早期逐个联系用户，后续增长也有作者自述；本研究未独立核实各渠道的成交贡献，曝光不等于注册或付费。',
    solo: '它已经是成熟服务，不能因起步团队小，就把现在的功能、可靠性和支持工作量视为一个人的轻项目。',
    aiGap: 'AI 能生成问题和表单代码；收集提交、通知、支付、权限和长期可用的链接仍是完整服务的一部分。具体差异要通过任务对照确认。',
    limits: '没有一个已验证的新细分需求；这里保留商业机制，不把目录流量或付费页访问换算为销售。',
    sources: [
      { label: '官网定价：免费范围与升级功能', url: 'https://tally.so/pricing', kind: 'official' },
      { label: '官网', url: 'https://tally.so/', kind: 'official' },
      { label: '创始人自述：第一年的早期获客与增长', url: 'https://blog.tally.so/year-1-how-we-bootstrapped-tally-to-11k-users-and-5k-mrr/', kind: 'founder' },
      { label: '创始人自述：后续持续增长方式', url: 'https://blog.tally.so/how-we-grew-tally-to-4m-arr-fully-bootstrapped/', kind: 'founder' },
      { label: '闷声发大财案例：增长路径需区分事实与推测', url: 'https://msfdcszhd.com/s/tally.so/', kind: 'catalog' }
    ]
  },
  {
    id: 'maccy',
    name: 'Maccy',
    type: 'macOS 剪贴板历史',
    plain: '记住你之前复制过的文字或图片，让你用键盘搜索并重新粘贴，不必回原处再找一次。',
    example: '场景示意：写材料时找回刚刚被新内容覆盖的复制记录；这只是功能示例，不是新增的客户证据。',
    status: 'not-recommended',
    verdict: '需求真实易懂，但不推荐以通用剪贴板工具作为你的首个收费项目。',
    demand: '官网说明了找回复制历史、键盘操作和本地存储。App Store 评论有用户描述反复复制与查找历史的体验；这些个体自述不能证明愿为另一个同类工具付费。',
    payment: '核查时美国 App Store 买断价 9.99 美元，官方说明付费用于支持开发；官网与开源发布可免费获得。维护者称商店版与 Gumroad 版功能基本相同，没有核心历史功能的付费门槛。未核实购买原因占比。',
    acquisition: 'GitHub、Homebrew 和应用商店是可见入口；一条用户评论称从播客发现它。这是个体获知路径，不能当作主要获客渠道或可复制的成交比例。',
    solo: '功能边界小，但系统版本、剪贴板权限、密码处理和日常稳定性仍要长期维护；进入成熟免费市场需要具体差异。',
    aiGap: 'AI 对话通常不能自动保存你的本地复制历史，因此不是完全相同的替代；系统自带功能和免费工具才是直接竞争。',
    limits: '没有验证足够强的差异和独立付费理由；应用商店标价、下载量与付费页访问均不能直接当作收入。',
    sources: [
      { label: '官网：免费开源、本地存储与下载入口', url: 'https://maccy.app/', kind: 'official' },
      { label: '官方仓库与安装说明', url: 'https://github.com/p0deje/Maccy', kind: 'official' },
      { label: 'App Store：官方分发说明及公开评论，需分别看', url: 'https://apps.apple.com/us/app/maccy/id1527619437', kind: 'official' },
      { label: '维护者答复：商店版与 Gumroad 版的差异', url: 'https://github.com/p0deje/Maccy/discussions/981', kind: 'founder' },
      { label: '闷声发大财案例：记录的是付费页访问', url: 'https://msfdcszhd.com/s/maccy.app/', kind: 'catalog' }
    ]
  },
  {
    id: 'fridaysnap',
    name: 'FridaySnap',
    type: '活动二维码共享相册',
    plain: '在婚礼或活动现场摆一个二维码，宾客不用安装 App，就能把手机照片和视频传到同一个相册。',
    example: '场景示意：新人活动结束后集中下载宾客拍的照片，不必分别催大家发文件；不是本研究新增核验的成交案例。',
    status: 'not-recommended',
    verdict: '收集照片的任务清楚，但不作为一个人起步的优先方向。',
    demand: '产品解决的是多人上传、集中收集和分享。官网评价是销售页面材料，不能与独立用户访谈或已确认的付费订单等同。',
    payment: '核查时官网活动相册促销价 39.99 欧元，一次性收费，宣传不限照片和视频及长期存储；价格和承诺可能变化。现场收集和事后下载是套餐功能，本研究未通过客户访谈核实购买动机。',
    acquisition: '官方面向婚礼摄影师、策划师和场地经营者的伙伴计划提供 10% 佣金、买家 5% 优惠和 90 天归因窗口。目录关于广告和宾客带来下一批客户的说法含推断；返佣机制存在不等于成交贡献已核实。',
    solo: '官网团队介绍称由两人经营；具体分工与投入未独立核实。活动当天支持、上传高峰、照片存储和下载流量，都是评估个人经营时要计入的工作。',
    aiGap: 'AI 能生成邀请文案或相册页面，但多人上传、相册权限和文件可靠保存需要服务承接；现成网盘和同类相册也是替代方案。',
    limits: '一次性收费与长期存储成本可能错配；未验证你能以可承受成本获客，也未核实净利润。',
    sources: [
      { label: '官网：活动相册与套餐，团队人数为自述', url: 'https://fridaysnap.de/', kind: 'official' },
      { label: '官方合作计划', url: 'https://partner.fridaysnap.de/', kind: 'official' },
      { label: '闷声发大财案例：广告与传播含推断', url: 'https://msfdcszhd.com/s/fridaysnap.de/', kind: 'catalog' }
    ]
  },
  {
    id: 'seatalert',
    name: 'Seat Alert',
    type: '大学选课空位提醒',
    plain: '学生想选的课已满时，替他持续检查；有人退课出现空位，就发短信和邮件提醒。当前官网列出 McMaster 与 McGill。',
    example: '场景示意：学生等一门必修课有空位，收到提醒后自己进入学校系统选课；提醒不等于自动占位或保证选上。',
    status: 'reference',
    verdict: '参考“具体对象、短时窗口、错过有代价”的提醒价值；不据此推荐复制到任意学校。',
    demand: '满课空位是具体问题。官网展示了提醒流程，作者解释了收费，但本研究未实测持续监测与通知送达，也没有完成新学校的接入与付费验证。',
    payment: '官方说明一笔订单仅适用于一门课的一个学期，收费用于短信、邮件和托管等成本。作者解释成本不能替代对利润的核实。',
    acquisition: '目录记录学校 Reddit 社区首发与后续口碑；本研究未逐条复核这些历史帖的成交贡献。校园入口具体，也意味着强烈依赖当地情境。',
    solo: '对象范围较窄有利于起步，但学校页面变化、轮询准确性、短信送达与选课季峰值仍需维护。',
    aiGap: '问一次 AI 不能替代持续监测和及时通知；若 AI 代理能稳定连接学校并持续执行，也会成为替代。差异应落在实际准确率与时效。',
    limits: '官网没有保证选课成功；目录给的是付费页访问，不是成功付款数。不能未经核实套用到中国高校。',
    sources: [
      { label: '官网：学校、学期与提醒方式', url: 'https://seatalert.ca/', kind: 'official' },
      { label: '作者解释：为什么收费、订单期限与成本', url: 'https://seatalert.ca/paid/', kind: 'founder' },
      { label: '闷声发大财案例：历史渠道待逐条复核', url: 'https://msfdcszhd.com/s/seatalert.ca/', kind: 'catalog' }
    ]
  },
  {
    id: 'remote-rocketship',
    name: 'Remote Rocketship',
    type: '远程职位收集与筛选',
    plain: '从企业招聘页等来源收集远程职位，整理到一个可搜索的网站，帮助求职者减少逐家公司查找的时间。',
    example: '场景示意：开发者筛出地区、时区和雇佣方式允许自己申请的职位，再去企业原始链接投递；这不是已经验证的付费服务。',
    status: 'withdrawn',
    verdict: '撤回面向中国开发者的远程岗位聚合优先建议；当前核对没有证明足够稳定的有效供给和付费理由。',
    demand: '找工作是需求，但“全球远程”不等于中国开发者可申请。地区限制、时区、合同方式、岗位失效与重复信息都会减少有效数量。',
    payment: '现有产品对职位访问等服务收费，不代表你的目标人群会为稀少的同类岗位付费。目录的付款页面访问不能当作其收入或你的收益预测。',
    acquisition: '目录记录早期社区发布与后续职位、公司、地区搜索页。页面存在不等于已证实搜索量或成交，具体渠道成效仍需核对原始披露。',
    solo: '持续获取、去重、更新和核实申请资格，比做一个岗位展示页更重；供给不足时再好的页面也不能补足价值。',
    aiGap: 'AI 能检索和总结岗位。只有更全更新且准确的可申请信息、及时提醒或可证明的筛选节省，才可能产生额外价值；本研究尚未证明。',
    limits: '此前样本核对不是市场总量统计，也不是已验证的产品机会。未开展付费访谈，不把求职焦虑本身当作支付意愿。',
    sources: [
      { label: '官网：远程职位产品', url: 'https://www.remoterocketship.com/', kind: 'official' },
      { label: '闷声发大财案例：付费页访问非收入', url: 'https://msfdcszhd.com/s/remoterocketship.com/', kind: 'catalog' }
    ]
  },
  {
    id: 'applaunchflow',
    name: 'AppLaunchFlow',
    type: 'App 商店上架素材',
    plain: '把 App 的原始截图做成商店展示图，并处理不同设备尺寸和语言；完整产品还提供视频、图标、文案等上架素材。',
    example: '场景示意：独立开发者要提交多语言版本，批量生成不同尺寸的商店截图；此窄场景是待验证假设，不是现有收入的归因。',
    status: 'pending',
    verdict: '保留“截图多语言导出”作为待验证问题，不形成开发或立项推荐。',
    demand: '原始 Reddit 测试帖有用户反对为偶发任务订阅，也有人自述公司曾为截图工具与模板付费。说明买家、频次与收费方式应分开验证；询问发票只是意向，不能算成交。',
    payment: '官网免费创建和预览，正式导出与翻译收费：9 欧元单次、一个 App 使用 7 天；Unlimited 每月 15 欧元。截至 2026-11-21，TrustMRR 显示 MRR 2,488 美元、171 个活跃订阅。核验的是整站支付数字，不能归因只做截图导出，更不是利润。',
    acquisition: '官网搜索教程、开源技能和社区发布是可见入口。创始人自填渠道与目录流量估算不等于逐渠道成交核验，也不能断言无需广告。',
    solo: '限定素材导出有机会控制边界；完整上架平台、排名追踪和商店连接则增加维护。现有单人案例不保证你的支持与获客成本相同。',
    aiGap: 'Open Screenshot Generator 官网已提供免费编辑器、57 种语言、批量导出、无水印与 AI 接入。多尺寸与翻译本身没有明显空缺；排版、可靠导出或更新流程是否仍有差距，尚未用相同素材对照。',
    limits: '免费竞争强，未核实可持续的获客办法、复购频率和窄功能付费意愿。付费验证应先于开发。',
    sources: [
      { label: '官网：截图、本地化与完整功能范围', url: 'https://www.applaunchflow.com/', kind: 'official' },
      { label: '官网：单次与订阅收费边界', url: 'https://www.applaunchflow.com/pricing', kind: 'official' },
      { label: '原始测试讨论：偶发使用拒绝订阅与公司购买经历', url: 'https://www.reddit.com/r/androiddev/comments/1q3y6ld/public_beta_tool_to_create_app_screenshots_and/', kind: 'user' },
      { label: '免费替代：Open Screenshot Generator', url: 'https://openscrgen.app/', kind: 'official' },
      { label: 'TrustMRR：截至 2026-11-21 的整站支付数据', url: 'https://trustmrr.com/startup/applaunchflow', kind: 'payment' },
      { label: '闷声发大财案例：渠道拆分含估算', url: 'https://msfdcszhd.com/s/applaunchflow.com/', kind: 'catalog' }
    ]
  },
  {
    id: 'vectosolve',
    name: 'VectoSolve',
    type: '图片转矢量与机器文件',
    plain: '把由像素组成的 PNG、JPG 图片重新描成轮廓线，导出 SVG 等文件，让设计软件或切割工作流继续使用。它不只是改文件后缀。',
    example: '场景示意：店主整理客户 Logo 后制作贴纸。这个店主订单场景是推测；已引用的 2025 年 Reddit 发帖人实际是做个人剪贴簿，明确不销售、不量产。',
    status: 'withdrawn',
    verdict: '撤回 SVG 工具的优先推荐。问题存在、整站有人付费，都不足以证明你提出的窄工具值得做。',
    demand: '用户原帖描述个人分层耗时、转换后文件不被识别；这是个体自述。Cricut 官方文档列出兼容限制，两者都不能证明店铺愿为新增工具付费。',
    payment: '截至 2026-11-21，TrustMRR 显示 MRR 1,623 美元、263 个活跃订阅，注明 Stripe API 核验。官网单文件 6.99 美元，订阅从每月 7.99 美元起；整站收入不能归因某个修复功能，也不是利润。',
    acquisition: '教程、推荐佣金和经销商合作页均可见，实际成交占比未核实。机构官网自述有产品工程与增长 SEO 两位合伙人，不能称整个业务全由一人包办。',
    solo: '作者所述的独自开发，不等于已核实营销和支持也由一人承担。多种切割、刺绣、数控及 3D 格式还需要输出质量与兼容维护。',
    aiGap: 'Cricut 官方已发布聊天生成和编辑可切割设计的产品说明。生成新图、把位图转成矢量、忠实修复任意已有 SVG 是不同任务；没有同一批文件实测，不能断言 AI 无法处理后两者。',
    limits: '没有做付费访谈或 AI 同文件对照。官方兼容文档只说明限制，不能当作店铺付费证据；当前不建议立项。',
    sources: [
      { label: '官网：转换范围与价格', url: 'https://vectosolve.com/', kind: 'official' },
      { label: 'TrustMRR：截至 2026-11-21 的整站支付数据', url: 'https://trustmrr.com/startup/vectosolve', kind: 'payment' },
      { label: '2025 年用户原帖：个人剪贴簿，非商业订单', url: 'https://www.reddit.com/r/cricut/comments/1m9k0uv/can_i_keep_forever/', kind: 'user' },
      { label: 'Cricut 官方：SVG 不支持项', url: 'https://help.cricut.com/hc/en-us/articles/360009553213-Image-uploads-unsupported-items', kind: 'official' },
      { label: 'Cricut 官方：2026 年 AI Project Designer', url: 'https://cricut.com/blog/cricut-launches-ai-project-designer/', kind: 'official' },
      { label: '机构官网自述：两位合伙人分工', url: 'https://go-to-agency.com/en', kind: 'founder' },
      { label: '闷声发大财案例', url: 'https://msfdcszhd.com/s/vectosolve.com/', kind: 'catalog' }
    ]
  },
  {
    id: 'pdfbolt',
    name: 'PDFBolt',
    type: '批量生成 PDF 的开发接口',
    plain: '别的软件把网页内容或模板交给它，它生成可下载的 PDF，例如报表、证书或单据；开发者不必自己维护整套转换服务。',
    example: '场景示意：培训系统将姓名与课程信息填进模板，批量生成结课证书；此例说明工作流程，不是已经访谈的付费客户。',
    status: 'not-recommended',
    verdict: '能理解收费逻辑，但不推荐作为一个人的首个项目。',
    demand: '批量生成文件有明确任务，现有产品有付费订阅。尚未核实一个你能触达、且现成开源或托管方案不能满足的细分客户群。',
    payment: '官网当前免费每月 50 份；Basic 每月 19 美元、2,000 份，另有更高用量方案。目录曾写免费 100 份，已与当前官网不同；这些是服务范围与用量价格，不能据此判断客户的具体购买原因。',
    acquisition: '官网有具体编程语言教程、替代品比较和免费工具。创始人发过 Show HN；这些入口的存在不证明某篇教程带来多少付费客户。',
    solo: '创始人原帖自述夫妻分别负责后端和前端测试，未独立核实投入。字体、排版、超时、并发、计费和客户故障会成为持续工作，不能当成一个转换按钮。',
    aiGap: 'AI 能写模板与调用转换工具，开源浏览器也能生成 PDF。托管价值可能是稳定执行与省维护，但需要实际可靠性和成本对比，不能说只有自己能实现。',
    limits: '已有成熟免费与收费替代；没有找到针对你的明确切口。支付数据不等于利润，也不能据此推导低维护。',
    sources: [
      { label: '官网：当前用量与价格', url: 'https://pdfbolt.com/pricing', kind: 'official' },
      { label: '创始人原帖：夫妻协作与技术历程', url: 'https://news.ycombinator.com/item?id=42869850', kind: 'founder' },
      { label: 'TrustMRR：整站支付资料', url: 'https://trustmrr.com/startup/pdfbolt', kind: 'payment' },
      { label: '闷声发大财案例：免费额度与官网有差异', url: 'https://msfdcszhd.com/s/pdfbolt.com/', kind: 'catalog' }
    ]
  },
  {
    id: 'downconvert',
    name: 'DownConvert',
    type: 'SketchUp 文件版本转换',
    plain: '上传 SketchUp 的 .skp 模型文件，转换成某些旧软件或配套工具能够打开的版本，再下载继续工作。',
    example: '场景示意：配套工具只接受 SketchUp 2020 格式，需要将模型另存为它能读取的版本。不能据此说 2026 文件给 2025 使用时一律必须转换。',
    status: 'not-recommended',
    verdict: '不推荐作为个人首个项目：收入口径冲突，团队与技术授权也未充分核实。',
    demand: 'SketchUp 官方论坛有用户说明 Velux 工具只认 2020 文件的具体限制。它证明的是某个旧工具的兼容问题，不是所有相邻年份都互不兼容。',
    payment: '官网提供首次免费与后续付费方案。TrustMRR 同页 MRR 4,200 美元、66 个订阅，却与作者所写平均每月约 464–465 美元、以买断为主或全为一次性付款冲突；不采用目录月收入结论。',
    acquisition: '文件报错搜索与 SketchUp 用户论坛是具体需求入口；目前未核实官方披露的各渠道成交规模，不能把搜索页存在当成已获客。',
    solo: '资料自述团队规模为 2–5 人，这不是支付接口核验的内容，也不能视作已核实的单人业务。文件格式、SDK 或软件授权条件及转换质量都需要核对。',
    aiGap: 'AI 可以解释报错或协助调用转换软件，但聊天文字本身不是已验证的 .skp 文件转换结果。是否需要独立服务，要用真实文件与现成软件对照。',
    limits: '不得照搬官网“所有新文件都不能被旧版打开”的泛化说法。口径冲突尚未解决，也未核实利润、技术授权及你的客户来源。',
    sources: [
      { label: '官网：转换方式与首次免费', url: 'https://downconvert-sketchup-files.com/', kind: 'official' },
      { label: 'SketchUp 官方论坛：用户描述 Velux 的 2020 限制', url: 'https://forums.sketchup.com/t/how-to-save-as-to-an-older-version-of-sketchup/326073', kind: 'user' },
      { label: 'TrustMRR：支付数字与作者自述须分开，口径冲突', url: 'https://trustmrr.com/startup/digital-natives-services-fz-llc', kind: 'payment' },
      { label: '闷声发大财案例：收入结论不直接采用', url: 'https://msfdcszhd.com/s/downconvert-sketchup-files.com/', kind: 'catalog' }
    ]
  }
];
