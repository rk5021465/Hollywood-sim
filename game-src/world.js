/* ===================== WORLD: monthly turn, events, festivals, awards ===================== */
let QUEUE=[];
function queueDecision(d){QUEUE.push(()=>decisionScreen(d))}

const PEVENTS=[
 {t:'trailer for {f} leaks early and racks up 40M views',hype:8,ph:['post']},
 {t:'{a} injured doing a stunt on {f}; production shuts down for two weeks',cost:.06,ph:['shoot'],stunt:1},
 {t:'{d} demands reshoots on {f}',cost:.08,q:4,ph:['post']},
 {t:'weather delays hit the {f} location shoot',cost:.05,ph:['shoot']},
 {t:'surprise cameo in {f} leaks online',hype:7,ph:['shoot','post']},
 {t:'messy script rewrites on the {f} set',q:-6,ph:['pre','shoot']},
 {t:'{a} and {d} feud publicly on the {f} set',q:-4,hype:4,ph:['shoot']},
 {t:'editors find the heart of {f} — insiders rave',q:5,ph:['post']},
 {t:'VFX vendor misses deadlines on {f}; overtime bills arrive',cost:.07,q:-2,ph:['post'],vfx:1},
 {t:'{f} VFX work goes so badly the release slips a month',delay:1,cost:.04,ph:['post'],vfx:1},
 {t:'{f} shoot wraps under budget',cost:-.05,ph:['shoot']},
 {t:'{d} falls ill; second unit takes over on {f}',q:-5,ph:['shoot']},
 {t:'{f} composer delivers a stunning score',q:3,ph:['post']},
 {t:'set photos from {f} go viral',hype:5,ph:['shoot']},
 {t:'{f} hit by an on-set hacking leak of the script',hype:-4,cost:.02,ph:['pre','shoot']},
];

function nextMonth(){
 if(!KEEPQ)QUEUE=[];KEEPQ=0;S.wk=0;const before=S.cash;
 S.month++;if(S.month>11){S.month=0;S.year++}
 const t=tNow();
 if(S.year>END_YEAR){S.over=true;S.retired=true;save();return runQueue()}
 // overhead & interest
 const oh=overhead();S.cash-=oh;if(S.cash<0)S.cash-=Math.abs(S.cash)*.008;
 S.receivables.filter(r=>r.t===t).forEach(r=>S.cash+=r.amt);S.receivables=S.receivables.filter(r=>r.t>t);
 rivalsAhead();S.rivalFilms=S.rivalFilms.filter(r=>r.t>=t-2);
 worldEvents();
 // business lines
 const m={stream:streamTick(),merch:merchTick(),park:parkTick(),theaters:theaterTick()};
 tvTick();
 productionTick();
 // rivals
 rivalsAt(t).forEach(r=>{const dom=25*Math.pow(r.hype/50,1.6)*CAL[t%12].mult*(CAL[t%12].g[r.g]||1)*GEN[r.g].base*inf(t)*R(.5,1.5)*compFactor(t)*R(2.3,3.4)*attendance()*trendMult(r.g);r.dom=r.str?0:r.lim?dom*.3:dom;
  const y=yearOf(t);S.market['_'+y]=S.market['_'+y]||{};S.market['_'+y][r.studio]=(S.market['_'+y][r.studio]||0)+dom;
  const rv=S.rivals.find(x=>x.n===r.studio);if(rv)rv.films++;histPush(r);
  if(dom>350*I())addNews(`📈 ${esc(r.studio)}'s <i>${esc(r.title)}</i> is a juggernaut — ${M(dom)} domestic.`)});
 S.rivals.forEach(r=>{if(r.alive&&r.svc)r.subs=Math.max(5,r.subs*(1+R(-.01,.015)))});
 // calendar
 if(S.month===0){QUEUE.push(yearEnd);sundanceMarket()}
 if(S.month===1)superBowl();
 if(FESTIVALS[S.month])festival(FESTIVALS[S.month]);
 if(S.month===2)QUEUE.push(filmAwards);
 if(S.month===8)QUEUE.push(tvAwards);
 if(S.month===0||S.month===6)refreshTalent();
 if(typeof weekBO==='function')weekBO();
 stockTick();
 S.log.cf=S.log.cf||[];S.log.cf.push(+(S.cash-before).toFixed(1));if(S.log.cf.length>36)S.log.cf.shift();
 S.log.last=m;
 if(S.cash<-creditLimit()){S.over=true;S.retired=false}
 save();runQueue();
}
function lotUpkeep(){return sum(BUILDINGS,b=>lotLv(b.k)*b.up)*I()}
function overhead(){return +(lotUpkeep()+(1.2+S.rep*.035+S.projects.length*.25+S.shows.filter(s=>s.status==='prod').length*.15)*I()).toFixed(1)}

/* ---------- Production ---------- */
function productionTick(){
 const t=tNow();
 S.projects.slice().forEach(p=>{
  const ph=phaseOf(p);
  // strikes & pandemic pause work
  const paused=(ph==='pre'&&ev('wga'))||(ph==='shoot'&&ev('sag'))||(S.ev.pandemic&&S.ev.pandemic.until>=t&&ph!=='post'&&ph!=='ready');
  if(paused&&!p.acquired){p.startT++;if(p.releaseT<=p.startT+p.sch.total&&p.dist!=='stream')p.releaseT=p.startT+p.sch.total;if(!p.pauseNews){addNews(`⏸️ Work on <b>${esc(p.title)}</b> is paused.`);p.pauseNews=1}return}
  p.pauseNews=0;
  const own=1-(p.cofi||0);
  if(ph!=='ready'){const inst=p.spend/p.sch.total;const pay=Math.min(inst,p.spend-p.prodPaid);S.cash-=pay*own;p.paid+=pay*own;p.prodPaid+=pay}
  else if(p.prodPaid<p.spend){const rem=p.spend-p.prodPaid;S.cash-=rem*own;p.paid+=rem*own;p.prodPaid=p.spend}
  if(ph==='pre'&&!p.tableRead&&t-p.startT>=1&&p.cast.co){p.tableRead=1;const C=pname(p.cast.co),L=pname(p.cast.lead);
   addNews(p.chem>3?`✨ Table read for <b>${esc(p.title)}</b>: ${esc(L)} and ${esc(C)} have electric chemistry.`:p.chem<-3?`😬 Table read for <b>${esc(p.title)}</b>: ${esc(L)} and ${esc(C)} just don't click.`:`📖 Table read for <b>${esc(p.title)}</b> goes smoothly.`)}
  if(Math.random()<.3&&!p.acquired){const pool=PEVENTS.filter(e=>e.ph.includes(ph)&&(!e.vfx||GEN[p.genre].vfx>.5)&&(!e.stunt||p.depts.stunts>10));
   if(pool.length){const e=pick(pool);let txt=e.t.replace('{f}','<b>'+esc(p.title)+'</b>').replace('{a}',esc(pname(p.cast.lead))).replace('{d}',esc(pname(p.dir)));
    if(e.cost){const c=+(p.spend*e.cost*own).toFixed(1);S.cash-=c;p.paid+=c;txt+=` (${c>=0?'+':''}${M(c)})`}
    if(e.q)p.q+=e.q;if(e.hype)p.hype+=e.hype;
    if(e.delay){p.sch.post++;p.sch.total++;if(p.dist!=='stream'&&p.startT+p.sch.total>p.releaseT)p.releaseT=p.startT+p.sch.total}
    addNews('🎬 '+txt.charAt(0).toUpperCase()+txt.slice(1))}}
  if(phaseOf(p)==='ready'&&!p.test&&p.dist!=='stream'&&p.dist!=='sell'){p.test=Math.round(clamp(p.q+p.chem+R(-8,8),5,99));addNews(`📋 <b>${esc(p.title)}</b> test-screens at ${p.test}/100${p.test>=75?' — the studio is thrilled':p.test<50?' — execs are nervous':''}`)}
  // auto trailer 2 months out
  if(!p.trailer&&p.releaseT-t<=2&&(ph==='post'||ph==='ready')&&p.dist!=='sell')dropTrailer(p,true);
  if(p.releaseT<t||(p.releaseT===t&&(p.relWk||0)<=(S.wk||0))){
   if(phaseOf(p)!=='ready'){p.releaseT=t+1;const w=+(p.mkt*.05*own).toFixed(1);S.cash-=w;p.paid+=w;addNews(`⚠️ <b>${esc(p.title)}</b> isn't finished and slips to ${tLabel(t+1)}.`);return}
   if(S.ev.pandemic&&S.ev.pandemic.until>=t&&(p.dist==='wide'||p.dist==='platform')){
    queueDecision({title:'🦠 Theaters are closed',text:`<b>${esc(p.title)}</b> is due out, but cinemas are shut. What do you do?`,opts:[
     {l:'Delay 4 months',f:()=>{p.releaseT=tNow()+4;addNews(`📅 <b>${esc(p.title)}</b> delayed by the theater shutdown.`)}},
     ...(svcLive()?[{l:'Premiere on '+S.streaming.name,f:()=>{p.dist='stream';p.releaseT=tNow()+1}}]:[]),
     {l:`Sell to a streamer (${M(streamOffer(p)*.85)})`,f:()=>{p.dist='sell';p.sellFee=streamOffer(p)*.85;p.releaseT=tNow()+1}}]});
    p.releaseT=t+1;return}
   const f=releaseFilm(p);S.projects=S.projects.filter(x=>x!==p);S.films.push(f);
   if(p.cast){allCast(p.cast).forEach(id=>{const a=person(id);if(a&&a.busy>t)a.busy=t})}
   QUEUE.push(()=>releaseScreen(f));
  }
 });
}
function dropTrailer(p,auto){
 const tq=clamp(p.q+p.chem+R(-12,12),5,99);const views=+(R(.6,1.4)*(5+p.hype*.6+castStats(p).star*.4)*(GEN[p.genre].base)).toFixed(1);
 const like=clamp(Math.round(55+(tq-60)*.8+R(-8,8)),20,98);
 p.trailer={t:tNow(),views,like:clamp(like+lotLv('marketing')*4,5,99)};p.hype+=(tq-55)/5+Math.min(5,views/10);
 addNews(`🎞️ ${auto?'The':'A new'} trailer for <b>${esc(p.title)}</b> hits ${views}M views in 24 hours (${like}% positive).`);
 post(null,like>=75?`the ${esc(p.title)} trailer just gave me chills 🥶🔥`:like<50?`that ${esc(p.title)} trailer... yikes 💀`:`${esc(p.title)} trailer looks ok I guess`,Math.round(views*900));
}

/* ---------- World events ---------- */
function startEv(k,months,extra){S.ev[k]=Object.assign({until:tNow()+months-1},extra||{});S.ev['cd_'+k]=tNow()+months+36}
const canEv=k=>!ev(k)&&(S.ev['cd_'+k]||0)<tNow();
function worldEvents(){
 const t=tNow(),y=S.year;
 if(canEv('wga')&&Math.random()<.006){const m=RI(3,6);startEv('wga',m);S.ev.feeMult*=1.04;addNews(`✊ The Writers Guild goes on strike (${m} months expected). No new scripts; projects in development freeze. (The 2023 strike lasted 148 days.)`)}
 if(canEv('sag')&&Math.random()<.005){const m=RI(3,5);startEv('sag',m);S.ev.feeMult*=1.05;addNews(`✊ SAG-AFTRA actors strike! Cameras stop rolling, and stars can't promote films for ${m} months. AI protections are a key demand.`)}
 if(canEv('recession')&&Math.random()<.006){const m=RI(12,20);startEv('recession',m);addNews(`📉 Recession hits. Moviegoing, merchandise and streaming sign-ups weaken for about ${Math.round(m/12*10)/10} years.`)}
 if((!S.ev.pandemic||t-S.ev.pandemic.until>150)&&y>=2029&&Math.random()<.0015){const m=RI(3,6);S.ev.pandemic={until:t+m-1};addNews(`🦠 A global pandemic shuts cinemas and productions for ~${m} months. Attendance will take a year to recover.`)}
 if(!S.ev.ai&&y>=2028&&Math.random()<.04){S.ev.ai='pending';queueDecision({title:'🤖 Generative AI arrives in Hollywood',text:'New AI tools can cut VFX costs by ~25% and make dubbing nearly free. Unions and fans are wary. What is your studio\'s policy?',opts:[
  {l:'Adopt AI tools',f:()=>{S.ev.ai='adopt';gainRep(-6);S.ev.strikeRisk=2;addNews(`🤖 ${esc(S.name)} embraces AI in production. Unions protest; #BoycottAI trends.`);post('unionstrong','studios replacing artists with AI? not on our watch ✊',RI(20000,200000))}},
  {l:'Pledge "human-made"',f:()=>{S.ev.ai='human';gainRep(4);addNews(`🧑‍🎨 ${esc(S.name)} pledges human-made films. Guilds applaud.`)}}]})}
 if(canEv('trend')&&Math.random()<.02){const g=pick(GENRES);const boom=Math.random()<.5;startEv('trend',18,{g,mult:boom?1.25:.8});
  addNews(boom?`🔥 Trend watch: audiences are flocking to ${g.toLowerCase()} films.`:`🥱 Trend watch: "${g} fatigue" sets in — audiences are tired of ${g.toLowerCase()} films.`)}
 if(canEv('gametrend')&&y>=2026&&Math.random()<.01){startEv('gametrend',24);addNews(`🎮 Video-game adaptations are box-office gold right now. Studios race to buy game rights.`)}
 if(canEv('tariff')&&Math.random()<.006){startEv('tariff',18);addNews(`🛃 Washington imposes a tariff on films made abroad. Foreign shoots cost 20% more for 18 months.`)}
 if(!S.ev.fed&&y>=2027&&Math.random()<.006){S.ev.fed=1;S.ev.usRebate=.05;addNews(`🏛️ Congress passes a federal film tax credit: +5% on top of state incentives for US shoots.`)}
 if(canEv('china')&&Math.random()<.008){const open=Math.random()<.5;S.ev.china=open?.15:-.3;startEv('china',24);addNews(open?`🇨🇳 China eases its quota on imported films.`:`🇨🇳 China tightens approvals for Hollywood films.`)}
 if(!ev('china')&&S.ev.china){S.ev.china=0}
 if(canEv('pricewar')&&S.rivals.some(r=>r.alive&&r.svc)&&Math.random()<.007){startEv('pricewar',6);addNews(`💸 Streaming price war: a rival slashes prices. Subscribers are shopping around.`)}
 if(canEv('plfboom')&&Math.random()<.005){startEv('plfboom',24);S.ev.plf=1.6;addNews(`🎦 Premium formats boom: IMAX and big-screen tickets drive a growing share of grosses.`)}
 if(!ev('plfboom'))S.ev.plf=1;
 if(Math.random()<.004&&S.ev.attend>.85){S.ev.attend*=.97;const c=pick(['CineWorld East','ReelTime Theaters','Galaxy Screens']);
  addNews(`🏚️ Theater chain ${c} files for bankruptcy; hundreds of screens go dark.`)}
 if(Math.random()<.006)S.ev.attend=Math.min(1,S.ev.attend+.02);
 // talent scandal
 if(Math.random()<.025){const a=pick(S.people.actors.filter(x=>x.star>50));if(a){a.star=Math.max(5,a.star-30);addNews(`📰 Scandal: allegations surface about ${esc(a.n)}. Brands drop the star.`);
  post(null,`can't believe what came out about ${esc(a.n)} 😳`,RI(30000,300000));
  const p=S.projects.find(x=>x.cast.lead===a.id||x.cast.co===a.id);
  if(p)queueDecision({title:'📰 Your star is in a scandal',text:`${esc(a.n)} is attached to <b>${esc(p.title)}</b>. Recasting costs time and money; standing by hurts buzz.`,opts:[
   {l:`Recast (${M(p.spend*.06)}, +1 month)`,f:()=>{const c=p.spend*.06;S.cash-=c;p.paid+=c;p.sch.post++;p.sch.total++;if(p.startT+p.sch.total>p.releaseT)p.releaseT=p.startT+p.sch.total;
     const alt=S.people.actors.filter(x=>!busy(x)&&!lockA(x)&&x.id!==a.id).sort((x,y)=>y.star-x.star)[0];if(alt){if(p.cast.lead===a.id)p.cast.lead=alt.id;else p.cast.co=alt.id;addNews(`🔄 ${esc(alt.n)} replaces ${esc(a.n)} in <b>${esc(p.title)}</b>.`)}}},
   {l:'Stand by them',f:()=>{p.hype-=12}}]})}}
 // rival M&A
 const alive=S.rivals.filter(r=>r.alive);
 if(alive.length>3&&Math.random()<.008){const [a,b]=shuffle(alive);a.p=+(a.p+b.p*.6).toFixed(2);b.alive=false;if(b.svc&&a.svc)a.subs+=b.subs*.6;S.rivalFilms.forEach(f=>{if(f.studio===b.n)f.studio=a.n});
  addNews(`🤝 Merger: <b>${esc(a.n)}</b> swallows ${esc(b.n)}, creating a bigger rival.`)}
 if(alive.length>2&&Math.random()<.003){const r=pick(alive.filter(x=>x.p<1));if(r){r.alive=false;S.rivalFilms=S.rivalFilms.filter(f=>f.studio!==r.n);const price=Math.round(rivalValue(r)*.35);
  addNews(`💀 ${esc(r.n)} goes bankrupt.`);queueDecision({title:'💼 Library for sale',text:`Bankrupt ${esc(r.n)}'s film library is up for auction. Buy it for ${M(price)}? It adds yearly licensing income and prestige.`,opts:[
   {l:`Buy for ${M(price)}`,f:()=>{S.cash-=price;S.libExtra=(S.libExtra||0)+rivalValue(r)*.05;gainRep(3);addNews(`📚 ${esc(S.name)} buys the ${esc(r.n)} library.`)}},{l:'Pass',f:()=>{}}]})}}
 // AI raises strike risk
 if(S.ev.strikeRisk===2&&canEv('sag')&&Math.random()<.004){const m=RI(2,4);startEv('sag',m);addNews(`✊ Actors walk out over AI replicas.`)}
}

/* ---------- Festivals, Sundance market, Super Bowl ---------- */
function festival(fe){
 const t=tNow();const elig=S.projects.filter(p=>!p.fest&&(phaseOf(p)==='ready'||phaseOf(p)==='post')&&p.dist!=='sell'&&p.releaseT-t<=6&&p.releaseT>=t);
 if(!elig.length)return;
 queueDecision({title:`🎞️ ${fe.k} Film Festival`,text:`Premiere a film at ${fe.k}? Festival reviews come out early — great buzz if critics love it, a stumble if they don't. Top prize: ${fe.prize}.`,opts:[
  ...elig.slice(0,3).map(p=>({l:'Premiere '+p.title,f:()=>{const sc=Math.round(clamp(p.q+p.chem+R(-6,6)+(p.reshot?5:0),5,99));p.fest={k:fe.k,score:sc};p.hype+=(sc-60)/3;
   let msg=`🎞️ <b>${esc(p.title)}</b> premieres at ${fe.k}: critics ${sc}%.`;if(sc>=88&&Math.random()<.45){p.fest.prize=fe.prize;S.awards.fest++;gainRep(4);msg+=` It wins the <b>${fe.prize}</b>!`}
   if(sc>=80)msg+=' Awards buzz begins.';else if(sc<55)msg+=' Some walkouts reported.';addNews(msg)}})),
  {l:'Skip this year',f:()=>{}}]});
}
function sundanceMarket(){
 const t=tNow();const films=[];for(let i=0;i<3;i++){const g=pick(['Drama','Comedy','Horror','Thriller','Romance','Biopic']);const sc=RI(55,96);
  films.push({title:genTitle(g),genre:g,score:sc,price:+((1+Math.pow(sc/60,4)*3)*I()).toFixed(1),prod:+(R(3,12)*I()).toFixed(1)})}
 S.sundance=films;
 queueDecision({title:'❄️ Sundance acquisitions market',text:'Indie films are premiering in Park City. Buy distribution rights to a finished film? You can release it in theaters or on streaming.',opts:[
  ...films.map(f=>({l:`${GEN[f.genre].icon} ${f.title} · ${f.score}% · ${M(f.price)}`,f:()=>buyIndie(f)})),{l:'Pass',f:()=>{}}]});
}
function buyIndie(fi){const t=tNow();S.cash-=fi.price;
 const p={id:S.id++,kind:'film',title:fi.title,base:fi.title,part:1,fid:null,type:'Festival acquisition',adapt:0,genre:fi.genre,rating:GEN[fi.genre].rating,dir:pick(S.people.directors).id,writer:pick(S.people.writers).id,
  cast:{lead:pick(S.people.actors.filter(a=>a.star<45)).id,co:null,sup:[]},comp:null,dp:null,prod:fi.prod,spend:fi.prod,rebate:0,mkt:+(fi.prod*1.5).toFixed(1),depts:Object.assign({},NEEDS[fi.genre]),loc:'Los Angeles',days:GEN[fi.genre].days,
  dist:'platform',plf:false,cofi:0,releaseT:t+4,startT:t-8,sch:{pre:2,shoot:2,post:4,total:8},hype:(fi.score-60)/3+4,events:[],chem:0,fees:fi.price,paid:fi.price,prodPaid:fi.prod,q:fi.score-3,acquired:1,fest:{k:'Sundance',score:fi.score}};
 S.projects.push(p);addNews(`❄️ ${esc(S.name)} wins a bidding war for Sundance hit <b>${esc(fi.title)}</b> (${M(fi.price)}). Dated ${tLabel(p.releaseT)}.`)}
function superBowl(){const t=tNow();const c=+(8*inf(t)/inf(START_YEAR)).toFixed(1);
 const elig=S.projects.filter(p=>(p.dist==='wide')&&p.releaseT>t&&p.releaseT<=t+6&&!p.sb);if(!elig.length)return;
 queueDecision({title:'🏈 Super Bowl ad',text:`A 30-second Super Bowl spot costs about ${M(c)} (the 2026 average was ~$8M). It reaches 100M+ viewers.`,opts:[
  ...elig.slice(0,3).map(p=>({l:`Buy a spot for ${p.title}`,f:()=>{S.cash-=c;p.paid+=c;p.sb=1;p.hype+=10;addNews(`🏈 <b>${esc(p.title)}</b>'s Super Bowl spot is the most-watched trailer of the night.`)}})),{l:'Skip',f:()=>{}}]})}

/* ---------- Awards ---------- */
function rivalTitle(){return genTitle(pick(['Drama','Biopic','Thriller','Sci-Fi','Romance']))}
function filmAwards(){
 const y=S.year-1;const films=S.films.filter(f=>yearOf(f.releaseT)===y&&f.dist!=='sell');
 const aw=f=>0.85+GEN[f.genre].award*.15;const sk=id=>{const p=person(id);return p?p.skill:55};
 const lead=(f,g)=>{const a=person(f.cast.lead);if(a&&a.g!==g){const o=(f.cast.leads2||[]).map(person).find(x=>x&&x.g===g);if(o)return (o.skill*.5+f.critic*.5)*(.88+GEN[f.genre].award*.12)}return a&&a.g===g?(a.skill*.5+f.critic*.5)*(.88+GEN[f.genre].award*.12):0};
 const cats=[
  {k:'Best Picture',s:f=>(f.critic*.7+f.q*.3)*aw(f),th:[89,99]},
  {k:'Best Director',s:f=>f.q*aw(f),th:[87,98]},
  {k:'Best Actor',s:f=>lead(f,'M'),th:[86,97]},
  {k:'Best Actress',s:f=>lead(f,'F'),th:[86,97]},
  {k:'Best Supporting Performance',s:f=>{const ids=[f.cast.co].concat(f.cast.cos2||[],f.cast.sup).filter(Boolean);if(!ids.length)return 0;return (Math.max(...ids.map(sk))*.5+f.critic*.5)*(.88+GEN[f.genre].award*.12)},th:[85,96]},
  {k:'Best Original Screenplay',s:f=>f.adapt?0:f.critic*(.88+GEN[f.genre].award*.12)+(sk(f.writer)-60)/8,th:[86,97]},
  {k:'Best Adapted Screenplay',s:f=>!f.adapt?0:f.critic*(.88+GEN[f.genre].award*.12)+(sk(f.writer)-60)/8-(f.part>1?10:0),th:[85,96]},
  {k:'Best Cinematography',s:f=>f.dp?sk(f.dp)*.5+f.critic*.45+(['Sci-Fi','Biopic','Drama'].includes(f.genre)?4:0):0,th:[85,96]},
  {k:'Best Original Score',s:f=>f.comp?sk(f.comp)*.5+f.critic*.45:0,th:[85,96]},
  {k:'Best Visual Effects',s:f=>Math.min(1,f.prod/(250*inf(f.releaseT)))*40+GEN[f.genre].vfx*35+f.critic*.2,th:[82,96]},
  {k:'Best Animated Feature',s:f=>f.genre==='Animation'?f.critic:0,th:[86,97]},
 ];
 const res=[];
 cats.forEach(c=>{let best=null,bs=0;films.forEach(f=>{let s=c.s(f);if(!s)return;s+=(f.awardAdd||0)+(f.fyc?Math.log2(1+f.fyc/(5*inf(f.releaseT)))*2:0)+(f.dist==='platform'?2:0)+([8,9,10,11].includes(f.releaseT%12)?1.5:0)+(f.fest&&f.fest.score>=85?2:0);if(s>bs){bs=s;best=f}});
  if(!best||bs<c.th[0]-6)return;const win=bs>R(c.th[0],c.th[1]);res.push({cat:c.k,film:best,win,rival:rivalTitle()});best.noms.push(c.k);
  if(win){best.awards.push(c.k);S.awards.film++;gainRep(5);const bump=+(6*I()).toFixed(1);S.cash+=bump;best.profit+=bump;
   const pid=c.k==='Best Director'?best.dir:c.k.includes('Act')?best.cast.lead:c.k.includes('Screenplay')?best.writer:c.k==='Best Cinematography'?best.dp:c.k==='Best Original Score'?best.comp:null;
   const pp=person(pid);if(pp){if(pp.star!=null)pp.star=clamp(pp.star+8,0,99);if(pp.fame!=null)pp.fame=clamp(pp.fame+8,0,99)}}});
 const wins=res.filter(r=>r.win);if(wins.length)addNews(`🏆 ${esc(S.name)} wins ${wins.length} Golden Statue${wins.length>1?'s':''} at the ${y} ceremony!`);
 awardsScreen(`THE ${y} GOLDEN STATUE AWARDS`,'Awards night',films.length,res,'The Academy rewards acclaimed work: dramas and biopics with 85%+ reviews, released September–December, with a festival premiere and a For Your Consideration campaign.');
}
function tvAwards(){
 const t=tNow();const seasons=[];S.shows.forEach(sh=>sh.seasons.forEach(se=>{if(t-se.t<=12)seasons.push({sh,se})}));
 const res=[];const cats=[
  {k:'Best Drama Series',ok:s=>['Prestige Drama','Crime Drama','Fantasy Epic','Sci-Fi Series'].includes(s.sh.genre)},
  {k:'Best Comedy Series',ok:s=>['Comedy','Animated Series'].includes(s.sh.genre)},
  {k:'Best Limited Series',ok:s=>s.sh.genre==='Limited Series'},
  {k:'Best Lead Performance (TV)',ok:s=>!!s.sh.lead}];
 cats.forEach(c=>{let best=null,bs=0;seasons.filter(c.ok).forEach(s=>{const sc=s.se.critic*(.85+TV_GENRES[s.sh.genre].award*.15)+(c.k.includes('Lead')?((person(s.sh.lead)||{skill:50}).skill-60)/5:0);if(sc>bs){bs=sc;best=s}});
  if(!best||bs<80)return;const win=bs>R(84,97);res.push({cat:c.k,film:best.sh,win,rival:pick(TVW[0])+' '+pick(TVW[1])});if(win){best.sh.awards.push(c.k);S.awards.tv++;gainRep(3)}});
 if(res.some(r=>r.win))addNews(`📺 ${esc(S.name)} wins big at the Golden Screen Awards!`);
 awardsScreen(`THE ${S.year} GOLDEN SCREEN AWARDS`,'TV awards night',seasons.length,res,'Make acclaimed series (80%+ reviews) to compete for Golden Screens.');
}

/* ---------- Talent & year end ---------- */
function refreshTalent(){
 const P=S.people;
 if(S.month===0){P.actors.forEach(a=>{a.age++;a.skill=clamp(a.skill+RI(-2,3),20,99);a.star=clamp(a.star+(a.age>58?-RI(1,4):RI(-3,3)),3,99)});
  ['directors','writers','composers','dps'].forEach(k=>P[k].forEach(c=>{c.age++;c.skill=clamp(c.skill+RI(-2,2),20,99)}));
  const gone=P.actors.filter(a=>a.age>72&&Math.random()<.4&&!busy(a));gone.forEach(a=>addNews(`🎭 ${esc(a.n)} announces retirement from acting.`));P.actors=P.actors.filter(a=>!gone.includes(a));
  ['directors','writers','composers','dps'].forEach(k=>{P[k]=P[k].filter(c=>!(c.age>78&&Math.random()<.4&&!busy(c)))})}
 const tk=takenNames();
 while(P.actors.length<40){const a=mkActor(tk,true,P.actors.filter(x=>x.g==='F').length<20?'F':'M');P.actors.push(a);if(Math.random()<.4)addNews(`🌟 Breakout newcomer ${esc(a.n)} signs with a top agency.`)}
 const caps={directors:14,writers:14,composers:9,dps:9};for(const k in caps)while(P[k].length<caps[k])P[k].push(mkCrew(tk,k[0]));
}
function yearEnd(){
 const y=S.year-1;const mk=S.market['_'+y]||{};
 const rows=S.rivals.filter(r=>mk[r.n]).map(r=>({n:r.n,dom:mk[r.n]}));rows.push({n:S.name,dom:mk.__me||0,me:1});
 const tot=sum(rows,r=>r.dom)||1;rows.forEach(r=>r.share=r.dom/tot);rows.sort((a,b)=>b.dom-a.dom);S.market[y]=rows;
 const mine=S.films.filter(f=>yearOf(f.releaseT)===y);
 const lib=+(sum(S.films.filter(f=>yearOf(f.releaseT)<y&&!f.lib),f=>f.ww*.02)+(S.libExtra||0)).toFixed(1);S.cash+=lib;
 const prof=sum((S.log.cf||[]).slice(-12))+lib;const tax=prof>0?+(prof*.21).toFixed(1):0;S.cash-=tax;S.lastTax=tax;if(tax)addNews(`🧾 ${esc(S.name)} pays ${M(tax)} in corporate tax (21%) on ${y} profits.`);
 const rank=rows.findIndex(r=>r.me)+1;if(rank<=2&&mine.length)gainRep(4);
 addNews(`📊 ${y} wrap: ${esc(S.name)} finishes #${rank} in domestic market share (${pct(rows.find(r=>r.me).share)}).`);
 yearScreen(y,rows,mine,lib);
}
