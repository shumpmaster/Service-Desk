Verdict: FAIL

**For the owner.** The design follows your two rulings and the experiment is set up properly. It is not ready to build yet, for three kinds of reason. First, it promises more than it can deliver. It says you will always be told when notifications stop, but one way they can stop silently is left out. It also says an already-answered question will never offer its link, yet in exactly the case you reported (answered in the session, its record not landed yet) the link still shows. Second, the sender's security has gaps that matter because Service-Desk is public. The secrets run with no approval from you on whatever code reaches main. Strangers' pull requests start the sender. The "hidden" keys it stores publicly can be worked out by guessing. Third, a few things need your say or need fixing first. It notifies waiting deploys now, though on 16 Oct you ruled they count only after the model change. Option B of question 1 wrongly says its token "may only start" the sender. One of your setup steps (N8) is not exact. And the planned failure test would not fail the way the spec says.

I read the worktree at /home/user/sd-def-notify (no shell, so I didn't check the commits): specs/S-001.md and experiments/EXP-006-access-push.md, against governance/standards/definition-of-ready.md, specs/_TEMPLATE.md and questions/_TEMPLATE.md. Line numbers are specs/S-001.md unless named.

**BLOCKING**

1. **Deploys notify against an owner ruling** (:729-731, :4294-4299, :4311, :4322-4327). decisions/questions/P-001-design-lab-answers-followup.md:1 and :5 say waiting deploys count "only after the operating model records who approves each deploy". The owner turned down "Now, Service-Desk only". The amendment notifies deploys in **both** projects now, as the Definer's own choice (C), reading "anything at all" as overriding that ruling. Its only evidence (desk-deploy.yml:5-7) covers Service-Desk alone. In Personal-Org-Operating-Model the approver is unknown, which risks V2 (false alarms). → Definer: make it an open question for the owner. Escalate: it changes a ruling.

2. **The lead's "Nothing failed or was skipped" and its "anything at all" promise are wider than AC73** (:637, :647-650 against :732, :4317-4318). "Verdicts to write" is skipped and the lead never says so. A held loop notifies only once the hold card exists, after 60 minutes of a red run (Terms :907-910), and "exactly when" doesn't say that either. Nothing outside a record notifies: token renewals and the owner's own setup steps, for example. → Definer: list these limits plainly in the lead.

3. **AC77 promises more than it delivers** (:4474-4478, :4504-4514). In the reported case the answer record sits in an asks-merge pull request that is still open. A re-read then finds the question unanswered and opens GitHub "as today", so the stale link still shows. "GitHub's own guard stays: a second answer file of the same name is refused, because the file exists" (:4513-4514) is false in that window, because the file is not on main yet. Under option C, and until question 2 is answered, the reported problem stays. Question 2 calls C "only the re-read" without saying that. → Definer.
   - Self-implication flag (D-050): this gap dates from the model 3.5.0 records amendment, which the Critic checked (reviews/S-001-model-3.5.0-records/_critic-round1-verbatim.md and _critic-round2-verbatim.md) and did not catch.

4. **"2 to 4 minutes" has no record behind it** (:4501-4502, :7462, :7473). It is cited to "the owner's report", but the quoted words (:674-676) give no time. Pull request #84 took 85 seconds (:6895). → Definer.

5. **Question 2 is not ready to file.**
   - Its first Context bullet's source is "this session, 2026-10-18, as relayed" (:7472). That is not a record, and the template requires `(source: <record>)`.
   - The second bullet rests its "2 to 4 minutes" on the same unrecorded report (finding 4).
   - → Chief of Staff: record the owner's report first. Then Definer: cite it.

6. **Question 1's option B misstates the token** (:7439). It says "one that may only start Service-Desk's sender". Its own cited source, Q-011 T10b (research/Q-011-memo.md:89), puts `dispatches` under Contents **write**. That token could push to Service-Desk, a public repository whose main is unprotected. A `workflow_dispatch` token would need Actions: write, which also allows deleting the `desk-notify-state` artifact. The recommendation of B hides that risk. → Definer: give B its true cost and risk.

7. **`test: fail` cannot work as written, and may harm the subscription** (:6160-6163; EXP-006:37, :50; AC76 :4454-4455).
   - The push service never sees the `auth` secret: the encryption is end to end (RFC 8291). So a wrong `auth` key gets a `201`, not a refusal. No issue is opened, and case 7 cannot run.
   - The phone then gets a push it cannot decrypt, which shows nothing. W8 (memo:39) says Safari revokes permission for such a push.
   - → Definer, and the EXP-006 author: use a refusal the push service can see, such as a JWT signed with the wrong VAPID key.

8. **The VAPID refresh rule is misread** (:6142-6143). V8 (memo:57) says "refresh the JWT at most hourly". The spec mints a new JWT on every sending run, which can be several an hour, and cites V8 as if that complied ("within a run"). → Definer: comply, or make it an unknown that EXP-006 measures, with a fallback.

9. **The secrets run with no approval on code that reaches main** (:6419-6425, :7284-7290). R3-B1 (:6282-6287) says code on main is not enforced as reviewed, because agents push as the owner. That is why every Cloudflare secret waits for the owner's approval. The `notify` environment has no reviewer (N4, :6661-6662). Any push to `src/notify/` runs on the next 5-minute sweep holding the VAPID key and the private repository's read token, and its logs are public. Risks presents "runs only the default branch's code" as the control. CS9 (:6507-6519) checks only `preview` and `production`. → Definer: state this risk plainly to the owner, add `notify` to CS9, or gate the sender.

10. **Untrusted input from strangers' pull requests** (:6405-6416, :6421-6422).
    - On a public repository, `pull_request_target` runs, and `workflow_run` runs started by fork pull requests, run as the default branch, so the `notify` branch rule does not keep the secrets from them. "A run from any other branch cannot read its secrets" reads as protection against pull requests, which it isn't.
    - Unlike Workflow 2 (:6291), the spec never forbids `${{ github.event.* }}` (titles, branch names) in `run:`.
    - A stranger's pull request is "a pull request to merge" (Terms :935). It pushes its own title, up to 140 characters, to the lock screen (:4366-4367). The spec doesn't address that.
    - → Definer.

11. **"Hashed keys" do not hide anything** (J18 :6178-6182; AC76 :4464-4466).
    - The keys are plain, unkeyed SHA-256 of guessable strings, `<project>|<kind>|<PR number or path>` (:4328-4329). Anyone who downloads the public artifact can try the likely pull request numbers and kinds and learn what is open in the private repository.
    - The state also publishes per-project counts.
    - The 6-hour give-up "named in the issue" (:4448) would name a private item in a public issue.
    - → Definer: use a keyed hash with a secret key, and nothing private in the issue.

12. **AC73's test cannot be built as written** (:4333-4339).
    - It asks for fixtures from Personal-Org-Operating-Model's real records at 90f53e3. tests/desk/fixtures/README.md:33-36 says that repository's files "are NOT copied here", and AC76 forbids that private detail in public places.
    - "One thing of each kind ... from Service-Desk's real records" is impossible: no hold or merge card is on main (fixtures README:29).
    - → Definer.

13. **An expired read token stops the operating-model project's notifications silently** (AC76 :4443-4445, :4456-4459; N3 :6655-6659). When N3's token expires, every run marks that project "not read" and keeps its old set. No issue opens, and the desk looks fine because it uses its own token. That breaks AC76's own promise that "the owner is told ... when notifications have stopped". → Definer: open the issue for a project unread past a set time.

14. **The owner's steps are not exact or in order.**
    - N8 (:6674-6676; EXP-006:73-75) says to add a Bypass policy to "the preview's Access application". In Access, a policy applies to the whole application. Exempting three paths takes a separate application for each path with its own Bypass policy, and there are two applications, C2 and C3. Followed literally, the step bypasses the whole desk.
    - The brief puts "the owner's N1 to N7" after the pull requests (:7767-7768). But N1's public key must be in the receiving-side pull request (:7761-7762, CS17 :6641-6642).
    - CS15 (:6632-6636) merges Workflow 3 before N6. Its runs then fail every 5 minutes, and GitHub sends a failure notice for each one.
    - → Definer, and Chief of Staff for CS15 and CS17.

15. **The owner's time and the launch date are not reworked** (:7072-7088, :7294-7306). The table and the cost line still total 188–238 minutes. They leave out N1–N9 (about 35 minutes), EXP-006 (15), two questions, one or two more pull requests with their deploy approvals, and CS15's pull request. The work now comes before MD3, and V4's 11 November was already "no slack". The lead doesn't say the date is at risk. Rollback (:7297) has no notifications step: disable the workflow, then delete the environment and the secrets. → Definer.

**NOTE**

- N1. EXP-006 and the spec's summary of it disagree.
  - Case 5 is "a pull request marked ready" in the experiment (EXP-006:34-36) but "a pull request opened" in the summary (:7168-7169).
  - The summary drops the second exclusion (EXP-006:66-67 against :7182).
  - Workflow 3 says EXP-006 checks whether `workflow_run` fires for runs started by a workflow's own token (:6413-6415). EXP-006 has no such case.
- N2. Case 5 could be skewed by AC77's 30-minute hold if the hold is built before the run (EXP-006:46-48). Failures of cases 1 and 2 for any reason other than a sign-in page have no fallback (EXP-006:73).
- N3. The single-run concurrency can replace a pending `test: true` or `test: fail` run, so the owner's N7 test may silently never send (:6426-6428). "Nothing is lost" holds only for sweeps.
- N4. J18 should tell "no artifact" apart from "the artifact read failed" (:6186). Otherwise a failed read triggers the first-run bootstrap.
- N5. J16 (b) (:6097-6100) will notify when the job skips a pull request for a passing read failure (asks_merge.py:49), then merges it on the next run.
- N6. The lead says "add four secrets in GitHub ... and paste one value into GitHub" (:651-653). There are four in all, so it reads like five.
- N7. Question 1's title, "not up to a quarter of an hour" (:7432), against its WHY's "sometimes more".
- N8. Question 1's Context bullet 2 (:7446) states as fact a sender that does not exist yet.
- N9. Question 1's Context bullet 3 says "worst at the start of every hour" (:7447). F-gh-12b says only that high load includes the start of every hour.
- N10. N9's step (:6677-6680) should say "update" the existing `DESK_PUSH_SUBSCRIPTION` secret, not "add" it.

**Routing:** findings 1–4, 6–15 and the notes go to the Definer, the stage that failed. Finding 5 goes to the Chief of Staff, then the Definer. Finding 1 needs the owner's ruling (D-034). Findings 7 and N1–N2 also change the EXP-006 registration, which is still to be frozen. Root cause, common to 3, 9, 10, 11 and 13: the amendment carried over the desk's earlier guarantees (no write path, owner-gated secrets, the existing file guard) without re-checking them against a sender that runs unattended, holds secrets in a public repository, and runs in front of the asks-merge job.
