/** Bound remote storage operations. A timeout never implies that a write was rolled back. */
export class StorageError extends Error {
  constructor(){super('저장소 응답이 지연되고 있습니다. 입력내용은 유지되며, 같은 신청을 재확인할 수 있습니다.');this.status=504;this.code='STORAGE_TIMEOUT';}
}
function timed(p,ms){let timer;return Promise.race([Promise.resolve(p),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new StorageError()),ms);})]).finally(()=>clearTimeout(timer));}
export function boundedStore(target,ms=8000){
  return new Proxy(target,{get(t,k){
    if(k==='list')return(options={})=>{
      if(!options.paginate)return timed(t.list(options),ms);
      return (async function*(){const iterator=t.list(options)[Symbol.asyncIterator]();try{while(true){const n=await timed(iterator.next(),ms);if(n.done)break;yield n.value;}}finally{if(iterator.return)await iterator.return();}})();
    };
    const v=t[k];if(typeof v!=='function')return v;return(...args)=>timed(v.apply(t,args),ms);
  }});
}
