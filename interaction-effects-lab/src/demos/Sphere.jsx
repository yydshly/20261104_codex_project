import { useEffect, useRef, useState } from 'react'
import { sphereCatalog } from './sphereCatalog.js'
import './Sphere.css'

const asset = (file) => `${import.meta.env.BASE_URL}demo-assets/sphere/${file}`
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const toRadians = Math.PI / 180

function sphericalPoints(count) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - 2 * index / (count - 1)
    const radial = Math.sqrt(Math.max(0, 1 - y * y))
    const x = Math.cos(index * goldenAngle) * radial
    const z = Math.sin(index * goldenAngle) * radial
    return { x, y, z, longitude: Math.atan2(x, z) / toRadians, latitude: Math.asin(y) / toRadians }
  })
}

function pointDepth(point, yaw, pitch) {
  return -point.x * Math.sin(yaw) + (point.z * Math.cos(pitch) - point.y * Math.sin(pitch)) * Math.cos(yaw)
}

export default function Sphere({ mode }) {
  const catalog = sphereCatalog[mode] ?? sphereCatalog.original
  const [view, setView] = useState('sphere')
  const [selected, setSelected] = useState(null)
  const root = useRef(null)
  const stage = useRef(null)
  const world = useRef(null)
  const heading = useRef(null)
  const cards = useRef([])
  const points = useRef(sphericalPoints(catalog.items.length))
  const orbit = useRef({ yaw: 0, pitch: -4, velocityX: 0, velocityY: 0, zoom: 0, targetZoom: 0, drag: null })
  const panel = useRef(null)
  const backFocus = useRef(null)
  const current = selected === null ? null : catalog.items[selected]

  useEffect(() => {
    if (view !== 'sphere' || selected !== null) return
    const surface = stage.current
    const worldElement = world.current
    const headingElement = heading.current
    const rootElement = root.current
    const cardElements = cards.current.slice()
    const spin = orbit.current
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let radius = 0
    let dirty = true
    let handle
    let previousTime = 0
    let stopped = false

    function resize() {
      if (stopped || !surface.isConnected) return
      const { width, height } = surface.getBoundingClientRect()
      radius = Math.min(width * .40, height * .38)
      surface.style.setProperty('--sphere-card-width', `${Math.max(57, radius * .54)}px`)
      surface.style.setProperty('--sphere-perspective', `${Math.max(500, width * .87)}px`)
      points.current.forEach(({ x, y, z, longitude, latitude }, index) => {
        cardElements[index].style.transform = `translate3d(${x * radius}px, ${-y * radius}px, ${z * radius}px) rotateY(${longitude}deg) rotateX(${latitude}deg)`
      })
      dirty = true
    }
    const observer = new ResizeObserver(resize)
    observer.observe(surface)
    resize()

    let lastYaw = NaN
    let lastPitch = NaN
    let lastZoom = NaN
    function tick(time) {
      if (stopped || !surface.isConnected) return
      const elapsed = previousTime ? Math.min((time - previousTime) / 16.67, 2.5) : 1
      previousTime = time
      if (!spin.drag) {
        if (preference.matches) {
          spin.velocityX = 0
          spin.velocityY = 0
        } else {
          spin.yaw += spin.velocityX * elapsed
          spin.pitch = clamp(spin.pitch + spin.velocityY * elapsed, -36, 36)
          const damping = .925 ** elapsed
          spin.velocityX = Math.abs(spin.velocityX) > .015 ? spin.velocityX * damping : 0
          spin.velocityY = Math.abs(spin.velocityY) > .015 ? spin.velocityY * damping : 0
        }
      }
      const gap = spin.targetZoom - spin.zoom
      spin.zoom += Math.abs(gap) < .0005 || preference.matches ? gap : gap * .13

      if (dirty || spin.yaw !== lastYaw || spin.pitch !== lastPitch || spin.zoom !== lastZoom) {
        const yaw = spin.yaw * toRadians
        const pitch = spin.pitch * toRadians
        worldElement.style.transform = `translateZ(${spin.zoom * radius * .32}px) rotateY(${spin.yaw}deg) rotateX(${spin.pitch}deg)`
        headingElement.style.transform = `rotateX(${-spin.pitch}deg) rotateY(${-spin.yaw}deg) translateZ(${radius * .57}px)`
        headingElement.style.opacity = 1 - spin.zoom * .46
        points.current.forEach((point, index) => {
          const depth = pointDepth(point, yaw, pitch)
          cardElements[index].style.setProperty('--sphere-shade', ((1 - depth) * .43).toFixed(3))
        })
        rootElement.dataset.yaw = spin.yaw.toFixed(2)
        rootElement.dataset.pitch = spin.pitch.toFixed(2)
        rootElement.dataset.zoom = spin.zoom.toFixed(3)
        lastYaw = spin.yaw
        lastPitch = spin.pitch
        lastZoom = spin.zoom
        dirty = false
      }
      handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)

    function wheel(event) {
      const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 340 : 1
      const next = clamp(spin.targetZoom + event.deltaY * factor / 520, 0, 1)
      if (next !== spin.targetZoom) {
        event.preventDefault()
        spin.targetZoom = next
      }
    }
    surface.addEventListener('wheel', wheel, { passive: false })
    return () => {
      stopped = true
      cancelAnimationFrame(handle)
      observer.disconnect()
      surface.removeEventListener('wheel', wheel)
    }
  }, [view, selected])

  const close = () => setSelected(null)

  useEffect(() => {
    if (!current) {
      if (backFocus.current?.isConnected) backFocus.current.focus({ preventScroll: true })
      backFocus.current = null
      return
    }
    panel.current?.querySelector('[data-close-photo]')?.focus({ preventScroll: true })
  }, [Boolean(current)])

  function open(index) {
    backFocus.current = document.activeElement
    orbit.current.velocityX = 0
    orbit.current.velocityY = 0
    setSelected(index)
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0 || orbit.current.drag) return
    const spin = orbit.current
    const photo = event.target.closest('[data-photo]')
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    spin.velocityX = 0
    spin.velocityY = 0
    spin.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: event.clientX, originY: event.clientY, index: photo ? Number(photo.dataset.photo) : null, time: event.timeStamp, moved: false }
    event.currentTarget.dataset.dragging = 'true'
  }

  function drag(event) {
    const spin = orbit.current
    const press = spin.drag
    if (!press || press.id !== event.pointerId) return
    const dx = event.clientX - press.x
    const dy = event.clientY - press.y
    const elapsed = Math.max(10, event.timeStamp - press.time)
    if (press.moved || Math.hypot(event.clientX - press.originX, event.clientY - press.originY) > (event.pointerType === 'touch' ? 10 : 5)) {
      press.moved = true
      spin.yaw += dx * .25
      spin.pitch = clamp(spin.pitch - dy * .23, -36, 36)
      spin.velocityX = clamp(dx * .25 * 16.67 / elapsed, -9, 9)
      spin.velocityY = clamp(-dy * .23 * 16.67 / elapsed, -6, 6)
    }
    press.x = event.clientX
    press.y = event.clientY
    press.time = event.timeStamp
  }

  function stopDrag(event, cancelled = false) {
    const spin = orbit.current
    const press = spin.drag
    if (!press || press.id !== event.pointerId) return
    spin.drag = null
    delete event.currentTarget.dataset.dragging
    if (event.timeStamp - press.time > 110 || cancelled) {
      spin.velocityX = 0
      spin.velocityY = 0
    }
    if (!cancelled && !press.moved && press.index !== null) open(press.index)
  }

  function stageKey(event) {
    if (event.target !== event.currentTarget) return
    const spin = orbit.current
    const increments = { ArrowLeft: [-18, 0], ArrowRight: [18, 0], ArrowUp: [0, 14], ArrowDown: [0, -14] }
    if (event.key in increments) {
      event.preventDefault()
      spin.yaw += increments[event.key][0]
      spin.pitch = clamp(spin.pitch + increments[event.key][1], -36, 36)
      spin.velocityX = 0
      spin.velocityY = 0
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const depths = points.current.map((point) => pointDepth(point, spin.yaw * toRadians, spin.pitch * toRadians))
      open(depths.indexOf(Math.max(...depths)))
    }
  }

  const changePhoto = (delta) => setSelected((index) => (index + delta + catalog.items.length) % catalog.items.length)

  function dialogKey(event) {
    if (event.key === 'Escape') close()
    if (event.key === 'ArrowLeft') changePhoto(-1)
    if (event.key === 'ArrowRight') changePhoto(1)
    if (event.key !== 'Tab') return
    const controls = [...panel.current.querySelectorAll('button')]
    const index = controls.indexOf(document.activeElement)
    if ((event.shiftKey && index === 0) || (!event.shiftKey && index === controls.length - 1)) {
      event.preventDefault()
      controls[event.shiftKey ? controls.length - 1 : 0].focus()
    }
  }

  return (
    <section className={`sphere-demo${mode === 'product' ? ' sphere-product' : ''}`} ref={root} data-view={view} data-item={selected === null ? '' : selected + 1} aria-label={catalog.name}>
      <div className="sphere-interactive" inert={Boolean(current)}>
        <header className="sphere-brand">
          <div><strong>{catalog.name}</strong><span>{catalog.label}</span></div>
          <div className="sphere-views" role="group" aria-label="档案视图">
            <button type="button" aria-pressed={view === 'sphere'} onClick={() => setView('sphere')}>球面</button>
            <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>网格</button>
          </div>
        </header>
        {view === 'sphere' ? <div className="sphere-stage" ref={stage} tabIndex={0} aria-label="拖动或用方向键转动球面，按回车查看最靠前的照片" onKeyDown={stageKey} onPointerDown={startDrag} onPointerMove={drag} onPointerUp={stopDrag} onPointerCancel={(event) => stopDrag(event, true)}>
          <div className="sphere-world" ref={world}>
            {catalog.items.map((item, index) => <button type="button" tabIndex={-1} aria-label={item.title} className={`sphere-card${item.portrait ? ' sphere-portrait' : ''}`} key={item.file} ref={(element) => { cards.current[index] = element }} data-photo={index}>
              <span><img src={asset(item.file)} alt="" draggable="false" /></span>
            </button>)}
            <h2 className="sphere-title" ref={heading}><span>{catalog.title}</span></h2>
          </div>
        </div> : <div className="sphere-grid" tabIndex={0} aria-label="可滚动影像网格">
          {catalog.items.map((item, index) => <button type="button" key={item.file} onClick={() => open(index)}>
            <img src={asset(item.file)} alt="" loading="lazy" /><span>{item.title}</span>
          </button>)}
        </div>}
        <footer className="sphere-footer"><span>{view === 'sphere' ? '拖动旋转 · 滚轮靠近 · 点选照片' : `${catalog.items.length} 张档案影像`}</span><a href={catalog.source} target="_blank" rel="noreferrer">{catalog.attribution} ↗</a></footer>
      </div>
      {current && <div className="sphere-modal" ref={panel} role="dialog" aria-modal="true" aria-label={current.title} onKeyDown={dialogKey} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
        <button className="sphere-close" data-close-photo type="button" aria-label="关闭照片详情" onClick={close}>×</button>
        <figure><img src={asset(current.file)} alt={current.title} /><figcaption><strong>{current.title}</strong><span>{current.caption}</span></figcaption></figure>
        <div className="sphere-photo-nav"><button type="button" aria-label="上一张" onClick={() => changePhoto(-1)}>←</button><span>{selected + 1} / {catalog.items.length}</span><button type="button" aria-label="下一张" onClick={() => changePhoto(1)}>→</button></div>
      </div>}
    </section>
  )
}
