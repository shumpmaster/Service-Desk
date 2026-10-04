Ruling: A
Proxy: done at the owner's request (the owner replied in the session, verbatim: "A")

Question (questions/P-001-acting-route.md, 2026-10-01; options as on the card): how should the desk record your answers?
  A. Prefilled GitHub links (no credential) — each card on the desk has an answer button that opens GitHub's new-file page with the answer already filled in; you tap Commit. It's how you've answered every card so far, so it's proven to start the Orchestrator. The desk holds no write credential, there's no D-066 question, and D5 shrinks. Cost: one extra tap, and the commit happens on a GitHub page rather than inside the desk.
  B. GitHub App user token — the desk writes the answer itself. GitHub shows it as yours with the app's badge, which is an honest record (L-F10). This needs your D-066 ruling that this counts as your own action, and a live test in Define, because GitHub doesn't document that these commits start workflow runs. It makes the project T2 and needs a security review. The token lasts 8 hours and the refresh token 6 months.
  C. Fine-grained personal access token — the desk writes the answer itself, recorded as you with no marking. Starting runs is documented (L-F8). It needs the same D-066 ruling and T2 review. A leaked token is indistinguishable from you.
