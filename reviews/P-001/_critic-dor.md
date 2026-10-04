Verdict: FAIL

The exit has real gaps. §8 contradicts the owner's ruling, one library claim is overstated, and several claims can't be verified from this pack. Part 1 has all eight definition-of-ready sections (`governance/standards/definition-of-ready.md:7-14`), and most §7 citations match the library.

**Findings that block**

1. **§8 defines "Act" in a way that contradicts route A.**
   - `docs/PROJECT.md:266-267` says "the desk writes the owner's answer into the project repository". Route A says the desk holds no write credential and the owner commits every answer (`docs/PROJECT.md:197-199`, `:104-108`, `:351`).
   - §1 line 17 says cards are "answerable from the desk", and Part 2 line 363 says "Every action writes back".
   - §8 claims no contradictions. It also uses the old definition to resolve the D-066 tension (`:277-280`). The term must say the desk prepares the answer and the owner commits it.

2. **U2 overstates L-F9.**
   - `docs/PROJECT.md:193` says "The narrowest permission for an answer file is Contents: write (L-F9, B)".
   - `library/facts/L-F9.md:4,13` says create/update file contents is under Contents: write and Workflows: write, with the "additional permissions" mark. The tables don't say whether several permissions are required or any one suffices. Which case applies per endpoint is "unconfirmed".
   - "Narrowest" is therefore not supported. It matters little for route A, but it is stated as evidence.

3. **Claims rest on files I can't open, so I can't verify them.**
   - The pack has no `research/Q-00x-memo.md`, `decisions/questions/*.md` or `queue/` files. These are cited at `docs/PROJECT.md:24,138-141,200-201,255-257`.
   - The O3 acceptance ("the owner replied: 'Yes'", `:250-251`) can't be checked against a decision record. It is also the only open load-bearing unknown. It sits under the $0 ceiling, and the definition of ready asks for every such unknown to be answered.
   - Rows 4 and 5 of the §7 table (`:142-143`) are labelled "Observed, not filed (C)" and rest on Operations-Hub docs outside the pack. The text itself says they are not load-bearing.

**Smaller defects**

4. **U2 uses an absence claim as a fact.**
   - `docs/PROJECT.md:189-190` says a fine-grained PAT has "no documented marking that separates it from the browser" and cites L-F5.
   - L-F5 (`library/facts/L-F5.md:4`) contains no such statement. A comparable absence claim was explicitly not filed for L-F4 (`library/facts/L-F4.md:15`). Label it as an unfiled absence claim.

5. **U3 cites a memo ID, not a library ID.**
   - `docs/PROJECT.md:218` says "F-18, A". The library entry is LIB-F-e (`library/facts/LIB-F-e-agent-sdk-no-claudeai-login-for-third-parties.md:2,10`), and F-18 is only the memo's number.
   - The U3 evidence row (`:140`) omits LIB-F-h, -d and -b, while the text makes claims about the GitHub Action and cloud sessions at `:210-216`. Those claims may be supported elsewhere in the library, but the row doesn't say so. I did not trace them.

6. **GitHub Pages is stated without its qualifier.** `docs/PROJECT.md:177` says "public, even when the repository is private". F-gh-04 (`library/F-gh-04.md:8`) adds "if your plan or organization allows it", and it does not rule out private publishing on Enterprise plans. This doesn't change the choice, since Pages isn't used.

7. **WebSocket billing is joined from two entries.** `docs/PROJECT.md:155-156` joins the 20:1 ratio (`library/F-hosting-02c.md:8`) to the Free plan's 100,000 daily requests. The entry doesn't say the ratio applies to the Free plan. The inference is plausible but should be marked as an inference.

8. **D5.2 may not match the tier.** `docs/PROJECT.md:72` says "the security review the tier requires" while the proposed tier is T1 (`:104`). It is unclear whether T1 requires a review.

**Checked and sound**
- Cloudflare numbers: 100,000 requests a day and 10 ms CPU (F-hosting-01); Access at $0 for up to 50 users (F-auth-01); Durable Objects 5 GB on Free (F-hosting-02a).
- The Free-plan DO billing quote (F-hosting-02b) and the Q-004 polling facts.
- The arithmetic: 60 × 16 = 960 requests a day, and 3 calls × 5 repos × 60 = 900 calls an hour.
- The §6 values are measurable, and their dates are consistent with the stop rule.
- The O3 fallback is stated.

**Open questions**
- Does §8's "Act" get rewritten to match route A? Fix this before the card goes to the owner.
- Can the decision records and the memos be added to the pack so the O3 acceptance and the route A and planning rulings can be verified?
- Does T1 require a security review (D5.2)? If not, drop the "the tier requires" wording.
- Which entries support the GitHub Action claims in U3?
