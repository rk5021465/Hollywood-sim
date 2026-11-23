/* ===================== v22 — role-based casting, actor craft & tastes, staff specialists, pre-sales, weekly burn, lot ladder, Hall of Fame ===================== */

/* ---------- actor craft (7 skills) & genre tastes ---------- */
const E34=e=>{try{if(typeof document!=="undefined"&&typeof document.querySelector==="function"&&document.body&&document.body.classList)console.error(e)}catch(_){}};
const SK7=[['voi','Voice'],['fac','Facial'],['phy','Physical'],['hum','Humour'],['imp','Improv'],['pro','Discipline'],['con','Presence']];
const SK7L=Object.fromEntries(SK7);
const KEYSK={Action:['phy','con','pro'],Superhero:['phy','con','fac'],Comedy:['hum','imp','voi'],Drama:['fac','voi','pro'],Horror:['fac','phy','con'],'Sci-Fi':['con','pro','fac'],Animation:['voi','hum','imp'],Romance:['fac','con','voi'],Thriller:['fac','pro','con'],Biopic:['voi','fac','pro']};
function sk7(a){if(!a)return null;if(a.sk7)return a.sk7;const h=hashStr((a.id||a.n)+'sk7');const o={};SK7.forEach(([k],i)=>{const r=((h>>>(i*4))&15)-7.5;o[k]=clamp(Math.round((a.skill||55)*.88+r*3.4),10,99)});const ks=KEYSK[a.spec];if(ks)ks.forEach(k=>o[k]=clamp(o[k]+4,10,99));a.sk7=o;return o}
function taste(a){if(!a)return{likes:[],avoid:[]};if(a.tst)return a.tst;const h=hashStr((a.id||a.n)+'tst');const gs=GENRES.filter(g=>g!==a.spec);const l2=gs[h%gs.length];const rest=gs.filter(g=>g!==l2);a.tst={likes:[a.spec,l2].filter(Boolean),avoid:[rest[(h>>>8)%rest.length]]};return a.tst}
function fitFor(a,g){if(!a)return 50;const s=sk7(a),ks=KEYSK[g]||['fac','voi','pro'];let f=sum(ks,k=>s[k])/ks.length;const t=taste(a);if(t.likes.includes(g))f+=4;if(t.avoid.includes(g))f-=9;return clamp(Math.round(f),1,99)}
const rawFee=a=>{try{return (0.3+Math.pow(a.star/100,2.3)*22)*feeMult()*tFee(a)*(S.staff34&&S.staff34.cast?.94:1)}catch(e){return actorFee(a)}};
const MF=v=>v>0&&v<.0095?'$'+Math.max(1,Math.round(v*1000))+'K':M(v);
const fitC=f=>f>=80?'var(--green)':f>=62?'var(--gold)':'var(--red)';

castStats=(function(o){return function(p){const r=o.apply(this,arguments);try{const g=p&&(p.genre||(p.script&&p.script.genre));if(g&&r&&r.all&&r.all.length){const f=sum(r.all,a=>fitFor(a,g))/r.all.length;r.fit=f;r.acting=r.acting*.8+f*.2}}catch(e){}return r}})(castStats);

/* ---------- character roles per genre ---------- */
const ROLE34={
 Action:{lead:[['The Hero','M',24,50],['The Agent','F',24,46]],co:[['The Partner','A',22,50],['The Villain','M',32,65]],sup:[['The Handler','A',40,70],['The Hacker','A',19,34],['The Informant','A',25,60],['The Old Mentor','A',50,78]],bit:[['Henchman','M',22,45],['Getaway Driver','A',20,45]]},
 Superhero:{lead:[['The Masked Hero','A',22,42]],co:[['The Nemesis','A',30,62],['The Sidekick','A',18,30]],sup:[['The Scientist','A',35,70],['The Love Interest','A',22,40],['The Commissioner','A',45,72],['The Aunt','F',50,80]],bit:[['News Anchor','A',28,60],['Street Kid','A',12,17]]},
 Comedy:{lead:[['The Lovable Loser','A',22,45],['The Best Friend','A',22,45]],co:[['The Boss','A',35,65],['The Ex','A',22,45]],sup:[['The Roommate','A',20,40],['The Mother-in-Law','F',50,80],['The Neighbour','A',30,70],['The Cousin','A',18,40]],bit:[['Waiter','A',18,50],['Mail Carrier','A',25,60]]},
 Drama:{lead:[['The Protagonist','A',25,55]],co:[['The Spouse','A',25,55],['The Estranged Sibling','A',25,55]],sup:[['The Mentor','A',40,72],['The Grandmother','F',58,85],['The Mother','F',36,65],['The Therapist','A',32,62],['The Doctor','A',30,65]],bit:[['Bartender','A',21,50],['Night Nurse','A',22,55]]},
 Horror:{lead:[['The Final Survivor','F',18,32]],co:[['The Skeptic','A',20,40],['The Thing in the Dark','A',25,60]],sup:[['The Priest','M',45,75],['The Caretaker','A',50,80],['The Best Friend','A',18,30],['The Little Sister','F',8,14]],bit:[['Gas Station Clerk','A',20,60],['First Victim','A',18,30]]},
 'Sci-Fi':{lead:[['The Captain','A',30,55]],co:[['The Engineer','A',25,50],['The Android','A',20,45]],sup:[['The Commander','A',45,70],['The Pilot','A',22,40],['The Scientist','A',35,65],['The Stowaway','A',12,18]],bit:[['Comms Officer','A',22,45],['Colonist','A',20,60]]},
 Animation:{lead:[['The Young Hero (voice)','A',10,40]],co:[['The Funny Sidekick (voice)','A',18,60],['The Villain (voice)','A',30,70]],sup:[['The Wise Elder (voice)','A',50,85],['The Parent (voice)','A',30,60],['The Rival (voice)','A',12,40]],bit:[['Townsfolk (voice)','A',18,70],['The Narrator','A',40,80]]},
 Romance:{lead:[['The Dreamer','F',22,42],['The Charmer','M',24,46]],co:[['The Best Friend','A',22,45]],sup:[['The Ex','A',24,46],['The Grandmother','F',58,85],['The Matchmaker','A',30,65],['The Little Brother','M',10,17]],bit:[['Florist','A',20,60],['Wedding Singer','A',22,55]]},
 Thriller:{lead:[['The Detective','A',30,58]],co:[['The Suspect','A',25,55],['The Journalist','A',24,50]],sup:[['The Captain','A',45,70],['The Witness','A',18,70],['The Lawyer','A',35,65],['The Hacker','A',19,34]],bit:[['Doorman','M',30,65],['Coroner','A',35,70]]},
 Biopic:{lead:[['The Legend','A',25,60]],co:[['The Spouse','A',25,60],['The Manager','A',35,65]],sup:[['The Rival','A',25,55],['The Father','M',45,75],['The Mother','F',40,70],['The Young Legend','A',9,15]],bit:[['Reporter','A',25,60],['Fan at the Stage Door','A',16,40]]}};
const TIER34={lead:'LEAD',co:'CO-STAR',sup:'SUPPORTING',bit:'BIT PART'};
function rng34(seed){let s=seed>>>0||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function mkRoles(sc){const T=ROLE34[sc.genre]||ROLE34.Drama;const r=rng34(hashStr(sc.title+sc.genre));const take=(arr,n)=>{const a=arr.slice();const out=[];while(out.length<n&&a.length)out.push(a.splice(Math.floor(r()*a.length),1)[0]);return out};
 const nl=T.lead.length>1&&(sc.genre==='Romance'||r()<.4)?2:1,nc=Math.min(T.co.length,r()<.55?2:1),ns=Math.min(T.sup.length,2+Math.floor(r()*2)),nb=1;
 const mk=(x,tier)=>({n:x[0],g:x[1],a0:x[2],a1:x[3],tier,slot:tier==='bit'?'sup':tier});
 return [].concat(take(T.lead,nl).map(x=>mk(x,'lead')),take(T.co,nc).map(x=>mk(x,'co')),take(T.sup,ns).map(x=>mk(x,'sup')),take(T.bit,nb).map(x=>mk(x,'bit')))}
function ensureRoles(){if(!W||!W.script)return;if(!W.roles||W.rolesFor!==W.script.title){W.roles=mkRoles(W.script);W.rolesFor=W.script.title;W.rm={}}}
function slotIds(slot){return slot==='lead'?[W.lead].concat(W.leads2||[]).filter(Boolean):slot==='co'?[W.co].concat(W.cos2||[]).filter(Boolean):(W.sup||[]).slice()}
function castIds(){return [W.lead].concat(W.leads2||[],[W.co],W.cos2||[],W.sup||[]).filter(Boolean)}
function roleAssign(){ensureRoles();const out=W.roles.map(()=>null);const used=new Set();
 W.roles.forEach((r,i)=>{const id=W.rm[i];if(id&&slotIds(r.slot).includes(id)&&!used.has(id)){out[i]=id;used.add(id)}else delete W.rm[i]});
 W.roles.forEach((r,i)=>{if(out[i])return;const id=slotIds(r.slot).find(x=>!used.has(x));if(id){out[i]=id;used.add(id)}});return out}
const ageOK=(a,r)=>(a.age||30)>=r.a0-2&&(a.age||30)<=r.a1+2;
const genOK=(a,r)=>r.g==='A'||a.g===r.g;
function payEst(r){const band=r.tier==='lead'?[55,100]:r.tier==='co'?[35,75]:r.tier==='sup'?[15,50]:[0,25];const L=S.people.actors.filter(a=>genOK(a,r)&&ageOK(a,r)&&a.star>=band[0]&&a.star<=band[1]);if(!L.length)return r.tier==='bit'?.01:.2;const fs=L.map(a=>rawFee(a)).sort((a,b)=>a-b);return r.tier==='bit'?fs[0]*.15:fs[Math.floor(fs.length/2)]}
function compLevel(g){const t=tNow();const L=(S.rivalFilms||[]).filter(r=>r.g===g&&r.t>=t+3&&r.t<=t+12);return clamp(Math.round(L.length*6+sum(L,r=>r.hype)/22),1,100)}

function roleBoard(){ensureRoles();const sc=W.script,g=sc.genre,A=roleAssign();const ks=(KEYSK[g]||[]).map(k=>SK7L[k]).join(' + ');
 const shootW=Math.max(4,Math.round((GEN[g].days||30)/5));const est=(GEN[g].budget||20)*I();
 const row=(r,i)=>{const id=A[i],p=id?person(id):null;const d=id&&W.deals&&W.deals[id];const fee=d?d.fee:p?rawFee(p):payEst(r);
  const warn=p?(!genOK(p,r)?'Gender rewrite':!ageOK(p,r)?'Age stretch':''):'';
  return `<div class="rb34-r ${p?'on':''}"><button class="rb34-ph" onclick="${p?`openPerson('${id}')`:`rolePick(${i})`}">${p?portrait(p,46):'<span>+</span>'}</button><div class="rb34-m"><b>${esc(r.n)}</b><small>${TIER34[r.tier]} · ${r.g==='A'?'Any gender':r.g==='F'?'Female':'Male'} · ${r.a0}–${r.a1} yrs</small>${p?`<em>${esc(p.n)} <i style="color:${fitC(fitFor(p,g))}">· fit ${fitFor(p,g)}</i>${warn?` <i class="neg">· ${warn}</i>`:''}</em>`:''}<span class="rb34-pay">${d?'':'≈ '}${MF(fee)}</span></div><button class="rb34-c" onclick="${p?`fireCast('${id}')`:`rolePick(${i})`}">${p?'RECAST':'CAST'}</button></div>`};
 const empty=W.roles.filter((r,i)=>!A[i]&&(r.tier==='sup'||r.tier==='bit')).length;
 return `<div class="rb34"><div class="rb34-h"><b>${esc(sc.title)}</b><small>${esc(S.name)}</small></div>
 <div class="rb34-t"><div><span>Type</span><i>MOVIE — ${esc(g)}</i></div><div><span>Typical budget</span><i>${M(est)}</i></div><div><span>Shoot</span><i>~${shootW} weeks</i></div><div><span>Key skills</span><i>${ks}</i></div><div><span>Competition level</span><i>${compLevel(g)}/100</i></div></div>
 <div class="rb34-k">CAST — ${W.roles.length} ROLES</div>${W.roles.map(row).join('')}
 ${empty?`<button class="btn ghost sm" style="width:100%;margin-top:8px" onclick="autoSmall()">✨ Auto-cast ${empty} small role${empty>1?'s':''}${S.staff34&&S.staff34.cast?' (casting director picks)':''}</button>`:''}</div>
 <div class="rb34-k" style="margin-top:14px">BROWSE ALL ACTORS</div>`}

function rolePick(i,all){ensureRoles();const r=W.roles[i];if(!r)return;const g=W.script.genre;const cast=castIds();
 let L=S.people.actors.filter(a=>!cast.includes(a.id));if(!all)L=L.filter(a=>genOK(a,r)&&ageOK(a,r));
 const blk=a=>lockA(a)||busy(a)||a.snub>=tNow();
 const sc=a=>{const f=fitFor(a,g);return r.tier==='lead'||r.tier==='co'?f*.55+a.star*.45:r.tier==='sup'?f*.8+a.star*.2:f*.6-rawFee(a)*40/Math.max(.05,I())};
 L.sort((a,b)=>(blk(a)-blk(b))||sc(b)-sc(a));const n=W._rpN||40;
 modal(`<div class="rp34"><h3>${esc(r.n)}</h3><p class="muted" style="font-size:13px;margin:2px 0 10px">${TIER34[r.tier]} · ${r.g==='A'?'Any gender':r.g==='F'?'Female':'Male'} · ${r.a0}–${r.a1} yrs · key skills ${(KEYSK[g]||[]).map(k=>SK7L[k]).join(', ')}</p>
 <div class="chips" style="margin-bottom:8px"><button class="${!all?'on':''}" onclick="W._rpN=40;rolePick(${i})">Matches the role</button><button class="${all?'on':''}" onclick="W._rpN=40;rolePick(${i},1)">Everyone</button></div>
 ${L.slice(0,n).map(a=>{const f=fitFor(a,g),b=blk(a);const why=b?(a.snub>=tNow()?'Refuses to talk':busy(a)?'Busy':(typeof availA==='function'?availA(a).why:'Out of reach')):'';const s=sk7(a);
  return `<div class="rp34-r ${b?'off':''}" onclick="${b?'':`modal();W._ri=${i};negotiate('${a.id}','actors','${r.slot}')`}">${portrait(a,44)}<div class="rp34-m"><b>${esc(a.n)}${a.gem?' <span class="tag good">💎 Scout pick</span>':''}</b><small>${typeof tierOfA==='function'?({A:'A-list',B:'B-list',M:'Working',R:'Rising',C:'Character',K:'Young'}[tierOfA(a)]||''):''} · ${a.age}y · ★ ${a.star} · acting ${a.skill}</small><div class="rp34-s">${(KEYSK[g]||[]).map(k=>`<span>${SK7L[k]} <b>${s[k]}</b></span>`).join('')}</div>${why?`<span class="tag bad">${esc(why)}</span>`:''}</div><div class="rp34-f"><i style="color:${fitC(f)}">${f}</i><small>fit</small><b>${MF(rawFee(a))}</b></div></div>`}).join('')||'<p class="muted">No one fits. Try “Everyone”.</p>'}
 ${L.length>n?`<button class="btn ghost" onclick="W._rpN=${n+40};rolePick(${i}${all?',1':''})">Show more (${L.length-n} left)</button>`:''}</div><button class="btn ghost" onclick="modal()">Close</button>`)}

function autoSmall(){ensureRoles();const A=roleAssign();const g=W.script.genre;const pro=S.staff34&&S.staff34.cast;let n=0;
 W.roles.forEach((r,i)=>{if(A[i]||(r.tier!=='sup'&&r.tier!=='bit'))return;if((W.sup||[]).length>=6)return;const cast=castIds();
  const L=S.people.actors.filter(a=>!cast.includes(a.id)&&genOK(a,r)&&ageOK(a,r)&&!lockA(a)&&!busy(a)&&!(a.snub>=tNow())&&(r.tier==='bit'?a.star<=30:a.star<=55));
  L.sort((a,b)=>pro?(fitFor(b,g)-fitFor(a,g)):(actorFee(a)-actorFee(b))+(fitFor(b,g)-fitFor(a,g))*.004);const a=L[0];if(a){W.sup.push(a.id);W.rm[i]=a.id;n++}});
 toast(n?`🎭 ${n} small role${n>1?'s':''} cast`:'No available actors fit those roles');wiz()}

assignCast=(function(o){return function(id,slot){o.apply(this,arguments);try{if(W&&W._ri!=null){ensureRoles();W.rm[W._ri]=id;W._ri=null}}catch(e){}}})(assignCast);
fireCast=(function(o){return function(id){try{if(W&&W.rm)Object.keys(W.rm).forEach(k=>{if(W.rm[k]===id)delete W.rm[k]})}catch(e){}return o.apply(this,arguments)}})(fireCast);

wiz=(function(o){return function(){const r=o.apply(this,arguments);try{if(W&&W.step===2&&W.script&&!W._kind){const h=[...document.querySelectorAll('#app h2')].find(x=>/Casting/.test(x.textContent));if(h&&!document.querySelector('#app .rb34'))h.insertAdjacentHTML('afterend',roleBoard())}
 if(W&&W.step===5&&W.script&&!W._kind)presaleCard()}catch(e){E34(e)}return r}})(wiz);

/* ---------- person page: craft & tastes ---------- */
openPerson=(function(o){return function(id){o(id);try{const x=person(id);if(!x||roleOf(x)!=='actors')return;const m=document.querySelector('#modal');if(!m||m.querySelector('.cr34'))return;const s=sk7(x),t=taste(x);
 const html=`<div class="card cr34"><div class="row"><b>🎭 Craft</b><small class="muted">acting ${x.skill}</small></div><div class="cr34-g">${SK7.map(([k,l])=>`<div><span>${l}</span><i><u style="width:${s[k]}%;background:${fitC(s[k])}"></u></i><b>${s[k]}</b></div>`).join('')}</div>
 <div class="cr34-t"><span>❤️ Loves</span>${t.likes.map(g=>`<em class="tag good">${GEN[g]?GEN[g].icon:''} ${g}</em>`).join('')}</div><div class="cr34-t"><span>🙅 Avoids</span>${t.avoid.map(g=>`<em class="tag bad">${GEN[g]?GEN[g].icon:''} ${g}</em>`).join('')}</div>${x.gem?'<p class="muted" style="font-size:12px;margin-top:6px">💎 Your talent scout flagged this actor as a hidden gem.</p>':''}</div>`;
 const st=m.querySelector('.sticky2');if(st)st.insertAdjacentHTML('beforebegin',html);else{const c=m.querySelector('.modal>div,.modal');if(c)c.insertAdjacentHTML('beforeend',html)}}catch(e){E34(e)}}})(openPerson);

/* ---------- staff specialists ---------- */
const STAFF34=[{k:'scout',em:'🔍',r:'Talent Scout',pay:.04,rep:10,d:'Each month, finds a skilled actor nobody has noticed yet and sends you their file.'},
 {k:'pub',em:'📰',r:'Publicist',pay:.06,rep:20,d:'Quietly buries most scandals before the press gets them, and lifts buzz on every release.'},
 {k:'cast',em:'🎭',r:'Casting Director',pay:.05,rep:15,d:'Actors ask 6% less, and auto-casting picks the best fit instead of the cheapest.'}];
function staffPay(){const s=S.staff34||{};return sum(STAFF34,x=>s[x.k]?x.pay*I():0)}
overhead=(function(o){return function(){return +(o.apply(this,arguments)+staffPay()).toFixed(2)}})(overhead);
actorFee=(function(o){return function(a){const f=o(a);return S&&S.staff34&&S.staff34.cast?+(f*.94).toFixed(2):f}})(actorFee);
function staffHire(k){S.staff34=S.staff34||{};const x=STAFF34.find(y=>y.k===k);if(!x)return;if(S.staff34[k]){S.staff34[k]=0;toast(`${x.r} let go`)}else{if(S.rep<x.rep)return toast(`Needs prestige ${x.rep}`);S.staff34[k]=tNow()+1;try{diary(x.em,`Hired a ${x.r}`,x.d)}catch(e){}toast(`${x.em} ${x.r} hired`)}save();diaryView()}
function staffHTML(){const s=S.staff34||{};return `<div class="sec"><h2>Specialists</h2></div><p class="muted" style="font-size:12.5px;margin:-4px 2px 8px">Hire people to take chores off your desk. Salaries come out with monthly overhead.</p>${STAFF34.map(x=>{const on=!!s[x.k],lock=S.rep<x.rep;return `<div class="card st34"><div class="row"><b>${x.em} ${x.r}</b><span class="${on?'pos':'muted'}" style="font-weight:800">${on?'On staff':M(x.pay*I())+'/mo'}</span></div><p class="muted" style="font-size:12.5px;margin:4px 0 8px">${x.d}</p><button class="btn sm ${on?'ghost':lock?'ghost':'gold'}" ${!on&&lock?'disabled':''} onclick="staffHire('${x.k}')">${on?'Let go':lock?`🔒 Prestige ${x.rep}`:'Hire'}</button></div>`}).join('')}`}
diaryView=(function(o){return function(){o.apply(this,arguments);try{const m=document.querySelector('#modal');if(!m||m.querySelector('.st34'))return;const tm=[...m.querySelectorAll('.tm')].pop();if(tm)tm.insertAdjacentHTML('afterend',staffHTML());else{const c=m.querySelector('.modal>div,.modal');if(c)c.insertAdjacentHTML('beforeend',staffHTML())}}catch(e){E34(e)}}})(diaryView);
function staffTick(){const s=S.staff34||{};
 if(s.scout&&s.scout<=tNow()){const L=S.people.actors.filter(a=>!a.gem&&!busy(a)&&a.skill>=72&&a.star<=38&&(a.age||30)>=18);if(L.length){const a=pick(L);a.gem=tNow();const best=SK7.slice().sort((x,y)=>sk7(a)[y[0]]-sk7(a)[x[0]])[0];addInbox('🔍','Talent Scout',`Hidden gem: ${esc(a.n)}`,`"Nobody's talking about ${esc(a.n.split(' ')[0])} yet. Acting ${a.skill}, ${best[1].toLowerCase()} ${sk7(a)[best[0]]}, loves ${taste(a).likes.join(' and ').toLowerCase()}. They'd come cheap."`,`modal();openPerson('${a.id}')`)}}}
nextMonth=(function(o){return function(){const r=o.apply(this,arguments);try{if(S&&!S.over)staffTick()}catch(e){E34(e)}return r}})(nextMonth);
scandalMoment=(function(o){return function(x,p,what){try{if(S.staff34&&S.staff34.pub&&Math.random()<.6){try{diary('📰','Story buried',`Your publicist kept ${x.n}'s scandal out of the papers.`)}catch(e){}toast(`📰 Your publicist buried a story about ${esc(x.n)}`);return runQueue()}}catch(e){}return o.apply(this,arguments)}})(scandalMoment);
releaseFilm=(function(o){return function(p){if(S&&S.staff34&&S.staff34.pub)p.hype=(p.hype||0)+3;const f=o.apply(this,arguments);try{if(f&&p.presale&&f.intlRent>0){const lost=+(f.intlRent*p.presale).toFixed(1),own=1-(p.cofi||0);f.intlRent=+(f.intlRent-lost).toFixed(1);f.presale=p.presaleAmt;f.presaleLost=lost;f.revenue=+(f.revenue+(p.presaleAmt-lost)*own).toFixed(1);f.profit=+(f.profit+(p.presaleAmt-lost)*own).toFixed(1);S.receivables.push({t:tNow()+1,amt:-lost*own,label:f.title+' overseas (pre-sold)'})}}catch(e){E34(e)}return f}})(releaseFilm);

/* ---------- overseas pre-sales at greenlight ---------- */
function presaleBase(){try{const g=W.script.genre;const cost=(typeof prodSpend==='function'&&W.prod?prodSpend(W):0)+(typeof wizFees==='function'?wizFees(W):0);return Math.max(.2,cost*(GEN[g].intl||1)*.42)}catch(e){return 1}}
function presaleCard(){if(document.querySelector('#app .ps34'))return;const btns=[...document.querySelectorAll('#app .btn.gold')];const gl=btns[btns.length-1];if(!gl)return;const base=presaleBase(),v=W.presale||0;
 const opt=(x,l)=>`<button class="${v===x?'on':''}" onclick="W.presale=${x};MKEEP=true;wiz()">${l}<br><small>${x?'+'+M(base*x*.85)+' now':'keep all'}</small></button>`;
 gl.insertAdjacentHTML('beforebegin',`<div class="card ps34"><div class="row"><b>🌍 Pre-sell overseas rights</b><small class="muted">optional</small></div><p class="muted" style="font-size:12.5px;margin:4px 0 8px">Foreign distributors pay cash up front for a share of your overseas rentals. Safer if the film flops; you give up upside if it hits.</p><div class="seg">${opt(0,'None')}${opt(.25,'25%')}${opt(.5,'50%')}</div></div>`)}
greenlight=(function(o){return function(){const n=S.projects.length,ps=W&&W.presale||0,base=ps?presaleBase():0;const r=o.apply(this,arguments);try{if(ps&&S.projects.length>n){const p=S.projects[S.projects.length-1];const amt=+(base*ps*.85).toFixed(1);p.presale=ps;p.presaleAmt=amt;S.cash+=amt;try{if(typeof TX==='function')TX(amt,'Overseas pre-sale: '+p.title)}catch(e){}addNews(`🌍 ${esc(S.name)} pre-sells ${Math.round(ps*100)}% of overseas rights to <b>${esc(p.title)}</b> for ${M(amt)}.`);save()}}catch(e){E34(e)}return r}})(greenlight);

/* ---------- weekly burn under cash ---------- */
function burnWk(){try{return overhead()/4.33}catch(e){return 0}}
const burnTag=()=>`<small class="burn34">▼ ${M(burnWk())}/wk</small>`;
topbar=(function(o){return function(){let h=o.apply(this,arguments);try{h=h.replace(/(<span class="tb-cash[^"]*">[^<]*<\/span>)/,`<span class="cw34">$1${burnTag()}</span>`)}catch(e){}return h}})(topbar);
try{tcHead=(function(o){return function(){let h=o.apply(this,arguments);try{h=h.replace(/(<span class="tc-cash">[^<]*<\/span>)/,`<span class="cw34">$1${burnTag()}</span>`)}catch(e){}return h}})(tcHead)}catch(e){}

/* ---------- named lot levels ---------- */
const LOTLV34={
 stage:[['Rented Warehouse Stage','"Four walls, some cables and a lot of hope."'],['Twin Soundstages','"Two shoots at once. The coffee budget doubles."'],['Stage Row','"Golf carts, call sheets, a real studio hum."'],['The Big Four','"Every stage lit. Every crew booked."'],['The Dream Factory','"Five stages and a waiting list."']],
 tvstage:[['Converted Garage','"Sitcom sets fit if nobody moves."'],['Network Stage','"Live audience seats and a laugh-sign."'],['TV Studio Block','"Three series rolling. The network calls daily."'],['Broadcast Campus','"Prime time is made here."']],
 writers:[['Bungalow Desk','"One typewriter, endless coffee."'],["Writers' Bungalow",'"Whiteboards on every wall."'],["Writers' Building",'"Pages pour out by lunch."'],['Story Tower','"The best scripts in town start here."']],
 backlot:[['Painted Flats','"From the front, it looks like Chicago."'],['Main Street','"A whole town square, rain towers included."'],['Old City Backlot','"New York, Paris and a Western town, one golf-cart ride apart."'],['World Backlot','"Any city on Earth, by Tuesday."']],
 costume:[['Sewing Corner','"Pins, patterns and patience."'],['Costume Shop','"Racks of every decade."'],['Wardrobe House','"Royal gowns to spacesuits."'],['Couture Atelier','"Critics notice the stitching."']],
 stunt:[['Crash Mats','"Safety first, then the fall."'],['Stunt Gym','"Wire rigs and a padded pit."'],['Action Unit','"Car flips on a Thursday."'],['Second-Unit Legends','"The best falls in the business."']],
 vfx:[['Optical Desk','"Matte paintings and miniatures."'],['Effects Shop','"Models, rigs and early computers."'],['VFX House','"Render farms hum all night."'],['Pixel Foundry','"Whole worlds, built to order."']],
 scoring:[['Piano Room','"One piano, one genius."'],['Scoring Stage','"Room for a full orchestra."'],['Symphony Hall','"Sixty players and perfect acoustics."']],
 screening:[['Projection Booth','"Folding chairs and a flicker."'],['Screening Room','"Plush seats for test audiences."'],['Preview Theatre','"Where final cuts are decided."']],
 marketing:[['Poster Desk','"Hand-drawn one-sheets."'],['Trailer Shop','"In a world... cut faster."'],['Marketing Department','"Campaigns that sell out Fridays."'],['Hype Machine','"The whole country is talking."']],
 premiere:[['Lot Cinema','"A red rope and a camera flash."'],['Premiere Theatre','"Searchlights on the lot."'],['Grand Palace','"Red carpet from gate to screen."']],
 led:[['LED Wall','"A sunset on demand."'],['LED Volume','"Any planet, no travel."'],['Virtual Production Hub','"Shoot the impossible indoors."']],
 mocap:[['Mocap Room','"Dots, suits and a lot of jumping."'],['Capture Stage','"Performances become creatures."'],['Performance Capture Lab','"Every blink recorded."']],
 aiprevis:[['Previs Desk','"Rough shots before the first take."'],['AI Previs Lab','"Storyboards that move."'],['Simulation Studio','"Whole films planned before a set is built."']]};
lotView=(function(o){return function(){o.apply(this,arguments);try{const m=document.querySelector('#modal');if(!m)return;const cards=[...m.querySelectorAll('.card')].filter(c=>c.querySelector('.row b'));
 BUILDINGS.forEach(b=>{const c=cards.find(x=>x.querySelector('.row b').textContent.includes(b.l));if(!c||c.querySelector('.lv34'))return;const lv=lotLv(b.k),L=LOTLV34[b.k]||[];const cur=lv?L[Math.min(lv,L.length)-1]:null,nx=L[Math.min(lv,L.length-1)];
  c.querySelector('.row').insertAdjacentHTML('afterend',`<div class="lv34">${cur?`<b>${cur[0]}</b><i>${cur[1]}</i>`:`<i>Next: <b>${nx?nx[0]:''}</b> — ${nx?nx[1]:''}</i>`}</div>`)})}catch(e){E34(e)}}})(lotView);

/* ---------- Hall of Fame ---------- */
function hallOfFame(){const F=(S.films||[]).filter(f=>f.kind!=='show');const tal={};
 F.forEach(f=>{const ids=[f.dir].concat(typeof allCast==='function'?allCast(f.cast):[]).filter(Boolean);ids.forEach(id=>{const e=tal[id]=tal[id]||{id,films:0,gross:0,stat:0};e.films++;e.gross+=f.ww||0});
  (f.awards||[]).forEach(a=>{let id=null;if(/Director/.test(a))id=f.dir;else if(/Actor|Actress/.test(a)&&f.cast)id=f.cast.lead;if(id){const e=tal[id]=tal[id]||{id,films:0,gross:0,stat:0};e.stat++}})});
 const leg=Object.values(tal).filter(e=>person(e.id)).map(e=>Object.assign(e,{sc:e.stat*30+e.films*6+e.gross/(60*I())})).sort((a,b)=>b.sc-a.sc).slice(0,10);
 const top=F.slice().sort((a,b)=>(b.ww||0)-(a.ww||0)).slice(0,5),best=F.slice().sort((a,b)=>(b.critic||0)-(a.critic||0))[0],open=F.slice().sort((a,b)=>(b.opening||0)-(a.opening||0))[0],stat=F.slice().sort((a,b)=>(b.awards||[]).length-(a.awards||[]).length)[0];
 modal(`<div class="hof34"><div class="hof34-h"><small>${esc(S.name)}</small><h2>Hall of Fame</h2><i>The people and pictures that built the studio</i></div>
 ${F.length?`<div class="rb34-k">RECORDS</div><div class="card">${[['🏆 Biggest hit',top[0],top[0]&&M(top[0].ww)],['🍅 Best reviewed',best,best&&best.critic+'%'],['🎟️ Biggest opening',open,open&&open.opening?M(open.opening):null],['🗿 Most statues',stat,stat&&(stat.awards||[]).length?(stat.awards||[]).length+' won':null]].filter(r=>r[1]&&r[2]).map(r=>`<div class="row news"><span>${r[0]}</span><span><b>${esc(r[1].title)}</b> · ${r[2]}</span></div>`).join('')}</div>
 <div class="rb34-k">LEGENDS OF THE LOT</div>${leg.length?leg.map((e,i)=>{const p=person(e.id);return `<div class="rp34-r" onclick="modal();openPerson('${e.id}')"><span class="hof34-n">${i+1}</span>${portrait(p,44)}<div class="rp34-m"><b>${esc(p.n)}</b><small>${roleOf(p)==='directors'?'Director':'Actor'} · ${e.films} film${e.films>1?'s':''} with you${e.stat?` · 🗿 ${e.stat}`:''}</small></div><div class="rp34-f"><b>${M(e.gross)}</b><small>gross</small></div></div>`}).join(''):'<p class="muted">Make films with the same people to build legends.</p>'}
 <div class="rb34-k">GREATEST PICTURES</div>${top.map((f,i)=>`<div class="rp34-r" onclick="modal();filmModal(${f.id})"><span class="hof34-n">${i+1}</span>${posterSVG(f,40)}<div class="rp34-m"><b>${esc(f.title)}</b><small>${yearOf(f.releaseT)} · ${f.genre} · 🍅 ${f.critic}%</small></div><div class="rp34-f"><b>${M(f.ww||0)}</b><small>worldwide</small></div></div>`).join('')}`:'<p class="muted" style="text-align:center;margin:20px 0">Release your first picture to start the Hall of Fame.</p>'}</div><button class="btn ghost" onclick="modal()">Close</button>`)}
render=(function(o){return function(){const r=o.apply(this,arguments);try{if(typeof TAB!=='undefined'&&TAB==='hq'&&!document.querySelector('#app .hof34t')){const lb=[...document.querySelectorAll('#app [onclick="leaderboard()"]')][0];if(lb){const t=lb.cloneNode(true);t.classList.add('hof34t');try{const sv=t.querySelector('svg');if(sv&&typeof ic==='function'){const d=document.createElement('div');d.innerHTML=ic('crown',sv.getAttribute('stroke')||'currentColor',+sv.getAttribute('width')||22);sv.replaceWith(d.firstElementChild)}}catch(e){}t.setAttribute('onclick','hallOfFame()');const lab=[...t.querySelectorAll('span,b,div')].reverse().find(x=>/charts/i.test(x.textContent)&&!x.children.length);if(lab)lab.textContent='Hall of Fame';else t.lastChild.textContent='Hall of Fame';lb.insertAdjacentElement('afterend',t)}}}catch(e){E34(e)}return r}})(render);
