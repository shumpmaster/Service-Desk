Ruling: A — run the safety proof every Monday as well as by hand, with the Builder's model, the proof still holding no write access
Proxy: done at the owner's request (the owner picked an option in the session on 2026-11-11; the question, the options as put and the owner's answer are quoted verbatim below)

Question: questions/scrub-proof-schedule.md (filed in #354, removed here)
Milestone: M4

Question, as put: How often should the safety proof run on its own? It decides whether Builders may use a shell; GitHub changes runner images every week or two, and commands switch off each new month until a proof passes. (Filed as questions/scrub-proof-schedule.md in PR #353.)
Options, as put: A: weekly (Recommended); B: monthly, on the 3rd; C: weekly, auto-opens the change.
Recommendation, as put: A.

How it was answered: put to the owner in the Chief of Staff's session (session_01QBwHGNGhaxp9ABH6WFJJE2) on 2026-11-11, after the question file was pushed to the branch of #353. That pull request merged before the file reached it, so the file was filed again in #354, which merged; this record follows on the default branch. The owner had asked earlier in the session: "Okay run the proof on a schedule."

## The owner's words, verbatim
"A: weekly (Recommended)"

## How it is carried out
- .github/workflows/scrub-proof.yml gains a Monday schedule (10:41 UTC). A scheduled run takes the MODEL_BUILDER repository variable as its model. Its permissions stay read-only, and it still writes and commits nothing. This is an R3 change, with the Reviewer's verdict and the owner's.
- When a scheduled run passes on an image month that governance/RUNNER.toml does not yet hold, the Chief of Staff opens the settings change for the owner's approval at its next session. When one fails, the Chief of Staff reports it. The desk's notifications do not watch this workflow, so the report depends on the Chief of Staff's session checks.
