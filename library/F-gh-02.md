id: F-gh-02
checked-on: 2026-10-01
opened-by: source-checker (Q-001 check; sources fetched directly)
form: fact
grade: A (installation token, vendor doc) / A (changelog by vendor, treated as B for currency)
topics: authentication
shelf-life: 12 months
claim: Installation access tokens expire after 1 hour and are created using a JWT signed by the app. Fine-grained PATs can have no expiry for personal projects; admins can enforce 1-366 days; the default policy for organizations and enterprises is 366 days.
sources: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app ; https://github.blog/changelog/2024-10-18-new-pat-rotation-policies-preview-and-optional-expiration-for-fine-grained-pats/
