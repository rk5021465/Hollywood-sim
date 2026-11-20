/* ===================== v16 — Eras: start in 1970, live through Hollywood history ===================== */
const ERAS=[
 {y:1970,k:'e70',n:'New Hollywood',tag:'Auteurs rule. Gritty dramas, paranoid thrillers and the first summer blockbusters.',c:['#D9762B','#F2B45A','#2A1C10'],
  news:[['🎥','Directors are king','Bold auteurs get final cut, and critics matter more than ever'],['📺','Network TV licensing','Sell finished films to the three TV networks'],['🦈','The summer blockbuster','One shark movie just changed how studios think about June']],g:{Drama:1.15,Thriller:1.15,Horror:1.1,Superhero:.55,Animation:.8,'Sci-Fi':.9}},
 {y:1980,k:'e80',n:'The Blockbuster Era',tag:'Summer is the battlefield. Studios bet everything on tentpoles and spectacle.',c:['#D6337A','#7B5CFF','#1c0a24'],
  news:[['📼','Home video arrives','VHS rentals become a big new income stream'],['🦖','Effects revolution','Sci-fi and fantasy budgets double, and so does the upside'],['📺','Cable TV','Sell old films to new cable channels']],g:{Action:1.2,'Sci-Fi':1.2,Comedy:1.15,Horror:1.1,Drama:.92,Superhero:.75}},
 {y:1990,k:'e90',n:'Indies & CGI',tag:'Sundance darlings, the animation renaissance and the first all-digital worlds.',c:['#14A3A3','#7FE0D0','#06201f'],
  news:[['🎬','The indie boom','Festival hits can be bought cheap and sold big'],['🖥️','CGI arrives','Digital effects make the impossible affordable'],['🌏','Global box office','Overseas markets grow fast. China opens in 1994']],g:{Animation:1.25,Action:1.15,Thriller:1.1,Drama:1.05,Superhero:.8}},
 {y:2000,k:'e00',n:'DVDs & Franchises',tag:'DVD money flows, sequels multiply and fantasy trilogies rule the world.',c:['#3B6FD6','#9CC2FF','#0b1530'],
  news:[['💿','The DVD gold rush','Home entertainment becomes the biggest profit centre'],['🧙','Franchise fever','Sequels, trilogies and shared worlds dominate'],['🌐','The internet','Trailers go online. Buzz moves faster than ever']],g:{Superhero:1.1,Animation:1.15,Action:1.1,Comedy:1.1,Drama:.95}},
 {y:2010,k:'e10',n:'Superheroes & Streaming',tag:'Cinematic universes dominate theatres while streamers rewrite the rules at home.',c:['#D63A3F','#FF8A6B','#250808'],
  news:[['🦸','Cinematic universes','Interconnected superhero films earn billions'],['📡','The streaming wars','Tech giants pour money into originals'],['📱','Social media buzz','Hype now lives on phones and timelines']],g:{Superhero:1.4,Animation:1.1,Action:1.05,Drama:.88,Comedy:.9,Romance:.85}},
 {y:2020,k:'e20',n:'The Streaming Age',tag:'Shorter windows, fewer screens, and a fight over every subscriber.',c:['#C9962E','#FFD77A','#1c140a'],
  news:[['🏠','Shorter windows','Films reach home within weeks, not months'],['🎟️','Event cinema','Only big events and horror fill theatres'],['🤖','AI on the horizon','New tools promise cheaper effects, unions push back']],g:{Horror:1.2,Superhero:1.0,Animation:1.05,Drama:.9}},
 {y:2030,k:'e30',n:'The Next Frontier',tag:'Virtual production, global audiences and whatever comes next.',c:['#8A5CF6','#C9B5FF','#120a24'],
  news:[['🌍','Global first','Hits come from everywhere'],['🕶️','New screens','Immersive formats compete with cinema'],['🎞️','Old is gold','Libraries are worth more than ever']],g:{}}];
function eraOf(y){y=y||(S&&S.year)||2026;let e=ERAS[0];ERAS.forEach(x=>{if(y>=x.y)e=x});return e}
const isEraMode=()=>!!(S&&S.y0&&S.y0<2000);

/* ---------- start year per save ---------- */
load=(function(o){return function(){const s=o.apply(this,arguments);try{if(s){START_YEAR=s.y0||2026;END_YEAR=s.y1||2050}}catch(e){}return s}})(load);
setupView=(function(o){return function(){o();try{if(SW&&SW.step===2){if(SW.era==null)SW.era=1970;const a=document.getElementById('app');const h=a&&a.querySelector('h2');if(h&&!a.querySelector('.erapick'))if(SW.era<2000)[...a.querySelectorAll('.card b, .opt b, b')].forEach(b=>{const m=b.textContent.match(/^\$(\d+)M$/);if(m)b.textContent=M(+m[1]*.144)});h.insertAdjacentHTML('afterend',`<div class="erapick"><small>When does your story start?</small><p class="muted" style="font-size:12px;margin:2px 0 6px">In 1970 a dollar goes about 7× further, so your starting cash is scaled to the era.</p>${[[1970,'1970 · Eras','Live through 60 years of Hollywood history','recommended'],[2026,'2026 · Modern','Start today: streaming, social media and AI']].map(([y,l,d,tag])=>`<button class="eropt ${SW.era===y?'on':''}" onclick="SW.era=${y};setupView()"><b>${l}</b><span>${d}</span>${tag?`<i>${tag}</i>`:''}</button>`).join('')}</div>`)}}catch(e){}}})(setupView);
finishSetup=(function(o){return function(){const y0=(SW&&SW.era)||1970;START_YEAR=y0;END_YEAR=y0===1970?2030:2050;o.apply(this,arguments);try{if(S){S.y0=START_YEAR;S.y1=END_YEAR;if(y0<2000){S.cash=+(S.cash*inf(0)).toFixed(1);S.rivals.forEach(r=>{if(r.svc){r.svc0=r.svc;r.svc0subs=r.subs;r.svc=null;r.subs=0}});S.eraSeen=eraOf(y0).k}save();render()}}catch(e){}}})(finishSetup);

/* ---------- era rules ---------- */
// genre tastes by decade
trendMult=(function(o){return function(g,p){let m=o(g,p);try{if(isEraMode()){const e=eraOf();m*=(e.g[g]||1)}}catch(e){}return m}})(trendMult);
// home entertainment: TV only → VHS → DVD boom → digital
function homeFactor(y){return y<1977?.45:y<1997?.8:y<2008?1.3:y<2020?.9:1}
releaseFilm=(function(o){return function(p){const y=S.year;const cn=S.ev.china;if(isEraMode()&&y<1994)S.ev.china=-3;const f=o(p);S.ev.china=cn;
 try{if(isEraMode()&&f&&f.ancillary&&f.dist!=='stream'&&f.dist!=='sell'){const k=homeFactor(y);if(k!==1){const own=1-(p.cofi||0);const d=+(f.ancillary*(k-1)).toFixed(1);f.ancillary=+(f.ancillary+d).toFixed(1);f.revenue=+(f.revenue+d*own).toFixed(1);f.profit=+(f.profit+d*own).toFixed(1);const t=tNow();const b=S.receivables.find(r=>r.label===f.title+' home & PVOD'&&r.t>t),c=S.receivables.find(r=>r.label===f.title+' TV licensing'&&r.t>t);if(b)b.amt+=d*.6*own;if(c)c.amt+=d*.4*own}}}catch(e){}return f}})(releaseFilm);
// no streaming before it existed
launchService=(function(o){return function(n){if(S.year<2007)return toast('Streaming doesn’t exist yet. Internet video arrives around 2007.');return o(n)}})(launchService);
bidders=(function(o){return function(){return S.year<2007?['Atlantic Broadcasting','Continental TV Network','National Television Group','Premium cable','Home video label']:o()}})(bidders);
function eraRivalStreamers(){if(!isEraMode())return;const y=S.year;S.rivals.forEach((r,i)=>{if(r.svc0&&!r.svc&&r.alive&&y>=2008+i*2){r.svc=r.svc0;r.subs=Math.max(5,(r.svc0subs||20)*.3);addNews(`📡 ${esc(r.n)} launches its own streaming service, ${esc(r.svc)}.`)}})}
// period-correct wording
addNews=(function(o){return function(s){try{if(S&&S.year<2005)s=String(s).replace(/hits (\d+)M views in 24 hours \((\d+)% positive\)/,'plays before every big film; audiences react ($2% positive)').replace(/#\w+ trends\.?/g,'').replace(/streaming sign-ups/g,'video rentals')}catch(e){}return o(s)}})(addNews);
// the phone and social apps arrive with smartphones
render=(function(o){return function(){o();try{if(S&&isEraMode())document.body.dataset.era=eraOf().k;else delete document.body.dataset.era}catch(e){}}})(render);

/* ---------- a new decade: full-screen moment ---------- */
function eraScreen(e,next){if(typeof document==='undefined'||!document.body||!document.getElementById)return next&&next();const old=document.getElementById('eras');if(old)old.remove();
 document.body.insertAdjacentHTML('beforeend',`<div id="eras" class="erascr ${e.k}" style="--e1:${e.c[0]};--e2:${e.c[1]};--e3:${e.c[2]}"><div class="eragrid"></div><div class="erain"><span class="erachip">A new era begins</span><div class="erayr">${e.y}</div><h2>${e.n}</h2><p>${e.tag}</p>${e.news.map(n=>`<div class="eranw"><span>${n[0]}</span><div><b>${n[1]}</b><small>${n[2]}</small></div></div>`).join('')}<button class="erago" onclick="eraGo()">Enter the ${String(e.y).slice(2)}s ›</button></div></div>`);
 window._eraNext=next;try{sfx('fanfare');hap('confirm');musicTrack('awards')}catch(x){}}
function eraGo(){const e=document.getElementById('eras');if(e){e.classList.add('out');setTimeout(()=>e.remove(),300)}const n=window._eraNext;window._eraNext=null;try{musicTrack('hq')}catch(x){}if(n)n()}
const _nm16=nextMonth;nextMonth=function(){const r=_nm16.apply(this,arguments);try{if(S&&!S.over&&isEraMode()){eraRivalStreamers();const e=eraOf();if(S.eraSeen!==e.k){S.eraSeen=e.k;addNews(`🎞️ A new era begins: <b>${e.n}</b>.`);try{diary('🎞️','A new era: '+e.n,e.tag)}catch(x){}setTimeout(()=>eraScreen(e,()=>{}),350)}}}catch(x){}return r};
function eraChip(){if(!isEraMode())return '';const e=eraOf();return `<span class="erabadge" style="--e1:${e.c[0]};--e2:${e.c[1]}">🎞 ${e.n}</span>`}
/* shareholders take their cut: big cash piles get paid out as dividends each year */
yearEnd=(function(o){return function(){const r=o.apply(this,arguments);try{const thr=1500*I();if(S&&!S.over&&S.cash>thr){const pay=+((S.cash-thr)*.14).toFixed(1);S.cash-=pay;S.divPaid=(S.divPaid||0)+pay;addNews(`💼 The board pays shareholders ${M(pay)} in dividends and buybacks from ${esc(S.name)}’s cash pile.`)}}catch(e){}return r}})(yearEnd);
/* fix: share sales were valued on your own cash (raise → more cash → bigger raise). Value the business, once a year */
raiseCapital=function(){if(!S.stock||!S.stock.public)return;if(S.stock.lastRaise!=null&&tNow()-S.stock.lastRaise<12)return toast('Investors need 12 months between share sales');const V=Math.max(0,valuation()-S.cash*.8);const r=+(V*.1*.95).toFixed(1);if(r<=0)return toast('Investors aren’t interested right now');S.cash+=r;S.stock.price*=.94;S.stock.lastRaise=tNow();addNews(`💼 ${esc(S.name)} sells new shares, raising ${M(r)}.`);try{save();render()}catch(e){}};
