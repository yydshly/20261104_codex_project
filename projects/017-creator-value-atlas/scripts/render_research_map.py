"""Render one faithful, zoomable summary of the existing research. No network I/O."""

from pathlib import Path
from html import escape
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
OUT.mkdir(exist_ok=True)
W = 3600
M = 110
GAP = 32
CW = W - M * 2
BG = "#f1f4ef"
INK = "#203d37"
MUTED = "#566961"
LINE = "#cfdbd1"
GREEN = "#2f6955"
GOLD = "#a27035"
REG = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"

fonts = {}
def font(size, bold=False):
    key = (size, bold)
    if key not in fonts:
        fonts[key] = ImageFont.truetype(BOLD if bold else REG, size)
    return fonts[key]

measure = ImageDraw.Draw(Image.new("RGB", (1, 1)))
commands = []
audit = []

def rect(x, y, w, h, fill, radius=24, stroke=None):
    commands.append(("rect", (x, y, w, h, fill, radius, stroke)))

def text(x, y, value, size=37, fill=INK, bold=False):
    commands.append(("text", (x, y, value, size, fill, bold)))

def wrap(value, maxw, size=37, bold=False):
    result = []
    for paragraph in value.split("\n"):
        line = ""
        for ch in paragraph:
            if line and measure.textlength(line + ch, font=font(size, bold)) > maxw:
                result.append(line.rstrip())
                line = ch.lstrip()
            else:
                line += ch
        result.append(line.rstrip())
    return result

def para(x, y, value, maxw, size=37, fill=MUTED, bold=False, leading=None):
    leading = leading or round(size * 1.52)
    lines = wrap(value, maxw, size, bold)
    for line in lines:
        text(x, y, line, size, fill, bold)
        y += leading
    return y

def body_height(blocks, width, size=37):
    return sum(len(wrap(b, width, size)) * round(size * 1.52) + 18 for b in blocks)

def card(x, y, w, h, title, blocks, tag=None, accent=GREEN, size=37):
    rect(x, y, w, h, "#ffffff", 26, LINE)
    rect(x, y, 9, h, accent, 4)
    px, py = x + 40, y + 30
    if tag:
        text(px, py, tag, 27, accent, True)
        py += 48
    py = para(px, py, title, w - 80, 47, INK, True, 65) + 22
    for block in blocks:
        py = para(px, py, block, w - 80, size) + 18
    if py > y + h - 10:
        raise AssertionError(f"Card overflow: {title}: {py} > {y+h}")
    audit.append({"title": title, "height": h, "content_bottom": py-y})

def row_cards(y, cards, cols=3, size=37):
    w = (CW - (cols - 1) * GAP) / cols
    heights = []
    for c in cards:
        title_lines = len(wrap(c[0], w - 80, 47, True))
        heights.append(30 + (48 if len(c) > 2 and c[2] else 0) + title_lines*65 + 22 + body_height(c[1], w-80, size) + 28)
    h = max(heights)
    for i, c in enumerate(cards):
        card(M+i*(w+GAP), y, w, h, c[0], c[1], c[2] if len(c)>2 else None, size=size)
    return y+h+GAP

def section(y, number, title, subtitle):
    text(M, y, number, 31, GREEN, True)
    text(M+100, y-10, title, 57, INK, True)
    y = para(M+100, y+75, subtitle, CW-100, 32, MUTED, leading=48)
    return y+28

# Header and stable, explicitly overlapping counts.
rect(0, 0, W, 480, INK, 0)
text(M, 58, "观源  /  研究全景与行动方向", 36, "#cce1c7", True)
text(M, 140, "从创作者地图，到独立游戏行动计划", 94, "#ffffff", True)
text(M, 292, "我们研究了什么 · 扩展了什么 · 形成了什么判断 · 下一步验证什么", 43, "#e2ece5")
text(M, 384, "研究快照 2026.11.21    ｜    已有资料归纳＋编辑判断    ｜    单张可放大阅读", 30, "#c5d6ce")
y = 525
stats = [("12", "平台与分发入口"), ("12", "一级领域"), ("42", "全站作者样本"), ("109", "去重来源链接"), ("28", "独立游戏作者"), ("12", "其中中文作者"), ("56", "代表资料"), ("5", "学习路线")]
sw = CW/8
for i, (n, label) in enumerate(stats):
    x = M+i*sw
    text(x+16, y, n, 76, GREEN, True)
    text(x+16, y+111, label, 30, MUTED)
y += 182
y = para(M, y, "统计口径有重叠：28 位独立游戏作者属于全站 42 位；12 位中文作者属于这 28 位，其中 5 位是发行案例作者。来源数量不代表独立验证次数。", CW, 31, MUTED, leading=46)+36

# Research evolution: six equally weighted steps, no implication of a deployed crawler.
labels = [("01 观察工具", "Monid 相关采集场景"), ("02 追问价值", "名单能解决什么问题"), ("03 建立地图", "平台 → 领域 → 作者"), ("04 做深制作", "作品 → 学习 → 练习"), ("05 延伸经营", "中文项目与发行复盘"), ("06 变成行动", "横向比较 → 执行计划")]
rw = (CW-5*32)/6
for i,(title, sub) in enumerate(labels):
    x=M+i*(rw+32)
    rect(x,y,rw,175,"#e1ebe0",18)
    text(x+24,y+23,title,36,INK,True)
    para(x+24,y+86,sub,rw-48,28,MUTED,leading=40)
    if i<5:text(x+rw+4,y+65,"›",40,GREEN,True)
y += 225

y=section(y,"01","研究对象与价值框架","从公开信息出发，先确定用途，再判断谁值得关注、应该看什么、怎样用到任务里。")
y=row_cards(y,[
 ("起点：采集能带来什么",[
  "研究对象：平台、细分领域、作者、代表作品，以及作者的擅长方向、关注理由和学习顺序。",
  "Monid 的位置：采集工具候选。流程为发现接口 → 查看字段与计费 → 限量采样 → 清洗归类 → 人工复核。",
  "当前成果是研究网页与资料结构；尚未接入自动采集，也未建立完整商业联系人数据库。"],"研究范围"),
 ("四个维度分别判断",[
  "体量：同平台、同日期、同口径；专业度：原创内容、实现、作品和复盘。",
  "受众匹配：内容与实际目标人群是否吻合；合作效果：回复、报价、履约与结果另行核实。",
  "四种组合都可能有价值：大而综合、大而垂直、小而综合、小而垂直。不能只按粉丝量排序。"],"认识完善"),
 ("价值落在具体任务上",[
  "学习价值：少走搜索弯路，找到可靠原作、前置知识与阅读顺序。",
  "研究价值：将案例条件、成本、证据与适用范围放在一起，帮助作取舍。",
  "合作价值：从匹配名单推进到真实沟通、执行与复盘。资料整理的价值已可演示，付费需求仍待验证。"],"当前判断")
])

y=section(y,"02","横向地图：把分散资料放进同一套结构","覆盖是为了建立入口；各领域深度不同。独立游戏是当前做得最完整的纵向样本。")
y=row_cards(y,[
 ("12 个平台与入口",[
  "中文发现：小红书、哔哩哔哩、抖音、知乎、微信公众号。",
  "国际与专业：YouTube、X、GitHub、Substack、独立博客 / RSS。",
  "游戏专项：机核开发者投稿、itch.io。",
  "按目的、语言和内容形式选择入口，再核对单个作者与原文。"],"去哪里找"),
 ("12 个一级领域",[
  "AI与软件、科学教育、商业创业、设计影像、游戏开发、职业技能。",
  "生活消费、运动户外、美食旅行、家居手作、文化历史、健康科普。",
  "当前样本偏技术、教育与商业；消费、运动、旅行等仍有缺口。分类数量不等于每类都已充分研究。"],"如何划分"),
 ("统一资料卡与工作流",[
  "作者身份与平台 → 擅长方向 → 代表资料 → 关注理由 → 前置知识 → 阅读、练习与适用范围。",
  "每条保留来源、年份 / 版本、访问方式、核对深度与未知字段。跨平台合并需要直接证据。",
  "网页已支持搜索、交叉筛选、学习阶段链接、观察清单、最多三人对照，以及研究与进度导出。"],"如何复用")
])

y=section(y,"03","纵向深挖：独立游戏的制作、学习与经营","28 位作者、56 份代表资料，覆盖六个方向；以下分组用于导航，部分作者也涉及相邻方向。")
y=row_cards(y,[
 ("玩法与关卡",[
  "Mark Brown / GMTK、Maddy Thorson；中文：叶梓涛、王妙一、高鸣。",
  "代表切入点：Celeste 的容错与手感、《写首诗吧》、《WILL：美好世界》、《蜡烛人》。",
  "先做核心动作与限制，再看引导、反馈和关卡变奏。"],"从玩家动作开始"),
 ("引擎与项目入门",[
  "Brackeys、GDQuest；中文：麦扣 / M_Studio、凉鞋。",
  "代表切入点：Godot / GDScript 小项目、Unity 2D《勇士传说》、QFramework。",
  "先补语言并交出闭环；工程变复杂后，再按问题学习框架与分层。"],"先完成一个小样"),
 ("程序、算法与图形数学",[
  "Amit Patel / Red Blob Games、Bob Nystrom、Sebastian Lague、Freya Holmér；中文：冯乐乐。",
  "代表切入点：寻路与六角格、游戏循环与状态机、游戏数学、《Unity Shader入门精要》。",
  "由实际玩法问题驱动，只补当前需要的算法和技术。"],"按需要深入")
])
y=row_cards(y,[
 ("美术与工具",[
  "Pedro Medeiros / Saint11、Kenney；中文：Los-muteki / 像素美術實驗室。",
  "代表切入点：像素图解、原型素材、Aseprite 工具与转换示范。",
  "先保证轮廓、反馈与视觉一致，再增加表现复杂度。"],"先让玩家看懂"),
 ("声音反馈",[
  "Akash Thakkar。",
  "代表切入点：动作反馈、声音层次、音频协作与制作复盘。",
  "先为关键动作补反馈，再考虑层次与协作；中文专业声音作者仍待补充。"],"把操作变得可感知"),
 ("制作与发行",[
  "Tom Francis、Derek Yu、Rami Ismail、Chris Zukowski、Simon Carless。",
  "中文延伸：亚恒、夜神不说话、叶千落、传传、ash / 蓝桃游戏。",
  "代表问题：控制范围、原型试玩、商店表达、渠道匹配、合作分工与现金流。"],"从做出来到发出去")
])
rect(M,y,CW,250,"#e1ebe0",24)
text(M+35,y+25,"5 条学习路线 · 22 个学习阶段",40,INK,True)
para(M+35,y+95,"零基础做成小作品 / 已有原型继续打磨 / 准备公开与发行 / 中文起步路线 / 中文发行与商业化。\n共通顺序：定范围 → 做闭环 → 调手感 → 补视觉与声音 → 陌生玩家测试 → 公开与复盘；各路线按当前问题进入。",CW-70,35,INK,leading=53)
y+=290

y=section(y,"04","五个中文亲历案例：比较条件，而非照抄结果","横比团队、动作、现金、人力与可借用部分。以下数字属于各自的历史记录，不是当前报价或效果保证。")
widths=[620,850,940,CW-620-850-940]
heads=["案例与角色","做过什么","现金 / 人力口径","单人可借用与避坑"]
x=M
for w,h in zip(widths,heads):
    rect(x,y,w,90,INK,0)
    text(x+24,y+20,h,34,"#ffffff",True)
    x+=w
y+=90
case_rows=[
 ["亚恒 ·《拣爱》\n2018 宣传 / 2021 移植\n制作人主导推广",
  "明确作品特色，自制宣传片，联系媒体；移植时重查名称、平台和付费入口。",
  "2018 自述未向媒体付推广费；宣传片学习与制作约两天。全套宣发费用、其余工时未披露。",
  "复用一组实机物料＋匹配联系；先跑通一个平台。零媒体付款仍有劳动成本；该案例不证明全流程由单人完成。"],
 ["叶千落 ·《戴森球计划》\n2021 项目访谈\n研发团队＋专业发行",
  "类型玩家测试、社群维护、展会、配音文案协助与海外联系，按节点协作。",
  "所读资料未披露宣发总预算、单渠道回报和完整工时。存在多人分工。",
  "借用目标玩家测试、排期和持续沟通；一次经营一个主渠道。团队成绩不能归因于某一个动作。"],
 ["传传 ·《出将入相》\n2025 首周复盘\n制作人与发行合作",
  "线下试玩、新品节、结识发行伙伴；回看 Demo 完成度、活动时机与回本。",
  "一次展位与背板免费；差旅、住宿、人工与完整发行成本未披露，项目开发人数也未披露。",
  "体验完整、日期与响应能力合适时再参展。免费展位仍有成本；有曝光也可能未覆盖投入，首周不是终局。"],
 ["夜神 ·《拯救大魔王2：逆流》\n2020 发售约 18 天\n团队作品，作者承担宣发修复",
  "内容传播、首发宣传和上线修复同时进行；询问主播报价未成交，后来转做自己的内容。",
  "约 1.47 万元是当时估算的团队结算额，不是推广费或利润；自述首周修复 101 个问题。",
  "提前准备公告、常见问题与修复时段；避免每日内容和抢修同时超载。一次高额询价不等于必需支出。"],
 ["ash ·《逃离永明岛》\n2024 阶段账本 / 2025 首周\n明确的单人作品",
  "开发日志与试玩，未做付费宣发；首周结果低于预期，保留失利与支出复盘。",
  "前七个月直接支出约 1,579 美元，属于开发账本，排除生活与机会成本；自述约一年半、2,700 多小时。",
  "现金、工时和生活资金分账，活动先写目标。低直接支出仍有大量时间投入；案例不能证明买量会改善销量。"]
]
for ri,row in enumerate(case_rows):
    rh=max(len(wrap(v,w-48,32))*49 for v,w in zip(row,widths))+56
    x=M
    for ci,(v,w) in enumerate(zip(row,widths)):
        rect(x,y,w,rh,"#e7eee6" if ci==0 else ("#ffffff" if ri%2==0 else "#f8faf7"),0,LINE)
        para(x+24,y+25,v,w-48,32,INK if ci==0 else MUTED,bold=ci==0,leading=49)
        x+=w
    y+=rh
y+=34
y=para(M,y,"案例依据：亚恒 / 叶千落的 GameRes 本人署名或明确署源内容；传传的触乐原创；夜神与蓝桃的机核投稿。视频按完整文字稿核对，公开财务数字未独立审计。网页保留每案两份代表资料。",CW,30,MUTED,leading=45)+34

y=section(y,"05","适合一个人、低预算的推广方法与成本","优先级与批次数量属于本项目的起步建议，需要在自己的作品上检验。")
y=row_cards(y,[
 ("六种方法，按投入推进",[
  "① 实机物料：一句话玩法＋截图＋短片，重复使用。② 类型试玩：先约 3–5 位陌生目标玩家，找反复出现的卡点。",
  "③ 定向联系：先列 10 个匹配作者或媒体，分两批各 5 个；逐个改写联系理由。④ 适量开发日志：一个主渠道、固定回复时段。",
  "⑤ 有条件再参加 Demo 活动或展会。⑥ 确认瓶颈后，才做有上限的付费实验或外包。"],"方法"),
 ("现金、时间、生活分开算",[
  "0 元方案：已有工具与合法素材时，自制、主动招试玩和免费联系可不新增推广现金，但仍占用时间。",
  "500 元仅为可改的推广上限示例：40% 核心表达、20% 单次实验、40% 预备金；这些是留额度，不是报价或必须花完的钱。",
  "另列 Steam 应用费、开发与素材、自己的工时、生活资金。官方应用费为每款 100 美元或等值，返还须满足官方条件。"],"成本口径"),
 ("六项必须检查的坑",[
  "① 把自制算成零成本。② 为赶活动推出尚不可玩的 Demo。③ 把愿望单、销量、团队到款和净利润混算。",
  "④ 单人同时维护所有渠道。⑤ 照抄过时名单，或未核实身份就发 Key。⑥ 奖励换评测、操纵评分。",
  "所有传播都记录版本、现金、工时、反馈和同期其他事件；对方无回应时，先查匹配和物料，再决定是否继续。"],"避坑")
])

y=section(y,"06","能照着执行的发行计划：12 周准备＋上线后 30 天","假设已有 PC 可演示原型、面向 Steam 小体量买断。周数用于发行安排，剩余开发工期和代码修复另排；条件未满足就顺延。")
plan=[
 ("1｜第 1–2 周", "确定受众与范围", ["写一句话玩法、目标玩家与 3 个可比作品。", "分列开发、推广、生活与工时预算。", "准备 Steam 账号、应用费与平台状态记录。"], "产物：定位页与分账本。", "关口：能说清核心体验和暂不做的内容。"),
 ("2｜第 3–4 周", "准备物料与商店页", ["做约 30–60 秒实机短片及截图。", "核对名称、描述、功能、语言和价格，送审。", "页面公开后记录日期，设来源链接和反馈口。"], "产物：物料包与商店落点。", "关口：玩家能复述玩法，承诺与版本一致。"),
 ("3｜第 5–6 周", "陌生玩家试玩", ["约首批 3–5 位类型玩家，少解释地观察。", "记录卡点，修最影响理解处，再找新玩家。", "备版本、说明、已知问题，检查异机运行。"], "产物：观察与修正记录。", "关口：核心流程可独立完成，无阻断。"),
 ("4｜第 7–8 周", "联系与渠道复盘", ["筛 10 个匹配对象，核对公开联系入口。", "分两批各 5 个联系，记录版本与访问方式。", "每批复盘；有实质新信息再跟进一次。"], "产物：匹配与发送记录。", "关口：资料可访问，联系理由具体。"),
 ("5｜第 9–10 周", "活动或常规试玩", ["核对本届日期、资格、审核与差旅成本。", "准备演示与回复；不合适就做试玩更新。", "按同长度窗口记花费、反馈和数据变化。"], "产物：活动决定及观察表。", "关口：Demo、日期与响应能力都合适。"),
 ("6｜第 11 周及更早", "发布前检查", ["倒排商店与版本审核，留修改缓冲。", "干净安装测试启动、存档、退出与核心流程。", "核价格与折扣，备公告、FAQ 和修复时段。"], "产物：近终版与首发物料。", "关口：审核、等待期和关键体验均满足。"),
 ("7｜第 12 周，条件满足后", "发布与响应", ["选择自己能处理问题的时间执行发布。", "发布已准备公告，更新各入口和原联系人。", "固定查看启动、购买和存档问题，发修复说明。"], "产物：可买可玩的版本。", "关口：严重阻断时先修复、告知玩家。"),
 ("8｜上线后第 1 / 7 / 30 天", "对账与下一步", ["保存销量、退款、愿望单、来源和玩家问题。", "区分未结算部分、团队到款、费用与工时。", "只选一个下一步假设，额度用尽先停新增支出。"], "产物：三个节点复盘。", "关口：知道缺失数据与成本范围再加投入。")
]
pw=(CW-3*GAP)/4
for row in range(2):
    row_plan=plan[row*4:row*4+4]
    heights=[]
    for tag,title,tasks,output,gate in row_plan:
        blocks=[f"{i+1}. {t}" for i,t in enumerate(tasks)]+[output,gate]
        heights.append(30+48+len(wrap(title,pw-80,47,True))*65+22+body_height(blocks,pw-80,32)+28)
    h=max(heights)
    for i,(tag,title,tasks,output,gate) in enumerate(row_plan):
        blocks=[f"{j+1}. {t}" for j,t in enumerate(tasks)]+[output,gate]
        card(M+i*(pw+GAP),y,pw,h,title,blocks,tag,size=32)
    y+=h+GAP

rect(M,y,CW,315,INK,24)
text(M+36,y+26,"执行工具与时间边界",41,"#ffffff",True)
para(M+36,y+97,"网页内 24 项可勾选任务，可改项目名、推广上限和每周时间，保存到当前浏览器，并导出带原文引用的 JSON；另有联系模板、传播记录字段和分类账本。\n默认每周 5 小时：12 周容量 60 小时，发行前推广任务预算 43 小时，余 17 小时缓冲；上线后记录与复盘另预留 6 小时。上述工时是编辑编排，开发、修复和日常维护另排。",CW-72,34,"#e1ece5",leading=52)
y+=355
y=para(M,y,"平台约束按 2026.11.21 核对：Steam Direct 官网对首几款作品写明付费至发行至少 21 天；即将推出页面至少公开两周；商店页建议至少提前 7 个工作日送审。新品节每款仅一届，日期与资格需另核。以当前官方页面和应用后台为准。",CW,31,MUTED,leading=47)+40

y=section(y,"07","方向：先证明一个场景有用，再考虑产品化","优先服务中文、单人或小团队、低预算的独立游戏开发者，把资料与实际动作形成闭环。")
y=row_cards(y,[
 ("产品价值：三层递进",[
  "信息导航 → 专题目录、来源档案与学习路径；潜在收费依据是节省筛选时间、保持更新。",
  "细分研究 → 项目匹配、案例横比、适用条件与决策材料；候选形式是定制报告或持续研究。",
  "合作执行 → 核实合作条件、推进进度、记录结果；候选形式是明确范围的服务费。三种付费价值均待真实需求验证。"],"产品假设"),
 ("下一步：用一个项目验证",[
  "先给真实游戏填入受众、版本、预算、工时和目标；照计划完成一轮物料、试玩和定向联系。",
  "分别记录使用目录是否省时、材料是否更易理解、目标玩家是否玩懂、联系是否匹配，以及实际现金与工时。",
  "把回复、内容、访问、愿望单、购买和退款分开观察；达到继续条件后，再扩渠道、补作者或尝试服务。"],"优先方向"),
 ("可积累的资产与待补项",[
  "资产：有出处的案例库、作者与题材的关系、适用条件、更新记录、模板，以及自己的执行反馈。",
  "待补：中文声音作者、完整成本账、近期合作条件、受众与单渠道结果。先在一个场景形成复用，再扩大领域。",
  "自动化放在人工流程跑通之后：确认接口、许可、字段与成本，保留来源日期、去重和复核环节。"],"扩展顺序")
])

rect(M,y,CW,425,"#e8e5d6",24)
text(M+36,y+25,"结论的边界：资料可追溯，方法与商业价值仍需执行验证",42,INK,True)
para(M+36,y+105,"已做到：来源阅读与结构化、作者 / 作品 / 路线关联、五案横比、预算与任务模板、网页筛选 / 保存 / 对照 / 导出，并完成手机、保存和导出验收。\n尚未做到：独立财务审计、完整视频或付费课程实测、私人后台访问、合作询价或实际发信、真实发行投放、销量因果验证、付费与复购验证。\n全站 39 位作者的所列资料来源已读，3 位中文视频作者仍待复核；仅 3 个大众频道有非实时体量快照，其余体量待核。关注理由、路线、预算比例和优先级均是编辑判断。",CW-72,33,INK,leading=52)
y+=475
text(M,y,"核心闭环：公开资料 → 筛选与证据 → 任务匹配 → 小规模执行 → 记录结果 → 更新判断",42,GREEN,True)
y+=95
y=para(M,y,"依据：观源项目 README、平台与作者数据、独立游戏专题、中文发行案例与单人计划。逐项原文与官方规则见网页“来源与方法”及“案例与原文”。本图是对已完成研究的汇总，未来方向为待验证建议。",CW,29,MUTED,leading=44)+72
H=int(y)

image=Image.new("RGB",(W,H),BG)
draw=ImageDraw.Draw(image)
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">',
     '<title id="title">观源研究全景：从创作者地图到独立游戏行动计划</title>',
     '<desc id="desc">汇总研究范围、平台与领域、二十八位独立游戏作者、五个中文发行案例、推广成本和避坑、二十四项任务及产品验证方向。</desc>',
     f'<rect width="100%" height="100%" fill="{BG}"/>',
     '<g font-family="Microsoft YaHei, Noto Sans CJK SC, sans-serif">']
for kind,args in commands:
    if kind=="rect":
        x,y,w,h,fill,radius,stroke=args
        draw.rounded_rectangle((int(x),int(y),int(x+w),int(y+h)),radius,fill,stroke,width=2)
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}"'+(f' stroke="{stroke}" stroke-width="2"' if stroke else '')+'/>')
    else:
        x,y,v,size,fill,bold=args
        draw.text((round(x),round(y)),v,font=font(size,bold),fill=fill,anchor="lt")
        svg.append(f'<text x="{x}" y="{y+size*.88}" font-size="{size}" fill="{fill}" font-weight="{700 if bold else 400}">{escape(v)}</text>')
svg.append('</g></svg>')
png=OUT/'research-understanding-map-20261121.png'
image.save(png,optimize=True)
(OUT/'research-understanding-map-20261121.svg').write_text('\n'.join(svg),encoding='utf-8')
image.resize((1200,round(H/3)),Image.Resampling.LANCZOS).save(OUT/'research-understanding-map-preview.jpg',quality=88)
assert len(plan)==8 and sum(len(p[2]) for p in plan)==24
assert len(case_rows)==5
assert all(v['content_bottom'] < v['height'] for v in audit)
(OUT/'research-map-layout-audit.json').write_text(json.dumps({'width':W,'height':H,'cards':audit,'tasks':24,'cases':5},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'png':str(png),'size':[W,H],'cards':len(audit),'tasks':24,'bytes':png.stat().st_size},ensure_ascii=False))
