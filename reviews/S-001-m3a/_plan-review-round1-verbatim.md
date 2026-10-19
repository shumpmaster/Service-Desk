Verdict: FAIL

**For the owner:** The Work ahead plan is close, but it can't be built as written. There are four problems:
- **Finished milestones break the rough finish.** Once a milestone's work is done, your Chief of Staff gives it "no time left". Under the spec's rules that estimate counts as overdue the very next day. The two finished design milestones will probably wait for your acceptance until the rest of the design work is done. So from the second day the whole rough-finish card would read "not available", unless your Chief of Staff sends you a fresh estimate for each of them every day, each one a merge and a phone notification for you.
- **Estimates could be counted twice.** The spec defines an estimate as "days from today until the milestone is reached", but the screen adds the estimates one after another. Following the definition, a later milestone's estimate would already include the work ahead of it, and the screen would add that work again.
- **One planned test can't pass.** It checks that the screen never says "target" or "late", but one of your own milestones is called "The desk's value targets shown".
- **The test data would publish private files.** It says to copy files from your private operating-model project into this public repository, which can't be undone.

All four are wording fixes in the plan. None of your rulings needs to change, and nothing has been built.

**Findings**

1. **Blocking: estimates for under-way milestones expire after their top figure, and a "no time left" estimate expires the next day.** Where: AC24's rough finish, steps 2, 4, 5 and 6 (specs/S-001.md:5750–5776); J14's stale rule (:7535–7541); AC24's test (:5860–5875); CS21 (:8817–8825); AC44 steps 4 and 7 (:2092–2106).
   - Failure case: MD1 and MD2 are under way, each with a "0 to 0 days" line dated 18 Oct. On 20 Oct the days since the estimate are 2, so the high figure left is 0 − 2 = −2, which is below 0. That makes the estimate "past its estimate" and it counts as none. Step 4 then turns MD3 to M3C, and the card, into "not available". MD1 and MD2 most likely wait for the owner's acceptance of all of MD, after MD3.
   - So the spec's own worked example ("on 20 Oct … its finish still 21 Oct – 23 Oct") is false under its own steps. The same goes for the test's "under-way case on 20 Oct" and "two renders a day apart … only the dates change".
   - The time-zone test cannot be built as worded either. At 2026-10-18T03:30Z it is 17 Oct in Chicago. An estimate line timed 18 Oct UTC after 03:30Z is "later than the page's clock", so J14 rejects it as malformed. One dated 18 Oct in Chicago gives a negative day count, which the spec never defines.
   - Fix: make a "no work left" line hold until the milestone is reached. Define what happens when the estimate's date is after today, or pin the fixture's times. Then rewrite the example and the test cases.

2. **Blocking: J14 defines the days in a way the rough finish can't add up.** Where: J14 (:7491–7494) says `low_days`/`high_days` are "the calendar days, counted from the estimate's date, until the milestone is expected reached". AC24 step 3 instead adds a not-yet-started milestone's figures after every row before it.
   - Failure case: following J14, the Chief of Staff estimates M3C as about 10 to 19 days from today, because that includes MD3 to M3B. The screen then adds MD3 to M3B again, so the finish lands about twice as late as it should.
   - The mockup says "days of work" (docs/design/mockups/work-ahead.html:148–166). The model change's add-only check, which this spec writes "for the model's spec to quote", would carry the same contradiction.
   - Fix: define the figures as the milestone's own length once work on it starts, counted from the estimate's date only while it is under way.

3. **Blocking: the "never a deadline" test fails on its own fixture.** Where: AC24's test (:5866–5868).
   - Section 3 at 77bfeae, which every row shows, includes M3B "The desk's value targets shown" and its "done when", "each value target".
   - AC24's own fixed words "Your latest plan can't be read" contain the letters "late".
   - The spec doesn't say whether the check matches parts of words or whole words, or whether it covers record text or only the desk's own words. Fix: limit it to the desk's own fixed words, matched as whole words.

4. **Blocking: the test data would put a private repository's files into a public one.** Where: AC24's test (:5850–5851) uses "Personal-Org-Operating-Model's sprint files at 90f53e3 (real)", and Areas touched (:8796) says to list each real one with its commit.
   - Checked: Personal-Org-Operating-Model's visibility is `private` and Service-Desk's is `public`.
   - tests/desk/fixtures/README.md:33–36 says its files are NOT copied, and AC73's test uses poom/'s placeholder form.
   - Copying the files can't be undone. The placeholder tests/desk/fixtures/poom/docs/sprints/m1.4-v3-build.md already holds the title and status lines that match 90f53e3. Fix: say "poom/'s placeholder form, the title and status lines as at 90f53e3".

5. **Note: Work ahead and Status would show different marks for M3A once its work is filed.** Where: AC24's states (:5708–5712) against AC57 rule 3 (:3664–3669).
   - M3A belongs to Build i2, a phase run still to come. AC57 gives a milestone there an empty ring. AC24 gives "AC57's half-filled circle, work under way".
   - Because M3A is built now, before MD3, its plan line will list its pull request while the owner tries it on the preview. AC24 claims its marks are "those J11 and AC57 already give", so the Builder has to guess. Fix: say which mark it gets, and keep "under way" for the arithmetic.

6. **Note: some places the "build now" ruling affects aren't updated.**
   - AC44's last line (:2106), "M3's new views (AC24, AC25) are then built in the chosen design", is not noted in place.
   - The brief's "Then MD3's remaining work and M3 as below" (:10280) reads as MD3 before M3A. It conflicts with "It does not wait on MD3" (:10285).
   - The edited aside in notifications' list (:798) is not in "Changed in place". It is harmless.
   - Apart from these, the change touches only what it names.

7. **Note: in the meantime, merged estimate pull requests show on the Timeline as work.** Until the model change syncs, the owner merges each one, and J12/AC60 place it by its `Milestone:` line. The owner ruled the job's records-only merges off the Timeline (P-001-asks-merge-on-desk.md, B). After the sync the job's merges drop off on their own; before it they don't. CS20 and CS21 should name the estimate pull requests' `Milestone:` line, for example `none (…)`, or say they will show. Finding 1 would make them daily.

8. **Note: the sync's order isn't pinned.**
   - The job's fifth kind is in governance/, the Orchestrator's lane. J16's fifth kind is in src/notify/, the Builder's lane. They can't land in one commit, and J16's test compares its kinds with the job's classify on the real code, so the two changes must land together.
   - If the job's change lands first, an estimate pull request notifies and is then merged minutes later, against ruling A on notifications (P-001-notify-job-merges.md).
   - Pin J16 first or both together. Also say which "base" check rule 2 compares against: the merge base, or the default branch's tip at merge time.

9. **Note: the MD3 hand-off contradicts AC24's own test.** AC24's test asserts that plain `/` has no Work ahead (:5876–5878). AC24 says MD3's pull request runs the same test against `/` (:5666–5668). Say that this case is retired or reversed at MD3.

10. **Note: the source of the test data isn't fully named.** AC24 names only docs/PROJECT.md at 77bfeae. But "next to reach" (MD3) and the current run (Design i2) come from J11's full set of records and the model's timeline. tests/desk/fixtures/j11-3117150/ holds those at 3117150, with a different section 3. Name the set, for example a 77bfeae copy with its trace-notes oracle, labelled.

11. **Note: gaps in the tests.**
    - Not tested: the "Dropped · <n>" fold; the "draft not kept on this device" words; the gold edge and "moved" accessible text on a moved row; the note clipped to two lines.
    - Name the 1 Nov 2026 daylight-saving change, which falls inside the worked example's ranges (27 Oct – 3 Nov and 29 Oct – 6 Nov).
    - Step 5 makes an under-way milestone read "when you accept it" on the last day of its range, though its estimate isn't "no work left". Decide those words.
    - A device whose clock runs a few minutes slow will reject a just-made line as "time later than the page's clock".

12. **Note: some wording differs from the mockup without being listed.** The mockup says "once you accept it"; the spec says "when you accept it". The spec calls "From your Chief of Staff's estimates…" "the mockup's words", but the mockup says "From the estimates below…". Neither is listed under "Where the build differs".

**What held up when checked**
- **Rulings:** all eight are quoted word for word from their records. The audit lines :164–176 match.
- **Code citations:** v3_checks.py:149 and :2051–2053, orchestrator.py:86, asks_merge.py:27–38, LEDGER.md:239 (L-0017) and surface_guard.py:320–322 all match.
- **Records:** section 3 is unchanged from 77bfeae to HEAD, and the trace places MD1–MD3 in Design i2, M3A and M3B in Build i2, and M3C in Launch i1. At 90f53e3 only m1.4 is open, with that title. The mockup line citations match 781e828.
- **Request counts:** A3's three extra blobs fit within one blob call's budget of 25, so AC14's total is unchanged.
- **Notifications:** in the meantime an estimate pull request is not one the job merges. So it waits on the owner and notifies from when it opens (J16, AC73, AC74), as the spec says.
- **Config:** projects.json has one `planning: true` entry, and owner commits go straight to main (`webCommitsToDefault: true`).
- **Governance checks:** `check_all.sh . origin/main` passes everything except `record_checks merges`. That check flags the branch's own Orchestrator commits, including the new e7cbd5e and 1e3eac5. A similar orch/ pull request (#120) passed governance in CI, so I don't count it as a finding against the spec.

**Open question:** on finding 1, how long should a "no work left" estimate hold for a milestone that waits on the owner's acceptance of a group: until it is reached, or a set number of days?

Files: /home/user/sd-orch-m3a/specs/S-001.md, /home/user/sd-orch-m3a/docs/design/mockups/work-ahead.html, /home/user/sd-orch-m3a/tests/desk/fixtures/README.md, /home/user/sd-orch-m3a/tests/desk/fixtures/poom/docs/sprints/m1.4-v3-build.md
