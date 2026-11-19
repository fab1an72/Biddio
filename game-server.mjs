import { randomBytes } from 'node:crypto';
import { categories } from './server-data.mjs';
export const normalize=s=>s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/ae/g,'a').replace(/oe/g,'o').replace(/ue/g,'u').replace(/[^a-z0-9]/g,'');
const secret=()=>randomBytes(24).toString('hex');
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=randomBytes(4).readUInt32BE()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
export function createEngine(now=()=>Date.now()){
 const rooms=new Map(),ttl=2*60*60*1000;const fail=(msg,status=400)=>{throw Object.assign(new Error(msg),{status})};
 function name(s){if(typeof s!=='string'||!s.trim()||s.trim().length>20)fail('Bitte einen Namen mit 1 bis 20 Zeichen eingeben.');return s.trim()}
 function clean(){for(const [k,r]of rooms)if(now()-r.created>ttl)rooms.delete(k);if(rooms.size>=1000)fail('Alle Räume belegt. Bitte später versuchen.',503)}
 function player(n){return {name:name(n),token:secret(),score:0}}
 function beginRound(r){r.phase='auction';r.bid=0;r.bidder=null;r.turn=r.round%2;r.deadline=now()+20000;r.found=[];r.ready=[];r.result=null;r.version++}
 function challenge(r){r.phase='challenge';r.deadline=now()+30000;r.version++}
 function finish(r,success){if(r.phase!=='challenge')return;const winner=success?r.bidder:1-r.bidder,points=r.bid*100;r.players[winner].score+=points;r.result={success,winner,points,bid:r.bid,challenger:r.bidder,count:r.found.length};r.history.push({title:r.deck[r.round].title,...r.result});r.phase=r.round===4?'finished':'result';r.deadline=null;r.version++}
 function advance(r){if(now()-r.created>ttl)fail('Der Raum ist abgelaufen. Erstelle bitte einen neuen.',410);if(r.deadline&&now()>=r.deadline){if(r.phase==='auction'){if(r.bidder===null){r.bid=1;r.bidder=r.turn;r.turn=1-r.turn;r.deadline=now()+20000;r.version++}else challenge(r)}else if(r.phase==='challenge')finish(r,false)}}
 function auth(code,token){const r=rooms.get(String(code||'').toUpperCase());if(!r)fail('Raum nicht gefunden oder abgelaufen.',404);const me=r.players.findIndex(p=>p.token===token);if(me<0)fail('Du bist nicht in diesem Raum angemeldet.',403);advance(r);return {r,me}}
 function view(r,me){const q=r.deck[r.round];return {code:r.code,me,phase:r.phase,version:r.version,round:r.round,bid:r.bid,bidder:r.bidder,turn:r.turn,deadline:r.deadline,serverNow:now(),players:r.players.map(({name,score})=>({name,score})),category:r.phase==='lobby'?null:{title:q.title,note:q.note,tag:q.tag,max:Math.min(15,q.items.length)},found:r.found.map(i=>q.items[i].name),ready:r.ready,result:r.result,history:r.history,solutions:['result','finished'].includes(r.phase)?q.items.map(x=>x.name):undefined}}
 function create(n){clean();let code;do{code=randomBytes(4).toString('hex').slice(0,6).toUpperCase()}while(rooms.has(code));const r={code,created:now(),players:[player(n)],phase:'lobby',deck:shuffle(categories).slice(0,5),round:0,bid:0,bidder:null,turn:0,deadline:null,found:[],ready:[],history:[],result:null,version:1};rooms.set(code,r);return {token:r.players[0].token,state:view(r,0)}}
 function join(code,n){name(n);const r=rooms.get(String(code||'').trim().toUpperCase());if(!r)fail('Raum nicht gefunden.',404);advance(r);if(r.phase!=='lobby'||r.players.length>=2)fail('Dieser Raum ist bereits voll oder das Spiel läuft.');r.players.push(player(n));r.version++;return {token:r.players[1].token,state:view(r,1)}}
 function get(code,token){const {r,me}=auth(code,token);return view(r,me)}
 function act(code,token,action,payload={}){const {r,me}=auth(code,token);let message;
 if(action==='leave'){r.phase='closed';r.deadline=null;r.version++;return {state:view(r,me)}}
 if(['closed','finished'].includes(r.phase))fail('Dieses Spiel ist beendet.');
 if(action==='start'){if(me!==0||r.phase!=='lobby'||r.players.length!==2)fail('Nur der Gastgeber kann mit zwei Spielern starten.');beginRound(r)}
 else if(action==='bid'){if(r.phase!=='auction'||r.turn!==me)fail('Du bist gerade nicht mit Bieten dran.');const bid=payload.bid,max=Math.min(15,r.deck[r.round].items.length);if(!Number.isInteger(bid)||bid<=r.bid||bid>max)fail(`Biete zwischen ${r.bid+1} und ${max}.`);r.bid=bid;r.bidder=me;r.turn=1-me;r.deadline=now()+20000;r.version++;if(bid===max)challenge(r)}
 else if(action==='pass'){if(r.phase!=='auction'||r.turn!==me||r.bidder===null)fail('Passen ist jetzt nicht möglich.');challenge(r)}
 else if(action==='answer'){if(r.phase!=='challenge'||r.bidder!==me)fail('Nur der Höchstbietende kann während der Antwortzeit schreiben.');const text=payload.answer;if(typeof text!=='string'||text.length>100||!normalize(text))fail('Bitte eine Antwort eingeben.');const key=normalize(text),idx=r.deck[r.round].items.findIndex(x=>[x.name,...x.aliases].some(s=>normalize(s)===key));if(idx<0)message='Nicht erkannt. Prüfe die Schreibweise oder versuch eine andere Antwort.';else if(r.found.includes(idx))message='Schon genannt – diese Antwort zählt nur einmal.';else{r.found.push(idx);r.version++;message='Richtig!';if(r.found.length>=r.bid)finish(r,true)}}
 else if(action==='next'){if(r.phase!=='result')fail('Die nächste Runde ist noch nicht bereit.');if(!r.ready.includes(me)){r.ready.push(me);r.version++}if(r.ready.length===2){r.round++;beginRound(r)}}
 else fail('Unbekannte Aktion.');return {state:view(r,me),message}}
 return {create,join,get,act};
}
