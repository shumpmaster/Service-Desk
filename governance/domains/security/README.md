# Domain pack: security

Read by `security-reviewer` (roster class `reviewer`). Required on the paths that
governance/risk-paths.toml maps to this domain (by default `**/auth/**` and `**/payments/**`).
A domain is configuration, not a framework: this pack, a reviewer-class agent on the roster, a
`[paths."…"]` table in risk-paths.toml, any domain CI checks under `checks`, and (T2+) a human in
CODEOWNERS for its paths.

## Context
<What is sensitive in this project: which data, which credentials, which trust boundaries.
Keep it short, and link rulings by ledger ID.>

## Refute checklist
1. Authentication and authorization: can any new or changed path be reached without the check
   it needs? Is a check done on the client only?
2. Input handling: is untrusted input validated, and are queries, commands and paths built safely
   (no injection, no path traversal)?
3. Secrets: does the diff add a secret, log one, or widen who can read one?
4. Crypto and randomness: standard libraries only, no home-made primitives, secure randomness
   for tokens.
5. Failure modes: does an error fail closed? Are exceptions swallowed around a security check?
6. Dependencies and network: any new package, permission, outbound call or data flow? In scope?
7. Tests: is every security-relevant branch covered by a test that would fail if the check were
   removed?

Verdict file: the orchestrator records your verdict verbatim in
reviews/<PR>/security-reviewer.md.
