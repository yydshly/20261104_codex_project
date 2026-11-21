import { useEffect, useRef, useState } from 'react'
import './Drift.css'

const asset = (file) => `${import.meta.env.BASE_URL}demo-assets/drift/${file}`
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const ease = (value) => value ** 3 * (value * (6 * value - 15) + 10)
const ramp = (start, end, progress) => ease(clamp((progress - start) / (end - start)))
const palette = [0, .14, .28, .42, .56]
const particles = Array.from({ length: 24 }, (_, index) => ({
  x: (index * 37 + 13) % 100,
  y: (index * 71 + 3) % 100,
  delay: -(index % 9),
  dark: index % 4 === 0,
}))

const stories = {
  original: {
    logo: 'Driftlab',
    links: ['Works', 'Agency'],
    words: ['DRIFTLAB', 'DESIGN TO', 'DELIGHT', 'INSPIRE', 'AND ENGAGE'],
    captions: ['A creative space for projects that blend creativity and technology', 'Follow us into the future of interactive and immersive experiences'],
    panels: ['Every project explores the boundary between design and technology.', 'Discover work in XR, AR, AI and 3D.'],
  },
  product: {
    logo: 'Pelagic®',
    links: ['01 / The current', 'Ocean archive'],
    words: ['PELAGIC', 'SURFACE', 'DESCEND', 'DRIFT', 'RESURFACE'],
    captions: ['An ocean field guide in five movements', 'Cross into the open ocean and follow the current'],
    panels: ['OPEN WATER\nMeet the creatures that travel with the current.', 'RETURN TO LIGHT\nEvery drift carries life into a new current.'],
  },
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function prepareVideoRenderer(canvas) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true })
  if (!gl) {
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null
    canvas.width = 244
    canvas.height = 434
    return {
      render(video) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const frame = context.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = frame.data
        for (let index = 0; index < pixels.length; index += 4) {
          const ceiling = Math.max(pixels[index], pixels[index + 2])
          const key = clamp(((pixels[index + 1] - ceiling) / 255 - .10) / .28)
          pixels[index + 1] = Math.min(pixels[index + 1], ceiling * .96)
          pixels[index + 3] = (1 - key * key * (3 - 2 * key)) * 255
        }
        context.putImageData(frame, 0, 0)
      },
      dispose() {},
    }
  }

  const vertex = compileShader(gl, gl.VERTEX_SHADER, `#version 300 es
    out vec2 uv;
    void main() {
      vec2 point = vec2(gl_VertexID & 1, gl_VertexID >> 1);
      uv = vec2(point.x, 1.0 - point.y);
      gl_Position = vec4(point * 2.0 - 1.0, 0.0, 1.0);
    }`)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
    precision mediump float;
    uniform sampler2D frame;
    in vec2 uv;
    out vec4 pixel;
    void main() {
      vec3 color = texture(frame, uv).rgb;
      float ceiling = max(color.r, color.b);
      float opacity = 1.0 - smoothstep(0.10, 0.38, color.g - ceiling);
      color.g = min(color.g, ceiling * 0.96);
      pixel = vec4(color * opacity, opacity);
    }`)
  if (!vertex || !fragment) return

  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return
  }

  gl.useProgram(program)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  return {
    render(video) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
    dispose() {
      gl.deleteTexture(texture)
      gl.deleteProgram(program)
    },
  }
}

function startKeyedVideo(canvas) {
  const renderer = prepareVideoRenderer(canvas)
  if (!renderer) return
  const video = document.createElement('video')
  video.muted = true
  video.loop = true
  video.playsInline = true
  video.preload = 'auto'
  video.src = asset('jelly.mp4')
  video.play().catch(() => {})
  let handle
  let frameTime = -1

  function draw() {
    if (video.readyState >= 2 && frameTime !== video.currentTime) {
      frameTime = video.currentTime
      renderer.render(video)
      canvas.classList.add('drift-film-ready')
    }
    handle = requestAnimationFrame(draw)
  }
  handle = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(handle)
    canvas.classList.remove('drift-film-ready')
    video.pause()
    video.removeAttribute('src')
    video.load()
    renderer.dispose()
  }
}

function drawRibbon(canvas, words, position, progress) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)
  const fontSize = Math.min(width * .144, height * .245)
  const step = Math.min(width * .70, height * 1.52)
  const fall = ramp(.57, .73, progress) * height * .9
  const center = width / 2

  for (let index = 0; index < words.length; index += 1) {
    const offset = (index - position) * step
    if (Math.abs(offset) > width * 1.24) continue
    const word = words[index]
    const slices = 60
    const span = word.width * fontSize / word.fontSize
    const sourceWidth = word.width / slices
    const project = (column) => {
      const coordinate = offset + (column / slices - .5) * span
      const angle = clamp(coordinate / (width * .60), -1.43, 1.43)
      const depth = 1 - Math.cos(angle)
      const scale = 1 + depth * .65
      const x = center + Math.sin(angle) * width * .67 * scale
      const y = height * .47 + Math.max(0, coordinate) ** 2 / width ** 2 * height * .70 + fall
      return [x, y, scale]
    }
    let current = project(0)
    for (let slice = 0; slice < slices; slice += 1) {
      const [x, y, scale] = current
      current = project(slice + 1)
      const [nextX] = current
      if (nextX <= x || nextX < 0 || x > width) continue
      const scaledHeight = word.height * fontSize / word.fontSize * scale
      ctx.drawImage(word.image, slice * sourceWidth, 0, sourceWidth, word.height, x, y - scaledHeight / 2, nextX - x + .65, scaledHeight)
    }
  }
}

function makeWords(titles) {
  return titles.map((title) => {
    const fontSize = 128
    const image = document.createElement('canvas')
    const ctx = image.getContext('2d')
    const font = `${fontSize}px 'Drift Anton', Impact, sans-serif`
    ctx.font = font
    image.width = Math.ceil(ctx.measureText(title).width + 4)
    image.height = 176
    ctx.font = font
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#101017'
    ctx.fillText(title, 2, image.height * .56)
    return { image, width: image.width, height: image.height, fontSize }
  })
}

export default function Drift({ mode }) {
  const story = stories[mode] ?? stories.original
  const scrollRef = useRef(null)
  const wordsRef = useRef(null)
  const videoRef = useRef(null)
  const pointerRef = useRef([0, 0])
  const [chapter, setChapter] = useState(0)
  const [motion, setMotion] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches)
  const stageRef = useRef(null)

  useEffect(() => {
    if (motion) return startKeyedVideo(videoRef.current)
  }, [motion])

  useEffect(() => {
    const motionPreference = matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => setMotion(!motionPreference.matches)
    motionPreference.addEventListener('change', syncMotion)
    return () => motionPreference.removeEventListener('change', syncMotion)
  }, [])

  useEffect(() => {
    const scroll = scrollRef.current
    const stage = stageRef.current
    const canvas = wordsRef.current
    let words = makeWords(story.words)
    let active = true
    let ribbonDirty = true
    document.fonts?.load('128px "Drift Anton"').then(() => {
      if (active) {
        words = makeWords(story.words)
        ribbonDirty = true
      }
    }).catch(() => {})

    const resize = () => {
      const density = Math.min(devicePixelRatio, 1.5)
      canvas.width = Math.round(canvas.clientWidth * density)
      canvas.height = Math.round(canvas.clientHeight * density)
      ribbonDirty = true
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    let progress = 0
    let previousProgress = -1
    let x = 0
    let y = 0
    let lastChapter = -1
    let handle

    function draw(time) {
      const target = clamp(scroll.scrollTop / Math.max(1, scroll.scrollHeight - scroll.clientHeight))
      progress += (target - progress) * (motion ? .12 : 1)
      const chapterProgress = clamp(progress / .14, 0, 4)
      const whole = Math.floor(chapterProgress)
      const position = whole + ease(chapterProgress - whole)
      const reveal = ramp(.63, .81, progress)
      const turn = ramp(.73, .82, progress) - 2 * ramp(.86, .96, progress)
      const floating = motion ? Math.sin(time / 1400) : 0
      const [targetX, targetY] = pointerRef.current
      x += ((motion ? targetX : 0) - x) * .075
      y += ((motion ? targetY : 0) - y) * .075

      stage.style.setProperty('--drift-progress', progress)
      stage.style.setProperty('--drift-x', `${turn * 13 + x * 1.5}%`)
      stage.style.setProperty('--drift-y', `${reveal * 5 + y * 1.5 + floating * 1.5}%`)
      stage.style.setProperty('--drift-scale', 1 + reveal * .40)
      stage.style.setProperty('--drift-tilt', `${motion ? Math.sin(progress * 13 + time / 3200) * 5 : 0}deg`)
      stage.style.setProperty('--drift-intro', 1 - ramp(.035, .10, progress))
      stage.style.setProperty('--drift-middle', ramp(.08, .15, progress) * (1 - ramp(.56, .65, progress)))
      stage.style.setProperty('--drift-panel-a', ramp(.71, .78, progress) * (1 - ramp(.84, .89, progress)))
      stage.style.setProperty('--drift-panel-b', ramp(.88, .96, progress))
      if (ribbonDirty || Math.abs(previousProgress - progress) > .0001) {
        drawRibbon(canvas, words, position, progress)
        ribbonDirty = false
        previousProgress = progress
      }

      const nextChapter = Math.round(chapterProgress)
      if (nextChapter !== lastChapter) {
        setChapter(nextChapter)
        lastChapter = nextChapter
      }
      handle = requestAnimationFrame(draw)
    }
    handle = requestAnimationFrame(draw)

    return () => {
      active = false
      cancelAnimationFrame(handle)
      observer.disconnect()
    }
  }, [motion, story])

  function go(progress) {
    const scroll = scrollRef.current
    scroll.scrollTo({ top: (scroll.scrollHeight - scroll.clientHeight) * progress, behavior: motion ? 'smooth' : 'instant' })
  }

  function move(event) {
    const bounds = stageRef.current.getBoundingClientRect()
    pointerRef.current = [(event.clientX - bounds.left) / bounds.width * 2 - 1, (event.clientY - bounds.top) / bounds.height * 2 - 1]
  }

  return (
    <div className={`drift-demo${motion ? '' : ' drift-still'}`}>
      <div className="drift-scroll" ref={scrollRef} tabIndex={0} aria-label="滚动浏览五段动效，也可用方向键和翻页键">
        <div className="drift-track">
          <section className="drift-stage" ref={stageRef} onPointerMove={move} onPointerLeave={() => { pointerRef.current = [0, 0] }}>
            <div className="drift-sky" style={{ backgroundImage: `url(${asset('sky.webp')})` }} />
            <div className="drift-particles" aria-hidden="true">
              {particles.map(({ x, y, dark, delay }, index) => <i key={index} className={dark ? 'drift-particle-dark' : ''} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s` }} />)}
            </div>
            <canvas className="drift-ribbon" ref={wordsRef} aria-hidden="true" />
            <div className="drift-subject" aria-hidden="true">
              <img src={asset('jelly.webp')} alt="" />
              <canvas ref={videoRef} />
            </div>
            <header className="drift-brand">
              <strong>{story.logo}<span aria-hidden="true">〜</span></strong>
              <div><button type="button" onClick={() => go(.77)}>[{story.links[0]}]</button><button type="button" onClick={() => go(1)}>[{story.links[1]}]</button></div>
            </header>
            <nav className="drift-chapters" aria-label="章节">
              {palette.map((position, index) => <button key={position} type="button" aria-label={story.words[index]} aria-current={chapter === index ? 'step' : undefined} onClick={() => go(position)}>{String(index + 1).padStart(2, '0')}</button>)}
            </nav>
            <div className="drift-rail" aria-hidden="true"><i /></div>
            <p className="drift-caption drift-intro">{story.captions[0]}</p>
            <p className="drift-caption drift-middle">{story.captions[1]}</p>
            <p className="drift-panel drift-panel-a">{story.panels[0]}</p>
            <p className="drift-panel drift-panel-b">{story.panels[1]}</p>
            <footer className="drift-footer">
              <button type="button" onClick={() => setMotion((previous) => !previous)} aria-pressed={motion}>{motion ? '暂停动态素材' : '播放动态素材'}</button>
              <span>滚动探索 <b aria-hidden="true">↓</b></span>
              <button type="button" aria-label="返回开头" onClick={() => go(0)}>↑</button>
            </footer>
          </section>
        </div>
      </div>
    </div>
  )
}
