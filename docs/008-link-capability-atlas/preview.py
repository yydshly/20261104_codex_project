"""Serve the atlas on loopback, including byte ranges for audio and video seeking."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
from shutil import copyfileobj


class AtlasPreview(SimpleHTTPRequestHandler):
    media_types = {'.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg'}

    def __init__(self, *args, **kwargs):
        self.byte_count = None
        super().__init__(*args, directory=str(Path(__file__).resolve().parent), **kwargs)

    def send_head(self):
        self.byte_count = None
        media = Path(self.translate_path(self.path))
        content_type = self.media_types.get(media.suffix.lower())
        if not content_type or not media.is_file():
            return super().send_head()

        size = media.stat().st_size
        requested = self.headers.get('Range')
        first, last = 0, size - 1
        if requested:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested)
            if not match or not any(match.groups()):
                return self.invalid_range(size)
            start, stop = match.groups()
            if start:
                first = int(start)
                last = min(int(stop), last) if stop else last
            else:
                first = max(0, size - int(stop))
            if first > last:
                return self.invalid_range(size)

        try:
            source = media.open('rb')
        except OSError:
            self.send_error(404)
            return None
        self.byte_count = last - first + 1
        source.seek(first)
        self.send_response(206 if requested else 200)
        self.send_header('Content-Type', content_type)
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(self.byte_count))
        if requested:
            self.send_header('Content-Range', f'bytes {first}-{last}/{size}')
        self.end_headers()
        return source

    def invalid_range(self, size):
        self.send_response(416)
        self.send_header('Content-Range', f'bytes */{size}')
        self.send_header('Content-Length', '0')
        self.end_headers()

    def copyfile(self, source, outputfile):
        if self.byte_count is None:
            copyfileobj(source, outputfile)
            return
        remaining = self.byte_count
        while remaining > 0:
            chunk = source.read(min(remaining, 65536))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == '__main__':
    with ThreadingHTTPServer(('127.0.0.1', 5187), AtlasPreview) as server:
        print('能力图鉴本地预览：http://127.0.0.1:5187/', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
