"""Fetch only selected official Rocketbox FBX files, with provenance and hashes."""
import hashlib, json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets/reading/motions/source'
NAMES = [
    'm_sit_chair_breathe_01.max.fbx', 'm_sit_chair_idle_relaxed_01.max.fbx',
    'm_sit_chair_idle_neutral_01.max.fbx', 'm_sit_chair_idle_look_around.max.fbx',
    'm_documents_take.max.fbx', 'm_documents_in.max.fbx',
    'm_documents_idle.max.fbx', 'm_documents_check.max.fbx', 'm_documents_out.max.fbx',
]
DEST.mkdir(parents=True, exist_ok=True)
records = []
for name in NAMES:
    url = 'https://raw.githubusercontent.com/microsoft/Microsoft-Rocketbox/master/Assets/Animations/all_animations_max_motextr_static/' + name
    path = DEST / name
    if not path.exists():
        with urllib.request.urlopen(url, timeout=90) as response:
            data = response.read()
        if not data.startswith(b'Kaydara FBX Binary'):
            raise RuntimeError('Unexpected source format: ' + name)
        path.write_bytes(data)
    records.append(dict(file=name, url=url, bytes=path.stat().st_size,
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
    print(name, path.stat().st_size, flush=True)
(DEST / 'sources.json').write_text(json.dumps(dict(source='Microsoft/Rocketbox',
    license='MIT', records=records), indent=2), encoding='utf-8')
