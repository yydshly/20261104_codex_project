"""Standalone Chinese reports. All provider text is rendered as text, never HTML."""

from datetime import date
from html import escape
import json
import os
from pathlib import Path
import tempfile
from urllib.parse import urlparse


COUNTRIES = {"cn": "中国", "us": "美国", "jp": "日本", "gb": "英国"}
APPLE_HOSTS = {"apps.apple.com", "itunes.apple.com", "rss.marketingtools.apple.com", "play.google.com"}


def _safe_url(value):
    try:
        parsed = urlparse(str(value))
        if (parsed.scheme == "https" and parsed.hostname in APPLE_HOSTS
                and not parsed.username and not parsed.password
                and parsed.port in (None, 443)):
            return parsed.geturl()
    except (TypeError, ValueError):
        pass
    return ""


def _md(value):
    text = escape(str(value if value is not None else "—"), quote=True).replace("\n", " ").replace("\r", " ")
    for character in ("\\", "[", "]", "(", ")", "`", "*", "_", "|"):
        text = text.replace(character, "\\" + character)
    return text


def _count(value):
    return f"{value:,}" if isinstance(value, (int, float)) else "—"


def _move(product, chart):
    row = next((r for r in product.get("chart_moves", []) if r.get("chart") == chart), None)
    if not row:
        return "—"
    text = "#" + str(row.get("rank", "—"))
    gain = row.get("rank_gain")
    if isinstance(gain, (int, float)) and gain:
        text += f"（{'↑' if gain > 0 else '↓'}{abs(gain)}）"
    elif row.get("status") == "new_entry":
        text += "（新入榜）"
    return text


def _markdown(report):
    products = report.get("products", [])
    collection = report.get("collection", {})
    history = report.get("history_days", report.get("summary", {}).get("history_days", 1))
    lines = [f"# App 数据与趋势观察 · {report['as_of']}", "", "数据：Apple / Google Play 公开榜单与产品资料；按各商店地区独立比较。评分新增不等于下载量。", ""]
    if history < 2:
        lines += ["**正在建立基线：今天保存首份观测，尚无昨日数据可用于判断增长。**", ""]
    lines += [f"- 历史观测：{history} 天", f"- 今日市场样本：{len(products)} 个（同 App 在不同市场独立记录）",
              f"- 不同上架条目：{len({str(p.get('app_id')) for p in products})} 个", "", "## 产品观察", "",
              "| 产品 | 市场 | 方向 | 具体场景 | 核心能力 | 免费榜 | 付费榜 | 昨日以来新增评分 | 信号 |", "|---|---|---|---|---|---:|---:|---:|---|"]
    def score(p):
        gain = max([m.get("rank_gain") or 0 for m in p.get("chart_moves", [])] or [0])
        return (bool(p.get("is_spike")), p.get("rating_delta_1d") or 0, gain)
    for p in sorted(products, key=score, reverse=True)[:30]:
        name = _md(("Android · " if p.get("platform")=="android" else "iOS · ")+p.get("name", p.get("app_id", "")))
        url = _safe_url(p.get("store_url"))
        if url:
            name = f"[{name}]({url.replace(')', '%29').replace('(', '%28')})"
        signals = "；".join(str(s) for s in p.get("signals", [])) or "等待可比数据"
        row = [name, _md(COUNTRIES.get(p.get("country"), p.get("country", ""))),
               _md(p.get("direction", "待分类")), _md("、".join(p.get("scenes", [])) or "待补充"), _md("、".join(p.get("capabilities", [])) or "待补充"), _md(_move(p, ('android-' if p.get('platform')=='android' else '')+'top-free')), _md(_move(p, ('android-' if p.get('platform')=='android' else '')+'top-paid')),
               _md(_count(p.get("rating_delta_1d"))), _md(signals)]
        lines.append("| " + " | ".join(row) + " |")
    if not products:
        lines += ["", "今天还没有可用的产品观测。"]
    if len(products) > 30:
        lines += ["", "此处列出前 30 个市场样本，完整结果见同目录 HTML / JSON。"]
    lines += ["", "## 方向观察", "", "| 市场 | 方向 | 样本 | 可比较样本 | 排名上升 | 评分增长 | 评分暴涨 |", "|---|---|---:|---:|---:|---:|---:|"]
    for d in report.get("directions", []):
        row = [COUNTRIES.get(d.get("country"), d.get("country", "")), ("Android · " if d.get("platform")=="android" else "iOS · ")+d.get("direction", "待分类"),
               d.get("sample_count"), d.get("comparable_count"), d.get("positive_rank_apps"),
               d.get("rating_growth_apps"), d.get("spike_apps")]
        lines.append("| " + " | ".join(_md(x) for x in row) + " |")
    coverage = report.get("tag_coverage", {})
    lines += ["", "## 场景与能力增长", "",
              f"标签覆盖：{coverage.get('tagged', 0)}/{len(products)} 个市场样本；商店说明核对 {coverage.get('reviewed', 0)} 个，其余名称规则待复核。版本：{_md(coverage.get('taxonomy_version', '—'))}。",
              "多标签不相加；排名上升率只用连续两日同榜排名可比样本，新入榜另计。少于5个样本只作个案线索。安卓评分不按国家求和。", "",
              "| 平台 / 市场 | 标签类型 | 标签 | 样本 | 排名可比 | 排名上升 | 上升率 | 新入榜 | 评分增长 / 可比 |", "|---|---|---|---:|---:|---:|---:|---:|---:|"]
    for group in [g for g in report.get("tag_growth", []) if g["sample_count"] >= 3][:40]:
        rate = group["rank_up_rate"]
        row = [("Android" if group["platform"] == "android" else "iOS") + " / " + COUNTRIES.get(group["country"], group["country"]),
               "场景" if group["kind"] == "scenes" else "能力", group["tag"] + ("（小样本）" if group["small_sample"] else ""),
               group["sample_count"], group["rank_comparable_count"], group["positive_rank_apps"],
               f"{rate:.0%}" if rate is not None else "—", group["new_entry_apps"],
               f"{group['rating_growth_apps']} / {group['rating_comparable_count']}"]
        lines.append("| " + " | ".join(_md(x) for x in row) + " |")
    research=report.get('research', {})
    lines += ["", "完整标签、单产品线索和筛选见 HTML / JSON。", "", "## 评论样本与关键词统计", "",
              f"增长观测：{_md(research.get('growth_as_of', report['as_of']))}；评论采集：{_md(research.get('collected_on', '尚未采集'))}。",
              f"研究 {research.get('selected_count', 0)} 个产品，近期去重评论 {research.get('review_count', 0)} 条，其中1—2星 {research.get('low_star_count', 0)} 条；仅作关键词匹配统计，不代表全量用户意见；产品价值与机会由读者判断。", ""]
    for p in research.get('products', []):
        lines += [f"### {_md(p['name'])} · {_md(p['platform'])} / {_md(COUNTRIES.get(p['country'],p['country']))}", "",
                  f"样本 {p['sample_count']}；1—2星 {p['low_star_count']}；4—5星 {p['positive_count']}；来源状态 {_md(p['status'])}。",
                  "4—5星关键词匹配：" + _md('；'.join(t['label']+'（'+str(t['count'])+'条）' for t in p['needs']) or '证据不足'),
                  "1—2星关键词匹配：" + _md('；'.join(t['label']+'（'+str(t['count'])+'条）' for t in p['pains']) or '暂未匹配，不代表没有相关反馈'),
                  "改进请求表达匹配（不限星级）：" + _md('；'.join(t['label']+'（'+str(t['count'])+'条）' for t in p.get('requests',[])) or '暂未匹配'), ""]
    for note in research.get('methodology', []): lines.append('- '+_md(note))
    for error in research.get('errors', []): lines.append('- 评论来源异常：'+_md(error))
    lines += ["", "## 采集与数据质量", ""]
    run = collection.get("latest_run") or {}
    lines += [f"- 本次状态：{_md(run.get('status', '未知'))}"]
    for row in collection.get("chart_status", []):
        if row.get("date", report["as_of"]) != report["as_of"]:
            continue
        lines.append(f"- {_md(COUNTRIES.get(row.get('country'), row.get('country', '')))} / {_md(row.get('chart'))}：{_md(row.get('status'))}，{_md(row.get('count'))} 条")
    for q in report.get("quality", []) + collection.get("errors", []):
        lines.append("- " + _md(q))
    lines += ["", "## 计算口径", ""]
    for note in report.get("methodology", []):
        lines.append("- " + _md(note))
    lines.append("- " + _md(report.get("classification_note", "方向优先按可编辑名称规则识别，未匹配的回退到商店分类；需要人工复核。")))
    return "\n".join(lines) + "\n"


_HTML = r'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>App 数据与趋势观察 · __DATE__</title>
<style>
:root{color-scheme:light;--ink:#16302b;--muted:#61756e;--line:#d8e3dc;--green:#176f53;--paper:#f3f6f0;--white:#fff;--amber:#8f5a0d}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.65 system-ui,"Microsoft YaHei",sans-serif}main{max-width:1320px;margin:auto;padding:40px 28px 70px}header{display:flex;justify-content:space-between;gap:24px;align-items:start;border-bottom:1px solid var(--line);padding-bottom:24px}.eyebrow{font-size:12px;letter-spacing:.18em;color:var(--green);font-weight:700}h1{font-size:36px;letter-spacing:-.04em;margin:5px 0 8px}h2{font-size:22px;margin:0 0 8px}p{margin:0}.muted,.sub{color:var(--muted)}.sub{font-size:12px}.date{text-align:right;padding-top:12px;font-variant-numeric:tabular-nums}.banner{margin:24px 0 20px;padding:18px 20px;border:1px solid #c4dbca;border-radius:10px;background:#e8f1e5}.banner b{display:block;font-size:17px;margin-bottom:3px}.banner.warn{background:#fff6df;border-color:#ecd598}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0 28px}.card{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:18px}.card .value{display:block;font-size:31px;line-height:1.3;font-variant-numeric:tabular-nums;font-weight:650}.card .label{font-size:13px;color:var(--muted)}.tabs{display:flex;gap:20px;margin:0 0 24px;border-bottom:1px solid var(--line)}button,select,input{font:inherit}button{cursor:pointer}button:focus-visible,a:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #80b89d;outline-offset:3px}.tab{border:0;border-bottom:3px solid transparent;background:none;padding:12px 3px;color:var(--muted)}.tab[aria-selected=true]{border-color:var(--green);color:var(--green);font-weight:700}.panel[hidden]{display:none}.panel-intro{margin-bottom:18px;max-width:840px}.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:18px}label{display:grid;gap:4px;font-size:12px;color:var(--muted)}input,select{background:var(--white);color:var(--ink);border:1px solid #c4d2c8;border-radius:6px;padding:9px 11px;min-height:43px}input{width:min(320px,78vw)}.tablewrap{background:var(--white);border:1px solid var(--line);border-radius:10px;overflow:auto}table{border-collapse:collapse;width:100%;text-align:left;font-size:13px}th{background:#edf2ed;font-size:12px;color:#496057;white-space:nowrap;font-weight:650}th,td{padding:14px 16px;border-bottom:1px solid #e9eee8;vertical-align:top}tbody tr:last-child td{border-bottom:0}td.numeric{font-variant-numeric:tabular-nums;white-space:nowrap}td.app{min-width:220px;max-width:330px}a{color:var(--green);text-decoration:none}a:hover{text-decoration:underline}.app-name{font-weight:650;font-size:14px;overflow-wrap:anywhere}.pill{display:inline-block;border:1px solid #cbe0d1;border-radius:4px;padding:1px 6px;color:var(--green);font-size:11px;white-space:nowrap;margin:0 4px 4px 0}.pill.neutral{border-color:var(--line);color:var(--muted)}.pager{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;color:var(--muted);font-size:13px}.pager button{padding:7px 13px;border:1px solid var(--line);background:var(--white);border-radius:5px;color:var(--ink)}.pager button:disabled{opacity:.4;cursor:default}.empty{padding:36px;text-align:center;color:var(--muted)}.quality{margin-top:24px;border-top:1px solid var(--line);padding-top:20px}ul{padding-left:20px}.quality li{margin-bottom:6px}.status-ok{color:var(--green)}.status-error{color:#b0412c}footer{margin-top:36px;color:var(--muted);font-size:12px;border-top:1px solid var(--line);padding-top:18px}.notice{padding:13px 16px;background:#edf2ed;border-radius:6px;margin-bottom:16px;font-size:13px}@media(max-width:760px){main{padding:24px 15px 50px}header{display:block}h1{font-size:30px}.date{text-align:left;font-size:13px}.cards{grid-template-columns:repeat(2,1fr);gap:9px}.card{padding:13px}.card .value{font-size:25px}th,td{padding:11px 12px}.tabs{gap:16px}.toolbar label{flex:1;min-width:130px}input,select{width:100%}}
.tag-cell{min-width:180px;max-width:290px}.tag-open{border:0;background:none;color:var(--green);padding:0;text-align:left;text-decoration:underline}.tag-basis{font-size:11px;color:var(--muted);margin-top:3px}.research-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr));gap:16px;margin:18px 0}.research-card{background:var(--white);border:1px solid var(--line);border-radius:10px;padding:20px;overflow-wrap:anywhere}.research-card h3{margin:0 0 9px;font-size:18px}.research-card h4{margin:16px 0 5px;font-size:14px}.research-card p{margin:7px 0}.evidence{margin:8px 0;padding:9px 12px;border-left:3px solid #c4d2c8;background:#f3f6f0;font-size:12px}.research-card summary{cursor:pointer;color:var(--green)}.tabs{flex-wrap:wrap;gap:16px}.research-card .sub{line-height:1.7}</style></head><body><main>
<header><div><div class="eyebrow">APP GROWTH RADAR</div><h1>App 数据与趋势观察</h1><p class="muted">逐日记录排名、评分变化和评论样本，提供可回查的数据，由读者判断。</p></div><div class="date"><strong id="date"></strong><div class="sub">iOS 中美日英 · 安卓美日英 / App Store + Google Play</div><a class="latest-link" href="latest.html">打开最新报告 ↗</a></div></header>
<div id="banner" class="banner" role="status"></div><div class="cards" id="cards"></div>
<div class="tabs" role="tablist" aria-label="报告内容"><button class="tab" role="tab" aria-selected="true" aria-controls="products" id="tab-products" data-panel="products">产品观察</button><button class="tab" role="tab" aria-selected="false" aria-controls="directions" id="tab-directions" data-panel="directions" tabindex="-1">方向观察</button><button class="tab" role="tab" aria-selected="false" aria-controls="tags" id="tab-tags" data-panel="tags" tabindex="-1">场景与能力</button><button class="tab" role="tab" aria-selected="false" aria-controls="research" id="tab-research" data-panel="research" tabindex="-1">评论统计</button><button class="tab" role="tab" aria-selected="false" aria-controls="trends" id="tab-trends" data-panel="trends" tabindex="-1">产品趋势总览</button><button class="tab" role="tab" aria-selected="false" aria-controls="collection" id="tab-collection" data-panel="collection" tabindex="-1">采集与口径</button></div>
<section class="panel" id="products" role="tabpanel" aria-labelledby="tab-products"><div class="panel-intro"><h2>关注产品的变化</h2><p class="muted">排名上升与评分新增分别观察。所有比较限定在同一市场；没有历史数据的指标显示为“—”。</p></div><div class="toolbar"><label>平台<select id="platform"><option value="">全部平台</option><option value="ios">iOS</option><option value="android">Android</option></select></label><label>市场<select id="country"><option value="">全部市场</option></select></label><label>具体场景<select id="scene"><option value="">全部场景</option></select></label><label>核心能力<select id="capability"><option value="">全部能力</option></select></label><label>查找产品或方向<input id="search" type="search" placeholder="名称、开发者、场景、能力…"></label><label>信号<select id="signal"><option value="">全部产品</option><option value="growth">有增长信号</option><option value="spike">评分暴涨</option><option value="new">新入榜</option></select></label><label>排序<select id="sort"><option value="signals">增长信号优先</option><option value="ratings">新增评分优先</option><option value="rank">排名优先</option><option value="name">名称</option></select></label></div><div class="tablewrap"><table><thead><tr><th>产品 / 开发者</th><th>市场</th><th>方向</th><th>具体场景</th><th>核心能力 / 依据</th><th>免费榜</th><th>付费榜</th><th>新增评分 / 日</th><th>观察信号</th></tr></thead><tbody id="product-rows"></tbody></table><div class="empty" id="empty-products" hidden>没有符合条件的产品。</div></div><div class="pager"><span id="result-count" aria-live="polite"></span><div><button id="prev">上一页</button> <button id="next">下一页</button></div></div></section>
<section class="panel" id="directions" role="tabpanel" aria-labelledby="tab-directions" hidden><div class="panel-intro"><h2>哪些方向一起在动</h2><p class="muted">同一 App 在同一市场只计一次。样本来自已收录榜单，不能代表整个行业的成功率。</p></div><div class="notice" id="classify-note"></div><div class="toolbar"><label>方向平台<select id="direction-platform"><option value="">全部平台</option><option value="ios">iOS</option><option value="android">Android</option></select></label><label>方向市场<select id="direction-country"><option value="">全部市场</option><option value="cn">中国</option><option value="us">美国</option><option value="jp">日本</option><option value="gb">英国</option></select></label></div><div class="tablewrap"><table><thead><tr><th>平台</th><th>市场</th><th>方向</th><th>样本</th><th>可比较样本</th><th>排名上升</th><th>评分增长</th><th>评分暴涨</th></tr></thead><tbody id="direction-rows"></tbody></table><div class="empty" id="empty-directions" hidden>正在积累方向样本。</div></div></section>
<section class="panel" id="tags" role="tabpanel" aria-labelledby="tab-tags" hidden><div class="panel-intro"><h2>按具体场景和能力看增长</h2><p class="muted">每行限定同平台、同市场。排名上升率以连续两日同榜排名可比 App 为分母；新入榜另列。多标签行不可相加，少于5个样本标记小样本。</p></div><div class="notice" id="tag-coverage"></div><div class="toolbar"><label>标签平台<select id="tag-platform"><option value="">全部平台</option><option value="ios">iOS</option><option value="android">Android</option></select></label><label>标签市场<select id="tag-country"><option value="">全部市场</option><option value="cn">中国</option><option value="us">美国</option><option value="jp">日本</option><option value="gb">英国</option></select></label><label>标签类型<select id="tag-kind"><option value="scenes">具体场景</option><option value="capabilities">核心能力</option></select></label><label>最少样本<select id="tag-min"><option value="3">至少3个</option><option value="5">至少5个</option><option value="10">至少10个</option><option value="1">全部（含单产品线索）</option></select></label><label>查找标签<input id="tag-query" type="search" placeholder="巡检、文档、位置…"></label><label>标签排序<select id="tag-sort"><option value="up">排名上升数量</option><option value="rate">排名上升比例</option><option value="new">新入榜数量</option><option value="ratings">评分增长数量</option></select></label></div><p class="sub" id="tag-count" aria-live="polite"></p><div class="tablewrap"><table><thead><tr><th>平台 / 市场</th><th>标签 / 查看产品</th><th>样本</th><th>排名可比</th><th>排名上升 / 比例</th><th>新入榜</th><th>评分增长 / 可比</th><th>代表产品</th></tr></thead><tbody id="tag-rows"></tbody></table><div class="empty" id="empty-tags" hidden>没有符合条件的标签。可降低最少样本或调整筛选。</div></div></section>
<section class="panel" id="research" role="tabpanel" aria-labelledby="tab-research" hidden><div class="panel-intro"><h2>评论样本与关键词统计</h2><p class="muted">按星级展示数量、关键词匹配、日期、版本和原文短摘录。匹配结果需要读者核对，系统不输出产品机会或商业判断。</p></div><div class="notice" id="research-summary"></div><div class="toolbar"><label>评论平台<select id="research-platform"><option value="">全部平台</option><option value="ios">iOS</option><option value="android">Android</option></select></label><label>评论市场<select id="research-country"><option value="">全部市场</option><option value="cn">中国</option><option value="us">美国</option><option value="jp">日本</option><option value="gb">英国</option></select></label><label>采样产品<select id="research-app"><option value="">全部采样产品</option></select></label><label>查找产品或匹配主题<input id="research-query" type="search" placeholder="产品、关键词匹配主题…"></label></div><p class="sub" id="research-count" aria-live="polite"></p><h3>当前产品范围 · 全部星级分布</h3><div id="review-distribution" class="distribution" aria-label="当前产品范围的全部星级分布"></div><h3>逐产品：样本与关键词匹配</h3><div id="research-products" class="research-grid"></div><h3>评论证据 · 短摘录与来源</h3><div class="toolbar"><label>评论星级<select id="review-score"><option value="">全部证据</option><option value="low">1—2星</option><option value="positive">4—5星</option><option value="3">3星评论</option></select></label></div><div class="tablewrap"><table><thead><tr><th>产品 / 市场</th><th>星级 / 版本</th><th>评论日期 / 语言</th><th>原文短摘录 / 规则主题</th><th>来源</th></tr></thead><tbody id="review-rows"></tbody></table><div class="empty" id="empty-reviews" hidden>当前条件下没有评论证据。</div></div><div class="pager"><span id="review-count" aria-live="polite"></span><div><button id="review-prev">上一页</button> <button id="review-next">下一页</button></div></div><details class="quality"><summary>评论来源、采样方式与统计口径</summary><ul id="research-methodology"></ul><ul id="research-errors"></ul><div class="tablewrap"><table><thead><tr><th>App ID / 市场</th><th>语言 / 页码</th><th>有效 / 格式跳过</th><th>请求状态</th><th>来源</th></tr></thead><tbody id="review-sources"></tbody></table></div></details></section>
<section class="panel" id="collection" role="tabpanel" aria-labelledby="tab-collection" hidden><div class="panel-intro"><h2>数据从哪里来</h2><p class="muted" id="run-info"></p></div><div class="tablewrap"><table><thead><tr><th>市场</th><th>榜单</th><th>条数</th><th>状态</th><th>来源更新时间</th><th>来源</th></tr></thead><tbody id="source-rows"></tbody></table></div><div class="quality"><h2>数据质量</h2><ul id="quality"></ul></div><div class="quality"><h2>计算口径</h2><ul id="methodology"></ul></div></section>
<footer>公开数据的逐日观测 · 评分数量不等于下载量 · 此版本不估算收入 · 缺失日期不补零</footer>
</main><script id="report-data" type="application/json">__DATA__</script><script>
'use strict';
const data=JSON.parse(document.getElementById('report-data').textContent);
const names={cn:'中国',us:'美国',jp:'日本',gb:'英国'}, charts={'top-free':'免费榜','top-paid':'付费榜'};
const products=data.products||[], directions=data.directions||[], collection=data.collection||{}, run=collection.latest_run||{};
const el=id=>document.getElementById(id), node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);if(cls)n.className=cls;return n;};
const fmt=v=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('zh-CN'):'—';
function safeLink(value){try{const u=new URL(String(value));return u.protocol==='https:'&&['apps.apple.com','itunes.apple.com','rss.marketingtools.apple.com','play.google.com'].includes(u.hostname)&&!u.username&&!u.password&&(!u.port||u.port==='443')?u.href:null;}catch{return null;}}
function link(label,url){const u=safeLink(url);const n=node(u?'a':'span',label);if(u){n.href=u;n.target='_blank';n.rel='noopener noreferrer';}return n;}
function gain(p){return Math.max(0,...(p.chart_moves||[]).map(m=>m.rank_gain||0));}
function growing(p){return typeof p.growing==='boolean'?p.growing:(!!p.is_spike||gain(p)>0||(typeof p.rating_delta_1d==='number'&&p.rating_delta_1d>0));}
function isNew(p){return (p.chart_moves||[]).some(m=>m.status==='new_entry');}
function rank(p,type){const m=(p.chart_moves||[]).find(m=>m.chart===(p.platform==='android'?'android-'+type:type));if(!m)return '—';let s='#'+m.rank;if(typeof m.rank_gain==='number'&&m.rank_gain!==0)s+=' '+(m.rank_gain>0?'↑':'↓')+Math.abs(m.rank_gain);else if(m.status==='new_entry')s+=' 新入榜';return s;}
el('date').textContent=data.as_of+' · 每日观测';
const history=data.history_days??data.summary?.history_days??1, first=history<2;
el('banner').append(node('b',first?'正在建立增长基线':(run.status==='ok'||run.status==='success'?'今日观测已更新':'今日观测与采集状态')));
el('banner').append(node('span',first?'今天先保存首份真实数据。积累昨日数据后比较排名和新增评分；评分暴涨需要更长的连续基线。':`已积累 ${history} 天观测。优先看可比较样本；缺失数据与采集异常会在“采集与口径”中列出。`));
if(['partial','error','failed'].includes(run.status)){el('banner').classList.add('warn');el('banner').append(node('div','部分采集未完成，请查看采集状态。'));}
const cards=[['不同上架条目',new Set(products.map(p=>String(p.app_id))).size],['今日市场样本',products.length],['有增长信号的市场样本',products.filter(growing).length],['历史观测天数',history]];
for(const [label,value]of cards){const c=node('div',null,'card');c.append(node('span',fmt(value),'value'),node('span',label,'label'));el('cards').append(c);}
for(const country of [...new Set(products.map(p=>p.country))].sort()){const opt=node('option',names[country]||country);opt.value=country;el('country').append(opt);}
for(const [id,key] of [['scene','scenes'],['capability','capabilities']]){for(const value of [...new Set(products.flatMap(p=>p[key]||[]))].sort((a,b)=>a.localeCompare(b,'zh-CN'))){const opt=node('option',value);opt.value=value;el(id).append(opt);}const unknown=node('option','待补充');unknown.value='__untagged__';el(id).append(unknown);}
let page=0;const pageSize=40;
if(first)el('sort').value='rank';
function renderProducts(){const platform=el('platform').value,query=el('search').value.trim().toLowerCase(),country=el('country').value,signal=el('signal').value,sort=el('sort').value;
 const matchesTag=(p,key,value)=>!value||(value==='__untagged__'?!(p[key]||[]).length:(p[key]||[]).includes(value));
 let rows=products.filter(p=>matchesTag(p,'scenes',el('scene').value)&&matchesTag(p,'capabilities',el('capability').value)&&(!platform||p.platform===platform)&&(!country||p.country===country)&&(!query||[p.name,p.developer,p.direction,p.app_id,...(p.scenes||[]),...(p.capabilities||[])].join(' ').toLowerCase().includes(query))&&(!signal||(signal==='growth'&&growing(p))||(signal==='spike'&&p.is_spike)||(signal==='new'&&isNew(p))));
 rows.sort((a,b)=>{if(sort==='name')return String(a.name).localeCompare(String(b.name));if(sort==='ratings')return (b.rating_delta_1d??-1)-(a.rating_delta_1d??-1);if(sort==='rank')return Math.min(999,...(a.chart_moves||[]).map(m=>m.rank||999))-Math.min(999,...(b.chart_moves||[]).map(m=>m.rank||999));return Number(!!b.is_spike)-Number(!!a.is_spike)||Number(growing(b))-Number(growing(a))||gain(b)-gain(a)||(b.rating_delta_1d??-1)-(a.rating_delta_1d??-1);});
 const pages=Math.max(1,Math.ceil(rows.length/pageSize));page=Math.min(page,pages-1);el('product-rows').replaceChildren();
 for(const p of rows.slice(page*pageSize,(page+1)*pageSize)){const tr=node('tr'),app=node('td',null,'app');const a=link(p.name||p.app_id,p.store_url);a.className='app-name';app.append(a,node('div',(p.platform==='android'?'Android · ':'iOS · ')+(p.developer||'开发者资料缺失'),'sub'));const historyButton=node('button','历史趋势','trend-open');historyButton.type='button';historyButton.addEventListener('click',()=>openProductTrend(p));app.append(historyButton);
 const sig=node('td');for(const s of (p.signals||[]))sig.append(node('span',s,'pill'));if(!sig.childNodes.length)sig.append(node('span',first?'建立基线':'暂无已确认信号','pill neutral'));
 if(p.is_spike&&typeof p.spike_ratio==='number')sig.append(node('div','评分增速 '+p.spike_ratio.toFixed(1)+'×','sub'));
 const scene=node('td',null,'tag-cell'),capability=node('td',null,'tag-cell');for(const [target,key] of [[scene,'scenes'],[capability,'capabilities']]){for(const label of p[key]||[]){const pill=node('span',label,'pill neutral');const evidence=(p.tag_evidence||[]).find(e=>e.kind===key&&e.label===label);pill.title=evidence?evidence.basis+' · '+evidence.rule_id:'待复核';target.append(pill);}if(!target.childNodes.length)target.append(node('span','待补充','sub'));}
 capability.append(node('div',p.tag_status||'待补充','tag-basis'));const source=(p.tag_evidence||[]).find(e=>safeLink(e.source_url));if(source)capability.append(link('商店说明 ↗',source.source_url));if(p.tag_note)capability.append(node('div',p.tag_note,'sub'));
 tr.append(app,node('td',names[p.country]||p.country),node('td',p.direction||'待分类'),scene,capability,node('td',rank(p,'top-free'),'numeric'),node('td',rank(p,'top-paid'),'numeric'),node('td',fmt(p.rating_delta_1d),'numeric'),sig);el('product-rows').append(tr);}
 el('empty-products').hidden=rows.length>0;el('result-count').textContent=`${rows.length} 个市场样本 · 第 ${page+1} / ${pages} 页`;el('prev').disabled=page===0;el('next').disabled=page>=pages-1;}
for(const id of ['platform','country','scene','capability','search','signal','sort'])el(id).addEventListener(id==='search'?'input':'change',()=>{page=0;renderProducts();});
el('prev').addEventListener('click',()=>{page--;renderProducts();});el('next').addEventListener('click',()=>{page++;renderProducts();});
el('classify-note').textContent=data.classification_note||'方向优先按可编辑名称规则识别，未匹配的回退到商店分类；需要人工复核。';
function renderDirections(){el('direction-rows').replaceChildren();const rows=directions.filter(d=>(!el('direction-platform').value||d.platform===el('direction-platform').value)&&(!el('direction-country').value||d.country===el('direction-country').value));for(const d of rows){const tr=node('tr');for(const v of [d.platform==='android'?'Android':'iOS',names[d.country]||d.country,d.direction,fmt(d.sample_count),fmt(d.comparable_count),fmt(d.positive_rank_apps),fmt(d.rating_growth_apps),fmt(d.spike_apps)])tr.append(node('td',v));el('direction-rows').append(tr);}el('empty-directions').hidden=rows.length>0;}for(const id of ['direction-platform','direction-country'])el(id).addEventListener('change',renderDirections);renderDirections();
const statusNames={ok:'完成',success:'完成',partial:'部分完成',error:'失败',failed:'失败',running:'运行中'};
el('run-info').textContent=`本次状态：${statusNames[run.status]||run.status||'未知'} · 开始：${run.started_at||'—'} · 完成：${run.finished_at||'—'}`;
for(const r of collection.chart_status||[]){if(r.date&&r.date!==data.as_of)continue;const tr=node('tr'),state=node('td',statusNames[r.status]||r.status||'未知',r.status==='ok'?'status-ok':'status-error');if(r.last_error)state.append(node('div',r.last_error,'sub'));const source=node('td');source.append(link(r.chart.startsWith('android-')?'Google Play 来源 ↗':'Apple 来源 ↗',r.source_url));tr.append(node('td',names[r.country]||r.country),node('td',(r.chart.startsWith('android-')?'Android · ':'iOS · ')+(charts[r.chart.replace('android-','')]||r.chart)),node('td',fmt(r.count),'numeric'),state,node('td',r.source_updated_at||(r.chart.startsWith('android-')?'源未提供；观测 '+(r.observed_at||'—'):'—'),'sub'),source);el('source-rows').append(tr);}
const quality=[...(data.quality||[]),...(collection.errors||[])];if(!quality.length)quality.push('本次未记录采集错误；数据覆盖以各榜单状态为准。');for(const q of [...new Set(quality.map(String))])el('quality').append(node('li',q));
for(const m of data.methodology||[])el('methodology').append(node('li',m));el('methodology').append(node('li','iOS评分按商店地区；Google Play评分可能是全球汇总，不同市场不可相加，也不能换算为下载量。首日没有可比较增长；缺失日期不插值、不补零。'));
const tabs=[...document.querySelectorAll('[role=tab]')];function activate(t){for(const tab of tabs){const active=tab===t;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;el(tab.dataset.panel).hidden=!active;}document.body.classList.toggle('trend-panel-active',t.dataset.panel==='trends');document.body.classList.toggle('trend-overview-active',t.dataset.panel==='trends'&&!el('trend-overview').hidden);if(t.dataset.panel==='trends')renderTrend();}
for(const t of tabs){t.addEventListener('click',()=>activate(t));t.addEventListener('keydown',event=>{let index=tabs.indexOf(t);if(event.key==='ArrowRight')index=(index+1)%tabs.length;else if(event.key==='ArrowLeft')index=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;else return;event.preventDefault();activate(tabs[index]);tabs[index].focus();});}
const coverage=data.tag_coverage||{};
el('tag-coverage').textContent=`全体今日样本标签覆盖 ${fmt(coverage.tagged)} / ${fmt(coverage.total)}；商店说明核对 ${fmt(coverage.reviewed)}，待补充 ${fmt(coverage.untagged)}。名称规则标签待复核；功能说明不代表实测。规则版本 ${coverage.taxonomy_version||'—'}。规则变更不计作市场增长，安卓评分不跨地区求和。`;
function openTag(group){el('platform').value=group.platform;el('country').value=group.country;el('scene').value=group.kind==='scenes'?group.tag:'';el('capability').value=group.kind==='capabilities'?group.tag:'';el('search').value='';el('signal').value='';page=0;renderProducts();activate(el('tab-products'));el('tab-products').focus();}
function renderTags(){const query=el('tag-query').value.trim().toLowerCase(),sort=el('tag-sort').value;const rows=(data.tag_growth||[]).filter(g=>g.kind===el('tag-kind').value&&(!el('tag-platform').value||g.platform===el('tag-platform').value)&&(!el('tag-country').value||g.country===el('tag-country').value)&&g.sample_count>=Number(el('tag-min').value)&&(!query||g.tag.toLowerCase().includes(query)));
 const score=g=>sort==='rate'?(g.rank_up_rate??-1):sort==='new'?g.new_entry_apps:sort==='ratings'?g.rating_growth_apps:g.positive_rank_apps;rows.sort((a,b)=>score(b)-score(a)||b.rank_comparable_count-a.rank_comparable_count||a.tag.localeCompare(b.tag,'zh-CN'));
 el('tag-rows').replaceChildren();for(const g of rows){const tr=node('tr'),tag=node('td',null,'tag-cell'),button=node('button',g.tag,'tag-open');button.type='button';button.title='按此标签查看产品';button.addEventListener('click',()=>openTag(g));tag.append(button,node('div',g.small_sample?'小样本 · 仅作个案线索':g.small_rank_sample?'排名可比不足5个 · 谨慎解读比例':'样本内增长信号','sub'));const rate=g.rank_up_rate===null?'—':(g.rank_up_rate*100).toFixed(0)+'%';tr.append(node('td',(g.platform==='android'?'Android':'iOS')+' / '+(names[g.country]||g.country)),tag,node('td',fmt(g.sample_count)),node('td',fmt(g.rank_comparable_count)),node('td',fmt(g.positive_rank_apps)+' / '+rate),node('td',fmt(g.new_entry_apps)),node('td',fmt(g.rating_growth_apps)+' / '+fmt(g.rating_comparable_count)),node('td',(g.examples||[]).map(p=>p.name).join('、')));el('tag-rows').append(tr);}
 el('tag-count').textContent=rows.length+' 个标签分组 · 点击标签查看成员产品';el('empty-tags').hidden=rows.length>0;}
for(const id of ['tag-platform','tag-country','tag-kind','tag-min','tag-sort','tag-query'])el(id).addEventListener(id==='tag-query'?'input':'change',renderTags);
const research=data.research||{}, researchProducts=research.products||[];
for(const p of researchProducts){const option=node('option',p.name+' · '+(p.platform==='ios'?'iOS':'Android')+' / '+(names[p.country]||p.country));option.value=p.app_id;el('research-app').append(option);}
el('research-summary').textContent=research.collected_on?`增长观测 ${research.growth_as_of} · 评论采集 ${research.collected_on} · ${fmt(research.selected_count)} 个采样产品 · 近${research.lookback_days||90}天去重评论 ${fmt(research.review_count)} 条（1—2星 ${fmt(research.low_star_count)} 条，4—5星 ${fmt(research.positive_count)} 条）。样本选取仅用于限制采集量，不代表产品推荐。状态 ${research.status==='ok'?'已完成':'部分完成 / 请查看来源'}。样本非随机，不能据此推算总体差评率。`:'尚未采集评论；采集后显示样本数量、星级分布和原文来源。';
const reviewStates={ok:'已采集',partial:'部分采集',error:'请求失败',empty:'未取得评论',no_recent:'无近期样本'};let reviewPage=0;const reviewPageSize=30;
function evidenceBlock(e){const block=node('div',null,'evidence');block.append(node('div',e.score+'星 · '+e.posted_at.slice(0,10)+' · 版本 '+(e.version||'未提供'),'sub'),node('div',e.excerpt),link('查看来源评论 ↗',e.source_url));return block;}
function researchMatch(p){const q=el('research-query').value.trim().toLowerCase();return (!el('research-platform').value||p.platform===el('research-platform').value)&&(!el('research-country').value||p.country===el('research-country').value)&&(!el('research-app').value||p.app_id===el('research-app').value)&&(!q||[p.name,...p.scenes,...p.needs.map(t=>t.label),...p.pains.map(t=>t.label),...(p.requests||[]).map(t=>t.label)].join(' ').toLowerCase().includes(q));}
function renderResearch(){const ps=researchProducts.filter(researchMatch);el('research-products').replaceChildren();el('review-distribution').replaceChildren();const total=ps.reduce((n,p)=>n+p.sample_count,0);for(let star=5;star>=1;star--){const count=ps.reduce((n,p)=>n+(p.star_histogram?.[star]||0),0),row=node('div',null,'distribution-row'),track=node('div',null,'distribution-track'),bar=node('div',null,'distribution-bar');bar.style.width=(total?count/total*100:0)+'%';track.append(bar);row.append(node('span',star+'星'),track,node('span',count+'条 / '+(total?(count/total*100).toFixed(1):'0.0')+'%'));el('review-distribution').append(row);}
 for(const p of ps){const card=node('article',null,'research-card');card.append(link(p.name,p.store_url),node('div',(p.platform==='ios'?'iOS':'Android')+' / '+(names[p.country]||p.country)+' · '+p.sample_count+'条近期样本 · 1—2星 '+p.low_star_count+' · 4—5星 '+p.positive_count,'sub'),node('p','产品用途背景：'+(p.scenes.join('、')||'待补充')+'（'+p.tag_status+'）','sub'),node('div','来源状态：'+(reviewStates[p.status]||p.status)+' · '+p.selection_reason,'sub'));
 if(p.sample_date_min)card.append(node('div','样本日期：'+p.sample_date_min.slice(0,10)+' 至 '+p.sample_date_max.slice(0,10),'sub'));if(p.excluded_by_date)card.append(node('p','超出分析日期范围：'+p.excluded_by_date+' 条','sub'));
 for(const [field,title] of [['needs','4—5星关键词匹配'],['pains','1—2星关键词匹配'],['requests','改进请求表达匹配 · 不限星级']]){card.append(node('h4',title));if(!(p[field]||[]).length)card.append(node('p',field==='pains'?'未匹配评论仍可查看；有 '+p.unclassified_low_count+' 条低星评论未归入规则主题。':'当前规则未匹配，不代表没有相关反馈。','sub'));for(const t of (p[field]||[]).slice(0,5)){const details=node('details');details.append(node('summary',t.label+' · '+t.count+'条匹配'));if(t.evidence_level)details.append(node('p',t.evidence_level,'sub'));for(const e of t.evidence)details.append(evidenceBlock(e));card.append(details);}}
 if(p.errors.length)card.append(node('p',p.errors.join('；'),'sub'));el('research-products').append(card);}
 el('research-count').textContent=ps.length+' 个采样产品 · '+total+' 条近期去重评论 · 仅作信息展示';
 const score=el('review-score').value;const reviews=ps.flatMap(p=>(p.evidence||[]).map(e=>({...e,product:p}))).filter(e=>!score||(score==='low'&&e.score<=2)||(score==='positive'&&e.score>=4)||(score==='3'&&e.score===3)).sort((a,b)=>b.posted_at.localeCompare(a.posted_at));const pages=Math.max(1,Math.ceil(reviews.length/reviewPageSize));reviewPage=Math.min(reviewPage,pages-1);el('review-rows').replaceChildren();
 for(const e of reviews.slice(reviewPage*reviewPageSize,(reviewPage+1)*reviewPageSize)){const tr=node('tr'),source=node('td'),body=node('td');body.append(node('div',e.excerpt),node('div',e.themes.join('、')||'未匹配规则主题','sub'));source.append(link('原文来源 ↗',e.source_url));tr.append(node('td',(e.product.platform==='ios'?'iOS':'Android')+' · '+e.product.name+' / '+(names[e.product.country]||e.product.country)),node('td',e.score+'星 / '+(e.version||'未知')),node('td',e.posted_at.slice(0,10)+' / '+e.language),body,source);el('review-rows').append(tr);}
 el('review-count').textContent=reviews.length+' 条证据 · 第 '+(reviewPage+1)+' / '+pages+' 页';el('empty-reviews').hidden=reviews.length>0;el('review-prev').disabled=reviewPage===0;el('review-next').disabled=reviewPage>=pages-1;}
for(const id of ['research-platform','research-country','research-app','research-query','review-score'])el(id).addEventListener(id==='research-query'?'input':'change',()=>{reviewPage=0;renderResearch();});el('review-prev').addEventListener('click',()=>{reviewPage--;renderResearch();});el('review-next').addEventListener('click',()=>{reviewPage++;renderResearch();});
for(const note of research.methodology||[])el('research-methodology').append(node('li',note));for(const error of research.errors||[])el('research-errors').append(node('li',error));
for(const f of research.fetches||[]){const tr=node('tr'),source=node('td');source.append(link('评论请求来源 ↗',f.source_url));tr.append(node('td',f.app_id+' / '+(names[f.country]||f.country)),node('td',f.language+' / '+f.page),node('td',f.count+' / '+f.invalid_count),node('td',f.status+(f.error?' · '+f.error:'')),source);el('review-sources').append(tr);}
renderResearch();renderTags();renderProducts();if(location.hash==='#research')activate(el('tab-research'));
</script></body></html>'''


def _html(report):
    from .trend_view import CSS, HTML, JS
    from .overview_view import CSS as OVERVIEW_CSS, HTML as OVERVIEW_HTML, JS as OVERVIEW_JS
    from .comparison_view import CSS as COMPARE_CSS, HTML as COMPARE_HTML, JS as COMPARE_JS
    from .statistics_view import CSS as STATS_CSS, HTML as STATS_HTML, JS as STATS_JS
    from .briefing_view import CSS as BRIEF_CSS, HTML as BRIEF_HTML, JS as BRIEF_JS
    encoded = json.dumps(report, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    for old, new in (("&", "\\u0026"), ("<", "\\u003c"), (">", "\\u003e"),
                     ("\u2028", "\\u2028"), ("\u2029", "\\u2029")):
        encoded = encoded.replace(old, new)
    template = _HTML.replace('</style>', CSS+OVERVIEW_CSS+COMPARE_CSS+STATS_CSS+BRIEF_CSS+'</style>')
    overview_html = OVERVIEW_HTML.replace('__COMPARISON__', COMPARE_HTML).replace('__STATISTICS_LIST__', STATS_HTML).replace('__BRIEFING__', BRIEF_HTML)
    trend_html = HTML.replace('__OVERVIEW__', overview_html)
    template = template.replace('<section class="panel" id="collection"', trend_html+'<section class="panel" id="collection"')
    template = template.replace('renderResearch();renderTags();renderProducts();', JS+'\n'+STATS_JS+'\n'+BRIEF_JS+'\n'+COMPARE_JS+'\n'+OVERVIEW_JS+'\nrenderResearch();renderTags();renderProducts();')
    template = template.replace("if(location.hash==='#research')activate(el('tab-research'));", "if(location.hash==='#research')activate(el('tab-research'));else activate(el('tab-trends'));")
    return template.replace("__DATE__", escape(report["as_of"])).replace("__DATA__", encoded)


def _atomic_write(path, value):
    path = Path(path)
    handle, temporary = tempfile.mkstemp(prefix="." + path.name + ".", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(handle, "w", encoding="utf-8", newline="\n") as stream:
            stream.write(value)
        os.replace(temporary, path)
    except BaseException:
        if os.path.exists(temporary):
            os.unlink(temporary)
        raise


def write_reports(report: dict, output_dir: Path) -> dict[str, str]:
    """Write complete daily and latest snapshots; return absolute latest paths."""
    as_of = date.fromisoformat(report["as_of"]).isoformat()
    if as_of != report["as_of"]:
        raise ValueError("as_of must use YYYY-MM-DD")
    output_dir = Path(output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    artifacts = {
        "html": ("html", _html(report)),
        "json": ("json", json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"),
        "markdown": ("md", _markdown(report)),
    }
    result = {}
    for kind, (extension, content) in artifacts.items():
        _atomic_write(output_dir / f"{as_of}.{extension}", content)
        target = output_dir / f"latest.{extension}"
        _atomic_write(target, content)
        result[kind] = str(target)
    return result
