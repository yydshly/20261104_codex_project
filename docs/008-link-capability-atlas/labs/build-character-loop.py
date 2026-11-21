"""Render the Xiaojing listening and idle states and package the character kit."""
import argparse
import math
from pathlib import Path
import subprocess
from zipfile import ZIP_DEFLATED, ZIP_STORED, ZipFile

import cv2
import numpy as np
from PIL import Image


SIZE = 600
FPS = 24
FRAMES = 60
IDLE_FRAMES = 96
MEDIA = Path(__file__).resolve().parent / 'character-media'
EYE_CONTOURS = (
    # Horizontal position, upper lash, lower lid. Positions use the shared 600 px stage.
    ((225, 274, 275), (234, 270, 276), (243, 265, 279), (253, 264, 282),
     (263, 265, 282), (271, 269, 281), (281, 280, 282), (285, 281, 282)),
    ((325, 281, 282), (331, 279, 282), (340, 269, 281), (349, 264, 280),
     (359, 262, 279), (368, 264, 277), (378, 268, 275), (386, 270, 271)),
)


def ease(start, end, t):
    value = min(1, max(0, (t - start) / (end - start)))
    return value ** 3 * (value * (6 * value - 15) + 10)


def load_character():
    with Image.open(MEDIA / 'xiaojing.png') as image:
        portrait = image.convert('RGBA').resize((528, 528), Image.Resampling.LANCZOS)
    layer = Image.new('RGBA', (SIZE, SIZE))
    layer.paste(portrait, (36, 57))
    pixels = np.asarray(layer, dtype=np.float32) / 255
    pixels[:, :, :3] *= pixels[:, :, 3:4]
    return pixels


def backdrop(x, y):
    light = np.exp(-(((x - 264) / 330) ** 2 + ((y - 226) / 370) ** 2) * 2.2)
    edge = np.exp(-((x - 493) / 205) ** 2 - ((y - 395) / 360) ** 2) * .20
    colors = (np.array([17, 32, 33]) + light[:, :, None] * [43, 62, 52] + edge[:, :, None] * [12, 18, 10]) / 255
    grain = np.random.default_rng(227).normal(0, .62 / 255, x.shape).astype(np.float32)
    return (colors + grain[:, :, None]).astype(np.float32)


def draw(layer, base, x, y, frame):
    t = frame / FPS
    nod = ease(.28, .90, t) - ease(1.03, 1.76, t)
    settle = .13 * (ease(1.57, 1.84, t) - ease(1.84, 2.15, t))
    amount = nod - settle
    if amount:
        neck = np.clip((479 - y) / 138, 0, 1)
        neck *= neck * (3 - 2 * neck)
        angle = math.radians(2.5) * amount * neck
        dx, dy = x - 299, y - 330
        mx = 299 + dx * np.cos(angle) + dy * np.sin(angle) - amount * neck * 3
        my = 330 - dx * np.sin(angle) + dy * np.cos(angle) - amount * neck * (15 + 6 * (y / SIZE))
        # Keep the knit collar and shoulders fixed while the face pitches down.
        my += amount * neck * (y - 270) * .039
        portrait = cv2.remap(layer, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT)
        np.clip(portrait, 0, 1, out=portrait)
    else:
        portrait = layer
    return composite(portrait, base)


def composite(portrait, base):
    alpha = portrait[:, :, 3:4]
    rgb = np.minimum(portrait[:, :, :3], alpha) + base * (1 - alpha)
    return np.clip(np.rint(rgb * 255), 0, 255).astype(np.uint8)


def blink_eye(portrait, contour, amount):
    points, top, bottom = np.asarray(contour).T
    left, right = points[0], points[-1] + 1
    first_y, last_y = min(top) - 10, max(bottom) + 11
    y, x = np.mgrid[first_y:last_y, left:right].astype(np.float32)
    upper = np.interp(x[0], points, top)
    lower = np.interp(x[0], points, bottom)
    falloff = np.clip(np.minimum(x[0] - left, right - 1 - x[0]) / 9, 0, 1)
    closure = amount * falloff * falloff * (3 - 2 * falloff)
    # Stretch the upper lid down and raise the lower lid slightly, keeping the lens rim fixed.
    slit = upper + .78 * (lower - upper)
    closed_upper = upper + (slit - upper) * closure
    closed_lower = lower + (slit - lower) * closure
    cap, floor = upper - 8, lower + 9
    before = cap + (y - cap) * (upper - cap) / (closed_upper - cap)
    eye = upper + (y - closed_upper) * (lower - upper) / (closed_lower - closed_upper)
    after = lower + (y - closed_lower) * (floor - lower) / (floor - closed_lower)
    mapped = np.select(
        [(y >= cap) & (y < closed_upper), (y >= closed_upper) & (y <= closed_lower),
         (y > closed_lower) & (y <= floor)], [before, eye, after], default=y,
    )
    region = portrait[first_y:last_y, left:right]
    region[:] = np.clip(cv2.remap(region, (x - left).astype(np.float32), (mapped - first_y).astype(np.float32),
                                 cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE), 0, 1)


def draw_idle(layer, base, frame):
    t = frame / FPS
    amount = .985 * (ease(1.17, 1.31, t) - ease(1.35, 1.51, t))
    if not amount:
        return composite(layer, base)
    portrait = layer.copy()
    for contour in EYE_CONTOURS:
        blink_eye(portrait, contour, amount)
    return composite(portrait, base)


def encode_frames(frames, options, output):
    command = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
               '-video_size', f'{SIZE}x{SIZE}', '-framerate', str(FPS), '-i', '-', *options, str(output)]
    with subprocess.Popen(command, stdin=subprocess.PIPE) as process:
        for frame in frames:
            process.stdin.write(frame.tobytes())
        process.stdin.close()
        if process.wait():
            raise RuntimeError(f'Encoding {output.name} failed')


def save_loop(frames, name, action_frame):
    if not np.array_equal(frames[0], frames[-1]) or np.array_equal(frames[0], frames[action_frame]):
        raise RuntimeError(f'{name} did not move and return to its initial pose')
    encode_frames(frames, [
        '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    ], MEDIA / f'xiaojing-{name}.mp4')
    encode_frames(frames, [
        '-filter_complex_threads', '1', '-filter_complex',
        '[0:v]fps=20,scale=360:360:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff:max_colors=256[p];[b][p]paletteuse=dither=bayer:bayer_scale=3',
        '-loop', '0',
    ], MEDIA / f'xiaojing-{name}.gif')


def save_avatars():
    with Image.open(MEDIA / 'xiaojing.png') as source:
        for size, name in ((512, 'avatar-512'), (1024, 'avatar-1024-alpha')):
            framed = round(size * 1.045)
            crop = source.resize((framed, framed), Image.Resampling.LANCZOS)
            position = ((size - framed) // 2, round((size - framed) / 2 + size * .035))
            avatar = Image.new('RGBA', (size, size))
            avatar.alpha_composite(crop, dest=position)
            if size == 512:
                y, x = np.mgrid[:size, :size] / size
                fade = np.clip((np.hypot(x - .47, y - .34) - .035) / .685, 0, 1)
                color = np.array([236, 243, 218]) + fade[:, :, None] * [-93, -56, -44]
                paper = Image.fromarray(color.round().astype(np.uint8)).convert('RGBA')
                avatar = Image.alpha_composite(paper, avatar).convert('RGB')
            avatar.save(MEDIA / f'xiaojing-{name}.png', optimize=True)


def package_kit():
    readme = """# 小镜角色素材包

小镜的紫色圆框眼镜、青色短发和浅绿发夹来自同一张原创角色图。

- `xiaojing-avatar-512.png` 是薄雾青底头像，适合聊天和通知列表。
- `xiaojing-avatar-1024-alpha.png` 是同一构图的透明底头像，可自行搭配背景。
- `xiaojing-idle.mp4` / `.gif` 是 4 秒待机状态，包含一次眨眼。
- `xiaojing-nod.mp4` / `.gif` 是 2.5 秒倾听回应，包含一次轻点头。

两种状态共用同一方形构图和开场姿态。MP4 为 600 × 600、24 fps、无声，GIF 为 360 × 360、20 fps、循环播放。等待用户输入时循环待机。需要回应时播放点头一次，再切回待机。两种格式均带深青色背景。
"""
    manifest = MEDIA / 'xiaojing-kit.zip'
    staging = manifest.with_suffix('.part')
    with ZipFile(staging, 'w', ZIP_STORED) as kit:
        for name in ('avatar-512.png', 'avatar-1024-alpha.png', 'idle.mp4', 'idle.gif', 'nod.mp4', 'nod.gif'):
            path = MEDIA / f'xiaojing-{name}'
            kit.write(path, path.name)
        kit.writestr('README.md', readme, ZIP_DEFLATED)
    staging.replace(manifest)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--keep-nod', action='store_true', help='Package the existing nod files instead of rendering them again.')
    args = parser.parse_args()
    y, x = np.mgrid[:SIZE, :SIZE].astype(np.float32)
    layer = load_character()
    base = backdrop(x, y)
    if not args.keep_nod:
        frames = [draw(layer, base, x, y, number) for number in range(FRAMES)]
        save_loop(frames, 'nod', 22)
        Image.fromarray(frames[0]).save(MEDIA / 'xiaojing-nod.jpg', quality=91, optimize=True)
    idle = [draw_idle(layer, base, number) for number in range(IDLE_FRAMES)]
    save_loop(idle, 'idle', 32)
    Image.fromarray(idle[32]).save(MEDIA / 'xiaojing-idle-blink.jpg', quality=91, optimize=True)
    save_avatars()
    package_kit()


if __name__ == '__main__':
    main()
