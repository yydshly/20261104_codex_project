"""Check the curated package, relative links, raw assets, glTF dependencies and guide."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import hashlib
import json
import re

P = Path(__file__).resolve().parent
ROOT = P.parent.parent
META = json.loads((P/'publication.json').read_text(encoding='utf-8'))
OUT = ROOT/'docs'/META['slug']
RUNTIME = P/'runtime'
RAW = f'https://raw.githubusercontent.com/{META["repository"]}/main/projects/{META["slug"]}/runtime/'


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids=[]; self.links=[]; self.h1=0
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='h1':self.h1+=1
        self.links.extend(a[k] for k in ['src','href','poster'] if a.get(k))


errors=[];references=0;imports=0;buffers=0
pages={}
for file in OUT.rglob('*.html'):
    parser=Page();parser.feed(file.read_text(encoding='utf-8'));pages[file.resolve()]=parser
    if len(parser.ids)!=len(set(parser.ids)):errors.append([str(file),'duplicate-id'])
    if parser.h1!=1:errors.append([str(file),'h1-count',parser.h1])
for file,parser in pages.items():
    for ref in parser.links:
        references+=1;u=urlsplit(ref)
        if ref.startswith(RAW):
            target=RUNTIME/unquote(urlsplit(ref[len(RAW):]).path)
        elif u.scheme or u.netloc:continue
        else:target=(file.parent/unquote(u.path)).resolve() if u.path else file
        if target.is_dir():target=target/'index.html'
        if not target.is_file():errors.append([file.name,'missing-reference',ref]);continue
        if u.fragment and target.resolve() in pages and unquote(u.fragment) not in pages[target.resolve()].ids:
            errors.append([file.name,'missing-anchor',ref])
for file in OUT.rglob('*.js'):
    if 'scripts' in file.parts:continue
    text=file.read_text(encoding='utf-8')
    for ref in re.findall(r'(?:from\s*|import\s*\()\s*[\"\x27](\.[^\"\x27]+)',text):
        imports+=1
        if not (file.parent/ref).resolve().is_file():errors.append([file.name,'missing-module',ref])
    if re.search(r'\.\./https?://|\./https?://',text):errors.append([file.name,'malformed-asset-url'])
for file in RUNTIME.rglob('*.gltf'):
    data=json.loads(file.read_text(encoding='utf-8'))
    for item in data.get('buffers',[])+data.get('images',[]):
        uri=item.get('uri','')
        if not uri or uri.startswith('data:'):continue
        buffers+=1
        if not (file.parent/unquote(uri)).is_file():errors.append([file.name,'missing-gltf-file',uri])
for file in list(RUNTIME.rglob('*'))+list(OUT.rglob('*')):
    if not file.is_file():continue
    if file.stat().st_size>=100*1024*1024:errors.append([str(file),'GitHub-file-limit'])
    if file.suffix in {'.json','.js','.mjs','.html','.md','.py','.txt'}:
        text=file.read_text(encoding='utf-8')
        if re.search(r'(?:ghp_|gho_|sk-)[A-Za-z0-9_-]{22,}',text):errors.append([str(file),'credential-shaped-text'])
        if '\ufffd' in text:errors.append([str(file),'encoding-replacement'])
provenance=json.loads((P/'guide-provenance.json').read_text(encoding='utf-8'))
guide_sha=hashlib.sha256((OUT/META['guide']).read_bytes()).hexdigest()
if guide_sha!=provenance['sha256']:errors.append(['guide','hash-mismatch'])
manifest=json.loads((P/'publication-manifest.json').read_text(encoding='utf-8'))
for entry in manifest['runtimeFiles']:
    file=RUNTIME/entry['path'] if entry['delivery']=='repository-raw' else OUT/entry['target']
    if hashlib.sha256(file.read_bytes()).hexdigest()!=entry['sha256']:errors.append([entry['path'],'manifest-mismatch'])
report={'date':META['published'],'htmlPages':len(pages),'htmlReferences':references,'moduleImports':imports,
        'gltfDependencies':buffers,'guideSha256':guide_sha,'guideUnchanged':not any(e[0]=='guide' for e in errors),
        'runtimeChecks':'npm run check; npm test; npm run test:connected passed on curated runtime',
        'scope':'Package validation; historical browser and subjective audio evidence remain separately dated',
        'errors':errors}
(P/'verification-local.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
assert not errors
