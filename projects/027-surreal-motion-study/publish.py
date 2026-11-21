"""Create the static public research package without changing local originals."""
import argparse, hashlib, json, re, shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SLUG='027-surreal-motion-study'
SITE=f'https://yydshly.github.io/20261104_codex_project/{SLUG}/'
REPO=f'https://github.com/yydshly/20261104_codex_project/tree/main/docs/{SLUG}'
SUMMARY='从奇幻骑行原片提炼光色、反向规则、空间构图、主体情绪、相机、音乐节律和世界一致性七条主轴。以原创关键帧、十种效果、局部预演、一条用户通过的AI舞步和三个世界候选，沉淀关系、参数、提示词与验收方法；区分HDR与高曝光，连续3D、稳定生成与产品价值仍待验证。'
GUIDE='exports/research-map-20261121.png'
GUIDE_HASH='b7e03c4bd7e1806a66f999099c615f514819c7bac29d4fb4af5f6716c2c0c9dc'
PRIVATE={'account','balanceBefore','loginAttempt','approvalBlock','userAuthorization','queryRecovery','lastRemoteSnapshot','localOutputs','partialDownloads','attemptStartedAt','attemptFinishedAt','cliExitCode','output_hint','generatedPath'}

def sanitize(v):
    if isinstance(v,dict):
        return {k:sanitize(x) for k,x in v.items() if k not in PRIVATE and not re.search(r'credential|authorization.?url|access.?key|secret|session.?token|access.?token',k,re.I)}
    if isinstance(v,list): return [sanitize(x) for x in v]
    if isinstance(v,str):
        if re.match(r'^[A-Za-z]:[\\/]',v): return '[local path omitted]'
        return re.sub(r'(?<![\w/])[A-Za-z]:[\\/][^\s\u3000，。；）"<>]+','[local path omitted]',v)
    return v

def run(source):
    target=ROOT/'docs'/SLUG
    target.mkdir(parents=True,exist_ok=True)
    keep_video={'reference.mp4','dance-walk-original.mp4','dance-walk-playable.mp4','dance-walk-100bpm-local-v1.mp4','dance-walk-100bpm-local-v2.mp4','dance-walk-100bpm-portrait-v2.mp4','reflection-story-local-v1.mp4','sea-wall-mesh-v1.mp4','reflection-offset-v1.mp4','day-night-sweep-v1.mp4'}
    excluded=[]
    for f in sorted(source.rglob('*')):
        if not f.is_file() or f.is_symlink(): continue
        rel=f.relative_to(source).as_posix()
        if '__pycache__' in f.parts or f.name.startswith('.') or f.suffix in {'.log','.pyc','.m3u8','.ts'}: continue
        if rel.startswith('reference/') and f.suffix.lower() not in {'.json','.md','.txt'}: continue
        if rel=='reference/user-provided-article.txt' or rel=='AGENTS.md' or rel=='README.md': continue
        if rel.startswith('scripts/') and ('chatart' in f.name or f.suffix!='.py'): continue
        if f.suffix=='.mp4' and f.name not in keep_video: excluded.append(rel); continue
        if rel=='exports/style-worlds-16-20261114.zip': excluded.append(rel); continue
        if f.suffix not in {'.html','.js','.css','.json','.md','.txt','.py','.png','.jpg','.jpeg','.webp','.svg','.mp4','.mp3','.wav','.gif','.zip'}: continue
        to=target/rel
        to.parent.mkdir(parents=True,exist_ok=True)
        raw=f.read_bytes()
        if f.suffix in {'.html','.js','.css','.json','.md','.txt','.py'}:
            text=raw.decode('utf-8-sig').replace('\r\n','\n')
            if f.suffix=='.json':
                text=json.dumps(sanitize(json.loads(text)),ensure_ascii=False,indent=2)+'\n'
            elif f.suffix=='.js' and re.search(r'window\.\w+\s*=\s*\{',text):
                match=re.search(r'(window\.\w+\s*=\s*)(\{[\s\S]*\});?\s*$',text)
                if match:
                    try: text=text[:match.start(2)]+json.dumps(sanitize(json.loads(match.group(2))),ensure_ascii=False,indent=2)+';\n'
                    except json.JSONDecodeError: pass
            text=text.replace('exports/style-worlds-16-20261114.zip',REPO+'/assets/style-worlds')
            if f.suffix=='.html': text=text.replace('reference/user-provided-article.txt','https://hi-personality-7-3zdk.pages.grok.bot/').replace('用户提供文章全文','用户提供文章链接')
            text=text.replace('下载16张原图与提示词 ZIP','查看16张原图与提示词目录').replace('下载16张原图 ZIP','查看16张原图目录').replace('打包下载 16 张原图与完整提示词','查看 16 张原图目录与提示词记录')
            if f.name=='dance-video-production.js':
                text=text.replace('表演、接地与音乐关系待评阅。','用户已确认当前舞步样本通过；精确BPM、足部接地与音乐同步未做量化验证。')
            text=re.sub(r'http://127\.0\.0\.1:4186/?',SITE,text)
            raw=text.encode('utf-8')
        to.write_bytes(raw)
    readme=(ROOT/'projects'/SLUG/'README.md').read_text('utf-8')
    (target/'README.md').write_text(readme.replace('../../docs/'+SLUG+'/',''),encoding='utf-8')
    index=(target/'index.html').read_text('utf-8')
    index=re.sub(r'<meta name="description"[^>]+>',f'<meta name="description" content="{SUMMARY}">',index)
    index=index.replace('</head>',f'<link rel="canonical" href="{SITE}">\n<meta property="og:title" content="奇幻影像与世界构造研究">\n<meta property="og:description" content="{SUMMARY}">\n<meta property="og:type" content="website">\n<meta property="og:url" content="{SITE}">\n<meta property="og:image" content="{SITE}{GUIDE}">\n<script src="publication-intro.js" defer></script>\n</head>')
    index=index.replace('2026 / 11 / 14','2026 / 11 / 21')
    (target/'index.html').write_text(index,encoding='utf-8')
    (target/'publication-intro.js').write_text((Path(__file__).parent/'publication-intro.js').read_text('utf-8'),encoding='utf-8')
    css='\n.rs-publication { margin:32px 0;padding:24px;border:1px solid #38534e;border-radius:16px;background:#11221f; } .rs-publication h2 {font-size:1.5rem;margin:0 0 12px;} .rs-publication p {line-height:1.85;} .rs-publication ul {padding-left:22px;line-height:1.9;}\n'
    with (target/'research-summary.css').open('a',encoding='utf-8') as out: out.write(css)
    (target/'.gitattributes').write_text('* text=auto eol=lf\n*.png binary\n*.jpg binary\n*.webp binary\n*.mp4 binary\n*.gif binary\n*.zip binary\n',encoding='utf-8')
    for f in target.rglob('*'):
        if f.is_file() and (f.suffix in {'.html','.js','.css','.json','.md','.txt','.py'} or f.name=='.gitattributes'):
            f.write_bytes((f.read_text('utf-8').rstrip()+'\n').encode('utf-8'))
    assert hashlib.sha256((target/GUIDE).read_bytes()).hexdigest()==GUIDE_HASH
    manifest={'published':'2026-11-21','evidenceThrough':'2026-11-14','slug':SLUG,'summary':SUMMARY,'guide':{'path':GUIDE,'sourceSha256':GUIDE_HASH,'publishedSha256':GUIDE_HASH,'unchanged':True,'color':'SDR'},'publicationScope':'Research site, attributed source analysis, original images, playable experiments, prompts and sanitized records. Source permission for reuse, precise beat sync, continuous 3D and product value unverified.','localOnly':'Account and login fields, logs, pasted article, intermediate media, truncated download, duplicate 16-image ZIP. Local originals are unchanged.','excludedMedia':excluded,'files':[]}
    for f in sorted(target.rglob('*')):
        if f.is_file() and f.name!='publication-manifest.json':
            raw=f.read_bytes()
            manifest['files'].append({'path':f.relative_to(target).as_posix(),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
    (target/'publication-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    update_index()
    print(json.dumps({'files':len(manifest['files']),'MB':round(sum(f['bytes'] for f in manifest['files'])/1e6,2),'guideUnchanged':True,'site':SITE},ensure_ascii=False))

def update_index():
    file=ROOT/'README.md'
    text=file.read_text('utf-8')
    row=f'| 027 | [奇幻影像与世界构造研究](projects/{SLUG}/README.md) | [@hi_personality原帖](https://x.com/hi_personality/status/2115567493565825244) · [巨构参考](https://x.com/EiiKwesiKay/status/2120958808789029021) | {SUMMARY} | [已有研究总图](#surreal-motion-guide) | [在线研究与效果]({SITE}) |'
    if '| 027 |' not in text: text=re.sub(r'(^\| 026 \|.*$)',lambda m:m[1]+'\n'+row,text,flags=re.M)
    if 'id="surreal-motion-guide"' not in text:
        text+=f'\n<a id="surreal-motion-guide"></a>\n\n### 027 · 奇幻影像与世界构造研究\n\n{SUMMARY}\n\n![沿用已有研究总图：七条主轴、八个代表效果、HDR与曝光、世界候选及六类核心沉淀](docs/{SLUG}/{GUIDE})\n\n核心理解：先让异常规则具有可见关系，再用人物与相机组织观看，用音乐与停顿引动情绪，最终检查图片之间是否共享世界规则。图片提供构图与风格依据；连续事件、可探索空间和产品收益需要另行验证。\n\n可复用的是关系词典、可变参数、执行材料、验收方法、证据分层和失败边界。曝光改变亮暗，饱和度改变颜色强度，HDR给适配显示链路更多亮度余量；同帧教学图与整张引导图均为SDR。\n\n网页保留12张早期关键帧、36阶段、40项研究手法、10效果图、局部预演、舞步和4母图/16地点。三个世界候选仍待核对地理与连接，40项不等于40个实现，一条成片通过也不等于稳定生成。[在线研究]({SITE}) · [HDR与高曝光]({SITE}#color) · [效果与世界]({SITE}#directions) · [完整研究摘要](projects/{SLUG}/README.md)\n'
    file.write_text(text,encoding='utf-8')
    file=ROOT/'docs/index.html'
    text=file.read_text('utf-8')
    if '<td>027</td>' not in text: text=text.replace('</tbody>',f'<tr><td>027</td><td><a href="{SLUG}/">奇幻影像与世界构造</a></td><td>{SUMMARY}</td><td><a href="{SLUG}/">进入 ↗</a></td></tr>\n</tbody>')
    if 'id="surreal-motion-overview"' not in text:
        article=f'<article id="surreal-motion-overview"><a class="cover" href="{SLUG}/"><img src="{SLUG}/exports/research-map-web-20261121.webp" width="1120" height="1995" style="object-fit:contain;object-position:top;max-height:720px;background:#0b171e" loading="lazy" alt="已生成研究总图：研究方向、效果价值、HDR与曝光及世界构造"></a><div><span class="number">027 / 奇幻影像与世界构造研究</span><h2>从参考奇观，走向有规则的世界。</h2><p>{SUMMARY}</p><p>八个代表效果说明可迁移关系；六类沉淀连接观察、创作和验收。HDR已有作者回复与分发信令依据，具体调色参数和音乐来源未知。高曝光与高饱和度只是教学变量，不能代替真实HDR。</p><p class="links"><a href="{SLUG}/">完整理解与研究总图</a><a href="{SLUG}/#color">HDR与高曝光</a><a href="{SLUG}/#motion">动作与情绪</a><a href="{SLUG}/#directions">原创效果与世界候选</a></p></div></article>'
        text=text.replace('</body>',article+'\n</body>')
    file.write_text(text,encoding='utf-8')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--source',type=Path,required=True)
    run(parser.parse_args().source.resolve())
