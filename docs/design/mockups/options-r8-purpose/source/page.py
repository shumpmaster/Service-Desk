# Writes ../index.html and ../README.md: what on the timeline serves no purpose, and what is missing (round 8, answer 10).
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS']; phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
ITEMS = [
 dict(id='figures', n='1', short='Figures said twice', grp='Cut or merge', h='The same figure said two or three times',
  found='Still in v35. A milestone shows 100 in its ring and “Reached · 100%” under its name; a sprint shows ten squares, then “12 events · stopped · your call · 9 done · 75%”; the Design heading shows 14%, “1 of 7 milestones reached” and the strip of its milestones.',
  ruling='round 7, answers 10 to 13 (the strip, the percent in the ring, the sprint squares): all kept; only the words change.',
  rec='A. The drawings already give the share, so the words give the count once (“9 of 12 done”) and no percent; each number is said once.',
  rx='None needed: every count is already on the page.',
  opts=[ph('v35 as it is', 'Ring, squares and words', 'Design-1, M6 and both sprints, as they read today.', 'now.at=Spec_S-010'),
        ph('Option A', 'Counts in words, shares in drawings', 'No percent in the words; a sprint reads “stopped · your call · 9 of 12 done”; the heading drops its 14%.', '1A.at=Spec_S-010', True),
        ph('Option B', 'One line, percent kept', 'Only the repeated count goes: “stopped · your call · 9 of 12 done · 75%”; milestones keep “Reached · 100%”.', '1B.at=Spec_S-010')]),
 dict(id='by', n='2', short='“by …” lines', grp='Cut or merge', h='The “by orchestrator”, “by reviewer (plan)” lines',
  found='Still in v35, under most events: “by spec writer” on every commit, “by reviewer (plan)” on every review, “by orchestrator” on a decision. Some of these lines also carry something else worth keeping (“with six answers for the spec writer”, “they still wait on you”).',
  ruling='no ruling set aside.',
  rec='A. A line stays only when it says something the event’s kind does not already say: a commit is the spec writer’s and a review the plan reviewer’s, so those go; “by you”, an unusual actor and any extra words stay.',
  rx='None needed.',
  opts=[ph('v35 as it is', 'A line under each event', 'Spec revised again, the third failed review and the stop.', 'now.at=Spec_revised_again'),
        ph('Option A', 'Only when it adds something', 'The usual actor for each kind is dropped; the rest of the line stays; a line with nothing left goes.', '2A.at=Spec_revised_again', True),
        ph('Option B', 'Who did it, inside the link', 'Every “by …” goes from the list except yours; the link bubble says “Done by the spec writer”.', '2B.at=Spec_revised_again.sess=Spec_revised_again')]),
 dict(id='now', n='3', short='The Now card', grp='Cut or merge', h='The Now card repeating Stop card 5',
  found='Still in v35. Since round 8 the page opens, and the round button lands, on Stop card 5 itself; the Now card says the same again (“Stop card 5: S-011 failed three plan reviews. What happens next?”) and sits under milestone 2.3, outside M6 and S-011 where the stop happened.',
  ruling='round 3, answer 4 (the Now card, kept since v12) would be set aside by A; round 8, answer 6 (landing on what waits) is why it is no longer needed.',
  rec='A. The stop already sits at the pointer when the page opens; a blue NOW on it says the same without a second card in the wrong place.',
  rx='None needed.',
  opts=[ph('v35 as it is', 'The Now card, under Design-5', 'Scrolled to where the card sits, after M6.', 'now.at=The_design_fits_together'),
        ph('Option A', 'NOW on the stop itself', 'No Now card; Stop card 5 wears a blue NOW tag, and the page and the round button land on it as now.', '3A', True),
        ph('Option B', 'A slim Now line under the band', 'No card in the list; one line floats under the band and jumps to the stop when tapped.', '3B')]),
 dict(id='waits', n='4', short='What waits on you', grp='Add', h='A list of what waits on you, on the project page',
  found='Still missing in v35. The project pill says 4, but the page shows only the stop; the three questions of PR #446 appear only inside event 2.2.2.5’s Needs tag. Home lists all four.',
  ruling='round 7, answer 22 (the two pills): the pill’s look is kept; A gives its count a tap.',
  rec='A. The count already says 4; tapping it shows the 4, each with what it holds up, how long it has waited, Answer and Go to it, and the list stays as it is.',
  rx='Answering a question from the desk: no record says the desk can record a question’s answer; the Answer button is an example.',
  opts=[ph('v35 as it is', 'The count, with nothing behind it', 'The 4 on the project pill; tapping it opens the projects.', 'now'),
        ph('Option A', 'The count opens what waits', 'Tap the 4: a sheet with the stop and the three questions, the longest first among each kind; Answer, or Go to it.', '4A.waits', True),
        ph('Option B', 'A “Waiting on you” group at the top', 'Four rows under the Design heading, each with what it holds up and its wait; tapping one goes to it.', '4B.top')]),
 dict(id='work', n='5', short='Who is at work', grp='Add', h='Who is at work now, and on what',
  found='Missing in v35. At 11:25 am the Chief of Staff session of 14 November is running (since 7:52 am: “follow S-011 through its plan reviews”), its four helpers have finished, and the pipeline is stopped at stop card 5.',
  ruling='P-001 design discovery, answer 8 (“I want to know all the agents that are working, what they’re working on, why”).',
  rec='A. Shown where the work is, right under the stop the page opens on, it costs the band no room (round 7, answers 21 and 22, and round 8’s map fold); its sheet says who, on what, since when, and that the pipeline waits.',
  rx='Whether a pipeline run is under way right now: no record says so; the desk would read GitHub’s run status. The Chief of Staff’s start and what it set out to do are in its session lines.',
  opts=[ph('v35 as it is', 'Nothing says who is at work', 'The stop and the rows after it.', 'now'),
        ph('Option A', 'An “At work now” row where the work is', 'A pulsing blue dot, the session, what it is doing and since when, under the stop; tap for the sheet.', '5A', True),
        ph('Option A', 'Tapped: who, on what, since when', 'The Chief of Staff, its helpers, and the pipeline’s state, from the records.', '5A.work', True),
        ph('Option B', 'One line in the band', 'Always in view, under the top row; the band grows by one line.', '5B')]),
 dict(id='new', n='6', short='New since you looked', grp='Add', h='A “new since you last looked” mark',
  found='Missing in v35.',
  ruling='P-001 design discovery, answer 8 (“"New since you last looked" markers? Yes absolutely”).',
  rec='A. A small blue dot on each new row and a count on the phase heading show what changed without moving anything; the dots clear once you have seen them.',
  rx='When you last looked: no record holds it; the desk would keep it on your phone. The time here (13 Nov, 11:00 pm) is an example, just after your last ruling that night.',
  opts=[ph('v35 as it is', 'Nothing marks what is new', 'Around the stop.', 'now.at=Spec_revised_again'),
        ph('Option A', 'A dot on each new row', 'A blue dot before the number of each row since you last looked; the Design heading adds a count (“· 9 new”).', '6A.at=Spec_revised_again', True),
        ph('Option B', 'A “last looked” line', 'One line across the list, as in a chat: everything under it is new.', '6B.s010.at=Merged_PR_%23444')]),
 dict(id='wait', n='7', short='How long it waited', grp='Add', h='How long each wait or stop lasted, and is lasting',
  found='Missing in v35 on the timeline itself: only the Now card and home say “waiting 1 h 43 min”. Stop card 4 waited 3 h 53 min (7:05 to 10:58 pm, 13 Nov); stop card 5 has waited 1 h 43 min and PR #446’s questions 2 h 39 min.',
  ruling='no ruling set aside.',
  rec='A. On the row that waited: a finished wait in grey, a running one in yellow, so a slow answer shows where it happened.',
  rx='None needed: the card times are in dispatch-log/2026-11.jsonl, the answers in decisions/P-005/.',
  opts=[ph('v35 as it is', 'Stop card 4, no wait shown', 'S-010 opened at its stop.', 'now.s010.at=Stop_card_4'),
        ph('Option A', 'On the row: a finished wait', 'Stop card 4: “waited 3 h 53 min”.', '7A.s010.at=Stop_card_4', True),
        ph('Option A', 'On the row: a wait still running', 'Stop card 5: “waiting 1 h 43 min”, in yellow.', '7A', True),
        ph('Option B', 'Totalled on the sprint', 'S-010 “waited on you 3 h 53 min”; S-011 “waiting on you 2 h 39 min so far”; the rows unchanged.', '7B.at=Spec_S-010')]),
 dict(id='usage', n='8', short='Tokens and context', grp='Add', h='Tokens and context use',
  found='Missing in v35. The Chief of Staff’s session lines record each helper’s tokens (174 of 184 helper lines); the session of 14 November had 4 helpers and 139,766 tokens. Every session’s end line has fields for its own tokens, context window and context peak, but all 49 are empty. A pipeline run records its model and turn limit, not its tokens.',
  ruling='P-001 usage and context, ruling B (“It’s important for me to see timelines and context windows to be able to drive things”).',
  rec='A. In the session’s link bubble, beside “Open in Claude”, where you already go to check a session: what it used and how full its context got.',
  rx='A session’s own tokens and context peak (the end-line fields exist but are empty); a pipeline run’s tokens. The context figures here are examples.',
  opts=[ph('v35 as it is', 'A session’s link bubble', 'The 14 November session, opened from Spec revised again.', 'now.at=Spec_revised_again.sess=Spec_revised_again'),
        ph('Option A', 'In the link bubble', '“Used: 4 helpers, 139,766 tokens” and a context meter (an example), under the session.', '8A.at=Spec_revised_again.sess=Spec_revised_again', True),
        ph('Option B', 'On each sprint', 'S-011 “140k tokens by helpers” and a context meter (an example); S-010 “no tokens recorded”.', '8B.at=Spec_S-010')]),
]
def item(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['n'] + '. ' + it['h']) + '</h2><div class="meta"><span><b>' + E(it['grp']) + '.</b> <b>In v35:</b> ' + E(it['found']) + '</span>'
            '<span><b>Touches:</b> ' + E(it['ruling']) + '</span><span><b>Records missing:</b> ' + E(it['rx']) + '</span></div><div class="why">Recommended: ' + E(it['rec']) + '</div>'
            '<div class="phones">' + ''.join(phone(o) for o in it['opts']) + '</div></section>')
DROPPED = ('<p><b>Dropped from the reviews’ lists, because v33 to v35 already answered them:</b> the same “Claude” word on every event (tags now name their session), “0” in rings with nothing on record (dashed rings), gates as thin grey lines and research not shown (v35), and no way to answer a stop (v35’s Answer). '
           'The MILESTONE label on every row stays: you asked for labels (round 7, answer 9).</p>')
body = ('<title>What serves no purpose, what is missing</title>\n' + CSS + '\n<main><div class="lede"><h1>What on the timeline serves no purpose, and what is missing</h1>'
        '<p>What you said: “Draw those options next” (round 8, answer 10). Three things to cut or merge, then five to add, each first as v35 shows it, then each option, live: scroll and tap inside the phones. The recommended one has a blue edge. '
        'Drawn from the two reviews’ lists (docs/design/audit-2026-11-25-v32-review.md, section 3) and your earlier asks. Colour stays the soft status colours and the one blue; shapes untouched.</p>'
        + DROPPED + '<nav class="toc">' + ''.join('<a href="#' + it['id'] + '">' + E(it['n'] + '. ' + it['short']) + '</a>' for it in ITEMS) + '</nav></div>'
        + ''.join(item(it) for it in ITEMS) + '</main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
rows = ''.join('| ' + it['n'] + '. ' + it['short'] + ' | ' + it['grp'] + ' | ' + it['rec'].replace('|', '/') + ' | ' + it['rx'].replace('|', '/') + ' |\n' for it in ITEMS)
readme = ('# Options: what on the timeline serves no purpose, and what is missing (round 8, answer 10)\n\n'
  'Built over mockup v35 (`../timeline-v35-craft.html`). `source/build.py` writes `phone.html` (v35 with `source/pp.css` and `source/pp.js`, each option switched on by the phone\'s hash); `source/page.py` writes `index.html`, using the round 8 options pages\' stylesheet (`../options-r8/source/pages.py`).\n\n'
  '| Item | Kind | Recommended | Records missing (for the records request to the building session) |\n|---|---|---|---|\n' + rows +
  '\nRecords behind the options: status/P-005.toml; decisions/P-005/stop-4.md, stop-5-notes.md; dispatch-log/2026-11.jsonl; sessions/chief-of-staff/session_01QBwHGL7cLBqyQ4o1BxNuyh.jsonl (start, what it set out to do, 4 helpers, 139,766 tokens); every session end line\'s usage fields (empty in all 49); reviews/*/_control/*.json (a pipeline run\'s model and turn limit). '
  'Owner asks: decisions/questions/P-001-design-discovery.md answer 8; P-001-usage-and-context.md ruling B.\n\n'
  'Examples, not records: when the owner last looked (13 Nov, 11:00 pm); every context figure; the question\'s Answer button.\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
