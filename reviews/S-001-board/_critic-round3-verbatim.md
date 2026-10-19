# Critic, round 3, on the board amendment draft 3 (9f82073) (verbatim)

Verdict: PASS with notes

**For the owner:** Draft 3 closes what I raised last round:
- The plan and your two open questions now agree. Until you answer, the plan follows each question's default: one board, and a card in Done keeps its button until GitHub confirms it.
- The lead now tells you plainly that most changes to the desk's own code will show "Open", not "Merge", and why.
- The daily worst case of 9,355 calls adds up and stays under the limit of 10,000.

The new card words are plain. Three small things remain:
- The tripwire card tells you to "add your verdict" but gives you no ready-made verdict link.
- Its words say "the desk's code", which will be wrong if another public project is ever connected.
- The plan still says in one place that there is no queue across projects, though it now follows one board until you rule.

How I checked: I have no shell, so I couldn't diff draft 2 against 9f82073. I read specs/S-001.md as it is in /home/user/sd-def-board. Sizes and layout I left alone; they are still pending the audit. O is the coordinator's, so I didn't check it.

**Round-2 notes**

L. **Closed.** Lines 1434–1438 of the lead and J22 rule 4 at 9441–9455 now:
- give the tripwire card plain words;
- say it is "the usual card for a Service-Desk code change today";
- explain why rules 4 and 6 differ;
- name the later `signal_code` change that would turn these cards back into "Merge" or "Verdict".

M. **Partly closed.**
- Closed: line 9410 (rule 2) and line 5446 now sit at the right depth, and the header's G4 line now reads "dropped in draft 2".
- New, from the same edit: line 5448 ("for "Open ↗": …") is indented 8 spaces, which nests it under "You asked for changes."
- Also new: line 5526 ("A read a mark waits on …") is indented 8 spaces, which nests it under "The reasons".

Route: Definer, cosmetic.

N. **Closed.** Lines 5318–5322 and 5469–5472 follow each question's default, A, and quote its "Left unruled" line. The lead says so at 1443–1444. The build stays on hold until both are answered (brief).

**The new owner words**
- **The lead (1434–1438):** plain and accurate. In code, `SIGNAL_CODE_DEFAULTS` takes in `src/**` and `tests/**` (govlib.py:981), and Service-Desk's risk-paths.toml doesn't override it.
- **The tripwire card** (5448–5449, 9441–9442): "GitHub flagged a change to the desk's code or checks: look at the changes, then merge or add your verdict." It is plain. Two weaknesses are in note P below.
- **"After agents"**: "The agents still have findings to fix first." Plain and true to owner_signal.py:172-179.
- **Any other `error`**: "GitHub's owner check couldn't decide." Plain.

**Notes (non-blocking)**

P. **The tripwire card's words** (5448–5449, 9441–9442).
- "the desk's code" is right only for Service-Desk. Rule 4 applies to any public v3 project. "this project's code or checks" would fit every project.
- The card tells the owner to "add your verdict" but offers only "Open ↗". The owner would then write `reviews/<n>/owner.md` by hand. That falls short of the request ("as prefilled as possible") and repeats the 19 October kind of guesswork. Consider putting AC53's prefilled "Verdict ↗" link in this card's sheet next to "Open on GitHub". A second link in the sheet changes nothing on the card itself.

Route: Definer.

Q. **"After agents" cards sit in "Waiting on you" but ask nothing of the owner** (5450; Terms 1764). Under Terms every open pull request needs the owner, so such a card counts while saying "The agents still have findings to fix first." This is not a contradiction: Terms is unchanged, and the words are honest. But it is the "still remain there?" feeling from the 19 October request. It may be worth one question to the owner: should such cards count, or sit in a quiet line? Route: Chief of Staff (optional).

R. **Terms and AC52 still say there is no queue across projects, while the spec now follows A** (1875–1876, 3153 against 5318–5321). Line 5320 defers the note to "if A stands". The spec reads A as standing until the owner rules, so S-001 now contradicts itself until then. Either add the conditional note to Terms "Queue" and AC52 now, or keep the deferral and say so in those two places. The build is on hold, so nothing is built wrong. Route: Definer.

S. **Tests don't cover the new defaults and words** (5589–5614).
- AC80's test checks "Open ↗" for an `error` check and "after agents" only "with their descriptions". It doesn't check rule 4's new why words character for character: the tripwire line, "The agents still have findings to fix first." and "GitHub's owner check couldn't decide."
- Nothing tests the default-A Done row, which shows its step button beside "Undo" until GitHub confirms and then only "✓ <time>" (5470–5471).

Route: Definer.

T. **The 9,355 doesn't say whether a re-mark gets a fresh 5-call bound** (5526–5533, 10920–10928, 2045–2048). The sum is right: 7,577 + 1,440 + 288 + 50 = 9,355, counting one mark per head. The flapping case (7,557) stays its own scenario, as before. But a card marked again from "Kicked back", or undone and marked again, is a new mark with "a new 5 minutes" (5539ff). The text doesn't say whether that new mark also gets up to 5 waited-read calls. If it does, each re-mark adds 5, and the margin of 645 covers about 129 re-marks a day. If it doesn't, the text should say the bound is per AC73 key and step, not per mark. Either way, state it and count it. Route: Definer.

**Checked and holding:**
- J22's order of rules 1 to 7 matches owner_signal.py's states.
- The A3 and AC14 figures agree: 7,577 for the AC79 case and 9,355 for the board case.
- J1's limit of 30 requests per poll call holds.
- Nothing new touches AC73, the notifications or the accepted views.

Files: /home/user/sd-def-board/specs/S-001.md; /home/user/sd-def-board/governance/checks/govlib.py; /home/user/sd-def-board/governance/checks/owner_signal.py
