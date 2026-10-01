Verdict: FAIL

I checked `docs/PROJECT.md` Part 1 against the library entries in this pack. The pack has no definition-of-ready file, so I used the eight section headings of Part 1 as the checklist. Every section has content, and the main U1 and U4 facts match the library. Four things stop a pass.

**Findings**

1. **The evidence is not in the pack.**
   - §7 (lines 131–134, 124–126) rests on `research/Q-001-memo.md`, `Q-002`, `Q-004` and `Q-005`, and says each has a PASS source check.
   - There is no `research/` folder in the pack, and no source-check records.
   - I can't verify the "four passed memos" claim or the memos' own grades. Under the brief, an unverifiable claim is a FAIL.
   - The library has only entries for these. Nothing shows the Q-003 drop (line 83) was a recorded decision.

2. **Two load-bearing unknowns are still open, yet §7 reads as "Solid foundation".**
   - **U2 (lines 174–182):** the owner ruling under D-066 is open, and the live test of an answer commit starting the Orchestrator's run is deferred to Define.
   - Whether the user-token route starts workflow runs is only inference (grade C). L-F8 (`library/facts/L-F8.md:4`) documents installation tokens and personal access tokens, not user tokens.
   - **D2.1 read access (line 136):** "Partly proven; v3 record files not yet read by the desk."
   - D4, D5 and V1 depend on both. Either close them, or state explicitly that the exit is accepted with these open, with the owner's ruling.

3. **A grade in the text doesn't match the library.**
   - Line 165 grades L-F10 as "B", but `library/facts/L-F10.md:5` says A. Its own note says the badge and security-log detail rest on one page, so the library grade looks too high rather than the text.
   - Line 166 cites L-F2 and L-F11 without grades. L-F2 is A and L-F11 is B in the library.
   - Line 125 says grades are "as in each memo", so a mismatch matters. Reconcile it.

4. **U1 leaves out a cost and a feasibility risk for the $0 ceiling.**
   - `library/F-hosting-02c.md:8` says WebSocket messages bill at 20:1 against the 100,000 requests a day on the Free plan. §7 omits this, although the live-update design depends on it.
   - `library/F-hosting-01.md:8` says the free plan allows 10 ms of CPU per invocation.
   - The 1–2 minute reconcile poll (lines 216, 213–215) needs something to run it. §7 doesn't say what (cron trigger, Durable Object alarm) or whether it fits the free plan.
   - The 900 calls an hour is GitHub's rate limit, not Cloudflare's, so it doesn't answer this.
   - Whether paid Durable Object storage billing is live is also "unconfirmed" (line 144, `F-hosting-02b`).

**Minor points**
- Line 151 says Fly.io has "no lasting free tier (estimate, C)". There is no library entry for it.
- Line 178 says the Orchestrator's `record_checks decisions` accepts any answer whose commit author is a person in the humans block. This comes from the model's repo, which isn't in the pack, so I can't verify it.
- §1 includes Planning and scheduling (D3.4, D4.2), but Part 2 line 269 says the owner picked four first-version items and lists neither. Part 2 does name planning in the Purpose (line 263), so this is a scope question, not an error.

**Open questions**
- Is the exit meant to pass with U2's ruling and live test still open? If so, say so, so the owner can approve it knowingly.
- Where is the definition of ready (D-052), so the next check can run against its actual items?
- Can the four research memos and their source-check results be added to the pack?
- Should planning and scheduling be in the first version, given the 2026-10-28 target and the owner's four picks?
- Which component runs the reconcile poll, and does it fit the free plan?
