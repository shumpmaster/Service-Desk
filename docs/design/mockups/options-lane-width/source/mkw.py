import re, shutil
SRC='/home/user/Service-Desk/docs/design/mockups/timeline-v12-craft.html'
src=open(SRC).read()
K='var MAINX = 48, DX = 26, ROWH = 64;'
assert K in src
def imp(css): return re.sub(r':([^;{}]+?)(;|})', r':\1 !important\2', css)
TIGHT='.v12ico{width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:11px}.v12ico svg{width:13px;height:13px}'
SHIFT='''.ptl .faint{display:none}
.ptl .pmain,.pfut{left:8px}
.pl .node{left:1px}.pl .node.ms{left:4px}.pl .node.ms.big{left:2px}.pl .now-node{left:-3px}
.pl > .rbody{margin-left:30px}.v12work{margin-left:-30px}'''
def add(s, css): return s + '<style id="optw">' + imp(css) + '</style>'
def lanes(s, mainx, dx):
    s=s.replace(K, 'var MAINX = %d, DX = %d, ROWH = 64;' % (mainx, dx)); return s.replace('var txt = MAINX + DX * maxc + 22;','var txt = MAINX + DX * maxc + 20;')
open('optw/a.html','w').write(add(lanes(src,48,16), TIGHT))
open('optw/b.html','w').write(add(lanes(src,12,16), TIGHT+SHIFT))
c=lanes(src,12,16)
for a,b in [("var s = span[g], x = MAINX + DX * col[g];","var s = span[g], x = MAINX + (maxc > 1 ? DX * col[g] : 0);"),
            ("ix = onMain ? MAINX : MAINX + DX * col[r.g];","ix = onMain ? MAINX : MAINX + (maxc > 1 ? DX * col[r.g] : 0);"),
            ("var txt = MAINX + DX * maxc + 20;","var txt = MAINX + (maxc > 1 ? DX * maxc : 0) + 20;")]:
    assert a in c; c=c.replace(a,b)
open('optw/c.html','w').write(add(c, TIGHT+SHIFT+'.v12row svg.cv{display:none}'))
shutil.copy(SRC,'optw/now.html')
