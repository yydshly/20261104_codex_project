export function smooth(points) {
  const samples = []
  for (let index = 0; index < points.length - 1; index++) {
    const before = points[Math.max(0, index - 1)]
    const start = points[index]
    const end = points[index + 1]
    const after = points[Math.min(points.length - 1, index + 2)]
    for (let step = 0; step < 7; step++) {
      const t = step / 7
      samples.push(start.map((a, axis) => {
        const p = before[axis]
        const b = end[axis]
        const q = after[axis]
        return 0.5 * (2 * a + (b - p) * t + (2 * p - 5 * a + 4 * b - q) * t ** 2 + (3 * a - p - 3 * b + q) * t ** 3)
      }))
    }
  }
  return [...samples, points.at(-1)]
}

export function camera(yaw, pitch, perspective) {
  const yawAngle = yaw * Math.PI / 180
  const pitchAngle = pitch * Math.PI / 180
  const cy = Math.cos(yawAngle)
  const sy = Math.sin(yawAngle)
  const cp = Math.cos(pitchAngle)
  const sp = Math.sin(pitchAngle)

  return ([x, y, z]) => {
    const xRotated = x * cy + z * sy
    const zRotated = z * cy - x * sy
    const depth = y * sp + zRotated * cp
    const size = perspective ? 380 / (380 - depth) : 1
    return [140 + xRotated * size * 1.12, 123 + (y * cp - zRotated * sp) * size * 1.12, depth]
  }
}
