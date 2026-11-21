/* ===================== UI ===================== */
let TAB='hq',W=null,TW=null;
function hud(){return `<div class="hud"><div><small>Cash</small><b class="${S.cash<0?'neg':''}">${M(S.cash)}</b></div><div><small>Prestige</small><b>${Math.round(S.rep)} ⭐</b></div><div><small>${S.stock.public?'Share price':'Date'}</small><b>${S.stock.public?'$'+S.stock.price.toFixed(2):MON[S.month]+' '+S.year}</b></div></div>`}
function tabbar(){const t=[['hq','🏛️','Studio'],['slate','🎬','Slate'],['cal','📅','Calendar'],['talent','⭐','Talent'],['empire','👑','Empire'],['money','💵','Money']];
 return `<nav class="tabbar"><div>${t.map(x=>`<button class="${TAB===x[0]?'on':''}" onclick="TAB='${x[0]}';render()"><b>${x[1]}</b>${x[2]}</button>`).join('')}</div></nav>`}
function poster(g,size,tv){size=size||44;const G=tv?{c:'#1a3a4a',icon:TV_GENRES[g].icon}:GEN[g];return `<div class="poster" style="background:linear-gradient(160deg,${G.c},#0d0b10);width:${size}px;height:${size*1.4}px;font-size:${size/2}px">${G.icon}</div>`}
function bar(v,c){return `<div class="bar"><i style="width:${clamp(v,0,100)}%${c?';background:'+c:''}"></i></div>`}
function spark(arr,col){if(!arr||arr.length<2)return'';const mx=Math.max(...arr),mn=Math.min(...arr);const w=300,h=50;const pts=arr.map((v,i)=>`${(i/(arr.length-1)*w).toFixed(1)},${(h-((v-mn)/((mx-mn)||1))*h*.9-2).toFixed(1)}`).join(' ');
 return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:50px;margin-top:6px"><polyline points="${pts}" fill="none" stroke="${col||'#e8b84a'}" stroke-width="2.5" stroke-linejoin="round"/></svg>`}
function render(){if(!S)return title();if(S.over)return gameOver();
 const v={hq:viewHQ,slate:viewSlate,cal:viewCal,talent:viewTalent,empire:viewEmpire,money:viewMoney}[TAB]||viewHQ;
 $('#app').innerHTML=hud()+v()+tabbar();window.scrollTo(0,0)}
function modal(html){$('#modal').innerHTML=html?`<div class="modal" onclick="if(event.target===this)modal()"><div>${html}</div></div>`:''}
function runQueue(){const f=QUEUE.shift();if(f)return f();if(S.over)return render();TAB='hq';render()}

/* ---------- Title ---------- */
function title(){const sv=load();
 $('#app').innerHTML=`<div class="marquee"><div class="lights">★ ★ ★ ★ ★</div><h1 style="margin:14px 0 6px">HOLLYWOOD<br>STUDIO SIMULATOR</h1><p class="muted">Films, TV, streaming, franchises, theme parks and Wall Street. Run a studio from ${START_YEAR} to ${END_YEAR}.</p></div>
 <div class="card"><small>Name your studio</small><input type="text" id="nm" maxlength="28" placeholder="Silver Screen Pictures"></div>
 <button class="btn gold" onclick="newGame(document.getElementById('nm').value.trim());TAB='hq';render()">🎬 Found a new studio</button>
 ${sv&&!sv.over&&sv.v===3?`<button class="btn ghost" onclick="S=load();TAB='hq';render()">Continue ${esc(sv.name)} · ${MON[sv.month]} ${sv.year}</button>`:''}
 <button class="btn ghost" onclick="importSave()">Load a save code</button>
 <div class="card" style="margin-top:16px"><h3 class="gold">What's inside</h3><p class="muted" style="font-size:14px;margin-top:6px">
 🎬 Full productions: script, director, lead + co-star + supporting cast, composer, cinematographer, departments, shooting locations with real tax rebates.<br>
 🌍 Box office in 14 markets, with censorship in China and the Middle East.<br>
 📱 Trailers, social media, critics, fan reactions, Super Bowl ads, press tours.<br>
 🎞️ Sundance, Cannes, Venice & Toronto. Golden Statue (film) and Golden Screen (TV) awards.<br>
 📺 TV series and your own streaming service.<br>
 👑 Franchises, shared universes, merchandise, theme parks, cinema chains, takeovers and an IPO.<br>
 ✊ Real-world shocks: strikes, AI, recessions, pandemics, tariffs, mergers, scandals.</p></div>`}

/* ---------- HQ ---------- */
function viewHQ(){const t=tNow(),c=CAL[S.month];
 const alerts=[];
 if(ev('wga'))alerts.push('✊ Writers strike: no new scripts or TV pitches until '+tLabel(S.ev.wga.until+1));
 if(ev('sag'))alerts.push('✊ Actors strike: filming paused, no press tours until '+tLabel(S.ev.sag.until+1));
 if(S.ev.pandemic&&S.ev.pandemic.until>=t)alerts.push('🦠 Cinemas closed until '+tLabel(S.ev.pandemic.until+1));
 if(ev('recession'))alerts.push('📉 Recession: weaker attendance and spending');
 const tr=ev('trend');if(tr)alerts.push((tr.mult>1?'🔥 ':'🥱 ')+tr.g+(tr.mult>1?' boom':' fatigue'));
 if(ev('gametrend'))alerts.push('🎮 Video-game adaptations are hot');
 if(ev('tariff'))alerts.push('🛃 Tariff: foreign shoots +20%');
 const ren=S.shows.filter(s=>s.renew);ren.forEach(s=>alerts.push(`📺 Decide: renew <b>${esc(s.title)}</b>? (Slate tab)`));
 const fyc=S.month>=8?S.films.filter(f=>yearOf(f.releaseT)===S.year&&f.critic>=72&&!f.fyc&&f.dist!=='sell'):[];
 if(fyc.length)alerts.push(`🏆 ${fyc.length} film${fyc.length>1?'s':''} could run an awards campaign (Slate tab)`);
 const next=S.projects.filter(p=>p.releaseT!=null).sort((a,b)=>a.releaseT-b.releaseT)[0];
 return `<h2 class="ellip">${esc(S.name)}</h2>
 <div class="card"><div class="row"><div><small>${MON[S.month]} ${S.year}</small><div style="margin-top:3px"><b>${c.tag}</b></div></div><div class="center"><small>Market</small><div><b>${c.mult>=1.15?'🔥 Hot':c.mult<=.8?'🧊 Slow':'Normal'}</b></div></div></div>
 ${next?`<p class="muted" style="font-size:13px;margin-top:8px">Next release: <b style="color:var(--text)">${esc(next.title)}</b> · ${tLabel(next.releaseT)}</p>`:''}</div>
 ${alerts.length?`<div class="card" style="border-color:#5a4520">${alerts.map(a=>`<div class="news" style="padding:6px 0">${a}</div>`).join('')}</div>`:''}
 <div class="grid3"><div class="card stat"><small>In production</small><span class="big">${S.projects.length+S.shows.filter(s=>s.status==='prod').length}</span></div><div class="card stat"><small>${S.year} gross</small><span class="big">${M(sum(S.films.filter(f=>yearOf(f.releaseT)===S.year),f=>f.ww))}</span></div><div class="card stat"><small>Awards</small><span class="big">🏆 ${S.awards.film+S.awards.tv+S.awards.fest}</span></div></div>
 <div class="grid2"><button class="btn gold" style="margin-top:0" onclick="startFilm()">🎬 New film</button><button class="btn gold" style="margin-top:0" onclick="startShow()">📺 New series</button></div>
 <button class="btn ghost" onclick="nextMonth()">⏭️ Advance to ${tLabel(t+1)}</button>
 <div class="section"><h3>Trade headlines</h3><small>Year ${S.year-START_YEAR+1} of ${END_YEAR-START_YEAR+1}</small></div>
 <div class="card">${S.news.slice(0,8).map(n=>`<div class="news"><small>${tLabel(n.t)}</small><div>${n.s}</div></div>`).join('')}</div>
 ${S.social.length?`<div class="section"><h3>📱 Trending</h3></div><div class="card">${S.social.slice(0,5).map(p=>`<div class="news"><div class="row"><b style="font-size:13px">@${esc(p.h)}</b><small>${tLabel(p.t)}</small></div><div style="margin-top:2px">${p.s}</div><small>♥ ${p.l.toLocaleString()}</small></div>`).join('')}</div>`:''}
 <button class="btn ghost sm" onclick="settings()">⚙️ Menu</button>`}

/* ---------- Slate ---------- */
function viewSlate(){const t=tNow();
 const proj=S.projects.map(p=>{const ph=phaseOf(p);const prog=clamp((t-p.startT)/p.sch.total,0,1);
  return `<div class="card opt" onclick="projectModal(${p.id})"><div class="film">${poster(p.genre)}<div style="flex:1;min-width:0"><div class="row"><b class="ellip">${esc(p.title)}</b><span class="pill">${p.rating}</span></div><div class="muted" style="font-size:13px;margin-top:2px">${PH[ph]} · ${p.dist==='stream'?'Streaming premiere '+tLabel(p.releaseT):p.dist==='sell'?'Sold to streamer':'Release '+tLabel(p.releaseT)}</div>${bar(prog*100)}<div class="tags">${p.test?`<span class="tag ${p.test>=70?'good':p.test<50?'bad':''}">Test ${p.test}</span>`:''}${p.trailer?`<span class="tag blue">Trailer ${p.trailer.views}M</span>`:''}${p.fest?`<span class="tag hot">${p.fest.k} ${p.fest.score}%</span>`:''}</div></div></div></div>`}).join('');
 const shows=S.shows.filter(s=>s.status!=='ended').map(s=>{const last=s.seasons[s.seasons.length-1];
  return `<div class="card opt" onclick="showModal(${s.id})" ${s.renew?'style="border-color:var(--gold)"':''}><div class="film">${poster(s.genre,44,1)}<div style="flex:1;min-width:0"><div class="row"><b class="ellip">${esc(s.title)}</b><span class="pill">S${s.season}</span></div><div class="muted" style="font-size:13px;margin-top:2px">${s.genre} · ${s.status==='prod'?'In production, out '+tLabel(s.readyT):s.renew?'⚠️ Renew or cancel?':'Aired'}</div>${last?`<div class="tags"><span class="tag">🍅 ${last.critic}%</span><span class="tag">${last.views}M views</span></div>`:''}</div></div></div>`}).join('');
 const fyc=S.month>=8;
 const films=S.films.slice().reverse().slice(0,40).map(f=>`<div class="card opt film" onclick="filmModal(${f.id})">${poster(f.genre)}<div style="flex:1;min-width:0"><div class="row"><b class="ellip">${esc(f.title)}</b><span class="${f.profit>=0?'pos':'neg'}" style="font-weight:800;white-space:nowrap">${f.dist==='stream'?'📺':(f.profit>=0?'+':'')+M(f.profit)}</span></div><div class="muted" style="font-size:13px;margin-top:2px">${tLabel(f.releaseT)} · ${f.genre} · 🍅 ${f.critic}% · ${f.grade}</div><div class="muted" style="font-size:13px">${f.dist==='stream'?f.views+'M views on '+esc(S.streaming?S.streaming.name:'streaming'):f.dist==='sell'?'Licensed for '+M(f.revenue):'Worldwide '+M(f.ww)} ${f.awards.length?'· '+'🏆'.repeat(f.awards.length):''}${fyc&&yearOf(f.releaseT)===S.year&&f.critic>=72&&!f.fyc&&f.dist!=='sell'?' · <b class="gold">FYC?</b>':''}</div></div></div>`).join('');
 const ended=S.shows.filter(s=>s.status==='ended');
 return `<h2>Your slate</h2><div class="grid2"><button class="btn gold" style="margin-top:0" onclick="startFilm()">🎬 New film</button><button class="btn gold" style="margin-top:0" onclick="startShow()">📺 New series</button></div>
 <div class="section"><h3>Films in the works</h3><small>${S.projects.length}</small></div>${proj||'<p class="muted center">None yet.</p>'}
 <div class="section"><h3>TV series</h3><small>${S.shows.length}</small></div>${shows||'<p class="muted center">No series yet.</p>'}
 <div class="section"><h3>Released films</h3><small>${S.films.length}</small></div>${films||'<p class="muted center">Your filmography starts here.</p>'}
 ${ended.length?`<div class="section"><h3>Past series</h3></div><div class="card">${ended.map(s=>`<div class="row news"><span>${TV_GENRES[s.genre].icon} ${esc(s.title)}</span><small>${s.seasons.length} seasons ${s.awards.length?'🏆'.repeat(s.awards.length):''}</small></div>`).join('')}</div>`:''}`}

function projectModal(id){const p=S.projects.find(x=>x.id===id);if(!p)return;const ph=phaseOf(p),t=tNow();
 const cs=castStats(p);const canRe=(ph==='post'||ph==='ready')&&!p.reshot&&!p.acquired&&p.dist!=='sell';const reC=+(p.spend*.08).toFixed(1);
 const canTrailer=!p.trailer&&(ph==='post'||ph==='ready')&&p.dist!=='sell';const canTour=!p.tour&&p.releaseT-t<=2&&p.dist!=='sell'&&!ev('sag');
 modal(`<div class="film">${poster(p.genre,56)}<div><h3>${esc(p.title)}</h3><p class="muted" style="font-size:13px">${p.genre} · ${p.rating} · ${p.type}<br>Dir. ${esc(pname(p.dir))} · ${esc(pname(p.cast.lead))}${p.cast.co?' & '+esc(pname(p.cast.co)):''}</p></div></div>
 <div class="card" style="margin-top:10px">
 ${[['Status',PH[ph]],['Release',p.dist==='stream'?'Streaming · '+tLabel(p.releaseT):p.dist==='sell'?'Sold to streamer':tLabel(p.releaseT)+' · '+(p.dist==='platform'?'Platform':'Wide')+(p.plf?' + IMAX':'')],['Shooting in',LOCS.find(l=>l.k===p.loc).f+' '+p.loc],['Budget / P&A',M(p.spend)+' / '+M(p.mkt)],['Tax rebate due',M(p.rebate)],['Spent so far',M(p.paid)],['Buzz',Math.round(p.hype)+(p.sb?' · Super Bowl ad':'')+(p.tour?' · press tour':'')],
   p.test?['Test screening',p.test+'/100']:null,p.trailer?['Trailer',p.trailer.views+'M views · '+p.trailer.like+'% positive']:null,p.fest?['Festival',p.fest.k+' · '+p.fest.score+'%'+(p.fest.prize?' · 🏆 '+p.fest.prize:'')]:null].filter(Boolean).map(r=>`<div class="row" style="margin-top:6px"><span class="muted">${r[0]}</span><b style="text-align:right">${r[1]}</b></div>`).join('')}</div>
 ${canTrailer?`<button class="btn ghost" onclick="dropTrailer(S.projects.find(x=>x.id===${id}));save();modal();render()">🎞️ Drop the trailer now</button>`:''}
 ${canTour?`<button class="btn ghost" onclick="pressTour(${id})">🎤 Send the cast on a press tour (${M(1.5*I())})</button>`:''}
 ${canRe?`<button class="btn ghost" onclick="reshoot(${id})">🎥 Order reshoots (${M(reC)}, +1 month)</button>`:''}
 ${p.dist!=='sell'?`<button class="btn ghost" onclick="moveDate(${id})">📅 Change release date</button>`:''}
 ${svcLive()&&p.dist!=='stream'&&p.dist!=='sell'?`<button class="btn ghost" onclick="toStream(${id})">📡 Premiere it on ${esc(S.streaming.name)} instead</button>`:''}
 ${p.dist!=='sell'?`<button class="btn ghost" onclick="sellStream(${id})">📺 Sell to a rival streamer for ${M(streamOffer(p))}</button>`:''}
 <button class="btn ghost" onclick="modal()">Close</button>`)}
function pressTour(id){const p=S.projects.find(x=>x.id===id);const c=1.5*I();S.cash-=c;p.paid+=c;p.tour=1;p.hype+=6;addNews(`🎤 The cast of <b>${esc(p.title)}</b> hits the late-night circuit.`);save();modal();render()}
function reshoot(id){const p=S.projects.find(x=>x.id===id);const c=+(p.spend*.08).toFixed(1);S.cash-=c;p.paid+=c;p.reshot=1;p.sch.post++;p.sch.total++;
 if(p.startT+p.sch.total>p.releaseT)p.releaseT=p.startT+p.sch.total;addNews(`🎥 Reshoots ordered on <b>${esc(p.title)}</b>.`);save();modal();render()}
function moveDate(id){const p=S.projects.find(x=>x.id===id);const e=Math.max(tNow()+1,p.startT+p.sch.total);
 modal(`<h3>Move ${esc(p.title)}</h3><p class="muted" style="font-size:13px;margin:4px 0 8px">Moving within 2 months of release wastes 10% of committed marketing.</p>${dateList(p.genre,e,p.releaseT,'setDate('+id+',%T)')}<button class="btn ghost" onclick="modal()">Cancel</button>`)}
function setDate(id,t){const p=S.projects.find(x=>x.id===id);if(p.releaseT-tNow()<=2&&t!==p.releaseT){const w=+(p.mkt*.1).toFixed(1);S.cash-=w;p.paid+=w}p.releaseT=t;addNews(`📅 <b>${esc(p.title)}</b> dated for ${tLabel(t)}.`);save();modal();render()}
function toStream(id){const p=S.projects.find(x=>x.id===id);p.dist='stream';p.releaseT=Math.max(tNow()+1,p.startT+p.sch.total);addNews(`📡 <b>${esc(p.title)}</b> will premiere on ${esc(S.streaming.name)}.`);save();modal();render()}
function sellStream(id){const p=S.projects.find(x=>x.id===id);p.sellFee=streamOffer(p);p.dist='sell';p.releaseT=Math.max(tNow()+1,p.startT+p.sch.total);addNews(`📺 ${esc(S.name)} sells <b>${esc(p.title)}</b> to ${esc(pick([TECH_STREAMER.n].concat(S.rivals.filter(r=>r.alive&&r.svc).map(r=>r.svc))))} for ${M(p.sellFee)}.`);save();modal();render()}
function filmModal(id){const f=S.films.find(x=>x.id===id);if(f)modal(filmReport(f,'modal')+`<button class="btn ghost" onclick="modal()">Close</button>`)}
function fycCampaign(id,amt,ctx){const f=S.films.find(x=>x.id===id);S.cash-=amt;f.fyc=amt;f.costTotal+=amt;f.profit-=amt;addNews(`🏆 ${esc(S.name)} launches a ${M(amt)} awards campaign for <b>${esc(f.title)}</b>.`);save();
 if(ctx==='queue'){$('#fyc').innerHTML='<b>🏆 Campaign launched</b>';const h=$('.hud');if(h)h.outerHTML=hud()}else{modal();render()}}
function showModal(id){const s=S.shows.find(x=>x.id===id);if(!s)return;const last=s.seasons[s.seasons.length-1];
 modal(`<div class="film">${poster(s.genre,56,1)}<div><h3>${esc(s.title)}</h3><p class="muted" style="font-size:13px">${s.genre} · ${s.eps} episodes · ${s.outlet==='own'?esc(S.streaming?S.streaming.name:'Own streamer'):s.outlet==='network'?'Broadcast network':'Rival streamer'}<br>Showrunner ${esc(pname(s.writer))}${s.lead?' · Starring '+esc(pname(s.lead)):''}</p></div></div>
 <div class="card" style="margin-top:10px"><table><tr><th>Season</th><th class="r">Critics</th><th class="r">Views</th><th class="r">Cost</th><th class="r">Fee</th></tr>${s.seasons.map(se=>`<tr><td>S${se.n} · ${tLabel(se.t)}</td><td class="r">${se.critic}%</td><td class="r">${se.views}M</td><td class="r">${M(se.cost)}</td><td class="r">${se.fee?M(se.fee):'—'}</td></tr>`).join('')||'<tr><td colspan=5 class="muted">In production — premieres '+tLabel(s.readyT)+'</td></tr>'}</table></div>
 ${s.renew?`<p class="muted" style="font-size:13px">Renewing costs ~12% more per episode (cast raises). Shows past season 4 risk fatigue.</p><button class="btn gold" onclick="renewShow(${id},true);save();modal();render()">🔁 Renew for season ${s.season+1} (~${M(s.eps*s.epB*1.12)})</button><button class="btn ghost" onclick="renewShow(${id},false);save();modal();render()">✂️ Cancel the show</button>`:''}
 <button class="btn ghost" onclick="modal()">Close</button>`)}

/* ---------- Calendar ---------- */
function dateList(g,from,cur,action){let h='';
 for(let t=from;t<from+14;t++){const m=t%12;const fit=CAL[m].mult*(CAL[m].g[g]||1);const riv=rivalsAt(t);const mine=S.projects.filter(p=>p.releaseT===t&&p.dist!=='stream');const cf=compFactor(t);
  h+=`<div class="card opt ${cur===t?'sel':''}" onclick="${action.replace('%T',t)}"><div class="row"><b>${tLabel(t)}</b><span class="tag ${fit>=1.2?'hot':fit<.85?'bad':''}">${fit>=1.2?'🔥 Great fit':fit<.85?'Weak fit':'OK fit'} ×${fit.toFixed(2)}</span></div><div class="muted" style="font-size:12px;margin-top:3px">${CAL[m].tag}</div>${riv.length||mine.length?`<div class="tags">${riv.map(r=>`<span class="tag ${r.hype>85?'bad':''}">${GEN[r.g].icon} ${esc(r.title)} · ${r.studio.split(' ')[0]}${r.hype>85?' ⚠️':''}</span>`).join('')}${mine.map(p=>`<span class="tag blue">${GEN[p.genre].icon} ${esc(p.title)} (yours)</span>`).join('')}</div>`:''}<div class="muted" style="font-size:12px;margin-top:5px">Competition: ${cf>1.05?'light':cf<.8?'brutal':cf<.92?'crowded':'normal'}</div></div>`}
 return h}
function viewCal(){const t=tNow();let h=`<h2>Release calendar</h2><p class="muted" style="font-size:13px;margin-bottom:10px">Every studio's announced wide releases. ⚠️ = tentpole.</p>`;
 for(let x=t;x<t+12;x++){const riv=rivalsAt(x);const mine=S.projects.filter(p=>p.releaseT===x);
  h+=`<div class="card"><div class="row"><b>${tLabel(x)}</b><small style="text-align:right">${CAL[x%12].tag}</small></div>${mine.map(p=>`<div class="row" style="margin-top:7px"><span>${GEN[p.genre].icon} <b class="gold">${esc(p.title)}</b></span><span class="tag blue">${p.dist==='stream'?'📡 streaming':'yours'}</span></div>`).join('')}${riv.map(r=>`<div class="row" style="margin-top:7px"><span class="ellip">${GEN[r.g].icon} ${esc(r.title)}</span><span class="tag ${r.hype>85?'bad':''}" style="white-space:nowrap">${r.studio.split(' ')[0]}${r.hype>85?' ⚠️':''}</span></div>`).join('')}${!riv.length&&!mine.length?'<p class="muted" style="font-size:13px;margin-top:6px">Wide open.</p>':''}</div>`}
 return h}

/* ---------- Talent ---------- */
let TROLE='actors';
function viewTalent(){const list=S.people[TROLE].slice().sort((a,b)=>(b.star||b.fame)-(a.star||a.fame));const isA=TROLE==='actors';
 return `<h2>Talent agency</h2><div class="seg" style="margin-bottom:10px">${Object.keys(ROLE_LBL).map(k=>`<button class="${TROLE===k?'on':''}" style="min-width:0;font-size:12px" onclick="TROLE='${k}';render()">${ROLE_LBL[k]}</button>`).join('')}</div>
 <p class="muted" style="font-size:12px;margin-bottom:8px">Fees rise with fame. Big names won't sign until your prestige is close to theirs. Tap ✏️ to rename anyone.</p>
 <div class="card"><table><tr><th>Name</th><th class="r">${isA?'Star':'Fame'}</th><th class="r">Craft</th><th class="r">Fee</th><th></th></tr>${list.map(x=>`<tr><td><b>${esc(x.n)}</b>${isA?(x.g==='F'?' ♀':' ♂'):''}<br><small>${GEN[x.spec].icon} ${x.spec} · ${x.age}${busy(x)?' · busy':''}${x.hits?' · '+x.hits+' hits':''}</small></td><td class="r">${isA?x.star:x.fame}</td><td class="r">${x.skill}</td><td class="r">${M(isA?actorFee(x):crewFee(x,TROLE))}</td><td class="r"><button class="btn sm ghost" style="margin:0;padding:6px 8px" onclick="renameT('${x.id}')">✏️</button></td></tr>`).join('')}</table></div>`}
function renameT(id){const x=person(id);modal(`<h3>Rename</h3><input type="text" id="rn" maxlength="30" value="${esc(x.n)}"><button class="btn gold" onclick="const v=document.getElementById('rn').value.trim();if(v){person('${id}').n=v;save()}modal();render()">Save</button><button class="btn ghost" onclick="modal()">Cancel</button>`)}

/* ---------- Empire ---------- */
function viewEmpire(){const sv=S.streaming,t=tNow();
 let h=`<h2>Empire</h2>`;
 // streaming
 h+=`<div class="card"><h3>📡 Streaming</h3>`;
 if(!sv)h+=`<p class="muted" style="font-size:13px;margin:6px 0">Launch your own service. Your films join it after their theatrical window, and originals premiere there. The market leader has ~300M subscribers at ~$20/month.</p><button class="btn gold" ${S.cash+creditLimit()<SVC_COST()?'disabled':''} onclick="svcName()">Launch a service (${M(SVC_COST())})</button>`;
 else if(t<sv.launchT)h+=`<p style="margin-top:6px"><b>${esc(sv.name)}</b> launches ${tLabel(sv.launchT)}. Engineers are building the app.</p>`;
 else h+=`<div class="row" style="margin-top:6px"><b>${esc(sv.name)}</b><span class="big">${fmtN(sv.subs)} subs</span></div>${spark(sv.hist,'#6aa8ff')}
  <div class="row" style="margin-top:6px"><span class="muted">Price</span><span><button class="btn sm ghost" style="margin:0" onclick="S.streaming.price=Math.max(5.99,+(S.streaming.price-1).toFixed(2));save();render()">−</button> <b>$${sv.price.toFixed(2)}</b> <button class="btn sm ghost" style="margin:0" onclick="S.streaming.price=Math.min(29.99,+(S.streaming.price+1).toFixed(2));save();render()">+</button></span></div>
  <div class="row" style="margin-top:6px"><span class="muted">Monthly revenue / profit</span><b>${M(sv.lastRev||0)} / <span class="${(sv.lastNet||0)>=0?'pos':'neg'}">${M(sv.lastNet||0)}</span></b></div>
  <div class="row" style="margin-top:6px"><span class="muted">Library titles</span><b>${S.films.filter(f=>f.lib).length} films · ${S.shows.filter(s=>s.outlet==='own').length} series</b></div>`;
 const svs=[{n:TECH_STREAMER.n,subs:TECH_STREAMER.subs}].concat(S.rivals.filter(r=>r.alive&&r.svc).map(r=>({n:r.svc,subs:r.subs})));if(sv&&t>=sv.launchT)svs.push({n:sv.name,subs:sv.subs,me:1});svs.sort((a,b)=>b.subs-a.subs);
 h+=`<table style="margin-top:8px">${svs.map(s=>`<tr><td>${s.me?'<b class="gold">'+esc(s.n)+'</b>':esc(s.n)}</td><td class="r">${fmtN(s.subs)}</td></tr>`).join('')}</table></div>`;
 // franchises
 h+=`<div class="card"><h3>🌟 Franchises & merchandise</h3>${S.franchises.length?S.franchises.map(fr=>`<div class="news"><div class="row"><b>${GEN[fr.genre].icon} ${esc(fr.name)}</b><small>${fr.parts} film${fr.parts>1?'s':''}${fr.universe?' · 🌌 universe':''}</small></div><small>Fans ${Math.round(fr.fans)} · merch ${M(Math.pow(fr.fans,1.5)*GEN[fr.genre].merch*.02*I())}/mo</small>${bar(fr.fans,'#ff8a5c')}
  ${!fr.universe&&fr.fans>=35?`<button class="btn sm ghost" onclick="joinUniverse('${fr.id}')">🌌 Join shared universe (${M(10*I())})</button>`:''}
  ${S.park&&!S.lands.some(l=>l.fid===fr.id)&&fr.fans>=55?`<button class="btn sm ghost" onclick="if(S.cash+creditLimit()>=LAND_COST()){buildLand('${fr.id}');save();render()}">🏰 Build a park land (${M(LAND_COST())})</button>`:''}</div>`).join(''):'<p class="muted" style="font-size:13px;margin-top:6px">Hits and adaptations become franchises. Sequels, spinoffs and crossovers then show up in the script market, and toys and merchandise earn money every month.</p>'}</div>`;
 // park
 h+=`<div class="card"><h3>🎢 Theme park</h3>${!S.park?`<p class="muted" style="font-size:13px;margin:6px 0">Takes 30 months to build. Earns money from visitors; lands themed on your franchises earn more.</p><button class="btn ghost" ${S.cash+creditLimit()<PARK_COST()*.2?'disabled':''} onclick="buildPark();save();render()">Build a park (${M(PARK_COST())}, paid over 30 months)</button>`:
  `<p style="margin-top:6px"><b>${esc(S.park.name)}</b> · ${t>=S.park.openT?'Open':'Opens '+tLabel(S.park.openT)}</p>${S.lands.map(l=>{const fr=S.franchises.find(f=>f.id===l.fid);return `<div class="muted" style="font-size:13px">🏰 ${esc(fr?fr.name:'?')} land · ${t>=l.openT?'open':'opens '+tLabel(l.openT)}</div>`}).join('')}<p class="muted" style="font-size:13px;margin-top:4px">Last month: ${M((S.log.last||{}).park||0)}</p>`}</div>`;
 // theaters
 h+=`<div class="card"><h3>🎦 Cinema chains</h3><p class="muted" style="font-size:13px;margin:6px 0">Owning screens earns exhibition profit and keeps more of your own films' ticket money.</p>${CHAINS.map((c,i)=>S.theaters.some(x=>x.n===c.n)?`<div class="row news"><span>✅ ${esc(c.n)}</span><small>${c.screens.toLocaleString()} screens</small></div>`:`<button class="btn sm ghost" ${S.cash+creditLimit()<c.price*I()?'disabled':''} onclick="buyChain(${i});save();render()">Buy ${esc(c.n)} · ${c.screens.toLocaleString()} screens · ${M(c.price*I())}</button>`).join('')}</div>`;
 // acquisitions
 h+=`<div class="card"><h3>🤝 Acquisitions</h3>${S.rivals.filter(r=>r.alive).map(r=>`<div class="row news"><span>${esc(r.n)}<br><small>${r.svc?esc(r.svc)+' · '+fmtN(r.subs)+' subs':'No streamer'}</small></span><button class="btn sm ghost" style="margin:0" ${S.cash+creditLimit()<rivalValue(r)*1.3?'disabled':''} onclick="acquire('${esc(r.n)}');save();render()">Buy ${M(rivalValue(r)*1.3)}</button></div>`).join('')+'<p class="muted" style="font-size:12px;margin-top:6px">Regulators block deals that would give you 35%+ of the domestic box office combined.</p>'||'<p class="muted">No rivals left. You own Hollywood.</p>'}${S.rivals.some(r=>r.ownedByMe)?`<p class="muted" style="font-size:12px;margin-top:6px">Owned: ${S.rivals.filter(r=>r.ownedByMe).map(r=>esc(r.n)).join(', ')}</p>`:''}</div>`;
 // stock
 const V=valuation();
 h+=`<div class="card"><h3>🔔 Wall Street</h3>${!S.stock.public?`<p class="muted" style="font-size:13px;margin:6px 0">Estimated valuation: <b style="color:var(--text)">${M(V)}</b>. An IPO sells 25% of the company for cash. After that, shareholders expect growth every quarter, and if the share price crashes for a year, the board can fire you.</p><button class="btn gold" ${S.rep<35||S.films.length<5?'disabled':''} onclick="ipo();save();render()">Go public (raise ~${M(V*.25*.93)})</button>${S.rep<35||S.films.length<5?'<p class="muted" style="font-size:12px;margin-top:4px">Needs 35+ prestige and 5+ released films.</p>':''}`:
  `<div class="row" style="margin-top:6px"><span class="muted">Share price</span><span class="big ${S.stock.price>=S.stock.ipo?'pos':'neg'}">$${S.stock.price.toFixed(2)}</span></div><small>IPO $${S.stock.ipo.toFixed(2)} · market cap ${M(S.stock.price*100)}</small>${spark(S.stock.hist,S.stock.price>=S.stock.ipo?'#3dd68c':'#ff5d62')}<button class="btn sm ghost" onclick="raiseCapital();save();render()">Sell 10% more shares (~${M(V*.1*.95)})</button>`}</div>`;
 return h}
function svcName(){modal(`<h3>Name your streaming service</h3><input type="text" id="sn" maxlength="20" value="${esc(S.name.split(' ')[0])}+"><p class="muted" style="font-size:13px;margin-top:6px">Costs ${M(SVC_COST())} to build. Goes live in 6 months.</p><button class="btn gold" onclick="launchService(document.getElementById('sn').value.trim());save();modal();render()">Launch</button><button class="btn ghost" onclick="modal()">Cancel</button>`)}

/* ---------- Money ---------- */
function viewMoney(){const t=tNow();const rec=sum(S.receivables.filter(r=>r.t>t),r=>r.amt);const lim=creditLimit();const L=S.log.last||{};
 const yrs={};S.films.forEach(f=>{const y=yearOf(f.releaseT);yrs[y]=yrs[y]||{n:0,ww:0,p:0};yrs[y].n++;yrs[y].ww+=f.ww;yrs[y].p+=f.profit});
 const ms=S.market[S.year-1];
 return `<h2>Money</h2>
 <div class="grid2"><div class="card stat"><small>Cash</small><span class="big ${S.cash<0?'neg':''}">${M(S.cash)}</span></div><div class="card stat"><small>Credit line</small><span class="big">${M(lim)}</span></div><div class="card stat"><small>Money coming in</small><span class="big pos">${M(rec)}</span></div><div class="card stat"><small>Overhead / month</small><span class="big">${M(overhead())}</span></div></div>
 <div class="card"><h3>Last month by business</h3>${[['📡 Streaming',L.stream],['🧸 Merchandise',L.merch],['🎢 Theme park',L.park],['🎦 Cinemas',L.theaters]].map(r=>`<div class="row" style="margin-top:6px"><span class="muted">${r[0]}</span><b class="${(r[1]||0)>=0?'':'neg'}">${M(r[1]||0)}</b></div>`).join('')}
 ${S.log.cf&&S.log.cf.length>1?`<small style="display:block;margin-top:10px">Monthly cash flow</small>${spark(S.log.cf)}`:''}</div>
 <div class="card"><p class="muted" style="font-size:13px">Cash can go negative up to your credit line (0.8% interest a month). Below <b class="neg">−${M(lim)}</b>, the bank takes the studio. Ticket money arrives the month after release. Home and digital money arrives after the theatrical window. Tax rebates are paid when production finishes.</p></div>
 ${ms?`<div class="card"><h3>${S.year-1} domestic market share</h3><table>${ms.map((r,i)=>`<tr><td>${i+1}. ${r.me?'<b class="gold">'+esc(r.n)+'</b>':esc(r.n)}</td><td class="r">${M(r.dom)}</td><td class="r">${pct(r.share)}</td></tr>`).join('')}</table></div>`:''}
 <div class="card"><h3>Films by year</h3><table><tr><th>Year</th><th class="r">Films</th><th class="r">Gross</th><th class="r">Profit</th></tr>${Object.keys(yrs).map(y=>`<tr><td>${y}</td><td class="r">${yrs[y].n}</td><td class="r">${M(yrs[y].ww)}</td><td class="r ${yrs[y].p>=0?'pos':'neg'}">${M(yrs[y].p)}</td></tr>`).join('')||'<tr><td colspan=4 class="muted">No releases yet</td></tr>'}</table></div>`}

/* ---------- Film wizard ---------- */
function startFilm(){
 if(ev('wga'))return modal(`<h3>✊ Writers are on strike</h3><p class="muted" style="margin-top:6px">No scripts can be bought or written until ${tLabel(S.ev.wga.until+1)}. You can still buy finished films at Sundance in January.</p><button class="btn ghost" onclick="modal()">OK</button>`);
 const pool=(k,n)=>shuffle(S.people[k].filter(x=>!busy(x))).slice(0,n);
 W={step:0,sc:scripts(),dirs:pool('directors',5).sort((a,b)=>b.fame-a.fame),acts:pool('actors',10).sort((a,b)=>b.star-a.star),comps:pool('composers',4),dps:pool('dps',4),wrs:pool('writers',4),
  script:null,dir:null,lead:null,co:null,sup:[],role:'lead',backend:false,comp:null,dp:null,rewriter:null,rating:null,prod:null,mkt:null,depts:null,loc:'Atlanta',days:null,dist:'wide',plf:false,cofi:false,releaseT:null};
 wiz()}
const STEPS=['Idea','Director','Cast','Crew','Production','Release'];
function committed(){return sum(S.projects,p=>(p.spend-p.prodPaid)*(1-(p.cofi||0))+(p.dist==='wide'||p.dist==='platform'?p.mkt*(1-(p.cofi||0)):0))+sum(S.shows.filter(s=>s.status==='prod'),s=>s.eps*s.epB-s.spent)+(S.park?S.park.cost-S.park.paid:0)}
function myCost(){if(!W.prod)return wizFees(W);return wizFees(W)+(prodSpend(W)+(W.dist==='stream'?0:W.mkt))*(W.cofi?.6:1)}
function cfoWarn(){const need=committed()+myCost(),have=S.cash+creditLimit();return need>have?'⚠️ CFO: commitments ('+M(need)+') exceed cash + credit. One flop could sink the studio.':need>have*.75?'CFO: this stretches the balance sheet thin.':''}
function personCard(x,sel,onclick,isA,locked,extra){const fee=isA?actorFee(x):crewFee(x,W._role);
 return `<div class="card opt ${sel?'sel':''} ${locked?'locked':''}" onclick="${locked?'':onclick}"><div class="row"><b>${isA?'⭐':'🎬'} ${esc(x.n)}${isA?(x.g==='F'?' ♀':' ♂'):''}</b><span class="muted">${M(fee)}</span></div><div class="grid2" style="margin-top:7px"><div><small>${isA?'Star power':'Fame'} ${isA?x.star:x.fame}</small>${bar(isA?x.star:x.fame,isA?'#ff8a5c':'#b07cff')}</div><div><small>Craft ${x.skill}</small>${bar(x.skill)}</div></div><div class="tags"><span class="tag ${W.script&&x.spec===W.script.genre?'good':''}">${GEN[x.spec].icon} ${x.spec}</span><span class="tag">Age ${x.age}</span>${x.hits?`<span class="tag good">${x.hits} hits</span>`:''}${extra||''}${locked&&!extra?'<span class="tag bad">🔒 Wants a bigger studio</span>':''}</div></div>`}
function wiz(){const back=`<button class="btn ghost" onclick="${W.step?'W.step--;wiz()':'render()'}">← ${W.step?'Back':'Cancel'}</button>`;
 let h=hud()+`<div class="steps">${STEPS.map((s,i)=>`<i class="${i<=W.step?'on':''}"></i>`).join('')}</div><small>Step ${W.step+1} of 6 · ${STEPS[W.step]}</small>`;
 const g=W.script?W.script.genre:null;
 if(W.step===0){
  h+=`<h2>Buy a script</h2>`+(W.sc.length?W.sc.map((s,i)=>`<div class="card opt ${W.script===s?'sel':''}" onclick="W.script=W.sc[${i}];wiz()"><div class="row"><b>${GEN[s.genre].icon} ${esc(s.title)}</b><span class="muted">${s._draft?'<span class="pos">✔ Owned</span>':M(s.cost)}</span></div><div class="muted" style="font-size:13px;margin-top:5px">Coverage ${(s.q/10).toFixed(1)}/10 · by ${esc(pname(s.writer))}</div>${bar(s.q)}${covNote(s)}<div class="tags"><span class="tag">${s.genre}</span><span class="tag ${s.hype>=10?'good':''}">${s.type}</span>${s.hype?`<span class="tag good">+${Math.round(s.hype)} awareness</span>`:''}${s.fr>=.5?'<span class="tag hot">Franchise potential</span>':''}</div></div>`).join(''):'<p class="muted card">No scripts on the market this month.</p>');
  h+=`<button class="btn gold" ${W.script?'':'disabled'} onclick="W.step=1;wiz()">Next →</button>`+back;
 }else if(W.step===1){W._role='directors';
  h+=`<h2>Hire a director</h2>`+W.dirs.map((d,i)=>personCard(d,W.dir===d.id,`W.dir='${d.id}';wiz()`,false,lockC(d))).join('');
  h+=`<button class="btn gold" ${W.dir?'':'disabled'} onclick="W.step=2;wiz()">Next →</button>`+back;
 }else if(W.step===2){
  const role=W.role;const roleBtn=(r,l)=>`<button class="${role===r?'on':''}" onclick="W.role='${r}';wiz()">${l}<br><small>${r==='sup'?(W.sup.length?W.sup.map(id=>esc(pname(id).split(' ')[0])).join(', '):'none'):W[r]?esc(pname(W[r]).split(' ')[0]):r==='lead'?'required':'optional'}</small></button>`;
  h+=`<h2>Cast the film</h2><div class="seg">${roleBtn('lead','Lead')}${roleBtn('co','Co-star')}${roleBtn('sup','Supporting')}</div><p class="muted" style="font-size:12px;margin:8px 0">${role==='sup'?'Pick up to 2 supporting actors (tap again to remove).':'Tap an actor to cast them in this role.'} Lead + co-star chemistry is revealed at the table read.</p>`;
  h+=W.acts.map(a=>{const inRole=role==='sup'?W.sup.includes(a.id):W[role]===a.id;const elsewhere=(W.lead===a.id||W.co===a.id||W.sup.includes(a.id))&&!inRole;
   return personCard(a,inRole,`castPick('${a.id}')`,true,lockA(a)||elsewhere,elsewhere?'<span class="tag blue">Already cast</span>':'')}).join('');
  if(W.lead)h+=`<div class="card"><small>Lead's deal</small><div class="seg"><button class="${!W.backend?'on':''}" onclick="W.backend=false;wiz()">Full fee</button><button class="${W.backend?'on':''}" onclick="W.backend=true;wiz()">40% fee + 5% of gross</button></div></div>`;
  h+=`<button class="btn gold" ${W.lead?'':'disabled'} onclick="W.step=3;wiz()">Next →</button>`+back;
 }else if(W.step===3){
  const opt=(arr,key,role,lbl)=>{W._role=role;return `<h3 style="margin-top:12px">${lbl}</h3><div class="card opt ${!W[key]?'sel':''}" onclick="W.${key}=null;wiz()"><b>House ${key==='rewriter'?'(no rewrite)':'crew'}</b><span class="muted" style="font-size:13px"> · ${key==='rewriter'?'keep the script as is':'craft 55, no fee'}</span></div>`+arr.map(x=>personCard(x,W[key]===x.id,`W.${key}='${x.id}';wiz()`,false,lockC(x))).join('')};
  h+=`<h2>Crew up</h2><p class="muted" style="font-size:13px">A great cinematographer and composer lift the film and can win craft awards.</p>`+opt(W.dps,'dp','dps','🎥 Cinematographer')+opt(W.comps,'comp','composers','🎼 Composer')+opt(W.wrs,'rewriter','writers','✍️ Script doctor (rewrite)');
  h+=`<button class="btn gold" onclick="W.step=4;wiz()">Next →</button>`+back;
 }else if(W.step===4){
  const ib=Math.round(GEN[g].budget*I());if(!W.rating)W.rating=GEN[g].rating;if(!W.depts)W.depts={sets:Math.round(NEEDS[g].sets*100),vfx:Math.round(NEEDS[g].vfx*100),stunts:Math.round(NEEDS[g].stunts*100),music:Math.round(NEEDS[g].music*100)};if(W.days==null)W.days=GEN[g].days;
  if(W.prod==null){const room=S.cash+creditLimit()-committed()-wizFees(W);W.prod=Math.max(3,Math.min(ib,Math.floor(room/1.7)))}
  const ds=deptScore(g,W.depts);const sch=schedule(g,W.prod,W.days);const loc=LOCS.find(l=>l.k===W.loc);
  h+=`<h2>Production plan</h2>
  <div class="card"><small>Target rating</small><div class="seg">${RATINGS.map(r=>`<button class="${W.rating===r?'on':''}" onclick="W.rating='${r}';wiz()">${r}</button>`).join('')}</div><p class="muted" style="font-size:12px;margin-top:6px">Audience reach for ${g} at ${W.rating}: <b style="color:var(--text)">${pct(ratingMult(g,W.rating))}</b>${W.rating==='R'?'. R cuts China approval odds and some Middle East markets.':''}</p></div>
  <div class="card"><div class="row"><small>Production budget</small><b id="pv">${M(W.prod)}</b></div><input type="range" min="2" max="${Math.round(350*I())}" value="${W.prod}" oninput="W.prod=+this.value;wizLive()"><p class="muted" style="font-size:12px">Typical ${g}: ${M(ib)}.</p></div>
  <div class="card"><div class="row"><small>Where the money goes</small><span class="tag ${ds>=.85?'good':ds<.65?'bad':''}">Fit ${Math.round(ds*100)}%</span></div>${DEPTS.map(d=>`<div class="row" style="margin-top:8px"><span style="font-size:14px">${d[2]} ${d[1]}</span><b id="d_${d[0]}">${M(W.prod*W.depts[d[0]]/(sum(DEPTS,x=>W.depts[x[0]])||1))}</b></div><input type="range" min="0" max="100" value="${W.depts[d[0]]}" onchange="W.depts.${d[0]}=+this.value;wiz()" oninput="W.depts.${d[0]}=+this.value;wizLive()">`).join('')}<p class="muted" style="font-size:12px">${g} films usually need: ${DEPTS.filter(d=>NEEDS[g][d[0]]>=.25).map(d=>d[1].toLowerCase()).join(' & ')}.</p></div>
  <div class="card"><small>Shooting location</small>${LOCS.map(l=>`<div class="opt ${W.loc===l.k?'sel':''}" style="padding:9px;border-radius:10px;border:1px solid var(--line);margin-top:6px" onclick="W.loc='${l.k}';wiz()"><div class="row"><b>${l.f} ${l.k}</b><span class="tag good">${Math.round((l.rebate+(!l.foreign?S.ev.usRebate:0))*100)}% rebate</span></div><small style="text-transform:none;letter-spacing:0">${l.note}${(l.look||{})[g]?' · great look for '+g:''}${l.foreign&&ev('tariff')?' · ⚠️ tariff +20%':''}${l.cost>1.05?' · pricier crews':l.cost<.95?' · cheaper crews':''}</small></div>`).join('')}</div>
  ${GEN[g].days?`<div class="card"><div class="row"><small>Shooting days</small><b id="dv">${W.days} days</b></div><input type="range" min="15" max="180" value="${W.days}" oninput="W.days=+this.value;wizLive()"><p class="muted" style="font-size:12px">Typical: ${GEN[g].days} days. Rushing hurts quality; extra days cost more.</p></div>`:''}
  <div class="card"><div class="row"><span class="muted">Production spend</span><b id="sp">${M(prodSpend(W))}</b></div><div class="row" style="margin-top:5px"><span class="muted">Tax rebate (paid at wrap)</span><b class="pos" id="rb">${M(rebateOf(W))}</b></div><div class="row" style="margin-top:5px"><span class="muted">Schedule</span><b id="sv">${sch.total} months</b></div></div>
  <button class="btn gold" onclick="W.step=5;wiz()">Next →</button>`+back;
 }else{
  const sch=schedule(g,W.prod,W.days);const earliest=tNow()+sch.total;if(W.releaseT!=null&&W.releaseT<earliest)W.releaseT=null;
  if(W.mkt==null)W.mkt=Math.max(3,Math.round(W.prod*.6));
  const svcOK=S.streaming&&S.streaming.launchT<=earliest;
  h+=`<h2>Release plan</h2>
  <div class="card"><small>Distribution</small><div class="seg"><button class="${W.dist==='wide'?'on':''}" onclick="W.dist='wide';wiz()">Wide</button><button class="${W.dist==='platform'?'on':''}" onclick="W.dist='platform';wiz()">Platform</button>${svcOK?`<button class="${W.dist==='stream'?'on':''}" onclick="W.dist='stream';wiz()">📡 ${esc(S.streaming.name)}</button>`:''}</div><p class="muted" style="font-size:12px;margin-top:6px">${W.dist==='wide'?'3,000+ screens; lives or dies on opening weekend.':W.dist==='platform'?'Opens in a few cities and expands on word of mouth. Awards strategy; needs 80%+ reviews.':'Skips cinemas and premieres on your service to grow subscribers. No box office, no P&A.'}</p></div>
  ${W.dist!=='stream'?`<div class="card"><div class="row"><small>Marketing (P&amp;A)</small><b id="mv">${M(W.mkt)}</b></div><input type="range" min="1" max="${Math.round(250*I())}" value="${W.mkt}" oninput="W.mkt=+this.value;wizLive()"><p class="muted" style="font-size:12px">Usually 50–100% of the budget. A wide release needs $25M+.</p>
   <div class="row" style="margin-top:8px"><span style="font-size:14px">🎦 IMAX / premium formats push (${M(2*I())})</span><button class="btn sm ${W.plf?'gold':'ghost'}" style="margin:0" onclick="W.plf=!W.plf;wiz()">${W.plf?'On':'Off'}</button></div></div>`:''}
  <div class="card"><small>Financing</small><div class="seg"><button class="${!W.cofi?'on':''}" onclick="W.cofi=false;wiz()">Self-finance</button><button class="${W.cofi?'on':''}" onclick="W.cofi=true;wiz()">Co-finance 40%</button></div><p class="muted" style="font-size:12px;margin-top:6px">A partner pays 40% of costs and takes 40% of revenue.</p></div>
  <div class="card"><div class="row"><span class="muted">Script, cast & crew (now)</span><span>${M(wizFees(W))}</span></div><div class="row" style="margin-top:5px"><b>Your all-in cost</b><b id="tv">${M(myCost())}</b></div><div class="row" style="margin-top:5px"><span class="muted">Already committed elsewhere</span><span>${M(committed())}</span></div><p id="warn" class="neg" style="font-size:12px;margin-top:6px">${cfoWarn()}</p></div>
  <h3 style="margin:12px 0 6px">Release date</h3><p class="muted" style="font-size:13px;margin-bottom:6px">Earliest: ${tLabel(earliest)} (${sch.total} months).</p>${dateList(g,earliest,W.releaseT,'W.releaseT=%T;wiz()')}
  <button class="btn gold" ${W.releaseT!=null&&wizFees(W)<=S.cash+creditLimit()?'':'disabled'} onclick="greenlight()">🟢 GREENLIGHT (pay ${M(wizFees(W))} now)</button>`+back;
 }
 const y=window.scrollY;$('#app').innerHTML=h;if(W._last===W.step)window.scrollTo(0,y);else window.scrollTo(0,0);W._last=W.step}
function castPick(id){const r=W.role;if(r==='sup'){if(W.sup.includes(id))W.sup=W.sup.filter(x=>x!==id);else if(W.sup.length<2)W.sup.push(id)}else W[r]=W[r]===id?null:id;wiz()}
function wizLive(){const set=(id,v)=>{const e=$('#'+id);if(e)e.textContent=v};
 if(W.step===4){set('pv',M(W.prod));DEPTS.forEach(d=>set('d_'+d[0],M(W.prod*W.depts[d[0]]/(sum(DEPTS,x=>W.depts[x[0]])||1))));set('sp',M(prodSpend(W)));set('rb',M(rebateOf(W)));set('sv',schedule(W.script.genre,W.prod,W.days).total+' months');set('dv',W.days+' days')}
 if(W.step===5){set('mv',M(W.mkt));set('tv',M(myCost()));set('warn',cfoWarn())}}
function greenlight(){
 const p=buildProject(W);S.cash-=p.fees;
 const t=tNow();[W.lead,W.co].concat(W.sup).filter(Boolean).forEach(id=>{const a=person(id);a.busy=t+p.sch.pre+p.sch.shoot});
 const d=person(W.dir);d.busy=t+p.sch.total;[W.comp,W.dp,W.rewriter].filter(Boolean).forEach(id=>person(id).busy=t+p.sch.total);
 S.scripts=S.scripts.filter(x=>x!==W.script);S.projects.push(p);
 S.receivables.push({t:t+p.sch.total,amt:p.rebate*(1-p.cofi),label:p.title+' tax rebate'});
 addNews(`🟢 ${esc(S.name)} greenlights <b>${esc(p.title)}</b> (${p.genre}, ${M(p.spend)}, shooting in ${p.loc}) — ${esc(pname(p.dir))} directing ${esc(pname(p.cast.lead))}${p.cast.co?' and '+esc(pname(p.cast.co)):''}.`);
 save();TAB='slate';render()}

/* ---------- TV wizard ---------- */
function startShow(){
 if(ev('wga'))return modal(`<h3>✊ Writers are on strike</h3><p class="muted" style="margin-top:6px">No new series can be developed until ${tLabel(S.ev.wga.until+1)}.</p><button class="btn ghost" onclick="modal()">OK</button>`);
 TW={step:0,pitch:null,writer:null,lead:null,eps:8,epB:null,outlet:svcLive()||S.streaming?'own':'network',acts:shuffle(S.people.actors.filter(a=>!busy(a))).slice(0,8).sort((a,b)=>b.star-a.star),wrs:shuffle(S.people.writers.filter(w=>!busy(w))).slice(0,4)};tvWiz()}
function tvWiz(){const back=`<button class="btn ghost" onclick="${TW.step?'TW.step--;tvWiz()':'render()'}">← ${TW.step?'Back':'Cancel'}</button>`;
 let h=hud()+`<div class="steps">${[0,1,2].map(i=>`<i class="${i<=TW.step?'on':''}"></i>`).join('')}</div>`;
 if(TW.step===0){const ps=pitches();h+=`<h2>Choose a pitch</h2>`+(ps.length?ps.map((p,i)=>`<div class="card opt ${TW.pitch===p?'sel':''}" onclick="TW.pitch=S.pitches[${i}];TW.writer=TW.pitch.writer;tvWiz()"><div class="row"><b>${TV_GENRES[p.genre].icon} ${esc(p.title)}</b><span class="muted">${M(p.cost)}</span></div><div class="muted" style="font-size:13px;margin-top:4px">${p.genre} · pitched by ${esc(pname(p.writer))} · ${(p.q/10).toFixed(1)}/10</div>${bar(p.q)}</div>`).join(''):'<p class="card muted">No pitches this month.</p>');
  h+=`<button class="btn gold" ${TW.pitch?'':'disabled'} onclick="TW.step=1;tvWiz()">Next →</button>`+back}
 else if(TW.step===1){W={script:{genre:'Drama'},_role:'writers'};
  const pw=person(TW.pitch.writer);const ws=[pw].concat(TW.wrs.filter(w=>w.id!==pw.id));
  h+=`<h2>Showrunner & star</h2><h3 style="margin:8px 0">✍️ Showrunner</h3>`+ws.map(w=>personCard(w,TW.writer===w.id,`TW.writer='${w.id}';tvWiz()`,false,lockC(w))).join('');
  h+=`<h3 style="margin:12px 0 8px">⭐ Lead actor</h3>`+TW.acts.map(a=>personCard(a,TW.lead===a.id,`TW.lead=TW.lead==='${a.id}'?null:'${a.id}';tvWiz()`,true,lockA(a))).join('');
  h+=`<button class="btn gold" ${TW.writer?'':'disabled'} onclick="TW.step=2;tvWiz()">Next →</button>`+back}
 else{const g=TW.pitch.genre;const ideal=tvEpIdeal(g);if(TW.epB==null)TW.epB=+ideal.toFixed(1);const cost=TW.eps*TW.epB;
  h+=`<h2>Season plan</h2><div class="card"><small>Episodes</small><div class="seg">${[6,8,10,13].map(n=>`<button class="${TW.eps===n?'on':''}" onclick="TW.eps=${n};tvWiz()">${n}</button>`).join('')}</div></div>
  <div class="card"><div class="row"><small>Budget per episode</small><b id="eb">${M(TW.epB)}</b></div><input type="range" min="0.5" max="${Math.round(30*I())}" step="0.5" value="${TW.epB}" oninput="TW.epB=+this.value;document.getElementById('eb').textContent=M(TW.epB);document.getElementById('tc').textContent=M(TW.eps*TW.epB)"><p class="muted" style="font-size:12px">Typical ${g}: ${M(ideal)} per episode. Prestige dramas can cost $15M+ per episode.</p></div>
  <div class="card"><small>Where it airs</small><div class="seg">${S.streaming?`<button class="${TW.outlet==='own'?'on':''}" onclick="TW.outlet='own';tvWiz()">📡 ${esc(S.streaming.name)}</button>`:''}<button class="${TW.outlet==='network'?'on':''}" onclick="TW.outlet='network';tvWiz()">Broadcast network</button><button class="${TW.outlet==='rival'?'on':''}" onclick="TW.outlet='rival';tvWiz()">Rival streamer</button></div><p class="muted" style="font-size:12px;margin-top:6px">${TW.outlet==='own'?'Grows your subscribers; no licence fee.':'They pay a licence fee (usually cost-plus) when each season is delivered.'}</p></div>
  <div class="card"><div class="row"><b>Season cost</b><b id="tc">${M(cost)}</b></div><small>Paid during production (${3+Math.ceil(TW.eps/4)} months)</small></div>
  <button class="btn gold" onclick="greenlightShow(TW);save();TAB='slate';render()">🟢 ORDER THE SERIES</button>`+back}
 $('#app').innerHTML=h;window.scrollTo(0,0)}

/* ---------- Reports & screens ---------- */
function filmReport(f,ctx){const t=tNow();
 const canFyc=!f.fyc&&f.dist!=='sell'&&f.critic>=72&&yearOf(f.releaseT)===S.year&&S.month>=8;
 let h=`<div class="film">${poster(f.genre,56)}<div style="flex:1"><h3>${esc(f.title)}</h3><p class="muted" style="font-size:13px">${f.genre} · ${f.rating} · ${tLabel(f.releaseT)} · ${f.dist==='stream'?'Streaming':f.dist==='sell'?'Sold to streamer':f.dist==='platform'?'Platform':(f.screens||0).toLocaleString()+' screens'}<br>Dir. ${esc(pname(f.dir))} · ${esc(pname(f.cast.lead))}${f.cast.co?' & '+esc(pname(f.cast.co)):''}</p></div><div class="center"><div class="grade gold">${f.grade}</div><small>Audience</small></div></div>
 <div class="card" style="margin-top:10px"><div class="row"><small>Critics</small><span class="big" style="color:${f.critic>=60?'var(--green)':'var(--red)'}">🍅 ${f.critic}%</span></div>${(f.reviews||[]).map(r=>`<div class="news" style="padding:6px 0"><div class="row"><b style="font-size:13px">${r.o}</b><small>${r.s}/100</small></div><i class="muted">"${r.q}"</i></div>`).join('')}</div>`;
 if(f.awards.length||f.noms.length)h+=`<div class="card"><small>Awards</small>${f.noms.map(n=>`<div style="margin-top:4px">${f.awards.includes(n)?'🏆 <b>'+n+'</b>':'Nominated: '+n}</div>`).join('')}</div>`;
 if(f.dist==='stream')return h+`<div class="card"><div class="row"><span>Views in first month</span><b>${f.views}M</b></div><div class="row" style="margin-top:6px"><span class="muted">Total cost</span><span>${M(f.costTotal)}</span></div><p class="muted" style="font-size:13px;margin-top:6px">Its value shows up as subscriber growth on ${esc(S.streaming?S.streaming.name:'your service')}.</p></div>`;
 if(f.dist==='sell')return h+`<div class="card"><div class="row"><span>Licence fee</span><b>${M(f.revenue)}</b></div><div class="row" style="margin-top:6px"><span class="muted">Cost</span><span>−${M(f.costTotal)}</span></div><div class="row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line)"><b>Profit</b><b class="${f.profit>=0?'pos':'neg'}">${M(f.profit)}</b></div></div>`;
 const mx=Math.max(...f.weeks,.01);
 h+=`<div class="grid2"><div class="card stat"><small>${f.dist==='platform'?'Limited opening':'Opening weekend'}</small><span class="big">${M(f.opening)}</span></div><div class="card stat"><small>Worldwide</small><span class="big">${M(f.ww)}</span></div><div class="card stat"><small>Domestic</small><span class="big">${M(f.dom)}</span></div><div class="card stat"><small>International</small><span class="big">${M(f.intl)}</span></div></div>
 <div class="card"><small>Weekly domestic gross</small><div class="chart">${f.weeks.slice(0,12).map((w,i)=>`<div style="height:${w/mx*100}%;animation-delay:${i*.05}s"><span>W${i+1}</span></div>`).join('')}</div><div style="height:16px"></div></div>
 <div class="card"><small>World box office</small><table style="margin-top:4px">${f.countries.slice(0,9).map(c=>`<tr><td>${c.f} ${c.k}</td><td class="r">${c.ban?'<span class="neg">Not released</span>':M(c.g)}</td></tr>`).join('')}${f.countries.filter(c=>c.ban).slice(0,2).filter(c=>f.countries.indexOf(c)>=9).map(c=>`<tr><td>${c.f} ${c.k}</td><td class="r neg">Not released</td></tr>`).join('')}</table></div>
 <div class="card">${[['Domestic rentals (62% → 45% by week)',f.domRent],['Overseas rentals (~40%; China 25%)',f.intlRent],['Home, PVOD & TV licensing',f.ancillary],['Tax rebate',f.rebate]].map(r=>`<div class="row muted" style="font-size:13px;margin-top:4px"><span>${r[0]}</span><span>${M(r[1])}</span></div>`).join('')}
 ${f.backendPay?`<div class="row muted" style="font-size:13px;margin-top:4px"><span>Star's back-end (5%)</span><span>−${M(f.backendPay)}</span></div>`:''}${f.partner?`<div class="row muted" style="font-size:13px;margin-top:4px"><span>Co-financier's 40%</span><span>−${M(f.partner)}</span></div>`:''}
 <div class="row muted" style="font-size:13px;margin-top:4px"><span>Your costs</span><span>−${M(f.costTotal)}</span></div>
 <div class="row" style="margin-top:9px;padding-top:9px;border-top:1px solid var(--line)"><b>Ultimate profit</b><b class="big ${f.profit>=0?'pos':'neg'}">${f.profit>=0?'+':''}${M(f.profit)}</b></div>${f.lib?`<small style="display:block;margin-top:6px">Joins ${esc(S.streaming.name)} after its theatrical window.</small>`:''}</div>`;
 if(canFyc)h+=`<div class="card" id="fyc" style="border-color:var(--gold)"><b>🏆 For Your Consideration</b><p class="muted" style="font-size:13px;margin:4px 0">Screeners, trade ads, Q&amp;As before March's Golden Statues.</p>${[5,15,30].map(a=>`<button class="btn sm ${a===30?'gold':'ghost'}" onclick="fycCampaign(${f.id},${Math.round(a*I())},'${ctx}')">${M(a*I())}</button>`).join('')}</div>`;
 return h}
function releaseScreen(f){$('#app').innerHTML=hud()+`<div class="center" style="padding:6px 0"><div class="lights">★ NOW PLAYING ★</div><h2 style="font-size:32px;margin-top:4px">${verdict(f)}</h2></div>`+filmReport(f,'queue')+
 `<div class="card"><small>📱 Social reaction</small>${S.social.filter(p=>p.s.includes(esc(f.title))).slice(0,3).map(p=>`<div class="news"><b style="font-size:13px">@${esc(p.h)}</b><div>${p.s}</div><small>♥ ${p.l.toLocaleString()}</small></div>`).join('')}</div><button class="btn gold" onclick="runQueue()">Continue →</button>`;save();window.scrollTo(0,0)}
function awardsScreen(top,head,count,res,tip){let h=hud()+`<div class="marquee"><div class="lights">★ ${top} ★</div><h2 style="margin-top:8px">${head}</h2></div>`;const wins=res.filter(r=>r.win);
 if(!count)h+=`<div class="card center"><p class="muted">Nothing of yours was eligible this year.</p></div>`;
 else if(!res.length)h+=`<div class="card center"><div style="font-size:38px">🥀</div><p class="muted" style="margin-top:6px">No nominations. ${tip}</p></div>`;
 else{if(wins.length)h+=`<div class="trophy">🏆</div><p class="center" style="margin-bottom:12px"><b>${wins.length} win${wins.length>1?'s':''}!</b></p>`;
  h+=res.map(r=>`<div class="card"><small>${r.cat}</small><div class="row" style="margin-top:4px"><b>${esc(r.film.title)}</b><span style="font-weight:800;color:${r.win?'var(--gold)':'var(--muted)'}">${r.win?'🏆 WON':'Nominated'}</span></div>${!r.win?`<small style="text-transform:none">Winner: ${esc(r.rival)} (rival studio)</small>`:''}</div>`).join('')}
 $('#app').innerHTML=h+`<button class="btn gold" onclick="runQueue()">Continue →</button>`;save();window.scrollTo(0,0)}
function yearScreen(y,rows,mine,lib){$('#app').innerHTML=hud()+`<div class="marquee"><div class="lights">★ YEAR IN REVIEW ★</div><h2 style="font-size:34px;margin-top:6px">${y} wrap</h2></div>
 <div class="card"><h3>Domestic market share</h3><table>${rows.map((r,i)=>`<tr><td>${i+1}. ${r.me?'<b class="gold">'+esc(r.n)+'</b>':esc(r.n)}</td><td class="r">${M(r.dom)}</td><td class="r">${pct(r.share)}</td></tr>`).join('')}</table></div>
 <div class="grid3"><div class="card stat"><small>Releases</small><span class="big">${mine.length}</span></div><div class="card stat"><small>Gross</small><span class="big">${M(sum(mine,f=>f.ww))}</span></div><div class="card stat"><small>Profit</small><span class="big ${sum(mine,f=>f.profit)>=0?'pos':'neg'}">${M(sum(mine,f=>f.profit))}</span></div></div>
 ${lib?`<div class="card"><div class="row"><span>📚 Library licensing income</span><b class="pos">+${M(lib)}</b></div></div>`:''}${S.lastTax?`<div class="card"><div class="row"><span>🧾 Corporate tax (21%)</span><b class="neg">−${M(S.lastTax)}</b></div></div>`:''}${S.streaming&&svcLive()?`<div class="card"><div class="row"><span>📡 ${esc(S.streaming.name)}</span><b>${fmtN(S.streaming.subs)} subscribers</b></div></div>`:''}
 <button class="btn gold" onclick="runQueue()">Continue →</button>`;save();window.scrollTo(0,0)}
let CURD=null;
function decisionScreen(d){CURD=d;$('#app').innerHTML=hud()+`<div class="marquee"><div class="lights">★ DECISION ★</div><h2 style="margin-top:8px">${d.title}</h2></div><div class="card"><p>${d.text}</p></div>${d.opts.map((o,i)=>`<button class="btn ${i===0?'gold':'ghost'}" onclick="CURD.opts[${i}].f();save();runQueue()">${esc(o.l)}</button>`).join('')}`;window.scrollTo(0,0)}
function gameOver(){const total=sum(S.films,f=>f.ww);const best=S.films.slice().sort((a,b)=>b.ww-a.ww)[0];const aw=S.awards.film+S.awards.tv+S.awards.fest;
 const score=Math.round(total/10+aw*50+S.rep*5+Math.max(0,S.cash)/4+(S.streaming?S.streaming.subs*10:0)+(S.stock.public?S.stock.price*10:0));
 const rank=score>8000?'Hollywood Legend':score>4000?'Media Mogul':score>1800?'Respected Producer':score>600?'Indie Survivor':'Footnote in Film History';
 $('#app').innerHTML=`<div class="marquee"><div class="lights">★ THE END ★</div><h1 style="margin:12px 0 6px">${S.retired?"THAT'S A WRAP":S.fired?'FIRED BY THE BOARD':'BANKRUPT'}</h1><p class="muted">${S.retired?`${esc(S.name)} closes the books after ${END_YEAR-START_YEAR+1} years.`:S.fired?'Shareholders ran out of patience. A new CEO takes over.':`The bank seized ${esc(S.name)} in ${MON[S.month]} ${S.year}.`}</p></div>
 <div class="card center"><small>Legacy score</small><div class="big" style="font-size:52px;color:var(--gold)">${score}</div><b>${rank}</b></div>
 <div class="grid3"><div class="card stat"><small>Films</small><span class="big">${S.films.length}</span></div><div class="card stat"><small>Gross</small><span class="big">${M(total)}</span></div><div class="card stat"><small>Awards</small><span class="big">🏆 ${aw}</span></div></div>
 ${best?`<div class="card film">${poster(best.genre)}<div><small>Biggest hit</small><div><b>${esc(best.title)}</b></div><div class="muted" style="font-size:13px">${M(best.ww)} worldwide · ${tLabel(best.releaseT)}</div></div></div>`:''}
 <button class="btn gold" onclick="wipe();S=null;title()">🎬 Found a new studio</button>`;window.scrollTo(0,0)}
function settings(){modal(`<h3>Menu</h3><button class="btn ghost" onclick="exportSave()">📋 Copy save code</button><p class="muted" style="font-size:12px;margin-top:4px">Your game saves automatically. Use a save code to move it to another device.</p><button class="btn ghost" onclick="modal();S=null;title()">🏠 Main menu</button><button class="btn ghost" onclick="modal()">Close</button>`)}
function exportSave(){const code=btoa(unescape(encodeURIComponent(JSON.stringify(S))));const done=()=>modal(`<h3>Save code</h3><textarea rows="5" readonly onclick="this.select()">${code}</textarea><button class="btn ghost" onclick="modal()">Close</button>`);try{navigator.clipboard.writeText(code).then(done,done)}catch(e){done()}}
function importSave(){modal(`<h3>Load a save code</h3><textarea id="ic" rows="5"></textarea><button class="btn gold" onclick="doImport()">Load</button><button class="btn ghost" onclick="modal()">Cancel</button><p id="ie" class="neg" style="font-size:13px;margin-top:6px"></p>`)}
function doImport(){try{const s=JSON.parse(decodeURIComponent(escape(atob($('#ic').value.trim()))));if(s.v!==3)throw 0;S=s;save();modal();TAB='hq';render()}catch(e){$('#ie').textContent="That code didn't work."}}

function joinUniverse(id){const fr=S.franchises.find(x=>x.id===id);S.cash-=Math.round(10*I());fr.universe=true;addNews(`🌌 ${esc(S.name)} folds <b>${esc(fr.name)}</b> into a shared cinematic universe.`);save();render()}
