import socket
import time
from concurrent.futures import ThreadPoolExecutor

import httpx
import pytest
from fastapi.testclient import TestClient

from casebook.app import create_app
from casebook.collect import collect_project, text_content
from casebook.db import Database
from casebook.localize import ChineseTranslator, needs_translation, valid_translation
from casebook.discovery import discover, product_candidate
from casebook.discovery_store import DiscoveryStore
from casebook.network import CollectionError, PublicClient, public_url
from casebook.network import RateLimitError
from casebook.report import build_report, validate_references


PROJECT = {
    "id": "test-project", "name": "Demo Product", "website": "https://demo.example/",
    "github": "demo/product", "category": "开发者工具",
}


class PublicSources:
    def __init__(self, fail_homepage=False):
        self.fail_homepage = fail_homepage

    def page(self, url):
        if self.fail_homepage:
            raise CollectionError("来源返回 HTTP 503")
        if url.endswith("/pricing"):
            return url, '<html><title>Pricing</title><main>Start your free trial. Starter plan $19 / month. Team plan $49 / month. Compare all plans and choose what your team needs.</main></html>'
        if url.endswith("/blog"):
            return url, '<html><title>Product blog</title><main>Practical guides for developers using our tool. Find step by step tutorials, product updates and examples for your team.</main></html>'
        return url, '<html><title>Demo Product</title><meta name="description" content="A public tool for developer teams."><main>A public tool for developer teams to work together and share useful results. Learn how the product works and find the plan for your team.<a href="/pricing">Pricing</a><a href="/blog">Blog</a><a href="https://github.com/demo/product">GitHub</a><a href="https://x.com/demo">X</a></main></html>'

    def github(self, path):
        if path.endswith("/readme"):
            import base64
            return {"content": base64.b64encode(b"Self-host the developer product with docker compose. Follow the guide to get started.").decode(), "html_url": "https://github.com/demo/product/blob/main/README.md"}
        if "/releases?" in path:
            return [{"tag_name": "v1.2", "name": "Release 1.2", "body": "Added team collaboration and improved setup instructions.", "html_url": "https://github.com/demo/product/releases/tag/v1.2", "published_at": "2026-10-01T12:00:00Z"}]
        return {"full_name": "demo/product", "description": "A public tool for developer teams.", "stargazers_count": 120, "forks_count": 12, "license": {"name": "MIT"}, "created_at": "2026-01-01T00:00:00Z"}


@pytest.fixture
def public_dns(monkeypatch):
    original = socket.getaddrinfo

    def resolve(host, *args, **kwargs):
        if host == "demo.example":
            return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", ("93.184.216.34", 443))]
        return original(host, *args, **kwargs)

    monkeypatch.setattr("casebook.network.socket.getaddrinfo", resolve)


def wait_task(client, task_id):
    for _ in range(100):
        task = client.get("/api/tasks/" + task_id).json()
        if task["status"] in {"completed", "failed"}:
            return task
        time.sleep(0.02)
    raise AssertionError("Background task did not finish")


def test_browser_api_worker_storage_flow_and_failed_refresh(tmp_path, monkeypatch, public_dns):
    failing = False

    def collect(project, progress):
        if failing:
            raise CollectionError("来源暂时不可用")
        return collect_project(project, progress, PublicSources())

    monkeypatch.setattr("casebook.worker.collect_project", collect)
    monkeypatch.setattr(ChineseTranslator, "available", lambda self: True)
    monkeypatch.setattr(ChineseTranslator, "translate", lambda self, text: "中文译文：开发者团队的协作工具。")
    monkeypatch.delenv("CASEBOOK_OLLAMA_MODEL", raising=False)
    app = create_app(tmp_path / "casebook.sqlite3")
    with TestClient(app) as client:
        assert client.get("/").status_code == 200
        assert client.get("/api/projects").json() == {"items": []}
        response = client.post("/api/projects", json={"url": PROJECT["website"], "github": PROJECT["github"]})
        assert response.status_code == 202
        task = wait_task(client, response.json()["task"]["id"])
        assert task["status"] == "completed"
        project_id = task["project_id"]
        report = client.get(f"/api/projects/{project_id}").json()["report"]
        assert len(report["sections"]) == 8
        assert len(report["sources"]) >= 5
        assert any(action["channel"] == "内容营销" for action in report["actions"])
        assert any("收入" in gap for gap in report["gaps"])
        assert report["mode"] == "evidence"
        assert report["version"] == 1
        assert report["translations"]["A public tool for developer teams."] == "中文译文：开发者团队的协作工具。"
        assert len(client.get("/api/projects?q=开发者团队").json()["items"]) == 1
        assert any("A public tool" in source["text"] for source in report["sources"])
        assert len(client.get("/api/projects?q=Demo").json()["items"]) == 1
        assert len(client.get("/api/projects?channel=产品试用").json()["items"]) == 1
        assert client.get("/api/projects?q=unmatched").json()["items"] == []
        export = client.get(f"/api/projects/{project_id}/report.json?version=1")
        assert export.status_code == 200 and "attachment" in export.headers["content-disposition"]
        assert export.json() == report
        assert client.get(f"/api/projects/{project_id}?version=99").status_code == 404
        refresh = client.post(f"/api/projects/{project_id}/refresh").json()
        assert wait_task(client, refresh["task"]["id"])["status"] == "completed"
        assert client.get(f"/api/projects/{project_id}").json()["report"]["version"] == 2
        assert client.get(f"/api/projects/{project_id}?version=1").json()["report"] == report
        failing = True
        refresh = client.post(f"/api/projects/{project_id}/refresh").json()
        assert wait_task(client, refresh["task"]["id"])["status"] == "failed"
        assert client.get(f"/api/projects/{project_id}").json()["report"]["version"] == 2
        assert client.post("/api/projects", json={"url": PROJECT["website"]}, headers={"Origin": "https://another.example"}).status_code == 403
        assert client.post("/api/projects", json={"url": "http://127.0.0.1/"}).status_code == 422

    with TestClient(create_app(tmp_path / "casebook.sqlite3", start_worker=False)) as client:
        assert client.get(f"/api/projects/{project_id}").json()["report"]["version"] == 2
        assert client.get("/api/projects").json()["items"][0]["description_zh"] == "中文译文：开发者团队的协作工具。"


def test_translation_cache_is_tied_to_original_and_preserves_versions(tmp_path, monkeypatch):
    database = Database(tmp_path / "localized.sqlite3")
    task, _ = database.enqueue("demo.example", PROJECT["website"], PROJECT["name"], PROJECT["category"], PROJECT["github"])
    job = database.claim()
    collection = collect_project(PROJECT, lambda *_: None, PublicSources())
    report = build_report(task["project_id"], collection)
    database.publish(task["id"], job["attempt"], collection, report)
    with database.connect() as connection:
        original_payload = connection.execute("SELECT payload FROM reports").fetchone()[0]
    calls = []
    monkeypatch.setattr(ChineseTranslator, "available", lambda self: True)
    monkeypatch.setattr(ChineseTranslator, "translate", lambda self, text: calls.append(text) or "供开发者团队使用的公开工具。")
    translator = ChineseTranslator(database)
    assert translator.populate([collection.description, collection.description, "已经是中文的简介。", "v1.2.3"]) == 1
    assert translator.populate([collection.description]) == 0
    assert calls == [collection.description]
    localized = database.report(task["project_id"], 1)
    assert localized["translations"][collection.description] == "供开发者团队使用的公开工具。"
    assert localized["sections"][0]["facts"][0]["text"] == collection.description
    assert database.translations_for(["A changed product description for another team."]) == {}
    with database.connect() as connection:
        assert connection.execute("SELECT payload FROM reports").fetchone()[0] == original_payload
    assert not needs_translation("官网已提供中文产品说明。")
    assert not needs_translation("GitHub v1.2")
    assert not needs_translation("仓库 documenso/documenso，API 返回许可证为 GNU Affero General Public License v3.0。")
    assert valid_translation("$20 per month, $0.00003 per event", "每月 $20，每次事件 $0.00003")
    assert not valid_translation("$20 per month, $0.00003 per event", "每月 $20，每次事件 $0.003")
    assert not valid_translation("Release news", "每月免费1美元。" * 8)
    assert not valid_translation("Fix PSA-2026-4QX1WG", "修复 PSA-2026-4X1WG")
    assert not valid_translation("Set `FB_APP_SECRET`", "配置 FB_APP_ SECRET")


def test_partial_collection_preserves_gaps_and_valid_citations():
    collection = collect_project(PROJECT, lambda *_: None, PublicSources(fail_homepage=True))
    assert collection.warnings
    assert all(source.kind not in {"website", "pricing", "content"} for source in collection.sources)
    report = build_report(PROJECT["id"], collection)
    assert any("定价" in gap for gap in report.gaps)
    assert all(action.date is None or action.date in {"2026-01-01", "2026-10-01"} for action in report.actions)
    report.actions[0].source_ids = ["unknown-source"]
    with pytest.raises(ValueError, match="来源引用"):
        validate_references(report)


def test_content_extraction_preserves_links_but_excludes_navigation():
    html = '<html><title>Useful article</title><header><a href="/pricing">Pricing menu</a></header><nav>Unrelated navigation</nav><article>Actual useful content for product users.</article><footer>Footer content</footer><time datetime="2026-10-01">First list item date</time></html>'
    _, _, text, links, published = text_content(html)
    assert text == "Actual useful content for product users."
    assert links == [{"url": "/pricing", "text": "Pricing menu"}]
    assert published is None


def test_concurrent_submissions_share_a_single_active_job(tmp_path):
    database = Database(tmp_path / "jobs.sqlite3")
    with ThreadPoolExecutor(max_workers=8) as executor:
        tasks = list(executor.map(lambda _: database.enqueue("demo.example", PROJECT["website"], PROJECT["name"], PROJECT["category"], PROJECT["github"]), range(12)))
    assert len({task["id"] for task, _ in tasks}) == 1
    assert sum(created for _, created in tasks) == 1


def test_reclaimed_job_rejects_stale_worker_writes(tmp_path):
    database = Database(tmp_path / "leases.sqlite3")
    task, _ = database.enqueue("demo.example", PROJECT["website"], PROJECT["name"], PROJECT["category"], PROJECT["github"])
    first = database.claim()
    with database.connect() as connection:
        connection.execute("UPDATE tasks SET lease_until='2000-01-01' WHERE id=?", (task["id"],))
    second = database.claim()
    assert second["attempt"] == first["attempt"] + 1
    collection = collect_project(PROJECT, lambda *_: None, PublicSources())
    report = build_report(task["project_id"], collection)
    assert database.publish(task["id"], first["attempt"], collection, report) is False
    database.fail(task["id"], first["attempt"], "stale failure")
    assert database.get_task(task["id"])["status"] == "running"
    assert database.publish(task["id"], second["attempt"], collection, report) is True
    assert database.report(task["project_id"])["version"] == 1


def test_network_blocks_private_redirects_and_obeys_robots(public_dns):
    for url in ["http://127.0.0.1/", "http://[::1]/", "http://10.0.0.1/", "https://localhost/", "https://demo.example:8080/", "file:///etc/passwd"]:
        with pytest.raises(CollectionError):
            public_url(url)
    seen = []

    def handle(request):
        seen.append(str(request.url))
        if request.url.path == "/robots.txt":
            return httpx.Response(200, text="User-agent: *\nDisallow: /private")
        return httpx.Response(302, headers={"location": "http://127.0.0.1/"})

    client = PublicClient()
    client.client.close()
    client.client = httpx.Client(transport=httpx.MockTransport(handle))
    with pytest.raises(CollectionError, match="robots.txt"):
        client.page("https://demo.example/private")
    with pytest.raises(CollectionError, match="公网"):
        client.fetch("https://demo.example/redirect")
    assert "http://127.0.0.1/" not in seen
    client.close()


def discovery_repo(name="product", website="https://demo.example/", **changes):
    return {"name": name, "full_name": "demo/" + name, "homepage": website,
            "description": "A public tool for developer teams.", "stargazers_count": 900,
            "topics": ["self-hosted", "automation"], "fork": False, "archived": False, **changes}


class DiscoverySources:
    def __init__(self, repos):
        self.repos = repos

    def github(self, path):
        return {"items": self.repos, "incomplete_results": False}

    def close(self):
        pass


def test_product_discovery_filters_and_classifies_public_product_candidates():
    repo = discovery_repo()
    candidate = product_candidate(repo, "https://github.com/search?q=self-hosted")
    assert candidate["category"] == "自动化"
    assert candidate["repository"] == "demo/product"
    for changes in [{"fork": True}, {"archived": True}, {"private": True}, {"stargazers_count": 100},
                    {"name": "awesome-tools"}, {"topics": ["sdk"]}, {"homepage": ""},
                    {"homepage": "https://github.com/demo/product"}, {"homepage": "https://demo.example/docs"},
                    {"homepage": "https://user:secret@demo.example"}, {"homepage": "https://demo.example:9000"}]:
        assert product_candidate({**repo, **changes}, "https://github.com/search") is None


def test_discovery_queues_bounded_new_projects_and_retains_candidate_pool(tmp_path, public_dns):
    database = Database(tmp_path / "discovered.sqlite3")
    database.enqueue("existing.example", "https://existing.example/", "Already known", "软件工具", "https://github.com/demo/known")
    store = DiscoveryStore(database)
    store.configure(False, 1, 24)
    store.enqueue()
    run = store.claim()
    discover(store, run, DiscoverySources([discovery_repo("known"), discovery_repo(), discovery_repo("second")]))
    snapshot = store.snapshot()
    assert snapshot["runs"][0]["status"] == "completed"
    assert snapshot["runs"][0]["queued"] == 1
    assert snapshot["runs"][0]["duplicates"] == 1
    assert snapshot["runs"][0]["accepted"] == 3  # repeated search results count once
    assert snapshot["counts"]["candidate"] == 1
    assert snapshot["counts"]["queued"] == 1
    store.enqueue()
    discover(store, store.claim(), DiscoverySources([discovery_repo()]))
    assert store.snapshot()["counts"]["queued"] == 1  # same website also deduplicates
    assert len(database.list_tasks()) == 2  # original task plus one discovered product
    assert database.projects() == []  # unpublished candidates never appear in the library


def test_discovery_settings_persist_and_reclaimed_run_rejects_stale_queue(tmp_path, public_dns):
    database = Database(tmp_path / "scheduled.sqlite3")
    store = DiscoveryStore(database)
    assert store.enqueue("scheduled", due_only=True) == (None, False)
    store.configure(True, 1, 24)
    queued, created = store.enqueue("scheduled", due_only=True)
    assert created
    assert store.enqueue()[0]["id"] == queued["id"]
    first = store.claim()
    with database.connect() as connection:
        connection.execute("UPDATE discovery_runs SET lease_until='2000-01-01' WHERE id=?", (first["id"],))
    second = store.claim()
    candidate = product_candidate(discovery_repo(), "https://github.com/search")
    store.remember(candidate)
    assert store.queue_candidate(candidate, "demo.example", candidate["website"], first) == "stale"
    assert store.queue_candidate(candidate, "demo.example", candidate["website"], second) == "queued"
    store.finish(first, {"scanned": 0, "accepted": 0, "queued": 0, "duplicates": 0}, [], failed=True)
    assert store.snapshot()["runs"][0]["status"] == "running"
    store.finish(second, {"scanned": 1, "accepted": 1, "queued": 0, "duplicates": 0}, [])
    assert store.snapshot()["runs"][0]["queued"] == 1  # interrupted accounting never erases a queued task
    next_run = store.settings()["next_run_at"]
    store.configure(False, 1, 24)
    assert store.configure(True, 1, 24)["next_run_at"] == next_run
    restarted = DiscoveryStore(Database(database.path))
    assert restarted.settings()["enabled"]
    assert restarted.enqueue("scheduled", due_only=True) == (None, False)
    assert restarted.snapshot()["counts"]["queued"] == 1


def test_discovery_rate_limit_records_cooldown_and_stops_searching(tmp_path):
    database = Database(tmp_path / "rate.sqlite3")
    store = DiscoveryStore(database)
    store.enqueue()
    class LimitedSource:
        calls = 0
        def github(self, path):
            self.calls += 1
            raise RateLimitError("2099-01-01T00:00:00+00:00")
    client = LimitedSource()
    discover(store, store.claim(), client)
    assert client.calls == 1
    assert store.snapshot()["runs"][0]["status"] == "failed"
    with pytest.raises(CollectionError, match="冷却"):
        store.enqueue()


def test_discovery_api_to_worker_to_chinese_report_and_library(tmp_path, monkeypatch, public_dns):
    monkeypatch.setattr("casebook.discovery.PublicClient", lambda: DiscoverySources([discovery_repo()]))
    monkeypatch.setattr("casebook.worker.collect_project", lambda project, progress: collect_project(project, progress, PublicSources()))
    monkeypatch.setattr(ChineseTranslator, "available", lambda self: True)
    monkeypatch.setattr(ChineseTranslator, "translate", lambda self, text: "中文译文：开发者团队的协作工具。")
    monkeypatch.delenv("CASEBOOK_OLLAMA_MODEL", raising=False)
    app = create_app(tmp_path / "flow.sqlite3", start_worker=False)
    with TestClient(app) as client:
        assert not client.get("/api/discovery").json()["settings"]["enabled"]
        first = client.post("/api/discovery/runs").json()
        assert client.post("/api/discovery/runs").json() == {"run_id": first["run_id"], "created": False}
        assert client.put("/api/discovery/settings", json={"enabled": True, "batch_size": 50}).status_code == 422
        app.state.worker.start()
        try:
            for _ in range(100):
                snapshot = client.get("/api/discovery").json()
                if snapshot["counts"].get("published"):
                    break
                time.sleep(0.02)
            assert snapshot["counts"]["published"] == 1
            item = client.get("/api/projects").json()["items"][0]
            assert item["description_zh"] == "中文译文：开发者团队的协作工具。"
            assert len(client.get("/api/projects/" + item["id"]).json()["report"]["sections"]) == 8
            assert snapshot["candidates"][0]["source_url"].startswith("https://github.com/search?")
            client.put("/api/discovery/settings", json={"enabled": True, "batch_size": 3, "interval_hours": 72})
        finally:
            app.state.worker.stop()
    with TestClient(create_app(tmp_path / "flow.sqlite3", start_worker=False)) as client:
        assert client.get("/api/discovery").json()["settings"]["enabled"]
        assert len(client.get("/api/projects").json()["items"]) == 1


def test_github_quota_cooldown_is_shared_between_clients(monkeypatch):
    monkeypatch.setattr("casebook.network.GITHUB_RETRY_AT", None)
    calls = []
    def limited(*args):
        calls.append(True)
        raise RateLimitError("2099-01-01T00:00:00+00:00")
    monkeypatch.setattr(PublicClient, "fetch", limited)
    for _ in range(2):
        client = PublicClient()
        try:
            with pytest.raises(RateLimitError):
                client.github("repos/demo/product")
        finally:
            client.close()
    assert len(calls) == 1
