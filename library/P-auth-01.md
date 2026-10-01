id: P-auth-01
checked-on: 2026-10-01
opened-by: source-checker (Q-001 check; sources fetched directly, raw HTML for DO pricing and Fly pages)
form: pattern
grade: C (opinion; synthesis of filed facts)
topics: authentication, cloudflare
shelf-life: 12 months
pattern: Single-user Cloudflare app: Access policy Include > Emails = the one address (never Login Methods alone); cover workers.dev and preview URLs; validate the Access JWT in the Worker; hold the GitHub credential server-side (App with 1-hour installation tokens preferred over a long-lived PAT).
rests on: F-auth-02, F-auth-03, F-auth-04, F-gh-02
