"""Collect the three observed public HLS references and make evidence frames.

Only follows the exact playlists and segment URLs they declare. No credentials,
API tokens, private sources, or user browser state are read.
"""

from __future__ import annotations

import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
from urllib.parse import urljoin
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
FFMPEG = shutil.which("ffmpeg")
FFPROBE = shutil.which("ffprobe")
MANIFEST = json.loads((ROOT / "reference/media-manifest.json").read_text(encoding="utf-8"))


def get(url: str) -> bytes:
    if not url.startswith(("https://video.twimg.com/", "https://pbs.twimg.com/")):
        raise ValueError(f"Unexpected asset origin: {url}")
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=30) as response:
        return response.read()


def collect_track(url: str, directory: Path, kind: str) -> tuple[Path, dict]:
    text = get(url).decode("utf-8-sig")
    if not text.startswith("#EXTM3U") or "#EXTINF" not in text:
        raise ValueError("Expected a media playlist with full segments")
    (directory / f"{kind}-remote.m3u8").write_text(text, encoding="utf-8")
    map_match = re.search(r'#EXT-X-MAP:.*?URI="([^"]+)"', text)
    urls = []
    if map_match:
        urls.append(urljoin(url, map_match.group(1)))
    urls.extend(urljoin(url, line.strip()) for line in text.splitlines()
                if line.strip() and not line.startswith("#"))
    if len(urls) < 2:
        raise ValueError("Only an initialization fragment was found")
    merged = directory / f"{kind}-joined.mp4"
    parts = []
    with merged.open("wb") as handle:
        for index, segment_url in enumerate(urls):
            content = get(segment_url)
            handle.write(content)
            parts.append({"order": index, "url": segment_url, "bytes": len(content),
                          "sha256": hashlib.sha256(content).hexdigest()})
    return merged, {"playlist_url": url, "segments": parts}


def run(command: list[str]) -> str:
    result = subprocess.run(command, capture_output=True, text=True, check=True,
                            encoding="utf-8", errors="replace")
    return result.stdout


def collect(reference: dict) -> dict:
    directory = ASSETS / reference["id"]
    directory.mkdir(parents=True, exist_ok=True)
    tracks = {}
    video_path, tracks["video"] = collect_track(reference["video_playlist"], directory, "video")
    audio_path, tracks["audio"] = collect_track(reference["audio_playlist"], directory, "audio")
    master = get(reference["master_playlist"]).decode("utf-8-sig")
    (directory / "master-playlist.m3u8").write_text(master, encoding="utf-8")
    poster = get(reference["poster_url"])
    (directory / "original-poster.webp").write_bytes(poster)
    complete = directory / "reference.mp4"
    run([FFMPEG, "-y", "-v", "error", "-i", str(video_path), "-i", str(audio_path),
         "-map", "0:v:0", "-map", "1:a:0", "-c", "copy", "-movflags", "+faststart", str(complete)])
    probe = json.loads(run([FFPROBE, "-v", "error", "-show_streams", "-show_format",
                            "-of", "json", str(complete)]))
    video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
    duration = float(video.get("duration", probe["format"]["duration"]))
    if duration < 5 or duration > 15 or int(video["width"]) < 1000:
        raise ValueError("Unexpected duration or dimensions")
    (directory / "probe.json").write_text(json.dumps(probe, ensure_ascii=False, indent=2), encoding="utf-8")
    frames = []
    for value in [0.1, 1, 2, 3, 4, 5, 6, round(duration - 0.1, 3)]:
        timestamp = min(value, duration - 0.05)
        target = directory / f"frame-{timestamp:05.2f}.jpg"
        tone_map = ["-vf", "zscale=t=linear:npl=100,format=gbrpf32le,tonemap=tonemap=hable:desat=0,zscale=p=bt709:t=bt709:m=bt709:r=full,format=yuvj420p"] if video.get("color_transfer") in ("arib-std-b67", "smpte2084") else []
        run([FFMPEG, "-y", "-v", "error", "-ss", str(timestamp), "-i", str(complete),
             "-frames:v", "1", *tone_map, "-q:v", "2", str(target)])
        frames.append({"time_seconds": timestamp, "path": target.relative_to(ROOT).as_posix()})
    evidence = {**reference, "material_type": "original_video_downloaded_from_observed_public_hls",
                "duration_seconds": duration, "width": video["width"], "height": video["height"],
                "color_transfer": video.get("color_transfer"), "color_primaries": video.get("color_primaries"),
                "frame_rate": video.get("avg_frame_rate"), "frames": frames,
                "local_video": complete.relative_to(ROOT).as_posix(), "track_sources": tracks,
                "video_sha256": hashlib.sha256(complete.read_bytes()).hexdigest(),
                "audio_reviewed_by_listener": False,
                "preview_conversion": "HLG/PQ to BT.709 using FFmpeg zscale + Hable tone mapping; approximate SDR analysis preview, not an HDR reproduction"}
    (directory / "provenance.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2), encoding="utf-8")
    return evidence


def main() -> None:
    if not FFMPEG or not FFPROBE:
        raise RuntimeError("ffmpeg and ffprobe are required")
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        collected = list(pool.map(collect, MANIFEST["references"]))
    result = {"retrieved_on": MANIFEST["retrieved_on"], "references": collected,
              "author_statements": MANIFEST["author_statements"]}
    (ROOT / "sources.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps([{"id": r["id"], "duration": r["duration_seconds"], "frames": len(r["frames"]),
                       "color_transfer": r["color_transfer"], "video": r["local_video"]}
                      for r in collected], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
