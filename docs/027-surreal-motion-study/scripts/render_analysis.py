"""Make SDR video evidence frames and exact-source contact sheets for analysis."""

from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
FFMPEG = shutil.which("ffmpeg")
FONT = "C:/Windows/Fonts/msyh.ttc"
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
BG = "#101820"
FG = "#f0f4f7"
MUTED = "#a8b9c7"
ACCENT = "#ffcf75"
TONE_MAP = "zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=0,zscale=p=bt709:t=bt709:m=bt709:r=full,format=yuvj420p"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT, size)


def write_wrapped(draw: ImageDraw.ImageDraw, text: str, xy: tuple[int, int], width: int,
                  size: int = 28, fill: str = FG, bold: bool = False, gap: int = 13) -> int:
    x, y = xy
    selected_font = font(size, bold)
    lines = []
    line = ""
    for char in text:
        if char == "\n":
            lines.append(line)
            line = ""
        elif draw.textlength(line + char, font=selected_font) > width:
            if char in "，。；：？！、）》」』”" and line:
                lines.append(line[:-1])
                line = line[-1] + char
            else:
                lines.append(line)
                line = char
        else:
            line += char
    if line:
        lines.append(line)
    for line in lines:
        draw.text((x, y), line, font=selected_font, fill=fill)
        y += size + gap
    return y


def tone_map_frames(sources: dict) -> None:
    for reference in sources["references"]:
        for frame in reference["frames"]:
            subprocess.run([FFMPEG, "-y", "-v", "error", "-ss", str(frame["time_seconds"]),
                            "-i", str(ROOT / reference["local_video"]), "-frames:v", "1", "-vf", TONE_MAP,
                            "-q:v", "2", str(ROOT / frame["path"])], check=True)
        reference["preview_conversion"] = "HLG to BT.709 via FFmpeg zscale + Hable tone mapping; approximate SDR analysis preview"
        provenance = ROOT / "assets" / reference["id"] / "provenance.json"
        provenance.write_text(json.dumps(reference, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "sources.json").write_text(json.dumps(sources, ensure_ascii=False, indent=2), encoding="utf-8")


def temporal_contact_sheet(sources: dict) -> None:
    canvas = Image.new("RGB", (1968, 1100), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((24, 16), "三条原视频 · 时间序列对照", font=font(36, True), fill=FG)
    draw.text((24, 64), "原片抽帧 / HLG → SDR 分析预览 / 时间为本地视频轨时间", font=font(22), fill=MUTED)
    for row, reference in enumerate(sources["references"]):
        y = 110 + row * 314
        draw.text((24, y), reference["title"], font=font(28, True), fill=ACCENT)
        frames = [reference["frames"][i] for i in [0, 2, 4, 7]]
        for col, frame in enumerate(frames):
            x = 24 + col * 486
            picture = Image.open(ROOT / frame["path"]).convert("RGB").resize((474, 267), Image.Resampling.LANCZOS)
            canvas.paste(picture, (x, y + 42))
            draw.rectangle((x + 8, y + 51, x + 106, y + 86), fill=BG)
            draw.text((x + 16, y + 53), f'{frame["time_seconds"]:.2f}s', font=font(22), fill=FG)
    draw.text((24, 1070), "来源：@hi_personality；原帖直链与文件校验记录见 sources.json", font=font(20), fill=MUTED)
    canvas.save(ROOT / "assets/temporal-contact-sheet.jpg", quality=94)


def numbered_marker(draw: ImageDraw.ImageDraw, position: tuple[int, int], number: int) -> None:
    x, y = position
    draw.ellipse((x - 20, y - 20, x + 20, y + 20), fill=BG, outline=ACCENT, width=3)
    label = str(number)
    draw.text((x, y - 1), label, anchor="mm", font=font(25, True), fill=ACCENT)


def effects_and_drivers(sources: dict) -> None:
    canvas = Image.new("RGB", (1600, 1850), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((36, 22), "看原片：空间、运动与光色怎样共同起作用", font=font(44, True), fill=FG)
    draw.text((36, 83), "三个代表案例 / 视觉机制分析 / 与海边城市的关联", font=font(27), fill=MUTED)
    panels = [
        {
            "title": "01  grassland special · 弯曲海岸",
            "id": "grassland-special", "frame": 0,
            "markers": [(0.08, 0.80), (0.86, 0.25), (0.18, 0.42)],
            "targets": [(0.18, 0.91), (0.76, 0.35), (0.25, 0.60)],
            "sections": [
                ("画面线索", "① 小人物提供尺度\n② 巨墙与海岸打破空间常识\n③ 海湾弧线连接近景和远景"),
                ("驱动机制", "开场已有奇观；后续从远景推进到背后跟拍，持续展开空间。"),
                ("对我们的价值", "为海湾轮廓、地标尺度和镜头变化提供可对照的视觉目标。"),
            ],
        },
        {
            "title": "02  chasing · 黄昏楼顶",
            "id": "chasing", "frame": 0,
            "markers": [(0.10, 0.62), (0.64, 0.84), (0.52, 0.30)],
            "targets": [(0.29, 0.64), (0.54, 0.81), (0.45, 0.42)],
            "sections": [
                ("画面线索", "① 近处骑行者便于代入\n② 临边落差形成悬念\n③ 道路光线引向远方"),
                ("驱动机制", "沿边缘前进＋近距离跟拍＋巨大高差，形成持续的紧张与纵深。"),
                ("对我们的价值", "参考崖边道路与城市高差；直升机飞行需要另行判断情绪是否匹配。"),
            ],
        },
        {
            "title": "03  vortex road · 漩涡公路",
            "id": "vortex-road", "frame": 3,
            "markers": [(0.10, 0.70), (0.55, 0.74), (0.80, 0.20)],
            "targets": [(0.20, 0.75), (0.45, 0.61), (0.66, 0.28)],
            "sections": [
                ("画面线索", "① 摩托保持可读的方向\n② 路面与光轨收向远方\n③ 漩涡占据主要视线终点"),
                ("驱动机制", "道路、城市与天空共同围绕远方焦点组织，红蓝对比强化运动方向。"),
                ("对我们的价值", "参考单一视觉终点与冷暖分区，后续再讨论城市如何进入奇幻状态。"),
            ],
        },
    ]
    for index, panel in enumerate(panels):
        y = 145 + index * 540
        draw.text((36, y), panel["title"], font=font(33, True), fill=ACCENT)
        reference = next(r for r in sources["references"] if r["id"] == panel["id"])
        frame = reference["frames"][panel["frame"]]
        picture = Image.open(ROOT / frame["path"]).convert("RGB").resize((824, 464), Image.Resampling.LANCZOS)
        canvas.paste(picture, (36, y + 50))
        for number, (mx, my) in enumerate(panel["markers"], 1):
            position = (36 + int(824 * mx), y + 50 + int(464 * my))
            tx, ty = panel["targets"][number - 1]
            target = (36 + int(824 * tx), y + 50 + int(464 * ty))
            draw.line((*position, *target), fill=ACCENT, width=2)
            numbered_marker(draw, position, number)
        text_y = y + 50
        for heading, content in panel["sections"]:
            text_y = write_wrapped(draw, heading, (900, text_y), 654, size=28, fill=ACCENT, bold=True, gap=8)
            text_y += 4
            text_y = write_wrapped(draw, content, (900, text_y), 654, size=27, fill=FG, gap=10)
            text_y += 16
    draw.text((36, 1775), "依据：三条原片每条 8 处抽帧。标注为分析解释；不能据此证明传播因果。", font=font(24), fill=MUTED)
    draw.text((36, 1813), "画面经 HLG → SDR 近似转换，不等同于原生 HDR 屏幕效果。来源：@hi_personality。", font=font(24), fill=MUTED)
    canvas.save(ROOT / "assets/effects-and-drivers.jpg", quality=95)


def source_library_value() -> None:
    canvas = Image.new("RGB", (1600, 850), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((36, 24), "这份原视频参考库，对海边城市有什么价值？", font=font(43, True), fill=FG)
    columns = [
        ("看得见的目标", "把“更震撼”落实成可对照的画面：主体多大、海岸怎样弯、地标在哪里。"),
        ("可拆开的变量", "分别记录空间、主体动作、镜头、光色与时长，避免一次改变所有东西。"),
        ("有边界的借鉴", "AI 画面可能不具备连续可玩的几何；HDR 依赖显示链路；素材许可尚未核实。"),
    ]
    for index, (heading, content) in enumerate(columns):
        x = 36 + index * 520
        draw.text((x, 142), str(index + 1), font=font(55, True), fill=ACCENT)
        yy = write_wrapped(draw, heading, (x, 220), 470, size=34, bold=True)
        write_wrapped(draw, content, (x, yy + 22), 466, size=30, gap=15)
    draw.line((36, 535, 1564, 535), fill="#3c4b57", width=2)
    write_wrapped(draw, "已核实的制作链路", (36, 566), 1500, size=31, fill=ACCENT, bold=True)
    write_wrapped(draw, "Midjourney → MiniMax（作者称 h3）/ ComfyUI → DaVinci Resolve 调色与后期 → HDR 发布", (36, 622), 1500, size=30)
    write_wrapped(draw, "作者原帖回复已核对；模型完整标识、工作流文件和参数仍未公开。下一步由我们沟通后决定。", (36, 740), 1500, size=26, fill=MUTED)
    canvas.save(ROOT / "assets/source-library-value.jpg", quality=95)


def main() -> None:
    sources = json.loads((ROOT / "sources.json").read_text(encoding="utf-8"))
    tone_map_frames(sources)
    temporal_contact_sheet(sources)
    effects_and_drivers(sources)
    source_library_value()
    print("Rendered 24 evidence frames, a temporal contact sheet, effects and drivers, and source library value")


if __name__ == "__main__":
    main()
