const lenses = {
  service: {
    question: "一次晚到需要谁回应？每个回应能否成为下一项服务真正可用的条件？",
    eras: [
      {year:"2026",label:"现在的示意基线",title:"个人在机构之间传递消息",body:"阿澄分别联系照护站和父亲，确认有人愿意等待，再自己安排回程。护理员把交班时间写进纸本。",detail:"这是一条街的创作基线。现实服务的数字化程度有差异。"},
      {year:"2031",label:"五年后的设想",title:"机构内的事情可以办妥",body:"AI 帮阿澄提交改约，护理员在照护站系统里确认。等待时间、通知和工时进入同一套内部流程，回程仍需另行安排。",detail:"成立条件 · 机构已有可执行的接口、权限和人工确认。"},
      {year:"2036",label:"十年后的设想",title:"多个机构能接成一件事",body:"父亲和护理员分别同意后，获授权的代理确认延时照护、原班次空座和补贴，形成一份能够兑现的安排。",detail:"成立条件 · 机构互认承诺，也能处理拒绝、撤回和失败。"}
    ]
  },
  work: {
    question: "节省的是谁的工时？增加了谁的夜班？效率收益最终由谁获得？",
    eras: [
      {year:"2026",label:"从人物的工作看起",title:"工作仍有大量协调负担",body:"主角下班后还要处理电话与交接。护理员临时多留，额外劳动的记录和结算依赖本机构的做法。",detail:"故事应先交代两人的职业、时间约束和实际处境。"},
      {year:"2031",label:"五年后的设想",title:"文书与协调逐步交给 AI",body:"填单、通知和登记被串成流程。人的工作集中在服务、验收和处理例外，岗位的内容与评价方式开始调整。",detail:"待深化 · 岗位减少或新增、收入怎样变化，尚未建立完整设定。"},
      {year:"2036",label:"十年后的设想",title:"按任务组织协作更常见",body:"代理可以在授权范围内匹配班次与人员。护理员可以选择是否接受延时，额外时间在安排达成时明确计入。",detail:"待深化 · 谁承担临时调度成本，工作人员能否真正拒绝。"}
    ]
  },
  authority: {
    question: "谁有权代表谁？安排失败以后，居民找谁负责，怎样撤回和申诉？",
    eras: [
      {year:"2026",label:"个人与机构的联系",title:"本人逐项确认",body:"阿澄开口请求，父亲与护理员回应。安排依赖人与人之间的联系，这个故事里的交接记录沿具体联系人回查。",detail:"有电话和应用，并不等于服务之间已经互认权限。"},
      {year:"2031",label:"五年后的设想",title:"机构内授权逐渐清晰",body:"AI 能提交申请、读回结果、记录过程。涉及照护责任的改变，由有权的人员确认后才生效。",detail:"需要设计 · 哪些动作可自动执行，哪些需要当事人同意。"},
      {year:"2036",label:"十年后的设想",title:"代理承诺进入日常制度",body:"居民和机构能授予有限、可撤回的权限。代理在范围内协调资源，承诺、支付与责任需要能被审查。",detail:"需要设计 · 撤回后的替代服务、审查记录和争议处理。"}
    ]
  },
  access: {
    question: "没有优质代理、额外预算或数字技能的人，是否仍能获得同样的基本服务？",
    eras: [
      {year:"2026",label:"人物所在的街区",title:"服务质量已经存在差别",body:"照护站的开放时间、接驳线路和工作人员数量，直接决定一次晚到怎样被处理。便利依赖所在地区的资源。",detail:"本项目只构造具体街区，尚未建立跨地区的现实数据基线。"},
      {year:"2031",label:"五年后的设想",title:"先接入的机构先提效",body:"接口、数据和预算较好的机构更容易把 AI 用进日常。居民在不同机构之间，可能感受到明显不同的效率。",detail:"待深化 · 原型尚未呈现服务差异怎样影响不同家庭。"},
      {year:"2036",label:"十年后的设想",title:"便利与公共保底如何共存",body:"公共规则保住基本服务，平台提供额外便利。同一条街里，代理能力与可支付预算可能形成新的差距。",detail:"世界底稿 · 公共保底、商业竞争和退出权仍需讨论。"}
    ]
  }
};

const demos = [
  {id:"late-home",category:"story",kind:"人物与生活",name:"晚一点到家",scope:"2026 / 2031 / 2036",image:"media/late-home-three-eras.png",alt:"同一个照护站镜头的三年代对照",file:"demos/late-home.html",description:"阿澄晚到十二分钟接父亲。四幕故事、三年代同幕对照、人物动作与 MiniMax 配音，把照护与回程安排放在日常里观察。",limit:"当前差别主要落在确认方式与服务衔接，完整社会形态和观众理解仍待深化。",instruction:"点“有声开始”观看。点“同幕对照”比较三年代，同一片段可切换年份。默认开启声音选择，点击播放后才发声。"},
  {id:"city-system",category:"system",kind:"系统与调度",name:"城市热浪与资源取舍",scope:"城市尺度",image:"media/city-system-2031-ai-value.png",alt:"城市热浪中的供水、医院、社区和避暑接驳对照",file:"demos/city-system-2031.html",description:"在同一场热浪中，比较按比例限电和联合调度，单独开关储能预判，再改变民生与生产的优先级。",limit:"解释了模型中的资源关系；物理阈值与政策权重为演示设定，尚未接入现实城市。",instruction:"点“看 AI 的价值”进入三个对照入口。可以切换配电机制、储能策略和人的优先级，点“听讲解”启用 MiniMax 语音。"},
  {id:"ai-world",category:"story",kind:"人物与生活",name:"一趟复诊的重新安排",scope:"跨服务计划",image:"media/ai-world-2031-transfer.png",alt:"复诊行程的地图、换乘位置和逐站时间",file:"demos/ai-world-2031.html",description:"接驳取消后重新匹配复诊、取药和返程。预算变化会得到直达、换乘或无法满足的不同结果。",limit:"能够呈现一次有约束的代办，用户指出它仍不足以说明未来社会的价值。",instruction:"点“一键演示”，在接驳取消后修改交通上限。支持阶段跳转、暂停、旋转与可选语音。"},
  {id:"future-grid",category:"system",kind:"系统与调度",name:"现场设备接入演练",scope:"现场执行",image:null,alt:"",file:"demos/future-grid-2031.html",description:"原有储能车停驶后，查找现场设备、编排接入方案、批准执行，再观察道路变化和供电结果。",limit:"演示是预设规则下的设备接入流程，自动发现、真实设备控制与开放环境协作仍需接入。",instruction:"按“查找现场设备”“编排接入方案”“批准并执行”推进。可以封闭道路或修改目标。"},
  {id:"blackout",category:"system",kind:"系统与调度",name:"停电后的二十分钟",scope:"最早的调度试验",image:null,alt:"",file:"demos/blackout-2031.html",description:"同一组封路与车辆故障，比较逐步调度和 2031 AI 协同，观察各处复电时限与人工派车操作。",limit:"最初证明了交互与调度对照能运行，未来五年的能力差距仍未充分体现。",instruction:"选择压力场景后，切换“逐步调度”和“2031 AI 协同”。可以重复同样的事故进行比较。"}
];

const eraGrid = document.querySelector("[data-era-grid]");
const question = document.querySelector("[data-lens-question]");
const lensButtons = Array.from(document.querySelectorAll("[data-lens]"));

function selectLens(name) {
  const lens = lenses[name];
  lensButtons.forEach(button => {
    const selected = button.dataset.lens === name;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.getElementById("world-panel").setAttribute("aria-labelledby", "tab-" + name);
  eraGrid.replaceChildren(...lens.eras.map(era => {
    const article = document.createElement("article");
    article.className = "era-card";
    const year = document.createElement("div");
    year.className = "era-year";
    const yearNumber = document.createElement("strong");
    yearNumber.textContent = era.year;
    const label = document.createElement("span");
    label.textContent = era.label;
    year.append(yearNumber, label);
    const title = document.createElement("h3");
    title.textContent = era.title;
    const body = document.createElement("p");
    body.textContent = era.body;
    const detail = document.createElement("div");
    detail.className = "era-detail";
    detail.textContent = era.detail;
    article.append(year, title, body, detail);
    return article;
  }));
  question.textContent = lens.question;
}

lensButtons.forEach((button, index) => {
  button.addEventListener("click", () => selectLens(button.dataset.lens));
  button.addEventListener("keydown", event => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % lensButtons.length;
    else if (event.key === "ArrowLeft") next = (index + lensButtons.length - 1) % lensButtons.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = lensButtons.length - 1;
    else return;
    event.preventDefault();
    lensButtons[next].focus();
    selectLens(lensButtons[next].dataset.lens);
  });
});

const demoGrid = document.querySelector("[data-demo-grid]");
const player = document.querySelector("[data-player]");
const frameSlot = document.querySelector("[data-frame-slot]");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let lastTrigger = null;

function openDemo(id, trigger) {
  const demo = demos.find(item => item.id === id);
  if (!demo) return;
  lastTrigger = trigger;
  frameSlot.replaceChildren();
  document.querySelector("[data-player-title]").textContent = demo.name;
  document.querySelector("[data-player-note]").textContent = demo.instruction;
  document.querySelector("[data-player-link]").href = demo.file;
  const frame = document.createElement("iframe");
  frame.title = demo.name + "互动演示";
  frame.src = demo.file;
  frame.setAttribute("allow", "autoplay");
  frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
  frameSlot.append(frame);
  player.hidden = false;
  player.scrollIntoView({behavior: reducedMotion.matches ? "instant" : "smooth", block: "start"});
}

function renderDemos(category) {
  demoGrid.replaceChildren(...demos.filter(demo => category === "all" || demo.category === category).map(demo => {
    const card = document.createElement("article");
    card.className = "demo-card";
    if (demo.image) {
      const image = document.createElement("img");
      image.src = demo.image;
      image.alt = demo.alt;
      image.loading = "lazy";
      card.append(image);
    }
    const body = document.createElement("div");
    body.className = "demo-card-body";
    const meta = document.createElement("div");
    meta.className = "demo-meta";
    const kind = document.createElement("span");
    kind.className = "demo-kind";
    kind.textContent = demo.kind;
    const scope = document.createElement("span");
    scope.textContent = demo.scope;
    meta.append(kind, scope);
    const title = document.createElement("h3");
    title.textContent = demo.name;
    const description = document.createElement("p");
    description.className = "demo-description";
    description.textContent = demo.description;
    const limit = document.createElement("p");
    limit.className = "demo-limit";
    limit.textContent = demo.limit;
    const actions = document.createElement("div");
    actions.className = "demo-card-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button primary";
    button.textContent = "在本页运行";
    button.setAttribute("aria-label", "在本页运行" + demo.name);
    button.addEventListener("click", () => openDemo(demo.id, button));
    const link = document.createElement("a");
    link.href = demo.file;
    link.className = "button outline";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "独立打开";
    link.setAttribute("aria-label", "独立打开" + demo.name);
    actions.append(button, link);
    body.append(meta, title, description, limit, actions);
    card.append(body);
    return card;
  }));
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach(filter => filter.setAttribute("aria-pressed", String(filter === button)));
    renderDemos(button.dataset.filter);
  });
});
document.querySelectorAll("[data-select-demo]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    openDemo(link.dataset.selectDemo, link);
  });
});
document.querySelector("[data-player-close]").addEventListener("click", () => {
  frameSlot.replaceChildren();
  player.hidden = true;
  if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll: true});
});

const navLinks = Array.from(document.querySelectorAll(".site-header nav a"));
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => {
        if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }, {rootMargin: "-15% 0px -65% 0px"});
  navLinks.forEach(link => {
    const target = document.querySelector(link.hash);
    if (target) observer.observe(target);
  });
}

selectLens("service");
renderDemos("all");
