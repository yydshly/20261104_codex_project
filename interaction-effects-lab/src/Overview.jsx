import { sourceLibraries } from './Sources.jsx';
import './Overview.css';

const assets = `${import.meta.env.BASE_URL}demo-assets/overview`;

const groups = [
  { title: '内容浏览与叙事', cases: [
    ['shelf', '翻阅时把当前条目推到眼前'],
    ['drift', '滚动进度推进场景与章节'],
    ['sphere', '球面与网格浏览共用一份档案'],
    ['scrub', '滚动与进度条同步控制画面'],
  ] },
  { title: '商品展示与对比', cases: [
    ['runway', '用同一个位置驱动画面与商品栏'],
    ['virtualfit', '选款后同步人物预览和规格'],
    ['pink', '指针经过的位置短暂揭示第二层'],
    ['orbit', '旋转、缩放与部位热点结合'],
  ] },
  { title: '材质、场景与反馈', cases: [
    ['cloth', '拖动布面，观察下垂和回摆'],
    ['spider', '局部受力后，位移沿线传播'],
    ['lighting', '在遮挡中换景，光线同步过渡'],
    ['faq', '展开一条答案，点阵随指针变化'],
  ] },
  { title: '配置、查询与编辑', cases: [
    ['quote', '配置改变时重算价格和明细'],
    ['map', '聚合点放大后，点选联动详情'],
    ['charts', '框选散点后同步统计和明细'],
    ['flow', '编辑节点与连线，保存后可恢复'],
  ] },
];

const journey = [
  { id: 'runway', label: '选椅子', cue: '选定款式与面料' },
  { id: 'orbit', label: '看 360°', cue: '带入同款模型与配色' },
  { id: 'lighting', label: '切换灯光', cue: '阅读灯下看同一套搭配' },
  { id: 'quote', label: '配置报价', cue: '两把示例价 ¥5,680' },
  { id: 'map', label: '查找展厅', cue: '同款同面料匹配 Uptown' },
];

const extensions = [
  { id: 'cloth', label: '选材时比较面料', description: '体验拖拽、下垂和回摆，理解材质反馈。' },
  { id: 'faq', label: '购买前查规格与保养', description: '按需展开 Siena 的尺寸、配送与清洁说明。' },
  { id: 'charts', label: '运营时分析报价', description: '框选一批示例报价，联动分布、总额和明细。' },
  { id: 'flow', label: '业务中配置样品审批', description: '编辑步骤、连线与草稿，保存后可恢复。' },
];

function DemoStill({ id, mode = 'original' }) {
  return <img className="overview-still" src={`${assets}/${id}-${mode}.jpg`} alt="" decoding="async" />;
}

function CaseModule({ example, principle }) {
  return (
    <article className="overview-module">
      <header className="overview-module-meta">
        <span className="overview-index">{example.number}</span>
        <a href={example.source} target="_blank" rel="noreferrer" aria-label={example.sourceLabel}>{example.reference} ↗</a>
      </header>
      <a href={`#${example.id}/original`} className="overview-module-effect">
        <DemoStill id={example.id} />
        <h4>{example.name}</h4>
      </a>
      <p>{principle}</p>
      <a className="overview-module-product" href={`#${example.id}/product`}>
        <span>产品应用</span><strong>{example.product}</strong><span aria-hidden="true">→</span>
      </a>
    </article>
  );
}

export default function Overview({ cases, originalPost }) {
  const byId = Object.fromEntries(cases.map((example) => [example.id, example]));

  return (
    <article className="overview" aria-labelledby="overview-title">
      <div className="overview-toolbar">
        <span>原理总览</span>
        <div>
          <a href="#sources">来源目录</a>
          <a href={`${assets}/principles-poster.jpg`} target="_blank" rel="noreferrer">打开整张图 ↗</a>
        </div>
      </div>
      <div className="overview-poster">
        <header className="overview-hero">
          <div className="overview-hero-copy">
            <div className="overview-kicker"><span>交互效果实验室</span><span>PRINCIPLE ATLAS</span></div>
            <h1 id="overview-title">从一个效果，<br />走到一条产品链路</h1>
            <p>把源库中的场景效果，沉淀成可体验、可解释、可迁移的交互能力。既能单独取用，也能围绕同一份产品选择组合成流程。</p>
            <div className="overview-counts"><span><strong>{cases.length}</strong> 个交互案例</span><span><strong>{journey.length}</strong> 步家具体验</span></div>
          </div>
          <div className="overview-comparison" aria-label="360° 查看器的两种应用">
            <figure>
              <a href="#orbit/original" aria-label="体验 Myth Atlas 原效果"><DemoStill id="orbit" /></a>
              <figcaption><span>06 / 本地原效果</span><strong>Myth Atlas · 旋转查看</strong></figcaption>
            </figure>
            <figure>
              <a href="#orbit/product" aria-label="体验座椅 360° 产品应用"><DemoStill id="orbit" mode="product" /></a>
              <figcaption><span>06 / 产品应用</span><strong>Forma Living · 座椅查看</strong></figcaption>
            </figure>
          </div>
        </header>

        <section className="overview-method" aria-label="从参考到产品的方法">
          <ol>
            <li><span>01 / 找到参考</span><strong>源库提供样例</strong><p>从模板、公开演示和官方示例中，观察不同场景怎样响应用户操作。</p></li>
            <li><span>02 / 理解机制</span><strong>我们复现交互</strong><p>把主要规则做成本地演示，记录用户输入、页面状态与同步反馈。</p></li>
            <li><span>03 / 迁移用途</span><strong>我们扩展应用</strong><p>用自定义素材和示例数据，把同一种交互用于选款、估价、查询等任务。</p></li>
            <li><span>04 / 组合体验</span><strong>我们串联流程</strong><p>让款式和面料跨页面传递，验证多种交互如何一起完成一次产品体验。</p></li>
          </ol>
          <div className="overview-source-rail">
            <span>源库入口</span>
            <div>
              {sourceLibraries(originalPost).map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" title={source.description}>{source.name} ↗</a>
              ))}
            </div>
          </div>
          <div className="overview-provenance">
            <p><strong>参考从哪里来</strong>MotionSites 与原视频提供视觉、场景和制作参考。地图、图表与流程案例分别采用 MapLibre、ECharts 和 React Flow。</p>
            <p><strong>我们保留了什么</strong>每个案例都能回到来源、操作两种演示，并查看交互规则和按演示整理的实现提示词。</p>
          </div>
        </section>

        <section className="overview-section" aria-labelledby="overview-journey">
          <div className="overview-section-heading">
            <div><span className="overview-kicker">01 / PRODUCT JOURNEY</span><h2 id="overview-journey">从选椅子到找展厅</h2></div>
            <a href="#runway/product">体验完整流程 →</a>
          </div>
          <div className="overview-shared">
            <span>五步共用当前搭配</span><i aria-hidden="true" /><strong>Nola · 板岩蓝织物</strong><span>换面料后，后续步骤接着用新选择</span>
          </div>
          <ol className="overview-journey">
            {journey.map(({ id, label, cue }, index) => (
              <li key={id}>
                <a href={`#${id}/product`}>
                  <DemoStill id={id} mode="product" />
                  <span className="overview-step-index">STEP 0{index + 1} / 案例 {byId[id].number}</span>
                  <strong>{label}</strong><span>{cue}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className="overview-footnote">画面采自本地演示。座椅为 3D 示意模型，报价与展厅库存为示例数据。</p>
          <div className="overview-state-example">
            <div><span className="overview-kicker">为什么能连成一条流程</span><h3>每一步，都接着处理同一套搭配</h3></div>
            <p>选款确定款式与面料，360° 和灯光展示它，报价按它计算，展厅按它筛选。在报价中换面料，下一步查找展厅就沿用新面料；返回选款或刷新页面，也能继续当前搭配。</p>
          </div>
          <div className="overview-extensions">
            <div className="overview-extension-heading"><h3>可按需求继续组合的模块</h3><span>以下为独立演示，供后续产品选择接入</span></div>
            <div className="overview-extension-grid">
              {extensions.map(({ id, label, description }) => (
                <a href={`#${id}/product`} key={id}><span>案例 {byId[id].number}</span><strong>{label} →</strong><p>{description}</p></a>
              ))}
            </div>
          </div>
        </section>

        <section className="overview-section" aria-labelledby="overview-cases">
          <div className="overview-section-heading">
            <div><span className="overview-kicker">02 / EFFECT LIBRARY</span><h2 id="overview-cases">{cases.length} 个交互能力</h2></div>
            <span className="overview-reading-key">源参考 ↗　/　画面进入原效果　/　产品应用 →</span>
          </div>
          {groups.map((group, index) => (
            <section className="overview-group" key={group.title}>
              <h3><span>0{index + 1}</span>{group.title}</h3>
              <div className="overview-module-grid">
                {group.cases.map(([id, principle]) => <CaseModule key={id} example={byId[id]} principle={principle} />)}
              </div>
            </section>
          ))}
        </section>

        <section className="overview-section overview-reuse" aria-labelledby="overview-reuse">
          <div className="overview-section-heading">
            <div><span className="overview-kicker">03 / REUSE WHEN NEEDED</span><h2 id="overview-reuse">有具体需求时，从这里重新使用</h2></div>
            <a href="#sources">回到来源目录 →</a>
          </div>
          <ol className="overview-reuse-steps">
            <li><span>01</span><div><strong>先确定用户任务</strong><p>要选商品、看细节、比较方案，还是查找地点？按任务找到相近案例。</p></div></li>
            <li><span>02</span><div><strong>对照两种演示</strong><p>看源参考，操作「原效果」与「产品应用」，确认哪些规则适合自己的场景。</p></div></li>
            <li><span>03</span><div><strong>带走规则与提示词</strong><p>从案例页复制实现提示词，替换为自己的素材、字段与数据，再验证交互反馈。</p></div></li>
            <li><span>04</span><div><strong>按产品需要组合</strong><p>单独用一个模块，或参考家具体验，让多个步骤围绕同一份选择协作。</p></div></li>
          </ol>
          <div className="overview-scope">
            <div><strong>当前可直接参考</strong><p>{cases.length} 个交互对照、来源与实现提示词，以及共享款式和面料的五步家具体验。现有覆盖已可供按需复用。</p></div>
            <div><strong>落地到真实业务时补齐</strong><p>使用真实商品素材、价格和门店库存，并接入所需的业务接口。样品审批目前保存可编辑草稿，报价分析使用独立示例数据。</p></div>
          </div>
        </section>

        <footer className="overview-footer"><span>交互效果实验室 · 原理总览</span><span>源案例 → 交互规则 → 产品应用</span></footer>
      </div>
    </article>
  );
}
