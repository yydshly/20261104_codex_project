window.createShuRoadAmbience = function createShuRoadAmbience() {
  const scenes = [
    { air: .050, water: .020, bass: .018 }, // Exposed Qinling ridge.
    { air: .037, water: .008, bass: .060 }, // The sheltered cut in the rock.
    { air: .041, water: .087, bass: .072 }, // The gorge river.
    { air: .064, water: .021, bass: .024 }, // Wind on the high boardwalk.
    { air: .029, water: .007, bass: .009 }, // Night among the trees.
    { air: .050, water: .104, bass: .111 }, // The waterfall and its basin.
    { air: .032, water: .007, bass: .018 }, // The pass between walls.
    { air: .026, water: .004, bass: .019 }, // The darker trail below the pass.
    { air: .039, water: .011, bass: .009 }  // Open fields at the city.
  ];
  const links = [
    { air: .046, water: .019, bass: .016 },
    { air: .052, water: .018, bass: .019 },
    { air: .054, water: .019, bass: .021 },
    { air: .040, water: .012, bass: .013 },
    { air: .045, water: .029, bass: .020 },
    { air: .049, water: .023, bass: .026 },
    { air: .036, water: .007, bass: .016 },
    { air: .046, water: .011, bass: .010 }
  ];
  const silent = { air: 0, water: 0, bass: 0 };
  let context;
  let master;
  let layers;
  let noise;
  let timer;
  let location = { kind: 'scene', index: -1, nextIndex: -1, progress: 0 };
  let running = false;
  let speaking = false;
  let unavailable = false;

  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  function locationMix() {
    const { index, nextIndex, progress, kind } = location;
    const from = scenes[index];
    if (!from || !running) return silent;
    const to = scenes[nextIndex];
    const link = links[index];
    if (kind !== 'connector' || !to || !link) return from;

    // Fade the sound of each landmark into the stretch of trail between them.
    const leaving = 1 - smooth(progress / .34);
    const approaching = smooth((progress - .66) / .34);
    const between = 1 - leaving - approaching;
    const level = key => from[key] * leaving + link[key] * between + to[key] * approaching;
    const crossing = index === 1 ? .82 : index === 2 ? .13 : index === 7 ? .73 : null;
    const rapids = crossing === null ? 0 : .028 * Math.pow(1 - clamp(Math.abs(progress - crossing) / .13), 2);
    return { air: level('air'), water: level('water') + rapids, bass: level('bass') };
  }

  function gain(target, value, fade = .24) {
    const now = context.currentTime;
    if (target.cancelAndHoldAtTime) target.cancelAndHoldAtTime(now);
    else target.cancelScheduledValues(now);
    target.setTargetAtTime(value, now, fade);
  }

  function filteredLayer(source, type, frequency) {
    const filter = context.createBiquadFilter();
    const volume = context.createGain();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.65;
    volume.gain.value = 0;
    source.connect(filter).connect(volume).connect(master);
    return volume.gain;
  }

  function setUp(AudioContext) {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    noise = context.createBuffer(1, Math.round(context.sampleRate * 8), context.sampleRate);
    const samples = noise.getChannelData(0);
    let seed = 917;
    for (let i = 0; i < samples.length; i++) {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      const angle = i / samples.length * Math.PI * 2;
      const gust = .85 + .095 * Math.sin(angle) + .055 * Math.sin(angle * 3 + .65);
      samples[i] = (seed / 2147483648 - 1) * .53 * gust;
    }

    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    layers = {
      air: filteredLayer(source, 'bandpass', 420),
      water: filteredLayer(source, 'bandpass', 1450),
      bass: filteredLayer(source, 'lowpass', 180)
    };
    source.start();
  }

  function pulse(node, start, length, amplitude, output = master) {
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(amplitude, start + 0.036);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + length);
    node.connect(envelope).connect(output);
    node.start(start);
    node.stop(start + length + 0.03);
    node.onended = () => { node.disconnect(); envelope.disconnect(); };
  }

  function birdCall() {
    const now = context.currentTime + 0.05;
    for (let note = 0; note < 2; note++) {
      const voice = context.createOscillator();
      const start = now + note * 0.21;
      voice.frequency.setValueAtTime(note === 0 ? 1220 : 970, start);
      voice.frequency.exponentialRampToValueAtTime(note === 0 ? 1110 : 745, start + 0.13);
      pulse(voice, start, 0.18, 0.017);
    }
  }

  function stoneFall() {
    const start = context.currentTime + 0.045;
    const impact = context.createOscillator();
    impact.frequency.setValueAtTime(84, start);
    impact.frequency.exponentialRampToValueAtTime(36, start + 0.43);
    pulse(impact, start, 0.8, 0.025);

    const grit = context.createBufferSource();
    grit.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 560;
    filter.connect(master);
    pulse(grit, start + 0.12, 0.86, 0.11, filter);
    grit.addEventListener('ended', () => filter.disconnect(), { once: true });
  }

  function applyMix() {
    if (!context || context.state !== 'running') return;
    const active = locationMix();
    gain(master.gain, active === silent ? 0 : speaking ? .78 : 1.75, .2);
    for (const [key, volume] of Object.entries(layers)) gain(volume, active[key]);
  }

  function applyEffects() {
    clearTimeout(timer);
    if (!context || context.state !== 'running' || !running || location.kind !== 'scene') return;

    const scene = location.index;
    if (scene !== 1 && scene !== 4 && scene !== 5) return;
    const playEffect = scene === 4 ? birdCall : stoneFall;
    function repeat() {
      if (!running || location.kind !== 'scene' || location.index !== scene || context.state !== 'running') return;
      playEffect();
      timer = setTimeout(repeat, scene === 4 ? 6600 : 5100);
    }
    timer = setTimeout(repeat, scene === 4 ? 1750 : 720);
  }

  function apply() {
    applyMix();
    applyEffects();
  }

  function unlock() {
    if (unavailable || context?.state === 'running') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      unavailable = true;
      return;
    }
    try {
      if (!context) setUp(AudioContext);
      if (context.state !== 'running') context.resume().then(apply).catch(() => {});
      else apply();
    } catch {
      unavailable = true;
    }
  }

  function sync(place, enabled, voicePlaying = false) {
    const kind = place?.kind === 'connector' ? 'connector' : 'scene';
    const index = Number.isInteger(place) ? place : (place?.index ?? -1);
    const nextIndex = kind === 'connector' ? (place.nextIndex ?? index + 1) : index;
    // Walking updates every frame. Quantize position enough to keep gain automation small.
    const progress = kind === 'connector' && Number.isFinite(place.progress)
      ? Math.round(clamp(place.progress) * 48) / 48 : 0;
    const nextRunning = Boolean(enabled);
    const changedPlace = kind !== location.kind || index !== location.index || nextIndex !== location.nextIndex;
    const changedRunning = nextRunning !== running;
    if (!changedPlace && !changedRunning && voicePlaying === speaking && progress === location.progress) return;
    location = { kind, index, nextIndex, progress };
    running = nextRunning;
    speaking = voicePlaying;
    if (unavailable || !context) return;
    applyMix();
    if (changedPlace || changedRunning) applyEffects();
  }

  return { unlock, sync };
};
