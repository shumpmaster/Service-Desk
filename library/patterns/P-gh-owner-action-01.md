---
id: P-gh-owner-action-01
form: pattern
claim: "If actions are wanted from a cross-repository view: use a separate GitHub App with minimum permissions (Deployments write to approve; Contents write to merge; Pull requests write to review) [F-gh-perm-02]; act only with the owner's App user token, never the installation token, whose actions show as name[bot] [L-F1]; user-token actions are attributed to the user and the app (badge; security log 'GitHub App user-to-server token') [L-F10; badge also L-F2; single page]; its permissions are the intersection of user and App and it can be narrowed by repository_id [F-gh-app-tokens-02]; attach the credential outside any agent session [LIB-P-a]; gate the view with Cloudflare Access, Emails = the owner [P-auth-01]; if the view runs as a Worker, Worker-level Access covers all its hostnames [F-cf-05; not documented for Pages]. Limit: does not by itself prove the owner was present for each action."
grade: C
topics: [github, attribution, security, agents]
checked_on: 2026-11-12
shelf_life: 6 months
opened_by: source-checker (Q-027, 2026-11-12); every cited entry read and found to state what the pattern uses it for
memo: research/Q-027-memo.md
rests_on: [F-gh-perm-02, L-F1, L-F2, L-F10, F-gh-app-tokens-02, LIB-P-a, P-auth-01, F-cf-05]
---
