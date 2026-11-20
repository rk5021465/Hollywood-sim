/* ===================== v13 — illustrated portraits, premium emblems, elegant pages ===================== */

/* ---------- colour helpers ---------- */
function tone(hex,a){return lshade(hex,a)}
function mixc(a,b,t){const p=x=>parseInt(x.slice(1),16);const A=p(a),B=p(b);const ch=(s)=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t);return '#'+[16,8,0].map(s=>ch(s).toString(16).padStart(2,'0')).join('')}

/* ---------- portraits: shaded, painterly, studio-lit ---------- */
portrait=function(p,size,opt){opt=opt||{};const s=size||64;
 if(!p)return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" style="display:block;border-radius:50%;background:#2a2630"><circle cx="50" cy="42" r="16" fill="#4a4452"/><path d="M14 100c2-22 18-32 36-32s34 10 36 32z" fill="#4a4452"/></svg>`;
 const L=lookOf(p);const F=p.g==='F'||L.g==='F';const age=p.age||35;const sk=SKINS[L.skin]||'#e0a878';
 let hc=HAIRC[L.hairC]||'#3b2416';if(age>62)hc='#d8d3cc';else if(age>52&&L.hairC<6)hc=mixc(hc,'#bdb8b0',.45);
 const cl=CLOTH[L.cloth]||'#2d3a5c',ec=EYEC[L.eye]||'#3a2618',bgc=PBG[L.bg]||'#3b4a6b';
 const u='q'+(hashStr((p.id||p.n)+'|'+s+(opt.sad?'s':''))%999999);const W=[18,19,17.2][L.face]||18,J=F?.92:1;
 const r=srng((p.id||p.n)+'pv');const dark=L.skin>=4;
 const face=`M${50-W} 44 C${50-W} 27 ${50-W*.55} 19 50 19 C${50+W*.55} 19 ${50+W} 27 ${50+W} 44 C${50+W} 56 ${50+W*.72*J} 65.5 ${50+W*.36*J} 70.5 C${50+W*.16} 72.6 ${50-W*.16} 72.6 ${50-W*.36*J} 70.5 C${50-W*.72*J} 65.5 ${50-W} 56 ${50-W} 44Z`;
 const defs=`<defs>
  <radialGradient id="${u}bg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="${tone(bgc,.32)}"/><stop offset=".6" stop-color="${bgc}"/><stop offset="1" stop-color="${tone(bgc,-.45)}"/></radialGradient>
  <radialGradient id="${u}sk" cx=".4" cy=".36" r=".72"><stop offset="0" stop-color="${tone(sk,.16)}"/><stop offset=".55" stop-color="${sk}"/><stop offset="1" stop-color="${tone(sk,-.2)}"/></radialGradient>
  <linearGradient id="${u}nk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tone(sk,-.32)}"/><stop offset=".6" stop-color="${tone(sk,-.1)}"/></linearGradient>
  <linearGradient id="${u}hr" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${tone(hc,.22)}"/><stop offset=".45" stop-color="${hc}"/><stop offset="1" stop-color="${tone(hc,-.35)}"/></linearGradient>
  <linearGradient id="${u}cl" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${tone(cl,.22)}"/><stop offset=".55" stop-color="${cl}"/><stop offset="1" stop-color="${tone(cl,-.4)}"/></linearGradient>
  <radialGradient id="${u}ir" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="${tone(ec,.45)}"/><stop offset="1" stop-color="${tone(ec,-.3)}"/></radialGradient>
  <linearGradient id="${u}lp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${F||L.lips?'#c25a63':tone(sk,-.3)}"/><stop offset="1" stop-color="${F||L.lips?'#8e3a44':tone(sk,-.42)}"/></linearGradient>
  <clipPath id="${u}el"><path d="M37.2 46.2 Q42 42.4 46.8 46 Q42 49 37.2 46.2Z"/></clipPath><clipPath id="${u}er"><path d="M53.2 46 Q58 42.4 62.8 46.2 Q58 49 53.2 46Z"/></clipPath>
  <clipPath id="${u}fc"><path d="${face}"/></clipPath></defs>`;
 // background + bokeh
 const bg=opt.bg==='transparent'?'':`<rect width="100" height="100" fill="url(#${u}bg)"/>${[0,1,2,3].map(i=>`<circle cx="${(8+r()*84).toFixed(1)}" cy="${(6+r()*40).toFixed(1)}" r="${(3+r()*7).toFixed(1)}" fill="#fff" opacity="${(.04+r()*.07).toFixed(2)}"/>`).join('')}<path d="M0 0H100V100" fill="none"/>`;
 // hair (back)
 const H=L.hair;let hb='';
 if(F){if(H==='long'||H==='wavy')hb=`<path d="M27.5 46 C25 22 36 13 50 13 C64 13 75 22 72.5 46 C74 62 77 76 79 88 C66 95 34 95 21 88 C23 76 26 62 27.5 46Z" fill="url(#${u}hr)"/>`;
  else if(H==='bob')hb=`<path d="M28 44 C26 21 37 14 50 14 C63 14 74 21 72 44 C73 54 74.5 62 74 68 C62 72 38 72 26 68 C25.5 62 27 54 28 44Z" fill="url(#${u}hr)"/>`;
  else if(H==='pony')hb=`<path d="M64 26 C84 30 86 52 80 74 C77 60 72 50 66 42Z" fill="url(#${u}hr)"/>`;
  else if(H==='curly')hb=`<g fill="url(#${u}hr)">${[[29,30,11],[38,19,11],[50,15,12],[62,19,11],[71,30,11],[74,45,11],[26,45,11],[25,60,10],[75,60,10],[28,73,9],[72,73,9]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join('')}</g>`;
  else if(H==='bun')hb=`<circle cx="50" cy="13" r="9" fill="url(#${u}hr)"/>`}
 else if(H==='long')hb=`<path d="M29 44 C27 21 37 15 50 15 C63 15 73 21 71 44 C72 54 73 62 72.5 68 C61 72 39 72 27.5 68 C27 62 28 54 29 44Z" fill="url(#${u}hr)"/>`;
 // clothes
 const sh=`M6 100 C8 84 22 77.5 39 75.5 L61 75.5 C78 77.5 92 84 94 100Z`;let ct=`<path d="${sh}" fill="url(#${u}cl)"/><path d="M14 92 C20 84 30 80 38 78" stroke="#fff" stroke-opacity=".12" stroke-width="2" fill="none"/>`;
 const st=L.style;
 if(st==='tee')ct+=`<path d="M41 75.6 Q50 83 59 75.6" stroke="${tone(cl,-.35)}" stroke-width="2.4" fill="none"/>`;
 if(st==='collar')ct+=`<path d="M40.5 75.5 L50 88 L59.5 75.5" fill="${tone(sk,-.12)}"/><path d="M39 75 L44 86 L50 79Z M61 75 L56 86 L50 79Z" fill="${tone(cl,.3)}" stroke="${tone(cl,-.3)}" stroke-width=".6"/><path d="M50 88 V100" stroke="${tone(cl,-.35)}" stroke-width=".8"/><circle cx="50" cy="92" r=".9" fill="${tone(cl,-.4)}"/><circle cx="50" cy="97" r=".9" fill="${tone(cl,-.4)}"/>`;
 if(st==='suit'){const tie=['#7a1f2b','#1f3a5f','#b8862b','#2a2a30'][Math.floor(r()*4)];ct+=`<path d="M40 75.5 L50 97 L60 75.5Z" fill="#f4f1ea"/><path d="M48 80 L52 80 L53.2 94 L50 98 L46.8 94Z" fill="${tie}"/><path d="M48 80 L52 80 L51 83 L49 83Z" fill="${tone(tie,-.3)}"/><path d="M38.5 75.5 L50 100 L28 100 C26 92 25 86 26 80Z M61.5 75.5 L50 100 L72 100 C74 92 75 86 74 80Z" fill="${tone(cl,-.18)}"/><path d="M38.5 75.5 L44 88 L36 84Z M61.5 75.5 L56 88 L64 84Z" fill="${tone(cl,-.38)}"/>`}
 if(st==='turtle')ct+=`<path d="M40 64 C40 62 60 62 60 64 L61 78 C56 80.5 44 80.5 39 78Z" fill="url(#${u}cl)"/>${[66,69,72,75].map(y=>`<path d="M40.4 ${y} Q50 ${y+1.6} 59.6 ${y}" stroke="${tone(cl,-.3)}" stroke-width=".7" fill="none"/>`).join('')}`;
 // neck + ears
 const neck=st==='turtle'?'':`<path d="M43.5 62 L56.5 62 L57.5 77 Q50 81 42.5 77Z" fill="url(#${u}nk)"/>`;
 const ears=`<g fill="${tone(sk,-.06)}"><ellipse cx="${50-W+.4}" cy="47" rx="3.4" ry="5.6"/><ellipse cx="${50+W-.4}" cy="47" rx="3.4" ry="5.6"/></g><g fill="none" stroke="${tone(sk,-.3)}" stroke-width=".8" opacity=".6"><path d="M${50-W-1} 44 Q${50-W+.8} 47 ${50-W-.4} 50.5"/><path d="M${50+W+1} 44 Q${50+W-.8} 47 ${50+W+.4} 50.5"/></g>`;
 // face shading
 const shade2=`<g clip-path="url(#${u}fc)"><path d="M${50+W*.55} 22 C${50+W*1.1} 36 ${50+W*1.05} 58 ${50+W*.25} 74 L${50+W+4} 74 L${50+W+4} 20Z" fill="${tone(sk,-.3)}" opacity=".28"/><ellipse cx="41" cy="55" rx="4.6" ry="3" fill="#e2706f" opacity="${F?.2:.1}"/><ellipse cx="59" cy="55" rx="4.6" ry="3" fill="#e2706f" opacity="${F?.2:.1}"/><path d="M${50-W*.6} 66 C46 72 54 72 ${50+W*.6} 66" stroke="${tone(sk,-.35)}" stroke-width="2" opacity=".12" fill="none"/>${dark?'':`<ellipse cx="44" cy="31" rx="7" ry="4" fill="#fff" opacity=".12"/>`}</g>`;
 // eyes
 const eye=(cx,cl2)=>`<g><path d="${cx<50?'M37.2 46.2 Q42 42.4 46.8 46 Q42 49 37.2 46.2Z':'M53.2 46 Q58 42.4 62.8 46.2 Q58 49 53.2 46Z'}" fill="#f6f1ea"/><g clip-path="url(#${u}${cl2})"><circle cx="${cx}" cy="46" r="2.55" fill="url(#${u}ir)"/><circle cx="${cx}" cy="46" r="1.15" fill="#120d0a"/><circle cx="${cx+.95}" cy="45.1" r=".72" fill="#fff"/><path d="M${cx-6} 43.8 Q${cx} 41.6 ${cx+6} 43.8 L${cx+6} 44.6 Q${cx} 43.4 ${cx-6} 44.6Z" fill="#000" opacity=".22"/></g><path d="${cx<50?'M37 46.1 Q42 42.1 47 45.8':'M53 45.8 Q58 42.1 63 46.1'}" stroke="#1b120e" stroke-width="${F?1.35:1.05}" fill="none" stroke-linecap="round"/>${F?`<path d="${cx<50?'M37.3 46 L35.6 44.8 M38.2 45.1 L36.9 43.6':'M62.7 46 L64.4 44.8 M61.8 45.1 L63.1 43.6'}" stroke="#1b120e" stroke-width=".8" stroke-linecap="round"/>`:''}<path d="${cx<50?'M38.4 47.6 Q42 49.4 45.8 47.4':'M54.2 47.4 Q58 49.4 61.6 47.6'}" stroke="${tone(sk,-.3)}" stroke-width=".5" fill="none" opacity=".7"/></g>`;
 const bw=F?1:1.45,bc=tone(hc,-.15);
 const brows=`<path d="M36 41.2 Q41 ${37.6-bw*.3} 46.6 ${39.6} Q41 ${39.1+bw*.2} 36.6 ${42.2}Z" fill="${bc}"/><path d="M64 41.2 Q59 ${37.6-bw*.3} 53.4 ${39.6} Q59 ${39.1+bw*.2} 63.4 ${42.2}Z" fill="${bc}"/>`;
 const nose=`<path d="M51.2 46.5 Q52.6 52 53.4 54.6" stroke="${tone(sk,-.22)}" stroke-width="1.1" fill="none" opacity=".55"/><path d="M47 55.4 Q50 57.4 53.2 55.4" stroke="${tone(sk,-.38)}" stroke-width="1.05" fill="none" stroke-linecap="round"/><ellipse cx="48.1" cy="55.2" rx="1.1" ry=".55" fill="${tone(sk,-.45)}" opacity=".55"/><ellipse cx="52" cy="55.2" rx="1.1" ry=".55" fill="${tone(sk,-.45)}" opacity=".55"/><path d="M49.3 47 Q48.9 51 49.2 53.5" stroke="#fff" stroke-width=".9" opacity=".18" fill="none"/>`;
 const my=61,sm=opt.sad?-1.2:1;
 const mouth=`<path d="M44.6 ${my} Q47.3 ${my-1.5} 50 ${my-.7} Q52.7 ${my-1.5} 55.4 ${my} Q50 ${my+.9*sm} 44.6 ${my}Z" fill="url(#${u}lp)"/><path d="M45 ${my+.2} Q50 ${my+3.7*sm+(sm<0?3:0)} 55 ${my+.2} Q50 ${my+1.2} 45 ${my+.2}Z" fill="url(#${u}lp)" opacity="${F||L.lips?1:.75}"/><path d="M44.4 ${my} Q50 ${my+1.4*sm} 55.6 ${my}" stroke="${tone(sk,-.55)}" stroke-width=".7" fill="none" stroke-linecap="round"/>${F||L.lips?`<ellipse cx="51.4" cy="${my+1.6}" rx="1.6" ry=".45" fill="#fff" opacity=".28"/>`:''}`;
 const lines=age>50?`<g stroke="${tone(sk,-.38)}" stroke-width=".7" fill="none" opacity="${age>62?.5:.32}"><path d="M44.5 56.5 Q42.6 59.6 43.6 63"/><path d="M55.5 56.5 Q57.4 59.6 56.4 63"/>${age>60?'<path d="M40 33.5 Q50 31.5 60 33.5"/><path d="M42 30.5 Q50 29 58 30.5"/>':''}<path d="M35.6 48.6 L34 49.6"/><path d="M64.4 48.6 L66 49.6"/></g>`:'';
 // front hair
 const fr={
  short:`M30.6 45 C29 25 38 16.5 50 16.5 C62.5 16.5 71 25 69.4 45 C68 35 64 29.5 57 28.5 C51 30.5 43 29.5 37 32.5 C33.6 35.5 31.6 39.5 30.6 45Z`,
  side:`M30.4 46 C28.5 24 40 14.5 54 15.5 C66.5 16.5 71.6 27 69.6 45 C68.4 33 64 27 57.5 25.8 C49 27 41 31.5 35.6 37 C32.8 40 31.4 43 30.4 46Z`,
  buzz:`M31.6 41 C31.4 24.5 40 18.6 50 18.6 C60 18.6 68.6 24.5 68.4 41 C66.6 31.5 60.5 27.4 50 27.4 C39.5 27.4 33.4 31.5 31.6 41Z`,
  swept:`M30.4 44 C27.5 21 40 10.5 57 12.5 C70.5 14.5 74 26 69.6 42 C67 28.5 58.5 23 48 24.6 C40 26.5 34 33 30.4 44Z`,
  long:`M30.4 45 C29.6 24 38.5 16.5 50 16.5 C61.5 16.5 70.4 24 69.6 45 C66 32 60 26.5 50 26.6 C40 26.5 34 32 30.4 45Z`,
  bob:`M29.4 46 C29 22 38 15 50 15 C62 15 71 22 70.6 46 C68 31 60 25.8 47 27 C38.5 29 32.6 35.5 29.4 46Z`,
  bun:`M30.6 43 C30.4 24 39 17.6 50 17.6 C61 17.6 69.6 24 69.4 43 C65.6 30.5 59 27 50 27 C41 27 34.4 30.5 30.6 43Z`,
  pony:`M30.6 43 C30.4 23.5 39 16.6 50 16.6 C61 16.6 69.6 23.5 69.4 43 C65.4 30 59 26.6 50 26.8 C41 26.6 34.6 30 30.6 43Z`,
  pixie:`M30 45 C27.6 22 38.5 14.6 52 15.4 C66 16.4 72.6 26 69.6 41.5 C63 27.5 52 25.5 43 31 C37 34.5 32.6 39 30 45Z`,
  wavy:`M29.6 46 C28 23 38 14.6 50 14.6 C62 14.6 72 23 70.4 46 C68 34 64.4 29 58.6 27.4 C54.5 33 49 34 44.6 28.6 C38 31 32.8 36.5 29.6 46Z`}[H];
 let hf='';if(H==='curly')hf=`<g fill="url(#${u}hr)">${[[33,29,7.6],[41.5,22,7.8],[50.5,19.6,8],[59.5,21.8,7.8],[67,28.6,7.4],[30.6,37.5,6],[69.4,38,6]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}"/>`).join('')}</g><g fill="#fff" opacity=".12">${[[40,19],[52,16.5],[62,19.5]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="2.4"/>`).join('')}</g>`;
 else if(H==='bald')hf=`<path d="M30 47 C29.6 40 31 36.5 33 35 L33.4 48Z M70 47 C70.4 40 69 36.5 67 35 L66.6 48Z" fill="url(#${u}hr)"/><ellipse cx="45" cy="25" rx="7" ry="3.2" fill="#fff" opacity=".2"/>`;
 else if(fr)hf=`<path d="${fr}" fill="url(#${u}hr)"/><g stroke="${tone(hc,.38)}" stroke-width=".9" fill="none" opacity="${H==='buzz'?.15:.38}" stroke-linecap="round"><path d="M38 22 Q46 18 56 19.5"/><path d="M36 26 Q44 21.5 52 22.4"/><path d="M58 21 Q64 23.5 66.5 29"/></g>`;
 // facial hair
 let bd='';const bt=`url(#${u}hr)`;
 if(L.beard==='stubble')bd=`<path d="M${50-W+1.5} 50 C${50-W+2} 63 42 71.5 50 72 C58 71.5 ${50+W-2} 63 ${50+W-1.5} 50 C${50+W-4} 62 58 65.5 50 65.8 C42 65.5 ${50-W+4} 62 ${50-W+1.5} 50Z M43.6 59.2 Q50 56.4 56.4 59.2 Q50 58.4 43.6 59.2Z" fill="${hc}" opacity=".28"/>`;
 if(L.beard==='full')bd=`<path d="M${50-W+.6} 47 C${50-W+1} 66 41 76.5 50 77 C59 76.5 ${50+W-1} 66 ${50+W-.6} 47 C${50+W-3} 60 58.5 64.5 55.5 63.5 C52 62 48 62 44.5 63.5 C41.5 64.5 ${50-W+3} 60 ${50-W+.6} 47Z M43 59.4 Q50 55.6 57 59.4 Q54 61 50 60 Q46 61 43 59.4Z" fill="${bt}"/>`;
 if(L.beard==='mus')bd=`<path d="M42.6 59.6 Q50 55.6 57.4 59.6 Q54.5 61.6 50 60.2 Q45.5 61.6 42.6 59.6Z" fill="${bt}"/>`;
 if(L.beard==='goatee')bd=`<path d="M43.6 59.5 Q50 56.3 56.4 59.5 L55.6 61 Q50 59 44.4 61Z M45.4 65.6 Q50 75 54.6 65.6 Q50 68.4 45.4 65.6Z" fill="${bt}"/>`;
 const gl=L.glasses?`<g><circle cx="42" cy="46" r="6.2" fill="#bfe2ff" fill-opacity=".12" stroke="#15110e" stroke-width="1.3"/><circle cx="58" cy="46" r="6.2" fill="#bfe2ff" fill-opacity=".12" stroke="#15110e" stroke-width="1.3"/><path d="M48.2 45.6 Q50 44.4 51.8 45.6 M35.8 45.5 L${50-W} 44.5 M64.2 45.5 L${50+W} 44.5" stroke="#15110e" stroke-width="1.1" fill="none"/><path d="M38.5 43 L41.5 41.6" stroke="#fff" stroke-width="1" opacity=".55"/><path d="M54.5 43 L57.5 41.6" stroke="#fff" stroke-width="1" opacity=".55"/></g>`:'';
 const rim=opt.bg==='transparent'?'':`<path d="${face}" fill="none" stroke="#fff" stroke-width=".8" stroke-opacity=".14"/>`;
 return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" style="display:block;border-radius:${opt.square?'12px':'50%'};background:${opt.bg==='transparent'?'transparent':bgc};overflow:hidden">${defs}${bg}<g transform="translate(50 55) scale(${opt.bg==='transparent'?1:1.17}) translate(-50 -50)">${hb}${ct}${neck}${ears}<path d="${face}" fill="url(#${u}sk)"/>${shade2}${rim}${lines}${brows}${eye(42,'el')}${eye(58,'er')}${nose}${bd}${mouth}${hf}${gl}</g></svg>`};

/* ---------- premium studio emblem ---------- */
function crestSVG(L,s,withRing){L=L||{};const c1=L.c1&&L.c1!=='#F5F5F5'?L.c1:'#E8B84A';const ink=L.c2&&L.c2.length===7?L.c2:'#1F1A14';const u='c'+(hashStr(JSON.stringify(L)+s)%999999);
 const mono=esc(((L.icon||L.text||(S&&S.name)||'S').replace(/[^A-Za-z0-9&]/g,'')||'S').slice(0,2).toUpperCase());const fs=mono.length>1?30:40;
 const stars=[-50,-25,0,25,50].map(a=>{const rad=(a-90)*Math.PI/180,x=50+Math.cos(rad)*33,y=50+Math.sin(rad)*33;return `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${a===0?.32:.24})" d="M0-10 2.6-3.2 9.8-3.1 4-1.2 6.2 8.1 0 3.6-6.2 8.1-4-1.2-9.8-3.1-2.6-3.2Z" fill="url(#${u}m)"/>`}).join('');
 return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" aria-hidden="true"><defs>
 <linearGradient id="${u}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tone(c1,.7)}"/><stop offset=".35" stop-color="${tone(c1,.12)}"/><stop offset=".55" stop-color="${tone(c1,-.38)}"/><stop offset=".8" stop-color="${tone(c1,.35)}"/><stop offset="1" stop-color="${tone(c1,-.2)}"/></linearGradient>
 <radialGradient id="${u}d" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="${tone(ink,.22)}"/><stop offset="1" stop-color="${tone(ink,-.5)}"/></radialGradient>
 <linearGradient id="${u}b" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${tone(c1,.6)}" stop-opacity=".55"/><stop offset="1" stop-color="${tone(c1,.6)}" stop-opacity="0"/></linearGradient>
 <clipPath id="${u}k"><circle cx="50" cy="50" r="40"/></clipPath></defs>
 <circle cx="50" cy="50" r="48" fill="url(#${u}m)"/><circle cx="50" cy="50" r="44.5" fill="none" stroke="${tone(c1,-.5)}" stroke-width=".8" opacity=".6"/>
 ${Array.from({length:36},(_,i)=>{const a=i*10*Math.PI/180;return `<circle cx="${(50+Math.cos(a)*46.2).toFixed(1)}" cy="${(50+Math.sin(a)*46.2).toFixed(1)}" r=".75" fill="${tone(c1,-.45)}" opacity=".55"/>`}).join('')}
 <circle cx="50" cy="50" r="41" fill="url(#${u}d)"/>
 <g clip-path="url(#${u}k)"><path d="M30 96 L18 10 L28 9 L36 96Z" fill="url(#${u}b)"/><path d="M70 96 L82 10 L72 9 L64 96Z" fill="url(#${u}b)"/><path d="M10 80 Q50 66 90 80 L90 100 L10 100Z" fill="${tone(ink,-.6)}" opacity=".6"/></g>
 <circle cx="50" cy="50" r="40.4" fill="none" stroke="url(#${u}m)" stroke-width="1.2"/>
 ${stars}
 <text x="50" y="${mono.length>1?61:64}" text-anchor="middle" font-family="'Noto Serif',Georgia,'Times New Roman',serif" font-weight="700" font-size="${fs}" fill="url(#${u}m)" letter-spacing="${mono.length>1?-1:0}">${mono}</text>
 <path d="M30 70 Q50 76 70 70" stroke="url(#${u}m)" stroke-width="1" fill="none" opacity=".8"/></svg>`}
function crestWordmark(L,w){L=L||{};const c1=L.c1&&L.c1!=='#F5F5F5'?L.c1:'#E8B84A';const u='w'+(hashStr(JSON.stringify(L))%999999);const txt=esc((L.text||(S&&S.name)||'Studio').toUpperCase());const sub=L.sub&&L.sub!=='None'?esc(String(L.sub).toUpperCase()):'PICTURES';const fs=Math.min(40,420/Math.max(5,txt.length));
 return `<svg viewBox="0 0 320 110" width="${w}" height="${w*110/320}"><defs><linearGradient id="${u}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tone(c1,.55)}"/><stop offset=".5" stop-color="${tone(c1,.05)}"/><stop offset=".52" stop-color="${tone(c1,-.3)}"/><stop offset="1" stop-color="${tone(c1,.2)}"/></linearGradient></defs>
 <g transform="translate(4 5)">${crestSVG(L,100).replace(/^<svg[^>]*>/,'<svg x="0" y="0" width="100" height="100" viewBox="0 0 100 100">')}</g>
 <text x="118" y="${58}" font-family="'Noto Serif',Georgia,serif" font-weight="700" font-size="${fs}" fill="url(#${u}t)" letter-spacing="1.5">${txt}</text>
 <path d="M118 70 H${118+40}" stroke="${c1}" stroke-width="1"/><text x="${118+48}" y="74" font-family="Inter,Roboto,sans-serif" font-weight="700" font-size="10" letter-spacing="5" fill="${tone(c1,-.15)}">${sub}</text>
 <text x="118" y="94" font-family="Inter,Roboto,sans-serif" font-size="8" letter-spacing="3.5" fill="${tone(c1,-.25)}" opacity=".75">EST. ${L.year||START_YEAR} · HOLLYWOOD</text></svg>`}
const _lm13=logoMini;logoMini=function(L,s){return (!L||!L.emb)?crestSVG(L,s):_lm13(L,s)};
const _ls13=logoSVG;logoSVG=function(L,w){return (!L||!L.emb)?crestWordmark(L,w):_ls13(L,w)};

/* ---------- top bar: real emblem instead of a letter square ---------- */
render=(function(o){return function(){o();try{const t=document.querySelector('.tb-logo');if(t&&S&&!t.dataset.c){t.dataset.c=1;t.removeAttribute('style');t.classList.add('crest');t.innerHTML=logoMini(S.logo,46)}}catch(e){}}})(render);

/* ---------- cinematic title screen ---------- */
title=(function(o){return function(){o();try{const m=document.querySelector('#app .marquee');if(!m)return;m.classList.add('hero13');m.innerHTML=`<div class="h13beams"><i></i><i></i></div><div class="h13stars">★ ★ ★ ★ ★</div><div class="h13eyebrow">A STUDIO TYCOON</div><h1 class="h13title">Hollywood</h1><div class="h13sub">STUDIO&nbsp;SIMULATOR</div><div class="h13rule"><span></span>✦<span></span></div><p class="h13tag">Make movies. Build an empire. Win the Golden Statue.</p>`}catch(e){}}})(title);
