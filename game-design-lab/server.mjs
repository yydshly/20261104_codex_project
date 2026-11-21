import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 5214);
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.json':'application/json' };
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    if (!(await stat(file)).isFile()) throw new Error('not found');
    const data=await readFile(file); res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}); res.end(data);
  } catch { res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}); res.end('Not found'); }
});
server.on('error',error=>{ console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Set PORT to another local port.`:error.message); process.exitCode=1; });
server.listen(port,'127.0.0.1',()=>console.log(`PLAY / FORM Local: http://127.0.0.1:${server.address().port}/`));
