# Critic, focused confirmation review (after round 3; the owner's choice under D-044), verbatim — 2026-11-04

**Verdict: PASS**

I checked the 7 round-3 findings that fall in the section (finding 1 and findings 2 to 8). All of them are resolved in "## Later work: the home-screen widget (P-004)" in /tmp/claude-0/-home-user/0aaef059-e93e-53f6-8bc4-94ee30faf5e8/scratchpad/p004/docs/PROJECT.md (lines 615-663). None of the changed lines is false, unfair, or leaves the plan unready, so there is no new blocking finding. I opened every source the changed lines cite.

**Round 3, finding by finding**

1. **Blocking (answers given in chat, labelled as notes): resolved.**
   - decisions/questions/P-004-widget-why-and-data.md now records both answers word for word, plus the round-limit choice. It cites the filed question (PR #289) and its Critic PASS (reviews/P-004-widget-why-and-data/critic.md).
   - "Why" (line 619) and "Data on the phone" (line 631) now cite that record and call option A "the owner's ruling". "A note of the owner's" is gone from the section.
   - The handoff's "Neither is treated as a ruling" paragraph (docs/handoff/2026-11-04-chief-of-staff-widget.md:48-52) is marked superseded at lines 55-57.
   - The "Option 2" and "A: widget runs desk code (Recommended)" quotes match decisions/questions/P-001-home-screen-widget.md:15,18. "The sender's summary or the counts-only widget" matches that question's options B and C.
2. **M5's done-when: resolved.** It now reads "when the way the desk makes its cards changes", and it states the main-branch lag. The line's form is intact: the parts are in order, there is no " · " inside a part, ` · for: P-004` comes before ` · why:`, and the why is plain. The name and done-when read as an achievement.
3. **Who judges the experiment, and where the result goes: resolved** (line 656).
   - The test is registered with the pass mark set before it runs, and the widget logs each refresh.
   - The Reviewer, who neither made nor ran the test, compares the summaries and judges the result. This fits OPERATING_MODEL.md:296-298.
   - The result is filed in docs/handover/experiments/, where EXP-001 to EXP-006 already sit.
4. **The 15 minutes to install and run the test widget: resolved.** The widget logs itself, and line 663 says "about 15 minutes to install the test widget and, a day later, share its log".
5. **V3: resolved as a question of fact.** Line 663 states V3's window correctly (section 6, lines 192 and 196-199). See finding A below on the reading it adopts.
6. **The phone's iCloud backup: resolved.** Line 635 marks it "Not yet ruled", matches the record's "Not ruled" section, gives a proposal, and sends it to the owner at the Design gate.
7. **Standard lines: resolved as a non-blocking point.**
   - The new "Standard milestones" section (line 660) says that, read literally, the definition of ready finds the lines missing. It follows P-003 (true: P-003's section, lines 576-613, has none) and puts the question to the owner at the Design gate.
   - The literal miss remains. It is carried as a risk, not a blocker, for the same reasons as in round 3.
8. **Smaller points: resolved.**
   - "poll call" is gone; line 654 now says "one call that lists what has changed".
   - The R3 list now says "for example" and cites governance/risk-paths.toml:20-24, which does list src/notify/**, src/config/projects.json and the three files the sender runs.
   - Success now says "the build check, extended to this third kind of made copy". That is accurate: src/tools/build.mjs:8 says "Two kinds are generated".

**New findings (all non-blocking)**

A. **Line 663:** "None of this counts toward V3, which measures the owner's time on the desk itself over the 14 days after launch (section 6); the widget's time is P-004's own cost".
   - The plan states this as settled, but it is a reading of an owner-set value target.
   - V3's own measure names "tokens" (section 6, line 192), and making the widget's read-only GitHub key is token work.
   - The window runs to about 15 November (launch 2026-11-01, M3C), so Discovery may fall inside it.
   - The fair wording would present this as the plan's proposed reading, for the owner to rule at the Design gate, and name the overlap with "tokens". As written it is open to the owner, so it is not blocking.

B. **Line 635:** the backup bullet sits inside the list that line 631 introduces with "It keeps Part 1 section 5's rule, unchanged". If the backup does reach iCloud, that rule may not be kept as stated. The bullet reads better after the list, as the one open exception.

C. **Line 656:** "compares each logged summary with the desk's for the same time". The plan does not say how the desk's summary at a past time is produced; most likely the desk's code would be run on the records as they stood at that commit. One phrase would make it checkable. The registration's form could also be cited (experiments/_REGISTRATION.md, as EXP-001 to EXP-006 used).

D. **Line 656:** the playbook (OPERATING_MODEL.md:298) files results "in the library", but the plan files this one in docs/handover/experiments/. The desk's own precedent backs this, so it is noted only.

**Self-implication flag (D-050):** finding A partly implicates my round 3, finding 5. That finding asked the plan to say whether widget time counts toward V3, without saying that the answer is the owner's to rule.
