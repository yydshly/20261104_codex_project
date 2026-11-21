const groups = [
  {
    title: '策划与分镜',
    description: '把创意整理成团队和代理都能照着执行的制作要求。',
    tools: [
      {
        name: 'Claude Skills',
        repo: 'anthropics/skills',
        effect: '把工作指令、示例和辅助脚本打包，供代理在相关任务中加载。',
        value: '把研究、实现和验收写成一套任务规范。两个实验室新增案例时，可以共用来源记录、复现要求和验收清单。',
      },
      {
        name: 'spec-kit',
        repo: 'github/spec-kit',
        effect: '把需求展开成规格、实现计划和任务清单，可借来组织镜头制作。',
        value: '把目标、限制、验收和任务拆开。例如「见全」新增知识库助手案例时，先写清版本切换、证据显示和查不到资料时的预期。',
      },
    ],
  },
  {
    title: '建模与素材',
    description: '把镜头清单需要的角色、道具和贴图做出来。',
    tools: [
      {
        name: 'Blender MCP',
        repo: 'ahujasid/mcp-for-blender',
        effect: '让 AI 读取和修改 Blender 场景，例如改物体、换材质并查看截图。',
        value: '借鉴把查询、修改和预览做成独立操作的方式。要批量调整椅子模型时，可用这类接口执行并检查结果。',
      },
      {
        name: 'Blender',
        repo: 'blender/blender',
        effect: '完成角色和道具的建模、骨骼绑定、灯光和 3D 渲染，也可导出模型。',
        value: '让网页查看器和演示视频共用一份模型。例如扶手椅可导出 GLB 给 360° 查看器，也可用同一模型渲染介绍片。',
      },
      {
        name: 'ComfyUI',
        repo: 'Comfy-Org/ComfyUI',
        effect: '用节点连接模型、图像处理和导出步骤，生成概念图、背景或贴图素材。',
        value: '把输入和处理步骤分开，保存可重复执行的流程。例如实验室要补一组商品图，可以统一尺寸、背景和视角，再逐件换素材。',
      },
    ],
  },
  {
    title: '场景与动效',
    description: '把模型、镜头和文字组织成可以播放或交互的画面。',
    tools: [
      {
        name: 'Three.js',
        repo: 'mrdoob/three.js',
        effect: '在浏览器里绘制 3D 模型、灯光和镜头。本页的楼层、电梯和小人由它绘制。',
        value: '将模型加载、相机控制和部件选中提成共用能力。认知电梯、家具 360° 查看器和空间教学图都可按需采用。',
        used: true,
      },
      {
        name: 'React Three Fiber',
        repo: 'pmndrs/react-three-fiber',
        effect: '用 React 组件组织 Three.js 的物体、灯光和相机。',
        value: 'React 项目可以用同一份选款数据更新模型、规格和说明。例如换扶手椅款式时，让 3D 场景和商品详情一起变。',
      },
      {
        name: 'GSAP',
        repo: 'greensock/GSAP',
        effect: '在一条时间轴上编排门的开合、标题入场和镜头缓动。',
        value: '把滚动、滑块和播放映射到同一个进度。交互效果实验室里的滚动叙事和镜头装配，都可借鉴这套时间轴控制。',
      },
      {
        name: 'ManimGL',
        repo: '3b1b/manim',
        effect: '用代码生成精确的图形、公式和图解动画。这是 3Blue1Brown 的 Manim 仓库。',
        value: '把讲解步骤写成可重画的动画。例如为「见全」做检索排序演示，或为效果研究室做电磁感应的分步图解。',
      },
    ],
  },
  {
    title: '音乐与音效',
    description: '用声音提示到站、开门和镜头变化。',
    tools: [
      {
        name: 'Tone.js',
        repo: 'Tonejs/Tone.js',
        effect: '在浏览器里用代码合成声音，并按节拍或时间安排播放。',
        value: '把音效和可视事件绑在一起。电梯到站、教学实验触发或俳句换段，都可以从现有事件或时间表安排声音。',
      },
    ],
  },
  {
    title: '逐帧与出片',
    description: '让画面和音轨对齐，输出能播放、能分享的视频文件。',
    tools: [
      {
        name: 'Playwright',
        repo: 'microsoft/playwright',
        effect: '脚本控制浏览器跳到指定帧并截图。本项目用它采集导出所需的画面。',
        value: '给网页项目共用一套浏览器验收脚本。打开真实入口、操作控件、检查结果，并为回归对照留下截图。',
        used: true,
      },
      {
        name: 'Remotion',
        repo: 'remotion-dev/remotion',
        effect: '用 React 组件和帧号编排镜头、字幕、素材和音轨，并渲染成视频。',
        value: '把案例的标题、画面、字幕和时长做成可替换数据。效果研究室可用同一模板为多项实验生成短片，换资料后重出。',
      },
      {
        name: 'FFmpeg',
        repo: 'FFmpeg/FFmpeg',
        effect: '把逐帧画面和音轨编码成 MP4，也能转格式和调整分辨率。',
        value: '让需要视频的项目共用一套媒体交付命令，例如编码 MP4、合并声音、抽取封面和检查成片尺寸。',
        used: true,
      },
    ],
  },
];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeToolCard(tool, index) {
  const item = element('li', 'tool-card');
  const header = element('div', 'tool-card-header');
  const name = element('h4');
  const link = element('a', '', tool.name);
  link.href = 'https://github.com/' + tool.repo;
  link.target = '_blank';
  link.rel = 'noopener';
  name.append(link);
  header.append(element('span', 'tool-index', String(index).padStart(2, '0')), name);
  if (tool.used) header.append(element('span', 'tool-used', '本项目使用'));

  const facts = element('dl', 'tool-facts');
  for (const [label, text] of [['能做什么', tool.effect], ['跨项目怎么复用', tool.value]]) {
    const row = element('div');
    row.append(element('dt', '', label), element('dd', '', text));
    facts.append(row);
  }
  item.append(header, facts);
  return item;
}

export function renderToolGuide(container) {
  let index = 0;
  const sections = groups.map(({ title, description, tools }) => {
    const section = element('section', 'tool-group');
    const header = element('header');
    header.append(
      element('span', 'tool-group-count', tools.length + ' 项'),
      element('h3', '', title),
      element('p', '', description),
    );
    const list = element('ul', 'tool-list');
    for (const tool of tools) list.append(makeToolCard(tool, ++index));
    section.append(header, list);
    return section;
  });
  container.replaceChildren(...sections);
}
