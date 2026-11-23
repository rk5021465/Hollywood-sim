/* ===== v29: Studio hub (Development · Production · Released · Catalogue · The Lot),
   staff writers + new-script form, staged production pipeline, released room, 4-tab film page ===== */
const E41=e=>{try{console.warn('v29',e)}catch(_){}};
const r41=(seed)=>{let s=hashStr(String(seed))>>>0||9;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}};
const f1=x=>(Math.round(x*10)/10).toFixed(1);
let ST41='rel';
function hubTabs41(cur){const T=[['dev','Development'],['prod','Production'],['rel','Released'],['cat','Catalogue'],['lot','The Lot']];
 return `<div class="hub41-t">${T.map(([k,l])=>`<button class="${cur===k?'on':''}" onclick="studio41('${k}')">${l}</button>`).join('')}</div>`}
function studio41(tab){tab=tab||ST41;ST41=tab;if(tab==='lot'){try{lotView()}catch(e){E41(e)}return}
 let body='';try{body=tab==='dev'?dev41():tab==='prod'?prodList41():tab==='cat'?cat41():rel41()}catch(e){E41(e);body='<p class="muted">Something went wrong loading this page.</p>'}
 const up=typeof overhead==='function'?overhead():0;
 modal(`<div class="hub41"><small class="hub41-k">YOUR STUDIO</small><div class="hub41-u">Upkeep <b>${M(up/4)}/wk</b> · ${S.films.filter(f=>f.kind!=='show').length} pictures released</div>${hubTabs41(tab)}${body}</div><button class="btn ghost" onclick="modal()">Close</button>`)}

/* ================= DEVELOPMENT ================= */
function wrStrong41(w){const r=r41('str'+w.id);const o=GENRES.filter(g=>g!==w.spec);const s=[w.spec||o[0]];if(r()<.75)s.push(o[Math.floor(r()*o.length)]);return s.filter(Boolean)}
function wrWeak41(w){const r=r41('wk'+w.id);const st=wrStrong41(w);if(r()<.35)return null;const o=GENRES.filter(g=>!st.includes(g));return o[Math.floor(r()*o.length)]}
const wrLv41=w=>clamp(Math.round((w.skill||50)/10),1,10);
const wrPay41=w=>+Math.max(.002,crewFee(w,'writers')*.05).toFixed(3);
function staff41(){S.wr41=(S.wr41||[]).filter(id=>person(id));return S.wr41}
const wrCap41=()=>Math.min(12,drCap()*2+2);
function wrBusy41(w){return (S.drafts||[]).some(d=>d.status==='writing'&&(d.writer===w.id||d.doc===w.id))}
function wrRow41(w,staff){const st=wrStrong41(w),wk=wrWeak41(w),b=wrBusy41(w);const d=(S.drafts||[]).find(x=>x.status==='writing'&&x.writer===w.id);
 return `<div class="wr41"><span class="wr41-i">${portrait(w,40)}</span><div class="wr41-m"><b>${esc(w.n)}</b> <small>· Lv ${wrLv41(w)} · ${MF(wrPay41(w))}/wk</small><em>Strong in ${st.join(', ')}${wk?` · <i>weak in ${wk}</i>`:''}</em><small class="muted">${b?`Writing <i>${esc(d?d.title:'a script')}</i>`:'Idle — ready to write'}</small></div>
 <div class="wr41-b">${staff?`<button class="wr41-go" ${b?'disabled':''} onclick="ns41('${w.id}')">START A SCRIPT</button><button class="wr41-x" onclick="wrFire41('${w.id}')">Let go</button>`:`<button class="wr41-go" onclick="wrHire41('${w.id}')">HIRE</button>`}</div></div>`}
function dev41(){const st=staff41().map(person).filter(Boolean);const ds=S.drafts||[];const act=ds.filter(d=>d.status==='writing'),fin=ds.filter(d=>d.status==='done');
 return `<h4 class="hh">Writers · ${st.length} of ${wrCap41()}</h4>${st.map(w=>wrRow41(w,1)).join('')||'<p class="muted" style="font-size:13px">No staff writers yet. Staff writers are paid every week and write your scripts for no extra fee.</p>'}
 <button class="add41" onclick="hireList41()">+ Hire a scriptwriter</button>
 <button class="add41 alt" onclick="ns41(null)">✍️ Commission a freelance writer</button>
 ${act.length?`<h4 class="hh">Being written</h4>${act.map(drCard).join('')}`:''}
 <h4 class="hh">Finished scripts</h4>${fin.map(drCard).join('')||'<p class="muted" style="font-size:13px">No finished scripts yet. Put a writer on one to build your library.</p>'}`}
function hireList41(){const st=staff41();const L=S.people.writers.filter(w=>!st.includes(w.id)&&!(typeof lockC==='function'&&lockC(w))).sort((a,b)=>b.skill-a.skill).slice(0,14);
 modal(`<h3>Hire a scriptwriter</h3><p class="muted" style="font-size:13px">Staff writers draw a weekly salary. In return every script they write for you costs nothing extra. Room for ${wrCap41()} (grows with your reputation).</p>${L.map(w=>wrRow41(w,0)).join('')}<button class="btn ghost" onclick="studio41('dev')">Back</button>`)}
function wrHire41(id){const st=staff41();if(st.length>=wrCap41())return toast('Your writers\' building is full');st.push(id);const w=person(id);addNews(`✍️ ${esc(S.name)} signs ${esc(w.n)} to its writing staff.`);save();studio41('dev')}
function wrFire41(id){S.wr41=staff41().filter(x=>x!==id);save();studio41('dev')}
function wrPayTick41(){try{const st=staff41();if(!st.length)return;const c=sum(st,id=>wrPay41(person(id)));S.cash-=c;try{if(typeof logTx==='function')logTx(-c,'Writing staff')}catch(e){}}catch(e){E41(e)}}
/* ---- the new-script form ---- */
const TONE41={Comedy:'light',Animation:'light',Romance:'light',Musical:'light',Horror:'dark',Thriller:'dark',Drama:'balanced',Biopic:'balanced',Action:'balanced','Sci-Fi':'balanced',Superhero:'balanced',Western:'dark',War:'dark',Fantasy:'light'};
let NS41=null;
function ns41(wid){const st=staff41();const w=wid?person(wid):null;NS41={writer:wid||null,genre:w?w.spec||'Drama':'Drama',scale:'medium',aud:'broad',tone:null,form:'standalone',acts:[],title:''};NS41.tone=TONE41[NS41.genre]||'balanced';NS41.title=genTitle(NS41.genre);nsView41()}
function nsSet41(k,v){NS41[k]=v;if(k==='genre'){NS41.tone=TONE41[v]||'balanced';NS41.title=genTitle(v)}nsView41()}
function nsAct41(id){const a=NS41.acts;const i=a.indexOf(id);if(i>=0)a.splice(i,1);else if(a.length<3)a.push(id);nsView41()}
function nsWeeks41(w){let wk=drWeeks(w,NS41.genre,'normal');wk+=NS41.scale==='large'?2:NS41.scale==='small'?-1:0;if(NS41.acts.length)wk+=1;if(NS41.form!=='standalone')wk+=1;return clamp(wk,3,20)}
function nsView41(){const c=NS41;const st=staff41();const w=c.writer?person(c.writer):null;const strong=w?wrStrong41(w):[];
 const seg=(k,opts)=>`<div class="ns41-s">${opts.map(([v,l])=>`<button class="${c[k]===v?'on':''}" onclick="nsSet41('${k}','${v}')">${l}</button>`).join('')}</div>`;
 const writers=(st.length?st.map(person):[]).concat(S.people.writers.filter(x=>!st.includes(x.id)&&!busy(x)).sort((a,b)=>b.skill-a.skill).slice(0,6)).filter(Boolean);
 const mine=S.people.actors.filter(a=>(a.star||0)>=35).sort((a,b)=>b.star-a.star).slice(0,10);
 const dt=TONE41[c.genre]||'balanced';
 const fee=w?(st.includes(w.id)?0:drFee(w,'normal')*(c.scale==='large'?1.3:c.scale==='small'?.8:1)):0;
 modal(`<div class="ns41"><small class="hub41-k">${w?esc(w.n.toUpperCase())+' · LEVEL '+wrLv41(w):'NEW SCRIPT'}</small><h3 style="margin:2px 0 10px">A new script</h3>
 <small class="ns41-l">WRITER</small><div class="ns41-g">${writers.map(x=>`<button class="${c.writer===x.id?'on':''}" ${wrBusy41(x)?'disabled':''} onclick="nsSet41('writer','${x.id}')"><b>${esc(x.n)}</b><small>Level ${wrLv41(x)}${st.includes(x.id)?' · staff':' · freelance'}${wrBusy41(x)?' · busy':''}</small></button>`).join('')}</div>
 ${w?`<small class="muted">Strong in ${strong.join(', ')}${wrWeak41(w)?' · weak in '+wrWeak41(w):''}</small>`:''}
 <small class="ns41-l">ORIGINAL OR FOLLOW-UP</small><div class="ns41-s"><button class="on">Original</button><button onclick="modal();startFilm();W.mode='seq';wiz()">Sequel</button><button onclick="modal();startFilm();W.mode='seq';wiz()">Spin-off</button></div>
 <small class="ns41-l">GENRE</small><div class="ns41-g3">${GENRES.map(g=>`<button class="${c.genre===g?'on':''}" onclick="nsSet41('genre','${g}')">${g}${strong.includes(g)?' ★':''}</button>`).join('')}</div>
 <div class="ns41-h"><small class="ns41-l">SCALE</small><small class="muted">sets the budget</small></div>${seg('scale',[['small','Small'],['medium','Medium'],['large','Large']])}
 <small class="ns41-l">AUDIENCE</small>${seg('aud',[['family','Family'],['broad','Broad'],['adult','Adult']])}
 <div class="ns41-h"><small class="ns41-l">TONE</small><small class="muted">${c.genre} is usually ${dt}</small></div>${seg('tone',[['light','Light'],['balanced','Balanced'],['dark','Dark']])}
 <div class="ns41-h"><small class="ns41-l">WRITE THE LEAD FOR… (OPTIONAL)</small><small class="muted">up to 3</small></div>
 <div class="ns41-a">${mine.map(a=>`<button class="${c.acts.includes(a.id)?'on':''}" onclick="nsAct41('${a.id}')">${portrait(a,44)}<small>${esc(a.n.split(' ')[0])}</small></button>`).join('')}</div>
 <small class="muted">The writer builds the role around them: gender, age, look and the skill they're best at. They fit it better and are glad of it. Writing takes 1 week longer.</small>
 <small class="ns41-l">FORM</small>${seg('form',[['standalone','Standalone'],['franchise','Franchise'],['trilogy','Trilogy']])}
 <small class="ns41-l">TITLE</small><div class="ns41-ti"><input type="text" maxlength="40" value="${esc(c.title)}" oninput="NS41.title=this.value"><button onclick="nsSet41('title',genTitle(NS41.genre))">↻</button></div>
 <p class="muted" style="font-size:13px;margin-top:10px">${w?`The script takes ${nsWeeks41(w)} weeks${fee?` and costs ${M(fee)}`:' (staff writer: no fee)'}. `:'Pick a writer. '}Quality leans on your writer's level but it's a gamble — you'll see the result when it's done.</p>
 <button class="btn gold" ${w&&!wrBusy41(w)?'':'disabled'} onclick="nsGo41()">START WRITING</button><button class="btn ghost" onclick="studio41('dev')">Back</button></div>`)}
function nsGo41(){const c=NS41;const w=person(c.writer);if(!w)return;if(drActive().length>=Math.max(drCap(),staff41().length+1))return toast('Your writers\' rooms are full');
 const st=staff41().includes(w.id);const fee=st?0:+(drFee(w,'normal')*(c.scale==='large'?1.3:c.scale==='small'?.8:1)).toFixed(2);if(fee&&S.cash<fee-creditLimit())return toast('Not enough cash');
 const brief=c.form!=='standalone'?'franchise':(c.aud==='adult'&&c.tone!=='light'?'prestige':'crowd');const wk=nsWeeks41(w);
 const d={id:S.id++,title:(c.title||genTitle(c.genre)).trim()||genTitle(c.genre),genre:c.genre,brief,speed:'normal',writer:w.id,fee,startW:absW(),doneW:absW()+wk,status:'writing',kind:'draft',rewrites:0,log:[],ns:{scale:c.scale,aud:c.aud,tone:c.tone,form:c.form,acts:c.acts.slice(),staff:st}};
 if(fee){S.cash-=fee;try{if(typeof logTx==='function')logTx(-fee,'Script: '+d.title)}catch(e){}}
 w.busy=Math.max(w.busy||-1,Math.floor(d.doneW/4));S.drafts=S.drafts||[];S.drafts.push(d);addNews(`✍️ ${esc(w.n)} starts writing <i>${esc(d.title)}</i> for ${esc(S.name)}.`);save();toast(`✍️ ${esc(w.n)} starts writing · ${wk} weeks`);studio41('dev')}
/* fold the form's choices into the finished draft */
drFinish=(function(o){return function(d){const ns=d&&d.kind==='draft'?d.ns:null;o.apply(this,arguments);try{if(!ns||!d.sc)return;const sc=d.sc,g=d.genre,dt=TONE41[g]||'balanced';
  if(ns.tone===dt){sc.commercial+=4;sc.hook+=3}else if((ns.tone==='light'&&dt==='dark')||(ns.tone==='dark'&&dt==='light')){sc.commercial-=4;sc.originality+=6}else sc.originality+=2;
  if(ns.aud==='family'){sc.commercial+=['Animation','Comedy','Fantasy','Superhero'].includes(g)?5:-2;sc.awards-=3}if(ns.aud==='adult'){sc.awards+=['Drama','Thriller','Biopic','War','Western'].includes(g)?5:0;sc.commercial-=3}
  if(ns.scale==='large'){sc.commercial+=4;sc.hook+=2}if(ns.scale==='small'){sc.originality+=3;sc.commercial-=2}
  if(ns.acts&&ns.acts.length)sc.characters+=3;if(wrStrong41(person(d.writer)||{}).includes(g))sc.story+=3;if(wrWeak41(person(d.writer)||{})===g){sc.story-=6;sc.dialogue-=4}
  Object.keys(sc).forEach(k=>sc[k]=clamp(Math.round(sc[k]),5,99));d.scObj=null;const s=drScript(d);
  const w=person(d.writer);urgentCall('Office Memo',`${d.title} delivered`,`"${esc(w?w.n:'Your writer')} has delivered <b>${esc(d.title)}</b> (${g}), rated ${s.q}/100. You'll find it under Studio › Development."`,`studio41('dev')`)}catch(e){E41(e)}}})(drFinish);
drScript=(function(o){return function(d){const s=o.apply(this,arguments);try{if(d.ns){s.forActs=d.ns.acts||[];s.scale41=d.ns.scale;s.aud41=d.ns.aud;s.tone41=d.ns.tone;if(d.ns.form==='trilogy'){s.trilogy=true;s.base=s.base||d.title;s.fr=Math.max(s.fr||0,.7)}if(d.ns.form==='franchise')s.fr=Math.max(s.fr||0,.7);if(d.ns.scale==='large')s.hype=(s.hype||0)+3}}catch(e){}return s}})(drScript);
actorFee=(function(o){return function(a){const f=o(a);try{if(typeof W!=='undefined'&&W&&W.script&&W.script.forActs&&a&&W.script.forActs.includes(a.id))return f*.88}catch(e){}return f}})(actorFee);

/* ================= PRODUCTION PIPELINE ================= */
const PRE41={prep:[['rushed','Rushed · 2'],['standard','Standard · 4'],['thorough','Thorough · 6']],reh:[['none','None'],['1','1 week'],['2','2 weeks']],pol:[['no','No'],['dir','Director rewrites'],['doc','Script doctor']],loc:[['backlot','Backlot'],['mixed','Mixed'],['location','On location']]};
function pp41(p){if(!p.pp)p.pp={prep:'standard',reh:'1',pol:'no',loc:'mixed',sets:1,days:1,crew:1,stunts:1,say:'shared',music:p.comp?'house':'library',fx:1,edit:1,camp:6,mix:null,dq:0,cost:{pre:0,shoot:0,post:0},act:{},log:[],dailies:[],seen:{}};return p.pp}
const vfx41=p=>(GEN[p.genre]&&GEN[p.genre].vfx)||.3;
const stuntG41=g=>['Action','Superhero','Sci-Fi','War','Western','Fantasy'].includes(g);
function dq41(p){const c=pp41(p);const d=person(p.dir);const L=Math.log2;let q=0;
 q+={rushed:-2.5,standard:0,thorough:2}[c.prep]||0;q+={none:-1,'1':0,'2':1.5}[c.reh]||0;q+={no:0,dir:d?clamp((d.skill-60)/12,-1.5,2):0,doc:2}[c.pol]||0;q+={backlot:-1.5,mixed:0,location:2}[c.loc]||0;
 q+=clamp(3*L(c.sets),-3,4)*(.4+.6*vfx41(p));q+=clamp(4*L(c.days),-4,2.5);q+=clamp(2.5*L(c.crew),-2.5,3);if(stuntG41(p.genre))q+=clamp(2*L(c.stunts),-2,2.5);
 q+={studio:-1.5,shared:0,director:1.5}[c.say]||0;q+={library:-1.5,house:0,star:2.5}[c.music]||0;q+=clamp(3*L(c.fx),-3,4)*vfx41(p);q+=clamp(2*L(c.edit),-2,2.5);return +q.toFixed(2)}
function cost41(p){const c=pp41(p);const s=p.spend||10;const L={pre:0,shoot:0,post:0};
 L.pre+={rushed:-s*.03,standard:0,thorough:s*.08}[c.prep]||0;L.pre+={none:-s*.006,'1':0,'2':(p.fees||1)*.06}[c.reh]||0;L.pre+=c.pol==='doc'?Math.max(.08,s*.03):0;L.pre+={backlot:-s*.03,mixed:0,location:s*.07}[c.loc]||0;L.pre+=s*.12*(c.sets-1);
 L.shoot+=s*.15*(c.days-1)+s*.05*(c.crew-1)+(stuntG41(p.genre)?s*.04*(c.stunts-1):0);
 L.post+={library:-s*.01,house:0,star:Math.max(.1,s*.03)}[c.music]||0;L.post+=s*.1*vfx41(p)*(c.fx-1)+s*.03*(c.edit-1);return L}
function readiness41(p){const c=pp41(p);let r=58+({rushed:-15,standard:0,thorough:12}[c.prep]||0)+({none:-6,'1':4,'2':8}[c.reh]||0)+({no:0,dir:3,doc:7}[c.pol]||0)+({backlot:4,mixed:0,location:-4}[c.loc]||0)+Math.round(Math.log2(c.sets)*4);
 try{r+=(lotLv('screening')||0)*1.5+(lotLv('workshop')||0)*1.5}catch(e){}return clamp(Math.round(r),8,99)}
function qNow41(p){const g=GEN[p.genre];const ib=g.budget*inf(p.startT||tNow());const qb=clamp(16*Math.log2(Math.max(.05,(p.prod||ib)/ib)),-28,9)*(0.3+0.7*g.vfx);return (p.q||50)+(p.chem||0)+qb}
function fc41(p){const ph=phaseOf(p),c=pp41(p);const q=qNow41(p)+((p.cut==='director')?4:(p.cut==='studio')?-3:0)+(p.fest?3:0)-1;
 const w=c.tested?4:ph==='post'||ph==='ready'?6:ph==='shoot'?7:6+(100-readiness41(p))/12;return[Math.round(clamp(q-w,2,99)),Math.round(clamp(q+w,3,99))]}
/* apply a choice: re-price & re-score */
function ppSet41(id,k,v,tab){const p=S.projects.find(x=>x.id===id);if(!p)return;const c=pp41(p);const oq=dq41(p),oc=cost41(p);
 const old=c[k];c[k]=(typeof c[k]==='number'||['sets','days','crew','stunts','fx','edit','camp'].includes(k))?+v:v;
 if(k==='prep'){if(v==='thorough'&&old!=='thorough'){p.sch.pre++;p.sch.total++;if(p.dist!=='stream'&&p.startT+p.sch.total>p.releaseT){p.releaseT=p.startT+p.sch.total;p.relWk=0}}if(old==='thorough'&&v!=='thorough'&&p.sch.pre>2){p.sch.pre--;p.sch.total--}}
 const nq=dq41(p),nc=cost41(p);p.q=+(p.q+nq-oq).toFixed(2);c.dq=nq;
 ['pre','shoot','post'].forEach(ph=>{const d=+(nc[ph]-oc[ph]).toFixed(3);if(d){const own=1-(p.cofi||0);S.cash-=d*own;p.paid+=d*own;c.cost[ph]=+((c.cost[ph]||0)+d*own).toFixed(3)}});
 if(k==='say')p.hype=(p.hype||0)+({studio:3,shared:0,director:-1}[v]||0)-({studio:3,shared:0,director:-1}[old]||0);
 save();pipe41(id,tab)}
function ppMix41(id,ch,lv){const p=S.projects.find(x=>x.id===id);if(!p)return;const c=pp41(p);mixInit41(p);c.mix[ch]=+lv;p.mkt=+mktOf41(p).toFixed(2);c.mixTouched=1;save();pipe41(id,'rel')}
function chans41(){const y=S.year;const L=[['post','Posters & billboards','everyone',.16],['news','Newspapers & magazines','adults',.14],['trail','Cinema trailer','moviegoers',.14],['radio','Radio','broad',.1],['tv','TV spots','broad, families · strongest now',.22],['junk','Press junket & talk shows','fame of your stars',.08],['prem','Red-carpet premiere','hype for the cast',.06]];
 if(y>=1997)L.push(['web','Internet ads','younger audiences',.08]);if(y>=2009)L.push(['soc','Social media','young, fast word of mouth',.1]);if(y>=2015)L.push(['inf','Influencers','teens & twenties',.06]);if(y>=1997)L[4][2]='broad, families';if(y>=2009)L.find(x=>x[0]==='soc')[2]+=' · strongest now';return L}
function mixInit41(p){const c=pp41(p);if(c.mix)return;c.mix={};chans41().forEach(([k])=>c.mix[k]=2);const raw=sum(chans41(),([k,, ,w])=>w*2);c.mixK=(p.mkt||1)/raw}
function mktOf41(p){const c=pp41(p);return c.mixK*sum(chans41(),([k,, ,w])=>w*(c.mix[k]||0))}
function aware41(p){const c=pp41(p);const base=(GEN[p.genre].budget||20)*inf(p.releaseT||tNow())*.35;const lenF={2:.72,4:.9,6:1,8:.96}[c.camp]||1;let a=16+70*(1-Math.exp(-(p.mkt||0)/base))*lenF;try{a+=(lotLv('premiere')||0)*2}catch(e){}return clamp(Math.round(a),4,99)}
const stage41=p=>({pre:0,shoot:1,post:2,ready:3})[phaseOf(p)];
function bar41(v,c){return `<span class="b41"><i style="width:${clamp(v,0,100)}%;${c?'background:'+c:''}"></i></span>`}
function slider41(id,k,v,lo,hi,tab,dis){return `<input type="range" class="sl41" min="${lo}" max="${hi}" step="0.1" value="${v}" ${dis?'disabled':''} onchange="ppSet41(${id},'${k}',this.value,'${tab}')">`}
function seg41(id,k,opts,cur,tab,dis){return `<div class="ns41-s">${opts.map(([v,l])=>`<button class="${cur===v?'on':''}" ${dis?'disabled':''} onclick="ppSet41(${id},'${k}','${v}','${tab}')">${l}</button>`).join('')}</div>`}
const fit41=g=>{const n=Math.round(clamp((GEN[g].vfx||.3)*5,1,5));return '●'.repeat(n)+'○'.repeat(5-n)};
function pipe41(id,tab){const p=S.projects.find(x=>x.id===id);if(!p)return studio41('prod');const c=pp41(p);const st=stage41(p);
 tab=tab||['pre','prod','post','rel'][st];const T=[['pre','PRE-\nPRODUCTION',0],['prod','PRODUCTION',1],['post','POST-\nPRODUCTION',2],['rel','RELEASE',3]];
 const head={pre:'PRE-PRODUCTION',prod:'SHOOTING',post:'POST-PRODUCTION',rel:'RELEASE'}[tab];const mo=p.sch?Math.max(0,tNow()-p.startT):0;
 const fc=fc41(p);let h='';const own=1-(p.cofi||0);
 if(tab==='pre'){const dis=st>0;const r=readiness41(p);
  h+=`<small class="ns41-l">PREPARATION${dis?' · locked':''}</small>
  <div class="pp41-r"><span>Prep time</span><b>${{rushed:'2',standard:'4',thorough:'6'}[c.prep]} weeks</b></div>${seg41(id,'prep',PRE41.prep,c.prep,'pre',dis)}<small class="muted">More prep: a smoother shoot. Thorough adds a month to the schedule.</small>
  <div class="pp41-r"><span>Rehearsals</span><b>${c.reh==='none'?'None':c.reh+' week'+(c.reh==='2'?'s':'')}</b></div>${seg41(id,'reh',PRE41.reh,c.reh,'pre',dis)}<small class="muted">Acting ${c.reh==='2'?'+3':c.reh==='1'?'+1':'−1'}. The cast is booked a little longer.</small>
  <div class="pp41-r"><span>Script polish</span><b>${{no:'No',dir:'Director',doc:'Doctor'}[c.pol]}</b></div>${seg41(id,'pol',PRE41.pol,c.pol,'pre',dis)}<small class="muted">${c.pol==='no'?'The script is shot as it is.':c.pol==='dir'?'The director reshapes it to their taste.':'A script doctor tightens the weakest scenes.'}</small>
  <div class="pp41-r"><span>Locations</span><b>${{backlot:'Backlot',mixed:'Mixed',location:'On location'}[c.loc]}</b></div>${seg41(id,'loc',PRE41.loc,c.loc,'pre',dis)}<small class="muted">${c.loc==='backlot'?'Cheaper and safer, but it looks like a set.':c.loc==='mixed'?'Some days out, most on the lot.':'Real places look great; more can go wrong.'}</small>
  <div class="pp41-r"><span>Sets & costumes</span><b>${f1(c.sets)}× · ${M(Math.max(0,(p.spend||0)*.08*c.sets))}</b></div>${slider41(id,'sets',c.sets,.5,3,'pre',dis)}<small class="muted">${fit41(p.genre)} for ${p.genre}</small>
  <div class="pp41-c"><div class="pp41-r"><b>Readiness</b><span>${r} · ${r>=85?'excellent':r>=65?'good':r>=45?'shaky':'risky'}</span></div>${bar41(r,r>=65?'#3BA55C':r>=45?'#D9A21B':'#D0393B')}<small class="muted">${r>=85?'Hardly any surprises expected on the shoot.':r>=65?'Few surprises expected on the shoot.':'Expect trouble on set.'} Critics now: ${fc[0]}–${fc[1]}.</small></div>`}
 if(tab==='prod'){const dis=st>1;const dl=c.dailies||[];const last=dl[dl.length-1];
  h+=st<1?`<p class="muted" style="font-size:13px">Cameras roll in ${Math.max(1,p.sch.pre-mo)} month${p.sch.pre-mo>1?'s':''}. Plan the shoot now.</p>`:'';
  if(st>=1){h+=`<small class="ns41-l">DAILIES</small><div class="pp41-c"><div class="pp41-r"><b>So far</b><small class="muted">critics ${fc[0]}–${fc[1]}</small></div>${last?`<small>Acting</small>${bar41(last.a,'#E0B04A')}<small>Direction</small>${bar41(last.d,'#E0B04A')}<small>Production</small>${bar41(last.p,'#E0B04A')}`:'<small class="muted">The first dailies arrive at the end of this month.</small>'}</div>
   <div class="pp41-c"><div class="pp41-r"><span>Shoot budget</span><b>${M((p.spend||0)*p.sch.shoot/p.sch.total+(c.cost.shoot||0))}</b></div><div class="pp41-r"><span>Spent so far</span><b>${M(p.paid)}</b></div></div>
   ${c.log.length?`<small class="ns41-l">ON THE SET</small>${c.log.slice(-4).map(x=>`<div class="pp41-l">${x}</div>`).join('')}`:''}`}
  h+=`<small class="ns41-l">THE SHOOT${dis?' · wrapped':''}</small>
  <div class="pp41-r"><span>Shooting days</span><b>${f1(c.days)}× · ${M((p.spend||0)*.15*c.days)}</b></div>${slider41(id,'days',c.days,.7,1.5,'prod',dis)}<small class="muted">${fit41(p.genre)} for ${p.genre}</small>
  <div class="pp41-r"><span>Crew</span><b>${f1(c.crew)}× · ${M((p.spend||0)*.05*c.crew)}</b></div>${slider41(id,'crew',c.crew,.5,3,'prod',dis)}
  ${stuntG41(p.genre)?`<div class="pp41-r"><span>Stunts</span><b>${f1(c.stunts)}× · ${M((p.spend||0)*.04*c.stunts)}</b></div>${slider41(id,'stunts',c.stunts,.5,3,'prod',dis)}`:''}
  <div class="pp41-r"><span>Final say</span><b>${{studio:'Studio',shared:'Shared',director:'The director'}[c.say]}</b></div>${seg41(id,'say',[['studio','Studio'],['shared','Shared'],['director','The director']],c.say,'prod',dis)}<small class="muted">${c.say==='studio'?'You call the shots: safer, more commercial.':c.say==='shared'?'Studio and director decide together.':'The director\'s vision, warts and all: critics like it, budgets suffer.'}</small>`}
 if(tab==='post'){const dis=st>2&&!!p.released;const canTest=st>=2&&!c.tested;
  h+=st<2?`<p class="muted" style="font-size:13px">Post-production starts in ${Math.max(1,p.sch.pre+p.sch.shoot-mo)} month(s). You can plan it now.</p>`:'';
  h+=`<small class="ns41-l">THE CUT</small><div class="pp41-r"><span>Cut</span><b>${{director:"Director's cut",balanced:'Balanced',studio:'Studio cut'}[p.cut||'balanced']}</b></div>
  <div class="ns41-s">${[['director',"Director's cut"],['balanced','Balanced'],['studio','Studio cut']].map(([v,l])=>`<button class="${(p.cut||'balanced')===v?'on':''}" onclick="cut41(${id},'${v}')">${l}</button>`).join('')}</div><small class="muted">${p.cut==='director'?'Critics +4, a harder sell.':p.cut==='studio'?'Critics −3, friendlier to crowds.':'Critics ±0, audience ±0.'}</small>
  <small class="ns41-l">DEPARTMENTS</small><div class="pp41-r"><span>Music</span><b>${{library:'Library',house:'House composer',star:'Star composer'}[c.music]}</b></div>${seg41(id,'music',[['library','Library'],['house','House composer'],['star','Star composer']],c.music,'post',dis)}
  <div class="pp41-r"><span>Special effects</span><b>${f1(c.fx)}× · ${M((p.spend||0)*.1*vfx41(p)*c.fx)}</b></div>${slider41(id,'fx',c.fx,.5,3,'post',dis)}<small class="muted">${fit41(p.genre)} for ${p.genre}</small>
  <div class="pp41-r"><span>Editing</span><b>${f1(c.edit)}× · ${M((p.spend||0)*.03*c.edit)}</b></div>${slider41(id,'edit',c.edit,.5,2,'post',dis)}
  <small class="ns41-l">TEST SCREENING</small>${c.tested?`<div class="pp41-c"><b>Critics ${fc[0]}–${fc[1]} · audience ${p.test}%</b><small class="muted" style="display:block">Weakest: ${c.weak||'—'}</small></div>
   ${!p.reshot&&st<3?`<button class="opt41" onclick="reshoot41(${id})"><b>Reshoots</b><small>+${M((p.spend||0)*.08)} · +1 month · ${c.weak||'the weak spots'} improve</small></button>`:''}
   ${p.cut!=='director'?`<button class="opt41" onclick="cut41(${id},'director')"><b>Re-cut as Director's cut</b><small>Critics +4 · audience −8%</small></button>`:''}
   ${p.cut!=='studio'?`<button class="opt41" onclick="cut41(${id},'studio')"><b>Re-cut as Studio cut</b><small>Critics −3 · audience +8%</small></button>`:''}
   <button class="opt41" onclick="pipe41(${id},'rel')"><b>Release as it is</b><small>On to marketing and the release</small></button>`
   :canTest?`<p class="muted" style="font-size:13px">${lotLv('screening')?'In your own screening room: cheaper, and the result is more precise.':'Rent a cinema and show it to a paying crowd.'}</p><button class="btn gold" onclick="test41(${id})">HOLD A TEST SCREENING · ${M(Math.max(.005,(lotLv('screening')?.005:.02)*I()))}</button>`:'<p class="muted" style="font-size:13px">Available once the film is in post-production.</p>'}
  <small class="ns41-l">POSTER</small><div class="pp41-c pp41-pos">${posterSVG(p,70,p.poster||defaultPoster(p))}<div>${p.poster?`<small class="muted">POSTER QUALITY</small><b class="big">${posterScore(p,p.poster).score}</b>`:'<small class="muted">No poster yet</small>'}<button class="btn sm ghost" onclick="posterDesigner(${id})">${p.poster?'Change the poster':'Design the poster'} ›</button></div></div>`}
 if(tab==='rel'){mixInit41(p);const aw=aware41(p);const ch=chans41();const lv=['○○○','●○○','●●○','●●●'];const camp=c.camp||6;
  h+=`<small class="ns41-l">CAMPAIGN</small><div class="pp41-r"><span>Starts before the release</span><b>${camp} weeks</b></div><div class="ns41-s">${[2,4,6,8].map(w=>`<button class="${camp===w?'on':''}" onclick="ppSet41(${id},'camp',${w},'rel')">${w} weeks</button>`).join('')}</div><small class="muted">Too short and people haven't heard of it; too early and they've forgotten by opening night.</small>
  ${ch.map(([k,l,sub,w])=>`<div class="mx41"><div><b>${l}</b><small>${sub}</small></div><div class="mx41-l">${[0,1,2,3].map(n=>`<button class="${(c.mix[k]||0)>=n&&n>0?'on':''}${(c.mix[k]||0)===0&&n===0?' z':''}" onclick="ppMix41(${id},'${k}',${n})">${n?'':'×'}</button>`).join('')}</div><span>${M(c.mixK*w*(c.mix[k]||0))}</span></div>`).join('')}
  <div class="pp41-c"><div class="pp41-r"><b>Awareness at release</b><b>${aw}%</b></div>${bar41(aw,'#E08A2B')}<div class="pp41-r" style="margin-top:6px"><span>Campaign</span><b>${M(p.mkt||0)}</b></div><small class="muted">Paid at release · reaches audiences, not critics.</small></div>
  <small class="ns41-l">RELEASE</small>${cal41(p)}
  ${['wide','platform'].includes(p.dist)?`<div class="pp41-r"><span>Release</span><b>${p.dist==='wide'?'Wide':'Platform'}</b></div><div class="ns41-s"><button class="${p.dist==='wide'?'on':''}" onclick="dist41(${id},'wide')">Wide</button><button class="${p.dist==='platform'?'on':''}" onclick="dist41(${id},'platform')">Platform (slow start)</button></div><small class="muted">Platform: a lower opening and a longer run, a bigger chance of a sleeper hit and a better awards campaign. Good for small pictures the critics love.</small>`:''}`}
 MKEEP=true;modal(`<div class="pp41"><small class="hub41-k">${head}${tab==='prod'&&st===1?` · MONTH ${mo-p.sch.pre+1} OF ${p.sch.shoot}`:''}</small><h3>“${esc(p.title)}”</h3>
 <div class="pp41-t">${T.map(([k,l,i])=>`<button class="${tab===k?'on':''}${i<st?' done':''}" onclick="pipe41(${id},'${k}')">${i<st?'✓ ':''}${l.replace('\n','<br>')}</button>`).join('')}</div>${h}
 <div class="pp41-r" style="margin-top:12px"><span class="muted">Spent on this picture</span><b>${M(p.paid)}</b></div></div><button class="btn ghost" onclick="modal()">Close</button>`)}
function cut41(id,v){const p=S.projects.find(x=>x.id===id);if(!p)return;p.cut=v;save();pipe41(id,'post')}
function dist41(id,v){const p=S.projects.find(x=>x.id===id);if(!p)return;p.dist=v;save();pipe41(id,'rel')}
function test41(id){const p=S.projects.find(x=>x.id===id);if(!p)return;const c=pp41(p);const cost=Math.max(.005,(lotLv('screening')?.005:.02)*I());S.cash-=cost;p.paid+=cost;c.cost.post=(c.cost.post||0)+cost;
 const sub=sub41p(p);const ks=Object.keys(sub).sort((a,b)=>sub[a]-sub[b]);c.weak=({script:'Script',dir:'Direction',act:'Acting',prod:'Production'})[ks[0]]+' ('+Math.round(sub[ks[0]]*10)+')';
 c.tested=1;p.test=Math.round(clamp(qNow41(p)+(p.cut==='studio'?8:p.cut==='director'?-8:0)+R(-5,5),15,99));save();pipe41(id,'post')}
function reshoot41(id){const p=S.projects.find(x=>x.id===id);if(!p)return;const before=p.paid;try{reshoot(id)}catch(e){E41(e)}const c=pp41(p);c.cost.post=(c.cost.post||0)+(p.paid-before);c.log.push('Reshoots booked to fix '+(c.weak||'the weak spots')+'.');modal();save();pipe41(id,'post')}
function cal41(p){const ready=p.startT+p.sch.total;const t0=Math.max(tNow()+(S.wk>=3?1:0),ready);let h='<div class="cal41">';const cur=p.releaseT*4+(p.relWk||0);
 for(let i=0;i<15;i++){const t=t0+Math.floor(i/4)+(i>=12?0:0),wk=i%4;const m=((t%12)+12)%12;const riv=rivalsAt(t).filter(r=>(r.wk||0)===wk);const big=riv.find(r=>r.hype>85&&r.g===p.genre)||riv.sort((a,b)=>b.hype-a.hype)[0];
  const tag=m>=4&&m<=6?'summer':m===10||m===11?'holiday':m===0?'Jan −10%':'';const d=new Date(START_YEAR+Math.floor(t/12),m,1+wk*7);
  h+=`<button class="${t*4+wk===cur?'on':''}" onclick="relSet41(${p.id},${t},${wk})"><b>${d.getDate()} ${MON[m]}</b><small>${big?esc(big.title.length>12?big.title.slice(0,11)+'…':big.title):tag||'&nbsp;'}</small></button>`}
 const riv=rivalsAt(p.releaseT).filter(r=>(r.wk||0)===(p.relWk||0));
 return h+`</div><div class="pp41-c"><b>${fmtLong(relD(p))}</b>${riv.length?riv.slice(0,3).map(r=>`<small class="${r.g===p.genre?'neg':'muted'}" style="display:block">${r.g===p.genre?'✗':'·'} ${esc(r.studio)}'s <i>${esc(r.title)}</i> (${r.g}) opens the same week</small>`).join(''):'<small class="pos" style="display:block">✓ No big picture the same week</small>'}</div>`}
function relSet41(id,t,wk){const p=S.projects.find(x=>x.id===id);if(!p)return;if(t<p.startT+p.sch.total)return toast('It won\'t be finished by then');if(t*4+wk<=wIdx())return toast('That week has passed');p.releaseT=t;p.relWk=wk;p.relDate=null;try{applyHol(p)}catch(e){}save();pipe41(id,'rel')}
/* sub-scores (0–10) for a project */
function sub41p(p){const sk=id=>{const x=person(id);return x?x.skill:55};const cs=castStats(p);const c=pp41(p);const ib=GEN[p.genre].budget*inf(p.startT||tNow());
 return{script:clamp(((p.scq||sk(p.writer))*.75+qNow41(p)*.25+({no:0,dir:1,doc:3}[c.pol]||0))/10,1,9.9),dir:clamp((sk(p.dir)*.5+qNow41(p)*.5+({studio:-2,shared:0,director:2}[c.say]||0))/10,1,9.9),act:clamp((cs.acting*.7+qNow41(p)*.3+({none:-2,'1':0,'2':3}[c.reh]||0))/10,1,9.9),prod:clamp((qNow41(p)*.55+Math.min(1.3,(p.prod||ib)/ib)*30+Math.log2(c.sets*c.crew*Math.max(.5,c.fx))*4)/10,1,9.9)}}
function prodList41(){const L=S.projects.filter(p=>!p.vault&&p.sch);
 return L.length?L.map(p=>{const st=stage41(p);const fc=fc41(p);const lab=['Pre-production','Shooting','Post-production','Ready to release'][st];
  return `<button class="pr41" onclick="pipe41(${p.id})">${posterSVG(p,52,p.poster||defaultPoster(p))}<div><b>${esc(p.title)}</b><small>${p.genre} · ${lab}</small><div class="pr41-s">${['PRE','SHOOT','POST','RELEASE'].map((x,i)=>`<i class="${i<st?'d':i===st?'c':''}">${x}</i>`).join('')}</div><small class="muted">Critics now ${fc[0]}–${fc[1]} · opens ${tLabel(p.releaseT)}</small></div><span>›</span></button>`}).join('')
 :`<div class="empty2"><b>Nothing in production</b><span>Pick a finished script and greenlight it.</span><button class="wk2go sm" onclick="modal();startFilm()">Make a movie</button></div>`}
/* phase watcher: notices, dailies, overruns, cost tracking */
const SET41=['The permit falls through','A storm wipes out two days of exteriors','The lead sprains an ankle','A camera truck breaks down','The catering company walks off','Two crew members quit mid-shoot','A set catches fire overnight','The location owner doubles the fee','Rain, rain and more rain','The film stock comes back scratched','A union dispute halts work for a day','A key prop goes missing','The second unit shoots the wrong scenes','A neighbour sues over the noise','An extra leaks photos to the press'];
function ppTick41(){try{(S.projects||[]).forEach(p=>{if(!p.sch||p.vault)return;const c=pp41(p);const ph=phaseOf(p);
  if(!c.seen[ph]){c.seen[ph]=tNow();const T=esc(p.title);if(ph==='shoot')addInbox('🎬',pname(p.dir),`Cameras roll on ${p.title}`,`Shooting has begun on <b>${T}</b>. The dailies will come in every month. Check them in the production pipeline.`,`pipe41(${p.id},'prod')`);
   if(ph==='post')addInbox('🎞️','Post-production',`${p.title} has wrapped`,`The shoot is done. Pick the cut, music and effects, and hold a test screening.`,`pipe41(${p.id},'post')`);
   if(ph==='ready')addInbox('📣','Marketing',`${p.title} is finished`,`Set the campaign and the release date.`,`pipe41(${p.id},'rel')`)}
  if(ph==='shoot'&&c.lastD!==tNow()){c.lastD=tNow();const s=sub41p(p);c.dailies.push({t:tNow(),a:Math.round(s.act*10),d:Math.round(s.dir*10),p:Math.round(s.prod*10)});
   const risk=.32*(1-readiness41(p)/130)+(c.loc==='location'?.06:0)+(c.say==='director'?.05:0)+(c.days<.9?.05:0);
   if(Math.random()<risk){const ev=pick(SET41);const over=+((p.spend||5)*R(.02,.07)).toFixed(2);const own=1-(p.cofi||0);S.cash-=over*own;p.paid+=over*own;c.cost.shoot=(c.cost.shoot||0)+over*own;c.over=(c.over||0)+over*own;c.log.push(`${ev}. Overrun: ${M(over)}.`);addInbox('⚠️','On the set',`${p.title}: ${ev.toLowerCase()}`,`${ev}. The shoot goes ${M(over)} over budget.`,`pipe41(${p.id},'prod')`)}}})}catch(e){E41(e)}}
nextMonth=(function(o){return function(){let pre=[];try{pre=(S.projects||[]).filter(p=>p.sch).map(p=>[p,phaseOf(p),p.paid])}catch(e){}const r=o.apply(this,arguments);
 try{pre.forEach(([p,ph,paid])=>{const c=pp41(p);const k=ph==='pre'?'pre':ph==='shoot'?'shoot':'post';c.act[k]=+((c.act[k]||0)+Math.max(0,(p.paid||0)-paid)).toFixed(3)});if(!S.over)ppTick41()}catch(e){E41(e)}return r}})(nextMonth);
weekTick=(function(o){return function(){o.apply(this,arguments);try{wrPayTick41()}catch(e){E41(e)}}})(weekTick);
buildProject=(function(o){return function(w){const p=o.apply(this,arguments);try{p.scq=w.script.q;const fa=w.script.forActs||[];const n=[w.lead,w.co].concat(w.leads2||[]).filter(id=>fa.includes(id)).length;if(n){p.q+=Math.min(3,n*1.5);p.forN=n}
 const s=p.spend||0,tot=p.sch.total||1;p.plan41={cast:p.fees||0,pre:s*p.sch.pre/tot,shoot:s*p.sch.shoot/tot,post:s*(tot-p.sch.pre-p.sch.shoot)/tot,mkt:p.mkt||0}}catch(e){E41(e)}return p}})(buildProject);
releaseFilm=(function(o){return function(p){let lenAdj=0;try{const c=p.pp;if(c&&c.camp){lenAdj=({2:-6,4:-2,6:0,8:-1})[c.camp]||0;p.hype=(p.hype||0)+lenAdj}}catch(e){}
 let fc=null,sub=null,aw=null;try{fc=fc41(p);sub=sub41p(p);if(p.pp&&p.pp.mix)aw=aware41(p)}catch(e){}
 const f=o.apply(this,arguments);
 try{if(f){p.hype=(p.hype||0)-lenAdj;const c=p.pp||{};const pl=p.plan41||{cast:p.fees||0,pre:0,shoot:(p.spend||0),post:0,mkt:p.mkt||0};
  f.x41={plan:pl,act:Object.assign({cast:p.fees||0},c.act||{},{mkt:(p.mkt||0)*(1-(p.cofi||0))}),cost:c.cost||{},log:(c.log||[]).slice(-6),dl:(c.dailies||[]).slice(-6),ch:{prep:c.prep,reh:c.reh,pol:c.pol,loc:c.loc,sets:c.sets,days:c.days,crew:c.crew,stunts:c.stunts,say:c.say,music:c.music,fx:c.fx,edit:c.edit,camp:c.camp},
   fc,sub,aw,startT:p.startT,sch:Object.assign({},p.sch),test:p.test||null,tested:!!c.tested,weak:c.weak||null,reshot:!!p.reshot,forN:p.forN||0,over:c.over||0,poster:p.poster?posterScore(p,p.poster).score:null,cut:p.cut}}}catch(e){E41(e)}return f}})(releaseFilm);
projectModal=(function(o){return function(id){o.apply(this,arguments);try{const p=S.projects.find(x=>x.id===id);if(!p||!p.sch)return;const m=document.querySelector('#modal .modal>div')||document.querySelector('#modal .modal');if(m&&typeof m.querySelector==='function'&&!m.querySelector('.pipeb41')){const st=stage41(p),fc=fc41(p);m.insertAdjacentHTML('afterbegin',`<button class="rptbtn pipeb41" onclick="pipe41(${id})"><span>🎬</span><div><b>Production pipeline</b><small>${['Pre-production','Shooting','Post-production','Release'][st]} · critics now ${fc[0]}–${fc[1]}</small></div><i>›</i></button>`)}}catch(e){E41(e)}}})(projectModal);
weekRows=(function(o){return function(){const rows=o.apply(this,arguments);try{(S.projects||[]).forEach(p=>{if(!p.sch||p.vault||!p.pp)return;const ph=phaseOf(p);const sn=p.pp.seen&&p.pp.seen[ph];if(sn!=null&&tNow()-sn<1&&ph!=='pre'){const L={shoot:['🎬','cameras roll · see the dailies','prod'],post:['🎞️','has wrapped · cut, music, test screening','post'],ready:['📣','is finished · campaign & date','rel']}[ph];if(L)rows.unshift(['#C9922E',`${L[0]} <b>${esc(p.title)}</b> ${L[1]}`,`pipe41(${p.id},'${L[2]}')`])}})}catch(e){E41(e)}return rows}})(weekRows);

/* ================= RELEASED ROOM & FILM PAGE ================= */
function sub41f(f){if(f.x41&&f.x41.sub)return f.x41.sub;const r=r41('sub'+f.id+f.title);const sk=id=>{const x=person(id);return x?x.skill:55};const c=f.critic||50;
 return f._sub||(f._sub={script:clamp((sk(f.writer)*.35+c*.65+(r()-.5)*14)/10,1,9.9),dir:clamp((sk(f.dir)*.35+(f.q||c)*.65+(r()-.5)*12)/10,1,9.9),act:clamp((sk(f.cast&&f.cast.lead)*.45+c*.55+(r()-.5)*12)/10,1,9.9),prod:clamp(((f.q||c)*.7+30*.3+(r()-.5)*12)/10,1,9.9)})}
function depts41(f){const ch=(f.x41&&f.x41.ch)||{};const r=r41('dp'+f.id);const c=(f.critic||50)/10;const g=v=>clamp(c+Math.log2(v||1)*1.6+(r()-.5)*1.4,1,10);
 const L=[['Sets & costumes',ch.sets||1],['Crew',ch.crew||1],['Editing',ch.edit||1],['Music',ch.music==='star'?2.2:ch.music==='library'?.6:1],['Shooting days',ch.days||1]];if(GEN[f.genre].vfx>=.4)L.push(['Special effects',ch.fx||1]);if(stuntG41(f.genre))L.push(['Stunts',ch.stunts||1]);
 return L.map(([n,m])=>({n,m,s:+g(m).toFixed(1)}))}
function verdict41(f){const pr=f.profit||0;return pr>=(f.costTotal||1)*1.5?['Blockbuster','#1F9D5C']:pr>=0?['Hit','#3BA55C']:pr>-(f.costTotal||1)*.3?['Underperformer','#D9A21B']:['Flop','#D0393B']}
function relCard41(f){const s=sub41f(f),d=depts41(f).sort((a,b)=>b.s-a.s);const so=typeof boShown==='function'?boShown(f):{done:true,ww:f.ww};const rev=f.revenue||f.ww||0;
 return `<button class="rc41" onclick="film41(${f.id},'ov')">${posterSVG(f,58)}<div class="rc41-m"><div class="pp41-r"><b class="ellip">${esc(f.title)}</b><b class="${f.critic>=60?'pos':'neg'}">${f1(f.critic/10)}/10</b></div><small class="muted">${f.genre} · ${yearOf(f.releaseT)}${so.done?'':' · in theaters'}</small>
 <div class="pp41-r"><span>Revenue</span><b>${M(rev)}</b></div><div class="pp41-r"><span>Net profit</span><b class="${f.profit>=0?'pos':'neg'}">${so.done?(f.profit>=0?'+':'')+M(f.profit):'pending'}</b></div>
 <small class="rc41-s">Script ${f1(s.script)} · Direction ${f1(s.dir)} · Acting ${f1(s.act)} · Production ${f1(s.prod)}. Best: ${d[0].n} (${f1(d[0].s)}). Weakest: ${d[d.length-1].n} (${f1(d[d.length-1].s)}).</small></div></button>`}
function rel41(){const films=S.films.filter(f=>f.kind!=='show').slice().reverse();const shows=(S.shows||[]).filter(s=>s.seasons&&s.seasons.length);
 return (shows.length?`<h4 class="hh">Series</h4>${shows.map(sh=>`<button class="rc41 sh41" onclick="modal();showModal(${sh.id})"><div class="rc41-m"><b>📺 ${esc(sh.title)}</b>${sh.seasons.map(se=>`<div class="pp41-r"><small>Season ${se.n}${se.title?': '+esc(se.title):''} · ${sh.eps} eps · ${f1((se.critic||50)/10)}/10</small><small class="${(se.fee||0)-(se.cost||0)>=0?'pos':'neg'}">${se.fee!=null&&se.cost!=null?((se.fee-se.cost)>=0?'+':'')+M(se.fee-se.cost):se.views+'M views'}</small></div>`).join('')}</div></button>`).join('')}`:'')+
 `<h4 class="hh">Pictures</h4>${films.map(relCard41).join('')||'<p class="muted" style="font-size:13px">Nothing released yet.</p>'}`}
function film41(id,tab){const f=S.films.find(x=>x.id===id);if(!f)return;tab=tab||'ov';const x=f.x41||{};let h='';const so=typeof boShown==='function'?boShown(f):{done:true,ww:f.ww,n:(f.weeks||[]).length};
 const fr=f.fid?S.franchises.find(z=>z.id===f.fid):null;
 if(tab==='ov'){const wins=f.awards.length,noms=f.noms.length;
  h+=`<div class="pp41-c pp41-pos">${posterSVG(f,96)}<div><small>${f.genre} · ${f.tier||'feature'}${f.part>1?' · part '+f.part:''}</small><small>Directed by <b>${esc(pname(f.dir))}</b></small><small>${f.weeks&&f.weeks.length?(so.done?'Ran ':'In theaters · week ')+(so.done?f.weeks.length:so.n)+' weeks':f.dist==='stream'?'Streaming release':'Sold'}</small></div></div>
  <div class="tl41">${[['Critics',f1(f.critic/10),f.critic>=60?'pos':'neg'],['Box office',M(so.ww||f.ww||0),''],['Profit',so.done?M(f.profit):'—',f.profit>=0?'pos':'neg'],['Statues',wins+'/'+noms,'']].map(([a,b,c])=>`<div><small>${a}</small><b class="${c}">${b}</b></div>`).join('')}</div>
  ${noms?`<div class="pp41-c">${f.noms.map(n=>`<small style="display:block">${f.awards.includes(n)?'🏆 Won':'· Nominated:'} ${esc(n)} (${yearOf(f.releaseT)+1})</small>`).join('')}</div>`:''}
  <small class="ns41-l">FANS</small><div class="pp41-c">${fanLine41(f,fr)}</div>
  <small class="ns41-l">FROM SCRIPT TO SCREEN</small><div class="pp41-c">${timeline41(f)}</div>`}
 if(tab==='rev'){const s=sub41f(f);const fc=x.fc||[Math.max(2,f.critic-8),Math.min(99,f.critic+6)];const Q={script:['A sharp, confident screenplay.','A solid script.','The script needed another pass.'],dir:['Assured, stylish direction.','Competent direction.','Direction without a pulse.'],act:['Superb performances all round.','Solid performances all round.','The performances never land.'],prod:['It looks and sounds wonderful.','Handsomely made.','It looks cheap.']};
  const q=(k,v)=>Q[k][v>=8?0:v>=6?1:2];const dps=depts41(f);const best=dps.slice().sort((a,b)=>b.s-a.s)[0],worst=dps.slice().sort((a,b)=>a.s-b.s)[0];
  h+=`<div class="pp41-c"><div class="pp41-r"><b class="big ${f.critic>=60?'pos':'neg'}">${f1(f.critic/10)}<small>/10</small></b><small class="muted">expected ${f1(fc[0]/10)}–${f1(fc[1]/10)}</small></div>${[['script','Script'],['dir','Direction'],['act','Acting'],['prod','Production']].map(([k,l])=>`<div class="rv41"><div class="pp41-r"><b>${l}</b><b class="${s[k]>=6?'pos':'neg'}">${f1(s[k])}</b></div><i>“${q(k,s[k])}”</i></div>`).join('')}</div>
  <small class="ns41-l">DEPARTMENTS</small><div class="pp41-c">${dps.map(d=>`<div class="pp41-r"><span>${d.n}${d===best?' <b class="pos">best</b>':d===worst?' <b class="neg">weakest</b>':''}</span><span>${f1(d.m)}× · ${f1(d.s)}</span></div>`).join('')}<small class="muted">The first number is what you spent against the plan.</small></div>
  ${x.tested?`<div class="pp41-c"><small>Test screening: critics ${x.fc?x.fc[0]+'–'+x.fc[1]:'—'}, the audience ${x.test}%.${x.reshot?' Reshoots booked.':''}</small></div>`:''}
  <small class="ns41-l">THE CRITICS ON YOUR CAST</small>${typeof paper40==='function'?paper40(f,0):''}`}
 if(tab==='fin'){const pl=x.plan||{cast:f.costTotal*.35,pre:f.costTotal*.1,shoot:f.costTotal*.3,post:f.costTotal*.1,mkt:f.mkt||f.costTotal*.15};const ac=x.act||null;const roi=f.costTotal?Math.round((f.profit/f.costTotal)*100):0;
  const rows=[['Cast & director','cast'],['Pre-production','pre'],['Shoot'+(x.over&&ac&&ac.shoot>pl.shoot?', with overrun':''),'shoot'],['Post, test & reshoots','post'],['Marketing','mkt']];
  h+=`<div class="pp41-c"><div class="pp41-r"><b class="big ${f.profit>=0?'pos':'neg'}">${so.done?(f.profit>=0?'+':'')+M(f.profit):'In theaters'}</b><small class="muted">${so.done?`return ${roi>=0?'+':''}${roi}%`:''}${be41(f)?' · broke even in week '+be41(f):''}</small></div>
  <table class="ft41"><tr><th>Phase</th><th class="r">planned</th><th class="r">actual</th></tr>${rows.map(([l,k])=>{const a=ac?ac[k]||0:pl[k];const over=a>(pl[k]||0)*1.04&&a-(pl[k]||0)>.01;return `<tr><td>${l}</td><td class="r">${M(pl[k]||0)}</td><td class="r ${over?'neg':''}">${M(a)}</td></tr>`}).join('')}<tr><td><b>Total</b></td><td class="r"><b>${M(sum(rows,([l,k])=>pl[k]||0))}</b></td><td class="r"><b>${M(f.costTotal)}</b></td></tr></table></div>
  ${f.weeks&&f.weeks.length?`<div class="pp41-c"><div class="pp41-r"><b>Box office per week</b><b>${M(so.dom||f.dom)}</b></div><div class="bo41">${f.weeks.slice(0,Math.max(1,so.n||f.weeks.length)).slice(0,16).map(w=>`<i style="height:${Math.max(3,Math.round(w/f.weeks[0]*64))}px"></i>`).join('')}</div></div>`:''}
  <div class="pp41-c">${(f.rights41?Object.entries(f.rights41).filter(([k,v])=>v.sold):[]).map(([k,v])=>`<div class="pp41-r"><span>${RT41[k][0]} (${v.y})</span><b class="pos">+${M(v.amt)}</b></div>`).join('')}${f.ancillary?`<div class="pp41-r"><span>Home, TV & digital</span><b class="pos">+${M(f.ancillary)}</b></div>`:''}${f.merch?`<div class="pp41-r"><span>Merchandise</span><b class="pos">+${M(f.merch)}</b></div>`:''}</div>
  <small class="ns41-l">WHAT WENT RIGHT, WHAT WENT WRONG</small><div class="pp41-c ww41">${ww41(f).map(l=>`<div class="${l[0]}">${l[0]==='g'?'✓':l[0]==='b'?'✗':'·'} ${l[1]}</div>`).join('')}</div>`}
 if(tab==='rt'){h+=`<div class="pp41-c">${Object.keys(RT41).map(k=>rtRow41(f,k)).join('')}</div><small class="muted">Asking gets you a bid now, but a cautious one. Wait, and a better offer may come along, or none. An offer lapses at the end of the year. Your stars take a small royalty from every sale.</small>`}
 MKEEP=true;modal(`<div class="pp41"><small class="hub41-k">RELEASED ${yearOf(f.releaseT)} · CRITICS ${f1(f.critic/10)}</small><h3>“${esc(f.title)}”</h3>
 <div class="pp41-t f4">${[['ov','Overview'],['rev','Reviews'],['fin','Finance'],['rt','Rights']].map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="film41(${id},'${k}')">${l}</button>`).join('')}</div>${h}</div>
 <div class="pgrid2"><button class="btn ghost" onclick="filmModal(${id})">Full report</button><button class="btn ghost" onclick="studio41('rel')">Back</button></div>`)}
function be41(f){if(!f.weeks||!f.weeks.length||!f.costTotal)return 0;const ir=f.dom?f.intl/f.dom:1;let cum=0;for(let i=0;i<f.weeks.length;i++){cum+=f.weeks[i]*(.5+ir*.4);if(cum>=f.costTotal)return i+1}return 0}
function fanLine41(f,fr){if(fr&&S.films.filter(z=>z.fid===fr.id).length<2)fr=null;if(!fr)return `<div class="pp41-r"><b>${esc(f.title)}</b><span>${Math.round(clamp((f.aud||50)*.8,0,99))}</span></div><small class="muted">A standalone picture. ${f.aud>=75?'Audiences loved it — a sequel would have a head start.':f.aud>=55?'People liked it well enough.':'Audiences have moved on.'}</small>`;
 const fl=S.films.filter(z=>z.fid===fr.id);const best=fl.reduce((a,b)=>(b.critic>a.critic?b:a),fl[0]);const fans=Math.round(fr.fans||0);const weaker=f.part>1&&best&&best!==f&&f.critic<best.critic;
 return `<div class="pp41-r"><b>${esc(fr.name)}</b><span>${fans} · ${fans>=60?'The fans want more':fans>=30?'The fans are patient':fans>0?'The fans are drifting':'Done with it'}</span></div>${weaker?`<small class="muted"><i>${esc(f.title)}</i> was weaker than the best part so far (${best.critic} vs ${f.critic}). Franchise fatigue.</small>`:`<small class="muted">${fl.length} part${fl.length>1?'s':''} so far.</small>`}`}
function timeline41(f){const x=f.x41;const lbl=t=>`wk ${(t%12)*4+1} · ${yearOf(t)}`;if(!x||!x.sch)return `<div class="pp41-r"><span>Release</span><span>${fmtLong(relD(f))}</span></div><small class="muted">Made before the studio kept production diaries.</small>`;
 const s=x.startT,a=s+x.sch.pre,b=a+x.sch.shoot,c=s+x.sch.total;return [['Pre-production',s,a],['Production',a,b],['Post-production',b,c]].map(([l,t0,t1])=>`<div class="pp41-r"><span>${l}</span><span>${lbl(t0)} – ${lbl(t1)}</span></div>`).join('')+`<div class="pp41-r"><span>Release</span><span>${fmtLong(relD(f))}</span></div>`+(x.log&&x.log.length?x.log.map(l=>`<small class="muted" style="display:block">On the set: ${l}</small>`).join(''):'')}
function ww41(f){const x=f.x41||{};const L=[];const fc=x.fc;
 if(fc){const cr=f.critic;L.push([cr>fc[1]?'g':cr<fc[0]?'b':'n',`The critics gave ${f1(cr/10)}, ${cr>fc[1]?'above':cr<fc[0]?'below':'within'} the expected ${f1(fc[0]/10)}–${f1(fc[1]/10)}.`])}
 if(x.aw!=null)L.push([x.aw>=70?'g':x.aw<45?'b':'n',`The campaign reached ${x.aw}% of the audience${x.aw>=70?': right for a '+(f.tier||'')+' '+f.genre:x.aw<45?': too few people knew it was out':''}.`]);
 if(x.plan&&x.act&&x.act.mkt>x.plan.mkt*1.15&&x.aw>=88)L.push(['n',`More campaign than it needed: ${M(x.act.mkt-x.plan.mkt)} over the proposal.`]);
 const d=depts41(f).sort((a,b)=>b.s-a.s);L.push(['g',`Strongest department: ${d[0].n} (${f1(d[0].s)}).`]);L.push(['b',`Weakest department: ${d[d.length-1].n} (${f1(d[d.length-1].s)}).`]);
 if(x.plan&&x.act){const ov=(x.act.shoot||0)+(x.act.post||0)-((x.plan.shoot||0)+(x.plan.post||0));if(ov>.05)L.push(['b',`The shoot and post-production came in ${M(ov)} over plan.${x.log&&x.log[0]?' On the set: '+x.log[0].replace(/\. Overrun.*$/,'')+'.':''}`])}
 if(x.reshot)L.push(['g','The reshoots lifted the weakest scenes.']);if(x.poster!=null)L.push([x.poster>=70?'g':x.poster<50?'b':'n',`Poster quality ${x.poster}.`]);
 if(x.forN)L.push(['g',`The lead role was written for the actor who played it.`]);
 if(f.part>1){const fr=S.franchises.find(z=>z.id===f.fid);const fl=fr?S.films.filter(z=>z.fid===fr.id&&z!==f):[];const best=fl.sort((a,b)=>b.critic-a.critic)[0];if(best&&f.critic<best.critic)L.push(['b',`<i>${esc(f.title)}</i> was weaker than the best part so far (${best.critic} vs ${f.critic}). Franchise fatigue.`])}
 if(x.tested&&x.test)L.push([x.test>=75?'g':x.test<50?'b':'n',`Test audiences scored it ${x.test}%.`]);
 if(!x.fc)L.unshift(['n','Made before the studio kept production diaries; figures are estimates.']);return L}
/* ---- rights ---- */
const RT41={tv:['TV broadcast',1950,.035],vhs:['VHS',1980,.05],dvd:['DVD',1998,.045],bd:['Blu-ray',2007,.012],str:['Streaming licence',2009,.03]};
function rtBid41(f,k){const R0=RT41[k];const age=Math.max(0,S.year-yearOf(f.releaseT));const base=(f.ww||f.revenue||1)*R0[2]*(inf(tNow())/inf(f.releaseT))*Math.max(.18,Math.pow(.9,age))*clamp((f.critic||50)/65,.4,1.5)*(yearOf(f.releaseT)>=R0[1]?.5:1);return +Math.max(.01,base).toFixed(2)}
function rtRow41(f,k){const R0=RT41[k];const v=(f.rights41||{})[k];
 if(v&&v.sold)return `<div class="rt41"><b>${R0[0]}</b><small>Sold in ${v.y} · ${M(v.amt)}</small></div>`;
 if(S.year<R0[1])return `<div class="rt41"><b>${R0[0]}</b><small class="muted">The market opens around ${R0[1]}.</small></div>`;
 if(v&&v.bid&&v.y===S.year)return `<div class="rt41"><b>${R0[0]}</b><small>Offer on the table: <b>${M(v.bid)}</b></small><div class="pgrid2"><button class="btn sm gold" onclick="rtSell41(${f.id},'${k}')">Accept</button><button class="btn sm ghost" onclick="rtNo41(${f.id},'${k}')">Wait</button></div></div>`;
 if(v&&v.no===S.year)return `<div class="rt41"><b>${R0[0]}</b><small class="muted">You passed this year. Ask again next year.</small></div>`;
 return `<div class="rt41"><b>${R0[0]}</b><small class="muted">Not sold.</small><button class="btn sm ghost" onclick="rtAsk41(${f.id},'${k}')">Ask for a bid</button></div>`}
function rtAsk41(id,k){const f=S.films.find(x=>x.id===id);if(!f)return;f.rights41=f.rights41||{};f.rights41[k]={bid:rtBid41(f,k)*R(.75,1.05),y:S.year};f.rights41[k].bid=+f.rights41[k].bid.toFixed(2);save();film41(id,'rt')}
function rtNo41(id,k){const f=S.films.find(x=>x.id===id);if(!f)return;f.rights41[k]={no:S.year};save();film41(id,'rt')}
function rtSell41(id,k){const f=S.films.find(x=>x.id===id);if(!f||!f.rights41||!f.rights41[k])return;const amt=f.rights41[k].bid;S.cash+=amt;f.profit=+((f.profit||0)+amt).toFixed(2);f.revenue=+((f.revenue||0)+amt).toFixed(2);f.rights41[k]={sold:1,y:S.year,amt};try{if(typeof logTx==='function')logTx(amt,RT41[k][0]+': '+f.title)}catch(e){}addNews(`💼 ${esc(S.name)} sells the ${RT41[k][0]} rights to <i>${esc(f.title)}</i> for ${M(amt)}.`);save();film41(id,'rt')}

/* ================= CATALOGUE ================= */
function rtMarks41(f){const r=f.rights41||{};const sold=Object.entries(r).filter(([k,v])=>v.sold);return (sold.length?sold.map(([k])=>RT41[k][0]+' ✓').join(' · ')+' · rights +'+M(sum(sold,([k,v])=>v.amt)):'No rights sold yet')}
function catFilm41(f){return `<button class="cf41" onclick="film41(${f.id},'ov')">${posterSVG(f,34)}<div><span><b>${esc(f.title)}</b> (${yearOf(f.releaseT)}) · dir. ${esc(pname(f.dir))}</span><small class="muted">${rtMarks41(f)}</small></div><small class="${f.profit>=0?'pos':'neg'}">${f1(f.critic/10)} · ${(f.profit>=0?'+':'')+M(f.profit||0)}</small></button>`}
function fanBox41(name,fans,lastY){const yrs=Math.max(0,S.year-lastY);const eff=Math.max(0,Math.round(fans-yrs*2.2));const mult=clamp(eff/60,0,1.6);
 return `<div class="pp41-r"><b>Fans</b><span class="${eff>0?'':'neg'}">${eff} · ${eff>=60?'They want more':eff>=30?'Still interested':eff>0?'Drifting away':'Done with it'}</span></div><div class="fb41"><i style="width:${clamp(fans,0,100)}%"></i><b style="left:${clamp(eff,0,100)}%"></b></div>
 <small class="muted"><i>${esc(name)}</i> set the bar at ${Math.round(fans)}: that's where the fans start. ${yrs?`${yrs} year${yrs>1?'s':''} since the last part: −${Math.round(yrs*2.2)}, the audience forgets.`:'The last part is fresh in their minds.'}</small>
 <small class="${mult>=.8?'pos':'neg'}" style="display:block">Next part: ×${mult.toFixed(2)} audience${eff<=0?'. The audience is done with '+esc(name)+'.':'.'}</small>`}
function cat41(){const films=S.films.filter(f=>f.kind!=='show');const out=[];const used=new Set();
 (S.franchises||[]).forEach(fr=>{const fl=films.filter(f=>f.fid===fr.id).sort((a,b)=>a.releaseT-b.releaseT);if(!fl.length)return;fl.forEach(f=>used.add(f.id));const last=fl[fl.length-1];const fans=fl.length>1?(fr.fans||0):Math.max(fr.fans||0,clamp((last.aud||50)*.8+(last.critic>=80?6:0),0,99));
  out.push({t:last.releaseT,h:`<div class="cat41"><div class="pp41-r"><b>${esc(fr.name)}</b>${fl.length>1?`<small class="muted">franchise · ${fl.length} parts</small>`:''}</div>${fl.map(catFilm41).join('')}${fanBox41(fr.name,fans,yearOf(last.releaseT))}<div class="pgrid2"><button class="btn sm ghost" onclick="modal();startFilm();W.mode='seq';wiz()">Sequel ›</button><button class="btn sm ghost" onclick="modal();startFilm();W.mode='seq';wiz()">Spin-off ›</button></div></div>`})});
 films.filter(f=>!used.has(f.id)).forEach(f=>{const fans=clamp((f.aud||50)*.8+(f.critic>=80?6:0),0,99);out.push({t:f.releaseT,h:`<div class="cat41"><div class="pp41-r"><b>${esc(f.title)}</b></div>${catFilm41(f)}${fanBox41(f.title,fans,yearOf(f.releaseT))}<div class="pgrid2"><button class="btn sm ghost" onclick="modal();startFilm();W.mode='seq';wiz()">Sequel ›</button><button class="btn sm ghost" onclick="modal();startFilm();W.mode='seq';wiz()">Spin-off ›</button></div></div>`})});
 return out.sort((a,b)=>b.t-a.t).map(x=>x.h).join('')||'<p class="muted" style="font-size:13px">Your catalogue fills up as you release pictures.</p>'}

/* ================= wire into the home screen ================= */
hq8=(function(o){return function(){let h=o();try{h=h.replace(/onclick="TAB='slate';render\(\)"/g,`onclick="studio41('rel')"`).replace(/onclick="franchiseView\(\)"/g,`onclick="studio41('cat')"`).replace(/<span>Franchises<\/span>/,'<span>Catalogue</span>').replace(/onclick="writersRoom\(\)"/g,`onclick="studio41('dev')"`);
 const n=S.projects.filter(p=>p.sch&&!p.vault).length;const k=h.indexOf(`onclick="studio41('rel')"`);if(k>=0){const s=h.lastIndexOf('<',k);h=h.slice(0,s)+`<button class="qt" onclick="studio41('prod')">${ic('film','#B5821C')}<span>Production</span>${n?`<i>${n}</i>`:''}</button>`+h.slice(s)}}catch(e){E41(e)}return h}})(hq8);
