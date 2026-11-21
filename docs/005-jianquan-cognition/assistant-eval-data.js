/* Deterministic teaching cases based on the fictional visitor rules. */
(() => {
  'use strict';

  const {documents, trace} = window.ASSISTANT_CASE;

  const fields = {
    visit: {
      label: '访客去哪里', default: 'office', choices: [
        {id:'office', label:'办公区外部来访'},
        {id:'hall', label:'展厅团体参观'},
        {id:'missing', label:'地点和接待类型未说明'}
      ]
    },
    day: {
      label: '哪天到访', default: 'wednesday', choices: [
        {id:'wednesday', label:'周三上午 10:00'},
        {id:'thursday', label:'周四上午 10:00'}
      ]
    },
    calendar: {
      label: '日历条件', default: 'regular', choices: [
        {id:'regular', label:'到访日和前一天均为工作日'},
        {id:'holiday', label:'到访日是节假日，未找到专项安排'}
      ]
    },
    source: {
      label: '资料条件', default: 'consistent', choices: [
        {id:'consistent', label:'现行条款可以区分'},
        {id:'conflict', label:'两份现行资料对同类来访给出不同期限'}
      ]
    }
  };

  const expectedOptions = [
    {id:'tue', label:'按规定 B 答周二 17:00'},
    {id:'wed', label:'按规定 B 答周三 17:00'},
    {id:'hall', label:'按办法 C 说明至少提前两个工作日'},
    {id:'clarify', label:'先问地点和接待类型'},
    {id:'review', label:'暂缓给出期限，请规则负责人复核'}
  ];

  const patches = [
    {id:'version', label:'只排除旧版', detail:'保留原有候选顺序中的现行文件。办公区问题仍可能选到展厅办法 C。'},
    {id:'scope', label:'核对版本与对象', detail:'在检索时同时核对生效状态与接待对象。'},
    {id:'context', label:'保留完整条款', detail:'把来源、版本、范围和截止条件随原文送入本轮。'},
    {id:'answer', label:'删去无依据的结论', detail:'仅表达条款支持的内容。审批信息留待另查。'},
    {id:'review', label:'识别需要人工复核的情况', detail:'遇到节假日安排缺失或现行文件冲突，暂缓给出具体期限。'},
    {id:'complete', label:'合并修订', detail:'同时核对版本与对象、保留条款、约束回答，并启用人工复核条件。'}
  ];

  const sources = [
    {title:'Anthropic · Demystifying evals for AI agents', url:'https://www.anthropic.com/research/demystifying-evals-for-ai-agents'},
    {title:'NIST · AI RMF Playbook Measure', url:'https://airc.nist.gov/airmf-resources/playbook/measure/'}
  ];

  const weekday = {wednesday:'周三', thursday:'周四'};
  const priorWeekday = {wednesday:'周二', thursday:'周三'};
  const visitLabels = {office:'办公区接待', hall:'展厅团体', missing:'接待对象未说明'};

  function choose(choices, value, fallback) {
    return choices.some(choice => choice.id === value) ? value : fallback;
  }

  function buildCase(raw = {}) {
    const state = {};
    for (const [key, field] of Object.entries(fields)) {
      state[key] = choose(field.choices, raw?.[key], field.default);
    }
    const {visit, day, calendar, source} = state;
    const chosen = choose(expectedOptions, raw?.expected, 'tue');
    state.expected = chosen;
    const regularExpected = visit === 'hall' ? 'hall' : day === 'wednesday' ? 'tue' : 'wed';
    const needsReview = calendar === 'holiday' || source === 'conflict';
    const expected = visit === 'missing' ? 'clarify' : needsReview ? 'review' : regularExpected;
    const arriving = weekday[day] + '上午 10:00';
    const questions = {
      office: `外部访客${arriving}到办公区，员工最晚什么时候提交预约？`,
      hall: `展厅团体${arriving}到访，至少要提前多久提交预约？`,
      missing: `访客${arriving}到公司，什么时候提交预约？`
    };
    const conditions = [
      calendar === 'regular' ? '到访日和前一天都是工作日。' : '到访日是节假日，专项安排缺失。',
      source === 'consistent' ? 'A 已被 B 取代，B 与 C 适用于不同的接待对象。' :
        '有一份补充通知与对应规则都标为现行。补充通知写「到访当天 12:00 截止」，材料中找不到取代关系。'
    ];
    return {
      id:'custom', title:`${weekday[day]} · ${visitLabels[visit]}`, question:questions[visit],
      state, expected, expectedText:expectedOptions.find(option => option.id === expected).label,
      chosen, conditions
    };
  }

  const presetSpecs = [
    {id:'office-wed', title:'普通办公区 · 周三到访', setup:{}},
    {id:'office-thu', title:'日期变化 · 周四到访', setup:{day:'thursday'}},
    {id:'showroom', title:'范围变化 · 展厅团体', setup:{visit:'hall'}},
    {id:'missing-scope', title:'条件缺失 · 没说明地点', setup:{visit:'missing'}},
    {id:'holiday', title:'例外 · 节假日来访', setup:{calendar:'holiday'}},
    {id:'conflict', title:'证据冲突 · 两份文件都现行', setup:{source:'conflict'}}
  ];
  const presets = presetSpecs.map(({id, title, setup}) => {
    const {expected} = buildCase(setup);
    return {...buildCase({...setup, expected}), id, title};
  });

  function baseline(raw = {}) {
    const {retrieval, context, answer} = trace(raw).state;
    return {retrieval, context, answer, review:false};
  }

  function normalizeConfig(config) {
    return {...baseline(config), review:config?.review === true};
  }

  function applyPatch(config, patch) {
    const next = normalizeConfig(config);
    switch (patch) {
      case 'version':
        if (next.retrieval === 'keyword') next.retrieval = 'current';
        break;
      case 'scope': next.retrieval = 'applicable'; break;
      case 'context': next.context = 'full'; break;
      case 'answer': next.answer = 'grounded'; break;
      case 'review': next.review = true; break;
      case 'complete':
        return {retrieval:'applicable', context:'full', answer:'grounded', review:true};
    }
    return next;
  }

  function review(testCase) {
    const {visit, calendar, source} = testCase.state;
    const question = {label:'员工问题', text:testCase.question};
    if (visit === 'missing') {
      return {
        action:'clarify', title:'先向员工澄清', reason:'地点和接待类型可以由员工直接补充。再根据补全的信息选择条款。',
        items:[question, {label:'要追问的条件',text:'访客到办公区还是展厅？是外部办公接待还是团体参观？'}]
      };
    }
    const doc = visit === 'hall' ? documents.other : documents.current;
    if (source === 'conflict' || calendar === 'holiday') {
      const questions = [];
      if (source === 'conflict') questions.push('哪一份文件在本次来访时适用？请提供生效时间或正式取代关系。');
      if (calendar === 'holiday') questions.push('请提供到访当天的专项安排，并确认能否接待及预约截止时间。');
      return {
        action:'human', title:'交由规则负责人复核',
        reason:source === 'conflict' ? '现行材料给出不同的期限，须确认优先关系。' : '节假日的专项安排缺失，须确认本次接待规则。',
        items:[question, {label:'已有依据',text:`${doc.title} · ${doc.version}\n${doc.text}`},
          ...(source === 'conflict' ? [{label:'冲突资料',text:'标为现行的补充通知写「到访当天 12:00 截止」，没有取代关系说明。'}] : []),
          {label:'交给谁',text:visit === 'hall' ? '展厅预约负责人' : '办公区访客接待规则负责人'},
          {label:'需要确认',text:questions.join(' ')}]
      };
    }
    return {
      action:'release', title:'核对条款后可给出回答',
      reason:'接待对象已明确，当前资料能支持本题所需的预约期限。',
      items:[question, {label:'引用条款',text:`${doc.title}。${doc.text}`},
        {label:'回答边界',text:visit === 'hall' ? '说明至少提前两个工作日。具体到访安排由展厅确认。' : '说明到访前一个工作日 17:00 的期限，附上适用对象和出处。'}]
    };
  }

  const diagnosis = (step, label, detail) => ({step, label, detail});
  const check = (label, status, detail) => ({label, status, detail});
  const result = (status, answer, source, issue, checks) => ({status, answer, source, diagnosis:issue, checks});

  function run(testCase, config) {
    const {state, chosen, expected, expectedText} = testCase;
    const selectedConfig = normalizeConfig(config);
    if (chosen !== expected) {
      const detail = `本题的参考预期是「${expectedText}」。请回到用例修改预期，再比较系统表现。`;
      return result('unknown', '等待核对用例预期', '', diagnosis('expectation','先核对测试预期',detail),
        [check('用例预期','unknown',detail)]);
    }

    const decision = review(testCase);
    if (decision.action === 'clarify') {
      return result('pass', '请先确认访客到办公区还是展厅，以及接待类型。', '',
        diagnosis('task','澄清缺失的任务条件',decision.reason),
        [check('应对缺失信息','pass','先提出能帮助定位适用条款的问题。')]);
    }
    if (decision.action === 'human' && selectedConfig.review) {
      const reviewSources = decision.items.filter(item => ['已有依据','冲突资料'].includes(item.label));
      return result('pass', '暂缓给出预约期限，交由规则负责人复核。', reviewSources.map(item => item.text).join('\n\n'),
        diagnosis('review','暂缓并转人工复核',decision.reason),
        [check('例外处理','pass','按用例预期留下待确认问题和已有资料。')]);
    }

    const doc = state.visit === 'hall' ? documents.other : trace(selectedConfig).picked;
    const scopeMatches = state.visit === 'hall' || doc.id !== 'other';
    const complete = selectedConfig.context === 'full';
    const overclaim = selectedConfig.answer === 'overclaim';
    const retainedSource = complete ? [doc.title, doc.version, doc.text].join('\n') : `仅保留片段「${doc.fragment}」`;
    let answer;
    if (!complete) answer = '本轮材料只有时间片段，无法确认适用范围和完整的截止条件。';
    else if (doc.id === 'old') answer = `按规定 A，${weekday[state.day]}到访应在当天 09:00 前提交预约。`;
    else if (doc.id === 'other') answer = '按办法 C，须至少提前两个工作日提交预约。';
    else answer = `按规定 B，本次办公区来访的截止时间是${priorWeekday[state.day]} 17:00。`;
    if (overclaim) answer += ' 这次预约无需审批。';

    const checks = [
      check('资料版本', doc.current ? 'pass' : 'warn', doc.current ? doc.version : '规定 A 已被 B 取代。'),
      check('适用对象', scopeMatches ? 'pass' : 'warn', scopeMatches ? `选中的条款覆盖${visitLabels[state.visit]}。` : '展厅团体条款不适用于办公区外部来访。'),
      check('输入完整度', complete ? 'pass' : 'warn', complete ? '本轮带入完整条款、出处和范围。' : '本轮输入只有时间片段，无法核对完整条款。'),
      check('回答依据', overclaim ? 'warn' : complete ? 'pass' : 'unknown', overclaim ? '现有材料没有说明是否需要审批。' : complete ? '这段回答的期限可以与选中原文对照。' : '需要补齐材料后才能验证期限。')
    ];

    let issue;
    if (decision.action === 'human') {
      issue = diagnosis('review','例外没有转入复核',decision.reason);
      checks.unshift(check('例外处理','warn','预期暂缓并交给规则负责人，本次仍按普通流程处理。'));
    } else if (!doc.current) {
      issue = diagnosis('versions','先纠正资料版本','本轮取用了失效的 A。先排除失效文件，再核对接待对象。');
    } else if (!scopeMatches) {
      issue = diagnosis('retrieval','先纠正资料适用对象','C 仍然现行，但只适用于展厅团体。筛选时还要核对接待对象。');
    } else if (!complete) {
      issue = diagnosis('context','补回原文和适用条件','检索取到了相应条款，但输入只留下时间片段。');
    } else if (overclaim) {
      issue = diagnosis('verification','删除无依据的审批说法','回答中的期限有出处，审批结论超出所用条款。');
    }

    if (issue) return result('warn', answer, retainedSource, issue, checks);
    return result('pass', answer, retainedSource,
      diagnosis('verification','回答与参考预期一致','结论、适用对象和出处都能对回相应条款。'), checks);
  }

  function compare(cases, config, patch) {
    const afterConfig = applyPatch(config, patch);
    return cases.map(testCase => ({testCase, before:run(testCase, config), after:run(testCase, afterConfig)}));
  }

  window.ASSISTANT_EVAL_DATA = {fields, expectedOptions, patches, presets, sources, buildCase, baseline, applyPatch, run, compare, review};
})();
