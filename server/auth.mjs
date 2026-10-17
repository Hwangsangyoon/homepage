/** Owner-only email OTP. No browser secret, password, or magic-link redirect required. */
import { randomBytes, randomInt, randomUUID, createHash, createHmac, timingSafeEqual } from 'node:crypto';
export class AuthError extends Error {
  constructor(status, code, message) { super(message); this.status=status; this.code=code; }
}
const fail=(s,c,m)=>{throw new AuthError(s,c,m);};
const hash=v=>createHash('sha256').update(String(v)).digest('hex');
const equal=(a,b)=>timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b)));
const normalize=v=>String(v||'').trim().toLowerCase();
const emailOK=v=>v.length<=254&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v);
const OTP_TTL=10*60*1000, COOLDOWN=60*1000, MAX_ATTEMPTS=5, SESSION_TTL=8*60*60*1000;
export function createEmailAuth({store,env,fetcher,clock,limit,json,sendMail}) {
  const now=()=>clock(), iso=()=>new Date(now()).toISOString();
  const owner=()=>normalize(env.OPTIC_ADMIN_EMAIL);
  const ready=()=>emailOK(owner())&&!!String(env.RESEND_API_KEY||'').trim();
  const status=()=>({mode:'email-otp',ownerEmailConfigured:emailOK(owner()),mailKeyConfigured:!!String(env.RESEND_API_KEY||'').trim(),configured:ready()});
  const get=key=>store.getWithMetadata(key,{type:'json'});
  async function secret(){
    const key='auth7/private-hmac';let r=await get(key);if(r)return r.data.key;
    await store.setJSON(key,{key:randomBytes(32).toString('hex')},{onlyIfNew:true});r=await get(key);
    if(!r)fail(503,'AUTH_STORAGE','인증 저장소를 확인할 수 없습니다. 연결 진단을 확인해 주세요.');return r.data.key;
  }
  async function fingerprint(value){return createHmac('sha256',await secret()).update(value).digest('hex');}
  const cookie=req=>(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('optic7_session='))?.slice(15)||'';
  const cookieValue=(req,token,maxAge=SESSION_TTL/1000)=>`optic7_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(req.url).protocol==='https:'?'; Secure':''}`;
  async function session(req,required=false){
    const token=cookie(req);let result=null;
    if(/^[a-f0-9]{64}$/.test(token)&&emailOK(owner())){
      const [s,a]=await Promise.all([get('sessions7/'+hash(token)),get('auth7/admin')]);
      if(s&&a&&s.data.expiresAt>now()&&s.data.emailHash===hash(owner())&&s.data.generation===a.data.generation&&a.data.emailHash===hash(owner()))result={email:owner(),isDefault:false,generation:a.data.generation};
    }
    if(!result&&required)fail(401,'LOGIN_REQUIRED','로그인이 만료되었습니다. 이메일 인증번호로 다시 로그인해 주세요.');return result;
  }
  async function activated(){const a=await get('auth7/admin');return !!a&&a.data.emailHash===hash(owner());}
  async function adminRecord(){
    for(let i=0;i<5;i++){const old=await get('auth7/admin');if(old?.data.emailHash===hash(owner()))return old.data;
      const row={emailHash:hash(owner()),generation:randomUUID(),createdAt:iso()};
      const r=await store.setJSON('auth7/admin',row,old?{onlyIfMatch:old.etag}:{onlyIfNew:true});if(r.modified)return row;
    }fail(409,'AUTH_CONFLICT','다른 인증 요청이 처리 중입니다. 잠시 후 다시 시도해 주세요.');
  }
  async function requestCode(req,data,context){
    if(!emailOK(owner()))fail(503,'OWNER_EMAIL_MISSING','최초 1회 Netlify에 OPTIC_ADMIN_EMAIL을 등록한 뒤 다시 배포해 주세요.');
    if(!ready())fail(503,'MAIL_KEY_MISSING','인증메일 연결이 필요합니다. Netlify의 RESEND_API_KEY를 등록한 뒤 다시 배포해 주세요.');
    const email=normalize(data.email);if(!emailOK(email))fail(400,'EMAIL_FORMAT','이메일 주소를 확인해 주세요.');
    await limit(req,'otp-request-ip',8,600,context);
    const generic={ok:true,challengeId:randomUUID(),expiresIn:600,resendAfter:60,message:'등록된 관리자 이메일이면 인증번호를 발송합니다. 가장 최근 메일의 6자리 번호를 입력해 주세요.'};
    if(!equal(email,owner()))return json(generic);
    // Global owner rate limit remains effective even if an attacker changes IP addresses.
    await limit(req,'otp-owner-hour',6,3600,{ip:'owner-'+hash(owner())});
    const key='otp7/'+hash(email),old=await get(key);
    if(old&&now()-old.data.sentAt<COOLDOWN)fail(429,'OTP_COOLDOWN','인증번호는 60초 간격으로 요청할 수 있습니다. 잠시 후 다시 시도해 주세요.');
    const id=randomUUID(),code=String(randomInt(0,1000000)).padStart(6,'0');
    const row={id,emailHash:hash(email),codeHash:await fingerprint(id+':'+code),sentAt:now(),expiresAt:now()+OTP_TTL,attempts:0,state:'sending'};
    const claimed=await store.setJSON(key,row,old?{onlyIfMatch:old.etag}:{onlyIfNew:true});
    if(!claimed.modified)fail(429,'OTP_COOLDOWN','다른 발송 요청이 처리 중입니다. 잠시 후 다시 시도해 주세요.');
    try{
      const from=String(env.OPTIC_FROM_EMAIL||'SMART OPTIC <onboarding@resend.dev>').trim();
      if(/[\r\n]/.test(from))fail(503,'MAIL_FROM','발신자 이메일 설정을 확인해 주세요.');
      const mail={from,to:[email],subject:'[스마트옵틱] 관리자 로그인 인증번호',text:`관리자 로그인 인증번호: ${code}\n\n10분 동안 유효하며 한 번만 사용할 수 있습니다.\n요청하지 않았다면 이 메일을 무시해 주세요. 인증번호를 타인에게 전달하지 마세요.`};
      if(sendMail)await sendMail({...mail,code,challengeId:id});
      else {
        const res=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${String(env.RESEND_API_KEY).trim()}`,'Content-Type':'application/json','Idempotency-Key':'optic-otp-'+id},body:JSON.stringify(mail),signal:AbortSignal.timeout(10000)});
        const result=await res.json().catch(()=>({}));
        if(!res.ok||!result.id){
          if(res.status===401||result.name==='invalid_api_key')fail(503,'MAIL_KEY_INVALID','인증메일 API 키가 올바르지 않습니다. Netlify의 RESEND_API_KEY를 확인해 주세요.');
          if(res.status===403)fail(503,'MAIL_SENDER_VERIFY','발신 도메인 인증 또는 테스트 수신자 제한을 확인해 주세요. 테스트 발신자는 Resend 가입 이메일로만 수신할 수 있습니다.');
          if(res.status===429)fail(429,'MAIL_LIMIT','메일 서비스 발송 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.');
          fail(502,'MAIL_PROVIDER','메일 발송업체가 요청을 완료하지 못했습니다. 연결 진단과 발송업체 기록을 확인해 주세요.');
        }
      }
      const r=await store.setJSON(key,{...row,state:'sent'},{onlyIfMatch:claimed.etag});
      if(!r.modified)fail(409,'OTP_REPLACED','다른 발송 요청이 있었습니다. 가장 최근 인증번호를 사용해 주세요.');
    }catch(e){
      const current=await get(key);if(current?.data.id===id)await store.setJSON(key,{...current.data,state:'failed',codeHash:''},{onlyIfMatch:current.etag});
      if(e instanceof AuthError)throw e;
      fail(502,'MAIL_NETWORK','인증메일 전송을 확인하지 못했습니다. 60초 후 새 번호를 요청해 주세요.');
    }
    return json({...generic,challengeId:id});
  }
  async function verify(req,data,context){
    await limit(req,'otp-verify-ip',25,600,context);
    const email=normalize(data.email),id=String(data.challengeId||''),code=String(data.code||'').trim();
    if(!emailOK(email)||!equal(email,owner())||!/^[0-9]{6}$/.test(code)||!/^[a-f0-9-]{36}$/.test(id))fail(401,'OTP_INVALID','이메일과 인증번호를 확인해 주세요.');
    const key='otp7/'+hash(email);
    for(let i=0;i<6;i++){
      const old=await get(key),r=old?.data;
      if(!r||r.id!==id||r.state!=='sent'||r.expiresAt<=now())fail(401,'OTP_EXPIRED','번호가 만료되었거나 이미 사용되었습니다. 새 인증번호를 받아 주세요.');
      if(r.attempts>=MAX_ATTEMPTS)fail(429,'OTP_LOCKED','인증번호를 5회 잘못 입력했습니다. 새 인증번호를 받아 주세요.');
      const matches=equal(await fingerprint(id+':'+code),r.codeHash);
      const out=await store.setJSON(key,{...r,attempts:r.attempts+1,...(matches?{state:'used',codeHash:'',usedAt:now()}: {})},{onlyIfMatch:old.etag});
      if(!out.modified)continue;
      if(!matches)fail(401,'OTP_INVALID',`인증번호가 일치하지 않습니다. 남은 입력 기회: ${MAX_ATTEMPTS-r.attempts-1}회`);
      const a=await adminRecord(),token=randomBytes(32).toString('hex');
      await store.setJSON('sessions7/'+hash(token),{emailHash:hash(email),generation:a.generation,expiresAt:now()+SESSION_TTL,createdAt:iso()},{onlyIfNew:true});
      return json({ok:true,authenticated:true,email,isDefault:false},200,{'Set-Cookie':cookieValue(req,token)});
    }
    fail(409,'AUTH_CONFLICT','중복 인증 요청이 처리되었습니다. 다시 로그인해 주세요.');
  }
  async function logout(req){const t=cookie(req);if(/^[a-f0-9]{64}$/.test(t))await store.delete('sessions7/'+hash(t));return json({ok:true},200,{'Set-Cookie':cookieValue(req,'',0)});}
  async function logoutAll(req){await session(req,true);const a=await get('auth7/admin');const r=await store.setJSON('auth7/admin',{...a.data,generation:randomUUID()},{onlyIfMatch:a.etag});if(!r.modified)fail(409,'AUTH_CONFLICT','다른 변경이 있습니다. 다시 시도해 주세요.');return logout(req);}
  return {status,activated,session,requestCode,verify,logout,logoutAll,fingerprint};
}
