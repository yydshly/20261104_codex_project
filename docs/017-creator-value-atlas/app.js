(() => {
  "use strict";
  const data = window.ATLAS_DATA;
  const study = window.INDIE_STUDY;
  const indieWorkCount = study.authors.reduce((sum, author) => sum + author.works.length, 0);
  const indieChineseCount = study.authors.filter((author) => (author.language || "英文").includes("中文")).length;
  const main = document.getElementById("content");
  const dialog = document.getElementById("detail-dialog");
  const storageKey = "creator-value-atlas.saved.v1";
  const soloKey = "creator-value-atlas.solo-release.v1";
  const solo = study.publishing.solo;
  const soloTaskIds = new Set(solo.phases.flatMap((phase) => phase.tasks.map((task) => task.id)));
  const viewNames = {
    overview: "研究总览",
    indie: "独立游戏专题",
    publishing: "发行与商业化",
    platforms: "平台地图",
    domains: "领域导航",
    creators: "创作者索引",
    value: "价值判断",
    product: "产品分析",
    sources: "来源与方法",
  };
  const state = {
    view: "overview",
    goal: "观察趋势",
    platformPurpose: "",
    platformMarket: "",
    domainQuery: "",
    sourceQuery: "",
    sourceType: "",
    indiePath: "first",
    indieStage: "scope",
    indieQuery: "",
    indieArea: "",
    indieGroup: "",
    indieLanguage: "",
    publishingTab: "comparison",
    soloDraft: { ...solo.defaults, completed: new Set() },
    soloStorageAvailable: true,
    compare: new Set(),
    saved: new Set(),
    storageAvailable: true,
  };
  const defaultFilters = () => ({
    query: "",
    domain: "",
    platform: "",
    purpose: "",
    language: "",
    verified: false,
    saved: false,
  });
  state.filters = defaultFilters();
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const platformName = (id) =>
    data.platforms.find((platform) => platform.id === id)?.name || id;
  const tag = (text, color = "") =>
    `<span class="tag ${color}">${escape(text)}</span>`;
  const external = (url, title, className = "") =>
    `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" class="${className}">${escape(title)}</a>`;
  const sectionHead = (title, description = "", action = "") =>
    `<div class="section-heading"><div><h2>${title}</h2>${description ? `<p>${description}</p>` : ""}</div>${action}</div>`;
  const pageHead = (label, title, text, extra = "") =>
    `<div class="page-head"><p class="eyebrow">${label}</p><div class="page-title-row"><div><h1>${title}</h1><p>${text}</p></div>${extra}</div></div>`;
  const routeLink = (view, params = {}) =>
    `#${view}${Object.keys(params).length ? `?${new URLSearchParams(params)}` : ""}`;
  const purposeButtons = (selected, action, includeAll = true) =>
    `${includeAll ? `<button class="purpose-button" data-action="${action}" data-value="" aria-pressed="${selected === ""}">全部用途</button>` : ""}${data.purposes.map((purpose) => `<button class="purpose-button" data-action="${action}" data-value="${purpose}" aria-pressed="${selected === purpose}">${purpose}</button>`).join("")}`;
  const select = (label, field, options, value) =>
    `<label class="select-wrap"><span>${label}</span><select data-filter="${field}" aria-label="${label}"><option value="">全部${label}</option>${options
      .map((option) => {
        const item =
          typeof option === "string"
            ? { value: option, label: option }
            : option;
        return `<option value="${escape(item.value)}" ${value === item.value ? "selected" : ""}>${escape(item.label)}</option>`;
      })
      .join("")}</select></label>`;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(saved))
      state.saved = new Set(
        saved.filter((id) =>
          data.creators.some((creator) => creator.id === id),
        ),
      );
  } catch {
    state.storageAvailable = false;
  }

  try {
    const draft = JSON.parse(localStorage.getItem(soloKey) || "null");
    if (draft && typeof draft === "object") {
      if (typeof draft.project === "string") state.soloDraft.project = draft.project.slice(0, 80);
      if (Number.isInteger(draft.cashBudget) && draft.cashBudget >= 0 && draft.cashBudget <= 100000)
        state.soloDraft.cashBudget = draft.cashBudget;
      if (Number.isFinite(draft.weeklyHours) && draft.weeklyHours >= 0.5 && draft.weeklyHours <= 40)
        state.soloDraft.weeklyHours = draft.weeklyHours;
      if (Array.isArray(draft.completed))
        state.soloDraft.completed = new Set(draft.completed.filter((id) => soloTaskIds.has(id)));
    }
  } catch {
    state.soloStorageAvailable = false;
  }

  const allSources = [];
  const addSource = (item) => {
    if (!allSources.some((source) => source.url === item.url))
      allSources.push({ ...item, date: data.meta.date });
  };
  data.sources.forEach(addSource);
  data.platforms.forEach((platform) =>
    addSource({
      id: `platform-${platform.id}`,
      type: platform.id === "blog" ? "作者原文" : "平台说明",
      title: platform.sourceLabel,
      url: platform.source,
      supports: platform.status.includes("待复核")
        ? "本轮正文不可读，保留入口与访问状态。用途为初步编辑判断。"
        : "支持平台形式或相关功能。平台与目的的适配关系为本项目编辑判断。",
      status: platform.status.includes("待复核") ? "待复核" : "已读取",
    }),
  );
  data.creators.forEach((creator) =>
    addSource({
      id: `creator-${creator.id}`,
      type: creator.status === "来源已读" ? "作者原文" : "账号线索",
      title: `${creator.name} · ${creator.status === "来源已读" ? "本人资料与作品入口" : "候选来源"}`,
      url: creator.source,
      supports: creator.summary,
      status: creator.status === "来源已读" ? "已读取" : "待复核",
    }),
  );
  study.authors.forEach((author) => {
    author.works.forEach((work) =>
      addSource({
        id: work.id,
        type: "独立游戏资料",
        title: `${author.name} · ${work.title}`,
        url: work.url,
        supports: `${work.learn} ${work.era}。核对范围为${work.read}。`,
        status: "已读取",
      }),
    );
    if (author.reach)
      addSource({
        id: `reach-${author.id}`,
        type: "频道规模快照",
        title: `${author.name} · YouTube 作者栏`,
        url: author.reach.source,
        supports: `${author.reach.text}。${author.reach.freshness}。读取日为 ${author.reach.observed}。`,
        status: "已读取",
      });
  });
  study.supplements.forEach((item, index) =>
    addSource({
      id: `indie-supplement-${index}`,
      type: "官方配套文档",
      title: item.title,
      url: item.url,
      supports: item.supports,
      status: "已读取",
    }),
  );

  function toast(message) {
    const element = document.getElementById("toast");
    element.textContent = message;
    element.classList.add("visible");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(
      () => element.classList.remove("visible"),
      2600,
    );
  }

  function updateSavedCount() {
    document.getElementById("saved-count").textContent = state.saved.size;
    document.querySelectorAll('[data-action="save"]').forEach((button) => {
      const saved = state.saved.has(button.dataset.id);
      button.setAttribute("aria-pressed", String(saved));
      button.textContent = saved ? "★" : "☆";
      button.setAttribute(
        "aria-label",
        `${saved ? "移出" : "加入"}观察清单 ${data.creators.find((creator) => creator.id === button.dataset.id)?.name || ""}`,
      );
    });
  }

  function toggleSaved(id) {
    const wasSaved = state.saved.has(id);
    if (wasSaved) state.saved.delete(id);
    else state.saved.add(id);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...state.saved]));
      state.storageAvailable = true;
    } catch {
      state.storageAvailable = false;
    }
    updateSavedCount();
    if (state.filters.saved && state.view === "creators")
      updateCreatorResults();
    toast(
      `${wasSaved ? "已移出观察清单" : "已加入观察清单"}${state.storageAvailable ? "" : "，当前浏览器无法持久保存"}`,
    );
  }

  function navigate(view, params = {}) {
    const hash = routeLink(view, params);
    if (location.hash === hash) readRoute();
    else location.hash = hash;
  }

  function readRoute() {
    const [view, query = ""] = location.hash.slice(1).split("?");
    state.view = Object.hasOwn(viewNames, view) ? view : "overview";
    if (state.view === "indie" || state.view === "publishing") {
      const params = new URLSearchParams(query);
      const businessPath = study.paths.find((item) => item.id === "zh-business");
      const path =
        state.view === "publishing"
          ? businessPath
          : study.paths.find((item) => item.id === params.get("path")) || study.paths[0];
      state.indiePath = path.id;
      state.indieStage = path.stages.includes(params.get("stage"))
        ? params.get("stage")
        : path.stages[0];
      state.indieLanguage = ["中文", "英文"].includes(params.get("language"))
        ? params.get("language")
        : "";
      state.indieArea = study.areas.includes(params.get("area"))
        ? params.get("area")
        : "";
      if (state.view === "publishing") {
        state.publishingTab = ["comparison", "plan", "research"].includes(params.get("tab"))
          ? params.get("tab")
          : params.has("stage") || params.has("path") ? "research" : "comparison";
      }
    }
    if (state.view === "creators") {
      const params = new URLSearchParams(query);
      state.filters = {
        ...defaultFilters(),
        domain: params.get("domain") || "",
        platform: params.get("platform") || "",
        purpose: params.get("purpose") || "",
        language: params.get("language") || "",
        query: params.get("query") || "",
        saved: params.get("saved") === "1",
        verified: params.get("verified") === "1",
      };
    }
    document.getElementById("sidebar").classList.remove("open");
    document
      .getElementById("menu-button")
      .setAttribute("aria-expanded", "false");
    render();
    window.scrollTo(0, 0);
  }

  function heroGraphic() {
    return `<figure class="research-guide"><a href="assets/research-goal-map-v2-20261121.png" target="_blank" rel="noopener" aria-label="查看完整研究目标与成果关系图"><img src="assets/research-goal-map-v2-20261121.png" width="3600" height="5384" alt="研究目标与成果关系图：从平台、领域和博主整理的产品问题出发，以独立游戏为样板，连接已有资料、学习经验用途、推广合作缺口与验证方向"></a><figcaption>研究目标与成果关系图 · 使用已生成的新版原图<br><a href="assets/research-goal-map-v2-20261121.png" target="_blank" rel="noopener">查看高清原图</a> · <a href="assets/research-goal-map-v2-20261121.svg" target="_blank" rel="noopener">查看矢量版</a></figcaption></figure>`;
  }

  function overview() {
    const verified = data.creators.filter(
      (creator) => creator.status === "来源已读",
    ).length;
    return `<section class="hero research-hero"><div><p class="eyebrow">CREATOR INTELLIGENCE · RESEARCH</p><h1>从创作者信息，<br>到<span>有依据的选择。</span></h1><p>我们从 Monid 相关采集场景出发，研究公开博主信息怎样经过分类、作品核对与用途判断，帮助人找资料、选作者、学习和研究，并检验推广合作与产品化的可能性。</p><p class="research-hero-scope">独立游戏是第一个深入样板。制作资料、发行复盘和执行计划，是这个样板里的应用延伸。</p><div class="hero-actions"><a class="button lime" href="#platforms">探索平台与领域</a><a class="button secondary" href="#indie">进入独立游戏样板</a></div></div>${heroGraphic()}</section>
      ${sectionHead("我们的研究内容、价值与意义", "先读研究主线，再按具体任务进入资料；事实、编辑判断与待验证项分别保留。")}
      <div class="grid three research-summary"><article class="card"><span class="fact-label">研究内容</span><h2>信息怎样变成有用的选择</h2><p>按平台与细分领域组织作者和代表作品，记录擅长方向、关注理由、来源与使用顺序。体量、专业度、受众匹配和合作效果分别看证据。</p><p>独立游戏样板进一步连接中文资料、真实发行案例、成本横比和单人计划。</p></article><article class="card"><span class="fact-label">研究价值</span><h2>让资料回答一个具体问题</h2><p>平台地图回答“去哪里找”，作者与作品回答“找谁、看什么”，学习路线与案例对比回答“如何学习、怎样借鉴”。</p><p>潜在产品价值来自减少筛选和核对工作、保留依据并持续更新，需要通过实际使用验证。</p></article><article class="card"><span class="fact-label">对我们的意义</span><h2>积累可回查的判断与方法</h2><p>把零散收藏变成能反复使用的研究库，帮助我们选择学习材料、理解制作与经营的取舍，再按自己的问题形成行动。</p><p>同时用一个细分样板检验信息产品的用途、维护投入和付费可能，为后续扩展提供依据。</p></article></div>
      <div class="note amber research-gap"><strong>已有成果与下一步缺口</strong><p>当前更完整的是学习与经验研究。推广匹配仍需系统补齐同类型评测、实况作者的近期内容、受众、公开联系入口与可确认的合作条件；现有发行经验作者不能直接视为推广候选。真实推广效果、付费需求和盈利均待验证。</p><a class="text-link" href="#product">阅读产品假设与验证方向</a></div>
      <div class="metric-strip"><div class="metric"><strong>${data.platforms.length}</strong><span>平台与分发入口</span><small>中文、国际与跨语言</small></div><div class="metric"><strong>${data.domains.length}</strong><span>一级领域</span><small>可沿细分主题继续扩展</small></div><div class="metric"><strong>${data.creators.length}</strong><span>创作者研究样本</span><small>${verified} 位来源已读 · ${data.creators.length - verified} 位待复核</small></div><div class="metric"><strong>${allSources.length}</strong><span>去重来源</span><small>保留访问状态与整理日期</small></div></div>
      <article class="indie-entry"><div><span class="fact-label">第一个领域样板 · 独立游戏</span><h2>用一个具体领域，检验整理是否能帮助学习与判断。</h2><p>${study.authors.length} 位作者（含 ${indieChineseCount} 位中文作者）、${indieWorkCount} 条代表资料、${study.paths.length} 条学习路线。按玩法、程序、美术、声音与制作发行找到作品和练习。</p></div><a class="button" href="#indie">进入独立游戏专题</a></article>
      ${sectionHead("先确定目的，再寻找入口", "同一个创作者，对不同任务有不同价值。")}
      <div class="chip-row">${purposeButtons(state.goal, "goal", false)}</div><div id="goal-result">${goalPanel()}</div>
      ${sectionHead("把四层信息连接起来", "每一层都保留“为什么选它”的依据。")}
      <div class="journey"><button data-action="navigate" data-target="platforms"><span class="step-label">⌘</span><h3>选择平台</h3><small>这个目的，去哪里找？</small></button><button data-action="navigate" data-target="domains"><span class="step-label">▦</span><h3>细分领域</h3><small>问题属于哪个具体方向？</small></button><button data-action="navigate" data-target="creators"><span class="step-label">◉</span><h3>发现作者</h3><small>谁有相关作品与经验？</small></button><button data-action="navigate" data-target="value"><span class="step-label">◇</span><h3>核对价值</h3><small>证据支持哪一种用途？</small></button></div>
      <div class="grid two"><article class="card"><span class="fact-label">讨论形成的判断框架</span><h2>体量与专业程度分别记录</h2><p>大博主可能专注一个领域，小博主也可能跨主题。关注规模、内容深度、受众匹配与合作效果各自需要证据。</p><a class="text-link" href="#value">查看四象限与证据要求</a></article><article class="card"><span class="fact-label">产品价值的判断</span><h2>让资料帮助完成具体任务</h2><p>从信息导航、细分研究到合作服务，收费依据分别是筛选时间、判断质量与执行成果。Monid 可作为后续采集工具。</p><a class="text-link" href="#product">查看产品路径与验证条件</a></article></div>
      ${sectionHead("从原文开始的样本", "目的性选样，当前偏向技术、教育与商业领域。", '<a class="text-link" href="#creators">查看完整索引</a>')}
      <div class="grid creator-grid">${["ruan", "redblob", "lenny"]
        .map((id) =>
          creatorCard(
            data.creators.find((creator) => creator.id === id),
            false,
          ),
        )
        .join("")}</div>
      <div class="note">资料整理日期为 ${data.meta.date}。独立游戏专题补充了 3 个大众频道的非实时订阅快照，其他体量、受众、报价与成交效果待核。用途标签和关注理由为编辑判断，领域覆盖缺口在导航中保留。</div>`;
  }

  function indieWorkLink(id) {
    for (const author of study.authors) {
      const work = author.works.find((item) => item.id === id);
      if (work)
        return `<li><span>${escape(author.name)}</span>${external(work.url, work.title)}<small>${escape(work.format)} · ${escape(work.access)} · ${escape(work.era)}</small></li>`;
    }
    const document = study.supplements.find((item) => item.id === id);
    return document
      ? `<li><span>现行官方文档</span>${external(document.url, document.title)}<small>${escape(document.supports)}</small></li>`
      : "";
  }

  function indieLesson() {
    const stage = study.stages.find((item) => item.id === state.indieStage);
    return `<span class="fact-label">${escape(stage.prerequisite)}</span><h2>${escape(stage.title)}</h2><div class="lesson-deliverable"><span>这一关做什么</span><p>${escape(stage.task)}</p></div><h3>阅读入口 · 按顺序，支线按需选择</h3><ol class="reading-links">${stage.reading.map(indieWorkLink).join("")}</ol><div class="lesson-done"><h3>完成时应该能看到</h3><p>${escape(stage.done)}</p></div><p class="lesson-later">${escape(stage.later)}</p><div class="chip-row">${stage.authors
      .map((id) => {
        const author = study.authors.find((item) => item.id === id);
        return `<button class="purpose-button" data-action="detail" data-id="${id}">${escape(author.name)}</button>`;
      })
      .join("")}</div>`;
  }

  function syncIndieRoute() {
    const params = { path: state.indiePath, stage: state.indieStage };
    if (state.indieLanguage) params.language = state.indieLanguage;
    if (state.indieArea) params.area = state.indieArea;
    if (state.view === "publishing") params.tab = "research";
    history.replaceState(null, "", routeLink(state.view === "publishing" ? "publishing" : "indie", params));
  }

  function indiePathPanel() {
    const path = study.paths.find((item) => item.id === state.indiePath);
    return `<p class="indie-path-note">${escape(path.description)}</p><div class="indie-path-layout"><div class="indie-stages" aria-label="学习阶段">${path.stages
      .map((id, index) => {
        const stage = study.stages.find((item) => item.id === id);
        return `<button data-action="indie-stage" data-value="${id}" aria-pressed="${state.indieStage === id}"><span>${index + 1}</span><div>${escape(stage.label)}<small>${escape(stage.prerequisite)}</small></div></button>`;
      })
      .join(
        "",
      )}</div><article class="indie-lesson" id="indie-lesson">${indieLesson()}</article></div>`;
  }

  function indieAuthorCard(author) {
    return `<article class="card indie-author"><div class="card-head"><span class="avatar" style="--avatar-color:${author.color}">${escape(author.initials)}</span><div><h3>${escape(author.name)}</h3><p>${escape(author.area)} · ${escape(author.level)}</p></div><button class="bookmark" data-action="save" data-id="${author.id}" aria-pressed="${state.saved.has(author.id)}" aria-label="加入观察清单 ${escape(author.name)}">${state.saved.has(author.id) ? "★" : "☆"}</button></div><div class="chip-row">${tag(author.language || "英文", "blue")}${tag(author.role || author.group, "green")}${author.specialties.map((item) => tag(item)).join("")}</div><p class="indie-why">${escape(author.why)}</p><div class="indie-first"><span>从这份资料开始</span>${external(author.works[0].url, author.works[0].title)}<small>${escape(author.works[0].format)} · ${escape(author.works[0].access)}</small></div><p class="indie-reading-order">${escape(author.order)}</p><div class="card-footer"><span>${author.reach ? escape(author.reach.text) : "专题聚焦 · 体量待核"}</span><button class="text-button" data-action="detail" data-id="${author.id}">打开学习卡</button></div></article>`;
  }

  function publishingWork(id, label) {
    const work = study.authors.flatMap((author) => author.works).find((item) => item.id === id)
      || study.supplements.find((item) => item.id === id);
    return work ? external(work.url, label || work.title) : "";
  }

  function publishingCaseCard(item) {
    const author = study.authors.find((person) => person.id === item.author);
    return `<article class="card publishing-case" id="case-${item.id}">
      <div class="chip-row">${tag(item.perspective, "green")}${tag(item.period)}</div>
      <h3>${escape(item.title)}</h3><p class="muted">${escape(author.name)} · ${escape(author.role)}</p>
      <p>${escape(item.summary)}</p>
      <div class="case-facts">${item.facts.map((fact) => `<div><strong>${escape(fact.value)}</strong><span>${escape(fact.label)}</span>${publishingWork(fact.work, "核对原文")}</div>`).join("")}</div>
      <p class="case-lesson">${escape(item.lesson)}</p>
      <details><summary>查看具体行动、限制与待验证问题</summary><h4>实际记录的行动</h4><ul>${item.actions.map((action) => `<li>${escape(action)}</li>`).join("")}</ul><div class="note amber">${escape(item.limit)}</div><h4>回到你的项目</h4><ul>${item.questions.map((question) => `<li>${escape(question)}</li>`).join("")}</ul></details>
      <div class="card-footer"><span>历史案例 · 公开数字为作者自述</span><button class="text-button" data-action="detail" data-id="${author.id}">看资料与学习顺序</button></div>
    </article>`;
  }

  function soloRefs(ids) {
    return `<div class="inline-links solo-refs">${ids.map((id) => publishingWork(id)).join("")}</div>`;
  }

  function soloComparison() {
    const fields = [
      ["团队与条件", "team"], ["推广动作", "method"], ["公开现金口径", "cash"],
      ["时间与人力", "time"], ["单人怎么借用", "reuse"], ["避坑与限制", "pitfall"],
    ];
    return `<section class="indie-banner solo-intro"><div><span class="eyebrow">单人 · 低预算 · 从五个真实案例提炼</span><h2>一组物料，一批试玩，<br>一个主渠道，留出修复时间。</h2><p>${escape(solo.conclusion)}</p></div></section>
      <div class="note">“单人怎么借用”与下方方法优先级是本项目的编辑判断；案例中的事实、费用和结果仍按各自来源理解。历史开销不代表当前报价，未披露的字段保持未知。</div>
      ${sectionHead("五个案例横向对比", "按相同维度看方法、现金、人力和取舍。表格可横向滚动；窄屏可展开下方的逐案阅读。")}
      <div class="table-wrap solo-comparison-wrap" tabindex="0" role="region" aria-label="五案例横向对比表，可横向滚动"><table class="solo-comparison-table"><caption>历史记录与本项目对单人适配的判断</caption><thead><tr><th scope="col">案例与来源</th>${fields.map(([name]) => `<th scope="col">${name}</th>`).join("")}</tr></thead><tbody>${solo.comparisons.map((row) => {
        const item = study.publishing.cases.find((item) => item.id === row.caseId);
        return `<tr><th scope="row">${escape(item.title)}<small>${escape(item.period)}</small><div class="inline-links">${row.works.map((id, index) => publishingWork(id, `原文 ${index + 1}`)).join("")}</div></th>${fields.map(([, key]) => `<td>${escape(row[key])}</td>`).join("")}</tr>`;
      }).join("")}</tbody></table></div>
      <details class="solo-case-reader"><summary>逐个阅读五份对比（窄屏也适用）</summary><div class="grid two">${solo.comparisons.map((row) => {
        const item = study.publishing.cases.find((item) => item.id === row.caseId);
        return `<article class="card"><h3>${escape(item.title)}</h3><p class="muted">${escape(item.period)}</p><dl class="solo-dl">${fields.map(([name, key]) => `<dt>${name}</dt><dd>${escape(row[key])}</dd>`).join("")}</dl>${soloRefs(row.works)}</article>`;
      }).join("")}</div></details>
      ${sectionHead("适合单人的方法，按投入顺序做", "下面的 3–5 位、10 个候选等是起步批次建议，不是成功阈值或平台门槛。自制不新增现金的前提是已有可用工具和合法素材。")}
      <div class="grid two">${solo.methods.map((method) => `<article class="card"><div class="chip-row">${tag(method.priority, "green")}</div><h3>${escape(method.name)}</h3><p>${escape(method.action)}</p><dl class="solo-dl"><dt>现金</dt><dd>${escape(method.cash)}</dd><dt>时间</dt><dd>${escape(method.time)}</dd><dt>检查什么</dt><dd>${escape(method.observe)}</dd></dl><details><summary>案例与规则依据</summary>${soloRefs(method.evidence)}</details></article>`).join("")}</div>
      ${sectionHead("低预算最容易漏掉的坑", "把经历转换成要检查的事项，不能把一次成功或失败当作因果证明。")}
      <div class="grid two">${solo.pitfalls.map((pitfall) => `<article class="card"><h3>${escape(pitfall.title)}</h3><p>${escape(pitfall.text)}</p><details><summary>回到依据</summary>${soloRefs(pitfall.refs)}</details></article>`).join("")}</div>
      <article class="indie-entry"><div><h2>把取舍落实为一份执行清单。</h2><p>12 周发行准备＋上线后 30 天，包含预算、每周时间、24 项任务、检查标准与联系模板。</p></div><a class="button" href="#publishing?tab=plan">打开单人发行计划</a></article>`;
  }

  function serializeSoloDraft() {
    return {
      project: state.soloDraft.project,
      cashBudget: state.soloDraft.cashBudget,
      weeklyHours: state.soloDraft.weeklyHours,
      completed: [...state.soloDraft.completed].sort(),
    };
  }

  function persistSoloDraft() {
    try {
      localStorage.setItem(soloKey, JSON.stringify(serializeSoloDraft()));
      state.soloStorageAvailable = true;
    } catch {
      state.soloStorageAvailable = false;
    }
  }

  function soloBudgetSummary() {
    const { cashBudget, weeklyHours, project } = state.soloDraft;
    const clarity = Math.floor(cashBudget * 0.4);
    const experiment = Math.floor(cashBudget * 0.2);
    const allocations = [clarity, experiment, cashBudget - clarity - experiment];
    const beforeHours = solo.phases.filter((phase) => !phase.after).reduce((sum, phase) => sum + phase.hours, 0);
    const capacity = solo.weeksBeforeLaunch * weeklyHours;
    const difference = Math.round((capacity - beforeHours) * 10) / 10;
    return `<p class="solo-setting-summary">${escape(project || solo.defaults.project)} · 推广现金上限 ¥${cashBudget} · 每周 ${weeklyHours} 小时</p>
      <div class="grid three solo-budget-grid">${solo.budget.allocations.map((item, index) => `<article class="card"><span class="fact-label">${escape(item.name)}</span><strong class="solo-money">¥${allocations[index]}</strong><p>${escape(item.use)}</p></article>`).join("")}</div>
      <div class="note ${difference < 0 ? "amber" : ""}">发行前清单给推广工作预留 ${beforeHours} 小时；以当前每周上限可安排 ${capacity} 小时。${difference < 0 ? `相差约 ${Math.abs(difference)} 小时，需减少内容频率、取消可选活动或顺延阶段。保留试玩、版本检查和必要沟通。` : `约 ${difference} 小时可留作缓冲。`}这些是本项目的工作预算，未经实测；游戏开发和代码修复工时另排，上线后还预留 ${solo.phases.filter((phase) => phase.after).reduce((sum, phase) => sum + phase.hours, 0)} 小时做记录与复盘，日常维护按实际增加。</div>
      <div class="table-wrap"><table><thead><tr><th>本周时间</th><th>分配参考</th><th>具体做什么</th></tr></thead><tbody>${solo.weeklyRoutine.map((item) => `<tr><td>${escape(item.name)}</td><td>${Math.round(weeklyHours * item.share * 60)} 分钟</td><td>${escape(item.action)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function soloProgressText() {
    return `已勾选 ${state.soloDraft.completed.size} / ${soloTaskIds.size} 项任务`;
  }

  function updateSoloProgress() {
    const counter = document.getElementById("solo-progress-count");
    if (counter) counter.textContent = soloProgressText();
    for (const phase of solo.phases) {
      const counter = document.querySelector(`[data-solo-phase="${phase.id}"]`);
      if (counter) counter.textContent = `${phase.tasks.filter((task) => state.soloDraft.completed.has(task.id)).length} / ${phase.tasks.length}`;
    }
    const note = document.getElementById("solo-storage-note");
    if (note) note.textContent = state.soloStorageAvailable
      ? "设置与勾选保存在当前浏览器；导出计划可另存快照。勾选表示自己的记录，不代表平台审核已通过。"
      : "当前浏览器无法持久保存，设置与勾选暂留在本页；请导出计划保留快照。";
  }

  function soloPlan() {
    return `<div class="note"><strong>使用前提</strong><p>${escape(solo.assumption)}</p></div><div class="link-actions"><button class="button secondary" data-action="jump-solo-tasks">跳到执行清单 ↓</button></div>
      ${sectionHead("先给自己设置上限", "推广资金与上架、开发、生活费用分列。默认值只是模板，可改为零推广现金。")}
      <div class="card solo-settings" id="solo-settings"><label>项目名称<input type="text" data-solo-field="project" maxlength="80" required value="${escape(state.soloDraft.project)}"></label><label>新增推广现金上限（元）<input type="number" data-solo-field="cashBudget" min="0" max="100000" step="1" required value="${state.soloDraft.cashBudget}"></label><label>每周推广时间上限（小时）<input type="number" data-solo-field="weeklyHours" min="0.5" max="40" step="0.5" required value="${state.soloDraft.weeklyHours}"></label></div>
      <p class="muted">${escape(solo.budget.note)}</p><div id="solo-budget-summary">${soloBudgetSummary()}</div>
      ${sectionHead("这三类费用另外记", "额度分配不会自动扣款，也不能代替具体询价与成本记录。")}
      <div class="grid three">${solo.budget.separate.map((item) => `<article class="card"><h3>${escape(item.name)}</h3><p>${escape(item.detail)}</p>${soloRefs(item.refs)}</article>`).join("")}</div>
      ${sectionHead("按产物和检查标准推进", "每阶段三个具体任务。周数是可调整的准备窗口；审核或核心体验未完成，就顺延。")}
      <div class="solo-progress-bar"><strong id="solo-progress-count" role="status">${soloProgressText()}</strong><button class="button secondary" data-action="export-solo">导出当前执行计划</button></div><p class="storage-note" id="solo-storage-note"></p>
      <div class="solo-phases">${solo.phases.map((phase, index) => `<article class="card solo-phase"><div class="solo-phase-heading"><div><span class="fact-label">${index + 1} / ${escape(phase.window)}</span><h3>${escape(phase.title)}</h3></div><span class="tag" data-solo-phase="${phase.id}">${phase.tasks.filter((task) => state.soloDraft.completed.has(task.id)).length} / ${phase.tasks.length}</span></div><p class="muted">推广工作预算 ${phase.hours} 小时 · 代码修复等制作工作另排</p><ul class="solo-tasks">${phase.tasks.map((task) => `<li><label><input type="checkbox" data-solo-task="${task.id}" ${state.soloDraft.completed.has(task.id) ? "checked" : ""}><span>${escape(task.text)}</span></label></li>`).join("")}</ul><div class="solo-phase-output"><strong>留下的产物</strong><p>${escape(phase.output)}</p><strong>何时继续／何时调整</strong><p>${escape(phase.gate)}</p></div><details><summary>案例与官方依据</summary>${soloRefs(phase.refs)}</details></article>`).join("")}</div>
      ${sectionHead("一封能改写使用的联系模板", "先填写具体匹配理由与真实版本信息，再自行发送；Key 与试玩访问按当前官方规则处理。")}
      <pre class="solo-contact-template">${escape(solo.contactTemplate)}</pre>
      ${sectionHead("每次执行留什么记录", "这些字段随计划一起导出，实际数据由执行时补充。")}
      <div class="grid two">${solo.records.map((record) => `<article class="card"><h3>${escape(record.title)}</h3><ul>${record.columns.map((column) => `<li>${escape(column)}</li>`).join("")}</ul></article>`).join("")}</div>
      ${sectionHead("排期前，核对这些当前条件", "读取日期 2026-11-21。规则可能更新，实际执行前以对应应用后台和现行官方页面为准。")}
      <div class="grid two">${solo.rules.map((rule) => `<article class="card"><h3>${escape(rule.title)}</h3><p>${escape(rule.detail)}</p>${soloRefs(rule.refs)}</article>`).join("")}</div>`;
  }

  function publishing() {
    const selected = state.publishingTab;
    const tabs = [["comparison", "五案例横向对比"], ["plan", "单人发行计划"], ["research", "案例与原文"]];
    const extra = selected === "plan"
      ? '<button class="button secondary" data-action="export-solo">导出当前执行计划</button>'
      : '<button class="button secondary" data-action="export-publishing">导出发行研究</button>';
    return `${pageHead("SOLO INDIE PUBLISHING", "一个人做游戏，<br>把发行安排到能执行。", "把五个中文亲历案例的推广方法、现金与时间成本放在一起，再按单人能承担的范围编排执行计划。", extra)}
      <div class="publishing-tabs" role="group" aria-label="发行研究内容">${tabs.map(([id, title]) => `<button class="purpose-button" data-action="publishing-tab" data-value="${id}" aria-pressed="${selected === id}">${title}</button>`).join("")}</div>
      ${selected === "comparison" ? soloComparison() : selected === "plan" ? soloPlan() : publishingResearch()}`;
  }

  function exportSoloPlan() {
    const inputs = [...document.querySelectorAll("[data-solo-field]")];
    if (inputs.some((input) => !input.reportValidity())) return;
    const referenceIds = new Set([
      ...solo.comparisons.flatMap((item) => item.works),
      ...solo.methods.flatMap((item) => item.evidence),
      ...solo.pitfalls.flatMap((item) => item.refs),
      ...solo.phases.flatMap((item) => item.refs),
      ...solo.rules.flatMap((item) => item.refs),
    ]);
    const references = [
      ...study.authors.flatMap((author) => author.works),
      ...study.supplements,
    ].filter((item) => referenceIds.has(item.id));
    download({
      ...solo,
      settings: serializeSoloDraft(),
      completionMeaning: "勾选表示用户自己的任务记录，不代表平台审核已通过或预算已经支出。",
      cases: study.publishing.cases,
      references,
      exportedAt: new Date().toISOString(),
    }, `solo-indie-release-plan-${solo.date}.json`);
  }

  function publishingResearch() {
    const business = study.publishing;
    const authors = business.authorIds.map((id) => study.authors.find((author) => author.id === id));
    return `<section class="indie-banner"><div><span class="eyebrow">${authors.length} 位作者 · ${business.cases.length} 个主案例 · ${study.paths.find((path) => path.id === "zh-business").stages.length} 步学习</span><h2>受众与卖点 → 物料与 Demo<br>渠道与分工 → 定价、结算与复盘</h2><p>读项目、做小练习、留观测记录。成功经验与未达预期的结果一起对照。</p></div><div class="indie-stats"><div><strong>${authors.length}</strong><span>亲历项目作者</span></div><div><strong>${business.cases.length}</strong><span>主要项目案例</span></div><div><strong>${authors.reduce((sum, author) => sum + author.works.length, 0)}</strong><span>代表资料</span></div></div></section>
      <div class="note">${escape(business.scope)}</div>
      ${sectionHead("按现在的问题决定学习顺序", "先做眼前一项。阶段任务与完成标准由本项目编排，原文经验与实际验证分别记录。")}
      <div id="indie-path-panel">${indiePathPanel()}</div>
      ${sectionHead("五个案例，放在同一套问题下看", "每个数字保留年份、平台、观察窗口与口径。展开卡片查看行动、限制及下一步该问什么。", '<a class="text-link" href="#creators?domain=%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91&language=%E4%B8%AD%E6%96%87&purpose=%E5%95%86%E4%B8%9A%E7%A0%94%E7%A9%B6">在总索引中对照这批作者</a>')}
      <div class="grid two" id="publishing-cases">${business.cases.map(publishingCaseCard).join("")}</div>
      ${sectionHead("商业化先把收入来源与新增工作写清", "这里列候选路径与研究问题，选择取决于作品、玩家、平台和团队能力。")}
      <div class="table-wrap"><table><thead><tr><th>研究对象</th><th>收入来自哪里</th><th>需要承担什么</th><th>先读与先验证</th></tr></thead><tbody>${business.models.map((model) => `<tr><td>${escape(model.name)}</td><td>${escape(model.source)}</td><td>${escape(model.cost)}</td><td>${publishingWork(model.work)}<p>${escape(model.check)}</p></td></tr>`).join("")}</tbody></table></div>
      ${sectionHead("怎样记录一次推广，才能留给下一次用", "把访问、体验、兴趣、购买和到款分开。没有原始记录的字段保留未知。")}
      <div class="grid two">${business.measures.map((measure) => `<article class="card"><h3>${escape(measure.name)}</h3><p>${escape(measure.keep)}</p><p class="muted">${escape(measure.caution)}</p></article>`).join("")}</div>
      <div class="note amber"><strong>三个常见的混算</strong><p>愿望单存量与同期总销量不能直接拼成转化率。销售额与团队到款不能当作个人净利润。自然传播、活动和付费渠道同时发生时，整体上涨不能全部归给其中一个动作。</p></div>
      ${sectionHead("原文与现行规则一起看", "旧案例用于理解经历，执行活动、定价和统计时回到官方文档。读取日期 2026-11-21。")}
      <div class="grid two">${business.documentIds.map((id) => study.supplements.find((item) => item.id === id)).map((document) => `<article class="card"><h3>${external(document.url, document.title)}</h3><p>${escape(document.supports)}</p></article>`).join("")}</div>
      ${sectionHead("带着问题关注这五位作者", "作品与本人复盘是收录依据；作者卡保留具体来源、学习前提与适用限制。")}
      <div class="grid two">${authors.map(indieAuthorCard).join("")}</div>
      <div class="link-actions"><a class="button secondary" href="#indie?path=zh-business&language=%E4%B8%AD%E6%96%87&area=%E5%88%B6%E4%BD%9C%E4%B8%8E%E5%8F%91%E8%A1%8C">查看中文制作与发行作者</a><a class="text-link" href="#sources">完整来源与核对方法</a></div>`;
  }

  function indie() {
    return `${pageHead("INDIE GAME FIELD STUDY", "做出一款小作品，每一步知道该看谁。", "以公开作品为收录依据，连接擅长方向、代表资料、阅读顺序和可检验的练习。聚焦 PC 小型独立游戏与 2D 原型，新增中文跟练与作品案例。", '<button class="button secondary" data-action="export-indie">导出独立游戏专题</button>')}
      <section class="indie-banner"><div><span class="eyebrow">先交出一个可玩的版本</span><h2>定范围 · 做闭环 · 调手感<br>做视觉 · 加声音 · 测试与发布</h2><p>把作者放回制作任务中，读到具体作品，再带着问题回到自己的项目。</p></div><div class="indie-stats"><div><strong>${study.authors.length}</strong><span>中英文作者</span></div><div><strong>${indieChineseCount}</strong><span>中文作者</span></div><div><strong>${indieWorkCount}</strong><span>代表资料条目</span></div></div></section>
      <div class="note chinese-note"><strong>中文资料从这里开始</strong><p>麦扣适合跟练，凉鞋适合语法与工程专题，Los-muteki 和冯乐乐分别补像素美术与 Shader。叶梓涛、王妙一、高鸣适合研究作品与制作取舍。按作品聚焦收录，中文作者的粉丝量和账号活跃度待核。</p><a class="text-link" href="#indie?path=zh-first&language=%E4%B8%AD%E6%96%87">打开中文路线与 ${indieChineseCount} 位作者 →</a></div>
      <article class="indie-entry"><div><span class="fact-label">继续深化 · 中文发行案例</span><h2>发布、推广与经营，读真实项目的复盘。</h2><p>亚恒、夜神不说话、叶千落、传传与蓝桃游戏：连接代表案例、数据口径与七步学习路线。</p></div><a class="button" href="#publishing">进入发行与商业化</a></article>
      ${sectionHead("选择你现在的起点", "阶段可以点击切换。任务与完成标准由本项目编排，学习时长因基础和范围而异。")}
      <div class="chip-row">${study.paths.map((path) => `<button class="purpose-button" data-action="indie-path" data-value="${path.id}" aria-pressed="${state.indiePath === path.id}">${escape(path.title)}</button>`).join("")}</div><div id="indie-path-panel">${indiePathPanel()}</div>
      ${sectionHead("按当前问题找作者", "按语言、方向和作者入口筛选；学习卡保留两份代表资料、前置知识、学习顺序与适用范围。", '<a class="text-link" href="#creators?domain=%E6%B8%B8%E6%88%8F%E5%BC%80%E5%8F%91">在总索引中对照作者</a>')}
      <div class="filters"><div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" id="indie-search" aria-label="搜索独立游戏作者和资料" placeholder="搜索问题、作者或作品，例如 状态机、像素画、Steam" value="${escape(state.indieQuery)}"></div><div class="filter-line"><span class="filter-label">语言</span>${["", "中文", "英文"].map((language) => `<button class="purpose-button" data-action="indie-language" data-value="${language}" aria-pressed="${state.indieLanguage === language}">${language || "全部语言"}</button>`).join("")}</div><div class="filter-line indie-filter-line"><span class="filter-label">方向</span><button class="purpose-button" data-action="indie-area" data-value="" aria-pressed="${state.indieArea === ""}">全部方向</button>${study.areas.map((area) => `<button class="purpose-button" data-action="indie-area" data-value="${area}" aria-pressed="${state.indieArea === area}">${area}</button>`).join("")}</div><div class="filter-line"><span class="filter-label">入口</span>${["", "大众频道", "专题作者"].map((group) => `<button class="purpose-button" data-action="indie-group" data-value="${group}" aria-pressed="${state.indieGroup === group}">${group || "全部作者"}</button>`).join("")}</div></div><div class="result-bar"><span id="indie-count" role="status"></span><button class="text-button" data-action="reset-indie">重置作者筛选</button></div><div class="grid two" id="indie-authors"></div>
      ${sectionHead("怎样理解这些推荐", "关注理由连接具体作品，传播规模与内容专业度分别记录。")}
      <div class="grid two"><article class="card"><h3>大众频道的规模依据</h3><p>GMTK、Brackeys 和 Sebastian Lague 的作者栏检索快照分别约 174 万、194 万和 140 万订阅。读取日为 ${study.date}，检索标注约两个月前抓取。</p><p>这些数字用于说明大众传播入口，按非实时快照理解。其余作者按作品聚焦收录；“专题作者”不代表粉丝少。中文资料含连续教程与历史作品案例，分别按角色标注。</p><div class="inline-links">${study.authors
        .filter((author) => author.reach)
        .map((author) => external(author.reach.source, author.name))
        .join(
          "",
        )}</div></article><article class="card"><h3>资料与练习的核对范围</h3><p>${study.verification}</p><p>代表资料包括文章、视频、仓库、可操作作品与目录。市场案例保留历史年份，学习顺序与练习结果仍需要实际使用反馈。</p></article></div>
      ${sectionHead("配套文档", "中文教材和现行平台功能各保留自己的版本与出处。")}
      <div class="grid two">${study.supplements.map((item) => `<article class="card"><h3>${external(item.url, item.title)}</h3><p>${escape(item.supports)}</p></article>`).join("")}</div><div class="note">${study.scope} ${study.method}</div>`;
  }

  function updateIndieAuthors() {
    const query = state.indieQuery.trim().toLocaleLowerCase();
    const authors = study.authors.filter(
      (author) =>
        (!state.indieArea || author.area === state.indieArea) &&
        (!state.indieGroup || author.group === state.indieGroup) &&
        (!state.indieLanguage || (author.language || "英文").includes(state.indieLanguage)) &&
        JSON.stringify(author).toLocaleLowerCase().includes(query),
    );
    document.getElementById("indie-count").innerHTML =
      `<strong>${authors.length}</strong> 位匹配作者 / 专题共 ${study.authors.length} 位`;
    document.getElementById("indie-authors").innerHTML = authors.length
      ? authors.map(indieAuthorCard).join("")
      : empty(
          "当前问题暂无匹配作者",
          "调整关键词或方向，查看其他专题资料。",
          "reset-indie",
        );
    updateSavedCount();
  }

  function indieAuthorDetails(author) {
    return `<div class="chip-row">${tag(author.language || "英文", "blue")}${tag(author.role || author.group, "green")}${tag(author.area)}${tag(author.level)}</div><h3>擅长什么</h3><p>${escape(author.specialties.join("、"))}</p><p>${escape(author.engine)}</p><h3>收录依据</h3><p>${escape(author.evidence)} ${external(author.source, "记录来源")}</p><h3>关注理由 · 编辑判断</h3><p>${escape(author.why)}</p><div class="lesson-deliverable"><span>建议学习顺序</span><p>${escape(author.order)}</p></div><p>前置知识 · ${escape(author.prerequisite)}</p><ol class="indie-dossier-works">${author.works.map((work) => `<li><h3>${external(work.url, work.title)}</h3><div class="chip-row">${tag(work.format)}${tag(work.access)}${tag(work.era)}</div><p>${escape(work.learn)}</p><small>核对范围 · ${escape(work.read)}</small></li>`).join("")}</ol><h3>读后做一个练习</h3><p>${escape(author.task)}</p><div class="note amber">${escape(author.caution)}</div><p>${author.reach ? `${escape(author.reach.text)}。${escape(author.reach.freshness)}。读取日 ${author.reach.observed}。${external(author.reach.source, "查看规模来源")}` : "当前关注理由依据专业作品，跨平台体量待核对。"}</p><div class="link-actions">${external(author.home, author.homeLabel || "打开作者入口", "button")}<button class="button secondary" data-action="toggle-detail-save" data-id="${author.id}">${state.saved.has(author.id) ? "移出观察清单" : "加入观察清单"}</button></div>`;
  }

  function goalPanel() {
    const question = data.questions.find((item) => item.goal === state.goal);
    return `<div class="question-box"><span class="fact-label">${question.goal} · 要解决的问题</span><h3>${question.title}</h3><div class="grid two"><ul>${question.criteria.map((item) => `<li>${item}</li>`).join("")}</ul><div><p>${question.example}</p><a class="button secondary small" href="${routeLink("creators", { purpose: question.goal })}">按这个目的查看样本</a></div></div></div>`;
  }

  function platformCard(platform) {
    const sampleCount = data.creators.filter((creator) =>
      creator.platforms.includes(platform.id),
    ).length;
    return `<article class="card platform-card"><div class="card-head"><span class="platform-mark" style="--mark-color:${platform.color}">${platform.mark}</span><div><h3>${platform.name}</h3><p>${platform.market} · ${platform.format}</p></div></div><p class="summary">${platform.summary}</p><div class="chip-row">${platform.purposes.map((purpose) => tag(purpose)).join("")}</div><div class="detail-row"><span>怎样找</span><span>${platform.entry}</span></div><div class="detail-row"><span>看证据</span><span>${platform.evidence}</span></div><details><summary>查看研究范围与来源</summary><p>${platform.caution}</p><p>${external(platform.source, platform.sourceLabel)}</p>${tag(platform.status, platform.status.includes("待复核") ? "amber" : "green")}</details><div class="card-footer"><span>${sampleCount} 位关联样本 · 含候选</span><a href="${routeLink("creators", { platform: platform.id })}">查看样本</a></div></article>`;
  }

  function platforms() {
    return `${pageHead("PLATFORM LANDSCAPE", "为了这件事，去哪里找？", "平台的价值与任务、语言、内容形式有关。以下适配关系是研究性分类，单个平台内仍需逐个作者核查。")}
      <div class="filters"><div class="filter-line"><span class="filter-label">用途</span>${purposeButtons(state.platformPurpose, "platform-purpose")}</div><div class="filter-line"><span class="filter-label">范围</span>${["", "中文", "国际", "跨语言"].map((market) => `<button class="purpose-button" data-action="platform-market" data-value="${market}" aria-pressed="${state.platformMarket === market}">${market || "全部入口"}</button>`).join("")}</div></div>
      <div class="result-bar"><span id="platform-count" role="status"></span><span>按用途筛选 · 每项附入口与证据要求</span></div><div id="platform-results" class="grid two"></div>
      <div class="note">微信公众平台与抖音创作者中心的页面正文本轮未能读取。两项保留为初步分类入口，后续需要直接资料与作者样本补证。</div>`;
  }

  function updatePlatformResults() {
    const filtered = data.platforms.filter(
      (platform) =>
        (!state.platformPurpose ||
          platform.purposes.includes(state.platformPurpose)) &&
        (!state.platformMarket || platform.market === state.platformMarket),
    );
    document.getElementById("platform-count").innerHTML =
      `<strong>${filtered.length}</strong> 个匹配入口 / 共 ${data.platforms.length} 个`;
    document.getElementById("platform-results").innerHTML = filtered.length
      ? filtered.map(platformCard).join("")
      : empty(
          "这个组合暂无平台",
          "调整范围或用途，查看其他内容入口。",
          "reset-platforms",
        );
  }

  function domainCard(domain) {
    const creators = data.creators.filter((creator) =>
      creator.domains.includes(domain.name),
    );
    const verified = creators.filter(
      (creator) => creator.status === "来源已读",
    ).length;
    const platforms = data.platforms.filter((platform) =>
      platform.domains.includes(domain.name),
    );
    return `<article class="card domain-card"><div class="card-head"><h3>${domain.name}</h3><span class="domain-icon">${domain.icon}</span></div><div class="chip-row">${domain.children.map((child) => tag(child)).join("")}</div><p class="domain-desc">${domain.questions[0]}</p><div class="domain-evidence">优先证据 · ${domain.evidence}</div><p class="muted">候选入口 · ${platforms.map((platform) => platform.name).join(" / ") || "待补"}</p>${domain.caution ? `<p>${domain.caution}</p>` : ""}<div class="card-footer"><span>${verified ? `${verified} 位来源已读` : "来源已读样本待补"}${creators.length > verified ? ` · ${creators.length - verified} 位候选` : ""}</span><a href="${routeLink("creators", { domain: domain.name })}">${creators.length ? "查看相关作者" : "查看覆盖缺口"}</a></div></article>`;
  }

  function domains() {
    return `${pageHead("TOPIC TAXONOMY", "沿着问题，把领域分细。", "一个创作者可以属于多个领域。这里先规划 12 个一级领域，再细分为可检索的主题，逐步补充作品与作者。")}
      <div class="flow-banner"><span>科技</span><b>逐层细分</b><span>AI与软件</span><b>进入主题</b><span>大模型实现</span><b>对应任务</b><span>从代码理解模型</span></div>
      <div class="filters"><div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" id="domain-search" aria-label="搜索领域与细分主题" placeholder="搜索领域、细分主题或问题，例如 露营、数学、游戏" value="${escape(state.domainQuery)}"></div></div><div class="result-bar"><span id="domain-count" role="status"></span><span>领域分类为编辑方案 · 样本数由索引计算</span></div><div id="domain-results" class="grid three"></div>`;
  }

  function updateDomainResults() {
    const query = state.domainQuery.trim().toLocaleLowerCase();
    const filtered = data.domains.filter((domain) =>
      JSON.stringify(domain).toLocaleLowerCase().includes(query),
    );
    document.getElementById("domain-count").innerHTML =
      `<strong>${filtered.length}</strong> 个一级领域`;
    document.getElementById("domain-results").innerHTML = filtered.length
      ? filtered.map(domainCard).join("")
      : empty(
          "暂时没有这个主题",
          "可以搜索更上一级领域，后续再补入细分主题。",
          "reset-domains",
        );
  }

  function creatorCard(creator, compare = true) {
    return `<article class="card creator-card"><div class="card-head"><span class="avatar" style="--avatar-color:${creator.color}">${creator.initials}</span><div><h3>${creator.name}</h3><p>${creator.language} · ${creator.kind}</p></div><button class="bookmark" data-action="save" data-id="${creator.id}" aria-label="加入观察清单 ${creator.name}" aria-pressed="${state.saved.has(creator.id)}">${state.saved.has(creator.id) ? "★" : "☆"}</button></div><div class="creator-topic">${creator.topic}</div><p class="summary">${creator.summary}</p><div class="chip-row">${creator.domains.map((domain) => tag(domain)).join("")}${tag(creator.status, creator.status === "来源已读" ? "green" : "amber")}</div><span class="status">${creator.platforms.map(platformName).join(" · ")}</span><div class="card-footer">${compare ? `<label class="check-label"><input type="checkbox" data-compare="${creator.id}" ${state.compare.has(creator.id) ? "checked" : ""}>加入对照</label>` : `<span>${creator.purposes.slice(0, 2).join(" / ")}</span>`}<button class="text-button" data-action="detail" data-id="${creator.id}">查看关注理由</button></div></article>`;
  }

  function creators() {
    const filters = state.filters;
    return `${pageHead("CREATOR INDEX", filters.saved ? "我的观察清单" : "找到作者，也找到关注理由。", "每位作者对应主题、作品入口与证据状态。独立游戏作者附学习卡，体量快照、受众和合作效果分别保留核对范围。", '<button class="button secondary" data-action="export-filtered">导出当前结果</button>')}
      <div class="filters"><div class="filter-line"><div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" id="creator-search" aria-label="搜索创作者" placeholder="搜索作者、主题、作品或关注理由" value="${escape(filters.query)}"></div></div><div class="filter-line">${select(
        "领域",
        "domain",
        data.domains.map((domain) => domain.name),
        filters.domain,
      )}${select(
        "平台",
        "platform",
        data.platforms.map((platform) => ({
          value: platform.id,
          label: platform.name,
        })),
        filters.platform,
      )}${select("用途", "purpose", data.purposes, filters.purpose)}${select("语言", "language", ["中文", "英文"], filters.language)}</div><div class="filter-line"><label class="check-label"><input type="checkbox" data-filter="verified" ${filters.verified ? "checked" : ""}>仅来源已读</label><label class="check-label"><input type="checkbox" data-filter="saved" ${filters.saved ? "checked" : ""}>仅观察清单</label><button class="text-button" data-action="reset-creators">重置筛选</button></div></div>
      <div class="comparison-bar"><span id="comparison-count">已选 ${state.compare.size} 位作者，最多对照 3 位</span><div class="chip-row"><button class="text-button" data-action="clear-compare">清空</button><button class="button small" data-action="compare" ${state.compare.size < 2 ? "disabled" : ""}>对照关注理由</button></div></div>
      <div class="result-bar"><span id="creator-count" role="status"></span><span>整理日期 ${data.meta.date} · 体量以学习卡标注为准</span></div><div id="creator-results" class="grid creator-grid"></div>
      <div class="collection-help"><span class="storage-note">观察清单保存在当前浏览器${state.storageAvailable ? "，导出可留存快照。" : "的会话中，持久存储不可用，请导出留存。"}</span><a class="text-link" href="#sources">查看选样与核对方法</a></div>`;
  }

  function filteredCreators() {
    const filters = state.filters;
    const query = filters.query.trim().toLocaleLowerCase();
    return data.creators.filter((creator) => {
      const searchable = [
        creator.name,
        creator.topic,
        creator.summary,
        creator.why,
        creator.work,
        ...creator.domains,
        ...creator.platforms.map(platformName),
      ]
        .join(" ")
        .toLocaleLowerCase();
      return (
        (!query || searchable.includes(query)) &&
        (!filters.domain || creator.domains.includes(filters.domain)) &&
        (!filters.platform || creator.platforms.includes(filters.platform)) &&
        (!filters.purpose || creator.purposes.includes(filters.purpose)) &&
        (!filters.language || creator.language.includes(filters.language)) &&
        (!filters.verified || creator.status === "来源已读") &&
        (!filters.saved || state.saved.has(creator.id))
      );
    });
  }

  function empty(title, text, reset) {
    return `<div class="empty"><h3>${title}</h3><p>${text}</p><button class="button secondary" data-action="${reset}">重置筛选</button></div>`;
  }

  function updateCreatorResults() {
    const filtered = filteredCreators();
    const readCount = filtered.filter(
      (creator) => creator.status === "来源已读",
    ).length;
    main.querySelector("h1").textContent = state.filters.saved
      ? "我的观察清单"
      : "找到作者，也找到关注理由。";
    document.getElementById("creator-count").innerHTML =
      `<strong>${filtered.length}</strong> 位匹配作者 · ${readCount} 位来源已读`;
    document.getElementById("creator-results").innerHTML = filtered.length
      ? filtered.map((creator) => creatorCard(creator)).join("")
      : empty(
          "当前组合暂无样本",
          "领域规划中的空白会保留。调整筛选，或从领域导航查看后续补采方向。",
          "reset-creators",
        );
    updateCompareBar();
  }

  function syncCreatorRoute() {
    const params = {};
    for (const [key, value] of Object.entries(state.filters)) {
      if (value) params[key] = value === true ? "1" : value;
    }
    history.replaceState(null, "", routeLink("creators", params));
  }

  function updateCompareBar() {
    const count = document.getElementById("comparison-count");
    if (count)
      count.textContent = `已选 ${state.compare.size} 位作者，最多对照 3 位`;
    const button = document.querySelector('[data-action="compare"]');
    if (button) button.disabled = state.compare.size < 2;
  }

  function value() {
    return `${pageHead("VALUE & EVIDENCE", "规模、专业与用途，各自看证据。", "先明确任务，再检查内容是否有帮助。下方四象限只解释分类方式，真实样本的体量在完成同口径核验后再归类。")}
      <div class="matrix-wrap"><div class="matrix" role="img" aria-label="体量与垂直程度为独立维度，形成大体量综合、大体量垂直、小体量综合和小体量垂直四种组合"><span class="axis-y">垂直程度 · 从低到高</span><article class="quadrant"><em>示意 · 小体量 / 高聚焦</em><h3>细分实践者</h3><p>如只讲六角格寻路的开发者。看实现、作品和解释质量。</p></article><article class="quadrant"><em>示意 · 大体量 / 高聚焦</em><h3>领域影响者</h3><p>如广泛传播的数学频道。规模与专业内容可以同时存在。</p></article><article class="quadrant"><em>示意 · 小体量 / 跨主题</em><h3>探索型作者</h3><p>可能记录多种尝试。沿具体作品判断适用价值。</p></article><article class="quadrant"><em>示意 · 大体量 / 跨主题</em><h3>综合传播者</h3><p>可能覆盖多种科技与生活主题。每个主题分别核查。</p></article><span class="axis-x">同一平台、同一日期与口径下的体量 · 从小到大</span></div><div class="analysis-list"><article class="analysis-item"><span class="symbol">◎</span><div><h3>内容聚焦</h3><p>抽样近期作品与代表作品，观察主题持续性、深度与原创贡献。</p></div></article><article class="analysis-item"><span class="symbol">◉</span><div><h3>受众匹配</h3><p>内容主题与受众构成分别核查。画像的来源、权限和估计方法要保留。</p></div></article><article class="analysis-item"><span class="symbol">◇</span><div><h3>合作效果</h3><p>报价、档期、回复和成交需通过沟通或授权数据确认。当前样本均待核。</p></div></article></div></div>
      ${sectionHead("按任务选择证据", "切换用途，查看应补充哪些材料。")}
      <div class="chip-row">${purposeButtons(state.goal, "goal", false)}</div><div id="goal-result">${goalPanel()}</div>
      ${sectionHead("给字段保留自己的口径", "缺失与估计值明确标注，避免生成一个缺乏依据的综合排名。")}
      <div class="table-wrap"><table><thead><tr><th>维度</th><th>记录内容</th><th>如何理解</th></tr></thead><tbody><tr><td>平台体量</td><td>平台、账号、数量、采集日期、原始链接</td><td>跨平台人数不能直接相加。同平台比较也需对齐时间与口径。</td></tr><tr><td>内容表现</td><td>固定窗口的作品数、播放中位数、互动口径</td><td>保留样本量、置顶和异常爆款处理方式，防止单条作品主导判断。</td></tr><tr><td>专业与原创</td><td>代表作品、代码或源文件、引用、勘误</td><td>每个结论连接具体作品，允许多主题和判断修订。</td></tr><tr><td>受众画像</td><td>作者授权数据或第三方估计，方法与日期</td><td>估计数据保留置信与缺失情况，观看人数与粉丝结构分别处理。</td></tr><tr><td>推广成效</td><td>合作条件、成本、链接或优惠码、订单与退款</td><td>明确归因窗口和净额，后续用增量实验检验效果。</td></tr></tbody></table></div><div class="inline-links">${external("https://ads.tiktok.com/resources/help/article/how-to-find-creators-who-work-with-tiktok-one/", "TikTok One 的分维度筛选")}${external("https://help.modash.io/en/articles/13715083-understanding-audience-demographics-and-insights", "受众画像的估计与缺失说明")}</div>`;
  }

  function product() {
    return `${pageHead("PRODUCT THESIS", "把整理，做成有明确用途的产品。", "以下是基于讨论提出的产品假设。现有付费产品证明这类功能已有供给，客户需求、付费意愿与本项目盈利仍需实际验证。")}
      <div class="grid three"><article class="card product-card"><span class="product-type">信息导航</span><h2>按目的找到值得看的人</h2><p>面向学习者、创作者与研究者，连接领域、作者与代表作品。</p><p class="detail-label">可交付内容</p><p>专题导航、来源档案、阅读路径、更新摘要。</p><p class="detail-label">潜在收费依据</p><p>节省筛选时间与持续更新。先观察重复使用与具体节省的工作。</p><p class="detail-label">需要验证</p><p>用户是否持续回来，是否能用目录找到原先找不到的资料。</p></article><article class="card product-card"><span class="product-type">细分研究</span><h2>为一个行业做深度筛选</h2><p>面向有明确选题、产品或行业问题的团队。</p><p class="detail-label">可交付内容</p><p>领域地图、代表作者、竞争内容、证据与适用条件。</p><p class="detail-label">潜在收费依据</p><p>有明确范围的研究报告、定制筛选与持续监测服务。</p><p class="detail-label">需要验证</p><p>客户能否根据交付完成决策，是否愿意购买下一期或下一次研究。</p></article><article class="card product-card"><span class="product-type">合作服务</span><h2>把候选推进到真实合作</h2><p>面向品牌、商家与有推广任务的团队。</p><p class="detail-label">可交付内容</p><p>匹配名单、经确认的合作条件、执行进度与效果记录。</p><p class="detail-label">潜在收费依据</p><p>筛选与执行服务费，或在明确合同条件下按合作成果收费。</p><p class="detail-label">需要验证</p><p>回复、合作、复购和效果。实际沟通、议价与履约需要经营投入。</p></article></div>
      ${sectionHead("Monid 在这套流程中的位置", "官方文档支持工具发现、检查参数与执行调用，具体接口需要逐项确认。")}
      <div class="flow-banner"><span>描述采集任务</span><b>发现接口</b><span>查看字段与价格</span><b>限量采样</b><span>清洗、去重、归类</span><b>人工复核</b><span>形成研究与名单</span></div><div class="grid two"><article class="card"><h3>工具可以帮助采集</h3><p>接口返回的数据要保留平台、账号 ID、日期、字段与来源。同一作者的跨平台账号需要本人互链或其他直接证据。</p><p>${external("https://docs.monid.ai/", "Monid 官方流程")} · ${external("https://docs.monid.ai/guide/pricing.html", "计费口径")}</p></article><article class="card"><h3>持续价值来自整理与反馈</h3><p>有用的领域划分、能解释的关注理由、资料更新和实际使用反馈会逐步形成积累。接口可用性、许可范围与采集成本需在接入前核查。</p></article></div>
      ${sectionHead("从研究样板到可检验的交付", "以下为建议验证步骤，当前完成的是资料与网页样板。")}
      <div class="roadmap"><article class="card"><span class="stage">明确问题</span><h3>选一个具体用户任务</h3><p>例如为独立开发者整理 AI 编程学习入口。记录用户现有查找过程与耗时。</p></article><article class="card"><span class="stage">做小范围交付</span><h3>以作品为收录依据</h3><p>限定平台、主题和样本数量。每人附代表作品、关注理由、来源与日期。</p></article><article class="card"><span class="stage">观察实际使用</span><h3>看资料是否被用起来</h3><p>记录找到了什么、做出了什么决定，以及哪些结果需要补充或纠正。</p></article><article class="card"><span class="stage">核对付费与维护</span><h3>比较实际收入与投入</h3><p>分别计算采集、人工复核、更新和获客成本，再观察付费与续用。</p></article></div>
      ${sectionHead("已有产品提供的参照", "官方功能与报价只能证明产品供给，经营结果需要独立证据。")}
      <div class="table-wrap"><table><thead><tr><th>参照</th><th>公开功能</th><th>对本项目的启发</th></tr></thead><tbody><tr><td>Modash</td><td>创作者发现、受众分析、关系管理与效果追踪</td><td>可研究数据如何连接实际工作流程。${external("https://www.modash.io/pricing", "官方功能范围")}</td></tr><tr><td>TikTok One</td><td>按作者、受众和内容表现筛选创作者</td><td>体量、领域与表现适合作为独立维度。${external("https://ads.tiktok.com/resources/help/article/how-to-find-creators-who-work-with-tiktok-one/", "官方说明")}</td></tr><tr><td>Monid</td><td>发现工具、检查接口、按使用调用</td><td>作为采集候选，先看可用接口、输入和价格。${external("https://docs.monid.ai/", "官方文档")}</td></tr></tbody></table></div>`;
  }

  function sources() {
    const verified = data.creators.filter(
      (creator) => creator.status === "来源已读",
    ).length;
    return `${pageHead("SOURCES & METHODOLOGY", "让每个判断，都能回到出处。", `资料快照为 ${data.meta.date}。保留官方说明、作者原文与候选账号线索，逐项标注本轮读取状态。`, '<button class="button secondary print-button" data-action="print">打印当前页</button>')}
      <div class="grid two"><article class="card"><span class="fact-label">覆盖范围</span><h3>${data.platforms.length} 个入口 · ${data.domains.length} 个领域 · ${data.creators.length} 位样本</h3><p>当前 ${verified} 位作者的资料来源已读，${data.creators.length - verified} 位中文视频作者待复核。本轮重点深化独立游戏，其他样本偏技术、教育与商业。消费、运动、旅行等方向仍需补充。</p><p>采用目的性选样，适合演示整理方式与提供研究入口。领域数量代表分类规划，样本数量代表当前收录。</p></article><article class="card"><span class="fact-label">事实与判断</span><h3>已读原文、编辑判断、未知字段</h3><p>原文支持身份自述、主题与作品入口。平台适配、主题标签和关注理由由本项目整理，不等同于独立认证。</p><p>3 个大众频道保留非实时订阅快照，其他体量待核。受众画像、报价、回复率与销售数据待核，产品付费价值需要实际验证。</p></article></div>
      ${sectionHead("建议持续维护的记录", "沿着作者、账号、作品与观察事件积累，保留历史与修订。")}
      <div class="table-wrap"><table><thead><tr><th>记录对象</th><th>基础字段</th><th>核对要求</th></tr></thead><tbody><tr><td>作者</td><td>唯一 ID、名字、本人主页、身份依据</td><td>团队、个人和合著作品分别归属</td></tr><tr><td>平台账号</td><td>平台、稳定账号 ID、主页 URL、作者关联证据</td><td>同名账号保留待核，同一作者可有多个账号</td></tr><tr><td>作品</td><td>标题、原文链接、日期、主题、贡献与引用</td><td>保留原始来源、版本与勘误</td></tr><tr><td>观察快照</td><td>采集时间、字段口径、数值、来源与状态</td><td>新快照追加历史，过期记录显示上次核对日期</td></tr><tr><td>合作记录</td><td>确认方式、时间、报价条件、成本与结果</td><td>经授权补充，明确归因与口径</td></tr></tbody></table></div>
      <div class="note">建议初始更新规则为热点线索每周复查、常规作者每月复查、合作前重新确认条件，实际频率按变化与成本调整。本页记录的是读取日，原文发布时间按来源自身标注。访问失败保留状态，恢复读取后追加核对记录。</div>
      ${sectionHead("资料目录", "每条保留支持范围与读取状态，外部链接需要网络。")}
      <div class="filters"><div class="filter-line"><div class="search-wrap"><span aria-hidden="true">⌕</span><input type="search" id="source-search" aria-label="搜索资料来源" placeholder="搜索来源、作者或支持内容" value="${escape(state.sourceQuery)}"></div><label class="select-wrap"><span>来源类型</span><select id="source-type" aria-label="来源类型"><option value="">全部类型</option>${[...new Set(allSources.map((source) => source.type))].map((type) => `<option value="${type}" ${state.sourceType === type ? "selected" : ""}>${type}</option>`).join("")}</select></label></div></div><div class="result-bar"><span id="source-count" role="status"></span><span>状态表示本轮读取情况</span></div><div class="source-list" id="source-results"></div>`;
  }

  function updateSourceResults() {
    const query = state.sourceQuery.trim().toLocaleLowerCase();
    const filtered = allSources.filter(
      (source) =>
        (!state.sourceType || source.type === state.sourceType) &&
        [source.title, source.supports, source.url, source.status]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query),
    );
    document.getElementById("source-count").innerHTML =
      `<strong>${filtered.length}</strong> 条匹配来源 / 共 ${allSources.length} 条`;
    document.getElementById("source-results").innerHTML = filtered.length
      ? filtered
          .map(
            (source) =>
              `<article class="source-row"><span class="source-type">${source.type}</span><div class="source-body"><h3>${external(source.url, source.title)}</h3><p>${escape(source.supports)}</p><p>读取日期 ${source.date}</p></div>${tag(source.status, source.status === "已读取" ? "green" : "amber")}</article>`,
          )
          .join("")
      : empty(
          "没有匹配来源",
          "试着搜索作者名、平台名或更短的关键词。",
          "reset-sources",
        );
  }

  function openDialog(title, body) {
    document.getElementById("dialog-content").innerHTML =
      `<header class="dialog-head"><h2 id="dialog-title">${escape(title)}</h2><button class="close-dialog" data-action="close-dialog" aria-label="关闭详情">×</button></header><div class="dialog-body">${body}</div>`;
    dialog.showModal();
  }

  function creatorDetail(id) {
    const creator = data.creators.find((item) => item.id === id);
    if (!creator) return;
    if (creator.indie) {
      openDialog(creator.name, indieAuthorDetails(creator.indie));
      return;
    }
    openDialog(
      creator.name,
      `<div class="card-head"><span class="avatar" style="--avatar-color:${creator.color}">${creator.initials}</span><div><h3>${creator.topic}</h3><p>${creator.kind} · ${creator.language}</p></div></div><div class="chip-row">${creator.domains.map((domain) => tag(domain)).join("")}${tag(creator.focus)}${tag(creator.status, creator.status === "来源已读" ? "green" : "amber")}</div><h3>本轮来源支持什么</h3><p>${creator.summary}</p><h3>关注理由 · 编辑判断</h3><p>${creator.why}</p><h3>作品与内容入口</h3><p>${creator.work}</p><div class="chip-row">${creator.purposes.map((purpose) => tag(purpose)).join("")}</div><h3>关联平台</h3><p>${creator.platforms.map(platformName).join(" / ")}。以当前原文支持的关联为范围。</p><div class="note amber">待核对字段 · ${creator.missing}。当前资料支持内容研究与补采用途，推广合作需要另外确认受众与合作条件。</div><div class="link-actions">${external(creator.url, "打开作者入口", "button")}${external(creator.source, "查看记录来源", "button secondary")}<button class="button secondary" data-action="toggle-detail-save" data-id="${creator.id}">${state.saved.has(creator.id) ? "移出观察清单" : "加入观察清单"}</button></div><p class="storage-note" style="margin-top:20px">核对日期 ${data.meta.date} · 体量与商业数据待核对</p>`,
    );
  }

  function compareCreators() {
    const selected = data.creators.filter((creator) =>
      state.compare.has(creator.id),
    );
    if (selected.length < 2) return;
    const rows = [
      ["领域", (creator) => creator.domains.join(" / ")],
      [
        "擅长方向",
        (creator) =>
          creator.indie ? creator.indie.specialties.join(" / ") : creator.topic,
      ],
      [
        "学习前提",
        (creator) => creator.indie?.prerequisite || "本轮未单列学习前提",
      ],
      ["适用目的", (creator) => creator.purposes.join(" / ")],
      ["关注理由", (creator) => creator.why],
      ["代表入口", (creator) => creator.work],
      [
        "建议顺序",
        (creator) => creator.indie?.order || "从代表作品与资料入口开始",
      ],
      ["来源状态", (creator) => creator.status],
      [
        "平台体量",
        (creator) =>
          creator.indie?.reach
            ? `${creator.indie.reach.text}。${creator.indie.reach.freshness}`
            : "待核对，当前无法据此归类大小",
      ],
      ["合作字段", (creator) => creator.missing],
    ];
    openDialog(
      "创作者关注理由对照",
      `<p>同一张表比较用途与证据。当前对照 ${selected.length} 位，样本保留缺失字段。</p><div class="table-wrap"><table><thead><tr><th>维度</th>${selected.map((creator) => `<th>${escape(creator.name)}</th>`).join("")}</tr></thead><tbody>${rows.map(([label, get]) => `<tr><td>${label}</td>${selected.map((creator) => `<td>${escape(get(creator))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`,
    );
  }

  function download(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("已生成研究资料下载");
  }

  function exportAll() {
    download(
      {
        ...data,
        indieStudy: study,
        soloReleaseProgress: serializeSoloDraft(),
        sources: allSources,
        savedCreatorIds: [...state.saved],
        exportedAt: new Date().toISOString(),
        dataStatus: data.meta.limits,
      },
      `creator-value-atlas-${data.meta.date}.json`,
    );
  }

  function render() {
    const renderers = {
      overview,
      indie,
      publishing,
      platforms,
      domains,
      creators,
      value,
      product,
      sources,
    };
    main.innerHTML = renderers[state.view]();
    document.title = `${viewNames[state.view]} · 观源`;
    document.querySelectorAll("nav [data-view]").forEach((link) => {
      if (link.dataset.view === state.view)
        link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    if (state.view === "platforms") updatePlatformResults();
    if (state.view === "domains") updateDomainResults();
    if (state.view === "creators") updateCreatorResults();
    if (state.view === "sources") updateSourceResults();
    if (state.view === "indie") updateIndieAuthors();
    if (state.view === "publishing" && state.publishingTab === "plan") updateSoloProgress();
    updateSavedCount();
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(".skip-link")) {
      event.preventDefault();
      main.focus();
      main.scrollIntoView();
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const value = button.dataset.value;
    if (action === "publishing-tab") navigate("publishing", { tab: value });
    if (action === "export-solo") exportSoloPlan();
    if (action === "jump-solo-tasks") document.getElementById("solo-progress-count").scrollIntoView({ block: "start" });
    if (action === "indie-path") {
      const path = study.paths.find((item) => item.id === value);
      state.indiePath = path.id;
      state.indieStage = path.stages[0];
      syncIndieRoute();
      document
        .querySelectorAll('[data-action="indie-path"]')
        .forEach((item) =>
          item.setAttribute(
            "aria-pressed",
            String(item.dataset.value === value),
          ),
        );
      document.getElementById("indie-path-panel").innerHTML = indiePathPanel();
    }
    if (action === "indie-stage") {
      state.indieStage = value;
      syncIndieRoute();
      document
        .querySelectorAll('[data-action="indie-stage"]')
        .forEach((item) =>
          item.setAttribute(
            "aria-pressed",
            String(item.dataset.value === value),
          ),
        );
      document.getElementById("indie-lesson").innerHTML = indieLesson();
    }
    if (["indie-area", "indie-group", "indie-language"].includes(action)) {
      const field = { "indie-area": "indieArea", "indie-group": "indieGroup", "indie-language": "indieLanguage" }[action];
      state[field] = value;
      if (action === "indie-language" || action === "indie-area") syncIndieRoute();
      document
        .querySelectorAll(`[data-action="${action}"]`)
        .forEach((item) =>
          item.setAttribute(
            "aria-pressed",
            String(item.dataset.value === value),
          ),
        );
      updateIndieAuthors();
    }
    if (action === "reset-indie") {
      state.indieQuery = "";
      state.indieArea = "";
      state.indieGroup = "";
      state.indieLanguage = "";
      syncIndieRoute();
      render();
    }
    if (action === "export-indie")
      download(
        { ...study, exportedAt: new Date().toISOString() },
        `indie-game-study-${study.date}.json`,
      );
    if (action === "export-publishing")
      download(
        {
          ...study.publishing,
          authors: study.authors.filter((author) => study.publishing.authorIds.includes(author.id)),
          path: study.paths.find((path) => path.id === "zh-business"),
          stages: study.stages.filter((stage) => stage.id.startsWith("pub-")),
          documents: study.supplements.filter((document) => study.publishing.documentIds.includes(document.id)),
          exportedAt: new Date().toISOString(),
        },
        `indie-publishing-${study.date}.json`,
      );
    if (action === "navigate") navigate(button.dataset.target);
    if (action === "goal") {
      state.goal = value;
      document
        .querySelectorAll('[data-action="goal"]')
        .forEach((item) =>
          item.setAttribute(
            "aria-pressed",
            String(item.dataset.value === value),
          ),
        );
      document.getElementById("goal-result").innerHTML = goalPanel();
    }
    if (action === "platform-purpose" || action === "platform-market") {
      state[
        action === "platform-purpose" ? "platformPurpose" : "platformMarket"
      ] = value;
      document
        .querySelectorAll(`[data-action="${action}"]`)
        .forEach((item) =>
          item.setAttribute(
            "aria-pressed",
            String(item.dataset.value === value),
          ),
        );
      updatePlatformResults();
    }
    if (action === "save" || action === "toggle-detail-save") {
      toggleSaved(button.dataset.id);
      if (action === "toggle-detail-save")
        button.textContent = state.saved.has(button.dataset.id)
          ? "移出观察清单"
          : "加入观察清单";
    }
    if (action === "detail") creatorDetail(button.dataset.id);
    if (action === "close-dialog") dialog.close();
    if (action === "compare") compareCreators();
    if (action === "clear-compare") {
      state.compare.clear();
      document.querySelectorAll("[data-compare]").forEach((input) => {
        input.checked = false;
      });
      updateCompareBar();
    }
    if (action === "reset-creators") {
      state.filters = defaultFilters();
      syncCreatorRoute();
      render();
    }
    if (action === "reset-platforms") {
      state.platformPurpose = "";
      state.platformMarket = "";
      render();
    }
    if (action === "reset-domains") {
      state.domainQuery = "";
      render();
    }
    if (action === "reset-sources") {
      state.sourceQuery = "";
      state.sourceType = "";
      render();
    }
    if (action === "print") window.print();
    if (action === "export-filtered")
      download(
        {
          meta: data.meta,
          filter: { ...state.filters },
          creators: filteredCreators(),
          exportedAt: new Date().toISOString(),
        },
        `creator-shortlist-${data.meta.date}.json`,
      );
  });

  document.addEventListener("input", (event) => {
    const field = event.target.dataset.soloField;
    if (field) {
      if (!event.target.checkValidity()) return;
      if (field === "project") state.soloDraft.project = event.target.value;
      else if (["cashBudget", "weeklyHours"].includes(field)) {
        const value = event.target.valueAsNumber;
        if (!Number.isFinite(value)) return;
        state.soloDraft[field] = value;
      } else return;
      persistSoloDraft();
      document.getElementById("solo-budget-summary").innerHTML = soloBudgetSummary();
      updateSoloProgress();
      return;
    }
    if (event.target.id === "indie-search") {
      state.indieQuery = event.target.value;
      updateIndieAuthors();
    }
    if (event.target.id === "creator-search") {
      state.filters.query = event.target.value;
      syncCreatorRoute();
      updateCreatorResults();
    }
    if (event.target.id === "domain-search") {
      state.domainQuery = event.target.value;
      updateDomainResults();
    }
    if (event.target.id === "source-search") {
      state.sourceQuery = event.target.value;
      updateSourceResults();
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.dataset.soloTask && soloTaskIds.has(target.dataset.soloTask)) {
      if (target.checked) state.soloDraft.completed.add(target.dataset.soloTask);
      else state.soloDraft.completed.delete(target.dataset.soloTask);
      persistSoloDraft();
      updateSoloProgress();
      return;
    }
    if (target.dataset.filter) {
      state.filters[target.dataset.filter] =
        target.type === "checkbox" ? target.checked : target.value;
      syncCreatorRoute();
      updateCreatorResults();
    }
    if (target.dataset.compare) {
      if (!target.checked) state.compare.delete(target.dataset.compare);
      else if (state.compare.size < 3)
        state.compare.add(target.dataset.compare);
      else {
        target.checked = false;
        toast("最多对照 3 位作者，请先移除一位");
      }
      updateCompareBar();
    }
    if (target.id === "source-type") {
      state.sourceType = target.value;
      updateSourceResults();
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  document
    .getElementById("saved-link")
    .addEventListener("click", () => navigate("creators", { saved: "1" }));
  document.getElementById("export-all").addEventListener("click", exportAll);
  document.getElementById("menu-button").addEventListener("click", () => {
    const open = document.getElementById("sidebar").classList.toggle("open");
    document
      .getElementById("menu-button")
      .setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      document.getElementById("sidebar").classList.remove("open");
      document
        .getElementById("menu-button")
        .setAttribute("aria-expanded", "false");
    }
  });
  window.addEventListener("hashchange", readRoute);
  readRoute();
})();
