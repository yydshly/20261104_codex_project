/*
 * 见全 · 连续跨域漫游：AI 为什么会答错。
 * 星桥图书馆、馆方通知、时间、摘要及助手输出全部为原创教学虚构。
 * 此路线说明机制与核查过程，不查询真实馆规、不调用模型、不测量用户能力。
 */
(() => {
  'use strict';
  const section = (title, text) => ({ title, text });
  const point = (title, text) => ({ title, text });
  const source = (title, url) => ({ title, url });
  const refs = {
    language: source('Google · 语言模型与上下文', 'https://developers.google.com/machine-learning/crash-course/llm'),
    generation: source('Google · 大语言模型的生成机制与局限', 'https://developers.google.com/machine-learning/crash-course/llm/transformers'),
    rag: source('Lewis 等 · 检索增强生成原始论文', 'https://arxiv.org/abs/2005.11401'),
    metadata: source('Dublin Core · 描述资料的元数据术语', 'https://www.dublincore.org/specifications/dublin-core/dcmi-terms/'),
    provenance: source('W3C · 信息来源与修订的 PROV 模型', 'https://www.w3.org/TR/prov-primer/'),
    inquiry: source('OpenStax · 科学研究、假设与证据', 'https://openstax.org/books/psychology-2e/pages/2-1-why-is-research-important'),
    findings: source('OpenStax · 怎样分析研究发现', 'https://openstax.org/books/psychology-2e/pages/2-3-analyzing-findings')
  };

  // supports.applies means "the material applies to the question's conditions";
  // it does not mean it supports the assistant's original 18:00 answer.
  const materials = [
    {
      id: 'old', label: '旧版完整通知', issuer: '星桥图书馆（虚构馆方）', date: '2025-01-01',
      scope: '2025 年常规安排；已被新版通知替代',
      excerpt: '2025 年开放安排：每日 18:00 闭馆。节假日安排另行通知。',
      conclusion: '它提供了“18:00”的一个可能出处，却不能支持示例中 2026 年 11 月周日的安排。',
      limit: '发布者相同，也要区分旧版和现行版。能追到出处，不等于出处现在仍适用。',
      supports: { time: '18:00', applies: false, reason: '这是旧版时间，已不适用于问题所问的时段。' }
    },
    {
      id: 'current', label: '现行完整通知', issuer: '星桥图书馆（虚构馆方）', date: '2026-11-01',
      scope: '2026 年 11 月起的常规安排；本例问普通周日，无临时调整',
      excerpt: '自 2026 年 11 月 1 日起，周一至周五 18:00 闭馆，周日 16:00 闭馆。本通知替代旧版开放安排，节假日及临时调整另行通知。',
      conclusion: '在这个虚构案例的既定条件下，原文支持“周日 16:00 闭馆”，不支持把平日的 18:00 用到周日。',
      limit: '这条结论受日期、星期和常规安排的条件限制；不能据此推断其他分馆、节假日或临时调整。',
      supports: { time: '16:00', applies: true, reason: '发布者、版本和星期都与本例的问题对应。' }
    },
    {
      id: 'snippet', label: '转述中的摘录', issuer: '某篇介绍文章的转述（虚构）', date: '摘录未保留发布日期',
      scope: '只提到周一至周五；未给出周日安排',
      excerpt: '星桥图书馆周一至周五开放至 18:00，更多开放信息请看馆方通知。',
      conclusion: '这段话只涉及平日。即使转述准确，也没有提供回答周日闭馆时间所需的条件。',
      limit: '摘要和摘录会省略内容。补全缺少的星期安排，需要查看原始通知，不能凭相邻信息猜出。',
      supports: { time: null, applies: false, reason: '资料没有回答周日问题；18:00 只对应平日。' }
    }
  ];

  const steps = [
    {
      id: 'generation', label: '生成机制', title: '一句顺畅的回答，是怎样出现的？', domain: 'ai',
      lead: '先别急着相信或否定“18:00”。这一步看它怎样成为一句回答：模型根据收到的输入和训练形成的模式组织文字；这个过程能给出有用解释，也可能带入缺少依据的细节。语气自然，不表示时间已经核实。',
      sections: [
        section('生成文字，并不等于逐条读取核验过的事实', '许多语言模型将文字处理成较小的片段，利用上下文逐步生成后续内容。训练形成的模式可以支持解释、归纳和组合表达，但一个具体时间看起来合适，并不说明系统刚刚查过馆方通知。即使模型接入了搜索，找材料、读懂材料和组织答案也仍是需要分别观察的环节。'),
        section('只看这句话，还看不出错误发生在哪一环', '同一句“周日 18:00 闭馆”，可能来自旧通知，也可能是遗漏了“周一至周五”的限制，或在材料不足时补出了时间。仅凭输出，不能确定实际发生了哪一种过程。要区分这些可能，需要继续看系统收到什么资料、原文怎样写，以及答案是否被原文支持。')
      ],
      visual: { kind: 'flow', steps: [point('提出问题', '问的是这个时期的普通周日'), point('收到输入', '问题、上下文与可能检索到的资料'), point('模型生成', '组织成一句自然的回答'), point('留下待核查主张', '“周日 18:00”有依据吗？')] },
      takeaway: '流畅是表达的特征；是否正确，要把答案里的具体主张接到适用的依据上。',
      bridge: { title: '为什么下一站要去“信息组织”？', text: '模型能使用什么，受资料怎样被找到、标注和传递的影响。我们沿着“18:00”往回走，看同一个数字可能来自什么版本和范围。' },
      deepDive: { href: '#article/ai-generation', title: '展开阅读：生成文字与支持事实' },
      sources: [refs.language, refs.generation, refs.rag]
    },
    {
      id: 'sources', label: '信息来源', title: '找到了出处，为什么仍可能用错？', domain: 'information',
      lead: '接着看送到模型面前的材料。这里有一份旧通知、一份现行通知和一段转述摘录。它们都提到“18:00”，但讨论的时间或星期不同。点开比较，看看“相关”“有出处”和“适用于当前问题”为什么需要分开。',
      sections: [
        section('一份材料，需要带着自己的来历', '发布者、发布日期、适用范围和修订关系，帮助我们辨认资料。旧通知与新通知都可以出自同一个机构，正文里的数字却对应不同安排。保留这些描述，不只是为了管理文件，也是为了让人和检索系统知道何时该使用哪一份材料，以及何时需要找更新版本。'),
        section('把问题条件与原文条件逐项对上', '这个问题问的是示例中的普通周日，因此“周一至周五 18:00”不能直接回答它。转述的句子可能没有错，但它省去了我们需要的部分。现行完整通知明确写出周日 16:00，才为这个条件下的答案提供了依据。找到资料之后，仍要确认回答有没有漏掉这些限制。')
      ],
      visual: { kind: 'compare', steps: [point('谁发布', '馆方原文，还是他人转述'), point('何时生效', '旧版、现行版和修订关系'), point('适用什么', '普通周日，还是平日与其他安排'), point('原文说了什么', '是否直接支持答案中的时间')] },
      takeaway: '来源是回查入口。出处、版本、适用范围和原文内容，需要一起看。',
      bridge: { title: '为什么下一站要去“证据判断”？', text: '我们已经拿到材料，还需要看它究竟支持了什么。看到两个时间不同，能否立刻断定模型在“编造”？下一站把观察、解释和判断拆开。' },
      deepDive: { href: '#article/info-provenance', title: '展开阅读：来源、版本与修订' },
      sources: [refs.metadata, refs.provenance]
    },
    {
      id: 'evidence', label: '证据判断', title: '看到了什么，又能据此说到哪一步？', domain: 'education',
      lead: '现在把三句话放在一起：助手答了 18:00；现行通知写周日 16:00；助手一定在故意编造。前两句可以对照本例的记录，第三句已经加入了原因和意图的解释。分清层次，才能避免从一个错误跳到没有依据的大结论。',
      sections: [
        section('观察说明差异，解释还需要更多材料', '本例能直接比较的，是问题条件、助手回答和通知原文。它们足以指出“18:00”与现行周日安排不一致，却没有展示模型实际收到哪些输入。旧资料、条件遗漏等都是待核查的可能。若要追查真正原因，还需查看资料选择、输入与处理记录；不能从单次错误推断意图。'),
        section('判断要说清依据，也要说清范围', '在本例已经给定的日期与普通周日条件下，可以采用现行通知支持的 16:00，并指出原回答不受该通知支持。这个判断不等于“AI 总会答错”，也不等于“凡是馆方通知都无需再看条件”。若换成节假日或另一分馆，就需要补充对应材料，而不是沿用这次的数字。')
      ],
      visual: { kind: 'compare', steps: [point('观察', '记录中具体出现了什么'), point('解释', '哪些过程可能造成差异'), point('判断', '在给定条件下采用什么说法'), point('保留未知', '真正错误原因还缺哪些记录')] },
      takeaway: '证据既帮助我们作出判断，也告诉我们哪些解释还不能确定。',
      bridge: { title: '带着三种视角，回到最初的问题', text: '现在我们能把生成、资料和判断放在一起：给出有条件的回答，同时分清“已发现不一致”和“已确定错误原因”。' },
      deepDive: { href: '#article/education-evidence', title: '展开阅读：观察、解释与判断' },
      sources: [refs.inquiry, refs.findings]
    },
    {
      id: 'return', label: '回到问题', title: '现在，怎样理解这次 AI 回答？', domain: 'ai',
      lead: '回到“星桥图书馆周日几点闭馆”。我们已经跨过三个领域，可以把一开始笼统的“AI 答错了”展开成更清楚的问题：它生成了什么主张，用了什么材料，哪些证据支持结论，又有哪些原因尚未查明。',
      sections: [
        section('回答原问题，同时交代依据', '在这个虚构案例的设定中，问的是 2026 年 11 月的普通周日，没有临时调整。现行通知对应的闭馆时间是 16:00，原回答 18:00 不受这份通知支持。把日期、星期和来源一同说出，可以让别人知道为什么这样回答，也知道条件变化时该回到哪里重新核查。'),
        section('理解错误，不需要假装已经知道全部原因', '我们看见了不一致，也学会了沿三个方向追问：生成是否补入无依据细节，材料是否过期或不适用，推断是否超出原文。但本例没有运行真实模型，不能据此诊断某个模型的内部过程。能说清已经确认什么、仍缺什么，就是这次漫游带来的理解。')
      ],
      visual: { kind: 'flow', steps: [point('生成机制', '一句自然表达仍含待核查的主张'), point('信息来源', '版本、范围与原文决定材料是否适用'), point('证据判断', '区分记录、原因解释与有条件的结论'), point('回到回答', '给出依据，说明边界，保留未查明的原因')] },
      takeaway: '面对 AI 回答，可以沿“主张 → 资料 → 支持关系”检查。发现未知后，把它变成一个更具体、可以继续寻找的问题。',
      bridge: { title: '把这条路线带到下一个问题', text: '下一次遇到一个日期、一条政策或一段技术解释，先找出你真正需要确认的主张，再追问来源与适用条件。需要时，可以返回任一站重新比较。' },
      deepDive: { href: '#article/retrieval', title: '继续探索：资料怎样进入 AI 回答' },
      sources: [refs.language, refs.rag, refs.provenance, refs.inquiry]
    }
  ];

  window.ROAM_DATA = {
    id: 'ai-errors', title: 'AI 为什么会答错？',
    lead: '带着一个问题，走过生成机制、信息来源与证据判断，再带着更清楚的解释回到起点。',
    case: {
      question: '星桥图书馆周日几点闭馆？', answer: '周日 18:00 闭馆。',
      label: '贯穿四站的虚构案例',
      when: '示例中的 2026 年 11 月普通周日，无节假日或临时调整。',
      note: '星桥图书馆、通知、时间与助手回答均为教学虚构，不对应真实馆规，也不是真实模型输出。'
    },
    steps, materials,
    evidence: [
      { id: 'observation', label: '观察', claim: '助手答 18:00；现行通知写普通周日 16:00。', explanation: '这是本例可对照的记录。它显示了回答与当前适用材料之间的差异。' },
      { id: 'explanation', label: '解释', claim: '助手可能使用了旧资料，或遗漏了星期条件。', explanation: '这是两个待核查的可能；没有实际输入与处理记录，不能确定哪一个发生了。' },
      { id: 'judgment', label: '判断', claim: '在本例条件下，采用现行通知支持的 16:00，并说明依据。', explanation: '结论限定在给定日期和普通周日；换一个条件，需要重新查看对应材料。' }
    ],
    answer: {
      title: '一个有依据、也有边界的回答',
      text: '按这个虚构案例中 2026 年 11 月 1 日生效的馆方通知，普通周日 16:00 闭馆。18:00 对应旧安排或现行平日安排，不能直接用于这里的周日问题。',
      boundary: '本例已约定无节假日或临时调整。我们可以确认原回答与现行通知不一致；实际错误来自哪一环，仍需查看模型收到的材料和处理记录。'
    },
    reflection: {
      label: '留下一句自己的理解（可选）',
      prompts: ['我现在会先核查哪一项主张？', '什么证据支持我的解释？', '还有哪个环节，我仍然不清楚？']
    }
  };
})();
