import assert from 'node:assert/strict';
import {createEngine} from './game-server.mjs';
import {categories} from './server-data.mjs';
let now=1000;const e=createEngine(()=>now);const a=e.create('Fabian');assert.equal(a.state.phase,'lobby');assert.equal(a.state.category,null);const code=a.state.code;const b=e.join(code,'Freund');assert.equal(b.state.players.length,2);assert.throws(()=>e.get(code,'wrong'));assert.throws(()=>e.act(code,b.token,'start'));let s=e.act(code,a.token,'start').state;assert.equal(s.phase,'auction');assert.equal(s.solutions,undefined);assert(!JSON.stringify(s).includes(a.token));
assert.throws(()=>e.act(code,b.token,'bid',{bid:2}));assert.throws(()=>e.act(code,a.token,'pass'));assert.throws(()=>e.act(code,a.token,'bid',{bid:NaN}));s=e.act(code,a.token,'bid',{bid:2}).state;assert.equal(s.turn,1);assert.throws(()=>e.act(code,b.token,'bid',{bid:2}));s=e.act(code,b.token,'pass').state;assert.equal(s.phase,'challenge');assert.throws(()=>e.act(code,b.token,'answer',{answer:'wrong'}));const q=categories.find(c=>c.title===s.category.title);let r=e.act(code,a.token,'answer',{answer:'not a valid answer'});assert.equal(r.state.found.length,0);r=e.act(code,a.token,'answer',{answer:q.items[0].name});assert.equal(r.state.found.length,1);r=e.act(code,a.token,'answer',{answer:q.items[0].name});assert.equal(r.state.found.length,1);r=e.act(code,a.token,'answer',{answer:q.items[1].name});assert.equal(r.state.phase,'result');assert.equal(r.state.players[0].score,200);assert.throws(()=>e.act(code,a.token,'answer',{answer:q.items[2].name}));assert.equal(e.get(code,a.token).players[0].score,200);
e.act(code,a.token,'next');s=e.act(code,b.token,'next').state;assert.equal(s.round,1);assert.equal(s.turn,1);s=e.act(code,b.token,'bid',{bid:3}).state;e.act(code,a.token,'pass');now+=30000;assert.throws(()=>e.act(code,b.token,'answer',{answer:'late'}));s=e.get(code,a.token);assert.equal(s.phase,'result');assert.equal(s.players[0].score,500);
for(let round=2;round<5;round++){e.act(code,a.token,'next');s=e.act(code,b.token,'next').state;const bidder=s.turn===0?a:b,other=s.turn===0?b:a;e.act(code,bidder.token,'bid',{bid:1});e.act(code,other.token,'pass');now+=30001;s=e.get(code,a.token);assert.equal(s.phase,round===4?'finished':'result')}
assert.equal(s.history.length,5);assert.equal(s.players[0].score+s.players[1].score,800);assert.throws(()=>e.act(code,a.token,'next'));
const c=e.create('A'),d=e.join(c.state.code,'B');e.act(c.state.code,c.token,'start');now+=20001;s=e.get(c.state.code,d.token);assert.equal(s.bid,1);assert.equal(s.turn,1);now+=20001;s=e.get(c.state.code,c.token);assert.equal(s.phase,'challenge');e.act(c.state.code,d.token,'leave');assert.equal(e.get(c.state.code,c.token).phase,'closed');assert.throws(()=>e.act(c.state.code,c.token,'bid',{bid:4}));now+=7200001;assert.throws(()=>e.get(c.state.code,c.token));
console.log('PASS: two isolated sessions, auth, room capacity, turn enforcement, invalid bids, answer permissions, duplicate answers, server timeout, five rounds, score totals, automatic bids/passes, leave, expiry, no tokens/solutions leaked.');

// Three players: passes eliminate, bidders rotate, everyone must be ready.
const room=e.create('A'),roomCode=room.state.code;
const players=[room,e.join(roomCode,'B'),e.join(roomCode,'C')];
assert.equal(players[2].state.me,2);
assert.throws(()=>e.join(roomCode,'D'));
const act=(i,a,p)=>e.act(roomCode,players[i].token,a,p).state;
const get=()=>e.get(roomCode,players[0].token);
assert.throws(()=>act(2,'start'));
s=act(0,'start');assert(s.category.max>=7);
s=act(0,'bid',{bid:2});assert.equal(s.turn,1);
s=act(1,'pass');assert.equal(s.phase,'auction');assert.equal(s.turn,2);assert.deepEqual(s.passed,[1]);
assert.throws(()=>act(1,'bid',{bid:3}));
s=act(2,'bid',{bid:3});assert.equal(s.turn,0);
s=act(0,'bid',{bid:4});assert.equal(s.turn,2);
s=act(2,'pass');assert.equal(s.phase,'challenge');assert.equal(s.bidder,0);
assert.throws(()=>act(2,'answer',{answer:'test'}));
let question=categories.find(q=>q.title===s.category.title);
for(const item of question.items.slice(0,4))s=act(0,'answer',{answer:item.name});
assert.deepEqual(s.result.winners,[0]);assert.deepEqual(s.players.map(p=>p.score),[400,0,0]);
act(0,'next');s=act(1,'next');assert.equal(s.phase,'result');act(1,'next');assert.equal(get().ready.length,2);
s=act(2,'next');assert.equal(s.turn,1);assert.deepEqual(s.passed,[]);
act(1,'bid',{bid:3});s=act(2,'pass');assert.equal(s.turn,0);s=act(0,'pass');assert.equal(s.phase,'challenge');
now+=30000;s=get();assert.deepEqual(s.result.winners,[0,2]);assert.deepEqual(s.players.map(p=>p.score),[700,0,300]);
for(let round=2;round<5;round++){
 act(0,'next');act(1,'next');s=act(2,'next');assert.equal(s.turn,round%3);
 now+=20000;s=get();assert.equal(s.bid,1);assert.equal(s.phase,'auction');
 now+=20000;s=get();assert.equal(s.phase,'auction');assert.equal(s.passed.length,1);
 now+=20000;s=get();assert.equal(s.phase,'challenge');
 now+=30000;s=get();assert.equal(s.phase,round===4?'finished':'result');
}
assert.equal(s.history.length,5);assert.equal(s.players.reduce((sum,p)=>sum+p.score,0),1600);
// Maximum bid begins the challenge even with three active bidders.
const maxRoom=e.create('Max'),maxB=e.join(maxRoom.state.code,'B'),maxC=e.join(maxRoom.state.code,'C');
s=e.act(maxRoom.state.code,maxRoom.token,'start').state;
s=e.act(maxRoom.state.code,maxRoom.token,'bid',{bid:s.category.max}).state;assert.equal(s.phase,'challenge');
assert.throws(()=>e.join(maxRoom.state.code,'Late'));
e.act(maxRoom.state.code,maxC.token,'leave');assert.equal(e.get(maxRoom.state.code,maxB.token).phase,'closed');
console.log('PASS: three-player capacity, unique sessions, round-robin bids, eliminated passes, skip passed players, two opponent rewards, all-player readiness, rotating opener, automatic passes, five rounds, maximum bid, leave.');
