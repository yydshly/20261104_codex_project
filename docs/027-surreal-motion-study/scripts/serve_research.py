"""Read-only, loopback-only research preview with single HTTP byte ranges."""

from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import ipaddress
import os
from pathlib import Path
import re
import socket


ROOT = Path(__file__).resolve().parents[1]


class RangeRequestHandler(SimpleHTTPRequestHandler):
    """Serve files normally, or one bounded range for media seeking."""

    _range_remaining: int | None = None

    def log_message(self, format, *args):
        # Keep paths, URLs and request details out of the terminal log.
        pass

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        self._range_remaining = None
        value = self.headers.get('Range')
        path = self.translate_path(self.path)
        # Preserve stdlib directory/index behavior and normal caching for GET/HEAD.
        if value is None or os.path.isdir(path):
            return super().send_head()
        try:
            source = open(path, 'rb')
        except OSError:
            self.send_error(404, 'File not found')
            return None
        stat = os.fstat(source.fileno())
        size = stat.st_size
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', value.strip())
        start = end = None
        if match and size:
            first, last = match.groups()
            try:
                if first:
                    start = int(first)
                    end = min(int(last), size - 1) if last else size - 1
                elif last and int(last) > 0:
                    start = max(0, size - int(last))
                    end = size - 1
            except ValueError:
                # Python also rejects excessively long decimal integers.
                start = end = None
        if start is None or end is None or start >= size or end < start:
            source.close()
            self.send_response(416, 'Range Not Satisfiable')
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        source.seek(start)
        self._range_remaining = end - start + 1
        self.send_response(206, 'Partial Content')
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(self._range_remaining))
        self.send_header('Last-Modified', self.date_time_string(stat.st_mtime))
        self.end_headers()
        return source

    def copyfile(self, source, outputfile):
        try:
            if self._range_remaining is None:
                super().copyfile(source, outputfile)
                return
            remaining = self._range_remaining
            while remaining > 0:
                chunk = source.read(min(64 * 1024, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            # Browsers routinely cancel old ranges when the playhead is moved.
            pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--bind', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=4186)
    args = parser.parse_args()
    bind = '127.0.0.1' if args.bind.lower() == 'localhost' else args.bind
    try:
        address = ipaddress.ip_address(bind)
    except ValueError:
        parser.error('--bind must be a loopback IP address or localhost')
    if not address.is_loopback:
        parser.error('--bind must be loopback; external interfaces are not allowed')
    if not 1 <= args.port <= 65535:
        parser.error('--port must be between 1 and 65535')
    family = socket.AF_INET6 if address.version == 6 else socket.AF_INET
    server_type = type('ResearchHTTPServer', (ThreadingHTTPServer,), {'address_family': family, 'daemon_threads': True})
    handler = partial(RangeRequestHandler, directory=str(ROOT))
    host = f'[{bind}]' if address.version == 6 else bind
    with server_type((bind, args.port), handler) as server:
        print(f'Research preview: http://{host}:{args.port}/', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
