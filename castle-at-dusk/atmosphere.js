import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';

export const sunDirection = new THREE.Vector3(-0.77, 0.051, -0.63).normalize();
export const moonDirection = new THREE.Vector3(-0.71, 0.061, -0.70).normalize();

const noiseGLSL = /* glsl */ `
  float hash(vec2 p) {
    vec3 q = fract(p.xyx * .1031);
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
`;

function createSky(time, night) {
  const material = new THREE.ShaderMaterial({
    name: 'Clouds, twilight and stars',
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      time, night,
      sun: { value: sunDirection },
      moon: { value: moonDirection },
    },
    vertexShader: /* glsl */ `
      varying vec3 world;
      void main() {
        world = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float time, night;
      uniform vec3 sun, moon;
      varying vec3 world;
      ${noiseGLSL}

      float fbm(vec2 p) {
        float v = .53 * noise(p);
        p = mat2(1.72, -1.04, 1.04, 1.72) * p + 13.0;
        v += .27 * noise(p);
        p *= 2.09;
        v += .13 * noise(p);
        v += .07 * noise(p * 2.1);
        return v;
      }

      void main() {
        vec3 ray = normalize(world - cameraPosition);
        float h = max(ray.y, 0.0);
        float sunlight = max(dot(ray, sun), 0.0);
        float moonlight = max(dot(ray, moon), 0.0);
        vec3 horizon = mix(vec3(.36, .17, .22), vec3(1.03, .48, .27), pow(sunlight, 6.0));
        vec3 dusk = mix(horizon, vec3(.105, .13, .255), smoothstep(-.025, .37, h));
        vec3 midnight = mix(vec3(.065, .105, .21), vec3(.009, .016, .056), smoothstep(-.04, .37, h));
        vec3 color = mix(dusk, midnight, night);

        vec2 celestial = vec2(atan(ray.z, ray.x), h) * vec2(193.0, 168.0);
        vec2 starCell = floor(celestial);
        float starRandom = hash(starCell);
        vec2 starPosition = .2 + .6 * vec2(hash(starCell + 7.1), hash(starCell + 21.3));
        float star = 1.0 - smoothstep(.03, .19, length(fract(celestial) - starPosition));
        color += vec3(.65, .79, 1.0) * star * step(.978, starRandom)
          * smoothstep(.02, .18, h) * (.10 + .75 * night);

        float sunAngle = length(ray - sun);
        float sunDisk = 1.0 - smoothstep(.017, .020, sunAngle);
        float moonAngle = length(ray - moon);
        float moonDisk = 1.0 - smoothstep(.018, .020, moonAngle);
        float lunarMask = smoothstep(.013, .016, length(ray - normalize(moon + vec3(.012, .008, -.013))));
        color += (1.0 - night) * vec3(1.6, .64, .26) * exp(-sunAngle * 14.0);
        color += night * (vec3(.27, .43, .78) * exp(-moonAngle * 13.0) + vec3(1.35, 1.7, 2.2) * moonDisk * lunarMask);

        vec2 clouds = ray.xz / (h + .24);
        clouds = mat2(.88, .47, -.47, .88) * clouds;
        clouds = clouds * vec2(2.1, 5.1) + vec2(time * .013, -time * .003);
        float cloud = fbm(clouds + vec2(.17, .56) * noise(clouds * 1.17));
        float cloudMask = smoothstep(.44, .64, cloud) * smoothstep(-.012, .067, h);
        float edge = smoothstep(.43, .58, cloud) - smoothstep(.52, .70, cloud);
        vec3 duskCloud = mix(vec3(.23, .22, .31), vec3(.74, .365, .29), pow(sunlight, 6.0));
        duskCloud += vec3(.42, .173, .073) * edge * pow(sunlight, 12.0);
        vec3 nightCloud = vec3(.066, .081, .16) + .14 * vec3(.65, .8, 1.0) * pow(moonlight, 22.0);
        color = mix(color, mix(duskCloud, nightCloud, night), cloudMask * .79);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, .81, .52), sunDisk * (1.0 - night) * (1.0 - cloudMask * .27));
        #include <colorspace_fragment>
      }
    `,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(340, 32, 20), material);
  sky.renderOrder = -10;
  return sky;
}

function createRidge(radius, height, backLength, phase, duskColor, nightColor) {
  const count = 240;
  const bands = 5;
  const vertices = [];
  const colors = [];
  const indices = [];
  for (let i = 0; i <= count; i++) {
    const a = (i % count) * Math.PI * 2 / count;
    const envelope = .65 + .18 * Math.sin(a * 5 + phase) + .12 * Math.cos(a * 9 + phase);
    const teeth = .52 + .18 * Math.sin(a * 19 - phase) + .11 * Math.cos(a * 31) + .07 * Math.sin(a * 47 + phase) + .035 * Math.cos(a * 87 - phase);
    const crest = -4 + height * envelope * teeth;
    const r = radius + 4 * Math.cos(a * 11 + phase) + 5 * Math.sin(a * 7 + phase);
    const x = Math.cos(a);
    const z = Math.sin(a);
    const profile = [
      [r - 13, -6.2],
      [r - 6, -3.8 + (crest + 4) * .45],
      [r, crest],
      [r + backLength * .34, -4 + (crest + 4) * .38],
      [r + backLength, -5.35],
    ];
    for (const [distance, y] of profile) vertices.push(x * distance, y, z * distance);
    const facet = .86 + .13 * Math.sin(a * 31 + phase);
    const backShade = .81 + .09 * Math.cos(a * 29 - phase);
    colors.push(1.18, 1.12, 1.1, facet, facet, facet, 1, 1, 1, backShade, backShade, backShade, .88, .88, .91);
    if (i === count) continue;
    const base = i * bands;
    for (let band = 0; band < bands - 1; band++) {
      const b = base + band;
      indices.push(b, b + bands, b + 1, b + bands, b + bands + 1, b + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  const dusk = new THREE.Color(duskColor);
  const night = new THREE.Color(nightColor);
  const material = new THREE.MeshBasicMaterial({ color: dusk, vertexColors: true, side: THREE.DoubleSide, fog: false });
  return { mesh: new THREE.Mesh(geometry, material), update: (value) => material.color.copy(dusk).lerp(night, value) };
}

function createWater(time, night) {
  const water = new Reflector(new THREE.PlaneGeometry(510, 510), {
    textureWidth: 768,
    textureHeight: 512,
    clipBias: .0015,
    multisample: 0,
    shader: {
      name: 'Rippling lake with planar reflections',
      uniforms: {
        color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null },
        time: { value: 0 }, night: { value: 0 },
        sun: { value: sunDirection }, moon: { value: moonDirection },
      },
      vertexShader: /* glsl */ `
        uniform mat4 textureMatrix;
        varying vec4 reflection;
        varying vec3 world;
        void main() {
          reflection = textureMatrix * vec4(position, 1.0);
          world = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float time, night;
        uniform vec3 sun, moon;
        varying vec4 reflection;
        varying vec3 world;
        ${noiseGLSL}

        void main() {
          vec3 eye = normalize(cameraPosition - world);
          vec2 p = world.xz;
          float w1 = sin(dot(p, vec2(.72, .94)) + time * .87);
          float w2 = sin(dot(p, vec2(-1.5, 1.13)) - time * 1.22);
          float w3 = sin(dot(p, vec2(.31, 3.10)) + time * 1.65);
          float grain = noise(p * vec2(.62, 1.48) + vec2(time * .21, -time * .31));
          float fade = smoothstep(.0, .42, eye.y);
          vec2 uv = reflection.xy / reflection.w;
          uv += vec2(w1 + .6 * w2, w2 + .45 * w3) * (.0016 + .0032 * fade);
          vec3 reflected = texture2D(tDiffuse, clamp(uv, .002, .998)).rgb;
          float edge = pow(1.0 - clamp(eye.y, 0.0, 1.0), 2.9);
          vec3 body = mix(vec3(.042, .081, .099), vec3(.019, .034, .065), night);
          vec3 tint = mix(vec3(.79, .81, .90), vec3(.64, .76, 1.0), night);
          vec3 color = mix(body, reflected * tint, .40 + .54 * edge);

          vec3 normal = normalize(vec3(.079 * w1 - .047 * w2, 1.0, .056 * w2 + .036 * w3));
          vec3 light = normalize(mix(sun, moon, night));
          float glint = pow(max(0.0, dot(reflect(-light, normal), eye)), 108.0);
          float broad = pow(max(0.0, dot(reflect(-light, vec3(0,1,0)), eye)), 32.0);
          color += mix(vec3(.85, .42, .175), vec3(.19, .35, .68), night)
            * (glint * (.12 + .87 * grain) + .10 * broad);
          color += vec3(.12, .17, .20) * (.013 * w3 + .065 * smoothstep(.65, .90, grain)) * fade;

          float distanceOverWater = length(cameraPosition.xz - world.xz);
          float mist = smoothstep(30.0, 145.0, distanceOverWater) * (.20 + .15 * noise(p * .032));
          vec3 mistColor = mix(vec3(.35, .225, .24), vec3(.047, .071, .14), night);
          color = mix(color, mistColor, mist);

          gl_FragColor = vec4(color, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    },
  });
  water.material.uniforms.time = time;
  water.material.uniforms.night = night;
  water.rotation.x = -Math.PI / 2;
  water.position.y = -5.5;

  // Hold the mirror when the camera is still. The ripples continue to animate in the water shader.
  const renderReflection = water.onBeforeRender;
  const previous = new THREE.Matrix4();
  const projection = new THREE.Matrix4();
  let lastFrame = -Infinity;
  let lastNight = -1;
  water.onBeforeRender = function (renderer, scene, camera) {
    if (!water.forceUpdate && previous.equals(camera.matrixWorld) && projection.equals(camera.projectionMatrix)
      && time.value - lastFrame < .42 && Math.abs(night.value - lastNight) < .012) return;
    previous.copy(camera.matrixWorld);
    projection.copy(camera.projectionMatrix);
    lastFrame = time.value;
    lastNight = night.value;
    renderReflection.call(this, renderer, scene, camera);
  };
  return water;
}

export function createAtmosphere() {
  const group = new THREE.Group();
  const time = { value: 0 };
  const night = { value: 0 };
  const ridges = [
    createRidge(210, 37, 33, 3.1, '#b98c9a', '#3e4d75'),
    createRidge(145, 24, 67, 1.9, '#886d83', '#2e3d5c'),
    createRidge(98, 13, 49, 4.8, '#625672', '#222d4c'),
    createRidge(70, 7, 30, .5, '#474961', '#1c273e'),
  ];
  const water = createWater(time, night);
  group.add(createSky(time, night), ...ridges.map(({ mesh }) => mesh), water);
  return {
    group,
    refreshReflection() { water.forceUpdate = true; },
    update(seconds, nightAmount) {
      time.value = seconds;
      night.value = nightAmount;
      for (const ridge of ridges) ridge.update(nightAmount);
    },
  };
}
