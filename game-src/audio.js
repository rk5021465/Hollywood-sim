"use strict";
// Music made from physically modelled plucked strings (santoor, tanpura), tabla and dhol, through a hall reverb.
const AUD=(()=>{
 let A=null,out=null,wet=null,mode='off',timer=null,step=0,on=true;const bufs={};
 try{on=localStorage.getItem('shaadi_music')!=='off'}catch(e){}
 const SA=138.59;// C#3, a common tanpura pitch
 const f=st=>SA*Math.pow(2,st/12);
 const KHAMAJ=[0,2,4,5,7,9,10,12,14,16,17,19];// raga Khamaj: festive, used at weddings
 function ctx(){if(!A){try{A=new (window.AudioContext||window.webkitAudioContext)();out=A.createGain();out.gain.value=.5;const comp=A.createDynamicsCompressor();out.connect(comp).connect(A.destination);
  const conv=A.createConvolver();const len=A.sampleRate*2.6,ir=A.createBuffer(2,len,A.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}conv.buffer=ir;wet=A.createGain();wet.gain.value=.32;wet.connect(conv).connect(out)}catch(e){A=null}}if(A&&A.state==='suspended')A.resume();return A}
 // Karplus-Strong string, rendered once per pitch and cached
 function ks(freq,dur,bright,decay){const k=Math.round(freq*10)+'_'+bright+'_'+decay;if(bufs[k])return bufs[k];const sr=A.sampleRate,n=Math.floor(sr*dur),b=A.createBuffer(1,n,sr),d=b.getChannelData(0);const N=Math.max(2,Math.round(sr/freq));const ring=new Float32Array(N);for(let i=0;i<N;i++)ring[i]=(Math.random()*2-1)*(1-bright*.5+bright*Math.random()*.5);let p=0,last=0;
  for(let i=0;i<n;i++){const cur=ring[p];const nx=ring[(p+1)%N];const v=decay*(cur*(.5+bright*.25)+nx*(.5-bright*.25));ring[p]=v;d[i]=cur;p=(p+1)%N;last=v}
  let mx=0;for(let i=0;i<Math.min(n,2000);i++)mx=Math.max(mx,Math.abs(d[i]));const sc=mx?0.9/mx:1;for(let i=0;i<n;i++)d[i]*=sc;return bufs[k]=b}
 function play(buf,t,vol,pan=0,wetAmt=1,rate=1){const s=A.createBufferSource();s.buffer=buf;s.playbackRate.value=rate;const g=A.createGain();g.gain.value=vol;let node=g;if(A.createStereoPanner){const p=A.createStereoPanner();p.pan.value=pan;g.connect(p);node=p}s.connect(g);node.connect(out);if(wet&&wetAmt){const w=A.createGain();w.gain.value=wetAmt;node.connect(w).connect(wet)}s.start(t);return s}
 const santoor=(st,t,vol=.16,pan=0)=>play(ks(f(st+12),2.2,.9,.996),t,vol,pan,1.2);
 const tanpura=(st,t,vol=.11)=>play(ks(f(st-12),4,.35,.9993),t,vol,-.3,1);
 function tabla(kind,t,vol=.5){if(kind==='na'||kind==='tin'){play(ks(kind==='na'?f(24):f(19),.5,.6,.985),t,vol*.55,.25,.6)}
  if(kind==='ge'||kind==='dha'){const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.setValueAtTime(70,t);o.frequency.linearRampToValueAtTime(115,t+.12);o.frequency.exponentialRampToValueAtTime(80,t+.5);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol*.7,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.55);o.connect(g).connect(out);const w=A.createGain();w.gain.value=.3;g.connect(w).connect(wet);o.start(t);o.stop(t+.6);if(kind==='dha')play(ks(f(24),.5,.6,.985),t,vol*.5,.25,.6)}
  if(kind==='ka'){noise(t,.05,2500,vol*.35)}}
 function noise(t,dur,hp,vol){const n=Math.floor(A.sampleRate*dur),b=A.createBuffer(1,n,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);const s=A.createBufferSource();s.buffer=b;const fl=A.createBiquadFilter();fl.type='highpass';fl.frequency.value=hp;const g=A.createGain();g.gain.value=vol;s.connect(fl).connect(g).connect(out);s.start(t)}
 function dhol(kind,t,vol=.6){if(kind==='D'){const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(48,t+.25);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+.4);o.connect(g).connect(out);o.start(t);o.stop(t+.45)}else{noise(t,.07,1800,vol*.4);play(ks(330,.25,.9,.97),t,vol*.25,.3,.3)}}
 // phrase generator for santoor: tremolo rolls and stepwise melody in Khamaj
 let ni=4,phrase=[];
 function newPhrase(){phrase=[];const len=6+Math.floor(Math.random()*6);for(let i=0;i<len;i++){ni=Math.max(0,Math.min(KHAMAJ.length-1,ni+[-2,-1,-1,0,1,1,2][Math.floor(Math.random()*7)]));const roll=Math.random()<.3;phrase.push({n:KHAMAJ[ni],roll,len:roll?2:1+Math.floor(Math.random()*2)})}phrase.push({rest:1,len:2+Math.floor(Math.random()*4)})}
 let hold=0;
 const THEKA=['dha','ge','na','tin','na','ka','dhi','na'];// keherwa-like 8 beats
 function tick(){if(!A)return;const t=A.currentTime+.06;const beat=mode==='baraat'?.17:mode==='day'?.27:.34;
  if(step%8===0){const cyc=[7,12,12,0];tanpura(cyc[(step/8|0)%4],t,mode==='home'?.08:.1)}
  if(mode==='day'&&step%2===0){const b=THEKA[(step/2|0)%8];tabla(b==='dhi'?'dha':b,t,.35)}
  if(mode==='baraat'){const pat='D.dDd.D.D.dDd.dd';const c=pat[step%16];if(c==='D')dhol('D',t,.6);else if(c==='d')dhol('d',t,.5)}
  if(--hold<=0){if(!phrase.length)newPhrase();const p=phrase.shift();hold=p.len;
   if(!p.rest&&(mode!=='home'||Math.random()<.7)){const v=mode==='home'?.1:.14;if(p.roll){for(let i=0;i<4;i++)santoor(p.n,t+i*beat/2,v*(i?.6:1),.15)}else santoor(p.n,t,v,.15);if(mode==='baraat'&&Math.random()<.4)santoor(p.n+12,t+beat/2,v*.5,-.1)}}
  step++;timer=setTimeout(tick,beat*1000)}
 // Recorded music: CC-licensed recordings from Wikimedia Commons, cross-faded per scene.
 const TR={home:['home1','home2'],day:['day'],baraat:['baraat'],ceremony:['ceremony']},VOL={home:.45,day:.5,baraat:.6,ceremony:.5};
 let curEl=null,curMode=null,hi=0;
 function fade(el,to,ms,done){const from=el.volume,t0=performance.now();const f=()=>{const k=Math.min(1,(performance.now()-t0)/ms);el.volume=Math.max(0,Math.min(1,from+(to-from)*k));if(k<1)requestAnimationFrame(f);else if(done)done()};requestAnimationFrame(f)}
 function startTrack(m){const list=TR[m];if(!list)return;const name=m==='home'?list[(hi++)%list.length]:list[0];const el=new Audio('assets/music/'+name+'.ogg');el.loop=m!=='home';el.volume=0;el.onended=()=>{if(curEl===el&&curMode==='home'){curEl=null;startTrack('home')}};
  const p=el.play();if(p&&p.catch)p.catch(()=>{});fade(el,VOL[m],1800);curEl=el;curMode=m}
 function setMode(m){mode=m;if(!on)return;if(m===curMode&&curEl)return;const old=curEl;if(old)fade(old,0,1400,()=>{old.pause()});curEl=null;curMode=null;if(m==='off')return;startTrack(m)}
 function sfx(k){if(!on||!ctx())return;const t=A.currentTime+.01;
  if(k==='good'){[0,4,7,12].forEach((s,i)=>santoor(s,t+i*.06,.14))}
  else if(k==='bad'){tabla('ge',t,.5);santoor(-1,t+.05,.1);santoor(-2,t+.25,.1)}
  else if(k==='coin'){santoor(16,t,.12);santoor(19,t+.07,.12)}
  else if(k==='tap'){santoor(12,t,.07)}
  else if(k==='place'){tabla('na',t,.4)}
  else if(k==='big'){[0,4,7,12,16,19].forEach((s,i)=>santoor(s,t+i*.08,.15));tanpura(0,t,.15);dhol('D',t,.5)}}
 function toggle(){on=!on;try{localStorage.setItem('shaadi_music',on?'on':'off')}catch(e){}const m=mode;if(!on){if(curEl){curEl.pause();curEl=null;curMode=null}}else{setMode(m==='off'?'home':m)}return on}
 document.addEventListener('visibilitychange',()=>{if(!curEl)return;if(document.hidden)curEl.pause();else if(on){const p=curEl.play();if(p&&p.catch)p.catch(()=>{})}});
 return{play:setMode,sfx,toggle,isOn:()=>on,unlock:()=>{ctx()}};
})();
