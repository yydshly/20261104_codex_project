import * as THREE from 'three';
import { groundSurfaceHeight, waterSurfaceAt } from './world-terrain.js';

// Cache crowns in small horizontal cells; listener sampling does not raycast the whole forest.
export function createRainEnvironment(scene, weather) {
  const grid = new Map();
  const size = 6;
  const id = (x, z) => `${Math.floor(x / size)},${Math.floor(z / size)}`;
  scene.traverse((object) => {
    for (const crown of object.userData.rainCanopies ?? []) {
      for (let x = Math.floor((crown.x - crown.rx) / size); x <= Math.floor((crown.x + crown.rx) / size); x++) {
        for (let z = Math.floor((crown.z - crown.rz) / size); z <= Math.floor((crown.z + crown.rz) / size); z++) {
          const key = `${x},${z}`;
          if (!grid.has(key)) grid.set(key, []);
          grid.get(key).push(crown);
        }
      }
    }
  });
  return {
    sample(point, target = {}, classifySurface = true) {
      target.exposure = 1;
      target.cover = 'open';
      target.coverHeight = point.y;
      target.surface = 'ground';
      if (classifySurface) {
        const floor = groundSurfaceHeight(point.x, point.z);
        const water = waterSurfaceAt(point.x, point.z, floor);
        const puddle = weather.puddleSurfaceAt?.(point.x, point.z);
        if (water !== null || (Number.isFinite(puddle) && puddle > floor + .001)) target.surface = 'water';
      }
      for (const roof of weather.shelters) {
        if (point.x < roof.minX || point.x > roof.maxX || point.z < roof.minZ || point.z > roof.maxZ) continue;
        const height = roof.heightAt?.(point.x, point.z) ?? roof.height;
        if (point.y >= height - .14) continue;
        const edge = Math.min(point.x - roof.minX, roof.maxX - point.x, point.z - roof.minZ, roof.maxZ - point.z);
        target.exposure = .04 + .20 * (1 - THREE.MathUtils.smoothstep(edge, 0, .65));
        target.cover = 'roof';
        target.surface = 'roof';
        target.coverHeight = height;
        return target;
      }
      for (const crown of grid.get(id(point.x, point.z)) ?? []) {
        const q = ((point.x - crown.x) / crown.rx) ** 2 + ((point.z - crown.z) / crown.rz) ** 2;
        if (q >= 1 || point.y >= crown.y) continue;
        const exposure = 1 - (1 - THREE.MathUtils.smoothstep(q, .45, 1)) * .67;
        if (exposure >= target.exposure) continue;
        target.exposure = exposure;
        target.cover = 'tree';
        target.surface = 'foliage';
        target.coverHeight = crown.y;
      }
      return target;
    },
  };
}

// Patch only explicitly tagged static surfaces. Cloning prevents shared animal/hero materials getting wet.
export function createWetSurfaces(scene, weather, environment, groundMemory = null) {
  const wetness = { value: 0 };
  const position = new THREE.Vector3();
  const matrix = new THREE.Matrix4();
  const instance = new THREE.Matrix4();
  const sample = {};
  const cache = new Map();
  let surfaceCount = 0;
  scene.updateMatrixWorld(true);
  scene.traverse((object) => {
    const kind = object.userData.rainWettable;
    if (!object.isMesh || !kind || !object.material.isMeshStandardMaterial) return;
    const original = object.material;
    const key = `${original.uuid}:${kind}`;
    let material = cache.get(key);
    if (!material) {
      material = original.clone();
      const previousCompile = original.onBeforeCompile;
      const previousKey = original.customProgramCacheKey();
      material.customProgramCacheKey = () => `${previousKey}:rain-wet-${kind}-${Boolean(groundMemory)}-2`;
      material.onBeforeCompile = (shader, renderer) => {
        previousCompile.call(material, shader, renderer);
        shader.uniforms.uSurfaceWetness = wetness;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', `#include <common>
            attribute float aRainExposure;
            varying float vSurfaceWetness;`)
          .replace('#include <defaultnormal_vertex>', `#include <defaultnormal_vertex>
            vSurfaceWetness = aRainExposure * (.25 + .75 * max(0.0, inverseTransformDirection(transformedNormal, viewMatrix).y));`);
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', `#include <common>
            uniform float uSurfaceWetness;
            varying float vSurfaceWetness;`)
          .replace('#include <color_fragment>', `#include <color_fragment>
            float surfaceWet = clamp(uSurfaceWetness * vSurfaceWetness, 0.0, 1.0);
            diffuseColor.rgb *= 1.0 - surfaceWet * ${kind === 'stone' ? '.23' : kind === 'leaf' ? '.13' : '.28'};`)
          .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
            roughnessFactor = mix(roughnessFactor, ${kind === 'stone' ? '.24' : kind === 'leaf' ? '.30' : '.47'}, surfaceWet * .84);`);
        if (kind === 'ground' && groundMemory) {
          shader.uniforms.uMudPeak = groundMemory.uniforms.peakStage;
          shader.uniforms.uMudStage = groundMemory.uniforms.riverStage;
          shader.uniforms.uWaterlineStrength = groundMemory.uniforms.waterlineStrength;
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', `#include <common>
              attribute float aSoilWetness;
              attribute vec2 aMudResidue;
              attribute vec2 aFloodThreshold;
              varying float vSoilWetness;
              varying vec2 vMudResidue;
              varying vec2 vSoilXZ;
              varying vec2 vFloodThreshold;`)
            .replace('#include <begin_vertex>', `#include <begin_vertex>
              vSoilWetness = aSoilWetness;
              vMudResidue = aMudResidue;
              vFloodThreshold = aFloodThreshold;
              vSoilXZ = (modelMatrix * vec4(transformed, 1.0)).xz;`);
          shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', `#include <common>
              varying float vSoilWetness;
              varying vec2 vMudResidue;
              varying vec2 vSoilXZ;
              varying vec2 vFloodThreshold;
              uniform float uMudPeak;
              uniform float uMudStage;
              uniform float uWaterlineStrength;
              float soilHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
              float soilNoise(vec2 p) {
                vec2 cell = floor(p), f = fract(p);
                vec2 blend = f * f * (3.0 - 2.0 * f);
                return mix(mix(soilHash(cell), soilHash(cell + vec2(1.0, 0.0)), blend.x),
                  mix(soilHash(cell + vec2(0.0, 1.0)), soilHash(cell + vec2(1.0, 1.0)), blend.x), blend.y);
              }`)
            .replace('float surfaceWet = clamp(uSurfaceWetness * vSurfaceWetness, 0.0, 1.0);',
              'float surfaceWet = clamp(max(uSurfaceWetness * vSurfaceWetness, vSoilWetness), 0.0, 1.0);')
            .replace('#include <roughnessmap_fragment>', `
              float mudGrain = .70 + .20 * soilNoise(vSoilXZ * 2.3) + .10 * soilNoise(vSoilXZ * 11.7);
              float recededEdge = smoothstep(.001, .025, vFloodThreshold.x - uMudStage);
              float narrowLine = (1.0 - smoothstep(.018, .055, abs(vFloodThreshold.x - uMudPeak)))
                * step(vFloodThreshold.x, uMudPeak) * vFloodThreshold.y * recededEdge * uWaterlineStrength;
              float sedimentMark = clamp(vMudResidue.x * mudGrain * 1.70
                + max(vMudResidue.y * .35, narrowLine) * (.30 + mudGrain * .08), 0.0, .82);
              vec3 wetMudColor = vec3(.105, .060, .026) * (.83 + .17 * mudGrain);
              diffuseColor.rgb = mix(diffuseColor.rgb, wetMudColor, sedimentMark);
              #include <roughnessmap_fragment>`);
        }
      };
      cache.set(key, material);
    }
    object.material = material;
    object.geometry = object.geometry.clone();
    const vertices = object.geometry.getAttribute('position');
    const colors = object.geometry.getAttribute('color');
    const exposures = new Float32Array(object.isInstancedMesh ? object.count : vertices.count);
    for (let i = 0; i < exposures.length; i++) {
      matrix.copy(object.matrixWorld);
      if (object.isInstancedMesh) {
        object.getMatrixAt(i, instance);
        matrix.multiply(instance);
        position.set(0, 0, 0).applyMatrix4(matrix);
      } else position.fromBufferAttribute(vertices, i).applyMatrix4(matrix);
      let amount = environment.sample(position, sample, false).exposure;
      // Leave snow cover white, including the snow cap on the cabin and the upper trail.
      if ((kind === 'ground' && position.x < -91 && position.y > 24)
        || (colors && !object.isInstancedMesh && Math.min(colors.getX(i), colors.getY(i), colors.getZ(i)) > .71)) amount = 0;
      exposures[i] = amount;
    }
    object.geometry.setAttribute('aRainExposure', object.isInstancedMesh
      ? new THREE.InstancedBufferAttribute(exposures, 1) : new THREE.BufferAttribute(exposures, 1));
    if (kind === 'ground' && groundMemory) groundMemory.bindGeometry(object.geometry);
    surfaceCount++;
  });
  return {
    get surfaceCount() { return surfaceCount; },
    update() { wetness.value = THREE.MathUtils.clamp(weather.wetness, 0, 1); },
  };
}
