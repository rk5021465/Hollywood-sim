"use strict";
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const MS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Season weight for Hindu/Jain weddings (Chaturmas Jul-Oct has none)
const SEASON=[1.3,1.2,.8,.9,.8,.6,0,0,0,0,1.3,1.5];
const START_YEAR=1726,END_YEAR=1800;

const TRADITIONS={
 rajput:{name:'Rajput',muhurat:true,phases:['Baraat arrival','Toran and welcome','The feast','Pheras at the muhurat','Vidaai'],clockName:'Muhurat',food:'any',w:3},
 marwari:{name:'Marwari',muhurat:true,phases:['Baraat arrival','Milni','The feast','Pheras at the muhurat','Vidaai'],clockName:'Muhurat',food:'veg',w:3},
 jain:{name:'Jain',muhurat:true,phases:['Baraat arrival','Welcome','The feast','Pheras at the muhurat','Vidaai'],clockName:'Muhurat',food:'jain',w:2},
 muslim:{name:'Muslim',muhurat:false,phases:['Baraat arrival','Welcome','The Nikah','The feast','Rukhsati'],clockName:'Nikah hour',food:'any',w:2}
};

const CLASSES={
 artisan:{name:'Artisan family',minFame:0,guests:[60,140],budget:[180,320],repMul:.5,expect:2},
 merchant:{name:'Merchant family',minFame:0,guests:[120,350],budget:[400,900],repMul:.8,expect:3},
 noble:{name:'Noble family',minFame:2,guests:[300,800],budget:[1000,1900],repMul:1.2,expect:4},
 royal:{name:'Royal household',minFame:4,guests:[800,1600],budget:[2800,4600],repMul:1.7,expect:5}
};

const FAME=[
 {min:0,name:'Unknown'},
 {min:50,name:'Talked about in the bazaar'},
 {min:180,name:'Trusted in Jaipur'},
 {min:480,name:'Favourite of the nobility'},
 {min:1000,name:'Royal wedding house'}
];

const SLOTS=[
 {id:'venue',name:'Venue',icon:'venue'},
 {id:'feast',name:'Feast',icon:'feast'},
 {id:'decor',name:'Decoration',icon:'decor'},
 {id:'music',name:'Music',icon:'music'},
 {id:'procession',name:'Procession',icon:'horse'},
 {id:'lights',name:'Lights',icon:'lamp'},
 {id:'officiant',name:'Officiant',icon:'book'},
 {id:'gifts',name:'Gifts and trousseau',icon:'gift'}
];

// cost: base rupees; per: cost per 100 guests; q quality 1-5; rel reliability 0-1
const VENDORS=[
 // venues: cap = max guests; kind drives 3D
 {id:'v1',slot:'venue',name:'Client family haveli',kind:'haveli',q:2,cost:0,per:0,cap:180,rel:.95,note:'Free, but small and crowded'},
 {id:'v2',slot:'venue',name:'Ram Niwas garden',kind:'garden',q:3,cost:60,per:6,cap:450,rel:.9,note:'Shady gardens outside the walls'},
 {id:'v3',slot:'venue',name:'Galta temple grounds',kind:'temple',q:4,cost:90,per:8,cap:650,rel:.9,note:'Blessed ground, not for Nikah',noMuslim:true},
 {id:'v4',slot:'venue',name:'Desert tent camp',kind:'tent',q:3,cost:150,per:10,cap:2000,rel:.8,note:'Holds any crowd, windy nights'},
 {id:'v6',slot:'venue',name:'Your wedding haveli',kind:'haveli2',q:4,cost:0,per:2,cap:600,rel:1,note:'Owned by your house',own:'haveli'},
 {id:'v7',slot:'venue',name:'Your house palace',kind:'palace',q:5,cost:0,per:3,cap:2000,rel:1,note:'The pride of your house',own:'palace'},
 {id:'v5',slot:'venue',name:'Amber palace courtyard',kind:'palace',q:5,cost:600,per:20,cap:1800,rel:.95,note:'Needs royal favour',minFame:3},
 // feast: food = veg / jain / any(nonveg capable)
 {id:'f1',slot:'feast',name:'Ganga Ram Halwai',q:2,cost:20,per:22,rel:.75,food:'veg',note:'Cheap sweets, slow kitchen'},
 {id:'f2',slot:'feast',name:'Kesar Bhojanalaya',q:3,cost:40,per:30,rel:.9,food:'jain',note:'Pure food, no onion or garlic'},
 {id:'f3',slot:'feast',name:'Ustad Karim Bawarchi',q:4,cost:60,per:40,rel:.85,food:'any',note:'Famous for slow-cooked meats'},
 {id:'f4',slot:'feast',name:'Royal kitchens of Mishra-ji',q:5,cost:120,per:60,rel:.9,food:'veg',note:'Fifty-six dishes',minFame:2},
 {id:'f5',slot:'feast',name:'Bhatia brothers',q:3,cost:30,per:28,rel:.6,food:'any',note:'Good food, always fighting'},
 // decor
 {id:'d1',slot:'decor',name:'Marigold and mango leaves',q:2,cost:25,per:5,rel:.95,note:'Simple and cheerful'},
 {id:'d2',slot:'decor',name:'Silk canopies by Noor',q:3,cost:70,per:10,rel:.85,note:'Coloured silk overhead'},
 {id:'d3',slot:'decor',name:'Mirror-work tents of Barmer',q:4,cost:140,per:14,rel:.8,note:'Glitters by lamplight'},
 {id:'d4',slot:'decor',name:'Royal brocade and jasmine',q:5,cost:260,per:20,rel:.85,note:'Gold thread everywhere',minFame:3},
 // music
 {id:'m1',slot:'music',name:'Street drummers',q:1,cost:10,per:0,rel:.8,note:'Loud and cheap'},
 {id:'m2',slot:'music',name:'Shehnai party of Bismil',q:3,cost:45,per:0,rel:.85,note:'The sound of a wedding'},
 {id:'m3',slot:'music',name:'Manganiyar folk singers',q:4,cost:90,per:0,rel:.8,note:'Desert ballads till dawn'},
 {id:'m4',slot:'music',name:'Naubat court drummers',q:5,cost:200,per:0,rel:.9,note:'Played for kings',minFame:3},
 // procession: type
 {id:'p1',slot:'procession',name:'On foot with lanterns',type:'foot',q:1,cost:0,per:0,rel:1,note:'Humble and quick'},
 {id:'p2',slot:'procession',name:'Rathore white mare',type:'horse',q:3,cost:35,per:0,rel:.85,note:'Classic groom on a mare'},
 {id:'p3',slot:'procession',name:'Bhoi palanquin bearers',type:'palanquin',q:3,cost:45,per:0,rel:.9,note:'Carried in style'},
 {id:'p4',slot:'procession',name:'Camel troupe of Bikaner',type:'camel',q:3,cost:50,per:0,rel:.75,note:'Unusual and fun'},
 {id:'p5',slot:'procession',name:'Moti the elephant',type:'elephant',q:5,cost:160,per:0,rel:.65,note:'Unforgettable. Moody.'},
 // lights
 {id:'l1',slot:'lights',name:'Clay oil lamps',type:'diya',q:2,cost:10,per:3,rel:.95,note:'Soft and safe'},
 {id:'l2',slot:'lights',name:'Torch bearers',type:'torch',q:3,cost:30,per:4,rel:.9,note:'Bright, smoky'},
 {id:'l3',slot:'lights',name:'Fireworks of Hafiz',type:'fireworks',q:4,cost:120,per:5,rel:.7,note:'Spectacular. Risky.'},
 {id:'l4',slot:'lights',name:'Chandeliers and fireworks',type:'fireworks',q:5,cost:260,per:8,rel:.85,note:'Imported glass, safe shells',minFame:3},
 // officiant: faith
 {id:'o1',slot:'officiant',name:'Pandit Shivnath',faith:'hindu',q:3,cost:20,per:0,rel:.9,note:'Reliable, plain'},
 {id:'o2',slot:'officiant',name:'Acharya Vidyadhar',faith:'hindu',q:5,cost:80,per:0,rel:.95,note:'Royal astrologer\'s pupil',minFame:2},
 {id:'o3',slot:'officiant',name:'Qazi Fazal Ahmed',faith:'muslim',q:4,cost:30,per:0,rel:.95,note:'Respected Qazi'},
 {id:'o4',slot:'officiant',name:'Pandit Hiralal Jain',faith:'jain',q:4,cost:30,per:0,rel:.9,note:'Knows every Jain rite'},
 // gifts
 {id:'g1',slot:'gifts',name:'Simple cloth and brass',q:1,cost:20,per:0,rel:1,note:'Modest'},
 {id:'g2',slot:'gifts',name:'Johari Bazaar silver',q:3,cost:120,per:0,rel:.95,note:'Silver and fine cotton'},
 {id:'g3',slot:'gifts',name:'Bandhani silks and gold',q:4,cost:300,per:0,rel:.9,note:'Tie-dye silks, gold sets'},
 {id:'g4',slot:'gifts',name:'Kundan jewels by Lalchand',q:5,cost:700,per:0,rel:.9,note:'Fit for a queen',minFame:3}
];

const FIRST=['Ratan','Hari','Mohan','Govind','Bhanu','Kesar','Udai','Prithvi','Dhanraj','Lakshmi','Moti','Chandra','Jagat','Sukh','Amar','Bhim','Vijay','Kishan','Gopal','Inder'];
const FEM=['Kamla','Rukmini','Padma','Gauri','Savitri','Meera','Tara','Kesar','Sundar','Anandi','Champa','Lila','Roop','Hansa','Mohini','Gulab','Chanda','Bhagwati'];
const SURN={rajput:['Rathore','Shekhawat','Kachhwaha','Chauhan','Bhati','Sisodia','Hada','Jhala'],marwari:['Agarwal','Maheshwari','Khandelwal','Poddar','Bajaj','Somani','Daga','Mundra'],jain:['Oswal','Bhandari','Kothari','Lodha','Golechha','Surana','Mehta','Baid'],muslim:['Qureshi','Ansari','Siddiqui','Khan','Mirza','Sheikh','Farooqi','Rizvi']};
const MFIRST=['Fazal','Karim','Yusuf','Salim','Irfan','Nasir','Rahim','Imran','Zafar','Iqbal'];
const MFEM=['Zubeida','Noor','Ruksana','Shirin','Ayesha','Mehrunissa','Salma','Farzana','Zeenat','Gulnaz'];

const TRAITS={
 charming:{name:'Charming',desc:'Families start 6 points happier'},
 shrewd:{name:'Shrewd',desc:'Vendors charge 12% less'},
 devout:{name:'Devout',desc:'40 extra minutes before every muhurat'},
 showman:{name:'Showman',desc:'Decoration, lights and processions count for more'},
 steady:{name:'Steady',desc:'Vendors are 10% more reliable'},
 proud:{name:'Proud',desc:'Reputation gains +20%, losses +20%'}
};

// Demands: check(plan,vend) -> true if met
const DEMANDS=[
 {id:'elephant',t:'An elephant for the groom\'s arrival',side:'groom',ok:p=>p.procession&&p.procession.type==='elephant',cls:['noble','royal','merchant'],w:2},
 {id:'mare',t:'The groom must ride a white mare',side:'groom',ok:p=>p.procession&&p.procession.type==='horse',w:3,not:['muslim']},
 {id:'palki',t:'The bride arrives in a palanquin',side:'bride',ok:p=>p.procession&&p.procession.type==='palanquin',w:2},
 {id:'veg',t:'A strictly vegetarian feast',side:'bride',ok:p=>p.feast&&(p.feast.food==='veg'||p.feast.food==='jain'),w:2,not:['muslim']},
 {id:'meat',t:'A grand feast with meat dishes',side:'groom',ok:p=>p.feast&&p.feast.food==='any',w:3,only:['rajput','muslim']},
 {id:'fireworks',t:'Fireworks all night',side:'groom',ok:p=>p.lights&&p.lights.type==='fireworks',w:3},
 {id:'quiet',t:'Quiet and dignified: no fireworks',side:'bride',ok:p=>!p.lights||p.lights.type!=='fireworks',w:2},
 {id:'music',t:'The finest musicians in Jaipur',side:'both',ok:p=>p.music&&p.music.q>=4,w:2},
 {id:'decor',t:'The grandest decoration anyone has seen',side:'bride',ok:p=>p.decor&&p.decor.q>=4,w:2},
 {id:'temple',t:'Hold it on temple grounds',side:'bride',ok:p=>p.venue&&p.venue.kind==='temple',w:1,not:['muslim']},
 {id:'palace',t:'Nothing less than a palace courtyard',side:'groom',ok:p=>p.venue&&p.venue.kind==='palace',w:2,cls:['noble','royal']},
 {id:'garden',t:'An open garden under the stars',side:'bride',ok:p=>p.venue&&p.venue.kind==='garden',w:2},
 {id:'home',t:'At the family haveli, as tradition says',side:'bride',ok:p=>p.venue&&p.venue.kind==='haveli',w:2,cls:['artisan','merchant']},
 {id:'gold',t:'A heavy gold trousseau for the bride',side:'bride',ok:p=>p.gifts&&p.gifts.q>=4,w:2},
 {id:'modest',t:'Modest gifts. No showing off.',side:'groom',ok:p=>p.gifts&&p.gifts.q<=2,w:1},
 {id:'learned',t:'The most learned officiant available',side:'both',ok:p=>p.officiant&&p.officiant.q>=4,w:2},
 {id:'cheapfood',t:'Keep the feast simple and cheap',side:'groom',ok:p=>p.feast&&p.feast.q<=3,w:1,cls:['artisan','merchant']},
 {id:'lamps',t:'Only clay lamps, like the old days',side:'bride',ok:p=>p.lights&&p.lights.type==='diya',w:1}
];

// Wedding-day events. when(ctx) filter; phase: index or -1 any
// ch: {l:label, c:cost, t:minutes delay, b:bride, g:groom, r:rep, x:special}
const EVENTS=[
 {id:'ele_stop',ph:0,when:c=>c.plan.procession.type==='elephant'&&Math.random()>c.rel('procession'),t:'Moti the elephant stops in the middle of the bazaar and will not move.',ch:[{l:'Send for sugarcane and wait',c:5,t:40,g:-2},{l:'Have the groom walk the last stretch',t:10,g:-10,b:2},{l:'Pay the mahout double to hurry',c:30,t:15}]},
 {id:'mare_spook',ph:0,when:c=>c.plan.procession.type==='horse'&&Math.random()>c.rel('procession'),t:'The drums spook the white mare. She rears and the groom nearly falls.',ch:[{l:'Stop the drums until she calms',t:25,g:-3},{l:'Swap to a calmer horse from the stables',c:20,t:15,g:-1},{l:'Laugh it off and carry on',g:-6,b:-2}]},
 {id:'camel',ph:0,when:c=>c.plan.procession.type==='camel',t:'The camels are a hit. Children follow the baraat, and the crowd doubles.',ch:[{l:'Let the crowd join the dancing',t:20,g:6,b:2,r:2},{l:'Keep the procession moving',g:2}]},
 {id:'late_baraat',ph:0,t:'The groom\'s family is still dancing at the city gate. They are an hour behind.',ch:[{l:'Send a messenger to hurry them',c:3,t:30,g:-3},{l:'Let them dance. It is their joy.',t:60,g:5,b:-4},{l:'Ask the musicians to stop playing',t:15,g:-8}]},
 {id:'palki_tilt',ph:0,when:c=>c.plan.procession.type==='palanquin'&&Math.random()>c.rel('procession'),t:'A palanquin bearer twists his ankle and the palanquin tilts.',ch:[{l:'Hire a passer-by to carry it',c:8,t:10},{l:'Pause until a new bearer arrives',t:35}]},
 {id:'toran',ph:1,t:'The groom must strike the toran over the door, but it has been hung too high.',ch:[{l:'Lift the groom on his friends\' shoulders',t:5,g:5,b:3},{l:'Quickly rehang it lower',t:15}]},
 {id:'milni_gift',ph:1,t:'An elder on the groom\'s side says the welcome gifts are too small and demands more.',ch:[{l:'Politely refuse. The agreed gifts stand.',g:-10,b:8,r:3,x:'honour'},{l:'Quietly add gifts from your own purse',c:40,g:6},{l:'Ask the bride\'s father to pay more',g:8,b:-12}]},
 {id:'seat',ph:1,t:'A proud uncle is furious that he was not given a front seat.',ch:[{l:'Give him your own cushioned seat',g:4,b:1},{l:'Explain the seating was set by the elders',g:-5},{l:'Bring him a special plate of sweets',c:4,g:5}]},
 {id:'extra_guests',ph:1,t:'Far more guests have arrived than the family told you. The courtyard is overflowing.',ch:[{l:'Buy food in a hurry from the bazaar',c:60,t:20,b:2,g:2},{l:'Serve smaller portions to everyone',b:-6,g:-6},{l:'Open a second sitting later',t:45}]},
 {id:'dignitary',ph:1,when:c=>c.cls!=='artisan',t:'A court official arrives without an invitation, with his whole escort.',ch:[{l:'Welcome him with full honours',c:25,t:15,b:4,g:4,r:3},{l:'Seat him quietly with the guests',g:-2,b:-2}]},
 {id:'food_short',ph:2,when:c=>Math.random()>c.rel('feast'),t:'The kitchen is running out of food and half the guests have not eaten.',ch:[{l:'Rush to buy from other cooks',c:50,t:30},{l:'Delay the feast and cook more',t:60,b:-3,g:-3},{l:'Serve what remains',b:-12,g:-12,r:-3}]},
 {id:'cook_fight',ph:2,when:c=>c.plan.feast.id==='f5',t:'The Bhatia brothers are shouting at each other in the kitchen. Guests can hear.',ch:[{l:'Separate them yourself',t:20},{l:'Pay them a bonus to stop',c:15,t:5}]},
 {id:'jain_onion',ph:2,when:c=>c.trad==='jain'&&c.plan.feast.food!=='jain',t:'A Jain elder finds onion in the food. The bride\'s family is horrified.',ch:[{l:'Apologise and throw out every dish',c:40,t:50,b:-10,g:-6},{l:'Insist it was a mistake by one cook',b:-20,g:-10,r:-6}]},
 {id:'meat_veg',ph:2,when:c=>c.trad!=='muslim'&&c.trad!=='rajput'&&c.plan.feast.food==='any',t:'Meat dishes are served at a vegetarian family\'s wedding.',ch:[{l:'Remove them at once and apologise',t:20,b:-12,g:-6},{l:'Keep them on a separate table',b:-18,g:-4,r:-3}]},
 {id:'sweets',ph:2,when:c=>c.plan.feast.q>=4,t:'The guests can\'t stop praising the sweets. People ask who the cook is.',ch:[{l:'Introduce the cook to the elders',b:4,g:4,r:3},{l:'Say it was your own secret recipe',b:2,g:2,r:5,x:'vendorhurt'}]},
 {id:'ghee',ph:2,t:'A pot of hot ghee spills near the guests. Nobody is hurt but there is panic.',ch:[{l:'Calm everyone and clean fast',t:15,b:-2,g:-2},{l:'Move the feast to the other side',t:30}]},
 {id:'muhurat_shift',ph:3,when:c=>c.muhurat,t:'The officiant recalculates. The auspicious moment is 30 minutes earlier than planned.',ch:[{l:'Rush everyone to the mandap now',t:-30,b:-3,g:-3},{l:'Trust the original time',x:'risk'}]},
 {id:'rain',ph:3,when:c=>[3,4,5,6].includes(c.month),t:'Dark clouds roll in. A summer storm is coming.',ch:[{l:'Raise extra canopies quickly',c:40,t:15},{l:'Hurry through the ritual',t:-10,b:-6,g:-6},{l:'Carry on and hope',x:'storm'}]},
 {id:'fire_spark',ph:3,when:c=>c.plan.lights.type==='fireworks'&&Math.random()>c.rel('lights'),t:'A stray firework lands on a canopy. Flames start to climb.',ch:[{l:'Douse it with water pots at once',c:30,t:20,b:-6,g:-4},{l:'Pull the canopy down',c:60,t:10,b:-3,g:-3}]},
 {id:'ring',ph:3,t:'The groom\'s ring is missing. His brother swears he had it.',ch:[{l:'Search the courtyard',t:30},{l:'Lend a ring from the bride\'s mother',b:-3,g:2},{l:'Buy one from a jeweller guest',c:35,t:10}]},
 {id:'pandit_late',ph:3,when:c=>Math.random()>c.rel('officiant'),t:'The officiant has not arrived. Someone says his cart broke down.',ch:[{l:'Send your fastest runner with a horse',c:10,t:35},{l:'Find another officiant nearby',c:25,t:20,b:-3,g:-3}]},
 {id:'shehnai',ph:3,when:c=>c.plan.music.q>=3,t:'The music swells at exactly the right moment. Even the grandmothers have tears in their eyes.',ch:[{l:'Let the moment breathe',t:5,b:6,g:6,r:2}]},
 {id:'quarrel',ph:3,t:'Two cousins from opposite families start an old argument about land.',ch:[{l:'Ask the elders to step in',t:15,b:-2,g:-2},{l:'Seat them far apart',t:5},{l:'Let them shout it out',b:-8,g:-8}]},
 {id:'firework_show',ph:2,when:c=>c.plan.lights.type==='fireworks',t:'The fireworks light the sky. The whole city stops to look.',ch:[{l:'Announce the house that arranged it',b:2,g:6,r:5},{l:'Let the families take the credit',b:5,g:8,r:2}]},
 {id:'decor_wow',ph:1,when:c=>c.plan.decor.q>=4,t:'The guests gasp as they enter. The decoration glitters in the lamplight.',ch:[{l:'Lead the bride\'s mother on a tour',b:8,g:3,r:2},{l:'Keep things moving',b:4,g:2}]},
 {id:'decor_wilt',ph:1,when:c=>c.plan.decor.q<=2&&Math.random()<.5,t:'In the heat, the marigolds are wilting before the guests arrive.',ch:[{l:'Buy fresh flowers',c:20,t:20},{l:'Leave it',b:-6}]},
 {id:'wind',ph:2,when:c=>c.plan.venue.kind==='tent',t:'A desert wind tugs at the tents. One pole starts to lean.',ch:[{l:'Send men to hold the ropes',c:10,t:10},{l:'Move the guests out of that tent',t:25,b:-2,g:-2}]},
 {id:'crowded',ph:1,when:c=>c.over>1.05,t:'The venue is far too small. Guests stand in the street.',ch:[{l:'Rent the neighbour\'s courtyard',c:40,t:20},{l:'Ask some guests to come in later',t:30,b:-8,g:-8}]},
 {id:'vidaai',ph:4,when:c=>c.muhurat,t:'The bride\'s farewell. Her father cannot hold back his tears.',ch:[{l:'Have the musicians play softly',b:6,g:2},{l:'Let the family have their moment',b:4,g:4}]},
 {id:'rukhsati',ph:4,when:c=>!c.muhurat,t:'The bride leaves her family home. The courtyard falls silent.',ch:[{l:'Have rose petals showered',c:8,b:6,g:4},{l:'Let the family have their moment',b:4,g:4}]},
 {id:'shoe',ph:4,t:'The bride\'s sisters have hidden the groom\'s shoes and demand a ransom.',ch:[{l:'Help the groom bargain cheerfully',b:5,g:3},{l:'Pay them from your purse',c:5,b:3,g:5}]},
 {id:'thief',ph:4,t:'A gift box is missing from the trousseau table.',ch:[{l:'Set your men to search quietly',t:20,b:-2},{l:'Replace it from your own purse',c:50},{l:'Raise the alarm',b:-6,g:-6}]},
 {id:'rival_gossip',ph:1,when:c=>c.rival,t:'A guest whispers that the rival house says your weddings are cheap and badly run.',ch:[{l:'Ignore it and work harder',b:2,g:2},{l:'Confront the gossip',b:-3,g:-3,r:1}]},
 {id:'drunk_singer',ph:2,when:c=>Math.random()>c.rel('music'),t:'The lead singer has lost his voice. The music falls flat.',ch:[{l:'Ask a talented guest to sing',b:3,g:3,t:10},{l:'Hire street drummers fast',c:10,t:15,b:-3},{l:'Go on without music',b:-6,g:-6}]},
 {id:'storm_gods',ph:3,when:c=>c.plan.venue.kind==='temple',t:'The temple priests offer a special blessing for the couple.',ch:[{l:'Accept with gratitude',c:10,t:10,b:6,g:4}]},
 {id:'palace_guard',ph:1,when:c=>c.plan.venue.kind==='palace',t:'The palace guards refuse entry to the band. Their papers are wrong.',ch:[{l:'Pay the guards a gift',c:20},{l:'Ask the palace steward for help',t:30,r:1}]},
 {id:'child_lost',ph:2,t:'A small child is lost in the crowd and her mother is frantic.',ch:[{l:'Stop everything and search',t:20,b:4,g:4,r:1},{l:'Send two helpers to search',t:5}]}
];

// History 1726-1800 (fact-based, simplified effects)
const HISTORY=[
 {y:1727,m:10,t:'Maharaja Sawai Jai Singh II founds the new city of Jaipur. Merchants and nobles move in.',fx:{boom:60}},
 {y:1728,m:2,t:'Work begins on a great observatory of stone instruments, the Jantar Mantar. Astrologers are in demand.',fx:{}},
 {y:1734,m:5,t:'The observatory is finished. Jaipur is known for learning.',fx:{rep:5}},
 {y:1739,m:2,t:'Nadir Shah of Persia sacks Delhi. Families flee to Jaipur with their wealth.',fx:{nobleBoost:24}},
 {y:1743,m:8,t:'Sawai Jai Singh II dies. The court enters mourning and a struggle for the throne begins.',fx:{mourn:3}},
 {y:1750,m:11,t:'Maharaja Ishwari Singh dies. The court is in turmoil again.',fx:{mourn:2}},
 {y:1757,m:5,t:'News arrives that the East India Company has won a battle at Plassey in Bengal. Merchants grow nervous.',fx:{budget:-.1,len:12}},
 {y:1761,m:0,t:'The Third Battle of Panipat. Many families across the north are in mourning.',fx:{mourn:4,slump:8}},
 {y:1765,m:7,t:'The East India Company takes control of revenue in Bengal. Trade routes begin to change.',fx:{}},
 {y:1772,m:3,t:'Silk merchants from the east bring new fabrics to Jaipur bazaars.',fx:{decorCheap:24}},
 {y:1783,m:5,t:'The great famine begins across the north. Food prices soar.',fx:{famine:15}},
 {y:1790,m:10,t:'Peace and good harvests return. A wave of delayed weddings arrives.',fx:{boom:18}},
 {y:1799,m:0,t:'The Hawa Mahal, the Palace of Winds, rises in Jaipur. Royal weddings grow even grander.',fx:{royalBoost:12}}
];

const UPGRADES=[
 {id:'clerk',name:'Hire a ledger clerk',cost:300,desc:'Shows exact profit before you lock a plan'},
 {id:'tents',name:'Own tent store',cost:900,desc:'Decoration costs 15% less'},
 {id:'stable',name:'Own stable of horses',cost:700,desc:'White mare processions cost nothing'},
 {id:'couriers',name:'Courier network',cost:1200,desc:'More families hear about you'},
 {id:'office',name:'Larger office',cost:1800,desc:'Plan one more wedding at the same time'},
 {id:'kitchen',name:'Partnership with a kitchen',cost:2200,desc:'Feasts cost 15% less and rarely run short'},
 {id:'office2',name:'Grand office on Johari Bazaar',cost:5000,desc:'Plan one more wedding at the same time',req:'office'},
 {id:'haveli',name:'Buy a wedding haveli',cost:9000,desc:'Your own venue for 600 guests. Free to use, 4 stars.'},
 {id:'workshop',name:'Royal decoration workshop',cost:14000,desc:'Decoration and lights cost 25% less',req:'tents'},
 {id:'palace',name:'Build the House palace',cost:45000,desc:'Your own palace venue for 2,000 guests. 5 stars, and families love it.',req:'haveli'}
];

const STAFF_NAMES=['Munshi Ramlal','Bhagwan Das','Chand Bibi','Kalu Ram','Nathu Singh','Gulab Rai','Hamid Ali','Sohan Lal','Phool Kanwar','Jeevan Ram'];

// Items the player places on the venue. beauty adds to both families' happiness.
const DECOR_ITEMS=[
 {k:'banana',name:'Banana trees',cost:12,beauty:1,desc:'Auspicious, by the gate'},
 {k:'rangoli',name:'Rangoli',cost:8,beauty:1,desc:'Coloured powder art'},
 {k:'urn',name:'Flower urn',cost:10,beauty:1,desc:'Roses and marigolds'},
 {k:'lamp',name:'Brass lamp',cost:15,beauty:1,desc:'Warm light'},
 {k:'seating',name:'Cushioned seats',cost:20,beauty:1,desc:'Two or more stop seat quarrels',tag:'comfort'},
 {k:'arch',name:'Marigold arch',cost:30,beauty:3,desc:'A wall of flowers'},
 {k:'canopy',name:'Silk canopy',cost:40,beauty:2,desc:'Two or more protect from rain',tag:'shelter'},
 {k:'swing',name:'Flower swing',cost:45,beauty:3,desc:'Brides love it',bride:1},
 {k:'peacock',name:'Peacock statue',cost:70,beauty:4,desc:'Painted and proud',minFame:1},
 {k:'fountain',name:'Rose-water fountain',cost:90,beauty:5,desc:'Cool and fragrant',minFame:2},
 {k:'elephant',name:'Elephant statue',cost:140,beauty:7,desc:'The talk of the town',minFame:3}
];
const DECOR_BY={};DECOR_ITEMS.forEach(d=>DECOR_BY[d.k]=d);
