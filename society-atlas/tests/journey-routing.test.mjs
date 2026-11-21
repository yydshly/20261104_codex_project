import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the shipped routing module with the real content. Rendering and browser
// interactions are verified separately; these stubs only allow module registration.
const sandbox = {
  window: {},
  document: { addEventListener() {} },
  localStorage: { getItem() { return null; } },
  URLSearchParams
};
for (const file of ['data', 'ai-data', 'journey-data', 'ai-expansion', 'computing-data', 'education-data', 'llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog', 'roam-data', 'roam', 'navigation-data', 'navigation', 'llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','industry-paths','industry-directions','industry-foundations','learning-data','learning','explore','journey']) {
  vm.runInNewContext(fs.readFileSync(new URL(`../dist/${file}.js`, import.meta.url), 'utf8'), sandbox);
}
const { route, safeBack, withBack } = sandbox.window.JOURNEY;
const fallback = '#home';

test('学习路线、引用与本地学习记录都能恢复正确的阅读状态', () => {
  const { LEARNING, LEARNING_PATHS, JOURNEY_CATALOG } = sandbox.window;
  for (const [id, path] of Object.entries(LEARNING_PATHS)) {
    assert.ok(JOURNEY_CATALOG.find(path.question,'study').some(item=>item.href===`#study/${id}`));
    const study = route(`#study/${id}`);
    assert.equal(study.kind,'study');
    assert.ok(LEARNING.render(study).includes('先做一个判断'));
    assert.ok(!LEARNING.render(study).includes('换一个场景再试'));
    for (const source of path.sources) assert.ok(LEARNING.render(study).includes(source.url));
  }
  const read = sandbox.localStorage.getItem;
  try {
    sandbox.localStorage.getItem = key => key==='jianquan.industry-study.v1' ? JSON.stringify({
      testing:{first:'unsure',transfer:1,note:'<我的解释>'},
      quality:{first:999,transfer:0,note:'无效进度'}
    }) : null;
    const completed=LEARNING.render(route('#study/testing'));
    assert.ok(completed.includes('换一个场景再试'));
    assert.ok(completed.includes('&lt;我的解释&gt;'));
    const records=LEARNING.render(route('#study/records'));
    assert.ok(records.includes('已完成换例判断'));
    assert.ok(records.includes('我还不确定'));
    assert.ok(!records.includes('无效进度'));
    assert.equal(route('#study/constructor').kind,'missing');
    assert.equal(route('#study/testing/').kind,'missing');
  } finally {
    sandbox.localStorage.getItem = read;
  }
});

test('统一首页、AI 全景、图解、信息组织和项目路线能够解析', () => {
  for (const [hash, kind, id, tab] of [
    ['', 'home', undefined, 'overview'],
    ['#home', 'home', undefined, 'overview'],
    ['#learn/industries', 'learn', 'industries', 'overview'],
    ['#learn/industries/logistics', 'learn', 'industries', 'logistics'],
    ['#learn/skills', 'learn', 'skills', 'overview'],
    ['#learn/skills/map-flow', 'learn', 'skills', 'map-flow'],
    ['#learn/thinking', 'learn', 'thinking', 'overview'],
    ['#learn/thinking/trace', 'learn', 'thinking', 'trace'],
    ['#domain/ai', 'domain', 'ai', 'overview'],
    ['#domain/ai/how', 'domain', 'ai', 'how'],
    ['#domain/ai/history', 'domain', 'ai', 'history'],
    ['#article/retrieval', 'article', 'retrieval', 'overview'],
    ['#domain/information', 'domain', 'information', 'overview'],
    ['#domain/information/how', 'domain', 'information', 'how'],
    ['#domain/information/history', 'domain', 'information', 'history'],
    ['#domain/computing', 'domain', 'computing', 'overview'],
    ['#domain/education/history', 'domain', 'education', 'history'],
    ['#article/info-finding', 'article', 'info-finding', 'overview'],
    ['#project/knowledge-assistant', 'project', 'knowledge-assistant', 'overview'],
    ...['task','versions','retrieval','context','verification'].map(tab => [
      '#project/knowledge-assistant/'+tab, 'project', 'knowledge-assistant', tab
    ])
  ]) {
    const result = route(hash);
    assert.equal(result.view, 'journey', hash);
    assert.equal(result.kind, kind, hash);
    assert.equal(result.id, id, hash);
    assert.equal(result.tab, tab, hash);
  }
});

test('信息组织六个分支均落到真实文章，社会全景的真实主题均可解析', () => {
  for (const node of sandbox.window.JOURNEY_DATA.domains.information.nodes) {
    const result = route(`#article/${node.article}`);
    assert.equal(result.kind, 'article', node.article);
    assert.equal(result.id, node.article);
  }
  for (const system of sandbox.window.ATLAS_DATA.systems) {
    assert.equal(route(`#world/${system.id}`).kind, 'world', system.id);
    for (const topic of system.topics) {
      const result = route(`#world/${system.id}/${topic.id}`);
      assert.equal(result.kind, 'world', `${system.id}/${topic.id}`);
      assert.equal(result.tab, topic.id);
    }
  }
});

test('每个社会板块都有可进入的行业，合起来覆盖全部行业门类', () => {
  const { sectors, worldIndustries } = sandbox.window.INDUSTRY_DATA;
  const explore = sandbox.window.EXPLORE;
  const systems = sandbox.window.ATLAS_DATA.systems;
  const covered = new Set();
  assert.deepEqual(Object.keys(worldIndustries).sort(), Array.from(systems, system => system.id).sort());
  for (const system of systems) {
    const board = route(`#world/${system.id}`);
    const industries = explore.worldIndustryView(board);
    const entries = worldIndustries[system.id];
    assert.ok(entries.length > 0, board.hash);
    assert.equal(new Set(entries.map(([id]) => id)).size, entries.length, board.hash);
    for (const [id, question] of entries) {
      const href = withBack(`#learn/industries/${id}`, board.hash);
      assert.equal(route(href).kind, 'learn', href);
      assert.ok(industries.includes(`href="${href}"`), href);
      assert.ok(question.trim(), href);
      covered.add(id);
    }
  }
  assert.deepEqual([...covered].sort(), Array.from(sectors, sector => sector.id).sort());
});

test('同一行业从不同社会板块进入时，技能和思维练习都能沿原路返回', () => {
  const explore = sandbox.window.EXPLORE;
  for (const [board, boardName] of [['economy','生产与交换'], ['global','全球连接']]) {
    const world = `#world/${board}`;
    const industry = withBack('#learn/industries/logistics', world);
    const industryView = explore.render(route(industry));
    for (const target of ['#learn/skills/map-flow', '#learn/thinking/trace?case=logistics']) {
      const href = withBack(target, industry);
      assert.ok(industryView.includes(`href="${href.replaceAll('&', '&amp;')}"`), href);
      const lesson = route(href);
      const crumbs = explore.trail(lesson);
      assert.equal(crumbs[0][0], boardName);
      assert.equal(crumbs[0][1], world);
      assert.equal(crumbs[1][1], industry);
      assert.ok(explore.render(lesson).includes(`href="${industry}"> 返回「交通与物流」`));
    }
    assert.ok(industryView.includes(`href="${world}"> 返回「${boardName}」`));
  }
});

test('全部行业有专属路线，练习可以恢复选择并返回来时的板块', () => {
  const { EXPLORE, INDUSTRY_PATHS, INDUSTRY_DATA } = sandbox.window;
  const sectorIds = Array.from(INDUSTRY_DATA.sectors, sector => sector.id);
  assert.deepEqual(Object.keys(INDUSTRY_PATHS).sort(), sectorIds.sort());
  for (const [board, entries] of Object.entries(INDUSTRY_DATA.worldIndustries)) {
    const world = `#world/${board}`;
    const industryList = EXPLORE.worldIndustryView(route(world));
    for (const [sector] of entries) {
      const href = withBack(`#learn/industries/${sector}`, world);
      assert.ok(industryList.includes(`href="${href}"><small class="explore-tag">行业路线 · 含动手体验`), sector);
      const { flow, levels, lab } = INDUSTRY_PATHS[sector];
      assert.equal(flow.length, 3, sector);
      assert.equal(levels.length, 3, sector);
      assert.ok(lab.options.length >= 2, sector);
      assert.equal(new Set(lab.options.map(option => option.id)).size, lab.options.length, sector);
      for (const option of lab.options) {
        const selected = route(`${href}&practice=${option.id}`);
        const page = EXPLORE.render(selected);
        for (const level of levels) assert.ok(page.includes(level.title) && level.skill && level.thinking && level.check, sector);
        assert.ok(page.includes(`data-industry-practice="${option.id}" aria-pressed="true"`), sector);
        assert.ok(page.includes(option.finding), sector);
        assert.equal(EXPLORE.trail(selected)[0][1], world);
        for (const [, count, total] of option.rows) {
          if (lab.metric) assert.ok(Number.isInteger(count) && Number.isInteger(total) && total > 0 && count >= 0 && count <= total, sector);
          else assert.ok(typeof count === 'string' && count.trim(), sector);
        }
      }
      const fallbackPage = EXPLORE.render(route(`${href}&practice=unknown`));
      assert.ok(fallbackPage.includes(`data-industry-practice="${lab.options[0].id}" aria-pressed="true"`), sector);
    }
  }
});

test('各行业工作方向可进入、可搜索，能保留行业练习与来时的板块', () => {
  const { EXPLORE, INDUSTRY_DIRECTIONS, INDUSTRY_DATA, JOURNEY_CATALOG } = sandbox.window;
  const sectorIds = Array.from(INDUSTRY_DATA.sectors, sector => sector.id);
  assert.deepEqual(Object.keys(INDUSTRY_DIRECTIONS).sort(), sectorIds.sort());
  for (const sector of INDUSTRY_DATA.sectors) {
    const directions = INDUSTRY_DIRECTIONS[sector.id];
    const [board] = Object.entries(INDUSTRY_DATA.worldIndustries).find(([, entries]) => entries.some(([id]) => id === sector.id));
    const base = `#learn/industries/${sector.id}`;
    const industry = `${withBack(base,`#world/${board}`)}&practice=preserved`;
    const overview = EXPLORE.render(route(industry));
    assert.equal(directions.length, 3, sector.id);
    assert.equal(new Set(directions.map(direction => direction.id)).size, directions.length, sector.id);
    for (const direction of directions) {
      const href = `${industry}&direction=${direction.id}`;
      const selected = route(href);
      assert.ok(overview.includes(`href="${href.replaceAll('&','&amp;')}"`), href);
      const detail = EXPLORE.render(selected);
      assert.ok(detail.includes(`<h1>${direction.title}</h1>`), href);
      assert.ok(detail.includes(direction.check), href);
      assert.ok(detail.includes(`href="${industry.replaceAll('&','&amp;')}"> 返回「${sector.title}」`), href);
      const lesson = withBack(`#learn/skills/${direction.skill}`, href);
      assert.ok(detail.includes(`href="${lesson}"`), lesson);
      assert.equal(EXPLORE.trail(route(lesson))[1][1], industry);
      assert.equal(EXPLORE.trail(route(lesson))[2][1], href);
      assert.ok(JOURNEY_CATALOG.find(direction.title,'industries').some(item => item.href === `${base}?direction=${direction.id}`), href);
    }
    assert.ok(EXPLORE.render(route(`${industry}&direction=unknown`)).includes(`<h1>${sector.title}</h1>`));
  }
});

test('工作方向的基础概念可搜索，保留判断与跨行业来路', () => {
  const { EXPLORE, INDUSTRY_FOUNDATIONS, DIRECTION_FOUNDATIONS, INDUSTRY_DIRECTIONS, JOURNEY_CATALOG } = sandbox.window;
  const overview = route('#learn/foundations');
  assert.equal(overview.kind, 'learn');
  for (const [sector, directions] of Object.entries(INDUSTRY_DIRECTIONS)) {
    for (const direction of directions) {
      const origin = `#learn/industries/${sector}?direction=${direction.id}`;
      const page = EXPLORE.render(route(origin));
      const ids = DIRECTION_FOUNDATIONS[sector][direction.id];
      assert.equal(new Set(ids).size, 2, origin);
      for (const id of ids) {
        assert.ok(Object.hasOwn(INDUSTRY_FOUNDATIONS,id), origin);
        const href = withBack(`#learn/foundations/${id}`, origin);
        assert.equal(route(href).kind, 'learn', href);
        assert.ok(page.includes(`href="${href}"`), href);
        assert.equal(EXPLORE.trail(route(href))[2][1], origin);
      }
    }
  }
  for (const [id, concept] of Object.entries(INDUSTRY_FOUNDATIONS)) {
    const base = `#learn/foundations/${id}`;
    assert.ok(JOURNEY_CATALOG.find(concept.title,'foundations').some(item => item.href===base), id);
    assert.equal(concept.steps.length, 3, id);
    assert.ok(new Set(concept.uses.map(([sector]) => sector)).size>=2, id);
    const href = `${base}?try=1`;
    const detail = EXPLORE.render(route(href));
    assert.ok(detail.includes(concept.choices[1][1]), href);
    assert.ok(detail.includes('data-foundation-choice="1" aria-pressed="true"'), href);
    assert.ok(!EXPLORE.render(route(`${base}?try=invalid`)).includes('aria-pressed="true"'), id);
    for (const [sector, direction] of concept.uses) {
      assert.ok(DIRECTION_FOUNDATIONS[sector][direction].includes(id), id);
      const cross = withBack(`#learn/industries/${sector}?direction=${direction}`, href);
      assert.ok(detail.includes(`href="${cross.replaceAll('&','&amp;')}"`), cross);
      assert.ok(EXPLORE.render(route(cross)).includes(`href="${href}"> 返回「${concept.title}」`), cross);
    }
  }
});

test('未知领域、文章和世界主题返回 missing，不因空对象或继承属性抛异常', () => {
  for (const hash of [
    '#domain', '#domain/unknown', '#domain/constructor', '#domain/ai/unknown',
    '#article', '#article/unknown', '#article/constructor', '#article/toString', '#article/__proto__',
    '#world', '#world/unknown', '#world/unknown/topic', '#world/constructor/topic',
    '#world/knowledge/unknown', '#world/knowledge/constructor',
    '#learn', '#learn/constructor', '#learn/industries/', '#learn/skills/trace',
    '#learn/thinking/constructor', '#learn/industries/logistics/extra',
    '#home/unexpected', '#search/unexpected', '#article/comp-data/unexpected', '#domain/ai/how/unexpected',
    '#project', '#project/unknown', '#project/knowledge-assistant/', '#project/knowledge-assistant/constructor',
    '#project/knowledge-assistant/verification/extra'
  ]) {
    assert.doesNotThrow(() => route(hash), hash);
    assert.equal(route(hash).kind, 'missing', hash);
  }
});

test('从公司知识库项目进入 AI 地图再返回时保留项目阶段与选择', () => {
  const projectHash = '#project/knowledge-assistant/retrieval?retrieval=keyword&context=full&back=%23home';
  for (const target of ['#map/rag?node=retrieval', '#map/context', '#map/llm', '#map/agent']) {
    const mapRoute = route(withBack(target, projectHash));
    assert.equal(mapRoute.kind, 'map');
    assert.equal(safeBack(mapRoute.q.get('back'), fallback), projectHash);
  }
});

test('公司知识库助手区分过期、对象不符、丢失条件和超出证据', () => {
  const {trace} = sandbox.window.ASSISTANT_CASE;
  const {link} = sandbox.window.ASSISTANT_PROJECT;
  assert.equal(trace({doc:'current'}).result.title, '先修正资料版本');
  assert.equal(trace({retrieval:'current'}).result.title, '先核对适用对象');
  const retrieval = route('#project/knowledge-assistant/retrieval?retrieval=applicable&back=%23home');
  const fragment = route(link('verification', retrieval, {context:'fragment'}));
  assert.equal(trace(Object.fromEntries(fragment.q)).result.title, '先补回完整条款');
  const overclaim = route(link('verification', fragment, {context:'full',answer:'overclaim'}));
  assert.equal(trace(Object.fromEntries(overclaim.q)).result.title, '删除无依据的审批结论');
  const fixed = route(link('verification', overclaim, {answer:'grounded'}));
  const verified = trace(Object.fromEntries(fixed.q));
  assert.equal(verified.result.status, 'pass');
  assert.match(verified.answerText, /周二 17:00/);
  assert.equal(verified.citation, '办公区访客预约规定 B');
  assert.equal(fixed.q.get('back'), '#home');
});

test('评估保留项目基线与自定义用例，并把预期错误和例外分开', () => {
  const {buildCase,baseline,compare,review,presets} = sandbox.window.ASSISTANT_EVAL_DATA;
  const {link} = sandbox.window.ASSISTANT_PROJECT;
  const verification = route('#project/knowledge-assistant/verification?retrieval=current&context=fragment&back=%23home');
  const evalHash = link('comparison',verification,{day:'thursday',expected:'wed',patch:'scope'});
  const evalRoute = route(safeBack(route(withBack('#map/rag?node=evaluation',evalHash)).q.get('back'),fallback));
  assert.equal(evalRoute.tab,'comparison');
  const parameters = Object.fromEntries(evalRoute.q);
  const testCase = buildCase(parameters);
  const config = baseline(parameters);
  assert.equal(testCase.chosen,'wed');
  const [single] = compare([testCase],config,parameters.patch ?? 'scope');
  assert.equal(single.before.diagnosis.step,'retrieval');
  assert.equal(single.after.diagnosis.step,'context');
  const mistaken = buildCase({...parameters,expected:'tue'});
  const exception = presets.find(test=>test.id==='holiday');
  const [fixed,invalid,held] = compare([testCase,mistaken,exception],config,'complete');
  assert.match(fixed.after.answer,/周三 17:00/);
  assert.equal(fixed.after.status,'pass');
  assert.equal(invalid.after.diagnosis.step,'expectation');
  assert.equal(invalid.after.status,'unknown');
  assert.equal(review(exception).action,'human');
  assert.equal(held.after.status,'pass');
  assert.match(held.after.answer,/暂缓/);
});

test('运行练习保留评估结论，并区分定向修复与拦截错误答复', () => {
  const {ASSISTANT_OPS_DATA:ops,ASSISTANT_PROJECT:project,ASSISTANT_EVAL:evaluation} = sandbox.window;
  const comparison = route('#project/knowledge-assistant/comparison?patch=complete&back=%23home');
  const incident = project.link('incident',comparison,{release:'d',fault:'cache',fix:'reindex'});
  const restored = route(safeBack(route(withBack('#map/rag?node=ingestion',incident)).q.get('back'),fallback));
  assert.equal(restored.tab,'incident');
  assert.equal(evaluation.summary(restored).ready,true);
  const state = Object.fromEntries(restored.q);
  const wrongFix = ops.observe(state,true);
  assert.equal(wrongFix.signal.status,'warn');
  assert.equal(wrongFix.logs.find(log=>log.id==='context').value,'本次跳过');
  const updated = ops.observe({...state,fix:'invalidate'},true);
  assert.equal(updated.signal.status,'pass');
  assert.equal(updated.answer,'周二 16:00');
  const misleading = ops.observe({...state,fault:'generation'});
  assert.equal(misleading.citation,'D');
  assert.equal(misleading.signal.status,'warn');
  const stopped = ops.observe({...state,fault:'generation',fix:'verify'},true);
  assert.equal(stopped.repair.status,'pass');
  assert.equal(stopped.signal.status,'unknown');
  assert.match(stopped.answer,/等待复核/);
});

test('跨领域返回保留检索材料状态与更早的搜索条件', () => {
  const searchHash = '#search?q=' + encodeURIComponent('AI 检索 & 版本');
  const retrievalHash = '#article/retrieval?material=current&back=' + encodeURIComponent(searchHash);
  const informationHash = '#domain/information?from=ai-retrieval&back=' + encodeURIComponent(retrievalHash);
  const bookHash = '#article/info-finding?back=' + encodeURIComponent(informationHash);
  const bookReturn = safeBack(route(bookHash).q.get('back'), fallback);
  assert.equal(bookReturn, informationHash);
  const informationReturn = safeBack(route(bookReturn).q.get('back'), fallback);
  assert.equal(informationReturn, retrievalHash);
  const retrieval = route(informationReturn);
  assert.equal(retrieval.q.get('material'), 'current');
  assert.equal(safeBack(retrieval.q.get('back'), fallback), searchHash);
  assert.equal(route(searchHash).q.get('q'), 'AI 检索 & 版本');
});

test('返回目标限制为本站阅读路径，不接受外部地址或脚本地址', () => {
  for (const value of [
    'https://example.com/#home', '//example.com/#home', 'javascript:alert(1)',
    'data:text/html,test', '/index.html', 'https://example.com', '#https://example.com',
    '#domain/unknown', '#not-a-route', undefined, null, ''
  ]) assert.equal(safeBack(value, fallback), fallback, String(value));
  for (const value of ['#home', '#domain/ai/how', '#world/knowledge/learning-systems', '#search?q=AI', '#learn/thinking/trace?case=logistics']) {
    assert.equal(safeBack(value, fallback), value);
  }
});

test('旧 AI 主题与阅读路线交还原路由，避免新模块吞掉已存在入口', () => {
  for (const hash of ['#topic/source-validity', '#area/system', '#guide/0', '#records', '#questions']) {
    assert.equal(route(hash), null, hash);
  }
});
