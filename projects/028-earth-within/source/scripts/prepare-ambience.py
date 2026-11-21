"""Prepare licensed field-recording excerpts; no runtime network dependency.

Run after downloading the public HQ previews listed in assets/audio/SOURCES.md
into .artifacts/audio-raw. Requires ffmpeg and ffprobe on PATH.
"""
import hashlib
from array import array
import json
import math
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'assets' / 'audio'
RAW = ROOT / '.artifacts' / 'audio-raw'
CLIPS = [
    ('river-calm', 10.0, 40.0, 'Garuda1982', '707576', 'gentle river flow'),
    ('river-rapids', .5, 24.0, 'Yoyodaman234', '349071', 'Water Flowing Through Distant Rapids 1'),
    ('ocean-surf', 32.0, 64.0, 'SamsterBirdies', '578524', 'Calm ocean waves'),
    ('wind', .5, 22.0, 'SamuelGremaud', '547472', 'WIND - 1'),
]


def run(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True, encoding='utf-8', errors='replace')


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = {'license': 'CC0-1.0', 'licenseUrl': 'https://creativecommons.org/publicdomain/zero/1.0/',
                'processing': '48 kHz stereo; 45 Hz high-pass; 14.5 kHz low-pass; constant gain to -25 dBFS RMS with -3 dBFS peak ceiling; two-second equal-power loop join; Vorbis q5',
                'recordings': []}
    for name, start, duration, author, sound_id, title in CLIPS:
        source = RAW / ('river-calm-wide.mp3' if name == 'river-calm' else f'{name}.mp3')
        conditioning = f'atrim=start={start}:duration={duration},asetpts=PTS-STARTPTS,aresample=48000,highpass=f=45,lowpass=f=14500'
        measurement = run('ffmpeg', '-hide_banner', '-i', str(source), '-af', conditioning + ',volumedetect', '-f', 'null', '-')
        mean = float(re.search(r'mean_volume: ([-\d.]+) dB', measurement.stderr)[1])
        peak = float(re.search(r'max_volume: ([-\d.]+) dB', measurement.stderr)[1])
        gain = min(-25 - mean, -3 - peak)
        overlap = 2.0
        decoded = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-af',
            conditioning + f',volume={gain:.3f}dB', '-ac', '2', '-ar', '48000', '-f', 'f32le', 'pipe:1'],
            check=True, capture_output=True).stdout
        samples = array('f'); samples.frombytes(decoded)
        overlap_frames = int(overlap * 48000)
        overlap_samples = overlap_frames * 2
        joined = array('f', samples[-overlap_samples:])
        for frame in range(overlap_frames):
            angle = frame / (overlap_frames - 1) * math.pi / 2
            outgoing, incoming = math.cos(angle), math.sin(angle)
            for channel in range(2):
                index = frame * 2 + channel
                joined[index] = joined[index] * outgoing + samples[index] * incoming
        joined.extend(samples[overlap_samples:-overlap_samples])
        target = OUTPUT / f'{name}.ogg'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', '48000', '-ac', '2', '-i', 'pipe:0',
            '-c:a', 'libvorbis', '-q:a', '5', str(target)], input=joined.tobytes(), check=True, capture_output=True)
        details = json.loads(run('ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(target)).stdout)
        assert abs(float(details['format']['duration']) - (duration - overlap)) < .002
        manifest['recordings'].append({
            'file': target.name, 'title': title, 'author': author,
            'source': f'https://freesound.org/people/{author}/sounds/{sound_id}/',
            'excerptStart': start, 'excerptDuration': duration, 'loopOverlap': overlap,
            'duration': float(details['format']['duration']), 'sampleRate': 48000, 'channels': 2,
            'gainDb': round(gain, 3), 'bytes': target.stat().st_size,
            'rmsDbfs': round(10 * math.log10(sum(sample * sample for sample in joined) / len(joined)), 3),
            'peakDbfs': round(20 * math.log10(max(abs(sample) for sample in joined)), 3),
            'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
        })
        print(f'{name}: {details["format"]["duration"]} s, {target.stat().st_size} bytes, gain {gain:.1f} dB')
    (OUTPUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
