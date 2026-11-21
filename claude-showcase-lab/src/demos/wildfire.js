import './wildfire.css'

const mapWidth = 960
const mapHeight = 500
const duration = 36
const ignition = [407, 306]
const milestones = [
  { hour: 0, label: '最初发现火情' },
  { hour: 8, label: '火线越过南侧山脊' },
  { hour: 18, label: '无人机定位东北侧热点' },
  { hour: 27, label: '西南侧建立隔离带' },
  { hour: 36, label: '隔离带趋于稳定' },
]

const hotspots = [
  [408, 305, 0], [449, 295, 4], [458, 258, 7], [482, 283, 9],
  [514, 240, 13], [535, 252, 16], [557, 209, 18], [592, 215, 20],
  [616, 179, 24], [650, 203, 27], [672, 170, 30], [676, 214, 34],
]

function elevation(x, y) {
  const ridge = Math.sin(y * 0.016 + x * 0.009 + Math.sin(x * 0.008) * 1.25)
  const valley = Math.sin(y * 0.012 - x * 0.017 + Math.sin(y * 0.013))
  const grain = Math.sin(x * 0.051 + y * 0.049) * Math.cos(x * 0.034 - y * 0.059)
  const detail = Math.cos(x * 0.098 - y * 0.08) * Math.sin(x * 0.13 + y * 0.093)
  return 0.52 + 0.22 * ridge + 0.16 * valley + 0.06 * grain + 0.024 * detail
}

function drawTerrain(context) {
  const pixels = context.createImageData(mapWidth, mapHeight)
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const height = elevation(x, y)
      const light = (height - elevation(x - 2, y - 2)) * 390
      const contour = height * 21 % 1 < 0.045 ? 12 : 0
      const index = (y * mapWidth + x) * 4
      pixels.data[index] = 22 + height * 80 + light + contour
      pixels.data[index + 1] = 39 + height * 80 + light + contour
      pixels.data[index + 2] = 41 + height * 68 + light + contour
      pixels.data[index + 3] = 255
    }
  }
  context.putImageData(pixels, 0, 0)

  const river = new Path2D('M -12 392 C 79 431 111 319 207 355 S 273 399 348 365 S 424 381 470 414 S 582 369 650 395 S 811 457 985 343')
  context.lineCap = 'round'
  context.strokeStyle = '#1d353e'
  context.lineWidth = 9
  context.stroke(river)
  context.strokeStyle = '#63878a'
  context.lineWidth = 2
  context.stroke(river)

  context.beginPath()
  for (let x = 0; x < mapWidth; x += 80) {
    context.moveTo(x, 0)
    context.lineTo(x, mapHeight)
  }
  for (let y = 0; y < mapHeight; y += 80) {
    context.moveTo(0, y)
    context.lineTo(mapWidth, y)
  }
  context.strokeStyle = '#c8d8cb21'
  context.lineWidth = 1
  context.stroke()

  context.fillStyle = '#d1ded1bb'
  context.font = '600 13px system-ui'
  context.fillText('NORTH RIDGE', 162, 155)
  context.fillText('CLEARWATER CREEK', 85, 416)
  context.fillText('EAST SUMMIT', 733, 136)
  context.fillText('▲  1,840 M', 750, 156)
  context.fillText('▲ N', 894, 44)

  context.fillStyle = '#e2e9dbd9'
  context.font = '11px system-ui'
  context.fillRect(797, 452, 102, 2)
  context.fillRect(797, 448, 2, 10)
  context.fillRect(897, 448, 2, 10)
  context.fillText('2 KM', 833, 475)
}

function perimeter(context, hour, scale) {
  const radius = (10 + hour * 4.1) * scale
  const centerX = ignition[0] + hour * 4.6
  const centerY = ignition[1] - hour * 2.6
  context.beginPath()
  for (let step = 0; step <= 140; step++) {
    const angle = step / 140 * Math.PI * 2
    const jagged = 1 + 0.18 * Math.sin(angle * 5 + 1) + 0.10 * Math.cos(angle * 9) + 0.06 * Math.sin(angle * 17)
    const major = Math.cos(angle) * radius * jagged * 1.33
    const minor = Math.sin(angle) * radius * jagged * 0.64
    const x = centerX + major * 0.84 + minor * 0.54
    const y = centerY - major * 0.54 + minor * 0.84
    if (step === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
}

function drawIncident(context, terrain, hour, showHotspots, showTeams) {
  context.drawImage(terrain, 0, 0)

  for (const scale of [1, 0.83, 0.62, 0.37]) {
    perimeter(context, hour, scale)
    context.fillStyle = scale === 1 ? '#e0472092' : '#f76f241f'
    context.strokeStyle = scale === 1 ? '#ff8847' : '#ffae604f'
    context.lineWidth = scale === 1 ? 2 : 1
    context.fill()
    context.stroke()
  }

  if (showTeams) {
    const droneX = 427 + hour * 6.6
    const droneY = 213 - hour * 2.7 + Math.cos(hour * 0.31) * 22
    context.setLineDash([5, 6])
    context.strokeStyle = '#86e0f1b9'
    context.lineWidth = 1.4
    context.beginPath()
    context.moveTo(369, 242)
    context.quadraticCurveTo(droneX - 43, droneY - 32, droneX, droneY)
    context.stroke()
    context.setLineDash([])
    context.fillStyle = '#95e4ef'
    context.beginPath()
    context.moveTo(droneX, droneY - 8)
    context.lineTo(droneX + 7, droneY + 6)
    context.lineTo(droneX, droneY + 3)
    context.lineTo(droneX - 7, droneY + 6)
    context.fill()
    context.font = '600 12px system-ui'
    context.fillText('DRONE 07', droneX + 12, droneY - 8)
    if (hour >= 27) {
      context.strokeStyle = '#95e4ef'
      context.lineWidth = 2
      context.setLineDash([5, 5])
      context.beginPath()
      context.moveTo(305, 357)
      context.quadraticCurveTo(395, 382, 476, 350)
      context.stroke()
      context.setLineDash([])
      context.fillText('CONTAINMENT LINE', 311, 395)
    }
  }

  if (showHotspots) {
    for (const [x, y, start] of hotspots) {
      if (hour < start) continue
      const isRecent = hour - start < 8
      context.beginPath()
      context.arc(x, y, isRecent ? 9 : 6, 0, Math.PI * 2)
      context.strokeStyle = isRecent ? '#ffd58d' : '#ffab586d'
      context.lineWidth = 1.2
      context.stroke()
      context.beginPath()
      context.arc(x, y, isRecent ? 3.2 : 2.1, 0, Math.PI * 2)
      context.fillStyle = isRecent ? '#ffe0a3' : '#ffa35f'
      context.fill()
    }
  }
}

export function mountWildfire(root) {
  root.innerHTML = `
    <section class="wildfire-demo" aria-label="山火推演">
      <header class="wf-heading">
        <div><p class="wf-eyebrow">FIRETRACE / INCIDENT REPLAY</p><h3>山火蔓延回放</h3></div>
        <span class="wf-badge">模拟数据</span>
      </header>
      <div class="wf-map">
        <canvas width="${mapWidth}" height="${mapHeight}" aria-label="合成山地地形，橙色区域标示火线，光点标示热点"></canvas>
        <div class="wf-map-label"><span></span> RIDGEVIEW · 事件 07</div>
      </div>
      <div class="wf-readouts">
        <div><span>过火面积</span><strong data-area></strong></div>
        <div><span>活跃热点</span><strong data-hotspots></strong></div>
        <div><span>当前事件</span><strong data-event></strong></div>
      </div>
      <div class="wf-controls">
        <button type="button" class="wf-play" aria-pressed="false">▶ 播放</button>
        <div class="wf-timeline">
          <label for="wf-time">事件时间轴 <output id="wf-clock" for="wf-time" aria-live="off"></output></label>
          <input id="wf-time" type="range" min="0" max="${duration}" step="0.1" value="18">
        </div>
      </div>
      <div class="wf-layers">
        <span>地图图层</span>
        <label><input type="checkbox" data-layer="hotspots" checked> 热点</label>
        <label><input type="checkbox" data-layer="teams" checked> 无人机与隔离带</label>
      </div>
    </section>
  `

  const canvas = root.querySelector('canvas')
  const context = canvas.getContext('2d')
  if (!context) return

  const terrain = document.createElement('canvas')
  terrain.width = mapWidth
  terrain.height = mapHeight
  drawTerrain(terrain.getContext('2d'))

  const slider = root.querySelector('#wf-time')
  const clock = root.querySelector('#wf-clock')
  const play = root.querySelector('.wf-play')
  const area = root.querySelector('[data-area]')
  const hotspotCount = root.querySelector('[data-hotspots]')
  const event = root.querySelector('[data-event]')
  const hotspotToggle = root.querySelector('[data-layer="hotspots"]')
  const teamToggle = root.querySelector('[data-layer="teams"]')
  const listeners = new AbortController()
  const options = { signal: listeners.signal }
  let hour = Number(slider.value)
  let frame = null
  let lastTime

  function update() {
    drawIncident(context, terrain, hour, hotspotToggle.checked, teamToggle.checked)
    const minutes = Math.round(hour * 60)
    clock.value = `T+${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
    slider.setAttribute('aria-valuetext', `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分`)
    slider.value = hour
    area.textContent = `${(0.06 + hour ** 1.72 * 0.078).toFixed(1)} km²`
    hotspotCount.textContent = hotspots.filter(([, , start]) => start <= hour && hour - start < 8).length
    event.textContent = milestones.findLast((point) => hour >= point.hour).label
  }

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    lastTime = undefined
    play.textContent = '▶ 播放'
    play.setAttribute('aria-pressed', 'false')
  }

  function tick(time) {
    if (lastTime !== undefined) hour = Math.min(duration, hour + Math.min(time - lastTime, 50) * 0.003)
    lastTime = time
    update()
    if (hour >= duration) stop()
    else frame = requestAnimationFrame(tick)
  }

  play.addEventListener('click', () => {
    if (frame !== null) {
      stop()
      return
    }
    if (hour >= duration) hour = 0
    play.textContent = 'Ⅱ 暂停'
    play.setAttribute('aria-pressed', 'true')
    frame = requestAnimationFrame(tick)
  }, options)

  slider.addEventListener('input', () => {
    stop()
    hour = Number(slider.value)
    update()
  }, options)
  hotspotToggle.addEventListener('change', update, options)
  teamToggle.addEventListener('change', update, options)
  update()

  return () => {
    stop()
    listeners.abort()
  }
}
