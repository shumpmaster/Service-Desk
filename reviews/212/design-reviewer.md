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

(Recorded verbatim by the orchestrator from reviews/M3D/_stage-6a-design-r3-verbatim.md, job 2, which is stage 7's.)
