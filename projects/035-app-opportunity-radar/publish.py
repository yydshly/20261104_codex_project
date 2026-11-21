"""Publish an allowlisted static research snapshot, never the local database."""
from pathlib import Path
import hashlib
import importlib.util
import json
import re
import sqlite3

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SOURCE=ROOT/'app-growth-radar' if (ROOT/'app-growth-radar').exists() else HERE/'collector'
DEST=ROOT/'docs'/HERE.name
FILES={}


def digest(content):return hashlib.sha256(content).hexdigest()


def write(relative,content):
    if isinstance(content,str):content=content.replace('\r\n','\n').encode('utf-8')
    path=DEST/relative;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(content)
    FILES[relative]={'path':relative,'bytes':len(content),'sha256':digest(content)}


def sanitize(value):
    if isinstance(value,dict):
        return {k:sanitize(v) for k,v in value.items() if k not in
                {'raw_path','raw_directory','database','reports_directory','directions_file','source_path'}}
    if isinstance(value,list):return [sanitize(v) for v in value]
    if isinstance(value,str):
        return re.sub(r'(?<![A-Za-z0-9])[A-Za-z]:[\\/][^\s\"\']+', '[本地路径省略]',value)
    return value


def escaped_json(value):
    return json.dumps(value,ensure_ascii=False,separators=(',',':')).replace('&','\\u0026').replace('<','\\u003c').replace('>','\\u003e').replace('\u2028','\\u2028').replace('\u2029','\\u2029')


def main():
    report_input=SOURCE/'reports/latest.json'
    if not report_input.exists():report_input=DEST/'report/snapshot.json'
    report=sanitize(json.loads(report_input.read_text(encoding='utf-8')))
    research=report['research']
    assert research['collected_on']=='2026-11-22','This release documents the reviewed 2026-11-22 snapshot.'
    if (SOURCE/'data/radar.sqlite3').exists():
        with sqlite3.connect('file:'+(SOURCE/'data/radar.sqlite3').as_posix()+'?mode=ro',uri=True) as conn:
            raw_count=conn.execute('SELECT COUNT(*) FROM review_observations WHERE observed_date=?',(research['collected_on'],)).fetchone()[0]
    else:
        raw_count=json.loads((HERE/'publication-manifest.json').read_text(encoding='utf-8'))['statistics']['raw']
    stats={'reviews':research['review_count'],'selected':research['selected_count'],
           'charts':report['summary']['successful_charts'],'products':len(report['products']),
           'raw':raw_count,'empty':sum(p['sample_count']==0 for p in research['products']),
           'low':research['low_star_count'],'positive':research['positive_count'],
           'neutral':sum(p['neutral_count'] for p in research['products'])}
    briefs=[]
    for brief in research['briefs']:
        product=next(p for p in research['products'] if p['app_id']==brief['app_id'] and p['country']==brief['country'])
        briefs.append({**brief,'sample_description':f"{product['sample_count']}条近90天去重评论，其中一、二星{product['low_star_count']}条、四五星{product['positive_count']}条；反馈跨版本，需复现当前状态。"})
    assert len(briefs)==4
    data={'as_of':report['as_of'],'stats':stats,'briefs':briefs}
    html=(HERE/'web/index.html').read_text(encoding='utf-8').replace('__SNAPSHOT_DATA__',escaped_json(data))
    for bundle in ('research.css','research.js'):
        version=digest((HERE/'web'/bundle).read_bytes().replace(b'\r\n',b'\n'))[:12]
        html=html.replace('"'+bundle+'"','"'+bundle+'?v='+version+'"')
    write('index.html',html)
    for name in ('research.css','research.js'):write(name,(HERE/'web'/name).read_text(encoding='utf-8'))
    public_readme=(HERE/'README.md').read_text(encoding='utf-8').replace('../../docs/035-app-opportunity-radar/','').replace('../../README.md','https://github.com/yydshly/20261104_codex_project')
    write('README.md',public_readme)
    guide='app-growth-radar-overview-20261122-research-v2'
    for ext in ('png','svg'):
        source=SOURCE/'docs/architecture'/(guide+'.'+ext)
        if not source.exists():source=DEST/'media'/(guide+'.'+ext)
        assert source.is_file() and not source.is_symlink()
        write('media/'+source.name,source.read_bytes())
        assert digest(source.read_bytes())==FILES['media/'+source.name]['sha256']
    spec=importlib.util.spec_from_file_location('radar_public_report',SOURCE/'app_radar/report.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    write('report/index.html',module._html(report))
    write('report/snapshot.json',json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    write('report/snapshot.md',module._markdown(report))
    # Preserve implementation and tests without forcing ignored local workspace data into Git.
    collector=HERE/'collector';collector.mkdir(exist_ok=True)
    allowed=['README.md','.gitignore','config.json','directions.json','research_rules.json',
             'package.json','package-lock.json','play_bridge.mjs','run.py','preview.py']
    allowed += [p.relative_to(SOURCE).as_posix() for p in (SOURCE/'app_radar').glob('*.py')]
    allowed += [p.relative_to(SOURCE).as_posix() for p in (SOURCE/'tests').iterdir() if p.suffix in {'.py','.mjs'}]
    for name in allowed:
        source=SOURCE/name;assert source.is_file() and not source.is_symlink()
        target=collector/name;target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(source.read_bytes().replace(b'\r\n',b'\n'))
    manifest={'project':'035-app-opportunity-radar','snapshot_date':report['as_of'],
              'publication':'static snapshot; local collection does not automatically republish',
              'guide_source':'app-growth-radar/docs/architecture/'+guide+'.png',
              'guide_sha256':FILES['media/'+guide+'.png']['sha256'],
              'statistics':stats,'files':list(FILES.values()),
              'source_allowlist':allowed,'excluded':['database','raw responses','full review bodies',
              'reviewer avatars','credentials','local absolute paths','node_modules']}
    (DEST/'publication-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (HERE/'publication-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'site':str(DEST),'files':len(FILES),'collector_source_files':len(allowed),'guide_sha256':manifest['guide_sha256'],'stats':stats},ensure_ascii=False))


if __name__=='__main__':main()
