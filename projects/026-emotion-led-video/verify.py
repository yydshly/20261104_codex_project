"""Verify public links, original guide identity, metadata, media and publication scope."""
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urlsplit

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SITE = ROOT / 'docs' / '026-emotion-led-video'
CORE = '从人的日常情绪出发，把渴望变成一个想亲历的瞬间'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.images = []
        self.metadata = {}
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('href', 'src', 'poster', 'data-image'):
            if attrs.get(key):
                self.links.append(attrs[key])
        if tag == 'img':
            self.images.append(attrs)
        if tag == 'meta':
            self.metadata[attrs.get('name', attrs.get('property', ''))] = attrs.get('content')

def require_local(url, base):
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc or not parsed.path:
        assert parsed.scheme != 'file', 'local drive URL in public page'
        return
    target = (base / unquote(parsed.path)).resolve()
    assert target.is_relative_to((ROOT / 'docs').resolve()), 'link escapes public docs'
    assert target.exists(), 'broken local link: ' + str(target.relative_to(ROOT))
    if target.is_dir():
        assert (target / 'index.html').is_file(), 'directory has no browser entry'

def main():
    manifest = json.loads((SITE / 'publication-manifest.json').read_text(encoding='utf-8'))
    paths = set()
    for entry in manifest['files']:
        relative = entry['path']
        paths.add(relative)
        data = (SITE / relative).read_bytes()
        assert data and len(data) == entry['bytes']
        assert hashlib.sha256(data).hexdigest() == entry['sha256'], 'modified published asset'
        assert len(data) < 100_000_000, 'GitHub regular-file size limit'
        assert not any(x in Path(relative).parts for x in ('raw', 'public-client', 'tools', '.git'))
        if Path(relative).suffix in ('.html', '.css', '.js', '.json', '.md', '.txt', '.srt'):
            text = data.decode('utf-8-sig')
            assert not re.search(r'file:///|[A-Z]:[\\/]|device_id=|CHATARTPRO_API_KEY|"api_key"\s*:|"access_token"\s*:', text), 'private local material in public output'
    assert set(p.relative_to(SITE).as_posix() for p in SITE.rglob('*') if p.is_file()) == paths | {'publication-manifest.json'}
    guide = SITE / manifest['guide']['path']
    assert hashlib.sha256(guide.read_bytes()).hexdigest() == 'dadffe42005099b52557c1e63f199cd0ab2b0e634df2a3f88d83dc4dda0d8e4f'
    checked = 0
    for file in SITE.rglob('*.html'):
        parser = Page()
        parser.feed(file.read_text(encoding='utf-8'))
        for link in parser.links:
            require_local(link, file.parent)
            checked += 1
        assert all(image.get('alt') for image in parser.images if image.get('src'))
    home = Page()
    home.feed((SITE / 'index.html').read_text(encoding='utf-8'))
    assert home.images[0]['src'] == manifest['guide']['path']
    assert CORE in home.metadata['description'] and CORE in home.metadata['og:description']
    assert home.metadata['og:image'].endswith(manifest['guide']['path'])
    for file in SITE.rglob('*.md'):
        for link in re.findall(r'\]\(([^)]+)\)', file.read_text(encoding='utf-8')):
            require_local(link, file.parent)
            checked += 1
    data = json.loads((SITE / 'stories.json').read_text(encoding='utf-8'))
    assert len(data['stories']) == 6
    for story in data['stories']:
        require_local(story['image']['path'], SITE)
    media = []
    for episode, seconds in (('cave-welcome-8s', 8), ('cave-birthday-15s', 15)):
        base = SITE / 'episodes' / episode
        demo = json.loads((base / 'demo-data.js').read_text(encoding='utf-8').split('=', 1)[1].strip().rstrip(';'))
        assert demo['status'] == 'ready' and not demo.get('rawPath')
        require_local(demo['posterPath'], base)
        source = base / demo['videoPath']
        assert source.stat().st_size > 1_000_000
        result = subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(source)], capture_output=True, text=True, encoding='utf-8', check=True)
        probe = json.loads(result.stdout)
        video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
        assert (video['width'], video['height']) == (720, 1280)
        assert abs(float(probe['format']['duration']) - seconds) < .1
        media.append({'episode': episode, 'durationSeconds': float(probe['format']['duration']), 'width': 720, 'height': 1280})
    assert CORE in (ROOT / 'README.md').read_text(encoding='utf-8')
    assert CORE in (ROOT / 'docs' / 'index.html').read_text(encoding='utf-8')
    report = {'project': '026-emotion-led-video', 'status': 'passed', 'publicFiles': len(paths),
              'linksChecked': checked, 'guideOriginalHashMatched': True,
              'privateProductionMaterialExcluded': True, 'metadataIncludesCoreValue': True, 'media': media,
              'browserReview': 'recorded separately', 'fullHumanAudioReview': False}
    (HERE / 'verification').mkdir(exist_ok=True)
    (HERE / 'verification' / 'structural.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report))

if __name__ == '__main__':
    main()
