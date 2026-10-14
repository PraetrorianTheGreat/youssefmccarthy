# Workspace Rules

- Never push code to GitHub automatically. Always ask for explicit user approval before running `git push`.
- Google Tag Manager (gtm.js) loads only on praetrorianthegreat.github.io. To load it on localhost or a preview for testing, append `?gtm=1` to the URL. The check is the inline `ymGtmAllowed(hostname, search)` function in each page's GTM snippet (documented in the header of `tracking.js`); keep it identical on every page.
