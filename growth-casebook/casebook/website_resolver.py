"""Resolve product websites from public links, with evidence and no guessed domains."""
import json
import re
from urllib.parse import quote, urlsplit, urlunsplit

import httpx
from bs4 import BeautifulSoup

from .db import utc_now
from .network import CollectionError, PublicClient, public_url
from .public_products import DIRECTORY_HOSTS


STOP_WORDS = set("the and for with from your you that this into our are can its has have all more free app apps tool online software product using use get new one ai".split())
EXCLUDED_HOSTS = DIRECTORY_HOSTS | {"hunted.space", "itunes.apple.com", "twitter.com", "x.com", "facebook.com", "linkedin.com", "instagram.com", "discord.com", "discord.gg", "threads.net", "threads.com", "tiktok.com"}


def normalized_name(value):
    return re.sub(r"[^a-z0-9\u4e00-\u9fff]", "", value.casefold()) if isinstance(value, str) else ""


def same_name(name, title):
    # A subtitle is allowed, but an arbitrary substring (e.g. Hollr / Hollrs) is not.
    if not isinstance(title, str):
        return False
    base = re.split(r"\s*[|:–—]\s*|\s+-\s+", title, maxsplit=1)[0]
    return bool(normalized_name(name)) and normalized_name(name) == normalized_name(base)


def terms(value):
    return {word for word in re.findall(r"[a-z]{3,}", value.casefold()) if word not in STOP_WORDS} if isinstance(value, str) else set()


def website_address(value):
    """Keep product paths: a maker can host several products on the same domain."""
    parsed = urlsplit(public_url(value))
    host = parsed.hostname.removeprefix("www.")
    if any(host == blocked or host.endswith("." + blocked) for blocked in EXCLUDED_HOSTS):
        raise CollectionError("候选地址是目录、社交平台或应用商店，不是产品官网")
    path = re.sub(r"/{2,}", "/", parsed.path or "/")
    if re.search(r"^/(blog|articles?|posts?|wiki|terms|privacy)(/|$)", path, re.I):
        raise CollectionError("候选地址不是产品首页")
    website = urlunsplit((parsed.scheme, parsed.netloc, path, "", ""))
    return host + path.rstrip("/"), website


def ph_path(value):
    try:
        p = urlsplit(value)
        if p.scheme == "https" and p.hostname in {"producthunt.com", "www.producthunt.com"} and not p.username and not p.password and p.port in {None, 443} and re.fullmatch(r"/(products|posts)/[a-zA-Z0-9-]+", p.path):
            return p.path.lower()
    except ValueError:
        pass
    return ""


def resolve_product_website(project, origin, client=None, progress=None):
    owned = client is None
    client = client or PublicClient()
    attempts, candidates, checked = [], [], set()
    reference = origin["description"]
    core_terms = terms(reference) - terms(project["name"])
    path = ph_path(origin["source_url"])
    result = {"status": "unresolved", "checked_at": utc_now(), "website": None,
              "method": None, "evidence": [], "attempts": attempts,
              "message": "公开线索尚不足以确认官网，保留发布简报；稍后自动重试。"}

    def note(provider, url, message):
        attempts.append({"provider": provider, "url": url, "message": message[:250]})

    def candidate(url, method, evidence, app_id=None):
        if not isinstance(url, str):
            return
        try:
            _, address = website_address(url)
        except (CollectionError, ValueError):
            return
        if address not in {item["url"] for item in candidates}:
            candidates.append({"url": address, "method": method, "evidence": evidence, "app_id": app_id})

    def verify(item, page=None):
        if len(checked) >= 4 or item["url"] in checked:
            return None
        checked.add(item["url"])
        if progress:
            progress("核对候选官网与产品身份", 27)
        try:
            final_url, html = page or client.page(item["url"])
            identity, website = website_address(final_url)
            soup = BeautifulSoup(html, "html.parser")
            title = soup.title.get_text(" ", strip=True) if soup.title else ""
            if re.search(r"just a moment|access denied|attention required|captcha|403 forbidden|domain.{0,15}sale", title, re.I):
                raise CollectionError("候选页面是访问验证或域名停放页")
            names = [title] + [node.get_text(" ", strip=True) for node in soup.select("h1")]
            for meta in soup.select('meta[property="og:site_name"],meta[property="og:title"]'):
                names.append(meta.get("content", ""))
            name_ok = any(same_name(project["name"], name) for name in names)
            # Many landing pages have a benefit headline instead of the product name.
            if not name_ok:
                name_ok = any(same_name(project["name"], node.get_text(" ", strip=True)) for node in soup.select('a[aria-label], [class*="logo"]')[:30])
            links = [a.get("href", "") for a in soup.select("a[href]")]
            ph_backlink = any(ph_path(link) == path for link in links) if path else False
            app_backlink = bool(item.get("app_id")) and any(
                urlsplit(link).hostname == "apps.apple.com" and re.search(r"/id" + re.escape(str(item["app_id"])) + r"(?:\D|$)", urlsplit(link).path)
                for link in links)
            for node in soup.select("script,style,nav,footer"):
                node.decompose()
            text = soup.get_text(" ", strip=True)
            overlap = sorted((terms(reference) - terms(project["name"])) & terms(text))
            core_overlap = core_terms & terms(text)
            if not name_ok or len(overlap) < 2 or len(core_overlap) < min(2, max(1, len(core_terms))):
                raise CollectionError("名称或功能描述不一致，未采用该候选")
            # Search results and third-party comments need a first-party backlink.
            if item["method"] != "product_hunt_redirect" and not (ph_backlink or app_backlink):
                raise CollectionError("缺少官网回链到同一产品记录或同一 App 的证据")
            evidence = item["evidence"] + [{"url": website, "title": title[:200],
                "detail": "官网产品名称与功能匹配；" + ("回链到同一 Product Hunt 产品记录。" if ph_backlink else "回链到同一 App Store 应用。" if app_backlink else "经 Product Hunt 发布链接直接跳转。"),
                "matched_terms": overlap[:12]}]
            return {**result, "status": "confirmed", "website": website, "identity": identity,
                    "method": item["method"], "evidence": evidence,
                    "message": "已自动核对官网名称、功能与产品回链，继续采集公开资料。"}
        except (CollectionError, httpx.HTTPError, ValueError) as error:
            note("官网核对", item["url"], str(error))
        return None

    try:
        if not path:
            return result
        # Try only the feed's public /r/p/ link; never probe blocked /r/* routes.
        outbound = origin.get("metadata", {}).get("outbound_url", "")
        p = urlsplit(outbound)
        if p.scheme == "https" and p.hostname in {"www.producthunt.com", "producthunt.com"} and re.fullmatch(r"/r/p/\d+", p.path) and not p.username and not p.password and p.port in {None, 443}:
            try:
                if progress:
                    progress("检查 Product Hunt 公开发布链接", 8)
                final, html = client.page(outbound)
                candidate(final, "product_hunt_redirect", [{"url": outbound, "title": "Product Hunt 发布链接", "detail": "公开订阅中的产品跳转链接。"}])
                if candidates:
                    found = verify(candidates[-1], (final, html))
                    if found:
                        return found
            except (CollectionError, httpx.HTTPError, ValueError) as error:
                note("Product Hunt 发布链接", outbound, str(error))

        # Public directory data provides context and explicit URLs, never a domain guess.
        directory_url = "https://hunted.space/product/" + path.rsplit("/", 1)[-1]
        if progress:
            progress("读取公开目录中的产品线索", 14)
        try:
            _, html = client.page(directory_url)
            soup = BeautifulSoup(html, "html.parser")
            linked = any(ph_path(a.get("href", "")) == path for a in soup.select("a[href]"))
            app = None
            for script in soup.select('script[type="application/ld+json"]'):
                try:
                    data = json.loads(script.string or "{}")
                except ValueError:
                    continue
                if isinstance(data, dict) and data.get("@type") == "SoftwareApplication" and same_name(project["name"], data.get("name", "")):
                    app = data
                    break
            if not linked or not app:
                raise CollectionError("公开目录没有同一产品名称与 Product Hunt 记录，不采用其中的链接")
            description = app.get("description", "")
            if isinstance(description, str):
                reference += " " + description[:2500]
            proof = [{"url": directory_url, "title": project["name"] + " · 公开目录", "detail": "同名产品且链接到相同 Product Hunt 记录；第三方线索仅用于官网核对。",
                      "product_record": origin["source_url"], "description": reference[:2500]}]
            if isinstance(app.get("url"), str):
                candidate(app["url"], "public_directory", proof)
            # Only explicit links within product paragraphs; ignore site-wide ads/nav.
            for anchor in soup.select("main p a[href]")[:30]:
                candidate(anchor["href"], "public_directory", proof)
            note("公开产品目录", directory_url, "已读取同一产品的公开介绍与显式链接")
        except (CollectionError, httpx.HTTPError, ValueError) as error:
            note("公开产品目录", directory_url, str(error))

        # Apple returns developer-supplied sellerUrl, including non-root product pages.
        if re.search(r"iphone|ios|apple watch|app store|mobile", reference, re.I):
            apple_url = "https://itunes.apple.com/search?" + "term=" + quote(project["name"]) + "&entity=software&country=us&limit=5"
            if progress:
                progress("检索 Apple 官方应用与开发者官网", 20)
            try:
                _, body = client.fetch(apple_url, accept="application/json")
                payload = json.loads(body)
                hits = payload.get("results", []) if isinstance(payload, dict) else []
                for app in hits[:5]:
                    if not isinstance(app, dict) or not same_name(project["name"], app.get("trackName", "")):
                        continue
                    if len(core_terms & terms(app.get("description", ""))) < min(2, max(1, len(core_terms))):
                        continue
                    app_id = app.get("trackId")
                    if not isinstance(app_id, int) or not isinstance(app.get("sellerUrl"), str):
                        continue
                    proof = [{"url": apple_url, "title": "Apple 官方应用搜索", "detail": "名称与功能匹配，返回开发者提交的官网 sellerUrl。",
                              "app_id": app_id, "app_name": app["trackName"], "seller_url": app["sellerUrl"], "description": app.get("description", "")[:700]},
                             {"url": "https://apps.apple.com/us/app/id" + str(app_id), "title": app["trackName"], "detail": "匹配应用记录，App ID " + str(app_id)}]
                    # A previous directory hint may have the same URL; prefer Apple's stronger evidence.
                    try:
                        _, address = website_address(app["sellerUrl"])
                        candidates = [item for item in candidates if item["url"] != address]
                    except (CollectionError, ValueError):
                        continue
                    candidate(address, "apple_developer_website", proof, app_id)
                note("Apple 官方应用搜索", apple_url, "已按产品名称与功能筛选，未采用同名但用途不同的 App")
            except (CollectionError, httpx.HTTPError, ValueError, TypeError) as error:
                note("Apple 官方应用搜索", apple_url, str(error))

        verified = {}
        for item in list(candidates):
            found = verify(item)
            if found:
                verified[found["identity"]] = found
        if len(verified) == 1:
            return next(iter(verified.values()))
        if len(verified) > 1:
            result["message"] = "多个官网候选均有匹配线索，暂不自动关联，保留简报以待进一步核对。"
            note("官网核对", origin["source_url"], "多个不同官网候选发生冲突")
            return result

        hn_url = "https://hn.algolia.com/api/v1/search?query=" + quote(project["name"]) + "&tags=story&restrictSearchableAttributes=title&hitsPerPage=5"
        if progress:
            progress("查找公开社区的产品发布链接", 30)
        try:
            _, body = client.fetch(hn_url, accept="application/json")
            payload = json.loads(body)
            hits = payload.get("hits", []) if isinstance(payload, dict) else []
            for hit in hits[:5]:
                if not isinstance(hit, dict):
                    continue
                title = re.sub(r"^Show HN:\s*", "", hit.get("title", ""), flags=re.I)
                if not same_name(project["name"], title) or not str(hit.get("objectID", "")).isdigit():
                    continue
                candidate(hit.get("url", ""), "public_community", [{"url": "https://news.ycombinator.com/item?id=" + str(hit["objectID"]), "title": hit["title"], "detail": "同名产品的公开社区链接，仍需核对官网回链。"}])
            note("Hacker News 公开搜索", hn_url, "已检索公开发布链接")
        except (CollectionError, httpx.HTTPError, ValueError, TypeError) as error:
            note("Hacker News 公开搜索", hn_url, str(error))
        for item in candidates:
            found = verify(item)
            if found:
                verified[found["identity"]] = found
        if len(verified) == 1:
            return next(iter(verified.values()))
        if len(verified) > 1:
            result["message"] = "多个官网候选发生冲突，保留简报以待进一步核对。"
        return result
    finally:
        if owned:
            client.close()
