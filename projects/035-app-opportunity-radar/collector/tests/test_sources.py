"""Source schema and transient-failure tests; these never access the network."""

import io
import json
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

from app_radar.sources import SourceError, fetch_chart, fetch_details, fetch_json


class FakeResponse:
    def __init__(self, payload):
        self.body = io.BytesIO(payload)

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False

    def read(self, amount):
        return self.body.read(amount)


class SourceTests(unittest.TestCase):
    def test_chart_preserves_rank_and_raw_source(self):
        data = {"feed": {"updated": "Sun, 15 Nov 2026 02:15:32 +0000", "results": [
            {"id": "123", "name": "One", "artistName": "Maker", "genres": []},
            {"id": "456", "name": "Two", "genres": [{"genreId": "6007", "name": "Productivity"}]},
        ]}}
        with patch("app_radar.sources.fetch_json", return_value=data) as request:
            result = fetch_chart("US", "top-free", 100)
        self.assertEqual([app["rank"] for app in result["apps"]], [1, 2])
        self.assertEqual(result["apps"][1]["genres"], ["Productivity"])
        self.assertEqual(result["source_updated_at"], "Sun, 15 Nov 2026 02:15:32 +0000")
        self.assertEqual(result["apps"][0]["store_url"], "https://apps.apple.com/us/app/id123")
        self.assertIs(result["raw_data"], data)
        self.assertIn("/us/apps/top-free/100/", request.call_args.args[0])

    def test_bad_or_empty_chart_cannot_erase_a_valid_chart(self):
        invalid_feeds = [
            {}, {"feed": {"results": []}},
            {"feed": {"results": [{"id": "123", "name": "One"}, {"id": "123", "name": "Again"}]}},
            {"feed": {"results": [{"name": "No ID"}]}},
        ]
        for data in invalid_feeds:
            with self.subTest(data=data), patch("app_radar.sources.fetch_json", return_value=data):
                with self.assertRaises(SourceError):
                    fetch_chart("us", "top-free")

    def test_invalid_parameters_do_not_make_requests(self):
        with patch("app_radar.sources.fetch_json") as request:
            for args in [("usa", "top-free", 100), ("us", "grossing", 100), ("us", "top-free", 101)]:
                with self.assertRaises(ValueError):
                    fetch_chart(*args)
            with self.assertRaises(ValueError):
                fetch_details("us", ["not-an-id"])
            with self.assertRaises(ValueError):
                fetch_details("us", ["123"] * 101)
        request.assert_not_called()

    def test_lookup_keeps_zero_distinct_from_missing(self):
        data = {"resultCount": 2, "results": [
            {"wrapperType": "software", "trackId": 123, "trackName": "Zero", "userRatingCount": 0,
             "averageUserRating": 0, "price": 0, "primaryGenreName": "Utilities", "primaryGenreId": 6002,
             "genres": ["Productivity", "Utilities"], "genreIds": ["6007", "6002"]},
            {"trackId": 456, "trackName": "Unknown"},
        ]}
        with patch("app_radar.sources.fetch_json", return_value=data):
            result = fetch_details("us", ["123", "456", "789"])
        self.assertEqual(len(result["apps"]), 2)
        self.assertEqual(result["apps"][0]["rating_count"], 0)
        self.assertEqual(result["apps"][0]["price"], 0.0)
        self.assertIsNone(result["apps"][1]["rating_count"])
        self.assertEqual(result["apps"][0]["genres"], ["Utilities", "Productivity"])

    def test_lookup_empty_or_unavailable_is_not_a_zero_snapshot(self):
        with patch("app_radar.sources.fetch_json") as request:
            self.assertEqual(fetch_details("us", [])["apps"], [])
            request.assert_not_called()
        with patch("app_radar.sources.fetch_json", return_value={"resultCount": 0, "results": []}):
            self.assertEqual(fetch_details("us", ["123"])["apps"], [])

    def test_lookup_invalid_metrics_stay_unknown(self):
        data = {"results": [{"trackId": 123, "trackName": "Unknown", "userRatingCount": "123",
                             "averageUserRating": float("nan"), "price": True}]}
        with patch("app_radar.sources.fetch_json", return_value=data):
            app = fetch_details("us", ["123"])["apps"][0]
        self.assertIsNone(app["rating_count"])
        self.assertIsNone(app["rating"])
        self.assertIsNone(app["price"])

    def test_lookup_batch_deduplicates_and_keeps_country(self):
        with patch("app_radar.sources.fetch_json", return_value={"results": []}) as request:
            fetch_details("CN", ["123", "456", "123"])
        self.assertIn("id=123%2C456", request.call_args.args[0])
        self.assertIn("country=cn", request.call_args.args[0])

    def test_json_network_error_retries_without_disabling_tls(self):
        response = FakeResponse(json.dumps({"ok": True}).encode())
        with patch("app_radar.sources.urlopen", side_effect=[URLError("transient"), response]) as opener:
            with patch("app_radar.sources.time.sleep"):
                result = fetch_json("https://itunes.apple.com/lookup?id=123")
        self.assertTrue(result["ok"])
        self.assertEqual(opener.call_count, 2)
        self.assertNotIn("context", opener.call_args.kwargs)

    def test_http_429_honors_bounded_retry_after(self):
        error = HTTPError("https://itunes.apple.com/lookup", 429, "limited", {"Retry-After": "120"}, None)
        with patch("app_radar.sources.urlopen", side_effect=[error, FakeResponse(b"{}")]):
            with patch("app_radar.sources.time.sleep") as sleep:
                self.assertEqual(fetch_json("https://itunes.apple.com/lookup"), {})
        sleep.assert_called_once_with(30.0)

    def test_permanent_http_error_and_invalid_json_fail_fast(self):
        error = HTTPError("https://itunes.apple.com/lookup", 404, "missing", {}, None)
        for response in [error, FakeResponse(b"<html>Error</html>"), FakeResponse(b"[]")]:
            with self.subTest(response=response), patch("app_radar.sources.urlopen", side_effect=[response]) as opener:
                with self.assertRaises(SourceError):
                    fetch_json("https://itunes.apple.com/lookup")
                self.assertEqual(opener.call_count, 1)


if __name__ == "__main__":
    unittest.main()
