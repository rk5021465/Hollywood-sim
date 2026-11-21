"use strict";
// WebGL renderer: smooth shading, moonlight shadows, warm point lights, fog, twilight sky, glow sprites.
const E3=(()=>{
const hex=h=>[(h>>16)&255,(h>>8)&255,h&255];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
const lerp=(a,b,t)=>a+(b-a)*t;
function mk(polys,center){return polys.map(v=>{let n=[0,0,0];for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];n[0]+=(a[1]-b[1])*(a[2]+b[2]);n[1]+=(a[2]-b[2])*(a[0]+b[0]);n[2]+=(a[0]-b[0])*(a[1]+b[1])}n=norm(n);const c=[0,0,0];v.forEach(p=>{c[0]+=p[0]/v.length;c[1]+=p[1]/v.length;c[2]+=p[2]/v.length});if(dot(n,sub(c,center))<0)n=[-n[0],-n[1],-n[2]];return{v,n}})}
const cache={};
function boxG(w,h,d){const k='b'+w+'_'+h+'_'+d;if(cache[k])return cache[k];const x=w/2,z=d/2,P=[[-x,0,-z],[x,0,-z],[x,0,z],[-x,0,z],[-x,h,-z],[x,h,-z],[x,h,z],[-x,h,z]],F=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];return cache[k]=mk(F.map(f=>f.map(i=>P[i])),[0,h/2,0])}
// smooth-sided frustum/cone; flat=true gives faceted look
function prismG(rt,rb,h,n,a0=0,y0=0){const k='p'+[rt,rb,h,n,a0,y0].join('_');if(cache[k])return cache[k];const F=[],T=[],B=[];const sl=(rb-rt)/h;const smooth=n>=10;
 for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2,b=a0+(i+1)/n*Math.PI*2;const p1=[Math.cos(a)*rb,y0,Math.sin(a)*rb],p2=[Math.cos(b)*rb,y0,Math.sin(b)*rb],p3=[Math.cos(b)*rt,y0+h,Math.sin(b)*rt],p4=[Math.cos(a)*rt,y0+h,Math.sin(a)*rt];
  const na=norm([Math.cos(a),sl,Math.sin(a)]),nb=norm([Math.cos(b),sl,Math.sin(b)]);
  if(rt>0)F.push(smooth?{v:[p1,p2,p3,p4],vn:[na,nb,nb,na]}:{v:[p1,p2,p3,p4]});else F.push(smooth?{v:[p1,p2,[0,y0+h,0]],vn:[na,nb,norm([Math.cos((a+b)/2),sl,Math.sin((a+b)/2)])]}:{v:[p1,p2,[0,y0+h,0]]});B.push(p1);if(rt>0)T.push(p4)}
 F.push({v:B});if(rt>0)F.push({v:T});
 const out=F.map(f=>{if(f.vn)return f;return mk([f.v],[0,y0+h/2,0])[0]});return cache[k]=out}
function sphG(r,n=12,m=8,half=false){const k='s'+[r,n,m,half].join('_');if(cache[k])return cache[k];const F=[],mm=half?Math.ceil(m/2):m;const P=(t,p)=>[Math.sin(t)*Math.cos(p),Math.cos(t),Math.sin(t)*Math.sin(p)];
 for(let j=0;j<mm;j++){const t1=j/m*Math.PI,t2=(j+1)/m*Math.PI;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;const q=[P(t1,a),P(t2,a),P(t2,b),P(t1,b)];F.push({v:q.map(v=>[v[0]*r,v[1]*r,v[2]*r]),vn:q})}}
 if(half){const v=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;v.push([Math.cos(a)*r,0,Math.sin(a)*r])}F.push({v,n:[0,-1,0]})}
 return cache[k]=F}
function gridG(size,n,y=0){const F=[],S=size/n,h=size/2;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-h+i*S,z=-h+j*S;F.push({v:[[x,y,z],[x+S,y,z],[x+S,y,z+S],[x,y,z+S]],n:[0,1,0],chk:(i+j)%2})}return F}
function diskG(r,n,y){const v=[];for(let i=0;i<n;i++){const a=-i/n*Math.PI*2;v.push([Math.cos(a)*r,y,Math.sin(a)*r])}return[{v,n:[0,1,0]}]}

// ---------- shaders ----------
const VS=`attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;uniform mat4 uM,uVP,uL;uniform mat3 uNM;varying vec3 vW,vN,vC;varying vec4 vLs;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=uNM*aN;vC=aC;vLs=uL*w;gl_Position=uVP*w;}`;
const FS=`precision highp float;varying vec3 vW,vN,vC;varying vec4 vLs;uniform vec3 uCol,uCam,uMoonDir,uMoonCol,uSky,uGnd,uFog;uniform float uEmit,uAlpha,uFogN,uFogF,uShOn;uniform vec3 uLP[8];uniform vec3 uLC[8];uniform sampler2D uSh;
float unpack(vec4 c){return dot(c,vec4(1./16777216.,1./65536.,1./256.,1.));}
float shadow(){vec3 c=vLs.xyz/vLs.w*.5+.5;if(c.x<0.||c.x>1.||c.y<0.||c.y>1.||uShOn<.5)return 1.;float s=0.;float b=.0025;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){s+=(c.z-b>unpack(texture2D(uSh,c.xy+vec2(float(x),float(y))/1024.)))?0.:1.;}return s/9.;}
void main(){vec3 base=pow(vC*uCol,vec3(2.2));vec3 col;
 if(uEmit>.5){col=base*2.2;}else{vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;
  vec3 hemi=mix(uGnd,uSky,N.y*.5+.5);float sh=shadow();vec3 L=hemi+max(dot(N,uMoonDir),0.)*uMoonCol*sh;
  for(int i=0;i<8;i++){vec3 d=uLP[i]-vW;float dd=length(d);float at=1./(1.+dd*dd*.22);L+=uLC[i]*(max(dot(N,d/dd),0.)*.85+.15)*at;}
  vec3 V=normalize(uCam-vW);float rim=pow(1.-max(dot(N,V),0.),3.)*.18;col=base*L+rim*uSky;}
 col*=1.35;float f=smoothstep(uFogN,uFogF,length(vW-uCam));col=mix(col,uFog,f);
 col=col*(2.51*col+.03)/(col*(2.43*col+.59)+.14);col=pow(clamp(col,0.,1.),vec3(1./2.2));gl_FragColor=vec4(col,uAlpha);}`;
const DVS=`attribute vec3 aP;uniform mat4 uM,uL;void main(){gl_Position=uL*uM*vec4(aP,1.);}`;
const DFS=`precision highp float;vec4 pack(float d){vec4 b=vec4(16777216.,65536.,256.,1.);vec4 m=vec4(0.,1./256.,1./256.,1./256.);vec4 r=fract(d*b);r-=r.xxyz*m;return r;}void main(){gl_FragColor=pack(gl_FragCoord.z);}`;
const SVS=`attribute vec2 aP;varying vec2 vP;void main(){vP=aP;gl_Position=vec4(aP,.9999,1.);}`;
const SFS=`precision highp float;varying vec2 vP;uniform mat4 uInv;uniform float uT;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec4 a=uInv*vec4(vP,1.,1.);vec3 d=normalize(a.xyz/a.w);float y=d.y;
 vec3 zen=vec3(.035,.045,.13),mid=vec3(.16,.08,.22),hor=vec3(.55,.24,.2);
 vec3 c=mix(hor,mid,smoothstep(-.02,.18,y));c=mix(c,zen,smoothstep(.15,.7,y));
 float az=atan(d.z,d.x);c+=vec3(.35,.12,.05)*pow(max(0.,1.-abs(y-.02)*6.),2.)*(.6+.4*sin(az*1.3));
 vec2 g=vec2(az*60.,y*90.);vec2 gi=floor(g);float s=h(gi);if(s>.985&&y>.12){vec2 f=fract(g)-.5;c+=vec3(.9,.9,1.)*smoothstep(.12,0.,length(f))*(.5+.5*sin(uT*2.+s*80.));}
 vec3 md=normalize(vec3(-.55,.42,-.72));float m=dot(d,md);c+=vec3(1.,.95,.85)*smoothstep(.9993,.9996,m)+vec3(.25,.25,.35)*pow(max(m,0.),400.);
 gl_FragColor=vec4(pow(c,vec3(.95)),1.);}`;
const PVS=`attribute vec3 aP;attribute vec4 aC;attribute float aS;uniform mat4 uVP;uniform float uF;varying vec4 vC;void main(){vec4 p=uVP*vec4(aP,1.);gl_Position=p;gl_PointSize=clamp(aS*uF/max(p.w,.1),1.,160.);vC=aC;}`;
const PFS=`precision mediump float;varying vec4 vC;void main(){float r=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-r),2.2);gl_FragColor=vec4(vC.rgb*a*vC.a,a*vC.a);}`;

function prog(gl,vs,fs){const p=gl.createProgram();for(const [t,s] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(p));
 const u={},a={};const nu=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<nu;i++){const inf=gl.getActiveUniform(p,i);const nm=inf.name.replace('[0]','');u[nm]=gl.getUniformLocation(p,inf.name)}const na=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);for(let i=0;i<na;i++){const inf=gl.getActiveAttrib(p,i);a[inf.name]=gl.getAttribLocation(p,inf.name)}return{p,u,a}}
// faces -> flat arrays
function tris(faces,M,col,out){for(const f of faces){const v=f.v;const vn=f.vn;for(let i=1;i<v.length-1;i++){for(const k of [0,i,i+1]){const p=v[k];let n=vn?vn[k]:f.n;if(M){const q=M.p(p);out.p.push(q[0],q[1],q[2]);const m=M.n(n);out.n.push(m[0],m[1],m[2])}else{out.p.push(p[0],p[1],p[2]);out.n.push(n[0],n[1],n[2])}out.c.push(col[0],col[1],col[2])}}}}
function rot3(ry,rx,rz){const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),cz=Math.cos(rz),sz=Math.sin(rz);
 // R = Ry(engine convention) * Rx * Rz ; row-major 3x3
 const Ry=[cy,0,-sy, 0,1,0, sy,0,cy],Rx=[1,0,0,0,cx,-sx,0,sx,cx],Rz=[cz,-sz,0,sz,cz,0,0,0,1];const mm=(A,B)=>{const o=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++)o.push(A[r*3]*B[c]+A[r*3+1]*B[3+c]+A[r*3+2]*B[6+c]);return o};return mm(mm(Ry,Rx),Rz)}
function xf(o){const R=rot3(o.ry||0,o.rx||0,o.rz||0),s=o.s,p=o.p;return{R,s,p:(v)=>{const x=v[0]*s[0],y=v[1]*s[1],z=v[2]*s[2];return[R[0]*x+R[1]*y+R[2]*z+p[0],R[3]*x+R[4]*y+R[5]*z+p[1],R[6]*x+R[7]*y+R[8]*z+p[2]]},n:(n)=>{const x=n[0]/s[0],y=n[1]/s[1],z=n[2]/s[2];return norm([R[0]*x+R[1]*y+R[2]*z,R[3]*x+R[4]*y+R[5]*z,R[6]*x+R[7]*y+R[8]*z])}}}
function mul4(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o}
function inv4(m){const a=m,o=new Float32Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!d)return o;d=1/d;
 o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*d;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*d;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*d;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*d;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*d;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*d;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*d;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*d;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*d;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*d;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*d;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*d;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*d;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*d;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*d;o[15]=(a[8]*b03-a[9]*b01+a[10]*b00)*d;return o}
function viewM(r,u,f,cp){return new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,-dot(r,cp),-dot(u,cp),dot(f,cp),1])}
const toLin=c=>Math.pow(c/255,2.2);

class Scene{
 constructor(canvas,h){this.cv=canvas;this.h=h;this.O=[];this.pts=[];this.parts=[];this.labels=[];this.lights=[];this.th=.75;this.ph=.62;this.dist=24;this.tg=[0,1.2,0];this.goal=null;this.drag=false;this.idle=0;this.auto=true;this.fire=[0,1,0];this.fireOn=1;this.dark=0;this.ticks=[];this.run=false;this.T0=performance.now();this.onTap=null;this.dynMode=false;this.baked=null;
  const par=canvas.parentNode;canvas.style.display='block';const ov=document.createElement('canvas');ov.style.cssText='position:absolute;left:0;top:0;width:100%;touch-action:none';par.appendChild(ov);this.ov=ov;this.octx=ov.getContext('2d');
  const gl=canvas.getContext('webgl',{antialias:true,alpha:false,premultipliedAlpha:false})||canvas.getContext('experimental-webgl');this.gl=gl;
  if(gl){this.P=prog(gl,VS,FS);this.Pd=prog(gl,DVS,DFS);this.Ps=prog(gl,SVS,SFS);this.Pp=prog(gl,PVS,PFS);this.gcache=new Map();
   this.quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
   this.pbuf=gl.createBuffer();
   const S=1024;this.shTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.shTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,S,S,0,gl.RGBA,gl.UNSIGNED_BYTE,null);for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
   this.shFB=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.shFB);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.shTex,0);const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,S,S);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);gl.bindFramebuffer(gl.FRAMEBUFFER,null);this.shS=S}
  let lx,ly,dx0,dy0,t0;const ev=ov;
  ev.addEventListener('pointerdown',e=>{this.drag=true;lx=dx0=e.clientX;ly=dy0=e.clientY;t0=performance.now();try{ev.setPointerCapture(e.pointerId)}catch(_){}});
  ev.addEventListener('pointermove',e=>{if(!this.drag)return;const mx=e.clientX-lx,my=e.clientY-ly;if(Math.abs(e.clientX-dx0)+Math.abs(e.clientY-dy0)>6){this.th-=mx*.008;this.ph=Math.min(1.3,Math.max(.12,this.ph+my*.005));this.idle=0;if(this.goal){this.goal.th=null;this.goal.ph=null}}lx=e.clientX;ly=e.clientY});
  const up=e=>{if(this.drag&&e.type==='pointerup'&&Math.abs(e.clientX-dx0)+Math.abs(e.clientY-dy0)<8&&performance.now()-t0<450&&this.onTap){const r=ev.getBoundingClientRect();this.onTap(e.clientX-r.left,e.clientY-r.top)}this.drag=false};
  ev.addEventListener('pointerup',up);ev.addEventListener('pointercancel',up);
  this.resize()}
 resize(){const DPR=Math.min(window.devicePixelRatio||1,2),w=this.cv.parentNode.clientWidth||360;this.w=w;this.DPR=DPR;for(const c of [this.cv,this.ov]){c.width=w*DPR;c.height=this.h*DPR;c.style.height=this.h+'px';c.style.width=w+'px'}this.octx.setTransform(DPR,0,0,DPR,0,0)}
 clear(){this.O=[];this.pts=[];this.parts=[];this.labels=[];this.ticks=[];this.lights=[];if(this.baked&&this.gl){this.gl.deleteBuffer(this.baked.b)}this.baked=null;this.dynMode=false}
 add(g,col,x,y,z,o={}){const ob=Object.assign({g,col:hex(col),p:[x,y,z],ry:0,rx:0,rz:0,s:[1,1,1],vis:true,dyn:this.dynMode},o);this.O.push(ob);return ob}
 box(w,h,d,col,x,y,z,o){return this.add(boxG(w,h,d),col,x,y,z,o)}
 cyl(r,h,col,x,y,z,n=8,o){return this.add(prismG(r,r,h,Math.max(n,12)),col,x,y,z,o)}
 cone(r,h,col,x,y,z,n=8,o,a0=0){return this.add(prismG(0,r,h,n,a0),col,x,y,z,o)}
 ball(r,col,x,y,z,o){return this.add(sphG(r,10,7),col,x,y,z,o)}
 dome(r,col,x,y,z,o){return this.add(sphG(r,14,10,true),col,x,y,z,o)}
 flat(w,d,col,x,z,o){return this.add([{v:[[-w/2,.03,-d/2],[w/2,.03,-d/2],[w/2,.03,d/2],[-w/2,.03,d/2]],n:[0,1,0]}],col,x,0,z,o)}
 ground(size,n,c1,c2,side){this.add(boxG(size,.4,size).filter(f=>f.n[1]<.5),side,0,-.4,0);const F=gridG(size,n);this.add(F.filter(f=>!f.chk),c1,0,0,0);this.add(F.filter(f=>f.chk),c2,0,0,0)}
 point(x,y,z,col,size,blink){const q={p:[x,y,z],col,size:size||.09,blink:blink||0,ph:Math.random()*6};this.pts.push(q);return q}
 light(x,y,z,col,int){const L={p:[x,y,z],c:hex(col).map(v=>v/255*int)};this.lights.push(L);return L}
 face(x,y,z,f){return{p:[x,y,z],face:f,vis:true}}
 mark(){return{o:this.O.length,p:this.pts.length}}
 group(m,ox,oz){const g={objs:this.O.slice(m.o).map(o=>({o,b:o.p.slice()})),pts:this.pts.slice(m.p).map(q=>({q,b:q.p.slice()})),ox,oz,at(x,z,y=0){for(const e of this.objs)e.o.p=[e.b[0]-this.ox+x,e.b[1]+y,e.b[2]-this.oz+z];for(const e of this.pts)e.q.p=[e.b[0]-this.ox+x,e.b[1]+y,e.b[2]-this.oz+z]},show(v){for(const e of this.objs)e.o.vis=v;for(const e of this.pts)e.q.vis=v}};g.objs.forEach(e=>e.o.dyn=true);return g}
 camTo(g){this.goal=Object.assign({th:null,ph:null,dist:null,tg:null},g);this.auto=false}
 // merge every non-dynamic object into one buffer
 bake(){const gl=this.gl;if(!gl)return;const out={p:[],n:[],c:[]};const keep=[];for(const o of this.O){if(o.dyn||!o.vis){keep.push(o);continue}tris(o.g,xf(o),o.col.map(v=>v/255),out)}
  this.O=keep;const data=new Float32Array(out.p.length*3);const N=out.p.length/3;for(let i=0;i<N;i++){data.set(out.p.slice(i*3,i*3+3),i*9);data.set(out.n.slice(i*3,i*3+3),i*9+3);data.set(out.c.slice(i*3,i*3+3),i*9+6)}
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this.baked={b,n:N};this.dynMode=true}
 geo(g){let e=this.gcache.get(g);if(e)return e;const out={p:[],n:[],c:[]};tris(g,null,[1,1,1],out);const N=out.p.length/3,data=new Float32Array(N*9);for(let i=0;i<N;i++){data.set(out.p.slice(i*3,i*3+3),i*9);data.set(out.n.slice(i*3,i*3+3),i*9+3);data.set([1,1,1],i*9+6)}const gl=this.gl,b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);e={b,n:N};this.gcache.set(g,e);return e}
 start(){if(this.run)return;this.run=true;const loop=()=>{if(!this.run)return;if(!document.body.contains(this.cv)){this.run=false;return}this.frame();requestAnimationFrame(loop)};requestAnimationFrame(loop)}
 stop(){this.run=false}
 toGround(x,y){const P=this._P;if(!P)return null;const d=norm([P.f[0]+P.r[0]*(x-P.cx)/P.Fc-P.u[0]*(y-P.cy)/P.Fc,P.f[1]+P.r[1]*(x-P.cx)/P.Fc-P.u[1]*(y-P.cy)/P.Fc,P.f[2]+P.r[2]*(x-P.cx)/P.Fc-P.u[2]*(y-P.cy)/P.Fc]);if(d[1]>=-.01)return null;const t=-P.cp[1]/d[1];return[P.cp[0]+d[0]*t,P.cp[2]+d[2]*t]}
 project(p){const P=this._P;if(!P)return null;const d=sub(p,P.cp),z=dot(d,P.f);if(z<.3)return null;return[P.cx+dot(d,P.r)/z*P.Fc,P.cy-dot(d,P.u)/z*P.Fc,z]}
 bindGeo(pr,b){const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(pr.a.aP);gl.vertexAttribPointer(pr.a.aP,3,gl.FLOAT,false,36,0);if(pr.a.aN!=null&&pr.a.aN>=0){gl.enableVertexAttribArray(pr.a.aN);gl.vertexAttribPointer(pr.a.aN,3,gl.FLOAT,false,36,12)}if(pr.a.aC!=null&&pr.a.aC>=0){gl.enableVertexAttribArray(pr.a.aC);gl.vertexAttribPointer(pr.a.aC,3,gl.FLOAT,false,36,24)}}
 objM(o){const R=rot3(o.ry,o.rx,o.rz),s=o.s,p=o.p;const M=new Float32Array([R[0]*s[0],R[3]*s[0],R[6]*s[0],0,R[1]*s[1],R[4]*s[1],R[7]*s[1],0,R[2]*s[2],R[5]*s[2],R[8]*s[2],0,p[0],p[1],p[2],1]);const NM=new Float32Array([R[0]/s[0],R[3]/s[0],R[6]/s[0],R[1]/s[1],R[4]/s[1],R[7]/s[1],R[2]/s[2],R[5]/s[2],R[8]/s[2]]);return{M,NM}}
 frame(){const now=performance.now(),t=(now-this.T0)/1000,dt=Math.min(.05,(now-(this._lt||now))/1000);this._lt=now;const W=this.w,H=this.h,gl=this.gl;
  if(this.goal){const g=this.goal,k=Math.min(1,dt*2.2);if(g.th!=null){let d=g.th-this.th;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;this.th+=d*k}if(g.ph!=null)this.ph=lerp(this.ph,g.ph,k);if(g.dist!=null)this.dist=lerp(this.dist,g.dist,k);if(g.tg)this.tg=this.tg.map((v,i)=>lerp(v,g.tg[i],k))}
  else if(this.auto&&!this.drag&&++this.idle>150)this.th+=.0015;
  for(const f of this.ticks)f(t,dt);
  const tg=this.tg,cp=[tg[0]+Math.sin(this.th)*Math.cos(this.ph)*this.dist,tg[1]+Math.sin(this.ph)*this.dist,tg[2]+Math.cos(this.th)*Math.cos(this.ph)*this.dist];
  const f=norm(sub(tg,cp)),r=norm(cross(f,[0,1,0])),u=cross(r,f),Fc=Math.min(W,H*1.15)*1.25,cx=W/2,cy=H*.5;this._P={cp,f,r,u,Fc,cx,cy};
  const oc=this.octx;oc.clearRect(0,0,W,H);
  if(!gl){oc.fillStyle='#1E1724';oc.fillRect(0,0,W,H);oc.fillStyle='#B9AEB8';oc.font='13px system-ui';oc.fillText('This phone cannot show the 3D view.',16,24);return}
  const n=.3,fa=260;const Pm=new Float32Array([Fc/(W/2),0,0,0,0,Fc/(H/2),0,0,0,0,-(fa+n)/(fa-n),-1,0,0,-2*fa*n/(fa-n),0]);const V=viewM(r,u,f,cp);const VP=mul4(Pm,V);
  // light (moon) matrix
  const Ld=norm([-.45,.85,-.55]),lc=[tg[0]*.5,0,tg[2]*.5],lp=[lc[0]+Ld[0]*60,lc[1]+Ld[1]*60,lc[2]+Ld[2]*60],lf=norm(sub(lc,lp)),lr=norm(cross(lf,[0,1,0])),lu=cross(lr,lf);const hs=17;
  const LP=new Float32Array([1/hs,0,0,0,0,1/hs,0,0,0,0,-2/119,0,0,0,-121/119,1]);const LM=mul4(LP,viewM(lr,lu,lf,lp));
  const vis=this.O.filter(o=>o.vis);
  // shadow pass
  gl.bindFramebuffer(gl.FRAMEBUFFER,this.shFB);gl.viewport(0,0,this.shS,this.shS);gl.clearColor(1,1,1,1);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const pd=this.Pd;gl.useProgram(pd.p);gl.uniformMatrix4fv(pd.u.uL,false,LM);gl.disableVertexAttribArray(1);gl.disableVertexAttribArray(2);
  const I=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  if(this.baked){this.bindGeo(pd,this.baked.b);gl.uniformMatrix4fv(pd.u.uM,false,I);gl.drawArrays(gl.TRIANGLES,0,this.baked.n)}
  const mats=new Map();for(const o of vis){if(o.emit||o.noShadow)continue;const m=this.objM(o);mats.set(o,m);const g=this.geo(o.g);this.bindGeo(pd,g.b);gl.uniformMatrix4fv(pd.u.uM,false,m.M);gl.drawArrays(gl.TRIANGLES,0,g.n)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,this.cv.width,this.cv.height);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  // sky
  const ps=this.Ps;gl.useProgram(ps.p);gl.depthMask(false);gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);for(let i=0;i<4;i++)if(i!==ps.a.aP)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(ps.a.aP);gl.vertexAttribPointer(ps.a.aP,2,gl.FLOAT,false,0,0);gl.uniformMatrix4fv(ps.u.uInv,false,inv4(mul4(Pm,new Float32Array([r[0],u[0],-f[0],0,r[1],u[1],-f[1],0,r[2],u[2],-f[2],0,0,0,0,1]))));gl.uniform1f(ps.u.uT,t);gl.drawArrays(gl.TRIANGLES,0,3);gl.depthMask(true);
  // main
  const P=this.P;gl.useProgram(P.p);gl.uniformMatrix4fv(P.u.uVP,false,VP);gl.uniformMatrix4fv(P.u.uL,false,LM);gl.uniform3fv(P.u.uCam,cp);gl.uniform3fv(P.u.uMoonDir,Ld);gl.uniform3fv(P.u.uMoonCol,[.42,.46,.66]);gl.uniform3fv(P.u.uSky,[.13,.12,.22]);gl.uniform3fv(P.u.uGnd,[.09,.05,.04]);gl.uniform3fv(P.u.uFog,[.2,.1,.14]);gl.uniform1f(P.u.uFogN,22);gl.uniform1f(P.u.uFogF,150);gl.uniform1f(P.u.uShOn,1);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.shTex);gl.uniform1i(P.u.uSh,0);
  // lights: fire + nearest others
  const fi=this.fireOn*(1+Math.sin(t*9)*.12+Math.sin(t*23)*.05);const Ls=[{p:this.fire,c:[1.6*fi,.75*fi,.25*fi]}].concat(this.lights.slice().sort((a,b)=>Math.hypot(a.p[0]-tg[0],a.p[2]-tg[2])-Math.hypot(b.p[0]-tg[0],b.p[2]-tg[2])).slice(0,7));
  const lpA=new Float32Array(24),lcA=new Float32Array(24);Ls.forEach((L,i)=>{lpA.set(L.p,i*3);lcA.set(L.c,i*3)});gl.uniform3fv(P.u.uLP,lpA);gl.uniform3fv(P.u.uLC,lcA);
  gl.uniform1f(P.u.uAlpha,1);
  if(this.baked){this.bindGeo(P,this.baked.b);gl.uniformMatrix4fv(P.u.uM,false,I);gl.uniformMatrix3fv(P.u.uNM,false,new Float32Array([1,0,0,0,1,0,0,0,1]));gl.uniform3fv(P.u.uCol,[1,1,1]);gl.uniform1f(P.u.uEmit,0);gl.drawArrays(gl.TRIANGLES,0,this.baked.n)}
  for(const o of vis){const m=mats.get(o)||this.objM(o);const g=this.geo(o.g);this.bindGeo(P,g.b);gl.uniformMatrix4fv(P.u.uM,false,m.M);gl.uniformMatrix3fv(P.u.uNM,false,m.NM);gl.uniform3fv(P.u.uCol,o.col.map(v=>v/255));gl.uniform1f(P.u.uEmit,o.emit?1:0);gl.drawArrays(gl.TRIANGLES,0,g.n)}
  // glow sprites
  const all=this.pts.concat(this.parts);if(all.length){const arr=[];for(const q of all){if(q.vis===false||q.a===0)continue;const on=q.blink?(.75+.25*Math.sin(t*3*q.blink+q.ph)):1;const c=q.col||'#FFE27A';const rr=parseInt(c.slice(1,3),16)/255,gg=parseInt(c.slice(3,5),16)/255,bb=parseInt(c.slice(5,7),16)/255;const a=(q.a==null?1:q.a)*on;
    arr.push(q.p[0],q.p[1],q.p[2],rr,gg,bb,a,(q.size||.09)*2.2);if(!q.streak)arr.push(q.p[0],q.p[1],q.p[2],rr,gg*.85,bb*.7,a*.35,(q.size||.09)*9)}
   const pp=this.Pp;gl.useProgram(pp.p);gl.bindBuffer(gl.ARRAY_BUFFER,this.pbuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.DYNAMIC_DRAW);for(let i=0;i<4;i++)gl.disableVertexAttribArray(i);
   gl.enableVertexAttribArray(pp.a.aP);gl.vertexAttribPointer(pp.a.aP,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(pp.a.aC);gl.vertexAttribPointer(pp.a.aC,4,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(pp.a.aS);gl.vertexAttribPointer(pp.a.aS,1,gl.FLOAT,false,32,28);
   gl.uniformMatrix4fv(pp.u.uVP,false,VP);gl.uniform1f(pp.u.uF,Fc*this.DPR);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,arr.length/8);gl.depthMask(true);gl.disable(gl.BLEND)}
  for(let i=0;i<4;i++)gl.disableVertexAttribArray(i);
  // overlay: vignette, rain darkening, labels
  const vg=oc.createRadialGradient(W/2,H*.45,Math.min(W,H)*.35,W/2,H*.5,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,4,12,.55)');oc.fillStyle=vg;oc.fillRect(0,0,W,H);
  if(this.dark){oc.fillStyle='rgba(10,14,30,'+this.dark+')';oc.fillRect(0,0,W,H)}
  for(const lb of this.labels){if(lb.vis===false)continue;const p=typeof lb.p==='function'?lb.p():lb.p;const s=this.project(p);if(!s)continue;const [x,y]=s;
   if(lb.kind==='warn'){const bob=Math.sin(t*5)*2;oc.fillStyle='#E5484D';oc.beginPath();oc.arc(x,y-14+bob,9,0,7);oc.fill();oc.fillStyle='#fff';oc.font='600 13px system-ui,sans-serif';oc.textAlign='center';oc.fillText('!',x,y-9.5+bob);oc.beginPath();oc.moveTo(x-4,y-6+bob);oc.lineTo(x+4,y-6+bob);oc.lineTo(x,y-1+bob);oc.fillStyle='#E5484D';oc.fill()}
   else{oc.font='500 12px system-ui,sans-serif';const tw=oc.measureText(lb.text).width;const bx=Math.max(4,Math.min(W-tw-20,x-tw/2-8)),by=y-34;oc.fillStyle=lb.kind==='good'?'rgba(30,23,36,.92)':'rgba(246,238,223,.96)';rrect(oc,bx,by,tw+16,22,11);oc.fill();if(lb.kind==='good'){oc.strokeStyle='#D9A931';oc.lineWidth=1;oc.stroke()}oc.beginPath();oc.moveTo(x-5,by+21);oc.lineTo(x+5,by+21);oc.lineTo(x,by+28);oc.fill();oc.fillStyle=lb.kind==='good'?'#F6EEDF':'#1a1206';oc.textAlign='left';oc.fillText(lb.text,bx+8,by+15)}}
 }
}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
return{Scene,boxG,prismG,sphG,diskG};
})();
