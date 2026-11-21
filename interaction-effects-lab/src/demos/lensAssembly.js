import * as THREE from 'three'

const smooth = (value) => {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}

export function createLensAssembly(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.35
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 80)
  const studio = new THREE.Group()
  scene.add(studio)
  scene.add(new THREE.HemisphereLight('#d5faff', '#372b43', 2.0))
  const key = new THREE.DirectionalLight('#d6fcff', 3.6)
  key.position.set(3, 4, 6)
  scene.add(key)
  const edge = new THREE.DirectionalLight('#a69dfa', 2.7)
  edge.position.set(2, -3, -3)
  scene.add(edge)
  const warm = new THREE.DirectionalLight('#ffd5aa', 2.1)
  warm.position.set(-3, 2, 1)
  scene.add(warm)

  const materials = {
    barrel: new THREE.MeshStandardMaterial({ color: '#4e5961', metalness: .55, roughness: .28 }),
    dark: new THREE.MeshStandardMaterial({ color: '#202932', metalness: .44, roughness: .33 }),
    bright: new THREE.MeshStandardMaterial({ color: '#adbdc7', metalness: .58, roughness: .26 }),
    brass: new THREE.MeshStandardMaterial({ color: '#b38a5c', metalness: .55, roughness: .31 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#7ed0cb', metalness: .34, roughness: .16, clearcoat: 1, transparent: true, opacity: .78 }),
  }
  const tracked = []

  function mesh(parent, geometry, material) {
    const object = new THREE.Mesh(geometry, material)
    parent.add(object)
    tracked.push(geometry)
    return object
  }

  function ring(parent, inner, outer, depth, material, position = 0) {
    const lip = Math.min(.045, depth * .15)
    const corners = [[inner, -depth / 2], [outer - lip, -depth / 2], [outer, -depth / 2 + lip], [outer, depth / 2 - lip], [outer - lip, depth / 2], [inner, depth / 2], [inner, -depth / 2]]
    const geometry = new THREE.LatheGeometry(corners.map(([x, y]) => new THREE.Vector2(x, y)), 64)
    const part = mesh(parent, geometry, material)
    part.rotation.z = Math.PI / 2
    part.position.x = position
    return part
  }

  function bolt(parent, x, radius, angle, material = materials.bright) {
    const geometry = new THREE.CylinderGeometry(.036, .036, .030, 6)
    const part = mesh(parent, geometry, material)
    part.rotation.z = Math.PI / 2
    part.position.set(x, Math.sin(angle) * radius, Math.cos(angle) * radius)
  }

  function gear(parent, radius, width, count, material) {
    const tooth = new THREE.BoxGeometry(width, .035, .033)
    tracked.push(tooth)
    for (let index = 0; index < count; index += 1) {
      const angle = index * Math.PI * 2 / count
      const piece = new THREE.Mesh(tooth, material)
      piece.position.set(0, Math.sin(angle) * radius, Math.cos(angle) * radius)
      piece.rotation.x = -angle
      parent.add(piece)
    }
  }

  const mount = new THREE.Group()
  ring(mount, .47, .71, .25, materials.bright)
  ring(mount, .50, .75, .09, materials.dark, -.10)
  for (let index = 0; index < 6; index += 1) bolt(mount, -.14, .61, index * Math.PI / 3, materials.dark)

  const barrel = new THREE.Group()
  ring(barrel, .54, .77, .59, materials.barrel)
  ring(barrel, .59, .81, .15, materials.dark, -.18)
  ring(barrel, .58, .79, .12, materials.bright, .26)
  for (const offset of [-.14, -.08, -.02, .04, .10, .16]) ring(barrel, .70, .785, .031, materials.dark, offset)

  const iris = new THREE.Group()
  ring(iris, .50, .73, .21, materials.brass)
  ring(iris, .54, .77, .08, materials.dark, -.07)
  for (let index = 0; index < 8; index += 1) {
    const angle = index * Math.PI / 4
    bolt(iris, .12, .65, angle, materials.brass)
    const blade = mesh(iris, new THREE.BoxGeometry(.035, .31, .15), materials.dark)
    blade.position.set(.10, Math.sin(angle) * .38, Math.cos(angle) * .38)
    blade.rotation.x = -angle + .40
  }

  const optic = new THREE.Group()
  ring(optic, .49, .67, .22, materials.bright)
  ring(optic, .51, .70, .07, materials.barrel, .08)
  const glass = mesh(optic, new THREE.SphereGeometry(.50, 44, 30), materials.glass)
  glass.scale.x = .23
  ring(optic, .37, .405, .023, materials.brass, .095)

  const lock = new THREE.Group()
  ring(lock, .50, .77, .20, materials.dark)
  ring(lock, .57, .72, .055, materials.bright, .115)
  gear(lock, .766, .135, 54, materials.barrel)
  const parts = [mount, barrel, iris, optic, lock]
  studio.add(...parts)

  const apart = [-3.0, -1.67, -.27, 1.10, 2.56]
  const joined = [-.70, -.26, .13, .38, .63]
  const starts = [.03, .14, .33, .53, .69]
  const ends = [.38, .48, .65, .84, 1]

  return {
    render(progress) {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (!width || !height) return
      const density = renderer.getPixelRatio()
      if (canvas.width !== Math.floor(width * density) || canvas.height !== Math.floor(height * density)) renderer.setSize(width, height, false)
      camera.aspect = width / height
      const distance = camera.aspect < 1.25 ? 12.3 : 10.1
      camera.position.set(2.3 + progress * 1.6, 2.25, distance - progress * 2.1)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()
      parts.forEach((part, index) => {
        const t = smooth((progress - starts[index]) / (ends[index] - starts[index]))
        part.position.x = THREE.MathUtils.lerp(apart[index], joined[index], t)
        part.rotation.x = (1 - t) * index * .17 + progress * .28
      })
      studio.rotation.y = -.25 - progress * .30
      studio.rotation.z = .11
      renderer.render(scene, camera)
    },
    dispose() {
      tracked.forEach((geometry) => geometry.dispose())
      Object.values(materials).forEach((material) => material.dispose())
      renderer.dispose()
    },
  }
}
