/* ===================== v12.1 — softer ambient score, music off by default ===================== */
(function(){try{if(!PREFS.m122){PREFS.m122=1;PREFS.m121=1;PREFS.music=true;localStorage.setItem(PREF_KEY,JSON.stringify(PREFS))}}catch(e){}})();
const _ai121=audioInit;audioInit=function(){const r=_ai121();try{if(r&&MG&&!MG._soft){MG.gain.value=.06;MG._soft=1}}catch(e){}return r};
// gentle "piano": sine + soft overtone, quick attack, long natural decay
function keys(f,t,dur,vol){voice(f,t,dur*.2,{type:'sine',vol:vol,att:.008,rel:dur*.9,wet:.55,cut:2600});voice(f*2,t,dur*.1,{type:'sine',vol:vol*.18,att:.006,rel:dur*.5,wet:.5,cut:3000})}
function pad(ns,t,dur,vol){ns.forEach(n=>voice(mtof(n),t,dur,{type:'sine',det:[-4,4],vol:vol,att:dur*.35,rel:dur*.6,wet:.8,cut:1200}))}
Object.assign(TRACKS,{
 hq:{bpm:66,prog:[[48,[60,64,67,71]],[45,[57,60,64,67]],[41,[57,60,65,69]],[43,[55,59,62,67]]],
  step(t,bar,e,ch,bass,SPB){if(e===0){pad(ch,t,SPB*4.2,.035);voice(mtof(bass),t,SPB*3.8,{type:'sine',vol:.09,att:.3,rel:1.2,wet:.4,cut:500})}
   const pat=[0,null,2,null,1,3,null,2];const k=pat[(e+bar*3)%8];if(k!=null&&Math.random()<.8)keys(mtof(ch[k]+12),t,SPB*2.2,.045);if(e===6&&bar%2)keys(mtof(ch[3]+24),t,SPB*3,.025)}},
 menu:{bpm:60,prog:[[45,[57,60,64,69]],[41,[57,60,65,69]],[48,[55,60,64,67]],[43,[55,59,62,67]]],
  step(t,bar,e,ch,bass,SPB){if(e===0){pad(ch,t,SPB*4.2,.04);voice(mtof(bass),t,SPB*4,{type:'sine',vol:.1,att:.4,rel:1.4,wet:.5,cut:450})}if(e===2||e===5)keys(mtof(ch[(bar+e)%4]+12),t,SPB*2.6,.04)}},
 tension:{bpm:84,prog:[[38,[50,53,57]],[38,[50,53,58]],[36,[48,52,55]],[37,[49,52,56]]],
  step(t,bar,e,ch,bass,SPB){if(e===0){pad(ch.map(n=>n+12),t,SPB*4.2,.03);timp(t,mtof(bass),.18)}if(e%2===0)voice(mtof(bass+12),t,SPB*.5,{type:'sine',vol:.05,att:.01,rel:.25,wet:.3,cut:700})}},
 awards:{bpm:60,prog:[[48,[60,64,67,72]],[53,[60,65,69,72]],[55,[59,62,67,71]],[48,[60,64,67,72]]],mel:[72,null,79,null,77,76,74,null,76,null,81,null,79,null,77,null],
  step(t,bar,e,ch,bass,SPB){if(e===0){pad(ch,t,SPB*4.2,.04);voice(mtof(bass),t,SPB*4,{type:'sine',vol:.11,att:.3,rel:1.5,wet:.5,cut:450});timp(t,mtof(bass),.15)}const m=this.mel[(bar%2)*8+e];if(m)keys(mtof(m),t,SPB*3,.05)}}});
