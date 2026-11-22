from pathlib import Path
from html.parser import HTMLParser
import hashlib
import json
import re
from urllib.parse import unquote,urlsplit

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SITE=ROOT/'docs'/HERE.name
manifest=json.loads((SITE/'publication-manifest.json').read_text(encoding='utf-8'))
checks=[]


class Document(HTMLParser):
    def __init__(self):super().__init__();self.links=[];self.ids=set();self.duplicates=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        for key in ('src','href'):
            if key in attrs:self.links.append((tag,key,attrs[key]))


for f in manifest['files']:
    content=(SITE/f['path']).read_bytes()
    assert len(content)==f['bytes'] and hashlib.sha256(content).hexdigest()==f['sha256'],f['path']
checks.append('publication manifest byte sizes and SHA-256')
guide=ROOT/'app-growth-radar/docs/architecture/app-growth-radar-overview-20261122-research-v2.png'
assert manifest['guide_sha256']=='41b07d0259335c76876e5138268ae71a7fc1f92df80aa5327fb7256c652bca62'
if guide.exists():assert hashlib.sha256(guide.read_bytes()).hexdigest()==manifest['guide_sha256']
checks.append('original guide preserved byte-for-byte')
for file in SITE.rglob('*.html'):
    parser=Document();parser.feed(file.read_text(encoding='utf-8'));assert not parser.duplicates,(file,parser.duplicates)
    for tag,key,url in parser.links:
        parsed=urlsplit(url)
        if parsed.scheme or parsed.netloc or url.startswith('data:'):continue
        if not parsed.path:
            if parsed.fragment:assert unquote(parsed.fragment) in parser.ids,(file,url)
            continue
        target=file.parent/unquote(parsed.path)
        assert target.exists(),(file,url)
        if parsed.fragment and target.is_file() and target.suffix=='.html':
            other=Document();other.feed(target.read_text(encoding='utf-8'));assert unquote(parsed.fragment) in other.ids,(file,url)
checks.append('local asset links, anchors and duplicate IDs')
snapshot=json.loads((SITE/'report/snapshot.json').read_text(encoding='utf-8'))
assert snapshot['as_of']=='2026-11-22' and snapshot['research']['review_count']==728
assert snapshot['research']['mode']=='statistics'
assert snapshot['research']['briefs']==[] and snapshot['research']['opportunities']==[]
assert snapshot['summary']['product_market_count']==manifest['statistics']['products']
assert len(snapshot['trends']['series'])>=snapshot['summary']['product_market_count']
encoded=json.dumps(snapshot,ensure_ascii=False)
assert not re.search(r'(?<![A-Za-z0-9])[A-Za-z]:[\\/]',encoded)
def inspect(value):
    if isinstance(value,dict):
        assert not {'raw_path','body','raw_data','userName','userImage'}.intersection(value)
        for x in value.values():inspect(x)
    if isinstance(value,list):
        for x in value:inspect(x)
inspect(snapshot)
assert not any(p.suffix in {'.sqlite3','.log','.zip'} for p in SITE.rglob('*'))
assert not any(p.name in {'node_modules','.env','data'} for p in SITE.rglob('*'))
checks.append('public snapshot excludes full review bodies, local paths and raw data')
text=(SITE/'index.html').read_text(encoding='utf-8')
for label in ['我们的理解','信息获取与统计','评论整理效果','判断交给人','阶段一归档','固定快照','不会随本机']:
    assert label in text,label
assert '__SNAPSHOT_DATA__' not in text
for file in [ROOT/'README.md',ROOT/'docs/index.html']:
    assert '035-app-opportunity-radar' in file.read_text(encoding='utf-8')
checks.append('statistics-first phase summary, historical-guide boundary and both catalogs')
assert '图中的机会判断与切入验证属于早期设想' in text
assert set(p.relative_to(SITE).as_posix() for p in SITE.rglob('*') if p.is_file())=={f['path'] for f in manifest['files']}|{'publication-manifest.json','.gitattributes'}
for name in manifest['source_allowlist']:
    assert (HERE/'collector'/name).is_file()
    assert hashlib.sha256((HERE/'collector'/name).read_bytes()).hexdigest()==manifest['collector_sha256'][name]
assert (HERE/'PHASE-1.md').is_file()
checks.append('explicit site and source allowlists, no extra published files')
result={'passed':True,'checks':checks,'snapshot_date':snapshot['as_of'],'files':len(manifest['files']),'guide_sha256':manifest['guide_sha256']}
(HERE/'verification/static.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
