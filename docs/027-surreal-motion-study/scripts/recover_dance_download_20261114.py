"""Download the existing completed task using ChatArt's official download helper."""
from pathlib import Path
import sys
import requests

sys.path.insert(0, r'D:\codex\home\skills\chatart-skill\scripts')
from video_gen import download_video

root = Path(__file__).resolve().parents[1]
url = 'https://files.chatartpro.com/web-video/20261114/6af833ec39aee.mp4'
original = requests.sessions.Session.request
def transport(self, method, url, **kwargs):
    if '--direct' in sys.argv:
        self.trust_env = False
    kwargs.setdefault('timeout', (10, 20))
    response = original(self, method, url, **kwargs)
    print('Media response:', response.status_code,
          {k: response.headers.get(k) for k in ('Content-Type','Content-Length','Content-Range','Content-Encoding')}, flush=True)
    return response
requests.sessions.Session.request = transport
download_video(url, str(root/'assets/dance-video/chatart-20261114/dance-walk-original.mp4'), False)
