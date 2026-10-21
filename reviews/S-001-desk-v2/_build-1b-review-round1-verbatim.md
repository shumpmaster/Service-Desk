# S-001 desk v2, stage 1b: the Reviewer's round-1 security review, verbatim

Dispatched by the orchestrator on 2026-10-21 against build/builder/desk-v2-1b at 337478e.

---

Orchestrator note, not part of the report: the Builder's hand-back was put in this review's pack by mistake (D-006). The Reviewer says it finished its own review and mutation runs before opening it. Round 2 was sent without it.

Verdict: FAIL

The code for stage 1b looks right and safe. It fails on one thing: two of the tests the spec requires don't actually test what they say. The spec says a verdict file that isn't text, or is over 1 MB, must still count as given, so the phone still notifies. The code does this; I checked it myself with a probe of my own. But the tests for those two cases pass for a different reason. If either rule were broken, the whole suite would still pass, and a later change could hide pull requests from your phone without anyone noticing. The fix is small: the Builder adds two test cases. Nothing else blocks. No secret or token can reach a log, the saved state, an issue or a notification. The phone and the board use one shared rule. When they could differ, the phone sends a needless notification, never misses one. The board's own behaviour is unchanged. Nothing here is irreversible. Two of the Builder's six readings are left for the Definer. Neither one blocks.

Session: Opus 5.5. Open sprint: docs/sprints/m1.1-first-sprint.md. Work: build/builder/desk-v2-1b at 337478e, on top of e7a4979. I reviewed it read-only in a detached scratch worktree, which is now removed. The Builder's worktree is untouched and clean.

## Commands run
- `cd src && node --test ../tests/desk/*.test.mjs`: 863 tests, 863 pass, 0 fail.
- `node src/tools/build.mjs`: `build: PASS (2 connected projects; 31 page modules in step)`. `cmp` shows that src/lib/j22.js and src/lib/scheduler.js are byte-identical to their copies in src/public/lib/.
- `bash governance/checks/check_all.sh . e7a4979`: `OK: all governance checks passed.`
- `surface_guard.py diff --range e7a4979..337478e --branch build/builder/desk-v2-1b`: `OK: 1 commit(s)`. The author is `builder <builder@agents.invalid>`, with `Agent-Session` and `Spec: S-001` trailers.
- `review_check.py classify`: src/notify/** and src/lib/j22.js are R3. governance/risk-paths.toml:20 and :24 (CS24) make both owner-approval paths.
- I ran 28 mutations, each on a throwaway copy. Results are below.

## Blocking finding

**B1. J16's "isn't UTF-8 text" and "over 1 MB" cases don't test those rules.** Routes to: Build (Builder), stage 5 re-review.
- Where: tests/desk/notify-j16-rule0.test.mjs:102 ("over 1 MB") and :104 ("not UTF-8 text").
- Both fake answers keep the sha of `Verdict: FAIL\n` but change the bytes. So they fail at src/notify/rule0.mjs:69 (the bytes' length differs from `size`, or their blob sha differs from the one asked for). They never reach the checks they are named for: the UTF-8 decode at :43 (`fatal: true`) and the size checks at :65 and :69.
- Mutation 1: `fatal: true` → `fatal: false` at rule0.mjs:43. Full suite: 863 pass, 0 fail.
- Mutation 2: remove both 1 MB checks (`|| j.size > VERDICT_MAX_BYTES` at :65 and `|| buf.length > VERDICT_MAX_BYTES` at :69). Full suite: 863 pass, 0 fail.
- My probe: a reviewer verdict blob whose sha is the real `git hash-object` of its bytes. First `"Verdict: FAIL\n" + 0xff 0xfe`, then `"Verdict: FAIL\n" + 1 MiB of "a"`. It goes through `senderSide` in tests/desk/rule0-fixture.mjs, with the bytes as a Buffer in `w.gitBlobs`.
  - On 337478e, both probe cases pass: the pull request is in the set and the blob is read once. So the code is right.
  - Under mutation 1, the probe's non-UTF-8 case fails. The verdict reads "neither", so the pull request is hidden from the phone.
  - Under mutation 2, the probe's 1 MB case fails. The blob reads FAIL, so the pull request is hidden.
- Why it blocks: J16's test list names both cases ("is over 1 MB and isn't text, each counted as given, so in the set"). These are the hide-or-notify safe sides of an R3 change. The hand-back's claim "nine broken-blob cases, each counted as given" is only true for seven. An unverified claim is a FAIL.
- Fix: add the two cases with real-sha bytes, as above. Keep the present ones; they do test the sha, length and form checks, and pass for those.

## Non-blocking notes
- **N1. J18's "a part not in form is not used" cases are also hollow.** Each bad part in tests/desk/notify-j18-rule0.test.mjs:100 uses `hex(1)` with no prefix, which gives the key `undefined000…1`. That key fails `HASH_RE` before the value under test is checked. Mutations to `rule0Problem` that drop the word check, the ETag check or the state check each leave the J18 tests passing (3 of 3). The spec doesn't require these cases, and the part is sealed under the state key, so this is defence in depth only. Fix it with B1: pass a prefix such as `hex(1, 'd')`.
- **N2. Other surviving mutants, all on safe or equivalent paths:**
  - The 1 MB limit on a verdict read from the checkout (rule0.mjs:115) has no test.
  - Two ways the header goes missing have no test: resetting `lastRemaining` on a network failure (gh.mjs:74), and after an uncredentialed download (gh.mjs:150).
  - `capped || r.more` (collect.mjs:120) is equivalent, because 3 pages of 100 make 300 files.
  - Stripping the byte-order mark is equivalent for one leading mark.
  Each of these behaves on the safe side today.
- **N3. The guarded client has no timeout on a request.** This is in src/notify/gh.mjs, it was already there before 1b, and it is not 1b's to fix. The only limit is the job's `timeout-minutes: 10` (.github/workflows/desk-notify.yml:65). A hung read ends the run with nothing sent. The next run tries again. The brief listed "timeouts" as a property of the client. It doesn't have one.
- **N4. A file with two byte-order marks, read from the checkout.** openCheckout's decoder strips one mark (checkout.mjs, TextDecoder's default) and `verdictOf` strips the second. So `﻿﻿Verdict: PASS` reads PASS in the sender, while `parse_verdict` gives `None`. The error is on the safe side: a needless notification, never a hidden one. The blob path keeps the mark (`ignoreBOM: true`) and agrees with review_check.
- **N5. No limit on blob reads per run.** After the state is lost (no state, or a rotated key), the first run reads every required verdict blob of every open pull request in one go. The budget guard only checks the first answer. That is a few dozen reads today, within the spec's cost section, which sets no cap. It is a risk only with hundreds of open pull requests.
- **N6. Kept verdict words were made by today's `verdictOf`.** If that reader's rule changes later, the old words stay while their blob remains in an open list. It's harmless now. Worth a line in J18's known limits.

## Security checks that hold
- **Every new read goes through the guarded client.** That covers `git/blobs/{sha}` and `commits/{sha}/status`.
  - The 300 floor still applies.
  - The blob answer is capped at 1.5 MB, and the status answer at 1 MB.
  - Both shas are checked against `^[0-9a-f]{40}$` before they go into the path.
  - The token is only in the Authorization header.
  - Logs carry counts only.
  - Status descriptions are used only for `startsWith`. They are never logged or stored. Only `{etag, state, after}` is kept.
- **Untrusted inputs:**
  - A blob is decided only when its sha, `encoding: base64`, a valid base64 form, its size, and its recomputed git blob sha all match.
  - An ETag must match `^(W\/)?"[\x21\x23-\x7e]{1,200}"$` before it is kept or sent back.
  - A fork's pull request is never read for files or contents.
  - If governance/risk-paths.toml is missing or unreadable, rule 0 uses (i) alone.
  - An owner check that is malformed, has no entry, or has an unknown state counts as "not read".
- **The `rule0` part of the state:**
  - It is sealed with AES-256-GCM. Its key is derived for that part alone, it is bound to its label, and it is padded.
  - `verifyState` opens it, checks its form, and counts it toward the 5,000. A part that can't be opened makes the whole state count as forged (the safe side).
  - Its size is bounded by the open pull requests. A verdict is kept only while an open list holds its blob. A head's entry is kept only while that head is open.
  - A kept answer counts only after a 304 to that same head's conditional read. It is never used after a skip or a failure. A kept answer can't hide a pull request after its check changes, because GitHub would then answer 200, not 304.
- **Safe sides:** a failed, refused, 404 or out-of-form blob, or a skipped, failed or malformed owner check, each leaves the pull request in the set. Nothing in rule0.mjs throws `ReadFailed`, so a rule-0 failure never marks the project as not read. Mutations show these tests do catch real breaks:
  - Removing the set's filter fails 12 tests.
  - Using the kept answer after a skip fails 1.
  - Using floor 300 instead of 400 fails 2.
  - Reading the check when there is no header fails 1.
  - Keeping a failed blob fails 1.
  - Forcing `ownerChecksApply` to true fails 2.
  - Hashing a head without its sha fails 3.
  - Ignoring rule 0's 5,000 count fails 1.
  - Making the page's `ownerChecksApply` ignore privacy fails a page test (J22) and AC73.
- **One judgment:** rule0.mjs only reads. `ruleZero`, `ownerCheckHeads` and `ownerChecksApply` come from src/lib/j22.js. The `checksRead` refactor in scheduler.js has the same logic as before; the only difference is guarding a null project or entry, which never arises. `model.flagged` is the same set that `classifyPull` flags. The real-on-real case runs the page's real scheduler against the sender for #126, #128, #130, #135 and #148, and gets equal results. The six blob fixtures are real: `git hash-object` gives each name back, and each is a blob in Service-Desk.
- **Workflow permissions** already include `contents: read` and `statuses: read` (desk-notify.yml:40-46).

## The Builder's six readings
1. **"The run's last GitHub reads."** This reading is sound. J16's own sentence goes on: "before the set is worked out and anything is sent". AC78's usage read uses the owner's token and limit (J21: "J16's budget guard is not touched"). AC76's issue sync has to come after sending. For the Definer: change the wording to "the last reads on the workflow token before the set". No rework.
2. **Default-branch verdicts in a v2.5 project.** This follows J16's words. But J16 ("fed the same inputs the page feeds it") pulls against J22, which counts a tree file the page doesn't read as given. In Personal-Org-Operating-Model, a FAIL landed on main would keep the phone silent while the board shows a card. That is a needless card, not a missed decision, because the reviewer did fail it. It is still a gap the Definer must settle before CS27 moves Workflow 4's pin. No effect until then.
3. **No rate-limit header.** This is what the spec says ("an uncredentialed download, say"). Skipping after a network failure is a fair safe-side extension.
4. **What J18 keeps of the owner check.** This is not a reading. The spec says exactly this: "its state, and whether its description starts `Owner: after agents`".
5. **The extra blob-sha guard.** This is fine and on the safe side ("No other kind of answer can come", J16). It is also why B1's tests went hollow.
6. **Testing the 5,000 count through `stateProblem`.** This is acceptable. `verifyState` calls it, and the test also checks `verifyState` on a small state.

## Join-up review (Build: the parts working together)
Parts checked together: the page's real scheduler and board (src/lib/scheduler.js and board.js, on the fake desk function) and the sender's collect step (on the fake GitHub), fed one scenario by tests/desk/rule0-fixture.mjs. Stage 1b changes no screen; src/public/ changes only by byte-identical copies of the library files.

| Path | Result | Fix |
|---|---|---|
| A pull request goes to the agents (a missing verdict, a FAIL, "neither", or "Owner: after agents"): left out on the board and on the phone | Works together (AC73 test 1; real-on-real for 5 pull requests) | — |
| Five public pull requests: the same 3 heads read on the page and in the sender | Works together | — |
| A private or v2.5 project: (i) applied on neither side | Works together | — |
| The sender near the floor: the phone notifies while the board leaves the pull request out | The spec's one allowed difference (a needless notification) | — |
| v2.5 project, a FAIL verdict landed on main | Sides differ (reading 2): phone silent, board shows a card. Non-blocking; carry it as a risk until CS27 | Definer |

## Open questions
1. My charter says I must not see the Builder's summary of its own work. You put it in my pack and asked me to judge its readings. I finished my own review and the mutation runs before I opened it. Its only effect on my findings is that it confirmed B1's claim mismatch. Please confirm this was meant (D-006).
2. For the Definer: reading 2 above, and whether J16 should name the model for checkout verdicts.
3. This is J22's design from stage 1a, not 1b's: an agent with write access can post an `owner-verdict` status reading "Owner: after agents" on its own head. That hides the pull request from both the board and the phone. It still can't merge without you. Is that accepted?

Files: /home/user/sd-bld-v2-1b/src/notify/rule0.mjs, /home/user/sd-bld-v2-1b/tests/desk/notify-j16-rule0.test.mjs, /home/user/sd-bld-v2-1b/tests/desk/notify-j18-rule0.test.mjs, /home/user/sd-bld-v2-1b/src/notify/state.mjs, /home/user/sd-bld-v2-1b/src/notify/gh.mjs