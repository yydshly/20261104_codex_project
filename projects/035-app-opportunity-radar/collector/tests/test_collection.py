import contextlib
import io
import json
import tempfile
import unittest
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
from unittest.mock import patch

from app_radar import store
from app_radar.classify import Classifier
from app_radar.cli import archive_payload, check_feed_freshness, collect, load_config


class CollectionTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.conn = store.connect(self.root / "radar.sqlite3")
        self.rules = Classifier({"rules": [], "genre_labels": {"6007": "效率"}})

    def tearDown(self):
        self.conn.close()
        self.tmp.cleanup()

    def app(self, app_id="1", **fields):
        result = {"app_id": app_id, "name": "Test app", "developer": "Example",
                  "store_url": "https://apps.apple.com/us/app/id" + app_id,
                  "genres": ["Productivity"], "genre_ids": ["6007"], "rank": 1}
        result.update(fields)
        return result

    def save_chart(self, apps, day="2026-11-15"):
        store.save_chart(self.conn, day=day, country="us", chart="top-free",
                         payload={"apps": apps, "source_url": "https://example.test/feed"},
                         observed_at="2026-11-15T01:00:00+00:00", raw_path="raw.json", run_id="test")

    def save_snapshot(self, app, day="2026-11-15", status="ok"):
        with self.conn:
            store.save_snapshot(self.conn, day=day, country="us", app=app,
                observed_at="2026-11-15T01:00:00+00:00", detail_status=status,
                classifier=self.rules, source_url="https://example.test/lookup", raw_path="raw.json")

    def test_same_day_chart_replaces_members_and_failure_preserves_success(self):
        self.save_chart([self.app("1"), self.app("2", rank=2)])
        self.save_chart([self.app("3")])
        self.assertEqual([row[0] for row in self.conn.execute("SELECT app_id FROM charts")], ["3"])
        store.chart_error(self.conn, day="2026-11-15", country="us", chart="top-free",
                          error="network unavailable", run_id="retry")
        row = self.conn.execute("SELECT status,count,last_error FROM chart_status").fetchone()
        self.assertEqual(tuple(row), ("ok", 1, "network unavailable"))

    def test_same_day_chart_only_cannot_erase_rating_and_new_day_stays_missing(self):
        self.save_snapshot(self.app(rating_count=123))
        self.save_snapshot(self.app(), status="chart_only")
        self.save_snapshot(self.app(), status="ok")
        self.save_snapshot(self.app(), day="2026-11-16", status="chart_only")
        rows = self.conn.execute("SELECT date,rating_count FROM snapshots ORDER BY date").fetchall()
        self.assertEqual([tuple(row) for row in rows], [("2026-11-15", 123), ("2026-11-16", None)])

    def test_tracked_limit_keeps_current_apps_and_caps_off_chart(self):
        self.save_chart([self.app("1"), self.app("2", rank=2)], day="2026-11-14")
        self.save_chart([self.app("3")])
        apps, skipped = store.tracked_apps(self.conn, "us", "2026-11-15", 30, 2)
        self.assertEqual(apps[0]["app_id"], "3")
        self.assertEqual((len(apps), skipped), (2, 1))
        self.assertEqual(store.tracked_apps(self.conn, "cn", "2026-11-15", 30, 2), ([], 0))

    def test_archive_is_verifiable_and_does_not_overwrite(self):
        import hashlib
        payload = {"source_url": "https://example.test/feed", "raw_data": {"rows": [1, 2]}}
        one = archive_payload(self.root / "raw", "2026-11-15", "us", "feed", payload)
        two = archive_payload(self.root / "raw", "2026-11-15", "us", "feed", payload)
        self.assertNotEqual(one, two)
        meta = json.loads(one.with_suffix(".meta.json").read_text(encoding="utf-8"))
        self.assertEqual(meta["sha256"], hashlib.sha256(one.read_bytes()).hexdigest())

    def test_reduced_configuration_does_not_mix_old_markets_or_charts(self):
        self.save_chart([self.app("1")])
        self.save_snapshot(self.app("1", rating_count=50))
        data = store.load_analysis_data(self.conn, "2026-11-15",
            {"countries": ["cn"], "charts": ["top-free"], "chart_limit": 100}, self.rules)
        self.assertEqual(data["snapshots"], [])
        self.assertEqual(data["charts"], [])
        self.assertEqual(data["chart_status"], [])

    def test_failed_collection_keeps_previous_good_observations_and_marks_partial(self):
        config = {"countries": ["us"], "charts": ["top-free"], "chart_limit": 2,
                  "lookup_batch_size": 100, "request_interval_seconds": 3.2,
                  "track_off_chart_days": 30, "max_tracked_per_country": 1000,
                  "database": self.root / "radar.sqlite3", "raw_directory": self.root / "raw",
                  "reports_directory": self.root / "reports"}
        from app_radar.cli import CST
        day = datetime.now(timezone.utc).astimezone(CST).date().isoformat()
        self.save_chart([self.app("1"), self.app("2", rank=2)], day=day)
        self.save_snapshot(self.app("1", rating_count=99), day=day)
        with patch("app_radar.sources.fetch_chart", side_effect=RuntimeError("test unavailable")), \
             patch("app_radar.sources.fetch_details", side_effect=RuntimeError("test unavailable")), \
             patch("app_radar.cli.time.sleep"), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(collect(config, self.rules), 2)
        report = json.loads((self.root / "reports/latest.json").read_text(encoding="utf-8"))
        self.assertEqual(report["collection"]["latest_run"]["status"], "error")
        self.assertEqual(report["collection"]["chart_status"][0]["status"], "ok")
        self.assertEqual(len(report["products"]), 2)
        one = next(p for p in report["products"] if p["app_id"] == "1")
        self.assertEqual(one["rating_count"], 99)

    def test_stale_feed_not_accepted_as_today(self):
        with self.assertRaises(ValueError):
            check_feed_freshness("Sun, 01 Nov 2026 01:00:00 +0000")
        check_feed_freshness(format_datetime(datetime.now(timezone.utc)))

    def test_live_command_writes_all_layers_and_safe_same_day_rerun(self):
        config = {"countries": ["us"], "charts": ["top-free"], "chart_limit": 2,
                  "lookup_batch_size": 100, "request_interval_seconds": 3.2,
                  "track_off_chart_days": 30, "max_tracked_per_country": 1000,
                  "database": self.root / "live.sqlite3", "raw_directory": self.root / "raw",
                  "reports_directory": self.root / "reports"}
        payload = {"source_url": "https://rss.marketingtools.apple.com/api/v2/us/apps/top-free/2/apps.json",
                   "source_updated_at": format_datetime(datetime.now(timezone.utc)),
                   "apps": [self.app("1"), self.app("2", rank=2)], "raw_data": {"fixture": True}}
        details = {"source_url": "https://itunes.apple.com/lookup?id=1,2&country=us",
                   "apps": [self.app("1", rating_count=200), self.app("2", rating_count=300)],
                   "raw_data": {"fixture": True}}
        with patch("app_radar.sources.fetch_chart", return_value=payload), \
             patch("app_radar.sources.fetch_details", return_value=details), \
             patch("app_radar.cli.time.sleep"), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(collect(config, self.rules), 0)
            self.assertEqual(collect(config, self.rules), 0)
        conn = store.connect(config["database"])
        try:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM snapshots").fetchone()[0], 2)
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM charts").fetchone()[0], 2)
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM detail_batches").fetchone()[0], 2)
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM runs WHERE status='ok'").fetchone()[0], 2)
        finally:
            conn.close()
        report = json.loads((self.root / "reports/latest.json").read_text(encoding="utf-8"))
        self.assertEqual(len(report["products"]), 2)
        self.assertTrue(all(p["rating_delta_1d"] is None for p in report["products"]))
        self.assertTrue((self.root / "reports/latest.html").exists())


if __name__ == "__main__":
    unittest.main()
