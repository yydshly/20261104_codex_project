"""Build the original case 09 episode from a local Windows voice and atlas stills."""

import argparse
from base64 import b64encode
from html import escape
import json
import math
import os
from pathlib import Path
from string import Template
import subprocess
import tempfile
import wave
from zipfile import ZipFile, ZIP_DEFLATED

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps


LABS = Path(__file__).resolve().parent
OUTPUT = LABS / 'workflow-radio'
RATE = 48000
TITLE = '从巡检片到可复用素材'
LINES = [
    '欢迎收听图鉴电台。今天从一辆温室巡检车出发，看看一段画面怎样变成可复用的素材。',
    '先看温室巡检。低机位跟拍交代车身的运动方向，推近镜头把注意力留给传感器。',
    '接着听双版口播。把两条片子都停在六点零四秒，听到的是同一句旁白。画面一版是巡检车，一版是拼贴。',
    '这五秒只换了画面。旁白和字幕保持一致，可以直接比较两种讲法。',
    '最后来看小镜。先做透明头像，再用同一张脸做倾听动作，发夹和眼镜保持一致。',
    '动图回到起始姿态，再接下一次点头。三站的成片和素材，都能在图鉴里打开。',
]
CHAPTERS = [
    ('温室巡检成片', 'camera-media/film.jpg', '温室巡检车成片画面', '04'),
    ('双版口播', 'collage-media/compare-br.jpg', '带拼贴配画的口播成片画面', '01'),
    ('小镜头像与点头', 'character-media/xiaojing-nod.jpg', '小镜点头动图的起始画面', '03'),
]
SYNTH = r'''
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$voice = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$voice.SelectVoice('Microsoft Huihui Desktop')
$voice.Rate = 0
try {
    $lines = ConvertFrom-Json $env:ATLAS_RADIO_LINES
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $voice.SetOutputToWaveFile((Join-Path (Get-Location).Path "cue-$i.wav"))
        $voice.Speak([string]$lines[$i])
        $voice.SetOutputToNull()
    }
} finally { $voice.Dispose() }
'''


def ffmpeg(*args, capture=False):
    return subprocess.run(
        ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)],
        stdout=subprocess.PIPE if capture else None, check=True,
    ).stdout


def voice_track(directory):
    subprocess.run(
        ['powershell.exe', '-NoProfile', '-Command', SYNTH], cwd=directory, check=True,
        env={**os.environ, 'ATLAS_RADIO_LINES': json.dumps(LINES, ensure_ascii=False)},
    )
    segments = []
    cursor = 0
    starts = []
    for index in range(len(LINES)):
        raw = ffmpeg('-i', directory / f'cue-{index}.wav', '-ar', RATE, '-ac', 1, '-f', 's16le', 'pipe:1', capture=True)
        samples = np.frombuffer(raw, dtype='<i2').astype(np.float64) / 32768
        active = np.flatnonzero(np.abs(samples) > .012)
        if not active.size:
            raise ValueError(f'Cue {index + 1} contains no speech')
        gap = [1.15, .4, .95, .4, .95, .4][index]
        pause = np.zeros(round(gap * RATE))
        cursor += len(pause)
        starts.append(round(cursor / RATE, 3))
        begin = max(0, int(active[0]) - round(.08 * RATE))
        end = min(len(samples), int(active[-1]) + round(.09 * RATE))
        segment = samples[begin:end].copy()
        ramp = round(.012 * RATE)
        segment[:ramp] *= np.linspace(0, 1, ramp)
        segment[-ramp:] *= np.linspace(1, 0, ramp)
        segments.extend((pause, segment))
        cursor += len(segment)
    signal = np.concatenate([*segments, np.zeros(round(1.3 * RATE))])

    def sting(at, frequencies, level):
        t = np.arange(round(.66 * RATE)) / RATE
        env = (1 - np.exp(-40 * t)) * np.exp(-7 * t)
        # A short three-note ident keeps each transition audible without masking speech.
        sound = sum(np.sin(math.tau * frequency * t) * weight for frequency, weight in zip(frequencies, (.55, .29, .16)))
        start = round(at * RATE)
        signal[start:start + len(t)] += level * sound * env

    sting(.16, (220, 329.63, 440), .105)
    sting(starts[2] - .76, (261.63, 329.63, 523.25), .069)
    sting(starts[4] - .76, (293.66, 392, 587.33), .069)
    sting(cursor / RATE + .24, (220, 329.63, 440), .085)
    mix = directory / 'mix.wav'
    with wave.open(str(mix), 'wb') as audio:
        audio.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        audio.writeframes((signal.clip(-.98, .98) * 32767).astype('<i2').tobytes())
    output = OUTPUT / 'atlas-radio-01.mp3'
    ffmpeg('-i', mix, '-af', 'loudnorm=I=-17:TP=-2:LRA=7', '-ar', RATE, '-c:a', 'libmp3lame', '-b:a', '96k',
           '-metadata', f'title={TITLE}', '-metadata', 'artist=图鉴电台', output)
    # Decoding removes the MP3 encoder delay and padding that inflate container duration.
    decoded = ffmpeg('-i', output, '-ar', RATE, '-ac', 1, '-f', 's16le', 'pipe:1', capture=True)
    return starts, round(len(decoded) / (2 * RATE), 3)


def cover():
    font_dir = Path(os.environ['WINDIR']) / 'Fonts'
    bold = font_dir / 'msyhbd.ttc'
    normal = font_dir / 'msyh.ttc'
    canvas = Image.new('RGB', (1200, 1200), '#15242a')
    draw = ImageDraw.Draw(canvas)
    draw.line((70, 85, 1130, 85), fill='#7fd2bb', width=3)
    draw.text((70, 110), '图鉴电台', font=ImageFont.truetype(str(bold), 44), fill='#e7f4ef')
    draw.text((1130, 118), 'FIELD NOTES   /   01', font=ImageFont.truetype(str(normal), 28), fill='#afc9c6', anchor='ra')
    with Image.open(LABS / CHAPTERS[0][1]) as source:
        canvas.paste(ImageOps.fit(source.convert('RGB'), (1060, 450), centering=(.5, .48)), (70, 197))
    for index, chapter in enumerate(CHAPTERS[1:]):
        with Image.open(LABS / chapter[1]) as source:
            canvas.paste(ImageOps.fit(source.convert('RGB'), (518, 244), centering=(.5, .43)), (70 + 542 * index, 665))
    draw.text((70, 957), TITLE, font=ImageFont.truetype(str(bold), 67), fill='#f3f4e9')
    draw.text((75, 1072), '温室巡检  /  双版口播  /  小镜点头', font=ImageFont.truetype(str(normal), 34), fill='#a6d8ca')
    canvas.save(OUTPUT / 'atlas-radio-01.webp', quality=91, method=6)


def timestamp(seconds):
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3600000)
    minutes, millis = divmod(millis, 60000)
    secs, millis = divmod(millis, 1000)
    return f'{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}'


def vtt(entries, duration):
    blocks = []
    for index, (start, text) in enumerate(entries):
        end = entries[index + 1][0] if index + 1 < len(entries) else duration
        blocks.append(f'{timestamp(start)} --> {timestamp(end)}\n{text}')
    return 'WEBVTT\n\n' + '\n\n'.join(blocks) + '\n'


def inline_media(path, mime):
    return f'data:{mime};base64,' + b64encode((LABS / path).read_bytes()).decode('ascii')


def seek_rows(entries):
    rows = []
    for start, label in entries:
        clock = timestamp(start)[3:8]
        rows.append(f'<li><button type="button" data-time="{start}"><time datetime="PT{start}S">{clock}</time>'
                    f'<span>{escape(label)}</span></button></li>')
    return '\n'.join(rows)


def write_portable(episode):
    filename = f'{episode["slug"]}-offline.html'
    episode['portable'] = f'workflow-radio/{filename}'
    template = Template((OUTPUT / 'portable-template.html.in').read_text(encoding='utf-8'))
    art = []
    for index, chapter in enumerate(episode['chapters']):
        image = inline_media(chapter['art'], 'image/jpeg')
        hidden = ' hidden' if index else ''
        art.append(f'<img src="{image}" alt="{escape(chapter["alt"])}"{hidden}>')
    html = template.substitute(
        title=escape(episode['title']), label=escape(episode['label']),
        duration=timestamp(episode['duration'])[3:8], chapters_count=len(episode['chapters']),
        cover=inline_media(episode['cover'], 'image/webp'),
        audio=inline_media(episode['audio'], 'audio/mpeg'),
        first_chapter=escape(episode['chapters'][0]['name']),
        chapter_art='\n'.join(art),
        chapters=seek_rows((chapter['start'], chapter['name']) for chapter in episode['chapters']),
        transcript=seek_rows(episode['cues']),
    )
    (OUTPUT / filename).write_text(html, encoding='utf-8')
    (OUTPUT / 'issue.js').write_text('window.atlasRadioIssue = ' + json.dumps(episode, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--offline-only', action='store_true', help='Build the portable player from the existing episode assets')
    if parser.parse_args().offline_only:
        issue = (OUTPUT / 'issue.js').read_text(encoding='utf-8').strip()
        write_portable(json.loads(issue.removeprefix('window.atlasRadioIssue = ').removesuffix(';')))
        return
    OUTPUT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='atlas-radio-') as path:
        starts, duration = voice_track(Path(path))
    cover()
    slug = 'atlas-radio-01'
    cues = list(zip(starts, LINES))
    chapters = [dict(name=name, art=art, alt=alt, case=case, start=(0 if i == 0 else starts[i * 2]))
                for i, (name, art, alt, case) in enumerate(CHAPTERS)]
    episode = dict(title=TITLE, label='FIELD NOTES 01', slug=slug, duration=duration,
                   audio=f'workflow-radio/{slug}.mp3', cover=f'workflow-radio/{slug}.webp',
                   package=f'workflow-radio/{slug}.zip', chapters=chapters, cues=cues)
    write_portable(episode)
    transcript = f'# 图鉴电台 01 · {TITLE}\n\n' + '\n'.join(f'- {timestamp(at)} · {text}' for at, text in cues) + '\n'
    with ZipFile(OUTPUT / f'{slug}.zip', 'w', ZIP_DEFLATED) as package:
        package.write(OUTPUT / f'{slug}.mp3', f'{slug}.mp3')
        package.write(OUTPUT / f'{slug}.webp', f'{slug}.webp')
        package.writestr(f'{slug}.captions.vtt', vtt(cues, duration))
        package.writestr(f'{slug}.chapters.vtt', vtt([(chapter['start'], chapter['name']) for chapter in chapters], duration))
        package.writestr('transcript.md', transcript)
    print(f'{slug}: {duration:.3f} seconds · {len(chapters)} chapters · {len(cues)} cues')


if __name__ == '__main__':
    main()
