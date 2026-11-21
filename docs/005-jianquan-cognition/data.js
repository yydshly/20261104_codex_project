/*
 * 社会认知地图：编辑归纳的学习框架，不是唯一的社会分类。
 * 教材概念采用简短原创改写；生活案例均为构造示例。
 * AI 覆盖层是条件分析，不是对特定职业、个人或国家的预测。
 */
window.ATLAS_DATA = {
  meta: {
    title: '社会认知地图',
    checked: '2026-11-04',
    note: '从整体结构到运行机制，再连接具体生活。七个系统是帮助探索的编辑框架；现实中的系统互相交织，各地制度与经验存在差异。',
    evidenceNote: '概念参考可回查的教材和机构资料；案例为人工构造；AI 视角与未来组织方式为有条件的分析。'
  },
  sources: [
    { id: 'societies', title: 'Types of Societies · 社会组织类型', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/4-1-types-of-societies', checked: '2026-11-04' },
    { id: 'environment', title: 'The Environment and Society · 环境与社会', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/20-3-the-environment-and-society', checked: '2026-11-04' },
    { id: 'urbanization', title: 'Urbanization · 城市化', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/20-2-urbanization', checked: '2026-11-04' },
    { id: 'division', title: 'What Is Economics? · 稀缺与劳动分工', org: 'OpenStax · Principles of Economics 3e', url: 'https://openstax.org/books/principles-economics-3e/pages/1-1-what-is-economics-and-why-is-it-important', checked: '2026-11-04' },
    { id: 'markets', title: 'Demand, Supply, and Equilibrium · 供需与价格', org: 'OpenStax · Principles of Economics 3e', url: 'https://openstax.org/books/principles-economics-3e/pages/3-1-demand-supply-and-equilibrium-in-markets-for-goods-and-services', checked: '2026-11-04' },
    { id: 'authority', title: 'Power and Authority · 权力与权威', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/17-1-power-and-authority', checked: '2026-11-04' },
    { id: 'publicgoods', title: 'Public Goods · 公共品与集体供给', org: 'OpenStax · Principles of Economics 3e', url: 'https://openstax.org/books/principles-economics-3e/pages/13-3-public-goods', checked: '2026-11-04' },
    { id: 'education', title: 'Education around the World · 正式与非正式教育', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/16-1-education-around-the-world', checked: '2026-11-04' },
    { id: 'media', title: 'Media and Technology in Society · 媒体与技术', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/8-2-media-and-technology-in-society', checked: '2026-11-04' },
    { id: 'family', title: 'What Is a Family? · 家庭作为社会关系', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/14-1-what-is-marriage-what-is-a-family', checked: '2026-11-04' },
    { id: 'population', title: 'Demography and Population · 人口的构成与变化', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/20-1-demography-and-population', checked: '2026-11-04' },
    { id: 'culture', title: 'Elements of Culture · 文化的组成', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/3-2-elements-of-culture', checked: '2026-11-04' },
    { id: 'stratification', title: 'What Is Social Stratification? · 社会分层', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/9-1-what-is-social-stratification', checked: '2026-11-04' },
    { id: 'globalization', title: 'Globalization and the Economy · 全球经济连接', org: 'OpenStax · Introduction to Sociology 3e', url: 'https://openstax.org/books/introduction-sociology-3e/pages/18-2-globalization-and-the-economy', checked: '2026-11-04' },
    { id: 'migration', title: 'International migration · 国际迁移', org: 'United Nations · 联合国', url: 'https://www.un.org/en/global-issues/migration', checked: '2026-11-04' },
    { id: 'ilo-ai', title: 'Generative AI and Jobs: A Refined Global Index of Occupational Exposure', org: 'ILO · 国际劳工组织 · 2025', url: 'https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure', checked: '2026-11-04' },
    { id: 'unesco-ai', title: 'Guidance for generative AI in education and research', org: 'UNESCO · 联合国教科文组织 · 2023', url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research', checked: '2026-11-04' }
  ],
  systems: [
    {
      id: 'foundations', title: '生存与基础', kicker: '社会的物质底座',
      summary: '食物、水、能源、土地和基础设施，让共同生活成为可能。',
      question: '我们每天依赖的东西，从哪里来，又由谁维护？',
      relations: [{ target: 'economy', label: '提供物质与能源' }, { target: 'governance', label: '需要共同维护' }, { target: 'global', label: '连接跨地区供给' }],
      topics: [
        {
          id: 'resource-flows', title: '资源与生态边界', summary: '沿着一件物品往前追，看到自然资源、能源和环境代价。',
          why: '物品的价格、可获得性和环境影响，分别回答不同的问题。把来源与去向放在一起，才能看见完整过程。',
          actors: ['资源使用者', '生产与运输组织', '周边社区', '公共管理机构'],
          mechanism: [
            { title: '取用与转化', description: '自然条件和技术决定哪些资源能够被取用，劳动与能源把它们转成可使用的物品。' },
            { title: '流通与分配', description: '物品通过不同渠道到达使用者；获取它们需要资源、规则和基础设施共同配合。' },
            { title: '回到环境', description: '废弃物与排放不会因交易结束而消失，需要进一步处理。谁承担这些影响，是另一个分配问题。' }
          ],
          example: { title: '示意：一杯水的前后两端', description: '构造一个社区的供水过程，练习寻找看不见的环节。', steps: ['从水源到净化与输送，需要设施、能源和人员。', '居民取水以后，污水还需要收集与处理。', '如果只观察水龙头，就会漏掉上游条件和下游影响。'] },
          connections: [{ system: 'governance', topic: 'public-provision', label: '谁共同负担设施？' }, { system: 'global', topic: 'supply-chains', label: '资源如何跨地区流动？' }],
          ai: { observation: '条件分析：如果有可靠的监测数据，AI 可以作为预测需求、发现异常的辅助工具。', caution: '预测本身不会增加水源或消除物理约束；数据质量、设施和责任安排仍需核查。', questions: ['优化的是总用量，还是不同群体的可获得性？', '模型出错时，谁能够及时发现并处理？'], sourceIds: [] },
          sourceIds: ['environment', 'division']
        },
        {
          id: 'infrastructure', title: '城市与基础设施', summary: '道路、管网、住房和通信，把分散的人连接成可协作的空间。',
          why: '理解城市，可以同时观察空间布局、服务可达性与日常时间安排。设施建在哪里，关系到谁能使用。',
          actors: ['居民与通勤者', '规划与运营组织', '建设和维护人员', '公共服务提供者'],
          mechanism: [
            { title: '把需求连起来', description: '居住、工作、教育和照护分布在不同地点，交通与通信帮助人们在这些地点之间协作。' },
            { title: '持续运营', description: '设施建成只是开始；维护、调度和更新同样需要长期资源。' },
            { title: '观察分布', description: '评价一套设施时，既可以看总容量，也可以看服务范围、等待时间和不同使用者的便利程度。' }
          ],
          example: { title: '示意：新社区为什么仍然不方便？', description: '假设一片住宅建好了，但通勤线路与照护服务尚未配套。', steps: ['住房数量增加，不代表其他生活条件同步到位。', '画出居民每天要去的几个地点，标出实际路程与时间。', '再问：应补一条线路、调整服务位置，还是改变时间安排？'] },
          connections: [{ system: 'care', topic: 'care-networks', label: '照护为什么依赖空间？' }, { system: 'governance', topic: 'public-provision', label: '服务如何筹资与维护？' }],
          ai: { observation: '条件分析：用模型比较不同调度方案，可能帮助发现拥堵或服务空缺。', caution: '平均效率提高不保证每个人都更便利；需要检查老年人、残障人士等使用者能否实际受益。', questions: ['谁的出行需求没有进入数据？', '方案能否由使用者理解并提出异议？'], sourceIds: [] },
          sourceIds: ['urbanization']
        }
      ]
    },
    {
      id: 'economy', title: '生产与交换', kicker: '协作创造与资源分配',
      summary: '劳动、企业、市场和货币，协调人们生产什么、怎样交换。',
      question: '一份工作、一件商品和一笔收入，背后连接着哪些人？',
      relations: [{ target: 'foundations', label: '依赖资源与设施' }, { target: 'knowledge', label: '吸收知识与技能' }, { target: 'care', label: '依赖人的照护与再生产' }],
      topics: [
        {
          id: 'division-of-labor', title: '劳动分工与组织', summary: '把“一个职业”拆成任务，看清合作如何发生。',
          why: '一份工作通常包含多种任务。理解它们的依赖关系，比仅看职业名称更能解释组织如何运转。',
          actors: ['劳动者', '团队与管理者', '供应商', '使用产品或服务的人'],
          mechanism: [
            { title: '拆分任务', description: '把生产过程拆为若干环节，让不同人积累专门技能。' },
            { title: '协调接口', description: '任务之间需要约定标准、时间与交付方式；局部做得快，也要看整体是否能衔接。' },
            { title: '分配回报与责任', description: '完成协作后，还要决定收益、风险与责任怎样分担。这取决于组织规则与各方条件。' }
          ],
          example: { title: '示意：一家小店的一天', description: '构造一家餐饮小店，观察工作内容而不是职位标签。', steps: ['采购、备料、接单、制作、清洁与记账是不同任务。', '记账速度提高，未必能解决午间制作环节的排队。', '改变某个环节前，先找它与其他环节的依赖。'] },
          connections: [{ system: 'knowledge', topic: 'learning-systems', label: '技能如何形成？' }, { system: 'care', topic: 'care-networks', label: '谁支持劳动者的日常生活？' }],
          ai: { observation: '已有研究：ILO 以任务数据评估生成式 AI 的职业暴露程度，而不是只看职业名称。', caution: '技术暴露不等于实际替代或失业。采用成本、组织调整、质量要求与制度安排都会影响结果。', questions: ['哪些任务可辅助，哪些仍需现场行动与责任判断？', '节省的时间会怎样重新分配？'], sourceIds: ['ilo-ai'] },
          sourceIds: ['division']
        },
        {
          id: 'prices-and-markets', title: '价格与市场协调', summary: '价格传递供需信息，但它不能单独回答所有社会问题。',
          why: '供需模型帮助分析交易中的变化。使用模型时，需要说明条件，也要区分愿望、需求和支付能力。',
          actors: ['购买者', '生产与服务提供者', '交易平台', '制定和执行交易规则的组织'],
          mechanism: [
            { title: '需求与供给相遇', description: '需求包含购买意愿和支付能力；供给取决于生产者在不同价格下愿意提供多少。' },
            { title: '价格影响选择', description: '在其他条件不变的模型中，价格变化会改变购买量与供给量。现实里其他条件也可能同时变化。' },
            { title: '检查模型之外', description: '继续追问：是否存在信息差、进入障碍或交易外部的影响？这些因素需要额外分析。' }
          ],
          example: { title: '示意：下雨后的雨伞摊', description: '假设突然下雨，短时间内需要雨伞的人增加，附近库存暂时不变。', steps: ['先区分是需求条件变化，还是单个顾客改变购买数量。', '观察库存、补货和替代选择，不能只盯住一个价格。', '再分别讨论交易效率与不同人的可负担性。'] },
          connections: [{ system: 'global', topic: 'supply-chains', label: '供给链为什么改变价格？' }, { system: 'culture', topic: 'opportunity-and-inequality', label: '支付能力如何影响机会？' }],
          ai: { observation: '条件分析：如果 AI 降低搜寻与比较信息的成本，买卖双方的选择过程可能改变。', caution: '这并不保证竞争更充分；谁掌握数据、平台入口和定价工具，也需要同时观察。', questions: ['哪些参与者获得了更好的信息？', '选择更多，是否也更容易比较？'], sourceIds: [] },
          sourceIds: ['markets']
        }
      ]
    },
    {
      id: 'governance', title: '治理与公共协调', kicker: '规则、权力与共同事务',
      summary: '法律、公共机构和集体安排，处理共同生活中的协调与冲突。',
      question: '共同的决定由谁作出，依据什么，又由谁负责？',
      relations: [{ target: 'economy', label: '设置交易与组织规则' }, { target: 'culture', label: '与规范和认同互动' }, { target: 'foundations', label: '协调公共基础条件' }],
      topics: [
        {
          id: 'rules-and-authority', title: '规则、权威与问责', summary: '把“谁能决定”与“为什么被接受”分开观察。',
          why: '权力关系存在于国家、组织与日常群体中。理解决定的来源和纠错方式，可以更清楚地识别责任。',
          actors: ['规则制定者', '执行机构与人员', '受影响的人', '监督与争议处理者'],
          mechanism: [
            { title: '形成决定', description: '先识别谁被授权作决定，以及授权依据是程序、职位、习惯还是个人影响。' },
            { title: '落实与影响', description: '规则通过具体的人和组织被执行，不同人可能受到不同影响。' },
            { title: '解释与纠错', description: '观察决定能否被说明、执行是否可监督、争议是否有处理渠道。各地具体安排不同。' }
          ],
          example: { title: '示意：共享活动室的使用规则', description: '构造一个社区：几组居民想在同一时间使用活动室。', steps: ['先确认谁有权分配时段，已有规则是什么。', '比较先到先得、轮换或抽签分别影响哪些人。', '明确遇到误排、噪音或特殊需求时怎样调整。'] },
          connections: [{ system: 'culture', topic: 'norms-and-belonging', label: '成文规则与日常规范如何互动？' }, { system: 'knowledge', topic: 'information-and-evidence', label: '共同决定需要什么信息？' }],
          ai: { observation: '条件分析：AI 可以被设想为整理材料、提示一致性问题的辅助环节。', caution: '辅助分析和授权决定是不同环节。不能把“模型给出的结果”直接当成正当性或责任的来源。', questions: ['系统的建议由谁复核？', '受到影响的人能否获得解释并提出异议？'], sourceIds: [] },
          sourceIds: ['authority']
        },
        {
          id: 'public-provision', title: '公共品与共同供给', summary: '有些收益难以只留给出资者，供给就需要共同协调。',
          why: '公共品的经济学定义强调难以排除使用者、一个人的使用不明显减少他人使用。公共服务的范围更广，两者不能直接画等号。',
          actors: ['使用者与受益者', '出资者', '公共或社会组织', '服务运营与维护者'],
          mechanism: [
            { title: '识别共同收益', description: '先问是否容易排除使用者，以及使用是否相互挤占，避免把所有公共支出都归成同一种物品。' },
            { title: '安排筹资', description: '当受益者可以等待别人出资时，供给可能不足。税收、组织协作或其他筹资方式可用于不同情境。' },
            { title: '评价供给', description: '持续观察服务是否可达、维护是否稳定，以及成本和收益由谁承担。' }
          ],
          example: { title: '示意：社区路口的一盏照明灯', description: '假设安装一盏灯后，经过该处的人都能获得照明。', steps: ['灯亮以后，很难只照向付费的行人。', '社区需要协商安装、用电与维修的承担方式。', '再检查偏远路段或不同使用者是否仍被遗漏。'] },
          connections: [{ system: 'foundations', topic: 'infrastructure', label: '公共供给怎样落到设施？' }, { system: 'care', topic: 'population-and-time', label: '需求变化怎样影响服务安排？' }],
          ai: { observation: '条件分析：AI 可能帮助归类服务需求、整理意见或比较资源配置方案。', caution: '被数字化记录的需求不等于全部需求；仍需线下渠道和人的判断。', questions: ['没有使用数字服务的人是否被看见？', '更便宜的方案是否改变了服务质量或可达性？'], sourceIds: [] },
          sourceIds: ['publicgoods']
        }
      ]
    },
    {
      id: 'knowledge', title: '知识与信息', kicker: '社会如何认识与学习',
      summary: '教育、研究、媒体和技术，让经验被积累、传播、检验与更新。',
      question: '我们凭什么知道一件事，又怎样把它教给别人？',
      relations: [{ target: 'economy', label: '形成技能与技术' }, { target: 'governance', label: '支持公共判断' }, { target: 'culture', label: '传播意义与价值' }],
      topics: [
        {
          id: 'learning-systems', title: '教育与能力形成', summary: '学习发生在学校，也发生在家庭、工作与实践中。',
          why: '把知识接触、解释与实际应用分开，才能讨论学会了什么。教育机会还与时间、资源和学习条件有关。',
          actors: ['学习者', '教师与同伴', '家庭与社区', '学校和工作组织'],
          mechanism: [
            { title: '接触与传递', description: '课程是正式学习的一种形式；参与日常活动，也会学到做事方式与社会规范。' },
            { title: '练习与反馈', description: '在本地图的学习设计中，尝试解释、实践和修正，作为比“看过了”更具体的记录。' },
            { title: '应用到新情境', description: '继续问：离开原来的例子，能否识别何时适用、何时需要换一种方法？' }
          ],
          example: { title: '示意：看懂教程之后', description: '假设你看过一份制作表格的教程，想知道自己掌握到了哪一步。', steps: ['先用自己的话说出它解决的问题。', '换一组构造数据完成一次任务，保留遇到的疑问。', '检查何时不能直接照搬，而不是仅统计阅读次数。'] },
          connections: [{ system: 'economy', topic: 'division-of-labor', label: '学习怎样连接具体任务？' }, { system: 'culture', topic: 'opportunity-and-inequality', label: '谁有持续学习的条件？' }],
          ai: { observation: '机构指导：UNESCO 建议以人的能动性和教育目标为中心审视生成式 AI 的教育使用。', caution: '生成解释的便利，不等于已经理解。工具是否适合学习目标、数据是否得到保护，仍需验证。', questions: ['这次使用帮助我思考了哪一步？', '离开工具后，我能否解释适用条件？'], sourceIds: ['unesco-ai'] },
          sourceIds: ['education']
        },
        {
          id: 'information-and-evidence', title: '信息传播与证据', summary: '把消息、解释与支持它的材料分别检查。',
          why: '媒介改变信息怎样到达我们，也影响什么更容易被看见。本地图建议同时追踪出处、论据和适用范围。',
          actors: ['信息生产者', '传播平台与编辑', '研究与核查者', '阅读和转发的人'],
          mechanism: [
            { title: '生产与选择', description: '一条内容从采集到发布，经过选题、表达和呈现等环节；先识别谁在说、对谁说。' },
            { title: '传播与注意', description: '不同媒介提供不同的传播路径；看得见的内容并不能直接代表全部情况。' },
            { title: '回到依据', description: '定位原始材料，区分材料说了什么、转述者如何解释，以及自己又作了哪些推断。' }
          ],
          example: { title: '示意：“某研究发现”的转发', description: '构造一条消息：它给出很肯定的结论，但没有可定位的研究信息。', steps: ['把结论拆成可以核对的具体说法。', '寻找原始材料与适用对象，不以转发次数代替依据。', '如果找不到材料，暂记为待核实，而不是补出一个出处。'] },
          connections: [{ system: 'governance', topic: 'rules-and-authority', label: '证据怎样进入共同决定？' }, { system: 'culture', topic: 'norms-and-belonging', label: '为什么熟悉的说法更易被接受？' }],
          ai: { observation: '条件分析：生成工具可以加入内容起草和整理流程；因此需要明确哪些内容由工具生成、哪些已经核查。', caution: '这里不把流畅、确定的表达当成事实核验的结果；需要回查具体依据。', questions: ['这句话对应哪个可核查的材料？', '原材料的限定条件是否在转述中被省略？'], sourceIds: ['unesco-ai'] },
          sourceIds: ['media']
        }
      ]
    },
    {
      id: 'care', title: '人口与照护', kicker: '支持人的一生',
      summary: '家庭、健康、养老与代际关系，承接人的成长、依赖和相互支持。',
      question: '当一个人无法独自完成日常生活时，支持从哪里来？',
      relations: [{ target: 'economy', label: '支持劳动与日常再生产' }, { target: 'governance', label: '连接服务与保障安排' }, { target: 'culture', label: '受家庭与责任观念影响' }],
      topics: [
        {
          id: 'care-networks', title: '家庭与照护网络', summary: '看见做饭、陪伴、接送和协助生活等支持性劳动。',
          why: '照护可以由家庭、社区、公共服务和市场服务以不同方式分担。理解这些联系，有助于看见日常时间怎样被安排。',
          actors: ['需要支持的人', '家人或其他照护者', '社区互助组织', '专业与公共服务提供者'],
          mechanism: [
            { title: '辨认具体需要', description: '照护不是一个抽象总量：陪伴、沟通、接送与协助生活需要不同时间和能力。' },
            { title: '组织支持', description: '不同形式的家庭与社会关系都可能提供支持，实际分工需要结合当事人的意愿和条件。' },
            { title: '连接其他制度', description: '工作时间、服务位置和可获得的支持，会共同影响照护如何落实。' }
          ],
          example: { title: '示意：工作日的一次接送', description: '假设一位家庭成员临时需要有人陪同外出，但家中其他人都有既定安排。', steps: ['先列出需要的帮助与时间，不先假定必须由某个人承担。', '比较家庭协调、邻里互助和可用服务的实际条件。', '看清安排改变后，谁的工作、休息与自主选择受到影响。'] },
          connections: [{ system: 'economy', topic: 'division-of-labor', label: '工作组织如何影响照护？' }, { system: 'foundations', topic: 'infrastructure', label: '距离和设施如何影响支持？' }],
          ai: { observation: '条件分析：工具可以被用于整理日程、转写沟通或提示待办，作为协调支持的一部分。', caution: '安排任务不等于提供实际照护。人与人的信任、当事人意愿和隐私需要独立对待。', questions: ['工具减轻了谁的负担，又增加了谁的检查工作？', '需要支持的人能否选择拒绝或改变安排？'], sourceIds: [] },
          sourceIds: ['family']
        },
        {
          id: 'population-and-time', title: '人口结构与代际时间', summary: '用年龄构成、出生、死亡和迁移，观察需求如何变化。',
          why: '总人数不足以描述人口。不同年龄与生活阶段的人，对教育、工作、空间和照护可能有不同需要。',
          actors: ['不同年龄与生活阶段的人', '家庭与社区', '公共服务规划者', '教育和工作组织'],
          mechanism: [
            { title: '观察构成', description: '人口结构是一段时间内的构成图景；出生、死亡和迁移会改变它。' },
            { title: '跟踪时间', description: '同一批人会逐渐进入不同生活阶段。比较不同时点，可以提出服务需求的变化问题。' },
            { title: '审视差异', description: '相同年龄并不意味着相同能力、意愿和生活条件。规划还需要更具体的信息。' }
          ],
          example: { title: '示意：一个社区的十年', description: '构造一个社区：最初入住者以有幼儿的家庭为主，十年后需求发生变化。', steps: ['把同一批居民放在不同年份观察。', '讨论活动空间、教育与照护服务怎样调整。', '为新迁入者和不同家庭保留位置，而不只服务平均居民。'] },
          connections: [{ system: 'governance', topic: 'public-provision', label: '需求变化如何进入服务规划？' }, { system: 'global', topic: 'migration-and-connection', label: '迁移怎样改变人口构成？' }],
          ai: { observation: '条件分析：模型可以帮助比较人口变化的不同假设情境。', caution: '情境推演依赖假设，不是已经发生的事实；预测也不能替代具体群体表达需求。', questions: ['出生、迁移和服务使用分别采用了什么假设？', '结果在哪些条件改变时会失效？'], sourceIds: [] },
          sourceIds: ['population']
        }
      ]
    },
    {
      id: 'culture', title: '文化与共同生活', kicker: '意义、身份与机会',
      summary: '语言、规范、信任和社会位置，影响我们怎样理解彼此与自身。',
      question: '我们习以为常的做法，为什么在别处可能不同？',
      relations: [{ target: 'knowledge', label: '通过传播与学习延续' }, { target: 'governance', label: '与规则和权威互相影响' }, { target: 'care', label: '塑造责任与归属' }],
      topics: [
        {
          id: 'norms-and-belonging', title: '规范、意义与归属', summary: '一些规则写在纸上，另一些藏在“大家都这样做”里。',
          why: '语言、符号和规范帮助人们协作，也可能成为误解的来源。理解一种做法的背景，不意味着必须认同或照做。',
          actors: ['群体成员', '新加入者', '家庭与教育者', '表达不同经验的人'],
          mechanism: [
            { title: '形成共同含义', description: '人们在互动中学习语言、符号与期待，逐渐理解什么在特定情境里被认为合适。' },
            { title: '维持与回应', description: '赞许、提醒和批评可能帮助规范延续；不同人也可能对同一做法有不同解释。' },
            { title: '协商与改变', description: '当新情境出现时，原有习惯可以被讨论、调整或挑战。分析时需说明群体与情境。' }
          ],
          example: { title: '示意：群聊里的“及时回复”', description: '构造一个小组：有人认为看见消息就应回复，有人认为非工作时间可以稍后处理。', steps: ['先把各自默认的期待说清楚。', '区分紧急信息、一般通知和个人时间。', '共同约定一个可理解的方式，并允许后续调整。'] },
          connections: [{ system: 'governance', topic: 'rules-and-authority', label: '习惯何时需要变成明确规则？' }, { system: 'knowledge', topic: 'information-and-evidence', label: '共同含义如何影响传播？' }],
          ai: { observation: '条件分析：生成工具在不同语言与文化情境中的表达，需要由相关使用者判断是否合适。', caution: '一种模型输出不代表整个群体的文化；也不能用群体标签推断某个人的想法。', questions: ['谁的语言习惯被当成默认？', '遇到不同表达时，能否询问而非直接贴标签？'], sourceIds: [] },
          sourceIds: ['culture']
        },
        {
          id: 'opportunity-and-inequality', title: '社会位置与机会分布', summary: '把个人选择放回资源、规则和关系的环境中理解。',
          why: '收入、财富、教育和社会地位是不同维度。观察机会分布，需要同时看个人行动与所处条件。',
          actors: ['处于不同社会位置的人', '家庭与关系网络', '教育与工作组织', '公共与社会支持机构'],
          mechanism: [
            { title: '辨认资源', description: '先区分可以使用的金钱、时间、知识与关系，避免用单一指标概括一个人的处境。' },
            { title: '观察通道', description: '教育、招聘和服务规则，会影响人们把资源转成机会的方式。分析具体机制，不先归因于某个群体的能力。' },
            { title: '看流动与限制', description: '比较进入与离开某种位置的可能性，并检查同样的规则是否产生不同实际影响。' }
          ],
          example: { title: '示意：同一门晚间课程', description: '假设两个人都想参加免费课程，一人有稳定空闲时间，另一人承担晚间照护。', steps: ['课程不收费，是一个条件；时间与地点是另外的条件。', '讨论录播、不同上课时段或照护支持是否改变可参与性。', '用具体处境理解差异，避免把未参加直接解释为不愿学习。'] },
          connections: [{ system: 'knowledge', topic: 'learning-systems', label: '学习机会如何形成？' }, { system: 'care', topic: 'care-networks', label: '时间由谁承担？' }],
          ai: { observation: '条件分析：如果工具需要设备、费用、语言能力或额外核查时间，受益条件就可能不同。', caution: '这是一组需要检验的分配问题，不能据此推断某个个人的能力或未来结果。', questions: ['谁能获得工具、指导和试错机会？', '效率收益与使用成本分别落到谁身上？'], sourceIds: [] },
          sourceIds: ['stratification']
        }
      ]
    },
    {
      id: 'global', title: '全球连接', kicker: '跨越地区的相互依赖',
      summary: '贸易、迁移、信息与合作，把地方生活放进更大的网络。',
      question: '远处发生的事情，沿着什么路径来到身边？',
      relations: [{ target: 'economy', label: '连接生产与交换' }, { target: 'foundations', label: '流动物资与环境影响' }, { target: 'care', label: '连接人口与家庭' }],
      topics: [
        {
          id: 'supply-chains', title: '贸易与供应链', summary: '一件商品可以由多个地区的劳动、资源和规则共同完成。',
          why: '跨地区分工带来联系，也使局部环节的变化能够传递。需要同时观察协作收益、依赖与风险。',
          actors: ['不同地区的劳动者与企业', '运输与基础设施组织', '购买者', '参与协调的公共机构'],
          mechanism: [
            { title: '跨地区分工', description: '原料、设计、制造、运输与服务可以分布在不同地点，通过交易和组织安排相连。' },
            { title: '把环节接起来', description: '标准、通信、运输和交付约定，让跨地区协作能够持续。' },
            { title: '追踪影响', description: '当一个环节改变时，沿着投入、交付与替代渠道观察影响，不把所有变化归给一个原因。' }
          ],
          example: { title: '示意：一件衣服的路线', description: '构造一件衣服：纤维、面料、缝制和销售分别在不同地点完成。', steps: ['把每个环节和所需投入画出来。', '假设一个运输环节延迟，看看哪些后续任务受影响。', '再比较替代路线的成本、时间与劳动条件。'] },
          connections: [{ system: 'economy', topic: 'division-of-labor', label: '分工如何从团队延伸到地区？' }, { system: 'foundations', topic: 'resource-flows', label: '原料与环境影响去向哪里？' }],
          ai: { observation: '条件分析：如果供应链数据可靠且可共享，AI 可以被用于比较排程或识别异常信号。', caution: '信息建议不能移除运输、产能与跨组织协调的现实约束；数据也可能只覆盖部分环节。', questions: ['哪些环节没有被记录？', '提高局部效率，是否增加了整体依赖？'], sourceIds: [] },
          sourceIds: ['globalization']
        },
        {
          id: 'migration-and-connection', title: '人口迁移与跨地生活', summary: '人的移动，连接工作、家庭、语言和公共服务。',
          why: '迁移可能来自工作、学习、团聚或被迫离开等不同原因。理解跨地生活，应同时看人的意愿与所面对的条件。',
          actors: ['迁移者与其家庭', '迁出和迁入社区', '雇主与教育组织', '公共服务与支持机构'],
          mechanism: [
            { title: '区分移动情境', description: '先说明是地区内部移动还是跨国迁移，以及使用的统计或分析定义。不同身份和经历不能混为一谈。' },
            { title: '连接多个地点', description: '迁移者可能同时维持不同地点的亲属、工作与信息联系。' },
            { title: '理解进入条件', description: '语言、住房、工作和服务可达性影响具体生活；相关制度需要按地域与时间另行核查。' }
          ],
          example: { title: '示意：在另一座城市开始生活', description: '假设一个人因学习或工作搬到陌生城市，同时仍需与原居地的家人互相支持。', steps: ['列出新城市中的日常需要，以及原居地仍保持的联系。', '找出信息、服务与支持网络分别从哪里获得。', '不要把一个人的经历当成所有迁移者的共同经历。'] },
          connections: [{ system: 'care', topic: 'care-networks', label: '支持网络如何跨越距离？' }, { system: 'culture', topic: 'norms-and-belonging', label: '如何理解新环境中的期待？' }],
          ai: { observation: '条件分析：翻译与信息整理工具可以被放进跨语言沟通的辅助流程。', caution: '工具输出不能替代对当地正式信息的核查；涉及身份、权利和申请事项时，应回到对应机构。', questions: ['翻译有没有遗漏重要条件？', '原始信息由谁发布，适用于哪个地方和时间？'], sourceIds: [] },
          sourceIds: ['migration', 'population']
        }
      ]
    }
  ],
  paths: [
    {
      id: 'work-in-society', title: '从一份工作看见社会',
      description: '沿着任务、技能、照护与全球分工，理解工作所依赖的系统。',
      steps: [{ system: 'economy', topic: 'division-of-labor' }, { system: 'knowledge', topic: 'learning-systems' }, { system: 'care', topic: 'care-networks' }, { system: 'global', topic: 'supply-chains' }]
    },
    {
      id: 'living-in-a-city', title: '从日常生活读懂城市',
      description: '把水电道路、共同供给、人口需求和机会分布放到同一张图里。',
      steps: [{ system: 'foundations', topic: 'infrastructure' }, { system: 'governance', topic: 'public-provision' }, { system: 'care', topic: 'population-and-time' }, { system: 'culture', topic: 'opportunity-and-inequality' }]
    },
    {
      id: 'understanding-a-claim', title: '从一条消息理解共同判断',
      description: '追踪信息的依据、传播中的含义，以及它如何进入公共决定。',
      steps: [{ system: 'knowledge', topic: 'information-and-evidence' }, { system: 'culture', topic: 'norms-and-belonging' }, { system: 'governance', topic: 'rules-and-authority' }, { system: 'knowledge', topic: 'learning-systems' }]
    }
  ],
  history: [
    {
      id: 'land-and-season', title: '土地与季节', period: '农业组织视角 · 至今仍然存在',
      summary: '观察土地、季节与生存资料怎样影响生产和共同生活。这里只提取一种组织特征，不把所有农业社会视为相同。',
      organization: '以土地、家庭劳动与地方协作为观察入口。',
      knowledge: '留意经验如何在家庭、社区和实践中传递。',
      tension: '观察自然条件、资源获取和分工怎样影响不同人的生活；地区经验不能互相替代。',
      sourceIds: ['societies']
    },
    {
      id: 'machines-and-organizations', title: '机器与组织', period: '工业组织视角 · 与其他方式交织',
      summary: '观察机械化、专业分工和较大组织如何重组生产与日常时间。它与家庭照护、农业及地方生活持续相连。',
      organization: '以工厂、组织层级、标准化和任务衔接为观察入口。',
      knowledge: '留意专门训练、技术标准与组织内部的知识传递。',
      tension: '同时检查效率、工作自主性、环境代价和收益分配，避免用一个指标概括整体变化。',
      sourceIds: ['societies', 'division']
    },
    {
      id: 'networks-and-platforms', title: '网络与信息', period: '数字组织视角 · 依赖物质底座',
      summary: '观察通信网络怎样使信息、服务与协作跨越距离。数字活动仍需要能源、设备、劳动和规则。',
      organization: '以信息连接、远程协作与平台接口为观察入口。',
      knowledge: '留意传播速度、可复制性、注意力与核验方式。',
      tension: '同时追问便利与依赖、参与机会与进入障碍；网络中的可见内容不等于社会全貌。',
      sourceIds: ['media', 'globalization']
    },
    {
      id: 'ai-collaboration', title: '人与 AI 协作', period: '开放情境 · 不预设未来社会形态',
      summary: '以任务和责任为单位，思考生成式 AI 被引入后有哪些可能变化。这是条件分析，不是“下一阶段必然到来”的结论。',
      organization: '分别识别机器辅助、人的判断、现场行动与最终责任。',
      knowledge: '区分生成、核查、解释与应用，观察学习机会如何重新安排。',
      tension: '结果取决于能力、成本、组织与制度。技术暴露指标不能直接推导实际就业或个人命运。',
      sourceIds: ['ilo-ai', 'unesco-ai']
    }
  ]
};
