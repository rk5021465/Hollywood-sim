/* ===== ART: procedural portraits and posters ===== */
const SKIN=['#f6d7c3','#eac0a0','#d9a47c','#bf8560','#9a6542','#6f4529','#4b2e1c'];
const HAIR=['#1b1512','#3b2618','#6b4423','#a8743c','#d9b36a','#8c2f1e','#2b2b33'];
const SUIT=['#232a40','#3a2230','#1f3a34','#3b3420','#2a2f45','#402626','#20303f'];
function hashN(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function portrait(t,size=44,age){
 const h=hashN(t.name+t.id);
 const sk=SKIN[t.skin!=null?t.skin:h%SKIN.length];
 const old=(age||30)>=58;
 const hc=old?(age>=70?'#d9d6cf':'#9a958c'):HAIR[(h>>3)%HAIR.length];
 const su=SUIT[(h>>6)%SUIT.length];
 const f=t.g==='f';
 const style=(h>>9)%4;
 const id='pc'+(h%100000);
 const cap=style===3&&!f?'':`<path d="M20 27c0-10 5-15 12-15s12 5 12 15c-2-3-5-5-8-5.5-2 2-6 2.5-9 1.5-3 .5-5 2-7 4z" fill="${hc}"/>`;
 let back='',front=cap;
 if(f){
  back=style===0?`<path d="M18 26c0-10 6-15 14-15s14 5 14 15v22c-3 2-6 2-8 1V32H26v17c-2 1-5 1-8-1z" fill="${hc}"/>`:
   style===1?`<circle cx="32" cy="12" r="6" fill="${hc}"/>`:
   style===2?`<path d="M17 28c0-11 6-17 15-17s15 6 15 17c2 7 0 13-4 16l-3-14H24l-3 14c-4-3-6-9-4-16z" fill="${hc}"/>`:
   `<path d="M19 28c0-10 6-16 13-16s13 6 13 16l-1 12-3-10H23l-3 10z" fill="${hc}"/>`;
 }else{
  if(style===2&&old)front=`<path d="M20 30c0-3 1-5 2-6M44 30c0-3-1-5-2-6" stroke="${hc}" stroke-width="3" fill="none"/>`;
  if(style===1)back=`<path d="M19 30c0-11 6-17 13-17s13 6 13 17l-2 4H21z" fill="${hc}"/>`;
  if(style===3)front=`<path d="M19.5 28c0-11 6-16 12.5-16 8 0 13.5 5 12.5 16-2-4-3-5-5-5-3 1.5-11 1.5-15 0-2 0-4 1.5-5 5z" fill="${hc}"/>`;
 }
 const beard=!f&&((h>>13)%5===0)?`<path d="M23 36c2 7 6 10 9 10s7-3 9-10c-2 3-5 4-9 4s-7-1-9-4z" fill="${hc}" opacity=".9"/>`:'';
 const lips=f?`<path d="M29 39.5c2 1.2 4 1.2 6 0" stroke="#b5485a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`:`<path d="M29 39.5c2 .8 4 .8 6 0" stroke="#6b3a2c" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
 return `<svg class="portrait" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="32" cy="32" r="31"/></clipPath></defs><circle cx="32" cy="32" r="31" fill="#242C42"/><g clip-path="url(#${id})">
 <path d="M8 64c2-11 11-16 24-16s22 5 24 16z" fill="${su}"/>${f?'':`<path d="M28 48l4 8 4-8" fill="#F5EFE3"/><path d="M31 50h2l1 9h-4z" fill="#B3122E"/>`}
 
 <rect x="27" y="40" width="10" height="9" fill="${sk}"/>${back}<ellipse cx="32" cy="31" rx="12" ry="14" fill="${sk}"/>${front}${beard}
 <circle cx="27.5" cy="31" r="1.3" fill="#1b1512"/><circle cx="36.5" cy="31" r="1.3" fill="#1b1512"/>
 <path d="M25 27.5h5M34 27.5h5" stroke="${old?'#9a958c':hc}" stroke-width="1.3" stroke-linecap="round"/>${lips}
 ${old?'<path d="M25 35c1 1 2 1 3 1M36 36c1 0 2 0 3-1" stroke="#000" stroke-opacity=".15" fill="none"/>':''}</g>
 <circle cx="32" cy="32" r="31" fill="none" stroke="#D4AF37" stroke-width="1.5"/></svg>`;
}
function posterMotif(theme,c2){
 const m={
  'Haunted house':`<path d="M30 120l30-26 30 26v40H30z" fill="#000" opacity=".55"/><path d="M52 160v-18h16v18" fill="${c2}" opacity=".8"/><circle cx="92" cy="60" r="14" fill="#F5EFE3" opacity=".85"/>`,
  'Heist':`<rect x="35" y="80" width="50" height="60" rx="4" fill="#000" opacity=".5"/><circle cx="60" cy="110" r="14" fill="none" stroke="${c2}" stroke-width="3"/><path d="M60 96v28M46 110h28" stroke="${c2}" stroke-width="2"/>`,
  'Outer space':`<circle cx="60" cy="105" r="30" fill="${c2}" opacity=".7"/><ellipse cx="60" cy="105" rx="48" ry="9" fill="none" stroke="#F5EFE3" stroke-opacity=".7" stroke-width="2"/>${[[20,40],[95,50],[30,150],[100,140],[70,30]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join('')}`,
  'Love triangle':`<path d="M60 140c-30-20-40-40-28-54 9-10 22-6 28 4 6-10 19-14 28-4 12 14 2 34-28 54z" fill="${c2}" opacity=".85"/>`,
  'Revenge':`<circle cx="60" cy="95" r="34" fill="${c2}" opacity=".8"/><path d="M0 150h120v50H0z" fill="#000" opacity=".6"/><path d="M58 150v-26h4v26" fill="#000"/>`,
  'Coming of age':`<circle cx="60" cy="100" r="30" fill="${c2}" opacity=".75"/><path d="M0 130c30-10 90-10 120 0v70H0z" fill="#000" opacity=".45"/>`,
  'Time travel':`<circle cx="60" cy="100" r="32" fill="none" stroke="${c2}" stroke-width="4"/><path d="M60 100V78M60 100l14 8" stroke="#F5EFE3" stroke-width="3" stroke-linecap="round"/>`,
  'Monsters':`<path d="M20 160c0-50 15-80 40-80s40 30 40 80z" fill="#000" opacity=".6"/><circle cx="50" cy="110" r="4" fill="${c2}"/><circle cx="70" cy="110" r="4" fill="${c2}"/>`,
  'Detectives':`<circle cx="55" cy="100" r="20" fill="none" stroke="${c2}" stroke-width="4"/><path d="M69 114l18 18" stroke="${c2}" stroke-width="6" stroke-linecap="round"/>`,
  'Sports':`<circle cx="60" cy="100" r="26" fill="${c2}" opacity=".85"/><path d="M34 100h52M60 74v52" stroke="#000" stroke-opacity=".3" stroke-width="2"/>`,
  'Royalty':`<path d="M30 120l6-34 14 18 10-26 10 26 14-18 6 34z" fill="${c2}"/>`,
  'Small town':`<path d="M10 150v-26l16-12 16 12v26zM48 150v-36l14-10 14 10v36zM82 150v-22l14-10 14 10v22z" fill="#000" opacity=".5"/><circle cx="60" cy="60" r="12" fill="${c2}" opacity=".8"/>`,
  'Robots':`<rect x="40" y="76" width="40" height="34" rx="6" fill="${c2}" opacity=".85"/><circle cx="52" cy="92" r="4" fill="#000"/><circle cx="68" cy="92" r="4" fill="#000"/><rect x="44" y="114" width="32" height="34" rx="4" fill="${c2}" opacity=".6"/>`,
  'Treasure hunt':`<path d="M30 110l30-30 30 30-30 30z" fill="none" stroke="${c2}" stroke-width="3"/><path d="M52 102l16 16M68 102l-16 16" stroke="${c2}" stroke-width="4" stroke-linecap="round"/>`,
  'Survival':`<path d="M0 150l30-50 20 26 20-40 50 64v50H0z" fill="#F5EFE3" opacity=".25"/><circle cx="90" cy="60" r="10" fill="${c2}"/>`,
  'Superheroes':`<path d="M60 70l8 24h25l-20 15 8 24-21-15-21 15 8-24-20-15h25z" fill="${c2}"/>`,
  'The war front':`<path d="M0 140h120v60H0z" fill="#000" opacity=".5"/><path d="M20 140l10-30h6l6 30M80 140l8-22h6l6 22" fill="#000" opacity=".6"/><circle cx="60" cy="70" r="20" fill="${c2}" opacity=".5"/>`,
  'Showbiz':`<path d="M20 60l25 90M100 60l-25 90" stroke="${c2}" stroke-opacity=".5" stroke-width="10"/><circle cx="60" cy="110" r="10" fill="${c2}"/>`};
 return m[theme]||`<circle cx="60" cy="100" r="30" fill="${c2}" opacity=".7"/>`;
}
function poster(f,w=72){
 const g=G[f.genre]||G.Drama;const c1=g.c[0],c2=g.c[1];const h=hashN(f.title);const id='pg'+(h%100000);
 const words=f.title.split(' ');let lines=[];let cur='';for(const x of words){if((cur+' '+x).trim().length>11&&cur){lines.push(cur);cur=x}else cur=(cur+' '+x).trim()}lines.push(cur);lines=lines.slice(0,3);
 const fs=lines.some(l=>l.length>9)?12:14;
 return `<svg class="poster" width="${w}" height="${w*1.5}" viewBox="0 0 120 180" role="img" aria-label="Poster for ${esc(f.title)}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="#05070c"/></linearGradient></defs><rect width="120" height="180" fill="url(#${id})"/>${posterMotif(f.theme,c2)}
 <rect x="4" y="4" width="112" height="172" fill="none" stroke="${c2}" stroke-opacity=".35"/>
 ${lines.map((l,i)=>`<text x="60" y="${22+i*(fs+2)}" text-anchor="middle" font-family="Lora,Georgia,serif" font-weight="600" font-size="${fs}" fill="#F5EFE3" letter-spacing=".5">${esc(l.toUpperCase())}</text>`).join('')}
 ${f.seq>1?`<text x="60" y="${22+lines.length*(fs+2)+2}" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="${c2}">PART ${f.seq}</text>`:''}
 <text x="60" y="170" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="7" fill="#F5EFE3" fill-opacity=".7">${esc((f.studio||'').toUpperCase())}</text></svg>`;
}
