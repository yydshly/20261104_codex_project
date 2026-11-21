"""Verify public assets and all referenced files without relying on private sources."""
import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DEST = ROOT / "docs/024-immersive-loop-research"

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.local = []
        self.ids = set()
        self.anchors = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        for key in ("href", "src"):
            value = attrs.get(key, "")
            if value.startswith("#"):
                self.anchors.append(value[1:])
            elif value and not urlsplit(value).scheme:
                self.local.append(unquote(urlsplit(value).path))

def verify():
    c = json.loads((DEST / "data/archive.json").read_text(encoding="utf-8"))
    manifest = json.loads((HERE / "publication-manifest.json").read_text(encoding="utf-8"))
    errors, checks = [], []
    def check(condition, message):
        (checks if condition else errors).append(message)
    for item in manifest["files"]:
        p = ROOT / item["path"]
        check(p.is_file() and p.stat().st_size == item["bytes"] and hashlib.sha256(p.read_bytes()).hexdigest() == item["sha256"], f"Published bytes: {item['path']}")
    media = {f["name"] for f in c["inventory"]}
    actual = {p.name for p in (HERE / "archive").iterdir() if p.is_file()}
    check(media == actual, "Public archive inventory has no omitted or stale files")
    def resolve(path):
        return HERE / path if path.startswith("archive/") else DEST / path
    for r in c["records"]:
        for path in [r["poster"], *r["assets"].values(), *[f["path"] for f in r["files"]], *[m["thumbnail"] for m in r["media"]]]:
            check(resolve(path).is_file(), f"Resolvable record asset: {r['id']} / {path}")
        for m in r["media"]:
            check(resolve(m["path"]).is_file(), f"Resolvable supplementary visual: {r['id']} / {m['name']}")
        for p in r["prompts"]:
            check(resolve(p["source"]).is_file(), f"Prompt source: {r['id']} / {p['field']}")
    for name in manifest["excluded"]:
        check(name not in media and not (HERE / "archive" / name).exists(), f"Private draft/screenshot excluded: {name}")
    check(len(c["records"]) == 20 and len([r for r in c["records"] if r["kind"] != "reference"]) == 18, "Two references and eighteen stages")
    check(c["representatives"] == ["v03", "v12", "v17"], "Three different representative directions")
    check(c["summary"]["sourceFileCount"] == len(media) == 154, "Public-file scope is accurate")
    check(c["coverage"]["inPageGifCount"] == c["coverage"]["gifFileCount"] == len([n for n in media if n.endswith(".gif")]) == 20, "Every GIF retains an in-page entry")
    check(all(f["recordIds"] for f in c["inventory"]), "Every public research file belongs to a stage")
    check(c["publication"]["mediaTag"] == manifest["mediaTag"] and manifest["mediaTag"] in c["publication"]["assetBase"], "Immutable media tag is consistent")
    check(c["summary"]["verifiedNativeAnimatedGifs"] == c["summary"]["finalUserApprovedFilms"] == 0, "No false native-GIF or final-artwork claim")
    check(len(c["researchSummary"]["directions"]) == 4 and len(c["researchSummary"]["values"]) == 3 and len(c["researchSummary"]["extensions"]) == 3, "Direction, value and proposed extensions are included")
    last = next(r for r in c["records"] if r["id"] == "v18")
    check(not last.get("gif") and last["attemptInfo"]["frames"] == 1, "V18 remains a static capability probe")
    parser = Links()
    parser.feed((DEST / "index.html").read_text(encoding="utf-8"))
    for p in parser.local:
        check((DEST / p).is_file(), f"Page entry asset: {p}")
    for anchor in parser.anchors:
        check(anchor in parser.ids, f"Page anchor: {anchor}")
    guide = DEST / manifest["guide"]["path"]
    check(hashlib.sha256(guide.read_bytes()).hexdigest() == manifest["guide"]["sourceSha256"], "Guide image is exactly the user's existing output")
    private_path = re.compile(r"(?<![A-Za-z0-9])[A-Za-z]:[\\/]")
    credential = re.compile(r"(?:sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})")
    for item in manifest["files"]:
        p = ROOT / item["path"]
        if p.suffix.lower() in (".json", ".txt", ".cjs", ".js", ".md", ".html", ".css"):
            value = p.read_text(encoding="utf-8")
            check(not private_path.search(value) and not credential.search(value), f"No local path or credential pattern: {item['path']}")
    report = {"passed": not errors, "checksPassed": len(checks), "errors": errors, "researchStages": 18, "representatives": c["representatives"], "publicResearchFiles": len(media), "gifFiles": 20, "pagesMiB": round(manifest["pagesBytes"]/1048576, 2), "mediaMiB": round(manifest["archiveBytes"]/1048576, 2), "guideUnchanged": True}
    (HERE / "verification.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)

if __name__ == "__main__":
    verify()
