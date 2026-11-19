# S-014 — the Critic's review of the rewritten locked checks (the adapter-stop ruling's third step)

*Recorded by the Chief of Staff (session_01QBwHGJoFFZQjbMT7zK1HWJ) as `orchestrator`. The owner's ruling, decisions/questions/P-003-S-009-adapter-stop.md (:19): "The Check author, in a sparse worktree, rewrites only the affected baseline cases and checks. A fresh Critic reviews them, for up to three rounds, then a fresh Reviewer, then the owner's verdict". Each round's Critic return, verbatim under its heading; the latest round first, as reviews/S-009/_critic-checks.md does. Each Critic ran read-only in a fresh session, given the diff and the files whole, and not src/**.*

## Round 3, the last — brief critic-10, 2026-11-19, the fix for the Reviewer's N1 only, at build/check-author/S-014-r2 b5e06577 (on 492a22c7)

*The fix's brief: read a question's item-notice key `<project>|question|questions/<name>.md` as card `<name>`, leave every other reading, correct the README, and add one built-side test. Recorder's note: this was the last round the ruling allows, so its two non-blocking findings are carried as known limits, not sent back.*

Verdict: PASS

I checked commit b5e06577 against /tmp/claude-0/fix-n1.diff and the full files in /home/user/wt-review/tests/acceptance/S-009/. The diff touches 3 files, +14 −3: README +3 −1, s009-lib.mjs +4 −2 (two of the added lines are comments), test +7.

**The fix (s009-lib.mjs:232-235, 244-246)**
- The new line is `const q = /^queue\/(.+)\.md$/.exec(k[3]) || (k[2] === 'question' ? /^questions\/(.+)\.md$/.exec(k[3]) : null);`
- The `questions/<name>.md` pattern is tried only when the kind is `question`, and only after the `queue/` pattern fails. So `<project>|question|questions/N-open.md` now gives card `N-open` with kind `question`, and `names(info, 'question:N-open')` is true. That fixes N1.
- No other reading changed:
  - Cards `<project>|card|queue/<id>.md` and gate cards `<project>|gate|queue/<id>.md` still match the `queue/` pattern first, as before.
  - A pull request's key, and any other kind, still takes its id as written.
  - `names()` did not change, apart from its comment.
  - A question key without the `questions/` prefix still reads as before.
- The README (:66-69) now describes this reading correctly and matches line 155's `<project>|<kind>|<id>` form.

**The new test (s009-j5-sender.test.mjs:61-66)**
- The lists are `[[G], [G, Q], [G]]`.
- Run 2 has one item not on run 1's list, Q. So check (3) applies there, and the test asserts that `checkSenderCard` returns `[1]`. This means it fails if (3) never ran, so it is not vacuous.
- Check (1) runs on runs 1 and 3, where Q is not on the list. With the fix, (1) now really tests a question; before the fix it could never fail on one.
- Check (2) requires run 1's summary to count exactly 1 item, which is what "counts every item on that run's list" in line 57 asks for on built cases.
- The test follows line 57's three checks, uses the existing helper in the same style as the two tests above it, and is consistent with line 169. The Check author's report that a fake naming Q on run 3 fails it is what check (1) would do.

Nothing else changed.

**Blocking findings:** none.

**Non-blocking findings:**
1. The comment above `readNotice` (s009-lib.mjs:215-216) still mentions only `queue/<id>.md`. The new inline comment at :232-233 covers questions, but the older comment is incomplete.
2. A question's card is now the bare `<name>`. `names()` also matches when the card equals the list id directly, so a question whose name looked like a card id (`<item>-<gate>-<n>`) would name that card too. Before the fix the card was `questions/<name>.md`, so this could not happen. No case has a name like that, so it does not matter today.

Files: /home/user/wt-review/tests/acceptance/S-009/s009-lib.mjs, /home/user/wt-review/tests/acceptance/S-009/s009-j5-sender.test.mjs, /home/user/wt-review/tests/acceptance/S-009/README.md, /tmp/claude-0/fix-n1.diff, /tmp/claude-0/critic8/S-014.md

## Round 2 — brief critic-9, 2026-11-19, the follow-up commit only, at build/check-author/S-014-r2 4d03a328 (on a7b9567a)

*The follow-up's brief: S-014 marks beside every S-009 join mark, for the governance join check (`v3_checks joins`); round 1's N1 (the desk address held per case); round 1's N2 and N4 recorded in the README. Recorder's note on finding 3: the orchestrator read `readNotice` at 4d03a328 (s009-lib.mjs:225-241): `desk` is the regular expression's address capture for item notices (:231, :233) and Home notices (:238), and `null` only for kind `other` (:240), which fails coverage before its address is added (s009-j7-baseline.test.mjs:124). A README-only commit for findings 1 and 2 followed.*

Verdict: PASS

I checked commit 4d03a328 against its three-point brief and against S-014 lines 11, 148-173, 155 and 169. I read the diff and both after-texts in full. I did not read src/**.

**Point 1 (marks).** Done. Each of the eight join files keeps its `// join-test: S-009/J<n>` line 1 and gains `// join-test: S-014/J<n>` on line 2 (j1 to j8, diff hunks at lines 26-133).
- The files outside line 173's list (j1, j2, j3, j6, j8) change by that one comment line only.
- j4, j5 and j7 are on line 173's list, and they too change only by the mark, apart from j7's N1 edit.
- This does not contradict line 11. Line 11 says the marks "stay `S-009/<J>`", and they do: no S-009 mark is removed or reworded. The S-014 marks are added comments, so test behaviour and the paths the checks name are unchanged.

**Point 2 (N1, one desk address per case).** Correct and not vacuous.
- In s009-j7-baseline.after.mjs, `const desks = new Set()` now sits inside the per-case loop (:120), and `desks.size <= 1` is asserted per case (:131). The cross-case assertion is gone.
- The loop covers `desk` and `sender` cases (:118). For `sender` cases, `infos = senderInfos(r)` holds every run, so all of a case's notices across all its runs feed the set (:121-125).
- A notice whose address is in neither allowed form already fails at :124 before its address is added, so a malformed address cannot slip through the set.
- This matches line 155: "the desk's address, as the adapter gives it to the sender". Line 148 gives the adapter's environment per case, so nothing fixes one address across cases.
- One thing I could not verify: that `readNotice` (s009-lib.mjs, not in my pack, and the working tree is not at this commit) sets `n.desk` for item and Home notices. If it never did, every set would hold only `undefined`, its size would be 1, and the check would pass without testing anything. The Check author's scratch demonstration (two addresses in one case fail; one address per case passes) is the evidence it does. This is unchanged by the commit.

**Point 3 (README, N2 and N4).** Recorded at README.after.md:61-71.
- N2: a summary's or group's count, and its digits rule, are read in the body after the first newline. This matches line 155 ("the first whole number written in digits in `notification.body`, the part of `words` after its first newline") and line 169 ("from which its count is read (line 155)").
- N4: new items are counted by id; the case of one new id plus two content-changed cards might fail check (3) of `checkSenderCard`; no such case exists and none is added. This is consistent with line 169's "one or two items that were not on the run just before's list" and line 151's "A changed `content` tag is a changed card".

**Nothing else changed:** the diff holds only the hunks above.

**Blocking findings:** none.

**Non-blocking findings:**
1. README.after.md:13 says "Only the checks S-014 line 173 names changed". That is no longer exactly true: j1, j2, j3, j6 and j8 now differ by a comment line. Fix: add "(and every join file gains a `join-test: S-014/J<n>` comment beside its S-009 mark, for the governance join check; line 11's S-009 marks are kept)".
2. README.after.md:21 names only `join-test: S-009/J7` for the locked check, and the README never says the S-014 marks exist. Fix: name both marks there, or cover it with the sentence in finding 1.
3. The per-case rule is only as strong as `readNotice`'s `desk` field (see point 2), which I could not read. A later Reviewer with s009-lib.mjs in its pack should confirm that `desk` is the address before `/?open=` or `/`, and is never left undefined for item or summary notices.

Files: /tmp/claude-0/critic9/followup.diff, /tmp/claude-0/critic9/s009-j7-baseline.after.mjs, /tmp/claude-0/critic9/README.after.md, /tmp/claude-0/critic8/S-014.md

## Round 1 — brief critic-8, 2026-11-19, the rewrite, at build/check-author/S-014 fd885445 (on 537d126a; the same commit was replayed unchanged onto the session branch's rebuilt history as a7b9567a on build/check-author/S-014-r2)

Verdict: PASS

I found nothing blocking. Every check that S-014 line 173 names was rewritten as that line says, plus the base commit that line 23 sets. Each rewritten check follows the spec's words, and nothing line 173 says to leave was changed. There are four non-blocking findings. Two of them (N1, N2) are places where a check is stricter than the spec's literal words; neither can fail a correct build, only a non-conforming record before it is made.

**What I checked (point 1, scope)**
- **s009-lib.mjs:**
  - `BASE_COMMIT` (:26) is fca41700…, matching line 23.
  - The output check (:80-84, :98, :100) takes notices in the form `{words, opens}`, one array per run for `sender`.
  - The sender part of `assertViewsAgree` (:201-211) now reads the count difference.
  - `deskProjection` (:288-303) gives notices for line 164.
- **s009-hold-show.test.mjs:** AC1, AC2 and AC4 (:28, :45, :69) read the count difference (0, 1, 1). AC6 (:105-106) and AC7 (:117) pass `{of}`. Only the case variables those calls need were introduced.
- **s009-j4-views.test.mjs:** only :37 changed. :52 and :54 (`sender: false`) are untouched, as line 173 says.
- **s009-j5-sender.test.mjs:** the AC14 `sender` tests (:24-58) and the J5 `desk` test (:72-75) changed. The failed-read loop (:79-82, formerly :48) is untouched.
- **s009-j7-baseline.test.mjs:**
  - rule (b) (:82-87) and the `sender` rule (:107-115);
  - the new rules from line 169 (:116-134);
  - the `sender` comparison (:188).
  - Rule (a) (:104) and the desk comparison (:178, through `deskProjection`) needed no edit and got none.
- **s009-case-set.test.mjs:** the three new case-set rules from line 169 (:54-75).
- **Left alone:** s009-j8-reads.test.mjs, the four `open` cases and every baseline case file are untouched.
- **No other callers:** a grep shows no file outside the rewritten ones calls `assertViewsAgree` or `deskProjection`.

**How the checks match the spec (point 2)**
- **Notice reading (line 155):**
  - An `opens` ending `/?open=<key>` whose key decodes to `<project>|<kind>|<id>` is an item notice with count 1, and `queue/<id>.md` is read as `<id>`.
  - An `opens` ending `/` is a summary on a first run and a group on a later run; its count is the first number in the body, or 0 if there is none.
  - Anything else is 'other' and fails coverage.
- **Line 164:** same number of notices and order, same `opens`, words with the count written `<n>`, and the count less the decision cards on the list. Line 165's notes-to-log target is kept.
- **Line 166:** notices compared as text, run by run.
- **Line 169:**
  - rules (a) and (b);
  - the `sender` rule: exactly one summary, count at least the list;
  - every notice opens Home or an item key;
  - a `desk` result's notices are empty or one summary;
  - summaries and groups hold digits;
  - some `sender` case has an item notice on a later run;
  - all three case-set rules. The existing cases meet them: S009-B-desk-ok has 5 open cards that are not decision cards; the `sender` cases' first lists hold 2–3 items; first-showing's run 2 and leave-return's run 3 each hold one new id.
- **Count difference (line 173):**
  - The card is left out with its queue entry, notes and `card` entries, and the same failures are kept (:258-285).
  - An empty summary counts 0.
  - A failed read gives null.
  - A summary with the card but none without it fails.
- **Line 57's three AC14 checks (j5 :24-46):**
  - Check (3) is not vacuous: S009-X-j5-first asserts it applied, `named` equal to `[2]`.
  - Check (1) covers card X on the runs whose lists lack it.

**Non-blocking findings**
- **N1. One desk address (j7 :117, :124, :132).** The check requires every notice in the record to open from one desk address across all cases. Line 155 assumes "the desk's address, as the adapter gives it to the sender" (one desk), but no line forbids an adapter from giving a different address per case. The risk is low: it bites only before the record is made, the message says what is wrong, and the adapter can still be changed then (line 23). It is acceptable as the reading. The safer fix is to hold it per case. Either way, record the reading in the review.
- **N2. Digits checked in the body, not the whole words (lib :237-238, j7 :125).** Line 169 says the summary's or group's `words` hold a number. The check looks only in the body (after the first newline). This is narrower than the words but matches "from which its count is read" (line 155). Keep it, and note it.
- **N3. README.md edited, though line 173 does not list it (diff :1-33).** Line 173 ends "The Check author rewrites only these", and README.md is neither a check nor a case. The edit changes no behaviour and records the author's readings, which helps a reader. The orchestrator should either accept it explicitly in the review record or have it reverted. It is not a defect in any check.
- **N4. Check (3) counts new items by id (j5 :39-40).** If a later run held one new id plus two cards with changed content, the sender might send one group rather than item notices, and (3) would fail a correct output. No case built in the checks has that shape (j5-first is [[G],[G],[G,X]]), so this is latent only. Do not add such a case without counting changed content as new.

**The six open questions**
1. **The desk's address:** this is the spec's reading. Lines 155 and 169 rely on an address the checks cannot otherwise know, and taking it as the prefix before `/` or `/?open=` is the only reading available from `words` and `opens`. The cross-case one-address rule is the author's addition (N1). It needs nothing beyond noting it; it does not need the owner.
2. **"Counts every item" vs "at least":** equality on the `sender` cases built in the checks is the natural reading of line 57's "counts every item on that run's list". "At least" for the record is line 169's own floor. The leftover tension between line 57 and line 169 sits in the spec itself: if the record ever shows a first-run count above its list's length, j5 :35 would fail on the unchanged sender, and that would be a stop under line 270. Nothing is needed now.
3. **New items by id:** this is the spec's reading. AC14's first case (line 54) calls a card with changed content one that "stays on its list", and line 151 calls it "a changed card", not a new one. Nothing is needed (see N4 for the latent risk).
4. **Question and pull-request keys:** this is harmless. It is used only in check (1), and the cases built in the checks hold only a gate card and decision cards. Nothing is needed.
5. **Extra fields in a notice:** this is the spec's reading. Line 155 says "Nothing else is recorded", and the adapter, not the build, writes this form, so it cannot fail a correct build. Nothing is needed.
6. **`<n>` only in summaries:** this is the spec's reading. A first run has no groups, and line 169 rules out item notices in `desk` results, so an item notice there would already fail on the notice count. Nothing is needed.

On the author's verification claim: going from 62 to 65 tests, with 7 to 10 passing, fits the three new case-set tests, which need neither a record nor a build. I did not rerun the suite or the scratch demonstration, since I have no shell.

Files: /tmp/claude-0/critic8/after/s009-lib.mjs, /tmp/claude-0/critic8/after/s009-j7-baseline.test.mjs, /tmp/claude-0/critic8/after/s009-j5-sender.test.mjs, /tmp/claude-0/critic8/after/s009-hold-show.test.mjs, /tmp/claude-0/critic8/after/s009-j4-views.test.mjs, /tmp/claude-0/critic8/after/s009-case-set.test.mjs, /tmp/claude-0/critic8/after/README.md, /tmp/claude-0/critic8/S-014.md

*Recorder's note on round 1's N3: the orchestrator accepts the README edit. It changes no check's behaviour, records the Check author's readings for the Reviewer and the owner, and README.md says what each file holds, which the rewrite changed.*
