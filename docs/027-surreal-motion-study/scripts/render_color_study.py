"""Controlled same-frame scientific illustrations for the research report.

No creative image generation, camera/geometry changes, HDR forging, or product
effect implementation. Existing video and frames are left unchanged. The decoded
HLG frame is tone-mapped once, converted to linear BT.709 RGB, and the three SDR
variants share that one display-referred baseline. Images include an sRGB ICC.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageCms, ImageDraw

from render_analysis import BG, FG, MUTED, ACCENT, font, write_wrapped, numbered_marker


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/color-study"
SOURCE = ROOT / "assets/grassland-special/reference.mp4"
TIME = 0.1
WIDTH, HEIGHT = 1920, 1080
LINEAR_FILTER = (
    "zscale=t=linear:npl=100,format=gbrpf32le,"
    "tonemap=tonemap=hable:desat=0,"
    "zscale=p=bt709:t=linear:m=gbr:r=full,format=gbrpf32le"
)


def srgb_encode(linear: np.ndarray) -> np.ndarray:
    bounded = np.clip(linear, 0, 1)
    return np.where(bounded <= 0.0031308, bounded * 12.92,
                    1.055 * np.power(bounded, 1 / 2.4) - 0.055)


def image_from_linear(linear: np.ndarray) -> Image.Image:
    rgb = np.round(srgb_encode(linear) * 255).astype(np.uint8)
    return Image.fromarray(rgb)


def collect_variants() -> tuple[dict[str, Image.Image], dict]:
    OUT.mkdir(parents=True, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    command = [ffmpeg, "-v", "error", "-ss", str(TIME), "-i", str(SOURCE), "-frames:v", "1",
               "-vf", LINEAR_FILTER, "-pix_fmt", "gbrpf32le", "-f", "rawvideo", "pipe:1"]
    result = subprocess.run(command, capture_output=True, check=True)
    planes = np.frombuffer(result.stdout, dtype="<f4").reshape(3, HEIGHT, WIDTH)
    # FFmpeg's planar GBR order is G, B, R.
    mapped = np.stack((planes[2], planes[0], planes[1]), axis=-1)
    if not np.isfinite(mapped).all():
        raise ValueError("Non-finite decoded samples")
    baseline = np.clip(mapped, 0, 1)
    exposure = baseline * 2.0
    y = baseline @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    saturation = y[..., None] + 1.4 * (baseline - y[..., None])
    before_clip_y = saturation @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    luma_error = float(np.max(np.abs(y - before_clip_y)))
    if luma_error > 2e-6:
        raise ValueError("Unexpected luminance-axis transform error")
    transformed = {"baseline-sdr": baseline, "exposure-plus-one-ev": exposure,
                   "saturation-1p4": saturation}
    profile = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()
    pictures = {}
    records = []
    for name, data in transformed.items():
        picture = image_from_linear(data)
        destination = OUT / f"{name}.png"
        picture.save(destination, icc_profile=profile)
        pictures[name] = picture
        records.append({"name": name, "file": destination.relative_to(ROOT).as_posix(),
                        "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
                        "out_of_display_rgb_range_pixel_fraction_before_clamp": float(np.mean(np.any((data < 0) | (data > 1), axis=-1)))})
    provenance = {
        "analyzed_on": "2026-11-12", "reference_id": "grassland-special",
        "post_url": "https://x.com/hi_personality/status/2115567493565825244",
        "source_video": SOURCE.relative_to(ROOT).as_posix(),
        "source_video_sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        "source_time_seconds": TIME, "source_resolution": [WIDTH, HEIGHT],
        "source_signal": {"transfer": "arib-std-b67 (HLG)", "primaries": "bt2020", "decoded_pixel_format": "8-bit yuv420p"},
        "baseline": "Already-graded source frame mapped to SDR with Hable; converted to linear BT.709 RGB then encoded sRGB with an ICC profile. This is not an ungraded source or a camera-RAW exposure reconstruction.",
        "linear_decode_filter": LINEAR_FILTER,
        "exposure_simulation": {"gain_linear_rgb": 2.0, "ev_equivalent": 1.0, "stage": "after SDR tone mapping, display-referred illustration", "clamp_output": [0, 1]},
        "saturation_simulation": {"factor": 1.4, "axis": "linear BT.709 luminance", "weights": [0.2126, 0.7152, 0.0722], "max_luminance_error_before_clamp": luma_error, "limits": "Output gamut clipping can change luminance and hue. This is not the DaVinci saturation algorithm or the author's setting."},
        "hdr_panel": "Exact same baseline SDR picture with annotated regions and a conceptual display-range diagram. No synthetic HDR before/after image or nit measurements.",
        "geometry": "All three variants preserve the exact 1920x1080 frame and time; diagrams resize uniformly. No crop, warping, content replacement or perspective change in the comparison.",
        "outputs": records,
        "scope": "analysis illustrations only"
    }
    (ROOT / "reference/color-study-method.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2), encoding="utf-8")
    return pictures, provenance


def hdr_annotated(picture: Image.Image) -> Image.Image:
    output = picture.copy()
    draw = ImageDraw.Draw(output)
    locations = [((790, 240), (925, 120)), ((1635, 350), (1490, 300)), ((560, 1000), (335, 955))]
    for index, (mark, target) in enumerate(locations, 1):
        draw.line((*mark, *target), fill=ACCENT, width=3)
        # Source-sized callouts remain legible after the diagram resize.
        x, y = mark
        draw.ellipse((x - 40, y - 40, x + 40, y + 40), fill=BG, outline=ACCENT, width=5)
        draw.text((x, y), str(index), font=font(44, True), anchor="mm", fill=ACCENT)
    return output


def comparison(pictures: dict[str, Image.Image]) -> None:
    canvas = Image.new("RGB", (1600, 1680), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((36, 22), "同一帧海岸：曝光、饱和度与 HDR 分别改变什么？", font=font(42, True), fill=FG)
    write_wrapped(draw, "0.10 秒同帧；基准已经过原作者调色并转成 SDR。下面的加亮与加饱和是教学实验，参数不代表作者设置。", (36, 86), 1528, size=26, fill=MUTED, gap=9)
    panels = [
        ("A  基准 · 已调色原片的 SDR 预览", pictures["baseline-sdr"],
         "用于对照", "保留相同场景、镜头和时刻。蓝海、绿草、暖色建筑的关系在基准里已经存在。"),
        ("B  曝光示意 · 线性 RGB ×2（约 +1 EV）", pictures["exposure-plus-one-ev"],
         "增强整体明亮感", "草坡、人物与云层都被抬亮；高光容易挤到显示上限，云层层次可能变少。"),
        ("C  饱和度示意 · 色彩强度 ×1.4", pictures["saturation-1p4"],
         "增强鲜艳与色彩分区", "海更蓝、草更绿、暖色更突出。色域裁切也可能影响亮度和色相，不能视为完全独立。"),
        ("D  HDR 关注区域 · 同一基准图标注", hdr_annotated(pictures["baseline-sdr"]),
         "增强高光亮度余量", "①云边 ②窗灯可有更高亮度；③人物和草坡不必整体抬亮。此栏仍是 SDR，不模拟真实 HDR 峰值。"),
    ]
    for index, (title, picture, emphasis, caption) in enumerate(panels):
        row, column = divmod(index, 2)
        x, y = 36 + column * 782, 185 + row * 675
        title_end = write_wrapped(draw, title, (x, y), 746, size=28, fill=ACCENT, bold=True, gap=8)
        image_top = y + 82
        if title_end > image_top - 7:
            raise ValueError("Comparison title overlaps source frame")
        resized = picture.resize((746, 420), Image.Resampling.LANCZOS)
        canvas.paste(resized, (x, image_top))
        text_y = write_wrapped(draw, emphasis, (x, image_top + 435), 746, size=29, bold=True, gap=10)
        write_wrapped(draw, caption, (x, text_y + 7), 746, size=26, fill=FG, gap=11)
    draw.text((36, 1575), "HDR 是信号与显示链路；真实亮度取决于内容、播放器、系统和屏幕，SDR 图片不能完整展示。", font=font(25), fill=MUTED)
    draw.text((36, 1625), "这些变化强化光色；海湾弯曲、高差和透视关系保持相同。原片：@hi_personality。", font=font(25), fill=MUTED)
    canvas.save(OUT / "same-frame-comparison.jpg", quality=95)


def hdr_headroom(pictures: dict[str, Image.Image]) -> None:
    canvas = Image.new("RGB", (1600, 1140), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((36, 24), "HDR 的价值：高光更有余量，中暗部仍可保持层次", font=font(42, True), fill=FG)
    draw.text((36, 88), "下图是同一 SDR 基准的区域标注；下方范围图为概念示意，没有实测亮度或倍率。", font=font(26), fill=MUTED)
    annotated = hdr_annotated(pictures["baseline-sdr"]).resize((1008, 567), Image.Resampling.LANCZOS)
    canvas.paste(annotated, (36, 150))
    yy = 155
    for title, text in [
        ("① 云边与亮云", "可以拥有更高的显示亮度。已有的高光层次如何呈现，还取决于素材与映射。"),
        ("② 发光窗与暖光", "高光与普通表面的亮度关系可以更鲜明，增加发光的观感。"),
        ("③ 人物与草坡", "中间调和阴影可以维持原有关系，无需跟着高光一起整体变亮。"),
    ]:
        yy = write_wrapped(draw, title, (1085, yy), 475, size=29, fill=ACCENT, bold=True, gap=10)
        yy = write_wrapped(draw, text, (1085, yy + 7), 475, size=26, gap=11) + 29
    draw.line((36, 760, 1564, 760), fill="#3c4b57", width=2)
    # Unequal lengths depict a qualitative range, not a measured device ratio.
    draw.text((36, 794), "概念范围", font=font(28, True), fill=FG)
    draw.text((36, 849), "SDR", font=font(27), fill=FG)
    draw.text((36, 926), "HDR", font=font(27), fill=FG)
    for y in [858, 935]:
        draw.rectangle((180, y, 950, y + 27), fill="#61717f")
    draw.rectangle((950, 935, 1450, 962), fill=ACCENT)
    draw.text((180, 987), "暗部 → 中间调 → 普通白", font=font(25), fill=MUTED)
    draw.text((1000, 987), "额外高光余量", font=font(25), fill=ACCENT)
    write_wrapped(draw, "HDR 不会恢复已丢失的细节，也不自动代表更高饱和度。图中亮部余量没有固定倍率，不能当作原片实测。", (36, 1060), 1528, size=24, fill=MUTED, gap=10)
    canvas.save(OUT / "hdr-headroom-explainer.jpg", quality=95)


def main() -> None:
    pictures, provenance = collect_variants()
    comparison(pictures)
    hdr_headroom(pictures)
    print(json.dumps({"outputs": [p["file"] for p in provenance["outputs"]] + ["assets/color-study/same-frame-comparison.jpg", "assets/color-study/hdr-headroom-explainer.jpg"], "source_time": TIME, "hdr_before_after_generated": False}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
