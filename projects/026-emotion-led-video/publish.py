"""Build the public research site from a reviewed, explicit local asset list."""
import argparse
import hashlib
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
SLUG = '026-emotion-led-video'
SITE = 'https://yydshly.github.io/20261104_codex_project/' + SLUG + '/'
GUIDE = 'assets/emotion-led-research-overview-v1.png'
GUIDE_HASH = 'dadffe42005099b52557c1e63f199cd0ab2b0e634df2a3f88d83dc4dda0d8e4f'
SUMMARY = '从人的日常情绪出发，把渴望变成一个想亲历的瞬间。用四种情绪效果图、六个故事和两轮海洞小样，研究人物回应、创意视角与真实质感怎样承载欲望、代入和观看期待；沉淀选题、镜头与反馈方法，情绪效果仍待验证。'

def digest(data):
    return hashlib.sha256(data).hexdigest()

def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def public_value(value):
    if isinstance(value, dict):
        omitted = {'taskId', 'sourceTaskId', 'originalGenerationFile', 'mediaWorkDirectory', 'originalGenerationPath'}
        return {k: public_value(v) for k, v in value.items() if k not in omitted}
    if isinstance(value, list):
        return [public_value(v) for v in value]
    if isinstance(value, str) and re.match(r'^(?:file:///)?[A-Za-z]:[\\/]', value):
        return '[local production path omitted]'
    return value

def public_text(text):
    text = re.sub(r'file:///[A-Za-z]:/[^"<>\s]*reality-edge-film-lab/index\.html', '../../index.html', text)
    text = re.sub(r'(?<![\w/])[A-Z]:[\\/][^\s`<>"\)]+', '[local production path omitted]', text)
    return text.replace('\r\n', '\n')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    source = parser.parse_args().source.resolve()
    destination = ROOT / 'docs' / SLUG
    assert source.is_dir() and source != destination
    assert digest((source / GUIDE).read_bytes()) == GUIDE_HASH, 'selected guide must remain unchanged'
    destination.mkdir(parents=True, exist_ok=True)

    def write(relative, value):
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(value, bytes) and target.suffix in {'.html', '.css', '.js', '.json', '.md', '.txt', '.srt'}:
            value = value.decode('utf-8-sig')
        if isinstance(value, str):
            target.write_bytes((value.replace('\r\n', '\n').rstrip('\n') + '\n').encode('utf-8'))
        else:
            target.write_bytes(value)

    def copy(relative):
        path = source / relative
        assert path.is_file() and not path.is_symlink()
        write(relative, path.read_bytes())

    web_media = {}
    def copy_web_video(relative):
        original = source / relative
        source_bytes = original.read_bytes()
        source_hash = digest(source_bytes)
        cache = HERE / '.cache' / 'web-media'
        cache.mkdir(parents=True, exist_ok=True)
        target = cache / (source_hash + '-h264-crf24-max1400k.mp4')
        if not target.is_file():
            subprocess.run(['ffmpeg', '-v', 'error', '-i', str(original), '-map', '0:v:0', '-map', '0:a:0?',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-maxrate', '1400k',
                            '-bufsize', '2100k', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', str(target)],
                           check=True, capture_output=True, timeout=180)
        data = target.read_bytes()
        write(relative, data)
        web_media[relative] = {'productionSha256': source_hash, 'productionBytes': len(source_bytes),
                               'webSha256': digest(data), 'webBytes': len(data),
                               'transcode': 'H264 CRF24 max1400k; original audio stream copied; dimensions, timing and frame rate retained'}

    for template in ('index.html', 'site.css'):
        write(template, (HERE / 'site' / template).read_text(encoding='utf-8'))
    write('.gitattributes', '* text=auto eol=lf\n*.png -text\n*.jpg -text\n*.mp4 -text\n')
    write('README.md', (HERE / 'README.md').read_text(encoding='utf-8').replace('../../docs/' + SLUG + '/', ''))
    for path in sorted((source / 'assets').iterdir()):
        if path.is_file() and re.fullmatch(r'(?:reference-frame-0[1-4]\.jpg|reference-original-contact-sheet\.jpg|story-0[1-6]-atmosphere(?:-alt)?-v1\.png|emotion-led-research-overview-v1\.png)', path.name):
            copy('assets/' + path.name)
    for filename in ('reader.css', 'reader.js'):
        copy(filename)
    archive = public_text((source / 'index.html').read_text(encoding='utf-8'))
    archive = archive.replace('<p class="masthead-note">', '<p class="masthead-note"><a href="index.html">返回情绪研究首页</a> · ', 1)
    write('archive.html', archive)
    stories = public_value(read_json(source / 'stories.json'))
    stories['projectName'] = '现实边缘 · 日常情绪与AI短视频效果研究'
    stories['imageNote'] = 'AI生成的三联氛围概念图，用于理解场景与故事，非连续视频。'
    write('stories.json', json.dumps(stories, ensure_ascii=False, indent=2) + '\n')
    write('data.js', 'window.PROJECT_DATA = ' + json.dumps(stories, ensure_ascii=False, indent=2) + ';\n')

    for path in sorted((source / 'prompts').rglob('*.txt')):
        copy(path.relative_to(source).as_posix())
    prompt_links = []
    for path in sorted((destination / 'prompts').rglob('*.txt')):
        name = path.relative_to(destination / 'prompts').as_posix()
        prompt_links.append('<li><a href="' + html.escape(name, quote=True) + '">' + html.escape(name) + '</a></li>')
    write('prompts/index.html', '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>实际生成指令｜现实边缘</title><link rel="stylesheet" href="../site.css"><main class="wrap section"><p><a href="../index.html">返回研究首页</a></p><h1>实际生成指令</h1><p>研究总览、六组氛围图与早期动作试镜的指令。两条视频的执行指令另随作品记录保存。</p><ul>' + ''.join(prompt_links) + '</ul><p><a href="../episodes/cave-birthday-15s/prompts/video-execution-v1.txt">15秒故事版执行指令</a></p></main></html>')

    for path in sorted((source / 'docs').glob('*.md')):
        if path.name.startswith('09-'):
            continue
        text = public_text(path.read_text(encoding='utf-8'))
        text = re.sub(r'\[([^\]]+)\]\(\.\./reports/reference-(?:public-metadata|evidence|creator-metadata)\.json\)', r'\1（本地历史记录）', text)
        if path.name.startswith('04-'):
            text = text.replace('\n\n', '\n\n> 来源档案保留2026-11-12的阶段记录；当前已完成两轮海洞视频小样，见[研究首页](../index.html#experiments)。\n\n', 1)
        write('docs/' + path.name, text)
    write('reports/image-review.md', public_text((source / 'reports' / 'image-review.md').read_text(encoding='utf-8')))
    generated = public_value(read_json(source / 'reports' / 'emotion-led-research-overview-v1.json'))
    write('reports/emotion-led-research-overview-v1.json', json.dumps(generated, ensure_ascii=False, indent=2) + '\n')

    for episode, duration, render, poster in (
        ('cave-welcome-8s', 8, 'cave-welcome-8s-v1.mp4', 'start-frame-v1.png'),
        ('cave-birthday-15s', 15, 'cave-birthday-15s-v1.mp4', 'poster-v1.jpg')
    ):
        prefix = 'episodes/' + episode + '/'
        for filename in ('player.css', 'player.js'):
            copy(prefix + filename)
        player = public_text((source / prefix / 'index.html').read_text(encoding='utf-8'))
        player = player.replace('../../index.html#story-02', '../../archive.html#story-02')
        write(prefix + 'index.html', player)
        data_text = (source / prefix / 'demo-data.js').read_text(encoding='utf-8')
        clip_data = json.loads(data_text.split('=', 1)[1].strip().rstrip(';'))
        clip_data.pop('rawPath', None)
        clip_data.setdefault('reviewNotes', []).append('网页播放版保留画幅、时长与原声，降低码率以便在线加载；原始制作文件本地保留。')
        write(prefix + 'demo-data.js', 'window.CAVE_DEMO = ' + json.dumps(public_value(clip_data), ensure_ascii=False, indent=2) + ';\n')
        copy_web_video(prefix + 'renders/' + render)
        copy(prefix + 'references/' + poster)
        write(prefix + 'README.md', '# 海洞小样｜' + str(duration) + '秒\n\n[播放页](index.html) · [研究首页](../../index.html#experiments)\n\n原创虚构AI视频，Seedance 2.0标准版，720p竖屏。网页播放版保留画幅、时长和原生音轨，压缩码率以便在线加载，原始制作文件本地保留。两轮小样用于研究人物、情节与情绪吸引力，未达到观看者预期。完整人工听验尚未完成。具体效果与已知问题见研究首页。\n')
    prefix = 'episodes/cave-birthday-15s/'
    for filename in ('audio/captions-v1.json', 'audio/captions-v1.srt', 'prompts/video-execution-v1.txt'):
        copy(prefix + filename)
    for filename in ('story-review-v1.json', 'delivery-record-v1.json'):
        value = public_value(read_json(source / prefix / 'reports' / filename))
        if filename.startswith('delivery-record'):
            transform = web_media[prefix + 'renders/cave-birthday-15s-v1.mp4']
            value.update(sha256=transform['webSha256'], productionSourceSha256=transform['productionSha256'], webTranscode=True,
                         transcode=transform['transcode'])
        if filename.startswith('story-review'):
            value['visualEvidence'] = '0.5-second sampled visual review; critical hand-hold, seated and subtitle frames checked during local production.'
            value.pop('captionFrameInspected', None)
            if isinstance(value.get('audio'), dict):
                value['audio'].pop('asrReport', None)
        write(prefix + 'reports/' + filename, json.dumps(value, ensure_ascii=False, indent=2) + '\n')

    root_readme = ROOT / 'README.md'
    readme = root_readme.read_text(encoding='utf-8')
    if '| 026 |' in readme:
        assert 'projects/' + SLUG + '/README.md' in readme, 'project number assigned elsewhere'
        readme = re.sub(r'^\| 026 \|.*\n?', '', readme, flags=re.M)
        readme = re.sub(r'\n<a id="emotion-led-video-guide"></a>[\s\S]*?(?=\n<a id="|\Z)', '', readme)
    row = '| 026 | [日常情绪与 AI 短视频效果研究](projects/' + SLUG + '/README.md) | [用户分享帖](https://x.com/billtheinvestor/status/2120217438533066946) · [TechHalla原帖](https://x.com/techhalla/status/2110686996049883550) | ' + SUMMARY + ' | [本次生成的引导图](#emotion-led-video-guide) | [在线研究与效果](' + SITE + ') |'
    readme = re.sub(r'(^\| 025 \|.*)$', lambda m: m[1] + '\n' + row, readme, count=1, flags=re.M)
    assert '| 026 |' in readme
    readme = readme.rstrip() + '\n\n<a id="emotion-led-video-guide"></a>\n\n### 026 · 日常情绪与 AI 短视频效果研究\n\n**从人的日常情绪出发，把渴望变成一个想亲历的瞬间。**\n\n' + SUMMARY + '\n\n![本次生成的情绪研究引导图，展示被惦记、自由、心动与惊叹四种效果设想](docs/' + SLUG + '/' + GUIDE + ')\n\n研究积累了情绪选题、人物动作、拍摄者身份与盲区设计，以及根据观看反馈继续修改的方法。海洞两轮小样说明：把动作与情节做出来，尚未满足本轮观看者对吸引力的要求；后续先验证哪一秒让人在意。四种新效果是静态设想，尚未制作成新视频。\n\n引导图原样使用本次生成文件。[在线研究](' + SITE + ') · [实际小样](' + SITE + '#experiments) · [六个故事](' + SITE + 'archive.html#stories) · [完整摘要](projects/' + SLUG + '/README.md)\n'
    root_readme.write_text(readme, encoding='utf-8')
    home_path = ROOT / 'docs' / 'index.html'
    home = home_path.read_text(encoding='utf-8')
    if '<td>026</td>' in home:
        assert SLUG + '/' in home
        home = re.sub(r'<tr><td>026</td>[\s\S]*?</tr>\s*', '', home, count=1)
        home = re.sub(r'<article id="emotion-led-video-overview">[\s\S]*?</article>\s*', '', home, count=1)
    home = home.replace('</tbody>', '<tr><td>026</td><td><a href="' + SLUG + '/">日常情绪与 AI 短视频效果</a></td><td>' + SUMMARY + '</td><td><a href="' + SLUG + '/">研究与效果</a></td></tr>\n</tbody>', 1)
    card = '<article id="emotion-led-video-overview"><a class="cover" href="' + SLUG + '/"><img src="' + SLUG + '/' + GUIDE + '" width="1536" height="1024" loading="lazy" alt="本次生成的日常情绪研究引导图，展示四种效果设想与研究修正"></a><div><span class="number">026 / 日常情绪与 AI 短视频效果研究</span><h2>从人的日常情绪出发，把渴望变成一个想亲历的瞬间</h2><p>' + SUMMARY + '</p><p>引导图沿用本次生成原图。人物行动承载关系，创意视角组织期待，真实质感支持代入。已公开六组氛围图与两轮小样，保留用户反馈和当前验证边界。</p><p class="links"><a href="' + SLUG + '/">理解、效果与价值</a><a href="' + SLUG + '/#guide-image">研究引导图</a><a href="' + SLUG + '/#experiments">实际小样与反馈</a><a href="' + SLUG + '/archive.html#stories">六个故事</a></p></div></article>'
    home = home.replace('</body>', card + '\n</body>', 1)
    home_path.write_text(home, encoding='utf-8')
    manifest = {'project': SLUG, 'date': '2026-11-21', 'site': SITE,
                'guide': {'path': GUIDE, 'sha256': GUIDE_HASH, 'originalBytesPreserved': True},
                'scope': 'Curated static research, concept images, two completed video samples and creative prompts.',
                'webMedia': web_media, 'files': []}
    for file in sorted(destination.rglob('*')):
        if file.is_file() and file.name != 'publication-manifest.json':
            data = file.read_bytes()
            manifest['files'].append({'path': file.relative_to(destination).as_posix(), 'bytes': len(data), 'sha256': digest(data)})
    write('publication-manifest.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'site': SITE, 'files': len(manifest['files']), 'totalMB': round(sum(x['bytes'] for x in manifest['files']) / 1e6, 2), 'guideUnchanged': True}))

if __name__ == '__main__':
    main()
