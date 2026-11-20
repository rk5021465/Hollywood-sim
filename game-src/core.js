/* ===================== CORE ===================== */
const $=s=>document.querySelector(s);
const R=(a,b)=>a+Math.random()*(b-a);
const RI=(a,b)=>Math.floor(R(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>a.slice().sort(()=>Math.random()-.5);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=Math.random();return (u-3)/0.7071};
const M=v=>{v=+v||0;const s=v<0?'-':'';v=Math.abs(v);return s+(v>=1000?'$'+(v/1000).toFixed(2)+'B':v>=100?'$'+v.toFixed(0)+'M':v>=.95||v===0?'$'+v.toFixed(1)+'M':v>=.1?'$'+v.toFixed(2)+'M':'$'+Math.round(v*1000)+'K')};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=v=>Math.round(v*100)+'%';
const sum=(a,f)=>a.reduce((s,x)=>s+(f?f(x):x),0);
const fmtN=v=>v>=1000?(v/1000).toFixed(1)+'B':v>=1?v.toFixed(1)+'M':Math.round(v*1000)+'K';

let S=null;
const KEY='hss_save_v3';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const s=localStorage.getItem(KEY);return s?JSON.parse(s):null}catch(e){return null}}
function wipe(){try{localStorage.removeItem(KEY)}catch(e){}}

const tNow=()=>(S.year-START_YEAR)*12+S.month;
function tLabel(t){return MON[((t%12)+12)%12]+' '+(START_YEAR+Math.floor(t/12))}
const yearOf=t=>START_YEAR+Math.floor(t/12);
const inf=t=>{const y=yearOf(t==null?tNow():t);return y>=2000?Math.pow(1+INFL,y-2025):Math.pow(1+INFL,-25)*Math.pow(1.045,y-2000)};
const I=()=>inf(tNow());
const creditLimit=()=>Math.round((100+S.rep*3+(S.stock.public?S.stock.price*20:0))*I());
const ev=k=>S.ev[k]&&S.ev[k].until>=tNow()?S.ev[k]:null;

/* ---------- People ---------- */
function nameGen(taken,g){let x,i=0;do{x=pick(g==='F'?FIRST_F:g==='M'?FIRST_M:Math.random()<.5?FIRST_F:FIRST_M)+' '+pick(LAST)}while(taken.has(x)&&i++<300);taken.add(x);return x}
function takenNames(){const s=new Set();if(S&&S.people)Object.values(S.people).forEach(l=>l.forEach(p=>s.add(p.n)));return s}
function mkActor(taken,young,g){g=g||(Math.random()<.5?'F':'M');const star=young?RI(5,40):RI(8,97);
 const nat=pickNat();return{id:'a'+Math.random().toString(36).slice(2,8),n:nameGen(taken,g),g,star,skill:clamp(RI(30,95)+(star>80?4:0),20,99),spec:pick(GENRES),age:young?RI(19,27):RI(22,66),busy:-1,hits:0,loyal:0,nat:nat[0],skinH:RI(nat[4][0],nat[4][1]),traits:rollTraits(true)}}
function mkCrew(taken,role){const fame=RI(8,95);const nat=pickNat();const g=Math.random()<.42?'F':'M';return{id:role[0]+Math.random().toString(36).slice(2,8),n:nameGen(taken,g),g,fame,skill:clamp(RI(35,96),20,99),spec:pick(GENRES),age:RI(28,72),busy:-1,hits:0,nat:nat[0],skinH:RI(nat[4][0],nat[4][1]),traits:rollTraits(false)}}
function genPeople(){const tk=new Set();const P={actors:[],directors:[],writers:[],composers:[],dps:[]};
 for(let i=0;i<40;i++)P.actors.push(mkActor(tk,false,i%2?'F':'M'));
 for(let i=0;i<14;i++)P.directors.push(mkCrew(tk,'d'));
 for(let i=0;i<14;i++)P.writers.push(mkCrew(tk,'w'));
 for(let i=0;i<9;i++)P.composers.push(mkCrew(tk,'c'));
 for(let i=0;i<9;i++)P.dps.push(mkCrew(tk,'p'));
 return P}
const ROLE_LBL={actors:'Actors',directors:'Directors',writers:'Writers',composers:'Composers',dps:'Cinematographers'};
function person(id){if(!S||!id)return null;if(id==='ceo')return S.ceo;for(const k in S.people){const p=S.people[k].find(x=>x.id===id);if(p)return p}return null}
const pname=id=>{const p=person(id);return p?p.n:'—'};
const feeMult=()=>(S.ev.feeMult||1)*I()*(typeof bigTax==='function'?bigTax():1);
const tFee=p=>(hasT(p,'diva')?1.25:1)*(hasT(p,'generous')?.85:1);
const actorFee=a=>+((0.3+Math.pow(a.star/100,2.3)*22)*feeMult()*tFee(a)).toFixed(1);
const crewFee=(c,role)=>+(({directors:.4,writers:.2,composers:.15,dps:.15}[role])+Math.pow(c.fame/100,2)*({directors:11,writers:4,composers:2.5,dps:2.5}[role]))*feeMult()*tFee(c);
const busy=x=>x.busy>=tNow();
const lockA=a=>typeof availA==='function'?!availA(a).ok:a.star>S.rep+42;
const lockC=c=>typeof availC==='function'?!availC(c).ok:c.fame>S.rep+48;

/* ---------- State ---------- */
function newGame(o){
 o=typeof o==='string'?{name:o}:(o||{});const name=o.name;
 S={v:3,name:name||'Silver Screen Pictures',logo:o.logo||null,ceo:o.ceo||null,diff:o.diff||'medium',cash:o.cash||250,rep:22,year:START_YEAR,month:0,id:1,
  people:genPeople(),projects:[],films:[],series:[],shows:[],
  rivals:RIVALS0.map(r=>Object.assign({alive:true,films:0,dom:0},r)),rivalFilms:[],
  streaming:null,franchises:[],theaters:[],park:null,lands:[],
  stock:{public:false,price:0,ipo:0,low:0,hist:[]},lot:{stage:1,tvstage:1},
  ev:{feeMult:1,attend:1,china:0,usRebate:0,ai:null,plf:1},
  news:[],social:[],receivables:[],market:{},awards:{film:0,tv:0,fest:0},
  scripts:null,scriptsT:-1,pitches:null,pitchesT:-1,sundance:null,decisions:[],over:false,log:{}};
 for(let t=0;t<14;t++)genRivals(t);
 addNews(`🎬 ${esc(S.name)} opens its gates on the lot. The trades give it a year.`);
 addNews(`📰 Industry check: US box office was ~$8.9B in 2025, still below pre-pandemic levels; studios are lengthening theatrical windows again.`);
 save();
}
function addNews(s){S.news.unshift({t:tNow(),s});S.news=S.news.slice(0,60)}
function post(handle,text,likes){S.social.unshift({t:tNow(),h:handle||pick(HANDLES),s:text,l:likes||RI(200,90000)});S.social=S.social.slice(0,40)}

/* ---------- Rivals ---------- */
function genTitle(g){const p=T[g];let b=pick(p[1]);if(b==='__N')b=pick(LAST);return pick(p[0])+' '+b}
function genRivals(t){
 const alive=S.rivals.filter(r=>r.alive);if(!alive.length)return;
 const n=RI(2,4);
 for(let i=0;i<n;i++){const st=pick(alive);const g=pick(GENRES);
  const ld=rivPick('actors'),dr=rivPick('directors'),co=rivPick('actors');S.rivalFilms.push({t,wk:RI(0,3),lead:ld,co:co!==ld?co:null,dir:dr,studio:st.n,g,title:genTitle(g),hype:Math.round(clamp(R(15,95)*st.p*(GEN[g].base>1?1.15:1)*(1+S.rep/250),10,140))});}
}
const rivalsAt=t=>S.rivalFilms.filter(r=>r.t===t);
const compFactor=t=>{const s=sum(rivalsAt(t),r=>r.str?0:r.lim?r.hype*.2:r.hype)+S.projects.filter(p=>p.releaseT===t&&p.dist!=='stream').length*50;return (1+150/400)/(1+s/400)};
