import { useEffect, useId, useRef, useState } from 'react'
import './faq.css'

const ORIGINAL = [
  ['Which tools does Solace connect to?', 'Connect your inbox, team chat, meetings, and project tools to bring follow-ups together in one workspace.'],
  ['How does Solace decide what is a priority?', 'It looks at deadlines, the people involved, and recurring threads to suggest where to start.'],
  ['Is my data and chat history secure?', 'The example product describes encryption in transit and at rest, along with controls to export or remove history.'],
  ['Can I try Solace before I pay?', 'The example offers a 14-day trial with all features available.'],
]

const SIENA = [
  ['尺寸与摆放', '宽 78 cm × 深 82 cm × 高 74 cm，座高 42 cm。扶手椅周围可预留约 60 cm 通行空间。'],
  ['配送与入户', '示例配送时效为 5–8 个工作日。搬运前请测量门洞、电梯和转角，并与包装尺寸核对。'],
  ['面料与清洁', '织物面料建议每周用软刷吸尘。遇到液体时用干布按压吸干，清洁剂先在不显眼处试用。'],
  ['到货检查与退换', '签收时核对外包装和产品表面。如有损坏，可拍照留存并联系售后。退换条件以实际购买条款为准。'],
]

const clamp = (value, low, high) => Math.min(high, Math.max(low, value))
const mix = (a, b, amount) => Math.round(a + (b - a) * amount)
const fract = value => value - Math.floor(value)
const hash = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453)

function Halftone({ pointer, product }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let step = 13
    let rows = []
    let frame = 0
    let point = null

    function resize() {
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (!width || !height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      step = clamp(width / 74, 11, 16)
      rows = []
      for (let j = 0; j * step < height + step; j += 1) {
        const y = j * step
        if (y < height * .10 - step * 2) continue
        const coverage = clamp((y - height * .1) / (height * .26), 0, 1)
        const heat = clamp((y / height - .10) / .84, 0, 1)
        const start = product ? [182, 111, 57] : [226, 106, 24]
        const end = product ? [227, 186, 136] : [255, 214, 170]
        const rgb = start.map((channel, index) => mix(channel, end[index], heat))
        const dots = []
        for (let i = 0; i * step < width + step; i += 1) {
          const a = hash(i, j)
          const b = hash(i + 17, j + 7)
          const keep = Math.min(1, coverage * 1.6 + .12) - a * .6
          if (keep <= 0 && hash(i - 3, j + 21) > .08) continue
          dots.push({ x: i * step, a, b, phase: i * .21 + j * .13, coverage: Math.min(1, .5 + coverage * .6) * (keep > 0 ? 1 : .8) })
        }
        rows.push({ y, color: `rgb(${rgb.join(' ')})`, dots })
      }
    }

    function draw(now) {
      const target = pointer.current
      if (target) {
        const eased = motion.matches ? 1 : .12
        if (!point) point = { ...target }
        point.x += (target.x - point.x) * eased
        point.y += (target.y - point.y) * eased
      } else {
        point = null
      }

      ctx.clearRect(0, 0, width, height)
      const t = now / 1000
      for (const { y, color, dots } of rows) {
        ctx.beginPath()
        for (const { x, a, b, phase, coverage } of dots) {
          const wave = motion.matches ? .7 : .5 + .5 * Math.sin(t * (1.6 + b * 2.6) + a * Math.PI * 2 + Math.sin(t * .7 + phase) * 1.4)
          const distance = point ? (x - point.x) ** 2 + (y - point.y) ** 2 : Infinity
          const swell = .7 * Math.exp(-distance / (step * step * 22))
          const radius = step * .37 * Math.min(1.05, (.42 + .58 * wave ** 1.3) * coverage + swell)
          ctx.moveTo(x + radius, y)
          ctx.arc(x, y, radius, 0, Math.PI * 2)
        }
        ctx.fillStyle = color
        ctx.fill()
      }
      frame = requestAnimationFrame(draw)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    frame = requestAnimationFrame(draw)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [pointer, product])

  return <canvas className="faq-demo__dots" ref={canvasRef} aria-hidden="true" />
}

function Accordion({ entries, active, setActive }) {
  const id = useId()
  const buttons = useRef([])

  function handleKey(event, index) {
    let next
    if (event.key === 'ArrowDown') next = (index + 1) % entries.length
    if (event.key === 'ArrowUp') next = (index - 1 + entries.length) % entries.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = entries.length - 1
    if (next === undefined) return
    event.preventDefault()
    buttons.current[next]?.focus()
  }

  return (
    <div className="faq-demo__accordion">
      {entries.map(([question, answer], index) => {
        const buttonId = `${id}-question-${index}`
        const panelId = `${id}-answer-${index}`
        const open = active === index

        return (
          <div className="faq-demo__row" data-open={open} key={question}>
            <h4>
              <button
                type="button"
                id={buttonId}
                ref={node => { buttons.current[index] = node }}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setActive(open ? null : index)}
                onKeyDown={event => handleKey(event, index)}
              >
                {question}<svg aria-hidden="true" viewBox="0 0 14 14"><path d="M3 5l4 4 4-4" /></svg>
              </button>
            </h4>
            <div className="faq-demo__answer" id={panelId} aria-hidden={!open} aria-labelledby={buttonId} role="region">
              <div><p>{answer}</p></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Faq({ mode }) {
  const product = mode === 'product'
  const [active, setActive] = useState(0)
  const [pointerActive, setPointerActive] = useState(false)
  const pointer = useRef(null)

  function movePointer(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    if (!pointerActive) setPointerActive(true)
  }

  return (
    <section
      className={`faq-demo${product ? ' faq-demo--product' : ''}`}
      aria-label={product ? 'Siena 产品问答' : 'Solace FAQ'}
      data-open-faq={active === null ? 'none' : active + 1}
      data-pointer-active={pointerActive}
      onPointerMove={movePointer}
      onPointerLeave={() => { pointer.current = null; setPointerActive(false) }}
    >
      <Halftone pointer={pointer} product={product} />
      <div className="faq-demo__content">
        {product ? (
          <>
            <div className="faq-demo__product">
              <img src={`${import.meta.env.BASE_URL}demo-assets/runway/chair-0.webp`} alt="陶土色 Siena 扶手椅" />
              <div><p>SIENA / 01</p><h3>扶手椅选购指南</h3><span>陶土色织物 · 示例商品</span></div>
            </div>
            <Accordion entries={SIENA} active={active} setActive={setActive} />
          </>
        ) : (
          <>
            <h3>Questions, answered</h3>
            <Accordion entries={ORIGINAL} active={active} setActive={setActive} />
            <div className="faq-demo__footer" aria-label="Solace 页脚示例">
              <div><strong>Solace</strong><p>Make room for the work that matters.</p><small>© Solace 2026</small></div>
              <div className="faq-demo__footer-links"><span><b>Product</b>Overview<br />Integrations<br />Security</span><span><b>Resources</b>Docs<br />Guides<br />Help Center</span><span><b>Company</b>About<br />Careers<br />Contact</span></div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
