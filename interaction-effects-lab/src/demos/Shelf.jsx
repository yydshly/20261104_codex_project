import { useEffect, useRef, useState } from 'react';
import { clamp, useSequence, useStageSize, wrap } from './sequence.js';
import './Shelf.css';

const sheets = {
  covers: [1744, 2336], spines: [2688, 1152], fix: [1520, 2688], fix2: [1520, 2688],
};
const films = [
  ['valley', 'The Silent Valley', 'Shizukana Tani / 静かな谷', 1958, 'Drama', [497, 72, 344, 659], ['spines', 266, 31, 189, 1089]],
  ['bluehour', 'The Blue Hour', 'Ao no Toki / 青の刻', 1962, 'Romance', [914, 72, 342, 659], ['spines', 492, 31, 189, 1089]],
  ['river', 'River of Salt', 'Shio no Kawa / 塩の川', 1964, 'Drama', [1332, 72, 344, 659], ['fix', 197, 54, 324, 2566]],
  ['summer', 'The Last Summer', 'Saigo no Natsu / 最後の夏', 1966, 'Drama', [74, 813, 344, 676], ['spines', 937, 31, 188, 1089]],
  ['green', 'The Green Road', 'Midori no Michi / 緑の道', 1969, 'Mystery', [497, 815, 344, 674], ['spines', 1157, 31, 185, 1090]],
  ['noon', 'Noon in Ashes', 'Hai no Shogo / 灰の正午', 1971, 'Western', [74, 72, 347, 659], ['spines', 44, 32, 184, 1088]],
  ['observer', 'The Observer', 'Kansatsusha / 観察者', 1973, 'Thriller', [915, 815, 342, 675], ['fix2', 371, 15, 349, 2655]],
  ['birds', 'The Fallen Birds', 'Ochita Tori / 落ちた鳥', 1975, 'Drama', [1331, 815, 345, 675], ['spines', 1573, 31, 183, 1089]],
  ['storm', 'Light in the Storm', 'Arashi no Hi / 嵐の灯', 1978, 'Drama', [74, 1571, 345, 681], ['fix2', 808, 15, 347, 2656]],
  ['tide', 'The Long Tide', 'Nagai Shio / 長い潮', 1981, 'Drama', [496, 1577, 343, 678], ['spines', 2012, 31, 188, 1089]],
  ['war', 'A Quiet War', 'Shizukana Senso / 静かな戦争', 1985, 'Comedy', [913, 1579, 343, 676], ['spines', 2236, 31, 189, 1089]],
  ['door', 'Red Door', 'Akai Tobira / 赤い扉', 1989, 'Thriller', [1331, 1579, 344, 677], ['spines', 2462, 31, 188, 1089]],
].map(([id, title, subtitle, year, type, cover, spine]) => ({ id, title, subtitle, year, type, cover: ['covers', ...cover], spine }));

const specimens = [
  ['pyrite', 'Pyrite', '黄铁矿 · FeS₂', '硫化物', '#ba9660', '#57452f', '金属光泽常呈黄铜色，可见立方晶形。'],
  ['fluorite', 'Fluorite', '萤石 · CaF₂', '卤化物', '#a995c3', '#4f4270', '萤石有多种色带，部分标本在紫外线下发光。'],
  ['quartz', 'Clear Quartz', '透明石英 · SiO₂', '硅酸盐', '#b6c6ca', '#445e66', '透明石英通常生长为六方柱状晶体。'],
  ['malachite', 'Malachite', '孔雀石 · Cu₂CO₃(OH)₂', '碳酸盐', '#70ac86', '#1e5540', '深浅交替的绿色条带记录了它分层生长的过程。'],
  ['calcite', 'Calcite', '方解石 · CaCO₃', '碳酸盐', '#d9ad85', '#754538', '透明方解石具有明显的双折射现象。'],
  ['amethyst', 'Amethyst', '紫水晶 · SiO₂', '硅酸盐', '#b295c4', '#584170', '紫水晶是石英的紫色变种，常生长在晶洞内壁。'],
  ['azurite', 'Azurite', '蓝铜矿 · Cu₃(CO₃)₂(OH)₂', '碳酸盐', '#7c9bbc', '#2e4565', '蓝铜矿与孔雀石常一起出现在铜矿床的氧化带。'],
  ['galena', 'Galena', '方铅矿 · PbS', '硫化物', '#a0a6ad', '#464c53', '方铅矿具有铅灰色金属光泽及立方解理。'],
].map(([id, title, subtitle, type, pale, dark, description], index) => ({
  id, title, subtitle, type, pale, dark, description, accession: String(index + 1).padStart(2, '0'),
}));

function artStyle([sheet, x, y, w, h]) {
  const [sheetWidth, sheetHeight] = sheets[sheet];
  return {
    backgroundImage: `url(${import.meta.env.BASE_URL}demo-assets/shelf/${sheet}.webp)`,
    backgroundSize: `${sheetWidth / w * 100}% ${sheetHeight / h * 100}%`,
    backgroundPosition: `${x / (sheetWidth - w) * 100}% ${y / (sheetHeight - h) * 100}%`,
  };
}

function Cover({ item, product }) {
  if (!product) return <span className="shelf-cover-art" style={artStyle(item.cover)} />;
  return (
    <span className="shelf-mineral-cover" style={{ '--mineral-pale': item.pale, '--mineral-dark': item.dark }}>
      <small>FIELD NOTES / {item.accession}</small>
      <strong>{item.title}</strong>
      <img className="shelf-crystal" src={`${import.meta.env.BASE_URL}demo-assets/shelf/${item.id}.webp`} alt="" draggable="false" />
      <small>MINERAL ATLAS</small>
    </span>
  );
}

export default function Shelf({ mode }) {
  const product = mode === 'product';
  const items = product ? specimens : films;
  const [ref, { width, height }] = useStageSize();
  const tapeHeight = Math.min(height * 0.8, width * 0.49);
  const spineWidth = tapeHeight * 0.169;
  const coverWidth = tapeHeight * 0.527;
  const spacing = tapeHeight * 0.033;
  const { position, active, select, step, bind } = useSequence({
    ref, length: items.length, initial: product ? 3 : 5, pull: Math.max(48, spineWidth * 2), dragDirection: -1,
  });
  const item = items[active];
  const [detail, setDetail] = useState(null);
  const [tilt, setTilt] = useState([0, 0]);
  const detailRef = useRef(null);
  const activeButton = useRef(null);
  const cursorRef = useRef(null);
  const cursorScale = clamp(1 - Math.abs(position - Math.round(position)) * 2, 0.2, 1);
  const filters = product ? ['全部', '硫化物', '卤化物', '硅酸盐', '碳酸盐'] : ['All / すべて', '1950s', '1960s', '1970s', '1980s'];
  const filterFor = (entry) => product ? entry.type : `${Math.floor(entry.year / 10) * 10}s`;

  useEffect(() => {
    if (detail) detailRef.current.showModal();
  }, [detail]);

  return (
    <section className={`shelf-demo${product ? ' shelf-product' : ''}`} data-active-index={active} data-active-id={item.id}>
      <div className="shelf-header">
        <span>{product ? '常设展览 / COLLECTION' : 'FILM ARCHIVE / 映画'}</span>
        <div className="shelf-wordmark">
          <strong>{product ? '矿 物 图 谱' : '莱昂·瓦萨里'}</strong>
          <small>{product ? 'MINERAL ATLAS' : 'LEON VASARI'}</small>
        </div>
        <span>{product ? '馆藏索引 / 01—08' : 'CAREER 1958—1989'}</span>
      </div>
      <div className="shelf-filters" role="group" aria-label={product ? '跳到矿物分类' : '跳到年代'}>
        {filters.map((filter, index) => (
          <button key={filter} type="button" aria-pressed={filterFor(item) === filter}
            onClick={() => select(index ? items.findIndex((entry) => filterFor(entry) === filter) : 0)}>
            {filter}
          </button>
        ))}
      </div>
      <div ref={ref} className="shelf-stage" tabIndex={0} role="group"
        aria-label={product ? '矿物陈列，方向键切换，回车打开' : 'Film shelf. Use arrow keys to browse or Enter to open.'}
        {...bind}
        onKeyDown={(event) => {
          bind.onKeyDown(event);
          if (event.target === event.currentTarget && event.key === 'Enter') setDetail(item);
        }}
        onPointerMove={(event) => {
          bind.onPointerMove(event);
          if (event.pointerType !== 'mouse' || event.buttons) return;
          const box = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - box.left;
          const y = event.clientY - box.top;
          const cursor = cursorRef.current;
          cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          cursor.toggleAttribute('data-open', Boolean(event.target.closest('.shelf-tape[data-current="true"]')));
          setTilt([
            clamp((x - width / 2) / coverWidth, -1, 1) * 8,
            -clamp((y - height / 2) / tapeHeight, -1, 1) * 9,
          ]);
        }}
        onPointerLeave={(event) => {
          bind.onPointerLeave(event);
          setTilt([0, 0]);
        }}>
        <div className="shelf-objects">
          {Array.from({ length: items.length * 3 }, (_, index) => {
            const entry = items[index % items.length];
            const count = items.length * 3;
            const relative = wrap(index - position + count / 2, count) - count / 2;
            const proximity = clamp(1 - Math.abs(relative), 0, 1);
            const open = proximity * proximity * (3 - 2 * proximity);
            const bend = Math.abs(relative) < 1 ? (relative + Math.sin(Math.PI * relative) / Math.PI) / 2 : Math.sign(relative) / 2;
            const x = relative * (spineWidth + spacing) + (coverWidth - spineWidth + spacing) * bend;
            const isActive = Math.abs(relative) <= 0.5 && entry === item;
            return (
              <button key={index} className="shelf-tape" type="button" tabIndex={isActive ? 0 : -1}
                ref={isActive ? activeButton : undefined} data-shelf-item={entry.id} data-current={isActive || undefined}
                aria-label={isActive ? `${product ? '查看' : 'Open'} ${entry.title}` : entry.title}
                aria-hidden={Math.abs(x) > width / 2 + coverWidth}
                style={{
                  '--tape-height': `${tapeHeight}px`, '--spine-width': `${spineWidth}px`,
                  '--cover-width': `${coverWidth}px`,
                  '--spine-offset': `${coverWidth / 2}px`, '--cover-offset': `${spineWidth / 2}px`,
                  '--shade': open, '--spine-lift': isActive ? '0px' : '-8px',
                  zIndex: Math.round(100 - Math.abs(relative) * 4),
                  visibility: Math.abs(x) > width / 2 + coverWidth ? 'hidden' : undefined,
                  transform: `translate3d(${x}px,${-open * tapeHeight * 0.025}px,${open * tapeHeight * 0.19}px) rotateZ(${-4.5 * open}deg) rotateX(${tilt[1] * open}deg) rotateY(${(-90 + tilt[0]) * open}deg)`,
                }}
                onClick={() => isActive ? setDetail(entry) : select(index % items.length)}>
                <span className="shelf-spine" style={product ? { backgroundColor: entry.dark } : artStyle(entry.spine)}>
                  {product && <span>{entry.title} <small>{entry.accession}</small></span>}
                </span>
                <span className="shelf-cover"><Cover item={entry} product={product} /></span>
              </button>
            );
          })}
        </div>
        <button type="button" className="shelf-open" aria-label={product ? '打开标本详情' : 'Open film details'}
          onClick={() => setDetail(item)} style={{
            '--open-left': `${coverWidth * -0.53}px`, '--open-top': `${tapeHeight * 0.32}px`,
            transform: `scale(${cursorScale})`,
          }}>▶</button>
        <span className="shelf-cursor" ref={cursorRef} aria-hidden="true"><span>{product ? '查看' : 'OPEN'}</span></span>
      </div>
      <div className="shelf-caption">
        <button type="button" aria-label="上一个" onClick={() => step(-1)}>←</button>
        <div aria-live="polite" className="shelf-caption-mask">
          <div key={item.id} className="shelf-caption-line">
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
            <small>{product ? `馆藏编号 MA–${item.accession}` : `${item.year} · ${item.type}`}</small>
          </div>
        </div>
        <button type="button" aria-label="下一个" onClick={() => step(1)}>→</button>
      </div>
      <footer className="shelf-footer"><span>{product ? '矿物标本档案' : '© LEON VASARI'}</span><span>{product ? '矿物藏品 · 第一辑' : 'FILMOGRAPHY / VOL. 01'}</span></footer>
      {detail && (
        <dialog ref={detailRef} className="shelf-detail"
          aria-label={detail.title}
          onClose={() => { setDetail(null); activeButton.current?.focus(); }}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}>
          <div className="shelf-detail-sheet">
            <button type="button" className="shelf-detail-close" onClick={() => detailRef.current.close()} autoFocus>{product ? '关闭 ×' : 'CLOSE / 閉じる ×'}</button>
            <div className="shelf-detail-poster"><Cover item={detail} product={product} /></div>
            <div className="shelf-detail-copy">
              <small>{product ? '馆藏标本 / SPECIMEN' : 'A LEON VASARI FILM'}</small>
              <h3>{detail.title}</h3>
              <p>{detail.subtitle}</p>
              <p>{product ? detail.description : `${detail.year} · ${detail.type} · VHS archive`}</p>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
