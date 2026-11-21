export const STUDIES = [
  {
    id: 'silver', number: '01', name: '碎银闪光', en: 'SILVER GLITTER',
    poem: '把阳光揉碎，撒进蓝色里。', description: '蓝色水面 · 细碎反光 · 明亮轻盈',
    colors: ['#103b58', '#187aab', '#60bad3', '#b4e4e5', '#f0fbef'],
    deep: '#073253', water: '#247eae', light: '#ecfffa', foam: 0.02, clarity: 0.24,
    controls: { wave: 48, glint: 76, angle: 125, speed: 35 },
    scene: '青蓝色海面，明亮的银白色反光贴着细碎波峰跳动，亮点疏密自然，近处波纹清楚，远处少量光点柔和虚化',
    photo: ['在有细碎波纹的晴天海面寻找太阳倒影，慢慢改变站位，让反光进入画面。不要直视太阳。', '用较快快门凝住闪光和水滴；先保护亮部，再适当提起暗部。放大检查最亮的区域是否还保留纹理。', '构图只保留海面，清晰波纹与少量虚化亮点交错；改变焦距或对焦距离，比较高光形态。'],
    technique: '用多层波面法线产生局部方向差异，再计算光线反射。较集中的镜面高光会在波峰附近断续出现。',
  },
  {
    id: 'turquoise', number: '02', name: '青蓝涟漪', en: 'TURQUOISE RIPPLE',
    poem: '一阵风，吹皱透明的蓝。', description: '清透青蓝 · 柔缓波纹 · 安静流动',
    colors: ['#0b636b', '#198c93', '#51b6b3', '#9cdbce', '#d9efda'],
    deep: '#0b626f', water: '#4cb7b8', light: '#e1f9df', foam: 0.0, clarity: 0.9,
    controls: { wave: 30, glint: 38, angle: 148, speed: 22 },
    scene: '透明的青绿色浅海，柔缓涟漪交叠，浅色光纹隐约流动，水体呈青蓝到薄荷绿的自然渐变，反光柔和克制',
    photo: ['选择水质较清、风浪较小的近岸水面，从安全的位置俯拍，寻找有深浅变化的区域。', '比较不同观察角度的水面反射；如果使用偏振镜，逐步旋转，观察透视感与反光如何变化。', '保留青绿中间调和细微明暗，避免过度提高饱和度；让柔缓波纹成为画面的主体。'],
    technique: '在水体底色中叠加低强度流动明暗纹理，结合宽而弱的反光，表现清透感。这里的水下光纹是视觉近似。',
  },
  {
    id: 'gold', number: '03', name: '落日熔金', en: 'LIQUID GOLD',
    poem: '落日还没走，先在海里融化。', description: '暖金反射 · 深色水体 · 流动光带',
    colors: ['#173a44', '#5d6650', '#b19b50', '#e7be67', '#fff0b5'],
    deep: '#071e2b', water: '#23505a', light: '#ffc15b', foam: 0.0, clarity: 0.08,
    controls: { wave: 56, glint: 91, angle: 92, speed: 28 },
    scene: '低角度夕阳照射深蓝灰色海面，暖金色反光沿波峰形成一条断续的纵向光带，光带外围海水较暗，金色与冷色相互衬托',
    photo: ['在日落前后寻找太阳倒影所在方向，把暖色光带纳入海面构图；现场颜色会随天气和时间变化。', '以反光区域为依据调整曝光，保护金色亮部，不必把整个暗面都提亮。', '尝试用较紧的构图截取光带，让暗色水面围住它；保留波纹，不把金光处理成一整块白色。'],
    technique: '改变入射光的方向与暖色光谱，用深色水体托住镜面反射，让高光集中为断续光带。',
  },
  {
    id: 'foam', number: '04', name: '浪花白沫', en: 'SEA FOAM',
    poem: '浪来过，留下一封白色的信。', description: '深蓝海水 · 白色泡沫 · 层叠节奏',
    colors: ['#102d43', '#1c617b', '#438da3', '#afcfce', '#edf3e8'],
    deep: '#0a304c', water: '#277d9e', light: '#f2f5e9', foam: 0.92, clarity: 0.12,
    controls: { wave: 78, glint: 42, angle: 140, speed: 53 },
    scene: '深青蓝海水中，一道弯曲浪脊翻出细密白色泡沫，泡沫聚集成不规则的带状与网状纹理，边缘逐渐破碎，暗色海水从空隙透出',
    photo: ['从稳固、安全的位置观察浪花卷起到消散的过程，先判断浪的节奏，再拍摄泡沫形状。', '快门较快时可以凝住细碎泡沫，较慢时会形成流动的白色线条；根据想表现的质感取舍。', '让白沫与深色海水同时出现在画面中，留意泡沫的空隙与层次，避免白色区域曝光溢出。'],
    technique: '在波纹之上叠加沿浪脊聚集的多尺度泡沫纹理，边缘渐散。本页没有模拟流体破碎或真实泡沫粒子。',
  },
  {
    id: 'moon', number: '05', name: '深海微光', en: 'BLUE AFTER HOURS',
    poem: '把声音调低，听见蓝色呼吸。', description: '深色冷蓝 · 稀疏微光 · 克制留白',
    colors: ['#071c2d', '#0e3549', '#1d5669', '#709aab', '#c5dce4'],
    deep: '#051522', water: '#123e55', light: '#c2ddeb', foam: 0.0, clarity: 0.06,
    controls: { wave: 38, glint: 31, angle: 110, speed: 17 },
    scene: '蓝调时刻的深色海面，深蓝与灰青色缓慢交融，少量冷白色微光散落在细小波峰上，大部分水面保持低亮度，氛围宁静而有呼吸感',
    photo: ['在蓝调时刻观察海面上的天空反射和远处环境光；此处是低亮度风格整理，不要求一定由月光照亮。', '光线不足时使用稳固支撑，按想保留的波纹形态选择曝光时间，注意长曝光会抹平细碎波纹。', '后期保留暗部之间的层次，只让少量反光突出；冷色可以含灰，不必追求强烈的纯蓝。'],
    technique: '压低水体亮度与环境反射，保留稀疏、低强度的冷色高光，以明暗比例表现安静的深蓝海面。',
  },
];

export const CONTROL_LIMITS = { wave: [0, 100], glint: [0, 100], angle: [0, 360], speed: [0, 100] };

export function cleanControls(value, fallback) {
  return Object.fromEntries(Object.entries(CONTROL_LIMITS).map(([key, [min, max]]) => {
    const number = Number(value?.[key]);
    return [key, Number.isFinite(number) ? Math.round(Math.max(min, Math.min(max, number))) : fallback[key]];
  }));
}

export function makePrompt(study, controls) {
  const wave = controls.wave < 25 ? '水面平缓，波纹浅而舒展' : controls.wave < 60 ? '波纹有细小与中等起伏，疏密和方向自然变化' : '波面起伏明显，较大浪脊中叠加细碎涟漪';
  const glint = controls.glint === 0 ? '将上述场景中的直接镜面闪光完全收弱，仅保留水体明暗和柔和的环境反射' : controls.glint < 30 ? '将上述场景的高光收弱为稀疏微光，暗部占比较大' : controls.glint < 65 ? '反光明暗适中，亮点间留有暗色水面' : '镜面反光明亮而集中，最亮处仍保留水面纹理';
  const side = controls.angle < 90 ? '侧后方' : controls.angle < 180 ? '画面上方偏侧面' : controls.angle < 270 ? '侧前方' : '画面另一侧';
  return `写实海洋摄影，竖幅近景，只取海面局部，让水铺满画面。${study.scene}。${wave}。${glint}。主光来自${side}，高光沿局部波面断续分布，随着波纹方向聚散，不均匀铺满水面。保留水体的深浅层次、自然反射和细腻纹理。画面传达${study.id === 'gold' ? '温暖、缓慢、落日余晖停留的感觉' : study.id === 'foam' ? '清新、有节奏的海浪流动感' : '安静、清透、能感到微风的氛围'}。无文字、无人物、无船只。`;
}
