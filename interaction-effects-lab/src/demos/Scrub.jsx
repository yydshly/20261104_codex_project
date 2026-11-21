import { useEffect, useRef, useState } from 'react'
import './Scrub.css'

const FRAME_COUNT = 90
const ATLAS_CAPACITY = 15
const FRAME_WIDTH = 640
const FRAME_HEIGHT = 360
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const asset = (file) => `${import.meta.env.BASE_URL}demo-assets/scrub/${file}`

const stories = {
  original: {
    name: 'novaai', label: 'SCROLL FILM / 01',
    scenes: [
      ['起始', 'Today AI aligns with bold dreams.', '从垂落的线缆开始，滚动推进镜头。'],
      ['聚合', 'Follow the connection.', '亮点汇聚，形态沿同一镜头缓慢变换。'],
      ['核心', 'A new form of intelligence.', '展开折叠体，看到橙色核心。'],
      ['完成', 'Make the next move.', '往回滚动，画面会沿原路径倒回。'],
    ],
  },
  product: {
    name: 'OPTIC / 50', label: 'ASSEMBLY GUIDE / 01',
    scenes: [
      ['识别部件', '镜头装配演示', '从左到右观察卡口、调焦筒、光圈组、镜片和锁环。'],
      ['安装镜筒', '卡口与镜筒对位', '沿光轴对齐安装方向，先让卡口和调焦筒归位。'],
      ['安放光学组', '光圈和镜片入位', '把光圈组放进镜筒，再沿同一轴线送入镜片。'],
      ['锁紧外环', '锁定组装位置', '旋入前锁环，检查组件是否沿同一光轴合拢。'],
    ],
  },
}

function useAtlas(canvas, frame, enabled) {
  const currentFrame = useRef(frame)
  const redraw = useRef(null)
  const [rendered, setRendered] = useState(null)
  currentFrame.current = frame

  useEffect(() => {
    if (!enabled) return
    const element = canvas.current
    const ctx = element.getContext('2d')
    const atlases = Array.from({ length: Math.ceil(FRAME_COUNT / ATLAS_CAPACITY) }, () => new Image())
    let active = true

    function draw() {
      const index = currentFrame.current
      const image = atlases[Math.floor(index / ATLAS_CAPACITY)]
      if (!active || !image.naturalWidth || !element.clientWidth || !element.clientHeight) return
      const density = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.round(element.clientWidth * density)
      const height = Math.round(element.clientHeight * density)
      if (element.width !== width || element.height !== height) {
        element.width = width
        element.height = height
      }
      const tile = index % ATLAS_CAPACITY
      const zoom = Math.max(width / FRAME_WIDTH, height / FRAME_HEIGHT)
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(image, tile % 5 * FRAME_WIDTH, Math.floor(tile / 5) * FRAME_HEIGHT, FRAME_WIDTH, FRAME_HEIGHT,
        (width - FRAME_WIDTH * zoom) / 2, (height - FRAME_HEIGHT * zoom) / 2, FRAME_WIDTH * zoom, FRAME_HEIGHT * zoom)
      setRendered(index)
    }
    redraw.current = draw
    atlases.forEach((image, index) => {
      image.onload = draw
      image.src = asset(`nova-${String(index + 1).padStart(2, '0')}.webp`)
    })
    const observer = new ResizeObserver(draw)
    observer.observe(element)
    return () => {
      active = false
      redraw.current = null
      observer.disconnect()
      atlases.forEach((image) => { image.onload = null })
    }
  }, [canvas, enabled])

  useEffect(() => { redraw.current?.() }, [frame])
  return rendered
}

function useAssembly(canvas, frame, enabled) {
  const currentFrame = useRef(frame)
  const render = useRef(null)
  const [status, setStatus] = useState('loading')
  currentFrame.current = frame
  useEffect(() => {
    if (!enabled) return
    const element = canvas.current
    let active = true
    let model
    let observer
    import('./lensAssembly.js').then(({ createLensAssembly }) => {
      if (!active) return
      model = createLensAssembly(element)
      render.current = () => model.render(currentFrame.current / (FRAME_COUNT - 1))
      observer = new ResizeObserver(render.current)
      observer.observe(element)
      render.current()
      setStatus('ready')
    }).catch(() => { if (active) setStatus('fallback') })
    return () => {
      active = false
      render.current = null
      observer?.disconnect()
      model?.dispose()
    }
  }, [canvas, enabled])
  useEffect(() => { render.current?.() }, [frame])
  return status
}

export default function Scrub({ mode }) {
  const product = mode === 'product'
  const story = stories[mode] ?? stories.original
  const scrollRef = useRef(null)
  const canvasRef = useRef(null)
  const [frame, setFrame] = useState(0)
  const rendered = useAtlas(canvasRef, frame, !product)
  const modelStatus = useAssembly(canvasRef, frame, product)
  const progress = frame / (FRAME_COUNT - 1)
  const step = Math.min(story.scenes.length - 1, Math.floor(progress * story.scenes.length))
  const active = story.scenes[step]
  const ready = product ? modelStatus !== 'loading' : rendered !== null

  function readScroll(event) {
    const element = event.currentTarget
    const index = Math.round(element.scrollTop / Math.max(1, element.scrollHeight - element.clientHeight) * (FRAME_COUNT - 1))
    setFrame(clamp(index, 0, FRAME_COUNT - 1))
  }

  function go(index) {
    const next = clamp(index, 0, FRAME_COUNT - 1)
    const element = scrollRef.current
    element.scrollTop = (element.scrollHeight - element.clientHeight) * next / (FRAME_COUNT - 1)
    setFrame(next)
  }

  function scrollKey(event) {
    if (event.target !== event.currentTarget) return
    const actions = { ArrowDown: frame + 3, ArrowRight: frame + 3, ArrowUp: frame - 3, ArrowLeft: frame - 3,
      PageDown: frame + 22, PageUp: frame - 22, Home: 0, End: FRAME_COUNT - 1 }
    if (!(event.key in actions)) return
    event.preventDefault()
    go(actions[event.key])
  }

  return <section className={`scrub-demo${product ? ' scrub-product' : ''}`} data-frame={frame} data-rendered-frame={product ? ready ? frame : '' : rendered ?? ''} data-progress={progress.toFixed(3)} data-step={step + 1} data-ready={ready} aria-label={story.name}>
    <div className="scrub-scroll" ref={scrollRef} tabIndex={0} onScroll={readScroll} onKeyDown={scrollKey} aria-label="滚动控制画面。方向键逐帧，Home 和 End 跳到首尾">
      <div className="scrub-track"><div className="scrub-scene">
        {!product && <img className="scrub-poster" src={asset('nova-poster.webp')} alt="" />}
        {product && modelStatus !== 'ready' && <div className="scrub-lens-fallback" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((part) => <i key={part} style={{ '--lens-slot': part - 2, '--lens-gap': 14 - progress * 11, '--lens-size': 1 - part * .035 }} />)}
        </div>}
        <canvas className={`scrub-canvas${ready ? ' scrub-canvas-ready' : ''}`} ref={canvasRef} aria-hidden="true" />
        <div className="scrub-shade" aria-hidden="true" />
        <header className="scrub-brand"><strong>{product ? '◉' : '⬡'} {story.name}</strong><span>{story.label}</span></header>
        <div className="scrub-copy">
          <span>0{step + 1} / 0{story.scenes.length}</span><h2>{active[1]}</h2><p>{active[2]}</p>
        </div>
      </div></div>
    </div>
    <div className="scrub-controls">
      <div className="scrub-markers" role="group" aria-label="跳转到一段">
        {story.scenes.map(([label], index) => <button key={label} type="button" aria-current={index === step ? 'step' : undefined} onClick={() => go(index === story.scenes.length - 1 ? FRAME_COUNT - 1 : Math.ceil(index * (FRAME_COUNT - 1) / story.scenes.length))}>{label}</button>)}
      </div>
      <div className="scrub-slider"><input type="range" min="0" max={FRAME_COUNT - 1} value={frame} onChange={(event) => go(Number(event.currentTarget.value))} aria-label="画面帧进度" aria-valuetext={`${frame + 1} / ${FRAME_COUNT}`} /><output>{String(frame + 1).padStart(2, '0')} / {FRAME_COUNT}</output></div>
    </div>
  </section>
}
