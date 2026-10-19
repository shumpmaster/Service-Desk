Verdict: FAIL

**For the owner.** Most of the desk side works as the spec says. A question being asked in a session is held and isn't counted. "Your answer is being recorded" appears as it should. The closed-pull-request read and the read of a single pull request by number keep the desk in step with the phone in the cases the tests cover. The "More detail" fold is closed at the bottom of Home, as you ruled. All 634 tests pass and nothing overflows at phone widths. I found two real gaps, though, and one of them is exactly your concern.

- **Stale answer link (blocking).** The check the desk runs when you tap an answer link can open GitHub's answer page for an answer that is already being recorded. This happens if, at that moment, the desk fails to read the files of a pull request that has just changed. It should say "The desk couldn't check just now" instead.
- **Usage bar not refreshed (blocking).** When the desk is already open, tapping a $50 cost notification doesn't re-read your GitHub Actions use, so the bar can be up to an hour old.

Both are small fixes. The rest are notes.

**What I ran** (in a copy of the branch at `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev2`, so the branch itself was never written to):
- `npm --prefix src ci && npm --prefix src run build && npm --prefix src test`: "build: PASS (2 connected projects; 24 page modules in step)"; 634 tests, 634 pass, exit 0. Log: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev2-test.log`.
- The Builder's phone-width check, pointed at the copy: no horizontal overflow at 360×740 or 414×896 on any of the 7 screens. Screenshots: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev2phone/shots/`.
- My own probes, using the page harness and the fake desk function: `/tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/rev2/tests/desk/zz-probe.test.mjs`, run with `node --test tests/desk/zz-probe.test.mjs`.
- Fixture provenance checked:
  - all 131 files in `sd-ef8daf4/` match `git show ef8daf4:<path>`, byte for byte;
  - the `ac77-real/` question and session file match ccf320f, and the `asked/` copy differs only by the one added line after line 3;
  - the question's raised time at ccf320f is 11:26:23Z;
  - `notify-pull-107-files.json` matches GitHub as read today.

**Findings**

1. **BLOCKING. AC77's re-read before an answer link opens a stale link when a file read fails.**
   - Where: `src/lib/scheduler.js:950`, `if (files.some((n) => !st.files.has(n))) return { ok: false };`. This only asks whether the pull request's files were ever read, at any head. A pull request whose files were read at an older head counts as read, even though its read at the new head just failed. The model then ignores the old-head entry (`recordingAnswers` needs the head shas to match), the question reads as open, and GitHub's answer page opens.
   - Against: AC77, "the re-read fails: 'The desk couldn't check just now', with 'Open GitHub anyway'"; the owner's report.
   - Reproduced: probe C. An ordinary question; own-branch PR #97 read at head c…c, which doesn't record it. At 31 s the PR moves to head d…d, which adds `decisions/questions/P-001-next-work.md`, and that file read fails. Tapping the link opened `https://github.com/shumpmaster/Service-Desk/new/main?filename=decisions%2Fquestions%2FP-001-next-work.md…`, and no "couldn't check" line showed.
   - When it happens in practice: one pull request records several answers and the Chief of Staff pushes them one at a time (for example #96 held three).
   - Fix: test that the files were read at the pull request's current head.

2. **BLOCKING. A cost-notification tap on an already-open desk doesn't re-read the usage.**
   - Where: `src/public/app.js:192-198` (the `usage` target only opens the fold and scrolls) and `:898-910` (the service-worker handover calls `desk.arrival()` only). `desk.refreshUsage` (`src/lib/scheduler.js:901`) is never called from the page.
   - Against: AC78 ("again on a tap from a cost notification"), J21 ("again on a cost notification's tap") and AC78's test list.
   - Why the tests pass: `tests/desk/notify-ac78-desk.test.mjs:203` calls `desk.refreshUsage()` on the scheduler directly, so the page's wiring is never exercised.
   - Reproduced: probe A. The desk is open; 10 minutes later a handover tap of `actions-usage` arrives, and the page replies `{ok:true}`. Usage reads: 1 before the tap, still 1 five minutes after. The bar can stay up to an hour old.
   - The handover was added in draft 8, so this is now the usual path whenever the desk is open in the background.

3. **Note. "Being recorded" view shows "PR #91: null".**
   - Where: `src/public/app.js:671` prints `PR #${a.pr.number}: ${a.pr.title}`, and `src/lib/model.js:381` sets `title: null` once the recorded pull request has left the open list.
   - Reproduced: probe B. Merged, with the tree not yet caught up: the question's view reads "PR #91: null". This is the exact screen that guards against the stale link.

4. **Note. A found closed pull request whose file read fails is retried only after 5 minutes, not at the next poll.**
   - Where: `src/lib/scheduler.js:35` (`FILES_RETRY_MS`) and `:309-310`. The closed read itself is marked done, so a tapped item shows.
   - Effect: the desk shows "Being asked in your session" while the phone says the question waits.
   - Reproduced: probe E. With the failure gone at minute 1, the question stayed held for 4 minutes.
   - The spec's "tried again at the next poll" (draft 8, note B) is written for the closed read; this file read is the closest case. Either retry it at the next poll or have the Definer state the 5 minutes.

5. **Note. A return to the foreground polls at once, regardless of the 60-second spacing.**
   - Where: `src/lib/scheduler.js:842-844` and `:834-837`. `soon()` resets `lastPollStart`, so each return makes a poll call and a blob call for every project holding a question.
   - Reproduced: probe G. Five returns in 25 s gave 5 Service-Desk polls.
   - Against: A2 ("one poll call per project per 60 s"), and A3's "no call of their own". The count grows with the number of returns; AC14 doesn't bound returns.
   - Still under 10,000 calls in practice. The Builder disclosed this; the Definer should count it.

6. **Note. A gap in the spec: a device that never saw an answer recorded disagrees with the phone.**
   - What happens: the sender keeps "seen recording" in its state (`src/notify/collect.mjs:135-137`), so once an answer pull request's new head stops recording, the question waits again and notifies. A device that didn't see the recording, or whose storage was cleared, still holds the question.
   - Reproduced: probe H showed the desk side, "Being asked in your session" while the PR is open at a head that doesn't record. The sender's side is from reading collect.mjs:135-137.
   - Against: AC77's claim that device memory "only ends holds that the closed read would end too". Here the closed read can't end it, because the pull request is still open. For the Definer.

7. **Note. An arrival during a closed read already in flight is settled by the earlier read.**
   - Where: `closedAgain` resets the state (`src/lib/scheduler.js:361-366`); the in-flight answer then sets it done (`:622-623`); the cycle end marks it settled (`:796`).
   - Effect: a tapped item can show from a read issued just before the tap.
   - Narrow; found by reading the code, not reproduced.

8. **Note. The AC27 operating notes contradict themselves on the 10-minute limit.**
   - Where: `docs/handover/desk-operations.md:9` says "Each job takes under 10 minutes"; `:87` says "about 15 minutes" for leaked keys.
   - Against: AC27's "under 10 minutes".
   - Separately: the notes have no route to re-subscribe when the browser still holds the dead subscription, since "Show the value again" re-shows it.

9. **Note. AC14's notifications case is weaker than the spec's case.**
   - Where: `tests/desk/notify-j20-desk.test.mjs:189-230` runs 2 projects, not AC14's 5, and 282 head changes, not 288.
   - The per-head-cache assertion does catch a missing cache, but the "day under 10,000" check is trivial at 2,072 calls, against the spec's 5,788 for the 5-project day.

**Checked and found consistent:**
- AC75's manifest, both links, the control's states, the subscribing paths and `sw.js`'s origin check;
- J7's checks;
- AC52's Deploys count: the key uses the run's id, the same as the sender's;
- J1's "Notifications: <conclusion>" activity;
- held and being-recorded questions left out of the count, the pill, the Queue and "Quiet";
- the end-line, 8-hour and "Answer it here instead" rules, which match the sender's `questionHold`;
- the closed read's drafts, paging and fourth-page failure, the single read, and `desk-asking-v1` pruning;
- the four outcomes of the tap re-read, apart from finding 1.

**Open questions**
- Finding 4: should a found closed pull request's file read be retried at the next poll, like the closed read?
- Finding 5: should the A3 and AC14 arithmetic count returns to the foreground?
- Finding 6: is the spec's device-memory claim to be amended?
