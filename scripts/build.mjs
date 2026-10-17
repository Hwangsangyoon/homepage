import {mkdir,rm,copyFile,cp,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
for(const name of ['index.html','app.js','enhancements.css','v3-base.css'])await copyFile(path.join(root,name),path.join(dist,name));
await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
console.log('Public build ready: index.html / app.js / styles / assets only. No SQL, secret, guide, or server files published.');
