/* ===== v28: newspaper-style critics (one critic per beat, actor tabs, star ratings) ===== */
function rng40(seed){let s=seed>>>0||7;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const pk40=(r,a)=>a[Math.floor(r()*a.length)];
/* every outlet keeps the same critic for life */
function critic40(o){const r=rng40(hashStr('critic40'+o));const F=(typeof FIRST_F!=='undefined'?FIRST_F:['Ruth','Ellen','Diane','Gloria','Irene','Nora','June','Rosa','Dorothy','Priscilla','Elaine']),Mm=(typeof FIRST_M!=='undefined'?FIRST_M:['Marcus','Victor','Leon','Walt','Hal','Frank','Earl','Nathaniel','Sam']),L=(typeof LAST!=='undefined'?LAST:['Vance','Webb','Nunn','Cross','Cho','Pryce','Kemper','Ashby','Moreau','Doyle']);return pk40(r,r()<.5?F:Mm)+' '+pk40(r,L)}
const BEAT40=[
 {k:'perf',t:'Performances'},{k:'cast',t:'Casting'},{k:'script',t:'Script'},{k:'dir',t:'Direction'},
 {k:'look',t:'Cinematography'},{k:'music',t:'Music & Score'},{k:'craft',t:'Production & Effects'},{k:'aud',t:'Audience Appeal'},{k:'box',t:'Box Office Potential'}];
/* bands: 0 awful · 1 weak · 2 decent · 3 strong · 4 superb. Each = [openers, closers] */
const TX40={
 perf:[[`{N} looks lost as {R}, and it drags {T} down with them.`,`Whatever {N} was going for as {R}, it never arrives.`,`{N} never seems comfortable on screen.`,`{N} plays {R} as if reading the lines for the first time.`],
  [`{N} has moments as {R}, but they are few and far between.`,`{N} is serviceable as {R} and not much more.`,`{N} works hard as {R}; you can see every bit of the effort.`],
  [`There's a lot to like in how {T}'s actors handle the material.`,`{N} gives {R} an easy, likeable warmth.`,`{N} is solid as {R}, if never surprising.`],
  [`{N} gives {R} a lived-in weight that the script alone could not.`,`{N} is quietly terrific as {R}.`,`Watch {N}'s eyes in the quiet scenes; that is where {T} lives.`],
  [`{N} elevates every scene they're in.`,`{N} delivers the kind of performance as {R} that people will still talk about in twenty years.`,`{N} is a revelation as {R}: fearless, precise and impossible to look away from.`]],
 perfB:[[` A rare misfire.`,` Someone should have stepped in.`],[` It's a performance that never quite catches.`,` A shrug of a turn.`],[` Nothing to complain about.`,` A dependable turn.`],[` Awards voters, take note.`,` The best thing in the picture.`],[` Career-best work.`,` Simply unforgettable.`]],
 cast:[[`The casting of {T} is baffling from top to bottom.`,`Nobody in {T} seems to belong in the same film.`],
  [`The ensemble of {T} never gels.`,`A few odd choices keep {T} at arm's length.`],
  [`The ensemble of {T} is sensibly assembled.`,`Nobody is miscast in {T}, though nobody surprises either.`],
  [`The ensemble of {T} has real chemistry.`,`Whoever cast {T} deserves a raise.`],
  [`Casting is where {T} truly excels.`,`Every face in {T} feels exactly right.`]],
 castB:[[` The chemistry is simply not there.`],[` You keep noticing the actors instead of the characters.`],[` It does the job.`],[` They feel like real people sharing real rooms.`],[` It's hard to picture anyone else in these parts.`]],
 script:[[`The script for {T} is a muddle of half-ideas.`,`{W}'s screenplay seems to have been finished on the way to set.`],
  [`The script for {T} has a good idea buried under a lot of filler.`,`{W}'s dialogue clunks more often than it sings.`],
  [`The script for {T} is solid, dependable work.`,`{W}'s screenplay does what it needs to.`],
  [`{W}'s script is sharp, funny where it should be and brave where it counts.`,`The screenplay for {T} is tight and surprisingly literate.`],
  [`{W} has written a script for {T} that people will be studying for years.`,`Every line of {T} feels considered, and every scene turns.`]],
 scriptB:[[` Nothing connects.`,` The third act simply gives up.`],[` It's a draft or two short of good.`],[` Nothing groundbreaking, just good, clean storytelling.`],[` It earns its ending.`],[` A masterclass in structure.`]],
 dir:[[`{D} seems to have lost control of {T} early on.`,`{T} is directed with all the energy of a traffic report.`],
  [`{D} keeps {T} moving but never finds its pulse.`,`{D}'s direction is flat where it should be bold.`],
  [`{D} directs {T} with a steady, unfussy hand.`,`{T} is handsomely, carefully put together.`],
  [`{D} directs {T} with real confidence.`,`{D} turns every scene of {T} into a pressure point.`],
  [`{D} is in total command here.`,`{T} is what happens when a director knows exactly what they want, and gets it.`]],
 dirB:[[` A mess behind the camera.`],[` It never quite comes alive.`],[` It holds together better than most pictures this season.`],[` A director at the top of their game.`],[` Pure cinema.`]],
 look:[[`{T} looks murky and cheap.`,`Half of {T} is too dark to follow.`],[`The photography of {T} is functional at best.`],[`{P} gives {T} a clean, handsome look.`],[`{P}'s camera finds beauty in unlikely corners.`,`Some of {T}'s images will stay with you.`],[`{P}'s photography is breathtaking; nearly every frame could hang in a gallery.`]],
 lookB:[[` Someone forgot to light the set.`],[` It looks like television.`],[` Pleasant to look at.`],[` Gorgeous work.`],[` A visual feast.`]],
 music:[[`The score of {T} is relentless and wrong at every turn.`],[`{C}'s music tells you what to feel, and too loudly.`],[`{C}'s score does its job without calling attention to itself.`],[`{C}'s score is quietly doing half the emotional work.`],[`{C}'s music is the heartbeat of {T}; you'll be humming it for days.`]],
 musicB:[[` Turn it down.`],[` Forgettable.`],[` Perfectly fine.`],[` A soundtrack worth buying.`],[` An instant classic of a score.`]],
 craft:[[`The sets of {T} wobble, and so does the illusion.`,`You can see where the money ran out.`],[`{T}'s production values are thin for a film of its kind.`],[`{T} is well dressed and convincingly built.`],[`{T}'s world feels expensive and lived-in.`],[`The craft on display in {T} is staggering; you believe every inch of it.`]],
 craftB:[[` It looks unfinished.`],[` It rarely convinces.`],[` No complaints.`],[` Money well spent.`],[` A new benchmark.`]],
 aud:[[`Audiences walked out of our screening of {T}.`,`Crowds will be checking their watches.`],[`{T} will test the patience of a Friday-night crowd.`],[`Audiences will have a perfectly nice time at {T}.`],[`The screening crowd for {T} cheered twice and gasped once.`],[`Our audience gave {T} a standing ovation.`]],
 audB:[[` Word of mouth will be brutal.`],[` Mixed word of mouth ahead.`],[` A safe night out.`],[` Expect people to tell their friends.`],[` People will go back to see it again.`]],
 box:[[`{T} looks like a costly miss for {S}.`,`It is hard to see who {T} was made for.`],[`{T} faces an uphill climb at the box office.`],[`{T} should hold its own against the competition.`],[`{T} should turn a healthy profit.`],[`{T} is going to be a monster at the box office.`]],
 boxB:[[` Write it off.`],[` Expect a quick exit from theaters.`],[` A modest earner.`],[` The lines will be around the block.`],[` {S} has a phenomenon on its hands.`]]
};
function band40(x){return x>=8.3?4:x>=7?3:x>=5.5?2:x>=3.8?1:0}
function sk40(id){const p=id&&person(id);return p?(p.skill||55):55}
function castList40(f){const c=f.cast||{};let roles=[];try{roles=mkRoles({title:f.title,genre:f.genre})}catch(e){}
 const by=t=>roles.filter(r=>r.tier===t||(t==='sup'&&r.tier==='bit'));const pools={lead:by('lead'),co:by('co'),sup:by('sup')};
 const out=[];const add=(id,tier)=>{if(!id||out.some(x=>x.id===id))return;const p=person(id);if(!p)return;const r=pools[tier].shift();out.push({id,p,tier,role:r?r.n:tier==='lead'?'The Lead':tier==='co'?'The Co-star':'Supporting'})};
 add(c.lead,'lead');(c.leads2||[]).forEach(x=>add(x,'lead'));add(c.co,'co');(c.cos2||[]).forEach(x=>add(x,'co'));(c.sup||[]).forEach(x=>add(x,'sup'));return out}
function reviews40(f,ai){const r=rng40(hashStr('rv40'+f.title+f.id));const g=f.genre,cr=f.critic||50,q=f.q||cr;const CL=castList40(f);const A=CL[ai]||CL[0];
 const outs=(typeof OUT36==='function'?OUT36():[['The Daily Reel','paper']]).slice();const pick=()=>outs.length?outs.splice(Math.floor(r()*outs.length),1)[0]:['The Daily Reel','paper'];
 const nz=k=>(r()-.5)*k;const cl=x=>Math.round(clamp(x,5,99))/10;
 const fit=a=>typeof fitFor==='function'?fitFor(a,g):55;
 const avgFit=CL.length?sum(CL,x=>fit(x.p))/CL.length:55;const bud=(GEN[g]&&GEN[g].budget||20)*inf(f.releaseT||tNow());const ratio=f.opening&&f.costTotal?f.opening/f.costTotal:(f.hype||40)/100;
 const sc={perf:A?cl(A.p.skill*.42+fit(A.p)*.26+cr*.32+nz(26)):cl(cr+nz(20)),cast:cl(avgFit*.5+cr*.5+nz(14)),script:cl(sk40(f.writer)*.35+cr*.65+nz(16)),dir:cl(sk40(f.dir)*.3+q*.35+cr*.35+nz(14)),
  look:cl((f.dp?sk40(f.dp)*.5+cr*.5:cr-6)+nz(14)),music:cl((f.comp?sk40(f.comp)*.5+cr*.5:cr-6)+nz(14)),craft:cl(Math.min(1.2,(f.prod||bud)/bud)*28+cr*.68+nz(14)),aud:cl((f.aud||cr)+nz(12)),box:cl(clamp(ratio*110,8,96)*.7+cr*.3+nz(10))};
 const nm={T:`<i>${esc(f.title)}</i>`,N:A?esc(A.p.n):'the lead',R:A?esc(A.role):'the lead',W:f.writer&&person(f.writer)?esc(person(f.writer).n):'The writer',D:f.dir&&person(f.dir)?esc(person(f.dir).n):'The director',P:f.dp&&person(f.dp)?esc(person(f.dp).n):'The cinematographer',C:f.comp&&person(f.comp)?esc(person(f.comp).n):'The composer',S:esc(S.name||'the studio')};
 const fill=s=>s.replace(/\{(\w)\}/g,(m,k)=>nm[k]||m).replace(/^(<i>)?([a-z])/,(m,a,c)=>(a||'')+c.toUpperCase());
 const R0=BEAT40.map(b=>{const s=sc[b.k];const bd=band40(s);const r2=rng40(hashStr(b.k+f.title+(b.k==='perf'&&A?A.id:'')));const o=pick();
  const q1=fill(pk40(r2,TX40[b.k][bd])),q2=fill(pk40(r2,TX40[b.k+'B'][bd]));return{o:o[0],kind:o[1],beat:b.t,s,q:q1+q2,c:critic40(o[0])}});
 return{A,CL,R:R0,avg:Math.round(sum(R0,x=>x.s)/R0.length*10)/10}}
function stars40(x){const v=Math.round(x)/2;let h='';for(let i=1;i<=5;i++)h+=v>=i?'<b>★</b>':v>=i-.5?'<b class="h">★</b>':'<s>★</s>';return `<span class="st40">${h}</span>`}
const TIERN40={lead:'Lead',co:'Co-star',sup:'Supporting'};
function paper40(f,ai){ai=ai||0;const v=reviews40(f,ai);const A=v.A;const wk=(f.relWk||0)+1;const y=yearOf(f.releaseT||tNow());const mast=v.R[0].o;
 return `<div class="np40" id="np40-${f.id}"><div class="np40-m">${esc(mast)}</div><div class="np40-h">Reviews: ${esc(f.title)}</div>
 <div class="np40-sub">${A?esc(A.p.n)+' · '+esc(A.role)+' ('+TIERN40[A.tier]+') · ':''}${y} · Wk ${wk}</div>
 ${v.CL.length>1?`<div class="np40-tabs">${v.CL.map((x,i)=>`<button class="${i===ai?'on':''}" onclick="paper40Tab(${f.id},${i})">${esc(x.p.n.split(' ')[0])} · ${TIERN40[x.tier]}</button>`).join('')}</div>`:''}
 <div class="np40-avg">${stars40(v.avg)} <span>${v.avg.toFixed(1)}/10 average, ${v.R.length} critics</span></div>
 ${v.R.map(x=>`<div class="np40-r"><div class="np40-o"><b>${esc(x.o.toUpperCase())}</b> · ${x.beat}</div><div class="np40-s">${stars40(x.s)} <span>${x.s.toFixed(1)}/10</span></div><p>"${x.q}" <span class="np40-c">— ${esc(x.c)}</span></p></div>`).join('')}
 ${typeof criticsModal==='function'?`<button class="np40-more" onclick="criticsModal(${f.id})">Read all ${f.nrev||''} reviews ›</button>`:''}</div>`}
function paper40Tab(id,i){const f=S.films.find(x=>x.id===id);const el=document.getElementById('np40-'+id);if(!f||!el)return;el.outerHTML=paper40(f,i)}
/* remove a balanced <div …>…</div> starting at index s */
function cutDiv40(h,s){let i=s,d=0;const re=/<div\b|<\/div>/g;re.lastIndex=s;let m;while((m=re.exec(h))){if(m[0]==='</div>'){d--;if(d===0)return [h.slice(0,s),h.slice(re.lastIndex)]}else d++}return null}
filmReport=(function(o){return function(f){let h=o.apply(this,arguments);try{if(f&&f.kind!=='show'){const k=h.indexOf("<small>Critics' reviews</small>");if(k>=0){const s=h.lastIndexOf('<div class="card"',k);const parts=cutDiv40(h,s);if(parts)h=parts[0]+paper40(f,0)+parts[1]}}}catch(e){console.warn(e)}return h}})(filmReport);
/* standalone modal (e.g. from Released list / messages) */
function paperModal40(id){const f=S.films.find(x=>x.id===id);if(!f)return;modal(paper40(f,0)+`<button class="btn" style="margin-top:10px" onclick="modal()">Set the paper aside</button>`)}
