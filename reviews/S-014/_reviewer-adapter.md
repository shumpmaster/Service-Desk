# S-014 — the Reviewer's reading of the baseline adapter against src/ at the base commit (line 23)

*Recorded by the Chief of Staff's session (session_01QBwHGJWF4ev8Y9sdGjavWE) as `orchestrator`, under L-0051. reviewer-2, a fresh Reviewer, read tests/desk/baseline/adapter.mjs (SHA-256 26de5d468d49a95a55a3b35be882706ffbbf0cf526cbde059909908803fea657, builder commit 26001c27 on build/builder/p003-adapter-r2) in an unpacked tree of fca41700eb6dbedb6a4f00ab74c28112b16fb83f with main's locked tests/acceptance/S-009/ added, read-only, on 2026-11-22 from about 17:53Z to 18:02Z. Its return, verbatim below the rule. The session's reading of N1 follows the return.*

---

Verdict: PASS

Every output field the adapter writes comes from src/ at fca41700, read the way J7 says: from the page drawn through `loadSandbox`, from the decrypted push calls of the real `runSender`, or from the hash the page settles on. The adapter works out no field of its own. There are no blockers. N1 should go to the owner before the record is made: for direct-link `open` cases, the page today does not do what J7 line 156, line 169 and AC15 say it does.

Blockers: none.

Non-blocking notes:
- **N1. Direct-link `open` cases (point a).**
  - What the page does: before its first read, it draws the "No longer waiting" sheet (sandbox.js:3608-3634). That is the sheet the reading quotes at :290. Once the read settles, whether `ok` or `cant-read` (`settledFor`, :5339-5346), a key that is not on the board makes the page swap the address for `#/waiting` and draw no sheet (sandbox.js:5490-5495).
  - My probe of P-106-stop-1, on a good read and with `log` failing: before the read the hash was the link and the sheet said "That no longer waits on you…". After `advance(0)` and after `advance(60s)` the hash was `#/waiting` and no sheet was drawn. For P-104-stop-1, which is on the list, the link stays and its sheet draws.
  - What the adapter records: `lands: "#/waiting"` from the page's own hash (adapter.mjs:327), and `shows: ""` because no sheet is drawn (:334-335). That matches J7's general definition of `lands`, "the desk's address once it has followed the notice or link", and comes from src/.
  - The adapter could not instead write "the link's address" without writing its own input, which J7 does not allow.
  - The cost: the record will lock in `#/waiting` and `""` as "what the desk opens today" for a link, while AC15's text says a "No longer waiting" sheet. The comparisons still work: rule (c) is not applied to links, and the twins are equal. But the owner should see that AC15's stated fact differs from what the record will show.
- **N2. AC14's stand-in (point b).**
  - **How questions are keyed.** `question:<name>` becomes a question row `{ path: 'questions/<name>.md', name, title: name }` (adapter.mjs:457-461). The real `flaggedWait` then keys it `Service-Desk|question|questions/<name>.md` (waiting.js:71), which is the sender's own form. My probe put a question on a later run and got `?open=Service-Desk%7Cquestion%7Cquestions%2Frelease-timing.md`. The checks' `names(info, 'question:release-timing')` returned true for it.
  - **How it is installed.** A `registerHooks` resolve hook redirects only src/lib/waiting.js, and only when it is imported by src/notify/collect.mjs (:480). sender.mjs and words.mjs keep the real module. The stand-in re-exports that same real module and replaces only `waitingSet`. Its replacement calls the real `waitingSet` with only `model.flagged` swapped. `held`, `jobCandidates`, `outside` and `deploys` stay as the sender built them; they are empty because there are no records and the fake GitHub has no runs.
  - **What else it changes.** It adds a `content` field to each item. Nothing in src/notify reads it: items are keyed only by `keyHash(item.key)`.
  - **Side effects.** Card items carry no parsed record, so an item notice's words use the real fallback `<item> <gate>-<n>` (for example "P-105 failure-1"). A question's words use its name. A pull request's title is `null`, which reads "untitled". No pull-request item is in the record.
- **N3. Addresses notices open (Reviewer N3).**
  - Every notice in every case uses one desk address, `https://desk.example.invalid`, from `testConfig`.
  - Home notices are exactly `…/` and come only from `summaryWords` or `groupWords`. Item notices are `…/?open=<encoded key>`.
  - No test, "back on" or cost notice can be sent: there is no `DESK_NOTIFY_TEST`, no `DESK_BILLING_TOKEN`, and state starts fresh. So reading any address ending `/` as Home does no harm here.
- **N4. New items counted by id (Critic N4).** This matches the sender. In S009-B-sender-content-change, run 2 sends nothing. In leave-return, run 3 sends an item notice for P-104, because its key dropped out of the state on run 2. No record case has one new id next to cards whose content changed.
- **N5. Critic round 3's points (point e).** No baseline result holds a question item notice. So neither the incomplete comment above `readNotice` (s009-lib.mjs:215-216) nor a bare question name matching (`names(info,'release-timing')` is also true) touches the record. Both stay latent, for built-side tests only.
- **N6. How `home_count` and `lines` are picked (point f).**
  - **`home_count`** comes from `.v2-bt1`, "<n> need(s) you" (sandbox.js:768), which is faithful. The badge fallback is never used in these cases.
  - **What `lines` takes:** queue `.v2-ql` lines (:3065, :3113-3124, :3154), Home brief `.v2-bt3` lines (:772, :775) and tile `.v2-ln.bad` lines (:985, :1092).
  - **What it leaves out:** some read-related text the page draws:
    - the read-state line `.v2-sub` ("Not read in this opening" / "checked 0 s ago") on Home and on Waiting;
    - "Service-Desk not read in this opening, its new questions may be missing" (`qmiss`);
    - the "Kicked back · can't read" strip;
    - Home's `.v2-ql` since-none line (:883).
  - **What it may let in:** `.v2-ql` also matches the quiet-fold buttons, which are not read lines, though none is drawn in these cases.
  - Every value it does write is the page's own text. The record's `lines` (none on good reads; three "Can't read" lines on failing ones) meet rules (a) and (b). This is a narrower reading of "each notice line", not a field that is not from src/. Since the adapter cannot change after the record, the build should know that only these classes are read.
- **N7. Hashes (point g).**
  - The adapter reads these files under tests/ (traced with strace on desk-ok, open-notice-ok and sender-first-showing): adapter.mjs, fake-desk.mjs, helpers.mjs, notify-helpers.mjs, sandbox-helpers.mjs and fixtures/config/projects.json, plus the case file.
  - The locked check's `adapterTestImports` (s009-lib.mjs:340-356) finds only the four .mjs helpers.
  - J7 line 158 requires `hashes` to cover projects.json too, but the check will not catch it if it is missing. The session's script must add it. The adapter's header names it (adapter.mjs:105-107).
  - src/config/projects.json is also read, by helpers.mjs's `LIVE_FILE`, but it is under src/.
- **N8. Minor.** If a run fails after `senderWorld` starts, its scratch folder `/tmp/baseline-adapter-*` is not removed. None was left after my runs.

**Changed:** nothing in /home/user/Service-Desk or base-fca4. I did not run `npm ci`, so no src/node_modules was created; none is needed, since src/ has only a wrangler devDependency. My files are only under /tmp/claude-0/-home-user/028f812b-7869-5d72-8074-7ec28ff624c8/scratchpad/r2out (adapter outputs, strace logs) and /tmp/claude-0/-home-user/028f812b-7869-5d72-8074-7ec28ff624c8/scratchpad/probe (probe scripts, a poisoned copy, and a copy holding a test record made only for probing).

**Why:** spec S-014 line 23's Reviewer step, before the session makes the record.

**Verified:**
- The adapter's SHA-256 is 26de5d46…a657, the same as `git show 26001c27:tests/desk/baseline/adapter.mjs`.
- `git diff --stat fca41700 -- src/ tests/desk/` is empty. The base tree's src/ is identical to the checkout's. Its tests/acceptance/S-009 is identical to main's.
- `node tests/desk/baseline/adapter.mjs <case> <out>` from the base tree's root: all 12 baseline cases exit 0. Re-runs gave identical bytes on 4 of them.
- What the outputs show:
  - desk-ok and notes-path give 7 cards on the list, `home_count` 7, P-101 `marked "hold"` from its gate case, no lines, and one summary "Notifications are on: 7 things wait on you now" opening `…/`.
  - log-path, queue-path and queue-call give three can't-read lines and no notices.
  - open-notice-ok gives `#/p/Service-Desk` and "That no longer waits on you". open-notice-log gives the can't-read words. Both link cases give `#/waiting` and `""`.
  - The sender cases give the summaries shown, plus item notices for P-105 (first-showing, run 2) and P-104 (leave-return, run 3).
- Poison run on a /tmp copy, with all 127 src files set to `throw new Error('baseline-poison')`: all 12 runs exit 1 and write no file.
- With a test record built in a /tmp copy, `node --test s009-j7-baseline.test.mjs s009-case-set.test.mjs` passes the case-set tests and the record, hashes, coverage and poison steps. The AC14 sender comparison and the notice-by-id `open` comparison also pass. Two comparisons fail at the base commit, as they should without the fix: the notes-path can't-read line, and the held card opening.
- The checks' own `readNotice`, `senderInfos` and `names` read every recorded notice as summary or item with the expected card.

**Undone:**
- I did not trace the badge fallback for `home_count`.
- I did not judge whether the built code will draw the AC16/AC17 lines in the classes the adapter reads.
- The reviewer checklist file the system prompt names, docs/archive/OPERATING_MODEL_v2.5.1.md, does not exist in /home/user/Service-Desk/docs, so I could not apply its §12. There is also no PR body in this material, so the "What this means for you" check could not be applied.

**Needed outside my surface:**
- The owner, or the Orchestrator on the owner's behalf, should rule on N1 before the record is made.
- The session's record script must hash tests/desk/fixtures/config/projects.json (N7).

**Open questions:**
1. Does the N1 mismatch between AC15's quoted link sheet and today's settled page need the owner's word before the record, or is recording `#/waiting` and `""` acceptable as "what the desk opens today"?
2. Is the `lines` selection in N6 the intended reading of "each notice line on the queue or Home"? It cannot change after the record.
3. Where is the reviewer checklist the brief names, which does not exist at docs/archive/OPERATING_MODEL_v2.5.1.md?
---

## The session's reading
- **PASS, so the record is made** (line 23: "if it cannot, no record is made"; it could).
- **N1 (the direct link).** Line 23 sends the build back to the owner only when the Reviewer cannot confirm the fields come from src/. It confirmed they do. AC15 asks that a held card opened by a direct link opens "what the desk opens today for a card not on its list", and the record now shows what that is: `#/waiting` with no sheet once the read settles. The "No longer waiting" sheet AC15 and the reading (reviews/S-009/_src-reading.md:290) describe is drawn only before the first read settles. So the record is made as today's page gives it, and the difference is put to the owner in the pull request and the handoff, not as a stop. If the owner wants the sheet kept on a settled read, that is a new spec extending S-014.
- **N6 (`lines`).** The second dispatch's brief must say the AC16/AC17 lines are drawn as a `.v2-ql` line on the queue and a `.v2-bt3` line in Home's brief, the classes the unchanged adapter reads.
- **N7.** The record hashes tests/desk/fixtures/config/projects.json by hand, as the Reviewer and the Builder both said.
