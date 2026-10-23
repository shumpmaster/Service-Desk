# M3D stage 2 (S-001 after MD3): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-2 at a57ad0e.

---

Verdict: FAIL

Design review of M3D stage 2 (S-001: AC56 as changed after MD3, and AC89 (i)). Branch build/builder/m3d-2 at a57ad0e, compared with e19ae0a. I did not see the Builder's summary. I worked in fresh detached worktrees at a57ad0e and e19ae0a, checked that both were unchanged, and removed them. I deleted the raw PNGs and kept the reports, crops and montages. I changed nothing in the repo. About 6.5 GB is free.

The FAIL rests on one blocking finding, B1. The fix is small.

TESTS
- Locked page tests (ac80-board, ac81-bar-type, ac48-62-63-look), ac88-dark, and the stage's own ac56-moving-refresh, ac89-after-md3 and ac86-plan: 115 of 115 pass.
- Full suite (`node --test tests/desk/`): 1082 of 1082 pass. Log: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d2-h/full-suite.txt
- One locked case was rewritten, not dropped: tests/desk/ac86-plan.test.mjs:241. The Plan gate row's link changed from `#/waiting/card/…` to `#/work/card/…`. That matches AC89 (i).

HOW I CHECKED
I wrote a reload harness in Chromium. It keeps one fake server and one browser context across `page.reload()`, so device storage survives as it would on the phone. Harness: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d2-h/rl.mjs. Scenarios: scen*.mjs in the same folder. Every run's JSON report is there too.

BLOCKING

B1. After a reload, closing "About the phases" loses focus. AC89 (i) (specs/S-001.md:7898) says Escape, the close or a tap outside returns focus to the card or row the sheet belongs to.
- To reproduce: open `#/p/Alpha` → More detail → "About the phases" (`#/p/Alpha/info`), then reload.
- Focus lands on Close, which is right.
- Press Escape: focus goes to `body`, and the next Tab restarts at "Back" at the top of the page.
- Same in the sdq setup (`#/p/Service-Desk/info`). Report: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d2-h/F-sdq.json
- Without a reload it works: focus returns to the "About the phases" link.
- Cause: `openerOf()` returns `['info']` (sandbox.js, the `if (sh === 'info') return ['info'];` line in openerOf). That link sits inside the "More detail" `<details>` (detailsNode, sandbox.js ~1287). A full reload doesn't keep folds (foldOpen false after the reload), so the target can't take focus.
- Possible fix: fall back to the fold's summary (`more-detail`), or open the fold.
- At e19ae0a the reload didn't focus anything, so this is the new rule failing, not an old fault.
- Reports: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d2-h/I-m3d2-wt.json and I-m3d2-base.json in the same folder. Capture: m3d2-h/info-after-reload-360.png

NON-BLOCKING (risks for the gate's case)

N1. A sheet brought back scrolled puts focus on a Close you can't see.
- Focus lands on Close first, then `restoreScroll` puts the sheet's scroll back, and the sheet's head (title and Close) scrolls away.
- Extremes, 360, a question sheet scrolled 140 of 174 px: after the reload the focused Close is at y = −73, fully off screen, in light and dark. Its ring is drawn but out of view.
- The same happens with a gate reason typed over Plan (the sheet comes back at 413 px).
- At 414 the sheet doesn't scroll, so the Close stays visible (y = 72).
- Both rules are met as written (focus on close, scroll as it was), so this is for the Definer to settle, for example a sticky sheet head.
- Evidence: m3d2-h/ring-hidden-360-dark.png and m3d2-h/zA-360.png. Reports: m3d2-h/zA-*.json

N2. "Move to Done" in a sheet closes it and leaves focus on `body`. It happens on Waiting at both e19ae0a and a57ad0e, and now also over Plan, where the row disappears. This is older behaviour; the scroll is kept (Plan 1172 → 1172). Reports: m3d2-h/B3-*.json and B4.json

N3. Not reached in the browser: a confirmed Done row's sheet (`…#step`). These fixtures only gave a "Confirming" card. This case rests on ac56's unit test.

WHAT PASSED, at 360×740 and 414×896, light and dark unless I say otherwise

- Reload on Waiting (part A item 15). A question sheet with words typed, the board scrolled to 300 and the sheet scrolled 140: after the reload the address, the words, the board scroll and the sheet scroll are as they were.
  - Focus lands on Close with a 2 px ring (`--ink`: rgb(24,25,28) light, rgb(236,237,239) dark).
  - Escape returns focus to the card title, with the ring.
  - Reports: m3d2-h/A-360-light.json and m3d2-h/zA-{360,414}-{light,dark}.json
- Tab and Shift-Tab stay inside the sheet. 24 presses each way cycle Close → choices → box → Move to Done → folds → GitHub link → Close.
  - That order matches the screen, top to bottom.
  - Every stop shows the ring.
- The same trap and reload focus hold for every other kind of sheet I could reach (all at 360 or 414):
  - Waiting cards: question, pull request, gate, decision card, hold, deploy, and a portfolio card.
  - Plan: milestone and gate.
  - Portfolio rows: cap, decisions, scorecard, versions, rare.
  - Project page: value targets, experiments.
  - Team: Working now, a log entry.
  - Each returns focus to its row on Escape, except B1's "About the phases".
  - Reports: m3d2-h/F-*.json and m3d2-h/G-*.json
- Gate sheet from Plan (`#/work/card/Alpha|gate|queue/P-002-criteria-1.md`).
  - It sits over Plan (Plan still drawn, Plan's scroll 1172 kept, no "Back" step added).
  - Escape, Close and a tap outside each close it back to `#/work` with focus on its row. A mouse tap shows no ring, as `:focus-visible` intends.
  - Reloaded with it open: focus on Close, then Escape returns focus to the row.
  - Its four buttons and "Your reason" work as on Waiting. A reason typed over Plan survives the reload, shows on the same card on Waiting, and goes into Proceed's file.
  - Capture: m3d2-h/BC-360.png (panels 1 and 2). Reports: m3d2-h/B-*.json and B2.json
- The "4 more since 00:00" sheet (the stage test's two-project setup, "last looked" set 10 h back).
  - Through a 20 s window and a reload, it comes back with the same 4 lines, and `desk-seen-v1` doesn't move.
  - Focus lands on Close; Escape returns focus to "4 more since 00:00".
  - After closing, the next window moves "last looked", and the line goes away.
  - Capture: m3d2-h/BC-360.png (panels 3 and 4). Reports: m3d2-h/C-*.json
- Home's scroll (420) comes back after a reload. Hidden then visible without a reload, the kept scroll is removed (`desk-scroll-v1` gone).
- Emptying the box drops `desk-sheet-words-v1`.
- With writes to those two keys refused: the reload clears the words, the sheet still comes back by its address, Home opens at 0, and there is no console error. Reports: m3d2-h/E-*.json
- Nothing else moved against e19ae0a. I ran the whole stage-1 harness, JSON only, on both commits, and every setup matched:

  | Setup | Captures identical |
  |---|---|
  | main | 620 of 620 |
  | extremes | 1028 of 1028 |
  | sdq | 224 of 224 |
  | unread25 | 208 of 208 |
  | letters | 134 of 136 |
  | pf-cards, pf-x-cards | 108 of 108 each |
  | pf-q-one | 84 of 84 |
  | pf-access, pf-fail, pf-none | 72 of 72 each |
  | signed-out, three tap links | 4 of 4 each |
  | render failure | 8 of 8 |

  - The 2 letters differences are a clock age, "5 h 2 m" against "5 h 3 m", which is harness timing.
  - No stylesheet changed, which agrees with all of this.
  - Diffs: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m3d2-h/seq/cmp-*.txt

FOLLOW-UPS AND OPEN QUESTIONS
- Q1 (Builder, via the Orchestrator): fix B1. Also add a reload case for `#/p/<name>/info` to ac89 (i). Its focus test covers only a Waiting card.
- Q2 (Definer): N1. After a reload, should focus go on Close even when the restored scroll hides it? Or should the sheet's head stay in view (sticky), or the focus go to the sheet itself?
- Q3 (Definer): kept words on a portfolio card. `draftsToDrop` judges "no longer waits" only for a project read in that drawing (`readOk(':portfolio')` is never true). So words typed on a portfolio card would stay until the 7 days run out. I didn't check that a portfolio card's sheet has a words box, so this is a question, not a finding.
- Q4 (Orchestrator): N2's focus after "Move to Done" is older behaviour, to carry as a later follow-up.