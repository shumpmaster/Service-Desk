# M3D stage 6a (S-001 after MD3): the Design reviewer's round 2, with stage 7 begun, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/builder/m3d-6a at 22eca92 (and stage 7 at bade9f3, unfinished in this hand-back).

---

THE INTERIM NUMBERS YOU ASKED FOR (my only channel is this hand-back, so they come first)

The Reviewer's worked example does not reproduce in Chromium. The defect it describes is real for a reachable case.

- **The worked example.** `waSetup` with `WORKED()` only, at 414 dark and light, and at 360: "The desk's value targets shown" takes 2 lines in the browser. Its name column there is 176 px (the right column takes the rest), so the 186.4 px name wraps. With the row at 86.9 px, there is no gap at head 22eca92. In all three fixtures (Plan, two projects, dr4r2 main) at 360 and 414, every bare row (nothing under it) has 2 or more lines, and the gap under the row's words is 0. At db1474e it was 20 px.
- **The real case.** It needs a bare row whose name fits on one line. I made one by shortening two bare rows' names in the page to "Agent usage shown" (text only, real CSS): one line, about 53 px tall.

  | Commit or layout | Gap under the row's words, 414 dark and 360 light | Names | Controls |
  |---|---|---|---|
  | db1474e | 27.1 px | 185 / 131 px | — |
  | head 22eca92 | 15.1 px (stacked controls 68 px against a 52.9 px row) | — | — |
  | side by side | 0 | 185 → 145 px at 414; at 360 the name wraps to 2 lines | — |
  | `small` (24 px stacked controls) | 0 | not narrowed | 36 × 24 |
  | `fill` (recommended) | 0 | not narrowed | 36 × 24.45 beside a one-line row |

- **The layout that gives zero gap with no narrower names for every row kind** is `fill`: stacked controls that fill the row's height, each at least 24 px, only on bare rows. Rows with lines under them keep base's spanning column.

```css
.v2-plli.ord:not(:has(.v2-plunder)) > .v2-plmove { grid-row: 1; padding: 0; align-self: stretch; grid-auto-rows: minmax(24px, 1fr); }
.v2-plli.ord:not(:has(.v2-plunder)) > .v2-plmove > .v2-plmv { height: auto; }
```

  - Measured through the CSSOM on the fixtures as they stand, at 360 light and 414 dark (Plan, two projects, main): zero gap on every row; no name narrower and no extra line against db1474e; smallest control 36 × 32 on these fixtures.
  - On the shortened one-line rows: 36 × 24.45, which meets part A item 11's 24 × 24 floor (WCAG 2.5.8), and the controls are 4 px apart.
  - The trade-off: a one-line bare row's controls are shorter than the others'.
- Reports, all in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m6a2-h/: the gap measure is scenP3.mjs. P3-*.json are the unedited fixtures, P3s-*.json the shortened rows, P3f-*.json `fill` on the fixtures.

=====
REVIEW 1: STAGE 6a, ROUND 2 (22eca92, against dc6325c)

Verdict: FAIL

I didn't see the Builder's summary. I used detached worktrees at 22eca92, dc6325c and db1474e, checked that each was unchanged, and removed them. Nothing in the repo changed. All paths below are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m6a2-h/.

BLOCKING
- B1. "The ordering view's rows have no empty space under them" (AC89 (k), specs/S-001.md:7936) still fails for a bare row whose name fits on one line. The gap is 15.1 px at 360 and 414, as above.
  - No fixture has such a row today, but a short milestone name with no lines under it reaches it.
  - The fix: `fill`, above. Rewrite the ordering case in ac89-words-drawing to include a one-line bare row.

WHAT PASSED
- The rest of N1 is fixed. On the three fixtures, at 360 and 414, light and dark:
  - no name is narrower and none wraps more than at db1474e;
  - there is no gap (with the corrected measure, the space under the row's own words);
  - nothing scrolls sideways;
  - the controls are stacked, 36 × 32 and 4 px apart.

  | Fixture | 360: db1474e → head | 414: db1474e → head |
  |---|---|---|
  | Plan | 627 → 507 px | 579 → 459 px |
  | Two projects | 1555 → 1495 px | 1418 → 1358 px |
  | main | unchanged | unchanged |

  - Reports: P2-*.json and P3-*.json
- f5cac07, the second gate row. Fixture: two waiting Launch gate cards in one project, at 360 light and 414 dark.
  - At head, each card has its own row at the top of the group, in the board's order, each opening its own card (`#/work/card/…P-003…`, `…P-004…`).
  - Neither is counted on a milestone row, and Home's tile keeps the first.
  - At dc6325c, P-004 had no row.
  - Report: G-*.json. Capture: gates-head.png
- Tests: the locked page tests, ac88-dark, ac89-words-drawing, ac86-plan, ac24-work-ahead and ac82-home: 145 of 145 pass. I did not run the full suite this round.
- Nothing else moved: main is identical against dc6325c (292 of 292; seq/cmp-main.txt). I stopped the extremes compare to hand back now, so it's unchecked.

NON-BLOCKING
- N1. Two gate cards at the same gate read alike on Plan. Both rows show the same fixed title and the same mono line, "Launch gate · waits on you", with no item code to tell them apart (gates-head.png). Add the item to the mono line ("P-003 · Launch gate · waits on you"), as the board does (part A item 19).

=====
REVIEW 2: STAGE 7 (bade9f3, against 18fa305)

Verdict: not given yet. I stopped early to send the numbers above. What I checked shows no finding. Still to run:
- the JSON compare against 18fa305 (main and the portfolio setups);
- the full suite.

I'll finish both if you send the stage back to me.

All paths below are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m7-h/.

CHECKED, NO FINDING
Fixture: the Plan fixture with a made-up portfolio. Its queue holds one card, a README.md and a `.gitkeep`. Its tree also has `library/facts/_TEMPLATE.md` and README, and `intent/PORTFOLIO-INTENT.md` and README.
- **What's counted.** At head, Home's "Decisions across projects", its sheet and Waiting's Portfolio group all count 1. At 18fa305 they counted 3, and drew `.gitkeep` and README.md as "can't parse" cards. Report: R-*.json
- **The rarer records' sheet** (360 light, 414 dark), at head:
  - "Library facts: none yet" (base: "1 · _TEMPLATE.md");
  - "Standing intent: intent/PORTFOLIO-INTENT.md (its words not read)" (base: "1 · PORTFOLIO-INTENT.md"), the file name in Plex Mono 11 px;
  - those are J23's words exactly (specs/S-001.md:12335-12339). Capture: rare-7.png (base 360 light, head 360 light, head 414 dark).
- **Kick-back.** A card marked "Done ✓" from its sheet, with the clock run in 30-second steps, 360 light and 414 dark:
  - at head it moves from "Confirming" to Kicked back at 300 s; at 18fa305, at 480 s;
  - the words are unchanged ("The card file is still in the portfolio's queue"), and Home reads "1 needs you · 1 kicked back". Report: K-*.json
- **A read that stays pending** isn't reachable in my harness. Held requests fail at the page's own fetch level by about 2 minutes, at both commits ("Can't read your portfolio since 13:00"). The 5-minute pending rule rests on ac89-portfolio-reads.test.mjs:189.
- Tests: the locked page tests, ac88-dark, ac89-portfolio-reads, ac87-portfolio-6b, j23-portfolio and ac14-budget: 110 of 110 pass.

Cleanup: every worktree is removed and unchanged; /home/user/Service-Desk is untouched. Raw PNGs are deleted, and I kept gates-head.png, rare-7.png and the JSON reports. About 6.5 GB is free.