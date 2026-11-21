const studies = {
  'wildfire-video': {
    image: 'research/fire.jpg',
    outcome: '拖动时间轴，查看火线、热点、无人机和隔离带的同步回放。',
    implementation: '原片展示三维地图和多对象回放。本地用预设公式计算火线扩张与偏移，再按同一时间轴更新热点、无人机与隔离带。',
    try: '拖到 T+18 小时，切换热点与无人机图层，再播放火线的变化。',
    boundary: '本地地图和火线使用模拟数据。风向、风速和真实地形推演属于后续扩展。',
  },
  chess: {
    image: 'research/chess.jpg',
    outcome: '林间邮局手绘棋盘，可以本地双人或和简易电脑对弈，支持悔棋和棋局保存。',
    implementation: '棋规与画法分开。本地由 chess.js 判断合法走法、将军和结束状态，手绘素材负责呈现，简易电脑从合法走法中作出选择。',
    try: '选择一枚棋子，查看可走位置。落子后悔棋，或切到挑战电脑再下一步。',
    boundary: '手绘主题和规则已接入。语音老师、分级残局和完整课程列为扩展方向。',
  },
  font: {
    image: 'research/font.jpg',
    outcome: '重写字母、实时试字并导出 OTF。绘画部分有《卧室》、虹桥集市和现代上海长卷对照。',
    implementation: '原库从笔记提取轮廓并打包字体。本地先提供字母画板，把笔画转成字形轮廓，再用 opentype.js 导出 OTF；画风实验是另行生成的参考再创作样张。',
    try: '清空一个字母，在画板上重写并应用字形，再到试字区输入该字母并下载字体。',
    boundary: '本地字形编辑支持 A–Z 和空格。画风实验使用已生成的作品，生成新题材需要新的创作过程。',
  },
  induction: {
    image: 'research/induction.jpg',
    outcome: '三维磁铁、线圈、场线与仪表联动，支持改变匝数、磁极和往复速度。',
    implementation: '本地用 Three.js 呈现磁铁、线圈与场线。理想偶极场用于估算线圈磁通，按磁通变化率计算感应电动势，并同步更新仪表和波形。',
    try: '先看自动往复时的波形，再反转磁极。滚到速度对照，比较峰值与方向。',
    boundary: '理想偶极场与简化电路采用相对单位，适合观察关系。接真实仪器需要标定。',
  },
  angio: {
    image: 'research/angio.jpg',
    outcome: '本地双视图投影和三个互动练习，演示缩短、视角选择以及同一分支的跨视角识别。',
    implementation: '把同一组三维教学分支按不同观察角度投影到二维。本地练习通过标记间距、分支对应和动画回放说明重叠、缩短与视角的关系。',
    try: '先改变投影角度，再展开第二课选择一个视角，提交后查看空间投影回放。',
    boundary: '练习使用简化教学分支。真实影像病例库、测量和临床工作流需另行准备与验证。',
  },
  haiku: {
    image: 'research/haiku-ai.jpg',
    outcome: '编辑、播放与导出五幕短片，回看雨后城市生成稿。本机工坊可从一句主题生成诗和镜头。',
    implementation: '本机把主题交给 AI 生成诗句和镜头 JSON；网页校验后，用现有纸纹、手绘元素和动作逐帧绘制到 Canvas，支持播放与 WebM 导出。',
    try: '先播放已完成的短片，再进工坊修改示例诗句和片长。本机启动后，还可以输入新主题生成。',
    boundary: 'AI 在现有绘图元素和动作范围内编排。新主题生成依赖本机已登录的 Codex 与网络；公开版提供示例编辑、播放和导出。',
  },
};

const url = path => `${import.meta.env.BASE_URL}${path}`;
const external = (href, label) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;

export function researchProjects(exhibits) {
  return exhibits.filter(item => item.overview).map(item => ({
    ...item,
    study: studies[item.id],
    demo: item.play ? { route: `${item.id}/play`, title: item.play.title } : item.overview.demo,
  }));
}

export function renderResearchGallery(exhibits) {
  return `
    <section class="lab-research-gallery" aria-labelledby="lab-gallery-title">
      <h3 id="lab-gallery-title">六个演示，直接打开体验</h3>
      <p class="lab-research-lead">每张图来自本地演示。原版、社区实现和研究说明可在下方对照。</p>
      <div class="lab-research-cards">
        ${researchProjects(exhibits).map(item => `
          <article class="lab-research-card">
            <a href="#${item.demo.route}" aria-label="打开${item.demo.title}">
              <img src="${url(item.study.image)}" alt="${item.overview.title ?? item.title}的本地演示画面" width="920" height="480" loading="lazy">
            </a>
            <div class="lab-research-card-body">
              <p class="lab-section-index"><span>${item.number}</span> 本地演示</p>
              <h4>${item.overview.title ?? item.title}</h4>
              <p class="lab-product-name">${item.overview.productName}</p>
              <p>${item.study.outcome}</p>
              <div class="lab-research-links">
                <a class="lab-play-link" href="#${item.demo.route}">${item.demo.title} →</a>
                <a href="#${item.id}">看原版与研究 →</a>
              </div>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
}

export function renderResearchNotes(item, exhibits) {
  const project = researchProjects(exhibits).find(entry =>
    entry.id === (item.id === 'wildfire' ? 'wildfire-video' : item.id));
  if (!project) return '';
  const { overview, study } = project;
  const summary = [
    ['已完成的效果', study.outcome],
    ['动手试一次', study.try],
    ['原理与本地实现', study.implementation],
    ['可复用能力', overview.reuse],
    ['后续扩展', overview.expansion],
    ['当前范围', study.boundary],
  ];
  return `
    <div class="lab-extension-title">
      <div><p class="lab-section-index"><span>${project.number}</span> RESEARCH NOTES</p>
      <h3 id="lab-extension-title">效果与研究笔记</h3></div>
      <a href="#overview">返回六项总览 →</a>
    </div>
    <dl class="lab-research-notes">
      ${summary.map(([title, description]) => `<div><dt>${title}</dt><dd>${description}</dd></div>`).join('')}
    </dl>
    <p class="lab-research-source-note">源码记录 · ${overview.codeStatus}</p>
    <div class="lab-resource-links">
      ${external(project.source.type === 'video' ? project.original : project.source.url,
        project.source.type === 'video' ? '作者原片与说明' : '作者在线版')}
      ${overview.sourceLabel ? external(project.original, overview.sourceLabel) : ''}
      <a href="#${project.id}">完整原作展台与扩展说明 →</a>
    </div>`;
}

export function renderResearchUnderstanding() {
  return `
    <section class="lab-research-results" aria-labelledby="lab-understanding-title">
      <h3 id="lab-understanding-title">我们的理解 · 从产品效果到可复用机制</h3>
      <dl class="lab-research-notes">
        <div><dt>风格与规则分别复用</dt><dd>手绘象棋用主题改变体验，棋规独立判断走法；手写字体把个人字形变成可安装素材。画风参考实验则观察构图、配色与笔触，再创作新的题材。</dd></div>
        <div><dt>让同一数据驱动不同画面</dt><dd>山火用共同时间轴组织火线与资源回放，电磁实验让参数、三维装置和仪表同步，冠脉教学让同一空间结构对应不同角度的投影。</dd></div>
        <div><dt>给创作一个可执行的范围</dt><dd>俳句工坊把主题变成诗句和镜头方案，再用统一纸纹、画法与时间轴执行。可复用的是编排和制作流程，新的题材仍受支持的元素与动作限制。</dd></div>
        <div><dt>按实际能力决定下一步</dt><dd>当前山火是模拟回放，电磁与冠脉使用教学模型，绘画是已完成的参考再创作。真实数据推演、病例应用和教学收益需要继续验证；新主题 AI 生成需本机服务。</dd></div>
      </dl>
    </section>`;
}

export function renderResearchResults() {
  const images = [
    ['van-gogh-the-bedroom-1889.jpg', '参考原画 · 梵高《卧室》'],
    ['balcony-after-the-rain.png', '我们的创作 · 《雨后的阳台》'],
    ['qingming-zhang-zeduan-hongqiao.jpg', '参考原画 · 《清明上河图》虹桥局部'],
    ['qingming-hongqiao-spring-market.png', '我们的创作 · 《虹桥春市》'],
    ['huangpu-river-spring-scroll.png', '我们的创作 · 《黄浦江春景》'],
  ];
  return `
    <section class="lab-research-results" aria-labelledby="lab-results-title">
      <h3 id="lab-results-title">研究中完成的作品</h3>
      <p class="lab-research-lead">原画与再创作、程序动画与 AI 生成稿，集中回看。</p>
      <details class="lab-results-detail">
        <summary>原画与我们的画风实验 · 5 幅</summary>
        <div class="lab-results-images">
          ${images.map(([path, caption]) => `<figure>
            <a href="${url(path)}" target="_blank" rel="noopener noreferrer">
              <img src="${url(path)}" alt="${caption}" loading="lazy"></a>
            <figcaption>${caption}</figcaption>
          </figure>`).join('')}
        </div>
        <p><a href="#font/play">进入笔迹与画风工坊，查看构图、配色和笔触分析 →</a></p>
      </details>
      <details class="lab-results-detail">
        <summary>已完成的动画短片 · 2 部</summary>
        <div class="lab-results-films">
          ${[
            ['research/dusk-to-dawn.webm', 'research/dusk-to-dawn-poster.jpg', '《从暮到晓》', '15 秒 · 纸鸢、檐雨、夜航、窗霜和晨鸟五幕'],
            ['research/rain-city.webm', 'research/rain-city-poster.jpg', '《雨停后的末班站》', '6 秒 · 主题「雨停后的城市，安静一点」的 AI 生成稿'],
          ].map(([path, poster, title, description]) => `<figure>
            <video controls playsinline preload="none" width="720" height="720" poster="${url(poster)}" aria-label="${title}已完成短片">
              <source src="${url(path)}" type="video/webm">
              <a href="${url(path)}">下载${title}</a>
            </video>
            <figcaption><strong>${title}</strong><br>${description}</figcaption>
          </figure>`).join('')}
        </div>
        <p><a href="#haiku/play">进入短诗工坊，编辑镜头或生成一个新主题 →</a></p>
      </details>
    </section>`;
}
