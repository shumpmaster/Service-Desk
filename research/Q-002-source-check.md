Verdict: FAIL

I opened the four pages behind the three new entries (R13, R13a, R6, R6b) and filed L-F9 and L-F11. I rejected L-F12 because it says it lists all the repository scopes, and R6b lists more. I did not re-open the sources of the earlier filed entries this round. The quotes came through a summarising fetch tool, so they are not guaranteed verbatim. Nothing was committed, because the folder is not a git repository.

**Filed**
- **L-F9** is in `library/facts/L-F9.md`, grade B. R13 and R13a both carry the "Additional permissions" sentence word for word.
  - `PUT contents/{path}` is listed under Contents and Workflows, with the mark.
  - `POST git/commits` is under Contents only.
  - `POST issues/{n}/comments` is under Issues and Pull requests, with the mark.
  - `POST pulls/{n}/reviews` is under Pull requests only.
  - The two pages are the same publisher and nearly identical generated tables, so I did not count them as independent. The entry says the pages do not explain which case applies to each endpoint.
- **L-F11** is in `library/facts/L-F11.md`, grade B, from R6 alone.
  - R6 says: "Once you use a refresh token, that refresh token and the old user access token will no longer work."
  - It gives `expires_in` as always 28800 (8 hours) and `refresh_token_expires_in` as always 15897600 (6 months).
  - The memo's inference that the 6 months runs from the latest refresh (§2) is an estimate. I did not file it.

**Not confirmed: L-F12 (memo lines 47–55 and 150–153)**
- The memo says "These are all the repository scopes R6b lists" and gives six scopes.
- R6b also lists `security_events` (read and write to code scanning security events), `admin:repo_hook`, `write:repo_hook` and `read:repo_hook`.
- The claim is therefore false as written. The claim that no scope narrower than `repo` can write code, issues or reviews in private repositories is an absence claim. R6b does not state it; I only found no such scope in the fetched text.
- The following parts do match R6b: the descriptions of `repo`, `public_repo`, `repo:status`, `repo_deployment`, `repo:invite` and `workflow`, and "Scopes limit access for OAuth tokens. They do not grant any additional permission beyond that which the user already has."
- To resubmit, the memo should drop "all" or list the four missing scopes. It should also mark the absence claim as C, or cite the scope table for it.

**Other findings**
- The memo is complete as revision 4. The first line says it replaces earlier versions, so the older filed entries are not resubmitted.
- The memo file includes a six-part contract (lines 187–236) that the brief says I must not see. It looks like the Orchestrator did not cut it at the markers. I used nothing from it as evidence.
- `research/Q-002-source-check.md` is a prior-round result. I treated it as data, not as a finding for this round.

**Open questions**
1. Should the Orchestrator re-record the memo with the contract removed?
2. Will the Researcher resubmit L-F12 with corrected wording?
3. Which permission case each checkmarked endpoint in L-F9 falls under still needs a live test or a full render of the endpoint pages (memo open question 4).
4. Does D-032 define the grade scale? I used the memo's provisional one.
