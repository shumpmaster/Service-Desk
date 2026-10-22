# S-001 desk v2, stage 7 (dark mode and the screens no frame redraws): the Design reviewer's round 2, verbatim

Dispatched by the orchestrator on 2026-10-22 against build/builder/desk-v2-7 at f393d3c.

---

Verdict: FAIL

Round 2, stage 7, at f393d3c. My three round-1 findings are fixed everywhere I looked: the tap banner's words are in ink, both record panels are back, and the group links meet the 24 px tap rule. The running log now follows the owner's ruling: every lane has a grey and a line of its own, and its curves and dots follow it. One thing broke because of that ruling. The short stub that marks a piece of work as still under way is a fine dashed line. Now that lanes are themselves dashed or dotted, the stub looks like the lane carrying on: on a dotted lane it can't be told apart at all, and on a dashed lane only on a close look. Nothing else moved, and nothing here is irreversible.

**What I ran**
- **Worktrees:** fresh detached worktrees at f393d3c, 83118c1 and 361b6b7; all removed at the end, branch untouched.
- **Captures:** same dr7-h harness as round 1, with the head's fixtures, which are unchanged since 83118c1. f393d3c captures are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/dr7-h/cap-r2/: 2,056 PNGs from main, extremes, sdq, unread25 and letters, plus the tap, signed-out and render-error states, at 360×740 and 414×896, light and dark. The round-1 captures in .../dr7-h/cap-new/ serve as the 83118c1 reference. Crops are in .../dr7-h/r2crops/.
- **Tests:** the locked page tests ac80-board, ac81-bar-type and ac48-62-63-look, plus ac88-dark: 51 of 51 pass. The locked files are unchanged since 83118c1. The full suite: 1,017 of 1,017 pass (.../dr7-h/suite-r2.txt).

## Blocking finding

**R2-1. The under-way stub no longer reads as under way on a dashed or dotted lane.**
- **Rulebook:** part A items 2 (AC49: "A lane whose work is not filed yet ends in a short dashed stub"), 13 (a mark that carries a meaning needs its own shape) and 25 (AC88: every mark "as distinct as in light").
- **CSS:** sandbox.css:538 `.lane.stub { stroke-dasharray: 2 3 }` sits on lanes that are now 6/4 dashed (:536) or 0.01/4 dotted (:537).
- **Captures:**
  - Dotted lane: .../r2crops/stub2-dr7r2-wt-light.png and stub2-dr7r2-wt-dark.png, and the whole view in stub2full-dr7r2-wt-light.png. This is the Service-Desk orchestrator's lane 2 stub at x=44, 14 px tall. It reads as a short dotted continuation of a dotted lane, with nothing to set it apart.
  - Dashed lanes: stub1-dr7r2-wt-light.png (lane 1, `--ink2`) and stub3-dr7r2-wt-dark.png (lane 3, `--ink`). The stub's 2/3 marks differ from the lane's 6/4 dashes only on a close look.
  - Compare 83118c1, where the stub sat on a solid lane and stood out: stub1-dr7-r1-light.png.
- **Where it occurs:** pages with stubs on lanes 1 to 3 are the orchestrator in every fixture (main, extremes, sdq and unread25, 3 or 4 stubs each) and the owner pages of Alpha and Beta (lane 1 stub, `fam-you`). Stubs on lane 0 (solid) still read, for example Alpha builder and Letters.
- The owner's ruling does not cover the stub, so this is a drawing point for the Builder. If no stub form can both stay "dashed", as AC49 words it, and stand apart from dashed and dotted lanes, that is a ruling-versus-spec point for the owner (open question 1).

## Fixed, with evidence

- **F1, the tap banner:** in all four variants the words are `--ink` (sandbox.css:384). No non-token colour remains on the tap screen; the only pixel change is the words' box (32,13)–(195,25). Captures: cap-r2/main-tap-landing-*.png.
- **F2, the panels:**
  - The decision card's open "The whole record" (`.v2-fd > .sb-record`) is on `--bg2` with a 10 px radius and 10/12 px padding: #f7f7f8 on #ffffff in light, #141517 on #0f1012 in dark. That matches the question and gate folds. Crop: r2crops/fold-r2-light.png.
  - The Summary sheet's quoted JSON (`pre.sb-quote`) is on `--surf2`, with the same values. Crop: r2crops/sum-r2-dark.png.
  - The changes sit only on the quote box in every member's e0 and e1 sheet, for example (16,442)–(344,535).
- **F3, the group links:** `.sb-qlist > li > a` has a 24 px minimum (:346). I reran the exact WCAG 2.5.8 sweep with every group opened, on every member of all four main-fixture projects at 360 and 414: 96 of 96 page-width combinations show 0 failures (.../dr7-h/sweep-groups-r2.txt). Round 1 had 9. The measure's undersized count on main fell from 1,470 to 52. What remains is "From the record", which passes the spacing exception as it did in round 1, and v2 links on Home and the project page that this round does not change.
- **The lanes against the owner's ruling (P-001-desk-v2-lanes, A):**

  | Lane | Grey | Line | Dot |
  |---|---|---|---|
  | 0 | `--ink` | solid | filled |
  | 1 | `--ink2` | dashed 6/4 | ring |
  | 2 | `--ink3` | dotted 0.01/4, round | dotted ring |
  | 3 | `--ink` | dashed 6/4 | ring |

  - The fork and join curves take their lane's line and grey: measured on every lane element of the Service-Desk owner's log, light and dark.
  - Every pair of lanes differs in its line, or in grey by a wide margin. The one pair sharing a line, lanes 1 and 3, is #5c5f66 against #18191c in light and #a2a5ac against #ecedef in dark.
  - The main line stays `--ink2`, solid, 1.6 px.
  - Dots sit on their rows: worst offset 0.1 px, 14 of 14 dots, at both widths and in both themes.
  - Captures: r2crops/owner-log-dr7r2-wt-light.png and -dark.png, and orch414-light-l.png. Every lane looks different at a glance in both themes.
- **Nothing else moved against 83118c1.** Of 2,056 captures, 1,409 are identical (.../dr7-h/imgdiff-r2-all.txt). The rest are:
  - the multi-lane member pages, changed in all 8 captures each;
  - every member's Summary sheets;
  - the decision fold;
  - the tap banner;
  - "checked N s ago" counters;
  - seven pages changed in one or two captures only. I recaptured four of them (Service-Desk critic, Alpha builder, Epsilon definer, Letters owner) at both heads: identical each time (.../dr7-h/rep*). Those were races in the full-page capture.
- **Accepted view:** still pixel-identical to 361b6b7. 100 of 100 captures from main and sdq, both widths, both themes (.../dr7-h/imgdiff-acc-r2.txt), and the crawl texts are byte-identical.
- **Every fixture, both widths, both themes:** no text under 4.5:1, nothing scrolls sideways, text boxes stay 16 px, no capitals outside v2's Now line, and vermilion only on the ◆ and v2's own marks.

## Non-blocking follow-ups (carried from round 1, unchanged)
- On Plan, a bubble's sticky top row and note sit on `--card` over a `--bg` bubble (:192, :562 against :1387).
- The Working now sheet's "Cost: –" shows a dash for an unknown.
- PR, deploy, hold and merge sheets never draw the whole-record fold, because only decision cards and questions carry `fullText`.

## Open questions
1. If no stub form satisfies both AC49's "short dashed stub" and the dashed and dotted lanes, should the owner be asked how work under way is marked? One possibility is a mark no lane uses, such as an open end or a "now" ring already at the stub.
2. No fixture gives the Chief of Staff a log with lanes (J13 session lines), so the ruling is unverified there. Should a fixture be added?