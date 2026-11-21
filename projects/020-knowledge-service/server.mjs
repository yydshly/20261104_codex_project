import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, resolve, sep } from 'node:path';
import { createSession, publicSession, runTurn, runEvaluation } from './src/engine.mjs';
import { documents, scenarios, tools, architectureNodes, evaluationCases } from './src/data.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), 'public');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg' };
const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };

async function body(req) {
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (Buffer.byteLength(text) > 16_384) throw new Error('请求内容过长');
  }
  return text ? JSON.parse(text) : {};
}

export function createAppServer() {
  const sessions = new Map();
  const locks = new Set();
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const allowedHost = /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host ?? '');
    if (!allowedHost) return json(res, 403, { error: '仅允许本机访问' });
    if (req.method === 'POST' && req.headers.origin && req.headers.origin !== url.origin) return json(res, 403, { error: '不允许跨站请求' });
    try {
      if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { ok: true, mode: 'local-demo' });
      if (req.method === 'GET' && url.pathname === '/api/catalog') return json(res, 200, { documents, scenarios, tools, nodes: architectureNodes, cases: evaluationCases });
      if (req.method === 'POST' && url.pathname === '/api/sessions') {
        for (const [id, s] of sessions) if (Date.now() - s.createdAt > 43_200_000 && !locks.has(id)) sessions.delete(id);
        if (sessions.size >= 500) return json(res, 429, { error: '演示会话已达上限，请重启本地服务。' });
        const s = createSession(); sessions.set(s.id, s); return json(res, 201, publicSession(s));
      }
      if (req.method === 'GET' && url.pathname.startsWith('/api/sessions/')) {
        const s = sessions.get(url.pathname.split('/').at(-1));
        return s ? json(res, 200, publicSession(s)) : json(res, 404, { error: '会话已失效，请新建会话。' });
      }
      if (req.method === 'POST' && url.pathname === '/api/evaluate') {
        const data = await body(req);
        return json(res, 200, await runEvaluation(data.mode === 'single' ? 'single' : 'dual'));
      }
      if (req.method === 'POST' && url.pathname === '/api/chat') {
        const data = await body(req);
        const session = sessions.get(data.sessionId);
        if (!session) return json(res, 404, { error: '会话已失效，请新建会话。' });
        if (locks.has(session.id)) return json(res, 409, { error: '当前会话正在处理，请稍后。' });
        if (session.messages.length >= 100) return json(res, 429, { error: '此演示会话已达消息上限，请新建会话。' });
        if (!data.action && (typeof data.message !== 'string' || !data.message.trim() || data.message.length > 2000)) return json(res, 400, { error: '消息需为 1–2000 个字符。' });
        if (data.action && (!['confirm', 'cancel'].includes(data.action) || typeof data.actionId !== 'string')) return json(res, 400, { error: '无效的确认操作。' });
        locks.add(session.id);
        res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });
        try {
          await runTurn(session, { ...data, message: data.message?.trim(), mode: data.mode === 'single' ? 'single' : 'dual' }, event => { if (!res.destroyed) res.write(`${JSON.stringify(event)}\n`); }, { delay: process.env.NODE_ENV === 'test' ? 0 : 100 });
        } catch {
          if (!res.destroyed) res.write(`${JSON.stringify({ type: 'error', error: '处理失败，请新建会话重试。' })}\n`);
        } finally { locks.delete(session.id); res.end(); }
        return;
      }
      if (url.pathname.startsWith('/api/')) return json(res, 404, { error: '接口不存在' });
      if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: '不支持的方法' });
      const path = resolve(root, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`);
      if (!path.startsWith(root + sep)) return json(res, 403, { error: '不可访问此路径' });
      const file = await readFile(path);
      res.writeHead(200, { 'Content-Type': mime[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : file);
    } catch (error) {
      if (res.headersSent) return res.end();
      json(res, error.code === 'ENOENT' ? 404 : 400, { error: error.code === 'ENOENT' ? '页面不存在' : '请求格式无效' });
    }
  });
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5216);
  const server = createAppServer();
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `端口 ${port} 已被使用，请通过 PORT 指定其他端口。` : error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Support Flow Lab\nLocal: http://127.0.0.1:${port}/\n本地演示 · 无模型 API · 无真实业务写入`));
}
