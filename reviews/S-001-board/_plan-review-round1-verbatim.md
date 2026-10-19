# Plan review (Reviewer), round 1, of the board amendment (S-001 AC80, J22) at 0670766 (verbatim)

Verdict: FAIL

For the owner:
- Most of the plan can be built as written. The counts hold: I recomputed the daily call total and it is 7,577. GitHub's request limit per check holds too, and each kind of "done" is confirmed within about a minute from reads the desk already makes.
- One part is wrong in a way that matters. The board relies on GitHub's own owner check to catch the cases its file rules miss: a test made weaker, a test deleted, a dependency file changed. But in Service-Desk, any change to the desk's code makes that check say only "CI code changed · check the PR". So on exactly those pull requests the board would tell you "It needs no verdict from you, only the merge" when the rules do need your verdict. The two-minute token setting does not fix this.
- The board also changes how three other parts of the trial view look: notification taps, questions being asked in your session, and the automatic job's pull requests. The plan says those stay unchanged, and their tests would break. That has to be settled before building.
- Smaller gaps:
  - A question answered in your operating-model project will nearly always be kicked back after 5 minutes, because your session records it later.
  - An item can sit in Done while it is waiting on you again, for example after an answer's pull request is closed without merging.

Findings (spec line numbers are in specs/S-001.md at 0670766; code at /home/user/sd-def-board)

A. BLOCKING. J22 (b) cannot see the verdict flags it claims to see.
- Spec 9218-9222 says (b) "sees what (a) can't: the flags that add the owner's verdict to a weakened test or a changed manifest".
- In the code, `statuses()` posts `error` "CI code changed · check the PR" whenever the tripwire trips, before `verdict_status` is even reached (governance/checks/owner_signal.py:204-218). The tripwire trips on any diff path in signal_code. risk-paths.toml has no `signal_code`, so the defaults apply: `.github/**, tools/**, tests/**, scripts/**, governance/checks/**, src/**` (govlib.py:981; owner_signal.py:245-257).
- So every desk code or test PR gets `error`, never "Owner verdict needed". The flags live in exactly those paths:
  - test files default to `tests/**` (govlib.py:969);
  - `src/package.json`, `src/package-lock.json` and `tests/desk/package.json` are manifests at any depth (govlib.py:975-977, :998-1002);
  - deleting a file under tests/** is itself a flag (review_check.py:188-192; `--no-renames` turns a rename into a delete, review_check.py:161).
- Reproducing case: an R1 PR that deletes or renames a test file, or bumps src/package.json. (a) gives R1, (b) reads `error`, and the board shows "Merge ↗" with "It needs no verdict from you, only the merge." (5331). Meanwhile review_check.owner requires the owner's verdict (review_check.py:326-331). AC80's own PR, which replaces tests, is a likely case.
- Live data matches: #128 and #135 are both `error` "CI code changed · check the PR" (I read this with gh api; it matches spec 10522-10524). The spec drew only half the lesson at 10524: it saw that `error` can't say "not needed", but missed that it also hides "needed".
- The owner paragraph (1448-1451) and Setup G4 (9848-9854) overclaim: with G4, the operating-model project's tools/, tests/ and scripts/ PRs are masked the same way.
- Possible fixes, for the Definer to choose from:
  - mirror the two path-only flags in (a): a changed `[dependencies] manifests` path via `is_manifest`, and a deleted or renamed `[tests]` path;
  - decide how an `error` tripwire is shown, for example "Open ↗" with its description rather than "no verdict";
  - restate (b)'s purpose and G4's effect.

B. BLOCKING. Criteria that conflict and are declared unchanged.
- Spec 1566-1567 lists AC67 to AC79 (and AC24) as unchanged. AC80's precedence clause (5216-5217) names only AC52, AC53, AC56, AC62 and AC66. But AC80 rewrites:
  - AC79's "a row under Merges, after the counted ones" (6396), now a quiet line (5266-5269);
  - AC74's tap that "opens its row" (5616), now a sheet (5419-5422);
  - AC77's sandbox row (5840-5843, 5864), now a fold "with AC77's words and no answer link" (5270-5271). This leaves unsaid whether "Answer it here instead" survives on the board. It also leaves unsaid whether AC77's re-read before any answer link (5825; src/lib/scheduler.js:991-1035) runs before "Answer <letter> ↗" (5302-5320);
  - AC72's Deploys row words, moved into the sheet (5327-5328);
  - AC69's coral classes;
  - AC24's count (6596-6598), yet AC24 is listed as unchanged.
- The tests that would break and that the brief's list (11617-11619) does not cover:
  - tests/desk/ac79-desk.test.mjs:138-207 (`g-merges`, `sb-recrow`);
  - tests/desk/notify-ac74-desk.test.mjs:70-99 (`sb-sheet-t`);
  - tests/desk/notify-ac77-desk.test.mjs:391-413 ("Answer it here instead", Merges);
  - tests/desk/ac69-72-audit-additions.test.mjs:23, :280-319 (`.sb-qrow.g-*`, `group:deploys`);
  - md-sandbox, s033-records:196, j12-asks-merge:194, ac55-status:59-66 (doneToday).
- Also unsaid: whether AC49's owner-tile lines (src/lib/sandbox.js:542-570, built from q.rows) follow the marks. The pill's group words (sandbox.js:503-518) need AC52's groups kept in the model.

C. A confirmed card whose item needs the owner again is undefined (5374-5378, 5400-5402).
- Example: the answer's pull request is closed unmerged, so AC77's hold ends and the question waits again under the same AC73 key. Done keeps the row for 24 h, and nothing returns the card to "Waiting on you".
- Risk: hiding a waiting item, the 19 Oct complaint in reverse. The spec should state that the item wins and the row leaves Done.

D. A step change after a mark is undefined. Marks are kept by key and step (5353-5355). Steps change under the owner:
- after any head change, J20 is not read at the new head, so the card is "not known" ("Open ↗") until it is (9227-9230);
- a later "Owner verdict needed" turns "Merge" into "Verdict" (9232-9233).
- Say which step a mark is judged against, and keep the last head's class until the new read arrives.

E. "Has not answered since the mark" (5388-5389) is ambiguous for reads cached by head: the tree and J20, which are read only on a head change (scheduler.js:610-626, :312-320).
- Read literally, an unmoved head gives "GitHub couldn't be checked yet" instead of the real reason.
- An old mark waits for its reads ("never before the reads arrive", 5390-5391), while a mark from this opening is kicked back. The two are treated inconsistently.
- Also state that, within one poll, confirming runs before kicking back. This matters for a return from the background after more than 5 minutes.

F. False kick-backs from J20's retry and page budget.
- A failed J20 read is retried only after `FILES_RETRY_MS` = 5 min (scheduler.js:37, :316-319). So a single failure right after a verdict commit kicks the card back at 5 minutes, and it stays back for up to 5 more.
- Pages 2 and 3 are read only from `spare` (src/lib/github.js:672-686; src/lib/api.js:162-169). During a cold load the optional blobs fill the budget (scheduler.js:777-782), so a PR with more than 100 files fails and waits. #128 had 128 files (gh api pulls/128 `changed_files`).
- Suggest retrying at the next poll while a mark waits on that read, and adding a two-page case to J22's test.

G. Structural kick-backs.
- A v2.5 answer is confirmed only when the question file leaves the tree (5368). AC19's v2.5 route is "give this to your session" (2056-2058), so the 5 minutes nearly always pass. The table also omits J20's own v2.5 "being recorded" case, an open PR deleting the question file (9114-9116; src/lib/prfiles.js:70-82), which v3 does get (5367).
- Hold cards wait on a governance run. These took about 2 to 20 minutes on 2026-10-19 (gh api actions/runs: 16:13→16:33 and 17:25→17:27).
- Tell the owner both are expected.

H. "Owner requested changes" makes the card a merge (9223-9226), and a FAIL verdict file reads as "verdict in". Offering "Step 2 of 2: merge" after a FAIL contradicts review_check (review_check.py:339-340).

I. Reading the owner check in the private project has no mechanism behind "never read".
- J6's part has no model or visibility limit (7533-7540). AC79's equivalent is v3-only (api.js:63).
- As written, the operating-model project would send 3 reads per poll and get 3 counted 403s a minute per open device, which carry no ETag.
- Restrict the part, add a J7 field, or stop after the first 403 of an opening. The "GitHub, per hour" figure (10686-10691) is not updated.

J. Tests named.
- AC80's checks at 360×740 and 414×896 (no sideways scroll, 36 px boxes, 4.5:1 contrast, eight cards in view) and the 8 px drop zone need layout. The suite has no browser (tests/desk/md-sandbox.test.mjs:559-562). Split them into CSS-rule checks plus the PR's Chromium check, as AC42 does.
- J22's test (9250-9260) lacks: a `[paths."<glob>"]` domain case (none exists in either real file); the case where the tripwire masks a flag (A); a PR over 100 files (#128); and "Owner: after agents" (owner_signal.py:167-170).
- `required` has no command; `classify` prints only `path_class` (review_check.py:486-495). Name how the fixture is produced.
- AC80's list lacks the cases in C, D and E.

K. Smaller text points.
- J1 at 6981: the `jobs` part is nulled only with redirects. The heaviest core poll is 11 + 3 + 16 = 30.
- 5375-5376 says the owner check confirms "a verdict sooner", but 9242 reads none for verdict-step PRs.
- The risk-paths read must be registered for both models: model.js's J11 block (:282+) sits inside the v3 branch.
- The TOML subset must skip `[tests]`, `[dependencies]` and `signal_code` (govlib.py:1068-1070).

What I checked that holds:
- **A3/AC14:** 5,500 + 288 + 60 + 215 + 864 + 50 + 100 + 500 = 7,577. The board adds no function call: the risk-paths blob rides calls already counted, the owner checks ride the poll call, and marks make none.
- **J1's 30:** a steady poll is 4 + 3 + 16 = 23, and the worst core is 11 + 3 + 16 = 30 (github.js:273-374).
- **The classify join test is real:** at 304144d, `PYTHONDONTWRITEBYTECODE=1 python3 -I governance/checks/review_check.py classify --root . <1,277 tree paths>` exits 0 and gives 612 R0, 574 R1, 91 R3 (no R2). Personal-Org-Operating-Model's tools/govlib.py glob and class code is identical (diff of :280-345 and :984-1040).
- **Statuses:** #126 and #127 read `success` "Owner not required", #130 `success` "Owner approved", and #128 and #135 `error`, as the spec says.
- **Confirmation speed:** merge, approve, and v3 card or question answers are all confirmed at the next poll. That covers answers committed on the default branch (the tree; main takes web commits, e.g. e34574d) and answers through a PR (J20).
- **The automatic job:** its slowness alone causes no kick-back for v3 answers.
- **Read token on the public repo:** AC79 already reads statuses on Service-Desk with it. I couldn't test the desk's own token from here.
- **Mockup pin:** board.html is unchanged between b3e2a6b and the branch tip 4c5b81b.

I edited no files. My working copies of the spec, the diff and the classify output are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/ (S001.md, diff.txt, classify.txt).
