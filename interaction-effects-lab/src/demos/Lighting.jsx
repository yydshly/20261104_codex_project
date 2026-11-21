import { useEffect, useRef, useState } from 'react';
import { chairPhoto, chairProfile } from './chairVisual.js';
import { createLightingFog } from './lightingFog.js';
import './Lighting.css';

const homeScenes = [
  { id: 'morning', label: 'Morning', caption: '$0 for electricity', night: 0, reading: 0, dark: 0 },
  { id: 'night', label: 'Night', caption: '$0 for electricity', night: 1, reading: 0, dark: 1 },
];
const roomScenes = [
  { id: 'daylight', label: '日光', caption: '明亮自然光', night: 0, reading: 0, dark: 0 },
  { id: 'reading', label: '阅读灯', caption: '暖光照亮座椅', night: 0, reading: 1, dark: .88 },
  { id: 'night', label: '夜间', caption: '低照度氛围光', night: 1, reading: 0, dark: 1 },
];
const sinkDuration = 240;
const riseDuration = 820;
const assets = `${import.meta.env.BASE_URL}demo-assets/lighting`;
const room = `${import.meta.env.BASE_URL}demo-assets/virtualfit/room.webp`;

function smooth(min, max, value) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

function useLighting(sceneRef, canvasRef, scenes, initial, product, setVisible, setSettled) {
  const controller = useRef(null);

  useEffect(() => {
    const host = sceneRef.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fog = createLightingFog(canvasRef.current, product);
    let current = initial;
    let wanted = initial;
    let transition = null;
    let frame = 0;
    let fogPaint = -100;
    host.dataset.fog = fog ? 'webgl' : 'css';

    function schedule() {
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function display(from, to, blend, delayedBlend, sink, surge, dip, now) {
      const interpolate = (name, amount = blend) => scenes[from][name] * (1 - amount) + scenes[to][name] * amount;
      const night = interpolate('night');
      const reading = interpolate('reading');
      host.style.setProperty('--night', night.toFixed(4));
      host.style.setProperty('--reading', (night < .999 ? reading / (1 - night) : 0).toFixed(4));
      host.style.setProperty('--dark', interpolate('dark').toFixed(4));
      host.style.setProperty('--text-dark', interpolate('dark', delayedBlend).toFixed(4));
      host.style.setProperty('--sink', `${(sink * 100).toFixed(4)}%`);
      host.style.setProperty('--surge', surge.toFixed(4));
      host.style.setProperty('--dip', dip.toFixed(4));
      scenes.forEach((entry, index) => {
        const value = (index === from ? 1 - blend : 0) + (index === to ? blend : 0);
        host.style.setProperty(`--mode-${entry.id}`, value.toFixed(4));
      });
      if (fog && (transition || media.matches || now - fogPaint > 31)) {
        fog.paint(media.matches ? 0 : now * .001, surge, night, reading);
        fogPaint = now;
      }
    }

    function begin(next) {
      transition = { from: current, to: next, start: performance.now() };
      host.dataset.phase = 'sinking';
      schedule();
    }

    function applyInstant(next) {
      transition = null;
      current = next;
      host.dataset.phase = 'idle';
      setVisible(next);
      setSettled(next);
      display(next, next, 1, 1, 0, 0, 0, performance.now());
    }

    function tick(now) {
      frame = 0;
      if (!transition) {
        if (fog && now - fogPaint > 31) {
          fog.paint(now * .001, 0, scenes[current].night, scenes[current].reading);
          fogPaint = now;
        }
      } else {
        const { from, to, start } = transition;
        const elapsed = Math.max(0, now - start);
        const dipped = elapsed >= sinkDuration;
        if (dipped && current !== to) {
          current = to;
          setVisible(to);
          host.dataset.phase = 'rising';
        }
        const sink = dipped
          ? Math.max(0, 1 - (elapsed - sinkDuration) / riseDuration) ** 3.4 * .27
          : smooth(0, sinkDuration, elapsed) * .27;
        const surge = smooth(0, sinkDuration * .9, elapsed) * (1 - smooth(sinkDuration + 70, sinkDuration + riseDuration * .92, elapsed));
        const dip = smooth(30, 190, elapsed) * (1 - smooth(330, 720, elapsed));
        display(from, to, smooth(120, 520, elapsed), smooth(340, 760, elapsed), sink, surge, dip, now);
        if (elapsed >= sinkDuration + riseDuration) {
          transition = null;
          host.dataset.phase = 'idle';
          setSettled(current);
          if (wanted !== current) begin(wanted);
        }
      }
      if (!media.matches && (transition || fog)) schedule();
    }

    function select(next) {
      wanted = next;
      if (media.matches) applyInstant(next);
      else if (!transition && next !== current) begin(next);
    }

    function motionChanged() {
      if (media.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        applyInstant(wanted);
      } else schedule();
    }

    controller.current = select;
    display(initial, initial, 1, 1, 0, 0, 0, performance.now());
    if (!media.matches && fog) schedule();
    media.addEventListener('change', motionChanged);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener('change', motionChanged);
      fog?.dispose();
      controller.current = null;
    };
  }, [sceneRef, canvasRef, scenes, initial, product, setVisible, setSettled]);

  return controller;
}

function SunLogo() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      {Array.from({ length: 12 }, (_, ray) => <path key={ray} d="M18.4 3.5h3.2l.9 8.4h-5Z" transform={`rotate(${ray * 30} 20 20)`} />)}
    </svg>
  );
}

function House({ visible }) {
  return (
    <>
      <div className="lighting-backdrop" aria-hidden="true">
        <img src={`${assets}/morning-sky.webp`} alt="" />
        <img className="lighting-night" src={`${assets}/night-sky.webp`} alt="" />
      </div>
      <div className="lighting-subject" aria-hidden="true">
        {homeScenes.map(({ id }, index) => (
          <div className="lighting-house" data-current={visible === index} key={id}>
            <img className="lighting-ground" src={`${assets}/${id}-ground.webp`} alt="" />
            <img src={`${assets}/${id}-house.webp`} alt="" />
          </div>
        ))}
      </div>
      <div className="lighting-foreground" aria-hidden="true" />
    </>
  );
}

function Room({ visible, chair, finish }) {
  const [width, height] = chairProfile(chair);
  return (
    <>
      <div className="lighting-backdrop lighting-room" aria-hidden="true">
        {roomScenes.map(({ id }) => (
          <div key={id} className={`lighting-room-view lighting-${id}`}>
            <img src={room} alt="" />
          </div>
        ))}
      </div>
      <div className="lighting-subject lighting-room-subject" data-room={roomScenes[visible].id} aria-hidden="true">
        <div className="lighting-chair-shadow" />
        <img className="lighting-chair" src={chairPhoto(chair, finish)} alt=""
          style={{ '--chair-width': width, '--chair-height': height }} />
      </div>
    </>
  );
}

export default function Lighting({ mode, furniture }) {
  const product = mode === 'product';
  const scenes = product ? roomScenes : homeScenes;
  const initial = product ? 0 : 1;
  const [requested, setRequested] = useState(initial);
  const [visible, setVisible] = useState(initial);
  const [settled, setSettled] = useState(initial);
  const scene = useRef(null);
  const canvas = useRef(null);
  const controls = useLighting(scene, canvas, scenes, initial, product, setVisible, setSettled);

  function select(index) {
    setRequested(index);
    controls.current?.(index);
  }

  return (
    <section ref={scene} className={`lighting-demo${product ? ' lighting-product' : ''}`}
      data-scene={scenes[visible].id} data-target={scenes[requested].id} data-phase="idle"
      data-chair={product ? furniture.chair.id : undefined} data-finish={product ? furniture.finish.id : undefined}>
      {product ? <Room visible={visible} chair={furniture.chair} finish={furniture.finish} /> : <House visible={visible} />}
      <div className="lighting-fog-css" aria-hidden="true" />
      <canvas className="lighting-fog" ref={canvas} aria-hidden="true" />
      <div className="lighting-ui">
        <header className="lighting-header">
          <span className="lighting-brand">{!product && <SunLogo />}{product ? 'Forma Living' : 'Lumen Roof'}</span>
          <div className="lighting-nav" aria-hidden="true">
            {product ? <span>READING ROOM</span> : <><span>How It Works</span><span>Our Cases</span><span>About Us</span></>}
          </div>
          <span className="lighting-badge">{product ? `${furniture.chair.name} · ${furniture.finish.name}` : 'Smart Solar'}</span>
        </header>
        <div className="lighting-heading">
          {product ? <><p>{furniture.chair.name.toUpperCase()} / LIGHTING STUDIO</p><h3>一把椅子，三种光</h3></> :
            <h3><span>$0 Electricity Bills</span><span><em>for the next</em> <b>7 Years</b></span></h3>}
        </div>
        <div className="lighting-dock">
          <div className="lighting-modes" role="group" aria-label={product ? '房间光照' : 'Time of day'}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const next = (requested + (event.key === 'ArrowRight' ? 1 : scenes.length - 1)) % scenes.length;
              select(next);
              event.currentTarget.querySelectorAll('button')[next].focus();
            }}>
            {scenes.map(({ id, label, caption }, index) => (
              <button type="button" key={id} aria-pressed={requested === index} style={{ '--mode-weight': `var(--mode-${id})` }}
                onClick={() => select(index)}>
                <span>{label}</span><small>{caption}</small>
              </button>
            ))}
          </div>
          <p role="status">{product ? `当前光照 · ${scenes[settled].label}` : 'The same roof, from sunrise to night.'}</p>
        </div>
      </div>
    </section>
  );
}
