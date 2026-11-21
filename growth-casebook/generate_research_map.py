"""Render a single, editable research overview and a matching high-resolution PNG.

Build dependency: Pillow. The application itself does not need this generator.
"""
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from html import escape
import json
import math
import os
from pathlib import Path
import re

import httpx
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "static" / "research-map"
W, H = 2400, 6120
BG, INK, MUTED, LINE = "#f4f7f7", "#142a32", "#596e75", "#d6e1e3"
GREEN, GREEN_BG = "#166b58", "#e8f4ef"
BLUE, BLUE_BG = "#345f91", "#edf2fa"
AMBER, AMBER_BG = "#95601a", "#fff4df"
WHITE = "#ffffff"
FONT = Path("C:/Windows/Fonts/msyh.ttc")
BOLD = Path("C:/Windows/Fonts/msyhbd.ttc")


@lru_cache(maxsize=64)
def font(size, bold=False):
    return ImageFont.truetype(str(BOLD if bold else FONT), size)


def atomic_text(path, value):
    temp = path.with_name(path.name + ".tmp")
    with temp.open("w", encoding="utf-8", newline="") as stream:
        stream.write(value)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temp, path)


class Canvas:
    def __init__(self):
        self.image = Image.new("RGB", (W, H), BG)
        self.draw = ImageDraw.Draw(self.image)
        self.svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc">',
                    '<title id="title">Growth Casebook 产品研究全景图</title>',
                    '<desc id="desc">完整汇总研究目标、网页与数据入口、处理流程、八章报告、验证结果、价值、当前限制和待验证的扩展方向。</desc>',
                    f'<rect width="{W}" height="{H}" fill="{BG}"/>']
        self.text_boxes = []

    def rect(self, x, y, width, height, fill=WHITE, stroke=LINE, radius=18):
        self.draw.rounded_rectangle((x, y, x + width, y + height), radius=radius, fill=fill, outline=stroke, width=2 if stroke else 1)
        self.svg.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{radius}" fill="{fill}" stroke="{stroke or "none"}" stroke-width="2"/>')

    def line(self, x1, y1, x2, y2, color=LINE, width=2):
        self.draw.line((x1, y1, x2, y2), fill=color, width=width)
        self.svg.append(f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" stroke="{color}" stroke-width="{width}"/>')

    def arrow(self, x1, y1, x2, y2, color=GREEN):
        self.line(x1, y1, x2, y2, color, 4)
        angle = math.atan2(y2 - y1, x2 - x1)
        points = [(x2, y2)] + [(x2 - 18 * math.cos(angle + shift), y2 - 18 * math.sin(angle + shift)) for shift in [-.5, .5]]
        self.draw.polygon(points, fill=color)
        self.svg.append('<polygon points="' + ' '.join(f'{x},{y}' for x, y in points) + f'" fill="{color}"/>')

    def wrap(self, value, width, size, bold):
        result = []
        for paragraph in value.split("\n"):
            current = ""
            for token in re.findall(r"[A-Za-z0-9_./:+?=&%'-]+|[^\x00-\x7F]|\s+|.", paragraph):
                if font(size, bold).getlength(token) > width:
                    pieces = list(token)
                else:
                    pieces = [token]
                for piece in pieces:
                    if current and font(size, bold).getlength(current + piece) > width:
                        result.append(current.rstrip())
                        current = piece.lstrip()
                    else:
                        current += piece
            result.append(current.rstrip())
        return result

    def text(self, x, y, value, width, size=28, color=INK, bold=False, leading=None, bottom=None):
        leading = leading or int(size * 1.55)
        lines = self.wrap(str(value), width, size, bold)
        height = len(lines) * leading
        if bottom is not None and y + height > bottom:
            raise ValueError(f"Text exceeds its region: {str(value)[:70]} / {y + height} > {bottom}")
        if x < 0 or y < 0 or x + width > W or y + height > H:
            raise ValueError(f"Text outside poster: {value}")
        for index, line in enumerate(lines):
            py = y + index * leading
            self.draw.text((x, py), line, font=font(size, bold), fill=color, anchor="lt")
            self.svg.append(f'<text x="{x}" y="{py}" fill="{color}" font-family="Microsoft YaHei,Noto Sans CJK SC,sans-serif" font-size="{size}" font-weight="{700 if bold else 400}" dominant-baseline="text-before-edge">{escape(line)}</text>')
        self.text_boxes.append({"text": str(value), "x": x, "y": y, "width": width, "height": height})
        return y + height

    def pill(self, x, y, value, color=GREEN, fill=GREEN_BG):
        width = int(font(24, True).getlength(value)) + 40
        self.rect(x, y, width, 44, fill, None, 22)
        self.text(x + 20, y + 7, value, width - 30, 24, color, True, 32)
        return width

    def section(self, n, y, title, note="", color=GREEN):
        self.rect(100, y, 54, 54, color, None, 15)
        self.text(114, y + 5, str(n), 34, 32, WHITE, True, 43)
        self.text(174, y + 1, title, 1430, 38, INK, True, 54)
        if note:
            self.text(1640, y + 10, note, 660, 24, MUTED, False, 34)

    def card(self, x, y, width, height, title, body, fill=WHITE, color=INK, size=28):
        self.rect(x, y, width, height, fill)
        end = self.text(x + 28, y + 25, title, width - 56, 33, color, True, 48, y + height - 24)
        return self.text(x + 28, end + 14, body, width - 56, size, MUTED, False, int(size * 1.55), y + height - 20)


def snapshot():
    with httpx.Client(base_url="http://127.0.0.1:8766", timeout=8) as client:
        projects = client.get("/api/projects").raise_for_status().json()["items"]
        discovery = client.get("/api/discovery").raise_for_status().json()
    return {"captured_at": datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds"),
            "projects": len(projects), "sources": sum(p["source_count"] for p in projects),
            "actions": sum(p["action_count"] for p in projects),
            "coverage": {kind: sum(p["coverage"] == kind for p in projects) for kind in ["website", "repository", "listing_only"]},
            "discovered_published": discovery["counts"].get("published", 0),
            "candidates": discovery["counts"].get("candidate", 0), "settings": discovery["settings"],
            "product_hunt": [{"name": p["name"], "status": p["website_resolution"].get("status"), "coverage": p["coverage"]}
                             for p in projects if p.get("website_resolution")],
            "validation_tests": 32,
            "evidence": ["static/project-review.md", "casebook/public_products.py", "casebook/website_resolver.py", "casebook/collect.py", "casebook/report.py", "GET /api/projects", "GET /api/discovery"]}


def main():
    data = snapshot()
    c = Canvas()
    c.rect(0, 0, W, 278, INK, None, 0)
    c.text(100, 40, "GROWTH CASEBOOK  /  产品研究全景", 1800, 28, "#9edfc9", True, 42)
    c.text(100, 99, "从公开线索，到可回查的中文产品研究库", 2200, 61, WHITE, True, 88)
    c.text(100, 202, "固定结构组织证据，让产品定位、公开做法与研究缺口可以被检索、比较和持续更新。", 2200, 30, "#d4e2e4", False, 46)
    c.pill(100, 306, "已实现 / 已观察", GREEN, GREEN_BG)
    c.pill(380, 306, "当前限制 / 待核对", AMBER, AMBER_BG)
    c.pill(710, 306, "扩展设想 / 待验证", BLUE, BLUE_BG)
    c.text(1510, 310, "本机验证快照 · " + data["captured_at"][:10], 790, 26, MUTED)

    c.section(1, 390, "我们研究了什么", "从产品拆解，到免费数据第一版")
    research = [
        ("研究起点：理解商业研究的结构", "参考把公开收入、获客动作与时间线放进固定报告的思路。原始产品未展示的实现细节仍属推测。"),
        ("当前目标：先跑通免费研究流程", "验证官网、仓库、目录与社区能提供哪些证据，覆盖开源工具和商业产品。\n代表：Plausible、Postiz、n8n、Hollr。"),
        ("形成能力：自动收集并留下依据", "发现产品、核对官网、采集资料、整理中文报告，保留原文、引用、缺口、失败原因和历史版本。"),
    ]
    for i, (title, body) in enumerate(research):
        c.card(100 + i * 744, 474, 712, 282, title, body)

    c.section(2, 810, "哪些入口：使用入口与数据入口要分清", "产品统一在 8766 内使用")
    c.card(100, 892, 610, 218, "8767 · 研究总库导航", "保留所有研究项目。\n本项目只保留一个跳转链接。", GREEN_BG)
    c.arrow(744, 1000, 828, 1000)
    c.rect(860, 892, 1440, 218, WHITE)
    c.text(890, 916, "8766 · 产品研究台（统一使用入口）", 1370, 38, GREEN, True, 54)
    c.text(890, 987, "项目总结  /  案例库  /  采集任务  /  自动发现", 1370, 31, INK, True, 48)
    c.text(890, 1046, "补充入口：新建研究、数据与方法、报告原文与 JSON 下载", 1370, 27, MUTED, False, 42)

    table_x, table_y = 100, 1148
    widths = [430, 400, 850, 520]
    c.rect(table_x, table_y, 2200, 66, INK, None, 12)
    x = table_x
    for width, text in zip(widths, ["数据入口", "发现什么", "取得什么", "如何理解边界"]):
        c.text(x + 24, table_y + 15, text, width - 48, 28, WHITE, True, 40)
        x += width
    rows = [
        ("GitHub", "api.github.com", "开源软件、自托管工具", "简介与官网、Stars/Forks、README、最近四条发布记录", "官方公开 API；匿名配额有限，Stars 仅用于初筛"),
        ("BetaList", "feeds.feedburner.com/BetaList", "新上线商业产品", "产品介绍、公开 Visit 跳转、官网与目录收录日期", "公开订阅；每轮最多解析六条，不要求有仓库"),
        ("Show HN", "hn.algolia.com/api", "社区展示的新产品", "产品链接、公开介绍、帖子日期与社区记录", "HN Search 公开 API；提交者与产品方关系待核对"),
        ("Product Hunt RSS", "producthunt.com/feed", "新发布产品；开源非必需", "名称、简介、发布日期、原始产品记录，再自动查找官网", "免登录订阅；网页跳转可能仍有 403，未知时保留简报"),
        ("手动提交", "8766 → 新建研究", "自己指定的产品", "提交产品官网或公开 GitHub 仓库，进入同一采集流水线", "只采集可访问的公网资料；相同官网或仓库去重"),
    ]
    for index, (name, address, target, fields, limits) in enumerate(rows):
        y = 1214 + index * 132
        c.rect(100, y, 2200, 132, WHITE if index % 2 == 0 else "#edf3f3", None, 0)
        c.text(124, y + 19, name, 386, 29, INK, True, 42)
        c.text(124, y + 68, address, 386, 22, MUTED, False, 32, y + 127)
        x = 530
        for width, value in zip(widths[1:], [target, fields, limits]):
            c.text(x + 24, y + 20, value, width - 48, 27, MUTED, False, 41, y + 126)
            x += width
    c.rect(100, 1900, 2200, 175, GREEN_BG, None)
    c.text(128, 1923, "官网匹配辅助：PH 公开跳转 · Hunted.Space · Apple 官方应用搜索（美国区）· HN 链接", 2140, 30, GREEN, True, 46)
    c.text(128, 1981, "核对名称、功能与同一产品回链；排除同名误匹配。多个候选冲突或证据不足时保持简报，等待后续核对。", 2140, 28, MUTED, False, 43, 2060)

    c.section(3, 2130, "资料如何变成报告", "自动发现 → 证据整理 → 展示")
    steps = [
        ("01 发现产品", "订阅、目录、社区或手动输入"),
        ("02 保存候选与去重", "官网 / 仓库身份；保留各来源"),
        ("03 核对产品官网", "名称 + 功能 + 产品关联回链"),
        ("04 免费采集", "首页、定价、内容、文档；有仓库再补充"),
        ("05 整理事实与动作", "来源引用、日期、指标与缺失项"),
        ("06 生成中文内容", "固定规则 + 本地翻译，原文可回查"),
        ("07 保存快照与版本", "SQLite、后台任务租约、原子发布"),
        ("08 网页展示与检索", "筛选、阅读、更新、历史版本、JSON"),
    ]
    for index, (title, body) in enumerate(steps):
        row, col = divmod(index, 4)
        x, y = 100 + col * 562, 2210 + row * 376
        c.card(x, y, 514, 190, title, body, size=27)
        if col < 3:
            c.arrow(x + 523, y + 86, x + 551, y + 86)
    c.rect(100, 2412, 1076, 142, GREEN_BG, None)
    c.text(128, 2433, "官网已核对 → 采集公开正文，发布官网资料版", 1020, 29, GREEN, True, 44)
    c.text(128, 2487, "单站通常最多四页；可选仓库、README、近四次发布。", 1020, 26, MUTED, False, 39, 2540)
    c.rect(1208, 2412, 1092, 142, AMBER_BG, None)
    c.text(1236, 2433, "官网未确认 → 中文简报 → 24 小时后自动重试", 1036, 29, AMBER, True, 44)
    c.text(1236, 2487, "保留原产品记录、失败原因和已取得的资料。", 1036, 26, MUTED, False, 39, 2540)
    settings = data["settings"]
    c.text(100, 2803, f"运行条件：每 {settings['interval_hours']} 小时发现一批、每批 {settings['batch_size']} 个；本地服务持续运行。采集遵循 robots.txt、接口配额、超时与体积限制。", 2200, 28, MUTED, False, 43)

    c.section(4, 2910, "报告输出什么", "八个固定章节 + 可回查的来源")
    chapters = [("产品概览", "面向谁、解决什么问题"), ("生意与定价", "公开套餐与价格片段"), ("获客入口", "内容、试用、文档与生态"), ("公开动作拆解", "动作与引用逐条关联"),
                ("社媒与社区", "官网账号链接与发布记录"), ("事件时间线", "仅用来源明确给出的日期"), ("竞品研究线索", "比较方向；深度拆解待补"), ("来源与数据缺口", "原文快照、失败原因与未知项")]
    for index, (title, body) in enumerate(chapters):
        row, col = divmod(index, 4)
        c.card(100 + col * 562, 2991 + row * 154, 514, 148, f"{index + 1:02d}  {title}", body, size=25)
    c.text(100, 3328, "使用能力：中文阅读与原文对照  ·  来源引用  ·  案例搜索  ·  版本回查  ·  更新研究  ·  JSON 导出", 2200, 29, GREEN, True, 44)

    c.section(5, 3434, "实际做到什么程度", "以下是本机记录，非商业成效指标")
    metrics = [(str(data["projects"]), "可见产品"), (str(data["sources"]), "公开来源记录"), (str(data["actions"]), "公开入口与动作"), (str(data["discovered_published"]), "自动发现已发布"), (str(data["candidates"]), "待处理候选")]
    for index, (value, label) in enumerate(metrics):
        x = 100 + index * 446
        c.rect(x, 3515, 416, 154, WHITE)
        c.text(x + 25, 3534, value, 360, 61, GREEN, True, 82)
        c.text(x + 25, 3619, label, 360, 26, MUTED, False, 38)
    cv = data["coverage"]
    c.pill(100, 3697, f"{cv['website']} 个取得官网正文", GREEN, GREEN_BG)
    c.pill(520, 3697, f"{cv['repository']} 个以仓库为主", BLUE, BLUE_BG)
    c.pill(880, 3697, f"{cv['listing_only']} 个保留发布简报", AMBER, AMBER_BG)
    c.text(100, 3764, "统计口径：按各产品最新报告汇总；来源记录并非去重网站数，入口与动作数量不等于获客效果。", 2200, 26, MUTED, False, 40)
    c.rect(100, 3836, 2200, 220, WHITE)
    c.text(128, 3859, "Product Hunt 首批验证：读取 50 个产品，处理 5 个，其中 3 个自动补齐官网", 2140, 33, INK, True, 48)
    c.text(128, 3923, "已补齐：Alter Contacts · Hollr · Beat Watcher    /    保留简报：Prompt Puncher · Backspin", 2140, 29, GREEN, True, 45)
    c.text(128, 3985, "32 项流程测试通过，并验证真实网页、匹配依据与旧版简报。3/5 仅代表这批样本，不代表整体成功率。", 2140, 26, MUTED, False, 40, 4045)

    c.section(6, 4110, "价值是什么，边界在哪里", "能运行的流程，与待验证的收益分开")
    c.rect(100, 4192, 1076, 728, GREEN_BG, None)
    c.text(132, 4218, "价值主张", 1000, 36, GREEN, True, 54)
    values = [("减少重复查找", "把零散信息放到同一套结构，帮助更快理解产品定位、定价和公开做法。"),
              ("支持案例比较", "按相同章节研究内容、试用、文档、社区和开发者生态，形成可借鉴的线索。"),
              ("保存研究依据", "保留来源、匹配过程、时间与历史版本，方便核对、复盘和继续开发。"),
              ("复用整条流程", "来源适配、身份核对、采集、报告和展示可以逐段改进，为进一步分析提供基础。")]
    y = 4300
    for title, body in values:
        c.text(132, y, title, 1000, 30, GREEN, True, 46)
        c.text(132, y + 50, body, 1000, 27, MUTED, False, 42, y + 140)
        y += 145
    c.rect(1208, 4192, 1092, 728, AMBER_BG, None)
    c.text(1240, 4218, "当前限制", 1010, 36, AMBER, True, 54)
    limits = ["数据缺口：收入与 MRR、真实流量、SEO 排名、渠道转化、完整社媒帖子。",
              "结论边界：公开展示与时间对齐可形成线索，无法据此证明动作带来客户或收入。",
              "来源边界：403、robots、接口配额、证书、动态页面与 2 MB 上限影响覆盖。",
              "质量边界：同名核对与本地翻译仍可能出错，价格语境和术语需要结合原文检查。",
              "分析边界：固定规则整理；竞品章节仍是研究线索，深度商业分析待补。",
              "运行边界：本机单人使用；停服务即暂停，MCP、个性化实验与多用户尚未实现。"]
    y = 4300
    for value in limits:
        c.text(1240, y, "• " + value, 1010, 27, MUTED, False, 42, y + 94)
        y += 98

    c.section(7, 4980, "可扩展方向：从资料库走向研究与行动", "以下均为待设计 / 待验证", BLUE)
    future = [
        ("A 先提高证据覆盖与质量", ["更多免费目录、内容与文档来源；保留来源授权和访问规则。", "增强官网实体匹配，加入人工核对队列与证据冲突处理。", "结构化定价、术语校对、失效链接检查和资料新鲜度提醒。", "建立人工标注样本，评估匹配准确性、漏采率、翻译与引用质量。"], "验证：减少误关联，资料更完整、更容易核对。"),
        ("B 再让资料支持研究与行动", ["语义检索、相似产品推荐、按目标客户和购买方式生成对照表。", "MCP 可先提供 search_projects / get_report 两个工具。", "结合自身产品背景，生成小实验卡片、执行清单与反馈记录。", "在取得收入时间序列后对齐公开事件，明确区分相关与因果。"], "验证：同任务对照，能否节省时间、改善决策与实验执行。"),
        ("C 按需补数据与交付能力", ["授权收入导入与 MRR 序列；需要数据方许可及清晰的指标口径。", "补充流量、SEO、社媒与转化数据，记录成本、时效和覆盖范围。", "部署常驻服务，完善用户权限、任务预算、缓存与运行监控。", "通过真实用户验证使用频率、价值与付费意愿，再决定商业化。"], "验证：可持续运行、数据合规与实际用户收益。"),
    ]
    for index, (title, bullets, measure) in enumerate(future):
        x = 100 + index * 744
        c.rect(x, 5062, 712, 672, BLUE_BG, None)
        end = c.text(x + 28, 5088, title, 656, 32, BLUE, True, 48, 5200)
        y = end + 22
        for point in bullets:
            end = c.text(x + 28, y, "• " + point, 656, 27, MUTED, False, 42, 5614)
            y = end + 20
        c.line(x + 28, 5620, x + 684, 5620, "#c6d5e6")
        c.text(x + 28, 5642, measure, 656, 25, BLUE, True, 38, 5724)

    c.rect(100, 5784, 2200, 150, INK, None)
    c.text(130, 5805, "继续开发的判断顺序：证据质量 → 研究效率 → 行动反馈 → 用户与商业验证", 2140, 32, WHITE, True, 48)
    c.text(130, 5869, "已验证：发现、采集、中文报告与展示可运行。待验证：实际节省多少时间、是否改善决策、是否有人愿意付费。", 2140, 26, "#cfdee1", False, 40, 5925)
    c.text(100, 5972, "实现基础：HTML / CSS / JS · FastAPI · SQLite · Worker · 本地翻译（可选 Ollama 润色摘要）", 2200, 25, MUTED, False, 38)
    c.text(100, 6020, "图中数据为固定快照。依据：本轮实现、项目回顾文档、8766 当前 API 与已完成的流程验证。", 2200, 24, MUTED, False, 36)

    OUT.mkdir(parents=True, exist_ok=True)
    c.svg.append("</svg>")
    atomic_text(OUT / "research-overview.svg", "\n".join(c.svg))
    atomic_text(OUT / "research-overview-data.json", json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    atomic_text(OUT / "research-overview-layout.json", json.dumps(c.text_boxes, ensure_ascii=False, indent=2) + "\n")
    temp = OUT / "research-overview.tmp.png"
    c.image.save(temp, format="PNG", optimize=True)
    os.replace(temp, OUT / "research-overview.png")
    print(json.dumps({"png": str(OUT / "research-overview.png"), "size": [W, H], "text_regions": len(c.text_boxes), "snapshot": data["captured_at"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
