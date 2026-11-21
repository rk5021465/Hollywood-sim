/* ===== v20 · Big production update ===== */

/* ---------- A. several production hubs ---------- */
function hubPick(k){W.locs=(W.locs&&W.locs.length?W.locs:[W.loc]).filter(Boolean);const i=W.locs.indexOf(k);if(i>=0){if(W.locs.length>1)W.locs.splice(i,1)}else{if(W.locs.length>=3)return toast('Up to 3 production hubs');W.locs.push(k)}W.loc=W.locs[0];const y=window.scrollY;wiz();try{window.scrollTo(0,y)}catch(e){}}
function hubExtraCost(w){const n=(w.locs||[]).length;return n>1?+(prodSpend(w)*.04*(n-1)).toFixed(2):0}

/* ---------- B. studio sets (build once, reuse forever) ---------- */
const SETS=[
 ['bridge','Starship Bridge','🚀',{'Sci-Fi':5,Superhero:3},1.2],['saloon','Western Main Street','🤠',{Action:3,Drama:3,Comedy:2},.8],['ballroom','Palace Ballroom','👑',{Biopic:4,Romance:4,Drama:3},1.0],
 ['mansion','Haunted Mansion','🏚️',{Horror:5,Thriller:3,Comedy:2},.8],['court','Courtroom','⚖️',{Drama:5,Thriller:4,Biopic:2},.5],['nystreet','New York Street Backlot','🏙️',{Thriller:4,Comedy:3,Romance:3,Superhero:3,Action:3},1.1],
 ['sub','Submarine Interior','⚓',{Thriller:4,Action:4,'Sci-Fi':2},.9],['diner','Retro Diner','🍔',{Comedy:4,Romance:3,Drama:3},.4],['lair','Villain\'s Lair','🦹',{Superhero:5,Action:4,'Sci-Fi':3},1.3],
 ['castle','Castle Great Hall','🏰',{Biopic:4,Horror:3,Drama:2},1.1],['jungleset','Jungle Soundstage','🌴',{Action:4,Horror:3},.9],['office','Corporate Office Floor','🏢',{Comedy:4,Drama:4,Thriller:3},.4],
 ['hospital','Hospital Wing','🏥',{Drama:4,Horror:3,Thriller:2},.5],['spacest','Space Station','🛰️',{'Sci-Fi':5,Horror:3,Superhero:2},1.5],['nightclub','Neon Nightclub','🪩',{Thriller:3,Comedy:3,Romance:3,Action:2},.6],
 ['school','High School','🏫',{Comedy:5,Horror:3,Romance:3,Drama:2},.5],['train','Vintage Train Carriage','🚂',{Thriller:4,Biopic:3,Romance:3,Action:2},.7],['ship','Ocean Liner Deck','🛳️',{Romance:5,Drama:3,Action:2},1.2],
 ['bunker','War Bunker','🪖',{Drama:4,Action:4,Thriller:3,Biopic:3},.7],['lab','Mad Science Lab','🧪',{'Sci-Fi':4,Horror:4,Comedy:2},.6],['volume','LED Virtual Stage','🖥️',{'Sci-Fi':4,Superhero:4,Action:3},1.8,2019]
].map(a=>({k:a[0],n:a[1],ic:a[2],fit:a[3],c:a[4],y:a[5]||0}));
function setCost(s,g){g=g||(W&&W.script&&W.script.genre)||'Drama';return +(s.c*((GEN[g]&&GEN[g].budget)||20)*.05*inf(tNow())).toFixed(2)}
function setOwned(k){return (S.sets||[]).includes(k)}
function setsUI(g){W.sets=W.sets||[];const L=SETS.filter(s=>!s.y||S.year>=s.y).map(s=>({s,f:s.fit[g]||0})).sort((a,b)=>(W.sets.includes(b.s.k)-W.sets.includes(a.s.k))||(setOwned(b.s.k)-setOwned(a.s.k))||(b.f-a.f));
 const tot=W.sets.filter(k=>!setOwned(k)).reduce((t,k)=>t+setCost(SETS.find(x=>x.k===k),g),0);
 return `<div class="card sc30"><div class="row"><b>🎭 Studio sets</b><small class="muted">${W.sets.length}/4 · ${tot?'+'+M(tot):'optional'}</small></div><p class="muted" style="font-size:12.5px;margin:4px 0 8px;text-transform:none">Build sets on your soundstages. You only pay once: sets you own can be reused free in later films and sequels.</p>
 <div class="st31">${L.map(({s,f})=>{const on=W.sets.includes(s.k),own=setOwned(s.k);return `<button class="st31c ${on?'on':''}" onclick="setPick('${s.k}')"><span class="st31i">${s.ic}</span><b>${s.n}</b><small>${own?'<span style="color:#1F9D5C">✔ Owned · free</span>':M(setCost(s,g))}</small>${f>=4?'<em>✨ Perfect</em>':f>=3?'<em class="ok">👍 Good</em>':''}</button>`}).join('')}</div></div>`}
function setPick(k){W.sets=W.sets||[];const i=W.sets.indexOf(k);if(i>=0)W.sets.splice(i,1);else{if(W.sets.length>=4)return toast('Up to 4 sets per film');W.sets.push(k)}const y=window.scrollY;wiz();try{window.scrollTo(0,y)}catch(e){}}
scoutUI=(function(o){return function(g){return o(g)+(g==='Animation'?'':setsUI(g))}})(scoutUI);

/* ---------- C. premium formats by era ---------- */
const FMTS=[
 {k:'roadshow',n:'70mm Roadshow',ic:'🎞️',y:1970,ye:1995,c:.8,b:.05,fit:['Biopic','Drama','Action','Romance'],d:'Reserved seats, intermission, overture'},
 {k:'sensur',n:'Sensurround',ic:'💥',y:1974,ye:1982,c:.5,b:.06,fit:['Action','Thriller','Sci-Fi'],d:'Speakers that shake the seats'},
 {k:'old3d',n:'3D (red-blue glasses)',ic:'👓',y:1970,ye:2004,c:.4,b:.04,fit:['Horror','Sci-Fi','Comedy'],d:'A gimmick audiences love once'},
 {k:'thx',n:'THX-certified sound',ic:'🔊',y:1983,c:.3,b:.03,fit:['Sci-Fi','Action','Superhero','Thriller'],d:'Premium sound in top theaters'},
 {k:'imax',n:'IMAX',ic:'🟦',y:2002,c:1.2,b:.10,fit:['Sci-Fi','Action','Superhero','Animation'],d:'Giant screens, premium tickets'},
 {k:'real3d',n:'Digital 3D',ic:'🕶️',y:2005,c:.9,b:.07,fit:['Animation','Sci-Fi','Superhero','Action','Horror'],d:'Higher ticket prices'},
 {k:'imax3d',n:'IMAX 3D',ic:'🔷',y:2008,c:1.5,b:.12,fit:['Sci-Fi','Superhero','Animation','Action'],d:'The ultimate event screening'},
 {k:'dbox',n:'D-BOX motion seats',ic:'💺',y:2009,c:.4,b:.03,fit:['Action','Superhero','Sci-Fi'],d:'Seats move with the action'},
 {k:'4dx',n:'4DX',ic:'🌪️',y:2009,c:.7,b:.05,fit:['Action','Superhero','Sci-Fi','Horror','Animation'],d:'Wind, water, scent and motion'},
 {k:'screenx',n:'ScreenX',ic:'↔️',y:2012,c:.6,b:.04,fit:['Action','Sci-Fi','Superhero'],d:'270° side-wall projection'},
 {k:'dolby',n:'Dolby Cinema',ic:'⚫',y:2014,c:.9,b:.06,fit:['Sci-Fi','Thriller','Horror','Action','Drama'],d:'HDR picture, Atmos sound'},
 {k:'laser',n:'IMAX with Laser',ic:'✨',y:2015,c:1.3,b:.09,fit:['Sci-Fi','Action','Superhero','Biopic'],d:'Brightest giant screens'}];
function fmtAvail(){return FMTS.filter(f=>S.year>=f.y&&(!f.ye||S.year<=f.ye))}
function fmtCost(f){return +(f.c*inf(tNow())).toFixed(2)}
function fmtUI(){W.fmts=W.fmts||[];const g=W.script&&W.script.genre;const L=fmtAvail();if(!L.length)return '';
 return `<div class="fm31"><small>Premium formats</small>${L.map(f=>{const on=W.fmts.includes(f.k),fit=f.fit.includes(g);return `<button class="fm31b ${on?'on':''}" onclick="W.fmts=W.fmts||[];const i=W.fmts.indexOf('${f.k}');i>=0?W.fmts.splice(i,1):W.fmts.push('${f.k}');const y=scrollY;wiz();scrollTo(0,y)"><span>${f.ic}</span><div><b>${f.n}</b><small>${f.d}${fit?' · ✨ suits '+g:''}</small></div><em>${M(fmtCost(f))}</em></button>`}).join('')}</div>`}

/* ---------- D. greenlight: pay for hubs, sets, formats; set up deal terms ---------- */
greenlight=(function(o){return function(){const w=W;const hubs=(w.locs||[]).slice(),sets=(w.sets||[]).slice(),fm=(w.fmts||[]).slice(),hubC=hubExtraCost(w);const deals=JSON.parse(JSON.stringify(w.deals||{}));const fid=w.script&&w.script.fid;const n=S.projects.length;
 o.apply(this,arguments);try{if(S.projects.length<=n)return;const p=S.projects[S.projects.length-1];let cost=0;
  if(hubs.length>1){p.locs=hubs;cost+=hubC}
  if(sets.length){p.sets=sets;S.sets=S.sets||[];sets.forEach(k=>{if(!S.sets.includes(k)){cost+=setCost(SETS.find(x=>x.k===k),p.genre);S.sets.push(k)}})}
  if(fm.length){p.fmts=fm;fm.forEach(k=>{const f=FMTS.find(x=>x.k===k);if(f)cost+=fmtCost(f)})}
  if(cost){S.cash-=cost;p.prod=(p.prod||0)+cost}
  /* deal terms */
  let gp=0,defer=0;Object.entries(deals).forEach(([id,d])=>{if(d.gross){gp+=d.share||0}if(d.defer){defer+=d.fee*.3}if(d.films>1){ctAll().push({id:S.id++,p:id,fid:fid||('fr'+p.id),name:fid?(S.franchises.find(x=>x.id===fid)||{}).name||p.title:p.title,left:d.films-1,total:d.films-1,fee:d.fee,signedT:tNow(),signStar:fam(person(id))});story({icon:'📝',paper:'trade',who:[id],head:`${esc(pname(id))} signs a ${d.films}-picture deal with ${esc(S.name)}, starting with <i>${esc(p.title)}</i>.`})}if(d.appr){bondAdd(id,6,'Got creative approval on '+p.title);p.chem=(p.chem||0)-1}});
  if(gp){p.grossPts=gp;p.shares=Math.max(0,(p.shares||0)-gp)}
  if(defer){p.deferPay=+defer.toFixed(2);S.cash+=p.deferPay}
 }catch(e){console.error(e)}}})(greenlight);

/* ---------- E. release: hubs, sets and formats show up; deferred pay and gross points get paid ---------- */
releaseFilm=(function(o){return function(p){try{p._why=p._why||[];const g=p.genre;
 if(p.locs&&p.locs.length>1){let b=0;p.locs.slice(1).forEach(k=>{const l=LOCS.find(x=>x.k===k);if(l&&(l.look||{})[g])b+=l.look[g]*.5});if(b){p.chem=(p.chem||0)+b;p._why.push(['🌍',`Shooting in ${p.locs.join(', ')} gave it a varied, expensive look`,1])}}
 if(p.sets&&p.sets.length){const L=p.sets.map(k=>SETS.find(x=>x.k===k)).filter(Boolean).map(s=>({s,f:s.fit[g]||0})).sort((a,b)=>b.f-a.f);let b=0;L.forEach((x,i)=>b+=(x.f>=4?2.5:x.f>=3?1.2:0)*([1,.6,.4,.3][i]||.2));p.chem=(p.chem||0)+b;const good=L.filter(x=>x.f>=3);if(good.length)p._why.push([good[0].s.ic,`Lavish studio sets (${good.map(x=>x.s.n).slice(0,3).join(', ')}) built a believable world`,1])}
 if(p.fmts&&p.fmts.length){const L=p.fmts.map(k=>FMTS.find(x=>x.k===k)).filter(Boolean);let b=0;L.forEach(f=>b+=f.b*(f.fit.includes(g)?1:.35));b=Math.min(.3,b);p.holBoost=(p.holBoost||1)*(1+b);p._why.push(['🎦',`Premium formats (${L.map(f=>f.n).join(', ')}) lifted ticket prices by ${Math.round(b*100)}%`,1])}
}catch(e){console.error(e)}
 const f=o(p);
 try{if(f){if(p.deferPay){S.cash-=p.deferPay;f.deferPay=p.deferPay}
  if(p.grossPts){f.grossPay=+(f.ww*.5*p.grossPts/100).toFixed(1);f.profit=+(f.profit-f.grossPay).toFixed(1);S.cash-=f.grossPay;(f.why=f.why||[]).push(['💰',`First-dollar gross deals paid out ${M(f.grossPay)}`,0])}}}catch(e){}return f}})(releaseFilm);

/* ---------- F. negotiation: slider by % of ask, and real deal terms ---------- */
ngVal=function(){const a=NG.ask0||NG.ask;return NG.offer+NG.share*a*.06*(NG.gross?2.2:1)+(NG.bonus?a*.08:0)+((NG.films||1)-1)*a*.07+(NG.pop?a*.06:0)+(NG.perks?a*.04:0)+(NG.appr?a*.06:0)-(NG.defer?a*.06:0)};
function ngPct(){const a=NG.ask0||NG.ask;return Math.round(NG.offer/a*100)}
function ngSlide(v){const a=NG.ask0||NG.ask;NG.offer=+(a*v/100).toFixed(2);const el=document.getElementById('ngv');if(el)el.innerHTML=`${M(NG.offer)} <small>${v}% of first ask</small>`;const [sl,sc,sw]=ngStrength();const s=document.getElementById('ngs');if(s){s.textContent=sl;s.style.color=sc}const m=document.getElementById('ngm');if(m){m.style.width=sw+'%';m.style.background=sc}const b=document.getElementById('ngsend');if(b)b.textContent=`Send offer · ${M(NG.offer)}`}
negView=(function(o){return function(){ngInit();if(!NG.ask0)NG.ask0=NG.ask;NG.films=NG.films||1;const p=person(NG.id);const isA=NG.role==='actors';const star=isA?(p.star||0):(p.fame||0);const [sl,sc,sw]=ngStrength();const avail=S.cash+creditLimit()-committed()-wizFees(W);
 const tg=(k,lbl,sub,dis)=>`<div class="kv ng31t"><span>${lbl}<br><small style="text-transform:none">${sub}</small></span><button class="btn sm ${NG[k]?'gold':'ghost'}" style="margin:0;width:auto" ${dis?'disabled':''} onclick="NG.${k}=!NG.${k};negView()">${NG[k]?'On':'Off'}</button></div>`;
 MKEEP=true;
 modal(`<h3>Negotiating · ${esc(p.n)}</h3><div class="ngh">${portrait(p,64)}<div><b>${esc(p.n)}</b><span>${isA?'Actor':ROLE_LBL[NG.role].replace(/s$/,'')} · 💜 ${star} ${isA?'star power':'fame'} · ⭐ ${p.skill}</span><span class="ngpat">Patience ${'●'.repeat(Math.max(0,NG.pat))}${'○'.repeat(Math.max(0,NG.pat0-NG.pat))}</span></div></div>
 <div class="ngchat">${NG.log.map(m=>`<div class="ngm ${m.them?'them':'me'}">${m.s}</div>`).join('')}</div>
 <div class="card"><div class="row"><small>Their ask</small><b>${M(NG.ask)}${NG.want?` + ${NG.want}% back-end`:''}</b></div><div class="row" style="margin-top:4px"><small>Your budget left</small><b>${M(avail)}</b></div></div>
 <div class="card"><small>Upfront salary</small><div class="ng31v" id="ngv">${M(NG.offer)} <small>${ngPct()}% of first ask</small></div>
 <input class="ng31r" type="range" min="40" max="160" step="1" value="${ngPct()}" oninput="ngSlide(+this.value)" onchange="negView()">
 <div class="ng31q">${[70,85,100,115].map(v=>`<button onclick="ngSlide(${v});negView()">${v}%</button>`).join('')}</div>
 <small style="display:block;margin-top:12px">Picture deal</small><div class="chips">${[1,2,3].map(n=>`<button class="${NG.films===n?'on':''}" onclick="NG.films=${n};negView()">${n===1?'One film':n+'-picture deal'}</button>`).join('')}</div>
 ${NG.films>1?`<small class="muted" style="display:block;text-transform:none;margin-top:4px">They return for ${NG.films-1} more film${NG.films>2?'s':''} at this same fee. Talent likes the security.</small>`:''}
 ${isA||NG.role==='directors'?`<small style="display:block;margin-top:12px">Back-end points</small><div class="chips">${[0,2,5,8,12].map(x=>`<button class="${NG.share===x?'on':''}" onclick="NG.share=${x};negView()">${x?x+'%':'None'}</button>`).join('')}</div>
 ${NG.share?`<div class="seg" style="margin-top:8px"><button class="${!NG.gross?'on':''}" onclick="NG.gross=0;negView()">Net profits</button><button class="${NG.gross?'on':''}" ${star<65?'disabled title="Only stars get gross deals"':''} onclick="NG.gross=1;negView()">First-dollar gross</button></div><small class="muted" style="display:block;text-transform:none;margin-top:4px">${NG.gross?'Paid from the first ticket sold, even if the film loses money. Worth much more to them.':'Paid only if the film makes a profit.'}</small>`:''}`:''}
 <small style="display:block;margin-top:12px">Extras</small>
 ${tg('bonus','🏆 Box-office bonus',`Pays ${M((NG.ask0||NG.ask)*.25)} only if it makes 3× its budget`)}
 ${tg('pop','🛡️ Pay-or-play','They get paid even if you cancel the film')}
 ${tg('defer','⏳ Defer 30% of salary','Paid at release instead of now. They don\'t love it')}
 ${tg('perks','🚐 Perks package',`Luxury trailer, entourage, travel (+${M((NG.ask0||NG.ask)*.05)})`)}
 ${tg('appr','🎬 Creative approval','They approve script changes. Happier, but chemistry −1',!(star>=60))}
 <div class="row" style="margin-top:10px"><small>Deal strength</small><b id="ngs" style="color:${sc}">${sl}</b></div><div class="meter"><i id="ngm" style="width:${sw}%;background:${sc}"></i></div></div>
 <div class="sticky2" style="flex-wrap:wrap"><button class="btn ghost" style="flex:1" onclick="ngWalk()">Walk away</button><button class="btn ghost" style="flex:1" onclick="ngAccept()">Accept their ask</button><button class="btn gold" id="ngsend" style="flex:1 1 100%" onclick="negOffer()">Send offer · ${M(NG.offer)}</button></div>`)}})(negView);
ngSign=(function(o){return function(fee,share,bonus){const id=NG.id,t={films:NG.films||1,gross:NG.share?NG.gross?1:0:0,pop:NG.pop?1:0,defer:NG.defer?1:0,perks:NG.perks?1:0,appr:NG.appr?1:0};const extra=t.perks?(NG.ask0||NG.ask)*.05:0;const r=o(+(+fee+extra).toFixed(2),share,bonus);try{if(W&&W.deals&&W.deals[id])Object.assign(W.deals[id],t)}catch(e){}return r}})(ngSign);

/* ---------- G. unavailable for X weeks ---------- */
function busyWeeks(x){return Math.max(1,(x.busy-tNow()+1)*4-(S.wk||0))}
personCard=(function(o){return function(x,sel,onclick,isA,locked,extra){let h=o(x,sel,onclick,isA,locked,extra);try{if(busy(x)&&x.busy<9999){const w=busyWeeks(x);h=h.replace('<div class="tags">',`<div class="tags"><span class="tag bad">⏳ Unavailable for ${w} week${w>1?'s':''}</span>`)}}catch(e){}return h}})(personCard);
openPerson=(function(o){return function(id){o(id);try{const x=person(id);if(!x||!busy(x)||x.busy>=9999)return;const w=busyWeeks(x);document.querySelectorAll('#modal .tag.bad').forEach(t=>{if(/Busy for/.test(t.textContent))t.textContent=`⏳ Unavailable for ${w} week${w>1?'s':''}`})}catch(e){}}})(openPerson);

/* ---------- H. the film appears on the screen at test screenings ---------- */
function screenOverlay(img,title,studio){try{const box=img.parentElement;if(!box||box.querySelector('.scr31'))return;const go=()=>{const iw=img.naturalWidth||778,ih=img.naturalHeight||1100,cw=box.clientWidth,ch=box.clientHeight;const s=Math.max(cw/iw,ch/ih);const ox=(cw-iw*s)/2,oy=(ch-ih*s)/2;
 const L=ox+iw*.212*s,T=oy+ih*.438*s,Wd=iw*.64*s,H=ih*.288*s;box.insertAdjacentHTML('beforeend',`<div class="scr31" style="left:${L}px;top:${T}px;width:${Wd}px;height:${H}px"><small>${/^[aeiou]/i.test(studio)?'An':'A'} ${esc(studio)} Picture</small><b>${esc(title)}</b><i></i></div>`)};if(img.complete)go();else img.onload=go}catch(e){}}
playScene=(function(o){return function(sc,next){const r=o(sc,next);try{if(sc&&sc.bg==='screen'){const T=String(sc.tag||'').split('·').slice(1).join('·').trim()||'Feature Presentation';setTimeout(()=>document.querySelectorAll('#scn img.pbgimg').forEach(i=>{if(/bg_screening/.test(i.src))screenOverlay(i,T,S.name)}),50)}}catch(e){}return r}})(playScene);

/* ---------- I. premium premiere ---------- */
premiereScene=function(f){const cs=allCast(f.cast||{}).slice(0,4).map(person).filter(Boolean);const d=person(f.dir);const y=S.year;const phone=y>=2009,old=y<1990;
 const venue=pick(['The Royal Palace Theatre','The Grand Egyptian-style Palace','The Silver Screen Pavilion','The Starlight Theatre','The Crown Picture Palace']);
 const rx=f.critic>=80?['STANDING OVATION','"A MASTERPIECE"','"UNMISSABLE"']:f.critic>=60?['"A CROWD-PLEASER"','LOUD CHEERS','"PURE ENTERTAINMENT"']:['POLITE APPLAUSE','"…INTERESTING"','MIXED REACTIONS'];
 const people=cs.concat(d?[d]:[]).slice(0,4);
 return `<div class="pr31" data-k="premiere"><div class="pr31beam a"></div><div class="pr31beam b"></div>
 <div class="pr31mq"><div class="pr31bulbs"></div><small>WORLD PREMIERE</small><h1>${esc(f.title)}</h1><span>${/^[aeiou]/i.test(S.name)?'An':'A'} ${esc(S.name)} Picture · ${esc(venue)}</span></div>
 <div class="pr31arr">${people.map((p,i)=>`<div class="pr31p" style="animation-delay:${.9+i*1.1}s"><div class="pr31ring">${portrait(p,92)}</div><b>${esc(p.n)}</b><small>${p===d?'Director':i===0?'Starring':'With'}</small></div>`).join('')}</div>
 <div class="pr31crowd">${Array.from({length:18},(_,i)=>`<i style="left:${i*5.6}%;height:${38+(i*37)%26}px">${phone&&i%3===0?'<u></u>':''}</i>`).join('')}</div>
 ${Array.from({length:10},(_,i)=>`<b class="pr31f" style="left:${(i*37)%92}%;top:${48+(i*23)%30}%;animation-delay:${(i*.53)%3.4}s;${old?'':'filter:hue-rotate(10deg)'}"></b>`).join('')}
 <div class="pr31rx">${rx.map((t,i)=>`<span style="animation-delay:${4.6+i*.7}s">${t}</span>`).join('')}</div></div>`};
cutScene=(function(o){return function(html,next,ms){if(/class="pr31"/.test(String(html)))ms=Math.max(ms||0,7600);return o(html,next,ms)}})(cutScene);

/* ---------- J. setup: emblem gallery, CEO face gallery, correct founding year ---------- */
const CEO_FRAMES=['#E8B84A','#C0392B','#1F3A5F','#1F9D5C','#7B4FC4','#E1306C','#16A085','#2B2B2B','#F5F5F5'];
function ceoPick(i){SW.ceo.pimg=i;setupView()}
setupView=(function(o){return function(){try{if(SW)START_YEAR=SW.era||1970}catch(e){}o();try{
 if(SW.step===0){const cards=document.querySelectorAll('#app .card');const at=cards[cards.length-1];if(at&&!document.querySelector('.lg31')){const ks=Object.keys(EMB);const shapes=SHAPES.slice(0,9);
  const opts=[];for(let i=0;i<24;i++){const pal=LPAL[i%LPAL.length];opts.push({emb:ks[(i*7)%ks.length],shape:shapes[(i*5)%shapes.length],c1:pal[0],c2:pal[1],fin:['grad','metal','flat'][i%3]})}
  at.insertAdjacentHTML('afterend',`<div class="card lg31"><div class="row"><small>Emblem gallery</small><button class="btn sm ghost" style="margin:0" onclick="SW.logo.emb=null;setupView()">Crest</button></div><div class="lg31g">${opts.map((x,i)=>{const L=Object.assign({},SW.logo,x,{text:SW.logo.text||SW.name||'Studio'});const on=SW.logo.emb===x.emb&&SW.logo.shape===x.shape&&SW.logo.c1===x.c1;return `<button class="${on?'on':''}" onclick='Object.assign(SW.logo,${JSON.stringify(x)});setupView()'>${logoMini(L,54)}</button>`}).join('')}</div><small class="muted" style="display:block;text-transform:none;margin-top:6px">${ks.length} emblems × ${shapes.length} shapes × ${LPAL.length} colour sets. Tap one, then fine-tune in the Logo designer later.</small></div>`)}}
 if(SW.step===1){const cards=document.querySelectorAll('#app .card');const look=cards[1];if(look){const g=SW.ceo.g||'M';SW.ceo.f=SW.ceo.f||{};const F=SW.ceo.f;
  let L=PIMG.map((x,i)=>({x,i})).filter(o=>o.x.g===g&&o.x.a[1]>=25);if(F.skin!=null)L=L.filter(o=>o.x.s[0]<=F.skin&&o.x.s[1]>=F.skin);if(F.age)L=L.filter(o=>F.age==='y'?o.x.a[0]<40:F.age==='m'?o.x.a[1]>=40&&o.x.a[0]<60:o.x.a[1]>=60);
  look.innerHTML=`<small>Choose your face</small><div class="chips" style="margin-top:6px">${['#FBE0CC','#F1C7A5','#DDA27A','#B9784E','#8A5434','#5A3420'].map((c,i)=>`<button style="background:${c};width:36px;height:30px;${F.skin===i?'outline:2px solid var(--gold)':''}" onclick="SW.ceo.f.skin=SW.ceo.f.skin===${i}?null:${i};setupView()"></button>`).join('')}</div>
  <div class="chips" style="margin-top:6px">${[['','All ages'],['y','Under 40'],['m','40–59'],['s','60+']].map(a=>`<button class="${(F.age||'')===a[0]?'on':''}" onclick="SW.ceo.f.age='${a[0]}';setupView()">${a[1]}</button>`).join('')}</div>
  <div class="ce31g">${L.map(o=>`<button class="${SW.ceo.pimg===o.i?'on':''}" style="--fr:${SW.ceo.frame||'#E8B84A'}" onclick="ceoPick(${o.i})"><img src="${o.x.src}" alt="" loading="lazy"></button>`).join('')||'<p class="muted">No faces match. Try another filter.</p>'}</div>
  <small style="display:block;margin-top:10px">Frame colour</small><div class="chips" style="margin-top:6px">${CEO_FRAMES.map(c=>`<button style="background:${c};width:34px;height:30px;${SW.ceo.frame===c?'outline:2px solid var(--gold)':''}" onclick="SW.ceo.frame='${c}';setupView()"></button>`).join('')}</div>`;
  const av=document.querySelector('#app .card.ceo>div');if(av&&SW.ceo.pimg!=null)av.innerHTML=`<div class="ce31av" style="--fr:${SW.ceo.frame||'#E8B84A'}"><img src="${PIMG[SW.ceo.pimg].src}" alt=""></div>`}}
}catch(e){console.error(e)}}})(setupView);
finishSetup=(function(o){return function(){const pi=SW&&SW.ceo&&SW.ceo.pimg;const fr=SW&&SW.ceo&&SW.ceo.frame;o.apply(this,arguments);try{if(pi!=null&&S){S.pimg=S.pimg||{};Object.keys(S.pimg).forEach(k=>{if(S.pimg[k]===pi)delete S.pimg[k]});S.pimg[S.ceo.id||'ceo']=pi;S.ceo.frame=fr;save()}}catch(e){}}})(finishSetup);
