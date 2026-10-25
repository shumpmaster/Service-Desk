# M3E stage G5: the Design reviewer's round 1 (FAIL, B1), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g5 at f5be3a8 (base 87bac4d).

---

Verdict: FAIL

**In plain English.** G5 does what the owner asked, and it matches the accepted mockup (q4) in substance:
- **Every phase now counts all its milestones.** The "0 of 5 recorded" lines are gone. Each phase now shows two lines: "1 of 5 reached · 6 sprints · 2 merged, 4 not read", then "Standard checklist: 2 tracked · 4 not tracked" (or "none tracked (5)").
- **The section head sums them:** "Milestones by phase · 8 of 15 reached".
- **The Timeline's sprint folds say how many merged:** "4 sprints · 4 not read".
- **Details' CI line counts workflows:** "running · 2 of 3 workflows passed, 1 running".
- **A gate's cards are named once in the waits row:** "the Launch gate for P-004 and P-005".

It fails on one thing. On md-extremes' Alpha, one of the three test projects, the page says Build has "no sprints filed yet", but its own Timeline draws 4 sprints under Build run 1. That is a false statement on the owner's page (part A item 5; AC92 (c), "the count and the ticks never disagree").

The branch moved after I was sent: 8ff4592 and 5c095d5 are titled as fixing exactly this ("G5's review, B1"). As a side check only, not part of this verdict, the same screen at 5c095d5 reads "0 of 8 reached · 4 sprints · 4 not read".

Design review of G5, "After the glance audit" (S-001 AC92 (c); AC83 and AC84 changed; AC89 (c) by the owner's ruling P-001-glance-waits-gates.md, B). Branch build/builder/g5 at f5be3a8, compared with 87bac4d.
- I did not see the Builder's summary. I read the diff; I saw only commit subject lines in `git log`.
- I changed nothing in the repository. Trees were exported with `git archive`.

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/:
- **before/ and after/**: 25 states × 360×740 and 414×896 × light and dark, each src/public served with the after tree's fake desk and glance fixtures (made up, NOT real records). Each capture has a full-page PNG and a JSON file holding:
  - every text run's size, weight, family, colour, ground and contrast;
  - a G5 probe: the head, each phase's two lines with their styles, the opened rows' words, the Timeline folds with their ticks, the CI line, and the waits row's words, ids, line tops and cut.
- **States:**
  - Service-Desk: `text`, `text` with J12's pulls read (closed, and with Design, Build or Discovery opened), mix `laterLaunch` with Launch opened (F1/F2), `quiet`.
  - Other projects: Alpha (mix), poom, md-extremes Alpha and Epsilon.
  - Details CI: 3 runs (one running), 1 run, one failing, none, and poom's.
  - Timeline: pulls read, pulls with every fold opened, text, laterLaunch, ext.
  - Gates: two items, one item's cases, one item without case lines, a card kicked back.
- **view-before/, view-after/**: viewport shots for the pairs. **view-check-*/**: md-extremes Alpha with Build opened at 87bac4d, f5be3a8 and 5c095d5.
- **tool-after/**: the Builder's tool, `node tests/desk/tools/glance-shots.mjs <out> g5-` (36 captures).
- **crops/**: waits-rows.png and B1-md-extremes-build-sprints-360x740-light.png.
- **scripts/**: cap5.mjs, cap5v.mjs, probe5.js, dump.js, sum5.py, crop.py, pairs5.py and dbg.mjs.

TESTS
- Full suite `node --test tests/desk/` on the exported f5be3a8 tree: 1219 of 1219 pass. Log: g5-design/full-suite.txt.
- **Captures:** all 200 of mine and the tool's 36 have no sideways scroll and no page errors. No text run is under 4.5:1 in any capture, before or after.

BLOCKING FINDING

**B1 (part A item 5; item 2 / AC92 (c); item 6, md-extremes): a phase's sprint count disagrees with its Timeline when two runs of a phase share an iteration number.**
- **Where:** src/lib/projectpage.js and src/public/lib/projectpage.js, `runSprintViews` (:271) and `milestoneSprints` (:279), both `feed.blocks.find((x) => x.run === run || x.key === \`${run.phase}-i${run.iteration}\`)`.
- **What goes wrong:** `find` takes the first block for which either test holds. For an earlier run, the `key` test matches a later run's block with the same key before the identity test can reach its own block.
- **Why it happens:** md-extremes and mix Alpha (fullRepo) give two Build runs iteration 1 (scripts/dbg.mjs):
  - Build i1 "gone back over", k=1, with 0 sprint views found;
  - Build i1 "still to come", k=3.
  - This comes from the desk's own reading of the fixture's log (P-002/P-003 at Build stages), not from a hand-written run.
- **What the owner sees:**
  - page-ext-alpha, page-mix-alpha and every gates state: Build reads "0 of 8 reached · no sprints filed yet";
  - timeline-ext: Build · run 1 draws M2B "2 sprints · 2 not read", M2 "1 sprint · 1 not read" and M1 "2 sprints · 2 not read" (4 sprints, once each);
  - the opened phase's M2B/M2/M1 rows add no sprints.
- **Evidence:** crops/B1-md-extremes-build-sprints-360x740-light.png; after/page-ext-alpha-*.json against after/timeline-ext-*.json. Pair 06 also shows the line at its foot.
- **Side check, outside this verdict:** at 5c095d5 the line reads "4 sprints · 4 not read" and the rows add "· 2 sprints · 2 not read". Run 1's head also reads "dates not recorded · gone back over" instead of "planned" (see P1).

EVIDENCE BY CHECKLIST ITEM

**AC92 (c), the section head.** Items 1, 2, 5, 8.
- "Milestones by phase · yours and the model's 24" became "· 8 of 15 reached" (Service-Desk), "8 of 16" (laterLaunch, the same as mock q4's head) and "0 of 14" (Alpha).
- Type is 500 11px `--ink2`, unchanged. "↑ start at the foot" stays.

**AC92 (c), each phase's two lines.** Items 1, 2, 5, 7, 8, 26.
- **Two lines:** two `.v2-sdl` blocks, each one line (17px) at 360.
- **Type:** "R of T" is 500 12px `--ink` (#18191c light, #ecedef dark). The rest is 400 12px `--ink2` (#5c5f66 / #a2a5ac), exactly as specified.
- **Service-Desk, text:**
  - Launch: "0 of 1 reached · no sprints filed yet" / "Standard checklist: none tracked (5)";
  - Build: "3 of 5 reached · 4 sprints · 4 not read" / "none tracked (5)";
  - Design: "1 of 5 reached · 6 sprints · 2 merged, 4 not read" / "2 tracked · 4 not tracked";
  - Discovery: "4 of 4 reached · 7 sprints · 7 merged" / "4 tracked · 4 not tracked".
  - Before, these read "0 of 5, not recorded yet", "0 of 5 recorded", "0 of 6 recorded" and "4 of 8 reached".
- These match the spec's examples (Build "3 of 5" over "none tracked (5)"; Discovery "4 of 4" over "4 tracked · 4 not tracked").
- **The sums are checked against the Timeline:** Design 26 = 4 + 14 + 1 + 7 with pulls read; Build 16 = 17 less m2-answering, which "also feeds" M2 and is counted once.
- **F1/F2 (laterLaunch):** Launch "0 of 2 reached · no sprints filed yet" / "1 tracked · 4 not tracked" (M3C planned in run 2, Launch-3 "not reached" in run 3). This is word for word mock q4's Launch line.
- **Alpha's Discovery (not recorded):** "no milestones tracked yet · no sprints filed yet" / "none tracked (8)".
- No "0 of <n>" for unused standard milestones anywhere.
- **Item 7:** the opened phases still list every standard milestone, and the why-not-written line is shown once.
- The standard checklist sits on its own labelled line, the set-apart mock q4 draws for G5. It is not overdone: no new colour, weight or box. G6's heads and rule are later.
- Pairs 01 and 02.

**AC92 (c), an opened phase's rows.**
- "work filed · 4 sprints · 4 merged" (MD2) and "work filed · 1 sprint · 1 merged" (MD1).
- On a gone-back-over run: "reached 18 Oct · gone back over · 2 sprints · 2 merged".
- Rows with no sprints are unchanged. Pair 03.

**AC92 (c), the Timeline's folds.** Items 2, 5, 32.
- "4 sprints" became "4 sprints · 4 not read", and "1 sprint" became "1 sprint · 1 merged" or "· none merged yet" (ext). The chevron icon follows, as "<sprints> ›".
- Type is unchanged: 500 11px `--ink2`.
- **Every fold against its ticks:** with every fold opened (timeline-pulls-open), each fold's merged count equals the "merged" ticks under it (4/4, 14/14, 1/1, 12/12, 2/2, 1/1, 2/2, 7/7, 38/38).
- Pair 04.

**AC92 (c), Details' CI line.**
- 3 runs, one running: "CI on main: running · 2 of 3 workflows passed, 1 running".
- One failing: "failing · 1 of 2 workflows passed".
- One run: "passing · 1 of 1 workflow passed".
- With none: "CI on main: none", with no part.
- Deploy and Orchestrator runs are left out of x. Type is 400 12px `--ink2`, unchanged. Pair 05.

**AC89 (c), the owner's ruling B.** Items 1, 3, 16, 19.
- Two items at one gate: "…the Launch gate for P-004 and P-005 ·".
- Cases: "…for P-004, cases 1 and 2".
- No case lines: "…for P-004, launch-1 and launch-2".
- Split by a kicked-back card: "…for P-005 and P-004" (row order, as the Definer's settling says).
- Ids are 400 11px Plex Mono, each one rect, kept whole.
- **Count and cut are unchanged:** "8 wait on you" over 7 names; the cut is 2 lines (clientHeight 34), with the fade.
- **At 414:** both items now show before the cut ("two", "kicked"), and "cases 1 and 2" shows at the fade. Before, "…for P-005" was past the cut. "launch-2" is still past it.
- **At 360:** every gates state reads the same as before up to the cut ("…the Launch gate for P-004" in the fade). See N1.
- Pair 06; crops/waits-rows.png.

**Item 3 (waiting is real), item 22 (badge).** Counts are unchanged ("8/6 wait on you", the badge).

**Items 10 and 25 (contrast).**
- Changed runs: at least 6.4:1 in light and 7.72:1 in dark.
- No run under 4.5:1 anywhere, before or after.

**Item 12 (width).** scrollWidth equals clientWidth in all 236 captures, md-extremes' long name included.

**Item 6 (every project).**
- service-desk, mix Alpha and md-extremes (Alpha, Epsilon) render with no errors, but see B1.
- poom (v2.5) is unchanged: "Not used by this project", and CI "none".

**Items 8, 23 and 27 (type roles, typeface, sizes).**
- Fonts loaded: Plex Sans 400/500/600 and Plex Mono 400.
- The changed runs use only 11/500 label, 12/500, 12/400 small, 13/500 row and 11/400 mono, all on v2's scale. The only CSS added is `.v2-sdl { display: block }`.

**Items 9, 11, 13, 14, 15, 21, 24.**
- No new text box, target, colour meaning, board change or motion.
- Folds keep `foldButton`, so refresh and keys are unchanged.

**Part B (26) against the mockup.**
- q4 matches in structure and type.
- The sprint words follow the spec's later form ("4 sprints · 4 not read", "7 sprints · 7 merged") rather than the mock's stand-ins ("4 sprints, merges not read", "7 of 7 sprints merged"). Spec over mock, by authority; not a finding.
- q5 is G6's, so not judged here.

BUILDER'S CHOICES, JUDGED
1. **"none tracked (n)" replacing both the tracked and the not-tracked parts:** acceptable.
   - It matches AC92 (c)'s own example ("Standard checklist: none tracked (5)") and mock q4's Build line.
   - But the spec's general sentence says "then its other parts", which read literally keeps "· 5 not tracked". See Q1.
2. **"1 of 1 workflow passed" (singular):** acceptable. It follows (c)'s singular rule for sprints, and the test list asks for "each line's words and singulars".
3. **"sprints not available" when no Timeline is built:** acceptable, as an unknown in words (item 5).
   - Only a throwing `feedView` reaches it (sandbox.js `feedOf`, catch). Its other not-ok cases are either the untracked section, or no runs, which gives "no sprints filed yet".
   - Not reached on screen; code only.
4. **A milestone fold counting only the sprints it opens:** acceptable. The fold's number equals the ticks it opens.
   - Sprints "named by its pull request, not yet in the plan" keep their own fold and words, but count in the phase's s.
   - So an opened phase's rows can sum below the phase line.
   - No fixture reaches a named fold. See Q2.
5. **The joined name still at the two-line cut on the gates fixture:** correct under ruling B, which keeps the cut ("the cut, order and count are unchanged"). See N1.

NON-BLOCKING FINDINGS
- **N1 (note; item 16; ruling B's "so both usually show").** At 360 px, on all four gates states, the row is identical before and after up to the cut. The joined gate name starts at the end of line 2 and its second item falls past the fade. At 414 it shows in 3 of 4 states. Evidence: crops/waits-rows.png.
- **P1 (pre-existing, not made worse; item 5).** `bandLookup` (sandbox.js:1205, unchanged by G5) finds a run's band by key only. On md-extremes Alpha the opened Build phase heads all three runs "planned", run 1 included, while its rows say "gone back over". It is the same at 87bac4d. 5c095d5's subject says it addresses this.
- The known `--soft` follow-up does not appear on any changed run.

OPEN QUESTIONS
- **Q1 (Definer):** AC92 (c) says, with k of 0, "none tracked (<n>)", "then its other parts". Its example drops "· <q> not tracked". Should the sentence say the not-tracked part is left out (choice 1)?
- **Q2 (Definer):** should a milestone's fold, and its opened row, also count the sprints "named by its pull request, not yet in the plan" drawn under it, since s counts them for the phase (choice 4)?
- **Q3 (Orchestrator):** the branch is now at 5c095d5. This verdict is on f5be3a8 as briefed. A fresh round on 5c095d5 should confirm B1 across the gates and mix states, which I checked only on md-extremes Alpha.

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE 87bac4d | AFTER G5 f5be3a8)
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/01-page-milestone-counts-360x740-light.png: the phase lines and the head, "8 of 15 reached".
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/02-launch-f1-f2-opened-414x896-dark.png: F1/F2. "0 of 5, not recorded yet" becomes "0 of 2 reached" and "1 tracked · 4 not tracked".
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/03-design-opened-rows-sprints-360x740-light.png: opened Design, "work filed · 4 sprints · 4 merged".
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/04-timeline-sprint-folds-360x740-light.png: Timeline folds, "4 sprints · 4 not read".
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/05-details-ci-workflows-414x896-light.png: "CI on main: running · 2 of 3 workflows passed, 1 running".
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/owner-pairs-final/06-waits-row-gate-named-once-414x896-light.png: "the Launch gate for P-004 and P-005", both before the cut. Its foot also shows B1 (Alpha's Build, "no sprints filed yet").

B1's evidence sheet: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g5-design/crops/B1-md-extremes-build-sprints-360x740-light.png
