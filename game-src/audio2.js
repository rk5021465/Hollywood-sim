/* ===================== Soundtrack v2 — multi-track procedural score ===================== */
let REV=null,MTRACK='hq',MWANT='hq';
function audioFx(){if(REV||!AC)return;try{REV=AC.createConvolver();const len=AC.sampleRate*2.6,buf=AC.createBuffer(2,len,AC.sampleRate);
 for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4)}REV.buffer=buf;const rg=AC.createGain();rg.gain.value=.32;REV.connect(rg);rg.connect(MG)}catch(e){REV=null}}
function voice(freq,t,dur,o){o=o||{};const g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=o.cut||2400;f.Q.value=o.q||.7;
 const oscs=(o.det||[0]).map(d=>{const x=AC.createOscillator();x.type=o.type||'sawtooth';x.frequency.value=freq;x.detune.value=d;x.connect(f);x.start(t);x.stop(t+dur+(o.rel||.3)+.1);return x});
 const v=(o.vol||.1)/Math.sqrt(oscs.length);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(o.att||.02));g.gain.setValueAtTime(v,t+Math.max(o.att||.02,dur-.05));g.gain.exponentialRampToValueAtTime(.0006,t+dur+(o.rel||.3));
 f.connect(g);g.connect(MG);if(REV&&o.wet!==0){const s=AC.createGain();s.gain.value=o.wet||.5;g.connect(s);s.connect(REV)}}
function timp(t,f0,vol){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f0*1.5,t);o.frequency.exponentialRampToValueAtTime(f0,t+.12);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.9);o.connect(g);g.connect(MG);if(REV)g.connect(REV);o.start(t);o.stop(t+1)}
function brush(t,vol){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=5200;f.Q.value=.6;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);s.connect(f);f.connect(g);g.connect(MG);s.start(t);s.stop(t+.16)}
const TRACKS={
 menu:{bpm:72,prog:[[45,[57,60,64,69]],[41,[57,60,65,69]],[48,[55,60,64,67]],[43,[55,59,62,67]],[45,[57,60,64,69]],[41,[53,57,60,65]],[38,[57,62,65,69]],[40,[56,59,64,68]]],
  mel:[76,null,74,72,71,72,74,null, 72,null,76,77,79,null,77,76, 76,null,74,72,74,76,79,null, 81,null,79,77,76,74,72,71],
  step(t,bar,e,ch,bass,SPB){if(e===0){ch.forEach(n=>voice(mtof(n),t,SPB*4,{det:[-8,8],cut:1500,vol:.07,att:.5,rel:1.2,wet:.7}));voice(mtof(bass),t,SPB*4,{type:'triangle',cut:600,vol:.16,att:.1,rel:.8});timp(t,mtof(bass),.35)}
   if(e===4)timp(t,mtof(bass+7)/2*2,.18);const m=this.mel[(bar%4)*8+e];if(m)voice(mtof(m),t,SPB*.95,{det:[-5,5],cut:2600,vol:.075,att:.06,rel:.4,wet:.6});
   if(e%2===1)voice(mtof(ch[(e>>1)%4]+12),t,SPB*.45,{type:'triangle',cut:3000,vol:.03,att:.01,rel:.2,wet:.6})}},
 hq:{bpm:96,prog:[[48,[64,67,71,74]],[45,[60,64,67,72]],[50,[65,69,72,76]],[43,[65,71,74,77]],[52,[64,67,71,74]],[45,[61,64,67,71]],[50,[65,69,72,76]],[43,[65,69,71,76]]],
  step(t,bar,e,ch,bass,SPB){const walk=[0,4,7,9,12,9,7,4];if(e%2===0)voice(mtof(bass+walk[e]),t,SPB*.9,{type:'triangle',cut:900,vol:.2,att:.01,rel:.15,wet:.1});
   if(e===1||e===5)ch.forEach(n=>{voice(mtof(n),t,SPB*.7,{type:'sine',vol:.05,att:.005,rel:.5,wet:.35});voice(mtof(n)*2,t,SPB*.3,{type:'sine',vol:.012,att:.003,rel:.3,wet:.3})});
   brush(t,e%2?.05:.025);if(e===3||e===7)brush(t+SPB*.33,.03);
   if(Math.random()<.42){const sc=[0,2,4,7,9,11,12,14];voice(mtof(ch[0]+12+sc[Math.floor(Math.random()*8)]),t+(e%2?SPB*.17:0),SPB*.6,{type:'sine',vol:.05,att:.01,rel:.35,wet:.45})}}},
 tension:{bpm:112,prog:[[38,[50,53,57]],[38,[50,53,58]],[36,[48,52,55]],[37,[49,52,56]]],
  step(t,bar,e,ch,bass,SPB){voice(mtof(bass+(e%2?12:0)),t,SPB*.4,{det:[-6,6],cut:1100,vol:.09,att:.005,rel:.08,wet:.2});voice(mtof(bass+(e%2?12:0)),t+SPB/4,SPB*.2,{det:[0],cut:900,vol:.05,att:.005,rel:.05,wet:.1});
   if(e===0){ch.forEach(n=>voice(mtof(n+12),t,SPB*4,{det:[-10,10],cut:1300,vol:.05,att:.8,rel:1,wet:.7}));timp(t,mtof(bass),.3)}if(e===6&&bar%2)timp(t,mtof(bass),.2)}},
 awards:{bpm:68,prog:[[48,[60,64,67,72]],[53,[60,65,69,72]],[55,[59,62,67,71]],[48,[60,64,67,72]],[45,[60,64,69,72]],[50,[62,65,69,74]],[43,[59,62,67,71]],[48,[60,64,67,72]]],
  mel:[72,null,79,null,77,76,74,null,76,null,81,null,79,null,77,null],
  step(t,bar,e,ch,bass,SPB){if(e===0){ch.forEach(n=>voice(mtof(n),t,SPB*4,{det:[-7,7],cut:1800,vol:.07,att:.4,rel:1.4,wet:.8}));voice(mtof(bass),t,SPB*4,{type:'triangle',cut:500,vol:.18,att:.1});timp(t,mtof(bass),.3)}
   const m=this.mel[(bar%2)*8+e];if(m)voice(mtof(m),t,SPB*1.4,{det:[-4,4],cut:3000,vol:.09,att:.03,rel:.6,wet:.7})}}};
let mBar=0;
function musicStart(){if(!PREFS.music||!audioInit())return;audioFx();if(AC.state==='suspended')AC.resume();if(mTimer)return;mNext=AC.currentTime+.1;mStep=0;
 mTimer=setInterval(()=>{if(!AC)return;while(mNext<AC.currentTime+.4){const T=TRACKS[MTRACK];const SPB=60/T.bpm;const e=mStep%8;
  if(e===0&&MWANT!==MTRACK){MTRACK=MWANT;mStep=0;continue}const bar=Math.floor(mStep/8);const [bass,ch]=T.prog[bar%T.prog.length];T.step(mNext,bar,e,ch,bass,SPB);mStep++;mNext+=SPB/2}},100)}
function musicTrack(k){if(TRACKS[k])MWANT=k}
const _sfx2=sfx;sfx=function(kind){if(kind==='fanfare'||kind==='victory'){if(!PREFS.sfx||!audioInit())return;audioFx();const t=AC.currentTime;
  const seq=kind==='fanfare'?[[60,0,.18],[60,.2,.18],[60,.4,.18],[67,.6,.7],[64,1.35,.25],[67,1.6,1.4]]:[[72,0,.15],[76,.15,.15],[79,.3,.15],[84,.45,1]];
  seq.forEach(([n,d,l])=>{voice(mtof(n),t+d,l,{det:[-6,6],cut:3200,vol:.16,att:.02,rel:.4,wet:.6});voice(mtof(n-12),t+d,l,{det:[0],cut:1500,vol:.08,att:.02,rel:.4,wet:.4})});
  if(kind==='fanfare'){timp(t+.6,mtof(48),.5);timp(t+1.6,mtof(48),.6)}return}return _sfx2(kind)};
