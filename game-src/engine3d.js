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
function flatG(w,d,y=.02){return[{v:[[-w/2,y,-d/2],[w/2,y,-d/2],[w/2,y,d/2],[-w/2,y,d/2]],n:[0,1,0]}]}
function gridG(size,n,y=0){const F=[],S=size/n,h=size/2;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-h+i*S,z=-h+j*S;F.push({v:[[x,y,z],[x+S,y,z],[x+S,y,z+S],[x,y,z+S]],n:[0,1,0],chk:(i+j)%2})}return F}
const lerp=(a,b,t)=>a+(b-a)*t;
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}

class Scene{
 constructor(canvas,h){this.cv=canvas;this.ctx=canvas.getContext('2d');this.h=h;this.O=[];this.pts=[];this.parts=[];this.labels=[];this.th=.75;this.ph=.62;this.dist=24;this.tg=[0,1.2,0];this.goal=null;this.drag=false;this.idle=0;this.auto=true;this.fire=[0,1,0];this.fireOn=1;this.amb=.32;this.sky='#0d0a12';this.stars=true;this.ticks=[];this.run=false;this.T0=performance.now();this.onTap=null;
  const cv=canvas;let lx,ly,dx0,dy0,t0;
  cv.addEventListener('pointerdown',e=>{this.drag=true;lx=dx0=e.clientX;ly=dy0=e.clientY;t0=performance.now();try{cv.setPointerCapture(e.pointerId)}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!this.drag)return;const mx=e.clientX-lx,my=e.clientY-ly;if(Math.abs(e.clientX-dx0)+Math.abs(e.clientY-dy0)>6){this.th-=mx*.008;this.ph=Math.min(1.35,Math.max(.22,this.ph+my*.005));this.idle=0;if(this.goal){this.goal.th=null;this.goal.ph=null}}lx=e.clientX;ly=e.clientY});
  const up=e=>{if(this.drag&&e.type==='pointerup'&&Math.abs(e.clientX-dx0)+Math.abs(e.clientY-dy0)<8&&performance.now()-t0<450&&this.onTap){const r=cv.getBoundingClientRect();this.onTap(e.clientX-r.left,e.clientY-r.top)}this.drag=false};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  this.resize();}
 resize(){const DPR=Math.min(window.devicePixelRatio||1,2),w=this.cv.clientWidth||this.cv.parentNode.clientWidth||360;this.w=w;this.cv.width=w*DPR;this.cv.height=this.h*DPR;this.cv.style.height=this.h+'px';this.ctx.setTransform(DPR,0,0,DPR,0,0)}
 clear(){this.O=[];this.pts=[];this.parts=[];this.labels=[];this.ticks=[]}
 add(g,col,x,y,z,o={}){const ob=Object.assign({g,col:hex(col),p:[x,y,z],ry:0,s:[1,1,1],vis:true},o);this.O.push(ob);return ob}
 box(w,h,d,col,x,y,z,o){return this.add(boxG(w,h,d),col,x,y,z,o)}
 cyl(r,h,col,x,y,z,n=8,o){return this.add(prismG(r,r,h,n),col,x,y,z,o)}
 cone(r,h,col,x,y,z,n=8,o,a0=0){return this.add(prismG(0,r,h,n,a0),col,x,y,z,o)}
 ball(r,col,x,y,z,o){return this.add(sphG(r,6,4),col,x,y,z,o)}
 dome(r,col,x,y,z,o){return this.add(sphG(r,8,6,true),col,x,y,z,o)}
 flat(w,d,col,x,z,o){return this.add(flatG(w,d),col,x,0,z,Object.assign({layer:2.5},o||{}))}
 ground(size,n,c1,c2,side){this.add(boxG(size,.4,size).filter(f=>f.n[1]<.5),side,0,-.4,0,{layer:1});const F=gridG(size,n);this.add(F.filter(f=>!f.chk),c1,0,0,0,{layer:2});this.add(F.filter(f=>f.chk),c2,0,0,0,{layer:2})}
 point(x,y,z,col,size,blink){const q={p:[x,y,z],col,size,blink:blink||0,ph:Math.random()*6};this.pts.push(q);return q}
 face(x,y,z,f){const q={p:[x,y,z],face:f,size:.2,vis:true};this.pts.push(q);return q}
 mark(){return{o:this.O.length,p:this.pts.length}}
 group(m,ox,oz){const g={objs:this.O.slice(m.o).map(o=>({o,b:o.p.slice()})),pts:this.pts.slice(m.p).map(q=>({q,b:q.p.slice()})),ox,oz,at(x,z,y=0){for(const e of this.objs)e.o.p=[e.b[0]-this.ox+x,e.b[1]+y,e.b[2]-this.oz+z];for(const e of this.pts)e.q.p=[e.b[0]-this.ox+x,e.b[1]+y,e.b[2]-this.oz+z]},show(v){for(const e of this.objs)e.o.vis=v;for(const e of this.pts)e.q.vis=v}};return g}
 camTo(g){this.goal=Object.assign({th:null,ph:null,dist:null,tg:null},g);this.auto=false}
 start(){if(this.run)return;this.run=true;const loop=()=>{if(!this.run)return;if(!document.body.contains(this.cv)){this.run=false;return}this.frame();requestAnimationFrame(loop)};requestAnimationFrame(loop)}
 stop(){this.run=false}
 toGround(x,y){const P=this._P;if(!P)return null;const d=norm([P.f[0]+P.r[0]*(x-P.cx)/P.Fc-P.u[0]*(y-P.cy)/P.Fc,P.f[1]+P.r[1]*(x-P.cx)/P.Fc-P.u[1]*(y-P.cy)/P.Fc,P.f[2]+P.r[2]*(x-P.cx)/P.Fc-P.u[2]*(y-P.cy)/P.Fc]);if(d[1]>=-.01)return null;const t=-P.cp[1]/d[1];return[P.cp[0]+d[0]*t,P.cp[2]+d[2]*t]}
 project(p){const P=this._P;if(!P)return null;const d=sub(p,P.cp),z=dot(d,P.f);if(z<.3)return null;return[P.cx+dot(d,P.r)/z*P.Fc,P.cy-dot(d,P.u)/z*P.Fc,z]}
 frame(){const now=performance.now(),t=(now-this.T0)/1000,dt=Math.min(.05,(now-(this._lt||now))/1000);this._lt=now;const ctx=this.ctx,W=this.w,H=this.h;
  if(this.goal){const g=this.goal,k=Math.min(1,dt*2.2);if(g.th!=null){let d=g.th-this.th;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;this.th+=d*k}if(g.ph!=null)this.ph=lerp(this.ph,g.ph,k);if(g.dist!=null)this.dist=lerp(this.dist,g.dist,k);if(g.tg)this.tg=this.tg.map((v,i)=>lerp(v,g.tg[i],k))}
  else if(this.auto&&!this.drag&&++this.idle>150)this.th+=.0018;
  for(const f of this.ticks)f(t,dt);
  const tg=this.tg,cp=[tg[0]+Math.sin(this.th)*Math.cos(this.ph)*this.dist,tg[1]+Math.sin(this.ph)*this.dist,tg[2]+Math.cos(this.th)*Math.cos(this.ph)*this.dist];
  const f=norm(sub(tg,cp)),r=norm(cross(f,[0,1,0])),u=cross(r,f),Fc=Math.min(W,H*1.15)*1.25,cx=W/2,cy=H*.5;this._P={cp,f,r,u,Fc,cx,cy};
  const L=norm([-.4,.9,.5]),FP=this.fire,fi=this.fireOn*(1+Math.sin(t*9)*.15),amb=this.amb,D=[];
  for(const o of this.O){if(!o.vis)continue;const c=Math.cos(o.ry),s=Math.sin(o.ry);for(const fc of o.g){const wv=fc.v.map(v=>{const x=v[0]*o.s[0],y=v[1]*o.s[1],z=v[2]*o.s[2];return[x*c-z*s+o.p[0],y+o.p[1],x*s+z*c+o.p[2]]});
   const n=[fc.n[0]*c-fc.n[2]*s,fc.n[1],fc.n[0]*s+fc.n[2]*c];let ctr=[0,0,0];for(const p of wv){ctr[0]+=p[0];ctr[1]+=p[1];ctr[2]+=p[2]}ctr=[ctr[0]/wv.length,ctr[1]/wv.length,ctr[2]/wv.length];
   if(dot(n,sub(cp,ctr))<=0)continue;let ok=true,sum=0;const sp=wv.map(p=>{const d=sub(p,cp),z=dot(d,f);if(z<.3)ok=false;sum+=z;return[cx+dot(d,r)/z*Fc,cy-dot(d,u)/z*Fc]});if(!ok)continue;
   let col;if(o.emit)col=o.col;else{const dif=Math.max(0,dot(n,L));const tf=sub(FP,ctr),dd=Math.hypot(tf[0],tf[1],tf[2])||1,pl=Math.max(0,dot(n,[tf[0]/dd,tf[1]/dd,tf[2]/dd]))*fi*1.4/(1+dd*dd*.3);
    col=[Math.min(255,o.col[0]*(amb+.5*dif)+pl*90*o.col[0]/255+pl*40),Math.min(255,o.col[1]*(amb+.5*dif)*.97+pl*55*o.col[1]/255+pl*20),Math.min(255,o.col[2]*(amb+.04+.5*dif)+pl*10)]}
   D.push({z:sum/wv.length+(o.layer?1e6*(3-o.layer):0),sp,col,a:o.alpha})}}
  for(const q of this.pts.concat(this.parts)){if(q.vis===false)continue;const d=sub(q.p,cp),z=dot(d,f);if(z<.3)continue;const on=q.blink?Math.sin(t*3*q.blink+q.ph)>-.5:true;D.push({z:z-(q.face?.15:0),b:[cx+dot(d,r)/z*Fc,cy-dot(d,u)/z*Fc],rad:Math.max(q.face?2:1.2,Fc*(q.size||.09)/z),on,col:q.col,a:q.a==null?1:q.a,face:q.face,streak:q.streak})}
  D.sort((a,b)=>b.z-a.z);
  ctx.fillStyle=this.sky;ctx.fillRect(0,0,W,H);
  if(this.stars){ctx.fillStyle='rgba(246,238,223,.45)';for(let i=0;i<36;i++){const x=((i*97.3+this.th*40)%W+W)%W,y=(i*53.7)%(H*.38);ctx.fillRect(x,y,1.2,1.2)}}
  for(const d of D){
   if(d.face){drawFace(ctx,d.b[0],d.b[1],d.rad,d.face);continue}
   if(d.b){if(d.streak){ctx.strokeStyle=d.col;ctx.globalAlpha=d.a;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d.b[0],d.b[1]);ctx.lineTo(d.b[0]-1.5,d.b[1]-d.rad*4);ctx.stroke();ctx.globalAlpha=1;continue}
    const c=d.col||'#FFE27A';ctx.fillStyle=d.on?c:'#6a5a30';ctx.globalAlpha=d.a*(d.on?.22:.1);ctx.beginPath();ctx.arc(d.b[0],d.b[1],d.rad*2.6,0,7);ctx.fill();ctx.globalAlpha=d.a;ctx.beginPath();ctx.arc(d.b[0],d.b[1],d.rad,0,7);ctx.fill();ctx.globalAlpha=1;continue}
   const cs='rgb('+(d.col[0]|0)+','+(d.col[1]|0)+','+(d.col[2]|0)+')';ctx.fillStyle=cs;ctx.strokeStyle=cs;ctx.lineWidth=.6;if(d.a!=null)ctx.globalAlpha=d.a;ctx.beginPath();d.sp.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=1}
  if(this.dark){ctx.fillStyle='rgba(10,12,25,'+this.dark+')';ctx.fillRect(0,0,W,H)}
  for(const lb of this.labels){if(lb.vis===false)continue;const p=typeof lb.p==='function'?lb.p():lb.p;const s=this.project(p);if(!s)continue;let [x,y]=s;
   if(lb.kind==='warn'){const bob=Math.sin(t*5)*2;ctx.fillStyle='#E5484D';ctx.beginPath();ctx.arc(x,y-14+bob,9,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font='600 13px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('!',x,y-9.5+bob);ctx.beginPath();ctx.moveTo(x-4,y-6+bob);ctx.lineTo(x+4,y-6+bob);ctx.lineTo(x,y-1+bob);ctx.fillStyle='#E5484D';ctx.fill()}
   else{ctx.font='500 12px system-ui,sans-serif';const tw=ctx.measureText(lb.text).width;let bx=Math.max(4,Math.min(W-tw-20,x-tw/2-8));const by=y-34;ctx.fillStyle=lb.kind==='good'?'#2d2418':'#F6EEDF';rr(ctx,bx,by,tw+16,22,8);ctx.fill();if(lb.kind==='good'){ctx.strokeStyle='#D9A931';ctx.lineWidth=1;ctx.stroke()}ctx.beginPath();ctx.moveTo(x-5,by+21);ctx.lineTo(x+5,by+21);ctx.lineTo(x,by+28);ctx.fill();ctx.fillStyle=lb.kind==='good'?'#F6EEDF':'#1a1206';ctx.textAlign='left';ctx.fillText(lb.text,bx+8,by+15)}}
 }
}
function drawFace(ctx,x,y,r,f){ctx.fillStyle=f.skin;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
 if(f.fem){ctx.fillStyle=f.veil||'#C8102E';ctx.beginPath();ctx.arc(x,y-r*.1,r*1.18,Math.PI*1.02,Math.PI*1.98);ctx.lineTo(x+r*1.15,y+r*.9);ctx.lineTo(x+r*.85,y+r*.9);ctx.arc(x,y,r*.88,-.05,Math.PI+.05,true);ctx.lineTo(x-r*1.15,y+r*.9);ctx.closePath();ctx.fill();if(r>4){ctx.fillStyle='#C8102E';ctx.beginPath();ctx.arc(x,y-r*.45,r*.12,0,7);ctx.fill()}}
 else if(f.tur){ctx.fillStyle=f.tur;ctx.beginPath();ctx.ellipse(x,y-r*.45,r*1.12,r*.75,0,Math.PI,0);ctx.fill();ctx.beginPath();ctx.ellipse(x,y-r*.5,r*1.05,r*.42,0,0,7);ctx.fill();if(r>5){ctx.fillStyle='#D9A931';ctx.beginPath();ctx.arc(x,y-r*.62,r*.14,0,7);ctx.fill()}}
 else{ctx.fillStyle='#1b1210';ctx.beginPath();ctx.arc(x,y-r*.25,r*.95,Math.PI*1.05,Math.PI*1.95);ctx.fill()}
 if(r>3.2){ctx.fillStyle='#1b1210';ctx.beginPath();ctx.arc(x-r*.35,y+r*.05,Math.max(.6,r*.11),0,7);ctx.arc(x+r*.35,y+r*.05,Math.max(.6,r*.11),0,7);ctx.fill();
  if(f.beard){ctx.beginPath();ctx.arc(x,y+r*.35,r*.62,.1,Math.PI-.1);ctx.fill()}
  else if(f.mood!=null&&r>5){ctx.strokeStyle='#1b1210';ctx.lineWidth=Math.max(.8,r*.1);ctx.beginPath();if(f.mood>0)ctx.arc(x,y+r*.25,r*.32,.3,Math.PI-.3);else if(f.mood<0)ctx.arc(x,y+r*.7,r*.3,Math.PI+.4,-.4);else{ctx.moveTo(x-r*.25,y+r*.45);ctx.lineTo(x+r*.25,y+r*.45)}ctx.stroke()}}}
return{Scene,boxG,prismG,sphG};
})();

const SKINS=['#C68B5E','#A86F48','#8E5A3A','#D29A6A'];
const CLOTH=[0xC8102E,0x2a6fb0,0xE9A23B,0x5E8C46,0xF6EEDF,0xD9A931,0xE8A0A8,0x8E44AD,0xE07B00,0x1f7a7a];
const TURB=['#C8102E','#F29F05','#E9A23B','#F6EEDF','#E8A0A8','#5E8C46'];
const VEIL=['#C8102E','#E8A0A8','#F29F05','#8E44AD','#2a6fb0','#5E8C46'];
function figure(sc,o={}){const R=Math.random;const fem=o.fem!=null?o.fem:R()<.45;const col=o.col!=null?o.col:CLOTH[Math.floor(R()*CLOTH.length)];const sz=o.scale||1;
 const body=sc.add(E3.prismG(.17*sz,(fem?.32:.26)*sz,.78*sz,7),col,0,0,0);
 const face=sc.face(0,0,0,{skin:o.skin||SKINS[Math.floor(R()*4)],fem,veil:o.veil||VEIL[Math.floor(R()*6)],tur:fem?null:(o.tur!==undefined?o.tur:(R()<.55?TURB[Math.floor(R()*6)]:null)),beard:!fem&&(o.beard!=null?o.beard:R()<.25),mood:o.mood!=null?o.mood:1});face.size=.2*sz;
 const F={body,face,x:0,z:0,y:0,ry:0,fem,sz,set(x,z,y=0,ry){this.x=x;this.z=z;this.y=y;this.body.p=[x,y,z];this.face.p=[x,y+.98*this.sz,z];if(ry!=null)this.body.ry=ry},show(v){this.body.vis=v;this.face.vis=v},head(){return[this.x,this.y+1.2*this.sz,this.z]}};F.set(o.x||0,o.z||0);return F}

function drawItem(sc,k,x,z){
 const poly=(n,r,y,a0=0)=>{const v=[];for(let i=0;i<n;i++){const a=a0+i/n*6.28318;v.push([x+Math.cos(a)*r,y,z+Math.sin(a)*r])}return[{v,n:[0,1,0]}]};
 switch(k){
 case'arch':sc.cyl(.12,2.4,0xD9A931,x-.9,0,z,6);sc.cyl(.12,2.4,0xD9A931,x+.9,0,z,6);for(let i=0;i<=8;i++){const a=i/8*Math.PI;sc.ball(.17,i%2?0xF29F05:0xF4C430,x+Math.cos(a)*.9,2.4+Math.sin(a)*.8,z)}break;
 case'lamp':sc.cyl(.06,1.8,0xB8860B,x,0,z,6);sc.add(E3.prismG(.05,.22,.25,6),0xD9A931,x,1.8,z);sc.point(x,2.05,z,'#FFC765',.13,.7);break;
 case'urn':sc.add(E3.prismG(.22,.32,.6,8),0xB8705C,x,0,z);sc.ball(.32,0xC8102E,x,.8,z);sc.ball(.18,0xF29F05,x+.15,.95,z);break;
 case'canopy':for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])sc.cyl(.05,2.2,0xD9A931,x+a,0,z+b,5);sc.add(E3.prismG(0,1.6,.6,4,Math.PI/4),0xE8A0A8,x,2.2,z);break;
 case'fountain':sc.add(E3.prismG(.9,1,.35,10),0xEDE6D8,x,0,z);sc.add(poly(10,.85,.37),0x7fb7d6,0,0,0);sc.cyl(.12,1,0xEDE6D8,x,0,z,6);sc.add(E3.prismG(.4,.15,.15,8),0xEDE6D8,x,1,z);for(let i=0;i<8;i++){const a=i/8*6.28;sc.point(x+Math.cos(a)*.45,1.05,z+Math.sin(a)*.45,'#bfe6ff',.05,1.5)}break;
 case'rangoli':sc.add(poly(8,.9,.025),0xC8102E,0,0,0,{layer:2.5});sc.add(poly(4,.6,.03,.785),0xF29F05,0,0,0,{layer:2.6});sc.add(poly(6,.25,.035),0xF6EEDF,0,0,0,{layer:2.7});break;
 case'swing':sc.cyl(.07,2.4,0x6b4a2a,x-.9,0,z,5);sc.cyl(.07,2.4,0x6b4a2a,x+.9,0,z,5);sc.box(2,.12,.12,0x6b4a2a,x,2.4,z);sc.box(1.1,.08,.5,0xD9A931,x,.6,z);for(let i=0;i<6;i++){sc.ball(.09,0xF29F05,x-.5,.8+i*.27,z);sc.ball(.09,0xF29F05,x+.5,.8+i*.27,z)}break;
 case'elephant':{const g=0x7f8c9a;sc.box(1.6,.3,1,0xB8A48A,x,0,z);sc.box(1.4,.9,.8,g,x,.9,z);sc.box(.5,.55,.55,g,x+.85,1.2,z);sc.add(E3.prismG(.08,.14,.8,6),g,x+1.1,.5,z);for(const [a,b] of [[-.5,-.3],[.5,-.3],[-.5,.3],[.5,.3]])sc.cyl(.15,.6,g,x+a,.3,z+b,6);sc.box(1.5,.08,.9,0xC8102E,x,1.8,z);sc.box(.5,.3,.5,0xD9A931,x,1.88,z);break}
 case'seating':sc.box(1.8,.25,.8,0xC8102E,x,0,z);sc.box(1.8,.5,.15,0xD9A931,x,.25,z-.35);sc.ball(.15,0xF29F05,x-.6,.4,z);sc.ball(.15,0xF29F05,x+.6,.4,z);break;
 case'banana':for(const dx of [-.4,.4]){sc.cyl(.1,1.4,0x6b8e23,x+dx,0,z,6);sc.add(E3.prismG(0,.6,1.2,5),0x3f8f3a,x+dx,1.2,z)}break;
 case'peacock':sc.box(.6,.5,.6,0xEDE6D8,x,0,z);sc.ball(.25,0x1f5fa0,x,.75,z);sc.cyl(.05,.5,0x1f5fa0,x,.75,z,5);sc.ball(.1,0x1f5fa0,x,1.3,z);for(let i=0;i<9;i++){const a=-1.1+i*.27;sc.ball(.16,i%2?0x2a9d6f:0x1f7a7a,x+Math.sin(a)*.8,.85+Math.cos(a)*.8,z-.3)}break;
 }}

function buildVenue(sc,plan,opt={}){
 sc.clear();let kind=plan.venue?plan.venue.kind:'haveli';if(kind==='haveli2')kind='haveli';const R=Math.random;
 const pal={haveli:[0xC98B6B,0xBF8061,0x7a4a38],garden:[0x1F4A35,0x23523B,0x163527],temple:[0xB8A48A,0xAD9A80,0x6e604e],tent:[0xC9A56E,0xBF9B63,0x7a603a],palace:[0xE8E0D2,0xDCD3C4,0x8f877a]}[kind];
 sc.ground(18,12,pal[0],pal[1],pal[2]);sc.add(E3.boxG(4.4,.02,9).filter(f=>f.n[1]>.5),[0x8a5a48,0x2a4a35,0x8d7f6a,0x9a7c50,0xC9C0B0][['haveli','garden','temple','tent','palace'].indexOf(kind)],0,0,13.5,{layer:2});
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
 sc.box(4.5,.16,4.5,0xD9A931,0,3.5,0);sc._canopy=sc.add(E3.prismG(0,3.15,1.9,4,Math.PI/4),canopyC,0,3.66,0);sc.ball(.24,0xD9A931,0,5.7,0);
 sc._fl=null;if(isNikah){sc.box(2.4,.5,1,0xF6EEDF,0,.45,-.6);sc.box(2.4,.9,.15,0xD9A931,0,.95,-1.05)}
 else{sc.box(.75,.28,.75,0x5a3a1a,0,.45,0);const f1=sc.cone(.28,.75,0xFFB040,0,.73,0,6,{emit:1}),f2=sc.cone(.14,.5,0xFFE27A,0,.73,0,6,{emit:1});sc._fl=[f1,f2]}
 if(dq>=3){const n=dq>=4?72:40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;sc.point(Math.cos(a)*5.2,3.1-Math.abs(Math.sin(a*6))*.5,Math.sin(a)*5.2,'#F29F05',.07)}}
 if(dq>=4){for(const [x,z] of [[-5,-5],[5,-5],[-5,5],[5,5]]){sc.cyl(.1,3.2,0xD9A931,x,0,z,6);sc.ball(.3,0xF29F05,x,3.3,z)}}
 sc._pots=[];if(plan.feast){sc.box(1.1,.9,6.2,0xF6EEDF,6.3,0,0);sc.box(1.2,.08,6.4,0xD9A931,6.3,.9,0);const nq=plan.feast.q;for(let i=0;i<Math.min(6,nq+1);i++)sc._pots.push(sc.add(E3.prismG(.3,.36,.25,10),0xA9B0C3,6.3,.98,-2.5+i*1))}
 sc._musos=[];if(plan.music){const nm=[0,2,3,4,6,7][plan.music.q];for(let i=0;i<nm;i++){const F=figure(sc,{fem:false,col:0xF6EEDF,tur:i%2?'#C8102E':'#F29F05'});F.set(-6.5+(i%4)*.8,4+Math.floor(i/4)*.8);sc._musos.push(F)}}
 sc.add(E3.prismG(.28,.32,3.6,8),0xE9A23B,-2.4,0,7.6);sc.add(E3.prismG(.28,.32,3.6,8),0xE9A23B,2.4,0,7.6);
 for(let i=0;i<=12;i++){const a=i/12*Math.PI;sc.ball(.3,i%2?0xE9A23B:0xF4C430,Math.cos(a)*2.4,3.6+Math.sin(a)*2.2,7.6)}
 for(const it of (opt.items||[]))drawItem(sc,it.k,it.x,it.z);
 if(!opt.day&&!opt.noProc)buildProcession(sc,plan.procession?plan.procession.type:null,0,10.6);
 const lt=plan.lights?plan.lights.type:'diya';
 if(lt==='diya'){for(let i=0;i<40;i++){const a=i/40*Math.PI*2;sc.point(Math.cos(a)*3,.5,Math.sin(a)*3,'#FFC765',.05,.6)}}
 if(lt==='torch'){for(let i=0;i<10;i++){const a=i/10*Math.PI*2;const x=Math.cos(a)*7.4,z=Math.sin(a)*7.4;sc.cyl(.07,2.2,0x5a3a22,x,0,z,5);sc.point(x,2.4,z,'#FF9A3C',.16,2)}}
 if(lt==='fireworks'){for(let i=0;i<48;i++){const a=i/48*Math.PI*2;sc.point(Math.cos(a)*8.4,3.3-Math.abs(Math.sin(a*4))*.4,Math.sin(a)*8.4,'#FFE27A',.08,1)}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;sc.cyl(.06,3.4,0xA9B0C3,Math.cos(a)*8.4,0,Math.sin(a)*8.4,5)}
  if(!opt.day)addFireworks(sc,3)}
 const ng=opt.noGuests?0:Math.max(8,Math.min(40,Math.round((opt.guests||200)/30)));const G=[];
 for(let i=0;i<ng;i++){const F=figure(sc);F.r=3.6+R()*3.6;F.a=R()*6.28;F.s=(R()<.5?-1:1)*(.04+R()*.1);F.mode='wander';G.push(F)}
 if(opt.couple&&!opt.day){const B=figure(sc,{fem:true,col:0xC8102E,veil:'#C8102E'}),Gm=figure(sc,{fem:false,col:0xF2E3C6,tur:'#E9A23B'});B.set(-.45,.4,.45);Gm.set(.45,.4,.45)}
 sc._G=G;sc.fire=[0,1.1,0];sc.fireOn=isNikah?.4:1;
 sc.ticks.push((t)=>{
  if(sc._fl){const f=1+Math.sin(t*12)*.14+Math.sin(t*7.3)*.09;sc._fl[0].s=[f,f*1.15,f];sc._fl[1].s=[f,f,f]}
  for(let i=0;i<G.length;i++){const g=G[i];if(g.mode!=='wander')continue;g.a+=g.s*.012;const x=Math.cos(g.a)*g.r,z=Math.sin(g.a)*g.r;g.set(x,z,Math.abs(Math.sin(t*6+i))*.05,-g.a)}
  for(let i=0;i<sc._musos.length;i++){const m=sc._musos[i];m.set(m.x,m.z,Math.abs(Math.sin(t*8+i))*.08)}
 });
}
function addFireworks(sc,n){const R=Math.random;const fw=[];for(let k=0;k<n;k++){const b={c:[(R()-.5)*14,9+R()*4,(R()-.5)*14],t0:R()*3,col:['#FF5A5A','#FFE27A','#7FD3FF','#F29F05','#C77DFF'][k%5],ps:[]};for(let i=0;i<24;i++){const a=R()*6.28,e=R()*3.14;const q={p:[0,-50,0],d:[Math.cos(a)*Math.sin(e),Math.cos(e),Math.sin(a)*Math.sin(e)],col:b.col,size:.09,a:1};b.ps.push(q);sc.parts.push(q)}fw.push(b)}
 sc.ticks.push(t=>{for(const b of fw){const tt=((t+b.t0)%3.2)/1.6;if(tt<.03){b.c=[(R()-.5)*14,9+R()*4,(R()-.5)*14]}for(const q of b.ps){if(tt>1){q.a=0;continue}q.p=[b.c[0]+q.d[0]*tt*3,b.c[1]+q.d[1]*tt*3-tt*tt*1.2,b.c[2]+q.d[2]*tt*3];q.a=1-tt}}});return fw}
function buildProcession(sc,pt,ox,oz){const m=sc.mark();let ry=0;
 if(pt==='elephant'){const g=0x8f8a8a;sc.box(2.6,1.6,1.4,g,ox,1.2,oz-.1);sc.box(.9,1,1,g,ox,1.9,oz-1.5);sc.add(E3.prismG(.15,.25,1.4,6),g,ox,.6,oz-2);for(const [x,z] of [[-.9,.8],[.9,.8],[-.9,-.6],[.9,-.6]])sc.cyl(.3,1.2,g,ox+x,0,oz+z,6);sc.box(2.8,.15,1.6,0xC8102E,ox,2.8,oz-.1);sc.box(1.2,.6,1,0xD9A931,ox,2.95,oz);ry=3.55}
 else if(pt==='horse'){const w=0xF2EFEA;sc.box(.6,.7,1.8,w,ox,1,oz);sc.box(.4,.8,.5,w,ox,1.5,oz-.9);for(const [x,z] of [[-.2,.6],[.2,.6],[-.2,-.6],[.2,-.6]])sc.cyl(.08,1,w,ox+x,0,oz+z,5);sc.box(.7,.1,.7,0xC8102E,ox,1.75,oz);ry=1.85}
 else if(pt==='palanquin'){sc.box(1.2,1,1.6,0xC8102E,ox,1,oz);sc.add(E3.prismG(0,1,.6,4,Math.PI/4),0xD9A931,ox,2,oz);sc.box(.1,.1,4,0x5a3a22,ox-.7,1.6,oz);sc.box(.1,.1,4,0x5a3a22,ox+.7,1.6,oz);for(const [x,z] of [[-.7,-1.7],[.7,-1.7],[-.7,1.7],[.7,1.7]]){const F=figure(sc,{fem:false,col:0xF6EEDF,tur:'#F6EEDF'});F.set(ox+x,oz+z)}ry=-1}
 else if(pt==='camel'){for(const dx of [-1.2,1.2]){const c=0xC9A26E;sc.box(.6,.8,1.6,c,ox+dx,1.3,oz);sc.ball(.45,c,ox+dx,2.2,oz);sc.box(.3,1,.3,c,ox+dx,1.8,oz-.9);sc.box(.35,.3,.6,c,ox+dx,2.7,oz-1.1);for(const [x,z] of [[-.2,.6],[.2,.6],[-.2,-.6],[.2,-.6]])sc.cyl(.07,1.3,c,ox+dx+x,0,oz+z,5);sc.box(.7,.1,1,0xC8102E,ox+dx,2.1,oz+.3)}ry=2.15}
 let rider=null;if(ry>0){rider=figure(sc,{fem:false,col:0xF2E3C6,tur:'#E9A23B',mood:1});rider.set(ox,oz,ry)}
 else if(ry===0){rider=figure(sc,{fem:false,col:0xF2E3C6,tur:'#E9A23B',mood:1});rider.set(ox,oz);for(let i=0;i<4;i++)sc.point(ox-1.5+i,1.6,oz+1,'#FFC765',.09,1)}
 const g=sc.group(m,ox,oz);g.rider=rider;g.riderY=Math.max(0,ry);return g}
