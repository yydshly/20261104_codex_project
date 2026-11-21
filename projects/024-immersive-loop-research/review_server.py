"""Review the exact public UI against local copies of the tagged media before pushing."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PREFIX = "024-immersive-loop-research"
REMOTE = f"https://raw.githubusercontent.com/yydshly/20261104_codex_project/research-024-20261121/projects/{PREFIX}/"

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".webp": "image/webp", ".js": "text/javascript", ".cjs": "text/plain", ".json": "application/json", ".mp4": "video/mp4"}
    def translate_path(self, path):
        relative = unquote(urlsplit(path).path).lstrip("/")
        p = (ROOT / relative).resolve()
        allowed = [ROOT / "docs" / PREFIX, HERE / "archive"]
        return str(p) if any(p == a or a in p.parents for a in allowed) else str(ROOT / "__not_public_review__")
    def list_directory(self, path):
        self.send_error(404)
    def do_GET(self):
        relative = unquote(urlsplit(self.path).path).lstrip("/")
        if relative == f"docs/{PREFIX}/data/archive-data.js":
            data = Path(self.translate_path(self.path)).read_text(encoding="utf-8").replace(REMOTE, f"http://127.0.0.1:{self.server.server_port}/projects/{PREFIX}/").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/javascript; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
        else:
            super().do_GET()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=39029)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Public UI review: http://127.0.0.1:{server.server_port}/docs/{PREFIX}/", flush=True)
    server.serve_forever()
