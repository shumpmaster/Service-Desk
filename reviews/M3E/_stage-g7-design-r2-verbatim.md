# M3E stage G7: the Design reviewer's round 2 (PASS), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g7 at 286ebae (fix commit 286ebae, on 1382866) (G7's work over 93e06a4).

---

Verdict: PASS

**In plain English.** G7 is ready at 286ebae.
- **What it gives the owner:** finished marks are now green, and failed or not-reached marks are red, on the small status mark only:
  - the round ticks and crosses on the Timeline, the project page's strip and opened phases, and each Home tile's drawing;
  - Plan's Reached list, which now has a tick before each name;
  - the sprints' ✓ and ✕;
  - a ✓ or ✕ before every CI line.
- **What stays as it was:** all words. Not one word changed colour or text. Gold still means only "next to reach", and vermilion is unchanged.
- **Other changes:** Plan's "moved" edge is now light grey instead of gold, and each can't-read line under Home's briefing gets a red ✕.
- **Against the mockup:** it matches mock q1 in substance. It is stricter than q1 where the ruling says so: the "Nothing waiting" and "Nothing needs you" ticks stay grey.
- **Round 2 changes only tests.** 286ebae, the Builder's fix for the Reviewer's B1, alters only test files. The screen is identical to round 1's.
- **Two points to look at on the preview, neither a defect:**
  - In a run that was gone back over, the reached ticks stay faded grey (as ruled), but its not-reached crosses turn full red (pair 06).
  - The moved row on Plan is now marked only by a very faint grey edge; the word "moved" has only ever been spoken to screen readers.

Design review of G7, "S-001 after the glance audit": AC92 (a), with AC24, AC48, AC81 and AC88 changed, and AC91 (c)'s briefing ✕.
- **Round 1:** 1382866, compared with 93e06a4.
- **Round 2:** confirmation of 286ebae ("G7's cascade check walks the portfolio's states and AC75's warning, and asserts the ink portfolio lines and Plan's ideas (G7's review, B1)").
- **Judged against:**
  - the rulings P-001-glance2-palette.md (A), P-001-glance-plan-gold.md (A) and P-001-glance-plan-readings.md (A, reading (e));
  - the owner's request of 2026-10-24;
  - mock glance-emphasis changes2.js q1 and its r2-q1 shots.
- **Not seen:** the Builder's summary. I read the diffs, the commit subjects and the spec.
- **Changed nothing:** trees were exported with `git archive` to tree-before/ (93e06a4), tree-after/ (1382866) and tree-286/ (286ebae).

All evidence is in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/:
- **before/ and after/:** 50 states × 360×740 and 414×896 × light and dark. Each capture has a full-page PNG and a JSON with:
  - every text run's size, weight, colour, ground and contrast;
  - every status mark's kind, token, size, opacity, ground, contrast as a graphic, and the words of its line;
  - scroll width and page errors.
- **confirm/:** round 2's re-captures at 286ebae.
- **tool-after/:** the Builder's `glance-shots.mjs … g7-`, 48 captures (tool-after.log).
- **folds/:** the shared `<Phase>-i<n>` fold checks.
- **pairs/, mock/, owner-pairs-final/**
- **scripts/:** cap7.mjs, marks7.js, dump.js, diff7.py, ctx7.py, runs7.py, fy.py, side.py, conf7.mjs.
- **diff-all.txt:** every before/after difference.
- Fixtures are the tree's made-up states (NOT real records).

ROUND 2: 286ebae CONFIRMED
- **No product file touched.** `git diff 1382866 286ebae` changes only tests/desk/ac88-dark.test.mjs, tests/desk/ac92-glance-palette.test.mjs and tests/desk/fixtures/README.md: 87 lines in, 8 out. The diff under `src/` is 0 lines, and `diff -r` of the two exported src/ trees finds them identical.
- **The screen is unchanged.** I re-captured 6 states at 286ebae × both sizes × both themes: 24 captures in confirm/. The states:
  - page-text-all;
  - tl-sd3-sprints;
  - brief-cant-cards;
  - plan-moved-reached;
  - sheet-pr-fail;
  - home-portfolio-card, B1's portfolio.

  Compared with round 1, with clock drift masked: 0 of 24 differ in text, size, weight, colour, family, or any mark's kind, token, opacity, size or contrast. There is no sideways scroll and there are no errors.
- **Tests:** the two changed test files at 286ebae pass 16 of 16 (r2-tests-286ebae.txt).
- **B1 on screen:** what the test now asserts already held in my round-1 captures. The portfolio's "nothing queued" tick, its block marks and Plan's ideas (approved ✓, stopped ✕) are `--ink` or `--ink2`, never `--ok` or `--bad` (home-portfolio-empty and -card, plan-ideas).

TESTS (round 1)
- **Full suite** `node --test tests/desk/` on the exported 1382866 tree: 1246 of 1246 pass (full-suite-1382866-archive.txt).
- src/lib/sandbox.js and src/public/lib/sandbox.js match.
- **My 392 captures and the tool's 48:**
  - no sideways scroll;
  - no page errors;
  - no text run under 4.5:1;
  - no green or red mark under 3:1;
  - no missed taps.

EVIDENCE BY CHECKLIST ITEM (round 1, unchanged at 286ebae)

**AC92 (a): what turned green or red.** Items 1, 2 and 26.
- **Green (--ok):**
  - the reached check (ring and tick) on the page's strip, opened-phase rows and Timeline milestones (16 px);
  - the same check on the Timeline's "Status icons" key and Home tile drawings (14 px);
  - Plan's Reached list (14 px, new);
  - the sprint ✓ of merged, review, checks and source-checked: a span, 11 px at weight 600, with its word staying 400 `--ink2`;
  - a CI line's ✓ (14 px).
- **Red (--bad):**
  - the not-reached cross (16 px);
  - the sprint ✕ (10 px, was `--ink2`);
  - a CI line's ✕ on Details, the pipeline view and a sheet's "What was checked";
  - the deploy mismatch ✕;
  - the v2.5 page's CI row, which drew the dashed "?" for a failing CI before and now draws the red cross.
- **Briefing ✕ (AC91 (c)):** a 14 px ✕ in `--bad` before each can't-read line under the count, aligned with the clock line. Where the first line is itself the can't-read line, its mark is the ✕ as built.
- **Stays grey:**
  - the lighter gone-back-over check;
  - the "Nothing waiting on you" and "Nothing needs you" ticks;
  - the portfolio's marks and Plan's ideas;
  - the half circle, planned, unrecorded, skipped and no-model marks.
  - The Done lane's ✓ stays `--ok` as before.
- **Words never change colour.** Across 392 captures the only text-colour change is the ✓ glyph itself (#12733a and #4cc06a). Red words number 38 before and 38 after. No fill, border or heading took `--ok` or `--bad`.
- **Plan's moved edge:** pixels read #8a6a10 → #d6d6db (light) and #c9b04f → #34363c (dark). "moved" stays in its accessible text (sandbox.js:3738).

**Items 10 and 25 (contrast):**
- `--ok` is 5.26 to 5.93:1 (light) and 6.85 to 8.21:1 (dark) on the four grounds; `--bad` is 6.07 to 6.85:1 and 5.77 to 6.91:1.
- The 11 px ✓ is text at 5.93:1 and 8.21:1.

**Item 13:** every coloured mark keeps its shape (tick against cross) and its word ("merged", "passing", "failing", "Doesn't match …", "Can't read …").

**Items 14 and 29:**
- No new token.
- Mark tokens are only `--ink`, `--ink2`, `--you`, `--gold`, `--ok` and `--bad`.
- `--you` marks: 236 before and after. `--gold` marks: 80 before and after, and the moved edge has left gold.

**Item 12:** no sideways scroll anywhere, Epsilon included.

**Item 6:** service-desk, md-extremes (Alpha, Epsilon), mix, gates, poom (v2.5) and the portfolio's states all render without errors.

**G6's lesson (folds/conf.json):** I re-ran the shared-key fold taps at 1382866: mix Alpha Build, gates Launch, the gates Timeline's gathered lines and the sprint folds. Each reads 0/1/1/2, as in G6's confirmation. Each run's rows keep their own marks.

**Items 23, 24 and 27:**
- Plex Sans and Plex Mono are loaded;
- no motion is added;
- marks are 14 and 16 px, and the ✓ glyph is 11 px at weight 600, all within the scale.

**Items 3 to 5, 7 to 9, 11, 15 to 22 and 35:** nothing they cover changed. The text dumps differ only in clock drift and in the ✓ split into its own span, and no key is added.

**Part B against q1:** it matches in substance. The build colours only the marks AC92 (a) names, so absence ticks stay grey where q1's `!important` rule would have coloured them. It adds a tick on Plan's Reached list, which q1 did not draw.

BUILDER'S CHOICES, JUDGED
1. **The Timeline's key coloured like the rail:** correct. A key must look like what it explains.
2. **A ✓ or ✕ before every CI line, sheets included:** correct, per AC92 (a). Running, none and not recorded stay unmarked. The v2.5 row's "?" → ✕ for a recorded failure is a right correction.
3. **Left uncoloured:**
   - **Plan's ideas:** correct. Approved and stopped are rulings on ideas, not reached or failed facts.
   - **Team's "just finished":** correct. It is an agent's state, and Team is untouched.
   - **A matching deploy's ✓:** acceptable. AC92 (a) names only the mismatch; the open question has gone to the Definer.
4. **The ✓ at weight 600:** correct. It is q1's weight and in the scale.
5. **Plan's Reached list check (14 px, aria-hidden):** correct. AC86's note needs a mark, and the fold head says "Reached" in words.
6. **Round 2, the cascade check widened:** correct, and test-only.

NON-BLOCKING FINDINGS
- **N1 (note; items 1 and 14, "shouldn't be overdone"):** in a run gone back over, not-reached crosses are full `--bad` while that run's reached ticks are faded grey.
  - This is as ruled: only "a reached mark in a run later gone back over" is greyed, and round 2's proposal (a) colours every cross.
  - Effect: mix Alpha with every phase open shows 8 red crosses, 6 of them in earlier or planned runs (pair 06).
- **N2 (note; ruled):** the moved edge is 1.45:1 (light) and 1.58:1 (dark), with "moved" spoken only. This is exactly P-001-glance-plan-gold.md A and AC24's note. The Orchestrator is putting it to the owner.
- **N3 (note):** the sprint ✓ (11 px) and ✕ (10 px) are smaller than the ruling's "14–16 px mark" wording. AC92 (a), round 2's proposal (b) and q1 all name them, so this is not a finding.
- **Pre-existing, not made worse:**
  - the lighter gone-back-over check is 2.17:1 (light) and 2.76:1 (dark) as a graphic, the same before and after;
  - Home's group head "1 can't be read" has no ✕, which is outside G7's row.
- The known `--soft` follow-up is not touched.

OPEN QUESTIONS
- None for this review. Round 1's Q1 (the moved edge alone, now a desk question to the owner) and Q2 (a matching deploy's ✓, with the Definer) are routed by the Orchestrator.

BEST BEFORE/AFTER PAIRS FOR THE OWNER (BEFORE 93e06a4 | AFTER G7 1382866; screen identical at 286ebae)
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/01-page-reached-green-not-reached-red-360x740-light.png: Design run 1's red cross beside its lighter grey tick, and Discovery's four green ticks.
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/02-timeline-sprint-marks-360x740-dark.png: the sprints' ✓ green and #77's "✕ checks" red, the words grey.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/03-home-briefing-cant-read-x-360x740-light.png: the briefing's "✕ Can't read Alpha since 10:01".
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/04-plan-moved-edge-grey-reached-checks-414x896-light.png: the moved edge goes from gold to light grey, and the Reached list gets green ticks.
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/05-sheet-ci-failing-x-360x740-dark.png: "✕ CI on main's head: failing" in a card's sheet (made up, NOT real).
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g7-design/owner-pairs-final/06-gone-back-over-run-414x896-dark.png: N1, a gone-back-over run's grey ticks and red crosses.
