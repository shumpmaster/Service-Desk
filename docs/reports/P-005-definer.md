I've revised `specs/S-011.md` to answer all six findings in the plan review. It isn't committed, because this folder is not a git repository. Two things I couldn't settle from here: the experiment registrations are not in my pack, so they still point at S-010, and three questions now go to the owner.

## 1. What I changed (`specs/S-011.md` only)
- **Header:** added a "Revision 2" note listing each change against its finding. The coverage paragraph no longer says the criteria can be checked from the registrations.
- **Finding 1 (AC23 vs J5):**
  - J5 now counts a run as successful **per project**: it read that project and sent all of that project's notices. The run's overall result on GitHub doesn't decide it.
  - Each project's window starts at the last run that read that project. A project a run couldn't read is carried whole into the next run that reads it.
  - Each run writes one line per project to its run log saying whether it read that project.
  - The fallback window applies only when no earlier read of the project is found. The "missed stretch" wording now applies only to that case.
  - A run that stops between sending and logging will send again; a repeat is preferred to a miss.
  - AC23 now names both exceptions; outside them, a due step that is still waiting is always notified.
  - AC41 now lists repeats separately from misses, and its test covers both. The J5 test lists the run logs it uses.
- **Finding 2 (AC17):** 360 and 414 px are now the definer's proposal, for the owner to set (open question 1). The citation to a review outside the pack is gone.
- **Finding 3 (registrations):**
  - AC40 now rests on V7's rule from the plan (line 135), not on a section of E1.
  - AC46 and J11 name E2's result file, `docs/handover/experiments/P-005-E2-result.md`, as the plan review reports it.
  - The line "Both are registered in this revision" is replaced: both still name S-010.
  - Known limits now say what comes from the plan review rather than from the files themselves.
- **Finding 4 (AC20 vs J4):** the screens not yet replaced now list deploys awaiting the owner's review, taken from the same list, and AC20's test includes one. J4, the join-up table and "Areas touched" say this falls inside `src/lib/**` and `src/public/**`.
- **Finding 5 (M8):** a note under "What needs the owner" now spells out how this spec reads M8 and four ways it is deliberately narrower: no promised minutes, misses before the fallback window counted rather than prevented, the normal level if Time Sensitive isn't available, and no cap on notices. It also says the spec tests that a notice was sent, not that it arrived. This goes to the owner as open question 2, and the risks list points to it.
- **Finding 6:** I re-read every `docs/PROJECT.md` line the spec cites (Known limits now lists them). The join-up note now says the Critic's review that closes Design closes the open rows (`JOIN_UP_REVIEW.md:3-6`).
- "Open questions" changed from "None" to three questions.

## 2. Why
The review failed the spec (FAIL). The worst problem was finding 1: AC23 promised something J5 couldn't deliver, so a locked check built from it would be wrong. Every other change answers one of the other findings. No acceptance criterion was added or dropped, and their numbers are unchanged.

## 3. What I verified
- `grep` for the stale phrases (`"The rule"`, `"Result"`, `reviews/S-010`, "in this revision and", "registrations are in this pack", "last successful run"): none left.
- A script matched each criterion's number to its trace label: 36 criteria (AC1–26 and AC37–46), no mismatches. The header still reads `milestones: M6, M7, M8`.
- I read the cited `docs/PROJECT.md` lines with `sed`. Each one supports what the spec cites it for, including 115 (green and red), 116 (published order) and 588 (the sender runs the card-making code).
- I read plan lines 22, 40, 42, 44, 72–74, 108, 126–136, 141, 158–159, 171 and 180–186. Line 135 is V7's measuring rule.
- Neither library width fact, nor any other in-pack record I searched, gives a phone width, so the figures can only be a proposal.

## 4. What is undone
- Not committed: there is no git repository here, so there is no `build/definer/<task>` branch.
- The registrations still name S-010, and I didn't touch them: they are in my write lane but not in my pack, and I wasn't going to rewrite files I can't read.
- The join-up rows stay open until the mockups and E2's result exist.

## 5. Needed outside my lane
- A definer session that has both `experiments/P-005-E1.md` and `experiments/P-005-E2.md` in its pack, to re-point them to S-011 and check their section names. The Chief of Staff routes this.
- A commit of this revision to the definer branch by whoever handles that, then a fresh plan review by the Critic.

## 6. Open questions (for the owner, through the channel)
1. **Phone widths for AC17:** which widths must the timeline fit with no sideways scrolling? I propose 360 and 414 CSS px.
2. **M8:** is the stated reading of "each single thing that needs them reaches their phone" enough for M8, or should the spec be revised?
3. **Registrations:** confirm they should be re-pointed to S-011, and that the Chief of Staff routes the session that does it.