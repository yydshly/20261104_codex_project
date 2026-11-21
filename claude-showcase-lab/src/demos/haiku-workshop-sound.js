import { lineCues } from './haiku-workshop-art.js';

const sampleRate = 24000;
const tracks = {
  kite: { notes: [392, 523, 659], decay: 5.6, bed: .062, harmonic: 2.01 },
  rain: {
    notes: [494, 659, 587],
    decay: 8,
    bed: .075,
    harmonic: 2.14,
  },
  moon: { notes: [262, 330, 392], decay: 4.4, bed: .051, harmonic: 2.04 },
  frost: {
    notes: [392, 587, 784],
    decay: 4.2,
    bed: .036,
    harmonic: 2.67,
  },
  bird: { notes: [587, 784, 1047], decay: 9, bed: .036, harmonic: 2.01 },
};

export function makePoemSound(context, scene, duration) {
  const track = tracks[scene];
  const audio = context.createBuffer(1, duration * sampleRate, sampleRate);
  const samples = audio.getChannelData(0);
  let seed = 20193;
  let low = 0;
  let wash = 0;
  for (let i = 0; i < samples.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 2147483648 - 1;
    low += .13 * (noise - low);
    wash += .008 * (noise - wash);
    const time = i / sampleRate;
    const air = .8 + .2 * Math.sin(time * 1.8);
    const edge = Math.min(1, time * 12, (duration - time) * 4);
    samples[i] = (low * .64 + wash * 2.1) * track.bed * air * edge;
  }

  for (const [index, cue] of lineCues.entries()) {
    const start = Math.floor(cue * samples.length);
    const end = Math.min(samples.length, start + sampleRate * 2);
    const pitch = 2 * Math.PI * track.notes[index];
    for (let i = start; i < end; i++) {
      const time = (i - start) / sampleRate;
      const envelope = (1 - Math.exp(-time * 140)) * Math.exp(-time * track.decay);
      const partials = Math.sin(pitch * time) + .29 * Math.sin(pitch * track.harmonic * time);
      const edge = Math.min(1, (end - i) / (sampleRate * .16));
      samples[i] += partials * envelope * edge * .067;
    }
  }
  return audio;
}
