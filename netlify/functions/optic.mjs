import {getStore} from '@netlify/blobs';
import {createApp} from '../../server/core.mjs';
export default async (request,context)=>{
 try{
  return await createApp({store:getStore({name:'optic-v6-data',consistency:'strong'}),media:getStore({name:'optic-v6-media',consistency:'strong'}),env:process.env}).handle(request,context);
 }catch(e){console.error(JSON.stringify({code:'BLOBS_INIT',name:e.name}));return Response.json({ok:false,code:'BLOBS_INIT',message:'Netlify 데이터 저장소 연결이 필요합니다. GitHub 연결 빌드로 Functions까지 배포해 주세요.'},{status:503,headers:{'Cache-Control':'no-store'}});}
};
export const config={path:'/api/optic',rateLimit:{windowLimit:120,windowSize:60,aggregateBy:['ip','domain']}};
