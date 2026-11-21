"""Publish the existing study; preserve guide and runtime binary assets.

Initial import: python publish.py --import-local --source <existing project> --guide <existing jpg>
Rebuild landing and public runtime: python publish.py
"""
from pathlib import Path
import argparse
import hashlib
import json
import posixpath
import re
from urllib.parse import unquote, urlsplit

P = Path(__file__).resolve().parent
ROOT = P.parent.parent
META = json.loads((P / 'publication.json').read_text(encoding='utf-8'))
RUNTIME = P / 'runtime'
OUT = ROOT / 'docs' / META['slug']
RAW = f'https://raw.githubusercontent.com/{META["repository"]}/main/projects/{META["slug"]}/runtime/'
TEXT = {'.js', '.mjs', '.css', '.html', '.md', '.txt', '.json', '.svg', '.py', '.ps1'}
MEDIA = {'.glb', '.gltf', '.bin', '.hdr', '.png', '.jpg', '.jpeg', '.webp', '.mp3', '.ogg', '.wav', '.mp4', '.webm'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data.encode('utf-8') if isinstance(data, str) else data)


def sanitize(value):
    if isinstance(value, dict):
        return {k: sanitize(v) for k, v in value.items()
                if k.lower() not in {'authorization', 'api_key', 'apikey', 'access_token', 'generatedpath', 'output_hint'}}
    if isinstance(value, list):
        return [sanitize(v) for v in value]
    if isinstance(value, str) and re.match(r'^[A-Za-z]:[\\/]', value):
        return '[local production path omitted]'
    return value


def read_source(file):
    data = file.read_bytes()
    if file.suffix.lower() == '.json':
        data = (json.dumps(sanitize(json.loads(data.decode('utf-8-sig'))), ensure_ascii=False, indent=2) + '\n').encode()
    elif file.suffix.lower() in TEXT:
        text = data.decode('utf-8-sig').replace('\r\n', '\n')
        # Metadata prose can contain workstation paths; do not change runtime code.
        if file.suffix.lower() in {'.md', '.txt'}:
            text = re.sub(r'(?<![A-Za-z0-9_])[A-Za-z]:[\\/][^\s`<>"\u3002]+', '[local production path omitted]', text)
        data = (text.rstrip('\n') + '\n').encode()
    return data


def links(text, suffix):
    if suffix == '.html':
        return re.findall(r'(?:href|src|poster)=[\"\x27]([^\"\x27]+)', text)
    if suffix == '.md':
        return re.findall(r'!?\[[^\]]*\]\(([^\s)]+)', text)
    return []


def import_local(source, guide):
    assert source.is_dir() and guide.is_file()
    selected = {f for f in source.iterdir() if f.is_file() and f.suffix.lower() in TEXT}
    selected.update(f for f in (source / 'vendor').rglob('*') if f.is_file())
    selected.update(source / name for name in ['docs/pond-emotion-review-20261115.jpg',
                                               'docs/seat-contact-review/08-native-reading.png',
                                               'docs/self-acceptance-focus/15-final-relaxed-side.png'])
    for f in (source / 'assets').rglob('*'):
        if not f.is_file() or f.suffix.lower() not in TEXT | MEDIA:
            continue
        if f.name.endswith('-inspect.gltf'):
            continue  # transient inspection headers, not runnable asset packages
        parts = f.relative_to(source).parts
        if 'source' in parts and f.suffix.lower() not in {'.json', '.md', '.txt'}:
            continue
        if any(part.startswith('.') for part in parts):
            continue
        selected.add(f)
    for f in (source / 'scripts').iterdir():
        if f.is_file() and (f.name.startswith(('verify-', 'audit-', 'bake-seat-', 'bake-reading-', 'fetch-reading-'))
                           or f.name in {'reading-motion-fixture.mjs', 'reading-review-server.mjs'}):
            selected.add(f)
    # Follow actual document links; do not publish unreferenced recordings or working inputs.
    pending = [f for f in selected if f.suffix in {'.html', '.md'}]
    visited = set()
    while pending:
        f = pending.pop()
        if f in visited:
            continue
        visited.add(f)
        for ref in links(f.read_text(encoding='utf-8-sig'), f.suffix):
            u = urlsplit(ref)
            if u.scheme or u.netloc or not u.path:
                continue
            target = (f.parent / unquote(u.path)).resolve()
            if not target.is_relative_to(source) or not target.is_file() or target.suffix.lower() not in TEXT | MEDIA:
                continue
            if target not in selected:
                selected.add(target)
                if target.suffix in {'.html', '.md'}:
                    pending.append(target)
    for f in sorted(selected):
        assert not f.is_symlink() and f.stat().st_size < 100 * 1024 * 1024, f
        write(RUNTIME / f.relative_to(source), read_source(f))
    # The source package's optional QA command is not part of static serving.
    package = json.loads((RUNTIME / 'package.json').read_text(encoding='utf-8'))
    package['scripts'].pop('review', None)
    write(RUNTIME / 'package.json', json.dumps(package, ensure_ascii=False, indent=2) + '\n')
    guide_data = guide.read_bytes()
    write(OUT / META['guide'], guide_data)
    provenance = {'date': META['published'], 'kind': META['guideKind'], 'sha256': sha(guide_data),
                  'dimensions': [2560, 2452], 'unchanged': True, 'newGeneration': False}
    write(P / 'guide-provenance.json', json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'importedFiles': len(selected), 'runtimeMiB': round(sum(f.stat().st_size for f in RUNTIME.rglob('*') if f.is_file())/1048576, 1)}))


def public_text(relative, text, remote):
    # Dynamic texture/model prefixes keep their structure, with a public repository asset base.
    text = re.sub(r'([\"\x27`(])(?:\./)?assets/', lambda m: m[1] + RAW + 'assets/', text)
    base = posixpath.dirname(relative)
    for remote_path in remote:
        if remote_path.startswith('assets/'):
            continue
        form = posixpath.relpath(remote_path, base or '.')
        pattern = r'([\"\x27(])(?:\./)?' + re.escape(form) + r'(?=[\"\x27)])'
        text = re.sub(pattern, lambda m: m[1] + RAW + remote_path, text)
    return text


def build():
    assert RUNTIME.is_dir(), 'Initial build requires --import-local, --source and --guide.'
    files = sorted(f for f in RUNTIME.rglob('*') if f.is_file())
    remote = {f.relative_to(RUNTIME).as_posix() for f in files
              if f.relative_to(RUNTIME).parts[0] == 'assets'
              or f.suffix.lower() in {'.mp4', '.webm'} and f.stat().st_size > 3 * 1024 * 1024}
    records = []
    for f in files:
        relative = f.relative_to(RUNTIME).as_posix()
        data = f.read_bytes()
        if relative in remote:
            delivery, target = 'repository-raw', RAW + relative
        else:
            if f.suffix in TEXT:
                data = public_text(relative, data.decode('utf-8-sig'), remote).encode()
            write(OUT / 'demo' / relative, data)
            delivery, target = 'pages', 'demo/' + relative
        records.append({'path': relative, 'delivery': delivery, 'target': target, 'bytes': len(data), 'sha256': sha(data)})
    for f in (P / 'web').iterdir():
        if f.is_file():
            data = f.read_text(encoding='utf-8')
            if f.name == 'index.html':
                data = data.replace('__RECORDING__', RAW + 'docs/seat-contact-review/experience.mp4')
                css = (P / 'web/research.css').read_bytes()
                data = data.replace('href="research.css"', 'href="research.css?v=' + sha(css)[:12] + '"')
            write(OUT / f.name, data)
    for source, name in [('docs/pond-emotion-review-20261115.jpg', 'pond.jpg'),
                         ('docs/seat-contact-review/08-native-reading.png', 'reading.png'),
                         ('docs/self-acceptance-focus/15-final-relaxed-side.png', 'terrace.png')]:
        write(OUT / 'media' / name, (RUNTIME / source).read_bytes())
    provenance = json.loads((P / 'guide-provenance.json').read_text(encoding='utf-8'))
    assert sha((OUT / META['guide']).read_bytes()) == provenance['sha256'], 'Guide must remain unchanged'
    write(OUT / 'guide-provenance.json', json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
    write(OUT / 'README.md', (P / 'README.md').read_bytes())
    write(OUT / '.nojekyll', b'')
    attrs = '* text=auto eol=lf\n*.glb binary\n*.bin binary\n*.hdr binary\n*.png binary\n*.jpg binary\n*.mp3 binary\n*.wav binary\n*.ogg binary\n*.mp4 binary\n*.webm binary\n'
    write(P / '.gitattributes', attrs)
    write(OUT / '.gitattributes', attrs)
    manifest = {'date': META['published'], 'site': META['site'], 'guide': provenance,
                'adaptations': ['Curated existing runtime; no new media generation',
                                'Asset URL prefixes point to same-repository raw files',
                                'Private local production paths and credential-shaped JSON fields omitted',
                                'Historical evidence is dated separately from publication verification'],
                'runtimeFiles': records}
    write(OUT / 'publication-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    write(P / 'publication-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'runtimeFiles': len(files), 'rawAssets': len(remote),
                      'pagesMiB': round(sum(f.stat().st_size for f in OUT.rglob('*') if f.is_file())/1048576, 1),
                      'guideUnchanged': True}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--import-local', action='store_true')
    parser.add_argument('--source', type=Path)
    parser.add_argument('--guide', type=Path)
    args = parser.parse_args()
    if args.import_local:
        assert args.source and args.guide
        import_local(args.source.resolve(), args.guide.resolve())
    build()
