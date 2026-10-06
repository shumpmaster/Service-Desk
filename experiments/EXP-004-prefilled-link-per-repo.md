# Experiment registration — EXP-004

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (J1, J3, J7, AC15–AC17)   milestone: M1, at its first preview deploy
runner: Builder (Q1 and Q4, and preparing the links), then the owner on the phone (Q2 and Q3,
about 15 minutes)   result: docs/handover/experiments/EXP-004-result.md, with the values applied in
`src/config/projects.json`
rulings: P-001-build-path.md question 0 (run during Build)

## Hypothesis
For each connected repository (Service-Desk, Personal-Org-Operating-Model):
- **Q1, web commits:** the default branch `main` takes the owner's web commit of a new file. No push
  ruleset or branch protection blocks it.
  - Expected: yes for both. Service-Desk was observed open: the owner's web commit 50b73d7 of
    `decisions/P-001/stop-6.md` (C).
- **Q2, content prefill:** a link
  `https://github.com/<repo>/new/main?filename=<path>&value=<content>` prefills both the file name
  and the content, byte for byte, in the phone's browser.
  - Expected: yes, with `value`.
  - `filename` is described by GitHub (library/F-gh-05.md:8, B). No content parameter is
    documented; `value` is our assumption (C).
- **Q3, link length:** such a link still prefills the content at 6,000 characters.
  - No limit is documented for this page. Other GitHub pages return 414
    (library/F-gh-06.md:8, A).
- **Q4, read token:** the read token can read check runs, so
  `GET /repos/{o}/{r}/commits/main/check-runs` answers 200.
  - That a fine-grained token offers a checks permission is not in the library (C).

## Method
- **Q1, the Builder.** With the read token, the Builder runs
  `GET /repos/{o}/{r}/rules/branches/main` and `GET /repos/{o}/{r}/branches/main` (`protected`),
  for each repository. It records every rule that applies to `main`, and the `protected` value.
  - Both endpoints and their read access are not in the library (C).
  - If either refuses with the read token, the owner checks Settings → Branches and Settings →
    Rules → Rulesets by hand.
- **Q4, the Builder.** The Builder calls the check-runs endpoint with the read token, for each
  repository, and records the status code.
- **Q2 and Q3, the owner, on the phone's browser.**
  - The Builder supplies four links per repository, on the preview's test panel or in the M1 pull
    request. Each creates `docs/exp-004/link-test-<n>.md`, outside `decisions/`, so no Orchestrator
    takes it for an answer.
  - At commit, the owner chooses "Create a new branch" named `desk-link-test`, so nothing lands on
    `main`.
  - The four links:
    - (a) short content holding `&`, `#`, `%`, an emoji and two newlines;
    - (b) a total link length of 2,000 characters;
    - (c) 6,000 characters;
    - (d) 8,000 characters.
  - For each link the owner records: whether the file name was filled; whether the content was
    filled and byte-identical (the Builder compares it on the branch); and any error page.
  - Then the owner deletes the branch.
- **If (a) doesn't prefill the content with `value`,** stop and record it. No other parameter name
  is guessed without a source.

## Measure
Per repository:
- Q1: open or blocked, with the rules found.
- Q2: filled, not filled, or altered (with a diff).
- Q3: the largest tested length that still prefilled.
- Q4: the status code.

## Sample
Two repositories; four links each for Q2 and Q3; one read each for Q1 and Q4.

## Exclusions
- **A link that fails because the phone lost its connection:** repeated once, not counted.

## Deciding threshold
- **Q1:** open → `webCommitsToDefault: true`. Blocked → `false`, and AC17's new-branch message
  applies.
- **Q2:**
  - Filled and byte-identical → `contentPrefill: true`, `contentParam: "value"`.
  - Not filled, or altered → `contentPrefill: false`, and AC16's copy route applies.
- **Q3:**
  - (c) works → `linkCap: 6000`.
  - Only (b) works → `linkCap: 2000`.
  - Neither works → `contentPrefill: false`.
- **Q4:**
  - 200 → J1 reads check runs.
  - 403 → CI shows "can't read checks" (J1), and the owner is asked whether to add the permission
    to the token.
- **No spec change:** whatever the outcome, S-001's AC16, AC17 and J1 already cover it. Only
  `src/config/projects.json` changes.

## Holdout use
none

frozen: the commit that adds this file on build/definer/S-001-rev, before any run
