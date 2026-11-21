// These are twenty visual studies, not twenty independent physical phenomena.
// A plausible mechanism does not authenticate the social-media image that inspired it.
// Source links below explain mechanisms; case-level judgments remain this project's analysis.
export const DEMO_DIRECTION = {
  recordedAt:'2026-11-14',
  principle:'以现有演示的最终画面与观看体验驱动。先明确想呈现什么，再按需要补充环境依据、选择实现方式和检查实际效果。',
  conditionNote:'太阳、天空、海况、水深与海底、观看角度和镜头都可能影响呈现；具体组合先作为候选条件记录，按演示需要验证。',
  evidenceRole:'实拍与条件分析为演示提供依据。现有20项各自的色彩、光斑和波纹目标继续保留；资料查核与画面制作按具体需要推进。',
  workflow:['明确演示目标','按需查看环境与镜头记录','选择实现方式','在现有演示中看实际画面','记录差距并继续打磨'],
};

export const REALITY_PRINCIPLES = [
  {id:'glitter',title:'NOAA · 水面碎光与观察几何',url:'https://psl.noaa.gov/outreach/education/science/glitter/',scope:'波面局部朝向、光源和观察位置共同决定闪光分布。'},
  {id:'color',title:'NOAA · 海水颜色',url:'https://oceanservice.noaa.gov/facts/oceanblue.html',scope:'海色与光的吸收、散射及水中物质有关，不能仅凭颜色反推水深。'},
  {id:'foam',title:'NOAA · 海泡沫',url:'https://oceanservice.noaa.gov/facts/seafoam.html',scope:'海浪搅动产生气泡；水中物质也影响泡沫的形成与持续。'},
  {id:'bokeh',title:'Nikon · 失焦光斑',url:'https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/photograph-the-classic-holiday-light-bokeh-effect',scope:'失焦会把亮点表现成柔软光斑，形态属于镜头成像。'},
  {id:'starburst',title:'Nikon · 镜头星芒',url:'https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/bright-idea-adding-star-power',scope:'光圈边缘衍射可以让强亮点出现星芒；这不是水面的实体形状。'},
];

const treatmentUnknown = '原帖未提供对应原片与处理记录，无法确认调色、合成或 AI 使用情况；这里不依据外观下结论。';
const supportingVideoIds = {
  'foam-edge':['usf-rolling-foam','usf-closeup-surf'],
  'round-bokeh':['usf-sunset-waves'],
  'star-glitter':['usf-sunset-waves'],
  'blue-silk':['usf-wave-pattern','usf-shallow-water'],
  'breaking-spray':['nps-gulls','usf-rolling-foam'],
  'depth-glints':['usf-sunset-waves','usf-rolling-foam'],
  'yellow-blue':['usf-sunset-waves','nps-sunset'],
  'amber-swell':['usf-sunset-waves','nps-sunset'],
  'honey-crest':['usf-rolling-foam','usf-sunset-waves'],
  'black-silver':['usf-sunset-waves'],
  'slate-ripple':['usf-wave-pattern'],
  'translucent-lip':['usf-rolling-foam','usf-shallow-water'],
  'silver-wash':['usf-sunset-waves'],
  'emerald-flow':['usf-shallow-water'],
  'molten-gold':['usf-sunset-waves','nps-sunset'],
  'cobalt-streaks':['usf-sunset-waves','usf-wave-pattern'],
  'white-surf':['usf-rolling-foam','usf-closeup-surf'],
  'pink-dusk':['nps-sunset','usf-sunset-waves'],
  'crossing-foam':['nps-gulls','usf-rolling-foam'],
  'azure-lace':['usf-rolling-foam','usf-shallow-water'],
};
const revisionFor = effectId => {
  const common = {
    revisionStatus:'代码已调整 · 尚待实拍与网页画面共同验收',
    implemented:['校准版采用多方向传播波面，以波面法线、视线和光线计算反射；不再用屏幕横纹直接代替波面。'],
    remaining:['当前仍是实时近似；代码通过或来源明确都不等于视觉已达到真实海面。'],
  };
  if(['round-bokeh','star-glitter','depth-glints','black-silver'].includes(effectId)) {
    common.implemented.push('自然观察默认关闭装饰圆斑与星芒；基础闪光限制在波面反射区域。');
    common.remaining.push('镜头开关只是受反射区域约束的简化示意，尚非真实光圈、景深与衍射模拟。');
  }
  if(['foam-edge','breaking-spray','honey-crest','translucent-lip','white-surf','crossing-foam','azure-lace'].includes(effectId)) {
    common.implemented.push('泡沫按移动波峰相位生成、近似平流并按年龄衰减，替代固定屏幕白色遮罩。');
    common.remaining.push('尚无真实三维卷浪、薄浪体透射与离水飞沫；多方向回流和泡沫寿命仍需实拍校准。');
  }
  if(['yellow-blue','amber-swell','molten-gold','pink-dusk'].includes(effectId)) {
    common.implemented.push('暖色版由波面反射组织高光并保留背光暗面，取消铺满屏幕的硬黄色等距条带。');
    common.remaining.push('尚未用匹配机位的天空环境校准色彩；强黄蓝与粉紫原目标继续按艺术配色处理。');
  }
  if(['blue-silk','emerald-flow'].includes(effectId)) {
    common.implemented.push('自然校准版去除独立发光的流纹和所谓焦散线，只保留弱透射色与波面明暗。');
    common.remaining.push('尚无水底几何、光线路径和真实焦散；不能把自然版弱透射色称为已还原透明浅海。');
  }
  if(['slate-ripple','silver-wash','cobalt-streaks'].includes(effectId)) {
    common.implemented.push('细波改为世界空间传播与投影；反光不再由等距屏幕扫描线决定。');
    common.remaining.push('天空反射、近远纹理尺度和实际曝光仍需与连续实拍逐项比对。');
  }
  return common;
};
const entry = (number,effectId,sourceTags,details) => ({
  number:String(number).padStart(2,'0'),effectId,sourceIds:supportingVideoIds[effectId]||[],sourceTags,
  evidenceStatus:'机制已整理 · 实拍对照待验收',
  changesStatus:'改进目标清单；是否完成以同帧对照和实际画面验收为准。',
  classificationNote:'自然现象、镜头成像与艺术选择可以同时存在；本项不是一种独立的海洋物理现象。',
  artistic:{status:'处理未核实',explanation:treatmentUnknown},
  ...revisionFor(effectId),
  ...details,
});

export const REALITY_COMPARISONS = [
  entry(1,'foam-edge',['surf'],{
    natural:{status:'有现实依据',explanation:'破浪后的白沫可沿推进边缘聚集，清水间隙与碎泡随水流不断改变。'},
    camera:{status:'拍摄参与',explanation:'快门会影响细泡和水滴是否清楚；原帖没有快门资料，不能把凝固的一帧当作泡沫的运动方式。'},
    principleIds:['foam'],
    observe:'从浪缘开始推进，到停止、回落，跟踪同一块白沫的位置和形状，不只看最白的一帧。',
    transfer:'保留弯曲主浪缘；把细泡附着在推进水体上，让碎泡向外扩散后逐渐消失。',
    limits:'破浪实拍可验证推进和消散；原参考的饱和蓝色及每一颗亮点是否为泡沫仍未确认。',
    changes:['泡沫由破浪相位触发，不能在无浪水域均匀出现。','让旧泡沫随水流移动并减弱，避免固定白色遮罩。','在高覆盖区保留形状持续变化的清水孔隙。'],
    acceptance:['能连续跟踪一次推进、回落与消散。','泡沫边缘与主浪运动一致，没有悬浮白点。','暂停后能分辨薄水、白沫和蓝色间隙。'],
  }),
  entry(2,'round-bokeh',['glints'],{
    natural:{status:'有现实依据',explanation:'基础亮点可来自波面对太阳的镜面反射；反光应依赖局部波面和观看方向。'},
    camera:{status:'镜头主导圆斑',explanation:'大圆斑可由反光失焦形成。圆斑大小不是海面气泡的大小，也不能直接作为水面材质。'},
    principleIds:['glitter','bokeh'],
    observe:'先观察清晰海面中闪点的出现与消失；散景的成像机制另看 Nikon 原理说明，不能用普通碎光视频代替失焦实拍。',
    transfer:'先建立随波面变化的碎光，再单独表现镜头虚焦；保留清晰水纹作为焦点参照。',
    limits:'当前仅以已看过代表帧的金色日落片段对照基础反射，颜色与原目标不同；没有海面失焦对焦过程，不能验证原参考的光圈、焦平面或大圆斑。',
    changes:['关闭屏幕空间随机撒点，将亮点约束在镜面反射区域。','将圆斑移到独立镜头层；自然观察模式默认不添加。','虚焦改变亮点形状时，同时降低对应水面细节的清晰度。'],
    acceptance:['关闭镜头层后仍有可信的细碎反射。','改变光线方向会改变闪光区域。','圆斑不独立漂移，保持与基础反射的来源关系。'],
  }),
  entry(3,'star-glitter',['glints'],{
    natural:{status:'有现实依据',explanation:'太阳在细小波面上可形成密集短暂的强反射。'},
    camera:{status:'星芒属成像效果',explanation:'强亮点上的射线可以来自镜头光圈衍射，也可经后期添加；原帖不能确认具体来源。'},
    principleIds:['glitter','starburst'],
    observe:'跟踪少数强亮点随波面朝向短暂增强、消失的过程，检查射线是否只与强亮点共同出现。',
    transfer:'先做真实反光的明灭与聚集；星芒仅作为可关闭的摄影呈现，不在水体上绘制固定十字。',
    limits:'当前已看过代表帧的金色日落片段只支持基础反光与暗面关系，不能证明蓝色碎银密度或星芒。Nikon 只解释成像机制，原帖镜头、光圈或是否添加均未核实。',
    changes:['将基础闪光绑定波面法线，取消规则网格上的星点。','星芒只由超过阈值的高光触发，不能凭随机种子单独发亮。','自然观察模式保留碎光，镜头星芒另列状态。'],
    acceptance:['关闭星芒后仍呈现随波面变化的碎银。','射线与基础高光同时明灭。','没有固定在屏幕格点的闪星。'],
  }),
  entry(4,'blue-silk',['calm','shallow'],{
    natural:{status:'机制可解释',explanation:'波浪可把环境反射拉伸成曲折亮纹；仅凭单帧不能判定这些纹路是否还包含水底折射或泡沫。'},
    camera:{status:'视角参与',explanation:'俯视和低角度观看时，反射与透过水体看到的内容占比不同；窄裁切隐藏了环境。'},
    principleIds:['glitter','color'],
    observe:'观察长亮纹是否随波面弯折、分合，是否与可见水底保持不同的运动关系。',
    transfer:'把亮纹看作随波面改变的环境反射，减少均匀自发光的丝带。',
    limits:'已看过的两段浅水素材都可见水底，明暗混合了底物、折射和反射；它们可对照波面造成的形变，不能直接验证蓝色反射丝带或把水底纹路全叫作表面反射。',
    changes:['以连续波面控制明暗，不让等值线独立滑动。','降低亮纹的固定发光强度，保留暗水面。','把水底明纹和表面反射分开，无法确认的部分标为视觉推演。'],
    acceptance:['亮纹随波面连贯变形，没有整张贴图平移。','局部可见不规则断裂与合并。','没有均匀宽度的霓虹线。'],
  }),
  entry(5,'breaking-spray',['surf'],{
    natural:{status:'有现实依据',explanation:'浪体破碎会形成白水、泡沫和离开水面的飞沫，它们的轨迹与持续时间不同。'},
    camera:{status:'快门影响明显',explanation:'快速曝光能凝住飞沫，较长曝光会拖柔运动；视频若慢放也会改变主观速度。'},
    principleIds:['foam'],
    observe:'看浪体先抬起再破碎、飞沫分离和落回、白水继续向前推进的先后关系。',
    transfer:'先改善破碎与白水推进；离水飞沫需要独立空间运动，不能用散景圆斑冒充。',
    limits:'USF 已看代表帧是近岸小浪，NPS 岩岸片段目前只核查机构描述，不能据此说飞沫形态已实看。当前平面程序也缺少三维卷浪和弹道飞沫。',
    changes:['白沫在破碎时刻增强，随后扩散和衰减。','去除均匀散布的装饰光点，明确飞沫与反光的差别。','将无法由平面材质承担的浪体体积列为三维制作差距。'],
    acceptance:['白水出现之前有可辨认的波峰推进。','白沫不会整块突然亮起或瞬间清空。','飞沫能力未实现时页面明确保留差距。'],
  }),
  entry(6,'depth-glints',['glints','surf'],{
    natural:{status:'有现实依据',explanation:'远近海面的反光与前景浪沫可以同时入镜，但它们是不同成因的亮部。'},
    camera:{status:'景深主导层次',explanation:'清晰小点与柔软大圆斑的共存可能受焦平面和镜头影响，不能用随机大小直接代表远近。'},
    principleIds:['glitter','bokeh','foam'],
    observe:'区分移动的白沫、瞬时反光与失焦亮斑；比较同一距离的水纹和亮点是否具有相符清晰度。',
    transfer:'自然水面先保留空间透视，再在镜头层讨论景深；前景泡沫与远景闪光用不同模型。',
    limits:'反光与白沫目前来自不同机位片段，只能分开参照；当前缺少海面景深对照视频，不能证明原图的虚实叠加关系、焦点位置或大小光斑成因。',
    changes:['反射由波面方向触发，泡沫由浪的相位触发。','去除两套互不关联的随机散景层。','以视距控制基础细节尺度，镜头层单独记录。'],
    acceptance:['泡沫持续随水流移动，碎光短暂闪烁。','远处细节受到透视压缩。','关闭镜头效果后自然结构仍成立。'],
  }),
  entry(7,'yellow-blue',['gold','glints'],{
    natural:{status:'反射机制有依据',explanation:'暖色光源或环境与偏蓝水面可以产生冷暖反差；极强黄蓝分离并非所有海况都存在。'},
    camera:{status:'曝光与白平衡参与',explanation:'曝光、白平衡和截取范围会改变冷暖对比；原帖未提供相机设置。'},
    artistic:{status:'强撞色为艺术目标',explanation:`本项目的明黄与钴蓝分段配色是设计选择。${treatmentUnknown}`},
    principleIds:['glitter','color'],
    observe:'在暖光实拍中辨认反射区与暗面如何分布，先看亮带运动，再比较色彩。',
    transfer:'自然版由暖光反射和冷色暗面产生对比；原先明黄/钴蓝硬分色保留为艺术版。',
    limits:'USF 日落代表帧已看，但并非原图的黄蓝同色复拍；NPS 广角日落仍仅作机构说明补充。当前证据不能证明极端双色未经处理。',
    changes:['取消亮度阈值直接把波纹二值分成黄蓝。','亮带位置由波面和光源几何控制。','将极强饱和度作为艺术选项，不混入自然基准。'],
    acceptance:['自然版中黄色集中在合理反射区。','亮带有不等距断裂与暗面。','自然目标与艺术目标在界面中可区分。'],
  }),
  entry(8,'amber-swell',['gold','surf'],{
    natural:{status:'有现实依据',explanation:'低角度暖光可以照亮部分浪面，相邻朝向不同的浪面仍较暗。'},
    camera:{status:'机位与曝光参与',explanation:'紧构图可只保留反光浪段；原帖未交代完整海况与机位。'},
    principleIds:['glitter'],
    observe:'连续观察一列浪前进时，金色亮带怎样沿浪面变化；亮带不是永远附着在同一条固定横线上。',
    transfer:'让宽浪面控制暗区，细波控制碎光，避免满屏相同金色横纹。',
    limits:'单一暖光片段不提供所有风速、浪高和太阳高度的组合证据。',
    changes:['用世界坐标中的波面替换屏幕等距条纹。','暖色反射受半角向量约束，保留较宽暗区。','让细碎高光沿浪面连续出现与消失。'],
    acceptance:['宽暗面与细碎金光可同时辨认。','亮带随浪形变化，避免整图固定频率闪烁。','移开光源方向时反光区随之改变。'],
  }),
  entry(9,'honey-crest',['surf','gold'],{
    natural:{status:'机制可解释',explanation:'薄浪边可能透过暖光；暖色亮边也可能含有表面反射，单帧不能确认两者比例。'},
    camera:{status:'逆光与曝光参与',explanation:'低视角和曝光选择会突出薄边；暖边并不意味着整道浪体会发光。'},
    principleIds:['glitter','foam'],
    observe:'观察真实小浪的薄边、厚浪体和破碎后白沫的先后变化；区分亮边与白色泡沫。',
    transfer:'先做随浪推进的厚薄层次，薄边保持有限亮度，破碎后才增加泡沫。',
    limits:'普通破浪视频能验证轮廓和破碎过程；若没有侧逆光薄浪镜头，蜂蜜色透光仍是待补证目标。',
    changes:['浪唇轮廓随相位推进，不能固定成发光线。','压低厚浪体亮度，避免整道浪变成灯带。','对三维卷曲与真实透射明确保留未实现项。'],
    acceptance:['薄亮边、暗浪体与白沫是三个可分辨区域。','亮边不脱离浪体漂移。','未证明的暖透射不标作实拍已验证。'],
  }),
  entry(10,'black-silver',['glints'],{
    natural:{status:'有现实依据',explanation:'明亮太阳反射与较暗环境反射可以形成强亮暗差，海水并非因此具有黑色固有材质。'},
    camera:{status:'曝光与失焦可能参与',explanation:'按亮部曝光能让背景更暗；大银斑还可能受失焦影响，不能把黑银关系直接解释成夜海。'},
    principleIds:['glitter','bokeh'],
    observe:'观察实拍强反光周围的暗面与细波是否仍有连续结构，区分自然闪点与圆形失焦斑。',
    transfer:'保留低亮水体与局部反光，以反射分布控制群聚，不撒满屏幕。',
    limits:'已看 USF 日落代表帧显示金色反光与暗水面，只支持亮暗分离，不能替代黑银同色或失焦实拍；也不能证明原帖夜拍、黑位压缩或后期程度。',
    changes:['用波面与光源决定银斑位置，取消固定屏幕点群。','暗区保留微弱水纹，避免黑色底板。','自然版不默认叠加大圆斑。'],
    acceptance:['画面主要是有波纹的暗水体。','强光在局部随波向聚散。','不会误把圆斑或曝光效果归类为水体结构。'],
  }),
  entry(11,'slate-ripple',['calm'],{
    natural:{status:'有现实依据',explanation:'较平静水面在柔和环境光下可呈低对比灰蓝细纹，细纹仍有不同尺度和方向。'},
    camera:{status:'视角与成像参与',explanation:'远处纹理受透视压缩；锐化和视频压缩会改变细纹观感，但原帖具体处理未知。'},
    principleIds:['glitter','color'],
    observe:'在浅水片段中区分相对稳定的水底结构与不断变形的波面；连续播放时再跟踪交叉细波，不能把全部明暗当作反射。',
    transfer:'降低强闪光，使用连续且不等距的低振幅波面，避免密排扫描线。',
    limits:'当前 Wave Pattern 代表帧能见水底，是灰青浅水俯视，不是灰蓝开阔远海的直接证据；明暗包含底物与折射。只参照细波形变，不能验证远海反射、灰蓝海色、视距或风速。',
    changes:['取消屏幕纵坐标中的高频等距正弦横线。','细波在世界空间叠加，近远尺度按投影变化。','环境反射保持低对比，零星闪光受几何控制。'],
    acceptance:['没有固定间距的金属拉丝纹。','细波相位连续前进而非原地明灭。','近远纹理有尺度差，暗部不成为死灰。'],
  }),
  entry(12,'translucent-lip',['surf','shallow'],{
    natural:{status:'机制可解释',explanation:'小浪的薄边可以透光，浪面同时会反射天空；亮边并不全部等于透射光。'},
    camera:{status:'角度参与',explanation:'侧逆光和低机位可突出薄边，窄条裁切不足以确定完整照明关系。'},
    principleIds:['glitter','foam','color'],
    observe:'比较薄边位置、浪体厚度和破碎白沫的变化，看亮边何时出现、何时被泡沫取代。',
    transfer:'保留薄边与蓝色浪体的层次，减少固定粉白分区；先保证轮廓与运动可信。',
    limits:'若没有同角度逆光小浪实拍，本项透射强度与粉白天空反射仍未获得直接视频验证。',
    changes:['浪唇位置随推进相位改变。','将表面高光与薄水透光分开描述，不统一涂白。','泡沫在破碎后出现并渐退，不常驻在波脚。'],
    acceptance:['薄边不变成粗白描边。','浪体与白沫的先后关系清楚。','页面标出逆光薄边证据仍有的缺口。'],
  }),
  entry(13,'silver-wash',['calm','glints'],{
    natural:{status:'有现实依据',explanation:'大范围亮天空反射或密集太阳碎光可以让局部海面显得银白，两种照明条件不能混为一谈。'},
    camera:{status:'曝光影响明显',explanation:'曝光可使亮部接近纯白；亮区细节多少并不单由海况决定。'},
    principleIds:['glitter'],
    observe:'当前只在日落片段观察局部太阳反光与暗缝；要验证银白铺光，仍需补宽阔亮天空反射的对应片段。',
    transfer:'把明亮环境反射与点状太阳反射分开；保留有形状的灰蓝暗缝。',
    limits:'现有已看代表帧的日落视频是局部金色反光，不能验证大面积银白天空反射；浅水水底明纹也不能代替银白海面证据。原参考是否高曝或压缩对比尚未核实。',
    changes:['取消随噪声直接涂白的大块遮罩。','让亮面跟随波面朝向变化。','降低整体提白，保留亮部内部层次。'],
    acceptance:['银白区域中仍能看出连续波形。','亮暗片面随波推进，不是白雾覆盖。','太阳碎光与柔和天空反射在说明中分开。'],
  }),
  entry(14,'emerald-flow',['shallow','calm'],{
    natural:{status:'机制可解释',explanation:'绿色水体、环境反射和可见水底都可能参与翡翠色纹路；不能凭颜色认定是浅水或纯净度。'},
    camera:{status:'视角与偏振可能参与',explanation:'拍摄角度影响反射与透视水底的比例；是否使用偏振镜及白平衡设置未知。'},
    principleIds:['color','glitter'],
    observe:'观察水底结构是否相对稳定、表面亮纹是否快速变形；不要把所有弯线都叫焦散。',
    transfer:'给可见水底、波面反射和艺术流纹各自留出来源说明，避免整张染绿后叠发光线。',
    limits:'一般透明浅水视频只能证明相关层次；无法由此认证原帖绿色的来源与调色程度。',
    changes:['水体底色保持深浅变化，不以纯绿覆盖。','收弱固定发光曲线，改用受波面影响的明暗。','不能确认水底时，不把图案标成物理焦散。'],
    acceptance:['绿色不成为均匀荧光底色。','水底纹理与表面反射在说明中区分。','长亮纹有自然分合，不是恒宽丝带。'],
  }),
  entry(15,'molten-gold',['gold'],{
    natural:{status:'局部取景有依据',explanation:'将镜头对准暖光反射路径中的一小片水面，可以获得大面积金色；不代表整个海面均匀发金光。'},
    camera:{status:'取景与曝光主导覆盖',explanation:'紧裁切、曝光和白平衡明显影响满屏金色的观感，原帖具体设置未知。'},
    principleIds:['glitter'],
    observe:'先看有环境的暖光海面，再比较反射路径内部与外部的亮度，观察亮带的破碎和暗缝。',
    transfer:'自然版保留光源约束；满屏覆盖解释为反射区局部取景，而不是给整片海洋加金色底纹。',
    limits:'若没有完整机位与太阳位置，不能从窄片倒推出反射路径的真实宽度。',
    changes:['取消恒定覆盖全屏的金色正弦条带。','由波面产生不均匀反射并保留深色间隙。','把高覆盖艺术构图与完整海面的照明区分。'],
    acceptance:['同一波面可见亮金、暖白与暗缝。','亮带宽窄和间距没有固定周期。','页面不会声称整片海水本身呈金色发光。'],
  }),
  entry(16,'cobalt-streaks',['glints','calm'],{
    natural:{status:'反射形态有依据',explanation:'波面和观察角度可以把反光组织成横向短带；强钴蓝不是独立的海浪类型。'},
    camera:{status:'成像可能参与',explanation:'失焦、运动和曝光都可能改变光斑的拉长程度，不能凭单帧认定是长曝光。'},
    artistic:{status:'钴蓝为配色目标',explanation:`本项目以钴蓝强调视觉用途，写实版应先服从实拍光照。${treatmentUnknown}`},
    principleIds:['glitter','bokeh','color'],
    observe:'先在日落片段观察亮带的断续与暗缝；浅水片段只看波纹形变，不将水底亮纹解释为钴蓝海面横光。',
    transfer:'用透视和波面控制短亮带；保持中性偏白高光，蓝色留给水体和环境反射。',
    limits:'金色日落并非钴蓝同色实拍；Wave Pattern 能见水底，不能直接验证远海反射或横向失焦。原图亮纹拉长的镜头设置与钴蓝饱和度均未核实。',
    changes:['去掉屏幕等距横线和独立拉长散景的混合。','让亮带受波面方向约束并自然断续。','降低写实版强钴蓝的固定饱和度。'],
    acceptance:['横光长短、间距和亮度各不相同。','反光与水纹共享运动，而非两层贴图滑动。','艺术配色不会被当作自然海色的必然结果。'],
  }),
  entry(17,'white-surf',['surf','glints'],{
    natural:{status:'有现实依据',explanation:'前景白水与远处较完整水面可以形成上蓝下白的构图，但分界会随浪推进。'},
    camera:{status:'构图参与',explanation:'上深下浅是取景选择，不是所有海面共有的固定上下结构。'},
    principleIds:['foam','glitter'],
    observe:'跟踪泡沫前缘推进、最大铺开、退水后的孔隙变化，比较远处瞬时闪光。',
    transfer:'让前景白沫与远处水面共享同一浪的时序，远处碎光保持独立成因。',
    limits:'USF 代表帧显示灰暗小浪与湿沙，支持泡沫的局部分区，不能认证原图深蓝海色或大量白水；连续节律仍需播放核对，不是每次浪都在同一屏幕高度结束。',
    changes:['取消固定下半屏白色覆盖。','让推进和回退改变泡沫边界，旧沫持续衰减。','用不规则清水孔隙打散白沫整块感。'],
    acceptance:['泡沫前缘明显发生位移。','白沫内保留水流造成的破口与细丝。','远处闪光不会跟着整块白沫统一明灭。'],
  }),
  entry(18,'pink-dusk',['dusk','gold','calm'],{
    natural:{status:'条件性成立',explanation:'在有相应暮色天空的条件下，海面可以反射暖粉或紫灰色；不能在任意天色下使用固定粉色渐变。'},
    camera:{status:'白平衡与曝光参与',explanation:'暮色颜色对相机设置和处理敏感，原帖缺少对应环境与拍摄信息。'},
    artistic:{status:'粉紫处理未核实',explanation:`原图粉紫色是否被强化未核实；本项目的粉金至灰紫渐变属于明确的艺术配色。${treatmentUnknown}`},
    principleIds:['glitter','color'],
    observe:'有天空的暮色实拍中，比较天空色区与海面反射的对应关系，避免只截水面后猜测光源。',
    transfer:'自然版由环境光色产生柔和冷暖差；没有粉霞视频证据时保留为待校准艺术目标。',
    limits:'已看 USF 代表帧是金色日落；NPS 日落目前只核查机构说明且未连续观看。两者均不能代替粉霞与紫灰天空的直接证据。',
    changes:['减弱固定上下粉紫渐变对波面明暗的覆盖。','用柔和环境反射保留水面形体。','粉霞缺少匹配实拍时，明确标注色彩未验证。'],
    acceptance:['有相应天空证据才能标注粉霞色彩已对照。','低对比水纹仍然可读，不糊成色带。','不通过添加星芒或提高饱和度掩盖形体不足。'],
  }),
  entry(19,'crossing-foam',['surf'],{
    natural:{status:'有现实依据',explanation:'来浪、回流和局部地形可造成不同方向的白沫相遇，但交叉形态不等于两套独立正弦波。'},
    camera:{status:'俯视构图参与',explanation:'较高机位更容易看清交叠关系；单张截取会隐藏水流的先后次序。'},
    principleIds:['foam'],
    observe:'跟踪新浪遇到旧沫或回流时，白沫被推移、拉伸与汇合的过程，区分新生白水和旧泡沫。',
    transfer:'让第二次推进作用到仍未消失的旧沫，避免几何上简单相交的白色直带。',
    limits:'USF 代表帧只展示近岸小浪；NPS 岩岸素材仅核查机构说明，未实际连续观看。当前没有已看过的明确相遇过程，不能说交错回流已获直接验证。',
    changes:['旧泡沫保留年龄和消散阶段，避免每周期全部重置。','相遇区改变覆盖率和形状，不按两正弦线取最大值铺白。','拉开来浪和回流的方向与速度。'],
    acceptance:['能区分先存在的旧沫与新来的白水。','交错位置随水流移动。','非交叠区保留足够水体与细泡。'],
  }),
  entry(20,'azure-lace',['surf','shallow'],{
    natural:{status:'泡沫机制有依据',explanation:'破浪后薄泡沫可以被拉成有水孔的细网；浅水折射亮纹与泡沫网纹的成因不同。'},
    camera:{status:'尺度与角度参与',explanation:'俯视、画幅尺度与清晰度决定泡纹能否辨认；白色细线不能仅凭外观判为气泡。'},
    principleIds:['foam','color'],
    observe:'观察细网是否从白水区散开、随表面流动并断裂；若亮纹持续附在水底，应另作折射参照。',
    transfer:'只把确认属于表面白沫的结构用于泡沫模型，网孔随拉伸与消散变形。',
    limits:'透明浅水中的亮网不能自动证明泡沫；没有产生和消散过程时仍保留机制歧义。',
    changes:['打断固定闭合等值线，让网纹随着旧沫老化破碎。','泡沫发白，水底明纹随水深和光照变化，界面中明确区分。','降低均匀细噪声，保留宽薄白带与清水孔隙的尺度差。'],
    acceptance:['细网来自泡沫区并随时间断裂减弱。','网孔不是全图同样大小的闭合圆环。','无法确认的浅水亮纹不被写成已验证泡沫。'],
  }),
];

export function realityForEffect(effectId) {
  return REALITY_COMPARISONS.find(item=>item.effectId===effectId);
}
