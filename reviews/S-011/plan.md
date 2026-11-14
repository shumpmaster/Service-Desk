Verdict: FAIL

I checked the spec against the plan, both experiment registrations, stop-4.md, the library files it cites and docs/PROJECT.md. Revision 2 does fix the earlier findings 1, 3, 4 and 5. Two new defects block the freeze, and one criterion cannot be locked as written.

**Blocking findings**

1. **AC23's "always notified" guarantee is false for a late-visible step.**
   - J5 (specs/S-011.md:112) sends an entry only if its `due_at` or `changed_at` falls in the run's window.
   - AC23 (:62) allows only two exceptions, (a) and (b), and says "Outside these two… always notified".
   - `due_at` comes from a record's time, and that time can be earlier than the run that first sees the record. J1 (:102) and AC6 (:40) both say commit times are set by whoever commits, and the decision-card due time comes from notes reaching main (the S-009 rule, per E1 :20).
   - A step whose `due_at` is already before the window when the run first reads it falls in no window. It is never sent, and neither exception covers it.
   - This is a third unlisted path, so a locked check built from AC23 is unsound.
   - It is not one of the counted misses in AC41 (:91) either. AC41 would list it as a miss, but AC23 claims it cannot happen.
   - Fix: define the window by when the route first saw the entry, not by `due_at`. Or add this case as an exception counted by AC41.

2. **AC37 and J10 need files that "Areas touched" does not list.**
   - AC37 (:73) requires the widget's copy to be "regenerated in the same pull request".
   - docs/PROJECT.md:593 says that copy "lives in its own folder under src/, outside src/public/".
   - Areas touched (:141) are src/lib/**, src/public/**, src/tools/**, tests/desk/** and docs/handover/P-005/**. The widget folder is not among them.
   - The Out of scope line (:204) excludes "everything else". As written, the Builder must either break AC37 or leave scope, and the spec's own stop rule (:145) calls that a stop.
   - Fix: name the widget copy's path in Areas touched. Or say it is not needed and why.

**Further findings**

3. **AC17 cannot be locked.**
   - The widths 360 and 414 are only the definer's proposal (:53, open question 1).
   - A check author cannot write a locked check for a criterion whose figure is open.
   - Either the owner sets the widths before freeze, or AC17 is marked as not yet checkable.
   - The Docs show 360 and 414 as the sizes in the build screenshots under docs/design/builds/. Citing those would fix the sourcing, but the owner still has to set the widths.

4. **AC25 is conditional on a Design test that has not run.** Its condition is "when the owner's phone allows… (tested in Design)" (:64). Until that test runs, a check can only cover the "otherwise" branch. The spec should say so, or state which branch a locked check covers.

5. **The registrations still name S-010.** E1:3 and E2:3 say `spec: specs/S-010.md`. The spec says so openly (open question 3). AC46's result file path matches E2:19, so that citation is now sound. But M6's acceptance rests on a registration that points at a superseded spec. The re-point must happen before the freeze, not after.

6. **The E1 and AC40 proxy rule differs slightly.**
   - E1:28 says the proxy is decided "from who made the ending record".
   - AC40 (:88) says it is decided by a `Proxy:` line in the ending record.
   - The `Proxy:` line is real (decisions/P-005/stop-4.md:2). But AC40's test does not cover a proxy action that has no such line.
   - AC40 is the stronger, testable form. J11 should say that it replaces E1's wording.

**Verified and sound**

- The header's `milestones: M6, M7, M8` matches plan lines 72–74, and each milestone line has a why.
- The six owner answers are written in as stop-4.md gives them.
- All the library facts and patterns I sampled exist: F-gh-12, F-gh-12b, F-gh-env-01, F-cf-02, the P-feed and P-repeat patterns, and others.
- docs/PROJECT.md:588 and :593 say what the spec cites them for.
- The join-up review section is present and rates its open items honestly.
- The section on how this spec reads M8 states its narrowing openly.

**Open questions**

- Does the owner accept the narrowed reading of M8? It leaves out any promised minutes, and it counts misses that fall before a fallback window instead of preventing them. Answer 2 in the plan reads "any single thing that needs me". Open question 2 must be answered before freeze, or the spec is revised.
- Which route notices a step that is already old the first time it is seen (finding 1)?
- Where does the widget copy live, and who approves a change there?