import concurrent.futures, hashlib, json, pathlib, urllib.request

root = pathlib.Path(__file__).resolve().parents[1]
asset_root = root / 'assets/v9'
tree = json.loads((asset_root / 'island-tree-files.json').read_text())['gltf']['1k']['gltf']
items = [('island_tree_01/island_tree_01_1k.gltf', tree)]
items += [('island_tree_01/' + name, item) for name, item in tree['include'].items()]
for asset in ['aerial_grass_rock', 'pavement_03']:
    metadata = json.loads((asset_root / (asset + '-files.json')).read_text())
    for channel in ['Diffuse', 'nor_gl', 'Rough']:
        item = metadata[channel]['1k']['jpg']
        items.append((asset + '/' + item['url'].rsplit('/', 1)[1], item))

def download(entry):
    name, item = entry
    target = asset_root / name
    target.parent.mkdir(parents=True, exist_ok=True)
    data = target.read_bytes() if target.exists() else b''
    if hashlib.md5(data).hexdigest() != item['md5']:
        with urllib.request.urlopen(item['url'], timeout=120) as response:
            data = response.read()
        if hashlib.md5(data).hexdigest() != item['md5']:
            raise ValueError('Checksum mismatch: ' + name)
        target.write_bytes(data)
    return {'file': 'assets/v9/' + name, 'url': item['url'], 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    records = list(pool.map(download, items))
(asset_root / 'sources.json').write_text(json.dumps({
    'provider': 'Poly Haven', 'license': 'CC0 1.0', 'license_url': 'https://polyhaven.com/license',
    'assets': ['https://polyhaven.com/a/' + x for x in ['island_tree_01', 'aerial_grass_rock', 'pavement_03']],
    'files': records
}, indent=2), encoding='utf8')
print('Verified', len(records), 'files,', sum(x['bytes'] for x in records), 'bytes')
