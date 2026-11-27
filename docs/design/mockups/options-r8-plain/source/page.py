# Writes ../index.html and ../README.md: the plain-words options (round 8, answers 11 and 27), over v43.
# Run build.py first (it writes ../phone.html). Usage: python3 page.py
import os, html
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, '..')
_src = open(os.path.join(H, '../../options-r8/source/pages.py'), encoding='utf-8').read()
_ns = {'__file__': os.path.join(H, '../../options-r8/source/pages.py')}; exec(_src[:_src.index('def item(')], _ns)
CSS = _ns['CSS'].replace('<style>', '<style>\n.q { display:flex; flex-direction:column; gap:10px; } .q h3.qh { font:600 17px/1.3 var(--sans); margin:0; } .cost { font-size:14px; color:var(--text-2); max-width:75ch; }\n', 1)
phone = _ns['phone']
E = html.escape
def ph(tag, h, p, hash, rec=False): return dict(tag=tag, h=h, p=E(p), hash=hash, rec=rec)
THREE = lambda o, extra='': [('Home', 'Home’s priority list: row 2 is Stop card 5.', 'o=' + o + '.at=home' + extra),
                             ('The project', 'The rows of S-011 under M6, the map folded to show more of them. Scroll for Stop card 5.', 'o=' + o + '.at=proj' + extra),
                             ('The stop sheet', 'Answer stop card 5: the five choices.', 'o=' + o + '.at=sheet' + extra)]
def trio(tag, o, rec=False, at3=None, theme='light'):
    rows = THREE(o)
    if at3: rows = rows[:2] + [at3]
    return [ph(tag, r[0], r[1], r[2] + '.' + theme, rec) for r in rows]
APPROACHES = [
 dict(id='v43', h='v43 as it is', what='What the newcomer met in the test: codes first (Stop 2.2.2.10 · S-011), log-entry titles ("First draft", "Stop card 5"), role names nobody introduces, and answers that are system keys ("criteria-wrong").',
      cost='', touches='', phones=trio('v43 as it is', 'v')),
 dict(id='A', h='A. Plain-first titles, codes second in grey', what='Every event, sprint and home title says who did what to what, rewritten from words already on the page (mostly the Why sentences); the position number and the code move to the end of the line, small and grey. "Stop card 5" becomes "Work stopped: the plan failed its third check. Your call."',
      cost='Height: 12 rows of S-011 grow from 1,224 to 1,389 points (about 14 per row), because titles now wrap to two lines. Records: a plain title per event and per sprint, which no record holds today; these are written by hand from the page.',
      touches='Moves the number and code behind the name: open question 1 (round 8 answer 22; round 6 answers 13 and 14).', phones=trio('Option A', 'A')),
 dict(id='B', h='B. A “what this is” line', what='One line under each project (on home), the phase (from the operating model’s own words), and each sprint, saying what it is for. The sheet says what a stop is.',
      cost='Height: home’s list grows from 383 to 467 points; the two sprint headings from 102 to 180. Records: the phase lines are fixed copy from the operating model; the project and sprint lines are examples (marked), since no record holds a plain description.',
      touches='None.', phones=trio('Option B', 'B')),
 dict(id='C', h='C. The Why sentence on the row', what='The first sentence of each event’s Why shows under its title, always visible; the Why bubble stays for the rest. Titles stay as they are.',
      cost='Height: the most of any: 12 rows grow from 1,224 to 1,539 points (about 26 per row). Records: none new; the Why sentences are already examples until a record says why each event happened.',
      touches='Why moves out of the bubble onto the row: open question 4 (the Why tag of v21; round 8 answer 14, fewer tags per row).', phones=trio('Option C', 'C')),
 dict(id='D', h='D. A glossary and cast sheet', what='A “?” in the top capsule opens one sheet: who does the work (said plainly: they are AI sessions), the words (spec, plan review, stop card, strike, freeze, gate…) and the codes (M6, S-011, 2.2.2.10). A few words carry a dotted underline that opens their entry.',
      cost='Height: none. Records: none; it is fixed copy. Weakest on its own against your test: a newcomer has to go and look, and the titles stay cryptic.',
      touches='Says the workers are AI: open question 5.', phones=trio('Option D', 'D', at3=('The glossary', 'The sheet the “?” opens.', 'o=D.at=gloss'))),
 dict(id='E', h='E. Plain role names and plain answers', what='The stop card’s five answers become actions (“Start a fresh plan”), each with its consequence, the system’s key small and grey beneath; “Applies your words: criteria-wrong (Recommended)” becomes “You chose: start a fresh plan; failed checks back to zero”, the key beneath; the Chief of Staff is named as your lead AI assistant.',
      cost='Height: small (12 rows: 1,224 to 1,258 points). Records: a plain label per answer on stop cards and gates, which today’s cards do not carry; what a strike costs is not recorded at all.',
      touches='“Your words” shown as a plain sentence with the key beneath: open question 2 (round 8 answers 8 and 9).', phones=trio('Option E', 'E')),
 dict(id='F', h='F. A plain / detailed switch', what='One switch in More. Plain applies A, B and E and hides the numbers, the session tags and the records; Detailed is v43. Tapping it reloads the phone in that mode.',
      cost='Every screen would be drawn and checked twice, and all the plain text of A, B and E is still needed. You would mostly sit in Detailed, so the phone you hand over would usually fail your test unless you switch first.',
      touches='Hides the numbers and session tags in Plain: questions 1 and 3.', phones=[ph('Option F', 'The switch in More', 'Plain words is on; Detailed is v43.', 'o=F.at=menu.light'),
        ph('Option F', 'Home, plain', 'A, B and E together, the codes hidden.', 'o=F.at=home.light'), ph('Option F', 'The project, plain', 'No numbers, no session tags.', 'o=F.at=proj.light')]),
]
REC = dict(id='rec', h='Recommended: A + B + E + D, without C or F',
  why='A turns each headline into a sentence built from its Why, so the Why line of C would mostly say the same thing again at twice C’s height; B answers “what is this project” and “what is this piece of work”; E makes the one decision on the phone readable; D costs nothing and introduces the cast. The recommended phones also take the plainer session tag (question 3) and say the workers are AI (question 5).',
  cost='Height: home’s list 383 to 467 points (+84, the project lines); the 12 rows of S-011 1,224 to 1,423 (+199, about 17 a row); the two sprint headings 102 to 180 (+78). With the map card folded, as here, the stop row sits about three rows further down than in v43.',
  phones=trio('Recommended', 'R', rec=True) + trio('Recommended', 'R', rec=True, theme='dark'))
QS = [
 dict(n=1, h='Codes and numbers behind the plain name, in grey?', touch='Round 8 answer 22 (the event line on home) and round 6 answers 13 and 14 (numbers that follow the order, “M6 is now 2.2”). The numbers stay; only their place and weight change.',
      a=ph('As it is', 'Number first', '2.2.2.1 leads each line; M6 sits before the milestone’s name.', 'o=v.at=proj.light'),
      b=ph('Changed', 'Name first, number after in grey', 'Decision · Done · 6:07 am · 2.2.2.1; the milestone’s name, then M6 in grey.', 'o=v.f=code2.at=proj.light', True)),
 dict(n=2, h='“Your words” as a plain sentence, with the key you tapped beneath?', touch='Round 8 answers 8 and 9: a decision carries your words. Here your words stay, as the key you tapped, under a plain sentence of what it means.',
      a=ph('As it is', 'The key as your words', 'Applies your words: “criteria-wrong (Recommended)”.', 'o=v.at=dec.light'),
      b=ph('Changed', 'A plain sentence, the key beneath', 'You chose: start a fresh plan; failed checks back to zero. The option you tapped: criteria-wrong (Recommended).', 'o=v.f=words.at=dec.light', True)),
 dict(n=3, h='A plainer session tag, “Conversation · 14 Nov”?', touch='Round 8 answer 6, item 9 (each tag names its session, “CoS 14 Nov”). Still one tap to the conversation.',
      a=ph('As it is', 'CoS 14 Nov', 'The tag a newcomer read as a date or as “cost”.', 'o=v.at=proj.light'),
      b=ph('Changed', 'Conversation · 14 Nov', 'The same link, named for what it opens.', 'o=v.f=tag.at=proj.light', True)),
 dict(n=4, h='The Why sentence on the row?', touch='The Why tag that opens a bubble (v21) and round 8 answer 14 (fewer tags per row). Not recommended with A, which already builds titles from the Why.',
      a=ph('As it is', 'Why behind a tag', 'One tap opens the reason.', 'o=v.at=proj.light', True),
      b=ph('Changed', 'Why on the row', 'The Why’s first sentence under every title (option C).', 'o=v.f=why.at=proj.light')),
 dict(n=5, h='Should the page say the workers are AI?', touch='No ruling yet. Your test is a stranger handed your phone, and nothing on the page says the Chief of Staff, the orchestrator or the spec writer are AI sessions.',
      a=ph('As it is', 'Not said', '“Chief of Staff · since 7:52 am”.', 'o=v.at=home.light'),
      b=ph('Changed', 'Said once, and on the at-work line', '“The work is done by AI assistants; you make the calls.” and “Chief of Staff (your lead AI assistant)”.', 'o=v.f=ai.at=home.light', True)),
]
EXAMPLES = ('Marked as examples: the project and sprint “what this is” lines (no record holds a plain description); every rewritten title, answer label and Why line is written from words already on the page, not from a record, '
            'so each would need a record to carry plain text (docs/design/audit-2026-11-27-v43-plain-words.md, section 5; the request at docs/design/requests/2026-11-26-timeline-records.md). The phase lines come from the operating model’s own table of stages. '
            'The answer buttons still send nothing, as in v43.')
def sec(it):
    return ('<section class="item" id="' + it['id'] + '"><h2>' + E(it['h']) + '</h2><div class="meta"><span>' + E(it['what']) + '</span>' +
            ('<span><b>Cost:</b> ' + E(it['cost']) + '</span>' if it.get('cost') else '') + ('<span><b>Touches:</b> ' + E(it['touches']) + '</span>' if it.get('touches') else '') + '</div>'
            '<div class="phones">' + ''.join(phone(o) for o in it['phones']) + '</div></section>')
def rec(it):
    return ('<section class="item" id="rec"><h2>' + E(it['h']) + '</h2><div class="why">' + E(it['why']) + '</div><p class="cost"><b>Cost:</b> ' + E(it['cost']) + '</p>'
            '<div class="phones">' + ''.join(phone(o) for o in it['phones']) + '</div></section>')
def q(it):
    return ('<div class="q" id="q' + str(it['n']) + '"><h3 class="qh">' + str(it['n']) + '. ' + E(it['h']) + '</h3><div class="meta"><span><b>Touches:</b> ' + E(it['touch']) + '</span></div>'
            '<div class="phones">' + phone(it['a']) + phone(it['b']) + '</div></div>')
toc = '<nav class="toc">' + ''.join('<a href="#' + a['id'] + '">' + E(a['h'].split('.')[0] if a['id'] != 'v43' else 'v43') + '</a>' for a in APPROACHES) + '<a href="#rec">Recommended</a><a href="#questions">The five questions</a></nav>'
body = ('<title>Plain words</title>\n' + CSS + '\n<main><div class="lede"><h1>Plain words: could someone else read your phone?</h1>'
        '<p>What you asked: “I would want them to be so clear and descriptive that I could hand someone my phone and let them see exactly what’s going on” (round 8, answer 11). '
        'The test (docs/design/audit-2026-11-27-v43-plain-words.md) played a newcomer with no context: they got the shape of things in seconds, but not what any of it is about, and were lost at the one decision on the phone, the stop card’s five answers.</p>'
        '<p>Each approach is drawn on v43 in the same three places: home’s priority list, the rows of S-011, and the stop sheet. The phones are live: scroll and tap. v43 comes first, then A to F, the recommended mix, and the five open questions, each as it is and changed.</p>'
        '<p>' + E(EXAMPLES) + '</p></div>' + toc
        + ''.join(sec(a) for a in APPROACHES) + rec(REC)
        + '<section class="item" id="questions"><h2>The five open questions</h2><div class="meta"><span>Each touches an earlier ruling, so each is yours to decide on its own. The recommended answer is edged in blue.</span></div>'
        + ''.join(q(x) for x in QS) + '</section></main>\n')
open(os.path.join(D, 'index.html'), 'w', encoding='utf-8').write(body)
readme = ('# Options: plain words (round 8, answers 11 and 27)\n\n'
  'Built over mockup v43 (`../timeline-v43-craft.html`) from the plain-words test, `../../audit-2026-11-27-v43-plain-words.md`. `source/build.py` writes `phone.html` (v43 with `source/pw.css` and `source/pw.js`; the phone\'s hash picks the approach `o=v|A|B|C|D|E|F|R`, single changes `f=code2|words|tag|why|ai` joined by `+`, the start `at=home|proj|sheet|dec|gloss|menu`, and `light` or `dark`); `source/page.py` writes `index.html`, with the round 8 options pages\' stylesheet (`../options-r8/source/pages.py`).\n\n'
  + ''.join('## ' + a['h'] + '\n\n' + a['what'] + '\n' + ('\n- Cost: ' + a['cost'] if a.get('cost') else '') + ('\n- Touches: ' + a['touches'] if a.get('touches') else '') + '\n- Phones: ' + '; '.join(o['h'] + ' (`#' + o['hash'] + '`)' for o in a['phones']) + '\n\n' for a in APPROACHES)
  + '## ' + REC['h'] + '\n\n' + REC['why'] + '\n\n- Cost: ' + REC['cost'] + '\n\n## The five open questions\n\n'
  + ''.join(str(x['n']) + '. ' + x['h'] + ' Touches: ' + x['touch'] + ' Recommended: ' + (x['b']['tag'] if x['b']['rec'] else x['a']['tag']) + '.\n' for x in QS)
  + '\n## Examples and records\n\n' + EXAMPLES + '\n\n## Checks\n\n'
  'Every phone at 393 (light; the recommended mix also dark) and at 360 (the recommended mix light and dark, A, D dark): no console errors, no sideways scroll. '
  'Contrast of the new text, measured on the rendered glass with the text hidden (10th percentile of the background): light 4.7 to 10.3, dark 4.8 to 14.0; the sheet\'s "what a stop is" line lifted to the second ink to reach 9.4 / 9.8. '
  'Heights measured at 393 with the map card folded: home\'s list card, the 12 rows of S-011 and the two sprint headings (in the sections above). '
  'Two layers of v43 read the number line and needed care: the map\'s folded strip (`ctNo`, wrapped so it reads the number, not the moved line) and the look layer that rewrites the line\'s meta (left alone; a copy is shown instead).\n')
open(os.path.join(D, 'README.md'), 'w', encoding='utf-8').write(readme)
print('ok', len(body))
