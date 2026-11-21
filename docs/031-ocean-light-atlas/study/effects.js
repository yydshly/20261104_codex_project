import { EXPANSIONS, expansionPrompt } from './extension-plans.js';
import { ADDITIONAL_SOURCE, referencesForEffect } from './additional-references.js';
import { realityForEffect } from './reality-comparisons.js';
import { REAL_SEA_SOURCES } from './reality-video-sources.js';

// One entry for every media strip in PEBIT's post, in the observed source order.
// Effect names, goals, recipes and acceptance criteria are this project's analysis.
export const SOURCE = 'https://x.com/_pebit_/status/2121174301319831916';
export const GROUPS = ['全部效果', '光点与散景', '流纹与镜面', '波浪与泡沫', '暖光与暮色', '低对比水面'];

const entries = [
  {
    id:'foam-edge',name:'浪缘碎泡',en:'FOAM AT THE EDGE',group:'波浪与泡沫',kind:4,
    colors:['#073d72','#087bc0','#54b9e3','#b0deeb','#f3f8f5'],
    goal:'蓝色水体中，一道弯曲白色浪缘由疏密泡点过渡到成片白沫。',
    criteria:['白沫沿弯曲浪缘聚集，能看出一条主轮廓','泡点有大小差异，边缘从密集逐渐散开','白沫之间仍能看到饱和蓝色水体'],
    avoid:['把泡点均匀撒满全图','白色连成没有细节的实心板块'],
    steps:['先确定斜向弯曲的浪缘，把清水与泡沫区分开。','叠加两种尺度的泡沫孔洞，沿浪缘提高密度。','用浅蓝过渡连接深水与白沫，保留暗色空隙。'],
    technique:'弯曲距离场限定浪缘；多层噪声切出泡沫孔洞与散点。',
    photo:'追踪一次浪推进后回落的边缘，较快快门保留泡点，构图同时包含清水和白沫。',
    controls:[58,48,125,32,54,12,64],use:'海报底纹 / 海浪过渡素材',
  },
  {
    id:'round-bokeh',name:'密集圆斑',en:'ROUNDS OF LIGHT',group:'光点与散景',kind:1,
    colors:['#07558a','#1a8bc2','#62b8dd','#c0e6f1','#fffef8'],
    goal:'明亮蓝底上出现密集、大小有别的白色椭圆光斑，远处细小、近处较大。',
    criteria:['主体是独立的圆形或椭圆亮斑','亮斑有明显的大小与清晰度层次','蓝色波纹仍存在，但不会抢过光斑'],
    avoid:['把光斑做成雪花或星形','所有圆斑同样大、同样锐利'],
    steps:['先压低水面细节，让蓝色背景形成缓慢的横向明暗。','给不同距离的反光点分配不同半径和虚化宽度。','亮斑沿水平方向轻微拉长，保留不均匀间隔。'],
    technique:'多层椭圆散景核，按虚拟深度改变半径、亮度和边缘虚化。',
    photo:'面对水面反光改变对焦距离，比较清晰波纹与失焦反光点的大小关系，保留一部分水纹。',
    controls:[18,88,120,18,35,34,0],use:'手机壁纸 / 明亮氛围背景',
  },
  {
    id:'star-glitter',name:'星芒碎银',en:'A GLINT OF SUN',group:'光点与散景',kind:2,
    colors:['#0076b3','#159ed1','#66cfe8','#b5e9ed','#ffffff'],
    goal:'细碎银色亮点铺在湛蓝水面上，少数强反光形成清晰的细短星芒。',
    criteria:['细小碎光多于大光斑','少数焦点具有细短的十字或多向星芒','最亮区域附近仍有蓝色暗缝和波纹'],
    avoid:['每个亮点都长出夸张长射线','高光全部糊成大片白色'],
    steps:['先用较细的波面产生碎小镜面反射。','只选少量最强反射点补上细短星芒。','保持青蓝中间调，让星芒与碎光有亮度层级。'],
    technique:'细波面镜面反射叠加稀疏星芒核，星芒随反光强度变化。',
    photo:'寻找密集小波纹上的强反射，改变角度与曝光观察星芒；是否出现及形态取决于镜头和光圈。',
    controls:[35,92,116,25,76,8,0],use:'闪光贴片 / 明亮海面特写',
  },
  {
    id:'blue-silk',name:'蓝色流绸',en:'BLUE SILK',group:'流纹与镜面',kind:3,
    colors:['#0065ad','#168bc5','#54b5dc','#a1d8e8','#d6edf4'],
    goal:'浅蓝丝带般的反射在蓝色海面上弯曲、拉长、分叉，形成顺滑流纹。',
    criteria:['亮纹以长曲线和分叉薄带为主','浅色反射与深蓝水体彼此穿插','纹理顺着整体流向延展，转折柔和'],
    avoid:['把流纹做成随机颗粒噪点','画成完全平行且等距的线条'],
    steps:['先建立缓慢变化的大尺度弯曲流场。','让浅色带沿流场拉伸，并叠加细小分叉。','降低点状闪光，突出绸缎般的平滑明暗。'],
    technique:'域扭曲后的带状距离场形成长丝纹，方向与速度共同控制流动。',
    photo:'寻找平缓水面反射天空或浅色环境的位置，用紧构图强调反射被水波拉长的形状。',
    controls:[24,28,142,22,34,35,0],use:'包装纹理 / 流动蓝色底图',
  },
  {
    id:'breaking-spray',name:'破浪飞沫',en:'BREAKING SPRAY',group:'波浪与泡沫',kind:4,
    colors:['#062d51','#007fb1','#51c0d9','#b7e3e8','#fafcf8'],
    goal:'深蓝水体上方翻出大面积亮白浪花，碎沫与水滴把边界打散。',
    criteria:['一侧有明显的大块破浪白沫','白沫边缘有分离的水滴与碎泡','近处深蓝与青色水体保持可辨认的层次'],
    avoid:['只生成一条规整白线','所有飞沫都贴在浪缘、没有分离颗粒'],
    steps:['以斜向浪脊安排一大片翻起的白沫。','在主白沫之外加入尺度不一的飞沫。','白色高光之下保留一层透亮青蓝过渡。'],
    technique:'偏置的浪缘遮罩叠加多尺度碎裂纹理与离散飞沫核。',
    photo:'观察浪撞击后白沫展开的瞬间，快门优先凝住碎沫，保留一侧深水作为对比。',
    controls:[86,68,128,54,64,16,88],use:'浪花遮罩参考 / 动态转场底图',
  },
  {
    id:'depth-glints',name:'虚实叠光',en:'LAYERS OF FOCUS',group:'光点与散景',kind:1,
    colors:['#064065','#0c7baa','#4ca6d0','#afdaeb','#f4f6ef'],
    goal:'深浅蓝色横向波面上，清晰小亮点和柔焦大圆斑交错，底部渐入浅色浪沫。',
    criteria:['小而清晰与大而柔软的光点同时存在','水面明暗形成几层横向带状关系','底部浅色区域与蓝色背景自然衔接'],
    avoid:['全图统一虚化','浅色前景把全部蓝色水面遮住'],
    steps:['先把蓝色水面分成深浅不同的横向层。','用两组散景核分别表现近处失焦与远处亮点。','在下沿加入柔和、零碎的浅色泡沫。'],
    technique:'双深度散景核加横向低频波纹，下沿使用渐变泡沫遮罩。',
    photo:'用近景浪沫作为前景，让远近反光点处于不同焦平面，比较大光斑与小亮点。',
    controls:[24,72,126,19,42,78,22],use:'景深光影素材 / 柔焦海面背景',
  },
  {
    id:'yellow-blue',name:'黄蓝镜纹',en:'YELLOW / ULTRAMARINE',group:'流纹与镜面',kind:5,
    colors:['#172a75','#036bbb','#48a7d2','#e9c850','#fff5b1'],
    goal:'高饱和的黄色反射与钴蓝暗缝交替，形成弯曲、断续的横向镜纹。',
    criteria:['黄与蓝的色块对比足够明确','亮纹以横向折线和薄带交替出现','镜纹有粗细变化、断裂和局部弯曲'],
    avoid:['退化为普通橙黄色日落','做成等距的双色条纹'],
    steps:['先用不等距的横纹组织反射形状。','用亮度阈值把部分纹理分成钴蓝与明黄。','在交界处保留青蓝与淡黄色的细窄过渡。'],
    technique:'扭曲的横向反射带配合分段配色，得到黄蓝交错的镜面图案。',
    photo:'寻找暖色环境在蓝色水面的反射，拍摄后按真实素材调整色彩分离；这是综合色彩效果整理。',
    controls:[36,84,95,23,57,10,0],use:'高对比平面底纹 / 艺术海报',
  },
  {
    id:'amber-swell',name:'橙金浪带',en:'AMBER SWELL',group:'暖光与暮色',kind:5,
    colors:['#182f32','#726e43','#ce9b38','#f6bd46','#fff1bb'],
    goal:'橙金反射之间隔着宽阔暗色浪面，形成有体积感的明暗浪带。',
    criteria:['亮金色光带与较宽暗面轮流出现','浪带有缓慢弯曲，能感到起伏体积','金色亮部有细碎波纹而非一片纯白'],
    avoid:['金色均匀铺满整张图','所有浪带都细成同样的平行线'],
    steps:['先安排少量较宽的浪面明暗区。','在朝光的一侧集中橙金色反射。','用小波纹打散亮带，保住背光面的深色。'],
    technique:'低频起伏决定宽浪带，叠加细横纹与暖色镜面反射。',
    photo:'低角度暖光下用紧构图截取几道浪，曝光保护金色亮部，让背光浪面自然变暗。',
    controls:[58,85,92,26,32,22,0],use:'电影暖光背景 / 品牌氛围素材',
  },
  {
    id:'honey-crest',name:'蜂蜜卷浪',en:'HONEY ON THE CREST',group:'波浪与泡沫',kind:6,
    colors:['#414e45','#8c8b68','#baae87','#e8dfc3','#fff6e7'],
    goal:'低饱和灰绿水面卷起一道半透明的暖金浪唇，下方散开奶白色细沫。',
    criteria:['一道连续弯曲浪唇成为视觉中心','浪唇亮而有透感，浪体保持较暗','白沫沿下缘展开，背景水面相对平缓'],
    avoid:['用满屏金色闪点代替卷浪','浪体与泡沫之间缺少明暗分界'],
    steps:['先搭出一条弧形浪唇与其下方的暗面。','在浪唇补窄而温暖的透光亮边。','沿下沿附着细沫，让泡沫逐渐散开。'],
    technique:'弧形波峰距离场塑造亮边、背光浪体和下缘泡沫。',
    photo:'侧逆光观察近岸小浪的薄边，从安全的低视角捕捉透光浪唇，避免背景过于杂乱。',
    controls:[54,63,112,30,43,22,36],use:'柔和海浪特写 / 温暖自然底图',
  },
  {
    id:'black-silver',name:'黑海银斑',en:'SILVER IN THE DARK',group:'光点与散景',kind:1,
    colors:['#101f27','#20323b','#51646a','#acb9b8','#f6f8ee'],
    goal:'接近黑色的海面上，银白光斑聚成疏密不同的亮点群，暗部占主要面积。',
    criteria:['暗色海面明显多于亮斑','光斑呈群聚，部分区域留出完整暗面','光斑偏中性银白，避免满图蓝色光晕'],
    avoid:['把背景整体提亮成蓝色','把亮斑排成规则网格或星空'],
    steps:['压低海面底色，保留细微横向水纹。','限制光点出现的位置，让它们成群而非均匀分布。','让少数近景光斑更大、更柔软。'],
    technique:'低亮度水体与成群散景核，按深度分层控制光斑尺寸。',
    photo:'用反光区域作为曝光依据，让背光水面沉入暗色；调整焦点观察银白散景的群聚关系。',
    controls:[19,78,110,16,42,55,0],use:'深色界面氛围 / 黑银光斑素材',
  },
  {
    id:'slate-ripple',name:'灰蓝细纹',en:'QUIET SLATE',group:'低对比水面',kind:7,
    colors:['#527489','#7495a5','#93afba','#bdd2d8','#e6eeec'],
    goal:'灰蓝色水面布满细小横纹，只有少量低强度反光，整体平静而有细节。',
    criteria:['细而密的横向波纹可以辨认','整体明暗差较小、颜色含灰','强反光稀疏，画面没有大块白沫'],
    avoid:['过度锐化成密集金属纹','提高饱和度变成鲜亮蓝海'],
    steps:['用高密度、低振幅横纹建立水面。','让灰蓝中间调覆盖大部分画面。','只在少量波峰上补轻微银白反光。'],
    technique:'低振幅细波与压缩对比的灰蓝调色，减少高光覆盖率。',
    photo:'在光线柔和、风浪较小的时候截取海面，保留灰蓝色与细微起伏，不必追求强反光。',
    controls:[14,22,145,14,78,36,0],use:'文字承载背景 / 安静的界面底图',
  },
  {
    id:'translucent-lip',name:'透光浪唇',en:'LIGHT THROUGH A WAVE',group:'波浪与泡沫',kind:6,
    colors:['#194f6e','#488da5','#a3cbd4','#e9e5df','#fff6ed'],
    goal:'浅蓝小浪有一条清楚的透光薄边，上方是粉白反射，下方转为蓝色浪体。',
    criteria:['能辨认一条薄而亮的连续浪唇','浪唇上下有清楚的粉白与蓝色分区','近处浪体保留青蓝透感与少量白沫'],
    avoid:['整道浪都变成纯白','亮边过粗，失去薄水层的感觉'],
    steps:['先设定一条横向弯曲浪唇，安排上下冷暖分区。','给浪唇一条窄亮边，下侧补薄薄暗面。','沿浪脚添少量白沫，避免盖住蓝色浪体。'],
    technique:'波峰距离场配合上下分区渐变，突出薄边透光与浪体层次。',
    photo:'用侧逆光寻找小浪边缘的通透区，控制曝光保留粉白天空反射与蓝色浪体。',
    controls:[45,54,116,24,36,28,26],use:'清透浪花特写 / 柔光海报',
  },
  {
    id:'silver-wash',name:'银白铺光',en:'A WASH OF SILVER',group:'低对比水面',kind:7,
    colors:['#8fabb8','#b4c7cf','#cfdbdf','#e2e8e7','#fbfcf5'],
    goal:'大面积银白反射覆盖浅灰蓝水面，波纹只以柔和灰色暗缝显现。',
    criteria:['银白亮面占较大比例','浅灰蓝暗缝仍勾勒出水面纹理','整体低饱和、低对比，保持柔和层次'],
    avoid:['变成没有纹理的白色渐变','加入高饱和蓝色或强烈黑边'],
    steps:['先把底色提高到浅灰蓝。','将反射覆盖扩展为几片相连的银白亮面。','用柔和暗缝重新找回波面，控制最白区域的面积。'],
    technique:'高覆盖率反射遮罩与低对比细纹叠合，保留亮部中的灰蓝结构。',
    photo:'寻找宽阔天空反射形成的浅色海面，比较稍有差异的曝光，保留亮部中的水纹。',
    controls:[20,68,126,14,57,48,0],use:'浅色海报 / 可叠字的银白背景',
  },
  {
    id:'emerald-flow',name:'翡翠流纹',en:'EMERALD FLOW',group:'流纹与镜面',kind:3,
    colors:['#00634e','#148a67','#46b08d','#9ad2af','#e2e7b5'],
    goal:'翡翠绿水面上，浅黄绿反射被拉成细长、交错而有弧度的流纹。',
    criteria:['绿色水体有深浅变化','浅色纹路长而弯曲，局部互相交错','黄绿色亮纹细而透明，不盖住水体'],
    avoid:['只把蓝色海面整体染绿','浅色线条变得粗硬、像发光霓虹'],
    steps:['用深绿与翠绿建立低频流动底色。','用扭曲带状场拉出细长黄绿反射。','在少量交叠处加亮，其余亮纹保持透明。'],
    technique:'交叉流场与细长浅色反射带，叠加绿水的低频明暗变化。',
    photo:'寻找绿色环境或浅水色调映入水面的区域，紧构图观察长反射线，避免过度饱和。',
    controls:[26,36,135,22,42,31,0],use:'翡翠水纹材质 / 自然品牌底图',
  },
  {
    id:'molten-gold',name:'满屏熔金',en:'MOLTEN GOLD',group:'暖光与暮色',kind:5,
    colors:['#8f591b','#d48b1a','#f6b82c','#ffe57b','#fff9d9'],
    goal:'金黄色与暖白色的宽反射带交织，整张水面明亮，亮带中仍有细横纹。',
    criteria:['金色与暖白色主导整个画面','亮带横向延展并有不均匀的宽窄变化','少量深金色暗缝托住高亮区域'],
    avoid:['变成中央一条窄光柱','白色全部曝光溢出而失去波纹'],
    steps:['让暖色反射覆盖大部分画面。','混合宽亮带与更细的金色波纹。','用少量深金暗缝分开高亮区域，避免一片死白。'],
    technique:'高覆盖率横向反射带，分层映射深金、亮金和暖白。',
    photo:'截取暖光反射中较亮的一小块水面，曝光保护最亮位置，保留金白相间的波纹。',
    controls:[29,94,90,19,52,18,0],use:'暖金流光素材 / 庆典氛围底图',
  },
  {
    id:'cobalt-streaks',name:'钴蓝横光',en:'COBALT STREAKS',group:'光点与散景',kind:5,
    colors:['#003ca6','#005ad8','#148ce7','#85c5f5','#edf8ff'],
    goal:'高饱和钴蓝水面上，银白反射被压成多层横向细线和拉长光斑。',
    criteria:['整体钴蓝色明确、暗缝偏深蓝','白色亮纹以横向拉长为主','远处细线与近处较大光斑形成层次'],
    avoid:['白色变成竖直流线','钴蓝被灰雾覆盖而失去通透感'],
    steps:['用深浅钴蓝构成不等宽横向水纹。','把亮斑沿水平方向拉长，远处压得更细。','保持白色亮纹之间的深蓝空隙。'],
    technique:'高频横向波纹与拉长的散景核叠合，保留冷蓝反射层。',
    photo:'选择反射亮点有横向拖长形态的水面，用较紧的构图强调亮纹排列与深蓝间隔。',
    controls:[19,82,104,20,82,38,0],use:'钴蓝视觉底纹 / 横向光影素材',
  },
  {
    id:'white-surf',name:'蓝底白沫',en:'WHITE SURF / BLUE SEA',group:'波浪与泡沫',kind:4,
    colors:['#04456b','#037aa1','#5daec8','#c2e0e8','#f7f8ef'],
    goal:'上方深蓝水面带有稀疏白点，下方大面积浅白泡沫铺开，分界柔和。',
    criteria:['上深下浅的两段结构明确','上方是分散亮点，下方是连片白沫','分界有破碎泡点，避免一条硬水平线'],
    avoid:['上下完全均匀、没有主次分区','泡沫做成灰色雾层'],
    steps:['先安排深蓝上半部和浅白泡沫下半部。','在交界处切出蓝色孔隙与小泡点。','上方保留几组稀疏白色反光，与下方白沫呼应。'],
    technique:'下沿高覆盖泡沫距离场，搭配上方独立散景与分形边缘。',
    photo:'把一次浪落下的白沫放在画面下方，保留上方较完整的蓝色水面与零星反光。',
    controls:[35,58,124,27,48,40,78],use:'上下分区背景 / 浪花前景素材',
  },
  {
    id:'pink-dusk',name:'粉霞柔光',en:'ROSE AT DUSK',group:'暖光与暮色',kind:5,
    colors:['#7d829c','#a59cb4','#d4bac3','#f2d4c8','#fff1de'],
    goal:'上部粉金反射与下部灰紫水面缓慢交融，细横纹在柔和光带中若隐若现。',
    criteria:['粉金亮部与灰紫暗部同时存在','整体低对比，横纹边缘柔和','上下过渡自然，局部暖色反光仍有层次'],
    avoid:['饱和粉红铺满全屏','加入过强白色星芒破坏柔和感'],
    steps:['先用粉金到灰紫的纵向色彩过渡建立氛围。','在上部叠加柔软的暖色横向反射。','下部保留较暗波纹，用少量亮点连接上下。'],
    technique:'冷暖分区渐变与柔边反射带，降低细节对比并限制星芒。',
    photo:'暮色中寻找天空映在平缓水面的粉金颜色，保留灰紫暗部，以细微色差代替强反光。',
    controls:[18,47,95,13,42,70,0],use:'柔和壁纸 / 暮色品牌氛围图',
  },
  {
    id:'crossing-foam',name:'碎浪交叠',en:'CROSSING SURF',group:'波浪与泡沫',kind:4,
    colors:['#175b9c','#3e8ac3','#88b7dd','#c7dced','#f4f6f4'],
    goal:'浅蓝水面上的几道斜向碎浪互相交叠，白沫沿不同方向延展。',
    criteria:['至少能分辨两组不同走向的浪沫','白沫有连片与碎散两种形态','蓝色水面穿插在泡沫之间，层次清楚'],
    avoid:['所有白沫平行，缺少交叠','泡沫覆盖过满，只剩白色'],
    steps:['先用两组不同方向的浪缘划分水面。','在浪缘相遇处增加白沫密度，其他位置逐渐打散。','用浅蓝连接浪与浪之间的暗缝。'],
    technique:'两组斜向泡沫距离场相交，交叠处提高白沫密度。',
    photo:'观察回流与新浪相遇时不同方向的泡沫，用稍俯视的构图保留交错关系。',
    controls:[59,45,133,35,61,20,65],use:'多层浪花底纹 / 海浪节奏素材',
  },
  {
    id:'azure-lace',name:'浅蓝泡纹',en:'AZURE LACE',group:'波浪与泡沫',kind:4,
    colors:['#0073b0','#2d9bca','#7bc8e0','#c5e5ef','#f1f9f8'],
    goal:'亮青蓝水面上，细白泡沫连成破碎网纹，局部白带交错但水体依旧清透。',
    criteria:['白沫以细密网纹与破碎薄带为主','网纹中留出青蓝色孔隙','局部密集白带与较清透区域有疏密变化'],
    avoid:['把细泡纹放大成厚重浪墙','全图颗粒均匀，失去带状结构'],
    steps:['先用亮青蓝渐变建立清透底色。','用细尺度噪声的等值线形成泡沫网纹。','再叠一组宽而破碎的白带，保留蓝色空隙。'],
    technique:'细胞状泡沫网纹叠加断续带状遮罩，分开控制细节与覆盖率。',
    photo:'俯视拍摄浪沫开始散开后的细网纹，选择蓝色空隙仍清楚的时刻，保留细泡与白带两层。',
    controls:[41,52,135,30,85,18,58],use:'清新水纹材质 / 青蓝海面背景',
  },
];

export const CONTROL_LIMITS={wave:[0,100],glint:[0,100],angle:[0,360],speed:[0,100],detail:[0,100],softness:[0,100],foam:[0,100]};
export const CONTROL_NAMES={wave:'波纹起伏',glint:'反光强度',angle:'光线方向',speed:'流动速度',detail:'纹理细度',softness:'柔焦程度',foam:'泡沫覆盖'};
const controlKeys=['wave','glint','angle','speed','detail','softness','foam'];
const visualReviews=[
  ['蓝水与白沫分区已形成，浪缘与泡沫孔洞仍偏粗。','细化浪缘的碎泡与透明水滴，减少块状白边。'],
  ['大小光斑已出现，水面景深和疏密变化仍不够自然。','增加清晰水纹与虚焦光斑的距离差，拉开密集区和留白区。'],
  ['碎银反射已形成，少数星芒的识别还不够突出。','减少周围过亮碎光，把少数星芒做清楚而克制。'],
  ['蓝色流动关系已出现，浅色丝带偏宽、偏柔。','收细丝带边缘，增加分叉与薄层穿插。'],
  ['大块破浪白沫已形成，局部颗粒仍有重复纹理感。','增加分离飞沫，打散白沫边缘的连续块面。'],
  ['大小虚焦点有层次，下沿泡沫与蓝水之间过渡还偏直。','强化近景白沫的零碎边缘，增加远近焦点差。'],
  ['黄蓝对比成立，镜纹仍像较规整的图案条纹。','打断亮带、增加宽窄突变与真实水纹细节。'],
  ['宽暗浪带与暖色反射已有主次，亮带仍偏平。','让金色反光随局部波峰破碎，补充浪体明暗。'],
  ['条带裁切下浪唇轮廓偏弱，透光边还不够清楚。','缩窄并强化暖色亮边，增加浪唇下方的薄暗面。'],
  ['黑底与银白圆斑关系成立，光斑群聚还可加强。','保留更完整的暗区，让强光斑集中成几组。'],
  ['灰蓝细纹与低对比成立，横纹仍偏规则。','叠加不等距细纹和零星反光，减少周期性。'],
  ['冷暖分区可见，条带中的薄浪唇识别仍弱。','强化薄亮边、浅蓝透光层与下方暗面三者关系。'],
  ['浅灰银白基调成立，亮纹过于平直。','将细白线合并为不规则反射片面，保留柔和暗缝。'],
  ['翡翠绿与流动关系成立，细长黄绿反射不足。','收细亮纹并增加交错，保持绿色水体的透明层次。'],
  ['满屏金色成立，暖白高光比例不足、横纹偏图案化。','提高局部暖白反光，打散等距金色条纹。'],
  ['钴蓝与横纹方向成立，银白亮纹还偏蓝、偏规则。','把少数反光提为近中性白，增加断裂与长短变化。'],
  ['上蓝下白的分区成立，泡沫过渡仍偏块状。','在交界处增加蓝色孔隙和分散白点。'],
  ['灰紫柔光基调成立，粉金暖色与自然水纹仍不足。','加强上部粉金反射，降低条纹的规则感。'],
  ['多组白沫与蓝水交错已出现，局部白沫过厚。','压低非交叠区的白沫覆盖，增加细碎散点。'],
  ['青蓝水体与细泡纹已出现，局部泡纹偏大、像闭合环。','缩小网纹尺度，打断闭合边缘并保留断续白带。'],
];
export const EFFECTS=entries.map((item,index)=>({...item,number:String(index+1).padStart(2,'0'),reference:`assets/reference/sea-${String(index+1).padStart(2,'0')}.webp`,source:`${SOURCE}/photo/${index+1}`,deep:item.colors[0],water:item.colors[1],light:item.colors[4],clarity:item.kind===3?.6:.1,controls:Object.fromEntries(controlKeys.map((key,i)=>[key,item.controls[i]])),extensions:EXPANSIONS[item.id],visualReview:{basis:'2026-11-13，首轮 90×1200 条带出图与作者参考对照',stage:'制作中，尚未确认复现达标',observed:visualReviews[index][0],next:visualReviews[index][1]}}));

export function cleanControls(value,fallback){
  return Object.fromEntries(Object.entries(CONTROL_LIMITS).map(([key,[min,max]])=>{
    const raw=value?.[key]; const number=raw===null||raw===''?NaN:Number(raw);
    return [key,Number.isFinite(number)?Math.round(Math.max(min,Math.min(max,number))):fallback[key]];
  }));
}

export function makePrompt(effect,controls){
  const focus=controls.softness>60?'近处反光柔焦成较大光斑，远处保留小而较清楚的亮点':controls.softness>30?'部分反射边缘柔和，水面主体仍保留纹理':'波纹与主要反射边缘清楚，保留自然细节';
  const light=controls.glint===0?'将直接镜面闪光收弱到不可见，仅保留柔和环境反射':controls.glint<40?'降低直接闪光强度，保留明暗层次':'突出亮部与暗缝的层次，最亮处仍能看见形状';
  return `海面局部摄影风格图，画面由水面构成。目标效果：${effect.goal} 必须做到：${effect.criteria.join('；')}。画面控制：${focus}；${light}；波纹${controls.wave<30?'平缓':controls.wave>65?'起伏明显':'有自然起伏'}，纹理${controls.detail>65?'细密':controls.detail<35?'舒展、尺度较大':'疏密自然'}。色彩参考：${effect.colors.join('、')}，按水体、反射和泡沫的关系分配颜色。构图服务于${effect.use}。避免：${effect.avoid.join('；')}。无人物、无船只、无文字与标志。`;
}

export function makeRecipe(effect,controls,{realismProfile='calibrated',lensEffects=false}={}){
  const reality=realityForEffect(effect.id);
  const calibrated=realismProfile!=='reference';
  return {version:3,number:effect.number,id:effect.id,name:effect.name,goal:effect.goal,reference:effect.source,referenceAuthor:'페빗 / PEBIT（发布账号与自署线索；具体图像处理未核实）',additionalReferenceSource:ADDITIONAL_SOURCE,additionalReferences:referencesForEffect(effect.id).map(item=>({...item})),acceptance:calibrated?reality.acceptance:effect.criteria,artisticAcceptance:effect.criteria,avoid:effect.avoid,steps:calibrated?reality.changes:effect.steps,implementation:calibrated?'方向传播波面、法线约束反射、Fresnel 与微表面高光；近岸泡沫按相位生成及衰减。实时近似，非流体求解与完整光学模拟。':effect.technique,artisticImplementation:effect.technique,photography:effect.photo,parameters:controls,renderProfile:calibrated?'calibrated':'reference',lensEffects,rendererRevision:'2.7-real-sea-01',realityComparison:reality,realSeaSources:REAL_SEA_SOURCES.filter(source=>reality.sourceIds.includes(source.id)).map(({localFile,...source})=>source),colors:effect.colors,prompt:makePrompt(effect,controls),use:effect.use,lastVisualReview:effect.visualReview,extensions:effect.extensions.map(plan=>({...plan,prompt:expansionPrompt(effect,plan)})),provenance:'原帖与补充图均为处理未核实的视觉参考。机构实拍仅支持对照中标明的局部现象，不认证原帖、不表示已经实现全部效果。视频保留机构和摄影者署名，不属于本项目可商用或再分发的素材；导出包仅含程序制作图与分析配方。校准稿仍需按对应实拍逐项验收。'};
}
