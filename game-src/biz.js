/* ===================== EMPIRE: streaming, TV, franchises, parks, theaters, M&A, stock ===================== */
/* ---------- Streaming ---------- */
const SVC_COST=()=>Math.round(300*I());
function launchService(name){S.cash-=SVC_COST();S.streaming={name:name||S.name.split(' ')[0]+'+',launchT:tNow()+6,subs:0,price:12.99,boost:0,hist:[]};
 addNews(`📡 ${esc(S.name)} announces its own streaming service, <b>${esc(S.streaming.name)}</b>, launching ${tLabel(tNow()+6)}.`)}
const svcLive=()=>S.streaming&&tNow()>=S.streaming.launchT;
function contentPower(){const t=tNow();let p=0;
 S.films.forEach(f=>{if(!f.lib)return;const age=t-f.releaseT;if(age<(f.dist==='stream'?0:2))return;p+=Math.pow(f.q/70,2)*(1+Math.max(0,1-age/36))});
 S.shows.forEach(s=>s.seasons.forEach(se=>{if(s.outlet!=='own')return;const age=t-se.t;p+=Math.pow(se.q/70,2)*1.6*(1+Math.max(0,1-age/24))}));
 return p}
function streamTick(){
 const sv=S.streaming;if(!sv)return 0;
 if(tNow()<sv.launchT){S.cash-=4*I();return -4*I()}
 if(tNow()===sv.launchT)addNews(`📡 <b>${esc(sv.name)}</b> is live! Launch-day sign-ups pour in.`);
 const cp=contentPower()+sv.boost;sv.boost*=.7;
 let target=.55*Math.pow(cp+2,.85)*Math.pow(13/sv.price,1.3)*(.7+S.rep/200)*(ev('recession')?.93:1)*(ev('pricewar')?.9:1);
 sv.subs=Math.max(0,sv.subs+(target-sv.subs)*.12+R(-.03,.03)*sv.subs);
 const rev=sv.subs*sv.price*.93,cost=10*I()+rev*.74;const net=rev-cost;S.cash+=net;
 sv.hist.push(+sv.subs.toFixed(2));if(sv.hist.length>36)sv.hist.shift();
 sv.lastRev=rev;sv.lastNet=net;return net;
}
/* ---------- TV ---------- */
const TVW=[['The','House of','Blood','Silent','Kingdom of','Station','Lost','The Last','Dark','Golden'],['Empire','Harbor','Precinct','Crown','Frontier','Signal','Dynasty','Ward','Island','Hours','Agency','Valley']];
function makePitches(){if(ev('wga'))return[];const out=[];const gs=Object.keys(TV_GENRES);
 for(let i=0;i<4;i++){const g=pick(gs);const w=pick(S.people.writers);const q=clamp(Math.round(R(30,92)*.7+w.skill*.3+S.rep/15),10,98);
  out.push({title:pick(TVW[0])+' '+pick(TVW[1]),genre:g,q,writer:w.id,cost:+(R(.3,1.5)*I()).toFixed(1)})}
 return out}
function pitches(){if(S.pitchesT!==tNow()){S.pitches=makePitches();S.pitchesT=tNow()}return S.pitches}
const tvEpIdeal=g=>TV_GENRES[g].ep*I();
function greenlightShow(w){
 const sr=person(w.writer),L=person(w.lead);
 const cosA=(w.cos||[]).map(person).filter(Boolean);const q=w.pitch.q*.4+sr.skill*.35+(L?L.skill:55)*.25+(cosA.length?(sum(cosA,x=>x.skill)/cosA.length-55)*.12+cosA.length:0)+clamp(12*Math.log2(w.epB/tvEpIdeal(w.pitch.genre)),-15,6)+R(-10,8);
 const sh={id:S.id++,kind:'tv',title:w.pitch.title,genre:w.pitch.genre,writer:w.writer,lead:w.lead,eps:w.eps,epB:+(w.epB*({anim:.8,anime:.6}[w.fmt]||1)).toFixed(2),fmt:w.fmt||'live',outlet:w.outlet,mode:w.mode||'binge',premWk:w.premWk||0,day:w.day==null?5:w.day,epNames:(w.epNames||[]).slice(),cliff:(w.cliff||[]).slice(),season:1,status:'prod',startT:tNow(),
  readyT:tNow()+3+Math.ceil(w.eps/4)+(w.delay||0),q,seasons:[],paid:w.pitch.cost+crewFee(sr,'writers')+(L?actorFee(L)*.6:0),spent:0,awards:[]};
 sh.cos=(w.cos||[]).slice();sh.paid+=sum(cosA,x=>actorFee(x)*.4);S.cash-=sh.paid;if(L)L.busy=sh.readyT-1;cosA.forEach(x=>x.busy=sh.readyT-1);sr.busy=sh.readyT-1;S.shows.push(sh);
 addNews(`📺 ${esc(S.name)} orders <b>${esc(sh.title)}</b> (${sh.genre}, ${sh.eps} episodes) for ${sh.outlet==='own'?esc(S.streaming?S.streaming.name:'its streamer'):sh.outlet==='network'?'broadcast TV':'a rival streamer'}.`);
 S.pitches=S.pitches.filter(p=>p!==w.pitch);
}
function tvTick(weekly){
 S.shows.forEach(sh=>{
  if(sh.status!=='prod')return;
  if(ev('wga')||ev('sag')){if(!weekly)sh.readyT++;return}
  if(!weekly){const total=sh.eps*sh.epB,months=Math.max(1,sh.readyT-sh.startT);const inst=Math.min(total/months,total-sh.spent);S.cash-=inst;sh.spent+=inst;}
  if(tNow()>sh.readyT||(tNow()===sh.readyT&&(S.wk||0)>=(sh.premWk||0))){QUEUE.push(()=>tvPremiere(sh));
   const L=person(sh.lead);const g=TV_GENRES[sh.genre];
   const q=clamp(sh.q+R(-6,6),3,98);const critic=Math.round(clamp(q+R(-10,10),5,99));
   const views=+(Math.pow(q/60,1.4)*(8+(L?L.star:30)/4+g.crowd)*(sh.season>1?1+Math.min(.5,sh.seasons[sh.seasons.length-1].views/60):1)*R(.7,1.3)*(1+Math.min(40,sh.buzz||0)/100)*(sh.fmt==='anime'?1.15:1)).toFixed(1);sh.buzz=0;
   const cost=sh.spent+(sh.season===1?sh.paid:0);
   let fee=0;
   if(sh.outlet==='own'&&S.streaming){S.streaming.boost=(S.streaming.boost||0)+q*sh.eps*.012}
   else{fee=+(cost*R(1.0,1.2)*(.8+q/250)).toFixed(1);if(sh.outlet==='network')fee*=1.05;S.receivables.push({t:tNow()+1,amt:fee,label:sh.title+' licence'})}
   const wk=sh.mode==='weekly';const nc=(sh.cliff||[]).filter(Boolean).length;const views2=+(views*(wk?1.08+Math.min(3,nc)*.03:1)).toFixed(1);
   if(sh.outlet==='own'&&S.streaming&&wk)S.streaming.boost+=q*sh.eps*.004;
   const epViews=[];for(let i=0;i<sh.eps;i++){let v=views2/sh.eps*(wk?(1.15-i*.025):(1.5-i*.08))*R(.92,1.08);if(i>0&&(sh.cliff||[])[i-1])v*=wk?1.18:1.05;epViews.push(+Math.max(.05,v).toFixed(2))}
   sh.seasons.push({n:sh.season,q,critic,views:views2,t:tNow(),wk:S.wk||0,day:sh.day==null?5:sh.day,mode:sh.mode,epNames:(sh.epNames||[]).slice(),fee,cost:+cost.toFixed(1),epViews});
   sh.status='airing';sh.renew=false;sh.aired=0;gainRep((critic-60)/16);
   addNews(`📺 <b>${esc(sh.title)}</b> season ${sh.season} drops — ${views}M views in its first month. Critics ${critic}%.`);
   post(null,critic>=75?`${esc(sh.title)} season ${sh.season} is PEAK television 📺🔥`:critic<50?`${esc(sh.title)} fell off hard this season 😬`:`binged ${esc(sh.title)} in one night, not bad`,RI(800,120000));
  }
 });
}
function renewShow(id,yes){const sh=S.shows.find(x=>x.id===id);sh.renew=false;
 if(!yes){sh.status='ended';addNews(`✂️ ${esc(S.name)} cancels <b>${esc(sh.title)}</b> after ${sh.season} season${sh.season>1?'s':''}.`);return}
 const last=sh.seasons[sh.seasons.length-1];sh.season++;sh.status='prod';sh.startT=tNow();sh.readyT=tNow()+3+Math.ceil(sh.eps/4);sh.spent=0;sh.epB=+(sh.epB*1.12).toFixed(2);
 sh.q=last.q+R(-8,6)+(last.critic>80?2:0)-(sh.season>4?4:0);addNews(`🔁 <b>${esc(sh.title)}</b> renewed for season ${sh.season}.`)}

/* ---------- Merchandise, parks, theaters ---------- */
function merchTick(){let m=0;S.franchises.forEach(fr=>{fr.fans=Math.max(0,fr.fans-.15);m+=Math.pow(fr.fans,1.5)*GEN[fr.genre].merch*.02*I()});if(ev('recession'))m*=.8;S.cash+=m;return m}
const PARK_COST=()=>Math.round(3000*I()),LAND_COST=()=>Math.round(500*I());
function buildPark(){S.park={startT:tNow(),openT:tNow()+30,cost:PARK_COST(),paid:0,name:S.name.split(' ')[0]+' World'};addNews(`🎢 ${esc(S.name)} breaks ground on <b>${esc(S.park.name)}</b>, a ${M(S.park.cost)} theme park opening ${tLabel(S.park.openT)}.`)}
function buildLand(fid){const fr=S.franchises.find(f=>f.id===fid);S.lands.push({fid,startT:tNow(),openT:tNow()+20,cost:LAND_COST(),paid:0});addNews(`🏰 A <b>${esc(fr.name)}</b> land is coming to ${esc(S.park.name)}.`)}
function parkTick(){let net=0;
 if(S.park){const p=S.park;if(p.paid<p.cost){const inst=Math.min(p.cost/30,p.cost-p.paid);p.paid+=inst;net-=inst}
  if(tNow()===p.openT)addNews(`🎢 <b>${esc(p.name)}</b> opens its gates to record crowds!`);
  if(tNow()>=p.openT&&!(S.ev.pandemic&&S.ev.pandemic.until>=tNow())){let r=30*I();S.lands.forEach(l=>{const fr=S.franchises.find(f=>f.id===l.fid);if(tNow()>=l.openT&&fr)r+=fr.fans*.12*I()});if(ev('recession'))r*=.85;net+=r}}
 S.lands.forEach(l=>{if(l.paid<l.cost){const inst=Math.min(l.cost/20,l.cost-l.paid);l.paid+=inst;net-=inst}});
 S.cash+=net;return net}
function buyChain(i){const c=CHAINS[i];const price=Math.round(c.price*I());S.cash-=price;S.theaters.push({n:c.n,screens:c.screens,price});
 addNews(`🎦 ${esc(S.name)} buys <b>${esc(c.n)}</b> (${c.screens.toLocaleString()} screens) for ${M(price)}. Since the Paramount Decrees ended in 2020, studios can own cinemas again.`)}
function theaterTick(){const n=sum(S.theaters,c=>c.screens)*.004*I()*Math.min(1,attendance());S.cash+=n;return n}
/* ---------- Acquisitions ---------- */
const rivalValue=r=>Math.round((r.p*900+r.films*12)*I());
function antitrustOK(r){const ms=S.market[S.year-1];const me=ms?(ms.find(x=>x.me)||{share:0}).share:0;const them=ms?(ms.find(x=>x.n===r.n)||{share:0}).share:0;return me+them<.35}
function acquire(name){const r=S.rivals.find(x=>x.n===name);if(!antitrustOK(r)){addNews(`⚖️ The DOJ and FTC block ${esc(S.name)}'s bid for ${esc(r.n)}: the combined studio would control too much of the box office.`);return}const price=Math.round(rivalValue(r)*1.3);S.cash-=price;r.alive=false;r.ownedByMe=true;
 S.libExtra=(S.libExtra||0)+rivalValue(r)*.06;gainRep(6);
 if(S.streaming&&r.svc){S.streaming.subs+=r.subs*.3;addNews(`📡 ${esc(r.svc)} subscribers fold into ${esc(S.streaming.name)}.`)}
 S.rivalFilms=S.rivalFilms.filter(x=>x.studio!==r.n);
 addNews(`🤝 MEGA-DEAL: ${esc(S.name)} acquires <b>${esc(r.n)}</b> for ${M(price)}, including its film library.`)}
/* ---------- Stock market ---------- */
function libraryValue(){const t=tNow();return sum(S.films,f=>f.ww*.12*Math.max(.2,1-(t-f.releaseT)/240))+(S.libExtra||0)*8}
function valuation(){const ttm=sum((S.log.cf||[]).slice(-12));
 const sv=S.streaming?S.streaming.subs*S.streaming.price*12*2.2:0;
 const assets=sum(S.theaters,c=>c.price*.8)+(S.park&&tNow()>=S.park.openT?S.park.cost*.9:0)+sum(S.lands,l=>l.paid*.8);
 return Math.max(200*I(),S.cash*.8+libraryValue()+sv+assets+ttm*10+S.rep*8*I())}
function ipo(){const V=valuation();const raise=V*.25*.93;S.cash+=raise;S.stock={public:true,price:+(V/100).toFixed(2),ipo:+(V/100).toFixed(2),low:0,hist:[+(V/100).toFixed(2)]};
 addNews(`🔔 ${esc(S.name)} rings the opening bell! The IPO raises ${M(raise)} at a ${M(V)} valuation.`)}
function raiseCapital(){const V=valuation();const r=V*.1*.95;S.cash+=r;S.stock.price*=.94;addNews(`💼 ${esc(S.name)} sells new shares, raising ${M(r)}.`)}
function stockTick(){const st=S.stock;if(!st.public)return;
 const target=valuation()/100;st.price=Math.max(.5,st.price+(target-st.price)*.22+st.price*gauss()*.035);
 if(ev('recession'))st.price*=.99;
 if([2,5,8,11].includes(S.month)){const cf=S.log.cf||[];const q=sum(cf.slice(-3)),pq=sum(cf.slice(-6,-3));
  if(q>=pq){st.price*=1.06;addNews(`📈 ${esc(S.name)} beats Wall Street estimates; shares jump.`)}else{st.price*=.92;addNews(`📉 ${esc(S.name)} misses quarterly estimates; shares slide.`)}}
 st.hist.push(+st.price.toFixed(2));if(st.hist.length>48)st.hist.shift();
 st.low=st.price<st.ipo*.4?st.low+1:0;
 if(st.low===6)queueDecision({title:'⚠️ The board is losing patience',text:`Shares have traded below 40% of the IPO price for 6 months. If this continues for another 6 months, the board will replace you.`,opts:[{l:'Understood',f:()=>{}}]});
 if(st.low>=12){S.over=true;S.fired=true}
}
