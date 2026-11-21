"""Conservative growth analysis over daily, market-specific App Store observations.

No network or database access lives here. Missing observations stay missing; rank
and rating growth are signals, never an estimate of downloads or revenue.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from typing import Any


CHART_LABELS = {"top-free": "iOS 免费榜", "top-paid": "iOS 付费榜", "android-top-free":"安卓免费榜", "android-top-paid":"安卓付费榜"}
COMPARABLE_CHART_STATES = {"up", "down", "unchanged", "new_entry"}


def _count(value: Any) -> int | None:
    """Only accept actual nonnegative integer counts, not rounded estimates."""
    if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
        return value
    return None


def _rank(value: Any) -> int | None:
    result = _count(value)
    return result if result is not None and result > 0 else None


def _day(value: Any) -> date | None:
    try:
        return date.fromisoformat(str(value))
    except (ValueError, TypeError):
        return None


def _key(row: dict[str, Any]) -> tuple[str, str]:
    return str(row.get("country", "")).lower(), str(row.get("app_id", ""))


def _chart_ok(status: dict[str, Any] | None) -> bool:
    return bool(status and status.get("status") == "ok")


def _complete(status: dict[str, Any] | None, limit: int) -> bool:
    if not _chart_ok(status):
        return False
    if "complete" in status:
        return status["complete"] is True
    count = _count(status.get("count"))
    return count is not None and count >= limit


def analyze(data: dict[str, Any]) -> dict[str, Any]:
    """Analyze the day in ``data['as_of']`` without mutating the input.

    ``snapshots``, ``charts`` and ``chart_status`` are lists of dictionaries.
    Dates are ISO calendar dates in the caller's stated timezone. Rows for the
    same logical key use last-in-list precedence, so the caller can pass ordered
    attempts. Complete previous charts require ``status='ok'`` and either an
    explicit ``complete=True`` or ``count >= chart_limit``.

    Products represent (country, app_id), not global app totals. A product is
    included when it has a snapshot today or appears on a successful chart today.
    Historical metadata may fill names, but today's rating count is never filled
    from yesterday. Chart move states: up/down/unchanged/new_entry/first_seen/
    insufficient. Rating spike detection requires nine consecutive observations:
    today's delta plus seven complete, nonnegative daily baseline deltas.
    """
    as_of = _day(data.get("as_of"))
    if as_of is None:
        raise ValueError("as_of must be an ISO date (YYYY-MM-DD)")
    today = as_of.isoformat()
    yesterday = (as_of - timedelta(days=1)).isoformat()
    limit = _rank(data.get("chart_limit", 100))
    if limit is None:
        raise ValueError("chart_limit must be a positive integer")

    quality: list[str] = []
    snapshots: dict[tuple[str, str, str], dict[str, Any]] = {}
    metadata: dict[tuple[str, str], tuple[str, dict[str, Any]]] = {}
    first_seen: dict[tuple[str, str], str] = {}
    observed_dates: set[str] = set()

    for row in data.get("snapshots", []):
        observed = _day(row.get("date"))
        country, app_id = _key(row)
        if observed is None or observed > as_of or not country or not app_id:
            continue
        day = observed.isoformat()
        key = country, app_id
        snapshots[(country, app_id, day)] = row
        if key not in metadata or day >= metadata[key][0]:
            metadata[key] = day, row
        first_seen[key] = min(first_seen.get(key, day), day)
        observed_dates.add(day)

    statuses: dict[tuple[str, str, str], dict[str, Any]] = {}
    for row in data.get("chart_status", []):
        observed = _day(row.get("date"))
        country = str(row.get("country", "")).lower()
        chart = str(row.get("chart", ""))
        if observed is None or observed > as_of or not country or not chart:
            continue
        statuses[(country, chart, observed.isoformat())] = row

    charts: dict[tuple[str, str, str], dict[str, int]] = defaultdict(dict)
    for row in data.get("charts", []):
        observed = _day(row.get("date"))
        country, app_id = _key(row)
        chart = str(row.get("chart", ""))
        rank = _rank(row.get("rank"))
        if (
            observed is None
            or observed > as_of
            or not country
            or not app_id
            or not chart
            or rank is None
        ):
            continue
        day = observed.isoformat()
        if not _chart_ok(statuses.get((country, chart, day))):
            continue
        charts[(country, chart, day)][app_id] = rank
        key = country, app_id
        first_seen[key] = min(first_seen.get(key, day), day)
        observed_dates.add(day)

    current_keys = {
        (country, app_id)
        for country, app_id, day in snapshots
        if day == today
    }
    for (country, chart, day), members in charts.items():
        if day == today:
            current_keys.update((country, app_id) for app_id in members)

    today_statuses = [
        row for (country, chart, day), row in statuses.items() if day == today
    ]
    for (country, chart, day), status in sorted(statuses.items()):
        if day != today:
            continue
        label = CHART_LABELS.get(chart, chart)
        if not _chart_ok(status):
            quality.append(f"{country.upper()} {label}当天采集失败，本榜不参与增长比较。")
        elif not _chart_ok(statuses.get((country, chart, yesterday))):
            quality.append(f"{country.upper()} {label}缺少昨日成功观测，首次收录不判为新入榜。")
        elif not _complete(statuses.get((country, chart, yesterday)), limit):
            quality.append(f"{country.upper()} {label}昨日榜单不完整，缺席产品不判为新入榜。")

    products: list[dict[str, Any]] = []
    for country, app_id in sorted(current_keys):
        current = snapshots.get((country, app_id, today), {})
        previous = snapshots.get((country, app_id, yesterday), {})
        old_metadata = metadata.get((country, app_id), ("", {}))[1]
        name = current.get("name") or old_metadata.get("name") or app_id
        genres = list(current.get("genres") or old_metadata.get("genres") or [])
        direction = (
            current.get("direction")
            or old_metadata.get("direction")
            or (genres[0] if genres else "未分类")
        )
        rating_count = _count(current.get("rating_count"))
        previous_count = _count(previous.get("rating_count"))
        delta: int | None = None
        if rating_count is not None and previous_count is not None:
            if rating_count >= previous_count:
                delta = rating_count - previous_count
            else:
                quality.append(
                    f"{country.upper()} · {name}：评分数从 {previous_count} 回退至 "
                    f"{rating_count}，当日增量留空。"
                )

        baseline_counts = [
            _count(
                snapshots.get(
                    (country, app_id, (as_of - timedelta(days=offset)).isoformat()),
                    {},
                ).get("rating_count")
            )
            for offset in range(8, 0, -1)
        ]
        baseline: float | None = None
        if all(value is not None for value in baseline_counts):
            baseline_deltas = [
                baseline_counts[index + 1] - baseline_counts[index]
                for index in range(7)
            ]
            if all(value >= 0 for value in baseline_deltas):
                baseline = sum(baseline_deltas) / 7
            else:
                quality.append(
                    f"{country.upper()} · {name}：前7天包含评分数回退，增长基线留空。"
                )
        ratio = delta / baseline if delta is not None and baseline and baseline > 0 else None
        is_spike = bool(delta is not None and delta >= 20 and ratio is not None and ratio >= 3)

        moves: list[dict[str, Any]] = []
        signals: list[str] = []
        for (chart_country, chart, day), members in sorted(charts.items()):
            if chart_country != country or day != today or app_id not in members:
                continue
            rank = members[app_id]
            prior_status = statuses.get((country, chart, yesterday))
            prior_rank = charts.get((country, chart, yesterday), {}).get(app_id)
            gain: int | None = None
            if _chart_ok(prior_status) and prior_rank is not None:
                gain = prior_rank - rank
                state = "up" if gain > 0 else "down" if gain < 0 else "unchanged"
            elif _complete(prior_status, limit):
                state = "new_entry"
            elif first_seen.get((country, app_id)) == today:
                state = "first_seen"
            else:
                state = "insufficient"
            moves.append(
                {
                    "chart": chart,
                    "rank": rank,
                    "previous_rank": prior_rank,
                    "rank_gain": gain,
                    "status": state,
                }
            )
            label = CHART_LABELS.get(chart, chart)
            if state == "up":
                signals.append(f"{label}上升 {gain} 名")
            elif state == "new_entry":
                signals.append(f"新入{label}第 {rank} 名")

        if delta is not None and delta > 0:
            signals.append(f"评分数较昨日新增 {delta}")
        if is_spike:
            signals.append(f"评分新增为前7天日均的 {ratio:.1f} 倍")
        if first_seen.get((country, app_id)) == today and not signals:
            signals.append("首次收录，等待连续观测")

        comparable = delta is not None or any(
            move["status"] in COMPARABLE_CHART_STATES for move in moves
        )
        positive_rank = any(move["status"] == "up" for move in moves)
        new_entry = any(move["status"] == "new_entry" for move in moves)
        rating_growth = delta is not None and delta > 0
        products.append(
            {
                "country": country,
                "app_id": app_id,
                "platform": 'android' if app_id.startswith('play:') else 'ios',
                "rating_scope": 'Google Play 全球评分，地区页面可能有更新差异' if app_id.startswith('play:') else 'App Store 地区评分',
                "name": str(name),
                "developer": current.get("developer") or old_metadata.get("developer") or "",
                "direction": str(direction),
                "genres": genres,
                **{key: current.get(key, [] if key in {"scenes", "capabilities", "tag_evidence"} else "")
                   for key in ("scenes", "capabilities", "tag_evidence", "tag_status", "tag_note")},
                "store_url": current.get("store_url") or old_metadata.get("store_url") or "",
                "release_date": current.get("release_date") or old_metadata.get("release_date"),
                "rating": current.get("rating"),
                "rating_count": rating_count,
                "rating_delta_1d": delta,
                "rating_baseline_7d": baseline,
                "spike_ratio": ratio,
                "is_spike": is_spike,
                "chart_moves": moves,
                "signals": signals,
                "first_seen_date": first_seen.get((country, app_id), today),
                "has_today_details": bool(current),
                "comparable": comparable,
                "positive_rank": positive_rank,
                "new_entry": new_entry,
                "rating_growth": rating_growth,
                "growing": positive_rank or new_entry or rating_growth,
            }
        )

    products.sort(
        key=lambda product: (
            -int(product["is_spike"]),
            -int(product["growing"]),
            -max((move["rank_gain"] or 0 for move in product["chart_moves"]), default=0),
            -(product["rating_delta_1d"] or 0),
            product["country"],
            product["name"].casefold(),
            product["app_id"],
        )
    )
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for product in products:
        grouped[(product["country"], product["direction"],product['platform'])].append(product)
    directions = []
    for (country, direction, platform), members in grouped.items():
        known_deltas = [
            product["rating_delta_1d"]
            for product in members
            if product["rating_delta_1d"] is not None
        ]
        directions.append(
            {
                "country": country,
                "direction": direction,
                "platform": platform,
                "sample_count": len(members),
                "comparable_count": sum(product["comparable"] for product in members),
                "positive_rank_apps": sum(product["positive_rank"] for product in members),
                "new_entry_apps": sum(product["new_entry"] for product in members),
                "rating_growth_apps": sum(product["rating_growth"] for product in members),
                "spike_apps": sum(product["is_spike"] for product in members),
                "growing_apps": sum(product["growing"] for product in members),
                "rating_delta_total": sum(known_deltas) if known_deltas else None,
                "app_ids": [product["app_id"] for product in members],
            }
        )
    directions.sort(
        key=lambda group: (
            -group["spike_apps"],
            -group["growing_apps"],
            -group["positive_rank_apps"],
            -group["sample_count"],
            group["country"],
            group["direction"],
        )
    )

    summary = {
        "product_count": len(products),
        "product_market_count": len(products),
        "unique_app_count": len({product["app_id"] for product in products}),
        "market_count": len({product["country"] for product in products}),
        "direction_count": len(directions),
        "comparable_count": sum(product["comparable"] for product in products),
        "growing_apps": sum(product["growing"] for product in products),
        "positive_rank_apps": sum(product["positive_rank"] for product in products),
        "new_entry_apps": sum(product["new_entry"] for product in products),
        "rating_growth_apps": sum(product["rating_growth"] for product in products),
        "spike_apps": sum(product["is_spike"] for product in products),
        "spike_count": sum(product["is_spike"] for product in products),
        "history_days": len(observed_dates),
        "first_collection": not any(day < today for day in observed_dates),
        "successful_charts": sum(_chart_ok(row) for row in today_statuses),
        "failed_charts": sum(not _chart_ok(row) for row in today_statuses),
    }
    methodology = [
        "场景与核心能力为多标签；商店说明核对与名称规则待复核分别标记，资料不足保留待补充，不从宽泛商店分类推断能力。",
        "标签增长按同平台同市场的现有成员统计；每个标签内按 App ID 去重，多标签行不可相加。规则调整不算新增产品或市场增长。",
        "排名上升率=排名上升 App 数/昨日与今日同榜均有排名的 App 数；新入榜单列，不放入排名比较分母。小于5个样本标记小样本，不输出全球评分合计。",
        "样本来自 App Store、Google Play 榜单与持续跟踪名单，不代表全量市场。同名跨平台产品保留独立 ID，不自动合并。",
        "安卓评分可能为全球汇总；不同地区页面不可相加为新增用户。跨平台评分增量不能直接比较用户规模。",
        "排名只与昨日同地区、同榜单的成功观测比较；缺日不插值，不跨天冒充日增量。",
        "新入榜要求昨天完整榜单与今天成功榜单；首次收录不等于新上架或突然增长。",
        "评分新增按同地区连续两日评分总数之差计算；评分数回退时增量留空。",
        "评分暴涨要求当日新增至少20、达到前7天日均3倍，且9个连续日期观测完整、基线为正。",
        "方向内按 App ID 去重；同一 App 的不同地区分别计算，不合并为全球用户数。",
        "排名与评分增长是市场信号，不能直接换算成下载量、活跃用户或收入。",
    ]
    from .tags import summarize_tags
    tagged = sum(bool(p["scenes"] or p["capabilities"]) for p in products)
    return {
        "as_of": today,
        "timezone": data.get("timezone", "Asia/Shanghai"),
        "summary": summary,
        "products": products,
        "directions": directions,
        "tag_growth": summarize_tags(products),
        "tag_coverage": {"total": len(products), "tagged": tagged, "untagged": len(products)-tagged,
            "reviewed": sum(p["tag_status"] == "商店说明核对" for p in products),
            "scene_tagged": sum(bool(p["scenes"]) for p in products),
            "capability_tagged": sum(bool(p["capabilities"]) for p in products),
            "taxonomy_version": data.get("taxonomy_version", "unversioned")},
        "quality": list(dict.fromkeys(quality)),
        "methodology": methodology,
    }
