"""Publish the research UI to Pages and immutable original media outside /docs."""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import shutil
from pathlib import Path
from urllib.parse import parse_qsl, urlsplit, urlunsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SLUG = "024-immersive-loop-research"
TAG = "research-024-20261121"
ASSET_BASE = f"https://raw.githubusercontent.com/yydshly/20261104_codex_project/{TAG}/projects/{SLUG}/"
EXCLUDED = {
    "forest-video-login-v18.png": "Historical account/login screenshot; not necessary for the research.",
    "forest-bird-test-job-v18.json": "Private execution/account draft; replaced with factual public status.",
    "latest-model-job-draft.json": "Unexecuted provider draft; replaced with factual public status.",
}
TEXT_EXT = {".json", ".txt", ".cjs", ".js", ".py", ".md"}
SECRET = re.compile(r"(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})")
PRIVATE_KEYS = {"api_key", "apikey", "access_token", "refresh_token", "password", "cookie", "cookies", "authorization", "accountemail", "accountid", "output_hint", "generatedpath"}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def sanitize_text(value):
    # Absolute local filenames are execution details, not public research evidence.
    value = re.sub(r"(?<![A-Za-z0-9])[A-Za-z]:[\\/](?:[^\s\"'<>]|\\[\\/])*", "[local-path-omitted]", value)
    value = re.sub(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", "[email-omitted]", value)
    def clean_url(match):
        url = match.group(0)
        split = urlsplit(url)
        keys = {key.lower() for key, _ in parse_qsl(split.query)}
        if any(any(word in key for word in ("token", "signature", "credential", "secret", "api_key")) for key in keys):
            return urlunsplit((split.scheme, split.netloc, split.path, "", ""))
        return url
    return re.sub(r'https?://[^\s<>"\']+', clean_url, value)

def sanitize(value):
    if isinstance(value, dict):
        return {k: sanitize(v) for k, v in value.items() if k.lower() not in PRIVATE_KEYS}
    if isinstance(value, list):
        return [sanitize(v) for v in value]
    return sanitize_text(value) if isinstance(value, str) else value

def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")

def publish(source):
    dest = ROOT / "docs" / SLUG
    dest.mkdir(parents=True, exist_ok=True)
    (HERE / "archive").mkdir(exist_ok=True)
    c = json.loads((source / "data/archive.json").read_text(encoding="utf-8"))
    files = []
    def write(target, data, original=None, kind="page"):
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.suffix.lower() in TEXT_EXT | {".html", ".css"}:
            if SECRET.search(data.decode("utf-8")):
                raise ValueError(f"Credential-like content in {target.name}")
        target.write_bytes(data)
        item = {"path": target.relative_to(ROOT).as_posix(), "bytes": len(data), "sha256": digest(data), "kind": kind}
        if original is not None:
            item.update(sourceSha256=digest(original), unchanged=data == original)
        files.append(item)
    def copy_ui(relative):
        original = (source / relative).read_bytes()
        data = original
        if relative == "index.html":
            public_url = f"https://yydshly.github.io/20261104_codex_project/{SLUG}/"
            text = original.decode("utf-8")
            social = f'''  <link rel="canonical" href="{public_url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="日常元素与沉浸式循环：方向、价值与代表效果">
  <meta property="og:description" content="从日常素材建立原创系列，用十八轮实验理解统一情绪、整体联动、可信动作与自然回环；保留三个代表、反馈、方法、价值与待验证问题。">
  <meta property="og:image" content="{public_url}assets/summary/understanding-overview-v1.png">
  <meta property="og:url" content="{public_url}">
'''
            text = text.replace('  <link rel="stylesheet"', social + '  <link rel="stylesheet"', 1)
            text = text.replace("所有媒体和记录也可直接从 archive 文件夹打开。", "研究索引与原文件可通过本项目固定版本仓库回查。")
            data = text.encode("utf-8")
        write(dest / relative, data, original)
    for relative in ("index.html", "app.js", "styles.css"):
        copy_ui(relative)
    copy_ui("assets/summary/understanding-overview-v1.png")
    inventory = []
    source_files = {f["name"]: f for f in c["inventory"]}
    for item in c["inventory"]:
        name = item["name"]
        if name in EXCLUDED:
            continue
        original = (source / item["path"]).read_bytes()
        assert digest(original) == item["sha256"], name
        if Path(name).suffix == ".json":
            data = json_bytes(sanitize(json.loads(original.decode("utf-8-sig"))))
        elif Path(name).suffix in TEXT_EXT:
            data = sanitize_text(original.decode("utf-8-sig")).replace("\r\n", "\n").encode("utf-8")
        else:
            data = original
        write(HERE / item["path"], data, original, "media-or-evidence")
        inventory.append({**item, "bytes": len(data), "sha256": digest(data), "sourceSha256": digest(original), "publicationTextAdjusted": original != data})

    status_name = "public-execution-status.json"
    job = json.loads((source / "archive/forest-bird-test-job-v18.json").read_text(encoding="utf-8"))
    assert job["taskSubmitted"] is False and job["web"]["firstFrameUploaded"] is False and job["chatArtGenerationChargeIncurred"] is False
    status = {"title": "历史执行路线的公开摘要", "date": "2026-11-21", "nativeGifResult": "A single-frame PNG was returned; native animation was not verified.", "externalVideoSubmitted": False, "externalFirstFrameUploaded": False, "externalGenerationChargeIncurred": False, "userDirection": "Built-in GIF creation was requested; the external route was stopped.", "purpose": "A factual summary replacing private account and unexecuted provider drafts; not a generated film."}
    data = json_bytes(status)
    write(HERE / "archive" / status_name, data, kind="public-status-summary")
    inventory.append({"name": status_name, "path": "archive/" + status_name, "role": "历史执行路线公开摘要", "bytes": len(data), "sha256": digest(data), "recordIds": ["v05", "v18"]})
    thumbnails = set()
    for r in c["records"]:
        r["files"] = [f for f in r["files"] if f["name"] not in EXCLUDED]
        r["media"] = [m for m in r["media"] if m["name"] not in EXCLUDED]
        for key in ("provenance", "validation", "scripts", "related"):
            if key in r:
                r[key] = [name for name in r[key] if name not in EXCLUDED]
        if r["id"] in ("v05", "v18"):
            r["files"].append({"label": "公开执行状态", "name": status_name, "path": "archive/" + status_name})
        r["prompts"] = [p for p in r["prompts"] if Path(p["source"]).name not in EXCLUDED]
        for prompt in r["prompts"]:
            prompt["text"] = sanitize_text(prompt["text"])
        copy_ui(r["poster"])
        thumbnails.update(m["thumbnail"] for m in r["media"])
    for path in sorted(thumbnails):
        copy_ui(path)
    # This is a public derivative; it must not claim the private archive's byte-for-byte status.
    c = sanitize(c)
    c["inventory"] = sorted(inventory, key=lambda f: f["name"])
    c["publication"] = {"mode": "public-research", "date": "2026-11-21", "assetBase": ASSET_BASE, "mediaTag": TAG, "sourceFileCount": len(source_files), "excludedPrivateFiles": len(EXCLUDED), "publicStatusSummaries": 1, "textPolicy": "Local paths, emails and account details omitted; visual and animation media retain exact bytes.", "mediaPolicy": "Immutable tagged repository media loaded on demand; the Pages directory contains the UI, posters, thumbnails and original guide only."}
    c["summary"]["sourceFileCount"] = len(inventory)
    c["summary"]["sourceBytes"] = sum(f["bytes"] for f in inventory)
    c["coverage"].update(sourceFileCount=len(inventory), stageLinkedFiles=len(inventory), unassignedFiles=[], supplementaryVisualCount=len(thumbnails), recordedPromptCount=sum(len(r["prompts"]) for r in c["records"]), scopeNote="公开版保留十八轮阶段与全部动态实验，省去登录截图和私有执行草稿，以公开事实摘要替代；文字已省去本机路径。反馈为消息摘录，非完整聊天备份。")
    for path, value in (("data/archive.json", c), ("data/curation.json", {k:v for k,v in c.items() if k not in ("inventory", "summary")} ), ("data/source-inventory.json", {"publication": c["publication"], "files": inventory})):
        write(dest / path, json_bytes(value))
    js = json.dumps(c, ensure_ascii=False, indent=2).replace("<", "\\u003c").replace(">", "\\u003e").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    write(dest / "data/archive-data.js", ("window.RESEARCH_ARCHIVE = " + js + ";\n").encode("utf-8"))
    # Shared page entry links are deliberately explicit and static.
    readme = (HERE / "README.md").read_bytes()
    write(dest / "README.md", readme)
    public_check = {"publicationDate": "2026-11-21", "scope": "Public derivative integrity; not artistic acceptance", "passed": True, "publicResearchFiles": len(inventory), "privateOriginalFiles": len(source_files), "omittedPrivateFiles": len(EXCLUDED), "gifFiles": c["coverage"]["gifFileCount"], "guideUnchanged": True, "originalMediaUnchanged": all(f.get("unchanged", True) for f in files if f["kind"] == "media-or-evidence" and Path(f["path"]).suffix.lower() not in TEXT_EXT), "nativeAnimatedGifs": 0, "finalUserApprovedFilms": 0}
    write(dest / "data/archive-verification.json", json_bytes(public_check))
    guide = "assets/summary/understanding-overview-v1.png"
    guide_hash = digest((source / guide).read_bytes())
    assert digest((dest / guide).read_bytes()) == guide_hash
    manifest = {"slug": SLUG, "date": "2026-11-21", "mediaTag": TAG, "assetBase": ASSET_BASE, "representatives": c["representatives"], "sourceFiles": len(source_files), "publishedResearchFiles": len(inventory), "excluded": EXCLUDED, "guide": {"path": guide, "sourceSha256": guide_hash, "publishedSha256": guide_hash, "unchanged": True}, "files": files, "pagesBytes": sum(f["bytes"] for f in files if f["path"].startswith("docs/")), "archiveBytes": sum(f["bytes"] for f in files if f["path"].startswith("projects/")), "boundaries": c["researchSummary"]["boundary"]}
    (HERE / "publication-manifest.json").write_bytes(json_bytes(manifest))
    # No private source location is persisted in published metadata.
    print(json.dumps({"slug": SLUG, "publicResearchFiles": len(inventory), "pagesMiB": round(manifest["pagesBytes"]/1048576, 2), "mediaMiB": round(manifest["archiveBytes"]/1048576, 2), "guideUnchanged": True, "mediaTag": TAG}, ensure_ascii=False))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    publish(parser.parse_args().source.resolve())
