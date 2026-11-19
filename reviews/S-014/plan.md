# S-014 — plan review: the latest round

*Recorded by the Chief of Staff as `orchestrator`. This file holds the latest plan-review round only, as reviews/S-009/plan.md does, since the freeze gate reads its verdict; the earlier rounds are in reviews/S-014/_plan-rounds-1-3.md, verbatim. The reviews were run when the spec was numbered S-013 (specs/S-014.md:3, :11); the Critics' words still say S-013.*

## Round 4 — brief critic-5, 2026-11-18, the lines changed under the owner's answer B only, against specs/S-014.md at build/definer/S-014 9014417d

*Under the owner's criteria answer B (decisions/questions/P-003-S-014-criteria.md, "B: close points first (Recommended)"), a fresh Definer (definer-5) closed round 3's N1 to N3 without changing a criterion. This round is that answer's check of only those lines (11, 164, 173, 290 and 302), not a fourth plan review. The orchestrator confirmed mechanically that every other line is byte-identical to the spec at 38439671, and gave the Critic the before and after texts and both diffs as files. Recorded by the Chief of Staff (session_01QBwHGMaiXA5EjfDYaJQd9q); the return is copied unchanged below.*

Verdict: PASS

All three points are closed and no criterion changed. Every cited fact I checked holds. Two small citation slips are listed under non-blocking findings. Line numbers below are those of /tmp/claude-0/-home-user/d52842f0-260e-5a7f-ba91-f10465fa684b/scratchpad/S-014-after.md, which is the same text as /home/user/sd-definer-S014/specs/S-014.md.

### 1. N1, line 290
- **Its own clause: yes.** "with a case set written for that" now covers only the `sender` later-run rule. The `desk` rule comes after it in a separate clause, "and, for a reason of its own, every no-failure `desk` case must hold at least two open cards that are not decision cards". Its reason is its own: no compared summary counts one, "and line 164's comparison of `words` stays exact".
- **Kept under option B: yes.** Option B now ends: "the `desk` rule of two open cards that are not decision cards stays under B too, because line 164's comparison is unchanged under either option."
- **Nothing else changed.** Option A, its recommendation and its reason are word for word as before. B's own text ("keep rule (b) and the `sender` rule in S-009's form ... drop the others ...") is unchanged. The only addition to B is the clarification the owner's ruling asked for (decisions/questions/P-003-S-014-criteria.md:18).

### 2. N2, line 173
- **Zero now counts 0: yes.** The new sentence says a summary whose body is "Notifications are on: nothing waits on you now" writes no digit, and "its count here is 0". So the count difference is defined when the card left out was the only open card.
- **The cited facts hold.**
  - words.mjs:46: `n === 0 ? 'nothing waits on you now'`. The full body is put together at :47 as "Notifications are on: ...".
  - sender.mjs:299-301: on a first run that reads its records and has nothing to send, the sender still sends `summaryWords(0, ...)`.
  - Line 148 keeps `DESK_BILLING_TOKEN` out, so no cost line with digits is added to the body.
- **No conflict with line 155.** Line 155 reads a count from the first number in digits. The new sentence only gives a value where line 155 gives none, and only for this one body.
- **No conflict with line 169.** Line 169's digits rule is a coverage rule on summaries and groups in the record. The count difference works on built-code `desk` results, and a zero summary in the record is already ruled out by line 169's non-empty-list rule for `sender` cases.

### 3. N3, line 164
- **The reason now rests on rule (a) and line 165: yes.** For failing `desk` cases, line 164 now says no summary is compared, because rule (a) of line 169 leaves the record's `notices` empty when `queue` or `log` fails, and line 165 compares a `notes`-failing case with the `log`-failing record result, which is also empty.
- **Both lines say that.**
  - Line 169's (a): each `desk` case with `queue` or `log` failing "has empty `notices`".
  - Line 165: the `notes`-failing built result is compared "with the record's result for the same records with `log` failing in the same form".
- **Comparison and conclusion unchanged.** The text up to "Since each no-failure `desk` case ..." is identical, and so are the conclusion ("no summary so compared counts one ...") and everything after it. The only edit is the reason clause, which replaces the no-failure-twin argument.

### 4. No criterion changed
- Line 164 changes only the reason it gives.
- Line 173 defines a value that was undefined. It adds no case-set rule and nothing a build must do: a correct build gives the same results.
- Line 290 changes no option's substance and no recommendation. B's clarification is the owner's prescribed fix (criteria record :18), and the owner chose A in any case.
- Line 302 is a file list, and line 11 is the change note.

### 5. Line 11's Round 4 list and line 302
- **The Round 4 list matches the diff.** The unified diff has four hunks, changing lines 11, 164, 173, 290 and 302. That is exactly what the list names, and its description of each line is true.
- **The first list is still true.** It describes line 164 as "why no summary so compared counts one", line 173 as "a card's count difference" and line 290 as "question 15 naming the case-set rules". All three still fit.
- **Line 302 is true.** reviews/S-014/plan.md holds rounds 1 to 3. Rounds 1, 2 and 3 are answered by line 11's Round 2, Round 3 and Round 4 lists. The criteria record is the owner's answer B.

### Blocking findings
None.

### Non-blocking findings
- **NB1. Line 308, the files list.** Line 173 now cites src/notify/words.mjs:46, but line 308's "cited at lines 155, 164, 169, 230, 242, 290" does not name 173. The file and its range (:19-48) are listed, so nothing is missing for a reader. Line 308 was not edited this round, so the list is now out of date.
- **NB2. Lines 173 and 169, the citation.** Both quote "Notifications are on: nothing waits on you now" and cite words.mjs:46 only. The words "Notifications are on:" are at :47. Citing :46-47 would be exact.

### Files you needed and did not have
None. I did not open tests/acceptance/S-009/** or tests/desk/notify-helpers.mjs, because no changed line's claim needed them.

Files read:
- /tmp/claude-0/-home-user/d52842f0-260e-5a7f-ba91-f10465fa684b/scratchpad/S-014-round4-unified.diff
- /tmp/claude-0/-home-user/d52842f0-260e-5a7f-ba91-f10465fa684b/scratchpad/S-014-after.md (lines 148-169, 298-316)
- /home/user/sd-definer-S014/reviews/S-014/plan.md (Round 3)
- /home/user/sd-definer-S014/decisions/questions/P-003-S-014-criteria.md
- /home/user/sd-definer-S014/src/notify/words.mjs
- /home/user/sd-definer-S014/src/notify/sender.mjs (lines 260-309)
