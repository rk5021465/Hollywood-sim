/* ===== DATA ===== */
const GENRES=['Action','Adventure','Comedy','Drama','Horror','Thriller','Sci-Fi','Fantasy','Romance','Musical','Western','War','Crime','Animation','Family','Documentary'];
// spec = spectacle weight, crit = critics bias, fam = family/merch appeal, intl = overseas appeal
const G={
 Action:{spec:1,crit:-3,fam:.5,intl:1.35,c:['#7a1d1d','#e0483a']},
 Adventure:{spec:.9,crit:0,fam:.8,intl:1.3,c:['#5a3b12','#e3a13a']},
 Comedy:{spec:.25,crit:-2,fam:.5,intl:.7,c:['#6b4c0f','#f2c84b']},
 Drama:{spec:.1,crit:6,fam:.1,intl:.8,c:['#1d2a44','#8fa6c9']},
 Horror:{spec:.35,crit:-6,fam:0,intl:1.05,c:['#14090c','#b3122e']},
 Thriller:{spec:.4,crit:2,fam:.1,intl:1,c:['#0d1a1f','#4fb3bf']},
 'Sci-Fi':{spec:1,crit:0,fam:.7,intl:1.35,c:['#0b1440','#5b8def']},
 Fantasy:{spec:.95,crit:-1,fam:.8,intl:1.35,c:['#24123d','#a77be8']},
 Romance:{spec:.15,crit:0,fam:.2,intl:.85,c:['#3d1225','#ed93b1']},
 Musical:{spec:.6,crit:2,fam:.6,intl:.8,c:['#3a0f2e','#f0c96a']},
 Western:{spec:.6,crit:1,fam:.3,intl:.8,c:['#4a2a14','#e8a25c']},
 War:{spec:.8,crit:4,fam:.1,intl:.9,c:['#2b2f1d','#a8b26a']},
 Crime:{spec:.35,crit:4,fam:.05,intl:.95,c:['#111318','#c9a24b']},
 Animation:{spec:.7,crit:2,fam:1,intl:1.4,c:['#0e3a4a','#5dcaa5']},
 Family:{spec:.4,crit:-1,fam:1,intl:1.1,c:['#13405a','#9fe1cb']},
 Documentary:{spec:0,crit:8,fam:.2,intl:.5,c:['#1f1f22','#d3d1c7']}};
// decade heat baselines (decade -> multiplier); missing = 1
const DECADE_HEAT={
 Musical:{1930:1.4,1940:1.35,1950:1.25,1960:1.1,1970:.8,1980:.75,1990:.8,2000:.9,2010:.9,2020:.85},
 Western:{1930:1.15,1940:1.3,1950:1.4,1960:1.2,1970:.9,1980:.65,1990:.75,2000:.7,2010:.7,2020:.7},
 War:{1940:1.45,1950:1.15,1960:1.1,1970:.95,1980:.9,1990:1,2000:.95},
 'Sci-Fi':{1930:.75,1940:.75,1950:1.1,1960:.9,1970:1.15,1980:1.3,1990:1.2,2000:1.15,2010:1.2,2020:1.1},
 Horror:{1930:1.15,1950:1.05,1970:1.25,1980:1.35,1990:1,2000:1.1,2010:1.2,2020:1.15},
 Animation:{1930:.9,1940:1,1950:1,1960:.9,1970:.7,1980:.8,1990:1.25,2000:1.3,2010:1.3,2020:1.2},
 Fantasy:{1930:.8,1950:.8,1980:1,1990:1,2000:1.35,2010:1.2},
 Crime:{1930:1.25,1940:1.2,1970:1.25,1990:1.15},
 Documentary:{1930:.6,1950:.6,1970:.7,2000:.95,2010:.9},
 Action:{1930:.8,1940:.85,1950:.85,1960:.95,1980:1.3,1990:1.3,2000:1.2,2010:1.2,2020:1.15},
 Adventure:{1930:1.1,1980:1.25,2000:1.15,2010:1.2},
 Romance:{1930:1.2,1940:1.15,1950:1.15,1990:1.1,2010:.85},
 Comedy:{1980:1.15,1990:1.15,2010:.9,2020:.85},
 Thriller:{1960:1.15,1990:1.2},
 Drama:{1940:1.05,1970:1.15}};
const THEMES=[
 {n:'Haunted house',good:['Horror','Comedy','Thriller'],bad:['Musical','War','Documentary','Western']},
 {n:'Heist',good:['Crime','Thriller','Action','Comedy'],bad:['Musical','Animation','Documentary','Horror']},
 {n:'Outer space',good:['Sci-Fi','Adventure','Animation','Horror'],bad:['Western','Romance','Crime']},
 {n:'Love triangle',good:['Romance','Drama','Comedy','Musical'],bad:['Horror','War','Animation','Documentary']},
 {n:'Revenge',good:['Western','Action','Crime','Thriller'],bad:['Family','Musical','Animation']},
 {n:'Coming of age',good:['Drama','Comedy','Family','Romance'],bad:['War','Western']},
 {n:'Time travel',good:['Sci-Fi','Adventure','Comedy','Fantasy'],bad:['Documentary','Western','Crime']},
 {n:'Monsters',good:['Horror','Sci-Fi','Fantasy','Animation'],bad:['Romance','Drama','Documentary']},
 {n:'Detectives',good:['Crime','Thriller','Comedy','Drama'],bad:['Musical','Fantasy','Animation']},
 {n:'Sports',good:['Drama','Comedy','Family','Documentary'],bad:['Horror','Sci-Fi','Fantasy']},
 {n:'Royalty',good:['Drama','Fantasy','Musical','Romance'],bad:['Horror','Sci-Fi','Western']},
 {n:'Small town',good:['Drama','Comedy','Horror','Family'],bad:['Sci-Fi','War']},
 {n:'Robots',good:['Sci-Fi','Animation','Action','Family'],bad:['Western','Romance','Musical']},
 {n:'Treasure hunt',good:['Adventure','Family','Action','Animation'],bad:['Drama','Horror','War','Documentary']},
 {n:'Survival',good:['Thriller','Adventure','War','Horror'],bad:['Musical','Comedy','Romance']},
 {n:'Superheroes',good:['Action','Sci-Fi','Animation','Fantasy'],bad:['Drama','Romance','Documentary','Western'],from:1978},
 {n:'The war front',good:['War','Drama','Documentary','Action'],bad:['Comedy','Musical','Horror']},
 {n:'Showbiz',good:['Musical','Comedy','Drama','Documentary'],bad:['War','Horror','Sci-Fi']}];
const SOURCES=[['Original script',1,0],['Bestselling novel',1.25,6],['True story',1.1,4],['Comic book',1.2,3],['Stage hit',1.15,5]];
const WORDS={
 a:['Iron','Midnight','Thunder','Steel','Final','Desert','Hard','Rogue','Silver','Night','Burning','Last','Savage','Broken','Golden','Crimson','Lost','Wild','Silent','Dark','Hollow','Shadow','Distant','Electric','Paper','Velvet','Northern','Secret','Long','Endless'],
 b:{Action:['Justice','Strike','Run','Squad','Vendetta','Target','Force','Pursuit'],Adventure:['Quest','Kingdom','Expedition','Map','Island','Voyage','Treasure','Passage'],Comedy:['Business','Neighbours','Vacation','Wedding','Money','Trouble','Roommates','Weekend'],Drama:['Summer','River','Promise','Harvest','Letters','Country','Hours','Season'],Horror:['House','Lake','Hour','Woods','Visitor','Cellar','Doll','Tenant'],Thriller:['Witness','Contract','Code','Alibi','Signal','Window','Stranger','Deadline'],'Sci-Fi':['Frontier','Drift','Protocol','Colony','Station','Odyssey','Horizon','Machine'],Fantasy:['Crown','Dragon','Realm','Spell','Throne','Forest','Oracle','Sword'],Romance:['Love','Kiss','Hearts','Affair','Chance','Waltz','Embrace','Serenade'],Musical:['Melody','Broadway','Rhythm','Song','Parade','Stage','Ballroom','Encore'],Western:['Trail','Canyon','Gun','Ranch','Frontier','Stagecoach','Mesa','Outlaw'],War:['Front','Battalion','Beachhead','Ridge','Convoy','Bridge','Sky','Ceasefire'],Crime:['Syndicate','Street','Racket','Dollar','Badge','Hustle','Family','Avenue'],Animation:['Friends','Adventure','Kingdom','Journey','Island','Wishes','Toys','Star'],Family:['Summer','Pup','Christmas','Holiday','Wish','Garden','Treehouse','Hero'],Documentary:['Truth','Planet','Voices','Record','Witness','Story','Ocean','Frontline']}};
const LOGLINES={
 'Haunted house':['A family buys their dream home and its previous owners never left.','Strangers win a night in a mansion with a deadly history.'],
 'Heist':['Five specialists plan one last job at the city\'s safest bank.','A retired thief is pulled back for an impossible robbery.'],
 'Outer space':['A lone pilot picks up a signal from the edge of the galaxy.','Colonists wake 200 years early on a dying ship.'],
 'Love triangle':['Two brothers fall for the same woman one summer.','A bride-to-be meets her first love the week of her wedding.'],
 'Revenge':['A drifter returns to the town that left him for dead.','A widow hunts the gang that ruined her life.'],
 'Coming of age':['Four friends share one last summer before life pulls them apart.','A shy teenager finds her voice in a school band.'],
 'Time travel':['A scientist has one hour to fix a mistake he made in 1955.','A woman keeps waking up on the same day, ten years apart.'],
 'Monsters':['Something huge is rising from the harbour.','A creature escapes the lab and heads for the suburbs.'],
 'Detectives':['A tired detective takes the case nobody else will touch.','A crime novelist is suspected of the murder she wrote.'],
 'Sports':['A washed-up coach takes on a team nobody believes in.','A girl from nowhere fights her way to the title.'],
 'Royalty':['A young queen must choose between her crown and her heart.','A prince trades places with a stable boy.'],
 'Small town':['A quiet town hides a secret everyone agreed to forget.','A big-city doctor gets stuck in a tiny town.'],
 'Robots':['A household robot starts asking questions.','A boy and his robot run away to find its maker.'],
 'Treasure hunt':['An old map sends three kids on the adventure of a lifetime.','A professor races rivals to a lost temple.'],
 'Survival':['Plane crash survivors face a frozen mountain.','A diver is trapped below the ice with hours of air left.'],
 'Superheroes':['An ordinary mechanic wakes up with impossible strength.','A team of misfits must save a city that hates them.'],
 'The war front':['A platoon must hold a bridge for one more day.','A nurse on the front line risks everything for a stranger.'],
 'Showbiz':['A chorus girl gets her big break the night the star falls ill.','A failing theatre company bets everything on one show.']};
const ACTORS=[['Brad Pitts','m',72,62,1963],['Meryl Streak','f',90,70,1949],['Tom Cruz','m',66,58,1962],['Jodie Faster','f',80,55,1962],['Al Pachinko','m',86,82,1940],['Robert De Nero','m',88,84,1943],['Diane Keatin','f',78,66,1946],['Jack Nickelsen','m',84,86,1937],['Faye Dunnaway','f',76,74,1941],['Warren Beatty-Boop','m',70,76,1937],['Sissy Spaceship','f',74,52,1949],['Burt Reynold','m',58,80,1936],['Goldie Hound','f',64,60,1945],['Clint Eastwould','m',72,88,1930],['Jane Fondue','f',76,72,1937],['Dustin Huffman','m',84,74,1937],['Barbra Strident','f',74,78,1942],['Richard Dreyfish','m',72,60,1947],['Sally Fieldz','f',74,58,1946],['Gene Hackmann','m',82,70,1930],['Harrison Fard','m',70,48,1942],['Carrie Fischer','f',62,44,1956],['Kurt Rusell','m',60,40,1951],['Michelle Pfeiffle','f',66,34,1958],['Bill Murrey','m',70,46,1950],['Eddie Murfee','m',68,38,1961],['Sigourney Weever','f',74,36,1949],['Mel Gibsen','m',62,32,1956],['Denzel Washtun','m',82,40,1954],['Julia Robberts','f',70,30,1967],['Leo DiCaprino','m',78,28,1974],['Kate Winslate','f',82,26,1975],['Will Smithers','m',66,34,1968],['Cate Blanchette','f',88,24,1969],
 ['Clark Gabble','m',74,88,1901],['Bette Davish','f',86,84,1908],['Cary Grand','m',78,86,1904],['Katharine Hepbird','f',88,82,1907],['Jimmy Stewert','m',80,78,1908],['Greta Garbow','f',82,90,1905],['Humphrey Bogeart','m',80,74,1899],['Judy Garlands','f',76,72,1922],['Fred Astern','m',74,80,1899],['Ingrid Bergmann','f',84,70,1915],['Marlon Brandoh','m',90,60,1924],['Marilyn Monrow','f',68,62,1926],['Audrey Hepburnt','f',80,58,1929],['Paul Newmen','m',82,50,1925],['Grace Kellie','f',72,54,1929],['James Dien','m',78,40,1931]];
const DIRECTORS=[['S. Spielbergo','m',88,78,['Sci-Fi','Adventure'],1946],['G. Lucash','m',76,70,['Sci-Fi','Fantasy'],1944],['M. Scorsazy','m',92,74,['Crime','Drama'],1942],['F. F. Copola','m',90,80,['Crime','Drama'],1939],['W. Allan','m',84,62,['Comedy','Romance'],1935],['B. De Pulma','m',74,56,['Thriller','Horror'],1940],['J. Carpentar','m',72,44,['Horror','Sci-Fi'],1948],['S. Kubrik','m',94,82,['Drama','War'],1928],['R. Altmann','m',80,52,['Drama','Comedy'],1925],['N. Ephrun','f',70,40,['Romance','Comedy'],1941],['J. Landes','m',66,46,['Comedy','Horror'],1950],['R. Scotch','m',78,38,['Sci-Fi','War'],1937],['W. Craven','m',64,34,['Horror','Thriller'],1939],['K. Bigelowe','f',84,30,['Action','War'],1951],['J. Camerun','m',86,30,['Sci-Fi','Action'],1954],['Q. Tarantella','m',86,24,['Crime','Action'],1963],['G. del Torro','m',84,20,['Fantasy','Horror'],1964],['S. Coppolina','f',80,18,['Drama','Romance'],1971],['J. Lasseterr','m',82,22,['Animation','Family'],1957],
 ['A. Hitchcok','m',94,86,['Thriller','Horror'],1899],['J. Ford-ish','m',86,80,['Western','War'],1894],['B. Wildur','m',90,74,['Comedy','Crime'],1906],['F. Capro','m',84,78,['Drama','Comedy'],1897],['O. Wellez','m',94,60,['Drama','Crime'],1915],['V. Flemming','m',78,70,['Adventure','Musical'],1889],['W. Disnee','m',82,84,['Animation','Family'],1901],['H. Hawkes','m',82,68,['Western','Comedy'],1896],['E. Kazan','m',86,58,['Drama','Crime'],1909],['G. Kelley','m',74,62,['Musical','Romance'],1912],['D. Lean','m',90,60,['War','Adventure'],1908]];
const FIRST={m:['Max','Theo','Leo','Cal','Nico','Dex','Finn','Rex','Jack','Omar','Raj','Kenji','Luca','Mateo','Sam','Eli'],f:['Lana','Ruby','Ava','June','Ivy','Rosa','Mae','Opal','Priya','Mei','Zara','Nina','Clara','Leah','Sofia','Hana']};
const LAST=['Carrow','Delane','Whitlock','Marlowe','Sterling','Ashby','Fairfax','Holloway','Lindqvist','Pryce','Quill','Vance','Wilder','Yates','Beaumont','Okafor','Kapoor','Tanaka','Moreno','Castillo','Nakamura','Adeyemi','Rossi','Novak'];
const RIVALS=[{n:'Warner Sisters',c:'#5B8DEF',bias:'Action',p:'The franchise machine'},{n:'Paramountain',c:'#9B7BEA',bias:'Drama',p:'The prestige house'},{n:'Universe-al',c:'#3FB27F',bias:'Sci-Fi',p:'The spectacle studio'},{n:'Crimson Lion',c:'#E9A23B',bias:'Comedy',p:'The crowd pleaser'},{n:'Midnight Mill',c:'#E5484D',bias:'Horror',p:'The cheap horror mill'}];
const CRITICS=[{n:'Vera Sterling',o:'The Trade Ledger',b:{Drama:6,War:4,Documentary:6,Action:-4}},{n:'Hal Monroe',o:'Popcorn Weekly',b:{Action:6,Comedy:5,'Sci-Fi':4,Drama:-4}},{n:'Ingrid Novak',o:'Cinema Quarterly',b:{Drama:8,Crime:5,Musical:-5,Family:-6}},{n:'Marcus Dell',o:'Fright & Fantasy',b:{Horror:10,'Sci-Fi':6,Fantasy:6,Romance:-6}},{n:'Ruth Calder',o:'The Daily Star',b:{Romance:5,Family:5,Musical:5,Horror:-5}}];
const QUOTES=[[85,['A masterpiece. See it twice.','The best film of the year, easily.','Pure movie magic from first frame to last.','Unforgettable. Hollywood at its very best.']],[70,['A crowd-pleaser with real heart.','Smart, stylish and hugely entertaining.','Confident filmmaking that mostly delivers.','Worth every cent of the ticket.']],[55,['Fun while it lasts, forgotten by dinner.','Uneven, but the cast keeps it afloat.','Good moments in search of a better film.','A pleasant enough evening out.']],[40,['A muddled, overlong disappointment.','All gloss, very little heart.','You have seen this before, done better.','The script lets everyone down.']],[0,['A disaster on every level.','Two hours I will never get back.','Avoid at all costs.','Baffling from start to finish.']]];
const FESTIVALS=[{n:'Sundown Film Festival',wk:3,b:'indies'},{n:'Côte Azure Festival',wk:20,b:'prestige'},{n:'Lido Film Festival',wk:36,b:'prestige'},{n:'Lakeshore Festival',wk:37,b:'audience'}];
const BLD={
 stage:{n:'Sound stages',d:'Each stage shoots one film at a time.',max:4,cost:l=>2.4*l},
 writers:{n:"Writers' bungalow",d:'Better rewrites and more scripts on the market.',max:5,cost:l=>.7*l},
 post:{n:'Post-production house',d:'Faster, better editing, effects and sound.',max:5,cost:l=>.9*l},
 marketing:{n:'Marketing office',d:'Every marketing dollar reaches more people.',max:5,cost:l=>.9*l},
 lab:{n:'Research lab',d:'Develops new film technology.',max:5,cost:l=>1.1*(l+1)},
 backlot:{n:'Backlot sets',d:'Standing sets cut shooting costs for matching genres.',max:3,cost:l=>1.6*(l+1)},
 park:{n:'Theme park',d:'Rides based on your film franchises earn money every week.',max:3,cost:l=>25*(l+1)},
 tower:{n:'Executive tower',d:'Your office. Grows as your studio rises.',max:0,cost:()=>0}};
const BACKLOTS=[['Western town',['Western','Action']],['City street',['Crime','Thriller','Comedy','Drama']],['Space set',['Sci-Fi','Fantasy','Adventure']]];
const TIER={low:{n:'Low budget',prod:1.4,weeks:4,screens:.62,pa:.6,m:1},mid:{n:'Mid budget',prod:4.5,weeks:6,screens:1,pa:2,m:2.4},high:{n:'Tentpole',prod:11,weeks:8,screens:1.25,pa:5,m:5}};
const LEVELS=[{n:'Lean',m:.75,pv:30,d:'Fewer sets, smaller crew'},{n:'Standard',m:1,pv:55,d:'A solid, professional shoot'},{n:'Lavish',m:1.6,pv:85,d:'Big sets, more spectacle'}];
const PACES=[{n:'Rushed',w:.75,q:.92,d:'Faster and cheaper, lower quality'},{n:'Normal',w:1,q:1,d:'The usual schedule'},{n:'Careful',w:1.3,q:1.06,d:'More takes, better quality'}];
const RANKS=[[0,'Garage indie'],[60,'Small studio'],[150,'Major studio'],[260,'Hollywood legend']];
const STARTS=[{y:1930,n:'Golden Age',d:'Talkies, musicals, studio contracts',cash:3},{y:1950,n:'TV threat',d:'Westerns, epics, widescreen',cash:5},{y:1977,n:'Blockbuster era',d:'Summer tentpoles, VHS ahead',cash:8},{y:2000,n:'Digital age',d:'CGI, DVD boom, franchises',cash:22}];
const DIFFS=[{n:'Relaxed',d:'More cash, kinder luck',cash:1.5,luck:.9,rival:.85,scandal:.5},{n:'Standard',d:'The intended balance',cash:1,luck:1,rival:1,scandal:1},{n:'Mogul',d:'Less cash, tougher rivals',cash:.65,luck:1.1,rival:1.15,scandal:1.5}];
// home revenue as share of box office, by year
const HOME=[[0,.1,'Re-releases'],[1955,.12,'TV rights'],[1980,.22,'VHS and TV'],[1997,.32,'DVD and TV'],[2008,.26,'Digital and streaming']];
const INTL=[[0,.4,0],[1950,.45,0],[1960,.55,0],[1980,.7,0],[1990,1,0],[2000,1.3,.08],[2010,1.6,.25],[2020,1.45,.15]]; // [year, intl×domestic, china share of intl]
const TECH=[
 {id:'color',n:'Three-strip colour',y:1935,c:30,d:'Colour film. Spectacle +8 for musicals, fantasy and adventure, +4 for all.'},
 {id:'tvsales',n:'TV syndication',y:1955,c:25,d:'Sell old films to TV. Unlocks TV income.',dist:true},
 {id:'wide',n:'Widescreen',y:1953,c:30,d:'Epic screens. Openings +6%.'},
 {id:'stereo',n:'Stereo sound',y:1975,c:35,d:'Richer sound. Quality +2.'},
 {id:'steadicam',n:'Steadicam',y:1976,c:35,d:'Smooth moving shots. Quality +2.'},
 {id:'animatronics',n:'Animatronics',y:1975,c:40,d:'Practical creatures. Spectacle +10 for horror, sci-fi and fantasy.'},
 {id:'vhs',n:'Home video',y:1980,c:40,d:'VHS tapes. Home income ×1.15.',dist:true},
 {id:'imax',n:'Large-format screens',y:1990,c:45,d:'Tentpole openings +10%.'},
 {id:'cgi',n:'Computer effects',y:1993,c:60,d:'CGI. Spectacle +15 for action, sci-fi, fantasy, adventure, animation.'},
 {id:'dvd',n:'DVD',y:1997,c:45,d:'The DVD boom. Home income ×1.15.',dist:true},
 {id:'digital',n:'Digital cameras',y:2002,c:50,d:'Shooting costs −15%.'},
 {id:'mocap',n:'Motion capture',y:2004,c:55,d:'Digital characters. Animation and fantasy quality +3.'},
 {id:'stream',n:'Own streaming service',y:2007,c:70,d:'Launch your own streaming platform from the Empire screen.',dist:true},
 {id:'3d',n:'Digital 3D',y:2009,c:50,d:'Tentpole openings +8%, but audiences tire of it.'},
 {id:'virtual',n:'LED virtual sets',y:2019,c:65,d:'Shoots take 20% fewer weeks.'},
 {id:'ai',n:'AI tools',y:2023,c:60,d:'Post costs −10%, but unions get angry.'}];
const ACH=[
 ['first','Lights, camera','Release your first film'],['hit','In the black','Make a profit on a film'],['no1','Number one','Open at number one'],['nka','Nobody knows anything','A low-budget film grosses over 12× its cost'],['goldie','Goldie winner','Win any Goldie'],['sweep','Clean sweep','Win all three Goldies in one year'],['fest','Festival darling','Win a festival prize'],['sequel','Here we go again','Release a sequel'],['trilogy','Trilogy','Release a third film in one franchise'],['teamup','Universe builder','Release a team-up film'],['flop','Total disaster','Lose more than $20M (in today\'s money) on one film'],['major','Major player','Reach Major studio rank'],['legend','Hollywood legend','Reach the top rank'],['streamer','Streaming wars','Launch your own streaming service'],['park','Happiest place','Open a theme park'],['ipo','Ring the bell','Take your studio public'],['strike','Picket lines','Survive a strike'],['decade','Ten years in','Run your studio for ten years']];
const EVENTS_HIST=[
 {y:1934,w:26,t:'The Production Code is now strictly enforced. Crime and horror films face tougher censors.',f:S=>{S.mods.code=1}},
 {y:1941,w:50,t:'America enters the war. War films and musicals are in demand.',f:S=>{S.heat.War=1.4;S.heat.Musical=1.3}},
 {y:1945,w:34,t:'The war is over. Audiences flock back to theaters.',f:S=>{S.mods.attend=1.22}},
 {y:1948,w:18,t:'The Supreme Court\'s antitrust ruling forces studios to sell their theater chains.',f:S=>{S.mods.attend=1.1}},
 {y:1950,w:10,t:'Television is in millions of homes. Theater attendance is falling.',f:S=>{S.mods.attend=1.08}},
 {y:1968,w:44,t:'A new ratings system replaces the old Production Code.',f:S=>{S.mods.code=0}},
 {y:1975,w:25,t:'A shark movie invents the summer blockbuster. Summer releases are worth more than ever.',f:S=>{S.mods.summer=1.12}},
 {y:1982,w:5,t:'Video stores are opening in every town.',f:()=>{}},
 {y:2001,w:37,t:'A national tragedy shakes the country. Audiences want comfort and escapism.',f:S=>{S.heat.Family=1.3;S.heat.Fantasy=1.3}},
 {y:2008,w:38,t:'A financial crisis hits. Banks charge more for loans.',f:S=>{S.mods.rate=.14}},
 {y:2012,w:1,t:'China is now the world\'s fastest-growing film market.',f:()=>{}},
 {y:2020,w:11,t:'A pandemic closes theaters nationwide. Films can only go to home release for now.',f:S=>{S.mods.closed=S.week+28}},
 {y:2020,w:40,t:'Theaters are slowly reopening, with limited audiences.',f:S=>{S.mods.attend=.7}},
 {y:2022,w:20,t:'Audiences are back in theaters.',f:S=>{S.mods.attend=.92}}];
const HIST_STRIKES=[[1960,10,16],[1988,10,22],[2007,45,14],[2023,19,20]];
