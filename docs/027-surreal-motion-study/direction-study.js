'use strict';
(() => {
  const root=document.getElementById('direction-study-root');
  if(!root)return;
  const image='assets/original-keyframes/mirror-sea-inverted-garden-city-v1.png';
  const gardenMarkup=`
    <div class="chapter-header"><p class="eyebrow">NEXT FRAME / STATIC VISUAL DIRECTION</p><h1 id="directions-title">镜面浅海，<br>倒悬的花园城。</h1><p class="lead">清晨的浅海上方，城市向下生长；水面把它翻回熟悉的方向。先看倒悬、倒影和晨雾怎样共同组织一个安静的奇幻空间。</p></div>
    <div class="ds-status"><span class="status-pill">原创方向图 · V1</span><span>内置 image_gen · 文字独立生成 · 静态评阅</span></div>
    <figure class="ds-main-image"><button class="image-button" data-image="${image}" data-image-title="原创方向图V1 · 镜面浅海＋倒悬花园城" aria-label="放大镜面浅海与倒悬花园城方向图"><img src="${image}" alt="清晨镜面浅海上空悬着灰白色倒置花园城市，塔尖朝下，水中倒影朝上，左下人物站在可见沙底的浅水中" fetchpriority="high"></button><figcaption>完整原创画幅 · 1672×941 · RGB PNG · 本轮只制作方向图，不扩展动态。</figcaption></figure>
    <div class="ds-brief-grid">
      <article><p class="eyebrow">01 / ATMOSPHERE</p><h2>清晨、安静、轻盈探索。</h2><p>青蓝浅海与灰白建筑保持低饱和，少量绿色植被让城市显得可居住。暖色晨光只强调局部边缘，薄雾柔化远处，留下缓慢观看的空间。</p><span>目标感受：对陌生世界的好奇与宁静。</span></article>
      <article><p class="eyebrow">02 / COMPOSITION</p><h2>上方城体，中间雾带，下方镜海。</h2><p>倒悬城市横向展开，水面承接朝上的倒影。左下近景人物与波纹打破完全对称，成为观看入口；视线从近处水面经过倒影，再回到上方实体。</p><span>阅读关系：近处触点 → 镜像线索 → 空中城市。</span></article>
      <article><p class="eyebrow">03 / CENTRAL IDEA</p><h2>熟悉的城市，被改变了重力方向。</h2><p>屋顶、塔尖、窗洞和花园仍可辨认，但建筑向下悬挂。水中的朝上轮廓与它呼应，人物、沙底和水纹又提供熟悉的空间参照。</p><span>核心看点：倒悬、倒影与真实触点共同成立。</span></article>
    </div>
    <div class="section-heading"><div><p class="eyebrow">WHAT TO LOOK AT</p><h2>这张方向图的三个看点。</h2></div></div>
    <ol class="ds-focus-list"><li><span>01</span><div><h3>倒悬轮廓一眼可读</h3><p>上方横向基座与下垂的塔楼形成明确方向，最低塔尖与海面之间保留空气间隙。先读懂“悬着一座城”，再看局部花园。</p></div></li><li><span>02</span><div><h3>雾带分开实体与倒影</h3><p>远处薄雾和开阔水面给上下两座轮廓留出间隔，避免连成一块。这里的倒影是生成图中的视觉呼应，尚未验证严格光学对应。</p></div></li><li><span>03</span><div><h3>浅水让观看位置可感</h3><p>人物脚边的小波纹、可见沙底与近处清水，交代人站在哪里。它们把远处奇观接回可理解的环境，也让“镜面”保留水的质感。</p></div></li></ol>
    <div class="ds-review"><h3>当前先评阅画面方向。</h3><p>已呈现倒悬城市、上下镜像、晨雾与浅水近景。城市几乎横贯整幅，花园细节较丰富；可先判断倒悬关系是否清楚、主体与倒影能否分开，以及这种明亮宁静的氛围是否符合方向。</p><p>本图用于美术与构图探索。没有制作镜头、人物动作、GIF或三维效果。</p><a class="text-link" href="reference/mirror-sea-inverted-garden-city-v1-generation.json" target="_blank" rel="noopener">完整提示词与生成记录 ↗</a></div>
  `;
  const forestImage='assets/original-keyframes/forest-follows-deer-v1.png';
  const forestMarkup=`
    <div class="chapter-header"><p class="eyebrow">REVERSED WORLD / STATIC VISUAL DIRECTION</p><h1 id="directions-title">鹿停在原地，<br>森林向它而来。</h1><p class="lead">让森林、草地与河流主动接近一只等待的鹿。通过离地的根系、携带的土层和弯向鹿蹄的水流，把“环境主动寻找生命”变成可观察的画面关系。</p></div>
    <div class="ds-status"><span class="status-pill">追随鹿的森林 · V1</span><span>内置 image_gen · 文字独立生成 · 仅静态方向</span></div>
    <figure class="ds-main-image"><button class="image-button" data-image="${forestImage}" data-image-title="原创方向图V1 · 追随鹿的森林" aria-label="放大追随鹿的森林方向图"><img src="${forestImage}" alt="静立的鹿位于右侧干裂平原，左侧森林的根系携带苔土抬起，曲线河流和新鲜草地延伸至鹿蹄附近，晨雾与暖光分开远近层次" fetchpriority="high"></button><figcaption>完整原创画幅 · 1672×941 · RGB PNG · 静态图表达逆向规则，不代表已经实现环境运动。</figcaption></figure>
    <div class="ds-brief-grid">
      <article><p class="eyebrow">01 / REVERSED RULE</p><h2>环境主动寻找生命。</h2><p>鹿停在干燥平原，森林带着根、苔土与草地靠近，河流延伸至它脚边。生命的需要成为环境重新组织的中心：庇护与水来到动物身边。</p><span>设定关系：等待的生命 ← 靠近的生境。</span></article>
      <article><p class="eyebrow">02 / ATMOSPHERE</p><h2>温柔、安静，带一点陌生感。</h2><p>晨雾柔化远林，暖光照亮鹿和树冠边缘，苔绿与灰白荒地形成克制的对比。树木保持植物形态，靠近的力量更像提供庇护。</p><span>目标感受：自然在主动回应一个微小生命。</span></article>
      <article><p class="eyebrow">03 / COMPOSITION</p><h2>左侧森林，右侧等待的鹿。</h2><p>左侧大体量林带向右侧开放平原展开，低处水流形成弧线，将根系与鹿连接起来。背景雾林、中景土层和前景鹿蹄接触点构成三个距离。</p><span>视线关系：森林体量 → 根与水的前缘 → 鹿。</span></article>
    </div>
    <div class="section-heading"><div><p class="eyebrow">VISIBLE CLUES FOR THE RULE</p><h2>让逆向关系从三个线索中显露。</h2></div></div>
    <ol class="ds-focus-list"><li><span>01</span><div><h3>根系连同土层抬离地面</h3><p>树根下的暗隙、悬出的细根和断开的苔土边缘，是“森林可以迁移”的主要线索。多株树形成重复关系，让异常属于整片生境。</p></div></li><li><span>02</span><div><h3>水与草地一起抵达</h3><p>河流从森林内部弯向鹿的前蹄，绿色前缘包裹水边。林地、植被和水共同组成主动靠近的环境。</p></div></li><li><span>03</span><div><h3>鹿的静止姿态与荒地留白</h3><p>鹿四蹄落地、朝向森林，右侧仍留出干裂空地。平静的生命与正在靠拢的绿色大体量形成主次，避免只靠奔跑姿态解释“追随”。</p></div></li></ol>
    <div class="ds-review"><h3>当前评阅：静态线索能否支撑这条规则？</h3><p>根系、土层和水流前缘已经呈现出靠近的意图；单张图仍可能被理解为鹿在林缘遇水，尚不能证明迁移方向和过程。评阅重点是这些异常线索能否被迅速看懂，以及温柔而陌生的氛围是否成立。</p><p>本轮仅制作方向图与说明，没有制作动态、动物动作或产品。</p><a class="text-link" href="reference/forest-follows-deer-v1-generation.json" target="_blank" rel="noopener">完整提示词与生成记录 ↗</a></div>
  `;
  const newDirectionMarkup=(d)=>`
    <div class="chapter-header"><p class="eyebrow">REVERSED WORLD / NEW STATIC IMAGE</p><h1 id="directions-title">${d.title}</h1><p class="lead">${d.lead}</p></div>
    <div class="ds-status"><span class="status-pill">本轮新增 · 原创静态图</span><span>内置 image_gen · 文字独立生成 · V1</span></div>
    <figure class="ds-main-image"><button class="image-button" data-image="${d.image}" data-image-title="原创方向图 · ${d.name}" aria-label="放大${d.name}方向图"><img src="${d.image}" alt="${d.alt}" fetchpriority="high"></button><figcaption>完整原创画幅 · 1672×941 · RGB PNG · 仅扩展图片。</figcaption></figure>
    <div class="ds-brief-grid"><article><p class="eyebrow">01 / REVERSED RELATION</p><h2>${d.ruleTitle}</h2><p>${d.rule}</p></article><article><p class="eyebrow">02 / ATMOSPHERE</p><h2>${d.moodTitle}</h2><p>${d.mood}</p></article><article><p class="eyebrow">03 / COMPOSITION</p><h2>${d.layoutTitle}</h2><p>${d.layout}</p></article></div>
    <div class="ds-review"><h3>先看图片中的关系。</h3><p>${d.review}</p><p>本轮未制作动态或产品。</p><a class="text-link" href="reference/reverse-world-directions-20261113.json" target="_blank" rel="noopener">两张图的实际提示词与生成记录 ↗</a></div>`;
  const shadowMarkup=newDirectionMarkup({name:'影桥',title:'桥是虚像，<br>影子托住旅人。',image:'assets/original-keyframes/shadow-bridge-v1.png',alt:'峡谷上方是半透明白色拱桥，下方黑色桥形轮廓横跨空中，一位赭色衣服旅人站在黑色轮廓上',lead:'把承托关系放到画面中央：上层桥体通透，下层黑色轮廓托住旅人。',ruleTitle:'实体与影子的作用互换。',rule:'设定中，桥体只保留可见形态，真正能落脚的是影子。通过人物站在下层、两层结构分离和上层透明表达异常。',moodTitle:'温暖岩壁，冷色深谷。',mood:'金色侧光照亮岩层，谷底保持蓝灰色雾气。小旅人与大峡谷的尺度差，形成克制的紧张与好奇。',layoutTitle:'上下两层桥，斜向穿过峡谷。',layout:'上方透明桥占据天空，下方黑色通路连接两侧崖壁。旅人位于中间，近处岩台与远处层叠山谷拉开距离。',review:'透明桥与下层承托关系已经可见。黑色轮廓是否能直接被理解成“影子”，仍需看图判断；它也可能被读成另一座深色桥。'});
  const foldStages=[
    {label:'纸面',image:'assets/original-keyframes/folded-map-flat-v1.png',alt:'等高线和蓝色河道墨线画在平铺的纸地图上，左下罗盘与窗边木桌保持可见',text:'纸仍平铺，山脉和河流只存在于图绘线条中。'},
    {label:'折起',image:'assets/original-keyframes/folded-map-world-v1.png',alt:'地图折起成明显纸山脊，一部分逐渐成为岩石森林，蓝墨线接成河水',text:'折纸脊与真实山体交接，墨色河道开始连接水流。'},
    {label:'成形',image:'assets/original-keyframes/folded-map-formed-v1.png',alt:'中间纸折面大部分变为真实岩石森林和河谷，前景仍有纸地图与罗盘，远处是雪山',text:'岩石、森林与河谷占据主体，前景保留纸面作为来源线索。'}
  ];
  const foldMarkup=`
    <div class="chapter-header"><p class="eyebrow">FOLDED WORLD / CONNECTED TRANSITION</p><h1 id="directions-title">同一道折痕，<br>接成同一道山脊。</h1><p class="lead">先修清楚一张图里的变化关系：纸的棱线连续接入山脊，纸面纹理接入岩层，山脚的墨线连续接入河水。</p></div>
    <div class="ds-status"><span class="status-pill">折叠世界 · 连接修订 V2</span><span>内置 image_gen 编辑 · 单张静态过渡图</span></div>
    <figure class="ds-main-image"><button class="image-button" data-image="assets/original-keyframes/folded-map-connection-v2.png" data-image-title="折叠世界 V2 · 纸脊与山脊的连接" aria-label="放大折叠世界连接修订图"><img src="assets/original-keyframes/folded-map-connection-v2.png" alt="前景中央一道纸脊向左后方连续变成岩石山脊，右侧低谷中的蓝色墨线不断开地接入真实河水，罗盘和窗光保留" fetchpriority="high"></button><figcaption>V2 · 1670×941 · 图中沿纸脊向左后方看，再沿右侧蓝线看向河谷。点击放大。</figcaption></figure>
    <div class="ds-brief-grid"><article><p class="eyebrow">01 / SHAPE</p><h2>纸的顶边，接住山的顶边。</h2><p>从前景三角形纸脊出发，沿棱线向左后方看：纸的两个斜面接成山坡，棱线延伸成山脊。减少并列小折面，让一条主脊承担变化。</p></article><article><p class="eyebrow">02 / MATERIAL</p><h2>形状延续，表面逐渐变化。</h2><p>纸面沿同一山体转为岩石与植被，纸上的细线延伸到岩层附近。它是静态材质过渡的设计，等高线与岩层尚未逐条严密对应。</p></article><article><p class="eyebrow">03 / CHANNEL</p><h2>墨线沿低谷，接入河水。</h2><p>前景蓝线移到主山脊右侧，沿低处弯进同一条河道。在连接处加宽并出现水面反光，避免墨线跨过山脊或在山脚断开。</p></article></div>
    <p class="ds-sequence-record"><a class="text-link" href="reference/folded-map-connection-v2-generation.json" target="_blank" rel="noopener">本轮两次编辑的完整提示词与记录 ↗</a></p>
    <div class="section-heading"><div><p class="eyebrow">V1 / V2</p><h2>从多个纸峰，收束到一条主脊。</h2></div></div>
    <div class="ds-compare-grid"><figure><button class="image-button" data-image="assets/original-keyframes/folded-map-world-v1.png" data-image-title="折叠世界 V1 · 原版" aria-label="放大折叠世界原始过渡图"><img src="assets/original-keyframes/folded-map-world-v1.png" alt="原版多个纸峰与真实山脉交接" loading="lazy"></button><figcaption><h3>V1 · 原版保留</h3><p>多个折面同时出现，纸峰与山峰的对应容易分散。</p></figcaption></figure><figure><button class="image-button" data-image="assets/original-keyframes/folded-map-connection-v2.png" data-image-title="折叠世界 V2 · 连接修订" aria-label="放大新版折叠世界对比图"><img src="assets/original-keyframes/folded-map-connection-v2.png" alt="新版单条主脊与右侧连续河道" loading="lazy"></button><figcaption><h3>V2 · 先看清同一个形体</h3><p>一条主脊贯穿纸与岩石，河道留在它的同一侧。</p></figcaption></figure></div>
    <div class="section-heading"><div><p class="eyebrow">EARLIER STAGE SKETCHES</p><h2>此前三阶段草案，保留备查。</h2></div></div>
    <div class="ds-sequence-grid">${foldStages.map((s,i)=>`<article><div class="ds-sequence-label"><span>0${i+1}</span><h2>${s.label}</h2></div><button class="image-button" data-image="${s.image}" data-image-title="折叠世界静态草案 · ${s.label}" aria-label="放大折叠世界${s.label}草案"><img src="${s.image}" alt="${s.alt}" loading="lazy"></button><p>${s.text}</p></article>`).join('')}</div>
    <p class="ds-compare-note">三张是静态阶段设计，不是运动抽帧；罗盘、纸面与窗光作为共同参照，山形、等高线和河道细节仍有变化，不能当作严格连续素材。</p>
    <p class="ds-sequence-record"><a class="text-link" href="reference/folded-map-static-sequence-20261113.json" target="_blank" rel="noopener">实际输入、完整提示词与生成记录 ↗</a></p>
    <div class="ds-review"><h3>本轮修订范围</h3><p>只修正中间过渡图内部的连接。此前“纸面”和“成形”图尚未按 V2 统一重绘；这组三阶段仍是意向草案。当前没有制作折叠动作、物理仿真、视频或产品。</p></div>
  `;
  const stepImage='assets/original-keyframes/shadow-bridge-first-step-v1.png';
  const shadowStages=[
    {label:'发现',image:'assets/original-keyframes/shadow-bridge-discovery-v1.png',alt:'旅人双脚都在岩台上，崖外黑影空着，栏杆投影从石面连续延伸到峡谷上方',text:'双脚留在石头上，先看到影子已经越过崖边。'},
    {label:'试探',image:stepImage,alt:'后脚在岩台，前脚刚踩在崖外悬空黑影上',text:'后脚还在岩台，前脚贴合没有实体支撑的黑影。'},
    {label:'站稳',image:'assets/original-keyframes/shadow-bridge-supported-v1.png',alt:'旅人双脚都落在悬空黑影上，后脚与岩台之间留有可见空隙，下方是峡谷',text:'双脚离开石头，后脚与岩台之间有空隙，黑影托住站姿。'}
  ];
  const stepMarkup=`
    <div class="chapter-header"><p class="eyebrow">SHADOW BRIDGE / THREE STATIC STAGES</p><h1 id="directions-title">发现影子，<br>试探、站稳。</h1><p class="lead">补上第一步前后的情景：先留在岩台观察，再迈出一脚，最后双脚落到崖外黑影上。用三个静态状态查看这个过程是否可读。</p></div>
    <div class="ds-status"><span class="status-pill">影桥 · 三阶段静态草案</span><span>本轮新增2张 · 内置 image_gen 编辑 · 未做动态</span></div>
    <div class="ds-sequence-grid">${shadowStages.map((s,i)=>`<article><div class="ds-sequence-label"><span>0${i+1}</span><h2>${s.label}</h2></div><button class="image-button" data-image="${s.image}" data-image-title="影桥静态草案 · ${s.label}" aria-label="放大影桥${s.label}草案"><img src="${s.image}" alt="${s.alt}" loading="lazy"></button><p>${s.text}</p></article>`).join('')}</div>
    <p class="ds-compare-note">三张是分阶段静态草案，不是实际动作的前后抽帧。虽以“第一步”图为共同编辑参考，人物比例、岩台轮廓与桥体细节仍有变化，不能直接当作连续动画素材。</p>
    <p class="ds-sequence-record"><a class="text-link" href="reference/shadow-bridge-static-sequence-20261113.json" target="_blank" rel="noopener">本轮实际输入、完整提示词与生成记录 ↗</a></p>
    <div class="section-heading"><div><p class="eyebrow">THE KEY CONTACT</p><h2>关键接触图：前脚迈出的那一刻。</h2></div></div>
    <figure class="ds-main-image"><button class="image-button" data-image="${stepImage}" data-image-title="迈上影子的第一步 · 原创静态图" aria-label="放大迈上影子的第一步"><img src="${stepImage}" alt="近景旅人后脚站在岩台，前脚鞋底贴合延伸到空中的薄黑影，栏杆投影从石面越过崖边，脚下没有桥板支撑而是开放峡谷" fetchpriority="high"></button><figcaption>完整画幅 · 1672×941 · RGB PNG · 仅静态构图。</figcaption></figure>
    <div class="section-heading"><div><p class="eyebrow">ORIGINAL / RECOMPOSED</p><h2>从两座桥的远观，转到脚下的接触。</h2></div></div>
    <div class="ds-compare-grid"><figure><button class="image-button" data-image="assets/original-keyframes/shadow-bridge-v1.png" data-image-title="原版影桥 · 远景" aria-label="放大原版影桥"><img src="assets/original-keyframes/shadow-bridge-v1.png" alt="原版影桥，透明桥下有一座黑色桥形结构，小旅人走在黑色桥上" loading="lazy"></button><figcaption><h3>原版：人物小，黑影像另一座桥。</h3><p>黑色轮廓带有完整拱券与桥墩形态，容易被读成两座不同材质的桥。</p></figcaption></figure><figure><button class="image-button" data-image="${stepImage}" data-image-title="新版影桥 · 迈出第一步" aria-label="放大新版影桥接触关系"><img src="${stepImage}" alt="新版把前后脚、岩台断边和无实体支撑的黑色薄面放在近景" loading="lazy"></button><figcaption><h3>新版：一脚在岩台，一脚在黑影。</h3><p>让普通石面上的投影连续越过崖边，以薄面和脚底接触表现反常承托。</p></figcaption></figure></div>
    <p class="ds-compare-note">两张是独立生成的不同构图，并非同机位或严格单变量对照；原版完整保留。</p>
    <div class="ds-brief-grid"><article><p class="eyebrow">01 / SHADOW</p><h2>黑影保持薄与平。</h2><p>去掉下方黑影的立体拱券、桥墩与实体栏杆，只留下平面的栏杆投影形状。黑影下方露出峡谷，没有额外桥板。</p></article><article><p class="eyebrow">02 / CONTINUITY</p><h2>从熟悉的石面投影开始。</h2><p>近处岩台有可辨认的栏杆影子，同一黑色轮廓连续越过崖边。上方淡色桥体提供投影来源的视觉线索。</p></article><article><p class="eyebrow">03 / CONTACT</p><h2>前后脚对应两种支撑。</h2><p>后脚完整站在石头上，前脚鞋底贴合悬空黑面。身体与峡谷的距离放大，画面重点落在迈出的这一小步。</p></article></div>
    <div class="ds-review"><h3>这一张只验证承托关系是否可读。</h3><p>可以先隐藏标题，观察是否仍能读出“一只脚踩在看似不该承重的影子上”。图中接触关系已呈现；影子的认读与光学对应仍需评阅。</p><p>没有制作动态、承重模拟或产品。</p><a class="text-link" href="reference/shadow-bridge-first-step-v1-generation.json" target="_blank" rel="noopener">实际完整提示词与生成记录 ↗</a></div>
  `;
  const motionExamples=[
    {id:'sea',title:'海面弯起',file:'sea-wall-mesh-v1',method:'参数曲面草模 + 原图道路遮罩',scope:'实际演示海面从平面弯成高墙，水纹与鱼群随曲面出现。',limit:'固定机位；骑行者仍为静态。几何与材质是简化预演，未做沿路推进。'},
    {id:'reflection',title:'倒影先行',file:'reflection-offset-v1',method:'原图倒影分层 + 局部水面补绘',scope:'岸上人物不动，水中倒影独立向远处移动、停下。',limit:'倒影沿用原图姿态；尚未做完整步态、回头和严格镜像透视。'},
    {id:'daynight',title:'昼夜分界',file:'day-night-sweep-v1',method:'内置 image_gen 光照端点 + 本地配准合成',scope:'昼夜边界扫过同一建筑、窗灯、街道与水面。',limit:'图层合成预演；未实现物理太阳运动，端点可能有局部细节漂移。'}
  ];
  const motionMarkup=`<section class="ds-motion-studies" aria-label="三种变化的本地试作"><div class="section-heading"><div><p class="eyebrow">LOCAL MOTION STUDIES / V1</p><h2>先看三种变化。</h2></div></div><p class="ds-motion-intro">每段 7 秒、无声。可播放、暂停与拖动进度，分别试看空间变化、倒影独立行动和昼夜反馈。制作方式与本轮范围写在各段下方。</p><div class="ds-motion-grid">${motionExamples.map((m,i)=>`<article class="ds-motion-card" id="motion-${m.id}"><h3>${String(i+1).padStart(2,'0')} / ${m.title}</h3><video id="video-${m.id}" controls muted playsinline preload="metadata" poster="assets/effect-motion/${m.file}-poster.jpg" aria-label="${m.title}本地动态预演"><source src="assets/effect-motion/${m.file}.mp4" type="video/mp4"></video><button type="button" data-motion-play="${m.id}" aria-label="播放或暂停${m.title}预演">播放预演</button><p class="ds-motion-method">${m.method}</p><p>${m.scope}</p><p class="ds-effect-limit">${m.limit}</p>${m.id==='daynight'?`<details class="ds-daynight-controls"><summary>自己移动昼夜边界</summary><div class="ds-daynight-stage" role="img" aria-label="拖动下方滑块，比较同一城市的昼夜转换"><img src="assets/effect-motion/city-day-aligned.jpg" alt="完整日间城市" loading="lazy"><img class="ds-night-layer" src="assets/effect-motion/city-night-aligned.jpg" alt="" loading="lazy" style="clip-path:polygon(0 0,56.2% 0,43.8% 100%,0 100%)"></div><label>夜色推进 <output class="ds-daynight-output">50%</output><input type="range" min="0" max="100" value="50" aria-label="移动昼夜边界" data-daynight-slider></label></details>`:''}<a class="text-link" href="assets/effect-motion/${m.file}.mp4" download>保存这段 MP4 ↗</a></article>`).join('')}</div><p class="ds-sequence-record"><a class="text-link" href="reference/effect-motion-studies-20261113.json" target="_blank" rel="noopener">本地制作方式、参数与限制 ↗</a> · <a class="text-link" href="reference/effect-motion-light-generation-20261113.json" target="_blank" rel="noopener">昼夜端点的完整编辑提示词 ↗</a></p></section>`;
  const storyMarkup=`<section class="ds-story-short ds-motion-card" id="motion-story" aria-label="倒影先行九秒短片"><div class="section-heading"><div><p class="eyebrow">REFLECTION / LOCAL ANIMATED SHORT V1</p><h2 tabindex="-1">倒影先行 · 9 秒粗剪。</h2></div></div><p>同步行走 → 人停下、倒影继续 → 倒影回头 → 人低头确认、后退。把异常组织成一个有开场和落点的事件。</p><video id="video-story" controls playsinline preload="metadata" poster="assets/reflection-short/reflection-story-local-v1-poster.jpg" aria-label="倒影先行九秒分层动画短片"><source src="assets/reflection-short/reflection-story-local-v1.mp4" type="video/mp4"></video><button type="button" data-motion-play="story" aria-label="播放或暂停倒影先行九秒短片">播放短片 · 有声</button><p class="ds-motion-method">内置 image_gen 背景与六姿态素材 · 本地姿态插值、倒影分层、裁切剪辑与合成声轨</p><div class="ds-story-beats"><article><span>0–2.6 秒</span><h3>先建立同步</h3><p>人物与倒影同向行走，建立熟悉关系。</p></article><article><span>2.6–5.5 秒</span><h3>人停，倒影继续</h3><p>保留两者同框，明确动作开始失步。</p></article><article><span>5.5–6.6 秒</span><h3>倒影回头</h3><p>倒影停下并转头，留下一个观看停顿。</p></article><article><span>6.6–9 秒</span><h3>人作出反应</h3><p>低头确认，随后后退半步，留尾结束。</p></article></div><p class="ds-effect-limit">本地分层动画粗剪，角色来自六个静态姿态插值，仍有局部形变与脚步滑动。镜头由同一背景裁切，倒影透视为近似；尚非写实表演成片。声轨为本地合成水声、风声、脚步与低音提示，无对白。</p><details class="ds-story-frames"><summary>查看六个阶段画面</summary><img src="assets/reflection-short/reflection-story-local-v1-contact.jpg" alt="同步行走、人停下、倒影继续、倒影回头、低头确认、后退反应六个阶段" loading="lazy"></details><a class="text-link" href="assets/reflection-short/reflection-story-local-v1.mp4" download>保存 9 秒短片 MP4 ↗</a><p class="ds-sequence-record"><a class="text-link" href="reference/reflection-short-local-v1-20261113.json" target="_blank" rel="noopener">制作、音轨与限制记录 ↗</a> · <a class="text-link" href="reference/reflection-short-assets-20261113.json" target="_blank" rel="noopener">素材原件与完整生成提示词 ↗</a></p></section>`;
  const motionTargets={'sea-wall':'sea','ahead-reflection':'story','day-night-boundary':'daynight'};
  const danceMarkup=`<section class="ds-dance-study ds-motion-card" id="motion-dance" aria-label="音乐驱动的向前舞步"><div class="section-heading"><div><p class="eyebrow">DANCE WALK / ORIGINAL SCORE / LOCAL V2</p><h2 tabindex="-1">走着走着，就跳起来了。</h2></div></div><p>一手贴胸，脚下持续前进；在重拍落脚、弱拍回弹，在切分与留空处换肩、掸衣领、抬下巴。先用同一条音乐时间轴，检验角色的节奏与性格。</p><div class="ds-dance-view-switch" role="group" aria-label="舞步版本对照"><button type="button" data-dance-view="wide" aria-pressed="true">V2 横版近景</button><button type="button" data-dance-view="portrait" aria-pressed="false">V2 竖版全身</button><button type="button" data-dance-view="original" aria-pressed="false">V1 对照</button></div><video id="video-dance" controls playsinline preload="metadata" poster="assets/dance-walk/dance-walk-100bpm-local-v2-poster.jpg" aria-label="一百BPM边走边跳舞步试作"><source src="assets/dance-walk/dance-walk-100bpm-local-v2.mp4" type="video/mp4"></video><button type="button" data-motion-play="dance" aria-label="播放或暂停边走边跳试作">播放舞步 · 有声</button><p class="ds-motion-method"><span id="dance-view-label">当前：V2 横版近景</span> · 100 BPM · 16 拍 / 9.6 秒 · 原创占位配乐</p><div class="ds-dance-revision"><h3>本轮改进</h3><ul><li><strong>接地：</strong>前 12 拍取消整人上浮；落脚前段做足部局部定位，再释放进入换步。</li><li><strong>停顿与回弹：</strong>上身延迟连续接回下一姿态，减少每拍边界突变。</li><li><strong>看清表演：</strong>横版提高人物占比；竖版保留头、手、衣摆与双脚。切版本时保留当前拍点。</li></ul><p>目标气质：沉醉、松弛、自然释放。当前素材尚未形成连续闭眼表演；姿态插值和脚底滑移仍需改进。</p></div><div class="ds-dance-beat-panel"><p>播放时跟随拍点，也可点选任一拍定位画面。</p><output id="dance-beat-readout">第 1 拍 / 16 · 左脚落重拍</output><div class="ds-dance-beats" role="group" aria-label="十六拍拍点定位">${window.danceWalkPlan.nodes.map(n=>`<button type="button" data-dance-beat="${n.beat}" aria-label="第${n.beat}拍：${n.action}" ${n.beat===1?'aria-current="step"':''}><span>${String(n.beat).padStart(2,'0')}</span></button>`).join('')}</div></div><div class="ds-story-beats"><article><span>1–4 拍 / 0–2.4 秒</span><h3>重拍落脚</h3><p>左、右换重心，小交叉步，肩膀轻回弹。</p></article><article><span>5–8 拍 / 2.4–4.8 秒</span><h3>带一点得意</h3><p>脚尖轻点、抬下巴，手从胸前掸向衣领。</p></article><article><span>9–12 拍 / 4.8–7.2 秒</span><h3>留空与切分</h3><p>鼓点减少，上身稍稳住，脚下前移，接低踢和换肩。</p></article><article><span>13–16 拍 / 7.2–9.6 秒</span><h3>弹步接回节奏</h3><p>鼓点加强，接小弹步与交叉步，手回胸前。</p></article></div><details class="ds-dance-score"><summary>单独听原创音乐小样</summary><audio id="dance-music" controls preload="metadata" aria-label="一百BPM原创音乐小样" src="assets/dance-walk/dance-walk-100bpm-original.mp3"></audio><p>本地合成鼓、低音、和弦及短旋律，无对白、无现成电影音乐。</p></details><p class="ds-effect-limit">本地音乐驱动的分层动画试作。角色使用八个静态姿态插值，仍有局部形变、穿插和脚底滑移；局部足部定位不等于骨骼接地或动作捕捉。跟拍感来自背景追踪裁切。表情与节奏意图是否成立，留待观看评阅。</p><details class="ds-story-frames"><summary>查看 V2 六个阶段画面</summary><img src="assets/dance-walk/dance-walk-v2-contact.jpg" alt="第1、4、7、10、13、16拍的V2近景画面" loading="lazy"></details><a class="text-link" href="assets/dance-walk/dance-walk-100bpm-local-v2.mp4" data-dance-download download>保存当前版本 MP4 ↗</a><p class="ds-sequence-record"><a class="text-link" href="reference/dance-walk-v2-20261114.json" target="_blank" rel="noopener">拍点与动作制作记录 ↗</a> · <a class="text-link" href="reference/dance-walk-assets-20261113.json" target="_blank" rel="noopener">角色素材与完整生成提示词 ↗</a> · <a class="text-link" href="reference/dance-walk-music-20261113.json" target="_blank" rel="noopener">原创音乐事件表 ↗</a></p></section>`;
  const effectsMarkup=`
    <div class="chapter-header"><p class="eyebrow">VISUAL WORLDS / STYLE EXPLORATION</p><h1 id="directions-title">从场景图，<br>整理出世界。</h1><p class="lead">把已有16张图按构造世界时的作用重新归类：核心规则、内部空间、城市生活体系与独立视觉母题。先看它们怎样相互解释，以及哪些联系仍待确认。</p></div>
    <div class="ds-status"><span class="status-pill">16 图全部保留 · 世界关系整理</span><span>规则候选 / 空间归属 / 可见依据 / 待确认联系</span></div>
    <p class="ds-sequence-record"><a class="text-link" href="reference/effect-expansion-20261113.json" target="_blank" rel="noopener">全部原图路径、完整提示词与评阅记录 ↗</a></p>
    ${window.renderWorldConstruction()}
    <details class="ds-rain-archive"><summary>上一轮四张风格母图 · 展开对照</summary>${window.renderStyleExpansion()}</details>
    <details class="ds-rain-archive"><summary>此前逆雨分析 · 备查，暂不推进</summary>${window.renderUpwardRainAnalysis()}</details>
    ${window.renderDanceVideoProduction()}
    ${danceMarkup}
    ${storyMarkup}
    ${motionMarkup}
    <nav class="ds-effects-index" id="effect-index" aria-label="十种效果目录">${(window.effectExpansion||[]).map(s=>`<button type="button" data-effect-target="effect-${s.id}"><span>${s.index}</span>${s.title}</button>`).join('')}</nav>
    <div class="ds-effects-grid">${(window.effectExpansion||[]).map((s,i)=>`
      <article class="ds-effect-card" id="effect-${s.id}">
        <header><span>${s.index}</span><h2 tabindex="-1">${s.title}</h2></header>
        <button class="image-button" data-image="${s.image}" data-image-title="原创效果方向 ${s.index} · ${s.title}" aria-label="放大${s.title}效果图"><img src="${s.image}" alt="${s.description}" ${i===0?'fetchpriority="high"':'loading="lazy"'}></button>
        <p class="ds-effect-core">${s.core}</p><p>${s.description}</p>
        <section class="ds-effect-elements" aria-label="${s.title}的画面元素"><h3>画面元素</h3><ul>${s.elements.map(e=>`<li><strong>${e[0]}</strong><span>${e[1]}</span></li>`).join('')}</ul></section>
        <section class="ds-effect-mechanism"><h3>效果如何成立</h3><p>${s.mechanism}</p></section>
        <section class="ds-effect-continuation"><h3>继续创作：${s.continuation.format}</h3><dl><dt>最值得发生的变化</dt><dd>${s.continuation.change}</dd><dt>继续看的理由 · 设计目标</dt><dd>${s.continuation.reason}</dd></dl>${s.continuation.priority?`<p class="ds-effect-core">优先验证：${s.continuation.priority}</p><button class="text-link" type="button" data-effect-target="motion-${motionTargets[s.id]}">查看本地试作 ↑</button>`:''}</section>
        <details class="ds-effect-extensions" ${i===0?'open':''}><summary>可扩展方向 · 3 项<span>设想，未实施</span></summary><ul>${s.extensions.map(e=>`<li><h4>${e[0]}</h4><p>${e[1]}</p></li>`).join('')}</ul></details>
        <p class="ds-effect-limit">当前图面：${s.limit}</p>
      </article>`).join('')}</div>
    <div class="ds-review"><h3>从画面元素，沉淀可重复使用的关系。</h3><p>十张原创图与扩展方向完整保留。倒影方向新增本地分层动画粗剪，其他方向仍为局部机制预演或创作设想。观看理由是设计目标，尚未做观众验证。</p><a class="text-link" href="reference/effect-expansion-notes-20261113.json" target="_blank" rel="noopener">画面解读与扩展提案记录 ↗</a> · <a class="text-link" href="reference/effect-continuation-20261113.json" target="_blank" rel="noopener">十项继续创作方案 ↗</a></div>`;
  const directions={effects:effectsMarkup,step:stepMarkup,fold:foldMarkup,shadow:shadowMarkup,garden:gardenMarkup,forest:forestMarkup};
  root.innerHTML=`<nav class="ds-direction-switch" aria-label="选择静态画面方向"><button type="button" data-direction="effects" aria-pressed="true" aria-controls="ds-selected-direction">十种效果 · 新图</button><button type="button" data-direction="fold" aria-pressed="false" aria-controls="ds-selected-direction">折叠世界 · 修订</button><button type="button" data-direction="step" aria-pressed="false" aria-controls="ds-selected-direction">影桥 · 三阶段</button><button type="button" data-direction="shadow" aria-pressed="false" aria-controls="ds-selected-direction">影桥 · 原版</button><button type="button" data-direction="garden" aria-pressed="false" aria-controls="ds-selected-direction">倒悬花园城</button><button type="button" data-direction="forest" aria-pressed="false" aria-controls="ds-selected-direction">森林 · 试作</button></nav><div id="ds-selected-direction">${effectsMarkup}</div>`;
  let danceViewRequest=0;
  root.addEventListener('click',(event)=>{
    const copy=event.target.closest('[data-copy-production]');
    if(copy){
      navigator.clipboard.writeText(window.danceVideoProduction.prompts[copy.dataset.copyProduction]).then(()=>{root.querySelector('#production-copy-status').textContent='已复制对应提示词草案。';}).catch(()=>{root.querySelector('#production-copy-status').textContent='自动复制未成功，可直接选择下方提示词文本。';});
      return;
    }
    const view=event.target.closest('[data-dance-view]');
    if(view){
      const variants={wide:['dance-walk-100bpm-local-v2','V2 横版近景'],portrait:['dance-walk-100bpm-portrait-v2','V2 竖版全身'],original:['dance-walk-100bpm-local-v1','V1 对照']};
      const choice=variants[view.dataset.danceView];const video=root.querySelector('#video-dance');
      const request=++danceViewRequest;const time=video.currentTime;const resume=!video.paused;video.pause();
      video.classList.toggle('ds-portrait',view.dataset.danceView==='portrait');
      video.poster='assets/dance-walk/'+choice[0]+'-poster.jpg';
      video.addEventListener('loadedmetadata',()=>{if(request!==danceViewRequest)return;video.currentTime=Math.min(time,video.duration||0);updateDanceBeat(video);if(resume)video.play().catch(()=>{});},{once:true});
      video.src='assets/dance-walk/'+choice[0]+'.mp4';video.load();
      root.querySelector('#dance-view-label').textContent='当前：'+choice[1];
      root.querySelector('[data-dance-download]').href=video.src;
      root.querySelectorAll('[data-dance-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===view)));
      return;
    }
    const beat=event.target.closest('[data-dance-beat]');
    if(beat){const video=root.querySelector('#video-dance');video.pause();video.currentTime=(Number(beat.dataset.danceBeat)-1)*.6;updateDanceBeat(video);return;}
    const play=event.target.closest('[data-motion-play]');
    if(play){
      const video=root.querySelector('#video-'+play.dataset.motionPlay);
      if(video.paused){video.play().catch(()=>{play.textContent='播放失败，请使用视频控件重试';});}else{video.pause();}
      return;
    }
    const jump=event.target.closest('[data-effect-target]');
    if(jump){
      const target=root.querySelector('#'+jump.dataset.effectTarget);
      if(target){target.scrollIntoView({block:'start'});target.querySelector('h2,h3')?.focus({preventScroll:true});}
      return;
    }
    const button=event.target.closest('[data-direction]');
    if(!button)return;
    const direction=button.dataset.direction;
    root.querySelector('#ds-selected-direction').innerHTML=directions[direction]||effectsMarkup;
    root.querySelectorAll('[data-direction]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  });
  root.addEventListener('input',(event)=>{
    if(!event.target.matches('[data-daynight-slider]'))return;
    const box=event.target.closest('.ds-daynight-controls');
    const v=Number(event.target.value);const boundary=-22+1.44*v;
    box.querySelector('.ds-night-layer').style.clipPath=`polygon(0 0,${boundary+6.2}% 0,${boundary-6.2}% 100%,0 100%)`;
    box.querySelector('output').textContent=v+'%';
  });
  function updateDanceBeat(video){
    const current=Math.min(16,Math.floor((video.currentTime+.015)/.6)+1);
    const node=window.danceWalkPlan.nodes[current-1];
    root.querySelectorAll('[data-dance-beat]').forEach(b=>{if(Number(b.dataset.danceBeat)===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    const output=root.querySelector('#dance-beat-readout');if(output)output.textContent=`第 ${current} 拍 / 16 · ${node.action} · ${node.detail}`;
  }
  root.addEventListener('timeupdate',(event)=>{if(event.target.id==='video-dance')updateDanceBeat(event.target);},true);
  for(const type of ['play','pause','ended'])root.addEventListener(type,(event)=>{
    if(!['VIDEO','AUDIO'].includes(event.target.tagName))return;
    if(type==='play')root.querySelectorAll('video,audio').forEach(m=>{if(m!==event.target)m.pause();});
    const id=event.target.id.replace('video-','');
    const button=root.querySelector('[data-motion-play="'+id+'"]');
    if(button)button.textContent=event.target.paused?'播放预演':'暂停预演';
  },true);
})();
