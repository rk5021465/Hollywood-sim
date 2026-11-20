/* ===================== v18 — Stage 2: deco portraits, live opening weekend, week chart, film flow ===================== */

/* ---------- Deco portraits: illustrated image when we have one, gold monogram otherwise ---------- */
const PIMG=[
 {src:'media/p_f01.png',bg:'#186751',n:'Vivienne Hale',g:'F',a:[22,48],s:[0,2],nat:['USA','UK','Ireland','Canada']},
 {src:'media/p/f001.jpg',bg:'#1f3f78',n:'Imani Whitfield',g:'F',a:[22,42],s:[4,5],nat:['USA','Nigeria','South Africa','UK']},
 {src:'media/p/f002.jpg',bg:'#065341',n:'Claire Whitmore',g:'F',a:[22,45],s:[0,1],nat:['USA','UK','Sweden','Canada','Australia']},
 {src:'media/p/f003.jpg',bg:'#731631',n:'Mei Shen',g:'F',a:[20,40],s:[0,2],nat:['China','South Korea','Japan']},
 {src:'media/p/f004.jpg',bg:'#066173',n:'Ananya Iyer',g:'F',a:[22,42],s:[2,4],nat:['India']},
 {src:'media/p/f005.jpg',bg:'#36533d',n:'Loretta Haynes',g:'F',a:[58,90],s:[3,5],nat:['USA','Nigeria','South Africa','UK']},
 {src:'media/p/f006.jpg',bg:'#c7871b',n:'Coretta Ellison',g:'F',a:[33,56],s:[4,5],nat:['USA','Nigeria','South Africa','UK']},
 {src:'media/p/f007.jpg',bg:'#c07f79',n:'Paloma Castañeda',g:'F',a:[28,52],s:[1,3],nat:['Mexico','Spain','Italy','Argentina','Brazil','France']},
 {src:'media/p/f008.jpg',bg:'#706933',n:'Dionne Merriweather',g:'F',a:[48,66],s:[3,5],nat:['USA','India','Brazil','South Africa']},
 {src:'media/p/f009.jpg',bg:'#582254',n:'Audrey Lockwood',g:'F',a:[20,38],s:[0,2],nat:['USA','UK','France','Germany','Italy','Canada']}];
const JEWEL=[['#0b2e26','#1d6b55'],['#2e0b14','#7a2335'],['#0b1a33','#1f4f86'],['#2e2108','#8a6420'],['#200e2c','#5e2d7a'],['#08282c','#1d7480'],['#2e140a','#8a4220'],['#14142a','#3a3a6e']];
function pHue(p){return JEWEL[hashStr(p.id||p.n||'x')%JEWEL.length]}
function isFem(p){try{return p.g==='F'||lookOf(p).g==='F'}catch(e){return p.g==='F'}}
function initials(n){const w=String(n||'?').replace(/[^A-Za-z\s'-]/g,'').trim().split(/\s+/).filter(Boolean);return ((w[0]||'?')[0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase()}
function assignPImgs(){if(!S||!S.people)return;S.pimg=S.pimg||{};const used=new Set(Object.values(S.pimg));const pools=['actors','directors','writers','dps','comps'].map(k=>S.people[k]||[]);
 PIMG.forEach((im,i)=>{if(used.has(i))return;const pool=(im.role?(S.people[im.role]||[]):S.people.actors||[]).filter(a=>S.pimg[a.id]==null&&isFem(a)===(im.g==='F')&&(a.age||35)>=im.a[0]&&(a.age||35)<=im.a[1]);
  const sk=a=>{try{return lookOf(a).skin}catch(e){return 2}};const score=a=>(sk(a)>=im.s[0]&&sk(a)<=im.s[1]?100:0)+((im.nat||[]).includes(a.nat)?60:0)+(a.star||a.fame||0)*.5;
  const best=pool.sort((x,y)=>score(y)-score(x))[0];if(best&&score(best)>=100){S.pimg[best.id]=i;used.add(i);try{const fresh=typeof credits!=='function'||!credits(best.id).length;if(fresh&&im.n&&!takenNames().has?.(im.n)){best.n=im.n;if(im.nat&&!im.nat.includes(best.nat))best.nat=im.nat[0]}}catch(e){}}})}
function pImg(p){if(!S||!S.pimg||!p||S.pimg[p.id]==null)return null;return PIMG[S.pimg[p.id]]||null}
const DECO_RAYS=(()=>{let s='';for(let i=0;i<16;i++){const a=i/16*Math.PI*2,b=(i+.45)/16*Math.PI*2;s+=`<polygon points="50,62 ${(50+Math.cos(a)*90).toFixed(1)},${(62+Math.sin(a)*90).toFixed(1)} ${(50+Math.cos(b)*90).toFixed(1)},${(62+Math.sin(b)*90).toFixed(1)}"/>`}return s})();
portrait=(function(old){return function(p,size,opt){opt=opt||{};const s=size||64;if(!p)return old(p,size,opt);
 const [c1,c2]=pHue(p);const u='dp'+(hashStr(String(p.id||p.n)+s)%9999999);const rad=opt.square?'12px':'50%';const im=pImg(p);const ring=`<circle cx="50" cy="50" r="48.5" fill="none" stroke="url(#${u}g)" stroke-width="${s<50?3:2}"/>`;
 const defs=`<defs><radialGradient id="${u}b" cx="50%" cy="34%" r="78%"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></radialGradient><linearGradient id="${u}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4cf"/><stop offset=".5" stop-color="#e2bb66"/><stop offset="1" stop-color="#9c7228"/></linearGradient></defs>`;
 if(im)return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" style="display:block;border-radius:${rad};overflow:hidden;background:${c1}">${defs}<image href="${im.src}" x="0" y="-4" width="100" height="125" preserveAspectRatio="xMidYMin slice"/>${opt.square?'':ring}</svg>`;
 const ini=initials(p.n);const two=ini.length>1;
 return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" style="display:block;border-radius:${rad};overflow:hidden">${defs}<rect width="100" height="100" fill="url(#${u}b)"/><g fill="#f3d98b" opacity=".09">${DECO_RAYS}</g>
 <circle cx="50" cy="50" r="38" fill="none" stroke="#e9c97a" stroke-opacity=".5" stroke-width=".8"/>${s>=48?`<path d="M30 70 H70" stroke="#e9c97a" stroke-opacity=".55" stroke-width=".8"/><path d="M50 74 l2 3 -2 3 -2 -3z" fill="#e9c97a" opacity=".8"/>`:''}
 <text x="50" y="${two?61:63}" text-anchor="middle" font-family="'Playfair Display',Didot,Georgia,serif" font-style="italic" font-weight="700" font-size="${two?33:40}" fill="url(#${u}g)" letter-spacing="-1">${ini}</text>${opt.square?'':ring}</svg>`}})(portrait);

/* ---------- Star card (arch frame) for the person detail view ---------- */
function starCard(p,role){if(!p)return '';let [c1,c2]=pHue(p);const im=pImg(p);if(im&&im.bg){c2=im.bg;c1=mixc(im.bg,'#000000',.62)}const isA=role==='actor'||(S.people.actors||[]).includes(p);
 const tier=isA&&typeof tierOfA==='function'?({A:'A · LIST',B:'STAR',M:'WORKING ACTOR',R:'RISING',C:"CRITICS' DARLING"}[tierOfA(p)]||''):(role||'').toUpperCase();
 const st=isA?[[p.star,'STAR'],[p.skill,'TALENT'],[M(actorFee(p)),'FEE']]:[[p.skill,'CRAFT'],[p.fame,'FAME'],[p.age||'—','AGE']];
 return `<div class="sc25" style="--c1:${c1};--c2:${c2}"><div class="sc25r"></div><div class="sc25a">${im?`<img src="${im.src}" alt="">`:`<div class="sc25m">${portrait(p,150,{square:1})}</div>`}</div>${tier?`<div class="sc25t">${tier}</div>`:''}
 <div class="sc25n">${esc(p.n)}</div><div class="sc25s">${esc([p.spec,p.age?p.age+' yrs':'',p.nat].filter(Boolean).join(' · '))}</div><div class="sc25d">✦</div>
 <div class="sc25st">${st.map(x=>`<div>${x[0]}<span>${x[1]}</span></div>`).join('')}</div></div>`}

/* ---------- Era-styled masthead for the review paper ---------- */
const PAPERS={e70:['THE HOLLYWOOD CHRONICLE','Special Elite'],e80:['SILVER SCREEN WEEKLY','Playfair Display'],e90:['THE MARQUEE TIMES','Playfair Display'],e00:['THE DAILY REEL','Playfair Display'],e10:['REEL WORLD DAILY','Playfair Display'],e20:['THE SCREEN LEDGER','Playfair Display'],e30:['THE FRONT ROW','Playfair Display']};
reviewStage=(function(o){return function(f){o(f);try{const e=eraOf(yearOf(f.releaseT));const pp=PAPERS[e.k]||PAPERS.e00;const h=document.querySelector('#app .paper h1');if(h){h.textContent=pp[0];h.style.fontFamily=`'${pp[1]}',Georgia,serif`}
 const sub=document.querySelector('#app .paper .center');if(sub)sub.innerHTML=`Est. ${e.y} · Reviews · ${tLabel(f.releaseT)} · ${S.year<1995?'15¢':S.year<2009?'50¢':'Digital edition'}`}catch(x){}}})(reviewStage);

/* ---------- Live opening weekend: a three-day race against the competition ---------- */
function openingRace(f){S.films.includes(f)||S.films.push(f);save();
 const wk=f.wkend||[f.opening*.4,f.opening*.35,f.opening*.25];const d0=relD(f);
 let rivals=[];try{rivals=weekendList().filter(x=>!(x.mine&&x.id===f.id)).slice(0,5).map(x=>({t:x.title,s:x.studio,g:x.wkG,mine:!!x.mine,k:x.k}))}catch(e){}
 if(rivals.length<4){const now=tNow();const used=new Set(rivals.map(r=>r.t));const extra=(S.rivalFilms||[]).filter(r=>!used.has(r.title)&&r.title!==f.title&&r.t<=now&&r.t>=now-3).sort((a,b)=>(b.hype||50)-(a.hype||50)).slice(0,4-rivals.length);
  extra.forEach((r,i)=>{const k=Math.max(1,now-r.t);rivals.push({t:r.title,s:r.studio,g:+(f.opening*R(.35,1.5)*Math.pow(.62,k-1)).toFixed(2),k})});
  const fill=['Midnight Express Line','The Long Goodbye Road','Harbor Lights','Silver Canyon','The Last Detail Man','Neon Alley'];const st=['Crown Pictures','Atlas Films','Meridian Studios','Lantern Bros.'];
  while(rivals.length<4){const i=rivals.length;rivals.push({t:(S.rivalFilms&&S.rivalFilms[i]&&S.rivalFilms[i].title)||fill[i],s:(S.rivalFilms&&S.rivalFilms[i]&&S.rivalFilms[i].studio)||st[i],g:+(f.opening*R(.25,1.3)).toFixed(2),k:RI(1,4)})}}
 const rows=[{t:f.title,s:S.name,g:f.opening,me:1,wk:wk,k:0}].concat(rivals.map(r=>{const split=r.k===0?[.4,.34,.26]:[.3,.4,.3];return {t:r.t,s:r.s,g:r.g,mine:r.mine,wk:split.map(x=>r.g*x),k:r.k}}));
 const era=eraOf(yearOf(f.releaseT));
 $('#app').innerHTML=`<div class="ow25" style="--e1:${era.c[0]};--e2:${era.c[1]}"><div class="ow25h"><div class="ow25l">★ OPENING WEEKEND ★</div><h2>${esc(f.title)}</h2><small>${fmtLong(d0)} · ${(f.screens||4).toLocaleString()} theaters</small></div>
 <div class="ow25d" id="owd">${['FRI','SAT','SUN'].map((d,i)=>`<div id="owd${i}"><b>${d}</b><span>${addDays(d0,i).getDate()} ${MON[addDays(d0,i).getMonth()]}</span><em id="owv${i}">—</em></div>`).join('')}</div>
 <div class="ow25b" id="owb" style="height:${rows.length*54}px">${rows.map((r,i)=>`<div class="ow25r ${r.me?'me':''}" id="owr${i}" style="transform:translateY(${i*54}px)"><i id="owk${i}">${i+1}</i><div><b>${esc(r.t)}</b><span>${esc((r.s||'').split(' ').slice(0,2).join(' '))}${r.k?` · wk ${r.k+1}`:r.me?'':' · new'}</span></div><strong id="owg${i}">$0</strong></div>`).join('')}</div>
 <div class="ow25f" id="owf"></div><button class="btn gold" id="owc" style="visibility:hidden" onclick="owNext(${f.id})">Continue →</button></div>`;
 window.scrollTo(0,0);try{musicTrack('premiere')}catch(e){}
 const tot=rows.map(()=>0);let day=0;
 const place=()=>{const ord=rows.map((r,i)=>i).sort((a,b)=>tot[b]-tot[a]);ord.forEach((ri,pos)=>{const el=document.getElementById('owr'+ri);if(el)el.style.transform=`translateY(${pos*54}px)`;const k=document.getElementById('owk'+ri);if(k)k.textContent=pos+1});return ord};
 const runDay=()=>{if(day>2)return finish();const dd=document.getElementById('owd'+day);if(dd)dd.classList.add('on');let n=0;const N=28;
  const tk=setInterval(()=>{n++;rows.forEach((r,i)=>{const v=tot[i]+r.wk[day]*Math.min(1,n/N);const g=document.getElementById('owg'+i);if(g)g.textContent=M(v)});const mv=document.getElementById('owv'+day);if(mv)mv.textContent=M(wk[day]*Math.min(1,n/N));
   if(n>=N){clearInterval(tk);rows.forEach((r,i)=>tot[i]+=r.wk[day]);place();try{sfx('tick')}catch(e){}day++;setTimeout(runDay,650)}},40)};
 const finish=()=>{const ord=place();const rank=ord.indexOf(0)+1;f.owRank=rank;save();const big=rank===1;
  const fl=document.getElementById('owf');if(fl)fl.innerHTML=`<div class="ow25rank ${big?'gold':rank<=3?'ok':'bad'}"><small>${big?'NUMBER ONE':'WEEKEND RANK'}</small><b>#${rank}</b><span>${big?'at the box office':rank<=3?'a solid start':'lost in the crowd'}</span></div><div class="ow25tot"><small>Opening weekend</small><b>${M(f.opening)}</b></div>`;
  try{sfx(big||f.opening>20*I()?'cash':'flop')}catch(e){}if(big&&document.body){document.body.insertAdjacentHTML('beforeend',confetti(60));setTimeout(()=>{const c=document.querySelector('.confetti');if(c)c.remove()},4200)}
  const b=document.getElementById('owc');if(b)b.style.visibility='visible'};
 setTimeout(runDay,700)}
function owNext(id){const f=S.films.find(x=>x.id===id);if(!f)return render();try{musicTrack('hq')}catch(e){}const go=()=>reviewStage(f);if(typeof openCall==='function')openCall(f,go);else go()}

/* ---------- Week-by-week chart in the film report ---------- */
function weekChart(f){const so=boShown(f);const n=so.n||0;if(!f.weeks||n<1)return '';const ws=f.weeks.slice(0,Math.max(n,1));const all=f.weeks.slice(0,Math.min(f.weeks.length,12));const mx=Math.max(...all)||1;const W=300,H=120,bw=W/Math.max(all.length,6);
 return `<div class="card wc25"><div class="row"><small>Box office run</small><small>${so.done?'Final run':'Week '+n}</small></div><svg viewBox="0 0 ${W} ${H+18}" width="100%"><defs><linearGradient id="wc25g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc8e"/><stop offset="1" stop-color="#a87a26"/></linearGradient></defs>
 ${all.map((w,i)=>{const h=Math.max(2,w/mx*H);const shown=i<n;return `<rect x="${i*bw+3}" y="${H-h}" width="${bw-6}" height="${h}" rx="2" fill="${shown?'url(#wc25g)':'currentColor'}" opacity="${shown?1:.12}"/>${shown&&i<9?`<text x="${i*bw+bw/2}" y="${H+13}" text-anchor="middle" font-size="9" fill="currentColor" opacity=".6">W${i+1}</text>`:''}`}).join('')}</svg>
 <div class="row muted" style="font-size:12px"><span>Opening ${M(f.opening)}</span><span>${n>1?`Week ${n}: ${M(ws[n-1])} (${Math.round((ws[n-1]/ws[n-2]-1)*100)}%)`:'Legs depend on word of mouth'}</span></div></div>`}
filmReport=(function(o){return function(f,ctx){let h=o(f,ctx);try{if(f.dist!=='stream'&&f.dist!=='sell'){const c=weekChart(f);h=h.replace('<div class="card"><small>Week by week</small>',c+'<div class="card"><small>Week by week</small>')}}catch(e){}return h}})(filmReport);

/* ---------- Develop · Produce · Release ---------- */
function flowBar(stage){const st=[['Develop','Script, pitch, budget'],['Produce','Cast, shoot, post'],['Release','Marketing, opening']];return `<div class="fl25">${st.map((s,i)=>`<div class="${i<stage?'done':i===stage?'on':''}"><i>${i<stage?'✓':i+1}</i><b>${s[0]}</b><span>${s[1]}</span></div>`).join('<em></em>')}</div>`}
wiz=(function(o){return function(){o();try{const a=document.querySelector('#app');if(a&&!a.querySelector('.fl25')){const st=a.querySelector('.steps');const stage=W&&W.step>=1&&W.step<=4?1:0;if(st)st.insertAdjacentHTML('beforebegin',flowBar(stage))}}catch(e){}}})(wiz);
projectModal=(function(o){return function(id){o(id);try{const p=S.projects.find(x=>x.id===id);if(!p)return;const ph=phaseOf(p);const stage=ph==='ready'?2:1;const m=document.querySelector('#modal .modal>div')||document.querySelector('#modal .modal');if(m&&!m.querySelector('.fl25'))m.insertAdjacentHTML('afterbegin',flowBar(stage))}catch(e){}}})(projectModal);

/* ---------- assign portraits when talent exists ---------- */
render=(function(o){return function(){try{if(S&&S.people)assignPImgs()}catch(e){}return o()}})(render);

/* ---------- person view opens with the star card ---------- */
openPerson=(function(o){return function(id){o(id);try{const p=person(id);const h=document.querySelector('#modal .thero');if(p&&h&&!document.querySelector('#modal .sc25')){const role=roleOf(p);const isA=role==='actors';
 const ring=h.querySelector('.ring');if(ring)ring.remove();const h2=h.querySelector('h2');if(h2)h2.remove();h.insertAdjacentHTML('afterbegin',starCard(p,isA?'actor':ROLE_LBL[role].replace(/s$/,'')))}}catch(e){}}})(openPerson);
