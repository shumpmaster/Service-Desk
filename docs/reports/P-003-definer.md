I've revised specs/S-004.md for the plan review's three blocking findings and two of its three non-blocking ones. No scenario's meaning changed: the edits change how "as today" is checked, how J1 picks between duplicate log entries, and what AC13 claims to measure. The spec is still a draft and not frozen. Nothing was committed, because this folder is not a git repository.

**1. What I changed**
- **Revision note:** a new note under the header maps each finding to its fix.
- **Finding 1 (tests folder):** Areas touched now lists `tests/desk/**` instead of `test/**`. A new line in "Facts relied on" says the Builder's tests, the six join tests (J1 to J6) and the baseline runs all go in tests/desk/. The check author's locked checks keep their own path, set at freeze.
- **Finding 2 (unread baselines):** I added a defined term, **baseline run**. It is the desk's code, or the notification sender, run at the build's starting commit on the same inputs a test sets. Its output is saved in a file under tests/desk/ that names that commit, committed before any change under src/. "As today" now means "equal to that saved output":
  - AC9 gets a test: gate cards, questions and pull-request cards, with every read working and then with each of the three reads failing in turn.
  - AC16 and AC17: gate cards on a failed read are checked against a baseline run.
  - AC14: the sender is checked against a baseline run of the old sender, given the same card lists.
  - AC15: what a notice or link to an unlisted card opens is checked against a baseline run, with the second-hand "gone" account kept as background only.
  - "Known limits" now says these behaviours were not read at source, and why the criteria are still checkable.
- **Finding 3 (duplicate log entries):** J1 now makes the choice in the rule itself, in src/lib/. It takes the earliest of the entries the existing log reader returns, or the only one if it returns one. AC13 and J6 report the same choice. The J1 test states which entries the reader returns.
- **Finding 4 (count misses half of V6):** AC13 now says openly that the weekly count from the records finds cards held too long, but not cards shown with neither mark. That half is guarded by the J4 and AC11 tests before launch. This is added to J6, the risks (carried to the Launch gate) and the operating notes (AC18), and is new open question 4.
- **Finding 6 (same moment):** AC11 now says the moment is passed in to the rule, never read from a clock. Its test feeds the views and the sender one fixed moment, at several moments around the 24-hour mark.
- **Other:** two new risks (the count's blind half; a baseline saved from the wrong code). The size line now covers the baselines, and the Builder's brief mentions them.

**2. Why**
The review failed the spec on findings 1–3. On finding 2 it offered two fixes: read the source, or check against a saved baseline run. The source files are not in my folder, so I took the second. That makes AC9 and AC14–AC17 checkable without me guessing today's behaviour. Findings 4 and 6 were cheap to fix and made the spec more honest.

**3. What I verified**
- I re-read the plan (docs/projects/P-003.md) and the rulings (stop-5, stop-6, dor-4). The new wording keeps to plan §1 and §6 and keeps the weekly check, reports and review card out of the spec, as stop-5 requires.
- I searched the spec for `test/**`, "as today", "before this fix" and "earliest". `test/**` is gone. Every remaining "as today" is either checked against a baseline run or points to AC9, which now is.
- I could not open the source files or research/P-003-sizing-findings.md. The tests/desk/ folder and the notifyview.js:337 line are cited through the plan review only.

**4. What is undone**
- **Finding 5 (size):** the test estimate is still 15 to 23 against the stop rule's 24, and AC16 still hides every decision card if one notes file fails. Both are disclosed, as before.
- **Not frozen:** the spec still needs the next plan review and the freeze gate.

**5. Needed outside my lane**
- **Plan review (Critic):** needs to read the revised spec. While doing so it could confirm at source that tests/desk/ is right and what the log reader does with two `card` entries.
- **Builder or check author:** must record the baseline runs from the starting commit before changing src/. The Reviewer then checks the commit order on the branch.
- **Orchestrator:** the plan stops the work if a third plan-review round fails. I can see one failed review on S-003 and this one on S-004, but not S-002's history. If this revision is reviewed and fails, it may be the third; please confirm the count.

**6. Open questions**
- **New, open question 4 (for the owner, not holding up freeze):** the record-based count can't see a card shown with neither mark, so that half of V6 rests on tests before launch. Is that enough?
- **Open questions 1 to 3:** unchanged.
- **Is AC9 baseline enough?** Does the review accept a saved baseline run as the baseline for AC9 and AC14–AC17, rather than the behaviour being stated in the spec?