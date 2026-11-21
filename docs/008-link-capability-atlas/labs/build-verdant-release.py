import ast
import re
from pathlib import Path
from zipfile import ZipFile

from greenhouse_edit import FILM_SECONDS

LABS = Path(__file__).resolve().parent
CAMERA = LABS / "camera-media"
COLLAGE = LABS / "collage-media"


def vtt_time(seconds):
    hours, remainder = divmod(round(seconds * 1000), 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    whole_seconds, milliseconds = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{whole_seconds:02d}.{milliseconds:03d}"


def main():
    media = [CAMERA / name for name in ("film.mp4", "film.jpg", "film-vertical.mp4", "film-vertical.jpg")]
    media += [COLLAGE / "compare-ar.mp4", COLLAGE / "compare-br.mp4"]
    for path in media:
        if not path.is_file():
            raise SystemExit(f"Missing release media: {path}")

    source = (LABS / "workflow-cases.js").read_text(encoding="utf-8")
    match = re.search(r"greenhouse:\s*\{.*?cues:\s*\[(.*?)^\s*\],", source, re.S | re.M)
    if not match:
        raise SystemExit("Could not find the built-in greenhouse cues")
    cues = ast.literal_eval(f"[{match[1]}]")
    previous_end = 0
    for start, end, caption in cues:
        if not previous_end <= start < end <= FILM_SECONDS or not caption.strip():
            raise SystemExit(f"Invalid greenhouse caption: {start}, {end}")
        previous_end = end
    if not cues:
        raise SystemExit("The built-in greenhouse track is empty")

    blocks = [f"{vtt_time(start)} --> {vtt_time(end)}\n{caption}" for start, end, caption in cues]
    captions = CAMERA / "film.zh.vtt"
    captions.write_text("WEBVTT\n\n" + "\n\n".join(blocks) + "\n", encoding="utf-8", newline="\n")

    readme = """# VERDANT R04 温室巡检

- `film.mp4` 和 `film-vertical.mp4` 分别是 16:9 与 9:16 的 16 秒宣传片。两版在同一时间切换镜头，沿用同一条原创配乐。竖版使用五个原生竖屏镜头和单独排版的片头片尾。
- `film.zh.vtt` 为横竖两版共用的中文字幕，可与任意一版成片一起载入能力图鉴第 07 条字幕工作台。
- `film.jpg` 和 `film-vertical.jpg` 分别是横竖版封面。
- `compare-ar.mp4` 和 `compare-br.mp4` 是 11 秒竖屏对照片。两版共用旁白，在约第 3 至 8 秒分别使用三维巡检车跟拍和三步拼贴。

在支持外挂 WebVTT 的播放器中，可手动打开 `film.zh.vtt`。两支 11 秒口播对照片使用独立的时间线，字幕已合入视频。
"""
    release = CAMERA / "verdant-r04-release.zip"
    staging = release.with_suffix(".part")
    with ZipFile(staging, "w") as archive:
        for path in [*media, captions]:
            archive.write(path, path.name)
        archive.writestr("README.md", readme)
    staging.replace(release)


if __name__ == "__main__":
    main()
