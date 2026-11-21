/*
 * 见全 · 软件与计算：从一次网页请求理解表示、步骤、协作与验证。
 * 原创科普解释；编号、收藏、检索及测试情境均为教学示例。
 * 四个入口是阅读框架，并非计算机科学的完整学科分类。
 */
(() => {
  'use strict';

  const section = (title, text) => ({ title, text });
  const step = (title, text) => ({ title, text });
  const source = (title, url) => ({ title, url });
  const refs = {
    representation: source('Harvard CS50 · 信息表示、算法与抽象', 'https://cs50.harvard.edu/x/notes/0/'),
    dataTypes: source('MDN · 数据类型与数据结构', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures'),
    algorithms: source('Harvard CS50 · 查找、排序与算法效率', 'https://cs50.harvard.edu/x/notes/3/'),
    web: source('MDN · 网页怎样到达浏览器', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works'),
    clientServer: source('MDN · 客户端与服务器如何协作', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview'),
    testing: source('MIT · 软件构造：系统地选择测试', 'https://web.mit.edu/6.031/www/sp21/classes/03-testing/'),
    ml: source('Google · 什么是机器学习', 'https://developers.google.com/machine-learning/intro-to-ml/what-is-ml'),
    production: source('Google · 模型以外的机器学习系统', 'https://developers.google.com/machine-learning/crash-course/production-ml-systems'),
    mlTesting: source('Google · 机器学习系统的部署测试', 'https://developers.google.com/machine-learning/crash-course/production-ml-systems/deployment-testing'),
    webHistory: source('CERN · 万维网的诞生', 'https://home.cern/science/computing/the-birth-of-the-web')
  };

  const articles = {
    'comp-data': {
      id: 'comp-data',
      domain: 'computing',
      title: '数字不是含义：信息怎样进入计算机？',
      eyebrow: '软件与计算 · 数据表示',
      lead: '电脑能保存一本书、一段声音和一张照片，是因为我们为它们约定了可存储、可处理的表示方法。理解这些表示，不用先学会编程；先分清“记录了什么”和“它意味着什么”，就能看见许多数据错误和 AI 误解的起点。',
      sections: [
        section('先约定表示，机器才能处理', '计算机底层使用二进制表示信息，但一串零和一不会自带含义。文字需要字符编码，图片可以用像素及其颜色数值表示，声音可以用一系列采样值表示。编码规则让软件能够还原或处理这些记录；记录本身并不能保证拍到的景象、录入的文字或说话内容是真的。'),
        section('同样一串数字，角色可能完全不同', '数字可以表示数量，也可以只是编号。书的编号“00123”若被当作数量，开头的零可能丢失；温度“30”若没有单位，也无法可靠比较。软件不仅需要保存值，还要知道它属于哪个字段、采用什么单位和规则。把这些约定组织好，比把所有东西塞进一个文本框更容易核对和使用。'),
        section('AI 也从表示后的信息出发', '模型不会直接接触一个完整的现实世界。它接收经过选择、编码和处理的输入；输入缺了上下文，重要区别也可能一起丢掉。把一次投诉只记录为“负面”，就看不到它是在抱怨物流还是商品。这提醒我们：使用 AI 前先检查材料怎样被描述，不能只追问模型够不够聪明。')
      ],
      example: {
        title: '示意：同一个“00123”，两种解释',
        text: '借阅系统把“00123”存成书目编号，保留每一位；统计系统把 123 当作本数，可以加减。两者看起来相近，允许的操作却不同。再给记录补上书名、版本和来源，才能判断它指向哪一本书。这个例子说明字段含义的重要性，并非真实馆藏记录。'
      },
      takeaway: '数据是按规则记录的信息；编码正确、含义清楚和内容真实，是三个需要分别检查的问题。',
      visual: {
        kind: 'flow',
        steps: [
          step('现实中的对象', '一本具体的书'),
          step('选择描述', '书名、版本、编号'),
          step('约定表示', '编号是文本，册数是数量'),
          step('存储与使用', '按约定查找和比较')
        ]
      },
      related: ['comp-algorithms', 'comp-systems', 'comp-testing'],
      crossLinks: [
        { href: '#article/info-finding', title: '走向信息组织：怎样认出一本书', reason: '机器需要清楚的字段，读者也需要足够的描述来区分相似资料。' },
        { href: '#article/ai-context', title: '回到 AI：输入为什么需要上下文', reason: '模型收到的是有限的表示，缺失的背景会影响它怎样解释材料。' }
      ],
      sources: [refs.representation, refs.dataTypes, refs.ml]
    },
    'comp-algorithms': {
      id: 'comp-algorithms',
      domain: 'computing',
      title: '算法：把“帮我找到”变成可以执行的步骤',
      eyebrow: '软件与计算 · 算法',
      lead: '找一份文件、给商品排序、规划一条路线，都要先把模糊愿望变成明确问题，再选择执行步骤。算法就是解决问题的方法。它是否合适，不只看能否给出结果，还要看前提是否成立、花了多少资源，以及结果到底满足了谁的要求。',
      sections: [
        section('先把问题说清楚', '“帮我找好书”还不能直接成为执行步骤：好是指销量高、适合入门，还是与你的研究相关？如果先约定“在这份目录中找出某个编号”，输入、输出和判断标准就明确了。算法处理的是被定义出来的问题；定义漏掉了人的真实需要，步骤执行得再准确也可能答非所问。'),
        section('同一个目标，可以有不同的走法', '在没有顺序的书单里查编号，可以从头逐项比较；若编号已经排好序，就能先看中间，再决定查前半还是后半，逐步缩小范围。后一种做法利用了“有序”这个前提。实际选择还要算上整理、更新和保存数据的成本，不能只看某一次查找用了多少步。'),
        section('机器学习没有让算法消失', '在机器学习中，人仍要安排数据怎样准备、模型怎样训练、结果怎样产生和评估；区别在于，部分行为通过数据训练得到，而不是逐条写成判断规则。模型生成回答时也处在一套计算流程中。“用了 AI”并没有省掉定义目标、选择材料和检查结果这些问题。')
      ],
      example: {
        title: '示意：查编号与找好书，是两种问题',
        text: '查编号可以逐项比较是否相同，也可以在有序书单中不断缩小范围；找一本适合新手的书，还要先说明背景、难度和用途。查找再快，也不会自动回答“适不适合我”。因此推荐系统既包含计算步骤，也包含对目标和评价标准的选择。'
      },
      takeaway: '理解算法，先问它解决什么问题、依赖什么前提，再问它怎样执行以及代价多大。',
      visual: {
        kind: 'compare',
        steps: [
          step('逐项查找', '逐个比较；无需事先有序'),
          step('折半查找', '先看中间；依赖编号有序'),
          step('共同的目标', '确认目标编号是否在书单中'),
          step('共同的边界', '找到编号不等于找到好书')
        ]
      },
      related: ['comp-data', 'comp-systems', 'comp-testing'],
      crossLinks: [
        { href: '#article/retrieval', title: '走向 AI：检索怎样帮助回答问题', reason: '检索是一组查找与排序步骤，它提供材料，但不自动保证最终回答正确。' },
        { href: '#article/ai-generation', title: '继续理解：模型怎样生成文字', reason: '生成也是计算过程，理解步骤有助于区分“生成了答案”与“验证了事实”。' }
      ],
      sources: [refs.algorithms, refs.ml]
    },
    'comp-systems': {
      id: 'comp-systems',
      domain: 'computing',
      title: '点一下网页，背后是谁在接力？',
      eyebrow: '软件与计算 · 系统连接',
      lead: '我们看到的是一个按钮，背后可能有浏览器、网络、服务器和数据库共同工作。沿着一次请求往返，就能理解软件为什么需要分工，也能看见“页面显示了”和“事情真正办成了”之间的距离。AI 产品同样需要这样的协作链条。',
      sections: [
        section('网页是一个入口，不是整个系统', '浏览器负责接收操作、展示内容，也可以在本地完成一些计算。需要远端资料时，它会向服务器发送请求；服务器处理后再返回页面或数据。一个界面背后可能请求多个服务，也可能直接使用已经保存的资源。因此，不能从按钮的数量推断背后只有几个工作环节。'),
        section('把信息怎样流动看清楚', '以一个联网收藏功能为例：浏览器提交书目编号，服务端检查请求、写入记录，再返回结果，页面据此更新显示。这些环节通过约定的接口传递信息。网络中断或保存失败时，页面上亮起一颗星并不足以证明远端已经保存；系统需要区分等待、成功和失败这些状态。'),
        section('AI 模型也是接力中的一个环节', '一个能查询资料的 AI 助手，除了模型，还可能需要检索材料、检查访问权限、调用工具和记录结果。回答不好，原因可能是模型推断有误，也可能是材料没找到、接口失败或结果过时。把流程画出来，才能知道该在哪个环节改进，不能把所有问题都归结为模型能力。')
      ],
      example: {
        title: '示意：书目收藏的四站接力',
        text: '用户点击收藏，浏览器发送书目编号，服务器保存记录，成功响应返回后页面显示“已收藏”。若响应迟迟不到，界面应让用户知道还未确认结果。这里描述的是一种联网服务的设计；仅存于当前浏览器的收藏功能，可以不经过远端服务器。'
      },
      takeaway: '理解软件系统，可以沿着输入、处理、保存和反馈追踪；看见每个交接点，也就看见了可能的故障点。',
      visual: {
        kind: 'flow',
        steps: [
          step('浏览器', '提交书目编号与收藏请求'),
          step('服务器', '检查请求并安排处理'),
          step('数据存储', '保存收藏记录并返回结果'),
          step('浏览器', '收到响应，再更新状态')
        ]
      },
      related: ['comp-data', 'comp-algorithms', 'comp-testing'],
      crossLinks: [
        { href: '#article/ai-agent', title: '走向 AI：助手怎样调用工具完成任务', reason: '工具调用把模型接入真实系统，需要跟踪每次请求和执行结果。' },
        { href: '#article/retrieval', title: '回看 AI：检索与生成怎样配合', reason: '检索与生成各有职责，画出接力关系才能定位缺失和错误。' }
      ],
      sources: [refs.web, refs.clientServer, refs.production]
    },
    'comp-testing': {
      id: 'comp-testing',
      domain: 'computing',
      title: '运行成功一次，为什么还不能放心？',
      eyebrow: '软件与计算 · 验证与可靠性',
      lead: '网页打开了、程序给了答案、模型说得很流畅，都只是一种观察。要判断它是否可靠，还要知道原本应该发生什么，在什么条件下试过，哪些情况尚未覆盖。测试的价值，是把笼统的“感觉能用”变成有范围、能复查的证据。',
      sections: [
        section('先说清“对”是什么意思', '测试需要把实际结果与预期结果比较。收藏功能的预期可能是“同一本书重复点击不会产生重复记录”，搜索的预期可能是“目标资料确实包含在结果中”。如果没有明确标准，看到页面没有报错也无法判断目标是否达成。标准本身还应对应用户需求，而不是只方便程序通过。'),
        section('挑选有区别的情况，而不是重复点同一个按钮', '正常输入、空输入、边界值和中断情境可能触发不同问题。测试单个小功能，可以定位局部逻辑；把多个环节连起来试，才能发现交接不一致。有限的测试无法穷尽所有情况，因此应说明覆盖了哪些条件。修改之后再运行已有测试，有助于发现原来能用的行为被破坏。'),
        section('AI 的质量也要放进具体情境', '生成式模型的答案可能变化，评价不能只比对某一句固定文字。可以检查是否回应了任务、关键事实是否有依据、引用是否支持结论，并用不同类型的材料持续比较。系统还要检查数据、工具和服务是否正常。一次表现很好只是一个样本；场景或版本变化后，原有结论也需要复查。')
      ],
      example: {
        title: '示意：把“能收藏”拆成可检查的行为',
        text: '先收藏一本书，再重复收藏、刷新页面，并观察网络中断时的提示。每一步都先写明预期：是否重复、是否仍能看到记录、是否把未确认说成成功。这组情境能发现几类具体问题，但不能因此宣称整个系统从此没有错误。'
      },
      takeaway: '可靠性来自有明确标准的检查与持续修正；通过测试说明了哪些证据存在，也留下了尚未覆盖的边界。',
      visual: {
        kind: 'flow',
        steps: [
          step('定预期', '成功应该表现为什么'),
          step('选情境', '正常、边界与失败条件'),
          step('比较结果', '观察行为与预期的差异'),
          step('保留证据', '记录条件，修改后复查')
        ]
      },
      related: ['comp-systems', 'comp-data', 'comp-algorithms'],
      crossLinks: [
        { href: '#domain/education', title: '跨到教育与传播：理解如何得到检验', reason: '软件的测试与人的学习评价不是一回事，但都需要让判断对应具体表现。' },
        { href: '#article/ai-generation', title: '回到 AI：流畅的回答为什么还要核查', reason: '生成质量需要任务和事实标准，不能只用语言是否自然来判断。' }
      ],
      sources: [refs.testing, refs.mlTesting]
    }
  };

  window.JOURNEY_COMPUTING = {
    domain: {
      id: 'computing',
      title: '软件与计算',
      icon: 'code',
      lead: '软件把人的目标变成机器可以处理的表示与步骤，再让多个环节协作完成任务。从一次查找、一次收藏开始，看懂数据、算法、系统和验证，也就有了理解 AI 怎样进入日常产品的基础。',
      nodes: [
        { id: 'comp-data', title: '数据表示', question: '文字、图片和编号怎样进入机器？', icon: 'database', article: 'comp-data' },
        { id: 'comp-algorithms', title: '算法', question: '一个愿望怎样变成执行步骤？', icon: 'git-branch', article: 'comp-algorithms' },
        { id: 'comp-systems', title: '系统连接', question: '点一次网页，哪些环节在接力？', icon: 'share-2', article: 'comp-systems' },
        { id: 'comp-testing', title: '验证与可靠性', question: '有了结果，怎样知道是否可信？', icon: 'shield', article: 'comp-testing' }
      ],
      how: [
        { title: '把需要说清，把信息记清', text: '先明确要完成什么、输入有哪些、什么结果算合适，再为信息选择字段、类型和表示规则。' },
        { title: '安排步骤，连接分工', text: '算法组织处理步骤，系统让界面、计算和存储等环节按约定交换信息；AI 模型也可以成为其中一个环节。' },
        { title: '对照目标，检查与修正', text: '以具体情境检查结果和交接过程，保留尚未覆盖的边界；需求、数据或软件变化时继续验证。' }
      ],
      history: [
        { title: '从手工步骤到可执行程序', text: '计算让处理步骤可以被机器重复执行。表示、条件判断和循环构成理解程序的基础，也让人能把常用操作组合成更大的功能。' },
        { title: '1989：让信息跨电脑连接', text: 'Tim Berners-Lee 在 CERN 提出后来成为万维网的信息系统。网页与链接把分散的信息连起来，软件也逐渐成为人与远端服务交互的入口。' },
        { title: '模型进入既有的软件系统', text: '机器学习让部分行为由数据训练得到；产品仍然依赖数据处理、服务、接口和验证。新的能力叠加在协作体系中，并没有让这些基础消失。' }
      ],
      sources: [refs.representation, refs.algorithms, refs.web, refs.testing, refs.webHistory, refs.production],
      guide: {
        kicker: '从熟悉的动作进入',
        title: '沿着一次点击，看见软件的内部',
        text: '先看一次收藏请求怎样往返，再追问信息怎样表示、步骤怎样安排、结果怎样确认。四个入口彼此连接，不必先学会写代码。',
        article: 'comp-systems',
        button: '从一次网页请求开始',
        steps: [
          { title: '看见接力', text: '浏览器、服务和存储怎样协作', icon: 'share-2' },
          { title: '拆开过程', text: '什么信息，经过哪些处理步骤', icon: 'code' },
          { title: '确认结果', text: '哪些证据支持“确实完成了”', icon: 'shield' }
        ]
      },
      connections: [
        { href: '#domain/ai', title: '人工智能', reason: 'AI 模型进入软件流程后，还需要材料、工具、界面和验证共同完成任务。' },
        { href: '#domain/information', title: '信息组织', reason: '软件能存储和查找信息；怎样描述、分类与关联，决定人和机器能否找到合适材料。' },
        { href: '#domain/education', title: '教育与传播', reason: '软件可以呈现内容和记录行为，学习是否发生还需要结合人的理解与迁移来判断。' }
      ]
    },
    articles
  };
})();
