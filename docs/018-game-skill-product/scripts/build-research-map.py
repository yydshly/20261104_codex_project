"""Render an evidence-led research overview as editable SVG; no generated imagery."""
import base64
import hashlib
import html
import json
from pathlib import Path
from PIL import ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'research'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 2240, 4480
INK, MUTED, TEAL, GOLD, LINE = '#173b45', '#586e72', '#267c75', '#c88a38', '#ced8ce'
parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title description">',
 '<title id="title">游戏 Skill 的效果、价值与证据：潮光研究总览</title>',
 '<desc id="description">两轮 Skill 实践、完整三章游戏、四类实际交付、贡献归属、验证与性能代价。未进行同模型独立对照，耗时和返工收益未知。</desc>',
 '<rect width="2240" height="4480" fill="#f3f1e9"/>']
fonts = {}

def text(x, y, value, size=29, fill=INK, weight=400):
    parts.append(f'<text x="{x}" y="{y}" font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif" font-size="{size}" fill="{fill}" font-weight="{weight}">{html.escape(str(value))}</text>')

def measure(value, size):
    if size not in fonts:
        fonts[size] = ImageFont.truetype('C:/Windows/Fonts/msyh.ttc', size=size)
    return fonts[size].getlength(value)

def paragraph(x, y, value, width, size=28, fill=MUTED, leading=45):
    line = ''
    for char in value:
        if char == '\n' or (line and measure(line + char, size) > width - 10):
            text(x, y, line, size, fill); y += leading; line = ''
            if char == '\n': continue
        line += char
    if line: text(x, y, line, size, fill); y += leading
    return y

def box(x, y, width, height, fill='#fbfaf5', stroke=LINE, radius=14):
    parts.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" fill="{fill}" stroke="{stroke}"/>')

def line(x1, y1, x2, y2, color=LINE, width=2):
    parts.append(f'<path d="M{x1} {y1}H{x2}" stroke="{color}" stroke-width="{width}"/>' if y1 == y2 else f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{width}"/>')

def section(number, title, y, note=''):
    text(88, y, number, 25, TEAL, 700); text(156, y, title, 40, INK, 700)
    if note: text(2150 - measure(note, 24), y, note, 24, MUTED)
    line(88, y+24, 2152, y+24)

def image(path, x, y, width, height):
    encoded = base64.b64encode((ROOT/path).read_bytes()).decode()
    parts.append(f'<image x="{x}" y="{y}" width="{width}" height="{height}" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,{encoded}"/>')

text(88, 105, 'TIDELIGHT / 海港守灯人', 27, TEAL, 700)
text(1810, 105, '研究总览 · 2026.11.21', 24, MUTED)
text(88, 220, '游戏 Skill 的效果、价值与证据', 70, INK, 700)
paragraph(92, 290, '从一份“按问题选 Skill”的清单出发，做完整游戏、接入实际工具，再收窄价值判断。', 2020, 31)
text(92, 332, '研究理解：Skill 是工作说明及可选配套工具；能力接入、效果变化与效率收益需分别核对。', 25, MUTED)
box(88, 350, 2064, 135, '#173b45', '#173b45')
text(124, 403, '当前结论', 25, '#a9d7c8', 700)
text(124, 452, '已确认资源与代码复用；主要效果在视听层。开发效率、返工和趣味性增益尚未证实。', 33, '#fff8e7', 600)

section('01', '我们研究什么', 550)
for x, heading, body in [
 (88, '能力：能否进入完整产品？', '目标是一款有开始、战斗、成长、失败重试和结局的三章动作游戏；不止展示单个特效。'),
 (790, '贡献：谁提供了什么？', '区分 Skill 提供的说明、工具与实现，以及项目新增的造型、玩法、接入和调优。'),
 (1492, '收益：是否值得采用？', '看效果、可重建性、运行成本，再检查开发耗时、返工与玩家体验的证据是否充分。'),
]:
    box(x, 600, 660, 220); text(x+28, 650, heading, 29, INK, 700)
    paragraph(x+28, 700, body, 604, 27, leading=43)

section('02', '我们怎样推进理解', 885, '研究过程保留原记录')
stages=[
 ('第一次：通用说明', '原清单 8 项，采用 6 项一般建议。', '做出三章产品，但采用建议本身不足以证明额外收益。结论：增益未证实。'),
 ('第二次：带工具与代码', '换成 4 项可实际调用的 Skill。', '生产模型、图集、音效并接入海面模块。能够指到具体复用代码与运行产物。'),
 ('第三步：检验价值归因', '把“做出来”与“值得用”分开。', '固定同模型、同需求对照协议。独立对照尚未运行，耗时与返工收益仍未知。'),
]
for i, (heading, lead, body) in enumerate(stages):
    x=88+i*702; box(x, 935, 660, 240)
    text(x+28, 986, heading, 30, TEAL, 700)
    paragraph(x+28, 1036, lead, 604, 26, INK, 39)
    paragraph(x+28, 1083, body, 604, 26, leading=40)

section('03', '效果展示：同一款三章游戏的升级前后', 1242, '版本前后对照 ≠ 同模型独立 A/B')
image(Path('evidence/v2/compare-before.png'), 88, 1295, 1008, 630)
image(Path('evidence/v2/compare-after.png'), 1144, 1295, 1008, 630)
text(88, 1976, '升级前：基础几何敌人、灯塔与平面海面', 28, INK, 600)
text(1144, 1976, '升级后：独立 GLB 资产与动态海面', 28, INK, 600)
text(88, 2022, '同机位 / 1280×800 / 标准画质 / 减少动态 / 标题状态；截图保留游戏界面。动态效果请看网页与实录。', 25, MUTED)

section('04', '四个 Skill：实际调用、交付与价值边界', 2092)
cols=[88, 560, 1135, 1670]
for x, value in zip(cols, ['Skill / 来源','实际复用','游戏中交付','当前判断']): text(x+18, 2160, value, 26, TEAL, 700)
rows=[
 ('create-3d-assets', 'asset-maker', 'MeshBuilder / SolidMesh\n布尔切割、旋转体、AO\n网格验证与 GLB 导出', '4 个模型\n974 / 1094 / 496 / 1198 三角形\n哨兵、首领、炮台、灯塔', '已确认工具复用\n同类资产重复生产可用\n造型设计由项目完成'),
 ('create-vfx', 'asset-maker', 'EmitterStack / Flipbook\n闪光、冲击波、烟雾、余烬\n结构与动画连续性检查', '2 套透明图集\n各 24 帧，192px / 帧\n命中与共鸣事件驱动', '已确认特效生产接入\nQ 的规则是新增代码\n尚无“更好玩”证据'),
 ('create-sfx', 'asset-maker', '材质模态合成与瞬态\n金属、玻璃、钟体共振\n声像与波形检查', '10 个游戏声音 + 1 个对照\n48kHz 双声道 PCM16\n峰值约 −3dBFS', '已确认合成工具复用\n旧声是参数重建\n听感优劣待试听判断'),
 ('3d-ultra-realistic-water', 'threejs-Skills', '配套 ocean.mjs\nGerstner 波、法线、反射、泡沫\nCPU 波函数驱动浮动', '动态海面与小船\n45% CSS 分辨率\n海面最高 24Hz 更新', '直接复用完整实现\n增加运行开销\n未采用尾流与整套后期'),
]
for i,(name,repo,used,delivered,verdict) in enumerate(rows):
    y=2183+i*157;box(88,y,2064,147, '#fbfaf5' if i%2==0 else '#e8ede5', '#d7dfd3', 6)
    text(106,y+50,name,25,INK,700);text(106,y+94,repo,24,MUTED)
    paragraph(578,y+43,used,535,25,leading=39)
    paragraph(1153,y+43,delivered,498,25,leading=39)
    paragraph(1688,y+43,verdict,442,25,leading=39)

section('05', '贡献归属：新增功能不自动计入 Skill 价值', 2892)
box(88,2940,1008,285,'#e4eee4');box(1144,2940,1008,285,'#f3eadd')
text(120,2993,'可以确认的 Skill 贡献',32,TEAL,700)
paragraph(120,3047,'现成的几何与导出工具、分层特效与声音合成工具、网格/图像/音频检查，以及实际运行的海面模块。\n产物有配方、固定版本、清单与指纹，可重复生成。',944,28,leading=44)
text(1176,2993,'由项目新增或共同完成',32,'#936126',700)
paragraph(1176,3047,'模型造型、场景适配、色彩修正、对象池与性能调优。\n三章流程、升级、存档，以及 Q 的伤害、破甲、打断、消弹和能量回充，不计入四项 Skill 的独有收益。',944,28,leading=44)

section('06', '已有证据，以及实际付出的代价', 3290)
box(88,3340,660,300);box(790,3340,660,300);box(1492,3340,660,300)
text(120,3396,'22 + 34 + 9',46,TEAL,700)
paragraph(120,3447,'规则 / 游戏浏览器 / 展示检查。\n三章正常键盘通关，录像含声音。\n一次实玩 21.48 秒、7 次共鸣；\n程序已知目标，不是玩家时长。',596,26,leading=40)
text(822,3396,'23 个文件哈希一致',36,TEAL,700)
paragraph(822,3447,'同 seed 重建的 GLB / WAV / PNG\n字节哈希未变化，资产审计通过。\n说明本次产物可重建；\n不等于美术质量或可玩性更好。',596,26,leading=40)
text(1524,3396,'21.49 → 23.23 ms',36,'#936126',700)
paragraph(1524,3447,'自动画质同为 0.6 画布比例。\n新版约 43FPS；海面另加通道。\n1280×800 / SwiftShader / 6秒样本。\n体现运行代价，不是开发耗时。',596,26,leading=40)

section('07', '目前能下的结论与不能下的结论', 3710)
box(88,3760,2064,230,'#173b45','#173b45')
text(124,3814,'已确认',28,'#a9d7c8',700)
paragraph(310,3814,'资源和代码确实复用，并进入可玩的产品；主要可见收益集中在视听表现与资产交付。',1795,30,'#fff8e7',45)
text(124,3915,'尚未证实',28,'#f2cf91',700)
paragraph(310,3915,'更快、更少返工、更少缺陷、更好玩，或 Skill 文档相较直接使用同一工具的额外价值。',1795,30,'#fff8e7',45)

section('08', '下一项关键验证：同模型、同需求的独立对照', 4060, '状态：协议已固定，尚未运行')
paragraph(100,4120,'两组共用玩法、Q、UI、存档与基础环境；只比较模型、特效、声音与海面四部分。隔离上下文，避免不用 Skill 组读到已有配方。',2020,28,leading=43)
paragraph(100,4223,'新运行分别记录首次可验收耗时、失败与修正、资源重建速度、同条件效果和性能。上一轮总耗时、完整返工次数未可靠记录，保留为未知。',2020,28,leading=43)
line(88,4330,2152,4330)
text(88,4379,'原始记录：evidence/v2 · 来源与指纹：skill-sources/v2 · 独立对照：ab-experiment/PROTOCOL.md',24,MUTED)
text(88,4420,'本机评估 / 上游再分发授权待确认 / 真机、实体手柄、普通玩家体验与长期重玩价值待测',24,MUTED)
parts.append('</svg>')
(OUT/'research-overview-v3.svg').write_text('\n'.join(parts),'utf-8')
evidence=['evidence/v2/browser-verification.json','evidence/v2/playthrough.json','evidence/v2/performance.json','evidence/v2/reproducibility.json','evidence/v2/presentation-verification.json','ab-experiment/protocol.json','skill-sources/v2/manifest.json']
manifest={'title':'游戏 Skill 的效果、价值与证据','asOf':'2026-11-21','dimensions':[W,H],'method':'code-native SVG diagram with original game screenshots; rasterized with Sharp','status':'independent same-model comparison not run','sources':{name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in evidence},'generator':'scripts/build-research-map.py','svg':'assets/research/research-overview-v3.svg','png':'assets/research/research-overview-v3.png'}
(OUT/'overview-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps({'svg':str(OUT/'research-overview-v3.svg'),'dimensions':[W,H]},ensure_ascii=False))
