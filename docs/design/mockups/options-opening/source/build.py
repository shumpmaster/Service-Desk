# Builds ../index.html: how v12 opens (a screenshot), then two ways for the timeline to open on the current step,
# fully open, with the other phases fixed until one is expanded (round 3, answers 4 and 5). Live phone frames.
# Uses what the owner has chosen so far: the floating branch map, the tinted gauges on phases, milestones and sprints,
# and the marks and tags on events and steps. Usage: python3 build.py <phosphor package/assets>
import os, sys, html
H = os.path.dirname(os.path.abspath(__file__))
A = sys.argv[1]
E = html.escape
def ph(n, w='regular'):
    s = open(os.path.join(A, w, n + ('-' + w if w != 'regular' else '') + '.svg')).read()
    return s.replace('<svg', '<svg aria-hidden="true" focusable="false"')
I = {'commit': ph('git-commit'), 'review': ph('eye'), 'stop': ph('hand-palm'), 'merge': ph('git-merge'), 'branch': ph('git-branch'), 'step': ph('list-checks'),
     'ok': ph('check', 'bold'), 'wait': ph('hourglass-medium', 'fill'), 'x': ph('x', 'bold'), 'warn': ph('warning', 'fill'),
     'ms': ph('circle', 'fill').replace('<svg', '<svg class="sm"', 1), 'own': ph('square', 'fill').replace('<svg', '<svg class="sm"', 1)}

def gauge(pct, rag, inner, size=34):
    c = 2 * 3.14159 * 14
    arc = f'<circle class="arc {rag}" cx="17" cy="17" r="14" stroke-dasharray="{c * pct / 100:.1f} {c:.1f}" transform="rotate(-90 17 17)"/>' if pct else ''
    return f'<span class="gauge" style="width:{size}px;height:{size}px"><svg viewBox="0 0 34 34" width="{size}" height="{size}"><circle class="trk {rag}" cx="17" cy="17" r="14"/>{arc}</svg><span class="in">{inner}</span></span>'
def grow(lvl, pct, rag, inner, no, name, meta, note=''):
    return (f'<div class="gr lv{lvl}">{gauge(pct, rag, inner)}<div class="tx"><div class="l1"><span class="no">{no}</span><b>{E(name)}</b><span class="tm">{meta}</span></div>'
            + (f'<div class="l3">{E(note)}</div>' if note else '') + '</div></div>')
def ev(k, state, word, t, title, who, main=False):
    mk = {"ok": "ok", "wait": "wait", "bad": "x"}[state]
    tag = f'<span class="tag2 s-{state}">{word}</span>'
    return (f'<div class="row"><span class="ico{" main" if main else ""}">{I[k]}<span class="badge s-{state}">{I[mk]}</span></span><div class="tx"><div class="l1"><b>{k.title()}</b>{tag}<span class="tm">{t}</span></div>'
            f'<div class="l2">{E(title)}</div><div class="l3">by {who}{" · main" if main else ""}</div></div></div>')
ACTS = [('ok', '5.6', 'Settle what “acting for you” means'), ('bad', '5.5', 'Move the experiments to the new spec'), ('ok', '5.4', 'Say which version the check tests'),
        ('ok', '5.3', 'Hold the phone-width check'), ('ok', '5.2', 'Let the builder update the widget’s copy'), ('ok', '5.1', 'Make sure no alert is missed')]
def step():
    acts = ''.join(f'<div class="act {a}"><span class="mk">{I["ok"] if a == "ok" else I["warn"]}</span><span class="n">{n}</span>{E(t)}</div>' for a, n, t in ACTS)
    return ev('step', 'bad', '1 blocked', '', 'The spec writer’s plan · 5 of 6 done', 'spec writer') + f'<div class="acts">{acts}</div>'

MAP = ('<svg class="map" viewBox="0 -6 360 70" width="100%" aria-label="Branch map of the Design phase"><rect class="win" x="196" y="4" width="160" height="50" rx="10"/>'
       '<path class="g main" d="M0 54 H360"/><path class="g" d="M8 54 C16 54 16 30 24 30 H120"/><path class="g" d="M98 30 C106 30 106 54 114 54"/><path class="g" d="M120 30 C128 30 128 54 136 54"/>'
       '<path class="g" d="M140 54 C148 54 148 30 156 30 H200"/><path class="g" d="M196 30 C204 30 204 54 212 54"/><path class="g" d="M216 54 C224 54 224 30 232 30 H330"/>'
       '<path class="g" d="M138 54 C146 54 146 8 154 8 H346"/>'
       + ''.join(f'<circle class="dot" cx="{24 + i * 16}" cy="30" r="3.5"/>' for i in range(6)) +
       '<circle class="dot main" cx="114" cy="54" r="3.5"/><circle class="dot main" cx="136" cy="54" r="3.5"/><circle class="dot main" cx="212" cy="54" r="3.5"/>'
       + ''.join(f'<circle class="dot vis" cx="{154 + i * 24}" cy="8" r="3.5"/>' for i in range(8)) + '<circle class="dot now" cx="346" cy="8" r="5"/>'
       + ''.join(f'<circle class="dot" cx="{246 + i * 20}" cy="30" r="3.5"/>' for i in range(5)) + '</svg>')

def design_body():
    s011 = (ev('stop', 'wait', 'Waiting on you', '15:42', 'Stop card 5', 'orchestrator') + ev('review', 'bad', 'Failed', '15:36', 'Plan review failed, round 3', 'reviewer (plan)') +
            ev('commit', 'ok', 'Done', '15:23', 'Spec revised again', 'spec writer') + step() + ev('review', 'bad', 'Failed', '15:14', 'Plan review failed, round 2', 'reviewer (plan)') +
            ev('merge', 'wait', 'Awaiting your answers', '14:46', 'Merged PR #446: three questions for you', 'you', True) + ev('commit', 'ok', 'Done', '12:37', 'Spec revised', 'spec writer') +
            '<div class="more">3 earlier in S-011</div>')
    return (grow(2, 40, 'g', I['ms'], '2.5', 'Design-5', 'example', 'Mockups under way') + grow(2, 0, 'none', I['ms'], '2.3', 'Design-3', 'not started') +
            grow(2, 0, 'none', I['ms'], '2.6', 'Design-6', 'next') +
            '<div class="nowcard"><span>Now</span>Stop card 5: S-011 failed three plan reviews. What happens next?</div>' +
            grow(2, 30, 'r', I['own'], '2.7', 'M6', 'example', 'Stopped: three plan reviews failed') +
            grow(3, 60, 'r', I['branch'], '2.7.2', 'Spec S-011', 'example', 'Stopped · your call') + f'<div class="evs">{s011}</div>' +
            grow(3, 100, 'g', I['branch'], '2.7.1', 'Spec S-010', 'merged', 'Superseded by S-011') + grow(2, 100, 'g', I['ms'], '2.1', 'Design-1', 'reached'))

PH = {'launch': ('4', 'Launch', 0, 'none', 'planned', ['4.1 Launch-1 It’s live']),
      'build': ('3', 'Build', 0, 'none', 'planned', ['3.9 M10 The timeline is the desk’s home', '3.8 M9 The related desk work', '3.7 M8 What needs you comes first', '3.6 M7 Everything the agent team does', '3.1 Build-1 Tests written before the work']),
      'disc': ('1', 'Discovery', 100, 'g', 'done 13 Nov', ['1.8 Discovery-8 A brief ready to rule on', '1.7 Discovery-7 Scope, limits and owners', '1.5 Discovery-5 What already exists', '1.2 Discovery-2 Success defined'])}
def phase_bar(key, where):
    no, name, pct, rag, meta, ms = PH[key]
    body = ''.join(f'<div class="msl">{gauge(100 if key == "disc" else 0, rag, I["ms"], 26)}<span>{E(m)}</span></div>' for m in ms)
    return (f'<div class="pbar {where}" data-ph="{key}"><button type="button" class="pbh" aria-expanded="false">{gauge(pct, rag, f"<span class=pn>{no}</span>", 30)}<b>{name}</b><span class="tm">{meta}</span><span class="chev">›</span></button>'
            f'<div class="pbody">{body}</div></div>')
def design_head():
    return '<div class="dhead">' + grow(1, 14, 'y', '<span class="pn">2</span>', '', 'Design', 'now', 'Waiting on you: stop card 5') + '</div>'

def frame_a():
    return ('<div class="phone"><div class="scr">'
            f'<div class="mapbar">{MAP}</div>' + phase_bar('launch', 'top t1') + phase_bar('build', 'top t2') +
            design_head() + design_body() + phase_bar('disc', 'bot') + '</div></div>')
def frame_b():
    strip = ''.join(f'<button type="button" class="pchip{" on" if k == "design" else ""}" data-ph="{k}">{gauge(p, r, f"<span class=pn>{n}</span>", 30)}<span>{nm}</span></button>'
                    for k, n, nm, p, r in [('disc', '1', 'Discovery', 100, 'g'), ('design', '2', 'Design', 14, 'y'), ('build', '3', 'Build', 0, 'none'), ('launch', '4', 'Launch', 0, 'none')])
    extra = ''.join(f'<div class="xph" data-ph="{k}" hidden>{"".join(f"<div class=msl>{gauge(100 if k == chr(100)+chr(105)+chr(115)+chr(99) else 0, PH[k][3], I["ms"], 26)}<span>{E(m)}</span></div>" for m in PH[k][5])}</div>' for k in ('launch', 'build', 'disc'))
    return ('<div class="phone"><div class="scr">'
            f'<div class="mapbar">{MAP}<div class="strip">{strip}</div></div>' + extra + design_head() + design_body() + '</div></div>')

OPTS = [('a', 'A · The other phases pinned above and below', 'The page opens on the current step with everything in it open. Later phases sit as slim bars pinned under the map, earlier ones pinned at the bottom, each with its gauge. Only the current phase scrolls between them. Tap a pinned phase and it opens in place; then the page scrolls.', frame_a()),
        ('b', 'B · A row of phase gauges under the map', 'The page opens the same way. The phases sit in one row under the map, oldest on the left like the map, with the current one picked out. Tap another phase and its milestones open above the current phase; then the page scrolls.', frame_b())]
CSS = (open(os.path.join(H, '..', '..', 'options-gauges', 'source', 'page.css')).read() + open(os.path.join(H, '..', '..', 'options-event-status', 'source', 'status.css')).read() + open(os.path.join(H, 'open.css')).read())
JS = open(os.path.join(H, 'open.js')).read()
body = ''.join(f'<section class="opt"><div class="hd"><span class="tag">Option</span><h2>{h}</h2><p>{p}</p></div>{f}</section>' for k, h, p, f in OPTS)
page = f'''<title>Opening View</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{CSS}</style>
<main>
<header class="lede"><h1>How the timeline opens</h1>
<p>You said the page should always open on the step we are on, with its sprints, tasks and the rest open, and the other phases fixed, only scrolling when a phase is expanded. Today, in v12, the page opens partway down on Now. The Build phase and its gate sit above, Discovery below, and everything scrolls together (the first picture).</p>
<p>Then two ways to do it. Both use what you have chosen so far: the floating branch map, the tinted gauges on phases, milestones and sprints, and the marks and tags on events and steps. Scroll and tap inside each phone. Percentages marked “example” are made up.</p></header>
<section class="opt"><div class="hd"><span class="tag">Now</span><h2>v12 as it opens</h2></div>
<div class="pair"><figure><img src="now-light.png" alt="v12 opening, light" width="393" height="852"><figcaption>Light</figcaption></figure><figure><img src="now-dark.png" alt="v12 opening, dark" width="393" height="852"><figcaption>Dark</figcaption></figure></div></section>
{body}
</main>
<script>{JS}</script>'''
open(os.path.join(H, '..', 'index.html'), 'w').write(page)
