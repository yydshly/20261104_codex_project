import { advanceRope, clampRopeValue as clamp, createRope, drawRope, pushRope, sampleRope } from './ropePhysics.js'

const TAU = Math.PI * 2
const pointsDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

function ellipse(context, x, y, rx, ry, fill) {
  context.beginPath()
  context.ellipse(x, y, rx, ry, 0, 0, TAU)
  context.fillStyle = fill
  context.fill()
}

function drawFly(context, point, heading, time, calm) {
  context.save()
  context.translate(point.x, point.y)
  context.rotate(heading)
  const size = calm ? 1 : .78 + .22 * Math.abs(Math.sin(time / 35))
  context.save()
  context.rotate(.45)
  ellipse(context, -4, -3, 8, 3.3 * size, '#e4f2ffaf')
  context.rotate(-.90)
  ellipse(context, -4, 3, 8, 3.3 * size, '#e4f2ffaf')
  context.restore()
  ellipse(context, -2, 0, 6.4, 3.1, '#17223b')
  ellipse(context, 3, 0, 3.3, 2.8, '#444e69')
  ellipse(context, 5, -1.4, 1.3, 1.0, '#ec9667')
  ellipse(context, 5, 1.4, 1.3, 1.0, '#ec9667')
  context.restore()
}

function drawSpider(context, spider, scale) {
  const { x, y, heading, phase, lift, idle } = spider
  context.save()
  context.translate(x + 3, y + 5)
  ellipse(context, 0, 0, 25 * scale * (1 + lift * .007), 13 * scale, `rgb(3 14 53 / ${.25 - lift * .002})`)
  context.restore()

  context.save()
  context.translate(x, y - lift)
  context.rotate(heading)
  context.scale(scale * (1 + lift * .003), scale * (1 + lift * .003))
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const side of [-1, 1]) {
    for (let leg = 0; leg < 4; leg += 1) {
      const beat = Math.sin(phase + leg * 1.9 + side * 1.4) * (idle ? 0 : 5.5)
      const hipX = 10 - leg * 5.5
      const kneeX = 22 - leg * 13
      const kneeY = side * (16 + leg * 1.0)
      const footX = 30 - leg * 21 + beat
      const footY = side * (25 - Math.abs(leg - 1.5) * 1.4 + Math.abs(beat) * .55)
      context.beginPath()
      context.moveTo(hipX, side * 5)
      context.lineTo(kneeX, kneeY)
      context.lineTo(footX, footY)
      context.lineWidth = 5.1
      context.strokeStyle = '#251f22'
      context.stroke()
      context.lineWidth = 2.3
      context.strokeStyle = leg % 2 ? '#a68a6c' : '#d1b38c'
      context.stroke()
      ellipse(context, kneeX, kneeY, 2.5, 2.4, '#523d30')
      context.strokeStyle = '#f3d6b28c'
      context.lineWidth = .54
      context.beginPath()
      for (let hair = 1; hair < 7; hair += 1) {
        const ratio = hair / 7
        const hairX = hipX + (kneeX - hipX) * ratio
        const hairY = side * 5 + (kneeY - side * 5) * ratio
        context.moveTo(hairX, hairY)
        context.lineTo(hairX - 2.5, hairY + side * 2.8)
      }
      context.stroke()
    }
  }

  const abdomen = context.createRadialGradient(-14, -6, 2, -11, 0, 18)
  abdomen.addColorStop(0, '#dfc1a0')
  abdomen.addColorStop(.5, '#8a6d56')
  abdomen.addColorStop(1, '#312320')
  ellipse(context, -11, 0, 16, 12, abdomen)
  context.strokeStyle = '#f5dfba66'
  context.lineWidth = 1.5
  for (const stripe of [-17, -11, -5]) {
    context.beginPath()
    context.moveTo(stripe - 3, -8)
    context.quadraticCurveTo(stripe + 4, 0, stripe - 3, 8)
    context.stroke()
  }
  const head = context.createRadialGradient(4, -4, 1, 8, 0, 13)
  head.addColorStop(0, '#b3a18a')
  head.addColorStop(1, '#302629')
  ellipse(context, 9, 0, 11, 9.7, head)
  for (const side of [-1, 1]) {
    ellipse(context, 16.4, side * 3.6, 4.1, idle ? 2.2 : 3.6, '#0f1221')
    ellipse(context, 17.8, side * 3.6 - 1.1, 1.2, .85, '#f7fafb')
    ellipse(context, 18.1, side * 7.0, 2.1, 1.7, '#5d4a3f')
  }
  context.restore()
}

export function createWebScene(width, height) {
  const locations = [[.08,.23], [.24,.16], [.47,.22], [.69,.14], [.91,.28], [.83,.50], [.89,.74], [.64,.78], [.46,.69], [.19,.73], [.07,.54], [.31,.42], [.70,.39]]
  const anchors = locations.map(([x, y]) => ({ x: x * width, y: y * height }))
  const spider = { x: width * .46, y: height * .51, heading: -.1, phase: 0, lift: 0, idle: true }
  let threads = []
  let pointer = { x: width * .58, y: height * .44 }
  let fly = { ...pointer, heading: 0 }
  let visible = false
  let lastAnchor = 11
  let wovenDistance = 0
  let jump = null

  const isWoven = (first, second) => threads.some(({ id }) => id === `${first}:${second}` || id === `${second}:${first}`)

  function weave(first, second) {
    if (first === second || isWoven(first, second)) return
    const span = pointsDistance(anchors[first], anchors[second])
    const rope = createRope(anchors[first], anchors[second], { segments: 12, slack: .025, sag: Math.min(20, span * .065) })
    threads.push({ id: `${first}:${second}`, rope })
    if (threads.length > 28) threads.shift()
  }

  function nearestAnchor(point, excluded, fresh = false) {
    let best = -1
    let distance = Infinity
    anchors.forEach((anchor, index) => {
      if (index === excluded || (fresh && isWoven(excluded, index))) return
      const separation = pointsDistance(anchor, point)
      if (separation < distance) { best = index; distance = separation }
    })
    return best < 0 && fresh ? nearestAnchor(point, excluded) : best
  }

  for (const [start, end] of [[1,11],[11,9],[11,8],[11,12],[12,3],[12,5],[12,7]]) weave(start, end)

  return {
    point(x, y) { pointer = { x: clamp(x, 12, width - 12), y: clamp(y, 42, height - 58) }; visible = true },
    leave() { visible = false },
    pounce() {
      if (!visible || jump) return
      jump = { ticks: 0, from: { x: spider.x, y: spider.y }, target: { ...pointer } }
    },
    reset() { threads = []; wovenDistance = 0; jump = null; visible = false; spider.lift = 0; lastAnchor = nearestAnchor(spider) },
    update(calm) {
      if (visible) {
        const fx = pointer.x - fly.x
        const fy = pointer.y - fly.y
        if (Math.hypot(fx, fy) > .5) fly.heading = Math.atan2(fy, fx)
        fly.x += fx * (calm ? 1 : .29)
        fly.y += fy * (calm ? 1 : .29)
      }

      let travel = 0
      if (jump) {
        jump.ticks += calm ? 24 : 1
        const progress = clamp(jump.ticks / 24, 0, 1)
        const dx = jump.target.x - jump.from.x
        const dy = jump.target.y - jump.from.y
        spider.heading = Math.atan2(dy, dx)
        spider.x = jump.from.x + dx * progress
        spider.y = jump.from.y + dy * progress
        spider.lift = Math.sin(progress * Math.PI) * Math.min(52, 13 + Math.hypot(dx, dy) * .22)
        if (progress >= 1) {
          spider.lift = 0
          const next = nearestAnchor(spider, lastAnchor, true)
          weave(lastAnchor, next)
          weave(next, nearestAnchor(fly, next))
          lastAnchor = next
          threads.forEach(({ rope }) => pushRope(rope, spider, 120, 10))
          jump = null
        }
      } else if (visible) {
        const distance = pointsDistance(fly, spider)
        const gap = Math.min(67, width * .13)
        if (distance > gap) {
          const dx = fly.x - spider.x
          const dy = fly.y - spider.y
          const heading = Math.atan2(dy, dx)
          const difference = Math.atan2(Math.sin(heading - spider.heading), Math.cos(heading - spider.heading))
          spider.heading += difference * (calm ? 1 : .25)
          travel = calm ? distance - gap : Math.min(5.2, (distance - gap) * .10)
          spider.x += dx * travel / distance
          spider.y += dy * travel / distance
          wovenDistance += travel
          if (wovenDistance > 44) {
            const next = nearestAnchor(spider, lastAnchor, true)
            weave(lastAnchor, next)
            lastAnchor = next
            wovenDistance = 0
          }
        }
      }
      spider.idle = calm || travel < .35
      spider.phase += travel * .14

      threads.forEach(({ rope }) => {
        if (visible) pushRope(rope, fly, 37, calm ? 1.4 : 3.7)
        advanceRope(rope, { gravity: .13, damping: calm ? 0 : .93, passes: calm ? 10 : 5 })
      })
    },
    draw(context, time, calm) {
      const spiderScale = clamp(Math.min(width / 760, height / 360), .76, 1.20)
      context.clearRect(0, 0, width, height)
      threads.forEach(({ rope }, index) => {
        context.strokeStyle = index % 3 ? '#d1ddffbd' : '#f4f5ffe0'
        context.lineWidth = index % 3 ? .72 : 1.12
        drawRope(context, rope)
        for (const fraction of [.20, .49, .78]) {
          const point = sampleRope(rope, fraction)
          ellipse(context, point.x, point.y, .95, 1.12, '#e4ecffde')
        }
      })
      if (visible && threads.length > 0) {
        const anchor = anchors[lastAnchor]
        context.strokeStyle = '#e8edff8f'
        context.lineWidth = .75
        context.beginPath()
        context.moveTo(anchor.x, anchor.y)
        context.quadraticCurveTo((anchor.x + spider.x) / 2, (anchor.y + spider.y) / 2 + 9, spider.x, spider.y)
        context.stroke()
      }
      if (visible) drawFly(context, fly, fly.heading, time, calm)
      drawSpider(context, spider, spiderScale)
    },
    read() { return { strands: threads.length, spiderX: spider.x / width, spiderY: spider.y / height, jumping: Boolean(jump) } },
  }
}

function line(context, x1, y1, x2, y2) {
  context.beginPath()
  context.moveTo(x1, y1)
  context.lineTo(x2, y2)
  context.stroke()
}

export function createBridgeScene(width, height) {
  const start = { x: width * .15, y: height * .25 }
  const end = { x: width * .85, y: start.y }
  const deck = height * .70
  const span = end.x - start.x
  const proportions = (height / span) ** 2
  const ropeShape = { segments: 24, slack: Math.min(.033, proportions * .095), sag: Math.min(height * .14, span * .10) }
  const rope = createRope(start, end, ropeShape)
  const reference = createRope(start, end, ropeShape)
  const g = Math.min(height / 400, width / 850)
  const unloaded = { gravity: .13 * g, passes: 14, damping: .88 }
  let load = .30
  let position = .50
  let lastSag = 0
  let settling = false
  let quietFrames = 0
  for (let tick = 0; tick < 180; tick += 1) {
    advanceRope(reference, unloaded)
    advanceRope(rope, unloaded)
  }

  function deflection(progress) {
    return Math.exp(-1 * ((progress - position) / .17) ** 2) * load * height * .034
  }

  return {
    fraction(x) { return clamp((x - start.x) / span, .08, .92) },
    update(targetLoad, targetPosition, calm) {
      load += (targetLoad - load) * (calm ? 1 : .115)
      position += (targetPosition - position) * (calm ? 1 : .19)
      const settings = {
        gravity: unloaded.gravity, passes: calm ? 20 : 13, damping: calm ? .48 : .935,
        lengthScale: 1 + load * Math.min(.095, .12 * proportions),
        force: (progress) => Math.exp(-1 * ((progress - position) / .105) ** 2) * load * g * 1.9,
      }
      for (let tick = 0; tick < (calm ? 4 : 1); tick += 1) advanceRope(rope, settings)
      const sag = Math.max(...rope.points.map((point) => point.y)) - start.y
      const moving = Math.abs(lastSag - sag) > .065 || Math.abs(targetLoad - load) > .002 || Math.abs(targetPosition - position) > .002
      quietFrames = moving ? 0 : quietFrames + 1
      settling = !calm && quietFrames < 8
      lastSag = sag
    },
    draw(context) {
      context.clearRect(0, 0, width, height)
      const scale = Math.max(.55, g)
      const pierWidth = 13 * scale
      const bottom = height * .79
      const ground = height * .815
      context.lineCap = 'round'
      context.strokeStyle = '#99c8d338'
      context.lineWidth = 1
      context.setLineDash([4, 5])
      line(context, width * .08, start.y, width * .92, start.y)
      line(context, width * .08, ground, width * .92, ground)
      context.strokeStyle = '#9db6cb92'
      drawRope(context, reference)
      context.setLineDash([])
      for (const tower of [start, end]) {
        context.fillStyle = '#7296a5'
        context.fillRect(tower.x - pierWidth / 2, tower.y - 5, pierWidth, bottom - tower.y + 5)
        context.fillStyle = '#adc0c9'
        context.fillRect(tower.x - pierWidth * .37, tower.y, pierWidth * .26, bottom - tower.y)
        context.fillStyle = '#506e7d'
        context.fillRect(tower.x - pierWidth, bottom - 4, pierWidth * 2, 7)
        ellipse(context, tower.x, tower.y, 4.5 * scale, 4.5 * scale, '#e0edf2')
      }
      for (let index = 1; index < 18; index += 1) {
        const fraction = index / 18
        const anchor = sampleRope(rope, fraction)
        const edgeX = start.x + span * fraction
        context.strokeStyle = Math.abs(fraction - position) < .09 ? '#e4ca90b0' : '#9ad3c68f'
        context.lineWidth = 1.1
        line(context, anchor.x, anchor.y, edgeX, deck + deflection(fraction))
      }
      context.lineWidth = 2.7
      context.strokeStyle = '#b3e7d7'
      drawRope(context, rope)

      context.lineWidth = 6.5 * scale
      context.strokeStyle = '#d2dce2'
      context.beginPath()
      context.moveTo(start.x - width * .045, deck)
      for (let index = 0; index <= 32; index += 1) {
        const fraction = index / 32
        context.lineTo(start.x + span * fraction, deck + deflection(fraction))
      }
      context.lineTo(end.x + width * .045, deck)
      context.stroke()

      const weightX = start.x + span * position
      const weightY = deck + deflection(position)
      const weightWidth = (30 + load * 17) * scale
      const weightHeight = (19 + load * 13) * scale
      context.fillStyle = '#ebbb69'
      context.beginPath()
      context.roundRect(weightX - weightWidth / 2, weightY - weightHeight - 4, weightWidth, weightHeight, 4)
      context.fill()
      context.strokeStyle = '#fff1c699'
      context.lineWidth = 1.2
      line(context, weightX - weightWidth * .30, weightY - weightHeight * .75, weightX + weightWidth * .30, weightY - weightHeight * .75)
      context.fillStyle = '#0f2833'
      context.font = `600 ${Math.max(9, 11 * scale)}px system-ui`
      context.textAlign = 'center'
      context.fillText('↔', weightX, weightY - weightHeight * .33)
    },
    read() { return { sag: lastSag / height, settling } },
  }
}
