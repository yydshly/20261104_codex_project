'use strict';

(() => {
  const root = document.getElementById('reference-comparison-root');
  if (!root) return;
  const post = 'https://x.com/EiiKwesiKay/status/2120958808789029021';
  const directory = 'assets/divine-multiverse/';
  const draftAsset = 'assets/original-keyframes/twilight-terrace-city-arch-v3.png';
  const draftRecord = 'reference/twilight-terrace-city-arch-iterations-20261113.json';
  const iterations = [
    {version:'V1',title:'近处巨拱，强调压迫感',asset:'assets/original-keyframes/twilight-terrace-city-arch-v1.png',text:'巨拱裁出画面，近距离体量强烈；城内路线被近景与巨拱分散了注意。',record:'reference/twilight-terrace-city-arch-v1-generation.json'},
    {version:'V2',title:'显露路线，巨拱偏小',asset:'assets/original-keyframes/twilight-terrace-city-arch-v2.png',text:'S形路线连接远处暖光目的地，巨拱完整可见；天空留白增加，奇观存在感减弱。',record:draftRecord},
    {version:'V3',title:'远处巨构，保留进入感',asset:draftAsset,text:'保留V2的路线，增大远处巨拱的体量，完整留出拱顶；兼顾行进方向与主要地标。',record:draftRecord}
  ];
  const phases = [
    {time:'00.10', label:'开场：奇观已经成立', text:'巨大环形结构、笔直街道、两侧密集楼体在第一处抽帧中已经同框。地面上的小人和重复楼层提供尺度，街道灯带把视线送到远处亮点。', limit:'这能证明开场已有环状奇观，不能证明城市由平地逐渐卷起。'},
    {time:'05.00', label:'中段：近景退出，空间展开', text:'与开场相比，近处楼体和路面细节的画面位置发生较大变化；远处街道亮点仍在相近方向。观看获得沿街向前滑行的感受，环形结构继续占据上半幅。', limit:'这是透视、遮挡和相对变化的观察；局部形态变化仍可能参与，不能据此还原精确三维机位。'},
    {time:'10.00', label:'结尾：更接近，也更开阔', text:'两侧近楼进一步退出，更多屋顶、远城和天空显露。巨环在画面中更大，街道仍通向远处。结尾停在“继续接近”的状态。', limit:'这条片没有呈现穿过巨环或切换到另一个宇宙，不能把标题直接当作画面中发生的事件。'}
  ];
  const mechanisms = [
    {n:'01', title:'把熟悉的城市接到异常的大形上', fact:'楼层、街道、灯带和行人都熟悉；跨过天空的巨环打破尺度与空间常识。', driver:'熟悉细节让观众能读懂世界，异常的大形制造奇观。原片开场就已建立这层关系。', reuse:'我们可以先选一个清楚的大形：环、拱、螺旋或悬空桥，再用可读的路线和尺度参照把它接起来。'},
    {n:'02', title:'路是视线轨道，巨环是观看目标', fact:'道路的边缘灯带朝远处收束，两侧楼群形成纵向框景；明亮环缘与暗天空形成清楚的图底关系。', driver:'近处有入口，中间有路线，远处有值得接近的东西。巨环不需要被整幅展示，裁出画面也会加强尺度。', reuse:'先设计“从哪里看、沿什么看、最后看哪里”，再增加环境细节。它与 A 的中轴、I 的重复框景和 L 的门外展开可以关联。'},
    {n:'03', title:'让镜头承担探索动作', fact:'时间序列中没有被持续追踪的单一骑行主体；小行人主要给街道与建筑提供尺度。两侧近景的变化比远处目标明显。', driver:'画面能形成高位向前巡游的观看感受。观众的代入来自观看位置的变化，而不是必须跟随一个人物。', reuse:'动作设计可以分成“主体带着我们走”和“镜头带着我们走”。先判断场景需要哪一种，再决定是否放入骑行主角。'},
    {n:'04', title:'用亮度层次组织氛围', fact:'近城偏暗，环缘偏亮，地平线有暖色光；雾化使远城更淡，天空与街道保留大面积暗部。', driver:'局部明亮与暗部的反差形成光感，远处雾化拉开纵深。它不依赖整幅高曝光，也不是整幅高饱和。', reuse:'设计暗部骨架、亮边主形、暖色落点和远景雾化。控制视线主次，再讨论 HDR 交付。'}
  ];
  const rows = [
    ['异常空间','弧形海岸、卷曲道路与城市。','城市与天空中的巨大环形结构。','把现实元素组织成不可能的大形；先保证大形可读。'],
    ['尺度参照','单个骑行者常是明确参照。','小行人、楼层和沿街灯带共同参照。','尺度参照可以存在，固定主角可以省去。'],
    ['观看驱动','跟在主体后方，接近或沿路进入。','沿街向前巡游的观感，逐渐露出更多城市。','研究相对运动、遮挡解除和空间展开。'],
    ['注意力落点','前方路线、巨构或旋涡终点。','街道远处亮点与上方巨环。','路和奇观共同组织视线，不能只铺满细节。'],
    ['节律与情绪','主体动作、跟随关系、近景掠过共同作用。','持续推进与细节渐显，可提出庄严、神秘的氛围判断。','视觉事件的密度与变化幅度也能构成节律；情绪仍是解读。'],
    ['光色证据','已核对的三条播放变体有 BT.2020 / HLG 信令。','本次取得的 720p 变体为 8-bit，未报告 HLG/PQ 或 BT.2020 信令。','高光观感与 HDR 格式分别记录，不能按画面亮不亮判定。']
  ];
  const makingSteps = [
    {title:'先定一个能被记住的大形', work:'先画原创构图草案：一个主巨构、两侧近景、一条清楚的路和少量尺度参照。用大块明暗判断主次，再细化城市。', check:'缩小观看，能否迅速读出巨构轮廓、进入方向和远处落点？'},
    {title:'把首帧美术做完整', work:'确定近中远层次、同一套建筑构件、材质和光源方向。先让一张静止画面成立，再安排运动。', check:'遮住标题和情绪词，画面是否仍有安静、庄严和巨大尺度的线索？'},
    {title:'先画清楚空间怎样被展开', work:'用开场—展开—落点记录：哪根近柱退出、哪个桥段出现、远处巨构怎样更清楚。这一轮仍以静态设计呈现。', check:'每个阶段是否让观众多看见具体景物，而不只是放大同一张图？'},
    {title:'后续用单一运镜验证', work:'进入运动制作时，可先用已确认的原创首帧做图生视频验证，集中检查沿路前进与近远景变化。此为我们的候选制作方式，未确认原作者采用它。', check:'建筑构件、路线和远处目标是否连续？近景退出与远景稳定能否同时成立？'},
    {title:'最后统一光色与声音', work:'后期先统一暗部、环缘或拱缘亮度和暖色落点，保留亮部纹理；辉光围绕局部亮部使用。声音另行设计，不借未听辨的原片音轨作结论。', check:'亮部是否有层次，整幅是否仍有明暗主次？声音是否支持探索感，而非抢走景观？'}
  ];
  const imagePrompt = '为竖屏景观短片设计一张9:16原创电影环境概念关键帧。目标感受是：一个渺小的来访者，安静地接近超出日常尺度的文明。场景为暮色中的古铜色阶梯城市，一座偏心的巨型悬空拱跨过远城；拱的整体轮廓简洁，内部由有厚度的分层构件、板块和细小照明组成。拱顶局部越出画框。两侧较暗的近处建筑框住一条连续主街，街道由画面下方向远处一个温暖亮点收束；少量微小行人和重复楼层用于标定尺度。前景坚实而暗，中景保留可读结构，远城被薄雾轻轻分开，天空和拱内保留安静空白。暗青灰与低饱和古铜色统领画面，暖色地平线和局部明亮拱缘组织视线，亮部仍看得见构件纹理。厚重、可信的建筑材质，统一光源方向。单一主要巨构，环境为主；不添加大特写人物、拥挤的多重地标、文字、标志、爆炸或满屏霓虹。';
  const motionPrompt = '后续运动阶段使用，须以已确认的原创首帧为输入。一个连续镜头，缓慢、平稳地沿主街向前滑行，保持主要观看方向和视平线稳定。开场保留两侧近楼的框景；随后近处建筑逐步从画面两侧退出，露出更多屋顶、桥段和远城，巨拱作为主要地标逐渐接近。近景相对变化明显，远处目标变化克制；道路保持连接，建筑构件与巨拱轮廓保持连续。细小人物自然处于街道空间中。结尾留在更开阔的观看位置，让路径仍有延续。全程保持暮色、光源方向与材料关系；不同时叠加环绕、急升、快速变焦、巨构自转或城市卷起。';
  root.innerHTML = `
    <div class="chapter-header"><p class="eyebrow">ORIGINAL COMPOSITION / REFERENCE COMPARISON</p><h1 id="comparison-title">暮色阶梯城，<br>巨拱悬在城市之上。</h1><p class="lead">从近处巨拱的压迫感，继续设计成沿路接近远处地标的探索感。当前重点展示V3，并保留V1、V2，让尺度、路线和明暗的取舍可以对照。</p></div>
    <div class="rc-source-line"><span class="status-pill">新参考 · 已核对原片</span><span>@EiiKwesiKay 发布 · 约 10.13 秒 · 9:16</span><a class="text-link" href="${post}" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a></div>
    <p class="rc-reading-note">以下将原片可见事实、视觉机制解释和我们的扩展设想分开。账号发布不等于制作来源已确认；原帖文字没有说明工具链。</p>
    <section class="rc-scene-gif" aria-labelledby="rc-scene-gif-title">
      <div class="section-heading"><div><p class="eyebrow">LOCAL GIF / SCENE PREVISUALIZATION</p><h2 id="rc-scene-gif-title">沿S形道路前进，让近楼逐渐退出。</h2></div><p>GIF V2 · 取材静态V3 · 本地视差预演。</p></div>
      <div class="rc-scene-gif-layout"><figure><img id="rc-scene-gif-image" src="assets/gif-studies/terrace-city-approach-local-v2-poster.png" alt="暮色阶梯城沿路接近巨拱的本地GIF预演，近景变化较明显，远处巨拱相对稳定" width="420" height="691" loading="lazy"><figcaption><button class="button primary" type="button" data-scene-gif-toggle aria-pressed="false" aria-controls="rc-scene-gif-image">播放GIF预演</button><span id="rc-scene-gif-status" aria-live="polite">静态首帧</span></figcaption></figure><div class="rc-scene-gif-notes"><span class="status-pill">本地制作 · 未使用外部生成服务</span><h3>沿路转向，近景退出。</h3><p>观看方向轻微向左跟随道路弯势，再回正接近远处巨拱。两侧近楼与路面的位移明显强于远城，巨拱缓慢靠近；由不同深度的投影变化加强前进感。</p><dl><div><dt>时长与格式</dt><dd>约6.2秒循环：5秒推进，加首尾停留。420×691，约6.6MB，无声GIF。</dd></div><div><dt>制作方式</dt><dd>直接使用V3静态图，在本地以估计深度构成点层，移动观看位置并轻微转向，再按遮挡关系合成；没有调用外部视频生成。</dd></div><div><dt>判断范围</dt><dd>适合看推进幅度、节律和氛围。新显露的窄边缘只能局部近似填补，人物也没有独立动作；这不是已验证的三维运镜。</dd></div></dl><div class="rc-scene-gif-links"><a class="text-link" href="assets/gif-studies/terrace-city-approach-local-v2.gif" download>下载新版GIF ↗</a><a class="text-link" href="assets/gif-studies/terrace-city-approach-local.gif" target="_blank" rel="noopener">上一版（推进较轻）↗</a><a class="text-link" href="reference/terrace-city-approach-local-v2-gif.json" target="_blank" rel="noopener">制作记录 ↗</a></div></div></div>
    </section>
    <section class="rc-draft-study" aria-labelledby="rc-draft-title">
      <div class="section-heading"><div><p class="eyebrow">STATIC DESIGN ITERATIONS / V1 → V3</p><h2 id="rc-draft-title">沿路接近巨构，让进入方向更清楚。</h2></div><p>左侧原片5秒抽帧，右侧原创V3；均保留完整画幅。</p></div>
      <div class="rc-draft-pair">
        <figure><div class="rc-draft-label"><span>REFERENCE / 原片抽帧</span><span>5.00s</span></div><button class="image-button rc-draft-frame" data-image="${directory}frame-05.00.jpg" data-image-title="参考原片 · The Divine Multiverse · 5.00秒" aria-label="放大参考原片5秒抽帧"><img src="${directory}frame-05.00.jpg" alt="参考原片：暗色密集城市的中轴街道通向巨大明亮闭合环形结构" loading="lazy"></button><figcaption><h3>The Divine Multiverse</h3><p>闭合巨环、笔直街道、密集工业感结构；较冷的暗部托住明亮环缘。</p><a class="text-link" href="${post}" target="_blank" rel="noopener noreferrer">@EiiKwesiKay 原帖 ↗</a><span class="rc-draft-meta">720 × 1280 · 原片研究帧</span></figcaption></figure>
        <figure><div class="rc-draft-label"><span>ORIGINAL / AI静态设计</span><span>V3 / 本轮方向</span></div><button class="image-button rc-draft-frame" data-image="${draftAsset}" data-image-title="原创构图V3 · 远处巨构与S形进入路线" aria-label="放大原创暮色阶梯城与悬空巨拱草案"><img src="${draftAsset}" alt="原创V3：暖灯S形道路穿过暮色阶梯城，通向远处明亮台地，上方是完整可见的悬空开放巨拱" loading="lazy"></button><figcaption><h3>暮色阶梯城＋悬空巨拱 · V3</h3><p>S形路线连接近景与目的地；巨拱后移到城市深处，并恢复足够体量。近景较暗，暖光聚向路线和远处落点。</p><a class="text-link" href="${draftRecord}" target="_blank" rel="noopener">本轮生成记录与完整提示词 ↗</a><span class="rc-draft-meta">1055 × 1491 · 内置 image_gen 编辑迭代 · RGB PNG</span></figcaption></figure>
      </div>
      <p class="rc-reading-note">两张图的布局、材质和画幅不同，均完整呈现。V1由文字独立生成，V2编辑V1，V3编辑V2；原片未作为图片输入。三个版本是静态设计迭代，不是连续帧或严格单变量实验，细节可能随生成改变。</p>
      <div class="rc-iterations"><h3>这轮怎样调整：体量 → 路线 → 平衡</h3><div class="rc-iteration-grid">${iterations.map(i=>`<article${i.version==='V3'?' class="is-current"':''}><div class="rc-draft-label"><span>${i.version}</span><span>${i.version==='V3'?'当前重点':'保留的设计过程'}</span></div><button class="image-button rc-iteration-image" data-image="${i.asset}" data-image-title="原创静态设计${i.version} · ${i.title}" aria-label="放大${i.version}：${i.title}"><img src="${i.asset}" alt="暮色阶梯城${i.version}：${i.title}" loading="lazy"></button><h4>${i.title}</h4><p>${i.text}</p><a class="text-link" href="${i.record}" target="_blank" rel="noopener">生成记录 ↗</a></article>`).join('')}</div></div>
      <div class="rc-draft-notes">
        <article><span>借鉴 01 / 巨构与尺度</span><h3>闭合巨环 → 悬空开放巨拱</h3><p>保留“一个强烈大形＋微小人物”的尺度关系。草案让两端与下方城市之间出现明确空气间隙，以厚重块体表现悬浮奇观。</p></article>
        <article><span>借鉴 02 / 路线与框景</span><h3>中轴夹道 → S形进入阶梯城</h3><p>保留近处建筑包围和街道引导。迭代把宽街接成可辨认的S形上行路线，通向巨拱下方的暖光台地；桥与层层退台重新组织纵深。</p></article>
        <article><span>借鉴 03 / 疏密与层次</span><h3>密集工业结构 → 厚重石城与留白</h3><p>保留两侧较密、中间较空和远景雾化。阶梯台地与拱下天空让巨构轮廓可辨，近景、街道、远城形成不同观看距离。</p></article>
        <article><span>借鉴 04 / 局部亮部</span><h3>亮环与暗城 → 暖色拱缘、街灯与暮光</h3><p>保留暗部承托亮部的关系，改用古铜色、暖灰石与青灰天空。暖光面积更大，因此草案更温暖庄严，原片的冷峻陌生感有所减弱。</p></article>
      </div>
      <div class="rc-draft-review"><h3>V3的取舍：保留奇观，也让路带人进入。</h3><p>V1强调近处巨拱的压迫感；V2让路线更清楚，但巨拱偏小。V3保留S形路线和完整拱顶，增强远处地标体量，近中远关系更容易沿路阅读。</p><p>这仍是静态设计评阅。巨拱与下方屋顶的空气间隙较克制，后续可以继续关注悬浮可读性；精确三维位置、建筑细节一致性与运动都未验证。</p></div>
    </section>
    <section class="rc-design-study" aria-labelledby="rc-design-title">
      <div class="section-heading"><div><p class="eyebrow">DESIGN BEFORE TOOLS</p><h2 id="rc-design-title">先看设计：为什么它能形成这种氛围？</h2></div><p>画面观察为依据；庄严、神秘与敬畏是本研究的视觉解读。</p></div>
      <p class="rc-design-thesis">简单而巨大的轮廓，承接密集而熟悉的城市细节；稳定、持续的接近，让观众有时间读懂它的尺度。</p>
      <button class="image-button rc-design-image" data-image="${directory}design-breakdown.jpg" data-image-title="The Divine Multiverse · 5.00秒设计拆解" aria-label="放大原帧上的五处设计分析"><img src="${directory}design-breakdown.jpg" alt="原片5秒完整画幅与五处分析：巨环轮廓、街道引导、疏密组织、明暗层次、行人尺度" loading="lazy"></button>
      <div class="rc-design-principles"><article><span>形态关系</span><h3>大形简洁，局部复杂</h3><p>巨环提供远看可辨的轮廓；层叠结构与街区构件提供近看的内容。大形、建筑群、行人形成不同尺度的阅读层次。</p></article><article><span>氛围关系</span><h3>环境巨大，观看克制</h3><p>人物很小，城市占据视野；镜头持续接近，没有依赖激烈动作。这种体量与观看节律的组合，可以支持安静的敬畏感。</p></article><article><span>明暗关系</span><h3>暗部承托，亮部引路</h3><p>大面积暗城承托亮环，暖色地平线给出方向。天空、道路和环内留白使密集结构仍可辨，远雾把层次分开。</p></article></div>
    </section>
    <div class="section-heading"><div><p class="eyebrow">BEFORE / MIDDLE / AFTER</p><h2>巨环早已存在，变化发生在观看过程。</h2></div><p>三处完整画幅抽帧，未追加曝光或饱和度。</p></div>
    <div class="rc-phases">${phases.map(p=>`<article class="rc-phase"><button class="image-button rc-frame" data-image="${directory}frame-${p.time}.jpg" data-image-title="The Divine Multiverse · ${Number(p.time).toFixed(2)} 秒原片抽帧" aria-label="放大 ${Number(p.time).toFixed(2)} 秒原片抽帧"><img src="${directory}frame-${p.time}.jpg" alt="The Divine Multiverse ${Number(p.time).toFixed(2)} 秒：沿街看向巨大明亮环形结构" loading="lazy"><span class="time-badge">${Number(p.time).toFixed(2)}s</span></button><h3>${p.label}</h3><p>${p.text}</p><p class="rc-limit">判断边界：${p.limit}</p></article>`).join('')}</div>
    <details class="rc-evidence"><summary>核对完整原片、11处抽帧与素材记录</summary><div class="rc-evidence-body"><video class="rc-video" controls playsinline muted preload="none" poster="${directory}frame-00.10.jpg" aria-label="The Divine Multiverse 原视频分析副本"><source src="${directory}reference.mp4" type="video/mp4"></video><div><p>这是原帖完整播放轨的研究副本，非新生成的视频。视频轨约 10.125 秒，720×1280，标称约 24fps。时间采用本地视频轨，不是精确物理运动测量。</p><button class="image-button" data-image="${directory}temporal-contact-sheet.jpg" data-image-title="The Divine Multiverse · 11处原片抽帧" aria-label="放大11处时间序列"><img src="${directory}temporal-contact-sheet.jpg" alt="0.10秒至10.00秒的11处完整画幅原片抽帧" loading="lazy"></button><a class="text-link" href="${directory}provenance.json" target="_blank" rel="noopener">查看播放列表、抽帧时间与校验记录 ↗</a></div></div></details>
    <div class="section-heading"><div><p class="eyebrow">WHAT MAKES IT WORK</p><h2>四种可以一起消化的能力。</h2></div></div>
    <div class="rc-mechanisms">${mechanisms.map(m=>`<article><span class="eyebrow">${m.n} / VISUAL MECHANISM</span><h3>${m.title}</h3><dl><div><dt>画面观察</dt><dd>${m.fact}</dd></div><div><dt>机制解释</dt><dd>${m.driver}</dd></div><div><dt>我们的扩展</dt><dd>${m.reuse}</dd></div></dl></article>`).join('')}</div>
    <div class="section-heading"><div><p class="eyebrow">SHARED LANGUAGE / DIFFERENT ROLES</p><h2>与骑行研究共通什么，又补充什么？</h2></div></div>
    <div class="table-scroll"><table class="rc-table"><caption class="sr-only">新参考与已有 hi_personality 研究的对照</caption><thead><tr><th scope="col">维度</th><th scope="col">已有研究</th><th scope="col">这条新参考</th><th scope="col">可沉淀的能力</th></tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>i?`<td>${v}</td>`:`<th scope="row">${v}</th>`).join('')}</tr>`).join('')}</tbody></table></div>
    <article class="rc-hdr"><p class="eyebrow">BRIGHTNESS ≠ VERIFIED HDR</p><h2>这里能确认高亮反差，尚不能确认 HDR。</h2><p>环缘很亮、城体很暗，暖色日光又把远处拉开：这些都能在当前抽帧中观察。高亮边缘、局部辉光与暗部对比已经足以造成强烈光感，不需要把整幅画面提亮。</p><p>本次下载的 720p H.264 播放变体为 8-bit，FFprobe 没有报告色彩传递、色域或矩阵标签。因此不能用它确认 HLG/PQ HDR，也不能反推作者母版一定是 SDR。作者软件、调色参数和母版格式仍未确认。</p><a class="text-link" href="#color">对照曝光、饱和度与 HDR 的分工 ↗</a></article>
    <div class="section-heading"><div><p class="eyebrow">WHAT TO ADD TO OUR DESIGNS</p><h2>先补充三种“怎样展示”的选择。</h2></div><p>以下是设计设想，当前不制作运动或产品。</p></div>
    <div class="rc-transfer"><article><span>01 / 景观巡游</span><h3>由镜头担任探索者</h3><p>保留小人物作尺度；从一个可读入口沿路接近奇观。每个阶段都增加可见空间，而不是只让画面变大。</p><a href="#keyframes">关联 A 中轴、H 风塔 ↗</a></article><article><span>02 / 遮挡解除</span><h3>从被包围走向开阔</h3><p>先用近楼、门柱或树根框住世界，再逐渐释放屋顶、天空和远景。前景退出来自观看关系设计，不必让建筑主动变形。</p><a href="#keyframes">关联 C 曲路、L 雾门 ↗</a></article><article><span>03 / 亮部目的地</span><h3>让光指引观看</h3><p>先确定暗部骨架与一个亮部落点，再让路线把它们连接。可采用克制色彩与局部亮边，情绪不必依赖高饱和。</p><a href="#keyframes">关联 I 重复门、K 暖站 ↗</a></article></div>
    <section class="rc-making-study" aria-labelledby="rc-making-title">
      <div class="section-heading"><div><p class="eyebrow">OUR ORIGINAL CONTENT / MAKING NOTES</p><h2 id="rc-making-title">这些设计从哪些制作选择中产生？</h2></div><p>V1原始草案、V2路线调整、V3体量平衡均已生成；运动部分仍为未执行设想。</p></div>
      <article class="rc-original-brief"><span class="eyebrow">CURRENT DIRECTION / 原创静态设计V3</span><h3>暮色阶梯城，接近一座悬空巨拱。</h3><p>以单一开放巨拱、石质阶梯城、S形街道和暖色暮光重组场景。借鉴尺度、疏密、亮度与进入关系；本轮集中调整观看距离、道路显露与地标体量。</p><dl><div><dt>已呈现</dt><dd>完整的主要巨构；S形进入路线；近中远层次；微小行人；暖色落点。</dd></div><div><dt>与参考的变化</dt><dd>闭合环变为开放拱，工业结构变为阶梯石城，冷峻氛围转向更暖的庄严感。</dd></div><div><dt>当前交付</dt><dd>三个静态设计版本与原片对照。实际输入、提示词、图片校验和取舍记录已保存。</dd></div></dl></article>
      <ol class="rc-making-steps">${makingSteps.map((s,i)=>`<li><span class="rc-making-index">0${i+1}</span><div><h3>${s.title}</h3><p>${s.work}</p><p class="rc-making-check">判断：${s.check}</p></div></li>`).join('')}</ol>
      <div class="rc-proposed-shot"><h3>后续镜头草案：用一条变化主线展开空间</h3><div><article><span>开场</span><p>两侧近楼框住巨拱；先建立规模和进入方向。</p></article><article><span>展开</span><p>沿主街接近；近楼退出，新屋顶和桥段显露。</p></article><article><span>落点</span><p>更开阔地看见巨拱与远城；保留继续探索的余味。</p></article></div><p class="rc-reading-note">这是创作意图，不是新抽帧或已生成的运动。先验证一条清楚的观看变化，再增加其他动作。</p></div>
      <details class="rc-prompt"><summary>此前的中文构思配方（实际提交指令见生成记录）</summary><p>${imagePrompt}</p><a class="text-link" href="${draftRecord}" target="_blank" rel="noopener">查看本轮实际提交的完整英文提示词 ↗</a></details>
      <details class="rc-prompt"><summary>后续运动阶段的指令草案（尚未执行）</summary><p>${motionPrompt}</p></details>
    </section>
    <p class="rc-final-note">原片待核实：具体生成／渲染工具、是否由发帖账号制作、HDR 母版、音乐来源。本轮未人工听辨原片音轨，不分析音乐节拍；未从这些帧测量行人速度、焦距或环体自转。原创草案使用内置 image_gen，完整生成记录已另存。感受描述为视觉解读，不是情绪或传播效果的因果证明。<a href="${post}" target="_blank" rel="noopener noreferrer">原帖来源 ↗</a></p>
  `;
  const gifButton=root.querySelector('[data-scene-gif-toggle]');
  const gifImage=root.querySelector('#rc-scene-gif-image');
  const gifStatus=root.querySelector('#rc-scene-gif-status');
  let gifPlaying=false;
  let gifReplay=0;
  const stopGif=()=>{
    gifPlaying=false;
    gifImage.src='assets/gif-studies/terrace-city-approach-local-v2-poster.png';
    gifButton.textContent='播放GIF预演';
    gifButton.setAttribute('aria-pressed','false');
    gifStatus.textContent='静态首帧';
  };
  gifButton.addEventListener('click',()=>{
    if(gifPlaying){stopGif();return;}
    gifPlaying=true;
    gifImage.src='assets/gif-studies/terrace-city-approach-local-v2.gif?replay='+(++gifReplay);
    gifButton.textContent='停止，回到起点';
    gifButton.setAttribute('aria-pressed','true');
    gifStatus.textContent='GIF循环播放中';
  });
  window.addEventListener('hashchange',()=>{if(location.hash!=='#comparison'&&gifPlaying)stopGif();});
})();
