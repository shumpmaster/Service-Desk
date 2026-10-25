# M3E stage G7: the Design reviewer's round 1 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g7 at 1382866 (G7's work over 93e06a4).

---

Verdict: PASS

**In plain English.** G7 is ready at 1382866.
- **What changes for you:** finished marks are now green, and failed or not-reached marks are red. That covers the round ticks and crosses on the Timeline, the project page's strip and opened phases, each Home tile's drawing, Plan's Reached list (which now has a tick before each name), the sprints' ✓ and ✕, and a ✓ or ✕ before every CI line.
- **What stays as it was:** all words. Not one word changed colour or text in any of my 392 captures. Gold still means only "next to reach". Vermilion is unchanged.
- **Other changes:** Plan's "moved" edge is now light grey instead of gold, and each can't-read line under Home's briefing gets a red ✕.
- **How it compares with the mockup:** it matches mock q1 in substance. It is stricter than q1 on one point, as the ruling asks: the ticks for "Nothing waiting on you" and "Nothing needs you" stay grey.
- **Two points for you to look at on the preview, neither a defect:**
  - In a run that was gone back over, the reached ticks stay faded grey (as ruled), but its not-reached crosses turn full red (pair 06).
  - The moved row on Plan is now marked only by a very faint grey edge. The word "moved" has only ever been spoken to screen readers, not shown.

Design review of G7, "S-001 after the glance audit": AC92 (a), with AC24, AC48, AC81 and AC88 changed, and AC91 (c)'s briefing ✕.
- **Compared:** 1382866 against 93e06a4, on build/builder/g7.
- **Judged against:** P-001-glance2-palette.md (A), P-001-glance-plan-gold.md (A), P-001-glance-plan-readings.md (A, reading (e)), the owner's request of 2026-10-24, and mock glance-emphasis changes2.js q1 with its r2-q1 shots.
- **Not seen:** the Builder's summary. I read the diff, the commit subjects and the spec.
- **Changed nothing:** trees were exported with `git archive` to tree-before/ and tree-after/.

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/:
- **before/ and after/:** 50 states × 360×740 and 414×896 × light and dark. Each capture has a full-page PNG and a JSON with:
  - every text run's size, weight, colour, ground and contrast;
  - every status mark's kind, token, size, opacity, ground and contrast as a graphic, plus the words of its line;
  - scroll width and page errors.
- **tool-after/:** the Builder's `glance-shots.mjs … g7-`, 48 captures with its mark counts (tool-after.log).
- **folds/:** the shared `<Phase>-i<n>` fold checks.
- **pairs/, mock/, owner-pairs-final/**
- **scripts/:** cap7.mjs, marks7.js, dump.js, diff7.py, ctx7.py, runs7.py, fy.py, side.py, conf7.mjs.
- **diff-all.txt:** every before/after difference.
- Fixtures are the tree's made-up states (NOT real records).

**Note: the worktree changed during my review.** At 07:42 to 07:43, someone else left uncommitted edits in /home/user/sd-g7: tests/desk/ac88-dark.test.mjs, ac92-glance-palette.test.mjs and fixtures/README.md, citing "the Reviewer's B1, G7 round 1". They were not mine; I write nothing in the repository. My verdict is on 1382866 as committed.

TESTS
- **Full suite** `node --test tests/desk/` on the exported 1382866 tree: 1246 of 1246 pass (full-suite-1382866-archive.txt). A run in the worktree also gave 1246 of 1246, but it may have picked up the edits above.
- src/lib/sandbox.js and src/public/lib/sandbox.js match.
- **My 392 captures and the tool's 48:**
  - no sideways scroll;
  - no page errors;
  - no text run under 4.5:1;
  - no green or red mark under 3:1;
  - no missed taps.

EVIDENCE BY CHECKLIST ITEM

**AC92 (a): what turned green or red** (diff-all.txt; ctx7.py and runs7.py output). Items 1, 2 and 26.
- **Green (--ok):**
  - the reached check (ring and tick) on the page's strip (Discovery, 16 px), opened-phase rows (16 px), Timeline milestones (16 px), the Timeline's "Status icons" key, Home tile drawings (14 px) and Plan's Reached list (14 px, new);
  - the sprint ✓ of merged, review, checks and source-checked: a span, 11 px at weight 600, with its word staying 400 `--ink2` (112 on J11's Timeline);
  - a CI line's ✓ (14 px).
- **Red (--bad):**
  - the not-reached cross (16 px);
  - the sprint ✕ (10 px, was `--ink2`);
  - a CI line's ✕ on Details, the pipeline view and a sheet's "What was checked";
  - the deploy mismatch ✕ (`.v2-safe.bad`);
  - the v2.5 page's CI row: before, a failing CI drew the dashed "?" (not recorded); it now draws the red cross (pairs/poom.png).
- **Briefing ✕ (AC91 (c)):** a 14 px ✕ in `--bad` before each can't-read line under the count, aligned with the clock line ("✕ Can't read Alpha since 10:01"; also "Can't show Alpha"). Where the first line is itself the can't-read line, its mark is the ✕ as built (brief-cant-show, brief-portfolio).
- **Stays grey, checked on screen:**
  - the lighter gone-back-over check (`pastcheck`, `--ink2` at 0.5, unchanged everywhere);
  - the "Nothing waiting on you" tick (page) and the "Nothing needs you" tick (`.v2-bi`, home-quiet), both `--ink`;
  - the portfolio's "nothing queued" tick and block marks (home-portfolio-empty and -card);
  - Plan's ideas (approved ✓ and stopped ✕ stay `--ink`);
  - the half circle, planned, unrecorded, skipped and no-model marks;
  - the Done lane's ✓ stays `--ok`, as before.
- **Words never change colour:**
  - across all 392 captures the only text-colour change is the ✓ glyph itself (#12733a and #4cc06a);
  - red words: 38 runs before and 38 after;
  - no word, fill, border or heading took `--ok` or `--bad`.
- **Plan's moved edge:** a pixel sample at the row's left edge reads #8a6a10 → #d6d6db (light) and #c9b04f → #34363c (dark). "moved" stays in the row's sb-vh text (sandbox.js:3738).

**Item 10/25 (contrast):**
- `--ok` measures 5.26 to 5.93:1 (light) and 6.85 to 8.21:1 (dark) on bg, card, bg2 and chip; `--bad` measures 6.07 to 6.85:1 and 5.77 to 6.91:1. Measured on screen: green 5.54 to 5.93:1, red 6.4 to 6.85:1 (light). This passes as text and as graphics.
- The 11 px ✓ glyph is text, at 5.93:1 and 8.21:1.

**Item 13 (colour never the only signal):**
- the check and cross differ in shape;
- each sprint ✓ and ✕ keeps its word;
- each CI mark sits before "passing" or "failing";
- the deploy ✕ sits before "Doesn't match a reviewed pull request";
- the briefing ✕ sits before "Can't read …".

**Items 14 and 29 (one meaning per colour):**
- no new token;
- mark tokens across all captures are only `--ink`, `--ink2`, `--you`, `--gold`, `--ok` and `--bad`;
- `--you`: 236 marks before and after, untouched;
- `--gold`: 80 marks before and after, and the moved edge has left gold, so gold means only "next to reach";
- green is never on an absence, and red is never on an agents' gap or on anything waiting.

**Item 12:** scroll width equals viewport width on every capture, Epsilon included.

**Item 6:**
- service-desk (text, quiet, standard, J11 3117150), md-extremes (Alpha, Epsilon), mix, gates and poom (v2.5: page, pipeline, CI passing and failing) all render without errors;
- the portfolio states (refused, empty, a card) too.

**G6's lesson, re-run (folds/conf.json):**
- the colour classes don't depend on run keys;
- I re-ran the shared-key fold taps at 1382866: mix Alpha Build (Build-i1 ×2), gates Launch (Launch-i1 ×3), the gates Timeline's gathered lines, and the sprint folds;
- each reads open 0/1/1/2 (start, tap, after two refreshes, last tap), the same as G6's confirmation;
- on those pages each run's rows keep their own marks: run 3's and run 1's Build crosses are red, run 1's reached ticks are lighter grey (runs7 output).

**Items 23, 24 and 27:**
- Plex Sans and Plex Mono are loaded;
- no transition or animation is added;
- sizes: marks 14 and 16 px, the ✓ glyph 11 px at weight 600, all within the scale.

**Items 3 to 5, 7 to 9, 11, 15 to 22 and 35:**
- no words, counts, targets, sheets or navigation changed;
- the text dumps differ only in clock drift ("checked N s ago", ages) and in the ✓ split into its own span;
- no key is added: the "Status icons" key already existed.

**Part B (26, 27) against q1:** it matches in substance, with these differences:
- q1 colours every `.v2-s.st-check` with `!important`. The build colours only the marks AC92 (a) names, so the absence ticks stay grey, as the ruling's "every absence stays grey" requires.
- q1 drew no mark on Plan's Reached list; the build adds one (below).

BUILDER'S CHOICES, JUDGED
1. **The Timeline's key coloured like the rail:** correct. A key must look like what it explains; a grey key beside green and red rails would misdescribe them.
2. **A ✓ or ✕ before every CI line, sheets included:** correct. AC92 (a) says "a CI line that reads passing", with no exception for sheets, and names the sheet's failing line. Running, none and not recorded get no mark (pairs/deploy.png: "CI on main's head: none" is unmarked). The v2.5 row's failing "?" replaced by ✕ is a right correction.
3. **Leaving uncoloured:**
   - **Plan's ideas:** correct. Approved and stopped are rulings on ideas, not reached or failed facts; a red "stopped" would read as a failure; AC92 (a) doesn't list them.
   - **Team's "just finished":** correct. It is an agent's state, not a recorded milestone; Team is untouched (`ic`).
   - **A matching deploy's ✓:** acceptable. AC92 (a) names only the mismatch; see Q2.
4. **The ✓ at weight 600:** correct. It is q1's `.mk-okm` weight, it is in the scale, and it keeps an 11 px glyph's green readable. The word stays 400.
5. **Plan's Reached list check (14 px, aria-hidden):** correct. AC86's note ("the Reached list's marks are green") needs a mark. 14 px suits the list's 12 px lines, and the fold head "Reached · 3" already says the state to a screen reader.

NON-BLOCKING FINDINGS
- **N1 (note; items 1 and 14, "shouldn't be overdone"):** in a run gone back over, not-reached crosses are full `--bad` while the same run's reached ticks are faded grey.
  - This is as ruled: the ruling greys only "a reached mark in a run later gone back over", and round 2's proposal (a) colours `.v2-s.st-cross` without exception.
  - Effect: mix Alpha with every phase open shows 8 red crosses, 6 of them in earlier or planned runs (owner pair 06).
- **N2 (note; items 10 and 13; ruled):** the moved edge is now 1.45:1 (light) and 1.58:1 (dark).
  - "moved" has only ever been accessible text (AC24), so a sighted owner now sees the moved row only by a barely visible edge.
  - This is exactly P-001-glance-plan-gold.md A and AC24's note, so it is not a finding. See Q1.
- **Pre-existing, not made worse:**
  - The lighter gone-back-over check measures 2.17:1 (light) and 2.76:1 (dark) as a graphic, the same before and after. It is lighter by ruling (note 2).
  - Home's group head "1 can't be read" is red with no ✕; it is outside G7's row.
- **N3 (note):** the sprint ✓ (11 px) and ✕ (10 px) are smaller than the ruling's "14–16 px mark" wording. AC92 (a), round 2's proposal (b) and q1 all name them, so this is not a finding.
- The known `--soft` follow-up is not touched.

OPEN QUESTIONS
- **Q1 (for the owner, through the Orchestrator):** P-001-glance-plan-gold.md A says "with its word 'moved' kept", but the word was never shown, only spoken. Is a light-grey edge alone enough to find the row you just moved? I ask; I don't pick.
- **Q2 (minor, for the Definer):** should a deploy that matches a passed pull request take a green ✓, as its mismatch takes red? AC92 (a) is silent on it; it is left grey as built.

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE 93e06a4 | AFTER G7 1382866)
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/01-page-reached-green-not-reached-red-360x740-light.png: Design run 1's red cross beside its lighter grey tick, and Discovery's four green ticks.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/02-timeline-sprint-marks-360x740-dark.png: the sprints' ✓ green and #77's "✕ checks" red, the words grey.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/03-home-briefing-cant-read-x-360x740-light.png: the briefing's "✕ Can't read Alpha since 10:01".
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/04-plan-moved-edge-grey-reached-checks-414x896-light.png: the moved edge goes from gold to light grey, and the Reached list gets green ticks.
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/05-sheet-ci-failing-x-360x740-dark.png: "✕ CI on main's head: failing" in a card's sheet (made up, NOT real).
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/06-gone-back-over-run-414x896-dark.png: N1, a gone-back-over run's grey ticks and red crosses.
