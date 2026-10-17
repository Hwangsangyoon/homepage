// Local demo only. Never use this HTTP server as a public production server.
import http from 'node:http';import {readFile,mkdir,writeFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {MemoryStore} from '../tests/memory-store.mjs';import {createApp} from '../server/core.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const port=Number(process.env.PORT||8876);
const store=new MemoryStore(),media=new MemoryStore();const env={...process.env,OPTIC_SETUP_KEY:process.env.OPTIC_SETUP_KEY||'LOCAL-ONLY-OPTIC-DEMO-2026'};
const app=createApp({store,media,env});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{try{
 const base=`http://localhost:${port}`,u=new URL(req.url,base);let r;
 if(u.pathname.startsWith('/api/')){const chunks=[];for await(const c of req)chunks.push(c);const request=new Request(u,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});r=u.pathname.startsWith('/api/media/')?await app.mediaHandle(request):await app.handle(request,{ip:'127.0.0.1'});}
 else{const rel=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname);if(!['/index.html','/app.js','/enhancements.css','/v3-base.css','/START_HERE.html'].includes(rel)&&!rel.startsWith('/assets/'))throw new Error('404');const f=path.resolve(root,'.'+rel);if(!f.startsWith(root+path.sep))throw new Error('404');r=new Response(await readFile(f),{headers:{'Content-Type':mime[path.extname(f)]||'application/octet-stream'}});}
 res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));
 }catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local demo: http://localhost:${port}\nInitial password: 1111\nLocal setup code: LOCAL-ONLY-OPTIC-DEMO-2026\nDemo data is memory-only; restarting clears it. Never enter real customer data. Production uses Netlify Blobs.`));
