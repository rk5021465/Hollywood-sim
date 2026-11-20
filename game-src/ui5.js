/* ===================== v6 — box office runs, critics, TV airing, tiers, styles, rivals, posters & trailers ===================== */
/* ---------- more rival studios ---------- */
const RIV_KIND={'Apex Pictures':'major','Monolith Studios':'major','Starlight Entertainment':'major','Crown Films':'mini','Harbor Lane Pictures':'mini','Lantern Releasing':'indie'};
const RIVALS_NEW=[
 {n:'Vertex Pictures',c:'#2c3e91',p:1.05,svc:null,subs:0,kind:'major'},{n:'Northstar Studios',c:'#16a085',p:.9,svc:null,subs:0,kind:'major'},
 {n:'Silverline Films',c:'#7f8c8d',p:.7,svc:null,subs:0,kind:'mini'},{n:'Bluebird Films',c:'#3498db',p:.45,svc:null,subs:0,kind:'indie'},
 {n:'Echo Park Independent',c:'#d35400',p:.4,svc:null,subs:0,kind:'indie'},{n:'Saffron Studios',c:'#f39c12',p:.6,svc:null,subs:0,kind:'intl',home:'India'},
 {n:'Hanul Pictures',c:'#c0392b',p:.55,svc:null,subs:0,kind:'intl',home:'South Korea'},{n:'Dragon Gate Films',c:'#b71c1c',p:.6,svc:null,subs:0,kind:'intl',home:'China'},
 {n:'Sakura Anime Works',c:'#e91e63',p:.5,svc:null,subs:0,kind:'anime',home:'Japan'},{n:'Flixr Originals',c:'#111111',p:.85,svc:null,subs:0,kind:'streamer'}];
RIVALS0.forEach(r=>r.kind=RIV_KIND[r.n]||'mini');RIVALS_NEW.forEach(r=>{if(!RIVALS0.find(x=>x.n===r.n))RIVALS0.push(r)});
const KIND_L={major:'🏛️ Major studio',mini:'🎬 Mid-size studio',indie:'🎒 Independent',intl:'🌏 International',anime:'🌸 Anime studio',streamer:'📡 Streaming giant'};
genRivals=function(t,far){const alive=S.rivals.filter(r=>r.alive);if(!alive.length)return;
 const pool=far?alive.filter(r=>r.kind==='major'||!r.kind):alive;const n=far?(Math.random()<.55?1:0):RI(3,5);
 const wpick=()=>{const w=pool.map(r=>r.p);let x=Math.random()*sum(w,v=>v);for(let i=0;i<pool.length;i++){x-=w[i];if(x<=0)return pool[i]}return pool[0]};
 for(let i=0;i<n;i++){const st=wpick();if(!st)return;const g=st.kind==='anime'?pick(['Animation','Sci-Fi','Action']):pick(GENRES);
  const ld=rivPick('actors'),dr=rivPick('directors'),co=rivPick('actors');
  const hype=Math.round(clamp(R(15,95)*st.p*(GEN[g].base>1?1.15:1)*(1+S.rep/250)*(far?1.35:1),10,140));
  S.rivalFilms.push({t,wk:RI(0,3),lead:ld,co:co!==ld?co:null,dir:dr,studio:st.n,g,title:genTitle(g),hype,lim:['indie','intl','anime'].includes(st.kind)?1:0,str:st.kind==='streamer'?1:0,anime:st.kind==='anime'?1:0});
  if(!far&&S.rivFull&&tNow()>0&&t-tNow()>=9&&hype>75)addNews(`📅 ${esc(st.n)} dates <i>${esc(S.rivalFilms[S.rivalFilms.length-1].title)}</i> for ${fmtLong(dateOf(t,S.rivalFilms[S.rivalFilms.length-1].wk,5))}.`)}};
rivalsAhead=function(){const t=tNow();S.rivFull=S.rivFull||{};if(S.rivGenTo==null)S.rivGenTo=Math.max(t+13,...S.rivalFilms.map(r=>r.t));
 while(S.rivGenTo<t+25)genRivals(++S.rivGenTo,true);
 for(let x=t;x<=t+12;x++){if(!S.rivFull[x]){S.rivFull[x]=1;if(rivalsAt(x).filter(r=>!r.str).length<4)genRivals(x)}}
 S.rivalFilms.forEach(r=>{if(r.wk==null)r.wk=RI(0,3);if(r.lead===undefined){r.lead=rivPick('actors');r.dir=rivPick('directors')}})};
function ensureV6(){if(!S)return;let added=0;RIVALS0.forEach(r=>{if(!S.rivals.find(x=>x.n===r.n)){S.rivals.push(Object.assign({alive:true,films:0,dom:0},r));added++}else{const x=S.rivals.find(z=>z.n===r.n);if(!x.kind)x.kind=r.kind;if(r.home&&!x.home)x.home=r.home}});
 if(added&&S.hist)genHistory();if(!S.rivFull){S.rivFull={};const t=tNow();S.rivalFilms=S.rivalFilms.filter(r=>r.t<=t+12||r.hype>85)}}
const _ens5=ensureV5;ensureV5=function(){if(!S)return;ensureV6();_ens5()};

/* ---------- critics sites ---------- */
const CRIT_OUT=['The Daily Reel','Screen Gazette','CineFile','The Hollywood Ledger','Film Pulse','Frame & Focus','Popcorn Weekly','The Celluloid Times','Marquee Monthly','Indie Lens','The Projector','Big Screen Review'];
const CRIT_NAMES=['Dana Whitlock','Marcus Obi','Priya Raman','Leo Castellano','June Park','Sam Ortega','Helen Varga','Theo Brandt','Aisha Bello','Ruth Kimura','Felix Navarro','Nora Quinn'];
function critScores(f,p){const r=srng(f.title+'crit');f.nrev=Math.round(60+(f.hype||p.hype||30)*2.5+r()*120);f.meta=Math.round(clamp(f.critic*.62+22+(r()-.5)*14,8,98));
 f.pop=Math.round(clamp(f.aud*1.05+(r()-.5)*10,10,99));f.cert=f.critic>=75&&f.nrev>=80&&f.meta>=60}
function freshIcon(s){return s>=60?'🍅':'🤢'}
function metaColor(m){return m>=61?'#2e9e5b':m>=40?'#e0a020':'#d0393b'}
function critList(f){const r=srng(f.title+'list');return CRIT_OUT.slice(0,8).map((o,i)=>{const s=clamp(Math.round(f.critic+(r()-.5)*40),5,100);
 const q=s>=88?['An instant classic.','Breathtaking from start to finish.','The year\'s best.','Pure cinema.'][i%4]:s>=72?['Smart, moving and confident.','A crowd-pleaser with brains.','Rewards the ticket price.','Beautifully crafted.'][i%4]:s>=58?['Flawed but fun.','Solid if unspectacular.','Worth a matinee.','Entertaining enough.'][i%4]:s>=40?['Uneven and overlong.','A missed opportunity.','Has a few good scenes.','Forgettable.'][i%4]:['A mess.','Painful to sit through.','Avoid.','Dead on arrival.'][i%4];
 return{o,c:CRIT_NAMES[(i+Math.floor(r()*12))%12],s,q,fresh:s>=60}})}
function scorePanel(f){if(f.meta==null)critScores(f,{});return `<div class="scores">
 <div class="sc"><small>Fresh-o-Meter</small><b style="color:${f.critic>=60?'#d0393b':'#5a9e2f'}">${freshIcon(f.critic)} ${f.critic}%</b><span>${f.cert?'⭐ Certified Fresh':f.critic>=60?'Fresh':'Rotten'} · ${f.nrev} reviews</span></div>
 <div class="sc"><small>Popcorn score</small><b>🍿 ${f.pop}%</b><span>audience</span></div>
 <div class="sc"><small>CineGrade</small><b class="gradeb">${f.grade}</b><span>opening-night polls</span></div>
 <div class="sc"><small>MetaMark</small><b class="meta" style="background:${metaColor(f.meta)}">${f.meta}</b><span>${f.meta>=81?'Universal acclaim':f.meta>=61?'Generally favorable':f.meta>=40?'Mixed':'Generally unfavorable'}</span></div></div>`}

/* ---------- box office runs ---------- */
function filmK(f){return wIdx()-(f.releaseT*4+(f.relWk||0))}
function boShown(f){if(!f.weeks||!f.weeks.length||f.dist==='stream'||f.dist==='sell')return{dom:f.dom,intl:f.intl,ww:f.ww,n:0,done:true};
 const n=f.ended?f.weeks.length:clamp(f.shown||f.weeks.length,1,f.weeks.length);const dom=sum(f.weeks.slice(0,n),x=>x);const fr=f.dom?dom/f.dom:1;return{dom,intl:f.intl*fr,ww:dom+f.intl*fr,n,done:!!f.ended||n>=f.weeks.length}}
function screensAt(f,k){return Math.max(80,Math.round((f.screens||3000)*Math.pow(Math.max(.001,f.weeks[k]/f.weeks[0]),.42)))}
let WKREP=[];
function weekBO(){const lines=[];
 S.films.forEach(f=>{if(!f.weeks||!f.weeks.length||f.dist==='stream'||f.dist==='sell'||f.ended)return;if(f.shown==null){f.ended=1;return}
  const k=filmK(f);if(k<=0)return;
  if(k<f.weeks.length&&k+1>f.shown){f.shown=k+1;const w=f.weeks[k],pr=f.weeks[k-1];const ch=Math.round((w/pr-1)*100);const so=boShown(f);
   lines.push({f,k,w,ch,scr:screensAt(f,k),tot:so.dom,ww:so.ww});
   if(k===6)addNews(`📀 <b>${esc(f.title)}</b> arrives on digital rental and PVOD.`)}
  else if(k>=f.weeks.length){f.ended=1;f.shown=f.weeks.length;lines.push({f,end:1});
   addNews(`🏁 <b>${esc(f.title)}</b> leaves theaters after ${f.weeks.length} weeks: ${M(f.dom)} domestic, ${M(f.ww)} worldwide — ${verdict(f)}.`)}
  if(k===16&&!f.strm){f.strm=1;addNews(`📺 <b>${esc(f.title)}</b> lands on ${esc(S.streaming?S.streaming.name:pick([TECH_STREAMER.n].concat(S.rivals.filter(r=>r.svc).map(r=>r.svc))))} after its theatrical window.`)}});
 S.shows.forEach(sh=>{if(sh.status!=='airing')return;const se=sh.seasons[sh.seasons.length-1];if(!se)return;const ds=epDates(se.t,se.wk||0,se.day==null?5:se.day,se.mode||sh.mode,sh.eps);const now=addDays(curDate(),1);
  const aired=ds.filter(d=>d<=now).length;
  if(aired>(sh.aired||0)){for(let i=sh.aired||0;i<aired&&i<sh.eps;i++){if((se.mode||sh.mode)==='weekly'||i===0)lines.push({sh,ep:i,v:se.epViews[i],name:(se.epNames||[])[i]||'Episode '+(i+1),bulk:(se.mode||sh.mode)!=='weekly'})}sh.aired=aired}
  const doneT=(se.mode||sh.mode)==='weekly'?ds[ds.length-1]:addDays(ds[0],21);
  if(sh.aired>=sh.eps&&doneT<=now){sh.status='aired';sh.renew=true;lines.push({sh,fin:1});addNews(`📺 <b>${esc(sh.title)}</b> wraps season ${se.n}: ${se.views}M views, critics ${se.critic}%. Renewal decision pending.`)}});
 if(lines.length){if(!WKREP.length)QUEUE.push(showWeekRep);WKREP=WKREP.concat(lines)}}
function showWeekRep(){const L=WKREP;WKREP=[];if(!L.length)return runQueue();TAB='hq';render();
 modal(`<h3>📊 This week · ${fmtLong(curDate())}</h3>${L.map(x=>{
  if(x.f&&x.end)return `<div class="card mine"><div class="pcard">${posterSVG(x.f,52)}<div style="flex:1"><b>🏁 ${esc(x.f.title)} — final run</b><div class="muted" style="font-size:12px">${x.f.weeks.length} weeks in theaters</div><div class="row" style="font-size:13px;margin-top:4px"><span>Domestic</span><b>${M(x.f.dom)}</b></div><div class="row" style="font-size:13px"><span>Worldwide</span><b>${M(x.f.ww)}</b></div><div class="row" style="font-size:13px"><span>Profit</span><b class="${x.f.profit>=0?'pos':'neg'}">${M(x.f.profit)}</b></div><b>${verdict(x.f)}</b></div></div></div>`;
  if(x.f)return `<div class="card"><div class="pcard">${posterSVG(x.f,46)}<div style="flex:1"><b>${esc(x.f.title)} · week ${x.k+1}</b><div class="row" style="font-size:14px;margin-top:4px"><span>This week</span><b>${M(x.w)} <span class="${x.ch>=0?'pos':'neg'}" style="font-size:12px">${x.ch>=0?'+':''}${x.ch}%</span></b></div><div class="row muted" style="font-size:12px"><span>${x.scr.toLocaleString()} theaters</span><span>Total ${M(x.tot)} dom · ${M(x.ww)} world</span></div></div></div></div>`;
  if(x.fin)return `<div class="card mine"><b>📺 ${esc(x.sh.title)} — season finale aired</b><p class="muted" style="font-size:13px">Time to decide: renew or cancel.</p><button class="btn sm gold" onclick="showModal(${x.sh.id})">Open show</button></div>`;
  return `<div class="card"><b>📺 ${esc(x.sh.title)}</b><div class="row" style="font-size:13px;margin-top:4px"><span>${x.bulk?'All '+x.sh.eps+' episodes dropped':'Ep '+(x.ep+1)+' · '+esc(x.name)}</span><b>${x.v}M views</b></div></div>`}).join('')}
 <button class="btn gold" onclick="modal();runQueue()">Continue</button>`)}
function finalStage(f){const so=boShown(f);const exp=f.dom;const lo=exp*R(.8,.95),hi=exp*R(1.05,1.25);const ratio=f.opening/Math.max(1,f.costTotal);
 $('#app').innerHTML=hud()+`<div class="center" style="padding:6px 0"><div class="lights">★ OPENING WEEKEND REPORT ★</div><h2 style="font-size:28px;margin-top:4px">${f.dist==='stream'||f.dist==='sell'?verdict(f):ratio>.6?'🔥 Huge opening!':ratio>.3?'🎉 Strong start':ratio>.15?'👍 Decent start':'😬 Soft opening'}</h2></div><div class="center" style="margin-bottom:8px">${posterSVG(f,130)}</div>`+filmReport(f,'queue')+
 (f.weeks&&f.weeks.length&&f.dist!=='stream'&&f.dist!=='sell'?`<div class="card"><small>📈 Analysts' projection</small><p style="margin-top:4px">Domestic run of <b>${M(lo)}–${M(hi)}</b>. Every week you'll get a box office report until it leaves theaters.</p></div>`:'')+
 `<div class="card"><small>📱 Social reaction</small>${S.social.filter(p=>p.s.includes(esc(f.title))).slice(0,3).map(p=>`<div class="news"><b style="font-size:13px">@${esc(p.h)}</b><div>${p.s}</div><small>♥ ${p.l.toLocaleString()}</small></div>`).join('')}</div><button class="btn gold" onclick="runQueue()">Continue →</button>`;save();window.scrollTo(0,0)}
function filmReport(f,ctx){const t=tNow();const canFyc=!f.fyc&&f.dist!=='sell'&&f.critic>=72&&yearOf(f.releaseT)===S.year&&S.month>=8;const so=boShown(f);
 let h=`<div class="pcard">${posterSVG(f,64)}<div style="flex:1"><h3>${esc(f.title)}</h3><p class="muted" style="font-size:13px">${f.genre}${f.style&&f.genre!=='Animation'?' · '+(f.style==='anime'?'Anime':'Animated'):''} · ${f.rating} · ${f.rt||120} min<br>Released ${fmtLong(relD(f))}<br>Dir. ${esc(pname(f.dir))} · ${esc(pname(f.cast.lead))}</p>
 ${f.dist==='stream'||f.dist==='sell'?'':so.done?`<span class="stbadge" style="--c:#555">🏁 Run complete · ${f.weeks.length} weeks</span>`:`<span class="stbadge" style="--c:#d9822b">🎟️ In theaters · week ${so.n}</span>`}</div></div>
 ${scorePanel(f)}
 <div class="card"><div class="row"><small>Critics' reviews</small><small>${f.nrev} reviews</small></div>${critList(f).map(r=>`<div class="news" style="padding:6px 0"><div class="row"><b style="font-size:13px">${r.fresh?'🍅':'🤢'} ${r.o}</b><small>${r.s}/100</small></div><i style="font-size:13px">"${r.q}"</i><div class="muted" style="font-size:11px">— ${r.c}</div></div>`).join('')}</div>`;
 if(f.awards.length||f.noms.length)h+=`<div class="card"><small>Awards</small>${f.noms.map(n=>`<div style="margin-top:4px">${f.awards.includes(n)?'🏆 <b>'+n+'</b>':'Nominated: '+n}</div>`).join('')}</div>`;
 if(f.dist==='stream')return h+`<div class="card"><div class="row"><span>Views in first month</span><b>${f.views}M</b></div><div class="row" style="margin-top:6px"><span class="muted">Total cost</span><span>${M(f.costTotal)}</span></div></div>`+fyc(canFyc,f,ctx);
 if(f.dist==='sell')return h+`<div class="card"><div class="row"><span>Licence fee</span><b>${M(f.revenue)}</b></div><div class="row" style="margin-top:6px"><span class="muted">Cost</span><span>−${M(f.costTotal)}</span></div><div class="row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line)"><b>Profit</b><b class="${f.profit>=0?'pos':'neg'}">${M(f.profit)}</b></div></div>`;
 const wk=f.wkend||[f.opening*.4,f.opening*.35,f.opening*.25];const d0=relD(f);
 h+=`<div class="card"><small>${f.dist==='platform'?'Limited opening':'Opening weekend'}</small><div class="row" style="margin-top:6px">${['Fri','Sat','Sun'].map((d,i)=>`<div class="center" style="flex:1"><small>${d} ${addDays(d0,i).getDate()}</small><b style="display:block">${M(wk[i])}</b></div>`).join('')}</div><div class="row" style="margin-top:8px;border-top:1px solid var(--line);padding-top:6px"><b>Weekend</b><b class="big">${M(f.opening)}</b></div></div>
 <div class="grid2"><div class="card stat"><small>Domestic ${so.done?'':'so far'}</small><span class="big">${M(so.dom)}</span></div><div class="card stat"><small>Worldwide ${so.done?'':'so far'}</small><span class="big">${M(so.ww)}</span></div></div>
 <div class="card"><small>Week by week</small><table style="margin-top:4px;font-size:13px"><tr><th>Wk</th><th>Dates</th><th class="r">Gross</th><th class="r">Δ</th><th class="r">Theaters</th></tr>${f.weeks.slice(0,so.n).map((w,i)=>{const a=addDays(d0,7*i);return `<tr><td>${i+1}</td><td>${a.getDate()} ${MON[a.getMonth()]}</td><td class="r">${M(w)}</td><td class="r ${i&&w>=f.weeks[i-1]?'pos':'neg'}">${i?Math.round((w/f.weeks[i-1]-1)*100)+'%':'—'}</td><td class="r">${screensAt(f,i).toLocaleString()}</td></tr>`}).join('')}</table>${so.done?'':`<p class="muted" style="font-size:12px;margin-top:6px">Next week's numbers arrive when you advance a week.</p>`}</div>
 <div class="card"><small>World box office ${so.done?'':'so far'}</small><table style="margin-top:4px">${f.countries.slice(0,9).map(c=>`<tr><td>${c.f} ${c.k}${c.star?` <small style="text-transform:none">⭐ ${esc(c.star.split(' ')[0])}</small>`:''}</td><td class="r">${c.ban?'<span class="neg">Not released</span>':M(c.g*(f.intl?so.intl/f.intl:1))}</td></tr>`).join('')}</table></div>`;
 if(so.done)h+=`<div class="card">${[['Domestic rentals (62% → 45% by week)',f.domRent],['Overseas rentals (~40%; China 25%)',f.intlRent],['Digital, home & TV licensing',f.ancillary],['Tax rebate',f.rebate]].map(r=>`<div class="row muted" style="font-size:13px;margin-top:4px"><span>${r[0]}</span><span>${M(r[1])}</span></div>`).join('')}
 ${f.backendPay?`<div class="row muted" style="font-size:13px;margin-top:4px"><span>Star's back-end</span><span>−${M(f.backendPay)}</span></div>`:''}${f.partner?`<div class="row muted" style="font-size:13px;margin-top:4px"><span>Co-financier</span><span>−${M(f.partner)}</span></div>`:''}
 <div class="row muted" style="font-size:13px;margin-top:4px"><span>Your costs</span><span>−${M(f.costTotal)}</span></div><div class="row" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--line)"><b>Ultimate profit</b><b class="big ${f.profit>=0?'pos':'neg'}">${f.profit>=0?'+':''}${M(f.profit)}</b></div></div>`;
 else h+=`<div class="card"><div class="row"><small>Total spent</small><b>${M(f.costTotal)}</b></div><p class="muted" style="font-size:12px;margin-top:4px">Final profit is calculated when the run ends. 📀 Digital release in week 7 · 📺 streaming/TV deal in week 17.</p></div>`;
 return h+fyc(canFyc,f,ctx)}
function fyc(can,f,ctx){return can?`<div class="card" id="fyc" style="border-color:var(--gold)"><b>🏆 For Your Consideration</b><p class="muted" style="font-size:13px;margin:4px 0">Screeners, trade ads and Q&amp;As before the Golden Statues.</p>${[5,15,30].map(a=>`<button class="btn sm ${a===30?'gold':'ghost'}" onclick="fycCampaign(${f.id},${Math.round(a*I())},'${ctx}')">${M(a*I())}</button>`).join('')}</div>`:''}
const _rs6=releaseScreen;releaseScreen=function(f){if(f.dist==='stream'||f.dist==='sell')return _rs6(f);if(typeof openingRace==='function')return openingRace(f);S.films.includes(f)||S.films.push(f);save();const wk=f.wkend||[f.opening*.4,f.opening*.35,f.opening*.25];const d0=relD(f);
 $('#app').innerHTML=`<div class="center lights" style="padding:8px">★ OPENING NIGHT · ${fmtLong(d0)} ★</div>${cinemaScene(f)}<div class="popcard"><small>${esc(f.title)} · ${(f.screens||4).toLocaleString()} theaters</small><div class="row" style="margin:10px 0">${['Friday','Saturday','Sunday'].map((d,i)=>`<div class="center" style="flex:1"><small>${d}</small><div class="countup" style="font-size:22px" id="dy${i}">—</div></div>`).join('')}</div><small>Opening weekend</small><div class="countup" id="cu">$0M</div></div><button class="btn gold" id="cn" style="visibility:hidden" onclick="reviewStage(S.films.find(x=>x.id===${f.id}))">Continue →</button>`;
 window.scrollTo(0,0);let day=0,acc=0;const step=()=>{if(day>2){sfx(f.opening>20*I()?'cash':'flop');const b=$('#cn');if(b)b.style.visibility='visible';if(f.opening>40*I()&&document.body){document.body.insertAdjacentHTML('beforeend',confetti(50));setTimeout(()=>{const c=document.querySelector('.confetti');if(c)c.remove()},4000)}return}
  let v=0;const tgt=wk[day];const st=Math.max(tgt/25,.02);const tk=setInterval(()=>{v=Math.min(tgt,v+st);const e=$('#dy'+day);if(e)e.textContent=M(v);const c=$('#cu');if(c)c.textContent=M(acc+v);if(v>=tgt){clearInterval(tk);acc+=tgt;day++;setTimeout(step,350)}},35)};step()};
const _rv6=reviewStage;reviewStage=function(f){_rv6(f);const pc=document.querySelector('.popcard');if(pc&&pc.insertAdjacentHTML)pc.insertAdjacentHTML('afterend',scorePanel(f))};

/* ---------- budget tiers & styles ---------- */
const TIERS=[{k:'micro',l:'🎒 Micro / Indie',r:[1,5],d:'Festival darling potential. Huge profit if it hits.',days:.6},{k:'small',l:'🎬 Small',r:[5,25],d:'Horror, comedy, drama. Low risk.',days:.8},{k:'medium',l:'🎥 Medium',r:[25,80],d:'Most genres. Needs some star power.',days:1},{k:'big',l:'🏗️ Big budget',r:[80,200],d:'Action & sci-fi. Needs heavy marketing.',days:1.2},{k:'tent',l:'🚀 Tentpole',r:[200,400],d:'Franchise-level. Huge risk, huge reward.',days:1.4}];
function tierOf(prod){const b=prod/I();return (TIERS.find(t=>b<t.r[1])||TIERS[4]).k}
function tierRange(){const t=TIERS.find(x=>x.k===W.tier);if(!t)return[2,Math.round(350*I())];return[Math.max(1,Math.round(t.r[0]*I())),Math.round(t.r[1]*I())]}
function tierRoom(){return S.cash+creditLimit()-committed()-wizFees(W)}
function tierOK(t){return t.r[0]*I()*1.5<=tierRoom()||t.k==='micro'}
function tierCard(g){if(!W.tier)W.tier=tierOf(W.prod||GEN[g].budget*I());return `<div class="card"><small>Budget tier</small>${TIERS.map(t=>{const ok=tierOK(t);return `<div class="opt ${W.tier===t.k?'sel':''}" style="padding:9px;border-radius:10px;border:1px solid var(--line);margin-top:6px;${ok?'':'opacity:.5'}" onclick="${ok?`setTier('${t.k}')`:''}"><div class="row"><b>${t.l}</b><span class="muted">${M(t.r[0]*I())}–${M(t.r[1]*I())}</span></div><small style="text-transform:none">${ok?t.d:'🔒 Not enough money (with marketing) for this tier yet.'}</small></div>`}).join('')}</div>`}
function setTier(k){const t=TIERS.find(x=>x.k===k);if(!tierOK(t))return;W.tier=k;W.prod=Math.round((t.r[0]+t.r[1])/2*I());W.days=Math.round(GEN[W.script.genre].days*t.days)||W.days;wiz()}
function styleCard(g){const fmt=g==='Animation'?(W.style==='anime'?'anime':'anim'):!W.style?'live':W.style==='anime'?'anime':'anim';
 return `<div class="card"><small>Movie style</small><div class="seg"><button class="${fmt==='live'?'on':''}" ${g==='Animation'?'disabled style="opacity:.4"':''} onclick="W.style=null;wiz()">🎥 Live-action</button><button class="${fmt==='anim'?'on':''}" onclick="W.style='3D';wiz()">🧸 Animation</button><button class="${fmt==='anime'?'on':''}" onclick="W.style='anime';wiz()">🌸 Anime</button></div>
 ${fmt==='anim'?`<div class="chips" style="margin-top:6px">${ANIM_STYLES.filter(a=>a.k!=='anime').map(a=>`<button class="${W.style===a.k?'on':''}" onclick="W.style='${a.k}';wiz()">${a.l}</button>`).join('')}</div>`:''}
 <p class="muted" style="font-size:12px;margin-top:6px">${fmt==='live'?'Stars matter most. Costs depend on sets, stunts and locations.':fmt==='anim'?'Voice casts are cheaper, takes longer, loved by families and great for merchandise.':'Cheaper to make, devoted fans. Huge in Japan, Korea and China and on streaming.'}</p></div>`}
const _neg6=negotiate;negotiate=function(id,role,slot){const p=person(id);const t=W&&W.tier;
 if(p&&role==='actors'&&p.star>80&&(t==='micro'||t==='small'))return modal(`<div class="center">${portrait(p,80)}<h3>${esc(p.n)} passes</h3><p class="muted" style="margin-top:6px">"I don't do ${t==='micro'?'micro-budget':'small'} films right now." A-list stars want bigger projects.</p></div><button class="btn ghost" onclick="modal()">OK</button>`);
 if(p&&role==='directors'&&hasT(p,'auteur')&&t==='tent')return modal(`<div class="center">${portrait(p,80)}<h3>${esc(p.n)} passes</h3><p class="muted" style="margin-top:6px">"Tentpoles crush creativity. Call me for something personal."</p></div><button class="btn ghost" onclick="modal()">OK</button>`);
 return _neg6(id,role,slot)};
const _gl6=greenlight;greenlight=function(){const n=S.projects.length;const tier=W.tier||tierOf(W.prod);_gl6();if(S.projects.length>n){const p=S.projects[S.projects.length-1];p.tier=tier;p.trailers=[];p.posterRev={}}};

/* ---------- smooth progress ---------- */
stageInfo=function(p){const ph=phaseOf(p);const i=STG.findIndex(s=>s[0]===ph);const e=(tNow()-p.startT)*4+(S.wk||0);
 const seg=ph==='pre'?[0,p.sch.pre]:ph==='shoot'?[p.sch.pre,p.sch.pre+p.sch.shoot]:ph==='post'?[p.sch.pre+p.sch.shoot,p.sch.total]:null;
 let pct=100,endD=null;if(seg){pct=clamp(Math.round((e-seg[0]*4)/((seg[1]-seg[0])*4)*100),0,99);endD=dateOf(p.startT+seg[1],0,1)}
 else{const tot=(p.releaseT*4+(p.relWk||0))-(p.startT+p.sch.total)*4;const left=(p.releaseT*4+(p.relWk||0))-((tNow())*4+(S.wk||0));pct=tot>0?clamp(Math.round((1-left/tot)*100),0,100):100}
 return{ph,i,pct,endD,mo:null}};
statusBadge=function(p){if(p.dist==='sell')return '<span class="stbadge" style="--c:#9b59b6">💰 Sold to a streamer</span>';const s=stageInfo(p);const st=STG[s.i];
 const txt=s.ph==='ready'?`Release countdown · out ${fmtDay(relD(p))}`:`${st[1]} · ${s.pct}% · ${s.ph==='pre'?'shoot starts':s.ph==='shoot'?'wraps':'locks'} ${fmtDay(s.endD)}`;return `<span class="stbadge" style="--c:${st[3]}">${st[2]} ${txt}</span>`};
stageBar=function(p){const s=stageInfo(p);return `<div class="stg">${STG.map((st,i)=>`<div class="${i<s.i?'done':i===s.i?'cur':''}" style="--c:${st[3]}"><i><b style="width:${i<s.i?100:i===s.i?s.pct:0}%"></b></i><span>${i<s.i?'✔ ':i===s.i?st[2]+' ':''}${st[1]}${i===s.i?' '+s.pct+'%':''}</span></div>`).join('')}</div><div style="margin-top:6px">${statusBadge(p)}</div>`};

/* ---------- poster reveals & trailers ---------- */
function marketingCard(p){const ph=phaseOf(p);if(p.dist==='sell')return '';p.posterRev=p.posterRev||{};p.trailers=p.trailers||[];const pr=p.posterRev;const near=(p.releaseT*4+(p.relWk||0))-wIdx();
 const pbtn=(k,l,ok,why)=>pr[k]?`<span class="tag good">✔ ${l} released</span>`:ok?`<button class="btn sm ghost" onclick="revealPoster(${p.id},'${k}')">📢 ${l}</button>`:`<span class="tag">🔒 ${l} · ${why}</span>`;
 const has=k=>p.trailers.some(x=>x.k===k);
 const tbtn=(k,l,ok,why)=>has(k)?`<span class="tag good">✔ ${l} out</span>`:ok?`<button class="btn sm ghost" onclick="trailerPlan(${p.id},'${k}')">🎞️ ${l}</button>`:`<span class="tag">🔒 ${l} · ${why}</span>`;
 return `<div class="card"><b>📣 Marketing rollout</b><p class="muted" style="font-size:12px;margin:2px 0 6px">Tease fans step by step. Too many trailers can spoil the film.</p>
 <small>Posters</small><div class="tags">${pbtn('teaser','Teaser poster',ph!=='pre','after filming starts')}${pbtn('char','Character posters',ph==='shoot'||ph==='post'||ph==='ready','during filming')}${pbtn('final','Final poster',(ph==='post'||ph==='ready'),'in post-production')}</div>
 <small style="display:block;margin-top:8px">Trailers</small><div class="tags">${tbtn('teaser','Teaser trailer',ph!=='pre','during filming')}${tbtn('main','Main trailer',ph==='post'||ph==='ready','in post-production')}${tbtn('final','Final trailer',ph==='ready'&&near<=6,'2–6 weeks before release')}</div>
 ${p.trailers.length?`<div class="muted" style="font-size:12px;margin-top:6px">${p.trailers.map(x=>`${x.l}: ${x.views}M views · ${x.like}% 👍`).join('<br>')}</div>`:''}</div>`}
const _pm6=projectModal;projectModal=function(id){_pm6(id);const p=S.projects.find(x=>x.id===id);const box=document.querySelector('#modal .modal>div');if(p&&box&&box.insertAdjacentHTML)box.insertAdjacentHTML('beforeend',marketingCard(p))};
function revealPoster(id,k){const p=S.projects.find(x=>x.id===id);if(!p)return;const d=p.poster||defaultPoster(p);const sc=posterScore(p,d).score;const star=castStats(p).star;
 const base=k==='teaser'?R(1,3):k==='char'?1.5+star/40:2+sc/30;const cost=k==='char'?.5*I():.2*I();S.cash-=cost;p.paid+=cost;
 const qual=k==='teaser'?R(50,85):k==='char'?clamp(star+R(-10,15),20,95):sc;const flop=qual<45;let gain=+(base*(qual/60)*R(.7,1.3)).toFixed(1);if(flop)gain=-RI(1,3);
 p.hype+=gain;p.posterRev=p.posterRev||{};p.posterRev[k]=wIdx();const likes=Math.round((qual*8000+star*5000)*R(.6,1.4));
 const disp=k==='teaser'?teaserSVG(p,140):posterSVG(p,140,d);const lbl={teaser:'Teaser poster',char:'Character posters',final:'Final poster'}[k];
 post(S.name.replace(/\s+/g,''),`${lbl.toLowerCase()} for ${esc(p.title)} just dropped 👀`,likes);if(flop)post(null,`who designed the ${esc(p.title)} poster 💀`,RI(2000,40000));
 sfx(flop?'flop':'cash');save();
 modal(`<div class="center"><small>📢 ${lbl} reveal</small><div style="display:flex;gap:6px;justify-content:center;margin:8px 0">${k==='char'?castStats(p).leads.concat(castStats(p).cos).slice(0,3).map(a=>charPosterSVG(p,a,90)).join(''):disp}</div>
 <div class="feed" style="--c:#e1306c;text-align:left"><div class="row"><b>📸 Fan reaction</b><span class="tag ${flop?'bad':qual>75?'hot':'good'}">${flop?'😬 Mocked':qual>75?'🔥 Loved':'👍 Liked'}</span></div><div class="row" style="font-size:13px;margin-top:4px"><span>❤️ ${fmtC(likes)}</span><span>💬 ${fmtC(likes*.06)}</span><b class="${gain>=0?'pos':'neg'}">${gain>=0?'+':''}${gain} buzz</b></div>
 <div class="muted" style="font-size:12px;margin-top:4px">@${pick(HANDLES)}: ${flop?'this looks cheap ngl':k==='teaser'?'so mysterious… I need more':'the poster alone sold me'}</div></div></div><button class="btn gold" onclick="projectModal(${id})">Back to project</button>`)}
function teaserSVG(p,w){const P=P_PALS[(p.poster||defaultPoster(p)).pal]||P_PALS.noir;const y=yearOf(p.releaseT)+START_YEAR-START_YEAR;
 return `<svg viewBox="0 0 200 300" width="${w}" height="${w*1.5}" style="display:block;border-radius:6px;box-shadow:0 6px 20px #0008"><defs><radialGradient id="tz${p.id}" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="${P[1]}"/><stop offset="1" stop-color="#000"/></radialGradient></defs><rect width="200" height="300" fill="url(#tz${p.id})"/><g transform="translate(55 70) scale(.9)">${silhouette('#000d')}</g><circle cx="100" cy="120" r="70" fill="none" stroke="${P[2]}" stroke-opacity=".25"/><text x="100" y="236" text-anchor="middle" font-family="'Bebas Neue',Impact" font-size="13" letter-spacing="6" fill="${P[2]}">${esc(p.title.toUpperCase().slice(0,22))}</text><text x="100" y="262" text-anchor="middle" font-family="Inter" font-size="9" letter-spacing="4" fill="#ddd">COMING ${y}</text></svg>`}
function charPosterSVG(p,a,w){const d=Object.assign({},p.poster||defaultPoster(p),{layout:'bigface',tagline:''});const fake=Object.assign({},p,{title:a.n.split(' ')[0],cast:{lead:a.id}});return posterSVG(fake,w,d)}
function trailerPlan(id,k){const p=S.projects.find(x=>x.id===id);const m=S.month;const ev=[['none','Online premiere',0,1],...(m===1?[['bowl','Big-game TV spot',7,3]]:[]),...(m===6?[['con','Fan convention panel',1.5,2]]:[]),['tv','Late-night TV debut',.8,1.4]];
 modal(`<h3>🎞️ ${{teaser:'Teaser',main:'Main',final:'Final'}[k]} trailer · ${esc(p.title)}</h3><p class="muted" style="font-size:13px">${k==='teaser'&&GEN[p.genre].vfx>=.5?'⚠️ Effects are unfinished — fans may mock them.':'Choose how to launch it.'}</p>${ev.map(e=>`<div class="card opt" onclick="launchTrailer(${id},'${k}','${e[0]}')"><div class="row"><b>${e[1]}</b><b>${e[2]?M(e[2]*I()):'Free'}</b></div><small style="text-transform:none">Reach ×${e[3]}${e[0]==='bowl'?' · only in February':e[0]==='con'?' · only in July':''}</small></div>`).join('')}<button class="btn ghost" onclick="projectModal(${id})">Back</button>`)}
function launchTrailer(id,k,evk){const p=S.projects.find(x=>x.id===id);const evm={none:[0,1],bowl:[7,3],con:[1.5,2],tv:[.8,1.4]}[evk];const cost=evm[0]*I();S.cash-=cost;p.paid+=cost;
 let tq=clamp(p.q+p.chem+R(-12,12),5,99);let mock=false;if(k==='teaser'&&GEN[p.genre].vfx>=.5&&phaseOf(p)==='shoot'&&Math.random()<.3){tq-=25;mock=true}
 const views=+(R(.6,1.4)*(4+p.hype*.5+castStats(p).star*.35)*GEN[p.genre].base*evm[1]*(k==='main'?1.3:k==='teaser'?.8:1)).toFixed(1);const like=clamp(Math.round(55+(tq-60)*.8+R(-8,8)+lotLv('marketing')*4),12,98);
 const n=(p.trailers=p.trailers||[]).length;let gain=((tq-55)/5+Math.min(6,views/9))*(n>=3?.4:1);if(n>=3){p.spoil=1}
 p.hype+=gain;const tr={k,l:{teaser:'Teaser trailer',main:'Main trailer',final:'Final trailer'}[k],t:tNow(),views,like};p.trailers.push(tr);p.trailer={t:tNow(),views,like};
 addNews(`🎞️ The ${tr.l.toLowerCase()} for <b>${esc(p.title)}</b> hits ${views}M views in 24 hours (${like}% positive)${mock?' — fans mock the unfinished effects':''}.`);
 if(p.spoil)post(null,`the ${esc(p.title)} trailers showed the whole movie 🙄`,RI(3000,60000));save();showTrailer(p)}
/* premium specialist posters */
const _psvg6=posterSVG;posterSVG=function(f,w,design){const d=design||f.poster||defaultPoster(f);let s=_psvg6(f,w,d);const tier=d.tier||0;
 if(!tier&&f.style!=='anime')return s;const P=P_PALS[d.pal]||P_PALS.noir;const u='x'+(hashStr(f.title+JSON.stringify(d))%99999);
 let defs=`<defs><radialGradient id="g${u}" cx=".5" cy=".38" r=".55"><stop offset="0" stop-color="${P[2]}" stop-opacity=".85"/><stop offset=".5" stop-color="${P[2]}" stop-opacity=".25"/><stop offset="1" stop-color="${P[2]}" stop-opacity="0"/></radialGradient><linearGradient id="m${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".42" stop-color="${P[2]}"/><stop offset=".5" stop-color="#2a1a08"/><stop offset=".58" stop-color="${P[2]}"/><stop offset="1" stop-color="#ffffff"/></linearGradient><linearGradient id="f${u}" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient><radialGradient id="v${u}" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient><filter id="s${u}"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity=".8"/></filter>${tier>=2?`<filter id="n${u}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="t"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .12"/></feComponentTransfer></filter>`:''}</defs>`;
 let under='',over='';
 if(tier){under=`<ellipse cx="100" cy="115" rx="110" ry="120" fill="url(#g${u})"/>`+Array.from({length:12},(_,i)=>`<path d="M100 110 L${100+Math.cos(i*.52)*240} ${110+Math.sin(i*.52)*240} L${100+Math.cos(i*.52+.12)*240} ${110+Math.sin(i*.52+.12)*240}Z" fill="#ffffff" opacity=".09"/>`).join('');
  over=`<rect width="200" height="300" fill="url(#f${u})"/><rect width="200" height="300" fill="url(#v${u})"/>`;
  const cast=allCast(f.cast).map(person).filter(Boolean);if(cast.length>=3&&(d.layout==='star'||d.layout==='bigface')){const emb=(p,x,y,sz)=>`<g transform="translate(${x} ${y}) scale(${sz/100})" opacity=".95">${portrait(p,100,{bg:'transparent'}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>`;over=emb(cast[1],-12,118,62)+emb(cast[2],150,118,62)+over}
  if(tier>=2)over+=`<rect width="200" height="300" filter="url(#n${u})"/><circle cx="150" cy="60" r="18" fill="#fff" opacity=".18"/><circle cx="150" cy="60" r="6" fill="#fff" opacity=".5"/><circle cx="120" cy="90" r="4" fill="#fff" opacity=".3"/><circle cx="60" cy="150" r="9" fill="${P[2]}" opacity=".25"/>`}
 if(f.style==='anime'){under+=Array.from({length:26},(_,i)=>`<line x1="100" y1="120" x2="${100+Math.cos(i*.2417)*260}" y2="${120+Math.sin(i*.2417)*260}" stroke="#fff" stroke-opacity=".12" stroke-width="${1+i%3}"/>`).join('')+`<text x="186" y="60" font-size="14" fill="${P[2]}" opacity=".8" writing-mode="tb" font-weight="900">映画</text>`}
 s=s.replace('<g>',defs+'<g>');
 s=s.replace('<!--OVER-->',over);
 if(tier)s=s.replace(/(<text x="100" y="\d+(\.\d+)?" font-family="[^"]*" font-size="[\d.]+" fill=")([^"]+)(" text-anchor="middle") stroke="#000" stroke-opacity=".35" stroke-width=".8"/g,`$1url(#m${u})$4 stroke="${tier>=2?'#ffd77a':'#ffffff'}" stroke-opacity=".95" stroke-width="${tier>=2?1.2:.8}" filter="url(#s${u})"`);
 if(tier)s=s.replace('</g></svg>',`<rect x="3" y="3" width="194" height="294" rx="4" fill="none" stroke="${P[2]}" stroke-opacity="${tier>=2?.8:.45}" stroke-width="${tier>=2?2:1}"/>${tier>=2?`<text x="100" y="56" font-family="Inter" font-size="6" fill="#ffd77a" text-anchor="middle" letter-spacing="1">★★★★★ "UNMISSABLE"</text>`:''}</g></svg>`);
 if(tier>=1)s=s.replace(/(<rect y="268" width="200" height="32" fill="#000" opacity=".45"\/>)/,`$1<text x="100" y="275" font-family="'Bebas Neue',Impact" font-size="5" fill="#bbb" text-anchor="middle" letter-spacing=".4">MUSIC BY ${esc(pname(f.comp).toUpperCase())} · DIRECTOR OF PHOTOGRAPHY ${esc(pname(f.dp).toUpperCase())}</text>`);
 if(tier>=2){const best=S&&S.films.filter(x=>x.id!==f.id).sort((a,b)=>b.ww-a.ww)[0];if(best)s=s.replace(/( PRESENTS<\/text>)/,`$1<text x="100" y="42" font-family="Inter" font-size="5.5" fill="${P[3]}" text-anchor="middle" letter-spacing="1" opacity=".9">FROM THE STUDIO THAT BROUGHT YOU ${esc(best.title.toUpperCase())}</text>`)}
 s=s.replace('<!--UNDER-->',under);
 return s};

/* ---------- TV: style + renewal wizard ---------- */
const _tvw6=tvWiz;tvWiz=function(){_tvw6();if(TW&&TW.step===3){const box=document.getElementById?document.getElementById('app'):null;if(box&&box.insertAdjacentHTML&&box.querySelector){const f=TW.fmt||'live';const h=`<div class="card" id="tvfmt"><small>Show style</small><div class="seg">${[['live','🎥 Live-action'],['anim','🧸 Animation'],['anime','🌸 Anime']].map(x=>`<button class="${f===x[0]?'on':''}" onclick="TW.fmt='${x[0]}';tvWiz()">${x[1]}</button>`).join('')}</div><p class="muted" style="font-size:12px;margin-top:4px">${f==='live'?'Full cost; stars drive viewers.':f==='anim'?'About 20% cheaper per episode; family friendly.':'About 40% cheaper; strong on streaming and in Asia.'}</p></div>`;const h3=box.querySelector('h2');if(h3)h3.insertAdjacentHTML('afterend',h)}}};
const _renew6=renewShow;let RW=null;
renewShow=function(id,yes,force){if(!yes||force)return _renew6(id,yes);setTimeout(()=>renewWizard(id),0)};
function renewWizard(id){const s=S.shows.find(x=>x.id===id);if(!s)return;if(!RW||RW.id!==id)RW={id,lead:s.lead,cos:(s.cos||[]).slice(),out:[],add:[],eps:s.eps,mode:s.mode,premWk:s.premWk||0,day:s.day==null?5:s.day,delay:0,pool:shuffle(S.people.actors.filter(a=>!busy(a)&&a.id!==s.lead&&!(s.cos||[]).includes(a.id))).slice(0,8)};
 const ret=[s.lead].concat(s.cos||[]).filter(Boolean).map(person).filter(Boolean);const raise=a=>Math.round(8+a.star/8);
 modal(`<h3>🔁 Renew ${esc(s.title)} · season ${s.season+1}</h3><p class="muted" style="font-size:13px">Last season: ${s.seasons[s.seasons.length-1].views}M views, ${s.seasons[s.seasons.length-1].critic}% critics.</p>
 <div class="card"><h3>Returning cast</h3>${ret.map(a=>{const out=RW.out.includes(a.id);return `<div class="crow">${portrait(a,40)}<div style="flex:1"><b>${esc(a.n)}</b><div class="muted" style="font-size:12px">${a.id===s.lead?'Lead':'Co-star'} · wants +${raise(a)}% raise</div></div><button class="btn sm ${out?'gold':'ghost'}" style="margin:0;width:auto" onclick="RW.out.${out?'splice(RW.out.indexOf(\''+a.id+'\'),1)':'push(\''+a.id+'\')'};renewWizard(${id})">${out?'↩️ Keep':'✂️ Write out'}</button></div>`}).join('')}</div>
 <div class="card"><h3>Add new cast (up to 3)</h3>${RW.pool.map(a=>{const on=RW.add.includes(a.id);return `<div class="crow">${portrait(a,40)}<div style="flex:1"><b>${natOf(a.nat)[1]} ${esc(a.n)}</b><div class="muted" style="font-size:12px">⭐ ${a.skill} · 💜 ${a.star} · ${M(actorFee(a)*.4)}/season</div></div><button class="btn sm ${on?'gold':'ghost'}" style="margin:0;width:auto" onclick="${on?`RW.add=RW.add.filter(x=>x!=='${a.id}')`:`if(RW.add.length<3)RW.add.push('${a.id}')`};renewWizard(${id})">${on?'✔ Added':'＋ Add'}</button></div>`}).join('')}
 ${RW.out.includes(s.lead)?`<p class="muted" style="font-size:12px;margin-top:6px">${RW.add.length?'The first new actor becomes the lead.':'⚠️ Pick a new actor to recast the lead.'}</p>`:''}</div>
 <div class="card"><small>Episodes</small><div class="chips">${[6,8,10,13,22].map(n=>`<button class="${RW.eps===n?'on':''}" onclick="RW.eps=${n};renewWizard(${id})">${n}</button>`).join('')}</div>
 <small style="display:block;margin-top:8px">Release</small><div class="seg"><button class="${RW.mode==='binge'?'on':''}" onclick="RW.mode='binge';renewWizard(${id})">📦 Binge</button><button class="${RW.mode==='weekly'?'on':''}" onclick="RW.mode='weekly';renewWizard(${id})">📅 Weekly</button></div>
 <small style="display:block;margin-top:8px">${RW.mode==='weekly'?'Air day':'Drop day'}</small><div class="chips">${[1,2,3,4,5,6,0].map(d=>`<button class="${RW.day===d?'on':''}" onclick="RW.day=${d};renewWizard(${id})">${DOW[d]}</button>`).join('')}</div>
 <small style="display:block;margin-top:8px">Premiere week</small><div class="weeks">${[0,1,2,3].map(k=>`<button class="${RW.premWk===k?'on':''}" onclick="RW.premWk=${k};renewWizard(${id})">Week ${k+1}</button>`).join('')}</div></div>
 <button class="btn gold" ${RW.out.includes(s.lead)&&!RW.add.length?'disabled':''} onclick="applyRenew(${id})">🟢 Renew for season ${s.season+1}</button><button class="btn ghost" onclick="RW=null;showModal(${id})">Cancel</button>`)}
function applyRenew(id){const s=S.shows.find(x=>x.id===id);const R0=RW;RW=null;_renew6(id,true);
 let cos=(s.cos||[]).filter(x=>!R0.out.includes(x));let lead=s.lead;const add=R0.add.slice();if(R0.out.includes(s.lead)){lead=add.shift()||lead;addNews(`🎭 ${esc(pname(s.lead))} exits <b>${esc(s.title)}</b>; ${esc(pname(lead))} takes over the lead.`)}
 cos=cos.concat(add).slice(0,5);const newA=R0.add.map(person).filter(Boolean);s.lead=lead;s.cos=cos;s.eps=R0.eps;s.mode=R0.mode;s.day=R0.day;s.premWk=R0.premWk;
 s.epNames=Array.from({length:s.eps},()=>epTitle());s.cliff=Array.from({length:s.eps},()=>Math.random()<.25?1:0);
 const extra=sum(newA,a=>actorFee(a)*.4);S.cash-=extra;s.paid=(s.paid||0)+extra;s.q+=newA.length?sum(newA,a=>(a.skill-60)/20):0;
 [lead].concat(cos).map(person).filter(Boolean).forEach(a=>a.busy=s.readyT-1);
 if(newA.length)addNews(`📺 <b>${esc(s.title)}</b> season ${s.season} adds ${newA.map(a=>esc(a.n)).join(', ')} to the cast.`);save();modal();render()}

/* ---------- date-grid calendar ---------- */
function calGrid(x,its){const y=START_YEAR+Math.floor(x/12),m=x%12;const first=new Date(y,m,1).getDay();const days=new Date(y,m+1,0).getDate();const now=curDate();
 const by={};its.forEach(it=>{const d=dateOf(x,it.wk,5).getDate();(by[d]=by[d]||[]).push(it)});let h='<div class="cgrid">'+DOW.map(d=>`<b>${d[0]}</b>`).join('');
 for(let i=0;i<first;i++)h+='<span></span>';
 for(let d=1;d<=days;d++){const L=by[d]||[];const mine=L.some(i=>i.mine);const isNow=now.getFullYear()===y&&now.getMonth()===m&&Math.abs(now.getDate()-d)<1;
  h+=`<span class="${L.length?'has':''} ${mine?'mine':''} ${isNow?'now':''}">${d}${L.length?`<i>${L.length}</i>`:''}</span>`}
 return h+'</div>'}
function viewCal(){const t=tNow();let h=`<h2>Release calendar</h2><p class="muted" style="font-size:13px;margin-bottom:10px">Studios lock dates about a year ahead; year two only has a few tentpoles so far. ⚠️ = tentpole · gold = yours · tap a studio for its history.</p>`;
 for(let x=t;x<t+24;x++){const its=calItems(x).map(i=>Object.assign(i,{cal:x}));
  h+=`<div class="card"><div class="row"><b>${tLabel(x)}</b><small style="text-align:right">${CAL[x%12].tag}</small></div>${calGrid(x,its)}${its.map(calRow).join('')}${!its.length?'<p class="muted" style="font-size:13px;margin-top:6px">No releases announced yet.</p>':''}</div>`}
 return h}
