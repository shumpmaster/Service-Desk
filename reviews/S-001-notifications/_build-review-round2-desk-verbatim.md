Verdict: PASS with notes

**For the owner.** Every desk-side defect from round 1 is fixed, and I re-ran my probes against the new code to confirm it. If the desk can't check before you tap an answer link, it now says "The desk couldn't check just now" and opens nothing, so it no longer opens a stale answer page. Tapping a $50 cost notification while the desk is open reads your GitHub Actions use again. The desk also stays in step with the phone sooner after a failed read. Coming back to the desk keeps to one read a minute. Tapping a notification while a read is under way waits for a fresh read before it shows anything. One case stays a known gap, which the spec now states: a phone whose desk storage was cleared can keep showing a question as "being asked" after the phone has notified it. One small point remains: a cost tap makes one extra desk read outside the once-a-minute spacing. Both the build and the full suite pass: 652 tests, 652 pass.

**What I ran**
- Everything ran in a fresh copy of 6b2b227 at `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev3`, never on the branch.
- `npm --prefix src ci && npm --prefix src run build && npm --prefix src test`: "build: PASS (2 connected projects; 24 page modules in step)"; 652 tests, 652 pass, exit 0. Log: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev3-test.log`.
- Round 1's probes, plus two new ones (G2 and A2): `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev3/tests/desk/zz-probe.test.mjs`.

**Round-1 findings**
1. **Fixed.** `src/lib/scheduler.js` `recheck` now requires each pull request's files to be read at its current head. Probe C: "The desk couldn't check just now · Open GitHub anyway", and nothing opened. Before the fix it opened `…/new/main?filename=decisions%2Fquestions%2FP-001-next-work.md…`.
2. **Fixed.** In `src/public/app.js`, the service-worker handover calls `desk.refreshUsage()` for an `actions-usage` target. Probe A: usage reads went from 1 to 2 after the tap. It has its own page-level test in notify-ac78-desk.
3. **Fixed.** `src/public/app.js` `askingView` now reads "PR #91" alone. Probe B no longer shows ": null".
4. **Fixed.** A found closed pull request whose file read failed is now retried at the next poll (`extrasDue`, `tried.poll === st.polls`). Probe E: read again at minute 1 and no longer held. Before: minute 5.
5. **Fixed.** A return to the foreground now rides the next poll at the 60-second mark (`soon()` is removed). Probe G: 0 extra polls for 5 returns in 25 s, where before there were 5. Probe G2: the closed read is not made at the return itself; it rides the next poll, which then shows the question waiting.
6. **Ruled a stated gap, as the coordinator said.** Draft 9 states it in AC77's "What the page keeps on the device" (which corrects draft 7's "only") and in the gaps list at `specs/S-001.md:5149-5151`. Probe H still reproduces it, as expected.
7. **Fixed.** Each closed read now carries a request number: `applyClosed` ignores an answer whose number is no longer the latest, and `cycle`'s settle needs the latest number. An arrival makes its own blob call (`closedNow`), and the new test notify-ac77-desk-reads checks a tap during a read in flight. Spec: draft 9, `specs/S-001.md:5099-5100`.
8. **Fixed.** In `docs/handover/desk-operations.md`, the leaked-keys rollback is now three jobs of about 5, 4 and 9 minutes, and "Turning notifications on again" is 8 or 9 minutes. Each is under 10, as AC27 asks.
9. **Fixed.** `tests/desk/ac14-budget.test.mjs` adds the 5-project day with its 100 default-branch changes plus 288 pull request head changes. It asserts exactly 288 changes, one J20 read per pull request per head an opening sees, and under 10,000 calls. Diagnostic: 312 reads, 5,101 calls.

**What the fixes brought in**
- **The tap's closed read as a blob call of its own.** Consistent with Terms in draft 9. It's followed by the found pull requests' file read, then settles. A raised time not yet read counts as the read failing, as AC77 says. It has its own test.
- **A return to the foreground riding the next poll.** Consistent with Terms and A3 in draft 9. A read already in flight is kept (`keepAsking`), and a return during a cycle's later reads waits for the next poll rather than being marked failed.
- **Request numbers on closed reads.** Consistent, as under finding 7.
- **Usage read from Service-Desk's entry.** `usageEntry` is used by the page, the sandbox and the function (`src/lib/usage.js`, `api.js`, `scheduler.js`). `configcheck.js` fails the build for a top-level `actionsUsage` or for two entries holding it. Consistent with J7 in draft 9.
- **The new route for a dead subscription** (remove the desk from the Home Screen, add it again, turn notifications on). It's consistent with J19's "the desk removed from the Home Screen and added again … means a new value", and the time stays under 10 minutes.

**New findings**
- **N1 (note).** A cost tap on an open desk makes a poll call outside A2's one poll per minute.
  - Where: `desk.refreshUsage` (`src/lib/scheduler.js`) runs `cycle(first)` immediately rather than letting the read ride the next blob call.
  - Probe A2: the tap came about 11 s after the last poll and gave 1 poll and 1 blob call within a second.
  - Against: A3's "J21's usage read … adds no call of its own", and A2's spacing, which draft 9 pinned for foreground returns.
  - Impact is negligible, since cost taps come a few times a month at most. Either let the forced usage read ride the next poll, or have the Definer count it.

**Open questions:** none beyond N1.
