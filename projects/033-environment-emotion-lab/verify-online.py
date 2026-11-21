"""Verify deployed HTTP resources and the unchanged guide; no application credentials."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import Request, urlopen
import hashlib
import json

P=Path(__file__).resolve().parent
META=json.loads((P/'publication.json').read_text(encoding='utf-8'))
SITE=META['site']
RAW=f'https://raw.githubusercontent.com/{META["repository"]}/main/projects/{META["slug"]}/runtime/'


def check(item):
    name,url,full=item
    with urlopen(Request(url,headers={'User-Agent':'EnvironmentEmotionPublicationCheck/1.0'}),timeout=45) as response:
        data=response.read() if full else response.read(4096)
        result={'name':name,'url':url,'status':response.status,'contentType':response.headers.get('Content-Type'),
                'contentLength':response.headers.get('Content-Length'),'cors':response.headers.get('Access-Control-Allow-Origin'),
                'bytesRead':len(data)}
        assert response.status==200,(name,response.status)
        if name=='guide':
            result['sha256']=hashlib.sha256(data).hexdigest()
            assert result['sha256']==json.loads((P/'guide-provenance.json').read_text(encoding='utf-8'))['sha256']
        if name=='research':assert '环境构造情绪'.encode() in data and '033 /'.encode() in data
        if name.endswith('GLB'):assert data[:4]==b'glTF'
        return result


items=[('research',SITE,True),('guide',SITE+META['guide'],True),
       ('css',SITE+'research.css',False),('reading',SITE+'demo/reading.html',False),
       ('notes',SITE+'demo/reading-notes.html',False),('pond',SITE+'demo/index.html',False),
       ('character GLB',RAW+'assets/reading/companion/companion.glb',False),
       ('motions GLB',RAW+'assets/reading/motions/reading-mocap.glb',False),
       ('tree GLB',RAW+'assets/reading/garden/island-tree-complete.glb',False),
       ('duck GLB',RAW+'assets/models/duck-v5/mallard-preview.glb',False),
       ('chair glTF',RAW+'assets/reading/mid_century_lounge_chair/mid_century_lounge_chair_2k.gltf',False),
       ('rain recording',RAW+'assets/reading/audio/rain-leaves.ogg',False),
       ('MiniMax narration',RAW+'assets/reading/audio/reading-1.mp3',False),
       ('historical video',RAW+'docs/seat-contact-review/experience.mp4',False)]
with ThreadPoolExecutor(max_workers=5) as pool:
    results=list(pool.map(check,items))
report={'date':META['published'],'site':SITE,'checks':results,'guideUnchanged':True,
        'scope':'HTTP, MIME/header, asset signature and guide hash checks; browser rendering recorded separately.'}
(P/'verification-online.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'resourcesChecked':len(results),'all200':True,'guideUnchanged':True},ensure_ascii=False))
