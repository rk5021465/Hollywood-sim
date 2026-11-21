"use strict";
const $=s=>document.querySelector(s);
const IC={
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
 book:'<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h11"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 people:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14c2.8 0 5 2.2 5 5"/>',
 palace:'<path d="M3 21h18M5 21V11h14v10M9 21v-5h6v5M12 3c-2 2-4 3-4 6h8c0-3-2-4-4-6z"/>',
 scroll:'<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M6 4a2 2 0 0 0-2 2v2h2M10 9h6M10 13h6"/>',
 venue:'<path d="M3 21h18M5 21v-9l7-7 7 7v9M10 21v-5h4v5"/>',
 feast:'<path d="M4 13h16a8 8 0 0 1-16 0zM12 4v4M8 6v2M16 6v2"/>',
 decor:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
 music:'<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
 horse:'<path d="M5 20l2-7 4-1 3-6 3 1 1 3-3 2v8M7 13l-2-3"/>',
 lamp:'<path d="M5 15c0 2 3 4 7 4s7-2 7-4zM12 15c-2-2-2-5 0-9 2 4 2 7 0 9z"/>',
 gift:'<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18M12 9v11M12 9c-3 0-5-1-5-3s3-2 5 3c2-5 5-5 5-3s-2 3-5 3"/>',
 star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'
};
const svg=(k,s=22)=>'<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+IC[k]+'</svg>';
const stars=q=>'<span class="stars" aria-label="'+q+' of 5">'+'★'.repeat(Math.round(q))+'<span style="opacity:.25">'+'★'.repeat(5-Math.round(q))+'</span></span>';
function hashS(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
function portrait(seed,female,size=42){const h=hashS(seed),sk=['#C68B5E','#A86F48','#8E5A3A','#D29A6A'][h%4],tc=['#C8102E','#F29F05','#E9A23B','#2a6fb0','#5E8C46','#F6EEDF'][h%6];
 let s='<svg viewBox="0 0 42 42" width="'+size+'" height="'+size+'"><rect width="42" height="42" fill="#2A2031"/>';
 s+='<path d="M6 42c1-9 7-13 15-13s14 4 15 13z" fill="'+(female?'#C8102E':tc)+'"/>';
 s+='<rect x="17" y="24" width="8" height="7" fill="'+sk+'"/><ellipse cx="21" cy="19" rx="8" ry="9" fill="'+sk+'"/>';
 if(female){s+='<path d="M12 20c0-8 4-12 9-12s9 4 9 12c-2-4-5-6-9-6s-7 2-9 6z" fill="#1b1210"/><path d="M8 42c0-14 3-26 13-28 10 2 13 14 13 28" fill="none" stroke="'+tc+'" stroke-width="3" opacity=".9"/><circle cx="21" cy="14.5" r="1.2" fill="#C8102E"/>'}
 else{s+='<path d="M11 16c0-6 4-9 10-9s10 3 10 9c-3-2-6-2-10-2s-7 0-10 2z" fill="'+tc+'"/><path d="M12 15h18" stroke="#D9A931" stroke-width="1"/>';if(h%3)s+='<path d="M15 24c2 2 10 2 12 0" stroke="#1b1210" stroke-width="2" fill="none"/>'}
 s+='<circle cx="18" cy="19" r="1" fill="#1b1210"/><circle cx="24" cy="19" r="1" fill="#1b1210"/></svg>';return s}

const UI={tab:'home',view:null,scene:null};
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
function sheet(html,onclick){closeSheet();const bg=document.createElement('div');bg.className='sheet-bg';bg.id='sheet';bg.innerHTML='<div class="sheet" role="dialog"><div class="grab"></div>'+html+'</div>';bg.addEventListener('click',e=>{if(e.target===bg&&!bg.dataset.lock)closeSheet();const a=e.target.closest('[data-s]');if(a&&onclick)onclick(a.dataset.s,a)});document.body.appendChild(bg);return bg}
function closeSheet(){const s=$('#sheet');if(s)s.remove()}
function chime(f=660){try{const A=window._ac||(window._ac=new (window.AudioContext||window.webkitAudioContext)());const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,A.currentTime);g.gain.exponentialRampToValueAtTime(.12,A.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+.7);o.connect(g).connect(A.destination);o.start();o.stop(A.currentTime+.75)}catch(e){}}

// ---------------- splash ----------------
function splash(){const has=load();S=null;if(has){load()}
 document.getElementById('app').innerHTML='<div class="splash"><svg width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="43" fill="none" stroke="#D9A931" stroke-width="1"/><path d="M45 14c-9 10-20 15-20 30h40c0-15-11-20-20-30z" fill="#C8102E"/><rect x="27" y="44" width="36" height="3" fill="#D9A931"/><path d="M30 47v22M60 47v22M45 47v22" stroke="#D9A931" stroke-width="2"/><rect x="22" y="69" width="46" height="4" fill="#F6EEDF"/><circle cx="45" cy="12" r="3" fill="#D9A931"/></svg>'+
 '<h1>Shaadi Inc.</h1><div class="sub">Four hundred years of weddings</div><p class="mu sm" style="max-width:300px;margin:18px auto 28px">Build a wedding house in 1726 Jaipur and hand it down through the generations.</p>'+
 (S?'<button class="btn pri full" style="max-width:300px" id="cont">Continue: '+S.house+', '+MONTHS[S.month]+' '+S.year+'</button><div style="height:10px"></div><button class="btn ghost full" style="max-width:300px" id="newg">Start a new house</button>':'<button class="btn pri full" style="max-width:300px" id="newg">Found your house</button>')+
 '<p class="dim xs" style="margin-top:30px">Stage 1 · 1726 to 1800</p></div>';
 if(S)$('#cont').onclick=()=>{render()};
 $('#newg').onclick=()=>{if(S&&!confirmNew())return;founderSheet()}}
let _cn=0;function confirmNew(){if(_cn++)return true;toast('Tap again to erase your saved house');setTimeout(()=>_cn=0,2500);return false}
function founderSheet(){let tr='charming';const draw=()=>{const bg=sheet('<h2>Found your house</h2><p class="mu sm">November 1726. Amber, the old capital, buzzes with talk of a new city.</p>'+
 '<label class="sm mu">Your name</label><input class="input" id="fn" maxlength="24" value="'+(window._fn||'Ratan Kashyap')+'">'+
 '<label class="sm mu">Your house will be called</label><div id="hn" class="gold" style="font-family:var(--serif);font-size:22px;margin:2px 0 14px"></div>'+
 '<div class="sm mu" style="margin-bottom:6px">Your strength</div>'+Object.entries(TRAITS).map(([k,t])=>'<button class="opt'+(k===tr?' sel':'')+'" data-s="t:'+k+'"><div class="t">'+t.name+'</div><div class="sm mu">'+t.desc+'</div></button>').join('')+
 '<button class="btn pri full" data-s="go" style="margin-top:8px">Open the doors</button>',(a)=>{if(a.startsWith('t:')){window._fn=$('#fn').value;tr=a.slice(2);draw()}else if(a==='go'){const n=($('#fn').value||'Ratan Kashyap').trim();const sn=n.split(' ').slice(-1)[0];newGame(n,tr,'House of '+sn);closeSheet();UI.tab='home';render();setTimeout(()=>helpSheet(),300)}});
 const upd=()=>{const n=($('#fn').value||'').trim();$('#hn').textContent='House of '+(n.split(' ').slice(-1)[0]||'…')};$('#fn').addEventListener('input',upd);upd()};draw()}
function helpSheet(){sheet('<h2>How a wedding house works</h2><div class="sm" style="margin-top:10px;line-height:1.6">'+
 '<p><b class="gold">1. Take bookings.</b> Families send enquiries. Each pays a fixed fee, and you pay every vendor out of it. What is left is your profit.</p>'+
 '<p><b class="gold">2. Plan.</b> Pick a venue, feast, decoration, music, procession, lights, officiant and gifts. Each side of the family has demands, and they often clash.</p>'+
 '<p><b class="gold">3. Run the day.</b> Handle what goes wrong and start the ceremony before the muhurat.</p>'+
 '<p><b class="gold">4. Grow.</b> Happy families bring fame, and fame brings nobles and one day royalty. Your heirs carry the house forward.</p>'+
 '<p class="mu">No weddings happen in the holy months of July to October for Hindu and Jain families.</p></div><button class="btn pri full" data-s="x">Begin</button>',a=>closeSheet())}

// ---------------- main layout ----------------
function render(){if(!S){splash();return}
 if(S.bankrupt){gameOver();return}
 const app=document.getElementById('app');
 if(UI.view){if(UI.view.t==='plan')return renderPlan();if(UI.view.t==='wed')return renderWedding()}
 const blk=blockers().length;const ninq=S.inquiries.length;
 app.innerHTML='<div class="topbar"><div class="house"><b>'+S.house+'</b><span>'+MONTHS[S.month]+' '+S.year+' · '+FAME[fameTier()].name+'</span></div><div class="chip"><i>₹</i>'+Math.round(S.money).toLocaleString('en-IN')+'</div></div>'+
 '<div class="main" id="main"></div>'+
 '<nav class="nav">'+[['home','Home','home'],['book','Bookings','cal'],['vend','Vendors','people'],['house','House','palace'],['chron','Chronicle','scroll']].map(([k,l,i])=>'<button data-tab="'+k+'" class="'+(UI.tab===k?'on':'')+'">'+svg(i)+l+((k==='book'&&ninq)||(k==='home'&&blk)?'<span class="dot"></span>':'')+'</button>').join('')+'</nav>';
 app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{UI.tab=b.dataset.tab;render()});
 const m=$('#main');({home:vHome,book:vBook,vend:vVend,house:vHouse,chron:vChron})[UI.tab](m);
 m.onclick=onMain;
 if(S.pendingHeir)heirSheet();
}
function onMain(e){const a=e.target.closest('[data-a]');if(!a)return;const [k,v]=a.dataset.a.split(':');const id=+v;
 const B=()=>S.bookings.find(b=>b.id===id);
 if(k==='next')doNext();
 else if(k==='accept'){const err=acceptInquiry(id);if(err)toast(err);else{chime(784);toast('Booked');}render()}
 else if(k==='decline'){declineInquiry(id);render()}
 else if(k==='plan'){UI.view={t:'plan',id};render()}
 else if(k==='run'){const b=B();if(!b.locked){UI.view={t:'plan',id};render();toast('Lock the plan first');return}startWedding(b);UI.view={t:'wed',id};render()}
 else if(k==='tab'){UI.tab=v;render()}
 else if(k==='hire')hireSheet();
 else if(k==='fire'){fire(v);render()}
 else if(k==='up'){const u=UPGRADES.find(x=>x.id===v);const err=buyUpgrade(u);if(err)toast(err);else{chime(880);toast(u.name+' done')}render()}
 else if(k==='charity'){const err=charityWedding();if(err)toast(err);else{chime(880);toast('Twelve couples married. Fame rises.')}render()}
 else if(k==='repay'){repay(500);render()}
 else if(k==='help')helpSheet();
 else if(k==='menu')menuSheet();
}
function doNext(){const bl=blockers();if(bl.length){const b=bl[0].b;toast(bl[0].t);UI.view=b.locked?null:{t:'plan',id:b.id};if(b.locked){startWedding(b);UI.view={t:'wed',id:b.id}}render();return}
 const ev=advanceMonth();if(S.bankrupt){render();return}
 render();const show=ev.filter(e=>e.hist||e.succession||e.end||e.bad||e.t);if(show.length)monthSheet(ev)}
function monthSheet(ev){const hist=ev.filter(e=>e.hist),oth=ev.filter(e=>!e.hist&&!e.succession&&!e.end);
 let h='<h2>'+MONTHS[S.month]+' '+S.year+'</h2>';
 hist.forEach(e=>h+='<div class="card hl" style="margin-top:12px"><div class="xs gold">History · '+e.y+'</div><div style="font-family:var(--serif);font-size:18px;margin-top:4px">'+e.t+'</div></div>');
 oth.forEach(e=>h+='<p class="sm '+(e.bad?'warn':'')+'">'+e.t+'</p>');
 if(ev.some(e=>e.end))h+='<div class="card hl"><h3>The century turns</h3><p class="sm">You have reached 1801. Stage 1 is complete. The next update takes your house into the 1800s, with railways and the first cameras. You can keep playing in the meantime.</p></div>';
 if(ev.some(e=>e.succession))h+='<p class="bad">'+ev.find(e=>e.succession).t+'</p>';
 h+='<button class="btn pri full" data-s="x" style="margin-top:8px">Continue</button>';
 if(!hist.length&&!oth.length&&!ev.some(e=>e.end||e.succession))return;
 sheet(h,()=>{closeSheet();if(S.pendingHeir)heirSheet()});if(hist.length)chime(523)}
function heirSheet(){const H=S.pendingHeir;if(!H)return;const bg=sheet('<h2>Choose the next head</h2><p class="mu sm">'+S.head.name+' has passed on. Who will lead the '+S.house+'?</p>'+H.map((h,i)=>'<button class="opt" data-s="'+i+'"><div class="row">'+portrait(h.name,h.female,48)+'<div><div class="t">'+h.name+'</div><div class="sm mu">Age '+h.age+' · '+TRAITS[h.trait].name+'</div><div class="xs dim">'+TRAITS[h.trait].desc+'</div></div></div></button>').join(''),a=>{chooseHeir(+a);closeSheet();toast('A new generation begins');render()});bg.dataset.lock=1}
function gameOver(){document.getElementById('app').innerHTML='<div class="splash"><h1>The house falls</h1><p class="mu" style="max-width:320px">Debts to the moneylender grew too large. The '+S.house+' closed in '+MONTHS[S.month]+' '+S.year+' after '+S.stats.weddings+' weddings.</p><button class="btn pri" id="ng">Start again</button></div>';$('#ng').onclick=()=>{localStorage.removeItem(SAVE);S=null;splash()}}
function menuSheet(){sheet('<h2>Menu</h2><button class="opt" data-s="help"><div class="t">How to play</div></button><button class="opt" data-s="title"><div class="t">Back to title screen</div></button>',a=>{closeSheet();if(a==='help')helpSheet();if(a==='title'){save();S=null;splash()}})}

// ---------------- Home ----------------
function vHome(m){const now=nowMi(),t=fameTier(),nf=FAME[t+1];const prog=nf?((S.rep-FAME[t].min)/(nf.min-FAME[t].min)*100):100;
 const bl=blockers();const season=SEASON[S.month]===0?'Holy months: only Muslim weddings':SEASON[S.month]>=1.2?'Peak wedding season':'Wedding season';
 let h='<div class="card"><div class="row"><div><div class="xs mu">'+season+'</div><h2 style="margin-top:2px">'+MONTHS[S.month]+' '+S.year+'</h2></div><span class="sp"></span><button class="btn sm ghost" data-a="menu">Menu</button></div>';
 if(bl.length)h+='<p class="sm warn" style="margin:10px 0">'+bl[0].t+'</p><button class="btn red full" data-a="run:'+bl[0].b.id+'">Go to the wedding</button>';
 else h+='<button class="btn pri full" style="margin-top:12px" data-a="next">Next month</button><div class="xs dim" style="margin-top:6px;text-align:center">Monthly costs '+money(monthCosts())+'</div>';
 h+='</div>';
 h+='<div class="grid2"><div class="mini"><div class="l">Money</div><div class="v">'+money(S.money)+'</div>'+(S.debt?'<div class="xs bad">Debt '+money(S.debt)+'</div>':'')+'</div><div class="mini"><div class="l">Weddings</div><div class="v">'+S.stats.weddings+'</div><div class="xs mu">'+S.stats.perfect+' near perfect</div></div></div>';
 h+='<div class="card" style="margin-top:12px"><div class="row"><div><div class="xs mu">Fame</div><div style="font-family:var(--serif);font-size:19px">'+FAME[t].name+'</div></div><span class="sp"></span><div class="sm gold">'+Math.round(S.rep)+'</div></div><div class="bar" style="margin-top:8px"><i style="width:'+clamp(prog,0,100)+'%;background:var(--gold)"></i></div>'+(nf?'<div class="xs dim" style="margin-top:5px">Next: '+nf.name+' at '+nf.min+'</div>':'')+'</div>';
 const up=activeBookings().sort((a,b)=>a.wm-b.wm);
 h+='<div class="sec">Coming up<small>'+up.length+' of '+capacity()+' slots</small></div>';
 if(!up.length)h+='<div class="card mu sm">No weddings booked. '+(S.inquiries.length?'<a class="gold" data-a="tab:book">'+S.inquiries.length+' families are waiting for an answer.</a>':'Wait for families to send enquiries.')+'</div>';
 up.forEach(b=>h+=bookingRow(b));
 h+='<div class="sec">Rival<small>'+S.rival.name+'</small></div><div class="card"><div class="row sm"><span>You</span><span class="sp"></span><span class="gold">'+Math.round(S.rep)+'</span></div><div class="bar" style="margin:4px 0 10px"><i style="width:'+Math.min(100,S.rep/Math.max(S.rep,S.rival.rep,1)*100)+'%;background:var(--gold)"></i></div><div class="row sm"><span>'+S.rival.name+'</span><span class="sp"></span><span>'+Math.round(S.rival.rep)+'</span></div><div class="bar" style="margin-top:4px"><i style="width:'+Math.min(100,S.rival.rep/Math.max(S.rep,S.rival.rep,1)*100)+'%;background:var(--red)"></i></div></div>';
 h+='<div class="sec">Recent news</div><div class="card">'+S.log.slice(0,6).map(l=>'<div class="log"><b>'+MS[miM(l.i)]+' '+miY(l.i)+'</b><span>'+l.t+'</span></div>').join('')+'</div>';
 m.innerHTML=h}
function bookingRow(b){const now=nowMi(),dl=b.wm-now;const st=b.delegate?'<span class="tag o">With '+(S.staff.find(s=>s.id===b.delegate)||{}).name+'</span>':b.locked?'<span class="tag g">Planned</span>':'<span class="tag r">Needs a plan</span>';
 return '<div class="card"><div class="row"><div style="flex:1;min-width:0"><div style="font-family:var(--serif);font-size:18px">'+b.bride.surname+' and '+b.groom.surname+'</div><div class="xs mu">'+TRADITIONS[b.trad].name+' · '+CLASSES[b.cls].name+' · '+b.guests+' guests</div><div style="margin-top:6px">'+st+'<span class="tag">'+(dl<=0?'This month':dl===1?'Next month':'In '+dl+' months')+'</span></div></div><div style="text-align:right"><div class="gold">'+money(b.fee)+'</div><div class="xs dim">fee</div></div></div>'+
 '<div class="row" style="margin-top:10px"><button class="btn sm" data-a="plan:'+b.id+'">'+(b.locked?'View plan':'Plan')+'</button>'+(dl<=0&&!b.delegate?'<button class="btn sm red" data-a="run:'+b.id+'">Run wedding day</button>':'')+'</div></div>'}

// ---------------- Bookings ----------------
function vBook(m){let h='<div class="sec">Enquiries<small>'+S.inquiries.length+' waiting · reply this month</small></div>';
 if(!S.inquiries.length)h+='<div class="card mu sm">No new enquiries. Families write more often in the wedding season and as your fame grows.</div>';
 S.inquiries.forEach(q=>{const exp=q.exp-nowMi();h+='<div class="card'+(q.referral?' hl':'')+'">'+(q.referral?'<div class="xs gold" style="margin-bottom:4px">Recommended by a happy family</div>':'')+
  '<div class="row"><div style="flex:1;min-width:0"><div style="font-family:var(--serif);font-size:19px">'+q.bride.surname+' and '+q.groom.surname+'</div><div class="xs mu">'+TRADITIONS[q.trad].name+' · '+CLASSES[q.cls].name+'</div></div><div style="text-align:right"><div class="gold" style="font-size:17px">'+money(q.fee)+'</div><div class="xs dim">fee</div></div></div>'+
  '<div class="kv" style="margin:10px 0"><span>Wedding</span><span>'+dateStr(q.wm)+'</span><span>Guests</span><span>'+q.guests+'</span><span>Expectations</span><span>'+stars(CLASSES[q.cls].expect)+'</span></div>'+demandsHtml(q,false)+
  '<div class="row" style="margin-top:10px"><button class="btn sm ghost" data-a="decline:'+q.id+'">Decline</button><span class="sp"></span><span class="xs dim">'+(exp<=0?'Last chance this month':'')+'</span><button class="btn sm pri" data-a="accept:'+q.id+'">Accept</button></div></div>'});
 const up=activeBookings().sort((a,b)=>a.wm-b.wm);h+='<div class="sec">Booked<small>'+up.length+' of '+capacity()+'</small></div>';up.forEach(b=>h+=bookingRow(b));if(!up.length)h+='<div class="card mu sm">Nothing booked yet.</div>';
 m.innerHTML=h}
function demandsHtml(b,live){const dl=live?demandList(b):null;let h='';for(const side of ['bride','groom']){const fam=b[side];h+='<div class="xs mu" style="margin-top:6px">'+(side==='bride'?'Bride\'s family':'Groom\'s family')+' · '+fam.father+'</div>';
 b.dem[side].forEach((id,i)=>{const t=id==='jainfood'?'Jain food: no onion or garlic':DEMANDS.find(d=>d.id===id).t;let ic='<span class="dim">•</span>';if(live){const d=dl.find(x=>x.side===side&&x.id===id);ic=d.ok?'<span class="ok">✓</span>':'<span class="bad">✗</span>'}h+='<div class="demand"><span class="ic">'+ic+'</span><span>'+t+'</span></div>'})}return h}

// ---------------- Planner ----------------
function renderPlan(){const b=S.bookings.find(x=>x.id===UI.view.id);if(!b){UI.view=null;return render()}
 const app=document.getElementById('app');const pr=predictScores(b),cost=planCost(b),iss=planIssues(b);const profit=b.fee-cost;const clerk=S.upgrades.clerk;
 app.innerHTML='<div class="topbar"><button class="btn sm ghost" id="back">← Back</button><div class="house" style="text-align:center"><b style="font-size:17px">'+b.bride.surname+' and '+b.groom.surname+'</b><span>'+dateStr(b.wm)+' · '+b.guests+' guests</span></div><div class="chip"><i>₹</i>'+Math.round(S.money).toLocaleString('en-IN')+'</div></div><div class="main" id="main"></div>';
 const m=$('#main');let h='<div class="scene" id="sc"><div class="ov">Drag to look around</div></div>';
 h+='<div class="card"><div class="meters"><div><div class="lab"><span>Bride\'s family</span><span>'+Math.round(pr.bride)+'</span></div><div class="bar"><i style="width:'+pr.bride+'%;background:var(--gold)"></i></div></div><div class="clock" style="font-size:16px">'+stars(CLASSES[b.cls].expect)+'<small>expected</small></div><div><div class="lab"><span>Groom\'s family</span><span>'+Math.round(pr.groom)+'</span></div><div class="bar"><i style="width:'+pr.groom+'%;background:var(--rose)"></i></div></div></div><div class="xs dim" style="margin-top:8px">Predicted happiness before anything goes wrong on the day.</div></div>';
 h+='<div class="card"><h3 style="margin-bottom:4px">Demands</h3>'+demandsHtml(b,true)+'</div>';
 h+='<div class="sec">Vendors'+(b.locked?'<small>Locked</small>':'')+'</div>';
 for(const s of SLOTS){const v=b.plan[s.id]&&VBY[b.plan[s.id]];h+='<button class="slot'+(v?'':' empty')+'" data-s="'+s.id+'" '+(b.locked?'disabled':'')+'><span class="si">'+svg(s.icon,20)+'</span><span style="flex:1;min-width:0"><span class="xs mu" style="display:block">'+s.name+'</span><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(v?v.name:'Choose…')+'</span></span>'+(v?'<span style="text-align:right">'+stars(v.q)+'<span class="xs dim" style="display:block">'+money(vCost(v,b))+'</span></span>':'')+'</button>'}
 if(pr.over>1)h+='<p class="sm bad">The venue holds '+planObj(b).venue.cap+' but '+b.guests+' guests are coming.</p>';
 h+='<div class="card"><div class="kv"><span>Fee from the families</span><span>'+money(b.fee)+'</span><span>Vendor costs</span><span>'+money(cost)+'</span><span>Profit</span><span class="'+(profit>=0?'ok':'bad')+'">'+(clerk?money(profit):'about '+money(Math.round(profit/50)*50))+'</span></div>'+(clerk?'':'<div class="xs dim" style="margin-top:6px">A ledger clerk would show exact figures.</div>')+'<div class="xs dim" style="margin-top:4px">Problems on the day can cost extra.</div></div>';
 if(!b.locked){h+='<button class="btn full" id="sug" style="margin-bottom:8px">Suggest a plan</button><button class="btn pri full" id="lock" '+(iss.length?'disabled':'')+'>Lock the plan</button>'+(iss.length?'<p class="xs dim" style="margin-top:6px">'+iss[0]+'</p>':'')}
 else{h+='<button class="btn full" id="unlock" style="margin-bottom:8px">Change the plan</button>';if(b.wm<=nowMi()&&!b.delegate)h+='<button class="btn red full" id="runw">Run the wedding day</button>'}
 if(S.staff.length&&b.wm>nowMi()-1){h+='<div class="sec">Delegate</div><div class="card sm"><p class="mu" style="margin:0 0 8px">A manager can plan and run this wedding for you. Results depend on their skill.</p>'+S.staff.map(s=>'<button class="opt'+(b.delegate===s.id?' sel':'')+'" data-d="'+s.id+'"><div class="row"><span class="t">'+s.name+'</span><span class="sp"></span>'+stars(s.skill)+'</div></button>').join('')+(b.delegate?'<button class="btn sm ghost" data-d="none">Run it myself</button>':'')+'</div>'}
 m.innerHTML=h;
 $('#back').onclick=()=>{UI.view=null;render()};
 m.querySelectorAll('.slot').forEach(el=>el.onclick=()=>vendorSheet(b,el.dataset.s));
 if($('#sug'))$('#sug').onclick=()=>{b.plan=autoPlan(b,3);save();renderPlan();toast('Suggested a balanced plan')};
 if($('#lock'))$('#lock').onclick=()=>{b.locked=true;save();chime(784);toast('Plan locked');renderPlan()};
 if($('#unlock'))$('#unlock').onclick=()=>{b.locked=false;save();renderPlan()};
 if($('#runw'))$('#runw').onclick=()=>{startWedding(b);UI.view={t:'wed',id:b.id};render()};
 m.querySelectorAll('[data-d]').forEach(el=>el.onclick=()=>{b.delegate=el.dataset.d==='none'?null:el.dataset.d;save();renderPlan();toast(b.delegate?'Delegated':'You will run it yourself')});
 mountScene($('#sc'),b,250,{guests:b.guests,trad:b.trad});
}
function vendorSheet(b,slot){const s=SLOTS.find(x=>x.id===slot);const list=VENDORS.filter(v=>v.slot===slot);
 sheet('<h2>'+s.name+'</h2><p class="xs mu">'+b.guests+' guests · '+TRADITIONS[b.trad].name+' wedding</p>'+list.map(v=>{const err=vendorOk(v,b);const rl=relLvl(v.id);const extra=v.slot==='venue'?' · holds '+v.cap:v.slot==='feast'?' · '+(v.food==='jain'?'Jain food':v.food==='veg'?'Vegetarian':'Meat and vegetarian'):'';
  return '<button class="opt'+(b.plan[slot]===v.id?' sel':'')+'" data-s="'+v.id+'" '+(err?'disabled':'')+'><div class="row"><span class="t" style="flex:1">'+v.name+'</span><span class="gold">'+money(vCost(v,b))+'</span></div><div class="row" style="margin-top:3px">'+stars(v.q)+'<span class="xs mu">'+extra+'</span><span class="sp"></span><span class="xs '+(v.rel<.75?'warn':'dim')+'">'+(v.rel<.75?'Unreliable':v.rel>=.9?'Reliable':'')+'</span></div><div class="xs mu" style="margin-top:3px">'+(err?'<span class="bad">'+err+'</span>':v.note)+(rl>=2?' · <span class="gold">Friend of the house ('+rl+')</span>':'')+'</div></button>'}).join(''),
 id=>{b.plan[slot]=id;save();closeSheet();renderPlan()})}
function mountScene(el,b,h,opt){if(!el)return;const cv=document.createElement('canvas');el.appendChild(cv);const sc=new E3.Scene(cv,h);buildVenue(sc,planObj(b),opt);sc.start();UI.scene=sc;return sc}

// ---------------- Wedding day ----------------
function fmtT(m){m=((m%1440)+1440)%1440;let h=Math.floor(m/60),mm=m%60;const ap=h>=12?'PM':'AM';h=h%12||12;return h+':'+String(mm).padStart(2,'0')+' '+ap}
function renderWedding(){const b=S.bookings.find(x=>x.id===UI.view.id);if(!b||(!b.wd&&!b.result)){UI.view=null;return render()}
 const app=document.getElementById('app');
 if(!app.querySelector('#wsc')){app.innerHTML='<div class="topbar"><div class="house"><b style="font-size:17px">'+b.bride.surname+' and '+b.groom.surname+'</b><span>'+TRADITIONS[b.trad].name+' wedding · '+b.guests+' guests</span></div><div class="chip"><i>₹</i><span id="wmoney"></span></div></div><div class="main" id="main"><div class="scene" id="wsc"></div><div id="wbody"></div></div>';
  mountScene($('#wsc'),b,230,{guests:b.guests,trad:b.trad,couple:true})}
 $('#wmoney').textContent=Math.round(S.money-(b.wd?b.wd.cost:0)).toLocaleString('en-IN');
 const body=$('#wbody');
 if(b.result){UI.scene&&(UI.scene._warn.vis=false);return resultView(b,body)}
 const W=b.wd,tr=TRADITIONS[b.trad];const left=W.muhurat-W.time;
 let h='<div class="card"><div class="meters"><div><div class="lab"><span>Bride\'s family</span><span>'+Math.round(W.b)+'</span></div><div class="bar"><i style="width:'+W.b+'%;background:var(--gold)"></i></div></div><div class="clock">'+fmtT(W.time)+'<small>'+tr.clockName+' '+fmtT(W.muhurat)+'</small></div><div><div class="lab"><span>Groom\'s family</span><span>'+Math.round(W.g)+'</span></div><div class="bar"><i style="width:'+W.g+'%;background:var(--rose)"></i></div></div></div>'+
 '<div class="phases">'+tr.phases.map((p,i)=>'<i class="'+(i<W.phase?'d':i===W.phase?'c':'')+'"></i>').join('')+'</div><div class="row xs"><span class="gold">'+(tr.phases[W.phase]||'Farewell')+'</span><span class="sp"></span><span class="'+(left<0&&W.phase<(tr.muhurat?3:2)?'bad':'mu')+'">'+(W.phase<(tr.muhurat?3:2)?(left>=0?left+' min to spare':-left+' min late'):'Ceremony done')+'</span></div></div>';
 if(W.cur){const e=W.cur;UI.scene&&(UI.scene._warn.vis=true);h+='<div class="card event"><h3>'+e.t+'</h3>'+e.ch.map((c,i)=>{const fx=[];if(c.c)fx.push('<span class="bad">−'+money(c.c)+'</span>');if(c.t>0)fx.push('<span class="warn">+'+c.t+' min</span>');if(c.t<0)fx.push('<span class="ok">'+c.t+' min</span>');return '<button class="opt" data-c="'+i+'"><div>'+c.l+'</div>'+(fx.length?'<div class="xs" style="margin-top:3px">'+fx.join(' · ')+'</div>':'')+'</button>'}).join('')+'</div>'}
 else{h+='<button class="btn pri full" id="fin">See how it went</button>'}
 if(W.log.length)h+='<div class="sec">The evening so far</div><div class="card">'+W.log.slice().reverse().map(l=>'<div class="log"><span class="'+(l.bad?'bad':'')+'">'+l.t+'</span></div>').join('')+'</div>';
 body.innerHTML=h;
 body.querySelectorAll('[data-c]').forEach(el=>el.onclick=()=>{const r=chooseEvent(b,+el.dataset.c);UI.scene&&(UI.scene._warn.vis=false);const d=(r.b+r.g);toast((d>0?'Families pleased':d<0?'Families unhappy':'Done')+(r.cost?' · −'+money(r.cost):''));save();renderWedding()});
 if($('#fin'))$('#fin').onclick=()=>{finishWedding(b,false);chime(b.result.avg>=70?880:330);renderWedding()};
}
function resultView(b,body){const r=b.result;const v=r.avg>=85?'A triumph':r.avg>=70?'A success':r.avg>=50?'A mixed affair':'A disaster';
 body.innerHTML='<div class="card hl" style="text-align:center"><div class="xs gold">The wedding is over</div><h1 style="margin:6px 0">'+v+'</h1><div class="big-num gold">'+Math.round(r.avg)+'</div><div class="xs mu">out of 100</div></div>'+
 '<div class="grid2"><div class="mini"><div class="l">Bride\'s family</div><div class="v">'+r.bs+'</div></div><div class="mini"><div class="l">Groom\'s family</div><div class="v">'+r.gs+'</div></div></div>'+
 '<div class="card" style="margin-top:12px"><div class="kv"><span>Fee</span><span>'+money(b.fee)+'</span>'+(r.tip?'<span>Gift of thanks</span><span class="ok">+'+money(r.tip)+'</span>':'')+(r.withheld?'<span>Payment withheld</span><span class="bad">−'+money(r.withheld)+'</span>':'')+'<span>Vendors</span><span>−'+money(r.vc)+'</span><span>Costs on the day</span><span>−'+money(r.ev)+'</span><span><b>Profit</b></span><span class="'+(r.profit>=0?'ok':'bad')+'"><b>'+money(r.profit)+'</b></span><span>Fame</span><span class="'+(r.rep>=0?'gold':'bad')+'">'+(r.rep>=0?'+':'')+r.rep+'</span></div></div>'+
 '<button class="btn pri full" id="done">Back to the house</button>';
 $('#done').onclick=()=>{UI.view=null;UI.tab='home';render()}}

// ---------------- Vendors ----------------
function vVend(m){let h='<p class="sm mu" style="margin-top:0">Vendors you hire often become friends of the house: up to 10% cheaper and more reliable.</p>';
 for(const s of SLOTS){h+='<div class="sec">'+s.name+'</div><div class="card">';VENDORS.filter(v=>v.slot===s.id).forEach(v=>{const rl=relLvl(v.id),locked=v.minFame&&fameTier()<v.minFame;
  h+='<div class="list-item"><span class="si" style="width:34px;height:34px;border-radius:10px;background:var(--p2);display:flex;align-items:center;justify-content:center;color:var(--gold)">'+svg(s.icon,18)+'</span><div style="flex:1;min-width:0"><div class="'+(locked?'dim':'')+'">'+v.name+'</div><div class="xs mu">'+(locked?'Unlocks at '+FAME[v.minFame].name:v.note)+'</div><div class="bar" style="margin-top:5px;height:4px"><i style="width:'+rl*10+'%;background:var(--gold)"></i></div></div><div style="text-align:right">'+stars(v.q)+'<div class="xs dim">Hired '+(S.vuse[v.id]||0)+'×</div></div></div>'});h+='</div>'}
 m.innerHTML=h}

// ---------------- House ----------------
function vHouse(m){const hd=S.head;let h='<div class="card hl"><div class="row">'+portrait(hd.name,hd.female,64)+'<div><div class="xs gold">Head of the house · Generation '+hd.gen+'</div><div style="font-family:var(--serif);font-size:22px">'+hd.name+'</div><div class="sm mu">Age '+hd.age+' · '+TRAITS[hd.trait].name+'</div><div class="xs dim">'+TRAITS[hd.trait].desc+'</div></div></div></div>';
 h+='<div class="sec">Wedding managers<small>'+S.staff.length+'</small></div><div class="card">'+(S.staff.length?S.staff.map(s=>'<div class="list-item"><div class="av">'+portrait(s.name,/Bibi|Kanwar/.test(s.name))+'</div><div style="flex:1"><div>'+s.name+'</div><div class="xs mu">'+money(s.wage)+' a month</div></div>'+stars(s.skill)+'<button class="btn sm ghost" data-a="fire:'+s.id+'">Let go</button></div>').join(''):'<p class="sm mu" style="margin:0">Managers add a booking slot and can run weddings for you.</p>')+'<button class="btn full" style="margin-top:10px" data-a="hire">Hire a manager</button></div>';
 h+='<div class="sec">Charity</div><div class="card row"><div style="flex:1"><div>Sponsor weddings for poor couples</div><div class="xs mu">₹2,500, once a year. Earns fame and blessings.</div></div><button class="btn sm" data-a="charity">Sponsor</button></div>';h+='<div class="sec">Improve the house</div>';UPGRADES.forEach(u=>{const own=S.upgrades[u.id];h+='<div class="card row"><div style="flex:1"><div>'+u.name+'</div><div class="xs mu">'+u.desc+'</div></div>'+(own?'<span class="tag o">Owned</span>':'<button class="btn sm '+(S.money>=u.cost?'pri':'')+'" data-a="up:'+u.id+'">'+money(u.cost)+'</button>')+'</div>'});
 if(S.debt)h+='<div class="sec">Moneylender</div><div class="card row"><div style="flex:1"><div class="bad">'+money(S.debt)+' owed</div><div class="xs mu">3% interest every month. The house falls if debt passes ₹6,000.</div></div><button class="btn sm" data-a="repay">Repay ₹500</button></div>';
 if(S.heads.length){h+='<div class="sec">Past heads of the house</div><div class="card">'+S.heads.map(p=>'<div class="list-item"><div class="av">'+portrait(p.name,false)+'</div><div><div>'+p.name+'</div><div class="xs mu">Generation '+p.gen+' · led until '+p.until+' · '+TRAITS[p.trait].name+'</div></div></div>').join('')+'</div>'}
 m.innerHTML=h}
function hireSheet(){const C=staffCandidates();sheet('<h2>Hire a wedding manager</h2><p class="sm mu">Each manager adds one booking slot and can plan and run weddings for you.</p>'+C.map((c,i)=>'<button class="opt" data-s="'+i+'"><div class="row">'+portrait(c.name,/Bibi|Kanwar/.test(c.name),40)+'<div style="flex:1"><div class="t">'+c.name+'</div><div class="xs mu">Hiring gift '+money(c.hire)+' · '+money(c.wage)+' a month</div></div>'+stars(c.skill)+'</div></button>').join(''),i=>{const err=hire(C[+i]);if(err)toast(err);else{toast('Hired '+C[+i].name);closeSheet();render()}})}

// ---------------- Chronicle ----------------
function vChron(m){let h='';if(S.stats.best){const b=S.stats.best;h+='<div class="card hl"><div class="xs gold">Most celebrated wedding</div><div style="font-family:var(--serif);font-size:20px">'+b.name+'</div><div class="xs mu">'+dateStr(b.i)+' · '+TRADITIONS[b.trad].name+' · '+b.guests+' guests · score '+Math.round(b.avg)+'</div></div>'}
 h+='<div class="grid2"><div class="mini"><div class="l">Total profit</div><div class="v">'+money(S.stats.earned)+'</div></div><div class="mini"><div class="l">Stood firm against greedy demands</div><div class="v">'+(S.stats.honour||0)+'</div></div></div>';
 h+='<div class="sec">Weddings</div><div class="card">'+(S.chron.length?S.chron.slice(0,60).map(c=>'<div class="log"><b>'+MS[miM(c.i)]+' '+miY(c.i)+'</b><span style="flex:1">'+c.name+(c.auto?' <span class="dim">(manager)</span>':'')+'</span><span class="'+(c.avg>=70?'ok':c.avg>=50?'warn':'bad')+'">'+Math.round(c.avg)+'</span></div>').join(''):'<p class="sm mu" style="margin:0">Your first wedding will be written here.</p>')+'</div>';
 h+='<div class="sec">History of the house</div><div class="card">'+S.log.slice(0,80).map(l=>'<div class="log"><b>'+MS[miM(l.i)]+' '+miY(l.i)+'</b><span>'+l.t+'</span></div>').join('')+'</div>';
 m.innerHTML=h}

window.addEventListener('resize',()=>{if(UI.scene&&document.body.contains(UI.scene.cv))UI.scene.resize()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)save()});
window.addEventListener('load',splash);
