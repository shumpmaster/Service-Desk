Verdict: FAIL

I'm failing this because several records the plan relies on are not in my folder, and the plan has gaps I could check without them. I read the P-004 plan (`docs/PROJECT.md` lines 615–658) and its proposed M5 line, and I used the two rulings it cites.

**Findings**

1. **The ruling's own carry-out is not done: the iCloud backup point is missing.**
   - `decisions/questions/P-004-widget-why-and-data.md` lines 21 and 24 say the plan "sets the backup point out for the Design gate".
   - "Data on the phone" (`docs/PROJECT.md` 630–634) never mentions the phone's own iCloud backup. It promises "never in its iCloud folder" and "sends nothing anywhere but GitHub".
   - A backup that may copy the on-phone storage is the open question. It would make "nothing synced to iCloud" a promise the records do not hold.

2. **The plan does not cite the P-004 ruling record.**
   - Lines 619 and 631 cite only a handoff note for the owner's two answers ("See what's waiting at a glance" and "Phone only (Recommended)").
   - The ruling says (line 24) the plan "cites this record for it and for the milestone's why". `decisions/questions/P-004-widget-why-and-data.md` is not cited anywhere in the plan.
   - The M5 line's `why:` (line 644) has no citation either.

3. **The plan's header does not match the ruling's account of its status.**
   - Line 616 says "Draft 3 … after the Critic's rounds 1 and 2".
   - The ruling (line 11) says the Critic passed at round 3, and (line 25) that findings 2 to 8 from that round are now fixed.
   - I cannot see that the plan's text records those fixes. I also cannot read `reviews/P-004-brief/_critic-r3-verbatim.md` or `reviews/P-004-widget-why-and-data/critic.md`, so I cannot check what those findings were or whether any remain open.

4. **Many cited records are not in my folder, so these claims are unverifiable.**
   - I found none of these: `docs/handoff/2026-11-04-chief-of-staff-widget.md`, `src/lib/access.js`, `src/lib/model.js`, `src/notify/collect.mjs`, `src/tools/build.mjs`, `specs/S-001.md` and `governance/risk-paths.toml`.
   - The claims that rest on them are:
     - the sign-in rule (line 621);
     - "needs no network" (line 621);
     - the build check failing when the copy is stale (line 626);
     - the request counts of about 400, 30 and 23 (line 653);
     - the owner-approval and design-review paths (line 647).

5. **The M5 line (line 644) passes the form checks I can make.**
   - The name is an achievement, and "done when" is a state, not a task.
   - It has a phase (Build), `for: P-004` and a plain-words `why:`.
   - I could not check that it sits after the M4 or M3C line, because the section 3 text was not in my reads.
   - The brief's section 9 and the standard Discovery and Design lines (S-032) are also unchecked here.

6. **Process note: the plan is not asking for the owner's approval of the data rule beyond a Design-gate assertion.**
   - Line 631 says the plan "keeps Part 1 section 5's rule, unchanged". The ruling (line 8) calls option A "within the desk's current rule". That is consistent.
   - This is not a failure. The backup gap in finding 1 is what weakens it.

**Open questions**
- Do the handoff note, the cited code and spec files, and the Critic's round-3 records exist? If so, they need to be added to my folder.
- Does the Chief of Staff intend the backup point to appear in the plan before the Design gate, as the ruling says?
- Is this a plan review, a check of the M5 line, or both? The brief names no document under review and no spec.