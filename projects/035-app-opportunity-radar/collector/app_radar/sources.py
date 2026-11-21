"""Read Apple's public chart feeds and software Lookup API.

Only public store metadata is requested. Neither endpoint supplies download
counts, active users, or revenue. The caller is responsible for pacing requests
(Apple documents approximately 20 Search API requests per minute), recording
observation time, and preserving ``raw_data`` with its source URL.
"""

from __future__ import annotations

import json
import math
import re
import time
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen


USER_AGENT = "AppGrowthRadar/0.1 (personal public App Store research)"
MAX_RESPONSE_BYTES = 20 * 1024 * 1024
RETRYABLE_STATUSES = {408, 425, 429, 500, 502, 503, 504}


class SourceError(RuntimeError):
    """A source could not be read or returned an unexpected schema."""


def _retry_delay(attempt: int, retry_after: str | None = None) -> float:
    """Use a bounded Retry-After value, falling back to exponential backoff."""
    if retry_after:
        try:
            seconds = float(retry_after)
        except ValueError:
            try:
                retry_at = parsedate_to_datetime(retry_after)
                if retry_at.tzinfo is None:
                    retry_at = retry_at.replace(tzinfo=timezone.utc)
                seconds = (retry_at - datetime.now(timezone.utc)).total_seconds()
            except (ValueError, TypeError, OverflowError):
                seconds = 0
        if math.isfinite(seconds) and seconds > 0:
            return min(seconds, 30.0)
    return min(2.0 ** attempt, 8.0)


def fetch_json(url: str, timeout: float = 30, retries: int = 2) -> dict[str, Any]:
    """Fetch a JSON object using normal TLS verification and urllib proxies.

    ``retries`` counts extra attempts. HTTP 429 / transient server failures and
    network errors are retried; other HTTP failures and invalid JSON fail fast.
    No private session, API key, or browser cookies are used.
    """
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError("Source URL must be an absolute HTTPS URL")
    if parsed.username or parsed.password:
        raise ValueError("Credentials in source URLs are not supported")
    if not isinstance(retries, int) or isinstance(retries, bool) or not 0 <= retries <= 5:
        raise ValueError("retries must be an integer from 0 to 5")
    if not isinstance(timeout, (int, float)) or not math.isfinite(timeout) or timeout <= 0:
        raise ValueError("timeout must be a positive finite number")

    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    for attempt in range(retries + 1):
        try:
            with urlopen(request, timeout=timeout) as response:
                payload = response.read(MAX_RESPONSE_BYTES + 1)
            if len(payload) > MAX_RESPONSE_BYTES:
                raise SourceError(f"Response exceeds {MAX_RESPONSE_BYTES} bytes: {url}")
            try:
                data = json.loads(payload.decode("utf-8-sig"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise SourceError(f"Source returned invalid UTF-8 JSON: {url}") from exc
            if not isinstance(data, dict):
                raise SourceError(f"Source JSON root must be an object: {url}")
            return data
        except HTTPError as exc:
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            status = exc.code
            exc.close()
            if status in RETRYABLE_STATUSES and attempt < retries:
                time.sleep(_retry_delay(attempt, retry_after))
                continue
            raise SourceError(f"HTTP {status} while reading {url}") from exc
        except (URLError, TimeoutError, OSError) as exc:
            if attempt < retries:
                time.sleep(_retry_delay(attempt))
                continue
            raise SourceError(f"Network request failed for {url}: {exc}") from exc
    raise AssertionError("Unreachable retry loop")


def _country(value: str) -> str:
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z]{2}", value):
        raise ValueError("country must be a two-letter storefront code, such as us or cn")
    return value.lower()


def _app_id(value: Any) -> str:
    if isinstance(value, bool) or not re.fullmatch(r"[1-9][0-9]*", str(value)):
        raise ValueError(f"Invalid numeric App Store ID: {value!r}")
    return str(value)


def _text(value: Any, default: str = "") -> str:
    return value if isinstance(value, str) else default


def _optional_text(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def _number(value: Any) -> float | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value):
        return float(value)
    return None


def _count(value: Any) -> int | None:
    if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
        return value
    return None


def fetch_chart(country: str, chart: str, limit: int = 100) -> dict[str, Any]:
    """Read the ordered overall iPhone App Store free or paid chart.

    Rank is the item's one-based position in Apple's response. An empty or
    malformed feed raises ``SourceError`` so it cannot masquerade as a valid
    chart containing no apps. Feeds occasionally omit genres; details can fill
    these in. ``source_updated_at`` is Apple's feed timestamp, not fetch time.
    """
    country = _country(country)
    if chart not in {"top-free", "top-paid"}:
        raise ValueError("chart must be top-free or top-paid")
    if not isinstance(limit, int) or isinstance(limit, bool) or not 1 <= limit <= 100:
        raise ValueError("limit must be an integer from 1 to 100")
    source_url = (
        f"https://rss.marketingtools.apple.com/api/v2/{country}/apps/"
        f"{chart}/{limit}/apps.json"
    )
    data = fetch_json(source_url)
    feed = data.get("feed")
    if not isinstance(feed, dict) or not isinstance(feed.get("results"), list):
        raise SourceError(f"Chart response has no feed.results array: {source_url}")
    if not feed["results"]:
        raise SourceError(f"Chart response contains no apps: {source_url}")

    apps = []
    seen = set()
    for rank, item in enumerate(feed["results"], start=1):
        if not isinstance(item, dict):
            raise SourceError(f"Chart item {rank} is not an object: {source_url}")
        try:
            app_id = _app_id(item.get("id"))
        except ValueError as exc:
            raise SourceError(f"Chart item {rank} has no valid App Store ID: {source_url}") from exc
        if app_id in seen:
            raise SourceError(f"Chart repeats App Store ID {app_id}: {source_url}")
        if not isinstance(item.get("name"), str) or not item["name"]:
            raise SourceError(f"Chart item {rank} has no name: {source_url}")
        seen.add(app_id)
        genre_rows = item.get("genres", [])
        if not isinstance(genre_rows, list):
            genre_rows = []
        genres = [_text(g.get("name")) for g in genre_rows if isinstance(g, dict)]
        genre_ids = [str(g["genreId"]) for g in genre_rows if isinstance(g, dict) and g.get("genreId")]
        apps.append({
            "app_id": app_id,
            "name": item["name"],
            "developer": _text(item.get("artistName")),
            "store_url": _text(item.get("url"), f"https://apps.apple.com/{country}/app/id{app_id}"),
            "genres": [g for g in genres if g],
            "genre_ids": genre_ids,
            "release_date": _optional_text(item.get("releaseDate")),
            "rank": rank,
        })
    return {
        "source_url": source_url,
        "source_updated_at": _optional_text(feed.get("updated")),
        "apps": apps,
        "raw_data": data,
    }


def fetch_details(country: str, app_ids: list[str]) -> dict[str, Any]:
    """Read up to 100 Apps' metadata in one storefront-specific lookup.

    An app not available in that storefront may be omitted by Apple; no zero
    rating count is invented for missing apps or missing fields. An empty ID
    list returns an empty result without making a network request.
    """
    country = _country(country)
    if not isinstance(app_ids, list) or len(app_ids) > 100:
        raise ValueError("app_ids must be a list containing no more than 100 IDs")
    ids = list(dict.fromkeys(_app_id(value) for value in app_ids))
    source_url = "https://itunes.apple.com/lookup?" + urlencode({
        "id": ",".join(ids), "country": country, "entity": "software",
    })
    if not ids:
        return {"source_url": source_url, "apps": [], "raw_data": {"resultCount": 0, "results": []}}
    data = fetch_json(source_url)
    if not isinstance(data.get("results"), list):
        raise SourceError(f"Lookup response has no results array: {source_url}")

    apps = []
    seen = set()
    requested = set(ids)
    for item in data["results"]:
        if not isinstance(item, dict):
            raise SourceError(f"Lookup result is not an object: {source_url}")
        # A software lookup should not return artist or music objects.
        if item.get("wrapperType") not in {None, "software"}:
            continue
        try:
            app_id = _app_id(item.get("trackId"))
        except ValueError as exc:
            raise SourceError(f"Lookup result has no valid App Store ID: {source_url}") from exc
        if app_id not in requested or app_id in seen:
            continue
        if not isinstance(item.get("trackName"), str) or not item["trackName"]:
            raise SourceError(f"Lookup result {app_id} has no app name: {source_url}")
        seen.add(app_id)
        genres = item.get("genres", [])
        genre_ids = item.get("genreIds", [])
        if not isinstance(genres, list):
            genres = []
        if not isinstance(genre_ids, list):
            genre_ids = []
        # Apple's primary category is more useful than arbitrary secondary order.
        primary = _optional_text(item.get("primaryGenreName"))
        primary_id = item.get("primaryGenreId")
        genres = list(dict.fromkeys(([primary] if primary else []) + [g for g in genres if isinstance(g, str)]))
        genre_ids = list(dict.fromkeys(([str(primary_id)] if primary_id is not None else []) + [str(g) for g in genre_ids]))
        apps.append({
            "app_id": app_id,
            "name": item["trackName"],
            "developer": _text(item.get("artistName"), _text(item.get("sellerName"))),
            "store_url": _text(item.get("trackViewUrl"), f"https://apps.apple.com/{country}/app/id{app_id}"),
            "genres": genres,
            "genre_ids": genre_ids,
            "release_date": _optional_text(item.get("releaseDate")),
            "rating_count": _count(item.get("userRatingCount")),
            "rating": _number(item.get("averageUserRating")),
            "price": _number(item.get("price")),
            "currency": _optional_text(item.get("currency")),
            "description": _optional_text(item.get("description")),
            "bundle_id": _optional_text(item.get("bundleId")),
        })
    return {"source_url": source_url, "apps": apps, "raw_data": data}
