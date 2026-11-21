window.atlasEntries.push(
  {
    id: 1,
    category: 'visual',
    title: '用 Image 2.6 做口播拼贴 B-roll',
    author: '狗哥笔记',
    kind: '样片与旧工作流',
    summary: '作者用 Codex 调用 Image 2.6 做了四条拼贴动图，为口播中的单句提供辅助画面。',
    capability: 'B-roll 是口播继续时插入的辅助画面。作者称这次四条样片没有再跑视频模型。被引的旧 Skill 则会先确认视觉隐喻和拼贴静帧，再用视频模型做动作。',
    steps: ['提取口播含义', '构思拼贴隐喻', '生成短动图'],
    relevance: '给抽象观点配一个两三秒就能读懂的插画动作，也可以复用已有的旧照片和插图素材。',
    exercise: '同一句「把复杂问题拆成三步」，在本地实验对比「依次落位」和「同时入场」。把时间轴都停在 1.5 秒，检查哪一版更容易分辨先后。',
    boundary: 'OpenAI 官方确认 2.6 支持生成 GIF。帖中节省成本是作者体感，具体新版 Skill 的实现和成本未给出。',
    links: [
      { label: '原帖', url: 'https://x.com/gbroai/status/2118360718554894395' },
      { label: '被引的旧 Skill', url: 'https://x.com/gbroai/status/2077377043705332172' },
      { label: 'Images 2.6 官方说明', url: 'https://openai.com/index/introducing-images-2-6/' }
    ]
  },
  {
    id: 2,
    category: 'visual',
    title: '用参考照生成风格化头像',
    author: 'Oogie',
    kind: '提示词与样片',
    summary: '作者分享了一套用 GPT Image 2.5 把参考照变成 3D 卡通风头像的提示词。',
    capability: '参考照承载身份，提示词约束头肩范围、主体居中、白底留白、柔光和 1:1 画幅。帖中的配方适合用来理解哪些身份特征应保持，哪些画面属性可以统一。',
    steps: ['给出参考照片', '锁定身份特征', '统一头像规格'],
    relevance: '先把它当作数字人的静态角色基准。保留原肤色、脸型、发型和眼镜等识别特征，再尝试表情与光线的变化。',
    exercise: '固定同一张参考照和一套构图，试做三种表情。把结果缩到聊天头像大小，比较在小尺寸下是否仍能认出同一角色。',
    boundary: '成品是带 3D 观感的图片。后续要驱动角色转头、说话和做表情，还需要可操控的模型与动画。',
    links: [
      { label: '原帖', url: 'https://x.com/oggii_0/status/2118216706459914578' },
      { label: 'Images 2.5 官方说明', url: 'https://openai.com/index/introducing-chatgpt-images-2-5/' }
    ]
  },
  {
    id: 3,
    category: 'visual',
    title: '探索 Image 2.6 的短动作',
    author: '松果先森',
    kind: '效果演示',
    summary: '作者用样片展示了 Image 2.6 生成的动作效果，并在被引帖中提到可以控制时长。',
    capability: '这条提供的是动画效果示例，展示了一段短动作可以具备接近视频的表现力。官方 API 文档也给出了 GIF 帧数与帧时长的控制项。',
    steps: ['选一个短动作', '限定动作时长', '检查循环接缝'],
    relevance: '把它用在数字伴偶的眨眼、点头或短暂反应，先验证一个动作是否能传出明确情绪。',
    exercise: '固定同一头像与机位，做一次轻微点头并回到初始姿势。连续播放三遍，检查动作是否一眼可读、首尾衔接是否明显、脸是否漂移。',
    boundary: '原帖没有公开完整提示词、实现过程或多次生成的成功率。',
    links: [
      { label: '原帖', url: 'https://x.com/songguoxiansen/status/2118177108573016517' },
      { label: '被引演示', url: 'https://x.com/songguoxiansen/status/2118172656197591236' },
      { label: 'GIF 生成文档', url: 'https://developers.openai.com/api/docs/guides/image-generation#generate-animated-gif-output' }
    ]
  },
  {
    id: 4,
    category: 'visual',
    title: '用五种镜头表达不同叙事意图',
    author: 'Google Flow',
    kind: '官方镜头指南',
    summary: 'Google Flow 把五种镜头描述与强调、时间变化、关键动作、空间揭示和主体移动一一对应。',
    capability: 'Crash zoom 快速拉近，突出笑点或重点；hyperlapse 在移动中压缩时间；bullet time 让动作近乎停住并改变观看角度；fly over 从上方掠过以揭开环境；tracking 跟住移动主体。',
    steps: ['明确叙事目的', '指定镜头起止', '描述主体运动'],
    relevance: '做口播时先决定观众该发现什么。讲叶片气孔，快速拉近能指出看哪里，飞越能交代它在叶片上的位置。',
    exercise: '固定一张叶片参考图，分别写「从叶面拉近气孔」和「飞越叶缘揭开整片叶面」两个镜头。同一讲解句下，比较观众是否能分辨重点与位置。',
    boundary: '帖子分享的是可写入提示词的镜头表达。实际运镜的精度与复现性需要用样片验证。',
    links: [
      { label: '原帖', url: 'https://x.com/FlowbyGoogle/status/2118082696119541769' },
      { label: 'Google Flow 提示词指南', url: 'https://blog.google/innovation-and-ai/products/flow-video-tips/' }
    ]
  },
  {
    id: 5,
    category: 'visual',
    title: '把设计仓库按制作环节拆开',
    author: 'kiosa',
    kind: '仓库清单与样片',
    summary: '帖子以气孔演示串起七个仓库，从界面设计到网页动效、交互 3D 和视频渲染。',
    capability: 'UI UX Pro Max、Impeccable、Anthropic Frontend Design 辅助设计与打磨，Motion 处理界面动效。R3F 承载浏览器交互 3D，Remotion 把 React 场景渲染成视频，Blender MCP 把 Agent 接到 Blender 的制作环节。',
    steps: ['搭建三维场景', '加入状态交互', '渲染同场景视频'],
    relevance: '你的教育 3D 可以从一个共享场景派生两种作品。学生在网页切换气孔开合，讲解短片则沿预设镜头播放同一套状态。',
    exercise: '给气孔场景只做一个开合参数，再让网页按钮和视频时间轴共用它。修改一次开合幅度，检查两个出口能否一起更新。',
    boundary: '原帖提供仓库清单和气孔样片，未逐项说明七个工具在样片中的实际用法。',
    links: [
      { label: '原帖', url: 'https://x.com/thegreatest_sv/status/2118374136799985771' },
      { label: 'React Three Fiber', url: 'https://github.com/pmndrs/react-three-fiber' },
      { label: 'Remotion 与 R3F 集成', url: 'https://www.remotion.dev/docs/three' },
      { label: 'Blender MCP', url: 'https://github.com/ahujasid/blender-mcp' }
    ]
  }
);
