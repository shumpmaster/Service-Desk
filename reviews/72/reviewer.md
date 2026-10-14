Verdict: PASS
Reviewed: 74df6c3 (build/builder/md-sandbox; fix commits 311e644 and 74df6c3 on top of 6eeae15)

All three round-1 blocking findings (B1–B3) and the two notes in scope (N3, N4) are fixed. Your "Graduated" decision is consistent with the spec, and I found nothing the changes break. I edited nothing in the repository.

## Round-1 findings
**B1 (the owner's Rulings group showed a count over "none yet"): fixed.**
- The page now draws "none yet" only when the count is 0 (src/public/sandbox.js:578). With a count above 0 and no latest record, it draws the group's reason, or "latest: not recorded".
- Rulings now has its own builder (src/lib/sandbox.js:926, `rulingsGroup`). It takes the newest ruling by the oldest commit of its answer file (J2's history read, as AC20 does), and otherwise shows "latest: not recorded (no commit time read for the ruling files yet)".
- In Chromium on the 3117150 records, it now reads "Rulings 27 · latest: decisions/questions/P-001-acting-route.md, Oct 6 05:00". "none yet" appears only next to a count of 0.
- The new test (md-sandbox.test.mjs, "AC49 (review B1)") checks the text drawn under every group, so it tests the behaviour.

**B2 ("Graduated" on screen): fixed.**
- `deskWords` (src/lib/sandbox.js:31) is applied to the model's milestone names in all three places the sandbox draws them (lines 216, 732, 860).
- A crawl of every route on the real 3117150 records finds no "Graduated" anywhere in the drawn text, including closed lists. Launch-5 reads "Done" on Status and on Timeline Launch-i1.
- The new tests crawl the fixture's routes in the fake DOM: text, attributes and markdown output. A second test checks that a question whose own text says "Graduated" is quoted unchanged, while the milestone label still reads "Done".

**B3 (the AC42 test failed on a depth-1 clone): fixed.**
- The test now compares against tests/desk/fixtures/accepted-m2/_headers and index.html. I checked both are byte-identical to `git show 33d390a:src/public/<file>`.
- A depth-1 clone passes all 231 tests.

**N3 (the 360 px test checked only the CSS): improved, as far as a test without a browser can go.**
- It no longer leans on `overflow-x: hidden`. It now checks: no fixed width over 360 px, nothing that stops text wrapping except the 1 px hidden label, no wide grid columns, and that each screen of the H5 extremes is drawn inside a container that wraps.
- The real measurement is still the Chromium check. Mine is below and is clean.

**N4 ("Time so far" when the start is later than the device's clock): fixed.** It now shows "–" with "not available: the start is later than this device's clock" (src/lib/sandbox.js:1046), and a test covers it.

## Your "Graduated" decision
It holds. AC50 says the model's own word stays "Graduated" in its records and the desk only translates it. Changing a record's text would make the desk's quotes wrong, which breaks AC51's and AC49's "a quote from the record".
- The only "Graduated" left in the code is the model's milestone table, and it goes through `deskWords`.
- `gradPath` (src/lib/sandbox.js:174) is a file path, not a label.
- Showing Launch-5 as "Done" fits AC50's "Done only ever means the whole project", because Launch-5 is the project's graduation mark.

## Nothing broken
- The fixes touch only src/lib/sandbox.js (src/public/lib/sandbox.js is the same file), src/public/sandbox.js and tests. They add tests and edit no M1 or M2 test.
- app.js, model.js, records.js and scheduler.js are untouched since round 1, so my round-1 check that the plain view is byte-identical still applies.
- sandbox.css is unchanged.

## Non-blocking note
- The B1 test accepts either "latest: decisions/questions/Alpha-old.md, …" or "latest: not recorded (…" for Rulings. So it doesn't pin which one the history read gives. The browser run shows the record-backed form on real data.

## What I ran (on 74df6c3)
- Full clone, `npm --prefix src test`: tests 231, pass 231, fail 0.
- Depth-1 clone (`git clone --depth 1 --branch build/builder/md-sandbox file:///home/user/sd-md-sandbox …`), `npm --prefix src test`: tests 231, pass 231, fail 0.
- `npm --prefix src run build`: "build: PASS (2 connected projects; 16 page modules in step)".
- `python3 governance/checks/surface_guard.py diff --range 33d390a..HEAD --branch build/builder/md-sandbox`: "OK: 4 commit(s) in 33d390a..HEAD checked (0 merge(s) skipped, 0 exempt, 0 human)", exit code 0.
- Both new commits are by builder <builder@agents.invalid>, with the `Agent-Session: session_012RJPVKAoLga2RkqLYRDcBY` and `Spec: S-001` trailers, and no model names or co-author lines.
- Chromium at 360×740, light and dark, with reduced motion, following every `#/` link:
  - H5 extremes: 152 routes.
  - Real Service-Desk records at 3117150, plus a pull request whose title holds script tags and a pull request from a fork: 266 routes.
  - Both: no element past the viewport, no sideways scroll, no console or page errors, no dialog raised by the script-tag title, no request to another origin, and no href other than github.com or the desk's own.

The scratch scripts are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/br/ (run.mjs, run3.mjs, data.mjs).
