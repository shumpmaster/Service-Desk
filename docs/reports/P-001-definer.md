I've revised `specs/S-001.md` to answer the plan review. Four of the five findings are fixed. The fifth (J9, the status, sprint and dispatch-log files) still blocks freeze because the real sample files aren't in my folder, so the spec stays `draft`. Nothing was committed: this folder isn't a git repository, so there's no `build/definer/P-001` branch to commit to.

## 1. What I changed
- **AC19 arithmetic (finding 1):**
  - The wrong sentence is gone. If two devices each stay open all 16 hours, the total is 10,100 requests (10,600 if openings and changes are counted per device). That **fails** the spec's own 10,000 margin. It is still nowhere near Free's 100,000, which is only reached after about 331 window-hours in a day.
  - AC19 now says plainly that a day with more than 16 window-hours across all devices is outside the scenario. Two devices open together for 8 hours already make the 16.
  - If the Chief of Staff's check during AC7 finds that assumption broken, it goes to the owner, who decides.
- **Plan file naming (J4, AC13; finding 2):**
  - Plan files are now named `docs/planning/<YYYY-MM-DD>T<HHMM>Z-<nn>.md`. The `<nn>` suffix is always there and always two digits (01 to 99).
  - There is an explicit ordering rule: the current plan is the file whose name sorts last in plain ASCII order. Files that don't match the pattern are shown as "can't parse".
  - Added two awkward cases: two links drafted with the same name, and the minute boundary. The join test now covers both.
  - To show the current plan, the desk has to read the list of plan files. J2 now reads that list for Service-Desk, and the function's response (J6) gained a `plans` field.
- **EXP-001 (finding 4):**
  - The test function now runs behind Access with a real login token, and checks it fully the way production will, before the GitHub batch.
  - It runs 100 calls of each kind instead of 20. Full reads are capped at 40 per hour so they stay inside GitHub's 5,000-an-hour limit.
  - Stricter pass bar: no call at or over 10 ms CPU, 95th percentile under 8 ms, and at most 4 cold-load batches per project.
  - The fallback now says the request arithmetic is redone if the batch size or batch count changes.
  - J8 now counts the login-key fetch against the outbound request limit, and its CPU against each call's CPU.
- **A3 and A4 (finding 5):** A3 now derives "4 batches" from the 30 to 120 requests a cold load needs. A4 explains the "3 more": a changed head re-reads at most a cold load's 4 batches, and the first of those is the poll already counted. The GitHub fact notes that these re-reads use ETags, so only files that actually changed count against GitHub's limit.
- **Review's open questions:**
  - A new term, "Read successfully", says an "unchanged" answer counts as a successful read. AC3 points to it.
  - Cards and answers now work whether or not a card file is kept once answered. An answer file means its card is answered. The raised time comes from the oldest commit that touched the card path. Answered cards are also found from their answer files, and `decisions/questions/` is skipped. This is owner question 7.
  - "Before freeze" notes that the project document contradicts itself on O5, and that the spec follows the "open into Define" reading.

## 2. Why
These are the plan review's five findings and open questions. The earlier rounds' decisions (resubmit, retry, then build) ask for this revision to go back to the Critic.

## 3. What I verified
- **Plan ordering:** sorting the names in plain ASCII order put `T0930Z.md` after `T0930Z-2.md`, which confirms the defect. The new names come out `T0930Z-01` < `T0930Z-02` < `T0931Z-01`.
- **Arithmetic:** 4,800 + 200 + 300 = 5,300; with two devices, 10,100 (or 10,600 counting per device); 99,500 / 300 ≈ 331.
- **Card names:** splitting `Q-003-failure-1` and `P-001-dor-fail-2` gives the item, gate and number J2 expects.
- **Leftovers:** no old `T<HHMM>Z.md` or `-2` names remain, and "10,600" survives only in the corrected worked case.

## 4. What is undone
- **J9's source side** still blocks freeze; it needs the real files (finding 3 and owner question 6).
- **The measurements** EXP-001, EXP-002 and EXP-004 haven't run, and their results aren't in the spec.
- **No separate registration file:** `experiments/_REGISTRATION.md` isn't in my folder, so the pre-registrations stay inside the spec.

## 5. What is needed outside my lane
- The owner or Chief of Staff: one real status, sprint and dispatch-log file from each launch repository, with their paths.
- Whoever owns the project document: correct `docs/PROJECT.md:206` ("O5, closed").
- The owner and an agent allowed to deploy to the preview project: run the three experiments.
- The Critic: review this revision.

## 6. Open questions
- Owner questions 1 to 6 are still unanswered.
- Question 7 is new: is a card file kept after it is answered? It doesn't block freeze.
- The new 8 ms bar in EXP-001 is my own margin. The Critic or owner may want a different one.
