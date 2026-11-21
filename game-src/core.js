/* ===== CORE HELPERS ===== */
const $=s=>document.querySelector(s);
const R=Math.random,rnd=(a,b)=>a+R()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(R()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=v=>{const a=Math.abs(v),n=v<0?'−':'';if(a>=1000)return n+'$'+(a/1000).toFixed(2)+'B';if(a>=1)return n+'$'+a.toFixed(a>=100?0:1)+'M';if(a>=.001)return n+'$'+Math.round(a*1000)+'K';return n+'$0'};
const pct=v=>Math.round(v*100)+'%';
const SAVE='reelEmpire.v2';
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
let S=null,tab='studio',queue=[],busy=false,autoTimer=null,muted=false,talentFilter='all';

const yearOf=w=>S.startYear+Math.floor((w-1)/52);
const wkOf=w=>((w-1)%52)+1;
const monthOf=w=>Math.min(11,Math.floor((wkOf(w)-1)/4.34));
const dateStr=w=>MONTHS[monthOf(w)]+' '+yearOf(w);
const weekLbl=w=>{const k=wkOf(w),m=monthOf(w);return MONTHS[m]+', week '+Math.min(5,Math.floor(k-1-m*4.34)+1)};
const eraAt=y=>Math.pow(1.035,y-1977);
const era=()=>eraAt(yearOf(S.week));
const cEra=()=>era()*(1+Math.max(0,yearOf(S.week)-1985)*.035);
const decade=()=>Math.min(2020,Math.max(1930,Math.floor(yearOf(S.week)/10)*10));
const has=id=>S.tech.done.includes(id);
const season=w=>{const k=wkOf(w);if(k<=8)return .85;if(k<=17)return .95;if(k<=22)return 1.1;if(k<=35)return 1.22*S.mods.summer;if(k<=42)return .9;if(k<=46)return 1.02;return 1.2};
const seasonG=(w,g)=>{let s=season(w);const k=wkOf(w);if(g==='Horror'&&k>=42&&k<=44)s*=1.4;if(g==='Romance'&&k>=6&&k<=7)s*=1.25;if(g==='Family'&&k>=47)s*=1.2;return s};
const tal=id=>S.talent.find(t=>t.id===id);
const ageOf=t=>yearOf(S.week)-t.born;
const active=t=>t.on&&!t.retired;
const feeOf=t=>(t.role==='writer'?.45:1)*(0.04+Math.pow(t.fame/100,2)*1.6+t.skill/100*.2)*cEra()*S.mods.fee;
const needP=t=>Math.max(0,Math.round(t.fame-58));
const relKey=(a,b)=>a<b?a+'|'+b:b+'|'+a;
const relOf=(a,b)=>(a&&b&&S.rel[relKey(a,b)])||0;
const rankOf=()=>{const sc=S.prestige+S.fame+Math.min(150,Math.max(0,S.totalProfit/era())*0.25);let r=RANKS[0],nx=RANKS[1];for(let i=0;i<RANKS.length;i++)if(sc>=RANKS[i][0]){r=RANKS[i];nx=RANKS[i+1]}return{sc,r,nx}};
const freeStages=()=>S.b.stage-S.projects.filter(p=>p.stage==='shoot').length;
const scriptAvg=sc=>(sc.hook+sc.story+sc.chars)/3;
const stars=v=>{const n=clamp(Math.round(v/20),1,5);return '★'.repeat(n)+'☆'.repeat(5-n)};
const themeFit=(g,th)=>{const t=THEMES.find(x=>x.n===th);if(!t)return 0;return t.good.includes(g)?2:t.bad.includes(g)?-1:0};
const homeShare=()=>{const y=yearOf(S.week);let v=.1,lbl='Re-releases';const need={1955:'tvsales',1980:'vhs',1997:'dvd',2008:'dvd'};for(const [yy,s,l] of HOME){if(y>=yy&&(!need[yy]||has(need[yy]))){v=s;lbl=l}}if(has('vhs')&&y>=1980)v*=1.0;return{v,lbl}};
const intlOf=()=>{const y=yearOf(S.week);let r=INTL[0];for(const x of INTL)if(y>=x[0])r=x;return{m:r[1],china:r[2]}};
const DEC=()=>DIFFS[S.diff];

function newTitle(g){let t,i=0;do{t=(R()<.3?'The ':'')+pick(WORDS.a)+' '+pick(WORDS.b[g]||WORDS.b.Drama);i++}while(S.used.includes(t)&&i<40);S.used.push(t);return t}
function availThemes(){const y=yearOf(S.week);return THEMES.filter(t=>!t.from||y>=t.from)}
function mkScript(){
 const y=yearOf(S.week);
 const hot=Object.entries(S.heat).sort((a,b)=>b[1]-a[1]);
 const g=R()<.35?hot[ri(0,3)][0]:pick(GENRES.filter(x=>x!=='Animation'||R()<.5));
 const ths=availThemes();
 const th=R()<.55?pick(ths.filter(t=>t.good.includes(g))):pick(ths);
 const r=R(),tier=r<.5?'low':r<.85?'mid':'high';
 const srcs=SOURCES.filter(s=>s[0]!=='Comic book'||y>=1938);
 const src=R()<.55?SOURCES[0]:pick(srcs);
 const base=rnd(30,70)+S.b.writers*2+src[2];
 const sc={hook:clamp(Math.round(base+rnd(-18,22)),12,96),story:clamp(Math.round(base+rnd(-18,20)),12,96),chars:clamp(Math.round(base+rnd(-18,20)),12,96),comm:Math.round(clamp(rnd(25,92)+src[2],10,98))};
 const price=(0.04+scriptAvg(sc)/100*.22)*TIER[tier].m*cEra()*rnd(.85,1.15)*src[1];
 const ll=pick(LOGLINES[th.n]||['A story only Hollywood could tell.']);
 return{id:'s'+(S.seq++),title:newTitle(g),genre:g,theme:th.n,source:src[0],tier,sc,price,expires:S.week+ri(6,14),logline:ll};
}
function mkTalent(role,name,g,skill,fame,genres,born){return{id:'t'+(S.seq++),role,name,g,skill,fame,ego:ri(20,90),mood:ri(62,82),genres:genres||[pick(GENRES),pick(GENRES)],busy:0,born,on:false,retired:false,skin:ri(0,6),films:0,wins:0}}
function newcomer(role){const g=R()<.5?'m':'f';const t=mkTalent(role,pick(FIRST[g])+' '+pick(LAST),g,ri(45,80),ri(6,22),null,yearOf(S.week)-ri(21,29));t.on=true;S.talent.push(t);return t}

function newGame(name,startIdx,diff,hist){
 const st=STARTS[startIdx];
 S={v:2,name,startYear:st.y,diff,hist,week:1,cash:0,fame:12,prestige:4,rep:0,union:60,exhib:70,b:{stage:1,writers:1,post:1,marketing:1,lab:0,backlot:0,park:0},seq:1,used:[],scripts:[],projects:[],talent:[],rel:{},films:[],upcoming:[],news:[],ledger:[],cashHist:[],heat:{},loans:0,totalProfit:0,released:[],awards:[],ach:{},tech:{done:[],cur:null,pts:0},mods:{attend:1,summer:1,rate:.1,code:0,closed:0,fee:1},ips:[],streamer:null,ipo:null,investor:null,strike:null,nextTalks:0,campaign:{},hints:{}};
 S.cash=8*cEra()*DIFFS[diff].cash;S.cashHist=[S.cash];
 if(st.y>=1977)S.mods.summer=1.12;if(st.y<1950)S.mods.attend=1.22;if(st.y>=1950&&st.y<1968)S.mods.attend=1.08;if(st.y>=1934&&st.y<1968)S.mods.code=1;
 TECH.forEach(t=>{if(t.y<=st.y-1)S.tech.done.push(t.id)});
 const dec=Math.floor(st.y/10)*10;
 GENRES.forEach(g=>S.heat[g]=clamp(((DECADE_HEAT[g]||{})[dec]||1)*rnd(.92,1.08),.6,1.45));
 ACTORS.forEach(a=>S.talent.push(mkTalent('actor',a[0],a[1],a[2],a[3],null,a[4])));
 DIRECTORS.forEach(d=>S.talent.push(mkTalent('director',d[0],d[1],d[2],d[3],d[4],d[5])));
 WRITERS.forEach(d=>S.talent.push(mkTalent('writer',d[0],d[1],d[2],d[3],d[4],d[5])));
 S.talent.forEach(t=>{const age=st.y-t.born;if(age>=20&&age<=(t.role==='actor'?76:82)){t.on=true;if(age<27)t.fame=Math.round(t.fame*.45)}else if(age>(t.role==='actor'?76:82))t.retired=true});
 for(let i=0;i<6;i++)newcomer(R()<.6?'actor':R()<.5?'director':'writer');
 const act=S.talent.filter(active);
 for(let i=0;i<30;i++){const a=pick(act),b=pick(act);if(a!==b)S.rel[relKey(a.id,b.id)]=R()<.6?ri(40,90):-ri(40,90)}
 for(let i=0;i<6;i++)S.scripts.push(mkScript());
 S.scripts[0].tier='low';S.scripts[0].price=Math.min(S.scripts[0].price,.12*era());
 for(let i=0;i<10;i++)scheduleRival(ri(1,10));
 S.nextTalks=nextTalksWeek();
 document.body.dataset.era=decade();
 news('Welcome to Hollywood, '+st.y+'. '+name+' opens its gates.','gold');
 save();
}
function nextTalksWeek(){let y=yearOf(S.week)+1;while(y%3!==0)y++;return (y-S.startYear)*52+20}
function news(t,c){S.news.unshift({w:S.week,t,c:c||''});S.news=S.news.slice(0,50)}
function spend(a,t,p){S.cash-=a;S.ledger.unshift({w:S.week,t,a:-a});S.ledger=S.ledger.slice(0,80);if(p)p.cost+=a}
function earn(a,t,p){S.cash+=a;S.ledger.unshift({w:S.week,t,a});S.ledger=S.ledger.slice(0,80);if(p)p.rev+=a}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function load(){try{const s=localStorage.getItem(SAVE);return s?JSON.parse(s):null}catch(e){return null}}
function toast(t){const box=$('#toast');while(box.children.length>=2)box.firstChild.remove();const d=document.createElement('div');d.innerHTML=t;box.appendChild(d);setTimeout(()=>d.remove(),3400)}
function unlock(k){if(S.ach[k])return;S.ach[k]=S.week;const a=ACH.find(x=>x[0]===k);toast('<b class="gold">Achievement:</b> '+a[1]);news('Achievement unlocked: '+a[1]+'.','gold')}
function chime(kind){if(muted)return;try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());const notes=kind==='win'?[523,659,784,1047]:kind==='bad'?[392,311]:kind==='fan'?[392,523,659,784,659,784,1047]:[659,880];notes.forEach((f,i)=>{const o=A.createOscillator(),g=A.createGain();o.type=kind==='fan'?'triangle':'sine';o.frequency.value=f;const t0=A.currentTime+i*(kind==='fan'?.14:.12);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.08,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.6);o.connect(g).connect(A.destination);o.start(t0);o.stop(t0+.7)})}catch(e){}}

/* ---------- rivals ---------- */
function scheduleRival(ahead){
 const r=pick(RIVALS);const w=S.week+ahead;
 if(S.upcoming.some(f=>f.studio===r.n&&Math.abs(f.rel-w)<3))return;
 const hot=Object.entries(S.heat).sort((a,b)=>b[1]-a[1]);
 const g=R()<.4?r.bias:(R()<.5?hot[ri(0,2)][0]:pick(GENRES));
 const t=R(),tier=t<.35?'low':t<.8?'mid':'high';
 const rv=DEC().rival;
 const Q=clamp(Math.round(rnd(28,86)*rv),5,96);
 const th=pick(availThemes().filter(x=>x.good.includes(g)).concat(availThemes())).n;
 S.upcoming.push({id:'f'+(S.seq++),title:newTitle(g),genre:g,theme:th,studio:r.n,tier,rel:w,Q,appeal:rnd(30,88)*rv,aw:rnd(.4,.88)*(tier==='high'?1.1:1),tone:R()<.3,critic:clamp(Math.round(Q+G[g].crit+rnd(-8,8)),3,99),mine:false});
}

/* ---------- film maths ---------- */
function specBonus(g){let b=0;if(has('color'))b+=(['Musical','Fantasy','Adventure','Animation'].includes(g)?8:4);if(has('animatronics')&&['Horror','Sci-Fi','Fantasy'].includes(g))b+=10;if(has('cgi')&&['Action','Sci-Fi','Fantasy','Adventure','Animation'].includes(g))b+=15;return b}
function qualBonus(g){let b=0;if(has('stereo'))b+=2;if(has('steadicam'))b+=2;if(has('mocap')&&['Animation','Fantasy'].includes(g))b+=3;return b}
function fitOf(p,cast){const c=cast||p;const d=tal(c.dir),l=tal(c.lead),s=tal(c.sup);let f=themeFit(p.genre,p.theme);if(d&&d.genres.includes(p.genre))f+=1;if(l&&l.genres.includes(p.genre))f+=1;const r1=relOf(c.dir,c.lead),r2=relOf(c.lead,c.sup);[r1,r2].forEach(r=>{if(r>=40)f+=1;else if(r<=-40)f-=1.5});return f}
function craftOf(p,level,pace,cast){
 const c=cast||p;const d=tal(c.dir),l=tal(c.lead),s=tal(c.sup);const lv=LEVELS[level??p.level??1],pc=PACES[pace??p.pace??1];
 const crew=48+S.b.post*6,post=45+S.b.post*10;
 const craft=.28*scriptAvg(p.sc)+.24*(d?d.skill:50)+.18*(l?l.skill:50)+.07*(s?s.skill:45)+.09*crew+.09*post+.05*lv.pv;
 return clamp((craft+qualBonus(p.genre))*(1+.025*clamp(fitOf(p,c),-4,4))*pc.q,5,96);
}
function appealOf(p,level,cast){const c=cast||p;const d=tal(c.dir),l=tal(c.lead),s=tal(c.sup);const lv=LEVELS[level??p.level??1];const sp=Math.min(100,lv.pv+specBonus(p.genre))*G[p.genre].spec+(1-G[p.genre].spec)*50;return clamp(.32*p.sc.comm+.28*(l?l.fame:30)+.08*(s?s.fame:20)+.08*(d?d.fame:30)+.24*sp+(p.appealMod||0),5,99)}
function awarenessOf(pa,tier,bonus){const k=(1+.15*(S.b.marketing-1));const base=1-Math.exp(-(pa*k)/(2.4*cEra()*TIER[tier].screens));return clamp(1-(1-base)*(1-S.fame/260)+(bonus||0),.02,.99)}
function strengthOf(f){return f.aw*(.25+f.appeal/100)*(f.tone?1.15:1)*(.8+f.critic/250)*(f.boost||1)}
function grade(v){const g=['F','D','C−','C','C+','B−','B','B+','A−','A','A+'];return g[clamp(Math.round((v-30)/6.5),0,10)]}
function techOpen(tier){let m=1;if(has('wide'))m*=1.06;if(tier==='high'&&has('imax'))m*=1.1;if(tier==='high'&&has('3d'))m*=yearOf(S.week)>=2015?1.03:1.08;return m}
function costMods(p){let m=1;if(has('digital'))m*=.85;BACKLOTS.forEach((b,i)=>{if(S.b.backlot>i&&b[1].includes(p.genre))m*=.85});return m}
function reviewsOf(p){return CRITICS.map((c,i)=>{const sc=clamp(Math.round(p.critic+(c.b[p.genre]||0)+rnd(-7,7)),2,99);const band=QUOTES.find(q=>sc>=q[0]);return{n:c.n,o:c.o,sc,q:band[1][(hashN(p.title)+i)%band[1].length]}})}

/* ---------- week advance ---------- */
function advance(){
 if(busy||!S||S.over)return;
 S.week++;
 const k=wkOf(S.week),yr=yearOf(S.week);
 document.body.dataset.era=decade();
 const upkeep=(S.b.stage*.02+S.b.writers*.008+S.b.post*.01+S.b.marketing*.01+S.b.lab*.012+S.b.backlot*.015+S.b.park*.15)*era();
 S.cash-=upkeep;
 if(S.loans>0)S.cash-=S.loans*S.mods.rate/52;
 // research
 if(S.b.lab>0&&S.tech.cur){S.tech.pts+=S.b.lab*(1+S.prestige/200);const t=TECH.find(x=>x.id===S.tech.cur);if(S.tech.pts>=t.c){S.tech.done.push(t.id);S.tech.pts=0;S.tech.cur=null;news('Your lab has perfected '+t.n.toLowerCase()+'.','gold');toast('<b>Research complete:</b> '+t.n);if(t.id==='ai'){S.union=clamp(S.union-20,0,100);news('The unions are furious about your AI tools.','bad')}}}
 // heat
 const dec=decade();
 for(const g of GENRES){const target=(DECADE_HEAT[g]||{})[dec]||1;S.heat[g]=clamp(S.heat[g]+rnd(-.03,.03)+(target-S.heat[g])*.03,.6,1.45)}
 if(R()<.05){const g=pick(GENRES);const up=R()<.55;S.heat[g]=clamp(S.heat[g]+(up?.18:-.15),.6,1.45);news(up?g+' films are suddenly hot with audiences.':'Audiences are tiring of '+g.toLowerCase()+' films.',up?'info':'')}
 // history
 if(S.hist){EVENTS_HIST.filter(e=>e.y===yr&&e.w===k).forEach(e=>{e.f(S);news(e.t,'info');queue.push(()=>infoModal(String(yr),'Headline news',e.t))});
  HIST_STRIKES.filter(h=>h[0]===yr&&h[1]===k).forEach(h=>startStrike(h[2],true))}
 if(S.mods.closed&&S.mods.closed===S.week){news('Theaters have reopened.','ok')}
 // strike
 const striking=S.strike&&S.strike.until>S.week;
 if(S.strike&&S.strike.until===S.week){news('The strike is over. Cameras roll again.','ok');unlock('strike');S.strike=null}
 // union talks
 if(S.week===S.nextTalks){S.nextTalks=nextTalksWeek();if(!striking)queue.push(()=>unionModal())}
 // rivals
 if(!striking){if(R()<.85)scheduleRival(ri(5,13));if(R()<.45)scheduleRival(ri(5,13))}
 const closed=S.mods.closed>S.week;
 if(closed||striking)S.upcoming.forEach(f=>{if(f.rel<=S.week+1)f.rel+=closed?(S.mods.closed-S.week+ri(1,6)):ri(2,5)});
 // scripts
 S.scripts=S.scripts.filter(s=>s.expires>S.week);
 if(R()<.12&&S.scripts.length>2){const s=pick(S.scripts);S.scripts=S.scripts.filter(x=>x!==s);news(pick(RIVALS).n+' bought the script "'+s.title+'".')}
 const want=5+S.b.writers;if(!striking&&S.scripts.length<want&&(S.week%2===0||S.scripts.length<3))S.scripts.push(mkScript());
 S.talent.forEach(t=>{if(t.busy&&t.busy<=S.week&&!S.projects.some(p=>[p.dir,p.lead,p.sup].includes(t.id)&&['dev','ready','rewrite','shoot','post'].includes(p.stage)))t.busy=0;t.mood=clamp(t.mood+(70-t.mood)*.01,0,100)});
 if(k===1&&S.week>1)newYear(yr);
 // merch, park, streamer, ipo
 let merch=0;S.ips.forEach(ip=>{merch+=ip.brand*G[ip.genre].fam*.0012*era();ip.brand=clamp(ip.brand-.12,0,100)});
 if(merch>.0005)earn(merch,'Merchandise and licensing');
 if(S.b.park>0){const top=[...S.ips].sort((a,b)=>b.brand-a.brand).slice(0,5).reduce((a,ip)=>a+ip.brand,0);const pk=S.b.park*(.6+top*.0018)*era()*.5;earn(pk,'Theme park')}
 if(S.streamer){const st=S.streamer;const lib=S.projects.filter(p=>p.stage==='done').length;st.subs=clamp(st.subs*.99+.004*Math.sqrt(lib+1)*(1+S.fame/100),0,250);const net=st.subs*st.price/4.33*.35-.35*era();earn(net,'Streaming service')}
 if(S.ipo){S.ipo.price=clamp(S.ipo.price*(1+rnd(-.025,.027)),1,9999);if(k%13===0){news('Quarterly earnings call: '+S.name+' shares at $'+S.ipo.price.toFixed(2)+'.')}}
 // scandals
 if(!busy&&R()<.022*DEC().scandal){const ps=S.projects.filter(p=>p.lead&&['ready','shoot','post','market','scheduled','dev'].includes(p.stage));if(ps.length){const p=pick(ps);queue.push(()=>scandalModal(p))}}
 // investor offer
 if(!S.investor&&!S.offer&&R()<.02&&S.projects.length>0){S.offer=true;news('A private investor wants to co-finance your films. See Money.','info')}
 // projects
 for(const p of S.projects){
  if(p.stage==='writing'){p.left--;if(p.left<=0)finishWriting(p)}
  else if(p.stage==='rewrite'){p.left--;if(p.left<=0){p.stage=p.lead?'ready':'dev';toast('Rewrite finished on <b>'+esc(p.title)+'</b>.')}}
  else if(p.stage==='shoot'){if(striking){p.paused=true;continue}p.paused=false;spend(p.weekly,'Shooting: '+p.title,p);p.left--;p.shot++;
   if(p.events<2&&R()<.3&&p.left>0){p.events++;queue.push(()=>eventModal(p))}
   if(p.left<=0){p.stage='post';p.left=Math.max(1,4-Math.floor(S.b.post/2));news('Cameras stopped rolling on "'+p.title+'". Post-production begins.')}}
  else if(p.stage==='post'){p.left--;if(p.left<=0)finishPost(p)}
 }
 // releases
 const openers=[];
 S.projects.filter(p=>p.stage==='scheduled'&&p.rel===S.week).forEach(p=>{
  if(closed){homePremiere(p);return}
  openers.push({id:p.id,title:p.title,genre:p.genre,theme:p.theme,studio:S.name,tier:p.tier,Q:p.Q,appeal:p.appeal,aw:p.aw,tone:p.tone,critic:p.critic,mine:true,proj:p.id,boost:p.boost||1,window:p.window||0,seq:p.seq||1})});
 S.upcoming=S.upcoming.filter(f=>{if(f.rel===S.week&&!closed){openers.push(f);return false}return f.rel>S.week});
 if(closed&&S.films.length){S.films.forEach(f=>{f.gross=0});}
 const total=openers.reduce((a,f)=>a+strengthOf(f),0);
 S.films.forEach(f=>f.prev=f.gross);
 const im=intlOf();
 for(const f of S.films){f.wk++;let drop=f.drop+(f.wk>4?.03:0)+rnd(-.03,.03);drop=clamp(drop,.05,.9);f.gross=closed?0:f.gross*(1-drop);f.total+=f.gross;f.intl+=f.gross*f.im}
 for(const f of openers){
  const st=strengthOf(f),comp=1/(1+.35*(total-st));
  const hold=S.films.filter(x=>x.wk<=2).reduce((a,x)=>a+x.gross,0);
  const holdF=1/(1+hold/(40*era()));
  const lr=R();const L=DEC().luck;const luck=lr<.04?rnd(2.4,4.5):lr<.16*L?rnd(.5,.75):rnd(.8,1.25);
  const heat=S.heat[f.genre],sea=seasonG(S.week,f.genre);
  const fameB=f.mine?(1+S.fame/220):1.12;
  const exh=f.mine?(.85+S.exhib/650):1;
  const codeP=S.mods.code&&['Crime','Horror'].includes(f.genre)?.9:1;
  const open=9*era()*S.mods.attend*st*heat*sea*comp*holdF*TIER[f.tier].screens*luck*fameB*techOpen(f.tier)*exh*codeP;
  const wdrop=[0,.03,.08][f.window||0];
  const drop=clamp(.42-(f.Q-55)*.005+(f.tone?.07:0)+(f.critic<40?.06:0)+wdrop+rnd(-.04,.04),.12,.82);
  const fim=im.m*G[f.genre].intl;
  const film={...f,wk:1,gross:open,prev:0,total:open,intl:open*fim,im:fim,china:im.china,open,drop,factors:{st,comp:comp*holdF,luck,heat,sea},relW:S.week};
  S.films.push(film);
  S.heat[f.genre]=clamp(S.heat[f.genre]-.025,.6,1.45);
  if(f.mine){const p=S.projects.find(x=>x.id===f.proj);p.stage='theaters';p.open=open;p.factors=film.factors;queue.push(()=>premiere(p,film))}
 }
 const ended=[];
 for(const f of S.films){
  if(f.mine){const p=S.projects.find(x=>x.id===f.proj);const intlW=f.gross*f.im;const rev=f.gross*.53+intlW*(1-f.china)*.4+intlW*f.china*.25;earn(rev,'Box office: '+f.title,p);p.total=f.total;p.intl=f.intl;p.wk=f.wk;p.lastGross=f.gross}
  if(f.wk>=2&&(f.gross<.12*era()||f.wk>=16||closed))ended.push(f);
 }
 S.films=S.films.filter(f=>!ended.includes(f));
 for(const f of ended){
  S.released.push({title:f.title,studio:f.studio,Q:f.Q,critic:f.critic,year:yearOf(f.relW),mine:f.mine,total:f.total,genre:f.genre,proj:f.proj||null,dir:f.mine?S.projects.find(x=>x.id===f.proj).dir:null,lead:f.mine?S.projects.find(x=>x.id===f.proj).lead:null});
  if(f.total>14*era()&&f.total>f.open*4){S.heat[f.genre]=clamp(S.heat[f.genre]+.1,.6,1.45);news('"'+f.title+'" had remarkable legs. Expect copycat '+f.genre.toLowerCase()+' films.','info')}
  if(f.mine){const p=S.projects.find(x=>x.id===f.proj);endRun(p,f)}
 }
 if(k===10&&yr>S.startYear)queue.push(()=>awards(yr-1));
 if(k===48&&S.projects.some(p=>p.rel&&yearOf(p.rel)===yr&&['theaters','done'].includes(p.stage)))news('Awards season is here. Campaign for your films in Box office.','info');
 // ranks
 const rk=rankOf().r[1];if(rk!==S.lastRank){if(S.lastRank){news(S.name+' is now a '+rk+'.','gold');toast('<b>New rank:</b> '+rk);chime('win')}S.lastRank=rk}
 if(rk==='Major studio'||rk==='Hollywood legend')unlock('major');if(rk==='Hollywood legend')unlock('legend');
 if(yr-S.startYear>=10)unlock('decade');
 S.cashHist.push(S.cash);if(S.cashHist.length>260)S.cashHist.shift();
 if(S.cash<-12*cEra()){S.over=true;queue.push(gameOver)}
 save();render();runQueue();
}
function newYear(yr){
 const debut=[];
 S.talent.forEach(t=>{const age=yr-t.born;const lim=t.role==='actor'?76:82;
  if(!t.on&&!t.retired&&age>=21){t.on=true;t.fame=ri(8,22);debut.push(t)}
  if(t.on&&!t.retired){if(age>lim){t.retired=true;t.on=false;news(t.name+' has retired after a long career.')}
   else{t.fame=clamp(t.fame-1,3,99);if(t.role==='actor'&&age>60){t.skill=clamp(t.skill-.6,5,99);t.fame=clamp(t.fame-1,3,99)}if(age<35&&R()<.5)t.skill=clamp(t.skill+1,5,99)}}});
 if(debut.length)news('New faces in town: '+debut.slice(0,3).map(t=>t.name).join(', ')+'.','info');
 for(let i=0;i<4;i++)newcomer(i===3?'writer':R()<.65?'actor':'director');
 if(S.ipo){const yp=S.ledger.filter(l=>yearOf(l.w)===yr-1).reduce((a,l)=>a+l.a,0);if(yp<0){S.fame=clamp(S.fame-3,0,100);news('Shareholders are unhappy after a losing year. Share price falls.','bad');S.ipo.price*=.85}else{S.ipo.price*=1.08;news('A profitable year. Shareholders are pleased.','ok')}}
}
function startStrike(weeks,hist){S.strike={until:S.week+weeks};news((hist?'History repeats: ':'')+'Writers and actors walk out. Hollywood is on strike.','bad');queue.push(()=>infoModal('Industry news','Hollywood is on strike','Shooting stops on every film and no new films can be greenlit for about '+weeks+' weeks. Rival studios are frozen too.'))}
function finishWriting(p){
 const w=tal(p.writer);const sk=w?w.skill:50;const match=w&&w.genres.includes(p.genre)?8:0;
 const base=sk*.6+6+S.b.writers*3+match*.75+themeFit(p.genre,p.theme)*3+rnd(-10,10);
 p.sc={hook:clamp(Math.round(base+rnd(-12,12)),10,97),story:clamp(Math.round(base+rnd(-12,12)),10,97),chars:clamp(Math.round(base+rnd(-12,12)),10,97),comm:clamp(Math.round(35+(w?w.fame:20)*.25+(S.heat[p.genre]-1)*60+{low:0,mid:6,high:12}[p.tier]+rnd(-12,12)),10,98)};
 p.stage='dev';p.logline=pick(LOGLINES[p.theme]||['A story only Hollywood could tell.']);
 if(w){w.busy=0;w.films++;w.fame=clamp(w.fame+1,3,99)}
 news((w?w.name:'Your writers')+' finished the script for "'+p.title+'".','gold');
 toast('Script finished: <b>'+esc(p.title)+'</b>. Cast it in Films.');
}
function finishPost(p){
 const base=craftOf(p);
 p.Q=Math.round(clamp(base*rnd(.88,1.12)+p.qMod,5,98));
 p.critic=clamp(Math.round(p.Q+G[p.genre].crit+S.rep/12+rnd(-9,9)),3,99);
 p.appeal=appealOf(p);
 p.test=clamp(Math.round(.6*p.Q+.4*p.appeal+rnd(-6,6)),5,99);
 p.reviews=reviewsOf(p);
 p.pears=clamp(Math.round(p.critic*1.2-14+rnd(-5,5)),0,100);
 p.stage='market';
 [p.dir,p.lead,p.sup].forEach(id=>{const t=tal(id);if(t)t.busy=S.week+2});
 news('Test screening for "'+p.title+'": audiences scored it '+p.test+'/100.',p.test>=70?'ok':p.test<45?'bad':'');
 toast('<b>'+esc(p.title)+'</b> is finished. Plan its release in Films.');
}
function homePremiere(p){
 const st=strengthOf({aw:p.aw,appeal:p.appeal,tone:p.tone,critic:p.critic,boost:p.boost});
 const est=10*era()*st*S.heat[p.genre]*TIER[p.tier].screens*2.4;
 p.stage='theaters';p.open=0;p.total=0;p.wk=0;p.factors={st,comp:1,luck:1,heat:S.heat[p.genre],sea:1};
 const f={title:p.title,total:0,open:0,genre:p.genre};
 const v=est*.55;earn(v,'Home premiere: '+p.title,p);
 news('"'+p.title+'" premiered at home while theaters are closed.','info');
 endRun(p,f,true);
}
function endRun(p,f,home){
 const hs=homeShare();
 const wm=[.9,1,1.35][p.window||0];
 let hv=home?0:hs.v*f.total*(.5+p.Q/200)*wm;
 if(S.streamer&&hv>0){S.streamer.subs+=hv/(25*era());hv*=.55;news('"'+p.title+'" joins your streaming library.')}
 if(hv>0)earn(hv,hs.lbl+': '+p.title,p);
 p.stage='done';p.total=f.total;p.hv=hv;p.profit=p.rev-p.cost;p.endW=S.week;
 if(p.inv&&p.profit>0){const cut=p.profit*p.inv;spend(cut,'Investor share: '+p.title,p);p.profit=p.rev-p.cost}
 S.totalProfit+=p.profit;
 const ratio=(f.total+(p.intl||0)*.5)/(10*era());
 S.fame=clamp(S.fame+clamp(ratio*2,0,9)-(p.profit<0?1:0),0,100);
 S.prestige=clamp(S.prestige+Math.max(0,(p.critic-62)/4),0,100);
 [p.dir,p.lead,p.sup].forEach((id,i)=>{const t=tal(id);if(t){t.fame=clamp(t.fame+clamp(ratio*(i===2?.8:1.5),-2,8)+(p.critic>75?2:0)-(p.profit<0?2:0),3,99);t.skill=clamp(t.skill+(R()<.4?1:0),5,99);t.busy=0;t.films++;t.mood=clamp(t.mood+(p.profit>0?10:-8),0,100)}});
 if(S.ipo)S.ipo.price*=1+clamp(p.profit/Math.max(p.cost,.01)*.06,-.12,.15);
 unlock('first');if(p.profit>0)unlock('hit');if(p.profit/era()<-20)unlock('flop');
 if(p.tier==='low'&&f.total>12*p.cost)unlock('nka');
 // IP
 if(p.ip){const ip=S.ips.find(x=>x.id===p.ip);if(ip){const nb=clamp(20+(f.total/era())/1.5+(p.critic-50)/3,5,100);ip.brand=clamp(ip.brand*.55+nb*.45-6,5,100);ip.entries++;ip.last=yearOf(S.week);if(ip.entries>=2)unlock('sequel');if(ip.entries>=3)unlock('trilogy')}}
 else if(p.profit>0&&f.total>5*era()&&!p.teamup){S.ips.push({id:'ip'+(S.seq++),title:p.title,genre:p.genre,theme:p.theme,tier:p.tier,sc:{...p.sc},brand:clamp(20+(f.total/era())/1.5+(p.critic-50)/3,10,100),entries:1,last:yearOf(S.week),lead:p.lead,dir:p.dir});news('"'+p.title+'" is now a franchise you can build on.','gold')}
 if(p.teamup)unlock('teamup');
 const verdict=p.profit>p.cost*1.5?'A smash hit':p.profit>0?'In the black':p.profit>-p.cost*.4?'A modest loss':'A flop';
 news('"'+p.title+'" ends its run with '+money(p.total)+' at home'+(p.intl?' and '+money(p.intl)+' overseas':'')+'. '+verdict+'.',p.profit>0?'ok':'bad');
 queue.push(()=>postMortem(p));
}
function runQueue(){if(busy)return;const f=queue.shift();if(f){busy=true;stopAuto();f()}}
function done(){busy=false;closeModal();render();setTimeout(runQueue,60)}
