/* ===================== ART ENGINE (all original procedural SVG) ===================== */
function hashStr(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function srng(seed){let a=hashStr(seed);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SKINS=['#fde0c8','#f3c6a0','#e0a878','#c68650','#9a5f36','#6b3e22'];
const HAIRC=['#1c1410','#3b2416','#6a4126','#a8743f','#d9b56b','#8c2f1a','#f0e6d0','#2b2b34'];
const EYEC=['#3a2618','#2f5d8a','#3f6b3a','#6b4a2a','#222'];
const CLOTH=['#2d3a5c','#5c2d3a','#2d5c4a','#1f1f24','#6b4a8a','#8a5a2d','#3a4a5c','#7a1f2b','#d8d2c4'];
const HAIR_M=['short','side','curly','buzz','bald','swept','long'];
const HAIR_F=['long','bob','bun','curly','pony','pixie','wavy'];

/* Look for a person: deterministic from id unless customised */
function lookOf(p){
 if(p.look)return p.look;
 const r=srng(p.id||p.n);const F=p.g==='F';
 const L={skin:p.skinH!=null?p.skinH:Math.floor(r()*6),hairC:Math.floor(r()*6),eye:Math.floor(r()*5),cloth:Math.floor(r()*CLOTH.length),
  hair:F?HAIR_F[Math.floor(r()*HAIR_F.length)]:HAIR_M[Math.floor(r()*HAIR_M.length)],
  beard:!F&&r()<.4?['stubble','full','mus','goatee'][Math.floor(r()*4)]:'none',glasses:r()<.14,
  style:['tee','collar','suit','turtle'][Math.floor(r()*4)],face:Math.floor(r()*3),bg:Math.floor(r()*8),lips:F&&r()<.6};
 return L;
}
const PBG=['#3b4a6b','#5a3b5e','#3b5e55','#6b4f3b','#2f2f3f','#5e3b3b','#3b555e','#4a5e3b'];
function portrait(p,size,opt){
 opt=opt||{};if(!p){const z=size||64;return `<svg viewBox="0 0 100 100" width="${z}" height="${z}" style="display:block;border-radius:50%;background:#333">${silhouette('#555')}</svg>`}const L=lookOf(p);const F=p.g==='F'||L.g==='F';const sk=SKINS[L.skin];
 let hc=HAIRC[L.hairC];const age=p.age||35;if(age>58)hc='#cfcac4';else if(age>50&&L.hairC<6)hc=shade(hc,30);
 const cl=CLOTH[L.cloth];const s=size||64;const id='p'+hashStr(p.id||p.n)%99999;
 const rx=[19,20,21][L.face],ry=[23,24,22][L.face];
 let back='',front='',beard='',cloth='';
 // hair back layers
 if(F){if(L.hair==='long'||L.hair==='wavy')back=`<path d="M26 46 Q24 14 50 15 Q76 14 74 46 L78 86 Q50 94 22 86Z" fill="${hc}"/>`;
  else if(L.hair==='bob')back=`<path d="M26 44 Q25 15 50 15 Q75 15 74 44 L75 68 Q50 74 25 68Z" fill="${hc}"/>`;
  else if(L.hair==='pony')back=`<path d="M66 30 Q86 36 80 70 Q76 52 66 44Z" fill="${hc}"/>`;
  else if(L.hair==='curly')back=`<g fill="${hc}">${[[30,30],[40,20],[52,17],[64,21],[72,32],[74,46],[26,46],[28,60],[72,60]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="10"/>`).join('')}</g>`;}
 else if(L.hair==='long')back=`<path d="M28 44 Q27 16 50 16 Q73 16 72 44 L73 66 Q50 70 27 66Z" fill="${hc}"/>`;
 // front hair
 const fr={
  short:`<path d="M30 42 Q29 17 50 17 Q71 17 70 42 Q66 29 50 28 Q35 29 30 42Z"/>`,
  side:`<path d="M29 44 Q27 15 53 16 Q73 17 71 44 Q69 28 58 26 Q44 33 29 44Z"/>`,
  curly:`${[[33,28],[42,21],[52,19],[62,22],[68,30],[30,37],[70,38]].map(c=>`<circle cx="${c[0]}" cy="${c[1]}" r="8"/>`).join('')}`,
  buzz:`<path d="M30 40 Q30 19 50 19 Q70 19 70 40 Q66 30 50 30 Q34 30 30 40Z" opacity=".75"/>`,
  bald:`<path d="M29 46 Q29 38 32 36 L32 48Z M71 46 Q71 38 68 36 L68 48Z"/>`,
  swept:`<path d="M29 42 Q26 12 56 14 Q78 18 71 40 Q64 22 46 26 Q36 30 29 42Z"/>`,
  long:`<path d="M30 42 Q30 17 50 17 Q70 17 70 42 Q62 26 50 27 Q38 26 30 42Z"/>`,
  bob:`<path d="M29 44 Q30 16 50 16 Q70 16 71 44 Q66 26 46 28 Q36 32 29 44Z"/>`,
  bun:`<circle cx="50" cy="12" r="8"/><path d="M30 42 Q30 18 50 18 Q70 18 70 42 Q64 28 50 28 Q36 28 30 42Z"/>`,
  pony:`<path d="M30 42 Q30 17 50 17 Q70 17 70 42 Q64 27 50 28 Q36 27 30 42Z"/>`,
  pixie:`<path d="M30 44 Q27 15 52 16 Q74 18 70 40 Q60 24 40 32 Q34 36 30 44Z"/>`,
  wavy:`<path d="M30 44 Q28 16 50 16 Q72 16 70 44 Q66 30 58 28 Q50 36 42 28 Q34 32 30 44Z"/>`,
 }[L.hair]||'';
 front=`<g fill="${hc}">${fr}</g>`;
 if(L.beard==='stubble')beard=`<path d="M33 54 Q36 72 50 74 Q64 72 67 54 Q62 66 50 67 Q38 66 33 54Z" fill="${hc}" opacity=".35"/>`;
 if(L.beard==='full')beard=`<path d="M31 50 Q33 76 50 78 Q67 76 69 50 Q64 66 56 64 Q50 60 44 64 Q36 66 31 50Z" fill="${hc}"/>`;
 if(L.beard==='mus')beard=`<path d="M42 59 Q50 55 58 59 Q55 62 50 60 Q45 62 42 59Z" fill="${hc}"/>`;
 if(L.beard==='goatee')beard=`<path d="M43 59 Q50 56 57 59 L56 61 Q50 59 44 61Z M45 66 Q50 74 55 66 Q50 69 45 66Z" fill="${hc}"/>`;
 cloth=`<path d="M12 100 Q13 76 50 73 Q87 76 88 100Z" fill="${cl}"/>`;
 if(L.style==='collar')cloth+=`<path d="M40 74 L50 86 L60 74 L56 73 L50 80 L44 73Z" fill="#f2efe8"/>`;
 if(L.style==='suit')cloth+=`<path d="M38 74 L50 98 L62 74 L58 73 L50 84 L42 73Z" fill="#f2efe8"/><path d="M47 80 L53 80 L52 96 L48 96Z" fill="${shade(cl,-40)}"/><path d="M26 82 L44 76 L50 100 L30 100Z M74 82 L56 76 L50 100 L70 100Z" fill="${shade(cl,-25)}" opacity=".6"/>`;
 if(L.style==='turtle')cloth+=`<rect x="40" y="66" width="20" height="10" rx="4" fill="${shade(cl,-20)}"/>`;
 const eyeY=46,brow=age>55?'<path d="M37 53 Q40 55 43 53 M57 53 Q60 55 63 53" stroke="#0003" fill="none"/>':'';
 const ec=EYEC[L.eye];
 const svg=`<svg viewBox="0 0 100 100" width="${s}" height="${s}" style="display:block;border-radius:${opt.square?'10px':'50%'};background:${opt.bg||PBG[L.bg]}">
 ${back}${cloth}<rect x="43" y="60" width="14" height="16" fill="${shade(sk,-12)}"/>
 <ellipse cx="${50-rx}" cy="48" rx="4" ry="6" fill="${shade(sk,-8)}"/><ellipse cx="${50+rx}" cy="48" rx="4" ry="6" fill="${shade(sk,-8)}"/>
 <ellipse cx="50" cy="45" rx="${rx}" ry="${ry}" fill="${sk}"/>
 ${front}
 <path d="M37 ${eyeY-6} Q42 ${eyeY-9} 46 ${eyeY-6}" stroke="${shade(hc,-10)}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M54 ${eyeY-6} Q58 ${eyeY-9} 63 ${eyeY-6}" stroke="${shade(hc,-10)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
 <ellipse cx="42" cy="${eyeY}" rx="4" ry="2.8" fill="#fff"/><ellipse cx="58" cy="${eyeY}" rx="4" ry="2.8" fill="#fff"/>
 <circle cx="42" cy="${eyeY}" r="2" fill="${ec}"/><circle cx="58" cy="${eyeY}" r="2" fill="${ec}"/>
 ${F?`<path d="M37.5 ${eyeY-2} L36 ${eyeY-3.5} M62.5 ${eyeY-2} L64 ${eyeY-3.5}" stroke="#111" stroke-width="1"/>`:''}
 <path d="M50 47 Q48 54 50 55 Q52 55.5 53 54" stroke="${shade(sk,-30)}" stroke-width="1.4" fill="none"/>
 ${brow}
 <path d="M44 61 Q50 ${opt.sad?58:65} 56 61" stroke="${L.lips?'#b2454f':shade(sk,-45)}" stroke-width="${L.lips?2.6:1.8}" fill="none" stroke-linecap="round"/>
 ${beard}
 ${L.glasses?`<g stroke="#111" stroke-width="1.6" fill="#fff2"><circle cx="42" cy="${eyeY}" r="6"/><circle cx="58" cy="${eyeY}" r="6"/><path d="M48 ${eyeY} L52 ${eyeY}"/></g>`:''}
 </svg>`;
 return svg;
}
function shade(hex,amt){let c=hex.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');let n=parseInt(c,16);let r=(n>>16)+amt,g=(n>>8&255)+amt,b=(n&255)+amt;r=clamp(r,0,255);g=clamp(g,0,255);b=clamp(b,0,255);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
function silhouette(color){return `<path d="M50 20 a14 16 0 1 1 0.1 0 Z M22 100 Q22 64 50 60 Q78 64 78 100Z" fill="${color}"/>`}

/* ---------- Posters ---------- */
const P_FONTS={bebas:["'Bebas Neue',Impact,sans-serif",'Blockbuster',['Action','Thriller','Superhero']],
 play:["'Playfair Display',Georgia,serif",'Prestige serif',['Drama','Romance','Biopic']],
 creep:["'Creepster','Bebas Neue',fantasy",'Horror drip',['Horror']],
 orbit:["'Orbitron','Bebas Neue',sans-serif",'Sci-fi tech',['Sci-Fi','Action']],
 cinzel:["'Cinzel',Georgia,serif",'Epic engraved',['Biopic','Drama','Superhero']],
 bang:["'Bangers',Impact,sans-serif",'Comic blast',['Comedy','Animation','Superhero']],
 paci:["'Pacifico',cursive",'Romantic script',['Romance','Animation']],
 elite:["'Special Elite','Courier New',monospace",'Typewriter',['Thriller','Drama','Biopic']]};
const P_PALS={noir:['#0b0b10','#2a2a35','#e8e6e0','#c9c4b8'],gold:['#1a1206','#5a3e10','#ffd77a','#fff1c9'],blood:['#14040a','#5c0a14','#ff3b3b','#ffd9d9'],neon:['#0a0620','#3b0f6b','#ff3bd4','#7cf6ff'],
 ocean:['#04162b','#0f4c75','#7ed6ff','#e8f8ff'],sunset:['#2b0f3a','#e05d36','#ffd166','#fff4e0'],forest:['#08180f','#2d5a3a','#b8e986','#f0ffe0'],pastel:['#ffd6e8','#c3e7ff','#6b4a8a','#3a2a4a'],
 ice:['#0c1f33','#9ad4f5','#ffffff','#0c1f33'],toxic:['#0b1405','#3d6b10','#c6ff3b','#f0ffd0'],vintage:['#3b2a1a','#c9a26b','#f5e6c8','#2a1d10'],cyber:['#050510','#0b3d5c','#00ffd5','#ff2e88']};
const P_BGS=['gradient','city','mountains','stars','fire','rays','spotlight','rain','waves','forest','planet','smoke'];
const P_LAYOUTS={star:'Star portrait',duo:'Face-off',ensemble:'Ensemble',bigface:'Big face',silhouette:'Silhouette',minimal:'Minimal art'};
const P_ART=['none','moon','sun','skull','heart','explosion','castle','car','swords','rocket','house','crown'];
function posterBg(k,P,r,u){
 const [a,b,c]=P;let s=`<defs><linearGradient id="pg${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><radialGradient id="pr${u}"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><rect width="200" height="300" fill="url(#pg${u})"/>`;
 if(k==='city'){for(let i=0;i<14;i++){const w=10+r()*16,h=40+r()*90,x=i*15-5;s+=`<rect x="${x}" y="${300-h-40}" width="${w}" height="${h+40}" fill="${shade(a,8)}"/>`;for(let j=0;j<4;j++)if(r()<.6)s+=`<rect x="${x+3}" y="${300-h-30+j*14}" width="3" height="4" fill="${c}" opacity=".7"/>`}}
 if(k==='mountains')s+=`<path d="M0 230 L50 160 L90 210 L140 140 L200 220 L200 300 L0 300Z" fill="${shade(a,10)}"/><path d="M0 260 L60 205 L110 250 L160 200 L200 240 L200 300 L0 300Z" fill="${shade(a,20)}"/>`;
 if(k==='stars'){for(let i=0;i<60;i++)s+=`<circle cx="${r()*200}" cy="${r()*300}" r="${r()*1.4+.3}" fill="#fff" opacity="${r()*.8+.2}"/>`}
 if(k==='fire')s+=`<path d="M0 300 Q20 220 40 260 Q55 190 75 250 Q90 170 110 240 Q130 180 145 255 Q165 200 180 260 Q192 230 200 250 L200 300Z" fill="#ff7a1a" opacity=".85"/><path d="M0 300 Q30 250 50 275 Q70 230 95 270 Q120 225 140 275 Q170 240 200 280 L200 300Z" fill="#ffd23a"/>`;
 if(k==='rays'){for(let i=0;i<16;i++){const an=i/16*Math.PI*2;s+=`<path d="M100 150 L${100+Math.cos(an)*260} ${150+Math.sin(an)*260} L${100+Math.cos(an+.12)*260} ${150+Math.sin(an+.12)*260}Z" fill="${c}" opacity=".12"/>`}}
 if(k==='spotlight')s+=`<path d="M100 -10 L20 300 L180 300Z" fill="${c}" opacity=".18"/><ellipse cx="100" cy="280" rx="80" ry="14" fill="${c}" opacity=".25"/>`;
 if(k==='rain'){for(let i=0;i<70;i++){const x=r()*220,y=r()*300;s+=`<path d="M${x} ${y} l-6 16" stroke="${c}" stroke-opacity=".35" stroke-width="1"/>`}}
 if(k==='waves')s+=`<path d="M0 220 Q25 205 50 220 T100 220 T150 220 T200 220 V300 H0Z" fill="${shade(b,-10)}"/><path d="M0 245 Q25 230 50 245 T100 245 T150 245 T200 245 V300 H0Z" fill="${shade(b,-25)}"/>`;
 if(k==='forest'){for(let i=0;i<12;i++){const x=i*18-4,h=60+r()*60;s+=`<path d="M${x} 300 L${x+10} ${300-h} L${x+20} 300Z" fill="${shade(a,6+i%3*6)}"/>`}}
 if(k==='planet')s+=`<circle cx="140" cy="90" r="46" fill="${c}" opacity=".85"/><ellipse cx="140" cy="90" rx="74" ry="12" fill="none" stroke="${P[3]}" stroke-opacity=".6" stroke-width="3"/>`;
 if(k==='smoke'){for(let i=0;i<8;i++)s+=`<circle cx="${r()*200}" cy="${150+r()*150}" r="${30+r()*40}" fill="#fff" opacity=".05"/>`}
 s+=`<rect width="200" height="300" fill="url(#pr${u})" opacity=".5"/>`;return s;
}
function posterArt(k,c,x,y,sc){sc=sc||1;const t=`transform="translate(${x} ${y}) scale(${sc})"`;
 return {none:'',moon:`<g ${t}><circle r="22" fill="${c}"/><circle cx="9" cy="-6" r="20" fill="#0006"/></g>`,sun:`<g ${t}><circle r="20" fill="${c}"/></g>`,
 skull:`<g ${t} fill="${c}"><ellipse rx="18" ry="20"/><rect x="-10" y="12" width="20" height="12" rx="3"/><circle cx="-7" cy="-2" r="5" fill="#000"/><circle cx="7" cy="-2" r="5" fill="#000"/></g>`,
 heart:`<g ${t}><path d="M0 18 C-30 -4 -14 -26 0 -10 C14 -26 30 -4 0 18Z" fill="${c}"/></g>`,
 explosion:`<g ${t}><path d="M0 -30 L8 -10 L28 -16 L14 2 L30 16 L8 12 L4 32 L-6 12 L-28 20 L-14 2 L-30 -14 L-8 -10Z" fill="${c}"/></g>`,
 castle:`<g ${t} fill="${c}"><rect x="-22" y="-10" width="44" height="30"/><rect x="-28" y="-26" width="12" height="46"/><rect x="16" y="-26" width="12" height="46"/><path d="M-30 -26 L-22 -38 L-14 -26Z M14 -26 L22 -38 L30 -26Z"/></g>`,
 car:`<g ${t} fill="${c}"><path d="M-30 6 L-22 -8 L14 -8 L24 2 L32 4 L32 14 L-30 14Z"/><circle cx="-16" cy="14" r="6" fill="#111"/><circle cx="18" cy="14" r="6" fill="#111"/></g>`,
 swords:`<g ${t} stroke="${c}" stroke-width="4" stroke-linecap="round"><path d="M-24 -24 L24 24 M24 -24 L-24 24"/><path d="M-30 -14 L-14 -30 M14 -30 L30 -14" stroke-width="3"/></g>`,
 rocket:`<g ${t} fill="${c}"><path d="M0 -30 Q12 -12 10 14 L-10 14 Q-12 -12 0 -30Z"/><path d="M-10 6 L-18 20 L-10 16Z M10 6 L18 20 L10 16Z"/><path d="M-5 16 L0 30 L5 16Z" fill="#ff7a1a"/></g>`,
 house:`<g ${t} fill="${c}"><path d="M-22 -2 L0 -22 L22 -2 L22 22 L-22 22Z"/><rect x="-5" y="8" width="10" height="14" fill="#000"/><rect x="-16" y="0" width="7" height="7" fill="#ff0"/></g>`,
 crown:`<g ${t}><path d="M-24 10 L-24 -14 L-12 0 L0 -18 L12 0 L24 -14 L24 10Z" fill="${c}"/></g>`}[k]||'';}
function defaultPoster(f){const r=srng((f.title||'x')+'poster');const g=f.genre;
 const pal={Horror:'blood',Thriller:'noir','Sci-Fi':'cyber',Romance:'pastel',Comedy:'sunset',Animation:'sunset',Drama:'vintage',Biopic:'gold',Action:'sunset',Superhero:'neon'}[g]||'noir';
 const font=Object.keys(P_FONTS).find(k=>P_FONTS[k][2][0]===g)||Object.keys(P_FONTS).find(k=>P_FONTS[k][2].includes(g))||'bebas';
 const bg={Horror:'smoke',Thriller:'rain','Sci-Fi':'planet',Romance:'rays',Comedy:'rays',Animation:'stars',Drama:'spotlight',Biopic:'spotlight',Action:'fire',Superhero:'city'}[g]||'gradient';
 return {layout:g==='Animation'?'minimal':'star',bg,pal,font,tagline:'',art:{Horror:'moon',Romance:'heart',Action:'explosion','Sci-Fi':'rocket',Animation:'castle'}[g]||'none',titleY:200,titleSize:30,tier:0}}
function posterSVG(f,w,design){
 const d=design||f.poster||defaultPoster(f);const P=P_PALS[d.pal]||P_PALS.noir;const r=srng(f.title+d.bg);const u=hashStr(f.title+JSON.stringify(d))%999999;
 const font=(P_FONTS[d.font]||P_FONTS.bebas)[0];
 const cast=allCast(f.cast).map(person).filter(Boolean);
 let fig='';const emb=(p,x,y,sz)=>`<g transform="translate(${x} ${y}) scale(${sz/100})">${portrait(p,100,{bg:'transparent'}).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>`;
 if(d.layout==='star'&&cast[0])fig=emb(cast[0],35,40,130);
 if(d.layout==='bigface'&&cast[0])fig=emb(cast[0],-30,-10,260);
 if(d.layout==='duo'){if(cast[0])fig+=emb(cast[0],-5,50,120);if(cast[1])fig+=emb(cast[1],85,50,120)}
 if(d.layout==='ensemble'){cast.slice(0,4).forEach((p,i)=>{fig+=emb(p,[60,5,115,60][i],[30,80,80,100][i],[90,80,80,85][i])})}
 if(d.layout==='silhouette')fig=`<g transform="translate(25 40) scale(1.5)">${silhouette('#000c')}</g>`;
 const art=d.art&&d.art!=='none'?posterArt(d.art,P[2],d.layout==='minimal'?100:160,d.layout==='minimal'?120:48,d.layout==='minimal'?2.2:1):'';
 const t=(f.title||'UNTITLED').toUpperCase();const words=t.split(' ');let lines=[t];if(t.length>14){const mid=Math.ceil(words.length/2);lines=[words.slice(0,mid).join(' '),words.slice(mid).join(' ')]}
 const ts=Math.min(d.titleSize||30,Math.floor(190/Math.max(...lines.map(l=>l.length))*1.45));const ty=d.titleY||200;
 const names=cast.slice(0,2).map(p=>p.n.toUpperCase());
 const studio=S&&S.logo?S.logo.text.toUpperCase():(S?S.name.toUpperCase():'');
 const svg=`<svg viewBox="0 0 200 300" width="${w}" height="${w*1.5}" style="display:block;border-radius:6px;box-shadow:0 6px 20px #0008"><g>${posterBg(d.bg,P,r,u)}<!--UNDER-->${art}${fig}<!--OVER-->
 <rect y="${ty-ts-20}" width="200" height="${ts*lines.length+50}" fill="none"/>
 ${names.length?`<text x="${names.length>1?40:100}" y="18" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="${P[3]}" text-anchor="middle" letter-spacing="1">${esc(names[0])}</text>`:''}${names[1]?`<text x="160" y="18" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="${P[3]}" text-anchor="middle" letter-spacing="1">${esc(names[1])}</text>`:''}
 <text x="100" y="32" font-family="Inter,sans-serif" font-size="6" fill="${P[3]}" text-anchor="middle" letter-spacing="2" opacity=".8">${esc(studio)} PRESENTS</text>
 ${lines.map((l,i)=>`<text x="100" y="${ty+i*(ts*0.95)}" font-family="${font}" font-size="${ts}" fill="${P[2]}" text-anchor="middle" stroke="#000" stroke-opacity=".35" stroke-width=".8" paint-order="stroke">${esc(l)}</text>`).join('')}
 ${d.tagline?`<text x="100" y="${ty+lines.length*ts*0.95+6}" font-family="Inter,sans-serif" font-size="8" font-style="italic" fill="${P[3]}" text-anchor="middle">${esc(d.tagline.slice(0,40))}</text>`:''}
 <rect y="268" width="200" height="32" fill="#000" opacity=".45"/>
 <text x="100" y="281" font-family="'Bebas Neue',Impact,sans-serif" font-size="6.2" fill="#ddd" text-anchor="middle" letter-spacing=".5">DIRECTED BY ${esc(pname(f.dir).toUpperCase())} · WRITTEN BY ${esc(pname(f.writer).toUpperCase())}</text>
 <text x="100" y="293" font-family="Inter,sans-serif" font-size="7" font-weight="800" fill="${P[2]}" text-anchor="middle" letter-spacing="2">${f.dist==='stream'?'STREAMING SOON':'ONLY IN THEATERS'}</text>
 <text x="190" y="293" font-family="Inter,sans-serif" font-size="6" fill="#ddd" text-anchor="end">${esc(f.rating||'')}</text></g></svg>`;
 return svg;
}
function posterScore(f,d){
 const g=f.genre;const reasons=[];let s=40;
 const ff=P_FONTS[d.font];if(ff&&ff[2].includes(g)){s+=12;reasons.push(['+12','lettering fits the genre'])}else reasons.push(['+0','lettering doesn\'t suit a '+g.toLowerCase()]);
 const L=person(f.cast&&f.cast.lead);const castN=allCast(f.cast).length;
 if((d.layout==='star'||d.layout==='bigface')&&L){const v=Math.round(L.star/7);s+=v;reasons.push(['+'+v,'famous face on the poster'])}
 if(d.layout==='duo'&&castN>=2){s+=8;reasons.push(['+8','two stars sell the conflict'])}
 if(d.layout==='ensemble'){if(castN>=3){s+=9;reasons.push(['+9','big cast shows scale'])}else{s-=4;reasons.push(['−4','ensemble with too few faces'])}}
 if(d.layout==='silhouette'&&['Horror','Thriller'].includes(g)){s+=10;reasons.push(['+10','mysterious silhouette builds intrigue'])}
 if(d.layout==='minimal'&&['Drama','Horror','Animation','Sci-Fi'].includes(g)){s+=7;reasons.push(['+7','clean, artful key art'])}
 const pf={blood:['Horror','Thriller'],noir:['Thriller','Drama'],neon:['Superhero','Sci-Fi'],cyber:['Sci-Fi','Action'],pastel:['Romance','Animation','Comedy'],sunset:['Comedy','Action','Romance'],gold:['Biopic','Drama'],vintage:['Biopic','Drama'],ocean:['Sci-Fi','Animation'],forest:['Animation','Drama'],ice:['Thriller','Sci-Fi'],toxic:['Horror','Comedy']}[d.pal]||[];
 if(pf.includes(g)){s+=8;reasons.push(['+8','colours match the mood'])}
 const bf={fire:['Action','Superhero'],city:['Superhero','Action','Thriller'],stars:['Sci-Fi','Animation'],planet:['Sci-Fi'],smoke:['Horror','Thriller'],rain:['Thriller','Drama','Romance'],rays:['Comedy','Animation','Romance'],spotlight:['Drama','Biopic'],forest:['Horror','Animation'],mountains:['Action','Drama'],waves:['Romance','Animation'],gradient:[]}[d.bg]||[];
 if(bf.includes(g)){s+=6;reasons.push(['+6','backdrop fits the story'])}
 if(d.tagline&&d.tagline.trim().length>4){s+=4;reasons.push(['+4','memorable tagline'])}
 if(lotLv('marketing')){const v=lotLv('marketing')*3;s+=v;reasons.push(['+'+v,'your marketing department'])}
 if(d.tier){const v=[0,6,12][d.tier];s+=v;reasons.push(['+'+v,d.tier===2?'top designer polish':'agency polish'])}
 return {score:clamp(Math.round(s),5,100),reasons};
}

/* ---------- Scenes ---------- */
function confetti(n){let h='<div class="confetti">';for(let i=0;i<(n||60);i++)h+=`<i style="left:${Math.random()*100}%;background:${pick(['#ffd77a','#ff5d62','#6aa8ff','#3dd68c','#f5f5f5','#b07cff'])};animation-delay:${Math.random()*1.5}s;animation-duration:${2+Math.random()*2}s;transform:rotate(${Math.random()*360}deg)"></i>`;return h+'</div>'}
function cinemaScene(f){
 const t=esc((f.title||'').toUpperCase());const bulbs=Array.from({length:22},(_,i)=>`<circle cx="${22+i*16}" cy="96" r="2.6" class="bulb" style="animation-delay:${(i%4)*.25}s"/><circle cx="${22+i*16}" cy="158" r="2.6" class="bulb" style="animation-delay:${((i+2)%4)*.25}s"/>`).join('');
 const crowd=Array.from({length:16},(_,i)=>`<g transform="translate(${10+i*24} ${262+(i%2)*6})"><circle r="7" fill="#0d0b10"/><path d="M-10 26 Q-10 8 0 8 Q10 8 10 26Z" fill="#0d0b10"/></g>`).join('');
 return `<div class="scene"><svg viewBox="0 0 380 300" width="100%" style="display:block">
 <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0820"/><stop offset="1" stop-color="#3a1d4a"/></linearGradient></defs>
 <rect width="380" height="300" fill="url(#sky)"/>
 <g class="beam1"><path d="M90 300 L60 -40 L110 -40Z" fill="#fff6c8" opacity=".12"/></g><g class="beam2"><path d="M290 300 L270 -40 L320 -40Z" fill="#fff6c8" opacity=".12"/></g>
 ${Array.from({length:30},()=>`<circle cx="${Math.random()*380}" cy="${Math.random()*80}" r="${Math.random()*1.2+.3}" fill="#fff" opacity=".7"/>`).join('')}
 <rect x="20" y="60" width="340" height="190" fill="#3b1c1c"/><rect x="20" y="60" width="340" height="12" fill="#5a2a2a"/>
 <path d="M150 30 L230 30 L240 60 L140 60Z" fill="#b8892e"/><text x="190" y="51" text-anchor="middle" font-family="'Bebas Neue',Impact" font-size="16" fill="#1b1206" letter-spacing="2">${esc((S&&S.logo?S.logo.text:'PALACE').toUpperCase().slice(0,12))}</text>
 <rect x="14" y="86" width="352" height="82" rx="6" fill="#111"/><rect x="18" y="90" width="344" height="74" rx="4" fill="#fdf3d8"/>
 <g fill="#ffd77a">${bulbs}</g>
 <text x="190" y="${t.length>18?132:138}" text-anchor="middle" font-family="'Bebas Neue',Impact" font-size="${t.length>18?22:32}" fill="#1b1206" letter-spacing="2">${t}</text>
 <text x="190" y="${t.length>18?152:156}" text-anchor="middle" font-family="Inter" font-size="9" font-weight="800" fill="#7a1f2b" letter-spacing="3">NOW PLAYING</text>
 <rect x="34" y="176" width="52" height="70" fill="#111"/><rect x="294" y="176" width="52" height="70" fill="#111"/>
 <foreignObject x="37" y="179" width="46" height="64"><div xmlns="http://www.w3.org/1999/xhtml">${posterSVG(f,46)}</div></foreignObject>
 <foreignObject x="297" y="179" width="46" height="64"><div xmlns="http://www.w3.org/1999/xhtml">${posterSVG(f,46)}</div></foreignObject>
 <rect x="130" y="180" width="120" height="70" fill="#1a0e0e"/><rect x="134" y="184" width="54" height="66" fill="#c9a26b" opacity=".25"/><rect x="192" y="184" width="54" height="66" fill="#c9a26b" opacity=".25"/>
 <path d="M150 250 L230 250 L280 300 L100 300Z" fill="#b3131e"/>
 ${crowd}</svg></div>`;
}
function statue(sz){return `<svg viewBox="0 0 60 120" width="${sz*.5}" height="${sz}"><defs><linearGradient id="gold" x1="0" x2="1"><stop offset="0" stop-color="#a8792a"/><stop offset=".5" stop-color="#ffe08a"/><stop offset="1" stop-color="#a8792a"/></linearGradient></defs>
 <circle cx="30" cy="14" r="8" fill="url(#gold)"/><path d="M22 24 L38 24 L36 60 L40 92 L20 92 L24 60Z" fill="url(#gold)"/><path d="M22 28 L14 44 L22 40Z M38 28 L46 44 L38 40Z" fill="url(#gold)"/><rect x="14" y="92" width="32" height="8" fill="url(#gold)"/><rect x="10" y="100" width="40" height="14" rx="2" fill="#2a1d10"/><rect x="12" y="104" width="36" height="2" fill="#a8792a"/></svg>`}
function stageBG(inner){return `<div class="stage"><div class="curtain l"></div><div class="curtain r"></div><div class="spot"></div><div class="stage-in">${inner}</div></div>`}
function donut(items,size){const tot=sum(items,x=>x.v)||1;let a=-Math.PI/2;const R=42,r=26;let s='';
 items.forEach(it=>{const da=it.v/tot*Math.PI*2;if(da<=0)return;const a2=a+da;const lg=da>Math.PI?1:0;
  const p=(ang,rad)=>`${50+Math.cos(ang)*rad} ${50+Math.sin(ang)*rad}`;
  s+=`<path d="M${p(a,R)} A${R} ${R} 0 ${lg} 1 ${p(a2-0.0001,R)} L${p(a2-0.0001,r)} A${r} ${r} 0 ${lg} 0 ${p(a,r)}Z" fill="${it.c}" stroke="${it.me?'#fff':'#0d0b10'}" stroke-width="${it.me?1.5:.6}"/>`;a=a2});
 return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">${s}</svg>`}
function logoSVG(L,w){L=L||{text:'Studio',sub:'Pictures',tpl:'classic',c1:'#e8b84a',c2:'#1a1206',icon:'S'};
 const f={classic:"'Cinzel',Georgia,serif",modern:"Inter,sans-serif",playful:"'Bangers',Impact",pixel:"'Press Start 2P','Courier New',monospace",elegant:"'Playfair Display',Georgia,serif",minimal:"'Bebas Neue',Impact"}[L.tpl]||'Inter';
 const fs=L.tpl==='pixel'?11:20;
 return `<svg viewBox="0 0 220 60" width="${w}" height="${w*60/220}"><rect width="220" height="60" rx="10" fill="${L.c1}"/><rect x="6" y="6" width="48" height="48" rx="8" fill="${L.c2}"/><text x="30" y="${L.tpl==='pixel'?36:38}" text-anchor="middle" font-family="${f}" font-size="${L.tpl==='pixel'?12:20}" font-weight="800" fill="${L.c1}">${esc((L.icon||'').slice(0,3))}</text>
 <text x="137" y="${L.sub&&L.sub!=='None'?33:38}" text-anchor="middle" font-family="${f}" font-size="${fs}" font-weight="800" fill="${L.c2}">${esc((L.text||'').slice(0,16))}</text>${L.sub&&L.sub!=='None'?`<text x="137" y="48" text-anchor="middle" font-family="Inter" font-size="8" letter-spacing="3" fill="${L.c2}">${esc(L.sub.toUpperCase())}</text>`:''}</svg>`}

function allCast(c){if(!c)return[];return [c.lead].concat(c.leads2||[],[c.co],c.cos2||[],c.sup||[]).filter(Boolean)}
