export const clampRopeValue = (value, min, max) => Math.min(max, Math.max(min, value))

export function createRope(start, end, { segments = 12, slack = .06, sag = 0 } = {}) {
  const length = Math.hypot(end.x - start.x, end.y - start.y) * (1 + slack) / segments
  const points = Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments
    const x = start.x + (end.x - start.x) * progress
    const y = start.y + (end.y - start.y) * progress + Math.sin(progress * Math.PI) * sag
    return { x, y, previousX: x, previousY: y }
  })
  return { points, length }
}

export function advanceRope(rope, { gravity, damping = .94, passes = 6, lengthScale = 1, force }) {
  const { points, length } = rope
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]
    const dx = (point.x - point.previousX) * damping
    const dy = (point.y - point.previousY) * damping
    point.previousX = point.x
    point.previousY = point.y
    point.x += dx
    point.y += dy + gravity + (force?.(index / (points.length - 1)) ?? 0)
  }

  const rest = length * lengthScale
  for (let pass = 0; pass < passes; pass += 1) {
    for (let index = 0; index < points.length - 1; index += 1) {
      const a = points[index]
      const b = points[index + 1]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distance = Math.hypot(dx, dy) || 1
      const correction = (distance - rest) / distance
      const firstWeight = index === 0 ? 0 : index === points.length - 2 ? 1 : .5
      const secondWeight = 1 - firstWeight
      a.x += dx * correction * firstWeight
      a.y += dy * correction * firstWeight
      b.x -= dx * correction * secondWeight
      b.y -= dy * correction * secondWeight
    }
  }
}

export function pushRope(rope, position, radius, amount) {
  const { points } = rope
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]
    const dx = point.x - position.x
    const dy = point.y - position.y
    const distance = Math.max(Math.hypot(dx, dy), .1)
    if (distance >= radius) continue
    const force = (1 - distance / radius) * amount
    point.x += (dx / distance) * force
    point.y += (dy / distance) * force
  }
}

export function sampleRope(rope, position) {
  const { points } = rope
  const index = clampRopeValue(position, 0, 1) * (points.length - 1)
  const from = points[Math.floor(index)]
  const to = points[Math.ceil(index)]
  const mix = index % 1
  return { x: from.x + (to.x - from.x) * mix, y: from.y + (to.y - from.y) * mix }
}

export function drawRope(context, rope) {
  const { points } = rope
  context.beginPath()
  context.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index]
    const next = points[index + 1]
    context.quadraticCurveTo(previous.x, previous.y, (previous.x + next.x) / 2, (previous.y + next.y) / 2)
  }
  const end = points.at(-1)
  context.lineTo(end.x, end.y)
  context.stroke()
}
