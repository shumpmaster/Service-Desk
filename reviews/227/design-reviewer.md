Verdict: PASS

The Design reviewer's verdicts on G6 (PR #227), verbatim: round 1 at 1b81353 (PASS), then round 2 at 93e06a4 (PASS). Recorded by the orchestrator.

## Round 1
Verdict: PASS

**In plain English.** G6 at 1b81353 does what the owner asked ("visual segregate the standard milestones a little bit more"), and it isn't overdone. It matches the accepted mockup q5 in substance.
- **What it changes for the owner:**
  - In an opened phase, every run now has two labelled groups: "Your milestones · 3", then a thin rule and "Standard checklist · 6 · none tracked this run" (or "· 2 tracked").
  - The checklist items no run tracks fold into one line, "6 not tracked this run: 4 not recorded yet, 2 no record in the model". A tap, Enter or Space lists them in place, each with its own mark.
  - Your own milestone names are heavier (500) than the standard ones (400).
  - On the Timeline a standard milestone reads "Design-6 · standard · not reached", and the gathered lines read "Standard checklist · 4 not recorded for this run".
- **What it doesn't add:** no new colour, box, fill or size. The only new line is one hairline per run.
- I found nothing that blocks. Two notes on how the opened phase reads are below.

Design review of G6, "S-001 after the glance audit": AC92 (d), with AC83 and AC84 changed, against the ruling P-001-glance2-standard.md (A) and mock q5. Branch build/builder/g6 at 1b81353, compared with e400666.
- I did not see the Builder's summary. I read the diff and only commit subject lines.
- I changed nothing in the repository. Trees were exported with `git archive`.

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/:
- **before/, after/**: 23 states × 360×740 and 414×896 × light and dark, 92 captures a side. Each is a full-page PNG plus a JSON with every text run's size, weight, family, colour, ground and contrast, and a G6 probe (heads, rows, fold boxes, Timeline meta and gathered lines). The states:
  - Service-Desk `text` with Design, the Design fold opened in run 2 and in run 1, Launch, Build and Discovery;
  - `standardState`, every line written: Discovery, Design and Build;
  - `standardState`, Build-4 only: three states, fold closed and opened;
  - mix laterLaunch;
  - mix Alpha Build;
  - md-extremes Alpha Build and Discovery, and Epsilon Build;
  - poom;
  - Timelines: text, text with every gathered line opened, standard, mix and ext.
- **view-before/, view-after/**: viewport shots for the pairs.
- **kb/**: keyboard and refresh test (kb.json, focus-*.png).
- **tool-after/**: the Builder's tool, `glance-shots.mjs … g6-`, 24 captures.
- **crops/**, **mock/**: the q5 shots as PNG.
- **scripts/**: cap6.mjs, cap6v.mjs, probe6.js, dump.js, sum6.py, kb6.mjs, crop6.py and pairs6.py.
- Fixtures are the after tree's (made up, NOT real records).

TESTS
- Full suite `node --test tests/desk/` on the exported 1b81353 tree: 1231 of 1231 pass (full-suite-1b81353.txt).
- All 184 of my full-page captures, my 48 viewport captures and the tool's 24 show:
  - scrollWidth = clientWidth (no sideways scroll);
  - no page errors;
  - no text run under 4.5:1.
- src/lib and src/public/lib copies of projectpage.js and feed.js are identical.

EVIDENCE BY CHECKLIST ITEM

**AC92 (d), the heads.** Items 1, 2, 8 and 26.
- **Words, on every run, earlier ones included:**
  - "Your milestones · <n>" and "Standard checklist · <n> · <h> tracked" or "· none tracked this run" (projectpage.js:44-45; sandbox.js:1320).
  - Service-Desk Design: run 2 "· 3" / "· 6 · none tracked this run"; run 1 "· 0" / "· 6 · 2 tracked".
  - Discovery: "· 0" / "· 8 · 4 tracked".
  - Launch: "· 1" / "· 5 · none tracked this run". This is word for word mock q5's Launch.
- **Style:** `--t-label --ink`, 500 11px, #18191c light and #ecedef dark, with padding-top 10px.
- **The checklist head:** margin-top 8px and a `border-top` 1px `--line` (#e7e7ea light, #26282c dark) (sandbox.css:1017-1018). This is the same as q5's CSS.
- **h is per run**, and every head checks against its rows:
  - std Design run 2 "3 tracked" = Design-6, 4 and 1 "taken on";
  - run 1 "2 tracked" = Design-6 not reached and Design-1 reached;
  - three-states Build "none tracked this run" over skipped Build-4 and the fold.

**AC92 (d), the fold.** Items 1, 2, 5, 7, 11, 13, 15 and 30.
- **Words:**
  - "6 not tracked this run: 4 not recorded yet, 2 no record in the model";
  - with a part at 0 it is left out: "2 not tracked this run: 2 no record in the model" (md-extremes and mix Alpha).
- **Style:** `--t-small --ink2`, 400 12px, at 6.4:1 light and 7.72:1 dark. It has the dashed ring and a chevron (chevdown when open).
- **Control:** a real `<button>` with `aria-expanded` (sandbox.js:1305).
- **Opened:** the rows are listed in place with their own marks: "?" for not recorded yet, a slashed ring for no record in the model. Part B item 30's three states survive with skipped kept beside them (three-states fold).
- **Keyboard (kb.json):**
  - one Tab from the phase row reaches the fold;
  - Enter opens it (6 rows), Space closes it, Space opens it again;
  - the focus ring is 2px solid ink with a 2px offset, in both themes.
- **Refresh (item 15):** after two of the desk's refreshes (130 s, 13 calls) the fold is still open and the scroll is kept (576 → 576). Once closed, it stays closed. A full page reload clears every fold alike, as AC56 allows.
- **Size (item 11):**
  - 308×42 px at 360 and 362×42 at 414 on two lines; 32 px tall on one line (min-height 32, as q5);
  - that meets item 11's 24×24. See N3 on the brief's 44.
- **Item 7:** every standard milestone is still shown, either listed or one tap away in its run's fold. Skipped and not-needed ones stay listed with their why. The why-not-written line still shows once per phase.

**AC92 (d), the weights.** Items 8, 27.
- Own names in the latest run: 500 13px `--ink` (`.v2-sm.own`, :1024). Before they were 400.
- Standard names: 400 13px.
- Earlier runs stay smaller (note 2): own 500 12px and standard 400 12px (:1029).

**AC92 (d), the Timeline.** Items 2, 19, 32.
- **Meta lines:** "Design-6 · standard · not reached", "Design-1 · standard · reached · gone back over" and "Build-4 · standard · skipped" (sandbox.js:3090). Mono 400 11px, 6.4:1 and 7.72:1.
- **Names:** standard 400 13px (`.v2-ms.std`, :1140); own ones kept at 500 ("M3C").
- **Gathered lines:** "Standard checklist · 6 not recorded for this run" and "… · 5 still to come" (feed.js:589). 500 11px `--ink2`, 28 px tall as before.
- **Opened gathered lists:** unchanged, 29 items before and after.

**R3-b and the phase lines.** Items 2, 5.
- The closed phase lines are identical before and after in every state.
- A taken-on row outside h reads "taken on · not recorded by the model" (projectpage.js:418).

**Items 10, 25.** Every changed run:
- heads 17.58:1 light and 16.25:1 dark;
- fold, rows and meta at least 6.4:1 light and 7.72:1 dark.
- The rule is a drawing, not text.

**Item 12.** No sideways scroll anywhere, Epsilon's long name included. "Design-1 · standard · reached · gone back over" wraps one word at 360. That is inside the column, not past it.

**Item 6.**
- service-desk, mix, md-extremes Alpha and Epsilon render the heads and folds with no errors.
- poom (older pipeline) has no phase list, and it is unchanged.

**Items 13, 14, 23, 24, 35.**
- The fold has words, a chevron and `aria-expanded`.
- No new colour meaning, and nothing in vermilion.
- Plex Sans and Plex Mono are loaded.
- No motion.
- No key or legend.

**Items 3, 4, 9, 16 to 18, 20 to 22.** Nothing they cover is touched.

**Part B (26, 27) against q5.**
- The structure, words, 11px/500 ink heads with 10px top padding, the 8px + 1px `--line` rule, the fold row (16px ring, words and a 10px chevron, min-height 32, appended last) and "· standard" all match changes2.js q5 and its shots.
- Two differences, both by later authority, not findings:
  - the own rows' 500 weight is the ruling's "row weight";
  - the heads and fold on earlier runs are AC92 (d)'s "earlier runs included". q5 left run 1's gathered line as it was.

**"Set apart, not overdone"** (the owner's words; the ruling). It is done with labels, one hairline, a weight step and a fold:
- no box, fill, new colour or new size;
- the standard rows keep AC83's colours.
- The owner's complaint ("the lighter color just kind of gets skipped … confused on what's in or out") is answered by the words: "Your milestones · n", "Standard checklist · n · h tracked" and "not tracked this run". It does not rely on colour.

BUILDER'S CHOICES, JUDGED
1. **R3-b, "taken on · not recorded by the model":** acceptable.
   - It covers a recordable taken-on line in a run gone back over, such as Design-4 in run 1 of the made-up all-lines state.
   - Plan review R3 said either wording "reads honestly" and asked G6 to pick one. This one says why the row is left out of its head's "h tracked".
   - It matches the phase line's "taken on, not recorded by the model". In that run nothing was recorded, so the words are true.
2. **"Your milestones · 0" on runs with none:** correct. AC92 (d) asks for two heads on every run, and 0 is a count from the record, not an unknown. It also tells the owner plainly that the run held none of theirs, which is the "what's in or out" point. It costs one 25 px line. See N1.
3. **"Standard checklist · <n> still to come":** acceptable. The spec names only the "not recorded for this run" form. q5's rewrite (`/^(\d+) standard (\w+) milestones? · (.*)$/` → "Standard checklist · $1 $3") gives exactly this. The phase name dropped from the line is still in the band header ("Build · run 2").
4. **The fold replacing an earlier run's gathered line:** correct, by AC92 (d)'s "every run (earlier runs included)". The fold also says more than "Design-2 to Design-5 · not recorded, or no record in the model": its counts by state, and the three marks on a tap.
5. **The heads' 10 px top padding:** correct. It is q5's `padding-top:10px`, and the spec sets no figure.
6. **The fold row last, opened rows directly under it:** acceptable.
   - q5 appends the fold last (`ol.append`).
   - Content following its control is the disclosure pattern `aria-expanded` describes.
   - See N2.

NON-BLOCKING FINDINGS
- **N1 (note; item 8; how an opened phase reads).** The run head is now the lightest label in an opened phase:
  - "Run 1 · 5–8 Oct · gone back over" is 500 11px `--ink2`, unchanged;
  - the group heads under it are 500 11px `--ink`;
  - the only rule is inside each run, above its checklist.
  - So on an earlier run, the boundary between runs is the weakest divider, and "Run 1" reads close to run 2's fold.
  - The spec sets both styles, and q5 draws heads only on the latest run, so this is not a finding. It is a question for G9 or the Definer (Q1).
  - Evidence: view-after/v-design-run1-414x896-light.png; pair 03.
- **N2 (note; trial-view note 15, bottom up).** With an earlier run's fold opened, the untracked ids sit under the tracked ones. The ids no longer run in one bottom-up order (run 1: Design-6, Design-1, the fold, then Design-5 to 2). Each group is still bottom up, and this is q5's placement. Evidence: after/page-design-fold1-*.json.
- **N3 (note; item 11).**
  - The fold is 42 px tall (32 on one line), not 44. The pack's 44 applies to sheet and bubble closes (AC56). Other targets need 24, and the fold, at full row width, exceeds that.
  - The page's other folds are also under 44: phase rows, and Timeline sprint and gathered folds at 28 px.
  - If 44 is wanted for folds, that is a spec change for every fold.
- **Pre-existing, not made worse (item 7).**
  - On md-extremes Alpha, Discovery has no runs recorded. Opened, it shows only the why line: none of its 8 standard milestones is listed.
  - The closed line says "Standard checklist: none tracked (8)".
  - It is identical at e400666. Evidence: crops/alpha-disc-after.png.
- The known `--soft` follow-up does not appear on any changed run.

OPEN QUESTIONS
- **Q1 (Definer, for G9 or the owner):** should a run's head outrank its two group heads, now that the group heads are in `--ink` and the run head is in `--ink2` (N1)? I am not proposing a design.
- **Q2 (Definer):** AC92 (d) names only the "not recorded for this run" gathered line. Should the spec write in the "Standard checklist · <n> still to come" form G6 chose (choice 3)?

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE e400666 | AFTER G6 1b81353)
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/01-design-opened-two-groups-360x740-light.png: "Yours" and "The model's standard six" become "Your milestones · 3" and "Standard checklist · 6 · none tracked this run", with the rule and one folded line.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/02-untracked-fold-opened-360x740-dark.png: the fold opened, the six listed in place with their own marks.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/03-earlier-run-heads-and-fold-414x896-light.png: run 1's gathered line becomes two heads and the fold (also shows N1).
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/04-launch-as-mock-q5-360x740-light.png: Launch, as mock q5 drew it.
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/05-every-line-written-made-up-414x896-dark.png: made up, NOT real. Every line written: "3 tracked", skipped kept, "taken on · not recorded by the model".
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/06-timeline-standard-meta-360x740-light.png: the Timeline, "Design-6 · standard · not reached" in 400, and "Standard checklist · 4 not recorded for this run".

## Round 2
Verdict: PASS

**In plain English.** G6 is ready at 93e06a4.
- **What it gives the owner:** in an opened phase, each run's milestones now sit in two labelled groups, "Your milestones · 3" and, under a thin rule, "Standard checklist · 6 · none tracked this run".
  - The checklist items no run tracks fold into one line: "6 not tracked this run: 4 not recorded yet, 2 no record in the model". A tap lists them in place.
  - Your own milestone names are heavier than the standard ones.
  - On the Timeline, a standard milestone says "· standard ·", and the gathered lines read "Standard checklist · 4 not recorded for this run".
- **Not overdone:** it adds no new colour, box or size. It matches the accepted mockup q5 in substance.
- **Round 1's failure is fixed (B1, from the other reviewer).** Where two runs of a phase share a number, one tap used to open every such run's fold:
  - 2 at once on mix Alpha's Build; 3 on gates' Launch and on its Timeline's gathered lines.
  - Now only the tapped run opens, and a refresh keeps it so.
- **I passed round 1 without catching B1.** My captures opened only the first fold on a page, and I never tapped a fold on runs that share a number, even though G5's B1 came from those same runs. That is a miss on my side. The fold checks below now cover it.
- **Nothing else changed on screen.** The text, the computed styles and the probe readings in all 92 of my round-1 captures are identical at 93e06a4.

Design review of G6, "S-001 after the glance audit": AC92 (d), with AC83 and AC84 changed, against P-001-glance2-standard.md (A) and mock q5.
- **Round 1:** 1b81353, compared with e400666.
- **Round 2:** confirmation of the fix commits:
  - a234793 (page fold keyed by run);
  - 6eddd9e (Timeline gathered lines keyed by run);
  - a334674 (h narrowed);
  - f4770ee (sprint, untied and run-head keys);
  - df14078 and 93e06a4 (test keys);
  - with the Definer's settlings at ff48563.
- I did not see the Builder's summary; I read the diffs and commit subjects only.
- I changed nothing in the repository; trees were exported with `git archive` to tree-before/ (e400666), tree-after/ (1b81353) and tree-93/ (93e06a4).

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/:
- **before/, after/, confirm/**: 23 states × 360×740 and 414×896 × light and dark, at e400666, 1b81353 and 93e06a4. Each capture has a full-page PNG and a JSON with every text run's type, colour, ground and contrast, plus a G6 probe.
- **confirm/folds/** (93e06a4) and **confirm-r1/** (1b81353): the shared-key fold checks, conf.json and PNGs.
- **view-before/, view-after/, view-93/**: viewport shots for the pairs.
- **kb/**: keyboard and refresh checks.
- **tool-after/**: the Builder's `glance-shots.mjs … g6-`.
- **crops/** and **mock/** (q5 shots).
- **scripts/**: cap6.mjs, cap6v.mjs, conf6.mjs, kb6.mjs, probe6.js, dump.js, sum6.py, diff6.py, pairs6.py and pairs6r2.py.
- Fixtures are the tree's made-up states (NOT real records). glance-fixtures.mjs is unchanged between 1b81353 and 93e06a4.

TESTS
- Full suite `node --test tests/desk/`:
  - 1b81353: 1231 of 1231 (full-suite-1b81353.txt);
  - 93e06a4: 1235 of 1235 (full-suite-93e06a4.txt).
- In all of my captures and the tool's 24 (both rounds): no sideways scroll, no page errors, no text run under 4.5:1.
- src/lib and src/public/lib copies match.

ROUND 2: THE FIXES CONFIRMED (conf6.mjs at 360×740 light and 414×896 dark; tap the first fold, wait out two refreshes of 130 s, tap the last)

**B1 is closed (items 1, 15; AC92 (d), AC56).**
- **mix Alpha, Build opened:** the folds are Build-i1 run 3, Build-i2 run 2 and Build-i1 run 1.
  - 1b81353: a tap on run 3's fold opened run 1's too (2 open). A tap on run 1 then closed both.
  - 93e06a4: 1 open. It is still 1 after the refreshes. Tapping run 1 opens it beside it (2), with Build-i2 still folded.
- **gates, Launch opened:** three Launch-i1 runs, 4, 3 and 2.
  - 1b81353: one tap opened all 3.
  - 93e06a4: 1, then 1 after the refreshes, then runs 4 and 2 open with run 3 folded. Evidence: confirm/folds/gates-launch-360x740-light.png.
- **Timeline gathered lines, gates:** five "Standard checklist · 5 still to come" lines.
  - 1b81353: one tap opened 3.
  - 93e06a4: 1, kept after the refreshes; the last line ("· 4 not recorded for this run") opens alone.
- **Timeline sprint folds, gates and mix** (MD1, M2B, M2, M1): one tap opens one, kept after the refreshes, in both rounds.
  - No screen fixture has two sprint folds with one key.
  - f4770ee's run key (`foldKey`, feed.js:574 and :707; sandbox.js:3086, :3109 and :3280's `openSprintFolds`) is checked by code reading and by the new cases in ac92-glance-standard.test.mjs, which use mix's two "Build-i1" runs, each with an untied sprint.
- The fold carries `data-runk`, and its words and look are unchanged.

**h narrowed (a334674; projectpage.js `trackedInRun`).** A run's h now counts only "reached", "carried over" or "not reached" recorded on a line not marked skipped, plus recordable taken-on lines while the run is now or still to come. This is the Definer's settling at ff48563.
- **No head changed on screen.** In none of my 23 states does any "<h> tracked" differ from round 1: no screen fixture records "not needed", or a state on a skipped line.
- **Tested instead:** the change is covered by the new cases (h = [2, 2, 1, 1]; a one-run phase's head equals its line's k, on Service-Desk's real records at 77bfeae and on `standard`).

**Nothing else changed.**
- **Full-page captures:** diff6.py compares round 1 (after/) with confirm/ over all 92 captures: text, size, weight, colour, ground and the probe. 0 differ.
- **Viewport shots:** 22 of 24 are pixel-identical. The other 2 differ only in a 3 px strip at the top edge: the cut-off descender of a time string. Their text dumps are identical.
- **The heads' new keys** (`runh:…:run<k>`, `old:…:run<k>`) change nothing drawn.

**Definer's settlings (ff48563), taken as given:**
- R3-b as built;
- my Q2: both gathered-line forms written in;
- my Q1/N1: the run head kept, its weight left for G9's plan.

EVIDENCE BY CHECKLIST ITEM (round 1, holding unchanged at 93e06a4)

**AC92 (d), the heads.** Items 1, 2, 8 and 26.
- **Words:** "Your milestones · <n>" and "Standard checklist · <n> · <h> tracked" or "· none tracked this run", on every run (projectpage.js:44-45).
  - Service-Desk Design: run 2 "· 3" / "· 6 · none tracked this run"; run 1 "· 0" / "· 6 · 2 tracked".
  - Discovery: "· 0" / "· 8 · 4 tracked".
  - Launch: "· 1" / "· 5 · none tracked this run", word for word mock q5.
- **Style:**
  - The heads are `--t-label --ink`, 500 11px (#18191c light, #ecedef dark), with padding-top 10px.
  - The checklist head adds margin-top 8px and a 1px `--line` rule (#e7e7ea / #26282c) (sandbox.css:1017-1018). This is q5's CSS.

**AC92 (d), the fold.** Items 1, 2, 5, 7, 11, 13, 15 and 30.
- **Words:** "6 not tracked this run: 4 not recorded yet, 2 no record in the model"; a part at 0 is left out ("2 not tracked this run: 2 no record in the model").
- **Style:** `--t-small --ink2`, 400 12px, at 6.4:1 light and 7.72:1 dark. It has the dashed ring and a chevron, and is a real `<button>` with `aria-expanded`.
- **Opened:** the rows are listed in place, each with its own mark ("?" for not recorded yet, a slashed ring for no record), so part B item 30's three states survive. Skipped and not-needed rows stay listed with their why.
- **Keyboard:** one Tab from the phase row reaches it; Enter and Space toggle it; the focus ring is 2px with a 2px offset.
- **Refresh:** a refresh of the desk keeps it open, and the scroll is kept (kb.json).
- **Size:** 308 or 362 × 42 px (32 on one line), which meets item 11's 24.
- **Item 7:** every standard milestone is shown, either listed or in its run's fold, and the why-not-written line still shows once.

**Weights (items 8, 27).**
- Latest-run own names: 500 13px (were 400). Standard names: 400 13px.
- Earlier runs stay smaller (note 2): own 500 12px, standard 400 12px.

**Timeline (items 2, 19, 32).**
- Meta lines read "Design-6 · standard · not reached" (mono 400 11px, at 6.4:1 and 7.72:1).
- Standard names are 400 13px; own names stay 500.
- Gathered lines read "Standard checklist · <n> not recorded for this run" and "… · <n> still to come", in 500 11px `--ink2`. The opened lists are unchanged.

**Items 10 and 25:**
- heads 17.58:1 light and 16.25:1 dark;
- everything changed at least 6.4:1 and 7.72:1;
- no run anywhere under 4.5:1.

**Item 12:** no sideways scroll anywhere, Epsilon included.

**Item 6:**
- service-desk, mix, md-extremes Alpha and Epsilon, and gates render without errors.
- poom has no phase list and is unchanged.

**Items 13, 14, 23, 24 and 35:** no colour-only meaning, no new colour or vermilion, Plex Sans and Mono loaded, no motion, no legend.

**Items 3, 4, 9, 16 to 18 and 20 to 22:** nothing they cover is touched.

**Part B (26, 27) against q5.** It matches in structure, words, type and spacing.
- The own rows' 500 weight follows the ruling's "row weight".
- Heads and the fold on earlier runs follow AC92 (d)'s "earlier runs included".
- Neither is a finding.

**"Set apart, not overdone"** is done with labels, one hairline per run, a weight step and a fold. It answers the owner's "confused on what's in or out" in words, not colour.

BUILDER'S CHOICES, JUDGED
1. **R3-b, "taken on · not recorded by the model":** acceptable. The Definer settled it as built.
2. **"Your milestones · 0":** correct. AC92 (d) puts two heads on every run, and 0 is a recorded count.
3. **"Standard checklist · <n> still to come":** acceptable. It is q5's rewrite, and the Definer wrote it in.
4. **The fold replacing an earlier run's gathered line:** correct, by "earlier runs included". It also says more than the old line did.
5. **The heads' 10 px top padding:** correct; it is q5's figure.
6. **The fold row last, opened rows under it:** acceptable. It is q5's `append`, and it is the disclosure pattern. See N2.
7. **Round 2, folds keyed by the run's number:** correct. It is invisible except in the fix itself.

NON-BLOCKING FINDINGS
- **N1 (note; item 8):**
  - The run head (500 11px `--ink2`) is lighter than its group heads (`--ink`). On an earlier run, the boundary between runs is the weakest divider (view-93/v-design-run1-414x896-light.png; pair 03).
  - Settled for now by the Definer: kept as built; G9's plan takes the call.
- **N2 (note; trial-view note 15):** with an earlier run's fold opened, the untracked ids sit under the tracked ones, so they don't run in one bottom-up order. Each group is still bottom up, and this is q5's placement.
- **N3 (note; item 11):**
  - The fold is 42 px (32 on one line), not 44.
  - Item 11 asks 44 only of sheet and bubble closes (AC56), and the fold meets the 24 every other target needs.
  - The page's other folds are also under 44.
- **Pre-existing, not made worse (item 7):** on md-extremes Alpha, Discovery has no runs recorded. Opened, it shows only the why line and lists none of its 8 standard milestones. It is identical at e400666 (crops/alpha-disc-after.png).
- **The review's own miss (Measures):** round 1 did not test runs that share a key, so I passed what the other reviewer failed as B1. The check is now in scripts/conf6.mjs.
- The known `--soft` follow-up does not appear on any changed run.

OPEN QUESTIONS
- None. Round 1's Q1 and Q2 are settled at ff48563.

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE e400666 | AFTER G6 93e06a4)
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/01-design-opened-two-groups-360x740-light.png: "Yours" and "The model's standard six" become "Your milestones · 3" and "Standard checklist · 6 · none tracked this run", with the rule and one folded line.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/02-untracked-fold-opened-360x740-dark.png: the fold tapped open, the six listed in place with their own marks.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/03-earlier-run-heads-and-fold-414x896-light.png: run 1's "Design-2 to Design-5 · …" line becomes two heads and the fold.
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/04-launch-as-mock-q5-360x740-light.png: Launch, as mock q5 drew it.
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/05-every-line-written-made-up-414x896-dark.png: made up, NOT real, every line written. "3 tracked", skipped kept, "taken on · not recorded by the model".
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/owner-pairs-final/06-timeline-standard-meta-360x740-light.png: the Timeline, "Design-6 · standard · not reached" in 400, and "Standard checklist · 4 not recorded for this run".

B1's evidence: /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/confirm/folds/conf.json against /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/confirm-r1/conf.json, and /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g6-design/confirm/folds/gates-launch-360x740-light.png.
