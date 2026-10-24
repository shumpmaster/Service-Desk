# M3D stage 6a (S-001 after MD3): the Design reviewer's round 3, with stage 7, verbatim

Dispatched by the orchestrator on 2026-10-24: job 1, stage 6a at 00446a5; job 2, stage 7 at c2299cc.

---

THE NUMBERS FIRST (this hand-back is my only channel, so there was no separate interim message)

Stage 6a round 3 (00446a5) passes: the Reviewer can run. Rendered in Chromium at 360 and 414, light and dark, against db1474e, on five fixtures.

| Fixture | Gap under the words (db1474e → head) | Smallest control | One-line bare rows |
|---|---|---|---|
| shortRowsSetup | 27.1 → 0 px | 36 × 24.47 | 2: "Desk known", "Look chosen" |
| Plan | 20 → 0 px | 36 × 33.23 | — |
| two projects | 20 → 0 px | 36 × 32 | — |
| dr4r2 main | 0 → 0 px | 36 × 32 | — |
| long, 360 | 20 → 0 px | 36 × 33.23 | — |
| long, 414 | 27.1 → 0 px | 36 × 24.47 | 1, a natural one: "The desk's value targets shown" |

- In every run, no name is narrower and none wraps more than at db1474e.
- Every control is at least 24 × 24, and the two controls are exactly 4 px apart.
- The long fixture's one-line row is a real case, not just the made-up fixture.

=====
JOB 1: STAGE 6a, ROUND 3 (00446a5, against 22eca92)

Verdict: PASS

I didn't see the Builder's summary. I used detached worktrees at 00446a5, 22eca92 and db1474e, checked that each was unchanged, and removed them. Nothing in the repo changed. Scratch folder: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m6a3-h/

- **The change.** It is the `fill` layout (sandbox.css:1231-1232): bare rows' controls stacked beside the row only, unpadded, filling its height, each at least 24 px. Rows with lines under them keep base's spanning column.
- **Round 2's B1 is fixed**, as the table above shows. Reports: m6a3-h/Q-*.json. Capture: m6a3-h/ordering-r3.png (short rows at 360 light; long at 414 dark, with its one-line row).
- **Tests.** The locked page tests, ac88-dark, ac89-words-drawing (with the rewritten ordering case), ac86-plan and ac24-work-ahead: 119 of 119 pass. Full suite: 1123 of 1123 pass (m6a3-h/full-suite.txt).
- **Nothing else moved against 22eca92.** JSON compare: main 292 of 292 and extremes 756 of 756 identical (m6a3-h/seq/).
- **Non-blocking:** the controls' height now varies with the row, from 24.47 px beside a one-line row up to the row's height beside taller ones. Readable, and within part A item 11.
- **Follow-up, unchanged:** round 2's N1, two gate rows at the same gate reading alike on Plan.

=====
JOB 2: STAGE 7 (18fa305..c2299cc; 22eca92's merge ignored)

Verdict: PASS

I used detached worktrees at c2299cc and 18fa305, checked that both were unchanged, and removed them. Scratch folder: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m7b-h/

The three on-screen points, at 360 light and 414 dark. The fixture is a made-up portfolio with `library/facts/_TEMPLATE.md`, `_draft.md` and README; `intent/PORTFOLIO-INTENT.md`, `2026-standing.md` and README; and a queue with README.md and `.gitkeep`.
- **The intent row** now reads only "Standing intent: intent/PORTFOLIO-INTENT.md (its words not read)", the file name in Plex Mono. 18fa305 showed "Standing intent: 2 · 2026-standing.md, PORTFOLIO-INTENT.md".
- **An owner's `_draft.md` counts:** "Library facts: 1 · _draft.md". 18fa305 showed "2 · _TEMPLATE.md, _draft.md". Capture: m7b-h/rare-c2299cc-414-dark.png. Report: m7b-h/R-*.json
- **A reload 2 minutes after a Done mark,** with the clock then run in 15-second steps: the card is kicked back at 295–310 s at head, against 432 s at 18fa305. The words are as before ("The card file is still in the portfolio's queue"). Report: m7b-h/K2-*.json
- **From round 1, still holding:** the queue's README.md and `.gitkeep` are not cards (1 counted, not 3), and a plain Done mark is kicked back at 300 s.

Tests:
- The locked page tests, ac88-dark, ac89-portfolio-reads, ac87-portfolio-6b, j23-portfolio and ac14-budget: 113 of 113 pass.
- Full suite: 1139 of 1139 pass (m7b-h/full-suite.txt).

Nothing else moved against 18fa305. These fixtures hold none of the template files, READMEs or `.gitkeep`, so the changes above can't show in them. Diffs: m7b-h/seq/

| Setup | Captures identical |
|---|---|
| main | 292 of 292 |
| pf-cards, pf-x-cards | 108 of 108 each |
| pf-q-one | 84 of 84 |
| pf-access, pf-fail, pf-none | 72 of 72 each |
| signed-out, three tap links | 4 of 4 each |
| render failure | 8 of 8 |

NON-BLOCKING
- N1 (Definer): with the template's `PORTFOLIO-INTENT.md` present, an owner's own further intent file (`2026-standing.md`) is no longer shown or counted anywhere on the row. It's the spec's wording (specs/S-001.md:12338-12339), and the Builder notes it as the Definer's open case. Until it's settled, an intent file the owner writes stays out of sight.

Cleanup: every worktree is removed and unchanged; /home/user/sd-orch-m3d-4 is untouched. Raw PNGs are deleted; I kept the two crops and the JSON reports. About 6.7 GB is free, and nothing of mine is still running.