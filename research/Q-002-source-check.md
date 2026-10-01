Verdict: FAIL

I filed 7 of the 8 proposed entries, two with changes, and rejected L-F9 because its own source contradicts it. I fetched all 21 cited pages today (R2–R20 including R6b, plus L-F1's source). The quotes came through a summarising fetch tool, so they are close to the page text but not guaranteed verbatim. Nothing was committed because the working folder is not a git repository.

**Not confirmed: L-F9 (memo line 124)**
- The R13 permissions table marks `PUT …/contents/{path}` and `POST …/issues/{n}/comments` as needing "additional permissions".
- The entry names only Contents: write and Issues: write, so as written it is incomplete or wrong. The memo says as much in open question 5 (line 139).
- It also rests on a single source. It is not filed.

**Filed in `library/`**
- **L-F3 (`facts/L-F3.md`):** only the first clause is filed, that issue comments carry `performed_via_github_app` (R17, grade B). The clause that the PR review schema lacks the field is an absence claim from a summarising fetch (R18: 13 properties, field not listed). I did not file it.
- **L-F4 (`facts/L-F4.md`):** confirmed against R2, R6b, R7 and R8, grade B. R8 says short-lived tokens are "enabled by default for all new applications". The "no per-repository restriction documented" clause is an absence claim and is left out. Identity and reach rest on R2 alone.
- **L-F5 (`facts/L-F5.md`):** confirmed, grade B. R10 confirms the single owner, repository limit, `expires_in` 1–366 or none, and the lifetime policy. R10 puts the one-year removal under "Personal access tokens (classic)". R9 says only "personal access token", so the last clause records a documentation gap.
- **L-F6 (`facts/L-F6.md`):** filed at grade B, not A as the memo has it (line 119). "Every account that the app is installed on" appears only in R3. R4 states no expiry, manual revocation and sign-only, but says nothing on the "every account" wording. That part therefore has one source.
- **L-F8 (`facts/L-F8.md`):** confirmed, grade B. R19 and R20 both state the `GITHUB_TOKEN` rule. R19 uses "opened, synchronize, or reopened" for pull requests. The installation-token and PAT part rests on R20, with R19 covering pull requests only.
- **L-F10 (`facts/L-F10.md`):** confirmed, grade A. The badge and security-log detail rest on R5 alone. The memo lists no sources for L-F10 (lines 127–129), so I assigned them myself.
- **L-P1 (`patterns/L-P1.md`):** confirmed, grade B. R3 gives server-side encrypted storage and a sign-only vault. R4 warns about environment variables.

**Memo statements that don't hold up (none of these is filed)**
- Line 87 grades "A" for a token pushed to a public repository being revoked. Only R9 says this, so it is B.
- Line 61 cites R11 for OAuth apps not being able to go below `repo`. R11 does not say that.
- Line 82 says R19 covers installation tokens and PATs for pull requests only. That is correct.
- R14 (line 65): the quote is cut short. The page continues "and no custom signature information, such as Commits API". The meaning is unchanged.

**Other confirmed items**
- R2, R3, R5, R6, R7 and R10 support §1–§4 and §10. R6 does not say "without use", but R7 does.
- R12 and R16 are silent on PAT marking and on `performed_via_github_app`, as the memo says.
- R15 and R16 quotes match.

**Process note**
- The memo's contract section (lines 169–205) contains the Researcher's reasoning. The brief says I must not see it. I used nothing from it as evidence.
- The "Estimate" and "C" statements (§4, §6, §7, §8, §9 table) are not fact entries and are not filed.

**Open questions**
1. Does D-032 define the grade scale? The memo's scale is provisional. I used it, with A requiring two independent first-party pages.
2. Should L-F9 be resubmitted after someone reads the full R13 "additional permissions" footnotes? Pull requests may need Pull requests: write for PR conversation comments.
3. Do you want the C-grade absence claims (R18 field absent, no OAuth per-repository limit) filed as "documentation gaps" with a tighter wording? I held them back.
4. The memo's open questions 1–4 (fine-grained inactivity removal, workflow payloads, user tokens starting runs, refresh extension) need live tests. I did not research them.
