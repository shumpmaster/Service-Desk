Verdict: PASS

I didn't see the Builder's summary. I used detached worktrees at 00446a5, 22eca92 and db1474e, checked that each was unchanged, and removed them. Nothing in the repo changed. Scratch folder: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m6a3-h/

- **The change.** It is the `fill` layout (sandbox.css:1231-1232): bare rows' controls stacked beside the row only, unpadded, filling its height, each at least 24 px. Rows with lines under them keep base's spanning column.
- **Round 2's B1 is fixed**, as the table above shows. Reports: m6a3-h/Q-*.json. Capture: m6a3-h/ordering-r3.png (short rows at 360 light; long at 414 dark, with its one-line row).
- **Tests.** The locked page tests, ac88-dark, ac89-words-drawing (with the rewritten ordering case), ac86-plan and ac24-work-ahead: 119 of 119 pass. Full suite: 1123 of 1123 pass (m6a3-h/full-suite.txt).
- **Nothing else moved against 22eca92.** JSON compare: main 292 of 292 and extremes 756 of 756 identical (m6a3-h/seq/).
- **Non-blocking:** the controls' height now varies with the row, from 24.47 px beside a one-line row up to the row's height beside taller ones. Readable, and within part A item 11.
- **Follow-up, unchanged:** round 2's N1, two gate rows at the same gate reading alike on Plan.

(Recorded verbatim by the orchestrator from reviews/M3D/_stage-6a-design-r3-verbatim.md, job 1; rounds 1 and 2 are _stage-6a-design-r1-verbatim.md and _stage-6a-design-r2-verbatim.md.)
