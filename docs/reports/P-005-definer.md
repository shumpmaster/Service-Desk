I've revised S-010 to answer all six blocking findings and the smaller points. To do that I moved M9 and M10 out of this spec, which needs your agreement. Nothing is committed: this folder isn't a git repository, so I couldn't commit to `build/definer/P-005`.

**1. What I changed**
- **`specs/S-010.md`**:
  - **Finding 2 (empty lists):** I narrowed the spec to `milestones: M6, M7, M8`. M9 and M10 can't be written as lockable criteria, because their lists come from four records that aren't in my pack. AC27–AC36 are moved to an end section, "Carried to the spec for M9 and M10 (not criteria of this spec)", for a second spec to pick up. AC38, AC45 and the join-up table no longer point at them.
  - **Finding 1 (missing experiments):** AC40 now states E1's waiting-time rule in full, so it can be checked without the E1 file. J1 and J11 no longer make freeze wait for the E1 or E2 results. Separately, the reading of `src/` is now the Builder's first step rather than a freeze condition. If it contradicts a join sheet or needs a path outside the areas touched, that's a stop and a revision.
  - **Finding 3 (stopped notice):** AC15 and J7 now say the desk sends no notice for a stopped feed, because the feed that stopped is its own alert route. Only the outside check sends one, by its own alerting. So there's no second push path, no new credential and no change to `src/notify/**`.
  - **Finding 4 (unset figures):** "late" is now fixed at more than 4 minutes, which is twice the desk's 2-minute read (docs/PROJECT.md:286-287, :394). The stall time is fixed at more than 2 hours, for you to approve on the scenario card.
  - **Finding 5 (stored list):** J5's alert route now keeps no list. Each run sends what fell due since the start of its last successful run, which it finds in GitHub's record of its own runs and never on Cloudflare. J4 gains a `changed_at` field, and the route writes one log line per notice, which AC41 counts.
  - **Finding 6 (record writers):** I removed "the owner" as a record writer and kept the plan's three. A commit you make shows you as who acted, with its writer as `not recorded`.
  - **Smaller points:**
    - I added AC46 as M6's own criterion.
    - AC17 now uses the 360 and 414 pixel widths.
    - The F-gh-env-01 citation now says Free, Pro and Team.
    - The join-up table's blocking rows are explicitly carried to the Design gate.
    - Stop rule, size estimate (now M7 and M8 only), risks, Builder's brief and open questions are updated to match.
    - The thin traces went out with the moved criteria.
- **New `experiments/P-005-E1.md` and `experiments/P-005-E2.md`:** registrations for the two experiments, each with its rule or method, stop clause, fallback, and an empty Result section.

**2. Why:** each change answers a finding in reviews/S-010/plan.md. Every criterion left can now be checked from this pack, so the spec could be frozen without waiting on records I can't get.

**3. What I verified**
- A script check of the criteria found 36 criteria. Each traces only to V7, V8 or V9, and each label matches its own number.
- Every library file cited in the spec and both experiment files exists.
- None of the active sections still refers to AC27–AC36, except the note saying they moved.
- No "the owner" writer value remains in J1.
- The line numbers I cited in docs/PROJECT.md (286-287 and 394) say the desk reads every 1 to 2 minutes while open.

**4. What is undone**
- Nothing is committed.
- Neither experiment has been run.
- The spec for M9 and M10 isn't written.
- The join-up rows the Critic rated blocking still need the mockups and E2's result.
- `experiments/_REGISTRATION.md` wasn't in my pack, so the two registrations use a form of my own and may need moving into the template.

**5. Needed outside my lane**
- Someone with a git repository needs to commit this.
- The Chief of Staff needs to name the finished piece of work E2 rebuilds before it runs.
- Starting the M9 and M10 spec needs four records added to a definer pack: the Model-Lab follow-ups ruling, intake/later-work.md, docs/design/README.md and the P-002 groundwork answers.
- The Critic needs to re-review the spec.

**6. Open questions**
1. Do you agree to moving M9 and M10 to a second spec? The alternative is adding those four records to my pack, so I can write a revision 3 that covers all five milestones.
2. Is "stalled" after 2 hours right?
3. Is "late" after 4 minutes right?
4. Are you content with the plan's three record writers, so your own commits show their writer as `not recorded`?
5. Is the portfolio repository's `value/P-005/` folder the right place for the weekly device log?
6. If the outside check you approve can't alert you, is the on-screen "Stopped" banner enough?