# Plan review (Reviewer), round 2, of the board amendment draft 2 (97e1d25) (verbatim)

Verdict: FAIL

For the owner:
- Most of what failed last round is fixed, and I checked each fix against the code:
  - **Verdicts:** the board offers a merge only after your verdict reads PASS, and asking for changes now gives "Open" with "You asked for changes".
  - **Hidden verdicts:** the two cases where it would have hidden a needed verdict (a changed dependency file, a deleted or renamed test) are now caught from the file names. When GitHub's own check can't say, the card opens the pull request instead of saying "no verdict needed".
  - **Gate details:** they are back on the card.
  - **Private project:** the desk no longer asks GitHub for the verdict check there.
- One thing still has to be fixed before building: the cost section disagrees with itself.
  - One part says a failed read is retried every minute until it works, with no end.
  - Another part caps that at 5 tries.
  - The cost test still says the board adds no calls at all.
  - Retried with no end, a read that keeps failing could push the daily total past the 10,000 safety line, the same trap an earlier review found and fixed in another part of the desk.
- Something you should know: in Service-Desk nearly every code change will show "Open" with "CI code changed · check the PR", not "Merge", unless your verdict is already on it. That is honest, but it is the usual case, not a rare one.

Findings (draft 2 of specs/S-001.md at 97e1d25)

A. Fixed: J22 (a)'s path-only flags and the tripwire.
- **The manifest mirror (9389-9393) matches the model:**
  - `is_manifest` matches by name at any depth when a pattern has no `/` (govlib.py:997-1002), and its defaults are at :975-977.
  - A `[dependencies]` or `[tests]` key in the file replaces the default key by key (govlib.py:1144-1162). The spec's "the model's default when absent" is right.
- **The deleted or renamed test rule (9394-9397) matches:**
  - The model diffs with `--no-renames` (review_check.py:158-162), so a rename's old name counts as deleted.
  - `test_flags` flags `new is None` as "test file deleted" (review_check.py:188-192).
  - The test globs are only glob-matched, never by name (govlib.py:994-995), and the spec mirrors that.
- **Rule 4 (9402-9409) closes my old A:** an `error` tripwire is never read as "no verdict" (owner_signal.py:204-218).
- **The new join test is real.** I ran `review_check.py pr <n> --base <base.sha>` in a scratch clone at each head:

  | PR | Risk class | Required reviews |
  |---|---|---|
  | #126 | R0 | none |
  | #128 | R1 | reviewer |
  | #130 | R3 | owner, reviewer |
  | #135 | R3 | owner, reviewer |

  These match what J22 would give.
- **Small wording fix:** the model flags any changed manifest, including one that is deleted, and both names of a renamed one (review_check.py:265, :284-285). "A changed dependency manifest" (9390) should say that.
- **Not a defect:** a test binary that can't be read as text is a contents-only flag (review_check.py:199-201 calls `_contents`). The known limit at 9440-9443 covers it.

B. Fixed: conflicting criteria.
- The precedence list (5269-5271) now names AC24, AC48, AC49, AC52, AC53, AC54, AC56, AC62, AC66, AC69, AC72, AC74, AC77 and AC79.
- "Answer it here instead" is kept (5334-5337), and AC77's re-read runs before every answer link (5388-5389).
- The brief (11838-11849) names each test file and line I cited, and says each case is "rewritten …, never dropped".

C. Fixed, but one hole remains (non-blocking, should fix).
- "The item wins" (5517-5520) covers an item that needs the owner again.
- But the new step "open, a pull request" counts as confirmed when "its head changes" (5477), and that PR keeps needing the owner the whole time.
- Reproducing case:
  1. A desk code PR shows "Open ↗" with the tripwire's words. That is now the common kind (rule 4).
  2. The owner marks it done and hasn't merged.
  3. The builder pushes. The mark is confirmed.
  4. The row sits in Done for 24 hours while the PR still waits, and nothing returns it.
- Either make a new head count as "needs the owner again" for this step, or drop "or its head changes".

D. Fixed. A mark is judged against its own step, and the last head's judgement is kept until J20 reads the new head (5481-5485).

E. Fixed. What counts as current is defined (5486-5489). The page confirms before it judges, and marks from earlier openings are judged by the same rule (5490-5494).

F. BLOCKING: the retry of a read a mark waits on, and its cost.
- **The wording conflicts:**
  - AC80 asks the read "at each poll until it answers" (5504-5507). A kicked-back card keeps its mark and still waits on its step (5513-5516, 5524-5525), so this has no end.
  - A3 says "for at most `KICK_BACK_MINUTES` per mark, so at most 5 calls per mark" (10869-10872).
  - AC14's test still asserts "the same call counts, no function call added for the board" (2034-2035).
- **The read that keeps failing:** a PR's files read that fails all day costs one blob call of its own each poll. That is up to 960 a project a day, or 4,800 over AC14's five projects: 7,577 + 4,800 = 12,377, over 10,000. A3 already counts J12 "failing all day" as an AC14 case (10848), so this belongs there too.
- **Other reads:** it can't starve the needed reads, which run first (scheduler.js:756-770). It can push J12 (5), AC77's closed read (3) and J21 (5) out of a cycle. A closed read that is due and not made is then counted as failed, and the hold stands (scheduler.js:857-864). That is safe, but it should be capped.
- **J1's 30 is not touched:** blob calls are separate calls. Each stays within 25, since pages 2 and 3 come from `spare` (api.js:162-169), and 27 with the key fetches.
- **"Goes first in the budget, its pages 2 and 3 included" can't be done from the page alone:**
  - The function hands out `spare` to whichever files read reaches page 2 first. Its tasks run six at a time (github.js:580-589, :677-694), so another large PR in the same call can take it.
  - Either the function must hand out spare in `files` order, or the waited read rides alone. Areas touched (9948-9951) names the function only for the owner-check part.
- **Fix:** one bound in all three places, for example "until it answers or `KICK_BACK_MINUTES` after the mark, whichever comes first". Add an AC14 worst-case line for it, and change AC14's test to assert that bound instead of "no call added".

G. Fixed. The v2.5 pull request deleting a question now confirms (5472). Both expected kick-backs are told to the owner (1452-1455, 5508-5512).

H. Fixed. The verdict's blob is read by the `sha` J20 lists; GitHub gives it (gh api pulls/126/files shows `sha` for reviews/126/owner.md). PASS, FAIL and "neither" each have their own step, and "Owner requested changes" never gives the merge (9368-9376, 5354).
- Cost detail A3 leaves out: the page's stored cache keeps only blobs that are in the tree (scheduler.js:415-427). So a branch-only verdict blob is read again at every opening, not "one blob per version" (10865).
- It can also take an extra blob call in the cycle of a verdict commit, because its `sha` is known only after J20 answers. Count both in F's recomputed total; AC14's 288 head changes bound it.

I. Fixed. `base.repo.private` is on every PR in J1's open list (gh api pulls?state=open shows `"private": false` for Service-Desk), and the page has the raw pages. The page gates on it, and a 403 is not asked again within an opening (9432-9435).
- Optional: like `jobsPart` (api.js:63), the function could answer `ownerChecks` with `null` for a non-v3 project, so it doesn't depend on the page alone.

J. Fixed. Domain-table, masked-flag, after-agents, PASS/FAIL/neither and two-page cases are in J22's test (9457-9463). Layout is split into CSS-rule checks plus a Chromium check (5592-5597). The `pr --base` command is named (9449-9453).
- Missing: a case for C's hole above, and one for F's bound.

K. Text.
- In 9377 "2." is indented 8 spaces against "1." at 4, and 5430 has the same problem; both will render as nested code.
- Areas touched (9949) still says "registered with J11's optional reads", while J22 (9421) says "outside J11's v3-only block".
- The lead (1430-1431) could say plainly that "Open" with the CI words will be the usual card for Service-Desk code changes.

Rechecked and holding:
- **A3 arithmetic:** 5,500 + 288 + 60 + 215 + 864 + 50 + 100 + 500 = 7,577. Draft 2 adds only F's retries and H's verdict blobs on top. The total is not recomputed; that is F.
- **J1:** a steady poll is 4 + 3 + 16 = 23, and the heaviest is 11 + 3 + 16 = 30 (7138-7142).

I edited nothing. The scratch clone I used for the `pr` runs was under the scratchpad and has been removed.
