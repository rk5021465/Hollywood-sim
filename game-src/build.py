import re
v1=open('/home/claude/game/index.html').read()
head=v1[:v1.index('<style>')]
body=v1[v1.index('</style>')+8:v1.index('<script>')]
css=open('src/base.css').read()+open('src/extra.css').read()
js='\n'.join(open('src/'+f).read() for f in ['data.js','art.js','core.js','modals.js','views.js'])
out=head+'<style>'+css+'</style>'+body+'<script>\n'+js+'\n</script>\n</body>\n</html>\n'
open('index.html','w').write(out)
print(len(out))
