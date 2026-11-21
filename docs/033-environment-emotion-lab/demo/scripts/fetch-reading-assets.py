"""Fetch official CC0 glTF/PBR assets; retain provenance and check source MD5."""
import urllib.request, json, hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading'; DEST.mkdir(parents=True,exist_ok=True)
def get(url):
    if not url.startswith(('https://api.polyhaven.com/','https://dl.polyhaven.org/')): raise ValueError(url)
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'ReadingCorner/1.0'}),timeout=90) as r:return r.read()
jobs=[]
for asset in ['mid_century_lounge_chair','side_table_01','book_encyclopedia_set_01','desk_lamp_arm_01','wicker_basket_02','Ottoman_01','throw_pillows_01']:
    meta=json.loads(get('https://api.polyhaven.com/files/'+asset)); spec=meta['gltf']['1k']['gltf']
    (DEST/(asset+'-api.json')).write_text(json.dumps(meta),encoding='utf-8')
    jobs.append((asset,asset+'/'+asset+'_1k.gltf',spec))
    jobs.extend((asset,asset+'/'+relative,record) for relative,record in spec.get('include',{}).items())
for asset in ['wood_floor','poly_wool_herringbone']:
    meta=json.loads(get('https://api.polyhaven.com/files/'+asset))
    for channel,source in [('diff','Diffuse'),('nor_gl','nor_gl'),('rough','Rough')]:
        spec=meta[source]['1k']['jpg'];jobs.append((asset,asset+'/'+channel+'.jpg',spec))
meta=json.loads(get('https://api.polyhaven.com/files/lebombo'))
jobs.append(('lebombo','lebombo.hdr',meta['hdri']['1k']['hdr']))
def fetch(job):
    asset,relative,spec=job;path=DEST/relative;path.parent.mkdir(parents=True,exist_ok=True)
    data=path.read_bytes() if path.exists() else None
    if data is None or hashlib.md5(data).hexdigest()!=spec['md5']:
        data=get(spec['url'])
        if hashlib.md5(data).hexdigest()!=spec['md5']:raise ValueError(relative)
        path.write_bytes(data)
    return dict(asset=asset,file=path.relative_to(ROOT).as_posix(),url=spec['url'],bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),source='https://polyhaven.com/a/'+asset,license='CC0-1.0')
with ThreadPoolExecutor(max_workers=5) as pool:records=list(pool.map(fetch,jobs))
(DEST/'sources.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(dict(files=len(records),bytes=sum(r['bytes'] for r in records))))
