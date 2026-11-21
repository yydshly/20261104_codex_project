"""Cut the 9:16 R04 film from the published portrait renders."""

import json
import os
import subprocess
from pathlib import Path
from shutil import copyfile
from tempfile import TemporaryDirectory

from PIL import Image, ImageDraw, ImageFont

from greenhouse_edit import FILM_SECONDS, FPS, film_segments


MEDIA = Path(__file__).resolve().parent / 'camera-media'
FONT_DIR = Path(os.environ.get('WINDIR', 'C:/Windows')) / 'Fonts'
SIZE = (720, 1280)


def title_layer(closing):
    layer = Image.new('RGBA', SIZE)
    paint = ImageDraw.Draw(layer)
    accent = '#dfe8a7'
    small = ImageFont.truetype(str(FONT_DIR / 'bahnschrift.ttf'), 19)
    title = ImageFont.truetype(str(FONT_DIR / 'bahnschrift.ttf'), 70)
    chinese = ImageFont.truetype(str(FONT_DIR / 'msyh.ttc'), 30)
    for y in range(440):
        alpha = round(206 * (1 - y / 440) ** 1.65)
        paint.line((0, y, SIZE[0] - 1, y), fill=(10, 23, 19, alpha))
    paint.line((55, 159, 85, 159), fill=accent, width=3)
    paint.text((97, 159), 'GREENHOUSE SYSTEMS' if closing else 'FIELD NOTES  /  04', anchor='lm', font=small, fill=accent)
    paint.text((51, 184), 'VERDANT R04' if closing else 'VERDANT / R04', font=title, fill='#f5f6e9')
    paint.text((56, 275), '温室巡检概念车' if closing else '温室巡检', font=chinese, fill='#eff4dc')
    return layer


def encode(output, opening, closing):
    segments = list(film_segments())
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-filter_complex_threads', '1']
    filters = []
    for index, (shot, _, offset, start, end) in enumerate(segments):
        command += ['-i', str(MEDIA / f'{shot}-vertical.mp4')]
        filters.append(f'[{index}:v]trim=start_frame={offset}:end_frame={offset + end - start},setpts=PTS-STARTPTS[v{index}]')

    still_start = len(segments)
    for still in (opening, closing):
        command += ['-loop', '1', '-framerate', str(FPS), '-i', str(still)]
    command += ['-i', str(MEDIA / 'film.mp4')]
    open_end = segments[0][4] / FPS
    close_start = (segments[-1][3] + 13) / FPS
    filters += [
        ''.join(f'[v{index}]' for index in range(still_start)) + f'concat=n={still_start}:v=1:a=0[cut]',
        f'[{still_start}:v]format=rgba,fade=t=in:st=0:d={9 / FPS}:alpha=1,fade=t=out:st={open_end - 15 / FPS}:d={14 / FPS}:alpha=1[opening]',
        f'[{still_start + 1}:v]format=rgba,fade=t=in:st={close_start}:d={15 / FPS}:alpha=1[closing]',
        f"[cut][opening]overlay=enable='lt(t,{open_end})'[first]",
        f"[first][closing]overlay=enable='gte(t,{close_start})',setsar=1[out]",
    ]
    command += [
        '-filter_complex', ';'.join(filters), '-map', '[out]', '-map', f'{still_start + 2}:a:0',
        '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', str(FPS),
        '-c:a', 'copy', '-t', str(FILM_SECONDS), '-movflags', '+faststart', str(output),
    ]
    subprocess.run(command, check=True)


def main():
    manifest_path = MEDIA / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    with TemporaryDirectory() as work:
        work = Path(work)
        opening = title_layer(False)
        opening.save(work / 'opening.png')
        title_layer(True).save(work / 'closing.png')
        with Image.open(MEDIA / 'track-vertical.jpg') as still:
            poster = Image.alpha_composite(still.convert('RGBA'), opening)
            poster.convert('RGB').save(work / 'film-vertical.jpg', quality=92, optimize=True)
        encode(work / 'film-vertical.mp4', work / 'opening.png', work / 'closing.png')
        for name in ('film-vertical.mp4', 'film-vertical.jpg'):
            # The temporary render may be on another drive.
            destination = MEDIA / name
            pending = destination.with_suffix('.part')
            copyfile(work / name, pending)
            pending.replace(destination)

    manifest['film']['portrait'] = {'file': 'film-vertical.mp4', 'poster': 'film-vertical.jpg', 'width': SIZE[0], 'height': SIZE[1]}
    manifest['film']['chapters'] = [
        {'id': shot, 'title': title, 'time': start / FPS}
        for shot, title, _, start, _ in film_segments()
    ]
    staging = manifest_path.with_suffix('.part')
    staging.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    staging.replace(manifest_path)


if __name__ == '__main__':
    main()
