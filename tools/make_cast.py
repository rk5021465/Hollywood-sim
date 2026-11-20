import random
random.seed(1970)

ETH = {
 'Caucasian American': dict(f=['Evelyn','Claire','Margaret','Hazel','Lillian','Nora','Vivian','June','Dorothy','Ruth','Ivy','Celeste','Maren','Tessa','Greta','Audrey'],
   m=['Walter','Henry','Graham','Elliot','Russell','Warren','Calvin','Arthur','Dean','Lowell','Jasper','Silas','Rhett','Conrad','Miles','Byron'],
   l=['Hartley','Whitmore','Calloway','Prescott','Danforth','Ashby','Kensington','Holloway','Marlowe','Thorne','Winslow','Sterling','Halvorsen','Lockwood','Pembroke','Fairbanks'],
   skin=['fair','pale','light rosy','lightly tanned'],hair=['blonde','light brown','dark brown','auburn','red','black','strawberry blonde'],eyes=['blue','green','grey','hazel','brown']),
 'African-American': dict(f=['Imani','Nia','Zora','Coretta','Alicia','Tasha','Monique','Raven','Simone','Kendra','Ayanna','Dionne','Jasmine','Loretta'],
   m=['Darnell','Marcus','Terrence','Isaiah','Malik','Andre','Desmond','Jerome','Clarence','Xavier','Reggie','Lamont','Cedric','Otis'],
   l=['Whitfield','Dawson','Merriweather','Holloway','Bankston','Jefferies','Fairley','Coleman','Haynes','Ellison','Pruitt','Gaines','Sutton','Ramsey'],
   skin=['deep brown','warm brown','dark','medium brown'],hair=['black','dark brown'],eyes=['brown','dark brown','hazel']),
 'Nigerian': dict(f=['Adaeze','Chiamaka','Funmilayo','Ngozi','Ifeoma','Temitope','Yetunde','Amara'],m=['Chukwuemeka','Babatunde','Olumide','Ikenna','Tunde','Obinna','Femi','Kelechi'],
   l=['Okafor','Adeyemi','Nwosu','Balogun','Eze','Okonkwo','Adebayo','Chukwu'],skin=['very dark','deep brown','dark'],hair=['black'],eyes=['dark brown','brown']),
 'Ghanaian': dict(f=['Akosua','Abena','Efua','Adwoa'],m=['Kwame','Kofi','Yaw','Kojo'],l=['Mensah','Asante','Boateng','Owusu'],skin=['very dark','deep brown'],hair=['black'],eyes=['dark brown']),
 'Mexican': dict(f=['Ximena','Guadalupe','Marisol','Paloma','Inés','Valentina','Rocío','Catalina'],m=['Mateo','Joaquín','Emiliano','Rafael','Diego','Santiago','Arturo','Lorenzo'],
   l=['Villaseñor','Castañeda','Montoya','Espinoza','Cárdenas','Quintero','Salazar','Arreola'],skin=['olive','tan','warm tan','light olive'],hair=['black','dark brown','brown'],eyes=['brown','dark brown','hazel']),
 'Puerto Rican': dict(f=['Yaritza','Marisela','Nayeli','Coral'],m=['Javier','Ismael','Héctor','Rubén'],l=['Figueroa','Rivera-Ortiz','Colón','Marrero'],skin=['tan','olive','caramel'],hair=['black','dark brown','dark curly'],eyes=['brown','dark brown']),
 'Brazilian': dict(f=['Luana','Thaís','Bianca','Raíssa'],m=['Thiago','Caio','Rodrigo','Leandro'],l=['Albuquerque','Monteiro','Bittencourt','Figueiredo'],skin=['tan','golden tan','olive','light brown'],hair=['dark brown','black','caramel highlighted'],eyes=['brown','hazel','green']),
 'Chinese': dict(f=['Mei','Xiulan','Lian','Yuting','Qing','Shuang','Ruoxi','Jiayi'],m=['Wei','Jun','Haoran','Zhiwei','Liang','Bowen','Tao','Yichen'],
   l=['Zhao','Lin','Huang','Shen','Guo','Tang','Xu','Feng'],skin=['light','fair','light warm'],hair=['black'],eyes=['dark brown']),
 'Japanese': dict(f=['Haruka','Aiko','Natsumi','Yui','Sakura','Emi','Rin','Chiyo'],m=['Takeshi','Haruto','Kenji','Ren','Daisuke','Sora','Hiroshi','Kaito'],
   l=['Nakamura','Fujiwara','Takahashi','Morimoto','Hayashi','Kobayashi','Matsuda','Okada'],skin=['light','fair'],hair=['black','dark brown'],eyes=['dark brown']),
 'Korean': dict(f=['Ji-woo','Seo-yeon','Min-ji','Hae-won','Yuna','Da-eun'],m=['Min-ho','Jae-won','Seung-hyun','Tae-yang','Ji-hoon','Dong-min'],
   l=['Kang','Yoon','Seo','Baek','Jung','Han'],skin=['light','fair'],hair=['black','dark brown'],eyes=['dark brown']),
 'Indian': dict(f=['Ananya','Meera','Priyanka','Kavya','Ishita','Lakshmi','Riya','Devika','Nandini','Tara'],m=['Arjun','Vikram','Rohan','Siddharth','Kabir','Aditya','Rajesh','Karan','Dev','Nikhil'],
   l=['Malhotra','Iyer','Kapoor','Chatterjee','Reddy','Menon','Bhatia','Deshmukh','Nair','Sinha'],skin=['warm brown','medium brown','light brown','deep brown'],hair=['black','dark brown'],eyes=['dark brown','brown','hazel']),
 'Middle Eastern': dict(f=['Layla','Yasmin','Nour','Samira','Dalia','Rania','Leila','Mariam'],m=['Karim','Omar','Tariq','Rami','Sami','Yusuf','Nabil','Farid'],
   l=['Haddad','Nasser','Khoury','Mansour','Saleh','Rahimi','Aziz','Farouk'],skin=['olive','light olive','tan'],hair=['black','dark brown'],eyes=['dark brown','brown','green','hazel']),
 'Filipino': dict(f=['Marisa','Liza','Andrea','Bea'],m=['Paolo','Miguel','Rafael','Jericho'],l=['Dimaculangan','Villanueva','Santos-Reyes','Bautista'],skin=['tan','light brown'],hair=['black'],eyes=['dark brown']),
 'Thai': dict(f=['Ploy','Nok','Malai'],m=['Arthit','Somchai','Krit'],l=['Srisuk','Chaiyaporn','Wongsakul'],skin=['tan','light tan'],hair=['black'],eyes=['dark brown']),
 'Vietnamese': dict(f=['Linh','Thu','Mai'],m=['Minh','Quang','Bao'],l=['Tran','Pham','Vo'],skin=['light tan','light'],hair=['black'],eyes=['dark brown']),
 'Italian': dict(f=['Giulia','Francesca','Chiara','Lucia'],m=['Luca','Marco','Enzo','Vittorio'],l=['Benedetti','Marchetti','Lombardi','Caruso'],skin=['olive','light olive'],hair=['black','dark brown','brown'],eyes=['brown','hazel','green']),
 'French': dict(f=['Céline','Margaux','Élodie','Juliette'],m=['Étienne','Mathis','Laurent','Rémy'],l=['Delacroix','Moreau','Lefèvre','Garnier'],skin=['fair','light'],hair=['brown','dark brown','blonde','black'],eyes=['blue','green','brown']),
 'Irish': dict(f=['Siobhan','Niamh','Aoife'],m=['Declan','Ronan','Cillian'],l=["O'Sullivan",'Gallagher','Brennan'],skin=['very fair, freckled','fair'],hair=['red','auburn','dark brown'],eyes=['green','blue']),
 'Scandinavian': dict(f=['Astrid','Freya','Ingrid','Sigrid'],m=['Lars','Erik','Magnus','Henrik'],l=['Lindqvist','Halvorsen','Berglund','Sørensen'],skin=['very fair','fair'],hair=['white-blonde','blonde','light brown'],eyes=['pale blue','blue','grey']),
 'Pacific Islander': dict(f=['Leilani','Malia'],m=['Keanu-Lani','Tama'],l=['Faleolo','Kahananui'],skin=['brown','warm brown'],hair=['black','dark brown'],eyes=['brown']),
 'Native American': dict(f=['Winona','Tala'],m=['Dakota','Elan'],l=['Running Water','Silvermoon'],skin=['warm brown','tan'],hair=['black'],eyes=['dark brown']),
 'Ethiopian': dict(f=['Selam','Hiwot'],m=['Dawit','Yonas'],l=['Tesfaye','Bekele'],skin=['brown','deep brown'],hair=['black'],eyes=['dark brown']),
 'Turkish': dict(f=['Elif','Defne'],m=['Emre','Kerem'],l=['Yılmaz','Aksoy'],skin=['light olive','olive'],hair=['dark brown','black'],eyes=['brown','green']),
 'Persian': dict(f=['Shirin','Parisa'],m=['Dariush','Kian'],l=['Tehrani','Farahani'],skin=['light olive','olive'],hair=['black','dark brown'],eyes=['dark brown','hazel']),
}
WEIGHT = {'Caucasian American':16,'African-American':12,'Nigerian':5,'Ghanaian':2,'Mexican':7,'Puerto Rican':3,'Brazilian':3,'Chinese':7,'Japanese':6,'Korean':5,'Indian':9,'Middle Eastern':6,'Filipino':3,'Thai':2,'Vietnamese':2,'Italian':3,'French':3,'Irish':2,'Scandinavian':3,'Pacific Islander':2,'Native American':2,'Ethiopian':2,'Turkish':2,'Persian':2}
BG = ['deep emerald','deep sapphire blue','burgundy','deep teal','rich amber gold','deep plum','midnight navy','burnt orange','forest green','crimson','dusty rose','mustard yellow','ocean blue','rust orange','soft coral','lavender','olive green','charcoal','deep purple','terracotta']
KIDBG = ['sky blue','sunny yellow','mint green','coral','peach','soft lavender','tomato red','turquoise','light orange','pale pink']

used = set()
def name(eth, g):
    d = ETH[eth]
    for _ in range(200):
        n = random.choice(d['f'] if g=='F' else d['m']) + ' ' + random.choice(d['l'])
        if n not in used:
            used.add(n); return n
    n = n + ' Jr.'; used.add(n); return n

def pick_eth():
    ks = list(WEIGHT); return random.choices(ks, weights=[WEIGHT[k] for k in ks])[0]

def hair_desc(eth, g, age):
    d = ETH[eth]; col = random.choice(d['hair'])
    if age >= 65: col = random.choice(['silver','white','grey'])
    elif age >= 50 and random.random() < .6: col = random.choice(['salt-and-pepper','grey-streaked ' + col])
    if g == 'F':
        if age < 13: st = random.choice(['pigtails','a ponytail with a ribbon','a short bob','two braids','loose curls with a hair clip'])
        elif age >= 60: st = random.choice(['short elegant bob','neat bun','soft short curls','chin-length waves'])
        else:
            st = random.choice(['long waves','sleek bob','pixie cut','high ponytail','shoulder-length curls','long straight hair','elegant updo','side-swept waves','box braids','natural afro','soft bangs and long hair'])
            if st in ('box braids','natural afro') and eth not in ('African-American','Nigerian','Ghanaian','Ethiopian','Brazilian','Puerto Rican'): st = 'long waves'
        return f'{col} hair in {st}' if 'in' not in st[:3] else f'{col} {st}'
    else:
        if age < 13: st = random.choice(['messy short hair','neat side part','short curls','bowl cut'])
        elif age >= 60 and random.random() < .35: return random.choice(['bald with ' + col + ' sides','balding with ' + col + ' hair'])
        else:
            st = random.choice(['short neat hair','slicked-back hair','wavy swept hair','buzz cut','short curls','side-parted hair','longer tousled hair','short fade','man bun','short twists'])
            if st in ('short twists','short fade') and eth not in ('African-American','Nigerian','Ghanaian','Ethiopian','Puerto Rican','Brazilian'): st = 'short neat hair'
        return f'{col} {st}'

def facial(g, age):
    if g != 'M' or age < 18: return ''
    r = random.random()
    if r < .2: return ', trimmed beard'
    if r < .3: return ', mustache'
    if r < .38: return ', goatee'
    if r < .5: return ', light stubble'
    if age >= 60 and r < .6: return ', white beard'
    return ''

def decade():
    return random.choice(['1970s','1980s','1990s','2000s','modern'])

OUT_F = ['black satin evening gown','red silk dress','emerald velvet gown','white silk blouse','gold sequin gown','navy wrap dress','off-shoulder black dress','ivory pantsuit','plum velvet jacket','champagne slip dress','teal cocktail dress','cream turtleneck and gold necklace']
OUT_M = ['black tuxedo with bow tie','navy suit and white shirt','charcoal suit with thin tie','brown leather jacket','cream linen suit','black turtleneck and blazer','tweed jacket','denim jacket over white t-shirt','burgundy velvet blazer','open-collar white shirt','grey three-piece suit','camel overcoat']
ACC_F = ['pearl earrings','gold hoop earrings','diamond stud earrings','a jade pendant','gold drop earrings','a silver choker','statement earrings','a thin gold necklace','']
KID_F = ['yellow sweater','red dress with white collar','striped t-shirt','denim overalls','pink cardigan','blue school uniform','green hoodie','floral dress']
KID_M = ['striped t-shirt','blue school uniform','red hoodie','denim overalls','plaid shirt','yellow raincoat','green sweater','baseball t-shirt']
TEEN_F = ['denim jacket','white blouse','varsity sweater','floral top','leather jacket','pastel hoodie']
TEEN_M = ['varsity jacket','plaid shirt','denim jacket','hoodie','white t-shirt and bomber jacket','school blazer']
ROLE_OUT = {
 'Director': ['black turtleneck and beret','black blazer and scarf','leather jacket and sunglasses pushed up','linen shirt and director\'s viewfinder on a cord','tweed jacket and round glasses','denim shirt and baseball cap'],
 'Cinematographer': ['utility vest and baseball cap','black t-shirt with a camera viewfinder on a lanyard','field jacket and headphones around neck','flannel shirt and light meter on a cord','black jacket and beanie'],
 'Composer': ['black conductor tailcoat and white bow tie','velvet blazer and silk scarf','black shirt with headphones around neck','tweed jacket with a pencil behind ear','dark sweater and round glasses'],
 'Writer': ['wool sweater and glasses','corduroy jacket','denim shirt with pen in pocket','cardigan and reading glasses','oversized hoodie','turtleneck and tortoiseshell glasses'],
}

def article(w): return 'an' if w[0].lower() in 'aeiou' else 'a'

lines = []
def add(section, role, g, age_rng, kid=False, teen=False):
    eth = pick_eth(); age = random.randint(*age_rng); n = name(eth, g); d = ETH[eth]
    skin = random.choice(d['skin']); eyes = random.choice(d['eyes'])
    wr = ' with soft wrinkles' if age >= 60 else ''
    gender = ('girl' if g=='F' else 'boy') if kid else ('teen girl' if g=='F' and teen else 'teen boy' if teen else ('woman' if g=='F' else 'man'))
    hair = hair_desc(eth, g, age)
    if kid: out = random.choice(KID_F if g=='F' else KID_M); acc=''; bg = random.choice(KIDBG); extra = ', big friendly smile, no makeup'
    elif teen: out = random.choice(TEEN_F if g=='F' else TEEN_M); acc=''; bg = random.choice(BG); extra = ', no makeup'
    elif role in ROLE_OUT: out = random.choice(ROLE_OUT[role]); acc = random.choice(ACC_F[:4]+['','','']) if g=='F' else ''; bg = random.choice(BG); extra = facial(g, age)
    else: out = random.choice(OUT_F if g=='F' else OUT_M); acc = random.choice(ACC_F) if g=='F' else ''; bg = random.choice(BG); extra = facial(g, age)+(', red lips' if g=='F' and random.random()<.4 else '')
    era = '' if (kid or teen) else f', {decade()} style'
    desc = f'{eth} {gender}, age {age}, {hair}, {skin} skin{wr}, {eyes} eyes{extra}, {out}' + (f', {acc}' if acc else '') + era
    lines.append((section, f'{n} — {role}. {desc}. Background: {bg}.'))

for _ in range(70): add('ACTRESSES', 'Actress', 'F', (19, 82))
for _ in range(70): add('ACTORS', 'Actor', 'M', (19, 85))
for _ in range(12): add('CHILD ACTORS', 'Child actress', 'F', (6, 12), kid=True)
for _ in range(12): add('CHILD ACTORS', 'Child actor', 'M', (6, 12), kid=True)
for _ in range(8): add('TEEN ACTORS', 'Teen actress', 'F', (13, 17), teen=True)
for _ in range(8): add('TEEN ACTORS', 'Teen actor', 'M', (13, 17), teen=True)
for i in range(22): add('DIRECTORS', 'Director', 'F' if i % 3 == 0 else 'M', (30, 78))
for i in range(16): add('CINEMATOGRAPHERS', 'Cinematographer', 'F' if i % 3 == 0 else 'M', (28, 72))
for i in range(16): add('COMPOSERS', 'Composer', 'F' if i % 3 == 0 else 'M', (28, 80))
for i in range(16): add('WRITERS', 'Writer', 'F' if i % 2 == 0 else 'M', (25, 78))

STYLE = """For every person I describe next, create one image in exactly this style: minimalist flat vector portrait, head and shoulders, centered, facing slightly to one side, simple flat color shapes with no outlines, very few facial details (eyes as simple shapes, small nose, defined lips), subtle canvas paper texture, elegant luxury fashion illustration, solid single-color background in the color I name, square image, no text, no logos. All people are fictional. Children are shown in a friendly, wholesome way. Reply only with the image. Confirm you understand by saying OK."""

out = ['HOLLYWOOD SIM — 250 CAST PORTRAIT PROMPTS (for Google Gemini or Leonardo)', '',
 'HOW TO USE', '1. Open Gemini and start ONE new chat.', '2. Paste the STYLE MESSAGE first.', '3. Then paste one numbered line at a time.',
 '4. Long-press each image > Download. Rename it to its number if you can (e.g. 17.png).', '5. Send the images to Claude in batches and say which numbers they are.',
 'Tip: if Gemini drifts from the style, paste the STYLE MESSAGE again.', '', '-'*60, 'STYLE MESSAGE (paste this first)', '-'*60, STYLE, '']
cur = None
for i, (sec, l) in enumerate(lines, 1):
    if sec != cur:
        out += ['', '-'*60, sec, '-'*60]; cur = sec
    out.append(f'{i}. {l}')
open('/home/claude/hollywood-sim/cast-250-prompts.txt', 'w').write('\n'.join(out) + '\n')
print(len(lines), len(used))
