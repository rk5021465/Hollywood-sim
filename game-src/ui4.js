/* ===================== v5 — weeks, 2-year calendar, rivals, careers, social, TV schedule ===================== */
let KEEPQ=0;
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function dateOf(t,wk,dow){const y=START_YEAR+Math.floor(t/12),m=((t%12)+12)%12;const d=new Date(y,m,1);const off=((dow==null?5:dow)-d.getDay()+7)%7;d.setDate(1+off+7*(wk||0));return d}
const curDate=()=>dateOf(tNow(),S.wk||0,5);
const fmtShort=d=>d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear();
const fmtDay=d=>DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()];
const fmtLong=d=>fmtDay(d)+' '+d.getFullYear();
const addDays=(d,n)=>{const x=new Date(d.getTime());x.setDate(x.getDate()+n);return x};
const wIdx=()=>tNow()*4+(S.wk||0);
const fmtC=n=>n>=1e9?(n/1e9).toFixed(1)+'B':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(Math.round(n));

/* ---------- weekly simulation ---------- */
function nextWeek(){if((S.wk||0)>=3){return nextMonth()}QUEUE=[];S.wk=(S.wk||0)+1;weekTick();if(S.cash<-creditLimit()){S.over=true;S.retired=false}save();runQueue()}
function skipMonth(){QUEUE=[];while((S.wk||0)<3){S.wk=(S.wk||0)+1;weekTick()}KEEPQ=1;nextMonth()}
function weekTick(){const t=tNow();
 S.projects.slice().forEach(p=>{if(p.releaseT!==t||(p.relWk||0)!==S.wk)return;
  if(S.ev.pandemic&&S.ev.pandemic.until>=t&&(p.dist==='wide'||p.dist==='platform')){p.releaseT=t+1;p.relWk=0;return}
  if(phaseOf(p)!=='ready'){p.releaseT=t+1;p.relWk=0;addNews(`⚠️ <b>${esc(p.title)}</b> isn't finished and slips to ${tLabel(t+1)}.`);return}
  const f=releaseFilm(p);S.projects=S.projects.filter(x=>x!==p);S.films.push(f);
  allCast(p.cast).forEach(id=>{const a=person(id);if(a&&a.busy>t)a.busy=t});QUEUE.push(()=>releaseScreen(f))});
 tvTick(true);if(typeof weekBO==='function')weekBO();
 rivalsAt(t).filter(r=>(r.wk||0)===S.wk&&r.dom).forEach(r=>{if(r.hype>80)addNews(`🎟️ ${esc(r.studio)}'s <i>${esc(r.title)}</i> opens to ${M(r.dom*.32)} this weekend.`)});
 const top=weekendList()[0];if(top&&Math.random()<.6)addNews(`🏆 <i>${esc(top.title)}</i> tops the weekend box office with ${M(top.wkG)}.`);
 if(Math.random()<.35){const p=pick(S.projects.concat(S.shows.filter(s=>s.status==='prod')));if(p)post(null,pick([`can't wait for ${esc(p.title)} 🍿`,`any news on ${esc(p.title)}??`,`${esc(p.title)} better be good 👀`,`the cast of ${esc(p.title)} is unreal`]),RI(300,40000))}
}
function rivWeeks(r){const o=[];for(let k=0;k<10;k++)o.push(r.dom*.32*Math.pow(.58,k));return o}
function weekendList(){const t=tNow(),now=wIdx();const out=[];
 S.films.forEach(f=>{if(f.dist==='stream'||f.dist==='sell'||!f.weeks)return;const k=now-(f.releaseT*4+(f.relWk||0));if(k>=0&&k<f.weeks.length&&k<12)out.push({mine:1,title:f.title,studio:S.name,wkG:f.weeks[k],tot:sum(f.weeks.slice(0,k+1),x=>x),k,obj:f,id:f.id})});
 S.rivalFilms.forEach(r=>{if(!r.dom)return;const k=now-(r.t*4+(r.wk||0));if(k>=0&&k<10){const w=rivWeeks(r);out.push({title:r.title,studio:r.studio,wkG:w[k],tot:sum(w.slice(0,k+1),x=>x),k,obj:{title:r.title,genre:r.g,cast:{lead:r.lead}}})}});
 return out.sort((a,b)=>b.wkG-a.wkG)}
function weekendStrip(){const l=weekendList().slice(0,3);if(!l.length)return '';
 return `<div class="card" style="margin-top:8px" onclick="boxOfficeModal()"><div class="row"><b>🎟️ This weekend · ${fmtDay(curDate())}</b><small>tap for top 10</small></div>${l.map((e,i)=>`<div class="row" style="margin-top:6px;font-size:13px"><span class="ellip"><b>${i+1}.</b> ${e.mine?'<b class="gold">':''}${esc(e.title)}${e.mine?'</b>':''} ${studioBadge(e.studio,1)}</span><b>${M(e.wkG)}</b></div>`).join('')}</div>`}
function boxOfficeModal(){const l=weekendList().slice(0,10);
 modal(`<h3>🎟️ Weekend box office</h3><p class="muted" style="font-size:13px">Weekend of ${fmtLong(curDate())} · domestic</p>${l.length?l.map((e,i)=>`<div class="card ${e.mine?'mine':''}" style="padding:9px" ${e.mine?`onclick="filmModal(${e.id})"`:''}><div class="pcard" style="gap:10px"><b style="font-size:20px;width:22px">${i+1}</b>${posterSVG(e.obj,40)}<div style="flex:1;min-width:0"><b class="ellip" style="display:block">${esc(e.title)}</b>${studioBadge(e.studio)}<div class="muted" style="font-size:12px">Week ${e.k+1} · total ${M(e.tot)}</div></div><b>${M(e.wkG)}</b></div></div>`).join(''):'<p class="muted">Quiet weekend — nothing in wide release.</p>'}<button class="btn ghost" onclick="modal()">Close</button>`)}

/* ---------- studios ---------- */
const rivalOf=n=>S.rivals.find(r=>r.n===n);
function rivalLogo(r){const i=S.rivals.indexOf(r);const w=r.n.split(' ');return{text:w[0],sub:w.slice(1).join(' ')||'Pictures',tpl:['classic','modern','elegant','minimal','playful','classic','modern'][i%7],c1:r.c,c2:'#ffffff',icon:r.n[0]}}
function studioBadge(n,small){if(n===S.name){const L=S.logo||{c1:'#e8b84a',c2:'#1a1206',icon:S.name[0]};return `<span class="sbadge${small?' sm':''}"><i style="background:${L.c1};color:${L.c2}">${esc((L.icon||S.name[0]).slice(0,2))}</i>${esc(S.name.split(' ')[0])}</span>`}
 const r=rivalOf(n);const c=r?r.c:'#888';const lab=n.split(' ')[0];return `<span class="sbadge${small?' sm':''}" onclick="event.stopPropagation();${r?`rivalPage('${esc(n).replace(/'/g,"\\'")}')`:''}"><i style="background:${c}">${esc(n[0])}</i>${esc(lab)}</span>`}
function rivPick(role){const pool=(S.people[role]||[]).filter(x=>!busy(x));if(!pool.length)return null;const wts=pool.map(x=>Math.pow((x.star||x.fame||20)/100,1.6)+.03);let r=Math.random()*sum(wts,x=>x);for(let i=0;i<pool.length;i++){r-=wts[i];if(r<=0)return pool[i].id}return pool[0].id}
function histPush(r){S.hist=S.hist||[];S.hist.push({title:r.title,g:r.g,studio:r.studio,y:yearOf(r.t),t:r.t,dom:+(r.dom||0).toFixed(1),ww:+((r.dom||0)*R(1.8,2.6)).toFixed(1),critic:Math.round(clamp(r.hype*.5+R(10,55),8,98)),lead:r.lead,co:r.co,dir:r.dir})}
function rivalsAhead(){const t=tNow();if(S.rivGenTo==null)S.rivGenTo=Math.max(t+13,...S.rivalFilms.map(r=>r.t));while(S.rivGenTo<t+25)genRivals(++S.rivGenTo);
 S.rivalFilms.forEach(r=>{if(r.wk==null)r.wk=RI(0,3);if(r.lead===undefined){r.lead=rivPick('actors');r.dir=rivPick('directors')}})}
function genHistory(){S.hist=[];const P=S.people;const yNow=S.year;
 const pickAt=(role,y,minAge,excl)=>{const pool=P[role].filter(x=>x.age-(yNow-y)>=minAge&&!excl.includes(x.id));if(!pool.length)return null;
  const wts=pool.map(x=>{const ageThen=x.age-(yNow-y);const f=(x.star||x.fame||20);return Math.pow(f/100,1.4)*(ageThen<24?.5:1)+.02});let r=Math.random()*sum(wts,x=>x);for(let i=0;i<pool.length;i++){r-=wts[i];if(r<=0)return pool[i].id}return pool[0].id};
 const studios=S.rivals.map(r=>r.n);
 for(let y=START_YEAR-26;y<START_YEAR;y++){const yearFilms=[];
  S.rivals.forEach(rv=>{const n=Math.max(1,Math.round(1.5+rv.p*2+R(-.6,.6)));for(let i=0;i<n;i++){const g=pick(GENRES);const ex=[];
   const lead=pickAt('actors',y,18,ex);ex.push(lead);const co=pickAt('actors',y,18,ex);ex.push(co);const sup=pickAt('actors',y,16,ex);
   const dom=+(25*Math.pow(R(.4,1.6)*rv.p,1.5)*GEN[g].base*Math.pow(1.02,y-START_YEAR)*R(1.5,3)).toFixed(1);
   const h={title:genTitle(g),g,studio:rv.n,y,t:(y-START_YEAR)*12+RI(0,11),dom,ww:+(dom*R(1.7,2.6)).toFixed(1),critic:RI(18,97),lead,co,sup,dir:pickAt('directors',y,26,[]),writer:pickAt('writers',y,22,[]),comp:pickAt('composers',y,22,[]),dp:pickAt('dps',y,24,[])};
   S.hist.push(h);yearFilms.push(h)}});
  const best=yearFilms.slice().sort((a,b)=>b.critic+GEN[b.g].award*8-a.critic-GEN[a.g].award*8)[0];if(best){best.awp=1;best.awd=1;best.awl=1}
  if(y>=START_YEAR-16){const outs=(y>=2007?[TECH_STREAMER.n].concat(S.rivals.filter(r=>r.svc).map(r=>r.svc)):[]).concat(['Broadcast TV']);
   for(let i=0;i<4;i++){const g=pick(Object.keys(TV_GENRES));const ex=[];const lead=pickAt('actors',y,18,ex);ex.push(lead);
    S.hist.push({tv:1,title:pick(TVW[0])+' '+pick(TVW[1]),g,studio:pick(outs),y,t:(y-START_YEAR)*12+RI(0,11),critic:RI(25,96),views:+R(2,60).toFixed(1),lead,co:pickAt('actors',y,18,ex),writer:pickAt('writers',y,22,[])})}}}
 S.hist.sort((a,b)=>a.t-b.t);CAREER=null}
function ensureV5(){if(!S)return;if(S.wk==null)S.wk=0;if(!S.hist)genHistory();rivalsAhead()}
const _ng5=newGame;newGame=function(o){_ng5(o);ensureV5()};
const _render5=render;render=function(){ensureV5();_render5()};

/* ---------- careers ---------- */
let CAREER=null;
function roleIn(h,id){if(h.lead===id||(h.leads2||[]).includes(id))return 'Lead';if(h.co===id||(h.cos2||[]).includes(id))return 'Co-star';if(h.sup===id||(Array.isArray(h.sup)&&h.sup.includes(id)))return 'Supporting';if(h.dir===id)return 'Director';if(h.writer===id)return 'Writer';if(h.comp===id)return 'Composer';if(h.dp===id)return 'Cinematographer';return null}
function careerOf(id){const out=[];
 (S.hist||[]).forEach((h,i)=>{const r=roleIn(h,id);if(r)out.push({h,i,role:r,studio:h.studio,y:h.y,title:h.title,tv:h.tv})});
 S.films.forEach(f=>{const c=f.cast||{};const r=roleIn({lead:c.lead,leads2:c.leads2,co:c.co,cos2:c.cos2,sup:c.sup,dir:f.dir,writer:f.writer,comp:f.comp,dp:f.dp},id);if(r)out.push({f,role:r,studio:S.name,y:yearOf(f.releaseT),title:f.title})});
 S.projects.forEach(p=>{const c=p.cast||{};const r=roleIn({lead:c.lead,leads2:c.leads2,co:c.co,cos2:c.cos2,sup:c.sup,dir:p.dir,writer:p.writer,comp:p.comp,dp:p.dp},id);if(r)out.push({p,role:r,studio:S.name,y:yearOf(p.releaseT),title:p.title,upcoming:1})});
 S.shows.forEach(s=>{const r=s.lead===id?'Lead':(s.cos||[]).includes(id)?'Co-star':s.writer===id?'Creator':null;if(r)out.push({s,role:r,studio:S.name,y:yearOf(s.startT),title:s.title,tv:1})});
 S.rivalFilms.forEach(r=>{if(r.t>tNow()||(r.t===tNow()&&(r.wk||0)>(S.wk||0))){const ro=r.lead===id?'Lead':r.co===id?'Co-star':r.dir===id?'Director':null;if(ro)out.push({rf:r,role:ro,studio:r.studio,y:yearOf(r.t),title:r.title,upcoming:1})}});
 return out.sort((a,b)=>b.y-a.y)}
function creditCount(id){if(!CAREER||CAREER.n!==(S.hist||[]).length+S.films.length){CAREER={n:(S.hist||[]).length+S.films.length,m:{}};const add=x=>{if(x)CAREER.m[x]=(CAREER.m[x]||0)+1};
  (S.hist||[]).forEach(h=>{add(h.lead);add(h.co);add(h.sup);add(h.dir);add(h.writer);add(h.comp);add(h.dp)});S.films.forEach(f=>{allCast(f.cast).forEach(add);[f.dir,f.writer,f.comp,f.dp].forEach(add)})}
 return CAREER.m[id]||0}
function careerAwards(id){let n=0;(S.hist||[]).forEach(h=>{if(h.awl&&h.lead===id)n++;if(h.awd&&h.dir===id)n++});return n}
function careerRow(c){const h=c.h,f=c.f;const obj=f||c.p||(c.s?null:{title:c.title,genre:h?h.g:c.rf?c.rf.g:'Drama',cast:{lead:h?h.lead:c.rf?c.rf.lead:null}});
 const stat=f?`${f.critic}% · ${M(f.ww)}`:h?(h.tv?`${h.critic}% · ${h.views}M views`:`${h.critic}% · ${M(h.ww)}`):c.upcoming?'Coming soon':c.s?(c.s.seasons.length?c.s.seasons.length+' season(s)':'In production'):'';
 const aw=h&&((h.awl&&c.role==='Lead')||(h.awd&&c.role==='Director'))?' 🏆':'';
 const click=f?`filmModal(${f.id})`:h?`histFilm(${c.i})`:c.s?`showModal(${c.s.id})`:c.p?`projectModal(${c.p.id})`:'';
 return `<div class="crow" onclick="${click}">${obj&&!(h&&h.tv)?posterSVG(obj,34):`<div class="tvthumb">${c.s?TV_GENRES[c.s.genre].icon:h&&TV_GENRES[h.g]?TV_GENRES[h.g].icon:'📺'}</div>`}<div style="flex:1;min-width:0"><b class="ellip" style="display:block;font-size:14px">${esc(c.title)}${aw}</b><div style="font-size:12px" class="muted">${c.y} · ${c.tv?'TV · ':''}${c.role}</div>${studioBadge(c.studio,1)}</div><small style="text-transform:none;text-align:right">${stat}</small></div>`}
let CAREER_ALL=0;
function openPerson(id){const p=person(id);if(!p)return;const role=roleOf(p);const isA=role==='actors';const nat=natOf(p.nat);const fee=isA?actorFee(p):crewFee(p,role);
 const car=careerOf(id);const aw=careerAwards(id)+sum(S.films.filter(f=>allCast(f.cast).includes(id)||f.dir===id),f=>f.awards.filter(a=>(a.includes('Act')&&f.cast.lead===id)||(a==='Best Director'&&f.dir===id)).length);
 const statRow=(l,v,c)=>`<div class="row" style="font-size:13px;margin-top:6px"><span>${l}</span><b>${Math.round(v)}</b></div>${bar(v,c)}`;
 const newbie=!car.length?'<span class="tag blue">🌱 New to the industry</span>':car.length<=2&&p.age<30?'<span class="tag blue">🌱 Rising newcomer</span>':`<span class="tag">🎬 ${car.length} credits</span>`;
 const shown=CAREER_ALL===id?car:car.slice(0,12);
 modal(`<div class="center">${portrait(p,120)}<h3 style="margin-top:8px">${esc(p.n)}</h3><div class="muted" style="font-size:13px">${nat[1]} ${nat[0]} · ${p.age} years · ${ROLE_LBL[role].replace(/s$/,'')}${p.g?(p.g==='F'?' · Female':' · Male'):''}</div>
 <div class="tags" style="justify-content:center">${busy(p)?`<span class="tag bad">⏳ Busy for ${p.busy-tNow()+1} months</span>`:'<span class="tag good">✔ Available</span>'}<span class="tag">💵 ${M(fee)}</span>${newbie}${aw?`<span class="tag hot">🏆 ${aw} award${aw>1?'s':''}</span>`:''}</div></div>
 <div class="card">${isA?statRow('⭐ Acting skill',p.skill)+statRow('💜 Star power',p.star,'#b07cff')+statRow('🎭 Versatility',clamp(p.skill*.6+(hasT(p,'method')?20:0)+(p.age>40?10:0),5,99),'#6aa8ff')+statRow('😄 Charisma',clamp(p.star*.6+(hasT(p,'charismatic')?30:10),5,99),'#ff8a5c')
   :statRow('⭐ Craft',p.skill)+statRow('💜 Fame',p.fame,'#b07cff')+statRow('💡 Creativity',clamp(p.skill*.8+(hasT(p,'visionary')?20:0)+(hasT(p,'auteur')?12:0),5,99),'#6aa8ff')+statRow('🔄 Adaptability',clamp(100-p.age+(hasT(p,'efficient')?20:0),5,99),'#ff8a5c')}
  <div class="row" style="font-size:13px;margin-top:8px"><span>Best genre</span><b>${GEN[p.spec].icon} ${p.spec}</b></div></div>
 <div class="card"><h3>Traits</h3>${(p.traits||[]).length?(p.traits||[]).map(t=>{const T=TRAITS[t];return `<div class="news"><b style="color:${T.good?'var(--green)':'var(--red)'}">${T.i} ${T.l}</b> <span class="tag ${T.good?'good':'bad'}">${T.good?'Strength':'Bad habit'}</span><div class="muted" style="font-size:13px">${T.d}</div></div>`}).join(''):'<p class="muted">No notable traits.</p>'}</div>
 <div class="card"><div class="row"><h3>Career</h3><small>${car.length} credits</small></div>${car.length?shown.map(careerRow).join('')+(car.length>shown.length?`<button class="btn sm ghost" onclick="CAREER_ALL='${id}';openPerson('${id}')">Show all ${car.length}</button>`:''):'<p class="muted">🌱 Just arrived in Hollywood — no screen credits yet. Cheap, hungry and unproven.</p>'}</div>
 <button class="btn ghost" onclick="openRename('${id}')">✏️ Rename</button><button class="btn ghost" onclick="modal()">Close</button>`)}
function histFilm(i){const h=S.hist[i];if(!h)return;const ppl=[['Lead',h.lead],['Co-star',h.co],['Supporting',h.sup],['Director',h.dir],[h.tv?'Creator':'Writer',h.writer],['Composer',h.comp],['Cinematographer',h.dp]].filter(x=>x[1]);
 modal(`<div class="pcard">${h.tv?`<div class="tvthumb big">${(TV_GENRES[h.g]||{icon:'📺'}).icon}</div>`:posterSVG({title:h.title,genre:h.g,cast:{lead:h.lead}},96)}<div><h3>${esc(h.title)}</h3><p class="muted" style="font-size:13px">${h.y} · ${h.tv?'TV series · ':''}${h.g}</p>${studioBadge(h.studio)}<div class="tags">${h.tv?`<span class="tag">👁️ ${h.views}M views</span>`:`<span class="tag">🌍 ${M(h.ww)}</span>`}<span class="tag ${h.critic>=75?'good':h.critic<45?'bad':''}">🍅 ${h.critic}%</span>${h.awp?'<span class="tag hot">🏆 Best Picture</span>':''}</div></div></div>
 <div class="card"><h3>Cast & crew</h3>${ppl.map(([r,id])=>{const x=person(id);return x?`<div class="crow" onclick="openPerson('${id}')">${portrait(x,34)}<div style="flex:1"><b style="font-size:14px">${esc(x.n)}</b><div class="muted" style="font-size:12px">${r}</div></div></div>`:''}).join('')}</div><button class="btn ghost" onclick="modal()">Close</button>`)}

/* ---------- rival studios ---------- */
function rivalStats(r){const h=(S.hist||[]).filter(x=>x.studio===r.n||x.studio===r.svc);const films=h.filter(x=>!x.tv);return{h,films,shows:h.filter(x=>x.tv),gross:sum(films,x=>x.ww),awards:films.filter(x=>x.awp).length}}
function rivalsModal(){modal(`<h3>🏢 Rival studios</h3><p class="muted" style="font-size:13px">Tap a studio to see its history and upcoming slate.</p>${S.rivals.map(r=>{const st=rivalStats(r);return `<div class="card opt" onclick="rivalPage('${esc(r.n)}')">${logoSVG(rivalLogo(r),170)}<div class="row" style="margin-top:6px;font-size:13px"><span>${r.alive?'🎬 '+st.films.length+' films · 🏆 '+st.awards:'❌ Acquired'}</span><b>${M(st.gross)}</b></div></div>`}).join('')}<button class="btn ghost" onclick="modal()">Close</button>`)}
let RP_ALL=0;
function rivalPage(n){const r=rivalOf(n);if(!r)return;const st=rivalStats(r);const rnd=srng(r.n);
 const boss=r.boss||(r.boss=pick(FIRST_M.concat(FIRST_F))+' '+pick(LAST));const founded=r.founded||(r.founded=1912+Math.floor(rnd()*90));
 const up=S.rivalFilms.filter(x=>x.studio===r.n&&(x.t>tNow()||(x.t===tNow()&&(x.wk||0)>=(S.wk||0)))).sort((a,b)=>a.t-b.t||a.wk-b.wk);
 const leads={};st.films.forEach(f=>{if(f.lead)leads[f.lead]=(leads[f.lead]||0)+1});const stars=Object.keys(leads).sort((a,b)=>leads[b]-leads[a]).slice(0,5).map(person).filter(Boolean);
 const films=st.films.map(f=>({f,i:S.hist.indexOf(f)})).reverse();const shown=RP_ALL===n?films:films.slice(0,18);
 modal(`<div class="center">${logoSVG(rivalLogo(r),240)}</div><p class="muted center" style="font-size:13px;margin-top:6px">Founded ${founded} · CEO ${esc(boss)} · ${r.alive?'Active':'Acquired'}</p>
 <div class="statgrid"><div><small>Films</small><b>${st.films.length}</b></div><div class="sg-good"><small>Lifetime gross</small><b>${M(st.gross)}</b></div><div><small>Best Pictures</small><b>🏆 ${st.awards}</b></div><div><small>Streaming</small><b>${r.svc?esc(r.svc)+' · '+Math.round(r.subs)+'M':'—'}</b></div></div>
 ${stars.length?`<div class="card" style="margin-top:8px"><h3>Signature stars</h3><div style="display:flex;gap:10px;overflow-x:auto;margin-top:6px">${stars.map(x=>`<div class="center" style="width:64px;flex:0 0 auto" onclick="openPerson('${x.id}')">${portrait(x,52)}<small class="ellip" style="display:block;text-transform:none">${esc(x.n.split(' ')[0])}</small></div>`).join('')}</div></div>`:''}
 <div class="card"><h3>Coming soon</h3>${up.length?up.slice(0,8).map(x=>`<div class="crow">${posterSVG({title:x.title,genre:x.g,cast:{lead:x.lead}},34)}<div style="flex:1;min-width:0"><b class="ellip" style="display:block;font-size:14px">${esc(x.title)}${x.hype>85?' ⚠️':''}</b><div class="muted" style="font-size:12px">${GEN[x.g].icon} ${x.g} · ${fmtLong(relD(x))}</div></div></div>`).join(''):'<p class="muted">Nothing announced.</p>'}</div>
 <div class="card"><h3>Past releases</h3><div class="pgrid">${shown.map(({f,i})=>`<div onclick="histFilm(${i})">${posterSVG({title:f.title,genre:f.g,cast:{lead:f.lead}},96)}<small class="ellip" style="display:block;text-transform:none">${f.y}${f.awp?' 🏆':''} · ${M(f.ww)}</small></div>`).join('')}</div>${films.length>shown.length?`<button class="btn sm ghost" onclick="RP_ALL='${esc(n)}';rivalPage('${esc(n)}')">Show all ${films.length}</button>`:''}</div>
 ${st.shows.length?`<div class="card"><h3>TV shows</h3>${st.shows.slice().reverse().slice(0,10).map(s=>`<div class="crow" onclick="histFilm(${S.hist.indexOf(s)})"><div class="tvthumb">${(TV_GENRES[s.g]||{icon:'📺'}).icon}</div><div style="flex:1"><b style="font-size:14px">${esc(s.title)}</b><div class="muted" style="font-size:12px">${s.y} · ${s.g} · ${s.critic}%</div></div></div>`).join('')}</div>`:''}
 <button class="btn ghost" onclick="rivalsModal()">← All studios</button><button class="btn ghost" onclick="modal()">Close</button>`)}

/* ---------- 2-year calendar & date picker ---------- */
function calItems(x){const items=[];
 S.projects.filter(p=>p.releaseT===x&&p.dist!=='sell').forEach(p=>items.push({o:p,mine:1,wk:p.relWk||0,title:p.title,g:p.genre,studio:S.name,obj:p,stream:p.dist==='stream',click:`projectModal(${p.id})`}));
 S.films.filter(f=>f.releaseT===x).forEach(f=>items.push({o:f,mine:1,wk:f.relWk||0,title:f.title,g:f.genre,studio:S.name,obj:f,done:1,click:`filmModal(${f.id})`}));
 S.shows.filter(s=>s.status==='prod'&&s.readyT===x).forEach(s=>items.push({mine:1,tv:1,wk:s.premWk||0,title:s.title,g:s.genre,studio:S.name,click:`showModal(${s.id})`}));
 rivalsAt(x).forEach(r=>items.push({o:r,wk:r.wk||0,title:r.title,g:r.g,studio:r.studio,obj:{title:r.title,genre:r.g,cast:{lead:r.lead}},big:r.hype>85&&!r.lim&&!r.str,stream:r.str,lim:r.lim}));
 return items.sort((a,b)=>a.wk-b.wk)}
function calRow(it){return `<div class="crow ${it.mine?'mine':''}" ${it.click?`onclick="${it.click}"`:''}>${it.tv?`<div class="tvthumb">${TV_GENRES[it.g].icon}</div>`:posterSVG(it.obj,34)}<div style="flex:1;min-width:0"><b class="ellip" style="display:block;font-size:14px">${it.tv?'':GEN[it.g].icon+' '}${esc(it.title)}${it.big?' ⚠️':''}</b><div class="muted" style="font-size:12px">${it.tv?'📺 TV premiere':it.stream?'📡 Streaming':it.lim?'🌏 Limited release':'🎟️ In cinemas'} · ${fmtDay(it.o?relD(it.o):dateOf(it.cal,it.wk,5))}${it.done?' · released':''}</div></div>${studioBadge(it.studio)}</div>`}
function viewCal(){const t=tNow();let h=`<h2>Release calendar</h2><p class="muted" style="font-size:13px;margin-bottom:10px">Two years of announced releases. ⚠️ = tentpole · tap a studio to see its history.</p>`;
 for(let x=t;x<t+24;x++){const its=calItems(x).map(i=>Object.assign(i,{cal:x}));
  h+=`<div class="card"><div class="row"><b>${tLabel(x)}</b><small style="text-align:right">${CAL[x%12].tag}</small></div>${its.map(calRow).join('')}${!its.length?'<p class="muted" style="font-size:13px;margin-top:6px">Wide open.</p>':''}</div>`}
 return h}
function dateList(g,from,cur,action){let h='';const wiz=action.includes('W.releaseT');const pid=(action.match(/setDate\((\d+)/)||[])[1];
 const curWk=wiz?(W.relWk||0):pid?((S.projects.find(p=>p.id==pid)||{}).relWk||0):0;
 for(let t=from;t<from+24;t++){const m=t%12;const fit=CAL[m].mult*(CAL[m].g[g]||1);const riv=rivalsAt(t);const mine=S.projects.filter(p=>p.releaseT===t&&p.dist!=='stream'&&(!wiz||true)&&String(p.id)!==String(pid));const cf=compFactor(t);const sel=cur===t;
  h+=`<div class="card opt ${sel?'sel':''}" onclick="${action.replace('%T',t)}"><div class="row"><b>${tLabel(t)}</b><span class="tag ${fit>=1.2?'hot':fit<.85?'bad':''}">${fit>=1.2?'🔥 Great fit':fit<.85?'Weak fit':'OK fit'} ×${fit.toFixed(2)}</span></div><div class="muted" style="font-size:12px;margin-top:3px">${CAL[m].tag} · competition ${cf>1.05?'light':cf<.8?'brutal':cf<.92?'crowded':'normal'}</div>
  ${riv.length||mine.length?`<div style="margin-top:4px">${riv.map(r=>`<div class="row" style="font-size:12px;margin-top:3px"><span class="ellip">${GEN[r.g].icon} ${esc(r.title)}${r.hype>85?' ⚠️':''} · ${fmtDay(relD(r))}</span>${studioBadge(r.studio,1)}</div>`).join('')}${mine.map(p=>`<div class="row" style="font-size:12px;margin-top:3px"><span class="ellip gold">${GEN[p.genre].icon} ${esc(p.title)}</span>${studioBadge(S.name,1)}</div>`).join('')}</div>`:''}
  ${sel?`<div class="weeks" onclick="event.stopPropagation()">${[0,1,2,3].map(k=>{const clash=riv.some(r=>(r.wk||0)===k&&r.hype>85);const act=wiz?`W.relWk=${k};wiz()`:pid?`setWk(${pid},${k})`:'';return `<button class="${curWk===k?'on':''}" onclick="${act}">${fmtDay(dateOf(t,k,5))}${clash?'<br><small>⚔️ clash</small>':''}</button>`}).join('')}</div><p class="muted" style="font-size:11px;margin-top:4px">Pick your opening Friday. Avoid ⚔️ weeks where a rival tentpole opens.</p>`:''}</div>`}
 return h}
function setWk(id,k){const p=S.projects.find(x=>x.id===id);if(!p)return;p.relWk=k;save();moveDate(id)}
const _setDate=setDate;setDate=function(id,t){const p=S.projects.find(x=>x.id===id);const keep=p.relWk;_setDate(id,t);if(p)p.relWk=keep||0;moveDate(id)};
const _gl5=greenlight;greenlight=function(){const n=S.projects.length;const wk=W.relWk||0;_gl5();if(S.projects.length>n)S.projects[S.projects.length-1].relWk=wk};

/* ---------- live status ---------- */
const STG=[['pre','Pre-production','📝','#8e6cff'],['shoot','Filming','🎬','#ff8a3d'],['post','Post-production','🎞️','#3d8bff'],['ready','Release','🍿','#1fae63']];
function stageInfo(p){const ph=phaseOf(p);const e=tNow()-p.startT;const i=STG.findIndex(s=>s[0]===ph);
 const mo=ph==='pre'?[e+1,p.sch.pre]:ph==='shoot'?[e-p.sch.pre+1,p.sch.shoot]:ph==='post'?[e-p.sch.pre-p.sch.shoot+1,p.sch.total-p.sch.pre-p.sch.shoot]:null;return{ph,i,mo}}
function statusBadge(p){if(p.dist==='sell')return '<span class="stbadge" style="--c:#9b59b6">💰 Sold to a streamer</span>';const s=stageInfo(p);const st=STG[s.i];
 const txt=s.ph==='ready'?`Ready · out ${fmtDay(relD(p))}`:`${st[1]}${s.mo?` · month ${Math.max(1,s.mo[0])} of ${Math.max(1,s.mo[1])}`:''}`;return `<span class="stbadge" style="--c:${st[3]}">${st[2]} ${txt}</span>`}
function stageBar(p){const s=stageInfo(p);return `<div class="stg">${STG.map((st,i)=>`<div class="${i<s.i?'done':i===s.i?'cur':''}" style="--c:${st[3]}"><i></i><span>${i<s.i?'✔ ':i===s.i?st[2]+' ':''}${st[1]}</span></div>`).join('')}</div><div style="margin-top:6px">${statusBadge(p)}</div>`}

/* ---------- social media ---------- */
const PLATFORMS=[
 {k:'chirp',n:'Chirp',i:'🐦',c:'#1d9bf0',d:'Fast news & fan talk. Buzz quickly — but posts can backfire.',risk:.08,viral:.04,fit:{Thriller:1.2,Drama:1.1,Biopic:1.2,Superhero:1.1},posts:[['Teaser post',.2,1],['Reply to fans',.05,.6],['Cast live Q&A',.6,1.6]]},
 {k:'clipz',n:'Clipz',i:'🎵',c:'#ff2d6f',d:'Short videos. Young audience; clips can explode overnight.',risk:.03,viral:.14,fit:{Comedy:1.4,Horror:1.3,Animation:1.3,Romance:1.1},posts:[['Dance challenge',1,2],['Behind-the-scenes clip',.4,1.2],['Blooper reel',.5,1.4]]},
 {k:'vid',n:'VidStream',i:'▶️',c:'#7b2cff',d:'Long-form video. Trailers and featurettes rack up steady views.',risk:.02,viral:.05,fit:{Action:1.3,Superhero:1.4,'Sci-Fi':1.3},posts:[['Teaser trailer',1,1.5],['Making-of featurette',.6,1.1],['Cast interview',.4,.9]]},
 {k:'snap',n:'Snapgram',i:'📸',c:'#e1306c',d:'Photos and stories. Star power matters most here.',risk:.04,viral:.06,fit:{Romance:1.3,Drama:1.1,Comedy:1.1,Biopic:1.1},posts:[['Character poster',.3,.9],['Set photos',.2,.8],['Star selfie',.1,1]]}];
function promoTargets(){return S.projects.filter(p=>p.dist!=='sell').map(p=>({k:'p',id:p.id,title:p.title,obj:p})).concat(S.shows.filter(s=>s.status==='prod').map(s=>({k:'s',id:s.id,title:s.title,s})))}
function socialPick(){const ts=promoTargets();modal(`<h3>📱 Social media</h3><p class="muted" style="font-size:13px">Promote an upcoming film or show. One post per platform per week.</p>${ts.length?ts.map(t=>`<div class="card opt" onclick="promo('${t.k}',${t.id})"><div class="pcard">${t.obj?posterSVG(t.obj,44,t.obj.poster||defaultPoster(t.obj)):`<div class="tvthumb">${TV_GENRES[t.s.genre].icon}</div>`}<div><b>${esc(t.title)}</b><div class="muted" style="font-size:12px">${t.obj?'Film · buzz '+Math.round(t.obj.hype):'TV series · buzz '+Math.round(t.s.buzz||0)}</div></div></div></div>`).join(''):'<p class="muted">Nothing to promote yet — make a movie or show first.</p>'}
 ${S.social.length?`<div class="card"><h3>Your feed</h3>${S.social.slice(0,6).map(x=>`<div class="news" style="font-size:13px"><b>@${esc(x.h)}</b> ${x.s} <span class="muted">· ❤️ ${fmtC(x.l)}</span></div>`).join('')}</div>`:''}<button class="btn ghost" onclick="modal()">Close</button>`)}
function promoTgt(k,id){return k==='p'?S.projects.find(x=>x.id===id):S.shows.find(x=>x.id===id)}
function tgtStar(k,o){if(k==='p')return castStats(o).star;const L=person(o.lead);return L?L.star:30}
function promo(k,id,res){const o=promoTgt(k,id);if(!o)return modal();o.sp=o.sp||{};const g=k==='p'?o.genre:null;const now=wIdx();
 modal(`<h3>📱 Promote ${esc(o.title)}</h3><p class="muted" style="font-size:13px">Buzz now: <b>${Math.round(k==='p'?o.hype:(o.buzz||0))}</b> · cast star power ${Math.round(tgtStar(k,o))}</p>${res||''}
 ${PLATFORMS.map(pl=>{const used=o.sp[pl.k]===now;const fit=(g&&pl.fit[g])||1;return `<div class="card plat" style="--c:${pl.c}"><div class="row"><b style="color:${pl.c}">${pl.i} ${pl.n}</b>${fit>1?`<span class="tag good">great for ${g}</span>`:''}</div><p class="muted" style="font-size:12px;margin:4px 0">${pl.d}</p>
  ${used?'<span class="tag">✔ Posted this week — come back next week</span>':`<div class="chips">${pl.posts.map((ps,i)=>`<button onclick="doPost('${k}',${id},'${pl.k}',${i})">${ps[0]}<br><small>${ps[1]?M(ps[1]*I()):'free'}</small></button>`).join('')}</div>`}</div>`}).join('')}
 <button class="btn ghost" onclick="socialPick()">← Back</button><button class="btn ghost" onclick="modal()">Close</button>`)}
function doPost(k,id,pk,i){const o=promoTgt(k,id);const pl=PLATFORMS.find(x=>x.k===pk);const ps=pl.posts[i];const cost=+(ps[1]*I()).toFixed(2);S.cash-=cost;o.sp=o.sp||{};o.sp[pk]=wIdx();
 const g=k==='p'?o.genre:null;const fit=(g&&pl.fit[g])||1;const star=tgtStar(k,o);let reach=ps[2]*fit*(.4+star/60)*R(.5,1.5)*(pk==='snap'&&i===2?star/50:1);
 let tag='',bad=false;if(Math.random()<pl.viral*fit){reach*=4;tag='🔥 VIRAL'}else if(Math.random()<pl.risk){bad=true;tag='😬 BACKLASH'}
 const views=Math.round(reach*RI(180000,900000));const likes=Math.round(views*R(.04,.12));const shares=Math.round(likes*R(.05,.25));let gain=+(clamp(reach*2.2,.5,12)).toFixed(1);if(bad){gain=-RI(2,5);gainRep(-.5)}
 if(k==='p')o.hype+=gain;else o.buzz=(o.buzz||0)+gain*1.3;
 const coms=bad?[`this is so tone-deaf 🙄`,`who approved this post??`,`ratio`]:[`ok I'm seated for ${o.title} 🍿`,`THE CAST 😭😭`,`day one, no question`,`this looks insane`,`not me watching this 20 times`];
 post(S.name.replace(/\s+/g,'')+'_'+pl.n,`${ps[0].toLowerCase()} for ${esc(o.title)} ${pl.i}`,likes);
 if(tag==='🔥 VIRAL')addNews(`🔥 ${esc(S.name)}'s ${ps[0].toLowerCase()} for <b>${esc(o.title)}</b> goes viral on ${pl.n}.`);
 sfx(bad?'flop':'cash');save();
 promo(k,id,`<div class="feed" style="--c:${pl.c}"><div class="row"><b>${pl.i} @${esc(S.name.replace(/\s+/g,''))}</b>${tag?`<span class="tag ${bad?'bad':'hot'}">${tag}</span>`:''}</div><p style="margin:6px 0">${ps[0]} — <b>${esc(o.title)}</b></p><div class="row" style="font-size:13px"><span>👁️ ${fmtC(views)}</span><span>❤️ ${fmtC(likes)}</span><span>🔁 ${fmtC(shares)}</span><b class="${gain>=0?'pos':'neg'}">${gain>=0?'+':''}${gain} buzz</b></div>${shuffle(coms).slice(0,2).map(c=>`<div class="muted" style="font-size:12px;margin-top:4px">@${esc(pick(HANDLES))}: ${esc(c)}</div>`).join('')}</div>`)}

/* ---------- TV scheduling ---------- */
function tvBaseT(){return tNow()+3+Math.ceil((TW.eps||8)/4)}
function epDates(premT,wk,day,mode,n){const d0=dateOf(premT,wk,day);const o=[];for(let i=0;i<n;i++)o.push(mode==='weekly'?addDays(d0,7*i):d0);return o}
function tvSchedCard(){if(TW.delay==null)TW.delay=0;if(TW.premWk==null)TW.premWk=0;if(TW.day==null)TW.day=5;const base=tvBaseT();const pt=base+TW.delay;
 const ds=epDates(pt,TW.premWk,TW.day,TW.mode,TW.eps||8);
 return `<div class="card"><small>📅 Premiere schedule</small><p class="muted" style="font-size:12px;margin:4px 0">Production wraps by ${tLabel(base)}. Choose when episode 1 airs.</p>
 <div class="chips">${[0,1,2,3,4,5,6].map(d=>`<button class="${TW.delay===d?'on':''}" onclick="TW.delay=${d};tvWiz()">${tLabel(base+d)}</button>`).join('')}</div>
 <div class="weeks" style="margin-top:6px">${[0,1,2,3].map(k=>`<button class="${TW.premWk===k?'on':''}" onclick="TW.premWk=${k};tvWiz()">Week ${k+1}<br><small>${fmtDay(dateOf(pt,k,TW.day))}</small></button>`).join('')}</div>
 <small style="display:block;margin-top:8px">${TW.mode==='weekly'?'New episode every':'Drop day'}</small><div class="chips">${[1,2,3,4,5,6,0].map(d=>`<button class="${TW.day===d?'on':''}" onclick="TW.day=${d};tvWiz()">${DOW[d]}</button>`).join('')}</div>
 <div class="sched">${ds.map((d,i)=>`<div class="row"><span class="ellip"><b>Ep ${i+1}</b> · ${esc((TW.epNames||[])[i]||'Episode '+(i+1))}${(TW.cliff||[])[i]?' ❓':''}</span><b>${fmtDay(d)}</b></div>`).join('')}</div>
 <p class="muted" style="font-size:12px;margin-top:6px">${TW.mode==='weekly'?`Finale airs ${fmtLong(ds[ds.length-1])}.`:`All ${ds.length} episodes drop ${fmtLong(ds[0])}.`}</p></div>`}
function showSchedHTML(s){let premT,wk,day,mode,names,label;const last=s.seasons[s.seasons.length-1];
 if(s.status==='prod'){premT=s.readyT;wk=s.premWk||0;day=s.day==null?5:s.day;mode=s.mode;names=s.epNames||[];label=`Season ${s.season} schedule`}
 else if(last){premT=last.t;wk=last.wk||0;day=last.day==null?5:last.day;mode=last.mode||s.mode;names=last.epNames||s.epNames||[];label=`Season ${last.n} episodes`}else return '';
 const ds=epDates(premT,wk,day,mode,s.eps);const nowD=curDate();
 return `<div class="card"><h3>📅 ${label}</h3><p class="muted" style="font-size:12px">${mode==='weekly'?'Weekly · every '+DOW[day]:'Binge drop'}</p><div class="sched">${ds.map((d,i)=>`<div class="row"><span class="ellip"><b>Ep ${i+1}</b> · ${esc(names[i]||'Episode '+(i+1))}${last&&s.status!=='prod'&&last.epViews?` <span class="muted">· ${last.epViews[i]}M</span>`:''}</span><b class="${d<=nowD?'pos':''}">${d<=nowD?'✔ ':''}${fmtDay(d)}</b></div>`).join('')}</div></div>`}
const _sm5=showModal;showModal=function(id){_sm5(id);const s=S.shows.find(x=>x.id===id);const box=document.querySelector('#modal .modal>div');if(s&&box&&box.insertAdjacentHTML){const h=showSchedHTML(s);if(h)box.insertAdjacentHTML('beforeend',h)}};
function tvPremiere(sh){const last=sh.seasons[sh.seasons.length-1];if(!last)return runQueue();const ds=epDates(last.t,last.wk||0,last.day==null?5:last.day,last.mode||sh.mode,sh.eps);
 TAB='hq';render();sfx('drum');
 modal(`<div class="center"><div style="font-size:54px">${TV_GENRES[sh.genre].icon}</div><small>📺 Premiere night · ${fmtLong(ds[0])}</small><h3 style="margin-top:4px">${esc(sh.title)}</h3><p class="muted" style="font-size:13px">Season ${last.n} · ${sh.mode==='weekly'?'weekly every '+DOW[last.day==null?5:last.day]:'all '+sh.eps+' episodes at once'}</p>
 <div class="statgrid"><div class="${last.critic>=60?'sg-good':'sg-bad'}"><small>Critics</small><b>${last.critic}%</b></div><div><small>First-month views</small><b>${last.views}M</b></div><div><small>Ep 1 · ${esc((last.epNames||[])[0]||'Pilot')}</small><b>${(last.epViews||[])[0]||'—'}M</b></div><div><small>${sh.mode==='weekly'?'Finale':'Drop'}</small><b>${fmtDay(ds[ds.length-1])}</b></div></div></div>
 <button class="btn gold" onclick="modal();runQueue()">Continue</button>`)}
