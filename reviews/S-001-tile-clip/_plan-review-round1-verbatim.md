Verdict: FAIL

Reviewed: 682c7c6 (on orch/tile-clip, base main 4e1639f; commits 0744038 and 682c7c6)

The amendment mostly carries the owner's ruling well. The three-line cut, the fade, the whole text one tap away, and the grid, "Latest" bubble and groups left alone all match the ruling file. Both checks pass. Two gaps should be closed before the spec freezes.

Blocking findings

B1. The answer the owner picked promises "every tile the same height", and the amended criterion never deals with it.
- The quote sits in specs/S-001.md:1574-1577 and in decisions/questions/P-001-tile-summary-clip.md:9. That sentence is the result the owner was choosing. The owner's complaint was about tile height.
- No rule or test in AC54 says cards end up the same height. The amendment itself makes them differ:
  - specs/S-001.md:1604 says a summary of three lines or fewer shows whole, so it is shorter.
  - A "no summary in this project's README" card is shorter too.
  - Long names still wrap (specs/S-001.md:1653).
- Reproducing case: two cards in one group, one with the 600-character fixture and one with a one-line summary, at 360 px. The AC54 test as written (specs/S-001.md:1710-1717) passes whatever the two heights are.
- Fix: either (a) carry it, for example cards in the same grid row share a height, or the summary area always takes three lines' height, and test it; or (b) say in the ruling's "How it is read" and in AC54(a) how "same height" is read, so the gap is decided rather than skipped. Only one of these is needed. Pick the reading closest to the owner's words, and add no more than that.

B2. The AC56 refresh test does not cover the new whole-summary bubble.
- AC56's list of pop-ups now names the bubble (specs/S-001.md:1809-1811), and the rule that a refresh keeps "any open sheet or bubble" therefore covers it.
- But refresh step 1 still opens only a "Latest" bubble (specs/S-001.md, the line starting "1. Home: the Done group opened, the Active group closed, and a "Latest" bubble open").
- Reproducing case: open the summary bubble on Home, then let the minute's poll or the 15-second tick run. No locked check catches the bubble closing, and note 14 was exactly about pop-ups closing on refresh.
- The AC56 "close" bullet ("for each sheet and bubble") does cover the new bubble, so only the refresh step is missing.
- Fix: add the summary bubble to step 1, or a step 1b, since only one bubble can be open at a time.

Non-blocking notes (carried as risks if not fixed)

N1. On open question 1, the accessible name: "starts with the summary's own words and ends ', show all'" (specs/S-001.md:1610-1611) does not say how many words.
- It could be the whole 600-character summary, which a screen reader would read in full and then read again in the bubble. Or it could be any short opening.
- The test's "named as above" can then only check the start and end of the name.
- Suggest fixing the rule as (C): for example the summary's first N words then ", show all", or the whole summary followed by ", show all". The (C) mark itself is fine.

N2. On open question 3, the second tap: whether a second tap on the summary closes its bubble is unstated. The "Latest" bubble does close on a second tap (specs/S-001.md:1636), so the two bubbles on one card may behave differently, and the builder will choose. Suggest matching "Latest" (C) and adding it to the (a) test.

N3. On open question 2: I agree. P-001-trial-view-notes-1.md:17 ("shown whole (it wraps, never clipped)") is a verbatim proxy record and should stay as it is. The new record's "How it is read", first bullet, says plainly that it changes that line, and AC54(a) names the change. One small gap: the opening paragraph above AC54 (specs/S-001.md:1560-1563) still says AC54 is read "as its 'How it is read' section reads them", pointing only at the old record. Add the new ruling file there, so the old line 17 is not read as still governing (a).

N4. The test's "no overflow" in (a) (specs/S-001.md:1712) is ambiguous. Hiding lines four and on is itself hidden overflow. Say "no sideways overflow and nothing scrolls inside the card", which is what the criterion means at specs/S-001.md:1601-1603.

N5. Two parts of the criterion are not tested:
- "Judged again when that width changes" (specs/S-001.md:1605-1606).
- "At every width down to 360 px" (specs/S-001.md:1599). The test checks 360 px only.
Suggest one width-change case (360 to 414 px) where a summary moves across the three-line mark, or soften the rule to match the test.

N6. "One bubble is open at a time, this one and the 'Latest' bubble together" (specs/S-001.md:1618) is awkward. Plainer: "Only one bubble is open at a time: opening the summary bubble closes the "Latest" bubble, and opening the "Latest" bubble closes the summary bubble." It also leaves open whether hovering "Latest" while the summary bubble is open closes the summary bubble. It probably should, but say so.

N7. A note for the builder, not a spec defect: the browser's built-in way of clamping text to a set number of lines adds an ellipsis ("...") at the cut by default, which the criterion forbids. The fade will need a height limit with a gradient or mask. Nothing in this conflicts with AC42: no packages are needed, and a CSS fade sits within the current security policy (specs/S-001.md:783-786).

Checked and found sound
- Nothing else on Home was changed. The "Latest" bubble's own rules, the grid and the groups are untouched, and so are the summary's source, its fallbacks and J11/A3 ("No new reads" is right).
- Nothing was added that the owner did not ask for, apart from accessibility and close behaviour that follow from AC42 and AC56, and the B1 gap.
- No gendered pronoun for the owner anywhere in the added text.
- No made-up numbers. "Three lines" is the owner's. 360 px, 600 characters and 44 by 44 were already in the spec.
- The milestone text (specs/S-001.md:3689-3692) and the "Where the build stands" section agree with AC54(a).

What I ran
- `git diff 4e1639f..HEAD`, plus reads of specs/S-001.md (AC54, AC56, the AC42 security-policy rule) and decisions/questions/P-001-trial-view-notes-1.md.
- A grep of the added lines for gendered pronouns: none found.
- `python3 governance/checks/surface_guard.py diff --range 4e1639f..HEAD --branch orch/tile-clip`: OK, 2 commits checked, exit 0.
- `bash governance/checks/check_all.sh . 4e1639f`: all governance checks passed, exit 0. The full output is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/ca.txt.
- No files were changed.
