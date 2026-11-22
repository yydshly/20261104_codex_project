"""Publish a reproducible statistics snapshot using an explicit file allowlist."""
from pathlib import Path
import argparse
import hashlib
import importlib
import json
import re
import sys

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
DEST=ROOT/'docs'/HERE.name
GUIDE='app-growth-radar-overview-20261122-research-v2'
GUIDE_SHA='41b07d0259335c76876e5138268ae71a7fc1f92df80aa5327fb7256c652bca62'
FILES={}


def digest(content):return hashlib.sha256(content).hexdigest()


def write(relative,content):
    if isinstance(content,str):
        content=content.replace('\r\n','\n')
        if relative.endswith('.md'):content='\n'.join(line.rstrip() for line in content.splitlines())+'\n'
        content=content.encode('utf-8')
    path=DEST/relative;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(content)
    FILES[relative]={'path':relative,'bytes':len(content),'sha256':digest(content)}


def sanitize(value):
    if isinstance(value,dict):
        return {k:sanitize(v) for k,v in value.items() if k not in
                {'raw_path','raw_directory','database','reports_directory','directions_file','source_path'}}
    if isinstance(value,list):return [sanitize(v) for v in value]
    if isinstance(value,str):
        return re.sub(r"(?<![A-Za-z0-9])[A-Za-z]:[\\/][^\s\"']+", '[本地路径省略]',value)
    return value


def escaped_json(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('&','\\u0026').replace('<','\\u003c').replace('>','\\u003e').replace('\u2028','\\u2028').replace('\u2029','\\u2029')


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source',type=Path,help='Existing local collector, read only; defaults to bundled source')
    args=parser.parse_args()
    source=(args.source or (ROOT/'app-growth-radar' if (ROOT/'app-growth-radar').exists() else HERE/'collector')).resolve()
    report_input=source/'reports/latest.json'
    if not report_input.exists():report_input=DEST/'report/snapshot.json'
    report=sanitize(json.loads(report_input.read_text(encoding='utf-8')))
    research=report['research']
    assert research['mode']=='statistics' and research['briefs']==[] and research['opportunities']==[]
    dates=report['trends']['dates'][-7:]
    pool=[p for p in report['trends']['series'] if p['platform']=='ios' and p['country']=='cn' and
          any(r['date'] in dates and isinstance(r.get('free_rank'),int) for r in p['observations'])]
    status={'ranked':0,'off_chart':0,'unknown':0};gains=[];held=0;full=0
    for p in pool:
        today=next((r for r in p['observations'] if r['date']==report['as_of']),{})
        status['ranked' if isinstance(today.get('free_rank'),int) else 'off_chart' if today.get('free_status')=='off_chart' else 'unknown']+=1
        a=next((r.get('free_rank') for r in p['observations'] if r['date']==dates[0]),None)
        b=next((r.get('free_rank') for r in p['observations'] if r['date']==dates[-1]),None)
        if len(dates)>=2 and isinstance(a,int) and isinstance(b,int):gains.append(a-b)
        held+=sum(isinstance(r.get('free_rank'),int) for r in p['observations'] if r['date'] in dates)==len(dates)
        full+=p.get('rating_7d',{}).get('valid_days')==7
    stats={'charts':report['summary']['successful_charts'],'products':len(report['products']),
           'unique':report['summary']['unique_app_count'],'history':len(report['trends']['dates']),
           'reviews':research['review_count'],'selected':research['selected_count'],
           'low':research['low_star_count'],'positive':research['positive_count'],
           'neutral':sum(p['neutral_count'] for p in research['products']),
           'tagged':report['tag_coverage']['tagged'],'untagged':report['tag_coverage']['untagged'],
           'cn_pool':len(pool),'cn_ranked':status['ranked'],'cn_off_chart':status['off_chart'],
           'cn_comparable':len(gains),'cn_up':sum(g>0 for g in gains),'cn_down':sum(g<0 for g in gains),
           'cn_unchanged':sum(g==0 for g in gains),'cn_full_holding':held,'cn_full_rating':full}
    data={'as_of':report['as_of'],'phase':'phase-1','mode':'statistics','stats':stats}
    page=(HERE/'web/index.html').read_text(encoding='utf-8').replace('__SNAPSHOT_DATA__',escaped_json(data))
    for bundle in ('research.css','research.js'):
        content=(HERE/'web'/bundle).read_bytes().replace(b'\r\n',b'\n')
        page=page.replace('"'+bundle+'"','"'+bundle+'?v='+digest(content)[:12]+'"');write(bundle,content)
    write('index.html',page)
    for name in ('README.md','PHASE-1.md'):
        text=(HERE/name).read_text(encoding='utf-8').replace('../../docs/035-app-opportunity-radar/','').replace('../../README.md','https://github.com/yydshly/20261104_codex_project')
        write(name,text)
    for ext in ('png','svg'):
        original=source/'docs/architecture'/(GUIDE+'.'+ext)
        if not original.exists():original=DEST/'media'/(GUIDE+'.'+ext)
        assert original.is_file() and not original.is_symlink()
        content=original.read_bytes()
        if ext=='png':assert digest(content)==GUIDE_SHA
        write('media/'+original.name,content)
    # Capture only the two already-reviewed public-data screenshots, never arbitrary folders.
    for original_name,target_name in [('01-after-overview.jpg','dashboard-desktop-20261122.jpg'),('05-mobile-first-screen.jpg','dashboard-mobile-20261122.jpg')]:
        original=source/'reports/ui-check/quick-understanding-20261122'/original_name
        if not original.exists():original=DEST/'media'/target_name
        assert original.is_file() and not original.is_symlink()
        write('media/'+target_name,original.read_bytes())
    sys.path.insert(0,str(source))
    module=importlib.import_module('app_radar.report')
    public_html=module._html(report).replace('href="latest.html"','href="index.html#trends"')
    write('report/index.html',public_html)
    write('report/snapshot.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    write('report/snapshot.md',module._markdown(report))
    collector=HERE/'collector';collector.mkdir(exist_ok=True)
    allowed=['README.md','.gitignore','config.json','directions.json','research_rules.json',
             'package.json','package-lock.json','play_bridge.mjs','run.py','preview.py']
    allowed += [p.relative_to(source).as_posix() for p in sorted((source/'app_radar').glob('*.py'))]
    allowed += [p.relative_to(source).as_posix() for p in sorted((source/'tests').iterdir()) if p.suffix in {'.py','.mjs'}]
    for name in allowed:
        original=source/name;assert original.is_file() and not original.is_symlink()
        content=original.read_bytes().replace(b'\r\n',b'\n')
        if name=='README.md':
            text=content.decode('utf-8')
            text=re.sub(r'python "[A-Za-z]:[^"\n]+run\.py" collect','python run.py collect',text)
            content=sanitize(text).encode('utf-8')
        target=collector/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(content)
    manifest={'project':HERE.name,'phase':'phase-1','mode':'statistics','snapshot_date':report['as_of'],
              'publication':'static snapshot; local daily collection does not automatically republish',
              'guide_source':'original phase exploration diagram; execution follows statistics mode',
              'guide_sha256':GUIDE_SHA,'statistics':stats,'files':list(FILES.values()),'source_allowlist':allowed,'collector_sha256':{name:digest((collector/name).read_bytes()) for name in allowed},
              'excluded':['database','raw responses','full review bodies','reviewer avatars','credentials','local archive paths in public snapshot','node_modules']}
    for target in [DEST/'publication-manifest.json',HERE/'publication-manifest.json']:
        target.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'files':len(FILES),'source_files':len(allowed),'guide_sha256':GUIDE_SHA,'stats':stats},ensure_ascii=False))


if __name__=='__main__':main()
