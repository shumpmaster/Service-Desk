Verdict: FAIL

Two of the three entries in this round pass and are filed. The third, `F-agent-false-success-01`, stays out, so the item as a whole fails. I made no commits because there is no git repository in this folder. The five entries filed in earlier rounds were not re-checked.

## Filed
- **`library/facts/F-provenance-self-generated-01.md`**
  - **`slsa.dev/spec/v1.0/levels`:** L1 "trivial to bypass or forge". L2 requires an "explicit 'attack'". L3 keeps signing material "accessible to the user-defined build steps" out of reach.
  - **GitHub blog (Heidinger, 19 Dec 2024):**
    - L1 is "Provenance exists for traceability, but minimal tamper resistance".
    - L2 is "Provenance signed by a managed build platform, deterring simple tampering".
    - L3 says "user-defined build steps should not have access to sensitive signing material".
  - **Socket.dev glossary (page dated 2026-10-30):**
    - L1 provenance "can be unsigned or self-generated".
    - L3 is "the first level at which code running inside your build cannot forge your provenance".
  - **Limit:** the two secondary pages restate the spec and add no new evidence. They are different publishers, which satisfies independence as the memo frames it. The entry says so in its note.
  - **Fetch method:** all three pages were opened through summarising fetches that returned verbatim quotes.
- **`library/facts/F-algorithm-aversion-01.md`**
  - **Dietvorst et al. 2015:** I read the PDF text directly. The abstract says people "more quickly lose confidence in algorithmic than human forecasters after seeing them make the same mistake". It says "In 5 studies", and "This was true even among those who saw the algorithm outperform the human."
  - **Crossref:** confirms the citation, *J. Experimental Psychology: General* 144(1), 114–126.
  - **Prahl & Van Swol 2017:** the IDEAS/RePEc page gives the full abstract. It includes "We do not replicate the finding that human advice is generally utilized more than automated advice." It also says "after receiving bad advice, utilization of automated advice decreased significantly more than advice from humans." This answers the memo's open point, because the IDEAS page does carry the sentence.
  - **Limit:** the Wiley publisher page returned 403, so IDEAS (a bibliographic index) is the only place I confirmed the abstract.

## Not filed
- **`F-agent-false-success-01`**
  - **Figures confirmed:** the arXiv abstract matches the memo. It lists 9,876 tau2-bench and 1,879 AppWorld trajectories, 45–48%, 3%, 75.8%, AUROC 0.65 and 0.54, and TF-IDF AUROC 0.83 and 0.95. Author and date also match (Laksh Advani, 1 Jun 2026, FAGEN@ICML2026).
  - **ICML page:** it carries the 9,876 count, 45–48%, 3% and the TF-IDF 0.83. It has no AppWorld figures. It is the same author, so it adds no independence.
  - **Why it stays out:** it is one author's preprint with no independent source. The memo itself says to file it only under an owner waiver, and none is on record.

## Open questions
- Does the owner waive the two-source rule for Advani at grade C, or should the entry wait for a replication?
- Is Socket.dev, which restates the spec, enough as the "independent" secondary source for SLSA? I filed on the memo's framing. A stricter reading would leave that entry with only the GitHub blog.
- Can someone with publisher access confirm the Prahl & Van Swol abstract at doi 10.1002/for.2464?

Files are in `library/facts/`. I also added a short round-4 note to `research/Q-025-source-check.md`.