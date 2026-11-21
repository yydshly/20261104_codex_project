/* Evaluation follows the same project and keeps its test setup in the URL. */
(() => {
  'use strict';
  const root = '#project/knowledge-assistant/';
  const stages = {
    evaluation: {label:'设计测试用例', title:'评估与可靠性', lead:'用同一个访客预约问题，先约定什么算答对，再检查系统在不同条件下怎样表现。'},
    diagnosis: {label:'定位错误', title:'定位第一个出问题的环节', lead:'对照问题、依据和回答，判断该补任务条件、换资料、恢复条款，还是修正回答。'},
    comparison: {label:'对比修改前后', title:'用同一组测试比较改动', lead:'选择一项修改。两列使用相同的问题、预期和检查条件，便于看清这次改动的影响。'},
    review: {label:'判断人工复核', title:'什么时候需要人工复核？', lead:'分清可以答复、应该补问，以及需要交给负责人员确认的情况。'}
  };
  const ids = Object.keys(stages);
  const data = () => window.ASSISTANT_EVAL_DATA;
  const project = () => window.ASSISTANT_PROJECT;
  const journey = () => window.JOURNEY;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const hasStep = id => Object.hasOwn(stages,id);
  const label = id => stages[id]?.label || '';
  const statuses = {pass:'通过',warn:'未通过',unknown:'待确认'};
  const guesses = [
    {id:'task',label:'任务条件'}, {id:'versions',label:'资料版本'},
    {id:'retrieval',label:'检索与适用对象'}, {id:'context',label:'输入条款'},
    {id:'verification',label:'回答与依据'}, {id:'review',label:'复核边界'}
  ];
  const actions = [
    {id:'release',label:'按已核对的资料答复'}, {id:'clarify',label:'先补问条件'},
    {id:'human',label:'交给负责人员复核'}
  ];

  function getState(route, changes = {}) {
    const input = {...Object.fromEntries(route.q),...changes};
    const custom = data().buildCase(input);
    const cases = [custom,...data().presets];
    return {
      custom,cases,
      testCase:cases.find(test => test.id === input.test) || custom,
      patch:data().patches.find(patch => patch.id === input.patch) || data().patches.find(patch => patch.id === 'scope'),
      guess:['show',...guesses.map(guess=>guess.id)].includes(input.guess) ? input.guess : '',
      action:actions.some(action=>action.id===input.action) ? input.action : '',
      baseline:data().baseline(input)
    };
  }

  function link(id,route,changes={}) {
    const state=getState(route,changes);
    // Carry the project choices separately from the test design.
    const query=new URLSearchParams(project().link('verification',route).split('?')[1] || '');
    for(const [key,field] of Object.entries(data().fields)) {
      if(state.custom.state[key]!==field.default)query.set(key,state.custom.state[key]);
    }
    if(state.custom.chosen!=='tue')query.set('expected',state.custom.chosen);
    if(state.testCase.id!=='custom')query.set('test',state.testCase.id);
    if(state.patch.id!=='scope')query.set('patch',state.patch.id);
    if(state.guess)query.set('guess',state.guess);
    if(state.action)query.set('action',state.action);
    return root+(hasStep(id)?id:'evaluation')+(query.size?'?'+query:'');
  }

  function stepNav(route,inRail=false) {
    const links=ids.map((id,index)=>
      `<a href="${esc(link(id,route))}"${id===route.tab?' aria-current="page"':''}><small>${String(index+1).padStart(2,'0')}</small><strong>${label(id)}</strong></a>`);
    return inRail
      ? `<nav class="local-tree" aria-label="评估路线侧栏">${links.join('')}</nav>`
      : `<nav aria-label="评估路线站点"><ol class="project-stops eval-stops">${links.map(item=>'<li>'+item+'</li>').join('')}</ol></nav>`;
  }

  function rail(route) {
    return `<h2>评估与可靠性</h2>${stepNav(route,true)}
      <a class="quiet rail-bottom" href="${esc(project().link('verification',route))}">返回项目核验回答</a>`;
  }

  function entry(route) {
    return `<section class="project-bridges eval-entry" aria-label="继续做评估">
      <p class="eyebrow">把一次核验扩展到一组问题</p><h2>评估与可靠性</h2>
      <p>换一个到访日期、访客类型或资料条件，看看刚才的做法还是否适用。</p>
      <a class="button primary" href="${esc(link('evaluation',route))}">继续做评估与可靠性 →</a>
    </section>`;
  }

  function optionSelect(name,choices,value) {
    return `<select name="${esc(name)}">${choices.map(choice =>
      `<option value="${esc(choice.id)}"${choice.id===value?' selected':''}>${esc(choice.label)}</option>`).join('')}</select>`;
  }

  function evaluationView(state) {
    const test=state.custom;
    const fields=Object.entries(data().fields).map(([key,field])=>
      `<label>${esc(field.label)}${optionSelect(key,field.choices,test.state[key])}</label>`).join('');
    const documents=window.ASSISTANT_CASE.documents;
    return `<section aria-label="设计一个测试用例">
      <h2>先写好问题和预期</h2>
      <div class="project-grid project-docs">
        <article class="project-card"><h3>办公区 · 现行规定 B</h3><p>${esc(documents.current.text)}</p></article>
        <article class="project-card"><h3>展厅团体 · 办法 C</h3><p>${esc(documents.other.text)}</p></article>
      </div>
      <form class="eval-builder" id="assistant-eval-case-form">
        <fieldset><legend>选出题目条件</legend><div class="eval-builder-fields">${fields}</div></fieldset>
        <fieldset><legend>你期望助手怎样答？</legend>
          <label>预期答复${optionSelect('expected',data().expectedOptions,test.chosen)}</label>
          <p>测试会一起检查结论、适用条件和依据。该补问或转交复核时，正确停下来也算通过。</p>
        </fieldset>
        <button class="button primary" type="submit">保存用例并定位错误 →</button>
      </form>
    </section>`;
  }

  function casePicker(state) {
    return `<div class="eval-case-picker"><label>选择要观察的用例
      <select data-eval-select="test">${state.cases.map(test=>
        `<option value="${esc(test.id)}"${test.id===state.testCase.id?' selected':''}>${esc(test.title)}</option>`).join('')}</select>
      </label></div>`;
  }

  function caseBlock(test, showExpected = true) {
    const chosen=data().expectedOptions.find(option=>option.id===test.chosen)?.label;
    return `<aside class="project-case">
      <p class="eyebrow">${esc(test.title)}</p><blockquote>${esc(test.question)}</blockquote>
      <p>${esc(test.conditions.join(' '))}</p>${showExpected?`<p><strong>测试预期</strong> · ${esc(chosen)}</p>`:''}
    </aside>`;
  }

  function buttons(key,choices,selected,title) {
    return `<div class="project-controls" role="group" aria-label="${esc(title)}">${choices.map(choice=>
      `<button type="button" data-eval-choice="${key}" data-value="${esc(choice.id)}" aria-pressed="${choice.id===selected}">${esc(choice.label)}</button>`).join('')}</div>`;
  }

  function diagnosisView(state,route) {
    const attempt=data().run(state.testCase,state.baseline);
    let reveal='';
    if(state.guess) {
      const actual=attempt.diagnosis;
      const caption=state.guess==='show' || attempt.status==='pass' || actual.step==='expectation'
        ? actual.label : state.guess===actual.step ? '判断一致 · '+actual.label : '沿证据回查 · '+actual.label;
      const projectStep=window.ASSISTANT_CASE.steps.some(step=>step.id===actual.step);
      let returnHref='';
      if(projectStep) {
        const [path,search]=project().link(actual.step,route).split('?');
        const query=new URLSearchParams(search);
        query.delete('back');
        returnHref=journey().withBack(path+(query.size?'?'+query:''),route.hash);
      }
      reveal=`<section class="eval-report" aria-live="polite">
        <div class="project-result" data-status="${attempt.status}"><h3>${esc(caption)}</h3><p>${esc(actual.detail)}</p>
          ${returnHref?`<a class="quiet" href="${esc(returnHref)}">在项目原例中查看「${esc(project().label(actual.step))}」 →</a>`:''}
          ${actual.step==='expectation'?`<a class="quiet" href="${esc(link('evaluation',route))}">回到测试用例调整预期 →</a>`:''}
        </div>
        <ol class="project-trace">${attempt.checks.map(check=>
          `<li data-status="${esc(check.status)}"><strong>${esc(check.label)}</strong><p>${esc(check.detail)}</p></li>`).join('')}</ol>
      </section>`;
    }
    return `${casePicker(state)}${caseBlock(state.testCase)}
      <div class="project-grid project-docs">
        <article class="project-card"><h3>本轮依据</h3><p>${esc(attempt.source)}</p></article>
        <article class="project-card"><h3>修改前的示例回答</h3><p>${esc(attempt.answer)}</p></article>
      </div>
      <h2>你会先查哪一步？</h2>
      ${buttons('guess',[...guesses,{id:'show',label:'直接查看诊断'}],state.guess,'选择先检查的环节')}
      ${reveal}`;
  }

  function configText(config) {
    return ['retrieval','context','answer'].map(key=>
      window.ASSISTANT_CASE.options[key].choices.find(choice=>choice.id===config[key])?.label
    ).concat(config.review?'遇到假期或冲突时交人核查':'按原流程处理例外').join(' · ');
  }

  function summarize(rows) {
    const passed=rows.filter(row=>row.after.status==='pass').length;
    return {passed,total:rows.length,ready:rows.length>0 && passed===rows.length};
  }

  function summary(route) {
    const state=getState(route);
    return summarize(data().compare(state.cases,state.baseline,state.patch.id));
  }

  function comparisonView(state,route) {
    const rows=data().compare(state.cases,state.baseline,state.patch.id);
    const revised=data().applyPatch(state.baseline,state.patch.id);
    const cell=result=>`<span class="eval-status" data-status="${result.status}">${statuses[result.status]}</span>
      <p>${esc(result.diagnosis.label)}</p><p>${esc(result.diagnosis.detail)}</p>
      ${result.status==='unknown'?'':`<details><summary>看回答与依据</summary><p>${esc(result.answer)}</p>${result.source?`<p>${esc(result.source)}</p>`:''}</details>`}`;
    const count=side=>{
      const checked=rows.filter(row=>row[side].status!=='unknown');
      return `${checked.filter(row=>row[side].status==='pass').length} / ${checked.length} 通过`;
    };
    return `<section aria-label="修改前后对照">
      <h2>选择要尝试的改动</h2>
      <div class="eval-case-picker"><label>修改方案<select data-eval-select="patch">
        ${data().patches.map(patch=>`<option value="${esc(patch.id)}"${patch.id===state.patch.id?' selected':''}>${esc(patch.label)}</option>`).join('')}
      </select></label></div>
      <p class="project-note">${esc(state.patch.detail)}</p>
      <div class="project-grid eval-metrics" aria-live="polite">
        <article class="project-card"><h3>修改前 · ${count('before')}</h3><p>${esc(configText(state.baseline))}</p></article>
        <article class="project-card"><h3>修改后 · ${count('after')}</h3><p>${esc(configText(revised))}</p></article>
      </div>
      <div class="eval-table-wrap" tabindex="0" role="region" aria-label="测试结果对照表">
        <table><caption>同一组用例，逐条对照</caption>
          <thead><tr><th scope="col">测试用例</th><th scope="col">修改前</th><th scope="col">修改后</th></tr></thead>
          <tbody>${rows.map(row=>`<tr><th scope="row">${esc(row.testCase.title)}<small>预期 · ${esc(data().expectedOptions.find(option=>option.id===row.testCase.chosen)?.label)}</small></th>
            <td>${cell(row.before)}</td><td>${cell(row.after)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="project-note">通过数只统计预期已核对的用例。这里比较的是这组固定样例和你设计的题目。</p>
    </section>${window.ASSISTANT_OPS?.entry(route,summarize(rows)) || ''}`;
  }

  function reviewView(state) {
    const decision=data().review(state.testCase);
    const feedback=state.action ? `<section class="project-result eval-review-card" data-status="${state.action===decision.action?'pass':'warn'}" aria-live="polite">
      <h3>${esc(decision.title)}</h3><p>${state.action===decision.action?'你的选择和本例的处理一致。 ':''}${esc(decision.reason)}</p>
      <dl class="eval-handoff">${decision.items.map(item=>`<dt>${esc(item.label)}</dt><dd>${esc(item.text)}</dd>`).join('')}</dl>
    </section>`:'';
    return `${casePicker(state)}${caseBlock(state.testCase,false)}
      <h2>这次应该怎样处理？</h2>
      <p class="project-note">判断时以题目条件为准。常规案例假定已查到适用、完整的原文。</p>
      ${buttons('action',actions,state.action,'选择处理方式')}
      ${feedback}`;
  }

  const related = {
    evaluation: [
      ['#article/context-tests','看怎样做对照测试','区分调试用例和留待检验的新问题。'],
      ['#map/context?node=evaluation&depth=mechanism','上下文工程 · 验证与边界','把任务标准、样例与回归检查接起来。']
    ],
    diagnosis: [
      ['#map/rag?node=evaluation&depth=mechanism','RAG · 核验与更新','分开检查候选、输入和回答。'],
      ['#map/llm?node=evaluation&depth=intro','大语言模型 · 评估与边界','给每个结论找对应的检查依据。']
    ],
    comparison: [
      ['#map/context?node=evaluation&depth=mechanism','上下文工程 · 对照验证','用相同条件看改动影响了哪里。'],
      ['#map/rag?node=evaluation&depth=boundary','RAG · 回归与更新','资料或配置更新后再查典型问题。']
    ],
    review: [
      ['#map/agent?node=evaluation&depth=boundary','Agent · 控制与评估','了解何时停止，并把现场交给人。'],
      ['#map/llm?node=evaluation&depth=boundary','大语言模型 · 评估与边界','区分答案说得确定与证据充分。']
    ]
  };

  function bridge(route) {
    return `<section class="project-bridges" aria-label="关联知识地图"><h2>沿地图补这一站的基础</h2>
      <div class="project-grid">${related[route.tab].map(([href,title,reason])=>
        `<a class="project-card" href="${esc(journey().withBack(href,route.hash))}"><h3>${esc(title)} →</h3><p>${esc(reason)}</p></a>`).join('')}</div>
      <p>目标页的返回入口会带你回到这一站，保留用例和改动。</p>
    </section>`;
  }

  const views={evaluation:evaluationView,diagnosis:diagnosisView,comparison:comparisonView,review:reviewView};

  function render(route) {
    const stage=stages[route.tab];
    const index=ids.indexOf(route.tab);
    const state=getState(route);
    const previous=index?link(ids[index-1],route):project().link('verification',route);
    const next=ids[index+1];
    return `<article class="assistant-project assistant-eval">
      <header class="journey-heading project-hero"><p class="eyebrow">公司知识库助手 · 评估与可靠性</p>
        <h1>${stage.title}</h1><p>${stage.lead}</p>
        <a class="quiet" href="${esc(project().link('verification',route))}">← 返回核验回答</a>
      </header>
      ${stepNav(route)}
      ${views[route.tab](state,route)}
      ${route.tab==='review' ? window.ASSISTANT_OPS?.entry(route,summary(route)) || '' : ''}
      ${index?`<nav class="project-pager" aria-label="评估前后站">
        <a class="quiet" href="${esc(previous)}">← ${index?label(ids[index-1]):'核验回答'}</a>
        <a class="button primary" href="${esc(link(next || 'evaluation',route))}">${next?'下一站 · '+label(next):'再设计一个测试用例'} →</a>
      </nav>`:''}
      ${bridge(route)}
      <details class="project-note"><summary>阅读评估方法的原始资料</summary><ul>${data().sources.map(source=>
        `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a></li>`).join('')}</ul></details>
      <p class="project-note">本地教学案例使用虚构规定和确定性的示例回答。</p>
    </article>`;
  }

  const currentRoute=()=>{
    const route=journey().route(location.hash);
    return route?.kind==='project' && hasStep(route.tab) ? route : null;
  };
  function refresh(route,changes,focusSelector) {
    const hash=link(route.tab,route,changes);
    history.replaceState(null,'',hash);
    journey().render(journey().route(hash));
    document.querySelector(focusSelector)?.focus({preventScroll:true});
  }
  document.addEventListener('submit',event=>{
    if(event.target.id!=='assistant-eval-case-form')return;
    const route=currentRoute();
    if(!route)return;
    event.preventDefault();
    const input=Object.fromEntries(new FormData(event.target));
    location.hash=link('diagnosis',route,{...input,test:'custom',guess:'',action:''});
  });
  document.addEventListener('change',event=>{
    const key=event.target.dataset.evalSelect;
    if(!['test','patch'].includes(key))return;
    const route=currentRoute();
    if(!route)return;
    const changes=key==='test'?{test:event.target.value,guess:'',action:''}:{patch:event.target.value};
    refresh(route,changes,`[data-eval-select="${key}"]`);
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('button[data-eval-choice]');
    if(!button)return;
    const route=currentRoute();
    if(!route)return;
    const {evalChoice:key,value}=button.dataset;
    if(!['guess','action'].includes(key))return;
    refresh(route,{[key]:value},`[data-eval-choice="${key}"][data-value="${CSS.escape(value)}"]`);
  });

  window.ASSISTANT_EVAL={hasStep,label,link,entry,rail,render,summary};
})();
