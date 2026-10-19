# Plan review (Reviewer), round 1, on S-001 amendment 49daf31 (verbatim)

Verdict: FAIL

For the owner:
- What you asked for (option B) can be built, but this plan can't be built as written. It has to change in two places before anyone builds it, plus one test that could never pass.
- First: the part that checks whether the automatic job is still allowed to merge can't simply be copied onto the page. On the sender it needs the project's full git history, which the page doesn't have. If the page skips that check, then in one rare case the desk would show a pull request as "Being recorded" forever, while your phone has already told you it needs you.
- Second: the plan says the desk will never be slower than your phone, and will catch up "within about a minute". As planned, the page has to look things up over two or three polls in a row, so the desk can be a minute or two behind your phone.
- The arithmetic is right: the page would make at most about 6,700–6,800 requests a day in the worst case, well under the 10,000 limit. The job log can be read with the current token. Check results can be read only because Service-Desk is public.
- All of this can be fixed in the spec. It needs a second plan review, not a new decision from you.

**Blocking**

A. `grant.mjs` can't move "unchanged" and be shared with the page, and leaving out its history check breaks "never the reverse".
- Spec: specs/S-001.md:5509-5510 (AC79: "J16's `find_grant` mirror, reading docs/LEDGER.md"), :5546-5547 (one read, "cached by sha"), :5551-5553 ("move to `src/lib/`, unchanged, and both the sender and the page import them").
- Code: `findGrant(checkout)` (src/notify/grant.mjs:143-162) runs git through `checkout.git`: `cat-file` at :85, `rev-list --first-parent` at :93, `cat-file --batch-check` with Node's `Buffer` at :95, and `cat-file commit` at :115. This is `arrival()`, which rejects a grant that arrived in a merge carrying a `Merged-By:` trailer (:131-135). It depends on J16's full-history checkout (spec :7144, `fetch-depth: 0`). The page has one ledger blob and the tree, with no git and no history.
- The parts that work in a browser are `parseLedger`, `grantFormProblem`, `stripComment` and `parseSupersedes`. `findGrant` does not.
- Reproducing case: the only `asks-merge:` entry arrived in a `Merged-By:` merge.
  - Sender and job: no grant, so the pull request is an ordinary one, counted and notified.
  - Page without the arrival check: a grant, so "Being recorded" and not counted. The job never merges it, and its run prints no `PR #` line, so rule (b) never fires. The desk shows "Being recorded" indefinitely while the phone has notified. That is the reverse direction AC79 :5520-5521 rules out.
- Fix: say what the page reads for the grant. Either a bounded history read for `arrival`, or "no grant on the page unless verifiable" (which counts, the safe side). Say that only the pure ledger functions are shared. Drop "unchanged".

B. Some reads depend on earlier answers, so "one blob call a poll", "within about a minute" and "never the reverse" can't all hold.
- Spec: :5533 ("in the poll's blob call"), :5541-5545 (jobs read 1, log read 1, as separate fixed forms), :1580-1582 and :8731-8733 ("at most one extra blob call a poll"), :5503 ("within about a minute, as the sender notifies it"), :5520-5521 ("never the other way").
- Code: `judgeCandidate` reads lazily (src/notify/jobcand.mjs:107-126).
  - Which runs count needs `done` from the check runs (:108-111).
  - The log form needs the `merge` job's id from the jobs answer (:116-120).
  - The head time is read only when there are no checks (:100-101).
- So in one call per poll the page needs about three polls from "run seen" to verdict: checks and runs, then jobs, then log. The alternative is several calls per poll, which AC14's new assertion forbids.
- The sender starts on asks-merge `completed` (.github/workflows/desk-notify.yml:23-25) and does the whole chain in one run. On rule (b) the phone can therefore lead the desk by 1-2 minutes. Even rule (a) depends on the 60-second poll's phase, so no design can promise the desk "never" trails the phone.
- Fix, either:
  - add one fixed function form "run R → its `merge` job → filtered log" (2 of the budget), and say how `done` and the run ids carry over from the previous poll; or
  - allow a second call in a poll and redo A3.
- Either way, change :5520-5521 to say the desk counts within about a minute of the phone, not never after it.

C. AC14's new assertion can't pass alongside AC79.
- Spec :1582 says "each completed run's jobs and log read once" across AC14's day, which has 10 openings (:1569). AC79 says these are "kept in the page's memory" and "the page keeps nothing between openings" (:5518, :5543).
- As written each opening reads them again, up to 10 times. Make it "once per opening", or keep them on the device.

**Must fix in the text (not blocking alone)**

D. Settings the page must use with `judgeCandidate` unchanged, or it falls behind the sender. All confirmed by running the real module (probe in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/probe.mjs).
1. **`seenMs` must be null on the page.** jobcand.mjs:102 uses the later of the head commit's time and `seenMs`. If the page passes its own first sight in this opening, rule (c) fires later than on the sender (probe: page with seen=opening gives `left:false`).
2. **A failed head-time read must count.** With `seenMs` null, a null head time gives `left:false`, while the sender, which has `seenMs`, gives `left:true` (probe: "c page headTime fail" vs "c sender headTime fail"). The module hides the failure. Say the page's `headTime`, `readJobs` and `readLog` mark a failure that counts the pull request. AC79 :5534-5536 covers failures only in general terms.
3. **The "retried counts at once" rule isn't something the module returns.** `judgeCandidate` returns `left:false` with a finite `retriedMs` (jobcand.mjs:131-135; probe "retried page"). The page can read that as "count" only if it always passes `retriedMs: null`. Say so, or the Builder will edit the "unchanged" module.
4. **Showing words on the page's own early count is misleading.** With `seenMs` null, a new pull request whose head commit is over 30 minutes old counts at once by (c) before CI starts (probe "c page seen=null"). The desk would show "The automatic job left this for you" (:5529-5530) when the job hasn't, then flip back. Suggest using the later of the head time and the pull request's `created_at` (still never later than the sender), and keeping "left this for you" for (a), (b) and (d).

E. The R3 claim is false as the paths stand. Spec :5553 says "a change to them is R3 (CS18), as `src/notify/` is". But governance/risk-paths.toml:20 makes only `src/notify/**` R3, and `src/**` is R1 (:24). After the move, later changes to `src/lib/jobcand.mjs` and `src/lib/grant.mjs` are R1. Either add the two paths to risk-paths.toml (an owner-approved R3 pull request, like CS18 :8208-8214, listed in Areas touched :7996-7999), or drop the claim and add it to Risks' stated limit (:9125-9130).

F. The function must not send the token to the log's redirect address, and must cap the log's size.
- The logs endpoint answers with a redirect to another host. The sender deliberately doesn't send the token there: it uses `redirect: 'manual'` and fetches the new address with no credential (src/notify/gh.mjs:119-130). The function (src/lib/github.js) has no such path. The spec should require the same.
- It should also count the redirect as a second Workers subrequest, and cap the log's size (the sender allows 4 MB). An uncapped split of a large log risks Error 1102, which AC14 forbids (:1560).
- The real merge log is tiny (tests/desk/fixtures/github/asks-merge-job-117691950060-excerpt.log, 882 bytes), so this is a limit to state, not a likely failure.

G. Check runs and statuses can be read only because Service-Desk is public.
- Spec :6215-6218 says the reads use the read token "(Actions: read, Setup G1)". But G1 grants Contents, Metadata, Pull requests and Actions (:8090). Fine-grained tokens have no Checks permission, and the spec's own fact (:8418-8420) records a 403 on a private repository.
- The reads work today only because shumpmaster/Service-Desk is public (checked: `visibility: public`). Personal-Org-Operating-Model is v2.5 with no asks-merge (src/config/projects.json).
- State this as a known limit: on a private project every candidate would count, so it silently behaves like option A.

H. The test lists don't cover each rule.
- AC79 (:5554-5564) asserts the page and sender judge "alike". By design they differ (retried, `seenMs`). Assert instead that the page counts whenever the sender leaves it, over a matrix of inputs.
- Add these cases:
  - before the first judgment answers (counted);
  - a failed status (the status branch of (a));
  - a transient reason (not left);
  - a `merged` line;
  - a skipped or cancelled asks-merge run;
  - an asks-merge run still in progress (its jobs read again, not cached);
  - more than 10 pages;
  - a failed head-time read;
  - a head commit older than the pull request;
  - a grant that arrived via `Merged-By:` (finding A);
  - for the `PR #` filter, `logVerdict(filtered) === logVerdict(full)` on the real log and on a CRLF log.
- AC14 (:1580-1582) needs C's wording fix.

**Notes**

I. A3/AC14 arithmetic, recomputed. 16 h × 60 polls/h × 1 call = 960, so 5,788 + 960 = 6,748 is correct as stated. But 5,788 (:8710) predates draft 9's `?open=` taps, up to 60 calls (:8727-8729), so the true worst case is about 6,808. With two v3 projects each holding a candidate all day it is about 7,768. Both are under 10,000.

Reads per candidate: about 4 per poll after the first judgment is right (3 + the runs page). The first judgment is 5-8 typically but up to about 16 with 5 job-and-log pairs. Three candidates at first judgment come to about 24 of 25, so an overflow (counted, the safe side) is plausible. Say so.

J. The Definer's three choices:
- **Re-judge every poll:** sound. It matches the sender, which re-judges every run with nothing sticky (src/notify/collect.mjs:264-284).
- **Err toward counting:** sound in intent, but needs D1-D3 to actually hold.
- **Return only `PR #` lines:** safe. Both of `logVerdict`'s patterns start at `^PR #` after the timestamp (jobcand.mjs:15-16), and the page runs the lines back through `logLines`, which fixes CRLF (probe "filtered-naive" agrees). Reuse `logLines` in the function.

K. Other text:
- **Stale sentence:** :1160-1161 says the record "is on the branch cos/answer-pr-answer until pull request #125 merges". #125 has merged (origin/main d8026fa).
- **Owner's lead:** the lead (:1144-1152) doesn't say a new candidate counts for a minute or two before its first judgment (:5533-5536). Add one plain clause.
- **Areas touched:** the list (:7996-7999) omits files the move must touch: src/tools/build.mjs `PAGE_LIB`, the src/public/lib/ copies, src/notify/collect.mjs:12-13 imports, and tests/desk/notify-j16-jobs.test.mjs's imports.

**What holds:**
- jobcand.mjs is pure (no imports, nothing Node-only) and can run in the browser.
- The page already has each pull request's head sha and its files: src/lib/records.js:777, src/lib/scheduler.js:319, `canRecord` at src/lib/model.js:342.
- The blob call's validator (src/lib/api.js:103-105) can take new fixed forms within the 25 budget. A 403 from an extra read doesn't fail the call (src/lib/github.js:490-493).
- A job's log can be read with a fine-grained token holding Actions: read.
- The ruling's quote at :1155-1157 matches the record.
- The J16 tests pass at 49daf31 (11/11).

Open questions:
1. For the grant on the page (A): a bounded history read, or "no grant unless verifiable"?
2. For the dependent reads (B): a run-to-log function form, or more than one call per poll?
