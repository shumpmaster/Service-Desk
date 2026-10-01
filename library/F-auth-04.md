id: F-auth-04
checked-on: 2026-10-01
opened-by: source-checker (Q-001 check; sources fetched directly, raw HTML for DO pricing and Fly pages)
form: fact
grade: A
topics: authentication, cloudflare
shelf-life: 12 months
claim: Cloudflare: "You should validate the token with your public key to ensure that the request came from Access and not a malicious third party." It recommends validating the Cf-Access-Jwt-Assertion header over the CF_Authorization cookie.
sources: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
