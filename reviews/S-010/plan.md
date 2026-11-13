Verdict: FAIL

Two registered experiment files and one cited review are not in this folder, so I can't verify several criteria. The spec also says they are in the pack. Under the brief's rule, an unverifiable claim is a FAIL.

**Findings**

1. **Missing records that criteria depend on.**
   - experiments/P-005-E1.md and experiments/P-005-E2.md are not in the folder. I globbed for them and found nothing. Line 11 says every criterion "can be checked from this spec, the plan, docs/PROJECT.md, the library and the two experiment registrations". Line 102 (J11) says "Both registrations are in this pack." Line 168 says both are registered. All three claims are unverifiable and, as far as I can see, false.
   - AC40 (line 65) points to E1's "The rule" and says "This rule, which is E1's". Its eight bullets (lines 66-73) restate the rule, but I can't confirm they match E1.
   - AC46 (line 52) and J1's source map (line 84) rest on E2's "Result" and its check of J1. I can't check either.
   - Line 17 and AC17 (line 38) cite reviews/S-010/plan.md. That file is not here. AC17's 360 and 414 px widths come only from it, and the design records that supposedly hold them are also outside the pack. The "owner's design records" are therefore unverified.
   - Line 9 says the plan review (reviews/S-010/plan.md) returned FAIL. This is "Revision 2", and I can't see the findings it claims to answer.

2. **Header milestones.** The header (line 7) names M6, M7 and M8. All three are in section 3 of docs/projects/P-005.md (lines 72-74), with ` · why:` lines, and that plan is the right one for this item. This check passes. The M6 criterion (AC46) matches M6's "done when" (line 72). M7 and M8 are covered by AC4, AC9-AC14 and AC18-AC26. M9 and M10 are rightly left out.

3. **AC23 may not be achievable.**
   - AC23 (line 46) promises a phone notice within 5 minutes of the due time.
   - The spec's own facts say GitHub schedules run at most every 5 minutes and can be delayed or dropped (line 144, F-gh-12/12b).
   - J5's window logic (line 96) adds to the delay. AC23 therefore cannot be met on a scheduled route.
   - The spec defers this to the Design gate ("goes back to the owner"). That is acceptable. It still means AC23 is not a lockable check today, and the spec should say so explicitly.

4. **AC40 contradicts itself.** It says the count "reads no clock of its own" (line 65). It also reports a still-open wait "so far" (line 73), and that needs a "now". The spec should say the moment is passed in, as J4 does.

5. **Header status.** The heading on line 13 says "owner-approved", but the header (line 3) says `status: draft`. Lines 27 and 172-173 say the owner has yet to approve the 2-hour and 4-minute figures. The heading overstates the approval.

6. **Join-up review (lines 104-119).** It is a draft with every row open or blocking, and the spec says so itself (line 109). That is honest. A plan review that closes Design cannot pass it yet, and it is not a reason to freeze.

**Citations I spot-checked and found sound:** docs/PROJECT.md lines 286-287, 394 (poll of 1 to 2 minutes while open) and 588 (card-making code needs no network). The library facts F-wcag22-01, F-platform-targets-contrast-01, F-gh-fgpat-limits-01, F-rec-pr-review-fields-01, F-gh-env-01, F-git-dates-settable-01 and F-rec-rfc3339-unknown-offset-01 exist. I did not read their content. S-009 exists. I did not check the other cited library files or PROJECT.md line 593.

**Open questions**
- Will E1 and E2 be added to the pack, or should the spec drop the "in this pack" claims and the criteria that lean on them (AC40, AC46, J11)?
- Can reviews/S-010/plan.md be supplied so that the changes made in revision 2 can be checked against its findings?
- Does the owner accept AC23's 5 minutes as stated, or should the figure be fixed before freeze?