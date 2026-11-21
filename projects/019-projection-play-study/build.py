"""Build a static research archive and one editable/exportable summary diagram."""
from pathlib import Path
from html import escape as esc
import json
import math
import shutil
import hashlib
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ASSETS = HERE / 'assets'
ASSETS.mkdir(exist_ok=True)

DATA = {
  'id': '019', 'title': '投影打怪玩具：效果、意义与研究判断',
  'updated': '2026-11-21', 'status': '归档参考，停止继续产品探索',
  'conclusion': '效果直观，有儿童娱乐与共同游戏的意义；对我们当前没有太多新增研究价值，保留理解与来源，不继续立项或制作演示。',
  'scope': '这是对本次研究投入的取舍，不是对投影玩具、游戏软件或儿童游戏价值的全面否定。',
  'source_post': 'https://x.com/noni__z/status/2120168976135209223',
  'observations': [
    ['投影进入家庭空间', '浅色墙面上出现彩色卡通怪物、动物等目标，白色投影装置放在地面或桌面。', '原帖附件画面可见'],
    ['孩子拿道具参与', '画面中的孩子举起红蓝玩具枪瞄准，也能看到身体移动、跳动。', '原帖附件画面可见'],
    ['多人共同在场', '有两个孩子同场，也有成年人持玩具枪参与、旁人观看或拍摄的片段。', '原帖附件画面可见'],
    ['画面表现有射击与特效', '剪辑中出现瞄准、光线、目标变化和爆炸式画面；不能据此逐次确认真实命中。', '看到呈现效果，实时因果未核验'],
    ['短片本身是剪辑', '取得的附件约12.4秒，包含不同房间与不同家庭的片段。', '附件时长与抽帧观察'],
    ['排名与具体型号未知', '正文称听说是“美国第一”；未提供排名口径、销量出处或可确认的品牌型号。', '未核实，不作为产品成功证据'],
  ],
  'fun': [
    ['熟悉空间突然改变', '“怪物出现在我家了。”', '普通墙面成为游戏场景，产生惊喜和探索欲。', '新鲜感是否能维持，未知。'],
    ['道具与角色扮演', '“这次由我来抓住它。”', '握持、举起和扣动让行动具体，容易进入假装游戏。', '不能把换成任意道具视为同等体验。'],
    ['动作有明确结果', '“我刚才打中了！”', '清楚的因果、成功反馈和掌控感可能支持反复尝试。', '原机识别精度、延迟和容错未实测。'],
    ['容易理解的小挑战', '“这次我想更准一点。”', '目标明确、进入门槛低；难度变化可能带来进步感。', '关卡实际设计与长期复玩未知。'],
    ['有人一起看、一起玩', '“你看我！我们一起。”', '共享目标让成果被看见，也可能引出比赛、合作和欢呼。', '共同在场不自动证明合作质量或亲子收益。'],
  ],
  'layers': [
    ['产品整体', '家庭多人互动玩具：把短时游戏放到共同生活空间。', '需要上手、操作、反馈与复玩共同成立。', '本次理解，不是用户调研结论'],
    ['硬件与交互', '投影、手持道具、输入感知、校准与实际使用环境。', '影响能否顺利开始、瞄准是否可信、多人是否混淆。', '原机方案未拆解；未做实机'],
    ['软件与规则', '输入事件、命中判断、计分、怪物行为、难度与多人规则。', '决定动作以后发生什么，以及挑战是否清楚、持续变化。', '有一般学习价值；本轮未实现游戏软件'],
    ['内容与反馈', '角色、动画、声音、关卡和成功失败的表现。', '帮助理解规则、表达结果，并提供内容变化。', '更多素材不等于更好玩法'],
    ['使用与经营', '开箱设置、空间要求、收纳、售后、获客、价格和后续内容。', '决定家庭或场地方能否持续使用，以及产品能否交付。', '成本、付费和渠道均未验证'],
  ],
  'meaning': [
    ['对孩子', '可能带来角色扮演、掌控感、动作挑战、共同注意和分享成功的快乐。好玩本身可以是价值。', '不宣称治疗、专注力提升或其他发展成效。'],
    ['对家庭', '可能成为室内短时娱乐、兄弟姐妹游戏、亲子共玩或聚会活动。', '这些是使用场景假设；未测家庭复玩和购买理由。'],
    ['对产品理解', '帮助看清道具、空间、规则和即时反馈如何共同构成体验。软件与玩法能改变产品定位。', '不能由一个有趣片段推导销量、利润或新产品机会。'],
    ['对我们的研究', '保留一种空间互动参考，以及区分效果、意义和研究投入的判断方法。', '没有识别出值得继续投入的具体新增能力或需求缺口。'],
  ],
  'why_limited': [
    ['基本机制已能解释', '现有材料足够理解“投影目标、实体道具、行动反馈、同场游戏”的组合，继续重复解释的新增收益低。'],
    ['已有产品覆盖相关能力', 'Nex提供家庭体感游戏，LUMOplay提供互动投影与定制模板。它们说明已有供给，不证明市场没有任何缺口。'],
    ['未找到具体的新增需求', '合作、创作、更多内容都是可想象的方向；没有证据表明某类家庭反复遇到现有方案不能解决的问题。'],
    ['关键体验仍未实测', '没有原机命中测试、设备搭建测试、家庭跨日复玩或真实付费记录，无法支持更强判断。'],
    ['软件价值尚未落到本项目', '软件与规则有一般学习价值，但目前没有提出值得我们专门实现、比较和保留的新机制。'],
    ['早期扩展偏离吸引力', '城市任务盒与PDF组织了纸质活动，未保留动作输入到即时反馈的核心体验；不能用它验证投影玩具。'],
  ],
  'directions': [
    ['亲子合作', '引怪与捕捉分工、两人同步触发等。', '可能让不同水平的人共同参与；仅为设想，未实现、未试玩。'],
    ['孩子自己出题', '选择怪物行为、弱点和出现顺序，再请家人挑战。', '可能增加创作和邀请他人参与的乐趣；不能仅靠换角色图片成立。'],
    ['场地互动体验', '亲子空间或聚会中使用短局、轮换和不同人数的内容。', '需要真实场地、设置和维护条件；没有渠道与收费验证。'],
    ['魔法手电探险', '照出脚印或线索，帮助角色回家。', '早期方向草案；没有形成投影输入与反馈的验证。'],
    ['怪物照料、影子剧场、城市声音', '照顾角色，家庭配音，模仿地方声音并编故事。', '有童趣联想，但本轮没有证实应成为新的产品。'],
  ],
  'cities': [
    ['广州 / 佛山', '醒狮与鼓点', '两人分工扮演小狮子，按节奏合作。'],
    ['重庆', '坡坎、立体街巷与索道', '搭路线，把角色送到不同位置。'],
    ['苏州', '窗、桥、水巷与取景', '用窗框选景，安排朋友过桥来做客。'],
    ['泉州', '提线木偶与港口故事', '操纵纸角色，合演一段冒险。'],
    ['北京', '胡同、院落与生活声音', '寻找声音和家人故事，搭自己的小院。'],
    ['哈尔滨', '冰雪与冬季生活', '用透明积木、灯光和影子合作造小城。'],
  ],
  'timeline': [
    ['起点：理解原帖', '读取阿拉伯语正文，观察投影、玩具枪与儿童共同游戏的画面；未确认“美国第一”或具体型号。'],
    ['扩展：童趣、家庭与城市文化', '讨论秘密、掌控、共同假装与创造规则，提出多类产品和六组城市玩法。它们都是设计联想。'],
    ['具体化：苏州城市任务盒', '选择平江路候选区域，提出约45-60分钟的家庭活动，进一步制作了11页A4样稿。未完成实地踏勘和家庭测试。'],
    ['反馈：样稿没有说明能力与价值', '用户指出不理解价值，以及为什么呈现为PDF。确认纸质活动材料没有保留原投影游戏的吸引力。'],
    ['修正：回到动作、规则与软件', '讨论真实动作的反馈、多人合作、孩子出题和软件层次。仅形成分析，没有完成投影游戏原型。'],
    ['澄清：讨论对象是产品', '从视频效果与技术说明转回家庭互动玩具，整理使用场景、购买理由、复玩与整体交付。'],
    ['当前决定：归档，停止继续探索', '用户判断当前没有太多价值，要求尽可能完整补充网页和一张汇总图。本页保留依据、未验证项与偏题记录，不继续推销新方向。'],
  ],
  'unknown': ['原机确切品牌型号、硬件结构与输入识别方式。',
              '每次命中与画面变化是否真实对应，是否存在剪辑或后期增强。',
              '命中精度、延迟、遮挡、多人区分，以及实际设置和维护成本。',
              '新鲜感过去后的跨日复玩、不同年龄和家庭的使用差异。',
              '销量排名、成本、利润、转化、渠道与用户愿付价格。',
              '一般娱乐之外的学习、发展或亲子关系改善成效。'],
  'sources': [
    ['S1','原帖与附件','https://x.com/noni__z/status/2120168976135209223','用户提供。正文经公开转存读取，附件约12.4秒，按抽帧观察。不是原机实测或交易证据。'],
    ['S2','Nex Playground 官方游戏目录','https://www.nexplayground.com/games','官方提供家庭运动、合作等游戏的说明；本轮未购买或实测。'],
    ['S3','LUMOplay：所需设备','https://help.lumoplay.com/hc/en-us/articles/360002783453-Required-equipment','官方说明计算机、感知设备和显示设备的分工；不能据此识别原帖玩具的硬件。'],
    ['S4','LUMOplay：Motion Maker 模板','https://help.lumoplay.com/hc/en-us/articles/360003430793-What-is-Motion-Maker','官方提供互动墙面等模板与素材替换说明，作为已有供给的参照。'],
    ['S5','苏州官方：平江历史街区','https://visitsz.wglj.suzhou.com.cn/scenic-spot-detail.aspx?id=34','支撑早期候选区域的公开介绍。网页资料不能替代路线踏勘。'],
    ['S6','Creative Tonies 官方介绍','https://us.tonies.com/collections/creative-tonies','支持家庭自录故事与留言的产品参照；没有证明我们的城市任务盒需求。'],
    ['S7','LEGO Build the Change 活动材料','https://www.lego.com/en-us/sustainability/buildthechange/courses','儿童重新想象城市空间的活动参照；不代表本项目已经有学习或商业成效。'],
  ],
}


def table(headers, rows):
    return '<div class="table-scroll"><table><thead><tr>'+''.join('<th scope="col">'+esc(v)+'</th>' for v in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+esc(v)+'</td>' for v in row)+'</tr>' for row in rows)+'</tbody></table></div>'


def cards(rows, cls='cards'):
    return '<div class="'+cls+'">'+''.join('<article><h3>'+esc(r[0])+'</h3><p>'+esc(r[1])+'</p>'+(''.join('<p class="muted">'+esc(x)+'</p>' for x in r[2:]))+'</article>' for r in rows)+'</div>'


# One diagram, two file formats. No generated-photo claim; symbols are original diagrams.
W,H=1800,2360
im=Image.new('RGB',(W,H),'#101916')
draw=ImageDraw.Draw(im)
svg=[]
font_cache={}
def font(size,bold=False):
    k=(size,bold)
    if k not in font_cache:
        font_cache[k]=ImageFont.truetype('C:/Windows/Fonts/'+('Dengb.ttf' if bold else 'Deng.ttf'),size)
    return font_cache[k]
def box(x,y,w,h,fill,stroke=None,r=20):
    if len(fill)==6 and not fill.startswith('#'): fill='#'+fill
    if stroke and len(stroke)==6 and not stroke.startswith('#'): stroke='#'+stroke
    draw.rounded_rectangle((x,y,x+w,y+h),r,fill,stroke,2 if stroke else 1)
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else '')+'/>')
def ln(x1,y1,x2,y2,color='#81B6A1',width=3):
    draw.line((x1,y1,x2,y2),fill=color,width=width)
    svg.append(f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}"/>')
def ellipse(x,y,w,h,fill,stroke=None):
    draw.ellipse((x,y,x+w,y+h),fill,stroke,2)
    svg.append(f'<ellipse cx="{x+w/2}" cy="{y+h/2}" rx="{w/2}" ry="{h/2}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else '')+'/>')
def words(x,y,text,size=30,color='#EAF2EC',bold=False,width=None,line_height=None):
    f=font(size,bold); line_height=line_height or round(size*1.5)
    lines=[]
    for p in text.split('\n'):
        buf=''
        for ch in p:
            if width and draw.textlength(buf+ch,font=f)>width and buf:
                lines.append(buf);buf=ch
            else:buf+=ch
        lines.append(buf)
    for i,t in enumerate(lines):
        yy=y+i*line_height
        draw.text((x,yy),t,font=f,fill=color,anchor='lt')
        svg.append(f'<text x="{x}" y="{yy+size*.88}" fill="{color}" font-size="{size}" font-weight="{700 if bold else 400}" font-family="Microsoft YaHei,DengXian,sans-serif">{esc(t)}</text>')
    return y+len(lines)*line_height

words(78,58,'019 / 产品理解归档 · 2026-11-21',25,'#9DB4A6')
words(78,116,'投影打怪玩具',74,bold=True)
words(78,210,'效果是什么？意义是什么？为什么不再深入？',39,'#C8DFD1')
box(78,292,1644,132,'273B30')
words(110,319,'当前判断：新增研究价值有限，归档参考。',43,'#D8F4B7',True)
words(110,378,'承认娱乐意义；本轮没有找到值得继续投入的具体新增能力或需求。',27,'#BBD1C0')

box(78,456,1644,358,'18261F','#344A3B')
words(110,484,'看见的效果',35,bold=True)
# Wall, targets and a handheld tool: an explicitly labelled schematic.
box(114,548,455,168,'E5EEE7',r=12)
for xx,yy,color in [(168,589,'#A9C8B5'),(296,579,'#E6C28F'),(423,597,'#C6B3D2')]:
    box(xx,yy,68,74,color,r=26)
    ellipse(xx+17,yy+24,8,10,'#233D30');ellipse(xx+43,yy+24,8,10,'#233D30')
    ln(xx+26,yy+51,xx+39,yy+51,'#233D30',3)
box(460,732,92,24,'8BB5A4',r=5)
box(493,754,27,35,'8BB5A4',r=4)
ln(489,728,456,688,'#AAC3B3',3)
ln(478,725,440,692,'#AAC3B3',3)
words(118,756,'原创示意，非原机复现',22,'#9DB4A6')
words(632,551,'投影目标 → 举起道具瞄准',38,bold=True)
words(632,612,'画面反馈 → 再次尝试 / 一起玩',38,bold=True)
words(632,686,'附件可见：墙面角色、玩具枪、儿童动作、多人和爆炸画面。\n未核验：原机每次命中是否与这些变化实时对应。',28,'#BBD1C0',width=1020,line_height=44)

box(78,846,804,434,'18261F','#344A3B')
box(918,846,804,434,'18261F','#344A3B')
words(110,878,'孩子为什么可能觉得好玩',35,bold=True)
words(950,878,'作为产品，可能有什么意义',35,bold=True)
left=['惊喜：怪物出现在自己家里。','掌控：我的动作让世界有回应。','挑战：目标清楚，还想试一次。','扮演：拿起道具，进入角色。','共玩：有人见证，也有人配合。']
right=['儿童：娱乐、假装、分享成功。','家庭：短时室内游戏、共同活动。','产品：道具、空间与规则形成体验。','软件：决定反馈、难度与复玩方式。','边界：这些意义尚未做家庭实测。']
for i,t in enumerate(left): words(110,947+i*57,t,29,'#C5D9CC')
for i,t in enumerate(right): words(950,947+i*57,t,29,'#C5D9CC')

words(78,1322,'产品能力：研究过什么，做到哪一步',37,bold=True)
for i,(title,body,foot) in enumerate([
    ('硬件与交互','投影、道具、动作感知与设置。','未拆机 / 未实机验证'),
    ('软件与规则','命中、计分、行为、难度与多人规则。','已讨论 / 未实现游戏'),
    ('内容与使用','角色关卡、上手、空间、复玩与交付。','已有参照 / 未做需求与付费验证')]):
    xx=78+i*558
    box(xx,1386,528,218,'1D2E25')
    words(xx+26,1414,title,33,'#D8F4B7',True)
    words(xx+26,1474,body,28,width=476,line_height=42)
    words(xx+26,1550,foot,23,'#9DB4A6',width=476,line_height=34)

box(78,1644,1644,365,'33291F','#725641')
words(110,1674,'为什么当前没有太多新增研究价值',38,'#F3D1A0',True)
reasons=[('已有覆盖','家庭体感游戏、互动投影与定制模板已有供给。'),
         ('缺少增量','尚未找到具体用户、反复需求和我们独有的改进。'),
         ('验证不足','原机、跨日复玩、真实付费与成本均未实测。'),
         ('扩展偏题','城市纸盒 / PDF未保留核心交互，不能验证原产品。')]
for i,(tag,body) in enumerate(reasons):
    yy=1744+i*57
    words(110,yy,tag,28,'#F3D1A0',True)
    words(282,yy,body,28,'#E1D3BF',width=1380,line_height=42)

words(78,2054,'保留什么',34,'#D8F4B7',True)
words(348,2054,'效果参考 · 产品机制理解 · 官方来源 · 讨论与偏题记录',30)
words(78,2124,'停止什么',34,'#F3D1A0',True)
words(348,2124,'继续立项、追加游戏演示、继续扩展城市纸质任务盒',30)
ln(78,2200,1722,2200,'#344A3B',2)
words(78,2236,'判断对象是“我们继续投入这一方向的收益”，不是所有游戏软件的价值。',27,'#BBD1C0')
words(78,2295,'来源：原帖 noni__z；Nex 与 LUMOplay 官方资料。完整来源、未知项与历史样稿见网页。',23,'#9DB4A6')
im.save(ASSETS/'projection-play-overview.png',optimize=True)
(ASSETS/'projection-play-overview.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-label="投影打怪玩具研究汇总"><rect width="100%" height="100%" fill="#101916"/>'+''.join(svg)+'</svg>',encoding='utf-8')

source_pdf=ROOT/'output/pdf/suzhou-window-spirit-print-and-play-v01.pdf'
source_preview=ROOT/'output/pdf/suzhou-window-spirit-preview.png'
for source,target in [(source_pdf,HERE/'archive/suzhou-window-spirit-v01.pdf'),(source_preview,HERE/'archive/suzhou-window-spirit-preview.png')]:
    if source.exists():
        target.parent.mkdir(exist_ok=True)
        shutil.copy2(source,target)
DATA['archive']={
  'title':'苏州小窗灵：今晚谁来做客？', 'kind':'11页A4纸质活动样稿',
  'status':'历史试探，已停止；不是投影产品原型，也不是已验证的亲子产品',
  'pdf':'archive/suzhou-window-spirit-v01.pdf',
  'pdf_sha256':hashlib.sha256((HERE/'archive/suzhou-window-spirit-v01.pdf').read_bytes()).hexdigest(),
  'hypothetical_numbers':{'price_cny':69,'estimated_base_unit_cost_cny':27,'pilot_budget_cny':1200,
                        'decision_threshold':'100个符合条件的家庭中至少8笔非亲友、未退款订单'},
  'numbers_note':'都是早期纸盒方案的测试设定和粗估，没有报价、成交或测试结果；不适用于原投影玩具。',
}
(HERE/'research-data.json').write_text(json.dumps(DATA,ensure_ascii=False,indent=2),encoding='utf-8')

sources=''.join(f'<li id="source-{s[0]}"><span>{s[0]}</span><div><a href="{esc(s[2])}" target="_blank" rel="noopener noreferrer">{esc(s[1])}</a><p>{esc(s[3])}</p></div></li>' for s in DATA['sources'])
reasons=''.join(f'<article><span class="reason-index">{i+1:02d}</span><div><h3>{esc(r[0])}</h3><p>{esc(r[1])}</p></div></article>' for i,r in enumerate(DATA['why_limited']))
timeline=''.join(f'<details><summary>{esc(r[0])}</summary><p>{esc(r[1])}</p></details>' for r in DATA['timeline'])
unknown=''.join('<li>'+esc(t)+'</li>' for t in DATA['unknown'])

HTML='''<!doctype html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="投影打怪玩具的效果、儿童童趣、家庭意义、软硬件与玩法逻辑，以及当前新增研究价值有限的判断。保留城市扩展、苏州纸样、来源和未验证项。">
<title>019 · 投影打怪玩具：效果、意义与研究判断</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23101916'/%3E%3Ccircle cx='16' cy='16' r='8' fill='%23c8e7ae'/%3E%3Ccircle cx='13' cy='15' r='1.5'/%3E%3Ccircle cx='19' cy='15' r='1.5'/%3E%3C/svg%3E">
  <link rel="stylesheet" href="styles.css">
</head><body>
<a class="skip" href="#main">跳到正文</a>
<header class="top"><a href="../index.html" class="brand">研究总库</a><span>019 / 产品理解归档</span><a href="#sources">资料与来源</a></header>
<main id="main">
<section class="hero" id="summary">
  <p class="eyebrow">投影互动玩具 · 资料整理于2026-11-21</p>
  <h1>效果直观。<br>新增研究价值<span>有限。</span></h1>
  <p class="lead">从“墙上打怪为什么好玩”到“我们是否值得继续研究”，把效果、儿童感受、产品意义与投入判断分别留下。</p>
  <div class="decision"><strong>当前决定：归档参考，停止继续产品探索。</strong><p>有儿童娱乐与共同游戏的意义；本轮没有找到值得我们继续投入的具体新增能力或需求缺口。这个判断针对本项目，不是对游戏软件或儿童游戏的全面否定。</p></div>
  <div class="actions"><a class="button" href="#overview">看一图汇总</a><a href="SOURCE_POST" target="_blank" rel="noopener noreferrer">看原帖与附件</a><button type="button" id="export-data">导出完整研究记录</button></div>
</section>
<nav class="section-nav" aria-label="本页目录"><a href="#effect">效果</a><a href="#fun">童趣</a><a href="#product">产品能力</a><a href="#meaning">意义</a><a href="#decision">研究判断</a><a href="#history">讨论记录</a><a href="#archive">历史纸样</a><a href="#sources">来源</a></nav>

<section class="overview" id="overview"><div class="section-intro"><p class="eyebrow">一张图，保留当前理解</p><h2>看见效果，也看清为什么停在这里。</h2><p>图中符号是原创理解示意，不是原机实拍或已完成的游戏原型。</p></div>
<figure><a href="assets/projection-play-overview.png" id="open-overview" aria-label="放大研究汇总图"><img src="assets/projection-play-overview.png" width="1800" height="2360" alt="投影打怪玩具汇总：墙面目标、道具瞄准与画面反馈；童趣来自惊喜、掌控、挑战、扮演和共玩；意义在娱乐与共同活动；已有方案覆盖且缺少增量与验证，所以当前归档，不再深入。"></a><figcaption>可放大阅读。<a href="assets/projection-play-overview.png" download>保存PNG</a> · <a href="assets/projection-play-overview.svg" download>保存可编辑SVG</a></figcaption></figure></section>

<section id="effect"><div class="section-intro"><p class="eyebrow">效果是什么</p><h2>把家庭墙面变成共同游戏的场景。</h2><p>原帖由noni__z于2026-11-10发布，阿拉伯语正文大意为：听说这是美国第一的游戏，关灯后出现怪物，孩子朝它们射击。排名没有提供出处。<a href="#source-S1">[S1]</a></p></div>
<div class="flow" aria-label="对产品交互循环的概念理解"><div><b>投影目标</b><span>墙面出现卡通角色</span></div><div><b>道具瞄准</b><span>握持、举起、扣动</span></div><div><b>动作反馈</b><span>画面变化与结果提示</span></div><div><b>继续游戏</b><span>再试一次、比赛或共玩</span></div></div>
<p class="note">这是一条概念理解，不代表已核实原机的输入识别、命中算法或每个镜头的实时因果。</p>
<figure class="source-frames"><img src="assets/source-reference-frames.jpg" width="1080" height="494" loading="lazy" alt="原帖视频三个参考帧：孩子瞄准墙上卡通角色、两名孩子同时参与、以及目标变化和爆炸式画面。"><figcaption>原帖附件的代表性抽帧，仅用于分析效果；由左至右约0、4、8秒。来源：<a href="SOURCE_POST" target="_blank" rel="noopener noreferrer">noni__z原帖 [S1]</a>。这是剪辑呈现，不能作为逐次命中或原机功能实测。</figcaption></figure>
OBSERVATIONS
<details class="evidence-note"><summary>本轮实际看了什么，没做什么？</summary><p>读取原帖正文和附件信息；取得约12.4秒视频，抽帧观察不同家庭中的墙面目标、道具、儿童动作和特效呈现。没有逐次命中核验、原机购买拆解、传感器识别测试或连续家庭实测。不能把广告式剪辑的呈现效果写成全部功能已证实。</p></details>
</section>

<section id="fun"><div class="section-intro"><p class="eyebrow">孩子为什么可能觉得好玩</p><h2>动作、想象和同场的人一起形成乐趣。</h2><p>以下是根据画面与玩法提出的解释，尚不是儿童访谈或实验结论。孩子可能喜欢其中几项，也可能只觉得第一眼新奇。</p></div>
FUN
<p class="note">好笑、兴奋、假装和“再试一次”本身可以有意义。长期兴趣、合作质量和额外发展收益需要另外观察，本页不以它们为已证实卖点。</p></section>

<section id="product"><div class="section-intro"><p class="eyebrow">回到产品层次</p><h2>用户拿到的是一场能开始、能参与、能继续的游戏。</h2><p>把它理解为家庭多人互动玩具，比只看一段画面或单个算法更完整。硬件、软件、内容和上手流程共同承担体验。</p></div>
LAYERS
<div class="inset"><h3>软件与玩法有价值，为什么这里仍然停下？</h3><p>命中、难度、角色行为和多人规则能够改变产品定位，也有一般学习价值。当前缺少的是：一个值得我们专门实现的新机制，以及它优于现有方案的实际证据。承认软件价值，不必推导出本项目值得继续开发。</p><p>鼠标或触屏原型可检验规则与反馈节奏；真实投影设备才能进一步检验瞄准、动作、空间、延迟和遮挡。本轮两种游戏原型都没有完成。</p></div>
</section>

<section id="meaning"><div class="section-intro"><p class="eyebrow">意义是什么</p><h2>保留娱乐意义，克制扩大解释。</h2></div>MEANING</section>

<section id="decision"><div class="section-intro"><p class="eyebrow">为什么不继续深入</p><h2>理解一个产品，不必把它变成我们的新项目。</h2><p>当前结论是“没有太多新增研究价值”。下面保留判断依据，避免以后只看到一个有趣效果，又从头推进同一条未经验证的支线。</p></div>
<div class="reasons">REASONS</div>
<div class="comparison"><h3>已有供给给了什么参照？</h3>COMPARISON<p>这里引用的是官方能力说明，未做同任务实测。Nex与LUMOplay不等于原帖玩具，也不能仅凭现有供给断言所有需求都被满足。它们足以提醒我们：基础体感、互动投影和内容模板本身不是已证明的新缺口。</p></div>
<div class="keep-stop"><article><h3>保留</h3><p>效果参考、产品机制解释、官方来源、讨论演变和历史样稿。</p></article><article><h3>停止</h3><p>不继续立项，不追加投影游戏演示，不继续扩展城市纸质任务盒。</p></article></div>
<details><summary>将来什么新证据出现，才值得重新打开？</summary><p>具体人群反复遇到的问题；同条件实机体验明显更好；真实复玩或付费行为；交付和维护投入适合我们。这里只记录重启依据，不安排新的开发或测试任务。</p></details>
</section>

<section id="history"><div class="section-intro"><p class="eyebrow">讨论怎样走到这里</p><h2>把修正记录下来，避免只留下一个结论。</h2><p>以下为讨论摘要，保留方向变化与用户反馈。前期设想不作为当前推荐。</p><button type="button" id="toggle-history" aria-expanded="false">展开全部讨论记录</button></div><div class="timeline">TIMELINE</div>
<details class="historical"><summary>曾讨论的产品方向：全部未验证，已停止推进</summary>DIRECTIONS<p>这些方向说明联想范围，不代表已有可交付软件、独特能力、用户需求或商业可行性。<a href="#source-S6">Creative Tonies [S6]</a>与<a href="#source-S7">LEGO活动 [S7]</a>只作家庭声音和儿童创作的参照。</p></details>
<details class="historical"><summary>曾讨论的六组城市文化玩法：设计草案，未做地方需求调查</summary>CITIES<p>这些是文化进入动作和规则的例子，不是对一座城市或当地儿童的固定描述；也没有证明投影游戏需要地方文化版本。城市之间、同城不同社区与家庭都有差异。</p></details>
</section>

<section id="archive"><div class="section-intro"><p class="eyebrow">偏题样稿，完整保留</p><h2>《苏州小窗灵》为什么看起来是PDF？</h2><p>讨论沿“城市童趣任务盒”展开后，按“直接打印试玩”的要求制作了11页A4材料。它是一套纸质亲子活动样稿：取景、搭纸桥、听声音、演小剧场。它没有实现原投影游戏的动作识别与即时反馈。</p></div>
<div class="archive-layout"><a href="archive/suzhou-window-spirit-preview.png"><img src="archive/suzhou-window-spirit-preview.png" loading="lazy" width="1640" height="1150" alt="历史苏州小窗灵纸质样稿预览，包含信、任务卡、纸偶、窗框和折立剧场。已停止推进。"></a><div><span class="tag">历史试探 / 已停止</span><h3>完成了材料，没有完成产品验证。</h3><p>含开场信、4张任务卡、2个取景窗框、4个纸偶、表情纸贴、2张纸桥模板、故事地图、小剧场、家长说明和试玩记录表。</p><p>PDF已做字体、版式与尺寸核对；没有实际打印剪折、儿童试玩或户外路线踏勘。故事地图不是现实导航。平江路为早期候选区域，官方介绍只支撑场地资料。<a href="#source-S5">[S5]</a></p><a class="button secondary" href="archive/suzhou-window-spirit-v01.pdf" download>下载历史11页纸样</a></div></div>
<div class="inset historical"><h3>早期数字全部是测试设定</h3><p>69元售价、27元单套基础成本、约1,200元首轮预算，以及“100个符合条件家庭中至少8笔净付款”的判断线，都是当时纸盒方案的粗估与测试假设。未取得供应商报价，没有真实订单或转化结果；这些数字不适用于原投影玩具。</p><p>本轮没有识别出纸盒的明确购买理由。用户指出没有看懂能力与价值，随后停止这条支线；把纸样再做得更漂亮，也不能代替对原产品的理解。</p></div></section>

<section id="limits"><div class="section-intro"><p class="eyebrow">证据范围</p><h2>不知道的，仍然保留未知。</h2></div><ul class="unknown">UNKNOWN</ul><p class="note">本页没有销售额、市场规模、用户测评、收益预测或已实施互动游戏。归档页和总结图的完成，只表示资料整理完成。</p></section>

<section id="sources"><div class="section-intro"><p class="eyebrow">公开来源与口径</p><h2>回到原帖，也保留已有产品参照。</h2><p>读取与整理日期：2026-11-21。产品功能可能变化，本文不作实时价格或购买建议。</p></div><ol class="sources">SOURCES</ol></section>
<footer><p>019 · 投影打怪玩具 / 当前无继续开发计划。</p><div><a href="../index.html">返回研究总库</a><a href="research-data.json" download>下载结构化记录</a><a href="offline.html">离线阅读版</a></div></footer>
</main>
<dialog id="overview-dialog" aria-labelledby="dialog-title"><div class="dialog-head"><h2 id="dialog-title">效果、意义与研究判断</h2><button type="button" id="close-overview">关闭</button></div><div class="dialog-image"><img src="assets/projection-play-overview.png" width="1800" height="2360" alt="完整研究汇总图，内容与正文一图汇总相同。"></div></dialog>
<p id="status" class="sr-only" role="status" aria-live="polite"></p>
  <script src="app.js" defer></script>
</body></html>'''

replacements={
 'SOURCE_POST':DATA['source_post'],
 'OBSERVATIONS':table(['观察项','可见内容与判断','证据状态'],DATA['observations']),
 'FUN':table(['乐趣线索','孩子的可能感受','解释','边界'],DATA['fun']),
 'LAYERS':table(['层次','包含什么','产品价值','本轮状态'],DATA['layers']),
 'MEANING':cards(DATA['meaning']), 'REASONS':reasons,
 'COMPARISON':table(['参照','官方介绍覆盖的能力','本轮使用方式'],[
   ['Nex Playground','家庭运动、合作等游戏。','说明家庭共同游戏已有产品供给。[S2]'],
   ['LUMOplay','互动投影、输入与显示分工，以及可定制游戏模板。','说明基础交互和内容模板已有方案。[S3][S4]']]),
 'TIMELINE':timeline, 'DIRECTIONS':table(['方向','原先的设想','目前理解'],DATA['directions']),
 'CITIES':table(['城市','文化线索','当时的玩法联想'],DATA['cities']),
 'UNKNOWN':unknown,'SOURCES':sources,
}
for a,b in replacements.items(): HTML=HTML.replace(a,b)
HTML=HTML.replace('href="../index.html"','href="../../docs/index.html"')
(HERE/'index.html').write_text(HTML,encoding='utf-8')

css=(HERE/'styles.css').read_text(encoding='utf-8')
js=(HERE/'app.js').read_text(encoding='utf-8')
offline=HTML.replace('  <link rel="stylesheet" href="styles.css">','<style>'+css+'</style>').replace('  <script src="app.js" defer></script>','<script>'+js+'</script>')
import base64
offline=offline.replace('src="assets/projection-play-overview.png"','src="data:image/png;base64,'+base64.b64encode((ASSETS/'projection-play-overview.png').read_bytes()).decode('ascii')+'"')
(HERE/'offline.html').write_text(offline,encoding='utf-8')

readme=f'''# 019 · {DATA['title']}

**当前判断：{DATA['conclusion']}**

{DATA['scope']}

[打开研究网页](index.html) · [离线阅读](offline.html) · [原帖]({DATA['source_post']}) · [返回总库](../../README.md#研究索引)

## 一图汇总

![投影打怪玩具：效果、意义与当前研究价值有限的判断](assets/projection-play-overview.png)

[PNG](assets/projection-play-overview.png) · [可编辑SVG](assets/projection-play-overview.svg)

原创图解，非原机复现。包括可见效果、童趣解释、产品能力、意义、研究停止依据与未知项。

## 效果与意义

原帖附件约12.4秒，包含投影目标、红蓝玩具枪、儿童移动、多人和爆炸画面。原机具体型号、每次命中是否真实对应、实时识别精度和长期复玩均未核验。“美国第一”没有排名来源。

童趣解释包括空间惊喜、道具扮演、行动掌控、明确挑战和共同参与。家庭短时娱乐与共玩是使用场景假设，不宣称学习、治疗或亲子关系改善成效。

软件与规则能够改变玩法、难度和复玩，有一般学习价值；当前没有识别出值得我们专门实现的新机制或需求缺口。Nex与LUMOplay提供已有供给参照，未做同任务实测。

## 为什么停止

'''+''.join(f'- **{a}**：{b}\n' for a,b in DATA['why_limited'])+'''
## 保留的讨论与样稿

网页保存从童趣、六组城市文化玩法、苏州纸盒，到软件层次、产品层次和最终停止的讨论摘要。全部扩展按历史设计设想理解，不是开发清单。

[11页纸质样稿](archive/suzhou-window-spirit-v01.pdf)保留作偏题记录。它没有实现动作识别、投影命中与实时反馈。已核对版式和尺寸，未实际剪折、儿童试玩或路线踏勘。69元、27元、1,200元和100家庭/8订单为早期纸盒测试假设，没有真实报价与交易，不适用于原玩具。

## 实现与资料

本项目只实现研究归档页、一张汇总图、离线版、资料导出、图像放大及讨论展开；没有制作互动投影游戏。

'''+''.join(f'- [{s[0]} · {s[1]}]({s[2]})：{s[3]}\n' for s in DATA['sources'])+'''
\n资料整理日期：2026-11-21。图和HTML通过 `build.py` 从固定内容生成；需要Python、Pillow与Windows等线字体。修改样式或脚本后重新运行。构建仅复制明确清单到 `docs/019-projection-play-study/`，不删除文件，不自动提交或发布。

```powershell
python projects/019-projection-play-study/build.py
```

公开地址以实际部署核对为准：
https://yydshly.github.io/20261104_codex_project/019-projection-play-study/
'''
(HERE/'README.md').write_text(readme,encoding='utf-8')
publish=['index.html','offline.html','styles.css','app.js','research-data.json','assets/projection-play-overview.png','assets/projection-play-overview.svg','assets/source-reference-frames.jpg','archive/suzhou-window-spirit-v01.pdf','archive/suzhou-window-spirit-preview.png']
(HERE/'publish-files.json').write_text(json.dumps(publish,indent=2),encoding='utf-8')
for name in publish:
    target=ROOT/'docs/019-projection-play-study'/name
    target.parent.mkdir(parents=True,exist_ok=True)
    if name.endswith('.html'):
        target.write_text((HERE/name).read_text(encoding='utf-8').replace('href="../../docs/index.html"','href="../index.html"'),encoding='utf-8')
    else:
        shutil.copy2(HERE/name,target)
print(f'Built {len(publish)} static files, one summary diagram, and README. No deletion or publication.')
