# M3E stage G5: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g5 at e400666 (fix commits 8ff4592, 5c095d5 and e400666, on f5be3a8) (base 87bac4d).

---

Verdict: PASS

**In plain English.** G5 is ready at e400666. The one thing round 1 failed is fixed.
- **What G5 does for the owner:**
  - each phase counts all its milestones instead of "0 of 5 recorded": "1 of 5 reached · 6 sprints · 2 merged, 4 not read", then "Standard checklist: 2 tracked · 4 not tracked";
  - the section head sums them: "Milestones by phase · 8 of 15 reached";
  - the Timeline's sprint folds say how many merged;
  - Details' CI line counts workflows ("running · 2 of 3 workflows passed, 1 running");
  - a gate's cards are named once in a project's waits row ("the Launch gate for P-004 and P-005").
- **Round 1's failure, fixed:** on the made-up projects whose two Build runs share a number, the page said Build had "no sprints filed yet" while the Timeline drew 4. It now reads "0 of 8 reached · 4 sprints · 4 not read", the same as the Timeline. Each opened row carries its own sprints, and run 1's head says "gone back over", not "planned".
- **Nothing else changed from round 1.** Everything matches the accepted mockup (q4) in substance.

Design review of G5, "After the glance audit" (S-001 AC92 (c); AC83 and AC84 changed; AC89 (c) by the owner's ruling P-001-glance-waits-gates.md, B). Branch build/builder/g5 at e400666, compared with 87bac4d.
- **Round 1** (f5be3a8): FAIL on B1.
- **Round 2:** confirmation of 8ff4592 (B1), 5c095d5 (my P1) and e400666 (the Definer's note 2, from 0300026 on build/definer/g5-notes).
- I did not see the Builder's summary. I read the diffs; I saw only commit subject lines. I changed nothing in the repository; trees were exported with `git archive` to tree-before/, tree-after/ (f5be3a8) and tree-e400666/.

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/:
- **before/, after/**: round 1, 25 states × 360×740 and 414×896 × light and dark. Each capture has a PNG and a JSON holding every text run's type, colour, ground and contrast, plus a G5 probe.
- **confirm/**: round 2 at e400666, the same 25 states plus 10 more × 4 (140 captures):
  - Build opened on md-extremes Alpha and Epsilon, mix Alpha, and the four gates states;
  - the Timelines of mix Alpha, gates and Epsilon.
- **after-extra/**: those 10 extra states at f5be3a8, for comparison.
- **view-before/, view-after/, view-e400666/**: viewport shots for the pairs.
- **tool-after/**: the Builder's tool at f5be3a8 (`g5-`).
- **crops/**: B1-md-extremes-build-sprints-360x740-light.png and waits-rows.png.
- **scripts/**: cap5.mjs, cap5r2.mjs, cap5v.mjs, probe5.js, dump.js, sum5.py, pairs5.py, pairs5r2.py, dbg.mjs and dbg2.mjs.
- Fixtures are the after tree's fake desk and glance states (made up, NOT real records).

TESTS
- Full suite `node --test tests/desk/`:
  - f5be3a8: 1219 of 1219 (full-suite.txt);
  - e400666: 1223 of 1223 (full-suite-e400666.txt).
- In all 376 of my captures (round 1 and round 2), and the tool's 36: no sideways scroll, no page errors, and no text run under 4.5:1.

ROUND 2: THE FIXES CONFIRMED

**B1 (item 5; AC92 (c); item 6) is closed.** `blockOf(feed, run)` (projectpage.js:276) takes the run's own block first, and its "<Phase>-i<n>" key only where none is. Both `runSprintViews` and `milestoneSprints` use it.
- **Where it was wrong:** mix Alpha, md-extremes Alpha and Epsilon, and all four gates states (two items, cases, no case lines, kicked), at both widths and in both themes.
- **The Build line:**
  - f5be3a8: "0 of 8 reached · no sprints filed yet";
  - e400666: "0 of 8 reached · 4 sprints · 4 not read".
- **It equals the Timeline:** Build · run 1's folds are M2B "2 sprints · 2 not read", M2 "1 sprint · 1 not read" and M1 "2 sprints · 2 not read". That is 5 views, with m2-answering "also feeds" both M2B and M2, so 4 sprints once each. scripts/dbg2.mjs gives { s: 4, m: 0, w: 4 }.
- **Opened rows carry their sprints:** M2B "work filed · gone back over · 2 sprints · 2 not read", M2 "… · 1 sprint · 1 not read", M1 "… · 2 sprints · 2 not read". Before, they had none.

**P1 is closed.** `bandLookup` uses `blockOf` (sandbox.js:1205-1218).
- Run heads, Build opened, in every state above: "Run 3 · planned", "Run 2 · planned", "Run 1 · dates not recorded · gone back over". Before, all three read "planned".
- Each head is its own run's state (Build i1 gone back over k=1, i2 and i1 still to come k=2 and 3).

**Note 2, the head where T sums to 0:** "Milestones by phase · none tracked yet", never "0 of 0 reached". "Milestones by phase" stays alone where the phases aren't tracked.
- It is in the head's own element and role (500 11px `--ink2`).
- No fixture reaches it on screen. Tested in ac92-glance-counts.test.mjs:183-192.

**Nothing else changed.** Across the 25 round-1 states × 4, comparing round 1 and confirm text and styles run by run, there are only two kinds of difference:
- the Build line above, on mix Alpha, md-extremes Alpha and Epsilon, and the gates states;
- "checked <n> s ago", which differs by when each capture's poll landed, not by code.

Every Service-Desk line, fold, CI line and waits row is identical to round 1.

EVIDENCE BY CHECKLIST ITEM (both rounds; values at e400666)

**AC92 (c), the head.** Items 1, 2, 5, 8.
- "yours and the model's 24" became "8 of 15 reached" (Service-Desk), "8 of 16" (laterLaunch, the same as mock q4) and "0 of 15" or "0 of 14" (Alpha).
- 500 11px `--ink2`. "↑ start at the foot" kept.

**AC92 (c), each phase's two lines.** Items 1, 2, 5, 7, 8, 26.
- Two `.v2-sdl` lines, one line each at 360.
- "R of T" is 500 12px `--ink` (#18191c light, #ecedef dark). The rest is 400 12px `--ink2` (#5c5f66 / #a2a5ac).
- **Service-Desk:**
  - Launch: "0 of 1 · no sprints filed yet" / "none tracked (5)";
  - Build: "3 of 5 · 4 sprints · 4 not read" / "none tracked (5)";
  - Design: "1 of 5 · 6 sprints · 2 merged, 4 not read" / "2 tracked · 4 not tracked";
  - Discovery: "4 of 4 · 7 sprints · 7 merged" / "4 tracked · 4 not tracked".
- These match the spec's examples.
- **With pulls read**, the sums check against the Timeline's folds (Design 26, Build 16 with one shared sprint, Discovery 38).
- **F1/F2:** Launch "0 of 2 reached" / "1 tracked · 4 not tracked", word for word mock q4.
- Never "0 of <n>" for unused standard milestones.
- **Item 7:** every standard milestone is still listed in the opened phases, and the why-not-written line is shown once.
- The checklist on its own labelled line is the set-apart q4 draws. It is not overdone: no new colour, weight or box.

**AC92 (c), the opened rows.**
- "work filed · 4 sprints · 4 merged" and "work filed · 1 sprint · 1 merged".
- Gone back over: "reached 18 Oct · gone back over · 2 sprints · 2 merged".
- On Alpha, as above.

**AC92 (c), the Timeline's folds.** Items 2, 5, 32.
- "4 sprints" became "4 sprints · 4 not read", with the chevron icon after. Type is unchanged (500 11px `--ink2`).
- With every fold opened, each fold's merged count equals its "merged" ticks (4, 14, 1, 12, 2, 1, 2, 7, 38).

**AC92 (c), Details' CI line.**
- "running · 2 of 3 workflows passed, 1 running"; "failing · 1 of 2 workflows passed"; "passing · 1 of 1 workflow passed".
- "none" has no part. Deploy and Orchestrator runs are left out. Type is unchanged.

**AC89 (c), ruling B.** Items 1, 3, 16, 19.
- The four forms:
  - "the Launch gate for P-004 and P-005";
  - "…for P-004, cases 1 and 2";
  - "…for P-004, launch-1 and launch-2";
  - "…for P-005 and P-004" (kicked, in row order).
- Ids are 400 11px Plex Mono, each kept whole. "8 wait on you" over 7 names. The two-line cut (34px) and fade are unchanged.
- At 414 both items now show before the cut ("two", "kicked"). At 360 the row reads as before up to the cut (N1).

**Item 3, item 22.** Counts and badge are unchanged.

**Items 10 and 25.** Changed runs are at least 6.4:1 light and 7.72:1 dark. Nothing anywhere is under 4.5:1.

**Item 12.** scrollWidth equals clientWidth everywhere.

**Item 6.**
- service-desk, mix, md-extremes (Alpha, Epsilon) and gates now render true counts, with no errors.
- poom (v2.5) is unchanged ("Not used by this project").

**Items 8, 23 and 27.**
- Fonts loaded: Plex Sans 400/500/600 and Mono 400.
- Changed runs use only 11/500, 12/500, 12/400, 13/500 and 11/400 mono. The only new CSS is `.v2-sdl { display: block }`.

**Items 9, 11, 13, 14, 15, 21, 24.** No new text box, target, colour meaning, board change or motion. Folds keep `foldButton`.

**Part B (26).**
- q4 matches in structure and type.
- The sprint wording follows the spec's later form over the mock's stand-ins (authority order); not a finding.

BUILDER'S CHOICES, JUDGED
1. **"none tracked (n)" leaving out the not-tracked part:** correct. The Definer settled it so (0300026, note 1), as AC92 (c)'s example and round 2's L2 have it.
2. **"1 of 1 workflow passed":** acceptable (the test list's "singulars").
3. **"sprints not available" when no Timeline is built:** acceptable, as an unknown in words. Only a throwing `feedView` reaches it (code only).
4. **A milestone's fold counting only the sprints it opens, and AC60's "named by its pull request" fold keeping its words:** correct. The Definer settled it (note 3). No fixture reaches a named fold.
5. **The joined name at the two-line cut:** correct under ruling B ("the cut … unchanged"). See N1.

NON-BLOCKING FINDINGS
- **N1 (note; item 16; ruling B's "so both usually show").** At 360 px all four gates states read the same as before up to the cut. The joined name starts at the end of line 2, and its second item is past the fade. At 414 it shows in 3 of 4 states. Evidence: crops/waits-rows.png.
- **Pre-existing:** the known `--soft` follow-up does not appear on any changed run. P1 from round 1 is now closed.

OPEN QUESTIONS
- None for this stage. Round 1's Q1 and Q2 are settled by the Definer (0300026). Q3 is answered by this round.

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE 87bac4d | AFTER G5 e400666)
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/01-page-milestone-counts-360x740-light.png: the phase lines and "8 of 15 reached".
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/02-launch-f1-f2-opened-414x896-dark.png: F1/F2. "0 of 5, not recorded yet" becomes "0 of 2 reached" and "1 tracked · 4 not tracked".
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/03-design-opened-rows-sprints-360x740-light.png: opened Design, "work filed · 4 sprints · 4 merged".
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/04-timeline-sprint-folds-360x740-light.png: "4 sprints" becomes "4 sprints · 4 not read".
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/05-details-ci-workflows-414x896-light.png: "CI on main: running · 2 of 3 workflows passed, 1 running".
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/06-waits-row-gate-named-once-414x896-light.png: "the Launch gate for P-004 and P-005", both before the cut. Its foot shows the fixed Build line, "0 of 8 reached · 4 sprints · 4 not read".
