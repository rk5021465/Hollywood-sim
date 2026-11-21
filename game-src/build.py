import pathlib
s=pathlib.Path('src')
css=(s/'style.css').read_text()
js='\n'.join((s/f).read_text() for f in ['data.js','engine3d.js','game.js','ui.js'])
html=f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#120E16">
<title>Shaadi Inc.</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>{css}</style></head><body><div id="app"></div>
<script>{js}</script></body></html>'''
pathlib.Path('index.html').write_text(html)
print(len(html))
