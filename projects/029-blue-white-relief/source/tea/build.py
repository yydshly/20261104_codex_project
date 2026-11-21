"""Build a configured visitor page and an offline brand-template editor."""
from pathlib import Path
import base64
import hashlib
import json
import mimetypes
import re

ROOT = Path(__file__).resolve().parent


def safe_json(value):
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def inline_script(text):
    return "<script>" + text.replace("</script", "<\\/script") + "</script>"


def source(name):
    return (ROOT / name).read_text(encoding="utf-8")


def scripts_inline(html, data):
    names = re.findall(r'<script src="([^"]+)" defer></script>', html)
    html = re.sub(r'<script src="[^"]+" defer></script>', "", html)
    javascript = inline_script(data) + "".join(inline_script(source(name)) for name in names if name != "brand-data.js")
    return html.replace("</body>", javascript + "</body>")


def build():
    config = json.loads(source("brand.config.json"))
    presets = {"shanbai": config, "songjian": json.loads(source("presets/songjian.json"))}
    assets = {}
    for path in sorted((ROOT / "assets").iterdir()):
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        assets["assets/" + path.name] = "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode("ascii")
    # Source-page preview uses local files; standalone builds embed each asset once.
    (ROOT / "brand-data.js").write_text("window.BRAND_DEFAULTS=" + safe_json(config) + ";window.BRAND_ASSETS=window.BRAND_ASSETS||{};\n", encoding="utf-8", newline="\n")
    template = source("page.html").replace('<link rel="stylesheet" href="styles.css">', "<style>" + source("styles.css") + "</style>")
    template = re.sub(r'\s(src|poster|href)="assets/[^"]+"', "", template)
    template = scripts_inline(template, "window.BRAND_DEFAULTS=" + safe_json(config) + ";window.BRAND_ASSETS=" + safe_json(assets) + ";")
    marker = '<script id="brand-config" type="application/json">null</script>'
    if template.count(marker) != 1:
        raise RuntimeError("Expected exactly one page configuration block")
    visitor = template.replace(marker, '<script id="brand-config" type="application/json">' + safe_json(config) + "</script>")
    studio = source("studio-page.html").replace('<link rel="stylesheet" href="studio.css">', "<style>" + source("studio.css") + "</style>")
    studio = scripts_inline(studio, "window.BRAND_DEFAULTS=" + safe_json(config) + ";window.BRAND_PRESETS=" + safe_json(presets) + ";window.BRAND_PAGE_TEMPLATE=" + safe_json(template) + ";")
    for filename, html in [("index.html", visitor), ("studio.html", studio)]:
        (ROOT / filename).write_text(html, encoding="utf-8", newline="\n")
    report = {"entry": "index.html", "editor": "studio.html", "offline": True, "bytes": len(visitor.encode("utf-8")), "editor_bytes": len(studio.encode("utf-8")), "sha256": hashlib.sha256(visitor.encode("utf-8")).hexdigest(), "editor_sha256": hashlib.sha256(studio.encode("utf-8")).hexdigest(), "embedded_assets": len(assets), "configuration": "brand.config.json", "presets": list(presets), "new_generation_credits": 0}
    (ROOT / "reports/build.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8", newline="\n")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    build()
