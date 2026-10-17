// LOCAL DEMO ONLY. Loopback, ephemeral memory; no real email/SMS or production data.
import http from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';import {fileURLToPath} from 'node:url';
import {MemoryStore} from '../tests/memory-store.mjs';import {createApp} from '../server/core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=Number(process.env.PORT||8877);
const store=new MemoryStore(),media=new MemoryStore();
const app=createApp({store,media,env:{OPTIC_ADMIN_PASSWORD:'LocalDemo-Only2026'},fetcher:async()=>{throw new Error('External sending is disabled in the local demo.');}});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{try{
 const base=`http://127.0.0.1:${port}`,u=new URL(req.url,base);let r;
 if(u.pathname.startsWith('/api/')){const chunks=[];for await(const c of req)chunks.push(c);const request=new Request(u,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});r=u.pathname.startsWith('/api/media/')?await app.mediaHandle(request):await app.handle(request,{ip:'127.0.0.1'});}
 else{const rel=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname);if(!['/index.html','/app.js','/enhancements.css','/v3-base.css','/START_HERE.html'].includes(rel)&&!rel.startsWith('/assets/'))throw new Error('404');const f=path.resolve(root,'.'+rel);if(!f.startsWith(root+path.sep))throw new Error('404');let content=await readFile(f);if(rel==='/index.html')content=Buffer.from(content.toString().replace('<body>','<body><div style="background:#fff1d4;color:#433218;text-align:center;padding:8px">로컬 데모 · 실제 이메일/문자 발송 없음 · 고객정보 입력 금지</div>'));r=new Response(content,{headers:{'Content-Type':mime[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'}});}
 res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));
 }catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`LOCAL demo: http://127.0.0.1:${port}\nDemo password: LocalDemo-Only2026 (LOCAL TEST ONLY). No emails. Data disappears on restart. No server keys required for this demo.`));
