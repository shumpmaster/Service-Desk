# Builds ../index.html: v12's events as they are (a screenshot: the kind's icon and a grey state word), then three
# status indicators for events and steps, drawn under S-011 with the chosen gauge (round 3, answer 8) on the sprint.
# Usage: python3 build.py <phosphor package/assets>
import os, sys, html
H = os.path.dirname(os.path.abspath(__file__))
A = sys.argv[1]
E = html.escape
def ph(n, w='regular'):
    s = open(os.path.join(A, w, n + ('-' + w if w != 'regular' else '') + '.svg')).read()
    return s.replace('<svg', '<svg aria-hidden="true" focusable="false"')
I = {'commit': ph('git-commit'), 'review': ph('eye'), 'stop': ph('hand-palm'), 'merge': ph('git-merge'), 'branch': ph('git-branch'), 'step': ph('list-checks'),
     'ok': ph('check', 'bold'), 'warn': ph('warning', 'fill'), 'wait': ph('hourglass-medium', 'fill'), 'x': ph('x', 'bold')}

def gauge(pct, rag, inner):
    c = 2 * 3.14159 * 14
    return (f'<span class="gauge"><svg viewBox="0 0 34 34" width="34" height="34"><circle class="trk {rag}" cx="17" cy="17" r="14"/>'
            f'<circle class="arc {rag}" cx="17" cy="17" r="14" stroke-dasharray="{c * pct / 100:.1f} {c:.1f}" transform="rotate(-90 17 17)"/></svg><span class="in">{inner}</span></span>')
# state: what the indicator says. ok = done, fine; wait = waiting on you; bad = failed or blocked
def ev(m, k, state, word, t, title, who, main=False):
    ico = f'<span class="ico{" main" if main else ""} s-{state}">{I[k]}' + (f'<span class="badge s-{state}">{I[{"ok": "ok", "wait": "wait", "bad": "x"}[state]]}</span>' if m == 'b' else '') + '</span>'
    w = f'<span class="st s-{state}">{word}</span>'
    return f'<div class="row">{ico}<div class="tx"><div class="l1"><b>{k.title()}</b>{w}<span class="tm">{t}</span></div><div class="l2">{E(title)}</div><div class="l3">by {who}{" · main" if main else ""}</div></div></div>'
def step(m):
    return ev(m, 'step', 'bad', '5 of 6 · 1 blocked', '', 'The spec writer’s plan, 2.7.2.5', 'spec writer')

def screen(m):
    return ('<div class="sp">' + gauge(60, 'r', I['branch']) + '<div class="tx"><div class="l1"><span class="no">2.7.2</span><b>Spec S-011</b><span class="tm">example</span></div><div class="l3">Stopped · your call</div></div></div>' +
            ev(m, 'stop', 'wait', 'Waiting on you', '15:42', 'Stop card 5', 'orchestrator') +
            ev(m, 'review', 'bad', 'Failed', '15:36', 'Plan review failed, round 3', 'reviewer (plan)') +
            ev(m, 'commit', 'ok', 'Done', '15:23', 'Spec revised again', 'spec writer') + step(m) +
            ev(m, 'review', 'bad', 'Failed', '15:14', 'Plan review failed, round 2', 'reviewer (plan)') +
            ev(m, 'merge', 'ok', 'Done', '14:46', 'Merged PR #446: three questions for you', 'you', True) +
            ev(m, 'commit', 'ok', 'Done', '12:37', 'Spec revised', 'spec writer'))

OPTS = [
 ('a', 'A · The state word in colour', 'The kind’s icon stays as it is. The state word beside it takes a soft tint: yellow for waiting on you, red for failed or blocked. Done stays grey, so colour only marks what needs a look.'),
 ('b', 'B · A small mark on the icon', 'A small check, hourglass or cross sits on the icon’s corner, in green, yellow or red. The state word stays grey. You can read the state without colour.'),
 ('c', 'C · The icon’s disc takes the colour', 'The disc behind the kind’s icon takes a soft wash: yellow for waiting on you, red for failed or blocked, grey when done. The same soft tones as the gauges.'),
]
CSS = open(os.path.join(H, '..', '..', 'options-gauges', 'source', 'page.css')).read() + open(os.path.join(H, 'status.css')).read()
frames = ''.join(f'<section class="opt"><div class="hd"><span class="tag">Option</span><h2>{h}</h2><p>{p}</p></div><div class="phone m{k}"><div class="screen">{screen(k)}</div></div></section>' for k, h, p in OPTS)
page = f'''<title>Event Status</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{CSS}</style>
<main>
<header class="lede"><h1>Status for events and steps</h1>
<p>You said only phases, milestones and sprints get gauges, and events need different status indicators. Today, in v12, an event shows its kind’s icon and its state as a grey word (Done, Failed, Waiting on you), and a step says “5 of 6 done · 1 blocked” in its heading.</p>
<p>Then three ways to show an event’s status, under S-011, with the sprint wearing the tinted gauge you chose, now a little thinner. A step (the agent’s plan between events) is treated like an event. The colours are the gauges’ soft green, yellow and red.</p></header>
<section class="opt"><div class="hd"><span class="tag">Now</span><h2>v12 as it is</h2></div>
<div class="pair"><figure><img src="now-light.png" alt="v12 events, light" width="393" height="760"><figcaption>Light</figcaption></figure><figure><img src="now-dark.png" alt="v12 events, dark" width="393" height="760"><figcaption>Dark</figcaption></figure></div></section>
{frames}
</main>'''
open(os.path.join(H, '..', 'index.html'), 'w').write(page)
