/* ===== v19 · LIVING WORLD — one connected story engine ===== */
/* Every happening flows through story(): it reaches the papers, the person's life story,
   your phone, social media (2009+), the inbox and the studio diary — and people remember. */

function lwInit(){if(!S.lw)S.lw={feed:[],pend:[],grudge:{},yr:{}}}
const fam=x=>x?(x.star||x.fame||0):0;
const isFamous=(x,n)=>fam(x)>=(n||50)&&!x.retired;
function lifeLog(x,icon,text){if(!x)return;x.life=x.life||[];x.life.unshift({y:S.year,m:S.month,i:icon,s:text});x.life=x.life.slice(0,24)}
function workedWith(id){return (S.films||[]).filter(f=>f.dir===id||f.writer===id||allCast(f.cast).includes(id)).length}
function bondOf(x){return x?(x.bond||0):0}
function bondAdd(id,v,why){const x=typeof id==='object'?id:person(id);if(!x)return;x.bond=clamp((x.bond||0)+v,-100,100);if(why)lifeLog(x,v>0?'💛':'🧊',why)}
function story(o){try{lwInit();const head=o.head;addNews(`${o.icon} ${head}`);if(S.news[0])S.news[0].p=o.paper||null;
 const plain=String(head).replace(/<[^>]+>/g,'');
 (o.who||[]).forEach(id=>lifeLog(person(id),o.icon,o.life||plain));
 if(o.dm){const x=person(o.dm.p);if(x){S.dms=S.dms||[];S.dms.unshift({t:tNow(),p:x.id,from:x.n,s:o.dm.text})}}
 if(o.post&&S.year>=2009&&typeof post==='function')post(o.post.h,o.post.text,o.post.l);
 if(o.inbox)addInbox.apply(null,o.inbox);
 if(o.diary)diary.apply(null,o.diary);
 S.lw.feed.unshift({t:tNow(),w:wIdx(),i:o.icon,s:plain,p:o.paper||'courier'});S.lw.feed=S.lw.feed.slice(0,80)}catch(e){console.error(e)}}
const HANDLE=n=>'@'+String(n).toLowerCase().replace(/[^a-z]/g,'').slice(0,14);
const FANH=['@cinephile_kay','@popcornqueen','@reelgossip','@boxofficebro','@filmtwitlee','@starstruck99','@hollywoodtea'];

/* ---------- relationships: richer types (dating → engaged → married, exes) ---------- */
relChem=function(ids){let c=0,h=0;for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const r=relOf(ids[i],ids[j]);if(!r)continue;const t=r.type;
 if(t==='friend')c+=2;if(t==='romance'||t==='engaged'){c+=2.5;h+=3}if(t==='married'){c+=3;h+=2}if(t==='feud')c-=4;if(t==='ex'){c-=1.5;h+=2}}return{c,h}};
relTags=function(x,ids){return ids.filter(id=>id!==x.id).map(id=>{const r=relOf(x.id,id);if(!r)return '';const nm=esc(pname(id).split(' ')[0]);
 return {friend:`<span class="tag good">🤝 Friends with ${nm}</span>`,romance:`<span class="tag hot">💕 Dating ${nm}</span>`,engaged:`<span class="tag hot">💍 Engaged to ${nm}</span>`,married:`<span class="tag good">💍 Married to ${nm}</span>`,ex:`<span class="tag">💔 Ex of ${nm}</span>`,feud:`<span class="tag bad">⚡ Feuding with ${nm}</span>`}[r.type]||''}).join('')};
function relSet(a,b,type){S.rel=S.rel||{};const k=relKey(a,b);S.rel[k]={type,t:tNow()}}

/* ---------- people live their lives (monthly) ---------- */
function lifeTick(){lwInit();const P=S.people;const pool=P.actors.concat(P.directors).filter(x=>isFamous(x,45));if(pool.length<4)return;let n=0;const cap=Math.random()<.5?1:2;
 /* romances move on */
 Object.entries(S.rel||{}).sort(()=>Math.random()-.5).forEach(([k,r])=>{if(n>=1)return;const [a,b]=k.split('|');const A=person(a),B=person(b);if(!A||!B)return;const age=tNow()-r.t;
  if(r.type==='romance'&&age>=8&&Math.random()<.07){n++;relSet(a,b,'engaged');story({icon:'💍',paper:'tabloid',who:[a,b],head:pick([`${esc(A.n)} and ${esc(B.n)} are engaged! The ring is said to be "the size of a box-office receipt".`,`${esc(A.n)} pops the question to ${esc(B.n)} on a yacht off Catalina.`,`Wedding bells? ${esc(B.n)} flashes a diamond at a premiere, and ${esc(A.n)} can't stop smiling.`]),life:`Got engaged to ${B.n}`,post:{h:pick(FANH),text:`${A.n} + ${B.n} ENGAGED?? 😭💍 I've shipped them since day one`}})}
  else if(r.type==='romance'&&age>=4&&Math.random()<.035){n++;relSet(a,b,'ex');story({icon:'💔',paper:'tabloid',who:[a,b],head:`It's over: ${esc(A.n)} and ${esc(B.n)} call it quits.`,life:`Split from ${B.n}`})}
  else if(r.type==='engaged'&&age>=5&&Math.random()<.14){n++;relSet(a,b,'married');story({icon:'🔔',paper:'courier',who:[a,b],head:pick([`${esc(A.n)} and ${esc(B.n)} marry in a private ceremony overlooking the Pacific.`,`${esc(A.n)} weds ${esc(B.n)} in Las Vegas at 2 a.m. "It just felt right."`,`Half of Hollywood attends the wedding of ${esc(A.n)} and ${esc(B.n)}.`]),life:`Married ${B.n}`,post:{h:pick(FANH),text:`The wedding photos of ${A.n} and ${B.n} have me in TEARS`}})}
  else if(r.type==='feud'&&Math.random()<.012){n++;if(Math.random()<.3){relSet(a,b,'friend');story({icon:'🤝',paper:'courier',who:[a,b],head:pick([`${esc(A.n)} and ${esc(B.n)} bury the hatchet over lunch. "Life's too short."`,`Truce! ${esc(A.n)} and ${esc(B.n)} hug it out at a premiere after-party.`,`${esc(A.n)} sends ${esc(B.n)} flowers, ending their long feud.`]),life:`Made peace with ${B.n}`})}else story({icon:'⚡',paper:'tabloid',who:[a,b],head:pick([`${esc(A.n)} takes another swipe at ${esc(B.n)} on a late-night talk show.`,`${esc(A.n)} walks out of a party the moment ${esc(B.n)} arrives.`,`"Talentless": ${esc(A.n)}'s verdict on ${esc(B.n)}, overheard at a restaurant.`]),life:`Publicly mocked ${B.n}`})}});
 /* new romance between people who've worked together, or met at a party */
 if(n<cap&&Math.random()<.10){const A=pick(pool),B=pick(pool.filter(x=>x!==A&&x.age>=18&&Math.abs(x.age-A.age)<15));if(A&&B&&A.age>=18&&!relOf(A.id,B.id)){n++;relSet(A.id,B.id,'romance');story({icon:'💕',paper:'tabloid',who:[A.id,B.id],head:`${esc(A.n)} and ${esc(B.n)} spotted holding hands at ${pick(['a gallery opening','a beach café in Malibu','a charity gala','a secret jazz club'])}.`,life:`Started dating ${B.n}`})}}
 /* burnout: too many films in a row */
 if(n<cap){const tired=P.actors.find(a=>isFamous(a,55)&&!busy(a)&&(S.films||[]).filter(f=>f.releaseT>tNow()-12&&allCast(f.cast).includes(a.id)).length>=3);if(tired&&Math.random()<.35){n++;tired.busy=tNow()+6;story({icon:'🌴',paper:'tabloid',who:[tired.id],head:`Exhausted ${esc(tired.n)} cancels all projects for six months: "I need to remember who I am."`,life:'Took a six-month break after burning out',dm:bondOf(tired)>=20?{p:tired.id,text:`Hey. I'm taking some time off. Not your fault, I just need to breathe. Save me a good role when I'm back? 🌴`}:null})}}
 /* scandal: if they're in one of your films, you must decide */
 if(n<cap&&Math.random()<.06){const x=pick(pool);const mine=(S.projects||[]).find(p=>p.cast&&p.sch&&(allCast(p.cast).includes(x.id)||p.dir===x.id)&&phaseOf(p)!=='ready');n++;
  const what=pick(['was photographed in a heated bar fight','was caught lying about their age','insulted a talk-show host live on air','was sued by a former assistant','left a restaurant without paying a $4,000 bill']);
  if(mine)QUEUE.push(()=>scandalMoment(x,mine,what));else{x.star=clamp((x.star||x.fame||40)-RI(2,6),3,99);story({icon:'📸',paper:'tabloid',who:[x.id],head:`${esc(x.n)} ${what}.`,post:{h:pick(FANH),text:`ok ${x.n} is CANCELLED 💀`}})}}
 /* old enemies: a grudge goes public */
 if(n<cap&&Math.random()<.05){const g=P.actors.concat(P.directors).find(x=>bondOf(x)<=-35&&!x.retired);if(g){n++;S.rep=Math.max(0,(S.rep||0)-1);story({icon:'🗯️',paper:'tabloid',who:[g.id],head:`${esc(g.n)} on ${esc(S.name)}: "They treat artists like furniture."`,life:`Badmouthed ${S.name} to the press`})}}
 /* loyal friends call with a favour */
 if(Math.random()<.07){const f=P.actors.concat(P.directors).find(x=>bondOf(x)>=45&&!busy(x)&&!x.retired&&!((x.favorNext||0)>tNow()));if(f){f.favor=tNow()+6;f.favorNext=tNow()+30;story({icon:'💛',paper:null,who:[f.id],head:`${esc(f.n)} says ${esc(S.name)} is "the best place in town to make a movie".`,life:`Offered ${S.name} a friends-and-family rate`,dm:{p:f.id,text:`I'd love to make another one with you. For the next six months my fee is 20% off. Don't tell my agent 😉`},inbox:['💛',f.n,'A favour from a friend',`${f.n} will work for <b>20% less</b> on any film you cast in the next 6 months.`]})}}
 /* rising stars from your hits are handled at release; January: milestones, retirements, farewells */
 if(S.month===0&&S.lw.yr[S.year]!==1){S.lw.yr[S.year]=1;
  const bd=pool.filter(x=>[50,60,70,80,90].includes(x.age)).sort((a,b)=>fam(b)-fam(a))[0];if(bd)story({icon:'🎂',paper:'courier',who:[bd.id],head:pick([`${esc(bd.n)} turns ${bd.age}. Friends throw a surprise party at the old Chateau.`,`Happy ${bd.age}th, ${esc(bd.n)}! A look back at a remarkable career.`,`${esc(bd.n)} celebrates ${bd.age} with a quiet dinner and a standing ovation.`]),life:`Celebrated turning ${bd.age}`,dm:bondOf(bd)>=30?{p:bd.id,text:`${bd.age} today! Thank you for the flowers 🌹`}:null});
  const old=P.actors.concat(P.directors).filter(x=>x.age>=88&&!(S.pimg&&S.pimg[x.id]!=null)&&!busy(x)&&Math.random()<.08).slice(0,1);
  old.forEach(x=>{const w=workedWith(x.id);story({icon:'🕯️',paper:'prestige',who:[x.id],head:`${esc(x.n)}, a screen legend for generations, has died at ${x.age}.`,life:`Passed away aged ${x.age}`,diary:w?['🕯️',`Farewell, ${x.n}`,`${x.n} made ${w} film${w>1?'s':''} with ${esc(S.name)}. The lot lowered its flags.`]:null,inbox:w?['🕯️',`The family of ${x.n}`,`Thank you`,`"${x.n.split(' ')[0]} always spoke warmly of the ${w} film${w>1?'s':''} made with your studio."`]:null});x.retired=1;x.busy=99999;x.dead=1})}}

function scandalMoment(x,p,what){const sc={who:x,role:p.title,tag:'Scandal',bg:'office',log:['📸',`Scandal: ${x.n}`],
 lines:[`<b>${esc(x.n)}</b> ${what}.`,`The press is camped outside the gates. <i>${esc(p.title)}</i> is ${PH[phaseOf(p)].toLowerCase()}.`,`"I'm sorry. Please don't drop me," ${esc(x.n.split(' ')[0])} says.`],
 choices:[{l:'Stand by them',sub:'Loyalty, but your reputation takes a hit',f:()=>{S.rep=Math.max(0,S.rep-2);bondAdd(x,18,`${S.name} stood by them in a scandal`);p.hype+=3;(p._why=p._why||[]).push(['📸',`You stood by ${x.n} through the scandal: notoriety brought extra curiosity`,1]);story({icon:'🛡️',paper:'tabloid',who:[x.id],head:`${esc(S.name)} stands by ${esc(x.n)}: "Everyone deserves a second chance."`});return{say:'"I won\'t forget this."',note:'Bond +18 · Reputation −2 · Hype +3'}}},
  {l:'Distance the studio',sub:'Protect the brand, but they\'ll resent it',f:()=>{S.rep=Math.min(100,S.rep+1);bondAdd(x,-22,`${S.name} publicly distanced itself from them`);p.hype-=2;(p._why=p._why||[]).push(['📸',`The ${x.n} scandal cast a shadow over the film`,-1]);story({icon:'📢',paper:'trade',who:[x.id],head:`${esc(S.name)} distances itself from ${esc(x.n)}.`});return{say:'"Wow. Okay."',note:'Bond −22 · Reputation +1'}}},
  {l:'Cut their screen time',sub:'Shrink the role in the edit',f:()=>{bondAdd(x,-35,`${S.name} cut their role after a scandal`);p.hype-=3;p.chem=(p.chem||0)-2;(p._why=p._why||[]).push(['✂️',`${x.n}'s role was cut after the scandal, hurting the story`,-1]);return{say:'"You\'ll regret this."',note:'Bond −35 · Chemistry −2'}}}]};
 playScene(sc,runQueue)}

/* ---------- on-set moments while filming ---------- */
function setTick(){const live=(S.projects||[]).filter(p=>p.cast&&p.sch&&phaseOf(p)==='shoot');if(!live.length||Math.random()>.16)return;const p=pick(live);const L=person(p.cast.lead),D=person(p.dir);if(!L||!D)return;
 const ids=allCast(p.cast).concat([p.dir]);let feud=null;for(let i=0;i<ids.length&&!feud;i++)for(let j=i+1;j<ids.length;j++){const r=relOf(ids[i],ids[j]);if(r&&r.type==='feud'){feud=[ids[i],ids[j]];break}}
 const why=(t,s)=>(p._why=p._why||[]).push(t.concat([s]));
 const opts=[()=>({who:L,lines:[`On the set of <i>${esc(p.title)}</i>, ${esc(L.n)} storms into your trailer.`,`"My big scene doesn't work. I want it rewritten, tonight."`],choices:[{l:`Pay for the rewrite (${M(.15*I())})`,f:()=>{S.cash-=.15*I();p.chem+=2;bondAdd(L,8,`${S.name} rewrote their big scene`);why(['✏️',`${L.n}'s rewritten big scene became a highlight`],1);return{say:'"Thank you. You\'ll see."',note:'Chemistry +2 · Bond +8'}}},{l:'Refuse',f:()=>{bondAdd(L,-10,`${S.name} refused their rewrite`);p.chem-=1;return{say:'"Fine. I\'ll just say the lines."',note:'Bond −10 · Chemistry −1'}}}]}),
  ()=>({who:D,lines:[`${esc(D.n)} has walked off the set of <i>${esc(p.title)}</i> after a shouting match with your line producer.`,`The crew is standing around. Every hour costs money.`],choices:[{l:'Drive over and calm them down',f:()=>{bondAdd(D,6,`${S.name} backed them on set`);return{say:'"Okay. Okay. Let\'s shoot."',note:'Bond +6'}}},{l:'Back your producer',f:()=>{bondAdd(D,-14,`${S.name} sided against them on set`);p.chem-=2;why(['🎬',`${D.n} never fully recovered from the on-set blow-up`],-1);return{say:'Silence on the phone.',note:'Bond −14 · Chemistry −2'}}}]}),
  feud?()=>{const A=person(feud[0]),B=person(feud[1]);return{who:A,lines:[`${esc(A.n)} refuses to share a scene with ${esc(B.n)}.`,`"Shoot us separately or I'm on the next plane."`],choices:[{l:`Shoot them separately (${M(.2*I())})`,f:()=>{S.cash-=.2*I();p.chem-=1;return{say:'"Thank you."',note:'Chemistry −1'}}},{l:'Lock them in a room until they talk',f:()=>{if(Math.random()<.5){relSet(A.id,B.id,'friend');p.chem+=4;why(['🤝',`${A.n} and ${B.n} ended their feud on set, and it shows on screen`],1);story({icon:'🤝',paper:'tabloid',who:[A.id,B.id],head:`Peace on set! ${esc(A.n)} and ${esc(B.n)} end their feud.`});return{say:'An hour later they come out laughing.',note:'Feud over! Chemistry +4'}}p.chem-=3;p.hype+=4;why(['⚡',`The ${A.n}–${B.n} brawl hurt the film but sold tickets`],0);story({icon:'⚡',paper:'tabloid',who:[A.id,B.id],head:`Chairs fly on the set of <i>${esc(p.title)}</i> as ${esc(A.n)} and ${esc(B.n)} clash.`});return{say:'You hear a chair hit the wall.',note:'Chemistry −3 · Hype +4 (tabloids love it)'}}}]}}:null].filter(Boolean);
 const sc=pick(opts)();sc.role=p.title;sc.tag='On set';sc.bg='set';sc.log=['🎬','On-set drama'];QUEUE.push(()=>playScene(sc,runQueue))}

/* ---------- rival studios act ---------- */
function rivalTick(){lwInit();const R2=(S.rivals||[]).filter(r=>r.alive);if(!R2.length)return;
 /* poaching your people */
 if(Math.random()<.06){const P=S.people;const x=P.actors.concat(P.directors).filter(y=>bondOf(y)>=20&&!busy(y)&&!y.retired&&isFamous(y,45)).sort((a,b)=>fam(b)-fam(a))[0];
  if(x){const r=pick(R2);const cost=+(P.actors.includes(x)?Math.max(.3*I(),actorFee(x)*.4):.5*I()).toFixed(2);
   QUEUE.push(()=>playScene({who:x,role:'',tag:'Rival offer',bg:'call',log:['🦈',`${r.n} tried to poach ${x.n}`],lines:[`It's ${esc(x.n)} on the phone.`,`"${esc(r.n)} just offered me an exclusive two-year deal. It's a lot of money."`,`"But I like working with you. Give me a reason to stay?"`],
    choices:[{l:`Match it (${M(cost)})`,f:()=>{S.cash-=cost;bondAdd(x,10,`${S.name} matched ${r.n}'s offer`);S.lw.grudge[r.n]=(S.lw.grudge[r.n]||0)+1;return{say:'"Then I\'m staying. 🎬"',note:`Bond +10 · ${r.n} is annoyed`}}},
     ...(bondOf(x)>=55?[{l:'Remind them what you built together',sub:'Free, if the bond is strong enough',f:()=>{if(Math.random()<.7){bondAdd(x,4,'Stayed loyal to '+S.name);return{say:'"You\'re right. I\'m not going anywhere."',note:'They stay, for free'}}x.busy=tNow()+18;story({icon:'🦈',paper:'trade',who:[x.id],head:`${esc(r.n)} lures ${esc(x.n)} away from ${esc(S.name)} with a rich exclusive deal.`});return{say:'"I\'m sorry. I have to take it."',note:'Gone to '+r.n+' for 18 months'}}}]:[]),
     {l:'Let them go',f:()=>{x.busy=tNow()+18;bondAdd(x,-5,`${S.name} let them go to ${r.n}`);story({icon:'🦈',paper:'trade',who:[x.id],head:`${esc(x.n)} signs an exclusive deal with ${esc(r.n)}.`});return{say:'"No hard feelings."',note:`Unavailable for 18 months`}}}]},runQueue))}}
 /* copycats after your hits */
 S.lw.pend=(S.lw.pend||[]).filter(e=>{if(e.at>tNow())return true;if(e.k==='copy'){const r=pick(R2);const t=tNow()+RI(7,10);const title=genTitle(e.g);S.rivalFilms.push({t,wk:RI(0,3),lead:null,dir:null,studio:r.n,g:e.g,title,hype:RI(60,105)});story({icon:'🐑',paper:'trade',head:`${esc(r.n)} rushes <i>${esc(title)}</i> into production, hoping to copy the success of ${esc(S.name)}'s <i>${esc(e.title)}</i>.`,diary:['🐑','Copycat',`${r.n} is copying ${e.title}. Their film arrives in about ${t-tNow()} months.`]})}return false});
 /* grudges turn into release-date wars */
 Object.entries(S.lw.grudge).forEach(([n,g])=>{if(g>=2&&Math.random()<.25){const p=(S.projects||[]).find(p=>p.releaseT>tNow()+1&&!p.cp);if(p){p.cp=1;S.lw.grudge[n]=g-1;const title=genTitle(p.genre);S.rivalFilms.push({t:p.releaseT,wk:p.relWk||0,studio:n,g:p.genre,title,hype:RI(95,130),cp:1});(p._why=p._why||[]).push(['⚔️',`${n}, still sore at you, dated ${title} against it`,-1]);story({icon:'⚔️',paper:'trade',head:`Out of spite? ${esc(n)} moves <i>${esc(title)}</i> onto the same weekend as ${esc(S.name)}'s <b>${esc(p.title)}</b>.`})}}});
 /* the rest of town has ups and downs */
 if(Math.random()<.05){const r=pick(R2);story({icon:pick(['📉','📈']),paper:'money',head:pick([`${esc(r.n)} posts heavy losses and lays off ${RI(80,400)} staff after a string of flops.`,`${esc(r.n)} shares jump after a surprise hit overseas.`,`${esc(r.n)} replaces its studio chief after a disastrous summer.`,`${esc(r.n)} sells its back catalogue to raise cash.`,`${esc(r.n)} announces a record slate of ${RI(12,24)} pictures next year.`])})}}

/* ---------- release: people remember, rivals react, and the report explains why ---------- */
releaseFilm=(function(o){return function(p){const why=(p._why||[]).slice();const ids=allCast(p.cast||{}).concat([p.dir]).filter(Boolean);
 try{for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const r=relOf(ids[i],ids[j]);if(!r)continue;const A=pname(ids[i]),B=pname(ids[j]);
  if(r.type==='feud')why.push(['⚡',`The feud between ${A} and ${B} hurt on-screen chemistry`,-1]);if(r.type==='romance'||r.type==='engaged')why.push(['💕',`Real-life couple ${A} and ${B} made audiences curious`,1]);if(r.type==='married')why.push(['💍',`Married co-stars ${A} and ${B} had easy chemistry`,1]);if(r.type==='ex')why.push(['💔',`Exes ${A} and ${B} on screen together: awkward, but tabloids loved it`,0])}
  const L=person(p.cast&&p.cast.lead);if(L){if(bondOf(L)>=40){p.chem=(p.chem||0)+2;why.push(['💛',`${L.n} gave everything for a studio they love`,1])}else if(bondOf(L)<=-35){p.chem=(p.chem||0)-3;why.push(['🧊',`${L.n} seemed to sleepwalk through the role`,-1])}}
  const clash=rivalsAt(tNow()).filter(r=>(r.wk||0)===(p.relWk||0)&&r.hype>85);clash.slice(0,1).forEach(r=>{if(!why.some(w=>w[0]==='⚔️'))why.push(['⚔️',`Opened against ${r.title} (${r.studio})`,-1])});
  if(ev('wga'))why.push(['✊','The writers\' strike kept rival releases thin',1]);
 }catch(e){}
 const f=o(p);
 try{if(f){const hit=(f.aud||0)>=70||(f.critic||0)>=78,flop=(f.aud||0)<45;f.why=why;
  ids.forEach(id=>{const x=person(id);if(!x)return;bondAdd(x,hit?10:flop?-6:3,hit?`Hit with ${S.name}: ${f.title}`:flop?`Flop with ${S.name}: ${f.title}`:null)});
  const L=person(p.cast&&p.cast.lead);
  if(hit&&L&&L.age>=50&&fam(L)<45){L.star=clamp((L.star||40)+12,3,99);f.why.push(['🌅',`Comeback of the year for ${L.n}`,1]);story({icon:'🌅',paper:'prestige',who:[L.id],head:`Comeback of the year: ${esc(L.n)} is back on top thanks to <i>${esc(f.title)}</i>.`,life:`Career comeback with ${f.title}`,dm:{p:L.id,text:`Everyone wrote me off. You didn't. Thank you. 🙏`}})}
  const sup=(p.cast&&p.cast.sup||[]).map(person).filter(x=>x&&fam(x)<40);if(hit&&sup.length){const s=sup[0];s.star=clamp((s.star||30)+8,3,99);story({icon:'🌟',paper:'trade',who:[s.id],head:`Breakout: everyone's talking about ${esc(s.n)} in <i>${esc(f.title)}</i>.`,life:`Breakout role in ${f.title}`})}
  if(hit){lwInit();S.lw.pend.push({at:tNow()+RI(1,3),k:'copy',g:f.genre,title:f.title});if(S.year>=2009)post(pick(FANH),`just saw ${f.title} and I'm not okay 😭🍿 go see it`,RI(5000,90000))}
  if(f.critic<35&&S.year>=2009)post(pick(FANH),`${f.title} is a crime against cinema 💀`,RI(2000,40000));
 }}catch(e){console.error(e)}return f}})(releaseFilm);

/* the results report explains why */
function whyCard(f){if(!f||!f.why||!f.why.length)return '';return `<div class="card why28"><b>Why it played this way</b>${f.why.slice(0,6).map(w=>`<div class="why28r ${w[2]>0?'up':w[2]<0?'dn':''}"><span>${w[0]}</span><span>${esc(w[1])}</span><i>${w[2]>0?'▲':w[2]<0?'▼':'•'}</i></div>`).join('')}</div>`}
filmReport=(function(o){return function(f,ctx){const r=o(f,ctx);try{setTimeout(()=>{const m=document.querySelector('#modal');if(m&&f&&f.why&&f.why.length&&!m.querySelector('.why28')){const cards=m.querySelectorAll('.card');const at=cards[1]||cards[0];if(at)at.insertAdjacentHTML('afterend',whyCard(f))}},30)}catch(e){}return r}})(filmReport);

/* ---------- people pages: a life story and your history together ---------- */
openPerson=(function(o){return function(id){o(id);try{const x=person(id);if(!x)return;const m=document.querySelector('#modal');if(!m)return;const w=workedWith(id);const b=bondOf(x);
 const bl=b>=60?['💛','Devoted to you','#1F9D5C']:b>=30?['🙂','Likes working with you','#1F9D5C']:b<=-35?['🧊','Holds a grudge','#D63A3F']:b<=-10?['😒','Wary of you','#B5821C']:['🤝','Neutral','#7a6c55'];
 const L=(x.life||[]).slice(0,10);
 m.querySelector('.modal>div,.modal').insertAdjacentHTML('beforeend',`<div class="card life28"><div class="row"><b>With ${esc(S.name)}</b><span style="color:${bl[2]};font-weight:800">${bl[0]} ${bl[1]}</span></div><small class="muted" style="text-transform:none;letter-spacing:0">${w} film${w===1?'':'s'} together${x.favor>tNow()?' · 20% friends rate active':''}${x.retired?' · retired':''}</small>
 ${L.length?`<div class="sec" style="margin-top:12px"><h2 style="font-size:15px">Life story</h2></div><div class="tl28">${L.map(e=>`<div><em>${e.y}</em><span>${e.i}</span><p>${esc(e.s)}</p></div>`).join('')}</div>`:''}</div>`)}catch(e){}}})(openPerson);
personCard=(function(o){return function(x,sel,onclick,isA,locked,extra){let h=o(x,sel,onclick,isA,locked,extra);try{const b=bondOf(x);const t=x.favor>tNow()?'<span class="tag good">💛 Friends rate −20%</span>':b>=40?'<span class="tag good">💛 Loyal to you</span>':b<=-35?'<span class="tag bad">🧊 Holds a grudge</span>':'';if(t)h=h.replace('<div class="tags">','<div class="tags">'+t)}catch(e){}return h}})(personCard);
actorFee=(function(o){return function(a){let f=o(a);try{if(a){if(a.favor>tNow())f*=.8;else if(bondOf(a)>=40)f*=.9;else if(bondOf(a)<=-35)f*=1.3}}catch(e){}return f}})(actorFee);

/* ---------- home: today's front page ---------- */
function frontPage(){lwInit();const pr={tabloid:6,trade:5,prestige:4,money:3,radical:3,courier:1};const rec=(S.lw.feed||[]).filter(e=>e.w>=wIdx()-3);const it=rec.sort((a,b)=>(pr[b.p]||0)-(pr[a.p]||0)||b.w-a.w)[0]||(S.lw.feed||[])[0];if(!it)return '';const p=NP.find(x=>x.k===it.p)||NP[5];
 return `<button class="fp28" onclick="newspaperView('${p.k}')"><div class="fp28m" style="font-family:${p.f};color:${p.c}">${p.n}</div><div class="fp28r"><span>${fmtDay(curDate())}</span><span>${npPrice()}</span></div><div class="fp28h">${esc(it.s.replace(/^[^\w"“$]+/u,''))}</div><small>Read the papers ›</small></button>`}
hq8=(function(o){return function(){let h=o();try{const fp=frontPage();if(fp){const k=h.indexOf('<h4 class="hh">On the slate');if(k>=0)h=h.slice(0,k)+`<h4 class="hh">Front page</h4>`+fp+h.slice(k)}}catch(e){}return h}})(hq8);
/* papers honour the story's paper */
npItems=(function(o){return function(k){const base=o(k);try{const tagged=(S.news||[]).filter(n=>n.p===k).map(n=>({t:n.t,s:npClean(n)}));const keys=new Set(tagged.map(n=>n.s));const mis=new Set((S.news||[]).filter(n=>n.p&&n.p!==k).map(n=>npClean(n)));return tagged.concat(base.filter(n=>!keys.has(n.s)&&!mis.has(n.s))).slice(0,12)}catch(e){return base}}})(npItems);

/* ---------- the clock ---------- */
const _nm28=nextMonth;nextMonth=function(){const r=_nm28.apply(this,arguments);try{if(S&&!S.over){lifeTick();rivalTick();setTick()}}catch(e){console.error(e)}return r};
