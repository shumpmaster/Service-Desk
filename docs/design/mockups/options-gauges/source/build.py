# Builds ../index.html: v12's milestone circles as they are (a screenshot), then three ways to give the circle icons
# a percent gauge in red, yellow and green, drawn on the Design phase in the layout the owner chose.
# Percentages are partly examples: what a gauge counts is put to the owner with this question.
# Usage: python3 build.py <phosphor package/assets>
import os, sys, html
H = os.path.dirname(os.path.abspath(__file__))
A = sys.argv[1]
E = html.escape
def ph(n, w='regular'):
    s = open(os.path.join(A, w, n + ('-' + w if w != 'regular' else '') + '.svg')).read()
    return s.replace('<svg', '<svg aria-hidden="true" focusable="false"')
I = {'commit': ph('git-commit'), 'review': ph('eye'), 'stop': ph('hand-palm'), 'branch': ph('git-branch'), 'step': ph('list-checks'),
     'ms': ph('circle', 'fill').replace('<svg', '<svg class="sm"', 1), 'own': ph('square', 'fill').replace('<svg', '<svg class="sm"', 1)}

def gauge(mode, pct, rag, inner):
    r, c = 14, 2 * 3.14159 * 14
    arc = f'<circle class="arc {rag}" cx="17" cy="17" r="{r}" stroke-dasharray="{c * pct / 100:.1f} {c:.1f}" transform="rotate(-90 17 17)"/>' if pct else ''
    if mode == 'b': inner = f'<span class="pct">{pct}</span>'
    dot = f'<span class="rdot {rag}"></span>' if mode == 'c' and rag != 'none' else ''
    return (f'<span class="gauge m{mode}" role="img" aria-label="{pct}% {dict(g="on track", y="waiting or at risk", r="stopped or blocked", none="not started")[rag]}">'
            f'<svg viewBox="0 0 34 34" width="34" height="34"><circle class="trk {rag}" cx="17" cy="17" r="14"/>{arc}</svg><span class="in">{inner}</span>{dot}</span>')

def row(mode, lvl, pct, rag, inner, no, name, meta, note=''):
    return (f'<div class="gr lv{lvl}">{gauge(mode, pct, rag, inner)}<div class="tx"><div class="l1"><span class="no">{no}</span><b>{E(name)}</b><span class="tm">{meta}</span></div>'
            + (f'<div class="l3">{E(note)}</div>' if note else '') + '</div></div>')
def ev(k, st, t, title, who):
    return f'<div class="row"><span class="ico">{I[k]}</span><div class="tx"><div class="l1"><b>{k.title()}</b><span class="st">{st}</span><span class="tm">{t}</span></div><div class="l2">{E(title)}</div><div class="l3">by {who}</div></div></div>'

def screen(m):
    return (row(m, 1, 14, 'y', '<span class="pn">2</span>', '', 'Design', '1 of 7 reached', 'Waiting on you: stop card 5') +
            row(m, 2, 40, 'g', I['ms'], '2.5', 'Design-5', 'example', 'Mockups under way') +
            row(m, 2, 0, 'none', I['ms'], '2.3', 'Design-3', 'not started') +
            '<div class="nowcard"><span>Now</span>Stop card 5: S-011 failed three plan reviews. What happens next?</div>' +
            row(m, 2, 30, 'r', I['own'], '2.7', 'M6', 'example', 'Stopped: three plan reviews failed') +
            row(m, 3, 60, 'r', I['branch'], '2.7.2', 'Spec S-011', 'example', 'Stopped · your call') +
            ev('stop', 'Waiting on you', '15:42', 'Stop card 5', 'orchestrator') +
            ev('review', 'Failed', '15:36', 'Plan review failed, round 3', 'reviewer (plan)') +
            ev('commit', 'Done', '15:23', 'Spec revised again', 'spec writer') +
            row(m, 4, 83, 'r', I['step'], '2.7.2.5', 'The spec writer', '5 of 6 done', '1 blocked') +
            row(m, 3, 100, 'g', I['branch'], '2.7.1', 'Spec S-010', 'merged', 'Superseded by S-011') +
            row(m, 2, 100, 'g', I['ms'], '2.1', 'Design-1', 'reached'))

OPTS = [
 ('a', 'A · As you chose it', 'The coloured ring around the icon, as on the first page.'),
 ('a1', 'A1 · Lighter tones', 'The same ring in paler green, yellow and red, so it sits back from the words.'),
 ('a2', 'A2 · Thinner and muted', 'A thinner ring in muted, slightly greyed tones. The quietest of the three.'),
 ('a3', 'A3 · A tinted ring', 'The whole ring takes a faint wash of its colour, and the filled part is a soft tone of it. Reads as one soft shape rather than a line.'),
]
CSS = open(os.path.join(H, 'page.css')).read()
frames = ''.join(f'<section class="opt"><div class="hd"><span class="tag">{"Chosen" if k == "a" else "Softer"}</span><h2>{h}</h2><p>{p}</p></div><div class="phone p{k}"><div class="screen">{screen(k)}</div></div></section>' for k, h, p in OPTS)
page = f'''<title>Gauge Icons</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{CSS}</style>
<main>
<header class="lede"><h1>Softer gauges</h1>
<p>You asked for the circle icons with percent gauges, in red, yellow and green. Today, in v12, a milestone is a small circle: filled when reached, hollow when planned, a square for your own milestones. Phases have no icon, and sprints and steps have none on the line.</p>
<p>You chose A, the coloured ring with the icon inside, and asked for the colour to be softer. First A as it was shown, then three softer versions, on the Design phase. Each one uses the same colours: <b class="k g">green</b> on track, <b class="k y">yellow</b> waiting on you or at risk, <b class="k r">red</b> stopped or blocked, and no colour for not started. Red keeps its meaning of a problem. The percentages marked “example” are made up: what a gauge counts is the next question.</p></header>
<section class="opt"><div class="hd"><span class="tag">Now</span><h2>v12 as it is</h2></div>
<div class="pair"><figure><img src="now-light.png" alt="v12, light" width="393" height="640"><figcaption>Light</figcaption></figure><figure><img src="now-dark.png" alt="v12, dark" width="393" height="640"><figcaption>Dark</figcaption></figure></div></section>
{frames}
</main>'''
open(os.path.join(H, '..', 'index.html'), 'w').write(page)
