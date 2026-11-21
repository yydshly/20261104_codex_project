import { useEffect, useRef, useState } from 'react'
import './Pink.css'

const asset = (file) => `${import.meta.env.BASE_URL}demo-assets/pink/${file}`
const BRUSH_DURATION = 1100
const brushLobes = [
  [0, 0, 1], [.51, .22, .59], [-.56, .21, .62], [.19, -.57, .60],
  [-.36, -.47, .47], [-.33, .55, .48], [.27, .58, .57],
]

function paintStamp(context, stamp, radius) {
  context.beginPath()
  for (const [x, y, scale] of brushLobes) {
    const angle = stamp.angle
    const cx = stamp.x + (x * Math.cos(angle) - y * Math.sin(angle)) * radius
    const cy = stamp.y + (x * Math.sin(angle) + y * Math.cos(angle)) * radius
    context.moveTo(cx + radius * scale, cy)
    context.arc(cx, cy, radius * scale, 0, Math.PI * 2)
  }
  context.fill()
}

function useBrush(canvasRef, stageRef, locked) {
  const brush = useRef({ stamps: [], last: null, lastMove: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return
    const mask = document.createElement('canvas')
    const back = document.createElement('canvas')
    const maskContext = mask.getContext('2d')
    const backContext = back.getContext('2d')
    const frontImage = new Image()
    const backImage = new Image()
    const touch = matchMedia('(hover: none), (pointer: coarse)')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const data = brush.current
    let painted = false
    let handle

    const resize = () => {
      const density = Math.min(devicePixelRatio, 1.6)
      canvas.width = mask.width = back.width = Math.max(1, Math.round(canvas.clientWidth * density))
      canvas.height = mask.height = back.height = Math.max(1, Math.round(canvas.clientHeight * density))
      data.stamps = []
      data.last = null
      painted = false
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    frontImage.src = asset('front.webp')
    backImage.src = asset('back.webp')
    data.lastMove = performance.now()

    function draw(time) {
      const width = canvas.width
      const height = canvas.height
      if (frontImage.naturalWidth && backImage.naturalWidth) {
        if (!locked && touch.matches && !reduced.matches && time - data.lastMove > 2500) {
          const x = width * (.50 + Math.sin(time / 840) * .23)
          const y = height * (.36 + Math.sin(time / 1120) * .14)
          const last = data.stamps.at(-1)
          if (!last || Math.hypot(last.x - x, last.y - y) > width * .024) {
            data.stamps.push({ x, y, time, angle: time / 400 })
          }
        }

        const hadStamps = data.stamps.length > 0
        data.stamps = data.stamps.filter((stamp) => time - stamp.time < BRUSH_DURATION)
        if (!painted || hadStamps) {
          context.globalCompositeOperation = 'source-over'
          context.clearRect(0, 0, width, height)
          context.drawImage(locked ? backImage : frontImage, 0, 0, width, height)
          if (!locked && data.stamps.length) {
            maskContext.clearRect(0, 0, width, height)
            for (const stamp of data.stamps) {
              const fade = Math.max(0, (time - stamp.time - 130) / (BRUSH_DURATION - 130))
              paintStamp(maskContext, stamp, width * .135 * (1 - fade ** 1.45))
            }
            backContext.globalCompositeOperation = 'source-over'
            backContext.clearRect(0, 0, width, height)
            backContext.drawImage(backImage, 0, 0, width, height)
            backContext.globalCompositeOperation = 'destination-in'
            backContext.drawImage(mask, 0, 0)
            context.globalCompositeOperation = 'destination-out'
            context.drawImage(mask, 0, 0)
            context.globalCompositeOperation = 'source-over'
            context.drawImage(back, 0, 0)
          }
          canvas.classList.add('pink-canvas-ready')
          painted = true
        }
      }
      handle = requestAnimationFrame(draw)
    }
    handle = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(handle)
      observer.disconnect()
    }
  }, [canvasRef, locked])

  function paint(event) {
    const stage = stageRef.current
    const stageBounds = stage.getBoundingClientRect()
    stage.style.setProperty('--pink-x', `${event.clientX - stageBounds.left}px`)
    stage.style.setProperty('--pink-y', `${event.clientY - stageBounds.top}px`)
    const canvas = canvasRef.current
    const bounds = canvas.getBoundingClientRect()
    const point = {
      x: (event.clientX - bounds.left) * canvas.width / bounds.width,
      y: (event.clientY - bounds.top) * canvas.height / bounds.height,
    }
    const time = performance.now()
    const data = brush.current
    data.lastMove = time
    if (locked) return
    const from = data.last ?? point
    const distance = Math.hypot(point.x - from.x, point.y - from.y)
    const steps = Math.min(38, Math.max(1, Math.ceil(distance / Math.max(9, canvas.width * .036))))
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps
      data.stamps.push({ x: from.x + (point.x - from.x) * progress, y: from.y + (point.y - from.y) * progress, time, angle: time / 160 })
    }
    if (data.stamps.length > 280) data.stamps.splice(0, data.stamps.length - 280)
    data.last = point
  }

  function reset() {
    brush.current.last = null
  }

  return { paint, reset }
}

const designs = {
  original: { name: 'Mina Hwang-Seo', tag: 'PINK RIDER · SS27', ghost: 'DREAM RIDE SPARKLE', title: 'RIDE PRETTY STAY BOLDER' },
  product: { name: 'Rider Lab®', tag: 'GEAR VIEWER · 01', ghost: 'READY FOR THE RIDE', title: 'STREET TO TRACK' },
}

export default function Pink({ mode }) {
  const product = mode === 'product'
  const design = designs[mode] ?? designs.original
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const [locked, setLocked] = useState(false)
  const { paint, reset } = useBrush(canvasRef, stageRef, locked)

  return (
    <section className={`pink-demo${product ? ' pink-product' : ''}`} aria-label={product ? '骑行装备交互检查' : 'Pink Rider 涂抹换装'}>
      <div className="pink-stage" ref={stageRef} onPointerMove={paint} onPointerLeave={reset} onPointerUp={reset} onPointerCancel={reset} onPointerDown={(event) => {
        if (event.pointerType === 'touch') event.currentTarget.setPointerCapture(event.pointerId)
        paint(event)
      }}>
        <div className="pink-typography" aria-hidden="true">
          {[design.ghost, design.title].map((line, index) => <div className={`pink-marquee pink-marquee-${index}`} key={line}>
            {Array.from({ length: 4 }, (_, copy) => <span key={copy}>{line}</span>)}
          </div>)}
        </div>
        <div className="pink-portrait">
          <img src={asset('front.webp')} alt="" />
          <canvas ref={canvasRef} aria-hidden="true" />
        </div>
        <span className="pink-pointer" aria-hidden="true" />
      </div>
      <header className="pink-brand">
        <strong><span aria-hidden="true">✳</span>{design.name}</strong>
        <span>{product ? '互动装备预览' : 'Portfolio / 2027'}</span>
      </header>
      {product && <aside className="pink-product-caption"><b>01 / RIDE KIT</b><p>沿人物涂抹，查看头盔、护目镜和骑行夹克穿戴后的效果。</p></aside>}
      <footer className="pink-footer">
        <span className="pink-hint"><i aria-hidden="true" /> <span className="pink-hint-pointer">移动光标换装</span><span className="pink-hint-touch">拖动手指换装</span></span>
        <button type="button" aria-pressed={locked} onClick={() => setLocked((value) => !value)}>{locked ? '返回涂抹' : product ? '查看整套装备' : '完整换装'}</button>
        <span className="pink-label">{design.tag}</span>
      </footer>
    </section>
  )
}
