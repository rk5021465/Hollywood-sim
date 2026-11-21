import json, urllib.request, urllib.parse, os, subprocess
UA={'User-Agent':'ShaadiIncGameBuild/1.0 (https://github.com/rk5021465/Hollywood-sim)'}
API='https://commons.wikimedia.org/w/api.php?'
def get(params):
    req=urllib.request.Request(API+urllib.parse.urlencode(params),headers=UA)
    return json.load(urllib.request.urlopen(req,timeout=60))
queries=['shehnai','sitar raga','nadaswaram','Rajasthani folk']
want=['Nimisha Shankar - 01 - Gold A Holi Song.ogg','Nimisha Shankar - 02 - Evening Raga.ogg','Nimisha Shankar - 03 - Sunset Raga.ogg','Nimisha Shankar - 04 - Quiet Raga.ogg','Samuel Corwin - 11 - Little Boy Plays Drums and Sings at Amer Fort Jaipur.ogg','Kiravani-L Ramakrishnan.ogg','Sitar sample yaman.ogg','Samuel Corwin - 06 - Harmonium and Drum at the Karni Mata Temple Deshnoke.ogg','Maharashtrian Dhol Perform 001.ogg','Maharashtrian Dhol Perform 02.ogg','Sitar and tabla rendition - Freedom Jam, 2015.oga','Kole Basava performers playing nadaswaram, Bengaluru, Karnataka, India.wav']
titles=set('File:'+w for w in want)
for q in queries:
    try:
        r=get({'action':'query','list':'search','srsearch':q+' filetype:audio','srnamespace':6,'srlimit':15,'format':'json'})
        for s in r['query']['search']: titles.add(s['title'])
    except Exception as e: print('search fail',q,e)
out=[]
tl=list(titles)
for i in range(0,len(tl),40):
    r=get({'action':'query','titles':'|'.join(tl[i:i+40]),'prop':'imageinfo','iiprop':'url|size|mime|extmetadata|metadata','format':'json'})
    for p in r['query']['pages'].values():
        if 'imageinfo' not in p: continue
        ii=p['imageinfo'][0];em=ii.get('extmetadata',{})
        length=None
        for m in (ii.get('metadata') or []):
            if m.get('name') in ('length','playtime_seconds'):length=m.get('value')
        out.append({'title':p['title'],'url':ii['url'],'size':ii.get('size'),'mime':ii.get('mime'),'length':length,
          'license':em.get('LicenseShortName',{}).get('value'),'artist':em.get('Artist',{}).get('value','')[:200],'desc':em.get('ImageDescription',{}).get('value','')[:300]})
os.makedirs('probe',exist_ok=True)
json.dump(out,open('probe/probe.json','w'),indent=1)
free=('CC0','Public domain','CC BY','CC BY-SA','PD')
for o in out:
    lic=(o['license'] or '')
    if o['title'][5:] in want and 'NC' not in lic:
        fn='probe/'+''.join(ch if ch.isalnum() or ch in '.-_' else '_' for ch in o['title'][5:])
        import time
        for attempt in range(5):
            try:
                time.sleep(3+attempt*6)
                req=urllib.request.Request(o['url'],headers=UA);data=urllib.request.urlopen(req,timeout=120).read()
                if len(data)>1000:open(fn,'wb').write(data);o['file']=fn;break
            except Exception as e:print('dl fail',attempt,o['title'],e)
json.dump(out,open('probe/probe.json','w'),indent=1)
print(len(out),'items')
