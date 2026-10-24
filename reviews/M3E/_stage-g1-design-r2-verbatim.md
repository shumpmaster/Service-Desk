Verdict: PASS

**In plain English.** The fix changes nothing you can see until a time actually passes, and then it does what it should. With nothing passing, the Home briefing is pixel-for-pixel what I passed in round 1, at 360 and 414 px, light and dark, with three due lines and with one. When I moved the browser clock past a coming settle time, the next 15-second tick updated the same briefing in place. "settles itself Thu 03:20" left, and "was due to settle itself 15 Oct, 03:20" took the first place, with its clock. The box shrank with no empty gap, and nothing was redrawn. Part A still holds. No findings.

Scope: `git diff ae09c2d f31c658`. The only change that renders is sandbox.js:700-718: three fixed places (past, coming, undo), drawn only when the briefing is in its "need you" (`k-you`) form. An empty place is `span.v2-bdue.none`, and the rule `display:none` at sandbox.css:744 was already there at ae09c2d. The other three files are tests, and the glance-shots.mjs change from `process.exit(1)` to `process.exitCode = 1` has no effect on screen. I did not read the commit body. I changed no repository file: both commits were exported with `git archive` into scratch, and `git -C /home/user/sd-g1 status --short` is empty at f31c658.

Evidence (all in the reviewer's scratch folder, outside the repository, g1-design/confirm/):

1. **Looks exactly as in round 1** (items 1, 14, 27; AC91 (a); mockup 03).
   - States captured with my round-1 cap.mjs on both commits:
     - count-mix3: past, coming and undo lines.
     - count-mix: one coming line.
     - ext: one line, "4 questions settle themselves…".
   - Every brief, top and tile element shot is pixel-identical between ae09c2d (base-ae09c2d/) and f31c658, in all 4 size/theme combinations.
   - count-mix3's brief and top shots are also identical to round 1's own after-el2/ files.
   - Full-page shots differ only in a 90×22 px box: "checked 43 s ago" against "checked 0 s ago", which is clock noise (noise-*.png).
   - Text, size, weight and colour runs are equal. Hidden places measure 0×0 with `display:none`.
   - In count-mix and ext, the single shown line starts at y=215, the same place as count-mix3's first line. So hidden places take no room, add no gap, and the order is kept.
   - Screens: count-mix-360x740-dark-top.png and count-mix3-414x896-light-top.png.
2. **The other 9 states, on both commits, in all 4 combinations** (rest-base/, rest-fix/):
   - The text dumps differ only by clock minutes and seconds, as noted in round 1.
   - Briefings not in the "need you" form (signed-out, stall, text) have no due places at all, as before.
3. **Clock passing on the tick** (tick/, script g1-scripts/tick.mjs in scratch).
   - Method: `page.clock.setSystemTime(due + 1 min)`. Nothing changes until the tick runs. Then I ran 15 s of the clock, with the briefing tagged so I could tell if it was replaced.
   - count-mix, at 360 (414 is the same apart from line wrapping):
     - before: [hidden, "One question settles itself Thu 03:20", hidden]
     - after: ["One question was due to settle itself 15 Oct, 03:20", hidden, hidden]
     - The briefing is the same element, not redrawn.
   - count-mix3:
     - after: ["2 questions were due to settle themselves, the first 7 Oct, 10:00", hidden, "One can't be undone"]
     - The undo line moves up to y=251. The box is 20 px shorter, which is one 16 px line plus its 4 px gap, so no extra gap is left.
   - No page errors. Pairs: tick/count-mix3-360x740-light-tick-pair.png and tick/count-mix-360x740-dark-tick-pair.png. All 8 before/after shots are in tick/.
4. **Part A.** Across all 48 captures of f31c658 (the 3 states above and the 9 others, each at both sizes in both themes):
   - Item 12 (width): no sideways scroll.
   - Items 10 and 25 (contrast): no text run under 4.5:1.
   - No page errors.
5. **Tests.** The full suite `node --test tests/desk/` on the f31c658 tree passes 1167 of 1167 (1166 in round 1, plus the new tick test). Log: confirm/full-suite.txt.
   - The new ac88 key `span.v2-bdue.none` pins `display: none` on the hidden places only.
   - The `shown()` helper in ac91 keeps the round-1 assertions at the same strength.

Open questions: none new. Q1 to Q3 from round 1 still stand, unchanged by this fix.
