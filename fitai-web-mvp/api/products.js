export const config={runtime:"nodejs"};
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=v=>String(v??"").trim().slice(0,180);
export default async function handler(req){
  if(req.method!=="GET")return json({error:"Method not allowed"},405);
  const u=new URL(req.url);const q=clean(u.searchParams.get("q"));const limit=Math.min(10,Math