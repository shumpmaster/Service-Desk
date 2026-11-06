# EXP-007 registration — the Critic's round 2, verbatim

Read: experiments/EXP-007-widget-refresh.md at 514675d (build/definer/p004-widget-exp), with the
test widget at b2b1711 (build/builder/p004-test-widget). Round 2 of at most 3 (D-044). Recorded by
the orchestrator, session session_01QBwHGNFKViyibzxHx5qTtm, 2026-11-04.

---

Verdict: FAIL

Round 2 of 3 (D-044). I read Draft 3 at 514675d and the widget at b2b1711 (entry.js, glue.js, judge.mjs, snapshot.js, fakes.mjs, test.mjs), plus src/lib/github.js lines 222–329. I did not run the suite. Findings 1 and 2 come from reading the code, and the Builder should confirm them with a test.

## Round 1 findings
- 1, the "inconclusive" reading: **answered.** That bucket is gone. "Not judged" is not a pass (Deciding threshold).
- 2, the hand check: **answered.** "There is no hand check."
- 3, what counts as a later refresh: **answered.** Kind `later` means run as the widget with `cacheComplete: true`. Partial saves write `complete: false` (entry.js:72–73, 229), so a killed refresh makes the next one `first`.
- 4, the Home tile wording: **answered** (lines 57–63). The gate-case part is still owed by the Chief of Staff.
- 5, memory: **answered.** Nothing changes in the registration; the gate case must still say memory could not be measured.
- 6, exclusions: **answered** (lines 173–178).
- 7, the owner's time: **answered** (runner line).
- 8, the owner's steps: **answered.** "Do not open a pull request", the deleted-branch sha note is in, and the iCloud Drive step is dropped. But see finding 7: the sha note is no longer harmless.
- 9, data and the freeze condition: **answered** (lines 152–153, 211–213). Finding 7 adds a new data problem.

## New findings

1. **Blocking: "not modified" (304) answers are not saved, so busy-stretch later refreshes will probably be "not judged".**
   - Method 6 says the widget saves "every GitHub response a clone cannot rebuild". It doesn't for 304s.
   - snapshot.js:39 stores a 304 with no body (`h = null`) unless the same address already got a 200 earlier in that refresh.
   - judge.mjs:107–115 then lists it as missing, so the project is `not judged`.
   - On a later refresh where the branch has moved, the desk asks for the open pull request list and the workflow runs with saved ETags (github.js:236–238, 317, 329). GitHub answers 304 when they haven't changed, which is the usual case for Service-Desk's pull requests.
   - The tests don't cover this. Their later refreshes hit an unchanged branch and stop early (test.mjs:242, 323–341).
   - Likely result: not judged, run again, not judged again, and the route goes back to the owner even though nothing failed. That spends two owner days and ends on a false trigger.
   - Route: Builder (code), then Definer (Method 6's claim).

2. **Blocking: the judge does not start each replay from the phone's kept data, and fills gaps with other refreshes' answers.**
   - judge.mjs:156 builds the kept data once and never resets it when a `start` logs `cache: false` (iOS emptied the Caches folder, or "Clear kept data" was used).
   - judge.mjs:162 skips killed refreshes. But the phone saved their partial kept data (entry.js:229) and never saved their snapshot (entry.js:239 runs only after the refresh ends). So the refresh after a kill starts from kept data the judge cannot rebuild.
   - Method 4's expected path is exactly this: widget first refreshes get killed, then the owner runs one in the app.
   - When the judge's state drifts like this, judge.mjs:112 serves "the latest earlier answer for the same address" and :110 repeats a refresh's last answer. Both contradict Method 8: "replaying the exact GitHub responses that refresh saved", with not judged when "a needed response [is] not in the snapshot".
   - This can produce a `match` built from answers that refresh never received, which loosens "correct every time". It can also produce a false `mismatch`, which is a false fail.
   - The registration must set a rule before the run, for example: a refresh whose starting kept data the judge cannot reproduce is not judged. The code must follow it.
   - Route: Definer (rule), Builder (code).

3. **Blocking: "not read" is undefined, and a read the driver stopped before it finished is not covered.**
   - Deciding threshold: 'a project "not read", with no exclusion explaining it'.
   - The log's `shape.read` can be `ok`, `cant-read` or `checking` (glue.js:299). The registration doesn't say which of these is "not read".
   - The shared driver can stop with a project still reading (`MAX_POLLS` 12, `MAX_STEPS` 400, glue.js:23–24, 248). The judge runs the same glue, so it repeats the stop and reports `match`.
   - So, as written, a partly read summary can count as correct, decided after the data are seen (D-047).
   - The registration must name the logged value for "not read" and say whether `checking` is a correct summary.
   - Route: Definer.

4. **Non-blocking: the independence statement (question 3b).**
   - The statement is accurate and disclosed: "fed the same GitHub answers through the same small adapter (glue.js) the widget uses".
   - Because the judge shares glue.js, a fault in it is the same on both sides and still matches. That covers its copied validators (glue.js:33–121), its stop rule and its summary code.
   - "Cross-checked … for projects with no pull requests" leaves out Service-Desk's usual case.
   - "The Reviewer reads glue.js as part of the judging" sets no rule for what a problem found there decides.
   - So the plan's comparison, "the desk's own code run on the records as they stood then", holds for src/lib only. Once findings 1–3 are fixed, the design keeps "correct every time" in substance, with this limit.
   - Route: Definer (what the glue.js reading can decide). Chief of Staff: the gate case must say this limit plainly.

5. **Non-blocking: the clock window (question 3a) does not loosen the pass mark in substance.**
   - It covers only the refresh's own logged span (judge.mjs:212–218) and only the state words. The phone itself works out the state at the real time plus the skip.
   - But a project's four fields can match in different replays: waiting, first and headline at the start, state at another minute (judge.mjs:232–233). No single replay is then shown to give the phone's whole summary.
   - The registration should say this is allowed, or require all four fields to match at one time.
   - Route: Definer.

6. **Non-blocking: the branch sha logged after a failed read (b2b1711).**
   - The Measure line, "for each of the four repositories, the default-branch commit sha it read", literally covers it. It doesn't say the sha may come from a read that then failed.
   - It also doesn't say that only the last branch read in a refresh is logged (entry.js:150 overwrites).
   - The judge serves every branch read in that refresh from one sha (fakes.mjs:81). If the branch moves mid-refresh in a busy stretch, the replay shows a head order the phone never saw, which gives a false mismatch or not judged.
   - Route: Definer (wording), Builder (log each head read, or mark when the head changed).

7. **Blocking, needs an owner ruling: the route for the test data puts project content where the ruling doesn't reach.**
   - Method 6: "This file holds project content, which is why it stays out of the backed-up Documents folder."
   - Method 7 then says: "Save to Files (On My iPhone)".
     - Files saved On My iPhone are in the phone's iCloud backup. That is the "Not ruled" point (P-004-widget-why-and-data.md, line 21).
     - The Files picker can default to iCloud Drive, which "nothing synced to iCloud" forbids.
     - No step deletes the saved file afterwards.
   - The file is then committed to a Service-Desk branch. Content from Personal-Org-Operating-Model, Model-Lab and portfolio would then sit in another repository, readable by whoever can read Service-Desk.
   - Line 116's "can still be fetched by their sha" now applies to project content. My round 1 called that harmless only because the log held no content.
   - The owner should rule on this before the freeze, or the route must change. The pre-freeze Reviewer check (lines 211–213) should also cover the shared file.
   - Route: Definer (route), Chief of Staff (owner question).

8. **Non-blocking: the refresh kinds (question 4) are set before the run.**
   - One gap: entry.js:259 logs `widget` for any run not in the app (`cfg.runsInWidget || !cfg.runsInApp`), for example a Shortcuts run. The registration says "run as the widget". It should say what the log's `context` means.
   - Route: Definer.

No finding implicates an earlier check of mine (D-050).

Files read:
- /home/user/sd-wt-definer/experiments/EXP-007-widget-refresh.md
- /home/user/Service-Desk/reviews/EXP-007/_critic-r1-verbatim.md
- /home/user/sd-wt-builder/src/widget-test/judge.mjs, entry.js, glue.js, snapshot.js, fakes.mjs, test.mjs (lines 240–370)
- /home/user/sd-wt-builder/src/lib/github.js (lines 222–329, ETag lines)
- /home/user/Service-Desk/decisions/questions/P-004-widget-why-and-data.md
- /home/user/Service-Desk/docs/PROJECT.md (line 650)
