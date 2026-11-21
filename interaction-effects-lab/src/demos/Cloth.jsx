import { useEffect, useRef, useState } from 'react';
import { createClothScene } from './clothScene.js';
import './Cloth.css';

const fabrics = [
  { id: 'linen', name: '天然亚麻', color: '#b9a177', response: .83, note: '织纹清晰，拉扯时保留较明显的折线。' },
  { id: 'olive', name: '橄榄棉布', color: '#727e5b', response: .70, note: '布身柔软，弯折更圆润。' },
  { id: 'rose', name: '烟粉混纺', color: '#b78b81', response: .62, note: '布身较软，受力时褶皱幅度更大。' },
];
const foil = { id: 'foil', name: 'Holographic foil', response: .76 };
const asset = (id) => `${import.meta.env.BASE_URL}demo-assets/cloth/${id === 'foil' ? 'foil.jpg' : id + '.webp'}`;

export default function Cloth({ mode }) {
  const product = mode === 'product';
  const [selected, setSelected] = useState(0);
  const material = product ? fabrics[selected] : foil;
  const [motion, setMotion] = useState('still');
  const [pulls, setPulls] = useState(0);
  const [available, setAvailable] = useState(true);
  const canvas = useRef(null);
  const engine = useRef(null);
  const held = useRef(null);

  useEffect(() => {
    const scene = createClothScene(canvas.current, setMotion);
    engine.current = scene;
    setAvailable(Boolean(scene));
    return () => {
      scene?.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setFabric(asset(material.id), material.response);
  }, [material]);

  function point(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  function release(event) {
    if (held.current !== event.pointerId) return;
    held.current = null;
    engine.current?.release();
  }

  function tug(x, y) {
    if (!engine.current) return;
    engine.current.tug(x, y);
    setPulls((count) => count + 1);
  }

  function keydown(event) {
    const offset = { ArrowLeft: [-.25, .14], ArrowRight: [.25, .14], ArrowUp: [0, -.2], ArrowDown: [0, .28], ' ': [.24, .23] }[event.key];
    if (offset) {
      event.preventDefault();
      tug(...offset);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      engine.current?.reset();
    }
  }

  return (
    <section className={`cloth-demo${product ? ' cloth-product' : ''}`}
      data-fabric={material.id} data-motion={motion} data-pull-count={pulls}>
      <header className="cloth-header">
        <strong>{product ? 'Forma Textiles' : 'Peculiar Atelier'}</strong>
        <span>{product ? '面料样本 / 01—03' : 'MATERIAL STUDY / 01'}</span>
      </header>
      <div className="cloth-content">
        <div className="cloth-stage" role="group" tabIndex={0}
          aria-label="拖动布面，或用方向键拉扯，Home 键复位"
          onKeyDown={keydown}
          onPointerDown={(event) => {
            if (event.button !== 0 || held.current !== null || !engine.current?.grab(...point(event))) return;
            held.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            setPulls((count) => count + 1);
          }}
          onPointerMove={(event) => {
            const next = point(event);
            if (held.current === event.pointerId) engine.current?.move(...next);
            else event.currentTarget.toggleAttribute('data-can-grab', Boolean(engine.current?.canGrab(...next)));
          }}
          onPointerLeave={(event) => event.currentTarget.removeAttribute('data-can-grab')}
          onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
          <canvas className="cloth-canvas" ref={canvas} aria-hidden="true" />
          {!available && <img className="cloth-still" src={asset(material.id)} alt={material.name} draggable="false" />}
        </div>
        <div className="cloth-copy">
          <span className="cloth-kicker">{product ? '布料对比 / MATERIAL LAB' : 'UNUSUAL BY INTENT'}</span>
          <h3>{product ? <>布面<span>怎么垂落？</span></> : <>Grab me<span>I dare you</span></>}</h3>
          {product ? <>
            <div className="cloth-swatches" role="group" aria-label="选择面料">{fabrics.map((fabric, index) => (
              <button type="button" key={fabric.id} aria-label={fabric.name} title={fabric.name}
                aria-pressed={selected === index} style={{ '--swatch': fabric.color }}
                onClick={() => setSelected(index)} />
            ))}</div>
            <p aria-live="polite"><strong>{material.name}</strong><br />{material.note}</p>
          </> : <p>按住画面中的布面任意位置并拖动，松手观察它回落。</p>}
          <div className="cloth-actions">
            <button type="button" className="cloth-pull" onClick={() => tug(.30, .23)}>拉一下</button>
            <button type="button" onClick={() => engine.current?.reset()}>复位</button>
          </div>
        </div>
      </div>
      <footer className="cloth-footer">
        <span>↔ 拖动布面 · 支持触屏和方向键</span>
        <span role="status">{motion === 'dragging' ? '布面受力' : motion === 'settling' ? '正在回落' : '静止'}</span>
      </footer>
    </section>
  );
}
