import {getStore} from '@netlify/blobs';
import {createApp} from '../../server/core.mjs';
export default async request=>{
 try{return await createApp({store:getStore({name:'optic-v6-data',consistency:'strong'}),media:getStore({name:'optic-v6-media',consistency:'strong'}),env:process.env}).mediaHandle(request);}
 catch{return new Response('Media unavailable',{status:503,headers:{'Cache-Control':'no-store'}});}
};
export const config={path:'/api/media/:key'};
