import copy
import unittest
from datetime import date, timedelta

from app_radar.analysis import analyze


TODAY = "2026-11-15"
YESTERDAY = "2026-11-14"


def snapshot(day, count, country="us", app_id="a", **kwargs):
    return {
        "date": day,
        "country": country,
        "app_id": app_id,
        "name": "Example App",
        "developer": "Example Dev",
        "direction": "效率工具",
        "genres": ["Productivity"],
        "rating_count": count,
        "store_url": "https://apps.apple.com/us/app/id1",
        **kwargs,
    }


def chart(day, rank, country="us", app_id="a", kind="top-free"):
    return {"date": day, "country": country, "app_id": app_id, "chart": kind, "rank": rank}


def status(day, country="us", kind="top-free", count=100, state="ok", **kwargs):
    return {"date": day, "country": country, "chart": kind, "count": count, "status": state, **kwargs}


def dataset(snapshots=None, charts=None, statuses=None, **kwargs):
    return {
        "as_of": TODAY,
        "timezone": "Asia/Shanghai",
        "chart_limit": 100,
        "snapshots": snapshots or [],
        "charts": charts or [],
        "chart_status": statuses or [],
        **kwargs,
    }


class GrowthAnalysisTests(unittest.TestCase):
    def test_first_day_is_not_growth_or_new_entry(self):
        report = analyze(dataset([snapshot(TODAY, 100)], [chart(TODAY, 5)], [status(TODAY)]))
        product = report["products"][0]
        self.assertIsNone(product["rating_delta_1d"])
        self.assertIsNone(product["rating_baseline_7d"])
        self.assertFalse(product["is_spike"])
        self.assertFalse(product["growing"])
        self.assertEqual(product["chart_moves"][0]["status"], "first_seen")
        self.assertTrue(report["summary"]["first_collection"])
        self.assertEqual(report["directions"][0]["rating_delta_total"], None)

    def test_rank_improvement_and_rating_delta(self):
        report = analyze(dataset(
            [snapshot(YESTERDAY, 100), snapshot(TODAY, 145)],
            [chart(YESTERDAY, 60), chart(TODAY, 20)],
            [status(YESTERDAY), status(TODAY)],
        ))
        product = report["products"][0]
        self.assertEqual(product["chart_moves"][0]["rank_gain"], 40)
        self.assertEqual(product["rating_delta_1d"], 45)
        self.assertTrue(product["growing"])
        self.assertEqual(report["directions"][0]["positive_rank_apps"], 1)

    def test_new_entry_requires_successful_complete_previous_chart(self):
        report = analyze(dataset(
            [snapshot(TODAY, 100)],
            [chart(YESTERDAY, 20, app_id="other"), chart(TODAY, 50)],
            [status(YESTERDAY), status(TODAY)],
        ))
        self.assertEqual(report["products"][0]["chart_moves"][0]["status"], "new_entry")
        self.assertEqual(report["summary"]["new_entry_apps"], 1)

    def test_partial_previous_chart_does_not_make_new_entry(self):
        report = analyze(dataset(
            [snapshot(TODAY, 100)],
            [chart(TODAY, 5)],
            [status(YESTERDAY, count=50), status(TODAY)],
        ))
        self.assertEqual(report["products"][0]["chart_moves"][0]["status"], "first_seen")
        self.assertIn("昨日榜单不完整", " ".join(report["quality"]))

    def test_explicit_complete_overrides_return_count(self):
        report = analyze(dataset(
            [snapshot(TODAY, 100)],
            [chart(TODAY, 5)],
            [status(YESTERDAY, count=12, complete=True), status(TODAY)],
        ))
        self.assertTrue(report["products"][0]["new_entry"])

    def test_missing_yesterday_does_not_compare_to_two_days_ago(self):
        report = analyze(dataset(
            [snapshot("2026-11-13", 100), snapshot(TODAY, 180)],
            [chart("2026-11-13", 80), chart(TODAY, 20)],
            [status("2026-11-13"), status(TODAY)],
        ))
        product = report["products"][0]
        self.assertIsNone(product["rating_delta_1d"])
        self.assertIsNone(product["chart_moves"][0]["rank_gain"])
        self.assertEqual(product["chart_moves"][0]["status"], "insufficient")

    def test_failed_yesterday_does_not_use_stale_chart_rows(self):
        report = analyze(dataset(
            [snapshot(TODAY, 100)],
            [chart(YESTERDAY, 80), chart(TODAY, 20)],
            [status(YESTERDAY, state="error"), status(TODAY)],
        ))
        self.assertFalse(report["products"][0]["positive_rank"])
        self.assertFalse(report["products"][0]["new_entry"])
        self.assertIsNone(report["products"][0]["chart_moves"][0]["previous_rank"])

    def test_rating_count_correction_does_not_become_negative_growth(self):
        report = analyze(dataset([snapshot(YESTERDAY, 200), snapshot(TODAY, 150)]))
        self.assertIsNone(report["products"][0]["rating_delta_1d"])
        self.assertFalse(report["products"][0]["rating_growth"])
        self.assertIn("回退", " ".join(report["quality"]))

    def test_nine_day_spike_baseline(self):
        start = date.fromisoformat(TODAY) - timedelta(days=8)
        snapshots = [snapshot((start + timedelta(days=index)).isoformat(), 100 + index * 10) for index in range(8)]
        snapshots.append(snapshot(TODAY, 200))
        product = analyze(dataset(snapshots))["products"][0]
        self.assertEqual(product["rating_delta_1d"], 30)
        self.assertEqual(product["rating_baseline_7d"], 10)
        self.assertEqual(product["spike_ratio"], 3)
        self.assertTrue(product["is_spike"])

    def test_missing_baseline_day_stays_unknown(self):
        start = date.fromisoformat(TODAY) - timedelta(days=8)
        snapshots = [snapshot((start + timedelta(days=index)).isoformat(), 100 + index * 10) for index in range(8) if index != 3]
        snapshots.append(snapshot(TODAY, 300))
        product = analyze(dataset(snapshots))["products"][0]
        self.assertEqual(product["rating_delta_1d"], 130)
        self.assertIsNone(product["rating_baseline_7d"])
        self.assertIsNone(product["spike_ratio"])
        self.assertFalse(product["is_spike"])

    def test_zero_baseline_cannot_make_infinite_spike(self):
        start = date.fromisoformat(TODAY) - timedelta(days=8)
        snapshots = [snapshot((start + timedelta(days=index)).isoformat(), 100) for index in range(8)]
        snapshots.append(snapshot(TODAY, 200))
        product = analyze(dataset(snapshots))["products"][0]
        self.assertEqual(product["rating_baseline_7d"], 0)
        self.assertIsNone(product["spike_ratio"])
        self.assertFalse(product["is_spike"])

    def test_baseline_correction_invalidates_spike(self):
        start = date.fromisoformat(TODAY) - timedelta(days=8)
        counts = [100, 110, 105, 130, 140, 150, 160, 170, 300]
        snapshots = [snapshot((start + timedelta(days=index)).isoformat(), count) for index, count in enumerate(counts)]
        product = analyze(dataset(snapshots))["products"][0]
        self.assertIsNone(product["rating_baseline_7d"])
        self.assertFalse(product["is_spike"])

    def test_minimum_twenty_new_ratings_even_with_high_ratio(self):
        start = date.fromisoformat(TODAY) - timedelta(days=8)
        snapshots = [snapshot((start + timedelta(days=index)).isoformat(), 100 + index) for index in range(8)]
        snapshots.append(snapshot(TODAY, 126))
        product = analyze(dataset(snapshots))["products"][0]
        self.assertEqual(product["spike_ratio"], 19)
        self.assertFalse(product["is_spike"])

    def test_same_app_on_two_charts_counted_once_but_markets_separate(self):
        report = analyze(dataset(
            [snapshot(YESTERDAY, 100), snapshot(TODAY, 130), snapshot(YESTERDAY, 1000, country="cn"), snapshot(TODAY, 1005, country="cn")],
            [chart(YESTERDAY, 50), chart(TODAY, 20), chart(YESTERDAY, 80, kind="top-paid"), chart(TODAY, 70, kind="top-paid")],
            [status(YESTERDAY), status(TODAY), status(YESTERDAY, kind="top-paid"), status(TODAY, kind="top-paid")],
        ))
        self.assertEqual(report["summary"]["product_market_count"], 2)
        self.assertEqual(report["summary"]["unique_app_count"], 1)
        self.assertEqual(report["summary"]["market_count"], 2)
        us = next(group for group in report["directions"] if group["country"] == "us")
        cn = next(group for group in report["directions"] if group["country"] == "cn")
        self.assertEqual(us["sample_count"], 1)
        self.assertEqual(us["positive_rank_apps"], 1)
        self.assertEqual(us["rating_delta_total"], 30)
        self.assertEqual(cn["rating_delta_total"], 5)

    def test_historical_metadata_does_not_fill_todays_missing_rating(self):
        report = analyze(dataset(
            [snapshot(YESTERDAY, 100)],
            [chart(TODAY, 5)],
            [status(TODAY)],
        ))
        product = report["products"][0]
        self.assertEqual(product["name"], "Example App")
        self.assertIsNone(product["rating_count"])
        self.assertIsNone(product["rating_delta_1d"])
        self.assertFalse(product["has_today_details"])

    def test_failed_current_chart_does_not_emit_products(self):
        report = analyze(dataset([], [chart(TODAY, 5)], [status(TODAY, state="error")]))
        self.assertEqual(report["products"], [])
        self.assertEqual(report["summary"]["failed_charts"], 1)
        self.assertIn("采集失败", " ".join(report["quality"]))

    def test_future_rows_ignored_and_input_not_mutated(self):
        data = dataset([snapshot(TODAY, 100), snapshot("2026-11-16", 500)])
        original = copy.deepcopy(data)
        report = analyze(data)
        self.assertEqual(report["products"][0]["rating_count"], 100)
        self.assertEqual(data, original)

    def test_invalid_date_and_limit_rejected(self):
        with self.assertRaises(ValueError):
            analyze(dataset(as_of="not-a-date"))
        with self.assertRaises(ValueError):
            analyze(dataset(chart_limit=0))


if __name__ == "__main__":
    unittest.main()
