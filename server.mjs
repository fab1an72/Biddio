import http from 'node:http';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createEngine} from './game-server.mjs';
const root=fileURLToPath(new URL('.',import.meta.url)),engine=createEngine(),rates=new Map();
const files={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/data.js':'data.js','/style.css':'style.css','/online.js':'online.js'};
const server=http.createServer(async(req,res)=>{const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};try{
const url=new URL(req.url,'http://localhost');
if(url.pathname.startsWith('/api/')){
 const ip=req.socket.remoteAddress,time=Date.now();if(rates.size>10000)for(const [key,v]of rates)if(time-v.time>60000)rates.delete(key);let rate=rates.get(ip);if(!rate||time-rate.time>60000){rate={time,count:0};rates.set(ip,rate)}if(++rate.count>600)return json(429,{error:'Zu viele Anfragen. Bitte kurz warten.'});
 if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(403,{error:'Fremder Ursprung nicht erlaubt.'});
 if(req.method==='GET'&&url.pathname==='/api/state')return json(200,engine.get(url.searchParams.get('code'),req.headers.authorization?.replace(/^Bearer /,'')));
 if(req.method!=='POST')return json(405,{error:'Methode nicht erlaubt.'});
 if(!String(req.headers['content-type']||'').startsWith('application/json'))return json(415,{error:'JSON erwartet.'});
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return json(413,{error:'Anfrage zu groß.'})}let b;try{b=JSON.parse(raw)}catch{return json(400,{error:'Ungültige Anfrage.'})}if(!b||typeof b!=='object'||Array.isArray(b))return json(400,{error:'Ungültige Anfrage.'});
 if(url.pathname==='/api/create')return json(200,engine.create(b.name));if(url.pathname==='/api/join')return json(200,engine.join(b.code,b.name));if(url.pathname==='/api/action')return json(200,engine.act(b.code,req.headers.authorization?.replace(/^Bearer /,''),b.action,b));return json(404,{error:'Nicht gefunden.'});
}
if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end()}const file=files[url.pathname];if(!file){res.writeHead(404);return res.end('Nicht gefunden')}const data=await fs.readFile(root+file);res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Referrer-Policy':'same-origin'});res.end(req.method==='HEAD'?undefined:data);
}catch(e){json(e.status||500,{error:e.status?e.message:'Serverfehler. Bitte noch einmal versuchen.'})}});
server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Biddio läuft auf Port '+(process.env.PORT||3000)));
