"""Free public product feeds; no account, API key or open-source requirement."""
import json
import re
from urllib.parse import urljoin, urlsplit, urlunsplit
from xml.etree import ElementTree as ET

from bs4 import BeautifulSoup
import httpx

from .network import CollectionError, RateLimitError


BETALIST_FEED = "https://feeds.feedburner.com/BetaList"
HN_API = "https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&hitsPerPage=30&numericFilters=points%3E%3D5"
PRODUCT_HUNT_FEED = "https://www.producthunt.com/feed"
DIRECTORY_HOSTS = {"github.com", "github.io", "gitlab.com", "news.ycombinator.com", "producthunt.com", "betalist.com", "youtube.com", "youtu.be", "medium.com", "reddit.com", "apps.apple.com", "play.google.com", "npmjs.com", "pypi.org"}


def website_candidate(name, website, description, source_kind, source_url, published_at=None, metadata=None):
    if not isinstance(name, str) or not isinstance(website, str) or not isinstance(description, str) or not name or not website:
        return None
    try:
        parsed = urlsplit(website)
        host = (parsed.hostname or "").lower().removeprefix("www.")
        if parsed.scheme not in {"http", "https"} or not host or parsed.username or parsed.password or parsed.port not in {None, 80, 443}:
            return None
    except ValueError:
        return None
    if any(host == blocked or host.endswith("." + blocked) for blocked in DIRECTORY_HOSTS):
        return None
    if re.search(r"^/(blog|articles?|posts?|docs?|wiki|releases?)(/|$)", parsed.path, re.I):
        return None
    if source_kind == "hacker_news" and parsed.path.strip("/").lower() not in {"", "en", "app", "home"}:
        return None
    if re.search(r"tutorial|awesome list|starter template|boilerplate|hiring|job opening", name, re.I):
        return None
    category = "软件工具"
    for pattern, label in [(r"\bCRM\b|customer relationship", "客户关系"), (r"analytics|分析", "数据分析"), (r"marketing|social media|newsletter", "内容与营销"), (r"workflow|automation|自动化", "自动化"), (r"tasks|team|project management|todo", "团队协作")]:
        if re.search(pattern, name + " " + description, re.I):
            category = label
            break
    return {"candidate_key": "site:" + host, "identity": host, "repository": "", "name": name[:100],
            "website": urlunsplit((parsed.scheme, parsed.netloc, parsed.path or "/", "", "")),
            "description": description[:700], "category": category, "source_kind": source_kind,
            "source_url": source_url, "published_at": published_at, "listing_title": name, "metadata": metadata or {}}


def atom_entries(body):
    if "<!DOCTYPE" in body.upper() or "<!ENTITY" in body.upper():
        raise CollectionError("订阅格式包含不支持的实体声明")
    try:
        root = ET.fromstring(body)
    except ET.ParseError as error:
        raise CollectionError("产品订阅未返回有效 XML") from error
    namespace = {"a": "http://www.w3.org/2005/Atom"}
    if root.tag != "{http://www.w3.org/2005/Atom}feed":
        raise CollectionError("产品订阅格式不正确")
    for entry in root.findall("a:entry", namespace):
        link = entry.find("a:link[@rel='alternate']", namespace)
        yield {"title": entry.findtext("a:title", default="", namespaces=namespace),
               "url": link.get("href", "") if link is not None else "",
               "description": BeautifulSoup(entry.findtext("a:content", default="", namespaces=namespace), "html.parser").get_text(" ", strip=True),
               "published_at": entry.findtext("a:published", namespaces=namespace),
               "entry_id": entry.findtext("a:id", default="", namespaces=namespace),
               "content_html": entry.findtext("a:content", default="", namespaces=namespace)}


def product_hunt_products(client, page):
    """Read the official public feed without requesting challenge-protected HTML.

    A PH listing is a distinct identity until a real product website is supplied.
    Never infer domains from product names or treat a PH profile as the official site.
    """
    _, body = client.page(PRODUCT_HUNT_FEED)
    for entry in atom_entries(body):
        try:
            parsed = urlsplit(entry["url"])
            valid = (parsed.scheme == "https" and parsed.hostname in {"producthunt.com", "www.producthunt.com"}
                     and not parsed.username and not parsed.password and parsed.port in {None, 443}
                     and re.fullmatch(r"/(products|posts)/[a-zA-Z0-9-]+", parsed.path))
        except ValueError:
            valid = False
        if not valid or not entry["title"].strip():
            yield None
            continue
        url = urlunsplit(("https", "www.producthunt.com", parsed.path, "", ""))
        identity = "producthunt:" + parsed.path.strip("/").lower()
        soup = BeautifulSoup(entry["content_html"], "html.parser")
        # Keep the product tagline, excluding the feed's Discussion / Link controls.
        paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p") if not p.find("a")]
        description = " ".join(text for text in paragraphs if text).strip()
        outbound = next((a.get("href") for a in soup.select("a[href]")
                         if (urlsplit(a["href"]).hostname or "") in {"producthunt.com", "www.producthunt.com"}
                         and urlsplit(a["href"]).path.startswith("/r/p/")), "")
        if not description:
            description = entry["title"]
        yield {"candidate_key": identity, "identity": identity, "repository": "", "name": entry["title"][:100],
               "website": url, "description": description[:700], "category": "软件工具", "source_kind": "product_hunt",
               "source_url": url, "published_at": entry["published_at"], "listing_title": entry["title"],
               "metadata": {"feed_url": PRODUCT_HUNT_FEED, "feed_entry_id": entry["entry_id"],
                            "outbound_url": outbound, "website_status": "unconfirmed", "transport": "public_atom"}}


def betalist_products(client, page):
    _, body = client.page(BETALIST_FEED)
    entries = list(atom_entries(body))
    # Hydrate six directory listings, rotating through the public feed across runs.
    offset = ((page - 1) * 6) % max(1, len(entries))
    for entry in entries[offset:offset + 6]:
        parsed = urlsplit(entry["url"])
        if parsed.hostname != "betalist.com" or not re.fullmatch(r"/startups/[a-z0-9-]+", parsed.path):
            yield None
            continue
        listing_url = urlunsplit(("https", "betalist.com", parsed.path, "", ""))
        # Official directory visit link; PublicClient checks redirects and robots before each fetch.
        try:
            website, _ = client.page(listing_url + "/visit")
        except RateLimitError:
            raise
        except (CollectionError, httpx.HTTPError) as error:
            # Do not guess a product domain or collect the directory as if it were the product.
            yield {"discovery_error": str(error), "source_url": listing_url}
            continue
        name = re.split(r"\s+[–—]\s+", entry["title"], maxsplit=1)[0].strip()
        candidate = website_candidate(name, website, entry["description"], "betalist", listing_url, entry["published_at"], {"feed_url": BETALIST_FEED})
        if candidate:
            candidate["listing_title"] = entry["title"]
        yield candidate


def hacker_news_products(client, page):
    _, body = client.page(HN_API + "&page=" + str(page - 1))
    try:
        payload = json.loads(body)
    except ValueError as error:
        raise CollectionError("Show HN 未返回有效 JSON") from error
    if not isinstance(payload, dict) or not isinstance(payload.get("hits"), list):
        raise CollectionError("Show HN 数据格式不正确")
    for hit in payload["hits"]:
        if not isinstance(hit, dict) or not isinstance(hit.get("url"), str) or not isinstance(hit.get("title"), str):
            yield None
            continue
        title = hit.get("title") or ""
        if not title.lower().startswith("show hn:") or not str(hit.get("objectID", "")).isdigit():
            yield None
            continue
        description = re.sub(r"^Show HN:\s*", "", title, flags=re.I)
        name = re.split(r"\s+[–—-]\s+|:\s+", description, maxsplit=1)[0].strip()
        if len(name) > 55 or re.match(r"^(I |We |A |An |My |The )", name):
            name = (urlsplit(hit.get("url") or "").hostname or "").removeprefix("www.").split(".")[0]
        candidate = website_candidate(name, hit.get("url"), description, "hacker_news",
            "https://news.ycombinator.com/item?id=" + str(hit["objectID"]), hit.get("created_at"),
            {"author": hit.get("author"), "points": hit.get("points"), "comments": hit.get("num_comments")})
        if candidate:
            candidate["listing_title"] = title
        yield candidate
