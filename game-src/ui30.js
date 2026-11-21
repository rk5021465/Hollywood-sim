/* ===== v19.3 · Location scouting: shoot somewhere breathtaking ===== */
const SCOUT=[
 {k:'dunes',r:'af',n:'Sahara Dunes',w:'Morocco',ic:'🏜️',art:'dunes',fit:{Action:3,'Sci-Fi':4,Biopic:2,Drama:2},c:1.4,risk:'Sandstorms',pal:['#F6C27A','#E59A4C','#B5652B','#FBE3B5']},
 {k:'alps',r:'eu',n:'Swiss Alps',w:'Switzerland',ic:'🏔️',art:'peaks',fit:{Action:4,Thriller:3,Romance:2,Superhero:2},c:1.5,risk:'Avalanche warnings',pal:['#9CC9F0','#5C86B8','#EEF4FA','#2E4A6E']},
 {k:'island',r:'as',n:'Tropical Island',w:'Thailand',ic:'🏝️',art:'beach',fit:{Romance:4,Comedy:3,Action:2,Horror:2},c:1.3,risk:'Monsoon rain',pal:['#7FD6E8','#2BA6B8','#F4E2B0','#2F8F4E']},
 {k:'paris',r:'eu',n:'Paris Rooftops',w:'France',ic:'🗼',art:'rooftops',fit:{Romance:4,Drama:3,Thriller:3,Biopic:3,Comedy:2},c:1.4,risk:'Permit strikes',pal:['#F2B8A0','#C97E86','#5B4A6E','#FCE3C8']},
 {k:'tokyo',r:'as',n:'Neon Tokyo',w:'Japan',ic:'🌃',art:'neon',fit:{'Sci-Fi':4,Thriller:3,Action:3,Superhero:3},c:1.5,risk:'Crowd control',y:1975,pal:['#1B1640','#E94BA0','#36D1E8','#F9D45C']},
 {k:'jungle',r:'am',n:'Amazon Rainforest',w:'Brazil',ic:'🌿',art:'jungle',fit:{Action:4,Horror:3,Drama:2,'Sci-Fi':2},c:1.6,risk:'Illness on set',pal:['#2E6B3A','#4FA35A','#B6E07A','#1B3B22']},
 {k:'castle',r:'eu',n:'Highland Castle',w:'Scotland',ic:'🏰',art:'castle',fit:{Biopic:4,Horror:3,Drama:3,Romance:2},c:1.2,risk:'Endless drizzle',pal:['#8FA8A0','#4E6B62','#C9D6C2','#2F3D3A']},
 {k:'canyon',r:'am',n:'Red Rock Canyon',w:'Utah, USA',ic:'🌵',art:'canyon',fit:{Action:4,'Sci-Fi':3,Thriller:2,Drama:2},c:.9,risk:'Heatwaves',pal:['#F7B267','#D9622B','#8C2F1B','#FCE1B4']},
 {k:'iceland',r:'eu',n:'Black Sand Coast',w:'Iceland',ic:'🌋',art:'volcano',fit:{'Sci-Fi':4,Horror:3,Thriller:3,Superhero:2},c:1.4,risk:'Storms',pal:['#2B3640','#5E7C8A','#C9D9DF','#111']},
 {k:'aurora',r:'eu',n:'Arctic Northern Lights',w:'Norway',ic:'🌌',art:'aurora',fit:{Romance:3,'Sci-Fi':3,Drama:3,Thriller:3},c:1.6,risk:'Frostbite',pal:['#0C1B33','#2EE6A6','#7B5CE6','#DCEBFF']},
 {k:'venice',r:'eu',n:'Venetian Canals',w:'Italy',ic:'🛶',art:'canal',fit:{Romance:4,Thriller:3,Drama:3,Comedy:2,Biopic:2},c:1.3,risk:'Flooding (acqua alta)',pal:['#F4C99B','#D88A5C','#4C8DA8','#FCEBD3']},
 {k:'town',r:'am',n:'Small-Town America',w:'Iowa, USA',ic:'🌾',art:'town',fit:{Drama:4,Comedy:3,Horror:3,Romance:2},c:.6,risk:'Tornado season',pal:['#F6D46B','#9BC46B','#C0504D','#BFE3F5']},
 {k:'dubai',r:'af',n:'Desert Skyline',w:'Dubai',ic:'🏙️',art:'skyline',fit:{Action:4,Thriller:3,'Sci-Fi':3,Superhero:3},c:1.7,risk:'Extreme heat',y:2008,pal:['#F3C27B','#E07A3F','#5A6E8C','#FDE6BF']},
 {k:'space',r:'sp',n:'Zero-G Flight Studio',w:'Florida, USA',ic:'🚀',art:'space',fit:{'Sci-Fi':5,Superhero:3},c:2.2,risk:'Motion sickness',y:1995,pal:['#0A0F2C','#3A4A8C','#F2F2F2','#F9A03F']}];

const SC_MORE=[
 ['grandc','Grand Canyon','Arizona, USA','🏞️','canyon','am',{Action:3,'Sci-Fi':2,Drama:3,Thriller:2},1.0,'Flash floods',0,['#F4A261','#C8553D','#7F2F1E','#FDE2C4']],
 ['nyc','Manhattan Skyline','New York, USA','🗽','skyline','am',{Thriller:4,Comedy:3,Romance:3,Superhero:4,Drama:3},1.4,'Traffic shutdowns',0,['#9EC5E8','#4A6FA5','#2C3E5A','#E8F1FA']],
 ['hawaii','Hawaiian Volcano','Hawaii, USA','🌋','volcano','am',{'Sci-Fi':3,Action:4,Romance:2,Horror:2},1.3,'Lava closures',0,['#3B6E4F','#7FB685','#F9C784','#1E2E25']],
 ['carib','Caribbean Beach','Jamaica','🏖️','beach','am',{Romance:4,Comedy:4,Action:3,Thriller:2},1.1,'Hurricanes',0,['#8FE3F0','#1FA9C9','#FAE6B1','#2E8B57']],
 ['patag','Patagonian Glaciers','Argentina','🧊','peaks','am',{'Sci-Fi':3,Action:3,Drama:3,Biopic:2},1.6,'Brutal winds',0,['#BFE3F5','#6FA8C9','#F5FBFF','#33506B']],
 ['machu','Andes Mountain Ruins','Peru','⛰️','peaks','am',{Action:4,Biopic:2,Drama:2,'Sci-Fi':2},1.5,'Altitude sickness',0,['#C9E4C5','#6B8F71','#E8E1C9','#3D5A40']],
 ['rio','Rio Carnival Streets','Brazil','🎭','neon','am',{Comedy:4,Romance:3,Action:3,Thriller:2},1.2,'Crowd chaos',0,['#2A1B4A','#F8B400','#2EC4B6','#FF6B6B']],
 ['vegas','Las Vegas Strip','Nevada, USA','🎰','neon','am',{Comedy:4,Thriller:4,Action:3,Drama:2},1.1,'Casino permits',0,['#160F30','#FF3CAC','#FFD23F','#3BCEAC']],
 ['bayou','Louisiana Bayou','Louisiana, USA','🐊','jungle','am',{Horror:4,Thriller:3,Drama:3},.8,'Alligators',0,['#4E6E58','#6E9075','#A8C69F','#2B3A2F']],
 ['yellow','Yellowstone Geysers','Wyoming, USA','♨️','volcano','am',{'Sci-Fi':3,Drama:2,Action:2,Horror:2},1.0,'Wildlife on set',0,['#7FA7C9','#5C8A6E','#F2E8CF','#2F3E46']],
 ['alaska','Alaskan Wilderness','Alaska, USA','🐻','aurora','am',{Thriller:4,Horror:3,Drama:3,Action:2},1.4,'Bears',0,['#0F2235','#44D7B6','#9D7BF0','#E6F0FF']],
 ['chicago','Chicago Rooftops','Illinois, USA','🌆','rooftops','am',{Thriller:4,Drama:3,Superhero:3,Action:3},1.0,'Freezing wind',0,['#A9C6DE','#5B6E85','#2D3A4A','#E6EEF5']],
 ['london','Foggy London Streets','England','🎩','rooftops','eu',{Thriller:4,Biopic:4,Drama:3,Horror:3},1.2,'Endless rain',0,['#B8C2C9','#6C7A86','#38424B','#E5E9EC']],
 ['santo','Santorini Cliffs','Greece','🏛️','canal','eu',{Romance:5,Comedy:3,Drama:2},1.3,'Tourist crowds',0,['#BFE6FF','#F7F7F7','#1E6FB8','#FFFFFF']],
 ['rome','Ancient Rome','Italy','🏟️','castle','eu',{Biopic:4,Action:3,Romance:3,Drama:3},1.4,'Heritage rules',0,['#F3D5A9','#C99E67','#F8E9CF','#7A5C3A']],
 ['prague','Prague Old Town','Czechia','🏰','rooftops','eu',{Horror:3,Romance:3,Thriller:3,Biopic:3},.9,'Cobblestone injuries',0,['#E8C9A0','#B45F4D','#4A3B4F','#F6E7D2']],
 ['fjord','Norwegian Fjords','Norway','🛳️','peaks','eu',{Thriller:3,Action:3,'Sci-Fi':3,Drama:3},1.3,'Sea fog',0,['#A7D3E8','#3E6B89','#E3F2F9','#1F3A4D']],
 ['cliffs','Cliffs of Moher','Ireland','🍀','volcano','eu',{Romance:3,Drama:4,Biopic:2},.9,'Gale-force winds',0,['#5B8C5A','#8FBF8F','#D9EDD9','#2A3B2A']],
 ['riviera','French Riviera','Monaco','⛵','beach','eu',{Thriller:4,Romance:4,Comedy:3},1.6,'Celebrity traffic',0,['#9FE1F5','#2B8CC4','#F7E7C6','#E07A5F']],
 ['barca','Barcelona Rooftops','Spain','🌞','rooftops','eu',{Romance:3,Comedy:3,Thriller:3,Drama:2},1.0,'Heatwave',0,['#FFD6A5','#E07A5F','#6D597A','#FFF1DC']],
 ['moscow','Snowy Moscow','Russia','❄️','castle','eu',{Thriller:4,Drama:3,Biopic:3,Action:2},1.4,'Permits (and -30°C)',1992,['#D7E3EC','#9FB4C7','#FFFFFF','#4A5A6A']],
 ['berlin','Berlin Wall','Germany','🧱','skyline','eu',{Thriller:5,Drama:4,Biopic:3},1.1,'Border guards',0,['#BFC6CC','#6E7881','#3B434A','#E3E7EA']],
 ['himal','Himalayan Peaks','Nepal','🏔️','peaks','as',{Action:4,Drama:3,Biopic:3,'Sci-Fi':2},1.8,'Altitude sickness',0,['#C7DFF7','#7C9CBF','#FFFFFF','#2E4057']],
 ['hk','Hong Kong Harbour','Hong Kong','🌉','neon','as',{Action:5,Thriller:4,Comedy:2},1.3,'Typhoon warnings',0,['#14123A','#FF5E78','#4CC9F0','#F9C74F']],
 ['bali','Bali Rice Terraces','Indonesia','🌾','town','as',{Romance:4,Drama:3,Comedy:2},.9,'Mudslides',0,['#C5E99B','#6AB04C','#F7D794','#D4F1F9']],
 ['taj','Rajasthan Palaces','India','🕌','castle','as',{Romance:4,Biopic:4,Drama:3,Action:2},1.0,'Summer heat',0,['#FBD38D','#F6E3C5','#FFFFFF','#C77D4A']],
 ['mumbai','Mumbai Streets','India','🛺','rooftops','as',{Drama:4,Comedy:3,Thriller:3,Romance:3},.8,'Monsoon flooding',0,['#FFC971','#E85D04','#6A040F','#FFE8C2']],
 ['seoul','Seoul Nights','South Korea','🌃','neon','as',{Thriller:4,Romance:3,'Sci-Fi':3,Horror:3},1.2,'Crowd control',1990,['#1A1A40','#F72585','#4CC9F0','#FFD166']],
 ['shanghai','Shanghai Skyline','China','🏙️','skyline','as',{'Sci-Fi':4,Action:4,Thriller:3},1.5,'Permit delays',2000,['#B8D8E8','#3A6EA5','#1E2F4A','#EAF4FA']],
 ['angkor','Jungle Temples','Cambodia','🛕','jungle','as',{Action:4,Horror:3,Biopic:2},1.1,'Monsoon',1993,['#3E6B48','#5C9E6C','#C9B37E','#24402C']],
 ['fuji','Mount Fuji Lakes','Japan','🗻','peaks','as',{Drama:4,Romance:3,'Sci-Fi':2,Biopic:2},1.2,'Cherry-blossom crowds',0,['#FAD2E1','#8BB8E8','#FFFFFF','#3A5A80']],
 ['halong','Ha Long Bay','Vietnam','⛵','canal','as',{Action:3,Romance:3,Drama:3,'Sci-Fi':2},1.0,'Sea storms',1995,['#BEE3DB','#3B8686','#89B0AE','#E8F6F3']],
 ['istan','Istanbul Bazaar','Turkey','🕌','rooftops','af',{Thriller:4,Action:3,Romance:2,Biopic:2},1.0,'Chase-scene permits',0,['#F2CC8F','#E07A5F','#3D405B','#F4F1DE']],
 ['petra','Rose-Red Desert City','Jordan','🏜️','canyon','af',{Action:4,'Sci-Fi':3,Biopic:3},1.3,'Sandstorms',0,['#F6BD8C','#D96C4A','#8E3B2C','#FDE3CC']],
 ['pyramid','Pyramids of Giza','Egypt','🔺','dunes','af',{Action:4,Biopic:4,Horror:3,'Sci-Fi':2},1.3,'Heat and permits',0,['#F9D99A','#E5A65D','#B5733A','#FDF0D5']],
 ['savanna','Kenyan Savannah','Kenya','🦁','town','af',{Drama:4,Biopic:3,Action:3,Animation:3},1.2,'Wildlife delays',0,['#F6C85F','#D9A441','#7A5C2E','#FDE7B0']],
 ['vicfalls','Victoria Falls','Zambia','💦','jungle','af',{Action:4,Romance:3,Drama:2},1.3,'Slippery rocks',0,['#58A55C','#87C38F','#E0F2E9','#2E5E3E']],
 ['capetown','Table Mountain','South Africa','⛰️','peaks','af',{Action:3,Drama:3,Thriller:3},1.0,'Cape winds',1994,['#9AD1D4','#4F8A8B','#F1F7F7','#2C4F55']],
 ['marrak','Marrakech Souks','Morocco','🧿','rooftops','af',{Thriller:4,Romance:3,Action:3},.9,'Crowded alleys',0,['#F4A259','#BC4B51','#5B8E7D','#FBE0C3']],
 ['outback','Australian Outback','Australia','🦘','canyon','oc',{Action:4,Horror:3,Drama:3,'Sci-Fi':3},1.2,'Scorching heat',0,['#F7A072','#D1495B','#7B2D26','#FDE2CF']],
 ['reef','Great Barrier Reef','Australia','🐠','beach','oc',{Romance:3,Action:3,'Sci-Fi':2,Animation:3},1.5,'Jellyfish',0,['#7FE0F5','#0FA3B1','#F7E7B4','#2E8B57']],
 ['nzmount','Southern Alps','New Zealand','🗻','peaks','oc',{'Sci-Fi':4,Action:4,Superhero:3},1.3,'Remote access',0,['#BDE0FE','#5E81AC','#F0F7FF','#2E3D55']],
 ['sydney','Sydney Harbour','Australia','🌉','skyline','oc',{Romance:3,Comedy:3,Thriller:3,Superhero:3},1.2,'Harbour closures',0,['#A8DADC','#457B9D','#1D3557','#F1FAEE']],
 ['tank','Underwater Tank Stage','Malta','🌊','space','sp',{Action:4,'Sci-Fi':4,Horror:3,Superhero:3},1.7,'Equipment failure',0,['#03324E','#0F6E9E','#9BE7FF','#FFD166']],
 ['backlot','Classic Studio Backlot','Burbank, USA','🎬','town','sp',{Comedy:3,Drama:3,Romance:3,Biopic:3,Horror:2},.4,'Noisy neighbours',0,['#F5E6C8','#C8A97E','#A23B2A','#CDE7F5']],
 ['antarc','Antarctic Ice Station','Antarctica','🐧','aurora','sp',{'Sci-Fi':5,Horror:5,Thriller:3},2.4,'Whiteouts',1985,['#0B1D33','#7FDBFF','#B39DDB','#F5FAFF']]];
SC_MORE.push(['berlin2','Reunified Berlin','Germany','🇩🇪','skyline','eu',{Thriller:4,Drama:3,'Sci-Fi':2,Action:2},1.1,'Winter dark',1990,['#C9D3DB','#7A8794','#3E4851','#EEF2F5']]);
SC_MORE.forEach(a=>SCOUT.push({k:a[0],n:a[1],w:a[2],ic:a[3],art:a[4],r:a[5],fit:a[6],c:a[7],risk:a[8],y:a[9]||0,pal:a[10]}));
const SC_REG=[['all','All'],['fit','✨ Best fits'],['am','Americas'],['eu','Europe'],['as','Asia'],['af','Africa & Middle East'],['oc','Oceania'],['sp','Special']];
const SC_MAX=5;
function scoutAvail(){return SCOUT.filter(s=>(!s.y||S.year>=s.y)&&(!s.ye||S.year<=s.ye))}
function scoutFit(s,g){return (s.fit||{})[g]||0}
function scoutCost(s,g){g=g||(typeof W!=='undefined'&&W&&W.script&&W.script.genre)||'Drama';const b=(GEN[g]&&GEN[g].budget)||20;return +(s.c*b*0.07*inf(tNow())).toFixed(2)}

/* flat postcard art */
function scoutArt(s,w,h){w=w||300;h=h||150;const [a,b,c,d]=s.pal;const sky=`<defs><linearGradient id="sk${s.k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="300" height="150" fill="url(#sk${s.k})"/>`;
 const sun=(x,y,r,col)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity=".9"/>`;let g='';
 switch(s.art){
 case 'dunes':g=sun(220,42,18,'#FFF4D6')+`<path d="M0 105 Q60 70 120 98 T240 92 T300 100 V150 H0Z" fill="${b}"/><path d="M0 125 Q80 95 160 120 T300 115 V150 H0Z" fill="${c}"/><path d="M40 112 l6-10 l6 10z M52 112 l5-8 l5 8z" fill="#5a3418" opacity=".7"/>`;break;
 case 'peaks':g=`<path d="M0 120 L60 50 L95 90 L140 30 L190 95 L230 55 L300 120 V150 H0Z" fill="${b}"/><path d="M60 50 L74 66 L52 68Z M140 30 L158 52 L124 54Z M230 55 L244 70 L218 72Z" fill="${c}"/><path d="M0 130 Q150 110 300 132 V150 H0Z" fill="${d}"/>`;break;
 case 'beach':g=sun(70,40,16,'#FFF7C2')+`<rect y="95" width="300" height="30" fill="${b}"/><path d="M0 118 Q150 108 300 120 V150 H0Z" fill="${c}"/><path d="M228 125 Q232 80 246 62" stroke="#6b4a2a" stroke-width="5" fill="none"/><path d="M246 62 q-30 -2 -38 12 M246 62 q24 -12 40 0 M246 62 q-8 -22 -28 -24 M246 62 q14 -20 34 -16" stroke="${d==='#2F8F4E'?d:'#2F8F4E'}" stroke-width="7" fill="none" stroke-linecap="round"/>`;break;
 case 'rooftops':g=sun(240,40,14,'#FFE9C9')+`<path d="M150 22 L156 90 H144Z M138 90 L162 90 L170 120 H130Z" fill="${c}"/><path d="M0 110 h40 v-22 l10-8 l10 8 v22 h20 v-30 h30 v30 h60 v-26 l12-10 l12 10 v26 h40 v-18 h30 v18 h36 V150 H0Z" fill="${b}"/><path d="M0 130 H300 V150 H0Z" fill="${c}"/>`;break;
 case 'neon':g=`<rect width="300" height="150" fill="${a}"/>`+[0,1,2,3,4,5,6,7].map(i=>`<rect x="${i*38+4}" y="${40+((i*37)%50)}" width="30" height="${110-((i*37)%50)}" fill="#24204f"/><rect x="${i*38+9}" y="${50+((i*37)%50)}" width="6" height="22" fill="${i%2?b:c}" opacity=".9"/>`).join('')+`<rect x="0" y="132" width="300" height="18" fill="#0f0c26"/><rect x="0" y="132" width="300" height="2" fill="${b}" opacity=".7"/>`;break;
 case 'jungle':g=`<rect y="60" width="300" height="90" fill="${a}"/>`+[0,1,2,3,4,5,6].map(i=>`<ellipse cx="${i*50}" cy="${70+(i%2)*12}" rx="42" ry="30" fill="${i%2?b:c}" opacity=".85"/>`).join('')+`<path d="M0 150 Q60 112 120 150 Z M180 150 Q240 108 300 150Z" fill="${d}"/><path d="M150 150 V95" stroke="#4a3220" stroke-width="6"/>`;break;
 case 'castle':g=`<path d="M0 115 Q80 80 160 105 T300 100 V150 H0Z" fill="${b}"/><path d="M175 98 v-38 h10 v-8 h6 v8 h8 v-8 h6 v8 h10 v38Z M162 98 v-24 h8 v24Z M220 98 v-30 h8 v30Z" fill="${d}"/><path d="M0 132 Q150 118 300 135 V150 H0Z" fill="${c}" opacity=".6"/>`;break;
 case 'canyon':g=sun(60,36,15,'#FFF1C9')+`<path d="M0 150 V80 h40 v-20 h30 v20 h20 v70Z M190 150 V60 h24 v-14 h40 v14 h20 v40 h26 v50Z" fill="${b}"/><path d="M110 150 V100 h30 v-12 h24 v62Z" fill="${c}"/><path d="M0 140 H300 V150 H0Z" fill="${c}"/>`;break;
 case 'volcano':g=`<path d="M60 120 L130 50 L150 52 L220 120Z" fill="#3a4a55"/><path d="M128 52 q12 -26 4 -40 q16 10 10 40" fill="#ccd" opacity=".5"/><rect y="118" width="300" height="12" fill="${b}"/><path d="M0 128 Q150 120 300 130 V150 H0Z" fill="${d}"/><path d="M0 128 Q150 120 300 130" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/>`;break;
 case 'aurora':g=`<rect width="300" height="150" fill="${a}"/><path d="M0 60 Q70 20 140 55 T300 40" stroke="${b}" stroke-width="16" fill="none" opacity=".55"/><path d="M0 80 Q90 40 170 70 T300 60" stroke="${c}" stroke-width="12" fill="none" opacity=".45"/>`+[...Array(14)].map((_,i)=>`<circle cx="${(i*53)%300}" cy="${(i*29)%50+6}" r="1.2" fill="#fff"/>`).join('')+`<path d="M0 120 L40 100 L70 115 L110 92 L160 118 L210 98 L260 116 L300 104 V150 H0Z" fill="${d}"/>`;break;
 case 'canal':g=sun(230,36,13,'#FFF0D6')+`<path d="M0 50 h50 v70 H0Z M250 40 h50 v80 h-50Z" fill="${b}"/><path d="M50 70 h40 v50 H50Z M210 60 h40 v60 h-40Z" fill="${a}" opacity=".9"/><path d="M0 120 H300 V150 H0Z" fill="${c}"/><path d="M120 128 q30 8 60 0 l-6 6 q-24 4 -48 0Z" fill="#222"/><path d="M180 112 v18" stroke="#222" stroke-width="2"/>`;break;
 case 'town':g=`<rect y="100" width="300" height="50" fill="${b}"/>`+[0,1,2,3,4,5,6,7,8,9,10,11].map(i=>`<path d="M${i*25} 100 l12 -40 l12 40" stroke="${a}" stroke-width="2" fill="none" opacity=".5"/>`).join('')+`<path d="M190 100 v-30 l20 -18 l20 18 v30Z" fill="${c}"/><path d="M228 100 v-50 h8 v50Z" fill="#8b6b4a"/><circle cx="232" cy="46" r="10" fill="#f0f0f0" stroke="#8b6b4a" stroke-width="2"/>`;break;
 case 'skyline':g=sun(60,40,16,'#FFF3D0')+`<path d="M150 130 L156 20 L162 130Z" fill="${c}"/>`+[0,1,2,3,4,5,6,7,8].map(i=>`<rect x="${i*34}" y="${70+((i*23)%40)}" width="24" height="${80-((i*23)%40)}" fill="${c}" opacity="${.6+.04*i}"/>`).join('')+`<path d="M0 132 Q150 124 300 134 V150 H0Z" fill="${b}"/>`;break;
 case 'space':g=`<rect width="300" height="150" fill="${a}"/>`+[...Array(22)].map((_,i)=>`<circle cx="${(i*67)%300}" cy="${(i*41)%150}" r="${i%3?1:1.6}" fill="#fff" opacity=".8"/>`).join('')+`<circle cx="250" cy="150" r="70" fill="${b}"/><path d="M90 90 l40 -16 l8 8 l-40 16Z" fill="${c}"/><circle cx="118" cy="80" r="5" fill="${d}"/>`;break}
 return `<svg viewBox="0 0 300 150" width="100%" preserveAspectRatio="xMidYMid slice" style="display:block;height:${h}px">${sky}${g}</svg>`}

function scoutUI(g){if(g==='Animation')return '';W.scout=W.scout||[];W.scR=W.scR||'fit';
 let L=scoutAvail().map(s=>({s,f:scoutFit(s,g)}));const sel=L.filter(x=>W.scout.includes(x.s.k));
 if(W.scR==='fit')L=L.filter(x=>x.f>=2);else if(W.scR!=='all')L=L.filter(x=>x.s.r===W.scR);
 L=sel.concat(L.filter(x=>!W.scout.includes(x.s.k))).sort((a,b)=>(W.scout.includes(b.s.k)-W.scout.includes(a.s.k))||(b.f-a.f));
 const tot=W.scout.reduce((t,k)=>t+scoutCost(SCOUT.find(x=>x.k===k)),0);
 return `<div class="card sc30"><div class="row"><b>📍 Location shoots</b><small class="muted">${W.scout.length}/${SC_MAX} · ${tot?'+'+M(tot):'optional'}</small></div><p class="muted" style="font-size:12.5px;margin:4px 0 8px;text-transform:none">Pick up to ${SC_MAX} places from ${scoutAvail().length} around the world. Locations that suit a <b>${g}</b> film add scale, buzz and better reviews. Each extra one adds a little less.</p>
 ${W.scout.length?`<div class="sc30sel">${W.scout.map(k=>{const s=SCOUT.find(x=>x.k===k);return `<button class="sc30chip" onclick="scoutPick('${k}')">${s.ic} ${s.n} ✕</button>`}).join('')}</div>`:''}
 <div class="chips sc30f">${SC_REG.map(r=>`<button class="${W.scR===r[0]?'on':''}" onclick="W.scR='${r[0]}';W._scX=0;scoutRe()">${r[1]}</button>`).join('')}</div>
 <div class="sc30row">${L.map(({s,f})=>{const on=W.scout.includes(s.k);return `<button class="sc30c ${on?'on':''}" onclick="scoutPick('${s.k}')"><div class="sc30i">${scoutArt(s,170,92)}${f>=3?'<span class="sc30fit">✨ Perfect fit</span>':f>=2?'<span class="sc30fit ok">👍 Good fit</span>':''}${on?'<span class="sc30on">✓</span>':''}</div><b>${s.ic} ${s.n}</b><small>${s.w} · ${M(scoutCost(s))}</small><small class="sc30r">⚠️ ${s.risk}</small></button>`}).join('')||'<p class="muted" style="padding:10px">No places here for this era.</p>'}</div></div>`}
function scoutRe(){const y=window.scrollY;wiz();try{window.scrollTo(0,y);const r=document.querySelector('.sc30row');if(r)r.scrollLeft=W._scX||0}catch(e){}}
function scoutPick(k){W.scout=W.scout||[];const i=W.scout.indexOf(k);if(i>=0)W.scout.splice(i,1);else{if(W.scout.length>=SC_MAX)return toast(`Up to ${SC_MAX} locations per film`);W.scout.push(k)}scoutRe()}
document.addEventListener&&document.addEventListener('scroll',e=>{try{if(e.target&&e.target.classList&&e.target.classList.contains('sc30row'))W._scX=e.target.scrollLeft}catch(_){}},true);

/* era-appropriate notes for the production hubs */
const LOC_OLD={'Los Angeles':'Home of the studios and the backlots','Atlanta':'Cheap crews and Southern scenery','New York':'Iconic streets and Broadway talent','London':'World-class stages and classic crews','Vancouver':'Cheap, flexible "Hollywood North"','New Zealand':'Epic landscapes, far from everything','Budapest':'Low costs and old-world architecture'};
wiz=(function(o){return function(){const keep=LOCS.map(l=>l.note);try{if(S.year<2020)LOCS.forEach(l=>{if(LOC_OLD[l.k])l.note=LOC_OLD[l.k]})}catch(e){}try{return o.apply(this,arguments)}finally{LOCS.forEach((l,i)=>l.note=keep[i])}}})(wiz);

/* greenlight: pay for the trip, remember it on the project */
greenlight=(function(o){return function(){const sc=(W&&W.scout||[]).slice();const n=S.projects.length;o.apply(this,arguments);try{if(sc.length&&S.projects.length>n){const p=S.projects[S.projects.length-1];p.scout=sc;const cost=sc.reduce((t,k)=>t+scoutCost(SCOUT.find(x=>x.k===k),p.genre),0);S.cash-=cost;p.prod=(p.prod||0)+cost;
 const names=sc.map(k=>SCOUT.find(x=>x.k===k).n);story({icon:'📍',paper:'trade',head:`${esc(S.name)} will shoot <i>${esc(p.title)}</i> on location: ${esc(names.join(' and '))}.`})}}catch(e){console.error(e)}}})(greenlight);

/* on-location moments while filming */
function scoutTick(){const live=(S.projects||[]).filter(p=>p.scout&&p.scout.length&&p.sch&&phaseOf(p)==='shoot');if(!live.length||Math.random()>.35)return;const p=pick(live);const s=SCOUT.find(x=>x.k===pick(p.scout));if(!s)return;const why=(t,v)=>(p._why=p._why||[]).push(t.concat([v]));
 const D=person(p.dir)||{n:'Your director'};const r=Math.random();
 if(r<.4){const c=+(.25*I()).toFixed(2);QUEUE.push(()=>playScene({who:person(p.dir),role:p.title,tag:'On location',bg:'street',log:['📍',`${s.risk} at ${s.n}`],lines:[`${s.ic} <b>${s.risk}</b> hit the <i>${esc(p.title)}</i> unit in ${esc(s.w)}.`,`"We can wait it out, or pack up and fake it on a soundstage," ${esc(D.n.split(' ')[0])} says.`],
  choices:[{l:`Wait it out (${M(c)})`,f:()=>{S.cash-=c;p.chem=(p.chem||0)+1;why(['⏳',`Waiting out the ${s.risk.toLowerCase()} at ${s.n} kept the real scenery`],1);return{say:'Three days later the sky clears. Worth it.',note:'Chemistry +1'}}},{l:'Move to a soundstage',f:()=>{p.scoutLost=(p.scoutLost||0)+1;why(['🎭',`Part of the ${s.n} shoot was faked on a soundstage`],-1);return{say:'"It\'ll look fine. Probably."',note:'Location bonus reduced'}}}]},runQueue))}
 else if(r<.75){p.chem=(p.chem||0)+2;why(['🌅',`A golden-hour shot at ${s.n} became the film's signature image`],1);story({icon:'🌅',paper:'trade',head:`Crew members say a sunset shot at ${esc(s.n)} for <i>${esc(p.title)}</i> is "the most beautiful thing they've ever filmed".`})}
 else{p.hype=(p.hype||0)+3;why(['📸',`Locals and tourists crowded the ${s.n} set, spreading the word`],1);story({icon:'📸',paper:'tabloid',head:`Fans swarm the <i>${esc(p.title)}</i> set at ${esc(s.n)}, hoping to glimpse the stars.`,post:{h:pick(FANH),text:`literally saw them filming ${p.title} in ${s.w} today!! 😱📍`}})}}
const _nm30=nextMonth;nextMonth=function(){const r=_nm30.apply(this,arguments);try{if(S&&!S.over)scoutTick()}catch(e){console.error(e)}return r};

/* release: the scenery shows on screen */
releaseFilm=(function(o){return function(p){try{if(p.scout&&p.scout.length){const g=p.genre;p._why=p._why||[];const W8=[1,.6,.4,.3,.2];
 const L=p.scout.map((k,i)=>{const s=SCOUT.find(x=>x.k===k);return s?{s,f:scoutFit(s,g)-(i<(p.scoutLost||0)?2:0)}:null}).filter(Boolean).sort((a,b)=>b.f-a.f);let bonus=0,hy=0;
 L.forEach((x,i)=>{const w=W8[i]||.15;if(x.f>=3){bonus+=3*w;hy+=3*w}else if(x.f>=2){bonus+=1.5*w;hy+=1*w}});p.chem=(p.chem||0)+bonus;p.hype=(p.hype||0)+hy;
 const good=L.filter(x=>x.f>=2),off=L.filter(x=>x.f<2);
 if(good.length)p._why.push([good[0].s.ic,good.length>1?`Shot across ${good.length} stunning locations (${good.slice(0,3).map(x=>x.s.n).join(', ')}${good.length>3?'…':''})`:`${good[0].s.n} gave the film breathtaking scale`,1]);
 if(off.length)p._why.push([off[0].s.ic,`${off.map(x=>x.s.n).slice(0,2).join(' and ')} looked pretty but felt out of place in a ${g}`,0])}}catch(e){}return o(p)}})(releaseFilm);

try{const b=SCOUT.find(s=>s.k==='berlin');if(b)b.ye=1989}catch(e){}
