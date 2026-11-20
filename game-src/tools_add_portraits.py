"""Clean and add Gemini portraits.
usage: python3 tools_add_portraits.py OUT_START file1 file2 ...
Removes the Gemini sparkle (bottom-right), resizes to 420px JPG, saves media/p/fNNN.jpg,
prints the background colour of each for the PIMG table in ui25.js."""
import sys, numpy as np, cv2
from PIL import Image
start = int(sys.argv[1])
for k, f in enumerate(sys.argv[2:]):
    a = np.array(Image.open(f).convert('RGB')); h, w = a.shape[:2]
    cx, cy, R = int(w*.885), int(h*.885), int(w*.04)
    reg = a[cy-R:cy+R, cx-R:cx+R].astype(int)
    med = cv2.medianBlur(a, 41)[cy-R:cy+R, cx-R:cx+R].astype(int)
    sub = ((np.abs(reg-med).sum(2)) > 10).astype(np.uint8)*255
    yy, xx = np.ogrid[-R:R, -R:R]; sub[(xx*xx+yy*yy) > R*R] = 0
    m = np.zeros((h, w), np.uint8); m[cy-R:cy+R, cx-R:cx+R] = cv2.dilate(sub, np.ones((5, 5), np.uint8))
    a = cv2.inpaint(a, m, 6, cv2.INPAINT_TELEA)
    out = f'media/p/f{start+k:03d}.jpg'
    im = Image.fromarray(a).resize((420, 420), Image.LANCZOS); im.save(out, quality=86)
    c = im.getpixel((25, 25)); print(out, '#%02x%02x%02x' % c)
