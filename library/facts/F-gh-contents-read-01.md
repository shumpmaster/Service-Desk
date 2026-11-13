---
id: F-gh-contents-read-01
form: fact
claim: "Contents API: files up to 1 MB support all features; 1-100 MB only raw or object media types; above 100 MB not supported; at most 1,000 files per directory (use the Git Trees API beyond); 'ref' is the name of the commit/branch/tag; create/update and delete used in parallel conflict, so use them serially. Trees API: with recursive, the tree array is limited to 100,000 entries and 7 MB. Refs API: Get a reference takes heads/<branch> or tags/<tag>; listing matching refs with no ref returns all references including notes and stashes; Create a reference needs a name starting 'refs' with at least two slashes. Fine-grained token permissions page: GET /commits, /compare/{basehead}, /tarball/{ref}, /zipball/{ref}, /git/trees/{tree_sha}, /git/blobs/{file_sha}, /git/ref/{ref}, /git/matching-refs/{ref} and /contents/{path} are listed under Contents (read); no entry for commits/{ref}/check-runs appears on that page."
grade: B
publisher_note: same publisher (GitHub docs); one page per part
topics: [github, records]
checked_on: 2026-11-13
shelf_life: 12 months
opened_by: source-checker (Q-028, 2026-11-13), raw page HTML fetched with curl and searched for the quoted strings
memo: research/Q-028-memo.md
sources:
  - https://docs.github.com/en/rest/repos/contents
  - https://docs.github.com/en/rest/git/trees
  - https://docs.github.com/en/rest/git/refs
  - https://docs.github.com/en/rest/authentication/permissions-required-for-fine-grained-personal-access-tokens
note: "Each part rests on one page. The permission placement was checked in the raw HTML of the permissions page this round (it settles the earlier Contents-versus-Metadata doubt). That a given endpoint is absent from the page is not a statement that the token cannot call it; see F-gh-fgpat-limits-01."
---
