# M3B plan: the Reviewer's round 2 (FAIL), verbatim

Dispatched by the orchestrator on 2026-10-26 against build/definer/m3b-plan at 617ec2e (the plan, draft 2).

---

Verdict: FAIL

This is round 2 of the plan review: draft 2 of the M3B plan, at 617ec2e on build/definer/m3b-plan, in /home/user/sd-m3bdef/specs/S-001.md. I worked read-only.

**Round 1's findings: each fix is real.** I checked each against the text and the code at 3bfe663.
- **B1 (returning offer):** fixed. Notes are kept 8 weeks whether or not the file has landed (:12909-12911, :13729-13730), and the offer comes back while they last (:13784-13785).
- **B2 (portfolio cards):** fixed. No note, no control and no key for a portfolio card, and held questions are not noted while held (:12873-12878). The "no AC73 key" cite is right (AC95's tie rule).
- **B3 (privacy):** fixed. The plain hash is gone, and a public file holds no other project's item or hash (:13736-13741). Question 3 is R3, irreversible, with no default (:19517-19518). The J7 defaults it relies on for the portfolio link exist in src/lib/links.js:20-21 and :127.
- **B4 (V4 "Met"):** fixed. Every state word in the sheet comes from the Chief of Staff's J25 line (:13033-13035), and CS34 judges V4 against its date.
- **B5 (one "measured" rule):** fixed. There is one "checked" rule (:13001-13003).
- **N1 to N12:** each addressed. The new citations hold: owner_signal.py:163-164 ("Owner not required"); sandbox.js:3418-3424 and :3459-3464 (the "Done ✓ · Close" rows); pulls.js:16-17 (`desk-pulls-v3`); risk-paths.toml (`intake/**` is R0, needing no reviewer).
- **Checks run:** v3_checks trace, joins and ready, and spec_check status, are all OK. `surface_guard diff --range aaf63fd..617ec2e` is OK.

**Blocking finding**

B1. After the 14 days, the row can show a green "met" check that no weekly check gave.
- The icon rule (:13013-13016) says: "the planned ring until a target is checked; then AC59's half circle; after the 14 days, the green check when none is missed and the red cross when any is".
- So from the day after the window, a row whose latest checks all say `on track`, or with no check at all, gets AC92 (a)'s green check. The words beside it read "first 14 days over · 0 met · 0 missed" (:13010).
- The last week's checks aren't due until the Wednesday after it (:12997-13000; CS34, "by the Wednesday after it"). So for about a week the row shows a success mark that no Chief of Staff line gives.
- This contradicts AC97's "the desk calls no target met or missed itself" (:12981), reading (g) (:19611-19613), and draft 2's own claim that "no state the desk shows can differ from the Chief of Staff's" (:13033-13035). It is exactly the Risks entry "A target read as met… when nothing was measured".
- The rule also contradicts itself when nothing is checked after the 14 days: "planned ring until a target is checked" and "green check when none is missed" both apply. The VT1 case "the row's small line in each of its states by its one rule, with its icon" (:3334) can't be written unambiguously.

**Non-blocking findings (risks)**

N1. Three locked cases are missed for VT1's key move and new kept-entry fields. The plan names only "J12's and AC60's estimate-only cases" (:3334), but these also break:
- tests/desk/j12-asks-merge.test.mjs:124-126, which asserts `PULLS_KEY === 'desk-pulls-v3'` and the exact `OLD_PULLS_KEYS`;
- tests/desk/j12-pulls.test.mjs:138, which asserts the kept entry's exact key list;
- tests/desk/j12-ac60-ac66-estimates.test.mjs:72, the same key-list check.

N2. The offer's condition says two different things.
- AC25 (:12898-12900) and AC82's note (:8410-8412) show the line only "while the week before's file from this device is not in its repository's tree".
- But :12911 and J5 (:13784-13785) offer again any deleted week whose notes are kept.
- With last week saved and an older week's file deleted, it is unclear whether Home's line shows.

N3. Under question 3's A or B, the file's form is not given.
- A's per-project count line (:13744-13748) has no heading or place in the example (:13764-13776). B's whole file (:13749-13750) has no form at all.
- So VT3's "the file's path and body exactly in J5's form… by question 3's answer" (:3336) is untestable for A or B. The recommendation is C, so this bites only if the owner picks A or B; the form should be written in when the answer comes.

N4. Question 2 is R1 and reversible, but has "DEFAULT: none   TIMEOUT: none" (:19479-19480).
- AGENTS.md:76-77 says "Reversible questions adopt the recommendation at timeout"; only irreversible ones never default.
- The precedent for a line question, P-001-m3a-done-when (7ffcf1f), was R0 with "DEFAULT: B".
- docs/PROJECT.md is R0 under risk-paths.toml (`docs/**`), so R1 is also not the computed class. Either give a default (C, today's line) or class it costly or irreversible, with the reason.

N5. "Didn't need me" sits "directly above the sheet's Done ✓ · Close (or Undo · Close) row" (:12889-12892). But the "No longer waiting" sheet it must also appear on (:12896), and the AC79 being-recorded sheet, end in "Close" alone (sandbox.js:3305 and :3307-3314 at 3bfe663). Its place there is unstated.

N6. Reading (a) is called "settled, not asked" (:3212-3213, :19417-19419), yet it is listed among question 6's readings that the owner may change (:19594-19595). Pick one.

N7. The plain paragraph names the id "M3B" (:3141, :3165, :3167). AGENTS.md:68 says no ids in that paragraph.

N8. AC97's "Nothing measured yet, in words" applies to any target with no J25 line (:13061-13066), but V4 and V5 have their own words for that case (:13038-13060). The plan doesn't say whether V4 and V5 also show "First check due" or "Weekly check not recorded yet". VT1's row names V1 to V3 only.

**Open questions**
1. Under question 3's C, the desk would for the first time offer a link that commits into the portfolio repository, which the desk otherwise reads only (J23). "An answer link for a portfolio card" is listed as later work (:3533). Does the portfolio's own surface map or rules allow `metrics/service-desk/**` as an owner commit? That should be confirmed alongside CS34's read check.
2. For the Orchestrator: `surface_guard diff --range 31ff26d..617ec2e --branch build/definer/m3b-plan` reports a FAIL. The flagged commit is 5365550, the Orchestrator's own commit on the push branch, which came in through merge aaf63fd. From aaf63fd the range is OK. Pick the acceptance base so that this commit falls outside it.
