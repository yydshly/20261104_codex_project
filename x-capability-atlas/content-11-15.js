window.atlasEntries.push(
  {
    id: 11,
    category: 'systems',
    title: 'OpenMausBot：给 Agent 独立身份和工作环境',
    author: 'voidJan',
    kind: '开源项目',
    summary: '把可分配工具与权限的 Agent 做成通讯录中的常驻角色。',
    capability: '项目把多个 Agent 组织成可单聊或协作的角色，每个角色可绑定自己的模型后端、工具和工作环境。仓库还提供团队配置导入和关键操作的审批机制，便于把角色职责与行动范围一起交接。',
    steps: ['定义角色', '分配工具与环境', '审批关键操作'],
    relevance: '给你的数字伴偶拆出三层可单独设计的东西：角色形象与语气、用户关系记忆、可执行的动作。换一套表情图或模型后端时，用户仍能认出同一个角色。',
    exercise: '用虚构资料设计一个陪伴角色和一个资料检索角色，让两者回答同一个问题并尝试调用同一工具。验收角色语气是否稳定、工具是否只对指定角色开放。',
    boundary: '接到本机 CLI 只是改变调用入口，模型推理在哪执行取决于后端。原帖的省费和高仿仓库说法属于发帖者描述，安装以项目维护方渠道为准。',
    links: [
      { label: '查看 X 原帖', url: 'https://x.com/voidJan/status/2118240276473147484' },
      { label: '项目仓库', url: 'https://github.com/milind-soni/OpenMausBot' }
    ]
  },
  {
    id: 12,
    category: 'systems',
    title: 'Grok Bot 模板：复用团队分工',
    author: 'Bitturing',
    kind: '社区清单',
    summary: '用模板复用角色职责、日常任务和交接方式，再用可验收的产出评估分工。',
    capability: '原帖列出 20 个社区项目，覆盖任务派发、独立审核、跨工具交接等模式。官方文档支持预览和导入 Bot 模板，便于复用角色配置；Foreman 等社区项目进一步示范怎样记录验收证据。',
    steps: ['挑选分工模板', '写明交付与边界', '按证据验收'],
    relevance: '你的 X 日报可以借三个角色分工：采集者保留原帖，分析者解释个人价值，复核者检查说法和出处。角色模板最值得保存的是交接格式。',
    exercise: '拿同一批 5 条帖子，一次由一个 Agent 完成，一次按采集、分析、复核分工。比较可追溯条目数、误判和总耗时，再决定这套分工是否值得复用。',
    boundary: '官方资料确认模板分享机制。原帖提到的 146 个模板及 29,200 美元估值缺少已核实的官方依据，不能用来计算实际节省。',
    links: [
      { label: '查看 X 原帖', url: 'https://x.com/Bitturing/status/2117885119092683260' },
      { label: 'Grok Bot 模板指南', url: 'https://x.ai/bot/guides/templates-for-grok-bot' },
      { label: 'Foreman 社区项目', url: 'https://github.com/Archive228/foreman' }
    ]
  },
  {
    id: 13,
    category: 'systems',
    title: 'Obsidian + Claude：四个仓库怎么分工',
    author: 'no0x（@lez99999）',
    kind: '仓库清单',
    summary: '把知识库搭建拆成格式适配、导入检索、共享记忆和需求规划。',
    capability: 'obsidian-skills 教 Agent 读写 Obsidian 格式和使用 CLI；claude-obsidian 提供资料导入、Wiki、查询和整理。obsidian-second-brain 偏多 Agent 共享记录，second-brain-starter 则从访谈生成个人搭建计划。',
    steps: ['识别知识库瓶颈', '对照仓库分工', '用样本检查检索'],
    relevance: '先用这组仓库判断你的研究总库缺的是导入、检索还是跨对话续接，再决定借哪一层。能回答当时为什么收藏某个工具，比自动产出更多笔记更贴近你的需求。',
    exercise: '用 5 条公开项目记录搭一个临时库，分别问仓库地址、入选理由和两个项目的区别。要求每个答案给出可定位的来源，统计正确召回和引用错误。',
    boundary: '这是四个独立仓库的选型清单。Obsidian CEO 的仓库负责格式与工具技能，其余仓库提供各自的工作流。',
    links: [
      { label: '查看 X 原帖', url: 'https://x.com/lez99999/status/2118063491894714842' },
      { label: '格式与 CLI 技能', url: 'https://github.com/kepano/obsidian-skills' },
      { label: 'Wiki 工作流', url: 'https://github.com/AgriciDaniel/claude-obsidian' },
      { label: '多 Agent 记忆', url: 'https://github.com/eugeniughelbur/obsidian-second-brain' },
      { label: '个人搭建计划', url: 'https://github.com/coleam00/second-brain-starter' }
    ]
  },
  {
    id: 14,
    category: 'systems',
    title: '第二大脑长文：让 Wiki 的结论可回查',
    author: 'Brucky（@danikkk_wqs）',
    kind: '清单与长文',
    summary: '沿用第 13 条的四仓库清单，额外给出分层存储和引文核查示例。',
    capability: '作者附的长文把原始资料、整理后的 Wiki、交付输出放在不同目录。原始资料供读取，Wiki 条目保留指向原文的路径，核查脚本检查引文能否在来源中找到。',
    steps: ['保留原始资料', '综合成 Wiki', '回到原文核对'],
    relevance: '适合用来保存你对工具的判断依据。以后回查「当初为什么选它」时，可以同时看到原始描述、当时的选择理由和后续补充的结论。',
    exercise: '用公开样本写三条有来源的 Wiki 判断，并故意插入一句原文里不存在的引文。在新对话里回查选择理由，检查回答能否定位来源、核查能否标出伪引文。',
    boundary: '引文存在性只能检查文字是否出现在原文里。引文能否支撑结论、后来是否过时，仍需对照上下文判断。',
    links: [
      { label: '查看 X 原帖', url: 'https://x.com/danikkk_wqs/status/2118100946911932809' },
      { label: '作者的搭建长文', url: 'https://x.com/danikkk_wqs/status/2113001913662734619' }
    ]
  },
  {
    id: 15,
    category: 'systems',
    title: '随机细胞仿真：同样开局，多种结果',
    author: 'Codio（@0xCodio）',
    kind: '作者演示',
    summary: '反复模拟相同初始条件，观察轨迹在哪里分叉，以及少数结果如何被平均值掩盖。',
    capability: '帖子描述从同一个初始细胞状态做多次独立随机模拟，再统计各条轨迹的分叉与结局。它把分析焦点放到结果分布，让出现频率较低的路径也能单独被观察。',
    steps: ['固定初始状态', '反复随机运行', '比较分布与尾部'],
    relevance: '你的教育 3D 可以让学习者从同一条件重跑，看到轨迹如何分开。数字人头像评估也能借这套思路，同一参考图多次生成，记下身份漂移的比例。',
    exercise: '做一个简单的随机分叉演示，保持起点和参数一致，只改变随机种子。先叠加多条轨迹，再显示分支频数，让学习者能指出平均曲线藏掉了什么。',
    boundary: '帖子展示的是作者报告的仿真结果，未公开可复算的细胞模型与数据。被引的 Blender 长文讨论三维资产检查，是独立的参考。',
    links: [
      { label: '查看 X 原帖', url: 'https://x.com/0xCodio/status/2118290123255349265' },
      { label: '被引 Blender 长文', url: 'https://x.com/0xCodio/status/2109275834984915150' }
    ]
  }
);
