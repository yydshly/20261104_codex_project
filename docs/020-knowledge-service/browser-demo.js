// Public Pages edition: all state stays in this module closure. No network or real business writes.
// This transport demonstrates the shared rules; client code is not an authorization boundary.
export function createBrowserDemoTransport({ createSession, publicSession, runTurn, runEvaluation, catalog }, { delay = 60 } = {}) {
  const sessions = new Map();
  const locks = new Set();
  const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
  return async function request(path, options = {}) {
    const method = options.method || 'GET';
    const pathname = new URL(path, 'https://demo.invalid').pathname;
    let data;
    try { data = options.body ? JSON.parse(options.body) : {}; }
    catch { return json({ error: '请求格式不正确' }, 400); }
    if (method === 'GET' && pathname === '/api/catalog') return json(catalog);
    if (method === 'POST' && pathname === '/api/sessions') {
      if (sessions.size >= 500) return json({ error: '演示会话已达上限，请刷新页面。' }, 429);
      const session = createSession(); sessions.set(session.id, session);
      return json(publicSession(session), 201);
    }
    if (method === 'GET' && pathname.startsWith('/api/sessions/')) {
      const session = sessions.get(pathname.split('/').at(-1));
      return session ? json(publicSession(session)) : json({ error: '页面演示会话已失效，请新建会话。' }, 404);
    }
    if (method === 'POST' && pathname === '/api/evaluate') return json(await runEvaluation(data.mode === 'single' ? 'single' : 'dual'));
    if (method !== 'POST' || pathname !== '/api/chat') return json({ error: '演示接口不存在' }, 404);
    const session = sessions.get(data.sessionId);
    if (!session) return json({ error: '页面演示会话已失效，请新建会话。' }, 404);
    if (locks.has(session.id)) return json({ error: '当前会话正在处理，请稍后。' }, 409);
    if (session.messages.length >= 100) return json({ error: '此演示会话已达消息上限，请新建会话。' }, 429);
    if (!data.action && (typeof data.message !== 'string' || !data.message.trim() || data.message.length > 2000)) return json({ error: '消息需为 1–2000 个字符。' }, 400);
    if (data.action && (!['confirm', 'cancel'].includes(data.action) || typeof data.actionId !== 'string')) return json({ error: '无效的确认操作。' }, 400);
    locks.add(session.id);
    let cancelled = false;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const emit = event => { if (!cancelled) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); };
        void (async () => {
          try { await runTurn(session, { ...data, message: data.message?.trim(), mode: data.mode === 'single' ? 'single' : 'dual' }, emit, { delay }); }
          catch { emit({ type: 'error', error: '演示处理失败，请新建会话重试。' }); }
          finally { locks.delete(session.id); if (!cancelled) controller.close(); }
        })();
      },
      cancel() { cancelled = true; }
    });
    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
  };
}
