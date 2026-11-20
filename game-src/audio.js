/* ===================== PREFS, THEME, MUSIC & SFX (procedural, no files) ===================== */
const PREF_KEY='hss_prefs';
let PREFS={theme:'light',music:true,sfx:true};
try{Object.assign(PREFS,JSON.parse(localStorage.getItem(PREF_KEY)||'{}'))}catch(e){}
function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify(PREFS))}catch(e){}}
function applyTheme(){if(typeof document!=='undefined'&&document.body&&document.body.classList){document.body.classList.toggle('light',PREFS.theme==='light')}}
let AC=null,MG=null,FXG=null,mTimer=null,mNext=0,mStep=0,noiseBuf=null;
function audioInit(){if(AC)return true;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;AC=new C();MG=AC.createGain();MG.gain.value=.09;MG.connect(AC.destination);FXG=AC.createGain();FXG.gain.value=.25;FXG.connect(AC.destination);
 noiseBuf=AC.createBuffer(1,AC.sampleRate*.2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return true}catch(e){return false}}
const mtof=m=>440*Math.pow(2,(m-69)/12);
// Smooth lounge progression: Cmaj7 – Am7 – Dm7 – G7 , then Fmaj7 – Em7 – Dm7 – G13
const PROG=[[48,[60,64,67,71]],[45,[57,60,64,67]],[50,[62,65,69,72]],[43,[59,62,65,69]],[41,[57,60,64,69]],[40,[55,59,62,67]],[50,[62,65,69,72]],[43,[59,64,65,69]]];
const BPM=92,SPB=60/BPM;
function note(freq,t,dur,type,vol,dest,attack){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(attack||.02));g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(dest||MG);o.start(t);o.stop(t+dur+.05)}
function hat(t,vol){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=7000;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.06);s.connect(f);f.connect(g);g.connect(MG);s.start(t);s.stop(t+.08)}
function schedule8th(t){const bar=Math.floor(mStep/8)%PROG.length,e=mStep%8;const [bass,ch]=PROG[bar];
 if(e===0){ch.forEach(n=>note(mtof(n),t,SPB*4.1,'sine',.18,MG,.25));note(mtof(bass),t,SPB*1.6,'triangle',.5)}
 if(e===4)note(mtof(bass+7),t,SPB*1.4,'triangle',.4);
 if(e===6&&Math.random()<.6)note(mtof(bass+12),t,SPB*.6,'triangle',.3);
 if(e%2===1)hat(t,.05);if(e===2||e===6)hat(t,.025);
 if(Math.random()<.55){const n=ch[Math.floor(Math.random()*4)]+12+(Math.random()<.3?12:0);note(mtof(n),t,SPB*.9,'sine',.12)}
 mStep++}
function musicStart(){if(!PREFS.music||!audioInit())return;if(AC.state==='suspended')AC.resume();if(mTimer)return;mNext=AC.currentTime+.1;
 mTimer=setInterval(()=>{if(!AC)return;while(mNext<AC.currentTime+.4){schedule8th(mNext);mNext+=SPB/2}},100)}
function musicStop(){if(mTimer){clearInterval(mTimer);mTimer=null}}
function sfx(kind){if(!PREFS.sfx||!audioInit())return;if(AC.state==='suspended')AC.resume();const t=AC.currentTime;
 if(kind==='click')note(1200,t,.06,'sine',.25,FXG,.003);
 if(kind==='cash'){[0,.08,.16].forEach((d,i)=>note(mtof(84+i*4),t+d,.25,'square',.12,FXG,.005));note(mtof(96),t+.26,.5,'sine',.3,FXG,.01)}
 if(kind==='win'){[60,64,67,72,76,79].forEach((n,i)=>note(mtof(n),t+i*.11,.9,'sawtooth',.08,FXG,.01));[72,76,79,84].forEach(n=>note(mtof(n),t+.7,1.6,'sine',.14,FXG,.05))}
 if(kind==='flop'){[67,63,60,55].forEach((n,i)=>note(mtof(n),t+i*.22,.35,'triangle',.25,FXG,.01))}
 if(kind==='drum'){for(let i=0;i<14;i++){const s=AC.createBufferSource();s.buffer=noiseBuf;const g=AC.createGain();g.gain.setValueAtTime(.18,t+i*.09);g.gain.exponentialRampToValueAtTime(.001,t+i*.09+.08);s.connect(g);g.connect(FXG);s.start(t+i*.09)}}
 if(kind==='ring'){for(let i=0;i<4;i++){note(1400,t+i*.18,.12,'sine',.18,FXG,.005);note(1750,t+i*.18+.06,.1,'sine',.14,FXG,.005)}}}
if(typeof document!=='undefined'&&document.addEventListener){
 document.addEventListener('click',e=>{if(PREFS.music&&!mTimer)musicStart();const b=e.target&&e.target.closest&&e.target.closest('button,.opt,.tile');if(b)sfx('click')},true);
 document.addEventListener('visibilitychange',()=>{if(!AC)return;if(document.hidden)AC.suspend&&AC.suspend();else if(PREFS.music)AC.resume&&AC.resume()});
}
