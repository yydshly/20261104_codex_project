"""Curate the existing local study and build a portable GitHub Pages publication.

python publish.py --import-local  # first import / explicit refresh
python publish.py                 # rebuild from the committed runtime snapshot

No generation, package installation, frozen-file edits, or directory deletion.
Large optional assets stay in the repository and are requested through its raw URL.
"""
from pathlib import Path
import argparse
import hashlib
import html
import json
import re
import shutil
import posixpath
import os

P = Path(__file__).resolve().parent
ROOT = P.parent.parent
META = json.loads((P / 'publication.json').read_text(encoding='utf-8'))
SLUG = META['slug']
RUNTIME = P / 'runtime'
OUT = ROOT / 'docs' / SLUG
RAW = f'https://raw.githubusercontent.com/{META["repository"]}/main/projects/{SLUG}/runtime/'
TEXT = {'.html', '.js', '.mjs', '.css', '.json', '.md', '.txt', '.svg', '.py'}
FROZEN = 'glasshouse/releases/4.3-20261115/'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(data, str):
        path.write_text(data, encoding='utf-8', newline='\n')
    else:
        path.write_bytes(data)


def load_local():
    source = Path(os.environ.get('OCEAN_LOCAL_SOURCE', str(ROOT / 'ocean-light-atlas')))
    selected = set()
    for directory in [source, source / 'glasshouse', source / 'scripts', source / 'tests']:
        selected.update(f for f in directory.iterdir() if f.is_file() and f.suffix in TEXT and f.name != 'AGENTS.md')
    for directory in [source / 'assets', source / 'glasshouse/assets']:
        for f in directory.rglob('*'):
            if not f.is_file():
                continue
            rel = f.relative_to(source).as_posix()
            if '/assets/reality/' in '/' + rel and f.suffix in {'.mp4', '.m4v', '.webm'}:
                continue  # local educational copies are not a distributed asset pack
            if 'rocketbox' in f.relative_to(directory).parts:
                if f.parent.name != 'rocketbox' or f.suffix != '.png':
                    continue  # keep only candidate preview images, not FBX inputs
            if f.suffix in TEXT | {'.glb', '.png', '.jpg', '.webp', '.mp3', '.wav', '.ogg'}:
                selected.add(f)
    selected.update(f for f in (source / 'glasshouse/releases/4.3-20261115').rglob('*') if f.is_file())
    selected.update(f for f in (source / 'glasshouse/character').glob('*') if f.is_file() and f.suffix in TEXT | {'.png'})
    # Explicit metadata and licenses needed to understand optional local input files.
    for f in (source / 'glasshouse/character').rglob('*'):
        if f.is_file() and f.suffix in {'.json', '.md', '.txt'}:
            selected.add(f)
    for f in list(selected):
        if f.suffix not in TEXT:
            continue
        text = f.read_text(encoding='utf-8-sig')
        for relative in re.findall(r'(screenshots/[A-Za-z0-9_./-]+\.(?:png|jpg|mp4|webm|json))', text):
            candidate = source / relative
            if candidate.is_file():
                selected.add(candidate)
    selected.update(f for f in (source / 'screenshots').glob('character-preview-*') if f.is_file())
    selected.update(f for f in (source / 'output/research-summary-20261121').iterdir() if f.is_file())
    for f in sorted(selected):
        assert f.stat().st_size < 100 * 1024 * 1024, f'GitHub file limit: {f}'
        write(RUNTIME / f.relative_to(source), f.read_bytes())
    guide = (source / 'output/research-summary-20261121/ocean-research-summary-20261121.png').read_bytes()
    write(P / META['guide'], guide)
    write(P / META['guidePrompt'], (source / 'output/research-summary-20261121/prompt.txt').read_bytes())
    write(P / 'assets/guide-provenance.json', (source / 'output/research-summary-20261121/manifest.json').read_bytes())
    print(f'Curated {len(selected)} existing files; no local USF video copies or Blender/FBX working files imported.')


def public_text(relative, text, remote):
    # Unmodified 4.3 is handled separately. These adaptations only affect public copies.
    if relative.startswith('glasshouse/'):
        for folder in ['guide', 'personal-guide', 'rocket-guide', 'hero-candidates', 'hero', 'user-model-0597']:
            text = text.replace(f'./assets/{folder}/', RAW + f'glasshouse/assets/{folder}/')
    if relative == 'reality-video-sources.js':
        def externalize(match):
            block = match.group(0)
            media = re.search(r"mediaUrl:\s*'([^']+)'", block)
            return re.sub(r"localFile:\s*'[^']+'", f"localFile: '{media[1]}'", block) if media else block
        text = re.sub(r'\{\s*id:[\s\S]*?\n  \}', externalize, text)
        text = text.replace('本地 USF 视频仅供本项目非商业教育研究对照', '公开版通过机构媒体链接进行非商业教育研究对照；本地视频副本未发布')
    # Rewrite literal references to large recordings in history/review pages.
    base = posixpath.dirname(relative)
    for path in remote:
        forms = {posixpath.relpath(path, base or '.'), './' + posixpath.relpath(path, base or '.')}
        for form in sorted(forms, key=len, reverse=True):
            text = re.sub(r'(?<=[\"\x27(])' + re.escape(form) + r'(?=[\"\x27)])', lambda _: RAW + path, text)
    return text


def build():
    assert RUNTIME.is_dir(), 'Run --import-local once before rebuilding.'
    files = [f for f in RUNTIME.rglob('*') if f.is_file()]
    remote = {f.relative_to(RUNTIME).as_posix() for f in files if not f.relative_to(RUNTIME).as_posix().startswith(FROZEN) and (f.suffix == '.glb' or f.stat().st_size > 3 * 1024 * 1024 and f.suffix in {'.mp4', '.webm'})}
    records = []
    for f in files:
        rel = f.relative_to(RUNTIME).as_posix()
        if rel in remote:
            records.append({'file': rel, 'delivery': 'repository-raw', 'bytes': f.stat().st_size, 'sha256': sha(f.read_bytes())})
            continue
        data = f.read_bytes()
        if f.suffix in TEXT and not rel.startswith(FROZEN):
            data = public_text(rel, data.decode('utf-8-sig'), remote).encode('utf-8')
        write(OUT / 'study' / rel, data)
        records.append({'file': rel, 'delivery': 'pages', 'bytes': len(data), 'sha256': sha(data)})
    for f in (P / 'assets').iterdir():
        if f.is_file():
            write(OUT / 'assets' / f.name, f.read_bytes())
    landing = (OUT / 'study/glasshouse/summary.html').read_text(encoding='utf-8')
    def relocate(match):
        prefix, value, quote = match.groups()
        if value.startswith(('#', 'https:', 'http:', 'data:', 'mailto:')):
            return match.group(0)
        return prefix + posixpath.normpath('study/glasshouse/' + value) + quote
    landing = re.sub(r'((?:href|src)=\")([^\"]+)(\")', relocate, landing)
    seo = f'<meta property="og:title" content="{html.escape(META["title"], quote=True)}"><meta property="og:description" content="{html.escape(META["summary"], quote=True)}"><meta property="og:image" content="{META["site"]}{META["guide"]}"><meta property="og:type" content="website"><link rel="canonical" href="{META["site"]}">'
    landing = landing.replace('</head>', seo + '</head>')
    landing = landing.replace('<a class="brand" href="study/index.html">↖ 海的切片</a>', '<a class="brand" href="../">↖ 研究总库</a>')
    landing = landing.replace('</main>', f'<p class="recap-test-note"><a href="https://github.com/{META["repository"]}/tree/main/projects/{SLUG}">完整研究摘要、来源与复用源码 ↗</a> · <a href="assets/guide-prompt.txt">引导图制作提示词</a></p></main>')
    write(OUT / 'index.html', landing)
    manifest = {'number': META['number'], 'site': META['site'], 'date': META['date'], 'guideSha256': sha((P / META['guide']).read_bytes()), 'guideUnchanged': True, 'frozenVersionUnchanged': True, 'publicationAdaptations': ['研究方向/价值摘要与原有引导图', '首页和总库索引', '大模型/历史大录屏由同库raw地址提供', '机构实拍使用原机构媒体地址，不发布本地副本', '完整模型制作工程与原始FBX留在本地'], 'files': records}
    write(OUT / 'publication-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    write(P / 'publication-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    pages_bytes = sum(f.stat().st_size for f in OUT.rglob('*') if f.is_file())
    print(json.dumps({'pagesFiles': len(list(OUT.rglob('*'))), 'pagesMiB': round(pages_bytes / 1048576, 1), 'rawAssets': len(remote), 'guideSha256': manifest['guideSha256']}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--import-local', action='store_true')
    args = parser.parse_args()
    if args.import_local:
        load_local()
    build()
