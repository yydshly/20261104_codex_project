import logging
import threading
from urllib.parse import urlsplit

from .collect import collect_project, friendly_error
from .report import build_report, polish_with_local_model
from .localize import ChineseTranslator, report_texts
from .discovery import discover
from .discovery_store import DiscoveryStore
from .collect import source
from .models import Collection
from .website_resolver import resolve_product_website, website_address
from .network import CollectionError


logger = logging.getLogger("casebook.worker")


class Worker:
    def __init__(self, database):
        self.database = database
        self.translator = ChineseTranslator(database)
        self.discovery = DiscoveryStore(database)
        self.stopped = threading.Event()
        self.wake = threading.Event()
        self.thread = threading.Thread(target=self.run, name="casebook-worker", daemon=True)

    def start(self):
        self.thread.start()

    def stop(self):
        self.stopped.set()
        self.wake.set()
        self.thread.join(timeout=2)

    def run(self):
        while not self.stopped.is_set():
            try:
                job = self.database.claim()
                if job is None:
                    if self.discovery.enqueue_website_backfill():
                        continue
                    self.discovery.enqueue("scheduled", due_only=True)
                    discovery_run = self.discovery.claim()
                    if discovery_run:
                        try:
                            discover(self.discovery, discovery_run)
                        except Exception as error:
                            logger.exception("Product discovery failed")
                            self.discovery.finish(discovery_run, {"scanned": 0, "accepted": 0, "queued": discovery_run["queued"], "duplicates": 0}, [friendly_error(error)], failed=True)
                        continue
                    self.wake.wait(timeout=2)
                    self.wake.clear()
                    continue
                task_id = job["task_id"]
                attempt = job["attempt"]
                try:
                    origins = self.discovery.origins_for_project(job["project"]["id"])
                    listing_only = (urlsplit(job["project"]["website"]).hostname in {"producthunt.com", "www.producthunt.com"}
                                    and any(origin["source_kind"] == "product_hunt" for origin in origins))
                    resolution = self.database.website_resolution(job["project"]["id"])
                    if listing_only:
                        origin = next(origin for origin in origins if origin["source_kind"] == "product_hunt")
                        resolution = resolve_product_website(job["project"], origin,
                            progress=lambda stage, value: self.database.progress(task_id, attempt, stage, value))
                        if resolution["status"] == "confirmed":
                            job["project"] = {**job["project"], "website": resolution["website"]}
                            listing_only = False
                    if listing_only:
                        self.database.progress(task_id, attempt, "保留发布简报与官网查找记录", 60)
                        collection = Collection(name=job["project"]["name"], description=job["project"]["description"],
                            website=job["project"]["website"], sources=[], warnings=["已尝试自动查找官网，公开线索尚不足以确认；本份仅根据 Product Hunt 公开订阅生成，稍后自动重试。"], discovered_accounts=[])
                    else:
                        collection = collect_project(job["project"], lambda stage, value: self.database.progress(task_id, attempt, stage, value))
                        if resolution.get("status") == "confirmed" and website_address(collection.website)[0] != resolution["identity"]:
                            raise CollectionError("官网在采集过程中跳转到了其他产品地址，保留原报告，等待重新核对")
                        if any(origin["source_kind"] == "product_hunt" for origin in origins):
                            collection.warnings.append("产品官网已通过公开链接、名称、功能和回链自动核对，依据见官网匹配记录。" if resolution.get("status") == "confirmed" else "产品官网由用户补充，其与 Product Hunt 产品记录的关联仍需结合公开资料核对。")
                    collection.website_resolution = resolution
                    for origin in origins:
                        if origin["source_kind"] == "github":
                            continue
                        collection.sources.append(source("listing", origin["title"], origin["source_url"],
                            origin["title"] + "\n" + origin["description"], published_at=origin["published_at"],
                            metadata={"source_kind": origin["source_kind"], "discovered_at": origin["discovered_at"], **origin["metadata"]}))
                    self.database.progress(task_id, attempt, "整理事实、动作和来源", 83)
                    report = build_report(job["project"]["id"], collection)
                    self.database.progress(task_id, attempt, "生成结构化报告", 90)
                    report = polish_with_local_model(report)
                    self.database.progress(task_id, attempt, "准备中文展示", 95)
                    self.translator.populate([job["project"].get("description", ""), collection.description, *report_texts(report.model_dump())])
                    self.database.publish(task_id, attempt, collection, report)
                except Exception as error:
                    logger.exception("Research job failed: %s", task_id)
                    self.database.fail(task_id, attempt, friendly_error(error))
            except Exception:
                logger.exception("Worker could not claim a job")
                self.stopped.wait(timeout=3)
