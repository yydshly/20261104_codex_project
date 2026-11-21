// Production proposals are separate from verified reference evidence.
window.PRODUCT_STUDY = {
  path: [
    { title: '参考变配方', status: '已有首轮拆解', text: '提取氛围、构图、空间规则与运动目标，写成明确的创作简报。' },
    { title: '配方变关键帧', status: '十二张静态图已生成', text: '四组共十二张候选已分组放入网页；当前继续研究表现能力；等待用户比较并决定保留方向。' },
    { title: '关键帧变短片', status: '待制作', text: '完成连续运动与后期，保留失败版本及修改原因。' },
    { title: '短片变产品', status: '待制作', text: '用进入、播放、重看和切换，把成片组织成可体验网页。' }
  ],
  references: [
    { title: '氛围：世界很大，但主体清楚', source: 'grassland special / 0.10s', image: 'assets/grassland-special/frame-00.10.jpg', alt: '原作海岸开场：巨大环境和很小的骑行者', text: '借鉴明亮奇幻、异常尺度与冷暖分区。转化时先确定情绪、光线方向和色彩主次，具体场景由我们重新创作。', link: '#color' },
    { title: '布局：路线把视线带向远方', source: 'vortex road / 3.00s', image: 'assets/vortex-road/frame-03.00.jpg', alt: '原作漩涡道路：行进路线与天空朝远方聚合', text: '借鉴近景主体、前进路线、视觉终点和近中远层次。换题材时仍保留清楚的观看顺序，而不是堆积奇观元素。', link: '#sources' },
    { title: '运动：从观看变成进入', source: 'grassland special / 6.87s', image: 'assets/grassland-special/frame-06.87.jpg', alt: '原作海岸后段：骑行者背后显露前进小径', text: '借鉴持续前进、跟随主体和逐渐显露空间的节奏。为我们自己的场景写独立运动说明，检验镜头是否增加进入感。', link: '#coast' }
  ],
  capabilities: [
    { tag: 'ART DIRECTION', status: '十二张静态候选已生成', title: '把氛围和构图变成关键帧', goal: '能说清画面为什么吸引人，也能据此制作自己的画面。', work: '拆出情绪、主体比例、空间规则、路线、层次和光色；同一简报制作多个候选，逐项筛选。', output: '视觉配方、原创候选图、选定关键帧与修改记录。', check: '静止时就有尺度与氛围，主体和路线可读，前方留有展开空间。', link: '#keyframes', linkLabel: '对比原创关键帧' },
    { tag: 'MOTION DIRECTION', status: '参考已拆解 · 待样片验证', title: '让画面在时间里成立', goal: '让前进、跟随与空间展开形成一段完整体验。', work: '围绕关键帧写主体动作、相对观看方向和时序变化；生成候选短片，检查形态与路径连续性。', output: '运动简报、候选片段、失败原因、选定约 7 秒样片。', check: '主体不突变，路线不中断，主要空间关系可辨，运动能带来新的信息。', link: '#coast', linkLabel: '回看时间展开' },
    { tag: 'LOOK DEVELOPMENT', status: '已有教学对照 · 待原创后期', title: '统一光色、节奏和交付', goal: '把生成结果整理成稳定、完整且适合展示的成片。', work: '先平衡亮暗与偏色，再组织冷暖、饱和度与局部注意力；检查剪辑长度、输出和接缝。', output: '后期前后对照、处理记录、SDR 展示版；按需要另做 HDR 版本。', check: '亮部和主体可读，色彩有主次，设备上播放稳定；循环版还需单独通过首尾接缝检查。', link: '#color', linkLabel: '回看曝光、饱和度与 HDR' },
    { tag: 'PRODUCT EXPERIENCE', status: '已有研究网页 · 产品待制作', title: '把成片组织成可体验产品', goal: '让用户可以进入、观看、重看，并理解不同作品的选择。', work: '以画面为主角安排标题与操作位置；在桌面和手机上检查裁切、加载、播放和交互节奏。', output: '体验网页、封面、短片版本、必要交互和完整制作配方。', check: '打开能理解如何体验；主要主体不被文字遮挡；操作与播放可靠。', link: '#sources', linkLabel: '回查原片与作者流程' }
  ],
  directions: [
    { status: '首轮推荐 · 提案', title: '短片驱动的氛围体验网页', experience: '进入原创世界 → 播放约 7 秒 → 重看；后续可切换已完成的场景或氛围。', requirement: '先验证关键帧、运动、调色和网页的完整链路。镜头预先制作，体验边界清楚。' },
    { status: '需要实时探索时考虑', title: '可自由探索的实时 3D 世界', experience: '用户控制视角、路线与速度，空间实时响应。', requirement: '需要几何、材质、灯光、相机和性能体系。应按玩法重新设计制作路线。' },
    { status: '生产方法稳定后考虑', title: '自动生成奇幻片段的平台', experience: '用户选择氛围、空间和运动，由系统产出新的片段。', requirement: '需要验证稳定生成能力，并处理任务状态、成本、重试与质量筛选。' }
  ]
};
