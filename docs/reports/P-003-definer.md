I've written specs/S-007.md with only AC13 changed, as stop-12 ruled, and marked specs/S-006.md superseded. One thing to know first: S-006's status line said `draft`, not `frozen` as the brief expected, so I changed `draft` to `superseded`.

**1. What I changed**
- **New file, specs/S-007.md**, status `draft` (231 lines, the same as S-006). It differs from S-006 only on these lines:
  - **Line 1:** the id.
  - **Line 4:** the lineage now ends with S-006.
  - **Line 11:** the supersedes note, which quotes stop-12 and lists every changed line.
  - **Line 18:** the criteria heading now says the criteria are carried unchanged from S-006 except AC13, by stop-12.
  - **Line 45 (AC13):** the sample now holds **three** cards, and the check of each card's id, raise time and state moved into this sentence from old line 48.
  - **Line 46, case (a):** the raise time is now said to be later than the card's arrival on the main branch, as in J6's first worked example (arrival 2026-11-10 10:00, recorded 2026-11-11 09:00).
  - **Line 48:** now case (c), a card raised before the part of the log that is read. It is reported `not recorded`, shown at once, and neither figure reports it, as J6's awkward cases say.
  - **Lines 83, 97, 106, 116, 122, 145, 229, 230:** `S-006` → `S-007` in the join-test marks and the builder's brief.
- **specs/S-006.md, line 3:** only the status word changed, to `superseded`.

**2. Why**
- The stop-12 ruling was "criteria-wrong": fix AC13 only, say how many cards the sample holds so that the third case is one of them, say what case (a)'s raise time is later than, keep everything else, list every changed line, and do not grow the spec.
- In case (a) I wrote "**almost** a day later" rather than "a day later". J6's example has 23 hours, and an exact "a day" would contradict it. The case's outcome is the same either way.
- To keep the length unchanged, I folded the old "also checks" line into line 45 instead of adding a line.

**3. What I verified**
- A line count of S-007 gives 231, the same as S-006.
- A search for `S-00[67]` in S-007 finds S-007 on lines 1, 11, 83, 97, 106, 116, 122, 145, 229 and 230, and S-006 only on lines 4, 11 and 18. This matches the note's list.
- A search for the case markers finds (a), (b) and (c) on lines 46 to 48, and "three cards" on lines 11 and 45.
- I checked the rest of S-007 against S-006 by reading, not with a diff tool; nothing could be run in this pack. No git repository was available, so nothing was committed.

**4. What is undone**
- S-007 has not been frozen; that happens at the freeze gate after the Critic's plan review.
- Case (b) on line 47 still ends with "." while (a) ends with ";". I left it so as not to change a line the ruling did not ask for.
- No experiment registration: Design-3 is skipped.
- Pack housekeeping: specs/S-005.facts.tmp is still in specs/. I didn't touch it.

**5. What is needed outside my lane**
- The Critic's plan review of S-007, then the freeze gate.
- The owner's scenario card for the changed AC13.
- The Check author needs to revise the AC13/J6 test for the three-card sample. J6's test still covers case (b), as before.
- A commit to build/definer/P-003 with the trailers my role requires.

**6. Open questions**
- S-006 was marked `draft`, yet stop-12 ruled on it as if it had been frozen. Should the freeze record be checked to confirm that `superseded` is the right status, and that S-006's `frozen_at` should stay blank?
- The six open questions for the owner in the spec are carried over unchanged, and none blocks freeze.