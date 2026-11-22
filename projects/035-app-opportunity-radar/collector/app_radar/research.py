"""Bounded review samples and auditable keyword statistics; judgments stay with readers."""
from collections import Counter
from datetime import datetime, timedelta, timezone
import hashlib
import json
import re
from . import research_store


def select_products(products, settings):
    """Bounded, diverse sample. One storefront per platform app, never merge IDs."""
    limit=settings.get('max_per_platform',6)
    selected=[]
    def gain(p):return max([m.get('rank_gain') or 0 for m in p['chart_moves']]+[0])
    for platform in ('ios','android'):
        candidates=sorted([p for p in products if p['platform']==platform and p['growing']],
                          key=lambda p:(-gain(p),-(p.get('rating_delta_1d') or 0),p['country'],p['app_id']))
        chosen=[]; ids=set()
        def add(p,reason):
            if p['app_id'] in ids or len(chosen)>=limit:return
            ids.add(p['app_id']);chosen.append({**p,'selection_reason':reason})
        for app_id in settings.get('watchlist',[]):
            p=next((p for p in candidates if p['app_id']==app_id),None)
            if p:add(p,'持续跟踪名单，当前有增长信号')
        for country in (('cn','us','jp','gb') if platform=='ios' else ('us','jp','gb')):
            p=next((p for p in candidates if p['country']==country and p['app_id'] not in ids),None)
            if p:add(p,'按市场补充增长样本')
        for p in candidates:
            if len(chosen)>=limit:break
            if p['app_id'] not in ids:add(p,'补充增长样本')
        selected.extend(chosen)
    return selected


def collect_reviews(conn, config, products, growth_day):
    from .cli import archive_payload, timestamp, now, CST, Pacer
    from .review_sources import fetch_reviews
    settings=config.get('reviews',{})
    if not settings.get('enabled'):return None
    selection=select_products(products,settings)
    day=now().astimezone(CST).date().isoformat()
    run_id=research_store.start(conn,day,growth_day,selection,timestamp());errors=[]
    pacer=Pacer(config['request_interval_seconds'])
    try:
        for p in selection:
            language={'cn':'zh','jp':'ja'}.get(p['country'],'en')
            limit=settings.get('reviews_per_app',100)
            pages=(limit+49)//50 if p['platform']=='ios' else 1
            fetched_ids=set()
            for page in range(1,pages+1):
                print(f"采集评论 {p['platform']} {p['country']} {p['name']} · {page}/{pages}",flush=True)
                try:
                    payload=pacer.call(fetch_reviews,p,language,limit,page)
                    path=archive_payload(config['raw_directory'],day,p['country'],
                                         'reviews-'+p['platform'],payload)
                    bounded=[]
                    for r in payload['reviews']:
                        if r['review_id'] in fetched_ids:continue
                        if len(fetched_ids)>=limit:break
                        fetched_ids.add(r['review_id']);bounded.append(r)
                    research_store.save(conn,day,bounded,path,timestamp())
                    research_store.batch(conn,run_id,p,language,page,'ok',payload,path)
                    if payload['invalid_count']:
                        errors.append(f"{p['name']} page {page}: {payload['invalid_count']} 条格式异常评论跳过")
                    if not payload['reviews'] or len(fetched_ids)>=limit:break
                except Exception as exc:
                    error=f"{p['platform']} {p['country']} {p['name']} 评论 page {page}: {type(exc).__name__}: {exc}"
                    errors.append(error);print('  '+error,flush=True)
                    research_store.batch(conn,run_id,p,language,page,'error',error=error)
                    break
        research_store.finish(conn,run_id,timestamp(),'partial' if errors else 'ok',errors)
    except BaseException as exc:
        research_store.finish(conn,run_id,timestamp(),'interrupted',errors+[str(exc)])
        raise
    return {'run_id':run_id,'selected':len(selection),'errors':errors}


def excerpt(text, match):
    """Short original evidence, not a generated translation or full review."""
    has_cjk=bool(re.search(r'[\u3040-\u30ff\u3400-\u9fff]',text))
    start=max(0,match.start()-(8 if has_cjk else 24))
    segment=text[start:start+180].replace('\n',' ')
    if has_cjk:
        segment=segment[:24]
    else:
        segment=' '.join(segment.split()[:18])
    return ('…' if start else '')+segment+('…' if start+len(segment)<len(text) else '')


def analyze_research(data, settings, rules):
    if not data:return {'status':'not_collected','mode':'statistics','briefs':[],'opportunities':[],'products':[],'errors':[],
                        'methodology':['尚未采集用户评论。']}
    run=data['run'];date=datetime.fromisoformat(run['date']).replace(tzinfo=timezone.utc)
    earliest=date-timedelta(days=settings.get('lookback_days',90))
    latest=datetime.fromisoformat(run.get('finished_at') or run['started_at'])+timedelta(hours=2)
    compiled={kind:[(row,re.compile(row['pattern'],re.I),
                     re.compile(row['exclude'],re.I) if row.get('exclude') else None)
                    for row in rules.get(kind,[])] for kind in ('needs','pains','requests')}
    products=[];total=0
    for p in run['selection']:
        observations=[r for r in data['reviews'] if r['platform']==p['platform'] and
                      r['app_id']==p['app_id'] and r['country']==p['country']]
        seen_ids=set();seen_text=set();sample=[];outdated=0
        for r in sorted(observations,key=lambda r:r['observed_at'],reverse=True):
            try:posted=datetime.fromisoformat(r['posted_at'])
            except (ValueError,TypeError):continue
            if posted<earliest or posted>latest:outdated+=1;continue
            digest=hashlib.sha256(re.sub(r'\s+',' ',r['body']).strip().lower().encode()).hexdigest()
            if r['review_id'] in seen_ids or digest in seen_text:continue
            seen_ids.add(r['review_id']);seen_text.add(digest);sample.append(r)
        total+=len(sample);hist=Counter(r['score'] for r in sample)
        themes={kind:[] for kind in compiled}
        for kind, rows in compiled.items():
            eligible=([r for r in sample if r['score']>=4] if kind=='needs' else
                      [r for r in sample if r['score']<=2] if kind=='pains' else sample)
            for rule,pattern,exclude in rows:
                if rule.get('scene_any') and not set(rule['scene_any']).intersection(p.get('scenes',[])):
                    continue
                evidence=[]
                for r in eligible:
                    body=(r['title']+' '+r['body']).strip()
                    match=pattern.search(body)
                    if not match:continue
                    context=body[max(0,match.start()-32):min(len(body),match.end()+48)]
                    if exclude and exclude.search(context):continue
                    evidence.append({'review_id':r['review_id'],'score':r['score'],
                        'posted_at':r['posted_at'],'version':r['version'],
                        'excerpt':excerpt(body,match),'source_url':r['source_url'],
                        'raw_path':r['raw_path'],'matched_text':match.group(0)})
                if evidence:
                    theme={k:rule[k] for k in ('id','label')}
                    theme.update(count=len(evidence),evidence=evidence[:3],review_ids=[e['review_id'] for e in evidence])
                    themes[kind].append(theme)
            themes[kind].sort(key=lambda t:(-t['count'],t['label']))
        fetches=[f for f in data['fetches'] if f['app_id']==p['app_id'] and f['country']==p['country']]
        success=any(f['status']=='ok' for f in fetches)
        failure=any(f['status']=='error' for f in fetches)
        status=('partial' if success and failure else 'error' if failure else 'empty' if not observations else 'no_recent' if not sample else 'ok')
        pains=themes['pains']
        for t in pains+themes['requests']:
            t['evidence_level']='关键词规则匹配数量，含义由读者核对原文'
        products.append({'platform':p['platform'],'country':p['country'],'app_id':p['app_id'],
            'name':p['name'],'store_url':p['store_url'],'scenes':p.get('scenes',[]),
            'capabilities':p.get('capabilities',[]),'tag_status':p.get('tag_status','待补充'),
            'selection_reason':p['selection_reason'],'chart_moves':p['chart_moves'],
            'rating_delta_1d':p['rating_delta_1d'],'status':status,
            'sample_count':len(sample),'low_star_count':hist[1]+hist[2],
            'positive_count':hist[4]+hist[5],'neutral_count':hist[3],
            'excluded_by_date':outdated,'star_histogram':dict(hist),
            'needs':themes['needs'],'pains':pains,'requests':themes['requests'],
            'unclassified_low_count':len({r['review_id'] for r in sample if r['score']<=2}-
                {rid for t in pains+themes['requests'] for rid in t['review_ids']}),
            'sample_date_min':min((r['posted_at'] for r in sample),default=None),
            'sample_date_max':max((r['posted_at'] for r in sample),default=None),
            'evidence':[{'review_id':r['review_id'],'score':r['score'],'posted_at':r['posted_at'],
                'version':r['version'],'language':r['language'],'source_url':r['source_url'],
                'excerpt':excerpt((r['title']+' '+r['body']).strip(),re.search(r'.', (r['title']+' '+r['body']).strip())),
                'themes':[t['label'] for kind in themes.values() for t in kind if r['review_id'] in t['review_ids']]}
                for r in sorted(sample,key=lambda r:r['posted_at'],reverse=True)],
            'errors':[f['error'] for f in fetches if f['error']]})
    return {'status':run['status'],'collected_on':run['date'],'growth_as_of':run['growth_as_of'],
        'mode':'statistics','briefs':[],
        'lookback_days':settings.get('lookback_days',90),'reviews_per_app':settings.get('reviews_per_app',100),
        'rules_version':rules['version'],'selected_count':len(products),'review_count':total,
        'low_star_count':sum(p['low_star_count'] for p in products),
        'positive_count':sum(p['positive_count'] for p in products),
        'products':products,'opportunities':[],'errors':run['errors'],
        'fetches':[{k:f[k] for k in ('app_id','country','language','page','status','count','invalid_count','source_url','error')} for f in data['fetches']],
        'methodology':[
            '增长榜单与评论采集日期分别显示。按平台独立 ID 关联；每个平台 App 只选一个市场，优先增长样本并兼顾持续跟踪名单。',
            f"采集各商店近期评论，每 App 最多{settings.get('reviews_per_app',100)}条；从样本中筛选1—2星差评、4—5星好评。非随机、非全量样本，不把样本差评占比解释为总体不满意率。",
            f"只分析最近{settings.get('lookback_days',90)}天的可验证日期评论；按评论ID和重复正文去重，评论编辑保留逐日观测。空结果与请求失败分开，历史证据不被失败覆盖。",
            '本次样本仅关联本次成功归档的响应；同一天重复采集不合并旧批次评论。旧批次仍保存在原始归档和数据库中，失败请求不会用旧样本冒充本次成功。',
            'Google Play 按页面地区与语言请求，不保证评论作者来自该国；评论数不等于评分总数。',
            '中英日关键词规则提取主题，名称/标签仅作产品用途背景；主题是待人工复核的线索。好评不证明需求已完全解决，差评不证明当前版本仍有缺陷。',
            '功能请求独立分析，包含高星评论中的改进请求。星级和正文可能矛盾；未匹配的评论仍可查看，不把低星数量当成已确认痛点数量。',
            '只展示统计、关键词匹配和来源，不生成需求结论、切入建议、原型或商业判断。历史研究判断文件保留，但不载入当前报告。原文保存在本地归档，报告仅展示短摘录。']}


def build(conn, config, growth_day):
    if 'directions_file' not in config:
        return {'status':'not_configured','products':[],'opportunities':[],'errors':[]}
    path=config['directions_file'].parent/'research_rules.json'
    if not path.exists():return {'status':'not_configured','products':[],'opportunities':[],'errors':[]}
    result=analyze_research(research_store.load(conn,growth_day),config.get('reviews',{}),
                            json.loads(path.read_text(encoding='utf-8')))
    result['briefs']=[]
    return result
