"""Collect public chart snapshots and generate a local Chinese report."""

import argparse
import hashlib
import json
import os
import sqlite3
import sys
import time
from contextlib import contextmanager
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from uuid import uuid4

from . import store
from .classify import Classifier

ROOT = Path(__file__).resolve().parent.parent
CST = timezone(timedelta(hours=8), name="Asia/Shanghai")


def now():
    return datetime.now(timezone.utc)


def timestamp():
    return now().isoformat(timespec="seconds")


def load_config(filename):
    config_path = Path(filename).resolve()
    config = json.loads(config_path.read_text(encoding="utf-8-sig"))
    countries = config["countries"]
    if not countries or len(set(countries)) != len(countries) or any(
            not isinstance(c, str) or len(c) != 2 or not c.isalpha() or c != c.lower()
            for c in countries):
        raise ValueError("countries 必须是互不重复的两位小写地区代码")
    charts = config["charts"]
    android = config.get('google_play', {})
    if android.get('enabled') and (not android.get('countries') or set(android['countries']) - {'us','jp','gb'}):
        raise ValueError('Google Play 首版支持 us、jp、gb')
    reviews = config.get('reviews', {})
    if reviews.get('enabled'):
        for key, default, lower, upper in (('max_per_platform',6,1,12),('reviews_per_app',100,50,200),('lookback_days',90,1,365)):
            value=reviews.get(key,default)
            if isinstance(value,bool) or not isinstance(value,int) or not lower<=value<=upper:
                raise ValueError(f'reviews.{key} must be between {lower} and {upper}')
        if reviews.get('reviews_per_app',100)%50:
            raise ValueError('reviews_per_app must be a multiple of 50')
    if not charts or len(set(charts)) != len(charts) or set(charts) - {"top-free", "top-paid"}:
        raise ValueError("charts 只支持互不重复的 top-free、top-paid")
    for name, lo, hi in (("chart_limit", 1, 100), ("lookup_batch_size", 1, 100),
                         ("track_off_chart_days", 1, 365),
                         ("max_tracked_per_country", 200, 10000)):
        value = config[name]
        if isinstance(value, bool) or not isinstance(value, int) or not lo <= value <= hi:
            raise ValueError(f"{name} 必须在 {lo} 至 {hi} 之间")
    interval = config["request_interval_seconds"]
    if isinstance(interval, bool) or not isinstance(interval, (int, float)) or interval < 3.1:
        raise ValueError("request_interval_seconds 至少 3.1 秒，以控制请求频率")
    for key in ("database", "raw_directory", "reports_directory", "directions_file"):
        config[key] = (config_path.parent / config[key]).resolve()
    rules = json.loads(config["directions_file"].read_text(encoding="utf-8-sig"))
    return config, Classifier(rules)


@contextmanager
def collection_lock(path):
    """An OS lock releases on exit/crash; no stale-lock deletion required."""
    path.parent.mkdir(parents=True, exist_ok=True)
    handle = path.open("a+b")
    if handle.seek(0, os.SEEK_END) == 0:
        handle.write(b"0")
        handle.flush()
    handle.seek(0)
    locked = False
    try:
        if os.name == "nt":
            import msvcrt
            try:
                msvcrt.locking(handle.fileno(), msvcrt.LK_NBLCK, 1)
            except OSError as exc:
                raise RuntimeError("已有采集任务运行，请等待它完成") from exc
        else:
            import fcntl
            try:
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError as exc:
                raise RuntimeError("已有采集任务运行，请等待它完成") from exc
        locked = True
        yield
    finally:
        if locked:
            handle.seek(0)
            if os.name == "nt":
                import msvcrt
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                import fcntl
                fcntl.flock(handle, fcntl.LOCK_UN)
        handle.close()


def archive_payload(directory, day, country, kind, payload):
    raw = payload.get("raw_data", payload)
    content = (json.dumps(raw, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")
    sha = hashlib.sha256(content).hexdigest()
    folder = directory / day / country / kind
    folder.mkdir(parents=True, exist_ok=True)
    filename = folder / f"{now().strftime('%H%M%S')}-{uuid4().hex[:8]}-{sha[:16]}.json"
    with filename.open("xb") as handle:
        handle.write(content)
    metadata = {"source_url": payload["source_url"], "observed_at": timestamp(),
                "sha256": sha, "bytes": len(content)}
    filename.with_suffix(".meta.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return filename


def check_feed_freshness(updated_at):
    if not updated_at:
        raise ValueError("榜单没有提供更新时间，无法确认时效")
    try:
        updated = parsedate_to_datetime(updated_at)
    except (ValueError, TypeError):
        updated = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
    if updated.tzinfo is None:
        raise ValueError("榜单更新时间缺少时区")
    age = (now() - updated).total_seconds() / 3600
    if age > 36 or age < -2:
        raise ValueError(f"榜单更新时间异常（相差 {age:.1f} 小时），不作为今日有效榜单")


class Pacer:
    def __init__(self, interval):
        self.interval = interval
        self.previous = None

    def call(self, fn, *args):
        if self.previous is not None:
            remaining = self.interval - (time.monotonic() - self.previous)
            if remaining > 0:
                time.sleep(remaining)
        self.previous = time.monotonic()
        return fn(*args)


def generate_report(conn, config, classifier, day):
    from .analysis import analyze
    from .report import write_reports
    data = store.load_analysis_data(conn, day, config, classifier)
    report = analyze(data)
    from .research import build
    report['research'] = build(conn, config, day)
    chart_status = [row for row in data["chart_status"] if row["date"] == day]
    latest = next((row for row in reversed(data["runs"]) if row["date"] == day), None)
    report["collection"] = {"latest_run": latest, "chart_status": chart_status,
                            "detail_counts": latest["stats"] if latest else {},
                            "errors": latest["errors"] if latest else []}
    report["coverage"] = {"countries": config["countries"], "charts": config["charts"],
                          "chart_limit": config["chart_limit"], "google_play": config.get("google_play", {})}
    report["history_days"] = conn.execute(
        "SELECT COUNT(DISTINCT date) FROM chart_status WHERE date<=? AND status='ok'", (day,)
    ).fetchone()[0]
    report["classification_note"] = "方向按可编辑的名称规则归类；未命中时使用商店分类。名称规则可能误分，可在 directions.json 校正。"
    errors = report["collection"]["errors"]
    report["quality"] = list(report.get("quality", [])) + errors
    for platform in ('ios','android'):
        members=[p for p in report['products'] if p.get('platform')==platform]
        missing_ratings=sum(p.get('rating_count') is None for p in members)
        if missing_ratings:
            report['quality'].append(f'{platform} 有 {missing_ratings} 条观测缺少可用评分总数，不参与评分增长比较。')
    for row in chart_status:
        if row['status']=='ok' and row['count']<config['chart_limit']:
            report['quality'].append(f"{row['country']}/{row['chart']} 返回 {row['count']} 条，低于计划数量，不能作为完整新入榜基线。")
    expected = (len(config['countries']) + (len(config.get('google_play',{}).get('countries',[])) if config.get('google_play',{}).get('enabled') else 0)) * len(config['charts'])
    missing = expected - sum(
        row["status"] == "ok" for row in chart_status)
    if missing:
        report["quality"].append(f"当日 {missing} 个计划榜单尚无成功观测，方向样本可能不完整。")
    return write_reports(report, config["reports_directory"])


def collect(config, classifier, android_only=False):
    from .sources import fetch_chart, fetch_details
    with collection_lock(config["database"].parent / "collection.lock"):
        conn = store.connect(config["database"])
        day = now().astimezone(CST).date().isoformat()
        run_id = store.start_run(conn, day, timestamp())
        errors = []
        stats = {"charts_ok": 0, "charts_expected": (len(config['countries']) + (len(config.get('google_play',{}).get('countries',[])) if config.get('google_play',{}).get('enabled') else 0)) * len(config['charts']),
                 "detail_requested": 0, "detail_received": 0, "tracked_skipped": 0}
        if android_only:
            stats["charts_expected"] = len(config.get("google_play",{}).get("countries",[]))*len(config["charts"])
        pacer = Pacer(config["request_interval_seconds"])
        try:
            for country in ([] if android_only else config["countries"]):
                for chart in config["charts"]:
                    print(f"采集榜单 {country}/{chart}", flush=True)
                    try:
                        payload = pacer.call(fetch_chart, country, chart, config["chart_limit"])
                        raw_path = archive_payload(config["raw_directory"], day, country, chart, payload)
                        check_feed_freshness(payload.get("source_updated_at"))
                        observed = timestamp()
                        store.save_chart(conn, day=day, country=country, chart=chart, payload=payload,
                                         observed_at=observed, raw_path=raw_path, run_id=run_id)
                        with conn:
                            for app in payload["apps"]:
                                store.save_snapshot(conn, day=day, country=country, app=app,
                                    observed_at=observed, detail_status="chart_only", classifier=classifier,
                                    source_url=payload["source_url"], raw_path=raw_path)
                        stats["charts_ok"] += 1
                        if len(payload["apps"]) < config["chart_limit"]:
                            errors.append(f"{country}/{chart} 仅返回 {len(payload['apps'])} 个，低于请求条数；不能据此断言完整新入榜。")
                    except Exception as exc:
                        error = f"{country}/{chart}: {type(exc).__name__}: {exc}"
                        errors.append(error)
                        store.chart_error(conn, day=day, country=country, chart=chart,
                                          error=error, run_id=run_id)
                        print("  " + error, flush=True)
                tracked, skipped = store.tracked_apps(conn, country, day,
                    config["track_off_chart_days"], config["max_tracked_per_country"], platform='ios')
                stats["tracked_skipped"] += skipped
                if skipped:
                    errors.append(f"{country} 追踪上限导致 {skipped} 个离榜产品本日未刷新。")
                batch_size = config["lookup_batch_size"]
                for offset in range(0, len(tracked), batch_size):
                    ids = [app["app_id"] for app in tracked[offset:offset + batch_size]]
                    stats["detail_requested"] += len(ids)
                    print(f"采集详情 {country}: {offset + 1}–{offset + len(ids)}/{len(tracked)}", flush=True)
                    try:
                        payload = pacer.call(fetch_details, country, ids)
                        raw_path = archive_payload(config["raw_directory"], day, country, "lookup", payload)
                        observed = timestamp()
                        with conn:
                            for app in payload["apps"]:
                                store.save_snapshot(conn, day=day, country=country, app=app,
                                    observed_at=observed, detail_status="ok", classifier=classifier,
                                    source_url=payload["source_url"], raw_path=raw_path)
                        count = len(payload["apps"])
                        stats["detail_received"] += count
                        missing = len(ids) - count
                        if missing:
                            errors.append(f"{country} 一批 {len(ids)} 个详情中有 {missing} 个未返回，可能下架或地区不可用；评分保持缺失。")
                        store.save_batch(conn, run_id=run_id, country=country, requested=len(ids),
                            received=count, status="ok" if not missing else "partial",
                            source_url=payload["source_url"], raw_path=raw_path)
                    except Exception as exc:
                        error = f"{country} 详情批次: {type(exc).__name__}: {exc}"
                        errors.append(error)
                        store.save_batch(conn, run_id=run_id, country=country, requested=len(ids),
                                         received=0, status="error", error=error)
                        print("  " + error, flush=True)
            from .google_play import collect_android
            collect_android(conn,config,classifier,day,run_id,stats,errors)
            if config.get('reviews',{}).get('enabled'):
                from .analysis import analyze
                from .research import collect_reviews
                research = collect_reviews(conn,config,analyze(store.load_analysis_data(conn,day,config,classifier))['products'],day)
                stats['research'] = research
                errors.extend('评论研究: '+e for e in research['errors'])
            status = "ok" if not errors else ("partial" if stats["charts_ok"] else "error")
            store.finish_run(conn, run_id, timestamp(), status, errors, stats)
            paths = generate_report(conn, config, classifier, day)
            print(json.dumps({"date": day, "status": status, "stats": stats,
                              "errors": errors, "reports": paths}, ensure_ascii=False, indent=2))
            return 0 if status == "ok" else 2
        except BaseException as exc:
            # Preserve evidence even for interruption. No skipped date is backfilled.
            store.finish_run(conn, run_id, timestamp(), "interrupted",
                             errors + [f"{type(exc).__name__}: {exc}"], stats)
            raise
        finally:
            conn.close()


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="App 增长雷达：公开榜单日采集与增长报告")
    parser.add_argument("command", choices=("collect", "report", "status", "research"))
    parser.add_argument("--config", default=str(ROOT / "config.json"))
    parser.add_argument("--date", help="仅 report 支持，重建指定观测日的报告")
    parser.add_argument('--android-only', action='store_true', help='只刷新安卓，报告仍包含已有 iOS 观测')
    args = parser.parse_args(argv)
    try:
        config, classifier = load_config(args.config)
        if args.command == "collect":
            if args.date:
                parser.error("collect 不能指定历史日期，采集只记录真实观测当天")
            return collect(config, classifier, android_only=args.android_only)
        if not config["database"].exists():
            raise ValueError("尚无数据库，请先运行 collect")
        conn = store.connect(config["database"])
        try:
            if args.command == 'research':
                if args.date:
                    parser.error('research 只采集真实当天评论，不能指定历史评论日期')
                from .analysis import analyze
                from .research import collect_reviews
                day=conn.execute('SELECT MAX(date) FROM snapshots').fetchone()[0]
                with collection_lock(config['database'].parent/'collection.lock'):
                    research=collect_reviews(conn,config,analyze(store.load_analysis_data(conn,day,config,classifier))['products'],day)
                    paths=generate_report(conn,config,classifier,day)
                print(json.dumps({'growth_as_of':day,'research':research,'reports':paths},ensure_ascii=False,indent=2))
                return 2 if research and research['errors'] else 0
            if args.command == "status":
                row = conn.execute("SELECT * FROM runs ORDER BY started_at DESC,rowid DESC LIMIT 1").fetchone()
                print(json.dumps(dict(row) if row else {"status": "empty"}, ensure_ascii=False, indent=2))
            else:
                day = args.date or conn.execute("SELECT MAX(date) FROM runs").fetchone()[0]
                date.fromisoformat(day)
                paths = generate_report(conn, config, classifier, day)
                print(json.dumps(paths, ensure_ascii=False, indent=2))
        finally:
            conn.close()
        return 0
    except (OSError, ValueError, RuntimeError, sqlite3.Error) as exc:
        print(f"无法完成：{exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
