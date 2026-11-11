Verdict: FAIL

Almost every known item holds, but two wordings in the memo don't match their sources. I filed no library entries. This is a groundwork map, so none are due. I read every page through the same summarising fetch tool as the Researcher, so I saw no raw page text.

**Confirmed**
- **Format (research/Q-022-memo.md):**
  - The header line is present at line 7.
  - The question count of 51 is correct. Summing A–O by section gives 5+4+4+4+5+5+4+5+2+4+1+2+2+3+1 = 51.
  - The owner shortlist has 8 items (lines 144–151) and the research shortlist has 5 (lines 154–173). Both are within the limits.
- **Events API (E5, line 69; entry at line 202):** Both the main and the Enterprise Server 3.17 pages say "up to 300 events", "within the past 30 days", and "not built to serve real-time use cases… latency can be anywhere from 30s to 6h".
- **Notifications (A4, lines 18–21; entry at line 205):**
  - The about-notifications page lists "CI activity, such as the status of workflows…" separately from "All activity in a repository".
  - Both notification pages give 3 months for notifications not marked Saved, and indefinite for Saved.
  - The workflow-run page covers scheduled workflows, and the cron-author wording holds. It also says "any workflow runs that you've triggered", which supports the trigger-owner claim.
- **Actions retention (E4, lines 64–67; entry at line 208):**
  - The default is 90 days. Public repositories can set 1–90 days and private ones 1–400.
  - The full 1 Oct 2026 note, including "Until then… 400+ days", is verbatim on the page.
- **Kanban (B4, line 33; entry at line 211):**
  - Both kanbanguides.org and prokanban.org give the four mandatory measures and the Work Item Age definition.
  - The May 2025 edition lists Vacanti among its contributors.
  - Orderly Disruption and Vacanti are the copyright holders. The Researcher is right that this is one authority, not two.
- **EEMUA 191 (C2, line 42; entry at line 214):**
  - humanfactors101 gives the one-alarm-per-10-minutes and fewer-than-ten-in-the-first-10-minutes figures.
  - Control Global gives the "very likely to be acceptable" and "should be manageable, but may be difficult" wording. It is a 2009 article, and the memo doesn't say so.
- **Flood threshold (C2, line 43; entry at line 217):**
  - VanCamp's article (Chemical Engineering, 1 Mar 2016) credits EEMUA 191 with the flood definition: more than 10 new alarms in 10 minutes, ending at fewer than five.
  - The ISA study guide gives "more than 10 alarms in a 10-minute period" and credits ISA-18.2.
- **Milford Haven (O1, line 138):** The HSE page says "Excessive number of alarms in emergency situation reduced effectiveness of operator response" and gives the date 24 July 1994. It has no 275 figure.
- **FAA (O1, line 139; entry at line 223):**
  - The abstract reads: "Although neither tool alone caused display clutter, both tools in combination made it difficult for D-side controllers to find the information they needed quickly."
  - The authors, report number DOT/FAA/CT-TN04/28 and date 1 Feb 2005 are as stated, and the sample was 12 controllers.
- **Endsley (B3, line 31):** Wikipedia gives perception, comprehension and projection, citing Endsley 1995. Grade C is right.
- **Library citations:**
  - The F-* entries I checked match the memo's wording and grades. These were F-briefing-case-pdb-01, F-supervisor-capacity-01, F-alert-repeat-01, F-alert-override-01, F-batch-notify-01, F-status-optimism-01, F-gh-11, F-change-approval-01 and F-automation-complacency-01.
  - Earlier rounds confirmed the others.

**Not confirmed (these make it a FAIL)**
1. **The 275-alarm figure "citing HSE" (O1 line 138; entry at line 220).**
   - humanfactors101 does state "275 alarms" in the last 11 minutes. But the page gives no specific source for that sentence.
   - The page cites "(HSE, 1997)" only as a general reference for the incident.
   - So "citing HSE" overstates it. Reword it as "stated without a specific citation".
2. **ISA flood end condition (line 43; entry at line 217).**
   - The ISA study guide has no "ends at fewer than 5" rule. Its "fewer than 5" refers to stale alarms.
   - The guide credits the threshold to ISA-18.2 and also lists it under EEMUA benchmarks. It does not name only ISA-18.2.
   - The "ends at fewer than 5" part rests on VanCamp alone. The "attribution conflict" is therefore weaker than the memo says. State it as a single source for the end condition and a mixed attribution in the guide.

**Open questions**
- **Single-authority facts:** The Events API, retention and Kanban facts rest on one vendor or one authority. They stay at B. Whether that meets the two-source rule for load-bearing use is the owner's call, and I can't settle it.
- **Unopened sources:** The full FAA report, the HSE full report, Endsley 1995 itself, EEMUA 191 and ISA-18.2 stay unopened. The EEMUA and ISA-18.2 standards are paid.
- **Raw-text check:** A reader with a raw-text fetch tool should re-read the pages, since both of us used the same summarising tool.