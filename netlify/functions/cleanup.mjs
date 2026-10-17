import {getStore} from '@netlify/blobs';
import {createApp} from '../../server/core.mjs';
export default async()=>{
  const app=createApp({store:getStore({name:'optic-v6-data',consistency:'strong'}),media:getStore({name:'optic-v6-media',consistency:'strong'}),env:process.env});
  try{const result=await app.dailyMaintenance();console.log(JSON.stringify({task:'daily-data-backup',...result}));return Response.json({ok:true});}
  catch(e){console.error(JSON.stringify({task:'daily-data-backup',code:e.code||'MAINTENANCE_ERROR'}));throw new Error('Daily backup did not complete; check admin status and Netlify logs.');}
};
// UTC 19:17 = Korea 04:17. Production schedule only. Not an inactivity bypass.
export const config={schedule:'17 19 * * *'};
