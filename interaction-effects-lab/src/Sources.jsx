import './Sources.css';

const library = [
  { name: 'MotionSites 主库', description: '浏览网站和交互模板，按热门或最新案例探索。', url: 'https://motionsites.ai/' },
  { name: '3D 专区', description: '找实时模型、空间浏览和 3D 场景。', url: 'https://motionsites.ai/3d-websites' },
  { name: '区块库', description: '找报价、内容展示和其他可以单独接入页面的区块。', url: 'https://motionsites.ai/sections' },
  { name: 'Academy 教程', description: '看动效、视频控帧和 3D 网页的制作过程。', url: 'https://motionsites.ai/academy' },
  { name: '动态背景库', description: '浏览可用作网页背景的动态素材。', url: 'https://motionsites.ai/backgrounds' },
];

const interactionLibraries = [
  { name: 'MapLibre GL JS 示例库', description: '查看地图图层、点位聚合、筛选和地图交互。', url: 'https://maplibre.org/maplibre-gl-js/docs/examples/' },
  { name: 'Apache ECharts 示例库', description: '查看图表类型、框选、数据缩放和视图联动。', url: 'https://echarts.apache.org/examples/en/index.html' },
  { name: 'React Flow 示例库', description: '查看流程画布、节点编辑、连线和状态恢复。', url: 'https://reactflow.dev/examples' },
];

export function sourceLibraries(originalPost) {
  return [...library, {
    name: 'Viktor Oddy 的演示视频', description: '实验室第一批案例的起点，包含改模板和做原型的过程。', url: originalPost,
  }, ...interactionLibraries];
}

export default function Sources({ cases, originalPost, returnTo }) {
  return (
    <div className="source-directory">
      <div className="case-intro">
        <div className="case-kicker"><span>参考目录</span><span>原始案例与制作资料</span></div>
        <h1>来源参考</h1>
        <p>从下面的入口对照源案例和实验室复现，也可以回源库找下一批交互。</p>
      </div>
      <div className="source-return"><a href={returnTo}>{returnTo === '#overview' ? '返回原理总览' : '返回演示'}</a></div>

      <section aria-labelledby="source-library-heading">
        <h2 id="source-library-heading">浏览源库</h2>
        <ul className="source-library">
          {sourceLibraries(originalPost).map((item) => (
            <li key={item.url}>
              <a href={item.url} target="_blank" rel="noreferrer"><strong>{item.name}</strong><span>{item.description}</span></a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="source-cases-heading">
        <h2 id="source-cases-heading">各案例的来源</h2>
        <ul className="source-list">
          {cases.map((item) => (
            <li key={item.id}>
              <span className="case-number">{item.number}</span>
              <div className="source-case-name"><strong>{item.name}</strong><span>{item.reference}</span></div>
              <div className="source-case-links">
                <a href={item.source} target="_blank" rel="noreferrer">{item.sourceLabel}</a>
                <a href={`#${item.id}/original`} aria-label={`体验${item.name}`}>本地演示</a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
