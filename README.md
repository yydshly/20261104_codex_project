# GitHub 项目研究总库

整理值得深入研究的 GitHub 项目，记录它们解决的问题、值得借鉴的做法和复现中的发现。按编号浏览研究摘要，再进入子项目查看原仓库、详细笔记、截图和可用的 Web 演示。

## 研究索引

| 编号 | 子项目 | 原库 | 研究摘要 | 图片导览 | Web 演示 |
| --- | --- | --- | --- | --- | --- |
| 001 | [交互效果实验室](projects/001-interaction-effects-lab/README.md) | [MotionSites](https://motionsites.ai/) · [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) · [Apache ECharts](https://github.com/apache/echarts) · [React Flow](https://github.com/xyflow/xyflow) | 汇总 16 个源参考、可操作复现与产品扩展，覆盖内容浏览、商品展示、材质反馈和业务交互。以共享款式与面料串联五步家具体验，沉淀原理、提示词与可继续组合的模块。 | [原理引导图](#interaction-effects-guide) | [在线总览与演示](https://yydshly.github.io/20261104_codex_project/001-interaction-effects-lab/) |
| 002 | [电梯叙事与工具能力研究](projects/002-capability-elevator/README.md) | [nicco 原帖](https://x.com/0xnicc0/status/2117961453722354173) · [Three.js](https://github.com/mrdoob/three.js) · [Playwright](https://github.com/microsoft/playwright) · [FFmpeg](https://github.com/FFmpeg/FFmpeg) | 借鉴角色乘电梯、逐层停靠介绍主题、片尾拉远全景的呈现方式，将一组工具或产品能力串成导览。包含四层互动样板、22 秒成片、13 个工具仓库与跨项目复用说明，验证数据驱动时间轴、浏览器逐帧采集和视频导出。 | [研究引导图](#capability-elevator-guide) | [在线研究与互动导览](https://yydshly.github.io/20261104_codex_project/002-capability-elevator/) |
| 003 | [风吹信封与付费前检查](projects/003-eian-seedance-workflow/README.md) | [Eian 原帖](https://x.com/EianLu/status/2118317430665613741) · [八步制作长文](https://x.com/i/article/2118298893238845441) | 用三条五秒原片区分模型基线、加入首尾帧与七段式提示词后的实际变化。最大可保留价值是付费前叠帧与局部合成，已修正四处输入图意外变化，稳定性与整片省成本仍待验证。 | [研究引导图](#wind-envelope-guide) | [在线研究与三组原片](https://yydshly.github.io/20261104_codex_project/003-eian-seedance-workflow/) |
| 004 | [Tesseract 的能力与价值](projects/004-tesseract-capabilities/README.md) | [Tesseract 官方库](https://github.com/mirage-hq/Tesseract) · [功能目录](https://mirage.app/tesseract/features) | 核心研究 Tesseract 如何以可编辑工程组织剪辑、二维动画、三维场景和音轨，以及对讲解制作和后续修改的价值。四部成片验证本机制作、路径追踪与 MiniMax 配音交付，保留能力边界，复用省时与教学收益仍待验证。 | [本轮研究引导图](#tesseract-guide) | [在线能力研究与实测作品](https://yydshly.github.io/20261104_codex_project/004-tesseract-capabilities/) |
| 005 | [见全 · 跨领域认知导航](projects/005-jianquan-cognition/README.md) | 自主产品探索 · [资料来源与覆盖](https://yydshly.github.io/20261104_codex_project/005-jianquan-cognition/#study/sources) | 研究大众怎样从社会全景进入陌生行业，发现认知盲区，找到所需基础和逐层深入的道路。用行业、技能与思维地图连接图解、案例和练习，保留 AI 深入样板；学习效果与多模型事实、覆盖互补审核仍待验证。 | [已有研究引导图](#jianquan-guide) | [在线探索与研究共识](https://yydshly.github.io/20261104_codex_project/005-jianquan-cognition/) |
| 006 | [六个优秀产品的效果与复用研究](projects/006-claude-showcase/README.md) | [Claude 原始作品串](https://x.com/claudeai/status/2111177834127601902) · [字体源码](https://github.com/harshpreet931/harshpreet-hand) · [电磁实验源码](https://github.com/thebuggeddev/electromagnetism) | 研究山火分析、Ballpoint Gambit、Harshpreet Hand、Induction Bench、AngioView 与 Twenty Haiku 六个优秀产品，从实际效果理解规则、数据与风格的配合。六个演示、绘画与短片提炼回放、主题化、字形资产、实验联动、空间教学和程序叙事的复用价值，并标明扩展范围。 | [已有研究引导图](#claude-showcase-guide) | [在线研究与六个演示](https://yydshly.github.io/20261104_codex_project/006-claude-showcase/) |
| 007 | [一个人的网页 3D 效果合集](projects/007-creative-webgpu-showcase/README.md) | [Codevember](https://github.com/acher249/codevember-2026) · [作者实验目录](https://adamwebsite.com/experiments/) · [4DGS 示例](https://github.com/acher249/4dgs-world-foundation-model-demo) | 整理 Adam Chernick 个人制作并基于开源示例扩展的 37 项网页 3D 实验，覆盖折叠、液态金属、布料、产品拆解、反射与高斯场景。以效果选型为主，保留共享引擎和 4DGS 的研究价值，说明源码二次开发、产品化、多设备验证与后续作品尚未扩展。 | [已有研究引导图](#creative-webgpu-guide) | [在线研究与原版效果](https://yydshly.github.io/20261104_codex_project/007-creative-webgpu-showcase/) |
| 008 | [16 个链接的能力与价值解析](projects/008-link-capability-atlas/README.md) | [15 条原帖与 Gitruck 补充](projects/008-link-capability-atlas/README.md#十六个链接的范围) | 解析 16 个链接，覆盖生图与 GIF、镜头剪辑、共享 3D、Agent 流程和知识库。用成片、交互与实际验收说明能力、个人应用价值与未接入边界，沉淀短片交付和证据记忆两条可复用链路。 | [本轮理解引导图](#link-capability-atlas-guide) | [在线解析与实际效果](https://yydshly.github.io/20261104_codex_project/008-link-capability-atlas/) |
| 009 | [GPT-6.2 的 3D 生成能力探索](projects/009-gpt62-3d-capability/README.md) | 自主实践 · [Three.js](https://github.com/mrdoob/three.js) · [Blender](https://www.blender.org/) | 研究 GPT-6.2 如何把自然语言需求转成可编辑的 3D 角色、动作、特效与故事场景，并通过实机观察和反馈继续修改。16 个角色、三类场景与 Blender 造型对照展示原型制作、视觉讲解和跨场景复用价值，玩家决策与长期游戏循环继续验证。 | [本轮生成的引导图](#gpt62-3d-guide) | [在线研究与能力价值](https://yydshly.github.io/20261104_codex_project/009-gpt62-3d-capability/journey.html) |
| 010 | [未来社会叙事与 AI 价值研究](projects/010-future-society-study/README.md) | 自主实践 · [Three.js](https://github.com/mrdoob/three.js) · [MiniMax](https://www.minimax.io/) | 研究怎样从人物的小事呈现五年、十年后的社会，比较 AI 在协调负担、资源调度和劳动记录中的作用。五个可操作 3D 原型、三年代同幕对照与 MiniMax 配音形成可复用的讲解方式，世界规则、年代差异和观众理解仍待深化。 | [已有研究引导图](#future-society-guide) | [在线研究与五个原型](https://yydshly.github.io/20261104_codex_project/010-future-society-study/) |
| 011 | [云隙行 · 3D 骑行世界研究](projects/011-yunxi-ride/README.md) | 自主实践 · 浏览器 WebGL 原型 | 研究怎样把 3D 鹈鹕骑车做成可游历的修仙世界。程序化天路、轮脚同步与承载、自游避障、三处秘境、双曲目跟拍和完整界面实录，沉淀可复用的关卡原型、状态驱动动画、导览与验收方法。 | [本轮生成的引导图](#yunxi-ride-guide) | [在线研究与试玩](https://yydshly.github.io/20261104_codex_project/011-yunxi-ride/) |
| 012 | [暮色之堡与知识世界探索](projects/012-castle-knowledge-world/README.md) | 自主实践 · [Three.js](https://github.com/mrdoob/three.js) · [从零造物](https://github.com/bluesky-rgb/cong-ling-zao-wu) | 用 Three.js + HTML 实现第一人称从渔屋码头渡湖、入堡与螺旋登塔，研究怎样把科普、历史、音乐和农业融入可漫游世界。沉淀可复用的场景、通行与操作基础，并提出器物学习与生活联动方案，知识模型和学习成效继续验证。 | [已有研究全景图](#castle-knowledge-world-guide) | [在线研究与原型试玩](https://yydshly.github.io/20261104_codex_project/012-castle-knowledge-world/) |
| 013 | [视差窗口与微缩交互研究](projects/013-spatial-window/README.md) | [Doui Lab 原帖](https://x.com/DouiLabApps/status/2119414517126107169) · [Parapeek Clock](https://www.doui-lab.com/en/apps/parapeek-clock/) · [Three.js](https://github.com/mrdoob/three.js) | 研究普通摄像头与观看位置如何驱动屏幕内的空间，用 11 个场景实现视差出框、嵌套桌面、日常信息、双机位列车与齿轮修复。沉淀可复用的投影、场景状态和操作反馈，服务互动展示、氛围桌面与修复原型，实机稳定性和长期收益继续验证。 | [已有三栏引导图](#spatial-window-guide) | [在线研究与交互效果](https://yydshly.github.io/20261104_codex_project/013-spatial-window/) |
| 015 | [《蜀道难》第一人称诗境研究](projects/015-shu-road/README.md) | [李白《蜀道难》](https://zh.wikisource.org/zh-hans/蜀道难_(李白)) · 自主 WebGL 实践 | 实现一条可走的九幕 3D 蜀道，用双音色语音和镜头把诗句对准景物。探索怎样用旅人站位表达高险，并在模型上标明史料与推测，为古诗教学展示和文化导览提供可复用原型。 | [已有九幕引导图](#shu-road-guide) | [研究与解读](https://yydshly.github.io/20261104_codex_project/015-shu-road/research.html) · [在线演示](https://yydshly.github.io/20261104_codex_project/015-shu-road/) |
| 016 | [小工具商业机制与个人 AI 协作研究](projects/016-solo-business-study/README.md) | [Feng_YQ](https://x.com/Feng_YQ) · [闷声发大财](https://msfdcszhd.com/) · 逐项官网与用户原帖 | 拆解 10 个工具的能力、获客和收费，保留 20 种扩展设想、15 家企业岗位抽样及 AI 替代核对。价值在理解持续监测、流程承接与结果交付，帮助个人减少误投，并通过样例和反馈形成 AI 协作目标；当前无立项推荐。 | [已有研究引导图](#solo-business-study-guide) | [在线研究与当前理解](https://yydshly.github.io/20261104_codex_project/016-solo-business-study/) |

项目按收录顺序从 `001` 开始编号。新条目按编号追加，已分配的编号保持固定。索引摘要用一两句话写清研究对象和关注点。完成验证后，可补上一条主要发现。

## 项目引导图

<a id="interaction-effects-guide"></a>

### 001 · 交互效果实验室

这张图汇总了从源库参考、本地复现到产品扩展的探索过程。16 个案例分为内容浏览与叙事、商品展示与对比、材质与场景反馈、配置查询与编辑四类，每项保留源参考、可操作演示和实现提示词。

![交互效果实验室引导图，汇总 16 个案例、源库入口、交互原理与五步家具流程](interaction-effects-lab/public/demo-assets/overview/principles-poster.jpg)

图中的家具链路依次为选椅子、360° 查看、切换灯光、配置报价和查找展厅，用同一份款式与面料选择串联多个交互。可以单独取用一个效果，也可以参考这条链路组合自己的产品流程。

后续可接入真实商品、价格与展厅库存，并按需求组合面料比较、规格帮助、报价分析和样品审批。当前报价与库存使用示例数据，分析和审批保留独立演示入口。[进入在线体验](https://yydshly.github.io/20261104_codex_project/001-interaction-effects-lab/) · [查看详细研究与扩展方向](projects/001-interaction-effects-lab/README.md)

<a id="capability-elevator-guide"></a>

### 002 · 电梯叙事与工具能力研究

核心价值是用角色乘电梯逐层介绍主题，再以建筑全景展示整体关系。工具清单、产品功能或知识步骤都可以采用这类空间叙事。我们的样板用「AI 为什么会答错？」串起找入口、理解生成、对照证据和跨域阅读四层，支持播放、拖动进度和楼层直达。

![认知电梯研究引导图，展示电梯实帧、原帖入口、13 个工具仓库及跨项目复用价值](capability-elevator/public/media/cognition-elevator-research.png)

引导图沿用本轮生成的版本，包含效果实帧、仓库路径和价值说明。图中的本机地址供本地运行时使用，公开入口见[在线研究与互动导览](https://yydshly.github.io/20261104_codex_project/002-capability-elevator/)。

网页收录四层 3D 互动演示、22 秒有声成片、研究归纳、13 个工具的能力说明与 GitHub 入口，以及跨项目复用例子。已验证的制作路径为内容配置与时间轴 → Three.js 场景 → Playwright 逐帧采集 → FFmpeg 编码与混音。

可复用的是逐层导览的呈现方法、网页预览与视频共用时间轴、浏览器自动操作与验证，以及按模板更新素材后重新导出。13 个仓库按任务选择，原片具体调用哪些工具尚未核实。「见全」完整案例需要另行在本机运行。[详细研究与来源](projects/002-capability-elevator/README.md)

<a id="wind-envelope-guide"></a>

### 003 · 风吹信封与付费前检查

本轮最值得保留的做法，是在付费生成视频前叠看首尾帧、检查固定区域，再只合成需要变化的部分。局部改图同时改动了窗户、头发、手和桌面，检查与局部合成实际修正了这四处输入图问题。

![风吹信封研究引导图，展示模型基线、三组原片、付费前检查、八步流程和待验证价值](eian-seedance-workflow-demo/wind-envelope-research-infographic.png)

沿用本轮生成的长图。A 用短提示词已经拍出窗帘先动、信封后滑。B 加首尾帧后构图和道具落点更贴近设定。C 改七段式后起动拉开约半秒，人物仍提前追看并多出斜光。每组只生成一次，未固定相同随机种子。原文八步保留并标明本次范围，整片一致性、稳定通过率和返工成本仍待验证。[在线研究与原片](https://yydshly.github.io/20261104_codex_project/003-eian-seedance-workflow/) · [完整摘要与来源](projects/003-eian-seedance-workflow/README.md)

<a id="tesseract-guide"></a>

### 004 · Tesseract 的能力与价值

研究核心是 Tesseract 的能力、运行方式和制作价值。它以可编辑工程组织普通剪辑、二维图层、三维场景和音轨，代理可以按文档修改工程、预览并渲染。机械讲解是本轮选择的验证场景，保留了从素材、动作和机位到配音成片的制作过程。

![沿用本轮生成的 Tesseract 研究全景引导图，展示能力范围、工具分工、制作原理、实际演示与扩展方向](mechanism-research-lab/public/media/tesseract-research.png)

引导图使用本轮已经生成的版本，包含齿轮、车床、发动机和见全案例。图中的本机路径是当时的制作记录，公开入口见[在线能力研究与实测作品](https://yydshly.github.io/20261104_codex_project/004-tesseract-capabilities/)。

本轮使用 Windows Tesseract 0.5.0，完成齿轮 4 秒、见全 39.3 秒、车床 62.5 秒和发动机 67.2 秒四部成片。MiniMax 生成旁白，Tesseract 组织工程与渲染，FFmpeg 处理最终音轨、字幕和封装。发动机网页使用 Three.js 实时交互，和视频工程分别维护。

已经拿到的价值是让结构、运动和讲解形成可修改、可重渲染的作品，并交付通用视频与原始工程。网页区分已实测、官方支持和待验证，列出十二类能力、制作中的修正，以及普通视频精剪、纯二维动画、复杂导入等后续试验。复用能省多少工时、真实观众是否更容易理解，仍需测量。[研究摘要与验证范围](projects/004-tesseract-capabilities/README.md)

<a id="jianquan-guide"></a>

### 005 · 见全 · 跨领域认知导航

研究的起点是：持续学习仍会遇到“自己不知道自己不知道”的问题，进入一个新领域时，缺少能告诉自己“包含什么、需要什么基础、下一步往哪里走”的地图。目标是面向大众的跨行业技能与思维普及，以科普、图解和可操作案例提供认识方向与继续深入的入口。

![见全研究引导图，展示认知目标、两种入口、学习路线、当前范围、来源边界与待试点的多模型审核](society-atlas/dist/assets/jianquan-overview.png)

沿用本次已生成的长图。没有明确想法时，从世界全景进入社会板块、行业和工作方向；已有问题时，从搜索进入概念与学习路线。两者连接同一套基础、讲解、跨领域关系和返回导航。三条样板进一步串起初次判断、反馈、补基础、换例与解释记录。

当前包含 7 个社会板块、20 个行业门类、60 个代表性工作方向和 14 个通用概念；AI、信息组织、软件与计算、教育与传播提供深入内容，公司知识库助手连接检索、核验、评估和运行监控。行业门类不等于岗位和专业知识已穷尽，已有路线也不等于学习效果已验证。

核心思考包括：怎样统一宏观与细节的入口，怎样让图解真正指明深入方向，怎样跨领域而不迷路，以及怎样区分原始资料、编辑归纳与虚构练习。后续按知识缺口扩展，先试点不同模型独立核对事实与查找覆盖缺口，再对照原文修订；多模型一致不自动代表正确。[在线探索](https://yydshly.github.io/20261104_codex_project/005-jianquan-cognition/) · [研究与共识](https://yydshly.github.io/20261104_codex_project/005-jianquan-cognition/#research) · [完整研究摘要](projects/005-jianquan-cognition/README.md)

<a id="claude-showcase-guide"></a>

### 006 · 六个优秀产品的效果与复用研究

本轮研究的是六个优秀产品与交互创作案例：**山火分析、Ballpoint Gambit 手绘国际象棋、Harshpreet Hand 手写字体、Induction Bench 电磁感应实验、AngioView 冠脉造影教学，以及 Twenty Haiku 俳句动画**。目标是从实际产品效果理解规则、数据、风格与操作如何配合，再提炼能用于自己产品的机制。

![沿用本轮已生成的六项研究引导图，汇总六个产品的演示实帧、原理、复用能力与扩展方向](claude-showcase-lab/public/six-research-projects.png)

沿用已经生成的引导图。网页保留作者原站与原片、六个研究演示、原理与源码对照、原画与创作比较，以及两部完成短片。每个演示下方写明操作方式、本地实现、可复用能力和后续方向。[进入公开网页](https://yydshly.github.io/20261104_codex_project/006-claude-showcase/)

我们的理解是：用共同时间轴组织回放，把稳定规则与可变风格分开，将字形转成可安装素材，让实验参数与反馈联动，建立三维与二维的对应，并让 AI 在明确画法内编排诗和镜头。当前山火是模拟数据，电磁与冠脉使用教学模型；绘画是独立的画风参考实验，字体原库不提供任意图像生成。公开版提供示例操作与作品回看，新主题 AI 生成需本机服务。[完整研究摘要与六个产品入口](projects/006-claude-showcase/README.md)

<a id="creative-webgpu-guide"></a>

### 007 · 一个人的网页 3D 效果合集

Adam Chernick 个人制作、扩展和组合的网页 3D 实验，部分基于 Three.js 与 React Three Fiber 开源示例。本轮收录 37 项，覆盖折叠、碎裂、液态金属、绳索、苔藓、布料、跑车拆解、反射、3DGS / 4DGS，以及三项交互科普。

![沿用已经生成的网页 3D 效果研究引导图，展示五个原版场景、其余 32 项分类及共享引擎与 4DGS 的研究价值](creative-webgpu-showcase/dist/assets/research-overview.png)

沿用本轮已生成的引导图和 2026 年 11 月 6 日的收录范围。网页将原版效果放进对应模块，集中展示每项操作、原理、用途设想和已知源码入口。[完整效果清单](projects/007-creative-webgpu-showcase/README.md#已收录的效果) · [在线研究与原版效果](https://yydshly.github.io/20261104_codex_project/007-creative-webgpu-showcase/)

主要价值是作为效果索引和参考实现，按项目需求挑选研究。共享引擎可参考系列场景的公共能力组织，4DGS 可专题研究动态人物与环境重打光。源码二次开发、真实业务样板、独立组件、多设备性能评估及作者后续新增作品保留为扩展方向。公开页对两项需要隔离环境的 4DGS 提供原站播放入口。[详细研究与当前范围](projects/007-creative-webgpu-showcase/README.md)

<a id="link-capability-atlas-guide"></a>

### 008 · 16 个链接的能力与价值解析

这组研究解析 **15 条 X 原帖与 1 个 Gitruck 有声剪辑补充案例，共 16 个链接**。能力覆盖生图与角色一致性、GIF 状态动作、镜头与口播配画、共享 3D 教学、Agent 工作流、引文核查与持久知识索引，用实际作品判断怎样迁移到自己的项目。

![本轮生成的能力理解引导图，汇总十五条原始线索的原理、价值、实测边界和两条跨项链路](x-capability-atlas/assets/atlas-understanding-20261121.png)

引导图沿用已经生成的版本，十五条原始编号保持不变。第 16 条将此前已展示的 Gitruck 有声口播前后对照单独解析，补充语义配画、图解特写和可继续精修的视频工程。[在线解析与效果](https://yydshly.github.io/20261104_codex_project/008-link-capability-atlas/) · [完整研究摘要与十六项来源](projects/008-link-capability-atlas/README.md)

原生拼贴、三种表情、眨眼点头、温室横竖片、气孔 3D 与讲解片、银河对照、电台和微课均有可查看产物。字幕、八种配置比较、审批、模板交接、引文核查、跨窗口笔记与排期仿真提供可操作入口。已走通温室镜头到口播字幕、审阅报告到核查笔记两条链路。

第 07–08、11–14 条保留原理适配范围，原库训练、自改 Agent、外部服务和上游采集继续按需求接入。原生 GIF 接缝、局部身份变化、规则语义误拦和真实使用收益仍需继续验证。[逐项验收与下载](https://yydshly.github.io/20261104_codex_project/008-link-capability-atlas/acceptance.html)

<a id="gpt62-3d-guide"></a>

### 009 · GPT-6.2 的 3D 生成能力探索

本轮以 GPT-6.2 的 3D 代码生成与迭代能力为研究对象，观察自然语言需求怎样变成可编辑、可运行的角色与现场。覆盖几何与材质构建、层级关节动画、可辨认的技能特效、时间轴叙事、多角色接力，以及 Blender 脚本生成和 GLB 资产复用。

![已经生成的 GPT-6.2 3D 生成能力探索引导图，汇总蛛丝救援、分身合击、轨道接力、程序原型与 Blender 磁翼重设计](species-arena-3d/public/journey/gpt62-3d-exploration.png)

沿用已经生成的这张引导图。项目包含 16 个角色身份、异种竞技场、缆车救援与轨道拦截三类场景。磁极对照把程序原型、Blender 原型精修和磁翼重设计放在同一镜头与动作进度下，便于区分表面细化与轮廓、结构、展开方式的变化。[在线研究与能力价值](https://yydshly.github.io/20261104_codex_project/009-gpt62-3d-capability/journey.html) · [进入英雄档案与演示](https://yydshly.github.io/20261104_codex_project/009-gpt62-3d-capability/) · [完整研究摘要](projects/009-gpt62-3d-capability/README.md)

可保留的价值是让原型能被旋转检查、让能力在同一问题中比较、让动作与反馈可暂停核对，以及把角色与动作复用到多个现场。对决的三段伤害、回放链接、纯画面模式和 5.2 秒造型演示都来自观看反馈后的修正。当前浏览器执行已生成的代码与资产，救援和轨道路径由代码编排。真实玩家决策、通用物理交互、长期游戏循环，以及实际节省工时和学习收益仍需继续验证。

<a id="future-society-guide"></a>

### 010 · 未来社会叙事与 AI 价值研究

研究怎样先建立有规则与社会关系的世界，再从人物的小事侧面呈现五年、十年后的生活。探索从停电调度、设备接入、复诊重排走向城市热浪与《晚一点到家》，逐步把资源、授权、照护与额外劳动放进可观察的情景。

![已有未来社会观察研究引导图，整理研究目标、五次效果试验、三年代设定、具体价值与运行边界](future-society-study/media/future-society-overview.png)

引导图沿用已经生成的这张图，以本轮原型实帧为参考。网页集中五个互动原型、三年代同幕对照、分幕与时间轴、有约束的程序模拟及 MiniMax 讲解，方便回看效果、定位差异和继续修改。[在线研究与效果](https://yydshly.github.io/20261104_codex_project/010-future-society-study/) · [能力与价值](https://yydshly.github.io/20261104_codex_project/010-future-society-study/#capabilities) · [完整研究摘要](projects/010-future-society-study/README.md)

可复用价值在故事原型、互动讲解和同条件方案对照。作品研究减少沟通负担、协调已有资源、避免部分连锁后果与记录额外劳动，同时追问成本和责任。年份与制度为情景假设，服务由程序模拟，语音预先生成。用户曾指出场景尺度小、年代差异弱、价值不清楚，真实观众的理解与世界规则仍需继续验证。

<a id="yunxi-ride-guide"></a>

### 011 · 云隙行 · 3D 骑行世界研究

从“3D 鹈鹕骑自行车”出发，研究角色怎样进入可操作、可观察的修仙世界。天路只在行进方向有限生成，车轮和脚踏共享运动状态，鹈鹕能自主避障、起降并到访捕鱼、采草和点灯三处秘境。两首配乐可以切换，平稳自游时按曲目参考轻调踏频。

![已有《云隙行》引导图，汇总世界、骑行、自游和节奏的设计判断，并标注御风、捕鱼、采草和点灯的完整界面实录画面](pelican-immortal-world/research/yunxi-project-overview.png)

可复用价值在于把空间生成、动作状态、目的地引导和可见反馈组合成可试玩的 3D 原型，也能用实时读数和连续实录发现步频、碰撞或引路问题。网页保留完整界面实录、能力与证据、12 条整理版提示词和 X 发布草稿。碰撞与承载属于游戏化近似，跟拍基于预设曲目，复杂路径及设备性能仍可继续测量。

[在线研究与能力价值](https://yydshly.github.io/20261104_codex_project/011-yunxi-ride/#capabilities) · [直接试玩](https://yydshly.github.io/20261104_codex_project/011-yunxi-ride/play.html) · [完整研究摘要](projects/011-yunxi-ride/README.md)

<a id="castle-knowledge-world-guide"></a>

### 012 · 暮色之堡与知识世界探索

从 Three.js 城堡画面出发，完成可以渡湖、入堡和登塔的连续 3D 原型。场景覆盖城堡、湖岸、林地、渔屋和旧塔遗迹；第一人称从渔屋码头登船，靠岸后经石阶、吊桥、城门和大厅，沿 60 级螺旋石阶抵达塔顶。对闪烁、起点和登船位置的反馈，推动我们核对视觉、路线与操作逻辑。

![沿用本轮已有的暮色之堡研究全景图，展示原型实帧、思考演变、知识入口、学习机制、复用价值与下一步验证](docs/012-castle-knowledge-world/research-overview.png)

已经获得的价值是可编辑的程序化场景、连续通行和水陆切换基础，可用于探索关卡、互动展示与知识章节原型。进一步的方向是连接《从零造物》的选题、原理与资料出处，让玩家在同一个生活世界中发现科学、历史、音乐和农业的兴趣。网页用“暮湖秋集”的六处候选地点，说明从好奇、操作与反馈走向解释和迁移的设想。

引导图沿用本轮已经生成的版本。网页提供研究摘要、可点击地点提案、实景截图和原型试玩，区分已实现能力、讨论提案与待验证成效。载重、水车、作物等学习模型尚待制作，时代地域与首批体验者仍需确定，真实学习收益需要观察验证。

[在线研究与价值](https://yydshly.github.io/20261104_codex_project/012-castle-knowledge-world/#summary) · [直接试玩](https://yydshly.github.io/20261104_codex_project/012-castle-knowledge-world/play.html) · [已有研究引导图](https://yydshly.github.io/20261104_codex_project/012-castle-knowledge-world/#guide-image) · [完整研究摘要](projects/012-castle-knowledge-world/README.md)

<a id="spatial-window-guide"></a>

### 013 · 视差窗口与微缩交互研究

研究普通摄像头、观看位置与三维场景怎样配合，让人左右挪动时像透过窗口看进屏幕里的空间。我们实现 11 个可切换场景，包括平板里的房间、带实时墨水屏的窗边与雨夜、远近机位共享的列车到站，以及可以装回齿轮的独立修复工坊。人物、设备比例、近景主次、灯光与事件后续都来自多轮观看反馈后的修正。

![沿用已经生成的三栏引导图，用六张场景实帧说明研究、效果与价值，保留演进、实现边界、11 个场景和扩展方向](docs/013-spatial-window/research/understanding-overview-compact.png)

已有价值是形成可编辑、可运行的视点、投影、遮挡、嵌套相机、共享状态与射线拾取基础，可复用到互动展示、氛围桌面、连续事件与修复练习。日常信息提供查看用途，暖灯与低频动作探索陪伴，齿轮归位提供可见的操作结果；真实使用便利性、追踪稳定性、学习收益与长期留存仍需验证。

引导图沿用本轮已生成的三栏版本，公开网页提供 15 个研究主题、场景直达、交互原理、来源与 8 个扩展方向。公开演示使用已有 VRoid 样例作为举钟人物，引导图与历史截图记录的是本机 MMD 版本。天气湿度为室外数据，车站为有限编排，机芯为演示性运动，网页逐项说明范围。

[在线研究与价值](https://yydshly.github.io/20261104_codex_project/013-spatial-window/#summary) · [直接体验工坊](https://yydshly.github.io/20261104_codex_project/013-spatial-window/play.html?scene=workshop) · [已有引导图](https://yydshly.github.io/20261104_codex_project/013-spatial-window/#guide-image) · [完整研究摘要](projects/013-spatial-window/README.md)

<a id="shu-road-guide"></a>

### 015 · 《蜀道难》第一人称诗境研究

从秦塞太白到锦城西望，九幕连成一条实际可走的 3D 蜀道。与原诗逐句对应，抬头辨认鸟道与远峰、低头看栈板和绝壁，转身寻找解说中的地形。18 段 MiniMax 朗诵和旁白按地点与语句播放，一键演示约 4 分 47 秒。

![已有《蜀道难》引导图，汇总九幕网页实景、代表诗句、青泥岭与剑门关的考据](shu-road-demo/shu-road-overview.png)

本轮探索从旅人站位和脚下支撑出发，校正台阶、木构与动植物的尺度和动作，让讲解能指向眼前的具体景物。青泥岭和剑门关在画面中区分唐代文献、遗存参照与推测复原。可复用价值是把诗文、可走路径、三维景物与语音定位结合，用于古诗教学展示和文化展陈原型。

[在线研究与引导图](https://yydshly.github.io/20261104_codex_project/015-shu-road/research.html#guide-image) · [进入 3D 演示](https://yydshly.github.io/20261104_codex_project/015-shu-road/) · [完整研究摘要](projects/015-shu-road/README.md)

<a id="solo-business-study-guide"></a>

### 016 · 小工具的商业机制与个人 AI 协作研究

从“闷声发大财”的 10 个案例出发，梳理能力、用户价值、获客与收费，提出 20 种待验证扩展。随后抽样核对 15 家企业和招聘社区，并回到自己日常用 AI 做作品的场景，比较现有工具能否支持目标探索、局部反馈和偏好记录。

[![一个人做小工具的研究全景图，展示 10 个案例的能力、价值和 20 种待验证产品扩展](projects/016-solo-business-study/assets/research-map-20261121.png)](https://yydshly.github.io/20261104_codex_project/016-solo-business-study/#map)

沿用已经生成的首版引导图，作为前段案例研究快照：蓝色为公开能力，绿色为价值解释，橙色均为未验证设想，后来的 AI 协作讨论另见网页。持续监测、流程承接、结果交付与传播收费是可复用的机制；对我们的意义是分清“工具有用、生意成立、适合自己做”，减少证据不足的投入，并用小样、具体反馈和选择记录逐渐形成目标。

当前无立项推荐：岗位聚合暂缓、SVG 首选撤回、App 截图仅保留参考，个人 AI 沟通工具也暂不产品化。岗位 9 项只是地域文字候选，未确认中国签约；尚未完成同任务对照与外部付费验证。保留研究资产和重启条件，不把设想当作已证明的商机。

[在线研究与价值](https://yydshly.github.io/20261104_codex_project/016-solo-business-study/#value) · [AI 协作探索](https://yydshly.github.io/20261104_codex_project/016-solo-business-study/#collaboration) · [离线研究网页](projects/016-solo-business-study/offline.html) · [完整研究摘要](projects/016-solo-business-study/README.md)

## 收录新项目

1. 复制[子项目模板](projects/_template/README.md)到 `projects/<编号>-<英文短名>/README.md`，写明上游仓库、研究问题和复现记录。
2. 把封面和截图放在子项目的 `assets/`，用相对路径引用。填写替代文字，并用一句图注说明读者应关注的细节。根索引可链接封面。
3. 在上方索引补上对应条目，「原库」列填写上游仓库或官方入口。在索引下方添加引导图、案例范围、复用价值与扩展方向的说明。有在线演示时，再填入可访问的地址。

## Web 演示

首个静态演示就绪后，可将 GitHub Pages 的发布源设为 `main` 分支的 `/docs`。每个演示使用自己的 `docs/<编号>-<英文短名>/index.html`，把构建产物与静态资源放在该目录内。资源使用相对路径，或将构建基路径设为 `/20261104_codex_project/<编号>-<英文短名>/`。

启用后，演示地址的格式为 `https://yydshly.github.io/20261104_codex_project/<编号>-<英文短名>/`。[GitHub Pages 发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
