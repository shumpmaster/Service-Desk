Verdict: FAIL

Plan review, round 1. Commit 86474f5 (build/definer/s001-lab-rulings) against base 3117150, specs/S-001.md. Line numbers refer to the new file in /home/user/sd-s001-lab/specs/S-001.md.

Most of the revision holds up. All 32 of the owner's quotes I checked appear word for word in the sources. The figures I checked against the records match: the byte counts, the cron line, the trace's runs, the roster and the five named records all exist. It does not record or presume the owner's pick (lines 49–52 and 784–786), and it does not add "Ask for something in this project". It fails on three points. One screen element has no way in. One value shown on screen has no source. And one owner comment is attached to the wrong part of the screen, while an agreed Home element is dropped without the owner's say.

## Blocking findings

**B1. The prefilled box for the owner's own verdict (AC53) can't be reached from any screen.**
- Lines 1165–1167 define the owner's verdict box (`reviews/<PR>/owner.md`, "Verdict: PASS", then a suggestions line). Line 1190 makes the test check its link at the pull request's head branch.
- But AC52 gives that box nowhere to open from:
  - The "Verdicts to write" group is always a single "not recorded" line (lines 1089–1090), so it holds no items.
  - A merge "opens its pull request in GitHub" (lines 1127–1128), with no box.
  - The Decisions and Gate rulings groups hold only cards and questions.
- So the owner's 13 Oct request has no path in the built screens. The request was pinned to a merge card: "If it is my own statement, It will be very beneficial to have the text box/prefilled content store the structure..." (comments-2026-10.md:120–128). The lab hosts these boxes as rows in "Verdicts to write" (06-queue.html:149 and 153).
- The Builder would have to invent where the box lives.
- Fix: say which queue row opens the owner's verdict box. For example, every open pull request in Merges, with its path at the pull request's head branch, and "not recorded" for whether the file already exists there.

**B2. "Whether it can be acted on yet" (line 1101) has no record or rule behind it.**
- In the lab this value comes only from dependencies: 06-queue.html:96 says "can't be opened until it's ready", and lines 143 and 154 show `blocked: true` with "after #54...".
- The spec itself says no record states a dependency (lines 1104–1105) and lists that as a model change (lines 103–104).
- So the value on every row has no source, which breaks the "no made-up values" rule (line 791, AC41), and no test checks it (lines 1140–1143).
- Fix: drop it, or define it from a named record (with "not recorded" where none applies), and add it to AC52's test.

**B3. An owner comment is attached to the wrong bar, and an agreed Home element is dropped without the owner's say.**
- The 11 Oct comment "Great page - only thing is change this color down here." was pinned to Home's bottom band (comments-2026-10.md:11–13). That band is the dock holding "Tell your Chief of Staff…" (01-home.html:261–262), and the fix made was "the bottom band is neutral grey".
- AC48 (lines 827–830) instead attaches the quote to the project screens' tab bar.
- Meanwhile lines 105–109 and 823 remove that very band. The owner never asked for that. README marks Home "Agreed" and says Home "keeps its 'Tell your Chief of Staff…' bar". The reason given, "the same kind of prefilled request", stretches the owner's question about the queue's "+" ("Im assuming this doesnt write back into anything?") to cover a different element.
- Fix: attach the quote to Home's band. Then either cite an owner word for dropping the bar, or list it as an open question for the owner (deferred until a record it writes is named), not as settled "not built".

## Non-blocking notes

- **N1. Fraction bars on the screens (AC41).**
  - The agreed Home screen fills a bar by `n / 4 * 100%` (01-home.html:63 and 231). AC50 forbids this (line 981), correctly under AC41. The spec should name this difference from the screen, so the Builder doesn't copy the bar (line 786 only covers it in general terms).
  - Likewise, the Team light is filled 60% for "just finished" (03-team.html:116), which reads as a gauge. AC49's "a light that fills while it works" (lines 886–887) should say a finished member's light is never partly filled.
- **N2.** Line 46 says the owner commented on "screens 1 to 7". The comments cover screens 1, 2, 3, 4 and 6 only.
- **N3.** Line 1049 drops a double space from the source ("etc  are", comments-2026-10.md:100), although line 782 promises "exactly as written". Line 1152 does keep its double space. Trivial.
- **N4. The five step records (lines 1053–1055).**
  - The source says "Four steps..." and then lists five paths (comments-2026-10.md:102–105). The spec says "five".
  - More usefully, there is no general rule for "names the record that holds it" beyond these five examples. For instance, a decision step maps to `decisions/<item>/<gate>-<card>.md` and a card step to its queue file. Without a rule, the Builder guesses or hard-codes.
- **N5. Cards with no answer link.** Hold cards sit in Decisions (lines 1085–1086) and merge cards in Merges (line 1091). Neither has an answer link (AC46, AC47), and a merge card has no pull request to open. AC52's option chips, two taps and "A merge opens its pull request" (lines 1117–1128) should exclude them by name.
- **N6. "Done today" (lines 1108–1109) has no time source** for a card's answer file (only the `decision` log time, which is "picked up"). The same goes for a merged pull request: J1 reads open pull requests only. Name the time used, or the "not recorded" case.
- **N7.** The owner's "Responsible for" example group "merges" (lines 900–901) has no record the desk reads. J1 reads open pull requests only, and `status/merges.jsonl` holds the gate's item merges, not the owner's. It would have to show "not recorded".
- **N8.** Deploys (lines 1092–1095): J1's run lists are filtered to the current head (lines 1283–1284). So a deploy waiting for approval on an earlier head disappears once the head moves. State this gap.
- **N9.** J3 (line 1621) still says "The branch is always the default branch", while AC53 (line 1181) adds the pull request's head branch. Amend J3 or point to AC53 from it.
- **N10.** AC53's rule line (lines 1174–1178) leaves out two rules from decisions/README.md: the `User-Override:` line (needed over a user representative's reject) and the phases each gate allows for `Into:`. This is harmless for Service-Desk, whose docs/PROJECT.md section 9 says "The owner is the user.", but the rule line would pass records the Orchestrator rejects in other projects.
- **N11.** The gate case paths (lines 1113–1114) use `<phase>`, but a gate card's gate is `dor`, `criteria` or `launch`. State the mapping (dor → design, criteria → build, launch → launch; docs/gates/_GATE.md:4).
- **N12.** AC51 says "no durations" (line 1042), yet a stall may give a length (line 1047). Say which wins.
- **N13. The now-run rule.** Lines 967–968 say states come from the model's timeline, "never from the desk's own reckoning". But the now-run rule (lines 969–972) is the Definer's own (C), and the trace's `NOTE:` lines carry no "now" marker, so J11's fixture can't check it. Add the expected now run to the fixture. I confirmed by hand that it gives Design i2 at 3117150: MD2 has no sprints.
- **N14.** Ruling 1 says "One panel across projects". Lines 859–861 reinterpret this as the Home cards plus a Team screen per project. That is plausible given ruling 6's "don't cross boundaries", but no owner word confirms it. Worth confirming with the owner.
- **N15. AC14's budget: within it, but the spec should say so.**
  - J11 adds about 18 blobs to a Service-Desk cold load: 13 `intake/requests/Q-*.toml`, PROJECT.md, S-001.md, SURFACES.md, orchestrator.yml and merges.jsonl. That is about one more blob call.
  - This fits A3's 12 calls per opening and A4's one blob call per head change, so AC14's 10,000 holds.
  - But the arithmetic in "Facts relied on" (lines 2553–2557) is not updated. AC42's "add no function call" (lines 689–690) is not literally true, since there are more `/api/blobs` calls.
  - J11 also doesn't say whether these reads count as needed for "read successfully" (Terms, lines 207–208; AC4). That matters because a failed PROJECT.md read would then mean "Can't read".
- **N16.** The roster block includes `chief-of-staff`, and AC49 (lines 884–885) also lists the Chief of Staff separately. Say that the duplicate tile is removed.
- **N17. Proportion.** The heaviest new machinery is the page-side port of the model's Timeline (J11). AC50 and AC51 need it, and the committed `NOTE:` oracle is a good test. The most optional additions are the per-role "Responsible for" groups and the Deploys group. I flag nothing as excess beyond those.
- **N18.** The Working now sheet's "Next" (line 938) applies J9's "returned" wording while the item is still dispatched. That is a fixed statement, not a record, so it might be labelled as such.

## Open questions

1. Does the owner want the Home "Tell your Chief of Staff…" bar kept, deferred or dropped (B3)?
2. Is "one panel across projects" in ruling 1 met by the Home cards (N14)?
3. Where should the owner's verdict box open (B1)?

## What I ran (read-only)

- `git diff 3117150..86474f5 -- specs/S-001.md` (only S-001.md changed). I read every added hunk and the J1, J3, J6, J9, AC14 and "Facts relied on" text.
- Read decisions/questions/P-001-design-lab-1.md, docs/design/references/comments-2026-10.md and docs/design/README.md. Grepped docs/design/screens/01-home.html, 02-project.html, 03-team.html and 06-queue.html (bars, the dock, blocked rows, verdict rows).
- A Python script (`-I`, in my scratchpad) checked 32 owner quotes against the sources, with whitespace normalised: all present.
- `python3 governance/checks/v3_checks.py trace --root .`: the runs are Discovery i1, Design i1, Build i1, Design i2, Build i2 and Launch i1, with MD1–MD3 in Design i2, as J11 states.
- `wc -c` on docs/PROJECT.md and S-001.md, current and at 3117150: 47,001 and 173,985 bytes, both correct.
- Checked these files:
  - orchestrator.yml:17: `*/30 * * * *`;
  - the roster block in governance/SURFACES.md;
  - orchestrator.py:125–130 and 299–317;
  - the five decision and queue records;
  - decisions/README.md;
  - reviews/README.md and review_check.py:54–85;
  - docs/gates/_GATE.md;
  - section 9 of docs/PROJECT.md;
  - the fields in status/outcomes.jsonl;
  - the triggers in .github/workflows.
- I also checked the added lines for gendered pronouns: none.
- No files were changed.
