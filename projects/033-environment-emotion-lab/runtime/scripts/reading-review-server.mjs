import http from 'node:http';
import {createReadStream} from 'node:fs';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// A temporary loopback-only review server. It accepts only this scene's named QA artifacts.
const root=fileURLToPath(new URL('../',import.meta.url));let lastReport=null;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.webm':'audio/webm'};
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
 if(pathname==='/__reading_review__/latest'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(lastReport));return;}
 if(pathname==='/__reading_review__/revision'&&req.method==='GET'){const files=['reading-world.js','reading-walk.js','reading-space.js','reading-audio.js','reading-review.js','reading-room-shell.js','reading-garden.js','reading-pond.js'];const changes=await Promise.all(files.map(file=>stat(path.join(root,file)).then(s=>s.mtimeMs)));res.writeHead(200,{'Content-Type':'text/plain','Cache-Control':'no-store'});res.end(changes.join(','));return;}
 if(pathname==='/__reading_review__/artifact'&&req.method==='POST'){
  const origin=req.headers.origin;if(origin&&!['http://localhost:','http://127.0.0.1:'].some(p=>origin===p+server.address().port)){res.writeHead(403);res.end();return;}
  const run=url.searchParams.get('run'),name=url.searchParams.get('name');if(!/^[a-z0-9-]{1,60}$/.test(run||'')||!/^([a-z0-9-]{1,50}\.png|sound\.webm|report\.json|progress\.json)$/.test(name||'')){res.writeHead(400);res.end();return;}
  let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>16*1024*1024)throw Error('Artifact too large');chunks.push(chunk);}
  const data=Buffer.concat(chunks),folder=path.join(root,'docs','reading-v7-live-review',run);await mkdir(folder,{recursive:true});
  if(name.endsWith('.json'))JSON.parse(data.toString());await writeFile(path.join(folder,name),data);
  if(name==='report.json'||name==='progress.json')lastReport={run,name,path:path.join(folder,name),report:JSON.parse(data.toString())};
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({saved:true,run,name}));return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/reading.html':pathname));if(!file.toLowerCase().startsWith(root.toLowerCase())){res.writeHead(403);res.end();return;}
 const info=await stat(file);if(!info.isFile())throw Error('Not a file');res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-store'});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
 }catch(error){res.writeHead(400,{'Content-Type':'text/plain'});res.end(String(error.message));}});
server.listen(Number(process.env.READING_REVIEW_PORT)||0,'127.0.0.1',()=>console.log('Reading review: http://localhost:'+server.address().port+'/reading.html?v=7&qa=walk'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
