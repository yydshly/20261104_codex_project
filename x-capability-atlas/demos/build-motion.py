"""Render the atlas's A/B B-roll comparison on Windows (Pillow and FFmpeg)."""

from array import array
import json
import math
import os
from pathlib import Path
import random
import subprocess
import tempfile
import wave

from PIL import Image, ImageDraw, ImageFont


OUTPUT = Path(__file__).resolve().parent / 'media'
W, H, FPS = 960, 540, 24
FONT_PATH = Path(os.environ['WINDIR']) / 'Fonts' / 'msyh.ttc'
SCRIPT = (
    '每次弹出一条通知，',
    '你的注意力就被切走一点。',
    '等你回到手头的事，刚才的思路已经断了。',
)
INK = '#202037'
LIME = '#ddf18b'
LILAC = '#c0acfc'


def font(size):
    return ImageFont.truetype(str(FONT_PATH), size)


SMALL, CAPTION, LABEL, TITLE, LARGE = [font(n) for n in (17, 28, 22, 29, 43)]


def make_voice(folder):
    env = dict(os.environ, ATLAS_VOICE_DIR=str(folder), ATLAS_VOICE_SCRIPT=json.dumps(SCRIPT, ensure_ascii=False))
    synthesize = '''
Add-Type -AssemblyName System.Speech
$voice = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$voice.SelectVoice('Microsoft Huihui Desktop')
$voice.Rate = -1
$lines = ConvertFrom-Json $env:ATLAS_VOICE_SCRIPT
for ($i = 0; $i -lt $lines.Count; $i++) {
  $voice.SetOutputToWaveFile((Join-Path $env:ATLAS_VOICE_DIR "voice-$i.wav"))
  $voice.Speak([string]$lines[$i])
  $voice.SetOutputToNull()
}
$voice.Dispose()
'''
    subprocess.run(['powershell.exe', '-NoProfile', '-Command', synthesize], env=env, check=True)
    track = array('h')
    starts = []
    for index in range(len(SCRIPT)):
        with wave.open(str(folder / f'voice-{index}.wav')) as source:
            assert source.getnchannels() == 1 and source.getsampwidth() == 2
            rate = source.getframerate()
            data = array('h', source.readframes(source.getnframes()))
        signal = [offset for offset, sample in enumerate(data) if abs(sample) > 210]
        segment = data[max(0, signal[0] - rate // 20):signal[-1] + rate // 12]
        track.extend([0] * round(rate * (0.32 if index == 0 else 0.22)))
        starts.append(len(track) / rate)
        track.extend(segment)
    track.extend([0] * round(rate * 0.50))
    audio = folder / 'narration.wav'
    with wave.open(str(audio), 'wb') as output:
        output.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
        output.writeframes(track.tobytes())
    return audio, track, rate, starts


def paper_background():
    image = Image.new('RGB', (W, H), '#e9ddfa')
    draw = ImageDraw.Draw(image)
    for x in range(12, W, 24):
        for y in range(12, H, 24):
            draw.point((x, y), fill='#b4a4d5')
    rng = random.Random(52)
    for _ in range(2100):
        x, y = rng.randrange(W), rng.randrange(H)
        draw.point((x, y), fill=rng.choice(('#d4c8ea', '#f1eafb', '#dfd1ef')))
    return image


PAPER = paper_background()


def heading(draw, name, color):
    draw.rounded_rectangle((32, 28, 302, 67), radius=6, fill=color)
    draw.text((46, 47), name, font=SMALL, fill=INK, anchor='lm')


def narrator(seconds, level):
    image = Image.new('RGB', (W, H), '#24233c')
    draw = ImageDraw.Draw(image)
    for x in range(32, W, 32):
        draw.line((x, 0, x, H), fill='#302e4b')
    for y in range(30, H, 30):
        draw.line((0, y, W, y), fill='#302e4b')
    draw.rounded_rectangle((270, 85, 690, 423), radius=22, fill='#393553', outline='#7564a6', width=2)
    draw.ellipse((336, 103, 625, 392), fill='#49416d', outline='#655983', width=2)
    draw.ellipse((368, 283, 590, 442), fill='#8d75df')
    draw.rounded_rectangle((368, 356, 590, 445), radius=16, fill='#8d75df')
    draw.ellipse((407, 125, 551, 282), fill='#2c243f')
    draw.rounded_rectangle((459, 238, 501, 301), radius=12, fill='#bd87a9')
    draw.ellipse((424, 143, 536, 269), fill='#edbcd4')
    draw.polygon(((417, 162), (435, 141), (488, 136), (529, 151), (536, 176), (491, 160), (451, 179), (421, 184)), fill='#392d52')
    blink = seconds % 3.6 > 3.49
    for x in (452, 506):
        draw.ellipse((x - 15, 186, x + 15, 213), outline='#44375b', width=4)
        draw.ellipse((x - 3, 195, x + 3, 197 if blink else 204), fill='#393052')
    draw.line((467, 198, 491, 198), fill='#44375b', width=3)
    mouth = 2 + min(12, round(level / 230))
    draw.ellipse((469, 231, 491, 231 + mouth), fill='#823e68')
    for x in range(23):
        wave_height = 3 + abs(math.sin(x * 0.71 + seconds * 16)) * min(31, level / 60)
        draw.line((68 + x * 8, 382 - wave_height, 68 + x * 8, 382 + wave_height), fill='#b6a4ef', width=3)
    heading(draw, 'A-ROLL   /   口播主画面', LILAC)
    draw.text((922, 47), 'CAM 01', font=SMALL, fill='#d4c8f9', anchor='rm')
    return image


def rotated_card(image, center, angle):
    card = Image.new('RGBA', (192, 77))
    draw = ImageDraw.Draw(card)
    draw.rounded_rectangle((6, 6, 188, 75), radius=10, fill='#a88fc8')
    draw.rounded_rectangle((1, 1, 182, 69), radius=9, fill=LIME, outline='#414728', width=2)
    draw.ellipse((15, 23, 38, 46), fill='#5543a5')
    draw.text((49, 33), '新通知', font=LABEL, fill=INK, anchor='lm')
    rotated = card.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    x, y = center
    image.paste(rotated, (round(x - rotated.width / 2), round(y - rotated.height / 2)), rotated)


def collage(progress):
    image = PAPER.copy()
    draw = ImageDraw.Draw(image)
    heading(draw, 'B-ROLL   /   拼贴辅助画面', LIME)
    draw.text((920, 47), 'PAPER CUT', font=SMALL, fill='#5e4988', anchor='rm')
    draw.text((480, 118), '注意力', font=TITLE, fill='#544274', anchor='mm')
    motion = min(1, max(0, (progress - 0.28) / 0.48))
    gap = round(22 * motion * motion * (3 - 2 * motion))
    pieces = (
        (((343, 175), (479, 175), (467, 232), (488, 264), (468, 298), (474, 359), (343, 359)), -gap, -gap // 3),
        (((479, 175), (617, 175), (617, 359), (474, 359), (468, 298), (488, 264), (467, 232)), gap, gap // 3),
    )
    for points, dx, dy in pieces:
        draw.polygon([(x + dx + 6, y + dy + 8) for x, y in points], fill='#bdabd7')
        draw.polygon([(x + dx, y + dy) for x, y in points], fill='#fffaf3', outline='#9b86bd', width=2)
    for dx in (-gap, gap):
        start = 364 if dx <= 0 else 505
        if dx == 0:
            break
        for y in (209, 236, 264, 292, 318):
            draw.rounded_rectangle((start + dx, y, start + 77 + dx, y + 3), radius=1, fill='#c9b7e5')
    if gap == 0:
        for y in (209, 236, 264, 292, 318):
            draw.rounded_rectangle((365, y, 594, y + 3), radius=1, fill='#c9b7e5')
    for index, (start_x, start_y, end_x, end_y, angle) in enumerate((
        (-100, 160, 258, 190, 12), (1060, 135, 708, 192, -12),
        (-100, 403, 236, 348, -8), (1060, 409, 732, 351, 9),
    )):
        phase = min(1, max(0, (progress - index * 0.10) / 0.38))
        eased = 1 - (1 - phase) ** 3
        if phase:
            rotated_card(image, (start_x + (end_x - start_x) * eased, start_y + (end_y - start_y) * eased), angle)
    return image


def render_video(output, audio, track, rate, starts, duration, insert):
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pixel_format', 'rgb24',
               '-video_size', f'{W}x{H}', '-framerate', str(FPS), '-i', '-', '-i', str(audio),
               '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '112k',
               '-movflags', '+faststart', '-shortest', str(output)]
    with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
        for frame in range(round(duration * FPS)):
            time = frame / FPS
            segment = max((i for i, start in enumerate(starts) if time >= start), default=0)
            if insert and segment == 1:
                image = collage((time - starts[1]) / (starts[2] - starts[1]))
            else:
                samples = track[round(time * rate):round((time + 1 / FPS) * rate)]
                level = math.sqrt(sum(sample * sample for sample in samples) / max(1, len(samples)))
                image = narrator(time, level)
            draw = ImageDraw.Draw(image)
            draw.rounded_rectangle((66, 450, W - 66, 511), radius=10, fill=INK)
            draw.text((W // 2, 480), SCRIPT[segment], font=CAPTION, fill='#fffaf9', anchor='mm')
            encoder.stdin.write(image.tobytes())
        encoder.stdin.close()
        if encoder.wait():
            raise RuntimeError('FFmpeg failed to render the comparison video')


def main():
    OUTPUT.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='atlas-motion-') as temporary:
        audio, track, rate, starts = make_voice(Path(temporary))
        duration = len(track) / rate
        for name, insert in (('talk-a', False), ('talk-b', True)):
            render_video(OUTPUT / f'{name}.mp4', audio, track, rate, starts, duration, insert)
        frames = [collage(index / 31).resize((540, 304), Image.Resampling.LANCZOS) for index in range(32)]
        frames[0].save(OUTPUT / 'cutaway.gif', save_all=True, append_images=frames[1:], duration=80, loop=0)
        collage(0.81).save(OUTPUT / 'cutaway-poster.webp', quality=87)
        narrator(0.1, 480).save(OUTPUT / 'talk-poster.webp', quality=87)
        data = {'duration': round(duration, 3), 'start': round(starts[1], 3), 'end': round(starts[2], 3), 'script': SCRIPT}
        (OUTPUT / 'motion-data.js').write_text(f'window.motionExample = {json.dumps(data, ensure_ascii=False)};\n', encoding='utf-8')
        print(f'Rendered {duration:.2f}s. B-roll from {starts[1]:.2f}s to {starts[2]:.2f}s.')


if __name__ == '__main__':
    main()
