"""Build the public, read-only Pages site from public reports in the local app.

Only an explicit asset list and curated API fields are exported. SQLite, models,
credentials, full scraped documents, and local settings files stay on the machine.
"""
import argparse
from copy import deepcopy
from datetime import datetime, timedelta, timezone
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from bs4 import BeautifulSoup
import httpx


ROOT = Path(__file__).resolve().parent
DESTINATION = ROOT.parent / "docs" / "021-growth-casebook"
PUBLIC_URL = "https://yydshly.github.io/20261104_codex_project/021-growth-casebook/"
SOURCE_URL = "https://github.com/yydshly/20261104_codex_project/tree/main/growth-casebook"
ASSETS = ["styles.css", "app.js", "project-review.md", "research-map/research-overview.png", "research-map/research-overview.svg"]
SOURCE_METADATA = {"source_kind", "discovered_at", "feed_url", "feed_entry_id", "outbound_url", "website_status", "transport", "full_name", "stargazers_count", "forks_count", "open_issues_count", "language", "license", "created_at", "pushed_at", "topics", "description", "homepage", "archived", "tag", "prerelease"}
PROJECT_FIELDS = {"id", "identity", "website", "name", "category", "github", "description", "description_zh", "created_at", "updated_at", "hidden_reason", "source_count", "action_count", "channels", "coverage", "listing_count", "version", "generated_at", "mode", "metrics", "gap_count", "summary", "website_resolution"}
SENSITIVE_KEY = re.compile(r"token|password|secret|api.?key|cookie|authorization|local.?path|file.?path", re.I)


def clean_reference(value):
    if not isinstance(value, str):
        return ""
    try:
        p = urlsplit(value)
        host = (p.hostname or "").lower()
        if p.scheme not in {"http", "https"} or not host or p.username or p.password or p.port not in {None, 80, 443}:
            return ""
        if host == "localhost" or host.endswith((".localhost", ".local", ".internal")):
            return ""
        try:
            if not ipaddress.ip_address(host).is_global:
                return ""
        except ValueError:
            pass
        query = urlencode([(key, value) for key, value in parse_qsl(p.query, keep_blank_values=True) if not SENSITIVE_KEY.search(key)])
        return urlunsplit((p.scheme, p.netloc, p.path, query, p.fragment))
    except ValueError:
        return ""


def clean_value(value):
    if isinstance(value, dict):
        return {key: clean_value(item) for key, item in value.items() if not SENSITIVE_KEY.search(key)}
    if isinstance(value, list):
        return [clean_value(item) for item in value]
    if isinstance(value, str):
        if value.startswith(("https://", "http://")):
            return clean_reference(value)
        if re.search(r"[A-Za-z]:[\\/](?:Users|codex|software|my_daily_notes)\b", value, re.I):
            return "本轮来源未能完成，详细运行信息保留在本机。"
    return value


def public_report(report):
    value = deepcopy(report)
    for source in value["sources"]:
        source["text"] = source["text"][:280]
        source["metadata"] = {key: item for key, item in source.get("metadata", {}).items() if key in SOURCE_METADATA}
        source["metadata"]["public_excerpt"] = True
        source["links"] = [{"url": clean_reference(link["url"]), "text": link.get("text", "")[:120]} for link in source.get("links", []) if clean_reference(link.get("url"))][:30]
    return clean_value(value)


def atomic_bytes(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    with temp.open("wb") as stream:
        stream.write(payload)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temp, path)


def export_publication(client, destination=DESTINATION):
    destination = Path(destination)
    paths = []

    def write(path, payload):
        if isinstance(payload, str):
            payload = payload.encode("utf-8")
        atomic_bytes(destination / path, payload)
        paths.append(path)

    def json_file(path, payload):
        write(path, json.dumps(payload, ensure_ascii=False, indent=2) + "\n")

    def read(path):
        return client.get(path).raise_for_status().json()

    published_at = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")
    projects = [{key: value for key, value in item.items() if key in PROJECT_FIELDS} for item in read("/api/projects")["items"]]
    visible_ids = {project["id"] for project in projects}
    versions = {}
    report_count = 0
    for project in projects:
        detail = read("/api/projects/" + project["id"])
        versions[project["id"]] = detail["versions"]
        for version in detail["versions"]:
            report = detail["report"] if version["version"] == detail["report"]["version"] else read(f"/api/projects/{project['id']}?version={version['version']}")["report"]
            json_file(f"snapshot/reports/{project['id']}/v{version['version']}.json", public_report(report))
            report_count += 1
    discovery = read("/api/discovery")
    discovery["candidates"] = [item for item in discovery["candidates"] if item.get("project_id") in visible_ids and item.get("has_report")]
    tasks = [{key: value for key, value in item.items() if key in {"id", "project_id", "project_name", "status", "stage", "progress", "error", "warnings", "created_at", "updated_at"}} for item in read("/api/tasks")["items"] if item["project_id"] in visible_ids]
    stats = {"projects": len(projects), "sources": sum(p["source_count"] for p in projects), "actions": sum(p["action_count"] for p in projects),
             "channels": len({channel for p in projects for channel in p["channels"] if channel not in {"产品更新", "项目历史"}})}
    catalog = clean_value({"published_at": published_at, "mode": "public-snapshot", "projects": projects, "versions": versions, "discovery": discovery, "tasks": tasks, "stats": stats})
    json_file("snapshot/catalog.json", catalog)

    page = BeautifulSoup((ROOT / "static/index.html").read_text(encoding="utf-8"), "html.parser")
    mode = page.new_tag("meta", attrs={"name": "casebook-mode", "content": "public-snapshot"})
    page.head.append(mode)
    canonical = page.new_tag("link", attrs={"rel": "canonical", "href": PUBLIC_URL})
    page.head.append(canonical)
    page.title.string = "产品公开信息如何成为研究资产 · Growth Casebook"
    page.select_one('meta[name="description"]')["content"] = "研究免费公开来源怎样支撑产品与获客研究。用官网核对、固定报告、原文引用和历史版本积累可比较的案例，为我们的选题、竞品学习和小实验提供依据；真实获客成效与商业价值仍待验证。"
    for element in page.select('[href^="/static/"],[src^="/static/"]'):
        attribute = "href" if element.has_attr("href") else "src"
        element[attribute] = element[attribute].lstrip("/")
    for button in page.select("[data-new-project]"):
        button.decompose()
    notice = BeautifulSoup(f'<aside class="publication-banner" aria-label="公开快照说明"><strong>公开研究快照 · {published_at[:10]}</strong>：可阅读总结、案例、版本和发现记录；后台采集在本地 8766 运行。来源正文仅保留短摘录。<a href="{SOURCE_URL}" target="_blank" rel="noopener noreferrer">源码与本地运行说明</a> · <a href="../">返回研究总库</a></aside>', "html.parser").aside
    page.select_one("#running-banner").insert_after(notice)
    page.select_one(".local-label").clear()
    page.select_one(".local-label").string = "公开研究快照 · 免费数据第一版"
    page.select_one(".footer").append(" · 公开阅读版")
    write("index.html", str(page))
    for asset in ASSETS:
        write("static/" + asset, (ROOT / "static" / asset).read_bytes())
    write("README.md", "# Growth Casebook 公开研究页\n\n线上入口：" + PUBLIC_URL + "\n\n本目录为研究总结、案例与报告的只读快照，后台发现与采集在本地 8766 运行。引导图沿用已生成的原图；完整原始采集快照、数据库与翻译模型保留在本机。\n\n构建：在 growth-casebook 目录运行 python publish_snapshot.py。\n")
    figure_hash = hashlib.sha256((ROOT / "static/research-map/research-overview.png").read_bytes()).hexdigest()
    manifest = {"published_at": published_at, "public_url": PUBLIC_URL, "mode": "public-snapshot", "stats": stats,
                "reports": report_count, "guide_sha256": figure_hash, "files": sorted(paths + ["publication-manifest.json"])}
    json_file("publication-manifest.json", manifest)
    return manifest


def main():
    parser = argparse.ArgumentParser(description="构建 Growth Casebook 公开阅读快照")
    parser.add_argument("--base-url", default="http://127.0.0.1:8766")
    args = parser.parse_args()
    with httpx.Client(base_url=args.base_url, timeout=20) as client:
        manifest = export_publication(client)
    print(json.dumps({"destination": str(DESTINATION), "stats": manifest["stats"], "reports": manifest["reports"], "files": len(manifest["files"]), "guide_sha256": manifest["guide_sha256"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
