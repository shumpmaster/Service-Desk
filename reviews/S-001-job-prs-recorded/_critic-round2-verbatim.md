# Critic, round 2, on S-001 amendment draft 2 (733e866) (verbatim)

Verdict: PASS with notes

For the owner: Draft 2 fixes everything I raised last round, and the owner paragraph (spec lines 1146–1161) is now honest about the cost. You don't need to be asked again. In the session you were told "About 5–8 more GitHub reads per such PR, a few a day". The design now makes about 5 to 10 reads that count against your GitHub limit, for each such pull request, a few a day. On top of that it sends a few quick "has anything changed?" questions each minute, which GitHub's documentation says are free. If they turned out not to be free, they would still use only a small share of your hourly GitHub limit (about 240 of 5,000 an hour while one sits open). The desk stays well under its free-plan margin: 6,689 calls on the worst day, against 10,000. What you chose still holds: these pull requests show as "Being recorded by the automatic job" and don't count. They do count briefly each time you open the desk, and the desk can show one as waiting before your phone does, but never long after. Three small wording fixes remain (S, plus two lines that still say the old thing), then it can land.

I compared the spec at 733e866 with the ruling record, whose line 1 matches the spec's quotes at 1164–1166 and 5521–5524 word for word, with what the owner was asked in the session (record lines 5–11), and with asks_merge.py `run` (lines 611–616: the `NOTE: the asks-merge grant is <id>` line is printed at the start of every judging run). I did not use the plan review file. The Definer's own summary came in your message. My role card bars me from seeing it, so I checked each claim against the spec text instead of relying on it.

**Round 1 findings**
- **A. Answered.** On the page, the grant now needs both the ledger's form check and the job's own grant line (5530–5545). `findGrant` stays in the sender (7230–7231). Being stricter than the sender only ever makes the page count, never hide a wait.
- **B. Answered.**
  - The reads are staged: conditional reads inside the poll call, then a blob call only when something changed (5563–5584).
  - The judgment inputs are spelled out, and a read that is pending or failed counts (5553–5555).
  - The log comes back through one function form, run → merge job → log (5585–5595).
- **C. Answered.** The total adds up: 5,500 + 288 + 60 + 215 + 576 + 50 = 6,689 (8854–8860). It uses AC14's five-project convention. A pull request that stays open costs no call while nothing changes.
- **D. Answered.** AC77's test now says "not counted (AC79), counted again once the job leaves it" (5286–5287).
- **E. Answered.** `seenMs` is the pull request's `created_at`, which is never later than when the sender first sees the head (5548–5550). The test now asserts that the page counts whenever the sender has left the pull request, not that the two agree (5623–5624).
- **F. Answered.** The safe-side counts are listed (5556–5562) and told to the owner (1152–1154). AC79's reads never touch "read successfully" (5569–5570).
- **G. Answered, with the wording notes in S.** The difference from the question is not big enough to ask again: the counted reads stay a few a day, and the desk's free-plan margin holds. My D-050 flag from round 1 still stands for whoever checked the question as filed. The record shows the same "5–8, a few a day" wording was put to the owner in the session.
- **H. Answered.**
  - The log lines keep their order, the scan stops at 1 MB, and the redirect is followed with no token (5589–5592).
  - J6 names the new fields, and a malformed part answers `null` (6299–6305).
  - J6 is in step 7's test list (9763).
- **I. Answered.** The known limit for private repositories is stated (5610–5614).
- **J. Answered.** The row opens only its GitHub link (5601–5604). It is not "Waiting on you" and not one of the owner's tile's lines (2209–2212), and the verdict box does not open from it (2868–2869). But see N.
- **K. Answered** (4753–4756, 4808–4811).
- **L. Answered.** Brief step 7 (9755–9763) and Areas touched (8086–8094) now name src/functions/, the src/public/lib copies, `PAGE_LIB` and CS23 (8341–8346).
- **M. Answered.** The record is readable at d8026fa, line 1 matches, and the stale sentence about the branch is gone.

**New notes (non-blocking; all routed to the Definer, spec stage)**
- **N.** AC52's test (2821–2822) still checks "that each pull request in Merges offers the owner's verdict box". AC52 (2709–2710) now puts the "Being recorded" rows in Merges, and AC53 and AC79 say no verdict box opens from them. The line should say "each counted pull request".
- **O.** AC79 and A3 count the "at most 2 blob calls per head" differently. AC79 (5582–5584) counts the first log plus one more if that run judged nothing. A3 (8848–8849) counts the head time and the log. The spec should say whether a separate head-time call is one of the 2. If a head needs 3, it counts, so the sum holds either way.
- **P.** J1 still says "a steady poll is exactly four requests" (5748). The note at 5725–5728 adds up to 16 more conditional requests. J6's poll response form (6329–6337) also names no field for the `jobs` answers.
- **Q.** No test names J6's new refusal-free cases: a malformed `jobs` part, a sixth head, a run id that isn't digits, and a sixth `jobLog` entry. J6's test says only "covers it" (6428). AC79's test covers the log form only.
- **R.** Two assumptions the Definer did not flag:
  - **Skipped runs.** The rule that a skipped or cancelled run needs no read (5575–5576) assumes a run whose only job was skipped by asks-merge.yml:37 reports the conclusion `skipped`. If GitHub reports something else, those runs use up the 5 log reads per call, and real candidates end up counted. That is the safe side, but it would happen often.
  - **CPU on the 1 MB scan.** Scanning up to 1 MB inside the Worker sits close to the Free plan's CPU limit, and an overrun is AC14's Error 1102. A smaller cap, like the compare answer's 65,536 characters, would remove the risk; the real log is under 1 KB.

  The 304 claim (8753–8755) cites GitHub's documentation, marked C, with no library fact; the Definer lists it as untested.
- **S.** Owner paragraph wording (1152–1160):
  - "That matches the question's 'about 5 to 8'" overstates the match, since the top is now 10. It should say "a little more at most".
  - "asks GitHub about four times a minute" reads as every 15 seconds. It means four questions once a minute.
  - The "free" claim rests on an untested assumption. One clause saying it would still be small if GitHub counted those questions would keep the paragraph honest.
  - "A new one counts for a minute or two, each time you open the desk" mixes two cases: a new pull request, and every such pull request at each opening.
  - The opening sentence about draft 1 is process talk the owner doesn't need, though it does no harm.

No new contradictions with Terms, AC2 (1464–1466), AC49, AC53, AC73, AC77, J16 or "Quiet" beyond N and P.
