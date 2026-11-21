"""Aggregate multi-label signals within one platform and storefront only."""
from collections import defaultdict


def summarize_tags(products):
    grouped = defaultdict(dict)
    for product in products:
        for kind in ("scenes", "capabilities"):
            for label in set(product.get(kind, [])):
                key = product["platform"], product["country"], kind, label
                grouped[key][product["app_id"]] = product
    rows = []
    for (platform, country, kind, label), unique in grouped.items():
        members = list(unique.values())
        ranked = sum(any(m["status"] in {"up", "down", "unchanged"}
                         for m in p["chart_moves"]) for p in members)
        up = sum(p["positive_rank"] for p in members)
        rows.append({"platform": platform, "country": country, "kind": kind, "tag": label,
            "sample_count": len(members), "comparable_count": sum(p["comparable"] for p in members),
            "rank_comparable_count": ranked, "positive_rank_apps": up,
            "rank_up_rate": up / ranked if ranked else None,
            "new_entry_apps": sum(p["new_entry"] for p in members),
            "rating_comparable_count": sum(p["rating_delta_1d"] is not None for p in members),
            "rating_growth_apps": sum(p["rating_growth"] for p in members),
            "spike_apps": sum(p["is_spike"] for p in members),
            "reviewed_apps": sum(p.get("tag_status") == "商店说明核对" for p in members),
            "small_sample": len(members) < 5,
            "small_rank_sample": ranked < 5,
            "app_ids": sorted(unique),
            "examples": [{"app_id": p["app_id"], "name": p["name"]} for p in members[:3]]})
    return sorted(rows, key=lambda r: (-r["positive_rank_apps"], -r["new_entry_apps"],
                  -r["rank_comparable_count"], r["platform"], r["country"], r["kind"], r["tag"]))
