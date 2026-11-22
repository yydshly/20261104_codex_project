"""Additive research tables; daily growth snapshots are never rewritten here."""
import hashlib
import json
from uuid import uuid4


SCHEMA = '''
CREATE TABLE IF NOT EXISTS research_runs (
 id TEXT PRIMARY KEY, date TEXT NOT NULL, growth_as_of TEXT NOT NULL,
 started_at TEXT NOT NULL, finished_at TEXT, status TEXT NOT NULL,
 selection TEXT NOT NULL, errors TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS review_observations (
 observed_date TEXT NOT NULL, platform TEXT NOT NULL, country TEXT NOT NULL,
 language TEXT NOT NULL, app_id TEXT NOT NULL, review_id TEXT NOT NULL,
 score INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
 posted_at TEXT NOT NULL, version TEXT NOT NULL, source_url TEXT NOT NULL,
 raw_path TEXT NOT NULL, observed_at TEXT NOT NULL, content_hash TEXT NOT NULL,
 PRIMARY KEY(observed_date,platform,country,language,app_id,review_id)
);
CREATE TABLE IF NOT EXISTS review_fetches (
 id TEXT PRIMARY KEY, run_id TEXT NOT NULL, app_id TEXT NOT NULL, country TEXT NOT NULL,
 language TEXT NOT NULL, page INTEGER NOT NULL, status TEXT NOT NULL, count INTEGER NOT NULL,
 invalid_count INTEGER NOT NULL DEFAULT 0, source_url TEXT, raw_path TEXT, error TEXT
);
'''


def ensure_schema(conn):
    conn.executescript(SCHEMA)


def start(conn, day, growth_day, selection, timestamp):
    ensure_schema(conn); run_id=uuid4().hex
    with conn:
        conn.execute('INSERT INTO research_runs VALUES(?,?,?,?,?,?,?,?)',
            (run_id,day,growth_day,timestamp,None,'running',json.dumps(selection,ensure_ascii=False),'[]'))
    return run_id


def finish(conn, run_id, timestamp, status, errors):
    with conn:
        conn.execute('UPDATE research_runs SET finished_at=?,status=?,errors=? WHERE id=?',
                     (timestamp,status,json.dumps(errors,ensure_ascii=False),run_id))


def save(conn, day, reviews, path, observed_at):
    with conn:
        for r in reviews:
            digest=hashlib.sha256((r['title']+'\n'+r['body']).encode('utf-8')).hexdigest()
            values=(day,r['platform'],r['country'],r['language'],r['app_id'],r['review_id'],r['score'],
                    r['title'],r['body'],r['posted_at'],r['version'],r['source_url'],str(path),observed_at,digest)
            conn.execute('''INSERT INTO review_observations VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
              ON CONFLICT(observed_date,platform,country,language,app_id,review_id) DO UPDATE SET
              score=excluded.score,title=excluded.title,body=excluded.body,posted_at=excluded.posted_at,
              version=excluded.version,source_url=excluded.source_url,raw_path=excluded.raw_path,
              observed_at=excluded.observed_at,content_hash=excluded.content_hash''', values)


def batch(conn, run_id, product, language, page, status, payload=None, path=None, error=None):
    payload=payload or {}
    with conn:
        conn.execute('INSERT INTO review_fetches VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
            (uuid4().hex,run_id,product['app_id'],product['country'],language,page,status,
             len(payload.get('reviews',[])),payload.get('invalid_count',0),payload.get('source_url'),str(path) if path else None,error))


def load(conn, growth_day):
    if not conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='research_runs'").fetchone():
        return None
    row=conn.execute('SELECT * FROM research_runs WHERE growth_as_of=? ORDER BY started_at DESC,rowid DESC LIMIT 1',(growth_day,)).fetchone()
    if row is None:return None
    run=dict(row);run['selection']=json.loads(run['selection']);run['errors']=json.loads(run['errors'])
    fetches=[dict(r) for r in conn.execute('SELECT * FROM review_fetches WHERE run_id=?',(run['id'],))]
    # Repeated collections on one day share the observation table. Only the
    # current run's archived responses belong to its bounded review sample.
    paths={f['raw_path'] for f in fetches if f['status']=='ok' and f['raw_path']}
    observations=[dict(r) for r in conn.execute('SELECT * FROM review_observations WHERE observed_date=?',(run['date'],))
                  if r['raw_path'] in paths]
    return {'run':run,'reviews':observations,'fetches':fetches}
