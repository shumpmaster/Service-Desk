Verdict: FAIL

I opened all 17 cited sources on 2026-10-01 through WebFetch. Two claims are wrong or overreach. Several others rest on one source or on the absence of a statement, so I did not file them. Line numbers refer to `research/Q-002-memo.md`.

**Entries filed** (in `library/facts/`, opened by source-checker)
- **L-F1 (line 126):** confirmed.
  - Source 1 says "The installation access token will expire after 1 hour."
  - Source 2 says the token "identifies the app as a GitHub App bot account, such as @jenkins[bot]."
- **L-F2 (line 127):** confirmed.
  - Sources 7 and 3 both give 8 hours and 6 months.
  - Source 6 gives the avatar-plus-badge text. That part rests on one source.

**Not confirmed, so not filed**
- **L-F5 / F20 (lines 87–89, 130):** contradicted by source 14.
  - The sentence "GitHub automatically removes personal access tokens that haven't been used in a year" sits in the "Personal access tokens (classic)" subsection.
  - The memo applies it to fine-grained tokens. This is the error that fails the memo.
  - The rest of L-F5 is confirmed: 1–366 days or none from source 14, and the personal-versus-organization split from source 15.
  - The memo's OQ3 (line 27) says the rule is "documented for personal access tokens", which is also wrong for fine-grained tokens.
- **L-F4 / F16 (lines 70–73, 129):** the "all-or-nothing" and "cannot be limited to particular repositories" claims are not stated in source 11.
  - Source 11 gives the `repo` and `workflow` text only. The claim rests on the page being silent, which is an inference.
  - The expiring-token part is confirmed by source 13 (8 hours, 6 months, `offline_access`, "enabled by default for all new applications").
  - Source 2 says OAuth apps could already be configured for expiring tokens. F17's "Since 2026-08-14" framing may therefore be overstated.
- **L-F6 / F4 (lines 49, 131):** only source 3 supports it, and it fails the two-source rule.
  - Source 3 says the key "grants access to every account that the app is installed on" and advises a key vault and sign-only.
  - "For as long as the key is valid" is not in the source.
- **L-F7 / F12 (lines 60, 132):** confirmed by source 10 alone, a 2021 changelog post. It needs a second source.
- **L-F8 / F25 (lines 99, 133):** only source 16 supports it.
  - It confirms `GITHUB_TOKEN` events don't create runs, with the exceptions `workflow_dispatch`, `repository_dispatch` and some `pull_request` events.
  - For installation tokens and personal access tokens it only recommends them "instead" when approval would otherwise block runs. It never says outright that they trigger workflows.
  - The claim is an inference.
- **L-F3 / F10, F11 (lines 58–59, 128):** both are literally true as documented, from sources 8 and 9.
  - Source 8's issue-comment schema has `performed_via_github_app` as null or a GitHub app.
  - Source 9's review example response lacks it.
  - The review half is a claim about absence, so I held it back. It needs a second source or a live test.

**Other findings**
- **F14, F18 (lines 62–64, 78):** source 5 does not mention `performed_via_github_app`. It only defines `github.actor`.
  - These claims are labelled estimates, but the use of `github.event.comment.performed_via_github_app` has no cited source.
- **F9 (line 57):** source 6, which F7 and F8 cite, does not state token expiry. F9 itself cites sources 7 and 3, so that is fine.
- **F1 (line 46):** source 1 says "attributed to the app" but has no `[bot]` naming. Source 2 supplies it.
- **F3 (line 48):** the 500-repository limit is in source 1 and not in source 2.
- **Confirmed as stated:**
  - F5 and F24 (source 4).
  - F13 (source 3).
  - F15 (source 2).
  - F19 and F21 (source 14).
  - F23 (source 12).
  - F26 (source 17, which covers organization audit logs).
  - F8, which cites source 6.
- **Reliability caveat:** WebFetch summarises pages with a small model, so the quotes are secondhand. I re-fetched the two disputed points (the one-year removal and the `GITHUB_TOKEN` wording) and they held.

**Open questions**
- Should the researcher correct F20 and OQ3 and add second sources for L-F4, L-F6, L-F7 and L-F8? The memo can then be re-checked.
- Which grade scale maps to D-032? The memo's A to C grades are its own, and I carried them into the entries unchanged.
- The `library/` directory did not exist, so I created `library/facts/`. Nothing is committed: there is no usable git repository here, and the brief didn't ask for a commit.
