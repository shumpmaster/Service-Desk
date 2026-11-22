# The baseline record (specs/S-014.md line 23, J7)

sha256: da8ca961ff659e36a8ff6c96c32a88288ead796d911b68d366c8a0f3b6f62bfd

- **Made by** the Chief of Staff's session (session_01QBwHGJWF4ev8Y9sdGjavWE), committed as `orchestrator` under L-0051, on 2026-11-22.
- **Base commit:** fca41700eb6dbedb6a4f00ab74c28112b16fb83f, its tree unpacked by `git archive` into a scratch folder outside the repository.
- **Added to it, as committed:** tests/desk/baseline/adapter.mjs from builder commit 26001c271b80ef210d05791d3cdfad09d45665fe, and tests/acceptance/S-009/cases/baseline/ from main at d84c607 (the cases locked in #461).
- **Run:** `node tests/desk/baseline/adapter.mjs <case> <out>` once on each of the 12 case files, from the scratch tree's root, on Node v22.23.5. Every run exited 0.
- **Wrapped:** each output file's text, unchanged, into `results`, in case-file order. `hashes` covers the adapter, the four helpers it imports from tests/desk/, tests/desk/fixtures/config/projects.json (read by helpers.mjs at load, outside the import graph: reviews/S-014/_reviewer-adapter.md, N7), and every case file.
- **Read first:** the Reviewer's PASS, reviews/S-014/_reviewer-adapter.md.
