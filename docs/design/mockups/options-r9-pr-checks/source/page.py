# Writes ../index.html and ../README.md: the pull-request sheet's actual checks, options over the Needs-you tab's option A (round 9, answer 3).
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS'].replace('</style>', '.phone.w360 { max-width:362px; } .phone.w360 iframe { width:360px; }\n</style>'); phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False, w360=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec, w360=w360)
def phone2(o):
    s = phone(o)
    return s.replace('<div class="phone">', '<div class="phone w360">') if o['w360'] else s
OWNER = '“I like the earlier option you recommended. For this one, can you find a way to incorporate the actual checks instead of just “checks passed”” (round 9, answer 3, a comment on the pull-request sheet)'
FOUND = ('the pull-request sheet says three lines: “Its checks passed” (the three automatic checks), “The AI reviewer passed it” and “What it changes”. '
         'No check is named, nothing says how long it took or where to read it, and nothing could show one running or failing.')
TOUCHES = ('Round 8, answer 28: plain words first, the code after in grey, on every row. '
           'P-005-acting: the desk starts an action and you finish it on GitHub; a check opens its run on GitHub, and Merge opens the pull request at its merge button.')
REC = ('A. Every check is on the sheet at once, by its plain name, with the one that needs you (or is running, or failed) at the top, '
       'so you see what passed and what is yours without a tap; each row opens its run or its review record.')
REAL = ('The names are the real ones: the three workflows that run on a pull request (governance.yml with its owner-signal job, desk-build.yml, pr-body.yml; '
        'asks-merge.yml waits on the same three), the 47 rules of the governance suite, and the reviews governance/risk-paths.toml asks for, recorded in reviews/&lt;PR&gt;/. '
        'scrub-proof.yml runs weekly and by hand, never on a pull request, so it is not drawn. A change to the rules also needs your own verdict: '
        'the governance check counts it as its one rule not passed, and your merge gives it. The pull request, its number, times and review words are an example.')
S = 'A.light.kinds.sheet=pr.pc='
OPTS = [ph('v47 as it is', 'The sheet today', 'Three lines: its checks passed, the AI reviewer passed it, what it changes.', S + 'now'),
        ph('Option A', 'Every check named · light', 'Two short groups, Automatic checks and AI reviews. The form check is running again, so it sorts to the top, then the one that is yours. Tap a check for its run on GitHub, a review for its record.', S + 'A.run', True),
        ph('Option A', 'Every check named · dark', 'The same, in dark.', 'A.dark.kinds.sheet=pr.pc=A.run', True),
        ph('Option A', 'Every check named · 360 wide', 'The same, on the narrowest phone.', S + 'A.run', True, True),
        ph('Option B', 'Two summaries, folded', '“3 of 4 automatic checks passed, 1 is yours” and “2 of 2 AI reviews passed”. Tap either to unfold A’s rows.', S + 'B'),
        ph('Option B', 'Unfolded to the rules', 'The rules row unfolds again into its 47 rules in eight groups, each with its count; tap a group for its rules.', S + 'B.unfold'),
        ph('Option C', 'A story in time', 'Pushed, then each check and review as it finished (Chicago time, 14 Nov), to Ready for you in blue. Tap a step to read it.', S + 'C')]
body = ('<title>The pull request’s checks</title>\n' + CSS + '\n<main><div class="lede"><h1>The pull request’s checks</h1>'
        '<blockquote>' + E(OWNER) + '</blockquote>'
        '<p>The Needs-you tab is ruled option A; these phones open its pull-request sheet. v47 as it is comes first, then three ways to show the actual checks, live: scroll and tap inside the phones. '
        'The recommended one has a blue edge.</p></div>'
        '<section class="item" id="checks"><h2>The pull request to merge: its checks</h2><div class="meta"><span><b>In v47:</b> ' + E(FOUND) + '</span>'
        '<span><b>Touches:</b> ' + E(TOUCHES) + '</span><span><b>The checks:</b> ' + REAL + '</span></div>'
        '<div class="why">Recommended: ' + E(REC) + '</div><div class="phones">' + ''.join(phone2(o) for o in OPTS) + '</div></section></main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: the pull request’s checks (round 9, answer 3)\n\n'
  'The owner, on the pull-request sheet of the Needs-you tab’s option A: ' + OWNER + '\n\n'
  'Built over mockup v47 (`../timeline-v47-craft.html`) and the Needs-you tab’s options (`../options-r9-needs/`, whose `ny.css` and `ny.js` are copied into `source/`). '
  '`source/build.py` writes `phone.html` (v47 with `ny.css` + `pc.css` and `ny.js` + `pc.js`; the option set by the phone\'s hash, `.light` or `.dark` fixing the theme); '
  '`source/page.py` writes `index.html` and this file with the round 8 options pages\' stylesheet.\n\n'
  '| Phone | Hash | What it shows |\n|---|---|---|\n'
  '| v47 | `A.light.kinds.sheet=pr.pc=now` | the sheet today: “Its checks passed”, “The AI reviewer passed it”, “What it changes” |\n'
  '| A (recommended) | `…pc=A.run` (light, dark, 360 wide) | Automatic checks and AI reviews, every one named; running, yours or failed sort to the top; tap for the run on GitHub or the review record |\n'
  '| B | `…pc=B`, `…pc=B.unfold` | two summary rows that unfold into A’s rows; the rules row unfolds into its 47 rules in eight groups |\n'
  '| C | `…pc=C` | the checks as a story in time: pushed, each check and review, Ready for you |\n\n'
  'Hash words added here: `pc=now|A|B|C` picks the sheet; `run` puts the form check in a second run (its body edited at 11:24 am); `unfold` opens B’s folds.\n\n'
  'The checks behind it: .github/workflows/governance.yml (jobs governance and owner-signal), desk-build.yml (build), pr-body.yml (pr-body); '
  '`python3 governance/checks/govlib.py list-checks` (47 rules, translated into plain words in `source/pc.js`); governance/risk-paths.toml (reviewer for R1 and above, design-reviewer for src/public/**, the owner for R3); '
  'reviews/40/reviewer.md for a record\'s shape. scrub-proof.yml runs weekly and by hand, never on a pull request, so it is not drawn. '
  'A change to the rules (R3) needs the owner\'s verdict, reviews/<PR>/owner.md, recorded after the merge: the governance check counts it as its one rule not passed, drawn as Yours.\n\n'
  'Examples, marked so: the pull request (#212), its commits, times, durations, run number and review words. In v47 ' + FOUND + '\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
