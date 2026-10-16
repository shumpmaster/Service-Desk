Read-only audit of /home/user/sd-tv2 (branch orch/trial-view-2). Nothing was edited or committed. Every claim below cites file:line. "C" marks my own inference.

## Value targets and first-usable-version items: which have a home

| Item | Where it is delivered | Has a home? |
|---|---|---|
| V1 missed decisions | M1 AC1–AC5, M3A/AC25 measure | Yes, but only while the desk is open (PROJECT.md:413-414). Notifications have no AC (B2) |
| V2 false alarms | AC6, AC25 "Didn't need me" | Yes |
| V3 owner upkeep | AC26, AC27 ops notes | Partly: the weekly estimate is not being recorded (B5) |
| V4 replacement | M3C, AC28 | Yes. Archiving has no milestone (Critic, P-001-milestones-adoption-critic-2.md:46) |
| V5 response time | AC20, AC21, AC25 | Yes, but cards only. Rulings asked in a session are excluded (S-001:649-650) |
| M3B "value targets shown" | no AC anywhere in S-001 (only S-001:15 and PROJECT.md:113) | **No home** |
| Item 1 Universe | M1 AC1–AC8, MD AC54 | Yes |
| Item 2 Cards | AC11/12, AC16–19, AC52/53 | Yes |
| Item 3 Team and pipeline | AC9/10, AC49 | Yes (empty in practice, B1) |
| Item 4 Spend and time | time: AC20/21 | Spend: **no home** (deferred, PROJECT.md:33-34) |
| Item 5 Planning and scheduling | M3A/AC24 (S-001:2096-2105) | Criterion only. No design, no data (B3) |
| Item 6 Usage and context | M2B, AC22/23 | Yes for pipeline sessions only (B1) |

## A. X factors (ranked)

**A1. One place on the phone to ask, note an idea or give an instruction**
- **What's missing:** the "Tell your Chief of Staff…" bar was dropped only because it wrote nothing. "Ask for something in this project" is unbuilt for the same reason. No record was ever named for either.
- **Evidence:**
  - S-001:55-58, 301-312, 197-198 (the lab's compose bar had a mic).
  - The owner, 15 Oct: "I need a reminder somewhere…". That idea was logged in the separate portfolio repo (/home/user/portfolio/ideas/IDEAS.md:9-11), which is not a connected project (src/config/projects.json).
  - The core pain is "requests get buried" (PROJECT.md:510-516).
- **Why it matters:** the owner's purpose is an "interactive workbench" (PROJECT.md:480-481). With this, the desk becomes the one inbox in both directions, using the same prefilled-link route (writing to intake/ or portfolio ideas).
- **Planned?** No. It needs the owner's say plus a spec revision naming the record it writes (S-001:304-309).
- **Size:** medium.

**A2. A "safe to approve" check on every waiting deploy**
- **What's missing:** the deploy approval is "the main control" (S-001:3709-3713). The owner checks it by hand: approve only if the run's SHA equals the merge commit of a pull request the Reviewer passed (S-001:2130-2132). The Deploys line shows the run but no match check, and the approver reads "not recorded" (S-001:1443-1455).
- **Why it matters:** the owner approves every deploy on the phone (S-001:3800-3801). A wrong tap ships unreviewed code (S-001:3721). The desk already reads workflow runs, pull requests and reviews, so it could show "matches PR #77, Reviewer PASS" (C).
- **Planned?** No.
- **Size:** small to medium.

**A3. Away mode: standing delegation plus a "while you were away" report**
- **What's missing:** a standing, time-limited delegation the owner sets from the desk, and a summary of what ran under it. Today it is one-off: L-0010 covered one night and expired 2026-10-15 (docs/LEDGER.md:139-149).
- **Evidence:**
  - AGENTS.md:72-73 says reversible questions adopt their default at timeout. Yet "Service-Desk does not enforce question timeouts" (S-001:553-554).
  - So when the owner is away, everything waits.
  - V5's clock excludes nights and weekends (PROJECT.md:181), which hides the stall.
- **Why it matters:** the owner's words: "I don't want the hours of missed non productivity" (decisions/questions/P-001-overnight-merges.md:4).
- **Planned?** No. Enforcing timeouts is a model change.
- **Size:** medium.

**A4. Capacity and spend, now that sessions record it**
- **What's missing:** spend was deferred because "no project records its spend yet" (PROJECT.md:33-34; P-001-spend-and-planning.md:7-8). Since model S-020 (L-0005, LEDGER.md:73-82), every session line carries tokens and `cost_usd_estimate` (status/outcomes.jsonl), and a `usage-limit` result exists (S-001:2868). AC23 shows them per session only (S-001:668-690). Nothing rolls them up by project, milestone or day, or flags hitting the subscription's limits.
- **Evidence:** watching the subscription's limits was left to a ruling (PROJECT.md:149-151). It was dropped with the 80% alert (P-001-move-to-build-values.md:7).
- **Why it matters:** the owner asked how much could be done in 6 hours (P-001-overnight-merges.md:4) and holds that "spend follows value" (PROJECT.md:518). Hitting the usage limit stops every project at once.
- **Planned?** No. The deferral's premise has partly lapsed.
- **Size:** medium.

**A5. Is each project on track for its date, from recorded facts only**
- **What's missing:** a per-project line with the target date, the milestones still with no work filed, and the slack. No screen shows V4's date against the remaining work.
- **Evidence:** the owner wants "the plan should show what could shorten it and what that would cost" (PROJECT.md:521-524), with "Absolutely no fake numbers" (P-001-design-lab-1.md:7).
- **Why it matters:** the owner thinks in goal > phases > milestones (P-001-trial-view-notes-2.md:96). The date is the business commitment.
- **Planned?** No. The Timeline shows planned milestones but has no time scale (P-001-design-lab-1.md ruling 2).
- **Size:** medium.

**A6. A plain-English narrative for each event or sprint, written by the Chief of Staff**
- **What's missing:** listed as a model change (S-001:285-287) but not filed. S-032 (why and context, /home/user/poom-s032/specs/S-032-why-and-context.md) covers milestones and pull request bodies only.
- **Why it matters:** "I just don't know where to look because I'm not an expert" (P-001-design-discovery.md:6).
- **Planned?** Partly (S-032).
- **Size:** medium.

## B. Hindrances (ranked)

**B1. The desk only sees what is filed, and most of this project's asks and work are not filed**
- **Evidence:**
  - 30 of 35 ruling records were asked in a session (grep of decisions/questions).
  - Only 5 question files were ever added (git log).
  - Session-asked rulings are excluded from Time asked and V5 (S-001:649-650).
  - The last dispatch-log or outcome entry is 2026-10-08T21:52Z, against 169 commits since 10-09.
  - Every status/*.toml is done or closed, and status/plan.json is empty.
  - "Chief of Staff sessions recorded" was ruled to go first (S-001:178-182, 270-275), but no model spec exists (only S-031 and S-032 in /home/user/poom-s03*).
  - The process fix "every ask … is filed" (S-001:83-89) was not followed in batch 2 (P-001-trial-view-notes-2.md:2).
- **Why it matters:** Queue, V5, Team, Timeline, Work ahead and notifications all undercount. "Quiet" can be wrong, which is the owner's worst case (PROJECT.md:536). And "requests get buried" persists.
- **Planned?** Only in principle.
- **Size:** medium (a process rule plus one model change).

**B2. Phone notifications were ruled "built in M3" but appear in no milestone or criterion**
- **Evidence:**
  - The ruling: decisions/questions/P-001-notifications.md:1, with follow-ups at :18-20 (commit 218094d, 2026-10-08).
  - S-001 never cites it. AC45 still says "This spec does not decide it" (S-001:970-1003), and S-001:3858-3865 still says "Coming at MD".
  - The ruled route fires only when the Orchestrator raises a card. It misses questions, pull requests and v2.5 projects (S-001:981-984), and per B1 cards are rare.
- **Why it matters:** answer 1 was "Phone notifications" (P-001-design-discovery.md:4). Trap 1 is "Beautiful but still pull-only" (P-001-design-discovery-notes.md:84).
- **Planned?** Ruled, not specced.
- **Size:** medium to large (manifest and service worker, an Access experiment, an Orchestrator model change).

**B3. Planning and scheduling, the owner's headline purpose, has no design and no data**
- **Evidence:**
  - PROJECT.md:480-481, 496.
  - AC24 lists items in ready, returned, dispatched or waiting-owner states (S-001:2096-2105). None exist (status/*.toml).
  - There is no planning screen in docs/design/screens or mockups.
  - AC24 is one list across projects, against ruling 6, "I don't like to 'cross boundaries'" (P-001-design-lab-1.md:21).
  - "Not before" times are carried out only when a Chief of Staff session happens to run (PROJECT.md:27-31) (C).
- **Planned?** M3A, but it needs design work first.
- **Size:** large.

**B4. The 11 Nov launch date is at risk and the desk doesn't show it**
- **Evidence:**
  - On 10-08 there were about 3 working days of slack (S-001:3803-3811), estimated before two trial-view batches.
  - MD3 has no sprints (PROJECT.md:111). M3A, M3B and M3C have no work filed.
  - Open question 1 is still open.
- **Planned?** A decision at MD's acceptance.
- **Size:** small decision, large impact.

**B5. M3B has no criteria, and the stop-rule measure isn't being kept**
- **Evidence:**
  - The Critic flagged that M3B is out of scope and that "against its measure" is undefined before launch (P-001-milestones-adoption-critic-2.md:41-44; notes:16-17).
  - There is no AC for M3B.
  - The Chief of Staff's weekly V3 and pre-launch owner-time entries (PROJECT.md:200-202) are absent from LEDGER.md (L-0001 to L-0013).
  - The 2-hours-a-week miss rule (PROJECT.md:188-189) can't be judged.
- **Size:** small to medium.

**B6. Adding a project is a code change, capped at 5, and new projects are gated on something with no milestone**
- **Evidence:**
  - J7 is read at build time and a 6th entry fails the build (S-001:2113-2115, 2732-2733, 2780-2781; PROJECT.md:42-43).
  - Each repository also needs its web-commit and prefill settings checked (S-001:2758-2760).
  - L-0007: the scrub proof must pass before P-001 closes "and before the operating model is run on a new project" (LEDGER.md:99-108). It is in neither PROJECT.md nor S-001.
  - The next project is already queued (portfolio IDEAS.md:15).
  - v2.5 projects get a reduced view with no cards (S-001:346-350).
- **Planned?** More than 5 is "a later change".
- **Size:** medium.

**B7. Six of the records the screens need are not kept, so glances fill with "not recorded"**
- **What's missing:** a milestone's "reached" (even accepted M1 shows "work filed"), who has the ball, the deploy approver, verdicts to write, and dependencies (S-001:288-300).
- **Planned?** None of these is filed. Only S-032 is underway.
- **Size:** medium (several model specs).

**B8. No warning before the read token expires**
- **Evidence:** AC5 reports "token rejected or expired" only after the fact (S-001:489). Renewal is a by-hand GitHub plus Cloudflare task (PROJECT.md:128; S-001:3336), awkward on a phone. Every project goes "Can't read" at once.
- **Size:** small.

**Checked and found covered (not listed):**
- Staleness and "Quiet" needing a fresh read: AC4, AC5, AC41.
- GitHub and Cloudflare read failures: AC5, AC30–AC34.
- Signed-out state: AC32.
- Security of acting for the owner: no write credential (PROJECT.md:419-420), AC13, CS9.
- Glance and performance on the phone: AC42, EXP-005, longest call 1.9 s (S-001:2719).
- Accessibility basics: AC42 covers reduced motion and colour never used alone. WCAG is unset, and a 2.5.3 risk is carried (S-001:209-215); minor for one user.

## Already planned, just later
- Webhooks for speed (PROJECT.md:380-382).
- Running sessions from the desk (U3; PROJECT.md:347-368; S-001:310-311).
- Automatic action on planning choices, after launch (P-001-spend-and-planning.md:9).
- Token-based answering routes (PROJECT.md:339-345).
- Why lines and Context facts on every milestone and sprint (model S-032, draft, /home/user/poom-s032).
- Batch-2 rework, notes 1–31 (P-001-trial-view-notes-2.md).
- Waiting deploys counting as needing the owner, after its model change (S-001:173-177).
- A milestone's "reached", after its model change (S-001:168-172).
- Spend, once projects record it (PROJECT.md:33-34). See A4: the data now partly exists.
- Archiving Operations-Hub (AC28 step 3; no milestone).
- More than 5 connected projects (PROJECT.md:42-43).
- Stage-8 evidence review after launch (PROJECT.md:190-191).
