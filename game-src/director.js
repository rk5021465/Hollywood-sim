"use strict";
// Stages the wedding day in the 3D scene: camera, baraat, problems, pheras, farewell.
const ROLES_H=['arrive','welcome','feast','ceremony','farewell'],ROLES_M=['arrive','welcome','ceremony','feast','farewell'];
const CAMS={arrive:{tg:[0,1.4,11],dist:15,ph:.42,th:.45},welcome:{tg:[0,1,3.5],dist:19,ph:.6,th:.75},feast:{tg:[5.5,1,0],dist:13,ph:.5,th:1.25},ceremony:{tg:[0,1.3,0],dist:11,ph:.48,th:.55},farewell:{tg:[0,1,9],dist:16,ph:.48,th:.25}};
function setupDay(sc,b){const p=planObj(b);const D={sc,b,trad:b.trad,roles:b.trad==='muslim'?ROLES_M:ROLES_H,role:null,procZ:20,procTarget:10.2,procMoving:false,hold:false,ev:[],labels:[],tmp:[],rain:null,fire:null,ritual:null,doli:null};
 D.proc=buildProcession(sc,p.procession?p.procession.type:null,0,20);D.rider=D.proc.rider;
 if(D.rider){D.proc.objs=D.proc.objs.filter(e=>e.o!==D.rider.body);D.proc.pts=D.proc.pts.filter(e=>e.q!==D.rider.face)}
 D.dancers=[];for(let i=0;i<8;i++){const F=figure(sc,{fem:i%3===1,mood:1});F.off=[(i%4-1.5)*.9,2.2+Math.floor(i/4)*1.1];D.dancers.push(F)}
 D.drummers=[];for(let i=0;i<2;i++){const F=figure(sc,{fem:false,col:0xF6EEDF,tur:'#C8102E'});F.off=[i?1:-1,1.4];D.drummers.push(F)}
 // bride waits near the mandap with her family
 D.bride=figure(sc,{fem:true,col:0xB3122E,veil:'#C8102E',top:0xB3122E,mood:1});D.bride.set(-1.2,3.2);
 D.bfam=[0,1,2].map(i=>{const F=figure(sc,{fem:i===1,beard:i===0,mood:1});F.set(-2.4+i*.9,6.2);return F});
 D.officiant=figure(sc,{fem:false,col:b.trad==='muslim'?0xF6EEDF:0xF29F05,top:b.trad==='muslim'?0xF6EEDF:0xF29F05,tur:b.trad==='muslim'?'#F6EEDF':null,beard:true,grey:true,mood:0});D.officiant.set(1.3,-1.4,.45);
 placeProc(D,0);
 sc.ticks.push((t,dt)=>dayTick(D,t,dt));
 return D}
function placeProc(D,t){const z=D.procZ;D.proc.at(0,z);const ry=D.proc.riderY;if(D.rider&&D.rider.mounted!==false)D.rider.set(0,z,ry+(D.procMoving?Math.abs(Math.sin(t*4))*.04:0),Math.PI);
 D.dancers.forEach((F,i)=>{if(F.free)return;const dance=D.procMoving||D.role==='arrive';F.set(F.off[0]+(dance?Math.sin(t*2+i)*.15:0),z+F.off[1],dance?Math.abs(Math.sin(t*5+i))*.07:0,Math.PI+(dance?Math.sin(t*2.5+i*1.7)*.9:0));F.armsUp(dance?1.9+Math.sin(t*5+i)*.6:0)});
 D.drummers.forEach((F,i)=>{if(F.free)return;F.set(F.off[0],z+F.off[1],Math.abs(Math.sin(t*8+i*1.3))*.04,Math.PI);F.armsUp(.6+Math.abs(Math.sin(t*8+i))*.5)})}
function dayTick(D,t,dt){
 if(D.procMoving&&!D.hold){D.procZ=Math.max(D.procTarget,D.procZ-dt*1.7);if(D.procZ<=D.procTarget){D.procMoving=false;if(D.onArrive){const f=D.onArrive;D.onArrive=null;f()}}}
 placeProc(D,t);
 for(const a of D.tmp)if(a.tick)a.tick(t,dt);
 if(D.rain)for(const q of D.rain){q.p[1]-=dt*14;if(q.p[1]<0){q.p[1]=10+Math.random()*4;q.p[0]=(Math.random()-.5)*20;q.p[2]=(Math.random()-.5)*20}}
 if(D.ritual)D.ritual(t,dt);
 if(D.doli){D.doli.z+=dt*1.6;D.doli.g.at(0,D.doli.z);D.doli.bearers.forEach((F,i)=>F.set(F.ox,D.doli.z+F.oz,Math.abs(Math.sin(t*6+i))*.05));if(D.doli.z>19){D.doli.done=true}}
}
function label(D,p,text,kind){const lb={p,text,kind};D.sc.labels.push(lb);D.labels.push(lb);return lb}
function clearLabels(D){D.sc.labels=D.sc.labels.filter(l=>!D.labels.includes(l));D.labels=[]}
function flash(D,p,text,kind,ms=1800){const lb={p,text,kind};D.sc.labels.push(lb);setTimeout(()=>{D.sc.labels=D.sc.labels.filter(l=>l!==lb)},ms)}
function dayPhase(D,ph){const role=D.roles[ph]||'farewell';D.role=role;clearLabels(D);if(D.rain){D.sc.parts=D.sc.parts.filter(q=>!D.rain.includes(q));D.rain=null;D.sc.dark=0}D.sc.camTo(CAMS[role]);
 if(role==='arrive'){D.procMoving=true;AUD.play('baraat')}
 else{if(D.procZ>D.procTarget){D.procZ=D.procTarget;D.procMoving=false}AUD.play('day')}
 if(role==='welcome'){// dancers join the crowd, groom dismounts
  D.dancers.concat(D.drummers).forEach((F,i)=>{F.free=true;F.armsUp(0);F.mode='wander';F.r=4+Math.random()*3;F.a=Math.random()*6.28;F.s=(Math.random()<.5?-1:1)*(.05+Math.random()*.08);D.sc._G.push(F)});
  if(D.rider){D.rider.mounted=false;D.rider.set(1.2,6.4)}}
 if(role==='feast'){D.sc._G.slice(0,6).forEach((F,i)=>{F.mode='still';F.set(5,-2.2+i*.9,0,0)})}
 if(role==='ceremony'){D.sc._G.forEach(F=>{if(F.mode==='still')F.mode='wander'});if(D.rider){D.rider.mounted=false;D.rider.set(.45,.4,.45)}D.bride.set(-.45,.4,.45)}
 if(role==='farewell'){D.sc._G.forEach(F=>{if(F.mode==='still')F.mode='wander'});D.bride.set(-.6,6.8);if(D.rider)D.rider.set(.6,6.8)}
}
// ritual: seven pheras (Hindu/Jain) or the Nikah. Calls done() at the end.
function dayRitual(D,done){const sc=D.sc;sc.camTo({tg:[0,1.2,0],dist:9,ph:.5,th:null});const G=D.rider,B=D.bride;
 if(D.trad==='muslim'){const lb=label(D,()=>[0,2.2,.4],'The Nikah begins','good');let t0=null;const lines=['The Qazi reads the vows','"Qubool hai"','"Qubool hai"','"Qubool hai"','They are married'];
  D.ritual=(t)=>{if(t0==null)t0=t;const k=Math.floor((t-t0)/1.6);lb.text=lines[Math.min(lines.length-1,k)];if(G)G.set(.45,.4,.45);B.set(-.45,.4,.45);if(t-t0>8.2){D.ritual=null;clearLabels(D);AUD.sfx('big');flash(D,[0,2.6,0],'Mubarak!','good',2500);done()}};return}
 const lb=label(D,()=>[0,2.6,0],'Phera 1 of 7','good');let t0=null;
 D.ritual=(t)=>{if(t0==null)t0=t;const el=t-t0,a=el*3.0,k=Math.min(7,Math.floor(a/(2*Math.PI))+1);lb.text='Phera '+k+' of 7';
  const r=1.25;if(G)G.set(Math.cos(a)*r,Math.sin(a)*r,.45,-a);B.set(Math.cos(a-.55)*r,Math.sin(a-.55)*r,.45,-a);
  if(a>=7*2*Math.PI){D.ritual=null;clearLabels(D);if(G)G.set(.45,.6,.45);B.set(-.45,.6,.45);AUD.sfx('big');petals(D,0,0);flash(D,[0,2.6,0],'Married!','good',2500);done()}}}
function petals(D,x,z){const sc=D.sc,ps=[];for(let i=0;i<40;i++){const q={p:[x+(Math.random()-.5)*4,4+Math.random()*3,z+(Math.random()-.5)*4],col:['#E8A0A8','#F29F05','#C8102E'][i%3],size:.06,a:1};ps.push(q);sc.parts.push(q)}const tk={keep:1,tick:(t,dt)=>{for(const q of ps){q.p[1]-=dt*1.2;q.p[0]+=Math.sin(t*2+q.p[2])*dt*.4;if(q.p[1]<.05)q.a=0}}};D.tmp.push(tk)}
function dayDoli(D){const sc=D.sc,m=sc.mark();sc.box(1.2,1,1.6,0xC8102E,0,1,0);sc.add(E3.prismG(0,1,.6,4,Math.PI/4),0xD9A931,0,2,0);sc.box(.1,.1,4,0x5a3a22,-.7,1.6,0);sc.box(.1,.1,4,0x5a3a22,.7,1.6,0);const g=sc.group(m,0,0);
 const bearers=[[-.7,-1.7],[.7,-1.7],[-.7,1.7],[.7,1.7]].map(([x,z])=>{const F=figure(sc,{fem:false,col:0xF6EEDF,tur:'#F6EEDF'});F.ox=x;F.oz=z;return F});D.bride.show(false);D.doli={g,bearers,z:6.5};g.at(0,6.5);petals(D,0,8);sc.camTo({tg:[0,1,11],dist:15,ph:.42,th:.3})}
// Show an event in the scene. Returns nothing; cleared by dayResolve.
function dayEvent(D,e){const sc=D.sc,G=sc._G,rg=()=>G[Math.floor(Math.random()*Math.min(G.length,12))]||D.bride;clearLabels(D);D.cur=e;const H=f=>()=>f.head();
 const add=(o)=>{D.tmp.push(o);return o};
 const crowd=(n,from,to,o={})=>{const fs=[];for(let i=0;i<n;i++){const F=figure(sc,Object.assign({mood:o.mood!=null?o.mood:1},o));F.p0=[from[0]+(Math.random()-.5)*2,from[1]+Math.random()*2];F.p1=[to[0]+(Math.random()-.5)*(o.spread||3),to[1]+(Math.random()-.5)*(o.spread||3)];F.k=0;F.set(F.p0[0],F.p0[1]);fs.push(F)}add({figs:fs,tick:(t,dt)=>fs.forEach((F,i)=>{F.k=Math.min(1,F.k+dt*.35);F.set(F.p0[0]+(F.p1[0]-F.p0[0])*F.k,F.p0[1]+(F.p1[1]-F.p0[1])*F.k,F.k<1?Math.abs(Math.sin(t*6+i))*.03:(o.hop?Math.abs(Math.sin(t*6+i))*.05:0),Math.atan2(F.p1[0]-F.p0[0],F.p1[1]-F.p0[1])*0+Math.PI);if(o.hop&&F.k>=1)F.armsUp(1.4+Math.sin(t*6+i)*.6)})});return fs};
 const person=(x,z,o={})=>{const F=figure(sc,o);F.set(x,z);add({f:F});if(o.hop)add({tick:t=>{F.set(F.x,F.z,Math.abs(Math.sin(t*6))*.05,F.ry+Math.sin(t*4)*.02);F.armsUp(1.2+Math.sin(t*7)*.8)}});return F};
 const id=e.id;
 if(id==='ele_stop'||id==='mare_spook'||id==='palki_tilt'){D.hold=true;const tg=D.rider||D.dancers[0];label(D,H(tg),'','warn');label(D,()=>[0,4.6,D.procZ],id==='ele_stop'?'Moti will not move!':id==='mare_spook'?'Whoa! Steady!':'Careful!','say');AUD.sfx('bad')}
 else if(id==='camel'){crowd(6,[3,16],[0,D.procZ+3],{scale:.6,hop:true});label(D,()=>[0,3.6,D.procZ],'What a show!','good')}
 else if(id==='late_baraat'){D.hold=true;const F=D.bfam[0];F.face.face.mood=-1;label(D,H(F),'Where are they?','say')}
 else if(id==='toran'){label(D,[0,5.2,7.6],'The toran is too high!','say')}
 else if(id==='milni_gift'){const F=person(1.5,7,{fem:false,beard:true,tur:'#C8102E',mood:-1});D.tmp.push({f:F});label(D,H(F),'Is that all?','say')}
 else if(id==='seat'){const F=person(-4,3,{fem:false,beard:true,tur:'#E9A23B',mood:-1,hop:true});label(D,H(F),'Where is MY seat?!','say')}
 else if(id==='extra_guests'||id==='crowded'){crowd(12,[0,16],[0,5],{spread:4});label(D,[0,2.6,6],id==='crowded'?'No room left!':'So many guests!','say')}
 else if(id==='dignitary'){crowd(4,[0,17],[2.5,5],{fem:false,col:0x2a4f8f,tur:'#2a4f8f',spread:1.5,mood:0});const F=crowd(1,[0,17],[2,4.2],{fem:false,col:0xD9A931,tur:'#C8102E',beard:true,mood:0,spread:.1})[0];label(D,H(F),'The court official!','say')}
 else if(id==='food_short'){sc._pots.forEach(p=>p.vis=false);G.slice(0,5).forEach(F=>{F.mode='still'});label(D,[6.3,1.6,0],'','warn');label(D,[5,2.4,-1],'Where is the food?','say');AUD.sfx('bad')}
 else if(id==='cook_fight'){person(7.3,-1,{fem:false,col:0xF6EEDF,mood:-1,hop:true});const F=person(7.3,1,{fem:false,col:0xF6EEDF,mood:-1,hop:true});label(D,H(F),'It was YOUR fault!','say')}
 else if(id==='jain_onion'||id==='meat_veg'){const F=person(5,1.5,{fem:false,beard:true,mood:-1});label(D,H(F),id==='jain_onion'?'Is this onion?!':'Meat? Here?!','say');AUD.sfx('bad')}
 else if(id==='sweets'){label(D,[5.3,2.4,0],'Who made these sweets?','good')}
 else if(id==='ghee'){const pd=sc.add([{v:[[4.6,.03,-1],[5.6,.03,-1.2],[5.8,.03,.2],[4.8,.03,.4]],n:[0,1,0]}],0xE9A23B,0,0,0,{layer:2.6});D.tmp.push({o:pd});label(D,[5.2,.6,-.4],'','warn')}
 else if(id==='muhurat_shift'){label(D,H(D.officiant),'It is 30 minutes earlier!','say')}
 else if(id==='rain'){D.rain=[];for(let i=0;i<70;i++){const q={p:[(Math.random()-.5)*20,Math.random()*12,(Math.random()-.5)*20],col:'#9fb4d9',size:.03,a:.7,streak:1};D.rain.push(q);sc.parts.push(q)}sc.dark=.28}
 else if(id==='fire_spark'){const fl=[];for(const [x,z] of [[1.4,1.4],[1,1.6],[1.6,.9]]){fl.push(sc.cone(.35,.9,0xFF7A1A,x,3.7,z,6,{emit:1}))}D.fire=fl;add({tick:t=>fl.forEach((o,i)=>{const s=1+Math.sin(t*14+i)*.25;o.s=[s,s*1.3,s]})});label(D,[1.3,4.6,1.3],'','warn');AUD.sfx('bad')}
 else if(id==='ring'){label(D,H(D.rider||D.bride),'My ring?!','say')}
 else if(id==='pandit_late'){D.officiant.show(false);label(D,[1.3,1.8,-1.4],'','warn');label(D,[0,2.6,0],'No officiant!','say')}
 else if(id==='shehnai'){label(D,[-6,2.4,4.4],'Beautiful…','good')}
 else if(id==='quarrel'){person(-2.6,2.6,{fem:false,mood:-1,hop:true});const F=person(-2,3.4,{fem:false,beard:true,mood:-1,hop:true});label(D,H(F),'That land is OURS!','say')}
 else if(id==='firework_show'){addFireworks(sc,5);label(D,[0,3,4],'Ooooh!','good');AUD.sfx('big')}
 else if(id==='decor_wow'){label(D,[0,3.2,4],'It glitters!','good')}
 else if(id==='decor_wilt'){label(D,[1.75,3.2,1.75],'','warn');label(D,[0,4,2],'The flowers are wilting','say')}
 else if(id==='wind'){label(D,[-5.5,4.2,-5.5],'','warn')}
 else if(id==='vidaai'||id==='rukhsati'){const F=D.bfam[0];F.face.face.mood=-1;label(D,H(F),'Go well, my daughter','say')}
 else if(id==='shoe'){crowd(3,[-3,8],[-.2,7.6],{fem:true,spread:1.2,hop:true});label(D,H(D.rider||D.bride),'Where are my shoes?','say')}
 else if(id==='thief'){label(D,[6.3,1.6,2.6],'','warn');label(D,[6,2.4,2.6],'A gift box is gone','say')}
 else if(id==='rival_gossip'){const F=rg();label(D,H(F),'I heard their weddings…','say')}
 else if(id==='drunk_singer'){const F=sc._musos[0]||rg();label(D,H(F),'…(no voice)…','say')}
 else if(id==='storm_gods'){label(D,H(D.officiant),'A special blessing','good')}
 else if(id==='palace_guard'){crowd(2,[2,17],[1.5,8.6],{fem:false,col:0x2a4f8f,tur:'#2a4f8f',spread:.6,mood:-1});label(D,[1.5,2.4,8.6],'Show your papers!','say')}
 else if(id==='child_lost'){const F=person(-7,6.5,{scale:.55,fem:true,mood:-1});label(D,H(F),'Mama?','say')}
 else{const F=rg();label(D,H(F),'','warn')}
}
function dayResolve(D,e,ci,res){const sc=D.sc,id=e.id;clearLabels(D);
 if(D.hold){D.hold=false;if(D.procZ>D.procTarget)D.procMoving=true}
 if(id==='food_short'&&ci!==2)sc._pots.forEach(p=>p.vis=true);
 if(id==='food_short')sc._G.forEach(F=>{if(F.mode==='still'&&D.role!=='feast')F.mode='wander'});
 if(D.fire){D.fire.forEach(o=>o.vis=false);D.fire=null;sc._canopy.col=[90,40,30]}
 if(id==='pandit_late')D.officiant.show(true);
 if(id==='rain'&&ci!==2){sc.parts=sc.parts.filter(q=>!D.rain.includes(q));D.rain=null;sc.dark=0}
 if(id==='late_baraat'||id==='vidaai'||id==='rukhsati')D.bfam[0].face.face.mood=1;
 if(id==='toran'&&D.rider&&ci===0){const R0=D.rider;let k=0;D.tmp.push({keep:1,tick:(t,dt)=>{if(k>1)return;k+=dt;R0.set(R0.x,R0.z,Math.sin(Math.min(1,k)*Math.PI)*1.2)}})}
 // remove temporary people and objects
 for(const a of D.tmp){if(a.figs)a.figs.forEach(F=>F.show(false));if(a.f)a.f.show(false);if(a.o)a.o.vis=false}
 D.tmp=D.tmp.filter(a=>a.tick&&!a.figs&&!a.f&&!a.o&&a.keep);
 const d=(res.b||0)+(res.g||0);const at=D.role==='feast'?[5.5,2.6,0]:D.role==='arrive'?[0,3.6,D.procZ]:D.role==='farewell'?[0,3,8]:[0,3,1];
 if(d>0){flash(D,at,'Families pleased  +'+d,'good');AUD.sfx('good')}else if(d<0){flash(D,at,'Families unhappy  '+d,'say');AUD.sfx('bad')}else AUD.sfx('tap');
}
