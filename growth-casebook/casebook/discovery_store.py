import json
import uuid
from datetime import datetime, timedelta, timezone

from .db import utc_now
from .network import CollectionError

SOURCE_LABELS = {"product_hunt": "Product Hunt 公开订阅", "betalist": "BetaList 产品目录", "hacker_news": "Show HN 社区发布", "github": "GitHub 公开产品"}

CANDIDATE_SCHEMA = """CREATE TABLE IF NOT EXISTS discovery_candidates (
    candidate_key TEXT PRIMARY KEY, repository TEXT NOT NULL DEFAULT '', identity TEXT NOT NULL,
    name TEXT NOT NULL, website TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
    source_kind TEXT NOT NULL DEFAULT 'github', source_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'candidate', reason TEXT NOT NULL DEFAULT '',
    project_id TEXT REFERENCES projects(id), task_id TEXT REFERENCES tasks(id),
    first_seen TEXT NOT NULL, last_seen TEXT NOT NULL
)"""


class DiscoveryStore:
    def __init__(self, database):
        self.database = database
        with database.connect() as connection:
            connection.executescript("""
                CREATE TABLE IF NOT EXISTS discovery_settings (
                    id INTEGER PRIMARY KEY CHECK(id=1), enabled INTEGER NOT NULL DEFAULT 0,
                    batch_size INTEGER NOT NULL DEFAULT 5, interval_hours INTEGER NOT NULL DEFAULT 24,
                    next_run_at TEXT, cooldown_until TEXT
                );
                INSERT OR IGNORE INTO discovery_settings(id) VALUES(1);
                CREATE TABLE IF NOT EXISTS discovery_runs (
                    id TEXT PRIMARY KEY, trigger TEXT NOT NULL, status TEXT NOT NULL,
                    stage TEXT NOT NULL, batch_size INTEGER NOT NULL, scanned INTEGER NOT NULL DEFAULT 0,
                    accepted INTEGER NOT NULL DEFAULT 0, queued INTEGER NOT NULL DEFAULT 0,
                    duplicates INTEGER NOT NULL DEFAULT 0, warnings TEXT NOT NULL DEFAULT '[]',
                    attempts INTEGER NOT NULL DEFAULT 0, lease_until TEXT,
                    created_at TEXT NOT NULL, updated_at TEXT NOT NULL
                );
                CREATE UNIQUE INDEX IF NOT EXISTS one_discovery_run
                    ON discovery_runs((1)) WHERE status IN ('queued','running');
                CREATE TABLE IF NOT EXISTS discovery_candidates (
                    repository TEXT PRIMARY KEY, identity TEXT NOT NULL, name TEXT NOT NULL,
                    website TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
                    source_url TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'candidate', reason TEXT NOT NULL DEFAULT '',
                    project_id TEXT REFERENCES projects(id), task_id TEXT REFERENCES tasks(id),
                    first_seen TEXT NOT NULL, last_seen TEXT NOT NULL
                );
            """)
            connection.execute("BEGIN IMMEDIATE")
            columns = {row["name"] for row in connection.execute("PRAGMA table_info(discovery_candidates)")}
            if "candidate_key" not in columns:
                connection.execute("ALTER TABLE discovery_candidates RENAME TO discovery_candidates_v1")
                connection.execute(CANDIDATE_SCHEMA)
                connection.execute("""INSERT INTO discovery_candidates
                    SELECT 'github:' || repository, repository, identity, name, website, description, category,
                    'github', source_url, status, reason, project_id, task_id, first_seen, last_seen
                    FROM discovery_candidates_v1""")
            for table, column, definition in [
                ("discovery_settings", "enabled_sources", "TEXT NOT NULL DEFAULT '[\"github\"]'"),
                ("discovery_runs", "enabled_sources", "TEXT NOT NULL DEFAULT '[\"github\"]'"),
                ("discovery_runs", "source_stats", "TEXT NOT NULL DEFAULT '[]'"),
            ]:
                if column not in {row["name"] for row in connection.execute(f"PRAGMA table_info({table})")}:
                    connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
            connection.execute("""CREATE TABLE IF NOT EXISTS discovery_origins (
                candidate_key TEXT NOT NULL REFERENCES discovery_candidates(candidate_key),
                source_kind TEXT NOT NULL, source_url TEXT NOT NULL, title TEXT NOT NULL,
                description TEXT NOT NULL, published_at TEXT, metadata TEXT NOT NULL DEFAULT '{}',
                discovered_at TEXT NOT NULL, PRIMARY KEY(candidate_key,source_kind,source_url)
            )""")
            connection.execute("""INSERT OR IGNORE INTO discovery_origins
                SELECT candidate_key,source_kind,source_url,name,description,NULL,'{}',first_seen
                FROM discovery_candidates""")
            connection.execute("""CREATE TABLE IF NOT EXISTS discovery_source_state (
                source_kind TEXT PRIMARY KEY, status TEXT NOT NULL, error TEXT NOT NULL DEFAULT '',
                cooldown_until TEXT, checked_at TEXT NOT NULL
            )""")
            legacy_cooldown = connection.execute("SELECT cooldown_until FROM discovery_settings WHERE id=1").fetchone()[0]
            if legacy_cooldown:
                connection.execute("INSERT OR IGNORE INTO discovery_source_state VALUES('github','cooldown','',?,?)", (legacy_cooldown, utc_now()))

    def settings(self):
        with self.database.connect() as connection:
            result = dict(connection.execute("SELECT * FROM discovery_settings WHERE id=1").fetchone())
        result.pop("id")
        result["enabled"] = bool(result["enabled"])
        result["enabled_sources"] = json.loads(result["enabled_sources"])
        return result

    def search_page(self):
        with self.database.connect() as connection:
            count = connection.execute("SELECT count(*) FROM discovery_runs WHERE status='completed'").fetchone()[0]
        return 1 + (count // 4) % 3

    def configure(self, enabled, batch_size, interval_hours, enabled_sources=None):
        with self.database.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            previous = connection.execute("SELECT * FROM discovery_settings WHERE id=1").fetchone()
            next_run = previous["next_run_at"]
            if interval_hours != previous["interval_hours"]:
                latest = connection.execute("SELECT created_at FROM discovery_runs ORDER BY created_at DESC,rowid DESC LIMIT 1").fetchone()
                if latest:
                    next_run = (datetime.fromisoformat(latest["created_at"]) + timedelta(hours=interval_hours)).isoformat(timespec="seconds")
            if enabled and next_run is None:
                next_run = utc_now()
            sources = list(dict.fromkeys(enabled_sources)) if enabled_sources is not None else json.loads(previous["enabled_sources"])
            connection.execute(
                "UPDATE discovery_settings SET next_run_at=?,enabled=?,batch_size=?,interval_hours=?,enabled_sources=? WHERE id=1",
                (next_run, int(enabled), batch_size, interval_hours, json.dumps(sources)),
            )
        return self.settings()

    def enqueue(self, trigger="manual", due_only=False):
        now = utc_now()
        with self.database.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            settings = connection.execute("SELECT * FROM discovery_settings WHERE id=1").fetchone()
            if due_only and (not settings["enabled"] or (settings["next_run_at"] and datetime.fromisoformat(settings["next_run_at"]) > datetime.now(timezone.utc))):
                return None, False
            active = connection.execute("SELECT * FROM discovery_runs WHERE status IN ('queued','running')").fetchone()
            if active:
                return dict(active), False
            enabled_sources = json.loads(settings["enabled_sources"])
            blocked = {row["source_kind"] for row in connection.execute("SELECT source_kind FROM discovery_source_state WHERE cooldown_until>?", (now,))}
            if all(source in blocked for source in enabled_sources):
                if due_only:
                    return None, False
                raise CollectionError("免费来源正在限额冷却，请在页面显示的冷却时间后重试")
            run_id = uuid.uuid4().hex
            connection.execute(
                "INSERT INTO discovery_runs(id,trigger,status,stage,batch_size,created_at,updated_at,enabled_sources) "
                "VALUES(?,?,'queued','等待自动发现',?,?,?,?)", (run_id, trigger, settings["batch_size"], now, now, settings["enabled_sources"]),
            )
            next_run = (datetime.now(timezone.utc) + timedelta(hours=settings["interval_hours"])).isoformat(timespec="seconds")
            connection.execute("UPDATE discovery_settings SET next_run_at=? WHERE id=1", (next_run,))
            return dict(connection.execute("SELECT * FROM discovery_runs WHERE id=?", (run_id,)).fetchone()), True

    def claim(self):
        now = utc_now()
        with self.database.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            connection.execute(
                "UPDATE discovery_runs SET status='failed',stage='发现多次中断，请重新运行',updated_at=? "
                "WHERE status='running' AND lease_until<? AND attempts>=3", (now, now),
            )
            run = connection.execute(
                "SELECT * FROM discovery_runs WHERE status='queued' OR (status='running' AND lease_until<? AND attempts<3) "
                "ORDER BY created_at LIMIT 1", (now,),
            ).fetchone()
            if run is None:
                return None
            lease = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(timespec="seconds")
            connection.execute("UPDATE discovery_runs SET status='running',stage='检索公开产品',attempts=attempts+1,lease_until=?,updated_at=? WHERE id=?", (lease, now, run["id"]))
            return dict(connection.execute("SELECT * FROM discovery_runs WHERE id=?", (run["id"],)).fetchone())

    def progress(self, run, stage):
        lease = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(timespec="seconds")
        with self.database.connect() as connection:
            connection.execute("UPDATE discovery_runs SET stage=?,lease_until=?,updated_at=? WHERE id=? AND status='running' AND attempts=?", (stage, lease, utc_now(), run["id"], run["attempts"]))

    def remember(self, candidate):
        now = utc_now()
        with self.database.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            found = connection.execute("""SELECT candidate_key,repository FROM discovery_candidates
                WHERE (?<>'' AND repository=?) OR (identity=? AND (?='' OR repository=''))
                ORDER BY first_seen LIMIT 1""", (candidate["repository"], candidate["repository"], candidate["identity"], candidate["repository"])).fetchone()
            key = found["candidate_key"] if found else candidate["candidate_key"]
            connection.execute(
                "INSERT INTO discovery_candidates(candidate_key,repository,identity,name,website,description,category,source_kind,source_url,first_seen,last_seen) "
                "VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(candidate_key) DO UPDATE SET last_seen=excluded.last_seen",
                (key, *[candidate[field] for field in ("repository", "identity", "name", "website", "description", "category", "source_kind", "source_url")], now, now),
            )
            connection.execute("""INSERT INTO discovery_origins VALUES(?,?,?,?,?,?,?,?)
                ON CONFLICT(candidate_key,source_kind,source_url) DO NOTHING""",
                (key, candidate["source_kind"], candidate["source_url"], candidate.get("listing_title", candidate["name"]),
                 candidate["description"], candidate.get("published_at"), json.dumps(candidate.get("metadata", {}), ensure_ascii=False), now))
            if found and not found["repository"] and candidate["repository"]:
                connection.execute("UPDATE discovery_candidates SET repository=? WHERE candidate_key=?", (candidate["repository"], key))
        return key

    def pending(self, enabled_sources=None):
        with self.database.connect() as connection:
            sources = enabled_sources or list(SOURCE_LABELS)
            placeholders = ",".join("?" for _ in sources)
            rows = [dict(row) for row in connection.execute(f"""SELECT d.* FROM discovery_candidates d WHERE status='candidate'
                AND EXISTS(SELECT 1 FROM discovery_origins o WHERE o.candidate_key=d.candidate_key AND o.source_kind IN ({placeholders}))
                ORDER BY first_seen,d.rowid LIMIT 150""", sources)]
            origins = [dict(row) for row in connection.execute("SELECT candidate_key,source_kind FROM discovery_origins")]
        by_source = {source: [] for source in sources}
        for row in rows:
            matching = {origin["source_kind"] for origin in origins if origin["candidate_key"] == row["candidate_key"]}
            first = next(source for source in sources if source in matching)
            by_source[first].append(row)
        # Give selected sources turns so an old GitHub backlog cannot starve new directories.
        result = []
        while any(by_source.values()):
            for source in sources:
                if by_source[source]:
                    result.append(by_source[source].pop(0))
        return result

    def reject(self, candidate_key, reason):
        with self.database.connect() as connection:
            connection.execute("UPDATE discovery_candidates SET status='rejected',reason=? WHERE candidate_key=? AND status='candidate'", (reason, candidate_key))

    def queue_candidate(self, candidate, identity, website, run):
        """Deduplicate and create the project/task together, including across reclaimed runs."""
        now = utc_now()
        with self.database.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            active = connection.execute("SELECT status,attempts,queued,batch_size FROM discovery_runs WHERE id=?", (run["id"],)).fetchone()
            if not active or active["status"] != "running" or active["attempts"] != run["attempts"]:
                return "stale"
            if active["queued"] >= active["batch_size"]:
                return "limit"
            row = connection.execute("SELECT status FROM discovery_candidates WHERE candidate_key=?", (candidate["candidate_key"],)).fetchone()
            if not row or row["status"] != "candidate":
                return "seen"
            existing = connection.execute(
                "SELECT id FROM projects WHERE identity=? OR (?<>'' AND lower(replace(github,'https://github.com/',''))=?) LIMIT 1",
                (identity, candidate["repository"], candidate["repository"].casefold()),
            ).fetchone()
            if existing:
                connection.execute("UPDATE discovery_candidates SET status='duplicate',reason='官网或仓库已在研究空间中',project_id=? WHERE candidate_key=?", (existing["id"], candidate["candidate_key"]))
                return "duplicate"
            project_id, task_id = uuid.uuid4().hex, uuid.uuid4().hex
            connection.execute("INSERT INTO projects(id,identity,website,name,category,github,description,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)", (project_id, identity, website, candidate["name"], candidate["category"], candidate["repository"], candidate["description"], now, now))
            connection.execute("INSERT INTO tasks(id,project_id,status,stage,created_at,updated_at) VALUES(?,?,'queued','自动发现：等待采集',?,?)", (task_id, project_id, now, now))
            connection.execute("UPDATE discovery_candidates SET status='queued',reason='通过公开产品筛选，已交给采集流水线',project_id=?,task_id=? WHERE candidate_key=?", (project_id, task_id, candidate["candidate_key"]))
            connection.execute("UPDATE discovery_runs SET queued=queued+1 WHERE id=?", (run["id"],))
            return "queued"

    def source_state(self, source_kind):
        with self.database.connect() as connection:
            row = connection.execute("SELECT * FROM discovery_source_state WHERE source_kind=?", (source_kind,)).fetchone()
        return dict(row) if row else {}

    def record_source(self, run, source_kind, status, error="", cooldown_until=None):
        with self.database.connect() as connection:
            current = connection.execute("SELECT status,attempts FROM discovery_runs WHERE id=?", (run["id"],)).fetchone()
            if not current or current["status"] != "running" or current["attempts"] != run["attempts"]:
                return
            connection.execute("""INSERT INTO discovery_source_state VALUES(?,?,?,?,?)
                ON CONFLICT(source_kind) DO UPDATE SET status=excluded.status,error=excluded.error,
                cooldown_until=excluded.cooldown_until,checked_at=excluded.checked_at""",
                (source_kind, status, error, cooldown_until, utc_now()))

    def origins_for_project(self, project_id):
        with self.database.connect() as connection:
            rows = [dict(row) for row in connection.execute("""SELECT o.* FROM discovery_origins o
                JOIN discovery_candidates d ON d.candidate_key=o.candidate_key
                WHERE d.project_id=? ORDER BY o.discovered_at,o.source_url""", (project_id,))]
        for row in rows:
            row["metadata"] = json.loads(row["metadata"])
        return rows

    def enqueue_website_backfill(self):
        """Enrich existing PH briefs automatically, with one persistent daily retry."""
        settings = self.settings()
        if not settings["enabled"] or "product_hunt" not in settings["enabled_sources"]:
            return 0
        now = utc_now()
        retry = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat(timespec="seconds")
        with self.database.connect() as connection:
            connection.execute("BEGIN IMMEDIATE")
            rows = connection.execute("""SELECT p.id FROM projects p
                LEFT JOIN website_resolutions w ON w.project_id=p.id
                WHERE p.hidden_reason='' AND (p.identity LIKE 'producthunt:%')
                AND EXISTS(SELECT 1 FROM discovery_candidates d JOIN discovery_origins o ON o.candidate_key=d.candidate_key WHERE d.project_id=p.id AND o.source_kind='product_hunt')
                AND NOT EXISTS(SELECT 1 FROM tasks t WHERE t.project_id=p.id AND t.status IN ('queued','running'))
                AND (w.project_id IS NULL OR (w.next_retry_at IS NOT NULL AND w.next_retry_at<=?))
                ORDER BY p.created_at LIMIT ?""", (now, settings["batch_size"])).fetchall()
            for row in rows:
                task_id = uuid.uuid4().hex
                connection.execute("INSERT INTO tasks(id,project_id,status,stage,created_at,updated_at) VALUES(?,?,'queued','自动查找 Product Hunt 官网',?,?)", (task_id, row["id"], now, now))
                connection.execute("UPDATE discovery_candidates SET task_id=? WHERE project_id=?", (task_id, row["id"]))
                # Reserve the retry even if collection fails or the app restarts.
                connection.execute("INSERT INTO website_resolutions VALUES(?,?,?) ON CONFLICT(project_id) DO UPDATE SET next_retry_at=excluded.next_retry_at",
                    (row["id"], json.dumps({"status": "pending", "message": "等待自动查找官网"}, ensure_ascii=False), retry))
        return len(rows)

    def finish(self, run, counts, warnings, failed=False, cooldown_until=None, source_stats=None):
        with self.database.connect() as connection:
            cursor = connection.execute(
                "UPDATE discovery_runs SET status=?,stage=?,scanned=?,accepted=?,queued=MAX(queued,?),duplicates=?,warnings=?,lease_until=NULL,updated_at=? "
                "WHERE id=? AND status='running' AND attempts=?",
                ("failed" if failed else "completed", "发现失败，请查看提示" if failed else "发现完成，报告按队列生成",
                 counts["scanned"], counts["accepted"], counts["queued"], counts["duplicates"], json.dumps(warnings, ensure_ascii=False), utc_now(), run["id"], run["attempts"]),
            )
            if cursor.rowcount and cooldown_until:
                connection.execute("UPDATE discovery_settings SET cooldown_until=? WHERE id=1", (cooldown_until,))
                connection.execute("INSERT OR REPLACE INTO discovery_source_state VALUES('github','cooldown','',?,?)", (cooldown_until, utc_now()))
            if cursor.rowcount and source_stats is not None:
                connection.execute("UPDATE discovery_runs SET source_stats=? WHERE id=?", (json.dumps(source_stats, ensure_ascii=False), run["id"]))

    def snapshot(self):
        with self.database.connect() as connection:
            runs = [dict(row) for row in connection.execute("SELECT * FROM discovery_runs ORDER BY created_at DESC,rowid DESC LIMIT 10")]
            for run in runs:
                run["warnings"] = json.loads(run["warnings"])
                run["enabled_sources"] = json.loads(run["enabled_sources"])
                run["source_stats"] = json.loads(run["source_stats"])
            candidates = [dict(row) for row in connection.execute(
                "SELECT d.*,t.status AS task_status,t.stage AS task_stage,t.error AS task_error,p.hidden_reason,p.description AS project_description,"
                "EXISTS(SELECT 1 FROM reports r WHERE r.project_id=d.project_id) AS has_report,w.payload AS website_resolution "
                "FROM discovery_candidates d LEFT JOIN tasks t ON t.id=d.task_id LEFT JOIN projects p ON p.id=d.project_id LEFT JOIN website_resolutions w ON w.project_id=p.id "
                "ORDER BY CASE WHEN d.status='queued' THEN 0 ELSE 1 END,d.last_seen DESC,d.rowid LIMIT 60"
            )]
            counts = dict(connection.execute("SELECT status,count(*) FROM discovery_candidates GROUP BY status").fetchall())
            counts["published"] = connection.execute("SELECT count(*) FROM discovery_candidates d JOIN projects p ON p.id=d.project_id WHERE EXISTS(SELECT 1 FROM reports r WHERE r.project_id=d.project_id) AND d.status='queued' AND p.hidden_reason=''").fetchone()[0]
            origins = [dict(row) for row in connection.execute("SELECT candidate_key,source_kind,source_url FROM discovery_origins")]
        translations = self.database.translations_for([text for item in candidates for text in (item["description"], item["project_description"] or "")])
        for item in candidates:
            item["website_resolution"] = json.loads(item["website_resolution"] or "{}")
            item["description_zh"] = translations.get(item["project_description"], "") or translations.get(item["description"], "")
            item["origins"] = [origin for origin in origins if origin["candidate_key"] == item["candidate_key"]]
        settings = self.settings()
        source_states = []
        for source_kind, label in SOURCE_LABELS.items():
            state = self.source_state(source_kind)
            source_states.append({"id": source_kind, "label": label, "enabled": source_kind in settings["enabled_sources"], **state})
        return {"settings": settings, "runs": runs, "candidates": candidates, "counts": counts, "sources": source_states}
