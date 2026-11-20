/* ===================== v7 — part 2: living Hollywood ===================== */
/* ---------- release dates & holidays ---------- */
function relD(x){if(!x)return curDate();const t=x.releaseT!=null?x.releaseT:x.t;const wk=x.relWk!=null?x.relWk:(x.wk||0);
 if(x.relDate){const y=START_YEAR+Math.floor(t/12),m=((t%12)+12)%12;return new Date(y,m,x.relDate)}const fr=dateOf(t,wk,5);return x.relDay!=null&&x.relDay!==5?addDays(fr,x.relDay-5):fr}
function holidaysIn(t){const y=START_YEAR+Math.floor(t/12),m=((t%12)+12)%12;const out=[];
 if(m===10){const d=new Date(y,10,1);const thu=1+((4-d.getDay()+7)%7)+21;out.push({d:thu-1,l:'🦃 Thanksgiving Wednesday',boost:1.22,days:5})}
 if(m===11)out.push({d:25,l:'🎄 Christmas Day',boost:1.25,days:4});
 if(m===6){const wd=new Date(y,6,4).getDay();if(wd>=1&&wd<=4)out.push({d:4-(wd-3),l:'🎆 July 4th week',boost:1.15,days:5})}
 if(m===9||m===10){const r=srng('diwali'+y);if((m===10)===(r()<.5))out.push({d:Math.floor(r()*20)+5,l:'🪔 Diwali',boost:1.08,days:4,intl:'India'})}
 if(m===0||m===1){const r=srng('cny'+y);if((m===1)===(r()<.6))out.push({d:Math.floor(r()*20)+4,l:'🧧 Chinese New Year',boost:1.06,days:4,intl:'China'})}
 return out}
function wkOfDate(t,day){for(let k=0;k<4;k++){const f=dateOf(t,k,5).getDate();if(f>=day&&f-day<7)return k}return -1}
function decorateRelease(r){const hs=holidaysIn(r.t).filter(h=>!h.intl);if(hs.length&&!r.lim&&!r.str&&Math.random()<.35){const h=hs[0];const k=wkOfDate(r.t,h.d);if(k>=0){r.wk=k;r.relDate=h.d;r.hol=h.l}}
 else if(r.str)r.relDay=pick([2,3,4,5,5,5,6]);else if(r.lim){const st=rivalOf(r.studio);if(st&&(st.home==='South Korea'))r.relDay=3;else if(st&&st.home==='China')r.relDay=pick([5,6]);}}
const _gr7=genRivals;genRivals=function(t,far){const n=S.rivalFilms.length;_gr7(t,far);S.rivalFilms.slice(n).forEach(decorateRelease)};

/* ---------- 2-year date-grid release picker ---------- */
let PKM=null;
function dateList(g,from,cur,action){const wiz=action.includes('W.releaseT');const pid=(action.match(/setDate\((\d+)/)||[])[1];const P=pid?S.projects.find(p=>p.id==pid):null;
 const selT=wiz?W.releaseT:P?P.releaseT:null,selK=wiz?(W.relWk||0):P?(P.relWk||0):0,selD=wiz?W.relDate:P?P.relDate:null;
 let h=`<p class="muted" style="font-size:12px;margin-bottom:6px">Tap a Friday or a 🎉 holiday. Red dots = rival releases, ⚔️ = rival tentpole the same day.</p>`;
 for(let t=from;t<from+24;t++){const y=START_YEAR+Math.floor(t/12),m=t%12;const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();const fit=CAL[m].mult*(CAL[m].g[g]||1);const hs=holidaysIn(t);const riv=rivalsAt(t);
  let grid='<div class="cgrid pick">'+DOW.map(d=>`<b>${d[0]}</b>`).join('');for(let i=0;i<first;i++)grid+='<span></span>';
  for(let d=1;d<=days;d++){const dow=new Date(y,m,d).getDay();const hol=hs.find(x=>x.d===d);const k=dow===5?wkOfDate(t,d):hol?wkOfDate(t,hol.d):-1;const ok=k>=0&&(dow===5||hol);
   const onDay=riv.filter(r=>relD(r).getDate()===d);const clash=onDay.some(r=>r.hype>85&&!r.lim&&!r.str);const sel=selT===t&&((selD&&selD===d)||(!selD&&dow===5&&k===selK&&!hol));
   const act=ok?(wiz?`pickRel(${t},${k},${hol?d:0})`:`pickRelP(${pid},${t},${k},${hol?d:0})`):'';
   grid+=`<span class="${ok?'ok':''} ${hol?'hol':''} ${sel?'sel':''} ${clash?'clash':''}" ${ok?`onclick="${act}"`:''}>${hol?'🎉':''}${d}${onDay.length?`<i>${clash?'⚔️':onDay.length}</i>`:''}</span>`}
  grid+='</div>';const cf=compFactor(t);
  h+=`<div class="card ${selT===t?'sel':''}"><div class="row"><b>${tLabel(t)}</b><span class="tag ${fit>=1.2?'hot':fit<.85?'bad':''}">${fit>=1.2?'🔥 Great fit':fit<.85?'Weak fit':'OK fit'} ×${fit.toFixed(2)}</span></div><div class="muted" style="font-size:12px">${CAL[m].tag} · competition ${cf>1.05?'light':cf<.8?'brutal':cf<.92?'crowded':'normal'}${hs.length?' · '+hs.map(x=>x.l).join(', '):''}</div>${grid}
  ${selT===t?`<div class="muted" style="font-size:12px">${riv.length?riv.map(r=>`${GEN[r.g].icon} ${esc(r.title)} · ${fmtDay(relD(r))} · ${esc(r.studio.split(' ')[0])}${r.hype>85?' ⚠️':''}`).join('<br>'):'No rival releases this month.'}</div>`:''}</div>`}
 return h}
function pickRel(t,k,d){W.releaseT=t;W.relWk=k;W.relDate=d||null;wiz()}
function pickRelP(id,t,k,d){const p=S.projects.find(x=>x.id===id);if(!p)return;const e=Math.max(tNow()+1,p.startT+p.sch.total);if(t<e)return;
 if(p.releaseT-tNow()<=2&&t!==p.releaseT){const w=+(p.mkt*.1).toFixed(1);S.cash-=w;p.paid+=w}p.releaseT=t;p.relWk=k;p.relDate=d||null;applyHol(p);p.track=null;
 addNews(`📅 <b>${esc(p.title)}</b> dated for ${fmtLong(relD(p))}.`);rivalReact(p);save();moveDate(id)}
function applyHol(p){const h=p.relDate?holidaysIn(p.releaseT).find(x=>x.d===p.relDate):null;p.holBoost=h?h.boost:1;p.holL=h?h.l:null}
const _gl7=greenlight;greenlight=function(){const n=S.projects.length;const d=W.relDate;_gl7();if(S.projects.length>n){const p=S.projects[S.projects.length-1];p.relDate=d||null;applyHol(p);rivalReact(p);addInbox('🎬','Production',`${p.title} is greenlit`,`Pre-production has started. Release: ${fmtLong(relD(p))}.`);relCheckCast(p)}};
function calGrid(x,its){const y=START_YEAR+Math.floor(x/12),m=x%12;const first=new Date(y,m,1).getDay();const days=new Date(y,m+1,0).getDate();const now=curDate();const hs=holidaysIn(x);
 const by={};its.forEach(it=>{const d=(it.o?relD(it.o):dateOf(x,it.wk,5)).getDate();(by[d]=by[d]||[]).push(it)});let h='<div class="cgrid">'+DOW.map(d=>`<b>${d[0]}</b>`).join('');
 for(let i=0;i<first;i++)h+='<span></span>';
 for(let d=1;d<=days;d++){const L=by[d]||[];const mine=L.some(i=>i.mine);const isNow=now.getFullYear()===y&&now.getMonth()===m&&now.getDate()===d;const hol=hs.find(z=>z.d===d);
  h+=`<span class="${L.length?'has':''} ${mine?'mine':''} ${isNow?'now':''} ${hol?'hol':''}">${hol?'🎉':''}${d}${L.length?`<i>${L.length}</i>`:''}</span>`}
 return h+'</div>'+(hs.length?`<div class="muted" style="font-size:11px">${hs.map(z=>z.l+' · '+z.d+' '+MON[m]).join(' · ')}</div>`:'')}

/* ---------- inbox & toasts ---------- */
function addInbox(icon,from,title,body,act){S.inbox=S.inbox||[];S.inbox.unshift({id:S.id++,t:tNow(),w:S.wk||0,icon,from,title,body,act:act||null,read:0});S.inbox=S.inbox.slice(0,60)}
function toast(msg){if(typeof document==='undefined'||!document.body||!document.body.insertAdjacentHTML)return;const id='t'+Math.random().toString(36).slice(2,7);document.body.insertAdjacentHTML('beforeend',`<div class="toast" id="${id}">${msg}</div>`);setTimeout(()=>{const e=document.getElementById&&document.getElementById(id);if(e)e.remove()},3200)}
phoneCall=function(t,from,text){sfx('ring');addInbox('📞',from,t,text);toast(`📞 ${esc(from)} left you a message`)};
function inboxModal(){(S.inbox||[]).forEach(m=>m.read=1);modal(`<h3>📥 Inbox</h3>${(S.inbox||[]).length?(S.inbox||[]).map(m=>`<div class="card" style="padding:10px"><div class="row"><b>${m.icon} ${esc(m.from)}</b><small>${tLabel(m.t)}</small></div><div style="font-weight:700;margin-top:3px">${m.title}</div><div class="muted" style="font-size:13px">${m.body}</div>${m.act?`<button class="btn sm gold" onclick="${m.act}">Open</button>`:''}</div>`).join(''):'<p class="muted">No messages.</p>'}<button class="btn ghost" onclick="modal();render()">Close</button>`)}
const unread=()=>(S.inbox||[]).filter(m=>!m.read).length;

/* ---------- This-week panel (HQ) ---------- */
function thisWeekPanel(){const t=tNow();const rel=S.projects.filter(p=>p.releaseT===t&&(p.relWk||0)===(S.wk||0));const inv=(S.invites||[]).filter(i=>!i.done);const g=S.goals;const tr=topTrend();
 const items=[];if(unread())items.push(`<div class="twi" onclick="inboxModal()">📥 <b>${unread()}</b> unread message${unread()>1?'s':''}</div>`);
 if(inv.length)items.push(`<div class="twi" onclick="mediaModal()">🎙️ <b>${inv.length}</b> media invitation${inv.length>1?'s':''}</div>`);
 rel.forEach(p=>items.push(`<div class="twi" onclick="projectModal(${p.id})">🍿 <b>${esc(p.title)}</b> opens this week${p.track?` · tracking ${M(p.track[0])}–${M(p.track[1])}`:''}</div>`));
 if(g)items.push(`<div class="twi" onclick="goalsModal()">🎯 ${S.year} goals: <b>${g.list.filter(x=>goalProg(x)>=x.n).length}/${g.list.length}</b> done</div>`);
 if(tr)items.push(`<div class="twi" onclick="trendsModal()">📈 Trending genre: <b>${GEN[tr[0]].icon} ${tr[0]}</b> ×${tr[1].toFixed(2)}</div>`);
 const hs=hashtags();if(hs.length)items.push(`<div class="twi" onclick="fansModal()">🔥 Trending: <b>${hs.slice(0,2).join(' ')}</b></div>`);
 return `<div class="card twp"><div class="row"><b>🗓️ This week · ${fmtDay(curDate())}</b><span class="pill" onclick="inboxModal()" style="cursor:pointer">📥 ${unread()}</span></div>${items.join('')||'<div class="muted" style="font-size:13px">Quiet week. Plan your next move.</div>'}</div>`}
const _hq7=viewHQ;viewHQ=function(){let h=_hq7();const mk='<div class="card" style="margin-top:10px"><div class="row"><h3>Active projects</h3>';const i=h.indexOf(mk);if(i>0)h=h.slice(0,i)+thisWeekPanel()+h.slice(i);
 h=h.replace('<div class="tile" onclick="settings()"><b>⚙️</b>Settings</div>','<div class="tile" onclick="goalsModal()"><b>🎯</b>Goals</div><div class="tile" onclick="achModal()"><b>🏅</b>Achievements</div><div class="tile" onclick="trendsModal()"><b>📈</b>Trends</div><div class="tile" onclick="mediaModal()"><b>🎙️</b>Media</div><div class="tile" onclick="fansModal()"><b>💬</b>Fan buzz</div><div class="tile" onclick="settings()"><b>⚙️</b>Settings</div>');return h};

/* ---------- goals ---------- */
const GOAL_T=[{k:'films',l:n=>`Release ${n} film${n>1?'s':''}`,n:()=>RI(2,4)},{k:'gross',l:n=>`Gross ${M(n)} worldwide`,n:()=>Math.round(R(300,900)*I()/50)*50},{k:'hit',l:()=>'Score a film with 80%+ on Fresh-o-Meter',n:()=>1},{k:'tv',l:()=>'Premiere a TV season',n:()=>1},
 {k:'one',l:()=>'Win a weekend at #1',n:()=>1},{k:'rep',l:n=>`Reach ${n} prestige`,n:()=>Math.min(100,Math.round(S.rep+R(5,12)))},{k:'profit',l:n=>`Make ${M(n)} profit from films`,n:()=>Math.round(R(60,250)*I()/10)*10}];
function newGoals(){const pool=shuffle(GOAL_T.slice()).slice(0,3);S.goals={y:S.year,list:pool.map(g=>({k:g.k,n:g.n(),l:''})).map(x=>Object.assign(x,{l:GOAL_T.find(g=>g.k===x.k).l(x.n)}))};S.yr1={}}
function yearFilms(y){return S.films.filter(f=>yearOf(f.releaseT)===y)}
function goalProg(g){const y=S.goals?S.goals.y:S.year;const fs=yearFilms(y);
 return g.k==='films'?fs.length:g.k==='gross'?Math.round(sum(fs,f=>boShown(f).ww)):g.k==='hit'?fs.filter(f=>f.critic>=80).length:g.k==='tv'?S.shows.filter(s=>s.seasons.some(se=>yearOf(se.t)===y)).length:g.k==='one'?((S.yr1||{}).one||0):g.k==='rep'?Math.round(S.rep):g.k==='profit'?Math.round(sum(fs.filter(f=>boShown(f).done),f=>f.profit)):0}
function goalsModal(){const g=S.goals;modal(`<h3>🎯 ${g.y} board objectives</h3><p class="muted" style="font-size:13px">Hit them by year end for a bonus. Miss them and the board loses patience.</p>${g.list.map(x=>{const p=goalProg(x),ok=p>=x.n;return `<div class="card"><div class="row"><b>${ok?'✅':'⬜'} ${x.l}</b></div><div class="meter"><i style="width:${Math.min(100,p/x.n*100)}%;background:${ok?'var(--green)':'var(--gold)'}"></i></div><small style="text-transform:none">${['gross','profit'].includes(x.k)?M(p)+' / '+M(x.n):p+' / '+x.n}</small></div>`}).join('')}<p class="muted" style="font-size:12px">Reward: ${M(10*I())} + prestige per goal.</p><button class="btn ghost" onclick="modal()">Close</button>`)}
function closeGoals(){const g=S.goals;if(!g)return;let ok=0;g.list.forEach(x=>{if(goalProg(x)>=x.n)ok++});const bonus=ok*10*I();S.cash+=bonus;gainRep(ok*1.5-(g.list.length-ok));
 addInbox('🏛️','The board',`${g.y} review: ${ok}/${g.list.length} goals met`,ok===g.list.length?`Outstanding year! Bonus ${M(bonus)}.`:ok?`Solid work. Bonus ${M(bonus)}.`:'The board is disappointed. Do better this year.');(S.goalHist=S.goalHist||[]).push({y:g.y,ok,n:g.list.length});newGoals()}

/* ---------- achievements ---------- */
const ACH=[['first','🎬','First release','Release your first film',()=>S.films.length>=1],['ten','🎞️','Prolific','Release 10 films',()=>S.films.length>=10],['fifty','🏭','Dream factory','Release 50 films',()=>S.films.length>=50],
 ['hit100','💵','Nine figures','A film grosses $100M worldwide',()=>S.films.some(f=>f.ended&&f.ww>=100)],['bil','🌍','Billion-dollar club','A film grosses $1B worldwide',()=>S.films.some(f=>f.ended&&f.ww>=1000)],
 ['fresh','🍅','Certified Fresh','A film earns Certified Fresh',()=>S.films.some(f=>f.cert)],['perfect','💯','Perfection','A film scores 97%+',()=>S.films.some(f=>f.critic>=97)],['bomb','💣','Learning experience','Release a box-office bomb',()=>S.films.some(f=>f.ended&&f.profit<-f.costTotal*.35)],
 ['bp','🏆','Best Picture','Win Best Picture',()=>S.films.some(f=>f.awards.includes('Best Picture'))],['aw10','🏅','Trophy cabinet','Win 10 awards',()=>sum(S.films,f=>f.awards.length)>=10],
 ['tv1','📺','On the air','Premiere a TV show',()=>S.shows.some(s=>s.seasons.length)],['tv5','📡','Long runner','A show reaches season 5',()=>S.shows.some(s=>s.season>=5)],['ep9','⭐','Perfect episode','An episode rated 9.5+',()=>S.shows.some(s=>s.seasons.some(se=>(se.epR||[]).some(r=>r>=9.5)))],
 ['fr','🌟','Franchise builder','Start a franchise',()=>S.franchises.length>=1],['fr3','🧬','Cinematic universe','Own 3 franchises',()=>S.franchises.length>=3],
 ['anime','🌸','Anime pioneer','Release an anime film',()=>S.films.some(f=>f.style==='anime')],['micro','🎒','Indie spirit','Profit from a micro-budget film',()=>S.films.some(f=>f.tier==='micro'&&f.ended&&f.profit>0)],['tent','🚀','Tentpole titan','A tentpole film grosses $700M',()=>S.films.some(f=>f.tier==='tent'&&f.ended&&f.ww>=700)],
 ['one','🥇','Number one','Win a weekend at #1',()=>(S.ach1||0)>=1],['one10','👑','Box-office royalty','10 #1 weekends',()=>(S.ach1||0)>=10],['battle','⚔️','Showdown winner','Win a head-to-head opening battle',()=>(S.battles||0)>=1],
 ['lot','🏗️','Mogul','Build 10 lot upgrades',()=>sum(BUILDINGS,b=>lotLv(b.k))>=12],['rich','💰','Deep pockets','Have $1B cash',()=>S.cash>=1000],['rep','🎖️','Legendary studio','Reach 90 prestige',()=>S.rep>=90],
 ['viral','🔥','Gone viral','A social post goes viral',()=>(S.viral||0)>=1],['media','🎙️','Media darling','Do 5 media appearances',()=>(S.mediaN||0)>=5],['goals','🎯','Board favourite','Meet all yearly goals',()=>(S.goalHist||[]).some(g=>g.ok===g.n)],
 ['share','📊','Top studio','Win a year\'s market share',()=>(S.shareWins||0)>=1],['holiday','🎄','Holiday hit','Open a film on a holiday',()=>S.films.some(f=>f.relDate)],['ipo','📈','Going public','Take the studio public',()=>S.stock.public]];
function checkAch(){S.ach=S.ach||{};ACH.forEach(a=>{if(!S.ach[a[0]]){let ok=false;try{ok=a[4]()}catch(e){}if(ok){S.ach[a[0]]=tNow();addInbox('🏅','Achievements',`${a[1]} ${a[2]}`,a[3]);toast(`🏅 Achievement unlocked: ${a[2]}`);sfx('victory')}}})}
function achModal(){S.ach=S.ach||{};const n=Object.keys(S.ach).length;modal(`<h3>🏅 Achievements · ${n}/${ACH.length}</h3><div class="achg">${ACH.map(a=>{const got=S.ach[a[0]]!=null;return `<div class="ach ${got?'got':''}"><div style="font-size:26px">${got?a[1]:'🔒'}</div><b>${a[2]}</b><small style="text-transform:none">${a[3]}</small>${got?`<small>${tLabel(S.ach[a[0]])}</small>`:''}</div>`}).join('')}</div><button class="btn ghost" onclick="modal()">Close</button>`)}

/* ---------- relationships ---------- */
const relKey=(a,b)=>a<b?a+'|'+b:b+'|'+a;
function relOf(a,b){return (S.rel||{})[relKey(a,b)]}
function setRel(a,b,type,news){if(!a||!b||a===b)return;S.rel=S.rel||{};const k=relKey(a,b);const old=S.rel[k];if(old&&old.type===type)return;S.rel[k]={type,t:tNow()};
 if(news){const A=pname(a),B=pname(b);addNews(type==='romance'?`💕 Tabloids: ${esc(A)} and ${esc(B)} spotted on a romantic dinner date.`:type==='feud'?`⚡ ${esc(A)} and ${esc(B)} are reportedly feuding after tense days on set.`:`🤝 ${esc(A)} and ${esc(B)} have become close friends.`)}}
function seedRels(){S.rel={};const A=S.people.actors.concat(S.people.directors);for(let i=0;i<22;i++){const a=pick(A),b=pick(A);if(a!==b)setRel(a.id,b.id,pick(['friend','friend','friend','feud','romance']))}}
function relTags(x,ids){return ids.filter(id=>id!==x.id).map(id=>{const r=relOf(x.id,id);if(!r)return '';const nm=pname(id).split(' ')[0];return r.type==='friend'?`<span class="tag good">🤝 Friends with ${esc(nm)}</span>`:r.type==='romance'?`<span class="tag hot">💕 Dating ${esc(nm)}</span>`:`<span class="tag bad">⚡ Feuding with ${esc(nm)}</span>`}).join('')}
function relChem(ids){let c=0,h=0;for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const r=relOf(ids[i],ids[j]);if(!r)continue;if(r.type==='friend')c+=2;if(r.type==='romance'){c+=2.5;h+=3}if(r.type==='feud')c-=4}return{c,h}}
function relCheckCast(p){const ids=allCast(p.cast).concat([p.dir]).filter(Boolean);const r=relChem(ids);p.chem+=r.c;p.hype+=r.h;if(r.c<0)addInbox('⚡','Set report',`Tension on ${p.title}`,'Feuding talent on the same set is hurting chemistry.')}
const _pc7=personCard;personCard=function(x,sel,onclick,isA,locked,extra){let h=_pc7(x,sel,onclick,isA,locked,extra);if(typeof W!=='undefined'&&W&&W.lead!==undefined){const ids=[W.lead,W.co,W.dir].concat(W.sup||[],W.leads2||[],W.cos2||[]).filter(Boolean);const t=relTags(x,ids);if(t)h=h.replace('<div class="tags">','<div class="tags">'+t)}return h};
function relAfterRelease(f){const ids=allCast(f.cast).concat([f.dir]).filter(Boolean);for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){if(Math.random()<.08)setRel(ids[i],ids[j],f.aud>=65?'friend':'feud',true);else if(Math.random()<.025&&i<2&&j<3)setRel(ids[i],ids[j],'romance',true)}}
const _op7=openPerson;openPerson=function(id){_op7(id);const rs=Object.entries(S.rel||{}).filter(([k])=>k.split('|').includes(id));const box=document.querySelector('#modal .modal>div');
 if(rs.length&&box&&box.insertAdjacentHTML){box.insertAdjacentHTML('beforeend',`<div class="card"><h3>Relationships</h3>${rs.map(([k,v])=>{const o=k.split('|').find(z=>z!==id);const P=person(o);return P?`<div class="crow" onclick="openPerson('${o}')">${portrait(P,34)}<div style="flex:1"><b style="font-size:14px">${esc(P.n)}</b><div class="muted" style="font-size:12px">${v.type==='friend'?'🤝 Close friends':v.type==='romance'?'💕 Dating':'⚡ Feuding'}</div></div></div>`:''}).join('')}</div>`)}};

/* ---------- industry trends ---------- */
function heatTick(){S.heat=S.heat||{};GENRES.forEach(g=>{const h=S.heat[g]||1;S.heat[g]=+clamp(h+(1-h)*.04+R(-.035,.035),.7,1.4).toFixed(3)})}
function topTrend(){if(!S.heat)return null;const e=Object.entries(S.heat).sort((a,b)=>b[1]-a[1]);return e[0]&&e[0][1]>1.05?e[0]:null}
const _tm7=trendMult;trendMult=function(g,p){return _tm7(g,p)*((S.heat&&S.heat[g])||1)};
function trendsModal(){const e=Object.entries(S.heat||{}).sort((a,b)=>b[1]-a[1]);modal(`<h3>📈 Industry trends</h3><p class="muted" style="font-size:13px">Audience appetite by genre right now. Hot genres open bigger; too many releases in one genre cool it down.</p>${e.map(([g,h])=>`<div class="row" style="margin-top:8px;font-size:14px"><span>${GEN[g].icon} ${g}</span><b class="${h>=1.08?'pos':h<=.92?'neg':''}">${h>=1.15?'🔥 Hot':h>=1.05?'↗ Rising':h<=.85?'🥶 Cold':h<=.95?'↘ Cooling':'→ Steady'} ×${h.toFixed(2)}</b></div><div class="meter"><i style="width:${(h-.7)/.7*100}%;background:${h>=1.05?'var(--green)':h<=.95?'var(--red)':'var(--gold)'}"></i></div>`).join('')}<button class="btn ghost" onclick="modal()">Close</button>`)}

/* ---------- competition ---------- */
function rivalReact(p){if(!p||p.dist==='sell'||p.dist==='stream')return;const same=rivalsAt(p.releaseT).filter(r=>(r.wk||0)===(p.relWk||0)&&!r.lim&&!r.str);
 same.forEach(r=>{if(r.hype<p.hype+castStats(p).star*.4&&Math.random()<.4){const nk=[0,1,2,3].filter(k=>k!==(p.relWk||0));r.wk=pick(nk);r.relDate=null;addNews(`🏃 ${esc(r.studio)} moves <i>${esc(r.title)}</i> to ${fmtDay(relD(r))} to avoid <b>${esc(p.title)}</b>.`)}});
 if(Math.random()<.18){const big=rivalsAt(p.releaseT).filter(r=>(r.wk||0)!==(p.relWk||0)&&r.hype>85&&!r.lim&&!r.str)[0];if(big){big.wk=p.relWk||0;big.relDate=p.relDate||null;addNews(`⚔️ ${esc(big.studio)} moves <i>${esc(big.title)}</i> onto the same weekend as <b>${esc(p.title)}</b>. It's a showdown!`);addInbox('⚔️','Distribution',`${big.studio} is coming for your weekend`,`${big.title} now opens against ${p.title} on ${fmtLong(relD(p))}.`)}}}
function poachTick(){if(Math.random()<.05){const worked=S.people.actors.filter(a=>a.hits>0&&!busy(a));if(worked.length){const a=pick(worked);const st=pick(S.rivals.filter(r=>r.alive&&r.kind==='major'));if(st){a.busy=tNow()+RI(4,9);addNews(`✍️ ${esc(st.n)} signs ${esc(a.n)} to an exclusive multi-picture deal.`);addInbox('✍️','Talent agency',`${a.n} poached`,`${st.n} locked ${a.n} into a deal; they are unavailable for months.`)}}}}
function trackFor(p){const g=GEN[p.genre],t=p.releaseT,cs=castStats(p);const mktScore=Math.min(56,34*Math.log10(1+(p.mkt||5)/(5*inf(t))));const hype=clamp(14+cs.star*.25+mktScore+S.rep*.06+p.hype,4,130);
 const hm=hype<=100?Math.pow(hype/50,1.5):2.83*Math.pow(hype/100,.6);const est=g.base*CAL[t%12].mult*(CAL[t%12].g[p.genre]||1)*compFactor(t)*hm*29*inf(t)*.9*(p.holBoost||1)*trendMult(p.genre,p);return[+(est*.75).toFixed(1),+(est*1.3).toFixed(1)]}
const _pm7=projectModal;projectModal=function(id){_pm7(id);const p=S.projects.find(x=>x.id===id);if(!p||p.dist==='sell'||p.dist==='stream')return;const left=(p.releaseT*4+(p.relWk||0))-wIdx();const box=document.querySelector('#modal .modal>div');
 if(left<=8&&left>=0&&box&&box.insertAdjacentHTML){if(!p.track)p.track=trackFor(p);box.insertAdjacentHTML('afterbegin',`<div class="card" style="border:2px solid var(--blue)"><b>📊 Box office tracking</b><p style="font-size:14px;margin-top:4px">Analysts expect a <b>${M(p.track[0])}–${M(p.track[1])}</b> opening on ${fmtLong(relD(p))}${p.holL?' ('+p.holL+')':''}.</p><small style="text-transform:none">More buzz before release can push it higher.</small></div>`)}};

/* ---------- weekly hooks ---------- */
const _wbo7=weekBO;weekBO=function(){_wbo7();const had=WKREP.length;
 S.films.forEach(f=>{if(f.dist==='stream'||f.dist==='sell'||!f.weeks||f.battleDone)return;const k=filmK(f);if(k<0)return;f.battleDone=1;
  const lst=weekendList();const pos=lst.findIndex(e=>e.mine&&e.id===f.id);if(pos===0){S.ach1=(S.ach1||0)+1;S.yr1=S.yr1||{};S.yr1.one=(S.yr1.one||0)+1}
  const foe=rivalsAt(f.releaseT).filter(r=>(r.wk||0)===(f.relWk||0)&&!r.lim&&!r.str&&r.dom).sort((a,b)=>b.dom-a.dom)[0];
  if(foe){const fo=foe.dom*.32;const won=f.opening>=fo;if(won)S.battles=(S.battles||0)+1;addNews(`⚔️ Box office battle: <b>${esc(f.title)}</b> (${M(f.opening)}) ${won?'beats':'loses to'} ${esc(foe.studio)}'s <i>${esc(foe.title)}</i> (${M(fo)}).`);WKREP.push({battle:1,f,foe,fo,won})}
  if(f.track){const mid=(f.track[0]+f.track[1])/2;addNews(f.opening>f.track[1]?`📈 <b>${esc(f.title)}</b> crushes tracking with ${M(f.opening)}.`:f.opening<f.track[0]?`📉 <b>${esc(f.title)}</b> misses tracking (${M(f.opening)} vs ${M(mid)} expected).`:`🎯 <b>${esc(f.title)}</b> opens in line with tracking.`)}
  relAfterRelease(f)});
 if(!had&&WKREP.length&&!QUEUE.includes(showWeekRep))QUEUE.push(showWeekRep);
 heatTick();if(S.wk===0)poachTick();mediaTick();checkAch();if(S.goals&&S.goals.y<S.year)closeGoals();if(!S.goals)newGoals()};
const _swr7=showWeekRep;showWeekRep=function(){const b=WKREP.filter(x=>x.battle);WKREP=WKREP.filter(x=>!x.battle);if(!WKREP.length&&!b.length)return runQueue();
 if(!WKREP.length){TAB='hq';render();modal(b.map(battleCard).join('')+`<button class="btn gold" onclick="modal();runQueue()">Continue</button>`);return}
 _swr7();const box=document.querySelector('#modal .modal>div');if(b.length&&box&&box.insertAdjacentHTML)box.insertAdjacentHTML('afterbegin',b.map(battleCard).join(''))};
function battleCard(x){return `<div class="card battle ${x.won?'won':'lost'}"><div class="center"><small>⚔️ Weekend showdown</small></div><div class="row" style="align-items:center;margin-top:6px"><div class="center" style="flex:1">${posterSVG(x.f,60)}<b style="font-size:13px">${M(x.f.opening)}</b></div><b style="font-size:22px">VS</b><div class="center" style="flex:1">${posterSVG({title:x.foe.title,genre:x.foe.g,cast:{lead:x.foe.lead}},60)}<b style="font-size:13px">${M(x.fo)}</b></div></div><div class="center"><b class="${x.won?'pos':'neg'}">${x.won?'🏆 You win the weekend!':'😤 '+esc(x.foe.studio)+' takes it'}</b></div></div>`}
const _ye7=yearEnd;yearEnd=function(){const y=S.year-1;const ms=S.market['_'+y]||{};const e=Object.entries(ms).sort((a,b)=>b[1]-a[1]);if(e[0]&&e[0][0]==='__me'){S.shareWins=(S.shareWins||0)+1;addNews(`👑 ${esc(S.name)} wins ${y}'s market-share crown!`);addInbox('👑','Industry',`#1 studio of ${y}`,'You beat every rival at the domestic box office.')}return _ye7()};

/* ---------- box office graph ---------- */
function boChart(f){const so=boShown(f);const ws=f.weeks.slice(0,so.n);if(!ws.length)return '';const cum=[];ws.reduce((a,w,i)=>{cum[i]=a+w;return a+w},0);const W0=320,H0=150,pad=24;
 const mx=Math.max(cum[cum.length-1]*(f.intl&&f.dom?1:1),f.costTotal*.6,...ws)*1.1;const bw=(W0-pad*2)/Math.max(ws.length,6);const y=v=>H0-pad-(v/mx)*(H0-pad*2);
 const be=f.costTotal/2.2;
 return `<div class="card"><small>📈 Box office graph (domestic)</small><svg viewBox="0 0 ${W0} ${H0}" width="100%" style="margin-top:6px">${[0,.5,1].map(q=>`<line x1="${pad}" x2="${W0-pad}" y1="${y(mx*q/1.1)}" y2="${y(mx*q/1.1)}" stroke="var(--line)"/><text x="2" y="${y(mx*q/1.1)+3}" font-size="7" fill="var(--muted)">${M(mx*q/1.1)}</text>`).join('')}
 ${ws.map((w,i)=>`<rect x="${pad+i*bw+2}" y="${y(w)}" width="${bw-4}" height="${H0-pad-y(w)}" rx="2" fill="var(--gold)" opacity=".85"/>`).join('')}
 <polyline fill="none" stroke="var(--blue)" stroke-width="2.2" points="${cum.map((c,i)=>`${pad+i*bw+bw/2},${y(c)}`).join(' ')}"/>${cum.map((c,i)=>`<circle cx="${pad+i*bw+bw/2}" cy="${y(c)}" r="2.4" fill="var(--blue)"/>`).join('')}
 <line x1="${pad}" x2="${W0-pad}" y1="${y(be)}" y2="${y(be)}" stroke="var(--red)" stroke-dasharray="4 3"/><text x="${W0-pad}" y="${y(be)-3}" font-size="7" text-anchor="end" fill="var(--red)">break-even ≈ ${M(be)}</text>
 ${ws.map((w,i)=>`<text x="${pad+i*bw+bw/2}" y="${H0-pad+10}" font-size="7" text-anchor="middle" fill="var(--muted)">W${i+1}</text>`).join('')}</svg>
 <div class="row" style="font-size:11px"><span>🟨 weekly gross</span><span style="color:var(--blue)">● running total</span><span style="color:var(--red)">- - break-even</span></div></div>`}
const _fr7=filmReport;filmReport=function(f,ctx){let h=_fr7(f,ctx);if(f.weeks&&f.weeks.length&&f.dist!=='stream'&&f.dist!=='sell'){const mk='<div class="card"><small>Week by week';h=h.replace(mk,boChart(f)+mk)}h+=commentsCard(fanComments(f.title,f.aud,f.critic,6,f.genre),'💬 Audience comments');return h};

/* ---------- TV heatmap ---------- */
function epRatings(s,se){if(se.epR&&se.epR.length===(se.epViews||[]).length)return se.epR;const r=srng(s.title+se.n);const base=clamp(se.q/10+.4,3.2,9.4);const n=(se.epViews||[]).length||s.eps;
 se.epR=Array.from({length:n},(_,i)=>+clamp(base+(r()-.5)*1.3+((se.cliff||s.cliff||[])[i]?.35:0)+(i===n-1?.55:0)+(i===0?-.15:0)+(i>n*.6?.2:0),1.5,9.9).toFixed(1));return se.epR}
function heatCls(v){return v>=9?'aw':v>=8?'gr':v>=7?'gd':v>=6?'rg':v>=5?'bd':'gb'}
function heatmapHTML(s){const seasons=s.seasons;if(!seasons.length)return '';const maxE=Math.max(...seasons.map(se=>(se.epViews||[]).length||s.eps));
 const airedN=se=>se===seasons[seasons.length-1]&&s.status==='airing'?(s.aired||0):(se.epViews||[]).length;
 let h=`<div class="card"><h3>📊 Episode ratings</h3><div class="hlegend"><span class="aw">Awesome</span><span class="gr">Great</span><span class="gd">Good</span><span class="rg">Regular</span><span class="bd">Bad</span><span class="gb">Garbage</span></div><div class="heat" style="grid-template-columns:30px repeat(${seasons.length},1fr)"><b></b>${seasons.map(se=>`<b>S${se.n}</b>`).join('')}`;
 for(let e=0;e<maxE;e++){h+=`<b>E${e+1}</b>`;seasons.forEach(se=>{const R0=epRatings(s,se);const v=R0[e];h+=v!=null&&e<airedN(se)?`<span class="${heatCls(v)}" onclick="epModal(${s.id},${se.n},${e})">${v}</span>`:'<i></i>'})}
 return h+'</div></div>'}
function epModal(id,sn,e){const s=S.shows.find(x=>x.id===id);const se=s.seasons.find(x=>x.n===sn);const v=epRatings(s,se)[e];const name=((se.epNames||[])[e])||'Episode '+(e+1);
 modal(`<h3>S${sn} · E${e+1} — ${esc(name)}</h3><div class="row" style="margin-top:6px"><span class="hbig ${heatCls(v)}">${v}</span><span>${(se.epViews||[])[e]}M views</span></div>${commentsCard(fanComments(s.title,v*10,v*10,5,null,true),'💬 Viewer comments')}<button class="btn ghost" onclick="showModal(${id})">Back</button>`)}
const _sm7=showModal;showModal=function(id){_sm7(id);const s=S.shows.find(x=>x.id===id);const box=document.querySelector('#modal .modal>div');if(s&&box&&box.insertAdjacentHTML){const h=heatmapHTML(s);if(h)box.insertAdjacentHTML('beforeend',h)}};

/* ---------- fans ---------- */
const FANS={superfan:['{t} is a MASTERPIECE, I’ve seen it 4 times 😭','give {t} every award right now','{t} changed my life fr','already planning my 5th rewatch of {t}'],critic:['{t} has great moments but the second act drags','solid craft, but {t} plays it too safe','the cinematography in {t} though 👌','{t} is good, not great. 7/10'],
 troll:['{t} is mid and you all know it','who greenlit {t} 💀','paid reviews for {t} lol','{t}? fell asleep twice'],shipper:['the chemistry in {t} 😍 I ship them','{t} needs a romance spinoff NOW','those two in {t}… I’m not okay 💕'],theorist:['THEORY: the ending of {t} sets up a sequel 👀','did anyone else catch the hidden clue in {t}??','{t} is secretly a prequel, hear me out 🧵'],casual:['{t} was a fun night out 🍿','watched {t} with my family, everyone liked it','{t} — worth the ticket','{t} was okay I guess']};
function fanComments(title,aud,crit,n,genre,tv){const r=srng(title+n+Math.round(aud));const out=[];const t=esc(title);
 for(let i=0;i<n;i++){const x=r();const type=aud>=75?(x<.4?'superfan':x<.6?'theorist':x<.75?'shipper':x<.9?'casual':'troll'):aud>=55?(x<.25?'superfan':x<.5?'casual':x<.7?'critic':x<.85?'theorist':'troll'):(x<.45?'troll':x<.75?'critic':x<.9?'casual':'superfan');
  const pool=FANS[type];out.push({h:HANDLES[Math.floor(r()*HANDLES.length)]+(r()<.5?'':Math.floor(r()*99)),type,s:pool[Math.floor(r()*pool.length)].replace('{t}',t),l:Math.round(Math.pow(r(),2)*40000+20)})}
 return out}
function commentsCard(cs,title){const badge={superfan:'💜 Superfan',critic:'🧐 Critic',troll:'👹 Troll',shipper:'💕 Shipper',theorist:'🕵️ Theorist',casual:'🍿 Casual'};
 return `<div class="card"><h3>${title}</h3>${cs.map(c=>`<div class="cmt"><div class="row"><b style="font-size:13px">@${esc(c.h)}</b><span class="tag">${badge[c.type]}</span></div><div style="font-size:14px">${c.s}</div><small style="text-transform:none">♥ ${fmtC(c.l)} · reply</small></div>`).join('')}</div>`}
function hashtags(){const tags=[];S.projects.filter(p=>p.hype>25).forEach(p=>tags.push('#'+p.title.replace(/[^A-Za-z0-9]/g,'')));S.films.filter(f=>!f.ended&&f.shown).forEach(f=>tags.push('#'+f.title.replace(/[^A-Za-z0-9]/g,'')));S.shows.filter(s=>s.status==='airing').forEach(s=>tags.push('#'+s.title.replace(/[^A-Za-z0-9]/g,'')));return tags.slice(0,5)}
function fansModal(){const items=S.projects.map(p=>({t:p.title,a:clamp(40+p.hype,20,95),k:'Upcoming'})).concat(S.films.filter(f=>!f.ended&&f.shown).map(f=>({t:f.title,a:f.aud,k:'In theaters'})),S.shows.filter(s=>s.status==='airing').map(s=>({t:s.title,a:s.q,k:'On air'})));
 modal(`<h3>💬 Fan buzz</h3>${hashtags().length?`<div class="tags">${hashtags().map(h=>`<span class="tag hot">🔥 ${h}</span>`).join('')}</div>`:''}${items.length?items.map(it=>commentsCard(fanComments(it.t,it.a,it.a,4),`${esc(it.t)} · ${it.k}`)).join(''):'<p class="muted">No buzz yet — announce a project!</p>'}<button class="btn ghost" onclick="modal()">Close</button>`)}
const _st7=showTrailer;showTrailer=function(p){_st7(p);const box=document.querySelector('#modal .modal>div');if(box&&box.insertAdjacentHTML&&p.trailer)box.insertAdjacentHTML('beforeend',commentsCard(fanComments(p.title+'tr',p.trailer.like,p.trailer.like,4),'💬 Trailer comments'))};

/* ---------- media portal ---------- */
const OUTLETS_M=[['talk','📺','Late Night with Jules Marlow','talk show'],['talk','🛋️','The Morning Couch','morning TV'],['pod','🎧','Reel Talk Podcast','podcast'],['pod','🎧','Popcorn & Chill','podcast'],['mag','📰','Silver Screen Monthly','magazine cover'],['mag','📸','Vanity Lens','magazine cover'],['con','🦸','StarCon Panel','fan convention']];
const QS=[{q:'What can fans expect from {t}?',a:[['Tease a huge twist 🤫',4,.15],['Stay humble 🙏',2,0],['Spoil a big scene 😬',6,.45]]},{q:'Is there a sequel planned?',a:[['"Never say never" 😉',4,.1],['"It\'s a one-off."',1,0],['Announce a trilogy! 🎉',7,.4]]},
 {q:'How was working with the cast?',a:[['Praise everyone ❤️',3,0],['Share a funny on-set story 😂',5,.1],['Hint at on-set drama 🍿',6,.5]]},{q:'What do you think of {rv}\'s film opening the same month?',a:[['Wish them luck 🤝',2,0],['"We\'re not worried." 😎',4,.2],['Throw shade 🔥',7,.55]]}];
function mediaTick(){S.invites=(S.invites||[]).filter(i=>!i.done&&i.exp>=wIdx());if(S.invites.length>=3||Math.random()>.35)return;
 const cands=S.projects.filter(p=>p.dist!=='sell'&&(p.releaseT*4+(p.relWk||0))-wIdx()<=10).map(p=>({k:'p',id:p.id,title:p.title,who:[p.cast.lead,p.dir,'ceo'][RI(0,2)]})).concat(S.shows.filter(s=>s.status==='prod'&&s.readyT-tNow()<=3||s.status==='airing').map(s=>({k:'s',id:s.id,title:s.title,who:[s.lead,'ceo'][RI(0,1)]})));
 if(!cands.length)return;const c=pick(cands);let o=pick(OUTLETS_M);if(o[0]==='con'&&S.month!==6)o=OUTLETS_M[RI(0,5)];
 const inv={id:S.id++,k:c.k,pid:c.id,title:c.title,who:c.who||'ceo',o,exp:wIdx()+3};S.invites.push(inv);addInbox(o[1],o[2],`Invitation: ${o[3]}`,`${inv.who==='ceo'?'You are':esc(pname(inv.who))+' is'} invited to talk about <b>${esc(c.title)}</b>.`,`openInvite(${inv.id})`)}
function mediaModal(){const L=(S.invites||[]).filter(i=>!i.done);modal(`<h3>🎙️ Media portal</h3><p class="muted" style="font-size:13px">Talk shows, podcasts, magazine covers and conventions want you and your stars. Good answers bring buzz; bold ones can backfire.</p>${L.length?L.map(i=>`<div class="card opt" onclick="openInvite(${i.id})"><div class="row"><b>${i.o[1]} ${i.o[2]}</b><small>${i.o[3]}</small></div><div class="muted" style="font-size:13px">${i.who==='ceo'?'You':esc(pname(i.who))} · about <b>${esc(i.title)}</b> · expires in ${i.exp-wIdx()+1} wk</div></div>`).join(''):'<p class="muted">No invitations right now. They arrive as your releases get close.</p>'}<button class="btn ghost" onclick="modal()">Close</button>`)}
let MI=null;
function openInvite(id){const i=(S.invites||[]).find(x=>x.id===id);if(!i||i.done)return mediaModal();MI={i,step:0,buzz:0,risk:0,qs:shuffle(QS.slice()).slice(0,3),log:[]};miView()}
function miView(){const {i,step,qs}=MI;const who=i.who==='ceo'?S.ceo:person(i.who);const rv=(S.rivals.filter(r=>r.alive)[0]||{n:'a rival'}).n;
 if(step>=qs.length)return miEnd();const q=qs[step];
 modal(`<div class="center"><small>${i.o[1]} ${i.o[2]} · ${i.o[3]}</small><div style="margin:8px 0">${portrait(who,80)}</div><b>${esc(who?who.n:'You')}</b></div><div class="card"><small>Host · question ${step+1} of ${qs.length}</small><p style="font-size:16px;margin-top:4px">"${q.q.replace('{t}',esc(i.title)).replace('{rv}',esc(rv))}"</p></div>
 ${q.a.map((a,k)=>`<button class="btn ghost" onclick="miAns(${k})">${a[0]}</button>`).join('')}${MI.log.length?`<div class="muted" style="font-size:12px;margin-top:6px">${MI.log.join('<br>')}</div>`:''}`)}
function miAns(k){const a=MI.qs[MI.step].a[k];const bad=Math.random()<a[2];MI.buzz+=bad?-Math.round(a[1]*.6):a[1];if(bad)MI.risk++;MI.log.push(bad?`😬 "${a[0]}" backfired`:`✅ "${a[0]}" landed`);MI.step++;miView()}
function miEnd(){const {i,buzz,risk}=MI;i.done=1;S.mediaN=(S.mediaN||0)+1;const o=i.k==='p'?S.projects.find(x=>x.id===i.pid):S.shows.find(x=>x.id===i.pid);const mult=i.o[0]==='talk'?1.3:i.o[0]==='con'?1.6:i.o[0]==='mag'?1.1:.9;const g=Math.round(buzz*mult);
 if(o){if(i.k==='p')o.hype+=g;else o.buzz=(o.buzz||0)+g}if(risk>=2)gainRep(-1.5);addNews(risk>=2?`🔥 Controversy after ${esc(i.who==='ceo'?S.name+"'s boss":pname(i.who))}'s comments on ${esc(i.o[2])}.`:`🎙️ ${esc(i.who==='ceo'?S.name+"'s boss":pname(i.who))} charms ${esc(i.o[2])} talking up <b>${esc(i.title)}</b>.`);
 post(null,risk>=2?`did they really say that on ${esc(i.o[2])}?? 💀`:`that ${esc(i.o[2])} interview has me SO hyped for ${esc(i.title)}`,RI(2000,90000));musicTrack('hq');save();
 modal(`<div class="center"><div style="font-size:44px">${risk>=2?'🔥':'🎉'}</div><h3>${risk>=2?'That got spicy…':'Great interview!'}</h3><p class="muted">${MI.log.join('<br>')}</p><b class="${g>=0?'pos':'neg'}" style="font-size:20px">${g>=0?'+':''}${g} buzz</b></div><button class="btn gold" onclick="modal();render()">Done</button>`)}

/* ---------- cut scenes ---------- */
function cutScene(html,next,ms){if(PREFS.cuts===false)return next();if(typeof document==='undefined'||!document.body||!document.body.insertAdjacentHTML||!document.getElementById){return next()}
 window._cutNext=()=>{const e=document.getElementById('cut');if(e)e.remove();clearTimeout(window._cutT);const n=window._cutNext0;window._cutNext0=null;if(n)n()};window._cutNext0=next;
 document.body.insertAdjacentHTML('beforeend',`<div id="cut" class="cut">${html}<button class="skip" onclick="_cutNext()">Skip ⏭</button></div>`);window._cutT=setTimeout(()=>window._cutNext&&window._cutNext(),ms||4200)}
function premiereScene(f){const cs=allCast(f.cast).slice(0,4).map(person).filter(Boolean);
 return `<svg viewBox="0 0 360 260" width="100%"><defs><linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0a24"/><stop offset="1" stop-color="#3a1840"/></linearGradient></defs><rect width="360" height="260" fill="url(#nsky)"/>
 ${Array.from({length:30},(_,i)=>`<circle cx="${(i*47)%360}" cy="${(i*23)%90}" r="${i%3?1:1.6}" fill="#fff" opacity=".7"/>`).join('')}
 <rect x="110" y="20" width="140" height="100" rx="4" fill="#111" stroke="#ffd77a" stroke-width="3"/><g transform="translate(150 24)">${posterSVG(f,60).replace(/style="[^"]*"/,'')}</g>
 <text x="180" y="140" text-anchor="middle" font-family="'Bebas Neue',Impact" font-size="20" fill="#ffd77a" letter-spacing="3">WORLD PREMIERE</text>
 <polygon points="140,260 220,260 200,150 160,150" fill="#c0182a"/><polygon points="160,150 200,150 205,170 155,170" fill="#e02236"/>
 ${[0,1].map(s=>Array.from({length:9},(_,i)=>`<circle cx="${s?240+i*14:10+i*14}" cy="${185+(i%2)*6}" r="9" fill="#2a2440"/><circle class="flash" style="animation-delay:${(i*0.37+s*.2)%2}s" cx="${s?240+i*14:10+i*14}" cy="${178}" r="4" fill="#fff"/>`).join('')).join('')}
 <line x1="135" y1="200" x2="135" y2="260" stroke="#d4af37" stroke-width="3"/><line x1="225" y1="200" x2="225" y2="260" stroke="#d4af37" stroke-width="3"/>
 ${cs.map((p,i)=>`<g class="walk" style="animation-delay:${i*.7}s"><g transform="translate(150 175) scale(.6)">${portrait(p,100,{bg:'transparent'}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g></g>`).join('')}</svg>
 <div class="center" style="color:#fff;margin-top:6px"><b>${esc(f.title)}</b><br><small style="color:#ddd">Red-carpet premiere · ${fmtLong(relD(f))}</small></div>`}
function setScene(p){const d=person(p.dir),L=person(p.cast.lead);
 return `<svg viewBox="0 0 360 240" width="100%"><rect width="360" height="240" fill="#1d1a24"/><rect x="0" y="170" width="360" height="70" fill="#2b2633"/>
 <g transform="translate(40 60)">${d?portrait(d,90).replace(/^<svg/,'<svg x="0" y="0"'):''}</g><g transform="translate(230 60)">${L?portrait(L,90).replace(/^<svg/,'<svg x="0" y="0"'):''}</g>
 <g class="clap" transform="translate(140 70)"><rect x="0" y="30" width="80" height="55" fill="#111" stroke="#fff"/><g class="clapTop"><rect x="0" y="16" width="80" height="14" fill="#fff"/>${[0,1,2,3].map(i=>`<polygon points="${i*20},16 ${i*20+10},16 ${i*20+20},30 ${i*20+10},30" fill="#111"/>`).join('')}</g><text x="40" y="52" fill="#fff" font-size="8" text-anchor="middle" font-family="Inter">${esc(p.title.toUpperCase().slice(0,16))}</text><text x="40" y="66" fill="#fff" font-size="7" text-anchor="middle" font-family="Inter">SCENE 1 · TAKE 1</text></g>
 <rect x="20" y="10" width="40" height="30" fill="#333"/><polygon points="60,15 90,5 90,45 60,35" fill="#444"/><circle cx="40" cy="25" r="8" fill="#ffd77a" opacity=".6"/></svg>
 <div class="center" style="color:#fff;margin-top:6px"><b style="font-size:22px">🎬 "ACTION!"</b><br><small style="color:#ddd">Day 1 of filming · ${esc(p.title)}</small></div>`}
const _rs7=releaseScreen;releaseScreen=function(f){if(f.dist==='stream'||f.dist==='sell'||f._prem)return _rs7(f);f._prem=1;sfx('fanfare');musicTrack('awards');cutScene(premiereScene(f),()=>{musicTrack('hq');_rs7(f)},4800)};
const _aw7=awardsScreen;awardsScreen=function(top,head,count,res,tip){musicTrack('awards');sfx('fanfare');cutScene(`<div class="center" style="color:#fff;padding-top:30px">${statue(120)}<h2 style="color:#ffd77a">${top}</h2><p>The stars arrive… the envelopes are sealed…</p></div>`,()=>_aw7(top,head,count,res,tip),3200)};
function shootScenes(){S.projects.forEach(p=>{if(!p.shotScene&&phaseOf(p)==='shoot'&&!p.acquired){p.shotScene=1;QUEUE.push(()=>cutScene(setScene(p),()=>runQueue(),3200))}})}
const _wt7=weekTick;weekTick=function(){_wt7();shootScenes()};

/* ---------- music routing ---------- */
const _ti7=title;title=function(){musicTrack('menu');_ti7()};
const _rn7=render;render=function(){if(S&&MWANT!=='awards')musicTrack('hq');_rn7()};
const _nv7=negView;negView=function(){_nv7()};
const _ds7=decisionScreen;decisionScreen=function(d){musicTrack('tension');_ds7(d)};
const _set7=settings;settings=function(){_set7();const box=document.querySelector('#modal .modal>div .card');if(box&&box.insertAdjacentHTML)box.insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:12px"><span>🎬 Cut scenes</span><button class="btn sm ${PREFS.cuts!==false?'gold':'ghost'}" style="margin:0" onclick="PREFS.cuts=PREFS.cuts===false?true:false;savePrefs();settings()">${PREFS.cuts!==false?'On':'Off'}</button></div>`)};

/* ---------- setup for new and old saves ---------- */
function ensureV7(){if(!S)return;if(!S.rel)seedRels();if(!S.heat){S.heat={};GENRES.forEach(g=>S.heat[g]=+R(.85,1.15).toFixed(3))}if(!S.goals)newGoals();if(!S.inbox)S.inbox=[];if(!S.ach)S.ach={};if(!S.v7){S.v7=1;S.films.forEach(f=>f.battleDone=1)}
 S.rivalFilms.forEach(r=>{if(r.relDay===undefined&&!r.relDate&&r.decor===undefined){r.decor=1;decorateRelease(r)}})}
const _ens7=ensureV5;ensureV5=function(){if(!S)return;_ens7();ensureV7()};
