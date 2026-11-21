"""Insert only project 031; preserve all unrelated research entries."""
from pathlib import Path
import html
import json
import re

P = Path(__file__).resolve().parent
ROOT = P.parent.parent
m = json.loads((P / 'publication.json').read_text(encoding='utf-8'))
slug, site = m['slug'], m['site']
anchor = 'ocean-light-atlas-guide'
p = ROOT / 'README.md'
s = p.read_text(encoding='utf-8')
row = f'| 031 | [海景、人物与可复用场景研究](projects/{slug}/README.md) | [PEBIT海面参考]({m["sources"][0]["url"]}) · [Three.js](https://github.com/mrdoob/three.js) · [Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox) | {m["summary"]} | [已有研究引导图](#{anchor}) | [在线研究与四类人物效果]({site}) |'
if re.search(r'^\| 031 \|', s, re.M):
    s = re.sub(r'^\| 031 \|.*$', lambda _: row, s, flags=re.M)
else:
    matches = list(re.finditer(r'^\| \d{3} \|.*$', s, re.M))
    assert matches
    pos = matches[-1].end()
    s = s[:pos] + '\n' + row + s[pos:]
section = f'''<a id="{anchor}"></a>

### 031 · {m['title']}

{m['summary']}

![原样复用已生成的海景研究总结图：研究目标、四类人物呈现、对我们的价值及当前限制](projects/{slug}/{m['guide']})

**研究方向：** {m['direction']}

**实际效果：** {m['implementation']}

**对我们的价值：** {m['value']}

**后续与边界：** {m['extension']} 海面与声音为近似，最新接触与面部适配集中于0597，不把静态候选、历史换装与当前可动能力混为一谈。

引导图原样使用此前已生成图，属于研究总结示意；实际效果、来源、复用步骤与限制在网页分别列明。4.3固定资源保持字节一致。

[研究与一图理解]({site}) · [实际录屏]({site}#effects) · [四类人物]({site}#characters) · [怎么复用]({site}#research) · [完整摘要与源码](projects/{slug}/README.md)
'''
if f'<a id="{anchor}"></a>' in s:
    s = re.sub(r'<a id="' + anchor + r'"></a>[\s\S]*?(?=\n<a id="|\Z)', lambda _: section, s)
else:
    s = s.rstrip() + '\n\n' + section
p.write_text(s, encoding='utf-8', newline='\n')
p = ROOT / 'docs/index.html'
s = p.read_text(encoding='utf-8')
s = re.sub(r'<tr><td>031</td>[\s\S]*?</tr>\s*', '', s)
row = f'<tr><td>031</td><td><a href="{slug}/">走进海的光影里</a></td><td>{html.escape(m["summary"])}</td><td><a href="{slug}/">研究与效果 ↗</a></td></tr>\n'
s = s.replace('</tbody>', row + '</tbody>', 1)
s = re.sub(r'\s*<article id="ocean-light-atlas-overview">[\s\S]*?</article>', '', s)
card = f'<article id="ocean-light-atlas-overview"><a class="cover" href="{slug}/#guide-image"><img src="{slug}/{m["guide"]}" loading="lazy" width="2048" height="2560" alt="已有海景研究总结图：研究目标、四类人物呈现、复用价值与限制"></a><div><span class="number">031 / 海景、人物与可复用场景研究</span><h2>走进海的光影里，留下可继续使用的制作基础</h2><p>{html.escape(m["summary"])}</p><p>{html.escape(m["direction"])}</p><p>{html.escape(m["value"])}</p><p class="links"><a href="{slug}/">研究与引导图</a><a href="{slug}/#effects">实际效果</a><a href="{slug}/#characters">四类人物</a><a href="{slug}/#research">价值与复用</a><a href="https://github.com/{m["repository"]}/tree/main/projects/{slug}">完整摘要与源码</a></p></div></article>'
s = s.replace('</body>', card + '\n</body>')
p.write_text(s, encoding='utf-8', newline='\n')
print('Updated only031 in README and Pages index.')
