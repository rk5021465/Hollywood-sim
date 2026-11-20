/* ===================== v15 — studio report, cleaner home, late-game pressure, fixes ===================== */

/* ---------- fixes ---------- */
confetti=(function(o){return function(n){setTimeout(()=>{try{document.querySelectorAll('.confetti').forEach(e=>e.remove())}catch(e){}},4500);return o(n)}})(confetti);
render=(function(o){return function(){try{document.querySelectorAll('.confetti').forEach(e=>e.remove())}catch(e){}return o()}})(render);
// crew lists: people you can actually hire first, then by fame
startFilm=(function(o){return function(){o();try{if(typeof W!=='undefined'&&W&&W.dirs){const s=(arr,lk)=>arr.sort((a,b)=>(lk(a)-lk(b))||(b.fame-a.fame));const lk=x=>lockC(x)?1:0;['dirs','comps','dps','wrs'].forEach(k=>W[k]&&s(W[k],lk));if(W.step===0||W.step===1)wiz()}}catch(e){}}})(startFilm);

/* ---------- capture the data behind every release ---------- */
releaseFilm=(function(o){return function(p){let pre=null;try{const t=tNow();const cs=castStats(p);const d=person(p.dir)||{fame:40,skill:55};pre={q:p.q||55,star:cs.star,act:cs.acting,dir:d.skill*.6+d.fame*.4,dirN:d.n||'',chem:p.chem||0,seas:CAL[t%12].mult*(CAL[t%12].g[p.genre]||1),comp:compFactor(t),trend:trendMult(p.genre,p),rep0:S.rep,mkt:p.mkt||0,paid0:p.paid||0,month:t%12,lead:(cs.L&&cs.L.n)||''}}catch(e){}
 const f=o(p);try{if(pre&&f){pre.rep1=S.rep;pre.mktSpent=Math.max(0,(f.costTotal||0)-pre.paid0);f.rpt=pre}}catch(e){}return f}})(releaseFilm);

/* ---------- grades ---------- */
function gradeL(v){v=clamp(v,0,100);return v>=93?'A+':v>=85?'A':v>=78?'A-':v>=72?'B+':v>=65?'B':v>=58?'B-':v>=51?'C+':v>=44?'C':v>=37?'C-':v>=28?'D':'F'}
function gradeC(g){return g[0]==='A'?'#1F9D5C':g[0]==='B'?'#2F6FD6':g[0]==='C'?'#C9962E':'#D63A3F'}
function rptFactors(f){const r=f.rpt;if(!r)return null;
 return [
  ['📝','Script',r.q,r.q>=75?'A sharp, well-reviewed screenplay.':r.q>=55?'Solid pages, nothing special.':'The script held the film back.'],
  ['⭐','Star power',r.star,r.star>=70?`${esc(r.lead)} brought crowds in.`:r.star>=45?'A recognisable cast.':'Few names audiences knew.'],
  ['🎭','Performances',r.act,r.act>=75?'Critics praised the acting.':r.act>=58?'Capable performances.':'Wooden performances.'],
  ['🎬','Director',r.dir,r.dir>=72?`${esc(r.dirN)} delivered.`:r.dir>=50?'Steady direction.':'Uneven direction.'],
  ['💞','Chemistry',(r.chem+9)/18*100,r.chem>=3?'The leads sparked on screen.':r.chem>=-1?'Fine on-screen chemistry.':'The pairing never clicked.'],
  ['📣','Marketing & buzz',clamp((f.hype||0)/1.15,0,100),f.hype>=90?'Everyone knew it was coming.':f.hype>=55?'Decent awareness.':'Most people never heard of it.'],
  ['📅','Release timing',(r.seas-.7)/.75*100,r.seas>=1.2?'Perfect corridor for this genre.':r.seas>=.95?'A reasonable date.':'A weak month for this kind of film.'],
  ['⚔️','Competition',(r.comp-.55)/.82*100,r.comp>=1.2?'An open weekend, all to itself.':r.comp>=.9?'Normal competition.':'Crushed by bigger releases.'],
  ['📈','Genre trend',(r.trend-.85)/.35*100,r.trend>=1.08?'Riding a hot trend.':r.trend>=.96?'Neutral trends.':'Audiences were tired of the genre.'],
  ['🍅','Reviews & word of mouth',((f.critic||50)+(f.aud||50))/2,f.aud>=75?'Great word of mouth gave it legs.':f.aud>=55?'Mixed word of mouth.':'Bad word of mouth killed its run.']]}
function rptOverall(F){const w=[1.2,1.1,.8,.8,.5,1.1,.8,.8,.6,1.3];let s=0,t=0;F.forEach((x,i)=>{s+=clamp(x[2],0,100)*w[i];t+=w[i]});return s/t}

/* ---------- the report ---------- */
function studioReport(id){const f=S.films.find(x=>x.id===id);if(!f)return;const F=rptFactors(f);const so=typeof boShown==='function'?boShown(f):{done:true,ww:f.ww};const fin=so.done;
 const own=1;const cin=(f.dom||0)+(f.intl||0);const rent=(f.domRent||0)+(f.intlRent||0);const mk=f.rpt?f.rpt.mktSpent:0;const prod=Math.max(0,(f.costTotal||0)-mk);
 const rows=[['Worldwide box office',cin,'big'],['Cinemas & local distributors keep',-(cin-rent),'neg'],['Your share from cinemas',rent,'sub'],['Home, PVOD & TV licensing',f.ancillary||0,''],['Tax rebate',f.rebate||0,''],['Production & talent',-prod,'neg'],['Marketing (P&A)',-mk,'neg']];
 if(f.backendPay)rows.push(['Star back-end deals',-f.backendPay,'neg']);if(f.partner)rows.push(['Co-financing partner',-f.partner,'neg']);if(f.sharePay)rows.push(['Profit participants',-f.sharePay,'neg']);
 const ov=F?rptOverall(F):null;const og=ov!=null?gradeL(ov):null;const best=F?F.slice().sort((a,b)=>b[2]-a[2]).slice(0,2):[];const worst=F?F.slice().sort((a,b)=>a[2]-b[2]).slice(0,2):[];
 const dRep=f.rpt?Math.round((f.rpt.rep1-f.rpt.rep0)*10)/10:null;
 modal(`<h2 style="display:none">Studio report</h2><div class="nb"><div class="nb-head">${posterSVG(f,72)}<div><small>STUDIO REPORT${fin?'':' · PROJECTED'}</small><b>${esc(f.title)}</b><span>${f.genre} · ${f.rating||''} · released ${fmtLong(relD(f))}</span>${og?`<i style="background:${gradeC(og)}">${og}</i>`:''}</div></div>
 <div class="nb-page"><div class="nb-rings">${Array.from({length:7},()=>'<i></i>').join('')}</div><h3>Box office performance</h3>
 ${F?F.map(x=>{const g=gradeL(x[2]);return `<div class="nb-row"><span>${x[0]}</span><div><b>${x[1]}</b><small>${x[3]}</small></div><em style="color:${gradeC(g)}">${g}</em></div>`}).join(''):'<p class="muted">This film was released before reports existed. Release a new film to get a full breakdown.</p>'}
 ${F?`<div class="nb-total"><span>Overall</span><em>${og}</em></div>`:''}</div>
 <div class="nb-page"><div class="nb-rings">${Array.from({length:7},()=>'<i></i>').join('')}</div><h3>Film financials</h3>
 ${rows.map(r=>`<div class="nb-fin ${r[2]}"><span>${r[0]}</span><b class="${r[1]<0?'neg':''}">${r[1]<0?'−':''}${M(Math.abs(r[1]))}</b></div>`).join('')}
 <div class="nb-pl ${f.profit>=0?'up':'down'}"><span>Profit / loss</span><b>${f.profit>=0?'':'−'}${M(Math.abs(f.profit))}</b></div></div>
 ${F?`<div class="nb-sticky"><b>Producer’s notes</b><p>✅ ${best.map(x=>x[1].toLowerCase()).join(' and ')} carried it.</p><p>⚠️ ${worst.map(x=>x[1].toLowerCase()).join(' and ')} held it back.</p>${dRep!=null?`<p>⭐ Prestige ${dRep>=0?'+':''}${dRep}</p>`:''}</div>`:''}</div>
 <button class="btn ghost" onclick="filmModal(${f.id})">Back to the film</button>`)}
filmModal=(function(o){return function(id){o(id);try{const f=S.films.find(x=>x.id===id);if(!f||f.dist==='stream'||f.dist==='sell'||!f.weeks)return;const box=document.querySelector('#modal .modal>div');if(box&&box.insertAdjacentHTML)box.insertAdjacentHTML('afterbegin',`<button class="rptbtn" onclick="studioReport(${f.id})"><span>📒</span><div><b>Studio report</b><small>Grades, what worked, where the money went</small></div><i>›</i></button>`)}catch(e){}}})(filmModal);
// tell the player when a run ends
weekRows=(function(o){return function(){const rows=o();try{S.films.filter(f=>f.rpt&&!f.rptSeen&&f.weeks&&(boShown(f)||{}).done).slice(-2).forEach(f=>rows.unshift(['#B5821C',`📒 Final report ready: <b>${esc(f.title)}</b>`,`S.films.find(x=>x.id===${f.id}).rptSeen=1;studioReport(${f.id})`]))}catch(e){}return rows}})(weekRows);

/* ---------- cleaner home: show the essentials, tuck the rest behind “More” ---------- */
let HQMORE={};
render=(function(o){return function(){o();try{if(typeof TAB!=='undefined'&&TAB!=='hq')return;document.querySelectorAll('#app .tgrid').forEach((g,i)=>{const kids=[...g.children];if(kids.length<=6||g.dataset.m)return;g.dataset.m=1;const open=!!HQMORE[i];kids.slice(6).forEach(k=>k.classList.toggle('xhide',!open));const b=document.createElement('button');b.className='moretg';b.textContent=open?'Show less ▴':`More (${kids.length-6}) ▾`;b.onclick=()=>{HQMORE[i]=!HQMORE[i];render()};g.after(b)})}catch(e){}}})(render);

/* ---------- late game: success attracts pressure ---------- */
function bigTax(){if(!S)return 1;const c=Math.max(0,S.cash||0);return c>800?1+Math.min(.7,Math.log10(c/800)*.45):1}
function counterProgram(){if(!S||S.cash<600)return;const t=tNow();const alive=S.rivals.filter(r=>r.alive);if(!alive.length)return;
 S.projects.filter(p=>!p.vault&&p.dist==='wide'&&!p.cp&&p.releaseT>t+2&&p.releaseT<t+8&&(['big','tent'].includes(p.tier)||(p.prod||0)>90*I())).forEach(p=>{p.cp=1;if(Math.random()<.45){const r=pick(alive);const g=pick(GENRES);const title=genTitle(g);S.rivalFilms.push({t:p.releaseT,wk:p.relWk||0,lead:null,dir:null,studio:r.n,g,title,hype:RI(95,135),cp:1});addNews(`⚔️ ${esc(r.n)} dates its tentpole <i>${esc(title)}</i> against your <b>${esc(p.title)}</b>.`);try{diary('⚔️','Release-date war',`${esc(r.n)} moved <i>${esc(title)}</i> onto ${esc(p.title)}’s weekend.`)}catch(e){}}})}
const _nm15=nextMonth;nextMonth=function(){const r=_nm15.apply(this,arguments);try{if(S&&!S.over)counterProgram()}catch(e){}return r};
finalStage=(function(o){return function(f){o(f);try{if(f&&f.rpt){const a=document.getElementById('app');const btns=a?[...a.querySelectorAll('button.btn.gold')]:[];const last=btns[btns.length-1];if(last)last.insertAdjacentHTML('beforebegin',`<button class="rptbtn" onclick="studioReport(${f.id})"><span>📒</span><div><b>Studio report</b><small>Opening grades and projected financials</small></div><i>›</i></button>`)}}catch(e){}}})(finalStage);
