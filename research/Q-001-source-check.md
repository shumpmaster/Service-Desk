Verdict: PASS

I opened the sources for the two items still open and filed both. This round I did not re-open the entries filed in earlier rounds, and I did not commit anything because the folder is not a git repository.

## Findings

1. **F-gh-04: confirmed, filed as `library/F-gh-04.md`.**
   - I fetched both GitHub pages as raw HTML on 2026-10-01.
   - The limits page contains the verbatim "not intended for or allowed to be used as a free web-hosting service… (SaaS)" sentence.
   - The limits page also contains "shouldn't be used for sensitive transactions like sending passwords or credit card numbers."
   - The creating page says "GitHub Pages sites are publicly available on the internet, even if the repository for the site is private (if your plan or organization allows it)."
   - The memo's quote (`research/Q-001-memo.md` line 126) stops at "private" and drops the qualifier "(if your plan or organization allows it)". I filed the full sentence.
   - The creating page also says "the repository must be public" on GitHub Free. I added that to the entry.
   - The two pages come from the same vendor, so they are not independent sources.
   - The "cannot hold secrets" claim stays out. The memo labels it as inference [O, C] at line 120.
2. **Render Starter price: confirmed, filed as `library/F-hosting-05b.md`.**
   - The raw render.com/pricing HTML has a table row for Starter: $7/month, 512 MB, 0.5 CPU.
   - Memo lines 108 and 145 still say this is unconfirmed and that the pricing page returned no prices. Both lines are out of date. The memo should cite F-hosting-05b and grade it [F, A].
   - It rests on a single vendor page.
3. **Fly machine price: withdrawn in the memo.** No number is given (line 102, line 130), so there is no claim left to check.
4. **Earlier entries.**
   - F-gh-01, F-gh-02, F-gh-03, F-hosting-01, F-hosting-03, F-hosting-05, F-auth-02 and F-auth-03 exist in the library.
   - Their wording agrees with memo lines 68–70, 76, 81, 84, 95 and 107.
   - The 02a–c, auth-01/04, 04a/b and 06 entries match memo lines 77–79, 82–83, 99–101 and 113 from the earlier source-check.

## Open questions

- Is billing live for Durable Objects storage? Only someone with Cloudflare dashboard access can answer.
- Which Fly page is right about whether a card is required? The conflict is recorded in F-hosting-04b.
- The Fly machine price is still unknown. It needs the raw price page or the price calculator.
- Does a paid GitHub plan allow a private Pages site? That is unverified and has no entry.
- Most cost facts rest on one vendor page each. Whether that is enough is the owner's call (memo line 58).
