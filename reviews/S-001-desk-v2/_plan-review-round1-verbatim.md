# S-001, desk mockup v2, draft 1: the plan review's round-1 report, verbatim

Dispatched by the orchestrator on 2026-10-20 against origin/build/definer/s001-desk-v2 at ceaf9a2, by a fresh Reviewer (a first attempt was lost to a container restart before it reported).

---

Verdict: FAIL

**For the owner:**
- Most of this plan can be built as written.
  - I recomputed the daily call count: 9,355 + 192 = 9,547. That leaves 453 under the 10,000 limit, as the plan says.
  - All governance checks pass.
  - The fonts come from IBM's own files, licensed, with nothing loaded from another site.
  - The portfolio is read with the same read-only key, so nobody new can read anything.
- Four things need fixing before the build starts:
  - **A pull request can stay hidden past 5 minutes.** The new "With the agents" line can keep hiding a pull request just after it starts needing you, if one GitHub read fails right then. A pull request leaves that line by getting a new commit, and the plan keeps the old "with the agents" judgement until that commit is read.
  - **Stage 3 depends on stage 6a.** Each project page's top line (model version and tier) uses reads the plan schedules for stage 6a, after stage 3.
  - **The cost section disagrees with the rule it counts.** It counts one verdict-reading call per project each time you open the desk. The rule itself asks for one call per pull request. That could cost about 200 more calls a day: still under the limit, but the true margin is nearer 250 than 453. A test is also told to assert "no call added", which can't hold.
  - **The phone's sender makes far more reads than stated.** The plan says the sender's new reads are "a few a day". The sender runs at least every 5 minutes and keeps no memory of them, so it is thousands a day. That could trip its safety cut-off, which stops sending, unless it remembers what it read.
- Your nine answers of today (PR #166, all A) match the plan's recommendations. The next draft only needs to cite them and lift those waits.

Spec line numbers below are specs/S-001.md at ceaf9a2. Code is cited at the same commit.

**BLOCKING**

1. **J22 rule 0 can hide a pull request that needs the owner, on the very commit that ends "With the agents".**
   - The plan claims that an unread verdict file counts as given, so nothing that needs the owner is hidden (:10508-10511). That holds for unread blobs. It does not hold for an unread file list.
   - The "judged by (i) alone" fallback covers only rule 7's cases, which name "the first head the page has seen" (:10589).
   - At any later head, "the card keeps the last head's judgement until J20 has read the new one" (:10589-10590; AC80 :5907-5910).
   - Leaving rule 0 always happens on a new head: the reviewer's verdict commit is itself a push. So the judgement kept is "with the agents", which hides the pull request.
   - A failed J20 read is retried only after `FILES_RETRY_MS` = 5 min (src/lib/scheduler.js:36-37, :316-319). With no mark there is no waited read.
   - Reproducing case:
     1. An R1 pull request has no `reviews/<n>/reviewer.md` at head A, so it is with the agents.
     2. The verdict file is pushed with PASS, giving head B.
     3. J20's read of B fails (for example a 502).
     4. The pull request stays out of every count for at least 6 minutes per failure, and for good if the failures repeat. That is past V1's 5 minutes.
   - Fix: rule 0 is never carried across heads. An unread list at a new head is judged by (i) alone.

2. **Staging: stage 3 depends on stage 6a.**
   - AC83's top line, "<model> · model <version> · <tier>" and " · publishes model …" (:6314-6320), comes from J23's version reads and J7's `publishesModel`.
   - The stage table (:1713, :1716) and the brief (:13396-13405) put both in 6a. AC83's test checks "the top line".
   - Stage 3 cannot pass its own test as briefed.
   - Fix: move J23's version reads and `publishesModel` into stage 3, or make that line 6a's.

3. **A3 and J22 disagree on rule 0's cost, and AC14's test can't be locked as written.**
   - **Per head or per project:**
     - J22 says each head's verdict blobs ride "in the same blob call of its own and nothing else", a failing one costing "only that head's verdict reads" (:10512-10518). That means one call per head.
     - A3 says "the project's verdict files together in the one call already counted (10 × 5 = 50)" (:12241-12246).
     - A blob on a branch is never kept in the stored cache (scheduler.js:415-427 keeps only blobs in the tree), so it is read again at every opening. Under rule 0 nearly every R1+ pull request carries `reviewer.md`.
     - Per head, that is 10 × 5 × 5 = 250, so 200 over A3, giving about 9,747.
     - If they are read together instead, one failing blob fails every head's verdict reads in that call (src/lib/github.js:626-633). That contradicts J22.
   - **J24:**
     - J24 "leaves it for the next cycle's blob call" (:10744-10745), but the optional loop makes another call in the same cycle when reads are still due (scheduler.js:772-799).
     - At each opening J20 reads every open pull request again, because files are kept "in memory for this opening" (scheduler.js:110-112).
     - So 5 pull requests × (up to 3 J20 pages + up to 3 J24 pages) = 30, over the call's budget of 25 (BLOB_BATCH, github.js:12).
   - **The portfolio:** the 192 counts only the steady 5-minute cadence. Each opening also makes its own first read and a cold blob read, so up to 10 to 20 more.
   - **The test:** AC14's test asserts "no call added by J24 or by J22's rule 0" (:2318-2320).
   - My worst case is still under 10,000, about 9,770 to 9,820. But the margin stated in A3 and in Risks (:12255, :12733) is wrong.
   - Fix: pick one mechanism, recount, and change the test's assertion to the bound.

4. **Stage 1b, the sender's rule 0 reads: no memory, the cost understated, and the failure handling missing.** This is the Critic's finding 3, which I share, plus the following.
   - J16 says the reads are made "once per head, a few a day" (:10005-10010). But J18's signed state is not changed by this revision, so the sender keeps no memory of them between runs.
   - The sender runs on `cron: "2-59/5 * * * *"` and on every completion of seven workflows (.github/workflows/desk-notify.yml). Each run would read 1 status and 1 or 2 verdict files per open own-branch R1+ pull request. That is at least 288 runs × 3 pull requests × 2 to 3 reads, about 1,700 to 2,600 or more a day.
   - Those reads use the per-repository token limit the sender shares with the asks-merge job and the Orchestrator. Below 300 remaining, the budget guard "sends nothing" (J16's guard), so this can silence notifications (V1).
   - The plan should also state:
     - a failed, 404, oversize or non-file read counts as given, as on the page;
     - fork pull requests are never read for contents and are judged by (i) alone;
     - J16's and AC73's tests get rule 0 cases.
   - **The operating-model project:** the page never reads (i) there, because the repository is private, but the sender can (`statuses: read`). With one pure function fed different inputs, the board would show a card the phone stays silent on. Say that the sender applies (i) only where the page does.

5. **The 1a/1b order and the operating-model project's pin.** This is the Critic's finding 2, which I share.
   - The Risks section says 1b lands "before the preview deploy of 1a is approved" (:12725-12728). The brief says each stage's deploy is approved before the next stage opens. Both can't be followed.
   - Neither stage 1b (:13386-13391) nor CS24 to CS26 moves CS16's Workflow 4 pin to the commit that carries rule 0.

**Non-blocking**

6. **The Critic's finding 4 is a gap in evidence, not a defect.** I checked the operating-model project's practice:
   - `reviews/33`, `/34` and `/35/reviewer.md` were committed as 5f5546f, dd362ac and f441025.
   - Each of those commits is on its pull request's branch, the second parent of merges aba7fab, c816cec and 90f53e3 (`git merge-base --is-ancestor`).
   - Add this under Facts relied on, by commit id, in placeholder form.

7. **The Critic's finding 1 (the "Latest" bubble): I agree, and there is a second case of the same kind.** Item 16 (:1820) and AC68's note (:5365-5367) drop note 31's phase marker from the Timeline's header by a (C) reading. The owner's option text was "Status, Timeline, Team and Queue all say where the project is in the same way." Put it to the owner with the bubble. Also say whether the Team screen, kept as built, keeps AC68's marker.

8. **PR #166 is merged, with all nine answers A.**
   - Cite them, and lift the waits in the stage table (:1712-1717), the brief (:13393-13405), the open questions (:12924-12976) and CS26.
   - The filed 1c question described "the project's one-line summary… the first line of the project's README" (questions/P-001-tile-summary.md at 178da01). AC82 builds three faded lines. Cite P-001-tile-summary-clip.md for the three lines.

9. **Setup P1 misstates the token's permissions.** P1 (:11686-11693) says "Contents: read and Metadata: read". G1 (:11350-11356) also grants Pull requests and Actions read. A new token made from P1's fallback would break J1's pull request list and the CI reads.

10. **A mark can be confirmed by rule 0 alone.**
    - AC80 confirms a mark once the item "no longer needs the owner by Terms' rule" (:5902-5903).
    - Terms (:2040-2042) says a pull request with the agents doesn't need the owner.
    - So a marked "Merge" card whose pull request goes back to the agents shows a green ✓ in Done, unmerged.
    - Say whether rule 0 confirms the mark or drops it into the fold.

11. **Layout checks need a named method.** The suite has no browser: there is no chromium or playwright anywhere under tests/desk. Name a CSS-rule check plus the pull request's Chromium capture for:
    - AC82's "one tile a row at 360 and 414 px and two at 720 px";
    - AC81's "no sideways scroll";
    - AC84's "opened at Now".

    AC80 already does this, since board round 1 J.

12. **J23's `tier:` line needs its comment stripped.** It reads `tier: T1                  # T0 | T1 | …` (AGENTS.md:3); say the comment is removed. **J24's "Merged" lines come from J12, which is v3-only** (src/lib/api.js: "pulls are read for v3 projects only"), so the operating-model project's merges never show; say so.

13. **The Pi subset misses some marks**, as the Critic's finding 12 says. I confirmed it in IBMPlexSans-Regular.css from `npm pack @ibm/plex-sans@1.1.0`: ◆, ✕, ▸ and ⇅ are missing; ↗ and ✓ are present.

**What holds** (checked)
- **The budget:** the arithmetic is right (7,577 + 1,440 + 288 + 50 = 9,355; + 192 = 9,547; 453 to spare), and 16 × 12 = 192. J23's portfolio poll makes 2 requests, so J1's 30 per call is untouched.
- **Governance checks:** in the scratch worktree, `check_all.sh . origin/main` passed all 25 checks (exit 0). `spec_check.py status` gives OK.
- **Rule 0's sources:**
  - Every "after agents" status starts with `Owner: after agents` (owner_signal.py:176, :178).
  - review_check reads verdicts from the checked-out tree (review_check.py:313-346).
  - Service-Desk's verdicts are on the pull request's branch: #128, #130, #135 and #148 each list `reviews/<n>/reviewer.md` in their files (`gh api pulls/<n>/files`).
  - R0 paths need no reviewer (governance/risk-paths.toml), so spec and question pull requests never enter rule 0.
- **An unread FAIL verdict counts as given.** That gives a false alarm, never a miss.
- **The portfolio repository:** shumpmaster/portfolio exists, is private, has default branch main and holds `ideas/IDEAS.md` (`gh api`). It uses the same read token behind Access, and J23's test limits the function to branch, tree and blob reads for it.
- **The fonts:** `@ibm/plex-sans` 1.1.0 and `@ibm/plex-mono` 2.5.0 exist, both OFL-1.1, with Reserved Font Name "Plex" in LICENSE.txt, and `fonts/split/woff2/` holds Latin1 and Pi files. The page's policy (src/public/index.html:7) is `default-src 'self'` with no `font-src`, so fonts from the desk itself are allowed and nothing from another site is.
- **The sender's workflow:** it already has `statuses: read` and `contents: read` (desk-notify.yml:40-46).
- **Secrets:** a scan of the diff for token-like strings found nothing.

**Open questions**
- Does rule 0's isolation mean one call per head (cost +200) or one per project (no isolation)?
- Does stage 1b add a J18 field to keep each head's rule 0 outcome?

I changed no files and made no commits. The scratch worktree is removed. The leftover font tarballs are in /tmp/claude-0/-home-user/b8bda87f-bf52-5ebb-979f-577e73df7a89/scratchpad/plexdl/.
