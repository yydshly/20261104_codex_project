// Finished-character comparisons. None is approved as the user's final likeness.
export const HERO_CANDIDATES = [
  {id:'personal0597',label:'选用人物 · 单人绑定版',shortLabel:'你的0597人物 · 单人版',file:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/personal-guide/personal-guide.glb',
   status:'已整理为一名独立人物 · 基础绑定与5段动作 · 此入口为静态形体检查',
   source:'你的模型 · 单人整理与动作制作记录',sourceUrl:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/personal-guide/README.md',
   detail:'从0597原文件选出正面人物，保留西装、脸和贴图；整理网格、绑定骨骼并适配基础动作。可在主场景中操控，继续检查关节和台阶效果。',preview:null,facing:0},
  {id:'generated0597',label:'你提供的 GLB · 静态检查',shortLabel:'你提供的 0597 模型',file:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/user-model-0597/0597b54ff20068bcd556b1e005aed56d.glb',
   status:'原文件含并排四个人物 · 约150万三角面 · 无骨骼、蒙皮和动作',
   source:'用户提供的 0597…d56d.glb · 结构记录',sourceUrl:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/user-model-0597/manifest.json',
   detail:'保留原始模型与贴图，放入同一露台/中性光检查。先整理为一名单独、完整的人物，再制作可变形网格、减面、绑定及动作适配；当前可动向导仍保留。',preview:null,facing:0},
  {id:'current',label:'现有稿 · 未通过',shortLabel:'现有深蓝卫衣稿',file:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/hero/hero-static.glb',
   status:'当前人物形象未通过，保留作差距对照。',
   source:'MakeHuman / MPFB 人体与本项目服装制作',sourceUrl:'./character/hero-source/SOURCES.json',
   detail:'脸部、肩颈和卫衣结构与原型仍有明显差距。',preview:'../screenshots/hero-2.5-current-neutral.png',facing:0},
  {id:'rocket10',label:'成品 A · 面部与比例',shortLabel:'成品 A · 夹克角色',file:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/hero-candidates/male_adult_10.glb',
   status:'成品候选对照 · 尚未适配原型',
   source:'Microsoft / Rocketbox · Male Adult 10 · MIT',
   sourceUrl:'https://github.com/microsoft/Microsoft-Rocketbox/tree/master/Assets/Avatars/Adults/Male_Adult_10',
   detail:'比较成品脸部、头发和成人比例；原始夹克、脸部和发型均非原型还原。',preview:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/hero-candidates/rocketbox/Male_Adult_10.png',facing:0},
  {id:'rocket17',label:'成品 B · 上衣结构',shortLabel:'成品 B · 连帽上衣',file:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/hero-candidates/male_adult_17.glb',
   status:'成品候选对照 · 尚未适配原型',
   source:'Microsoft / Rocketbox · Male Adult 17 · MIT',
   sourceUrl:'https://github.com/microsoft/Microsoft-Rocketbox/tree/master/Assets/Avatars/Adults/Male_Adult_17',
   detail:'比较帽子、肩袖、褶皱和衣身厚度；脸部、拉链与蓝白配色都需要重新适配。',preview:'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/031-ocean-light-atlas/runtime/glasshouse/assets/hero-candidates/rocketbox/Male_Adult_17.png',facing:0},
];

export const HERO_REVIEW = {
  status:'当前先用成品角色完成动作与导览；原型面貌、发型和服装按后续需要扩展。',
  priorities:[
    '使用有完整服装、材质和骨架的成品角色，先完成一版可走动、可带路的演示。',
    '在实际玻璃屋里检查步态、脚部接触、转向、动作过渡和相机跟随。',
    '面貌、发型、眼镜、服装和换装按后续需要扩展；原型保留为早期造型参考。',
  ],
  boundary:'成品A已作为第一版可动人物的基础。原型适配和换装可后续扩展，旧静态稿保留为历史对照。',
};
