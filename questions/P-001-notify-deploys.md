# Ruling needed: Should a deploy waiting for your approval notify you now?

Milestone: none (notifications are not yet a milestone; this question shapes the spec change that adds them)

WHY: On 16 October you ruled that a waiting deploy counts as needing you only once the operating model records who approves each deploy, so it works the same for every project. Only Service-Desk has deploys, and you are its only approver. You now want a notification for anything at all that waits on you. Leaving it unruled holds the notifications spec.
OPTIONS:
  A. Notify now, and count them now — A deploy waiting for your approval notifies you and counts as waiting on you on the desk. If another project adds deploys, it is put to you again.
  B. Notify now, desk count unchanged — It notifies you; the desk's Deploys line stays in its own group until the model change, as built.
  C. Wait for the model change — As you ruled on 16 October: no notification and no count until the model records who approves each deploy.
RECOMMENDATION: A — today only Service-Desk has deploys and only you approve them, so it already works the same everywhere, and you want everything that waits on you.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: whether waiting deploys notify you and count on the desk; Service-Desk only
DEFAULT: C   TIMEOUT: 48

## Context
- The owner ruled that waiting deploys start counting as needing the owner only after the operating model records who approves each deploy (source: decisions/questions/P-001-design-lab-answers-followup.md, line 1)
- Service-Desk's deploy workflow names the owner as the required reviewer of both environments (source: .github/workflows/desk-deploy.yml:5-7)
- Personal-Org-Operating-Model has no deploy workflow and no GitHub environment (source: Personal-Org-Operating-Model .github/workflows/ at 90f53e3: ci.yml, launch-trial.yml, pr-body.yml, scrub-proof.yml)
- The notifications amendment's first draft notified waiting deploys in both projects as its own choice; the Critic found that this overrides the 16 October ruling and needs the owner's answer (source: reviews/S-001-notifications/_critic-round1-verbatim.md, finding 1, on branch orch/s001-notifications)
- The owner asked for a notification "whenever anything at all is waiting on me" (source: decisions/questions/P-001-notify-job-merges.md)
