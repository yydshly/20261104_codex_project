"""Add this study to the shared research index without touching other entries."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "024-immersive-loop-research"
URL = f"https://yydshly.github.io/20261104_codex_project/{SLUG}/"
SUMMARY = "研究怎样从自己的日常素材形成统一情绪、个人风格与整体循环，以十八轮实验比较花朵接续、全幅水光、秋林事件及光影。保留三个代表、反馈与方法，积累原创系列和有依据的返修能力；舒适、真实感、原生 GIF 与后续用途仍待验证。"
readme = ROOT / "README.md"
text = readme.read_text(encoding="utf-8")
row = f"| 024 | [日常元素与沉浸式循环研究](projects/{SLUG}/README.md) | [JenPanepinto](https://x.com/JenPanepinto) · 本轮独立实验 | {SUMMARY} | [已有理解总览图](#immersive-loop-guide) | [在线研究与代表效果]({URL}) |"
if not re.search(r"^\| 024 \|", text, re.M):
    matches = list(re.finditer(r"^\| \d{3} \|.*$", text, re.M))
    assert matches
    offset = matches[-1].end()
    text = text[:offset] + "\n" + row + text[offset:]
if 'id="immersive-loop-guide"' not in text:
    text = text.rstrip()+f'''

<a id="immersive-loop-guide"></a>

### 024 · 日常元素与沉浸式循环研究

{SUMMARY}

![沿用本轮生成的理解总览：三个代表效果、四条原则、五步创作顺序与待验证问题](docs/{SLUG}/assets/summary/understanding-overview-v1.png)

我们的理解是：循环发生在画面的关系里。统一光色、材质与细节建立创作世界，构图、节奏与事件组织整体联动，材料和空间约束运动，首尾自然接续。抽象纹样与写实场景各有规则，悬疑只是可选观看线索，舒适与愿意持续观看始终是目标。

研究价值在于形成个人创作语言、让返修改得有依据、积累可复用的实际素材和方法；可继续验证动态日记、氛围网页、动态插画与系列视觉。网页默认只选花朵接续、全幅水光、秋林事件与光影三个不同代表，相近版本保留在完整实验档案中。技术衔接不代表观看体验通过，目前没有用户认可的最终成片或验证成功的模型原生 GIF。

引导图逐字节沿用原图，公开版保留十八轮阶段、实际动态与反馈，省去账号截图和私有执行草稿。[在线研究与效果]({URL}) · [完整方向、价值与边界](projects/{SLUG}/README.md)
'''
readme.write_bytes(text.encode("utf-8"))

index = ROOT / "docs/index.html"
text = index.read_text(encoding="utf-8")
row = f'<tr><td>024</td><td><a href="{SLUG}/#research">日常元素与沉浸式循环</a></td><td>{SUMMARY}</td><td><a href="{SLUG}/">研究与效果</a></td></tr>'
if '<td>024</td>' not in text:
    assert '</tbody>' in text
    text = text.replace('</tbody>',row+'\n</tbody>',1)
if 'id="immersive-loop-study"' not in text:
    article = f'''    <article id="immersive-loop-study"><a class="cover" href="{SLUG}/#guide-image"><img src="{SLUG}/assets/summary/understanding-overview-v1.png" width="2400" height="2070" loading="lazy" alt="沿用本轮生成的循环研究总览：花朵接续、全幅水光、秋林事件三类代表，四条原则与五步创作顺序"></a><div><span class="number">024 / 日常元素与沉浸式循环研究</span><h2>让日常素材形成愿意停留的创作世界</h2><p>{SUMMARY}</p><p>我们的理解是循环发生在画面的关系里：光色与材质维持情绪，构图、节奏与事件连接各处，运动服从空间，首尾自然接续。价值在个人创作语言、有依据的返修与实际素材复用；动态日记、氛围网页和系列视觉保留为后续用途验证。</p><p>引导图使用已生成原图，网页默认只列三个不同代表，完整档案保留十八轮实验。没有用户认可的最终成片或验证成功的原生 GIF，模型静态素材与程序合成分别标注。</p><p class="links"><a href="{SLUG}/#research">方向与价值</a><a href="{SLUG}/#gallery">三个代表与完整档案</a><a href="{SLUG}/#workflow">创作方法</a><a href="https://github.com/yydshly/20261104_codex_project/tree/main/projects/{SLUG}">完整研究摘要</a></p></div></article>
'''
    assert '</body>' in text
    text = text.replace('  </body>',article+'  </body>',1)
index.write_bytes(text.encode("utf-8"))
print("Registered 024 in README table, guide section, Pages index and overview card.")
