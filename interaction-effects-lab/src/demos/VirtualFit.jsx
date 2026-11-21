import { useRef, useState } from 'react'
import './virtualfit.css'

const ASSETS = `${import.meta.env.BASE_URL}demo-assets/virtualfit/`
const SIZES = ['S', 'M', 'L', 'XL']
const COLORS = {
  white: ['白色', '#f5f4ef'],
  ivory: ['米白', '#e7dfce'],
  grey: ['浅灰', '#a6a9ae'],
  sand: ['沙色', '#b3a08a'],
  sage: ['鼠尾草绿', '#889787'],
  navy: ['海军蓝', '#344252'],
}
const ITEMS = [
  { id: 'basic', name: 'Basic Tee', productName: '活动圆领衫', price: 45, unitPrice: 69, colors: ['white', 'sand', 'navy'] },
  { id: 'hoodie', name: 'Grey Hoodie', productName: '仓配连帽卫衣', price: 110, unitPrice: 179, colors: ['grey', 'sage', 'navy'] },
  { id: 'linen', name: 'Linen Shirt', productName: '前台亚麻衬衫', price: 95, unitPrice: 149, colors: ['white', 'sand', 'sage'] },
  { id: 'ringer', name: 'Ringer Tee', productName: '市集撞色短袖', price: 55, unitPrice: 89, colors: ['ivory', 'grey', 'sage'] },
]
const FILTERS = [
  { label: 'All tops', items: ['basic', 'hoodie', 'linen', 'ringer'] },
  { label: 'T-shirts', items: ['basic', 'ringer'] },
  { label: 'Layers', items: ['hoodie', 'linen'] },
]
const PRESETS = [
  { label: '活动组', item: 'basic', size: 'M' },
  { label: '仓配组', item: 'hoodie', size: 'L' },
  { label: '接待组', item: 'linen', size: 'M' },
  { label: '市集组', item: 'ringer', size: 'S' },
]

function garmentImage(item, type) {
  return `${ASSETS}${type}-${item.id}.webp`
}

function cardPosition(index, activeIndex, length) {
  const offset = (index - activeIndex + length) % length
  return offset > length / 2 ? offset - length : offset
}

export default function VirtualFit({ mode }) {
  const product = mode === 'product'
  const [filter, setFilter] = useState(0)
  const [selection, setSelection] = useState({ id: 'basic', size: 'M', color: 'white' })
  const [saved, setSaved] = useState(null)
  const stage = useRef(null)
  const available = product ? ITEMS : ITEMS.filter(item => FILTERS[filter].items.includes(item.id))
  const activeIndex = available.findIndex(item => item.id === selection.id)
  const active = available[Math.max(0, activeIndex)]
  const getName = item => product ? item.productName : item.name
  const getPrice = item => product ? `¥${item.unitPrice}` : `$${item.price}`

  function select(item, size = selection.size) {
    setSelection({ id: item.id, size, color: item.colors[0] })
    setSaved(null)
  }

  function step(direction) {
    const next = (activeIndex + direction + available.length) % available.length
    select(available[next])
  }

  function changeFilter(nextIndex) {
    setFilter(nextIndex)
    const ids = FILTERS[nextIndex].items
    if (!ids.includes(active.id)) select(ITEMS.find(item => item.id === ids[0]))
  }

  function handleKey(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    if (event.target !== event.currentTarget && !event.target.closest('.vf__card')) return
    event.preventDefault()
    step(event.key === 'ArrowLeft' ? -1 : 1)
  }

  function changeOption(key, value) {
    setSelection(previous => ({ ...previous, [key]: value }))
    setSaved(null)
  }

  return (
    <section
      ref={stage}
      className={`vf${product ? ' vf--product' : ''}`}
      aria-label={product ? '配发试衣与配置' : 'VirtualFit 虚拟试衣'}
      tabIndex={0}
      onKeyDown={handleKey}
      data-active-item={active.id}
      data-active-size={selection.size}
      data-active-color={selection.color}
    >
      <img className="vf__room" src={`${ASSETS}room.webp`} alt="" />
      <div className="vf__scrim" aria-hidden="true" />
      <header className="vf__header">
        <span className="vf__wordmark">{product ? 'SHIFT / KIT' : 'VirtualFit'}</span>
        <div className="vf__tabs" role="group" aria-label={product ? '岗位预设' : '服装分类'}>
          {product
            ? PRESETS.map(preset => (
              <button key={preset.item} type="button" aria-pressed={active.id === preset.item} onClick={() => select(ITEMS.find(item => item.id === preset.item), preset.size)}>{preset.label}</button>
            ))
            : FILTERS.map((option, index) => (
              <button key={option.label} type="button" aria-pressed={filter === index} onClick={() => changeFilter(index)}>{option.label}</button>
            ))}
        </div>
        <span className="vf__edition">{product ? '配发配置器' : 'SPATIAL TRY-ON'}</span>
      </header>
      <div className="vf__scene-type" aria-hidden="true">{product ? 'SHIFT' : 'FIT'}</div>

      <div className="vf__model">
        {ITEMS.map(item => (
          <img
            key={item.id}
            className={item.id === active.id ? 'vf__model-image is-active' : 'vf__model-image'}
            src={garmentImage(item, 'model')}
            alt={item.id === active.id ? `模特试穿 ${getName(item)}` : ''}
            aria-hidden={item.id !== active.id}
          />
        ))}
        {selection.color !== active.colors[0] && (
          <div
            className="vf__garment-tint"
            data-garment={active.id}
            aria-hidden="true"
            style={{ '--vf-tone': COLORS[selection.color][1], '--vf-model-mask': `url("${garmentImage(active, 'model')}")` }}
          />
        )}
      </div>

      <div className="vf__cards" aria-label={product ? '可配发服装' : '可试穿服装'}>
        {available.map((item, index) => {
          const position = cardPosition(index, activeIndex, available.length)
          return (
            <button
              type="button"
              key={item.id}
              className="vf__card"
              data-position={position}
              data-item={item.id}
              aria-label={`试穿 ${getName(item)}`}
              disabled={position === 0}
              onClick={() => {
                select(item)
                stage.current?.focus({ preventScroll: true })
              }}
            >
              <img src={garmentImage(item, 'item')} alt="" />
              <span>{getName(item)}</span>
              <strong>{getPrice(item)}</strong>
            </button>
          )
        })}
      </div>

      <div className="vf__steps" aria-label="切换服装">
        <button type="button" onClick={() => step(-1)}>上一件</button>
        <button type="button" onClick={() => step(1)}>下一件</button>
      </div>

      <div className="vf__panel" data-active-label={getName(active)}>
        <div className="vf__active" aria-live="polite" aria-atomic="true">
          <img src={garmentImage(active, 'item')} alt="" />
          <div><strong>{getName(active)}</strong><span>{getPrice(active)}</span></div>
        </div>
        <div className="vf__option" role="group" aria-label="尺码">
          <span>{product ? '尺码' : 'Size'}</span>
          <div className="vf__sizes">
            {SIZES.map(size => <button type="button" key={size} aria-pressed={selection.size === size} onClick={() => changeOption('size', size)}>{size}</button>)}
          </div>
        </div>
        <div className="vf__option" role="group" aria-label="配色">
          <span>{product ? '配色' : 'Color'} <span className="vf__tone-name">{COLORS[selection.color][0]}</span></span>
          <div className="vf__swatches">
            {active.colors.map(color => (
              <button
                type="button"
                key={color}
                title={COLORS[color][0]}
                aria-label={COLORS[color][0]}
                aria-pressed={selection.color === color}
                style={{ '--vf-tone': COLORS[color][1] }}
                onClick={() => changeOption('color', color)}
              />
            ))}
          </div>
        </div>
        {product && (
          <button
            type="button"
            className="vf__save"
            onClick={() => setSaved(`${getName(active)} · ${selection.size} · ${COLORS[selection.color][0]} · ${getPrice(active)}`)}
          >
            确认配发
          </button>
        )}
      </div>
      {saved && <output className="vf__saved" role="status">已确认本次配发 · {saved}</output>}
    </section>
  )
}
