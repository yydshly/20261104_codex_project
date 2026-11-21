import base64
import hashlib
import json
import re
from urllib.parse import urljoin, urlsplit

import httpx
from bs4 import BeautifulSoup

from .db import utc_now
from .models import Collection, Source
from .network import CollectionError, PublicClient, github_repository


PAGE_TYPES = [
    ("pricing", r"pricing|价格|定价"),
    ("content", r"/blog(?:/|$)|/learn(?:/|$)|/resources(?:/|$)|博客"),
    ("docs", r"/docs(?:/|$)|/documentation(?:/|$)|/changelog(?:/|$)|文档"),
]
SOCIAL_HOSTS = {"x.com", "twitter.com", "youtube.com", "youtu.be", "tiktok.com", "threads.net", "threads.com", "linkedin.com", "discord.com", "discord.gg"}


def text_content(html):
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.get_text(" ", strip=True) if soup.title else "公开网页"
    description_tag = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
    description = description_tag.get("content", "").strip() if description_tag else ""
    published = None
    published_tag = soup.find("meta", attrs={"property": "article:published_time"})
    if published_tag:
        published = published_tag.get("content")
    links = []
    for anchor in soup.find_all("a", href=True):
        links.append({"url": anchor["href"], "text": anchor.get_text(" ", strip=True)[:120]})
    for node in soup(["script", "style", "noscript", "svg", "iframe", "form", "nav", "header", "footer"]):
        node.decompose()
    main = soup.find("main") or soup.find("article") or soup.body or soup
    text = "\n".join(line.strip() for line in main.get_text("\n", strip=True).splitlines() if line.strip())
    return title[:250], description[:700], text[:22000], links, published


def source(kind, title, url, text, **kwargs):
    return Source(
        id="s-" + hashlib.sha256(url.encode()).hexdigest()[:16], kind=kind, title=title,
        url=url, collected_at=utc_now(), text=text[:22000], **kwargs,
    )


def collect_project(project, progress, client=None):
    owned_client = client is None
    client = client or PublicClient()
    sources = []
    warnings = []
    website = project["website"]
    name = project["name"]
    description = ""
    repository = github_repository(project["github"]) if project["github"] else None
    if urlsplit(website).hostname == "github.com":
        repository = github_repository(website)
    accounts = {}

    def add_page(url, kind):
        final_url, html = client.page(url)
        title, page_description, text, links, published = text_content(html)
        if re.search(r"just a moment|access denied|attention required|403 forbidden", title, re.IGNORECASE):
            raise CollectionError("来源返回访问验证页，暂缓自动采集")
        absolute_links = []
        seen = set()
        for link in links:
            address = urljoin(final_url, link["url"])
            parsed = urlsplit(address)
            if parsed.scheme not in {"http", "https"} or parsed.username or parsed.password:
                continue
            address = parsed._replace(fragment="").geturl()
            if address not in seen:
                seen.add(address)
                absolute_links.append({"url": address, "text": link["text"]})
        item = source(kind, title, final_url, text, links=absolute_links[:180], published_at=published)
        if len(text.strip()) < 60:
            raise CollectionError("页面正文过少，可能需要浏览器渲染")
        if not any(existing.url == item.url for existing in sources):
            sources.append(item)
        return item, page_description

    try:
        homepage = None
        if urlsplit(website).hostname != "github.com":
            progress("读取官网与公开入口", 12)
            try:
                homepage, description = add_page(website, "website")
                website = homepage.url
                if not name or name == urlsplit(project["website"]).hostname:
                    name = re.split(r"\s+[|–—-]\s+", homepage.title)[0][:100]
                for link in homepage.links:
                    host = (urlsplit(link["url"]).hostname or "").removeprefix("www.")
                    if host in SOCIAL_HOSTS:
                        path_parts = urlsplit(link["url"]).path.strip("/").split("/")
                        label = host
                        if host in {"x.com", "twitter.com"} and path_parts[0]:
                            label = "@" + path_parts[0] + (" · 帖子" if "status" in path_parts else "")
                        accounts[link["url"]] = {"url": link["url"], "platform": host, "label": label}
                    if not repository and host == "github.com":
                        try:
                            repository = github_repository(link["url"])
                        except CollectionError:
                            pass
            except (CollectionError, httpx.HTTPError) as error:
                warnings.append(f"官网采集未完成。{friendly_error(error)}")

        if homepage:
            visited = {homepage.url.rstrip("/")}
            for index, (kind, pattern) in enumerate(PAGE_TYPES):
                candidates = [link["url"] for link in homepage.links if (
                    urlsplit(link["url"]).hostname == urlsplit(homepage.url).hostname
                    and (re.search(pattern, urlsplit(link["url"]).path, re.IGNORECASE)
                         or re.search(pattern, link["text"], re.IGNORECASE))
                    and link["url"].rstrip("/") not in visited
                    and not urlsplit(link["url"]).query
                )]
                if not candidates:
                    continue
                page_url = min(candidates, key=len)
                visited.add(page_url.rstrip("/"))
                progress(f"读取{'定价页' if kind == 'pricing' else '内容页' if kind == 'content' else '文档页'}", 24 + index * 9)
                try:
                    add_page(page_url, kind)
                except (CollectionError, httpx.HTTPError) as error:
                    warnings.append(f"{page_url} 采集未完成。{friendly_error(error)}")

        if repository:
            progress("读取 GitHub 仓库", 54)
            try:
                repo = client.github("repos/" + repository)
                if not isinstance(repo, dict) or "full_name" not in repo:
                    raise CollectionError("未找到公开仓库")
                repository = repo["full_name"]
                repository_url = "https://github.com/" + repository
                metadata = {key: repo.get(key) for key in (
                    "full_name", "stargazers_count", "forks_count", "open_issues_count", "language", "license",
                    "created_at", "pushed_at", "topics", "description", "homepage", "archived",
                )}
                sources.append(source("repository", repository, repository_url,
                                      json.dumps(metadata, ensure_ascii=False), metadata=metadata))
                if not description:
                    description = (repo.get("description") or "")[:700]
                if urlsplit(project["website"]).hostname == "github.com":
                    name = project["name"] or repository.split("/")[1]

                progress("读取 README 与安装说明", 63)
                try:
                    readme = client.github("repos/" + repository + "/readme")
                    content = base64.b64decode(readme.get("content", "")).decode("utf-8", errors="replace")
                    sources.append(source("readme", repository + " README", readme.get("html_url") or repository_url + "#readme", content))
                except (CollectionError, httpx.HTTPError, ValueError) as error:
                    warnings.append(f"README 采集未完成。{friendly_error(error)}")

                progress("读取最近发布记录", 72)
                try:
                    releases = client.github("repos/" + repository + "/releases?per_page=4")
                    if not isinstance(releases, list):
                        raise CollectionError("发布记录格式不正确")
                    for release in releases:
                        if release.get("draft"):
                            continue
                        sources.append(source(
                            "release", release.get("name") or release["tag_name"], release["html_url"],
                            release.get("body") or release["tag_name"], published_at=release.get("published_at"),
                            metadata={"tag": release["tag_name"], "prerelease": bool(release.get("prerelease"))},
                        ))
                except (CollectionError, httpx.HTTPError) as error:
                    warnings.append(f"发布记录采集未完成。{friendly_error(error)}")
            except (CollectionError, httpx.HTTPError) as error:
                warnings.append(f"GitHub 采集未完成。{friendly_error(error)}")

        if not sources:
            raise CollectionError("没有取得可用公开资料。可补充公开 GitHub 仓库后重试。" + " ".join(warnings))
        return Collection(
            name=name or urlsplit(website).hostname, description=description, website=website,
            github="https://github.com/" + repository if repository else None,
            sources=sources, warnings=warnings, discovered_accounts=list(accounts.values()),
        )
    finally:
        if owned_client:
            client.close()


def friendly_error(error):
    if isinstance(error, httpx.TimeoutException):
        return "来源响应超时"
    if isinstance(error, httpx.HTTPError):
        return "来源暂时无法连接"
    return str(error)[:400]
