/* ===================== v12 — real-time 3D studio office (own WebGL engine: lighting, shadows, glass, people, posters) ===================== */
const O3={el:null,gl:null,ready:false,yaw:.78,pitch:.62,zoom:7.6,tYaw:.78,tZoom:7.6,sig:'',t0:0,last:0,people:[],labels:[],rooms:[],ptr:{},idle:0,full:false};

/* ---------- tiny matrix lib (column-major) ---------- */
function m4mul(a,b){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
function m4ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1])}
function v3n(v){const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l]}
function v3x(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function m4look(e,c,u){const z=v3n([e[0]-c[0],e[1]-c[1],e[2]-c[2]]),x=v3n(v3x(u,z)),y=v3x(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1])}
function m4trs(tx,ty,tz,ry,s){const c=Math.cos(ry)*s,n=Math.sin(ry)*s;return new Float32Array([c,0,-n,0,0,s,0,0,n,0,c,0,tx,ty,tz,1])}
const M4I=m4trs(0,0,0,0,1);

/* ---------- geometry builder: pos3 nrm3 col4 uv2 ---------- */
function hx(c){c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}
function Geo(){this.a=[]}
Geo.prototype.tri=function(p0,p1,p2,n,c,a,uv){const A=this.a;[[p0,uv?uv[0]:null],[p1,uv?uv[1]:null],[p2,uv?uv[2]:null]].forEach(([p,u])=>{A.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],a,u?u[0]:-1,u?u[1]:-1)})};
Geo.prototype.quad=function(p0,p1,p2,p3,col,a,uvr){const c=typeof col==='string'?hx(col):col;const e1=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],e2=[p3[0]-p0[0],p3[1]-p0[1],p3[2]-p0[2]];const n=v3n(v3x(e1,e2));
 const u=uvr?[[uvr[0],uvr[3]],[uvr[2],uvr[3]],[uvr[2],uvr[1]],[uvr[0],uvr[1]]]:null;this.tri(p0,p1,p2,n,c,a,u?[u[0],u[1],u[2]]:null);this.tri(p0,p2,p3,n,c,a,u?[u[0],u[2],u[3]]:null)};
/* box: centre x/z, bottom y, size w h d, optional rotation around its own centre */
Geo.prototype.box=function(cx,y0,cz,w,h,d,col,a,ry){a=a==null?1:a;const c=typeof col==='string'?hx(col):col;const r=ry||0,cs=Math.cos(r),sn=Math.sin(r);
 const P=(x,y,z)=>[cx+x*cs+z*sn,y0+y,cz-x*sn+z*cs];const X=w/2,Z=d/2,H=h;
 const v=[P(-X,0,-Z),P(X,0,-Z),P(X,0,Z),P(-X,0,Z),P(-X,H,-Z),P(X,H,-Z),P(X,H,Z),P(-X,H,Z)];const dk=k=>[c[0]*k,c[1]*k,c[2]*k];
 this.quad(v[4],v[7],v[6],v[5],c,a);this.quad(v[3],v[2],v[6],v[7],c,a);this.quad(v[1],v[0],v[4],v[5],c,a);this.quad(v[0],v[3],v[7],v[4],c,a);this.quad(v[2],v[1],v[5],v[6],c,a);this.quad(v[0],v[1],v[2],v[3],dk(.7),a)};
Geo.prototype.cyl=function(cx,y0,cz,r,h,seg,col,a,r2){a=a==null?1:a;const c=hx(col);r2=r2==null?r:r2;for(let i=0;i<seg;i++){const t0=i/seg*6.2832,t1=(i+1)/seg*6.2832;
  const b0=[cx+Math.cos(t0)*r,y0,cz+Math.sin(t0)*r],b1=[cx+Math.cos(t1)*r,y0,cz+Math.sin(t1)*r],u0=[cx+Math.cos(t0)*r2,y0+h,cz+Math.sin(t0)*r2],u1=[cx+Math.cos(t1)*r2,y0+h,cz+Math.sin(t1)*r2];
  this.quad(b1,b0,u0,u1,c,a);this.tri([cx,y0+h,cz],u1,u0,[0,1,0],c,a)}};
Geo.prototype.sph=function(cx,cy,cz,r,col,a,sy){a=a==null?1:a;const c=hx(col);sy=sy||1;const la=6,lo=9;const P=(i,j)=>{const th=i/la*Math.PI,ph=j/lo*6.2832;return [cx+r*Math.sin(th)*Math.cos(ph),cy+r*sy*Math.cos(th),cz+r*Math.sin(th)*Math.sin(ph)]};
 for(let i=0;i<la;i++)for(let j=0;j<lo;j++){const p0=P(i,j),p1=P(i,j+1),p2=P(i+1,j+1),p3=P(i+1,j);const n=v3n([(p0[0]+p2[0])/2-cx,((p0[1]+p2[1])/2-cy)/sy,(p0[2]+p2[2])/2-cz]);this.tri(p0,p1,p2,n,c,a);this.tri(p0,p2,p3,n,c,a)}};
Geo.prototype.f32=function(){return new Float32Array(this.a)};

/* ---------- shaders ---------- */
const O3VS=`attribute vec3 aP;attribute vec3 aN;attribute vec4 aC;attribute vec2 aU;uniform mat4 uM,uVP,uL;varying vec3 vN;varying vec4 vC;varying vec2 vU;varying vec4 vL;
void main(){vec4 w=uM*vec4(aP,1.);vN=(uM*vec4(aN,0.)).xyz;vC=aC;vU=aU;vL=uL*w;gl_Position=uVP*w;}`;
const O3FS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uT,uS;uniform vec3 uLd;uniform float uSz,uNight;varying vec3 vN;varying vec4 vC;varying vec2 vU;varying vec4 vL;
float up(vec4 c){return dot(c,vec4(1.,1./255.,1./65025.,1./16581375.));}
void main(){vec3 n=normalize(vN);vec3 base=vC.rgb;if(vU.x>=0.)base=texture2D(uT,vU).rgb;
 vec3 p=vL.xyz/vL.w*.5+.5;float sh=0.;float o=1./uSz;
 if(p.x>0.&&p.x<1.&&p.y>0.&&p.y<1.){for(int i=-1;i<=1;i+=2)for(int j=-1;j<=1;j+=2){sh+=(p.z-.0028>up(texture2D(uS,p.xy+vec2(float(i),float(j))*o)))?1.:0.;}sh*=.25;}
 float d=max(dot(n,-uLd),0.);float lit=d*(1.-sh*.82);
 vec3 amb=mix(vec3(.32,.27,.24),vec3(.74,.68,.62),n.y*.5+.5);
 vec3 key=mix(vec3(1.,.88,.70),vec3(.55,.62,.95),uNight);
 vec3 col=base*(amb*.82+key*lit*.78);
 float a=vC.a;if(a>1.5){col=base*1.08;a=1.;}
 gl_FragColor=vec4(pow(col,vec3(.94)),a);}`;
const O3SVS=`attribute vec3 aP;uniform mat4 uM,uL;void main(){gl_Position=uL*uM*vec4(aP,1.);}`;
const O3SFS=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
vec4 pk(float d){vec4 e=fract(vec4(1.,255.,65025.,16581375.)*d);e-=e.yzww*vec4(1./255.,1./255.,1./255.,0.);return e;}void main(){gl_FragColor=pk(gl_FragCoord.z);}`;
function o3prog(gl,vs,fs){const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x};const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
function o3buf(gl,f32){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,f32,gl.STATIC_DRAW);return {b,n:f32.length/12}}

/* ---------- texture atlas: posters, logo wall, skyline ---------- */
const AT={W:1024,H:512};
function atUV(x,y,w,h){return [x/AT.W,y/AT.H,(x+w)/AT.W,(y+h)/AT.H]}
const AT_POST=i=>atUV(i*170+5,8,160,240),AT_LOGO=atUV(0,256,512,128),AT_SKY=atUV(512,256,256,128),AT_BOARD=atUV(768,256,256,128),AT_SCREEN=atUV(0,384,256,128);
function o3atlas(){const c=document.createElement('canvas');c.width=AT.W;c.height=AT.H;const x=c.getContext('2d');O3.atc=c;O3.atx=x;
 x.fillStyle='#222';x.fillRect(0,0,AT.W,AT.H);
 for(let i=0;i<6;i++){const g=x.createLinearGradient(0,0,0,240);g.addColorStop(0,['#3a2a5a','#1f3a4a','#5a2a2a','#2a4a3a','#4a3a1a','#2a2a4a'][i]);g.addColorStop(1,'#111');x.fillStyle=g;x.fillRect(i*170+5,8,160,240);x.fillStyle='#E8B84A';x.font='bold 22px Georgia,serif';x.textAlign='center';x.fillText('COMING',i*170+85,120);x.fillText('SOON',i*170+85,148)}
 const lg=x.createLinearGradient(0,256,0,384);lg.addColorStop(0,'#1F1A14');lg.addColorStop(1,'#2e241a');x.fillStyle=lg;x.fillRect(0,256,512,128);x.strokeStyle='#E8B84A';x.lineWidth=3;x.strokeRect(10,266,492,108);
 x.fillStyle='#E8B84A';x.textAlign='center';let nm=(S&&S.name||'Studio').toUpperCase();let fs=44;x.font=`700 ${fs}px Georgia,serif`;while(x.measureText(nm).width>460&&fs>18){fs-=2;x.font=`700 ${fs}px Georgia,serif`}x.fillText(nm,256,330);x.font='600 16px Inter,Arial,sans-serif';x.fillStyle='#CFC6B8';x.fillText('EST. '+START_YEAR+'  ·  HOLLYWOOD, CA',256,358);
 const sg=x.createLinearGradient(0,256,0,384);sg.addColorStop(0,'#f6c48c');sg.addColorStop(.55,'#e99a7a');sg.addColorStop(1,'#8a6aa0');x.fillStyle=sg;x.fillRect(512,256,256,128);x.fillStyle='#3a2f45';
 [[0,60,22],[26,40,18],[48,72,30],[82,52,20],[106,30,16],[126,66,26],[156,44,22],[182,80,28],[214,50,20],[236,64,20]].forEach(b=>{x.fillRect(512+b[0],384-b[1],b[2],b[1]);x.fillStyle='#ffd77a';for(let k=0;k<6;k++)if((b[0]+k)%3)x.fillRect(512+b[0]+3+(k%2)*8,384-b[1]+6+Math.floor(k/2)*12,4,5);x.fillStyle='#3a2f45'});
 x.fillStyle='#f4f2ee';x.fillRect(768,256,256,128);x.strokeStyle='#888';x.lineWidth=4;x.strokeRect(770,258,252,124);x.strokeStyle='#2F6FD6';x.lineWidth=3;x.beginPath();x.moveTo(790,360);x.lineTo(830,330);x.lineTo(870,345);x.lineTo(920,300);x.lineTo(990,285);x.stroke();x.fillStyle='#D63A3F';x.font='bold 18px Arial';x.textAlign='left';x.fillText('BOX OFFICE',790,290);x.fillStyle='#1F9D5C';x.fillText('▲',990,300);
 x.fillStyle='#0b0d14';x.fillRect(0,384,256,128);x.fillStyle='#E8B84A';x.font='bold 20px Georgia';x.textAlign='center';x.fillText('NOW SHOWING',128,452)}
function o3posters(){const fl=(S.films||[]).slice().reverse().slice(0,6);fl.forEach((f,i)=>{try{let s=posterSVG(f,160);if(!/xmlns=/.test(s))s=s.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"');const img=new Image();img.onload=()=>{try{O3.atx.drawImage(img,i*170+5,8,160,240);if(i===0){O3.atx.drawImage(img,0,0,img.width||160,(img.height||240)*.55,8,388,240,120)}o3upTex()}catch(e){}};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)}catch(e){}})}
function o3upTex(){const gl=O3.gl;if(!gl)return;gl.bindTexture(gl.TEXTURE_2D,O3.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,O3.atc);O3.dirty=1;clearTimeout(O3.snT);O3.snT=setTimeout(()=>{if(O3.people&&O3.people.length)o3snap()},120)}

/* ---------- people ---------- */
function o3person(p,opt){opt=opt||{};const L=lookOf(p);const sk=SKINS[L.skin]||'#e0a878',hc=HAIRC[L.hairC]||'#3b2416',cl=CLOTH[L.cloth]||'#2d3a5c',pant=opt.pants||'#2a2d36';const F=p.g==='F'||L.g==='F';
 const g=new Geo();const arm=new Geo();const sit=opt.sit!==false;
 if(sit){g.box(-.11,.40,.16,.15,.14,.44,pant);g.box(.11,.40,.16,.15,.14,.44,pant);g.box(-.11,0,.36,.13,.42,.13,pant);g.box(.11,0,.36,.13,.42,.13,pant);g.box(-.11,0,.42,.14,.07,.22,'#1a1a1f');g.box(.11,0,.42,.14,.07,.22,'#1a1a1f')}
 else{g.box(-.1,0,0,.15,.82,.16,pant);g.box(.1,0,0,.15,.82,.16,pant)}
 const y=sit?.46:.84;g.box(0,y,0,.44,.52,.26,cl);g.box(0,y+.44,0,.46,.1,.27,cl);g.box(0,y+.52,0,.11,.06,.11,sk);
 g.sph(0,y+.72,.0,.15,sk,1,1.08);g.box(-.055,y+.73,.135,.035,.04,.03,'#2a1d14');g.box(.055,y+.73,.135,.035,.04,.03,'#2a1d14');g.box(0,y+.655,.14,.07,.015,.02,'#a0524a');g.box(0,y+.69,.13,.04,.05,.04,sk);
 g.sph(0,y+.78,-.015,.158,hc,1,.78);if(F&&/long|bob|pony|wave/.test(String(L.hair)))g.box(0,y+.48,-.1,.3,.34,.08,hc);
 if(L.glasses){g.box(0,y+.73,.15,.22,.03,.02,'#111')}
 if(sit){arm.box(-.27,y+.28,.13,.1,.1,.34,cl);arm.box(.27,y+.28,.13,.1,.1,.34,cl);arm.box(-.27,y+.27,.33,.09,.08,.09,sk);arm.box(.27,y+.27,.33,.09,.08,.09,sk);arm.box(-.27,y+.28,-.04,.11,.26,.12,cl);arm.box(.27,y+.28,-.04,.11,.26,.12,cl)}
 else{arm.box(-.28,y+.02,0,.1,.46,.12,cl);arm.box(.28,y+.02,0,.1,.46,.12,cl);arm.box(-.28,y-.06,0,.09,.09,.09,sk);arm.box(.28,y-.06,0,.09,.09,.09,sk)}
 return {body:g.f32(),arm:arm.f32(),head:y+.95}}

/* ---------- the office ---------- */
function o3scene(){const G=new Geo(),GL=new Geo();const seats=[];const rooms=[];
 const wall='#F3EADB',wall2='#EADFCB',trim='#7A6249',carpet='#B88C63',wood='#8A6446',glassF='#5E4A33';
 // slab + floors
 G.box(0,-.36,0,21,.36,15.4,'#4A3B2E');G.box(0,-.02,0,18.6,.02,13.6,'#7A6450');G.box(0,0,0,18,.02,13,carpet);for(let i=0;i<26;i++)G.box(-9+.25+i*.7,.021,0,.012,.002,13,'#a47a54');
 G.box(-6.25,.02,4.25,5.5,.01,4.5,wood);for(let i=0;i<9;i++)G.box(-6.25,.031,2.25+i*.5,5.5,.002,.02,'#7d5e43');
 G.box(-6.2,.02,-4.25,5.2,.01,4.1,'#6B4A33');G.box(-6.2,.03,-4.1,3.2,.01,2.2,'#7a2f36');G.box(6,.02,-4.5,5.6,.01,3.6,'#D9C9AE');G.box(1.6,.022,2.4,8.4,.01,6.2,'#CDB99A');
 // back walls
 G.box(0,0,-6.62,18.4,3.1,.24,wall);G.box(-9.12,0,0,.24,3.1,13.48,wall2);G.box(0,0,-6.48,18,.16,.04,trim);G.box(-8.98,0,0,.04,.16,13,trim);
 G.box(0,3.1,-6.62,18.6,.12,.36,'#C9BBA2');G.box(-9.12,3.1,0,.36,.12,13.6,'#C9BBA2');
 // windows (skyline) on north wall
 [[-6.3,2.6],[5.8,2.8],[0,1.6]].forEach(([wx,ww])=>{G.box(wx,1.0,-6.5,ww+.16,1.68,.06,'#4b4038');G.quad([wx-ww/2,1.08,-6.46],[wx+ww/2,1.08,-6.46],[wx+ww/2,2.6,-6.46],[wx-ww/2,2.6,-6.46],'#fff',1,AT_SKY);G.box(wx,1.0,-6.42,ww+.2,.06,.12,'#d9d0c2');for(let k=1;k<3;k++)G.box(wx-ww/2+ww*k/3,1.08,-6.45,.04,1.52,.03,'#4b4038')});
 // posters (your films) on north wall
 [[-2.6,0],[2.6,1]].forEach(([px,i])=>{G.box(px,1.08,-6.49,.86,1.26,.05,'#16131a');G.quad([px-.39,1.13,-6.455],[px+.39,1.13,-6.455],[px+.39,2.29,-6.455],[px-.39,2.29,-6.455],'#fff',1,AT_POST(i))});
 // posters on west wall
 [[-.6,2],[.9,3],[2.4,4]].forEach(([pz,i])=>{G.box(-8.99,1.08,pz,.05,1.26,.86,'#16131a');G.quad([-8.955,1.13,pz+.39],[-8.955,1.13,pz-.39],[-8.955,2.29,pz-.39],[-8.955,2.29,pz+.39],'#fff',1,AT_POST(i))});
 // logo wall (reception)
 G.box(-8.95,.9,4.6,.08,1.5,3.1,'#1F1A14');G.quad([-8.9,1.0,6.05],[-8.9,1.0,3.15],[-8.9,2.32,3.15],[-8.9,2.32,6.05],'#fff',2,AT_LOGO);
 // ---- CEO office (glass) ----
 const glass=(x0,z0,x1,z1,gap)=>{const len=Math.hypot(x1-x0,z1-z0),n=Math.max(2,Math.round(len/1.2));const ry=Math.atan2(-(z1-z0),x1-x0);for(let i=0;i<=n;i++){const t=i/n;G.box(x0+(x1-x0)*t,0,z0+(z1-z0)*t,.07,2.5,.07,glassF)}G.box((x0+x1)/2,2.42,(z0+z1)/2,len,.08,.09,glassF,1,ry);G.box((x0+x1)/2,0,(z0+z1)/2,len,.06,.09,glassF,1,ry);
  const segs=gap?[[0,gap[0]],[gap[1],1]]:[[0,1]];segs.forEach(([a,b])=>{const ax=x0+(x1-x0)*a,az=z0+(z1-z0)*a,bx=x0+(x1-x0)*b,bz=z0+(z1-z0)*b;GL.quad([ax,.06,az],[bx,.06,bz],[bx,2.42,bz],[ax,2.42,az],'#bfe2ff',.22)})};
 glass(-9,-2.1,-3.5,-2.1,[.55,.75]);glass(-3.5,-6.5,-3.5,-2.1);
 G.box(-6.2,0,-4.7,2.4,.72,1.1,'#4a3424');G.box(-6.2,.72,-4.7,2.5,.06,1.2,'#6b4a33');G.box(-6.6,.78,-4.55,.62,.4,.04,'#111');G.box(-6.6,.8,-4.585,.56,.34,.01,'#5a8fd6',2);G.box(-6.6,.78,-4.5,.12,.06,.12,'#222');
 G.box(-5.6,.78,-4.6,.3,.03,.22,'#ddd');G.cyl(-5.4,.78,-4.95,.05,.12,8,'#E8B84A');
 o3chair(G,-6.2,-5.62,0,'#1c1c22');seats.push({k:'ceo',x:-6.2,z:-5.42,ry:0});
 G.box(-8.5,0,-4.2,.9,.42,2.2,'#6b2f36');G.box(-8.85,0,-4.2,.3,.85,2.2,'#6b2f36');G.box(-8.5,0,-3.1,.9,.6,.2,'#5a262c');G.box(-8.5,0,-5.3,.9,.6,.2,'#5a262c');
 G.box(-7.3,0,-4.2,.7,.38,1.0,'#3d2c22');
 // trophy shelf
 G.box(-5.2,0,-6.46,2.6,2.2,.04,'#3d2c22');G.box(-6.48,0,-6.3,.05,2.2,.34,'#3d2c22');G.box(-3.92,0,-6.3,.05,2.2,.34,'#3d2c22');G.box(-5.2,0,-6.3,2.6,.12,.34,'#3d2c22');G.box(-5.2,2.15,-6.3,2.6,.05,.34,'#3d2c22');[.55,1.15,1.75].forEach(h=>G.box(-5.2,h,-6.3,2.5,.05,.3,'#6b4a33'));
 const aw=S.awards||{film:0,tv:0,fest:0};const nT=Math.min(15,(aw.film||0)+(aw.tv||0)+(aw.fest||0));for(let i=0;i<nT;i++){const sx=-6.3+(i%5)*.55,sy=[.6,1.2,1.8][Math.floor(i/5)];G.box(sx,sy,-6.28,.14,.06,.14,'#2a2420');G.cyl(sx,sy+.06,-6.28,.04,.26,6,'#E8B84A');G.sph(sx,sy+.36,-6.28,.06,'#FFD77A')}
 if(!nT){G.box(-5.2,1.2,-6.28,.5,.06,.16,'#555')}
 G.cyl(-3.9,0,-2.6,.22,.4,10,'#d9d0c2',1,.18);G.sph(-3.9,.75,-2.6,.38,'#3d7a45',1,1.2);
 rooms.push({k:'office',x:-6.2,y:2.7,z:-4.3,l:'Your office',f:'achModal()'});
 // ---- meeting / pitch room ----
 glass(3,-2.5,9,-2.5,[.1,.28]);glass(3,-6.5,3,-2.5);
 G.box(6,0,-4.5,3.6,.72,1.3,'#2b2b33');G.box(6,.72,-4.5,3.8,.06,1.5,'#e8e1d4');
 for(let i=0;i<3;i++){o3chair(G,4.9+i*1.1,-3.45,Math.PI,'#C9A46A');o3chair(G,4.9+i*1.1,-5.55,0,'#C9A46A')}
 G.box(6,1.05,-6.48,2.6,1.5,.06,'#0b0d14');G.quad([4.78,1.12,-6.44],[7.22,1.12,-6.44],[7.22,2.48,-6.44],[4.78,2.48,-6.44],'#fff',2,AT_SCREEN);
 G.box(8.7,0,-6.0,.5,1.0,.5,'#d9d0c2');G.cyl(8.7,1.0,-6.0,.15,.5,10,'#9cc9f0',1,.12);
 rooms.push({k:'pitch',x:6,y:2.7,z:-4.5,l:'Pitch room',f:'pitchRoom()'});
 // ---- open office desks (2x2 clusters) ----
 const cluster=(cx,cz)=>{G.box(cx,0,cz,2.9,.72,1.7,'#6B4A33',1);G.box(cx,.72,cz,3.0,.05,1.8,'#F6EFE2');G.box(cx,.77,cz,.04,.36,1.7,'#a9b4c2');
  [[-.75,-1],[.75,-1],[-.75,1],[.75,1]].forEach(([ox,s],j)=>{const mx=cx+ox,mz=cz+s*.32;G.box(mx,.77,mz,.58,.36,.04,'#15171c');G.box(mx,.79,mz+s*.005,.52,.3,.02,['#3b6fd1','#2aa198','#7b5ed6','#d6863a'][(j+Math.round(cx))&3],2);G.box(mx,.77,mz-s*.1,.1,.05,.12,'#222');G.box(mx,.77,mz+s*.22,.42,.02,.14,'#cfcfd4');
   o3chair(G,mx,cz+s*1.2,s>0?Math.PI:0,'#8A5A33');seats.push({x:mx,z:cz+s*1.05,ry:s>0?Math.PI:0})})};
 cluster(-.6,0.6);cluster(3.9,0.6);cluster(1.65,4.2);
 // bookshelves & cabinets
 G.box(-8.75,0,-.2,.5,2.2,3.0,'#5a4130');for(let r=0;r<4;r++){G.box(-8.72,.15+r*.52,-.2,.44,.04,2.9,'#6b4a33');for(let b=0;b<11;b++){const bh=.3+((b*7+r*3)%5)*.03;G.box(-8.6,.19+r*.52,-1.55+b*.26,.24,bh,.2,['#a33','#2F6FD6','#E8B84A','#2a6','#764','#c55','#447'][(b+r)%7])}}
 G.box(0,0,-6.25,3.2,.8,.5,'#e9e5dd');G.box(-2.6,0,-6.25,1.4,.8,.5,'#d9d4ca');G.box(2.6,0,-6.25,1.4,.8,.5,'#d9d4ca');G.cyl(-2.9,.8,-6.25,.12,.25,8,'#c55',1,.1);G.sph(-2.9,1.18,-6.25,.22,'#4b8a4f');
 G.box(-1.6,0,-5.6,.06,1.7,.06,'#888');G.box(1.0,0,-5.95,.42,1.05,.42,'#e3e3e8');G.cyl(1.0,1.05,-5.95,.13,.42,10,'#9cc9f0',1,.11);
 // whiteboard on west wall
  G.box(1.65,0,-2.3,2.2,.04,.04,'#888');G.box(1.65,.9,-2.3,2.0,1.1,.05,'#888');G.quad([.7,.96,-2.27],[2.6,.96,-2.27],[2.6,1.94,-2.27],[.7,1.94,-2.27],'#fff',1,AT_BOARD);G.box(.75,0,-2.3,.05,.95,.05,'#888');G.box(2.55,0,-2.3,.05,.95,.05,'#888');
 // ---- reception ----
 G.box(-6.4,0,3.4,2.8,1.0,.6,'#1F1A14');G.box(-6.4,1.0,3.4,3.0,.06,.75,'#E8B84A');G.box(-7.95,0,4.2,.6,1.0,2.2,'#1F1A14');G.box(-7.95,1.0,4.2,.75,.06,2.3,'#E8B84A');
 G.box(-6.9,1.06,3.5,.5,.32,.04,'#111');G.box(-6.9,1.08,3.475,.44,.26,.01,'#3b6fd1',2);
 o3chair(G,-6.4,2.55,0,'#1c1c22');seats.push({k:'asst',x:-6.4,z:2.75,ry:0});
 G.box(-4.0,0,6.0,2.2,.42,.85,'#8A5A33');G.box(-4.0,0,6.35,2.2,.85,.2,'#8A5A33');G.box(-4.0,0,4.9,1.0,.36,.6,'#3d2c22');G.cyl(-4.0,.36,4.9,.12,.08,8,'#E8B84A');
 G.cyl(-8.5,0,6.2,.25,.5,10,'#E8B84A',1,.2);G.sph(-8.5,1.0,6.2,.45,'#3d7a45',1,1.3);G.cyl(8.5,0,6.1,.25,.5,10,'#d9d0c2',1,.2);G.sph(8.5,1.0,6.1,.45,'#4b8a4f',1,1.3);G.cyl(8.5,0,-1.8,.22,.45,10,'#d9d0c2',1,.18);G.sph(8.5,.9,-1.8,.4,'#3d7a45',1,1.3);
 rooms.push({k:'lobby',x:-6.2,y:2.3,z:4.4,l:'Reception',f:'inboxModal()'});
 // ---- light rig truss + film gear on the slab rim ----
 const tr='#3D342B';[[0,-7.25,20.6,.18],[0,7.25,20.6,.18]].forEach(([x,z,w,d])=>G.box(x,3.6,z,w,.18,d,tr));[[-10.1,0],[10.1,0]].forEach(([x,z])=>G.box(x,3.6,z,.18,.18,14.6,tr));
 [[-10.1,-7.25],[10.1,-7.25],[-10.1,7.25],[10.1,7.25]].forEach(([x,z])=>G.box(x,-.0,z,.16,3.7,.16,tr));
 for(let i=0;i<7;i++){const x=-8.4+i*2.8;G.cyl(x,3.32,-7.25,.12,.28,8,'#1a1a1f',1,.16);G.cyl(x,3.32,7.25,.12,.28,8,'#1a1a1f',1,.16)}
 G.box(9.8,0,4.8,.06,1.3,.06,'#222');G.box(9.65,0,4.8,.5,.04,.04,'#222',1,.5);G.box(9.8,1.3,4.8,.5,.34,.28,'#15151a');G.cyl(10.1,1.36,4.8,.1,.22,10,'#333');
 G.box(-9.95,0,6.4,.05,1.9,.05,'#222');G.box(-9.95,1.85,6.4,.5,.4,.3,'#d9d9dd');G.box(-9.95,1.88,6.56,.44,.34,.02,'#fff6d6',2);
 G.box(9.6,0,6.6,.6,.06,.6,'#5a4130');G.box(9.6,.45,6.6,.6,.04,.6,'#7a1f2b');G.box(9.6,.45,6.32,.6,.5,.04,'#7a1f2b');
 return {G,GL,seats,rooms}}
function o3chair(G,x,z,ry,col){G.box(x,0,z,.06,.42,.06,'#333');G.box(x,.0,z,.5,.04,.5,'#333',1,ry+.4);G.box(x,.42,z,.52,.08,.5,col,1,ry);const bx=Math.sin(ry)*-.24,bz=Math.cos(ry)*-.24;G.box(x+bx,.48,z+bz,.5,.56,.07,col,1,ry)}

/* ---------- build / rebuild ---------- */
function o3sig(){return [S.name,(S.films||[]).length,JSON.stringify(S.awards||{}),Object.keys(S.team||{}).join(),o3staffN()].join('|')}
function o3staffN(){return Math.min(9,1+Math.floor(((S.films||[]).length+(S.shows||[]).length)/2))}
function o3build(){const gl=O3.gl;if(!O3.atc)o3atlas();else o3atlas();o3posters();o3upTex();
 const sc=o3scene();O3.stat=o3buf(gl,sc.G.f32());O3.glass=o3buf(gl,sc.GL.f32());O3.rooms=sc.rooms;
 // people
 const P=[];const free=sc.seats.filter(s=>!s.k);const take=k=>sc.seats.find(s=>s.k===k);
 const ceo=S.ceo&&S.ceo.n?S.ceo:{id:'ceo_x',n:'You',g:'M'};P.push({who:ceo,role:'CEO · You',seat:take('ceo'),act:()=>studioPage(),ic:'👑'});
 P.push({who:teamM('asst'),role:'Assistant',seat:take('asst'),tk:'asst',ic:'📋'});
 ['dist','mkt','prod'].forEach((k,i)=>P.push({who:teamM(k),role:teamM(k).role,seat:free[i],tk:k,ic:teamM(k).em}));
 const SR=['Script reader','Analyst','Editor','Publicist','Casting assoc.','Accountant','Producer','Social media','Assistant producer'];
 for(let i=0;i<o3staffN()&&i+3<free.length;i++){S.staff3=S.staff3||[];if(!S.staff3[i]){const g=Math.random()<.5?'F':'M';S.staff3[i]={id:'staff_'+i+'_'+RI(10,9999),n:nameGen(new Set(),g),g,age:RI(23,48)}}P.push({who:S.staff3[i],role:SR[i%SR.length],seat:free[i+3],ic:'💼'})}
 P.forEach(p=>{const m=o3person(p.who,{});p.b=o3buf(gl,m.body);p.a=o3buf(gl,m.arm);p.head=m.head;p.ph=Math.random()*6})
 O3.people=P.filter(p=>p.seat);
 // shadow map (static scene + seated people)
 o3shadow();o3labels();O3.sig=o3sig()}
function o3shadow(){const gl=O3.gl;const SZ=O3.SZ;gl.bindFramebuffer(gl.FRAMEBUFFER,O3.fb);gl.viewport(0,0,SZ,SZ);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(O3.sp);gl.disable(gl.BLEND);
 gl.uniformMatrix4fv(O3.su.uL,false,O3.LVP);const draw=(b,m)=>{gl.uniformMatrix4fv(O3.su.uM,false,m);gl.bindBuffer(gl.ARRAY_BUFFER,b.b);gl.vertexAttribPointer(O3.sa,3,gl.FLOAT,false,48,0);gl.drawArrays(gl.TRIANGLES,0,b.n)};
 gl.enableVertexAttribArray(O3.sa);draw(O3.stat,M4I);O3.people.forEach(p=>{const m=m4trs(p.seat.x,0,p.seat.z,p.seat.ry,1);draw(p.b,m);draw(p.a,m)});gl.bindFramebuffer(gl.FRAMEBUFFER,null)}

/* ---------- init ---------- */
function o3init(){if(O3.el)return true;if(typeof document==='undefined'||!document.createElement)return false;const c=document.createElement('canvas');c.className='o3c';let gl=null;try{gl=c.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:false})||c.getContext('experimental-webgl')}catch(e){}if(!gl)return false;
 try{O3.gl=gl;O3.el=c;O3.p=o3prog(gl,O3VS,O3FS);O3.sp=o3prog(gl,O3SVS,O3SFS);
  O3.at={};['aP','aN','aC','aU'].forEach(k=>O3.at[k]=gl.getAttribLocation(O3.p,k));O3.u={};['uM','uVP','uL','uT','uS','uLd','uSz','uNight'].forEach(k=>O3.u[k]=gl.getUniformLocation(O3.p,k));O3.sa=gl.getAttribLocation(O3.sp,'aP');O3.su={uM:gl.getUniformLocation(O3.sp,'uM'),uL:gl.getUniformLocation(O3.sp,'uL')};
  O3.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,O3.tex);[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(x=>gl.texParameteri(gl.TEXTURE_2D,x[0],x[1]));
  const SZ=O3.SZ=1536;O3.stex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,O3.stex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,SZ,SZ,0,gl.RGBA,gl.UNSIGNED_BYTE,null);[[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(x=>gl.texParameteri(gl.TEXTURE_2D,x[0],x[1]));
  O3.fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,O3.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,O3.stex,0);const rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,SZ,SZ);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,rb);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  O3.Ld=v3n([-.52,-1,-.38]);O3.LVP=m4mul(m4ortho(-15,15,-13,13,1,60),m4look([-O3.Ld[0]*30,-O3.Ld[1]*30,-O3.Ld[2]*30],[0,0,0],[0,1,0]));
  gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);gl.frontFace(gl.CCW);
  o3input(c);O3.ready=true;requestAnimationFrame(o3loop);return true}catch(e){O3.el=null;O3.err=String(e);return false}}

/* ---------- camera / input ---------- */
function o3input(c){const pts=new Map();let d0=0,z0=0,y0=0,x0=0,moved=0;
 c.addEventListener('pointerdown',e=>{c.setPointerCapture&&c.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(pts.size===1){x0=e.clientX;y0=O3.tYaw}if(pts.size===2){const a=[...pts.values()];d0=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);z0=O3.tZoom}O3.idle=0});
 c.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===1){const dx=e.clientX-x0;if(Math.abs(dx)>4)moved=1;O3.tYaw=clamp(y0-dx*.006,.05,1.5)}else if(pts.size===2){const a=[...pts.values()];const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);O3.tZoom=clamp(z0*d0/Math.max(20,d),3.2,10);moved=1}O3.idle=0;e.preventDefault()},{passive:false});
 const up=e=>{pts.delete(e.pointerId)};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
 c.addEventListener('wheel',e=>{O3.tZoom=clamp(O3.tZoom*(e.deltaY>0?1.1:.9),3.2,10);O3.idle=0;e.preventDefault()},{passive:false})}
function o3VP(w,h){const asp=w/h;const hw=O3.zoom*Math.max(asp,asp<.8?1.25:1.05),hv=hw/asp;const up=asp<.8?1.08:1.28;const ce=[.4,0,.6];const e=[ce[0]+Math.sin(O3.yaw)*Math.cos(O3.pitch)*40,ce[1]+Math.sin(O3.pitch)*40,ce[2]+Math.cos(O3.yaw)*Math.cos(O3.pitch)*40];
 return m4mul(m4ortho(-hw,hw,-hv*(2-up),hv*up,1,120),m4look(e,ce,[0,1,0]))}
function o3proj(VP,x,y,z,w,h){const v=[x,y,z,1];const o=[0,0,0,0];for(let i=0;i<4;i++)o[i]=VP[i]*v[0]+VP[4+i]*v[1]+VP[8+i]*v[2]+VP[12+i];return [(o[0]/o[3]*.5+.5)*w,(1-(o[1]/o[3]*.5+.5))*h]}

/* ---------- labels (HTML overlay) ---------- */
function o3labels(){const wrap=O3.lab;if(!wrap)return;wrap.innerHTML=O3.people.map((p,i)=>`<button class="o3tag ${p.tk?'team':i===0?'':'staff'} ${i===0?'me':''}" data-i="${i}" onclick="o3tap(${i})"><b>${esc(p.who.n.split(' ')[0])}</b><span>${p.ic} ${esc(p.role)}</span></button>`).join('')+O3.rooms.map((r,i)=>`<button class="o3room" data-r="${i}" onclick="${r.f}">${r.l} ›</button>`).join('')}
function o3tap(i){const p=O3.people[i];if(!p)return;hap('tap');if(p.act){try{p.act()}catch(e){}return}o3talk(p)}
function o3talk(p){const k=p.tk;let lines=[];const f=inThe()[0],pr=S.projects.filter(x=>!x.vault);
 if(k==='asst')lines=[pick(['Need something, boss?','Your 3 o’clock cancelled. You’re free.','Coffee’s fresh.']),`You have ${weekRows().length} things on your plate this week${pitchOpen().length?`, including a pitch from <b>${esc(pname(pitchOpen()[0].who))}</b>`:''}.`];
 else if(k==='dist')lines=f?[`<b>${esc(f.title)}</b> is at ${M(boShown(f).ww)} worldwide.`,pick(['The chains want to keep it another week.','Overseas is holding up nicely.','Word of mouth is doing the work now.'])]:['Nothing in cinemas right now.','The chains keep asking what we’ve got next.'];
 else if(k==='mkt'){const s=soon()[0];lines=s?[`<b>${esc(s.title)}</b> opens soon. Hype is at ${Math.round(s.hype||0)}.`,'Give me a bigger budget and I’ll make it trend.']:['Quiet on my side.','Greenlight something and I’ll make the world talk about it.']}
 else if(k==='prod'){const sh=pr.filter(x=>phaseOf(x)==='shoot');lines=sh.length?[`We’re shooting ${sh.length} film${sh.length>1?'s':''} right now.`,`<b>${esc(sh[0].title)}</b> is on schedule. For now.`]:pr.length?[`${pr.length} project${pr.length>1?'s':''} on the slate.`,'Crews are ready when you are.']:['The stages are empty, boss.','Let’s make a movie.']}
 else lines=[pick(['Hey! Just finishing a report.','Big fan of the last film, by the way.','Is it true we’re making a sequel?','I’ve got a great idea for a horror movie…','Back to work, I know, I know.'])];
 playScene({bg:'office',tag:'Studio floor',who:p.who,role:p.role,lines,choices:k==='asst'&&pitchOpen().length?[{l:'Send them in',f:()=>{setTimeout(()=>pitchView(pitchOpen()[0].id),300);return null}},{l:'Thanks'}]:[{l:'Thanks'}]},()=>{})}

/* ---------- render one frame (used by loop + snapshot) ---------- */
function o3frame(w,h,ts,labels){const gl=O3.gl,c=O3.el;const VP=o3VP(w,h);gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(O3.p);
 gl.uniformMatrix4fv(O3.u.uVP,false,VP);gl.uniformMatrix4fv(O3.u.uL,false,O3.LVP);gl.uniform3fv(O3.u.uLd,O3.Ld);gl.uniform1f(O3.u.uSz,O3.SZ);gl.uniform1f(O3.u.uNight,0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,O3.tex);gl.uniform1i(O3.u.uT,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,O3.stex);gl.uniform1i(O3.u.uS,1);
 const A=O3.at;[A.aP,A.aN,A.aC,A.aU].forEach(x=>gl.enableVertexAttribArray(x));
 const draw=(b,m)=>{gl.uniformMatrix4fv(O3.u.uM,false,m);gl.bindBuffer(gl.ARRAY_BUFFER,b.b);gl.vertexAttribPointer(A.aP,3,gl.FLOAT,false,48,0);gl.vertexAttribPointer(A.aN,3,gl.FLOAT,false,48,12);gl.vertexAttribPointer(A.aC,4,gl.FLOAT,false,48,24);gl.vertexAttribPointer(A.aU,2,gl.FLOAT,false,48,40);gl.drawArrays(gl.TRIANGLES,0,b.n)};
 gl.disable(gl.BLEND);gl.depthMask(true);draw(O3.stat,M4I);const t=ts/1000;
 O3.people.forEach(p=>{const s=p.seat;const bob=Math.sin(t*1.3+p.ph)*.012;const turn=Math.sin(t*.35+p.ph)*.18;draw(p.b,m4trs(s.x,bob,s.z,s.ry+turn*.4,1));const ty=p.tk==='asst'||!p.tk||p.tk==='prod'?Math.abs(Math.sin(t*9+p.ph))*.025:Math.sin(t*2+p.ph)*.01;draw(p.a,m4trs(s.x,bob+ty,s.z,s.ry+turn*.4,1))});
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.disable(gl.CULL_FACE);draw(O3.glass,M4I);gl.enable(gl.CULL_FACE);gl.depthMask(true);gl.disable(gl.BLEND);
 if(labels&&O3.lab){const lab=O3.lab;lab.classList.toggle('near',O3.zoom<5.6);const tags=lab.querySelectorAll('.o3tag');O3.people.forEach((p,i)=>{const e=tags[i];if(!e)return;const q=o3proj(VP,p.seat.x,p.head+.25,p.seat.z,w,h);e.style.transform=`translate(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px) translate(-50%,-100%)`;e.style.display=q[0]<-40||q[0]>w+40||q[1]<0||q[1]>h+10?'none':''});
  lab.querySelectorAll('.o3room').forEach((e,i)=>{const r=O3.rooms[i];const q=o3proj(VP,r.x,r.y,r.z,w,h);e.style.transform=`translate(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px) translate(-50%,-50%)`})}}
function o3loop(ts){requestAnimationFrame(o3loop);const c=O3.el;if(!c||!O3.ready||!c.isConnected||document.hidden||!O3.full)return;if(document.getElementById('scn'))return;if(ts-O3.last<30)return;O3.last=ts;
 const w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;const dpr=Math.min(window.devicePixelRatio||1,2);if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
 O3.idle+=1;if(O3.idle>200)O3.tYaw=.78+Math.sin(ts/9000)*.22;O3.yaw+=(O3.tYaw-O3.yaw)*.12;O3.zoom+=(O3.tZoom-O3.zoom)*.12;o3frame(w,h,ts,true)}
/* still preview for the home card */
function o3snap(){if(!O3.ready||O3.full)return;try{const c=O3.el;const y=O3.yaw,z=O3.zoom;O3.yaw=.78;O3.zoom=6.4;c.width=760;c.height=400;o3frame(380,200,1200,false);const cc=document.createElement('canvas');cc.width=760;cc.height=400;const x=cc.getContext('2d');const dk=!document.body.classList.contains('light');const g=x.createRadialGradient(380,0,40,380,120,520);g.addColorStop(0,dk?'#3a3028':'#fbf6ec');g.addColorStop(1,dk?'#17130f':'#dccbb0');x.fillStyle=g;x.fillRect(0,0,760,400);x.drawImage(c,0,0);O3.snap=cc.toDataURL('image/jpeg',.88);O3.yaw=y;O3.zoom=z;const im=document.getElementById('o3img');if(im)im.src=O3.snap}catch(e){}}
function o3ensure(){if(!o3init())return false;if(O3.sig!==o3sig()){o3build();setTimeout(o3snap,30)}else if(!O3.snap)o3snap();return true}
function o3card(){const n=O3.people.length||(4+o3staffN());const aw=S.awards||{};const tro=(aw.film||0)+(aw.tv||0)+(aw.fest||0);
 return `<button class="o3card" onclick="o3open()"><div class="o3pv">${O3.snap?`<img id="o3img" src="${O3.snap}" alt="">`:`<img id="o3img" alt="">`}</div><div class="o3cap"><div><small>Your studio</small><b>${esc(S.name)}</b><span>${n} people at work${tro?` · ${tro} trophies`:''}</span></div><i>Enter ›</i></div></button>`}
function o3open(){if(!o3ensure())return toast('3D isn’t supported on this device');hap('tap');O3.full=true;O3.tZoom=6.4;O3.zoom=7.4;O3.idle=0;
 const host=document.createElement('div');host.id='o3host';host.className='o3host full';host.innerHTML=`<div class="o3bar"><button onclick="o3close()" aria-label="Back">‹</button><div><b>${esc(S.name)}</b><span>${O3.people.length} people · tap anyone to talk</span></div></div>`;
 host.appendChild(O3.el);const lab=document.createElement('div');lab.className='o3lab';host.appendChild(lab);O3.lab=lab;document.body.appendChild(host);document.body.classList.add('o3open');o3labels();
 if(!S.o3hint){S.o3hint=1;const hint=document.createElement('div');hint.className='o3hint';hint.textContent='Swipe to look around · pinch to zoom';host.appendChild(hint);setTimeout(()=>hint.remove(),4000)}
 try{musicTrack('hq')}catch(e){}}
function o3close(){O3.full=false;const h=document.getElementById('o3host');if(h)h.remove();document.body.classList.remove('o3open');hap('tap');O3.snap=null;render()}
hq8=(function(o){return function(){const h=o();let card='';try{if(o3ensure())card=o3card()}catch(e){}return h.replace('<div class="sec"><h2>This week</h2></div>',card+'<div class="sec"><h2>This week</h2></div>')}})(hq8);
