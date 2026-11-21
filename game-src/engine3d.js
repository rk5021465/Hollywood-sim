"use strict";
// Tiny painter's-algorithm 3D renderer on Canvas 2D. No WebGL needed.
const E3=(()=>{
const hex=h=>[(h>>16)&255,(h>>8)&255,h&255];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
function mk(polys,center){return polys.map(v=>{let n=[0,0,0];for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];n[0]+=(a[1]-b[1])*(a[2]+b[2]);n[1]+=(a[2]-b[2])*(a[0]+b[0]);n[2]+=(a[0]-b[0])*(a[1]+b[1])}n=norm(n);const c=[0,0,0];v.forEach(p=>{c[0]+=p[0]/v.length;c[1]+=p[1]/v.length;c[2]+=p[2]/v.length});if(dot(n,sub(c,center))<0)n=[-n[0],-n[1],-n[2]];return{v,n}})}
const cache={};
function boxG(w,h,d){const k='b'+w+'_'+h+'_'+d;if(cache[k])return cache[k];const x=w/2,z=d/2,P=[[-x,0,-z],[x,0,-z],[x,0,z],[-x,0,z],[-x,h,-z],[x,h,-z],[x,h,z],[-x,h,z]],F=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];return cache[k]=mk(F.map(f=>f.map(i=>P[i])),[0,h/2,0])}
function prismG(rt,rb,h,n,a0=0){const k='p'+[rt,rb,h,n,a0].join('_');if(cache[k])return cache[k];const F=[],T=[],B=[];for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2,b=a0+(i+1)/n*Math.PI*2;const p1=[Math.cos(a)*rb,0,Math.sin(a)*rb],p2=[Math.cos(b)*rb,0,Math.sin(b)*rb],p3=[Math.cos(b)*rt,h,Math.sin(b)*rt],p4=[Math.cos(a)*rt,h,Math.sin(a)*rt];F.push(rt>0?[p1,p2,p3,p4]:[p1,p2,[0,h,0]]);B.push(p1);if(rt>0)T.push(p4)}F.push(B);if(rt>0)F.push(T);return cache[k]=mk(F,[0,h/2,0])}
function sphG(r,n=7,m=5,half=false){const k='s'+[r,n,m,half].join('_');if(cache[k])return cache[k];const F=[],mm=half?Math.ceil(m/2):m;for(let j=0;j<mm;j++){const t1=j/m*Math.PI,t2=(j+1)/m*Math.PI;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,P=(t,p)=>[Math.sin(t)*Math.cos(p)*r,Math.cos(t)*r,Math.sin(t)*Math.sin(p)*r];F.push(j==0?[P(t1,a),P(t2,a),P(t2,b)]:j==m-1?[P(t1,a),P(t2,a),P(t1,b)]:[P(t1,a),P(t2,a),P(t2,b),P(t1,b)])}}return cache[k]=mk(F,[0,0,0])}
function gridG(size,n,y=0){const F=[],S=size/n,h=size/2;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-h+i*S,z=-h+j*S;F.push({v:[[x,y,z],[x+S,y,z],[x+S,y,z+S],[x,y,z+S]],n:[0,1,0],chk:(i+j)%2})}return F}

class Scene{
 constructor(canvas,h){this.cv=canvas;this.ctx=canvas.getContext('2d');this.h=h;this.O=[];this.pts=[];this.parts=[];this.th=.75;this.ph=.62;this.dist=24;this.tg=[0,1.2,0];this.drag=false;this.idle=0;this.fire=[0,1,0];this.fireOn=1;this.amb=.32;this.sky='#0d0a12';this.stars=true;this.onFrame=null;this.run=false;this.T0=performance.now();
  const cv=canvas;let lx,ly,pd=null;
  cv.addEventListener('pointerdown',e=>{this.drag=true;lx=e.clientX;ly=e.clientY;try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!this.drag)return;this.th-=(e.clientX-lx)*.008;this.ph=Math.min(1.3,Math.max(.22,this.ph+(e.clientY-ly)*.005));lx=e.clientX;ly=e.clientY;this.idle=0});
  const up=()=>this.drag=false;cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  this.resize();}
 resize(){const DPR=Math.min(window.devicePixelRatio||1,2),w=this.cv.clientWidth||this.cv.parentNode.clientWidth||360;this.w=w;this.cv.width=w*DPR;this.cv.height=this.h*DPR;this.cv.style.height=this.h+'px';this.ctx.setTransform(DPR,0,0,DPR,0,0)}
 clear(){this.O=[];this.pts=[];this.parts=[]}
 add(g,col,x,y,z,o={}){const ob=Object.assign({g,col:hex(col),p:[x,y,z],ry:0,s:[1,1,1],vis:true},o);this.O.push(ob);return ob}
 box(w,h,d,col,x,y,z,o){return this.add(boxG(w,h,d),col,x,y,z,o)}
 cyl(r,h,col,x,y,z,n=8,o){return this.add(prismG(r,r,h,n),col,x,y,z,o)}
 cone(r,h,col,x,y,z,n=8,o,a0=0){return this.add(prismG(0,r,h,n,a0),col,x,y,z,o)}
 ball(r,col,x,y,z,o){return this.add(sphG(r,6,4),col,x,y,z,o)}
 dome(r,col,x,y,z,o){return this.add(sphG(r,8,6,true),col,x,y,z,o)}
 ground(size,n,c1,c2,side){this.add(boxG(size,.4,size).filter(f=>f.n[1]<.5),side,0,-.4,0,{layer:1});const F=gridG(size,n);this.add(F.filter(f=>!f.chk),c1,0,0,0,{layer:2});this.add(F.filter(f=>f.chk),c2,0,0,0,{layer:2})}
 point(x,y,z,col,size,blink){this.pts.push({p:[x,y,z],col,size,blink:blink||0,ph:Math.random()*6})}
 start(){if(this.run)return;this.run=true;const loop=()=>{if(!this.run)return;if(!document.body.contains(this.cv)){this.run=false;return}this.frame();requestAnimationFrame(loop)};requestAnimationFrame(loop)}
 stop(){this.run=false}
 frame(){const t=(performance.now()-this.T0)/1000,ctx=this.ctx,W=this.w,H=this.h;
  if(!this.drag&&++this.idle>150)this.th+=.0018;
  if(this.onFrame)this.onFrame(t);
  const tg=this.tg,cp=[tg[0]+Math.sin(this.th)*Math.cos(this.ph)*this.dist,tg[1]+Math.sin(this.ph)*this.dist,tg[2]+Math.cos(this.th)*Math.cos(this.ph)*this.dist];
  const f=norm(sub(tg,cp)),r=norm(cross(f,[0,1,0])),u=cross(r,f),Fc=Math.min(W,H*1.15)*1.25,cx=W/2,cy=H*.5;
  const L=norm([-.4,.9,.5]),FP=this.fire,fi=this.fireOn*(1+Math.sin(t*9)*.15),amb=this.amb,D=[];
  for(const o of this.O){if(!o.vis)continue;const c=Math.cos(o.ry),s=Math.sin(o.ry);for(const fc of o.g){const wv=fc.v.map(v=>{const x=v[0]*o.s[0],y=v[1]*o.s[1],z=v[2]*o.s[2];return[x*c-z*s+o.p[0],y+o.p[1],x*s+z*c+o.p[2]]});
   const n=[fc.n[0]*c-fc.n[2]*s,fc.n[1],fc.n[0]*s+fc.n[2]*c];let ctr=[0,0,0];for(const p of wv){ctr[0]+=p[0];ctr[1]+=p[1];ctr[2]+=p[2]}ctr=[ctr[0]/wv.length,ctr[1]/wv.length,ctr[2]/wv.length];
   if(dot(n,sub(cp,ctr))<=0)continue;let ok=true,sum=0;const sp=wv.map(p=>{const d=sub(p,cp),z=dot(d,f);if(z<.3)ok=false;sum+=z;return[cx+dot(d,r)/z*Fc,cy-dot(d,u)/z*Fc]});if(!ok)continue;
   let col;if(o.emit)col=o.col;else{const dif=Math.max(0,dot(n,L));const tf=sub(FP,ctr),dd=Math.hypot(tf[0],tf[1],tf[2])||1,pl=Math.max(0,dot(n,[tf[0]/dd,tf[1]/dd,tf[2]/dd]))*fi*1.4/(1+dd*dd*.3);
    col=[Math.min(255,o.col[0]*(amb+.5*dif)+pl*90*o.col[0]/255+pl*40),Math.min(255,o.col[1]*(amb+.5*dif)*.97+pl*55*o.col[1]/255+pl*20),Math.min(255,o.col[2]*(amb+.04+.5*dif)+pl*10)]}
   D.push({z:sum/wv.length+(o.layer?1e6*(3-o.layer):0),sp,col})}}
  for(const q of this.pts.concat(this.parts)){const d=sub(q.p,cp),z=dot(d,f);if(z<.3)continue;const on=q.blink?Math.sin(t*3*q.blink+q.ph)>-.5:true;D.push({z,b:[cx+dot(d,r)/z*Fc,cy-dot(d,u)/z*Fc],rad:Math.max(1.2,Fc*(q.size||.09)/z),on,col:q.col,a:q.a==null?1:q.a})}
  D.sort((a,b)=>b.z-a.z);
  ctx.fillStyle=this.sky;ctx.fillRect(0,0,W,H);
  if(this.stars){ctx.fillStyle='rgba(246,238,223,.45)';for(let i=0;i<36;i++){const x=((i*97.3+this.th*40)%W+W)%W,y=(i*53.7)%(H*.38);ctx.fillRect(x,y,1.2,1.2)}}
  for(const d of D){if(d.b){ctx.globalAlpha=d.a;const c=d.col||'#FFE27A';ctx.fillStyle=d.on?c:'#6a5a30';ctx.globalAlpha=d.a*(d.on?.22:.1);ctx.beginPath();ctx.arc(d.b[0],d.b[1],d.rad*2.6,0,7);ctx.fill();ctx.globalAlpha=d.a;ctx.beginPath();ctx.arc(d.b[0],d.b[1],d.rad,0,7);ctx.fill();ctx.globalAlpha=1;continue}
   const cs='rgb('+(d.col[0]|0)+','+(d.col[1]|0)+','+(d.col[2]|0)+')';ctx.fillStyle=cs;ctx.strokeStyle=cs;ctx.lineWidth=.6;ctx.beginPath();d.sp.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.stroke()}
 }
}
return{Scene,boxG,prismG,sphG};
})();

// Build a wedding venue scene from a plan
function buildVenue(sc,plan,opt={}){
 sc.clear();let kind=plan.venue?plan.venue.kind:'haveli';const own2=kind==='haveli2';if(own2)kind='haveli';const R=Math.random;
 const pal={haveli:[0xC98B6B,0xBF8061,0x7a4a38],garden:[0x1F4A35,0x23523B,0x163527],temple:[0xB8A48A,0xAD9A80,0x6e604e],tent:[0xC9A56E,0xBF9B63,0x7a603a],palace:[0xE8E0D2,0xDCD3C4,0x8f877a]}[kind];
 sc.ground(18,12,pal[0],pal[1],pal[2]);
 sc.dist=kind==='palace'||kind==='tent'?25:23;
 // venue architecture
 const pink=0xD9917A,pinkD=0xB8705C;
 if(kind==='haveli'){
  for(const [x,z,w,d] of [[0,-8.6,18,.8],[-8.6,0,.8,18],[8.6,0,.8,18]]){sc.box(w,3.4,d,pink,x,0,z);sc.box(w+.2,.3,d+.2,pinkD,x,3.4,z)}
  for(let i=-3;i<=3;i++){sc.box(1.2,2,.1,0x5a2f24,i*2.4,.2,-8.15);sc.dome(.6,pinkD,i*2.4,2.2,-8.2)}
  for(let i=0;i<5;i++)sc.box(.8,.9,.3,pinkD,-7.5+i*3.7,3.7,-8.6);
 } else if(kind==='garden'){
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.3,rr=7.6;const x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(z>6&&Math.abs(x)<4)continue;sc.cyl(.2,1.4,0x5a3a22,x,0,z,6);sc.add(E3.sphG(1.2,7,5),0x2e6b3a,x,2.2,z)}
  for(let i=0;i<6;i++){const x=-6+i*2.4;sc.ball(.5,0xC8102E,x,.4,-6.8);sc.ball(.4,0xF29F05,x+1.2,.35,-6.6)}
 } else if(kind==='temple'){
  sc.box(5,1.2,4,0xB8A48A,0,0,-7);sc.box(3,2.2,3,0xC9B594,0,1.2,-7);sc.cone(1.8,3.2,0xD9C29A,0,3.4,-7,8);sc.add(E3.prismG(0,.15,1.2,4),0xD9A931,0,6.6,-7);
  for(const x of [-7.5,7.5])for(const z of [-7.5,7.5]){sc.cyl(.35,2.8,0xC9B594,x,0,z,8);sc.dome(.55,0xD9C29A,x,2.8,z)}
  sc.cyl(.15,4,0xD9A931,6,0,-6,6);sc.add(E3.prismG(0,.6,.5,3),0xF29F05,6.3,3.4,-6,{ry:1.57});
 } else if(kind==='tent'){
  for(const [x,z,s] of [[-5.5,-5,3],[5.5,-5,3],[-6,4,2.4],[6,4,2.4]]){sc.box(s*2,1.8,s*2,0xF2E3C6,x,0,z);sc.cone(s*1.6,1.8,[0xC8102E,0xF29F05,0x2a6fb0,0xC8102E][Math.abs(x+z)%4|0],x,1.8,z,4,{},Math.PI/4)}
  for(let i=0;i<4;i++)sc.add(E3.prismG(0,1.2,2.2,6),0xC9A56E,-8+i*5.3,0,-9.5);
 } else if(kind==='palace'){
  for(const [x,z,w,d] of [[0,-8.6,18,.8],[-8.6,0,.8,18],[8.6,0,.8,18]]){sc.box(w,4.2,d,0xEDE6D8,x,0,z);sc.box(w+.2,.35,d+.2,0xD9A931,x,4.2,z)}
  for(const x of [-6,-2,2,6]){for(const c of [-.7,.7])sc.cyl(.08,1.2,0xEDE6D8,x+c,4.55,-8.6,6);sc.dome(1,0xEDE6D8,x,5.75,-8.6);sc.add(E3.prismG(0,.08,.6,4),0xD9A931,x,6.7,-8.6)}
  for(let i=-3;i<=3;i++){sc.box(1.4,2.6,.1,0x3b5f8f,i*2.4,.4,-8.15)}
  sc.box(3,.15,3,0x7fb7d6,0,0,4.6,{layer:0});
 }
 // mandap at centre
 const isNikah=opt.trad==='muslim';
 sc.box(4.2,.45,4.2,kind==='palace'?0xF6EEDF:0xF6EEDF,0,0,0);sc.box(4.4,.1,4.4,0xD9A931,0,0,0);
 const dq=plan.decor?plan.decor.q:1;const canopyC=[0xC8102E,0xC8102E,0xC8102E,0xE07B00,0x8A1538,0xB3122E][dq];
 for(const [x,z] of [[-1.75,-1.75],[1.75,-1.75],[-1.75,1.75],[1.75,1.75]]){sc.add(E3.prismG(.13,.15,3.1,8),0xD9A931,x,.45,z);if(dq>=2)for(let i=0;i<(dq>=3?6:3);i++)sc.ball(.14,i%2?0xF29F05:0xF4C430,x,.9+i*.42,z)}
 sc.box(4.5,.16,4.5,0xD9A931,0,3.5,0);sc.add(E3.prismG(0,3.15,1.9,4,Math.PI/4),canopyC,0,3.66,0);sc.ball(.24,0xD9A931,0,5.7,0);
 if(isNikah){sc.box(2.4,.5,1,0xF6EEDF,0,.45,-.6);sc.box(2.4,.9,.15,0xD9A931,0,.95,-1.05)}
 else{sc.box(.75,.28,.75,0x5a3a1a,0,.45,0);const f1=sc.cone(.28,.75,0xFFB040,0,.73,0,6,{emit:1}),f2=sc.cone(.14,.5,0xFFE27A,0,.73,0,6,{emit:1});sc._fl=[f1,f2]}
 // decor strings
 if(dq>=3){const n=dq>=4?72:40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;sc.point(Math.cos(a)*5.2,3.1-Math.abs(Math.sin(a*6))*.5,Math.sin(a)*5.2,'#F29F05',.07)}}
 if(dq>=4){for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]]){sc.cyl(.1,3.2,0xD9A931,x,0,z,6);sc.ball(.3,0xF29F05,x,3.3,z)}}
 if(dq>=5){sc.box(9,.1,9,0xD9A931,0,4.6,0,{});}
 // feast tables
 if(plan.feast){sc.box(1.1,.9,6.2,0xF6EEDF,6.3,0,0);sc.box(1.2,.08,6.4,0xD9A931,6.3,.9,0);const nq=plan.feast.q;for(let i=0;i<Math.min(6,nq+1);i++)sc.add(E3.prismG(.3,.36,.25,10),0xA9B0C3,6.3,.98,-2.5+i*1);}
 // music
 if(plan.music){const nm=[0,2,3,4,6,7][plan.music.q];for(let i=0;i<nm;i++){const x=-6.5+(i%4)*.8,z=4+Math.floor(i/4)*.8;sc.add(E3.prismG(.17,.25,.7,7),0xF6EEDF,x,0,z);sc.ball(.17,0xC68B5E,x,.88,z);sc.ball(.2,i%2?0xC8102E:0xF29F05,x,1.08,z)}}
 // gate
 sc.add(E3.prismG(.28,.32,3.6,8),0xE9A23B,-2.4,0,7.6);sc.add(E3.prismG(.28,.32,3.6,8),0xE9A23B,2.4,0,7.6);
 for(let i=0;i<=12;i++){const a=i/12*Math.PI;sc.ball(.3,i%2?0xE9A23B:0xF4C430,Math.cos(a)*2.4,3.6+Math.sin(a)*2.2,7.6)}
 // procession
 const pt=plan.procession?plan.procession.type:null;
 if(pt==='elephant'){const g=0x8f8a8a;sc.box(2.6,1.6,1.4,g,0,1.2,10.5);sc.box(.9,1,1,g,0,1.9,11.9);sc.add(E3.prismG(.15,.25,1.4,6),g,0,.6,12.4);for(const [x,z] of [[-.9,9.8],[.9,9.8],[-.9,11.2],[.9,11.2]])sc.cyl(.3,1.2,g,x,0,z,6);sc.box(2.8,.15,1.6,0xC8102E,0,2.8,10.5);sc.box(1.2,.6,1,0xD9A931,0,2.95,10.4)}
 else if(pt==='horse'){const w=0xF2EFEA;sc.box(.6,.7,1.8,w,0,1,10.6);sc.box(.4,.8,.5,w,0,1.5,11.5);for(const [x,z] of [[-.2,10],[.2,10],[-.2,11.2],[.2,11.2]])sc.cyl(.08,1,w,x,0,z,5);sc.box(.7,.1,.7,0xC8102E,0,1.75,10.6);sc.add(E3.prismG(.17,.24,.6,7),0xD9A931,0,1.85,10.5);sc.ball(.18,0xC68B5E,0,2.6,10.5);sc.ball(.22,0xC8102E,0,2.8,10.5)}
 else if(pt==='palanquin'){sc.box(1.2,1,1.6,0xC8102E,0,1,10.6);sc.add(E3.prismG(0,1,.6,4,Math.PI/4),0xD9A931,0,2,10.6);sc.box(.1,.1,4,0x5a3a22,-.7,1.6,10.6);sc.box(.1,.1,4,0x5a3a22,.7,1.6,10.6);for(const [x,z] of [[-.7,8.9],[.7,8.9],[-.7,12.3],[.7,12.3]]){sc.add(E3.prismG(.15,.2,1.4,6),0xF6EEDF,x,0,z);sc.ball(.15,0xA86F48,x,1.5,z)}}
 else if(pt==='camel'){for(const dx of [-1.2,1.2]){const c=0xC9A26E;sc.box(.6,.8,1.6,c,dx,1.3,10.6);sc.ball(.45,c,dx,2.2,10.6);sc.box(.3,1,.3,c,dx,1.8,11.5);sc.box(.35,.3,.6,c,dx,2.7,11.7);for(const [x,z] of [[-.2,10],[.2,10],[-.2,11.2],[.2,11.2]])sc.cyl(.07,1.3,c,dx+x,0,z,5);sc.box(.7,.1,1,0xC8102E,dx,2.1,10.3)}}
 else{for(let i=0;i<4;i++)sc.point(-1.5+i,1.6,10.5,'#FFC765',.09,1)}
 // lights
 const lt=plan.lights?plan.lights.type:'diya';
 if(lt==='diya'||!plan.lights){for(let i=0;i<40;i++){const a=i/40*Math.PI*2;sc.point(Math.cos(a)*3,.5,Math.sin(a)*3,'#FFC765',.05,.6)}}
 if(lt==='torch'){for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const x=Math.cos(a)*7.4,z=Math.sin(a)*7.4;sc.cyl(.07,2.2,0x5a3a22,x,0,z,5);sc.point(x,2.4,z,'#FF9A3C',.16,2)}}
 if(lt==='fireworks'){for(let i=0;i<48;i++){const a=i/48*Math.PI*2;sc.point(Math.cos(a)*8.4,3.3-Math.abs(Math.sin(a*4))*.4,Math.sin(a)*8.4,'#FFE27A',.08,1)}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;sc.cyl(.06,3.4,0xA9B0C3,Math.cos(a)*8.4,0,Math.sin(a)*8.4,5)}
  sc._fw=[];for(let k=0;k<3;k++){const b={c:[(R()-.5)*14,9+R()*4,(R()-.5)*14],t0:R()*3,col:['#FF5A5A','#FFE27A','#7FD3FF','#F29F05'][k%4],ps:[]};for(let i=0;i<22;i++){const a=R()*6.28,e=R()*3.14;const q={p:[0,0,0],d:[Math.cos(a)*Math.sin(e),Math.cos(e),Math.sin(a)*Math.sin(e)],col:b.col,size:.09,a:1};b.ps.push(q);sc.parts.push(q)}sc._fw.push(b)}}
 // guests
 const ng=Math.max(8,Math.min(44,Math.round((opt.guests||200)/30)));const cols=[0xC8102E,0x2a6fb0,0xE9A23B,0x5E8C46,0xF6EEDF,0xD9A931,0xE8A0A8,0x8E44AD,0xE07B00];const skins=[0xC68B5E,0xA86F48,0x8E5A3A];
 const G=[];const bodyG=E3.prismG(.17,.27,.78,7),headG=E3.sphG(.18,6,4),turG=E3.sphG(.2,6,4);
 for(let i=0;i<ng;i++){const r=3.6+R()*3.6,a=R()*6.28;const g={b:sc.add(bodyG,cols[i%9],0,0,0),h:sc.add(headG,skins[i%3],0,0,0),tb:i%3===0?sc.add(turG,[0xC8102E,0xF29F05,0xE9A23B,0xF6EEDF][i%4],0,0,0):null,r,a,s:(R()<.5?-1:1)*(.04+R()*.1)};G.push(g)}
 // couple on mandap
 if(opt.couple){sc.add(bodyG,0xC8102E,-.45,.45,.4);sc.ball(.18,0xC68B5E,-.45,1.38,.4);sc.ball(.2,0xC8102E,-.45,1.5,.4);sc.add(bodyG,0xF2E3C6,.45,.45,.4);sc.ball(.18,0xA86F48,.45,1.38,.4);sc.ball(.22,0xE9A23B,.45,1.55,.4)}
 const warn=sc.ball(.24,0xE5484D,0,-5,0,{emit:1});warn.vis=false;sc._warn=warn;sc._G=G;
 sc.fire=[0,1.1,0];sc.fireOn=isNikah?.4:1;
 sc.onFrame=t=>{
  if(sc._fl){const f=1+Math.sin(t*12)*.14+Math.sin(t*7.3)*.09;sc._fl[0].s=[f,f*1.15,f];sc._fl[1].s=[f,f,f]}
  for(let i=0;i<G.length;i++){const g=G[i];g.a+=g.s*.012;const x=Math.cos(g.a)*g.r,z=Math.sin(g.a)*g.r,y=Math.abs(Math.sin(t*6+i))*.05;g.b.p=[x,y,z];g.h.p=[x,y+.95,z];if(g.tb)g.tb.p=[x,y+1.05,z];g.b.ry=-g.a}
  if(sc._warn.vis&&G[0])sc._warn.p=[G[0].b.p[0],1.8+Math.sin(t*4)*.12,G[0].b.p[2]];
  if(sc._fw)for(const b of sc._fw){const tt=((t+b.t0)%3.2)/1.6;for(const q of b.ps){if(tt>1){q.a=0;continue}q.p=[b.c[0]+q.d[0]*tt*3,b.c[1]+q.d[1]*tt*3-tt*tt*1.2,b.c[2]+q.d[2]*tt*3];q.a=1-tt}}
 };
}
