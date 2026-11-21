/* ===== v21 · GOLD NOIR — new look and a living clock ===== */

/* ---------- theme: Gold Noir becomes the default look (players can still pick Light in Settings) ---------- */
try{if(!PREFS.noir21){PREFS.noir21=1;PREFS.theme='dark';savePrefs();applyTheme()}}catch(e){}

/* ---------- the clock: time runs by itself and stops when you're needed ---------- */
const CLK={on:false,speed:1,h:null,seen:{}};
const CLK_MS={1:2200,2:1200,4:600};
function clkBlocked(){try{if(!S||S.over)return 'over';if(typeof TAB!=='undefined'&&TAB!=='hq')return 'tab';const m=document.getElementById('modal');if(m&&m.innerHTML.trim())return 'modal';if(document.getElementById('scn')||document.getElementById('cut'))return 'scene';if(typeof QUEUE!=='undefined'&&QUEUE.length){try{runQueue()}catch(e){}const m2=document.getElementById('modal');if(QUEUE.length||(m2&&m2.innerHTML.trim())||document.getElementById('scn')||document.getElementById('cut'))return 'queue'}if(document.querySelector('#app input:focus'))return 'typing'}catch(e){}return ''}
function clkImportant(){try{return weekRows().filter(r=>!/inboxModal|trendsModal|pitchView|guildInfo/.test(String(r[2])))}catch(e){return []}}
function clkKey(r){return String(r[2])+'|'+String(r[1]).replace(/<[^>]+>/g,'').slice(0,40)}
function clkStep(){if(!CLK.on)return;const b=clkBlocked();if(b){if(b!=='typing')clkStop(true);return}
 try{nextWeek()}catch(e){console.error(e);clkStop();return}
 setTimeout(()=>{try{if(!CLK.on)return;const m=document.getElementById('modal');if((m&&m.innerHTML.trim())||document.getElementById('scn')||document.getElementById('cut')){clkStop(true);return}
  const fresh=clkImportant().filter(r=>!CLK.seen[clkKey(r)]);if(fresh.length){fresh.forEach(r=>CLK.seen[clkKey(r)]=1);clkStop(true);toast(`⏸ Paused · ${String(fresh[0][1]).replace(/<[^>]+>/g,'')}`);if(TAB==='hq')render()}}catch(e){}},120)}
function clkStart(){if(clkBlocked()==='over')return;clkImportant().forEach(r=>CLK.seen[clkKey(r)]=1);CLK.on=true;clearInterval(CLK.h);CLK.h=setInterval(clkStep,CLK_MS[CLK.speed]||1200);clkPaint();setTimeout(clkStep,250)}
function clkStop(auto){CLK.on=false;clearInterval(CLK.h);CLK.h=null;clkPaint()}
function clkToggle(){CLK.on?clkStop():clkStart()}
function clkSpeed(){CLK.speed=CLK.speed===1?2:CLK.speed===2?4:1;if(CLK.on){clearInterval(CLK.h);CLK.h=setInterval(clkStep,CLK_MS[CLK.speed])}clkPaint()}
function clkPaint(){try{const b=document.getElementById('gnPlay');if(b){b.innerHTML=CLK.on?GN_PAUSE:GN_PLAY;b.setAttribute('aria-label',CLK.on?'Pause time':'Start time');b.classList.toggle('on',CLK.on)}const s=document.getElementById('gnSpd');if(s)s.textContent=CLK.speed+'×';const l=document.getElementById('gnState');if(l)l.textContent=CLK.on?'Time is running · it stops when you are needed':'Time is paused · press play to let it run'}catch(e){}}
const GN_PLAY='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
const GN_PAUSE='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
/* stepping manually still works and keeps the clock honest */
render=(function(o){return function(){const r=o.apply(this,arguments);try{if(CLK.on&&typeof TAB!=='undefined'&&TAB!=='hq')clkStop(true);clkPaint()}catch(e){}return r}})(render);

/* ---------- timeline of what's coming ---------- */
function gnEvents(){const now=wIdx();const ev=[];try{
 (S.projects||[]).forEach(p=>{if(p.releaseT!=null&&p.dist!=='sell'){const w=p.releaseT*4+(p.relWk||0);if(w>=now)ev.push({w,c:'#E8C878',t:`Premiere · ${p.title}`,a:`projectModal(${p.id})`})}
  if(p.sch&&p.startT!=null){const sw=(p.startT+p.sch.pre)*4;if(sw>now)ev.push({w:sw,c:'#C8102E',t:`Cameras roll · ${p.title}`,a:`projectModal(${p.id})`})}});
 (S.drafts||[]).filter(d=>d.status==='writing').forEach(d=>ev.push({w:d.doneW,c:'#7FA7E8',t:`Draft due · ${d.title}`,a:'writersRoom()'}));
 if(S.guild&&S.guild.next)ev.push({w:S.guild.next*4,c:'#B98CE8',t:'Writers Guild talks',a:'guildInfo()'});
 }catch(e){}return ev.filter(e=>e.w>=now&&e.w<=now+26).sort((a,b)=>a.w-b.w)}
function gnWhen(w){const d=w-wIdx();return d<=0?'this week':d===1?'next week':d<9?`in ${d} weeks`:`in ${Math.round(d/4.3)} months`}
function gnTimeline(){const E=gnEvents().slice(0,6);const now=wIdx();
 return `<div class="gn-tl"><div class="gn-tlh"><span>COMING UP</span><small>next 6 months</small></div><div class="gn-track"><i class="gn-now"></i>${E.map(e=>`<button class="gn-dot" style="left:${Math.min(97,(e.w-now)/26*100)}%;--c:${e.c}" aria-label="${esc(e.t)} ${gnWhen(e.w)}" onclick="${e.a}"></button>`).join('')}</div>
 ${E.length?`<div class="gn-tll">${E.slice(0,3).map(e=>`<button onclick="${e.a}"><i style="background:${e.c}"></i><span>${esc(e.t)}</span><em>${gnWhen(e.w)}</em></button>`).join('')}</div>`:'<div class="gn-empty">Nothing scheduled. Start a picture to fill your calendar.</div>'}</div>`}

/* ---------- the lot: what is on your stages ---------- */
function gnStages(){const L=[];try{(S.projects||[]).filter(p=>!p.vault).forEach(p=>{let ph='ready';try{ph=p.sch?phaseOf(p):'ready'}catch(e){}const lab={pre:['PRE-PRODUCTION','#7A5C2E'],shoot:['FILMING','#C8102E'],post:['POST-PRODUCTION','#1F3A5F'],ready:['READY','#1F6B4A']}[ph]||['IN PROGRESS','#555'];
  let pct=0;try{if(p.sch){pct=Math.round(clamp((tNow()-p.startT)/p.sch.total,0,1)*100)}}catch(e){}
  L.push(`<button class="gn-stage" onclick="projectModal(${p.id})"><div class="gn-sp">${typeof posterSVG==='function'?posterSVG(p,96,p.poster||(typeof defaultPoster==='function'?defaultPoster(p):undefined)):''}<span style="background:${lab[1]}">${lab[0]}</span></div><b>${esc(p.title)}</b><div class="gn-bar"><i style="width:${pct}%"></i></div></button>`)});
 (S.drafts||[]).filter(d=>d.status!=='sold').forEach(d=>{const wr=d.status==='writing';const pct=wr?Math.round(clamp((wIdx()-d.startW)/Math.max(1,d.doneW-d.startW),0,1)*100):100;L.push(`<button class="gn-stage" onclick="${wr?'writersRoom()':`drView(${d.id})`}"><div class="gn-sp gn-script"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#E8C878" stroke-width="1.4" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11h7M9 15h7M9 19h4"/></svg><span style="background:${wr?'#1F3A5F':'#1F6B4A'}">${wr?'WRITING':'DRAFT READY'}</span></div><b>${esc(d.title)}</b><div class="gn-bar"><i style="width:${pct}%"></i></div></button>`)})}catch(e){}
 L.push(`<button class="gn-stage gn-new" onclick="startFilm()"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><b>New picture</b></button>`);
 return `<div class="gn-row">${L.join('')}</div>`}

/* ---------- the "up next" card ---------- */
function gnNext(rows){const r=rows[0];if(r){return `<button class="gn-next" onclick="${r[2]}"><div class="gn-ni">${homeRowIcon(r[0],r[1])}</div><div><small>NEEDS YOU</small><b>${String(r[1])}</b><em>Open →</em></div></button>`}
 const e=gnEvents()[0];if(e)return `<button class="gn-next" onclick="${e.a}"><div class="gn-ni" style="background:${e.c}22;color:${e.c}">●</div><div><small>UP NEXT · ${gnWhen(e.w).toUpperCase()}</small><b>${esc(e.t)}</b><em>Let time run, or open it now →</em></div></button>`;
 return `<button class="gn-next" onclick="startFilm()"><div class="gn-ni">✦</div><div><small>YOUR STAGES ARE EMPTY</small><b>Greenlight your next picture</b><em>Start →</em></div></button>`}

/* ---------- the new home ---------- */
hq8=(function(o){return function(){let old='';try{old=o()}catch(e){}
 const k=old.indexOf('<h4 class="hh">Create');const tail=k>=0?old.slice(k):'';
 const rows=(()=>{try{return weekRows()}catch(e){return []}})();
 const e=typeof eraOf==='function'?eraOf(S.year):null;const bgn=(e&&typeof ERA_BG!=='undefined'&&ERA_BG[e.k])||'marquee';
 const d=curDate();const mon=MON[d.getMonth()];const fp=typeof frontPage==='function'?frontPage():'';
 const bo=(()=>{try{return weekendList().slice(0,3)}catch(e){return []}})();
 return `<section class="gn-hero"><img class="gn-bg" src="${MED}bg_${bgn}.jpg" alt=""><div class="gn-fade"></div>
 <div class="gn-in"><small class="gn-k">${e?esc(e.n||'').toUpperCase()+' · ':''}THE YEAR IS</small>
 <div class="gn-yr"><h1>${mon} ${S.year}</h1><div class="gn-ctl"><button id="gnPlay" class="gn-play ${CLK.on?'on':''}" aria-label="${CLK.on?'Pause time':'Start time'}" onclick="clkToggle()">${CLK.on?GN_PAUSE:GN_PLAY}</button><button id="gnSpd" class="gn-spd" aria-label="Change speed" onclick="clkSpeed()">${CLK.speed}×</button></div></div>
 <div class="gn-st" id="gnState">${CLK.on?'Time is running · it stops when you are needed':'Time is paused · press play to let it run'}</div>
 <div class="gn-step"><button onclick="clkStop();nextWeek()">One week ›</button><button onclick="clkStop();skipMonth()">Skip to ${tLabel(tNow()+1)}</button></div></div></section>
 ${gnNext(rows)}
 ${gnTimeline()}
 <h4 class="hh">On your lot</h4>${gnStages()}
 ${rows.length>1?`<h4 class="hh">Also waiting</h4><div class="evl">${rows.slice(1,5).map(r=>`<button class="evr" onclick="${r[2]}"><span class="evd" style="--c:${r[0]}">${homeRowIcon(r[0],r[1])}</span><span class="evt">${r[1]}</span><i>›</i></button>`).join('')}</div>`:''}
 ${fp?`<h4 class="hh">Front page</h4>${fp}`:''}
 ${bo.length?`<h4 class="hh">Weekend box office <button class="lk" onclick="boxOfficeModal()">Full chart</button></h4><div class="gn-bo">${bo.map((x,i)=>`<div class="${x.mine?'me':''}"><em>${i+1}</em><b>${esc(x.title||x.t||'')}</b><span>${esc(String(x.studio||"").split(" ")[0])}</span><span>${M(x.wkG||0)}</span></div>`).join('')}</div>`:''}
 ${tail}`}})(hq8);

/* ---------- Technicolor theme (option B) ---------- */
applyTheme=(function(o){return function(){o();try{document.body.classList.toggle('tc',PREFS.theme==='tc')}catch(e){}}})(applyTheme);
settings=(function(o){return function(){const r=o.apply(this,arguments);try{const b=[...document.querySelectorAll('#modal .seg button')].find(x=>/Dark/.test(x.textContent));if(b&&!document.getElementById('tcBtn')){b.insertAdjacentHTML('afterend',`<button id="tcBtn" class="${PREFS.theme==='tc'?'on':''}" onclick="PREFS.theme='tc';savePrefs();applyTheme();settings()">🎞️ Technicolor</button>`);b.parentElement.style.width='auto';b.textContent='✨ Gold Noir'}}catch(e){}return r}})(settings);
function themePick(t){PREFS.theme=t;savePrefs();applyTheme();render()}
hq8=(function(o){return function(){let h=o();try{h=h.replace('<div class="gn-st"',`<div class="gn-th"><button class="${PREFS.theme!=='tc'?'on':''}" onclick="themePick('dark')">Gold Noir</button><button class="${PREFS.theme==='tc'?'on':''}" onclick="themePick('tc')">Technicolor</button></div><div class="gn-st"`)}catch(e){}return h}})(hq8);
try{applyTheme()}catch(e){}
