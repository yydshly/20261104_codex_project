"""Package the existing study for GitHub Pages without generation or source edits.

First import: python publish.py --refresh-local --source-root <workspace>
Rebuild from a repository checkout: python publish.py
Large evidence files are served from the same public GitHub repository; primary
delivery videos, guide and screenshots are also included in the Pages directory.
"""
from pathlib import Path
import argparse
import base64
import hashlib
import html
import json
import mimetypes
import re
import shutil

PROJECT = Path(__file__).resolve().parent
REPO = PROJECT.parent.parent
META = json.loads((PROJECT / "publication.json").read_text(encoding="utf-8"))
SLUG = META["slug"]
SITE = META["site"]
RAW = f'https://raw.githubusercontent.com/{META["repository"]}/main/projects/{SLUG}/'
OUT = REPO / "docs" / SLUG
SOURCE = PROJECT / "source"
GUIDE_NAME = META["guide"]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, str):
        path.write_text(data, encoding="utf-8", newline="\n")
    else:
        path.write_bytes(data)


def refresh(workspace):
    hub = workspace / "blue-white-capability-hub"
    lab = workspace / "blue-white-relief-lab"
    tea = workspace / "tea-brand-launch"
    raw_data = (hub / "data.js").read_text(encoding="utf-8")
    data = json.loads(raw_data.removeprefix("window.HUB=").removesuffix(";\n"))
    guide = (hub / "exports/understanding-20261121/understanding-overview-20261121.png").read_bytes()
    assert digest(guide) == META["guideSha256"], "Use the existing unmodified guide"
    write(PROJECT / GUIDE_NAME, guide)
    paths = {}
    external = set()
    for item in data["resources"]:
        key = item["key"]
        prefix, relative = key.split(":", 1)
        if prefix == "lab" and relative.startswith("assets/original/"):
            paths[key] = META["source"]
            external.add(key)
        elif key in ["lab:overview.html", "lab:index.html"]:
            paths[key] = "research/index.html"
        elif key in ["tea:index.html", "tea:studio.html"]:
            paths[key] = "tea/" + relative
        else:
            target = "materials/" + prefix + "/" + relative
            if item["kind"] == "page":
                target += ".txt"
            paths[key] = RAW + target
    # Frequently viewed media stays on Pages. Evidence originals use repository raw.
    critical_keys = [
        "lab:assets/generated/landscape.webp", "lab:assets/generated/teapot.webp", "lab:assets/generated/lotus.webp",
        "lab:assets/ai-video/landscape-v2-exposure-matched.mp4", "lab:assets/ai-video/teapot-v2-exposure-matched.mp4",
        "tea:reports/desktop-home.png", "tea:reports/studio-desktop.png"
    ]
    for key in critical_keys:
        paths[key] = "media/" + key.split(":", 1)[1].replace("/", "__")
    absolute_map = {}
    for item in data["resources"]:
        path = Path(item["path"])
        target = paths[item["key"]]
        if not target.startswith("https:"):
            target = SITE + target
        for form in [str(path), path.as_posix(), path.as_uri()]:
            absolute_map[form] = target

    def clean_text(text):
        for old, new in sorted(absolute_map.items(), key=lambda pair: -len(pair[0])):
            text = text.replace(old, new)
        text = re.sub(r"[A-Za-z]:[\\/][^\s\"'<>)]*", "[本机路径已省略]", text)
        return text

    def clean(value):
        if isinstance(value, dict):
            return {key: clean(child) for key, child in value.items() if key not in ["path", "private_attempt", "completed_download_file", "output_directory"]}
        if isinstance(value, list):
            return [clean(child) for child in value]
        return clean_text(value) if isinstance(value, str) else value

    old_hrefs = {item["href"]: paths[item["key"]] for item in data["resources"]}
    published = []
    for original in data["resources"]:
        item = clean(original)
        item["href"] = paths[original["key"]]
        item["original_sha256"] = original["sha256"]
        if original["key"] in external:
            item.update(kind="external", status="来源链接 · 原帖媒体保留在本地", title=original["title"] + "（访问作者原帖）")
            item.pop("content", None)
        elif original["key"] in ["lab:overview.html", "lab:index.html", "tea:index.html", "tea:studio.html"]:
            item["status"] = "可打开成品 · 公开适配版"
        else:
            relative = "materials/" + original["key"].replace(":", "/", 1)
            if original["kind"] == "page":
                relative += ".txt"
                item["kind"] = "text"
                item["status"] = "维护源码快照（非独立运行入口）"
            payload = Path(original["path"]).read_bytes()
            if original["kind"] == "text" or original["kind"] == "page":
                text = payload.decode("utf-8-sig")
                if original["extension"] == "json":
                    text = json.dumps(clean(json.loads(text)), ensure_ascii=False, indent=2)
                else:
                    text = clean_text(text)
                payload = text.encode("utf-8")
                item["content"] = text
            write(PROJECT / relative, payload)
            if original["key"] in critical_keys:
                write(OUT / paths[original["key"]], payload)
            item["bytes"] = len(payload)
            item["sha256"] = digest(payload)
        published.append(item)

    data = clean(data)
    data["resources"] = published
    def remap(value):
        if isinstance(value, dict): return {key: remap(child) for key, child in value.items()}
        if isinstance(value, list): return [remap(child) for child in value]
        return old_hrefs.get(value, value) if isinstance(value, str) else value
    data = remap(data)
    # Main media fields use generated static previews and existing corrected video.
    for delivery in data["deliveries"]:
        delivery["video"] = paths[f'lab:assets/ai-video/{delivery["name"]}-v2-exposure-matched.mp4']
        delivery["poster"] = paths[f'lab:assets/generated/{delivery["name"]}.webp']
    for still in data["stills"]:
        subject = {"山水": "landscape", "茶器": "teapot", "莲花": "lotus"}[still["title"]]
        still["image"] = paths[f"lab:assets/generated/{subject}.webp"]
    for trial in data["trials"]:
        subject = "landscape" if trial["subject"] == "山水" else "teapot"
        trial["video"] = paths[f'lab:assets/ai-video/{subject}-v{trial["round"]}.mp4']
        trial["poster"] = paths[f"lab:assets/generated/{subject}.webp"]
    data["entries"][0].update(title="详细研究与素材对照", subtitle="作者出处、风格理解、三题材静帧、程序预演、五段AI原片与本地交付。原帖媒体请到来源查看。", image=GUIDE_NAME)
    data["entries"][1]["image"] = paths["tea:reports/desktop-home.png"]
    data["entries"][2]["image"] = paths["tea:reports/studio-desktop.png"]
    data["meta"].update(updated=META["date"] + " · 公开整理", publicationDate=META["date"], evidenceCutoff="2026-11-15")
    data["source"]["poster"] = ""
    data["understanding"] = {key: META[key] for key in ["title", "summary", "direction", "implementation", "value", "extension"]}
    guide_entry = {"id": "guide20261121", "key": "hub:research-understanding-20261121.png", "title": "已有研究理解总览图 · 原样复用", "href": GUIDE_NAME, "kind": "image", "category": "web", "status": "既有引导图", "extension": "png", "bytes": len(guide), "sha256": META["guideSha256"]}
    data["resources"].append(guide_entry)
    data["guideRef"] = guide_entry["id"]
    write(SOURCE / "public-data.json", json.dumps(data, ensure_ascii=False, indent=2))
    for name in ["page.html", "styles.css", "app.js"]:
        write(SOURCE / "hub" / name, (hub / name).read_text(encoding="utf-8"))
    for name in ["page.html", "styles.css", "app.js", "template-core.js", "brand-render.js", "brand-data.js", "brand.config.json", "studio-page.html", "studio.css", "studio.js", "build.py"]:
        write(SOURCE / "tea" / name, clean_text((tea / name).read_text(encoding="utf-8")))
    write(SOURCE / "tea/presets/songjian.json", (tea / "presets/songjian.json").read_bytes())
    write(OUT / "tea/studio.html", (tea / "studio.html").read_bytes())
    # Public visitor page is light and shares Pages-hosted existing images/videos.
    shared = {
        "assets/teapot.webp": "../" + paths["lab:assets/generated/teapot.webp"],
        "assets/landscape.webp": "../" + paths["lab:assets/generated/landscape.webp"],
        "assets/teapot-motion.mp4": "../" + paths["lab:assets/ai-video/teapot-v2-exposure-matched.mp4"],
        "assets/landscape-motion.mp4": "../" + paths["lab:assets/ai-video/landscape-v2-exposure-matched.mp4"]
    }
    visitor = (tea / "page.html").read_text(encoding="utf-8")
    for alias, url in shared.items():
        visitor = visitor.replace('="' + alias + '"', '="' + url + '"')
    write(OUT / "tea/index.html", visitor)
    for name in ["styles.css", "app.js", "template-core.js", "brand-render.js"]:
        write(OUT / "tea" / name, (tea / name).read_bytes())
    defaults = json.loads((tea / "brand.config.json").read_text(encoding="utf-8"))
    write(OUT / "tea/brand-data.js", "window.BRAND_DEFAULTS=" + safe_json(defaults) + ";window.BRAND_ASSETS=" + safe_json(shared) + ";\n")


def render_archive(data):
    by_id = {item["id"]: item for item in data["resources"]}
    def absolute(value): return value if value.startswith("https:") else "../" + value
    e = html.escape
    parts = ['<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>青白造境 · 详细研究与素材对照</title><style>body{max-width:1200px;margin:auto;padding:30px 24px;font:14px/1.9 "Microsoft YaHei",sans-serif;color:#203e55;background:#f4f1e9}a{color:#2b5b84}h1,h2{font-family:"SimSun",serif;font-weight:400}h1{font-size:34px}h2{margin-top:42px;font-size:28px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.stills{grid-template-columns:repeat(3,minmax(0,1fr))}article{border:1px solid #d5dedb;padding:18px;background:#faf8f3}img{max-width:100%;height:290px;object-fit:contain;display:block;margin:auto}video{width:100%;height:310px;object-fit:contain;background:#ece8e0}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.8}details{margin-top:15px}summary{cursor:pointer}.note{background:#e8ece5;padding:17px;border-left:3px solid #668278}@media(max-width:650px){.grid,.stills{grid-template-columns:1fr}h1{font-size:27px}video{height:280px}}</style></head><body><a href="../">← 回到统一研究入口</a><h1>青白造境 · 详细研究与素材对照</h1><p>' + e(META["summary"]) + '</p><p class="note">公开版保留作者出处与文字观察；原帖封面、配色图和视频不随公开包分发，本地归档保持不变。<a target="_blank" rel="noopener noreferrer" href="' + e(META["source"]) + '">访问 Zidan 子丹原帖 ↗</a></p><p>作者标注静图使用 Gemini、视频使用 Grok Imagine，具体版本与原始提示词未知。我们的静帧是文字生成，没有将原作图像传入模型；三支程序预演不计作AI视频。</p><h2>三题材静帧与程序预演</h2><div class="grid stills">']
    for still in data["stills"]:
        movie = by_id[still["motionRef"]]
        parts.append('<article><h3>' + e(still["title"]) + '</h3><img src="' + e(absolute(still["image"])) + '" alt="' + e(still["title"]) + '实际生成静帧"><p>每题材一个样本，不证明稳定迁移。</p><video controls muted playsinline preload="none" src="' + e(absolute(movie["href"])) + '"></video><p>上方为程序合成微动，非AI视频。</p></article>')
    parts.append('</div><h2>三轮五段AI原片</h2><p>原片均保留音轨与曝光问题，播放默认静音。第三轮仅执行茶器，山水没有提交；准确参数和验片记录可从统一入口检索。</p><div class="grid">')
    for trial in data["trials"]:
        prompt = by_id[trial["promptRef"]]
        parts.append('<article><h3>' + e(trial["subject"]) + ' · 第' + str(trial["round"]) + '轮 · ' + str(trial["cost"]) + '积分</h3><video controls muted playsinline preload="none" poster="' + e(absolute(trial["poster"])) + '" src="' + e(absolute(trial["video"])) + '"></video><p><strong>' + e(trial["verdict"]) + '</strong></p><p>' + e(trial["summary"]) + '</p><details><summary>准确实传指令</summary><pre>' + e(prompt.get("content", "")) + '</pre></details></article>')
    parts.append('</div><h2>当前交付与校正前后</h2><p>本地后处理独立记录。两段约5.04秒、121帧、24fps，移除音轨；它们不让原生曝光或声音门槛变为通过。</p><div class="grid">')
    for delivery in data["deliveries"]:
        compare = by_id[delivery["comparisonRef"]]
        parts.append('<article><h3>' + e(delivery["subject"]) + ' · 交付版</h3><video controls muted playsinline preload="metadata" poster="' + e(absolute(delivery["poster"])) + '" src="' + e(absolute(delivery["video"])) + '"></video><p>' + e(delivery["summary"]) + '</p><details><summary>观看同时间并排对照（左原片，右校正）</summary><video controls muted playsinline preload="none" src="' + e(absolute(compare["href"])) + '"></video></details></article>')
    parts.append('</div><h2>范围与价值</h2><p>' + e(META["value"]) + '</p><p>' + e(META["extension"]) + '</p><p class="note">没有真实商品、客户投放或收入验证；没有稳定批量、无缝循环或三维运镜结论。静帧未提供积分记录，已知AI视频实际累计375积分。</p><a href="../#capabilities">回查能力与证据 →</a></body></html>')
    return "".join(parts)


def build():
    data = json.loads((SOURCE / "public-data.json").read_text(encoding="utf-8"))
    guide = (PROJECT / GUIDE_NAME).read_bytes()
    assert digest(guide) == META["guideSha256"]
    write(OUT / GUIDE_NAME, guide)
    page = (SOURCE / "hub/page.html").read_text(encoding="utf-8")
    css = (SOURCE / "hub/styles.css").read_text(encoding="utf-8")
    app = (SOURCE / "hub/app.js").read_text(encoding="utf-8")
    page = page.replace('<title>青白造境｜研究与能力总览</title>', '<title>' + html.escape(META["title"]) + '</title>')
    page = re.sub(r'<meta name="description" content="[^"]+">', '<meta name="description" content="' + html.escape(META["summary"], quote=True) + '">', page)
    page = page.replace('</head>', '<link rel="canonical" href="' + SITE + '"><meta property="og:title" content="' + html.escape(META["title"], quote=True) + '"><meta property="og:description" content="' + html.escape(META["summary"], quote=True) + '"><meta property="og:image" content="' + SITE + GUIDE_NAME + '"><meta name="twitter:card" content="summary_large_image"></head>')
    briefing = '<div class="research-brief">' + ''.join('<article><h3>' + heading + '</h3><p>' + html.escape(META[key]) + '</p></article>' for heading, key in [('我们研究的方向', 'direction'), ('做成了什么与实际效果', 'implementation'), ('对我们的价值', 'value')]) + '</div>'
    guide_html = '<figure class="guide-figure" id="guide-image"><button type="button" data-record="guide20261121" aria-label="放大已有研究引导图"><img src="' + GUIDE_NAME + '" width="2800" height="2366" alt="已有研究总览图：现有效果、交付、风格理解、现实扩展与价值，区分已有能力与待验证方向"></button><figcaption>沿用2026-11-21生成的原图，未重画。图内146条为此前本地快照；当前公开资料数量以索引为准。<a href="' + GUIDE_NAME + '" target="_blank" rel="noopener noreferrer">查看原图 ↗</a></figcaption></figure>'
    page = page.replace('<div class="conclusion">', briefing + guide_html + '<div class="conclusion">', 1)
    page = page.replace('<img id="source-poster" alt="原帖的青花山水视频封面" loading="lazy">', '<div class="source-reference"><span>原作出处</span><strong>Zidan 子丹</strong><p>青花山水与动态参考<br>点击查看作者原帖</p></div>')
    page = page.replace('播放归档原作 <span>▶</span>', '查看作者原帖 <span>↗</span>')
    page = page.replace('看作者配色图 ↗', '配色图来源与本地观察 ↗')
    page = page.replace('归档视频由公开 HLS 流复制封装，保留原画面。', '本地归档视频由公开 HLS 流复制封装，保留原画面；原帖媒体不随公开包分发。')
    page = page.replace('旧截图的验证范围以对应记录为准。档案正文为构建时原文快照，可另开原文件。', '旧截图的验证范围以对应记录为准。正文发布时转换本机路径并省略私有运行信息，可另开对应公开文件。')
    page = page.replace('本页未修改原片、原有项目或能力结论，未新增生成任务。相关媒体与页面保留在原子项目；移动入口时请保留相邻目录结构。', '本页未重绘引导图或新增生成任务。公开版提供本研究自制素材、指令、验证摘要、展示与模板；原帖媒体与私有任务日志留在本地。')
    app = app.replace("$('source-poster').src = H.source.poster;", "if ($('source-poster')) $('source-poster').src = H.source.poster;")
    marker = "if (record.kind === 'page') {"
    replacement = "if (record.kind === 'external') { const note=document.createElement('p');note.style.padding='24px';note.style.lineHeight='2';note.textContent='原帖图像与视频保留在本地归档，不随公开包分发。请使用下方来源链接查看作者原作；本研究的文字观察和自制试作可继续在本页查看。';viewerBody.append(note); } else if (record.kind === 'page') {"
    app = app.replace(marker, replacement, 1)
    css += '\n.research-brief{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:20px 0}.research-brief article{border-left:2px solid #9db3ac;padding:3px 15px}.research-brief h3{font-size:14px;font-weight:500;margin-bottom:8px}.research-brief p{font-size:12px;line-height:2;color:#637985}.guide-figure{margin:24px 0;background:#faf8f2;border:1px solid #d8e0da;padding:16px}.guide-figure>button{display:block;width:100%;padding:0}.guide-figure img{display:block;max-height:470px;object-fit:contain;width:100%}.guide-figure figcaption{font-size:10px;line-height:1.9;color:#82918e;margin-top:13px}.guide-figure a{color:#285b80}.source-reference{height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#657f8a;background:#e5ebe5;text-align:center}.source-reference>span{font-size:11px;letter-spacing:.2em}.source-reference strong{font-family:SimSun,serif;font-size:30px;font-weight:400;margin:20px 0}.source-reference p{font-size:12px;line-height:2}@media(max-width:650px){.research-brief{grid-template-columns:1fr;gap:15px}.research-brief p{font-size:12px}.guide-figure{padding:10px}.guide-figure img{max-height:none}.guide-figure figcaption{font-size:9px}}\n'
    write(OUT / "styles.css", css)
    write(OUT / "app.js", app)
    write(OUT / "data.js", "window.HUB=" + safe_json(data) + ";\n")
    write(OUT / "index.html", page)
    write(OUT / "research/index.html", render_archive(data))
    write(OUT / "README.md", (PROJECT / "README.md").read_text(encoding="utf-8"))
    write(OUT / "PUBLICATION.md", (PROJECT / "PUBLICATION.md").read_text(encoding="utf-8"))
    files = []
    for path in sorted(OUT.rglob("*")):
        if path.is_file() and path.name != "publication-manifest.json":
            payload = path.read_bytes()
            files.append({"path": path.relative_to(OUT).as_posix(), "bytes": len(payload), "sha256": digest(payload)})
    manifest = {"date": META["date"], "site": SITE, "guide": {"path": GUIDE_NAME, "sha256": digest(guide), "originalUnchanged": True}, "evidenceResources": len(data["resources"]), "knownVideoCredits": 375, "newGenerationCredits": 0, "sourceMediaDistribution": "author-post links only; original post images/video remain local", "files": files}
    write(OUT / "publication-manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2))
    print(json.dumps({"site": SITE, "pagesFiles": len(files), "pagesMB": round(sum(x["bytes"] for x in files) / 1024 / 1024, 2), "evidenceResources": len(data["resources"]), "guideUnchanged": True}, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh-local", action="store_true")
    parser.add_argument("--source-root", type=Path)
    args = parser.parse_args()
    if args.refresh_local:
        if not args.source_root:
            parser.error("--refresh-local requires --source-root")
        refresh(args.source_root.resolve())
    build()
