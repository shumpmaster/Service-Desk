Verdict: FAIL

The plan for getting the desk onto needs-you's production deployment holds up. Three things fail it: two launch steps break the 10-minute rule the plan's own test locks, the fallback for reading the branch cannot run, and the Launch-gate question is badly timed and argued on a misreading.

Checked on the branch at e477cc2 against d2a1d60, read-only. `governance/checks/check_all.sh . d2a1d60` passes every step, and the tree is still clean afterwards. Spec line numbers below are specs/S-001.md on the branch.

**What I relied on, graded**
- **A (I read it myself):**
  - desk-deploy.yml:43, 96, 108-111, 150-155, 164.
  - desk_pick_commit.sh:42, 46.
  - desk_preview_check.py.
  - sw.js:21-30.
  - api.js:258-260, 272, 295; access.js:32-41, 87-93. The functions read only `OWNER_EMAIL`, `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `GITHUB_READ_TOKEN` and `GITHUB_BILLING_TOKEN`.
  - sender.mjs:142 with run.mjs:50 (the sender reads src/config/projects.json); desk-notify.yml:75.
  - _headers and manifest.webmanifest hold nothing tied to one host.
  - The test lines the plan cites: j7-config :37/:49/:55/:65/:90/:97, notify-j17-push :101/:109.
  - risk-paths.toml and SURFACES.md.
  - wrangler 4.148.0 itself, from the npm cache. Its sha512 equals package-lock.json:1461. In cli.js, `args.projectName ?? config2?.name` (~302727), `isProduction = project.production_branch === branch` (~301455), the config's hash and output directory sent (~301570), no check that the config's `name` matches, and `pages deployment list --environment` exists and shows the branch (~304240-304296).
- **C (could not check):** the cloudflare-docs quotes (the GitHub API refused access to that repository) and the Operations-Hub workflow at bd84592 (not on disk). PROJECT.md:244 quotes that workflow without `--branch`, while AC28 and EXP-002 say `--branch main`; that is one more reason P1 is needed.

**Blocking**

B1. Two launch steps break AC27/V3's "each step under 10 minutes", and so break the plan's own locked test.
- The LA1 test (3913) requires the launch section's "every step gives its minutes, each under 10".
- P4 is "about 15 minutes" (3941), and its parts (a)–(d) have no minutes of their own.
- L8 is "about 10 minutes" (3987), which is not under 10.
- As written, LA1 cannot satisfy both the plan and its test.
- Fix: give P4 (a)–(d) and two halves of L8 their own minutes, each under 10 (L8a: add to Home Screen and subscribe; L8b: update both secrets and test).

B2. The P1 fallback cannot run (3932-3936, CS37 at 18405-18411). It says to add a `pages deployment list` step to `exp-002` in CS37's pull request and have the owner "approve one run of it before merging". That cannot happen:
- workflow_dispatch runs the workflow file from the chosen ref, so before the merge main has no such step;
- `exp-002` runs only when the ref is main (desk-deploy.yml:164);
- the `preview` environment allows `main` only (G2, and L1 checks this);
- the commit must already be on main (desk_pick_commit.sh:42).

A run after the merge would mean CS37 had already set `PROD_BRANCH` without knowing it. Fix: a separate pull request first that only adds the list step (merged, then run, approved by the owner), and CS37 after it; or another read the owner can do.

B3. The Launch-gate question (20923-20937) is badly timed and not fairly put.
- **Timing:** it is filed "(before L9)", and 3925 says the same. But option B needs "the launch review [to run] before the sitting, about a day more". If the owner answers B at L9, the desk is already live, so the plan in effect settles A. It must be answered before the sitting is scheduled, or before LA1 merges.
- **The reason given for A misreads an earlier ruling:**
  - The plan says graduating now would take M3F off the board. But the owner ruled (P-001-glance-plan-milestones.md, B) that M3F is "work of its own … its own short route … with its own gate rulings, so it can never hold the Build gate or launch". After graduation, new work comes back as a new item anyway (OPERATING_MODEL.md:116).
  - "with no further Critic gate (P-001-build-path.md, question 0)" appears nowhere in that record; the phrase exists only in this new text.
- **Option A leaves out the cost:** the model makes go-live and graduation one act at the Launch gate, and "Nothing goes past a gate until the owner passes it" (OPERATING_MODEL.md:114, 116). Option A does not tell the owner that it departs from this, or whether that needs a ledger exception like CS8's.
- **Fix:** move the deadline before the sitting, state the M3F ruling correctly, drop or support the Critic-gate citation, and name the departure from the model.

**Non-blocking**

- **N1. Renewing a token after launch.** Under either answer to question 1, renewing a token on needs-you needs a production redeploy. The production job takes only a commit that matches main and that the preview deployed last (desk_pick_commit.sh:46, desk_preview_check.py). So if main holds src changes not yet accepted, a renewal sends them live. LA1's renewal jobs (3913) should say so and be timed with both deploys.
- **N2. Hold more than src during the sitting.** CS38 and 3966 hold only `src/**`. The pick check also refuses if `.github/workflows`, `.github/deploy-tools` or `.github/scripts` change after the commit, so hold those too.
- **N3. Existing Access applications.** P4(a) (3942) assumes needs-you has no Access application yet; EXP-002 says its Access state was "Not shown". Add: first list any existing applications on `needs-you.pages.dev` and `*.needs-you.pages.dev`, delete them or limit them to the owner, and put only the two owner-only audience tags in `ACCESS_AUD`. Re-check custom domains too, as C6 asks. Records stay safe either way, because the function checks the owner's email (access.js:91).
- **N4. Test precision.** "the disable step before the approval step" (3913) can match L3's preview approval; name the production approval. The test also does not lock "archive only after the check" (AC28's step 3).
- **N5. Which application to check.** "Checking the Access applications (four)" leaves out the N10 bypass applications, if any were added at P4(d).
- **N6. Wrong record path.** AC27 (13680) and C6 cite `questions/P-001-m3c-tokens.md`, which is deleted once answered (CS7). Cite `decisions/questions/`.
- **N7. Question 1 options.**
  - It leaves out the cheaper choice "paste the values you kept, if you kept them".
  - Option B's "N12's settings" may be the wrong token kind (EXP-006 is not recorded).
  - Neither question says what happens if the owner doesn't decide (D-019).
- **N8. "Everything can be undone."** The opening (3800) omits that regenerating a token cannot be undone. The rollback job should also cover taking `push.deskUrl` back and moving the phone's subscription.
- **N9. Two copies of the steps.** P1–L9 are written both in LA1's notes and in the Chief of Staff's rewrite before P4, and the two can drift apart. Name one as the source.
- **N10. Unmarked tests.** No test file is named to gain an `ac-test: S-001/AC28` mark.

**Checked, no finding**
- **Deploying to needs-you:** `--project-name needs-you` wins over the config's `name` (A), so wrangler.toml and AC15's pin rightly stay.
- **Order:** merging CS37 before LA1 is forced by desk_pick_commit.sh:46.
- **Old job overwriting the desk:** the order L3 → L4 → L5 keeps the old `needs-you-page` job from overwriting the desk.
- **Origin check:** it works on any host, with no allow-list needed.
- **Taps during the switch:** these follow sw.js's rule.
- **Address pins:** every test that pins the address is named; the other tests use made-up values and can stay.
- **Lanes and reviews:**
  - LA1: the Builder. It is R3 because of src/config/projects.json, so it needs the Reviewer and the owner, plus the Design reviewer because of src/public/lib/config.js.
  - CS37: the Chief of Staff; R3 (.github/**), so the Reviewer and the owner.
  - CS38: the Chief of Staff (docs/PROJECT.md and decisions/), with the `Owner-Ruling:` rule matching v3_checks.py:138-147.
- **AC28's usage condition** does hold: 9 lines with usage figures in status/outcomes.jsonl from line 98, and M2B was reached on 2026-10-18.
- **Who can read the desk:** `ACCESS_AUD` holds needs-you's tags only, so a sign-in to the preview does not open needs-you.
- **Token handling:** no token goes into a chat, file or commit.

**Open questions**
- Does Cloudflare's dashboard show the branch for Direct Upload deployments? Only P1 will tell.
- Does a Pages rollback keep the secrets of the deployment it restores? That matters for "an earlier desk back" after a token renewal (C).

Spec on the branch: /home/user/sd-ladef/specs/S-001.md
