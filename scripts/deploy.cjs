// Optional Windows/CLI update path. Never hard-code a previous project's ID.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),readline=require('node:readline/promises');
const root=path.resolve(__dirname,'..');process.chdir(root);
const npm=process.platform==='win32'?'npm.cmd':'npm',npx=process.platform==='win32'?'npx.cmd':'npx';
function run(bin,args){const windows=process.platform==='win32';const safe=[bin,...args];if(windows&&safe.some(v=>!/^[A-Za-z0-9_@./:-]+$/.test(v)))throw new Error('Unsafe deployment argument. Stopped.');const r=windows?spawnSync(process.env.ComSpec||'cmd.exe',['/d','/s','/c',safe.join(' ')],{cwd:root,stdio:'inherit',shell:false}):spawnSync(bin,args,{cwd:root,stdio:'inherit',shell:false});if(r.error)throw r.error;if(r.status!==0)throw new Error('Command failed; exit '+r.status);}
(async()=>{const rl=readline.createInterface({input:process.stdin,output:process.stdout});try{
 if(process.argv.includes('--login')){run(npx,['--yes','netlify-cli@latest','login']);return;}
 const production=process.argv.includes('--prod');const file=path.join(root,'SITE_ID.txt');let id=fs.existsSync(file)?fs.readFileSync(file,'utf8').trim():'';
 if(!id){try{id=JSON.parse(fs.readFileSync(path.join(root,'.netlify','state.json'),'utf8')).siteId||'';}catch{}}
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))id=(await rl.question('Existing homepage Netlify Project ID (NOT site URL): ')).trim();
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))throw new Error('Invalid Project ID. Stop without changing any site.');
 console.log('Version 7.1.0 / Existing target Project ID: '+id);console.log('Preview uses the SAME data store as production. Do not delete or import real data during preview.');
 const confirm=production?'UPDATE':'PREVIEW';if((await rl.question('Type '+confirm+' to continue: ')).trim()!==confirm){console.log('Cancelled.');return;}
 fs.writeFileSync(file,id+'\n');run(npm,['install','--no-audit','--no-fund']);run(npm,['run','check']);run(npm,['run','build']);
 run(npx,['--yes','netlify-cli@latest','deploy','--no-build','--site',id,'--dir','dist','--functions','netlify/functions',...(production?['--prod']:[])]);
 console.log('Deployment command finished. Open #diagnostics and test password login, intake and delete/restore.');
 }finally{rl.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
