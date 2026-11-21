import json
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .localize import needs_translation, report_texts, valid_translation


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def report_coverage(report):
    kinds = {source["kind"] for source in report["sources"]}
    return report.get("coverage") or ("website" if "website" in kinds else "repository" if "repository" in kinds else "listing_only")


class Database:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as connection:
            connection.executescript("""
                PRAGMA journal_mode=WAL;
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    identity TEXT NOT NULL UNIQUE,
                    website TEXT NOT NULL,
                    name TEXT NOT NULL,
                    category TEXT NOT NULL,
                    github TEXT NOT NULL DEFAULT '',
                    description TEXT NOT NULL DEFAULT '',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL REFERENCES projects(id),
                    status TEXT NOT NULL,
                    stage TEXT NOT NULL,
                    progress INTEGER NOT NULL DEFAULT 0,
                    error TEXT,
                    warnings TEXT NOT NULL DEFAULT '[]',
                    attempts INTEGER NOT NULL DEFAULT 0,
                    lease_until TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE UNIQUE INDEX IF NOT EXISTS one_active_task
                    ON tasks(project_id) WHERE status IN ('queued', 'running');
                CREATE TABLE IF NOT EXISTS reports (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id TEXT NOT NULL REFERENCES projects(id),
                    version INTEGER NOT NULL,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    UNIQUE(project_id, version)
                );
                CREATE TABLE IF NOT EXISTS documents (
                    report_id INTEGER NOT NULL REFERENCES reports(id),
                    source_id TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    PRIMARY KEY(report_id, source_id)
                );
                CREATE TABLE IF NOT EXISTS translations (
                    source_text TEXT PRIMARY KEY,
                    target_text TEXT NOT NULL,
                    engine TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS website_resolutions (
                    project_id TEXT PRIMARY KEY REFERENCES projects(id),
                    payload TEXT NOT NULL, next_retry_at TEXT
                );
            """)
            if "hidden_reason" not in {row["name"] for row in connection.execute("PRAGMA table_info(projects)")}:
                connection.execute("ALTER TABLE projects ADD COLUMN hidden_reason TEXT NOT NULL DEFAULT ''")

    @contextmanager
    def connect(self):
        connection = sqlite3.connect(self.path, timeout=15)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys=ON")
        try:
            with connection:
                yield connection
        finally:
            connection.close()

    def enqueue(self, identity, website, name, category, github):
        now = utc_now()
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            project = connection.execute("SELECT * FROM projects WHERE identity=?", (identity,)).fetchone()
            if project is None:
                project_id = uuid.uuid4().hex
                connection.execute(
                    "INSERT INTO projects(id,identity,website,name,category,github,description,created_at,updated_at) VALUES (?, ?, ?, ?, ?, ?, '', ?, ?)",
                    (project_id, identity, website, name, category, github, now, now),
                )
            else:
                project_id = project["id"]
            active = connection.execute(
                "SELECT id FROM tasks WHERE project_id=? AND status IN ('queued', 'running')",
                (project_id,),
            ).fetchone()
            if active:
                return self.get_task(active["id"], connection), False
            if project is not None:
                connection.execute(
                    "UPDATE projects SET github=?, category=?, updated_at=? WHERE id=?",
                    (github or project["github"], category, now, project_id),
                )
            task_id = uuid.uuid4().hex
            connection.execute(
                "INSERT INTO tasks(id,project_id,status,stage,created_at,updated_at) VALUES(?,?,'queued','等待采集',?,?)",
                (task_id, project_id, now, now),
            )
            return self.get_task(task_id, connection), True

    def get_task(self, task_id, connection=None):
        if connection is None:
            with self.connect() as opened:
                return self.get_task(task_id, opened)
        row = connection.execute(
            "SELECT tasks.*, projects.name AS project_name FROM tasks JOIN projects ON projects.id=tasks.project_id WHERE tasks.id=?",
            (task_id,),
        ).fetchone()
        if row is None:
            return None
        result = dict(row)
        result["warnings"] = json.loads(result["warnings"])
        return result

    def list_tasks(self):
        with self.connect() as connection:
            rows = connection.execute("SELECT id FROM tasks ORDER BY created_at DESC, rowid DESC LIMIT 30").fetchall()
            return [self.get_task(row["id"], connection) for row in rows]

    def claim(self):
        now = utc_now()
        lease = (datetime.now(timezone.utc) + timedelta(minutes=3)).isoformat(timespec="seconds")
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute(
                "UPDATE tasks SET status='failed',error='多次中断，请重新采集',stage='采集中断',updated_at=? "
                "WHERE status='running' AND lease_until<? AND attempts>=3", (now, now),
            )
            task = connection.execute(
                "SELECT * FROM tasks WHERE status='queued' OR (status='running' AND lease_until<? AND attempts<3) "
                "ORDER BY created_at, rowid LIMIT 1", (now,),
            ).fetchone()
            if task is None:
                return None
            connection.execute(
                "UPDATE tasks SET status='running',stage='开始采集',attempts=attempts+1,lease_until=?,updated_at=? WHERE id=?",
                (lease, now, task["id"]),
            )
            project = connection.execute("SELECT * FROM projects WHERE id=?", (task["project_id"],)).fetchone()
            return {"task_id": task["id"], "attempt": task["attempts"] + 1, "project": dict(project)}

    def progress(self, task_id, attempt, stage, progress):
        lease = (datetime.now(timezone.utc) + timedelta(minutes=3)).isoformat(timespec="seconds")
        with self.connect() as connection:
            connection.execute(
                "UPDATE tasks SET stage=?,progress=?,lease_until=?,updated_at=? WHERE id=? AND status='running' AND attempts=?",
                (stage, progress, lease, utc_now(), task_id, attempt),
            )

    def fail(self, task_id, attempt, error):
        with self.connect() as connection:
            connection.execute(
                "UPDATE tasks SET status='failed',stage='采集失败',error=?,lease_until=NULL,updated_at=? WHERE id=? AND status='running' AND attempts=?",
                (error, utc_now(), task_id, attempt),
            )

    def publish(self, task_id, attempt, collection, report):
        now = utc_now()
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            task = connection.execute("SELECT status,attempts FROM tasks WHERE id=?", (task_id,)).fetchone()
            if task is None or task["status"] != "running" or task["attempts"] != attempt:
                return False
            resolution = collection.website_resolution
            if resolution.get("status") == "confirmed":
                identity = resolution["identity"]
                duplicate = connection.execute("SELECT name FROM projects WHERE identity=? AND id<>?", (identity, report.project_id)).fetchone()
                if duplicate:
                    raise ValueError("自动找到的官网已关联产品“" + duplicate["name"] + "”，保留原报告，未合并产品")
                connection.execute("UPDATE projects SET identity=? WHERE id=?", (identity, report.project_id))
                connection.execute("UPDATE discovery_candidates SET identity=?,website=? WHERE project_id=?", (identity, collection.website, report.project_id))
            if resolution:
                next_retry = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(timespec="seconds") if resolution.get("status") == "unresolved" else None
                connection.execute("INSERT INTO website_resolutions VALUES(?,?,?) ON CONFLICT(project_id) DO UPDATE SET payload=excluded.payload,next_retry_at=excluded.next_retry_at",
                    (report.project_id, json.dumps(resolution, ensure_ascii=False), next_retry))
            version = connection.execute(
                "SELECT COALESCE(MAX(version),0)+1 FROM reports WHERE project_id=?", (report.project_id,),
            ).fetchone()[0]
            report.version = version
            cursor = connection.execute(
                "INSERT INTO reports(project_id,version,payload,created_at) VALUES (?,?,?,?)",
                (report.project_id, version, report.model_dump_json(), now),
            )
            connection.executemany(
                "INSERT INTO documents VALUES (?,?,?)",
                [(cursor.lastrowid, source.id, source.model_dump_json()) for source in report.sources],
            )
            connection.execute(
                "UPDATE projects SET name=?,description=?,website=?,github=?,updated_at=? WHERE id=?",
                (collection.name, collection.description, collection.website, collection.github or "", now, report.project_id),
            )
            connection.execute(
                "UPDATE tasks SET status='completed',stage='报告已发布',progress=100,warnings=?,lease_until=NULL,updated_at=? WHERE id=?",
                (json.dumps(report.warnings, ensure_ascii=False), now, task_id),
            )
            return True

    def project(self, project_id):
        with self.connect() as connection:
            row = connection.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
            if row is None:
                return None
            result = dict(row)
        result["description_zh"] = self.translations_for([result["description"]]).get(result["description"], "")
        return result

    def report(self, project_id, version=None):
        with self.connect() as connection:
            query = "SELECT payload FROM reports WHERE project_id=?"
            parameters = [project_id]
            if version is not None:
                query += " AND version=?"
                parameters.append(version)
            row = connection.execute(query + " ORDER BY version DESC LIMIT 1", parameters).fetchone()
            if row is None:
                return None
            result = json.loads(row["payload"])
        result["translations"] = self.translations_for(report_texts(result))
        result["coverage"] = report_coverage(result)
        return result

    def translations_for(self, texts):
        texts = list(dict.fromkeys(texts))
        if not texts:
            return {}
        placeholders = ",".join("?" for _ in texts)
        with self.connect() as connection:
            rows = connection.execute(
                f"SELECT source_text,target_text,engine FROM translations WHERE source_text IN ({placeholders})", texts,
            ).fetchall()
        return {row["source_text"]: row["target_text"] for row in rows
                if row["engine"] == "reviewed" or (needs_translation(row["source_text"]) and valid_translation(row["source_text"], row["target_text"]))}

    def save_translation(self, original, translated, engine="argos-en-zh-1.9"):
        with self.connect() as connection:
            connection.execute(
                "INSERT INTO translations VALUES(?,?,?,?) ON CONFLICT(source_text) DO UPDATE SET target_text=excluded.target_text,engine=excluded.engine",
                (original, translated, engine, utc_now()),
            )

    def versions(self, project_id):
        with self.connect() as connection:
            return [dict(row) for row in connection.execute(
                "SELECT version,created_at FROM reports WHERE project_id=? ORDER BY version DESC", (project_id,),
            )]

    def set_project_hidden(self, project_id, reason):
        """Reversibly exclude a misclassified discovery while preserving all evidence."""
        with self.connect() as connection:
            connection.execute("UPDATE projects SET hidden_reason=? WHERE id=?", (reason, project_id))

    def attach_website(self, project_id, identity, website):
        with self.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            duplicate = connection.execute("SELECT name FROM projects WHERE identity=? AND id<>?", (identity, project_id)).fetchone()
            if duplicate:
                raise ValueError("这个官网已关联到产品“" + duplicate["name"] + "”，请先查看已有报告")
            if connection.execute("SELECT 1 FROM tasks WHERE project_id=? AND status IN ('queued','running')", (project_id,)).fetchone():
                raise ValueError("该产品还有正在处理的任务，请完成后再补充官网")
            connection.execute("UPDATE projects SET identity=?,website=?,updated_at=? WHERE id=?", (identity, website, utc_now(), project_id))
            connection.execute("UPDATE discovery_candidates SET identity=?,website=? WHERE project_id=?", (identity, website, project_id))
            connection.execute("INSERT INTO website_resolutions VALUES(?,?,NULL) ON CONFLICT(project_id) DO UPDATE SET payload=excluded.payload,next_retry_at=NULL",
                (project_id, json.dumps({"status": "manual", "website": website, "checked_at": utc_now(), "message": "官网由用户补充，产品关联仍需核对。"}, ensure_ascii=False)))

    def website_resolution(self, project_id):
        with self.connect() as connection:
            row = connection.execute("SELECT payload FROM website_resolutions WHERE project_id=?", (project_id,)).fetchone()
        return json.loads(row[0]) if row else {}

    def projects(self, query="", channel=""):
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT p.*, r.payload FROM projects p JOIN reports r ON r.project_id=p.id "
                "WHERE p.hidden_reason='' AND r.version=(SELECT MAX(version) FROM reports WHERE project_id=p.id) ORDER BY p.updated_at DESC,p.id",
            ).fetchall()
        items = []
        translations = self.translations_for([row["description"] for row in rows])
        needle = query.casefold().strip()
        for row in rows:
            item = dict(row)
            report = json.loads(item.pop("payload"))
            item["description_zh"] = translations.get(item["description"], "")
            channels = sorted({action["channel"] for action in report["actions"]})
            search_text = json.dumps([item["name"], item["website"], item["description"], item["description_zh"], item["category"], channels], ensure_ascii=False)
            if needle and needle not in search_text.casefold():
                continue
            if channel and channel not in channels:
                continue
            item.update(
                source_count=len(report["sources"]), action_count=len(report["actions"]), channels=channels,
                coverage=report_coverage(report),
                listing_count=sum(source["kind"] == "listing" for source in report["sources"]),
                version=report["version"], generated_at=report["generated_at"], mode=report["mode"],
                metrics=report["metrics"], gap_count=len(report["gaps"]), summary=report["summary"],
                website_resolution=report.get("website_resolution", {}),
            )
            items.append(item)
        return items
