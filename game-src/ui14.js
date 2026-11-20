/* ===================== v10 — truthful economy, release windows, pitch meetings, premium polish ===================== */

/* ---------- haptics (native bridge on Android, vibrate fallback) ---------- */
function hap(k){try{if(typeof PREFS!=='undefined'&&PREFS.hap===false)return;if(typeof window!=='undefined'&&window.HSNative&&window.HSNative.haptic)window.HSNative.haptic(k||'tap');else if(typeof navigator!=='undefined'&&navigator.vibrate&&k&&k!=='tap')navigator.vibrate(k==='confirm'?[12,50,16]:k==='reject'?24:12)}catch(e){}}
const _sfx10=sfx;sfx=function(k){_sfx10(k);if(k==='cash'||k==='win')hap('confirm');else if(k==='flop')hap('reject');else if(k==='click')hap('tap')};
settings=(function(o){return function(){o();const box=document.querySelector('#modal .modal>div .card');if(box&&box.insertAdjacentHTML)box.insertAdjacentHTML('beforeend',`<div class="row" style="margin-top:12px"><span>📳 Haptics</span><button class="btn sm ghost" style="margin:0" onclick="PREFS.hap=PREFS.hap===false;savePrefs10();settings()">${PREFS.hap===false?'Off':'On'}</button></div>`)}})(settings);
function savePrefs10(){try{localStorage.setItem('hss_prefs',JSON.stringify(PREFS))}catch(e){}if(PREFS.hap!==false)hap('confirm')}

/* ---------- release windows ---------- */
const WINS=[
 {k:'short',l:'Short window',days:'17–30 days',d:'Film reaches digital rental fast for early cash, but cinemas give it fewer weeks.',th:.62,early:.95,anc:1.06,rel:-4},
 {k:'std',l:'Standard window',days:'45 days',d:'The current industry standard and the best balance for theatrical and streaming.',th:1,anc:1,rel:1},
 {k:'long',l:'Long window',days:'60–90 days',d:'Longest run in cinemas and the happiest exhibitors; digital money arrives later and a bit smaller.',th:1.1,early:1,anc:.95,rel:3}];
function exRelLabel(){const r=S.exRel||0;return r>=8?['Excellent','pos']:r>=3?['Good','pos']:r>-3?['Neutral','muted']:r>-8?['Strained','neg']:['Hostile','neg']}
function setWin(id,k){const p=S.projects.find(x=>x.id===id);if(!p)return;p.win=k;hap('tap');save();MKEEP=true;projectModal(id)}
function windowCard(p){const cur=p.win||'std';const rl=exRelLabel();
 return `<div class="card prem"><div class="row"><b>🎟️ Release window</b><span class="${rl[1]}" style="font-size:12px;font-weight:700">Cinemas: ${rl[0]}</span></div><p class="muted" style="font-size:12.5px;margin-top:4px">How long cinemas get the film before it goes to home rental and streaming.</p>
 ${WINS.map(w=>`<div class="opt winopt ${cur===w.k?'sel':''}" onclick="setWin(${p.id},'${w.k}')"><div class="row"><b>${w.l}</b><span class="muted" style="font-size:12px">${w.days}</span></div><small>${w.d}</small></div>`).join('')}</div>`}
const _rf10=releaseFilm;releaseFilm=function(p){const keep=p.holBoost;const theatrical=p.dist==='wide'||p.dist==='platform';if(theatrical)p.holBoost=(p.holBoost||1)*(1+(S.exRel||0)*.006);
 const f=_rf10(p);p.holBoost=keep;if(theatrical){try{applyWindow(f,p)}catch(e){}}return f};
function applyWindow(f,p){const w=WINS.find(x=>x.k===(p.win||'std'))||WINS[1];f.win=w.k;S.exRel=clamp((S.exRel||0)*.92+w.rel,-15,15);
 if(!f.weeks||!f.weeks.length||w.k==='std')return;const own=1-(p.cofi||0);const t=tNow();
 const oDom=f.dom,oRent=f.domRent,oAnc=f.ancillary;
 let wk=f.weeks.map((x,i)=>+(x*(i<4?(i?w.early||1:1):w.th)).toFixed(2));if(w.k==='short')wk=wk.slice(0,Math.max(5,Math.ceil(wk.length*.72)));
 f.weeks=wk;f.dom=+sum(wk).toFixed(1);f.domRent=+(oRent*(f.dom/(oDom||1))).toFixed(1);f.ww=+(f.dom+f.intl).toFixed(1);f.ancillary=+(oAnc*w.anc).toFixed(1);
 const dR=f.domRent-oRent,dA=f.ancillary-oAnc;f.revenue=+(f.revenue+(dR+dA)*own).toFixed(1);f.profit=+(f.profit+(dR+dA)*own).toFixed(1);
 const rc=lab=>S.receivables.find(r=>r.label===f.title+lab&&r.t>t);const a=rc(' theatrical'),b=rc(' home & PVOD'),c=rc(' TV licensing');
 if(a)a.amt+=dR*own;if(b){b.amt+=dA*.6*own;if(w.k==='short')b.t=t+1}if(c)c.amt+=dA*.4*own;
 if(w.k==='short')addNews(`📀 <b>${esc(f.title)}</b> will hit digital rental after a short window; cinema chains grumble.`);
 else addNews(`🎟️ <b>${esc(f.title)}</b> gets a long exclusive cinema window; exhibitors cheer.`)}

/* ---------- break-even ---------- */
function beProject(p){const cost=Math.max(p.paid||0,p.spend||p.prod||0)+(p.paid>=(p.spend||p.prod||0)?0:0)+(p.mkt||0);const take=.64*(p.win==='short'?.97:p.win==='long'?1.01:1);return {cost,need:cost/take,mult:(cost/take)/Math.max(1,p.prod||p.spend||1)}}
function beCard(p){const b=beProject(p);return `<div class="card prem"><div class="row"><b>⚖️ Break-even</b><b class="gold">${M(b.need)}</b></div><p class="muted" style="font-size:12.5px;margin-top:4px">Worldwide gross needed to cover about ${M(b.cost)} in production and marketing. That is ≈${b.mult.toFixed(1)}× the production budget. Studios keep roughly 62% of early ticket sales, less as the weeks go on, and only 25% in China.</p></div>`}
const _pm10=projectModal;projectModal=function(id){_pm10(id);const p=S.projects.find(x=>x.id===id);if(!p||p.vault||(p.dist!=='wide'&&p.dist!=='platform'))return;if(typeof PMT!=='undefined'&&PMT&&PMT!=='ov')return;
 const box=document.querySelector('#modal .modal>div');if(box&&box.insertAdjacentHTML){const a=box.querySelector('.actions');const html=windowCard(p)+beCard(p);if(a&&a.insertAdjacentHTML)a.insertAdjacentHTML('beforebegin',html);else box.insertAdjacentHTML('beforeend',html)}};
function beFilm(f){const got=(f.revenue||0)+(f.rebate||0);if(!f.ww||got<=0)return null;return +(f.ww*f.costTotal/got).toFixed(1)}
const _fm10=filmModal;filmModal=function(id){_fm10(id);const f=S.films.find(x=>x.id===id);if(!f||f.dist==='stream'||f.dist==='sell'||!f.weeks)return;const be=beFilm(f);if(!be)return;const box=document.querySelector('#modal .modal>div');if(!box||!box.insertAdjacentHTML)return;
 const so=typeof boShown==='function'?boShown(f):{ww:f.ww};const pct=clamp(so.ww/be*100,0,100);const ok=so.ww>=be;
 box.insertAdjacentHTML('afterbegin',`<div class="card prem"><div class="row"><b>⚖️ Break-even</b><span class="${ok?'pos':'muted'}" style="font-weight:800">${ok?'Passed ✓':Math.round(pct)+'%'}</span></div><div class="bebar"><i style="width:${pct}%"></i></div><div class="row muted" style="font-size:12px;margin-top:6px"><span>${M(so.ww)} so far</span><span>needs ${M(be)}${f.win&&f.win!=='std'?' · '+(f.win==='short'?'short':'long')+' window':''}</span></div></div>`)};

/* ---------- pitch meetings ---------- */
const PHOOK={
 Action:['A retired getaway driver is dragged into one last job','A bodyguard has 24 hours to keep a witness alive','A disgraced pilot must land a hijacked cargo jet'],
 Superhero:['A night-shift nurse wakes up able to rewind ten seconds','A hero’s powers vanish the day the city needs her most','A villain’s daughter applies to the hero academy'],
 Comedy:['Two rival wedding planners book the same venue','A tech CEO must survive a week living on minimum wage','A family reunion goes wrong when grandma announces an inheritance'],
 Drama:['A small-town teacher fights to keep her school open','A father and son reunite to finish a cross-country drive','A ballet star returns home after a career-ending injury'],
 Horror:['A family moves into a smart home that learns their fears','A night-shift radio host gets calls from the future','Campers find a trail that leads back to the same cabin'],
 'Sci-Fi':['The first colonists on Mars receive a message from Earth that’s 40 years late','A memory surgeon finds a crime inside her own head','A lone engineer must restart a dying generation ship'],
 Animation:['A shy lighthouse crab dreams of seeing the open sea','A lost robot toy crosses a city to get home','A cloud who can’t rain sets out to find out why'],
 Romance:['Two strangers swap apartments for a summer','A food critic falls for the chef she’s about to ruin','Pen pals meet for the first time at 70'],
 Thriller:['A juror realises the defendant is innocent and someone wants her silent','A journalist’s source turns up dead the night before the story runs','A ferry crossing turns into a hostage crisis'],
 Biopic:['The untold story of the first woman to run a film studio','A street racer becomes a championship legend','A forgotten composer behind the century’s biggest songs']};
const PTWIST=['But nobody is who they say they are','And the whole thing plays out in real time','Told backwards, from the ending','With a twist in the last ten minutes nobody will see coming','And it’s set entirely on one night','Told from the villain’s side','With a mystery that only unravels on a second watch','And the best friend is the real threat'];
const PTIER=[['micro','an indie'],['small','a small'],['medium','a mid-budget'],['big','a big-budget'],['tent','a tentpole']];
function pitchOpen(){return (S.pitches||[]).filter(x=>x.status==='new')}
function makePitch(){const role=Math.random()<.6?'writers':'directors';const pool=(S.people[role]||[]).filter(x=>!busy(x)&&!(x.snub>=tNow()));if(!pool.length)return null;
 const c=shuffle(pool).slice(0,7).sort((a,b)=>Math.abs((a.fame||50)-(S.rep||40)*1.1)-Math.abs((b.fame||50)-(S.rep||40)*1.1))[0];
 const g=pick(GENRES);const w=role==='writers'?c:pick(S.people.writers);const q=clamp(Math.round(R(38,88)*.7+(w.skill||60)*.3+(S.rep||40)/18),10,98);
 const ti=g==='Superhero'||g==='Sci-Fi'?RI(2,4):g==='Horror'?RI(0,1):RI(1,3);
 const sc={type:'Pitch meeting',genre:g,title:genTitle(g),q,hype:+R(0,7).toFixed(1),crit:0,adapt:0,fr:Math.random()<.25?.6:.2,writer:w.id,cost:+(crewFee(w,'writers')*R(1.2,1.7)+R(.2,.9)*I()).toFixed(1),pitch:1};
 if(role==='directors')sc.dirAttach=c.id;
 const P={id:(S.pitchN=(S.pitchN||0)+1),who:c.id,role,sc,hook:pick(PHOOK[g]||PHOOK.Drama),twist:pick(PTWIST),tier:ti,mood:RI(62,86),moves:3,asked:{},log:[],status:'new',wk:wIdx()};
 P.log.push({t:`Thanks for seeing me. It’s called <b>${esc(sc.title)}</b>.`},{t:`${P.hook}. ${P.twist}.`},{t:`I see it as ${PTIER[ti][1]} ${g.toLowerCase()} picture${role==='directors'?', and I want to direct it myself':''}.`});
 return P}
function pitchTick(){const k=wIdx();if(S.pitchW===k)return;S.pitchW=k;S.pitches=S.pitches||[];
 S.pitches.forEach(x=>{if(x.status==='new'&&k-x.wk>=4){x.status='gone';const p=person(x.who);if(p)addNews(`📞 ${esc(p.n)} took <i>${esc(x.sc.title)}</i> to another studio after you never took the meeting.`)}});
 S.pitches=S.pitches.filter(x=>x.status==='new'||k-x.wk<40).slice(-30);
 if(S.myScripts){const used=new Set(S.projects.map(p=>p.title).concat(S.films.map(f=>f.title)));S.myScripts=S.myScripts.filter(s=>!used.has(s.title)&&(s.until==null||s.until>=tNow()))}
 if(pitchOpen().length<2&&Math.random()<.24&&!ev('wga')){const P=makePitch();if(P){S.pitches.push(P);if(typeof toast==='function')try{toast(`📞 ${pname(P.who)} wants to pitch you a movie`)}catch(e){}}}
 (S.passed||[]).filter(x=>x.t===tNow()&&!x.done&&S.wk===2).forEach(x=>{x.done=1;const g=+(x.q*R(.8,6)*inf(tNow())).toFixed(1);addNews(`🎬 ${esc(x.studio)}’s <i>${esc(x.title)}</i>, the pitch you passed on, ${g>250*inf(tNow())?'becomes a smash with':'opens and grosses'} ${M(g)} worldwide.`)})}
const _wt10=weekTick;weekTick=function(){_wt10();try{pitchTick()}catch(e){}};
const _nm10=nextMonth;nextMonth=function(){const r=_nm10.apply(this,arguments);try{if(!S.over)pitchTick()}catch(e){}return r};
const _wr10=weekRows;weekRows=function(){const rows=_wr10();pitchOpen().slice(0,2).forEach(x=>rows.unshift(['#7C5CE0',`📞 <b>${esc(pname(x.who))}</b> wants to pitch you <i>${esc(x.sc.title)}</i>`,`pitchView(${x.id})`]));return rows};
const _scr10=scripts;scripts=function(){const a=_scr10();const mine=(S.myScripts||[]).filter(s=>!a.includes(s));return mine.concat(a)};

function pitchScene(P){const p=person(P.who);const tod=(S.wk||0)%2?['#F4B26A','#7C4A8B']:['#9CC9F0','#E8B98A'];
 return `<div class="pscene"><svg viewBox="0 0 360 150" class="pbg" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tod[1]}"/><stop offset="1" stop-color="${tod[0]}"/></linearGradient></defs><rect width="360" height="150" fill="#2A2018"/><rect x="18" y="12" width="324" height="92" rx="6" fill="url(#psky)"/>
 <g fill="#1F1A14" opacity=".55"><rect x="30" y="60" width="22" height="44"/><rect x="56" y="44" width="16" height="60"/><rect x="76" y="70" width="28" height="34"/><rect x="108" y="38" width="14" height="66"/><rect x="250" y="52" width="20" height="52"/><rect x="274" y="66" width="30" height="38"/><rect x="308" y="46" width="18" height="58"/></g>
 <text x="180" y="40" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" opacity=".85" letter-spacing="6">HOLLYWOOD</text>
 <rect x="0" y="104" width="360" height="46" fill="#3A2C20"/><rect x="0" y="118" width="360" height="32" fill="#5B4330"/><rect x="0" y="116" width="360" height="4" fill="#7A5A3E"/>
 <rect x="236" y="96" width="36" height="22" rx="3" fill="#E8E1D4"/><rect x="240" y="99" width="28" height="2" fill="#B9AE9D"/><rect x="240" y="104" width="22" height="2" fill="#B9AE9D"/><circle cx="96" cy="108" r="9" fill="#E8B84A"/><rect x="93" y="94" width="6" height="12" fill="#E8B84A"/></svg>
 <div class="pwho">${portrait(p,76)}<div><b>${esc(p?p.n:'')}</b><span>${P.role==='directors'?'Director':'Screenwriter'} · fame ${Math.round(p?p.fame:0)}</span></div></div></div>`}
function pitchView(id){const P=(S.pitches||[]).find(x=>x.id===id);if(!P)return;const sc=P.sc;const gone=P.status!=='new';
 const chips=[];chips.push(`<span class="tag">${GEN[sc.genre].icon} ${sc.genre}</span>`);if(P.asked.why)chips.push(`<span class="tag ${sc.q>=70?'good':''}">Coverage ${(sc.q/10).toFixed(1)}/10</span>`);if(P.asked.cost)chips.push(`<span class="tag">Rights ${M(sc.cost)}</span>`);if(P.asked.who){const h=(S.heat&&S.heat[sc.genre])||1;chips.push(`<span class="tag ${h>1.05?'hot':''}">${h>1.05?'🔥 Hot genre':h<.95?'❄️ Cooling genre':'Steady genre'}</span>`)}if(sc.fr>=.5)chips.push('<span class="tag hot">Franchise potential</span>');
 const moodC=P.mood>=65?'pos':P.mood>=45?'gold':'neg';
 let h=`<h2 style="display:none">Pitch meeting</h2>${pitchScene(P)}<div class="pmeta"><span>Mood <b class="${moodC}">${P.mood>=65?'Excited':P.mood>=45?'Uneasy':'Annoyed'}</b></span><span>Moves left <b>${P.moves}</b></span></div>
 <div class="pchat">${P.log.map(l=>`<div class="pb ${l.me?'me':''}">${l.t}</div>`).join('')}</div><div class="tags" style="margin:8px 0 12px">${chips.join('')}</div>`;
 if(gone)h+=`<div class="card muted" style="text-align:center">${P.status==='yes'?'✅ You greenlit this pitch.':P.status==='opt'?'📝 You optioned this script. It’s in your script list for a year.':P.status==='walk'?'🚪 They walked out of the meeting.':'This meeting is over.'}</div><button class="btn ghost" onclick="modal()">Close</button>`;
 else{const q=(k,l)=>`<button class="btn sm ghost pq" ${P.moves<=0||P.asked[k]?'disabled':''} onclick="pitchAsk(${id},'${k}')">${l}</button>`;
  h+=`<small class="psec">Ask</small><div class="pgrid">${q('who','Who’s it for?')}${q('why','Why this script?')}${q('cost','What will it cost?')}</div>
  <small class="psec">Push back</small><div class="pgrid">${q('comm','Make it more commercial')}${q('cut','Bring the price down')}${q('twist','Sharpen the twist')}</div>
  <small class="psec">Decide</small><button class="btn gold" onclick="pitchYes(${id})">🎬 Greenlight it</button><div class="pgrid2"><button class="btn ghost" onclick="pitchOption(${id})">📝 Option for ${M(sc.cost*.15)}</button><button class="btn ghost" onclick="pitchPass(${id})">Pass</button></div>`}
 MKEEP=true;modal(h)}
function pitchSay(P,me,t){P.log.push(me?{me:1,t}:{t})}
function pitchAsk(id,k){const P=(S.pitches||[]).find(x=>x.id===id);if(!P||P.moves<=0||P.status!=='new')return;const sc=P.sc;P.moves--;P.asked[k]=1;hap('tap');
 const h=(S.heat&&S.heat[sc.genre])||1;
 if(k==='who'){pitchSay(P,1,'Who’s it for?');pitchSay(P,0,h>1.05?`Right now? Everyone. ${sc.genre} is the hottest thing in town.`:h<.95?`Honestly, ${sc.genre.toLowerCase()} is a tougher sell this year, but this one is different.`:`Fans of ${sc.genre.toLowerCase()}, plus date-night crowds if we cast it right.`)}
 if(k==='why'){pitchSay(P,1,'Why this script?');pitchSay(P,0,sc.q>=75?'Three studios read it. Two cried. It’s the best thing I’ve written.':sc.q>=55?'It’s solid. It needs a polish, but the bones are there.':'It’s rough, I know. That’s why it’s cheap.')}
 if(k==='cost'){pitchSay(P,1,'What will it cost?');pitchSay(P,0,`For the rights, ${M(sc.cost)}. Budget-wise I see it as ${PTIER[P.tier][1]} picture.`)}
 if(k==='comm'){pitchSay(P,1,'Can we make it more commercial? Bigger set pieces, softer edges.');const d=RI(6,16);P.mood-=d;sc.q=clamp(sc.q-RI(1,6),10,98);sc.hype=+(sc.hype+4).toFixed(1);pitchSay(P,0,d>12?'…You want me to sand off everything that makes it special. Fine.':'I can work with that. More spectacle, broader jokes.')}
 if(k==='cut'){pitchSay(P,1,'That price is high for an unproven script.');const d=RI(8,20);P.mood-=d;sc.cost=+(sc.cost*R(.72,.88)).toFixed(1);pitchSay(P,0,d>15?`Wow. Okay. ${M(sc.cost)}, and that’s me being generous.`:`Fair. I’ll come down to ${M(sc.cost)}.`)}
 if(k==='twist'){pitchSay(P,1,'The ending feels safe. Can you sharpen the twist?');const d=RI(0,9),g=RI(-3,8);P.mood-=d;sc.q=clamp(sc.q+g,10,98);P.twist=pick(PTWIST.filter(x=>x!==P.twist));pitchSay(P,0,g>2?`Ooh. What if… ${P.twist.toLowerCase()}? That’s better, right?`:`I can try. ${P.twist}?`)}
 if(P.mood<35){P.status='walk';const p=person(P.who);if(p)p.snub=tNow()+3;pitchSay(P,0,'I think we’re done here. I’ll take this somewhere that wants it.');hap('reject');pitchPassRival(P,.7);addNews(`🚪 ${esc(pname(P.who))} walks out of a pitch meeting at ${esc(S.name)}.`)}
 save();pitchView(id)}
function pitchKeep(P,months){const sc=Object.assign({},P.sc);sc.until=tNow()+months;S.myScripts=(S.myScripts||[]).filter(s=>s.title!==sc.title);S.myScripts.unshift(sc);return sc}
function pitchYes(id){const P=(S.pitches||[]).find(x=>x.id===id);if(!P||P.status!=='new')return;P.status='yes';pitchSay(P,1,'I love it. Let’s make this movie.');hap('confirm');sfx('win');const sc=pitchKeep(P,12);
 const p=person(P.who);if(p)p.rel=clamp((p.rel||0)+8,-100,100);addNews(`🎬 ${esc(S.name)} greenlights <i>${esc(sc.title)}</i> straight out of the pitch room${P.role==='directors'?', with '+esc(pname(P.who))+' directing':''}.`);save();modal();
 startFilm();if(typeof W!=='undefined'&&W&&W.sc){const s=W.sc.find(x=>x.title===sc.title)||sc;if(!W.sc.includes(s))W.sc.unshift(s);W.mode='market';W.script=s;if(sc.dirAttach){const d=person(sc.dirAttach);if(d&&!busy(d)){if(!W.dirs.find(x=>x.id===d.id))W.dirs.unshift(d);W.dir=d.id}}wiz()}}
function pitchOption(id){const P=(S.pitches||[]).find(x=>x.id===id);if(!P||P.status!=='new')return;const fee=+(P.sc.cost*.15).toFixed(1);if(S.cash<fee)return toast('Not enough cash to option it');S.cash-=fee;P.sc.cost=+(P.sc.cost-fee).toFixed(1);P.status='opt';pitchSay(P,1,'I’m not ready to greenlight, but I want it. Let’s option it.');pitchSay(P,0,'Deal. Don’t sit on it too long.');pitchKeep(P,12);sfx('cash');save();pitchView(id)}
function pitchPassRival(P,ch){if(Math.random()<ch){const r=(S.rivals||[]).filter(x=>x.alive!==false);const studio=r.length?pick(r).n:'A rival studio';S.passed=S.passed||[];S.passed.push({title:P.sc.title,q:P.sc.q,studio,t:tNow()+RI(8,15)})}}
function pitchPass(id){const P=(S.pitches||[]).find(x=>x.id===id);if(!P||P.status!=='new')return;P.status='pass';pitchSay(P,1,'It’s not for us. But thank you.');pitchSay(P,0,'Your loss. Someone will make it.');pitchPassRival(P,.45);save();pitchView(id)}
function callPitch(){if(S.callT===tNow())return toast('You already called someone in this month');const P=makePitch();if(!P)return toast('Nobody is free to pitch right now');S.callT=tNow();S.pitches=S.pitches||[];S.pitches.push(P);save();pitchView(P.id)}
function pitchRoom(){const open=pitchOpen();const past=(S.pitches||[]).filter(x=>x.status!=='new').slice(-8).reverse();const lab={yes:'Greenlit',opt:'Optioned',pass:'Passed',walk:'Walked out',gone:'Missed'};
 modal(`<h2>Pitch room</h2><p class="muted" style="font-size:13px;margin:-4px 0 10px">Writers and directors bring you ideas. Ask questions, push back, then decide.</p>
 ${open.length?open.map(x=>`<button class="lrow card" onclick="pitchView(${x.id})">${portrait(person(x.who),40)}<span><b>${esc(pname(x.who))}</b><br><small class="muted">${GEN[x.sc.genre].icon} <i>${esc(x.sc.title)}</i></small></span><b>›</b></button>`).join(''):'<div class="empty">No meetings booked right now.</div>'}
 <button class="btn gold" onclick="callPitch()" ${S.callT===tNow()?'disabled':''}>📞 Call someone in${S.callT===tNow()?' (next month)':''}</button>
 ${(S.myScripts||[]).length?`<div class="sec"><h2>Your scripts</h2></div>${S.myScripts.map(s=>`<div class="card row"><span>${GEN[s.genre].icon} <b>${esc(s.title)}</b><br><small class="muted">Coverage ${(s.q/10).toFixed(1)} · until ${tLabel(s.until)}</small></span><button class="btn sm gold" style="margin:0" onclick="modal();startFilm()">Make</button></div>`).join('')}`:''}
 ${past.length?`<div class="sec"><h2>Recent meetings</h2></div>${past.map(x=>`<button class="lrow" onclick="pitchView(${x.id})"><span>${esc(pname(x.who))} · <i>${esc(x.sc.title)}</i></span><small class="muted">${lab[x.status]||''}</small></button>`).join('')}`:''}`)}
hq8=(function(o){return function(){const n=pitchOpen().length;return o().replace('<div class="sec"><h2>Studio</h2></div><div class="tgrid">',`<div class="sec"><h2>Studio</h2></div><div class="tgrid"><button class="qt" onclick="pitchRoom()">${ic('mic','#B5821C')}<span>Pitch room</span>${n?`<i>${n}</i>`:''}</button>`)}})(hq8);

/* ---------- premium polish: rolling cash counter ---------- */
let CASH10=null;
function countUp(el,from,to){if(typeof requestAnimationFrame==='undefined'||!el)return;const t0=Date.now(),d=650;const step=()=>{const k=Math.min(1,(Date.now()-t0)/d),e=1-Math.pow(1-k,3);el.textContent=M(from+(to-from)*e);if(k<1)requestAnimationFrame(step)};step()}
render=(function(o){return function(){o();try{const el=document.querySelector('.hero-s b');if(el&&CASH10!=null&&Math.abs(CASH10-S.cash)>.05){countUp(el,CASH10,S.cash);if(S.cash>CASH10+1)el.classList.add('up')}if(S&&S.cash!=null)CASH10=S.cash}catch(e){}}})(render);
