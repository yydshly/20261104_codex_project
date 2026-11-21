/* A project walkthrough. Choices are carried in the URL for cross-map reading. */
(() => {
  'use strict';
  const base = '#project/knowledge-assistant';
  const data = () => window.ASSISTANT_CASE;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const icon = name => window.feather?.icons[name]?.toSvg({'aria-hidden':'true',width:19,height:19}) || '';
  const stepById = id => data().steps.find(step => step.id === id);
  const evaluation = () => window.ASSISTANT_EVAL;
  const extension = id => [evaluation(),window.ASSISTANT_OPS].find(section=>section?.hasStep(id));
  const hasStep = id => id === 'overview' || Boolean(stepById(id)) || Boolean(extension(id));
  const label = id => id === 'overview' ? '项目总览' : stepById(id)?.label || extension(id)?.label(id) || '';

  function link(tab, route, changes = {}) {
    const section=extension(tab);
    if (section) return section.link(tab,route,changes);
    const state = data().trace({...Object.fromEntries(route.q), ...changes}).state;
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(state)) {
      if (value !== data().options[key].default) query.set(key, value);
    }
    const back = window.JOURNEY.safeBack(route.q.get('back'), '');
    if (back) query.set('back', back);
    const path = tab === 'overview' || !hasStep(tab) ? base : base + '/' + tab;
    return path + (query.size ? '?' + query : '');
  }

  function entry(back) {
    const href = window.JOURNEY.withBack(base, back);
    return `<section class="project-home-entry" aria-label="公司知识库助手项目路线">
      <div><p class="eyebrow">带着一个任务走进 AI</p>
      <h2>做一个公司知识库助手</h2>
      <p>员工问「现行规定是什么？」沿着任务、资料、检索、上下文和回答核验走一遍。</p></div>
      <a class="button primary" href="${esc(href)}">进入公司知识库助手 ${icon('arrow-right')}</a>
    </section>`;
  }

  function stops(route, inRail = false) {
    const ids = ['overview', ...data().steps.map(step => step.id)];
    const links = ids.map((id, index) => {
      const current = route.tab === id ? ' aria-current="page"' : '';
      return `<a href="${esc(link(id, route))}"${current}><small>${String(index).padStart(2,'0')}</small><strong>${esc(label(id))}</strong></a>`;
    });
    return inRail
      ? `<nav class="local-tree" aria-label="项目路线侧栏">${links.join('')}</nav>`
      : `<nav aria-label="项目路线站点"><ol class="project-stops">${links.map(item => '<li>'+item+'</li>').join('')}</ol></nav>`;
  }

  function rail(route) {
    const section=extension(route.tab);
    if (section) return section.rail(route);
    return `<h2>项目路线</h2>${stops(route,true)}
      <a class="quiet rail-bottom" href="#domain/ai">${icon('compass')} AI 方向地图</a>`;
  }

  function caseBlock() {
    return `<aside class="project-case" aria-label="贯穿全程的虚构任务"><p class="eyebrow">贯穿五站的教学案例</p>
      <blockquote>${esc(data().question)}</blockquote><p>${esc(data().conditions.join(' '))}</p></aside>`;
  }

  function controls(key, state, title) {
    const items = data().options[key].choices.map(({id,label}) =>
      `<button type="button" data-project-choice="${esc(key)}" data-value="${esc(id)}" aria-pressed="${state[key]===id}">${esc(label)}</button>`);
    return `<div class="project-controls" role="group" aria-label="${esc(title)}">${items.join('')}</div>`;
  }

  function card(kicker, title, body) {
    return `<article class="project-card"><small>${esc(kicker)}</small><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`;
  }

  function result(status, title, detail) {
    return `<section class="project-result" data-status="${esc(status)}" aria-live="polite"><h3>${esc(title)}</h3><p>${esc(detail)}</p></section>`;
  }

  function checkFor(trace, step) {
    return trace.checks.find(check => check.step === step);
  }

  function taskQuestion(trace) {
    return trace.state.task === 'vague' ? '访客什么时候预约？' : data().question;
  }

  function taskView(trace) {
    const vague = trace.state.task === 'vague';
    const check = checkFor(trace,'task');
    return `<section aria-label="任务说明对照">
      <h2>助手这次要回答哪一个问题？</h2>
      ${controls('task',trace.state,'选择任务说明')}
      <div class="project-grid" aria-live="polite">
        ${card('交给助手的问题',vague ? '只提到访客' : '明确时间、对象和地点',taskQuestion(trace))}
        ${card('交付要求','给出可核对的截止时间',vague ? '还需要确认访客类型、地点和到访日。' : '依据现行规定，给出截止时间、原文和适用条件。遇到缺失条件时先澄清。')}
      </div>
      ${result(check.status,check.label,check.detail)}
    </section>`;
  }

  function versionsView(trace) {
    const doc = data().documents[trace.state.doc];
    const status = doc.current && doc.applicable ? 'pass' : 'warn';
    const title = !doc.current ? '条文讨论的是同一件事，版本已失效' :
      !doc.applicable ? '文件仍有效，适用对象是展厅团体' : '版本和适用对象都符合本题';
    return `<section aria-label="版本与适用对象对照">
      <h2>同样写着访客预约，三份资料该用哪一份？</h2>
      ${controls('doc',trace.state,'查看规则资料')}
      <div class="project-docs project-grid" aria-live="polite">
        ${card(doc.version,doc.title,doc.text)}
        ${card('核对范围',doc.current?'现行资料':'历史资料',doc.scope)}
      </div>
      ${result(status,title,'查看资料卡可以分辨来源与范围。下一站再选择检索方式，看看系统实际送出的是哪一份。')}
    </section>`;
  }

  function retrievalView(trace) {
    const version = checkFor(trace,'versions');
    const check = version.status === 'warn' ? version : checkFor(trace,'retrieval');
    const candidates = trace.candidates.map((doc,index) => {
      const picked = doc.id === trace.picked.id;
      let reason = '其余候选';
      if (picked) reason = '送入下一站';
      else if (!doc.current && trace.state.retrieval !== 'keyword') reason = '已排除 · 版本失效';
      else if (!doc.applicable && trace.state.retrieval === 'applicable') reason = '已排除 · 对象不符';
      const status = picked && doc.current && doc.applicable ? 'pass' : picked ? 'warn' : 'unknown';
      return `<li data-status="${status}"><small class="project-status">${reason}${reason.startsWith('已排除')?'':` · 第 ${index+1} 位`}</small>
        <strong>${esc(doc.title)}</strong><p>${esc(doc.version)} · ${esc(doc.scope)}</p></li>`;
    }).join('');
    return `<section aria-label="RAG 候选与筛选对照">
      <h2>相关、现行、适用，分别要检查什么？</h2>
      ${controls('retrieval',trace.state,'选择检索策略')}
      <p class="project-status">三种顺序是教学预设。本例取第一份，观察它怎样影响下一站的材料。</p>
      <ol class="project-trace" aria-live="polite">${candidates}</ol>
      ${result(check.status,check.label,check.detail)}
    </section>`;
  }

  function contextView(trace) {
    const check = checkFor(trace,'context');
    const fragment = trace.state.context === 'fragment';
    return `<section aria-label="完整原文和输入片段对照">
      <h2>找到的资料，哪些内容实际进了模型输入？</h2>
      ${controls('context',trace.state,'选择输入组装方式')}
      <p class="project-note">本轮问题「${esc(taskQuestion(trace))}」</p>
      <div class="project-docs project-grid" aria-live="polite">
        ${card('检索交来的原文',trace.picked.title,trace.picked.text)}
        ${card('模型本次收到的材料',fragment?'只剩一个片段':trace.picked.version,trace.evidence)}
      </div>
      ${result(check.status,check.label,check.detail)}
    </section>`;
  }

  function verificationView(trace, route) {
    const checks = trace.checks.map(check => `<li data-status="${esc(check.status)}">
      <small class="project-status">${check.status==='pass'?'条件已满足':check.status==='warn'?'需要回查':'仍待确认'}</small>
      <strong>${esc(check.label)}</strong><p>${esc(check.detail)}</p>
      ${check.status!=='pass' && check.step!==route.tab && hasStep(check.step) ?
        `<a class="quiet" href="${esc(link(check.step,route))}">回到${esc(label(check.step))} ${icon('arrow-right')}</a>` : ''}
      </li>`).join('');
    return `<section aria-label="回答与证据逐项核对">
      <h2>这段回答能作为现行规定交给员工吗？</h2>
      ${controls('retrieval',trace.state,'切换检索策略并核验答复')}
      ${controls('answer',trace.state,'选择示例回答方式')}
      <div class="project-docs project-grid">
        ${card('本轮资料',trace.picked.title,trace.evidence)}
        ${card('预设示例回答',trace.citation || '尚无可引用的完整依据',trace.answerText)}
      </div>
      ${result(trace.result.status,trace.result.title,trace.result.detail)}
      <h2>沿五个环节回查</h2>
      <ol class="project-trace">${checks}</ol>
    </section>`;
  }

  function bridges(step, route) {
    return `<section class="project-bridges" aria-label="关联知识地图">
      <p class="eyebrow">顺着这个问题补知识</p><h2>这一步连接哪些方向？</h2>
      <div class="project-grid">${step.links.map(item =>
        `<a class="project-card" href="${esc(window.JOURNEY.withBack(item.href,route.hash))}">
          <h3>${esc(item.title)} ${icon('arrow-right')}</h3><p>${esc(item.reason)}</p>
        </a>`).join('')}</div>
      <p class="project-status">用目标页的返回链接回到本站，刚才的选择会保留。</p>
    </section>`;
  }

  function overview(route) {
    return `<section class="project-demo" aria-labelledby="project-demo-title">
      <p class="eyebrow">访客预约 · 视频演示</p>
      <h2 id="project-demo-title">从三份规定找到周二 17:00</h2>
      <p id="project-demo-summary">跟着周三到访的案例，排除已失效的旧规和适用对象不同的展厅规定，再用现行规定 B 核对预约截止时间。</p>
      <video class="project-demo-video" controls playsinline preload="none" width="1280" height="720"
        poster="./assets/knowledge-assistant/visitor-policy-poster.jpg"
        aria-labelledby="project-demo-title" aria-describedby="project-demo-summary">
        <source src="./assets/knowledge-assistant/visitor-policy-demo.mp4" type="video/mp4">
        <track kind="captions" srclang="zh-CN" label="简体中文" src="./assets/knowledge-assistant/visitor-policy-demo.zh-CN.vtt">
        <a href="./assets/knowledge-assistant/visitor-policy-demo.mp4">打开访客预约演示视频</a>
      </video>
      <a class="button secondary" href="${esc(link('verification',route,{task:'scoped',retrieval:'applicable',context:'full',answer:'grounded'}))}">到核验站复现这个结果 ${icon('arrow-right')}</a>
    </section>
    <section aria-label="从任务到核验的五个环节">
      <h2>从员工提问走到可核对的回答</h2>
      <div class="project-grid">${data().steps.map((step,index) =>
        `<a class="project-card" href="${esc(link(step.id,route))}">
          <small>第 ${index+1} 站</small><h3>${esc(step.label)} ${icon('arrow-right')}</h3><p>${esc(step.lead)}</p>
        </a>`).join('')}</div>
    </section>
    <nav class="project-pager" aria-label="开始项目路线">
      <a class="button primary" href="${esc(link('task',route))}">从任务开始 ${icon('arrow-right')}</a>
      <a class="quiet" href="${esc(window.JOURNEY.withBack('#domain/ai',route.hash))}">展开 AI 方向地图 ${icon('compass')}</a>
    </nav>`;
  }

  function pager(step, route) {
    const index = data().steps.indexOf(step);
    const previous = data().steps[index-1];
    const next = data().steps[index+1];
    return `<nav class="project-pager" aria-label="前后站">
      <a class="quiet" href="${esc(link(previous?.id || 'overview',route))}">${icon('arrow-left')} ${esc(previous?.label || '项目总览')}</a>
      ${next
        ? `<a class="button primary" href="${esc(link(next.id,route))}">下一站 · ${esc(next.label)} ${icon('arrow-right')}</a>`
        : `<a class="button secondary" href="${esc(link('overview',route))}">回到项目总览 ${icon('arrow-right')}</a>`}
    </nav>`;
  }

  const views = {task:taskView,versions:versionsView,retrieval:retrievalView,context:contextView,verification:verificationView};

  function render(route) {
    const section=extension(route.tab);
    if (section) return section.render(route);
    const step = stepById(route.tab);
    const trace = data().trace(Object.fromEntries(route.q));
    const number = step ? data().steps.indexOf(step)+1 : 0;
    const back = window.JOURNEY.safeBack(route.q.get('back'),'#home');
    const origin = back === '#home' ? '返回世界全景' : '返回进入这条路线的位置';
    return `<article class="assistant-project">
      <header class="journey-heading project-hero">
        <p class="eyebrow">${step ? '公司知识库助手 · 第 '+number+' 站 / 5' : '见全 · 从实际任务进入 AI'}</p>
        <h1>${esc(step?.title || data().title)}</h1>
        <p>${esc(step?.lead || data().lead)}</p>
        <a class="quiet" href="${esc(back)}">${icon('arrow-left')} ${origin}</a>
      </header>
      ${stops(route)}
      ${caseBlock()}
      ${step ? views[step.id](trace,route) : overview(route)}
      ${route.tab === 'verification' ? evaluation()?.entry(route) || '' : ''}
      ${step ? `<p class="project-status">${esc(step.takeaway)}</p>${pager(step,route)}${bridges(step,route)}` : ''}
      <p class="project-status">公司、规定、候选顺序与回答均为本地教学示意。</p>
    </article>`;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button[data-project-choice]');
    if (!button) return;
    const route = window.JOURNEY.route(location.hash);
    if (route?.kind !== 'project') return;
    const key = button.dataset.projectChoice;
    const value = button.dataset.value;
    if (!Object.hasOwn(data().options,key) || !data().options[key].choices.some(option => option.id === value)) return;
    const hash = link(route.tab,route,{[key]:value});
    history.replaceState(null,'',hash);
    window.JOURNEY.render(window.JOURNEY.route(hash));
    document.querySelector(`[data-project-choice="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});
  });

  window.ASSISTANT_PROJECT = {hasStep,label,link,entry,rail,render};
})();
