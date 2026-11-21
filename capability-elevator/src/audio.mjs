const SAMPLE_RATE = 48_000;
const CHANNELS = 2;
const BYTES_PER_SAMPLE = 2;
const TAU = 2 * Math.PI;

function smoothStep(value) {
  const x = Math.max(0, Math.min(1, value));
  return x * x * (3 - 2 * x);
}

function tone(frequency, time) {
  return Math.sin(TAU * frequency * time);
}

function bell(frequency, time) {
  if (time <= 0 || time >= 1.4) return 0;

  const attack = smoothStep(time / 0.026);
  const release = smoothStep((1.4 - time) / 0.24);
  const decay = Math.exp(-3.2 * time);
  const partials = tone(frequency, time)
    + 0.22 * tone(frequency * 2.01, time) * Math.exp(-3 * time)
    + 0.08 * tone(frequency * 3.02, time) * Math.exp(-5 * time);

  return attack * decay * release * partials;
}

function writeWaveHeader(wav, dataSize) {
  const blockSize = CHANNELS * BYTES_PER_SAMPLE;
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + dataSize, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(CHANNELS, 22);
  wav.writeUInt32LE(SAMPLE_RATE, 24);
  wav.writeUInt32LE(SAMPLE_RATE * blockSize, 28);
  wav.writeUInt16LE(blockSize, 32);
  wav.writeUInt16LE(BYTES_PER_SAMPLE * 8, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataSize, 40);
}

export function makeSoundtrack(duration, arrivals, finaleStart) {
  const frames = Math.round(duration * SAMPLE_RATE);
  const dataSize = frames * CHANNELS * BYTES_PER_SAMPLE;
  const wav = Buffer.alloc(44 + dataSize);
  writeWaveHeader(wav, dataSize);

  for (let frame = 0; frame < frames; frame++) {
    const time = frame / SAMPLE_RATE;
    const endFade = smoothStep((duration - time) / 1.15);
    const bedFade = smoothStep(time / 1.2) * endFade;
    const pulse = 0.86 + 0.14 * tone(0.31, time);
    const liftBed = bedFade * pulse * (
      0.037 * tone(73.42, time) + 0.022 * tone(110, time)
      + 0.011 * tone(146.91, time) + 0.008 * tone(185, time)
    );

    let arrivalSound = 0;
    for (const arrival of arrivals) {
      const elapsed = time - arrival;
      arrivalSound += 0.076 * bell(587.33, elapsed) + 0.061 * bell(739.99, elapsed - 0.125);
    }
    arrivalSound *= endFade;

    const finaleTime = time - finaleStart;
    const swell = smoothStep(finaleTime / 1.2) * endFade;
    const harmony = swell * (
      0.022 * tone(146.83, finaleTime) + 0.021 * tone(220, finaleTime)
      + 0.015 * tone(277.18, finaleTime)
    );
    const highBell = 0.045 * bell(880, finaleTime - 0.55) * endFade;
    const center = liftBed + harmony + arrivalSound + highBell;
    const side = bedFade * 0.010 * tone(110.37, time) + arrivalSound * 0.12;

    const offset = 44 + frame * CHANNELS * BYTES_PER_SAMPLE;
    wav.writeInt16LE(Math.round((center + side) * 32767), offset);
    wav.writeInt16LE(Math.round((center - side) * 32767), offset + BYTES_PER_SAMPLE);
  }

  return wav;
}
