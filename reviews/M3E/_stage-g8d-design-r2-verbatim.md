# M3E stage G8d: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g8d at d968b1e (round-2 commits 5d060e4, 2f76ee9, d968b1e, on e7c87e9) (G8d's work over 3058cc0).

---

Verdict: PASS

**Summary for the owner**
G8d round 2 does what you asked with ""✕ Can't show Bravo" (Recommended)".
- **Every project shown:** when the desk can read a project but can't draw it, Waiting no longer lists it under "Nothing waiting". It now shows a red "✕ Can't show Alpha" line. That line looks exactly like the "✕ Can't read …" lines and sits among them in the board's usual order.
- **That project shown alone:** the same red line appears above the lanes. No counts are given: no "0" on the lane and no "With the agents: 0 · …" line. The lane reads "Can't show" and the strip reads "Kicked back · can't show", the same way the can't-read case already reads.
- **Signed out, or reads failing:** a project whose read fails still says "Can't read …", never "Can't show".
- **What didn't change:** colours, sizes and fonts. The red reads at 6.85:1 in light and 6.91:1 in dark. Nothing scrolls sideways at 360 or 414 px. All 1309 tests pass.

The Builder's note is right, and it is a false quiet. Take a screen where every project is shown, one project can't be read and the only other one can't be drawn. Waiting's lanes still say "Waiting on you 0", "Nothing here" and "Kicked back · none". When every project can't be read, the same lanes say "Can't read" with no number. That was already there before this round, and this round made the screen more honest, so it is a follow-up and doesn't block. The fix's wording is yours (question 1). A smaller case of the same kind is question 2.

**Evidence** (Chromium through Playwright; IBM Plex Sans and Mono loaded, `document.fonts.check` true, except the older Pipeline view, which uses no Mono and is pixel-identical before and after. 360×740 and 414×896, light and dark. Trees exported with `git archive`: before e7c87e9, after d968b1e; the before tree used the after tree's tests/ so both render the same fixtures. 96 captures per tree: the 13 g8d- shots plus 11 extra x- states. Each `.txt` beside a `.png` holds the rendered text, an ARIA snapshot, the computed styles with contrast, scrollWidth, and the set of styles in use. Folder: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r2/, with shots-before/ and shots-after/.)

- **Ruling (owner-answers-2026-10-25-g8c-review.md item 4; spec AC80, AC89 (a), AC91 (c) round 2). Part A item 1: kept.**
  - g8d-waiting-cant-show:
    - before: "Nothing waiting: Personal-Org-Operating-Model, Alpha"
    - after: "Nothing waiting: Personal-Org-Operating-Model" / "✕ Can't read Service-Desk in this opening" / "✕ Can't show Alpha"
  - g8d-waiting-cant-show-cards: "✕ Can't show Bravo", with the 6 cards still drawn.
  - x-among (Service-Desk and Bravo can't be read, Alpha can't be drawn): "Can't read Service-Desk in this opening" / "Can't show Alpha" / "Can't read Bravo in this opening". This is the board's order.
  - Code: src/public/lib/board.js:131 and :927; src/public/sandbox.js:1931 and :2516.
- **Shown alone (g8d-waiting-one-cant-show, and x-onlycs-cards for Bravo with other cards on the board).**
  - The line "✕ Can't show Alpha" sits above the lanes.
  - "Waiting on you" has no count; its empty words are "Can't show" (`.v2-empty.unknown`, the same class and style as the existing "Can't read" lane).
  - The strip reads "Kicked back · can't show", styled `v2-kw` like "can't read".
  - The small line of counts is gone. Before, it read "0", "Nothing here" and "With the agents: 0 · Being recorded by the automatic job: 0".
  - Under the title it reads "checked <age> ago", as the spec says. Before and after show different ages (42 s / 0 s); that is capture timing, not a change. It flips the other way on x-onlyalpha-cards.
  - Code: board.js:183; sandbox.js:2027 and :2546.
- **Read failing keeps can't-read words.**
  - x-cs-readfail: "Can't read Alpha since 10:02". x-cs-readfail-one: "Can't read Alpha since 10:02: network error…".
  - x-cs-signedout: three "Can't read … since" lines, the lanes "Can't read", the strip "Kicked back · can't read". There is no "Can't show" anywhere.
  - Clearing on the next good draw is covered by its own test case.
- **Item 4 (quiet is honest) and item 5 (no made-up figures):** the change takes away one false "Nothing waiting" and, when the project is shown alone, three zeros. It adds none. The every-project case is non-blocking finding N1 below.
- **Item 6 (every project):**
  - service-desk fixtures: the g8d- shots.
  - poom: x-poom-cs reads "Can't show Personal-Org-Operating-Model" and draws without error.
  - md-extremes: on x-ext-cs and x-ext-cs-one, "Can't show Epsilon-with-a-very-long-project-name-that-wraps" wraps inside the width.
- **Items 10 and 25 (contrast):**
  - The line and its ✕: rgb(179,22,42) at 6.85:1 in light; rgb(255,107,120) at 6.91:1 in dark. Both are 12 px weight 400, identical to the can't-read line.
  - The "Can't show" lane and strip words: 6.40:1 in light, 7.72:1 in dark.
- **Item 12 (width):** scrollWidth equals clientWidth on all 96 after captures.
- **Items 8, 23 and 27 (type):** no new size, weight or font. Where the set of styles changed, the only addition is the existing `--bad` 12 px/400 Plex Sans style, now used for the new red line. On the shown-alone screens, the Mono "0" style is gone with the counts.
- **Item 13 (colour alone) and the screen reader:**
  - Every red line carries a ✕ and its words.
  - ARIA reads: paragraph "Can't show Alpha"; region "Kicked back", "Kicked back · can't show"; region "Waiting on you", heading "Waiting on you" with no count, then "Can't show".
- **Nothing else moved:**
  - Text that changed outside the target lines is only clock ticks: ages "6 h 43 m"→"6 h 44 m" and "since 10:01"→"10:02".
  - Pixel changes outside the target lines are only those clock ticks and the lanes moving down or up by one line.
  - Every other G8d capture is identical in pixels, text and styles, including Home, the page and the Pipeline view.
- **Tests and build (on the exported after tree):** `node --test ../tests/desk/` passed 1309 of 1309. `node tools/build.mjs` reported "PASS (2 connected projects; 36 page modules in step)". Logs: tests-after.log and build.log in the same folder.

**Blocking findings**
None.

**Non-blocking findings** (all were there before round 2, and none got worse; follow-ups to file)
- **N1. The Builder's note is a false quiet.**
  - With every project shown, take a case where no shown project is both readable and drawable but one can't be drawn. x-noquiet has this: Service-Desk and Personal-Org-Operating-Model can't be read, and Alpha can't be drawn.
  - Waiting's lanes say "Waiting on you 0", "Nothing here" and "Kicked back · none" under the three red lines (x-noquiet-*).
  - When every shown project can't be read, the same lanes give no count and say "Can't read" (x-cs-signedout-*). Home's briefing for x-noquiet gives no count either ("Can't show Alpha", "Waiting ›").
  - This goes against part A item 5 (an unknown shown as 0) and item 4.
  - Cause: sandbox.js:2018 sets `view.unread` from the raw read state, so a can't-draw project counts as "ok" there, while readOf (:1931) no longer treats it as ok.
  - Before round 2 it was worse: it also said "Nothing waiting: Alpha".
- **N2. Alone shown, a can't-draw project whose read later fails is in state 5 (x-cs-readfail-one).** The lane says "0" and "Nothing here when last read", with "Kicked back · none when last read". But when it was last read, the desk couldn't draw it, so "nothing here" is not known. That is the same item 4/5 problem. It is unchanged from before, and round 2's spec keeps state 5's can't-read words.

**Notes**
- At 414 px, Waiting's red lines flow two to a row ("✕ Can't read Service-Desk in this opening   ✕ Can't show Alpha"). That is the existing quiet-line layout, and the reading order still follows the board.
- Known follow-up, untouched here: the `--soft` contrast.

**Questions for the owner** (asked, not picked)
1. With every project shown, suppose no project can be both read and drawn, for example one can't be read and one can't be shown. Waiting's lanes still say "0", "Nothing here" and "Kicked back · none". Should they do what they already do when nothing can be read: no number, with the unknown said in words?
   - (a) Yes. You'd pick the words, for example "Can't read or show".
   - (b) Leave as built; the red lines above explain the 0.
   - The no-zero part follows from checklist item 5, so the Definer may treat it as a spec bug whichever you choose. Only the words are a choice.
2. Shown alone, a project the desk couldn't draw and now can't read says "Nothing here when last read" with a 0, though when last read it couldn't be shown. Should it be (a) no number, with words such as "Can't show when last read", or (b) left as built?

**Pairs for the owner** (before on the left, after on the right, each labelled "Made-up fixture data (test fixtures) - NOT real projects, NOT real failures")
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r2/owner-pairs-final/01-waiting-every-project-360-light.png
- /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g8d-design-r2/owner-pairs-final/02-waiting-alone-360-dark.png (the "checked 42 s / 0 s ago" difference is capture timing)
