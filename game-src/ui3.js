/* ===================== UI v3.1 — talent profiles, lot, marketing, settings ===================== */
/* ---------- Marketing channels ---------- */
function chanCost(){return +(sum(CHANNELS,c=>c[2][W.chan[c[0]]||0])*I()).toFixed(1)}
function awareness(){const w=sum(CHANNELS,c=>(W.chan[c[0]]||0)*c[3]);return Math.round(100*(1-Math.exp(-w/6))*.92+(W.script&&W.script.hype?Math.min(8,W.script.hype/3):0))}
function mktCard(){const aw=awareness();return `<div class="card"><div class="row"><small>Marketing campaign</small><b>${M(chanCost())}</b></div>
 ${CHANNELS.map(c=>`<div class="row" style="margin-top:8px"><span style="font-size:13px">${c[1]}</span><div class="chips">${[0,1,2,3].map(l=>`<button class="${(W.chan[c[0]]||0)===l?'on':''}" style="padding:6px 9px" onclick="W.chan.${c[0]}=${l};wiz()">${['Off','Low','Mid','Max'][l]}</button>`).join('')}</div></div>`).join('')}
 <div class="row" style="margin-top:10px"><small>Awareness at release</small><b style="color:${aw>=70?'var(--green)':aw>=45?'var(--gold)':'var(--red)'}">${aw}%</b></div><div class="meter"><i style="width:${aw}%;background:${aw>=70?'var(--green)':aw>=45?'var(--gold)':'var(--red)'}"></i></div>
 <div class="row" style="margin-top:10px"><span style="font-size:14px">🎦 IMAX push (${M(2*I())})</span><button class="btn sm ${W.plf?'gold':'ghost'}" style="margin:0" onclick="W.plf=!W.plf;wiz()">${W.plf?'On':'Off'}</button></div></div>`}

/* ---------- Talent profile ---------- */
function roleOf(p){for(const k in S.people)if(S.people[k].includes(p))return k;return 'actors'}
function credits(id){return S.films.filter(f=>f.dir===id||f.writer===id||f.dp===id||f.comp===id||allCast(f.cast).includes(id))}
function openPerson(id){const p=person(id);if(!p)return;const role=roleOf(p);const isA=role==='actors';const nat=natOf(p.nat);const cr=credits(id);const fee=isA?actorFee(p):crewFee(p,role);
 const aw=sum(cr,f=>f.awards.filter(a=>(a.includes('Act')||a.includes('Perf'))?f.cast.lead===id:a==='Best Director'?f.dir===id:a.includes('Screenplay')?f.writer===id:a.includes('Cinematography')?f.dp===id:a.includes('Score')?f.comp===id:false).length);
 const statRow=(l,v,c)=>`<div class="row" style="font-size:13px;margin-top:6px"><span>${l}</span><b>${Math.round(v)}</b></div>${bar(v,c)}`;
 modal(`<div class="center">${portrait(p,120)}<h3 style="margin-top:8px">${esc(p.n)}</h3><div class="muted" style="font-size:13px">${nat[1]} ${nat[0]} · ${p.age} years · ${ROLE_LBL[role].replace(/s$/,'')}${p.g?(p.g==='F'?' · Female':' · Male'):''}</div>
 <div class="tags" style="justify-content:center">${busy(p)?`<span class="tag bad">⏳ Busy for ${p.busy-tNow()+1} months</span>`:'<span class="tag good">✔ Available</span>'}<span class="tag">💵 ${M(fee)}</span>${aw?`<span class="tag hot">🏆 ${aw} award${aw>1?'s':''}</span>`:''}</div></div>
 <div class="card">${isA?statRow('⭐ Acting skill',p.skill)+statRow('💜 Star power',p.star,'#b07cff')+statRow('🎭 Versatility',clamp(p.skill*.6+(hasT(p,'method')?20:0)+(p.age>40?10:0),5,99),'#6aa8ff')+statRow('😄 Charisma',clamp(p.star*.6+(hasT(p,'charismatic')?30:10),5,99),'#ff8a5c')
   :statRow('⭐ Craft',p.skill)+statRow('💜 Fame',p.fame,'#b07cff')+statRow('💡 Creativity',clamp(p.skill*.8+(hasT(p,'visionary')?20:0)+(hasT(p,'auteur')?12:0),5,99),'#6aa8ff')+statRow('🔄 Adaptability',clamp(100-p.age+(hasT(p,'efficient')?20:0),5,99),'#ff8a5c')}
  <div class="row" style="font-size:13px;margin-top:8px"><span>Best genre</span><b>${GEN[p.spec].icon} ${p.spec}</b></div><div class="row" style="font-size:13px;margin-top:4px"><span>Hits</span><b>${p.hits||0}</b></div></div>
 <div class="card"><h3>Traits</h3>${(p.traits||[]).length?(p.traits||[]).map(t=>{const T=TRAITS[t];return `<div class="news"><b style="color:${T.good?'var(--green)':'var(--red)'}">${T.i} ${T.l}</b> <span class="tag ${T.good?'good':'bad'}">${T.good?'Strength':'Bad habit'}</span><div class="muted" style="font-size:13px">${T.d}</div></div>`}).join(''):'<p class="muted">No notable traits.</p>'}</div>
 <div class="card"><h3>Filmography with you</h3>${cr.length?`<div style="display:flex;gap:8px;overflow-x:auto;margin-top:6px">${cr.map(f=>`<div style="flex:0 0 auto;text-align:center;width:64px" onclick="filmModal(${f.id})">${posterSVG(f,60)}<small style="text-transform:none;display:block" class="ellip">${f.critic}% · ${M(f.ww)}</small></div>`).join('')}</div>`:'<p class="muted">Hasn\'t worked with your studio yet.</p>'}</div>
 <button class="btn ghost" onclick="openRename('${id}')">✏️ Rename</button><button class="btn ghost" onclick="modal()">Close</button>`)}
function openRename(id){const x=person(id);modal(`<h3>Rename</h3><input type="text" id="rn" maxlength="30" value="${esc(x.n)}"><button class="btn gold" onclick="const v=document.getElementById('rn').value.trim();if(v){person('${id}').n=v;save()}openPerson('${id}')">Save</button><button class="btn ghost" onclick="openPerson('${id}')">Cancel</button>`)}

/* ---------- Talent tab ---------- */
let TQ='',TSORT='star';
function viewTalent(){const isA=TROLE==='actors';let list=S.people[TROLE].slice();
 if(TQ)list=list.filter(x=>x.n.toLowerCase().includes(TQ.toLowerCase())||(x.nat||'').toLowerCase().includes(TQ.toLowerCase()));
 list.sort((a,b)=>TSORT==='skill'?b.skill-a.skill:TSORT==='cost'?(isA?actorFee(a)-actorFee(b):crewFee(a,TROLE)-crewFee(b,TROLE)):TSORT==='age'?a.age-b.age:(b.star||b.fame)-(a.star||a.fame));
 return `<h2>Talent pool</h2><div class="chips" style="margin-bottom:8px">${Object.keys(ROLE_LBL).map(k=>`<button class="${TROLE===k?'on':''}" onclick="TROLE='${k}';window.TLIM=40;render()">${{actors:'🎭',directors:'🎬',writers:'✍️',composers:'🎼',dps:'🎥'}[k]} ${ROLE_LBL[k]}</button>`).join('')}</div>
 <input type="text" placeholder="🔍 Search by name or country…" value="${esc(TQ)}" onchange="TQ=this.value;render()">
 <div class="chips" style="margin:8px 0">${[['star',isA?'Star power':'Fame'],['skill',isA?'Acting':'Craft'],['cost','Cheapest'],['age','Youngest']].map(s=>`<button class="${TSORT===s[0]?'on':''}" onclick="TSORT='${s[0]}';render()">${s[1]}</button>`).join('')}</div>
 <p class="muted" style="font-size:12.5px;margin:2px 2px 8px">${list.length} ${ROLE_LBL[TROLE].toLowerCase()} in the industry</p>${list.slice(0,window.TLIM||40).map(x=>`<div class="card opt" onclick="openPerson('${x.id}')"><div class="pcard">${portrait(x,58)}<div style="flex:1;min-width:0"><div class="row"><b class="ellip">${esc(x.n)}</b><b>${M(isA?actorFee(x):crewFee(x,TROLE))}</b></div><small style="text-transform:none;letter-spacing:0">${natOf(x.nat)[1]} ${esc(x.nat||'USA')} · ${x.age} · ${GEN[x.spec].icon} ${x.spec}${busy(x)?' · <span class="neg">busy</span>':''}</small>
 <div class="row" style="font-size:12px;margin-top:4px"><span>${isA?'⭐ '+x.skill+' acting':'⭐ '+x.skill+' craft'}</span><span>${isA?'💜 '+x.star+' star':'💜 '+x.fame+' fame'}</span></div>
 <div style="margin-top:4px">${isA&&typeof tierOfA==='function'?`<span class="tag tier${tierOfA(x)}">${TIER_L[tierOfA(x)]}</span> `:''}${(x.traits||[]).map(t=>`<span title="${TRAITS[t].l}" style="font-size:15px">${TRAITS[t].i}</span>`).join(' ')}</div></div></div></div>`).join('')}${list.length>(window.TLIM||40)?`<button class="btn ghost" onclick="window.TLIM=(window.TLIM||40)+40;render()">Show 40 more</button>`:''}`}

/* ---------- Studio lot ---------- */
function lotSVG(){const blds=BUILDINGS.filter(b=>lotLv(b.k)>0);
 return `<svg viewBox="0 0 360 170" width="100%" style="display:block;border-radius:12px"><defs><linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5ff"/><stop offset="1" stop-color="#ffe6b8"/></linearGradient></defs>
 <rect width="360" height="170" fill="url(#lsky)"/><circle cx="310" cy="34" r="16" fill="#fff3b0"/><path d="M0 120 Q60 104 120 118 T240 116 T360 112 V170 H0Z" fill="#7fb36a"/><rect y="140" width="360" height="30" fill="#c9b79c"/>
 <text x="180" y="22" text-anchor="middle" font-family="'Bebas Neue',Impact" font-size="16" fill="#3a2a1a" letter-spacing="3">${esc((S.logo?S.logo.text:S.name).toUpperCase())} STUDIOS</text>
 ${blds.map((b,i)=>{const x=12+(i%7)*49,row=Math.floor(i/7),lv=lotLv(b.k),h=26+lv*10,y=(row?150:132)-h+row*8;return `<g><rect x="${x}" y="${y}" width="42" height="${h}" rx="3" fill="${['#f5efe2','#e9e2d3','#fbf6ea'][i%3]}" stroke="#8a7a62"/><path d="M${x-2} ${y} Q${x+21} ${y-10} ${x+44} ${y}Z" fill="${['#c0392b','#2d5c8a','#3a7a4a','#8a5a2d'][i%4]}"/><text x="${x+21}" y="${y+h/2+6}" text-anchor="middle" font-size="16">${b.i}</text><text x="${x+21}" y="${y+h-3}" text-anchor="middle" font-size="7" font-weight="700" fill="#3a2a1a">${'★'.repeat(lv)}</text></g>`}).join('')}
 </svg>`}
function lotView(){const y=S.year;
 modal(`<h3>🏗️ Your studio lot</h3>${lotSVG()}<p class="muted" style="font-size:12px;margin:8px 0">Buildings cut costs, raise quality and let you make more at once. Each level adds monthly upkeep (now ${M(lotUpkeep())}/month).</p>
 ${BUILDINGS.map(b=>{const lv=lotLv(b.k);const locked=b.year&&y<b.year;const cost=Math.round(b.cost*(lv+1)*I());return `<div class="card"><div class="row"><b>${b.i} ${b.l}</b><span class="gold">${'★'.repeat(lv)}${'☆'.repeat(b.max-lv)}</span></div><div class="muted" style="font-size:13px;margin-top:4px">${lv?'Now: '+b.d(lv):'Not built'}${lv<b.max?' → next: '+b.d(lv+1):''}</div>
  ${locked?`<span class="tag">🔒 Invented in ${b.year}</span>`:lv<b.max?`<button class="btn sm ${S.cash+creditLimit()>=cost?'gold':'ghost'}" ${S.cash+creditLimit()>=cost?'':'disabled'} onclick="buildLot('${b.k}')">${lv?'Upgrade':'Build'} · ${M(cost)}</button>`:'<span class="tag good">Max level</span>'}</div>`}).join('')}
 <button class="btn ghost" onclick="modal()">Close</button>`)}
function buildLot(k){const b=BUILDINGS.find(x=>x.k===k);const lv=lotLv(k);const cost=Math.round(b.cost*(lv+1)*I());S.cash-=cost;S.lot[k]=lv+1;
 if(k==='aiprevis')gainRep(-2);addNews(`🏗️ ${esc(S.name)} ${lv?'upgrades its':'builds a new'} ${b.l.toLowerCase()}.`);sfx('cash');save();lotView()}
function filmCap(){return lotLv('stage')+1}
function tvCap(){return lotLv('tvstage')+1}
const _startFilm=startFilm;startFilm=function(){const active=S.projects.filter(p=>!p.acquired&&phaseOf(p)!=='ready').length;
 if(active>=filmCap())return modal(`<h3>🎬 All soundstages are busy</h3><p class="muted" style="margin-top:6px">You have ${active} film${active>1?'s':''} shooting or in post. Build more soundstages on your studio lot to make more at once.</p><button class="btn gold" onclick="lotView()">🏗️ Open studio lot</button><button class="btn ghost" onclick="modal()">OK</button>`);_startFilm()}
const _startShow=startShow;startShow=function(){const active=S.shows.filter(s=>s.status==='prod').length;
 if(active>=tvCap())return modal(`<h3>📺 All TV stages are busy</h3><p class="muted" style="margin-top:6px">Build more TV stages on your studio lot to produce more series at once.</p><button class="btn gold" onclick="lotView()">🏗️ Open studio lot</button><button class="btn ghost" onclick="modal()">OK</button>`);_startShow()}

/* ---------- Final cut in post-production ---------- */
const _pm=projectModal;projectModal=function(id){_pm(id);const p=S.projects.find(x=>x.id===id);if(!p)return;const ph=phaseOf(p);
 if((ph==='post'||ph==='ready')&&p.dist!=='sell'){const box=document.querySelector('#modal .modal>div');if(box&&box.insertAdjacentHTML)box.insertAdjacentHTML('beforeend',`<div class="card" id="cutbox"><b>✂️ The final cut</b><p class="muted" style="font-size:12px">Director's cut pleases critics; studio cut pleases audiences.</p><div class="seg">${[['director',"Director's cut"],['balanced','Balanced'],['studio','Studio cut']].map(c=>`<button class="${p.cut===c[0]?'on':''}" onclick="S.projects.find(x=>x.id===${id}).cut='${c[0]}';save();projectModal(${id})">${c[1]}</button>`).join('')}</div></div>`)}}

/* ---------- Gossip with choices ---------- */
const _we=worldEvents;worldEvents=function(){_we();
 const mine=[];S.projects.forEach(p=>allCast(p.cast).forEach(id=>{const a=person(id);if(a&&!mine.includes(a))mine.push(a)}));
 const risky=mine.filter(a=>hasT(a,'party')||hasT(a,'hothead'));const pool=risky.length&&Math.random()<.5?risky:mine;
 if(pool.length&&Math.random()<(risky.length?.12:.04)){const a=pick(pool);const p=S.projects.find(x=>allCast(x.cast).includes(a.id));
  const story=hasT(a,'hothead')?`${esc(a.n)} was filmed screaming at a crew member on the set of <b>${esc(p.title)}</b>.`:pick([`${esc(a.n)} spotted dancing on a yacht at 4 a.m. before a shoot day.`,`${esc(a.n)} posts a cryptic rant about the <b>${esc(p.title)}</b> script.`,`Rumours swirl about ${esc(a.n)} and a co-star's secret romance.`]);
  queueDecision({title:'📰 GOSSIP-O-METER',text:`<div class="pcard">${portrait(a,56,{sad:1})}<div>${story}</div></div><p class="muted" style="font-size:13px;margin-top:8px">How does the studio respond?</p>`,opts:[
   {l:'Issue a statement',f:()=>{gainRep(-.5);addNews(`🗞️ ${esc(S.name)} releases a statement about ${esc(a.n)}.`)}},
   {l:'Say nothing',f:()=>{p.hype-=4}},
   {l:'Use the publicity',f:()=>{p.hype+=6;gainRep(-2);post(null,`everyone is talking about ${esc(a.n)} now 👀 ${esc(p.title)} hype is real`,RI(20000,300000))}}]})}}

/* ---------- Settings ---------- */
function settings(){modal(`<h3>⚙️ Settings</h3>
 <div class="card"><div class="row"><span>🎨 Theme</span><div class="seg" style="margin:0;width:180px"><button class="${PREFS.theme==='light'?'on':''}" onclick="PREFS.theme='light';savePrefs();applyTheme();settings()">☀️ Light</button><button class="${PREFS.theme==='dark'?'on':''}" onclick="PREFS.theme='dark';savePrefs();applyTheme();settings()">🌙 Dark</button></div></div>
 <div class="row" style="margin-top:12px"><span>🎵 Music</span><button class="btn sm ${PREFS.music?'gold':'ghost'}" style="margin:0" onclick="PREFS.music=!PREFS.music;savePrefs();PREFS.music?musicStart():musicStop();settings()">${PREFS.music?'On':'Off'}</button></div>
 <div class="row" style="margin-top:12px"><span>🔊 Sound effects</span><button class="btn sm ${PREFS.sfx?'gold':'ghost'}" style="margin:0" onclick="PREFS.sfx=!PREFS.sfx;savePrefs();settings()">${PREFS.sfx?'On':'Off'}</button></div></div>
 ${S?`<button class="btn ghost" onclick="exportSave()">📋 Copy save code</button><button class="btn ghost" onclick="modal();S=null;title()">🏠 Main menu</button>`:''}<button class="btn ghost" onclick="modal()">Close</button>`)}
const _title=title;title=function(){applyTheme();_title();const a=document.getElementById('app');if(a&&a.insertAdjacentHTML)a.insertAdjacentHTML('beforeend','<button class="btn ghost" onclick="settings()">⚙️ Settings · music & theme</button>')}
const _render=render;render=function(){applyTheme();_render()}
