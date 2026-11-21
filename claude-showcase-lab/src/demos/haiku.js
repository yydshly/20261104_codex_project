import './haiku.css'

const duration = 7
const poems = [
  { title: '檐雨', motif: 'rain', lines: ['檐下雨成线', '小碗接住一片天', '圆纹推着圆'] },
  { title: '山雾', motif: 'mist', lines: ['晨雾进山门', '脚步惊醒一颗露', '松针还未落'] },
  { title: '梨花', motif: 'blossom', lines: ['梨花临石阶', '风把几朵吹进井', '井水白了一瞬'] },
  { title: '苔灯', motif: 'lantern', lines: ['石灯倚绿苔', '小径留给萤火走', '月从树后出'] },
  { title: '归舟', motif: 'water', lines: ['晚水起轻纹', '空船碰响旧木桩', '青山坐得稳'] },
  { title: '鹤影', motif: 'flight', lines: ['孤鹤过沙洲', '白翅掠低黄昏线', '芦花慢半拍'] },
  { title: '茶烟', motif: 'mist', lines: ['新茶一缕烟', '杯沿的光向上爬', '停在你的手'] },
  { title: '石榴', motif: 'blossom', lines: ['石榴开了缝', '秋光嵌在籽中间', '一颗滚过桌'] },
  { title: '秋墨', motif: 'leaves', lines: ['枫叶压书角', '暮色从纸边渗入', '墨还湿一行'] },
  { title: '灯窗', motif: 'lantern', lines: ['窗纸透微黄', '夜蛾停在灯影里', '墙上两个月'] },
  { title: '雪竹', motif: 'snow', lines: ['小雪弯新竹', '风来松开半枝白', '落地声很轻'] },
  { title: '薄冰', motif: 'water', lines: ['清溪初结冰', '一尾鱼游过云影', '天光有裂痕'] },
  { title: '夜鸦', motif: 'flight', lines: ['暮鸦过枯枝', '远树接住黑翅膀', '雪没有说话'] },
  { title: '松雪', motif: 'snow', lines: ['松枝抖旧雪', '地上多了一行印', '不见来时鸟'] },
  { title: '风铃', motif: 'rain', lines: ['北窗风铃细', '雨声把每一响隔开', '像几枚玻璃'] },
  { title: '草籽', motif: 'leaves', lines: ['草籽攀衣袖', '沿着土路跟我走', '在门前下车'] },
  { title: '夜航', motif: 'water', lines: ['微灯过暗潮', '船头把两星划开', '身后又合拢'] },
  { title: '新芽', motif: 'blossom', lines: ['细芽顶湿土', '蚂蚁绕行一小步', '春天才到齐'] },
  { title: '留白', motif: 'mist', lines: ['山色退纸背', '笔尖悬着一滴水', '等风写下文'] },
  { title: '纸月', motif: 'lantern', lines: ['纸上画圆月', '留给一枝梅遮住', '人从画外过'] },
]

const palettes = [
  ['#e4e9e3', '#bacdc1', '#203d43', '#466b6d', '#cd734d'],
  ['#eae8d9', '#c8d5ba', '#2e473c', '#597664', '#b17b53'],
  ['#f8e8e4', '#d9bfb6', '#52383e', '#865b69', '#bd526e'],
  ['#191d2b', '#34364f', '#fcdfb4', '#979aba', '#e4a55f'],
  ['#f1dac2', '#c2aa99', '#453839', '#63596b', '#cb704e'],
  ['#ebe1cc', '#c5beaa', '#453b3e', '#786f76', '#a45a45'],
  ['#ebd9be', '#bca78d', '#48382f', '#7f6956', '#af583f'],
  ['#f3dad1', '#cfaca3', '#572d35', '#88545d', '#b74245'],
  ['#f0d9b6', '#c49a7d', '#55352e', '#82614b', '#ad4c37'],
  ['#282134', '#4c3c4d', '#fde9c7', '#b496a6', '#f6ad70'],
  ['#e2e8ee', '#b7c9d6', '#28405a', '#59788d', '#f7faff'],
  ['#dce9e6', '#a5c2c6', '#2a464e', '#4d7881', '#f2f5ef'],
  ['#d5d9e5', '#a2abc1', '#252f48', '#4f5f7d', '#707498'],
  ['#e1e8e7', '#adbec0', '#2c4348', '#526e77', '#f4f7ee'],
  ['#e5e4e0', '#bfc1c4', '#353c4e', '#667188', '#aa715c'],
  ['#eae5c8', '#c3c298', '#43472f', '#69724b', '#998655'],
  ['#172938', '#28495e', '#f4e3be', '#81a5ad', '#eec681'],
  ['#e9ecd3', '#bbcb9d', '#3d4932', '#648453', '#c19560'],
  ['#efe9dd', '#c4beb7', '#373435', '#77737a', '#b27a68'],
  ['#eee3d3', '#c7b9ac', '#4a3b43', '#716778', '#b56b6d'],
]

function randomFrom(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function ellipse(ctx, x, y, rx, ry, color, rotation = 0) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2)
  ctx.fill()
}

function drawRidge(ctx, y, color, index, layer) {
  const random = randomFrom(315 + index * 17 + layer * 97)
  ctx.beginPath()
  ctx.moveTo(0, y)
  for (let x = 0; x <= 1080; x += 90) {
    const nextY = y - random() * (55 + 29 * layer)
    ctx.quadraticCurveTo(x - 42, nextY, x, nextY)
  }
  ctx.lineTo(1080, 530)
  ctx.lineTo(0, 530)
  ctx.fillStyle = color
  ctx.fill()
}

function drawBranches(ctx, style, index, t, ink, accent) {
  const random = randomFrom(100 + index * 19)
  const sway = Math.sin(t * .66) * 7
  const bamboo = style === 'snow'
  ctx.lineCap = 'round'
  for (let branch = 0; branch < 5; branch++) {
    const x = 555 + branch * 107
    const height = 150 + random() * 172
    const lean = (random() - .43) * 165 + sway
    ctx.beginPath()
    ctx.moveTo(x, 499)
    ctx.quadraticCurveTo(x + lean * .25, 468 - height * .6, x + lean, 499 - height)
    ctx.strokeStyle = ink + 'bd'
    ctx.lineWidth = bamboo ? 3 : 2.5
    ctx.stroke()
    for (let twig = 1; twig < 8; twig++) {
      const side = twig % 2 ? 1 : -1
      const fraction = twig / 9
      const stemX = x + lean * fraction ** 1.5
      const stemY = 499 - height * fraction
      const tipX = stemX + side * (24 + random() * 45)
      const tipY = stemY - 15 - random() * 40
      ctx.beginPath()
      ctx.moveTo(stemX, stemY)
      ctx.quadraticCurveTo(stemX + side * 15, stemY - 2, tipX, tipY)
      ctx.lineWidth = 1.15
      ctx.stroke()
      if (style === 'blossom') {
        for (let petal = 0; petal < 5; petal++) {
          const angle = petal * Math.PI * 2 / 5
          ellipse(ctx, tipX + 6 * Math.cos(angle), tipY + 6 * Math.sin(angle), 5.5, 3, accent + 'b3', angle)
        }
        ellipse(ctx, tipX, tipY, 2, 2, ink + 'a1')
      } else {
        ellipse(ctx, tipX, tipY, bamboo ? 12 : 9, 3.8, accent + 'cc', side * -.5)
      }
    }
  }
}

function drawWater(ctx, time, ink, accent, boat) {
  ctx.lineWidth = 1
  for (let line = 0; line < 19; line++) {
    const y = 304 + line * 11
    const start = 340 + (line * 107) % 460
    const width = 52 + (line * 39) % 280
    const displacement = Math.sin(time * .7 + line) * 15
    ctx.beginPath()
    ctx.moveTo(start + displacement, y)
    ctx.quadraticCurveTo(start + width * .5, y - 4, start + width + displacement, y + 1)
    ctx.strokeStyle = ink + '58'
    ctx.stroke()
  }
  if (!boat) return
  const x = 742 + Math.sin(time * .29) * 32
  const y = 386 + Math.sin(time * 1.2) * 3
  ctx.beginPath()
  ctx.moveTo(x - 58, y)
  ctx.quadraticCurveTo(x + 4, y + 10, x + 57, y - 2)
  ctx.quadraticCurveTo(x + 40, y + 20, x + 25, y + 20)
  ctx.lineTo(x - 37, y + 20)
  ctx.closePath()
  ctx.fillStyle = ink + 'cc'
  ctx.fill()
  ctx.strokeStyle = ink
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y + 5)
  ctx.lineTo(x + 3, y - 62)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + 3, y - 61)
  ctx.quadraticCurveTo(x + 14, y - 44, x + 36, y - 19)
  ctx.lineTo(x + 2, y - 17)
  ctx.fillStyle = accent + 'bf'
  ctx.fill()
}

function drawFlight(ctx, time, ink) {
  for (let bird = 0; bird < 4; bird++) {
    const x = 570 + bird * 73 + time * 13
    const y = 177 + Math.sin(bird) * 33 - time * 2
    const flap = Math.sin(time * 4 + bird * 2) * 9
    ctx.beginPath()
    ctx.moveTo(x - 26, y - 7 + flap)
    ctx.quadraticCurveTo(x - 11, y - 14 + flap, x, y)
    ctx.quadraticCurveTo(x + 10, y - 13 + flap, x + 25, y - 9 + flap)
    ctx.strokeStyle = ink + 'dc'
    ctx.lineWidth = bird === 0 ? 2.8 : 1.7
    ctx.stroke()
  }
}

function drawLantern(ctx, time, ink, accent) {
  const x = 783 + Math.sin(time * .6) * 9
  const y = 259 + Math.sin(time * .9) * 4
  const glow = ctx.createRadialGradient(x, y, 8, x, y, 100)
  glow.addColorStop(0, accent + '9e')
  glow.addColorStop(1, accent + '00')
  ellipse(ctx, x, y, 100, 100, glow)
  ctx.strokeStyle = ink + '7e'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(782, 0)
  ctx.lineTo(x, y - 31)
  ctx.stroke()
  ellipse(ctx, x, y, 35, 27, accent)
  ctx.strokeStyle = ink + '88'
  for (const width of [12, 24, 35]) {
    ctx.beginPath()
    ctx.ellipse(x, y, width, 27, 0, 0, 2 * Math.PI)
    ctx.stroke()
  }
  ctx.fillStyle = ink
  ctx.fillRect(x - 14, y - 29, 28, 4)
  ctx.fillRect(x - 14, y + 25, 28, 4)
}

function drawParticles(ctx, style, index, time, ink, accent) {
  const random = randomFrom(2009 + index * 13)
  for (let particle = 0; particle < 75; particle++) {
    const startX = 340 + random() * 660
    const startY = random() * 500
    const size = .7 + random() * 2.9
    const drift = style === 'rain' ? 95 : 12 + size * 8
    const x = startX + Math.sin(time * .6 + particle) * 16
    const y = (startY + time * drift) % 500
    if (style === 'rain') {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 5, y + 12 + size * 4)
      ctx.strokeStyle = ink + '41'
      ctx.lineWidth = .8
      ctx.stroke()
    } else if (style === 'leaves' || style === 'blossom') {
      ellipse(ctx, x, y, size * 1.6, size * .8, accent + '91', time * .7 + particle)
    } else {
      ellipse(ctx, x, y, size, size, accent + (style === 'snow' ? 'd5' : '61'))
    }
  }
}

function paint(canvas, index, time) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const [paper, wash, ink, ridge, accent] = palettes[index]
  const { motif } = poems[index]
  const scale = Math.max(canvas.width / 1000, canvas.height / 500)
  ctx.setTransform(scale, 0, 0, scale, canvas.width - 1000 * scale, (canvas.height - 500 * scale) * .5)
  const gradient = ctx.createLinearGradient(0, 0, 1000, 500)
  gradient.addColorStop(0, paper)
  gradient.addColorStop(.5, paper)
  gradient.addColorStop(1, wash)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1000, 500)
  const sunX = 770 + Math.sin(time * .29) * 15
  const sunY = 132 - time * 1.6
  if (motif !== 'lantern') {
    ellipse(ctx, sunX, sunY, 53, 53, accent + '3d')
    ellipse(ctx, sunX, sunY, 45, 45, accent + 'a8')
  }
  drawRidge(ctx, 365, ridge + '3d', index, 1)
  drawRidge(ctx, 410, ridge + '48', index, 2)
  drawRidge(ctx, 475, ink + '24', index, 3)
  if (motif === 'water' || motif === 'rain') drawWater(ctx, time, ink, accent, motif === 'water')
  if (motif === 'blossom' || motif === 'leaves' || motif === 'snow') drawBranches(ctx, motif, index, time, ink, accent)
  if (motif === 'flight') drawFlight(ctx, time, ink)
  if (motif === 'lantern') drawLantern(ctx, time, ink, accent)
  drawParticles(ctx, motif, index, time, ink, accent)
}

export function mountHaiku(root) {
  const total = poems.length * duration
  let position = 0
  let current = -1
  let frame
  let lastTime = 0
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  root.innerHTML = `
    <div class="poem-player">
      <div class="poem-player__scene">
        <canvas aria-hidden="true"></canvas>
        <div class="poem-player__text">
          <div class="poem-player__stamp" aria-hidden="true">句</div>
          <p class="poem-player__number"></p>
          <div class="poem-player__poem">
            <strong></strong>
            <p></p>
          </div>
        </div>
      </div>
      <div class="poem-player__controls">
        <div class="poem-player__buttons">
          <button type="button" data-player="previous" aria-label="上一首">‹</button>
          <button type="button" data-player="toggle"></button>
          <button type="button" data-player="next" aria-label="下一首">›</button>
        </div>
        <input type="range" min="0" max="${total}" step="0.1" value="0" aria-label="动画播放进度">
        <span class="poem-player__time" aria-hidden="true"></span>
      </div>
      <div class="poem-player__list" role="group" aria-label="选一首俳句">
        ${poems.map(({ title }, index) => `<button type="button" data-poem="${index}" aria-pressed="false">${title}</button>`).join('')}
      </div>
    </div>`
  const scene = root.querySelector('.poem-player__scene')
  const canvas = scene.querySelector('canvas')
  const title = scene.querySelector('strong')
  const copy = scene.querySelector('.poem-player__poem p')
  const number = scene.querySelector('.poem-player__number')
  const slider = root.querySelector('input[type="range"]')
  const displayTime = root.querySelector('.poem-player__time')
  const controls = root.querySelector('.poem-player__buttons')
  const previous = controls.querySelector('[data-player="previous"]')
  const next = controls.querySelector('[data-player="next"]')
  const toggle = controls.querySelector('[data-player="toggle"]')
  const poemList = root.querySelector('.poem-player__list')
  const poemButtons = [...poemList.querySelectorAll('button')]

  function updateToggle() {
    toggle.textContent = playing ? '暂停' : '播放'
    toggle.setAttribute('aria-label', playing ? '暂停动画' : '播放动画')
  }

  function render() {
    const index = Math.min(poems.length - 1, Math.floor(position / duration))
    if (current !== index) {
      poemButtons[current]?.setAttribute('aria-pressed', 'false')
      current = index
      poemButtons[current].setAttribute('aria-pressed', 'true')
      const poem = poems[current]
      title.textContent = poem.title
      copy.textContent = poem.lines.join('\n')
      number.textContent = `俳句 ${String(current + 1).padStart(2, '0')} / ${poems.length}`
      scene.style.setProperty('--poem-paper', palettes[current][0])
      scene.style.setProperty('--poem-ink', palettes[current][2])
      previous.disabled = current === 0
      next.disabled = current === poems.length - 1
    }
    const seconds = Math.floor(position)
    const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
    slider.value = String(position)
    slider.setAttribute('aria-valuetext', `${poems[current].title}，${time}`)
    displayTime.textContent = time
    paint(canvas, current, position - current * duration)
  }

  function tick(now) {
    position = Math.min(total, position + (lastTime ? Math.min((now - lastTime) / 1000, .1) : 0))
    lastTime = now
    render()
    if (position === total) {
      playing = false
      updateToggle()
      return
    }
    frame = window.requestAnimationFrame(tick)
  }

  function seek(value) {
    position = Math.max(0, Math.min(total, value))
    render()
  }

  controls.addEventListener('click', event => {
    const action = event.target.closest('[data-player]')?.dataset.player
    if (action === 'previous') seek((current - 1) * duration)
    if (action === 'next') seek((current + 1) * duration)
    if (action !== 'toggle') return
    playing = !playing
    if (playing) {
      if (position >= total) seek(0)
      lastTime = 0
      frame = window.requestAnimationFrame(tick)
    } else {
      window.cancelAnimationFrame(frame)
    }
    updateToggle()
  })
  slider.addEventListener('input', () => seek(slider.valueAsNumber))
  poemList.addEventListener('click', event => {
    const button = event.target.closest('[data-poem]')
    if (button) seek(Number(button.dataset.poem) * duration)
  })
  const observer = new ResizeObserver(() => {
    const ratio = Math.min(window.devicePixelRatio, 2)
    const { width, height } = scene.getBoundingClientRect()
    canvas.width = Math.max(1, Math.round(width * ratio))
    canvas.height = Math.max(1, Math.round(height * ratio))
    render()
  })
  observer.observe(scene)
  updateToggle()
  render()
  if (playing) frame = window.requestAnimationFrame(tick)

  return () => {
    window.cancelAnimationFrame(frame)
    observer.disconnect()
  }
}
