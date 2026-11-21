/* The navigation groups are editorial. A–T identifies the source industry section. */
(() => {
  'use strict';

  const groups = [
    {id:'resources', title:'资源与基础供给', lead:'从食物和原料，到电、水、气和热。', icon:'sun'},
    {id:'production', title:'生产与建成环境', lead:'把材料制成产品，建设和管理人们使用的空间。', icon:'tool'},
    {id:'circulation', title:'流通与日常服务', lead:'让商品和人员到达目的地，提供生活中的接待、维护和服务。', icon:'truck'},
    {id:'knowledge', title:'信息与专业服务', lead:'传递信息，提供软件、研究、设备使用和专业支持。', icon:'layers'},
    {id:'finance', title:'资金与风险', lead:'组织资金流转，记录交易并处理约定的风险。', icon:'credit-card'},
    {id:'wellbeing', title:'成长、照护与文化', lead:'帮助人学习、获得照护，并参与文化和体育活动。', icon:'users'},
    {id:'public', title:'公共事务与合作', lead:'管理公共环境与设施，协调社区、社会组织和跨国事务。', icon:'globe'}
  ];

  const sectors = [
    {
      id:'agriculture', code:'A', group:'resources', title:'农林牧渔', official:'农、林、牧、渔业',
      summary:'从种植、养殖到初步整理，把生物资源变成可交付的产品。自然条件会改变工作安排。',
      work:[{title:'安排生产',text:'把地块或养殖单元、季节和人力列在同一张工作表上。'},{title:'记录批次',text:'标明采收时间和来源，让交接方能追查这批货从哪里来。'}],
      skills:['map-flow','verify-evidence'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'mining', code:'B', group:'resources', title:'采矿', official:'采矿业',
      summary:'勘查、开采和处理矿产资源，为后续加工提供原料。',
      work:[{title:'辨认样品',text:'让样品与采集地点、时间和检测记录对应。'},{title:'交接设备状态',text:'把已完成检查、待处理异常和责任人写清楚。'}],
      skills:['verify-evidence','explain-work'], thinking:['trace','compare'], related:[]
    },
    {
      id:'manufacturing', code:'C', group:'production', title:'制造', official:'制造业',
      summary:'把原料和零件加工、装配成产品，再用检验确认结果是否符合要求。',
      work:[{title:'画出生产环节',text:'用工序和交接点表示从来料、加工到检验的过程。'},{title:'追查质量异常',text:'对照批次、工序和检验记录，找到结果开始偏离的地方。'}],
      skills:['map-flow','verify-evidence'], thinking:['trace','compare'], related:[], demo:'manufacturing'
    },
    {
      id:'utilities', code:'D', group:'resources', title:'能源与供水', official:'电力、热力、燃气及水生产和供应业',
      summary:'组织电、水、气和热的生产与供应，让家庭和组织能够持续使用。',
      work:[{title:'记录供应变化',text:'在监测记录中区分用量变化、设备异常和计划检修。'},{title:'说明服务影响',text:'告知受影响范围、预计恢复时间，以及哪些信息还待确认。'}],
      skills:['verify-evidence','explain-work'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'construction', code:'E', group:'production', title:'建筑与工程施工', official:'建筑业',
      summary:'把设计落实为房屋、道路等工程，通过施工和验收把工作交给使用方。',
      work:[{title:'协调施工交接',text:'记录哪个工序完成后，下一组人员才能进场。'},{title:'核对图纸版本',text:'施工和验收前确认大家使用同一版图纸和变更记录。'}],
      skills:['map-flow','verify-evidence'], thinking:['trace','compare'], related:[]
    },
    {
      id:'trade', code:'F', group:'circulation', title:'批发与零售', official:'批发和零售业',
      summary:'通过采购、备货和销售，把供应方的商品交给其他商家或最终顾客。',
      work:[{title:'补货',text:'把现有库存、待到货和销售记录放在一起，判断哪些商品需要补充。'},{title:'查库存差异',text:'从进货、销售、退货和盘点四种记录回查数量为什么对不上。'}],
      skills:['map-flow','verify-evidence'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'logistics', code:'G', group:'circulation', title:'交通与物流', official:'交通运输、仓储和邮政业',
      summary:'让人员和货物跨地点移动。仓储、运输、分拣和交付之间需要接力。',
      work:[{title:'规划交接',text:'写清货物在哪里交给谁，以及到达后如何确认。'},{title:'查包裹延误',text:'沿揽收、分拣、运输、派送的记录，找到最先失去确认的环节。'}],
      skills:['map-flow','verify-evidence'], thinking:['trace','feedback'], related:[], demo:'logistics'
    },
    {
      id:'hospitality', code:'H', group:'circulation', title:'住宿与餐饮', official:'住宿和餐饮业',
      summary:'为客人提供住宿、餐饮和相关接待，协调订单、现场服务与后续交接。',
      work:[{title:'核对接待需求',text:'把时间、人数和已确认的服务写进接待记录。'},{title:'交接未完成事项',text:'换班时说明哪些订单已经处理，哪些还等客人确认。'}],
      skills:['map-flow','explain-work'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'software', code:'I', group:'knowledge', title:'通信、软件与信息服务', official:'信息传输、软件和信息技术服务业',
      summary:'让人通过网络传递信息，并用软件和信息服务处理具体任务。',
      work:[{title:'把需求写成可验证结果',text:'举一个用户操作的例子，说清输入、预期输出和怎样判断完成。'},{title:'查服务异常',text:'跟随请求经过的环节，对照日志和返回结果缩小排查范围。'}],
      skills:['map-flow','verify-evidence','explain-work'], thinking:['trace','feedback'],
      related:[
        {title:'软件与计算',href:'#domain/computing',reason:'继续了解数据、算法、系统怎样协作。'},
        {title:'人工智能',href:'#domain/ai',reason:'了解模型、检索和工具怎样参与软件任务。'}
      ],
      demo:'software'
    },
    {
      id:'finance', code:'J', group:'finance', title:'金融', official:'金融业',
      summary:'组织支付、资金流转和约定的风险分担，相关业务依赖可追溯的记录。',
      work:[{title:'对账',text:'按交易编号、金额和时间核对不同记录，标出无法对应的条目。'},{title:'说明办理条件',text:'把适用范围、所需材料和未确定事项讲给办理人。'}],
      skills:['verify-evidence','explain-work'], thinking:['compare','trace'], related:[]
    },
    {
      id:'property', code:'K', group:'production', title:'房地产与物业', official:'房地产业',
      summary:'围绕房屋和空间开展开发、经营和管理，也包括物业等服务。',
      work:[{title:'登记空间状态',text:'让位置、使用状态、交接日期和负责人能查得到。'},{title:'跟进物业事项',text:'从报修到处理，再到使用方确认，标明每一步进度。'}],
      skills:['map-flow','explain-work'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'business-services', code:'L', group:'knowledge', title:'租赁与商务服务', official:'租赁和商务服务业',
      summary:'向个人和组织提供设备使用、咨询、会展和其他经营支持。',
      work:[{title:'明确委托范围',text:'和委托方确认交付物、时间和验收依据。'},{title:'安排租赁交接',text:'记录设备交出与归还时的状态，便于双方核对。'}],
      skills:['map-flow','explain-work'], thinking:['compare','feedback'], related:[]
    },
    {
      id:'research', code:'M', group:'knowledge', title:'科研与技术服务', official:'科学研究和技术服务业',
      summary:'通过研究、试验、检测和专业技术工作，为产品、工程和决策提供依据。',
      work:[{title:'设计对照',text:'先确定要比较什么，哪些条件需要保持一致。'},{title:'交付检测记录',text:'说明样品、测试条件、观察到的结果和适用范围。'}],
      skills:['verify-evidence','explain-work'], thinking:['compare','feedback'], related:[]
    },
    {
      id:'environment', code:'N', group:'public', title:'水利、环境与公共设施', official:'水利、环境和公共设施管理业',
      summary:'管理水利、生态环境和公共设施，维护人们共同使用的空间与资源。',
      work:[{title:'登记巡查发现',text:'记下异常的时间、位置和影响范围，交给负责人员判断。'},{title:'复查处理效果',text:'把处理前后的观察放在一起，核对原来发现的问题是否还存在。'}],
      skills:['verify-evidence','explain-work'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'personal-services', code:'O', group:'circulation', title:'居民服务与修理', official:'居民服务、修理和其他服务业',
      summary:'承接家务、维修和其他日常服务，把用户的生活需求变成可交付的工作。',
      work:[{title:'接收服务需求',text:'让用户描述发生了什么、影响什么，以及希望恢复到什么状态。'},{title:'确认处理结果',text:'按原始需求逐项对照，说明已完成和还待处理的事项。'}],
      skills:['map-flow','explain-work'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'education', code:'P', group:'wellbeing', title:'教育', official:'教育',
      summary:'组织教学、练习与反馈，帮助学习者逐步理解知识和使用方法。',
      work:[{title:'设计一段学习活动',text:'从学习目标出发，安排讲解、尝试和检查。'},{title:'观察能否迁移',text:'换一道情境相近的题，看学习者能否说明自己为什么这样做。'}],
      skills:['map-flow','explain-work'], thinking:['feedback','compare'],
      related:[{title:'教育与传播',href:'#domain/education',reason:'了解学习、媒介和反馈如何配合。'}]
    },
    {
      id:'health-social', code:'Q', group:'wellbeing', title:'卫生与社会工作', official:'卫生和社会工作',
      summary:'组织健康服务、照护和社会支持。服务过程往往需要多人沟通和交接。',
      work:[{title:'记录服务需求',text:'按本机构要求记录沟通时间、已确认事项和后续联系人。'},{title:'协调服务交接',text:'用授权范围内的资料向接手者说明进展和待确认的问题。'}],
      skills:['verify-evidence','explain-work'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'culture-sport', code:'R', group:'wellbeing', title:'文化、体育与娱乐', official:'文化、体育和娱乐业',
      summary:'创作和传播内容，也组织展览、演出、体育与休闲活动。',
      work:[{title:'安排活动流程',text:'明确准备、入场、现场运行和撤场的负责人。'},{title:'复盘参与体验',text:'整理观众反馈，区分内容、动线和信息告知方面的问题。'}],
      skills:['map-flow','explain-work'], thinking:['compare','feedback'],
      related:[{title:'教育与传播',href:'#domain/education',reason:'从内容如何被理解，继续认识媒介和受众。'}]
    },
    {
      id:'public-administration', code:'S', group:'public', title:'公共管理与社会组织', official:'公共管理、社会保障和社会组织',
      summary:'组织公共事务、社会保障和社会组织活动，协调不同人群的共同需求。',
      work:[{title:'梳理服务流程',text:'从受理、核对材料到反馈结果，标明每一步需要的信息。'},{title:'记录协调事项',text:'把已确定的安排、责任人和待议问题分开记录。'}],
      skills:['map-flow','explain-work'], thinking:['trace','feedback'], related:[]
    },
    {
      id:'international-organizations', code:'T', group:'public', title:'国际组织', official:'国际组织',
      summary:'由相关国际组织开展跨国议题上的沟通、协调和项目活动。',
      work:[{title:'整理多方信息',text:'让不同语言或不同时间提交的材料保留来源和版本。'},{title:'跟进共同安排',text:'从会议记录里分出已经决定的事项和需要各方再确认的内容。'}],
      skills:['verify-evidence','explain-work'], thinking:['compare','feedback'], related:[]
    }
  ];

  // An industry can help explain more than one part of society.
  const worldIndustries = {
    foundations:[
      ['agriculture','食物从哪里来？从种植、养殖和采收看日常食物的起点。'],
      ['utilities','水、电、气和热怎样持续送到人们手中？'],
      ['mining','建筑和制造所用的矿物原料怎样被发现、开采并送往下一站？'],
      ['construction','人们居住和出行所需的房屋、道路怎样建起来？']
    ],
    economy:[
      ['manufacturing','原料经过哪些分工，才变成能交付的产品？'],
      ['trade','供货、备货和销售怎样把商品送到顾客面前？'],
      ['logistics','商品成交后，仓库、承运方与收货方怎样接力？'],
      ['finance','付款、融资和风险分担怎样支持交易？'],
      ['property','建成的房屋和空间怎样进入使用，又由谁持续管理？'],
      ['business-services','组织怎样借助租赁、咨询等服务完成一项工作？']
    ],
    governance:[
      ['public-administration','公共需求怎样被受理，决定怎样落实到负责的人？'],
      ['environment','多方共同使用的水系、环境和公共设施怎样维护？'],
      ['international-organizations','跨越国界的共同问题，怎样由不同参与方协调？']
    ],
    care:[
      ['health-social','健康、照护与社会支持，怎样在家庭和服务组织之间衔接？'],
      ['education','人怎样通过教学、练习与反馈逐步形成能力？'],
      ['personal-services','家庭中的维修、家务等需求，怎样交给专业服务者处理？'],
      ['hospitality','离开家时，饮食与住宿怎样由多人分工提供？']
    ],
    global:[
      ['logistics','商品跨越地区时，运输、仓储与交接记录怎样接续？'],
      ['trade','跨地区采购和销售怎样连接产地、商家与顾客？'],
      ['international-organizations','多方怎样交换资料、形成安排并跟进执行？'],
      ['software','通信网络与软件怎样让不同地方的人交换信息、协同工作？']
    ],
    culture:[
      ['culture-sport','内容和活动怎样从创作走向观众？'],
      ['education','语言、经验和共同习惯怎样通过学习得以传递？'],
      ['hospitality','饮食与接待怎样让地方生活习惯被外来者看见？']
    ],
    knowledge:[
      ['software','数据怎样通过网络流动，又怎样被软件用于具体任务？'],
      ['research','一个想法怎样经过试验和检测，变成可以核对的结论？'],
      ['education','已有知识怎样转化成别人可以理解和使用的能力？'],
      ['business-services','专业经验怎样变成可以交付的咨询、策划和协作服务？']
    ]
  };

  const source = {
    title:'国家统计局 · 国民经济行业分类（GB/T 4754—2017）',
    url:'https://www.stats.gov.cn/xxgk/tjbz/gjtjbz/201710/t20171017_1758922.html'
  };

  window.INDUSTRY_DATA = {groups,sectors,worldIndustries,source};
})();
