Verdict: FAIL

Plan review, round 1. specs/S-001.md at beef5f1 (build/definer/s001-trial-view-2) compared with orch/trial-view-2. I changed no files.

**Repo checks:** `GOV_BRANCH=build/definer/s001-trial-view-2 bash governance/checks/check_all.sh . orch/trial-view-2` exits 0. All 24 checks pass, including surface_guard diff, spec_check, v3_checks trace and joins: "OK: all governance checks passed."

**What I confirmed (no finding):**
- **Markers.** AC57 to AC64 each have exactly one trace tag and one `ac-test:` marker. J12 has one `join-test: S-001/J12`.
- **Record forms in AC61.** (a), (b) and (c) are exactly the three forms in the brief.
- **Superseded readings.** AC51's "newest at the top" and "Bold headings, no colour" are explicitly superseded at :1416-1441, citing notes 13, 15 and 18. AC50's top-down order is superseded by note 15 at :1382.
- **Pronouns.** No gendered pronoun in any added line.
- **Code and record references.** All of these check out:
  - src/public/app.js:638 and src/public/sandbox.js:1766 (the sandbox reads live records);
  - sandbox.css:297 (.88rem) and sandbox.css:10 (`#1d5bd6`); index.html:5;
  - j11.js:161-163 (the regex that fails a line with a why);
  - PROJECT.md:106-114 and :480-483 at 4efc670, and the fixture copy is the same;
  - mockup :11, :17, :19-25, :192 and :211;
  - 38 verdict files under `reviews/<n>/`;
  - pulls-page1.json item sizes;
  - PR #77's body and its first sentence (checked through REST);
  - 18 merged PRs #59 to #77 (#62 was never merged), and the placing rule's cut-off: #58 merged at 21:35Z, before Design i2's first time, 21:42:17Z;
  - "30 Sep" in America/Chicago; runs 1 and 2 from trace-notes.txt; the A3 arithmetic (38 blobs plus 5, about two calls).
- **GraphQL cost.** One page costs about 1 point (100 PRs, each with its last commit).

**B1. Note 9 is not covered, and both approved mockups loop an animation that note 9 rules out.**
- The note 9 reading says the snippet's "invented copy, its looping animation and its version badges are not carried over".
- No criterion says this. AC60's header cites note 9, but its body never mentions it.
- Both approved mockups give the "now" dot an endless pulse, `animation: p 2.4s ease-in-out infinite`: status-and-timeline.html:231 and :593, and phase-branches.html:179. It is the snippet's `rcl-blink 2.4s … infinite` (snippet :36 and :72).
- So a Builder working "as drawn" carries the animation over, and no rule settles the clash.
- Fix: add a testable clause to AC57/AC58 (and AC59/AC60), for example: "no looping or entrance animation; nothing moves unless the owner acts; no version badges", with a CSS check in the AC57 and AC60 tests (no `animation` with `infinite`). Name the pulse as a known difference from the mockup.

**B2. AC60 and AC61 make the desk show PR titles as recorded, but AC64 forbids a title that starts with a code, and the real fixture breaks it.**
- AC60 (:2652-2662): a PR with no "What this means for you" paragraph shows "its title as recorded". AC61 (:2742): "nothing is reworded".
- AC64 (:2845-2855): ids are "never as a title", and its test checks "no … sprint title … starts with a code".
- The real titles J12's fixture will hold include:
  - #40 "M1: the desk's read-only status page (S-001 AC1–AC15)";
  - #41 "M1 fix-forward: …";
  - #44 "M2: answering from the desk…";
  - #36 and #43 "Spec S-001 …";
  - #22 "P-001: …".
- None of #1 to #47 has the paragraph. #40, #41 and #44 are the sprints of M1, M2 and M2B. AC60's own test ("its title as recorded") and AC64's test cannot both pass.
- Fix: pick one rule. Either AC64 lets a recorded title be shown as written (and the sandbox PR lists each one), or AC60 sets a fallback for a title that starts with a code without rewording it, such as showing the title in the code role after the plain words "Title as recorded:". Add the case to both tests.

**B3. J12's join-test fixture cannot be made as the spec says.**
- J12 (:3926-3930) says the GraphQL answer is "recorded with `gh api graphql` and kept, as GitHub sent it".
- From these sessions, `gh api graphql` returns HTTP 403: "GitHub GraphQL is not available from Claude Code sessions; use the REST API". I reproduced this with a one-line query against shumpmaster/Service-Desk. The Builder cannot record it.
- The test also needs "the field error for the check rollup". A recording made with a token that can read checks would not contain that error, so that case would be made up, and it is not marked NOT a real record.
- The facts line at :4323 (`gh pr view 77 … --json body`) also goes through GraphQL and fails here. `gh api repos/shumpmaster/Service-Desk/pulls/77` works.
- Fix: move the recording into Setup (owner or Chief of Staff, outside these sessions, with the exact command), or let the fixture be built in GraphQL's answer shape from REST answers, marked NOT as GitHub sent it in tests/desk/fixtures/README.md. Mark the field-error answer as made up. Use the REST command at :4323.

**N1. AC61's forms are said to be "its draft's" (S-032's), but the S-032 draft differs, and one fixed sentence can become untrue.**
- I checked the uncommitted draft at /home/user/poom-s032/specs/S-032-why-and-context.md. Its join J2 adds a `Milestone: M<id>` line to every PR body, and says "A merged pull request with no `Milestone:` line reads as 'Not tied to a milestone'".
- Its Context and Why headings may be any level, may end with a colon, and ignore case. Any indented line continues a bullet. It has a valid exception bullet, `- none beyond the ruling quoted in Why`. A why may not contain ` · `, and ` · dropped` may not come after it.
- AC61(c) and AC60 read none of this. A body valid under S-032 with `### Context` would read "not recorded". The exception bullet would show "source not recorded". A PR carrying `Milestone: MD2` would still be put under "Not tied…".
- AC60's fixed sentence "These sprints don't name the milestone they feed." (:2631) states something the desk never checks: it only knows that no plan line lists them.
- Fix: reword the sentence (for example "No milestone in the plan lists these sprints."). Either take the draft's Milestone line and heading rules on now, or replace "the forms above are its draft's" (:2750) with "a subset of"/"as briefed", and name these differences.

**N2. A shared rule still names only the old joins.**
- :1113 still says "Every screen reads only the records J9, J10 and J11 name". The Timeline now reads J12, and AC61(c) reads PR bodies from J1's open list.
- Fix: add J1's open list and J12 there.

**N3. The spec differs from the approved mockup in places it does not name.**
- Mockup content the spec changes or adds:
  - Design i2's standard milestones are gathered in the mockup ("and 4 more, one tap away", mockup :288). AC57 lists all of them, and its test asserts they are not gathered.
  - The mockup shows no standard milestones in Build i2 or Launch, and no run header in Launch.
  - Earlier runs in the mockup have no why lines.
- Mockup values outside AC62's scales: `.bul .k` padding `1px 6px`, `.bul li` gap `3px`, `.key span` gap `6px` and `.bkey span` padding `1px 6px` (:56, :198, :200, :229); `.etitle` font-size `1.04rem` (:197).
- Sizes AC62 does not cover: the glyph and badge sizes already in sandbox.css (`.sb-badge` .6rem, the ◆ sizes).
- AC62 allows none of these.
- Fix: list them under "Where the build stands" as known differences, and either extend AC62's exceptions (chip padding, glyph sizes) or say the spec's values replace the mockup's.

**N4. Some state words are ambiguous.**
- In AC50's "Run <k> still to come" (:1366), k could be the column run or the phase's iteration. In the three-run example, Launch i2 is iteration 2 but sits in run 3.
- AC58 (:2430) adds "· run <k>" after the state "when the project has more than one run". Read literally, that gives "Run 2 still to come · run 2" and "Finished · run 1", but AC58's test expects "Run 2 still to come".
- AC50's leftover text "Finished phases are ticked" (:1378) sits beside the AC58 replacement.
- Fix: define k as AC57's run, say which rows get the suffix, and strike the tick sentence.

**N5. Some mark rules overlap.**
- AC57 (:2376-2383): a standard milestone marked "not recorded" in a run still to come qualifies for both the empty ring and the dashed ring.
- AC59 (:2547): "the project milestone that makes its run the now run" fits both MD2 and MD3. Say "the first in section 3's order".
- AC59 (:2513): it is not clear whether a standard milestone marked Skipped (by a plan line) whose model state is "not recorded" gets a row or is gathered.

**N6. J12 and AC59/AC60 leave several cases open.**
- AC60's placing rule (:2621) uses a run's "earliest time" without defining it. It needs to say that the named sprints' J12 merge times count; otherwise Build i1 has no times from J11.
- A finished run with no times has no band date.
- The delivery order does not say where a row goes when J12 has failed and its PR sprints have no date.
- J12's "merged (`mergedAt` set), open or closed" (:3903) is garbled.
- A 200 answer that holds `errors` with `data: null`, or a RATE_LIMITED error in the body, is not covered. The function cannot see either, because it does not parse the answer.
- On a head change, J12 says the PRs are read "again" while A3 says "the first page again".
- Keeping up to 300 bodies on the device is unbounded. In store.js, one failed `setItem` turns off storage for the whole blob cache.
- Fix: define each of these, and keep only the fields J12 uses.

**N7. The Builder cannot check whether the check rollup is readable.**
- J12 (:3911): "The Builder records which it is, on the preview's token." The token exists only as a Cloudflare secret, and the preview sits behind Access for the owner.
- Fix: give the check to the owner (the reason shown one tap away) or to the Chief of Staff in Setup.

**N8. One fixed sentence overstates what its link opens.**
- :2681 "Opens this run's commits on GitHub, newest first." A `/commits/<item_tip>` page lists all history down from the tip, not just the run's commits.
- Fix: reword it, or link `compare/<merge>^1...<item_tip>`.

**N9. Two note readings need tightening.**
- The record's reading of note 1, answer 3 ("the Timeline screen uses the same branch drawing") is departed from, though flagged (C) and asked as Open question 1. Either add it to the "later readings govern" list in "Where the build stands", citing the owner's approval of version 6, or get the owner's answer before freezing.
- Note 19 (thinner Status lines) has no value and no test. AC57's test checks no width or opacity, while AC59's does. Cite the mockup's values.

**N10. Two small citation fixes.**
- AC63 cites only :297. The `.sb-words` box at :494 (.9rem, about 14 px) is also under 16 px. "Every textarea" already covers it, but cite it so the Builder sees both.
- AC63 says "Today the answer boxes' text is .88rem"; that is true for one box only.

**Open questions:** none beyond the spec's own seven. B2 and N1 may need the owner, or the S-032 author, to choose.

Files: /home/user/sd-def2/specs/S-001.md, /home/user/sd-def2/decisions/questions/P-001-trial-view-notes-2.md, /home/user/sd-def2/docs/design/mockups/status-and-timeline.html, /home/user/sd-def2/docs/design/mockups/phase-branches.html, /home/user/sd-def2/tests/desk/fixtures/j11-3117150/trace-notes.txt, /home/user/poom-s032/specs/S-032-why-and-context.md. The full check output is in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/checks.txt.
