"""Validate publication boundaries, links, media identities and full summaries."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re
import urllib.parse

PROJECT = Path(__file__).resolve().parent
ROOT = PROJECT.parent.parent
META = json.loads((PROJECT / "publication.json").read_text(encoding="utf-8"))
SITE = ROOT / "docs" / META["slug"]
RAW_PREFIX = f'https://raw.githubusercontent.com/{META["repository"]}/main/'


class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.links = []; self.ids = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key == "id": self.ids.append(value)
            if key in ["src", "href", "poster"] and value: self.links.append(value)


def check(url, base):
    if url.startswith(("#", "data:", "about:")): return
    if url.startswith(RAW_PREFIX):
        target = ROOT / urllib.parse.unquote(url.removeprefix(RAW_PREFIX))
        assert target.is_file(), url
    elif re.match(r'^[a-z][a-z0-9+.-]*:', url, re.I):
        assert not url.lower().startswith('file:'), url
    else:
        target = base / urllib.parse.unquote(url.split('#')[0].split('?')[0])
        if target.is_dir(): target = target / 'index.html'
        assert target.is_file(), str(target)


def main():
    count = 0
    for path in SITE.rglob('*.html'):
        parser = Links(); parser.feed(path.read_text(encoding='utf-8'))
        assert len(parser.ids) == len(set(parser.ids)), path
        for url in parser.links:
            check(url, path.parent); count += 1
    data_text = (SITE / 'data.js').read_text(encoding='utf-8')
    data = json.loads(data_text.removeprefix('window.HUB=').removesuffix(';\n'))
    assert len(data['trials']) == 5
    assert [sum(x['round'] == n for x in data['trials']) for n in [1,2,3]] == [2,2,1]
    assert data['meta']['credits'] == 375
    assert next(x for x in data['curation']['capabilities'] if x['id']=='business')['state'] == 'unknown'
    assert next(x for x in data['curation']['capabilities'] if x['id']=='native-constraints')['state'] == 'failed'
    assert len(data['deliveries']) == 2
    assert not any(x['href'].startswith('file:') or 'path' in x for x in data['resources'])
    for resource in data['resources']:
        check(resource['href'], SITE); count += 1
    for item in data['deliveries']:
        check(item['video'], SITE); check(item['poster'], SITE)
    for item in data['entries']:
        check(item['image'], SITE)
    for path in [PROJECT / META['guide'], SITE / META['guide']]:
        assert hashlib.sha256(path.read_bytes()).hexdigest() == META['guideSha256']
    manifest = json.loads((SITE / 'publication-manifest.json').read_text(encoding='utf-8'))
    for item in manifest['files']:
        assert hashlib.sha256((SITE / item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']
    suspicious = []
    for base in [PROJECT,SITE]:
        for path in base.rglob('*'):
            if not path.is_file() or path.suffix.lower() not in ['.html','.json','.md','.js','.css','.txt','.py']: continue
            text=path.read_text(encoding='utf-8')
            if re.search(r'[FD]:[\\/](?:codex|software|my_daily|Users)',text,re.I):suspicious.append(str(path.relative_to(ROOT)))
            assert not re.search(r'(?:ghp_|github_pat_)[A-Za-z0-9_]{25,}',text), path
    assert not suspicious,suspicious
    for path in [ROOT/'README.md',ROOT/'docs/index.html']:
        text=path.read_text(encoding='utf-8')
        assert META['slug'] in text and '028' in text
        assert META['summary'] in text
    result={'status':'passed','publicResources':len(data['resources']),'nativeTrials':5,'roundCounts':[2,2,1],'currentDeliveries':2,'knownVideoCredits':375,'guideUnchanged':True,'linksChecked':count,'machinePathsRemoved':True,'sourceMedia':'author-post links; no source images/video copied','businessValidation':'not claimed','newGenerationCredits':0}
    (PROJECT/'verification').mkdir(exist_ok=True)
    (PROJECT/'verification/static.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False))


if __name__=='__main__':main()
