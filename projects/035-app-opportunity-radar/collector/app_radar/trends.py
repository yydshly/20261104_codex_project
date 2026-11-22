"""Read-only historical observations for charts; no opportunity scoring."""
from datetime import date, timedelta


def seven_day_ratings(rows, day):
    end = date.fromisoformat(day)
    dates = [(end-timedelta(days=i)).isoformat() for i in range(6, -1, -1)]
    by_date = {r['date']: r for r in rows}
    valid = []
    reasons = {}
    for d in dates:
        row = by_date.get(d, {})
        value = row.get('rating_delta_1d')
        if isinstance(value, int) and not isinstance(value, bool) and value >= 0:
            valid.append(value)
        else:
            reason = row.get('rating_delta_status', 'no_observation')
            reasons[reason] = reasons.get(reason, 0) + 1
    return {'start': dates[0], 'end': day, 'expected_days': 7,
            'valid_days': len(valid), 'sum': sum(valid) if valid else None,
            'complete': len(valid) == 7, 'excluded_days': reasons}


def build(conn, day, products, window_days=30):
    end = date.fromisoformat(day)
    start = end - timedelta(days=window_days - 1)
    previous = (start - timedelta(days=1)).isoformat()
    snapshots = {(r['date'], r['country'], r['app_id']): dict(r) for r in conn.execute(
        'SELECT * FROM snapshots WHERE date>=? AND date<=?',
        (previous, day))}
    statuses = {(r['date'], r['country'], r['chart']): dict(r) for r in conn.execute(
        'SELECT date,country,chart,status,count FROM chart_status WHERE date>=? AND date<=?',
        (start.isoformat(), day))}
    ranks = {(r['date'], r['country'], r['app_id'], r['chart']): r['rank'] for r in conn.execute(
        'SELECT date,country,app_id,chart,rank FROM charts WHERE date>=? AND date<=?',
        (start.isoformat(), day))}
    available = [k[0] for k in statuses] + [k[0] for k in snapshots if k[0] >= start.isoformat()]
    first = max(start, date.fromisoformat(min(available))) if available else end
    dates = [(first + timedelta(days=i)).isoformat() for i in range((end-first).days+1)]

    # Include genuinely observed historical chart members even if no current
    # product snapshot exists. Daily product counts remain unchanged.
    current = {(p['country'], p['app_id']): p for p in products}
    members = dict(current)
    metadata = {}
    for (_, country, app_id), row in sorted(snapshots.items()):
        if row.get('name'):
            metadata[(country, app_id)] = row['name']
    for (d, country, app_id, chart), rank in sorted(ranks.items()):
        if statuses.get((d, country, chart), {}).get('status') != 'ok':
            continue
        if (country, app_id) not in members:
            members[(country, app_id)] = {'country': country, 'app_id': app_id,
                'platform': 'android' if app_id.startswith('play:') else 'ios',
                'name': metadata.get((country, app_id), app_id)}

    def count(d, country, app_id):
        r = snapshots.get((d, country, app_id), {})
        value = r.get('rating_count') if r.get('detail_status') == 'ok' else None
        return value if isinstance(value, int) and value >= 0 else None

    series = []
    for p in members.values():
        country, app_id = p['country'], p['app_id']
        prefix = 'android-' if p['platform'] == 'android' else ''
        rows = []
        for d in dates:
            total = count(d, country, app_id)
            before = count((date.fromisoformat(d)-timedelta(days=1)).isoformat(), country, app_id)
            row = {'date': d, 'rating_count': total,
                   'rating_delta_1d': total-before if total is not None and before is not None and total >= before else None}
            row['rating_delta_status'] = ('current_missing' if total is None else 'previous_missing' if before is None
                                          else 'count_decreased' if total < before else 'ok')
            for kind in ('free', 'paid'):
                chart = prefix+'top-'+kind
                state = statuses.get((d, country, chart), {})
                rank = ranks.get((d, country, app_id, chart)) if state.get('status') == 'ok' else None
                row[kind+'_rank'] = rank
                row[kind+'_status'] = ('ranked' if rank is not None else 'missing' if state.get('status') != 'ok'
                                       else 'off_chart' if state['count'] >= 100 else 'not_returned')
            rows.append(row)
        series.append({'platform': p['platform'], 'country': country, 'app_id': app_id,
                       'name': p.get('name', app_id), 'observations': rows,
                       'in_current_report': (country, app_id) in current,
                       'rating_7d': seven_day_ratings(rows, day)})
    return {'start': dates[0], 'end': day, 'window_days': window_days, 'dates': dates, 'series': series,
            'chart_status': list(statuses.values()),
            'series_scope': '当日报告产品与窗口内有效历史榜单产品的并集；不改变当日产品观测总数。',
            'methodology': '同平台、同市场、同榜单逐日观察。缺失值断线；未出现在完整榜单、短榜未返回与请求缺失分开。评分回退或日期不连续时不计算日增量；不同国家的安卓评分不相加。'}
