# Build review (Reviewer), round 1, of M3A Work ahead at f8ba84d (verbatim)

Verdict: FAIL

One blocking finding (A), and it is small. The estimate-only exception accepts `Milestone:` values that the spec says must be placed like any other pull request. Everything else checks out or is a non-blocking note. After A is fixed, I expect a PASS with notes.

For the owner:
- The rough-finish dates are right. I checked them against the spec's worked example, the Chicago time zone, the 1 Nov clock change and the year's end.
- The plain desk at `/` has no Work ahead control or screen. Only the sandbox shows it.
- The test copies of Service-Desk's records match the real ones exactly. None of your private project's files were copied.
- One rule is looser than the spec: a rough-estimate pull request with an odd space inside its brackets would still be hidden from the Timeline. This is a few minutes' fix.
- Two wording slips you could notice:
  - Right after you record your own plan, the screen says "A newer plan was recorded; your draft was set aside", even though the new plan is yours.
  - While your milestones can't be read, "Record plan" stays active and would record an empty plan over your current one.

**Re-run:** build PASS; `npm test` 717 of 717 pass.

**A. BLOCKING — AC60's exact match is not exact (Builder).**
- Where: src/lib/feed.js:345 rebuilds `none (${ml.none})`. `ml.none` comes from src/lib/pulls.js:49 and :113 (`/^none \((.+)\)$/`, then `.trim()` on the inside), so spaces inside the brackets are lost.
- Reproduced with keptPull and estimateMerge, on a planning project whose only changed path is `intake/estimates.jsonl`:
  - `none ( a rough estimate)` → true (should be false);
  - `none (a rough estimate )` → true (should be false);
  - `none (A rough estimate)` → false (correct);
  - `none  (a rough estimate)` → false (correct).
- Spec: AC60 says the line is "trimmed, is exactly `none (a rough estimate)`" and "One that… carries another `Milestone:` line… is placed as any pull request". The brief says "an exact trimmed `Milestone:` match". So the Builder's admitted slip does break the spec.
- Fix: compare the whole trimmed line, which J12 may keep. Add the two cases above to j12-ac60-ac66-estimates.test.mjs:148.

**B. Non-blocking — "Record plan" offers an empty plan while milestones are unread (Builder).**
- Where: src/lib/workview.js:211-219 builds the link even when `v.unread` is not empty or `ready` is false.
- Reproduced with viewOf, a current plan, and docs/PROJECT.md left unread: `record.ok` is true and the body has the header and no rows, with `Supersedes: 2026-10-18T1130Z-01`.
- If committed, that empty plan becomes current ("no ordering preference", J4), and the owner's order is gone from the desk and from the Chief of Staff's guide.
- Suggest: disable the link until `ready` and at least one row exists.

**C. Non-blocking — set-aside notice after the owner's own plan lands (Definer).**
- Where: workview.js:144 and sandbox.js:2136-2140.
- Reproduced in the page harness: move a row, follow "Record plan", commit that body. The screen shows "Current plan recorded 18 Oct, 13:01" plus "A newer plan was recorded; your draft was set aside".
- This follows the spec's wording, but it misleads on the main path. The Definer should rule whether a landed plan whose order equals the draft clears the draft without the notice.

**D. Non-blocking — wrong state words when the plan can't be read (Builder/Definer).**
- Where: workview.js:203.
- With a plan that can't be read and no move made, the line reads "Draft not recorded · your changes are on this phone only", but there are no changes. The same happens for a plan that hasn't been read yet.
- AC24 offers only two endings, so the Definer may need to give a third.

**E. Non-blocking — J15's ask has no visible copy fallback (Builder).**
- Where: sandbox.js:2100.
- When `link.copy` is set, the ask gets only a silent clipboard write: no words and no copy button. AC17's fallback, which J15 names, is tested only at view level (j4-j14-j15-work-ahead.test.mjs:341-344).
- It can't happen today: asks are about 150 characters against the 6000 cap, and Service-Desk takes prefilled content.

**F. Non-blocking — copy words only fit one cause (Builder).**
- Where: sandbox.js:2086.
- "Too long for a link…" also shows when the repository doesn't take prefilled content, where it would be wrong. Service-Desk takes prefilled content, so this can't show today.

**G. Non-blocking — impossible dates are read (Builder).**
- Where: workahead.js:235.
- J14 reads `2026-02-30T17:00:00Z` as a good line, because Date.parse rolls it over to 2 Mar. J14 says "a `time` not in that form" is malformed.

**H. Non-blocking — the Home control's arrow (Builder).**
- Where: sandbox.js:911.
- It draws as "Work ahead›" with no space, because the `inline-flex` drops the span's leading space (see 414-home.png). The image shown to the owner, docs/design/mockups/work-ahead-home/home-with-work-ahead-414.png, has "Work ahead ›".

**I. Non-blocking — new words the Builder did not list, all within (C) (Definer to note):**
- "No milestones to go" (sandbox.js:2156);
- "Answered time not recorded: …" and "…: not read yet" (workahead.js:452);
- "Later work: not available" (sandbox.js:2094);
- "Your latest plan, <name>: not available; shown in the project document's order".

**J. AC62's snapshot (Orchestrator/Definer).**
- tests/desk/screen-text.mjs only skips `sb-wa-link` on Home. That is narrow, and it is what AC24 allows ("Nothing else on Home changes").
- AC62's "every word kept" list doesn't name this control. The Definer should add it.
- No test was weakened. The two J12 tests now expect `desk-pulls-v3` with old keys `['desk-pulls-v1','desk-pulls-v2']`, which is what the spec says. The kept-fields test adds `estimate` and checks it is false.

**Checked and holding:**
1. **AC24 maths** (workahead.js:306-351):
   - The worked example gives the spec's exact dates on 18 and 20 Oct, and the under-way case gives 21–23 Oct on the 20th, "23 Oct" on the 23rd and "past its estimate" on the 24th.
   - A 0-to-0 estimate is never stale or past, even 30 days or 9 months old, and holds until reached.
   - Stale means more than 7 days old (7 is not stale, 8 is).
   - Date arithmetic doesn't shift across the clock change (31 Oct + 2 = 2 Nov).
   - The midnight change happens on the 15-second tick.
2. **J14, J15 and J4:**
   - J14: a line 10 minutes ahead of the clock is read and 11 minutes is skipped. A skipped line still says "a newer estimate line could not be read".
   - J15: states come in the spec's order of precedence.
   - J4: the lowest free `<nn>` is picked (01 and 03 taken gives 02; all 99 taken gives the "Every plan name…" words). The minute is in UTC, the body is exactly J4's form, and an empty plan is allowed.
3. **AC60, apart from A:**
   - only the planning project;
   - `files` missing or null, `changedFiles` missing or null, and a field error ending in `files` or `changedFiles` all count as not estimate-only;
   - the plan still wins for a listed pull request;
   - AC66's words are right.
4. **J12:**
   - the query adds exactly `changedFiles files(first: 2) { nodes { path } }`;
   - v1 and v2 are both dropped;
   - only the yes/no is kept, never the paths.
   - In the rebuilt fixture, all 72 pull requests are unchanged except for the two new fields. For #1, 10, 19, 28, 39, 50, 60, 69 and 77, `changedFiles` and the first two paths match a live `gh api` today.
5. **J7:** two `planning: true` entries fail; `true` on v2.5 fails; `"yes"` fails; `false` passes (configcheck.js).
6. **Word ban:** no banned whole word in workahead.js, workview.js or the new sandbox strings. The only hits are comments, the card's "never a deadline", and the `target` HTML attribute.
7. **AC43:** app.js is unchanged, and the test loads `''` and `#/work` without `?sandbox`.
8. **Security:**
   - the draft is checked by readDraft and filtered against known milestones;
   - the filename is fixed-form, and the path and body go through encodeURIComponent;
   - milestone ids are limited to `M[0-9A-Z]{1,7}`;
   - the 6000-character cap applies;
   - no new code passes `html:`, so record text is only ever set as text.
9. **Private data:** all 82 files in j11-77bfeae/ and tree.txt match `git show 77bfeae` byte for byte. Re-running v3_checks trace on a `git archive` of 77bfeae gives the same timeline. No new poom/ files were added.
10. **Builder's own readings, all within the spec's (C) room:**
    - aria-disabled ends, so focus can stay;
    - "Work filed · gone back over" is the spec's literal text;
    - "not available" before a read arrives;
    - judging the draft only after reads, which stops wrong set-asides;
    - the empty plan;
    - the placement order (list, Not milestones yet, Reached, Dropped, v2.5), which matches the mockup;
    - the three new phrases.
11. **Screenshots:** the 360 and 414 shots, light and dark, match mockup version 2. The bar showing mid-page is a full-page capture of a sticky bar. Nothing scrolls sideways.

**Join-up review (Reviewer, end of Build).** I ran the parts together in the page harness and the fixtures:

| Path | Result | Fix |
|---|---|---|
| Home → Work ahead → move rows → Record plan → commit → Current plan | Works; wrong notice (C) | Definer |
| Status marks against Work ahead marks for MD1 to M3C | The same (test :154-169) | — |
| Estimate pull request merged → Timeline and Done today | Off the Timeline, "not on the Timeline: a rough estimate"; too permissive (A) | Builder, blocking |
| Not milestones yet: tap → ask committed → "Asked <date>" → question → answered | Works | — |
| A milestone list that can't be read → Record plan | Empty plan offered (B) | Builder |
| Planning project notes ← Work ahead notes | Works | — |

**Open questions:** C and D need the Definer's wording.

Probe scripts (scratch only, nothing in the repo changed): /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probe/p1.mjs, p2.mjs, p3.test.mjs and p4.mjs in that same folder.
