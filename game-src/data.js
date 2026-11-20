/* ===================== DATA (grounded in real industry figures) ===================== */
let START_YEAR=2026, END_YEAR=2050;
const INFL=0.025;                     // ~2.5%/yr cost & ticket growth (avg US ticket $11.31 in 2025)
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CAL=[
 {tag:'Post-holiday lull · Sundance Film Festival',mult:.7,g:{Horror:1.15,Thriller:1.1}},
 {tag:"Super Bowl · Valentine's Day",mult:.85,g:{Romance:1.5,Comedy:1.1,Superhero:1.1}},
 {tag:'Spring break · Golden Statue Awards',mult:.95,g:{Animation:1.2,Comedy:1.1}},
 {tag:'Easter · CinemaCon',mult:.95,g:{Animation:1.15,Action:1.1}},
 {tag:'Memorial Day · Cannes Film Festival',mult:1.2,g:{Superhero:1.3,Action:1.2,'Sci-Fi':1.15}},
 {tag:'Summer blockbuster season',mult:1.25,g:{Animation:1.3,Action:1.2,Superhero:1.2}},
 {tag:'July 4th holiday',mult:1.3,g:{Superhero:1.25,Action:1.2,Animation:1.2,'Sci-Fi':1.2}},
 {tag:'Late summer',mult:.95,g:{Comedy:1.15,Horror:1.15}},
 {tag:'Venice & Toronto festivals · Golden Screen Awards',mult:.8,g:{Horror:1.3,Drama:1.15,Biopic:1.15}},
 {tag:'Halloween',mult:.9,g:{Horror:1.6,Thriller:1.15}},
 {tag:'Thanksgiving · awards campaigns',mult:1.15,g:{Animation:1.35,Drama:1.2,Biopic:1.2}},
 {tag:'Christmas · awards season',mult:1.25,g:{'Sci-Fi':1.2,Animation:1.2,Drama:1.3,Biopic:1.3,Romance:1.1}},
];
// intl = international gross as multiple of domestic; drop = weekly decline; budget = typical prod budget ($M, 2025)
const GEN={
 Action:{icon:'💥',c:'#7a2a16',base:1.0,intl:1.6,vfx:.7,award:.2,crowd:6,drop:.52,budget:120,rating:'PG-13',days:80,merch:.3},
 Superhero:{icon:'🦸',c:'#1d3b7a',base:1.75,intl:1.5,vfx:1,award:.08,crowd:8,drop:.58,budget:200,rating:'PG-13',days:100,merch:.9},
 Comedy:{icon:'😂',c:'#7a6a16',base:.75,intl:.5,vfx:.1,award:.25,crowd:5,drop:.42,budget:35,rating:'R',days:40,merch:.08},
 Drama:{icon:'🎭',c:'#4a2a5a',base:.45,intl:.9,vfx:.05,award:1,crowd:-4,drop:.33,budget:25,rating:'R',days:35,merch:.02},
 Horror:{icon:'👻',c:'#2a2a2a',base:.82,intl:1.0,vfx:.15,award:.12,crowd:-6,drop:.6,budget:15,rating:'R',days:30,merch:.15},
 'Sci-Fi':{icon:'🚀',c:'#0f4a4a',base:1.2,intl:1.5,vfx:.9,award:.45,crowd:2,drop:.5,budget:150,rating:'PG-13',days:85,merch:.6},
 Animation:{icon:'🎨',c:'#1f6a3a',base:1.0,intl:1.5,vfx:.8,award:.4,crowd:10,drop:.39,budget:110,rating:'PG',days:0,merch:1},
 Romance:{icon:'💘',c:'#7a1f45',base:.52,intl:1.0,vfx:.05,award:.35,crowd:3,drop:.42,budget:25,rating:'PG-13',days:38,merch:.03},
 Thriller:{icon:'🔪',c:'#2a3340',base:.64,intl:1.1,vfx:.25,award:.5,crowd:0,drop:.46,budget:35,rating:'R',days:45,merch:.03},
 Biopic:{icon:'🎤',c:'#6a4a16',base:.5,intl:1.0,vfx:.1,award:.9,crowd:4,drop:.36,budget:45,rating:'PG-13',days:50,merch:.05},
};
const GENRES=Object.keys(GEN);
const RATINGS=['G','PG','PG-13','R'];
function ratingMult(g,r){
 const t={G:{Animation:1,_:.72},PG:{Animation:1.05,Comedy:.95,Action:.95,Superhero:.95,'Sci-Fi':.95,Horror:.6,Drama:.9,Thriller:.75,_:.95},
  'PG-13':{Superhero:1.05,Action:1.05,'Sci-Fi':1.05,Horror:.92,Animation:.85,_:1},
  R:{Horror:1.05,Thriller:1,Comedy:1,Drama:1,Biopic:.95,Action:.85,Superhero:.72,'Sci-Fi':.85,Animation:.4,Romance:.9,_:1}}[r];
 return t[g]!=null?t[g]:t._;
}
// Departments: how each genre ideally splits its below-the-line money
const DEPTS=[['sets','Sets & locations','🏗️'],['vfx','Visual effects','✨'],['stunts','Stunts & action','🤸'],['music','Music & sound','🎼']];
const NEEDS={Action:{sets:.25,vfx:.3,stunts:.35,music:.1},Superhero:{sets:.2,vfx:.5,stunts:.2,music:.1},Comedy:{sets:.5,vfx:.1,stunts:.1,music:.3},
 Drama:{sets:.5,vfx:.05,stunts:.05,music:.4},Horror:{sets:.4,vfx:.25,stunts:.1,music:.25},'Sci-Fi':{sets:.25,vfx:.55,stunts:.1,music:.1},
 Animation:{sets:.1,vfx:.7,stunts:0,music:.2},Romance:{sets:.5,vfx:.05,stunts:.05,music:.4},Thriller:{sets:.4,vfx:.15,stunts:.2,music:.25},Biopic:{sets:.5,vfx:.1,stunts:.05,music:.35}};
// Shooting locations — rebates reflect real 2025-26 incentive levels (approx.)
const LOCS=[
 {k:'Los Angeles',f:'🇺🇸',rebate:.35,cost:1.15,look:{Comedy:3,Drama:2,Romance:2,Biopic:2},note:'California raised its credit to 35% in 2025'},
 {k:'Atlanta',f:'🇺🇸',rebate:.30,cost:1.0,look:{Action:3,Superhero:3,Horror:2},note:"Georgia's uncapped 30% credit made it a top hub"},
 {k:'New York',f:'🇺🇸',rebate:.30,cost:1.2,look:{Drama:4,Romance:3,Thriller:3,Comedy:2},note:'30% credit; iconic streets'},
 {k:'London',f:'🇬🇧',rebate:.255,cost:1.05,look:{Biopic:4,Drama:3,'Sci-Fi':2,Action:2},note:'UK expenditure credit (~25.5% net); world-class stages',foreign:1},
 {k:'Vancouver',f:'🇨🇦',rebate:.28,cost:.95,look:{'Sci-Fi':3,Horror:3,Thriller:2},note:'BC labour credit; "Hollywood North"',foreign:1},
 {k:'New Zealand',f:'🇳🇿',rebate:.25,cost:1.0,look:{'Sci-Fi':4,Action:3,Superhero:2},note:'20% + 5% uplift; epic landscapes',foreign:1},
 {k:'Budapest',f:'🇭🇺',rebate:.30,cost:.8,look:{Biopic:3,Action:2,Thriller:2},note:'30% rebate and low crew costs',foreign:1},
];
// International markets for Hollywood films (share of a typical Hollywood film's overseas gross)
const COUNTRIES=[
 {k:'UK & Ireland',f:'🇬🇧',share:.10,aff:{Comedy:1.2,Drama:1.15,Biopic:1.25}},
 {k:'China',f:'🇨🇳',share:.10,aff:{Superhero:1.1,'Sci-Fi':1.3,Animation:1.35,Action:1.2,Horror:0,Comedy:.3,Romance:.5,Biopic:.3,Drama:.4},china:1},
 {k:'Japan',f:'🇯🇵',share:.07,aff:{Animation:1.5,'Sci-Fi':1.1,Superhero:.6,Comedy:.4}},
 {k:'Mexico',f:'🇲🇽',share:.07,aff:{Superhero:1.3,Horror:1.4,Animation:1.3}},
 {k:'Germany',f:'🇩🇪',share:.06,aff:{Animation:1.2,Drama:1.1}},
 {k:'France',f:'🇫🇷',share:.06,aff:{Animation:1.3,Drama:1.3,Biopic:1.1,Superhero:.8}},
 {k:'South Korea',f:'🇰🇷',share:.05,aff:{Superhero:1.3,'Sci-Fi':1.3,Animation:1.1,Comedy:.5}},
 {k:'Australia',f:'🇦🇺',share:.05,aff:{Comedy:1.2,Animation:1.1}},
 {k:'Brazil',f:'🇧🇷',share:.04,aff:{Superhero:1.3,Horror:1.3,Animation:1.2}},
 {k:'Italy',f:'🇮🇹',share:.04,aff:{Drama:1.2,Animation:1.2,Comedy:1.1}},
 {k:'Spain',f:'🇪🇸',share:.04,aff:{Horror:1.2,Animation:1.2}},
 {k:'India',f:'🇮🇳',share:.03,aff:{Superhero:1.5,Action:1.5,'Sci-Fi':1.2,Animation:1.1,Comedy:.4,Drama:.4,Romance:.4}},
 {k:'Middle East',f:'🌍',share:.04,aff:{Action:1.3,Romance:.5},mena:1},
 {k:'Rest of world',f:'🌐',share:.25,aff:{}},
];
const RIVALS0=[
 {n:'Apex Pictures',c:'#4a90e2',p:1.25,svc:'Apex+',subs:95},{n:'Monolith Studios',c:'#9b59b6',p:1.15,svc:'Monolith Max',subs:70},
 {n:'Starlight Entertainment',c:'#e67e22',p:1.1,svc:'Starlight Now',subs:45},{n:'Crown Films',c:'#1abc9c',p:.95,svc:null,subs:0},
 {n:'Harbor Lane Pictures',c:'#e74c3c',p:.8,svc:null,subs:0},{n:'Lantern Releasing',c:'#95a5a6',p:.55,svc:null,subs:0}
];
const TECH_STREAMER={n:'Flixr',subs:300}; // fictional tech-giant streamer at real-world market-leader scale (~300M)
const T={
 Action:[['Fast','Iron','Rogue','Last','Dead','Steel','Final','Hard','Black','Zero'],['Protocol','Strike','Vengeance','Justice','Pursuit','Target','Extraction','Line','Ops','Hour']],
 Superhero:[['Captain','Night','Quantum','Crimson','Shadow','Thunder','Omega','Nova','Solar','Phantom'],['Sentinel','Legion','Knight','Rising','Guardian','Vanguard','Fury','Paradox','Titan','Hawk']],
 Comedy:[['Totally','Seriously','My Big','Weekend','Super','Bad','Office','Wedding','Road Trip','Neighbor'],['Disaster','Roommates','Vacation','Crashers','Dads','Heist','Party','Trouble','Rules','Wars']],
 Drama:[['The Quiet','A Long','Broken','The Last','Silent','Paper','Distant','Golden','Small','The Waiting'],['Summer','River','Hours','Letters','Season','Shore','Promise','Light','Mercy','Room']],
 Horror:[['The','Night of the','House of the','It Came From the','Beneath the','The Whispering','Return of the','Curse of the','The Thing in the','Children of the'],['Hollow','Basement','Hungry Dead','Lake','Floorboards','Doll','Pale Ones','Attic','Static','Well']],
 'Sci-Fi':[['Star','Dark','Event','Project','Neon','Edge of','Beyond','Orbit','Echo','Last Light of'],['Horizon','Matter','Genesis','Eclipse','Colony','Signal','Tomorrow','Zero','Drift','Mars']],
 Animation:[['Pip &','The Brave Little','Sir','Captain','Moonlight','Tiny','The Lost','Wild','Super','Pocket'],['the Dragon','Toaster','Whiskers','Penguin','Kingdom','Robots','Forest','Pals','Monsters','Ocean']],
 Romance:[['Love','Paris','One More','Kiss','Notes','Second','Midnight','Sweet','Summer','Always'],['in Venice','Actually','Chance','Me Twice','from June','Serenade','Dance','Spring','Hearts','Yours']],
 Thriller:[['Gone','The Silent','Dead','Blind','Cold','The Perfect','Final','Deep','The Night','Inside'],['Witness','Alibi','Ringer','Confession','Stranger','Motive','Cover','Pact','Shift','Job']],
 Biopic:[['The Ballad of','Becoming','Citizen','The','Saint','King','Lady','The Life of','Mister','Being'],['__N']],
};
const FIRST_M=['Marcus','Dante','Theo','Jalen','Rafael','Elias','Caleb','Viktor','Omar','Jasper','Luca','Rhys','Arjun','Felix','Gideon','Dev','Kofi','Malik','Hugo','Ezra','Mateo','Idris','Silas','Kai','Nikhil','Bruno','Tobias','Ren'];
const FIRST_F=['Ava','Lena','Sofia','Priya','Mila','Nora','Zara','Ines','Hazel','Talia','Keira','Maya','Selena','Ivy','Camila','Anouk','Freya','Rosa','Elena','Leila','Yara','Noor','Ingrid','Simone','Aiko','Lucia','Thandi','Margot'];
const LAST=['Sterling','Vance','Holloway','Reyes','Castellano','Whitlock','Okafor','Marlowe','Kingsley','Delacroix','Hart','Navarro','Blackwood','Sinclair','Mercer','Ashford','Lin','Valentine','Cruz','Prescott','Rowe','Kapoor','Fontaine','Byrne','Moreau','Hale','Achebe','Lindqvist','Morrow','Quinlan','Serrano','Tanaka','Petrov','Adeyemi','Novak','Duarte','Whitfield','Sato','Bianchi','Oyelaran'];
const STYPES=[
 {k:'Original spec',hype:0,cost:[.3,2.5],q:[25,95],fr:.0},
 {k:'Bestseller novel',hype:10,cost:[2,8],q:[45,90],fr:.5,adapt:1},
 {k:'Comic book',hype:14,cost:[3,10],q:[35,85],fr:.9,adapt:1,genres:['Superhero','Sci-Fi','Action','Animation']},
 {k:'Video game',hype:12,cost:[3,9],q:[25,80],fr:.8,adapt:1,genres:['Action','Sci-Fi','Animation','Horror','Comedy'],game:1},
 {k:'Remake / reboot',hype:7,cost:[1.5,5],q:[30,80],crit:-4,fr:.4,adapt:1},
 {k:'True story',hype:3,cost:[.8,3],q:[40,92],genres:['Drama','Biopic','Thriller'],fr:0,adapt:1},
];
const OUTLETS=['The Daily Reel','Screen Gazette','CineFile','The Hollywood Ledger','Film Pulse','Frame & Focus','Popcorn Weekly','The Celluloid Times'];
const HANDLES=['cinemaniac_ray','popcornqueen','filmbro_99','reelnina','thatmovieguy','late_night_lu','box_office_bets','criticalkai','frontrowfreya','spoilerfree_sam','moviemomjen','screenjunkie_dev','midnight_matinee','gen_z_cinephile'];
const TV_GENRES={'Prestige Drama':{icon:'🎭',award:1,crowd:0,ep:12},'Crime Drama':{icon:'🕵️',award:.7,crowd:4,ep:7},'Comedy':{icon:'😂',award:.6,crowd:6,ep:4},
 'Fantasy Epic':{icon:'🐉',award:.6,crowd:8,ep:18},'Sci-Fi Series':{icon:'🛸',award:.5,crowd:5,ep:14},'Limited Series':{icon:'📽️',award:.9,crowd:2,ep:10},
 'Reality / Competition':{icon:'🎤',award:.05,crowd:7,ep:1.5},'Docuseries':{icon:'🎥',award:.4,crowd:1,ep:2},'Animated Series':{icon:'🖍️',award:.3,crowd:6,ep:3}};
const FESTIVALS={0:{k:'Sundance',prize:'Grand Jury Prize'},4:{k:'Cannes',prize:"Palme d'Or"},8:{k:'Venice & Toronto',prize:"Golden Lion / People's Choice"}};
const CHAINS=[{n:'Marquee Cinemas',screens:800,price:400},{n:'Starlite Theaters',screens:2500,price:1400},{n:'MegaPlex Global',screens:6000,price:3500}];

const PLOTS=[
 {k:'An ordinary life changes',g:['Drama','Comedy','Romance','Biopic']},{k:'A reluctant hero',g:['Action','Superhero','Sci-Fi','Animation']},
 {k:'A hunt for redemption',g:['Drama','Thriller','Action']},{k:"An underdog's dream",g:['Biopic','Comedy','Animation','Drama']},
 {k:'A mission of revenge',g:['Action','Thriller','Superhero']},{k:'A mysterious stranger arrives',g:['Horror','Thriller','Romance','Sci-Fi']},
 {k:'Surviving a catastrophe',g:['Sci-Fi','Action','Drama']},{k:'A heist is planned',g:['Thriller','Action','Comedy']},
 {k:'Forbidden love',g:['Romance','Drama']},{k:'Something evil awakens',g:['Horror','Sci-Fi']},{k:'A betrayal from within',g:['Thriller','Drama','Superhero']},
 {k:'A journey to another world',g:['Animation','Sci-Fi','Superhero']},{k:'The truth comes out',g:['Drama','Thriller','Biopic']},{k:'Chaos at a wedding',g:['Comedy','Romance']},
 {k:'The final showdown',g:['Action','Superhero','Sci-Fi','Animation']},{k:'A sacrifice for family',g:['Drama','Animation','Biopic']},
 {k:'Unmasking the killer',g:['Thriller','Horror']},{k:'Rise to the top',g:['Biopic','Drama','Comedy']}];
const ACTS=['Act 1 · The start','Act 2 · The middle','Act 3 · The climax'];
const RUNTIMES=[{m:90,l:'1.5 hours',c:0,d:'Tight and punchy'},{m:120,l:'2 hours',c:.05,d:'Standard feature'},{m:150,l:'2.5 hours',c:.1,d:'Epic or prestige'},{m:180,l:'3 hours',c:.16,d:'Masterpiece-length'}];
const RT_IDEAL={Comedy:95,Horror:95,Animation:95,Romance:110,Thriller:115,Action:125,Superhero:140,'Sci-Fi':135,Drama:130,Biopic:145};
const ANIM_STYLES=[{k:'3D',l:'3D CGI',cost:1,q:0},{k:'2D',l:'2D hand-drawn',cost:.8,q:1},{k:'stop',l:'Stop-motion',cost:.9,q:2,post:3},{k:'anime',l:'Anime',cost:.55,q:1,post:3}];
const VIO_FIT={Action:[30,70],Superhero:[25,55],Horror:[45,90],Thriller:[25,60],'Sci-Fi':[15,50],Comedy:[0,20],Drama:[0,35],Romance:[0,10],Animation:[0,15],Biopic:[0,30]};
function ratingFromContent(v,e){return e>40||v>70?'R':e>15||v>35?'PG-13':v>10||e>5?'PG':'G'}
const COMBO_GOOD=[['Action','Comedy'],['Sci-Fi','Action'],['Romance','Comedy'],['Horror','Comedy'],['Drama','Romance'],['Thriller','Drama'],['Superhero','Comedy'],['Animation','Comedy'],['Sci-Fi','Horror'],['Biopic','Drama']];

/* ---------- v3.1: nationalities, traits, lot, marketing ---------- */
const NATS=[['USA','🇺🇸',28,null,[0,5]],['UK','🇬🇧',9,'UK & Ireland',[0,3]],['Canada','🇨🇦',5,null,[0,4]],['Australia','🇦🇺',4,'Australia',[0,2]],['India','🇮🇳',7,'India',[2,4]],['France','🇫🇷',4,'France',[0,3]],
 ['Germany','🇩🇪',3,'Germany',[0,1]],['Italy','🇮🇹',3,'Italy',[0,2]],['Spain','🇪🇸',3,'Spain',[0,2]],['Mexico','🇲🇽',4,'Mexico',[1,3]],['Brazil','🇧🇷',3,'Brazil',[1,4]],['Japan','🇯🇵',3,'Japan',[0,1]],
 ['South Korea','🇰🇷',4,'South Korea',[0,1]],['China','🇨🇳',3,'China',[0,1]],['Nigeria','🇳🇬',3,null,[4,5]],['South Africa','🇿🇦',2,null,[0,5]],['Ireland','🇮🇪',2,'UK & Ireland',[0,1]],['Sweden','🇸🇪',2,null,[0,0]],['Argentina','🇦🇷',2,null,[0,2]]];
function pickNat(){const tot=sum(NATS,n=>n[2]);let r=Math.random()*tot;for(const n of NATS){r-=n[2];if(r<=0)return n}return NATS[0]}
const natOf=k=>NATS.find(n=>n[0]===k)||NATS[0];
const TRAITS={
 hardworking:{l:'Hardworking',i:'💪',good:1,d:'Puts in extra hours. Better performance.',who:'ac'},
 method:{l:'Method actor',i:'🎭',good:1,d:'Disappears into roles (+acting) but can strain the set.',who:'a'},
 charismatic:{l:'Charismatic',i:'✨',good:1,d:'Magnetic on screen and on press tours (+buzz).',who:'a'},
 professional:{l:'Professional',i:'📋',good:1,d:'Always prepared. Never causes delays.',who:'ac'},
 beloved:{l:'Beloved',i:'💖',good:1,d:'Everyone loves working with them (+chemistry).',who:'ac'},
 linguist:{l:'Linguist',i:'🌐',good:1,d:'Speaks many languages (+international box office).',who:'a'},
 stunts:{l:'Does own stunts',i:'🤸',good:1,d:'Action and superhero films look better.',who:'a'},
 magnet:{l:'Awards magnet',i:'🏆',good:1,d:'Voters adore them (+awards odds).',who:'ac'},
 generous:{l:'Generous',i:'🤝',good:1,d:'Takes a 15% lower fee for good projects.',who:'ac'},
 visionary:{l:'Visionary',i:'🔭',good:1,d:'Bold creative vision (+quality).',who:'c'},
 efficient:{l:'Efficient',i:'⏱️',good:1,d:'Brings productions in under budget.',who:'c'},
 fx:{l:'Effects wizard',i:'🪄',good:1,d:'Masters visual effects (+quality on VFX films).',who:'c'},
 crowd:{l:'Crowd-pleaser',i:'🍿',good:1,d:'Knows what audiences want (+audience score).',who:'c'},
 auteur:{l:'Auteur',i:'🎨',good:1,d:'Critics love their style (+critics, −audience).',who:'c'},
 diva:{l:'Diva',i:'👑',good:0,d:'Demands 25% more money and special treatment.',who:'ac'},
 lazy:{l:'Lazy',i:'😴',good:0,d:'Coasts through the work (−quality).',who:'ac'},
 party:{l:'Party animal',i:'🍾',good:0,d:'Frequently in the tabloids for wild nights.',who:'a'},
 hothead:{l:'Hot-headed',i:'🔥',good:0,d:'Prone to on-set feuds (−chemistry).',who:'ac'},
 greedy:{l:'Money-hungry',i:'💸',good:0,d:'Insists on a profit share in every deal.',who:'ac'},
 unreliable:{l:'Unreliable',i:'⏰',good:0,d:'Often late. Productions may slip a month.',who:'ac'},
 insecure:{l:'Insecure',i:'😟',good:0,d:'Needs reassurance; performance suffers.',who:'a'},
 perfectionist:{l:'Perfectionist',i:'🔍',good:0,d:'Better results but 10% over budget.',who:'c'},
 difficult:{l:'Difficult',i:'⚡',good:0,d:'Clashes with cast and studio (−chemistry, overruns).',who:'c'},
};
function rollTraits(isActor){const pool=Object.keys(TRAITS).filter(k=>TRAITS[k].who.includes(isActor?'a':'c'));const good=pool.filter(k=>TRAITS[k].good),bad=pool.filter(k=>!TRAITS[k].good);
 const out=[];if(Math.random()<.75)out.push(pick(good));if(Math.random()<.35)out.push(pick(good.filter(k=>!out.includes(k))));if(Math.random()<.45)out.push(pick(bad));return out}
const hasT=(p,k)=>p&&p.traits&&p.traits.includes(k);
const BUILDINGS=[
 {k:'stage',l:'Film soundstages',i:'🎬',max:4,cost:40,up:.4,d:l=>`${l+1} films in production at once`},
 {k:'tvstage',l:'TV stages',i:'📺',max:3,cost:25,up:.25,d:l=>`${l+1} series in production at once`},
 {k:'writers',l:"Writers' building",i:'✍️',max:3,cost:15,up:.15,d:l=>`+${l*2} script quality, better pitches`},
 {k:'backlot',l:'City backlot',i:'🏙️',max:3,cost:30,up:.3,d:l=>`−${l*5}% shoot cost on action, drama, comedy, romance, thriller`},
 {k:'costume',l:'Costume workshop',i:'🧵',max:3,cost:12,up:.12,d:l=>`+${(l*1.5).toFixed(1)} quality on biopics, dramas, romance, superhero`},
 {k:'stunt',l:'Stunt team',i:'🤸',max:3,cost:12,up:.15,d:l=>`+${(l*1.5).toFixed(1)} quality on action, superhero, thriller`},
 {k:'vfx',l:'VFX house',i:'✨',max:3,cost:50,up:.5,d:l=>`−${l*6}% cost & +${l} quality on effects films`},
 {k:'scoring',l:'Scoring stage',i:'🎼',max:2,cost:10,up:.1,d:l=>`+${(l*.8).toFixed(1)} quality on every film`},
 {k:'screening',l:'Screening room',i:'🎟️',max:2,cost:8,up:.08,d:l=>`Reshoots fix ${l*2} more points`},
 {k:'marketing',l:'Trailer & marketing dept',i:'📣',max:3,cost:15,up:.2,d:l=>`+${l*4}% trailer approval, +${l*3} poster score`},
 {k:'premiere',l:'Premiere theatre',i:'🎦',max:2,cost:20,up:.15,d:l=>`+${l*3} buzz for every release`},
 {k:'led',l:'LED volume stage',i:'🖥️',max:2,cost:45,up:.4,year:2026,d:l=>`−${l*7}% cost on sci-fi, superhero, action`},
 {k:'mocap',l:'Motion-capture studio',i:'🕺',max:2,cost:30,up:.3,year:2027,d:l=>`+${l*2} quality on animation, sci-fi, superhero`},
 {k:'aiprevis',l:'AI previsualisation lab',i:'🤖',max:2,cost:35,up:.3,year:2029,d:l=>`−${l*4}% cost on every film (unions dislike it)`},
];
const lotLv=k=>(S&&S.lot&&S.lot[k])||0;
const CHANNELS=[['bill','🪧 Posters & billboards',[0,3,8,15],1.0],['tv','📺 TV spots',[0,6,15,30],1.4],['online','📱 Online & social',[0,2,5,10],1.2],['trailer','🎞️ Cinema trailers',[0,2,4,8],.9],['junket','🎤 Press junket',[0,1,2.5,5],.6],['premiere','🌟 Red-carpet premiere',[0,1.5,3,6],.6],['influ','🤳 Influencers',[0,1,3,6],.7]];
const EPIC=['Action','Superhero','Sci-Fi','Biopic','Drama'];
