"use strict";
// Painted stage: a painting with a slow cinematic drift, cross-fades, and living effects drawn on top.
const ART_HAVE=new Set(['haveli','garden','temple','tent','feast','nikah','farewell','bmother','aunt','uncle','bride','groom','priest','cook','rival']);
function art(k){return 'assets/'+k+'.webp'}
function venueArt(kind){if(kind==='haveli2')kind='haveli';if(ART_HAVE.has(kind))return art(kind);if(kind==='palace')return art(ART_HAVE.has('palace')?'palace':'haveli');return art('haveli')}
class Stage{
 constructor(el,h){this.el=el;this.h=h;el.classList.add('stage');el.style.height=h+'px';el.innerHTML='<div class="st-l"></div><div class="st-l"></div><canvas class="st-fx"></canvas><div class="st-cap"></div>';
  this.L=[...el.querySelectorAll('.st-l')];this.cur=0;this.cv=el.querySelector('canvas');this.ctx=this.cv.getContext('2d');this.cap=el.querySelector('.st-cap');
  this.fx={sparkle:1,petals:0,embers:0,rain:0,fire:0,fireworks:0,confetti:0,dark:0};this.P=[];this.bursts=[];this.T0=performance.now();this.resize();this.run=true;
  const loop=()=>{if(!document.body.contains(this.el)){this.run=false;return}this.frame();requestAnimationFrame(loop)};requestAnimationFrame(loop)}
 resize(){const d=Math.min(devicePixelRatio||1,2);this.W=this.el.clientWidth||360;this.cv.width=this.W*d;this.cv.height=this.h*d;this.ctx.setTransform(d,0,0,d,0,0)}
 show(src,o={}){const next=this.L[1-this.cur],prev=this.L[this.cur];const moves=[['scale(1.04) translate(0,0)','scale(1.16) translate(-3%,-2%)'],['scale(1.18) translate(3%,2%)','scale(1.05) translate(0,0)'],['scale(1.12) translate(-4%,0)','scale(1.12) translate(4%,0)'],['scale(1.1) translate(3%,-1%)','scale(1.18) translate(-2%,-3%)']];const m=o.move!=null?moves[o.move]:moves[Math.floor(Math.random()*moves.length)];
  if(o.focus){m[1]='scale(1.35) translate('+o.focus[0]+'%,'+o.focus[1]+'%)'}
  next.style.transition='none';next.style.backgroundImage='url('+src+')';next.style.transform=m[0];next.style.opacity=0;void next.offsetWidth;
  next.style.transition='opacity 1.2s ease, transform '+(o.dur||22)+'s ease-out';next.style.opacity=1;next.style.transform=m[1];prev.style.opacity=0;this.cur=1-this.cur;this.src=src}
 focus(fx,fy,s=1.3){const l=this.L[this.cur];l.style.transition='opacity 1.2s ease, transform 2.4s ease-in-out';l.style.transform='scale('+s+') translate('+fx+'%,'+fy+'%)'}
 caption(t,sub){this.cap.innerHTML=t?'<b>'+t+'</b>'+(sub?'<span>'+sub+'</span>':''):'';this.cap.classList.toggle('on',!!t)}
 set(k,v){this.fx[k]=v}
 burst(x,y,col){const ps=[];for(let i=0;i<46;i++){const a=Math.random()*6.283,s=40+Math.random()*90;ps.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1})}this.bursts.push({ps,col:col||['#FFD36B','#FF6B6B','#9AD8FF','#F29F05','#E8A0A8'][Math.floor(Math.random()*5)]})}
 frame(){const t=(performance.now()-this.T0)/1000,dt=Math.min(.05,t-(this._t||t));this._t=t;const c=this.ctx,W=this.W,H=this.h,f=this.fx;c.clearRect(0,0,W,H);
  // spawn particles
  const sp=(k,n)=>{for(let i=0;i<n;i++)this.P.push(k())};
  if(f.petals&&Math.random()<f.petals*.5)sp(()=>({k:'petal',x:Math.random()*W,y:-8,vx:10+Math.random()*16,vy:22+Math.random()*24,r:Math.random()*6,s:3+Math.random()*3,c:['#C8102E','#E8A0A8','#F29F05','#d6455d'][Math.floor(Math.random()*4)],l:1}),1);
  if(f.embers&&Math.random()<f.embers*.6)sp(()=>({k:'ember',x:W*(.35+Math.random()*.3),y:H*(.75+Math.random()*.2),vx:(Math.random()-.5)*12,vy:-20-Math.random()*30,s:1+Math.random()*1.6,l:1}),1);
  if(f.rain)sp(()=>({k:'rain',x:Math.random()*W*1.2,y:-10,vx:-60,vy:520+Math.random()*120,l:1}),Math.ceil(f.rain*4));
  if(f.confetti&&Math.random()<.7)sp(()=>({k:'conf',x:Math.random()*W,y:-6,vx:(Math.random()-.5)*30,vy:40+Math.random()*40,r:Math.random()*6,s:2+Math.random()*2,c:['#D9A931','#F6EEDF','#F29F05','#E8A0A8'][Math.floor(Math.random()*4)],l:1}),2);
  if(f.fireworks&&Math.random()<.025*f.fireworks)this.burst(W*(.15+Math.random()*.7),H*(.08+Math.random()*.25));
  // glints on lamps: deterministic positions so they stay put
  if(f.sparkle){for(let i=0;i<26;i++){const x=((i*137.5)%100)/100*W,y=H*(.35+((i*61.8)%55)/100);const a=Math.max(0,Math.sin(t*(1.3+(i%5)*.37)+i*2.1));if(a<.55)continue;const r=1.5+a*3.5;c.globalAlpha=(a-.55)*1.6*f.sparkle;const g=c.createRadialGradient(x,y,0,x,y,r*3);g.addColorStop(0,'rgba(255,224,150,.9)');g.addColorStop(1,'rgba(255,180,80,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r*3,0,7);c.fill();c.strokeStyle='rgba(255,240,200,.8)';c.lineWidth=.8;c.beginPath();c.moveTo(x-r*2,y);c.lineTo(x+r*2,y);c.moveTo(x,y-r*2);c.lineTo(x,y+r*2);c.stroke()}c.globalAlpha=1}
  if(f.fire){const p=.6+.25*Math.sin(t*9)+.15*Math.sin(t*23);const g=c.createRadialGradient(W*.5,H*.2,0,W*.5,H*.2,W*.6);g.addColorStop(0,'rgba(255,120,30,'+(.38*p)+')');g.addColorStop(1,'rgba(255,60,0,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}
  if(f.dark){c.fillStyle='rgba(10,14,30,'+f.dark+')';c.fillRect(0,0,W,H)}
  this.P=this.P.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(p.k==='petal'||p.k==='conf'){p.r+=dt*3;p.x+=Math.sin(t*2+p.s)*.4;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillStyle=p.c;c.globalAlpha=.9;c.beginPath();if(p.k==='petal')c.ellipse(0,0,p.s,p.s*.55,0,0,7);else c.rect(-p.s/2,-p.s/4,p.s,p.s/2);c.fill();c.restore();return p.y<H+10}
   if(p.k==='ember'){p.l-=dt*.5;c.globalAlpha=Math.max(0,p.l);c.fillStyle='#FFB347';c.beginPath();c.arc(p.x,p.y,p.s,0,7);c.fill();c.globalAlpha=1;return p.l>0}
   if(p.k==='rain'){c.strokeStyle='rgba(180,200,235,.55)';c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+p.vx*.025,p.y-p.vy*.025);c.stroke();return p.y<H+20}return false});
  this.bursts=this.bursts.filter(b=>{let alive=false;for(const p of b.ps){p.vx*=.985;p.vy=p.vy*.985+30*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt*.55;if(p.l<=0)continue;alive=true;c.globalAlpha=p.l;c.fillStyle=b.col;c.beginPath();c.arc(p.x,p.y,1.6,0,7);c.fill();c.globalAlpha=p.l*.25;c.beginPath();c.arc(p.x,p.y,4,0,7);c.fill()}c.globalAlpha=1;return alive});
 }
}
