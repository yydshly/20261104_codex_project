"""Synthesize the greenhouse promo score as a 16-second stereo PCM WAV."""

import argparse
import wave
from pathlib import Path

import numpy as np


RATE = 48_000
DURATION = 16
CUTS = (0, 3.2, 6.4, 9.6, 12.8)
TAU = 2 * np.pi


def smooth(value):
    value = np.clip(value, 0, 1)
    return value * value * (3 - 2 * value)


def frequency(note):
    return 440 * 2 ** ((note - 69) / 12)


def score():
    time = np.arange(RATE * DURATION) / RATE
    mix = np.zeros((len(time), 2), dtype=np.float64)
    room = np.zeros_like(mix)
    rng = np.random.default_rng(2404)

    def place(track, start, signal, gain, pan=0):
        first = round(start * RATE)
        count = min(len(signal), len(track) - first)
        track[first:first + count] += signal[:count, None] * gain * np.sqrt((1 + np.array([-pan, pan])) / 2)

    def noise_band(low, high):
        bins = np.fft.rfftfreq(len(time), d=1 / RATE)
        response = (1 - np.exp(-(bins / low) ** 4)) * np.exp(-(bins / high) ** 4)
        noise = np.fft.irfft(np.fft.rfft(rng.normal(size=len(time))) * response, len(time))
        return noise / noise.std()

    air = noise_band(92, 890)
    belt = noise_band(42, 225)
    motor = np.sin(TAU * 49 * time + .32 * np.sin(TAU * .27 * time))
    motor += .19 * np.sin(TAU * 98 * time)
    airflow = smooth(time / 1.3) * smooth((15.8 - time) / 1.5)
    place(mix, 0, airflow * (belt * .006 + motor * .006), 1)
    place(mix, 0, airflow * air * (.64 + .25 * np.sin(TAU * .42 * time)), .006, -.35)
    place(mix, 0, airflow * noise_band(145, 730), .004, .48)

    chords = (
        (50, 57, 64, 66),  # D add 9
        (47, 54, 57, 62),  # B minor 7
        (43, 54, 57, 62),  # G major 9, with the third omitted
        (45, 52, 57, 62),  # A suspended
        (50, 57, 64, 66),
    )
    levels = (.048, .058, .063, .072, .074)
    for start, notes, gain in zip(CUTS, chords, levels):
        local = time[:round(3.75 * RATE)]
        rise = .78 if start == 0 else .55
        envelope = smooth(local / rise) * smooth((3.75 - local) / .97)
        for index, (note, pan) in enumerate(zip(notes, (-.10, -.39, .44, .20))):
            phase = TAU * frequency(note) * (start + local) + .52 * index
            drift = TAU * (.16 + .041 * index) * (start + local)
            signal = np.sin(phase) + .29 * np.sin(phase + drift)
            signal += .13 * np.sin(2 * phase + .45 * np.sin(drift))
            modulation = .81 + .13 * np.sin(TAU * .31 * local + 1.12 * index)
            place(mix, start, signal * modulation * envelope, gain * (1 if index < 2 else .76), pan)

    def pulse(start, note, gain, pan=0):
        local = time[:round(.71 * RATE)]
        pitch = TAU * frequency(note) * local
        partial = np.sin(pitch + .65 * np.exp(-local / .09)) + .43 * np.sin(2 * pitch)
        partial += .15 * np.sin(3 * pitch) * np.exp(-local / .16)
        envelope = smooth(local / .033) * np.exp(-local / .19) * smooth((.71 - local) / .09)
        place(mix, start, partial * envelope, gain, pan)

    for phrase, (start, root) in enumerate(zip(CUTS, (38, 35, 43, 45, 38))):
        pulse(start + .045, root, .17 + .015 * min(3, phrase))
        if phrase < 4:
            pulse(start + .82, root + 12, .073, -.18)
            pulse(start + 1.63, root, .105 + .018 * phrase)
            if phrase:
                pulse(start + 2.42, root + 7, .067 + .01 * phrase, .15)
        else:
            pulse(start + 1.02, root + 12, .071)

    def felt(start, note, gain, pan):
        local = time[:round(1.37 * RATE)]
        phase = TAU * frequency(note) * local
        signal = np.sin(phase) * np.exp(-local / .31)
        signal += .22 * np.sin(2.008 * phase) * np.exp(-local / .13)
        signal += .05 * np.sin(3.65 * phase) * np.exp(-local / .053)
        signal *= smooth(local / .014) * smooth((1.37 - local) / .16)
        place(mix, start, signal, gain, pan)
        place(room, start, signal, gain, pan)

    motif = (
        (.58, 69, .081, -.34), (1.38, 76, .054, .36),
        (3.57, 69, .066, .22), (4.40, 74, .075, -.32), (5.45, 78, .065, .27),
        (6.78, 69, .073, -.31), (7.57, 74, .080, .28), (8.39, 81, .068, -.18),
        (9.83, 76, .088, .35), (10.63, 81, .085, -.33), (11.47, 83, .067, .28),
        (12.86, 78, .101, -.24), (13.18, 76, .079, .31), (13.80, 74, .091, -.09),
    )
    for note in motif:
        felt(*note)

    swish = noise_band(187, 1080)
    for index, cut in enumerate(CUTS[1:]):
        local = time[:round(.48 * RATE)]
        offset = index * len(local)
        envelope = smooth(local / .29) * smooth((.48 - local) / .17)
        place(mix, cut - .29, envelope * swish[offset:offset + len(local)], .019, (-1) ** index * .43)

    for delay, gain in ((.049, .14), (.087, .11), (.143, .08), (.231, .055)):
        samples = round(delay * RATE)
        mix[samples:] += gain * room[:-samples, ::-1]

    master_fade = smooth(time / .04) * smooth((DURATION - time) / 1.12)
    return np.tanh(mix * 1.96) * master_fade[:, None]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Path to write the PCM WAV")
    destination = parser.parse_args().output
    pcm = np.round(score() * 32767).astype("<i2")
    with wave.open(str(destination), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
