import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTerrain, groundHeight, groundSurfaceHeight, riverLevel, riverZ, riverSpan, riverSurfaceHeight, waterSurfaceAt, riverCurrentAt, coastlineX } from './world-terrain.js';
import { createWater } from './world-water.js';
import { createEcology } from './world-ecology.js';
import { createStation } from './world-station.js';
import { createTrail, trailClearance } from './world-trail.js';
import { createWalker } from './world-walk.js';
import { createWorldCollision, cameraClearance } from './world-collision.js';
import { createUnderwater } from './world-underwater.js';
import { createWalkHud } from './world-hud.js';
import { createBiomes } from './world-biomes.js';
import { createExtras } from './world-extras.js';
import { createGuide } from './world-guide.js';
import { createHero } from './world-hero.js';
import { createCharacterView } from './world-character.js';
import { createItinerary, underwaterStations } from './world-itinerary.js';
import { createJourney } from './world-journey.js';
import { createObservation } from './world-observe.js';
import { createWorldAudio } from './world-audio.js';
import { createWorldWeather } from './world-weather.js';
import { createPuddles } from './world-puddles.js';
import { createRainEnvironment, createWetSurfaces } from './world-rain-environment.js';
import { createGroundMemory } from './world-ground-memory.js';
import { createFootprints } from './world-footprints.js';
import { createWildlifeVisitor } from './world-wildlife.js';
import { createWorldTide, seaSurfaceHeight } from './world-tides.js';
import { collectFlowObstacles, createFlowTraces } from './world-flow.js';
import { createExplorationStore, createQualityController } from './world-session.js';
import { createWaterActions } from './world-water-actions.js';

const viewport = document.getElementById('viewport');
const world = document.querySelector('.world');
const loading = document.getElementById('loading');
const overviewButton = document.getElementById('overview');
const weatherButton = document.getElementById('weather');
const tourButton = document.getElementById('tour');
const walkButton = document.getElementById('walk');
const viewMode = document.getElementById('view-mode');
const heroTag = document.getElementById('hero-tag');
const recenterButton = document.getElementById('guide-recenter');
const takeoverButton = document.getElementById('guide-takeover');
const guideDepth = document.getElementById('guide-depth');
const tourLabel = document.getElementById('tour-label');
const soundButton = document.getElementById('environment-sound');
const soundLabel = document.getElementById('environment-sound-label');
const soundVolume = document.getElementById('environment-volume');
const rainStrength = document.getElementById('rain-strength');
const rainStrengthLabel = document.getElementById('rain-strength-label');
const rainSettings = document.getElementById('rain-settings');
const rainState = document.getElementById('rain-state');
const tidePhase = document.getElementById('tide-phase');
const tideState = document.getElementById('tide-state');
const tideReverse = document.getElementById('tide-reverse');
const movementKeys = /^(Key[WASD]|Arrow(Up|Down|Left|Right))$/;
const route = document.getElementById('route');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const setText = (id, value) => { document.getElementById(id).textContent = value; };
const svgNamespace = 'http://www.w3.org/2000/svg';

const overview = {
  target: [-10, 12, 0], offset: [71, 115, 169], name: '从雪线到海岸', region: '世界总览',
  description: '从雪原小屋沿河走到牧场、雨林和海湾。可以自己走，也可以让导览带你逐站探索。',
};

function addAtmosphere(scene) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(670, 32, 18), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { rain: { value: 0 }, time: { value: 0 }, submersion: { value: 0 } },
    vertexShader: `varying vec3 direction;
      void main() {
        direction = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `varying vec3 direction;
      uniform float rain;
      uniform float time;
      uniform float submersion;

      float random2(vec2 cell) {
        return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise2(vec2 uv) {
        vec2 cell = floor(uv), f = fract(uv);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(random2(cell), random2(cell + vec2(1, 0)), f.x),
          mix(random2(cell + vec2(0, 1)), random2(cell + vec2(1, 1)), f.x), f.y);
      }

      void main() {
        vec3 ray = normalize(direction);
        float altitude = max(ray.y, 0.0);
        vec3 horizon = mix(vec3(.57, .68, .62), vec3(.26, .34, .34), rain);
        vec3 zenith = mix(vec3(.15, .36, .53), vec3(.11, .17, .22), rain);
        vec3 skyColor = mix(horizon, zenith, smoothstep(0.0, .83, altitude));
        vec2 uv = ray.xz / max(.16, ray.y + .27) * 2.6 + vec2(time * .016, 2.8);
        float bank = noise2(uv) * .58 + noise2(uv * 2.16) * .27 + noise2(uv * 4.39) * .15;
        float cloud = smoothstep(.52 - rain * .18, .78 - rain * .11, bank) * smoothstep(.01, .25, altitude);
        skyColor = mix(skyColor, mix(vec3(.90, .93, .79), vec3(.33, .40, .40), rain), cloud * .75);
        vec3 waterColor = mix(vec3(.024, .114, .133), vec3(.078, .300, .345), smoothstep(-.4, .8, ray.y));
        skyColor = mix(skyColor, waterColor, submersion);
        gl_FragColor = vec4(skyColor, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  sky.renderOrder = 1000;
  sky.frustumCulled = false;
  scene.add(sky);
  return sky;
}

function describeStops(ecology, station, underwater, biomes, extras) {
  const x = -63;
  return new Map([
    ['overview', overview],
    ['snow', {
      target: [-106.2, 32.7, -24.5], offset: [18.7, 14.1, 8.8], short: '雪线', region: '上游', name: '雪线与融水',
      description: '两股融水从雪和冰的边缘流出，沿浅槽汇到小池。水从池的低处流出，接进下游主河道。',
    }],
    ['gorge', {
      target: [x, riverLevel(x) + 2, riverZ(x)], offset: [19, 12, 23], short: '峡谷', region: '山谷', name: '岩壁之间的急流',
      description: '上游落差大，河水在窄槽中加速。水面亮纹沿着弯道移动，急流越过凸出河面的岩石。',
    }],
    ['river', {
      ...station.stop, short: '河岸', region: '河岸', name: '河岸的屋檐',
      description: '木屋的屋檐下留着燕子的泥巢，雨水会从两侧瓦边滴落。木屋下游有缓坡，走向较深的河心就可以游泳。',
    }],
    ['bee', {
      ...ecology.stops.bee, short: '蜂巢', region: '草甸特写', name: '花丛与蜂巢',
      description: '靠近河岸草甸，跟着蜜蜂在花丛与蜂巢之间往返。从这个角度能看见巢脾上一格一格的蜂房。',
    }],
    ['ant', {
      ...ecology.stops.ant, short: '蚁穴', region: '土层特写', name: '脚下的蚁道',
      description: '在草甸旁停下来，从剖开的土层看进去。树根穿过泥土，工蚁沿着相连的隧道进出巢室。',
    }],
    ['tide', {
      ...ecology.stops.tide, short: '潮池', region: '海岸特写', name: '礁石留下的小池',
      description: '靠近海岸低处，礁石把一小片海水围在池里。停下来能看到池底、爬动的蟹和海星。',
    }],
    ['ocean', {
      target: [88, .3, 17], offset: [25, 17, 25], short: '海面', region: '河口外海', name: '河水汇入海湾',
      description: '从海上回望，能看到河口和浅滩相接。沿岸的白色浪纹会随时间变化，浅水下有游过的鱼群。',
    }],
    ['dive', {
      target: underwater.landmark, spawn: underwater.entry, short: '入水', region: '浅海', name: '从浅滩下潜',
      description: '越过浪线后下潜，贴着浅海沙床，能看到砂纹、贝壳和低矮的海草。',
    }],
    ['kelp', {
      target: underwaterStations.kelp.target, spawn: underwaterStations.kelp, short: '海带林', region: '浅海 · 海带林', name: '穿过海带林',
      description: '沿沙地间的通道继续游。高一些的海带在两侧摆动，小鱼会穿过叶片间的缝隙。',
    }],
    ['reef-deep', {
      target: underwaterStations['reef-deep'].target, spawn: underwaterStations['reef-deep'], short: '外侧礁石', region: '浅海 · 礁石区', name: '礁石间的海星与海葵',
      description: '约五米深的礁石旁，海星贴在岩面上，海葵的触手在水里轻轻摆动。',
    }],
    ['cabin', {
      ...biomes.stops.cabin, short: '雪原小屋', region: '雪原', name: '雪原上的小屋',
      description: '山间小路从小屋门前经过。暖光照在积雪上，烟气从屋顶缓缓升起。',
    }],
    ['ranch', {
      ...biomes.stops.ranch, short: '平原牧场', region: '河谷平原', name: '草坡上的牛羊',
      description: '走到围栏边，能看到牛群和羊群在开阔草地上吃草、抬头和走动。',
    }],
    ['tropics', {
      ...biomes.stops.tropics, short: '热带森林', region: '沿海暖湿地带', name: '走进热带森林',
      description: '棕榈和阔叶树盖住小路，蕨叶和气生根填满林下。抬头可以从叶缝里看见天光。',
    }],
    ['wetland', {
      ...extras.stops.wetland, short: '河口湿地', region: '河口低地', name: '芦苇间的湿地',
      description: '浅水和芦苇交错，留出一段段泥滩。沿着岸边走，可以看鸟在水上和水边活动。',
    }],
    ['dunes', {
      ...extras.stops.dunes, short: '海岸沙丘', region: '背风沙岸', name: '起伏的海岸沙丘',
      description: '低矮的草簇散在沙地上。靠近一些能看到细密的沙纹，越过浅坡就是海岸。',
    }],
  ]);
}

function makeStopButton(text, cssClass) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = cssClass;
  button.textContent = text;
  return button;
}

function describePassage({ position: { x, z }, medium }) {
  if (medium === 'dive') {
    if (x >= 83) return '沙地向外侧礁石过渡，留意岩块上附着的海星和海葵。';
    if (x >= 75) return '小岚游在海带间的通道上，可以转动镜头看两侧的叶片和鱼群。';
    return '小岚正在下潜。视线贴近沙床，短海草逐渐过渡到更高的海带。';
  }
  if (medium === 'swim') return x < 62 ? '小岚游过下游河道。顺着水面能看见两岸的草地和沙滩。' : '已经游到海湾浅处。沿岸能看见水下的沙纹与石块。';
  if (medium === 'wade') return '水先漫过脚边，水深增加后小岚才会游起来。';
  if (x < -91) return '积雪、裸岩和融水细槽就在步道两侧。转动镜头可以看看雪线边的变化。';
  if (x < -43) return '步道沿峡谷下行。木栏另一边是贴着岩石流过的急流。';
  if (x < -14) return '河岸变开阔了。留意木屋、栈桥和靠水生长的树。';
  if (x < 25) return '花丛、低草和开阔的牧地交替出现，步道从它们之间穿过。';
  if (z > 36 && x < 53) return '经过林下时，可以看脚边的落叶、枯木，以及从树冠垂下来的根。';
  if (z < 5) return '海岸背风处有沙坡，靠河口一侧则渐渐出现浅水、芦苇和泥滩。';
  return '河谷通向海岸，岩岸、沙滩和潮池分布在水边。';
}

function run() {
  let storage;
  try { storage = window.localStorage; } catch {}
  const exploration = createExplorationStore(storage);
  let savedExploration = exploration.load();
  const preferences = exploration.preferences();
  const quality = createQualityController(preferences.quality, devicePixelRatio || 1);
  quality.setMode(preferences.quality);
  const qualitySelect = document.getElementById('quality');
  const qualityState = document.getElementById('quality-state');
  const saveState = document.getElementById('save-state');
  const resumeButton = document.getElementById('resume-exploration');
  qualitySelect.value = quality.state.mode;
  resumeButton.disabled = !savedExploration;
  if (savedExploration) saveState.textContent = '已保存上次探索';
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.warn('WebGL initialization failed', error);
    setText('error-text', '当前浏览器未能启用 WebGL，3D 世界无法加载。');
    document.getElementById('world-error').hidden = false;
    loading.hidden = true;
    return;
  }
  renderer.setPixelRatio(quality.state.ratio);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', '三维流域。拖动转动视角，滚轮缩放，方向键平移。');
  viewport.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xb8c6b3, 145, 485);
  const sky = addAtmosphere(scene);
  const sunlight = new THREE.DirectionalLight(0xffe7be, 2.2);
  sunlight.position.set(-99, 129, 70);
  const hemisphere = new THREE.HemisphereLight(0xd4ebff, 0x5c6951, 1.64);
  scene.add(sunlight, hemisphere);
  const clearFog = new THREE.Color(0xb8c6b3);
  const rainFog = new THREE.Color(0x798e90);
  const underwaterFog = new THREE.Color(0x3a808b);
  const riverFog = new THREE.Color(0x47796f);
  const waterFog = new THREE.Color();
  const muddyRiverFog = new THREE.Color(0x727352);
  const clearSun = sunlight.color.clone();
  const underwaterSun = new THREE.Color(0xb7ebe1);
  const clearAmbient = hemisphere.color.clone();
  const underwaterAmbient = new THREE.Color(0x99e3e3);

  const riverClock = { value: 0 };
  const cloud = { value: 0 };
  const weatherSystem = createWorldWeather();
  const weather = weatherSystem.state;
  weatherSystem.setWind(preferences.wind);
  const windSelect = document.getElementById('wind-strength');
  windSelect.value = String([0, .35, .65, 1].reduce((best, n) => Math.abs(n - preferences.wind) < Math.abs(best - preferences.wind) ? n : best, .35));
  const tides = createWorldTide({ phase: new URLSearchParams(location.search).get('tide') === 'ebb' ? Math.PI : 0 });
  const mouthCurrent = new THREE.Vector3();
  createTerrain(scene, trailClearance, riverClock, cloud);
  const water = createWater(scene);
  const trail = createTrail(scene);
  const ecology = createEcology(scene, trailClearance);
  const station = createStation(scene);
  const underwater = createUnderwater(scene);
  const biomes = createBiomes(scene);
  const extras = createExtras(scene);
  const hero = createHero(scene);
  const visitorTracker = createWildlifeVisitor();
  const stops = describeStops(ecology, station, underwater, biomes, extras);
  const itinerary = createItinerary(trail, stops, underwater.entry);
  const routeIds = [...itinerary.keys()];
  const waterStops = routeIds.filter((id) => stops.get(id).spawn?.swimming);
  const journey = createJourney(itinerary);
  const camera = new THREE.PerspectiveCamera(45, 1, .14, 1200);
  const eye = new THREE.PerspectiveCamera();
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .12;
  controls.minDistance = 1.25;
  controls.maxDistance = 650;
  controls.maxPolarAngle = Math.PI * .492;
  controls.listenToKeyEvents(renderer.domElement);
  const staticCollision = createWorldCollision(scene);
  const waterActions = createWaterActions(scene, staticCollision);
  const flowObstacles = collectFlowObstacles(scene, { centerAt: riverZ,
    spanAt: (x) => riverSpan(x, 1, .42), surfaceAt: (x) => riverSurfaceHeight(x, 1, .42) });
  const flowTraces = createFlowTraces(scene, flowObstacles, {
    groundAt: groundSurfaceHeight, waterAt: waterSurfaceAt, currentAt: riverCurrentAt,
  });
  world.dataset.flowObstacles = String(flowObstacles.length);
  const puddles = createPuddles(scene, staticCollision);
  weather.shelters = [...(biomes.rainShelters ?? []), ...(station.rainShelters ?? [])];
  weather.puddleSurfaceAt = puddles.surfaceAt;
  const rainEnvironment = createRainEnvironment(scene, weather);
  const groundExposure = { x: 0, y: 0, z: 0 };
  const exposureSample = {};
  weather.groundExposureAt = (x, z) => {
    groundExposure.x = x;
    groundExposure.y = groundSurfaceHeight(x, z) + .02;
    groundExposure.z = z;
    return rainEnvironment.sample(groundExposure, exposureSample, false).exposure;
  };
  const groundMemory = createGroundMemory(scene, weather, staticCollision);
  const wetSurfaces = createWetSurfaces(scene, weather, rainEnvironment, groundMemory);
  const footprintClimate = {}, footprintPoint = new THREE.Vector3(), footprintFlow = new THREE.Vector3();
  const footprints = createFootprints(scene, { sampleGround: groundMemory.sampleAt, collision: staticCollision,
    sampleEnvironment(x, z, ground, target) {
      const floor = ground?.floor ?? groundSurfaceHeight(x, z);
      footprintPoint.set(x, floor + .025, z); rainEnvironment.sample(footprintPoint, footprintClimate, false);
      const windCover = footprintClimate.cover === 'roof' ? .12 : footprintClimate.cover === 'tree' ? .45 : 1;
      target.rain = weather.rain; target.exposure = footprintClimate.exposure;
      target.wind = weather.wind * windCover; target.windX = 1; target.windZ = -.55;
      riverCurrentAt(x, z, floor, .02, footprintFlow, weather.runoff);
      target.flowSpeed = footprintFlow.length();
      target.wave = x > 45 ? (1 - THREE.MathUtils.smoothstep(Math.abs(coastlineX(z) - x), 1, 6))
        * (.15 + weather.wind * .55 + weather.rain * .20) * (.65 + .35 * Math.abs(tides.state.flow)) : 0;
    },
  });
  const listenerRain = {};
  let footContactCount = 0;
  const walkerCollision = {
    blocks(...args) { return staticCollision.blocks(...args) || biomes.blocks(...args) || extras.blocks(...args) || station.blocks(...args); },
    supportAt(...args) { return staticCollision.supportAt(...args); },
  };
  const walker = createWalker(eye, renderer.domElement, walkerCollision, weather, groundMemory.sampleAt);
  const clothingRain = {}, clothingPoint = new THREE.Vector3();
  const character = createCharacterView(camera, eye, walker, hero, staticCollision, groundMemory.sampleAt, (position) => {
    clothingPoint.copy(position); clothingPoint.y += 1.35;
    rainEnvironment.sample(clothingPoint, clothingRain, false);
    return { rain: weather.rain, exposure: clothingRain.exposure };
  });

  const riverPath = Array.from({ length: 85 }, (_, i) => {
    const x = -99 + i * 2;
    return `${i === 0 ? 'M' : 'L'}${x} ${riverZ(x).toFixed(2)}`;
  }).join(' ');
  const headwatersPath = water.headwaterLines.map((line) => line.map(([x, z], index) => (
    `${index ? 'L' : 'M'}${x.toFixed(2)} ${z.toFixed(2)}`
  )).join(' ')).join(' ');
  document.getElementById('map-river').setAttribute('d', `${headwatersPath} ${riverPath}`);
  const trailPath = [trail.points, ...(trail.branches ?? [])].map((branch) => branch.map(([x, , z], index) => (
    `${index ? 'L' : 'M'}${x.toFixed(2)} ${z.toFixed(2)}`
  )).join(' ')).join(' ');
  document.getElementById('map-trail').setAttribute('d', trailPath);
  const guideLine = [...itinerary.values()].flatMap(({ points }) => (
    points.filter((_, index) => index % 6 === 0 || index === points.length - 1)
  )).map(({ position }, index) => `${index ? 'L' : 'M'}${position.x.toFixed(2)} ${position.z.toFixed(2)}`).join(' ');
  document.getElementById('map-journey').setAttribute('d', guideLine);
  const pins = document.getElementById('pins');
  const mapStops = document.getElementById('map-stops');
  const mapSight = document.getElementById('map-sight');
  const mapCamera = document.getElementById('map-camera');
  const markers = routeIds.map((id, index) => {
    const stop = stops.get(id);
    const number = String(index + 1).padStart(2, '0');
    const button = makeStopButton(stop.short, 'stop');
    const badge = document.createElement('span');
    const type = stop.spawn?.swimming ? '水下' : ['bee', 'ant', 'tide'].includes(id) ? '特写' : '沿途';
    badge.textContent = `${number} / ${type}`;
    button.prepend(badge);
    button.dataset.stop = id;
    button.addEventListener('click', () => {
      observation.close();
      if (guide.active) guide.goTo(id);
      else if (stop.spawn?.swimming) enterWalk(stop.spawn, id);
      else if (walker.active) enterWalk(spawnFor(id));
      else focusStop(id);
    });
    route.append(button);

    const pin = makeStopButton(number, 'pin');
    pin.setAttribute('aria-label', stop.name);
    pin.title = stop.name;
    pin.addEventListener('click', () => focusStop(id));
    pins.append(pin);

    const dot = document.createElementNS(svgNamespace, 'circle');
    dot.setAttribute('r', '3.3');
    dot.setAttribute('cx', stop.target[0]);
    dot.setAttribute('cy', stop.target[2]);
    dot.classList.add('map-stop');
    mapStops.append(dot);
    return { id, button, pin, dot, point: new THREE.Vector3(...stop.target).add(new THREE.Vector3(0, 3.2, 0)) };
  });

  let activeId = 'overview';
  let transition = null;
  let raining = false;
  let rain = 0;
  let submersion = 0;
  let elapsed = 0;
  let previous = 0;
  const projected = new THREE.Vector3();
  const facing = new THREE.Vector3();
  const followAnchor = new THREE.Vector3();
  const lastAnchor = new THREE.Vector3();
  const anchorDelta = new THREE.Vector3();
  const chasePosition = new THREE.Vector3();
  let journeyVisible = false;
  let guideAnchorReady = false;
  let manualGuideView = false;
  let travelCaption;
  let lastTravelNote = '';
  let handoff = null;
  const walkHud = createWalkHud(walker, renderer.domElement, stops, renderPlace);
  const audio = createWorldAudio({ onRecordingStatus(status) {
    world.dataset.ambienceMode = status.mode;
    world.dataset.recordingsReady = String(status.ready);
    syncSoundButton();
  } });
  audio.setVolume(Number(soundVolume.value) / 100);
  const guide = createGuide({
    stops: routeIds.map((id) => ({ id, name: stops.get(id).name })),
    navigate: navigateJourney,
    onActive: setGuide,
    audio,
  });
  function unlockAudio(event) {
    if (event && soundButton.contains(event.target)) return;
    audio.unlock();
  }
  function syncSoundButton() {
    const unlocked = audio.context?.state === 'running';
    const samples = audio.recordings;
    const label = !unlocked ? '开启环境声' : !audio.enabled ? '环境声关'
      : samples.ready === samples.total ? '实录声开' : samples.loading ? '加载实录' : '重试实录';
    if (soundLabel.textContent !== label) soundLabel.textContent = label;
    soundButton.setAttribute('aria-pressed', String(unlocked && audio.enabled));
    soundButton.title = samples.failed.length ? '部分录音未载入，点击重试'
      : '平缓河流、急流、海浪和风声使用现场录音，随位置、水流与天气混音';
  }
  world.addEventListener('pointerdown', unlockAudio, { capture: true });
  route.addEventListener('pointerdown', unlockAudio, { capture: true });
  renderer.domElement.addEventListener('keydown', unlockAudio, { capture: true });
  soundButton.addEventListener('click', () => {
    const unlocked = audio.context?.state === 'running';
    audio.setEnabled(unlocked && audio.recordings.failed.length === 0 ? !audio.enabled : true);
    audio.unlock();
    syncSoundButton();
  });
  soundVolume.addEventListener('input', () => {
    audio.setVolume(Number(soundVolume.value) / 100);
    audio.unlock();
  });
  audio.setEnabled(preferences.sound);
  audio.setVolume(preferences.volume);
  soundVolume.value = String(Math.round(preferences.volume * 100));
  window.addEventListener('pagehide', (event) => { saveExploration(); if (!event.persisted) audio.dispose(); });
  const beeSoundPosition = ecology.observations.find((site) => site.id === 'bee').position;
  let observationWasWalking = false;
  const observation = createObservation({
    world, camera, controls, canvas: renderer.domElement, sites: ecology.observations, collision: staticCollision,
    onEnter() {
      transition = null;
      observationWasWalking = walker.active;
      if (observationWasWalking) {
        if (handoff) recordWalk();
        walker.exit();
        walkHud.setVisible(false);
      }
    },
    onExit() {
      if (observationWasWalking) {
        walker.resume();
        walkHud.setVisible(true);
        walkHud.update(eye);
      } else {
        controls.enabled = true;
        controls.listenToKeyEvents(renderer.domElement);
      }
      observationWasWalking = false;
    },
  });

  function resize() {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    camera.aspect = width / height;
    const narrow = camera.aspect < 1.05;
    camera.fov = walker.active || journeyVisible ? (narrow ? 73 : 60) : (narrow ? 66 : 45);
    camera.near = walker.active || journeyVisible ? .09 : .14;
    camera.updateProjectionMatrix();
    camera.userData.viewportHeight = height;
    renderer.setSize(width, height, false);
  }

  function underwaterStart() {
    if (!walker.active || walker.medium !== 'dive') return undefined;
    return waterStops.find((id) => {
      const [x, y, z] = stops.get(id).spawn.position;
      return Math.hypot(eye.position.x - x, eye.position.y - y, eye.position.z - z) < .18;
    });
  }

  function syncTourLabel() {
    const label = guide.active ? '结束导览' : underwaterStart() ? '水下导览' : '一键导览';
    if (tourLabel.textContent !== label) tourLabel.textContent = label;
  }

  function setGuide(on, startId) {
    if (on) {
      leaveWalk();
      transition = null;
      controls.enabled = true;
      journey.begin(startId);
      journeyVisible = true;
      guideAnchorReady = false;
      manualGuideView = false;
      recenterButton.hidden = true;
      hero.resetPose();
      resize();
    } else {
      travelCaption = undefined;
      const returning = handoff?.returning;
      handoff?.controller?.abort();
      handoff = null;
      world.classList.remove('is-guide-manual');
      for (const { button } of markers) button.disabled = false;
      if (journeyVisible && !walker.active) {
        journeyVisible = false;
        activateWalker(spawnAt(returning?.state ?? journey.state), true, true);
      }
      if (walker.active) setText('route-description', '步行途中，也可从这里快速到达');
    }
    world.classList.toggle('is-guiding', on);
    tourButton.setAttribute('aria-pressed', String(on));
    setText('tour-icon', on ? '■' : '▷');
    syncTourLabel();
    if (!on && walker.active) renderer.domElement.focus({ preventScroll: true });
  }

  async function navigateJourney(id, signal, showPassage) {
    const stop = stops.get(id);
    const { button } = markers.find((marker) => marker.id === id);
    route.scrollLeft = Math.max(0, button.offsetLeft - route.offsetLeft - route.clientWidth / 2 + button.offsetWidth / 2);
    const arrival = journey.go(id, signal);
    activeId = id;
    if (journey.moving) {
      renderPlace(id, { region: '跟随小岚', name: `走向${stop.short}`, description: '镜头跟着小岚在同一片地形上前行。' });
      lastTravelNote = describePassage(journey.state);
      travelCaption = showPassage;
      travelCaption(lastTravelNote);
    }
    await arrival;
    signal.throwIfAborted();
    travelCaption = undefined;
    renderPlace(id, stop);
    history.replaceState(null, '', `#${id}`);
  }

  function renderPlace(id, place) {
    setText('region-label', place.region);
    setText('place-name', place.name);
    setText('place-description', place.description);
    markers.forEach((marker) => {
      marker.button.setAttribute('aria-current', String(marker.id === id));
      marker.dot.classList.toggle('active', marker.id === id);
    });
  }

  function setFollowing(on) {
    character.setFollowing(on);
    viewMode.setAttribute('aria-pressed', String(on));
    viewMode.textContent = on ? '第一人称' : '跟随小岚';
  }

  function enterWalk(spawn = trail.spawn, hash = 'walk', { writeHistory = true } = {}) {
    observation.close();
    guide.stop();
    journeyVisible = false;
    transition = null;
    activeId = hash;
    activateWalker(spawn, walker.active && character.following);
    if (writeHistory && location.hash !== `#${hash}`) history.pushState(null, '', `#${hash}`);
  }

  function currentPreferences() {
    return { quality: quality.state.mode, sound: audio.enabled, volume: audio.volume,
      following: character.following, distance: character.distance, wind: weather.windTarget };
  }
  let saveElapsed = 0;
  function saveExploration() {
    exploration.savePreferences(currentPreferences());
    if (!walker.active && !observationWasWalking && !journeyVisible) return;
    const motion = journeyVisible ? (handoff?.returning ?? journey).state : null;
    const state = motion ? { position: motion.position.toArray(), yaw: motion.yaw + Math.PI,
      pitch: motion.pitch, feet: motion.feet, crouch: motion.crouch,
      swimming: motion.medium === 'swim' || motion.medium === 'dive', airborne: motion.airborne } : walker.snapshot();
    const snapshot = { walker: state, elapsed, weather: { rain: weather.rain, runoff: weather.runoff,
      wetness: weather.wetness, turbidity: weather.turbidity, riverStage: weather.riverStage,
      wind: weather.wind, windTarget: weather.windTarget },
      tide: { phase: tides.state.phase, flow: tides.state.flow }, raining, rainStrength: Number(rainStrength.value),
      puddles: puddles.snapshot(), ground: groundMemory.snapshot(), clothing: { ...hero.wetness }, footprints: footprints.snapshot(),
      preferences: currentPreferences() };
    if (exploration.save(snapshot)) {
      savedExploration = exploration.load(); resumeButton.disabled = false;
      if (saveState.textContent !== '探索进度已自动保存') saveState.textContent = '探索进度已自动保存';
    } else saveState.textContent = '当前浏览器未能保存进度';
  }

  function restoreExploration(saved) {
    if (!saved) return false;
    elapsed = saved.elapsed;
    weatherSystem.restore(saved.weather);
    tides.restore(saved.tide);
    raining = Boolean(saved.raining);
    rainStrength.value = String(THREE.MathUtils.clamp(Number.isFinite(saved.rainStrength) ? saved.rainStrength : 100, 0, 100));
    rain = weather.rain;
    puddles.restore(saved.puddles);
    groundMemory.restore(saved.ground);
    footprints.restore(saved.footprints);
    windSelect.value = String([0, .35, .65, 1].reduce((best, n) => Math.abs(n - weather.windTarget) < Math.abs(best - weather.windTarget) ? n : best, .35));
    hero.restoreWetness(saved.clothing);
    enterWalk(trail.spawn, 'walk', { writeHistory: false });
    const exact = walker.restore(saved.walker);
    setFollowing(saved.preferences.following);
    character.setDistance(saved.preferences.distance);
    character.resetWalk();
    character.setDistance(saved.preferences.distance);
    character.frameWalk(0, elapsed);
    wetSurfaces.update();
    syncWeatherControls(); syncTideControls();
    history.replaceState(null, '', '#walk');
    saveState.textContent = exact ? '已恢复上次探索，继续出发吧' : '原位置暂不可通行，已回到雪线入口';
    world.dataset.sessionRestored = exact ? 'true' : 'fallback';
    previous = 0;
    return true;
  }

  resumeButton.addEventListener('click', () => {
    restoreExploration(savedExploration);
    document.getElementById('explore-settings').open = false;
  });
  function applyQuality() {
    if (Math.abs(renderer.getPixelRatio() - quality.state.ratio) > .001) {
      renderer.setPixelRatio(quality.state.ratio); resize();
    }
    const name = ['流畅', '均衡', '高清'][quality.state.level];
    const text = quality.state.mode === 'auto' ? `自动 · 当前${name}` : name;
    if (qualityState.textContent !== text) qualityState.textContent = text;
    world.dataset.quality = String(quality.state.level);
  }
  qualitySelect.addEventListener('change', () => {
    quality.setMode(qualitySelect.value); applyQuality(); exploration.savePreferences(currentPreferences());
  });
  windSelect.addEventListener('change', () => {
    weatherSystem.setWind(Number(windSelect.value)); exploration.savePreferences(currentPreferences());
  });
  for (const element of [soundVolume, soundButton, viewMode]) element.addEventListener('change', () => exploration.savePreferences(currentPreferences()));
  soundButton.addEventListener('click', () => exploration.savePreferences(currentPreferences()));
  viewMode.addEventListener('click', () => queueMicrotask(() => exploration.savePreferences(currentPreferences())));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveExploration();
    previous = 0; quality.resetTiming();
  });

  function activateWalker(spawn, follow, smooth = false) {
    controls.enabled = false;
    controls.stopListenToKeyEvents();
    walker.enter(spawn);
    character.resetWalk(smooth);
    setFollowing(follow);
    character.frameWalk(0, elapsed);
    world.classList.add('is-walking');
    walkButton.setAttribute('aria-pressed', 'true');
    setText('walk-label', '结束探索');
    setText('route-description', '步行途中，也可从这里快速到达');
    renderer.domElement.setAttribute('aria-label', '自由探索。W A S D 或方向键移动，拖动画面转身。陆地上用 Shift 冲刺、C 下蹲、空格跳跃。游泳时用 C 下潜、空格上浮。');
    walkHud.setVisible(true);
    walkHud.update(eye);
    resize();
    camera.updateMatrixWorld();
    updateMarkers();
    syncTourLabel();
    renderer.domElement.focus({ preventScroll: true });
  }

  function spawnAt({ position, yaw, pitch, medium }) {
    return {
      position: position.toArray(),
      target: [position.x + Math.sin(yaw) * 3, position.y + Math.tan(pitch) * 3, position.z + Math.cos(yaw) * 3],
      swimming: medium === 'swim' || medium === 'dive',
      preserveHeight: true,
    };
  }

  function recordWalk() {
    const { x, z } = eye.position;
    const floor = groundSurfaceHeight(x, z);
    const last = handoff.points.at(-1);
    if (eye.position.distanceToSquared(last.position) <= .005 ** 2 && walker.medium === last.medium
      && walker.airborne === last.airborne && walker.crouch === last.crouch && walker.lowClearance === Boolean(last.lowClearance)) return;
    handoff.points.push({
      position: eye.position.clone(), medium: walker.medium, floor, surface: waterSurfaceAt(x, z, floor),
      feet: walker.feet, crouch: walker.crouch, airborne: walker.airborne,
      lowClearance: walker.lowClearance,
    });
  }

  function takeOver() {
    if (!guide.active || handoff) return;
    const state = journey.state;
    guide.setControl('manual');
    handoff = { points: [{ ...state, position: state.position.clone() }] };
    journeyVisible = false;
    world.classList.add('is-guide-manual');
    for (const { button } of markers) button.disabled = true;
    activateWalker(spawnAt(state), true, true);
    setText('route-description', '手动探索中，继续导览后沿原路返回');
  }

  function resumeGuide() {
    if (!handoff || !walker.active) return;
    recordWalk();
    const excursion = handoff;
    const start = excursion.points[0];
    eye.getWorldDirection(facing);
    const yaw = Math.atan2(facing.x, facing.z);
    leaveWalk();
    journeyVisible = true;
    guideAnchorReady = false;
    manualGuideView = false;
    recenterButton.hidden = true;
    controls.enabled = true;
    world.classList.remove('is-guide-manual');
    resize();
    if (excursion.points.at(-1).position.distanceTo(start.position) <= .035) {
      handoff = null;
      for (const { button } of markers) button.disabled = false;
      guide.setControl('auto');
      return;
    }
    const target = start.position.clone().add(new THREE.Vector3(Math.sin(start.yaw) * 3, 0, Math.cos(start.yaw) * 3));
    excursion.returning = createJourney(new Map([['return', { points: excursion.points.reverse(), target }]]));
    excursion.returning.begin();
    excursion.returning.state.yaw = yaw;
    excursion.controller = new AbortController();
    guide.setControl('returning');
    excursion.returning.go('return', excursion.controller.signal).then(() => {
      if (handoff !== excursion) return;
      journey.state.yaw = excursion.returning.state.yaw;
      journey.state.pitch = excursion.returning.state.pitch;
      handoff = null;
      for (const { button } of markers) button.disabled = false;
      guide.setControl('auto');
    }).catch(() => {});
  }

  function leaveWalk() {
    if (!walker.active) return;
    controls.target.copy(camera.getWorldDirection(facing).multiplyScalar(8).add(camera.position));
    controls.target.y = Math.min(camera.position.y - .15, controls.target.y);
    walker.exit();
    walkHud.setVisible(false);
    world.classList.remove('is-walking');
    walkButton.setAttribute('aria-pressed', 'false');
    setText('walk-label', '从雪线出发');
    setText('route-description', '在同一片地形里切换观察位置');
    renderer.domElement.setAttribute('aria-label', '三维流域。拖动转动视角，滚轮缩放，方向键平移。');
    controls.listenToKeyEvents(renderer.domElement);
    resize();
    syncTourLabel();
  }

  function spawnFor(id) {
    return stops.get(id)?.spawn ?? trail.stops[id];
  }

  function focusStop(id, { instant = false, historyMode = 'push' } = {}) {
    const stop = stops.get(id);
    if (!stop) return;
    observation.close();
    guide.stop();
    leaveWalk();
    journeyVisible = false;
    resize();
    activeId = id;
    renderPlace(id, stop);
    if (historyMode && location.hash !== `#${id}`) history[`${historyMode}State`](null, '', `#${id}`);

    const spawn = spawnFor(id);
    setText('walk-label', spawn ? '从这里探索' : '从雪线出发');
    const target = new THREE.Vector3(...stop.target);
    const offset = new THREE.Vector3(...stop.offset);
    if (camera.aspect < 1.05) {
      offset.multiplyScalar(id === 'overview' ? Math.min(1.63, 1 / camera.aspect) : 1.25);
    }
    const destination = target.clone().add(offset);
    destination.y = Math.max(destination.y, groundHeight(destination.x, destination.z) + .72);
    character.stageAt(spawn);
    if (instant || reduceMotion.matches) {
      transition = null;
      controls.enabled = true;
      camera.position.copy(destination);
      controls.target.copy(target);
      controls.update();
      return 0;
    }

    const distance = camera.position.distanceTo(destination);
    controls.enabled = false;
    transition = {
      started: performance.now(), duration: THREE.MathUtils.clamp(820 + distance * 8, 950, 2450),
      lift: Math.min(29, distance * .19),
      start: camera.position.clone(), startTarget: controls.target.clone(), destination, target,
    };
    return transition.duration;
  }

  function fromUrl(instant) {
    const aliases = { storm: 'overview', swallow: 'river', gutter: 'river', floe: 'snow', tidepool: 'tide', reef: 'ocean' };
    const hash = location.hash.slice(1);
    const id = aliases[hash] ?? hash;
    const spawn = stops.get(id)?.spawn;
    if (id === 'walk' && new URLSearchParams(location.search).get('audio') === 'field') {
      const x = 4, z = riverSpan(x)[1] + .7, floor = groundSurfaceHeight(x, z);
      enterWalk({ position: [x, floor + 1.64, z], target: [x + 8, floor + 1.35, z - 2] }, 'river', { writeHistory: false });
      setFollowing(true);
      character.frameWalk(0, elapsed);
      return;
    }
    if (id === 'walk' || spawn?.swimming) {
      enterWalk(spawn ?? trail.spawn, id, { writeHistory: false });
      return;
    }
    focusStop(stops.has(id) ? id : 'overview', { instant, historyMode: null });
  }

  function releaseCamera() {
    if (observation.active) return;
    if (guide.active && !walker.active) {
      manualGuideView = true;
      recenterButton.hidden = false;
    }
    if (!transition) return;
    transition = null;
    controls.enabled = !walker.active;
  }

  function stopGuide() {
    guide.stop();
    releaseCamera();
  }

  function moveCamera(now) {
    if (transition) {
      const p = Math.min(1, (now - transition.started) / transition.duration);
      const eased = p * p * (3 - 2 * p);
      camera.position.lerpVectors(transition.start, transition.destination, eased);
      camera.position.y += Math.sin(p * Math.PI) * transition.lift;
      controls.target.lerpVectors(transition.startTarget, transition.target, eased);
      if (p === 1) {
        transition = null;
        controls.enabled = true;
      }
    }
    camera.position.y = Math.max(camera.position.y, groundHeight(camera.position.x, camera.position.z) + .5, .25);
    controls.update();
    staticCollision.constrainCamera(controls.target, camera.position, camera.position, cameraClearance(camera), true);
    camera.lookAt(controls.target);
  }

  function frameJourney(dt, time) {
    const motion = handoff?.returning ?? journey;
    motion.update(dt);
    const state = motion.state;
    character.frameJourney(dt, time, state, guide.active);
    guideDepth.hidden = state.medium !== 'dive';
    if (!guideDepth.hidden) {
      const label = `水深 ${Math.max(0, state.surface - state.position.y).toFixed(1)} m`;
      if (guideDepth.textContent !== label) guideDepth.textContent = label;
    }
    const directionX = Math.sin(state.yaw);
    const directionZ = Math.cos(state.yaw);
    const swimming = state.medium === 'swim' || state.medium === 'dive';
    followAnchor.copy(state.position);
    followAnchor.x += directionX * .95;
    followAnchor.z += directionZ * .95;
    followAnchor.y -= swimming ? .32 : .41;
    if (guideAnchorReady) {
      anchorDelta.subVectors(followAnchor, lastAnchor);
      camera.position.add(anchorDelta);
      controls.target.add(anchorDelta);
    }
    guideAnchorReady = true;
    lastAnchor.copy(followAnchor);

    if (guide.active && !manualGuideView) {
      const behind = swimming ? 4.2 : 5.2;
      const shoulder = swimming ? 1.48 : .86;
      chasePosition.copy(state.position);
      chasePosition.x += -directionX * behind - directionZ * shoulder;
      chasePosition.z += -directionZ * behind + directionX * shoulder;
      chasePosition.y += swimming ? .40 : 1.12;
      if (state.medium === 'dive') chasePosition.y = Math.min(chasePosition.y, state.surface - .12);
      chasePosition.y = Math.max(chasePosition.y, groundSurfaceHeight(chasePosition.x, chasePosition.z) + .39);
      const damping = 1 - Math.exp(-dt * 2.7);
      camera.position.lerp(chasePosition, damping);
      controls.target.lerp(followAnchor, damping);
    }
    camera.position.y = Math.max(camera.position.y, groundSurfaceHeight(camera.position.x, camera.position.z) + .32);
    controls.update();
    staticCollision.constrainCamera(state.position, camera.position, camera.position, cameraClearance(camera));
    camera.lookAt(controls.target);
    if (travelCaption && journey.moving) {
      const note = describePassage(state);
      if (note !== lastTravelNote) {
        lastTravelNote = note;
        travelCaption(note);
      }
    }
  }

  function updateMarkers() {
    const observed = journeyVisible ? (handoff?.returning ?? journey).state.position : (walker.active ? eye : camera).position;
    const x = THREE.MathUtils.clamp(observed.x, -119, 115);
    const z = THREE.MathUtils.clamp(observed.z, -54, 54);
    mapCamera.setAttribute('cx', x.toFixed(1));
    mapCamera.setAttribute('cy', z.toFixed(1));
    const lookAt = walker.active ? eye.getWorldDirection(facing).multiplyScalar(13).add(eye.position) : controls.target;
    mapSight.setAttribute('d', `M${x.toFixed(1)} ${z.toFixed(1)} L${lookAt.x.toFixed(1)} ${lookAt.z.toFixed(1)}`);
    const placed = [];
    for (const marker of markers) {
      projected.copy(marker.point).project(camera);
      const inside = Math.abs(projected.x) < .92 && Math.abs(projected.y) < .83 && projected.z > 0 && projected.z < 1;
      const occupied = placed.some(([px, py]) => Math.hypot((px - projected.x) * camera.aspect, py - projected.y) < .085);
      marker.pin.hidden = activeId !== 'overview' || stops.get(marker.id).spawn?.swimming || !inside || occupied;
      if (!marker.pin.hidden) {
        placed.push([projected.x, projected.y]);
        marker.pin.style.left = `${50 + projected.x * 50}%`;
        marker.pin.style.top = `${50 - projected.y * 50}%`;
      }
    }
    hero.head.getWorldPosition(projected);
    projected.y += .44;
    projected.project(camera);
    const showHero = hero.group.visible && !transition && (journeyVisible || character.following && walker.active)
      && Math.abs(projected.x) < .91 && Math.abs(projected.y) < .83 && projected.z > 0 && projected.z < 1;
    heroTag.hidden = !showHero;
    if (showHero) {
      heroTag.style.left = `${50 + projected.x * 50}%`;
      heroTag.style.top = `${50 - projected.y * 50}%`;
    }
  }

  overviewButton.addEventListener('click', () => focusStop('overview'));
  walkButton.addEventListener('click', () => {
    if (walker.active) focusStop('overview');
    else enterWalk(spawnFor(activeId));
  });
  function syncWeatherControls() {
    weatherButton.setAttribute('aria-pressed', String(raining));
    setText('weather-label', raining ? '停止降雨' : '开始下雨');
    const strength = Number(rainStrength.value);
    const level = strength < 5 ? '停雨' : strength < 40 ? '小雨' : strength < 75 ? '中雨' : '大雨';
    if (rainStrengthLabel.textContent !== level) rainStrengthLabel.textContent = level;
    const stageNote = `中游水位 +${(weather.riverRise ?? 0).toFixed(1)} m`;
    const description = (weather.riverStage ?? 0) > .025
      ? `${stageNote} · ${raining ? '雨水持续汇入河道' : '雨后径流逐渐消退'}`
      : !raining ? '停雨后，河水和积水逐渐恢复'
      : weather.runoff < .25 ? '雨水正在汇入河道'
      : weather.wetness > .45 ? '河水渐急，低洼岸边出现积水' : '河水渐急，水色逐渐变浑';
    if (rainState.textContent !== description) rainState.textContent = description;
    rainSettings.hidden = !raining && weather.wetness < .08 && weather.runoff < .035 && (weather.riverStage ?? 0) < .025;
    world.classList.toggle('has-rain-panel', !rainSettings.hidden);
  }
  function syncTideControls() {
    const rising = Math.cos(tides.state.phase) >= 0;
    const slack = Math.abs(tides.state.flow) < .09;
    const label = slack ? tides.state.level > 0 ? '近高潮' : '近低潮' : rising ? '涨潮' : '退潮';
    if (tidePhase.textContent !== label) tidePhase.textContent = label;
    riverCurrentAt(60, riverZ(60), groundSurfaceHeight(60, riverZ(60)), 0, mouthCurrent, weather.runoff);
    const current = Math.abs(mouthCurrent.x) < .08 ? '流速正在换向'
      : `${mouthCurrent.x < 0 ? '← 向河内' : '向海里 →'} ${Math.abs(mouthCurrent.x).toFixed(1)} m/s`;
    const text = `海面 ${tides.state.level >= 0 ? '+' : ''}${tides.state.level.toFixed(2)} m · ${current}`;
    if (tideState.textContent !== text) tideState.textContent = text;
    const button = rising ? '转为退潮' : '转为涨潮';
    if (tideReverse.textContent !== button) tideReverse.textContent = button;
    const direction = mouthCurrent.x < -.08 ? 'inland' : mouthCurrent.x > .08 ? 'seaward' : 'slack';
    if (world.dataset.tideDirection !== direction) world.dataset.tideDirection = direction;
  }
  tideReverse.addEventListener('click', () => {
    tides.setDirection(Math.cos(tides.state.phase) < 0);
    syncTideControls();
    if (walker.active) renderer.domElement.focus({ preventScroll: true });
  });
  weatherButton.addEventListener('click', () => {
    raining = !raining;
    if (raining && Number(rainStrength.value) === 0) rainStrength.value = '100';
    syncWeatherControls();
    if (walker.active) renderer.domElement.focus({ preventScroll: true });
  });
  rainStrength.addEventListener('input', () => {
    raining = Number(rainStrength.value) > 0;
    syncWeatherControls();
  });
  tourButton.addEventListener('click', () => {
    if (guide.active) stopGuide();
    else guide.start(underwaterStart());
  });
  recenterButton.addEventListener('click', () => {
    manualGuideView = false;
    recenterButton.hidden = true;
  });
  takeoverButton.addEventListener('click', () => {
    if (handoff && walker.active) resumeGuide();
    else takeOver();
  });
  viewMode.addEventListener('click', () => {
    if (!walker.active) return;
    setFollowing(!character.following);
    renderer.domElement.focus({ preventScroll: true });
  });
  renderer.domElement.addEventListener('pointerdown', releaseCamera, { capture: true });
  renderer.domElement.addEventListener('wheel', (event) => {
    releaseCamera();
    if (walker.active && character.following) {
      event.preventDefault();
      character.zoom(event.deltaY);
    }
  }, { capture: true, passive: false });
  renderer.domElement.addEventListener('keydown', (event) => {
    if (!guide.active && walker.active && event.key === 'Escape') {
      focusStop('overview');
      overviewButton.focus({ preventScroll: true });
    }
    if (event.key.startsWith('Arrow')) releaseCamera();
  }, { capture: true });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && guide.active) stopGuide();
  });
  window.addEventListener('keydown', (event) => {
    if (guide.active && !handoff && (movementKeys.test(event.code) || event.code === 'KeyF') && !event.ctrlKey && !event.altKey && !event.metaKey) takeOver();
  }, { capture: true });
  window.addEventListener('hashchange', () => fromUrl(false));
  new ResizeObserver(resize).observe(viewport);
  resize();
  if (new URLSearchParams(location.search).get('water') === 'play') {
    const x = 62.1, z = 45;
    enterWalk({ position: [x, groundSurfaceHeight(x, z) + 1.64, z],
      target: [72, -.5, z] }, 'walk', { writeHistory: false });
    setFollowing(true); character.setDistance(3.5); character.frameWalk(0, elapsed);
  } else if (new URLSearchParams(location.search).get('shore') === 'footprints') {
    const x = 59.4, z = 28;
    enterWalk({ position: [x, groundSurfaceHeight(x, z) + 1.64, z],
      target: [70, -1.8, z] }, 'walk', { writeHistory: false });
    setFollowing(true);
    character.setDistance(3.35);
    character.frameWalk(0, elapsed);
  } else if (new URLSearchParams(location.search).get('weather') === 'after-rain') {
    // Prepare an actual rain/recession history so this view can open directly on exposed wet soil.
    for (let i = 0; i < 2000; i++) {
      elapsed += .1;
      weatherSystem.update(.1, i < 600 ? 1 : 0);
      puddles.update(.1, elapsed, weather);
      groundMemory.update(.1, elapsed);
    }
    wetSurfaces.update();
    enterWalk({ position: [-36.48276, groundSurfaceHeight(-36.48276, 5.10859) + 1.64, 5.10859],
      target: [-30.53448, groundSurfaceHeight(-30.53448, 5.89470) + .45, 5.89470] }, 'walk', { writeHistory: false });
    setFollowing(true);
    character.zoom(-100);
    character.frameWalk(0, elapsed);
  } else if (location.hash === '#estuary') {
    const x = 60, z = riverZ(x), surface = seaSurfaceHeight();
    enterWalk({ position: [x, surface + .26, z], target: [69, surface + .1, 8], swimming: true }, 'wetland', { writeHistory: false });
    setFollowing(true);
    character.frameWalk(0, elapsed);
  } else if (!location.search && (!location.hash || location.hash === '#walk') && savedExploration) {
    restoreExploration(savedExploration);
  } else fromUrl(true);
  applyQuality();

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { previous = 0; return; }
    if (now - previous < 24) return;
    const frameStart = performance.now();
    const dt = previous ? Math.min((now - previous) / 1000, .068) : 1 / 30;
    previous = now;
    elapsed += dt;
    tides.update(dt);
    weatherSystem.update(dt, raining ? Number(rainStrength.value) / 100 : 0);
    puddles.update(dt, elapsed, weather);
    groundMemory.update(dt, elapsed);
    rain = weather.rain;
    cloud.value = rain;
    syncWeatherControls();
    syncTideControls();
    let soundSpeed = 0;
    if (observation.active) {
      observation.update();
      if (observationWasWalking) {
        walker.refreshWater(dt, handoff ? recordWalk : undefined);
        character.framePaused(dt, elapsed);
      }
      else character.frameStage(dt, elapsed);
    } else if (journeyVisible) {
      frameJourney(dt, elapsed);
      soundSpeed = (handoff?.returning ?? journey).state.speed;
    } else if (walker.active) {
      const oldX = eye.position.x;
      const oldZ = eye.position.z;
      walker.update(dt, handoff ? recordWalk : undefined);
      soundSpeed = walker.medium === 'swim' || walker.medium === 'dive' ? walker.swimMotion.length()
        : Math.hypot(eye.position.x - oldX, eye.position.z - oldZ) / dt;
      if (handoff) recordWalk();
      character.frameWalk(dt, elapsed);
      walkHud.update(eye);
      syncTourLabel();
    } else {
      moveCamera(now);
      character.frameStage(dt, elapsed);
    }
    const observer = walker.active || observationWasWalking ? eye.position
      : journeyVisible ? (handoff?.returning ?? journey).state.position : null;
    observation.updateCandidate(walker.active ? eye.position : null, activeId,
      !observation.active && (!guide.active || handoff !== null)
      && (!walker.active || (!walker.airborne && walker.medium !== 'swim' && walker.medium !== 'dive')));
    const viewSurface = journeyVisible || walker.active
      ? waterSurfaceAt(camera.position.x, camera.position.z, groundSurfaceHeight(camera.position.x, camera.position.z)) : null;
    const depth = viewSurface !== null ? Math.max(0, viewSurface - camera.position.y) : 0;
    const motion = journeyVisible ? (handoff?.returning ?? journey).state : null;
    const wildlifeVisitor = visitorTracker.update(observer, walker.active || observationWasWalking ? walker.medium : motion?.medium ?? 'walk',
      hero.group.rotation.y, walker.active || observationWasWalking ? walker.feet : motion?.feet, dt);
    const footContacts = hero.drainFootContacts();
    for (const contact of footContacts) {
      contact.medium = walker.active ? walker.lowClearance ? 'low' : walker.medium
        : motion?.lowClearance ? 'low' : motion?.medium ?? 'walk';
      contact.crouch = walker.active ? walker.crouch : motion?.crouch ?? 0;
      contact.ground = groundMemory.sampleAt(contact.x, contact.z, {});
      const support = staticCollision.supportAt(contact.x, contact.y, contact.z);
      if (support || Math.abs(contact.y - groundSurfaceHeight(contact.x, contact.z)) > .18) {
        Object.assign(contact.ground, { substrate: support?.substrate ?? 'stone', floor: support?.floor ?? contact.y,
          mud: 0, residue: 0, waterline: 0, waterDepth: 0, waterHeight: null });
      }
      contact.soleWetness = hero.wetFootContact(contact.side, contact.ground);
      footprints.step(contact);
    }
    footContactCount += footContacts.length;
    const waterEvents = [...walker.drainWaterEvents(), ...hero.drainWaterEvents()];
    for (const event of waterEvents) {
      waterActions.emit(event);
      if (event.kind === 'entry' || event.kind === 'play') {
        for (const fish of water.fish) {
          const range = Math.hypot(fish.position.x - event.x, fish.position.y - event.y, fish.position.z - event.z);
          if (range < 1.5 + event.strength * 4) fish.alarm = Math.max(fish.alarm ?? 0, event.strength);
        }
      }
    }
    for (const [name, value] of Object.entries({ footContacts: footContactCount,
      footprints: footprints.stats.footprintsCreated, splashes: footprints.stats.splashesCreated,
      wetFootprints: footprints.stats.wetPrints, dryFootprints: footprints.stats.dryImpressions,
      coveredFootprints: footprints.stats.submergedPrints, erodedFootprints: footprints.stats.erodedPrints,
      waterEntries: waterActions.stats.entries, waterPlays: waterActions.stats.plays,
      waterStrokes: waterActions.stats.strokes, waterBubbles: waterActions.stats.bubbles,
      fishAlarmed: water.fish.reduce((count, fish) => count + Number((fish.alarm ?? 0) > .3), 0),
      birdsAlarmed: [...extras.birds, ...station.birds].reduce((count, bird) => count + Number(bird.fear > .1), 0) })) {
      if (world.dataset[name] !== String(value)) world.dataset[name] = String(value);
    }
    rainEnvironment.sample(camera.position, listenerRain);
    audio.update(dt, {
      listener: camera, actor: observation.active ? null : observer,
      medium: walker.active ? walker.lowClearance ? 'low' : walker.medium
        : motion?.lowClearance ? 'low' : motion?.medium ?? 'walk',
      airborne: walker.active ? walker.airborne : motion?.airborne ?? false,
      crouch: walker.active ? walker.crouch : motion?.crouch ?? 0,
      speed: soundSpeed, rain, runoff: weather.runoff, bee: beeSoundPosition,
      footContacts,
      waterEvents,
      weather, rainExposure: listenerRain.exposure, rainSurface: listenerRain.surface,
      rainCover: listenerRain.cover, rainCoverHeight: listenerRain.coverHeight,
      beeActivity: ecology.rainState?.beeActivity ?? 1,
      puddleDepth: observer ? Math.max(0, (puddles.surfaceAt(observer.x, observer.z) ?? -Infinity)
        - groundSurfaceHeight(observer.x, observer.z)) : 0,
    });
    syncSoundButton();
    submersion = THREE.MathUtils.damp(submersion, THREE.MathUtils.smoothstep(depth, .01, .19), 8, dt);
    const riverInfluence = 1 - THREE.MathUtils.smoothstep(camera.position.x, 52, 65);
    waterFog.copy(underwaterFog).lerp(riverFog, riverInfluence);
    waterFog.lerp(muddyRiverFog, riverInfluence * weather.turbidity * .70);
    scene.fog.color.copy(clearFog).lerp(rainFog, rain).lerp(waterFog, submersion);
    const wideViewFog = activeId === 'overview' && camera.aspect < 1.05 ? 80 : 0;
    const waterNear = THREE.MathUtils.lerp(3.8, 1.3, riverInfluence);
    const waterFar = THREE.MathUtils.lerp(43, 19 - weather.turbidity * 9, riverInfluence) - Math.min(7, depth * 1.3);
    scene.fog.near = THREE.MathUtils.lerp(145 + wideViewFog, waterNear, submersion);
    scene.fog.far = THREE.MathUtils.lerp(THREE.MathUtils.lerp(485, 293, rain) + wideViewFog, waterFar, submersion);
    sunlight.intensity = THREE.MathUtils.lerp(THREE.MathUtils.lerp(2.2, .58, rain), 1.36, submersion);
    sunlight.color.copy(clearSun).lerp(underwaterSun, submersion);
    hemisphere.intensity = THREE.MathUtils.lerp(THREE.MathUtils.lerp(1.64, 1.18, rain), 1.28, submersion);
    hemisphere.color.copy(clearAmbient).lerp(underwaterAmbient, submersion);
    sky.position.copy(camera.position);
    sky.material.uniforms.time.value = elapsed;
    sky.material.uniforms.rain.value = rain;
    sky.material.uniforms.submersion.value = submersion;
    riverClock.value = elapsed;
    water.update(dt, elapsed, rain, camera, wildlifeVisitor, staticCollision, weather);
    waterActions.update(dt, camera, observer, walker.active ? walker.medium : motion?.medium,
      hero.group.rotation.y, soundSpeed);
    world.dataset.waterFeedback = JSON.stringify({ phase: Number(walker.playPhase.toFixed(2)),
      crowns: waterActions.crowns.count, drops: waterActions.stats.droplets,
      viewDepth: Number(depth.toFixed(2)), eyeY: Number(eye.position.y.toFixed(2)),
      camera: camera.position.toArray().map((n) => Number(n.toFixed(2))) });
    flowTraces.update(dt, camera.position, weather.runoff);
    footprints.update(dt, elapsed);
    wetSurfaces.update();
    underwater.update(dt, elapsed, depth, camera, weather);
    ecology.update(dt, elapsed, rain, weather, wildlifeVisitor, staticCollision);
    station.update(elapsed, rain, dt, wildlifeVisitor, staticCollision);
    biomes.update(dt, elapsed, rain, observer, staticCollision, wildlifeVisitor);
    extras.update(dt, elapsed, rain, wildlifeVisitor, staticCollision);
    renderer.render(scene, camera);
    updateMarkers();
    loading.hidden = true;
    world.dataset.clothingWetness = Math.round(hero.wetness.upper * 100).toString();
    world.dataset.clothingDrips = String(hero.drips.active);
    saveElapsed += dt;
    if (saveElapsed > 5) { saveElapsed = 0; saveExploration(); }
    quality.update(performance.now() - frameStart, dt);
    applyQuality();
  }
  requestAnimationFrame(frame);
}

try {
  run();
} catch (error) {
  console.error('World initialization failed', error);
  setText('error-text', '这次没能加载 3D 世界，可以刷新页面重试。');
  document.getElementById('world-error').hidden = false;
  loading.hidden = true;
}
