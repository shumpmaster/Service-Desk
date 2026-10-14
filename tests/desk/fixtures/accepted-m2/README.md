# The accepted M2 page's security headers and page (S-001 AC42)

`_headers` and `index.html` copied unchanged from `src/public/` at 33d390a (main when the MD
sandbox was built), with `git show 33d390a:src/public/<file>`. AC42 says the security headers and
the page's Content-Security-Policy stay "unchanged or stricter"; the AC42 test compares the
served files with these copies.

They are kept here, not read from git history, because desk-build checks out a single commit
(actions/checkout's default depth), so 33d390a is not there to read. A change that makes either
file stricter replaces the copy in the same pull request, and says why.
