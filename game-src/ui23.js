/* ===================== v17 — real music, real sound, painted backgrounds ===================== */
const MED='media/';

/* ---------- music: real tracks, crossfaded, era-aware ---------- */
const MUS={
 e70:['m70a','m70b'],e80:['m80a','m80b'],e90:['m90a','mpiano'],e00:['mpiano','m90a'],e10:['mpiano','m90a'],e20:['mpiano','m90a'],e30:['mpiano','m90a'],modern:['mpiano','m90a'],
 menu:['mpiano'],tension:['mtension'],awards:['mawards'],premiere:['mpremiere']};
const MP={a:null,b:null,cur:null,key:null,want:'hq',ok:true,started:false,i:{},fade:null,vol:.55};
function mpEl(){if(typeof Audio==='undefined')return null;const a=new Audio();a.preload='auto';a.volume=0;a.addEventListener('ended',mpNextInList);a.addEventListener('error',()=>{if(a===MP.cur&&!a._retry){MP.ok=false}});return a}
function mpList(k){if(k==='hq'||k==='home'){if(typeof isEraMode==='function'&&isEraMode())return MUS[eraOf().k]||MUS.modern;return MUS.modern}return MUS[k]||MUS.modern}
function mpPick(k){const L=mpList(k);const id=k==='hq'?(isEraMode&&isEraMode()?eraOf().k:'modern'):k;MP.i[id]=(MP.i[id]==null?0:MP.i[id]);return L[MP.i[id]%L.length]}
function mpPlay(k,force){if(!PREFS.music||!MP.ok)return;if(!MP.a){MP.a=mpEl();MP.b=mpEl();if(!MP.a)return}const file=mpPick(k);if(!force&&MP.key===k&&MP.cur&&MP.cur._f===file&&!MP.cur.paused)return;
 const next=MP.cur===MP.a?MP.b:MP.a,prev=MP.cur;next._f=file;next.src=MED+file+'.mp3';next.loop=(k==='menu');next.currentTime=0;next.volume=0;
 const p=next.play();if(p&&p.catch)p.catch(()=>{});MP.cur=next;MP.key=k;MP.started=true;clearInterval(MP.fade);const t0=Date.now(),D=1400,pv=prev?prev.volume:0;
 MP.fade=setInterval(()=>{const x=Math.min(1,(Date.now()-t0)/D);next.volume=MP.vol*x;if(prev&&prev!==next){prev.volume=pv*(1-x);if(x>=1)prev.pause()}if(x>=1)clearInterval(MP.fade)},50)}
function mpNextInList(){const k=MP.key||'hq';const id=k==='hq'?(isEraMode&&isEraMode()?eraOf().k:'modern'):k;MP.i[id]=(MP.i[id]||0)+1;if(k==='premiere'||k==='awards'||k==='tension')return mpPlay('hq',true);mpPlay(k,true)}
musicTrack=function(k){MWANT=k;if(k==='awards'&&window._premMusic){window._premMusic=0;k='premiere'}MP.want=k;if(MP.started&&MP.ok)mpPlay(k)};
musicStart=(function(o){return function(){if(!PREFS.music)return;if(MP.ok){if(!MP.started||!MP.cur||MP.cur.paused)mpPlay(MP.want||'hq',true);return}return o()}})(musicStart);
musicStop=(function(o){return function(){try{if(MP.a)MP.a.pause();if(MP.b)MP.b.pause()}catch(e){}MP.started=false;return o()}})(musicStop);
if(typeof document!=='undefined'&&document.addEventListener)document.addEventListener('visibilitychange',()=>{try{if(document.hidden){if(MP.cur)MP.cur.pause()}else if(PREFS.music&&MP.started&&MP.cur){const p=MP.cur.play();if(p&&p.catch)p.catch(()=>{})}}catch(e){}});
// era change switches the theme
const _es17=eraScreen;eraScreen=function(e,n){window._eraMusic=1;_es17(e,n)};
premiereScene=(function(o){return function(f){window._premMusic=1;return o(f)}})(premiereScene);

/* ---------- sound effects: recorded where it matters ---------- */
const SFXF={cash:'scash',win:'stada',fanfare:'sapplause',victory:'sapplause',ring:()=>S&&S.year<2000?'sring':pick(['sring','sring2']),drum:'sdrumroll',shutter:()=>S&&S.year<1995?'sshutter_old':'sburst',snap:'sshutter',applause:'sapplause',clap:'sapplause_small',projector:'sprojector'};
const SFXP={};let SFXOK=true;
function sfxFile(k){let f=SFXF[k];if(typeof f==='function')f=f();if(!f||!SFXOK||typeof Audio==='undefined')return false;try{const a=SFXP[f]&&SFXP[f].paused?SFXP[f]:new Audio(MED+f+'.mp3');SFXP[f]=a;a.currentTime=0;a.volume=k==='ring'?.7:k==='fanfare'||k==='applause'?.55:.8;const p=a.play();if(p&&p.catch)p.catch(()=>{});a.onerror=()=>{SFXOK=false};return true}catch(e){return false}}
const _sfx17=sfx;sfx=function(k){if(PREFS.sfx&&SFXF[k]&&sfxFile(k)){try{if(k==='cash'||k==='win')hap('confirm');if(k==='ring')hap('long')}catch(e){}return}return _sfx17(k)};

/* ---------- painted backgrounds ---------- */
function bgImg(n,extra){return `<img class="pbgimg" src="${MED}bg_${n}.jpg" alt="" ${extra||''}>`}
function officeBg(tag){tag=String(tag||'');if(/Morning/.test(tag))return 'office_morning';if(/Marketing/.test(tag))return 'office_warm';if(/visitor/i.test(tag))return 'office_day';if(/lot/i.test(tag))return 'office_day';const w=(S&&S.wk)||0;return ['office_morning','office_day','office_warm','office_night'][w%4]}
function sceneBgName(k,tag){if(k==='set')return /Western/i.test(String(tag))?'western':'set';if(k==='screen')return 'screening';if(k==='call')return /Text/.test(String(tag))?'city_night':'office_night';if(k==='street')return S&&S.year<1990?'marquee':'city_night';return officeBg(tag)}
let _scTag='';const _ps17=playScene;playScene=function(sc,next){_scTag=(sc&&sc.tag)||'';try{if(sc&&sc.bg==='set'&&/On set · (.+)/.test(_scTag)){const t=RegExp.$1;const p=S.projects.find(x=>x.title===t.replace(/&amp;/g,'&'));if(p&&p.genre==='Western')_scTag+=' Western'}if(sc&&sc.bg==='set'&&MP.started)musicTrack('tension');if(sc&&sc.bg==='street')setTimeout(()=>sfx('shutter'),350);if(sc&&sc.bg==='screen')setTimeout(()=>sfx('projector'),200);if(sc&&/Text message/.test(_scTag)&&S.year<2008)_scTag='Phone call'}catch(e){}return _ps17(sc,next)};
scnBG=function(k){return bgImg(sceneBgName(k,_scTag))};
// pitch room: the meeting painting
pitchScene=(function(o){return function(P){return o(P).replace(/<svg viewBox="0 0 360 150" class="pbg"[\s\S]*?<\/svg>/,bgImg('meeting','style="display:block;width:100%;height:190px;object-fit:cover"'))}})(pitchScene);
// premiere: red carpet / theatre marquee behind the cut scene
cutScene=(function(o){return function(html,next,ms){if(window._premMusic||/premiere/i.test(String(html).slice(0,400))){const n=S&&S.year<1990?'marquee':pick(['redcarpet','cinema_deco']);html=`<div class="cutbg" style="background-image:url(${MED}bg_${n}.jpg)"></div>`+html;setTimeout(()=>{sfx('shutter')},700)}return o(html,next,ms)}})(cutScene);
// era screens get a painted backdrop
const ERA_BG={e70:'marquee',e80:'cinema_deco',e90:'screening',e00:'redcarpet',e10:'city_night',e20:'skyline',e30:'skyline'};
eraScreen=(function(o){return function(e,n){o(e,n);try{const el=document.getElementById('eras');if(el)el.insertAdjacentHTML('afterbegin',`<div class="erabg" style="background-image:url(${MED}bg_${ERA_BG[e.k]||'skyline'}.jpg)"></div>`);if(window._eraMusic){window._eraMusic=0;setTimeout(()=>{if(MP.started)mpPlay('hq',true)},2500)}}catch(x){}}})(eraScreen);
// opening weekend: drumroll before the number
releaseScreen=(function(o){return function(f){try{if(f&&f.dist!=='stream'&&f.dist!=='sell'&&!f._drum){f._drum=1;sfx('drum')}}catch(e){}return o(f)}})(releaseScreen);
// studio report: projector whirr
studioReport=(function(o){return function(id){try{sfx('projector')}catch(e){}return o(id)}})(studioReport);
// title + home hero
title=(function(o){return function(){o();try{const m=document.querySelector('#app .hero13');if(m&&!m.querySelector('.herobg'))m.insertAdjacentHTML('afterbegin',`<div class="herobg" style="background-image:url(${MED}bg_skyline.jpg)"></div>`)}catch(e){}}})(title);
render=(function(o){return function(){o();try{const w=document.querySelector('#app .wk2');if(w&&!w.querySelector('.wk2bg')){const e=isEraMode()?eraOf().k:'e20';w.insertAdjacentHTML('afterbegin',`<div class="wk2bg" style="background-image:url(${MED}bg_${ERA_BG[e]||'skyline'}.jpg)"></div>`)}}catch(e){}}})(render);
// warm the cache for the first scenes
if(typeof Image!=='undefined')setTimeout(()=>{['skyline','office_morning','office_day','set'].forEach(n=>{const i=new Image();i.src=MED+'bg_'+n+'.jpg'})},1500);
