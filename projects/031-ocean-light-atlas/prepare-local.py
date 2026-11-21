"""Add the existing guide and complete research brief to the local summary."""
from pathlib import Path
import json
import os

project = Path(__file__).resolve().parent
root = Path(os.environ.get('OCEAN_LOCAL_SOURCE', str(project.parent.parent / 'ocean-light-atlas')))
meta = json.loads((project / 'publication.json').read_text(encoding='utf-8'))
p = root / 'glasshouse/summary.json'
data = json.loads(p.read_text(encoding='utf-8'))
data['researchBrief'] = {k: meta[k] for k in ['summary', 'direction', 'implementation', 'value', 'reuse']}
p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
p = root / 'glasshouse/summary.html'
s = p.read_text(encoding='utf-8')
s = s.replace('海边玻璃屋 · 理解与效果汇总', '走进海的光影里 · 研究方向、效果与价值')
s = s.replace('海边玻璃屋项目汇总：以海上风景为主线，回看4.3实际效果、已有积累、限制、未实现构想及产品方向待定的结论。', meta['summary'])
s = s.replace('<h1>海边玻璃屋，<br>回到看海的初衷。</h1>', '<h1>走进海的光影里，<br>回到看海的初衷。</h1>')
old = '<figure class="recap-image"><img src="../screenshots/hands-surf43-rock.png" alt="4.3实际网页画面：0597人物坐在岸边看海，海面反射夕阳" width="1280" height="900"><figcaption><span>实际网页基线</span>实时三维渲染，非海面实拍。</figcaption></figure>'
guide = '../output/research-summary-20261121/ocean-research-summary-20261121.png'
new = f'<figure class="recap-image" id="guide-image"><a href="{guide}" target="_blank" rel="noopener" aria-label="打开完整研究引导图"><img src="{guide}" alt="已有研究总结图：海景目标、四类人物呈现、效果依据、场景底座、人物适配流程与价值边界" width="2048" height="2560"></a><figcaption><span>原样沿用已生成的引导图</span>AI研究总结示意，依据现有网页画面整理；实际效果与实录见下方。<a href="{guide}" download>下载原图 ↓</a></figcaption></figure>'
if old in s:
    s = s.replace(old, new)
if 'id="research"' not in s:
    s = s.replace('<nav class="section-nav" aria-label="汇总目录">', '<nav class="section-nav" aria-label="汇总目录"><a href="#research">方向与价值</a>')
    section = '<section id="research"><div class="section-head"><div><p class="eyebrow">RESEARCH / DIRECTION AND VALUE</p><h2>我们研究什么，留下什么</h2></div><p>从参考条件到实际画面，<br>以可回看、可适配的积累为结果。</p></div><p id="recap-research-summary" class="recap-research-lead"></p><div class="recap-research-copy"><article><h3>研究方向</h3><p id="recap-research-direction"></p></article><article><h3>已做出的实际结果</h3><p id="recap-research-result"></p></article><article><h3>对我们的价值</h3><p id="recap-research-value"></p></article></div><h3 class="recap-reuse-title">以后怎样继续使用这些积累</h3><div id="recap-reuse" class="recap-reuse"></div></section>\n'
    s = s.replace('<section id="understanding">', section + '<section id="understanding">', 1)
p.write_text(s, encoding='utf-8')
p = root / 'glasshouse/summary.js'
s = p.read_text(encoding='utf-8')
if 'const assetUrl=' not in s:
    s = 'const assetUrl=href=>new URL(href,import.meta.url).href;\n' + s
    s = s.replace('escape(x.href)', 'escape(assetUrl(x.href))').replace('escape(p.src)', 'escape(assetUrl(p.src))')
    s = s.replace('img.src=p.src', 'img.src=assetUrl(p.src)').replace("$('character-preview-image').src=p.src", "$('character-preview-image').src=assetUrl(p.src)")
    s = s.replace("$('recap-character-captures').href=characters.previewCaptureRecord", "$('recap-character-captures').href=assetUrl(characters.previewCaptureRecord)")
if 'const brief=data.researchBrief' not in s:
    insert = ''' const brief=data.researchBrief;
 $('recap-research-summary').textContent=brief.summary;$('recap-research-direction').textContent=brief.direction;$('recap-research-result').textContent=brief.implementation;$('recap-research-value').textContent=brief.value;
 $('recap-reuse').innerHTML=brief.reuse.map(x=>`<article><span class="tag">${escape(x.title)}</span><h4>${escape(x.what)}</h4><p><strong>怎么用：</strong>${escape(x.how)}</p><p class="recap-boundary">${escape(x.boundary)}</p></article>`).join('');
'''
    s = s.replace(" $('recap-understanding').innerHTML=", insert + " $('recap-understanding').innerHTML=", 1)
p.write_text(s, encoding='utf-8')
p = root / 'glasshouse/summary.css'
s = p.read_text(encoding='utf-8')
if '.recap-research-lead{' not in s:
    s += '\n.recap-image img{aspect-ratio:4/5;object-fit:contain;max-height:720px}.recap-image>a{display:block}.recap-image figcaption>a{display:inline-block;margin-left:8px}.recap-research-lead{font-size:17px;line-height:2;color:#375d52;max-width:1100px}.recap-research-copy{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px;margin:25px 0}.recap-research-copy h3{font-size:17px}.recap-research-copy p,.recap-reuse p{font-size:13px;line-height:1.95;color:#566f63}.recap-reuse-title{font-size:20px;margin:35px 0 18px}.recap-reuse{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.recap-reuse article{padding:22px;background:#fcfbf4;border:1px solid var(--line);border-radius:4px}.recap-reuse h4{font-size:16px;line-height:1.7;margin:16px 0}.recap-reuse strong{font-weight:550;color:#355d50}@media(max-width:950px){.recap-research-copy{grid-template-columns:1fr}.recap-reuse{grid-template-columns:1fr 1fr}}@media(max-width:650px){.recap-research-lead{font-size:15px}.recap-reuse{grid-template-columns:1fr}.recap-image img{aspect-ratio:4/5;max-height:none}}\n'
p.write_text(s, encoding='utf-8')
print('Updated research brief, unchanged existing guide, reuse steps and portable resource URLs.')
