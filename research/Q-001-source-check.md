Verdict: FAIL

Nine of the ten proposed entries passed, and one was filed in narrowed form. The memo still contains claims I could not confirm, so the verdict is FAIL. I opened every cited source on 2026-10-01. I used WebFetch for all of them, plus raw HTML via curl for the DO pricing, Fly trial and Fly pricing pages. Line numbers in `research/Q-001-memo.md` are approximate.

## Per entry

- **F-hosting-02a: confirmed, filed.**
  - The limits page says "Only Durable Objects with SQLite storage backend are available" on Free, with 5 GB per account.
  - The pricing page says the same (last updated 2026-09-30).
  - I did not file the per-object limit. The memo left it out too.
- **F-hosting-02b: confirmed, filed.**
  - The changelog says "will be enabled in January 2026, with a target date of January 7, 2026 (no earlier)" and "Developers on the Workers Free plan will not be charged."
  - Whether billing is live is still unconfirmed, and the entry says so.
- **F-hosting-02c: not confirmed as proposed; filed narrowed.**
  - The raw pricing page says: "For compute requests billing-only, a 20:1 ratio is applied to incoming WebSocket messages."
  - It does not say this is a Paid-plan-only rule. The memo's "(a Paid-plan billing rule, not a free-plan limit)" is unsupported, so I left it out.
  - The Free and Paid allowances match the page.
- **F-auth-01: confirmed, filed.** The Cloudflare Access page and costbench agree. Free is "$0 forever" with a 50-user limit. Pay-as-you-go is "$7 per user/month (paid annually)".
- **F-auth-04: confirmed, filed.** The sentence is verbatim on the JWT validation page.
- **F-hosting-04a: confirmed, filed.**
  - The raw HTML says "adding a card ends the free trial and your usage starts counting". My read of the end of that sentence was truncated.
  - A card is not needed to start the trial.
  - The "no lasting free tier" point rests on absence, not on a statement.
- **F-hosting-04b: confirmed, filed.** The pricing page says "All organizations (except for Linked Organizations) require a credit card on file." This conflicts with the trial page, and the entry records the conflict. Volumes are $0.15/GB per month.
- **F-gh-03: confirmed, filed.** The quote is verbatim.
- **F-hosting-06: confirmed, filed.** CX23 is €5.49 / $6.49 per month, excluding VAT and IPv4, from 15 June 2026. The old price was €3.99.
- **P-auth-01: filed as a grade C pattern.** It rests on F-auth-02, F-auth-03, F-auth-04 and F-gh-02, all now filed.

## Findings that cause the FAIL

1. **Fly machine price ($1.73/month).**
   - Memo Option 4 says "$1.73/month (confirmed by the source checker, not reproduced by me)" and grades it [F, B].
   - I could not find $1.73 in the raw pricing page. The WebFetch summary gave about $0.02/month, which looks wrong.
   - The price is unconfirmed, so I did not file it. The memo should withdraw it or mark it as an estimate.
2. **GitHub Pages.** The "Ruled out" line is correct but has no entry. The GitHub Pages limits page does say Pages is "not intended for or allowed to be used as a free web-hosting service to run your online business… or providing commercial software as a service (SaaS)". The memo's claim "It cannot hold secrets" is not supported by that page. The page only mentions not handling sensitive transactions.
3. **Render Starter price (~$7/month).** The compute-plans page confirms 0.5 CPU and 512 MB but shows no price. It is correctly marked as an estimate, and I did not file it.
4. **F-auth-02 and F-auth-03.** I did not re-open these. They were filed earlier, and the memo cites them without changes.

## Open questions

- Is billing live for DO storage? Only someone with dashboard access can say.
- Which Fly page is right about the card requirement?
- Does the memo's reference to a Fly figure "confirmed by the source checker" come from an earlier round I cannot see? Nothing in this folder supports it.
- Are single vendor-doc sources enough for cost facts? Most filed entries rest on one vendor's docs. Only F-auth-01 has a second source.
- The WebFetch tool summarises pages, so the quotes for pages I did not read as raw HTML came through a summary. This applies to the limits page, the changelog, the Access page, the JWT page, GitHub and Hetzner.

Filed in `library/`: F-hosting-02a, F-hosting-02b, F-hosting-02c (narrowed), F-auth-01, F-auth-04, F-hosting-04a, F-hosting-04b, F-gh-03, F-hosting-06, P-auth-01. I did not commit anything, because this folder is not a git repository.
