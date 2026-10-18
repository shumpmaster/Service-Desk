# Ruling needed: Should the operating-model project's notifications reach you as fast as Service-Desk's?

Milestone: none (notifications are not yet a milestone; this question shapes the spec change that adds them)

WHY: Service-Desk's events notify you in about 2 minutes. The operating-model project is a separate repository, so without a fast path its items are found only by a sweep every 5 minutes, which GitHub may run later still. Leaving it unruled leaves that project on the slow path.
OPTIONS:
  A. Keep the sweep — Its items reach you in 5 to 15 minutes, sometimes more. Nothing to add there.
  B. A fast path — The operating-model project gets its own small workflow so its items reach you in about 2 minutes too. It takes a change in that repository and one more secret or token you set by hand; the Definer picks the safest way and states its cost before anything is built.
RECOMMENDATION: B — you want the desk to be fast, and the cost is shown to you before it is built.
RISK CLASS: R0   REVERSIBILITY: reversible   BLAST RADIUS: how fast the operating-model project's items notify; a workflow and a secret in that repository
DEFAULT: A   TIMEOUT: 48

## Context
- The owner asked for a notification "whenever anything at all is waiting on me", wanting "to know exactly when something shifts" (source: decisions/questions/P-001-notify-job-merges.md, the owner's request quoted)
- The notifications amendment's first draft sends from Service-Desk only, finding the operating-model project's items by a 5-minute sweep (source: specs/S-001.md at 0b7c33c on branch build/definer/s001-notifications)
- The Critic found that draft's option B understated the token: one able to start Service-Desk's sender could also push to Service-Desk, a public repository (source: reviews/S-001-notifications/_critic-round1-verbatim.md, finding 6, on branch orch/s001-notifications)
