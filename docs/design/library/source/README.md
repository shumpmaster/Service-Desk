# Desk Element Library: source

The files one folder up are what is published to the Design System artifact
https://claude.ai/artifact/UqdAH5E4nwtSJdxcATBp3W (private to the owner).

- `tokens.py` writes `../tokens.json`; `comps.py` writes `../components/<Element>/` (preview.html and README.md). It inlines Phosphor icons (MIT): `npm pack @phosphor-icons/core@2.1.1`, unpack, and pass its `package/assets` folder as the second argument.
- `bundle.css` here is copied to `../components/bundle.css`; `../components/Cover/preview.html` is written by hand.
- `shot3x.js` renders one card at the references' 3x scale for side-by-side checks: `node shot3x.js <library dir> DeskHome out.png`.
- `check.js` renders every card in light and dark with Playwright: `node check.js <library dir> <out dir>`.

To change the library: edit here, regenerate, run the check, publish all of `../` to the artifact, commit.
Sources: the owner's Craft references (docs/design/references/, 11 to 17) and docs/design/audit-2026-11-14-craft-v7.md, Part 2.
