I've revised specs/S-005.md for the plan review's blocking finding and two of its three non-blocking ones. No criterion's meaning changed and nothing is committed yet. The join-up section follows the form as the review quotes it, because docs/design/JOIN_UP_REVIEW.md itself is not in my pack.

**1. What I changed** (only `specs/S-005.md`)
- **Join-up review (blocking finding 1), rewritten to the form:**
  - The heading is now `# Join-up review — Design, 2026-11-08`.
  - A `Screens checked:` line lists each of the five views with its file and the criteria that cover it.
  - The table columns are Check | Result | Fix, with the form's five rows in its order and words, including "Consistent type, spacing and codes".
  - Each difference is rated:
    - The board and notifications showing nothing while a read fails is **non-blocking**, filed under "One meaning per colour or status signal". It is carried into the Build gate's case as a risk (open question 5).
    - The type and spacing of the new mark and lines are not fixed by the criteria. This is **non-blocking**: the Builder uses the desk's existing styles and the design reviewer checks it (plan §4).
  - Added "Needed changes to the records: none" and a `## Sign-off` section.
  - The "form could not be checked" note is now one line naming the form file. Open question 7 is removed.
- **Citation (finding 2):** removed the `docs/PROJECT.md:540` cite. The card-file form `queue/<item>-<gate>-<n>.md` is now stated as inferred, from the answer-record pattern (`docs/PROJECT.md:85`), the notes pattern (plan §1) and the plan's "told apart by their gate word" (§7). J1 points to this, and there is a new known limit: the Builder states the form the existing code in src/lib/ parses.
- **tests/desk/ limit (finding 3):** it now says S-004 *is* in my pack, but the source S-004 gives for tests/desk/ is not.
- **Smaller edits:** the supersedes note is updated. The "count finding nothing" risk is cut to a pointer to AC13 and AC18, where the same text already is.

**2. Why**
The plan review failed the spec on the join-up form, and the stop-7 ruling says to use that form, cite only files I was given, and not grow the spec. The `docs/PROJECT.md:540` cite didn't support the claim, and no file in my pack states the card-file naming, so I said so plainly.

**3. What I verified** (file searches only; no commands run)
- No file named `*JOIN*` is in my pack, and decisions/ holds only P-003's records. So the form file and `decisions/questions/P-001-card-recommendation.md` really are absent here, though the review says the form file is readable.
- No file outside specs/ states the card-file naming rule.
- S-004 is 227 lines with the same budget (90 to 130 lines of code, 15 to 23 tests) and already had AC18 and AC19. So S-005 did not grow against S-004; it is now about 233 lines, the extra being the sign-off and the needed-changes line the form requires.
- After the edits there are no remaining matches for "open question 7", "PROJECT.md:540" or the old "Where" column.

**4. What is undone**
- **Finding 3, ruling record:** the spec still says `decisions/questions/P-001-card-recommendation.md` is not in my pack. It isn't, so I can't quote it directly.
- **Finding 4, AC19:** kept, not cut. My role requires criteria for how the product takes feedback and reviews its own value after graduation, and AC19 is that criterion. It is one bullet and was already in S-004.
- **Sign-off:** it names no decision record, because the Build gate's record does not exist yet.
- The spec is not frozen.

**5. Needed outside my lane**
- **Critic:** check the section against docs/design/JOIN_UP_REVIEW.md itself, including the exact layout of the Sign-off section, which I only know from the review's summary.
- **Orchestrator:** either add the form file and the P-001 ruling record to the definer's pack, or confirm the Critic's pack is the one that holds them.
- **Builder, at build:** confirm the card-file form and tests/desk/.

**6. Open questions**
- The form's top-level `#` heading appears partway through the spec. If any check parses the spec's sections by heading level, does that break it?
- The review says the Critic is the one who adds this section, but stop-7 told the definer to write it. Should the Critic treat my version as a draft to accept, or replace it?