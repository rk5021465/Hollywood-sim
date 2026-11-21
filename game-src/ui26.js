/* ===== v18.6 · Commissioned scripts: hire a writer, wait, get a draft report ===== */
const DR_AREAS=[['hook','Hook / premise'],['story','Story structure'],['characters','Characters'],['dialogue','Dialogue'],['originality','Originality'],['commercial','Commercial appeal'],['awards','Awards potential']];
const DR_BRIEFS=[['crowd','🍿 Crowd-pleaser','Broad and fun'],['prestige','🏆 Prestige','Aim for awards'],['franchise','🌟 Franchise starter','Built to grow']];
const DR_SPEEDS=[['rush','⚡ Rushed',.6,1.25,-9],['normal','🕰 Normal',1,1,0],['slow','🌿 Take your time',1.45,1.1,6]];
const absW=()=>tNow()*4+(S.wk||0);
function drCap(){return Math.min(5,2+Math.floor((S.rep||0)/35))}
function drActive(){return (S.drafts||[]).filter(d=>d.status==='writing')}
function drWeeks(w,g,speed){const gd=GEN[g].days||100;let wk=6+gd/20-(w.skill-55)/10;if(hasT(w,'hardworking'))wk*=.85;if(hasT(w,'lazy'))wk*=1.25;wk*=DR_SPEEDS.find(s=>s[0]===speed)[2];return clamp(Math.round(wk),3,18)}
function drFee(w,speed){return +(crewFee(w,'writers')*DR_SPEEDS.find(s=>s[0]===speed)[3]).toFixed(2)}
function drOverall(sc){return Math.round(sc.hook*.2+sc.story*.25+sc.characters*.25+sc.dialogue*.15+sc.originality*.15)}
function drGrade(v){const g=['F','D','D+','C−','C','C+','B−','B','B+','A−','A','A+'];return g[clamp(Math.round((v-28)/6),0,11)]}
const DR_NOTE={hook:[[78,'One-line sellable'],[60,'Clear premise'],[45,'Familiar idea'],[0,'Hard to sum up']],story:[[78,'Tight, builds to a great finish'],[60,'Solid structure'],[45,'Middle sags'],[0,'Plot has real holes']],characters:[[78,'A role stars will want'],[60,'Likeable leads'],[45,'Thin supporting cast'],[0,'Hard to root for anyone']],dialogue:[[78,'Sharp and quotable'],[60,'Natural'],[45,'Clunky in places'],[0,'Stiff, needs polish']],originality:[[78,'Fresh take'],[60,'Some new ideas'],[45,'Seen it before'],[0,'Very derivative']],commercial:[[78,'Broad audience'],[60,'Good mainstream pull'],[45,'Niche'],[0,'A hard sell']],awards:[[78,'Real awards contender'],[60,'Could get noticed'],[45,'Unlikely'],[0,'No chance']]};
const drNote=(k,v)=>DR_NOTE[k].find(x=>v>=x[0])[1];

function drScore(w,g,brief,speed){const sp=DR_SPEEDS.find(s=>s[0]===speed)[4];const base=w.skill*.72+14+(S.rep||0)/22+(w.spec===g?8:0)+sp;
 const n=()=>R(-13,13);const sc={hook:base+n(),story:base+n(),characters:base+n(),dialogue:base+n(),originality:base+n(),commercial:base*.6+25+GEN[g].crowd*1.5+n(),awards:base*.55+GEN[g].award*30+n()};
 if(brief==='crowd'){sc.commercial+=12;sc.hook+=4;sc.awards-=10}
 if(brief==='prestige'){sc.awards+=12;sc.originality+=6;sc.commercial-=8}
 if(brief==='franchise'){sc.commercial+=8;sc.hook+=6;sc.originality-=4}
 if(hasT(w,'method'))sc.characters+=4;
 Object.keys(sc).forEach(k=>sc[k]=clamp(Math.round(sc[k]),5,99));return sc}

function drScript(d){const sc=d.sc,q=drOverall(sc);const o=d.scObj||(d.scObj={});
 const ord=DR_AREAS.slice(0,5).map(a=>[a[0],sc[a[0]]]).sort((a,b)=>b[1]-a[1]);
 Object.assign(o,{type:'Original idea',genre:d.genre,title:d.title,q,hype:Math.max(0,Math.round((sc.hook-60)/3+(sc.commercial-60)/4)),crit:clamp(Math.round((sc.awards-60)/7),-3,6),fr:d.brief==='franchise'?.7:sc.commercial>=80?.5:0,writer:d.writer,cost:0,own:1,_draft:d.id,chars:sc.characters,
  cov:`Draft grade ${drGrade(q)}. Best: ${DR_AREAS.find(a=>a[0]===ord[0][0])[1].toLowerCase()} (${(ord[0][1]/10).toFixed(1)}). Weakest: ${DR_AREAS.find(a=>a[0]===ord[4][0])[1].toLowerCase()} (${(ord[4][1]/10).toFixed(1)}). Already paid for.`});return o}

function commission(){const c=W.com;const w=person(c.writer);if(!w)return toast('Pick a writer');if(drActive().length>=drCap())return toast(`Your writers' room is full (${drCap()} at once)`);
 const fee=drFee(w,c.speed);if(S.cash<fee-creditLimit())return toast('Not enough cash');
 const wk=drWeeks(w,c.genre,c.speed);const d={id:S.id++,title:(c.title||genTitle(c.genre)).trim()||genTitle(c.genre),genre:c.genre,brief:c.brief,speed:c.speed,writer:w.id,fee,startW:absW(),doneW:absW()+wk,status:'writing',kind:'draft',rewrites:0,log:[]};
 S.cash-=fee;if(typeof logTx==='function')try{logTx(-fee,'Script: '+d.title)}catch(e){}
 w.busy=Math.max(w.busy||-1,Math.floor(d.doneW/4));S.drafts=S.drafts||[];S.drafts.push(d);
 addNews(`✍️ ${esc(S.name)} hires ${esc(w.n)} to write <i>${esc(d.title)}</i>.`);if(typeof hap==='function')hap('confirm');save();render();toast(`✍️ ${esc(w.n)} starts writing · about ${wk} weeks`)}

function drTick(){if(!S||!S.drafts)return;const now=absW();{const used=new Set(S.projects.map(p=>p.title).concat(S.films.map(f=>f.title)));S.drafts=S.drafts.filter(d=>!(d.status==='done'&&used.has(d.title)))}
 S.drafts.filter(d=>d.status==='writing').forEach(d=>{const w=person(d.writer);
  if(d.lastW===now)return;d.lastW=now;
  if(ev('wga')){d.doneW++;if(!d.strikeNote){d.strikeNote=1;d.log.push('Paused by the writers\' strike')}return}
  if(d.ask){d.doneW++;return}
  if(d.kind==='draft'&&now<d.doneW-1&&w){const r=Math.random();
   if(r<.035){const n=RI(1,3);d.doneW+=n;d.log.push(`Writer's block: ${n} week${n>1?'s':''} late`);addInbox('✍️',w.n,`${d.title} is running late`,`${w.n} has writer's block. Expect the draft about ${n} week${n>1?'s':''} later.`)}
   else if(r<.05&&!d.asked){d.asked=1;d.ask=+(d.fee*.3).toFixed(2);addInbox('💸',w.n,`Bonus request on ${d.title}`,`${w.n} wants a ${M(d.ask)} bonus to keep going. Open Writers' room to answer.`,'writersRoom()');toast(`💸 ${esc(w.n)} wants a bonus to finish <i>${esc(d.title)}</i>`)}
   else if(r<.058&&!hasT(w,'hardworking')){d.quit=1;d.doneW=now}}
  if(now>=d.doneW)drFinish(d)})}

function drFinish(d){const w=person(d.writer);d.status='done';d.doneAt=absW();
 if(d.kind==='draft'){d.sc=drScore(w||{skill:50,spec:''},d.genre,d.brief,d.speed);if(d.quit){Object.keys(d.sc).forEach(k=>d.sc[k]=clamp(d.sc[k]-RI(10,18),5,99));d.log.push(`${w?w.n:'The writer'} quit. You got an unfinished draft`)}if(d.bonusNo){Object.keys(d.sc).forEach(k=>d.sc[k]=clamp(d.sc[k]-RI(2,7),5,99));d.log.push('Writer finished unhappy after you refused the bonus')}}
 else if(d.kind==='rewrite'){const ks=DR_AREAS.slice(0,5).map(a=>a[0]).sort((a,b)=>d.sc[a]-d.sc[b]).slice(0,2);const pw=Math.max(.35,1-d.rewrites*.25);ks.forEach(k=>{const g=Math.round(R(4,10)*pw*((w?w.skill:60)/70));d.sc[k]=clamp(d.sc[k]+g,5,99)});if(Math.random()<.25){const k=pick(['originality','hook']);d.sc[k]=clamp(d.sc[k]-RI(1,4),5,99)}d.log.push(`Rewrite #${d.rewrites} done: ${ks.map(k=>DR_AREAS.find(a=>a[0]===k)[1].toLowerCase()).join(' and ')} improved`)}
 else if(d.kind==='doctor'){const doc=person(d.doc);const k=d.area;const s=doc?doc.skill:60;const g=Math.round(Math.max(2,(s-d.sc[k])*.5+3));d.sc[k]=clamp(d.sc[k]+g,5,99);d.log.push(`${doc?doc.n:'Script doctor'} polished the ${DR_AREAS.find(a=>a[0]===k)[1].toLowerCase()} (+${(g/10).toFixed(1)})`)}
 d.kind='done';delete d.ask;drScript(d);const q=d.scObj.q;
 if(w&&q>=75&&!d.fameGiven){d.fameGiven=1;w.fame=clamp(w.fame+RI(2,4),1,99);w.skill=clamp(w.skill+1,20,99)}
 addInbox('📜',w?w.n:'Writers',`Draft ready: ${d.title}`,`Grade ${drGrade(q)}. Open the report to see its strengths and weaknesses.`,`drView(${d.id})`);
 toast(`📜 Draft ready: <i>${esc(d.title)}</i> · grade ${drGrade(q)}`);if(typeof sfx==='function')try{sfx('win')}catch(e){}}

function drAnswer(id,pay){const d=(S.drafts||[]).find(x=>x.id===id);if(!d||!d.ask)return;if(pay){S.cash-=d.ask;if(typeof logTx==='function')try{logTx(-d.ask,'Writer bonus')}catch(e){}d.log.push(`You paid a ${M(d.ask)} bonus`)}else{d.bonusNo=1;d.log.push('You refused the bonus');const w=person(d.writer);if(w)w.rel=clamp((w.rel||0)-10,-100,100)}delete d.ask;save();writersRoom()}

/* ---------- views ---------- */
function drCard(d){const w=person(d.writer);const now=absW();
 if(d.status==='writing'){const tot=Math.max(1,d.doneW-d.startW),done=clamp(now-d.startW,0,tot);const left=Math.max(0,d.doneW-now);const lab={draft:'Writing first draft',rewrite:'Rewriting',doctor:'Script doctor at work'}[d.kind];
  return `<div class="card dr26"><div class="pcard">${portrait(w,44)}<div style="flex:1;min-width:0"><div class="row"><b class="ellip">${GEN[d.genre].icon} ${esc(d.title)}</b><small>${left?left+' wk left':'Due now'}</small></div><small class="muted" style="text-transform:none;letter-spacing:0">${lab} · ${esc(w?w.n:'')}${ev('wga')?' · ⏸ strike':''}</small></div></div>${bar(Math.round(done/tot*100))}
  ${d.ask?`<div class="ask26">💸 <b>${esc(w?w.n:'')}</b> wants a <b>${M(d.ask)}</b> bonus to keep going.<div class="row" style="margin-top:8px;gap:8px"><button class="btn sm gold" style="margin:0;flex:1" onclick="drAnswer(${d.id},1)">Pay</button><button class="btn sm ghost" style="margin:0;flex:1" onclick="drAnswer(${d.id},0)">Refuse</button></div></div>`:''}</div>`}
 const q=d.scObj?d.scObj.q:drOverall(d.sc);
 return `<button class="card lrow dr26" onclick="drView(${d.id})"><span class="grd26 g${drGrade(q)[0]}">${drGrade(q)}</span><span style="flex:1;text-align:left"><b>${GEN[d.genre].icon} ${esc(d.title)}</b><br><small class="muted">by ${esc(w?w.n:'')} · ${d.rewrites?d.rewrites+' rewrite'+(d.rewrites>1?'s':'')+' · ':''}tap for report</small></span><b>›</b></button>`}

function writersRoom(){const ds=S.drafts||[];const act=ds.filter(d=>d.status==='writing'),fin=ds.filter(d=>d.status==='done');
 modal(`<h2>Writers' room</h2><p class="muted" style="font-size:13px;margin:-4px 0 10px">Hire writers to create scripts you own. Up to <b>${drCap()}</b> at once (more as your studio's reputation grows).</p>
 <button class="btn gold" onclick="modal();startFilm();W.mode='orig';wiz()">✍️ Commission a new script</button>
 ${act.length?`<div class="sec"><h2>Being written</h2></div>${act.map(drCard).join('')}`:''}
 ${fin.length?`<div class="sec"><h2>Finished drafts</h2></div>${fin.map(drCard).join('')}`:''}
 ${!ds.length?'<div class="empty">No scripts in development yet.</div>':''}`)}

function drView(id){const d=(S.drafts||[]).find(x=>x.id===id);if(!d)return writersRoom();if(d.status!=='done')return writersRoom();const w=person(d.writer);const s=drScript(d);const sc=d.sc;
 const rows=DR_AREAS.map(([k,l])=>{const v=sc[k];const c=v>=70?'#1F9D5C':v<50?'#D63A3F':'#B5821C';return `<div class="drrow"><span>${l}</span><b style="color:${c}">${(v/10).toFixed(1)}</b><span class="bar26"><i style="width:${v}%;background:${c}"></i></span><small>${drNote(k,v)}</small></div>`}).join('');
 const est=GEN[d.genre].budget*(d.brief==='franchise'?1.3:d.brief==='prestige'?.75:1)*(typeof I==='function'?I():1)/1;
 const stars=sc.characters>=78?'Top stars will want the lead role':sc.characters>=60?'Solid actors will sign on':'Harder to attract big names';
 const dirs=s.q>=75?'Respected directors will be interested':s.q>=55?'Working directors will take it':'Only hungry newcomers will direct it';
 const docs=S.people.writers.filter(x=>x.id!==d.writer&&!busy(x)).sort((a,b)=>b.skill-a.skill).slice(0,3);
 const weak=DR_AREAS.slice(0,5).map(a=>a[0]).sort((a,b)=>sc[a]-sc[b])[0];
 const rwCost=+(d.fee*.35).toFixed(2),docCost=x=>+(crewFee(x,'writers')*.5).toFixed(2);
 const canRw=w&&!busy(w)&&d.rewrites<3;
 MKEEP=true;modal(`<div class="drhead"><span class="grd26 big g${drGrade(s.q)[0]}">${drGrade(s.q)}</span><div><small class="muted">First draft report${d.rewrites?' · after '+d.rewrites+' rewrite'+(d.rewrites>1?'s':''):''}</small><h2 style="margin:2px 0">${esc(d.title)}</h2><small class="muted">${GEN[d.genre].icon} ${d.genre} · ${DR_BRIEFS.find(b=>b[0]===d.brief)[1]} · by ${esc(w?w.n:'')}</small></div></div>
 <div class="card">${rows}</div>
 <div class="card"><div class="row"><span>Overall script quality</span><b>${(s.q/10).toFixed(1)}/10</b></div><div class="row" style="margin-top:6px"><span>Suggested budget</span><b>~${M(est)}</b></div><div class="muted" style="font-size:13px;margin-top:8px">⭐ ${stars}<br>🎬 ${dirs}${s.hype?`<br>📣 Strong hook: +${s.hype} awareness at release`:''}${s.crit>0?`<br>🏆 Critics bonus +${s.crit}`:''}</div>
 ${d.log.length?`<div class="muted" style="font-size:12px;margin-top:8px;border-top:1px solid rgba(0,0,0,.08);padding-top:6px">${d.log.map(esc).join('<br>')}</div>`:''}</div>
 <button class="btn gold" onclick="drMake(${d.id})">🎬 Make this movie</button>
 <div class="sec"><h2>Improve it</h2></div>
 <button class="card lrow" ${canRw?`onclick="drRewrite(${d.id})"`:'disabled style="opacity:.5"'}><span style="flex:1;text-align:left"><b>✏️ Rewrite with ${esc(w?w.n:'the writer')}</b><br><small class="muted">${canRw?`${M(rwCost)} · 2–4 weeks · fixes the two weakest areas`:d.rewrites>=3?'No more rewrites: the writer is out of ideas':'Writer is busy right now'}</small></span><b>›</b></button>
 <small class="psec" style="display:block;margin:8px 0 4px">Script doctor for the ${DR_AREAS.find(a=>a[0]===weak)[1].toLowerCase()}</small>
 ${docs.map(x=>`<button class="card lrow" onclick="drDoctor(${d.id},'${x.id}','${weak}')">${portrait(x,36)}<span style="flex:1;text-align:left"><b>${esc(x.n)}</b> <small>craft ${x.skill}</small><br><small class="muted">${M(docCost(x))} · 2–3 weeks</small></span><b>›</b></button>`).join('')||'<p class="muted">No script doctors free right now.</p>'}
 <div class="pgrid2" style="margin-top:10px"><button class="btn ghost" onclick="writersRoom()">📚 Shelve it</button><button class="btn ghost" onclick="drSell(${d.id})">💰 Sell for ${M(drSellPrice(d))}</button></div>`)}

function drSellPrice(d){const q=drScript(d).q;return +(d.fee*(.3+q/90)).toFixed(2)}
function drRewrite(id){const d=S.drafts.find(x=>x.id===id);const w=person(d.writer);if(!w||busy(w))return;const c=+(d.fee*.35).toFixed(2);S.cash-=c;if(typeof logTx==='function')try{logTx(-c,'Rewrite: '+d.title)}catch(e){}
 d.rewrites++;d.kind='rewrite';d.status='writing';d.startW=absW();d.doneW=absW()+RI(2,4);w.busy=Math.max(w.busy||-1,Math.floor(d.doneW/4));save();toast(`✏️ ${esc(w.n)} is rewriting <i>${esc(d.title)}</i>`);writersRoom()}
function drDoctor(id,did,area){const d=S.drafts.find(x=>x.id===id);const x=person(did);if(!x||busy(x))return;const c=+(crewFee(x,'writers')*.5).toFixed(2);S.cash-=c;if(typeof logTx==='function')try{logTx(-c,'Script doctor: '+d.title)}catch(e){}
 d.kind='doctor';d.doc=did;d.area=area;d.status='writing';d.startW=absW();d.doneW=absW()+RI(2,3);x.busy=Math.max(x.busy||-1,Math.floor(d.doneW/4));save();toast(`🩺 ${esc(x.n)} is polishing <i>${esc(d.title)}</i>`);writersRoom()}
function drSell(id){const d=S.drafts.find(x=>x.id===id);if(!d)return;const p=drSellPrice(d);const r=(S.rivals||[]).filter(x=>x.alive);const buyer=r.length?pick(r).n:'A rival studio';S.cash+=p;if(typeof logTx==='function')try{logTx(p,'Sold script: '+d.title)}catch(e){}
 S.drafts=S.drafts.filter(x=>x!==d);addNews(`💰 ${esc(buyer)} buys the script <i>${esc(d.title)}</i> from ${esc(S.name)} for ${M(p)}.`);save();toast(`Sold to ${esc(buyer)} for ${M(p)}`);writersRoom()}
function drMake(id){const d=S.drafts.find(x=>x.id===id);if(!d)return;const s=drScript(d);modal();startFilm();if(typeof W==='undefined'||!W)return;if(!W.sc.includes(s))W.sc.unshift(s);W.mode='market';W.script=s;wiz()}

/* ---------- commission screen inside the New movie wizard ---------- */
function commissionUI(){const c=W.com=W.com||{title:genTitle('Drama'),genre:'Drama',brief:'crowd',speed:'normal',writer:null};W._role='writers';
 const ds=(S.drafts||[]);const full=drActive().length>=drCap();
 let h=ds.length?`<div class="card" style="padding:10px 12px"><div class="row"><b>Your scripts</b><button class="btn sm ghost" style="margin:0" onclick="writersRoom()">Writers' room ›</button></div>${ds.filter(d=>d.status==='done').map(d=>`<button class="lrow" onclick="drView(${d.id})"><span class="grd26 g${drGrade(drScript(d).q)[0]}">${drGrade(drScript(d).q)}</span><span style="flex:1;text-align:left;margin-left:8px">${esc(d.title)}</span><small class="muted">report ›</small></button>`).join('')}${drActive().map(d=>`<div class="lrow"><span>⏳ ${esc(d.title)}</span><small class="muted">${Math.max(0,d.doneW-absW())} wk left</small></div>`).join('')}</div>`:'';
 h+=`<div class="card"><b>✍️ Commission a script</b><p class="muted" style="font-size:13px;margin:4px 0 8px">Hire a writer. They take a few weeks, then you get a draft report showing its strong and weak areas.</p>
 <small>Working title</small><div class="row"><input type="text" maxlength="40" value="${esc(c.title)}" oninput="W.com.title=this.value"><button class="btn sm ghost" style="margin:6px 0 0" onclick="W.com.title=genTitle(W.com.genre);wiz()">🎲</button></div>
 <small style="display:block;margin-top:10px">Genre</small><div class="chips" style="margin-top:6px;flex-wrap:wrap">${GENRES.map(x=>`<button class="${c.genre===x?'on':''}" onclick="W.com.genre='${x}';W.com.title=genTitle('${x}');wiz()">${GEN[x].icon} ${x}</button>`).join('')}</div>
 <small style="display:block;margin-top:10px">Brief</small><div class="chips" style="margin-top:6px;flex-wrap:wrap">${DR_BRIEFS.map(b=>`<button class="${c.brief===b[0]?'on':''}" onclick="W.com.brief='${b[0]}';wiz()">${b[1]}</button>`).join('')}</div>
 <small style="display:block;margin-top:10px">Deadline</small><div class="chips" style="margin-top:6px;flex-wrap:wrap">${DR_SPEEDS.map(s=>`<button class="${c.speed===s[0]?'on':''}" onclick="W.com.speed='${s[0]}';wiz()">${s[1]}</button>`).join('')}</div>
 <small class="muted" style="display:block;margin-top:6px">${c.speed==='rush'?'Faster, costs 25% more, weaker draft.':c.speed==='slow'?'Takes longer, costs 10% more, better draft.':'The usual schedule.'}</small></div>
 <h3 style="margin:8px 0">Pick a writer</h3>`;
 h+=W.wrs.filter(x=>!busy(x)).map(x=>personCard(x,c.writer===x.id,`W.com.writer='${x.id}';wiz()`,false,lockC(x),`<span class="tag">⏱ ~${drWeeks(x,c.genre,c.speed)} wks</span>${x.spec===c.genre?'<span class="tag good">Genre expert</span>':''}`)).join('');
 const w=person(c.writer);
 h+=w?`<div class="card" style="position:sticky;bottom:8px;z-index:3;box-shadow:0 6px 20px rgba(0,0,0,.15)"><div class="row"><span>${esc(w.n)} · ~${drWeeks(w,c.genre,c.speed)} weeks</span><b>${M(drFee(w,c.speed))}</b></div><button class="btn gold" ${full?'disabled':''} onclick="commission()">${full?`Writers' room full (${drCap()})`:'✍️ Commission script'}</button></div>`:'';
 return h}

/* ---------- hooks ---------- */
const _wt26=weekTick;weekTick=function(){_wt26();try{drTick()}catch(e){console.error(e)}};
const _nm26=nextMonth;nextMonth=function(){const r=_nm26.apply(this,arguments);try{if(!S.over)drTick()}catch(e){console.error(e)}return r};
const _scr26=scripts;scripts=function(){const a=_scr26();const mine=(S.drafts||[]).filter(d=>d.status==='done').map(drScript).filter(s=>!a.includes(s));return mine.concat(a)};
const _gl26=greenlight;greenlight=function(){const sc=W&&W.script;const n=S.projects.length;_gl26.apply(this,arguments);try{if(sc&&sc._draft&&S.projects.length>n){S.drafts=(S.drafts||[]).filter(d=>d.id!==sc._draft);save()}}catch(e){}};
actorFee=(function(o){return function(a){const f=o(a);try{if(typeof W!=='undefined'&&W&&W.script&&W.script._draft&&(W.script.chars||0)>=78)return f*.9}catch(e){}return f}})(actorFee);
const _wr26=weekRows;weekRows=function(){const rows=_wr26();try{(S.drafts||[]).filter(d=>d.status==='done'&&d.doneAt>=absW()-1).slice(0,2).forEach(d=>rows.unshift(['#7C5CE0',`📜 Draft ready: <b>${esc(d.title)}</b> · grade ${drGrade(drScript(d).q)}`,`drView(${d.id})`]));(S.drafts||[]).filter(d=>d.ask).slice(0,1).forEach(d=>rows.unshift(['#D63A3F',`💸 ${esc(pname(d.writer))} wants a bonus for <b>${esc(d.title)}</b>`,'writersRoom()']))}catch(e){}return rows};
hq8=(function(o){return function(){let h=o();try{const n=(S.drafts||[]).filter(d=>d.status==='done'||d.ask).length;const btn=`<button class="qt" onclick="writersRoom()">${ic('bulb','#B5821C')}<span>Writers</span>${n?`<i>${n}</i>`:''}</button>`;const k=h.indexOf('<button class="qt" onclick="pitchRoom()"');if(k>=0)h=h.slice(0,k)+btn+h.slice(k)}catch(e){}return h}})(hq8);
homeRowIcon=(function(o){return function(c,t){const m=String(t);if(/Draft ready/.test(m))return '📜';if(/wants a bonus/.test(m))return '💸';return o(c,t)}})(homeRowIcon);
