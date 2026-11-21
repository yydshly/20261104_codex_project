import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { cases } from './cases.js';
import { furnitureChairs, furnitureFinishes, readFurnitureSelection, rememberFurnitureSelection } from './furniture.js';
import Overview from './Overview.jsx';
import Sources from './Sources.jsx';

const demos = {
  shelf: lazy(() => import('./demos/Shelf.jsx')),
  runway: lazy(() => import('./demos/Runway.jsx')),
  drift: lazy(() => import('./demos/Drift.jsx')),
  virtualfit: lazy(() => import('./demos/VirtualFit.jsx')),
  pink: lazy(() => import('./demos/Pink.jsx')),
  orbit: lazy(() => import('./demos/Orbit.jsx')),
  cloth: lazy(() => import('./demos/Cloth.jsx')),
  sphere: lazy(() => import('./demos/Sphere.jsx')),
  scrub: lazy(() => import('./demos/Scrub.jsx')),
  quote: lazy(() => import('./demos/Quote.jsx')),
  spider: lazy(() => import('./demos/Spider.jsx')),
  lighting: lazy(() => import('./demos/Lighting.jsx')),
  faq: lazy(() => import('./demos/Faq.jsx')),
  map: lazy(() => import('./demos/MapSelection.jsx')),
  charts: lazy(() => import('./demos/ChartLink.jsx')),
  flow: lazy(() => import('./demos/FlowEditor.jsx')),
};

const post = 'https://x.com/viktoroddy/status/2117959947204092218';
const caseCount = String(cases.length).padStart(2, '0');
const furnitureSteps = [
  { id: 'runway', label: '选椅子', title: '选一把椅子，搭一块面料', next: '看 360°' },
  { id: 'orbit', label: '360° 看椅子', title: '转一圈，看清座椅细节', next: '切换灯光' },
  { id: 'lighting', label: '切换灯光', title: '在三种光线下看同一套搭配', next: '配置报价' },
  { id: 'quote', label: '配置报价', title: '按选好的款式与面料估价', next: '查找展厅' },
  { id: 'map', label: '查找展厅', title: '找一家能试坐当前款的展厅' },
];

function readLocation() {
  const [id, mode] = window.location.hash.slice(1).split('/');
  if (id === 'sources') return { id, returnTo: '#shelf/original' };
  if (!id || id === 'overview') return { id: 'overview' };
  return { id: Object.hasOwn(demos, id) ? id : 'shelf', mode: mode === 'product' ? 'product' : 'original' };
}

function FurnitureJourney({ step, furniture }) {
  const { chair, finish, selectFinish } = furniture;
  return (
    <div className="furniture-journey">
      <nav aria-label="家具体验步骤">
        <ol>
          {furnitureSteps.map(({ id, label }, index) => (
            <li key={id}><a href={`#${id}/product`} aria-current={index === step ? 'step' : undefined}>
              <span>{String(index + 1).padStart(2, '0')}</span>{label}
            </a></li>
          ))}
        </ol>
      </nav>
      <div className="furniture-current">
        <span className="furniture-current-label">当前搭配</span>
        <strong>{chair.name}</strong>
        <span className="furniture-current-swatch" style={{ background: finish.color }} aria-hidden="true" />
        {step === 0 ? (
          <select aria-label="选款面料" value={finish.id} onChange={(event) => selectFinish(event.target.value)}>
            {furnitureFinishes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        ) : <span>{finish.name}</span>}
      </div>
    </div>
  );
}

function FurnitureNavigation({ step, chair }) {
  const previous = furnitureSteps[step - 1];
  const next = furnitureSteps[step + 1];
  return (
    <div className="furniture-navigation">
      {step === 3 && chair.id === 'siena' && <a href="#faq/product">尺寸与保养</a>}
      {previous && <a href={`#${previous.id}/product`} aria-label={`上一步，${previous.label}`}>← {previous.label}</a>}
      {next ? (
        <a className="furniture-next" href={`#${next.id}/product`}>下一步 · {furnitureSteps[step].next} →</a>
      ) : <a className="furniture-next" href="#runway/product">返回选椅子 ↺</a>}
    </div>
  );
}

function Prompt({ example, mode }) {
  const [message, setMessage] = useState('');
  const promptRef = useRef(null);
  const prompt = mode === 'product' ? `${example.rule}\n\n${example.adaptation}` : example.rule;

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setMessage('已复制');
    } catch {
      promptRef.current.focus();
      promptRef.current.select();
      setMessage('已选中，请使用 Ctrl+C 或 ⌘C');
    }
  }

  return (
    <details className="prompt">
      <summary>查看可复用的实现提示词</summary>
      <div className="prompt-content">
        <p>根据演示交互整理，供新项目使用。</p>
        <textarea aria-label="实现提示词" ref={promptRef} readOnly value={prompt} rows={mode === 'product' ? 6 : 4} />
        <div className="prompt-actions">
          <button className="minor-button" type="button" onClick={copyPrompt}>复制提示词</button>
          <span role="status">{message}</span>
        </div>
      </div>
    </details>
  );
}

export function App() {
  const [{ id, mode, returnTo }, setLocation] = useState(readLocation);
  const [revision, setRevision] = useState(0);
  const [selection, setSelection] = useState(readFurnitureSelection);
  const catalog = useRef(null);
  const example = cases.find((item) => item.id === id);
  const Demo = demos[id];
  const isProduct = mode === 'product';
  const isSources = id === 'sources';
  const isOverview = id === 'overview';
  const furnitureStep = isProduct ? furnitureSteps.findIndex((step) => step.id === id) : -1;
  const chair = furnitureChairs.find((item) => item.id === selection.chairId);
  const finish = furnitureFinishes.find((item) => item.id === selection.finishId);

  const selectChair = useCallback((chairId) => {
    const selected = furnitureChairs.find((item) => item.id === chairId);
    if (!selected) return;
    setSelection((current) => current.chairId === chairId ? current : { chairId, finishId: selected.defaultFinish });
  }, []);

  const selectFinish = useCallback((finishId) => {
    if (!furnitureFinishes.some((item) => item.id === finishId)) return;
    setSelection((current) => current.finishId === finishId ? current : { ...current, finishId });
  }, []);

  const furniture = furnitureStep >= 0 ? { chair, finish, selectChair, selectFinish } : undefined;

  useEffect(() => rememberFurnitureSelection(selection), [selection]);

  useEffect(() => {
    const onHashChange = () => {
      const next = readLocation();
      setLocation((current) => next.id === 'sources' ? {
        ...next,
        returnTo: current.id === 'sources' ? current.returnTo : current.id === 'overview' ? '#overview' : `#${current.id}/${current.mode}`,
      } : next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const nav = catalog.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const selected = nav.querySelector('[aria-current="page"]');
    if (!selected) return;
    const selectedBox = selected.getBoundingClientRect();
    const navBox = nav.getBoundingClientRect();
    if (selectedBox.left < navBox.left || selectedBox.right > navBox.right) {
      nav.scrollLeft += selectedBox.left - navBox.left - 14;
    }
  }, [id, mode]);

  return (
    <div className="lab-shell">
      <a className="skip-link" href="#lab-main" onClick={(event) => {
        event.preventDefault();
        document.querySelector('#lab-main').focus();
      }}>跳到案例演示</a>
      <header className="masthead">
        <div className="masthead-inner">
          <div className="lab-brand">
            <span className="brand-index" aria-hidden="true">IE</span>
            <span className="brand-name">交互效果实验室</span>
          </div>
          <div className="masthead-meta">
            <span className="local-label">本地原型</span>
            <a className="source-nav" href="#overview" aria-current={isOverview ? 'page' : undefined}>原理总览</a>
            <a className="source-nav furniture-entry" href="#runway/product" aria-current={furnitureStep === 0 ? 'page' : undefined}>家具体验</a>
            <a className="source-nav" href="#sources" aria-current={isSources ? 'page' : undefined}>来源参考</a>
            <a className="post-nav" href={post} target="_blank" rel="noreferrer">查看原视频</a>
          </div>
        </div>
      </header>

      <div className={isOverview ? 'lab-layout lab-layout-overview' : 'lab-layout'}>
        {!isOverview && <aside className="case-sidebar" aria-label="案例目录">
          <div className="catalog-caption"><span>案例目录</span><span>{caseCount}</span></div>
          <nav className="case-nav" aria-label="选择案例" ref={catalog}>
            {cases.map((item) => (
              <div key={item.id} className="case-nav-entry">
                {item.id === 'orbit' && <span className="case-group-label">模型与流程</span>}
                {item.id === 'spider' && <span className="case-group-label">场景与反馈</span>}
                {item.id === 'map' && <span className="case-group-label">地图、数据与流程</span>}
                <a href={`#${item.id}/original`} aria-current={id === item.id ? 'page' : undefined}>
                  <span className="case-number">{item.number}</span>
                  <span className="case-nav-text"><strong>{item.name}</strong><small>{item.reference}</small></span>
                </a>
              </div>
            ))}
          </nav>
          <p className="sidebar-note">先体验原效果，再切换到产品应用，对照哪些交互规则可以沿用。</p>
        </aside>}

        <main className="lab-main" id="lab-main" tabIndex={-1}>
          {isOverview ? <Overview cases={cases} originalPost={post} /> : isSources ? <Sources cases={cases} originalPost={post} returnTo={returnTo} /> : <>
          <div className="case-intro">
            <div className="case-kicker"><span>案例 {example.number} / {caseCount}</span><span>{example.reference}</span></div>
            <h1>{furnitureSteps[furnitureStep]?.title ?? example.title}</h1>
            <p>{furniture ? example.productSummary : example.summary}</p>
          </div>

          <section className="preview-card" aria-label={`${example.name}可操作演示`}>
            <div className="preview-toolbar">
              <div className="preview-modes" role="group" aria-label="演示版本">
                <a className={!isProduct ? 'mode-active' : undefined} aria-current={!isProduct ? 'true' : undefined} href={`#${id}/original`}>原效果</a>
                <a className={isProduct ? 'mode-active' : undefined} aria-current={isProduct ? 'true' : undefined} href={`#${id}/product`}>产品应用</a>
              </div>
              <div className="preview-actions">
                <a href={example.source} target="_blank" rel="noreferrer" aria-label={example.sourceLabel}>查看来源</a>
                <button className="minor-button reset-button" type="button" onClick={() => setRevision((value) => value + 1)}>{furniture ? '重置画面' : '重置演示'}</button>
              </div>
            </div>
            {furniture && <FurnitureJourney step={furnitureStep} furniture={furniture} />}
            <div className="demo-stage" data-case={id} data-mode={mode}>
              <Suspense fallback={<p className="stage-loading" role="status">载入演示中…</p>}>
                <Demo key={`${id}-${mode}-${revision}`} mode={mode} furniture={furniture} />
              </Suspense>
            </div>
            <div className="preview-foot">
              <span><strong>{isProduct ? example.product : '试试看'}</strong> {furniture ? `${chair.name} · ${finish.name}` : isProduct ? example.productSummary : example.hint}</span>
              {furniture ? <FurnitureNavigation step={furnitureStep} chair={chair} /> : isProduct && id === 'faq' ? (
                <div className="related-links"><a href="#quote/product">返回配置报价</a></div>
              ) : (
                <span className="video-time">{isProduct ? '产品应用' : example.time ? `原视频 ${example.time}` : '源案例复现'}</span>
              )}
            </div>
          </section>

          <section className="mechanism" aria-labelledby="mechanism-heading">
            <div className="mechanism-header"><h2 id="mechanism-heading">可复用的交互规则</h2><a href="#sources">全部来源</a></div>
            <dl className="rule-grid">
              <div><dt>01　用户输入</dt><dd>{example.input}</dd></div>
              <div><dt>02　页面记录</dt><dd>{example.state}</dd></div>
              <div><dt>03　同步反馈</dt><dd>{example.output}</dd></div>
            </dl>
            <Prompt key={`${id}-${mode}`} example={example} mode={mode} />
          </section>
          </>}
        </main>
      </div>
    </div>
  );
}
