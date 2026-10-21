# The J18 leak-scan fix: the Reviewer's review, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/j18-leak-scan at 32b2e29, after CI job 119419439413 on main at 5326d07 failed one test by chance.

---

Verdict: PASS

**What this means for you.** Nothing failed and nothing was skipped. The change makes the leak checks on the notification sender's saved state give the same answer every run. Before, a check could fail by chance when random encrypted text happened to contain a short word it was looking for. That chance is gone, and I found no case where the new checks miss a leak the old ones caught in a way that matters. I have two small notes, neither blocking: one check could prove its encrypted parts more firmly, and one comment gives the wrong odds. Nothing here is irreversible: the change touches only tests.

Reviewed: commit 32b2e29 on build/builder/j18-leak-scan, on top of origin/main 5a7e55a. I worked read-only in a detached scratch worktree and a separate copy for mutations. Both are now removed, and the branch is unchanged at 32b2e29.

## 1. The chance false positive is gone from every changed scan
- **The flaky test, run 3000 times in one process** (same set-up as notify-j18-state.test.mjs:156):
  - The old scan (`JSON.stringify(state)`) matched a needle 19 times, about 0.63%.
  - The new scan (`clearView(s).text`) matched 0 times.
  - The clear view was the same text in all 3000 runs: `{"form":1,"at":…,"sub":"<hash>",…,"jwt":"<sealed jwt>",…,"keys":[{"sent":…},{"sent":…}],…,"rule0":"<sealed rule0>"}`. It holds no random output, so the scan cannot match by chance.
- **The other two changed scans have no random output either.**
  - AC78 (notify-ac78-j21.test.mjs:233): I dumped its clear view, logs and issue body. All fixed text.
  - The rule 0 test (notify-j18-rule0.test.mjs:26): its clear view is fixed, plus one hash taken out.
- **The whole-file scans still in place are safe.** They now run only for needles that hold a character outside base64url, or are 16 characters or longer. Chance matches in random text are then impossible or about 1e-26.
- **The new test's search loops** (j18-state.test.mjs:208–221) give up only with odds of about e^-143.
- **The rest of tests/desk/ has no other scan of this kind.** I looked at every `assert.ok(!… .includes(` and every `doesNotMatch` there. They read fixed text: payloads, issue bodies, logs, the page.
  - The one log line with hash output is `new keys: <12 hex>` (sender.mjs:319). It never appears in the AC78 runs, and no other short-needle scan reads logs.
  - AC76's `noItemIn` reads issue bodies, which are fixed text.
  - AC77's `'"n"'` check (notify-ac77.test.mjs:380) cannot match by chance.

## 2. The scans are no weaker
**Mutations.** I applied each one to a copy of src and ran the new and the old (origin/main) test files side by side:

| Mutation | New tests | Old tests |
| --- | --- | --- |
| M1: every item's key (with its path) put in a clear top-level state field | j18-state fails | j18-state fails |
| M3: item keys not hashed (sender.mjs:240, `h = item.key`) | 7 j18-state tests fail | 7 fail |
| M4: JWT base64url-encoded, not sealed (sender.mjs:311) | j18-state fails, **and rule0 fails** | j18-state fails; rule0 passes |
| M5: rule 0's part base64url-encoded, not sealed | j18-state, rule0 and ac78 fail | same |
| M8: usage stored in clear as 'step5' | 6 ac78 tests fail | same |

The new tests caught everything the old ones caught, and one more (M4 in the rule 0 test).

**clearView (notify-helpers.mjs:434–461).**
- It takes out only a sealed field whose value is base64url, and only `sub`/`gone` when they are exactly 32 hex characters.
- It turns a hash-keyed map into a list only when every key is 32 hex. Its values stay in the scanned text.
- Anything malformed stays in the text and is scanned. The new test's nine "leaky" states (j18-state.test.mjs:236–247) prove this, and I agree with each one.
- It works on a `structuredClone`, so it never changes the state it reads.

**Wrong-key checks.** Every sealed part gets one: j18-state:180–183, rule0:44–47, ac78:246. In j18-state and rule0, each part must also open under the right key and must not be its clear value merely encoded. Both tests also pin the exact list of sealed parts (`['jwt','rule0']`), so no unexpected part can slip by.

## 3. Nothing skipped, deleted or weakened
- `python3 governance/checks/review_check.py pr 999 --base origin/main` → Risk class R1. Required reviews: reviewer. `missing verdict: reviews/999/reviewer.md`. FAIL: 1 violation. That is the expected one.
- Assertion counts (old → new):
  - j18-state: 65 → 81 asserts, tests 10 → 11. The one new test is "the leak scan reads the clear fields…". No test name was removed.
  - rule0: 26 → 33 asserts, 3 → 3 tests.
  - ac78-j21: 83 → 85 asserts, 12 → 12 tests.
- No skip, todo or only in any of them. Each changed file loses one scan line, and each is replaced by a stronger set.

## 4. Repeated and full runs
- The three changed files run together 60 times (6 at a time): 60 of 60 exited 0, each with `# pass 26`, `# fail 0`.
- Full suite once (`cd src && node --test ../tests/desk/*.test.mjs`, node v22.22.0): `# tests 867`, `# pass 867`, `# fail 0`, `# skipped 0`, `# todo 0`.

## 5. Surface guard
- `python3 governance/checks/surface_guard.py diff --range origin/main..32b2e29 --branch build/builder/j18-leak-scan` → `OK: 1 commit(s) in origin/main..32b2e29 checked (0 merge(s) skipped, 0 exempt, 0 human)`.
- The author is `builder <builder@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers.

## Blocking findings
None.

## Non-blocking notes (carry as risks)
1. **AC78 checks some sealed parts with a wrong key only** (notify-ac78-j21.test.mjs:246). For jwt, rule0 and recorded-pr it never opens them with the right key. A wrong key also fails to open a short clear string, so if a sender wrote a base64url-shaped clear value there (for example `rule0 = 'step5'`), clearView would take it out and this check alone would not notice. The old AC78 scan read rule0 and recorded-pr in clear, so this one assertion is narrower than before.
   - In practice it is still caught. My M9 mutant (rule0 set to 'step5') failed 7 AC78 tests, the leak test among them, because the next run cannot read the state. Usage is opened with the right key at line 247.
   - Suggested fix: the right-key open that j18-state and rule0 already do. This routes to stage 5 Build (builder) if the orchestrator wants it.
2. **Hashes are now checked only for their form** (32 hex) in the rule0 and AC78 tests. A clear number written in hex form in a hash slot would no longer be found by '800'. Today the only clear hash in either test is the subscription's, which comes from the subscription and not from a pull request, so the risk is theoretical. j18-state still checks every item key against `keyHash` and against wrong keys (lines 196–200).
   - A firm check would be: every hash changes under another state key.
   - Mutations M6 (job-candidate key = the commit sha cut to 32) and M7 (recorded number in clear) were caught by none of these three files, old or new. That is not a regression: these tests have no such entries. AC77 covers M7.
3. **A comment gives the wrong odds.** The j18-state comment says 'N-a' matches about one run in 385 (0.26%). In this test's whole state I measured 19 in 3000, about 0.63%, likely because the JWT, rule 0's part and the hashes are all scanned. Only the comment is off.
4. **One old needle can never match.** `'W/"'` (rule0 test) is searched in JSON text, where a quote is written `\"`. So it could not match before this change either. This is not new.

## Open questions
None.