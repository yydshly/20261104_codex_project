"""Package rendered PNG sequences into the case 04 film and source clips."""
import argparse
import json
import os
from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont

from greenhouse_edit import FILM_SECONDS, FPS, NAMES, SHOTS, film_segments

FRAME_SIZE = (1280, 720)
ENCODE = ['-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
FONT_DIR = Path(os.environ.get('WINDIR', 'C:/Windows')) / 'Fonts'


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *map(str, args)], check=True)


def font(filename, size):
    return ImageFont.truetype(str(FONT_DIR / filename), size)


def poster_and_board(frames, output, shot, name, portrait=False):
    poster = Image.open(frames[37]).convert('RGB')
    poster.thumbnail((720, 1280) if portrait else FRAME_SIZE, Image.Resampling.LANCZOS)
    poster.save(output / f'{shot}.jpg', quality=90, optimize=True)
    size = (270, 480) if portrait else (480, 270)
    bar = 44
    board = Image.new('RGB', (2 * size[0], 2 * (size[1] + bar)), '#12241e')
    draw = ImageDraw.Draw(board)
    label = font('msyh.ttc', 18)
    mono = font('bahnschrift.ttf', 17)
    for position, frame in enumerate((0, 32, 64, 95)):
        left = position % 2 * size[0]
        top = position // 2 * (size[1] + bar)
        image = Image.open(frames[frame]).convert('RGB').resize(size, Image.Resampling.LANCZOS)
        board.paste(image, (left, top))
        draw.text((left + 13, top + size[1] + 10), name, font=label, fill='#e9f4e4')
        draw.text((left + size[0] - 13, top + size[1] + 13), f'{frame / FPS:0.2f}s', font=mono, fill='#b4c9ae', anchor='ra')
    board.save(output / f'{shot}-storyboard.jpg', quality=92, optimize=True)


def compile_shot(frames, portrait, output, shot, name):
    for suffix, source, shape in (('', frames, 'scale=1280:720:flags=lanczos'), ('-vertical', portrait, 'scale=720:1280:flags=lanczos')):
        sequence = source[0].parent / '%04d.png'
        ffmpeg('-framerate', FPS, '-i', sequence, '-frames:v', 96, '-vf', shape, *ENCODE, output / f'{shot}{suffix}.mp4')
        poster_and_board(source, output, f'{shot}{suffix}', name, bool(suffix))
    return {
        'id': shot, 'landscape': f'{shot}.mp4', 'portrait': f'{shot}-vertical.mp4',
        'poster': {'landscape': f'{shot}.jpg', 'portrait': f'{shot}-vertical.jpg'},
        'storyboard': {'landscape': f'{shot}-storyboard.jpg', 'portrait': f'{shot}-vertical-storyboard.jpg'},
    }


def title_card(text, subtitle, opening):
    layer = Image.new('RGBA', FRAME_SIZE)
    paint = ImageDraw.Draw(layer)
    ink = '#f5f5e4'
    accent = '#e2e7a3'
    title = font('bahnschrift.ttf', 49 if opening else 59)
    sub = font('msyh.ttc', 23)
    for y in range(245):
        alpha = int(165 * (1 - y / 245) ** 2)
        paint.line((0, 719 - y, 1280, 719 - y), fill=(7, 16, 13, alpha))
    paint.rounded_rectangle((62, 553, 101, 557), radius=2, fill=accent)
    paint.text((61, 570), text, font=title, fill=ink)
    paint.text((64, 635), subtitle, font=sub, fill=accent)
    return layer


def composite(frame, card=None, opacity=1):
    with Image.open(frame) as source:
        output = source.convert('RGB').resize(FRAME_SIZE, Image.Resampling.LANCZOS)
    if card and opacity > 0:
        alpha = card.getchannel('A')
        if opacity < 1:
            alpha = alpha.point(lambda pixel: round(pixel * opacity))
        output.paste(card, mask=alpha)
    return output


def compile_film(sequences, output, audio):
    opening = title_card('VERDANT / R04', '温室巡检车  /  概念样片', True)
    closing = title_card('VERDANT R04', 'GREENHOUSE ROVER  /  温室巡检', False)
    video_path = output / 'film.mp4'
    command = [
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
        '-video_size', '1280x720', '-framerate', str(FPS), '-i', '-', '-i', str(audio), '-map', '0:v:0', '-map', '1:a:0',
        *ENCODE, '-c:a', 'aac', '-b:a', '192k', '-t', str(FILM_SECONDS), str(video_path),
    ]
    with subprocess.Popen(command, stdin=subprocess.PIPE) as render:
        for index, (shot, _, offset, start, end) in enumerate(film_segments()):
            count = end - start
            card = opening if index == 0 else closing if index == len(SHOTS) - 1 else None
            for number in range(count):
                if index == 0:
                    opacity = min(1, number / 9, (count - 1 - number) / 14)
                elif index == len(SHOTS) - 1:
                    opacity = min(1, max(0, (number - 13) / 15))
                else:
                    opacity = 0
                image = composite(sequences[shot][offset + number], card, opacity)
                render.stdin.write(image.tobytes())
        render.stdin.close()
        if render.wait():
            raise RuntimeError('Film encoding failed')
    composite(sequences['track'][37], opening).save(output / 'film.jpg', quality=91, optimize=True)
    return {'file': 'film.mp4', 'poster': 'film.jpg', 'width': 1280, 'height': 720, 'duration': FILM_SECONDS}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('frames', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--portrait-frames', type=Path, required=True)
    parser.add_argument('--audio', type=Path)
    parser.add_argument('--shots', nargs='+', choices=SHOTS, default=SHOTS)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    needed = SHOTS if args.audio else args.shots
    sequences = {shot: sorted((args.frames / shot).glob('[0-9][0-9][0-9][0-9].png')) for shot in needed}
    for shot, frames in sequences.items():
        if len(frames) != 96:
            raise RuntimeError(f'{shot}: expected 96 frames, got {len(frames)}')
    manifest_path = args.output / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf8')) if manifest_path.exists() else {'shots': []}
    entries = {item['id']: item for item in manifest['shots']}
    for shot in args.shots:
        portrait = sorted((args.portrait_frames / shot).glob('[0-9][0-9][0-9][0-9].png'))
        if len(portrait) != 96:
            raise RuntimeError(f'{shot}: expected 96 portrait frames, got {len(portrait)}')
        entries[shot] = compile_shot(sequences[shot], portrait, args.output, shot, NAMES[SHOTS.index(shot)])
    manifest['shots'] = [entries[shot] for shot in SHOTS if shot in entries]
    if args.audio:
        manifest['film'] = compile_film(sequences, args.output, args.audio)
    staging = manifest_path.with_suffix('.part')
    staging.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    staging.replace(manifest_path)


if __name__ == '__main__':
    main()
