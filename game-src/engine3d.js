const SKINS=['#C68B5E','#A86F48','#8E5A3A','#D29A6A'];
const CLOTH=[0xC8102E,0x2a6fb0,0xE9A23B,0x5E8C46,0xF6EEDF,0xD9A931,0xE8A0A8,0x8E44AD,0xE07B00,0x1f7a7a];
const TURB=['#C8102E','#F29F05','#E9A23B','#F6EEDF','#E8A0A8','#5E8C46'];
const VEIL=['#C8102E','#E8A0A8','#F29F05','#8E44AD','#2a6fb0','#5E8C46'];
const hx=s=>parseInt(s.slice(1),16);
function figure(sc,o={}){const R=Math.random;const fem=o.fem!=null?o.fem:R()<.45;const col=o.col!=null?o.col:CLOTH[Math.floor(R()*CLOTH.length)];const sz=o.scale||1;const prev=sc.dynMode;sc.dynMode=true;
 const top=o.top!=null?o.top:(fem?col:(R()<.5?col:0xF2E3C6));const skin=hx(o.skin||SKINS[Math.floor(R()*4)]);const parts=[];
 const P=(g,c,off,ex)=>{const ob=sc.add(g,c,0,0,0,ex||{});parts.push({o:ob,off});return ob};
 P(E3.prismG(.15*sz,(fem?.36:.24)*sz,.8*sz,14),col,[0,0,0]);
 P(E3.prismG(.17*sz,.14*sz,.36*sz,12),top,[0,.78*sz,0]);
 const armG=E3.prismG(.045*sz,.055*sz,.42*sz,10,0,-.42*sz);
 const aL=P(armG,top,[-.2*sz,1.12*sz,0]),aR=P(armG,top,[.2*sz,1.12*sz,0]);
 P(E3.sphG(.06*sz,8,6),skin,[0,1.15*sz,0]);
 P(E3.sphG(.118*sz,14,10),skin,[0,1.27*sz,0]);
 let tur=null;
 if(fem){const vc=hx(o.veil||VEIL[Math.floor(R()*6)]);P(E3.sphG(.142*sz,14,10),vc,[0,1.285*sz,.04*sz],{s:[1,1.06,1]});P(E3.prismG(.13*sz,.25*sz,.46*sz,12),vc,[0,.86*sz,.06*sz])}
 else{tur=o.tur!==undefined?o.tur:(R()<.6?TURB[Math.floor(R()*6)]:null);if(tur){P(E3.sphG(.15*sz,14,10),hx(tur),[0,1.355*sz,.01*sz],{s:[1,.72,1.02]});if(o.plume)P(E3.prismG(0,.03*sz,.2*sz,8),0xD9A931,[0,1.42*sz,-.06*sz])}else P(E3.sphG(.124*sz,12,8),0x1b1210,[0,1.31*sz,.025*sz],{s:[1,.62,1]});
  if(o.beard!=null?o.beard:R()<.3)P(E3.sphG(.085*sz,10,7),o.grey?0xD8D4CC:0x1b1210,[0,1.2*sz,-.07*sz],{s:[1,.85,.7]})}
 sc.dynMode=prev;
 const F={parts,arms:[aL,aR],fem,sz,x:0,z:0,y:0,ry:0,face:{face:{mood:1},p:[0,0,0],vis:true},
  set(x,z,y=0,ry){this.x=x;this.z=z;this.y=y;if(ry!=null)this.ry=ry;const c=Math.cos(this.ry),s=Math.sin(this.ry);for(const pt of this.parts){const ox=pt.off[0]*c-pt.off[2]*s,oz=pt.off[0]*s+pt.off[2]*c;pt.o.p=[x+ox,y+pt.off[1],z+oz];pt.o.ry=this.ry}},
  show(v){for(const pt of this.parts)pt.o.vis=v},head(){return[this.x,this.y+1.48*this.sz,this.z]},
  armsUp(a){this.arms[0].rz=-(.12+a);this.arms[1].rz=.12+a}};
 F.armsUp(0);F.set(o.x||0,o.z||0);return F}

// deterministic random for the city around the venue
function srand(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function scenery(sc,kind){const r=srand(11);
 sc.add(E3.diskG(170,48,-.42),0x2a1c1e,0,0,0);
 const stones=[0xA8695A,0x9C5E50,0xB27A64,0x8E5648,0xB98572];
 for(let i=0;i<78;i++){const a=r()*Math.PI*2;if(Math.abs(a-Math.PI/2)<.22){r();continue}const rr=24+r()*34,x=Math.cos(a)*rr,z=Math.sin(a)*rr;const w=2+r()*4,d=2+r()*4,h=2.5+r()*6;const c=stones[Math.floor(r()*5)];
  sc.box(w,h,d,c,x,-.4,z,{ry:a});sc.box(w+.3,.3,d+.3,c-0x101010,x,h-.4,z,{ry:a});
  const k=r();if(k<.28)sc.dome(Math.min(w,d)*.32,0xD8C2A8,x,h-.1,z);else if(k<.45){for(const [dx,dz] of [[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]])sc.cyl(.06,.7,c,x+dx,h-.1,z+dz,12);sc.dome(.62,0xD8C2A8,x,h+.6,z)}
  const nw=1+Math.floor(r()*3);for(let j=0;j<nw;j++){const wy=.8+r()*(h-1.5),off=(r()-.5)*w*.6;const nx=-Math.cos(a),nz=-Math.sin(a);sc.point(x+nx*(d/2+.05)+(-nz)*off,wy,z+nz*(d/2+.05)+nx*off,r()<.8?'#FFB25A':'#FFD9A0',.09,r()<.2?.3:0)}}
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2+r()*.4,rr=95+r()*30,R=14+r()*16,h=9+r()*12;sc.add(E3.prismG(0,R,h,9,r()),0x231a29,Math.cos(a)*rr,-.4,Math.sin(a)*rr)}
 const fa=-2.3,fx=Math.cos(fa)*92,fz=Math.sin(fa)*92;sc.add(E3.prismG(0,20,16,9),0x241b2a,fx,-.4,fz);for(let i=0;i<9;i++){const b=fa-.12+i*.03;sc.box(4,2.2,1.5,0x6e4a44,Math.cos(b)*86,10.5+Math.sin(i)*.6,Math.sin(b)*86,{ry:b});if(i%2)sc.point(Math.cos(b)*85,11.8,Math.sin(b)*85,'#FFB25A',.25)}
 // trees on the edge of the venue
 for(let i=0;i<14;i++){const a=r()*Math.PI*2,rr=11+r()*8;if(Math.abs(a-Math.PI/2)<.3)continue;const x=Math.cos(a)*rr,z=Math.sin(a)*rr;sc.cyl(.18,1.6,0x3a2a1e,x,-.4,z,12);sc.add(E3.sphG(1.1+r()*.6,10,7),0x1f3b2a,x,1.8,z,{s:[1,.85,1]})}
}

function drawItem(sc,k,x,z){
 const poly=(n,r,y,a0=0)=>{const v=[];for(let i=0;i<n;i++){const a=a0+i/n*6.28318;v.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r])}return[{v,n:[0,1,0]}]};
 switch(k){
 case'arch':sc.cyl(.12,2.4,0xD9A931,x-.9,0,z,6);sc.cyl(.12,2.4,0xD9A931,x+.9,0,z,6);for(let i=0;i<=8;i++){const a=i/8*Math.PI;sc.ball(.17,i%2?0xF29F05:0xF4C430,x+Math.cos(a)*.9,2.4+Math.sin(a)*.8,z)}break;
 case'lamp':sc.cyl(.06,1.8,0xB8860B,x,0,z,6);sc.add(E3.prismG(.05,.22,.25,6),0xD9A931,x,1.8,z);sc.point(x,2.05,z,'#FFC765',.13,.7);sc.light(x,2.1,z,0xFFB060,.55);break;
 case'urn':sc.add(E3.prismG(.22,.32,.6,8),0xB8705C,x,0,z);sc.ball(.32,0xC8102E,x,.8,z);sc.ball(.18,0xF29F05,x+.15,.95,z);break;
 case'canopy':for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])sc.cyl(.05,2.2,0xD9A931,x+a,0,z+b,5);sc.add(E3.prismG(0,1.6,.6,4,Math.PI/4),0xE8A0A8,x,2.2,z);break;
 case'fountain':sc.light(x,1.2,z,0x9fd0ff,.3);sc.add(E3.prismG(.9,1,.35,10),0xEDE6D8,x,0,z);sc.add(poly(10,.85,.37),0x7fb7d6,0,0,0);sc.cyl(.12,1,0xEDE6D8,x,0,z,6);sc.add(E3.prismG(.4,.15,.15,8),0xEDE6D8,x,1,z);for(let i=0;i<8;i++){const a=i/8*6.28;sc.point(x+Math.cos(a)*.45,1.05,z+Math.sin(a)*.45,'#bfe6ff',.05,1.5)}break;
 case'rangoli':sc.add(poly(8,.9,.04),0xC8102E,0,0,0);sc.add(poly(4,.6,.06,.785),0xF29F05,0,0,0);sc.add(poly(6,.25,.08),0xF6EEDF,0,0,0);break;
 case'swing':sc.cyl(.07,2.4,0x6b4a2a,x-.9,0,z,5);sc.cyl(.07,2.4,0x6b4a2a,x+.9,0,z,5);sc.box(2,.12,.12,0x6b4a2a,x,2.4,z);sc.box(1.1,.08,.5,0xD9A931,x,.6,z);for(let i=0;i<6;i++){sc.ball(.09,0xF29F05,x-.5,.8+i*.27,z);sc.ball(.09,0xF29F05,x+.5,.8+i*.27,z)}break;
 case'elephant':{const g=0x7f8c9a;sc.box(1.6,.3,1,0xB8A48A,x,0,z);sc.box(1.4,.9,.8,g,x,.9,z);sc.box(.5,.55,.55,g,x+.85,1.2,z);sc.add(E3.prismG(.08,.14,.8,6),g,x+1.1,.5,z);for(const [a,b] of [[-.5,-.3],[.5,-.3],[-.5,.3],[.5,.3]])sc.cyl(.15,.6,g,x+a,.3,z+b,6);sc.box(1.5,.08,.9,0xC8102E,x,1.8,z);sc.box(.5,.3,.5,0xD9A931,x,1.88,z);break}
 case'seating':sc.box(1.8,.25,.8,0xC8102E,x,0,z);sc.box(1.8,.5,.15,0xD9A931,x,.25,z-.35);sc.ball(.15,0xF29F05,x-.6,.4,z);sc.ball(.15,0xF29F05,x+.6,.4,z);break;
 case'banana':for(const dx of [-.4,.4]){sc.cyl(.1,1.4,0x6b8e23,x+dx,0,z,6);sc.add(E3.prismG(0,.6,1.2,5),0x3f8f3a,x+dx,1.2,z)}break;
 case'peacock':sc.box(.6,.5,.6,0xEDE6D8,x,0,z);sc.ball(.25,0x1f5fa0,x,.75,z);sc.cyl(.05,.5,0x1f5fa0,x,.75,z,5);sc.ball(.1,0x1f5fa0,x,1.3,z);for(let i=0;i<9;i++){const a=-1.1+i*.27;sc.ball(.16,i%2?0x2a9d6f:0x1f7a7a,x+Math.sin(a)*.8,.85+Math.cos(a)*.8,z-.3)}break;
 }}

function buildVenue(sc,plan,opt={}){
 sc.clear();let kind=plan.venue?plan.venue.kind:'haveli';if(kind==='haveli2')kind='haveli';const R=Math.random;
 const pal={haveli:[0xC98B6B,0xBF8061,0x7a4a38],garden:[0x1F4A35,0x23523B,0x163527],temple:[0xB8A48A,0xAD9A80,0x6e604e],tent:[0xC9A56E,0xBF9B63,0x7a603a],palace:[0xE8E0D2,0xDCD3C4,0x8f877a]}[kind];
 scenery(sc,kind);sc.ground(18,12,pal[0],pal[1],pal[2]);sc.add(E3.boxG(4.4,.04,9).filter(f=>f.n[1]>.5),[0x8a5a48,0x2a4a35,0x8d7f6a,0x9a7c50,0xC9C0B0][['haveli','garden','temple','tent','palace'].indexOf(kind)],0,0,13.5,{layer:2});
 sc.dist=kind==='palace'||kind==='tent'?25:23;
 const pink=0xD9917A,pinkD=0xB8705C;
 if(kind==='haveli'){
  for(const [x,z,w,d] of [[0,-8.6,18,.8],[-8.6,0,.8,18],[8.6,0,.8,18]]){sc.box(w,3.4,d,pink,x,0,z);sc.box(w+.2,.3,d+.2,pinkD,x,3.4,z)}
  for(let i=-3;i<=3;i++){sc.box(1.2,2,.1,0x5a2f24,i*2.4,.2,-8.15);sc.dome(.6,pinkD,i*2.4,2.2,-8.2)}
  for(let i=0;i<5;i++)sc.box(.8,.9,.3,pinkD,-7.5+i*3.7,3.7,-8.6);
 } else if(kind==='garden'){
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.3,rr=7.8;const x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(z>6&&Math.abs(x)<4)continue;sc.cyl(.2,1.4,0x5a3a22,x,0,z,6);sc.add(E3.sphG(1.2,7,5),0x2e6b3a,x,2.2,z)}
 } else if(kind==='temple'){
  sc.box(5,1.2,4,0xB8A48A,0,0,-7);sc.box(3,2.2,3,0xC9B594,0,1.2,-7);sc.cone(1.8,3.2,0xD9C29A,0,3.4,-7,8);sc.add(E3.prismG(0,.15,1.2,4),0xD9A931,0,6.6,-7);
  for(const x of [-7.5,7.5])for(const z of [-7.5,7.5]){sc.cyl(.35,2.8,0xC9B594,x,0,z,8);sc.dome(.55,0xD9C29A,x,2.8,z)}
 } else if(kind==='tent'){
  for(const [x,z,s] of [[-5.5,-5.5,2.6],[5.5,-5.5,2.6]]){sc.box(s*2,1.8,s*2,0xF2E3C6,x,0,z);sc.cone(s*1.6,1.8,x<0?0xC8102E:0xF29F05,x,1.8,z,4,{},Math.PI/4)}
  for(let i=0;i<4;i++)sc.add(E3.prismG(0,1.2,2.2,6),0xC9A56E,-8+i*5.3,0,-9.5);
 } else if(kind==='palace'){
  for(const [x,z,w,d] of [[0,-8.6,18,.8],[-8.6,0,.8,18],[8.6,0,.8,18]]){sc.box(w,4.2,d,0xEDE6D8,x,0,z);sc.box(w+.2,.35,d+.2,0xD9A931,x,4.2,z)}
  for(const x of [-6,-2,2,6]){for(const c of [-.7,.7])sc.cyl(.08,1.2,0xEDE6D8,x+c,4.55,-8.6,6);sc.dome(1,0xEDE6D8,x,5.75,-8.6);sc.add(E3.prismG(0,.08,.6,4),0xD9A931,x,6.7,-8.6)}
  for(let i=-3;i<=3;i++){sc.box(1.4,2.6,.1,0x3b5f8f,i*2.4,.4,-8.15)}
 }
 const isNikah=opt.trad==='muslim';
 sc.box(4.2,.45,4.2,0xF6EEDF,0,0,0);sc.box(4.4,.1,4.4,0xD9A931,0,0,0);
 const dq=plan.decor?plan.decor.q:1;const canopyC=[0xC8102E,0xC8102E,0xC8102E,0xE07B00,0x8A1538,0xB3122E][dq];
 for(const [x,z] of [[-1.75,-1.75],[1.75,-1.75],[-1.75,1.75],[1.75,1.75]]){sc.add(E3.prismG(.13,.15,3.1,8),0xD9A931,x,.45,z);if(dq>=2)for(let i=0;i<(dq>=3?6:3);i++)sc.ball(.14,i%2?0xF29F05:0xF4C430,x,.9+i*.42,z)}
 sc.box(4.5,.16,4.5,0xD9A931,0,3.5,0);sc._canopy=sc.add(E3.prismG(0,3.15,1.9,4,Math.PI/4),canopyC,0,3.66,0,{dyn:true});sc.ball(.24,0xD9A931,0,5.7,0);
 sc._fl=null;if(isNikah){sc.box(2.4,.5,1,0xF6EEDF,0,.45,-.6);sc.box(2.4,.9,.15,0xD9A931,0,.95,-1.05)}
 else{sc.box(.75,.28,.75,0x5a3a1a,0,.45,0);const f1=sc.cone(.28,.75,0xFFB040,0,.73,0,6,{emit:1,dyn:true}),f2=sc.cone(.14,.5,0xFFE27A,0,.73,0,6,{emit:1,dyn:true});sc.point(0,1.1,0,'#FF9A3C',.3,0);sc._fl=[f1,f2]}
 if(dq>=3){const n=dq>=4?72:40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;sc.point(Math.cos(a)*5.2,3.1-Math.abs(Math.sin(a*6))*.5,Math.sin(a)*5.2,'#F29F05',.07)}}
 if(dq>=4){for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]]){sc.cyl(.1,3.2,0xD9A931,x,0,z,6);sc.ball(.3,0xF29F05,x,3.3,z)}}
 sc._pots=[];if(plan.feast){sc.box(1.1,.9,6.2,0xF6EEDF,6.3,0,0);sc.box(1.2,.08,6.4,0xD9A931,6.3,.9,0);const nq=plan.feast.q;for(let i=0;i<Math.min(6,nq+1);i++)sc._pots.push(sc.add(E3.prismG(.3,.36,.25,12),0xC9CED8,6.3,.98,-2.5+i*1,{dyn:true}));sc.light(6.3,2.2,0,0xFFB060,.45)}
 sc._musos=[];if(plan.music){const nm=[0,2,3,4,6,7][plan.music.q];for(let i=0;i<nm;i++){const F=figure(sc,{fem:false,col:0xF6EEDF,top:0xF6EEDF,tur:i%2?'#C8102E':'#F29F05'});F.set(-6.5+(i%4)*.8,4+Math.floor(i/4)*.8,0,.8);sc._musos.push(F)}}
 sc.add(E3.prismG(.28,.32,3.6,8),0xE9A23B,-2.4,0,7.6);sc.add(E3.prismG(.28,.32,3.6,8),0xE9A23B,2.4,0,7.6);
 for(let i=0;i<=12;i++){const a=i/12*Math.PI;sc.ball(.3,i%2?0xE9A23B:0xF4C430,Math.cos(a)*2.4,3.6+Math.sin(a)*2.2,7.6)}sc.light(0,3.2,8.4,0xFFA040,.6);
 for(const it of (opt.items||[]))drawItem(sc,it.k,it.x,it.z);
 if(!opt.day&&!opt.noProc)buildProcession(sc,plan.procession?plan.procession.type:null,0,10.6);
 const lt=plan.lights?plan.lights.type:'diya';
 if(lt==='diya'){for(let i=0;i<40;i++){const a=i/40*Math.PI*2;sc.point(Math.cos(a)*3,.5,Math.sin(a)*3,'#FFC765',.05,.6)}sc.light(-3,.8,3,0xFFB060,.35);sc.light(3,.8,-3,0xFFB060,.35)}
 if(lt==='torch'){for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const x=Math.cos(a)*7.4,z=Math.sin(a)*7.4;sc.cyl(.07,2.2,0x5a3a22,x,0,z,5);sc.point(x,2.4,z,'#FF9A3C',.16,2);if(i%2===0)sc.light(x,2.5,z,0xFF8A30,.7)}}
 if(lt==='fireworks'){for(let i=0;i<48;i++){const a=i/48*Math.PI*2;sc.point(Math.cos(a)*8.4,3.3-Math.abs(Math.sin(a*4))*.4,Math.sin(a)*8.4,'#FFE27A',.08,1)}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;sc.cyl(.06,3.4,0xA9B0C3,Math.cos(a)*8.4,0,Math.sin(a)*8.4,5);if(i%2)sc.light(Math.cos(a)*8,3.2,Math.sin(a)*8,0xFFD070,.45)}
  if(!opt.day)addFireworks(sc,3)}
 sc.bake();
 const ng=opt.noGuests?0:Math.max(8,Math.min(30,Math.round((opt.guests||200)/35)));const G=[];
 for(let i=0;i<ng;i++){const F=figure(sc);F.r=3.6+R()*3.6;F.a=R()*6.28;F.s=(R()<.5?-1:1)*(.04+R()*.1);F.mode='wander';G.push(F)}
 if(opt.couple&&!opt.day){const B=figure(sc,{fem:true,col:0xC8102E,veil:'#C8102E'}),Gm=figure(sc,{fem:false,col:0xF2E3C6,top:0xF2E3C6,tur:'#D9A931',plume:1});B.set(-.45,.4,.45);Gm.set(.45,.4,.45)}
 sc._G=G;sc.fire=[0,1.1,0];sc.fireOn=isNikah?.4:1;
 sc.ticks.push((t)=>{
  if(sc._fl){const f=1+Math.sin(t*12)*.14+Math.sin(t*7.3)*.09;sc._fl[0].s=[f,f*1.15,f];sc._fl[1].s=[f,f,f]}
  for(let i=0;i<G.length;i++){const g=G[i];if(g.mode!=='wander')continue;g.a+=g.s*.012;const x=Math.cos(g.a)*g.r,z=Math.sin(g.a)*g.r;g.set(x,z,Math.abs(Math.sin(t*5+i))*.025,-g.a+Math.PI/2)}
  for(let i=0;i<sc._musos.length;i++){const m=sc._musos[i];m.set(m.x,m.z,0,m.ry);m.armsUp(.5+Math.sin(t*6+i)*.25)}
 });
}
function addFireworks(sc,n){const R=Math.random;const fw=[];for(let k=0;k<n;k++){const b={c:[(R()-.5)*14,9+R()*4,(R()-.5)*14],t0:R()*3,col:['#FF5A5A','#FFE27A','#7FD3FF','#F29F05','#C77DFF'][k%5],ps:[]};for(let i=0;i<24;i++){const a=R()*6.28,e=R()*3.14;const q={p:[0,-50,0],d:[Math.cos(a)*Math.sin(e),Math.cos(e),Math.sin(a)*Math.sin(e)],col:b.col,size:.09,a:1};b.ps.push(q);sc.parts.push(q)}fw.push(b)}
 sc.ticks.push(t=>{for(const b of fw){const tt=((t+b.t0)%3.2)/1.6;if(tt<.03){b.c=[(R()-.5)*14,9+R()*4,(R()-.5)*14]}for(const q of b.ps){if(tt>1){q.a=0;continue}q.p=[b.c[0]+q.d[0]*tt*3,b.c[1]+q.d[1]*tt*3-tt*tt*1.2,b.c[2]+q.d[2]*tt*3];q.a=1-tt}}});return fw}
function buildProcession(sc,pt,ox,oz){const m=sc.mark();let ry=0;
 if(pt==='elephant'){const g=0x8f8a8a;sc.box(2.6,1.6,1.4,g,ox,1.2,oz-.1);sc.box(.9,1,1,g,ox,1.9,oz-1.5);sc.add(E3.prismG(.15,.25,1.4,6),g,ox,.6,oz-2);for(const [x,z] of [[-.9,.8],[.9,.8],[-.9,-.6],[.9,-.6]])sc.cyl(.3,1.2,g,ox+x,0,oz+z,6);sc.box(2.8,.15,1.6,0xC8102E,ox,2.8,oz-.1);sc.box(1.2,.6,1,0xD9A931,ox,2.95,oz);ry=3.55}
 else if(pt==='horse'){const w=0xF2EFEA;sc.box(.6,.7,1.8,w,ox,1,oz);sc.box(.4,.8,.5,w,ox,1.5,oz-.9);for(const [x,z] of [[-.2,.6],[.2,.6],[-.2,-.6],[.2,-.6]])sc.cyl(.08,1,w,ox+x,0,oz+z,5);sc.box(.7,.1,.7,0xC8102E,ox,1.75,oz);ry=1.85}
 else if(pt==='palanquin'){sc.box(1.2,1,1.6,0xC8102E,ox,1,oz);sc.add(E3.prismG(0,1,.6,4,Math.PI/4),0xD9A931,ox,2,oz);sc.box(.1,.1,4,0x5a3a22,ox-.7,1.6,oz);sc.box(.1,.1,4,0x5a3a22,ox+.7,1.6,oz);for(const [x,z] of [[-.7,-1.7],[.7,-1.7],[-.7,1.7],[.7,1.7]]){const F=figure(sc,{fem:false,col:0xF6EEDF,tur:'#F6EEDF'});F.set(ox+x,oz+z)}ry=-1}
 else if(pt==='camel'){for(const dx of [-1.2,1.2]){const c=0xC9A26E;sc.box(.6,.8,1.6,c,ox+dx,1.3,oz);sc.ball(.45,c,ox+dx,2.2,oz);sc.box(.3,1,.3,c,ox+dx,1.8,oz-.9);sc.box(.35,.3,.6,c,ox+dx,2.7,oz-1.1);for(const [x,z] of [[-.2,.6],[.2,.6],[-.2,-.6],[.2,-.6]])sc.cyl(.07,1.3,c,ox+dx+x,0,oz+z,5);sc.box(.7,.1,1,0xC8102E,ox+dx,2.1,oz+.3)}ry=2.15}
 if(ry===0){for(let i=0;i<4;i++)sc.point(ox-1.5+i,1.6,oz+1,'#FFC765',.09,1)}
 const g=sc.group(m,ox,oz);let rider=null;if(ry>=0){rider=figure(sc,{fem:false,col:0xF2E3C6,top:0xF2E3C6,tur:'#D9A931',plume:1,beard:false});rider.set(ox,oz,ry)}g.rider=rider;g.riderY=Math.max(0,ry);return g}
