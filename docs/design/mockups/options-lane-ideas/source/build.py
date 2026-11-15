# Builds ../index.html: v12's lanes as they are (a screenshot), then three radically different ways to show
# several branches, drawn live with M6's real events (from timeline-v12-craft.html) and v12's own icons.
import json, os, html
H = os.path.dirname(os.path.abspath(__file__))
I = json.load(open(os.path.join(H, 'icons.json')))
E = html.escape
S010 = [('13 Nov 21:32','Commit','Done','spec writer','First draft, and experiments E1 and E2 registered'),
        ('13 Nov 21:44','Review','Failed','reviewer (plan)','Plan review failed'),
        ('13 Nov 23:45','Commit','Done','spec writer','Spec revised'),
        ('13 Nov 23:51','Review','Failed','reviewer (plan)','Plan review failed'),
        ('01:05','Stop','Done','orchestrator','Stop card 4'),
        ('04:56','Merge','Done','you','Merged PR #443: the card’s notes and two questions'),
        ('04:58','Decision','Done','you','You said: write a new spec'),
        ('12:04','Merge','Done','you','Merged PR #444: the answer, the number fix, the pack fix')]
S011 = [('12:07','Decision','Done','orchestrator','New spec S-011, rounds reset'),
        ('12:16','Commit','Done','spec writer','First draft'),
        ('12:29','Review','Failed','reviewer (plan)','Plan review failed, round 1'),
        ('12:37','Commit','Done','spec writer','Spec revised'),
        ('14:46','Merge','Done','you','Merged PR #446: three questions for you'),
        ('15:14','Review','Failed','reviewer (plan)','Plan review failed, round 2'),
        ('15:23','Commit','Done','spec writer','Spec revised again'),
        ('15:36','Review','Failed','reviewer (plan)','Plan review failed, round 3'),
        ('15:42','Stop','Waiting on you','orchestrator','Stop card 5')]

def ico(k, main=False, sel=False, small=False):
    c = 'ico' + (' main' if main else '') + (' sel' if sel else '') + (' sm' if small else '')
    return f'<span class="{c}">{I[k]}</span>'
def row(e, sprint=None):
    t,k,st,who,title = e; m = k == 'Merge'
    tag = f'<span class="sp">{sprint}</span>' if sprint else ''
    return (f'<div class="row">{ico(k, m)}<div class="tx"><div class="l1"><b>{k}</b><span class="st">{E(st)}</span><span class="tm">{t}</span></div>'
            f'<div class="l2">{E(title)}</div><div class="l3">{tag}by {E(who)}{" · main" if m else ""}</div></div></div>')
MS = '<div class="ms"><span class="no">2.7</span><span class="id">M6</span><span class="nm">The records can carry the timeline</span></div>'

# ---- idea 1: a branch map on top, a full-width list below ----
def idea1():
    evs = [('S-010', e) for e in S010] + [('S-011', e) for e in S011]
    W, x0, dx = 361, 18, 19.5
    ymain, ylane = 64, 26
    xs = [x0 + i*dx for i in range(len(evs))]
    # S-010 branches at its first event, merges at 04:56 (idx5) and 12:04 (idx7); S-011 branches after idx7
    p = [f'<path class="g main" d="M4 {ymain} H{W-4}"/>']
    def up(xa, xb): return f'M{xa} {ymain} C{(xa+xb)/2} {ymain} {(xa+xb)/2} {ylane} {xb} {ylane}'
    def down(xa, xb): return f'M{xa} {ylane} C{(xa+xb)/2} {ylane} {(xa+xb)/2} {ymain} {xb} {ymain}'
    p.append(f'<path class="g" d="{up(xs[0]-16, xs[0])} H{xs[6]}"/>')
    p.append(f'<path class="g" d="{down(xs[4], xs[5])}"/>')
    p.append(f'<path class="g" d="{down(xs[6], xs[7])}"/>')
    p.append(f'<path class="g sel" d="{up(xs[7], xs[8])} H{xs[16]}"/>')
    dots = ''
    for i,(sp,e) in enumerate(evs):
        m = e[1] == 'Merge'; y = ymain if m else ylane
        cls = 'dot' + (' main' if m else '') + (' cur' if sp == 'S-011' else '') + (' now' if i == len(evs)-1 else '')
        dots += f'<circle class="{cls}" cx="{xs[i]}" cy="{y}" r="{5.5 if i==len(evs)-1 else 4}"/>'
    lab = (f'<text x="{xs[0]}" y="{ylane-11}" class="lb">S-010</text><text x="{xs[8]}" y="{ylane-11}" class="lb on">S-011</text>'
           f'<text x="4" y="{ymain+20}" class="lb">main</text><text x="{W-4}" y="{ymain+20}" class="lb" text-anchor="end">now</text>')
    svg = f'<svg class="map" viewBox="0 0 {W} 92" width="100%" aria-label="Branch map of M6">{"".join(p)}{dots}{lab}</svg>'
    seg = '<div class="seg"><span>All</span><span class="on">S-011</span><span>S-010</span></div>'
    rows = ''.join(row(e) for e in reversed(S011[-5:]))
    return MS + svg + seg + '<div class="sphd"><span class="no">2.7.2</span> Spec S-011 · stopped · your call</div>' + rows + '<div class="more">4 earlier in S-011</div>'

# ---- idea 2: sprint cards, no lines ----
def idea2():
    open_rows = ''.join(row(e) for e in reversed(S011[-5:]))
    c1 = (f'<div class="card open"><div class="chd">{ico("Stop", sel=True)}<div class="tx"><div class="l1"><b>2.7.2 Spec S-011</b><span class="tm">{I["caret"]}</span></div>'
          f'<div class="l3">9 events · 3 plan reviews failed · waiting on you</div></div></div>{open_rows}<div class="more">4 earlier · branched from main 14 Nov 12:07</div></div>')
    c2 = (f'<div class="card"><div class="chd">{ico("Merge", main=True)}<div class="tx"><div class="l1"><b>2.7.1 Spec S-010</b><span class="tm cl">{I["caret"]}</span></div>'
          f'<div class="l3">8 events · merged into main twice · superseded by S-011</div></div></div></div>')
    return MS + '<p class="note">Tap a sprint’s icon to open or fold it.</p>' + c1 + c2

# ---- idea 3: sideways, like a metro map ----
def idea3():
    evs = [('S-010', e) for e in S010] + [('S-011', e) for e in S011]
    dx, x0 = 44, 22
    W = x0*2 + dx*(len(evs)-1)
    ymain, ylane = 92, 40
    xs = [x0 + i*dx for i in range(len(evs))]
    g = [f'<path class="g main" d="M0 {ymain} H{W}"/>',
         f'<path class="g" d="M{xs[0]-30} {ymain} C{xs[0]-14} {ymain} {xs[0]-16} {ylane} {xs[0]} {ylane} H{xs[7]-20} C{xs[7]-8} {ylane} {xs[7]-10} {ymain} {xs[7]} {ymain}"/>',
         f'<path class="g" d="M{xs[4]} {ylane} C{xs[4]+16} {ylane} {xs[4]+14} {ymain} {xs[5]} {ymain}"/>',
         f'<path class="g" d="M{xs[7]} {ymain} C{xs[7]+16} {ymain} {xs[7]+14} {ylane} {xs[8]} {ylane} H{xs[-1]}"/>']
    marks = ''
    for i,(sp,e) in enumerate(evs):
        m = e[1] == 'Merge'; y = ymain if m else ylane
        marks += f'<div class="stn{" main" if m else ""}{" sel" if i==len(evs)-1 else ""}" style="left:{xs[i]}px;top:{y}px">{I[e[1]]}</div>'
        marks += f'<div class="tk" style="left:{xs[i]}px">{e[0].split(" ")[-1]}</div>'
    labels = f'<div class="ln" style="left:{xs[0]}px;top:{ylane-30}px">S-010</div><div class="ln" style="left:{xs[-1]-80}px;top:{ylane-32}px">2.7.2 S-011</div><div class="ln" style="left:6px;top:{ymain+18}px">main</div>'
    strip = (f'<div class="strip"><div class="track" style="width:{W}px"><svg width="{W}" height="140" aria-hidden="true">{"".join(g)}</svg>{marks}{labels}</div></div>')
    t,k,st,who,title = S011[-1]
    det = (f'<div class="card det"><div class="l1"><b>Stop</b><span class="st">Waiting on you</span><span class="tm">15:42</span></div>'
           f'<div class="l2">Stop card 5: S-011 failed three plan reviews</div><div class="l3">2.7.2 · by orchestrator · waits on you</div>'
           f'<div class="prev"><span>Before it</span> Review failed, round 3 · 15:36</div></div>')
    return MS + '<p class="note">Swipe sideways through time. Tap a stop to read it.</p>' + strip + det

CSS = open(os.path.join(H, 'page.css')).read()
def frame(inner, cls=''): return f'<div class="phone {cls}"><div class="screen">{inner}</div></div>'
now = ('<div class="pair"><figure><img src="now-light.png" alt="v12 lanes, light" width="393" height="760"><figcaption>Light</figcaption></figure>'
       '<figure><img src="now-dark.png" alt="v12 lanes, dark" width="393" height="760"><figcaption>Dark</figcaption></figure></div>')
ideas = [
 ('1 · A branch map on top', 'The lines leave the list. A small map at the top of the open milestone shows main and every sprint, newest on the right, with the one you are reading picked out. Below it, the events run the full width with nothing beside them. Tap a sprint in the map, or its name, to show its events.', idea1()),
 ('2 · Sprint cards, no lines', 'No lines at all. Each sprint is a card that says in one line where it stands. Its icon opens or folds it, so you start from two lines, not seventeen events. Where it branched and merged is said in words.', idea2()),
 ('3 · Sideways, like a metro map', 'Time runs left to right, so lanes cost height, not width. Main runs along the bottom, sprints above it, each event a stop. You swipe back through time; the stop you tap is read in full below.', idea3()),
]
body = ''.join(f'<section class="opt"><div class="hd"><span class="tag">Idea</span><h2>{h}</h2><p>{p}</p></div>{frame(f)}</section>' for h,p,f in ideas)
page = f'''<title>Lane Ideas</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{CSS}</style>
<main>
<header class="lede"><h1>Lanes, three different ideas</h1>
<p>You asked for radically different ideas for the lanes taking too much width. First v12 as it is, with M6 open. Then three different ways to show several branches, drawn with M6's real events and v12's own icons, on a phone 393 points wide. They follow your light or dark setting.</p>
<p>The seven kinds, main set apart, the numbers and the agent's plan stay. Colour and the milestone shapes stay on hold. The step's actions are left out here to keep the pictures about the lanes.</p></header>
<section class="opt"><div class="hd"><span class="tag">Now</span><h2>v12 as it is</h2><p>Project line, main's groove, then each sprint's lane. Text starts about 112 points in.</p></div>{now}</section>
{body}
</main>'''
open(os.path.join(H, '..', 'index.html'), 'w').write(page)
