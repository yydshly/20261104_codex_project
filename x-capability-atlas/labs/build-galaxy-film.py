"""Render case 06's illustrative four-arm galaxy. Requires NumPy, OpenCV, Pillow and FFmpeg."""
import argparse
import math
import os
from pathlib import Path
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


FPS = 24
DURATION = 12
PITCH = math.radians(18)
SEED = 6
SIZE = 1440
EXTENT = 1.52
CAMERA = (
    # time, focus x/y, tilt, azimuth, scale, image center x/y
    (0, -.10, .04, 13, -17, .420, .600, .488),
    (2.7, -.025, -.012, 19, -5, .470, .547, .486),
    (5.2, .09, -.05, 46, 13, .660, .495, .468),
    (7.3, .15, -.07, 61, 34, .755, .492, .458),
    (9.1, .015, -.02, 78, 50, .669, .512, .464),
    (12, 0, .018, 37, 66, .500, .558, .470),
)


def fractal(rng, size, bands):
    field = np.zeros((size, size), dtype=np.float32)
    for cells, weight in bands:
        grid = rng.random((cells, cells), dtype=np.float32)
        field += np.clip(cv2.resize(grid, (size, size), interpolation=cv2.INTER_CUBIC), 0, 1) * weight
    return field


def galactic_clouds(rng, pitch=PITCH):
    axis = np.linspace(-EXTENT, EXTENT, SIZE, dtype=np.float32)
    x, y = np.meshgrid(axis, axis)
    r = np.hypot(x, y)
    noise = fractal(rng, SIZE, [(10, .38), (27, .30), (63, .17), (170, .10), (400, .05)])
    fine = fractal(rng, SIZE, [(38, .42), (107, .32), (260, .17), (630, .09)])
    theta = np.arctan2(y, x)
    angle = theta - np.log(np.maximum(r, .038) / .35) / math.tan(pitch) - .42
    angle += (noise - .50) * .56
    arm = (angle + math.pi / 4) % (math.pi / 2) - math.pi / 4
    spread = .035 + .053 * r
    envelope = np.exp(-r * 1.45 - (r / 1.18) ** 7) * (1 - np.exp(-(r / .13) ** 3))
    distance = arm * np.maximum(r, .14)
    lane = np.exp(-((distance + .027 + .025 * fine) / (.012 + .024 * r)) ** 2)
    knots = np.clip((noise - .27) * 1.83, 0, 1) ** 1.3
    main = np.exp(-((distance - .009) / spread) ** 2) * envelope * knots
    broad = np.exp(-(distance / (spread * 1.76)) ** 2) * envelope * (.50 + fine * .46)
    rose = np.exp(-((distance - .049) / (spread * .68)) ** 2) * envelope
    rose *= np.clip((noise * .55 + fine * .45 - .38) * 3.2, 0, 1) ** 2.6
    arms = (main * (2.8 - lane * 2.2))[..., None] * np.array([.39, .61, 1.06], np.float32)
    arms += (broad * .65)[..., None] * np.array([.22, .28, .63], np.float32)
    arms += (rose * 1.16)[..., None] * np.array([.91, .27, .49], np.float32)
    arms *= (.58 + fine[..., None] * .84)

    # The diffuse disk and barred center have their own warm palette and scale height.
    disk = np.exp(-r * 3.1 - (r / 1.14) ** 6) * (.5 + noise * .47)
    disk_rgb = disk[..., None] * np.array([.27, .26, .39], np.float32)
    c, s = math.cos(.55), math.sin(.55)
    major, minor = x * c + y * s, -x * s + y * c
    bar = np.exp(-np.hypot(major / .24, minor / .076) ** 1.27)
    core = np.exp(-np.hypot(major / .111, minor / .085) ** 1.34)
    hot = (1.12 * bar + 3.1 * core) * (.81 + noise * .24)
    bulge_rgb = hot[..., None] * np.array([1.11, .64, .29], np.float32)
    return np.ascontiguousarray(arms), np.ascontiguousarray(disk_rgb), np.ascontiguousarray(bulge_rgb)


def star_field(rng, pitch=PITCH):
    count = 44000
    arm_count = 29800
    r = np.concatenate((.10 + rng.beta(1.3, 1.55, arm_count) * 1.14, rng.gamma(2, .24, count - arm_count)))
    angle = rng.uniform(-math.pi, math.pi, count)
    angle[:arm_count] = np.log(r[:arm_count] / .35) / math.tan(pitch) + rng.integers(0, 4, arm_count) * math.pi / 2 + .42
    angle[:arm_count] += rng.normal(0, .12 + .025 / r[:arm_count], arm_count)
    z = rng.normal(0, .019, count) + rng.normal(0, .047, count) * (rng.random(count) < .18)
    central = 4800
    x_core = rng.normal(0, .13, central)
    y_core = rng.normal(0, .057, central)
    x = np.concatenate((r * np.cos(angle), .853 * x_core - .523 * y_core))
    y = np.concatenate((r * np.sin(angle), .523 * x_core + .853 * y_core))
    z = np.concatenate((z, rng.normal(0, .036, central)))
    brightness = np.minimum(3.6, rng.lognormal(-2.25, 1.10, len(x))).astype(np.float32)
    warmth = rng.random(len(x), dtype=np.float32)
    warm = np.clip((warmth - .55) * 2.4, 0, 1)
    rgb = np.column_stack((.53 + warm * .50, .75 - warm * .10, 1.11 - warm * .52)).astype(np.float32)
    rgb[-central:] = [.99, .71, .43]
    rgb *= brightness[:, None]
    return np.stack((x, y, z), axis=1).astype(np.float32), rgb


def camera_at(time):
    # Cubic Hermite with continuous derivatives across the camera chapter marks.
    times = np.array([item[0] for item in CAMERA])
    values = np.array([item[1:] for item in CAMERA])
    index = min(len(times) - 2, max(0, int(np.searchsorted(times, time)) - 1))
    span = times[index + 1] - times[index]
    t = (time - times[index]) / span
    before, after = max(0, index - 1), min(len(times) - 1, index + 2)
    tangent_a = (values[index + 1] - values[before]) / (times[index + 1] - times[before])
    tangent_b = (values[after] - values[index]) / (times[after] - times[index])
    return (2*t**3 - 3*t*t + 1) * values[index] + (t**3 - 2*t*t + t) * span * tangent_a + (
        -2*t**3 + 3*t*t) * values[index + 1] + (t**3 - t*t) * span * tangent_b


def project(points, camera, width, height):
    target_x, target_y, tilt, azimuth, scale, center_x, center_y = camera
    c, s = math.cos(math.radians(azimuth)), math.sin(math.radians(azimuth))
    ct, st = math.cos(math.radians(tilt)), math.sin(math.radians(tilt))
    x, y, z = points.T
    x, y = x - target_x, y - target_y
    sideways = x * c - y * s
    forward = x * s + y * c
    vertical = forward * ct + z * st
    depth = forward * st - z * ct
    pixels = (scale * height) / np.maximum(.68, 1 + depth / 4.2)
    return sideways * pixels + center_x * width, -vertical * pixels + center_y * height


def warp(texture, camera, elevation, width, height):
    corners = np.array([[-EXTENT, -EXTENT, elevation], [EXTENT, -EXTENT, elevation],
                        [EXTENT, EXTENT, elevation], [-EXTENT, EXTENT, elevation]])
    destination = np.column_stack(project(corners, camera, width, height)).astype(np.float32)
    grid = np.array([[0, 0], [SIZE-1, 0], [SIZE-1, SIZE-1], [0, SIZE-1]], dtype=np.float32)
    transform = cv2.getPerspectiveTransform(grid, destination)
    return cv2.warpPerspective(texture, transform, (width, height), flags=cv2.INTER_LINEAR)


def splat(positions, rgb, width, height):
    x, y = positions
    inside = (x > 1) & (x < width-2) & (y > 1) & (y < height-2)
    x, y, color = x[inside], y[inside], rgb[inside]
    xi, yi = x.astype(int), y.astype(int)
    xf, yf = x-xi, y-yi
    frame = np.zeros((height, width, 3), dtype=np.float32)
    for px, py, gain in ((xi, yi, (1-xf)*(1-yf)), (xi+1, yi, xf*(1-yf)),
                         (xi, yi+1, (1-xf)*yf), (xi+1, yi+1, xf*yf)):
        np.add.at(frame, (py, px), color * gain[:, None])
    return frame


def fonts(scale):
    font_dir = Path(os.environ.get('WINDIR', 'C:/Windows')) / 'Fonts'
    return tuple(ImageFont.truetype(str(font_dir / name), round(size * scale)) for name, size in
                 [('bahnschrift.ttf', 21), ('msyhbd.ttc', 55), ('msyhl.ttc', 28), ('bahnschrift.ttf', 17)])


def title_cards(width, height):
    scale = height / 1080
    kicker, title, note, tech = fonts(scale)
    entries = [
        ('01  /  GALACTIC STRUCTURE', '银河旋臂', '从俯瞰看清四条对数旋臂'),
        ('02  /  THROUGH THE ARM', '掠过旋臂', '从斜角看星光与尘埃层次'),
        ('03  /  EDGE OF THE DISK', '倾向银盘', '转向侧视，观察银盘与中央隆起'),
    ]
    cards = []
    for label, headline, summary in entries:
        # Keep the title separate from the projected scene and fade it between camera chapters.
        width_box, height_box = round(720*scale), round(159*scale)
        overlay = Image.new('RGBA', (width_box, height_box))
        pen = ImageDraw.Draw(overlay)
        pen.rectangle((0, 0, round(41*scale), max(1, round(2*scale))), fill=(158, 205, 238))
        pen.text((0, round(14*scale)), label, font=kicker, fill=(164, 201, 233), stroke_width=1, stroke_fill=(7, 10, 21, 146))
        pen.text((0, round(40*scale)), headline, font=title, fill=(244, 248, 251), stroke_width=1, stroke_fill=(7, 10, 21, 170))
        pen.text((0, round(115*scale)), summary, font=note, fill=(194, 211, 229), stroke_width=1, stroke_fill=(7, 10, 21, 146))
        cards.append(overlay)
    mark = Image.new('RGBA', (round(460*scale), round(28*scale)))
    pen = ImageDraw.Draw(mark)
    pen.text((mark.width-1, 0), 'FIELD NOTES   /   06    ·    PROCEDURAL VISUALIZATION', anchor='rt', font=tech, fill=(154, 178, 206, 230))
    return cards, mark


def opacity(time, start, end):
    value = max(0, min(1, (time-start)/.40, (end-time)/.37))
    return value * value * (3 - 2 * value)


class GalaxyFilm:
    def __init__(self, width, height, pitch=PITCH, *, titles=True):
        self.width, self.height = width, height
        rng = np.random.default_rng(SEED)
        self.arms, self.disk, self.bulge = galactic_clouds(rng, pitch)
        self.points, self.colors = star_field(rng, pitch)
        self.background_points = rng.random((2100, 2), dtype=np.float32)
        brightness = np.minimum(1, rng.lognormal(-3.32, 1.02, len(self.background_points))).astype(np.float32)
        self.background_colors = brightness[:, None] * np.array([.68, .81, 1.04], np.float32)
        x = np.linspace(-1, 1, width, dtype=np.float32)[None, :]
        y = np.linspace(-1, 1, height, dtype=np.float32)[:, None]
        hue = np.exp(-((x+.42)**2 * 1.65 + (y-.53)**2 * 1.14))
        field = fractal(rng, 320, [(5, .63), (14, .28), (40, .09)])
        clouds = cv2.resize(field, (width, height), interpolation=cv2.INTER_LINEAR)
        self.background = (hue * clouds)[..., None] * np.array([.009, .013, .032], np.float32)
        self.background += np.array([.0018, .0032, .0090], np.float32)
        self.vignette = (1 - .23 * np.minimum(1, x*x*.61 + y*y*.59))[..., None]
        self.dither = (rng.random((height, width), dtype=np.float32) - .50)[..., None]
        self.titles = title_cards(width, height) if titles else None

    def frame(self, time, camera=None):
        width, height = self.width, self.height
        if camera is None:
            camera = camera_at(time)
        phase = math.radians(camera[2])
        frame = self.background.copy()
        bx, by = self.background_points.T
        far = splat((((bx + time*.0029) % 1)*width, ((by - time*.00115) % 1)*height), self.background_colors, width, height)
        frame += far + cv2.GaussianBlur(far, (0, 0), .8) * .36
        clouds = warp(self.arms, camera, 0, width, height)
        clouds += warp(self.disk, camera, .021, width, height)
        clouds += warp(self.disk, camera, -.038, width, height) * .44
        clouds *= 1 + .36 * math.sin(phase)
        for elevation, strength in ((-.073, .17), (0, .73), (.073, .20)):
            clouds += warp(self.bulge, camera, elevation, width, height) * strength
        frame += clouds
        frame += cv2.GaussianBlur(clouds, (0, 0), 4.7) * .21
        frame += cv2.resize(cv2.GaussianBlur(cv2.resize(clouds, (width//4, height//4)), (0, 0), 6.6), (width, height)) * .21
        stars = splat(project(self.points, camera, width, height), self.colors, width, height)
        frame += stars * .92 + cv2.GaussianBlur(stars, (0, 0), 1.28) * .45
        frame *= self.vignette
        frame *= .88 + .12 * min(1, time/.50, (DURATION-time)/.54)
        mapped = np.power(-np.expm1(-frame * 1.27), .77)
        output = Image.fromarray(np.uint8(np.clip(mapped * 255 + self.dither, 0, 255)))
        if self.titles is None:
            return output
        cards, mark = self.titles
        for card, bounds in zip(cards, [(-.38, 3.27), (3.18, 7.35), (7.22, 11.94)]):
            fade = opacity(time, *bounds)
            if fade:
                alpha = card.getchannel('A').point(lambda value: round(value * fade))
                output.paste(card, (round(width*.057), round(height*.754)), alpha)
        output.paste(mark, (width-mark.width-round(width*.045), round(height*.056)), mark)
        return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path(__file__).with_name('galaxy-media'))
    parser.add_argument('--width', type=int, default=1920)
    parser.add_argument('--sample', type=float, action='append', help='Write inspection frames only')
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    height = round(args.width*9/32)*2
    cv2.setNumThreads(2)
    film = GalaxyFilm(args.width, height)
    if args.sample:
        for time in args.sample:
            film.frame(time).save(args.output / f'galaxy-{time:04.1f}.jpg', quality=92, subsampling=0)
        return
    video = args.output / 'galaxy-flight.mp4'
    staging = args.output / 'galaxy-flight.rendering.mp4'
    ffmpeg = ['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
              '-s:v', f'{args.width}x{height}', '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264',
              '-threads', '3', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(staging)]
    with subprocess.Popen(ffmpeg, stdin=subprocess.PIPE) as encoder:
        for index in range(DURATION * FPS):
            encoder.stdin.write(film.frame(index/FPS).tobytes())
            if index % 48 == 0:
                print(f'{index}/{DURATION*FPS}', flush=True)
        encoder.stdin.close()
        if encoder.wait():
            raise RuntimeError('FFmpeg failed to encode the galaxy film')
    staging.replace(video)
    film.frame(1.20).save(args.output / 'galaxy-flight.jpg', quality=91, subsampling=0)


if __name__ == '__main__':
    main()
