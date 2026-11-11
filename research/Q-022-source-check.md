Verdict: FAIL

Status: I've opened the library entries the memo cites and the five outside pages it relies on: the GitHub Events API, notifications and Actions retention pages, the Kanban Guide and humanfactors101. I did not open the ISA-18.2 study guide, the DOT report, the Wikipedia situation-awareness page or the ABB white paper. I filed no library entries, because this is a map.

**Format checks (research/Q-022-memo.md)**
- The header line "This is a map of questions, not graded fact." is present (line 7), so the memo is a groundwork map.
- The owner shortlist has 8 items (lines 95–102), within the limit of eight.
- The research shortlist has 5 items (lines 105–109), within the limit of five.
- There are 12 design traps and 7 proposed entries, as the cover text says.
- The cover text (line 1) says "47 questions". The A–O sections hold 51: A5, B4, C4, D4, E5, F5, G4, H5, I2, J4, K1, L2, M2, N3, O1. The count is wrong.

**Known items I confirmed against a source**
- **Events API (E5, line 43):** The page says 30 days, up to 300 events, "not built to serve real-time use cases", and latency of 30 seconds to 6 hours.
- **Notification retention (A4, line 17):** Both the about-notifications page and the configuring-notifications page say 3 months, with Saved notifications kept indefinitely. The "5 months" figure comes from search snippets only and is unsupported. The memo should drop it, not just flag a conflict.
- **Actions retention (E4, line 42):** The page gives 90 days by default, 1–90 days for public repositories and 1–400 for private ones. It also says that from 1 Oct 2026 the settings apply uniformly to all covered data types. That date has passed, and the memo omits it.
- **Kanban Guide (B4, line 24):** The page lists four mandatory metrics and defines Work Item Age as quoted.
- **EEMUA 191 (C2, line 28):** The humanfactors101 page matches both the steady-state and the first-ten-minutes figures.
- **Milford Haven (O1, line 92):** The page says 275 alarms in 11 minutes.
- **Library citations:** The checked entries match their claims and grades. These are F-gh-11, F-gh-01, F-gh-12, F-gh-12b, F-gh-search-02a, F-supervisor-capacity-01, F-alert-repeat-01, F-alert-override-01, F-batch-notify-01, F-webpush-01/02b/04, F-status-optimism-01, F-automation-complacency-01, F-sum-long-multi-01, F-sum-detectors-weak-01, F-trust-ai-label-01, F-cf-kv-01, F-wcag22-01, F-platform-targets-contrast-01, F-change-approval-01, L-F1, L-F5, L-F10, L-P1, LIB-P-a, the P-* patterns and F-briefing-case-pdb-01.

**Not confirmed (each is a FAIL)**
1. **Watched repositories notify on CI activity (A4 line 17, gap list line 133, proposed entry line 138).**
   - The page only lists "CI activity, such as the status of workflows" as something a user can subscribe to. It does not say a plain watch triggers it.
   - The memo states it as fact and builds a gap on it.
2. **ISA-18.2 flood definition (C2, line 28).** The humanfactors101 page does not mention ISA-18.2. The study guide behind it was not opened, so this is unverified.
3. **Endsley's three levels (B3, line 23)** rest on a Wikipedia page that I did not open.
4. **DOT air-traffic clutter finding (O1, line 92)** was "seen in search only".
5. **ABB white paper (line 141)** was also "seen in search only".
6. **Single-source facts.** The Events API, retention, Kanban and EEMUA claims each have one source. The EEMUA claim's second source is the unopened ABB paper. The role requires two independent sources for load-bearing facts.
7. **Pages read through a summarising fetch.** I used the same tool, so I saw no raw page text.

**Open questions**
- Can the Researcher fix items 1–6, or move them from "known" to "unknown" in the map?
- Should the cover count be corrected to 51?
- Should the retention item carry the 1 Oct 2026 change?