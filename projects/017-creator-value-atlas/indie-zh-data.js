// 中文资料单独维护；indie-data.js 将其合并到专题与全站作者索引。
window.INDIE_ZH = {
  authors: [
    {
      id: "mstudio", name: "麦扣 · M_Studio", initials: "MS",
      language: "中文", role: "跟练教程", group: "专题作者", area: "引擎入门",
      platforms: ["bilibili", "youtube", "blog"], level: "入门至进阶",
      engine: "Unity / C#；《勇士传说》以 Unity 2022.2 为背景",
      color: "#dae9df", specialties: ["2D 动作闭环", "状态机", "项目化教学"],
      home: "https://space.bilibili.com/370283072",
      source: "https://learn.u3d.cn/tutorial/2DAdventure",
      evidence: "Unity 中文课堂署名 M STUDIO，公开目录覆盖角色、敌人、存档和打包。本人 B 站系列简介使用 M_Studio／麦扣身份。",
      why: "适合中文跟练者沿同一个项目理解输入、动画、战斗和场景之间的连接，再删减成自己的小作品。",
      prerequisite: "具备基础编程思维；不会变量、函数和条件判断时，先补 C# 小练习。",
      order: "先看公开的移动与翻转单课，自己实现移动、跳跃和失败重来；再按缺口选学系列章节。完整付费课作为可选扩展。",
      task: "做一个只有移动、跳跃、单一危险物和重开按钮的关卡；改变一条规则，说明自己改动的代码。",
      caution: "教程工程用于学习，课程中的素材需分别核对许可。免费核心内容与中文课堂独有内容有区别；Unity 6 项目需要核对 API 和包版本。",
      works: [
        { id: "ms-move", title: "《勇士传说》· 实现人物移动和翻转", url: "https://www.bilibili.com/video/BV1zo4y1L7N8/", format: "本人视频单课", access: "公开核心教学", era: "2023 · Unity 2022.2", learn: "从刚体移动与图片翻转建立输入到画面的联系，作为同系列的起点。", read: "本人视频索引的简介与署名已核；未逐段观看，直读可能触发站点限制" },
        { id: "ms-adventure", title: "《勇士传说》· 横版动作完整课程目录", url: "https://learn.u3d.cn/tutorial/2DAdventure", format: "作者课程与目录", access: "目录公开；完整课付费／需登录", era: "Unity 2022.2；页面建议版本 2021.3–2023.1", learn: "按角色、敌人、状态机、声音、存档、打包查找缺口；先做最小闭环。", read: "课程摘要、完整章节和访问条件已读；未购买、未跑工程" }
      ]
    },
    {
      id: "liangxie", name: "凉鞋 · 凉鞋的笔记", initials: "凉",
      language: "中文", role: "教程与开源工具", group: "专题作者", area: "程序与算法",
      platforms: ["bilibili", "github", "blog"], level: "基础语法至工程进阶",
      engine: "Unity / Godot；两个引擎的代码与课程分别选择",
      color: "#e9e5ce", specialties: ["QFramework", "系统分层", "开发知识拆解"],
      home: "https://liangxiegame.com/", source: "https://liangxiegame.com/",
      evidence: "本人网站连接 QFramework、B 站与 Steam 制作组，并列出《X-teroids》《我的玫瑰》等作者作品；仓库公开 Unity 与 Godot 分支。",
      why: "适合已有小原型、开始遇到状态与界面耦合的人，用一个真实开源框架对照自己的工程问题。",
      prerequisite: "语法单课可入门；阅读框架前应会函数、类、事件，并完成过一个不用架构框架的小样。",
      order: "需要 Godot 语法时先看函数单课；做成小样后再读 QFramework 的分层与示例，只挑一个当前问题试改。两份资料属于不同学习层次。",
      task: "把原型中一处计分数据与显示逻辑分开，记录原实现和改法的理解成本，再决定是否引入框架。",
      caution: "QFramework 不是制作第一款游戏的前置条件。官网含付费会员课；本页只核对公开单课索引和开源说明，课程效果及游戏销量未核。",
      works: [
        { id: "lx-functions", title: "Godot 4.5 入门 · Hello World 与自定义函数", url: "https://www.bilibili.com/video/BV16p4Cz6EP5/", format: "本人语法单课", access: "公开视频入口", era: "Godot 4.5+", learn: "从函数开始补脚本基础；这一单课不能代替完整游戏项目。", read: "检索索引的标题与本人署名已核；正文直读受限，未观看全片" },
        { id: "lx-qframework", title: "QFramework · 开源架构与使用规范", url: "https://github.com/liangxiegame/QFramework", format: "作者开源仓库", access: "公开 README 与代码", era: "动态仓库；Unity2018+ / Godot4.5+ 目录", learn: "观察表现、系统、数据与工具层的边界，和自己的小工程比较。", read: "README、目录、分层规则与示例入口已读；未运行" }
      ]
    },
    {
      id: "losmuteki", name: "Los-muteki · 像素美術實驗室", initials: "LM",
      language: "中文（繁体）", role: "美术专题教学", group: "专题作者", area: "美术与工具",
      platforms: ["youtube"], level: "像素画入门至应用",
      engine: "Aseprite / 像素游戏美术，跨引擎",
      color: "#e9dceb", specialties: ["Aseprite", "像素画", "素材制作思路"],
      home: "https://www.youtube.com/@los-muteki",
      source: "https://www.youtube.com/channel/UC6YkjHzFMO7ibsj9wo4RFFQ",
      evidence: "本人频道介绍为像素绘师的 Aseprite 中文教学频道；代表单课简介自称 Los／洛斯，并连接繁体中文交流社群。",
      why: "适合想自己画少量游戏素材的人，从中文工具入门走向像素化处理的具体问题，减少只存参考图、不产出素材的停滞。",
      prerequisite: "能操作图片编辑工具即可，先只做小尺寸静态图，动画和复杂背景后补。",
      order: "先看 Aseprite 基础界面并画一件小道具，再看把已有画面转成像素美术的示范，对照轮廓和可读性。",
      task: "用同一尺寸和有限调色板画角色、危险物、目标物各一个，放到自己的原型里检查能否区分。",
      caution: "视频直读失败，本轮依据本人频道与单课检索索引核对主题，未逐帧评估效果。Aseprite 的当前价格、版本与导出细节需到官方再核；转换思路仍需人工修整。",
      works: [
        { id: "los-aseprite", title: "15 分钟认识 Aseprite · 基础界面篇", url: "https://www.youtube.com/watch?v=02DUYdUJ_-I", format: "本人视频 / 繁体中文字幕", access: "公开视频入口", era: "2021-05-20 · 历史界面", learn: "认识工具布局后立即画一个小道具，按现用软件版本对照界面。", read: "视频检索索引的署名、简介与日期已读；未观看全片" },
        { id: "los-pixel", title: "像素实验课 · 将画好的作品变成像素游戏美术", url: "https://www.youtube.com/watch?v=A47JpgFtBE0", format: "本人美术示范视频", access: "公开视频入口", era: "索引显示历史视频；确切发布日期待核", learn: "围绕已有画面转成像素美术提出检查问题：轮廓、配色和缩小后的辨识度。", read: "本人视频检索标题与频道信息已核；未逐帧验证处理步骤" }
      ]
    },
    {
      id: "candycat", name: "冯乐乐 · Candycat", initials: "CC",
      language: "中文", role: "技术书与源码", group: "专题作者", area: "美术与工具",
      platforms: ["github", "blog"], level: "图形基础至 Shader 进阶",
      engine: "Unity Shader；历史 Built-in 管线资料",
      color: "#dce5f0", specialties: ["Shader 原理", "图形数学", "材质与特效"],
      home: "https://candycat1992.github.io/about/",
      source: "https://github.com/candycat1992/Unity_Shaders_Book",
      evidence: "作者仓库明确为《Unity Shader入门精要》配套源码，并提供公开的数学章、修订章和勘误。以图形技术作者身份收录。",
      why: "适合已经有明确视觉效果需求的人，把效果拆成坐标、向量和着色步骤，并通过配套代码定位问题。",
      prerequisite: "会基本 Unity 操作、向量和简单代码；第一款小作品可先用普通材质完成。",
      order: "先补公开的第 4 章数学基础，再挑随书源码中的一个简单效果对照阅读；最后才扩展复杂光照与特效。",
      task: "画出一次对象空间到世界空间的变换，修改一个简单 Shader 的颜色参数，并写清当前渲染管线。",
      caution: "书籍本体需合法购买，公开配套内容不等于全书免费。历史代码不能直接视为 URP／HDRP 或 Unity 6 教程；本轮未运行与迁移验证。",
      works: [
        { id: "cc-math", title: "《Unity Shader入门精要》· 作者公开第 4 章数学基础", url: "https://candycat1992.github.io/unity_shaders_book/unity_shaders_book_chapter_4.pdf", format: "作者公开章节 PDF", access: "公开章节，非全书", era: "原书配套修订资料", learn: "按当前需要补向量、矩阵与坐标变换，再回到一个效果中解释其用途。", read: "仓库公开说明与 PDF 入口已核；PDF 文本抽取乱码，未通读推导" },
        { id: "cc-code", title: "《Unity Shader入门精要》· 随书源码与勘误入口", url: "https://github.com/candycat1992/Unity_Shaders_Book", format: "作者配套仓库", access: "公开代码；书籍另购", era: "历史 Unity / Built-in 资料", learn: "对应书中主题查找代码与勘误，保留引擎版本和管线差异。", read: "README、目录、章节与勘误入口已读；未运行外部工程" }
      ]
    },
    {
      id: "yezitao", name: "叶梓涛 · 落日间", initials: "叶",
      language: "中文", role: "作品与研究文章", group: "专题作者", area: "玩法与关卡",
      platforms: ["gcores", "bilibili", "zhihu"], level: "创意起点至设计研究",
      engine: "实验游戏 / 交互表达，工具按作品选择",
      color: "#f0e2d2", specialties: ["短游戏表达", "游戏与诗歌", "跨媒介设计"],
      home: "https://www.gcores.com/users/38924/content?page=1&tab=videos",
      source: "https://www.gcores.com/games/80966",
      evidence: "机核作品页标明《写首诗吧》制作人及 NExT Studios Gameplus 项目归属；本人年终文章记录落日间合作研究与创作。",
      why: "当你只有一种想表达的感受时，适合研究如何把它变成玩家的选择与操作，拓展小作品的题材和形式。",
      prerequisite: "先有一个想探索的体验或问题；技术基础可以随后按小原型需要补。",
      order: "先读《写首诗吧》的模式与合作署名，画出玩家动作；再读落日间年度复盘，看实验、研究与协作如何连接。",
      task: "围绕一个生活感受做 3 分钟内的纸面或数字互动，记录玩家如何选择以及体验是否发生。",
      caution: "落日间有多人合作与译介，作品归属按原文分别记录；本页未把成员作品或翻译文章算成叶梓涛独作。所选项目资料为历史记录，网页游戏未实跑。",
      works: [
        { id: "ye-poem", title: "《写首诗吧 Make a Poem》· 模式与制作归属", url: "https://www.gcores.com/games/80966", format: "作品介绍与项目入口", access: "介绍公开；外部游戏可用性另核", era: "2022 年项目；团队合作", learn: "比较随机词语选择与有限步数探索两种模式，观察规则怎样改变写作体验。", read: "项目介绍、模式与制作团队信息已读；未运行游戏" },
        { id: "ye-year", title: "一起做游戏的第一年｜落日间", url: "https://www.gcores.com/articles/175771", format: "本人署名的团队年度复盘", access: "公开文章", era: "2024-01-02 · 回顾 2023", learn: "观察研究、工作坊和小作品的连接；留意文章中不同成员的分段署名。", read: "正文与作者已读；多人共述按各自归属理解" }
      ]
    },
    {
      id: "wangmiaoyi", name: "王妙一 ·《WILL：美好世界》", initials: "王",
      language: "中文", role: "作品与一手访谈", group: "专题作者", area: "制作与发行",
      platforms: ["bilibili"], level: "叙事原型至制作复盘",
      engine: "文字解谜 / 小团队与个人制作案例，跨引擎",
      color: "#e9dfe2", specialties: ["文字解谜", "资源取舍", "长期制作"],
      home: "https://www.bilibili.com/video/BV1Jx411a7nY/",
      homeLabel: "打开本人作品视频",
      source: "https://www.ifanr.com/app/1201677",
      evidence: "两家媒体的原创本人访谈连接《WILL：美好世界》与开发取舍；B 站“王妙一工作室”本人作品视频提供关注入口。以作品案例人物收录，教程更新频率待核。",
      why: "适合研究叙事创意怎样匹配个人能力，以及编程之外的协作、宣传和长期维护会占用哪些精力。",
      prerequisite: "已有一页玩法设想或叙事原型，愿意把自己能做与需要合作的部分分开。",
      order: "先读 2019 年访谈理解《WILL》的文字重排与资源取舍，再读 2026 年访谈，对照维护、任务拆分和开发周期。",
      task: "把一个文字谜题做成纸面原型，再列出创作、测试、素材、协作与发布五类任务，缩小最难承担的一项。",
      caution: "本人访谈是经验叙述。收入和市场判断未独立审计，不据此推算自己的收益；新作《十五区：星落何处》按访谈阶段理解，不作已发行推荐。",
      works: [
        { id: "wm-will", title: "《WILL：美好世界》制作访谈 · 真诚做游戏，一个人也开心", url: "https://www.ifanr.com/app/1201677", format: "媒体原创本人访谈", access: "公开文章", era: "2019 · 历史制作经验", learn: "从文字重排玩法观察资源约束如何参与设计，补齐销售、管理与宣传任务。", read: "本人问答与作品介绍已读；未试玩作品" },
        { id: "wm-next", title: "九年后的开发复盘 · 游戏茶馆对王妙一的访谈", url: "https://youxichaguan.com/archives/224129", format: "媒体原创本人访谈", access: "公开文章", era: "2026-11 · 读取日 2026-11-21", learn: "对照长期维护、推倒原型、分解任务和个人精力的安排。", read: "本人问答已读；页面相对日期为“1天前”，收入不作独立核实" }
      ]
    },
    {
      id: "gaoming", name: "高鸣 ·《蜡烛人》", initials: "高",
      language: "中文", role: "作品与一手访谈", group: "专题作者", area: "玩法与关卡",
      platforms: ["blog"], level: "原型构思至关卡延展",
      engine: "Game Jam / 动作解谜设计，跨引擎",
      color: "#ede7cd", specialties: ["限制驱动创意", "光影机制", "关卡变奏"],
      home: "https://spotlightor.com/press-chs/sheet.php?p=candle_man",
      homeLabel: "打开官方作品资料",
      source: "https://spotlightor.com/press-chs/sheet.php?p=candle_man",
      evidence: "官方中文资料包列出《蜡烛人》由 Game Jam 原型发展而来，并署名高鸣的程序与游戏设计；原创访谈解释时长限制和影子关卡。",
      why: "适合研究一个简单限制怎样生成角色、风险和关卡变化，让小作品围绕一个机制持续展开。",
      prerequisite: "能描述一次玩家行动与后果即可；先设计规则，再选择技术实现。",
      order: "先看官方资料包的十秒光明与原型来历，再读高鸣对时长限制、影子关卡的解释，最后回自己的原型验证。",
      task: "用一条资源限制写出三种小关卡：先认识规则，再组合使用，最后换一个观察角度；请陌生玩家试玩。",
      caution: "案例是团队作品，不归为单人完成。官方资料和 2018 年访谈均有历史条件；作为设计案例关注，当前账号活跃度与完整开发课程未核。",
      works: [
        { id: "gm-candle", title: "《蜡烛人》· 官方中文作品资料包", url: "https://spotlightor.com/press-chs/sheet.php?p=candle_man", format: "开发商作品资料与署名", access: "资料公开；游戏通常需购买", era: "历史资料包；含 2019 Switch 信息", learn: "从十秒光明的约束出发，梳理原型、作品特色与团队分工。", read: "简介、制作历史与人员名单已读；游戏未实跑" },
        { id: "gm-levels", title: "IT之家专访高鸣 ·《蜡烛人》的十秒限制与影子关卡", url: "https://www.ithome.com/0/400/008.htm", format: "媒体原创本人访谈", access: "公开文章", era: "2018-12-12", learn: "观察限制如何控制关卡尺度，以及照明机制怎样发展出影子谜题。", read: "本人问答正文已读；关卡体验未实测" }
      ]
    }
  ],
  paths: [
    { id: "zh-first", title: "中文起步路线", description: "按中文资料完成一个小原型。跟练采用 Unity 2D，公开单课先行，完整付费课可选；设计与复盘跨引擎。使用 Godot 时可切回零基础路线，并对照下方中文官方文档。", stages: ["zh-scope", "zh-build", "zh-feel", "zh-art", "zh-test", "zh-release"] }
  ],
  stages: [
    { id: "zh-scope", title: "先给创意一个能完成的边界", label: "定范围", prerequisite: "有一个想法即可", authors: ["gaoming", "wangmiaoyi"], reading: ["gm-candle", "wm-will"], task: "选一条核心限制，写下玩家的一次操作、结果和结束方式。只保留一个小场景；叙事与动作两个方向择一。", done: "能在纸上走完一局，并明确本版只验证哪一个体验。", later: "访谈帮助观察取舍。第一款练习不必复制商业成品规模，历史成绩与个人收入前景分别判断。" },
    { id: "zh-build", title: "跟一个小闭环，尽早脱离照抄", label: "做闭环", prerequisite: "基本变量、函数与条件判断", authors: ["mstudio", "liangxie"], reading: ["ms-move", "ms-adventure"], task: "从移动与翻转开始，在同系列公开核心教学中按需补跳跃、失败与重开；只做一屏关卡，再自行改变一条规则。", done: "可以开始、操作、失败和重新开始，并能解释自己修改的部分。", later: "完整课程含付费独有内容，按需选择。Godot 学习者使用凉鞋语法单课及中文官方 2D 文档；QFramework 留待工程问题出现后再读。" },
    { id: "zh-feel", title: "用一条规则做出不同体验", label: "做设计", prerequisite: "有可操作或纸面小样", authors: ["gaoming", "yezitao"], reading: ["gm-levels", "ye-poem"], task: "动作原型研究限制与关卡变化；文字原型研究选择、顺序和步数。两条支线择一，做两个规则版本，请玩家描述差别。", done: "能指出哪个玩家动作发生了变化，以及它带来了什么感受。", later: "叶梓涛的实验项目适合拓展表达方式。可读介绍与实际试玩分开，本轮没有验证外部游戏能否运行。" },
    { id: "zh-art", title: "只补齐能认清规则的视觉", label: "做视觉", prerequisite: "原型的对象和规则已确定", authors: ["losmuteki", "candycat"], reading: ["los-aseprite", "los-pixel"], task: "先做三件统一尺寸的小素材，放回关卡检查角色、危险和目标的区分。已会 Shader 且确有需求时，再进入冯乐乐的数学章与源码。", done: "在实际游戏尺寸下仍可辨认关键对象；像素转换后的轮廓由人工检查。", later: "此处视频仅核到本人简介与索引，需亲自跟练判断。复杂渲染后补；本批尚未补齐中文声音专业作者，可继续使用原专题声音资料。" },
    { id: "zh-test", title: "让没听过解释的人玩一次", label: "做测试", prerequisite: "一个能分发的小样", authors: ["gaoming", "mstudio"], reading: ["gm-levels", "ms-adventure"], task: "不作口头提示，请新玩家启动并玩一局，记录停住和误解的位置；只修改最影响理解的一处，再找新玩家核对。", done: "有修改前后的行为记录，能把问题对应到具体规则、画面或操作。", later: "测试任务由本项目编排。高鸣访谈提供关卡思路，麦扣课程目录提供制作功能参考，两者都不当作测试方法的实证结论。" },
    { id: "zh-release", title: "交出一个版本，再盘点持续成本", label: "发与复盘", prerequisite: "能玩完并记录已知问题", authors: ["wangmiaoyi", "yezitao", "liangxie"], reading: ["wm-next", "ye-year"], task: "准备版本包、操作说明、素材署名与反馈入口。列出维护、协作和宣传任务；若工程耦合阻碍维护，再按需读凉鞋的框架说明。", done: "外部玩家能找到并玩完一局；反馈能追到版本；下一轮改动有明确取舍。", later: "中文资料先补制作经验。Steam 商店研究继续走原有发行路线与官方文档，案例访谈不提供收益保证或现行平台规则。" }
  ]
};
