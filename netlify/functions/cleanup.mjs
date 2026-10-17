import {getStore} from '@netlify/blobs';
import {createApp} from '../../server/core.mjs';
export default async()=>{const result=await createApp({store:getStore({name:'optic-v6-data',consistency:'strong'}),media:getStore({name:'optic-v6-media',consistency:'strong'}),env:process.env}).cleanup();return Response.json(result);};
export const config={schedule:'17 19 * * *'};
