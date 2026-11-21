/* The company, rules and responses are invented for this local example. */
(() => {
  'use strict';

  const documents = {
    current: {
      id: 'current',
      title: '办公区访客预约规定 B',
      version: '2026 年 11 月 1 日起生效，取代 A',
      scope: '工作日到公司办公区的外部访客',
      text: '工作日接待到公司办公区的外部访客，员工提交预约的截止时间为到访前一个工作日 17:00。节假日安排另行通知。',
      fragment: '17:00',
      current: true,
      applicable: true
    },
    old: {
      id: 'old',
      title: '办公区访客预约规定 A',
      version: '适用至 2026 年 10 月 31 日，已被 B 取代',
      scope: '工作日到公司办公区的外部访客',
      text: '工作日接待到公司办公区的外部访客，员工须在到访当天 09:00 前提交预约。',
      fragment: '09:00 前',
      current: false,
      applicable: true
    },
    other: {
      id: 'other',
      title: '展厅团体访客预约办法 C',
      version: '2026 年 10 月 15 日起生效，仍在使用',
      scope: '公司展厅的团体参观预约',
      text: '展厅团体参观须至少提前两个工作日提交预约。具体到访安排由展厅确认。',
      fragment: '两个工作日',
      current: true,
      applicable: false
    }
  };

  const steps = [
    {
      id: 'task',
      label: '明确任务',
      title: '员工想查的是哪一类规定？',
      lead: '“访客什么时候预约”可能指办公区接待，也可能指展厅团体参观。补上到访地点、对象与日期，才能判断哪条规定适用。',
      takeaway: '把问题整理成可核对的任务：给出截止时间，指出所用的现行条款，并说明适用条件。',
      links: [
        {href:'#map/context?node=task&depth=mechanism', title:'看提示词怎样说明任务', reason:'把目标、输入和可以验收的输出拆开。'},
        {href:'#map/agent?node=goals&depth=intro', title:'看 Agent 怎样界定任务', reason:'查规定、帮人提交预约、确认预约成功，各有不同的完成条件。'}
      ]
    },
    {
      id: 'versions',
      label: '辨认资料版本',
      title: '三份资料都写了访客预约，哪份能用？',
      lead: '先对照标题、版本和适用对象，再读期限。A 与 B 说的是同类访客，生效时间不同。B 与 C 都在使用，覆盖的对象不同。',
      takeaway: '查看某份资料只是为了对照。下一站还要观察检索实际选用了哪份，以及为什么。',
      links: [
        {href:'#domain/information?direction=provenance', title:'看信息组织怎样保留来源与版本', reason:'保留出处、有效期和取代关系，才能回查哪份规定现行。'},
        {href:'#map/rag?node=ingestion&depth=mechanism', title:'看 RAG 怎样准备资料', reason:'查找前就可以为材料加上版本和适用对象等线索。'}
      ]
    },
    {
      id: 'retrieval',
      label: '用 RAG 找资料',
      title: '候选中有现行规定，为什么还会选错？',
      lead: '本例先按与问题相关的词找到三份候选。切换筛选条件，观察哪份材料会被交给后续环节。候选顺序和选择结果均为本例预设。',
      takeaway: '问现行规定，要同时检查版本和适用对象。保留已被筛掉的候选和理由，也方便回查为什么没用它。',
      links: [
        {href:'#map/rag?node=retrieval&depth=intro', title:'看 RAG 怎样找到候选', reason:'区分查到的候选与最终选用的依据。'},
        {href:'#map/rag?node=ranking&depth=mechanism', title:'看怎样筛选和重排', reason:'看看日期、对象等条件如何参与选择。'}
      ]
    },
    {
      id: 'context',
      label: '组装上下文',
      title: '模型这一次实际读到了什么？',
      lead: '把问题和选中的材料放在一起，查看这次输入是否保留了原文、出处、时间关系与适用范围。切换输入方式，比较原文与孤立片段的区别。',
      takeaway: '本例要保留“前一个工作日”这样的关系，才能把规定中的 17:00 对应到周二。',
      links: [
        {href:'#map/context?node=selection&depth=mechanism', title:'看上下文工程怎样组织输入', reason:'理解输入里应保留哪些内容，以及压缩时哪些条件会丢失。'},
        {href:'#map/llm?node=context&depth=intro', title:'看语言模型怎样使用上下文', reason:'理解问题和材料怎样一起成为本轮生成的条件。'}
      ]
    },
    {
      id: 'verification',
      label: '核验回答',
      title: '把回答中的每项结论对回依据',
      lead: '沿同一条链检查任务、版本、适用对象、模型输入和最后的说法。切换回答方式，观察即使用到了正确材料，额外补上的结论是否有依据。',
      takeaway: '先找到问题发生在哪一站，再回去调整。完成核验时，写清适用条件、结论和可以回查的条款。',
      links: [
        {href:'#map/rag?node=evaluation&depth=mechanism', title:'看 RAG 怎样分层核验', reason:'把资料准备、检索、组装和回答的错误分开检查。'},
        {href:'#map/llm?node=generation&depth=boundary', title:'看生成内容怎样受证据约束', reason:'把答案的具体主张逐项对照原文。'}
      ]
    }
  ];

  const options = {
    task: {
      default: 'scoped',
      choices: [
        {id:'vague', label:'只问访客何时预约'},
        {id:'scoped', label:'写清地点、对象和到访时间'}
      ]
    },
    doc: {
      default: 'current',
      choices: [
        {id:'current', label:'查看现行规定 B'},
        {id:'old', label:'查看旧规定 A'},
        {id:'other', label:'查看展厅办法 C'}
      ]
    },
    retrieval: {
      default: 'keyword',
      choices: [
        {id:'keyword', label:'按相关词取首条'},
        {id:'current', label:'先筛掉旧版'},
        {id:'applicable', label:'同时核对版本与对象'}
      ]
    },
    context: {
      default: 'full',
      choices: [
        {id:'full', label:'保留原文、条件和出处'},
        {id:'fragment', label:'只带入时间片段'}
      ]
    },
    answer: {
      default: 'grounded',
      choices: [
        {id:'grounded', label:'按收到的材料作答'},
        {id:'overclaim', label:'额外断言无需审批'}
      ]
    }
  };

  const candidateOrders = {
    keyword: ['old', 'other', 'current'],
    current: ['other', 'current', 'old'],
    applicable: ['current', 'other', 'old']
  };

  const answers = {
    current: '按现行规定 B，外部访客周三 10:00 到办公区，且周二与周三都是工作日，员工最晚须在周二 17:00 提交预约。',
    old: '根据规定 A，周三到访应在当天 09:00 前提交预约。',
    other: '根据办法 C，须至少提前两个工作日提交预约。该材料未给出具体的截止时刻。'
  };

  function trace(input = {}) {
    const state = {};
    for (const [key, option] of Object.entries(options)) {
      const value = input?.[key];
      state[key] = option.choices.some(choice => choice.id === value) ? value : option.default;
    }

    const candidates = candidateOrders[state.retrieval].map(id => documents[id]);
    const picked = candidates[0];
    const scoped = state.task === 'scoped';
    const complete = state.context === 'full';
    const overclaim = state.answer === 'overclaim';
    const evidence = complete
      ? [picked.title, picked.version, picked.scope, picked.text].join('\n')
      : picked.fragment;
    let answerText;
    let citation = '';
    if (!scoped) {
      answerText = '请先说明访客要去办公区还是展厅、属于哪类接待，以及预计何时到访。';
    } else if (!complete) {
      answerText = '只看到孤立的时间片段，暂不能确认哪一天截止或这条规定适用于谁。请补查完整条款。';
    } else {
      answerText = answers[picked.id];
      citation = picked.title;
    }
    if (overclaim) answerText += ' 这次预约无需审批。';

    const checks = [
      {
        step: 'task', label: '任务条件', status: scoped ? 'pass' : 'unknown',
        detail: scoped ? '问题交代了办公区、外部访客、到访时间和工作日条件。' : '还需要补问地点、接待对象和到访时间。'
      },
      {
        step: 'versions', label: '版本时效', status: picked.current ? 'pass' : 'warn',
        detail: picked.current ? `${picked.title}在案例日期仍然生效，接着核对它覆盖谁。` : '检索取用了规定 A，规定 B 已经取代了它。'
      },
      {
        step: 'retrieval', label: '适用对象', status: picked.applicable ? 'pass' : 'warn',
        detail: picked.applicable ? '选中的资料覆盖本例的办公区外部访客，版本时效需单独检查。' : '办法 C 虽然现行，却只适用于展厅团体，无法为办公区来访提供期限。'
      },
      {
        step: 'context', label: '输入完整度', status: complete ? 'pass' : 'warn',
        detail: complete ? '本轮输入保留了所选原文、出处、版本和范围。' : '时间片段丢失了出处、适用对象和完整的截止关系。'
      },
      {
        step: 'verification', label: '回答的依据', status: overclaim ? 'warn' : scoped && complete ? 'pass' : 'unknown',
        detail: overclaim ? '三份材料都没有说明是否需要审批。“无需审批”超出了材料。'
          : !scoped || !complete ? '当前答复指出了待补的信息，截止时间仍需核实。'
          : '所选原文支持答复中的期限表述。答复能否作为现行规定使用，还要看版本和范围。'
      }
    ];

    let result;
    if (!scoped) {
      result = {status:'unknown', title:'先补清任务条件', detail:'回到任务站，交代到访地点、对象、日期和工作日条件，再核对适用条款。'};
    } else if (!picked.current) {
      result = {status:'warn', title:'先修正资料版本', detail:'本轮检索选中了已被取代的 A。回到资料版本和 RAG 站，找到覆盖同一接待对象的现行 B。'};
    } else if (!picked.applicable) {
      result = {status:'warn', title:'先核对适用对象', detail:'选中的 C 仍然生效，但只覆盖展厅团体。回到 RAG 站，同时筛选版本与接待对象。'};
    } else if (!complete) {
      result = {status:'unknown', title:'先补回完整条款', detail:'本轮只看到 17:00。回到上下文站，保留前一个工作日、适用对象和出处。'};
    } else if (overclaim) {
      result = {status:'warn', title:'删除无依据的审批结论', detail:'现行 B 支持周二 17:00 的截止时间。审批要求需要另外核查。'};
    } else {
      result = {status:'pass', title:'本例可核验的答复是周二 17:00', detail:'现行规定 B 覆盖这次办公区接待。到访前一个工作日是周二，原文给出了 17:00 的截止时间。'};
    }

    return {state, candidates, picked, evidence, answerText, citation, checks, result};
  }

  window.ASSISTANT_CASE = {
    title: '公司知识库助手',
    lead: '沿着一次查公司现行规定的任务，比较问题怎么写、资料怎么选、上下文怎么组，以及回答如何回到原文核验。',
    question: '外部访客周三上午 10:00 到办公区，员工最晚什么时候提交预约？',
    conditions: ['案例发生在规定 B 生效后。', '周二和周三都是工作日。', '三份规定、检索顺序和回答均为本地教学示例。'],
    steps,
    documents,
    options,
    trace
  };
})();
