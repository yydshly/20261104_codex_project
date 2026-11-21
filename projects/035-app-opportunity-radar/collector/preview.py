"""Read-only loopback preview of the generated HTML report."""

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


REPORT = Path(__file__).resolve().parent / "reports" / "latest.html"


class ReportHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.respond(send_body=True)

    def do_HEAD(self):
        self.respond(send_body=False)

    def respond(self, send_body):
        route = urlsplit(self.path).path
        if route == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        if route not in {"/", "/latest.html"}:
            self.send_error(404)
            return
        try:
            body = REPORT.read_bytes()
        except OSError:
            self.send_error(503, "Report not generated yet")
            return
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        if send_body:
            self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser(description="Open a local, read-only report preview")
    parser.add_argument("--port", type=int, default=5227)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), ReportHandler)
    print(f"App Growth Radar: http://127.0.0.1:{args.port}/", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
