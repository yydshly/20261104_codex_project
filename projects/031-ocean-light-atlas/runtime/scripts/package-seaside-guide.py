"""Package only the explicit, portable character deliverables."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, hashlib

root=Path(__file__).resolve().parents[1]
files=[
 'glasshouse/assets/guide/guide-hoodie.glb',
 'glasshouse/assets/guide/guide-linen.glb',
 'glasshouse/assets/guide/guide-knit.glb',
 'glasshouse/assets/guide/manifest.json',
 'glasshouse/assets/guide/validation.json',
 'glasshouse/assets/guide/import-validation.json',
 'glasshouse/character/seaside-guide.blend',
 'glasshouse/character/build-guide.py',
 'glasshouse/character/verify-guide.mjs',
 'glasshouse/character/verify-import.py',
 'glasshouse/character/README.md',
 'glasshouse/character/SOURCES.txt',
 'glasshouse/character/reference.png',
 'glasshouse/character/guide-fullbody.png',
 'glasshouse/character/guide-face.png',
 'glasshouse/character/source/adult-base.glb',
 'glasshouse/character/source/ual1-official.glb',
]
for relative in files:
 if not (root/relative).is_file():raise FileNotFoundError(relative)
report=json.loads((root/'glasshouse/assets/guide/import-validation.json').read_text(encoding='utf-8'))
if not report.get('passed'):raise ValueError('Fresh Blender import validation must pass before packaging')
archive=root/'deliverables/seaside-guide-kit.zip'
with ZipFile(archive,'w',ZIP_DEFLATED,compresslevel=6) as bundle:
 for relative in files:bundle.write(root/relative,relative)
with ZipFile(archive) as bundle:
 assert bundle.testzip() is None
 assert len(bundle.namelist())==len(files)
print(json.dumps({'file':str(archive),'files':len(files),'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()}))
