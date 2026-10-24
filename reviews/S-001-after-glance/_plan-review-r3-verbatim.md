# S-001 after the glance audit: the plan Reviewer's round 3, verbatim

Dispatched by the orchestrator on 2026-10-24 against build/definer/glance-plan at 878caf9.

---

Verdict: PASS

**Plain summary.** Draft 3 fixes both of round 2's blocking points, and all the repo checks pass.
- **The counts:** a finished phase whose recordable milestones were all reached now reads "all of all". Discovery on the committed records reads "4 of 4 reached" with or without the "taken on" lines; draft 2 gave "4 of 8".
- **Phases still running read honestly:** they count taken-on milestones as still to do only where the model can record them.
- **The fixtures:** every one is now named from records that exist and give the states the spec describes.
- **The six notes (N-a to N-f):** each is fixed, and the code references hold.

I found three small gaps. None of them blocks; they are listed below as risks to carry.

**Checks run (/home/user/sd-definer at 878caf9; clean worktree before and after)**
- `bash governance/checks/check_all.sh . 2d0edb0`: every line PASS, "OK: all governance checks passed.", exit 0.
- `python3 governance/checks/surface_guard.py diff --range 2d0edb0..878caf9 --branch build/definer/glance-plan`: "OK: 3 commit(s) in 2d0edb0..878caf9 checked", exit 0.
  - All three commits are by `definer <definer@agents.invalid>`, with `Agent-Session:` and `Spec: S-001` trailers.
  - Only specs/S-001.md changed.
- `cd src && npm test`: 1154 tests, 1154 pass, 0 fail, exit 0.
- **Inline node reproduction (no file written).**
  - **How it was built:** `j11Records`, `timelineOf`, `phaseView` and `runsContext` on j11-77bfeae (wa-fixtures.mjs's `SD` and `j77Files`), built the way `ctxOf` in ac83-page.test.mjs builds it, plus the same records with that file's `ALL_24`.
  - **What it applied:** classes 1 to 6 exactly as S-001:8755-8775 words them, with T and R as :8776, and k, o, q, j and e as :8782-8784.
  - **One difference from the tests:** my run used the Europe/London time zone, not the tests' America/Chicago. The counts don't depend on it.
  - **Results:**

| Phase | As committed | With `ALL_24` |
|---|---|---|
| Discovery (finished) | 4 of 4 · k4 q4 | 4 of 4 · k4 o4 (Discovery-1, -3, -4, -6 in class 5) |
| Design (run 2 now) | 1 of 5 · k2 q4 | 1 of 6 · k3 o2 j1 |
| Build (run 2 to come) | 3 of 5 · k0 q5 | 3 of 8 · k3 o1 j1 (Build-1 to -3 in class 4: taken on, recordable, still to come, so honestly still to do) |
| Launch (to come) | 0 of 1 · q5 | 0 of 2 · k1 (Launch-3) o4 (Launch-1, -2, -4, -5) |

  - **Against the spec's examples (:8825-8827):** the committed figures match exactly: Build "3 of 5 · none tracked (5)", Discovery "4 tracked · 4 not tracked".
  - **`text`'s Launch line:** today's `detailWords` gives "Yours: M3C · Standard: 0 of 5, not recorded yet", as :8417 says. Discovery reads "4 of 8 reached" today, which is the owner's complaint.
- **The cited lines all match:**
  - timeline.js:44-45 is `NOT_RECORDED_IDS`;
  - :331 is Launch-4's `'not-recorded'`;
  - :337 is `stateOf`'s "not recorded" for those ids;
  - :349 is Discovery-3 with `!groundwork.size`; `j.groundwork` is `[]` on j11-77bfeae.

**Blocking findings**
None.

**Round 2's blocking points, confirmed fixed**
- **R2-B1, the count:**
  - **The fix:** class 5 (:8767-8773) takes "taken on" milestones out of T. These are the ones the model can't record, plus those in a finished phase with no state recorded.
  - **The claim holds:** :8776-8781 says a finished phase reads "<T> of <T>", and the run above confirms it.
  - **The per-run count follows:** (d)'s h (:8833-8837) agrees with (c)'s k. Design's run 2 gives h = 3 (Design-1, -4 and -6), which equals k = 3.
  - **The tests cover it:** (c)'s test list (:8906-8910) adds "4 of 4" with `ALL_24`, plus class-4 and class-5 cases.
- **R2-B2, the fixtures:**
  - **`text`** is j11-77bfeae as committed.
  - **`mix`** adds `poomFiles()`/poom/ and a made-up project with one card of each kind (the pattern ac85/ uses). F1 and F2 are a made-up later Launch run.
    - A Launch item run can record Launch-3 "not reached": `logPart` 'none' with no handover file (timeline.js:351-352).
    - The tests already make made-up run-2 records, as ac83's "a run 2 with a recorded reason" does.
  - **`unread` and signed-out** use fake-desk.mjs's `fail` reads.
  - **`ext`** is md-extremes/; **`stall`** uses made-up times.
  - **The ac62 snapshot** is now named as no source (:8426).

**The six notes, confirmed fixed**
- **N-a, the red list:**
  - the since-list ✕ is named red (:8683-8685; home.js:308 `icon: 'bad'`; css:750);
  - "Can't show this" (sandbox.js:1001, :4452, :4472, :4482) and the `.v2-mark` lines (:1056, :2764) stay as built. No `.v2-small.bad`, `.v2-mark .v2-k.bad` or bare `.bad` rule exists;
  - test (a) checks that they stay not red (:8896-8897);
  - the dead rules (css:617, :188) are noted.
- **N-b, the tile with no time:**
  - the corner and foot cover every case, including "✕ Can't read: <reason>" where no time is held (:8474-8479), against sandbox.js:872;
  - the can't-draw tile's words match `drawError` ("Can't show this project: …", sandbox.js:4404, :938).
- **N-c, today's time:** "09:30" stays (:8599-8601), and ac55-status.test.mjs:37-49 stands. G4's row now says "kept" (S-001:2578-2579).
- **N-d, the CI line:**
  - y counts `NOT_FAILING` runs (records.js:831), and z counts the running ones;
  - `reduceChecks` (records.js:851-858) gives "passing" only when every counted run has completed and is not failing, so "passing" can't stand beside a lower count;
  - the test list adds skipped and cancelled cases.
- **N-e, w:** defined at :8790-8794.
- **N-f, the class order:** its two cases are put to the owner as question 4 (f) and (i).

**Non-blocking notes (carry as risks)**
- **R3-a. "Finished" vs "a run now or still to come" leaves a gap.**
  - **The gap:** a run's state can also be "not recorded" (feed.js:70; projectpage.js:268 when there is no now run). In a phase whose runs are all "not recorded", a taken-on recordable milestone fits neither class 4 nor class 5, so it falls to class 6 ("not tracked").
  - **What the owner would see:** its row would still read "taken on" (projectpage.js:233). The count and the row would then disagree.
  - **How rare:** rare, and absent from every committed fixture.
  - **Suggestion:** the Builder treats a phase that is neither finished nor has a run now or to come as class 4 or class 5, and names the choice in G5's pull request.
- **R3-b. (d) names class 5 only as "the model can't record".** Class 5 also takes recordable "taken on" milestones in a finished phase. In an earlier run gone back over, such a row is outside h and not folded; the spec doesn't say which words it shows: "taken on", as built, or "taken on · not recorded by the model". Either reads honestly. G6 should pick one and test it.
- **R3-c. Minor citation.** "the groundwork map is read from intake/requests/Q-*.toml, :10": the comment saying so runs over timeline.js:9-10, and the set itself is built at :127.

**Open questions**
None new. Question 4 (e) to (i), on the owner's side, still covers the readings marked C.

Files:
- /home/user/sd-definer/specs/S-001.md
- /home/user/sd-definer/src/lib/timeline.js
- /home/user/sd-definer/src/lib/projectpage.js
- /home/user/sd-definer/src/lib/records.js
- /home/user/sd-definer/src/lib/home.js
- /home/user/sd-definer/src/public/sandbox.js
- /home/user/sd-definer/src/public/sandbox.css
- /home/user/sd-definer/tests/desk/ac83-page.test.mjs
- /home/user/sd-definer/tests/desk/wa-fixtures.mjs
- /home/user/sd-definer/tests/desk/ac55-status.test.mjs
