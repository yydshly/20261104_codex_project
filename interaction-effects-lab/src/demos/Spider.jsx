import { useEffect, useRef, useState } from 'react'
import { clampRopeValue as clamp } from './ropePhysics.js'
import { createBridgeScene, createWebScene } from './spiderScenes.js'
import './Spider.css'

const initialLoad = 30
const initialPosition = .50

function Cabinet() {
  return <div className="spider-cabinet" aria-hidden="true">
    <span className="spider-wordmark">found</span>
    <div className="spider-mug"><span>main<br />character</span></div>
    <div className="spider-radio"><div><b>◉</b><span>FIELD TAPE<br /><small>cabinet FM</small></span></div><i /></div>
    <div className="spider-computer"><i /><b>• • • • •</b></div>
    <div className="spider-book"><span>OBJECT<br />NOTES</span><i>○</i></div>
    <svg className="spider-shirt" viewBox="0 0 150 110" aria-hidden="true">
      <path d="M48 10 17 20 4 48 25 59 33 49 33 106h84V49l8 10 21-11-13-28-31-10c-6 9-16 13-27 13s-21-4-27-13Z" fill="#e3e7ff" stroke="#fafbff" strokeWidth="2" />
      <path d="M48 10c5 15 18 20 27 20s22-5 27-20" fill="none" stroke="#a8aeda" strokeWidth="2" />
      <text x="75" y="55" textAnchor="middle" fill="#283b9a" fontSize="10" fontWeight="700">FOUND OBJECT</text>
    </svg>
  </div>
}

export default function Spider({ mode }) {
  const bridge = mode === 'product'
  const canvasRef = useRef(null)
  const rootRef = useRef(null)
  const sceneRef = useRef(null)
  const pointerRef = useRef(null)
  const lastTap = useRef(0)
  const keyboard = useRef({ x: .54, y: .43 })
  const [load, setLoad] = useState(initialLoad)
  const [position, setPosition] = useState(initialPosition)
  const target = useRef({ load: initialLoad, position: initialPosition })

  function changeLoad(value) {
    const next = clamp(value, 0, 100)
    target.current.load = next
    setLoad(next)
  }

  function changePosition(value) {
    const next = clamp(value, .08, .92)
    target.current.position = next
    setPosition(next)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    let handle
    let lastTime
    let unprocessed = 16.7
    let snapshot = ''

    function resize() {
      const bounds = canvas.getBoundingClientRect()
      const width = bounds.width
      const height = bounds.height
      const density = Math.min(devicePixelRatio || 1, 1.65)
      canvas.width = Math.max(1, Math.round(width * density))
      canvas.height = Math.max(1, Math.round(height * density))
      ctx.setTransform(density, 0, 0, density, 0, 0)
      if (width < 40 || height < 80) return
      sceneRef.current = bridge ? createBridgeScene(width, height) : createWebScene(width, height)
    }

    function frame(time) {
      unprocessed += lastTime ? Math.min(time - lastTime, 50) : 0
      lastTime = time
      const scene = sceneRef.current
      if (scene) {
        let changed = false
        while (unprocessed >= 1000 / 60) {
          unprocessed -= 1000 / 60
          if (bridge) scene.update(target.current.load / 100, target.current.position, reduced.matches)
          else scene.update(reduced.matches)
          changed = true
        }
        if (changed) {
          scene.draw(ctx, time, reduced.matches)
          const state = scene.read()
          const values = bridge ? [state.sag.toFixed(4), state.settling] : [state.strands, state.spiderX.toFixed(3), state.spiderY.toFixed(3), state.jumping]
          const signature = values.join(':')
          if (signature !== snapshot) {
            snapshot = signature
            const keys = bridge ? ['sag', 'settling'] : ['strands', 'spiderX', 'spiderY', 'jumping']
            keys.forEach((key, index) => { root.dataset[key] = values[index] })
          }
        }
      }
      handle = requestAnimationFrame(frame)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    handle = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(handle)
      observer.disconnect()
      clearTimeout(pointerRef.current?.hold)
    }
  }, [bridge])

  function localPoint(event) {
    const { left, top, width, height } = canvasRef.current.getBoundingClientRect()
    const x = event.clientX - left
    const y = event.clientY - top
    keyboard.current = { x: x / width, y: y / height }
    return { x, y }
  }

  function move(event) {
    const scene = sceneRef.current
    if (!scene) return
    const press = pointerRef.current
    if (press && press.id !== event.pointerId) return
    const point = localPoint(event)
    if (press && Math.hypot(point.x - press.x, point.y - press.y) > 8) {
      press.moved = true
      clearTimeout(press.hold)
    }
    if (bridge && press) changePosition(scene.fraction(point.x))
    if (!bridge && !press?.cleared) scene.point(point.x, point.y)
  }

  function down(event) {
    if (!event.isPrimary || event.button !== 0 || pointerRef.current || !sceneRef.current) return
    const point = localPoint(event)
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    const press = { ...point, id: event.pointerId, moved: false, cleared: false }
    pointerRef.current = press
    if (bridge) {
      changePosition(sceneRef.current.fraction(point.x))
    } else {
      sceneRef.current.point(point.x, point.y)
      if (event.pointerType === 'touch') press.hold = setTimeout(() => {
        press.cleared = true
        sceneRef.current?.reset()
      }, 650)
    }
  }

  function up(event, cancelled = false) {
    const press = pointerRef.current
    if (!press || press.id !== event.pointerId) return
    clearTimeout(press.hold)
    pointerRef.current = null
    if (!bridge && !cancelled && !press.moved && !press.cleared) {
      if (event.pointerType !== 'touch' || event.timeStamp - lastTap.current < 310) sceneRef.current.pounce()
      lastTap.current = event.timeStamp
    }
  }

  function key(event) {
    const actions = { ArrowLeft: [-.06, 0], ArrowRight: [.06, 0], ArrowUp: [0, -.07], ArrowDown: [0, .07] }
    if (bridge) {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        changePosition(target.current.position + actions[event.key][0])
      }
      return
    }
    const scene = sceneRef.current
    if (!scene) return
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      scene.reset()
      return
    }
    if (!(event.key in actions) && event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    const [dx, dy] = actions[event.key] ?? [0, 0]
    keyboard.current.x = clamp(keyboard.current.x + dx, .07, .93)
    keyboard.current.y = clamp(keyboard.current.y + dy, .14, .78)
    const bounds = canvasRef.current.getBoundingClientRect()
    scene.point(keyboard.current.x * bounds.width, keyboard.current.y * bounds.height)
    if (event.key === 'Enter' || event.key === ' ') scene.pounce()
  }

  function resetBridge() {
    changeLoad(initialLoad)
    changePosition(initialPosition)
  }

  return <section className={`spider-demo ${bridge ? 'spider-bridge' : 'spider-web'}`} ref={rootRef} data-load={bridge ? load : undefined} data-position={bridge ? position.toFixed(2) : undefined} aria-label={bridge ? '悬索桥载荷对比' : 'Spider Web 互动橱柜'}>
    {!bridge && <Cabinet />}
    <header className="spider-brand">
      <div><span>{bridge ? 'STRUCTURE STUDY / 01' : 'THE CURIOSITY CABINET'}</span><strong>{bridge ? '悬索桥载荷对比' : 'found / field notes'}</strong></div>
      <span>{bridge ? '概念示意 · 非工程计算' : 'WEB EXPERIMENT / 01'}</span>
    </header>
    <canvas className="spider-field" ref={canvasRef} tabIndex={0}
      aria-label={bridge ? '拖动配重，或用左右方向键移动配重' : '移动指针或用方向键引导蜘蛛，回车扑跳，Delete 清除丝网'}
      onPointerMove={move} onPointerDown={down} onPointerUp={up} onPointerCancel={(event) => up(event, true)}
      onPointerLeave={() => { if (!bridge && !pointerRef.current) sceneRef.current?.leave() }} onKeyDown={key} />
    {bridge ? <>
      <div className="spider-legend" aria-hidden="true"><span><i />当前载荷</span><span><i />空载参考</span></div>
      <footer className="spider-controls spider-bridge-controls">
        <label><span>配重大小</span><input type="range" min="0" max="100" value={load} onChange={(event) => changeLoad(Number(event.currentTarget.value))} /><output>{load}%</output></label>
        <button type="button" onClick={resetBridge}>恢复初始</button>
      </footer>
    </> : <footer className="spider-controls spider-web-controls">
      <span><b>沿丝网移动观察回弹</b><small>点击扑跳 · 触屏双击 · 长按清网</small></span>
      <button type="button" onClick={() => sceneRef.current?.reset()}>清空丝网</button>
    </footer>}
  </section>
}
