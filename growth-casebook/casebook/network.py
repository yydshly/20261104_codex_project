import ipaddress
import re
import socket
import time
from datetime import datetime, timedelta, timezone
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser

import httpx


USER_AGENT = "GrowthCasebook/0.1 (public-source research)"
MAX_BYTES = 2_000_000


class CollectionError(ValueError):
    pass


class RateLimitError(CollectionError):
    def __init__(self, retry_at):
        self.retry_at = retry_at
        super().__init__("来源接口达到免费请求配额，已暂停请求，等待配额恢复")


GITHUB_RETRY_AT = None


def public_url(value):
    value = value.strip()
    if "://" not in value:
        value = "https://" + value
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError as error:
        raise CollectionError("网址格式不正确") from error
    if parsed.scheme not in {"https", "http"} or not parsed.hostname:
        raise CollectionError("请输入公开网站的 HTTP 或 HTTPS 网址")
    if parsed.username or parsed.password or port not in {None, 80, 443}:
        raise CollectionError("网址不能包含账号、密码或自定义端口")
    hostname = parsed.hostname.lower().rstrip(".")
    if hostname == "localhost" or hostname.endswith((".localhost", ".local", ".internal")):
        raise CollectionError("采集仅支持公网网站")
    try:
        addresses = socket.getaddrinfo(hostname, port or (443 if parsed.scheme == "https" else 80), type=socket.SOCK_STREAM)
    except socket.gaierror as error:
        raise CollectionError("域名无法解析，请检查网址") from error
    if not addresses or any(not ipaddress.ip_address(address[4][0]).is_global for address in addresses):
        raise CollectionError("采集仅支持公网网站")
    return urlunsplit((parsed.scheme, hostname, parsed.path or "/", parsed.query, ""))


def github_repository(value):
    value = value.strip().removesuffix(".git").rstrip("/")
    if not value:
        return None
    if "://" in value:
        parsed = urlsplit(value)
        if parsed.hostname not in {"github.com", "www.github.com"}:
            raise CollectionError("GitHub 仓库请填写 github.com 上的公开仓库网址")
        value = parsed.path.strip("/")
    pieces = value.split("/")
    if len(pieces) != 2 or not all(re.fullmatch(r"[A-Za-z0-9_.-]+", piece) for piece in pieces):
        raise CollectionError("GitHub 仓库格式应为 owner/repository")
    if any(piece in {".", ".."} for piece in pieces):
        raise CollectionError("GitHub 仓库格式不正确")
    return "/".join(pieces)


def project_address(value):
    normalized = public_url(value)
    parsed = urlsplit(normalized)
    if parsed.hostname in {"github.com", "www.github.com"}:
        repository = github_repository(normalized)
        return "github:" + repository.casefold(), "https://github.com/" + repository, repository
    website = urlunsplit((parsed.scheme, parsed.netloc, "/", "", ""))
    identity = parsed.hostname.removeprefix("www.")
    return identity, website, None


class PublicClient:
    def __init__(self):
        self.client = httpx.Client(
            timeout=httpx.Timeout(18, connect=10), follow_redirects=False,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/json,text/plain;q=0.9"},
        )
        self.robots = {}

    def close(self):
        self.client.close()

    def fetch(self, url, accept=None, respect_robots=False):
        for _ in range(6):
            url = public_url(url)
            if respect_robots:
                self.allowed(url)
            headers = {"Accept": accept} if accept else None
            with self.client.stream("GET", url, headers=headers) as response:
                if response.status_code in {301, 302, 303, 307, 308}:
                    location = response.headers.get("location")
                    if not location:
                        raise CollectionError("页面重定向缺少目标网址")
                    url = urljoin(url, location)
                    continue
                if response.status_code == 429 or (response.status_code == 403 and response.headers.get("x-ratelimit-remaining") == "0"):
                    try:
                        reset = float(response.headers.get("x-ratelimit-reset", 0))
                        delay = float(response.headers.get("retry-after", 60))
                    except ValueError:
                        reset, delay = 0, 60
                    retry_at = datetime.fromtimestamp(max(reset, time.time() + max(60, delay)), timezone.utc).isoformat(timespec="seconds")
                    raise RateLimitError(retry_at)
                if response.status_code >= 400:
                    raise CollectionError(f"来源返回 HTTP {response.status_code}")
                content_type = response.headers.get("content-type", "").lower()
                if content_type and not any(kind in content_type for kind in ("text/", "json", "xml")):
                    raise CollectionError("来源没有返回可读取的文本")
                data = bytearray()
                for chunk in response.iter_bytes():
                    data.extend(chunk)
                    if len(data) > MAX_BYTES:
                        raise CollectionError("页面超过 2 MB 的采集上限")
                encoding = response.encoding or "utf-8"
                return str(response.url), data.decode(encoding, errors="replace")
        raise CollectionError("页面重定向次数过多")

    def allowed(self, url):
        parsed = urlsplit(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin not in self.robots:
            parser = RobotFileParser()
            try:
                _, body = self.fetch(origin + "/robots.txt")
                parser.parse(body.splitlines())
            except CollectionError as error:
                if "HTTP 404" in str(error) or "HTTP 410" in str(error):
                    parser.parse([])
                else:
                    raise CollectionError("无法确认 robots.txt 访问规则，暂缓采集该网站") from error
            self.robots[origin] = parser
        if not self.robots[origin].can_fetch(USER_AGENT, url):
            raise CollectionError("网站 robots.txt 限制了该页面的自动采集")

    def page(self, url):
        return self.fetch(url, respect_robots=True)

    def github(self, path):
        import json

        global GITHUB_RETRY_AT
        if GITHUB_RETRY_AT and GITHUB_RETRY_AT > datetime.now(timezone.utc).isoformat(timespec="seconds"):
            raise RateLimitError(GITHUB_RETRY_AT)
        try:
            _, body = self.fetch("https://api.github.com/" + path, "application/vnd.github+json")
        except RateLimitError as error:
            GITHUB_RETRY_AT = error.retry_at
            raise
        try:
            return json.loads(body)
        except ValueError as error:
            raise CollectionError("GitHub 未返回有效 JSON") from error
