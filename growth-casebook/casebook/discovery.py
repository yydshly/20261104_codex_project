import json
import re
from urllib.parse import urlencode, urlsplit, urlunsplit

import httpx

from .network import CollectionError, PublicClient, RateLimitError, github_repository, project_address
from .collect import friendly_error
from .db import utc_now
from .discovery_store import SOURCE_LABELS
from .public_products import betalist_products, hacker_news_products, product_hunt_products


SEARCHES = [
    ("自托管应用", "topic:self-hosted stars:>=500 archived:false fork:false"),
    ("开源软件产品", "topic:saas stars:>=500 archived:false fork:false"),
]
EXCLUDED_HOSTS = {"github.com", "github.io", "npmjs.com", "pypi.org", "youtube.com", "youtu.be", "medium.com"}


def product_candidate(repo, source_url):
    """A conservative product heuristic; popularity does not verify income or ownership."""
    if repo.get("fork") or repo.get("archived") or repo.get("private") or repo.get("stargazers_count", 0) < 500:
        return None
    name = repo.get("name", "")
    description = (repo.get("description") or "").strip()
    topics = set(repo.get("topics") or [])
    if not description or re.search(r"awesome|tutorial|boilerplate|starter|template|sdk|examples?|interview|course", name, re.I):
        return None
    if topics.intersection({"awesome-list", "tutorial", "boilerplate", "starter-template", "sdk"}):
        return None
    if re.match(r"(?:a |an )?(?:curated )?(?:list|collection)\b", description, re.I):
        return None
    homepage = (repo.get("homepage") or "").strip()
    if not homepage:
        return None
    if "://" not in homepage:
        homepage = "https://" + homepage
    try:
        parsed = urlsplit(homepage)
        host = (parsed.hostname or "").lower().removeprefix("www.")
        if parsed.scheme not in {"https", "http"} or not host or parsed.username or parsed.password or parsed.port not in {None, 80, 443}:
            return None
        if any(host == excluded or host.endswith("." + excluded) for excluded in EXCLUDED_HOSTS):
            return None
        if re.search(r"^/(docs?|documentation|wiki|blog|article)(/|$)", parsed.path, re.I):
            return None
        repository = github_repository(repo["full_name"]).casefold()
    except (KeyError, ValueError, CollectionError):
        return None
    category = "软件工具"
    for keywords, label in [({"analytics", "web-analytics"}, "数据分析"), ({"automation", "workflow", "no-code"}, "自动化"), ({"monitoring", "observability", "devops", "paas"}, "开发者工具"), ({"crm"}, "客户关系"), ({"social-media", "marketing"}, "内容与营销"), ({"project-management", "collaboration"}, "团队协作")]:
        if topics.intersection(keywords):
            category = label
            break
    # Keep product subpaths: unrelated products can share a marketing host. The current
    # project identity still deduplicates that host conservatively during admission.
    website = urlunsplit((parsed.scheme, parsed.netloc, parsed.path or "/", "", ""))
    return {"candidate_key": "github:" + repository, "repository": repository, "identity": host,
            "name": name[:100], "website": website, "description": description[:700],
            "category": category, "source_url": source_url, "source_kind": "github"}


def github_products(client, page):
    for _, query in SEARCHES:
        path = "search/repositories?" + urlencode({"q": query, "sort": "stars", "order": "desc", "per_page": 30, "page": page})
        source_url = "https://github.com/search?" + urlencode({"q": query, "type": "repositories"})
        payload = client.github(path)
        if not isinstance(payload, dict) or not isinstance(payload.get("items"), list):
            raise CollectionError("GitHub 搜索结果格式不正确")
        for repo in payload["items"]:
            yield product_candidate(repo, source_url)


ADAPTERS = {"github": github_products, "betalist": betalist_products, "hacker_news": hacker_news_products, "product_hunt": product_hunt_products}


def discover(store, run, client=None):
    owned = client is None
    client = client or PublicClient()
    counts = {"scanned": 0, "accepted": 0, "queued": run["queued"], "duplicates": 0}
    accepted = set()
    warnings = []
    source_stats = []
    successful_sources = 0
    enabled_sources = json.loads(run["enabled_sources"]) if isinstance(run["enabled_sources"], str) else run["enabled_sources"]
    try:
        # Rotate pages as completed scans accumulate; retained candidates remain available.
        page = store.search_page()
        for source_kind in enabled_sources:
            label = SOURCE_LABELS[source_kind]
            store.progress(run, "发现" + label)
            state = store.source_state(source_kind)
            stats = {"source_kind": source_kind, "label": label, "scanned": 0, "accepted": 0, "status": "ok", "error": ""}
            if state.get("cooldown_until") and state["cooldown_until"] > utc_now():
                stats.update(status="cooldown", error="该来源处于免费配额冷却中", cooldown_until=state["cooldown_until"])
                source_stats.append(stats)
                warnings.append(label + "正在冷却，本轮继续其他来源")
                continue
            try:
                source_keys = set()
                for candidate in ADAPTERS[source_kind](client, page):
                    counts["scanned"] += 1
                    stats["scanned"] += 1
                    if candidate and "discovery_error" in candidate:
                        stats["status"] = "partial"
                        stats["error"] = "部分官网跳转不可用，已跳过这些目录记录"
                    elif candidate:
                        key = store.remember(candidate)
                        accepted.add(key)
                        source_keys.add(key)
                        counts["accepted"] = len(accepted)
                        stats["accepted"] = len(source_keys)
                        if candidate.get("metadata", {}).get("website_status") == "unconfirmed":
                            stats.update(status="partial", error="公开订阅读取正常；后台将自动查找并核对官网，未确认时保留发布简报")
                    store.progress(run, "发现" + label)
                successful_sources += 1
            except RateLimitError as error:
                stats.update(status="cooldown", error=friendly_error(error), cooldown_until=error.retry_at)
            except (CollectionError, OSError, httpx.HTTPError) as error:
                stats.update(status="partial" if stats["accepted"] else "failed", error=friendly_error(error))
            if stats["accepted"] and stats["status"] != "ok":
                successful_sources += 1
            if stats["error"]:
                warnings.append(label + "：" + stats["error"])
            store.record_source(run, source_kind, stats["status"], stats["error"], stats.get("cooldown_until"))
            source_stats.append(stats)
        store.progress(run, "按官网与仓库去重，创建研究任务")
        # Queue a bounded batch even if one discovery source is temporarily unavailable.
        for candidate in store.pending(enabled_sources):
            if counts["queued"] >= run["batch_size"]:
                break
            try:
                identity, website, _ = project_address(candidate["website"])
                if candidate["source_kind"] == "product_hunt" and urlsplit(website).hostname in {"producthunt.com", "www.producthunt.com"}:
                    identity = candidate["identity"]
                # Current collector normalizes a submitted product to its origin.
                if urlsplit(candidate["website"]).path.strip("/"):
                    website = candidate["website"]
                outcome = store.queue_candidate(candidate, identity, website, run)
                if outcome == "queued":
                    counts["queued"] += 1
                elif outcome == "duplicate":
                    counts["duplicates"] += 1
                elif outcome in {"stale", "limit"}:
                    break
            except CollectionError as error:
                store.reject(candidate["candidate_key"], friendly_error(error))
        store.finish(run, counts, warnings, failed=successful_sources == 0 and not counts["queued"], source_stats=source_stats)
    finally:
        if owned:
            client.close()
