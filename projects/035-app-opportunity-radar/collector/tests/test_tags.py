import json
from pathlib import Path
import unittest

from app_radar.analysis import analyze
from app_radar.classify import Classifier


class TagTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.classifier = Classifier(json.loads(
            (Path(__file__).resolve().parents[1] / "directions.json").read_text(encoding="utf-8")))

    def tags(self, name, app_id="unknown"):
        return self.classifier.tags({"app_id": app_id, "name": name})

    def test_reviewed_override_is_platform_specific_and_has_provenance(self):
        tags = self.tags("PicoPDF", "play:com.aurafile.reader")
        self.assertIn("扫描成 PDF", tags["capabilities"])
        self.assertEqual(tags["tag_status"], "商店说明核对")
        self.assertTrue(all(e["source_url"].startswith("https://") for e in tags["tag_evidence"]))
        self.assertEqual(self.tags("PicoPDF", "com.aurafile.reader")["tag_status"], "名称规则待复核")

    def test_barcode_scanner_does_not_imply_document_scanning(self):
        tags = self.tags("QR & Barcode Scanner")
        self.assertIn("扫码识别", tags["scenes"])
        self.assertNotIn("扫描成 PDF", tags["capabilities"])

    def test_editor_branding_does_not_imply_video_consumption(self):
        tags = self.tags("剪映 - 抖音官方AI创作神器")
        self.assertIn("视频创作", tags["scenes"])
        self.assertNotIn("短视频观看与分享", tags["scenes"])

    def test_substrings_and_parent_brands_do_not_invent_scenarios(self):
        for name in ("Monzo Bank - Mobile Banking", "Revolut — Banking & Beyond"):
            self.assertNotIn("卡片记忆学习", self.tags(name)["scenes"])
        self.assertIn("卡片记忆学习", self.tags("AnkiMobile Flashcards")["scenes"])
        self.assertNotIn("综合购物", self.tags("京东金融-理财平台")["scenes"])
        self.assertNotIn("短视频观看与分享", self.tags("即梦AI - 抖音旗下AI图片和视频工具")["scenes"])
        self.assertNotIn("移动支付与转账", self.tags("Yahoo!ショッピング-PayPayポイントが貯まる通販")["scenes"])

    def test_unknown_store_genre_does_not_invent_abilities(self):
        tags = self.classifier.tags({"app_id": "unknown", "name": "Unora", "genres": ["Productivity"]})
        self.assertEqual(tags["scenes"], [])
        self.assertEqual(tags["capabilities"], [])
        self.assertEqual(tags["tag_status"], "待补充")

    def test_multiple_matching_rules_deduplicate_and_reco_keeps_uncertainty(self):
        tags = self.tags("Vinted: Shop pre-loved")
        self.assertEqual(len(tags["scenes"]), len(set(tags["scenes"])))
        self.assertIn("二手交易", tags["scenes"])
        reco = self.tags("Reco Social", "6742024490")
        self.assertNotIn("奖励任务与返利", reco["scenes"])
        self.assertIn("尚未验证", reco["tag_note"])

    def test_growth_denominators_market_platform_and_multilabel_isolation(self):
        snapshots = []
        for country, app_id in [("us", "a"), ("us", "b"), ("us", "c"),
                                 ("jp", "a"), ("us", "play:a")]:
            for day, count in [("2026-11-19", 100), ("2026-11-20", 102)]:
                snapshots.append({"date": day, "country": country, "app_id": app_id,
                    "name": app_id, "rating_count": count, "scenes": ["文档", "文档"],
                    "capabilities": ["阅读"], "tag_status": "名称规则待复核"})
        charts = [{"date": day, "country": "us", "app_id": app_id, "chart": kind, "rank": rank}
                  for day, app_id, kind, rank in [
                    ("2026-11-19", "a", "top-free", 80), ("2026-11-20", "a", "top-free", 10),
                    ("2026-11-19", "a", "top-paid", 50), ("2026-11-20", "a", "top-paid", 40),
                    ("2026-11-20", "c", "top-free", 30)]]
        statuses = [{"date": day, "country": "us", "chart": kind, "status": "ok", "count": 100}
                    for day in ("2026-11-19", "2026-11-20") for kind in ("top-free", "top-paid")]
        result = analyze({"as_of": "2026-11-20", "snapshots": snapshots,
                          "charts": charts, "chart_status": statuses})
        group = next(g for g in result["tag_growth"] if g["platform"] == "ios"
                     and g["country"] == "us" and g["kind"] == "scenes")
        self.assertEqual(group["sample_count"], 3)  # two charts and repeated labels count once
        self.assertEqual(group["rank_comparable_count"], 1)  # off-chart and new entry excluded
        self.assertEqual(group["positive_rank_apps"], 1)
        self.assertEqual(group["rank_up_rate"], 1)
        self.assertEqual(group["new_entry_apps"], 1)
        self.assertEqual(group["rating_comparable_count"], 3)
        self.assertNotIn("rating_delta_total", group)
        android = next(g for g in result["tag_growth"] if g["platform"] == "android" and g["kind"] == "scenes")
        self.assertEqual(android["sample_count"], 1)
        self.assertIsNone(android["rank_up_rate"])
        self.assertEqual(result["tag_coverage"]["tagged"], 5)

    def test_missing_yesterday_cannot_create_label_growth(self):
        result = analyze({"as_of": "2026-11-20", "snapshots": [{"date": "2026-11-20",
            "country": "us", "app_id": "a", "name": "A", "rating_count": 100,
            "scenes": ["阅读"], "capabilities": ["文档阅读"]}]})
        self.assertEqual(result["tag_growth"][0]["positive_rank_apps"], 0)
        self.assertEqual(result["tag_growth"][0]["rating_comparable_count"], 0)
        self.assertIsNone(result["tag_growth"][0]["rank_up_rate"])


if __name__ == "__main__":
    unittest.main()
