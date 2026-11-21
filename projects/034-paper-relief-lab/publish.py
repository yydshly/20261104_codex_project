"""Copy the public pages and their runtime dependencies from a local study checkout."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
from urllib.parse import unquote, urlsplit


DESTINATION = Path(__file__).resolve().parents[2] / "docs/034-paper-relief-lab"
PUBLIC_URL = "https://yydshly.github.io/20261104_codex_project/034-paper-relief-lab/"
JIANQUAN_URL = "https://yydshly.github.io/20261104_codex_project/005-jianquan-cognition/"
REFERENCE = Path("assets/reference-720p.mp4")
ENTRIES = """
index.html research-summary.html research.html
stage.html tea.html picking.html minnong.html minnong-gif.html gif-design.html
story.html studio.html directions.html
stories/catalog.json stories/autumn.json stories/jianquan.json
showcase/directions.json showcase/direction-details.json
assets/directions/media.json assets/directions/picking/media.json picking/motion.json
stories/minnong-story/story.json stories/minnong-story/narration.json
docs/source.json docs/research-summary.md docs/research.md
deliverables/minnong-review/index.html
deliverables/minnong-review/LICENSE-gifuct-js.txt
deliverables/minnong-review/LICENSE-js-binary-schema-parser.txt
vendor/gifuct/LICENSE-gifuct-js.txt vendor/gifuct/LICENSE-js-binary-schema-parser.txt
""".split()

PATH = re.compile(
    r"""['"]([^'"\s<>]+\.(?:html?|css|m?js|json|md|png|jpe?g|gif|svg|webp|mp[34]|vtt|webm|txt)(?:[?#][^'"<>\s]*)?)['"]""",
    re.IGNORECASE,
)
SKIP_SCAN = {Path("deliverables/minnong-review/index.html"), Path("docs/source.json")}


def dependencies(source, relative):
    # Markdown notes can refer to historical working files. Collect the
    # dependencies of the runnable pages and configuration, not the archive.
    if relative in SKIP_SCAN or relative.suffix not in {".html", ".js", ".css", ".json"}:
        return
    text = (source / relative).read_text(encoding="utf-8-sig")
    for match in PATH.finditer(text):
        parts = urlsplit(match[1])
        if parts.scheme or parts.netloc or parts.path.startswith("/"):
            continue
        path = Path(unquote(parts.path))
        for base in (relative.parent, Path(".")):
            candidate = (source / base / path).resolve()
            if candidate.is_relative_to(source) and candidate.is_file():
                dependency = candidate.relative_to(source)
                if dependency.parts[0] != "feedback":
                    yield dependency
                break


def select_files(source):
    files = set()
    pending = [Path(entry) for entry in ENTRIES]
    while pending:
        file = pending.pop()
        if file in files or file == REFERENCE:
            continue
        if not (source / file).is_file():
            raise FileNotFoundError(file)
        files.add(file)
        pending.extend(dependencies(source, file))
    return sorted(files)


def copy_public_release(source):
    source_info = json.loads((source / "docs/source.json").read_text(encoding="utf-8"))
    video_url = source_info["retained_media"]["url"]
    files = select_files(source)
    for relative in files:
        original = source / relative
        published = DESTINATION / relative
        published.parent.mkdir(parents=True, exist_ok=True)
        if relative in {Path("research-summary.html"), Path("research.html")}:
            page = original.read_text(encoding="utf-8-sig")
            page = page.replace(str(REFERENCE.as_posix()), video_url)
            page = page.replace("ReflectFlow", "日常复盘工具")
            page = page.replace(
                "研究页和程序演示可以离线使用。<br>作者素材仅作本地研究引用，未获商业复用许可。",
                "原作录屏从作者帖文的媒体地址加载。<br>来源与开源许可见研究记录。",
            )
            published.write_text(page, encoding="utf-8")
        elif relative == Path("docs/minnong-validation.md"):
            note = original.read_text(encoding="utf-8-sig")
            note = re.sub(
                r"- \[离线试看包\].*\n- \[当前电脑预览\].*",
                "- [打开在线试看页](../deliverables/minnong-review/index.html)。使用缓存的旁白、四幕 GIF 和画稿，支持手动保存反馈。",
                note,
            )
            published.write_text(note, encoding="utf-8")
        elif relative.suffix == ".md":
            note = original.read_text(encoding="utf-8-sig")
            note = note.replace("ReflectFlow", "日常复盘工具")
            note = note.replace("http://127.0.0.1:5218/", PUBLIC_URL)
            published.write_text(note, encoding="utf-8")
        elif relative == Path("stories/jianquan.json"):
            story = original.read_text(encoding="utf-8-sig")
            published.write_text(story.replace("http://127.0.0.1:4173/", JIANQUAN_URL), encoding="utf-8")
        elif relative.name.startswith("LICENSE-") and relative.suffix == ".txt":
            notice = original.read_text(encoding="utf-8")
            published.write_text(notice.rstrip() + "\n", encoding="utf-8")
        else:
            shutil.copyfile(original, published)

    # Serve the full research page directly at the project's share URL.
    (DESTINATION / "index.html").write_bytes((DESTINATION / "research-summary.html").read_bytes())
    guide = DESTINATION / "summary/research-map.png"
    manifest = {
        "entry": PUBLIC_URL,
        "file_count": len(files),
        "bytes": sum((DESTINATION / p).stat().st_size for p in files),
        "guide": "summary/research-map.png",
        "guide_sha256": hashlib.sha256(guide.read_bytes()).hexdigest(),
        "reference_recording": video_url,
        "feedback": "manual JSON export; no upload",
    }
    (DESTINATION / "publication.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(manifest, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Path to the local paper-relief-lab project")
    copy_public_release(parser.parse_args().source.resolve(strict=True))
