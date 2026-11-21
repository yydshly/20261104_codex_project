/*
 * 见全 · 教育与传播：信息怎样成为理解，又怎样在人与人之间流动。
 * 原创科普讲解。情境与数字均为教学示意，不是学习效果测量或能力诊断。
 * 四个入口是一种阅读框架，不代表本领域的全部分支。
 */
(() => {
  'use strict';
  const section = (title, text) => ({ title, text });
  const step = (title, text) => ({ title, text });
  const source = (title, url) => ({ title, url });
  const refs = {
    transfer: source('National Academies · How People Learn：学习与迁移', 'https://www.nationalacademies.org/read/9853/chapter/6'),
    learning: source('National Academies · How People Learn II：学习过程', 'https://www.nationalacademies.org/read/24783/chapter/6'),
    feedback: source('National Academies · How People Learn II：教学、反馈与理解', 'https://www.nationalacademies.org/read/24783/chapter/9'),
    mil: source('UNESCO · 媒介与信息素养课程', 'https://www.unesco.org/mil4teachers/en/curriculum'),
    representation: source('UNESCO · 信息如何被选择与呈现', 'https://www.unesco.org/mil4teachers/en/module6'),
    medium: source('UNESCO · 媒介与技术如何影响内容', 'https://www.unesco.org/mil4teachers/en/module7'),
    inquiry: source('OpenStax · 科学研究、假设与证据', 'https://openstax.org/books/psychology-2e/pages/2-1-why-is-research-important'),
    findings: source('OpenStax · 怎样分析研究发现', 'https://openstax.org/books/psychology-2e/pages/2-3-analyzing-findings')
  };

  const articles = {
    'education-learning': {
      id: 'education-learning', domain: 'education',
      title: '看懂了，为什么不一定能用？',
      eyebrow: '学习与迁移 · 从熟悉走向解释',
      lead: '读完一篇 AI 讲解，觉得每句话都通顺，却未必能解释一个新的例子。阅读时有作者提供的线索，自己使用时则要找出有关概念、判断条件并作出选择。看懂是有价值的起点；能否换一种情境继续解释，需要更多具体证据。',
      sections: [
        section('跟得上讲解，和自己建立联系不同', '作者已经替你安排了顺序、补全了背景，并把关键概念放在眼前。沿着这条路读下来，比独立决定从哪里开始更容易。理解可以逐步加深：先认出概念，再用自己的话说出关系，最后判断它何时适用。某一步暂时说不清，指向的是可以补充的环节，不是对整个人能力的判定。'),
        section('换一个情境，才能看见原来的条件', '学过“检索可以补充资料”，遇到一份过期文档时，还要知道补充资料并不等于保证答案正确。新例子会改变表面细节，也可能改变适用条件。比较两个例子哪些关系相同、哪些条件不同，能帮助知识迁移。只背住原来的结论，容易忽略它依赖的前提；一次迁移成功也不代表处处适用。'),
        section('把模糊的不会，变成可继续寻找的问题', '可以先合上讲解，用一句话解释机制，再举一个不同的例子，并指出自己不确定的地方。若卡在“为什么旧资料仍会被找到”，下一步便是了解相关性、版本和适用范围。这些尝试用于发现缺口，并非必须完成的考试。阅读次数、停留时长和点击记录，也不足以替你认证已经理解。')
      ],
      example: { title: '示意：把 AI 的例子换成找书', text: '小林读懂了“搜索靠前不等于可靠”，随后在图书馆目录里看到一本排名靠前但版本较旧的书。他能说明排序解决寻找问题，版本关系到适用性，于是形成了一个可检查的解释。这只是一个迁移例子，不能据此判断他已掌握全部搜索原理。' },
      takeaway: '理解的证据可以是：说清关系、换个例子仍能解释，并知道结论的边界。发现说不清的地方，本身就是下一步的入口。',
      visual: { kind: 'flow', steps: [step('先看见', '原来还有这个问题'), step('说出缺口', '我不清楚哪一段关系'), step('自己解释', '用新例子连接概念'), step('保留边界', '说明适用条件与疑问')] },
      related: ['education-feedback', 'education-evidence'],
      crossLinks: [
        { href: '#article/ai-generation', title: '回到 AI：流畅的回答从哪里来？', reason: 'AI 可以生成连贯的讲解，但表达流畅不代表每项主张都有证据；继续看生成与核查的区别。' },
        { href: '#article/info-classification', title: '走向信息组织：让未知的问题有入口', reason: '尚未形成问题时，分类与相邻主题能帮助你发现没想到的知识。' }
      ],
      sources: [refs.transfer, refs.learning]
    },
    'education-feedback': {
      id: 'education-feedback', domain: 'education',
      title: '反馈怎样让理解发生修正？',
      eyebrow: '反馈 · 从结果找到原因',
      lead: '“你答对了”告诉我们一个结果，却很少说明理解在哪里成立。“这句话把相关性当成了因果”则给出可以继续检查的位置。反馈的作用，是把预期、实际表现与下一步调整接起来；它是否有用，还取决于依据、时机和你怎样使用。',
      sections: [
        section('先知道自己在判断什么', '若目标只是复述名词，能记住定义可能已经足够；若目标是解释一次 AI 回答为何不适用，就要看资料版本、问题条件和推理关系。目标不同，值得观察的表现也不同。反馈首先要对准这个目标，并指出具体差异。笼统的“很好”或“不懂”，很难告诉读者应该保留什么、补充什么。'),
        section('把差异连回可以调整的环节', '解释中漏掉适用范围，可以补读原文中的对象和时间；把搜索结果当成最终答案，则要区分寻找、选择与核查。这样的反馈把结果连回一个可修改的步骤，而不是给人贴标签。修改后再看一个相近例子，能观察调整是否有帮助。反馈太多或无法立即理解，也可能让下一步反而变得模糊。'),
        section('反馈本身，也需要接受检查', '老师、同伴和 AI 都可能误解你的意思，或依据不适用的材料作出评价。收到反馈后，可以追问它依据哪句话、哪条规则，以及是否考虑了当前情境。必要时比较原始来源或请人进一步解释。理解记录适合保留“原先怎么想、后来因何修改、还不确定什么”，而不是只留下一个完成标记。')
      ],
      example: { title: '示意：一次更具体的修正', text: '原解释是“给 AI 加上检索就不会答错”。反馈指出：检索只提供候选资料，旧版本和错误解释仍可能存在。修改后的说法是“检索能补充依据，但还要核查资料是否适用、答案是否受其支持”。这里展示的是解释的修订，不是某个模型的评测结果。' },
      takeaway: '有帮助的反馈说明差异发生在哪里，并给出能尝试的下一步。接受反馈之前，也要检查反馈自己的依据。',
      visual: { kind: 'flow', steps: [step('明确目标', '想解释哪一个问题'), step('看具体表现', '目前的说法与例子'), step('指出差异', '依据和条件缺在哪里'), step('修改再观察', '换个例子检查修正')] },
      related: ['education-learning', 'education-evidence'],
      crossLinks: [
        { href: '#article/comp-testing', title: '走向计算：软件为什么需要测试？', reason: '预期与实际结果的差异，也能帮助定位软件中的问题；人的理解并不等同于程序运行。' },
        { href: '#article/info-provenance', title: '走向信息组织：保留修正的依据', reason: '记录来源与版本，才能在结论变化时知道为什么需要修改。' }
      ],
      sources: [refs.feedback, refs.learning]
    },
    'education-media': {
      id: 'education-media', domain: 'education',
      title: '一条信息，怎样影响我们理解世界？',
      eyebrow: '媒介与表达 · 看见内容如何到达',
      lead: '同一项 AI 研究，可以变成一篇论文、一段演示视频或一句醒目的标题。每一种形式都会选择内容、安排顺序，并受到篇幅和传播渠道的限制。理解信息，不仅要读它说了什么，也要看它如何呈现、怎样来到眼前，以及省略了哪些条件。',
      sections: [
        section('呈现总要选择，选择会突出某些部分', '一段短视频可能突出最成功的演示，论文则可能花很多篇幅说明方法与限制。选择和压缩让传播成为可能，却也会改变读者最先注意到的东西。看到一个片段时，可以追问它代表什么范围、哪些情况没有出现。存在取舍不等于内容必然失真，关键在于重要条件是否被准确保留。'),
        section('渠道影响能看见什么，不直接决定真假', '编辑选择、搜索排序、社交转发和推荐系统，都可能改变内容到达谁、以什么顺序出现。每种渠道还有自己的目标与约束。一条信息被很多人看到，说明它获得了传播，并不自动说明证据更充分；没有广泛传播也不等于没有价值。判断可信度仍需要回到主张、依据和来源。'),
        section('读者也会用已有经验补全意思', '程序员看到“AI 能写代码”，可能想到接口和调试；刚接触技术的人，可能想象整个软件自动完成。相同句子会被放进不同背景中理解。可以把含糊表达拆成具体任务，再比较完整报道与原始材料。遇到不同观点时，先辨认分歧来自事实、解释还是关心的问题，讨论才能更明确。')
      ],
      example: { title: '示意：从演示片段回到完整任务', text: '一段视频展示 AI 很快生成网页。标题若写“软件开发已经完全自动化”，就扩大了演示支持的范围。继续了解需求修改、运行环境、测试和维护，才能比较“生成一个页面”与“完成一个软件”的差别。这个虚构例子不评价任何具体视频或产品。' },
      takeaway: '把内容、呈现方式、传播渠道与自己的解释分开看，更容易发现被省略的条件。传播广泛和证据充分，是不同的问题。',
      visual: { kind: 'flow', steps: [step('原始事件或材料', '发生了什么、记录了什么'), step('选择与表达', '标题、片段、图表与叙事'), step('渠道与分发', '编辑、搜索、推荐与转发'), step('读者的解释', '结合背景，再回查条件')] },
      related: ['education-evidence', 'education-learning'],
      crossLinks: [
        { href: '#article/info-description', title: '走向信息组织：给资料补上身份说明', reason: '作者、时间、版本与适用对象，帮助把脱离背景的片段放回具体情境。' },
        { href: '#article/ai-generation', title: '回到 AI：生成表达与事实依据', reason: 'AI 生成的内容可以结构完整、措辞自然；判断其中的事实，还要逐项回查证据。' }
      ],
      sources: [refs.representation, refs.medium, refs.mil]
    },
    'education-evidence': {
      id: 'education-evidence', domain: 'education',
      title: '怎样区分观察、解释与判断？',
      eyebrow: '证据与推理 · 看清结论从哪里来',
      lead: '“这次回答用了十秒”“它一定更会推理”“我们应该全面采用它”，看似在谈同一件事，其实分别涉及观察、解释和选择。把这三层拆开，可以发现哪些内容有记录支持、哪些仍是推断，以及作出决定还需要考虑什么。',
      sections: [
        section('观察要带上它发生的条件', '“这次回答用了十秒”可以是一条记录，但还应说明任务、设备、网络和计时方式。换一组条件，结果可能不同。清楚的观察让别人有机会核查，也帮助区分单次经历与稳定现象。把有限样本写成“总是如此”，就超出了记录本身能支持的范围；记录准确也不意味着解释已经确定。'),
        section('解释需要连接证据，也要考虑其他可能', '回答更慢，可能与任务难度有关，也可能来自排队、工具调用或网络等待。仅凭时间，难以判断内部发生了哪一种过程。一个解释应说明它如何符合证据，并考虑能够区分不同解释的新观察。多个现象一起出现，可以提示关系，却不足以单独确定因果；缺少信息时可以暂留多个可能。'),
        section('判断还包含目标与取舍', '即使确认某个工具在特定任务上更快，是否采用还取决于质量、成本、可访问性和使用者需要。证据能约束“它做到了什么”，但“我们更看重什么”还需要明确讨论。区分事实依据与价值取舍，并不是说各种判断都同样可靠，而是让每一步理由都可见，也让改变结论时知道该修改哪一层。')
      ],
      example: { title: '示意：一次小演示能说明多少？', text: '在虚构演示中，工具甲完成一个页面花了十秒，工具乙花了十五秒。这支持该次记录中的时间差，不能单独证明甲推理更强，更不能推出所有团队都应改用甲。需要先核对输出质量和运行条件，再根据实际任务讨论采用与否。' },
      takeaway: '先问看到了什么，再问怎样解释，最后说明依据什么目标作选择。每一层都写清条件，才能知道结论的支持范围。',
      visual: { kind: 'compare', steps: [step('观察', '有条件的记录：发生了什么'), step('解释', '连接证据：为什么会这样'), step('判断', '结合目标：应该怎样选择'), step('继续核查', '还缺哪些信息、可能改变哪一层')] },
      related: ['education-media', 'education-feedback'],
      crossLinks: [
        { href: '#article/info-provenance', title: '走向信息组织：沿来源回查证据', reason: '作者、版本、原始记录与修订关系，能帮助判断证据是否支持当前说法。' },
        { href: '#article/comp-testing', title: '走向计算：用具体条件检查结果', reason: '软件测试把预期和观察放在明确条件中比较；测试通过仍有适用范围。' }
      ],
      sources: [refs.inquiry, refs.findings]
    }
  };

  const domain = {
    id: 'education', title: '教育与传播', icon: 'book-open',
    lead: '信息到达眼前，并不等于已经成为理解。这个领域关心人怎样连接新旧知识、发现理解的缺口，也关心内容怎样经过表达和传播影响彼此。从一次 AI 讲解开始，可以走向学习、反馈、媒体和证据，再回到资料如何被组织。',
    nodes: [
      { id: 'learning', title: '学习与迁移', question: '看懂了，换个例子还能解释吗？', icon: 'book-open', article: 'education-learning' },
      { id: 'feedback', title: '反馈与修正', question: '发现不一致以后，怎样继续理解？', icon: 'refresh-cw', article: 'education-feedback' },
      { id: 'media', title: '媒介与表达', question: '眼前的信息，是怎样被呈现的？', icon: 'message-circle', article: 'education-media' },
      { id: 'evidence', title: '证据与判断', question: '看到了什么，又据此推出了什么？', icon: 'search', article: 'education-evidence' }
    ],
    how: [
      section('连接：把新信息放进已有经验', '从熟悉的工作和生活例子开始，辨认新概念与旧经验的关系，再留意这种类比在哪些地方不成立。'),
      section('修正：让理解的缺口可以被看见', '用自己的话解释一个具体例子，比较材料与反馈，保留修改理由和仍不确定的部分。'),
      section('传播：把理解交给另一个人', '表达需要选择和组织；读者还会结合自己的背景理解，因此来源、情境和适用范围都很重要。')
    ],
    history: [
      section('面对面的传授', '口述、示范和共同实践，让人观察行动并及时追问。这些方式今天仍在使用，依赖共享的情境与互动。'),
      section('书写与印刷的传播', '文字和出版让知识跨越现场，被更多人反复阅读、比较和修订。资料可以留存，也需要目录、版本和来源说明。'),
      section('联网与生成式表达', '数字渠道让发布、检索和互动更方便，AI 又参与摘要与解释。信息更易到达，核对来源和理解表达条件仍不可少。')
    ],
    sources: [refs.transfer, refs.feedback, refs.mil, refs.medium],
    guide: {
      kicker: '从一次熟悉的阅读出发',
      title: 'AI 讲得很清楚，我就理解了吗？',
      text: '先看“跟得上讲解”和“自己解释”的差别，再沿反馈与证据往下走；也可以从媒体入口，看看一条信息怎样来到你面前。',
      article: 'education-learning', button: '从看懂与会用开始',
      steps: [
        { title: '发现新问题', text: '看见此前没有想到的关系', icon: 'search' },
        { title: '形成自己的解释', text: '换个例子，说明条件和边界', icon: 'message-circle' },
        { title: '沿证据继续修正', text: '记录依据，也保留尚未确定的部分', icon: 'book-open' }
      ]
    },
    connections: [
      { href: '#domain/ai', title: '人工智能', reason: 'AI 可以参与解释与表达；理解它怎样生成内容，才能辨认表达与证据的差别。' },
      { href: '#domain/information', title: '信息组织', reason: '发现新问题以后，需要能寻找、比较并追溯资料的入口。' },
      { href: '#domain/computing', title: '软件与计算', reason: '从具体条件、过程和结果理解计算，也能帮助我们检查关于技术的说法。' }
    ]
  };

  window.JOURNEY_EDUCATION = { domain, articles };
})();
