# Desk Element Library: source

The files one folder up are what is published to the Design System artifact
https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W (private to the owner).

- `tokens.py` writes `../tokens.json`; `comps.py` writes `../components/<Element>/` (preview.html and README.md).
- `../components/bundle.css` and `../components/Cover/preview.html` are written by hand.
- `check.js` renders every card in light and dark with Playwright: `node check.js <library dir> <out dir>`.

To change the library: edit here, regenerate, run the check, publish all of `../` to the artifact, commit.
Sources: the owner's Craft references (docs/design/references/, 11 to 17) and docs/design/audit-2026-11-14-craft-v7.md, Part 2.
