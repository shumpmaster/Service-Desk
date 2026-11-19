# S-014 — the Reviewer's review of the rewritten locked checks (the adapter-stop ruling's third step)

*Recorded by the Chief of Staff (session_01QBwHGJoFFZQjbMT7zK1HWJ) as `orchestrator`. The owner's ruling, decisions/questions/P-003-S-009-adapter-stop.md (:19): "A fresh Critic reviews them, for up to three rounds, then a fresh Reviewer, then the owner's verdict". The Reviewer ran read-only in a fresh session, in a full checkout detached at build/check-author/S-014-r2 492a22c7, with a shell for runs and scratch output outside the repository. Each return is verbatim under its heading; the latest first.*

## Review 2 — brief reviewer-1 (the same Reviewer, re-reading), 2026-11-19, the fix for its N1 only, at build/check-author/S-014-r2 b5e06577 (on 492a22c7)

Verdict: PASS

The N1 fix in b5e06577 is correct. With the real sender, a question's item notice now reads as `question:<name>`, and cards, gate cards and pull requests read as before. The new j5 test matches line 57, and the suite and the governance checks give the expected results.

**Blocking findings:** none.

**Non-blocking findings:**
- **A bare question name also matches.** `names(info, 'N-open')` is true for the question as well as `question:N-open`, because `names()` compares `info.card === id` first. No list id takes that bare form (cards are `P-<n>-<gate>-<n>`, questions `question:<name>`), so it is harmless.
- **The fix touches nothing line 173 does not name.** b5e06577 is by check-author, with `Agent-Session: session_01QBwHGJoFFZQjbMT7zK1HWJ/check-author-1` and `Spec: S-014`. It changes only README.md, s009-lib.mjs (`readNotice` and the comment on `names`) and s009-j5-sender.test.mjs (+14 −3). No case file changed.
- My earlier N2 (the join marks) and N3 (any address ending `/` counts as Home) still stand.

**The new j5 test against line 57** (s009-j5-sender.test.mjs:61-66) runs lists `[[G], [G, Q], [G]]` with `Q = question:N-open` and expects `checkSenderCard` to return `[1]`. Each part of line 57 is covered:
- **Run 1:** the first run's summary must count every item on its list, here 1. The real body is "1 thing waits on you now", which reads as count 1, so the exact-count check passes on right output.
- **Run 2:** Q is the only item not on the run before's list, so an item notice must name Q. The real sender sends that item notice.
- **Runs 1 and 3:** Q is not on the list, so no item notice may name it. That check is no longer empty for questions, so a wrong notice would now fail.

The question is an item on the sender's list (line 151 lists `question` as a kind), so line 57's "card" wording covers it.

**What I ran:**

1. **Probe** (/tmp/claude-0/reviewer-scratch/probe2.mjs). It runs the real `runSender` through the tests/desk/notify-helpers.mjs `harness`, which decrypts each caught push with `decryptPush`. Each push became a notice `{words, opens}`, read with `senderInfos` and `names`. The six runs were: card; + question; question off; + gate card; + card; + pull request.

   | Run | What is new | Real `opens` | Read as |
   |---|---|---|---|
   | 1 | first run | `https://desk.example.invalid/` | summary, count 1 |
   | 2 | question | `…/?open=Service-Desk%7Cquestion%7Cquestions%2FN-open.md` | item, card `N-open`, `keyKind` question |
   | 3 | question off | no push | – |
   | 4 | gate card | `…%7Cgate%7Cqueue%2FP-952-criteria-1.md` | item, card `P-952-criteria-1` |
   | 5 | card | `…%7Ccard%7Cqueue%2FP-955-failure-1.md` | item, card `P-955-failure-1` |
   | 6 | pull request | `…%7Cpr%7C7` | item, card `7`, `keyKind` pr |

   Which runs `names()` is true for, by id:
   - `question:N-open`: run 2 only (it was false before the fix)
   - `P-952-criteria-1`: run 4 only
   - `P-955-failure-1`: run 5 only
   - `pr:7`: run 6 only
   - `P-951-stop-1`: none, since it was on the first run's list and so only counted in the summary

2. **`node --test tests/acceptance/S-009/*.test.mjs`:** 66 tests, 10 pass, 49 fail, 7 skipped, as expected. The 49 failures are:
   - 46 × "the adapter tests/desk/baseline/adapter.mjs is not there yet"
   - 1 × "baseline record not there yet"
   - 1 × "docs/handover/P-003/ does not exist yet"
   - 1 × the j7 parent test's "1 subtest failed"

3. **`governance/checks/check_all.sh . 0870a470`:** exit 0, "OK: all governance checks passed." The record_checks merges check passed (4 first-parent commits, 0 merges), so the known local finding did not appear.

Files are in /tmp/claude-0/reviewer-scratch/:
- probe2.mjs
- suite2.txt
- checkall2.txt

## Review 1 — brief reviewer-1, 2026-11-19, the rewrite at build/check-author/S-014-r2 492a22c7 (0870a470..492a22c7)

*Recorder's note: N1 was sent back to the Check author to close before the lock, since a locked check cannot be edited; the verdict line's bold marks are removed so that the desk's verdict parser reads it; its fix is checked by the Critic's round 3 and the Reviewer's re-read below it.*

Verdict: PASS

The rewritten checks pass on correct output from the unchanged sender, and I found no check that would pass on wrong output where it matters. Nothing blocks. There are three non-blocking findings, which should go into the gate's case as risks.

## Blocking findings
None.

## Non-blocking findings (carry as risks)
- **N1. `names()` never matches a question's real key.** At tests/acceptance/S-009/s009-lib.mjs:245-247, with the README at :41-42.
  - The real sender's question key is `<project>|question|questions/<name>.md` (src/lib/waiting.js `flaggedWait`; tests/desk/notify-ac74.test.mjs:39). `readNotice` turns that into card `questions/<name>.md`, so `names(info, 'question:<name>')` is false. My probe printed `names question:N-open: false`.
  - The cost: check (1) of `checkSenderCard` (s009-j5-sender.test.mjs:28-33) would pass without checking anything if a question were on a list. Today it is only called with card ids (`P-100-dor-1`, `P-701-stop-1`), so nothing is affected. Pull requests do match (`pr|7` reads as `pr:7`), and so do cards and gate cards.
  - The README's claim that "a question's … key names the list id `<kind>:<id>`" is true only if the adapter's AC14 stand-in keys questions that way.
  - Fix, when checks are next rewritten: strip `questions/` and `.md` in `readNotice`, as is already done for `queue/`.
- **N2. Join marks added to files line 173 does not name.** A `join-test: S-014/J<n>` comment line was added to the j1, j2, j3, j6 and j8 test files, which line 173 does not name, and to j4, j5 and j7. Line 173 ends "rewrites only these". The marks are comments only, and the governance check needs them for a frozen S-014 (governance/checks/v3_checks.py:1746-1748). The README discloses this at :11. The owner should see it.
- **N3. The checks cannot tell the real desk address.** They are not told it, so any `opens` ending in `/` reads as Home (s009-lib.mjs `HOME_OPENS`). Requiring one address per case (s009-j7-baseline.test.mjs:426) narrows this, and line 155 accepts it. The other notices the sender can send are still caught:
  - the cost notice's `?open=actions-usage` reads as kind `other` and fails coverage;
  - the test and "back on" notices would read as a group with no digits and fail.

## Check against the code at the base commit
- `git diff --stat fca41700 492a22c7 -- src/ tests/desk/` is empty. `fca41700` is `fca41700eb6dbedb6a4f00ab74c28112b16fb83f`, which equals `BASE_COMMIT` (s009-lib.mjs:26).
- `openUrl` gives `${deskUrl}/?open=${encodeURIComponent(key)}` and `homeUrl` gives `${deskUrl}/` (words.mjs:20-27). `ITEM_OPENS` and `HOME_OPENS` take the same prefix from both, and `encodeURIComponent` encodes `/`, `|`, `&` and `#`, so an item address never ends in `/`.
- The count is read from the body only:
  - `summaryWords` writes "Notifications are on: N things…" (words.mjs:46).
  - `groupWords` writes "N things now wait…" (:41).
  - The titles are the project name or "Service Desk", with no digits.
  - The usage line is left out because no `DESK_BILLING_TOKEN` is set.
- A first run sends exactly one summary, `summaryWords(c.set.length…)` (sender.mjs:269-270), or the zero summary at :299-301.
- A later run with one or two new keys sends item notices (:284-297); three or more send a group (:276).

## What I ran
**1. Probe of the real sender.** Script: /tmp/claude-0/reviewer-scratch/probe.mjs. It imports tests/desk/notify-helpers.mjs and s009-lib.mjs by absolute path and uses `harness`, so each caught push is decrypted with `decryptPush`. I turned each payload into `{words: title+"\n"+body, opens: navigate}`. Three runs, in the shapes of the baseline `sender` cases:

| Run | List | Real notice | `readNotice` / `senderInfos` |
|---|---|---|---|
| 1 | 2 cards, a question and a pull request | `"Service-Desk\nNotifications are on: 4 things wait on you now"`, opens `https://desk.example.invalid/` | summary, count 4, `hasDigits` true |
| 2 | one new card added | opens `https://desk.example.invalid/?open=Service-Desk%7Ccard%7Cqueue%2FP-955-failure-1.md` | item, card `P-955-failure-1`; `names()` true |
| 3 | three new cards added | `"Service Desk\n3 things now wait on you in Service-Desk"` | group, count 3 |

The probe showed:
- **Zero summary** (first run on an empty list): `"Service-Desk\nNotifications are on: nothing waits on you now"` reads as count 0 with `hasDigits` false, as line 173 says.
- **Form checks:** `validateOutput` gives `[]` in both the sender form and the desk form.
- **Line 169's coverage logic (j7:110-136):** exactly one first-run summary with count ≥ 4; no `other` notice; no summary or group without digits; one desk address, `https://desk.example.invalid`; an item notice on a later run.
- **`deskProjection`:** words become `"…<n> things wait on you now"`, and the count less decision cards on the list comes out right.

**2. `node --test tests/acceptance/S-009/*.test.mjs`:** 65 tests, 10 pass, 48 fail, 7 skipped, as expected. The 48 failures break down as:
- 45 × "output does not exist yet: the adapter … is not there yet"
- 1 × "baseline record not there yet"
- 1 × "output does not exist yet: docs/handover/P-003/"
- 1 × the j7 parent test, "1 subtest failed"

**3. `governance/checks/check_all.sh . 0870a470`:** exit 0, "OK: all governance checks passed." This time there was no "record_checks merges" finding (3 first-parent commits, 0 merges).

## Line 173: what it names versus what changed
- **Every place it names was changed:**
  - s009-lib.mjs: the output check, `assertViewsAgree`'s sender part (by count difference) and `deskProjection`.
  - s009-hold-show.test.mjs: AC1, AC2 and AC4; AC6 and AC7 now pass `{of}`.
  - s009-j4-views.test.mjs: AC11 at :38. The `sender: false` calls at :53 and :55 are untouched.
  - s009-j5-sender.test.mjs: :16-26 and :32-42.
  - s009-j7-baseline.test.mjs: rules (a) and (b), the `sender` rule, the new rules on every notice, and the desk and sender comparisons.
  - s009-case-set.test.mjs: the three new rules.
- **Everything it says to leave is unchanged:**
  - No case file under cases/baseline/ changed, and the four `open` cases are untouched.
  - j5:82 and j8:24, :33, :43, :50, :62 and :83 are unchanged and still read correctly in the new form.
  - The Home-count lines are untouched.
- **Outside the list:** the base commit (line 23; spec line 11 lists it as changed) and the join marks (N2).
- **Authorship:** all three commits are by check-author, with `Agent-Session: session_01QBwHGJoFFZQjbMT7zK1HWJ/check-author-1` and `Spec: S-014` trailers.

## Open questions
- N1 depends on how the adapter's AC14 stand-in keys question items. The reading of the adapter at line 23 should note that key form.

Files are in /tmp/claude-0/reviewer-scratch/:
- probe.mjs
- suite.txt
- checkall.txt
