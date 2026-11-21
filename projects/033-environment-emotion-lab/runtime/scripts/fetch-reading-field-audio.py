"""Fetch public CC0 audition files from their author's pages, retain provenance."""
from pathlib import Path
import json,re,html,urllib.request,urllib.parse,hashlib,shutil
ROOT=Path(__file__).resolve().parents[1];DEST=ROOT/'assets/reading/audio';RAW=DEST/'raw';RAW.mkdir(parents=True,exist_ok=True)
def fetch(url):
    assert urllib.parse.urlparse(url).hostname in ['freesound.org','cdn.freesound.org']
    with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 ReadingRoom/4.0'}),timeout=90)as response:return response.read()
records=[]
# The author's page and CC0 status were verified in the browser/web source.
for name,author,id,title,url in [('rain-leaves','SamsterBirdies',584272,'Rain on leaves','https://cdn.freesound.org/previews/584/584272_5487341-hq.mp3')]:
    page=f'https://freesound.org/people/{author}/sounds/{id}/'
    data=fetch(url);path=RAW/(name+'.mp3');path.write_bytes(data)
    records.append(dict(file=path.relative_to(ROOT).as_posix(),title=title,author=author,source=page,download=url,license='CC0-1.0',license_url='https://creativecommons.org/publicdomain/zero/1.0/',bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),type='Field recording; public high-quality audition'))
wind=ROOT.parent/'earth-within/assets/audio/wind.ogg';target=RAW/'woodland-wind.ogg';shutil.copy2(wind,target)
records.append(dict(file=target.relative_to(ROOT).as_posix(),title='WIND - 1',author='SamuelGremaud',source='https://freesound.org/people/SamuelGremaud/sounds/547472/',license='CC0-1.0',bytes=target.stat().st_size,sha256=hashlib.sha256(target.read_bytes()).hexdigest(),type='Existing project copy of field recording; see earth-within/assets/audio/SOURCES.md'))
(DEST/'field-sources.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(json.dumps([dict(file=r['file'],bytes=r['bytes'])for r in records]))
