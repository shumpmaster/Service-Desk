# Builds ../index.html: v12 as it is (a screenshot: phases fold from a chevron, milestones from their row,
# icons do nothing), then three ways for the icons to fold and unfold sections, as live phone frames you can tap.
# Content: M6's real events (timeline-v12-craft.html), drawn in the branch-map layout the owner chose (round 3, answer 3).
# Usage: python3 build.py <phosphor package/assets>
import json, os, sys, html
H = os.path.dirname(os.path.abspath(__file__))
A = sys.argv[1]
I = json.load(open(os.path.join(H, '..', '..', 'options-lane-ideas', 'source', 'icons.json')))
def ph(n, w='regular'):
    s = open(os.path.join(A, w, n + ('-' + w if w != 'regular' else '') + '.svg')).read()
    return s.replace('<svg', '<svg aria-hidden="true" focusable="false"')
I['Branch'] = ph('git-branch'); I['Steps'] = ph('list-checks'); I['ms'] = ph('circle'); I['own'] = ph('square'); I['caret'] = ph('caret-down', 'bold')
E = html.escape
CSS = open(os.path.join(H, '..', '..', 'options-lane-ideas', 'source', 'page.css')).read() + open(os.path.join(H, 'fold.css')).read()

def ico(k, cls=''):
    inner = I[k] if k in I else f'<span class="num">{k}</span>'
    return f'<span class="ico {cls}">{inner}</span>'

def ev(t, k, st, who, title):
    m = k == 'Merge'
    return (f'<div class="row ev">{ico(k, "main" if m else "")}<div class="tx"><div class="l1"><b>{k}</b><span class="st">{E(st)}</span><span class="tm">{t}</span></div>'
            f'<div class="l2">{E(title)}</div><div class="l3">by {E(who)}{" · main" if m else ""}</div></div></div>')

STEP = [('ok', '5.6', 'Settle what “acting for you” means'), ('blocked', '5.5', 'Move the experiments to the new spec'),
        ('ok', '5.4', 'Say which version the check tests'), ('ok', '5.3', 'Hold the phone-width check'),
        ('ok', '5.2', 'Let the builder update the widget’s copy'), ('ok', '5.1', 'Make sure no alert is missed')]
def step_items():
    return ''.join(f'<div class="act {a}"><span class="mk">{"✓" if a == "ok" else "!"}</span><span class="n">{n}</span>{E(t)}</div>' for a, n, t in STEP)

def MAP():
    return ('<svg class="map" viewBox="0 0 330 70" width="100%" aria-label="Branch map of M6">'
            '<path class="g main" d="M4 50 H326"/>'
            '<path class="g" d="M10 50 C18 50 18 20 26 20 H120"/><path class="g" d="M100 20 C108 20 108 50 116 50"/><path class="g" d="M120 20 C128 20 128 50 136 50"/>'
            '<path class="g sel" d="M140 50 C148 50 148 20 156 20 H318"/>'
            + ''.join(f'<circle class="dot" cx="{26+i*16}" cy="20" r="3.5"/>' for i in range(6))
            + '<circle class="dot main" cx="116" cy="50" r="3.5"/><circle class="dot main" cx="136" cy="50" r="3.5"/>'
            + ''.join(f'<circle class="dot cur" cx="{156+i*20}" cy="20" r="3.5"/>' for i in range(8)) +
            '<circle class="dot now" cx="318" cy="20" r="5"/><text x="26" y="9" class="lb">S-010</text><text x="156" y="9" class="lb on">S-011</text></svg>')

# a foldable section: head row (icon + words), count of what is inside, body
def sec(key, icon, icls, no, name, meta, count, body, open_, level, cls=''):
    return (f'<div class="sec lv{level} {cls}{" open" if open_ else ""}" data-key="{key}">'
            f'<div class="hdrow"><button type="button" class="tog" aria-expanded="{str(open_).lower()}" aria-label="Open or fold {E(name)}">{ico(icon, icls)}<span class="cnt">{count or ""}</span><span class="cr">{I["caret"]}</span></button>'
            f'<div class="tx"><div class="l1"><span class="no">{no}</span><b>{E(name)}</b><span class="tm">{meta}</span></div></div><span class="go" aria-hidden="true">›</span></div>'
            f'<div class="body">{body}</div></div>')

def content():
    s011 = (ev('15:42', 'Stop', 'Waiting on you', 'orchestrator', 'Stop card 5') + ev('15:36', 'Review', 'Failed', 'reviewer (plan)', 'Plan review failed, round 3') +
            ev('15:23', 'Commit', 'Done', 'spec writer', 'Spec revised again') +
            sec('st', 'Steps', '', '2.7.2.5', 'The spec writer', '5 of 6 · 1 blocked', 6, step_items(), False, 4, 'step') +
            ev('15:14', 'Review', 'Failed', 'reviewer (plan)', 'Plan review failed, round 2') +
            '<div class="more">5 earlier</div>')
    s010 = (ev('12:04', 'Merge', 'Done', 'you', 'Merged PR #444: the answer, the number fix, the pack fix') + ev('04:58', 'Decision', 'Done', 'you', 'You said: write a new spec') + '<div class="more">6 earlier</div>')
    m6 = MAP() + sec('s011', 'Branch', '', '2.7.2', 'Spec S-011', 'your call', 9, s011, True, 3) + sec('s010', 'Branch', '', '2.7.1', 'Spec S-010', 'superseded', 8, s010, False, 3)
    design = (sec('d5', 'ms', 'hol', '2.5', 'Design-5', 'planned', 1, '<div class="why">The join-up review, which these mockups feed.</div>', False, 2) +
              sec('d3', 'ms', 'hol', '2.3', 'Design-3', 'planned', 1, '<div class="why">Experiments E1 and E2 are registered; their runs are still to come.</div>', False, 2) +
              '<div class="nowcard"><span>Now</span>Stop card 5: S-011 failed three plan reviews. What happens next?</div>' +
              sec('m6', 'own', '', '2.7', 'M6', 'in progress', 2, m6, True, 2) +
              sec('d1', 'ms', 'done', '2.1', 'Design-1', 'reached', 0, '<div class="why">Reached by the spec’s scenarios; no sprint on record.</div>', False, 2))
    return sec('p2', '2', 'phase', '', 'Design', 'now', 6, design, True, 1) + sec('p1', '1', 'phase', '', 'Discovery', 'done 13 Nov', 5, '<div class="why">Five milestones reached.</div>', False, 1)

OPTS = [
 ('a', 'A · A count on the icon', 'Every level has an icon, and the icon opens or folds what is under it. A folded icon carries a small count of what is inside. Tapping the words opens the detail, as today.'),
 ('b', 'B · A ring and a caret on the icon', 'Icons that open something sit in a raised ring with a small caret, so they look pressable. The whole row opens or folds; the › at the right opens the detail.'),
 ('c', 'C · One open at a time', 'As A, but opening one section folds the ones beside it into a single line, so only one milestone, one sprint and one step are open at once. The rest is summed up as “3 more”.'),
]
body = ''.join(f'<section class="opt"><div class="hd"><span class="tag">Option</span><h2>{h}</h2><p>{p}</p></div><div class="phone fold-{k}" data-mode="{k}"><div class="screen">{content()}</div></div></section>' for k, h, p in OPTS)
JS = open(os.path.join(H, 'fold.js')).read()
page = f'''<title>Fold by Icon</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{CSS}</style>
<main>
<header class="lede"><h1>Icons that open and fold</h1>
<p>You said the icons on the timeline should expand or collapse sections. First v12 as it is: a phase folds from the chevron at the right of its heading, a milestone opens when you tap its row, a step folds from its own caret, and a sprint cannot fold. The icons do nothing.</p>
<p>Then three ways the icons could do it. Each is drawn with M6's real events in the branch-map layout you chose, and you can tap the icons. Phase, milestone, sprint and step each get an icon; an event's icon stays its kind.</p></header>
<section class="opt"><div class="hd"><span class="tag">Now</span><h2>v12 as it is</h2></div>
<div class="pair"><figure><img src="now-light.png" alt="v12, light" width="393" height="640"><figcaption>Light</figcaption></figure><figure><img src="now-dark.png" alt="v12, dark" width="393" height="640"><figcaption>Dark</figcaption></figure></div></section>
{body}
</main>
<script>{JS}</script>'''
open(os.path.join(H, '..', 'index.html'), 'w').write(page)
