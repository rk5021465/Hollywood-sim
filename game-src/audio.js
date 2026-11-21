"use strict";
// Procedural music: tanpura-style drone, a reedy shehnai-like melody, and dhol drums for the baraat.
const AUD=(()=>{
 let A=null,master=null,mode='off',timer=null,step=0,drone=[],on=true;
 try{on=localStorage.getItem('shaadi_music')!=='off'}catch(e){}
 const SA=146.83;// D3
 const RAGA=[0,2,4,5,7,9,11,12,14,16];// major scale steps (Bilawal-like)
 const f=st=>SA*Math.pow(2,st/12);
 function ctx(){if(!A){try{A=new (window.AudioContext||window.webkitAudioContext)();master=A.createGain();master.gain.value=.55;master.connect(A.destination)}catch(e){A=null}}if(A&&A.state==='suspended')A.resume();return A}
 function env(node,t,a,peak,d){node.gain.setValueAtTime(.0001,t);node.gain.exponentialRampToValueAtTime(peak,t+a);node.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
 function pluck(freq,t,vol=.05){const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();o.type='sawtooth';o.frequency.value=freq;lp.type='lowpass';lp.frequency.setValueAtTime(2400,t);lp.frequency.exponentialRampToValueAtTime(400,t+1.2);env(g,t,.01,vol,1.6);o.connect(lp).connect(g).connect(master);o.start(t);o.stop(t+1.8)}
 function reed(freq,t,dur,vol=.045){const o=A.createOscillator(),g=A.createGain(),bp=A.createBiquadFilter(),lfo=A.createOscillator(),lg=A.createGain();o.type='sawtooth';o.frequency.value=freq;lfo.frequency.value=5.5;lg.gain.value=freq*.012;lfo.connect(lg).connect(o.frequency);bp.type='bandpass';bp.frequency.value=freq*2.2;bp.Q.value=1.4;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.06);g.gain.setValueAtTime(vol,t+dur*.75);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(bp).connect(g).connect(master);o.start(t);lfo.start(t);o.stop(t+dur+.05);lfo.stop(t+dur+.05)}
 function drum(t,low,vol){const o=A.createOscillator(),g=A.createGain();o.type='sine';o.frequency.setValueAtTime(low?95:210,t);o.frequency.exponentialRampToValueAtTime(low?45:120,t+.18);env(g,t,.003,vol,low?.35:.12);o.connect(g).connect(master);o.start(t);o.stop(t+.4);
  if(!low){const n=A.createBufferSource(),b=A.createBuffer(1,A.sampleRate*.08,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);n.buffer=b;const ng=A.createGain(),hp=A.createBiquadFilter();hp.type='highpass';hp.frequency.value=1500;ng.gain.value=vol*.6;n.connect(hp).connect(ng).connect(master);n.start(t)}}
 function startDrone(){stopDrone();[SA/2,SA*1.5/2].forEach((fr,i)=>{const o=A.createOscillator(),g=A.createGain(),lp=A.createBiquadFilter();o.type='sawtooth';o.frequency.value=fr;lp.type='lowpass';lp.frequency.value=500;g.gain.value=i?.012:.018;o.connect(lp).connect(g).connect(master);o.start();drone.push(o)})}
 function stopDrone(){drone.forEach(o=>{try{o.stop()}catch(e){}});drone=[]}
 let mel=0,melNote=4;
 function tick(){if(!A)return;const t=A.currentTime+.05;const beat=mode==='baraat'?.2:.32;
  // tanpura cycle: Pa Sa' Sa' Sa
  if(step%(mode==='baraat'?8:6)===0){const cyc=[7,12,12,0];pluck(f(cyc[(step/6|0)%4]-12),t,mode==='home'?.03:.04)}
  if(mode==='baraat'){const pat='X.x.Xxx.X.x.XxX.';const c=pat[step%16];if(c==='X')drum(t,true,.35);else if(c==='x')drum(t,false,.18)}
  if((mode==='day'||mode==='baraat'||mode==='home')&&--mel<=0){const dur=(mode==='baraat'?1:2)*(beat*(1+Math.floor(Math.random()*3)));melNote=Math.max(0,Math.min(RAGA.length-1,melNote+[-2,-1,-1,1,1,2,0][Math.floor(Math.random()*7)]));if(Math.random()<(mode==='home'?.55:.8))reed(f(RAGA[melNote]),t,dur,mode==='home'?.025:.04);mel=Math.max(1,Math.round(dur/beat))+(Math.random()<.2?3:0)}
  step++;timer=setTimeout(tick,beat*1000)}
 function play(m){if(!on){mode=m;return}if(m===mode&&timer)return;mode=m;if(timer){clearTimeout(timer);timer=null}if(m==='off'||!ctx()){stopDrone();return}startDrone();step=0;tick()}
 function sfx(k){if(!on||!ctx())return;const t=A.currentTime+.01;
  if(k==='good'){[0,4,7,12].forEach((s,i)=>pluck(f(s+12),t+i*.07,.05))}
  else if(k==='bad'){reed(f(-1),t,.5,.05);reed(f(-6),t+.15,.5,.04)}
  else if(k==='coin'){pluck(f(19),t,.05);pluck(f(24),t+.08,.05)}
  else if(k==='tap'){pluck(f(12),t,.025)}
  else if(k==='place'){drum(t,false,.12);pluck(f(16),t,.03)}
  else if(k==='big'){[0,4,7,12,16,19,24].forEach((s,i)=>pluck(f(s),t+i*.09,.05));drum(t,true,.3)}}
 function toggle(){on=!on;try{localStorage.setItem('shaadi_music',on?'on':'off')}catch(e){}if(!on){const m=mode;play('off');mode=m}else{const m=mode;mode='off';play(m==='off'?'home':m)}return on}
 return{play,sfx,toggle,isOn:()=>on,unlock:()=>{ctx()}};
})();
