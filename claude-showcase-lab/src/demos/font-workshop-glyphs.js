import { Font, Glyph, Path } from 'opentype.js'

export const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const baseline = 82
export const penWidth = 3

const examples = {
  A: '19,82 47,21 57,23 82,81|31,58 67,57',
  B: '25,82 26,22 53,22 66,27 71,37 66,48 49,52 28,52|49,52 68,55 75,64 71,76 57,82 25,82',
  C: '76,30 65,23 50,21 35,27 24,40 21,56 25,70 36,80 51,83 67,79 77,71',
  D: '25,82 26,22 48,22 63,27 74,40 77,54 72,68 62,78 48,82 25,82',
  E: '75,22 27,23 25,81 75,81|27,51 65,50',
  F: '25,82 27,22 76,22|27,51 65,50',
  G: '77,31 66,23 51,21 35,27 24,40 21,55 26,71 39,81 55,82 71,76 77,67 77,56 55,56',
  H: '24,22 23,82|76,22 74,82|25,51 75,50',
  I: '30,23 68,22|50,23 48,81|29,82 69,81',
  J: '34,23 73,22|64,23 64,65 58,77 46,82 33,79 26,71',
  K: '26,22 25,82|76,23 28,58|48,46 78,82',
  L: '28,22 26,81 76,82',
  M: '21,82 25,22 50,61 75,21 80,82',
  N: '24,82 25,22 76,81 77,22',
  O: '49,22 35,25 24,36 19,53 24,70 35,80 51,83 67,79 78,68 82,51 77,35 65,25 49,22',
  P: '26,82 27,22 53,22 67,26 74,36 72,48 61,55 28,55',
  Q: '49,22 35,25 24,36 19,53 24,70 35,80 51,83 67,79 78,68 82,51 77,35 65,25 49,22|55,67 79,89',
  R: '25,82 27,22 53,22 67,27 74,36 71,48 59,55 27,55|49,55 77,82',
  S: '75,30 65,23 51,21 36,25 27,35 30,45 43,51 63,56 73,64 71,75 59,82 43,83 30,78 23,71',
  T: '18,23 81,22|50,24 48,82',
  U: '23,22 23,62 28,74 39,81 52,83 66,79 75,68 77,22',
  V: '19,22 47,82 54,81 80,22',
  W: '15,22 29,82 36,82 50,39 64,82 71,81 84,22',
  X: '22,22 77,82|78,22 22,82',
  Y: '18,22 49,53 80,22|49,53 48,82',
  Z: '23,23 77,22 23,81 79,81',
}

export function exampleStrokes(letter) {
  return examples[letter].split('|').map(stroke => stroke.split(' ').map(point => point.split(',').map(Number)))
}

function addOutline(path, points) {
  path.moveTo(...points[0])
  for (const point of points.slice(1)) path.lineTo(...point)
  path.close()
}

function makeGlyph(letter, strokes) {
  const ink = strokes.flat()
  const left = Math.min(...ink.map(([x]) => x))
  const right = Math.max(...ink.map(([x]) => x))
  const radius = penWidth * 5
  const path = new Path()

  for (const stroke of strokes) {
    const points = stroke.map(([x, y]) => [(x - left) * 10 + 42, (baseline - y) * 10])
    points.forEach(([x, y], index) => {
      addOutline(path, Array.from({ length: 12 }, (_, step) => {
        const angle = step * Math.PI / 6
        return [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]
      }))

      if (index === 0) return
      const [startX, startY] = points[index - 1]
      const dx = x - startX
      const dy = y - startY
      const distance = Math.hypot(dx, dy)
      if (distance === 0) return
      const normalX = -dy / distance * radius
      const normalY = dx / distance * radius
      addOutline(path, [
        [startX + normalX, startY + normalY], [startX - normalX, startY - normalY],
        [x - normalX, y - normalY], [x + normalX, y + normalY],
      ])
    })
  }

  return new Glyph({ name: letter, unicode: letter.codePointAt(0), advanceWidth: Math.ceil((right - left) * 10 + 84), path })
}

export function buildWorkshopFont(custom) {
  const glyphs = [
    new Glyph({ name: '.notdef', advanceWidth: 450, path: new Path() }),
    new Glyph({ name: 'space', unicode: 32, advanceWidth: 260, path: new Path() }),
    ...[...alphabet].map(letter => makeGlyph(letter, custom.get(letter) ?? exampleStrokes(letter))),
  ]
  return new Font({ familyName: 'Notebook Hand Lab', styleName: 'Regular', unitsPerEm: 1000, ascender: 900, descender: -220, glyphs })
}
