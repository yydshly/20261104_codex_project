"""Check publication identities, usable links and public metadata."""
import hashlib,json,re,subprocess
from pathlib import Path
from urllib.parse import unquote,urlsplit

ROOT=Path(__file__).resolve().parents[2]
PROJECT=ROOT/'docs/027-surreal-motion-study'
m=json.loads((PROJECT/'publication-manifest.json').read_text('utf-8'))
paths={f['path'] for f in m['files']}
assert len(paths)==len(m['files'])
for f in m['files']:
    raw=(PROJECT/f['path']).read_bytes()
    assert len(raw)==f['bytes'],f['path']
    assert hashlib.sha256(raw).hexdigest()==f['sha256'],f['path']
    assert len(raw)<100*1024*1024,f['path']
    assert not f['path'].endswith(('.log','.m3u8','.ts'))
assert hashlib.sha256((PROJECT/m['guide']['path']).read_bytes()).hexdigest()==m['guide']['sourceSha256']=='b7e03c4bd7e1806a66f999099c615f514819c7bac29d4fb4af5f6716c2c0c9dc'
missing=[]; links=0; jsons=0; scripts=0
for f in PROJECT.rglob('*'):
    if f.suffix not in {'.html','.js','.css','.json'}: continue
    text=f.read_text('utf-8')
    if f.suffix=='.json':
        json.loads(text);jsons+=1
        assert not re.search(r'"(?:balanceBefore|loginAttempt|account|authorizationUrl|accessToken|secretAccessKey)"\s*:',text),f.name
    if f.suffix=='.js':
        r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
        assert r.returncode==0,(f.name,r.stderr);scripts+=1
    if f.parent==PROJECT and f.suffix in {'.html','.js','.css'}:
        candidates=re.findall(r'''["'`](assets/[^"'`\s<>]+|exports/[^"'`\s<>]+|reference/[^"'`\s<>]+)["'`]''',text)
        if f.suffix=='.html': candidates+=re.findall(r'(?:src|href|poster)="([^"$]+)"',text)
        for value in candidates:
            if '${' in value or re.match(r'(?:https?:|#|\.\./)',value):continue
            value=unquote(urlsplit(value).path)
            if not value:continue
            links+=1
            if not (PROJECT/value).exists():missing.append((f.name,value))
assert not missing,missing
assert not (PROJECT/'assets/dance-video/chatart-20261114/video_20261114181228.mp4').exists()
assert not (PROJECT/'exports/style-worlds-16-20261114.zip').exists()
html=(PROJECT/'index.html').read_text('utf-8')
assert 'og:image' in html and m['guide']['path'] in html and 'publication-intro.js' in html
intro=(PROJECT/'publication-intro.js').read_text('utf-8')
for s in ['关系词典','可变参数','执行材料','验收方法','证据分层','失败边界','HDR','曝光','40项','稳定生成']:
    assert s in intro,s
readme=(ROOT/'projects/027-surreal-motion-study/README.md').read_text('utf-8')
for s in ['光色与氛围','反向思维与规则','空间与构图','主体动作与情绪','相机与观看路径','时间、音乐与节律','世界一致性']:
    assert s in readme,s
assert '| 027 |' in (ROOT/'README.md').read_text('utf-8')
assert 'surreal-motion-overview' in (ROOT/'docs/index.html').read_text('utf-8')
report={'status':'passed','files':len(paths),'hashes':len(paths),'localReferences':links,'jsons':jsons,'scriptsSyntaxChecked':scripts,'guideUnchanged':True,'scope':'Publication integrity and complete summary. Not new visual acceptance, HDR display validation, precise audio sync or product success.'}
print(json.dumps(report,ensure_ascii=False))
(Path(__file__).parent/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
