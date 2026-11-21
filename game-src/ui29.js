/* ===== v19.1 · Multi-film contracts: lock a star in for a franchise ===== */
function ctAll(){return S.contracts=S.contracts||[]}
function ctFor(pid,fid){return ctAll().find(c=>c.p===pid&&c.fid===fid&&c.left>0)}
function ctKey(f){return f.fid||('fr'+f.id)}
function ctFrName(f){const fr=(S.franchises||[]).find(x=>x.id===ctKey(f));return fr?fr.name:(f.base||f.title)}
function ctFee(a){return +(baseActorFee(a)*1.1).toFixed(2)}
let _ctBypass=0;function baseActorFee(a){_ctBypass++;try{return actorFee(a)}finally{_ctBypass--}}
function ctOffer(fid,pid,n){const f=S.films.find(x=>ctKey(x)===fid);const a=person(pid);if(!f||!a)return;
 if(ctFor(pid,fid))return toast('Already under contract');
 if(bondOf(a)<=-35)return toast(`${esc(a.n)} won't sign with you`);
 const hit=(f.aud||0)>=65;const yes=Math.random()<(hit?.92:.7)+bondOf(a)/400;
 const fee=ctFee(a),bonus=+(fee*.15*n).toFixed(2);
 if(!yes){bondAdd(a,-2);story({icon:'📝',paper:'trade',who:[a.id],head:`${esc(a.n)} turns down a ${n}-picture deal with ${esc(S.name)}.`});toast(`${esc(a.n)} said no, for now`);return ctCard(f)}
 S.cash-=bonus;ctAll().push({id:S.id++,p:pid,fid,name:ctFrName(f),left:n,total:n,fee,signedT:tNow(),signStar:fam(a)});bondAdd(a,6,`Signed a ${n}-film deal with ${S.name}`);
 story({icon:'📝',paper:'trade',who:[a.id],head:`${esc(a.n)} signs a ${n}-picture deal to return in the <i>${esc(ctFrName(f))}</i> series for ${esc(S.name)}.`,dm:{p:a.id,text:`Signed! Can't wait to come back for more ${ctFrName(f)} 🎬`}});
 save();toast(`📝 ${esc(a.n)} signed for ${n} more films · ${M(fee)} each`);ctCard(f)}
function ctCard(f){try{const m=document.querySelector('#modal');if(!m)return;const old=m.querySelector('.ct29');const html=ctHTML(f);if(old)old.outerHTML=html;else{const w=m.querySelector('.why28')||m.querySelectorAll('.card')[1]||m.querySelector('.card');if(w)w.insertAdjacentHTML('afterend',html)}}catch(e){}}
function ctHTML(f){if(!f||f.kind==='show'||!f.cast)return '';const fid=ctKey(f);const ids=[f.cast.lead,f.cast.co].concat(f.cast.leads2||[]).filter(Boolean).slice(0,3);if(!ids.length)return '';
 const rows=ids.map(id=>{const a=person(id);if(!a||a.retired)return '';const c=ctFor(id,fid);const fee=ctFee(a);
  return `<div class="ct29r">${portrait(a,40)}<div style="flex:1;min-width:0"><b class="ellip">${esc(a.n)}</b><small class="muted">${c?`📝 Signed · ${c.left} film${c.left>1?'s':''} left · ${M(c.fee)} each`:`Lock in at ${M(fee)} per film`}</small></div>${c?'':`<div class="ct29b"><button class="btn sm gold" style="margin:0" onclick="ctOffer('${fid}','${id}',2)">2 films</button><button class="btn sm ghost" style="margin:0" onclick="ctOffer('${fid}','${id}',3)">3 films</button></div>`}</div>`}).join('');
 return `<div class="card ct29"><b>📝 Sign your stars for the sequels</b><p class="muted" style="font-size:12.5px;margin:4px 0 6px;text-transform:none">Their fee is locked for future <i>${esc(ctFrName(f))}</i> films, even if they become huge. You pay a small signing bonus now.</p>${rows}</div>`}

/* show the offer on the film report */
filmReport=(function(o){return function(f,ctx){let h=o(f,ctx);try{const c=f&&f.kind!=='show'&&(f.aud||0)>=55?ctHTML(f):'';if(c&&typeof h==='string'){const k=h.indexOf('<div class="card"><small>Week by week</small>');h=k>=0?h.slice(0,k)+c+h.slice(k):h+c}}catch(e){}return h}})(filmReport);

/* locked fee when casting a sequel in that franchise */
actorFee=(function(o){return function(a){if(!_ctBypass){try{const fid=typeof W!=='undefined'&&W&&W.script&&W.script.fid;const c=fid&&a&&ctFor(a.id,fid);if(c)return c.fee}catch(e){}}return o(a)}})(actorFee);
personCard=(function(o){return function(x,sel,onclick,isA,locked,extra){let h=o(x,sel,onclick,isA,locked,extra);try{const fid=typeof W!=='undefined'&&W&&W.script&&W.script.fid;const c=fid&&ctFor(x.id,fid);if(c)h=h.replace('<div class="tags">',`<div class="tags"><span class="tag good">📝 Under contract · ${c.left} left · fee locked</span>`)}catch(e){}return h}})(personCard);

/* using up a contract when the sequel is greenlit */
greenlight=(function(o){return function(){const n=S.projects.length;const fid=W&&W.script&&W.script.fid;o.apply(this,arguments);try{if(fid&&S.projects.length>n){const p=S.projects[S.projects.length-1];allCast(p.cast||{}).forEach(id=>{const c=ctFor(id,fid);if(!c)return;c.left--;const a=person(id);
 story({icon:'📝',paper:'trade',who:[id],head:`${esc(a.n)} returns for <i>${esc(p.title)}</i>${c.left?` (${c.left} film${c.left>1?'s':''} left on the deal)`:', the last film on the contract'}.`});
 if(!c.left)addInbox('📝',a.n,`Contract complete: ${c.name}`,`${a.n} has finished the ${c.total}-film deal. You can sign them again after the next release.`)})}}catch(e){console.error(e)}}})(greenlight);

/* stars who outgrow their deal want more money */
function ctTick(){ctAll().forEach(c=>{if(c.left<=0||c.void)return;const a=person(c.p);if(!a||a.retired){c.void=1;return}
 if(tNow()-c.signedT>120){c.void=1;c.left=0;return}
 if(!c.held&&fam(a)>=c.signStar+15&&Math.random()<.08){c.held=1;QUEUE.push(()=>playScene({who:a,role:c.name,tag:'Contract holdout',bg:'office',log:['📝',`${a.n} wants a new deal`],
  lines:[`${esc(a.n)}'s agent is in your office.`,`"When we signed for <i>${esc(c.name)}</i>, my client was a working actor. Now they're a <b>star</b>."`,`"We want the deal torn up. Or we walk."`],
  choices:[{l:`Renegotiate (fee ${M(c.fee)} → ${M(c.fee*1.6)})`,f:()=>{c.fee=+(c.fee*1.6).toFixed(2);bondAdd(a,8,`${S.name} gave them a raise`);return{say:'"Pleasure doing business."',note:'Fee +60% · Bond +8'}}},
   {l:'Hold them to the contract',sub:'Legal, but they may walk anyway',f:()=>{bondAdd(a,-20,`${S.name} refused to renegotiate`);if(Math.random()<.35){c.void=1;c.left=0;story({icon:'💼',paper:'tabloid',who:[a.id],head:`${esc(a.n)} quits the <i>${esc(c.name)}</i> series in a contract dispute with ${esc(S.name)}.`});return{say:'"See you in court."',note:'They walked. Contract void · Bond −20'}}story({icon:'💼',paper:'trade',who:[a.id],head:`${esc(a.n)} grudgingly honours the <i>${esc(c.name)}</i> deal after a stand-off with ${esc(S.name)}.`});return{say:'"Fine. But I won\'t forget this."',note:'They stay · Bond −20'}}},
   {l:'Release them from the deal',f:()=>{c.void=1;c.left=0;bondAdd(a,6,`${S.name} released them from a contract`);return{say:'"That\'s classy. Thank you."',note:'Contract ended · Bond +6'}}}]},runQueue))}})}
const _nm29=nextMonth;nextMonth=function(){const r=_nm29.apply(this,arguments);try{if(S&&!S.over)ctTick()}catch(e){console.error(e)}return r};

/* contracts on the person page */
openPerson=(function(o){return function(id){o(id);try{const L=ctAll().filter(c=>c.p===id&&c.left>0);if(!L.length)return;const box=document.querySelector('#modal .life28');if(box)box.insertAdjacentHTML('afterbegin',`<div class="ct29tag">${L.map(c=>`📝 <b>${esc(c.name)}</b>: ${c.left} of ${c.total} films left · ${M(c.fee)} each`).join('<br>')}</div>`)}catch(e){}}})(openPerson);
