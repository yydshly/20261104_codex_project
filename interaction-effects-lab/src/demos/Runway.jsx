import { useCallback, useRef, useState } from 'react';
import { furnitureChairs, furnitureFinishes } from '../furniture.js';
import { chairPhoto, chairProfile } from './chairVisual.js';
import { useSequence, useStageSize, wrap } from './sequence.js';
import './Runway.css';

const models = [[12, 176], [178, 330], [331, 470], [476, 633], [634, 767], [767, 956]];
const pieces = [
  [26, 224, 28, 214, 'Feather Jacket', '$2,900'],
  [304, 412, 22, 236, 'Satin Wide Leg Trousers', '$1,450'],
  [530, 666, 12, 242, 'Pleated Dress', '$2,200'],
  [752, 922, 100, 146, 'Gold Waist Belt', '$420'],
  [70, 176, 246, 466, 'Satin Trench Dress', '$2,350'],
  [294, 422, 294, 432, 'Top Handle Bag', '$980'],
  [508, 688, 240, 452, 'Billow Sleeve Blouse', '$860'],
  [780, 890, 252, 466, 'Tie Waist Trousers', '$740'],
  [64, 178, 484, 698, 'Powder Long Coat', '$1,980'],
  [316, 396, 482, 698, 'Ivory Straight Trousers', '$690'],
  [530, 672, 508, 682, 'Sculpted Ruffle Top', '$1,120'],
  [754, 916, 484, 700, 'Pleated Maxi Skirt', '$1,340'],
];

// At each depth stop, the same position drives center, foot line, scale, blur, and opacity.
const depth = [
  [1.20, 1.14, 1.18, 0, 1], [.744, .89, .832, 0, 1], [.496, .777, .574, 1.5, 1],
  [.346, .704, .436, 4, 1], [.235, .651, .334, 8, .86], [.15, .616, .258, 12, .50], [.085, .59, .19, 17, 0],
];
const labels = ['Runway', 'The Maison', 'Lookbook', 'Shop'];

function SheetCrop({ sheet, box }) {
  const [x, y, width, height] = box;
  const sheetHeight = sheet === 'models' ? 540 : 720;
  return (
    <svg aria-hidden="true" viewBox={`${x} ${y} ${width} ${height}`} overflow="hidden">
      <svg x={x} y={y} width={width} height={height} viewBox={`${x} ${y} ${width} ${height}`} overflow="hidden">
        <image href={`${import.meta.env.BASE_URL}demo-assets/runway/${sheet}.webp`} width="960" height={sheetHeight} preserveAspectRatio="none" />
      </svg>
    </svg>
  );
}

function Chair({ chair, finish }) {
  const [width, height] = chairProfile(chair);
  return <img src={chairPhoto(chair, finish)} alt="" draggable="false" style={{ transform: `scale(${width}, ${height})`, transformOrigin: 'bottom center' }} />;
}

const money = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', maximumFractionDigits: 0 });

function LookNumber({ position, first }) {
  return (
    <span className="runway-number" aria-hidden="true">
      <span style={{ transform: `translateY(${-wrap(position, 6) / 7 * 100}%)` }}>
        {Array.from({ length: 7 }, (_, index) => <b key={index}>{String(first + index % 6).padStart(2, '0')}</b>)}
      </span>
    </span>
  );
}

export default function Runway({ mode, furniture }) {
  const product = mode === 'product';
  const selectChair = furniture?.selectChair;
  const updateSelection = useCallback((index) => selectChair?.(furnitureChairs[index].id), [selectChair]);
  const [stageRef, { width, height }] = useStageSize();
  const [railRef, railSize] = useStageSize();
  const { position, active, select, step, bind } = useSequence({
    ref: stageRef, length: models.length, pull: Math.max(98, width * .2),
    initial: furniture?.chair.index ?? 0, onTargetChange: product ? updateSelection : undefined,
  });
  const [favorites, setFavorites] = useState({});
  const [cart, setCart] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const ringRef = useRef(null);
  const horizontalRail = railSize.width > railSize.height * 2.1;
  const cardSize = horizontalRail ? Math.max(96, railSize.width / 3) : railSize.height / 3;
  const first = product ? 1 : 15;
  const depthBlur = Math.min(1, width / 660);
  const railTitle = product ? '搭配与材质' : 'Shop the look';

  function finishFor(chair) {
    return chair.id === furniture?.chair.id
      ? furniture.finish
      : furnitureFinishes.find((finish) => finish.id === chair.defaultFinish);
  }

  return (
    <section className={`runway-demo${product ? ' runway-product' : ''}`}
      data-active-index={active} data-active-look={first + active} data-active-id={product ? furnitureChairs[active].name : `look-${first + active}`}>
      <header className="runway-header">
        <strong>{product ? 'Forma Living' : 'Maison Vell'}</strong>
        {product ? (
          <select className="runway-chooser" aria-label="选择座椅款式" value={furniture.chair.index} onChange={(event) => select(Number(event.target.value))}>
            {furnitureChairs.map((chair) => <option key={chair.id} value={chair.index}>{chair.name} 单椅</option>)}
          </select>
        ) : <div className="runway-header-labels">{labels.map((label) => <span key={label}>{label}</span>)}</div>}
        <span className="runway-cart" aria-live="polite">{product ? '清单' : 'Cart'} ({cart})</span>
      </header>
      <div className="runway-content">
        <div className="runway-stage" ref={stageRef} tabIndex={0} role="group"
          aria-label={product ? '家具展列，方向键、滚动或拖动切换' : 'Runway stage. Drag, scroll, or use the arrow keys to change looks.'}
          {...bind}
          onPointerMove={(event) => {
            bind.onPointerMove(event);
            if (event.pointerType !== 'mouse') return;
            const box = event.currentTarget.getBoundingClientRect();
            ringRef.current.style.transform = `translate3d(${event.clientX - box.left}px,${event.clientY - box.top}px,0)`;
          }}>
          <div className="runway-intro">
            <h3>{product ? 'The Reading Room' : 'Spring Summer 2027'}</h3>
            <p>{product ? '同一个角落，六种坐感。切换座椅，右侧同时更新面料与搭配。' :
              'A study in softness and strength. The new season blends delicate textures and modern silhouettes.'}</p>
          </div>
          {models.map(([left, right], index) => {
            const chair = furnitureChairs[index];
            let distance = wrap(index - position, models.length);
            if (distance > models.length - 1) distance -= models.length;
            const start = Math.floor(distance + 1);
            const next = Math.min(start + 1, depth.length - 1);
            const mix = (value) => depth[start][value] + (depth[next][value] - depth[start][value]) * (distance + 1 - start);
            const modelHeight = height * mix(2);
            const ratio = product ? 1.05 : (right - left) / 448;
            const base = height * 1.2;
            const scale = modelHeight / base;
            const x = width * mix(0) - modelHeight * ratio / 2;
            const y = height * mix(1) - modelHeight;
            const blur = mix(3) * depthBlur / scale;
            return (
              <button key={index} type="button" className="runway-model" tabIndex={-1}
                aria-label={product ? `查看 ${chair.name}` : `Select look ${first + index}`}
                aria-hidden={mix(4) < .06} data-look={first + index} data-current={index === active || undefined}
                onClick={() => select(index)}
                style={{
                  width: base * ratio, height: base,
                  transform: `translate3d(${x}px,${y}px,0) scale(${scale})`,
                  filter: blur > .15 ? `blur(${blur}px)` : undefined,
                  opacity: mix(4), zIndex: 100 - Math.round(distance * 10),
                  pointerEvents: mix(4) < .06 ? 'none' : undefined,
                }}>
                {product ? <Chair chair={chair} finish={finishFor(chair)} /> : <SheetCrop sheet="models" box={[left, 48, right - left, 448]} />}
              </button>
            );
          })}
          <div className="runway-look">
            <div className="runway-look-count">
              <span>{product ? 'SET' : 'LOOK'}</span><LookNumber position={position} first={first} />
            </div>
            <p aria-live="polite">{product ? `${furnitureChairs[active].name} / ${finishFor(furnitureChairs[active]).name}` : `Look ${first + active}`}</p>
          </div>
          <div className="runway-steps">
            <button type="button" aria-label="上一个" onClick={() => step(-1)}>←</button>
            <button type="button" aria-label="下一个" onClick={() => step(1)}>→</button>
          </div>
          <span className="runway-ring" aria-hidden="true" ref={ringRef} />
        </div>
        <div className="runway-rail" ref={railRef} role="group" aria-label={railTitle}
          data-direction={horizontalRail ? 'horizontal' : 'vertical'}>
          {pieces.map(([left, right, top, bottom, originalName, price], index) => {
            const chair = furnitureChairs[Math.floor(index / 2)];
            const finish = product ? finishFor(chair) : null;
            const name = product ? (index % 2 ? finish.name : chair.name + ' 单椅') : originalName;
            const track = pieces.length * cardSize;
            let offset = wrap((index - 2 * position) * cardSize, track);
            if (offset > track - cardSize) offset -= track;
            const visible = wrap(index - active * 2, pieces.length) < 3;
            return (
              <article className="runway-piece" key={index}
                data-piece={index} aria-hidden={!visible}
                style={{
                  '--rail-size': `${cardSize}px`,
                  transform: horizontalRail ? `translateX(${offset}px)` : `translateY(${offset}px)`,
                }}>
                <button type="button" className="runway-favorite" aria-label={`收藏 ${name}`} aria-pressed={!!favorites[index]}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => setFavorites((items) => ({ ...items, [index]: !items[index] }))}>
                  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M12 20S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20.5 9C20.5 15 12 20 12 20Z" /></svg>
                </button>
                <div className="runway-piece-art">
                  {product ? index % 2
                    ? <span className="runway-swatch" style={{ '--swatch': finish.color }} />
                    : <Chair chair={chair} finish={finish} />
                    : <SheetCrop sheet="pieces" box={[left, top, right - left, bottom - top]} />}
                </div>
                <div className="runway-piece-text">
                  <h4>{name}</h4>
                  <small>{product ? index % 2 ? '材质样本' : money.format(chair.price + finish.surcharge) : price}</small>
                </div>
                <button type="button" className="runway-add" aria-label={`加入清单 ${name}`} tabIndex={visible ? 0 : -1}
                  onClick={() => { setCart((value) => value + 1); setCartMessage(`${name} 已加入清单`); }}>+</button>
              </article>
            );
          })}
        </div>
      </div>
      <span className="runway-sr-only" role="status">{cartMessage}</span>
    </section>
  );
}
