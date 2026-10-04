id: F-cf-workers-07
checked-on: 2026-10-04
opened-by: source-checker (Q-006 round 5; raw index.md copies fetched with curl, line numbers from those copies)
form: fact
supersedes: the "NOT filed" 7th-connection note in F-cf-workers-03 (F-cf-workers-03 itself is unedited)
shelf-life: 6 months
grade: B (same publisher, two Cloudflare pages; the changelog line is an image caption, not body text)
topics: cloudflare, hosting
claim: If a seventh connection is attempted while six are already waiting for response headers, it is queued until one of the existing connections receives its response headers (Limits:216). The changelog 2026-04-09 agrees: its "After" diagram caption (:29) reads "A 7th fetch starts as soon as any earlier connection receives its response headers", under the heading ":27 New connections can start as soon as response headers arrive". Neither page says what happens if a queued connection waits a long time (timeout or failure: not documented). Not filed: any claim that a 7th connection never fails.
sources: https://developers.cloudflare.com/workers/platform/limits/ (:216) ; https://developers.cloudflare.com/changelog/post/2026-04-09-relaxed-connection-limiting/ (:21, :27, :29, :31)
