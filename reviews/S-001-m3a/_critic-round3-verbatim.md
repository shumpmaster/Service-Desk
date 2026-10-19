Verdict: PASS with notes

**For the owner.** Draft 4 fixes all three points from my last check. The build instructions now keep your private project's files out of this public repository, and they list the whole "planning" settings rule. Your Chief of Staff is told not to use deadline words such as "due" in its estimate notes. The new rule keeping your estimate merges off the Timeline is sound. It works exactly like the rule that already keeps the automatic job's merges off, and it needs no new request to GitHub. Nothing here blocks the build. One small gap remains. On the Queue's "Done today" list, an estimate you merged would read "sprint: not recorded" instead of saying it is off the Timeline on purpose. Two minor points about the GitHub read are below.

I read /home/user/sd-orch-m3a/specs/S-001.md at the tip. Line numbers below are from that file.

**Round 2 findings**

- A, the brief said to use your private project's sprint files as real records: **fixed**. The brief now names placeholders only, matching AC24's test (:10455-10459).
- B, the brief listed only part of J7's `planning` rule: **fixed**. It now lists the whole rule (:10444-10446). Draft 4 also allows `planning: false` on a v2.5 entry (J7 :6814-6817), which avoids failing on the real config. The test covers it (:6842-6844).
- C, two small gaps: **fixed**.
  - The add-only check now allows the same 10 minutes of clock skew as the desk (:7689-7691).
  - CS21 now bans deadline words in estimate notes (:8935-8937).

**AC60's exception and J12's new read**

- **It matches the job-merge exception.** An estimate merge is kept off by the same three rules: it is not placed by its `Milestone:` line, not under "Not tied to a milestone", and gives its run no time. It has the same plan-wins exception and the same "not yet read" fallback (:4085-4093 against :4062-4084). The test covers the yes case, a second changed path, a different `Milestone:` line and an unread merge (:4196-4201). J14 (:7702-7705), CS20 (:8916-8919) and CS21 (:8933-8934) all say an estimate pull request changes only `intake/estimates.jsonl` and carries `Milestone: none (a rough estimate)`. Splitting CS20 makes the first estimate pull request estimate-only, and the later-work pull request goes under "Not tied to a milestone" on purpose (:8920-8921).
- **The read token can read it.** A pull request's changed files are readable with "Pull requests: read", and Setup G1 already grants that, along with Contents read (:7371-7372). Service-Desk is public in any case. The agents cannot reach GraphQL to confirm it, the same limit J12 already states for the check rollup. That is why the fixture is made up and labelled so (:7440-7444).
- **The request count is unchanged.** The two fields ride J12's existing query, so no REST request or function call is added, and A3 and AC14 still hold. GraphQL points do rise; see note 2.
- **The kept list's key moves to `desk-pulls-v3`.** `desk-pulls-v2` is removed on load, and an entry missing the field counts as unread (:7287-7291). The test covers it (:7443-7444).

**Notes (none blocking)**

1. **"Done today" was not extended to estimate pull requests** (AC66 :4555-4563).
   - Problem: AC66 handles only the job's merges ("not on the Timeline: merged by the automatic job"). An estimate the owner merges before the model sync falls to the general case, which reads "sprint: not recorded". The rule's change list (:1323-1324) does not name AC66.
   - Why it matters: it is a little misleading, since it suggests a missing record rather than an estimate left off on purpose.
   - Fix (Definer): give it "not on the Timeline: a rough estimate", add a case to AC66's test, and add AC66 to the change list.
2. **Two small gaps in J12.**
   - A field error on `changedFiles` or `files` is not handled. "The answer's own errors" (:7306-7335) covers only a field error on the check rollup. Say that such an error reads as "changed paths not read", which places the merge as unread.
   - The cost estimate is out of date. J12 still says about 1 point a page (:7386-7387), and its own reasoning that "cost counts connections" (:7364-7365) means the new `files` connection adds roughly 1 to 2 points a page. That makes about 90 to 135 points an hour at worst, against 5,000, so no limit is at risk. Update the figure.
3. **The estimate-only test does not check the project** (:4087). The add-only check requires the planning project (:7684-7685), but AC60's exception matches `intake/estimates.jsonl` in any v3 project. This has no effect today, since only Service-Desk is v3. Adding "in the planning project" would make the two rules match.

**New contradictions:** none found. The lead's new claim that a merged estimate "shows nowhere on the Timeline" (:1156-1157) is now true. "Done today" sits on the Queue, not the Timeline; note 1 covers it.

No self-implication flag: none of these findings comes from my own earlier checks.
