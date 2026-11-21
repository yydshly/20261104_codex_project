(() => {
  const notes = {
    1: {
      evidence: '旧版 Skill 与生成脚本',
      parts: [
        ['先把一句话变成画面', '先确认视觉隐喻和拼贴尾帧，再用与尾帧同色的空场作为首帧。这样作者可以先审核画面是否说清楚，再让它动起来。'],
        ['交给模型补中间动作', '脚本把首帧、尾帧和逐件入场提示提交给 Gemini Omni Flash。生成后去音轨，抽帧检查开头和最后构图。Image 2.6 那条新帖公开了成片，具体生成步骤未随帖提供。'],
      ],
      links: [['Skill 的首尾帧与动作约束', 'https://github.com/pyang5166/gbro-collage-broll/blob/main/SKILL.md#L236-L274'], ['生成脚本的模型调用', 'https://github.com/pyang5166/gbro-collage-broll/blob/main/scripts/generate_video.py#L164-L227']],
    },
    2: {
      evidence: '公开提示词与样片',
      parts: [['身份与画面规格分开', '参考图提供人物外貌，提示词统一白底、头肩范围、留白和光线。原作的三张成品能比较版式一致性，输入照片和模型实现未公开。']],
      links: [['作者的提示词', 'https://x.com/oggii_0/status/2118216706459914578']],
    },
    3: {
      evidence: '公开接口与成片',
      parts: [['输出控制', '官方 GIF 接口公开帧数和帧时长等参数。它们能约束输出规格，动作连贯性和循环接缝仍要观察样片。']],
      links: [['GIF 输出文档', 'https://developers.openai.com/api/docs/guides/image-generation#generate-animated-gif-output']],
    },
    4: {
      evidence: '官方使用指南',
      parts: [['先定镜头意图', 'Flow 的指南把动作写进提示词，也能用首尾帧约束起止画面。在程序化镜头里，同一个意图可拆成镜头位置、朝向、焦点和速度曲线。']],
      links: [['Flow 官方镜头指南', 'https://blog.google/innovation-and-ai/products/flow-video-tips/']],
    },
    5: {
      evidence: '渲染源码与官方接口',
      parts: [
        ['UI UX Pro Max 给出设计系统', '按任务类型检索样式、配色和组件模式，再用规则筛选，输出一套可落实的视觉约束。'],
        ['Impeccable 做界面评审', '用审查和润色指令定位密度、层级或可访问性问题，再回到现有页面改动。'],
        ['Frontend Design 确定视觉方向', '先读内容、受众和使用场景，明确排版与美术取舍，再把这些约束带进组件实现。'],
        ['Motion 处理状态过渡', '将开合等状态映射成关键帧和过渡，点击后的变化可沿同一条缓动曲线播放。'],
        ['R3F 负责网页交互', 'R3F 将 React 场景映射到 Three.js 对象。源码里每次绘制前先调用 useFrame 订阅者，让镜头或物体用当前状态更新，然后渲染场景。'],
        ['Remotion 负责按帧导出', '用 useCurrentFrame 取得帧号，再用帧号计算镜头和物体状态。同一套场景参数可以在网页由拖动驱动，在导出时由帧号驱动。'],
        ['Blender MCP 负责编辑资产', 'MCP 服务把工具调用通过 socket 交给 Blender 插件。插件在 Blender 里改场景、物体和材质。'],
      ],
      links: [['UI UX Pro Max', 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill#how-design-system-generation-works'], ['Impeccable', 'https://github.com/pbakaus/impeccable'], ['Frontend Design', 'https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md'], ['Motion 动画接口', 'https://motion.dev/docs/react-animation'], ['R3F 渲染循环', 'https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/core/loop.ts'], ['Remotion 帧号 API', 'https://www.remotion.dev/docs/use-current-frame'], ['Blender MCP 的两端结构', 'https://github.com/ahujasid/mcp-for-blender#components']],
    },
    6: {
      evidence: '公开提示词与程序化推导',
      parts: [
        ['结构先于画面', '原帖用棒状核心、四条对数旋臂和倾角描述空间结构。浏览器里可以按半径计算旋臂角度，再加入扰动。固定随机种子后，单独改倾角就能比较形态。'],
        ['镜头与场景分开', '原帖建议用 NumPy 算粒子、PIL 画帧、FFmpeg 合成。把相机沿路线的位置映射到时间，星点数据就可以同时服务俯视、飞越和标注。作者提供了提示词与成片，具体投影代码未随帖发布。'],
      ],
      links: [['Lyren 的成片和提示词', 'https://x.com/0xAIlabs/status/2118379258607251490'], ['可交互渲染循环的参考实现', 'https://github.com/pmndrs/react-three-fiber/blob/master/packages/fiber/src/core/loop.ts']],
    },
    7: {
      evidence: '实验协议源码',
      parts: [['固定预算，保留证据', 'Autoresearch 每次在固定时间内训练，读取验证损失指标 val_bpb，将结果记入表格。保留进步的改动，其余回退。迁移到素材工作流时，需要为每一步单独定义验收和重试条件。']],
      links: [['Autoresearch 实验规则', 'https://github.com/karpathy/autoresearch/blob/master/program.md']],
    },
    8: {
      evidence: '论文和公开实现',
      parts: [['比较配置而非换模型', '保持模型不变，试跑不同的提示、工具和流程配置。用运行轨迹和任务结果决定保留哪些变化，再把有效经验带到下一轮。']],
      links: [['Harness² 方法与评测', 'https://arxiv.org/html/2610.14224v1'], ['实现仓库', 'https://github.com/google-research/harness2']],
    },
    9: {
      evidence: '播放器源码与时间码格式',
      parts: [['一个播放时钟', '播放器读取 audio.currentTime，用每段的起止时间定位当前段，更新字幕和角色画面。点击章节时，把 currentTime 设为该段起点。可复用的是同一时间码驱动多种输出。']],
      links: [['Mono Radio 播放器源码', 'https://github.com/monoradio102/myradio/blob/main/index.html'], ['段落与台本格式', 'https://github.com/monoradio102/myradio/blob/main/docs/formats.md']],
    },
    10: {
      evidence: '原课源码与交互引擎',
      parts: [['把课程拆成可执行的节拍', '原课把每小段的时长、图形与互动处理器写在同一套节拍数据里。讲解沿时间轴推进，练习调用本段处理器，等学习者改参数再反馈。我们把这个结构迁移到 RGB 加色。']],
      links: [['Papermorph 第 12 章源码', 'https://github.com/DozenTwelve/Papermorph/blob/342e272648e06a6163224a6177bccc83517d7fea/site/linear-algebra/ch12/index.html'], ['引擎的跳转、暂停与练习', 'https://github.com/DozenTwelve/Papermorph/blob/342e272648e06a6163224a6177bccc83517d7fea/site/linear-algebra/lib/engine.js#L1666-L1810']],
    },
    11: {
      evidence: '开源项目的权限结构',
      parts: [['角色和执行环境分开', '角色配置描述身份、工具和工作环境。项目提供审批入口，工具操作可以在真正执行前交给人确认。适配到陪伴产品时，可以分别验证角色表现和工具权限。']],
      links: [['OpenMausBot 实现与功能', 'https://github.com/milind-soni/OpenMausBot']],
    },
    12: {
      evidence: '官方模板机制与社区核验规则',
      parts: [
        ['Grok Bot 模板复用团队配置', '导出角色指令、相关记忆、技能和选定插件。接手的人可以先预览包含哪些东西，再导入为自己的工作配置。'],
        ['Foreman 用证据核对完成状态', 'Foreman 根据已有记录判断是否交接、阻塞和完成。迁移到图鉴，可以先设出处和交付字段，实际核对通过后再标完成。'],
      ],
      links: [['Grok Bot 模板指南', 'https://x.ai/bot/guides/templates-for-grok-bot'], ['Foreman 完成核验', 'https://github.com/Archive228/foreman#commands']],
    },
    13: {
      evidence: '分工不同的开源仓库',
      parts: [
        ['Obsidian Skills 规定怎样写', '提供 Markdown、Bases、Canvas 等格式的操作约定，让标题、链接和元数据遵循相同规则。'],
        ['Claude Obsidian 整理和查询', '把资料转成有出处的 Wiki 条目，支持查询与清理。'],
        ['Obsidian Second Brain 保留共享上下文', '把决定和工作记录放进可继续读取的文件，后续会话能查到谁做过什么。'],
        ['Second Brain Starter 先规划库怎么搭', '通过问答了解用途，再给出文件结构和工作流的搭建计划。'],
      ],
      links: [['Obsidian Skills', 'https://github.com/kepano/obsidian-skills'], ['Claude Obsidian 工作流', 'https://github.com/AgriciDaniel/claude-obsidian'], ['Obsidian Second Brain', 'https://github.com/eugeniughelbur/obsidian-second-brain'], ['Second Brain Starter', 'https://github.com/coleam00/second-brain-starter']],
    },
    14: {
      evidence: '作者公开的核查示例',
      parts: [['让引文能被复查', '原始资料保留在独立目录，整理页记录路径。核查脚本拿引文回原文做匹配；通过后，仍要读上下文判断引文能否支持结论。']],
      links: [['搭建长文和核查示例', 'https://x.com/danikkk_wqs/status/2113001913662734619']],
    },
    15: {
      evidence: '公开效果与实验思路',
      parts: [['单独改变随机因素', '保持同样的初始状态，重复采样，比较轨迹和结局的分布。这种对照能显出平均线掩盖的少数结果。原帖的细胞模型没有可供复算的公开源码。']],
      links: [['作者的仿真说明', 'https://x.com/0xCodio/status/2118290123255349265']],
    },
  };

  notes[16] = {
    evidence: '维护方文档与已保存的有声前后对照',
    parts: [['把创作流程落到可编辑工程', 'Agent 按 Skill 组织粗剪、配画、音轨与字幕，并调用 CLI 操作工程。客户端保留逐段精修入口，最后渲染为通用成片。'], ['把听觉与画面一起验收', '先保住人声语义与节奏，再看图解和特写是否在正确的句子上出现。本站用同一条旁白制作独立对照片，检查第 3–8 秒的配画差异。']],
    links: [['Gitruck 官方说明', 'https://github.com/Gitruck/cli'], ['工作流与支持范围', 'https://github.com/Gitruck/cli/blob/main/docs/workflow.md']],
  };
  const labs = {
    '01': { path: 'labs/collage.html?review=20261121', short: '口播配画', title: '把巡检异常拆成三步', text: '先看完整口播，再对照同一句旁白的模型生成配画与分层动画。', output: '原生拼贴 GIF、有声生成对照 MP4、完整口播、净画面与 VTT' },
    '02': { path: 'labs/visual-cases.html?case=02&review=1', short: '表情对照', title: '小镜 · 表情与头像', text: '三种表情从同一张原图生成。并排看眼镜、发夹与脸型，再试实际对话尺寸。', output: '三张新表情 PNG、头像 PNG、角色包 ZIP' },
    '03': { path: 'labs/visual-cases.html?case=03&review=3', short: '动作对照', title: '小镜 · 待机与回应', text: '把 ChatGPT Images 原生 GIF 和现有眨眼、点头并排播放，逐帧检查脸部和循环接缝。', output: '两支原生 GIF、分镜版 GIF、现有 GIF / MP4' },
    '04': { path: 'labs/visual-cases.html?case=04', short: '运镜', title: '温室巡检 · 运镜工作台', text: '按剪辑点定位镜头，再在同一时间切换横竖两版。', output: '横竖两支 16 秒宣传片、五组镜头分镜及交付 ZIP' },
    '05': { path: 'labs/stoma-3d/viewer/', short: '气孔课件', title: '看见叶片气孔的开合', text: '旋转同一份 3D 模型、改变开合，再对照 MCP 修改前后和讲解成片。', output: 'R3F 互动课件、16 秒 Remotion 讲解 MP4、GLB 模型与核验记录' },
    '06': { path: 'labs/galaxy.html', short: '银河构图', title: '用参数塑造银河', text: '先看同航线的双栏对照，再用自己的张角和图层导出同帧对照图。', output: '双栏对照片和飞越成片 MP4、对照 PNG 与参数 JSON' },
    '07': { path: 'labs/workflow-cases.html?case=07', short: '字幕制作', title: '短片字幕工作台', text: '校对温室宣传片、巡检口播或自带视频的字幕，预览并修复时间冲突。', output: '通过校验的字幕 VTT' },
    '08': { path: 'labs/workflow-cases.html?case=08&review=20261121', short: '护栏对照', title: '比较审核配置的取舍', text: '固定同一批候选稿，试跑八种规则组合，再看误放、误拦和检查成本。', output: '八种配置试跑、可重开的报告 JSON、逐条核对 CSV' },
    '09': { path: 'labs/workflow-cases.html?case=09', short: '图鉴电台', title: '听见图鉴的新成品', text: '听温室宣传片、口播对照和小镜点头的制作导览。', output: '单文件离线节目 HTML 与节目素材 ZIP' },
    '10': { path: 'labs/lesson.html', short: '加色微课', title: '同一像素，三束光', text: '听中文讲解观察三束光，再调出纯黄并核对取样。', output: '内含旁白的离线课件 HTML、MP3 与讲稿 VTT' },
    '11': { path: 'labs/systems-cases.html?case=11', short: '审批记录', title: '角色权限与人工审批', text: '提交自己的摘要改稿，核对变更前后、处理意见和最终版本。', output: '改稿版本与审批记录 JSON' },
    '12': { path: 'labs/systems-cases.html?case=12', short: '模板交接', title: '图鉴团队的模板交接', text: '用自己的来源和摘录运行交接模板，再核对交付稿里的引文。', output: '可重新导入的模板与验收报告 JSON' },
    '13': { path: 'labs/systems-cases.html?case=13&review=20261121', short: '笔记索引', title: '把素材整理成可查询的笔记', text: '导入核查报告后持久保存，刷新或从另一窗口回查摘录与人工判断。', output: '可跨窗口回查的索引、Markdown 笔记与可迁移 JSON' },
    '14': { path: 'labs/systems-cases.html?case=14', short: '引文核验', title: '让图鉴引文可回查', text: '载入交接报告或选用图鉴内的证据，定位引文与邻近原文，再记录人工复核意见。', output: '引文核查单 Markdown 与完整报告 JSON' },
    '15': { path: 'labs/systems-cases.html?case=15', short: '排期模拟', title: '同一起点的多种结果', text: '重开旧报告，按保存的参数和种子重算，再比较阶段工时和返工率。', output: '240 条轨迹 CSV、可重开和对照的模拟 JSON' },
    '16': { path: 'labs/collage.html#edit-heading', short: '有声剪辑', title: '口播的主画面与配画对照', text: '结合 Gitruck 原作参照，比较本站同一条旁白在主画面和拼贴版中的表达。', output: '11 秒自制口播对照片、主画面与配画 MP4、VTT 与 M4A' },
  };

  function labForCase(id) {
    const key = String(id).padStart(2, '0');
    return Object.hasOwn(labs, key) ? key : undefined;
  }

  function link(label, href) {
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.textContent = label;
    if (href.startsWith('https://')) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    return anchor;
  }

  function render(target, id) {
    const note = notes[id];
    if (!note) return;
    const header = document.createElement('div');
    header.className = 'research-head';
    const heading = document.createElement('h3');
    heading.textContent = '实现原理';
    const evidence = document.createElement('span');
    evidence.textContent = note.evidence;
    header.append(heading, evidence);
    const points = document.createElement('dl');
    for (const [label, description] of note.parts) {
      const term = document.createElement('dt');
      const body = document.createElement('dd');
      term.textContent = label;
      body.textContent = description;
      points.append(term, body);
    }
    const actions = document.createElement('div');
    actions.className = 'research-links';
    actions.append(...note.links.map(([label, href]) => link(label + ' ↗', href)));
    const lab = labForCase(id);
    if (lab) {
      const tryLink = link(`在本站探索 · ${labs[lab].title} ↓`, `#explore-${lab}`);
      tryLink.className = 'research-try';
      actions.append(tryLink);
    }
    target.append(header, points, actions);
  }

  window.atlasResearch = {
    render,
    labFor: labForCase,
    searchText: id => notes[id] ? [notes[id].evidence, ...notes[id].parts.flat(), ...notes[id].links.map(item => item[0])].join(' ') : '',
  };

  const section = document.querySelector('#explorations');
  const frame = document.querySelector('#exploration-frame');
  const fullView = document.querySelector('#exploration-open');
  const caseView = document.querySelector('#exploration-source');
  const heading = document.querySelector('#exploration-name');
  const output = document.querySelector('#exploration-output');
  const navigation = section.querySelector('.exploration-choices');
  const groups = [
    { name: '视觉素材', start: 1, end: 6 },
    { name: '内容制作', start: 7, end: 10 },
    { name: '资料与流程', start: 11, end: 15 },
    { name: '有声剪辑补充', start: 16, end: 16 },
  ];
  for (const group of groups) {
    group.link = link(group.name, `#explore-${String(group.start).padStart(2, '0')}`);
    section.querySelector('.exploration-groups').append(group.link);
  }
  const choices = Object.keys(labs).sort().map(id => {
    const choice = link('', `#explore-${id}`);
    choice.dataset.lab = id;
    const number = document.createElement('span');
    const name = document.createElement('strong');
    number.textContent = id;
    name.textContent = labs[id].short;
    choice.append(number, name);
    return choice;
  });
  navigation.append(...choices);
  let activeLab;
  let frameSizeObserver;

  function showLab(id) {
    if (activeLab === id) return;
    activeLab = id;
    const lab = labs[id];
    const selectedGroup = groups.find(group => Number(id) >= group.start && Number(id) <= group.end);
    for (const group of groups) group.link.setAttribute('aria-current', String(group === selectedGroup));
    selectedGroup.link.href = `#explore-${id}`;
    for (const choice of choices) {
      const number = Number(choice.dataset.lab);
      choice.hidden = number < selectedGroup.start || number > selectedGroup.end;
      choice.setAttribute('aria-current', String(choice.dataset.lab === id));
    }
    heading.textContent = lab.title;
    heading.title = lab.text;
    output.textContent = `可带走 · ${lab.output}`;
    fullView.href = lab.path;
    caseView.href = `#case-${id}`;
    frame.title = lab.title;
    frame.src = lab.path;
  }

  frame.addEventListener('load', () => {
    frameSizeObserver?.disconnect();
    const body = frame.contentDocument?.body;
    if (!body) return;
    const fitHeight = () => {
      const height = Math.ceil(body.getBoundingClientRect().height);
      if (height > 0) frame.style.height = `${height}px`;
    };
    frameSizeObserver = new ResizeObserver(fitHeight);
    frameSizeObserver.observe(body);
    fitHeight();
  });

  function navigate() {
    const selected = choices.find(choice => choice.hash === location.hash);
    if (!selected) return;
    showLab(selected.dataset.lab);
    section.scrollIntoView({ block: 'start' });
  }

  window.addEventListener('hashchange', navigate);
  section.addEventListener('click', event => {
    if (event.target.closest('[data-lab]')?.hash === location.hash) navigate();
  });
  const initial = choices.find(choice => choice.hash === location.hash)?.dataset.lab;
  const initialCase = location.hash.match(/^#case-(\d{2})$/)?.[1];
  showLab(initial || labForCase(initialCase) || '01');
  if (initial) requestAnimationFrame(navigate);
})();
