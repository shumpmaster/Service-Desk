# Ruling needed: Reuse the desk's two tokens on needs-you, or make new ones?

Milestone: M3C
Asked in session: session_017seyaGqUxAff6E8dKWHDCR

WHY: needs-you needs the desk's read token and usage token as its own Pages secrets, and GitHub shows a token's value only once, when it is made or regenerated. The launch step's operating notes and the launch-day steps are written to the answer, so it is needed before LA1's build.
OPTIONS:
  A. Regenerate each and paste it into both — one read token and one usage token, as now. On launch day you regenerate each and paste the new value into needs-you and over the preview's (the usage token into Service-Desk's notify secret too); the preview reads nothing from then until its next deploy, minutes later in the sitting. One expiry each to renew, and adding a project edits one token. About 5 minutes more at launch.
  B. New tokens for needs-you — two more tokens with the same settings, pasted into needs-you only. Nothing on the preview changes, and either project's token can be revoked alone; but there are two read tokens and two usage tokens to renew, each on its own date, and adding a project edits both read tokens.
RECOMMENDATION: A — it keeps the upkeep as it is and adding a project as written; both projects run the same reviewed code behind the same sign-in, so two tokens would separate little.
RISK CLASS: R3   REVERSIBILITY: reversible (a token can be made or revoked later)   BLAST RADIUS: the desk's GitHub reads on the preview and on needs-you
DEFAULT: A   TIMEOUT: 168

## Context
- The launch plan and this question (source: specs/S-001.md, "Open: from the launch plan", build/definer/launch-plan b26e876)
- The secrets needs-you needs (source: specs/S-001.md, Setup C6)
- The read token's settings (source: specs/S-001.md, Setup G1)
- Adding a project edits one token (source: specs/S-001.md, AC26)
