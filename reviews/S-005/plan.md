Verdict: FAIL

**Blocking**

1. **The join-up review does not follow the form in `docs/design/JOIN_UP_REVIEW.md`.** The owner's ruling (`decisions/P-003/stop-7.md`) says to write it "in the form in docs/design/JOIN_UP_REVIEW.md". That file is now readable, so open question 7 can be settled. The spec's section (`specs/S-005.md:147-158`) differs from the form (`JOIN_UP_REVIEW.md:12-23, 32-33`) in these ways:
   - **Heading:** the form wants `# Join-up review — Design, <date>`. The spec has "## Join-up review (Design)" and no date.
   - **Screens line:** the form wants `Screens checked: <list each view with its design file or link>`. The spec has "What is joined: …", which is prose.
   - **Table columns:** the form has Check | Result | Fix. The spec has Check | Result | Where.
   - **Table rows:** the form's five rows are "One meaning per colour or status signal", "One navigation", "Consistent type, spacing and codes", "No two screens doing the same job" and "Every screen's data available from the records, or listed as a needed change". The spec's rows are reworded and out of order, and "Consistent type, spacing and codes" is missing. "One navigation" is recast as "One way to reach a card".
   - **Needed changes:** the form requires "Needed changes to the records: …". The spec has no such line.
   - **Sign-off:** the form requires a Sign-off section naming the gate's decision record. The spec has none.
   - **Rating:** the form wants each difference rated blocking or non-blocking. The spec marks every row "Passes", yet row 3 ("Passes … with a gap", line 156) describes a real difference: the board and notices show no line while a read fails. That gap is not rated, so it can't be carried into the gate's case as a risk. The Critic is the one who adds this section, so the spec's version is not one the Critic can accept as written.
   - **Line 148 and open question 7 (line 219)** say the form couldn't be checked. They should be removed or updated.

**Non-blocking findings**

2. **One citation does not support its claim.** `specs/S-005.md:174` cites `docs/PROJECT.md:540` for card files being named `queue/<item>-<gate>-<n>.md`.
   - Line 540 is an accepted-risk bullet about a session token.
   - It mentions `queue/Q-003-failure-1.md` only as a passing example and states no naming rule.
   - The other cite on that line, `docs/PROJECT.md:85` for answer records `decisions/<item>/<gate>-<card>.md`, holds.
   - J1 depends on this naming (the `<gate>` parse), so it needs a real source.
3. **Cites to sources the stop-7 ruling excluded.** The ruling says "Cite only files you were given".
   - **Source file for the new tests:** line 183 relies on `specs/S-004.md` for the `tests/desk/` location, and S-004 is not in this pack. The spec admits this, so `tests/desk/` stays unverified. The build's return is meant to confirm it.
   - **Header reference:** the supersedes note at line 11 names S-004. That is acceptable as history.
   - **Ruling record:** line 14 says `decisions/questions/P-001-card-recommendation.md` is not in the pack. It is in this pack, so the spec can quote it directly.
4. **The spec has grown.** Stop-7 said "Do not grow the spec". S-005 still carries the full AC13 and J6 count machinery (check moments, two figures, worked examples) and AC18 and AC19.
   - The plan does require a monitoring criterion (§6), so some of this is justified.
   - The spec's own estimate of 15 to 23 tests (line 177) is near the plan's stop at 24 (line 178). I can't compare against S-004 here, so I can't say whether it grew.
   - The Orchestrator or owner should check this against S-004.

**What holds**

- The header names M4 (line 7), which is in `docs/projects/P-003.md` §3 line 46. The plan is the right item's document.
- AC1 to AC8, AC16 and AC17 match plan §1 bullets 1 to 6.
- AC7 matches the owner's narrow reading in `decisions/P-003/stop-7.md`.
- The cites at `docs/PROJECT.md:127, 588, 616` and `docs/handover` (lines 121, 624) check out.
- The four library entries cited exist.

**Open questions**

- Which of the form's rows should the board and notices gap be filed under, and is it blocking? I read it as non-blocking, because the plan excludes it (§1) and the spec raises it as owner question 5. That is for the rewritten section to rate.
- Should the spec drop or merge AC18 and AC19 to honour "do not grow the spec"? Plan §4 gives the Builder the operating notes, so AC18 stays. AC19 adds nothing new and is a candidate to cut.