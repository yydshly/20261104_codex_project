from pathlib import Path
import hashlib
import json
import re
import shutil

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SOURCE = ROOT / 'warm-home-walkthrough'
DEST = ROOT / 'docs' / HERE.name
GUIDE_HASH = 'c4409f7279cc5b5a1dae142a1781062cafbd8545cd8808e6346ea5cae0da49af'
FILES = {}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def sanitize(value):
    if isinstance(value, dict):
        return {k: sanitize(v) for k, v in value.items() if k not in {'generatedPath', 'output_hint'}}
    if isinstance(value, list):
        return [sanitize(v) for v in value]
    if isinstance(value, str) and re.match(r'^[A-Za-z]:[\\/]', value):
        return '[local path omitted]'
    return value

def write(relative, data):
    # Match GitHub Pages bytes when Git normalizes text on this Windows checkout.
    if Path(relative).suffix.lower() in {'.js', '.mjs', '.css', '.html', '.md', '.txt', '.json', '.gltf'}:
        data = data.replace(b'\r\n', b'\n')
        if not relative.startswith('demo/vendor/'):
            data = data.rstrip(b'\n') + b'\n'
    target = DEST / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    FILES[relative] = {'path': relative, 'bytes': len(data), 'sha256': digest(data)}

def copy(source, relative):
    assert source.is_file() and not source.is_symlink(), source
    data = source.read_bytes()
    if source.suffix == '.json':
        data = (json.dumps(sanitize(json.loads(data.decode('utf-8-sig'))), ensure_ascii=False, indent=2) + '\n').encode()
    write(relative, data)

def copy_tree(source, target, allowed=None):
    for file in sorted(source.rglob('*')):
        if file.is_file() and not any(p.startswith('.') for p in file.relative_to(source).parts):
            if allowed and file.suffix.lower() not in allowed:
                continue
            copy(file, target + '/' + file.relative_to(source).as_posix())

DEST.mkdir(parents=True, exist_ok=True)
for file in (HERE / 'web').iterdir():
    if file.is_file():
        copy(file, file.name)
copy(HERE / 'README.md', 'README.md')

media = {
    'docs/ai-interior-workflow-v2.png': 'media/ai-interior-workflow-v2.png',
    'assets/reference.png': 'media/reference.png',
    'verification/interior-stable-v13.jpg': 'media/living-original.jpg',
    'preview-v14.jpg': 'media/balcony-original.jpg',
}
for source, target in media.items():
    copy(SOURCE / source, target)
assert digest((DEST / 'media/ai-interior-workflow-v2.png').read_bytes()) == GUIDE_HASH

modules = set()
def add_module(name):
    if name in modules:
        return
    modules.add(name)
    text = (SOURCE / name).read_text(encoding='utf-8')
    for child in re.findall(r"(?:from\s*|import\s*)['\"](\./[^'\"]+\.js)['\"]", text):
        add_module((Path(name).parent / child).as_posix())
add_module('app.js')
for name in sorted(modules):
    copy(SOURCE / name, 'demo/' + name)
for file in SOURCE.glob('*.test.js'):
    copy(file, 'demo/' + file.name)
copy(SOURCE / 'style.css', 'demo/style.css')
copy_tree(SOURCE / 'vendor', 'demo/vendor')

for file in (SOURCE / 'assets').iterdir():
    if file.is_file() and file.suffix.lower() in {'.jpg', '.png'}:
        copy(file, 'demo/assets/' + file.name)
copy_tree(SOURCE / 'assets/v2', 'demo/assets/v2', {'.jpg', '.png', '.hdr', '.gltf', '.bin', '.txt', '.md'})
copy_tree(SOURCE / 'assets/v5', 'demo/assets/v5', {'.glb', '.txt', '.md'})
for suffix in ['Color', 'NormalGL', 'Roughness', 'Displacement']:
    name = 'assets/v7/Carpet014/Carpet014_2K-JPG_' + suffix + '.jpg'
    copy(SOURCE / name, 'demo/' + name)
for name in ['aerial_grass_rock', 'pavement_03']:
    for kind in ['diff', 'nor_gl']:
        relative = f'assets/v9/{name}/{name}_{kind}_1k.jpg'
        copy(SOURCE / relative, 'demo/' + relative)
copy_tree(SOURCE / 'assets/v11', 'demo/assets/v11', {'.png', '.gltf', '.bin', '.txt', '.md', '.json'})

# External buffers and textures used by the shipped glTFs are the authority.
def add_gltf_dependencies(relative):
    gltf = json.loads((SOURCE / relative).read_text(encoding='utf-8-sig'))
    for item in gltf.get('buffers', []) + gltf.get('images', []):
        uri = item.get('uri', '')
        if not uri or uri.startswith('data:'):
            continue
        asset = (SOURCE / relative).parent.joinpath(uri).resolve()
        assert asset.is_relative_to(SOURCE), asset
        key = 'demo/' + asset.relative_to(SOURCE).as_posix()
        if key not in FILES:
            copy(asset, key)
for published in list(FILES):
    if published.startswith('demo/') and published.endswith('.gltf'):
        add_gltf_dependencies(published.removeprefix('demo/'))
for version in ['v2', 'v5', 'v7', 'v9', 'v11']:
    source = SOURCE / 'assets' / version / 'sources.json'
    if source.exists():
        copy(source, f'demo/assets/{version}/sources.json')

demo = (SOURCE / 'index.html').read_text(encoding='utf-8')
demo = demo.replace('<nav class="tools" aria-label="场景工具">', '<nav class="tools" aria-label="场景工具"><a class="research-return" href="../" style="font-size:11px;padding:10px;color:inherit;white-space:nowrap">研究说明 ↗</a>')
demo = demo.replace('</head>', '<meta name="description" content="参考图驱动的单套3D装修原型，可从入户门经玄关与客厅走到阳台，操作门、电视和昼夜；尚未接入户型自动生成。">\n</head>')
write('demo/index.html', demo.encode())
package = json.loads((SOURCE / 'package.json').read_text())
checks = ['node --check ' + m for m in sorted(modules)]
checks.append('node --test ' + ' '.join(p.name for p in sorted(SOURCE.glob('*.test.js'))))
package['scripts'] = {'check': ' && '.join(checks)}
write('demo/package.json', (json.dumps(package, ensure_ascii=False, indent=2) + '\n').encode())

for name in ['design-qa.md', 'docs/ai-interior-workflow-v2.prompt.txt']:
    copy(SOURCE / name, 'materials/' + Path(name).name)
for name in ['soak-results-v14.json', 'recovery-test-results-v13.json', 'normal-flow-results-v13.json', 'final-delivery-v14.json']:
    copy(SOURCE / 'verification' / name, 'materials/' + name)
for name in ['build-canopy-models.mjs', 'download-exterior.py', 'optimize-tree.mjs']:
    if (SOURCE / 'tools' / name).exists():
        copy(SOURCE / 'tools' / name, 'materials/tools/' + name)
credits = '''# 素材与来源\n\n- [Three.js MIT许可](../demo/vendor/THREE-LICENSE.txt)：运行时0.187.0，保留全部本机已使用的vendor目录。\n- [Poly Haven室内资源](../demo/assets/v2/sources.json)：CC0贴图、HDR与盆栽。\n- [家具来源](../demo/assets/v5/sources.json)：CC0沙发和电视。\n- [地毯来源](../demo/assets/v7/sources.json)：ambientCG Carpet014，CC0。\n- [原庭院资源记录](../demo/assets/v9/sources.json)：本次保留使用中的草地、铺装和树皮贴图，旧树几何不再发布。\n- [现用树形来源](../demo/assets/v11/sources.json)：EZ-Tree 1.1.0，MIT；[许可](../demo/assets/v11/EZ-Tree-LICENSE.txt)。\n\n来源JSON保留制作时记录的完整范围，其中旧几何、压缩包和中间文件不一定属于本次公开包；实际文件以publication-manifest.json为准。\n\nmaterials/tools为本地研发脚本，依赖制作时安装的额外工具与阶段输入；公开原型直接使用已导出的模型，不要求运行这些脚本。当前研究页不接入线上AI服务，后续素材采购、生成和跨户型规划路线尚未执行。\n'''
write('materials/ASSET-SOURCES.md', credits.encode())
write('.gitattributes', b'* text=auto eol=lf\n*.png binary\n*.jpg binary\n*.glb binary\n*.bin binary\n*.hdr binary\n')
write('.nojekyll', b'')
manifest = {
    'published': '2026-11-21', 'slug': HERE.name,
    'scope': 'Research understanding, one reference-image-based walkthrough, existing guide and historical acceptance. Cross-floorplan automatic generation and business benefits are unverified.',
    'guide': {'path': 'media/ai-interior-workflow-v2.png', 'sourceSha256': GUIDE_HASH, 'publishedSha256': GUIDE_HASH, 'unchanged': True},
    'runtimeModules': sorted(modules), 'files': sorted(FILES.values(), key=lambda x: x['path']),
}
(DEST / 'publication-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'directory': str(DEST), 'files': len(FILES), 'megabytes': round(sum(f['bytes'] for f in FILES.values())/1048576, 1), 'runtimeModules': len(modules), 'guideUnchanged': True}, ensure_ascii=False))
