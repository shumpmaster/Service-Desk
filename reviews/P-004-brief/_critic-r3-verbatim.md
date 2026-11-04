# Critic, round 3, verbatim — docs/PROJECT.md "Later work: the home-screen widget (P-004)" (2026-11-04)

**Verdict: FAIL.** There is 1 blocking finding and 7 non-blocking ones. This was round 3, the last before the stop rule (D-044), so the blocking finding now goes to the owner.

Draft 3 fixes all of round 2's findings except finding 1. I checked these citations myself and each says what the plan claims:
- src/lib/access.js:1-4; src/lib/model.js:1-3; src/notify/collect.mjs:1-6 (line 6 imports `buildModel`).
- src/tools/build.mjs:8 (stale made copies fail the check); src/config/projects.json (three projects plus the portfolio).
- governance/risk-paths.toml:20-24 (R3 files) and :43-49 (the design reviewer for src/public/**).
- specs/S-001.md:4954-4955 (16 blob calls), :14611 (25 a blob call), :14620-14621 (23 steady, 30 at most).

The handoff quotes both answers word for word (lines 41-46), and its last paragraph (48-52) says what the brief says. The request file P-004.toml agrees with the plan and has no `enters`. M5's form is right: the parts are in order, ` · for: P-004` comes before ` · why:`, no " · " sits inside a part, and M5 is not used anywhere else.

**On round 2's finding 1, my plain judgment: calling the two answers notes is not sound under §5 or the model.** The plan's content can stand without them. The way it handles the two answers cannot.

## Blocking

1. **"Data on the phone": "Asked in the session, the owner preferred it … "Phone only (Recommended)" (a note of the owner's, kept in the same handoff)". Also the Why: "Asked in the session which reason was closest, they answered, verbatim: … (a note of the owner's …)". And the handoff, lines 48-51: "Neither is treated as a ruling".**
   - **What is wrong:**
     - **Both were rulings put to the owner.** AGENTS.md §5, line 80, and the model at OPERATING_MODEL.md:100 say every ruling put to the owner, "including one asked in a session", is filed first. What makes something a ruling is that it was asked. Both were put by the session's question tool as choices, one marked "Recommended". That is the same form as the P-001 ask, which was filed. Nothing in §5 lets an ask off because the answer chosen happens to stay inside the current rules.
     - **The model says an answer to a question is not a note.** OPERATING_MODEL.md:120 and AGENTS.md:70: "The owner's answer to a question is not Context: it is the ruling." "A note of the owner's" is the Context kind of fact. So the plan's label is exactly what the model says such an answer is not.
     - **The data question was a choice of limit.** It asked "Where *may* the widget keep your records…", and one option would have widened Part 1 §5. Choosing not to widen a limit is still a ruling on that limit. The handoff itself says the other option "would have needed a ruling".
     - **The desk's own precedent did the opposite.** The 3 November handoff says of "Proceed with the fix", asked in a session without a file: "S-033 wants one first; the next session files the route as a question" (docs/handoff/2026-11-03-chief-of-staff-p002-4.md:28). Line 34 says the same of "Show it after a day, flagged (Recommended)". Both answers were then carried into decisions/questions/P-001-card-recommendation.md:16-19. P-004 relabels its answers instead.
     - **Still no record.** I searched questions/ and decisions/ again: neither answer is on record there.
   - **What is sound:** the phone-only rule stays inside Part 1 §5 as written, and the owner's approval at the Design gate will be a recorded ruling. A why needs no owner ruling (OPERATING_MODEL.md:120). So the plan's content does not depend on these answers. But the brief quotes them, and it describes them in a way the model contradicts.
   - **Stage:** asking the owner (Chief of Staff, AGENTS.md §5, model S-033). The relabelling in the brief and the handoff follows from that.

## Non-blocking

2. **M5's done-when: "when the desk's cards change the widget says it needs updating".**
   - The cards change with every new record. What triggers "Update the widget" is a change to the card-making code ("What it covers", fourth bullet).
   - Read plainly, the line promises a notice almost all the time. It should say "when the way the desk makes its cards changes".
   - "As the desk shows them" also leaves out the gap the plan accepts: the widget follows the main branch, and the live desk can lag behind it.
   - **Stage:** milestone drafting.

3. **Discovery, second bullet: "writes down how long it took …" and "It passes if …".**
   - This is a spike with a deciding threshold. The plan does not say who judges the figures against the pass mark, or where the result is kept in the repository.
   - The experiment playbook (OPERATING_MODEL.md:296-302) has the analysis done by someone who did not run the test, and the result filed. The desk registered its earlier unknowns as experiments (PROJECT.md:121).
   - "Shows a correct summary every time" over a day also needs someone to compare each refresh with the desk.
   - **Stage:** Discovery planning.

4. **"Owners and limits": "about 15 minutes to install and run the test widget and write down its figures".**
   - The pass mark watches a whole day, including a busy stretch, "every time". That is more than 15 minutes, unless the test widget logs each refresh's figures and summary itself.
   - The plan should say which.
   - **Stage:** brief drafting (the cost to the owner).

5. **"… may go past the 30 minutes a week of upkeep the desk allows (section 6, V3) …; updates count toward V3".**
   - V3 runs over the 14 days after launch day (PROJECT.md:196-199), and launch was 2026-11-01 (M3C, line 117). So it runs to about 15 November.
   - If Discovery's setup falls in that window and counts as upkeep, it is a recorded V3 miss. Line 203 sends such a miss to the evidence review.
   - After the window, V3 measures nothing, so "count toward V3" means nothing then.
   - V3's own measure is "the owner's time on the desk itself (tokens, settings, adding repositories)". The plan should say whether widget time counts, and if it does, what happens in the window.
   - **Stage:** brief drafting (value).

6. **"Data on the phone": "kept in Scriptable's on-phone storage only, never in its iCloud folder".**
   - This rests on what iOS does, which comes from vendor documentation. Even so, the plan does not mention the phone's own iCloud backup.
   - App storage is normally included in iCloud backups. If the owner's phone backs up to iCloud, the records' content reaches iCloud anyway.
   - One sentence settles it: the owner either accepts this as their own phone's setting, outside the desk's data boundary, or the copy is kept out of backups.
   - **Stage:** brief drafting (data boundaries).

7. **Section 3 has no Discovery or Design standard lines.**
   - The definition of ready (model S-032) fails a brief whose section 3 has no `- <Phase>-<n> (standard) · taken on|skipped · why:` line for each Discovery and Design standard milestone. Section 3 has only Build-1 to Launch-5 (lines 118-127).
   - P-004 has a Discovery and a Design gate of its own, and the plan names no such lines.
   - The precedent P-003 also has none, and the S-035 tools change that would sort this out is pending. So I rate this non-blocking. Read literally, the definition of ready fails it, and the Chief of Staff should decide (or put to the owner) whether later work needs these lines.
   - **Stage:** brief drafting / definition of ready.

8. **Smaller points.**
   - "poll call" (Discovery, size sub-bullet) is jargon with no explanation (AGENTS.md §4).
   - "any file whose changes need the owner's approval: src/notify/**, …" lists only five of the R3 globs (risk-paths.toml:8-25 also has governance/**, .github/** and others). Say "for example", or cite the whole list.
   - "Like the desk's other made copies, … the desk's build check fails when it is out of date (src/tools/build.mjs:8)". Today the check covers only two kinds of copy, so it has to be extended for this one. The Success line implies that; it could say so.
   - **Stage:** brief drafting.

**Round 2 resolved:** 2, 3, 4, 5, 6, 7, 8 and 9; 1 is not resolved (finding 1 above).

**Self-implication flag (D-050):** findings 3, 6 and 7 implicate rounds 1 and 2. Finding 3: round 1 asked for a pass mark but not for who judges it or where the result is kept. Finding 6: round 1's data finding proposed "nothing synced" without naming the phone's backup. Finding 7: neither round checked for standard lines. Finding 2 also implicates round 1, which called M5's done-when testable.
