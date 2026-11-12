Verdict: FAIL

Five of the eight proposed entries pass and are filed. Three stay out, so the item as a whole fails. I made no commits because there is no git repository in this folder. Page fetches were mostly summarising, except where I note full text below.

## Filed (confirmed)
- **`library/facts/F-asof-age-label-01.md`**
  - I read the NTSB SA-017 PDF as text in full. It says:
    - The age indicator shows "the age of the mosaic image created by the service provider".
    - Conditions are "ALWAYS" older than the indicator shows, by up to "15 to 20 minutes" in extreme cases.
    - In the 19 Dec 2011 Bryan TX accident, the last three updates should each have read 1 minute old. The weather was about 6, 7 and almost 8 minutes old.
  - AOPA independently gives the same points and the same figures.
  - The 2010 case and the guidance statement are left out of the claim.
- **`library/facts/F-git-dates-settable-01.md`**
  - The git-commit and git-commit-tree pages and Pro Git agree on this.
  - `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` set the author and committer timestamps, and they accept arbitrary dates in several formats.
  - The closing clause, "set by whoever runs the commit", is my reading of the three pages together, and the entry says so.
  - This filing rests on the vendor-behaviour rule in `governance/standards/sources.md`. It treats the git project's pages as one publisher's documentation of its own product. Please confirm that reading.
- **`library/facts/F-gh-commit-verification-01.md`**
  - The two GitHub pages agree on the Verified, Unverified, no-status and Partially verified states.
  - They also agree on vigilant mode making unsigned commits Unverified.
  - Same-publisher behaviour claim.
- **`library/facts/F-log-gap-reporting-01.md`**
  - Three AWS pages agree. I read the user-guide and CLI-reference pages as full text.
  - `validate-logs` detects modification or deletion of log and digest files, and it validates backfill digests.
  - It cannot validate periods with no digests, which covers validation disabled, logging stopped and trail deleted.
- **`library/patterns/P-feed-deadman-01.md`**
  - The Watchdog rule is `expr: vector(1)` and "always firing" in the raw manifest. PromLabs independently says to expect a notification "every x minutes (plus some slack time)".
  - The Healthchecks states are on the docs index. The API `status` values are `new`, `up`, `grace`, `down`, `paused`. Period and Grace Time are defined on the configuring_checks page.
  - Grafana (No Data and Error) and Prometheus (stale series, 5-minute lookback) are confirmed, one page each. I accepted the general claim because three unrelated tools agree. Their individual parts are weaker, and the entry notes this.
  - Blackout, two sources:
    - The Register quotes: "Unaware of the loss of alarms and a limited EMS, they made no alternate arrangements to monitor the system."
    - Computerworld says the alarm software was malfunctioning "by 2:40 p.m. EDT… although FirstEnergy engineers weren't aware".
    - The entry claims no failure time. I did not read the final report.
  - Three Mile Island, three sources:
    - The NRC says the instruments "indicated… that the valve was closed".
    - The Kemeny passage on pddoc.com, an unofficial transcription, says the light "showed only that the signal had been sent to close the PORV". Control Global says the light was "not operated by a limit switch on the valve, but only by the… signal".
    - This is the claim rejected last round, and it now has a second source.

## Not filed
- **`F-provenance-self-generated-01`**
  - Wording confirmed in the raw HTML. SLSA levels: L1 "trivial to bypass or forge", L2 "explicit 'attack'", L3 "inaccessible to the user-defined build steps". SLSA requirements: "MUST NOT be accessible to the environment running the user-defined build steps" and "Every field… MUST be generated or verified by the build platform in a trusted control plane". W3C PROV: the definition sentence is in the abstracts of both PROV-Overview and PROV-DM.
  - The two SLSA pages are one specification, and so are the two PROV pages. The L1 and L2 wording is on the levels page only.
  - A specification is not a vendor's product behaviour, which is all `governance/standards/sources.md` covers. Widening the rule needs the owner's ruling.
- **`F-algorithm-aversion-01`**
  - The authors' PDF opens with the matching title. Crossref confirms the citation: JEP: General 144(1), 114–126, 2015.
  - The finding rests on the paper alone, and the memo asks for a waiver that has not been given.
  - I did not re-read the abstract text this round. My extraction returned nothing for it, so the finding wording is carried from the earlier round's raw read.
- **`F-agent-false-success-01`**
  - The arXiv abstract matches the figures, and the ICML page matches author and venue.
  - It is one author's preprint with no independent replication, and the memo itself says to file it only under a waiver.
  - The ICML page says "nearly 10,000" trajectories and arXiv says "nearly 12,000". Both are summaries, so I could not tell which is right, but it should be settled before anyone relies on the paper.
  - The memo says the ICML page does not confirm the figures. Its excerpt does include 45–48% and 3%. That is the same author, so it adds no independence.

## Open questions
- Does the owner extend the vendor-behaviour rule in `governance/standards/sources.md` to specifications (SLSA, W3C PROV) and to the git project's pages? Without that, `F-provenance-self-generated-01` stays out.
- Does the owner waive the two-source rule for Dietvorst et al. 2015 (read raw, peer-reviewed) and for the Advani preprint at grade C, or should both wait for a second source?
- Can someone with PDF text access read the NERC/DoE blackout final report (chapter 5) and settle the alarm-failure time? The filed pattern does not depend on it.
- The pddoc.com copy of the Kemeny report is unofficial. An official copy would firm up the Three Mile Island part.