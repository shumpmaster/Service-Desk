Status: I've read the spec, the definition of ready and the owner's ruling records, and I've checked the spec's citations against them. Verdict follows.

Verdict: FAIL

**Findings**

1. **The O3 and O5 rulings are widened without the owner.**
   - `specs/S-001.md:355` and `:308` close the unknowns "Before Build ends" (EXP-001, EXP-002, EXP-004).
   - The owner's rulings accepted them open "into Define, closed by a measurement there": `decisions/questions/P-001-o3-define.md:5`, `P-001-o3-walltime.md:5` and `P-001-o5-define.md:5`.
   - The definition of ready (`governance/standards/definition-of-ready.md:13-16`) allows an unknown to stay open only into Define, with the owner's ruling recorded.
   - The spec moves the closing test into Build and offers no ruling for that. That is a gap in the foundation, not a detail.
   - Freeze depends on an open unknown. `:179-180` says that if EXP-004 finds a different name, it replaces `value` "before freeze". The spec is still a draft with no EXP-004 result, so it can't freeze as written. Run EXP-004 first, or move the name into `config/projects.json` (J7).

2. **The status, sprint and dispatch-log formats have no join sheet, so AC4, AC6 and AC12 can't be tested.**
   - J2 (`:153-155`) reads those files at paths set in config. The only format material is `"status": {...}, "sprint": {...}, "dispatch": {...}` in J6 (`:238`).
   - AC12 (`:92-95`) needs "the latest dispatch with no recorded outcome", "v3 stage", "next in queue order" and "time last recorded". None of these is defined.
   - The spec admits the paths are inferred (C) (`:303-305`).
   - The check author can't write a join test (`:169`) against a format nobody has written down.

3. **AC4 asks for activity with no data source.**
   - AC4 (`:61-62`) requires "an agent retrying", "a new dispatch", and agent sessions as activity (`:36-37`).
   - J1 reads only branch head, pull requests and check runs (`:140-142`).
   - "Agent retrying" has no source in J1, J2 or J6. It is either unbuildable or left to the builder to invent.

4. **AC11 is incoherent.**
   - `:86-89` says the link "targets the new-file page so the owner commits to a new branch".
   - J3's URL is already the new-file page (`:172`).
   - The spec never says how the branch is chosen or named when the default branch is closed, or whether the pull request is opened by the owner or by the desk. The criterion can't be tested as written.

5. **"Owner-approved" is claimed and not evidenced.**
   - `:45` labels the acceptance criteria "owner-approved", yet `:3` says `status: draft`.
   - No ruling in `decisions/` approves these 19 criteria. Open questions 1–4 (`:336-348`) are still unanswered, including AC7's bar and V5. Remove the claim or cite the approval.

6. **The AC19 arithmetic is weaker than it looks.**
   - `:270-272` assumes one device and 10 openings a day.
   - Each cold load needs several batched calls per project (J1 `:147-149`).
   - A second device (J5 allows one, `:225`) or a long open window with retries is not modelled. The margin (about 5,000 against 10,000) is probably fine. State the assumption as an assumption, and note that retries after a 429 or 403 also count as requests.

7. **Minor consistency points.**
   - J1 says "at most 30 per invocation" but "a seventh connection queues… runs in waves of six" (`:146-148`). The wall-time impact is unmeasured (`:278`).
   - The J6 reason enum has no value for Cloudflare errors, although AC3 lists them. "github" appears to absorb them. Say so.
   - AC7 resets on "one unexplained difference". It doesn't say who judges "unexplained". Name that judge.

**Checked and sound**
- The citations I opened support the claims: F-gh-06 on 414 (`library/F-gh-06.md:8`), F-gh-05 on `filename` only, and the answer-file `Decision:` first lines.
- The rulings on spend, planning, usage (launch waits for S-002) and the acting route match `decisions/questions/*`.
- The card and answer pairing examples hold up. `queue/P-001-dor-fail-2.md` maps to `decisions/P-001/dor-fail-2.md`, which exists in this pack.

**Open questions**
- Will the owner re-rule that O3, O5 and O4 may close in Build rather than in Define?
- Where is the real format of the dispatch log, sprint and status files? Without a sample file, J2 and J6 stay guesses.
- What source does "agent retrying" read from? Either name one or drop it from AC4.
- What is the intended mechanics of AC11? Is it a `new/<branch>` URL, and who creates the branch?
