window.atlasEntries.push(
  {
    id: 6,
    category: "visual",
    title: "用参数生成银河系飞越",
    author: "Lyren · @0xAIlabs",
    kind: "演示与提示词",
    summary: "把银河尺度、旋臂参数和镜头路线交给 Claude，生成一段 26 秒的飞越动画。",
    capability: "作者的公开提示词指定 NumPy 按规则放置粒子、PIL 逐帧绘制、FFmpeg 编码。成片镜头穿过银心和旋臂，用标签、小地图和距离读数帮助观众定位。",
    steps: ["定义尺度与结构", "计算粒子与镜头", "输出带标注视频"],
    relevance: "适合教育 3D 里的尺度讲解。把场景的尺寸和状态做成可改参数，讲解视频和交互场景可以引用同一份数据。",
    exercise: "在本地银河实验里保持随机种子、星点数量和机位一致，切换 12° 与 28°，比较旋臂开合。再固定形态，换几个镜头关键帧，区分结构变化与视角变化。",
    boundary: "原帖给出了提示词和成片。帖中约 18 万颗星是按规则放置的示意点，科学数据可另行对照正式观测来源。",
    links: [
      { label: "X 原帖", url: "https://x.com/0xAIlabs/status/2118379258607251490" },
      { label: "ESA 观测数据飞越对照", url: "https://www.esa.int/Science_Exploration/Space_Science/Gaia/Fly_through_Gaia_s_3D_map_of_stellar_nurseries" }
    ]
  },
  {
    id: 7,
    category: "workflow",
    title: "用验收驱动任务循环",
    author: "Hoodie · @HoodieFade_",
    kind: "工作流提案",
    summary: "把 Autoresearch 的实验循环推广到多步骤任务，让返工集中在验收失败的环节。",
    capability: "原帖提议先为各环节写出能失败的验收，再按依赖排序，让独立环节并行。失败节点根据检查结果重试，已通过的产物可以沿用。",
    steps: ["先写验收条件", "拆分依赖并执行", "只重跑失败环节"],
    relevance: "你的口播可分成台本、配音、字幕、插画和成片检查。画幅与字幕时间交给程序核对，视觉隐喻与剪辑节奏交给你判断。",
    exercise: "给一段 30 秒口播故意放入错位字幕，检查流程能否识别错误，只重做字幕对齐，并沿用原配音和镜头。",
    boundary: "Karpathy 的原项目有固定实验预算和验证指标。把同一逻辑用于创作时，需要另定验收、重试次数和人工判断点。",
    links: [
      { label: "X 原帖", url: "https://x.com/HoodieFade_/status/2118010863038746652" },
      { label: "作者的编排说明", url: "https://x.com/HoodieFade_/status/2117959235690524883" },
      { label: "Karpathy 原项目", url: "https://github.com/karpathy/autoresearch" }
    ]
  },
  {
    id: 8,
    category: "workflow",
    title: "Harness² 迭代 Agent 配置",
    author: "lumxss · @bkdgiffug",
    kind: "论文与代码",
    summary: "让同一个模型试用不同工作配置，并把有执行证据的改动留给后续任务。",
    capability: "Harness² 固定模型权重，候选改动涉及系统提示、护栏、记忆、工具说明、子 Agent、Skill、脚本和插件。框架在同一任务上试跑配置，根据执行记录挑选改进，再把证据和经验传到后续任务。",
    steps: ["比较候选配置", "核对执行证据", "把改动用于新任务"],
    relevance: "当你的口播或资料核查反复出现同类错误时，可以比较改提示词、改 Skill 和加校验脚本的实际效果。这里优化的是下次的工作方式。",
    exercise: "针对字幕错位，比对现有流程和增加对齐校验的版本。用两组没参与调试的短片，记录漏检次数、人工返工和耗时。",
    boundary: "论文的提升来自特定模型和评测任务。迁移到你的工作流时，收益和额外试跑成本都要用自己的样本测量。",
    links: [
      { label: "X 原帖", url: "https://x.com/bkdgiffug/status/2118038567264141418" },
      { label: "Google Research 仓库", url: "https://github.com/google-research/harness2" },
      { label: "Harness² 论文", url: "https://arxiv.org/abs/2610.14224" }
    ]
  },
  {
    id: 9,
    category: "workflow",
    title: "让每日新闻可听、可跳读",
    author: "monoradio · @monoradio102",
    kind: "网页与代码",
    summary: "把台本、配音和角色素材交给静态播放器，按音频时间轴组装一期日报。",
    capability: "作者准备台本和音频后推送到 GitHub。HTML 播放器用时间码同步字幕、角色表情和新闻卡片，听众可以跳段、回看文本和打开来源。",
    steps: ["整理台本与来源", "配音并标时间码", "同步播放与跳段"],
    relevance: "同一份 X 日报可以出阅读版和数字人播报版。朗读文案与屏幕字幕分开保存，专有名词能读得自然，字幕也能保持原名。",
    exercise: "挑三条做成一分钟播报，每段保留来源。检查点击第二条能否跳到对应音频，以及它的字幕和卡片是否同步切换。",
    boundary: "项目主要自动组装与播放已准备好的台本和音频。角色嘴形可以按音量变化，适合轻量播报。",
    links: [
      { label: "X 原帖", url: "https://x.com/monoradio102/status/2118287543288697312" },
      { label: "myradio 仓库", url: "https://github.com/monoradio102/myradio" },
      { label: "台本与时间码格式", url: "https://github.com/monoradio102/myradio/blob/main/docs/formats.md" }
    ]
  },
  {
    id: 10,
    category: "workflow",
    title: "Papermorph 把 PDF 变成互动课",
    author: "GitHub Daily · @GitHub_Daily",
    kind: "课程示例与代码",
    summary: "把书重组为带旁白、动态图解、可操作场景和小测的静态网页课程。",
    capability: "Papermorph 先拆章节，再组织台本与分镜，让旁白、动画、字幕和题目共享时间轴。公开线代课能拖动 3D 平面，儿童故事则会暂停画面，等读者点选物件。",
    steps: ["从资料提炼章节", "同步图解与旁白", "加入互动和测验"],
    relevance: "可把你的教育 3D 场景嵌进一个教学环节，让学生先预测、再操作、最后解释。同一份讲解结构也能导出成视频。",
    exercise: "在本地 RGB 课里先预测哪两束光能合成黄色，再调三个光强，检查中心取样值。最后试着合成青色，检验能否把规则迁移到另一组颜色。",
    boundary: "公开示例说明这种课程形式可以实现。生成的新课程仍需核对来源、公式、交互反馈和题目答案。",
    links: [
      { label: "X 原帖", url: "https://x.com/GitHub_Daily/status/2118350138347544618" },
      { label: "Papermorph 仓库", url: "https://github.com/DozenTwelve/Papermorph" },
      { label: "互动课程书架", url: "https://papermorph.diamonddoge.org/" }
    ]
  }
);
