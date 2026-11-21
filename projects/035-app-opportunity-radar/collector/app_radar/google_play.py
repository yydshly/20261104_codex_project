"""Google Play public store observations, isolated from Apple identities."""
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parent.parent


def bridge(mode, country, argument):
    completed = subprocess.run(['node', str(ROOT/'play_bridge.mjs'), mode, country, argument],
        cwd=ROOT, capture_output=True, text=True, encoding='utf-8', timeout=240)
    if completed.returncode:
        raise RuntimeError(completed.stderr[-1200:])
    return json.loads(completed.stdout)


def normalize(item, country):
    package = item.get('appId', '')
    if not re.fullmatch(r'[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+', package):
        raise ValueError('Invalid Google Play package ID')
    ratings = item.get('ratings')
    if not isinstance(ratings, int) or isinstance(ratings, bool) or ratings < 0:
        ratings = None
    return {'app_id':'play:'+package, 'name':item['title'],
        'developer':item.get('developer',''),
        'store_url':'https://play.google.com/store/apps/details?'+urlencode({'id':package,'gl':country,'hl':'en'}),
        'genres':[item['genre']] if item.get('genre') else [],
        'genre_ids':[item['genreId']] if item.get('genreId') else [],
        'release_date':None, 'rating_count':ratings, 'rating':item.get('score'),
        'price':item.get('price'), 'currency':item.get('currency'), 'bundle_id':package}


def collect_android(conn, config, classifier, day, run_id, stats, errors):
    from . import store
    from .cli import archive_payload, timestamp
    settings = config.get('google_play', {})
    if not settings.get('enabled'):
        return
    for country in settings['countries']:
        for chart in config['charts']:
            key = 'android-'+chart
            print(f'采集 Google Play {country}/{chart}', flush=True)
            url='https://play.google.com/store/apps/category/APPLICATION?'+urlencode({'gl':country,'hl':'en'})
            try:
                raw=bridge('chart',country,chart)
                apps=[dict(normalize(row,country),rank=i) for i,row in enumerate(raw['results'],1)]
                if not apps or len({a['app_id'] for a in apps})!=len(apps):
                    raise ValueError('Empty or duplicate Google Play chart')
                payload={'source_url':url,'source_updated_at':None,'apps':apps,'raw_data':raw}
                path=archive_payload(config['raw_directory'],day,country,key,payload)
                observed=timestamp()
                store.save_chart(conn,day=day,country=country,chart=key,payload=payload,
                    observed_at=observed,raw_path=path,run_id=run_id)
                with conn:
                    for app in apps:
                        store.save_snapshot(conn,day=day,country=country,app=app,observed_at=observed,
                            detail_status='chart_only',classifier=classifier,source_url=url,raw_path=path)
                stats['charts_ok']+=1
                if len(apps)<config['chart_limit']:
                    errors.append(f'Google Play {country}/{chart} 只返回 {len(apps)} 条，不能视为完整榜单。')
            except Exception as exc:
                error=f'Google Play {country}/{chart}: {exc}'
                errors.append(error)
                store.chart_error(conn,day=day,country=country,chart=key,error=error,run_id=run_id)
                continue
        tracked, skipped=store.tracked_apps(conn,country,day,config['track_off_chart_days'],
            config['max_tracked_per_country'],platform='android')
        if skipped: errors.append(f'Google Play {country} 追踪上限遗漏 {skipped} 个离榜产品。')
        for offset in range(0,len(tracked),20):
            ids=[a['app_id'][5:] for a in tracked[offset:offset+20]]
            stats['detail_requested']+=len(ids)
            print(f'采集安卓详情 {country}: {offset+1}–{offset+len(ids)}/{len(tracked)}',flush=True)
            try:
                raw=bridge('details',country,json.dumps(ids))
                apps=[normalize(row,country) for row in raw['results']]
                url='https://play.google.com/store/apps/details?'+urlencode({'id':ids[0],'gl':country,'hl':'en'})
                path=archive_payload(config['raw_directory'],day,country,'android-details',
                    {'source_url':url,'raw_data':raw})
                with conn:
                    for app in apps:
                        store.save_snapshot(conn,day=day,country=country,app=app,observed_at=timestamp(),
                            detail_status='ok',classifier=classifier,source_url=app['store_url'],raw_path=path)
                stats['detail_received']+=len(apps)
                if len(apps)!=len(ids): errors.append(f'Google Play {country} 详情缺失 {len(ids)-len(apps)} 条：{raw.get("errors",[])}')
                store.save_batch(conn,run_id=run_id,country=country,requested=len(ids),received=len(apps),
                    status='ok' if len(apps)==len(ids) else 'partial',source_url=url,raw_path=path)
            except Exception as exc:
                errors.append(f'Google Play {country} 详情批次失败: {exc}')
                store.save_batch(conn,run_id=run_id,country=country,requested=len(ids),received=0,
                    status='error',error=str(exc))
