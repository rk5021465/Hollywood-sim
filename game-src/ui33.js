// v21.7 — Hindi removed; tutorial disabled
try{if(typeof PREFS!=='undefined'&&PREFS.lang){delete PREFS.lang;savePrefs()}}catch(e){}
try{firstTip=function(){}}catch(e){}
finishSetup=(function(o){return function(){window._fsT=Date.now();const r=o.apply(this,arguments);try{if(S){S.tut=1;save()}setTimeout(()=>{try{const m=document.getElementById('modal');if(m&&m.querySelector('.guide'))modal()}catch(e){}},450)}catch(e){}return r}})(finishSetup);
try{guide=(function(o){return function(i){if(i===0&&Date.now()-(window._fsT||0)<3000)return modal();return o(i)}})(guide)}catch(e){}
