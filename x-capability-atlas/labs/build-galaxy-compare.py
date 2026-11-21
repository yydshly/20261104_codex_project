"""Render a locked-camera comparison of 12° and 28° galactic spiral arms."""

import argparse
import math
import os
from pathlib import Path
from runpy import run_path
import subprocess

import cv2
from PIL import Image, ImageDraw, ImageFont


LAB = Path(__file__).resolve().parent
WIDTH, HEIGHT = 1920, 1080
PANEL_WIDTH, PANEL_HEIGHT = 898, 810
POSITIONS = (48, 974)
LENGTH = 8
ANGLES = (12, 28)
CHAPTERS = ((0, '俯瞰旋臂'), (2.8, '掠过尘带'), (5.8, '贴近银盘'))


def comparison(renderer):
    font_dir = Path(os.environ.get('WINDIR', 'C:/Windows')) / 'Fonts'
    title = ImageFont.truetype(str(font_dir / 'msyhbd.ttc'), 42)
    label = ImageFont.truetype(str(font_dir / 'msyhbd.ttc'), 26)
    note = ImageFont.truetype(str(font_dir / 'msyh.ttc'), 24)
    mono = ImageFont.truetype(str(font_dir / 'bahnschrift.ttf'), 24)
    films = [renderer['GalaxyFilm'](PANEL_WIDTH, PANEL_HEIGHT, math.radians(angle), titles=False) for angle in ANGLES]
    base = Image.new('RGB', (WIDTH, HEIGHT), '#0a101e')
    pen = ImageDraw.Draw(base)
    pen.text((48, 21), 'FIELD NOTES   /   06', font=mono, fill='#9ebadb')
    pen.text((44, 51), '银河旋臂张角', font=title, fill='#f1f5fb')
    pen.text((1872, 67), '同一随机种子  /  同一镜头路线', font=note, fill='#aebfd5', anchor='rm')
    for x, angle, caption in zip(POSITIONS, ANGLES, ('紧卷', '舒展')):
        pen.rectangle((x-1, 121, x+PANEL_WIDTH, 978), fill='#172338', outline='#344962')
        pen.text((x+19, 144), f'{angle}°', font=mono, fill='#d9efae', anchor='lm')
        pen.text((x+78, 144), caption, font=label, fill='#f1f5fb', anchor='lm')
    pen.text((48, 1010), '示意渲染  /  四条对数旋臂', font=note, fill='#aebfd5')

    def frame(time):
        # Hold the first composition, then move both views together along the same route.
        route_time = max(0, time - .45) * 9.3 / (LENGTH - .45)
        camera = renderer['camera_at'](route_time)
        camera[4] *= .90
        camera[5] = .50
        camera[6] = .48
        image = base.copy()
        for x, film in zip(POSITIONS, films):
            image.paste(film.frame(route_time, camera), (x, 166))
        pen = ImageDraw.Draw(image)
        chapter = max(index for index, (start, _) in enumerate(CHAPTERS) if time >= start)
        pen.text((1872, 1017), f'{chapter + 1:02d}   /   {CHAPTERS[chapter][1]}', font=note, fill='#d9efae', anchor='rm')
        return image

    return frame


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=LAB / 'galaxy-media')
    parser.add_argument('--poster-only', action='store_true')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    cv2.setNumThreads(2)
    renderer = run_path(str(LAB / 'build-galaxy-film.py'))
    frame = comparison(renderer)
    fps = renderer['FPS']
    if not args.poster_only:
        staging = args.output / 'galaxy-pitch-compare.rendering.mp4'
        command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                   '-s:v', f'{WIDTH}x{HEIGHT}', '-r', str(fps), '-i', '-', '-an', '-c:v', 'libx264',
                   '-threads', '3', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(staging)]
        with subprocess.Popen(command, stdin=subprocess.PIPE) as encoder:
            for index in range(LENGTH * fps):
                encoder.stdin.write(frame(index / fps).tobytes())
                if index % (2 * fps) == 0:
                    print(f'{index}/{LENGTH * fps}', flush=True)
            encoder.stdin.close()
            if encoder.wait():
                raise RuntimeError('Could not encode the comparison film')
        staging.replace(args.output / 'galaxy-pitch-compare.mp4')
    frame(.40).save(args.output / 'galaxy-pitch-compare.jpg', quality=93, subsampling=0)


if __name__ == '__main__':
    main()
