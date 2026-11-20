/* ===================== v9.3 — no-lag sheets, realistic negotiation ===================== */
/* ---------- sheets: animate only when first opened, keep scroll on updates ---------- */
const _md13=modal;modal=function(html){const m=$('#modal');const prev=m&&m.querySelector?m.querySelector('.modal.sheet .sbody'):null;const st=prev?prev.scrollTop:0;const keep=!!prev&&!!html&&MKEEP;
 _md13(html);if(!html)return;const sh=m&&m.querySelector?m.querySelector('.modal.sheet'):null;if(prev&&sh&&sh.classList)sh.classList.add('still');if(keep){const b=sh&&sh.querySelector('.sbody');if(b)b.scrollTop=st}MKEEP=false};
let MKEEP=false;

/* ---------- negotiation ---------- */
function ngInit(){const p=person(NG.id);if(NG.init)return;NG.init=1;const fit=W&&W.script&&p.spec===W.script.genre;
 NG.res=+(NG.ask*R(.8,.95)*(hasT(p,'greedy')?1.1:1)*(hasT(p,'generous')?.88:1)*(hasT(p,'diva')?1.06:1)*(1-Math.min(.1,S.rep/900))*(fit?.96:1)*(p.loyal>2?.94:1)).toFixed(2);
 NG.pat=3+(p.loyal>2?1:0)-(hasT(p,'diva')||hasT(p,'hothead')?1:0);NG.pat0=NG.pat;NG.offer=+(NG.ask*.85).toFixed(2);NG.share=0;NG.bonus=false;NG.tries=0;
 const ag=pick(['Mira Cole','Jonah Pike','Sasha Wren','Eli Brandt','Nina Ortiz']);NG.agent=ag;
 NG.log=[{them:1,s:`Hi, ${esc(ag)} here, ${esc(p.n.split(' ')[0])}'s agent. ${p.star>75||p.fame>75?'We have three other offers on the table, so let’s be quick.':'We love the project.'} We’re looking for <b>${M(NG.ask)}</b>${NG.want?` plus <b>${NG.want}% of the back-end</b>`:''}.`}]}
function ngVal(){return NG.offer+NG.share*NG.ask*.06+(NG.bonus?NG.ask*.08:0)}
function ngStrength(){const r=ngVal()/NG.res;if(NG.want&&NG.share<NG.want&&ngVal()<NG.res*1.12)return r>=.97?['Close · they want more back-end','#d9822b',60]:r>=.85?['Weak','#d63a3f',35]:['Insulting','#8b0000',12];return r>=1.05?['Strong','#1f9d5c',90]:r>=.97?['Close','#d9822b',65]:r>=.85?['Weak','#d63a3f',35]:['Insulting','#8b0000',12]}
negView=function(){ngInit();const p=person(NG.id);const isA=NG.role==='actors';const [sl,sc,sw]=ngStrength();const avail=S.cash+creditLimit()-committed()-wizFees(W);const step=Math.max(.05,+(NG.ask*.05).toFixed(2));
 MKEEP=true;
 modal(`<h3>Negotiating · ${esc(p.n)}</h3><div class="ngh">${portrait(p,64)}<div><b>${esc(p.n)}</b><span>${isA?'Actor':ROLE_LBL[NG.role].replace(/s$/,'')} · ${isA?'💜 '+p.star+' star power':'💜 '+p.fame+' fame'} · ⭐ ${p.skill}</span><span class="ngpat">Patience ${'●'.repeat(Math.max(0,NG.pat))}${'○'.repeat(Math.max(0,NG.pat0-NG.pat))}</span></div></div>
 <div class="ngchat">${NG.log.map(m=>`<div class="ngm ${m.them?'them':'me'}">${m.s}</div>`).join('')}</div>
 <div class="card"><div class="row"><small>Their ask</small><b>${M(NG.ask)}${NG.want?` + ${NG.want}%`:''}</b></div><div class="row" style="margin-top:4px"><small>Your budget left</small><b>${M(avail)}</b></div></div>
 <div class="card"><small>Your offer · upfront salary</small><div class="ngoff"><button class="ngb" aria-label="Lower offer" onclick="NG.offer=Math.max(.05,+(NG.offer-${step}).toFixed(2));negView()">−</button><b>${M(NG.offer)}</b><button class="ngb" aria-label="Raise offer" onclick="NG.offer=+(NG.offer+${step}).toFixed(2);negView()">+</button></div>
 ${isA||NG.role==='directors'?`<small style="display:block;margin-top:10px">Back-end (share of profits)</small><div class="chips">${[0,2,5,8,12].map(x=>`<button class="${NG.share===x?'on':''}" onclick="NG.share=${x};negView()">${x?x+'%':'None'}</button>`).join('')}</div>`:''}
 <div class="kv" style="margin-top:8px"><span>🏆 Bonus if the film is a hit<br><small style="text-transform:none">Pays ${M(NG.ask*.25)} only if it makes 3× its budget</small></span><button class="btn sm ${NG.bonus?'gold':'ghost'}" style="margin:0;width:auto" onclick="NG.bonus=!NG.bonus;negView()">${NG.bonus?'On':'Off'}</button></div>
 <div class="row" style="margin-top:10px"><small>Deal strength</small><b style="color:${sc}">${sl}</b></div><div class="meter"><i style="width:${sw}%;background:${sc}"></i></div></div>
 <div class="sticky2" style="flex-wrap:wrap"><button class="btn ghost" style="flex:1" onclick="ngWalk()">Walk away</button><button class="btn ghost" style="flex:1" onclick="ngAccept()">Accept their ask</button><button class="btn gold" style="flex:1 1 100%" onclick="negOffer()">Send offer · ${M(NG.offer)}${NG.share?' + '+NG.share+'%':''}${NG.bonus?' + bonus':''}</button></div>`)};
negOffer=function(){const p=person(NG.id);const v=ngVal();NG.tries++;NG.log.push({me:1,s:`I can do <b>${M(NG.offer)}</b>${NG.share?` with ${NG.share}% back-end`:''}${NG.bonus?' plus a hit bonus':''}.`});
 const shareOK=NG.share>=NG.want||v>=NG.res*1.12;
 if(v>=NG.res&&shareOK){NG.log.push({them:1,s:pick(['You’ve got a deal. 🤝','We can work with that. Send the paperwork.','Done. They’re excited to get started.'])});return ngSign(NG.offer,NG.share,NG.bonus)}
 const r=v/NG.res;NG.pat-=r<.75?2:1;
 if(NG.pat<=0){NG.log.push({them:1,s:pick(['We’re done here. Good luck with the film.','My client is taking another offer.','This isn’t going to work. Goodbye.'])});p.snub=tNow()+1;MKEEP=true;negView();setTimeout(()=>{modal(`<div class="popcard"><div style="font-size:40px">🚪</div><h3>${esc(p.n)} walked away</h3><p class="muted">“Call us when you’re serious.” They won’t take your calls this month.</p></div><button class="btn ghost" onclick="modal();wiz()">OK</button>`)},900);return}
 const newAsk=Math.max(NG.res*1.01,NG.ask-(NG.ask-v)*R(.25,.45));NG.ask=+newAsk.toFixed(2);if(NG.want&&!shareOK&&Math.random()<.5)NG.want=Math.max(0,NG.want-1);
 NG.log.push({them:1,s:r<.75?`That’s not serious. ${NG.pat===1?'Last chance: ':''}We need <b>${M(NG.ask)}</b>${NG.want?` and ${NG.want}%`:''}.`:!shareOK?`The back-end matters to us. Meet us at <b>${M(NG.ask)}</b> with ${NG.want}%.`:pick([`We’re getting closer. Come up to <b>${M(NG.ask)}</b> and we have a deal.`,`My client really wants this. <b>${M(NG.ask)}</b>${NG.want?` + ${NG.want}%`:''} and we sign today.`,`Meet us at <b>${M(NG.ask)}</b>.`])});
 sfx('click');negView()};
function ngAccept(){NG.log.push({me:1,s:`Fine. <b>${M(NG.ask)}</b>${NG.want?` + ${NG.want}%`:''} it is.`});NG.log.push({them:1,s:'Pleasure doing business. 🤝'});ngSign(NG.ask,Math.max(NG.share,NG.want),NG.bonus)}
function ngWalk(){modal();wiz()}
function ngSign(fee,share,bonus){const p=person(NG.id);W.deals=W.deals||{};W.deals[NG.id]={fee:+(+fee).toFixed(2),share,bonus:bonus?+(NG.ask*.25).toFixed(2):0};if(NG.role==='actors')assignCast(NG.id,NG.slot);else W[NG.slot]=NG.id;if(W.raise)delete W.raise[NG.id];
 sfx('cash');modal(`<div class="popcard"><div style="font-size:40px">✅</div><h3>Contract signed!</h3><div class="center" style="margin:8px 0">${portrait(p,64)}</div><b>${esc(p.n)}</b>
 <div class="card" style="margin-top:10px;text-align:left"><div class="row"><span class="muted">Upfront salary</span><b>${M(fee)}</b></div><div class="row"><span class="muted">Back-end</span><b>${share}%</b></div><div class="row"><span class="muted">Hit bonus</span><b>${bonus?M(NG.ask*.25):'No'}</b></div></div>
 <div class="card warnbox" style="text-align:left"><b>⚠️ Removal penalty</b><p style="font-size:13px;margin-top:4px">Firing ${esc(p.n)} later costs ${M(fee*.3)} (30% of salary).</p></div></div><button class="btn gold" onclick="modal();wiz()">Back to the film</button>`)}

const _gl13=greenlight;greenlight=function(){const d=W&&W.deals||{};const used=W?[W.dir,W.lead,W.co,W.comp,W.dp].concat(W.sup||[],W.leads2||[],W.cos2||[]):[];const hb=sum(Object.entries(d).filter(([id,x])=>used.includes(id)&&x.bonus),([id,x])=>x.bonus);const n=S.projects.length;_gl13();if(S.projects.length>n&&hb)S.projects[S.projects.length-1].hitBonus=+hb.toFixed(2)};
const _rf13=releaseFilm;releaseFilm=function(p){const f=_rf13(p);if(p.hitBonus)f.hitBonus=p.hitBonus;return f};
const _wbo13=weekBO;weekBO=function(){_wbo13();S.films.forEach(f=>{if(f.hitBonus&&!f.hbDone&&(f.ended||f.dist==='stream'||f.dist==='sell')){f.hbDone=1;if(f.ww>=3*f.costTotal){S.cash-=f.hitBonus;f.profit=+(f.profit-f.hitBonus).toFixed(1);addNews(`🏆 <b>${esc(f.title)}</b> hits 3× its budget, triggering ${M(f.hitBonus)} in talent bonuses.`)}}})};
