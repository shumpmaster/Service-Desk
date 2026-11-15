I've revised S-012 to deal with all four blocking findings and the five non-blocking ones. It is still a draft and not frozen. I could not commit it: this folder is not a git repository, so the `build/definer/<task>` branch and the commit are still to do.

## 1. What I changed (specs/S-012.md only)
- **Revision note:** a new note under the header lists every change from this round.
- **Blocking 1, missing device log (AC41, J9, AC26):** I chose the cautious reading. In a week with no committed device log, nothing counts as shown, so a step not sent within 5 minutes is a miss with the cause "no device log for <week>". The count also lists the weeks with no log. An empty file still means "used, nothing shown", not a missing log. So a missing log can only add misses, never hide one.
  - J9 also logs `stopped`/`resumed` lines when the view shows or clears its "Stopped since" banner (AC15) or its "cannot be read just now" mark (AC16). Without them, AC41's separate count of steps not shown while the view said it had stopped had no record to read.
  - New test cases: an empty file, a missing week, two devices, and a `stopped` line with no `resumed` line.
- **Blocking 2, repeat causes (J5, AC41):** every log line now names its run. The "read" line names the run whose list of already-notified steps it used, or none when there was no earlier log. Each notice line now carries its project and `changed_at`, one line per step.
  - AC41 now says exactly which lines it joins, and gives each repeat's cause by rule: (a) no earlier log, (b) a run that stopped before logging, (c) two runs overlapping, or "unexplained".
- **Blocking 3, AC40 stated in full:** AC40 now spells out everything E1 states:
  - the end of each wait is the first commit on the main branch's first-parent line holding the record;
  - the decision card kinds are `dor-fail`, `stop` and `failure`;
  - S-009's rule for when a card first shows is written out;
  - gates are `dor`, `criteria` and `launch`;
  - "a pull request that needs the owner" is defined as in E1 line 26.

  The test gains cases for these.
- **Blocking 4, join-up review:** the table now gives the review's ratings. Rows 1, 2, 3 and 5 are blocking; row 4 is non-blocking and now sits in Risks.
- **Non-blocking:**
  - **Overlapping runs:** J5 now says one run at a time per project; for GitHub Actions that means a concurrency group with runs queued, not cancelled. If runs overlap anyway, AC23 and AC41 list the repeat under cause (c).
  - **AC17's unit:** 44 by 44 CSS pixels (WCAG 2.5.5), not points.
  - **New J12 for AC43:** the Chief of Staff commits a weekly value record to the portfolio repository. The desk reads it with its read key and works out no figure itself, so nothing is kept on Cloudflare.
  - **AC44 and AC45:** each now says why it has no join sheet of its own.
  - **Owner approval on M7:** the Areas touched now expect the owner's approval on the M7 pull request that changes the card-making code. It can go without that only if the Builder's reading of `src/` shows none of the changed files is one of the three files the notification sender runs that need the owner's approval.
- **AC41's due times:** AC41 now takes its steps and due times from AC40's count for the same window. Without this, AC41 had no stated source for which steps fell due.

## 2. Why
Each change answers a finding in `reviews/S-012/plan.md`. I left the remaining review notes alone: the AC37 note, which the review rated a risk only, and both open questions, which the spec already handled. I did not change any registration.

## 3. What I verified
- Read the review, both registrations, all the `decisions/P-005/` files, the two accessibility facts, S-009's rule, plan lines 100-190, and `docs/PROJECT.md` lines 196-216 and 584-632.
- Checked each new line reference against its file and corrected three as I went: `docs/design/JOIN_UP_REVIEW.md:2-6` and `:8-9`, and `docs/PROJECT.md:216`.
- Searched the spec to confirm every join-test label names S-012 (J1 to J10 and J12; J11 never had one) and that nothing still says "two exceptions".

There are no tests to run: the definer does not write tests.

## 4. What is undone
- The commit, as above.
- The join-up rows that need the mockups or E2's table stay open until those exist.

## 5. Needed outside my lane
- The Critic needs to re-review the spec.
- J12 needs the Chief of Staff to commit a weekly line for each of V7, V8 and V9.
- Design has to name the one-run-at-a-time setting for whichever alert route it picks.

## 6. Open questions (added to the spec's list for the owner)
- **Where the weekly value record lives (J12):** I proposed `value/P-005/checks.jsonl` in the portfolio repository, beside the device logs. The alternative is the desk's existing `intake/value-checks.jsonl`, but its format (S-001 J25) is not in this pack, so I didn't use it.
- **Missing device log counts as misses (AC41):** I chose this so a forgotten weekly commit can never hide a miss. The owner should see that choice at the scenario card.
- **When the desk lists each kind of step:** this isn't in the pack. If the desk lists a step later than AC40's start, the step only looks later than it was, so no miss is hidden. The Builder's reading of `src/` should confirm.