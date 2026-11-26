# Writes ../index.html and ../README.md: how a gate, a decision, research and a stop show (round 8, answer 7).
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, sys, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
# the round 8 options pages' stylesheet and phone markup, taken from their builder without running it
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
class R8: CSS = _ns['CSS']; phone = staticmethod(_ns['phone'])
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=p, hash=hash, rec=rec)
KINDS = [
 dict(id='gate', n='1', short='Gate', h='A gate: your ruling on a whole phase',
  found='Three gates, all yours: the Design gate (passed: you said hold, then proceed, 13 Nov), the Build gate (you approve Design’s criteria, then they freeze) and the Launch gate (the go-live and the graduation). Each takes proceed, hold, recycle or kill, on a case with the Critic’s view beside it. In v34 each is one thin 12-point grey line between phases, not tappable, with its time still in UTC; the phase menu shows the same line; the map shows none.',
  ruling='round 7, answer 20 (every phase and gate kept in the list) and answer 22 (the phase pill’s menu).',
  rec='A, a row of its own. A gate is your ruling on the whole phase, so it gets a row as findable as a milestone, with its state, what it waits for, and the map’s two edges marking where the phase starts and ends.',
  opts=[ph('v34 as it is', 'A thin line between phases', 'The Design gate and the Build gate in the list; nothing opens.', 'now.at=Build_gate'),
        ph('v34 as it is', 'The phase menu', 'Gates are lines between the phases.', 'now.menu'),
        ph('Option A', 'A row of its own, closing its phase', 'GATE, its name, its state and Yours; one line on what it decides and how far its phase has come. On the map, the gate in and the gate out stand at the two edges.', 'gA.at=Build_gate', True),
        ph('Option A', 'Tapped: what it decides and waits for', 'The sheet: what it decides, every milestone it waits for as the list reads them, what you will get, and your four choices once it opens.', 'gA.at=Build_gate.open=g:Build_gate', True),
        ph('Option A', 'In the phase menu', 'Each gate with its mark and its state: passed, yours next, yours.', 'gA.menu', True),
        ph('Option B', 'Inside the phase heading', 'No gate rows: each phase heading says how it was entered and carries a chip for the gate that closes it; the chip opens the same sheet. The menu drops its gate lines.', 'gB.at=Then:_Build_gate')]),
 dict(id='decision', n='2', short='Decision', h='A decision: whose ruling, in whose words',
  found='Your rulings are recorded word for word in decisions/ (for example stop card 4: “criteria-wrong (Recommended)”), and the Orchestrator then applies them (“New spec S-011, rounds reset”). Some were made for you under a standing proxy (the readiness resubmit, under L-0049). In v34 a decision row says Decision, Done, its title and “by orchestrator”, with no sign it carries your ruling, and nothing opens.',
  ruling='round 6, answers 3 and 6 (a decision is a turning point, drawn heavier); none set aside.',
  rec='A, the title kept with your words under it. The row still says what happened; Yours and your quoted words say whose ruling it was, and the sheet shows the choices it had and its record.',
  opts=[ph('v34 as it is', 'A decision row', '“New spec S-011, rounds reset”, by orchestrator.', 'now.at=rounds_reset'),
        ph('Option A', 'Yours, and your words under the title', 'A Yours mark (or By proxy) after its state, and “Applies your words: criteria-wrong (Recommended)” under the title.', 'dA.at=rounds_reset', True),
        ph('Option A', 'Tapped: the ruling and its record', 'Your words, who applied it and when, what it changed, the choices it had, and the record it is filed in.', 'dA.at=rounds_reset.open=d:New_spec_S-011,_rounds_reset', True),
        ph('Option B', 'Your words as the title', 'The quote becomes the row’s title and what it did moves to the line under it; tapping opens the same sheet.', 'dB.at=criteria-wrong')]),
 dict(id='research', n='3', short='Research', h='Research: a question, a memo and its check',
  found='Each research request names the milestone it serves (Q-028: Discovery-5, What already exists is known). A researcher writes a graded memo, and a source checker passes or fails it; Q-028 failed twice and passed on the third check. v34 does show it, inside Discovery-5, but as a SPRINT named Q-028 whose events are memos and checks; its question, grades and the decision it serves are not shown anywhere. (The first review’s note that research does not appear at all was wrong: it is there, folded in Discovery.)',
  ruling='none set aside; the milestone and sprint shapes stay on hold.',
  rec='A, Research in place of Sprint, with a Memo tag. Research is a piece of work with its own steps and its own checker, like a sprint; naming it, and opening its question, how sure it is and what it serves, answers why it was done.',
  opts=[ph('v34 as it is', 'A research sprint, in Discovery', 'Discovery-5 opened: SPRINT 1.5.1 Q-028, with its six steps on the map.', 'now.d5'),
        ph('Option A', 'RESEARCH, with a Memo tag', 'The level reads Research; its line says how its check went; the Memo tag and each of its steps open the sheet; the map’s lane reads Research Q-028.', 'rA.d5', True),
        ph('Option A', 'Tapped: question, steps, how sure', 'The question, the decision it serves and its milestone, each memo and check in order, its grades, and the records.', 'rA.d5.open=r:Q-028', True),
        ph('Option B', 'One row in its milestone', 'The sprint level goes: one row says Research, Passed, the topic and how it went; tapping opens the same sheet.', 'rB.d5')]),
 dict(id='stop', n='4', short='Stop', h='A stop: which rule fired, what it holds up, your answer',
  found='The stop rule fires after three failed plan rounds or three failed build rounds. Triage traces the cause, and you get one card with fixed choices: re-specify, re-scope, drop, one focused confirmation, or criteria-wrong (stop card 5: S-011 failed three plan reviews; it holds up M6, M7 and M8; the Chief of Staff recommends criteria-wrong). In v34 the stop row says Stop, Waiting on you and “Stop card 5”; it does not say why, what it holds up, or how to answer, and tapping it opens nothing.',
  ruling='none set aside. Both reviews found no way to answer from the project page; this is that answer.',
  rec='A, an Answer button on the row. The stop says which rule fired and what it holds up where it happened, and the card’s fixed choices, with the recommended one, are one tap away.',
  opts=[ph('v34 as it is', 'The stop row', 'Stop card 5, Waiting on you.', 'now.at=Stop_card_5'),
        ph('Option A', 'Yours, the rule, and Answer', '“Yours · waiting”, the rule that fired and what it holds up, and an Answer button under it.', 'sA.at=Stop_card_5', True),
        ph('Option A', 'Tapped: why, and your choices', 'Why it stopped, Triage’s cause, then each choice with what it does and the recommended one edged in blue. Tapping one says what the desk would record; the mockup sends nothing.', 'sA.at=Stop_card_5.open=s:Stop_card_5', True),
        ph('Option B', 'The sprint wears the stop', 'A yellow band under S-011’s heading says it stopped, why, and what it holds up, with Answer; the rows after the stop are dimmed as held up.', 'sB.at=Stopped')]),
]
GAPS = ('<p><b>Where the records fall short.</b> Whether the desk’s answer link can record a stop card’s answer, as it does a question’s, is not in the records read here; the Answer buttons are an example and send nothing. '
        'The planned decision “S-011 frozen” is the mockup’s own example. A gate’s “what it waits for” is read from the list as v34 shows it. Times on the sheets are Chicago time, converted from the records’ UTC.</p>')
def item(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['n'] + '. ' + it['h']) + '</h2><div class="meta"><span><b>In the records:</b> ' + E(it['found']) + '</span>'
            '<span><b>Touches:</b> ' + E(it['ruling']) + '</span></div><div class="why">Recommended: ' + E(it['rec']) + '</div>'
            '<div class="phones">' + ''.join(R8.phone(o) for o in it['opts']) + '</div></section>')
body = ('<title>Gates, decisions, research, stops</title>\n' + R8.CSS + '\n<main><div class="lede"><h1>How a gate, a decision, research and a stop show</h1>'
        '<p>What you said: “Start drawing” (round 8, answer 7). Each kind starts with v34 as it is, then each option, live: scroll and tap inside the phones. The recommended one has a blue edge. '
        'The four A options are one family: each opens a sheet when tapped, each uses one Yours mark for what is yours, and each keeps its own icon (flag, speech, magnifier, hand). Colour stays the soft status colours and the one blue; the milestone and sprint shapes are untouched.</p>'
        + GAPS + '<nav class="toc">' + ''.join('<a href="#' + it['id'] + '">' + E(it['n'] + '. ' + it['short']) + '</a>' for it in KINDS) + '</nav></div>'
        + ''.join(item(it) for it in KINDS) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: how a gate, a decision, research and a stop show (round 8, answer 7)\n\n'
  'Built over mockup v34 (`../timeline-v34-craft.html`). `source/build.py` writes `phone.html` (v34 with `source/kn.css` and `source/kn.js`, each option switched on by the phone\'s hash); `source/page.py` writes `index.html`, using the round 8 options pages\' stylesheet (`../options-r8/source/pages.py`).\n\n'
  '| Kind | v34 as it is | Option A (recommended) | Option B |\n|---|---|---|---|\n'
  '| Gate | a thin grey line between phases; nothing opens; menu line; nothing on the map | a row of its own closing its phase, its state and Yours; the map\'s edges mark the gate in and out; a sheet with what it decides and waits for; menu rows with state | no gate rows: the phase heading says how it was entered and carries a chip for the next gate; menu drops gates |\n'
  '| Decision | Decision, Done, title, by orchestrator | Yours (or By proxy) and your quoted words under the title; a sheet with the ruling, the choices it had and its record | your words as the title |\n'
  '| Research | SPRINT Q-028 inside Discovery-5 | RESEARCH in place of SPRINT, a Memo tag; a sheet with the question, steps, grades and what it serves; the lane reads Research | one row in its milestone, no sprint level |\n'
  '| Stop | Stop, Waiting on you, Stop card 5 | Yours · waiting, the rule and what it holds up, an Answer button; a sheet with why and the card\'s choices | a yellow band under the sprint with Answer; rows after it dimmed |\n\n'
  'Records behind the sheets: OPERATING_MODEL.md §2 to §4 (Personal-Org-Operating-Model: phase gates S-024, stop rule D-044, decision cards D-019); docs/gates/P-005/; decisions/P-005/ (dor-fail-1, dor-2, dor-3, stop-4, stop-5 and their notes); docs/LEDGER.md L-0008, L-0049; research/Q-028*.md and intake/requests/Q-028.toml; status/P-005.toml.\n\n'
  'Not in the records: whether the desk\'s answer link can record a stop card\'s answer (the Answer buttons send nothing); the planned decision "S-011 frozen" is the mockup\'s example.\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
