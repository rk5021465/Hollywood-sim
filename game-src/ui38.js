/* ===================== v26 — directors read their stories aloud ===================== */
const E38=e=>{try{if(typeof document!=="undefined"&&typeof document.querySelector==="function"&&document.body&&document.body.classList)console.error(e)}catch(_){}};
const NAT38=()=>typeof window!=='undefined'&&window.HSNative&&typeof window.HSNative.ttsSpeak==='function';
const WEB38=()=>typeof window!=='undefined'&&window.speechSynthesis&&typeof SpeechSynthesisUtterance!=='undefined';
const canSpeak=()=>NAT38()||WEB38();
// Google TTS voice codes by apparent gender (fallback: pitch only)
const VF38=['sfg','iob','iog','tpc','tpf','gba','gbc','gbg','fis','ahp','cxx','ena','aua','auc'],VM38=['iol','iom','tpd','gbb','gbd','rjs','end','aub','aud'];
const LOC38={UK:'en-gb',India:'en-in',Australia:'en-au',Ireland:'en-gb',Canada:'en-us',USA:'en-us'};
let T38={id:null,pid:null,n:0,on:false};
function voiceFor(p){const h=hashStr((p&&p.id||'x')+'voice');const F=p&&p.g==='F';const pitch=F?1.04+(h%18)/100:.80+(h%16)/100;const rate=.9+((h>>>6)%14)/100;let voice='';
 try{if(NAT38()&&window.HSNative.ttsReady()){const all=(window.HSNative.ttsVoices()||'').split(',').filter(Boolean);const codes=F?VF38:VM38;const loc=LOC38[p&&p.nat]||'en-us';
  let c=all.filter(n=>n.toLowerCase().startsWith(loc)&&codes.some(k=>n.toLowerCase().includes('-x-'+k)));if(!c.length)c=all.filter(n=>codes.some(k=>n.toLowerCase().includes('-x-'+k)));if(c.length)voice=c[h%c.length]}}catch(e){}
 return{voice,pitch:+pitch.toFixed(2),rate:+rate.toFixed(2),F}}
const plain38=s=>String(s||'').replace(/<[^>]+>/g,'').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
function pitchScript(P){const s=P.story;const who=person(P.who);const first=who?who.n.split(' ')[0]:'';const parts=[
 ['top',`Thanks for seeing me. It’s called ${P.sc.title}.`],['log',s.log],['a1',`Act one. ${s.a1}`],['a2',`Act two. ${s.a2}`],['a3',`Act three. ${s.a3}`]];
 if(P.role==='directors')parts.push(['vis',`Here’s how I see it. ${s.vis}`]);parts.push(['end',P.role==='directors'?`That’s my movie. I’d love to make it with you.`:`That’s the story. I think it’s the best thing I’ve written.`]);return parts.map(x=>[x[0],plain38(x[1])])}
function tts38stop(){try{if(NAT38())window.HSNative.ttsStop();else if(WEB38())window.speechSynthesis.cancel()}catch(e){}T38.on=false;T38.pid=null;tts38paint()}
function tts38on(id){try{const k=String(id).split(':')[1];document.querySelectorAll('#modal .sp36 [data-tk]').forEach(e=>e.classList.toggle('rd38',e.getAttribute('data-tk')===k))}catch(e){}}
function tts38done(id){if(String(id)===T38.last){T38.on=false;T38.pid=null;try{document.querySelectorAll('#modal .rd38').forEach(e=>e.classList.remove('rd38'))}catch(e){}tts38paint()}}
function tts38paint(){try{const b=document.querySelector('#modal .tt38b');if(!b)return;const P=(S.pitches||[]).find(x=>x.id===+b.getAttribute('data-p'));const who=P&&person(P.who);const nm=who?esc(who.n.split(' ')[0]):'them';b.innerHTML=T38.on&&T38.pid===(P&&P.id)?`⏹ Stop ${nm}`:`🔊 Hear ${nm} read it`;b.classList.toggle('on',!!(T38.on&&T38.pid===(P&&P.id)))}catch(e){}}
function readPitch(id){const P=(S.pitches||[]).find(x=>x.id===id);if(!P||!P.story)return;if(T38.on&&T38.pid===id)return tts38stop();if(!canSpeak())return toast('Voice is not available on this device');
 tts38stop();const v=voiceFor(person(P.who));const parts=pitchScript(P);T38.n++;const tag='p'+id+'n'+T38.n;T38.on=true;T38.pid=id;T38.last=tag+':'+parts[parts.length-1][0];
 if(NAT38()){parts.forEach((x,i)=>{try{window.HSNative.ttsSpeak(x[1],v.voice,v.pitch,v.rate,tag+':'+x[0],i===0)}catch(e){E38(e)}})}
 else{try{const syn=window.speechSynthesis;syn.cancel();const vs=syn.getVoices().filter(x=>/^en/i.test(x.lang));const pref=vs.filter(x=>v.F?/female|samantha|victoria|karen|moira|tessa|zira|susan|serena/i.test(x.name):/male|daniel|alex|fred|david|mark|george|rishi/i.test(x.name)&&!/female/i.test(x.name));const voice=(pref.length?pref:vs)[hashStr(P.who+'v')%Math.max(1,(pref.length?pref:vs).length)];
  parts.forEach(x=>{const u=new SpeechSynthesisUtterance(x[1]);if(voice)u.voice=voice;u.pitch=v.pitch;u.rate=v.rate;const uid=tag+':'+x[0];u.onstart=()=>tts38on(uid);u.onend=()=>tts38done(uid);u.onerror=()=>tts38done(uid);syn.speak(u)})}catch(e){E38(e)}}
 P.heard=1;tts38paint()}
// mark story sections so they light up while being read
storyPage=(function(o){return function(P){let h=o.apply(this,arguments);try{h=h.replace('<p class="sp36-log">','<p class="sp36-log" data-tk="log">');const tags=['a1','a2','a3'];let i=0;h=h.replace(/<h5>ACT (ONE|TWO|THREE)<\/h5><p>/g,m=>m.replace('<p>',`<p data-tk="${tags[i++]}">`));h=h.replace('<p class="sp36-q">','<p class="sp36-q" data-tk="vis">');h=h.replace('<div class="sp36-top">','<div class="sp36-top" data-tk="top">')}catch(e){E38(e)}return h}})(storyPage);
pitchView=(function(o){return function(id){o.apply(this,arguments);try{if(typeof document==='undefined'||!document.querySelector)return;const m=document.querySelector('#modal');const sum0=m&&m.querySelector('.sp36w>summary');if(!sum0||m.querySelector('.tt38b'))return;const P=(S.pitches||[]).find(x=>x.id===id);if(!P)return;
 if(canSpeak()&&PREFS.voice!==false){sum0.insertAdjacentHTML('afterend',`<button class="btn sm tt38b" data-p="${id}" onclick="event.preventDefault();readPitch(${id})"></button>`);tts38paint();
  if(!P.heard&&P.status==='new'&&!(T38.on&&T38.pid===id))setTimeout(()=>{try{if(document.querySelector(`#modal .tt38b[data-p="${id}"]`))readPitch(id)}catch(e){}},700)}}catch(e){E38(e)}}})(pitchView);
// stop reading when the pitch sheet closes
modal=(function(o){return function(html){const r=o.apply(this,arguments);try{if(T38.on&&typeof document!=='undefined'&&document.querySelector&&!document.querySelector('#modal .sp36'))tts38stop()}catch(e){}return r}})(modal);
try{if(typeof window!=='undefined'&&window.speechSynthesis&&window.speechSynthesis.getVoices)window.speechSynthesis.getVoices()}catch(e){}
settings=(function(o){return function(){o.apply(this,arguments);try{if(typeof document==='undefined'||!document.querySelector)return;const box=document.querySelector('#modal .modal>div .card');if(box&&!box.querySelector('.vc38s'))box.insertAdjacentHTML('beforeend',`<div class="row vc38s" style="margin-top:12px"><span>🔊 Directors read pitches aloud</span><button class="btn sm ${PREFS.voice===false?'ghost':'gold'}" style="margin:0" onclick="PREFS.voice=PREFS.voice===false;savePrefs10();if(PREFS.voice===false)tts38stop();settings()">${PREFS.voice===false?'Off':'On'}</button></div>`)}catch(e){E38(e)}}})(settings);
