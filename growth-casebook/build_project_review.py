"""Maintain legacy review URLs as redirects to the single local product entry."""
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent
DESTINATION = ROOT.parent / "docs" / "018-growth-casebook"
ENTRY = "../021-growth-casebook/#/overview"


def atomic_write(path, content):
    temporary = path.with_name(path.name + ".tmp")
    with temporary.open("w", encoding="utf-8", newline="") as stream:
        stream.write(content)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temporary, path)


def main():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    page = f"""<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0;url={ENTRY}">
<link rel="canonical" href="{ENTRY}">
<title>正在进入产品研究台</title></head><body>
<p>产品研究回顾已迁移到统一的公开研究页，正在跳转。</p>
<p><a href="{ENTRY}">进入产品研究台</a></p>
</body></html>
"""
    atomic_write(DESTINATION / "index.html", page)
    atomic_write(DESTINATION / "project-review.md", "# 产品研究库已统一入口\n\n研究总结与案例快照已迁移到 [公开研究页](" + ENTRY + ")。后台采集在本地 8766 执行。\n")
    print("Legacy review now redirects to " + ENTRY)


if __name__ == "__main__":
    main()
