export class MemoryStore{
 constructor(){this.rows=new Map();this.rev=0;}
 async getWithMetadata(k,{type='json'}={}){const r=this.rows.get(k);if(!r)return null;let data=type==='arrayBuffer'?r.bytes.buffer.slice(r.bytes.byteOffset,r.bytes.byteOffset+r.bytes.byteLength):structuredClone(r.data);return {data,etag:r.etag,metadata:r.metadata||{}};}
 async get(k){return (await this.getWithMetadata(k))?.data??null;}
 async setJSON(k,data,opts={}){const old=this.rows.get(k);if(opts.onlyIfNew&&old||opts.onlyIfMatch&&old?.etag!==opts.onlyIfMatch)return {modified:false};const etag=String(++this.rev);this.rows.set(k,{data:structuredClone(data),etag,metadata:opts.metadata});return {modified:true,etag};}
 async set(k,bytes,opts={}){const r=await this.setJSON(k,null,opts);if(r.modified)this.rows.get(k).bytes=Buffer.from(bytes);return r;}
 async delete(k){this.rows.delete(k);}
 list({prefix='',paginate=false}={}){const result={blobs:[...this.rows.keys()].filter(k=>k.startsWith(prefix)).sort().map(key=>({key})),directories:[]};return paginate?(async function*(){yield result;})():Promise.resolve(result);}
}
