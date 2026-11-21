export const exhibits = [
  {
    id: 'wildfire', number: '01', title: '火迹 · 山火复盘', label: 'FireTrace · 社区版', area: '态势回放',
    original: 'https://github.com/Dingyi-studios/firetrace',
    source: {
      type: 'community', url: 'https://realkk.icu/firetrace/',
      caption: 'Dingyi-studios 发布的可操作工作台。支持三维地形、热像无人机和消防资源回放，使用演练数据。',
    },
    use: '先拖动事件时间轴，再选一架无人机跟踪火线，或在消防资源中回放一次洒水。火线、车辆、队员和投放画面会跟随同一事件时间。',
    reuse: '适合用来演示应急复盘，或参考地图、时间轴与多对象状态同步的实现。仓库公开，未标明开源许可证。',
    related: { id: 'wildfire-video', label: '看 Dilum 的原片' },
    play: {
      title: '山火模拟回放',
      label: '本地演示 · 模拟数据',
      caption: '拖动时间轴，对照火线、热点和无人机。下方汇总了真实地形与风场的后续接入方式。',
      load: () => import('./demos/wildfire.js').then(({ mountWildfire }) => mountWildfire),
    },
    future: {
      title: '用真实地形和风场推演火线',
      diagram: 'wildfire-roadmap.svg',
      diagramAlt: '山火演示与扩展路线图。上方是当前演练的工作原理，下方是历史数据准备、火线计算与网页回放，以及后期的风向对照和误差检验。',
      current: '本地演示用程序生成地形，火线按预设公式随时间扩张和偏移。社区工作台提供三维场景与资源回放。真实地形、风速和风向驱动的火线计算列为后续扩展。',
      steps: [
        {
          title: '选历史案例，准备数据',
          description: '用 USGS 3DEP 高程建地形，提取 NOAA HRRR 逐小时风场，用 LANDFIRE 匹配燃料类型。另备燃料含水率、起火位置和时间，以及有时间戳的历史边界。',
        },
        {
          title: '模型计算，网页回放',
          description: '将输入对齐到同一坐标系和时间基准。用 FARSITE 输出各位置的火到达时间及各时刻的模拟边界，再让地图、风场和过火面积随时间轴更新。历史边界和模拟边界分层显示。',
        },
      ],
      followup: '首个案例跑通后，可以固定其他输入，只改一段时间的风向做两组对照，再用留出的历史边界检查火线位置和过火面积的误差。',
      sources: [
        { label: 'USGS 地形', url: 'https://www.usgs.gov/3d-elevation-program/about-3dep-products-services' },
        { label: 'NOAA 风场', url: 'https://rapidrefresh.noaa.gov/hrrr/' },
        { label: 'LANDFIRE 燃料', url: 'https://www.landfire.gov/fuel/fbfm40' },
        { label: 'NIFC 火场记录', url: 'https://data-nifc.opendata.arcgis.com/' },
        { label: 'NASA 卫星估算边界', url: 'https://firms.modaps.eosdis.nasa.gov/descriptions/FEDS_VIIRS_SNPP.html' },
        { label: 'FARSITE 模型', url: 'https://research.fs.usda.gov/firelab/projects/flammap' },
      ],
    },
  },
  {
    id: 'wildfire-video', number: '01', title: '山火分析原片', label: 'Wildfire analysis', area: '原作录像',
    original: 'https://x.com/DilumSanjaya/status/2108241054298415258',
    source: {
      type: 'video',
      url: 'https://video.twimg.com/amplify_video/2108237504487047172/vid/avc1/1250x720/i4QWw8MWIDF5vPV1.mp4?tag=29',
      poster: 'https://pbs.twimg.com/amplify_video_thumb/2108237504487047172/img/UXDO8JrrYpZT17PA.jpg',
      width: 1250, height: 720,
      caption: 'Dilum Sanjaya 发布的 1 分 55 秒原片，展示三维地形、热区图层、无人机和火线回放。',
    },
    use: '录屏里可以看清三维地形、热区、无人机画面和事件时间轴如何配合。作者确认演示使用模拟数据。',
    reuse: '可参考态势回放的界面与工作流。目前未找到作者开放的运行入口、源码或可接入的数据。',
    related: { id: 'wildfire', label: '操作「火迹」社区版' },
    overview: {
      title: '山火分析',
      productName: 'Wildfire Analysis · Dilum Sanjaya',
      principle: '原片用模拟数据展示三维地形、热点和无人机回放。本地演示按预设公式让火线随时间扩张和偏移。',
      reuse: '复用地图图层、事件时间轴和多对象回放，搭建应急演练或事件复盘工具。',
      expansion: '接入真实地形、燃料和风场，对比不同条件下的火线，再用历史火场边界校验。',
      codeStatus: '原版未查到公开源码',
      demo: { route: 'wildfire/play', title: '山火模拟回放' },
    },
  },
  {
    id: 'chess', number: '02', title: '手绘国际象棋', label: 'Notebook chess', area: '游戏与教学',
    original: 'https://kevintngo.com/work/ballpoint-gambit/',
    source: {
      type: 'live', url: 'https://ballpoint-gambit.vercel.app/',
      caption: 'Kevin Ngo 发布的 Ballpoint Gambit，使用原版棋盘、主题和对局控件。',
    },
    use: '可以下棋，也可以进 Lessons 跟着语音老师 Quill 练习棋子走法。它把视觉主题和入门教学做进了同一款游戏。',
    reuse: '可参考它把规则拆成可练习步骤的方式。作者公开了试玩页，未查到可复用的源码或美术授权。',
    overview: {
      productName: 'Ballpoint Gambit',
      principle: '棋盘的画法与走棋规则分开。本地用棋规引擎判断走法，再用手绘棋子和棋盘呈现当前棋局。',
      reuse: '同一套棋规和对弈交互可以搭配不同的画风，也能用于练习走法。',
      expansion: '做主题棋盘、语音入门和分级残局训练，让初学者先学会走，再学会判断。',
      sourceLabel: '作者项目页',
      codeStatus: '未查到公开源码',
    },
    play: {
      title: '林间邮局',
      caption: '用手绘棋子和电脑对弈，或在同一台设备上双人对弈。棋局会保存在这个浏览器里。',
      load: () => import('./demos/chess.js').then(({ mountChess }) => mountChess),
    },
    future: {
      title: '把手绘风格做进一局棋',
      sample: 'chess-woodland-post-pieces.png',
      current: '原版把棋子、棋盘和手写素材画进 Canvas。林间邮局使用米白和松绿的手绘棋子，由 chess.js 判断走法，画面根据棋局更新。',
      steps: [
        {
          title: '风格样张',
          description: '把林间邮局主题放进标准开局。检查双方颜色、六种棋子的轮廓，以及选中和落点标记是否一眼能认出。',
        },
        {
          title: '实际对弈',
          description: '林间邮局已接入本地棋盘。可以和电脑或身边的人下一局，试试选中、落子、吃子和悔棋。',
        },
        {
          title: '按需增加主题和教学',
          description: '用同一套走棋规则支持换主题。入门关卡可以先做马走日，再加入解除将军和一步将死。',
        },
      ],
      sources: [
        { label: '原版手绘棋盘', url: 'https://kevintngo.com/work/ballpoint-gambit/' },
        { label: 'chess.js 规则文档', url: 'https://jhlywa.github.io/chess.js/' },
      ],
    },
  },
  {
    id: 'font', number: '03', title: '手写字体', label: 'Harshpreet Hand', area: '字体与工具',
    original: 'https://github.com/harshpreet931/harshpreet-hand',
    source: {
      type: 'live', url: 'https://harshpreet931.github.io/harshpreet-hand/',
      caption: 'Harshpreet Singh 发布的完整字体样张，包括在线试字、笔记照片对照和字符表。',
    },
    use: '试打带重复字母的英文，例如 hello，再切换字形变体。满意后可以下载字体，直接用于文档、卡片或网页。',
    reuse: '字体采用 SIL OFL 1.1，生成流程采用 MIT。可以用自己的笔迹运行生成流程。现有字库主要覆盖拉丁字母、数字和西欧重音字符。',
    resource: { label: '下载字体', url: 'https://github.com/harshpreet931/harshpreet-hand/releases/latest' },
    overview: {
      productName: 'Harshpreet Hand',
      principle: '从手写笔记中提取字形轮廓，转成矢量并打包为字体。常见字母有多种写法，保留自然的笔迹变化。',
      reuse: '复用字形提取和字体打包流程，用自己的笔迹生成可安装字库。',
      expansion: '制作个人或品牌字体，扩大字库覆盖。工坊还展示了如何把一幅画的风格用于新的题材。',
      sourceLabel: '字库与生成源码',
      codeStatus: '生成流程 MIT · 字体 OFL 1.1',
    },
    play: {
      title: '笔迹字体工坊',
      caption: '在画板上重写字母，试打新字形，下载自己的 OTF 字体。下方可用梵高《卧室》做绘画参考。',
      label: '原创体验 · 字形与画风',
      load: () => import('./demos/font-workshop.js').then(({ mountFontWorkshop }) => mountFontWorkshop),
    },
    future: {
      title: '把个人笔迹与画风变成可重复使用的素材',
      current: '原库从笔记提取字形并打包为字体。本地工坊支持重写 A–Z、实时试字与 OTF 导出。画风研究另有《卧室》到《雨后的阳台》、虹桥原画到春市，以及现代上海长卷的对照。',
      steps: [
        { title: '字体复用', description: '把个人字形做成可安装的字库，供卡片、网页与文档使用。扩充数字和标点后，可覆盖更多真实排版场景。' },
        { title: '绘画参考', description: '从参考图观察构图、配色与笔触，在新的场景中重新安排主体。工坊展示的是已完成的再创作样张。' },
        { title: '按需扩展', description: '字体方向可增加照片提取和字符覆盖，绘画方向可增加参考图输入与作品版本对照。' },
      ],
      sources: [
        { label: '原字库与生成流程', url: 'https://github.com/harshpreet931/harshpreet-hand' },
        { label: '《卧室》馆藏说明', url: 'https://www.artic.edu/artworks/28560/the-bedroom' },
      ],
    },
  },
  {
    id: 'induction', number: '04', title: '交互式电磁场', label: 'Induction bench', area: '科学可视化',
    original: 'https://github.com/thebuggeddev/electromagnetism',
    source: {
      type: 'live', url: 'https://electromagnetism.wasmer.app/',
      caption: '作者发布的 Induction Bench，保留原版三维线圈、磁铁、场线和仪表。',
    },
    use: '让磁铁分别从两个方向穿过线圈，比较电压和电流的方向。适合课堂上先预测、再操作验证。',
    reuse: '原仓库可以阅读和运行，未标明开源许可证。可以研究三维场线、实验动作与仪表之间的同步方式。',
    overview: {
      productName: 'Induction Bench',
      principle: '移动磁铁会改变穿过线圈的磁通。实验台用法拉第定律计算感应电压，让场线、仪表和波形随操作更新。',
      reuse: '复用三维模型、可调参数和即时反馈，做能反复操作的科学实验。',
      expansion: '扩展到发电机与不同线圈的对照实验，接入实测电压验证曲线。',
      sourceLabel: '作者项目仓库',
      codeStatus: '源码公开 · 未见许可证',
    },
    play: {
      title: '三维电磁感应实验台',
      caption: '在三维视图中移动磁铁，比较检流计、磁通与波形，再改变速度做对照。',
      label: '原创体验 · 三维实验',
      load: async () => {
        const [{ mountInduction }, { mountInductionScene }] = await Promise.all([
          import('./demos/induction.js'),
          import('./demos/induction-scene.js'),
        ]);
        return root => mountInduction(root, { createScene: mountInductionScene });
      },
    },
    future: {
      title: '从可操作的装置到可对照的实验',
      current: '本地实验台把三维装置、检流计、磁通与波形接在同一组参数上，支持反转磁极、改变匝数、速度与观察视角。读数采用简化模型的相对单位。',
      steps: [
        { title: '课堂对照', description: '只改速度或匝数，观察电动势峰值和方向。现有速度对照可直接用于先预测、后验证的练习。' },
        { title: '接实测数据', description: '导入带时间戳的磁铁位置和电压，标定单位后叠加曲线，比较峰值与过零点。' },
        { title: '更多装置', description: '增加旋转线圈、负载与发电机模型，研究转速、频率和功率之间的关系。' },
      ],
      sources: [
        { label: '作者实验仓库', url: 'https://github.com/thebuggeddev/electromagnetism' },
        { label: '法拉第定律', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law' },
      ],
    },
  },
  {
    id: 'angio', number: '05', title: '冠脉造影教学', label: 'Coronary projection', area: '空间教学',
    original: 'https://x.com/AnnasRahmanMD/status/2107153860271706177',
    source: {
      type: 'live', url: 'https://angioview.com/',
      caption: 'Annas Rahman 发布的 AngioView，使用原站的解剖模型、造影视图和拍摄角度预设。',
    },
    use: '选择两个拍摄角度，观察同一冠脉分支在三维模型和二维造影中的对应关系，练习识别重叠和缩短。',
    reuse: '原站可直接用于造影视角教学。作者公开了数据与模型的来源说明，未查到应用源码。',
    overview: {
      productName: 'AngioView',
      principle: '改变拍摄角度，将同一组三维冠脉投影到二维平面，观察分支如何重叠或缩短。',
      reuse: '复用三维结构与二维影像联动的教学方法，帮助学员建立空间对应关系。',
      expansion: '做多视角病例题库，练习辨认分支和选择角度，也可延伸到 CT 切面和超声探头训练。',
      sourceLabel: '作者原帖',
      codeStatus: '未查到应用源码',
      demo: { route: 'angio/play', title: '冠脉投影练习' },
    },
    play: {
      title: '冠脉投影练习',
      label: '本地演示 · 教学模型',
      caption: '调整角度对照三维血管和二维投影，再做缩短、视角选择和跨视角识别练习。',
      load: () => import('./demos/angio.js').then(({ mountAngio }) => mountAngio),
    },
  },
  {
    id: 'haiku', number: '06', title: '二十首俳句动画', label: 'Twenty haiku', area: '程序化叙事',
    original: 'https://x.com/kevin_t_ngo/status/2107939123818574231',
    source: {
      type: 'video',
      url: 'https://video.twimg.com/amplify_video/2107938456404160512/vid/avc1/720x720/J2ecfhpsNkcOEo0E.mp4?tag=29',
      poster: 'https://pbs.twimg.com/amplify_video_thumb/2107938456404160512/img/oowoHvH55FWXJnCs.jpg',
      width: 720, height: 720,
      caption: 'Kevin Ngo 发布的 40 秒方形原片，收录二十首英文俳句、手绘线条、不同纸色与原声。',
    },
    use: '作者请 Claude Haiku 5.5 写了 20 首俳句，并用 JavaScript 逐帧绘制。每首诗围绕一个意象，用纸纹、手绘线条和简短动作把它变成镜头。',
    reuse: '可借鉴纸纹、铅笔笔触和方形构图，也可以复用让画面、诗句和声音跟随同一条时间轴的做法。作者公开了成片和制作说明，目前未找到原动画工程。',
    overview: {
      productName: 'Twenty Haiku · Kevin Ngo',
      principle: '原作让 AI 写俳句，再用 JavaScript 逐帧绘制。工坊根据一句主题生成诗和镜头方案，由网页画出动画。',
      reuse: '复用纸上手绘风格、时间轴和导出工具。更换主题即可重新生成构图和动作。',
      expansion: '做诗文课堂、节令短片和展览内容，也可以加入朗读、字幕和多幕编排。',
      codeStatus: '未查到原动画工程',
    },
    play: {
      title: '短诗动画工坊',
      label: '原创体验 · 纸上动画',
      caption: '编辑、播放和导出《从暮到晓》的五幕示例。本机工坊还可输入一句主题，生成三行诗和纸上手绘镜头。',
      load: () => import('./demos/haiku-workshop.js').then(({ mountHaikuWorkshop }) => mountHaikuWorkshop),
    },
    future: {
      title: '把纸上手绘风格做成创作入口',
      current: '在本机工坊输入一句主题，AI 写三行诗，并决定画什么、怎么动、何时出现。网页用统一的纸上手绘风格逐帧绘制并自动播放。输入「雨停后的城市」，就生成了雨滴落进路灯倒影、荡开水纹的镜头。生成稿可改诗句、调片长或导出视频。画面细节取决于工坊支持的画法。',
      steps: [
        { title: '诗文课堂', description: '给一首诗做两个镜头版本，让学生选择哪种画面更贴近诗句，并说出取舍。' },
        { title: '节令与展览短片', description: '用同一套纸色和笔触生成不同主题的镜头，编排成系列，再按展屏和社交平台的尺寸导出。' },
        { title: '旁白与字幕', description: '把朗读的停顿对齐到动作节点，提供逐句时刻调整，并导出含声音的短片。' },
      ],
      sources: [
        { label: 'Kevin Ngo 原片与发布说明', url: 'https://x.com/kevin_t_ngo/status/2107939123818574231' },
        { label: 'Claude 官方制作说明', url: 'https://x.com/claudeai/status/2111177845846495646' },
      ],
    },
  },
];

export const archive = {
  wildfire: {
    title: '山火分析',
    caption: '拖动时间轴，观察模拟火线、热点和响应队伍。',
    load: () => import('./demos/wildfire.js').then(({ mountWildfire }) => mountWildfire),
  },
  chess: {
    title: '手绘国际象棋',
    caption: '在手绘棋盘上走子、撤销，或和简易电脑对弈。',
    load: () => import('./demos/chess.js').then(({ mountChess }) => mountChess),
  },
  font: {
    title: '手写字体',
    caption: '输入文字，切换字号、字重和字形变体。',
    load: () => import('./demos/font.js').then(({ mountFont }) => mountFont),
  },
  induction: {
    title: '交互式电磁场',
    caption: '移动磁铁，观察简化模型的磁场和感应曲线。',
    load: () => import('./demos/induction.js').then(({ mountInduction }) => mountInduction),
  },
  angio: {
    title: '冠脉造影教学',
    caption: '调整拍摄角度，对照空间示意和二维投影。',
    load: () => import('./demos/angio.js').then(({ mountAngio }) => mountAngio),
  },
  haiku: {
    title: '二十首俳句动画',
    caption: '切换本地创作的二十首短诗，播放或拖动程序动画。',
    load: () => import('./demos/haiku.js').then(({ mountHaiku }) => mountHaiku),
  },
};
