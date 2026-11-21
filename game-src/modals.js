/* ===== MODALS ===== */
function openModal(html,wide){const m=$('#modal');m.className='modal'+(wide?' wide':'');m.innerHTML=html;$('#veil').classList.add('show');m.scrollTop=0;setTimeout(()=>{const f=m.querySelector('[data-focus]')||m.querySelector('.mf button.gold:not([disabled])')||m.querySelector('button');f&&f.focus({preventScroll:true})},30)}
function closeModal(){$('#veil').classList.remove('show');$('#modal').innerHTML=''}
const mh=(small,title,closable=true)=>`<div class="mh"><div><small>${small}</small><h2>${title}</h2></div>${closable?'<button class="x" data-act="close" aria-label="Close">×</button>':''}</div>`;
function infoModal(small,title,text){openModal(mh(small,esc(title),false)+`<div class="mb"><p>${esc(text)}</p></div><div class="mf"><button class="btn gold" data-act="qdone">Continue</button></div>`)}

function buildingModal(key){
 const b=BLD[key],l=S.b[key]||0;const r=rankOf();
 if(key==='tower'){openModal(mh('Executive tower',esc(S.name))+`<div class="mb"><p>You are a <b class="gold">${r.r[1]}</b>.</p>${r.nx?`<p class="muted">Next rank: ${r.nx[1]}. Grow fame, prestige and profit to rise.</p><div class="bar"><i style="width:${clamp((r.sc-r.r[0])/(r.nx[0]-r.r[0])*100,2,100)}%"></i></div>`:'<p>You have reached the top of Hollywood.</p>'}<div class="est"><div><small>Fame</small><b>${Math.round(S.fame)}</b></div><div><small>Prestige</small><b>${Math.round(S.prestige)}</b></div><div><small>Reputation</small><b class="${S.rep>=0?'ok':'bad'}">${S.rep>0?'+':''}${Math.round(S.rep)}</b></div><div><small>Lifetime profit</small><b class="${S.totalProfit>=0?'ok':'bad'}">${money(S.totalProfit)}</b></div><div><small>Goldies won</small><b class="gold">${S.awards.filter(a=>a.mine).length}</b></div></div></div><div class="mf"><button class="btn gold" data-act="close">Done</button></div>`);return}
 const max=l>=b.max,cost=b.cost(l)*era();
 const parkLocked=key==='park'&&l===0&&!['Major studio','Hollywood legend'].includes(r.r[1]);
 const eff={stage:`You have ${l} sound stage${l!==1?'s':''}. ${freeStages()} free right now.`,writers:`Writes ${l} original script${l>1?'s':''} at a time, ${Math.max(2,7-l)} weeks for a mid-budget film. Rewrites add +${4+2*l} story. ${5+l} scripts on the market.`,post:`Post takes ${Math.max(1,4-Math.floor(l/2))} weeks. Post quality ${45+l*10}/100.`,marketing:`Marketing reach ×${(1+.15*(l-1)).toFixed(2)}.`,lab:l?`${l} research point${l>1?'s':''} a week, plus a prestige bonus.`:'Not built yet. You need a lab to research new technology.',backlot:l?`Built: ${BACKLOTS.slice(0,l).map(x=>x[0]).join(', ')}. Matching films cost 15% less to shoot.`:'No standing sets yet.',park:l?`Level ${l}. Earns more when your franchises are strong.`:'Not built. Needs Major studio rank and at least one franchise.'}[key];
 const next={stage:`Add sound stage ${l+1}: shoot ${l+1} films at once.`,writers:`Level ${l+1}: write ${l+1} scripts at once, faster and better. One more script on the market.`,post:`Level ${l+1}: post quality ${55+l*10}/100, faster post.`,marketing:`Level ${l+1}: marketing reach ×${(1+.15*l).toFixed(2)}.`,lab:l?`Level ${l+1}: ${l+1} research points a week.`:'Build the lab and start researching.',backlot:BACKLOTS[l]?`Build the ${BACKLOTS[l][0].toLowerCase()}: ${BACKLOTS[l][1].join(', ').toLowerCase()} films cost 15% less.`:'',park:`Level ${l+1}: more rides, more visitors.`}[key];
 openModal(mh(b.max>1?'Level '+l+' of '+b.max:'Studio',b.n)+`<div class="mb"><p class="muted">${b.d}</p><p>${eff}</p>${max?'<p class="gold">Fully upgraded.</p>':`<div class="panel" style="background:var(--p2)"><b>${next}</b><div class="muted" style="margin-top:4px">Costs ${money(cost)}. Adds weekly upkeep.</div></div>`}${parkLocked?'<p class="warn">Reach Major studio rank to build a theme park.</p>':''}</div><div class="mf"><button class="btn text" data-act="close">Close</button>${key==='lab'&&l>0?'<button class="btn plain" data-act="tab" data-t="research">Open research</button>':''}${max?'':`<button class="btn gold" data-act="upgrade" data-k="${key}" ${S.cash<cost||parkLocked?'disabled':''}>${l===0||key==='stage'?'Build for ':'Upgrade for '}${money(cost)}</button>`}</div>`);
}
function upgrade(key){const b=BLD[key],l=S.b[key];const cost=b.cost(l)*era();if(S.cash<cost||l>=b.max)return;spend(cost,'Built: '+b.n);S.b[key]++;news((key==='stage'?'Sound stage '+S.b[key]+' is open for business':b.n+' '+(l===0?'built':'upgraded to level '+S.b[key]))+'.','gold');toast('<b>'+b.n+'</b> '+(l===0||key==='stage'?'built':'upgraded')+'.');if(key==='park')unlock('park');chime('ok');save();closeModal();render()}

function scriptModal(id){
 const s=S.scripts.find(x=>x.id===id);if(!s)return;
 const fit=themeFit(s.genre,s.theme);
 const heatP=S.heat[s.genre]>1.12?'<span class="pill ok">'+s.genre+' is hot</span>':S.heat[s.genre]<.85?'<span class="pill bad">'+s.genre+' is cold</span>':'<span class="pill">'+s.genre+' is steady</span>';
 openModal(mh(s.genre+', '+s.theme.toLowerCase()+', '+TIER[s.tier].n.toLowerCase(),esc(s.title))+`<div class="mb"><div class="top2" style="display:grid;grid-template-columns:90px minmax(0,1fr);gap:14px">${poster({title:s.title,genre:s.genre,theme:s.theme,studio:S.name},90)}<div><p style="font-family:var(--serif);font-style:italic;font-size:17px;margin-top:0">${esc(s.logline)}</p><div class="tags">${heatP}<span class="pill ${fit>0?'ok':fit<0?'bad':''}">${fit>0?'Great genre and theme combo':fit<0?'Awkward genre and theme combo':'Neutral combo'}</span><span class="pill">${s.source}</span><span class="pill">Option ends ${weekLbl(s.expires)}</span></div></div></div>
 ${statRows(s.sc)}
 <p class="muted" style="margin-top:12px">Script reader's note: ${coverage(s)}</p>
 <div class="est"><div><small>Price</small><b class="gold">${money(s.price)}</b></div><div><small>Typical shoot cost</small><b>${money(TIER[s.tier].prod*cEra())}</b></div><div><small>Typical marketing</small><b>${money(TIER[s.tier].pa*cEra())}</b></div></div></div>
 <div class="mf"><button class="btn text" data-act="close">Pass</button><button class="btn gold" data-act="buy" data-id="${s.id}" ${S.cash<s.price?'disabled':''}>Buy script for ${money(s.price)}</button></div>`);
}
function coverage(s){const a=s.sc;const best=Object.entries({hook:a.hook,story:a.story,characters:a.chars}).sort((x,y)=>y[1]-x[1]);const lo=best[2],hi=best[0];return `Strong ${hi[0]}${hi[1]>75?', genuinely exciting':''}. The ${lo[0]} ${lo[1]<40?'needs real work':'could be sharper'}. ${a.comm>70?'Very commercial.':a.comm<40?'A hard sell to a wide audience.':'Decent mainstream appeal.'}`}
function statRows(sc){return [['Hook',sc.hook],['Story',sc.story],['Characters',sc.chars],['Commercial',sc.comm]].map(([n,v])=>`<div class="srow"><span class="muted">${n}</span><span class="bar"><i style="width:${v}%"></i></span><span class="num">${Math.round(v)}</span></div>`).join('')}
function newProject(o){const p=Object.assign({id:'p'+(S.seq++),stage:'dev',cost:0,rev:0,rewrites:0,qMod:0,events:0,shot:0,appealMod:0,seq:1},o);S.projects.push(p);return p}
function buyScript(id){const s=S.scripts.find(x=>x.id===id);if(!s||S.cash<s.price)return;spend(s.price,'Script: '+s.title);S.scripts=S.scripts.filter(x=>x!==s);
 newProject({title:s.title,genre:s.genre,theme:s.theme,tier:s.tier,sc:{...s.sc},logline:s.logline,source:s.source,cost:s.price});
 news('You bought "'+s.title+'".');toast('<b>'+esc(s.title)+'</b> is yours. Next: cast it in Films.');chime('ok');save();closeModal();tab='films';render()}
function rewrite(id){const p=S.projects.find(x=>x.id===id);const c=(.08*TIER[p.tier].m)*era();if(S.cash<c)return;spend(c,'Rewrite: '+p.title,p);
 const boost=4+2*S.b.writers;p.rewrites++;if(p.rewrites>2){p.sc.story=clamp(p.sc.story-3,5,99);toast('Too many cooks: the extra rewrite hurt the story.')}else{p.sc.story=clamp(p.sc.story+boost,5,99);p.sc.chars=clamp(p.sc.chars+Math.round(boost*.6),5,99)}
 p.stage='rewrite';p.left=2;save();render()}

/* casting */
let castSel={};
function castModal(id){const p=S.projects.find(x=>x.id===id);castSel={pid:id,dir:p.dir||null,lead:p.lead||null,sup:p.sup||null,role:'dir'};drawCast()}
function lockReason(t){if(needP(t)>S.prestige)return 'Needs prestige '+needP(t);if(t.mood<25)return 'Won\'t work with you';if(S.rep<-20&&t.fame>55)return 'Avoids your studio';return ''}
function drawCast(){
 const p=S.projects.find(x=>x.id===castSel.pid);
 const mine=[p.dir,p.lead,p.sup];
 const avail=t=>active(t)&&(!t.busy||mine.includes(t.id));
 const role=castSel.role;const want=role==='dir'?'director':'actor';
 const others=[castSel.dir,castSel.lead,castSel.sup].filter((x,i)=>x&&['dir','lead','sup'][i]!==role);
 const list=S.talent.filter(t=>t.role===want&&avail(t)&&!others.includes(t.id)).map(t=>({t,fit:(t.genres.includes(p.genre)?18:0)+t.skill*.6+t.fame*.4-(lockReason(t)?30:0)})).sort((a,b)=>b.fit-a.fit).slice(0,10);
 const row=t=>{const lk=lockReason(t);const f=role==='sup'?feeOf(t)*.45:feeOf(t);const sel=castSel[role]===t.id;const match=t.genres.includes(p.genre);
  const rel=role!=='dir'?relOf(t.id,castSel.dir)+(role==='sup'?relOf(t.id,castSel.lead):0):relOf(t.id,castSel.lead);
  return `<button class="opt" data-act="pick" data-id="${t.id}" aria-pressed="${sel}" ${lk?'disabled':''}><div class="person">${portrait(t,44,ageOf(t))}<div><b>${esc(t.name)}</b><br><small>Skill ${Math.round(t.skill)} · Fame ${Math.round(t.fame)} · Age ${ageOf(t)} · ${t.genres.map(g=>g===p.genre?'<span class="gold">'+g+'</span>':g).join(', ')}</small>${rel>=40?'<br><small class="ok">Friends with your cast</small>':rel<=-40?'<br><small class="bad">Feuds with your cast</small>':''}</div><div style="text-align:right"><b class="num">${money(f)}</b><br><small>${lk||(match?'Genre match':(t.ego>78?'Big ego':''))}</small></div></div></button>`};
 const cast={dir:castSel.dir,lead:castSel.lead,sup:castSel.sup};
 const ok=cast.dir&&cast.lead&&cast.sup;
 const q=ok?craftOf(p,1,1,cast):0,ap=ok?appealOf(p,1,cast):0;
 const fees=['dir','lead','sup'].reduce((a,k)=>{const id=castSel[k];if(!id||id===p[k])return a;const t=tal(id);return a+(k==='sup'?feeOf(t)*.45:feeOf(t))},0);
 const chip=(k,lab)=>{const t=tal(castSel[k]);return `<button class="opt" data-act="crole" data-k="${k}" aria-pressed="${role===k}" style="margin:0"><small>${lab}</small><br><b>${t?esc(t.name):'Choose'}</b></button>`};
 openModal(mh('Casting, '+p.genre.toLowerCase()+' about '+p.theme.toLowerCase(),esc(p.title))+`<div class="mb"><div class="segs">${chip('dir','Director')}${chip('lead','Lead actor')}${chip('sup','Supporting actor')}</div>
 <h3 style="margin-top:14px">${{dir:'Choose a director',lead:'Choose a lead actor',sup:'Choose a supporting actor'}[role]}</h3>${list.map(x=>row(x.t)).join('')||'<p class="muted">Nobody is available right now.</p>'}
 <div class="est"><div><small>Expected quality</small><b class="gold">${ok?Math.round(q)+' ±10':'—'}</b></div><div><small>Audience appeal</small><b>${ok?Math.round(ap):'—'}</b></div><div><small>Fees to pay now</small><b>${money(fees)}</b></div></div>
 <p class="muted" style="margin-top:10px;font-size:13px">Gold genres match this film. Friends work well together; feuds hurt quality. Famous stars need more studio prestige.</p></div>
 <div class="mf"><button class="btn text" data-act="close">Cancel</button><button class="btn gold" data-act="cast" ${ok&&S.cash>=fees?'':'disabled'}>Sign the cast for ${money(fees)}</button></div>`,true);
}
function pickTalent(id){castSel[castSel.role]=id;const order=['dir','lead','sup'];const nx=order.find(k=>!castSel[k]);if(nx)castSel.role=nx;drawCast()}
function confirmCast(){const p=S.projects.find(x=>x.id===castSel.pid);let fees=0;['dir','lead','sup'].forEach(k=>{const id=castSel[k];if(p[k]!==id){if(p[k]){const o=tal(p[k]);if(o)o.busy=0}const t=tal(id);fees+=k==='sup'?feeOf(t)*.45:feeOf(t);p[k]=id;t.busy=S.week+60}});
 if(fees>0)spend(fees,'Talent fees: '+p.title,p);p.stage='ready';
 news(tal(p.lead).name+' and '+tal(p.sup).name+' star in "'+p.title+'", directed by '+tal(p.dir).name+'.');toast('Cast signed. Next: greenlight <b>'+esc(p.title)+'</b>.');chime('ok');save();closeModal();render()}

/* greenlight */
let glSel={};
function greenlightModal(id){const p=S.projects.find(x=>x.id===id);glSel={pid:id,level:1,pace:1};drawGL()}
function glNumbers(p){const T=TIER[p.tier];const pc=PACES[glSel.pace],lv=LEVELS[glSel.level];const wk=Math.max(2,Math.round(T.weeks*pc.w*(has('virtual')?.8:1)));const prod=T.prod*lv.m*(pc.w<1?.9:pc.w>1?1.12:1)*cEra()*costMods(p);return{wk,prod}}
function drawGL(){
 const p=S.projects.find(x=>x.id===glSel.pid);const T=TIER[p.tier];
 const {wk,prod}=glNumbers(p);
 const q=craftOf(p,glSel.level,glSel.pace),ap=appealOf(p,glSel.level);
 const fs=freeStages(),striking=S.strike&&S.strike.until>S.week;
 const inv=S.investor&&S.investor.left>0;const broke=S.cash-prod<-10*cEra();
 openModal(mh('Greenlight meeting',esc(p.title))+`<div class="mb"><h3>Production budget</h3><div class="segs">${LEVELS.map((l,i)=>`<button class="opt" data-act="gl" data-k="level" data-v="${i}" aria-pressed="${glSel.level===i}"><b>${l.n}</b><br><small>${l.d}</small><br><small class="gold">${money(T.prod*l.m*cEra()*costMods(p))}</small></button>`).join('')}</div>
 <h3 style="margin-top:16px">Shooting pace</h3><div class="segs">${PACES.map((l,i)=>`<button class="opt" data-act="gl" data-k="pace" data-v="${i}" aria-pressed="${glSel.pace===i}"><b>${l.n}</b><br><small>${l.d}</small><br><small>${Math.max(2,Math.round(T.weeks*l.w*(has('virtual')?.8:1)))} weeks</small></button>`).join('')}</div>
 <div class="est"><div><small>Shoot cost</small><b class="gold">${money(prod)}</b></div><div><small>Weeks on a stage</small><b>${wk}</b></div><div><small>Expected quality</small><b>${Math.round(q)} ±10</b></div><div><small>Audience appeal</small><b>${Math.round(ap)}</b></div></div>
 ${inv?`<p class="info" style="margin-top:10px">Your investor will pay ${money(prod*.4)} of this and take 35% of the film's profit.</p>`:''}
 ${costMods(p)<1?'<p class="ok" style="font-size:13px;margin-top:8px">Your technology and backlot sets lower this film\'s costs.</p>':''}
 <p class="muted" style="font-size:13px;margin-top:10px">${dept(p,q,ap,prod)}</p>
 ${broke&&!striking?'<p class="err">This shoot would bankrupt the studio. Pick a cheaper budget, borrow from the bank, or wait for more cash.</p>':''}${striking?'<p class="warn">Hollywood is on strike. Nothing can be greenlit until it ends.</p>':fs<=0?'<p class="warn">All sound stages are busy. Wait for a shoot to finish, or build another stage.</p>':''}</div>
 <div class="mf"><button class="btn text" data-act="close">Not yet</button><button class="btn gold" data-act="greenlight" ${fs<=0||striking||broke?'disabled':''}>Greenlight: start shooting</button></div>`,true);
}
function dept(p,q,ap,prod){const m=ap>65?'Marketing loves it: "Easy to sell."':ap<40?'Marketing is worried: "Who is this for?"':'Marketing: "We can work with this."';const f=prod>S.cash?' Finance warns this will push you into debt.':' Finance signs off.';const c=q>72?' Creative: "This could be special."':q<50?' Creative: "The script needs help."':'';return m+f+c}
function greenlight(){const p=S.projects.find(x=>x.id===glSel.pid);if(freeStages()<=0)return;const {wk,prod}=glNumbers(p);p.level=glSel.level;p.pace=glSel.pace;p.stage='shoot';p.left=wk;p.weeks=wk;p.weekly=prod/wk;p.budget=prod;
 if(S.investor&&S.investor.left>0){earn(prod*.4,'Investor funding: '+p.title,p);p.inv=.35;S.investor.left--;if(S.investor.left<=0){S.investor=null;news('Your investor deal is complete.')}}
 news('"'+p.title+'" is greenlit. Cameras roll next week.','gold');toast('<b>'+esc(p.title)+'</b> is greenlit.');chime('ok');save();closeModal();render()}

/* on-set events */
const EVENTS=[
 {t:'The lead refuses a stunt',d:p=>tal(p.lead).name+' says the big jump is too dangerous.',c:[
  {l:'Use a stunt double',x:p=>'Costs '+money(.1*TIER[p.tier].m*era())+', quality −2',f:p=>{spend(.1*TIER[p.tier].m*era(),'Stunt double',p);p.qMod-=2}},
  {l:'Insist they do it',x:()=>'Half chance of a great shot (+3), half chance of injury',f:p=>{if(R()<.5){p.qMod+=3;toast('They nailed it. The shot looks incredible.')}else{p.qMod-=2;p.left++;tal(p.lead).mood-=10;toast('An injury. One extra week of shooting.')}}},
  {l:'Rewrite the scene',x:()=>'One extra week of shooting',f:p=>{p.left++}}]},
 {t:'A storm wrecks the set',d:()=>'High winds tore through the exterior set overnight.',c:[
  {l:'Rebuild it properly',x:p=>'Costs '+money(p.budget*.12),f:p=>spend(p.budget*.12,'Set rebuild',p)},
  {l:'Move the scenes indoors',x:()=>'Quality −3',f:p=>{p.qMod-=3}},
  {l:'Wait for the weather',x:()=>'One extra week of shooting',f:p=>{p.left++}}]},
 {t:'The director wants more time',d:p=>tal(p.dir).name+' believes the third act needs another week.',c:[
  {l:'Give them the week',x:()=>'One extra week, quality +4',f:p=>{p.left++;p.qMod+=4}},
  {l:'Refuse',x:()=>'Quality −3, the director is unhappy',f:p=>{p.qMod-=3;tal(p.dir).mood-=15}},
  {l:'Add a second unit',x:p=>'Costs '+money(p.budget*.08)+', quality +2',f:p=>{spend(p.budget*.08,'Second unit',p);p.qMod+=2}}]},
 {t:'A tantrum in the star trailer',d:p=>tal(p.lead).name+' won\'t come out until demands are met.',c:[
  {l:'Meet the demands',x:p=>'Costs '+money(.05*TIER[p.tier].m*era()),f:p=>spend(.05*TIER[p.tier].m*era(),'Star perks',p)},
  {l:'Wait it out',x:()=>'Half chance quality −3',f:p=>{if(R()<.5){p.qMod-=3;toast('The mood on set soured. Quality −3.')}else toast('They came out by lunch. No harm done.')}},
  {l:'Have a firm talk',x:()=>'Could inspire (+2) or backfire (−4)',f:p=>{if(R()<.55){p.qMod+=2;toast('They came back focused. Quality +2.')}else{p.qMod-=4;tal(p.lead).mood-=12;toast('It backfired badly. Quality −4.')}}}]},
 {t:'Pages leak to the press',d:()=>'A trade paper printed the ending. Everyone is talking about it.',c:[
  {l:'Lean into the buzz',x:()=>'More awareness at release, quality −1',f:p=>{p.leak=.07;p.qMod-=1}},
  {l:'Sue the paper',x:()=>'Costs '+money(.08*era()),f:p=>spend(.08*era(),'Legal fees',p)},
  {l:'Say nothing',x:()=>'No effect',f:()=>{}}]},
 {t:'Magic on set',d:p=>tal(p.lead).name+' and '+tal(p.sup).name+' improvised a scene that left the crew in tears.',c:[
  {l:'Keep it in the film',x:()=>'Quality +3',f:p=>{p.qMod+=3}},
  {l:'Stick to the script',x:()=>'No effect',f:()=>{}}]},
 {t:'Co-stars at war',d:p=>tal(p.lead).name+' and '+tal(p.sup).name+' refuse to share a scene.',c:[
  {l:'Shoot them separately',x:()=>'Quality −2',f:p=>{p.qMod-=2}},
  {l:'Lock them in a room',x:()=>'Could create real chemistry (+3) or a feud (−3)',f:p=>{const k=relKey(p.lead,p.sup);if(R()<.5){p.qMod+=3;S.rel[k]=60;toast('They came out as friends.')}else{p.qMod-=3;S.rel[k]=-70;toast('Now they truly hate each other.')}}},
  {l:'Bring in a mediator',x:p=>'Costs '+money(.04*TIER[p.tier].m*era()),f:p=>spend(.04*TIER[p.tier].m*era(),'Mediator',p)}]},
 {t:'The effects are over budget',d:()=>'The effects team needs more money to finish the big sequence.',c:[
  {l:'Pay for it',x:p=>'Costs '+money(p.budget*.1)+', appeal +4',f:p=>{spend(p.budget*.1,'Extra effects',p);p.appealMod+=4}},
  {l:'Cut the sequence',x:()=>'Appeal −4',f:p=>{p.appealMod-=4}},
  {l:'Use practical effects instead',x:()=>'Half chance quality +2, half chance appeal −3',f:p=>{if(R()<.5){p.qMod+=2;toast('Critics will love the handmade look.')}else{p.appealMod-=3;toast('It looks cheap on screen.')}}}]}];
function eventModal(p){
 if(p.stage!=='shoot'){done();return}
 const e=pick(EVENTS);S._ev={pid:p.id,e:EVENTS.indexOf(e)};
 openModal(mh('On set: '+esc(p.title)+', week '+(p.shot)+' of '+(p.shot+p.left),e.t,false)+`<div class="mb"><p class="muted">${esc(e.d(p))}</p>${e.c.map((c,i)=>`<button class="opt" data-act="evc" data-i="${i}"><div class="choice"><b>${c.l}</b><small>${c.x(p)}</small></div></button>`).join('')}</div>`);
}
function eventChoice(i){const p=S.projects.find(x=>x.id===S._ev.pid);EVENTS[S._ev.e].c[i].f(p);delete S._ev;save();done()}

/* scandal */
function scandalModal(p){
 const t=tal(pick([p.lead,p.sup,p.dir].filter(Boolean)));if(!t){done();return}
 const what=pick(['was arrested after a late-night car crash','had private letters leaked to the papers','was caught in a bitter public feud','made shocking remarks in an interview','was photographed at a wild party','is accused of mistreating the crew']);
 S._sc={pid:p.id,tid:t.id};const early=yearOf(S.week)<1970;const pre=['dev','ready'].includes(p.stage);
 const ch=[['stand','Stand by them','Reputation −4, their mood +15, film appeal −4'],['distance','Distance the studio','Reputation +3, their mood −20'],pre?['recast','Recast the role','They leave the film. Their mood −30']:null,early?['cover','Cover it up','Costs '+money(.1*era())+'. If it comes out later: reputation −10']:null].filter(Boolean);
 openModal(mh('Scandal: '+esc(p.title),esc(t.name)+' '+what,false)+`<div class="mb"><div class="person" style="grid-template-columns:64px 1fr">${portrait(t,64,ageOf(t))}<p class="muted" style="margin:0">The press wants a statement from ${esc(S.name)} by tonight.</p></div>${ch.map(c=>`<button class="opt" data-act="scc" data-v="${c[0]}"><div class="choice"><b>${c[1]}</b><small>${c[2]}</small></div></button>`).join('')}</div>`);
}
function scandalChoice(v){const p=S.projects.find(x=>x.id===S._sc.pid),t=tal(S._sc.tid);
 if(v==='stand'){S.rep=clamp(S.rep-4,-50,50);t.mood=clamp(t.mood+15,0,100);p.appealMod=(p.appealMod||0)-4}
 if(v==='distance'){S.rep=clamp(S.rep+3,-50,50);t.mood=clamp(t.mood-20,0,100)}
 if(v==='recast'){t.mood=clamp(t.mood-30,0,100);t.busy=0;['dir','lead','sup'].forEach(k=>{if(p[k]===t.id)p[k]=null});p.stage='dev';toast('Recast needed on <b>'+esc(p.title)+'</b>.')}
 if(v==='cover'){spend(.1*era(),'Fixer fees',p);if(R()<.25){S.rep=clamp(S.rep-10,-50,50);news('The cover-up came out. '+S.name+' is in the headlines for all the wrong reasons.','bad')}}
 news('Scandal around "'+p.title+'": '+S.name+' responded.');delete S._sc;save();done()}

/* union */
function unionModal(){openModal(mh('Every three years','Union contract talks',false)+`<div class="mb"><p class="muted">The writers' and actors' guilds want better pay and residuals. Union mood: <b class="${S.union>=60?'ok':S.union<35?'bad':'warn'}">${Math.round(S.union)}</b>.</p>
 <button class="opt" data-act="union" data-v="fair"><div class="choice"><b>Offer a fair deal</b><small>Talent fees +6% from now on. No strike. Union mood +15</small></div></button>
 <button class="opt" data-act="union" data-v="mid"><div class="choice"><b>Meet in the middle</b><small>Fees +3%. Small chance of a strike</small></div></button>
 <button class="opt" data-act="union" data-v="hard"><div class="choice"><b>Play hardball</b><small>No raise. Union mood −20. Real chance of a strike</small></div></button></div>`)}
function unionChoice(v){let chance=0;if(v==='fair'){S.mods.fee*=1.06;S.union=clamp(S.union+15,0,100)}if(v==='mid'){S.mods.fee*=1.03;chance=clamp((70-S.union)/150,.05,.3)}if(v==='hard'){S.union=clamp(S.union-20,0,100);chance=clamp((80-S.union)/90,.15,.75)}
 done();if(R()<chance){startStrike(ri(10,20));runQueue()}else news('A new union contract is signed.','ok')}

/* release */
let relSel={};
function releaseModal(id){const p=S.projects.find(x=>x.id===id);const mn=+(TIER[p.tier].pa*.2*cEra()).toFixed(3);relSel={pid:id,pa:+Math.max(mn,Math.min(TIER[p.tier].pa*cEra(),S.cash*.6)).toFixed(3),tone:false,w:null,window:0,fest:false};drawRel()}
function nextFestival(){const k=wkOf(S.week);let best=null;for(const f of FESTIVALS){let d=f.wk-k;if(d<=0)d+=52;if(d<=14&&(!best||d<best.d))best={...f,d}}return best}
function drawRel(){
 const p=S.projects.find(x=>x.id===relSel.pid);const max=+(TIER[p.tier].pa*4*cEra()).toFixed(2),min=+(TIER[p.tier].pa*.2*cEra()).toFixed(3);
 const festC=relSel.fest?.1*era():0;
 const fb=relSel.fest?(p.critic>=70?.05:p.critic<55?-.04:0):0;
 const aw=awarenessOf(relSel.pa,p.tier,(p.leak||0)+fb);
 const f={aw,appeal:p.appeal,tone:relSel.tone,critic:p.critic,boost:p.boost||1};const st=strengthOf(f);
 const weeks=[];for(let w=S.week+1;w<=S.week+12;w++){const rv=S.upcoming.filter(x=>x.rel===w);const mineThere=S.projects.some(x=>x.stage==='scheduled'&&x.rel===w);weeks.push({w,rv,sea:seasonG(w,p.genre),mineThere})}
 const est=w=>{const rvS=w.rv.reduce((a,x)=>a+strengthOf(x),0);const comp=1/(1+.35*rvS);return 9*era()*S.mods.attend*st*S.heat[p.genre]*w.sea*comp*TIER[p.tier].screens*(1+S.fame/220)*techOpen(p.tier)}
 const sel=weeks.find(x=>x.w===relSel.w);const e=sel?est(sel):null;
 const yr=yearOf(S.week);const fest=nextFestival();const closed=S.mods.closed>S.week;
 const cost=relSel.pa+festC;
 openModal(mh('Release plan',esc(p.title))+`<div class="mb">
 <div class="tags" style="margin-bottom:10px"><span class="pill g">Quality ${p.Q}</span><span class="pill">Critics ${p.critic}</span><span class="pill">Rotten Pears ${p.pears}%</span><span class="pill">Test score ${p.test}</span><span class="pill ${S.heat[p.genre]>1.1?'ok':S.heat[p.genre]<.85?'bad':''}">${p.genre} heat ${Math.round(S.heat[p.genre]*100)}</span></div>
 ${closed?'<p class="warn">Theaters are closed. Your film will premiere at home instead, earning about half of a normal run.</p>':''}
 <h3>Marketing budget</h3><div style="display:flex;justify-content:space-between;align-items:baseline"><b class="gold num" style="font-size:22px">${money(relSel.pa)}</b><span class="muted">Awareness ${pct(aw)}</span></div>
 <input type="range" min="${min}" max="${max}" step="${(max/80).toFixed(4)}" value="${relSel.pa}" data-act="pa" aria-label="Marketing budget">
 <h3 style="margin-top:12px">How to sell it</h3><div class="segs" style="grid-template-columns:1fr 1fr"><button class="opt" data-act="tone" data-v="0" aria-pressed="${!relSel.tone}"><b>Honestly</b><br><small>Steady word of mouth</small></button><button class="opt" data-act="tone" data-v="1" aria-pressed="${relSel.tone}"><b>As a spectacle</b><br><small>Bigger opening, faster drop</small></button></div>
 ${yr>=2000?`<h3 style="margin-top:12px">Home release window</h3><div class="segs">${[['90 days','Theaters happy, less home money'],['45 days','The usual balance'],['17 days','More home money, faster theater drop']].map((w,i)=>`<button class="opt" data-act="win" data-v="${i}" aria-pressed="${relSel.window===i}"><b>${w[0]}</b><br><small>${w[1]}</small></button>`).join('')}</div>`:''}
 ${fest&&p.critic>=55?`<h3 style="margin-top:12px">Festival premiere</h3><button class="opt" data-act="fest" aria-pressed="${relSel.fest}"><div class="choice"><b>Premiere at the ${fest.n}</b><small>In ${fest.d} weeks. Costs ${money(.1*era())}. Prestige and buzz if critics like it; a chance at a prize.</small></div></button>`:''}
 <h3 style="margin-top:16px">Opening weekend</h3><p class="muted" style="font-size:13px;margin:2px 0 8px">Bonus shows the season. Rival films opening the same week take your screens.</p>
 <div class="cal">${weeks.map(x=>{const best=[...x.rv].sort((a,b)=>strengthOf(b)-strengthOf(a))[0];const sp=Math.round((x.sea-1)*100);return `<button class="opt" data-act="wk" data-w="${x.w}" aria-pressed="${relSel.w===x.w}" ${x.mineThere?'disabled':''}><b>${weekLbl(x.w)}</b><small class="${sp>0?'ok':sp<0?'bad':''}">Season ${sp>=0?'+':''}${sp}%</small><small>${x.mineThere?'Your other film':x.rv.length?x.rv.length+' rival'+(x.rv.length>1?'s':'')+': '+esc(best.title):'No rivals'}</small></button>`}).join('')}</div>
 <div class="est"><div><small>Forecast opening</small><b class="gold">${e?money(e*.7)+'–'+money(e*1.35):'Pick a week'}</b></div><div><small>Paid now</small><b>${money(cost)}</b></div></div>${S.cash<cost?'<p class="warn" style="font-size:13px;margin-top:8px">This puts you in debt. Consider a smaller budget or a bank loan in Money.</p>':''}</div>
 <div class="mf"><button class="btn text" data-act="close">Later</button><button class="btn gold" data-act="schedule" ${relSel.w?'':'disabled'}>Book the release</button></div>`,true);
}
function schedule(){const p=S.projects.find(x=>x.id===relSel.pid);spend(relSel.pa,'Marketing: '+p.title,p);p.pa=relSel.pa;p.tone=relSel.tone;p.window=relSel.window;
 let fb=0;if(relSel.fest){const fest=nextFestival();spend(.1*era(),'Festival: '+p.title,p);fb=p.critic>=70?.05:p.critic<55?-.04:0;S.prestige=clamp(S.prestige+Math.max(0,(p.critic-60)/3),0,100);
  if(p.critic>=82&&R()<.45){S.prestige=clamp(S.prestige+8,0,100);p.prize=fest.n;news('"'+p.title+'" wins the top prize at the '+fest.n+'!','gold');unlock('fest');chime('win')}else news('"'+p.title+'" premieres at the '+fest.n+' to '+(p.critic>=70?'rapturous':p.critic>=55?'polite':'cool')+' reviews.',p.critic>=70?'ok':'')}
 if(p.window===2)S.exhib=clamp(S.exhib-8,0,100);if(p.window===0)S.exhib=clamp(S.exhib+2,0,100);
 p.aw=awarenessOf(relSel.pa,p.tier,(p.leak||0)+fb);p.rel=relSel.w;p.stage='scheduled';
 news('"'+p.title+'" will open '+weekLbl(p.rel)+'.');toast('Release booked for '+weekLbl(p.rel)+'.');chime('ok');save();closeModal();render()}

/* premiere */
function premiere(p,film){
 const rank=[...S.films].sort((a,b)=>b.gross-a.gross).findIndex(f=>f.id===film.id)+1;
 const el=$('#prem');const num1=rank===1;if(num1)unlock('no1');
 const q=(p.reviews||[]).slice().sort((a,b)=>b.sc-a.sc)[0];
 el.className='prem show';
 el.innerHTML=`<div class="stage"><svg class="burst" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return `<line x1="200" y1="200" x2="${200+Math.cos(a)*190}" y2="${200+Math.sin(a)*190}" stroke="#D4AF37" stroke-width="2" stroke-opacity=".6"/>`}).join('')}</svg>
 <div class="posterWrap">${poster({title:p.title,genre:p.genre,theme:p.theme,studio:S.name,seq:p.seq},96)}</div>
 <div class="k">Opening weekend, ${weekLbl(S.week)}</div><h1>${esc(p.title)}</h1><div class="big" id="bigN">$0</div>
 <div class="line ${num1?'ok':''}" id="pl1" style="opacity:0">${num1?'Number one at the box office':'Number '+rank+' at the box office'}${film.intl?' · '+money(film.intl)+' overseas':''}</div>
 <div class="line muted" id="pl2" style="opacity:0">Rotten Pears ${p.pears}% · Audience grade ${grade(.6*p.Q+.4*p.appeal)}</div>
 ${q?`<div class="line" id="pl3" style="opacity:0;font-family:var(--serif);font-style:italic">“${esc(q.q)}” <span class="muted" style="font-style:normal;font-family:var(--sans);font-size:13px">${esc(q.n)}, ${esc(q.o)}</span></div>`:'<div id="pl3"></div>'}
 <button class="btn gold" data-act="premdone" id="pbtn" style="opacity:0">Back to the studio</button></div><div class="curtain l"></div><div class="curtain r"></div>`;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const finish=()=>{$('#bigN').textContent=money(film.open);['pl1','pl2','pl3','pbtn'].forEach(i=>{const e=$('#'+i);if(e)e.style.opacity=1});if(num1){el.classList.add('win');chime('fan')}else chime('ok');$('#pbtn').focus()};
 requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('open')));
 if(reduce){finish();return}
 setTimeout(()=>{const t0=performance.now(),D=1700;const step=t=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);$('#bigN').textContent=money(film.open*e);if(k<1)requestAnimationFrame(step);else finish()};requestAnimationFrame(step)},1100);
}
function premDone(){const el=$('#prem');el.className='prem';el.innerHTML='';done()}

function reviewsHTML(p){return (p.reviews||[]).map(r=>`<div class="quote"><q>${esc(r.q)}</q><small>${esc(r.n)}, ${esc(r.o)} · ${r.sc}/100</small></div>`).join('')}
function postMortem(p){
 const f=p.factors||{st:.5,comp:1,luck:1,heat:1,sea:1};
 const d=tal(p.dir),l=tal(p.lead);
 const rows=[['Quality',p.Q],['Stars',((d?d.fame:30)+(l?l.fame:30))/2],['Marketing',(p.aw||.3)*100],['Timing',clamp((f.sea-.8)/.55*100,3,100)],['Trend',clamp((f.heat-.6)/.85*100,3,100)],['Competition',clamp(f.comp*100,3,100)],['Luck',clamp(50+Math.log2(f.luck)*45,3,100)]];
 const low=[...rows].sort((a,b)=>a[1]-b[1])[0][0];
 const tip={Quality:'A stronger script, director or more careful shoot would help most.',Stars:'Bigger names would have drawn a larger opening.',Marketing:'More marketing would have reached more people.',Timing:'A better season, like summer or the holidays, would have helped.',Trend:'This genre was out of fashion. Watch genre heat before you buy.',Competition:'Too many rival films opened nearby. Find a quieter week.',Luck:'Sometimes audiences just don\'t show up. Nobody knows anything.'}[low];
 const verdict=p.profit>p.cost*1.5?'A smash hit':p.profit>0?'In the black':p.profit>-p.cost*.4?'A modest loss':'A flop';
 const dom=(p.total||0)*.53,intl=(p.intl||0)*.38,home=p.hv||0,tot=Math.max(dom+intl+home,.0001);
 openModal(mh('End of run'+(p.wk?', '+p.wk+' weeks in theaters':''),esc(p.title))+`<div class="mb"><div style="display:grid;grid-template-columns:84px minmax(0,1fr);gap:14px;align-items:start">${poster({title:p.title,genre:p.genre,theme:p.theme,studio:S.name,seq:p.seq},84)}<div><p style="font:600 20px var(--serif);margin:0" class="${p.profit>0?'ok':'bad'}">${verdict}</p>${p.prize?`<p class="gold" style="margin:4px 0 0">Winner, ${esc(p.prize)}</p>`:''}
 <div class="split" title="Income split"><i style="width:${dom/tot*100}%;background:var(--gold)"></i><i style="width:${intl/tot*100}%;background:var(--info)"></i><i style="width:${home/tot*100}%;background:var(--ok)"></i></div><small class="muted"><span class="gold">■</span> Home theaters ${money(dom)} · <span class="info">■</span> Overseas ${money(intl)} · <span class="ok">■</span> ${homeShare().lbl} ${money(home)}</small></div></div>
 <div class="est" style="margin-top:12px"><div><small>Box office (US)</small><b>${money(p.total||0)}</b></div><div><small>Overseas</small><b>${money(p.intl||0)}</b></div><div><small>Total costs</small><b>${money(p.cost)}</b></div><div><small>Profit</small><b class="${p.profit>=0?'ok':'bad'}">${money(p.profit)}</b></div></div>
 <h3 style="margin-top:16px">Why it performed this way</h3>${rows.map(([n,v])=>`<div class="pm"><span class="muted">${n}</span><span class="bar"><i style="width:${v}%;background:${v>=65?'var(--ok)':v<35?'var(--bad)':'var(--gold)'}"></i></span><span class="num">${Math.round(v)}</span></div>`).join('')}
 <p class="panel" style="background:var(--p2);margin-top:12px"><b class="gold">Lesson:</b> ${tip}</p>
 <h3 style="margin-top:16px">What the critics said</h3>${reviewsHTML(p)}</div>
 <div class="mf"><button class="btn gold" data-act="pmdone">Continue</button></div>`);
}

/* awards */
function campaignModal(){
 const yr=yearOf(S.week),k=wkOf(S.week);const forYear=k<10?yr-1:yr;
 const films=S.projects.filter(p=>p.rel&&yearOf(p.rel)===forYear&&['theaters','done'].includes(p.stage));
 const steps=[.5,2,5];
 openModal(mh('The Goldies, honouring '+forYear,'Awards campaigns')+`<div class="mb"><p class="muted">Screenings, trade ads and parties for voters. Campaigns help films critics already like. A Best Picture campaign costs real money.</p>${films.length?films.map(p=>{const sp=S.campaign[p.id]||0;return `<div class="opt" style="cursor:default"><div class="row"><b>${esc(p.title)}</b><small>Critics ${p.critic} · Spent ${money(sp)}</small></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${steps.map(s=>`<button class="btn plain sm" data-act="camp" data-id="${p.id}" data-v="${s}" ${S.cash<s*era()?'disabled':''}>+${money(s*era())}</button>`).join('')}</div></div>`}).join(''):'<p>You have no eligible films this year.</p>'}</div><div class="mf"><button class="btn gold" data-act="close">Done</button></div>`);
}
function awards(year){
 const pool=S.released.filter(r=>r.year===year);
 if(pool.length<3){done();return}
 const camp=r=>r.mine&&r.proj?6*Math.log2(1+(S.campaign[r.proj]||0)/(.5*era())):(r.mine?0:rnd(0,8));
 const pic=pool.map(r=>({r,s:r.critic+camp(r)+rnd(-3,3)})).sort((a,b)=>b.s-a.s).slice(0,5);
 const dirC=pool.map(r=>{const t=r.dir?tal(r.dir):null;return{r,name:t?t.name:pick(['A. Marchetti','L. Brennan','H. Osei','C. Duval','M. Ito']),tid:t?t.id:null,s:r.critic*.7+(t?t.skill*.3:rnd(55,85)*.3)+camp(r)+rnd(-3,3)}}).sort((a,b)=>b.s-a.s).slice(0,5);
 const actC=pool.map(r=>{const t=r.lead?tal(r.lead):null;return{r,name:t?t.name:pick(['J. Whitaker','R. Lane','D. Moreau','S. Patel','E. Hart']),tid:t?t.id:null,s:r.critic*.5+(t?t.skill*.5:rnd(55,85)*.5)+camp(r)+rnd(-4,4)}}).sort((a,b)=>b.s-a.s).slice(0,5);
 S._aw={year,cats:[['Best Picture',pic.map(x=>({lbl:x.r.title,sub:x.r.studio,mine:x.r.mine}))],['Best Director',dirC.map(x=>({lbl:x.name,sub:x.r.title,mine:x.r.mine,tid:x.tid}))],['Best Actor',actC.map(x=>({lbl:x.name,sub:x.r.title,mine:x.r.mine,tid:x.tid}))]],i:0,wins:0};
 drawAward();
}
function drawAward(){const a=S._aw;const [cat,noms]=a.cats[a.i];
 openModal(mh('The '+(a.year-1879)+'th Goldies, honouring '+a.year,cat,false)+`<div class="mb"><p class="muted">The nominees are:</p>${noms.map(n=>`<div class="opt" style="cursor:default"><div class="row"><b class="${n.mine?'gold':''}">${esc(n.lbl)}</b><small>${esc(n.sub)}</small></div></div>`).join('')}<p class="muted" style="margin-top:14px;font-family:var(--serif);font-style:italic">The envelope, please.</p></div><div class="mf"><button class="btn gold" data-act="envelope">Open the envelope</button></div>`)}
function envelope(){const a=S._aw;const [cat,noms]=a.cats[a.i];const win=noms[0];
 S.awards.push({year:a.year,cat,title:win.lbl,sub:win.sub,mine:win.mine});
 if(win.mine){a.wins++;S.prestige=clamp(S.prestige+(cat==='Best Picture'?12:6),0,100);S.fame=clamp(S.fame+(cat==='Best Picture'?5:2),0,100);if(win.tid){const t=tal(win.tid);t.fame=clamp(t.fame+8,0,99);t.wins++;t.mood=clamp(t.mood+15,0,100)}if(cat==='Best Picture')earn(1.5*era(),'Goldie re-release bump: '+win.lbl);news(win.lbl+' wins '+cat+' at the Goldies!','gold');unlock('goldie');chime('win')}else{news(win.lbl+' ('+win.sub+') wins '+cat+' at the Goldies.');chime('ok')}
 const last=a.i===a.cats.length-1;
 openModal(mh(cat+', '+a.year,'And the Goldie goes to…',false)+`<div class="mb" style="text-align:center;padding:26px 22px"><svg width="64" height="100" viewBox="0 0 70 110" aria-hidden="true"><circle cx="35" cy="16" r="10" fill="#D4AF37"/><path d="M27 28h16l-3 46h-10z" fill="#D4AF37"/><rect x="18" y="76" width="34" height="8" rx="2" fill="#B8952A"/><rect x="12" y="86" width="46" height="14" rx="3" fill="#8f7420"/></svg>
 <h1 style="font-size:32px;margin-top:12px" class="${win.mine?'gold':''}">${esc(win.lbl)}</h1><p class="muted">${esc(win.sub)}</p>${win.mine?'<p class="ok">A win for your studio.</p>':''}</div>
 <div class="mf"><button class="btn gold" data-act="${last?'awdone':'awnext'}">${last?'Leave the ceremony':'Next award'}</button></div>`);
 if(last&&a.wins===3)unlock('sweep');
 save();
}

/* money */
function loanModal(){const cap=20*era();openModal(mh('Finance','Bank loans')+`<div class="mb"><p>Borrow in steps of ${money(5*era())} at ${Math.round(S.mods.rate*100)}% a year, paid weekly. You can owe up to ${money(cap)}.</p><div class="est"><div><small>You owe</small><b>${money(S.loans)}</b></div><div><small>Weekly interest</small><b>${money(S.loans*S.mods.rate/52)}</b></div></div></div><div class="mf"><button class="btn plain" data-act="repay" ${S.loans>0&&S.cash>=Math.min(S.loans,5*era())?'':'disabled'}>Repay ${money(Math.min(S.loans||5*era(),5*era()))}</button><button class="btn gold" data-act="borrow" ${S.loans+5*era()<=cap+.001?'':'disabled'}>Borrow ${money(5*era())}</button></div>`)}
function investorModal(){openModal(mh('Finance','Co-financing deal')+`<div class="mb"><p>A private investor offers to pay <b>40% of the shooting costs</b> of your next <b>three</b> greenlit films. In return they take <b>35% of each film's profit</b>. If a film loses money, they share the loss.</p></div><div class="mf"><button class="btn text" data-act="invno">Decline</button><button class="btn gold" data-act="invyes">Accept the deal</button></div>`)}
function ipoValue(){return Math.max(15*era(),S.totalProfit*1.5+S.fame*.5*era()+S.prestige*.4*era()+S.ips.reduce((a,ip)=>a+ip.brand*.3*era(),0)+S.b.stage*3*era())}
function ipoModal(){const r=rankOf().r[1];const ok=['Major studio','Hollywood legend'].includes(r);const v=ipoValue();
 openModal(mh('Finance','Take the studio public')+`<div class="mb">${S.ipo?`<p>Your shares trade at <b class="gold">$${S.ipo.price.toFixed(2)}</b> (listed at $20.00).</p><p class="muted">Profitable years and hit films lift the price. Losing years upset shareholders and cost you fame.</p>`:`<p>Sell a quarter of ${esc(S.name)} on the stock market.</p><div class="est"><div><small>Studio value</small><b>${money(v)}</b></div><div><small>Cash you raise</small><b class="gold">${money(v*.25)}</b></div></div><p class="muted" style="margin-top:10px">After listing, shareholders expect a profit every year.</p>${ok?'':'<p class="warn">You need Major studio rank first.</p>'}`}</div><div class="mf"><button class="btn text" data-act="close">Close</button>${S.ipo?'':`<button class="btn gold" data-act="ipo" ${ok?'':'disabled'}>List the studio</button>`}</div>`)}
function streamerModal(){const c=12*era();const can=has('stream');
 openModal(mh('Empire','Your streaming service')+`<div class="mb">${S.streamer?`<div class="est"><div><small>Subscribers</small><b>${S.streamer.subs.toFixed(2)}M</b></div><div><small>Price a month</small><b>$${S.streamer.price}</b></div></div><p class="muted" style="margin-top:10px">Finished films join your library and attract subscribers. Home income from your films is shared with the service.</p><div class="segs" style="margin-top:8px">${[6,9,13].map(pr=>`<button class="opt" data-act="sprice" data-v="${pr}" aria-pressed="${S.streamer.price===pr}"><b>$${pr} a month</b><br><small>${pr===6?'Grows faster':pr===9?'Balanced':'Earns more, grows slower'}</small></button>`).join('')}</div>`:`<p>Launch ${esc(S.name)}+ and put your whole library online.</p><div class="est"><div><small>Launch cost</small><b class="gold">${money(c)}</b></div><div><small>Weekly running cost</small><b>${money(.35*era())}</b></div></div>${can?'':'<p class="warn">Research "Own streaming service" in your lab first (from 2007).</p>'}`}</div><div class="mf"><button class="btn text" data-act="close">Close</button>${S.streamer?'':`<button class="btn gold" data-act="slaunch" ${can&&S.cash>=c?'':'disabled'}>Launch for ${money(c)}</button>`}</div>`)}
function sequelModal(ipId){const ip=S.ips.find(x=>x.id===ipId);const c=.18*TIER[ip.tier].m*era();const n=ip.entries+1;const fat=ip.entries>=3?'Fans are getting tired of this series.':'Fans are excited.';
 openModal(mh('Franchise','Make '+esc(ip.title)+' '+n)+`<div class="mb"><div class="ip">${poster({title:ip.title,genre:ip.genre,theme:ip.theme,studio:S.name,seq:n},64)}<div><p>Brand strength <b class="gold">${Math.round(ip.brand)}</b>. ${fat}</p><p class="muted">A sequel opens bigger thanks to the brand, but each entry tires the audience a little more. The original stars will want to return.</p></div></div><div class="est"><div><small>Writing the sequel</small><b class="gold">${money(c)}</b></div><div><small>Opening boost</small><b>×${(1+ip.brand/120).toFixed(2)}</b></div></div></div><div class="mf"><button class="btn text" data-act="close">Not now</button><button class="btn gold" data-act="mkseq" data-id="${ip.id}" ${S.cash<c?'disabled':''}>Commission the sequel</button></div>`)}
function makeSequel(ipId){const ip=S.ips.find(x=>x.id===ipId);const c=.18*TIER[ip.tier].m*era();const n=ip.entries+1;spend(c,'Sequel script: '+ip.title);
 const tier=ip.brand>60&&ip.tier!=='high'?(ip.tier==='low'?'mid':'high'):ip.tier;
 const sc={hook:clamp(ip.sc.hook-4+rnd(-6,6),10,96),story:clamp(ip.sc.story-6+rnd(-8,8),10,96),chars:clamp(ip.sc.chars+rnd(-4,6),10,96),comm:clamp(ip.sc.comm+8,10,99)};
 const fat=Math.max(0,ip.entries-2)*.08;
 newProject({title:ip.title+' '+n,genre:ip.genre,theme:ip.theme,tier,sc,logline:'The story continues.',source:'Sequel',cost:c,ip:ip.id,seq:n,boost:clamp(1+ip.brand/120-fat,1,2)});
 news('A sequel to "'+ip.title+'" is in development.','gold');save();closeModal();tab='films';render()}
function teamupModal(){const ips=S.ips.filter(ip=>ip.brand>=55&&['Action','Sci-Fi','Fantasy','Adventure','Animation'].includes(ip.genre)).slice(0,4);const c=.6*era();
 openModal(mh('Franchise','The team-up event')+`<div class="mb"><p>Bring together the heroes of ${ips.map(i=>'<b>'+esc(i.title)+'</b>').join(', ')} in one giant film.</p><p class="muted">A tentpole with a huge built-in audience. If it flops, every one of these franchises suffers.</p><div class="est"><div><small>Script cost</small><b class="gold">${money(c)}</b></div><div><small>Opening boost</small><b>×1.6</b></div></div></div><div class="mf"><button class="btn text" data-act="close">Not now</button><button class="btn gold" data-act="mkteam" ${S.cash<c?'disabled':''}>Commission it</button></div>`)}
function makeTeamup(){const ips=S.ips.filter(ip=>ip.brand>=55&&['Action','Sci-Fi','Fantasy','Adventure','Animation'].includes(ip.genre)).slice(0,4);const c=.6*era();spend(c,'Team-up script');
 const t='The '+pick(['Iron','Golden','Crimson','Silver','Midnight'])+' Alliance';S.used.push(t);
 newProject({title:t,genre:ips[0].genre,theme:'Superheroes',tier:'high',sc:{hook:88,story:clamp(55+rnd(-10,15),10,96),chars:70,comm:95},logline:'Every hero. One fight.',source:'Team-up',cost:c,boost:1.6,teamup:true,appealMod:10});
 S.teamupDone=S.week;news('"'+t+'" is in development. The biggest film in your history.','gold');save();closeModal();tab='films';render()}
function gameOver(){openModal(mh('The bank has called in its loans','Your studio is bankrupt',false)+`<div class="mb"><p>${esc(S.name)} closed its gates in ${dateStr(S.week)}.</p><div class="est"><div><small>Films released</small><b>${S.projects.filter(p=>p.stage==='done').length}</b></div><div><small>Lifetime profit</small><b class="bad">${money(S.totalProfit)}</b></div><div><small>Goldies</small><b class="gold">${S.awards.filter(a=>a.mine).length}</b></div></div></div><div class="mf"><button class="btn gold" data-act="restart">Start a new studio</button></div>`)}
function talentModal(id){const t=tal(id);const films=S.projects.filter(p=>[p.dir,p.lead,p.sup,p.writer].includes(id)&&p.stage==='done');const rels=Object.entries(S.rel).filter(([k,v])=>k.split('|').includes(id)).map(([k,v])=>{const o=tal(k.split('|').find(x=>x!==id));return o?{o,v}:null}).filter(Boolean);
 openModal(mh({director:'Director',writer:'Writer',actor:'Actor'}[t.role],esc(t.name))+`<div class="mb"><div class="person" style="grid-template-columns:88px 1fr">${portrait(t,88,ageOf(t))}<div><p style="margin:0">Age ${ageOf(t)} · ${t.genres.join(', ')}</p><p class="muted" style="margin:4px 0 0">${t.retired?'Retired':!t.on?'Not yet in Hollywood':t.busy?'Busy on a film':'Available'} · Fee ${money(feeOf(t))}${lockReason(t)?' · <span class="warn">'+lockReason(t)+'</span>':''}</p></div></div>
 <div class="srow"><span class="muted">Skill</span><span class="bar"><i style="width:${t.skill}%"></i></span><span>${Math.round(t.skill)}</span></div><div class="srow"><span class="muted">Fame</span><span class="bar"><i style="width:${t.fame}%"></i></span><span>${Math.round(t.fame)}</span></div><div class="srow"><span class="muted">Ego</span><span class="bar"><i style="width:${t.ego}%;background:var(--warn)"></i></span><span>${t.ego}</span></div><div class="srow"><span class="muted">Mood</span><span class="bar"><i style="width:${t.mood}%;background:${t.mood<35?'var(--bad)':'var(--ok)'}"></i></span><span>${Math.round(t.mood)}</span></div>
 ${rels.length?`<h3 style="margin-top:14px">Relationships</h3>${rels.slice(0,6).map(r=>`<div class="kv"><span>${esc(r.o.name)}</span><span class="${r.v>0?'ok':'bad'}">${r.v>0?'Friends':'Feud'}</span></div>`).join('')}`:''}
 <h3 style="margin-top:14px">With your studio</h3><p class="muted" style="margin:4px 0">${films.length?films.map(p=>esc(p.title)).join(', '):'No films with you yet.'}${t.wins?' · '+t.wins+' Goldie'+(t.wins>1?'s':''):''}</p></div><div class="mf"><button class="btn gold" data-act="close">Close</button></div>`)}
function help(){openModal(mh('How to play','Run a Hollywood studio')+`<div class="mb"><ol style="padding-left:20px;margin:0;line-height:1.9">
<li><b>Buy a script</b> in Scripts. Hot genres and good genre-theme combos sell more tickets.</li><li><b>Cast it</b>: a director, a lead and a supporting actor. Matching genres and friendships raise quality.</li><li><b>Greenlight</b> it: choose the budget and pace. It needs a free sound stage.</li><li>Press <b>Next week</b>. Handle problems on set and scandals as they come.</li><li><b>Plan the release</b>: marketing, festival, release window and opening week.</li><li>Watch the <b>premiere</b> and the box office. Hits become <b>franchises</b> you can sequel.</li><li>Build a <b>research lab</b> for new technology, then grow into a streaming service and theme park.</li></ol>
<p class="muted" style="margin-top:12px">Every March the Goldies reward critics' favourites; campaign in Box office from late in the year. Union talks come every three years. Your game saves automatically.</p></div><div class="mf"><button class="btn gold" data-act="close">Got it</button></div>`)}

/* writers: commission an original script */
let writeSel={};
function writeModal(){const g=S.heat?Object.entries(S.heat).sort((a,b)=>b[1]-a[1])[0][0]:'Drama';writeSel={title:'',genre:g,theme:null,tier:'mid',writer:null};drawWrite()}
function writeWeeks(tier){return Math.max(2,{low:5,mid:7,high:9}[tier]-S.b.writers)}
function writeCost(){const w=tal(writeSel.writer);return (w?feeOf(w):0)+.05*TIER[writeSel.tier].m*cEra()}
function drawWrite(){
 const ws=writeSel;const ths=availThemes().map(t=>({t,f:themeFit(ws.genre,t.n)})).sort((a,b)=>b.f-a.f);
 if(!ws.theme||!ths.some(x=>x.t.n===ws.theme))ws.theme=ths[0].t.n;
 const writing=S.projects.filter(p=>p.stage==='writing').length;const full=writing>=S.b.writers;
 const list=S.talent.filter(t=>t.role==='writer'&&active(t)&&(!t.busy||t.id===ws.writer)).map(t=>({t,s:(t.genres.includes(ws.genre)?20:0)+t.skill-(lockReason(t)?40:0)})).sort((a,b)=>b.s-a.s).slice(0,8);
 const sugg=ws.sugg||(ws.sugg=newTitle(ws.genre));
 const w=tal(ws.writer);const cost=writeCost();
 const est=w?Math.round(w.skill*.6+6+S.b.writers*3+(w.genres.includes(ws.genre)?6:0)+themeFit(ws.genre,ws.theme)*3):null;
 openModal(mh('Writers\' bungalow, level '+S.b.writers,'Write an original script')+`<div class="mb">
 <label for="wt" class="muted" style="font-size:13px">Title</label><input type="text" id="wt" maxlength="40" placeholder="${esc(sugg)}" value="${esc(ws.title)}" autocomplete="off"><p class="muted" style="font-size:12px;margin:4px 0 0">Leave it empty to use the suggestion.</p>
 <h3 style="margin-top:14px">Genre</h3><div class="cal">${GENRES.map(g=>`<button class="opt" data-act="wg" data-v="${g}" aria-pressed="${ws.genre===g}"><b>${g}</b><small class="${S.heat[g]>1.1?'ok':S.heat[g]<.85?'bad':''}">${S.heat[g]>1.1?'Hot':S.heat[g]<.85?'Cold':'Steady'}</small></button>`).join('')}</div>
 <h3 style="margin-top:14px">Theme</h3><div class="cal">${ths.map(x=>`<button class="opt" data-act="wth" data-v="${esc(x.t.n)}" aria-pressed="${ws.theme===x.t.n}"><b>${x.t.n}</b><small class="${x.f>0?'ok':x.f<0?'bad':''}">${x.f>0?'Great combo':x.f<0?'Awkward combo':'Neutral'}</small></button>`).join('')}</div>
 <h3 style="margin-top:14px">Size of film</h3><div class="segs">${['low','mid','high'].map(k=>`<button class="opt" data-act="wtier" data-v="${k}" aria-pressed="${ws.tier===k}"><b>${TIER[k].n}</b><br><small>${writeWeeks(k)} weeks to write</small></button>`).join('')}</div>
 <h3 style="margin-top:14px">Writer</h3>${list.map(({t})=>{const lk=lockReason(t);const match=t.genres.includes(ws.genre);return `<button class="opt" data-act="wpick" data-id="${t.id}" aria-pressed="${ws.writer===t.id}" ${lk?'disabled':''}><div class="person">${portrait(t,44,ageOf(t))}<div><b>${esc(t.name)}</b><br><small>Skill ${Math.round(t.skill)} · Fame ${Math.round(t.fame)} · ${t.genres.map(g=>g===ws.genre?'<span class="gold">'+g+'</span>':g).join(', ')}</small></div><div style="text-align:right"><b class="num">${money(feeOf(t))}</b><br><small>${lk||(match?'Genre match':'')}</small></div></div></button>`}).join('')||'<p class="muted">No writers are free right now.</p>'}
 <div class="est"><div><small>Expected script quality</small><b class="gold">${est!=null?clamp(est,10,97)+' ±12':'Pick a writer'}</b></div><div><small>Time</small><b>${writeWeeks(ws.tier)} weeks</b></div><div><small>Cost now</small><b>${money(cost)}</b></div></div>
 ${full?`<p class="warn" style="margin-top:10px">Your bungalow can write ${S.b.writers} script${S.b.writers>1?'s':''} at a time. Upgrade it on the Studio screen to write more.</p>`:''}<div class="err" id="werr"></div></div>
 <div class="mf"><button class="btn text" data-act="close">Cancel</button><button class="btn gold" data-act="wgo" ${w&&!full?'':'disabled'}>Start writing for ${money(cost)}</button></div>`,true);
 const inp=$('#wt');inp.addEventListener('input',()=>{writeSel.title=inp.value;$('#werr').textContent=''});
}
function startWriting(){const ws=writeSel;let title=(ws.title||'').trim()||ws.sugg;
 if(S.projects.some(p=>p.title.toLowerCase()===title.toLowerCase())){$('#werr').textContent='You already have a film with that title. Choose another.';return}
 const cost=writeCost();const w=tal(ws.writer);spend(cost,'Writing: '+title);S.used.push(title);w.busy=S.week+60;
 const p=newProject({title,genre:ws.genre,theme:ws.theme,tier:ws.tier,sc:{hook:0,story:0,chars:0,comm:0},logline:'Being written.',source:'Original script',cost,writer:w.id});
 p.stage='writing';p.left=writeWeeks(ws.tier);
 news(w.name+' is writing "'+title+'" for '+S.name+'.');toast('Writing started on <b>'+esc(title)+'</b>.');chime('ok');save();closeModal();tab='films';render()}
