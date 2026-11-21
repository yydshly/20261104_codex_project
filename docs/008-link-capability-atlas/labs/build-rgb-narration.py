"""Build case 10 Chinese narration and WebVTT from the cues in lesson.html."""
from array import array
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import wave


LABS = Path(__file__).resolve().parent
RATE = 24000
DURATION = 32


def read_cues():
    markup = (LABS / 'lesson.html').read_text(encoding='utf8')
    return json.loads(re.search(r'<script id="lesson-cues" type="application/json">(.*?)</script>', markup, re.S)[1])


def synthesize(directory, cues):
    command = r'''
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$synth.SelectVoice('Microsoft Huihui Desktop')
$synth.Rate = 0
try {
  $lines = ConvertFrom-Json $env:ATLAS_RGB_LINES
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $synth.SetOutputToWaveFile((Join-Path (Get-Location).Path "cue-$i.wav"))
    $synth.Speak([string]$lines[$i])
    $synth.SetOutputToNull()
  }
} finally { $synth.Dispose() }
'''
    subprocess.run(['powershell.exe', '-NoProfile', '-Command', command], cwd=directory, check=True,
                   env={**os.environ, 'ATLAS_RGB_LINES': json.dumps([cue['copy'] for cue in cues], ensure_ascii=False)})


def pcm(path, filters=()):
    data = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path), *filters,
                                    '-ar', str(RATE), '-ac', '1', '-f', 's16le', '-'])
    samples = array('h', data)
    audible = [offset for offset, sample in enumerate(samples) if abs(sample) > 180]
    if not audible:
        raise RuntimeError(f'Empty narration in {path.name}')
    return samples[max(0, audible[0] - int(RATE * .07)):audible[-1] + int(RATE * .10)]


def timecode(seconds):
    ms = round(seconds * 1000)
    return f'{ms // 60000:02d}:{ms // 1000 % 60:02d}.{ms % 1000:03d}'


def main():
    cues = read_cues()
    output = LABS / 'lesson-media'
    output.mkdir(exist_ok=True)
    track = array('h', [0]) * (RATE * DURATION)
    with tempfile.TemporaryDirectory(prefix='atlas-rgb-') as temporary:
        folder = Path(temporary)
        synthesize(folder, cues)
        for index, cue in enumerate(cues):
            start, end = round(cue['start'] * RATE), round(cue['end'] * RATE)
            path = folder / f'cue-{index}.wav'
            clip = pcm(path)
            if len(clip) > end - start:
                ratio = len(clip) / (end - start - int(RATE * .12))
                clip = pcm(path, ('-af', f'atempo={ratio:.5f}'))
            if len(clip) > end - start:
                raise RuntimeError(f'Cue {index + 1} exceeds its speaking window')
            track[start:start + len(clip)] = clip
            print(f'{index + 1}: {cue["start"]:.2f}s, {len(clip) / RATE:.2f}s spoken')
        mix = folder / 'narration.wav'
        with wave.open(str(mix), 'wb') as voice:
            voice.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
            voice.writeframes(track.tobytes())
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(mix), '-c:a', 'libmp3lame', '-b:a', '96k',
                        str(output / 'rgb-narration.mp3')], check=True)
    lines = [f'{timecode(cue["start"])} --> {timecode(cue["end"])}\n{cue["copy"]}' for cue in cues]
    (output / 'rgb-narration.vtt').write_text('WEBVTT\n\n' + '\n\n'.join(lines) + '\n', encoding='utf8')


if __name__ == '__main__':
    main()
