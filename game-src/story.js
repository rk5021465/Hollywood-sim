"use strict";
// Personalities, recurring characters, special weddings and story chains.
const PERS={
 proud:{name:'Proud',desc:'Takes offence easily',neg:1.35},
 easygoing:{name:'Easygoing',desc:'Forgives small mistakes',neg:.7},
 showoff:{name:'Show-off',desc:'Expects more grandeur',expect:1},
 thrifty:{name:'Thrifty',desc:'Pays less, tips more when happy',fee:.88,tip:1.6},
 traditional:{name:'Traditional',desc:'Cares most about the rituals',late:1.3,ritual:1},
 superstitious:{name:'Superstitious',desc:'A late muhurat is a disaster',late:1.8}
};
const SPECIALS={
 rushed:{name:'Rushed wedding',desc:'Only one month to plan. Pays 40% more.',fee:1.4,w:3},
 double:{name:'Double wedding',desc:'Two couples at once. More guests, more demands, nearly double pay.',fee:1.8,guests:1.6,w:2},
 secret:{name:'Secret wedding',desc:'A small, quiet wedding. Pays well, but word must not get out.',fee:1.6,w:2},
 feud:{name:'Feuding families',desc:'The two families have an old quarrel. Expect trouble.',fee:1.3,w:2}
};
const CAST={bua:{name:'Chanda Bua',art:'aunt',title:'the aunt who attends every wedding in Jaipur'},bhanwar:{name:'Bhanwar Singh',art:'uncle',title:'the loudest uncle in Jaipur'},gopal:{name:'Gopal Sethia',art:'rival',title:'head of the Sethia wedding house'}};
const SPECIAL_EVENTS=[
 {id:'leak',ph:1,sp:'secret',t:'A neighbour is peeking over the wall. If word of this secret wedding gets out, the families will be shamed.',ch:[{l:'Invite him in and swear him to secrecy',c:20,b:4,g:4},{l:'Hang extra curtains at once',c:30,t:15},{l:'Ignore him',b:-12,g:-12,r:-4}]},
 {id:'feud1',ph:1,sp:'feud',t:'The two families refuse to sit on the same side of the courtyard.',ch:[{l:'Seat them across from each other with honour',t:10,b:3,g:3},{l:'Mix the seating to make them talk',b:-6,g:-6,r:2},{l:'Ask the elders to make peace first',t:40,b:6,g:6}]},
 {id:'feud2',ph:2,sp:'feud',t:'An old insult is repeated over the feast. Both fathers stand up.',ch:[{l:'Step between them with a toast to the couple',b:4,g:4},{l:'Bring out the best sweets to calm everyone',c:35,b:5,g:5},{l:'Let them argue',b:-14,g:-14}]},
 {id:'double1',ph:3,sp:'double',t:'The two brides both want the first blessing from the priest.',ch:[{l:'Let the elder sister go first',g:2,b:-2},{l:'Have the priest bless them together',t:10,b:5,g:3}]},
 {id:'rushed1',ph:0,sp:'rushed',t:'In the rush, half the flowers were never delivered.',ch:[{l:'Buy every flower left in the bazaar',c:45,t:20},{l:'Make do with what you have',b:-8,g:-4}]}
];
EVENTS.push(...SPECIAL_EVENTS.map(e=>Object.assign({},e,{when:c=>c.special===e.sp})));
const EVCHAR_EXTRA={leak:['bfather','Close the doors! Quickly!'],feud1:['gfather','We will not sit with THEM.'],feud2:['gfather','Say that again, if you dare!'],double1:['bride','I should be first!'],rushed1:['cook','The flower seller never came!']};

function storyInit(){if(!S.story)S.story={rival:{step:0,next:6,hostile:false},bua:0,bhanwar:0,royal:{step:0,next:0},patron:0,blocked:{},log:[]}}
function addClientFlavour(c){const keys=Object.keys(PERS);c.bride.pers=pick(keys);c.groom.pers=pick(keys);
 const tier=fameTier();if(R()<.14+tier*.03){const sp=wpick(Object.keys(SPECIALS),k=>SPECIALS[k].w);c.special=sp;const X=SPECIALS[sp];c.fee=Math.round(c.fee*X.fee/10)*10;if(X.guests)c.guests=Math.round(c.guests*X.guests/10)*10;
  if(sp==='rushed'){c.wm=nowMi()+1;if(TRADITIONS[c.trad].muhurat)while(SEASON[miM(c.wm)]===0)c.wm++}if(sp==='secret'){c.guests=Math.max(30,Math.round(c.guests*.3/10)*10);c.dem.bride=c.dem.bride.filter(d=>d!=='fireworks');c.dem.groom=c.dem.groom.filter(d=>d!=='fireworks');if(!c.dem.bride.includes('quiet'))c.dem.bride.push('quiet')}}
 for(const s of ['bride','groom'])if(PERS[c[s].pers].fee)c.fee=Math.round(c.fee*PERS[c[s].pers].fee/10)*10;
 if(S.story&&S.story.patron>0&&R()<.3)c.referral=true;
 return c}
// story events shown at the start of a month
function storyTick(){storyInit();const st=S.story,now=nowMi(),out=[];const T=fameTier();
 for(const k in st.blocked)if(st.blocked[k]<=now)delete st.blocked[k];
 if(st.patron>0)st.patron--;
 const r=st.rival;if(r.step<5&&now>=r.next&&S.rep>=25){
  if(r.step===0)out.push('rival1');else if(r.hostile&&r.step===1)out.push('rival2');else if(r.hostile&&r.step===2)out.push('rival3');else if(r.hostile&&r.step===3&&T>=2)out.push('rival4')}
 if(st.bua>=3&&!st.buaDone){out.push('bua_good')}else if(st.bua<=-3&&!st.buaBad){out.push('bua_bad')}
 if(st.bhanwar>=3&&!st.bhDone)out.push('bh_good');
 const k=st.royal;if(k.step===0&&T>=3&&S.year>=1740&&R()<.25)out.push('royal1');else if(k.step===1&&now>=k.next)out.push('royal2');
 return out.slice(0,1)}
const STORY={
 rival1:{who:'gopal',title:'A visit from Gopal Sethia',q:'Jaipur is big enough for both of us… if you leave the noble families to me.',t:'Your rival arrives at your office with a box of sweets and a smile that does not reach his eyes.',ch:[
  {l:'Agree to stay away from nobles',res:'Sethia leaves you alone, but noble families will hear less of you for two years.',fx:s=>{s.story.rival.step=5;S.fx.nobleShy=24}},
  {l:'Refuse politely',res:'Gopal Sethia bows stiffly and leaves. You have made an enemy.',fx:s=>{s.story.rival.step=1;s.story.rival.hostile=true;s.story.rival.next=nowMi()+ri(4,9)}},
  {l:'Laugh and send him away',res:'Word spreads that you laughed at Sethia. The bazaar loves it, but he will not forget.',fx:s=>{s.rep+=3;s.story.rival.step=1;s.story.rival.hostile=true;s.story.rival.next=nowMi()+ri(3,7)}}]},
 rival2:{who:'cook',title:'Sethia is poaching your cook',q:'He offered me double wages. I have a family to feed…',t:'Your favourite cook comes to you, twisting his cloth in his hands.',ch:[
  {l:'Match Sethia\'s offer',c:150,res:'Your cook stays, and he is more loyal than ever.',fx:s=>{['f3','f2','f1'].forEach(v=>s.vrel[v]=(s.vrel[v]||0)+3);adv(s)}},
  {l:'Remind him of his loyalty',res:null,fx:s=>{if(R()<.5){s.story.lastRes='He bows his head and stays.';}else{s.story.blocked.f3=nowMi()+12;s.story.lastRes='He leaves for Sethia. Ustad Karim will not cook for you for a year.'}adv(s)}},
  {l:'Let him go',res:'Ustad Karim joins the Sethia house. He will not cook for you for a year.',fx:s=>{s.story.blocked.f3=nowMi()+12;adv(s)}}]},
 rival3:{who:'aunt',title:'A rumour in the bazaar',q:'They say the food at your last wedding made half the guests ill!',t:'Chanda Bua hurries in with the latest gossip. Someone is spreading lies about your house.',ch:[
  {l:'Host a free tasting for the bazaar',c:200,res:'Hundreds taste your food. The rumour dies, and your name shines.',fx:s=>{s.rep+=6;adv(s)}},
  {l:'Pay a poet to sing your praises',c:120,res:'The poet\'s verses spread through the lanes. Most people forget the rumour.',fx:s=>{s.rep+=2;adv(s)}},
  {l:'Ignore it',res:'The rumour lingers. Some families stop writing to you.',fx:s=>{s.rep=Math.max(0,s.rep-8);adv(s)}}]},
 rival4:{who:'gopal',title:'Proof against Sethia',q:'You would not dare…',t:'A palace clerk confesses: Gopal Sethia has been paying him to steer royal contracts his way. You hold the letters.',ch:[
  {l:'Expose him at court',res:'The court is scandalised. The Sethia house loses half its standing.',fx:s=>{s.rep+=15;s.rival.rep*=.5;s.story.rival.step=5}},
  {l:'Make him a silent partner',res:'Sethia pays you ₹60 a month to keep quiet, and stops working against you.',fx:s=>{s.story.rival.step=5;s.story.partner=1}},
  {l:'Burn the letters',res:'You choose mercy. Some say it was wise, others call it weak.',fx:s=>{s.rep+=2;s.story.rival.step=5}}]},
 bua_good:{who:'bua',title:'Tea with Chanda Bua',q:'You did well, child. I shall tell all my friends.',t:'The most talked-about aunt in Jaipur invites you for tea. Her approval opens doors.',ch:[{l:'Thank her warmly',res:'For a year, more families come to you on Chanda Bua\'s word.',fx:s=>{s.story.buaDone=1;s.story.patron=12;s.rep+=5}}]},
 bua_bad:{who:'bua',title:'Chanda Bua is displeased',q:'A disgrace! I will tell everyone.',t:'You have upset Chanda Bua at one too many weddings. She is telling the whole bazaar.',ch:[{l:'Send her a gift of silk',c:80,res:'She accepts the silk with a sniff. The talk fades.',fx:s=>{s.story.buaBad=1;s.story.bua=0}},{l:'Let her talk',res:'Her tongue costs you dearly.',fx:s=>{s.story.buaBad=1;s.rep=Math.max(0,s.rep-8)}}]},
 bh_good:{who:'bhanwar',title:'Bhanwar Singh vouches for you',q:'This house knows how to treat a man with respect!',t:'The loudest uncle in Jaipur has decided he likes you, and he tells everyone.',ch:[{l:'Invite him to sit at the front at every wedding',res:'Bhanwar Singh roars your praises. Your fame grows.',fx:s=>{s.story.bhDone=1;s.rep+=6}}]},
 royal1:{who:'gfather',title:'A message from the palace',q:'The Maharaja\'s daughter will marry next season. Houses may present their proposals.',t:'A royal steward stands at your door. This could make your house a legend.',ch:[{l:'Prepare a grand proposal',c:500,res:'Your proposal is delivered to the palace. The steward will return with questions.',fx:s=>{s.story.royal.step=1;s.story.royal.next=nowMi()+2}},{l:'Decline. We are not ready.',res:'Perhaps another time.',fx:s=>{s.story.royal.step=9}}]},
 royal2:{who:'gfather',title:'The palace steward returns',q:'His Highness asks: what is your vision for the princess?',t:'The steward will carry your answer to the Maharaja. Choose your vision.',ch:[
  {l:'A palace of a thousand lamps',res:null,fx:s=>royalWin(s,'lamps')},{l:'A garden in full bloom',res:null,fx:s=>royalWin(s,'garden')},{l:'Desert splendour under the stars',res:null,fx:s=>royalWin(s,'desert')}]}
};
function adv(s){s.story.rival.step++;s.story.rival.next=nowMi()+ri(4,10)}
function royalWin(s,vision){s.story.royal.step=9;const chance=Math.min(.85,.35+(S.rep-S.rival.rep)/800+(fameTier()>=4?.2:0));
 if(R()<chance){const c=genClient();c.cls='royal';c.trad='rajput';c.guests=1600;c.fee=9000;c.special=null;c.royalPrincess=true;c.bride.name='Princess '+pick(FEM);c.bride.surname='Kachhwaha';c.bride.father='Maharaja of Jaipur';c.wm=nowMi()+3;while(SEASON[miM(c.wm)]===0)c.wm++;c.dem.bride=['palace','gold'];c.dem.groom=['elephant','fireworks'];c.exp=nowMi()+2;S.inquiries.unshift(c);
  s.story.lastRes='The Maharaja chose YOUR house! The royal wedding enquiry is waiting in your bookings. Accept it, and make history.';s.rep+=10}
 else{s.story.lastRes='The Maharaja chose the '+S.rival.name+'. They will dine on this triumph for years.';S.rival.rep+=40}}
function applyStory(id,ci){const ev=STORY[id],c=ev.ch[ci];if(c.c){S.money-=c.c}S.story.lastRes=c.res;c.fx(S);const res=S.story.lastRes;S.story.log.unshift({i:nowMi(),t:ev.title+': '+res});addLog(ev.title+'. '+res);save();return res}
// recurring cast reacts to how aunt/uncle events went
function castReact(e,res){storyInit();const ch=(EVCHAR[e.id]||[])[0];const d=(res.b||0)+(res.g||0);if(ch==='aunt')S.story.bua+=d>0?1:d<0?-1:0;if(ch==='uncle')S.story.bhanwar+=d>0?1:d<0?-1:0}
