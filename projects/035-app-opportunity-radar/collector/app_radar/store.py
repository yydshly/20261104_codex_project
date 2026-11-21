"""SQLite daily snapshots. Storefront counts stay separate."""

import json
import sqlite3
from datetime import date, timedelta
from pathlib import Path
from uuid import uuid4


SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY, date TEXT NOT NULL, started_at TEXT NOT NULL,
    finished_at TEXT, status TEXT NOT NULL, errors TEXT NOT NULL DEFAULT '[]',
    stats TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS chart_status (
    date TEXT NOT NULL, country TEXT NOT NULL, chart TEXT NOT NULL,
    status TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0,
    observed_at TEXT, source_updated_at TEXT, source_url TEXT,
    raw_path TEXT, run_id TEXT, last_error TEXT,
    PRIMARY KEY (date, country, chart)
);
CREATE TABLE IF NOT EXISTS charts (
    date TEXT NOT NULL, country TEXT NOT NULL, chart TEXT NOT NULL,
    app_id TEXT NOT NULL, rank INTEGER NOT NULL,
    PRIMARY KEY (date, country, chart, app_id)
);
CREATE INDEX IF NOT EXISTS charts_day ON charts(date, country, chart);
CREATE TABLE IF NOT EXISTS tracked (
    country TEXT NOT NULL, app_id TEXT NOT NULL, last_charted TEXT NOT NULL,
    metadata TEXT NOT NULL, PRIMARY KEY(country, app_id)
);
CREATE TABLE IF NOT EXISTS snapshots (
    date TEXT NOT NULL, country TEXT NOT NULL, app_id TEXT NOT NULL,
    observed_at TEXT NOT NULL, detail_status TEXT NOT NULL,
    name TEXT NOT NULL, developer TEXT, store_url TEXT,
    genres TEXT NOT NULL, genre_ids TEXT NOT NULL, release_date TEXT,
    rating_count INTEGER, rating REAL, price REAL, currency TEXT,
    bundle_id TEXT, direction TEXT NOT NULL, direction_basis TEXT NOT NULL,
    source_url TEXT, raw_path TEXT,
    PRIMARY KEY(date, country, app_id)
);
CREATE INDEX IF NOT EXISTS snapshots_day ON snapshots(date, country);
CREATE TABLE IF NOT EXISTS detail_batches (
    id TEXT PRIMARY KEY, run_id TEXT NOT NULL, country TEXT NOT NULL,
    requested INTEGER NOT NULL, received INTEGER NOT NULL,
    status TEXT NOT NULL, source_url TEXT, raw_path TEXT, error TEXT
);
PRAGMA user_version = 1;
"""


def connect(path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    version = conn.execute("PRAGMA user_version").fetchone()[0]
    if version > 1:
        conn.close()
        raise RuntimeError("数据库版本高于当前程序，请使用匹配的新版程序")
    conn.executescript(SCHEMA)
    return conn


def start_run(conn, day, timestamp):
    run_id = uuid4().hex
    with conn:
        conn.execute("INSERT INTO runs(id,date,started_at,status) VALUES(?,?,?,?)",
                     (run_id, day, timestamp, "running"))
    return run_id


def finish_run(conn, run_id, timestamp, status, errors, stats):
    with conn:
        conn.execute("UPDATE runs SET finished_at=?, status=?, errors=?, stats=? WHERE id=?",
                     (timestamp, status, json.dumps(errors, ensure_ascii=False),
                      json.dumps(stats, ensure_ascii=False), run_id))


def save_chart(conn, *, day, country, chart, payload, observed_at, raw_path, run_id):
    apps = payload["apps"]
    with conn:
        conn.execute("DELETE FROM charts WHERE date=? AND country=? AND chart=?",
                     (day, country, chart))
        conn.executemany("INSERT INTO charts VALUES(?,?,?,?,?)",
                         [(day, country, chart, app["app_id"], app["rank"]) for app in apps])
        conn.execute("""INSERT INTO chart_status
          (date,country,chart,status,count,observed_at,source_updated_at,source_url,raw_path,run_id)
          VALUES(?,?,?,'ok',?,?,?,?,?,?)
          ON CONFLICT(date,country,chart) DO UPDATE SET
          status='ok',count=excluded.count,observed_at=excluded.observed_at,
          source_updated_at=excluded.source_updated_at,source_url=excluded.source_url,
          raw_path=excluded.raw_path,run_id=excluded.run_id,last_error=NULL""",
                     (day, country, chart, len(apps), observed_at,
                      payload.get("source_updated_at"), payload["source_url"], str(raw_path), run_id))
        for app in apps:
            conn.execute("""INSERT INTO tracked VALUES(?,?,?,?)
              ON CONFLICT(country,app_id) DO UPDATE SET
              last_charted=excluded.last_charted,metadata=excluded.metadata""",
                         (country, app["app_id"], day, json.dumps(app, ensure_ascii=False)))


def chart_error(conn, *, day, country, chart, error, run_id):
    with conn:
        # A later failed retry must not erase a successful observation from this day.
        conn.execute("""INSERT INTO chart_status(date,country,chart,status,count,run_id,last_error)
          VALUES(?,?,?,'error',0,?,?) ON CONFLICT(date,country,chart) DO UPDATE SET
          last_error=excluded.last_error""", (day, country, chart, run_id, str(error)))


def save_snapshot(conn, *, day, country, app, observed_at, detail_status,
                  classifier, source_url, raw_path):
    direction, basis = classifier.classify(app)
    values = (day, country, app["app_id"], observed_at, detail_status,
              app.get("name") or app["app_id"], app.get("developer"), app.get("store_url"),
              json.dumps(app.get("genres", []), ensure_ascii=False),
              json.dumps(app.get("genre_ids", [])), app.get("release_date"),
              app.get("rating_count"), app.get("rating"), app.get("price"), app.get("currency"),
              app.get("bundle_id"), direction, basis, source_url, str(raw_path))
    # A chart-only observation on a same-day rerun cannot overwrite known ratings.
    conn.execute("""INSERT INTO snapshots VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(date,country,app_id) DO UPDATE SET
      observed_at=excluded.observed_at,detail_status=excluded.detail_status,
      name=excluded.name,developer=excluded.developer,store_url=excluded.store_url,
      genres=excluded.genres,genre_ids=excluded.genre_ids,release_date=excluded.release_date,
      rating_count=excluded.rating_count,rating=excluded.rating,price=excluded.price,
      currency=excluded.currency,bundle_id=excluded.bundle_id,
      direction=excluded.direction,direction_basis=excluded.direction_basis,
      source_url=excluded.source_url,raw_path=excluded.raw_path
      WHERE (excluded.detail_status='ok' AND
             (excluded.rating_count IS NOT NULL OR snapshots.rating_count IS NULL))
         OR snapshots.detail_status!='ok'""", values)


def tracked_apps(conn, country, day, off_chart_days, maximum, platform=None):
    earliest = (date.fromisoformat(day) - timedelta(days=off_chart_days)).isoformat()
    rows = conn.execute("""SELECT app_id,metadata,last_charted FROM tracked
       WHERE country=? AND last_charted>=? ORDER BY last_charted DESC,app_id""",
                        (country, earliest)).fetchall()
    current = [row for row in rows if row["last_charted"] == day]
    if platform:
        rows = [row for row in rows if row['app_id'].startswith('play:') == (platform == 'android')]
        current = [row for row in rows if row['last_charted'] == day]
    others = [row for row in rows if row["last_charted"] != day]
    selected = current + others[:max(0, maximum - len(current))]
    return [json.loads(row["metadata"]) for row in selected], max(0, len(rows) - len(selected))


def save_batch(conn, *, run_id, country, requested, received, status,
               source_url=None, raw_path=None, error=None):
    with conn:
        conn.execute("INSERT INTO detail_batches VALUES(?,?,?,?,?,?,?,?,?)",
                     (uuid4().hex, run_id, country, requested, received, status,
                      source_url, str(raw_path) if raw_path else None, error))


def load_analysis_data(conn, day, config, classifier):
    earliest = (date.fromisoformat(day) - timedelta(days=35)).isoformat()
    snapshots = []
    countries = set(config["countries"])
    enabled_charts = set(config["charts"])
    android = config.get('google_play', {})
    android_countries = set(android.get('countries', [])) if android.get('enabled') else set()
    countries |= android_countries
    if android_countries:
        enabled_charts |= {'android-'+chart for chart in config['charts']}
    for row in conn.execute("SELECT * FROM snapshots WHERE date BETWEEN ? AND ?",
                            (earliest, day)):
        app = dict(row)
        if app["country"] not in countries:
            continue
        if app['app_id'].startswith('play:') and app['country'] not in android_countries:
            continue
        app["genres"] = json.loads(app["genres"])
        app["genre_ids"] = json.loads(app["genre_ids"])
        # Reapply editable rules consistently across the comparison window.
        app["direction"], app["direction_basis"] = classifier.classify(app)
        app.update(classifier.tags(app))
        snapshots.append(app)
    charts = [dict(row) for row in conn.execute(
        "SELECT * FROM charts WHERE date BETWEEN ? AND ?", (earliest, day))
        if row["country"] in countries and row["chart"] in enabled_charts]
    chart_status = [dict(row) for row in conn.execute(
        "SELECT * FROM chart_status WHERE date BETWEEN ? AND ?", (earliest, day))
        if row["country"] in countries and row["chart"] in enabled_charts]
    runs = []
    for row in conn.execute("SELECT * FROM runs WHERE date BETWEEN ? AND ? ORDER BY started_at,rowid",
                            (earliest, day)):
        item = dict(row)
        item["errors"] = json.loads(item["errors"])
        item["stats"] = json.loads(item["stats"])
        runs.append(item)
    return {"as_of": day, "timezone": "Asia/Shanghai", "chart_limit": config["chart_limit"],
            "snapshots": snapshots, "charts": charts, "chart_status": chart_status, "runs": runs,
            "taxonomy_version": classifier.taxonomy_version}
