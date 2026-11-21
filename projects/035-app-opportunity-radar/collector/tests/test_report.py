import json
from pathlib import Path
import re
import tempfile
import unittest

from app_radar.report import _safe_url, write_reports


class ReportTests(unittest.TestCase):
    def test_empty_first_day_produces_all_artifacts(self):
        report = {"as_of": "2026-11-15", "products": [], "directions": [], "quality": [], "methodology": [], "history_days": 1}
        with tempfile.TemporaryDirectory() as directory:
            paths = write_reports(report, Path(directory))
            self.assertEqual(set(paths), {"html", "json", "markdown"})
            self.assertTrue(all(Path(p).is_file() for p in paths.values()))
            self.assertEqual(len(list(Path(directory).iterdir())), 6)
            self.assertIn("正在建立基线", Path(paths["markdown"]).read_text(encoding="utf-8"))
            self.assertEqual(json.loads(Path(paths["json"]).read_text(encoding="utf-8")), report)

    def test_provider_text_cannot_break_json_script(self):
        payload = '</script><script>alert("provider")</script>\u2028'
        report = {"as_of": "2026-11-15", "products": [{"app_id": "1", "name": payload, "store_url": "javascript:alert(1)"}], "directions": []}
        with tempfile.TemporaryDirectory() as directory:
            paths = write_reports(report, Path(directory))
            html = Path(paths["html"]).read_text(encoding="utf-8")
            embedded = re.search(r'<script id="report-data" type="application/json">(.*?)</script>', html, re.S).group(1)
            self.assertNotIn("<", embedded)
            self.assertEqual(json.loads(embedded)["products"][0]["name"], payload)
            self.assertNotIn("javascript:alert", Path(paths["markdown"]).read_text(encoding="utf-8"))
            self.assertNotIn("innerHTML", html)

    def test_only_https_apple_links_are_rendered(self):
        self.assertEqual(_safe_url("https://apps.apple.com/us/app/id1"), "https://apps.apple.com/us/app/id1")
        for value in ["javascript:alert(1)", "https://apps.apple.com.evil.test/x", "https://a@evil.test", "http://apps.apple.com/x", "https://apps.apple.com:8080/x", "https://evil.test/x"]:
            self.assertEqual(_safe_url(value), "")

    def test_rejects_path_like_date(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError):
                write_reports({"as_of": "../report"}, Path(directory))


if __name__ == "__main__":
    unittest.main()
