/** v7.1: a single password, checked only on the server. No email provider required.
 * Netlify project owner supplies OPTIC_ADMIN_PASSWORD for initial ownership proof.
 * Stored password changes do not re-enable the consumed bootstrap password.
 * To recover, the project owner supplies a NEW environment password and redeploys.
 * Retired bootstrap fingerprints prevent replay from older deployments.
 */
import {randomBytes,randomUUID,createHash,createHmac,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export class AuthError extends Error {
  constructor(status,code,message){super(message);this.status=status;this.code=code;}
}
const fail=(status,code,message)=>{throw new AuthError(status,code,message);};
const hash=v=>createHash('sha256').update(String(v)).digest('hex');
const equal=(a,b)=>timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b)));
const ADMIN='auth71/admin', SESSION='sessions71/', COOKIE='optic71_session', TTL=8*60*60*1000;
const PASSWORD_RE=/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/;
export const validAdminPassword=p=>typeof p==='string'&&p.length>=12&&p.length<=128&&/[A-Za-z]/.test(p)&&/[0-9]/.test(p)&&!/[\s\x00-\x1f\x7f]/.test(p)&&!['password1234','Password1234','1234567890ab','abcdefghijkl1'].includes(p);
async function encode(p){const salt=randomBytes(16).toString('hex');const key=await scrypt(p,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});return `scrypt:${salt}:${key.toString('hex')}`;}
async function verify(p,h){if(typeof p!=='string'||p.length>128||!PASSWORD_RE.test(h||''))return false;const [,salt,k]=h.split(':');const key=await scrypt(p,salt,64,{N:16384,r:8,p:1,maxmem:64*1024*1024});return timingSafeEqual(key,Buffer.from(k,'hex'));}
export function createPasswordAuth({store,env={},clock=Date.now,limit,json}){
  const now=()=>clock(), iso=()=>new Date(now()).toISOString();
  const get=k=>store.getWithMetadata(k,{type:'json'});
  const initial=()=>String(env.OPTIC_ADMIN_PASSWORD||'');
  const status=()=>({mode:'password',bootstrapConfigured:validAdminPassword(initial()),configured:validAdminPassword(initial()),externalMailRequired:false});
  const activated=async()=>PASSWORD_RE.test((await get(ADMIN))?.data?.passwordHash||'');
  async function privateSecret(){
    const key='auth71/private-hmac';let r=await get(key);if(r?.data?.key)return r.data.key;
    await store.setJSON(key,{key:randomBytes(32).toString('hex')},{onlyIfNew:true});r=await get(key);
    if(!r?.data?.key)fail(503,'AUTH_STORAGE','관리자 인증 저장소 응답을 확인하지 못했습니다. 연결 진단을 확인해 주세요.');return r.data.key;
  }
  async function fingerprint(value){return createHmac('sha256',await privateSecret()).update(String(value)).digest('hex');}
  function cookieToken(req){const prefix=COOKIE+'=';return(req.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(prefix))?.slice(prefix.length)||'';}
  function cookieHeader(req,token,seconds=TTL/1000){return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
  async function session(req,required=false){
    let result=null;const t=cookieToken(req);
    if(/^[a-f0-9]{64}$/.test(t)){
      const [s,a]=await Promise.all([get(SESSION+hash(t)),get(ADMIN)]);
      if(s&&a&&s.data.expiresAt>now()&&s.data.generation===a.data.generation&&PASSWORD_RE.test(a.data.passwordHash||''))result={isDefault:false,generation:a.data.generation,authMode:'password'};
    }
    if(!result&&required)fail(401,'LOGIN_REQUIRED','관리자 비밀번호로 로그인해 주세요. 로그인이 만료되었을 수 있습니다.');return result;
  }
  async function issue(req,a,extra={}){
    const token=randomBytes(32).toString('hex');
    const saved=await store.setJSON(SESSION+hash(token),{generation:a.generation,expiresAt:now()+TTL,createdAt:iso()},{onlyIfNew:true});
    if(!saved.modified)fail(503,'SESSION_CREATE','로그인을 저장하지 못했습니다. 다시 시도해 주세요.');
    return json({ok:true,authenticated:true,isDefault:false,authMode:'password',...extra},200,{'Set-Cookie':cookieHeader(req,token)});
  }
  async function login(req,data,context){
    await limit(req,'password-login71',15,600,context);
    const p=data.password;
    if(typeof p!=='string'||!p||p.length>128)fail(400,'PASSWORD_INPUT','관리자 비밀번호를 입력해 주세요.');
    let old=await get(ADMIN);
    if(old&&PASSWORD_RE.test(old.data.passwordHash||'')&&await verify(p,old.data.passwordHash))return issue(req,old.data);
    const boot=initial();
    if(!old&&!validAdminPassword(boot))fail(503,'ADMIN_PASSWORD_NOT_SET','처음 한 번 Netlify에 OPTIC_ADMIN_PASSWORD를 등록하고 다시 배포해 주세요. 영문·숫자를 포함한 12~128자입니다. 이메일 인증은 사용하지 않습니다.');
    if(!validAdminPassword(boot)||!equal(p,boot))fail(401,'PASSWORD_INCORRECT','비밀번호가 일치하지 않습니다. 다시 입력해 주세요.');
    const envFingerprint=await fingerprint(boot);
    for(let i=0;i<5;i++){
      old=await get(ADMIN);
      if(old){
        if(await verify(p,old.data.passwordHash))return issue(req,old.data);
        if(old.data.envFingerprint===envFingerprint||(old.data.retiredEnvFingerprints||[]).includes(envFingerprint))fail(401,'PASSWORD_INCORRECT','비밀번호가 일치하지 않습니다. 관리자 화면에서 변경한 비밀번호를 입력해 주세요.');
      }
      const a={passwordHash:await encode(p),generation:randomUUID(),envFingerprint,
        retiredEnvFingerprints:[...new Set([...(old?.data.retiredEnvFingerprints||[]),...(old?.data.envFingerprint?[old.data.envFingerprint]:[])])],
        createdAt:old?.data.createdAt||iso(),updatedAt:iso(),changedBy:old?'owner-environment-recovery':'first-login'};
      if(a.retiredEnvFingerprints.length>1000)fail(503,'AUTH_HISTORY_LIMIT','관리자 복구 이력이 많습니다. 운영자 점검이 필요합니다.');
      const saved=await store.setJSON(ADMIN,a,old?{onlyIfMatch:old.etag}:{onlyIfNew:true});
      if(saved.modified)return issue(req,a,{firstLogin:!old,recovered:!!old});
    }
    fail(409,'AUTH_CONFLICT','다른 로그인 요청이 처리 중입니다. 다시 한 번 시도해 주세요.');
  }
  async function changePassword(req,data,context){
    const s=await session(req,true);await limit(req,'password-change71',8,600,context);
    if(!validAdminPassword(data.newPassword))fail(400,'PASSWORD_WEAK','새 비밀번호는 공백 없이 영문·숫자를 포함한 12~128자로 입력해 주세요.');
    if(data.newPassword!==data.confirmPassword)fail(400,'PASSWORD_CONFIRM','새 비밀번호와 확인 입력이 다릅니다.');
    const old=await get(ADMIN);
    if(!old||old.data.generation!==s.generation)fail(401,'LOGIN_REQUIRED','로그인이 변경되었습니다. 다시 로그인해 주세요.');
    if(!await verify(data.currentPassword,old.data.passwordHash))fail(401,'CURRENT_PASSWORD_INCORRECT','현재 비밀번호가 일치하지 않습니다.');
    if(equal(data.newPassword,data.currentPassword))fail(400,'PASSWORD_SAME','현재와 다른 새 비밀번호를 입력해 주세요.');
    const forbidden=(old.data.retiredEnvFingerprints||[]).includes(await fingerprint(data.newPassword));
    if(forbidden)fail(400,'PASSWORD_REUSED','과거 복구용 비밀번호는 다시 사용하지 마세요. 새로운 값을 입력해 주세요.');
    const a={...old.data,passwordHash:await encode(data.newPassword),generation:randomUUID(),updatedAt:iso(),changedBy:'administrator'};
    const written=await store.setJSON(ADMIN,a,{onlyIfMatch:old.etag});
    if(!written.modified)fail(409,'AUTH_CONFLICT','다른 변경이 있습니다. 새로 로그인 후 확인해 주세요.');
    return issue(req,a,{message:'비밀번호를 변경했습니다. 다른 기기의 로그인은 종료됩니다.'});
  }
  async function logout(req){const t=cookieToken(req);if(/^[a-f0-9]{64}$/.test(t))await store.delete(SESSION+hash(t));return json({ok:true},200,{'Set-Cookie':cookieHeader(req,'',0)});}
  async function logoutAll(req){await session(req,true);const old=await get(ADMIN);const saved=await store.setJSON(ADMIN,{...old.data,generation:randomUUID()},{onlyIfMatch:old.etag});if(!saved.modified)fail(409,'AUTH_CONFLICT','다른 변경이 있습니다. 다시 시도해 주세요.');return logout(req);}
  return {status,activated,session,login,changePassword,logout,logoutAll,fingerprint};
}
