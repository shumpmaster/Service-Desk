# H5's extremes for AC42 and the MD sandbox's tests (NOT real records)

Written for the tests in the real records' forms (a card per J2, a gate card per model S-024's
words, an owner question per questions/_TEMPLATE.md, a gate case per docs/gates/_GATE.md):
- `gate-card.md`: a Build-gate card (`criteria`) with proceed, hold, recycle and kill;
- `gate-case.md`: its case, whose plain-English opening paragraph the response sheet quotes;
- `long-card.md`: a card with a very long title (H5's long titles);
- `long-question.md`: an owner question whose title holds a long unbroken word.
The tests put them, with the hold and merge cards of `../orchestrator-m2/`, into five connected
projects with twelve waits between them (tests/desk/md-sandbox.test.mjs).
