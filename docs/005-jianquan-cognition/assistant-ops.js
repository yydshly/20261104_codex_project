/* Local simulation of the knowledge assistant after evaluation. */
(() => {
  'use strict';
  const root = '#project/knowledge-assistant/';
  const stages = {
    operations: {label:'上线准备', title:'上线运行与监控', lead:'评估通过后，把会持续变化的请求量、资料版本和回答依据也纳入检查。'},
    performance: {label:'比较延迟和成本', title:'一次回答花在哪里？', lead:'用同一批模拟请求对比两种配置。切换访问压力和请求量，分别观察单次耗时与累计成本。'},
    freshness: {label:'发现旧答案', title:'规定更新后，怎样发现还在答旧版？', lead:'发布一条新规定，然后发送同一个访客预约探针。把回答和引用与现行条款逐项核对。'},
    incident: {label:'排查与复测', title:'沿请求记录找到出问题的一步', lead:'比较原文、索引、检索结果、模型输入和输出。选一项修复，再用同一个探针复测。'}
  };
  const ids = Object.keys(stages);
  const data = () => window.ASSISTANT_OPS_DATA;
  const evaluation = () => window.ASSISTANT_EVAL;
  const journey = () => window.JOURNEY;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'})[char]);
  const hasStep = id => Object.hasOwn(stages,id);
  const label = id => stages[id]?.label || '';
  const format = value => Number(value).toLocaleString('zh-CN',{maximumFractionDigits:3});

  function stateOf(route, changes = {}) {
    const input = {...Object.fromEntries(route.q), ...changes};
    const state=Object.fromEntries(Object.entries(data().fields).map(([key,field])=>[
      key,field.choices.some(choice=>choice.id===input[key])?input[key]:field.default
    ]));
    if (state.release==='b') state.fault='none';
    if (state.fault==='none') state.fix='none';
    return state;
  }

  function link(id, route, changes = {}) {
    const query = new URLSearchParams(evaluation().link('comparison',route).split('?')[1] || '');
    for (const [key,value] of Object.entries(stateOf(route,changes))) {
      if (value!==data().fields[key].default) query.set(key,value);
    }
    return root+(hasStep(id)?id:'operations')+(query.size?'?'+query:'');
  }

  function nav(route,inRail=false) {
    const links=ids.map((id,index)=>
      `<a href="${esc(link(id,route))}"${id===route.tab?' aria-current="page"':''}><small>0${index+1}</small><strong>${label(id)}</strong></a>`);
    return inRail ? `<nav class="local-tree" aria-label="运行路线侧栏">${links.join('')}</nav>`
      : `<nav aria-label="运行路线站点"><ol class="project-stops ops-stops">${links.map(item=>'<li>'+item+'</li>').join('')}</ol></nav>`;
  }

  function rail(route) {
    return `<h2>上线运行与监控</h2>${nav(route,true)}
      <a class="quiet rail-bottom" href="${esc(evaluation().link('comparison',route))}">返回评估对照</a>`;
  }

  function entry(route, summary) {
    const ready=summary.ready;
    return `<section class="project-bridges ops-entry" aria-label="继续到运行模拟">
      <p class="eyebrow">从评估走到运行</p><h2>上线运行与监控</h2>
      <p>${ready?'本组用例已全部通过，可以继续模拟上线。':'本组用例还有待处理项，可以先预览运行练习。'}</p>
      <a class="button ${ready?'primary':'secondary'}" href="${esc(link('operations',route))}">${ready?'评估通过，继续模拟上线':'预览上线运行与监控'} →</a>
    </section>`;
  }

  function select(key,state) {
    const field=data().fields[key];
    const disabled=(key==='fault' && state.release==='b') || (key==='fix' && state.fault==='none');
    return `<label>${esc(field.label)}<select data-ops-select="${key}"${disabled?' disabled':''}>${field.choices.map(choice=>
      `<option value="${esc(choice.id)}"${state[key]===choice.id?' selected':''}>${esc(choice.label)}</option>`).join('')}</select></label>`;
  }

  function card(title,text,kicker='') {
    return `<article class="project-card">${kicker?`<small>${esc(kicker)}</small>`:''}<h3>${esc(title)}</h3><p>${esc(text)}</p></article>`;
  }

  function alert(state) {
    return `<section class="project-result ops-alert" data-status="${esc(state.status)}" aria-live="polite">
      <h3>${esc(state.title)}</h3><p>${esc(state.detail)}</p></section>`;
  }

  function overviewView(_state,route) {
    const summary=evaluation().summary(route);
    const gate=summary.ready
      ? {status:'pass',title:'这组评估样例已通过',detail:`当前修改后通过 ${summary.passed} / ${summary.total} 项，可以继续模拟运行。`}
      : {status:'warn',title:'当前评估还有待处理项',detail:`当前修改后通过 ${summary.passed} / ${summary.total} 项。可返回对照页继续调整，也可预览运行练习。`};
    return `${alert(gate)}
      <div class="project-grid">
        ${card('运行成本','在相同请求条件下对照延迟分布和累计积分。','01')}
        ${card('资料新鲜度','规定变更后，回查答案的引用版本和实际截止时间。','02')}
        ${card('故障排查','查看一次请求经过的环节，调整对应位置，再用同题验证。','03')}
      </div>
      <p class="project-note">运行练习采用预设配置与虚构资料。评估配置用于查看上线前的用例状态，运行配置可在下一站独立比较。</p>`;
  }

  function performanceView(state) {
    const baseline=data().measure(state,'standard');
    const candidate=data().measure(state);
    const max=Math.max(baseline.p50,candidate.p50,1);
    const profile=data().fields.profile.choices.find(choice=>choice.id===state.profile);
    const bars=stats=>`<ol class="ops-bars" aria-label="P50 请求分段">${stats.stages.map(stage=>
      `<li><small>${esc(stage.label)}</small><strong>${format(stage.ms)} ms</strong>
      <div class="ops-bar" aria-hidden="true"><span style="--ops-width:${stage.ms/max*100}%"></span></div></li>`).join('')}</ol>`;
    const metrics=(stats,title)=>`<article class="project-card ops-stat"><h3>${esc(title)}</h3>
      <dl><dt>第 50 百分位（P50）</dt><dd><strong>${format(stats.p50)} ms</strong></dd>
      <dt>第 95 百分位（P95）</dt><dd><strong>${format(stats.p95)} ms</strong></dd>
      <dt>每次请求的示意积分</dt><dd><strong>${format(stats.perRequest)}</strong></dd>
      <dt>${format(stats.volume)} 次请求的示意积分</dt><dd><strong>${format(stats.totalCost)}</strong></dd></dl>
      <p>每次输入约 ${format(stats.inputTokens)} token，输出约 ${format(stats.outputTokens)} token。</p>
      <p><strong>代表请求分段</strong></p>${bars(stats)}
    </article>`;
    return `<section aria-label="配置的延迟成本对比">
      <h2>用相同的流量对比配置</h2>
      <div class="ops-profile-picker">${select('profile',state)}${select('traffic',state)}${select('volume',state)}</div>
      <div class="project-grid ops-metrics" aria-live="polite">
        ${metrics(baseline,'基线 · 标准配置')}${metrics(candidate,'对比 · '+profile.label)}
      </div>
      <p class="project-note">每列取 ${baseline.sampleCount} 次预设请求。按耗时排序后，P50 和 P95 分别取达到一半和 95% 的位置。分段图来自 P50 对应的那次请求。</p>
      <p class="project-note">${esc(candidate.costFormula)} 积分用于展示输入、输出和请求量的关系。精简输入后，可回评估页检查关键条件是否还在。</p>
    </section>`;
  }

  function freshnessView(state) {
    const trace=data().observe(state);
    return `<section aria-label="资料更新和答案监控">
      <h2>发布新规定，观察同一道探针题</h2>
      <div class="ops-profile-picker">${select('release',state)}${select('fault',state)}</div>
      ${state.release==='b'?'<p class="project-note">发布规定 D 后，就可以选择一种更新故障。</p>':''}
      <aside class="project-case"><p class="eyebrow">固定探针 · 办公区访客预约</p>
        <blockquote>${esc(window.ASSISTANT_CASE.question)}</blockquote>
        <p>周二和周三均为工作日，探针在所选条款生效后发出。</p></aside>
      <div class="project-grid project-docs" aria-live="polite">
        ${card(trace.document.title,trace.document.text,'现行规定')}
        ${card(trace.answer,`回答引用 ${trace.citation || '未标明出处'}。本题现行预期 ${trace.expected}。`,'探针实际答复')}
      </div>
      ${alert(trace.signal)}
      <p class="project-note">探针把现行条款中的期限作为对照，也记录回答引用的版本。接着查看请求记录，定位差异最早出现的地方。</p>
    </section>`;
  }

  function logsView(trace) {
    return `<ol class="project-trace ops-trace" aria-label="一次请求的环节记录">${trace.logs.map(log=>
      `<li class="ops-trace-item" data-status="${esc(log.status)}">
      <small>${esc(log.label)}</small><strong>${esc(log.value)}</strong><p>${esc(log.detail)}</p></li>`).join('')}</ol>`;
  }

  function incidentView(state) {
    const before=data().observe(state);
    const after=data().observe(state,true);
    const detail=before.diagnosis;
    const testRows=[
      ['现行截止',before.expected,after.expected],['探针答案',before.answer,after.answer],
      ['引用版本',before.citation,after.citation],['监控判断',before.signal.title,after.signal.title]
    ];
    return `<section aria-label="请求记录与故障复测">
      <div class="ops-profile-picker">${select('release',state)}${select('fault',state)}</div>
      ${state.release==='b'?'<p class="project-note">发布规定 D 后，就可以选择一种更新故障。</p>':''}
      <h2>顺着一次请求找差异</h2>
      <p class="project-note">前两行是资料源和索引的状态，其余各行记录这次请求实际走了哪些环节。</p>
      ${logsView(before)}
      <details class="project-note"><summary>核对最先出现差异的环节</summary>
        ${alert({status:before.signal.status,title:detail.label,detail:detail.detail})}</details>
      <h2>选择一项修复，用同一道题复测</h2>
      <div class="ops-profile-picker">${select('fix',state)}</div>
      ${state.fault==='none'?'<p class="project-note">选定一种故障后，可以尝试对应的处理动作。</p>':''}
      ${state.fix==='none'?'':alert(after.repair)}
      <div class="ops-table-wrap" tabindex="0" role="region" aria-label="修复前后复测对照">
        <table><caption>固定探针的修复前后对照</caption>
        <thead><tr><th scope="col">核对项</th><th scope="col">修复前</th><th scope="col">复测结果</th></tr></thead>
        <tbody>${testRows.map(([title,original,retested])=>`<tr><th scope="row">${title}</th><td>${esc(original || '—')}</td><td>${state.fix==='none'?'待选择修复':esc(retested || '—')}</td></tr>`).join('')}</tbody></table>
      </div>
      ${state.fix!=='none'?`<details class="project-note"><summary>查看复测请求记录</summary>${logsView(after)}</details>`:''}
      <p class="project-note">这里单独模拟一处故障。真实排查时，可以先止住不可靠回答，保留请求记录，再按影响范围复测。</p>
    </section>`;
  }

  const related = {
    operations: [
      ['#map/agent?node=evaluation&depth=boundary','Agent · 控制与评估','从停止条件和人工交接，理解运行时怎样限制影响。'],
      ['#map/llm?node=evaluation&depth=intro','大语言模型 · 评估与边界','从测试样例进入持续验证。']
    ],
    performance: [
      ['#map/context?node=selection&depth=mechanism','上下文工程 · 输入预算','理解输入长度、条件保留与运行开销的取舍。'],
      ['#map/rag?node=ranking&depth=mechanism','RAG · 筛选与重排','看额外的检索环节怎样影响依据选择。']
    ],
    freshness: [
      ['#map/rag?node=ingestion&depth=mechanism','RAG · 资料准备与更新','理解新版本如何从资料库进入检索。'],
      ['#map/rag?node=evaluation&depth=boundary','RAG · 回归与核验','用代表性问题持续检查更新后的回答。']
    ],
    incident: [
      ['#map/context?node=selection&depth=mechanism','上下文工程 · 组装本轮输入','找到检索正确但交给模型的材料错误的原因。'],
      ['#map/llm?node=generation&depth=boundary','大语言模型 · 生成与证据','核对输出是否忠实于本轮收到的条款。']
    ]
  };

  const views = {operations:overviewView,performance:performanceView,freshness:freshnessView,incident:incidentView};
  function render(route) {
    const stage=stages[route.tab];
    const index=ids.indexOf(route.tab);
    const next=ids[index+1];
    const previous=index?link(ids[index-1],route):evaluation().link('comparison',route);
    return `<article class="assistant-project assistant-ops">
      <header class="journey-heading project-hero"><p class="eyebrow">公司知识库助手 · 上线运行与监控</p>
        <h1>${stage.title}</h1><p>${stage.lead}</p>
        <a class="quiet" href="${esc(evaluation().link('comparison',route))}">← 返回评估对照</a>
      </header>
      ${nav(route)}
      ${views[route.tab](stateOf(route),route)}
      <nav class="project-pager" aria-label="运行前后站">
        <a class="quiet" href="${esc(previous)}">← ${index?label(ids[index-1]):'评估对照'}</a>
        <a class="button primary" href="${esc(link(next || 'freshness',route))}">${next?'下一站 · '+label(next):'回到探针，试另一种故障'} →</a>
      </nav>
      <section class="project-bridges" aria-label="关联知识地图"><h2>沿地图补这一站的基础</h2>
        <div class="project-grid">${related[route.tab].map(([href,title,reason])=>
          `<a class="project-card" href="${esc(journey().withBack(href,route.hash))}"><h3>${esc(title)} →</h3><p>${esc(reason)}</p></a>`).join('')}</div>
        <p>用目标页的返回链接回到这一站，可保留模拟配置和故障选择。</p>
      </section>
      <details class="project-note"><summary>阅读运行监控方法的原始资料</summary><ul>${data().sources.map(source=>
        `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a></li>`).join('')}</ul></details>
      <p class="project-note">本地教学模拟。规则、指标和请求记录均为构造示例。</p>
    </article>`;
  }

  document.addEventListener('change',event=>{
    const key=event.target.dataset?.opsSelect;
    if(!key || !Object.hasOwn(data().fields,key))return;
    const route=journey().route(location.hash);
    if(route?.kind!=='project' || !hasStep(route.tab))return;
    const changes={[key]:event.target.value};
    if(key==='fault' || key==='release')changes.fix='none';
    const hash=link(route.tab,route,changes);
    history.replaceState(null,'',hash);
    journey().render(journey().route(hash));
    document.querySelector(`[data-ops-select="${key}"]`)?.focus({preventScroll:true});
  });

  window.ASSISTANT_OPS={hasStep,label,link,entry,rail,render};
})();
