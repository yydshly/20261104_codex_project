import { MathUtils, Vector3 } from 'three';
import {
  coastlineX, groundSurfaceHeight, riverCurrentAt, riverSpan, riverSurfaceHeight,
  riverZ, RIVER_SOURCE, RIVER_MOUTH, waterSurfaceAt,
} from './world-terrain.js';
import { trailClearance } from './world-trail.js';
import { createRecordedAmbience, recordingMix } from './world-ambience.js';
import { seaSurfaceHeight } from './world-tides.js';

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function riverSoundProfile({ flowSpeed = 0, grade = 0, distance = 0, runoff = 0, submerged = 0 } = {}) {
  const near = 1 - MathUtils.smoothstep(distance, 2.5, 34);
  // Fast, smooth tidal water need not roar. Audible turbulence comes mainly
  // from bed gradient and runoff, rather than the speed alone.
  const rapid = MathUtils.smoothstep(grade, .035, .28) * MathUtils.smoothstep(flowSpeed, .35, 1.8);
  const turbulent = Math.max(rapid, clamp(runoff, 0, 1) * .26 * MathUtils.smoothstep(flowSpeed, .3, 1.7));
  const moving = MathUtils.smoothstep(flowSpeed, .04, 1.2);
  const level = near * (1 - clamp(submerged, 0, 1) * .88);
  return { rapid: turbulent, near,
    ripple: level * (.007 + moving * .018 + turbulent * .20),
    low: level * (.004 + moving * .012 + turbulent * .13),
    frequency: 570 + turbulent * 1510,
  };
}

// The layers share the ambience master, so narration, mute and underwater filtering
// apply to rain in exactly the same way as the other environmental sounds.
export function rainSoundProfile({ rain = 0, wetness = 0, rainExposure = 1,
  rainSurface = 'ground', rainCover = 'open', submerged = 0 } = {}) {
  const strength = clamp(rain, 0, 1);
  const exposure = clamp(rainExposure, 0, 1);
  const air = 1 - clamp(submerged, 0, 1) * .97;
  const roof = rainCover === 'roof';
  const leaves = rainCover === 'tree' || rainSurface === 'foliage';
  const water = rainSurface === 'water';
  const direct = strength * exposure * air;
  return {
    distant: strength * air * (roof ? .020 : leaves ? .035 : .055),
    ground: direct * (roof ? .015 : water ? .025 : leaves ? .050 : .140),
    water: direct * (water ? .190 : .012),
    foliage: strength * air * (leaves ? .145 : .008) * (roof ? .18 : 1),
    roof: strength * air * (roof ? .145 : rainSurface === 'roof' ? .115 : 0),
    drip: clamp(wetness, 0, 1) * air * (roof ? .043 : leaves ? .032 : 0),
  };
}

export function createWorldAudio({ fetchAudio, onRecordingStatus } = {}) {
  let context = null;
  let graph = null;
  let enabled = true;
  let volume = .58;
  let narrating = false;
  let disposed = false;
  let recordings = null;
  let hidden = document.hidden;
  let spatialElapsed = 0;
  let stepDistance = 0;
  let swimDistance = 0;
  let nextBubble = 1.1;
  let nextRainImpact = .1;
  let nextDrip = .7;
  let hasActor = false;
  let leftFoot = false;
  const previousActor = new Vector3();
  const direction = new Vector3();
  const up = new Vector3();
  const flow = new Vector3();
  const eventPosition = new Vector3();
  const calmPosition = new Vector3();
  const rapidPosition = new Vector3();
  const surfPosition = new Vector3();
  const transients = new Set();
  const permanent = [];

  function smooth(parameter, value, seconds = .20) {
    parameter.setTargetAtTime(value, context.currentTime, seconds);
  }

  function setMaster() {
    if (!graph) return;
    smooth(graph.master.gain, enabled && !hidden ? volume * (narrating ? .27 : 1) : 0, narrating ? .16 : .42);
  }

  function panner(reference = 2, maximum = 35) {
    const node = context.createPanner();
    node.panningModel = 'HRTF';
    node.distanceModel = 'inverse';
    node.refDistance = reference;
    node.maxDistance = maximum;
    node.rolloffFactor = .85;
    return node;
  }

  function locate(node, x, y, z) {
    if (node.positionX) {
      smooth(node.positionX, x, .09);
      smooth(node.positionY, y, .09);
      smooth(node.positionZ, z, .09);
    } else node.setPosition(x, y, z);
  }

  function noiseBuffer(seconds, channels = 1) {
    const buffer = context.createBuffer(channels, Math.ceil(context.sampleRate * seconds), context.sampleRate);
    for (let channel = 0; channel < channels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * .72;
    }
    return buffer;
  }

  function loop(buffer, type, frequency, quality, spatial = false) {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const position = spatial ? panner(5, 65) : null;
    source.buffer = buffer;
    source.loop = true;
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = quality;
    gain.gain.value = 0;
    source.connect(filter);
    filter.connect(gain);
    if (position) {
      gain.connect(position);
      position.connect(graph.filter);
    } else gain.connect(graph.filter);
    source.start(0, Math.random() * buffer.duration);
    permanent.push(source);
    return { source, filter, gain, position };
  }

  function build() {
    const master = context.createGain();
    const filter = context.createBiquadFilter();
    const compressor = context.createDynamicsCompressor();
    master.gain.value = 0;
    filter.type = 'lowpass';
    filter.frequency.value = 14000;
    filter.Q.value = .45;
    compressor.threshold.value = -16;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = .015;
    compressor.release.value = .22;
    filter.connect(master);
    master.connect(compressor);
    compressor.connect(context.destination);
    graph = { master, filter, compressor, noise: noiseBuffer(4.9), stereo: noiseBuffer(5.7, 2) };
    recordings = createRecordedAmbience(context, filter, { fetchAudio, onStatus: onRecordingStatus });
    graph.submerged = loop(graph.stereo, 'lowpass', 240, .55);
    graph.rainDistant = loop(graph.stereo, 'lowpass', 1700, .35);
    graph.rainGround = loop(graph.stereo, 'highpass', 1250, .45);
    graph.rainWater = loop(graph.stereo, 'bandpass', 2500, .58);
    graph.rainFoliage = loop(graph.stereo, 'bandpass', 4100, .72);
    graph.rainRoof = loop(graph.stereo, 'bandpass', 790, 1.15);
    graph.buzzGain = context.createGain();
    graph.buzzGain.gain.value = 0;
    graph.buzzFilter = context.createBiquadFilter();
    graph.buzzFilter.type = 'lowpass';
    graph.buzzFilter.frequency.value = 1150;
    graph.buzzFilter.Q.value = .55;
    graph.beePosition = panner(.9, 17);
    graph.buzzFilter.connect(graph.buzzGain);
    graph.buzzGain.connect(graph.beePosition);
    graph.beePosition.connect(filter);
    graph.bees = [184, 197, 216].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 1 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 1 ? .55 : .30;
      oscillator.connect(gain);
      gain.connect(graph.buzzFilter);
      oscillator.start();
      permanent.push(oscillator);
      return oscillator;
    });
    const rumble = context.createOscillator();
    const rumbleGain = context.createGain();
    rumble.type = 'sine';
    rumble.frequency.value = 58;
    rumbleGain.gain.value = 0;
    rumble.connect(rumbleGain);
    rumbleGain.connect(filter);
    rumble.start();
    permanent.push(rumble);
    graph.rumble = rumbleGain;
    setMaster();
  }

  function unlock() {
    if (disposed) return Promise.resolve(false);
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return Promise.resolve(false);
    try {
      if (!context) {
        context = new Audio({ latencyHint: 'interactive' });
        build();
      }
      recordings?.load();
      if (document.hidden) return Promise.resolve(false);
      hidden = false;
      setMaster();
      return context.resume().then(() => context.state === 'running').catch(() => false);
    } catch {
      return Promise.resolve(false);
    }
  }

  function burst({ position, frequency, duration, level, type = 'lowpass', pitch = 1 }) {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const spatial = panner(2.5, 22);
    const now = context.currentTime;
    source.buffer = graph.noise;
    source.playbackRate.value = pitch;
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = .55;
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, level), now + .009);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    spatial.setPosition(position.x, position.y, position.z);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(spatial);
    spatial.connect(graph.filter);
    const item = { source, nodes: [source, filter, gain, spatial] };
    transients.add(item);
    source.onended = () => {
      item.nodes.forEach((node) => node.disconnect());
      transients.delete(item);
    };
    source.start(now, Math.random() * (graph.noise.duration - .5), duration);
    source.stop(now + duration + .015);
  }

  function step(actor, medium, crouch, speed, ground = null, contact = false) {
    leftFoot = !leftFoot;
    const floor = groundSurfaceHeight(actor.x, actor.z);
    eventPosition.set(actor.x + (contact ? 0 : leftFoot ? -.11 : .11), contact ? actor.y + .05 : floor + .08, actor.z);
    const inWater = contact ? (ground?.waterDepth ?? 0) > .008 : medium === 'wade';
    const impact = actor.landing ? MathUtils.clamp(actor.impact ?? .5, 0, 1) : 0;
    if (impact > 0) burst({ position: eventPosition, frequency: inWater ? 310 : ground?.mud > .2 ? 230 : 180,
      duration: .10 + impact * .10, level: .065 + impact * .09, type: 'lowpass', pitch: .8 });
    if (inWater) {
      burst({ position: eventPosition, frequency: 1550, duration: .20 + impact * .11,
        level: (.17 + Math.min(.05, (ground?.waterDepth ?? .1) * .2)) * (1 + impact * .5), type: 'bandpass' });
      burst({ position: eventPosition, frequency: 460, duration: .10, level: .055 });
    } else if (ground?.mud > .18 && ground.localWetness > .25) {
      burst({ position: eventPosition, frequency: 430, duration: .17 + impact * .10, level: .14 * (1 - crouch * .4) * (1 + impact * .4), pitch: .83 + Math.random() * .13 });
      burst({ position: eventPosition, frequency: 940, duration: .10, level: .055, type: 'bandpass', pitch: .8 + Math.random() * .2 });
    } else if (ground?.substrate === 'wood') {
      burst({ position: eventPosition, frequency: 620, duration: .095, level: .14, type: 'bandpass' });
    } else if (actor.x < -84 && floor > 22) {
      burst({ position: eventPosition, frequency: 2400, duration: .16, level: .15, type: 'bandpass', pitch: .82 + Math.random() * .25 });
    } else {
      const path = trailClearance(actor.x, actor.z);
      burst({ position: eventPosition, frequency: path ? 1350 : 730, duration: path ? .09 : .13,
        level: (path ? .18 : .16) * (1 - crouch * .48) * (speed > 4 ? 1.13 : 1), pitch: .88 + Math.random() * .2 });
    }
  }

  function bubble(actor, moving) {
    const source = context.createOscillator();
    const gain = context.createGain();
    const position = panner(2, 20);
    const now = context.currentTime;
    source.type = 'sine';
    const frequency = 210 + Math.random() * 140;
    source.frequency.setValueAtTime(frequency, now);
    source.frequency.exponentialRampToValueAtTime(frequency * 1.55, now + .11);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(moving ? .018 : .009, now + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .16);
    position.setPosition(actor.x + (Math.random() - .5) * 1.8, actor.y + .25, actor.z + .4);
    source.connect(gain);
    gain.connect(position);
    position.connect(graph.filter);
    const item = { source, nodes: [source, gain, position] };
    transients.add(item);
    source.onended = () => {
      item.nodes.forEach((node) => node.disconnect());
      transients.delete(item);
    };
    source.start(now);
    source.stop(now + .17);
  }

  function stopTransients() {
    for (const item of transients) {
      item.source.onended = null;
      try { item.source.stop(); } catch {}
      item.nodes.forEach((node) => node.disconnect());
    }
    transients.clear();
  }

  function visibilityChanged() {
    hidden = document.hidden;
    hasActor = false;
    stepDistance = 0;
    swimDistance = 0;
    setMaster();
    if (hidden && context) {
      stopTransients();
      context.suspend().catch(() => {});
    } else if (!hidden && context && enabled && !disposed) {
      // A previously unlocked context may resume; a new page still needs a gesture.
      context.resume().then(() => { if (!disposed) setMaster(); }).catch(() => {});
    }
  }
  document.addEventListener('visibilitychange', visibilityChanged);

  return {
    unlock,
    update(dt, {
      listener, actor = null, medium = 'walk', airborne = false, crouch = 0, speed = 0,
      rain = 0, runoff = 0, puddleDepth = 0, bee = [-3, 8, 19],
      beeActivity = 1,
      weather = null, rainExposure = 1, rainSurface = 'ground', rainCover = 'open', rainCoverHeight = null,
      footContacts = null, waterEvents = null,
    }) {
      if (disposed || !graph || context.state !== 'running' || hidden || !listener) {
        hasActor = false;
        return;
      }
      dt = clamp(dt, 0, .12);
      const now = context.currentTime;
      const eye = listener.position;
      listener.getWorldDirection(direction);
      up.set(0, 1, 0).applyQuaternion(listener.quaternion);
      const audioListener = context.listener;
      if (audioListener.positionX) {
        smooth(audioListener.positionX, eye.x, .035);
        smooth(audioListener.positionY, eye.y, .035);
        smooth(audioListener.positionZ, eye.z, .035);
        smooth(audioListener.forwardX, direction.x, .035);
        smooth(audioListener.forwardY, direction.y, .035);
        smooth(audioListener.forwardZ, direction.z, .035);
        smooth(audioListener.upX, up.x, .035);
        smooth(audioListener.upY, up.y, .035);
        smooth(audioListener.upZ, up.z, .035);
      } else {
        audioListener.setPosition(eye.x, eye.y, eye.z);
        audioListener.setOrientation(direction.x, direction.y, direction.z, up.x, up.y, up.z);
      }
      const ground = groundSurfaceHeight(eye.x, eye.z);
      const surface = waterSurfaceAt(eye.x, eye.z, ground);
      const submerged = surface === null ? 0 : MathUtils.smoothstep(surface - eye.y, .015, .36);
      const rainLayers = rainSoundProfile({ rain, wetness: weather?.wetness ?? rain, rainExposure,
        rainSurface, rainCover, submerged });
      smooth(graph.filter.frequency, MathUtils.lerp(14000, 410, submerged), .22);
      smooth(graph.submerged.gain.gain, submerged * (.13 + Math.sin(now * .61) * .019), .38);
      smooth(graph.rumble.gain, submerged * (.008 + Math.sin(now * .27) * .0015), .5);

      const moved = actor && hasActor ? Math.hypot(actor.x - previousActor.x, actor.z - previousActor.z) : 0;
      if (actor) previousActor.copy(actor);
      hasActor = Boolean(actor);
      if (Array.isArray(footContacts)) {
        stepDistance = 0;
        if (enabled && !airborne && (medium === 'walk' || medium === 'wade')) {
          for (const contact of footContacts) step(contact, medium, contact.crouch ?? crouch,
            contact.speed ?? speed, contact.ground, true);
        }
      } else if (enabled && actor && !airborne && moved < 1.2 && (medium === 'walk' || medium === 'wade')) {
        stepDistance += moved;
        const stride = crouch > .2 ? .47 : speed > 4 ? .93 : .69;
        if (stepDistance >= stride) {
          stepDistance %= stride;
          step(actor, medium === 'walk' && puddleDepth > .012 ? 'wade' : medium, crouch, speed);
        }
      } else stepDistance = 0;
      if (enabled && waterEvents) {
        for (const event of waterEvents) {
          if (![event.x, event.y, event.z, event.strength].every(Number.isFinite)) continue;
          eventPosition.set(event.x, event.y, event.z);
          const entry = event.kind === 'entry', bubbleEvent = event.kind === 'bubble';
          burst({ position: eventPosition, frequency: entry ? 730 : bubbleEvent ? 310 : 1550,
            duration: entry ? .48 : bubbleEvent ? .3 : .18,
            level: (entry ? .24 : event.kind === 'play' ? .18 : .07) * clamp(event.strength, .05, 1), type: 'bandpass' });
          if (entry) burst({ position: eventPosition, frequency: 155, duration: .32,
            level: .19 * clamp(event.strength, .05, 1), type: 'lowpass' });
        }
      }
      if (enabled && !waterEvents && actor && (medium === 'swim' || medium === 'dive') && speed > .25) {
        swimDistance += dt * Math.min(speed, 4.5);
        if (swimDistance > 3.1) {
          swimDistance %= 3.1;
          eventPosition.set(actor.x, actor.y - .18, actor.z);
          burst({ position: eventPosition, frequency: medium === 'dive' ? 370 : 1160, duration: .23, level: .115, type: 'bandpass' });
        }
      } else swimDistance = 0;
      if (enabled && submerged > .5) {
        nextBubble -= dt;
        if (nextBubble <= 0) {
          nextBubble = 1.7 + Math.random() * 2.3;
          bubble(actor ?? eye, actor !== null && speed > .3);
        }
      } else nextBubble = 1.1;

      // A few short impacts break up the continuous noise without creating a
      // source for every visual raindrop. Roof taps remain audible under cover.
      const roof = rainCover === 'roof';
      const foliage = rainCover === 'tree' || rainSurface === 'foliage';
      const patter = roof ? rainLayers.roof : foliage ? rainLayers.foliage : rainLayers.water;
      if (enabled && patter > .009 && submerged < .5) {
        nextRainImpact -= dt;
        if (nextRainImpact <= 0) {
          nextRainImpact = (.09 + Math.random() * .22) / (.35 + clamp(rain, 0, 1));
          const radius = roof ? 2.7 : 3.8;
          const impactY = roof || foliage ? Math.max(eye.y + .65, rainCoverHeight ?? eye.y + 1.3)
            : Math.max(ground, surface ?? ground) + .03;
          eventPosition.set(eye.x + (Math.random() - .5) * radius, impactY,
            eye.z + (Math.random() - .5) * radius);
          burst({ position: eventPosition, frequency: roof ? 620 + Math.random() * 600 : foliage ? 3400 : 2100,
            duration: roof ? .064 : .043, level: patter * (roof ? .38 : .23), type: 'bandpass',
            pitch: .75 + Math.random() * .5 });
        }
      } else nextRainImpact = .1;
      if (enabled && rainLayers.drip > .002 && submerged < .5) {
        nextDrip -= dt;
        if (nextDrip <= 0) {
          nextDrip = (.35 + Math.random() * 1.15) / (.4 + clamp(weather?.wetness ?? rain, 0, 1));
          const side = Math.random() < .5 ? -1 : 1;
          eventPosition.set(eye.x + side * (1.25 + Math.random() * 1.8), ground + .04,
            eye.z + (Math.random() - .5) * 3.4);
          burst({ position: eventPosition, frequency: rainSurface === 'water' ? 1900 : 1250,
            duration: .11, level: rainLayers.drip, type: 'bandpass', pitch: .7 + Math.random() * .5 });
        }
      } else nextDrip = .7;

      spatialElapsed += dt;
      if (spatialElapsed < .09) return;
      spatialElapsed = 0;
      smooth(graph.rainDistant.gain.gain, rainLayers.distant, .48);
      smooth(graph.rainGround.gain.gain, rainLayers.ground, .32);
      smooth(graph.rainWater.gain.gain, rainLayers.water, .32);
      smooth(graph.rainFoliage.gain.gain, rainLayers.foliage, .38);
      smooth(graph.rainRoof.gain.gain, rainLayers.roof, .34);
      let closest = Infinity, rapidDistance = Infinity, rapidStrength = 0, strongestRapid = 0, calmSpeed = 0, calmTurbulence = 0;
      let riverX = clamp(eye.x, RIVER_SOURCE, RIVER_MOUTH);
      for (let offset = -28; offset <= 28; offset += 4) {
        const x = clamp(eye.x + offset, RIVER_SOURCE, RIVER_MOUTH);
        const z = riverZ(x);
        const y = riverSurfaceHeight(x);
        const floor = groundSurfaceHeight(x, z);
        riverCurrentAt(x, z, floor, 0, flow, runoff);
        const distance = Math.hypot(eye.x - x, eye.y - y, Math.max(0, Math.abs(eye.z - z) - 2));
        const profile = riverSoundProfile({ flowSpeed: flow.length(),
          grade: Math.max(0, riverSurfaceHeight(x - .5) - riverSurfaceHeight(x + .5)), distance, runoff });
        if (distance < closest) {
          closest = distance;
          riverX = x;
          calmSpeed = flow.length();
          calmTurbulence = profile.rapid;
        }
        const score = profile.rapid * (1 - MathUtils.smoothstep(distance, 3, 55));
        if (score > strongestRapid) {
          strongestRapid = score; rapidDistance = distance; rapidStrength = profile.rapid;
          const [lower, upper] = riverSpan(x);
          rapidPosition.set(x, y, clamp(eye.z, lower + .15, upper - .15));
        }
      }
      const [lower, upper] = riverSpan(riverX);
      const waterZ = clamp(eye.z, lower + .15, upper - .15);
      calmPosition.set(riverX, riverSurfaceHeight(riverX), waterZ);
      const coastX = coastlineX(eye.z);
      const distanceToCoast = Math.hypot(eye.x - coastX, eye.y - seaSurfaceHeight());
      surfPosition.set(coastX, seaSurfaceHeight(), eye.z);
      const estuaryShelter = (1 - MathUtils.smoothstep(eye.x, 58, 68))
        * (1 - MathUtils.smoothstep(Math.abs(eye.z - riverZ(60)), 3, 11));
      const mix = recordingMix({ riverDistance: closest, rapidDistance, rapid: rapidStrength, calmTurbulence, flowSpeed: calmSpeed,
        coastDistance: distanceToCoast, coastExposure: MathUtils.smoothstep(eye.x, 43, 60) * (1 - estuaryShelter * .84),
        altitude: ground, rain, submerged, cover: rainCover, wind: weather?.wind ?? .35 });
      recordings.update(mix, { calm: calmPosition, rapids: rapidPosition, surf: surfPosition },
        { cover: rainCover, riverDistance: closest, rapidDistance, coastDistance: distanceToCoast, altitude: ground });
      locate(graph.beePosition, bee[0] + Math.sin(now * 1.3) * .55, bee[1] + Math.sin(now * 2.1) * .18, bee[2] + Math.cos(now * .91) * .48);
      const beeRange = Math.hypot(eye.x - bee[0], eye.y - bee[1], eye.z - bee[2]);
      smooth(graph.buzzGain.gain, (1 - MathUtils.smoothstep(beeRange, 3, 13)) * (.040 + Math.sin(now * 7.3) * .007)
        * (1 - submerged) * clamp(beeActivity, 0, 1), .25);
      graph.bees.forEach((oscillator, i) => smooth(oscillator.detune, Math.sin(now * (1.4 + i * .27) + i * 2) * 17, .12));
    },
    setEnabled(value) {
      enabled = Boolean(value);
      stepDistance = 0;
      swimDistance = 0;
      if (!enabled) stopTransients();
      setMaster();
    },
    setVolume(value) {
      if (!Number.isFinite(value)) return;
      volume = clamp(value, 0, 1);
      setMaster();
    },
    setNarrating(value) {
      narrating = Boolean(value);
      setMaster();
    },
    get context() { return context; },
    get enabled() { return enabled; },
    get volume() { return volume; },
    get recordings() { return recordings?.state ?? { ready: 0, total: 4, loading: false, mode: 'idle', failed: [] }; },
    dispose() {
      disposed = true;
      document.removeEventListener('visibilitychange', visibilityChanged);
      stopTransients();
      recordings?.dispose();
      permanent.forEach((source) => { try { source.stop(); } catch {} source.disconnect(); });
      if (context) context.close().catch(() => {});
      graph = null;
    },
  };
}
