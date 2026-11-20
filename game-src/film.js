/* ===================== FILMS ===================== */
function makeScripts(){
 const out=[];const strike=ev('wga');
 if(strike)return out;
 // sequels / spinoffs from franchises
 S.franchises.forEach(fr=>{
  const last=S.films.filter(f=>f.fid===fr.id).sort((a,b)=>b.releaseT-a.releaseT)[0];
  const inDev=S.projects.some(p=>p.fid===fr.id);
  if(!last||inDev||fr.fans<20)return;
  const n=fr.parts+1;
  out.push({type:'Sequel',genre:fr.genre,title:fr.name+(n===2?' 2':n===3?' 3':': Chapter '+n),base:fr.name,part:n,fid:fr.id,q:RI(35,82),hype:Math.min(36,6+fr.fans*.35)-Math.max(0,n-3)*4,cost:+((1+fr.fans/15)*I()).toFixed(1),adapt:1,writer:pick(S.people.writers).id});
  if(fr.fans>=50&&Math.random()<.5){const g=fr.genre;out.push({type:'Spinoff',genre:g,title:fr.name+': '+pick(['Origins','Legacy','Rogue','Dawn','The Lost Years','Outcasts']),base:fr.name+' spinoff',part:1,fid:fr.id,q:RI(30,80),hype:fr.fans*.22,cost:+((1+fr.fans/20)*I()).toFixed(1),adapt:1,writer:pick(S.people.writers).id})}
 });
 // shared-universe crossover
 const uni=S.franchises.filter(f=>f.universe&&f.fans>=35);
 if(uni.length>=2&&!S.projects.some(p=>p.type==='Crossover')&&Math.random()<.6){const a=uni[0],b=uni[1];
  out.push({type:'Crossover',genre:a.genre,title:a.name+' vs. '+b.name,base:a.name+' vs. '+b.name,part:1,fid:a.id,q:RI(40,85),hype:Math.min(48,(a.fans+b.fans)*.3),cost:+(6*I()).toFixed(1),adapt:1,writer:pick(S.people.writers).id})}
 let guard=0;
 while(out.length<6&&guard++<60){
  const st=pick(STYPES);const g=st.genres?pick(st.genres):pick(GENRES);const title=genTitle(g);
  if(out.some(o=>o.title===title)||S.films.some(f=>f.title===title))continue;
  const w=pick(S.people.writers);
  const q=clamp(Math.round(R(st.q[0],st.q[1])*.75+w.skill*.25+S.rep/14),10,98);
  out.push({type:st.k,genre:g,title,q,hype:st.hype*(st.game&&ev('gametrend')?1.8:1),crit:st.crit||0,adapt:st.adapt||0,fr:st.fr,game:st.game,writer:w.id,cost:+(R(st.cost[0],st.cost[1])*(0.6+q/100)*I()).toFixed(1)});
 }
 return out;
}
function scripts(){if(S.scriptsT!==tNow()){S.scripts=makeScripts();S.scriptsT=tNow()}return S.scripts}

function schedule(g,prod,days,style){const pre=2;const shoot=GEN[g].days?Math.max(1,Math.ceil((days||GEN[g].days)/22)):3;const post=2+Math.round(GEN[g].vfx*5)+(g==='Animation'?6:0)+(style==='stop'?3:0)+(style==='anime'?3:0)+(style&&g!=='Animation'?4:0);return{pre,shoot,post,total:pre+shoot+post}}
function phaseOf(p){const e=tNow()-p.startT;if(e<p.sch.pre)return'pre';if(e<p.sch.pre+p.sch.shoot)return'shoot';if(e<p.sch.total)return'post';return'ready'}
const PH={pre:'Pre-production',shoot:'Filming',post:'Post-production',ready:'Completed'};
function deptScore(g,d){const n=NEEDS[g];const tot=sum(DEPTS,x=>d[x[0]])||1;let diff=0;DEPTS.forEach(x=>diff+=Math.abs(d[x[0]]/tot-n[x[0]]));return 1-diff/2}
function prodSpend(w){const ideal=GEN[w.genre||w.script.genre].days;const df=ideal?(1+0.4*(w.days/ideal-1)):1;const loc=LOCS.find(l=>l.k===w.loc)||LOCS[0];const tar=(ev('tariff')&&loc.foreign)?1.2:1;
 const rt=(RUNTIMES.find(r=>r.m===(w.rt||120))||RUNTIMES[1]).c;const st=w.style?(ANIM_STYLES.find(a=>a.k===w.style)||{cost:1}).cost:1;return +(w.prod*df*tar*(1+rt)*st).toFixed(1)}
function rebateOf(w){const loc=LOCS.find(l=>l.k===w.loc)||LOCS[0];return +(prodSpend(w)*.8*(loc.rebate+(!loc.foreign?S.ev.usRebate:0))).toFixed(1)}

function castStats(p){
 const c=p.cast||{};const avg=(a,k,d)=>a.length?sum(a,x=>x[k])/a.length:d;
 const leads=[c.lead].concat(c.leads2||[]).map(person).filter(Boolean),cos=[c.co].concat(c.cos2||[]).map(person).filter(Boolean),sup=(c.sup||[]).map(person).filter(Boolean);
 const L=leads[0]||{star:30,skill:55},C=cos[0]||null;
 const tAct=x=>x.skill+(hasT(x,'hardworking')?4:0)+(hasT(x,'method')?6:0)-(hasT(x,'lazy')?5:0)-(hasT(x,'insecure')?2:0);
 const acting=(leads.length?sum(leads,tAct)/leads.length:55)*.45+(cos.length?sum(cos,tAct)/cos.length:50)*.3+(sup.length?sum(sup,tAct)/sup.length:50)*.25;
 const ls=leads.map(x=>x.star+(hasT(x,'charismatic')?6:0)).sort((a,b)=>b-a);
 const star=(ls[0]||30)*.55+(ls[1]||0)*.12+(cos.length?Math.max(...cos.map(x=>x.star)):15)*.22+avg(sup,'star',20)*.08+Math.min(4,sup.length)+(c.extras>0?Math.min(2,c.extras/500):0);
 return{acting,star,L,C,sup,leads,cos,all:leads.concat(cos,sup)};
}
function crewSkill(p){const c=person(p.comp),d=person(p.dp);return ((c?c.skill:55)+(d?d.skill:55))/2}

/* Build project from wizard choices */
function buildProject(w){
 const sc=w.script,g=sc.genre,dir=person(w.dir);
 const p={id:S.id++,kind:'film',title:sc.title,base:sc.base||sc.title,part:sc.part||1,fid:sc.fid||null,type:sc.type,adapt:sc.adapt,fr:sc.fr||0,game:sc.game,genre:g,rating:w.rating,
  dir:w.dir,writer:sc.writer,rewriter:w.rewriter||null,cast:{lead:w.lead,co:w.co||null,sup:w.sup.slice(),leads2:(w.leads2||[]).slice(),cos2:(w.cos2||[]).slice(),extras:w.extras||0},cut:'balanced',comp:w.comp||null,dp:w.dp||null,
  prod:w.prod,spend:prodSpend(w),rebate:rebateOf(w),mkt:w.mkt,depts:Object.assign({},w.depts),loc:w.loc,days:w.days,dist:w.dist,plf:w.plf,cofi:w.cofi?.4:0,backend:!!w.backend,
  releaseT:w.releaseT,startT:tNow(),sch:schedule(g,w.prod,w.days,w.style),acts:(w.acts||[]).slice(),g2:w.g2||null,rt:w.rt||120,vio:w.vio||0,exp:w.exp||0,style:w.style||null,poster:null,hype:sc.hype||0,events:[],chem:R(-7,7),fees:0,paid:0,prodPaid:0};
 const cs=castStats(p);const loc=LOCS.find(l=>l.k===w.loc);
 let sq=sc.q;if(w.rewriter){const rw=person(w.rewriter);if(rw&&rw.skill>sq)sq+=(rw.skill-sq)*.4}
 p.q=sq*.32+dir.skill*.27+cs.acting*.25+crewSkill(p)*.10+3.6+(dir.spec===g?5:0)+(cs.L.spec===g?3:0)+(sc.crit||0)-(sc.part>1?3:0)
  +(deptScore(g,w.depts)-.75)*24+(GEN[g].days?clamp(9*Math.log2(w.days/GEN[g].days),-14,4):0)+((loc.look||{})[g]||0)+R(-10,8)+(S.ev.ai==='adopt'?1:0);
 {const pf=PLOTS;let pq=0;(w.acts||[]).forEach(a=>{const P=pf.find(x=>x.k===a);if(P&&P.g.includes(g))pq+=1.6;else if(P)pq-=.6;else if(a){const wr=person(sc.writer);pq+=wr&&wr.skill>70?1.2:-.5}});p.q+=pq;
  const ri=RT_IDEAL[g]||120;p.q-=Math.abs((w.rt||120)-ri)/30*1.8;if((w.rt||120)>=150&&GEN[g].award>=.9)p.q+=1.5;
  const vf=VIO_FIT[g]||[0,40];const v=w.vio||0;p.vfit=v>=vf[0]&&v<=vf[1]?3:v<vf[0]?-(vf[0]-v)/12:-(v-vf[1])/12;
  if(w.style){const a=ANIM_STYLES.find(x=>x.k===w.style);if(a)p.q+=a.q}
  if(w.g2&&COMBO_GOOD.some(c=>(c[0]===g&&c[1]===w.g2)||(c[1]===g&&c[0]===w.g2))){p.q+=1.5;p.hype+=3}else if(w.g2)p.q-=1;
  p.rating=ratingFromContent(w.vio||0,w.exp||0);}
 applyTraitsLot(p,w);
 p.fees=+wizFees(w).toFixed(1);p.paid=p.fees;
 return p;
}
function wizFees(w){let f=w.script.cost;const d=person(w.dir);f+=crewFee(d,'directors');
 [w.lead,w.co].concat(w.sup).filter(Boolean).forEach(id=>{const a=person(id);f+=a?actorFee(a)*(id===w.lead&&w.backend?.4:1):0});
 if(w.comp)f+=crewFee(person(w.comp),'composers');if(w.dp)f+=crewFee(person(w.dp),'dps');if(w.rewriter)f+=crewFee(person(w.rewriter),'writers');
 return f}
function streamOffer(p){const cs=castStats(p);return +((p.spend+p.fees)*(1.05+cs.star/400+p.hype/500)).toFixed(1)}

/* ---------- Release simulation ---------- */
function gradeOf(s){return s>=92?'A+':s>=85?'A':s>=78?'A-':s>=72?'B+':s>=65?'B':s>=58?'B-':s>=50?'C+':s>=42?'C':s>=34?'C-':s>=25?'D':'F'}
function attendance(){let a=S.ev.attend;if(ev('recession'))a*=.88;const pd=S.ev.pandemic;if(pd){if(pd.until>=tNow())a*=0;else if(tNow()-pd.until<12)a*=.6+.4*(tNow()-pd.until)/12}return a}
function trendMult(g,p){let m=1;const tr=ev('trend');if(tr&&tr.g===g)m*=tr.mult;if(p&&p.game&&ev('gametrend'))m*=1.2;return m}
function reviewsFor(score){return shuffle(OUTLETS).slice(0,4).map(o=>{const s=clamp(Math.round(score+R(-14,14)),5,100);
 const q=s>=90?pick(['A masterpiece.','Instantly iconic.','Cinema at full power.','The year\'s best film.']):s>=75?pick(['Thrilling and confident.','Crowd-pleasing craft.','A genuine triumph.','Sharp, moving, alive.']):s>=60?pick(['Solid entertainment.','Flawed but fun.','Worth the ticket.','A decent night out.']):s>=40?pick(['Uneven and overlong.','Has its moments.','Forgettable.','A missed opportunity.']):pick(['An expensive misfire.','Painful.','Avoid.','A mess from start to finish.']);
 return{o,s,q}})}
function fanPosts(f){const good=f.aud>=70,bad=f.aud<50;const t=esc(f.title);
 const pos=[`just saw ${t} and I'm SHAKING 😭🔥`,`${t} is the movie of the year, no debate`,`the ending of ${t}… I need a minute`,`${t} deserves every penny. seeing it again this weekend`,`${pname(f.cast.lead)} carried ${t} 👏`];
 const mid=[`${t} was fine? not sure what the hype was`,`${t}: great first half, messy second half`,`wait for streaming on ${t} tbh`];
 const neg=[`${t} is a disaster lmao`,`who greenlit ${t}?? 💀`,`walked out of ${t} halfway`,`${t} trailer lied to us`];
 const pool=good?pos:bad?neg:mid;shuffle(pool).slice(0,3).forEach(s=>post(null,s,RI(good?5000:300,good?250000:40000)))}

function releaseFilm(p){
 if(rivalsAt(tNow()).some(r=>r.hype>85&&(r.wk||0)===(p.relWk||0)))p.hype-=6;
 const g=GEN[p.genre],t=tNow(),cs=castStats(p),d=person(p.dir)||{fame:40};
 const ib=g.budget*inf(t);const loc=LOCS.find(l=>l.k===p.loc)||LOCS[0];
 const eff=p.prod/loc.cost*(S.ev.ai==='adopt'?1+.25*g.vfx:1);
 const qb=clamp(16*Math.log2(eff/ib),-28,9)*(0.3+0.7*g.vfx);
 let q=clamp(p.q+qb+p.chem+R(-8,8)+(p.reshot?5+lotLv('screening')*2:0),3,97);
 const f={id:p.id,kind:'film',title:p.title,base:p.base,part:p.part,fid:p.fid,type:p.type,adapt:p.adapt,genre:p.genre,rating:p.rating,dir:p.dir,writer:p.writer,cast:p.cast,comp:p.comp,dp:p.dp,
  releaseT:t,dist:p.dist,prod:p.prod,mkt:p.mkt,awards:[],noms:[],q,loc:p.loc,fest:p.fest||null,fr:p.fr||0};
 f.critic=Math.round(clamp(q+R(-13,11)+((p.tm&&p.tm.crit)||0)+(p.cut==='director'?4:p.cut==='studio'?-3:0)+(p.rating==='R'&&['Drama','Thriller','Horror'].includes(p.genre)?2:0)+(p.fest?3:0),2,99));
 if(p.fest&&p.fest.score)f.critic=Math.round(clamp(p.fest.score+R(-4,4),2,99));
 f.aud=Math.round(clamp(q*.62+cs.star*.18+g.crowd+R(-8,12)+(p.part>1?6:0)+(p.vfit||0)+((p.tm&&p.tm.aud)||0)+(p.cut==='studio'?4:p.cut==='director'?-2:0),5,99));f.awardAdd=(p.tm&&p.tm.award)||0;f.acts=p.acts;f.g2=p.g2;f.rt=p.rt;f.poster=p.poster||defaultPoster(f);f.posterScore=posterScore(f,f.poster).score;f.trailer=p.trailer||null;
 f.grade=gradeOf(f.aud);f.reviews=reviewsFor(f.critic);critScores(f,p);
 const own=1-(p.cofi||0);
 if(p.dist==='stream'||p.dist==='sell'){
  f.dom=0;f.intl=0;f.ww=0;f.opening=0;f.weeks=[];f.countries=[];f.costTotal=+p.paid.toFixed(1);
  if(p.dist==='sell'){f.revenue=+(p.sellFee*own).toFixed(1);S.receivables.push({t:t+1,amt:f.revenue,label:f.title})}
  else{f.revenue=0;f.views=+(R(.6,1.4)*(q/60)*(10+cs.star/2+p.hype)*(S.streaming?Math.sqrt(S.streaming.subs+1)/4:1)*(p.style==='anime'?1.4:1)).toFixed(1);if(S.streaming)S.streaming.boost=(S.streaming.boost||0)+q*(1+cs.star/120)*.06;f.lib=1}
  f.profit=+(f.revenue-f.costTotal).toFixed(1);
  gainRep((f.critic-60)/14);fanPosts(f);updateFranchise(f);talentAfter(f,cs);
  addNews(`📺 <b>${esc(f.title)}</b> premieres ${p.dist==='sell'?'on a rival streamer':'on '+esc(S.streaming?S.streaming.name:'streaming')}. Critics ${f.critic}%.`);
  return f;
 }
 // P&A + premium formats + localization
 const plfCost=p.plf?2*inf(t):0, dub=2*inf(t)*(S.ev.ai==='adopt'?.2:1);
 const mktCash=(p.mkt+plfCost+dub)*own;S.cash-=mktCash;p.paid+=mktCash;
 const mktScore=Math.min(56,34*Math.log10(1+p.mkt/(5*inf(t))));
 const starW={Animation:.08,Horror:.14,Superhero:.18}[p.genre]||.27;
 let hype=14+lotLv('premiere')*3+cs.star*starW+d.fame*.07+mktScore+S.rep*.06+p.hype+(f.posterScore-50)/5+(p.test>=80?4:0)+clamp((eff/ib-1)*14,-14,8)*g.vfx;
 if(ev('sag'))hype-=5;
 hype=clamp(hype,4,130);f.hype=Math.round(hype);
 const seas=CAL[t%12].mult*(CAL[t%12].g[p.genre]||1);
 const hm=hype<=100?Math.pow(hype/50,1.5):2.83*Math.pow(hype/100,.6);
 let open=g.base*seas*compFactor(t)*ratingMult(p.genre,p.rating)*hm*29*Math.exp(gauss()*.38)*(0.72+f.critic/350)*inf(t)*attendance()*trendMult(p.genre,p);
 if(p.plf&&g.vfx>=.5)open*=1+.12*S.ev.plf;open*=1-Math.max(0,(p.rt||120)-120)/30*.05;if(p.style==='anime')open*=.72;open*=p.holBoost||1;if(p.spoil)f.aud=Math.max(5,f.aud-3);
 let drop=clamp(g.drop-(f.aud-60)/220-(f.critic-60)/600-([10,11].includes(t%12)?.06:0),.18,.7);
 let weeks=[];
 if(p.dist==='platform'){const power=clamp((f.critic-55)/35,0.05,1.25);const wo=open*power*.9;weeks=[wo*.03,wo*.08,wo*.25,wo*.6];let cur=wo*.85;const pd=clamp(drop-.08,.15,.6);for(let i=0;i<9;i++){weeks.push(cur);cur*=(1-pd)}f.screens=4}
 else{f.screens=Math.round(clamp(2200+hype*18,1800,4450));let cur=open;for(let i=0;i<30&&(i<3||cur>Math.max(.12*inf(t),open*.011));i++){weeks.push(cur);cur*=(1-drop*(i===0?1.05:1))}}
 f.relWk=p.relWk||0;f.relDate=p.relDate||null;f.track=p.track||null;f.shown=1;f.style=p.style||null;f.tier=p.tier||null;{const fr=.37+(p.part>1?.06:0)+(['Superhero','Horror'].includes(p.genre)?.04:0);f.wkend=[weeks[0]*fr,weeks[0]*.36,weeks[0]*(.64-fr)].map(x=>+x.toFixed(2))}f.opening=+weeks[0].toFixed(2);f.weeks=weeks.map(x=>+x.toFixed(2));
 f.dom=+sum(weeks).toFixed(1);
 // international, by country
 const chinaOK=Math.random()<clamp(-(p.exp||0)/150+.55+(['Superhero','Sci-Fi','Animation','Action'].includes(p.genre)?.15:0)-(p.rating==='R'?.3:0)+S.ev.china,.03,.92);
 const menaOK=!(p.rating==='R'&&Math.random()<.35);
 const intlBase=f.dom*g.intl*R(.8,1.2)*(0.7+cs.star/250)*(0.8+0.2*attendance());
 let wsum=0;const ws=COUNTRIES.map(c=>{let w=c.share*(c.aff[p.genre]!=null?c.aff[p.genre]:1);if(c.china&&!chinaOK)w=0;if(c.mena&&!menaOK)w=0;wsum+=w;return w});
 const intl=intlBase*(0.45+0.55*wsum)*(1+((p.tm&&p.tm.intl)||0));
 f.countries=COUNTRIES.map((c,i)=>({k:c.k,f:c.f,g:+(intl*ws[i]/(wsum||1)).toFixed(1),ban:(c.china&&!chinaOK)||(c.mena&&!menaOK)})).sort((a,b)=>b.g-a.g);
 if(p.style==='anime')f.countries.forEach(c=>{if(['Japan','South Korea','China'].includes(c.k))c.g=+(c.g*2).toFixed(1)});
 cs.leads.concat(cs.cos).forEach(x=>{const nt=natOf(x.nat);if(nt[3]){const c=f.countries.find(z=>z.k===nt[3]);if(c&&!c.ban){c.g=+(c.g*1.25).toFixed(1);c.star=x.n}}});
 f.intl=+sum(f.countries,c=>c.g).toFixed(1);f.countries.sort((a,b)=>b.g-a.g);f.ww=+(f.dom+f.intl).toFixed(1);f.china=chinaOK;
 const chinaG=(f.countries.find(c=>c.k==='China')||{g:0}).g;
 let domRent=0;weeks.forEach((w,i)=>domRent+=w*(i<2?.62:Math.max(.45,.60-i*.02))); // real-world sliding split: ~62% early, ~45% late, ~58% blended
 const myScreens=sum(S.theaters,c=>c.screens);domRent+=f.dom*.45*Math.min(.3,myScreens/40000);
 f.domRent=+domRent.toFixed(1);f.intlRent=+((f.intl-chinaG)*.4+chinaG*.25).toFixed(1);
 f.ancillary=+(f.ww*.18+p.prod*.07).toFixed(1);
 if(S.streaming){f.lib=1;f.ancillary=+(f.ancillary*.6).toFixed(1)} // pay-1 window goes to your own service instead
 f.backendPay=p.backend?+(f.ww*.05).toFixed(1):0;
 const gross=f.domRent+f.intlRent+f.ancillary-f.backendPay;f.partner=+(gross*(p.cofi||0)).toFixed(1);f.revenue=+(gross-f.partner).toFixed(1);
 f.costTotal=+p.paid.toFixed(1);f.profit=+(f.revenue+(p.rebate||0)*own-f.costTotal).toFixed(1);f.rebate=+((p.rebate||0)*own).toFixed(1);
 if(p.shares&&f.profit>0){f.sharePay=+(f.profit*p.shares/100).toFixed(1);f.profit=+(f.profit-f.sharePay).toFixed(1);S.cash-=f.sharePay}
 S.receivables.push({t:t+1,amt:(f.domRent+f.intlRent-f.backendPay*.6)*own,label:f.title+' theatrical'});
 S.receivables.push({t:t+2,amt:(f.ancillary*.6-f.backendPay*.4)*own,label:f.title+' home & PVOD'});
 S.receivables.push({t:t+6,amt:f.ancillary*.4*own,label:f.title+' TV licensing'});
 if(S.streaming)S.streaming.boost=(S.streaming.boost||0)+q*.03;
 const y=yearOf(t);S.market['_'+y]=S.market['_'+y]||{};S.market['_'+y].__me=(S.market['_'+y].__me||0)+f.dom;
 const big=f.ww>500*inf(t),flop=f.profit<-f.costTotal*.35;
 gainRep((f.critic-58)/7+(f.profit>0?3:-3)+(big?4:0));
 talentAfter(f,cs,big,flop);updateFranchise(f);fanPosts(f);
 addNews(`🎟️ <b>${esc(f.title)}</b> opens to ${M(f.opening)}${p.dist==='platform'?' in limited release':''} — ${verdict(f)}. 🍅 ${f.critic}% · ${f.grade}${!chinaOK?' · denied release in China':''}`);
 if(f.opening>150*inf(t))addNews(`📈 Record-breaking: <b>${esc(f.title)}</b> posts one of the biggest openings of the decade.`);
 return f;
}
function talentAfter(f,cs,big,flop){
 cs.all.forEach(x=>{if(x.id&&x!==cs.L){x.star=clamp(x.star+(big?3:f.profit>0?1:flop?-2:0),3,99)}});const L=cs.L;if(L&&L.id){L.star=clamp(L.star+(big?7:f.profit>0?3:flop?-6:-1)+(f.critic>=85?3:0),3,99);if(f.profit>0)L.hits++;L.loyal=(L.loyal||0)+(f.profit>0?1:0)}
 if(cs.C&&cs.C.id)cs.C.star=clamp(cs.C.star+(big?4:f.profit>0?2:-2),3,99);
 const d=person(f.dir);if(d)d.fame=clamp(d.fame+(f.critic>=80?5:f.critic<40?-4:1)+(big?3:0),3,99);
 const w=person(f.writer);if(w)w.fame=clamp(w.fame+(f.critic>=80?4:0),3,99);
}
function verdict(f){if(f.dist==='stream')return'📺 Streaming premiere';if(f.dist==='sell')return'📺 Sold to streamer';const r=f.profit/Math.max(1,f.costTotal);
 return f.ww>=1000?'🌍 Billion-dollar phenomenon':r>1.5?'💰 Massive hit':r>.5?'🎉 Big hit':r>0?'👍 Modest success':r>-.35?'😬 Disappointment':'💣 Box-office bomb'}
function gainRep(d){S.rep=clamp(S.rep+(d>0?d*(1-S.rep/115):d),0,100)}

/* ---------- Franchises ---------- */
function updateFranchise(f){
 let fr=f.fid?S.franchises.find(x=>x.id===f.fid):null;
 if(!fr){const eligible=(f.dist!=='sell')&&((f.profit>f.costTotal*.3&&f.aud>=62)||(f.aud>=55&&Math.random()<(f.fr||0)*.7));
  if(!eligible)return;
  fr={id:'fr'+f.id,name:f.base||f.title,genre:f.genre,fans:0,parts:0,universe:false,films:[]};S.franchises.push(fr);f.fid=fr.id;
  addNews(`🌟 <b>${esc(fr.name)}</b> is now a franchise. Fans want more.`)}
 fr.parts++;fr.films.push(f.id);
 fr.fans=clamp(fr.fans+(f.aud-60)/2.5+(f.profit>0?8:-10)+(f.ww>800*I()?10:0),0,100);
}

function applyTraitsLot(p,w){const g=p.genre;const cs=castStats(p);const crew=[p.dir,p.writer,p.dp,p.comp,p.rewriter].map(person).filter(Boolean);const all=cs.all.concat(crew);
 let q=0,sm=1,chem=0,crit=0,aud=0,intl=0,award=0;const notes=[];
 all.forEach(x=>{(x.traits||[]).forEach(t=>{
  if(t==='beloved')chem+=1.5;if(t==='method')chem-=1;if(t==='hothead')chem-=1.5;if(t==='diva')chem-=1.5;if(t==='difficult'){chem-=2;sm*=1.05}
  if(t==='linguist')intl+=.04;if(t==='magnet')award+=2;if(t==='stunts'&&['Action','Superhero'].includes(g))q+=1.5;if(t==='professional')q+=.5;
  if(t==='visionary')q+=2.5;if(t==='efficient')sm*=.93;if(t==='perfectionist'){q+=2;sm*=1.1}if(t==='fx'&&GEN[g].vfx>=.5)q+=2.5;if(t==='crowd')aud+=3;if(t==='auteur'){crit+=4;aud-=2}
  if(t==='lazy'&&crew.includes(x))q-=2;if(t==='hardworking'&&crew.includes(x))q+=1.5;
  if(t==='unreliable'&&Math.random()<.2){p.sch.post++;p.sch.total++;notes.push(x.n)}})});
 // studio lot
 q+=lotLv('writers')*1.2+lotLv('scoring')*.8;
 if(['Action','Drama','Comedy','Romance','Thriller'].includes(g))sm*=1-lotLv('backlot')*.05;
 if(['Biopic','Drama','Romance','Superhero'].includes(g))q+=lotLv('costume')*1.5;
 if(['Action','Superhero','Thriller'].includes(g))q+=lotLv('stunt')*1.5;
 if(GEN[g].vfx>=.5){sm*=1-lotLv('vfx')*.06;q+=lotLv('vfx')}
 if(['Sci-Fi','Superhero','Action'].includes(g))sm*=1-lotLv('led')*.07;
 if(['Animation','Sci-Fi','Superhero'].includes(g))q+=lotLv('mocap')*2;
 sm*=1-lotLv('aiprevis')*.04;
 const ex=(p.cast&&p.cast.extras)||0;if(ex){p.spend+=ex*(p.days||30)*.00002*I();if(EPIC.includes(g))q+=Math.min(3,ex/400);else q+=Math.min(1,ex/800)}
 p.q+=q;p.chem+=chem;p.spend=+(p.spend*sm).toFixed(1);p.rebate=+(p.rebate*sm).toFixed(1);p.tm={crit,aud,intl,award};
 if(notes.length)p.lateNote=notes[0];
}
