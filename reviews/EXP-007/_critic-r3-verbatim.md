# EXP-007 registration — the Critic's round 3, verbatim

Read: experiments/EXP-007-widget-refresh.md at 4184785 (build/definer/p004-widget-exp, Draft 5),
with the test widget at 491baa7. Round 3 of at most 3 (D-044). Recorded by the orchestrator,
session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-05.

---

Verdict: PASS

Round 3 of 3 (D-044). I read Draft 5 at 4184785, my round 2, the Reviewer's checks at b2b1711, 9eeae80 and 491baa7, the question card, the handoff's record of the owner's answer, PROJECT.md lines 630–657, and at 491baa7 entry.js (the log, context and menu), fakes.mjs (the replay of branch reads), src/lib/github.js lines 270–379 and src/lib/scheduler.js lines 365–420 and 900–940. I ran nothing. No finding implicates an earlier check of mine (D-050).

## 1. My round 2 findings
- **1, 304s not saved: answered.** Method 6 now says "a 304 as a 304", and Method 8 says "served exactly as recorded". The Reviewer's p4 confirms it.
- **2, start copy and fallbacks: answered.** Method 8: "never replaced by the judge's own carried copy". A start copy it can't rebuild is `chain-not-reproducible` (the Reviewer's p8).
- **3, "not read": answered.** The Measure names the three `shape.read` values. Under Deciding threshold, `checking` fails, and `cant-read` with no exclusion fails.
- **4, independence: answered.** The limits are stated, and a glue.js fault makes the result not judged and sends the route straight to the owner. The gate case still owes the plain statement that the adapter is "cross-checked … only for projects with no pull requests" (Chief of Staff).
- **5, clock: answered.** "It matches only when all four fields match in one replay, at one clock time."
- **6, head reads: answered.** `end.heads` logs every read in order, failed reads included. The one remainder is item 5 below.
- **7, data route: answered** by the owner's ruling and Method 7.
- **8, `context`: answered.** Method 3 defines widget, app and other, and entry.js:379–381 logs `other` for a run that is neither the widget nor the app.

## 2. Pass mark
Kept. The three bullets under Deciding threshold match PROJECT.md:656 word for word, and the registration is frozen before any run. The note on "a correct summary every time" adds only failures, plus a "not judged" outcome that is never a pass and goes to the owner after one rerun. Nothing in it loosens the mark.

The note is a little stricter than the plan in two places: "every project … read `ok`" and "a counted later refresh whose `end` has an error". Both are fair readings of "shows a correct summary". The plan's "how much memory it used" can't be measured, which the registration discloses. The gate case must say it (Chief of Staff).

## 3. The owner's ruling
Method 7 keeps within option A: a second key in the keychain, on portfolio only, with Contents write and a 7-day expiry, deleted afterwards; nothing goes through Files; the data goes to a branch of the private portfolio repository, and the Reviewer fetches it into its session. The card's own risk, that the key could also change main, is restated at Method 7, line 123.

## 4. Registration against the code at 491baa7
The Measure matches the Reviewer's item 8 field for field: start, detail, end (its `heads` forms included), snapshot-dropped, sent and send-failed. Method 7's reads, writes and guard match the Reviewer's item 2 (send.js:60–131).

## Findings

1. **Non-blocking: the Reviewer's 5a remainder (its finding 3). It is not a defect in the registration's claims, and it cannot change a summary.** A branch read answered 200 with the same sha, after an earlier read in the same refresh, is logged as that sha (entry.js:192–194); the replay serves it from the clone with no exact flag, so it answers 304 (fakes.mjs:200). With the same sha, the 304 path (github.js:292–295) and the 200 path differ only in `out.head` being set, in `state` `unchanged` against `ok`, and in the branch ETag. On the 200 path, line 352 reads no tree, because `headSha === req.head`. The scheduler never tests for `unchanged`: it checks only `cant-read` (scheduler.js:382) and `partial` (:938). It moves the head only when `r.head.sha !== st.head` (:916), which is false on both paths. So the summary and the request count are the same either way. Method 8's "a recorded 200 is never turned into a 304" sits under "Everything else" (the saved answers), where it holds; the Measure already says "a 304 as the commit read before it". The one overbroad line is the Draft 5 note (line 8): "the replay serves exactly what was recorded", untrue for branch reads. No change is needed before freezing. Route: Definer (optional wording).

2. **Non-blocking: the log keeps only its last 2000 lines (entry.js:26, 66). The registration doesn't say so.** Sample says "Every refresh in the day is logged". At about three lines a refresh, one day can't come near 2000. A repeated run is safe only if "Delete test data" clears the log first, which it does (Method 7). It should be named, as the 20 MB snapshot bound is. Route: Definer.

3. **Non-blocking: the send guard is slightly looser than "each once" (the Reviewer's item 2, leftovers i and ii).** A blob request that fails is not counted, so the guard would allow it again (send.js:80, 125); it also allows one blob at both paths, or the two swapped (the `shas` set is unused, send.js:86, :91). Neither writes outside the test branch, and `sendTestData` stops at the first failure. Route: Definer (wording) or Builder (code). Neither is needed before freezing.

4. **Non-blocking: the ruling's record is not yet in decisions/.** The `rulings:` line cites "questions/P-004-test-data-route.md, option A", which is deleted once the answer is recorded. The owner's verbatim answer is recorded in the handoff, and the registration names the decisions/ path that follows, so the ruling exists. But the frozen file will cite a file that has gone. The freeze should come after the record lands, or the line should cite the decisions/ path. The "Before freezing" paragraph (lines 263–266) still waits on the Reviewer's check, which has now passed. Route: Orchestrator (timing of the freeze), Definer.

5. **Nothing misleads the owner, and nothing needs a ruling they haven't given.** The send key's reach over main (line 123), the deleted-branch fetch note (lines 136–139), the owner's time (runner) and the possible rerun are all stated. The Draft 5 change, a send that moves an existing branch on a resend, stays within A: it is the same test branch the first send made.

Gate-case debts carried forward (Chief of Staff): memory was not measured; the adapter's shared-fault limit and the "no pull requests" cross-check; the widget's src/lib count against the Home tile's `bd.counts`.
