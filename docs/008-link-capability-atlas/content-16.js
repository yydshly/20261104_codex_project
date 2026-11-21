window.atlasEntries.push({
  id: 16,
  category: 'workflow',
  title: 'Gitruck：把口播整理成可继续精修的视频',
  author: 'Gitruck',
  kind: '有声剪辑补充案例',
  summary: '补充第 01 条的有声剪辑参照，比较原始口播与加入图解、特写后的成片。',
  capability: 'Gitruck 提供面向 Agent 的视频创作 CLI，将粗剪、配画、字幕与音轨组织成可以继续编辑的工程。配套 Skills 描述工作流程，客户端负责预览与精修，部分处理依赖云端接口。',
  steps: ['读懂口播与素材', '按语义安排镜头和配画', '保留可继续修改的工程'],
  relevance: '帮助判断 B-roll 应在什么时候接过画面，以及人声、图解和器材特写怎样共同解释一句话。可把同一段口播的主画面版与配画版放在同一时间点比较。',
  exercise: '先在原作展台比较钓鱼器材口播的前后两版，再看本站巡检口播的同屏对照，观察第 3–8 秒的配画如何承接同一条旁白。',
  boundary: '本站保存原作视频用于效果对照，并制作了独立的本地剪辑样本。Gitruck CLI、客户端与云端服务未在本站执行。原版功能、安装要求和费用以维护方说明为准。',
  links: [
    { label: 'Gitruck 官方仓库与案例', url: 'https://github.com/Gitruck/cli#demo' },
    { label: '官方工作流说明', url: 'https://github.com/Gitruck/cli/blob/main/docs/workflow.md' }
  ]
});
window.atlasShowcases['16'] = {
  ...window.atlasShowcases['1'].comparison,
  action: 'Gitruck 官方案例'
};
