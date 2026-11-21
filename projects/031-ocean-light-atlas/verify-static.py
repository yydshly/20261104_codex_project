from pathlib import Path
import json
import hashlib
import re
import os

p = Path(__file__).resolve().parent
root = p.parent.parent
out = root / 'docs/031-ocean-light-atlas'
local = Path(os.environ.get('OCEAN_LOCAL_SOURCE', str(root / 'ocean-light-atlas')))
sha = lambda f: hashlib.sha256(f.read_bytes()).hexdigest()
guide = 'assets/ocean-research-summary-20261121.png'
assert sha(p / guide) == sha(out / guide) == sha(local / 'output/research-summary-20261121/ocean-research-summary-20261121.png')
fixed = 'glasshouse/releases/4.3-20261115'
files = [f for f in (local / fixed).rglob('*') if f.is_file()]
release = json.loads((local / fixed / 'release.json').read_text(encoding='utf-8'))
assert len(release['files']) == 53 and len(files) == 54  # inventory plus release.json itself
for f in files:
    relative = f.relative_to(local)
    assert sha(f) == sha(p / 'runtime' / relative) == sha(out / 'study' / relative), relative
assert not [f for f in (p / 'runtime/assets/reality').rglob('*') if f.suffix in ['.mp4', '.m4v', '.webm']]
src = (out / 'study/reality-video-sources.js').read_text(encoding='utf-8')
assert not re.search(r"localFile:\s*'assets/", src)
assert '#research' in (out / 'index.html').read_text(encoding='utf-8')
assert len(re.findall(r'^\| 031 \|', (root / 'README.md').read_text(encoding='utf-8'), re.M)) == 1
assert len(re.findall(r'<td>031</td>', (root / 'docs/index.html').read_text(encoding='utf-8'))) == 1
assert not [f for f in p.rglob('*') if f.is_file() and f.stat().st_size >= 100 * 1024 * 1024]
report = {'result': 'passed', 'originalGuideSha256': sha(p / guide), 'frozenInventoryFiles': 53, 'frozenFilesIncludingManifest': 54, 'frozenDirectoryUnchanged': True, 'localUSFClipsNotPublished': True, 'fullBriefAndIndexesPresent': True, 'noFilesOverGitHubLimit': True}
(p / 'verification').mkdir(exist_ok=True)
(p / 'verification/static.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
