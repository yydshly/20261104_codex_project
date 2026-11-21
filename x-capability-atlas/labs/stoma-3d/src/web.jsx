import React, {Component, Suspense, useCallback, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas, useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Specimen} from './scene.jsx';
import evidence from '../public/assets/mcp-verification.json';
import chapters from './chapters.json';
import './web.css';

const base = import.meta.env.BASE_URL;
const media = '../../stoma-media/';
const views = {top: {tilt: 8, yaw: 10}, angled: {tilt: 43, yaw: 36}};
for (const asset of [evidence.before, evidence.after]) useLoader.preload(GLTFLoader, `${base}assets/${asset.name}`);

class CanvasError extends Component {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    return this.state.failed ? <p className="canvas-message" role="alert">3D 模型载入失败。可以播放下方讲解片。</p> : this.props.children;
  }
}

function App() {
  const [revision, setRevision] = useState('after');
  const [opening, setOpening] = useState(100);
  const [camera, setCamera] = useState(views.top);
  const [measure, setMeasure] = useState(true);
  const [geometry, setGeometry] = useState(null);
  const drag = useRef(null);
  const video = useRef(null);
  const model = evidence[revision];
  const url = `${base}assets/${model.name}`;
  const onLoad = useCallback((values) => setGeometry({...values, revision}), [revision]);
  const ready = geometry?.revision === revision;
  const width = ready ? geometry.closed + (geometry.open - geometry.closed) * opening / 100 : null;
  const onPointerDown = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    drag.current = {id: event.pointerId, x: event.clientX, y: event.clientY, camera};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    const start = drag.current;
    if (start?.id !== event.pointerId) return;
    const tilt = Math.max(0, Math.min(60, start.camera.tilt + (event.clientY - start.y) * .35));
    const yaw = start.camera.yaw - (event.clientX - start.x) * .55;
    setCamera({tilt, yaw});
  };
  const finishDrag = () => { drag.current = null; };

  return <main>
    <header className="top">
      <div><p className="eyebrow">05 / 叶片显微观察</p><h1>看见叶片气孔的开合</h1><p>拖动开合滑块，观察两侧保卫细胞与中间孔隙的变化。</p></div>
      <a href="../../../#case-05" target="_top">返回图鉴拆解 ↗</a>
    </header>

    <section className="station" aria-labelledby="station-title">
      <div className="stage">
        <div className="stage-bar"><strong id="station-title">3D 标本</strong><span>{revision === 'after' ? 'V2 · MCP 修改后' : 'V1 · 修改前'}</span></div>
        <div className="model-view" aria-label="叶片气孔 3D 视图" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finishDrag} onLostPointerCapture={finishDrag} onPointerCancel={finishDrag}>
          <CanvasError>
            <Canvas orthographic dpr={[1, 1.5]} frameloop="demand" fallback={<p className="canvas-message">此浏览器无法开启 WebGL。请播放下方讲解片。</p>}>
              <Suspense fallback={null}>
                <Specimen url={url} aperture={opening / 100} tilt={camera.tilt} yaw={camera.yaw} measure={measure} onLoad={onLoad}/>
              </Suspense>
            </Canvas>
          </CanvasError>
          {!ready && <span className="load-mark" role="status">正在读取 3D 模型</span>}
          <span className="drag-mark" aria-hidden="true">拖动旋转</span>
        </div>
      </div>
      <div className="controls">
        <div><p className="eyebrow">保卫细胞</p><h2>改变开合</h2></div>
        <label className="range-label" htmlFor="opening">开合程度 <output htmlFor="opening">{opening}%</output></label>
        <input id="opening" type="range" min="0" max="100" value={opening} onChange={(event) => setOpening(Number(event.target.value))}/>
        <div className="buttons" aria-label="选择开合状态">{[[0, '闭合'], [50, '半开'], [100, '全开']].map(([value, label]) => <button key={value} type="button" aria-pressed={opening === value} onClick={() => setOpening(value)}>{label}</button>)}</div>
        <label className="measure"><input type="checkbox" checked={measure} onChange={(event) => setMeasure(event.target.checked)}/> 显示孔隙标线</label>
        <div className="readout"><span>中央孔隙宽度</span><strong id="aperture-width">{width === null ? '—' : width.toFixed(3)}</strong><small>模型单位</small></div>
        <fieldset><legend>观察角度</legend><div className="buttons"><button type="button" onClick={() => setCamera(views.top)} aria-pressed={camera === views.top}>俯视</button><button type="button" onClick={() => setCamera(views.angled)} aria-pressed={camera === views.angled}>斜视</button></div></fieldset>
        <fieldset><legend>资产版本</legend><div className="buttons"><button type="button" onClick={() => setRevision('before')} aria-pressed={revision === 'before'}>V1 修改前</button><button type="button" onClick={() => setRevision('after')} aria-pressed={revision === 'after'}>V2 修改后</button></div></fieldset>
      </div>
    </section>

    <section className="film" aria-labelledby="film-title">
      <div><p className="eyebrow">16 秒 / 中文讲解</p><h2 id="film-title">从保卫细胞找到气孔</h2><p>用上方同一份 V2 模型拍摄。从俯视看开合，再转到斜视辨认两侧细胞。</p>
        <div className="chapters" aria-label="讲解章节">{chapters.map(({start, title}) => <button key={start} type="button" onClick={() => {video.current.currentTime = start / 24; video.current.play().catch(() => {});}}><time>{(start / 24).toFixed(1)} 秒</time>{title}</button>)}</div>
        <a className="action" href={`${media}stoma-lesson.mp4`} download>下载讲解 MP4 ↓</a>
      </div>
      <video ref={video} controls playsInline preload="none" width="1280" height="720" poster={`${media}stoma-lesson.jpg`} src={`${media}stoma-lesson.mp4`} aria-label="气孔开合 3D 讲解片"/>
    </section>

    <section className="verification" aria-labelledby="verification-title">
      <p className="eyebrow">Blender MCP 实测</p>
      <h2 id="verification-title">同一帧，比较改动前后</h2>
      <p>通过 MCP 修改左右保卫细胞的张开形变。全开时，中央孔隙从 <strong>{evidence.before.openWidth.toFixed(3)}</strong> 变为 <strong>{evidence.after.openWidth.toFixed(3)}</strong> 模型单位。下面两张图用 Remotion 在第 160 帧从两个版本分别渲染。</p>
      <div className="pair">
        <figure><img src={`${media}stoma-v1-frame.jpg`} width="1280" height="720" loading="lazy" alt="修改前，保卫细胞之间的孔隙较窄"/><figcaption>V1 修改前 · {evidence.before.openWidth.toFixed(3)}</figcaption></figure>
        <figure><img src={`${media}stoma-lesson.jpg`} width="1280" height="720" loading="lazy" alt="修改后，同一机位下的孔隙变宽"/><figcaption>V2 修改后 · {evidence.after.openWidth.toFixed(3)}</figcaption></figure>
      </div>
      <div className="asset-links"><a href={`${base}assets/stoma-v2.glb`} download>下载 V2 模型 GLB ↓</a><a href={`${base}assets/mcp-verification.json`} download>下载核验记录 ↓</a><a href="../../visual-cases.html?case=05">观察卡与离线课堂 ↗</a></div>
      <p className="footnote">模型单位用于比较示意宽度。<a href="https://openstax.org/books/biology-2e/pages/30-4-leaves" target="_blank" rel="noopener">叶片结构参考 ↗</a></p>
    </section>
  </main>;
}

createRoot(document.querySelector('#root')).render(<App/>);
