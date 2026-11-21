cd /home/claude/v3 && python3 - <<'PY'
src=open('/home/claude/sim.html').read()
head=src[:src.index('<style>')].replace('family=Bebas+Neue&family=Inter:wght@400;600;800','family=Bebas+Neue&family=Inter:wght@400;600;800&family=Playfair+Display:wght@700;900&family=Creepster&family=Orbitron:wght@700&family=Cinzel:wght@700&family=Bangers&family=Pacifico&family=Special+Elite&family=Press+Start+2P')
css=open('style.css').read()
js=''.join(open(f).read()+'\n' for f in ['data.js','core.js','audio.js','audio2.js','art.js','film.js','biz.js','world.js','ui.js','ui2.js','ui3.js','ui4.js','ui5.js','ui6.js','ui7.js','ui8.js','ui9.js','ui10.js','ui11.js','ui12.js','ui13.js','ui14.js','ui15.js','ui17.js','ui18.js','ui19.js','ui20.js','ui21.js','ui22.js','ui23.js','ui24.js','ui25.js','ui26.js','ui27.js'])
open('game.html','w').write(head+'<style>'+css+'</style>\n</head>\n<body>\n<div id="app"></div>\n<div id="modal"></div>\n<script>\n'+js+'\napplyTheme();title();\n</script>\n</body>\n</html>\n')
open('/tmp/g3.js','w').write(js)
PY
node -e "new Function(require('fs').readFileSync('/tmp/g3.js','utf8'))" && echo SYNTAX_OK
