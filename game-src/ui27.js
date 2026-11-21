/* ===== v18.7 · quieter phone, read counts, setup checks, one theme, newspapers, Writers Guild ===== */

/* ---------- setup: names are required ---------- */
function swNext(n){const bad=(sel,msg)=>{toast(msg);try{const i=document.querySelector(sel);if(i){i.classList.add('need27');i.focus();setTimeout(()=>i.classList.remove('need27'),1600)}}catch(e){}};
 if(n>=1&&!(SW.name||'').trim())return bad('#app input[type=text]','✏️ Give your studio a name first');
 if(n===1){SW.step=1;return setupView()}
 if(n>=2&&!(SW.ceo.n||'').trim()){if(n===3){SW.step=1;setupView()}return bad('#app .ceo input[type=text]','✏️ Enter your CEO name first')}
 if(n===2){SW.step=2;return setupView()}
 if(!SW.diff)return toast('Pick your starting money');finishSetup()}

/* ---------- music: the opening theme, all game long ---------- */
try{Object.keys(MUS).forEach(k=>{MUS[k]=['mpiano']})}catch(e){}
try{if(typeof TRACKS==='object'&&TRACKS.menu){TRACKS.tension=TRACKS.menu;TRACKS.hq=TRACKS.menu}}catch(e){}
musicTrack=(function(o){return function(k){return o('menu')}})(musicTrack);
try{mpList=function(){return ['mpiano']}}catch(e){}
try{mpPlay=(function(o){return function(k,f){return o('menu',f)}})(mpPlay)}catch(e){}

/* ---------- phone: only important calls ring ---------- */
function urgentCall(from,title,text,act){try{sfx('ring')}catch(e){}addInbox('📞',from,title,text,act);toast(`📞 ${esc(from)}: ${title}`)}

/* ---------- cell phone before email: inbox letters live in Messages, and reading one clears it ---------- */
appView=(function(o){return function(app,sub){
 if(app==='msg'&&appsHidden().includes('mail')){const box=S.inbox||[],th=S.dms||[];
  if(sub!=null&&String(sub)[0]==='i'){const m=box[+String(sub).slice(1)];if(m){m.read=1;return{html:`<div class="mh"><button class="xb" onclick="PHN.sub=null;phoneRender()">‹</button><div class="center"><b style="display:block;font-size:13px">${esc(m.from)}</b></div><span></span></div><div class="mchat"><div class="mb in"><b>${m.title}</b><br>${m.body||''}</div></div>${m.act?`<div style="padding:10px"><button class="btn sm gold" onclick="phoneClose();${m.act}">Open</button></div>`:''}`}}}
  if(sub!=null)return o(app,sub);
  const rows=box.map((m,i)=>({t:m.t,u:!m.read,h:`<button class="mrow" onclick="PHN.sub='i${i}';phoneRender()">${!m.read?'<i class="mdot"></i>':'<i></i>'}<span class="av" style="width:46px;height:46px">${m.icon||'✉'}</span><div style="flex:1;min-width:0"><div class="row"><b>${esc(m.from)}</b><span class="xm">${tLabel(m.t)}</span></div><div class="ellip" style="font-size:14px">${String(m.title).replace(/<[^>]+>/g,'')}</div></div></button>`}))
   .concat(th.map((d,i)=>({t:d.t,u:!d.r,h:`<button class="mrow" onclick="PHN.sub='${i}';phoneRender()">${!d.r?'<i class="mdot"></i>':'<i></i>'}${d.p&&person(d.p)?portrait(person(d.p),46):'<span class="av" style="width:46px;height:46px">✉</span>'}<div style="flex:1;min-width:0"><div class="row"><b>${esc(d.from)}</b><span class="xm">${tLabel(d.t)}</span></div><div class="ellip" style="font-size:14px">${String(d.s||'').replace(/<[^>]+>/g,'')}</div></div></button>`})))
   .sort((a,b)=>(b.u-a.u)||(b.t-a.t));
  const n=rows.filter(r=>r.u).length;
  return{html:`<div class="ah"><b>Messages</b>${n?`<span class="xm">${n} unread</span>`:''}</div>${rows.length?rows.map(r=>r.h).join(''):'<div class="empt">No messages</div>'}`}}
 return o(app,sub)}})(appView);
badgeOf=(function(o){return function(k){if(k==='msg'&&appsHidden().includes('mail'))return unread()+(S.dms||[]).filter(d=>!d.r).length;return o(k)}})(badgeOf);
/* refresh the top bar badge as soon as a message is opened */
phoneRender=(function(o){return function(){o();try{const n=phBadgeTotal();document.querySelectorAll('.tb-ib i').forEach(e=>{if(n)e.textContent=n;else e.remove()})}catch(e){}}})(phoneRender);

/* ---------- tab bar: no Calendar tab (tap the date at the top instead) ---------- */
tabbar=function(){const t=[['hq','home','Studio'],['slate','film','Projects'],['talent','star','Talent'],['world','globe','World']];
 return `<nav class="tabbar t4"><div>${t.map(x=>`<button class="${TAB===x[0]||(x[0]==='world'&&['empire','money','world'].includes(TAB))||(x[0]==='slate'&&TAB==='cal')?'on':''}" onclick="TAB='${x[0]}';render()">${ic(x[1])}<span>${x[2]}</span></button>`).join('')}</div></nav>`};

/* ---------- newspapers: many papers, each with its own beat and voice ---------- */
const NP=[
 {k:'trade',n:'Daily Marquee',tag:'THE BUSINESS OF SHOW',f:"'Playfair Display',Georgia,serif",c:'#7a1f1f',re:/box office|opens|grosses|weekend|release|dates|smash|flop|charts|tops|ticket|deal|signs|hires|greenlight/i,
  v:['Exhibitors are already adjusting their screen counts.','Trade analysts expect the numbers to hold through the month.','Rival studios are said to be studying the release plan closely.','Insiders call it the move of the season.']},
 {k:'prestige',n:'The Sunset Times',tag:'ALL THE NEWS FIT FOR THE SCREEN',f:"'Old English Text MT','UnifrakturCook',Georgia,serif",c:'#1d2b3a',re:/award|goldie|nominat|critic|festival|acclaim|review|oscar|prize|honou?r|masterpiece/i,
  v:['Critics have been unusually united in their verdict.','Voters, it seems, have long memories.','It is the kind of picture this town says it no longer makes.','The reaction at the screening was said to be electric.']},
 {k:'tabloid',n:'STARWATCH',tag:'THE STARS. THE SECRETS. THE SCANDALS.',f:"Impact,'Arial Black',sans-serif",c:'#c8102e',re:/scandal|feud|romance|dating|split|party|arrest|rumou?r|spotted|wedding|divorce|walks out|quits|fired|\bstars?\b|gossip/i,
  v:['Sources close to the star say tempers have been running high.','A friend of the family told us: "Nobody saw this coming."','Fans flooded the switchboards within the hour.','The studio has declined to comment. For now.']},
 {k:'money',n:'The Bottom Line',tag:'MONEY · MARKETS · MOGULS',f:"Georgia,'Times New Roman',serif",c:'#0f5132',re:/\$|ipo|share|stock|profit|loss|loan|bank|buys|sells|acquir|merger|valuation|budget|invest|debt|rival|bankrupt/i,
  v:['Investors reacted cautiously in early trading.','Accountants on both sides will be busy this quarter.','The balance sheet tells a more complicated story.','Analysts have revised their forecasts accordingly.']},
 {k:'radical',n:'Radical',tag:'VOICE OF THE UNHEARD',f:"'Playfair Display',Georgia,serif",c:'#22324a',re:/strike|guild|union|protest|boycott|ai\b|workers|pay|residual|indie|walkout/i,
  v:['Working writers and crews say the studios still hold all the cards.','The people who actually make the movies were not consulted.','On the picket lines the mood is defiant.','Once again, the moguls profit while the workers wait.']},
 {k:'courier',n:'The Angeles Courier',tag:'SERVING THE CITY SINCE 1881',f:"Georgia,'Times New Roman',serif",c:'#3b2f22',re:/./,
  v:['Locals say the lot has been busier than ever.','Traffic around the studio gates was heavy all week.','The city council is said to be pleased.','Residents had mixed feelings about the news.']}];
function npClean(s){return String(typeof s==='string'?s:(s&&s.s)||'').replace(/<[^>]+>/g,'').replace(/^[^\w"“$]+/u,'').trim()}
function npHash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function npItems(k){const all=(S.news||[]).map(n=>({t:n.t,s:npClean(n)})).filter(n=>n.s);const p=NP.find(x=>x.k===k);
 let L=all.filter(n=>p.re.test(n.s));if(k==='tabloid')L=npGossip().concat(L);{const seen=new Set();L=L.filter(n=>{const key=n.s.replace(/[^a-z]/gi,'').slice(0,28).toLowerCase();if(seen.has(key))return false;seen.add(key);return true})}if(k==='courier')L=all.filter(n=>!NP.slice(0,5).some(q=>q.re.test(n.s))).concat(all).filter((v,i,a)=>a.indexOf(v)===i);return L.slice(0,12)}
function npLede(p,s){const h=npHash(s);const town=S.year<1990?'this town':'Hollywood';const intro=[`The talk of ${town} this week was simple.`,`It was the story on everyone's lips from Burbank to Beverly Hills.`,`Few saw it coming, but by Friday it was impossible to ignore.`,`Our correspondents confirmed the news late on Thursday.`][h%4];return esc(intro+' '+p.v[h%p.v.length]+' '+p.v[(h+1)%p.v.length]+' '+p.v[(h+2)%p.v.length])}
function npGossip(){const A=(S.people&&S.people.actors||[]).filter(a=>(a.star||a.fame||0)>=50&&a.age>=18).sort((a,b)=>(b.star||0)-(a.star||0)).slice(0,12);if(A.length<2)return[];const w=wIdx();const r=i=>A[(npHash(String(w)+i))%A.length];const T=[(a,b)=>`${a.n} and ${b.n} spotted sharing a quiet dinner downtown`,(a,b)=>`Is ${a.n} feuding with ${b.n}? Insiders say the set is frosty`,(a)=>`${a.n} turns heads at a charity gala in a daring outfit`,(a)=>`${a.n} reportedly turned down a seven-figure role`,(a,b)=>`${a.n} throws a lavish birthday bash; ${b.n} not invited`,(a)=>`${a.n} seen house-hunting in the hills`];return [0,1,2].map(i=>{const a=r(i),b=r(i+5)===a?r(i+7):r(i+5);return{t:tNow(),s:T[(npHash(String(w)+'g'+i))%T.length](a,b)}})}
function npPrice(){const y=S.year;return y<1975?'15¢':y<1985?'25¢':y<1995?'50¢':y<2010?'$1.00':'$2.50'}
function newspaperView(k){k=k||NPK||'trade';NPK=k;const p=NP.find(x=>x.k===k);const L=npItems(k);const d=curDate();
 const hl=s=>{let h=s.replace(/\.$/,'');if(h.length>90)h=h.slice(0,88).replace(/\s\S*$/,'')+'…';return esc(h)};
 const lead=L[0],rest=L.slice(1,8);
 const side=NP.map(x=>`<button class="np27b ${x.k===k?'on':''}" style="font-family:${x.f};color:${x.c}" onclick="newspaperView('${x.k}')">${x.n}</button>`).join('');
 modal(`<div class="np27"><div class="np27top"><div class="np27side"><small>NEWS</small>${side}</div><button class="np27x" onclick="modal();render()" aria-label="Close">✕</button></div>
 <div class="np27paper"><div class="np27mast" style="font-family:${p.f};color:${p.c}">${p.n}</div><div class="np27tag">${p.tag}</div>
 <div class="np27rule"><span>VOL. ${S.year-1880}</span><span>${DOW[d.getDay()].toUpperCase()}, ${MON[d.getMonth()].toUpperCase()} ${d.getDate()}, ${S.year}</span><span>${npPrice()}</span></div>
 ${lead?`<h2 class="np27h">${hl(lead.s)}</h2><p class="np27p">${npLede(p,lead.s)}</p>`:'<p class="np27p">A quiet week. Our reporters are on the case.</p>'}
 ${rest.length?`<div class="np27cols">${rest.map(n=>`<div class="np27i"><b>${hl(n.s)}</b><span>${p.v[npHash(n.s)%p.v.length]}</span></div>`).join('')}</div>`:''}
 </div></div>`)}
let NPK='trade';
newsModal=function(){newspaperView()};
hq8=(function(o){return function(){let h=o();try{h=h.replace(`onclick="TAB='world';render()">All news</button>`,`onclick="newspaperView()">Read the papers</button>`)}catch(e){}return h}})(hq8);

/* ---------- Writers Guild ---------- */
const absM=()=>tNow();
function guildInit(){if(!S.guild)S.guild={mood:60,next:tNow()+RI(14,30),warned:0,deals:[],exempt:0}}
function guildDemand(){const y=S.year;return y<1980?'a higher minimum pay for screenplays':y<1990?'a share of the new home video money':y<2005?'residuals from cable and DVD sales':y<2015?'a share of internet and download money':'streaming residuals and protection from AI-written scripts'}
function guildTick(){if(!S||S.over)return;guildInit();const G=S.guild;
 S.ev=S.ev||{};S.ev.cd_wga=99999;/* strikes now come from contract talks, not at random */
  if(!G.warned&&tNow()>=G.next-3){G.warned=1;urgentCall('Writers Guild','Contract talks in 3 months',`The Writers Guild contract runs out in three months. They want <b>${guildDemand()}</b>. If talks fail, writers could strike: commissioned scripts would stop and the script market would dry up. You may want to start scripts now.`,'guildInfo()')}
 if(tNow()>=G.next&&!G.open){G.open=1;QUEUE.push(()=>guildTalks())}
 else if(G.open&&tNow()>=G.next+2){G.open=0;G.warned=0;G.next=tNow()+36;S.ev.feeMult=(S.ev.feeMult||1)*1.03;G.deals.push(`${S.year}: lawyers settled it for you`);addNews(`✍️ The Writers Guild signs a new contract after your lawyers settle the talks.`)}
 if(G.mood<30&&Math.random()<.06){S.rep=Math.max(0,(S.rep||0)-1);addNews(`✊ Writers picket outside ${esc(S.name)}, accusing the studio of treating them unfairly.`)}}
function guildInfo(){guildInit();const G=S.guild;const m=Math.max(0,G.next-tNow());
 modal(`<div class="g27"><div class="g27badge">✍️</div><small class="muted">The Writers Guild</small><h2>Union relations</h2>
 <div class="card"><div class="row"><span>Guild mood</span><b style="color:${G.mood>=60?'#1F9D5C':G.mood<35?'#D63A3F':'#B5821C'}">${Math.round(G.mood)}/100</b></div>${bar(G.mood)}
 <div class="row" style="margin-top:10px"><span>Next contract talks</span><b>${m?`in ${m} month${m>1?'s':''}`:'now'}</b></div>
 <div class="row" style="margin-top:6px"><span>They want</span><b style="text-align:right;max-width:60%">${guildDemand()}</b></div>
 ${ev('wga')?`<div class="ask26" style="margin-top:10px">✊ Writers are on strike for about ${Math.max(1,S.ev.wga.until-tNow()+1)} more month(s).${G.exempt?' Your side deal keeps your writers working.':''}</div>`:''}</div>
 <p class="muted" style="font-size:13px">${G.mood>=75?'Writers like working with you. Your commissioned drafts come out a little stronger.':G.mood<35?'Writers resent your studio. Expect protests and a real risk of a strike.':'Relations are businesslike.'}</p>
 ${(G.deals||[]).length?`<small class="psec">History</small><div class="muted" style="font-size:13px">${G.deals.slice(-5).map(esc).join('<br>')}</div>`:''}
 <button class="btn ghost" onclick="modal();render()">Close</button></div>`)}
function guildTalks(){guildInit();const G=S.guild;const sd=+(0.6*I()).toFixed(2);
 const opt=(k,t,d)=>`<button class="card lrow g27o" onclick="guildChoose('${k}')"><span style="flex:1;text-align:left"><b>${t}</b><br><small class="muted">${d}</small></span><b>›</b></button>`;
 MKEEP=true;modal(`<div class="g27"><div class="g27badge">✊</div><small class="muted">Every three years</small><h2>Writers Guild contract talks</h2>
 <p>The guild wants <b>${guildDemand()}</b>. Guild mood: <b style="color:${G.mood>=60?'#1F9D5C':G.mood<35?'#D63A3F':'#B5821C'}">${Math.round(G.mood)}</b>.</p>
 ${opt('fair','🤝 Offer a fair deal','Talent fees +6% from now on. No strike. Guild mood +15')}
 ${opt('mid','⚖️ Meet in the middle',`Fees +3%. Small chance of a strike (${Math.round(clamp((70-G.mood)/150,.05,.3)*100)}%)`)}
 ${opt('hard','🥊 Play hardball',`No raise. Guild mood −20. Real chance of a strike (${Math.round(clamp((95-G.mood)/110,.25,.75)*100)}%)`)}
 ${opt('side',`🧾 Side deal (${M(sd)})`,'Pay the guild directly so your writers keep working even if others strike. Other studios will resent it (reputation −3)')}
 </div>`)}
function guildChoose(k){const G=S.guild;let ch=0;const y=S.year;
 if(k==='fair'){S.ev.feeMult=(S.ev.feeMult||1)*1.06;G.mood=clamp(G.mood+15,0,100);G.deals.push(`${y}: fair deal`)}
 if(k==='mid'){S.ev.feeMult=(S.ev.feeMult||1)*1.03;ch=clamp((70-G.mood)/150,.05,.3);G.mood=clamp(G.mood+3,0,100);G.deals.push(`${y}: met in the middle`)}
 if(k==='hard'){ch=clamp((95-G.mood)/110,.25,.75);G.mood=clamp(G.mood-20,0,100);G.deals.push(`${y}: played hardball`)}
 if(k==='side'){const c=+(0.6*I()).toFixed(2);S.cash-=c;S.ev.feeMult=(S.ev.feeMult||1)*1.04;ch=clamp((80-G.mood)/150,.05,.35);G.mood=clamp(G.mood+5,0,100);G.exempt=1;S.rep=Math.max(0,(S.rep||0)-3);G.deals.push(`${y}: side deal`);addNews(`🧾 ${esc(S.name)} cuts a private deal with the Writers Guild. Rival studios are furious.`)}
 G.open=0;G.warned=0;G.next=tNow()+36;
 if(Math.random()<ch){const m=RI(3,6);S.ev.cd_wga=0;startEv('wga',m);S.ev.cd_wga=99999;S.ev.feeMult*=1.02;G.deals[G.deals.length-1]+=` → ${m}-month strike`;
  addNews(`✊ Talks collapse. The Writers Guild goes on strike (${m} months expected). Script sales freeze across town.`);
  modal(`<div class="g27"><div class="g27badge">✊</div><h2>The writers walk out</h2><p>Talks have collapsed. The strike could last about <b>${m} months</b>.</p><div class="card muted" style="font-size:13px">• No new scripts in the market<br>• ${G.exempt?'Your side deal keeps your own writers working':'Your commissioned scripts are paused'}<br>• Fees rise a little when it ends</div><button class="btn gold" onclick="modal();runQueue()">Continue</button></div>`)}
 else{if(k!=='side')G.exempt=0;addNews(`✍️ ${esc(S.name)} and the Writers Guild sign a new three-year contract.`);modal(`<div class="g27"><div class="g27badge">🤝</div><h2>Contract signed</h2><p>No strike. The next talks are in three years.</p><button class="btn gold" onclick="modal();runQueue()">Continue</button></div>`)}
 save()}
/* guild exemption lets your commissions continue during a strike; a happy guild writes slightly better drafts */
drTick=(function(o){return function(){if(S&&S.guild&&S.guild.exempt&&ev('wga')){const w=S.ev.wga;delete S.ev.wga;try{o()}finally{S.ev.wga=w}return}return o()}})(drTick);
drScore=(function(o){return function(w,g,b,sp){const sc=o(w,g,b,sp);try{if(S.guild&&S.guild.mood>=75)Object.keys(sc).forEach(k=>sc[k]=clamp(sc[k]+2,5,99))}catch(e){}return sc}})(drScore);
/* writer events now ring the phone because they matter */
addInbox=(function(o){return function(icon,from,title,body,act){o.apply(this,arguments);try{if(icon==='💸'&&/Bonus request/.test(title)){try{sfx('ring')}catch(e){}}}catch(e){}}})(addInbox);
const _nm27=nextMonth;nextMonth=function(){const r=_nm27.apply(this,arguments);try{guildTick()}catch(e){console.error(e)}return r};
weekRows=(function(o){return function(){const r=o();try{guildInit();const G=S.guild;const m=G.next-tNow();if(m<=3&&m>0)r.push(['#D63A3F',`✊ Writers Guild talks in <b>${m} month${m>1?'s':''}</b>`,'guildInfo()']);if(ev('wga'))r.unshift(['#D63A3F',`✊ Writers' strike${G.exempt?' · your writers keep working':''}`,'guildInfo()'])}catch(e){}return r}})(weekRows);
writersRoom=(function(o){return function(){o();try{guildInit();const G=S.guild;const el=document.querySelector('#modal h2');if(el)el.insertAdjacentHTML('afterend',`<button class="card lrow" style="margin:6px 0 10px" onclick="guildInfo()"><span style="flex:1;text-align:left"><b>✊ Writers Guild</b><br><small class="muted">Mood ${Math.round(G.mood)}/100 · talks in ${Math.max(0,G.next-tNow())} months${ev('wga')?' · ON STRIKE':''}</small></span><b>›</b></button>`)}catch(e){}}})(writersRoom);
/* ---------- tidier home: Create row, balanced grids, settings in the header ---------- */
hq8=(function(o){return function(){let h=o();try{
 h=h.replace(/<button class="qt" onclick="openPhone\(\)">[\s\S]*?<\/button>/g,'').replace(/<button class="qt" onclick="settings\(\)">[\s\S]*?<\/button>/g,'');
 h=h.replace('<div class="qrow">','<h4 class="hh">Create</h4><div class="qrow q5">');
 h=h.replace(/<div class="tgrid">([\s\S]*?)<\/div>(?=\s*(<button class="more|<h4|$))/g,(m,inner)=>{const n=(inner.match(/class="qt"/g)||[]).length;const c=n===4?4:n===2?2:3;return `<div class="tgrid" style="grid-template-columns:repeat(${c},minmax(0,1fr))">${inner}</div>`});
}catch(e){}return h}})(hq8);
topbar=(function(o){return function(){let h=o();try{h=h.replace(/(<span class="tb-date"[^>]*>)Prestige [^·<]*·\s*([^·<]*?)\s*(?:·\s*wk[^<]*?)?\s*📅<\/span>/,'$1📅 $2</span>');h=h.replace(/(<button class="tb-ib" aria-label="Open phone")/,`<button class="tb-ib tb-gear" aria-label="Settings" onclick="settings()">${ic('gear')}</button>$1`)}catch(e){}return h}})(topbar);
