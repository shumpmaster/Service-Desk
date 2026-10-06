# Experiment registration — EXP-004

*Pre-registered before any run (D-047). Frozen once the line below is set.*

spec: S-001 (J1, J3, J7, AC16–AC19)   milestone: M1, at its first preview deploy
runner:
- **The owner,** on the phone (Q1 to Q3) and by looking at the deployed preview (Q4). About 15
  minutes, counted against the pre-launch 2 hours a week.
- **The Builder** prepares the links, as data in the M1 pull request, and records the results. It
  holds no token and makes no live call.
- **The Chief of Staff** may cross-check Q1 with its own GitHub access.

result: docs/handover/experiments/EXP-004-result.md, with the values applied in
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
- **Q2 and Q3, the owner, on the phone's browser.**
  - The Builder supplies four links per repository in the M1 pull request's description. Each
    creates `docs/exp-004/link-test-<n>.md`, outside `decisions/`, so no Orchestrator takes it for
    an answer.
  - At commit, the owner chooses "Create a new branch" named `desk-link-test`, so nothing lands on
    `main`.
  - The four links:
    - (a) short content holding `&`, `#`, `%`, an emoji and two newlines;
    - (b) a total link length of 2,000 characters;
    - (c) 6,000 characters;
    - (d) 8,000 characters.
  - For each link the owner records: whether the file name was filled; whether the content was
    filled (the Builder compares it byte for byte on the branch, which needs no token); and any
    error page.
  - Then the owner deletes the branch.
- **Q1, during the same test.** On link (a)'s commit dialog, the owner records whether "Commit
  directly to the `main` branch" is offered or disabled. A disabled or missing option means a rule
  blocks it (library/F-gh-10.md:9, A).
  - The Chief of Staff may confirm with its own GitHub access:
    `GET /repos/{o}/{r}/rules/branches/main`, and `protected` from `GET /repos/{o}/{r}/branches/main`
    (C for both endpoints).
- **Q4, on the deployed preview.** The owner opens the preview's Universe screen and records each
  box's CI field. A result, such as `passing`, means the read token reads check runs. "Can't read
  checks" means the call was refused (S-001 J1).
- **If (a) doesn't prefill the content with `value`,** stop and record it. No other parameter name
  is guessed without a source.

## Measure
Per repository:
- Q1: open or blocked, with the rules found.
- Q2: filled, not filled, or altered (with a diff).
- Q3: the largest tested length that still prefilled.
- Q4: per repository, the CI field shown: a result, or "can't read checks".

## Sample
Two repositories; four links each for Q2 and Q3; one read each for Q1 and Q4.

## Exclusions
- **A link that fails because the phone lost its connection:** repeated once, not counted.

## Deciding threshold
- **Q1:** open → `webCommitsToDefault: true`. Blocked → `false`, and AC18's new-branch message
  applies.
- **Q2:**
  - Filled and byte-identical → `contentPrefill: true`, `contentParam: "value"`.
  - Not filled, or altered → `contentPrefill: false`, and AC17's copy route applies.
- **Q3:**
  - (c) works → `linkCap: 6000`.
  - Only (b) works → `linkCap: 2000`.
  - Neither works → `contentPrefill: false`.
- **Q4:**
  - A result shown → J1 reads check runs.
  - "Can't read checks" → CI shows "can't read checks" (J1), and the owner is asked whether to add the permission
    to the token.
- **No spec change:** whatever the outcome, S-001's AC17, AC18 and J1 already cover it. Only
  `src/config/projects.json` changes.

## Holdout use
none

frozen: the last commit that changes this file on build/definer/S-001-rev, before any run (revised
after the Reviewer's round 1, with no run yet)
