"""Compose source-frame evidence figures. This does not implement an effect.

The full source frame is resized uniformly, never cropped. Numbered callouts and
manual visible rider/bicycle bounds are explanatory overlays, not tracking data.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

from render_analysis import BG, FG, MUTED, ACCENT, font, write_wrapped, numbered_marker


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = json.loads((ROOT / "reference/grassland-frame-observations.json").read_text(encoding="utf-8"))


def diagram() -> None:
    canvas = Image.new("RGB", (1600, 2020), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((36, 24), "弯曲海岸：场景给了什么，运动又增加了什么？", font=font(43, True), fill=FG)
    draw.text((36, 87), "grassland special / 前、中、后原片抽帧 / 三帧均保留完整画幅", font=font(26), fill=MUTED)

    panels = [
        {
            "heading": "0.10 秒 · 先看场景本身",
            "subheading": "奇观在开场已经存在",
            "sections": [
                ("直接可见", "① 高崖与巨型建筑向上延伸\n② 弧形海湾围出巨大凹空间\n③ 草坡上的小人物提供尺度"),
                ("场景的贡献", "停在这一帧，仍能看到异常尺度、弯曲岸线与近远层次。"),
                ("判断边界", "这能证明奇观已在画面中，不能证明地面正在由平变卷。"),
            ],
            "markers": [(0.86, 0.24), (0.20, 0.40), (0.08, 0.80)],
            "targets": [(0.76, 0.36), (0.40, 0.64), (0.18, 0.91)],
        },
        {
            "heading": "2.00 秒 · 相对接近主体",
            "subheading": "从远看世界，变为贴近人物",
            "sections": [
                ("直接可见", "人车的可见高度由约 18% 增至约 74%；背景的取景范围也发生变化。"),
                ("运动的贡献", "产生向前推进与追近的观感；观众开始跟随主体体验空间。"),
                ("判断边界", "相机推进、变焦、人物行进和生成式变化可能共同参与。"),
            ],
            "markers": [], "targets": [],
        },
        {
            "heading": "6.87 秒 · 观看关系转向背后",
            "subheading": "前方路线成为新的注意中心",
            "sections": [
                ("直接可见", "人物主要呈背面；右侧主建筑大部移出；草坡小径与海湾前方显露。"),
                ("运动的贡献", "视点与人物朝向的变化，带来沿着路线进入世界的感觉。"),
                ("判断边界", "相机转向和人物过弯无法唯一分离；不把所有背景变化都归给镜头。"),
            ],
            "markers": [], "targets": [],
        },
    ]

    for index, (panel, frame) in enumerate(zip(panels, EVIDENCE["frames"])):
        top = 155 + index * 575
        draw.text((36, top), panel["heading"], font=font(33, True), fill=ACCENT)
        image_top = top + 52
        picture = Image.open(ROOT / frame["file"]).convert("RGB").resize((864, 486), Image.Resampling.LANCZOS)
        canvas.paste(picture, (36, image_top))
        scale = 864 / EVIDENCE["source_resolution"][0]
        left, upper, right, lower = frame["visible_rider_and_bicycle_bbox_xyxy"]
        box = (36 + int(left * scale), image_top + int(upper * scale),
               36 + int(right * scale), image_top + int(lower * scale))
        draw.rectangle(box, outline="#75d4e4", width=3)
        for number, ((mx, my), (tx, ty)) in enumerate(zip(panel["markers"], panel["targets"]), 1):
            location = (36 + int(mx * 864), image_top + int(my * 486))
            target = (36 + int(tx * 864), image_top + int(ty * 486))
            draw.line((*location, *target), fill=ACCENT, width=2)
            numbered_marker(draw, location, number)
        text_y = image_top - 2
        text_y = write_wrapped(draw, panel["subheading"], (938, text_y), 620, size=30, bold=True, gap=12)
        text_y += 17
        for heading, content in panel["sections"]:
            text_y = write_wrapped(draw, heading, (938, text_y), 620, size=27, fill=ACCENT, bold=True, gap=8)
            text_y += 3
            text_y = write_wrapped(draw, content, (938, text_y), 620, size=26, gap=9)
            text_y += 16
        if text_y > top + 558:
            raise ValueError(f"Panel text overflows: {panel['heading']} {text_y}")

    draw.text((36, 1893), "场景先提供巨大、弯曲的空间；运动再提供接近、转向与进入感。", font=font(32, True), fill=FG)
    write_wrapped(draw, "青色框为人工估计的人车可见范围，比例不是相机距离测量。原片抽帧经 HLG→SDR 近似转换，未额外调色。", (36, 1950), 1510, size=23, fill=MUTED, gap=9)
    canvas.save(ROOT / "assets/grassland-scene-vs-camera.jpg", quality=95)


def timeline() -> None:
    reference = json.loads((ROOT / "sources.json").read_text(encoding="utf-8"))["references"][0]
    canvas = Image.new("RGB", (1968, 860), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((24, 18), "grassland special · 八处抽帧，保持相同画幅", font=font(36, True), fill=FG)
    draw.text((24, 71), "沿时间顺序从左到右，再看下一排；观察人物大小、朝向、海湾与建筑的可见范围。", font=font(24), fill=MUTED)
    for index, frame in enumerate(reference["frames"]):
        row, column = divmod(index, 4)
        x = 24 + column * 486
        y = 123 + row * 337
        picture = Image.open(ROOT / frame["path"]).convert("RGB").resize((474, 267), Image.Resampling.LANCZOS)
        canvas.paste(picture, (x, y + 40))
        draw.text((x, y), f'{frame["time_seconds"]:.2f} 秒', font=font(25, True), fill=ACCENT)
    draw.text((24, 815), "来源：@hi_personality 原帖 2115567493565825244。HLG→SDR 分析预览；所有时刻见 sources.json。", font=font(23), fill=MUTED)
    canvas.save(ROOT / "assets/grassland-eight-frame-sequence.jpg", quality=95)


if __name__ == "__main__":
    diagram()
    timeline()
    print(json.dumps({"outputs": ["assets/grassland-scene-vs-camera.jpg", "assets/grassland-eight-frame-sequence.jpg"],
                      "mode": "source-frame analysis only", "source_frames": len(EVIDENCE["frames"])}, ensure_ascii=False))
