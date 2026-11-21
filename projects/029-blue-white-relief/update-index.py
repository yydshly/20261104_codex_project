"""Add only this study to repository and Pages indexes based on current files."""
from pathlib import Path
import html
import json
import re

PROJECT = Path(__file__).resolve().parent
ROOT = PROJECT.parent.parent
meta = json.loads((PROJECT / "publication.json").read_text(encoding="utf-8"))
slug, summary, site = meta["slug"], meta["summary"], meta["site"]
anchor = "blue-white-relief-guide"
readme = (ROOT / "README.md").read_text(encoding="utf-8")
assert "| 028 |" in readme, "Use the current remote index, not an older local snapshot"
row = f'| 029 | [青白造境：风格作品与现实应用研究](projects/{slug}/README.md) | [Zidan子丹原帖]({meta["source"]}) · 自主图像、视频与网页交付实践 | {summary} | [已有理解引导图](#{anchor}) | [在线研究、效果与模板]({site}) |'
readme = re.sub(r'^\| 029 \|.*\n?', '', readme, flags=re.M)
readme = re.sub(r'(^\| 028 \|.*)$', lambda match: match.group(1) + '\n' + row, readme, flags=re.M)
readme = re.sub(r'\n<a id="' + anchor + r'"></a>[\s\S]*?(?=\n<a id="|\Z)', '', readme).rstrip()
readme += f'''\n\n<a id="{anchor}"></a>

### 029 · 青白造境：风格作品、网页交付与现实应用研究

{summary}

![已有青白造境理解总览图：实际山水与茶器效果、已做成的网页与模板、能力边界、现实扩展方向及产品价值](projects/{slug}/{meta['guide']})

**研究方向：** {meta['direction']}

**实际效果：** {meta['implementation']}

**对我们的价值：** {meta['value']}

**与现实世界结合：** {meta['extension']}

引导图原样复用本轮已生成的2800×2366图，图内146条为此前本地快照，公开索引以网页为准。历史AI视频实际累计375积分，网页、模板和本次发布未新增生成任务；静帧未提供积分记录。原帖媒体保留本地归档，公开页保留出处与文字观察。

[研究与一图理解]({site}#guide-image) · [当前成品]({site}#results) · [能力与边界]({site}#capabilities) · [概念展示页]({site}tea/) · [本地模板]({site}tea/studio.html) · [完整摘要](projects/{slug}/README.md)
'''
(ROOT / "README.md").write_text(readme, encoding="utf-8", newline="\n")
page = (ROOT / "docs/index.html").read_text(encoding="utf-8")
assert '<td>028</td>' in page, "Use the current remote Pages index"
page = re.sub(r'<tr><td>029</td>[\s\S]*?</tr>\s*', '', page)
new_row = f'<tr><td>029</td><td><a href="{slug}/">青白造境：风格作品与现实应用</a></td><td>{html.escape(summary)}</td><td><a href="{slug}/">研究与效果 ↗</a></td></tr>\n'
page = page.replace('</tbody>', new_row + '</tbody>', 1)
page = re.sub(r'\s*<article id="blue-white-relief-overview">[\s\S]*?</article>', '', page)
card = f'''<article id="blue-white-relief-overview"><a class="cover" href="{slug}/#guide-image"><img src="{slug}/{meta['guide']}" loading="lazy" width="2800" height="2366" alt="原样沿用的青白造境总览图，连接实际效果、研究理解、已验证能力、现实扩展与价值"></a><div><span class="number">029 / 青白造境：风格作品、网页交付与现实应用</span><h2>让风格作品，走向与现实有关的表达</h2><p>{html.escape(summary)}</p><p>{html.escape(meta['value'])}</p><p>{html.escape(meta['extension'])}</p><p class="links"><a href="{slug}/#guide-image">已有引导图</a><a href="{slug}/#results">实际效果</a><a href="{slug}/#capabilities">能力与边界</a><a href="{slug}/tea/">概念展示页</a><a href="{slug}/tea/studio.html">模板编辑器</a><a href="https://github.com/{meta['repository']}/tree/main/projects/{slug}">完整研究摘要</a></p></div></article>'''
assert '</body>' in page
page = page.replace('</body>', card + '\n</body>')
(ROOT / "docs/index.html").write_text(page, encoding="utf-8", newline="\n")
print('Updated only029 in the two indexes, preserving entries001–028.')
