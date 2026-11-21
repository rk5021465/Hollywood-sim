/* ===== VIEWS ===== */
const ICONS={
 studio:'<path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/>',
 films:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M7 5l2 4M12 5l2 4M17 5l2 4"/>',
 scripts:'<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
 talent:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
 charts:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
 research:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 15h10"/>',
 empire:'<path d="M3 20h18M5 20V10l4-3 4 3v10M13 20V6l4-3 4 3v14"/>',
 money:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.6-.6-3-1.6M12 6v12"/>',
 fame:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
 more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};
const TABS=[['studio','Studio'],['films','Films'],['scripts','Scripts'],['talent','Talent'],['charts','Box office'],['research','Research'],['empire','Empire'],['money','Money'],['fame','Hall of Fame']];
const PHONE=[['studio','Studio'],['films','Films'],['scripts','Scripts'],['charts','Box office'],['more','More']];
function navHTML(list){const dot={films:S.projects.some(p=>['dev','ready','market'].includes(p.stage)),research:S.b.lab>0&&!S.tech.cur&&availTech().length>0,money:!!S.offer&&!S.investor};dot.more=dot.research||dot.money;
 return list.map(([k,n])=>`<button class="tab" data-act="tab" data-t="${k}" ${tab===k||(k==='more'&&['talent','research','empire','money','fame','more'].includes(tab))?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>${n}${dot[k]?'<span class="dot" aria-label="Needs attention"></span>':''}</button>`).join('')}
function availTech(){const y=yearOf(S.week);return TECH.filter(t=>!has(t.id)&&y>=t.y-2)}
function render(){
 if(!S)return;
 document.body.dataset.era=decade();
 const r=rankOf();const striking=S.strike&&S.strike.until>S.week;
 $('#top').innerHTML=`<div style="display:flex;flex-direction:column;line-height:1.2"><span class="brand">${esc(S.name)}</span><span class="rank">${r.r[1]}${striking?' · <span class="bad">On strike</span>':''}${S.mods.closed>S.week?' · <span class="warn">Theaters closed</span>':''}</span></div>
 <div class="stats"><div class="stat cash"><small>Cash</small><b class="num">${money(S.cash)}</b></div><div class="stat hide"><small>Fame</small><b>${Math.round(S.fame)}</b></div><div class="stat hide"><small>Prestige</small><b>${Math.round(S.prestige)}</b></div><div class="stat hide"><small>Reputation</small><b class="${S.rep<0?'bad':''}">${S.rep>0?'+':''}${Math.round(S.rep)}</b></div><div class="stat"><small>Week ${wkOf(S.week)}</small><b class="date">${dateStr(S.week)}</b></div>
 <div class="tbtns"><button class="btn plain sm auto" data-act="auto" aria-pressed="${!!autoTimer}">${autoTimer?'Pause':'Auto'}</button> <button class="btn gold next" data-act="next" ${busy?'disabled':''}>Next week</button></div></div>`;
 $('#rail').innerHTML=navHTML(TABS)+`<div class="foot"><span>${dateStr(S.week)}<span class="eraTag">${decade()}s</span></span><button data-act="mute">${muted?'Sound off':'Sound on'}</button><button data-act="help">How to play</button><button data-act="newgame">New studio</button></div>`;
 $('#tabs').innerHTML=navHTML(PHONE);
 const V={studio:vStudio,films:vFilms,scripts:vScripts,talent:vTalent,charts:vCharts,research:vResearch,empire:vEmpire,money:vMoney,fame:vFame,more:vMore};
 $('#main').innerHTML=(V[tab]||vStudio)();
}
function nextStep(){
 const p=S.projects;
 if(p.some(x=>x.stage==='market'))return['A finished film is waiting for a release plan.','Plan release','films'];
 if(p.some(x=>x.stage==='ready')&&freeStages()>0&&!(S.strike&&S.strike.until>S.week))return['A cast film is ready for the greenlight.','Greenlight','films'];
 if(p.some(x=>x.stage==='dev'))return['You own a script with no cast yet.','Cast it','films'];
 if(S.b.lab>0&&!S.tech.cur&&availTech().length)return['Your research lab is idle.','Choose research','research'];
 if(!p.some(x=>x.stage!=='done'))return['Your stages are empty. Buy a script or write your own to start a film.','Go to scripts','scripts'];
 if(S.b.lab===0&&S.cash>BLD.lab.cost(0)*era()*3&&p.filter(x=>x.stage==='done').length>=2)return['Build a research lab to unlock new film technology.','See the lot','studio'];
 return null;
}
function lotSVG(){
 const s=21,ox=196,oy=100;
 const P=(x,y,z=0)=>[(ox+(x-y)*s*.866).toFixed(1),(oy+(x+y)*s*.5-z).toFixed(1)];
 const poly=(pts,a)=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" ${a}/>`;
 const box=(x,y,w,d,h,o)=>{const own=o.own;const st=own?'stroke="#D4AF37" stroke-opacity=".55" stroke-width="1"':'stroke="#5a6585" stroke-dasharray="4 3" stroke-width="1" fill="none"';
  if(!own)return poly([P(x,y),P(x+w,y),P(x+w,y+d),P(x,y+d)],st+' class="tp"');
  if(o.flat){let g=poly([P(x,y),P(x+w,y),P(x+w,y+d),P(x,y+d)],'fill="'+o.top+'" '+st+' class="tp"');(o.deco||[]).forEach(dd=>g+=dd(P));return g}
  let g=poly([P(x,y+d,0),P(x+w,y+d,0),P(x+w,y+d,h),P(x,y+d,h)],'fill="#1c2440" '+st)+poly([P(x+w,y,0),P(x+w,y+d,0),P(x+w,y+d,h),P(x+w,y,h)],'fill="#252e4c" '+st)+poly([P(x,y,h),P(x+w,y,h),P(x+w,y+d,h),P(x,y+d,h)],'fill="'+(o.top||'#2E3854')+'" class="tp" '+st);
  if(o.win){for(let i=1;i<o.win;i++){const z=h*i/o.win;g+=`<line x1="${P(x,y+d,z)[0]}" y1="${P(x,y+d,z)[1]}" x2="${P(x+w,y+d,z)[0]}" y2="${P(x+w,y+d,z)[1]}" stroke="var(--era)" stroke-opacity=".3"/>`}}
  if(o.arch){const a=P(x+w,y+d*.3,0),b=P(x+w,y+d*.7,0),c=P(x+w,y+d*.7,h*.45),e=P(x+w,y+d*.3,h*.45);g+=poly([a,b,c,e],'fill="#141a2e" stroke="#D4AF37" stroke-opacity=".4"')}
  if(o.dome){const c=P(x+w/2,y+d/2,h);g+=`<ellipse cx="${c[0]}" cy="${c[1]}" rx="${s*.7}" ry="${s*.4}" fill="#3a466a" stroke="#D4AF37" stroke-opacity=".6"/>`}
  return g};
 const shooting=S.projects.filter(p=>p.stage==='shoot');
 const B=[
  {k:'tower',x:.5,y:.5,w:2,d:2,h:70+rankOf().sc/8,own:true,win:8,top:'#3a3220',label:'Tower'},
  {k:'writers',x:3.6,y:.5,w:1.8,d:1.6,h:26+S.b.writers*3,own:true,win:2,label:'Writers'},
  {k:'marketing',x:6.3,y:.5,w:2,d:1.6,h:30+S.b.marketing*4,own:true,win:3,label:'Marketing'},
  {k:'post',x:6.3,y:3.5,w:2,d:2,h:26+S.b.post*4,own:true,win:2,label:'Post'},
  {k:'lab',x:6.3,y:6.4,w:2,d:2,h:24+S.b.lab*4,own:S.b.lab>0,dome:true,label:S.b.lab?'Lab':'+ Lab'},
  {k:'backlot',x:9.3,y:.5,w:2.6,d:4.2,flat:true,own:S.b.backlot>0,top:'#2a2a24',label:S.b.backlot?'Backlot':'+ Backlot',deco:[P=>S.b.backlot>=1?`<path d="M${P(9.6,1).join(' ')}L${P(10.4,1).join(' ')}L${P(10.4,1.8).join(' ')}" stroke="#e8a25c" fill="none"/>`:'',P=>S.b.backlot>=2?`<path d="M${P(10.6,2.4).join(' ')}L${P(11.6,2.4).join(' ')}" stroke="#8fa6c9" stroke-width="3"/>`:'',P=>S.b.backlot>=3?`<circle cx="${P(10.9,3.8)[0]}" cy="${P(10.9,3.8)[1]}" r="5" fill="none" stroke="#5b8def"/>`:'']},
  {k:'park',x:9.3,y:5.2,w:2.6,d:3.4,flat:true,own:S.b.park>0,top:'#1f3a2a',label:S.b.park?'Theme park':'+ Park',deco:[P=>`<circle cx="${P(10.6,6.9)[0]}" cy="${(P(10.6,6.9)[1]-14)}" r="13" fill="none" stroke="#D4AF37" stroke-opacity=".8"/><line x1="${P(10.6,6.9)[0]}" y1="${P(10.6,6.9)[1]}" x2="${P(10.6,6.9)[0]}" y2="${P(10.6,6.9)[1]-14}" stroke="#D4AF37"/>`]}];
 const spots=[[.5,3.5],[3.4,3.5],[.5,6.4],[3.4,6.4]];
 spots.forEach((sp,i)=>{const own=i<S.b.stage;const film=own?shooting[i]:null;B.push({k:'stage',x:sp[0],y:sp[1],w:2.4,d:2.2,h:44,own,arch:true,top:film?'#4a3e1c':undefined,label:own?'Stage '+(i+1):'+ Stage',film,i,idle:own&&!film})});
 B.sort((a,b)=>(a.x+a.y)-(b.x+b.y));
 let g=poly([P(0,0),P(12.2,0),P(12.2,9),P(0,9)],'fill="#121a2d" stroke="#323B55"');
 for(let i=1;i<12;i++)g+=`<line x1="${P(i,0)[0]}" y1="${P(i,0)[1]}" x2="${P(i,9)[0]}" y2="${P(i,9)[1]}" stroke="#1b2440"/>`;
 for(let i=1;i<9;i++)g+=`<line x1="${P(0,i)[0]}" y1="${P(0,i)[1]}" x2="${P(12.2,i)[0]}" y2="${P(12.2,i)[1]}" stroke="#1b2440"/>`;
 g+=`<path d="M${P(3.1,0).join(' ')} L${P(3.1,9).join(' ')}" stroke="#2a3456" stroke-width="5"/><path d="M${P(0,3.1).join(' ')} L${P(8.8,3.1).join(' ')}" stroke="#2a3456" stroke-width="5"/><path d="M${P(5.95,3.1).join(' ')} L${P(5.95,9).join(' ')}" stroke="#2a3456" stroke-width="5"/><path d="M${P(8.9,0).join(' ')} L${P(8.9,9).join(' ')}" stroke="#2a3456" stroke-width="5"/>`;
 let labels='';
 for(const b of B){
  g+=`<g class="b" data-act="bld" data-k="${b.k}" tabindex="0" role="button" aria-label="${esc(b.label)}">${box(b.x,b.y,b.w,b.d,b.h||0,b)}${b.idle?poly([P(b.x,b.y,b.h),P(b.x+b.w,b.y,b.h),P(b.x+b.w,b.y+b.d,b.h),P(b.x,b.y+b.d,b.h)],'fill="none" stroke="#D4AF37" stroke-width="1.5" class="idle"'):''}${b.film?`<circle class="rec" cx="${P(b.x+b.w/2,b.y+b.d/2,b.h)[0]}" cy="${P(b.x+b.w/2,b.y+b.d/2,b.h)[1]}" r="4" fill="#E5484D"/>`:''}</g>`;
  const c=P(b.x+b.w/2,b.y+b.d/2,b.own&&!b.flat?b.h:0);const tx=+c[0],ty=+c[1]+(b.flat?12:0);
  const tw=b.label.length*6.2+14;
  labels+=`<g pointer-events="none"><rect x="${(tx-tw/2).toFixed(1)}" y="${(ty-9).toFixed(1)}" width="${tw.toFixed(1)}" height="17" rx="8.5" fill="#0E1320" fill-opacity=".82" stroke="${b.film?'#E5484D':'#D4AF37'}" stroke-opacity="${b.own?.6:.3}"/><text class="lbl" x="${tx}" y="${(ty+3.5).toFixed(1)}" text-anchor="middle">${esc(b.label)}</text></g>`;
 }
 return `<svg viewBox="0 0 470 330" role="img" aria-label="Your studio lot"><title>Your studio lot</title>${g}${labels}</svg>`;
}
function pipeHTML(){const c=k=>S.projects.filter(p=>k.includes(p.stage)).length;const st=[['In development',['writing','dev','rewrite','ready']],['Shooting',['shoot']],['Post',['post']],['Ready to release',['market','scheduled']],['In theaters',['theaters']]];return `<div class="pipe">${st.map(([n,k])=>`<span class="${c(k)?'on':''}">${n}<b>${c(k)}</b></span>`).join('')}</div>`}
function vStudio(){
 const ns=nextStep();const r=rankOf();
 return `<div class="head"><div><h2>${esc(S.name)}</h2><p>${dateStr(S.week)}, the ${decade()}s. Tap a building to build or upgrade it.</p></div></div>
 ${ns?`<div class="hint"><span><b>Next step:</b> ${ns[0]}</span>${ns[2]!=='studio'?`<button class="btn gold sm" data-act="tab" data-t="${ns[2]}">${ns[1]}</button>`:''}</div>`:''}
 <div class="grid2"><div><div class="lot">${lotSVG()}</div>
 <div class="bld-list">${['stage','writers','post','marketing','lab','backlot','park'].map(k=>{const l=S.b[k],b=BLD[k];const mx=l>=b.max;return `<button class="bld" data-act="bld" data-k="${k}"><b>${b.n}</b><small>${k==='stage'?l+' built, '+freeStages()+' free':l?'Level '+l+' of '+b.max:'Not built'}</small><small class="gold">${mx?'Fully upgraded':(k==='stage'?'Build next: ':l?'Upgrade: ':'Build: ')+money(b.cost(l)*era())}</small></button>`}).join('')}</div></div>
 <div style="display:flex;flex-direction:column;gap:16px">
 <div class="panel"><h3>Your films</h3><div style="margin-top:10px">${pipeHTML()}</div></div>
 <div class="panel"><h3>Studio standing</h3><p class="muted" style="margin:4px 0 8px">${r.r[1]}${r.nx?', next: '+r.nx[1]:''}</p>${r.nx?`<div class="bar"><i style="width:${clamp((r.sc-r.r[0])/(r.nx[0]-r.r[0])*100,2,100)}%"></i></div>`:''}
 <div class="srow"><span class="muted">Fame</span><span class="bar"><i style="width:${S.fame}%"></i></span><span>${Math.round(S.fame)}</span></div><div class="srow"><span class="muted">Prestige</span><span class="bar"><i style="width:${S.prestige}%"></i></span><span>${Math.round(S.prestige)}</span></div><div class="srow"><span class="muted">Reputation</span><span class="bar"><i style="width:${50+S.rep}%;background:${S.rep<0?'var(--bad)':'var(--ok)'}"></i></span><span>${Math.round(S.rep)}</span></div><div class="srow"><span class="muted">Union mood</span><span class="bar"><i style="width:${S.union}%;background:var(--info)"></i></span><span>${Math.round(S.union)}</span></div></div>
 <div class="panel"><h3>Trade news</h3><ul class="news" style="margin-top:6px">${S.news.slice(0,8).map(n=>`<li><time>${MONTHS[monthOf(n.w)]} ${yearOf(n.w)}</time><span class="${n.c}">${esc(n.t)}</span></li>`).join('')}</ul></div>
 </div></div>`;
}
function filmCard(p){
 const d=tal(p.dir),l=tal(p.lead),s=tal(p.sup);
 const wr=tal(p.writer);const who=(d&&l?`${esc(l.name)}${s?' and '+esc(s.name):''}, directed by ${esc(d.name)}`:'Not cast yet')+(wr?`, written by ${esc(wr.name)}`:'');
 let body='',acts='';const tc=(.08*TIER[p.tier].m)*era();
 switch(p.stage){
  case 'writing':{const w=tal(p.writer);const tot={low:5,mid:7,high:9}[p.tier]-S.b.writers;body=`<div class="prog"><span>${w?esc(w.name)+' is writing':'Writing'}</span><span>${p.left} week${p.left>1?'s':''} left</span></div><div class="bar"><i style="width:${clamp((1-p.left/Math.max(2,tot))*100,5,100)}%"></i></div>`;break}
  case 'dev':body=`<div class="meta">${esc(p.logline)}</div>`;acts=`<button class="btn gold sm" data-act="castm" data-id="${p.id}">Cast the film</button><button class="btn plain sm" data-act="rewrite" data-id="${p.id}" ${S.cash<tc?'disabled':''}>Rewrite, ${money(tc)}</button><button class="btn text sm" data-act="drop" data-id="${p.id}">Shelve</button>`;break;
  case 'rewrite':body=`<div class="prog"><span>Rewriting the script</span><span>${p.left} week${p.left>1?'s':''} left</span></div><div class="bar"><i style="width:${(2-p.left)/2*100}%"></i></div>`;break;
  case 'ready':body=`<div class="meta">Cast signed. Story ${Math.round(p.sc.story)}, hook ${Math.round(p.sc.hook)}.</div>`;acts=`<button class="btn gold sm" data-act="glm" data-id="${p.id}">Greenlight</button><button class="btn plain sm" data-act="castm" data-id="${p.id}">Recast</button><button class="btn plain sm" data-act="rewrite" data-id="${p.id}" ${S.cash<tc?'disabled':''}>Rewrite</button>`;break;
  case 'shoot':body=`<div class="prog"><span>${p.paused?'<span class="bad">Paused by the strike</span>':'Shooting, week '+(p.shot+1)+' of '+(p.shot+p.left)}</span><span>${money(p.weekly)} a week</span></div><div class="bar"><i style="width:${p.shot/(p.shot+p.left)*100}%"></i></div>`;break;
  case 'post':body=`<div class="prog"><span>Editing, effects and music</span><span>${p.left} week${p.left>1?'s':''} left</span></div><div class="bar"><i style="width:60%"></i></div>`;break;
  case 'market':body=`<div class="tags"><span class="pill g">Quality ${p.Q}</span><span class="pill">Rotten Pears ${p.pears}%</span><span class="pill">Test ${p.test}</span></div>`;acts=`<button class="btn gold sm" data-act="relm" data-id="${p.id}">Plan release</button><button class="btn plain sm" data-act="revs" data-id="${p.id}">Reviews</button>`;break;
  case 'scheduled':body=`<div class="meta">Opens ${weekLbl(p.rel)}, in ${p.rel-S.week} week${p.rel-S.week>1?'s':''}. Awareness ${pct(p.aw)}.</div>`;break;
  case 'theaters':body=`<div class="prog"><span>Week ${p.wk} in theaters</span><span>Last weekend ${money(p.lastGross||p.open)}</span></div><div style="font:600 22px var(--sans)" class="gold num">${money(p.total||p.open)} <small class="muted" style="font-size:13px;font-weight:400">+ ${money(p.intl||0)} overseas</small></div>`;break;
 }
 const label={writing:'Being written',dev:'In development',rewrite:'Rewriting',ready:'Ready to greenlight',shoot:'Shooting',post:'Post-production',market:'Ready to release',scheduled:'Release booked',theaters:'In theaters'}[p.stage];
 return `<article class="card mine"><div class="top2">${poster({title:p.title,genre:p.genre,theme:p.theme,studio:S.name,seq:p.seq},72)}<div><div class="tags"><span class="pill g">${label}</span><span class="pill">${p.genre}</span><span class="pill">${TIER[p.tier].n}</span>${p.seq>1?'<span class="pill ok">Sequel</span>':''}</div><div class="ttl" style="margin-top:6px">${esc(p.title)}</div><div class="meta">${p.theme} · ${who}</div></div></div>${body}${acts?`<div class="acts">${acts}</div>`:''}</article>`;
}
function vFilms(){
 const act=S.projects.filter(p=>p.stage!=='done'),arch=S.projects.filter(p=>p.stage==='done').reverse();
 return `<div class="head"><div><h2>Films</h2><p>Every project from first draft to final weekend.</p></div><button class="btn ghost" data-act="tab" data-t="scripts">Find a script</button></div>
 ${act.length?`<div class="cards">${act.map(filmCard).join('')}</div>`:`<div class="panel" style="text-align:center;padding:36px"><h3>No films in progress</h3><p class="muted">Buy a script, or make a sequel from the Empire screen.</p><button class="btn gold" data-act="tab" data-t="scripts">Browse scripts</button></div>`}
 ${arch.length?`<div class="sec"><h3>Released films</h3><span class="muted">${arch.length}</span></div><div class="panel scroll" style="padding:0"><table><thead><tr><th>Title</th><th class="hide-s">Year</th><th class="r">US box office</th><th class="r">Profit</th><th class="r hide-s">Pears</th><th></th></tr></thead><tbody>${arch.map(p=>`<tr><td class="tt"><b>${esc(p.title)}</b><br><small class="muted">${p.genre}${p.prize?' · festival winner':''}</small></td><td class="hide-s">${p.rel?yearOf(p.rel):''}</td><td class="r num">${money(p.total||0)}</td><td class="r num ${p.profit>=0?'ok':'bad'}">${money(p.profit)}</td><td class="r hide-s">${p.pears}%</td><td class="r"><button class="btn text sm" data-act="pm" data-id="${p.id}">Report</button></td></tr>`).join('')}</tbody></table></div>`:''}`;
}
function vScripts(){
 const sorted=[...S.scripts].sort((a,b)=>a.expires-b.expires);
 return `<div class="head"><div><h2>Scripts</h2><p>Buy a script from the market, or have your own writers create one.</p></div><button class="btn gold" data-act="write">Write an original script</button></div>
 <div class="heat">${[...GENRES].sort((a,b)=>S.heat[b]-S.heat[a]).map(g=>{const h=S.heat[g];return `<div><b>${g}</b><span class="${h>1.1?'ok':h<.85?'bad':'muted'}">${h>1.1?'Hot':h<.85?'Cold':'Steady'} · ${Math.round(h*100)}</span></div>`}).join('')}</div>
 <div class="sec"><h3>On the market</h3><span class="muted">${S.scripts.length} scripts</span></div>
 <div class="cards">${sorted.map(s=>{const fit=themeFit(s.genre,s.theme);return `<article class="card"><div class="top2">${poster({title:s.title,genre:s.genre,theme:s.theme,studio:''},72)}<div><div class="tags"><span class="pill ${S.heat[s.genre]>1.1?'ok':S.heat[s.genre]<.85?'bad':''}">${s.genre}</span><span class="pill">${TIER[s.tier].n}</span>${s.expires-S.week<=3?'<span class="pill warn">Leaving soon</span>':''}</div><div class="ttl" style="margin-top:6px">${esc(s.title)}</div><div class="meta">${s.theme} · ${s.source}${fit>0?' · <span class="ok">great combo</span>':fit<0?' · <span class="bad">awkward combo</span>':''}</div></div></div><div class="meta" style="font-family:var(--serif);font-style:italic">${esc(s.logline)}</div><div class="stars" aria-label="Script quality">${stars(scriptAvg(s.sc))}</div><div class="acts"><b class="gold num" style="align-self:center;margin-right:auto">${money(s.price)}</b><button class="btn plain sm" data-act="script" data-id="${s.id}">Read</button><button class="btn gold sm" data-act="buy" data-id="${s.id}" ${S.cash<s.price?'disabled':''}>Buy</button></div></article>`}).join('')}</div>`;
}
function vTalent(){
 const f=talentFilter;let list=S.talent.filter(active);
 if(f==='actor'||f==='director'||f==='writer')list=list.filter(t=>t.role===f);if(f==='free')list=list.filter(t=>!t.busy&&!lockReason(t));if(f==='stars')list=list.filter(t=>t.fame>=65);
 list.sort((a,b)=>b.fame-a.fame);
 return `<div class="head"><div><h2>Talent</h2><p>${S.talent.filter(active).length} actors, directors and writers working in Hollywood.</p></div></div>
 <div class="filters">${[['all','Everyone'],['actor','Actors'],['director','Directors'],['writer','Writers'],['free','Available to you'],['stars','Stars']].map(([k,n])=>`<button class="opt" data-act="tfilter" data-v="${k}" aria-pressed="${f===k}">${n}</button>`).join('')}</div>
 <div class="tgrid">${list.slice(0,60).map(t=>`<button class="tcard" data-act="tmodal" data-id="${t.id}">${portrait(t,56,ageOf(t))}<div><b>${esc(t.name)}</b><small>${{director:'Director',writer:'Writer',actor:'Actor'}[t.role]} · Age ${ageOf(t)}</small><small>Skill ${Math.round(t.skill)} · Fame ${Math.round(t.fame)}</small><small class="${t.busy?'warn':lockReason(t)?'bad':'gold'}">${t.busy?'Busy on a film':lockReason(t)||money(feeOf(t))+' per film'}</small></div></button>`).join('')}</div>`;
}
function vCharts(){
 const list=[...S.films].sort((a,b)=>b.gross-a.gross);
 const soon=[...S.upcoming.map(f=>({...f})),...S.projects.filter(p=>p.stage==='scheduled').map(p=>({title:p.title,studio:S.name,rel:p.rel,genre:p.genre,mine:true}))].filter(f=>f.rel<=S.week+6).sort((a,b)=>a.rel-b.rel);
 const yr=yearOf(S.week),k=wkOf(S.week);const lastAw=S.awards.filter(a=>a.year===Math.max(...S.awards.map(x=>x.year)));
 const campOpen=k>=44||k<10;
 return `<div class="head"><div><h2>Box office</h2><p>This weekend's top films in America, ${weekLbl(S.week)}.</p></div></div>
 <div class="panel scroll" style="padding:0">${list.length?`<table><thead><tr><th>#</th><th>Title</th><th class="hide-s">Studio</th><th class="r">Weekend</th><th class="r">Change</th><th class="r">Total</th><th class="r hide-s">Week</th></tr></thead><tbody>${list.slice(0,10).map((f,i)=>{const ch=f.wk===1?null:(f.prev?f.gross/f.prev-1:0);return `<tr class="${f.mine?'mine':''}"><td>${i+1}</td><td class="tt"><b>${esc(f.title)}</b><br><small class="muted">${f.genre}</small></td><td class="hide-s muted">${esc(f.studio)}</td><td class="r num">${money(f.gross)}</td><td class="r num ${ch===null?'gold':ch>-.25?'ok':ch>-.5?'warn':'bad'}">${ch===null?'New':Math.round(ch*100)+'%'}</td><td class="r num">${money(f.total)}</td><td class="r hide-s">${f.wk}</td></tr>`}).join('')}</tbody></table>`:`<p class="muted" style="padding:20px">${S.mods.closed>S.week?'Theaters are closed.':'No films in theaters yet. Press Next week to move time forward.'}</p>`}</div>
 <div class="grid2" style="margin-top:16px"><div class="panel"><h3>Opening soon</h3><table style="margin-top:6px"><tbody>${soon.slice(0,8).map(f=>`<tr class="${f.mine?'mine':''}"><td>${weekLbl(f.rel)}</td><td class="tt">${esc(f.title)}</td><td class="muted r">${esc(f.studio)}</td></tr>`).join('')||'<tr><td class="muted">Nothing announced.</td></tr>'}</tbody></table></div>
 <div class="panel"><h3>The Goldies</h3>${lastAw.length?lastAw.map(a=>`<div class="kv"><span class="muted">${a.cat} ${a.year}</span><span class="${a.mine?'gold':''}">${esc(a.title)}</span></div>`).join(''):'<p class="muted">Held every March for the previous year\'s films. Critics\' favourites win.</p>'}
 <button class="btn ghost sm" style="margin-top:12px" data-act="camp0" ${campOpen?'':'disabled'}>Awards campaigns</button>${campOpen?'':'<p class="muted" style="font-size:12px;margin:6px 0 0">Campaigns open in November.</p>'}</div></div>`;
}
function vResearch(){
 const y=yearOf(S.week);const cur=S.tech.cur&&TECH.find(t=>t.id===S.tech.cur);
 return `<div class="head"><div><h2>Research</h2><p>${S.b.lab?'Your lab makes '+(S.b.lab*(1+S.prestige/200)).toFixed(1)+' research points a week.':'Build a research lab on your lot to start.'}</p></div>${S.b.lab?'':'<button class="btn gold" data-act="bld" data-k="lab">Build a lab</button>'}</div>
 ${cur?`<div class="panel" style="margin-bottom:16px"><div class="prog"><span>Researching <b class="gold">${cur.n}</b></span><span>${Math.round(S.tech.pts)} of ${cur.c} points</span></div><div class="bar" style="margin-top:8px"><i style="width:${S.tech.pts/cur.c*100}%"></i></div></div>`:''}
 <div class="tech">${TECH.map(t=>{const d=has(t.id),lk=y<t.y-2,c=S.tech.cur===t.id;return `<div class="card ${d?'done':''} ${c?'cur':''} ${lk?'lock':''}"><div class="tags"><span class="pill ${d?'ok':c?'g':''}">${d?'Done':c?'In progress':lk?'From '+t.y:'Available'}</span>${t.dist?'<span class="pill">Distribution</span>':''}</div><b>${t.n}</b><small class="muted">${t.d}</small>${!d&&!lk&&!c&&S.b.lab?`<div class="acts"><button class="btn plain sm" data-act="res" data-id="${t.id}">Research, ${t.c} points</button></div>`:''}</div>`}).join('')}</div>`;
}
function vEmpire(){
 const team=S.ips.filter(ip=>ip.brand>=55&&['Action','Sci-Fi','Fantasy','Adventure','Animation'].includes(ip.genre)).length>=3&&!S.projects.some(p=>p.teamup&&p.stage!=='done')&&(!S.teamupDone||S.week-S.teamupDone>156);
 const merch=S.ips.reduce((a,ip)=>a+ip.brand*G[ip.genre].fam*.0012*era(),0);
 return `<div class="head"><div><h2>Empire</h2><p>Franchises, merchandise, streaming and your theme park.</p></div></div>
 ${team?`<div class="hint"><span><b>Team-up ready:</b> three strong franchises can share one giant film.</span><button class="btn gold sm" data-act="teamup">Plan the team-up</button></div>`:''}
 <div class="sec"><h3>Franchises</h3><span class="muted">Merchandise ${money(merch)} a week</span></div>
 ${S.ips.length?`<div class="cards">${S.ips.map(ip=>{const busy=S.projects.some(p=>p.ip===ip.id&&p.stage!=='done');return `<article class="card"><div class="top2">${poster({title:ip.title,genre:ip.genre,theme:ip.theme,studio:S.name},64)}<div><div class="ttl">${esc(ip.title)}</div><div class="meta">${ip.genre} · ${ip.entries} film${ip.entries>1?'s':''} · last in ${ip.last}</div><div class="srow"><span class="muted">Brand</span><span class="bar"><i style="width:${ip.brand}%"></i></span><span>${Math.round(ip.brand)}</span></div></div></div><div class="acts"><button class="btn gold sm" data-act="seq" data-id="${ip.id}" ${busy?'disabled':''}>${busy?'Sequel in progress':'Make a sequel'}</button></div></article>`}).join('')}</div>`:'<div class="panel"><p class="muted" style="margin:0">Profitable hits become franchises. Then you can make sequels, sell toys and build rides.</p></div>'}
 <div class="grid2" style="margin-top:16px"><div class="panel"><h3>Streaming service</h3>${S.streamer?`<div class="kv"><span>Subscribers</span><b>${S.streamer.subs.toFixed(2)}M</b></div><div class="kv"><span>Price</span><b>$${S.streamer.price} a month</b></div>`:`<p class="muted">${has('stream')?'Ready to launch.':'Research "Own streaming service" first (from 2007).'}</p>`}<button class="btn ghost sm" data-act="stream" style="margin-top:10px">${S.streamer?'Manage':'Learn more'}</button></div>
 <div class="panel"><h3>Theme park</h3><p class="muted">${S.b.park?'Level '+S.b.park+'. Rides based on your strongest franchises.':'Open a park once you are a Major studio with franchises.'}</p><button class="btn ghost sm" data-act="bld" data-k="park">${S.b.park?'Upgrade':'See details'}</button></div></div>`;
}
function vMoney(){
 const h=S.cashHist,mx=Math.max(...h,1),mn=Math.min(...h,0);const W=600,H=160;
 const pts=h.map((v,i)=>[(i/(Math.max(h.length-1,1)))*W,H-((v-mn)/(mx-mn||1))*H]);
 const zero=H-((0-mn)/(mx-mn||1))*H;
 const upkeep=(S.b.stage*.02+S.b.writers*.008+S.b.post*.01+S.b.marketing*.01+S.b.lab*.012+S.b.backlot*.015+S.b.park*.15)*era();
 const yr=yearOf(S.week);const yrInc=S.ledger.filter(l=>yearOf(l.w)===yr&&l.a>0).reduce((a,l)=>a+l.a,0);
 return `<div class="head"><div><h2>Money</h2><p>Cash, costs, loans and investors.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn ghost" data-act="loan">Bank loans</button>${S.offer&&!S.investor?'<button class="btn gold" data-act="inv">Investor offer</button>':''}<button class="btn plain" data-act="ipom">${S.ipo?'Shares':'Go public'}</button></div></div>
 <div class="est" style="margin:0 0 16px"><div><small>Cash</small><b class="gold">${money(S.cash)}</b></div><div><small>Income this year</small><b>${money(yrInc)}</b></div><div><small>Weekly upkeep</small><b>${money(upkeep+S.loans*S.mods.rate/52)}</b></div><div><small>Loans</small><b>${money(S.loans)}</b></div><div><small>Lifetime profit</small><b class="${S.totalProfit>=0?'ok':'bad'}">${money(S.totalProfit)}</b></div>${S.ipo?`<div><small>Share price</small><b>$${S.ipo.price.toFixed(2)}</b></div>`:''}${S.investor?`<div><small>Investor deal</small><b>${S.investor.left} film${S.investor.left>1?'s':''} left</b></div>`:''}</div>
 <div class="panel"><h3>Cash over time</h3><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:160px;display:block;margin-top:10px" role="img" aria-label="Cash over time"><line x1="0" x2="${W}" y1="${zero}" y2="${zero}" stroke="#323B55" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/><polyline points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#D4AF37" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><div class="prog" style="margin-top:4px"><span>${money(mn)} low</span><span>${money(mx)} high</span></div></div>
 <div class="sec"><h3>Recent transactions</h3></div><div class="panel scroll" style="padding:0"><table><tbody>${S.ledger.slice(0,25).map(l=>`<tr><td class="muted" style="white-space:nowrap">${dateStr(l.w)}</td><td>${esc(l.t)}</td><td class="r num ${l.a>=0?'ok':''}">${l.a>=0?'+':''}${money(l.a)}</td></tr>`).join('')||'<tr><td class="muted">No transactions yet.</td></tr>'}</tbody></table></div>`;
}
function vFame(){
 const got=ACH.filter(a=>S.ach[a[0]]).length;const mine=S.awards.filter(a=>a.mine);
 const best=S.projects.filter(p=>p.stage==='done').sort((a,b)=>(b.total+(b.intl||0))-(a.total+(a.intl||0))).slice(0,5);
 return `<div class="head"><div><h2>Hall of Fame</h2><p>${got} of ${ACH.length} achievements · ${mine.length} Goldie${mine.length!==1?'s':''}.</p></div></div>
 <div class="ach">${ACH.map(a=>`<div class="${S.ach[a[0]]?'got':''}"><i>${S.ach[a[0]]?'★':'☆'}</i><span><b>${a[1]}</b><small>${a[2]}</small></span></div>`).join('')}</div>
 <div class="grid2" style="margin-top:16px"><div class="panel"><h3>Your biggest hits</h3>${best.length?best.map(p=>`<div class="kv"><span>${esc(p.title)}</span><b class="num">${money(p.total+(p.intl||0))}</b></div>`).join(''):'<p class="muted">No films released yet.</p>'}</div>
 <div class="panel"><h3>Your Goldies</h3>${mine.length?mine.map(a=>`<div class="kv"><span class="muted">${a.year} ${a.cat}</span><span class="gold">${esc(a.title)}</span></div>`).join(''):'<p class="muted">None yet. Critics\' favourites win.</p>'}</div></div>`;
}
function vMore(){return `<div class="head"><div><h2>More</h2><p>${dateStr(S.week)} · ${rankOf().r[1]}</p></div></div><div class="more">${[['talent','Talent','Stars and directors'],['research','Research','New technology'],['empire','Empire','Franchises, streaming, park'],['money','Money','Cash, loans, investors'],['fame','Hall of Fame','Awards and achievements']].map(([k,n,d])=>`<button data-act="tab" data-t="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg><b>${n}</b><small>${d}</small></button>`).join('')}<button data-act="help"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/></svg><b>How to play</b><small>The basics</small></button><button data-act="mute"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/></svg><b>${muted?'Sound off':'Sound on'}</b><small>Tap to switch</small></button><button data-act="newgame"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><b>New studio</b><small>Start over</small></button></div>`}

/* ---------- auto ---------- */
function stopAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null}}
function toggleAuto(){if(autoTimer){stopAuto();render();return}autoTimer=setInterval(()=>{if(!busy)advance()},1100);render()}

/* ---------- splash ---------- */
let setup={start:2,diff:1,hist:true};
function splash(){
 const saved=load();const sv=saved&&!saved.over&&saved.v===2;
 $('#splash').style.display='flex';
 $('#splash').innerHTML=`<div class="in"><svg class="deco" viewBox="0 0 320 60" aria-hidden="true"><line x1="0" y1="30" x2="120" y2="30" stroke="#D4AF37" stroke-opacity=".5"/><line x1="200" y1="30" x2="320" y2="30" stroke="#D4AF37" stroke-opacity=".5"/><circle cx="160" cy="30" r="22" fill="none" stroke="#D4AF37"/><circle cx="160" cy="30" r="5" fill="#D4AF37"/>${[0,1,2,3,4].map(i=>{const a=i/5*Math.PI*2-Math.PI/2;return `<circle cx="${160+Math.cos(a)*13}" cy="${30+Math.sin(a)*13}" r="4" fill="none" stroke="#D4AF37"/>`}).join('')}</svg>
 <h1>Reel Empire</h1><p class="tag">From garage filmmaker to Hollywood legend</p>
 <form id="nf" class="setup" novalidate>${sv?`<button type="button" class="btn gold" style="width:100%;margin-bottom:16px" data-act="continue">Continue ${esc(saved.name)}, ${MONTHS[Math.min(11,Math.floor((((saved.week-1)%52))/4.34))]} ${saved.startYear+Math.floor((saved.week-1)/52)}</button>`:''}
 <label for="sn" class="muted" style="font-size:13px">Name your studio</label><input type="text" id="sn" maxlength="28" placeholder="Silver Lantern Pictures" autocomplete="off"><div class="err" id="snerr"></div>
 <h3>Starting era</h3><div class="segs">${STARTS.map((s,i)=>`<button type="button" class="opt" data-act="su" data-k="start" data-v="${i}" aria-pressed="${setup.start===i}"><b>${s.y}: ${s.n}</b><br><small>${s.d}</small></button>`).join('')}</div>
 <h3>Difficulty</h3><div class="segs" style="grid-template-columns:repeat(3,1fr)">${DIFFS.map((d,i)=>`<button type="button" class="opt" data-act="su" data-k="diff" data-v="${i}" aria-pressed="${setup.diff===i}"><b>${d.n}</b><br><small>${d.d}</small></button>`).join('')}</div>
 <h3>History</h3><button type="button" class="opt" data-act="su" data-k="hist" data-v="${setup.hist?0:1}" aria-pressed="${setup.hist}"><div class="choice"><b>Real Hollywood history</b><small>${setup.hist?'On: wars, TV, strikes, a pandemic and more':'Off: a calmer, invented timeline'}</small></div></button>
 <div class="row"><button type="submit" class="btn ${sv?'ghost':'gold'}">Open the studio gates</button></div>
 ${sv?'<p class="muted" style="font-size:12px;margin:12px 0 0">Starting a new studio replaces your saved game.</p>':''}</form></div>`;
 const nm=$('#sn');if(splash._name)nm.value=splash._name;
 nm.addEventListener('input',()=>{$('#snerr').textContent='';splash._name=nm.value});
 $('#nf').addEventListener('submit',e=>{e.preventDefault();const v=nm.value.trim();if(!v){$('#snerr').textContent='Enter a studio name first.';nm.focus();return}newGame(v,setup.start,setup.diff,setup.hist);$('#splash').style.display='none';tab='studio';render();help()});
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||t.disabled)return;
 const a=t.dataset.act,id=t.dataset.id;
 switch(a){
  case 'tab':tab=t.dataset.t;closeModal();render();window.scrollTo(0,0);break;
  case 'next':advance();break;
  case 'auto':toggleAuto();break;
  case 'close':closeModal();break;
  case 'qdone':done();break;
  case 'bld':buildingModal(t.dataset.k);break;
  case 'upgrade':upgrade(t.dataset.k);break;
  case 'script':scriptModal(id);break;
  case 'write':writeModal();break;
  case 'wg':writeSel.genre=t.dataset.v;writeSel.sugg=null;writeSel.theme=null;{const sc=$('#modal').scrollTop;drawWrite();$('#modal').scrollTop=sc}break;
  case 'wth':writeSel.theme=t.dataset.v;{const sc=$('#modal').scrollTop;drawWrite();$('#modal').scrollTop=sc}break;
  case 'wtier':writeSel.tier=t.dataset.v;{const sc=$('#modal').scrollTop;drawWrite();$('#modal').scrollTop=sc}break;
  case 'wpick':writeSel.writer=id;{const sc=$('#modal').scrollTop;drawWrite();$('#modal').scrollTop=sc}break;
  case 'wgo':startWriting();break;
  case 'buy':buyScript(id);break;
  case 'castm':castModal(id);break;
  case 'crole':castSel.role=t.dataset.k;drawCast();break;
  case 'pick':pickTalent(id);break;
  case 'cast':confirmCast();break;
  case 'rewrite':rewrite(id);break;
  case 'drop':{const p=S.projects.find(x=>x.id===id);[p.dir,p.lead,p.sup].forEach(i=>{const tt=tal(i);if(tt)tt.busy=0});S.projects=S.projects.filter(x=>x!==p);news('"'+p.title+'" was shelved.');save();render();break}
  case 'glm':greenlightModal(id);break;
  case 'gl':glSel[t.dataset.k]=+t.dataset.v;drawGL();break;
  case 'greenlight':greenlight();break;
  case 'evc':eventChoice(+t.dataset.i);break;
  case 'scc':scandalChoice(t.dataset.v);break;
  case 'union':unionChoice(t.dataset.v);break;
  case 'relm':releaseModal(id);break;
  case 'tone':relSel.tone=t.dataset.v==='1';drawRel();break;
  case 'win':relSel.window=+t.dataset.v;drawRel();break;
  case 'fest':relSel.fest=!relSel.fest;drawRel();break;
  case 'wk':relSel.w=+t.dataset.w;drawRel();break;
  case 'schedule':schedule();break;
  case 'premdone':premDone();break;
  case 'revs':{const p=S.projects.find(x=>x.id===id);openModal(mh('Rotten Pears '+p.pears+'%','Reviews: '+esc(p.title))+`<div class="mb">${reviewsHTML(p)}</div><div class="mf"><button class="btn gold" data-act="close">Close</button></div>`);break}
  case 'pm':postMortem(S.projects.find(x=>x.id===id));break;
  case 'pmdone':if(busy)done();else closeModal();break;
  case 'camp0':campaignModal();break;
  case 'camp':{const v=+t.dataset.v*era();spend(v,'Awards campaign');S.campaign[id]=(S.campaign[id]||0)+v;save();campaignModal();render();break}
  case 'envelope':envelope();break;
  case 'awnext':S._aw.i++;drawAward();break;
  case 'awdone':delete S._aw;save();done();break;
  case 'loan':loanModal();break;
  case 'borrow':S.loans+=5*era();earn(5*era(),'Bank loan');save();loanModal();render();break;
  case 'repay':{const r=Math.min(S.loans,5*era());S.loans-=r;spend(r,'Loan repaid');save();loanModal();render();break}
  case 'inv':investorModal();break;
  case 'invyes':S.investor={left:3};S.offer=false;news('You signed a co-financing deal for your next three films.','ok');save();closeModal();render();break;
  case 'invno':S.offer=false;save();closeModal();render();break;
  case 'ipom':ipoModal();break;
  case 'ipo':{const v=ipoValue();S.ipo={price:20};earn(v*.25,'Stock market listing');news(S.name+' rings the opening bell. Shares list at $20.','gold');unlock('ipo');chime('win');save();closeModal();render();break}
  case 'stream':streamerModal();break;
  case 'slaunch':{const c=12*era();spend(c,'Streaming launch');S.streamer={subs:.5,price:9};news(S.name+'+ launches. Your library is now streaming.','gold');unlock('streamer');chime('win');save();streamerModal();render();break}
  case 'sprice':S.streamer.price=+t.dataset.v;save();streamerModal();break;
  case 'seq':sequelModal(id);break;
  case 'mkseq':makeSequel(id);break;
  case 'teamup':teamupModal();break;
  case 'mkteam':makeTeamup();break;
  case 'res':S.tech.cur=id;S.tech.pts=0;toast('Research started.');save();render();break;
  case 'tfilter':talentFilter=t.dataset.v;render();break;
  case 'tmodal':talentModal(id);break;
  case 'su':{const k=t.dataset.k;setup[k]=k==='hist'?t.dataset.v==='1':+t.dataset.v;splash();break}
  case 'help':help();break;
  case 'mute':muted=!muted;render();break;
  case 'newgame':stopAuto();closeModal();splash();break;
  case 'continue':S=load();$('#splash').style.display='none';render();break;
  case 'restart':busy=false;queue=[];closeModal();try{localStorage.removeItem(SAVE)}catch(e){}splash();break;
 }
});
document.addEventListener('input',e=>{if(e.target.dataset.act==='pa'){relSel.pa=+e.target.value;const sc=$('#modal').scrollTop;drawRel();$('#modal').scrollTop=sc;const r=$('#modal input[type=range]');r&&r.focus({preventScroll:true})}});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&$('#veil').classList.contains('show')&&$('#modal .x'))closeModal();
 if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('g.b')){e.preventDefault();buildingModal(e.target.dataset.k)}
 if(e.key==='n'&&!e.target.matches('input')&&!$('#veil').classList.contains('show')&&S&&$('#splash').style.display==='none')advance();
});
$('#veil').addEventListener('click',e=>{if(e.target.id==='veil'&&$('#modal .x'))closeModal()});
splash();
