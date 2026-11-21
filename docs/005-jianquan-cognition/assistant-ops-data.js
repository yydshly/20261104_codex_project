/* Deterministic performance samples and incident traces for the fictional visitor policy. */
(() => {
  'use strict';

  const fields = {
    profile: {
      label: '对比配置', default: 'lean', choices: [
        {id:'standard', label:'标准配置'},
        {id:'lean', label:'精简输入'},
        {id:'wide', label:'扩大候选与输入'}
      ]
    },
    traffic: {
      label: '流量条件', default: 'normal', choices: [
        {id:'normal', label:'平时流量'}, {id:'busy', label:'高峰流量'}
      ]
    },
    volume: {
      label: '估算请求量', default: '1000', choices: [
        {id:'100', label:'100 次请求'}, {id:'1000', label:'1,000 次请求'}, {id:'10000', label:'10,000 次请求'}
      ]
    },
    release: {
      label: '资料发布时间', default: 'b', choices: [
        {id:'b', label:'更新前 · 规定 B'}, {id:'d', label:'发布规定 D'}
      ]
    },
    fault: {
      label: '模拟故障', default: 'none', choices: [
        {id:'none', label:'全链路已更新'}, {id:'index', label:'索引未同步'},
        {id:'cache', label:'答案缓存残留'}, {id:'retrieval', label:'检索选到历史版本'},
        {id:'context', label:'上下文沿用旧条款'}, {id:'generation', label:'回答偏离新条款'}
      ]
    },
    fix: {
      label: '处理动作', default: 'none', choices: [
        {id:'none', label:'先观察记录'}, {id:'reindex', label:'同步新索引'},
        {id:'invalidate', label:'使旧答案缓存失效'}, {id:'filter', label:'过滤历史版本'},
        {id:'rebuild', label:'用本次检索结果重组输入'}, {id:'verify', label:'答前核对并拦截不一致的结论'}
      ]
    }
  };

  function choose(key, value) {
    const field = fields[key];
    return field.choices.some(choice => choice.id === value) ? value : field.default;
  }

  const profiles = {
    standard:{retrieval:150, assembly:55, generation:520, inputTokens:1600, outputTokens:160, retrievalCost:0.06},
    lean:{retrieval:105, assembly:35, generation:390, inputTokens:850, outputTokens:120, retrievalCost:0.04},
    wide:{retrieval:235, assembly:95, generation:690, inputTokens:3100, outputTokens:220, retrievalCost:0.10}
  };

  // Each entry represents one request. Its stage timings remain together when ranked.
  const waitMs = {
    normal:[12,6,18,8,10,16,22,5,11,9,15,7,19,24,13,4,28,14,35,48],
    busy:[140,65,200,95,120,180,240,55,130,105,165,80,210,310,155,40,420,145,680,1050]
  };

  function measure(input = {}, overrideProfile) {
    const profile = profiles[choose('profile', overrideProfile ?? input?.profile)];
    const traffic = choose('traffic', input?.traffic);
    const volume = Number(choose('volume', input?.volume));
    const requests = waitMs[traffic].map((wait,index) => {
      const stages = [
        {label:'排队', ms:wait},
        {label:'检索与筛选', ms:profile.retrieval + (index % 5) * 7},
        {label:'组装上下文', ms:profile.assembly + (index % 4) * 3},
        {label:'生成回答', ms:profile.generation + (index % 7) * 13}
      ];
      return {stages, total:stages.reduce((sum, stage) => sum + stage.ms, 0)};
    }).sort((a,b) => a.total - b.total);
    const atPercentile = percentile => requests[Math.ceil(requests.length * percentile) - 1];
    const medianRequest = atPercentile(0.5);
    const {inputTokens, outputTokens, retrievalCost} = profile;
    const perRequest = Number((retrievalCost + inputTokens * 0.0002 + outputTokens * 0.0006).toFixed(4));
    return {
      p50:medianRequest.total, p95:atPercentile(0.95).total, stages:medianRequest.stages,
      inputTokens, outputTokens, perRequest, totalCost:Number((perRequest * volume).toFixed(2)),
      volume, sampleCount:requests.length,
      costFormula:`单次积分 = 检索 ${retrievalCost.toFixed(2)} + 输入 ${inputTokens} × 0.0002 + 输出 ${outputTokens} × 0.0006。总积分 = 单次积分 × 请求量。`
    };
  }

  const documents = {
    b: {
      id:'b', version:'B', title:'办公区访客预约规定 B', deadline:'17:00', answer:'周二 17:00',
      effective:'案例中的原现行版本',
      text:'工作日接待到公司办公区的外部访客，员工提交预约的截止时间为到访前一个工作日 17:00。节假日安排另行通知。'
    },
    d: {
      id:'d', version:'D', title:'办公区访客预约规定 D', deadline:'16:00', answer:'周二 16:00',
      effective:'本次演练发布后取代 B',
      text:'工作日接待到公司办公区的外部访客，员工提交预约的截止时间为到访前一个工作日 16:00。节假日安排另行通知。'
    }
  };

  const fixFor = {index:'reindex', cache:'invalidate', retrieval:'filter', context:'rebuild', generation:'verify'};
  const issues = {
    index:{label:'先查索引同步', detail:'资料源已发布 D，索引仍是 B。检查文档同步任务及索引中的版本字段。'},
    cache:{label:'先查答案缓存', detail:'索引已包含 D，但这次请求命中 B 的缓存答案，检索和模型调用都被跳过。'},
    retrieval:{label:'先查候选筛选', detail:'索引里有现行 D，也保留历史 B。检索仍选到 B，需要按版本和适用条件筛选。'},
    context:{label:'先查上下文组装', detail:'检索选到 D，本次模型输入却仍是 B。检查组装时实际引用的是哪个片段。'},
    generation:{label:'先核对回答与条款', detail:'输入和引用都是 D，回答却写了 17:00。对照本轮输入里的截止时间，再决定是否发送。'}
  };

  function observe(input = {}, applyFix = false) {
    const release = choose('release', input?.release);
    const fault = choose('fault', input?.fault);
    const fix = choose('fix', input?.fix);
    const document = documents[release];
    const injectedFault = release === 'd' ? fault : 'none';
    const attempted = applyFix && fix !== 'none';
    const matches = attempted && fixFor[injectedFault] === fix;
    const blocked = matches && injectedFault === 'generation';
    const activeFault = matches && !blocked ? 'none' : injectedFault;
    const indexVersion = activeFault === 'index' ? 'b' : release;
    const cacheHit = activeFault === 'cache';
    const retrieved = activeFault === 'retrieval' ? 'b' : indexVersion;
    const context = activeFault === 'context' ? 'b' : retrieved;
    const answerVersion = cacheHit || activeFault === 'generation' ? 'b' : context;
    const citedVersion = cacheHit ? 'b' : context;
    const expected = document.answer;
    const answer = blocked ? '暂缓答复，等待复核' : documents[answerVersion].answer;
    const citation = blocked ? '' : documents[citedVersion].version;
    const diagnosis = issues[activeFault] || {label:'本次回答与现行条款一致', detail:'沿途版本与截止时间都能对回本次探测用的规定。'};

    let signal = {status:'pass', title:'探测结果与现行条款一致', detail:`预期 ${expected}，收到 ${answer}，引用 ${document.version}。`};
    if (blocked) {
      signal = {status:'unknown', title:'旧答已拦截，等待复核', detail:`输入 D 要求 ${expected}，生成的 17:00 被拦截。员工收到暂缓答复。`};
    } else if (answer !== expected || citation !== document.version) {
      signal = {status:'warn', title:'发现答案与现行条款不一致', detail:`预期 ${expected}，收到 ${answer}，引用 ${citation}。沿同一次请求查版本和输入。`};
    }

    const versionStatus = version => version === release ? 'pass' : 'warn';
    const skipped = (id,label) => ({id,label,value:'本次跳过',detail:'直接返回缓存中的答案，没有执行本步骤。',status:'unknown'});
    const logs = [
      {id:'source',label:'资料源',value:`现行 ${document.version}`,detail:document.text,status:'pass'},
      {id:'index',label:'检索索引',value:activeFault==='retrieval'?'D 与历史 B':documents[indexVersion].version,
        detail:activeFault==='index'?'资料源已发布 D，索引尚未读到更新。':`索引可读到 ${documents[indexVersion].version}。`,status:versionStatus(indexVersion)},
      {id:'cache',label:'答案缓存',value:cacheHit?'命中旧答案 B':'未命中旧答案',detail:cacheHit?'从答案缓存直接返回。':'请求继续执行检索。',status:cacheHit?'warn':'pass'},
      cacheHit ? skipped('retrieval','检索选用') :
        {id:'retrieval',label:'检索选用',value:documents[retrieved].version,detail:`本次选用${documents[retrieved].title}。`,status:versionStatus(retrieved)},
      cacheHit ? skipped('context','模型输入') :
        {id:'context',label:'模型输入',value:documents[context].version,detail:documents[context].text,status:versionStatus(context)},
      cacheHit ? skipped('generation','模型输出') :
        {id:'generation',label:'模型输出',value:documents[answerVersion].answer,
          detail:`拟引用 ${documents[citedVersion].version}。${blocked?'答前检查拦截了这段输出。':''}`,status:versionStatus(answerVersion)},
      {id:'answer',label:'员工收到',value:answer,detail:blocked?'交由规则负责人确认后答复。':`引用 ${citation}。`,status:signal.status}
    ];

    let repair = {status:'unknown', title:'等待选择处理动作', detail:'先沿请求记录找到第一个异常环节，再选择动作并重跑探测。'};
    if (attempted && injectedFault === 'none') {
      repair = {status:'unknown', title:'本次探测没有触发故障', detail:'可发布 D 并选一种故障，对照处理前后的记录。'};
    } else if (attempted && !matches) {
      repair = {status:'warn', title:'这项动作后仍检测到旧答', detail:'重跑时异常仍从同一环节出现。回到请求记录继续定位。'};
    } else if (blocked) {
      repair = {status:'pass', title:'发送前检查已拦截旧答', detail:'本次动作阻止了错误答复。生成仍偏离原文，后续需复核并重跑。'};
    } else if (matches) {
      repair = {status:'pass', title:'重跑探测已返回现行期限', detail:`本次请求的证据和答复都指向 ${document.version}，截止时间为 ${expected}。`};
    }

    return {release,fault,activeFault,document,expected,answer,citation,signal,logs,diagnosis,repair};
  }

  const sources = [
    {title:'Google SRE · Monitoring Distributed Systems', url:'https://sre.google/sre-book/monitoring-distributed-systems/'},
    {title:'OpenTelemetry · Traces', url:'https://opentelemetry.io/docs/concepts/signals/traces/'},
    {title:'Microsoft Azure Architecture Center · Cache-Aside pattern', url:'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside'}
  ];

  window.ASSISTANT_OPS_DATA = {fields,measure,observe,documents,fixFor,sources};
})();
