# S-001 desk v2, stage 1b: the Reviewer's round-2 security review, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-1b at 476ceb6.

---

Verdict: PASS

The blocking problem from round 1 is fixed. The tests for a verdict file that isn't text, or is over 1 MB, now really test those rules. If either rule broke, a test would now fail. The fix changes only tests. No old test was weakened, skipped or deleted. The other two notes from round 1 are fixed as well. One small gap is left and it does not block. A damaged entry in the phone's saved state that has a bad head key is still not tested on its own. That entry is sealed with a secret key, so only something holding the key could write it. Nothing here is irreversible. Nothing changes for you beyond round 1.

Session: Opus 5.5. Work: build/builder/desk-v2-1b at 476ceb6 (337478e plus the fix), on top of e7a4979. I reviewed it read-only in two detached scratch worktrees under the scratchpad. Both are now removed. The Builder's worktree is untouched and clean at 476ceb6. I was not given the Builder's summary this time.

## Commands run
- `git diff 337478e..476ceb6 --stat`: 2 files, both tests. tests/desk/notify-j16-rule0.test.mjs gains 81 lines. tests/desk/notify-j18-rule0.test.mjs gains 12 and loses 3. Nothing under src/ or governance/ changed.
- The 3 removed lines are J18's old loop of bad parts. They were replaced in the same test, which is stricter now: it checks the exact reason (`assert.equal(rule0Problem(bad), why)`) where the old loop only checked for a truthy answer. No `.skip`, `.only` or todo was added.
- `cd src && node --test ../tests/desk/*.test.mjs`: 866 tests, 866 pass, 0 fail, 0 skipped. That is 863 from round 1 plus 3 new tests.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 31 page modules in step)`. `cmp` shows src/lib/j22.js and src/lib/scheduler.js are byte-identical to their copies in src/public/lib/.
- `bash governance/checks/check_all.sh . e7a4979`: `OK: all governance checks passed.`
- `python3 governance/checks/surface_guard.py diff --range e7a4979..476ceb6 --branch build/builder/desk-v2-1b`: `OK: 2 commit(s) in e7a4979..476ceb6 checked (0 merge(s) skipped, 0 exempt, 0 human)`. Both commits are by `builder <builder@agents.invalid>` with `Agent-Session` and `Spec: S-001` trailers.
- 15 mutations, each applied alone on a clean copy, each run on the full suite. Results are below.

## Round-1 findings

**B1 (blocking): fixed.**
- New test: tests/desk/notify-j16-rule0.test.mjs:128 (the "Reviewer round 1, B1" case).
- The shas are real. I wrote both byte strings to files and ran `git hash-object` on them. The results match the test's own `blobShaOf`:
  - `"Verdict: FAIL\n" + 0xff 0xfe` gives 78c83373c1c9c05fb9651cdd45152b5dbd829ad3.
  - `"Verdict: FAIL\n" + 1 MiB of "a"` gives 367b7a6cb3a1bfaab50c00cc1c080d833174fa2c.
- The blobs reach their checks. The test hashes the sha itself (it doesn't take it from src/), and the fake GitHub serves those exact bytes. So the sha, size and form checks pass. The big blob's answer is 1,398,120 base64 characters, about 1.44 MB as JSON, which is under the 1.5 MB read cap (`BLOB_ANSWER_CAP`). So it reaches the 1 MB checks; the cap does not stop it first.
- Mutation 1 (`fatal: true` → `fatal: false`, rule0.mjs:43): 865 pass, 1 fail. It fails on "not UTF-8 text: counted as given, so in the set": pull request 615 is missing from the set.
- Mutation 2 (both 1 MB checks removed, rule0.mjs:65 and :69): 865 pass, 1 fail. It fails on "over 1 MB: counted as given, so in the set".
- The test also checks three more things: the blob is read once, nothing is kept, and the blob is read again on the next run. The round-1 cases are still there.

**N1: fixed, with one small gap left.**
- The bad parts now use well-formed keys (`hex(1, 'd')`, `hex(1, 'e')`), and each case checks its exact reason. A control case shows the same keys, when in form, give no problem (tests/desk/notify-j18-rule0.test.mjs:103).
- These mutants to `rule0Problem` (src/notify/state.mjs:116-123) now each fail 1 test (J18, "its entries count toward the 5,000…"):
  - the word check removed
  - the ETag check removed
  - the state check removed
  - the `after` check removed
  - the entry field count removed
  - the verdict-key check removed
  - the part field count removed
- Still surviving: removing `!HASH_RE.test(k)` for a head key (state.mjs:120). 866 pass, 0 fail. It survives on 337478e too: J18, J16 and the state test files give 20 pass, 0 fail. So the fix lost nothing. The old cases with bad head keys were caught by the ETag and state checks anyway. See new finding R2-N1.

**N2: fixed.**
- These mutants now each fail 1 test:
  - The checkout's 1 MB limit removed (rule0.mjs:115). It fails the new checkout test at tests/desk/notify-j16-rule0.test.mjs:199.
  - The checkout's UTF-8 decode made non-fatal (checkout.mjs:62). It fails the same test. That test also has a control: a small text FAIL from the checkout does go to the agents, which proves the path is reached.
  - `lastRemaining` kept on a network failure (gh.mjs:74). It fails the new client test at :216.
  - `lastRemaining` kept when the download's address fails (gh.mjs:145). It fails the same test.
  - `lastRemaining` kept after an uncredentialed download (gh.mjs:150). It fails the same test.
- The two N2 items I called equivalent in round 1 (`capped || r.more`, and stripping one byte-order mark) need no test. They stay as they were.

**N3 to N6, the six readings, and the join-up review:** unchanged. The fix touches no code, so no part works with another differently. Round 1's join-up table stands, including the v2.5-project risk that goes to the Definer.

## New findings
- **R2-N1 (non-blocking). Routes to: Build (Builder), at its next touch of J18; no re-review needed.** No test catches dropping the head-key form check in `rule0Problem` (src/notify/state.mjs:120). This was not added by the fix, and the fix's comment doesn't claim it. To reproduce: change `if (!HASH_RE.test(k) || !e || typeof e !== 'object' || Array.isArray(e)` to `if (!e || typeof e !== 'object' || Array.isArray(e)` and run the full suite: 866 pass. The fix would be one more bad-part case: `{ v: {}, h: { [hex(1)]: good } }` → `'a head'`. The part is sealed under the state key, so this is defence in depth only.

Nothing else new. The new tests use no network; the client test uses a fake fetch. The 1 MiB buffers live in memory and in the fixture's temporary repositories, which `cleanScratch` removes.

## Open questions
1. My round-1 question about the Builder's summary is closed. You confirmed it should not have been in my pack, and it was not in this one.
2. Round 1's questions 2 (for the Definer: reading 2, and whether J16 should name the model for checkout verdicts) and 3 (whether you accept that an agent can post "Owner: after agents" on its own head) are still open. Nothing in this round changes them.

Files:
- /home/user/sd-bld-v2-1b/tests/desk/notify-j16-rule0.test.mjs
- /home/user/sd-bld-v2-1b/tests/desk/notify-j18-rule0.test.mjs
- /home/user/sd-bld-v2-1b/src/notify/state.mjs
- /home/user/sd-bld-v2-1b/src/notify/rule0.mjs
- /home/user/sd-bld-v2-1b/src/notify/gh.mjs
- /home/user/sd-bld-v2-1b/src/notify/checkout.mjs
- Mutation list and results: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r2mut/muts.json and /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r2mut/results.txt
- Full-suite output: /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/r2-suite.txt