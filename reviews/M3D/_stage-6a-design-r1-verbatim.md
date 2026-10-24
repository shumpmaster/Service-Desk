# M3D stage 6a (S-001 after MD3): the Design reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-23 against build/builder/m3d-6a at dc6325c.

---

Verdict: PASS

Design review of M3D stage 6a (S-001, AC89 (d) to (g) and (k)). Branch build/builder/m3d-6a at dc6325c, judged against db1474e only. I did not see the Builder's summary. I worked in fresh detached worktrees at dc6325c and db1474e, checked that both were unchanged, and removed them. I deleted the raw PNGs and kept three montages and the reports. I changed nothing in the repo. About 6.4 GB is free.

Nothing is blocking. Two findings go to the gate's case as risks (N1, N2), with three smaller ones after them.

Scratch folder for everything below: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/m6a-h/

TESTS
- Locked page tests (ac80-board, ac81-bar-type, ac48-62-63-look), ac88-dark, and the stage's own ac89-words-drawing: all pass. The same run included the eight changed files (ac24, ac69-72, ac82, ac83, ac84, ac86, j13, md-sandbox): 236 of 236 pass.
- Full suite (`node --test tests/desk/`): 1121 of 1121 pass. Log: m6a-h/full-suite.txt
- Every edit to an existing case is a rewrite that cites its spec line. None was dropped.
- `src/lib` and `src/public/lib` match for all eight files.

THE ORDERING VIEW (⇅): a regression at 360, a fix only at 414 on rows with nothing under them. Not a taste call.
Rows are measured in Chromium at both commits. Reports: m6a-h/P-*.json. Montage: m6a-h/ordering-360-light.png (base left, head right).
- The spec line is met. On Plan's fixture (`waSetup`) there is no empty space under any row (120 px in total at base, 0 at head), in all four variants.
- But side by side, the controls take 40 px from the name column.

  | Fixture, width | Ordering list: base → head | Name column | Names |
  |---|---|---|---|
  | Plan (`wa`), 360 | 627 → 658 px | 131/157/122 → 91/117/82 px | 2 lines → 3–4 lines |
  | Plan (`wa`), 414 | 579 → 489 px | 185/211/176 → 145/171/136 px | no extra wraps (the one fix) |
  | Two projects (`watwo`), 360 | 1555 → 1646 px | — | — |
  | Two projects (`watwo`), 414 | 1418 → 1442 px | — | — |
  | dr4r2 main, 360 | 2509 → 2777 px | — | 9 one-line names now 2 lines |
  | dr4r2 main, 414 | 2320 → 2439 px | — | — |

- The meta line also breaks mid-phrase at 360, with a "·" starting a line ("M3B · Build / · about 2–4 / days").
- Why it's a loss where rows have lines under them: base's stacked column already ran beside the row and those lines, so there was never empty space. At head the controls sit beside the row only and the name column is narrower, so there is only loss.
- Part B doesn't apply: mockup v2 doesn't draw the ordering view. The mockup the owner judged (work-ahead.html v2, specs/S-001.md:1223; work-ahead.html:79-80, 137) stacks ▲ above ▼. No part A item covers length or wrapping, so this is non-blocking.
- It isn't a taste call, because a layout that keeps both exists. I measured it in the browser through the CSSOM, with no file changed:
  - Stacked, beside the row only (`grid-row: 1`), no 6 px padding: no empty space, no name narrowed. Plan's fixture: 627 → 507 px at 360, 579 → 459 px at 414 (head: 658 and 489).
  - That alone makes rows with lines under them longer (main 2660 against base's 2509). So the measured best is a mix: stacked beside the row only where a row has nothing under it, and base's spanning column where it does (e.g. `.v2-plli.ord:has(.v2-plunder) .v2-plmove`).
  - Reports: m6a-h/Palt2-*.json
- The stage's test pins the side-by-side layout (ac89-words-drawing.test.mjs:302-303 and 314: `grid-auto-flow: column`, `grid-row: 1`). A new layout would rewrite that case.
- Recommendation: carry it as N1 (below), and fix it in a follow-up or in 6a's next round, the Builder's choice through the Orchestrator.

THE STAGE-8 GUARD: no exception is right as the guard stands, but the guard can't see 6a at all
- The rule (specs/S-001.md:15549) is an exception for exactly what a stage changes on purpose. The guard asserts each exception is met, so an exception for an element it never draws would fail.
- I ran a scratch copy of the guard with db1474e's sandbox.css as its "before": `FAILS []` across 322 screens. A seeded change (`.v2-title { letter-spacing: 3px }`) is caught in both themes, so the copy works. Reports: m6a-h/guard-vs-db1474e.txt and guard-seeded.txt
- Counting what it draws (m6a-h/guard-count.txt), its 322 screens have none of:
  - a Plan bubble;
  - a project page bubble;
  - a bubble note;
  - a Timeline mark;
  - `.v2-plmove`;
  - `.v2-wclip`.
- They do have Home bubbles (231) and sheet bubbles (3), whose top rows 6a doesn't restyle.
- So all four of 6a's rule groups are invisible to it. See F1.

WHAT PASSED (Chromium; 360 and 414, light and dark unless I say otherwise)
- (d) The v2.5 page's "Your merges?" is gone. "Your last action: not recorded (operating model v2.5.1 records rulings in the ledger)" stays. A v3 project keeps its fold. Capture: m6a-h/v25-page.png
- (e) Working now: "Cost: not known yet · from the usage record when it ends"; tiles keep "–". The Chief of Staff's wording rests on the j13 unit cases.
- (f) Bubble grounds, checked in a real open bubble on the long-text fixture, with a `p.sb-bubble-note` added so the real stylesheet applies. Reports: m6a-h/F-long-*.json
  - At base: Plan's top row and every note sat on `--card` (#fbfbfb light, #17181b dark) inside a `--bg` bubble.
  - At head: the top row and note are on `--bg` on Plan, its milestone sheet, Home and the project page, in light and dark.
- (g) Timeline marks, sd3 fixture, 81 mark rows (68 with a reason). Report: m6a-h/G-*.json
  - At base: 68 rows had tops spread by up to 4.6 px.
  - At head: every row is level (spread 0), every mark 24 px tall and 11 px.
- (k), each part:
  - "Run 2 began 8 Oct", "Run 3 began 14 Oct", "Run 4 began 3 Oct".
  - The stale tile line reads "Next: MD3 · rough finish 18 Nov – 19 Nov · may be out of date", at 2026-11-17 on the two-project Plan fixture.
  - The phases sentence no longer says "Launch … ahead" twice.
  - Rule-3 rows show the half icon.
  - Gate cards aren't counted on milestone rows.
  - The v2.5 CI row names its workflow.
  - Unparseable portfolio cards name their file once, with the "can't parse" note cut at 50.4 of 84 px and the fade; the whole note is in the sheet. Capture: m6a-h/pfcard-360-light.png
  - "<n> more" and the ✕ mark's "source check failed" rest on their unit cases. No fixture of mine reached them.
- Nothing else moved against db1474e. Whole harness, JSON only, base against head. Diffs: m6a-h/seq/cmp-*.txt

  | Setup | Captures that differ | What moved |
  |---|---|---|
  | main | 40 of 292 | band dates; phases sentence; Cost line; v2.5 "Your merges?" |
  | extremes | 82 of 756 | the same kinds, plus 2 sheet-opacity frames (timing) |
  | sdq | 12 of 136 | band dates; v2.5 "Your merges?" |
  | unread25 | 12 of 120 | band dates; v2.5 "Your merges?" |
  | pf setups | phases sentence; the broken card | — |
  | letters, signed-out, render failure, three tap links | none | — |

  - pf-q-one differed in 6 captures. A rerun gave 21 of 21 identical, so that was read timing.
  - Widths stay at 360 and 414, with nothing scrolling sideways.

NON-BLOCKING (risks for the gate's case)
- N1. The ordering view at 360, as above.
- N2. The phases sentence still names Design twice ("Design and Build run 1 gone back over; now Design run 2") and Build twice ("… the Build gate waits on you"), against (k)'s literal "names each phase once" (specs/S-001.md:7929). The fault it came from (2-D1 N4, "Launch" said twice) is fixed, and the remaining repeats are different runs. The Definer should say whether the literal reading is meant.
- N3. The v2.5 CI row:
  - "CI on main: passing · ci · date not read" puts the raw workflow name in the row's title type, not after the plain words in small mono (part A item 19).
  - With no counted runs it reads "CI on main: none · workflow and date not read", where nothing exists to read (part A items 4 and 5). The spec's wording, for the Definer.
- N4. The unparseable card's sheet still names its file twice (meta line and title). The spec line covers the card only.

FOLLOW-UPS
- F1 (Orchestrator, Builder): give the stage-8 guard screens that draw what 6a restyled: an open Plan bubble with a note, a Timeline with marks, the ordering view open, and an unparseable portfolio card. Then add 6a's exceptions, or the guard stays blind to these four rule groups.
- F2 (Builder, via the Orchestrator): N1's mixed layout, and rewrite ac89-words-drawing's ordering case with it.
- F3 (Definer): N2 and N3's wording.