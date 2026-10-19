# Plan review (Reviewer), round 3, of the board amendment draft 3 (9f82073) (verbatim)

Verdict: PASS with notes

For the owner:
- The last blocking problem is fixed. A read that keeps failing is now retried for at most 5 minutes after you mark a card, then only at the desk's usual pace.
- I recomputed the new worst-day total: 9,355 calls, under the 10,000 limit. The margin is about 645 calls, and that figure assumes you mark each card about once.
- The other fixes hold against the code:
  - A pull request you marked done comes back to "Waiting on you" if the agents push new work to it.
  - The desk's server now refuses the owner-check reads for your private operating-model project, so that no longer rests on the page alone.
- What's left is small and can be fixed before the build starts, which is on hold for the design audit anyway. The main one: the spec doesn't say what a card shows while the desk is still reading your verdict file, or what happens if that one read fails.

Findings (draft 3 of specs/S-001.md at 9f82073)

F. Fixed: the bound and the call it rides alone in.
- **One bound in three places:** AC80 (5526-5533), A3 (10920-10927) and AC14's test (2041-2048) all say "until it answers or `KICK_BACK_MINUTES` after the mark, whichever comes first", and none for a kicked-back card.
- **A solo call can carry pages 2 and 3, with no change to the function:**
  - The body `{ files: [n] }` gives a budget of 1, so `spare` = 25 − 1 = 24 (src/lib/api.js:162-169).
  - `readBlobs` then reads pages 2 and 3 from that spare (src/lib/github.js:683-692).
  - A files read that fails goes through `optionalFail`. Only a rate limit or a 401 stops the call (github.js:673-676, :689). So the call still answers `state: ok` with `files[n]: null`.
  - That is 3 GitHub requests, 5 with J8's key fetches. J1's 30 is not touched, because blob calls are invocations of their own.
- **After the bound, reads come only at the existing cadence:** that is J20's own retry wait, `FILES_RETRY_MS` (scheduler.js:316-319), inside calls already counted.
- **Note 1:** say whether the solo call counts inside `MAX_BLOB_CALLS_PER_CYCLE` = 6 (scheduler.js:20, :756, :772).
  - Inside the 6: during a cold load the waited read may not be made that poll.
  - Outside the 6: A3's "at most 6 blob calls per project per cycle" (A3's own line) needs a footnote.
- **Note 2 (cosmetic, but it moves a binding rule):** the waited-read rule at 5526 is indented 8 spaces, so it renders as a sub-bullet of "The reasons". The same glitch is at 5448 (the "Open ↗" why words) and 1569.

A3: 7,577 + 1,440 + 288 + 50 = 9,355. The arithmetic is right.
- **288 × 5 is a worst case over marks, not over heads (note 3):**
  - The bound is per mark. A re-mark from "Kicked back", or an Undo and mark again, starts a new 5 minutes (5535-5537).
  - A question's mark can wait on the J20 reads of several open pull requests (5493, "J20 for the open pull requests").
  - So 288 × 5 holds only on AC14's assumption of one mark per head. One re-mark per head would add 1,440 and reach 10,795.
  - Fix: either bound the waited reads per pull request head, at most 5 polls whoever waits on it, or label the 288 marks as AC14's assumption (E), not the worst case.
- **The 50 for opening re-reads holds as stated:**
  - The stored cache keeps only blobs that are in the tree (scheduler.js:415-427), so each opening reads verdict blobs again.
  - Their shas come only from J20's answer, so they need a later call in the same cycle. The optional loop carries on after a call that brought extras (scheduler.js:796).
  - With AC14's 3 to 5 open pull requests a project, every verdict blob fits in that one call's budget of 25. So 1 call a project an opening, 10 × 5 = 50.
- **Note 4, the verdict blob:**
  - **Retry rule:** an optional blob that fails is asked again at every cycle (scheduler.js:776-795). That breaks AC14's own "at most one verdict-blob call per verdict commit" (2046-2048) unless J22 says how a failed verdict-blob read is retried, for example at J20's 5-minute wait, inside the bound.
  - **Needed or optional:** J22 still says only "in the blob call" (9403). It should say optional. A failed blob sets `failure` for the whole call, which returns `cant-read` and skips every task not yet started (github.js:629-631, :787-791). As a needed read, one failing branch blob would fail the project's read; riding with other reads, it costs them their answers that cycle. Riding alone, like the waited read, avoids both.
  - **Card meanwhile:** say what the card shows while the verdict file is on the branch but its blob is unread or failed. Otherwise rule 2 can show "Verdict ↗" again just after the owner committed one, and GitHub's new-file page would then refuse, because the file exists.

C. Fixed.
- The step table no longer counts a new head as a confirmation (5499).
- A mark on an "Open ↗" pull request card leaves Done for "Waiting on you" with its new step on a new head (5545-5548), and the test covers it (5600-5602).
- Interaction checked: a FAIL verdict's "Open ↗" comes back with "You asked for changes", because the FAIL file is still in J20's list at the new head. That is right: review_check still fails it (review_check.py:339-340).

I. Fixed.
- The function answering `"ownerChecks": null` for a non-v3 project (7732-7734) follows the existing `jobs` pattern. `jobsPart` returns null unless the project is v3 (api.js:63), and `readJobs` answers null for it (github.js:357, :372).
- Personal-Org-Operating-Model is v2.5 (src/config/projects.json), so it is covered on the function side.
- The public-only check, `base.repo.private`, stays on the page. gh api shows that field on Service-Desk's pull requests (`false`). A future private v3 project would rely on the page alone; say so, or leave it as is.

My other round-2 items:
- **H:** the per-opening re-read and the extra call are now in A3. The retry rule, needed or optional, and the card meanwhile remain open; see note 4.
- **K:** the "2." indent in J22 and Areas touched (9947-9949, "outside J11's v3-only block") are fixed. The lead now says "Open" with the tripwire words is the usual card for a Service-Desk code change (1430-1436). The new indent glitches are in note 2.
- **Manifest wording:** fixed. It now says "adds, changes or deletes, both names of a renamed one" (9417-9419), matching review_check.py:265 and :284-285.
- **The open questions' defaults** (one board, the button kept) match the "Left unruled" lines and the `DEFAULT: A` of questions/P-001-board-scope.md and questions/P-001-board-done-button.md at 9f82073.

I edited nothing.
