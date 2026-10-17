import {randomUUID} from 'node:crypto';
import {createApp} from '../server/core.mjs';
import {MemoryStore} from './memory-store.mjs';
export const OWNER='owner@example.test';
export function fixture(overrides={}){
 const store=new MemoryStore(),media=new MemoryStore();let time=Date.now(),cookie='';const fetches=[],mails=[];
 const env={OPTIC_ADMIN_EMAIL:OWNER,RESEND_API_KEY:'test-api-key-only',...overrides.env};
 const make=()=>createApp({store,media,env,clock:()=>time,fetcher:overrides.fetcher||asyncFetcher,sendMail:overrides.useProvider?undefined:async m=>{mails.push(m);},logger:{error(){}}});
 async function asyncFetcher(...args){fetches.push(args);return Response.json({groupInfo:{groupId:'G-test'}});}
 const app=make();
 async function req(action,data,extra={}){
  const u=new URL('https://optic.example/api/optic');u.searchParams.set('action',action);for(const[k,v]of Object.entries(extra.query||{}))u.searchParams.set(k,v);
  const headers={...(data===undefined?{}:{'Content-Type':'application/json',Origin:'https://optic.example'}),...(cookie?{Cookie:cookie}:{}),...extra.headers};
  const r=await app.handle(new Request(u,{method:extra.method||(data===undefined?'GET':'POST'),headers,...(data===undefined?{}:{body:JSON.stringify(data)})}),{ip:extra.ip||'127.0.0.1'});
  const sc=r.headers.get('set-cookie');if(sc)cookie=sc.split(';')[0];return {status:r.status,body:await r.json(),headers:r.headers};
 }
 async function owner(){const d=await req('otp-request',{email:env.OPTIC_ADMIN_EMAIL});if(!d.body.ok)throw new Error(JSON.stringify(d.body));const m=mails.at(-1);return req('otp-verify',{email:env.OPTIC_ADMIN_EMAIL,code:m.code,challengeId:d.body.challengeId});}
 async function open(){await owner();return req('settings-save',{etag:null,settings:{privacyReviewed:true,acceptingPosts:true,privacyText:'테스트 개인정보 안내'}});}
 const post=(extra={})=>({requestKey:randomUUID(),kind:'consult',title:'착용 상담을 신청합니다',name:'테스트고객',phone:'01012345678',content:'비공개 문의내용',password:'글비밀번호123',consent:true,...extra});
 return {app,store,media,env,req,owner,open,post,fetches,mails,cookie:()=>cookie,setTime:t=>time=t,time:()=>time,advance:t=>time+=t,logout:()=>req('logout',{}),newApp:make};
}
