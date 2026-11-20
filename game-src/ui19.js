/* ===================== v14 — talent overhaul: a real industry, tiers, agents, availability, stat rings, chemistry reads ===================== */

/* ---------- more names ---------- */
FIRST_M.push('Adrian','Bastian','Cyrus','Damon','Emil','Fabian','Grant','Hugo','Ivan','Jonah','Kian','Leon','Mateo','Nico','Oscar','Pierce','Quinn','Roman','Sebastian','Tobias','Vince','Wes','Xavier','Yusuf','Zane','Arlo','Beckett','Cole','Dario','Ezra','Finn','Hector','Idris','Joel','Kenji','Lorenzo','Malik','Nolan','Orion','Rohan');
FIRST_F.push('Amara','Bianca','Clara','Daria','Elena','Fiona','Gemma','Helena','Iris','Jade','Kira','Lucia','Mira','Nadia','Olivia','Paloma','Quinn','Rhea','Sienna','Tessa','Uma','Vera','Willa','Xena','Yara','Zoe','Aurora','Bella','Celeste','Dahlia','Esme','Greta','Isla','June','Leila','Margot','Noemi','Opal','Ruby','Saoirse');
LAST.push('Ashby','Barrow','Calloway','Dalton','Ellery','Fairfax','Gallardo','Hargrove','Iverson','Jaramillo','Kensington','Lockhart','Mercer','Navarro','Okafor','Pemberton','Quintero','Rourke','Sinclair','Thornton','Underwood','Valdez','Whitlock','Yamada','Zielinski','Alvarez','Beaumont','Castellanos','Delacroix','Everett','Fontaine','Grimaldi','Hayashi','Ingram','Kowalski','Laurent','Montague','Nakamura','Oyelaran','Prescott','Rasmussen','Santoro','Takahashi','Vasquez','Wolfe','Adeyemi','Bianchi','Coleman','Dubois','Esposito');

/* ---------- tiers ---------- */
const TIER_L={A:'A-list',B:'B-list',M:'Working actor',R:'Rising star',C:'Character actor'};
function tierOfA(a){return a.star>=80?'A':a.star>=60?'B':a.age<=27&&a.star<40?'R':a.skill>=74&&a.star<45&&a.age>=36?'C':'M'}
const TIER_MIX={A:14,B:36,M:90,R:55,C:45};const CREW_N={directors:60,writers:50,composers:28,dps:28};
function mkActorT(tk,t,g){const a=mkActor(tk,t==='R',g);
 if(t==='A'){a.star=RI(80,97);a.skill=clamp(RI(62,96),20,99);a.age=RI(28,62)}
 else if(t==='B'){a.star=RI(60,79);a.age=RI(24,62)}
 else if(t==='M'){a.star=RI(30,59);a.age=RI(23,60)}
 else if(t==='R'){a.star=RI(5,36);a.age=RI(18,27)}
 else if(t==='C'){a.star=RI(10,43);a.skill=RI(74,97);a.age=RI(38,74)}
 return a}
function topUpTalent(news){if(!S||!S.people)return;const P=S.people;const tk=takenNames();const cnt={A:0,B:0,M:0,R:0,C:0};P.actors.forEach(a=>cnt[tierOfA(a)]++);
 for(const t in TIER_MIX){while(cnt[t]<TIER_MIX[t]){const g=P.actors.filter(x=>x.g==='F').length<P.actors.length/2?'F':'M';const a=mkActorT(tk,t,g);if(tierOfA(a)!==t){cnt[tierOfA(a)]++;P.actors.push(a);continue}P.actors.push(a);cnt[t]++;if(news&&t==='R'&&Math.random()<.25)addNews(`🌟 Breakout newcomer ${esc(a.n)} signs with a top agency.`)}}
 for(const k in CREW_N)while(P[k].length<CREW_N[k])P[k].push(mkCrew(tk,k[0]))}
genPeople=(function(o){return function(){const P=o();const keep=S;S={people:P};try{topUpTalent(false)}catch(e){}S=keep;return P}})(genPeople);
refreshTalent=(function(o){return function(){o();try{topUpTalent(true);rivalAgents()}catch(e){}}})(refreshTalent);

/* ---------- agents & availability ---------- */
function wctx(){const w=(typeof W!=='undefined'&&W)||{};const d=w.dir?person(w.dir):null;return {q:w.script?w.script.q:60,dir:d?d.fame:40,big:['big','tent'].includes(w.tier)||(w.prod||0)>=80*I()}}
function rivalBook(x){const t=tNow();return (S.rivalFilms||[]).find(f=>(f.lead===x.id||f.dir===x.id)&&t>=f.t-7&&t<=f.t-4)}
function availA(a){if(!S)return{ok:true};if(busy(a))return{ok:false,why:'⏳ Busy on another shoot'};
 const rb=rivalBook(a);if(rb)return{ok:false,why:`🎬 Shooting for ${esc(rb.studio.split(' ')[0])} until ${tLabel(rb.t-4)}`};
 const rel=(a.rel||0)>=30?10:(a.rel||0)<=-30?-8:0;const c=wctx();
 if(a.star>=80){const need=Math.ceil(a.star-28-rel);if(S.rep<need)return{ok:false,why:`🔒 Agent: “Call us at prestige ${need}”`};if(c.q<62&&c.dir<70&&!c.big)return{ok:false,why:'🔒 Wants a stronger script, director or budget'}}
 else if(a.star>=60){const need=Math.ceil(a.star-42-rel);if(S.rep<need)return{ok:false,why:`🔒 Agent: “Not below prestige ${need}”`}}
 return{ok:true}}
function availC(c){if(!S)return{ok:true};if(busy(c))return{ok:false,why:'⏳ Busy on another project'};const rb=rivalBook(c);if(rb)return{ok:false,why:`🎬 Directing for ${esc(rb.studio.split(' ')[0])} until ${tLabel(rb.t-4)}`};
 const rel=(c.rel||0)>=30?10:0;if(c.fame>=80){const need=Math.ceil(c.fame-28-rel);if(S.rep<need)return{ok:false,why:`🔒 Agent: “Call us at prestige ${need}”`}}else if(c.fame>=60){const need=Math.ceil(c.fame-45-rel);if(S.rep<need)return{ok:false,why:`🔒 Not below prestige ${need}`}}return{ok:true}}
// rivals sign stars too (rival slate already names leads; make big names likelier on big rival films)
function rivalAgents(){if(!S.rivalFilms)return;const t=tNow();const top=S.people.actors.filter(a=>a.star>=60&&!busy(a));S.rivalFilms.filter(f=>f.t>t+4&&f.t<=t+10&&f.hype>70&&!f._star).forEach(f=>{f._star=1;const a=pick(top);if(a&&!rivalBook(a)&&Math.random()<.5)f.lead=a.id})}

/* ---------- stat rings on talent cards ---------- */
function ring(v,l){v=Math.round(clamp(v,0,99));const c=v>=75?'#1F9D5C':v>=55?'#C9962E':v>=35?'#D9822B':'#D63A3F';const C=2*Math.PI*14;return `<div class="srg"><svg viewBox="0 0 36 36" width="40" height="40"><circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" stroke-opacity=".12" stroke-width="3.4"/><circle cx="18" cy="18" r="14" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="${(C*v/100).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 18 18)"/><text x="18" y="22" text-anchor="middle" font-size="11" font-weight="800" fill="${c}">${v}</text></svg><span>${l}</span></div>`}
function fitOf(x){const w=(typeof W!=='undefined'&&W)||{};const g=w.script&&w.script.genre;if(!g)return null;return x.spec===g?88+((x.skill||50)>80?6:0):w.g2&&x.spec===w.g2?70:42+((x.skill||50)-50)*.4}
function ringsA(a){const intl=clamp(a.star*.85+(a.nat&&a.nat!=='USA'?10:0)+((a.traits||[]).includes('linguist')?10:0),1,99);const f=fitOf(a);return `<div class="srgs">${ring(a.star,'Domestic')}${ring(intl,'Intl.')}${ring(a.skill,'Critics')}${f!=null?ring(f,'Fit'):''}</div>`}
function ringsC(c){const f=fitOf(c);return `<div class="srgs">${ring(c.skill,'Craft')}${ring(c.fame,'Fame')}${ring(clamp(c.skill*.6+c.fame*.4,1,99),'Critics')}${f!=null?ring(f,'Fit'):''}</div>`}
personCard=(function(o){return function(x,sel,onclick,isA,locked,extra){let h=o(x,sel,onclick,isA,locked,extra);try{const t=isA?tierOfA(x):null;const badge=t?`<span class="tierb tier${t}">${TIER_L[t]}</span>`:'';
 if(locked)h=h.replace('<span class="tag good">✔ Available</span>','');h=h.replace(/<div style="margin-top:8px">[\s\S]*?<\/div>\s*<div class="tags">/,`${badge}${isA?ringsA(x):ringsC(x)}<div class="tags">`)}catch(e){}return h}})(personCard);

/* ---------- chemistry reads ---------- */
function chemPair(a,b){const k=[a,b].sort().join('|');const v=(hashStr(k)%1300)/100-6.5;const A=person(a),B=person(b);let bonus=0;if(A&&B){if(A.spec===B.spec)bonus+=1.2;if(Math.abs((A.age||35)-(B.age||35))>25)bonus-=1.5}return clamp(v+bonus,-7,7)}
function chemRead(){if(!W||!W.lead||!W.co)return;const fee=+(.08*I()).toFixed(2);if(S.cash<fee)return toast('Not enough cash');S.cash-=fee;W.chem=W.chem||{};const k=[W.lead,W.co].sort().join('|');W.chem[k]=chemPair(W.lead,W.co);hap('tap');MKEEP=true;wiz()}
function chemCard(){if(!W||W.step!==2||!W.lead||!W.co)return '';const k=[W.lead,W.co].sort().join('|');const v=W.chem&&W.chem[k];const A=person(W.lead),B=person(W.co);
 const lab=v==null?'':v>=4?['🔥 Electric','pos']:v>=1.5?['✨ Good spark','pos']:v>-1.5?['🙂 Fine','gold']:v>-4?['😐 Awkward','neg']:['🧊 No chemistry','neg'];
 return `<div class="card prem chem"><div class="row"><b>🎭 Chemistry read</b>${v!=null?`<b class="${lab[1]}">${lab[0]}</b>`:''}</div><div class="chempair">${portrait(A,52)}<span>${v==null?'?':'♥'}</span>${portrait(B,52)}</div><p class="muted" style="font-size:12.5px">${v==null?`Bring ${esc(A.n.split(' ')[0])} and ${esc(B.n.split(' ')[0])} in to read a scene together before you sign them.`:v>=1.5?'They play off each other beautifully. Audiences will feel it.':v>-1.5?'Professional. Nothing special, nothing wrong.':'It felt forced. Consider recasting the co-star.'}</p>${v==null?`<button class="btn sm gold" onclick="chemRead()">Hold a read · ${M(.08*I())}</button>`:''}</div>`}
wiz=(function(o){return function(){o();try{if(W&&W.step===2){const box=document.querySelector('#app');const btns=box?[...box.querySelectorAll('button.btn.gold')]:[];const nx=btns.find(b=>/Next: Crew/.test(b.textContent));const html=chemCard();if(nx&&html)nx.insertAdjacentHTML('beforebegin',html)}}catch(e){}}})(wiz);
greenlight=(function(o){return function(){const n=S.projects.length;const r=o.apply(this,arguments);try{if(S.projects.length>n){const p=S.projects[S.projects.length-1];if(p.cast&&p.cast.lead&&p.cast.co)p.chem=+clamp(chemPair(p.cast.lead,p.cast.co)+R(-1.5,1.5),-9,9).toFixed(1)}}catch(e){}return r}})(greenlight);

/* ---------- migrate existing saves to the bigger industry ---------- */
render=(function(o){return function(){try{if(S&&S.people&&!S.pool14){S.pool14=1;topUpTalent(false)}}catch(e){}return o()}})(render);
