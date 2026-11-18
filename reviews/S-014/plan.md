# Plan review of S-013 — the Critic's returns, verbatim

*Recorded by the Chief of Staff (session_01QBwHGHvmB1hNt9ywcps1NX). Each round's return is copied unchanged below its heading. The Critic ran read-only in a fresh session, outside the loop, as S-009's rounds did.*

## Round 1 — brief critic-2, 2026-11-18, against specs/S-013.md at build/definer/S-013 59a17a1c

Verdict: FAIL

S-013 plan review (D-043), round 1. Read-only. Brief critic-2.

**Line-by-line comparison (check 1).** I compared S-013 with S-009 line by line, both whole. These lines differ: 1, 3, 4, 11, 14, 18, 57, 154, 155, 164, 166, 169, 173, 199, 230, 242, 265, 270, 275, 295 and 296; 289 and 290 are new; 298 to 310 are new. Every one of them is named in line 11's list. Every other line, including S-009's 289 to 295 as S-013's 291 to 297, is the same word for word. Each change falls inside the ruling's scope: J7's notices, AC14's comparison, and the coverage and the stop, risk, fact, limit, sign-off and brief lines that serve them. The header names M4, and M4 is in section 3 of docs/projects/P-003.md (:46).

### Blocking findings

**1. Lines 155, 148 and 242: the notice form cannot be recorded "as caught" from the push call. The adapter must decrypt the call's body, and the spec neither says so nor allows it.**
- The push call the fake `fetch` catches does not carry the notice's text or address. `pushOnce` sends `body: encrypted`, which is `encrypt(...)` with aes128gcm, RFC 8291 (src/notify/webpush.mjs:147-153, :102-119). The words and the address are inside the encrypted payload: `{ web_push, notification: { title, body, navigate, tag } }` (webpush.mjs:128-130). The only cleartext text field is the `Topic` header, which is the hashed key.
- So the only way to get `words` and `opens` is to decrypt with the fake subscription's private key. tests/desk/notify-helpers.mjs:117-140 has `makeSubscription` and `decryptPush` for this, and its fake push service already decrypts (:2, :516-518). The probe must have done the same.
- Line 148 limits the adapter to "only picks fields, sorts and writes `<id>`", and nothing outside these fields "works out" an output field. Decrypting is in neither list. A strict Reviewer could refuse the adapter, or the Builder could stop again on the same rule that stopped the first dispatch (docs/handoff/2026-11-13-chief-of-staff-p002-51.md:19).
- Line 155's "each text field it carries, in the order it carries them" is undefined against the real payload. Read literally, it pulls in `navigate`, which is the address, and `tag`, which is the topic made from the key. Line 155's own next sentence excludes the key ("No other part of the call is recorded"). Line 242 admits "The push call's fields are not in the reading", and the spec cites neither webpush.mjs nor words.mjs.
- Fix: state the form in full.
  - The caught call's body is the encrypted payload (webpush.mjs:128-130, :147-153).
  - The adapter decrypts it with notify-helpers.mjs's `decryptPush` and the subscription it made, and decrypting is allowed under line 148.
  - `words` is `notification.title` and `notification.body`, joined by one newline (words.mjs:40-48 shows summary and group text, :30-37 item text).
  - `opens` is `notification.navigate`.
  - `tag`, the `Topic` header and the JWT are not recorded.
  - Add webpush.mjs, words.mjs and notify-helpers.mjs to the list at lines 298-310.

**2. Line 57 (AC14's restated test): no J7 case kind can run it.**
- The test "runs the sender over a chosen sequence of records and moments". It must bring a card to its first showing "on a run after the first with one or two newly shown items, where an item notice names it".
- J7 gives a `desk` case one run, which is always a first run (line 155: "A `desk` case's one run is a first run"). A `sender` case takes card lists handed in at J5's point, not records, so the built rule never runs in it (line 151).
- So no case form drives the built rule through several sender runs. The Check author, who cannot see src/, has no route for the naming half of this test.
- This is also in effect the "new case form" that open question 14's option B (line 289) offers as a further spec. The criterion as restated and the question disagree on whether it exists.
- Fix, either of:
  - (a) Restate AC14's test on what J7 can give. Use count-only checks on `desk` cases at moments before and after a card's showing: a held card is not counted, and the count rises by one at first showing. Leave per-card naming to the `sender` cases.
  - (b) Define the multi-run, records-driven case form. That changes J7's case form and needs saying as within the ruling's scope, or putting to the owner.

**3. Line 173 (what the notice form touches) is incomplete, and it limits the Check author to "only these".**
Line 173 names s009-j7-baseline.test.mjs, s009-case-set.test.mjs and "whichever criterion check reads the sender's notices" (AC14's). The locked checks read `notices` in S-009's old id-list form in many more places:
- s009-lib.mjs:88-91: the output validator. It rejects every new-form result, so every case becomes "a failed run" (line 157).
- s009-lib.mjs:194: `assertViewsAgree`, which checks `notices.includes(id) === on_list`. It is used for AC6 and AC7 (s009-hold-show.test.mjs:98-99, :109) and is AC11's per-card agreement with the sender.
- s009-lib.mjs:202: `deskProjection`, the J7 comparison.
- s009-hold-show.test.mjs:25, :41 and :64: AC1, AC2 and AC4 assert a card's id in a `desk` result's `notices`. A `desk` result now never holds an item notice (lines 154, 169), so AC2's and AC4's checks cannot pass on any build.
- s009-j5-sender.test.mjs:18-48 and s009-j8-reads.test.mjs:23-82.

The spec cites README.md:11-15 for the list, but that range does not say which checks read notices.

The spec also does not say how AC1's, AC2's, AC4's and AC11's notification parts are to be checked on the new form. Open question 14 (line 289) tells the owner that "AC11's and J5's tests on the built code check that the sender's list holds each card in the state the desk gives it". On the new form no adapter output shows the sender's list card by card: `desk` gives a count, and `sender` takes lists handed in. Today's check for this (s009-lib.mjs:194) is one the new form breaks. So the question rests on a guard the spec does not restate. That is a claim no record supports, in a question going to the owner.

Fix:
- List every touched check, including s009-lib.mjs, hold-show, j5-sender and j8-reads.
- Say how each per-card notice check is read on the new form, for example by count difference with one decision card varied.
- Make question 14's statement about AC11 and J5 match what those checks can then show, or say the per-card guard on the built sender is by count only.

### Non-blocking findings

- **N1. Lines 155 and 169 (a summary of zero, and pushes that open Home but are neither summary nor group).**
  - `summaryWords(0, ...)` writes "nothing waits on you now", with no digit (words.mjs:46; sender.mjs:299-301). A `sender` case whose first run's list is empty therefore fails coverage under line 169's digit rule. The case set should be held to a non-empty first run, or the zero summary named.
  - The back-on and test notices also open Home (sender.mjs:214, :222). The cost notice opens `?open=actions-usage`, which is not a `<project>|<kind>|<id>` key (:306). Line 155's kind rule would misread all of these. Pinning the adapter's env to the reading's names only (_src-reading.md:270: no `DESK_NOTIFY_TEST`, no billing token) would rule them out, and line 148 should say so.
- **N2. Line 155's reason for excluding the key is weak.** It says a summary's key "holds the run's time" (:270), so it is not the same text from run to run. But the adapter fixes the clock to the case's `moment` (line 147), and the state key comes from the adapter's env, so the summary's topic is fixed for a given case. Excluding it is still right, because `tag` and `Topic` are keyed hashes and not what the owner reads. The reason should say that.
- **N3. Line 270 (the stop rule).** Line 242 adds the stop "or the adapter cannot read a caught push". Line 270 covers it only by implication ("the adapter cannot run at the base commit"). Name it.
- **N4. Line 230 overstates what the session checked.** It attributes the citation sender.mjs:24, :99-101, :240, :269-297 partly to "checked by the session (:24)". The session checked :269-283 (handoff :24); the item-notice lines :284-297 are not in its check. I read :284-297 myself, and they support the claim. The attribution should be narrowed.
- **N5. Line 265 versus the probe's later run.** The probe's later run on the same records sent a group of 6 (handoff :22). If state had been handed back, a later run on unchanged records sends nothing new. So the probe's state passing is itself unconfirmed. The spec cites the push correctly, but it should not read as evidence that state is handed back. The coverage rule at line 169 is the right guard.
- **N6. Line 3 (the spec id).** The worktree's specs/ holds S-001, S-009 and S-013. I could not check main or the item branches (no git access). S-013 is accepted on the session's check of 2026-11-18. Line 3's re-check before merge stands.
- **N7. Open questions 14 and 15 (lines 289-290).** Both have options and a recommendation with a reason, and line 18 sends the criteria change and both questions to the owner under the ruling's :18. Question 15 is fair. Question 14 is fair apart from the claim in blocking finding 3.

### The join-up review section's finding

Present, in the docs/design/JOIN_UP_REVIEW.md form: screens listed, the five-check table, needed changes to the records, and a sign-off. It is carried from S-009 unchanged except the sign-off at line 199. That sentence ("the notices the owner gets are today's (AC14), and only the record's form of them changes") is accurate: AC14's sending rule is unchanged, and nothing under src/notify/** changes. No new difference arises. The two non-blocking differences (absence on the board and in notices while a read fails; "That no longer waits on you" for a held card) stay carried as risks (open questions 5 and 12). No blocking difference.

### Files you needed and did not have (or "none")

These are outside the brief's list. I read them to check lines 148, 155, 169 and 173:
- /home/user/sd-definer-S013/src/notify/webpush.mjs (:102-130, :147-168)
- /home/user/sd-definer-S013/src/notify/words.mjs (:20-48)
- /home/user/sd-definer-S013/tests/desk/notify-helpers.mjs (:1-140)
- /home/user/sd-definer-S013/tests/acceptance/S-009/s009-lib.mjs (:78-207)
- /home/user/sd-definer-S013/tests/acceptance/S-009/s009-hold-show.test.mjs
- matching lines in /home/user/sd-definer-S013/tests/acceptance/S-009/s009-j5-sender.test.mjs and /home/user/sd-definer-S013/tests/acceptance/S-009/s009-j8-reads.test.mjs

Not available: git access to main and the item branches, for the S-038 id re-check (N6).

I did not re-read the records cited only by lines carried word for word from S-009, which passed plan review round 6 (reviews/S-009/plan.md). My findings rest on the changed lines and the files above.

## Round 2 — brief critic-3, 2026-11-18, against specs/S-013.md at build/definer/S-013 61e9fe23

Verdict: FAIL

S-013 plan review (D-043), round 2. Read-only. Brief critic-3, against specs/S-013.md at build/definer/S-013 61e9fe23.

**Line-by-line comparison (check 1).** I had no diff tool, so I compared by reading.
- **Read side by side in full:** lines 1-25, 53-57, 146-173 and 196-297 of both specs.
- **Spot-checked:** the rest, including every `join-test` line (83, 97, 106, 116, 122, 145 and 181 are the same in both).
- **Lines that differ:** 1, 3, 4, 11, 14, 18, 57, 148, 154, 155, 164, 166, 169, 173, 199, 230, 242, 265, 270, 275, 295 and 296. Lines 289-290 and 298-316 are new.
- **Lines carried over:** S-009's 289-295 are this spec's 291-297, with only 295-296 changed.
- **Line 11:** it names every one of these. I found no other line that differs.
- **Scope:** each change stays within J7's notices, AC14's test, and the comparison, coverage, stop, risk, fact, limit, sign-off and brief lines that serve them.
- **Milestones:** the header names M4, which is in section 3 of docs/projects/P-003.md (:46).
- **Spec id:** S-013 is accepted on the session's check of 2026-11-18.

### Round 1's findings
- Blocking 1 (the notice form could not be recorded without decrypting): **fixed**. Lines 148 and 155 allow decrypting with `decryptPush` and the subscription the adapter made. `words` is `notification.title` + newline + `notification.body`, and `opens` is `notification.navigate`. `web_push`, `tag`, `Topic` and the `Authorization` JWT are not recorded. Lines 242 and 270 carry the stop. Every field name and line cited matches webpush.mjs:98-130 and :142-153, sender.mjs:162-170, words.mjs:19-48 and notify-helpers.mjs:117-149 and :516-522.
- Blocking 2 (no case kind could run AC14's test): **fixed** by option (a). Line 57 checks by count on `desk` cases and card by card on `sender` cases. Its stated limit, that a card shown by the built rule is never checked by name, is honest and matches open question 14. But see new blocking finding 1.
- Blocking 3 (line 173 left out checks that read `notices`): **fixed**. A grep of tests/acceptance/S-009/ finds `notices` only in s009-lib.mjs (:88, :90-91, :194, :202), s009-hold-show (:25, :41, :64), s009-j5-sender (:18-19, :24-25, :40-42, :48), s009-j7-baseline (:78, :95, :99, :150) and s009-j8-reads (:23, :32, :42, :49, :61, :82). Line 173 names each one, plus the indirect uses through `assertViewsAgree` (hold-show :98-99 and :109; j4-views :34, with :49 and :51 set to `sender: false`). The way it says each is read on the new form is correct. Question 14 now says the built code's per-card sender checks are by count only.
- N1 (the zero summary, and pushes that open Home but are neither summary nor group): **fixed**. Line 148 pins the environment to the reading's names and leaves out `DESK_NOTIFY_TEST` and `DESK_BILLING_TOKEN` (secrets.mjs:45; costs.mjs:53 returns before any usage read). It also pins one subscription and accepts every push, so no test, cost or "back on" notice is sent. Line 169 adds the rule that every notice opens Home or an item key, and that a `sender` case's first run's list is not empty.
- N2 (the reason for leaving out the key): **fixed**. Line 155 now says the topic is a keyed hash and the JWT a signature, which the owner never reads.
- N3 (the unreadable-push stop): **fixed** at line 270 and in the brief at line 295.
- N4 (what the session checked): **fixed**. Line 230 now matches handoff :24.
- N5 (the probe's later run): **fixed**. Line 265 now says that push does not show state handed back (sender.mjs:242).
- N6 (the spec id): stands as accepted, per the brief.
- N7 (open questions 14 and 15): **fixed**. Question 14's claim now matches line 173.

### Blocking findings (new)

**1. Line 57 (AC14's test), and line 169's case-set rule repeated at line 173: "one or two items on no earlier run's list" does not match when today's sender sends item notices.**
- **What the code does:** today's sender re-sends any item that was not on the run just before. `next.keys` is rebuilt only from this run's set (sender.mjs:237-250), so an item that left the list and came back has no entry in `prev.keys` and is in `toSend` again. Whether a later run sends item notices or one group depends on `toSend.length` (:276, :284), not on how many items were never on any earlier list.
- **Where line 57 goes wrong:** take the runs `[[A,B],[A],[A,B,X,Y]]`. The third run has two items on no earlier run's list (X and Y), so line 57's test expects an item notice naming X. But B has come back, so `toSend` holds three items, and today's unchanged sender sends one group (:276-283). A Check author writing AC14's test from line 57 could write a check that fails on a correct build.
- **The same flaw in line 169's case-set rule:** "at least one `sender` case has a run after its first whose list holds one or two items on no earlier run's list" is meant to make sure the record shows an item notice. A case set can meet it and still record none. The record then fails coverage, and the build stops on a sound base commit.
- **What happens today:** the current cases are not affected. S009-B-sender-first-showing's second run sends one item notice, and so does S009-B-sender-leave-return's third run.
- **Why it is blocking:** this criterion text goes to the owner, and it misstates today's sender.
- **What would fix it:** in line 57, and in the case-set rule of lines 169 and 173, say "one or two items that were not on the run just before's list (every push being accepted, line 148)", or "one or two items to send", as line 230 and line 57's own first sentence already put it. Line 290's summary of the case-set rule would then match.

### Non-blocking findings
- **N-a. Line 164 (the `desk` comparison of `words` once the count is written `<n>`): it breaks when the count is 1.** `summaryWords` writes "1 thing waits on you now" for one item and "<n> things wait on you now" for more (words.mjs:46). If a built result's count falls to 1 where the record's was higher, its words differ after the `<n>` rewrite and a correct build fails. This happens when the case holds exactly one open card that is not a decision card and every decision card is held. Today's baseline `desk` cases each hold five cards that are not decision cards, so it does not happen now. But no case-set rule prevents it: the open-card rule asks for only one open card. Either have the case set hold at least two open cards that are not decision cards in each no-failure `desk` case, or compare `words` with the singular and plural forms treated as the same. Round 1 reviewed line 164 and did not raise this. I flag that as a miss in round 1's check, not a finding against this draft's change.
- **N-b. Line 148: the state key across runs.** Handing state back works only if `DESK_NOTIFY_STATE_KEY` is the same on every run of a case. Otherwise `lookupState` cannot read the state (sender.mjs:86-98) and nothing is sent. Line 148 pins one subscription for all of a case's runs but not one state key. "as tests/desk/notify-helpers.mjs does" (:490, one `stateKey` per harness) implies it, and the rule at line 169 that some case must name a card on a later run would catch a mistake. Saying it outright, as for the subscription, would leave no doubt.
- **N-c. Lines 155 and 166: kind and count are derived, not recorded.** The ruling (:1, :17) asks for each notice to be recorded with "its kind ...; its count; and where it opens". The record holds `words` and `opens`, and the checks derive kind and count from those and from the run's place in the case. This is a fair reading, and line 155 sets it out. But a Home notice on a later run that finds no state is a summary, and it would be read as a group. Only line 169's later-run item-notice rule catches that. The owner sees this through question 15, so it is acceptable as it stands.

**Checks 5 to 9.** Checks 5, 6 and 8 are covered under round 1's findings above, and 9 at the top.
- **Check 6 (consistency):** apart from blocking finding 1 and N-a, lines 164, 169, 230, 242, 265 and 270 agree with each other and with the code. Every new stop (the `notices` comparison, a push that cannot be decrypted, coverage) is in line 270 and in the brief at line 295.
- **Check 7 (citations and questions):** every claim I checked cites a record that says it. Questions 14 and 15 are fair, each with options and a recommendation with its reason. Line 18 sends line 57, the notice form, its comparisons and coverage, and questions 14 and 15 to the owner under the ruling's :18.

### The join-up review section's finding
It is present in the docs/design/JOIN_UP_REVIEW.md form: the screens listed, the five-check table, the needed changes to the records (none), and a sign-off. It is carried from S-009 unchanged except the sign-off at line 199. That sentence is accurate: the notices the owner gets are unchanged (AC14, no change under src/notify/**), and only the record's form of them changes. It goes to the owner with the criteria. No new difference arises. The two non-blocking differences are still carried as risks: a card's absence on the board and in notices while a read fails (open question 5), and "That no longer waits on you" for a held card (open question 12). No blocking difference.

### Files you needed and did not have
- None outside the brief's list; I read only listed files.
- I had no diff tool, so lines 26-52, 58-145 and 174-195 were spot-checked rather than compared word for word.
- I had no git access, so I could not see the earlier draft (59a17a1c) or main and the item branches. The S-038 id re-check was accepted on the session's word, as the brief says.

Key files:
- /home/user/sd-definer-S013/specs/S-013.md
- /home/user/sd-definer-S013/src/notify/sender.mjs (:237-250, :276-297 for blocking 1)
- /home/user/sd-definer-S013/src/notify/words.mjs (:46 for N-a)
- /home/user/sd-definer-S013/tests/desk/notify-helpers.mjs (:117-149, :482-529)
- /home/user/sd-definer-S013/tests/acceptance/S-009/ (the checks that read `notices`, listed above)

*Session note (not the Critic's words): the Critic had no diff tool. The session's `diff` of S-009 lines 1-288 against S-013 lines 1-288 at 61e9fe23 gave exactly the hunks 1, 3-4, 11, 14, 18, 57, 148, 154-155, 164, 166, 169, 173, 199, 230, 242, 265, 270 and 275.*

## Round 3 — brief critic-4, 2026-11-18, against specs/S-013.md at build/definer/S-013 215fe4b0

Verdict: PASS

S-013 plan review (D-043), round 3. Read-only. Brief critic-4, against specs/S-013.md at build/definer/S-013 215fe4b0.

**Line-by-line comparison.** I used the session's saved diff, S-009-vs-S-013.diff. Its hunks are exactly:
- lines 1, 3-4, 11, 14, 18, 57, 148, 154-155, 164, 166, 169, 173, 199, 230, 242, 265, 270 and 275;
- 289-290 added;
- S-009's 293-294 changed as this spec's 295-296;
- 298-316 added.

Line 11 names every one of these, and no other line differs.

The round-2-to-round-3 diff touches only lines 11, 57, 148, 164, 169, 173, 290, 302, 306 and 308-310. That matches line 11's Round 3 list.

**Scope and milestones.**
- Every change stays inside the ruling's scope: J7's notices, AC14's test, and the comparisons and coverage rules on that form (decisions/questions/P-003-S-009-adapter-stop.md:1, :17, :21). No change under src/ is planned.
- The header names M4. M4 is a project milestone in section 3 of docs/projects/P-003.md (:46), the plan of item P-003.
- Spec id S-013 is accepted on the session's check, as the brief says.

### Round 2's findings
- **Blocking 1 ("on no earlier run's list"): fixed.**
  - Lines 57, 169, 173 and 290 now say "one or two items that were not on the run just before's list (every push being accepted, line 148)". That is true of sender.mjs:
    - `next.keys` is rebuilt only from this run's `c.set` (:237-250). An item not on the run just before has no `prev.keys` entry, so it goes into `toSend`.
    - With every push accepted, every item of the run just before is kept as `sent` (:242, :273, :281, :294).
    - So `toSend` holds exactly the items not on the run just before. With one or two of them, the sender sends an item notice for each (:276, :284-297).
  - I checked the edge cases. `[[A,B],[A],[A,B,X,Y]]` gives a group of 4, and the new wording says that. `[[A],[],[A]]` gives an item notice for A, and the wording agrees.
- **N-a (count of one): fixed.**
  - Line 169 adds a case-set rule: at least two open non-decision cards in each no-failure `desk` case.
  - Line 164's claim that no compared summary counts one holds, failing cases included.
  - **No-failure case:** rule (b) puts the record's count at or above the case's open cards. The record's decision cards on the list are at most its decision cards. So the record's count less those cards is at least the non-decision cards, which is 2 or more. A correct build's count less its own decision cards on the list equals that, so its count is at least 2, and its words are the plural form (words.mjs:46).
  - **Failing cases:** with `queue` or `log` failing, rule (a) leaves the record's `notices` empty. With `notes` failing, line 165 compares the build's result with the `log`-failing record result, which is empty. On a failed read the built sender sends nothing (J8). So no summary is compared.
  - **AC16:** on a failed queue/ or notes read no decision card is shown and the sender sends nothing. That adds no compared summary.
- **N-b (one state key): fixed.**
  - Line 148 pins one `DESK_NOTIFY_STATE_KEY` for all of a case's runs.
  - The citations hold:
    - sender.mjs:86-98: a state that cannot be read, which includes a signature under another key ("forged", state.mjs:191), sends nothing and returns.
    - state.mjs:2-4: the state is signed under `DESK_NOTIFY_STATE_KEY` and used only when its signature matches.
    - notify-helpers.mjs:490: the harness keeps one `stateKey` for all its runs (:499).
- **N-c:** needs nothing, as round 2 said. Not changed.

### Check 4: today's cases against the case-set rules as now worded
- **Twin rule:** every failing `desk` case (log-path, notes-path, queue-call, queue-path) has S009-B-desk-ok's records and moment. Every failing `open` case has its no-failure twin.
- **Open-card rule and the new two-card rule:** S009-B-desk-ok holds 5 non-decision open cards: P-101 dor, P-102 criteria, P-103 launch, question release-timing and pr 7.
- **First run's list not empty:** the `sender` cases' first runs hold 3, 2 and 2 items.
- **A later run with one or two items not on the run just before's list:**
  - S009-B-sender-first-showing, run 2: P-105-failure-1.
  - S009-B-sender-leave-return, run 3: P-104-stop-1.

Line 173's statements about these cases are accurate. s009-case-set.test.mjs does not yet check the new rules, and line 173 has the Check author add them.

### Check 5: the spec as a whole
- **Line 173's list of checks:** a grep for `notices` under tests/acceptance/S-009/ finds exactly the lines line 173 names. The indirect uses through `assertViewsAgree` are hold-show :98-99 and :109, and j4-views :34, with :49 and :51 set to `sender: false`. The way line 173 says each is read on the new form fits the built-only cases (s009-hold-show, s009-j5-sender).
- **Stop rule:** line 270 carries the `notices` comparison and the unreadable push.
- **Line 18:** sends line 57, the notice form, its comparisons and coverage, and questions 14 and 15 to the owner under the ruling's :18.
- **Questions 14 and 15:** fair, each with options and a recommendation with its reason. Question 15 now names both case-set rules.

### Blocking findings (new)
None.

### Non-blocking findings
- **N1. Line 290 (question 15), how the owner reads it.**
  - The sentence "at least one `sender` case must name a card on a later run, with a case set written for that: …" puts the `desk` two-card rule under "a case set written for that". That rule does not serve naming a card. It serves line 164's exact comparison of `words`, and its own reason is given after it.
  - Option B ("drop the others") does not say whether the two case-set rules go too. The `desk` rule is needed under either option, since line 164 is unchanged.
  - Fix, if wanted: give the `desk` rule its own clause, and say it stays under B.
- **N2. Line 173 (a card's count difference) on a summary of zero.**
  - The count difference reads each summary's count from digits (line 155). A case with the varied card left out that holds no other open card gives "Notifications are on: nothing waits on you now" (words.mjs:46; sender.mjs:299-301). That summary has no digit, so the count difference is undefined.
  - Today every built-only `desk` case carries `background()`, which holds three non-decision open cards (s009-lib.mjs:155-162), so this does not arise now. No rule holds built-only cases to it.
  - Fix, if wanted: either read the zero summary as 0, or require each built-only `desk` case to hold an open card besides the varied one.
  - Rounds 1 and 2 reviewed line 173's count difference and did not raise this. I flag it as a miss in those checks. I made neither of them, so it does not implicate my own earlier check (D-050).
- **N3. Line 164's reason.** For failing cases it rests the claim on "each failing `desk` case has a no-failure twin with the same records". What actually makes it true is rule (a) (empty `notices`) and line 165 (`notes`-failing compared with `log`-failing). The conclusion holds either way. Naming rule (a) and line 165 would make the reasoning exact.

### The join-up review section's finding
- It is present in the docs/design/JOIN_UP_REVIEW.md form: screens checked, the five-check table, needed changes to the records (none), and a sign-off.
- It is carried from S-009 unchanged except the sign-off at line 199. That sentence is accurate: the notices the owner gets are today's (AC14, no change under src/notify/**), and only the record's form of them changes. It goes to the owner with the criteria (adapter-stop :18).
- No new difference arises. The two non-blocking differences stay carried as risks: a card's absence on the board and in notices while a read fails (open question 5), and "That no longer waits on you" for a held card (open question 12).
- No blocking difference.

### Files you needed and did not have
- None outside the brief's list.
- I did not re-read the records that only lines carried word for word from S-009 cite, nor the S-008 extract, the handoff or the P-001 ruling. Earlier rounds checked those, and no round-3 change touches them.
- I had no git access, so the S-038 id re-check rests on the session's check, as the brief says.

Key files:
- /home/user/sd-definer-S013/specs/S-013.md (lines 57, 148, 164, 169, 173, 290)
- /home/user/sd-definer-S013/src/notify/sender.mjs (:86-101, :237-250, :267-302)
- /home/user/sd-definer-S013/src/notify/state.mjs (:1-5, :187-198)
- /home/user/sd-definer-S013/src/notify/words.mjs (:44-48)
- /home/user/sd-definer-S013/tests/desk/notify-helpers.mjs (:482-529)
- /home/user/sd-definer-S013/tests/acceptance/S-009/cases/baseline/ (the 12 case files)
- /home/user/sd-definer-S013/tests/acceptance/S-009/s009-lib.mjs, s009-case-set.test.mjs, s009-hold-show.test.mjs, s009-j5-sender.test.mjs
