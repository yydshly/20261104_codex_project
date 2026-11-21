window.ATLAS = {
  updated: '2026-11-12',
  categories: [
    { id: 'emotion', name: '情感定制', color: 'rose', icon: 'heart' },
    { id: 'business', name: '商家经营', color: 'sage', icon: 'shop' },
    { id: 'content', name: '内容传播', color: 'blue', icon: 'spark' },
    { id: 'event', name: '场景活动', color: 'gold', icon: 'flag' },
    { id: 'asset', name: '数字资产', color: 'lilac', icon: 'layers' },
    { id: 'tool', name: '制作工具', color: 'clay', icon: 'tool' }
  ],
  sources: [
    { id: 'origin', title: '起点：AYi 的动态表情包流程', url: 'https://x.com/AYi_AInotes/status/2120089714749263956', type: '创作者案例', note: '角色设定、动作帧、切图与质检的流程参考。前轮通过公开转存读取；销售数字与模型效果未独立核验。' },
    { id: 'line', title: 'LINE · Custom Stickers 制作指引', url: 'https://creator.line.me/en/guideline/customsticker/', type: '官方 · 已读取', note: '确认存在可填写姓名或短语的定制贴纸形态；支持“角色 + 个性化文字”的延伸思路，不证明销量。' },
    { id: 'etsy', title: 'Etsy · 数字商品交付方式', url: 'https://help.etsy.com/hc/en-us/articles/115015628347-How-to-Manage-Your-Digital-Listings', type: '官方 · 已读取', note: '区分即时下载与按需定制两种数字商品。平台存在这种交付形式，不代表账号或地区已符合开店条件。' },
    { id: 'creativity', title: 'Etsy · Creativity Standards', url: 'https://www.etsy.com/legal/creativity/', type: '官方 · 已读取', note: '允许符合条件的卖家原创设计及卖家提示生成的 AI 创作，并要求披露 AI 使用；AI 提示词包不属于其允许的设计商品。' },
    { id: 'canva', title: 'Canva · Brand Kit', url: 'https://www.canva.com/pro/brand-kit/', type: '官方 · 已读取', note: '品牌资产、字体配色与模板统一管理的产品实例。用于解释长期品牌服务的交付结构，不是需求规模证据。' },
    { id: 'printful', title: 'Printful · 按需印刷模式', url: 'https://www.printful.com/print-on-demand', type: '官方 · 已读取', note: '订单产生后再印制和履约的模式参考。实际运费、地区可用性、色差与利润必须另外验证。' },
    { id: 'itch', title: 'itch.io · 创作者质量指引', url: 'https://itch.io/docs/creators/quality-guidelines', type: '官方 · 已读取', note: '要求准确披露生成式 AI，反对低投入、大量重复生成内容。游戏素材需要实际可用性与人工整理。' },
    { id: 'wechat', title: '微信表情开放平台', url: 'https://sticker.weixin.qq.com/', type: '官方入口 · 待复核', note: '本轮未能直接读取官网最新规范。未把旧教程的尺寸、体积、收益和开通条件作为已核实信息。' }
  ],
  directions: [
    {
      id: 'pet', no: '01', category: 'emotion', title: '宠物专属表情包', tagline: '把“很可爱”变成“这就是我家那只”。', customer: '猫狗主人、宠物摄影工作室', audience: 'personal', model: 'commission', level: 1, repeat: 1, priority: 1, strengths: ['visual'], goals: ['first', 'ip'],
      value: '保留花纹、缺角耳朵、项圈与习惯动作，让客户在日常聊天中使用自己的宠物形象。付费理由是辨识度与情感连接。',
      offer: '1 张角色确认稿 + 8 张简单动图 + 静态预览 + 使用说明；约定一次集中修改。',
      deliverables: ['多角度角色参考与特征清单', '8 个高频聊天情绪的 GIF 和 PNG', '命名清楚的交付包与导入说明'],
      channel: '先找有宠物的熟人做付费试单；再向宠物摄影或洗护店展示完整案例。闲鱼作为待核对类目后的渠道候选。',
      acceptance: ['不同动作下仍能识别同一只宠物', '缩小后表情与文字清楚，循环无明显跳变', '先确认角色稿，再确认整套，不以无限改稿换成交'],
      expansion: ['生日卡、手机壁纸与宠物纪念册', '与摄影、洗护店合作的交付加购', '经授权后制作印刷周边，先打样再接单'],
      experiment: ['制作一套 8 张完整样品，记录重做次数。', '邀请 5 位目标客户试用，询问最愿意发送的 3 张。', '争取 1 次真实付费，核对含沟通与修改的总工时。'],
      signal: '有人愿意提供照片并支付明确范围的试单，而不只是说“好看”。', pivot: '如果客户只愿意买头像，先缩成头像与壁纸套餐；如果修改集中在脸型，先补角色参考。',
      boundary: '客户照片仅用于约定用途；公开案例另行征得同意。动态表情交付与微信平台过审是两个验收事项。', sources: ['origin', 'line', 'etsy']
    },
    {
      id: 'couple', no: '02', category: 'emotion', title: '情侣与婚礼视觉套装', tagline: '让两个人的口头禅，有自己的样子。', customer: '情侣、新人、婚礼策划师', audience: 'personal', model: 'commission', level: 2, repeat: 1, priority: 9, strengths: ['visual', 'operations'], goals: ['first'],
      value: '把两人的习惯、昵称与故事串成统一的互动视觉，比单独出一张双人头像更完整。',
      offer: '双人确认稿 + 6 组互动贴图 + 一张电子请柬或纪念卡；文字先确认。',
      deliverables: ['两人分别的形象与服饰设定', '互动表情、纪念卡、请柬同一风格', '适合手机查看与打印的独立文件'],
      channel: '从认识的新人或婚礼摄影师入手，展示从照片到请柬的整套效果。',
      acceptance: ['双人换动作时不混淆身份', '姓名、日期、地点逐字确认', '请柬在手机上可读，打印版尺寸经打样确认'],
      expansion: ['婚礼迎宾牌、桌卡与感谢卡', '周年纪念与家庭形象更新', '与摄影师、策划师合作的固定套餐'],
      experiment: ['做一套虚构新人示例，明确标注为概念样品。', '请 3 位策划或摄影从业者评估是否能纳入套餐。', '用一次小范围付费定制验证双人改稿成本。'], signal: '合作方愿意带着具体日期、用途和预算询价。', pivot: '如果双人相似度难以稳定，先用简化卡通风格，并把动作数量减半。',
      boundary: '真人肖像需获得相关当事人授权；不把私人照片默认为可展示素材。', sources: ['etsy', 'creativity']
    },
    {
      id: 'mascot', no: '03', category: 'business', title: '小店吉祥物启动包', tagline: '让一家小店，有一个能持续说话的角色。', customer: '咖啡店、烘焙店、宠物店', audience: 'business', model: 'commission', level: 2, repeat: 2, priority: 2, strengths: ['visual', 'operations'], goals: ['first', 'recurring', 'ip'],
      value: '统一店铺的角色、语气和视觉，让门店海报、社群回复与包装不再各画各的；后续内容能复用同一套基础资产。',
      offer: '1 个原创角色 + 角色设定页 + 6 个营业动作 + 3 个真实场景应用；不等同于完整品牌设计。',
      deliverables: ['正侧面、比例、配色与禁用方式', '欢迎、打包、休息、谢谢等营业动作', '头像、价签和社群海报应用样张'],
      channel: '选择一家能接触到的门店，结合其现有菜单和客群制作一页提案。',
      acceptance: ['角色能与店铺名称、产品及语气对应', '手机和店内打印两种场景都清楚', '列明使用范围、可编辑文件和后续修改方式'],
      expansion: ['每月活动海报与节日换装', '包装贴纸、杯套、会员卡', '经营成熟后再讨论联名或授权'],
      experiment: ['做一家虚构咖啡店的完整营业样品。', '向 3 位店主询问目前谁做海报、每月做几次。', '让一位店主为启动包或具体应用付费。'], signal: '店主愿意把角色用于真实营业触点，并提出下一次活动的需求。', pivot: '如果店主不需要角色，转成能够立即替换使用的菜单或活动海报。',
      boundary: '先查相近角色与商标；AI 图不直接承诺可注册商标或拥有排他版权。印刷与矢量重绘单独约定。', sources: ['canva', 'creativity', 'printful']
    },
    {
      id: 'reply', no: '04', category: 'business', title: '客服与社群回复素材', tagline: '把高频回复，做成一套好用的服务语言。', customer: '小店客服、团购群主、预约制工作室', audience: 'business', model: 'commission', level: 1, repeat: 2, priority: 3, strengths: ['operations', 'visual'], goals: ['first', 'recurring'],
      value: '将确认订单、发货、排队和售后等重复信息做成清晰、礼貌的视觉回复，减少重复排版，统一服务语气。',
      offer: '梳理 12 个真实回复场景 + 12 张静态卡片 + 4 张简单动图 + 可改文字的模板。',
      deliverables: ['高频回复场景与文字定稿表', '聊天可读的素材及文件命名', '客服使用索引与可编辑模板'],
      channel: '从已有群聊、预约业务或熟悉的店主入手，先观察最常出现的 5 种问题。',
      acceptance: ['关键条件、时效与价格文字经过商家确认', '实际聊天尺寸下不用放大也能读', '客服能在约定时间内找到对应素材'],
      expansion: ['按行业形成回复场景库', '每月政策或活动内容更新', '与轻量客服知识库结合'],
      experiment: ['收集一个商家的 5 类常见问题，先脱敏。', '制作 5 张回复卡，交给一名客服连续试用。', '比较查找和发送是否更方便，询问是否愿意补齐全套。'], signal: '客服连续使用，并能指出还缺哪类场景。', pivot: '如果图片反而增加查找成本，交付文字快捷回复与少量视觉卡片。',
      boundary: '不承诺提升转化率；促销、售后政策和客户聊天记录由商家确认并脱敏。', sources: ['canva']
    },
    {
      id: 'monthly', no: '05', category: 'business', title: '门店月度内容服务', tagline: '从“一次做图”，变成“每月按时交付”。', customer: '有固定上新、促销或课程的本地商家', audience: 'business', model: 'retainer', level: 2, repeat: 3, priority: 4, strengths: ['operations', 'visual'], goals: ['recurring'],
      value: '围绕商家的真实经营日历组织内容，把临时催图改为提前确认的选题、素材与排期。价值在稳定交付与理解业务。',
      offer: '一个月 4 个主题、8 张主视觉与尺寸适配，含一次月初选题会和一次集中修改。',
      deliverables: ['月度经营日历与选题清单', '统一风格的活动海报和社交媒体图', '可复用模板、素材归档与下月建议'],
      channel: '先从已经完成启动包的商家续接；用过去一个月的真实活动数量评估需求。',
      acceptance: ['每张素材有确定用途、日期和负责人', '活动信息由商家签字或文字确认', '按排期交付，额外加急与增量另行计价'],
      expansion: ['季度活动策划与多门店适配', '品牌素材库与模板管理', '经营内容复盘服务，不代替商家业绩责任'],
      experiment: ['与一位商家盘点过去一个月的内容需求。', '先交付一周的真实活动素材。', '以是否续订和总修改工时判断能否做成月服务。'], signal: '商家愿意为下个月的明确排期续费。', pivot: '需求不稳定时按活动项目收费，不强推月包。',
      boundary: '把“张数”与“主题数”区分；文案审核、发布账号及是否代发布分别约定。', sources: ['canva']
    },
    {
      id: 'ecommerce', no: '06', category: 'business', title: '电商商品场景与说明图', tagline: '保持商品真实，把它为什么好讲清楚。', customer: '小品牌、电商卖家、产品工作室', audience: 'business', model: 'commission', level: 3, repeat: 3, priority: 10, strengths: ['visual', 'operations'], goals: ['recurring'],
      value: '使用真实商品照片制作场景背景、尺寸说明和功能解释，帮助顾客理解使用情境；卖点应来自商品事实。',
      offer: '1 款商品的 3 张场景图 + 3 张信息说明图 + 一张事实核对表。',
      deliverables: ['保留原始产品层的场景合成图', '尺寸、材质、用法的说明版式', '事实核对表与不同渠道导出文件'],
      channel: '找已经有产品实拍但缺说明图的小卖家，用同一产品的前后信息清晰度做演示。',
      acceptance: ['商品外形、接口、颜色和配件不被生成工具篡改', '尺寸数据与卖点逐项确认', '主图和展示图满足实际销售平台当前规则'],
      expansion: ['多 SKU 说明图与上新模板', '安装、使用步骤图解', '品牌整月上新内容协作'],
      experiment: ['用自有或授权实拍商品做 6 张样图。', '让 3 位卖家检查信息准确性和采用意愿。', '接一款商品试单，记录修复产品细节的成本。'], signal: '卖家愿意用于真实商品页，且下一款商品仍需同类服务。', pivot: '如果产品保真难以稳定，先只做排版与背景合成，保留原图商品层。',
      boundary: '不虚构材质、功能、配件或销量；概念渲染不能冒充实物照片。', sources: ['creativity', 'canva']
    },
    {
      id: 'packaging', no: '07', category: 'business', title: '包装贴纸与随单卡', tagline: '让一次交付，留下被记住的细节。', customer: '烘焙、手作、礼物、独立品牌商家', audience: 'business', model: 'commission', level: 2, repeat: 2, priority: 11, strengths: ['visual'], goals: ['first', 'recurring'],
      value: '把品牌故事、使用说明和感谢语落在真实包装上，连接线上形象与线下体验。客户需要的是能印、能用的设计。',
      offer: '1 张感谢卡 + 2 款封口贴 + 印刷文件与打样核对单；生产费用单列。',
      deliverables: ['按实际刀模制作的版面', '符合印厂要求的出血、色彩和字体文件', '一套实物打样与修改记录'],
      channel: '与本地印厂、手作摊主或小品牌合作，从其现有包装尺寸开始。',
      acceptance: ['文字、二维码如有使用则真实可用', '实物裁切、贴合和色彩经打样确认', '报价明确设计、打样、生产和运费分别由谁承担'],
      expansion: ['节日礼盒与系列标签', '店铺角色与包装系统', '小批量周边的设计协作'],
      experiment: ['先给一个自有产品做真实尺寸的随单卡。', '小量打样并拍摄实物。', '带实物找目标商家询问替换意愿。'], signal: '商家愿意提供现有包装规格，并为设计和打样付费。', pivot: '如生产协调吞掉利润，先只接设计，由客户指定印厂。',
      boundary: 'AI 预览不能替代印刷交付文件；食品等必要标签信息由商家及专业方审核。', sources: ['printful', 'canva']
    },
    {
      id: 'creator', no: '08', category: 'content', title: '创作者视觉身份包', tagline: '让每次更新，都能被认出是你。', customer: '播客、视频作者、知识博主', audience: 'business', model: 'commission', level: 2, repeat: 3, priority: 7, strengths: ['visual', 'operations'], goals: ['first', 'recurring', 'ip'],
      value: '让头像、封面、栏目标题和角色有统一语言，降低每次更新的制作成本；围绕创作者内容形成可复用模板。',
      offer: '头像与形象设定 + 3 类栏目封面模板 + 6 张真实选题示范。',
      deliverables: ['字体、配色与版式使用说明', '可编辑封面模板与安全区域标注', '用作者真实标题制作的示范文件'],
      channel: '选择更新稳定但视觉不统一的中小创作者，结合其已有栏目提案。',
      acceptance: ['缩略图大小下仍能认出栏目和核心标题', '作者能独立替换标题与照片', '字体、照片与角色素材的使用范围清楚'],
      expansion: ['月度封面协作与系列内容包装', '片头、转场和角色短动画', '课程、电子书和线下活动视觉'],
      experiment: ['为一个具体栏目做 3 个连续选题的封面。', '让作者自行换一次标题，观察操作阻力。', '确认是否愿意为可复用模板和更新支持付费。'], signal: '作者开始重复使用，并提出新栏目适配需求。', pivot: '如果作者只要单张封面，缩小套餐再观察更新频率。',
      boundary: '不承诺点击率或涨粉；先保证主题表达和模板可用性。', sources: ['canva']
    },
    {
      id: 'explain', no: '09', category: 'content', title: '知识图解与说明卡片', tagline: '把难讲清的东西，变成看得懂的步骤。', customer: '讲师、产品团队、专业内容作者', audience: 'business', model: 'commission', level: 2, repeat: 3, priority: 5, strengths: ['operations', 'visual'], goals: ['first', 'recurring'],
      value: '重组信息结构，用流程、对比和示意图帮助读者理解。价值来自准确表达与教学设计，漂亮只是基础。',
      offer: '一个主题的 6 张解释卡或一张完整流程图，附原始资料对应表。',
      deliverables: ['信息大纲与关键概念定义', '分步骤图解及可编辑源文件', '事实来源表与审校记录'],
      channel: '找有稳定内容输出的讲师或产品团队，先解决一段反复被问到的说明。',
      acceptance: ['每个关键事实能追溯到资料', '目标读者看完能完成任务或复述逻辑', '中文文字手工校对，不把生图乱码当成成品'],
      expansion: ['课程全套图解与练习册', '产品入门手册与客户教育', '交互说明页与轻量演示工具'],
      experiment: ['挑一段真实教程制作前后对照。', '请 3 位新读者按图完成任务。', '记录理解障碍，并向内容负责人验证采购意愿。'], signal: '读者确实更容易完成任务，负责人愿意继续委托下一主题。', pivot: '如果缺专业知识，先与领域作者合作，不独立编造解释。',
      boundary: '高风险专业内容需由相应专业人士审校；不把 AI 输出本身当事实来源。', sources: ['canva']
    },
    {
      id: 'storybook', no: '10', category: 'emotion', title: '家庭故事与成长纪念册', tagline: '让自己的故事，成为能翻阅的作品。', customer: '家庭、宠物主人、纪念日送礼人', audience: 'personal', model: 'commission', level: 3, repeat: 1, priority: 15, strengths: ['visual', 'operations'], goals: ['ip'],
      value: '将真实经历整理为有起承转合的图文纪念册，重点在故事与人物连续性，适合有明确纪念用途的客户。',
      offer: '一个小故事的 6 页数字册，先确认文字和分镜，再出图排版。',
      deliverables: ['经客户确认的故事文字与分镜', '连续人物设定和内页排版', '电子阅读版；印刷版另外打样'],
      channel: '先从熟悉且愿意分享故事的人开始，再与摄影或纪念品工作室合作。',
      acceptance: ['人物、服饰、场景在跨页间连续', '故事与真实经历一致，文字由客户确认', '隐私、图片与印刷用途分别授权'],
      expansion: ['年度成长记录与家庭系列', '原创角色故事出版尝试', '纪念册加摄影的合作套餐'],
      experiment: ['用虚构人物做 6 页完整故事样本。', '验证一个家庭是否愿意付费整理其真实故事。', '记录跨页一致性返工，避免一开始承诺长篇。'], signal: '客户为故事整理和成册结果付费，而不只是购买几张人物图。', pivot: '故事制作过重时先做 3 张纪念场景与短文。',
      boundary: '未成年人资料最小化收集；不承诺教育、心理或治疗效果。', sources: ['etsy', 'creativity']
    },
    {
      id: 'event', no: '11', category: 'event', title: '活动与文旅角色物料', tagline: '把一个地方或活动，变成可参与的视觉故事。', customer: '市集主理人、展览、社区与文旅商家', audience: 'business', model: 'commission', level: 3, repeat: 2, priority: 12, strengths: ['operations', 'visual'], goals: ['recurring', 'ip'],
      value: '围绕活动主题或地方元素统一导览、打卡和纪念物料，让参与者更容易理解玩法并找到现场信息。',
      offer: '一个小型活动的主视觉 + 地图示意 + 4 张社交媒体图 + 2 个打卡道具设计。',
      deliverables: ['活动信息与视觉概念说明', '线上宣传和线下导视的适配文件', '实际场地与印刷尺寸的核对表'],
      channel: '从可到场的小型市集入手，与主办方核对活动目标和现场约束。',
      acceptance: ['地图、时间和场地信息由主办方确认', '现场导视的文字尺寸可读', '地方符号与第三方形象有合法使用来源'],
      expansion: ['季度活动与城市角色系列', '集章、地图和纪念周边', '角色导览短片或互动页面'],
      experiment: ['选一个虚构小型市集做完整物料演示。', '找实际主办方评估哪件物料最有用。', '先接一个范围清楚的活动，复盘现场使用情况。'], signal: '主办方愿意让素材进入真实活动流程，并为下一场预留预算。', pivot: '活动协同成本过高时先只做主视觉与社交媒体物料。',
      boundary: '不擅用官方标识或非授权文物图片；现场可用性比概念效果图更重要。', sources: ['canva', 'printful']
    },
    {
      id: 'community', no: '12', category: 'event', title: '社群专属视觉与仪式', tagline: '让“我们这个群”，有自己的共同语言。', customer: '读书会、运动团体、开源社区', audience: 'business', model: 'commission', level: 1, repeat: 2, priority: 8, strengths: ['operations', 'visual'], goals: ['first', 'ip'],
      value: '把群体内部语言做成欢迎图、成就卡、活动徽章与表情，增强身份识别，并降低组织者的日常制作负担。',
      offer: '1 套社群角色或符号 + 8 张高频素材 + 一次活动的视觉模板。',
      deliverables: ['社群口头禅与场景清单', '欢迎、打卡、感谢和里程碑素材', '组织者可改的活动与成就卡模板'],
      channel: '从自己参与且得到组织者同意的社群入手，以真实活动场景演示。',
      acceptance: ['成员能理解且愿意实际发送', '组织者能更换姓名和活动信息', '付费决策人和维护负责人明确'],
      expansion: ['系列活动与年度会员视觉', '实体徽章、贴纸与社群周边', '社群角色的小故事和动画'],
      experiment: ['挑一个社群的 5 个常见互动场景。', '让组织者试用一个活动周期。', '核对是否有预算，而非仅有成员点赞。'], signal: '组织者愿意为完整交付或下一次活动付费。', pivot: '无组织预算时只作为作品案例，不把持续无偿维护当商业模式。',
      boundary: '不擅用粉丝社群涉及的影视、游戏或明星形象；优先原创社群符号。', sources: ['line', 'canva']
    },
    {
      id: 'printables', no: '13', category: 'asset', title: '可打印模板与练习材料', tagline: '把一次设计，变成别人能反复使用的工具。', customer: '手帐用户、老师、家长、小店主', audience: 'personal', model: 'asset', level: 2, repeat: 2, priority: 13, strengths: ['operations', 'visual'], goals: ['ip'],
      value: '围绕一个明确任务设计可打印文件，例如阅读记录、活动筹备、宠物照护日程。用户为可用结构与节省时间付费。',
      offer: '一个具体场景的 5 页模板 + 示例填写版 + 黑白省墨版 + 使用说明。',
      deliverables: ['实际尺寸的 PDF 与可编辑版本', '打印和填写示例', '字体、插图授权与个人或商用许可说明'],
      channel: '先找真实使用者测试打印；数字商品平台作为后续候选，先核对地区、收款与 AI 政策。',
      acceptance: ['真实打印后不裁字、可书写', '任务结构比空白纸更方便', '文件名与许可清楚，不把预览图当完整文件'],
      expansion: ['同一人群的主题系列', '机构定制与品牌版本', '将高频表格改成交互小工具'],
      experiment: ['为一个高频任务做 5 页可用模板。', '请 5 位目标用户真实打印或填写。', '先验证一次购买，再做主题合集。'], signal: '用户实际使用后愿意购买下一主题或推荐给同类人群。', pivot: '下载多但使用少时减少装饰，专注一个高频任务。',
      boundary: '不销售搬运模板；不把提示词包当作 Etsy 合规数字设计商品。', sources: ['etsy', 'creativity']
    },
    {
      id: 'game', no: '14', category: 'asset', title: '独立游戏与应用素材包', tagline: '让素材真正装进项目，而不只停在预览图里。', customer: '独立开发者、小游戏与应用团队', audience: 'business', model: 'asset', level: 3, repeat: 2, priority: 14, strengths: ['code', 'visual'], goals: ['ip', 'tool'],
      value: '提供同一风格、明确规格的角色、图标和状态素材，缩短开发者把资源接入项目的时间。核心是规范和可集成性。',
      offer: '一个主题的 12 个图标 + 角色 4 个状态 + 一个可运行的使用示例。',
      deliverables: ['统一尺寸、留白、枢轴与命名', 'PNG 或精灵图、状态清单和预览', '导入示例、许可和 AI 使用披露'],
      channel: '先找一个具体开发者按其引擎验证，再评估 itch.io 等素材平台。',
      acceptance: ['实际项目里导入成功，不靠手工修每张图', '状态连续、切图边界与透明区域正确', '许可范围和 AI 使用标注清楚'],
      expansion: ['主题扩展包与角色动作补充', '应用完整视觉套件', '素材生成后的检查和打包工具'],
      experiment: ['与一个开发者确认具体规格。', '做最小素材包并在真实项目里导入。', '验证购买意愿和集成耗时，不以素材数量为卖点。'], signal: '开发者愿意把素材留在项目里，并询问扩展状态。', pivot: '集成难时先聚焦图标或静态背景，避免直接承诺完整角色动画。',
      boundary: 'itch.io 要求 AI 披露并反对低投入的大量重复生成；需要人工整理与真实可用的演示。', sources: ['itch']
    },
    {
      id: 'motion', no: '15', category: 'content', title: '角色短动画与栏目片头', tagline: '给已有角色一个能记住的动作。', customer: '创作者、小品牌、活动主办方', audience: 'business', model: 'commission', level: 3, repeat: 2, priority: 16, strengths: ['visual', 'code'], goals: ['ip', 'recurring'],
      value: '将已确认的角色做成短循环、片头或转场，用在固定内容中；比从零制作完整剧情短片更容易限定范围。',
      offer: '一个角色的 3 秒循环动作 + 横竖两种版式 + 静态封面；音乐和复杂口型另计。',
      deliverables: ['动作设计与关键帧确认稿', '约定格式的短循环视频或动图', '实际片头、屏幕或网页中的演示'],
      channel: '向已有角色客户追加服务，先展示一个真实用途而非泛泛的炫技片。',
      acceptance: ['角色特征稳定、动作与循环衔接自然', '没有多余肢体、穿模与明显闪烁', '实际播放环境支持交付格式'],
      expansion: ['节日换装与系列动作库', '角色讲解短片', '在掌握一致性后再扩展剧情短片'],
      experiment: ['选择一个自有角色做 3 秒循环。', '在真实播放环境中连续观看测试。', '找已有角色客户验证是否愿意为用途买单。'], signal: '客户愿意将动作加入固定栏目或营业场景。', pivot: '一致性返工过多时改用分层动画或更简单的动作设计。',
      boundary: '不承诺一次生成即可交付；音乐、字体与角色分别确认授权。', sources: ['origin', 'canva']
    },
    {
      id: 'license', no: '16', category: 'asset', title: '原创角色与主题授权', tagline: '让反复被喜欢的角色，逐步成为资产。', customer: '品牌合作方、周边店、内容创作者', audience: 'business', model: 'asset', level: 3, repeat: 2, priority: 18, strengths: ['visual', 'operations'], goals: ['ip'],
      value: '在积累稳定角色与真实受众后，授权可复用的角色素材和应用。价值来自持续识别、内容与清楚的授权关系。',
      offer: '一个原创角色的设定册 + 12 个基础动作 + 应用样例 + 具体许可草案。',
      deliverables: ['可追溯的原创设计过程与源文件', '角色动作、配色和使用规范', '期限、地区、媒介和独占范围的许可说明'],
      channel: '先持续发布自己的角色内容，观察真实使用；有明确合作需求后再洽谈授权。',
      acceptance: ['合作方需要的是这个角色，而非随便一只可爱动物', '创作来源和权利边界经核实', '许可范围能对应实际使用与合同'],
      expansion: ['品牌联名与主题活动', '实体周边和角色故事', '跨语言贴纸与不同媒介应用'],
      experiment: ['连续发布一个角色的同主题系列。', '记录收藏、主动索要使用和重复互动。', '在出现真实合作询问后再投入授权商务。'], signal: '出现针对角色本身的使用或合作请求，而不只追问生成工具。', pivot: '若缺受众与明确权利基础，先以定制服务积累设计经验。',
      boundary: 'AI 参与不自动等于可获得排他版权；授权前核实工具条款、人工贡献与相似风险，必要时请专业人士审查。', sources: ['creativity', 'line', 'printful']
    },
    {
      id: 'batch', no: '17', category: 'tool', title: '切图、GIF 与交付检查工具', tagline: '把重复一百次的操作，变成一次可靠处理。', customer: '表情作者、设计师、小工作室', audience: 'business', model: 'tool', level: 2, repeat: 2, priority: 6, strengths: ['code'], goals: ['tool', 'first'],
      value: '把切宫格、对齐、透明底检查、命名与批量导出变成稳定流程。客户买的是可预览、可诊断、不会悄悄出错的处理结果。',
      offer: '只解决一个流程：上传四宫格，预览切帧与时序，导出 GIF 和检查报告；先做本地版。',
      deliverables: ['可预览与调整的切帧工具', '明确可配置的尺寸、帧率和体积目标', '错误提示、结果文件与使用说明'],
      channel: '邀请实际做表情的作者带失败样本试用，从一个高频痛点开始。',
      acceptance: ['透明、白底、非等分边界等样本行为明确', '导出后可重现，失败会提示原因', '平台规则作为可更新预设，不写死为永远有效'],
      expansion: ['更多格式、尺寸与命名预设', '工作室批处理和审核清单', '在确认需求后再考虑付费桌面版或服务'],
      experiment: ['收集 3 位作者的真实失败样本。', '只实现最常见的一类处理并与手工对比。', '观察是否反复使用，并验证愿不愿为节省时间付费。'], signal: '作者主动带下一批素材回来使用，并能量化省下的操作时间。', pivot: '用户只偶尔用时，做一次性工具或与其他交付功能组合，不急于订阅。',
      boundary: '本地处理优先；平台规范需可更新。工具通过技术检查不等于作品一定通过平台审核。', sources: ['origin', 'line', 'wechat']
    },
    {
      id: 'workflow', no: '18', category: 'tool', title: '小团队内容生产流程', tagline: '把“会生成”，变成“团队能稳定交付”。', customer: '设计工作室、代运营团队、小品牌内部团队', audience: 'business', model: 'retainer', level: 3, repeat: 3, priority: 17, strengths: ['code', 'operations'], goals: ['tool', 'recurring'],
      value: '为已有订单的小团队统一需求表、版本、审核与导出步骤，减少漏项和返工。先解决实际协作问题，再讨论自动化。',
      offer: '访谈一个现有流程 + 一个项目的试运行 + 需求、审核与交付模板 + 培训。',
      deliverables: ['从需求到交付的流程与责任表', '版本命名、资料授权与人工审核节点', '批量工具配置、异常处理与交接文档'],
      channel: '找已经持续接单的团队，选择其最近一个真实项目复盘。',
      acceptance: ['团队成员能按文档独立走完流程', '错误、漏件与人工审批有明确出口', '用前后项目的返工和总工时评估，而非演示自动化次数'],
      expansion: ['更多业务模板与团队培训', '工具集成和维护服务', '重复验证后再将共性能力产品化'],
      experiment: ['记录一个团队现有交付过程和痛点。', '只改一个最耗时环节，试运行一个真实订单。', '确认返工减少后再讨论维护或扩展费用。'], signal: '团队自行继续使用，并愿意为维护和新增流程付费。', pivot: '没有稳定订单时先改善简单文档，不搭大型自动化系统。',
      boundary: '涉及客户素材和账号时先明确权限；有人工审核与异常退出，不默认自动发布。', sources: ['canva', 'origin']
    }
  ],
  routes: [
    { id: 'pet', label: '宠物与情感', heading: '先做一个人的专属，再做一群人的入口。', description: '角色一致性是起点。与能接触客户的摄影、洗护商家合作，比一开始追求大流量更具体。', stages: [
      ['01 / 验证', '一套专属表情', '先确认像不像，再确认愿不愿意用。', 'pet'],
      ['02 / 加购', '纪念与礼物', '从聊天延伸到生日卡、壁纸与纪念册。', 'storybook'],
      ['03 / 合作', '宠物门店素材', '帮助门店做客服回复与客户交付加购。', 'reply'],
      ['04 / 沉淀', '授权后的周边', '有真实订单后再打样、印制与发货。', 'packaging']
    ] },
    { id: 'shop', label: '门店与品牌', heading: '从一套角色，走向一个持续更新的品牌。', description: '先交付店主今天能用的素材，再观察其每月需求。长期服务建立在更新频率和可靠交付上。', stages: [
      ['01 / 基础', '吉祥物启动包', '把形象、颜色与营业动作定下来。', 'mascot'],
      ['02 / 使用', '客服与包装', '进入聊天、价签和随单卡等真实触点。', 'reply'],
      ['03 / 复购', '月度经营内容', '围绕真实上新与活动提前排期。', 'monthly'],
      ['04 / 系统', '团队素材与流程', '把版本、模板和审核留给团队。', 'workflow']
    ] },
    { id: 'knowledge', label: '知识与内容', heading: '从一张讲清楚的图，走向一套可复用的表达。', description: '不只卖画面。整理信息、核对事实和理解读者，是比批量出图更值得积累的能力。', stages: [
      ['01 / 表达', '一组知识图解', '用真实资料解释一个具体问题。', 'explain'],
      ['02 / 识别', '栏目视觉身份', '让连续内容有统一的版式语言。', 'creator'],
      ['03 / 产品', '可打印材料', '把被验证有用的结构做成工具。', 'printables'],
      ['04 / 延伸', '交互与短动画', '只在有助于理解时增加动态表现。', 'motion']
    ] },
    { id: 'tool', label: '工具与流程', heading: '先替一个人省时间，再寻找共同的痛点。', description: '从真实失败样本出发。工具的价值是稳定、可诊断和少返工，技术复杂度本身不构成付费理由。', stages: [
      ['01 / 观察', '一个高频重复动作', '切帧、对齐、命名，只选一件事。', 'batch'],
      ['02 / 可用', '真实项目导入', '让结果在目标环境里直接可用。', 'game'],
      ['03 / 交付', '团队流程试运行', '记录时间、异常与交接阻力。', 'workflow'],
      ['04 / 产品', '可维护的工具', '重复需求足够集中后，再标准化。', 'batch']
    ] }
  ]
};
