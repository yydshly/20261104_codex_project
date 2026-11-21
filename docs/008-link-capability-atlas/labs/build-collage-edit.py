"""Build the case 01 edits, the split-screen master and the subtitle handoff."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile
import wave

from PIL import Image, ImageDraw, ImageFont


LABS = Path(__file__).resolve().parent
SOURCE = LABS / "camera-media"
COLLAGE = LABS / "collage-media"
FPS = 24
WIDTH, HEIGHT = 720, 1280
SIZE = (WIDTH, HEIGHT)
RATE = 48000
DURATION = 11
START, END = 3, 8
CAPTIONS = (
    (.15, 2.85, "巡检发现异常，接下来怎么处理？"),
    (3.30, 4.55, "先找出问题。"),
    (4.66, 6.10, "再拆成三步。"),
    (6.26, 7.80, "逐项完成。"),
    (8.12, 10.86, "留下现场记录，再复核处理结果。"),
)
INK = "#f8f7e9"
ACCENT = "#e1ebac"
FONT_DIR = Path(os.environ["WINDIR"]) / "Fonts"


def font(name, size, index=0):
    return ImageFont.truetype(str(FONT_DIR / name), size=size, index=index)


def ffmpeg(*args, capture=False):
    return subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, args)],
        stdout=subprocess.PIPE if capture else None, check=True,
    ).stdout


def pcm(input_file, filters=()):
    return ffmpeg(
        "-i", input_file, "-vn", *filters, "-ar", RATE, "-ac", 1, "-f", "s16le", "pipe:1", capture=True,
    )


def make_voice(directory):
    script = r"""
    $ErrorActionPreference = 'Stop'
    Add-Type -AssemblyName System.Speech
    $synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
    $synth.SelectVoice('Microsoft Huihui Desktop')
    $synth.Rate = 1
    try {
      $lines = ConvertFrom-Json $env:ATLAS_EDIT_LINES
      for ($i = 0; $i -lt $lines.Count; $i++) {
        $synth.SetOutputToWaveFile((Join-Path (Get-Location).Path "voice-$i.wav"))
        $synth.Speak([string]$lines[$i])
        $synth.SetOutputToNull()
      }
    } finally { $synth.Dispose() }
    """
    text = [CAPTIONS[0][2], CAPTIONS[-1][2]]
    subprocess.run(
        ["powershell.exe", "-NoProfile", "-Command", script], cwd=directory, check=True,
        env={**os.environ, "ATLAS_EDIT_LINES": json.dumps(text, ensure_ascii=False)},
    )
    sample_bytes = 2
    sound = bytearray(RATE * DURATION * sample_bytes)
    middle = pcm(COLLAGE / "collage-narrated.mp4")[:5 * RATE * sample_bytes]
    index = round(START * RATE) * sample_bytes
    sound[index:index + len(middle)] = middle
    for index, (start, end, _) in enumerate((CAPTIONS[0], CAPTIONS[-1])):
        path = directory / f"voice-{index}.wav"
        clip = pcm(path)
        window = end - start
        actual = len(clip) / (RATE * sample_bytes)
        if actual > window:
            ratio = actual / (window - .05)
            clip = pcm(path, ("-af", f"atempo={ratio:.5f}"))
        if len(clip) < RATE or len(clip) > round(window * RATE) * sample_bytes:
            raise RuntimeError(f"Narration cue {index + 1} did not fit")
        position = round(start * RATE) * sample_bytes
        sound[position:position + len(clip)] = clip
    voice = directory / "voice.wav"
    with wave.open(str(voice), "wb") as wav:
        wav.setparams((1, sample_bytes, RATE, 0, "NONE", "not compressed"))
        wav.writeframes(sound)
    audio = directory / "voice.m4a"
    ffmpeg("-i", voice, "-c:a", "aac", "-b:a", "128k", audio)
    return audio


def stage_graphics(stage):
    card = Image.new("RGBA", SIZE)
    draw = ImageDraw.Draw(card)
    for y in range(265):
        shade = round(152 * (1 - y / 265) ** 2)
        draw.line((0, y, WIDTH, y), (8, 16, 25, shade))
    for y in range(300):
        shade = round(192 * (1 - y / 300) ** 1.7)
        draw.line((0, HEIGHT - y, WIDTH, HEIGHT - y), (8, 16, 25, shade))
    mono = font("bahnschrift.ttf", 24)
    label = font("msyh.ttc", 25)
    title = font("msyhbd.ttc", 63)
    draw.rounded_rectangle((47, 68, 83, 73), radius=2, fill=ACCENT)
    draw.text((47, 86), "VERDANT / FIELD NOTES", font=mono, fill=INK)
    draw.text((672, 87), "01", font=mono, fill=ACCENT, anchor="ra")
    if stage == "open":
        draw.text((46, 163), "把巡检异常", font=title, fill=INK)
        draw.text((46, 243), "拆成三步", font=title, fill=ACCENT)
    elif stage == "middle":
        draw.text((47, 155), "处理步骤", font=label, fill=ACCENT)
    else:
        draw.text((47, 155), "留证与复核", font=label, fill=ACCENT)
    return card


def caption_graphic(text):
    layer = Image.new("RGBA", SIZE)
    draw = ImageDraw.Draw(layer)
    face = font("msyhbd.ttc", 32)
    width = draw.textlength(text, font=face)
    x, y = WIDTH / 2, 1084
    draw.rounded_rectangle((x - width / 2 - 22, y - 16, x + width / 2 + 22, y + 48), radius=12, fill=(11, 20, 22, 221))
    draw.text((x, y), text, font=face, fill=INK, anchor="mt")
    return layer


def video_frames(path, count, start=0, speed=1):
    filters = f"setpts={1 / speed:.5f}*PTS,fps={FPS},scale={WIDTH}:{HEIGHT},tpad=stop_mode=clone:stop_duration=0.25"
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", str(start), "-i", str(path),
        "-an", "-vf", filters, "-frames:v", str(count), "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1",
    ]
    with subprocess.Popen(command, stdout=subprocess.PIPE) as decoder:
        for _ in range(count):
            raw = decoder.stdout.read(WIDTH * HEIGHT * 3)
            if len(raw) != WIDTH * HEIGHT * 3:
                raise RuntimeError(f"Missing source frames: {path}")
            yield Image.frombytes("RGB", SIZE, raw)
        decoder.stdout.close()
        if decoder.wait():
            raise RuntimeError(f"Could not decode: {path}")


def framed_collage(image):
    canvas = Image.new("RGB", SIZE, "#131b29")
    panel = image.crop((0, 145, WIDTH, 1105)).resize((620, 827), Image.Resampling.LANCZOS)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((48, 205, 672, 1038), radius=8, fill="#7684a2")
    canvas.paste(panel, (50, 208))
    return canvas


def render_version(version, audio, output, *, clean=False):
    stage_layers = {name: stage_graphics(name) for name in ("open", "middle", "close")}
    caption_layers = [] if clean else [(start, end, caption_graphic(text)) for start, end, text in CAPTIONS]
    name = f"compare-{version}" + ("-clean" if clean else "")
    front = video_frames(SOURCE / "fly-vertical.mp4", START * FPS, start=.55)
    if version == "br":
        middle = map(framed_collage, video_frames(COLLAGE / "collage-clean.mp4", (END - START) * FPS))
    else:
        middle = video_frames(SOURCE / "track-vertical.mp4", (END - START) * FPS, speed=.8)
    end = video_frames(SOURCE / "time-vertical.mp4", (DURATION - END) * FPS, start=.40)
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-video_size", f"{WIDTH}x{HEIGHT}", "-framerate", str(FPS), "-i", "-", "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", str(output / f"{name}.mp4"),
    ]
    frame = 0
    with subprocess.Popen(command, stdin=subprocess.PIPE) as encode:
        for stage, source in zip(stage_layers, (front, middle, end)):
            for picture in source:
                time = frame / FPS
                picture.paste(stage_layers[stage], mask=stage_layers[stage].getchannel("A"))
                for start, finish, caption in caption_layers:
                    if start <= time < finish:
                        picture.paste(caption, mask=caption.getchannel("A"))
                        break
                encode.stdin.write(picture.tobytes())
                if frame == 145:
                    picture.save(output / f"{name}.jpg", quality=90, optimize=True)
                frame += 1
        encode.stdin.close()
        if encode.wait() or frame != DURATION * FPS:
            raise RuntimeError(f"Could not encode the {version} edit")


def split_screen(output, directory):
    width, height = 1440, 1080
    panel_w, panel_h = 504, 896
    x_a, x_b, top = 196, 740, 112
    board = Image.new("RGB", (width, height), "#132521")
    draw = ImageDraw.Draw(board)
    title = font("msyhbd.ttc", 36)
    label = font("msyh.ttc", 23)
    mono = font("bahnschrift.ttf", 20)
    draw.text((x_a, 15), "VERDANT / FIELD NOTES 01", font=mono, fill=ACCENT)
    draw.text((x_a - 2, 37), "同一句旁白，两种剪法", font=title, fill=INK)
    draw.text((x_b + panel_w, 58), "03.00–08.00 秒 · 对照段", font=label, fill="#b9cbbe", anchor="rm")
    for x, title in ((x_a, "A  巡检车主画面"), (x_b, "B  插入拼贴配画")):
        draw.rectangle((x - 1, 83, x + panel_w, top + panel_h), outline="#597567", fill="#233934")
        draw.text((x + 10, 98), title, font=label, fill=INK, anchor="lm")
    timeline_y = 1025
    span = x_b + panel_w - x_a
    draw.line((x_a, timeline_y, x_a + span, timeline_y), fill="#799184", width=2)
    draw.line((x_a + span * START / DURATION, timeline_y, x_a + span * END / DURATION, timeline_y), fill=ACCENT, width=4)
    for time, text in ((0, "0.00"), (START, "3.00"), (END, "8.00"), (DURATION, "11.00")):
        x = x_a + span * time / DURATION
        draw.line((x, timeline_y - 4, x, timeline_y + 5), fill=INK)
        draw.text((x, 1035), text, font=mono, fill="#b9cbbe", anchor="mt")
    background = directory / "split-board.png"
    board.save(background)
    staged = output / "compare-ab.rendering.mp4"
    filters = (
        f"[0:v]scale={panel_w}:{panel_h}[a];[1:v]scale={panel_w}:{panel_h}[b];"
        f"[2:v][a]overlay={x_a}:{top}:shortest=1[left];[left][b]overlay={x_b}:{top}:shortest=1[v]"
    )
    ffmpeg(
        "-filter_complex_threads", "1", "-i", output / "compare-ar.mp4", "-i", output / "compare-br.mp4",
        "-loop", "1", "-framerate", FPS, "-i", background, "-filter_complex", filters,
        "-map", "[v]", "-map", "0:a:0", "-t", DURATION, "-c:v", "libx264", "-preset", "fast", "-crf", "17",
        "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", staged,
    )
    ffmpeg("-i", staged, "-vf", r"select=eq(n\,145)", "-frames:v", 1, "-q:v", 2, output / "compare-ab.jpg")
    staged.replace(output / "compare-ab.mp4")


def write_caption_sources(output):
    def timestamp(seconds):
        whole, milliseconds = divmod(round(seconds * 1000), 1000)
        return f"00:00:{whole:02d}.{milliseconds:03d}"

    cues = [f"{timestamp(start)} --> {timestamp(end)}\n{line}" for start, end, line in CAPTIONS]
    (output / "compare.zh.vtt").write_text("WEBVTT\n\n" + "\n\n".join(cues) + "\n", encoding="utf-8", newline="\n")
    config = {"duration": DURATION, "cues": CAPTIONS}
    script = f"window.atlasCollageCaption = {json.dumps(config, ensure_ascii=False)};\n"
    (output / "edit-captions.js").write_text(script, encoding="utf-8", newline="\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=COLLAGE)
    parser.add_argument("--delivery-only", action="store_true", help="Reuse the existing two narrated edits")
    args = parser.parse_args()
    args.output.mkdir(exist_ok=True, parents=True)
    with tempfile.TemporaryDirectory(prefix="atlas-collage-edit-") as temporary:
        directory = Path(temporary)
        if not args.delivery_only:
            audio = make_voice(directory)
            for version in ("ar", "br"):
                render_version(version, audio, args.output)
        narrated = args.output / "compare-br.mp4"
        split_screen(args.output, directory)
        render_version("br", narrated, args.output, clean=True)
        ffmpeg("-i", narrated, "-map", "0:a:0", "-c:a", "copy", "-movflags", "+faststart", args.output / "compare-voice.m4a")
        write_caption_sources(args.output)


if __name__ == "__main__":
    main()
