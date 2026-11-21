import { MathUtils, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, LineSegments } from 'three';
import { groundSurfaceHeight, waterSurfaceAt } from './world-terrain.js';

export function createClothingWetness() {
  const state = { upper: 0, lower: 0, boots: 0, reservoir: 0, leftSole: 0, rightSole: 0 };
  return {
    state,
    restore(saved = {}) {
      for (const key of Object.keys(state)) state[key] = MathUtils.clamp(Number.isFinite(saved[key]) ? saved[key] : 0, 0, 1);
    },
    footContact(side, ground) {
      const key = side < 0 ? 'leftSole' : 'rightSole';
      if ((ground?.waterDepth ?? 0) > .004) state[key] = 1;
      const water = state[key];
      // Water carried by a boot is deposited on each actual landing. Fabric
      // can remain damp after the sole has stopped leaving wet marks.
      const absorption = ground?.substrate === 'sand' ? .24 : ground?.substrate === 'grass' ? .30 : .17;
      if ((ground?.waterDepth ?? 0) <= .004) state[key] *= 1 - absorption;
      return water;
    },
    update(dt, { swimming = false, underwater = false, waterDepth = 0, rain = 0, exposure = 1, speed = 0 } = {}) {
      dt = MathUtils.clamp(Number.isFinite(dt) ? dt : 0, 0, .12);
      const rainfall = MathUtils.clamp(rain * exposure, 0, 1);
      const levels = { upper: 1.1, lower: .48, boots: .035 };
      for (const [key, height] of Object.entries(levels)) {
        const immersed = swimming || underwater || waterDepth > height;
        const soak = immersed ? 4 : rainfall * (key === 'upper' ? .12 : .055);
        const dry = immersed ? 0 : (1 - rainfall) * (1 + Math.min(speed, 5) * .10) / (key === 'boots' ? 105 : 85);
        // Wetting and evaporation compete, so a drizzle cannot instantly soak a coat.
        state[key] = MathUtils.clamp(state[key] + ((1 - state[key]) * soak - state[key] * dry) * dt, 0, 1);
      }
      if (swimming || underwater || waterDepth > .4) state.reservoir = MathUtils.damp(state.reservoir, 1, 3, dt);
      else state.reservoir = Math.max(0, state.reservoir - dt / 16);
      for (const key of ['leftSole', 'rightSole']) {
        state[key] = swimming || underwater || waterDepth > .025
          ? MathUtils.damp(state[key], 1, 7, dt) : state[key] * Math.exp(-dt / 38);
      }
      return state;
    },
  };
}

export function createClothingDrips(scene, count = 64) {
  const positions = new Float32Array(count * 6), colors = new Float32Array(count * 6);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const mesh = new LineSegments(geometry, new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .65, depthWrite: false }));
  mesh.name = '小岚衣角与靴子的滴水'; mesh.frustumCulled = false;
  scene.add(mesh);
  const drops = Array.from({ length: count }, () => ({ x: 0, y: 0, z: 0, vy: 0, life: 0 }));
  let budget = 0, cursor = 0;
  return {
    get active() { return drops.filter((d) => d.life > 0).length; },
    get capacity() { return count; },
    clear() {
      drops.forEach((d) => { d.life = 0; }); budget = 0;
      colors.fill(0); geometry.attributes.color.needsUpdate = true;
    },
    update(dt, position, yaw, wet, swimming, visible, speed = 0) {
      dt = MathUtils.clamp(dt, 0, .12);
      if (!swimming && visible && wet.reservoir > .03) budget += dt * wet.reservoir * (3 + Math.min(speed, 5) * 2.5);
      else budget = 0;
      while (budget >= 1) {
        budget--;
        const i = cursor++ % count, d = drops[i], side = i % 2 ? 1 : -1;
        const across = side * (.16 + (i % 3) * .035), along = ((i % 5) - 2) * .035;
        d.x = position.x + across * Math.cos(yaw) + along * Math.sin(yaw);
        d.z = position.z - across * Math.sin(yaw) + along * Math.cos(yaw);
        d.y = position.y + (i % 3 ? .80 : .14); d.vy = -.15; d.life = 1.2;
      }
      for (let i = 0; i < count; i++) {
        const d = drops[i], j = i * 6;
        if (d.life <= 0) { colors.fill(0, j, j + 6); continue; }
        d.life -= dt; d.vy -= 9.8 * dt; d.y += d.vy * dt;
        const floor = groundSurfaceHeight(d.x, d.z), water = waterSurfaceAt(d.x, d.z, floor);
        if (d.y <= (water ?? floor) + .015) { d.life = 0; colors.fill(0, j, j + 6); continue; }
        positions.set([d.x, d.y, d.z, d.x, d.y + Math.min(.095, .018 - d.vy * .014), d.z], j);
        colors.set([.35, .65, .70, .12, .28, .32], j);
      }
      geometry.attributes.position.needsUpdate = geometry.attributes.color.needsUpdate = true;
    },
  };
}
