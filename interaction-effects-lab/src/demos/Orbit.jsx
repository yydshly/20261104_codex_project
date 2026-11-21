import { useEffect, useRef, useState } from 'react';
import { furnitureChairs, furnitureFinishes } from '../furniture.js';
import { chairPhoto, chairProfile } from './chairVisual.js';
import { createOrbitScene } from './orbitScene.js';
import './Orbit.css';

const creatures = [
  { id: 'phoenix', name: 'Phoenix', latin: 'Phoenix ignis', number: 'MA–001', family: 'Fire birds',
    description: 'A bird of flame, said to return from its own ashes. Its wings and tail have the colors of embers and burnished gold.',
    details: [['Record', 'Classical antiquity'], ['Habitat', 'Arabian desert']], yaw: -.55, pitch: .1 },
  { id: 'kraken', name: 'Kraken', latin: 'Architeuthis mythos', number: 'MA–002', family: 'Sea monsters',
    description: 'Norse sailors told of an island that vanished beneath them. The giant squid gave that old story a smaller, real-world counterpart.',
    details: [['Record', 'Pontoppidan, 1752'], ['Habitat', 'Norwegian Sea']], yaw: .75, pitch: .12 },
];
const chairSpecimens = Object.fromEntries(furnitureChairs.map((chair) => [chair.id, {
  id: chair.id, name: chair.name, latin: 'Forma Living · 单椅', number: `SET–${String(chair.index + 1).padStart(2, '0')}`,
  model: 'chair', scale: chairProfile(chair),
  description: '查看椅背弧度、座面和椅脚。切换面料可直接比较同一示意模型上的颜色。',
  details: [['类型', '软包阅读椅'], ['预览', '示意模型']], yaw: -.42, pitch: .14,
}]));
const points = [
  { name: '椅背', description: '弧形靠背提供侧向支撑。', point: [-.38, .64, -.18] },
  { name: '座面', description: '厚软包座面，可对比不同面料颜色。', point: [.42, .02, .56] },
  { name: '椅脚', description: '独立椅脚撑起座椅，底部留出清洁空间。', point: [.36, -.79, .40] },
];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const home = (specimen) => ({ yaw: specimen.yaw, pitch: specimen.pitch, zoom: 1 });
const degrees = (radians) => Math.round(radians * 180 / Math.PI);

export default function Orbit({ mode, furniture }) {
  const product = mode === 'product';
  const [selected, setSelected] = useState(0);
  const specimen = product ? chairSpecimens[furniture.chair.id] : creatures[selected];
  const finish = product ? furniture.finish : null;
  const [posterWidth, posterHeight] = specimen.scale ?? [1, 1];
  const [view, setView] = useState(() => home(specimen));
  const [loading, setLoading] = useState('loading');
  const [dusk, setDusk] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [hotspot, setHotspot] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const engine = useRef(null);
  const target = useRef(view);
  const pointers = useRef(new Map());
  const firstPoint = useRef(null);
  const secondPoint = useRef(null);
  const thirdPoint = useRef(null);

  useEffect(() => {
    try {
      engine.current = createOrbitScene(canvasRef.current, {
        onReady: () => setLoading('ready'),
        onFailure: () => setLoading('fallback'),
        hotspots: product ? points.map((item, index) => ({
          point: item.point,
          element: [firstPoint, secondPoint, thirdPoint][index],
        })) : null,
      });
    } catch {
      setLoading('fallback');
    }
    return () => {
      engine.current?.dispose();
      engine.current = null;
    };
  }, [product]);

  useEffect(() => {
    target.current = home(specimen);
    setView(target.current);
    setHotspot(null);
    if (engine.current) {
      setLoading('loading');
      engine.current.select(specimen);
    }
  }, [specimen]);

  useEffect(() => {
    if (finish) engine.current?.setFinish(finish.color);
  }, [finish]);

  function publish(next, spin = false) {
    target.current = next;
    setView(next);
    if (spin) engine.current?.spin(next);
    else engine.current?.update(next);
  }

  function rotate(yaw, pitch = 0) {
    const now = target.current;
    publish({ ...now, yaw: now.yaw + yaw, pitch: clamp(now.pitch + pitch, -1.27, 1.27) });
  }

  function zoom(multiplier) {
    const now = target.current;
    publish({ ...now, zoom: clamp(now.zoom * multiplier, .7, 2.25) });
  }

  useEffect(() => {
    const stage = stageRef.current;
    function onWheel(event) {
      if (event.ctrlKey) return;
      event.preventDefault();
      zoom(Math.exp(-clamp(event.deltaY, -250, 250) * .0026));
    }
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, []);

  function release(event) {
    pointers.current.delete(event.pointerId);
    setDragging(pointers.current.size > 0);
  }

  function keydown(event) {
    if (event.target !== event.currentTarget) return;
    const action = {
      ArrowLeft: () => rotate(-.26), ArrowRight: () => rotate(.26),
      ArrowUp: () => rotate(0, -.18), ArrowDown: () => rotate(0, .18),
      '+': () => zoom(1.18), '=': () => zoom(1.18), '-': () => zoom(1 / 1.18),
      Home: () => publish(home(specimen)),
    }[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  }

  function toggleLight() {
    setDusk(!dusk);
    engine.current?.setDusk(!dusk);
  }

  return (
    <section className={`orbit-demo${product ? ' orbit-product' : ''}${expanded ? ' orbit-expanded' : ''}`}
      data-light={dusk ? 'dusk' : 'day'} data-specimen={specimen.id} data-model-state={loading}
      data-yaw={degrees(view.yaw)} data-pitch={degrees(view.pitch)} data-zoom={view.zoom.toFixed(2)}
      data-turn-count={turnCount} data-finish={finish?.id}>
      <aside className="orbit-nav">
        <strong>{product ? 'Forma Living' : 'Myth Atlas'}</strong>
        <small>{product ? 'READING ROOM' : 'CRYPTOZOOLOGY · VOL. I'}</small>
        <div className="orbit-nav-line" />
        <span className="orbit-kicker">{product ? '01 / 产品查看' : '01 / Field guide'}</span>
        {product ? <span className="orbit-nav-current">{specimen.name}</span> :
          creatures.map((entry, index) => (
            <button type="button" key={entry.id} onClick={() => setSelected(index)} aria-pressed={index === selected}>
              <span>{entry.family}</span><small>{entry.number}</small>
            </button>
          ))}
      </aside>

      <div className="orbit-main">
        <div className="orbit-top">
          <div><span className="orbit-kicker">{product ? '材料查看器' : 'Featured creature'}</span><strong>{specimen.name}</strong></div>
          <span className="orbit-key">{specimen.number}</span>
        </div>
        <div className="orbit-stage" ref={stageRef} tabIndex={0} role="group"
          data-dragging={dragging}
          aria-label="拖动或方向键旋转，滚轮或加减键缩放，Home 键复位"
          onKeyDown={keydown} onDoubleClick={() => publish(home(specimen))}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.target.closest('button')) return;
            pointers.current.set(event.pointerId, [event.clientX, event.clientY]);
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerMove={(event) => {
            const tracked = pointers.current;
            const previous = tracked.get(event.pointerId);
            if (!previous) return;
            const next = [event.clientX, event.clientY];
            const second = [...tracked.entries()].find(([id]) => id !== event.pointerId)?.[1];
            tracked.set(event.pointerId, next);
            if (second) {
              const before = Math.max(5, Math.hypot(previous[0] - second[0], previous[1] - second[1]));
              zoom(Math.hypot(next[0] - second[0], next[1] - second[1]) / before);
            } else {
              rotate((next[0] - previous[0]) * .012, (next[1] - previous[1]) * .009);
            }
          }}
          onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
          <div className="orbit-ground" aria-hidden="true" />
          <canvas ref={canvasRef} className="orbit-canvas" aria-hidden="true" />
          {loading !== 'ready' && (
            <img className="orbit-poster" src={product ? chairPhoto(furniture.chair, finish) : `${import.meta.env.BASE_URL}demo-assets/orbit/${specimen.id}.webp`} alt={specimen.name} draggable="false"
              style={{ transform: `perspective(450px) rotateY(${clamp((view.yaw - specimen.yaw) * 24, -60, 60)}deg) scale(${view.zoom * posterWidth}, ${view.zoom * posterHeight})` }} />
          )}
          {product && loading === 'ready' && points.map((item, index) => (
            <button type="button" key={item.name} className="orbit-hotspot"
              ref={[firstPoint, secondPoint, thirdPoint][index]} aria-label={`查看${item.name}`}
              aria-pressed={hotspot === index} onClick={() => setHotspot(hotspot === index ? null : index)}>
              {index + 1}
            </button>
          ))}
          <div className="orbit-tools" role="group" aria-label="查看器工具">
            <button type="button" aria-label="放大" title="放大" onClick={() => zoom(1.18)}>+</button>
            <button type="button" aria-label="缩小" title="缩小" onClick={() => zoom(1 / 1.18)}>−</button>
            <button type="button" aria-label="切换日夜光照" title="切换日夜光照" aria-pressed={dusk} onClick={toggleLight}>☼</button>
            <button type="button" aria-label="展开查看器" title="展开查看器" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>⛶</button>
          </div>
          <p className="orbit-hint">{loading === 'fallback' ? '当前使用静态预览' : product ? '示意模型 · 拖动旋转' : '拖动旋转 · 滚轮缩放'}</p>
        </div>
        <div className="orbit-controls" role="group" aria-label="旋转和选择">
          {product ? <button type="button" onClick={() => publish(home(specimen))}>复位</button> :
            <div className="orbit-tabs">{creatures.map((entry, index) => (
              <button type="button" key={entry.id} aria-pressed={index === selected} onClick={() => setSelected(index)}>{entry.name}</button>
            ))}</div>}
          <div className="orbit-turn">
            <button type="button" aria-label="向左旋转" onClick={() => rotate(-Math.PI / 4)}>↶</button>
            <button type="button" aria-label="旋转 360°" onClick={() => {
              setTurnCount((count) => count + 1);
              publish({ ...target.current, yaw: target.current.yaw + Math.PI * 2 }, true);
            }}>360°</button>
            <button type="button" aria-label="向右旋转" onClick={() => rotate(Math.PI / 4)}>↷</button>
          </div>
        </div>
      </div>

      <aside className="orbit-details">
        <span className="orbit-kicker">{product ? '产品档案' : 'Catalogue record'}</span>
        <div className="orbit-details-body" key={specimen.id}>
          <h3>{specimen.name}</h3>
          <p className="orbit-latin">{specimen.latin}</p>
          <p>{specimen.description}</p>
          <dl>{specimen.details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </div>
        {product && <>
          <div className="orbit-finishes" role="group" aria-label="面料颜色">{furnitureFinishes.map((option) => (
            <button key={option.id} type="button" aria-label={option.name} title={option.name} aria-pressed={option.id === finish.id} style={{ '--finish': option.color }}
              onClick={() => furniture.selectFinish(option.id)} />
          ))}</div>
          <div className="orbit-note" aria-live="polite">{hotspot === null ? `当前面料 · ${finish.name}` : `${points[hotspot].name} · ${points[hotspot].description}`}</div>
        </>}
      </aside>
    </section>
  );
}
