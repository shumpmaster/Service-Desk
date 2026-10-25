# M3E stage G4: the Design reviewer's confirmation (round 2), verbatim

Dispatched by the orchestrator on 2026-10-25 against build/builder/g4 at 1d3217c (fix commits 44d9683 and 1d3217c, on a3c6ac7) (base 524f92f).

---

Verdict: PASS

**In plain English.** The fix round does what my N1, N3 and N4 asked for, and nothing else on screen changed:
- **N1, waits row:** each id in a project page's waits row now moves to the next line whole. "P-002" no longer splits into "P-" / "002", and "Q-020 stop-1" stays on one line. The row is still cut at two lines with its fade.
- **N3, member pages:** lines read "<words> · <time>", for example "Q-012: waiting on you — card stop-1 · 8 Oct, 12:22", instead of three commas in a row.
- **N4, sheets over a member's page:** the Working now sheet and a handed-back piece's sheet use the same date form as the page under them. N2 is not part of this round: the owner chose B, which is built in G5.

Confirmation review of G4, round 2: 44d9683 and 1d3217c on build/builder/g4, judged against a3c6ac7 (round 1) and 524f92f.
- I read only the diff and the Definer's ea13729, not the commit bodies.
- I changed nothing. 1d3217c was exported with `git archive`, and /home/user/sd-g4 is clean at 1d3217c.

EVIDENCE

All in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/.

**Tests and captures**
- **Tests:** the full suite on 1d3217c passes 1207 of 1207 (confirm-suite.txt).
- **Captures (confirm/):** my G4 script run on 1d3217c, scripts/cap4c.mjs. It covers round 1's 22 states plus three new ones (member-builder-alpha, sheet-working-now, team-alpha), each at 360×740 and 414×896, light and dark: 100 captures, each with a text, style and probe dump.
- **The same three new states, before and after:** captured on 524f92f and a3c6ac7 too. Doing so overwrote round 1's after/report.json; its contents are in my round-1 report.

**What changed against round 1**
- I compared every text run between round 1's after/ and confirm/.
- Only member-orch, member-owner, member-builder-alpha and the Working now sheet differ, and only in the ", <time>" → " · <time>" lines.
- Every other state has identical runs, timer text aside: all project pages, the Timeline, failed load, Done, Waiting, Home and Team.

**Waits row (N1; AC89 (c), "After G4's reviews")**
- The new rule is `.v2-wn > .v2-mono { display: inline-block }` (sandbox.css:993).
- In page-mix, page-gates, page-gates-one-item(-case) and page-ext-alpha, at both widths: the probe found split ids P-002, P-005 and "Q-020 stop-1" at a3c6ac7, and none at 1d3217c.
- md-extremes' "Epsilon-with-a-very-long-project-name-that-wraps-pick" is longer than a line, so it still wraps inside itself, as the amendment allows.
- The row stays 33.6 px (two lines), its fade is unchanged, and nothing scrolls sideways.

**Member pages (N3; AC91 (l))**
- Every line built from the log reads "<headline words> · <time>" across 184 orchestrator runs and 31 owner runs: running log, groups, "latest:" lines and Rulings "latest: <file> · <time>".
- The words come from J9's `headlineWords`, which moved to records.js and is re-exported from feed.js. The Timeline's and Home's text is identical.

**Working now sheet (N4)**
- It opens only from a member's page (sandbox.js:3397-3402), and I reached it at `#/p/Alpha/team/builder/now`.
- **Update:** "P-003: builder started (Produce), 09:40" became "… · 09:40".
- **Started and Last check-in:** they now use `dayTimeText`. The fixture's times are from today, so they read "09:40" both ways. The earlier-day form is shown by the tests only (ac49 and ac91-glance-page).
- **Next check-in:** stays "HH:MM", as specified.
- **Handed-back piece:** checked in code only, `cosPieceWords(…, dayTimeText)` at sandbox.js:3399. No fixture reaches it.
- The Team screen's cards are unchanged (team and team-alpha runs identical).

**Part A**
- In all 100 captures: no text under 4.5:1, scrollWidth equals clientWidth, and no page errors apart from failed-load's intended 404s.
- The Timeline's Now line is still at 247 px and 299 px, and a refresh keeps the scroll at 600.
- No new colour, size, target or motion.

FINDINGS
None.

OWNER PAIRS (BEFORE 524f92f | AFTER G4 1d3217c), refreshed in /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/. Round 1's set moved to .../g4-design/owner-pairs-round1/.
1. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/01-page-calm-row-and-last-action-date-360x740-light.png
2. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/02-page-ran-again-once-and-gate-name-360x740-light.png: "P-002" now whole.
3. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/03-timeline-opens-next-milestone-in-view-360x740-light.png
4. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/04-failed-load-reload-button-360x740-dark.png
5. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/05-waits-row-two-gate-cards-414x896-light.png: "case 2" is still past the cut; the owner's B is built in G5.
6. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/06-member-page-dates-414x896-dark.png: "<words> · 8 Oct, 16:48".
7. /tmp/claude-0/-home-user/70528afa-d5f7-555f-8ed9-b235c4cf0a39/scratchpad/g4-design/owner-pairs-final/07-waits-row-ids-whole-360x740-dark.png: ids kept whole, with the cut unchanged.
