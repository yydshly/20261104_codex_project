import * as THREE from 'three';

export const SHIELD_DEPLOY = 2.66;
export const SHIELD_CATCH = 3.42;
export const SHIELD_LOWER = 5.5;
export const SHIELD_LAND = 8.45;

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const AMBER = new THREE.Color(0xffab56);
const ROSE = new THREE.Color(0xff5d9c);
const CORNERS = [[1, 0], [0.55, 1], [-0.55, 1], [-1, 0], [-0.55, -1], [0.55, -1]];

function outlineGeometry(width, height, inner, outer) {
  const positions = [];
  const indices = [];
  for (const [x, y] of CORNERS) {
    positions.push(x * width * inner, y * height * inner, 0, x * width * outer, y * height * outer, 0);
  }
  for (let index = 0; index < CORNERS.length; index++) {
    const first = index * 2;
    const next = ((index + 1) % CORNERS.length) * 2;
    indices.push(first, first + 1, next, first + 1, next + 1, next);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

function luminousMaterial(color) {
  return new THREE.MeshBasicMaterial({
    color, side: THREE.DoubleSide, transparent: true, depthWrite: false, toneMapped: false,
    blending: THREE.AdditiveBlending,
  });
}

function createPanel(width, height, hue) {
  const object = new THREE.Group();
  const shape = new THREE.Shape(CORNERS.map(([x, y]) => new THREE.Vector2(x * width, y * height)));
  const surface = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      halfSize: { value: new THREE.Vector2(width, height) },
      tint: { value: hue.clone() },
      strength: { value: 0 },
      impactAge: { value: -1 },
    },
    vertexShader: `
      varying vec2 local;
      void main() {
        local = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec2 halfSize;
      uniform vec3 tint;
      uniform float strength;
      uniform float impactAge;
      varying vec2 local;

      float hexBorder(vec2 p) {
        vec2 cell = vec2(1.0, 1.73205);
        vec2 a = mod(p, cell) - cell * 0.5;
        vec2 b = mod(p - cell * 0.5, cell) - cell * 0.5;
        vec2 nearest = dot(a, a) < dot(b, b) ? a : b;
        vec2 edge = abs(nearest);
        float distanceToCenter = max(edge.x, dot(edge, vec2(0.5, 0.866025)));
        return smoothstep(0.45, 0.49, distanceToCenter);
      }

      void main() {
        float radius = length(local / halfSize);
        float cells = hexBorder(local * 3.25);
        float gap = radius - impactAge * 1.64;
        float front = exp(-40.0 * gap * gap);
        float pulse = step(0.0, impactAge) * max(0.0, 1.0 - impactAge) * front;
        float edgeLight = smoothstep(0.48, 1.0, radius);
        vec3 color = mix(tint, vec3(1.0, 0.84, 0.64), pulse * 0.75 + edgeLight * 0.2);
        float opacity = (0.055 + cells * (0.12 + 0.15 * edgeLight) + edgeLight * 0.075 + pulse * 0.32) * strength;
        gl_FragColor = vec4(color, opacity);
      }
    `,
  }));
  const rim = new THREE.Mesh(outlineGeometry(width, height, 0.962, 1.013), luminousMaterial(hue));
  const bloom = new THREE.Mesh(outlineGeometry(width, height, 0.928, 1.045), luminousMaterial(hue));
  bloom.position.z = 0.002;
  rim.position.z = 0.004;
  surface.renderOrder = 3;
  bloom.renderOrder = 4;
  rim.renderOrder = 5;
  object.add(surface, bloom, rim);

  function illuminate(strength, impactAge, pulse = 0) {
    surface.material.uniforms.strength.value = strength;
    surface.material.uniforms.impactAge.value = impactAge;
    rim.material.opacity = clamp(strength * (0.64 + pulse * 0.28), 0, 1);
    bloom.material.opacity = strength * (0.13 + pulse * 0.17);
  }

  return { object, illuminate };
}

export function createShieldSequence() {
  const object = new THREE.Group();
  object.visible = false;
  const cradle = new THREE.Group();
  const deck = createPanel(2.3, 1.36, AMBER);
  deck.object.rotation.x = -Math.PI / 2;
  cradle.add(deck.object);

  const panels = [
    { ...createPanel(1.95, 0.77, ROSE), x: 0, z: -1.22, angle: Math.PI },
    { ...createPanel(1.06, 0.74, AMBER), x: -1.87, z: 0, angle: -Math.PI / 2 },
    { ...createPanel(1.06, 0.74, ROSE), x: 1.87, z: 0, angle: Math.PI / 2 },
  ];
  const perimeter = new THREE.Group();
  for (const panel of panels) perimeter.add(panel.object);

  const impact = new THREE.Mesh(outlineGeometry(2.3, 1.36, 0.95, 1), luminousMaterial(AMBER));
  impact.rotation.x = -Math.PI / 2;
  impact.position.y = 0.025;
  impact.renderOrder = 6;
  cradle.add(impact);

  const fragments = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1), luminousMaterial(ROSE), 40);
  fragments.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  fragments.frustumCulled = false;
  fragments.renderOrder = 6;
  const fragment = new THREE.Object3D();
  const fragmentColor = new THREE.Color();
  for (let index = 0; index < 40; index++) {
    fragmentColor.copy(ROSE).lerp(AMBER, (index % 5) / 4);
    fragments.setColorAt(index, fragmentColor);
  }
  fragments.material.color.setHex(0xffffff);

  object.add(cradle, perimeter, fragments);

  function update({ time, car, hero }) {
    const deployment = smoothstep(time, SHIELD_DEPLOY, SHIELD_CATCH - 0.055);
    const lowered = smoothstep(time, SHIELD_LOWER, SHIELD_LAND);
    const impactAge = time - SHIELD_CATCH;
    const age = Math.max(0, impactAge);
    const ringing = 1 - smoothstep(age, 1.45, 2.05);
    const shock = Math.sin(age * 7.4) * Math.exp(-age * 2.4) * ringing;
    const settle = smoothstep(time, SHIELD_LAND - 0.18, SHIELD_LAND + 0.2);
    const cast = smoothstep(time, SHIELD_DEPLOY - 0.12, SHIELD_CATCH - 0.05);
    const step = smoothstep(time, 0.72, SHIELD_DEPLOY);

    if (impactAge >= 0) {
      car.position.set(
        lerp(-0.75, -0.5, lowered) + shock * 0.11,
        lerp(3.36, 0.72, lowered) - shock * 0.52,
        lerp(0, -0.16, lowered),
      );
      car.rotation.set(shock * 0.073, 0, -0.28 * Math.exp(-age * 3.8) * ringing + shock * 0.13);
    }

    hero.position.set(lerp(-3.95, -2.7, step) - shock * 0.13, 0, lerp(3.35, 2.15, step));
    hero.rotation.set(0, Math.atan2(car.position.x - hero.position.x, car.position.z - hero.position.z), 0);

    cradle.visible = deployment > 0;
    cradle.position.set(
      impactAge < 0 ? -0.75 : car.position.x,
      impactAge < 0 ? lerp(1.85, 2.63, deployment) : Math.max(0.034, car.position.y - 0.735),
      impactAge < 0 ? 0 : car.position.z,
    );
    cradle.rotation.set(impactAge < 0 ? 0 : car.rotation.x, 0, impactAge < 0 ? -0.28 * deployment : car.rotation.z);
    cradle.scale.setScalar(lerp(0.15, 1, deployment));
    deck.illuminate(deployment * (1 - settle * 0.61), impactAge, Math.abs(shock));

    const unfolding = smoothstep(time, SHIELD_CATCH + 0.12, SHIELD_CATCH + 1.08);
    perimeter.visible = unfolding > 0;
    perimeter.position.set(car.position.x, Math.max(0.025, car.position.y - 0.72), car.position.z);
    for (const [index, panel] of panels.entries()) {
      const spread = lerp(0.57, 1, unfolding) + shock * 0.12;
      panel.object.position.set(panel.x * spread, lerp(0.12, 0.68, unfolding), panel.z * spread);
      panel.object.rotation.set(lerp(-1.38, -0.12, unfolding) - shock * 0.19, panel.angle, 0, 'YXZ');
      panel.object.scale.set(lerp(0.32, 1, unfolding), lerp(0.16, 1, unfolding), 1);
      const flicker = 0.88 + 0.075 * Math.sin(time * 7.5 + index * 1.8);
      panel.illuminate(unfolding * flicker * (1 - settle * 0.27), impactAge - index * 0.1, Math.abs(shock));
    }

    const rippleAge = clamp(impactAge / 0.84, 0, 1);
    impact.visible = impactAge >= 0 && rippleAge < 1;
    impact.scale.setScalar(lerp(0.21, 1.22, rippleAge));
    impact.material.opacity = impact.visible ? 0.93 * (1 - rippleAge) ** 1.5 : 0;

    const burstAge = time >= SHIELD_LAND ? time - SHIELD_LAND : impactAge;
    const atGround = time >= SHIELD_LAND;
    const burstDuration = atGround ? 0.68 : 1.15;
    fragments.count = burstAge >= 0 && burstAge < burstDuration ? (atGround ? 22 : 40) : 0;
    fragments.material.opacity = clamp(1 - burstAge / burstDuration, 0, 1) * 0.86;
    for (let index = 0; index < fragments.count; index++) {
      const angle = index * 2.39996;
      const distance = 0.27 + (index % 7) * 0.09 + burstAge * (1.3 + (index % 9) * 0.28);
      const vertical = burstAge * (0.88 + (index % 5) * 0.31) - burstAge ** 2 * 2.2;
      fragment.position.set(
        (atGround ? -0.5 : -0.75) + Math.cos(angle) * distance * 1.15,
        Math.max(0.04, (atGround ? 0.12 : 2.6) + vertical),
        (atGround ? -0.16 : 0) + Math.sin(angle) * distance * 0.75,
      );
      fragment.rotation.set(angle + burstAge * 6, index * 0.85, angle - burstAge * 3.2);
      const size = (0.025 + (index % 4) * 0.013) * (1 - smoothstep(burstAge, burstDuration * 0.45, burstDuration));
      fragment.scale.set(size * 1.8, size, size * 0.5);
      fragment.updateMatrix();
      fragments.setMatrixAt(index, fragment.matrix);
    }
    if (fragments.count > 0) fragments.instanceMatrix.needsUpdate = true;

    const power = clamp(cast * (1 - settle * 0.65) + Math.abs(shock) * 0.17, 0, 1);
    return { power, running: 0.42 * Math.sin(Math.PI * step) };
  }

  return { object, update };
}
