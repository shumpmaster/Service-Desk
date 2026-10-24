# S-001 after the glance audit: the plan Reviewer's round 1, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/definer/glance-plan at 671eada.

---

Verdict: FAIL

**Plain summary.** All the repo checks pass. The governance suite, the surface guard and the whole desk test suite (1,154 of 1,154) are green, and the commit's identity and trailers are correct. Most of the amendment's "as built" claims match the code. G10 really is gated: nothing in G1–G9 needs the operating model's S-034, and no stage adds a read, so A3 holds. The plan still fails on six points:
- G5's counts are not defined tightly enough to lock in tests.
- Three criteria contradict the code or each other: the date form (AC91 (l)), the palette rule against the notification warning (AC92 (a)), and the box line cap against Home's briefing (AC92 (e)).
- One "as built" premise is false: the red tile border (AC91 (c)).
- The plain paragraph promises the owner something the criterion doesn't deliver: "the biggest text".

All six go back to the Definer for draft 2. None needs the owner.

**Checks run (worktree /home/user/sd-definer at 671eada)**
- `bash governance/checks/check_all.sh . 2d0edb0`: every line PASS, "OK: all governance checks passed", exit 0.
- `python3 governance/checks/surface_guard.py diff --range 2d0edb0..671eada --branch build/definer/glance-plan`: "OK: 1 commit(s) … checked", exit 0. The commit is by `definer <definer@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers. Only specs/S-001.md changed (+749/−1).
- `cd src && npm test` (node v22.22.0; no node_modules needed, wrangler is dev-only): 1154 tests, 1154 pass, 0 fail. The working tree was clean afterwards.
- Both proposed PR lines pass `governance_checks._milestone_problem`: `Milestone: none (a design follow-up after M3D: …P-001-glance-*.md; its milestone awaits the owner's approval)` and `Milestone: M3E`. All 11 quoted rulings match line 1 of their records.
- AC92 (a)'s figures, recomputed with tests/desk/ciede2000.mjs and WCAG contrast:
  - `--ok` is 5.26 to 8.21:1 and `--bad` 5.77 to 6.91:1 on the four grounds in both themes.
  - The smallest colour distance is 13.31 in light (`--you`/`--bad`) and 12.22 in dark (`--gold`/Build olive).
  - Dark-mode vermilion and `--bad` are 15.62 apart.
  - All as stated.

**As-built claims confirmed (no finding)**
- **Home:**
  - The briefing's parts and their order: home.js:144-163.
  - The count is 500 15 px: sandbox.css:733.
  - The stall line is the tile's last line, in grey: sandbox.js:871, sandbox.css:799.
  - The corner says a grey "Can't read": home.js:626-631, css:777.
  - The signed-out briefing uses the clock: sandbox.js:692.
  - "Nothing new since": home.js:378.
  - "Since you last looked" cuts at three lines: css:753.
  - "At work" is wholly grey: sandbox.js:869.
- **Waiting:** lanes are 1.18 : 1 : 1 (css:596), with board.js:30-36's titles.
- **Gates:** today's title is "<Phase> gate: <q>" (sheets.js:222-228); the case line comes from orchestrator.py:893-894.
- **Timeline:** it rests just under the band (sandbox.js:3040-3060); the Now mark is a 16×2 px bar (css:1091).
- **Project page:**
  - The opened phase's up-arrow: sandbox.js:1240.
  - The why box on `--bg2`: css:975.
  - Earlier runs have no heads: sandbox.js:1246-1248.
  - The words to be replaced are real: the head's "yours and the model's n" and the "Yours … · Standard: k of n" lines (projectpage.js:28, 320-326), the Timeline's gathered line (feed.js:588) and its "<n> sprints" fold (sandbox.js:2879).
- **Failed-load screen:** its words are at page.js:71 and app.js:124-140.
- **The counts' data:** everything G5 needs is already read. feed.js:386-466 places the sprints (from J11's runs, AC60's plan and `Milestone:` lines, and J12's `mergedAt`), projectpage.js:255-317 builds the phase lines, and records.js:880-948 already holds the CI runs. No read is added.

**Blocking findings**

- **B1. G5 / AC92 (c): the counts are ambiguous, so their tests can't be locked.**
  - **Reached, across runs:** it's unclear whether a milestone reached in a run later gone back over counts in R. The same goes for a standard milestone reached in run 1 and "not reached" in run 2.
  - **States the spec doesn't place:**
    - "Carried over": the code counts it as reached (projectpage.js:283).
    - "Not needed": it is a recorded state, so it counts as tracked and joins T, but it can never be reached. A phase holding one never reads complete.
  - **Skipped against tracked:** a skipped line whose run records a state is both tracked and skipped (projectpage.js:227-230). "<k> tracked · <u> not tracked · <j> skipped" may then double-count, or not add up to n.
  - **"Tracked" has two meanings:** in any run for (c), per run for (d).
  - **The letter u means two things:** not-tracked standard milestones, and sprints whose merge isn't read.
  - **Merged:** pipeline-item sprints show "✓ merged" from `j.merges` (feed.js:496-497). But m counts only pull requests J12 reads as merged, so a phase could read "7 sprints · 3 merged" while its Timeline shows 7 ticks.
  - **Sprints counted twice:** a sprint listed under two milestones or runs (feed.js:400-410, "also feeds") is either counted once or per milestone. The page tally summed across phases has the same problem.
  - **The CI line, "<n> runs, <k> passed":** it doesn't say whether it counts every run or the latest per workflow (records.js:938-948). It doesn't say whether the deploy, Orchestrator and notification runs count, or whether "passed" means `success` only or anything that didn't fail.
  - Reproduce by reading AC92 (c) next to those lines.
  - Route: Definer.

- **B2. AC91 (l)'s "every date the desk writes with a time" collides with locked tests and with "Not changed: the notifications".**
  - The "Oct 14 09:40" form comes from `whenText` and `dateTimeText` (lib/timefmt.js:33-46), which are J9's `<t>`. They have 24 call sites, including AC78's lines (notifyview.js:280, :294).
  - A locked test asserts the old form: `assert.equal(whenText(...), 'Oct 6 16:31')` at tests/desk/j9-pipeline.test.mjs:68.
  - G4's tests column names no J9 or AC78 case.
  - The Definer must either limit (l) to the places it names, or change J9's `<t>` and list the J9 and AC78 cases rewritten.
  - Route: Definer.

- **B3. AC92 (a)'s rule and test fail on an element that exists today.**
  - The `.sb-warn` style (sandbox.css:263; `--block` resolves to `--bad`) gives the notifications warning (AC75; drawn at sandbox.js:581 and :607 on Home and the project page) a `--bad` border and `--bad` words (css:864, :988).
  - Test (a) says "no … border-color … resolves to either" and that every `--bad` element is a status mark or a named line. It fails on this warning unless G7 restyles a notification line, which the amendment says doesn't change.
  - Other `--bad` words are not in the list either:
    - the "Can't show this project" tile (sandbox.js:937-938);
    - the `.sb-stale` error screens (sandbox.js:4391, :4444);
    - the portfolio's "Can't show this" (sandbox.js:1001);
    - the group head's can't-read count, `.v2-hgb` (css:765).
  - Route: Definer.

- **B4. AC92 (e)'s line cap conflicts with AC91 (a).**
  - The rule is "each box at most three lines at 360 px", and Home's box is "the briefing, as built, holding the count and its due lines".
  - After G1 the briefing holds the head line, the parts line and up to three due or undo lines (past settle, coming settle, lock; home.js:156-162), plus any can't-read lines (sandbox.js:699).
  - One question that settles itself plus one that can't be undone already makes four lines, so G9's test fails on Home.
  - Route: Definer (exempt the briefing, or redefine the cap).

- **B5. AC91 (c) rests on a false "as built" premise.**
  - The whole red border, `.v2-tile.bad` (css:770), is drawn only on a tile the desk can't draw: the catch at sandbox.js:936-938, "Can't show this project: …". That tile has no corner line.
  - A project whose read fails is drawn by `tileNode` with plain `v2-tile` (sandbox.js:862), with no red border.
  - So "the corner's line carries the state" is untrue for the one tile that has the border, and the spec doesn't say what that tile shows afterwards.
  - Also unspecified:
    - The tile's existing foot line "✕ Can't read since HH:MM: <reason>" (sandbox.js:872): kept, which says the time twice, or removed, which drops the reason from Home.
    - With items waiting and a failing read, the corner shows "◆ n wait on you" (home.js:627), so the new corner never appears.
  - Route: Definer.

- **B6. The plain paragraph ("your count is the biggest text") and G1's row ("the largest text") misstate AC91 (a).**
  - The title "Home" stays `--t-title`, 600 24 px (css:477), above an 18 px count (`--t-sheet`, css:478). The ruling's option and audit item 3 both say "The title stays."
  - The owner would approve a promise the criterion doesn't deliver.
  - Fix: "the largest text under the title".
  - Route: Definer.

**Non-blocking notes (carry as risks)**
- **N1. G10's joins.** Three places (S-001:2549, the G10 table row, and the build order's G10) say the reads go "into J9 and J12". S-034's draft (Personal-Org-Operating-Model specs/S-034-tasks-and-steps.md:5, :68, :107) puts a pull-request sprint's steps in the Chief of Staff's session lines (`sprints`), which S-001 reads in J13. It also shows a missing one as "not recorded", where AC93 says "pieces not listed" and "steps not linked". AC93 itself hedges ("or to the join S-034 names") and defines no record form, and G10 is redrafted before build, so this doesn't block.
- **N2. AC91 (j)'s "the only heavy row" is false as built.** "At work now: …" is the same 500 13 px ink row (sandbox.js:1216, css:941). No test locks it.
- **N3. AC91 (j)'s merged ran-again line is underspecified.** `ranAgainLines` works per run (projectpage.js:158-180), so the spec should say what happens to a phase that ran again twice, and to a "not available yet" line.
- **N4. Gate titles are still cut.** "Gate titles no longer cut" and the AC89 (j) note contradict (h)'s "cut at two with the fade". `GATE_TITLE` lives at governance/checks/orchestrator.py:105, so cite it. Section 1's "first sentence" is a line holding three sentences (orchestrator.py:806-814).
- **N5. AC91 (k)'s ✕ needs its own drawing.** It is drawn by sandbox.js's `vi()` (sandbox.js:1634), the very module whose failure this screen reports. app.js must draw it itself, and the spec should say what shows when sandbox.css is missing too. Say why G4 touches index.html.
- **N6. G5 is not "derivation only".** It also redraws the folded line, the Timeline fold and Details' CI line in sandbox.js.
- **N7. The capture fixtures don't exist in the repo.** `mix`, `text`, `unread` and `quiet` are the audit's ad-hoc names: they are not in tests/desk/fixtures and no capture harness is committed. Define them, or AC92 (c)'s "from `mix`" examples can't be reproduced.
- **N8. Row gap.** The briefing's row gap is 4 px (css:731), not the "6 px between its lines" AC92 (e) gives.
- **N9. "No ▲ left" in the (b) test.** The reading arrow is an SVG `up` icon, not the ▲ character. Served files still hold '▲' (lib/feed.js:820, lib/sandbox.js:415).
- **N10. Order of the due lines.** When a past and a coming settle time both show, the spec doesn't say which comes first (the code puts the past one first, home.js:156-159).
- **N11. "Not read since HH:MM" when signed out.** There may be no "since" time to show; the fallback words are not given.
- **N12. Review budget.** The budget line "three Reviewer rounds per milestone" (S-001:15750) doesn't say how it applies to ten stage pull requests under one M3E.
- **N13. M3E could stay open at launch.** If question 1 is answered A and question 2 A, M3E (a Build milestone) stays unreached at launch whenever S-034 is late. Question 2 should say so.
- **N14. Plan's "moved" edge.** If question 3 is still unanswered when G7 lands, the change needs a pull request the stage table doesn't list.
- **N15. Sprint links.** AC91 (i) doesn't say whether opening the Timeline from a link to one of its sprints (sandbox.js:3040-3060) also rests a third of the way down.

**Open questions (for the Definer, or the owner if the Definer can't settle them from the rulings)**
1. Does a milestone reached in a run later gone back over count as reached in "<R> of <T>"? The palette ruling already draws its mark grey.
2. Is Home's briefing exempt from the soft box's three-line cap?
3. Should the one date form reach the dispatch-log headlines and the notification usage lines, or only "Your last action" and the member page?
