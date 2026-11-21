"""Reading v3: cached official manifests, verified PBR textures and cabinet source."""
import json,hashlib,urllib.request,time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1];DEST=ROOT/'https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/reading'
def get(url):
    if not url.startswith(('https://dl.polyhaven.org/','https://api.polyhaven.com/')):raise ValueError(url)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'ReadingCorner/3.0'}),timeout=45)as r:return r.read()
        except Exception:
            if attempt==2:raise
            time.sleep(attempt+1)
def meta(name):return json.loads((DEST/(name+'-api.json')).read_text(encoding='utf-8-sig'))
jobs=[]
for name,res in [('wooden_bookshelf_worn','1k'),('mid_century_lounge_chair','2k')]:
    spec=meta(name)['gltf'][res]['gltf'];jobs.append((name,f'{name}/{name}_{res}.gltf',spec))
    jobs.extend((name,name+'/'+path,specification)for path,specification in spec.get('include',{}).items())
for name in ['walnut_veneer','rough_linen']:
    data=meta(name)
    for local,key in [('diff','Diffuse'),('nor_gl','nor_gl'),('rough','Rough')]:jobs.append((name,name+'/'+local+'.jpg',data[key]['2k']['jpg']))
def fetch(job):
    name,relative,spec=job;p=DEST/relative;p.parent.mkdir(parents=True,exist_ok=True)
    data=p.read_bytes()if p.exists()else None
    if data is None or hashlib.md5(data).hexdigest()!=spec['md5']:
        data=get(spec['url']);assert hashlib.md5(data).hexdigest()==spec['md5'],relative;p.write_bytes(data)
    return dict(asset=name,file=p.relative_to(ROOT).as_posix(),bytes=len(data),url=spec['url'],md5=spec['md5'],sha256=hashlib.sha256(data).hexdigest(),source='https://polyhaven.com/a/'+name,license='CC0-1.0')
with ThreadPoolExecutor(max_workers=4)as pool:records=list(pool.map(fetch,jobs))
(DEST/'sources-v3.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps(dict(files=len(records),bytes=sum(r['bytes']for r in records))))
