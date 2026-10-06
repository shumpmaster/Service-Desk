I've revised `specs/S-001.md` against all seven review findings, but the spec still can't freeze. Freezing needs four results from Define: EXP-001, EXP-002, EXP-004, and real samples of the status, sprint and dispatch-log files. None is in this pack. Nothing is committed: the folder isn't a git repository.

**1. What I changed**
- **Finding 1 (O3 and O5 closed in Build):** I put the closing back in Define, as the owner ruled. A new "Before freeze" section sets out EXP-001, EXP-002 and EXP-004, each with its question, method, pass bar and fallback fixed before it runs. The spec stays `draft` until those results are written into it. "EXP-001 measures it before Build ends" in Risks now reads "in Define, before freeze". The brief's "Before Build ends" line is now a list of inputs from Define. The content parameter's name is now config (`contentParam` in J7), so EXP-004's result never changes spec text.
- **Finding 2 (no format for status, sprint and dispatch log):** I added join sheet J9. The desk's side is fixed:
  - the exact `pipeline` object J6 returns;
  - "last recorded" defined as the commit time of the file it came from, so it doesn't depend on the file's format;
  - the rules for `atWork` (item and role at work now) and `next`;
  - the awkward cases.

  The source side, meaning how each field is read from the real files, is marked "Incomplete: blocks freeze" until samples are quoted. J6 now names `pipeline`, `prs` and `unparsed` precisely. I renamed J6's top-level `status` to `state` so it doesn't clash with the status file.
- **Finding 3 (no source for "agent retrying"):** AC4 and the term "Activity" now list only things J1, J2 or J9 actually read. An agent retrying is defined as a repeat dispatch-log entry for the same item and role. "Agent sessions" is gone; that belongs to S-002.
- **Finding 4 (AC11 unclear):** AC11 is rewritten. The link is the same J3 link to the default branch. The desk shows a set message first, and it neither creates nor names a branch nor opens the pull request. The owner picks "new branch" in GitHub's commit dialog (F-gh-07 (2)) and opens and merges the pull request. The card stays flagged until the answer is on the default branch.
- **Finding 5 ("owner-approved" claim):** The heading now says draft, not yet approved by the owner, with a note that no ruling approves the criteria yet.
- **Finding 6 (AC19 arithmetic):** Four stated assumptions (A1 to A4) give 5,300 requests a day, under the 10,000 margin. The spec covers the case of two devices both open all day (about 10,600, over the margin but far under Free's 100,000), says how retries are counted, and adds a GitHub-side figure for cold loads.
- **Finding 7 (minor points):**
  - J1 now explains how the 30-request cap and the six-connection waves fit together.
  - New reasons for a project that can't be read: the function sets `github`; the page sets `cloudflare` and `network`. `parse` is removed.
  - AC7 names its judge: the Chief of Staff, with a stated test for "explained", and the owner's ruling settles any dispute.
- **Open questions:** I added two. Question 5 asks whether the owner wants to re-rule O3 and O5 to close in Build. Question 6 asks where the real status, sprint and dispatch-log files are.

**2. Why**
Each change answers the matching finding in `reviews/S-001/plan.md`. For finding 1 I kept to the owner's ruling rather than widening it, since only the owner can widen it. For finding 2 I wouldn't guess a file format, so I fixed the desk's side and made the gap block freeze.

**3. What I verified**
- I opened the library entries the spec relies on and checked them against its claims:
  - F-gh-05: only `filename` is documented.
  - F-gh-07 (2): the commit dialog offers a new branch.
  - F-gh-10, F-cf-workers-03, -05 and -07.
  - Q-004-facts lines 8, 9 and 18.
- A text search found no "Before Build" or "owner-approved" left. It also found 9 join-test markers (J1 to J9) and all 19 criteria still traced to a value target.
- The arithmetic adds up: 4,800 + 200 + 300 = 5,300.

**4. What is undone**
- J9's source side.
- The results of EXP-001, EXP-002 and EXP-004.
- Separate registration files: `experiments/_REGISTRATION.md` isn't in the pack, so the pre-registrations sit inside the spec instead.
- No commit.

**5. What is needed outside my lane**
- **Owner:** run EXP-002 and EXP-004 (about 20 minutes once), answer open questions 1 to 6, and create the preview project.
- **Someone allowed to deploy to the preview project:** run EXP-001.
- **Chief of Staff or Orchestrator:** supply the sample files.
- **Not checked:** the critic cited `decisions/questions/P-001-o3-define.md`, `-o3-walltime.md` and `-o5-define.md`, but they aren't in this pack. I relied on the critic's reading and on PROJECT.md §8.

**6. Open questions**
- Will the owner re-rule O3 and O5 to close in Build, or keep Define (open question 5)?
- Where are the real status, sprint and dispatch-log files (open question 6)?
- Is a separate experiment registration file required in addition to the "Before freeze" section?
