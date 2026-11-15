# Builds ../index.html: three ways for the branch map to float at the top of the timeline and move with it,
# as scrollable phone frames. Content: the Design phase's real sprints and events, from timeline-v12-craft.html.
# Neutral, as v12: gauges, colour and how the page opens are separate questions (round 3, answers 4 and 5).
# Usage: python3 build.py <phosphor package/assets>
import json, os, sys
H = os.path.dirname(os.path.abspath(__file__))
A = sys.argv[1]
def ph(n, w='regular'):
    s = open(os.path.join(A, w, n + ('-' + w if w != 'regular' else '') + '.svg')).read()
    return s.replace('<svg', '<svg aria-hidden="true" focusable="false"')
KINDS = {"commit": "git-commit", "check": "play-circle", "review": "eye", "merge": "git-merge", "decision": "chat-circle-text", "stop": "hand-palm", "branch": "git-branch"}
ICONS = {k: ph(v) for k, v in KINDS.items()}

def t(day, hm): h, m = hm.split(':'); return (day - 13) * 1440 + int(h) * 60 + int(m)
# milestones newest first, each with its sprints newest first; events oldest first
DATA = [
 {"no": "2.5", "id": "Design-5", "name": "The design fits together", "sprints": [
   {"no": "2.5.2", "name": "Mockups v2 to v4", "label": "on a branch", "open": True, "ev": [
     (t(14,'14:56'), 'commit', 'Done', 'chief of staff', 'Motion map'), (t(14,'15:26'), 'commit', 'Done', 'chief of staff', 'v2: the desk as a trunk'),
     (t(14,'15:52'), 'commit', 'Done', 'chief of staff', 'v3: the motion pass'), (t(14,'16:00'), 'commit', 'Done', 'chief of staff', 'v3: the past shaded lighter'),
     (t(14,'16:14'), 'commit', 'Done', 'chief of staff', 'v4: projects open on their plan')]},
   {"no": "2.5.1", "name": "PR #445", "label": "the first mockup, merged", "open": False, "ev": [
     (t(14,'12:05'), 'commit', 'Done', 'chief of staff', 'First timeline mockup'), (t(14,'12:12'), 'check', 'Done', 'Actions', 'Checks passed'),
     (t(14,'13:54'), 'merge', 'Done', 'you', 'Merged PR #445')]}]},
 {"now": True},
 {"no": "2.7", "id": "M6", "name": "The records can carry the timeline", "sprints": [
   {"no": "2.7.2", "name": "Spec S-011", "label": "stopped · your call", "open": True, "ev": [
     (t(14,'12:07'), 'decision', 'Done', 'orchestrator', 'New spec S-011, rounds reset'), (t(14,'12:16'), 'commit', 'Done', 'spec writer', 'First draft'),
     (t(14,'12:29'), 'review', 'Failed', 'reviewer (plan)', 'Plan review failed, round 1'), (t(14,'12:37'), 'commit', 'Done', 'spec writer', 'Spec revised'),
     (t(14,'14:46'), 'merge', 'Done', 'you', 'Merged PR #446: three questions for you'),
     (t(14,'15:14'), 'review', 'Failed', 'reviewer (plan)', 'Plan review failed, round 2'), (t(14,'15:23'), 'commit', 'Done', 'spec writer', 'Spec revised again'),
     (t(14,'15:36'), 'review', 'Failed', 'reviewer (plan)', 'Plan review failed, round 3'), (t(14,'15:42'), 'stop', 'Waiting on you', 'orchestrator', 'Stop card 5')]},
   {"no": "2.7.1", "name": "Spec S-010", "label": "superseded by S-011", "open": False, "ev": [
     (t(13,'21:32'), 'commit', 'Done', 'spec writer', 'First draft, and experiments E1 and E2 registered'), (t(13,'21:44'), 'review', 'Failed', 'reviewer (plan)', 'Plan review failed'),
     (t(13,'23:45'), 'commit', 'Done', 'spec writer', 'Spec revised'), (t(13,'23:51'), 'review', 'Failed', 'reviewer (plan)', 'Plan review failed'),
     (t(14,'01:05'), 'stop', 'Done', 'orchestrator', 'Stop card 4'), (t(14,'04:56'), 'merge', 'Done', 'you', 'Merged PR #443: the card’s notes and two questions'),
     (t(14,'04:58'), 'decision', 'Done', 'you', 'You said: write a new spec'), (t(14,'12:04'), 'merge', 'Done', 'you', 'Merged PR #444: the answer, the number fix, the pack fix')]}]},
 {"no": "2.1", "id": "Design-1", "name": "Done defined in real scenarios", "why": "Reached by the spec’s scenarios; no sprint on record."},
]
CSS = open(os.path.join(H, 'page.css')).read()
JS = open(os.path.join(H, 'map.js')).read()
OPTS = [
 ('window', 'B · As you chose it', 'Icons for the events you can see below, dots for the rest of the phase. All neutral.', 'window', ''),
 ('colour', 'B with colour', 'The same, with the rows’ soft tones: red for a failed review or a blocked step, yellow for what waits on you (here Now, the stop, stays blue). Done stays grey. The dots carry it too, so the whole phase shows where the trouble was.', 'window', ' col'),
]
frames = ''.join(f'<section class="opt"><div class="hd"><span class="tag">{"Chosen" if k == "window" else "Option"}</span><h2>{h}</h2><p>{p}</p></div><div class="phone st-{s}{c}" data-mode="a" data-st="{s}"></div></section>' for k, h, p, s, c in OPTS)
page = f'''<title>Map Event Icons</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>{CSS}</style>
<main>
<header class="lede"><h1>Event icons on the branch map</h1>
<p>You chose B: icons for the events in view, dots for the rest. You asked whether colour on them adds anything. First B as you chose it, then B with colour. Scroll inside each phone; the map moves once you scroll.</p></header>
<section class="opt"><div class="hd"><span class="tag">Now</span><h2>v12 as it is</h2><p>Lanes down the left of the open milestone. No map.</p></div>
<div class="pair"><figure><img src="now-light.png" alt="v12 lanes, light" width="393" height="760"><figcaption>Light</figcaption></figure><figure><img src="now-dark.png" alt="v12 lanes, dark" width="393" height="760"><figcaption>Dark</figcaption></figure></div></section>
{frames}
</main>
<script>var DATA = {json.dumps(DATA)}; var ICONS = {json.dumps(ICONS)};
{JS}</script>'''
open(os.path.join(H, '..', 'index.html'), 'w').write(page)
