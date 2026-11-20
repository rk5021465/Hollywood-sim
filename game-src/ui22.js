/* ===================== v16 — new home, event cards, one design language ===================== */

/* ---------- home ---------- */
function homeFocus(){const t=tNow();const rel=S.projects.find(p=>p.releaseT===t&&(p.relWk||0)===(S.wk||0)&&!p.vault);
 if(rel)return {k:'rel',h:`${esc(rel.title)} opens this week`,s:[['Tracking',rel.track?`${M(rel.track[0])}–${M(rel.track[1])}`:'—'],['Buzz',Math.round(rel.hype||0)],['Budget',M(rel.prod||rel.spend||0)]],a:`projectModal(${rel.id})`};
 const run=S.films.filter(f=>!f.ended&&f.shown&&f.weeks&&f.dist!=='stream'&&f.dist!=='sell').map(f=>({f,so:boShown(f)})).filter(x=>!x.so.done).sort((a,b)=>b.so.ww-a.so.ww)[0];
 if(run){const k=run.so.n||1;return {k:'run',h:`${esc(run.f.title)} · week ${k} in cinemas`,s:[['Last weekend',M(run.f.weeks[Math.max(0,k-1)]||0)],['Worldwide',M(run.so.ww)],['Critics',run.f.critic+'%']],a:`filmModal(${run.f.id})`}}
 const nx=S.projects.filter(p=>!p.vault&&p.releaseT<9999).sort((a,b)=>(a.releaseT*4+(a.relWk||0))-(b.releaseT*4+(b.relWk||0)))[0];
 if(nx){const s=stageInfo(nx);return {k:'prod',h:`${esc(nx.title)} · ${s.ph==='ready'?'ready for release':STG[s.i][1].toLowerCase()}`,s:[['Progress',(s.ph==='ready'?100:s.pct)+'%'],['Release',fmtDay(relD(nx))],['Buzz',Math.round(nx.hype||0)]],a:`projectModal(${nx.id})`}}
 return {k:'idle',h:'Your stages are empty',s:[['Cash',M(S.cash)],['Prestige',Math.round(S.rep)],['Films',S.films.length]],a:'startFilm()',cta:'Greenlight a film'}}
function homeRowIcon(c,txt){const m=String(txt);return /opens this week/.test(m)?'🎟️':/pitch/i.test(m)?'📞':/report/i.test(m)?'📒':/wants/.test(m)?'🎙️':/unread/.test(m)?'✉️':/hot/.test(m)?'🔥':/week \d/.test(m)?'🎬':/Trending/.test(m)?'#️⃣':'•'}
hq8=function(){const t=tNow();const F=homeFocus();const rows=weekRows();const tasks=typeof studioTasks==='function'?studioTasks():[];const e=typeof eraOf==='function'&&isEraMode()?eraOf():null;
 const items=S.projects.filter(p=>!p.vault).map(p=>({p})).concat(S.films.filter(f=>!f.ended&&f.shown&&f.dist!=='stream'&&f.dist!=='sell').map(f=>({f})),S.shows.filter(s=>s.status==='prod'||s.status==='airing').map(s=>({s})));
 let bo=[];try{bo=weekendList().sort((a,b)=>b.wkG-a.wkG).slice(0,5)}catch(x){}
 const T=(i,l,a,b)=>`<button class="qt" onclick="${a}">${ic(i,'#B5821C')}<span>${l}</span>${b?`<i>${b}</i>`:''}</button>`;
 const phone=true;
 return `${e?`<div class="h2row">${eraChip()}<span class="muted" style="font-size:12px">${S.year}</span></div>`:''}
 <section class="wk2" ${e?`style="--e1:${e.c[0]};--e2:${e.c[1]}"`:''}><small>THIS WEEK</small><h3 onclick="${F.a}">${F.h}</h3><div class="wk2s">${F.s.map(x=>`<div><small>${x[0]}</small><b>${x[1]}</b></div>`).join('')}</div>
 ${F.cta?`<button class="wk2b alt" onclick="${F.a}">${F.cta}</button>`:''}<button class="wk2go" onclick="nextWeek()">Next week · ${fmtDay(addDays(curDate(),7))} ›</button>
 <div class="wk2sub"><button onclick="skipMonth()">Skip to ${tLabel(t+1)}</button><button onclick="boxOfficeModal()">Box office</button><button onclick="tasksModal()">Tasks${tasks.length?` · ${tasks.length}`:''}</button></div></section>
 <h4 class="hh">Needs you${rows.length?` · ${rows.length}`:''}</h4>
 ${rows.length?`<div class="evl">${rows.slice(0,5).map(r=>`<button class="evr" onclick="${r[2]}"><span class="evd" style="--c:${r[0]}">${homeRowIcon(r[0],r[1])}</span><span class="evt">${r[1]}</span><i>›</i></button>`).join('')}</div>`:'<div class="evl"><div class="evr" style="justify-content:center;color:var(--muted)">All quiet. Plan your next move.</div></div>'}
 <h4 class="hh">On the slate <button class="lk" onclick="TAB='slate';render()">See all</button></h4>
 ${items.length?`<div class="hscroll">${items.map(prodCard).join('')}</div>`:`<div class="empty2"><b>No projects yet</b><span>Every empire starts with one film.</span><button class="wk2go sm" onclick="startFilm()">Make your first movie</button></div>`}
 <div class="qrow">${T('clap','Movie','startFilm()')}${T('tv','TV series','startShow()')}${T('mic','Pitch room','pitchRoom()',pitchOpen().length||'')}${T('mega','Media','mediaModal()',(S.invites||[]).filter(i=>!i.done).length||'')}</div>
 ${bo.length?`<h4 class="hh">Weekend box office <button class="lk" onclick="boxOfficeModal()">Full chart</button></h4><div class="bo2">${bo.map((x,i)=>`<div class="bo2r ${x.mine?'me':''}" onclick="${x.mine?`filmModal(${x.id})`:'boxOfficeModal()'}"><em>${i+1}</em><b>${esc(x.title)}</b><span>${esc((x.studio||'').split(' ')[0])}</span><strong>${M(x.wkG)}</strong></div>`).join('')}</div>`:''}
 <h4 class="hh">Your studio</h4><div class="tgrid">${T('target','Diary & team','diaryView()')}${T('build','Studio lot','lotView()')}${T('film','Released','TAB=\'slate\';render()')}${T('star','Franchises','franchiseView()')}${T('target','Goals','goalsModal()')}${T('medal','Awards','achModal()')}${T('money','Vault','vaultView()')}${T('ticket','Rights market','marketView()')}${S.year>=2007?T('stream','Streaming','TAB=\'world\';WTAB=\'empire\';render()'):''}<button class="qt" onclick="studioPage()">${logoMini(S.logo,26)}<span>My studio</span></button></div>
 <h4 class="hh">Industry</h4><div class="tgrid">${T('users','Rivals','rivalsModal()')}${T('chart','Trends','trendsModal()')}${T('trophy','Top charts','leaderboard()')}${phone?T('chat','Fan buzz','fansModal()'):''}${phone?T('mega','Social apps','openPhone()'):''}${T('gear','Settings','settings()')}</div>
 <h4 class="hh">The Ledger <button class="lk" onclick="TAB='world';render()">All news</button></h4><div class="news2">${S.news.slice(0,4).map(n=>`<p>${typeof n==='string'?n:(n.s||'')}</p>`).join('')}</div>`};

/* ---------- event cards (replaces the chat-style scene) ---------- */
playScene=function(sc,next){
 if(!scnDOM()){const c=sc.choices&&sc.choices.length?pick(sc.choices):null;try{if(c&&c.f)c.f()}catch(e){}if(sc.log)diary(sc.log[0],sc.log[1],(c&&c.l)||'');return next&&next()}
 const pre=S&&S.year<2009;let tag=sc.tag||'Studio';if(pre&&tag==='Text message')tag='Phone call';
 let L=(sc.lines||[]).map(x=>pre?String(x).replace(/hit (\d+) million views overnight/,'is playing before every big release, and audiences are buzzing').replace(/the trades are calling/i,'the trades are calling'):x);
 let hi=L.findIndex(x=>/class="big"/.test(x));if(hi<0)hi=L.length-1;const head=L[hi]||'';const body=L.filter((_,i)=>i!==hi);
 SC={sc,next,chShown:true};const old=document.getElementById('scn');if(old)old.remove();
 const ch=(sc.choices&&sc.choices.length?sc.choices:[{l:'Continue'}]).map(x=>pre?Object.assign({},x,{l:String(x.l).replace('Take a selfie for socials','Pose for the trade photographers').replace('Leak it to the press','Leak it to the gossip columns'),sub:x.sub&&String(x.sub).replace('Hype for your studio','Good press for your studio')}):x);if(pre&&sc.choices)sc.choices=ch;
 document.body.insertAdjacentHTML('beforeend',`<div id="scn" class="scn2 ${sc.bg||'office'}"><div class="scn2-top"><span class="scn2-chip">${esc(tag)}</span></div><div class="scn2-card"><div class="scn2-img">${scnBG(sc.bg)}<div class="scn2-pt">${portrait(sc.who,96)}</div></div>
 <div class="scn2-body"><small>${esc(sc.role||(sc.who&&sc.who.role)||'')}${sc.who&&sc.who.n?' · '+esc(sc.who.n):''}</small><h2>${head}</h2>${body.length?`<p>${body.join(' ')}</p>`:''}
 <div id="scnC">${ch.map((x,i)=>`<button class="scn2-opt ${i===0&&ch.length>1?'pri':''}" onclick="scnPick(${i})"><div><b>${x.l}</b>${x.sub?`<small>${x.sub}</small>`:''}</div><i>›</i></button>`).join('')}</div><div id="scnR"></div></div></div></div>`);
 if(sc.music)try{musicTrack(sc.music)}catch(e){}if(sc.bg==='call'){try{sfx('ring');hap('long')}catch(e){}}};
scnPick=function(i){if(!SC||SC.done)return;SC.done=true;const ch=SC.sc.choices&&SC.sc.choices.length?SC.sc.choices:[{l:'Continue'}];const c=ch[i];try{hap(c.hap||'tap')}catch(e){}let rep=null;try{rep=c.f?c.f():null}catch(e){}
 if(SC.sc.log)diary(SC.sc.log[0],SC.sc.log[1],c.l+(rep&&rep.note?' · '+rep.note:''));try{save()}catch(e){}
 if(!rep||(!rep.say&&!rep.note))return scnEnd();const C=document.getElementById('scnC'),R=document.getElementById('scnR');
 if(C)C.innerHTML=`<div class="scn2-you">You: ${c.l}</div>`;if(R)R.innerHTML=`${rep.say?`<div class="scn2-say">“${rep.say}”</div>`:''}${rep.note?`<div class="scn2-fx">${rep.note}</div>`:''}<button class="scn2-opt pri" onclick="scnEnd()"><div><b>Continue</b></div><i>›</i></button>`};
scnSkip=function(){};scnTap=function(){};

/* ---------- top bar: rename first tab ---------- */
render=(function(o){return function(){o();try{const b=document.querySelector('.tabbar button');if(b&&/Studio/.test(b.textContent))b.innerHTML=b.innerHTML.replace('Studio','Home')}catch(e){}}})(render);
