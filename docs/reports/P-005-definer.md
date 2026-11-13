I've drafted spec S-010 for the timeline and the pre-registrations for both experiments, E1 and E2. Nothing is committed: this folder isn't a usable git repository (`.git` is empty), so the `build/definer/S-010` branch commit still needs doing. The spec is not ready to freeze; six gaps below need closing first.

**1. What I changed**
- **`specs/S-010.md`** (new, 179 lines, draft). Its header names milestones M6 to M10 and has no lineage, since nothing is borrowed from the first plan. It holds:
  - **45 scenarios (AC1–AC45)**, each tied to V7, V8 or V9. They cover the event record, the timeline, what needs the owner, the related work taken in, replacing the core screens, the limits, and the after-launch section: running, the V7, V8 and V9 counts, the desk showing its own targets, feedback and value review, and operating notes.
  - **11 join sheets (J1–J11)**, giving the exact form of each hand-over, from the event record through to the widget's copy of the card-making code.
  - A draft join-up review for the Critic, the areas touched, facts with library citations and the plan's line numbers, risks, the stop rule with a proposed size ceiling, 7 owner questions, and the Builder's brief.
- **`experiments/P-005-E1.md`** registers the owner-wait baseline for V7. It fixes the start and end record for each of the five waiting kinds, the output form, and what each result decides, all before the run.
- **`experiments/P-005-E2.md`** registers the check of whether the records can carry the timeline, for M6. It fixes the rule that picks the piece of work, the per-kind coverage table, the per-repository checks from the plan's §7, and what each result decides.

**2. Why**
The owner's "proceed" (`decisions/P-005/dor-3.md`) moved P-005 into Design. These files are the Design steps for scenarios, join sheets, experiment registrations and cited facts. The scenarios keep the plan's rules (records only, waiting never shown as a fault, as-of time and age shown, a stopped feed shown as stopped, finishing on GitHub's own page). `dor-2`'s findings were about the gate case, but I applied its lesson: every citation in the spec points at the plan line or library entry that actually says it.

**3. What I checked**
- A script found 45 scenarios, each with a well-formed trace to V7, V8 or V9, and none missing.
- Every library file cited in the spec and the two registrations exists.
- I checked the plan and `docs/PROJECT.md` line numbers against the files as read, and corrected two internal line references in the spec.
- I could not run git, so there is no commit.

**4. What is undone**
- **Not committed** (no repository here).
- **M9 and M10 lists:** the items M9 must build and the per-screen lists for M10 are a coverage rule only (AC33, AC34, AC36). The records they come from aren't in my pack.
- **E1 and E2 results:** neither has been run. The spec can't freeze until both are back.
- **Reading of the desk's code:** a reading of `src/` (`reviews/S-010/_src-reading.md`) must come before freeze. The areas touched and the read places in J1, J4 and J5 are taken from the plan and `docs/PROJECT.md` until then.
- **Size:** my estimate of 2,500–4,000 lines and 120–180 tests is not a measurement.
- **Design choices still open:** the alert route, the outside check for a stopped feed, the Time Sensitive test on the owner's phone, and the lasting-copies records change.

**5. Needed outside my lane**
- Someone with git commits the three files to `build/definer/S-010`.
- These records need adding to the definer's pack: the P-002 groundwork answers, the Model-Lab desk follow-ups ruling, `intake/later-work.md`, `docs/design/README.md` and `experiments/_REGISTRATION.md`. Without the last, I followed the plan's terms and said so in each file.
- The Chief of Staff briefs a read-only helper to run E1 and E2, with the Reviewer checking the results.
- The session records a Reviewer's reading of `src/`.
- The owner adds the Commit statuses and Deployments read permissions.
- If the alert route needs `src/notify/**` or `src/config/projects.json`, the owner must approve that change.
- The Critic reviews the plan and completes the join-up review once the first design mockups exist.

**6. Open questions** (also listed in the spec)
1. Can the follow-ups and later-items records be added to my pack, so each M9 item gets its own scenario?
2. Can the core-screens record be added too, for M10's per-screen lists?
3. Where should "Looked at it; remember" be kept: a file in the portfolio repository, or on each device only?
4. After how long without a new record should an agent step show as stalled? I drafted 2 hours.
5. After how long without a successful read should a project show as late? I drafted twice the read interval.
6. Should "the owner" be added as a fourth record writer? The plan lists only GitHub, the Orchestrator and an agent.
7. Is `value/P-005/` in the portfolio repository the right place for the weekly device log?

Two of my own choices also need the Critic's or owner's check:
- How owner questions and `stop` cards map to the "decision" and "stop" kinds.
- The proposed field list for the lasting copies in J8.