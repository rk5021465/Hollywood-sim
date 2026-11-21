"use strict";
const R=Math.random,ri=(a,b)=>Math.floor(a+R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const wpick=(arr,wf)=>{let tot=0;const ws=arr.map(x=>{const w=Math.max(0,wf(x));tot+=w;return w});let r=R()*tot;for(let i=0;i<arr.length;i++){r-=ws[i];if(r<=0)return arr[i]}return arr[arr.length-1]};
const VBY={};VENDORS.forEach(v=>VBY[v.id]=v);
const SAVE='shaadi_inc_s1';
let S=null;

const mi=(y,m)=>(y-START_YEAR)*12+m;
const nowMi=()=>mi(S.year,S.month);
const miY=i=>START_YEAR+Math.floor(i/12),miM=i=>((i%12)+12)%12;
const dateStr=i=>MONTHS[miM(i)]+' '+miY(i);
const money=n=>(n<0?'−':'')+'₹'+Math.abs(Math.round(n)).toLocaleString('en-IN');
const fameTier=()=>{let t=0;FAME.forEach((f,i)=>{if(S.rep>=f.min)t=i});return t};

function newGame(founder,trait,houseName){
 S={v:1,year:START_YEAR,month:10,money:600,debt:0,rep:0,house:houseName,
  head:{name:founder,trait,age:24,gen:1,female:false},heads:[],
  staff:[],upgrades:{},inquiries:[],bookings:[],log:[],chron:[],hist:0,fx:{},
  stats:{weddings:0,earned:0,best:null,perfect:0},vrel:{},vuse:{},
  rival:{name:'Sethia wedding house',rep:60},nextId:1,ended:false,negMonths:0,help:{}};
 addLog('You open the doors of '+houseName+' in the old town of Amber.');
 genInquiries(true);save();
}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function load(){try{const t=localStorage.getItem(SAVE);if(t){S=JSON.parse(t);return true}}catch(e){}return false}
function addLog(t){S.log.unshift({i:nowMi(),t});if(S.log.length>200)S.log.length=200}
function fx(k){return S.fx[k]&&S.fx[k]>0}

// ---------- clients ----------
function personName(trad,fem){if(trad==='muslim')return pick(fem?MFEM:MFIRST);return pick(fem?FEM:FIRST)}
const DGROUP={elephant:'p',mare:'p',palki:'p2',temple:'v',palace:'v',garden:'v',home:'v',fireworks:'l',quiet:'l',lamps:'l',gold:'g',modest:'g',veg:'f',meat:'f',cheapfood:'f'};
function genClient(){
 const tier=fameTier(),m=S.month;const chatur=SEASON[m]===0;
 const trads=Object.keys(TRADITIONS).filter(k=>!(chatur&&TRADITIONS[k].muhurat));
 if(!trads.length)return null;
 const trad=wpick(trads,k=>TRADITIONS[k].w);
 const cls=wpick(Object.keys(CLASSES),k=>{const c=CLASSES[k];if(tier<c.minFame)return 0;let w={artisan:4-tier*.6,merchant:4,noble:1+tier*.8,royal:tier>=4?1.2:0}[k];if(k==='noble'&&fx('nobleBoost'))w*=2;if(k==='royal'&&fx('royalBoost'))w*=2;if(k==='royal'&&fx('mourn'))w=0;return w});
 const C=CLASSES[cls];const guests=Math.round(ri(C.guests[0],C.guests[1])/10)*10;
 let fee=ri(C.budget[0],C.budget[1])*(.7+guests/C.guests[1]*.5);if(S.fx.budgetV&&fx('budget'))fee*=1+S.fx.budgetV;
 fee=Math.round(fee/10)*10;
 const sn=SURN[trad],bs=pick(sn);let gs=pick(sn);while(gs===bs)gs=pick(sn);
 const el=DEMANDS.filter(d=>(!d.only||d.only.includes(trad))&&(!d.not||!d.not.includes(trad))&&(!d.cls||d.cls.includes(cls))&&!(trad==='jain'&&d.id==='meat'));
 const dem={bride:[],groom:[]};const used=new Set();
 for(const side of ['bride','groom']){let tries=0;const want=cls==='artisan'?1:2;while(dem[side].length<want&&tries++<40){const d=wpick(el.filter(x=>x.side===side||x.side==='both'),x=>x.w);if(!d||used.has(d.id))continue;const gp=DGROUP[d.id];if(gp&&dem[side].some(x=>DGROUP[x]===gp))continue;if(gp==='p'&&dem[side==='bride'?'groom':'bride'].some(x=>DGROUP[x]==='p'))continue;dem[side].push(d.id);used.add(d.id)}}
 if(trad==='jain'&&!used.has('veg'))dem.bride.push('jainfood');
 let wm=nowMi()+ri(1,4);for(let k=0;k<12;k++){if(!TRADITIONS[trad].muhurat||SEASON[miM(wm)]>0)break;wm++}
 const id=S.nextId++;
 return{id,trad,cls,guests,fee,wm,exp:nowMi()+1,
  bride:{father:personName(trad)+' '+bs,surname:bs,name:personName(trad,true)},
  groom:{father:personName(trad)+' '+gs,surname:gs,name:personName(trad)},dem,referral:false};
}
function genInquiries(first){
 const tier=fameTier();let season=SEASON[S.month];if(season===0)season=.3;
 let exp=(.7+tier*.32+(S.upgrades.couriers?.45:0))*season;
 if(fx('boom'))exp*=1.45;if(fx('slump'))exp*=.55;if(fx('mourn'))exp*=.3;
 let n=Math.floor(exp+R()*.9);if(first)n=Math.max(n,2);
 for(let i=0;i<n&&S.inquiries.length<6;i++){const c=genClient();if(c)S.inquiries.push(c)}
}
function capacity(){return 1+(S.upgrades.office?1:0)+(S.upgrades.office2?1:0)+S.staff.length}
function activeBookings(){return S.bookings.filter(b=>!b.done)}
function acceptInquiry(id){const i=S.inquiries.findIndex(q=>q.id===id);if(i<0)return'Not found';if(activeBookings().length>=capacity())return'Your house is fully booked. Hire staff or expand the office.';
 const q=S.inquiries.splice(i,1)[0];q.plan={};q.locked=false;q.delegate=null;q.advance=Math.round(q.fee*.3);S.money+=q.advance;S.bookings.push(q);
 addLog('Booked: the '+q.bride.surname+' and '+q.groom.surname+' wedding for '+dateStr(q.wm)+'. Advance '+money(q.advance)+'.');save();return null}
function declineInquiry(id){S.inquiries=S.inquiries.filter(q=>q.id!==id);save()}

// ---------- vendors / costs ----------
function vendorOk(v,b){if(v.own&&!S.upgrades[v.own])return'Not owned yet';if(v.minFame&&fameTier()<v.minFame)return'Needs fame: '+FAME[v.minFame].name;
 if(v.slot==='venue'&&v.noMuslim&&b.trad==='muslim')return'Not for a Nikah';
 if(v.slot==='officiant'){const f=v.faith;if(b.trad==='muslim'&&f!=='muslim')return'A Nikah needs a Qazi';if(b.trad!=='muslim'&&f==='muslim')return'Needs a pandit';if(b.trad!=='jain'&&f==='jain')return'Jain rites only'}
 return null}
function relLvl(id){return Math.min(10,S.vrel[id]||0)}
function vCost(v,b){let c=v.cost+v.per*b.guests/100;
 if(v.slot==='feast'&&fx('famine'))c*=1.6;if(v.slot==='feast'&&S.upgrades.kitchen)c*=.85;
 if(v.slot==='decor'&&S.upgrades.tents)c*=.85;if((v.slot==='decor'||v.slot==='lights')&&S.upgrades.workshop)c*=.75;if(v.slot==='decor'&&fx('decorCheap'))c*=.8;
 if(v.slot==='procession'&&v.type==='horse'&&S.upgrades.stable)c=0;
 if(S.head.trait==='shrewd')c*=.88;c*=1-relLvl(v.id)*.01;return Math.round(c)}
function vRel(v){let r=v.rel+relLvl(v.id)*.01;if(S.head.trait==='steady')r+=.1;if(v.slot==='feast'&&S.upgrades.kitchen)r+=.12;return Math.min(.99,r)}
function planObj(b){const p={};for(const s of SLOTS){p[s.id]=b.plan[s.id]?VBY[b.plan[s.id]]:null}return p}
function planCost(b){let c=0;for(const s of SLOTS){const v=b.plan[s.id]&&VBY[b.plan[s.id]];if(v)c+=vCost(v,b)}return c}
function demandList(b){const out=[];const p=planObj(b);for(const side of ['bride','groom'])for(const id of b.dem[side]){if(id==='jainfood'){out.push({side,t:'Jain food: no onion or garlic',ok:!!(p.feast&&p.feast.food==='jain'),id});continue}const d=DEMANDS.find(x=>x.id===id);out.push({side,t:d.t,ok:!!d.ok(p),id})}return out}
function planIssues(b){const p=planObj(b),iss=[];for(const s of SLOTS)if(!p[s.id])iss.push('Choose '+s.name.toLowerCase());
 for(const s of SLOTS){const v=p[s.id];if(v){const e=vendorOk(v,b);if(e)iss.push(v.name+': '+e)}}return iss}
function predictScores(b){const p=planObj(b),C=CLASSES[b.cls];let base=50+(S.head.trait==='charming'?6:0);const sc={bride:base,groom:base};
 let q=0,n=0;for(const s of SLOTS){const v=p[s.id];if(!v)continue;let vq=v.q;if(S.head.trait==='showman'&&['decor','lights','procession'].includes(s.id))vq+=.6;q+=vq;n++}
 const avg=n?q/n:0;const qd=(avg-C.expect)*7;sc.bride+=qd;sc.groom+=qd;
 if(p.venue&&p.venue.id==='v7'){sc.bride+=5;sc.groom+=5}
 for(const d of demandList(b)){const v=d.ok?9:-8;if(d.side==='bride')sc.bride+=v;else sc.groom+=v}
 const over=p.venue?b.guests/p.venue.cap:1;if(over>1){sc.bride-=(over-1)*50;sc.groom-=(over-1)*50}
 return{bride:clamp(sc.bride,0,100),groom:clamp(sc.groom,0,100),over,avgQ:avg}}
function autoPlan(b,skill=3){const plan={};
 for(const s of SLOTS){const opts=VENDORS.filter(v=>v.slot===s.id&&!vendorOk(v,b));let best=null,bs=-1e9;
  for(const v of opts){const tmp=Object.assign({},b.plan,plan,{[s.id]:v.id});const tb=Object.assign({},b,{plan:tmp});const pr=predictScores(tb);const cost=vCost(v,b);
   let sc=(pr.bride+pr.groom)/2*(.6+skill*.12)-cost/b.fee*60;if(s.id==='venue'&&b.guests>v.cap)sc-=40;if(s.id==='feast'&&b.trad==='jain'&&v.food!=='jain')sc-=50;if(s.id==='feast'&&(b.trad==='marwari')&&v.food==='any')sc-=40;
   if(sc>bs){bs=sc;best=v}}
  if(best)plan[s.id]=best.id}
 return plan}

// ---------- wedding day ----------
function startWedding(b){const p=planObj(b),pr=predictScores(b),tr=TRADITIONS[b.trad];
 const slack=ri(30,170)+(S.head.trait==='devout'?40:0);const pre=tr.muhurat?240:150;
 const W={bid:b.id,phase:0,time:1080,muhurat:1080+pre+slack,b:pr.bride,g:pr.groom,cost:0,rep:0,log:[],evQ:[],used:{},cur:null,flags:{},done:false};
 b.wd=W;W.evQ=pickPhaseEvents(b,0);nextEvent(b);return W}
function evCtx(b){const p=planObj(b);return{plan:p,trad:b.trad,cls:b.cls,month:miM(b.wm),muhurat:TRADITIONS[b.trad].muhurat,over:p.venue?b.guests/p.venue.cap:1,rival:S.rival.rep>S.rep*.8,rel:sl=>vRel(p[sl])}}
function pickPhaseEvents(b,ph){const c=evCtx(b),W=b.wd;const pool=EVENTS.filter(e=>e.ph===ph&&!W.used[e.id]);
 const forced=['jain_onion','meat_veg','crowded','food_short','fire_spark','pandit_late','ele_stop','mare_spook','palki_tilt','drunk_singer'];
 const out=[];for(const e of pool){if(e.when&&forced.includes(e.id)&&e.when(c))out.push(e)}
 const rest=pool.filter(e=>!forced.includes(e.id)&&(!e.when||e.when(c)));
 const want=ph===4?1:(R()<.45?2:1);while(out.length<want&&rest.length){const i=Math.floor(R()*rest.length);out.push(rest.splice(i,1)[0])}
 out.forEach(e=>W.used[e.id]=1);return out.slice(0,3)}
const PHASE_MIN=[90,60,90,60,60];
function nextEvent(b){const W=b.wd;if(W.evQ.length){W.cur=W.evQ.shift();return W.cur}
 // phase ends
 W.time+=PHASE_MIN[W.phase];W.phase++;
 const tr=TRADITIONS[b.trad],cerPh=tr.muhurat?3:2;
 if(W.phase===cerPh){const late=W.time-W.muhurat;let pen;if(late>0){pen=Math.min(28,8+late/4)*(tr.muhurat?1:.5);W.b-=pen;W.g-=pen;W.log.push({t:'The ceremony began '+late+' minutes after the '+tr.clockName.toLowerCase()+'.',bad:1});W.rep-=2}else{W.b+=4;W.g+=4;W.log.push({t:'The ceremony began on time, '+(-late)+' minutes before the '+tr.clockName.toLowerCase()+'.'})}
  if(W.flags.risk){if(R()<.5){W.b-=10;W.g-=10;W.log.push({t:'The original time was wrong after all. The elders are upset.',bad:1})}}
  if(W.flags.storm){if(R()<.55){W.b-=14;W.g-=14;W.log.push({t:'The storm soaked the mandap during the ritual.',bad:1})}else W.log.push({t:'The storm passed by. Lucky.'})}}
 if(W.phase>=5){W.cur=null;W.done=true;return null}
 W.evQ=pickPhaseEvents(b,W.phase);return nextEvent(b)}
function chooseEvent(b,ci){const W=b.wd,e=W.cur,c=e.ch[ci];const res={cost:c.c||0,t:c.t||0,b:c.b||0,g:c.g||0,r:c.r||0};
 W.cost+=res.cost;W.time+=res.t;W.b+=res.b;W.g+=res.g;W.rep+=res.r;
 if(c.x==='risk')W.flags.risk=1;if(c.x==='storm')W.flags.storm=1;if(c.x==='honour'){S.stats.honour=(S.stats.honour||0)+1}
 if(c.x==='vendorhurt'){const fid=b.plan.feast;S.vrel[fid]=Math.max(0,(S.vrel[fid]||0)-3)}
 W.log.push({t:e.t.split('.')[0]+'. You chose: '+c.l.toLowerCase()+'.',res});W.b=clamp(W.b,0,100);W.g=clamp(W.g,0,100);
 nextEvent(b);return res}
function autoRunWedding(b,skill){startWedding(b);let guard=0;while(!b.wd.done&&guard++<30){const e=b.wd.cur;let best=0,bs=-1e9;e.ch.forEach((c,i)=>{const s=(c.b||0)+(c.g||0)-(c.c||0)/8-Math.max(0,c.t||0)/10+(c.r||0)*2+(skill-3)*R()*3;if(s>bs){bs=s;best=i}});if(R()>.4+skill*.12)best=Math.floor(R()*e.ch.length);chooseEvent(b,best)}return finishWedding(b,true)}
function finishWedding(b,auto){const W=b.wd,C=CLASSES[b.cls];const bs=Math.round(clamp(W.b,0,100)),gs=Math.round(clamp(W.g,0,100)),avg=(bs+gs)/2;
 const vc=planCost(b);let tip=0,withheld=0;if(avg>=85)tip=Math.round(b.fee*.15);else if(avg>=75)tip=Math.round(b.fee*.07);if(avg<40)withheld=Math.round(b.fee*.3);
 const rest=b.fee-b.advance-withheld;S.money+=rest+tip-vc-W.cost;
 const tier=fameTier(),low=(b.cls==='artisan'&&tier>=2)||(b.cls==='merchant'&&tier>=4);let rep=((avg-55)/6)*C.repMul*(low&&avg>55?.3:1)+W.rep;if(S.head.trait==='proud')rep*=1.2;rep=Math.round(rep*10)/10;S.rep=Math.max(0,S.rep+rep);
 for(const s of SLOTS){const id=b.plan[s.id];S.vrel[id]=(S.vrel[id]||0)+(avg>=60?1:.5);S.vuse[id]=(S.vuse[id]||0)+1}
 const profit=b.fee-withheld+tip-vc-W.cost;
 b.done=true;b.result={bs,gs,avg,tip,withheld,vc,ev:W.cost,profit,rep,auto:!!auto};
 S.stats.weddings++;S.stats.earned+=profit;if(avg>=90)S.stats.perfect++;
 const entry={i:b.wm,name:b.bride.surname+' and '+b.groom.surname,trad:b.trad,cls:b.cls,guests:b.guests,avg,profit,auto:!!auto};S.chron.unshift(entry);if(S.chron.length>400)S.chron.length=400;
 if(!S.stats.best||avg>S.stats.best.avg)S.stats.best=entry;
 const verdict=avg>=85?'a triumph':avg>=70?'a success':avg>=50?'a mixed affair':'a disaster';
 addLog('The '+entry.name+' wedding was '+verdict+' ('+Math.round(avg)+'). Profit '+money(profit)+'.');
 if(avg>=80&&R()<.6){const c=genClient();if(c){c.referral=true;c.cls=b.cls;S.inquiries.push(c)}}
 delete b.wd;save();return b.result}

// ---------- month advance ----------
function blockers(){const out=[];const now=nowMi();for(const b of activeBookings()){if(b.wm===now&&!b.delegate)out.push({b,t:'The '+b.bride.surname+' wedding is this month. Run the wedding day first.'});else if(b.wm===now+0&&!b.locked&&!b.delegate)out.push({b,t:'Plan the '+b.bride.surname+' wedding.'})}return out}
function monthCosts(){return [8,20,45,100,200][fameTier()]+S.staff.reduce((a,s)=>a+s.wage,0)+Math.round(S.debt*.03)}
function advanceMonth(){const ev=[];const now=nowMi();
 // delegated weddings this month
 for(const b of activeBookings()){if(b.wm===now&&b.delegate){const st=S.staff.find(s=>s.id===b.delegate)||{skill:2,name:'Your assistant'};if(!b.locked){b.plan=autoPlan(b,st.skill);b.locked=true}const r=autoRunWedding(b,st.skill);ev.push({t:st.name+' ran the '+b.bride.surname+' wedding: score '+Math.round(r.avg)+', profit '+money(r.profit)+'.'})}}
 // overdue (should not happen) - auto-run badly
 for(const b of activeBookings()){if(b.wm<now+0&&!b.done){if(!b.locked)b.plan=autoPlan(b,1);autoRunWedding(b,1)}}
 S.inquiries=S.inquiries.filter(q=>{if(q.exp<=now){if(R()<.6&&S.rival){S.rival.rep+=1.5}return false}return true});
 const mc=monthCosts();S.money-=mc;
 S.month++;if(S.month>11){S.month=0;S.year++;S.head.age++;S.staff.forEach(s=>s.age=(s.age||30)+1);yearly(ev)}
 S.rep-=Math.max(0,S.rep-100)*.005;for(const k in S.fx)if(typeof S.fx[k]==='number'&&!k.endsWith('V'))S.fx[k]=Math.max(0,S.fx[k]-1);
 // history
 while(S.hist<HISTORY.length&&mi(HISTORY[S.hist].y,HISTORY[S.hist].m)<=nowMi()){const h=HISTORY[S.hist++];applyHist(h);ev.push({t:h.t,hist:1,y:h.y});addLog(h.t)}
 // rival
 S.rival.rep+=.6+R()*1.2*(1+fameTier()*.2);
 if(S.inquiries.length&&R()<.18){const q=S.inquiries.splice(Math.floor(R()*S.inquiries.length),1)[0];S.rival.rep+=2;ev.push({t:'The '+q.bride.surname+' family went to the '+S.rival.name+' instead.'})}
 // money trouble
 if(S.money<0){const need=Math.ceil(-S.money/100)*100+200;S.debt+=need;S.money+=need;ev.push({t:'Seth Bhikamchand the moneylender lent you '+money(need)+' at 3% a month.',bad:1});addLog('Borrowed '+money(need)+' from the moneylender.')}
 if(S.debt>6000)S.bankrupt=true;
 genInquiries(false);
 if(S.year>END_YEAR&&!S.ended){S.ended=true;ev.push({t:'The 18th century ends. Stage 1 is complete.',end:1})}
 save();return ev}
function yearly(ev){const a=S.head.age;if(a>=58&&R()<.1+(a-58)*.04){ev.push({succession:1,t:S.head.name+' has died at the age of '+a+'. The house needs a new head.'});S.pendingHeir=makeHeirs()}}
function makeHeirs(){const sn=S.house.replace(/^House of /,'');const tr=Object.keys(TRADITIONS);const t=Object.keys(TRAITS);
 const a={name:pick(FIRST)+' '+sn,trait:pick(t),age:ri(24,34),female:false},b2={name:pick(FEM)+' '+sn,trait:pick(t.filter(x=>x!==a.trait)),age:ri(22,32),female:true};return[a,b2]}
function chooseHeir(i){const h=S.pendingHeir[i];S.heads.push({name:S.head.name,trait:S.head.trait,gen:S.head.gen,until:S.year,age:S.head.age});S.head={name:h.name,trait:h.trait,age:h.age,gen:S.head.gen+1,female:h.female};S.rep=Math.round(S.rep*.93);delete S.pendingHeir;addLog(h.name+' becomes head of the house. Generation '+S.head.gen+'.');save()}
function applyHist(h){const f=h.fx;if(f.boom)S.fx.boom=f.boom;if(f.nobleBoost)S.fx.nobleBoost=f.nobleBoost;if(f.mourn)S.fx.mourn=f.mourn;if(f.slump)S.fx.slump=f.slump;if(f.famine)S.fx.famine=f.famine;if(f.decorCheap)S.fx.decorCheap=f.decorCheap;if(f.royalBoost)S.fx.royalBoost=f.royalBoost;if(f.budget){S.fx.budget=f.len;S.fx.budgetV=f.budget}if(f.rep)S.rep+=f.rep;
 if(f.mourn)S.inquiries=S.inquiries.filter(q=>q.cls!=='royal')}

// staff & upgrades
function staffCandidates(){const used=new Set(S.staff.map(s=>s.name));return [0,1,2].map(()=>{const sk=ri(1,5);let n=pick(STAFF_NAMES);let g=0;while(used.has(n)&&g++<20)n=pick(STAFF_NAMES);used.add(n);return{name:n,skill:sk,wage:6+sk*6+fameTier()*sk*3,hire:30+sk*35}})}
function hire(c){if(S.money<c.hire)return'Not enough money';S.money-=c.hire;S.staff.push({id:'s'+(S.nextId++),name:c.name,skill:c.skill,wage:c.wage,age:ri(22,40)});addLog('Hired '+c.name+' as a wedding manager.');save();return null}
function fire(id){const s=S.staff.find(x=>x.id===id);S.staff=S.staff.filter(x=>x.id!==id);S.bookings.forEach(b=>{if(b.delegate===id)b.delegate=null});if(s)addLog(s.name+' has left the house.');save()}
function buyUpgrade(u){if(S.upgrades[u.id])return'Owned';if(u.req&&!S.upgrades[u.req])return'Needs '+UPGRADES.find(x=>x.id===u.req).name;if(S.money<u.cost)return'Not enough money';S.money-=u.cost;S.upgrades[u.id]=1;addLog('Bought: '+u.name+'.');save();return null}
function repay(n){n=Math.min(n,S.debt,Math.max(0,S.money));S.money-=n;S.debt-=n;save()}

function charityWedding(){if(S.money<2500)return'Costs ₹2,500';if(S.charityAt&&nowMi()-S.charityAt<12)return'You can sponsor one charity wedding a year';S.money-=2500;S.charityAt=nowMi();const g=12+fameTier()*6;S.rep+=g;addLog('Your house paid for the weddings of twelve poor couples. The city blesses your name.');save();return null}
