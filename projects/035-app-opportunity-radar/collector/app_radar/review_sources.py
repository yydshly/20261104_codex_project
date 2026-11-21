"""Bounded public review samples, with explicit storefront/language and score."""
from datetime import datetime, timezone
import re
from urllib.parse import urlencode
from .sources import fetch_json, SourceError
from .google_play import bridge


def normalize(row, platform, app_id, country, language):
    def label(key):
        value = row.get(key, {})
        return value.get('label', '') if isinstance(value, dict) else ''
    if platform == 'ios':
        review_id, score = label('id'), label('im:rating')
        title, body, posted, version = label('title'), label('content'), label('updated'), label('im:version')
        url = f'https://apps.apple.com/{country}/app/id{app_id}?see-all=reviews'
    else:
        review_id, score = row.get('id'), row.get('score')
        title, body, posted, version = row.get('title') or '', row.get('text'), row.get('date'), row.get('version')
        url = 'https://play.google.com/store/apps/details?'+urlencode({'id':app_id[5:],'reviewId':review_id or '', 'hl':language,'gl':country})
    if isinstance(score, str) and re.fullmatch('[1-5]', score): score = int(score)
    if not isinstance(score, int) or isinstance(score, bool) or not 1 <= score <= 5:
        raise ValueError('Review score must be an integer from 1 to 5')
    if not isinstance(review_id, str) or not review_id.strip() or not isinstance(body, str) or not body.strip():
        raise ValueError('Review needs a stable ID and nonempty body')
    if not isinstance(posted, str): raise ValueError('Review timestamp missing')
    parsed = datetime.fromisoformat(posted.replace('Z','+00:00'))
    if parsed.tzinfo is None: raise ValueError('Review timestamp needs timezone')
    return {'platform':platform,'country':country,'language':language,'app_id':app_id,
        'review_id':review_id,'score':score,'title':str(title),'body':body,
        'posted_at':parsed.astimezone(timezone.utc).isoformat(),'version':str(version or ''),
        'source_url':url}


def fetch_reviews(product, language, limit=100, page=1):
    platform, country, app_id = product['platform'], product['country'], product['app_id']
    if platform not in {'ios','android'} or not re.fullmatch('[a-z]{2}',country):
        raise ValueError('Invalid review platform or country')
    if language not in {'en','ja','zh'} or not isinstance(limit,int) or not 1 <= limit <= 200:
        raise ValueError('Invalid review sample bounds')
    if platform == 'ios':
        if not re.fullmatch('[1-9][0-9]*',app_id) or not isinstance(page,int) or not 1 <= page <= 4:
            raise ValueError('Invalid Apple review ID or page')
        url=f'https://itunes.apple.com/{country}/rss/customerreviews/page={page}/id={app_id}/sortby=mostrecent/json'
        raw=fetch_json(url,timeout=25,retries=1)
        if not isinstance(raw.get('feed'),dict): raise SourceError('Apple reviews: missing feed')
        entries=raw['feed'].get('entry',[])
        if isinstance(entries,dict): entries=[entries]
        if not isinstance(entries,list): raise SourceError('Apple reviews: invalid entries')
        # Legacy feeds may include an app metadata entry; it is not a review.
        entries=[e for e in entries if not (isinstance(e,dict) and 'im:name' in e and 'im:rating' not in e)]
    else:
        if not app_id.startswith('play:'): raise ValueError('Android review ID must use play: namespace')
        raw=bridge('reviews',country,__import__('json').dumps({'appId':app_id[5:],'lang':language,'num':limit}))
        if not isinstance(raw.get('results'),list): raise SourceError('Google reviews: missing results')
        entries=raw['results']
        url='https://play.google.com/store/apps/details?'+urlencode({'id':app_id[5:],'hl':language,'gl':country})
    reviews, invalid = [], []
    for entry in entries[:limit]:
        try: reviews.append(normalize(entry,platform,app_id,country,language))
        except (ValueError,TypeError,AttributeError) as exc: invalid.append(str(exc))
    if entries and not reviews: raise SourceError('Review parser rejected every source entry')
    return {'source_url':url,'raw_data':raw,'reviews':reviews,'invalid_count':len(invalid),
            'sampling':'newest','returned_count':len(entries)}
